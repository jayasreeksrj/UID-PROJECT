import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GoalSetting.css';

const SetGoal = () => {
  const [calorieGoal, setCalorieGoal] = useState('');
  const [waterGoal, setWaterGoal] = useState('');
  const navigate = useNavigate();

  const saveGoal = () => {
    localStorage.setItem('calorieGoal', calorieGoal);
    localStorage.setItem('waterGoal', waterGoal);
    navigate('/calorie');
  };

  return (
    <div className="set-goal">
      <h2>Set Your Daily Goals</h2>
      <label>
        Calorie Goal (kcal):
        <input type="number" value={calorieGoal} onChange={(e) => setCalorieGoal(e.target.value)} />
      </label>
      <label>
        Water Goal (glasses):
        <input type="number" value={waterGoal} onChange={(e) => setWaterGoal(e.target.value)} />
      </label>
      <button onClick={saveGoal}>Save Goals</button>
    </div>
  );
};

export default SetGoal;
