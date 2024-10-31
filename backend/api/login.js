import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function getConnection() {
	const dbConfig = {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
	};
	return mysql.createConnection(dbConfig);
}

export default async (req, res) => {
	if (req.method === 'POST') {
		const { username, password } = req.body;

		try {
			const connection = await getConnection();
			const [rows] = await connection.execute(
				'SELECT * FROM users WHERE username = ?',
				[username]
			);
			await connection.end();

			if (rows.length > 0) {
				const user = rows[0];
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
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
};
