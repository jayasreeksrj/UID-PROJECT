const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mern_auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: { type: String, unique: true }
});

// Meal Schema
const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String,
  breakfast: [{
    name: String,
    calories: Number
  }],
  lunch: [{
    name: String,
    calories: Number
  }],
  snack: [{
    name: String,
    calories: Number
  }],
  dinner: [{
    name: String,
    calories: Number
  }],
  totalCalories: Number,
  waterIntake: Number
});

const User = mongoose.model('User', userSchema);
const Meal = mongoose.model('Meal', mealSchema);

// Auth Routes
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;
  const existingUser = await User.findOne({ email: new RegExp(`^${email}`, 'i') });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, email });
  await user.save();
  res.json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email === 'jayasreeks.22it@kongu.edu' && password === 'admin2024') {
    const token = jwt.sign({ role: 'admin' }, 'secret', { expiresIn: '1h' });
    return res.json({ message: 'Admin login successful', token, role: 'admin' });
  }

  try {
    const user = await User.findOne({ email: new RegExp(`^${email}`, 'i') });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: 'user' }, 'secret', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, role: 'user' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided' });
  try {
    const decoded = jwt.verify(token, 'secret');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// User Routes
app.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to search users by username
app.get('/admin/users', async (req, res) => {
  const { username } = req.query;  // Get username from query string

  try {
    let users;
    
    if (username) {
      // If username is provided, search by username
      users = await User.find({ username: new RegExp(username, 'i') });
    } else {
      // Otherwise, return all users
      users = await User.find();
    }

    // Now, include meal data for each user (total calories and food descriptions)
    const userDetailsWithMeals = [];

    for (let user of users) {
      // Fetch user's meal data
      const meals = await Meal.find({ userId: user._id });

      let totalCalories = 0;
      let foodDescription = [];

      meals.forEach(meal => {
        meal.breakfast.forEach(food => {
          totalCalories += food.calories;
          foodDescription.push(food.name);
        });
        meal.lunch.forEach(food => {
          totalCalories += food.calories;
          foodDescription.push(food.name);
        });
        meal.snack.forEach(food => {
          totalCalories += food.calories;
          foodDescription.push(food.name);
        });
        meal.dinner.forEach(food => {
          totalCalories += food.calories;
          foodDescription.push(food.name);
        });
      });

      // Push user details with meal data
      userDetailsWithMeals.push({
        username: user.username,
        email: user.email, 
        totalCalories,
        foodDescription: foodDescription.join(', ') // Join food names as comma-separated string
      });
    }

    res.json(userDetailsWithMeals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users or meal data' });
  }
});

// Meal Routes
app.post('/api/meals', authMiddleware, async (req, res) => {
  try {
    const mealData = { ...req.body, userId: req.userId };
    const meal = new Meal(mealData);
    await meal.save();

    // Recalculate total calories for the meal after saving
    const totalCalories = meal.breakfast.reduce((acc, food) => acc + food.calories, 0) +
      meal.lunch.reduce((acc, food) => acc + food.calories, 0) +
      meal.snack.reduce((acc, food) => acc + food.calories, 0) +
      meal.dinner.reduce((acc, food) => acc + food.calories, 0);

    meal.totalCalories = totalCalories;
    await meal.save();

    res.status(201).json({ message: 'Meal data saved successfully', totalCalories });
  } catch (error) {
    res.status(500).json({ error: 'Error saving meal data' });
  }
});

app.get('/api/meals', authMiddleware, async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.userId });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching meal data' });
  }
});

// Add this after your existing middleware setup
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Update Profile Schema
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  mobile: String,
  gender: String,
  profileImage: String
});

const Profile = mongoose.model('Profile', profileSchema);

// Profile Routes
app.post('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { username, mobile, gender } = req.body;
    const userId = req.userId;
    
    const profileData = {
      userId,
      username,
      mobile,
      gender
    };

    const profile = await Profile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    console.log('Profile save error:', error);
    res.status(500).json({ message: 'Failed to save profile' });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
