const Nurse = require('../database/models/nurse');

const deleteNurse = async (id) => {
    try {
        const res = await Nurse.findByIdAndDelete(id);

        if (res) {
            res.status(200).json({success: true, message: `Object with id ${id} successfully deleted.` })
        } else {
            res.status(404).json({success: false, message: `Object with id ${id} not found`})
        }
    } catch (err) {
            console.error('Error deleting object', err)
    }
}

module.exports = { deleteNurse }