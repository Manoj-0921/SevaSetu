import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Menu, X, User } from 'lucide-react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

const DynamicDashboard = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Login />;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
};

// Layout Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar glass-card">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Activity color="var(--color-primary)" size={28} />
          <span>HealthBlock <span className="text-gradient">AppointAI</span></span>
        </Link>
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </div>
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={() => setIsOpen(false)}>Home</Link>
          </li>
          {(!user || user.role === 'patient') && (
            <li className="nav-item">
              <Link to="/doctors" className="nav-links" onClick={() => setIsOpen(false)}>Find Doctors</Link>
            </li>
          )}
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }} onClick={() => setIsOpen(false)}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-primary)' }} />
                  ) : (
                    <User size={18} />
                  )}
                  {user.name}
                </Link>
              </li>
              <li className="nav-item">
                <button onClick={() => { logout(); setIsOpen(false); }} className="btn btn-outline nav-btn">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="btn btn-outline nav-btn" onClick={() => setIsOpen(false)}>Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="btn btn-primary nav-btn" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

// Home Page Component
const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="page-container home-hero">
      <div className="hero-content">
        <h1 className="hero-title">Accessible Healthcare,<br />Anytime, <span className="text-gradient">Anywhere</span></h1>
        <p className="hero-subtitle">Your Trusted Partner in Health Management with AI-powered Assistance.</p>
        <div className="hero-actions">
          {(!user || user.role === 'patient') ? (
            <>
              <Link to="/doctors" className="btn btn-primary btn-lg">Book Appointment</Link>
              {!user && <Link to="/register" className="btn btn-outline btn-lg">Join Now</Link>}
            </>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-lg">Go to My Dashboard</Link>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/book/:id" element={<BookAppointment />} />
            <Route path="/dashboard" element={<DynamicDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <ChatbotWidget />
      </Router>
    </AuthProvider>
  );
};

export default App;
