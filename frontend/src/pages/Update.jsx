import { useState, useReducer, useEffect } from "react";
import axios from "axios";

const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const timeOptions = [
    { value: 'day', label: 'DAY' },
    { value: 'night', label: 'NIGHT', },
    { value: 'unavailable', label: 'UNAVAILABLE' }
]

const UpdateAvailability = () => {
    const [nurses, setNurses] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState('');
    const [availability, setAvailability] = useState(
        daysOfWeek.map(day => ({ dayOfWeek: day, timeOfDay: "unavaiable" }))
    )

    useEffect(() => {
        axios.get('/nurses')
            .then(res => setNurses(res.data.nurses))
            .catch(err => console.error('Failed to fetch nurses:', err));
    }, []);

    const handleUpdateTime = (day, value) => {
        setAvailability(prev =>
            prev.map(item =>
                item.dayOfWeek === day ? { ...item, timeOfDay: value} : item
            )
        )
    }

    const handleUpdateAvailability = async (event) => {
        event.preventDefault();
        const id = selectedNurse;

        try {
            const response = await axios.patch(`/nurses/${id}/availability`, { availability });
            console.log('Updated availability: ', response.data)
        } catch (err) {
            console.error('Update failed: ', err.reponse?.data || err.message);
        }
    }
    

    return (
        <form onSubmit={handleUpdateAvailability}>
        <select value={selectedNurse} onChange={e => setSelectedNurse(e.target.value)}>
            <option value="">Select a nurse</option>
            {nurses.map(nurse => (
                <option key={nurse._id} value={nurse._id}>
                    {nurse.name} ({nurse.username})
                </option>
            ))}
        </select>
        <div>
            {daysOfWeek.map(day => (
                <div key={day}>
                    {day}:
                <select
                    value= {availability.find(item => item.dayOfWeek === day)?.timeOfDay || 'unavailable' }
                    onChange={e => handleUpdateTime(day, e.target.value)}
                >
                    {timeOptions.map(opt => (
                        <option key ={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                </div>
            ))}
        </div>
        <button type="submit">Submit</button>
        </form>
    );
}

export default UpdateAvailability;