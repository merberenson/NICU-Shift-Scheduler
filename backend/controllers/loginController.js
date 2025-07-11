//const mongoose = require('mongoose');
const Nurse = require('../database/models/nurse');
const Token = require('../database/models/token')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//const Admin = mongoose.model('Admin', AdminSchema)
//const Nurse = mongoose.model('Nurse', NurseSchema)

const Access_SECRET = process.env.Access_Token_Secret || 'default'; 
const Refresh_SECRET = process.env.Refresh_Token_Secret || 'default';
const generateTokens = (Id) => {
    const accessToken = jwt.sign({ Id }, Access_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ Id }, Refresh_SECRET, { expiresIn: '1d' });
    return { accessToken, refreshToken };
};

//add new nurse for testing
const addNewNurse = async (req, res) => {
    const newNurse = new Nurse(req.body)

    try {
//        const hashedPassword = await bcrypt.hash(password, 10);
        const nurse = await newNurse.save()
        res.status(201).json({success: true, data: nurse})
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ success: false, message: `${field.charAt(0) + field.slice(1)} already exists.`})
        }
        if (err.name == 'ValidationError') {
            const messages = Object.values(err.errors).map(e=> e.message);
            return res.status(400).json({success: false, error: messages })
        }
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to register. '})
    }
}



//method to login

const loginNurse = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(401).json({ success: false, message: 'username or password cannot be empty.' });
        }
    
        const nurse = await Nurse.findOne({ username });
        if (!nurse) {
            return res.status(401).json({ success: false, message: 'invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, nurse.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(nurse._id);

        await Token.create({
            userId: nurse._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) //one day
        })

        res.status(200).json({ success: true, accessToken, refreshToken });
    } catch (error){
        console.error(error);
        return res.status(500).json({ error: 'internal server error' })
    }
}

const refresh = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);

    const storedToken = await Token.findOne({ token });
    if (!storedToken) return res.sendStatus(403);

    try {
        const payload = jwt.verify(token, REFRESH_SECRET);
        const newAccessToken = jwt.sign({ userId: payload.userId }, ACCESS_SECRET, { expiresIn: '15m' });
        res.status().json({ accessToken: newAccessToken });
    } catch (err) {
        console.error(err);
        return res.sendStatus(403);
    }
}

module.exports = {addNewNurse, loginNurse, refresh};