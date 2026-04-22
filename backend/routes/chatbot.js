const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const jwt = require('jsonwebtoken');
const { validateDoctorAvailability } = require('../utils/appointmentUtils');

// @route   POST /api/chatbot
// @desc    Process chatbot message using OpenRouter AI
// @access  Public
router.post('/', async (req, res) => {
    const { message } = req.body;
    if (!message || message.trim() === '') {
        return res.status(400).json({ msg: 'Message is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    // Identify User if token is present
    let patient = null;
    let authDebug = "No token provided";

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            patient = await User.findById(decoded.id).select('-password');
            if (patient) {
                authDebug = `Identified as ${patient.name}`;
            } else {
                authDebug = "Token valid, but user not found in DB";
            }
        } catch (err) {
            authDebug = `JWT Error: ${err.message}`;
            console.error('Token verification failed:', err.message);
        }
    }

    if (!apiKey || apiKey === 'your_openrouter_key_here') {
        return res.json({ response: "🤖 AI is currently in limited mode. Please configure OpenRouter API Key." });
    }

    try {
        const doctors = await User.find({ role: 'doctor' }).select('name specialization qualification consultationFee');
        const doctorsList = doctors.length > 0
            ? doctors.map(d => `- ${d.name} (${d.specialization}): ${d.qualification}. Fee: ${d.consultationFee || 'TBD'}`).join('\n')
            : "No doctors currently listed.";

        const systemMessage = `
You are HealthBlock AppointAI, an advanced medical assistant.
USER STATUS: ${patient ? `LOGGED IN as "${patient.name}" (ID: ${patient._id})` : "NOT LOGGED IN (GUEST)"}.

Booking rules:
1. If the user wants to book an appointment, always collect these four values first:
   - doctorName
   - date (YYYY-MM-DD)
   - time (e.g. 10:30 AM)
   - symptoms
2. Ask questions one at a time and do not attempt to book until all 4 values are present.
3. Always begin by asking for the doctor's name if it is missing.
4. If the user is not logged in, tell them they must log in before booking can be completed.
5. When you have all required data and the user is ready, respond with the hidden booking payload only once:
   ||BOOK_DATA||{"doctorName":"...","date":"...","time":"...","symptoms":"..."}||
6. The visible response back to the user should be friendly and confirm the next step.

Available Doctors:
${doctorsList}

Guidelines:
- Be professional, polite, and caring.
- For emergencies, tell them to call emergency services.
`;

        let aiResponse = "";
        const fetchAI = async (msgs) => {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:5173",
                        "X-Title": "HealthBlock AppointAI",
                    },
                    body: JSON.stringify({
                        model: "openrouter/free",
                        messages: msgs,
                    })
                });
                const data = await response.json();
                if (data.error) {
                    console.error('OpenRouter Error:', data.error);
                    return `AI Error: ${data.error.message || 'Unknown error'}`;
                }
                return data.choices?.[0]?.message?.content || "Error: No response from AI model.";
            } catch (err) {
                console.error('Fetch AI Failed:', err);
                return "Failed to connect to AI service.";
            }
        };

        const history = req.body.history || [];

        // Prepare messages for AI, including history if provided
        const msgs = [
            { role: "system", content: systemMessage },
            ...history.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            })),
            { role: "user", content: message }
        ];

        aiResponse = await fetchAI(msgs);

        // Check if AI triggered a booking request
        if (aiResponse.includes('||BOOK_DATA||')) {
            if (!patient) {
                aiResponse = "I'm sorry, I can't book that for you yet because you aren't logged in. Please log in to your account first! 🔑";
            } else {
                try {
                    const dataStr = aiResponse.split('||BOOK_DATA||')[1].split('||')[0];
                    const bookData = JSON.parse(dataStr);

                    if (!bookData.doctorName || !bookData.date || !bookData.time || !bookData.symptoms) {
                        console.warn('Incomplete booking data received:', bookData);
                        throw new Error('Incomplete booking data');
                    }

                    // Find doctor ID
                    const doctor = await User.findOne({
                        role: 'doctor',
                        name: { $regex: bookData.doctorName, $options: 'i' }
                    });

                    if (doctor) {
                        const validationError = await validateDoctorAvailability(doctor, bookData.date, bookData.time, Appointment);

                        if (validationError) {
                            // Tell AI that the validation failed so it can explain to user
                            aiResponse = await fetchAI([
                                ...msgs,
                                { role: "assistant", content: aiResponse },
                                { role: "system", content: `ERROR: ${validationError.msg}. Please explain this politely to the user and ask them to choose another time or day.` }
                            ]);
                        } else {
                            const newAppointment = await Appointment.create({
                                patient: patient._id,
                                doctor: doctor._id,
                                date: bookData.date,
                                time: bookData.time,
                                symptoms: bookData.symptoms,
                                patientContact: patient.phone || 'AI Booking',
                                status: 'pending'
                            });

                            // Re-prompt AI to give a final success message
                            aiResponse = await fetchAI([
                                ...msgs,
                                { role: "assistant", content: aiResponse },
                                { role: "system", content: `SUCCESS: Appointment booked successfully! ID: ${newAppointment._id}. Tell the user it is confirmed and they can see it in their dashboard.` }
                            ]);
                        }
                    } else {
                        aiResponse += "\n\n(Wait, I couldn't find that doctor in our system. Let me check again...)";
                    }
                } catch (err) {
                    console.error('Booking Parse Error:', err);
                }
            }
        }

        // Remove the internal tags before sending to user
        const cleanResponse = aiResponse.replace(/\|\|BOOK_DATA\|\|.*?\|\|/g, '').trim();
        res.json({
            response: cleanResponse,
            debug: authDebug // Temporary for testing
        });

    } catch (err) {
        console.error('Chatbot Error:', err);
        res.status(500).json({ response: "I'm having a momentary system glitch. Please try again later." });
    }
});

module.exports = router;
