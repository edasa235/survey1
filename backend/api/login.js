import pkg from 'pg';
import bcrypt from 'bcrypt';
import router from './answers.js';

const { Pool } = pkg;

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT, // corrected from DP_PORT to port
	ssl: {
		rejectUnauthorized: false, // This is to allow insecure SSL certificates (useful for services like Render)
	}
});

async function getConnection() {
	return pool.connect();
}

router.post('/', async (req, res) => {
	const { username, password } = req.body;
	try {
		const client = await getConnection();
		const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
		client.release();

		if (result.rows.length > 0) {
			const user = result.rows[0];
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				res.status(200).json({ user_id: user.user_id });
			} else {
				res.status(401).json({ error: 'Invalid username or password' });
			}
		} else {
			res.status(401).json({ error: 'Invalid username or password' });
		}
	} catch (error) {
		console.error('Login Error:', error);
		res.status(500).json({ error: 'Login failed' });
	}
});

export default router;

