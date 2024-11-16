import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Calorie from './components/Calorie';
import About from './components/About';
import GoalSetting from './components/GoalSetting';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/calorie" element={<Calorie />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/goal-setting" element={<GoalSetting />} />
      </Routes>
    </Router>
  );
}

export default App;
