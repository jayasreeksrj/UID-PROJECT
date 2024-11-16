import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Prevent admin email from signing up
    if (email === 'jayasreeks.22it@kongu.edu') {
      setMessage('This email is reserved for the admin account.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/signup', { username, email, password });
      setMessage('Signup successful! Redirecting to login page...');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (error) {
      setMessage('Error: ' + error.response.data.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p className="signup-message">{message}</p>
      <p className="redirect-login">
        Already a user? <a href="/login">Log in here</a>
      </p>
    </div>
  );
};

export default Signup;
