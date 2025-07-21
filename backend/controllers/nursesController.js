const Nurses = require('../database/models/nurse');

const getAllNurses = async (req, res) => {
    try {
        const nurses = await Nurses.find({});
        res.status(200).json({ success: true, nurses });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch nurses.'})
    }
}

module.exports = { getAllNurses }