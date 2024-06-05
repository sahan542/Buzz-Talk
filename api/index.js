const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');

dotenv.config();

async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb+srv://sahanrashmika:7648847@cluster2.faf8iza.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}

connectToDatabase();

const jwtSecret = process.env.JWT_SECRET || 'asdflkjaw34lkjasdalfkjaw4rlkjashdfkljhasdfkjh';

const app = express();
app.use(express.json());

app.use(cors({
  credentials: true,
  origin: "http://localhost:5173",
}));

app.get('/test', (req, res) => {
  res.json('test ok');
});

//get profile
app.get('/profile', (req,res) => {
    const token = req.cookies?.token;
    if(token){
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if(err) throw err;
            res.json(userData);
        });
    }
    else{
        res.status(401).json('no token');
    } 
});

//register new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const createdUser = await User.create({ username, password });
    jwt.sign({ userId: createdUser._id }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).status(201).json({ 
        id: createdUser._id,
        username,

    });
    });
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

const port = process.env.PORT || 4040;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


//PS C:\Users\acer\Documents\Buzz-Talk\api> nodemon index.js