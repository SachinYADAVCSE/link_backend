import jwt from 'jsonwebtoken';

const JWT_SECRET = "badmanSuper_890"

export default function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const token =  header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({error: "Token didn't Find"})
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload // which is id, username
            next();
            console.log("Nights Black, ########");
            
        } catch {
            res.status(401).json({ error: "Invalid Token" })
        }
}