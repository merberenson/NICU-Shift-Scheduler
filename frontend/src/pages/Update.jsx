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

const UpdateInfo = () => {
    const [nurses, setNurses] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [maxWeeklyHours, setMaxWeeklyHours] = useState('');
    const [loading, setLoading] = useState('');

    useEffect(() => {
        axios.get('/nurses')
            .then(res => setNurses(res.data.nurses))
            .catch(err => console.error('Failed to fetch nurses:', err));
    }, []);

    useEffect(() => {
        if (!selectedNurse) {
            setName('');
            setUsername('');
            setPassword('');
            setEmail('');
            setPhone('');
            setMaxWeeklyHours('');
            return;
        }
        setLoading(true);
        axios.get(`/nurses/${selectedNurse}`)
            .then(res => {
                const nurse = res.data.nurse;
                setName(nurse.name || '');
                setUsername(nurse.username || '');
                setPassword('');
                setEmail(nurse.email || '');
                setPhone(nurse.phone || '');
                setMaxWeeklyHours(nurse.maxWeeklyHours || "");
            })
            .catch(err => {
                console.error('Failed to fetch nurse info', err);
            })
            .finally(() => setLoading(false));
    }, [selectedNurse])

    const handleUpdateInfo = async (event) => {
        event.preventDefault();
        const id = selectedNurse;
        if (!id) return;
        const form = { name, username, password, email, phone, maxWeeklyHours};

        try {
            const response = await axios.patch(`/nurses/${id}`, form);
            console.log('Updated info: ', response.data);
        } catch (err) {
            console.error('Update failed: ', err.reponse?.data || err.message);
        }
    } 

    return (
        <form onSubmit={handleUpdateInfo}>
        <select value={selectedNurse} onChange={e => setSelectedNurse(e.target.value)}>
            <option value="">Select a nurse</option>
            {nurses.map(nurse => (
                <option key={nurse._id} value={nurse._id}>
                    {nurse.name} ({nurse.username})
                </option>
            ))}
        </select>
        {loading ? (
                <div></div>
            ) : selectedNurse && (
                <>
            <input
            type='text'
            placeholder='Name'
            value={name}
            onChange={(event) => setName(event.target.value)}
            />
            <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            />
            <input
            type='text'
            placeholder='Password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            />
            <input
            type='text'
            placeholder='Email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            />
            <input
            type='text'
            placeholder='Phone'
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            />
            <input
            type="text"
            placeholder=""
            value={maxWeeklyHours}
            onChange={(event) => setMaxWeeklyHours(event.target.value)}
            />
            <button type='submit'>Submit</button>
            </>
            )}
        </form>
    );
};

export {UpdateAvailability, UpdateInfo};