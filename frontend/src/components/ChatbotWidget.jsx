import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import api from '../api';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! I am AppointAI 🤖. How can I assist you with your booking today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await api.post('/chatbot', {
                message: userMessage.text,
                history: messages
            });
            setMessages((prev) => [...prev, { sender: 'bot', text: res.data.response }]);
        } catch (err) {
            setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server. Try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div
                style={{
                    position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000,
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                    width: '60px', height: '60px', borderRadius: '50%',
                    display: isOpen ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center',
                    cursor: 'pointer', boxShadow: 'var(--shadow-lg)', transition: 'transform 0.3s ease'
                }}
                onClick={() => setIsOpen(true)}
            >
                <MessageSquare color="white" size={28} />
            </div>

            {isOpen && (
                <div className="glass-card" style={{
                    position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000,
                    width: '350px', height: '500px', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                        padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                            <MessageSquare size={20} /> AppointAI Assistant
                        </div>
                        <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                    </div>

                    <div style={{
                        flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
                        background: 'var(--color-background)'
                    }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: msg.sender === 'user' ? 'white' : 'var(--color-text)',
                                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                maxWidth: '85%', fontSize: '0.9rem', lineHeight: '1.4',
                                borderBottomRightRadius: msg.sender === 'user' ? '0' : 'var(--radius-md)',
                                borderBottomLeftRadius: msg.sender === 'bot' ? '0' : 'var(--radius-md)',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={{
                        display: 'flex', padding: '1rem', background: 'var(--color-surface)', gap: '0.5rem',
                        borderTop: '1px solid var(--color-border)'
                    }}>
                        <input
                            type="text"
                            className="input-base"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ flex: 1, padding: '0.5rem 1rem' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} disabled={isLoading}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;
