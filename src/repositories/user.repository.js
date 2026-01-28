import pool from "../database/config.js";

export async function findByUsername(username) {
    const res = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );
    return res.rows[0];
}

export async function createUser(id, username, password) {
  const res = await pool.query(
    `INSERT INTO users (id, username, password)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [id, username, password]
  );
  return res.rows[0];
}