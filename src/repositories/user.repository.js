import { randomUUID } from 'crypto'
import pool from "../database/config.js";

export async function findByUsername(username) {
    const res = await pool.query(
        "SELECT * FROM habit_tracker.users WHERE username = $1",
        [username]
    );
    return res.rows[0];
}

export async function createUser(username, password) {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO habit_tracker.users (id, username, password)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id, username, password]
  );
  console.log(res.rows)
  return res.rows[0];
}

export async function getDailiesByUserId(userId) {
  const res = await pool.query(
     "SELECT dailies.* FROM habit_tracker.dailies INNER JOIN habit_tracker.users on dailies.user_id = users.id WHERE users.id = $1",
    [userId]
  );
  return res.rows;
}

export async function getTodosByUserId(userId) {
  const res = await pool.query(
     "SELECT todos.* FROM habit_tracker.todos INNER JOIN habit_tracker.users on todos.user_id = users.id WHERE users.id = $1",
    [userId]
  );
  return res.rows;
}

export async function getIncrementalsByUserId(userId) {
  const res = await pool.query(
     "SELECT incrementals.* FROM habit_tracker.incrementals INNER JOIN habit_tracker.users on incrementals.user_id = users.id WHERE users.id = $1",
    [userId]
  );
  return res.rows;
}

export async function deleteUser(userId) {
  const res = await pool.query(
     "DELETE FROM habit_tracker.users WHERE users.id = $1",
    [userId]
  );
  return res.rowCount;
}