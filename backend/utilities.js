const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: true, message: "Token not provided" });
    }

    const token = authHeader.split(' ')[1]; // Ensure this line has `.split`
    if (!token) {
        return res.status(401).json({ error: true, message: "Invalid token format" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: true, message: "Token is invalid" });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };
