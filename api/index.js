const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');

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
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());
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
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
    const createdUser = await User.create({ 
        username:username , 
        password:hashedPassword });
    jwt.sign({ userId: createdUser._id,username }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).status(201).json({ 
        id: createdUser._id,
    });
    /*
    res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
        id: createdUser._id,
      });
    */
    });
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
});


//login user
app.post('/login', async(req,res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if (foundUser) {
       const passOk = bcrypt.compareSync(password, foundUser.password);
       if (passOk) {
        jwt.sign({userId: foundUser._id,username}, jwtSecret, {},(err, token) =>{
            res.cookie('token', token, {sameSite:'none', secure:true}).json({
                id: foundUser._id,
            });
        });
       }
    }
});

/*
const port = process.env.PORT || 4040;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
*/

const server = app.listen(4040);

const wss = new ws.WebSocketServer({server});
wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie;
    if(cookies){
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if(tokenCookieString){
            const token = tokenCookieString.split('=')[1];
            if(token){
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if(err) throw err;
                    const {userId, username} = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }
    console.log([...wss.clients].map(c => c.username));
});



//PS C:\Users\acer\Documents\Buzz-Talk\api> nodemon index.js