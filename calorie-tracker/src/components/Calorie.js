import React, { useState, useEffect } from 'react';
import './Calorie.css';
import { Link } from 'react-router-dom';
const Calorie = () => {
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], snack: [], dinner: [] });
  const [waterIntake, setWaterIntake] = useState(0);
  const [foodName, setFoodName] = useState('');
  const [date] = useState(new Date().toLocaleDateString());
  const [nutritionistMessage, setNutritionistMessage] = useState('');
  
  // Fetch calorie goal from localStorage (stored after setting the goal)
  const calorieGoal = parseInt(localStorage.getItem('calorieGoal')) || 0;

  const NUTRITIONIX_APP_ID = "9d4d6b7c";
  const NUTRITIONIX_APP_KEY = "c862ff994be226f4d3fe70a7a1d10b25";

  const fetchFoodDetails = async (foodName) => {
    try {
      const response = await fetch(`https://trackapi.nutritionix.com/v2/natural/nutrients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_APP_KEY,
        },
        body: JSON.stringify({ query: foodName })
      });
      const data = await response.json();
      return data.foods[0];
    } catch (error) {
      console.error("Error fetching food details:", error);
    }
  };

  const addFood = async (mealType) => {
    if (!foodName.trim()) return;
    const foodDetails = await fetchFoodDetails(foodName);
    if (foodDetails) {
      setMeals((prevMeals) => ({
        ...prevMeals,
        [mealType]: [...prevMeals[mealType], foodDetails]
      }));
      setFoodName('');
    }
  };

  const deleteFood = (mealType, index) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].filter((_, i) => i !== index)
    }));
  };

  const totalCalories = Object.values(meals).flat().reduce((acc, food) => acc + food.nf_calories, 0);

  const saveData = async () => {
    const username = localStorage.getItem('username'); // Retrieve username from localStorage
    if (!username) {
      alert('Username is missing. Please log in again.');
      return;
    }
    const mealSummary = {
      date,
      username,
      breakfast: meals.breakfast.map(food => ({
        name: food.food_name,
        calories: Math.round(food.nf_calories),
        carbs: Math.round(food.nf_total_carbohydrate),
        protein: Math.round(food.nf_protein),
        fat: Math.round(food.nf_total_fat)
      })),
      lunch: meals.lunch.map(food => ({
        name: food.food_name,
        calories: Math.round(food.nf_calories),
        carbs: Math.round(food.nf_total_carbohydrate),
        protein: Math.round(food.nf_protein),
        fat: Math.round(food.nf_total_fat)
      })),
      snack: meals.snack.map(food => ({
        name: food.food_name,
        calories: Math.round(food.nf_calories),
        carbs: Math.round(food.nf_total_carbohydrate),
        protein: Math.round(food.nf_protein),
        fat: Math.round(food.nf_total_fat)
      })),
      dinner: meals.dinner.map(food => ({
        name: food.food_name,
        calories: Math.round(food.nf_calories),
        carbs: Math.round(food.nf_total_carbohydrate),
        protein: Math.round(food.nf_protein),
        fat: Math.round(food.nf_total_fat)
      })),
      totalCalories: Math.round(totalCalories),
      waterIntake
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mealSummary)
      });
      if (response.ok) {
        alert('Meal data saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Error saving data: ${error.message}`);
    }
  };

  useEffect(() => {
    if (totalCalories > calorieGoal) {
      setNutritionistMessage(`You have exceeded your daily calorie goal of ${calorieGoal} kcal.`);
    } else if (totalCalories > 2000) {
      setNutritionistMessage('Your calorie intake is high. Consider consulting a nutritionist.');
    } else {
      setNutritionistMessage('');
    }
  }, [totalCalories, calorieGoal]);

  return (
    <div className="calorie-tracker">
      <header className="tracker-header">
        <h1>Daily Nutrition Tracker</h1>
        <h2>{date}</h2>
      </header>
      <Link to="/goal-setting" className="progress-link">
        View Progress
      </Link>
      <div className="food-input-section">
        <input
          type="text"
          placeholder="Enter food name (e.g., 1 apple, 2 slices of bread)"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          className="food-input"
        />
        <div className="meal-buttons">
          <button onClick={() => addFood('breakfast')}>Add to Breakfast</button>
          <button onClick={() => addFood('lunch')}>Add to Lunch</button>
          <button onClick={() => addFood('snack')}>Add to Snack</button>
          <button onClick={() => addFood('dinner')}>Add to Dinner</button>
        </div>
      </div>
      <div className="meals-container">
        {['breakfast', 'lunch', 'snack', 'dinner'].map((meal) => (
          <div key={meal} className="meal-section">
            <h3>{meal.charAt(0).toUpperCase() + meal.slice(1)}</h3>
            <div className="food-cards">
              {meals[meal].map((food, index) => (
                <div key={index} className="food-card">
                  <h4>{food.food_name}</h4>
                  <div className="nutrient-info">
                    <p>Calories: {Math.round(food.nf_calories)} kcal</p>
                    <p>Carbs: {Math.round(food.nf_total_carbohydrate)}g</p>
                    <p>Protein: {Math.round(food.nf_protein)}g</p>
                    <p>Fat: {Math.round(food.nf_total_fat)}g</p>
                  </div>
                  <button
                    onClick={() => deleteFood(meal, index)}
                    className="delete-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="water-tracker">
        <h3>Water Intake</h3>
        <div className="water-controls">
          <button onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}>-</button>
          <span>{waterIntake} glasses</span>
          <button onClick={() => setWaterIntake(waterIntake + 1)}>+</button>
        </div>
      </div>
      <div className="summary-section">
        <h3>Daily Summary</h3>
        <p>Total Calories: {Math.round(totalCalories)} kcal</p>
        {nutritionistMessage && (
          <p className="nutritionist-message">{nutritionistMessage}</p>
        )}
      </div>
      <button onClick={saveData} className="save-btn">
        Save Today's Data
      </button>
    </div>
  );
};

export default Calorie;
