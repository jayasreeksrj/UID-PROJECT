import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './UserDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const UserDashboard = () => {
  const [username, setUsername] = useState('');
  const [userEmail] = useState(localStorage.getItem('userEmail'));
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: localStorage.getItem('username') || '',
    mobile: '',
    gender: 'select',
    profileImage: null
  });
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [caloriesData, setCaloriesData] = useState({
    labels: ['Breakfast', 'Lunch', 'Snack', 'Dinner'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }]
  });
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', profileData.username);
    formData.append('mobile', profileData.mobile);
    formData.append('gender', profileData.gender);

    if (profileData.profileImage) {
      formData.append('profileImage', profileData.profileImage);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setProfileImageUrl(response.data.profileImage);
        setProfileData(response.data);
        setUsername(response.data.username);
        localStorage.setItem('profileData', JSON.stringify(response.data));
        alert('Profile saved successfully!');
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error('Save error details:', err.response || err);
      alert('Profile save failed. Please check all fields and try again.');
    }
  };

  const handleEditProfile = () => {
    setShowProfileModal(true);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User is not logged in.');
          return;
        }

        const userResponse = await axios.get('http://localhost:5000/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userResponse.data) {
          setUsername(userResponse.data.username);
          localStorage.setItem('username', userResponse.data.username);
        }

        const mealsResponse = await axios.get('http://localhost:5000/api/meals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (mealsResponse.data && mealsResponse.data.length > 0) {
          const mealsData = mealsResponse.data;
          setMeals(mealsData);

          const calories = { breakfast: 0, lunch: 0, snack: 0, dinner: 0 };
          mealsData.forEach(meal => {
            if (meal.breakfast) meal.breakfast.forEach(food => calories.breakfast += Number(food.calories));
            if (meal.lunch) meal.lunch.forEach(food => calories.lunch += Number(food.calories));
            if (meal.snack) meal.snack.forEach(food => calories.snack += Number(food.calories));
            if (meal.dinner) meal.dinner.forEach(food => calories.dinner += Number(food.calories));
          });

          setCaloriesData({
            labels: ['Breakfast', 'Lunch', 'Snack', 'Dinner'],
            datasets: [{
              data: [calories.breakfast, calories.lunch, calories.snack, calories.dinner],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
          });
        }

        const profileResponse = await axios.get('http://localhost:5000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileResponse.data) {
          setProfileData(profileResponse.data);
          setProfileImageUrl(profileResponse.data.profileImage);
        }

      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Error fetching data:', err);
          setError('Error fetching data');
        }
      }
    };

    fetchAllData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="main-content">
      <div className="sidebar">
        <div className="profile-section">
          <h2>Welcome, {username || 'User'}!</h2>
          {profileImageUrl ? (
            <img 
              src={`http://localhost:5000${profileImageUrl}`} 
              alt="Profile" 
              className="profile-image" 
            />
          ) : (
            <button onClick={() => setShowProfileModal(true)} className="set-profile-btn">
              Set Profile
            </button>
          )}
          <button onClick={handleEditProfile} className="edit-profile-btn">
            Edit Profile
          </button>
        </div>
        
        <h2>Track your calories</h2>
        <a href='/calorie'>Calorie Tracker</a>
        <h2>Fit your goals here!!</h2>
        <a href='/goal-setting'>Goal Setting</a>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="dashboard-container">
        {error && <p className="error">{error}</p>}
        {!error && (
          <>
            <h3>Calories Breakdown</h3>
            <div className="chart-container">
              <Pie data={caloriesData} />
            </div>

            <h3>Foods Consumed</h3>
            <div className="table-container">
              <table className="food-table">
                <thead>
                  <tr>
                    <th>Meal Type</th>
                    <th>Food Item</th>
                    <th>Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((meal, index) => (
                    <React.Fragment key={`meal-${index}`}>
                      {meal.breakfast?.map((food, idx) => (
                        <tr key={`breakfast-${index}-${idx}`}>
                          <td>Breakfast</td>
                          <td>{food.name}</td>
                          <td>{food.calories}</td>
                        </tr>
                      ))}
                      {meal.lunch?.map((food, idx) => (
                        <tr key={`lunch-${index}-${idx}`}>
                          <td>Lunch</td>
                          <td>{food.name}</td>
                          <td>{food.calories}</td>
                        </tr>
                      ))}
                      {meal.snack?.map((food, idx) => (
                        <tr key={`snack-${index}-${idx}`}>
                          <td>Snack</td>
                          <td>{food.name}</td>
                          <td>{food.calories}</td>
                        </tr>
                      ))}
                      {meal.dinner?.map((food, idx) => (
                        <tr key={`dinner-${index}-${idx}`}>
                          <td>Dinner</td>
                          <td>{food.name}</td>
                          <td>{food.calories}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showProfileModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Update Profile</h2>
            <form onSubmit={handleProfileSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={profileData.username}
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
              />
              <input
                type="text"
                placeholder="Mobile"
                value={profileData.mobile}
                onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
              />
              <select
                value={profileData.gender}
                onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
              >
                <option value="select">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileData({...profileData, profileImage: e.target.files[0]})}
              />
              <button type="submit">Save Profile</button>
              <button type="button" onClick={() => setShowProfileModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
