import { useState, useReducer, useEffect } from "react";
import axios from "axios";
import { useAuth } from '../context/AuthContext';

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

export { UpdateInfo };