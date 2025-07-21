const Nurse = require('../database/models/nurse');
const mongoose = require('mongoose');

const deleteNurse = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: "Invalid nurse ID."})
        }
        const result = await Nurse.findByIdAndDelete(id);

        if (result) {
            res.status(200).json({success: true, message: `Object with id ${id} successfully deleted.` })
        } else {
            res.status(404).json({success: false, message: `Object with id ${id} not found`})
        }
    } catch (err) {
            console.error('Error deleting object', err)
            res.status(500).json({success: false, message: "internal server error"})
    }
}

module.exports = { deleteNurse }