import { useState, useReducer, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

const Login = () => {

// creates blank input
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = { username, password };

        // const res = await fetch('/login', {
        //     method: 'POST',
        //     body: JSON.stringify(form),
        // });
        try {
            const res = await axios.post('/login', form)
        
            console.log('logged in: ', res.data)
        } catch (err) {
            console.error('loggin failed: ', err.reponse?.data || err.message);
        }
    };

    return (
        <>
            <form  onSubmit={handleSubmit}>
                <input
                type = "text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <Link to="/register">Register</Link>
        </>
    );
    
}

export default Login;