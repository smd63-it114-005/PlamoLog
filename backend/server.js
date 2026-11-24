//This is the JavaScript code for the server

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true, trim: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	passwordHash: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return res.status(401).json({error: 'Access token required'});

	jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
		if (err) return res.status(403).json({error: 'Invalid or expired token'});
		req.user = payload;
		next();
	});
}

app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		service: 'PlamoLog Backend (VM2)',
		dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
	});
});


app.post('/api/auth/register', async (req, res) => {
	try {
		const { username, email, password } = req.body;
		if (!username || !email || !password) {
			return res.status(400).json({ error: 'Username, email, and password are required' });
		}
		if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
			return res.status(400).json({error: 'Invalid input format'});
		}
		const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
		if (existing) {
			return res.status(409).json({ error: 'Username or email already exists' });
		}
		const passwordHash = await bcrypt.hash(password, 12);
		const user = await User.create({ username, email, passwordHash });
		res.status(201).json({
			message: 'User registered successfully',
			user: { id: user._id, username: user.username, email: user.email }
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post('/api/auth/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if(!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}
		if (typeof email !== 'string' || typeof password !== 'string') {
			return res.status(400).json({error: 'Invalid input format'});
		}
		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}
		const token = jwt.sign(
			{ id: user._id, username: user.username, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: '2h' }
		);
		res.json({
			message: 'Login successful',
			token,
			user: { id: user._id, username: user.username, email: user.email }
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
	const user = await User.findById(req.user.id).select('-passwordHash');
	if (!user) return res.status(404).json({ error: 'User not found' });
	res.json({ user });
});

mongoose.connect(process.env.MONGO_URI)
	.then(() => {
		console.log('Connected to MongoDB on VM3 (192.168.100.30)');
	app.listen(process.env.PORT, '0.0.0.0', () => {
		console.log('PlamoLog API running on http://192.168.100.20:${process.env.PORT}');
	});
})
	.catch((err) => {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	});
