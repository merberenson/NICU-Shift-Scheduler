const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

const authenticateToken = (req, res, next) => {
    //debug
    console.log('AUTH MIDDLEWARE CALLED');
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ success: false, message: 'No authorization token'})
        }

        jwt.verify(token, ACCESS_SECRET, (err, nurse) => {
            if (err) {
                return res.status(403).send({ success: false, message: 'Invalid token' });
            }
            //debug
            console.log('Valid Token');
            req.nurse = nurse;
            next();
        });
    } catch (err) {
        // Catch any unexpected crash
        console.error('Auth middleware error:', err);
        res.status(500).json({ success: false, message: 'Authentication failed' });
    }
}
module.exports = authenticateToken;
