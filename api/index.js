const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const app = express();

app.get('/test', (req,res) => {
    res.json('test ok');
});

app.post('/register', async(req,res) =>{
    const {username,password} = req.body;
    const createdUser = await User.create({username,password});
    jwt.sign({userId:createdUser,_id}, jwtSecret, (err,token) => {
        if(err) throw err;
        res.cookie('token',token).status(201).json('ok');
    })
});
app.listen(4040);

//PS C:\Users\acer\Documents\Buzz-Talk\api> nodemon index.js