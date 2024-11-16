import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';  // Import CSS for styling

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch users from backend when the component mounts
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/users');
      console.log(response.data);  // Log to check the data structure
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter users based on search query (by username)
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by username..."
          />
        </div>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Total Calories</th>
            <th>Food Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td className="total-calories">{user.totalCalories}</td>
              <td className="food-description">{user.foodDescription}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
