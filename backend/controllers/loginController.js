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
        res.status(201).json(nurse)
    } catch (err) {
        if (err.name == 'ValidationError') {
            const messages = Object.values(err.errors).map(e=> e.message);
            return res.status(400).json({ error: messages })
        }

        res.send(err)
        res.status(500).json({ error: 'Failed to register. '})
    }
}



//method to login

const loginNurse = async (req, res) => {
    try {
        const { username, password } = req.body;
    
        const nurse = await Nurse.findOne({ username });
        if (!nurse) {
            return res.status(401).json({ message: 'invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, nurse.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(nurse._id);

        await Token.create({
            userId: nurse._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) //one day
        })

        res.status(200).json({ accessToken, refreshToken });
    } catch (error){
        res.status(500).json({ error: 'internal server error' })
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
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.sendStatus(403);
    }
}

module.exports = {addNewNurse, loginNurse, refresh};