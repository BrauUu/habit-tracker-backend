import { randomUUID } from 'crypto'
import pool from "../database/config.js";

export async function getByUsername(username) {
  const res = await pool.query(
    "SELECT users.id, username, password, last_daily_reset_date, last_weekly_reset_date FROM habit_tracker.users WHERE username = $1",
    [username]
  );
  return res.rows[0];
}

export async function getById(userId) {
  const res = await pool.query(
    "SELECT users.id, username, last_daily_reset_date, last_weekly_reset_date FROM habit_tracker.users WHERE id = $1",
    [userId]
  );
  return res.rows[0];
}

export async function createUser(username, password) {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO habit_tracker.users (id, username, password)
     VALUES ($1, $2, $3)
     RETURNING users.id, username, last_daily_reset_date, last_weekly_reset_date`,
    [id, username, password]
  );
  return res.rows[0];
}

export async function deleteUser(userId) {
  const res = await pool.query(
    "DELETE FROM habit_tracker.users WHERE users.id = $1",
    [userId]
  );
  return res.rowCount;
}