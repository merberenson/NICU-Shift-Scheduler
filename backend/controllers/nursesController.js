const Nurses = require('../database/models/nurse');
const mongoose = require('mongoose');

const getAllNurses = async (req, res) => {
    try {
        const nurses = await Nurses.find({});
        res.status(200).json({ success: true, nurses });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch nurses.'})
    }
}

const getNurse = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid nurse ID." });
    }
    try {
        const nurse = await Nurses.findById(id);
        if (!nurse) {
            return res.status(404).json({ success: false, message: "Nurse not found."});
        }
        res.status(200).json({ success: true, nurse })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch nurse.'});
    }
}

module.exports = { getAllNurses, getNurse };