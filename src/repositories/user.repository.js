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

export async function getDailiesByUserId(userId) {
  const res = await pool.query(
     "SELECT dailies.* FROM dailies INNER JOIN users on dailies.user_id = users.id WHERE users.id = $1",
    [userId]
  );
  return res.rows;
}

export async function getTodosByUserId(userId) {
  const res = await pool.query(
     "SELECT todos.* FROM todos INNER JOIN users on todos.user_id = users.id WHERE users.id = $1",
    [userId]
  );
  return res.rows;
}

export async function getIncrementalsByUserId(userId) {
  const res = await pool.query(
     "SELECT incrementals.* FROM incrementals INNER JOIN users on incrementals.user_id = users.id WHERE users.id = $1",
    [userId]
  );
  return res.rows;
}

export async function deleteUser(userId) {
  const res = await pool.query(
     "DELETE FROM users WHERE users.id = $1",
    [userId]
  );
  return res.rowCount;
}