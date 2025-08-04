const Nurses = require('../database/models/nurse');
const mongoose = require('mongoose');

const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { availability } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: "Invalid nurse ID."})
        }

        const updateResult = await Nurses.findByIdAndUpdate(
            id,
            { $set: { availability} },
            { new: true }
        )

        if (!updateResult) {
            return res.status(404).json({ success: false, message: 'Nurse not found. '})
        }

        res.status(200).json({ success: true, message: updateResult })
    } catch (err) {
        console.error('Error updating object', err)
        res.status(500).json({success: false, message: "internal server error"})
    }
}

const getAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: "Invalid nurse ID."})
        }

        const nurse = await Nurses.findById(id);
        if (!nurse) {
            return res.status(404).json({ success: false, message: "Nurse not found."});
        }
        res.status(200).json({ success: true, availability: nurse.availability || [] })

    } catch (err) {
        console.error('Error getting object', err)
        res.status(500).json({success: false, message: "internal server error"})
    }
}

const updateInfo = async (req, res) => {
    try {
        const {id} = req.params;
        const { name, username, password, email, phone, maxWeeklyHours } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: "Invalid nurse ID."})
        }

        const updateResult = await Nurses.findByIdAndUpdate(
            id,
            {name, username, password, email, phone, maxWeeklyHours},
            { new: true }
        )

        if (!updateResult) {
            return res.status(404).json({ success: false, message: 'Nurse not found. '})
        }

        res.status(200).json({ success: true, message: updateResult })
    } catch (err) {
        console.error('Error updating object', err)
        res.status(500).json({success: false, message: "internal server error"})
    }
}

module.exports = { updateAvailability, getAvailability, updateInfo };