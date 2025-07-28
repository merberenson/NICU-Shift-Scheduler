import { useState, useReducer, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

const Delete = () => {
    const [nurses, setNurses] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState('');

    useEffect(() => {
        axios.get('/nurses')
            .then(res => setNurses(res.data.nurses))
            .catch(err => console.error('Failed to fetch nurses:', err));
    }, []);

    const handleDelete = async (event) => {
        event.preventDefault();
        const id = selectedNurse;
        
        try {
            const response = await axios.delete(`/nurses/${id}`)

            console.log('Deleted: ', response.data)
        } catch (err) {
            console.error('Delete failed: ', err.reponse?.data || err.message);
        }
    }
    
    return (
        <AdminLayout>
        <form onSubmit={handleDelete}>
        <select value={selectedNurse} onChange={e => setSelectedNurse(e.target.value)}>
            <option value="">Select a nurse</option>
            {nurses.map(nurse => (
                <option key={nurse._id} value={nurse._id}>
                    {nurse.name} ({nurse.username})
                </option>
            ))}
        </select>
        <button type="submit">Submit</button>
        </form>
        </AdminLayout>
    )
}

export default Delete;