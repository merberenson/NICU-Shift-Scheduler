import { use, useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = { name, username, password, email, phone };

        // const res = await fetch('/nurses', {
        //     method: 'POST',
        //     body: JSON.stringify(form),
        // });
        try {
        const res = await axios.post('/nurses', form)
        
        console.log('logged in: ', res.data)
        } catch (err) {
            console.error('loggin failed: ', err.reponse?.data || err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
            <button type='submit'>Submit</button>
        </form>
    );
}

export default Register;