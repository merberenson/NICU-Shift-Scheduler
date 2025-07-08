const mongoose = require('mongoose');
const NurseSchema = require('../models/nurse');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//const Admin = mongoose.model('Admin', AdminSchema)
//const Nurse = mongoose.model('Nurse', NurseSchema)

const JWT_SECRET = process.env.JWT_SECRET || 'default'; 

const Nurse = mongoose.model('Nurse', NurseSchema);


//add new nurse for testing
const addNewNurse = async (req, res) => {
    const newNurse = new Nurse(req.body)

    try {
//        const hashedPassword = await bcrypt.hash(password, 10);
        const nurse = await newNurse.save()
        res.json(nurse)
    } catch (err) {
        res.send(err)
    }
}



//method to login

const loginNurse = async (req, res) => {
    try {
        const { username, password } = req.body;
    
        const nurse = await nurse.findOne({username});
        if (!nurse) {
            return res.status(401).json({ message: 'invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, nurse.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'invalid credentials' });
        }
    

        // Create token
        const accessToken = jwt.sign(
            { empID: nurse.empID },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({accessToken})
    } catch (error){
        res.status(500).json({ error: 'invalid credentials' })
    }
}

module.exports = {addNewNurse, loginNurse};