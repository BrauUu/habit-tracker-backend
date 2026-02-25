import { randomUUID } from 'crypto'
import pool from "../database/config.js";

export async function getByUsername(username) {
  const res = await pool.query(
    `SELECT users.id, username, password, last_daily_reset_date AS "lastDailyResetDate" FROM habit_tracker.users 
     WHERE username = $1`,
    [username]
  );
  return res.rows[0];
}

export async function getById(userId) {
  const res = await pool.query(
    `SELECT users.id, username, last_daily_reset_date AS "lastDailyResetDate" FROM habit_tracker.users 
     WHERE id = $1`,
    [userId]
  );
  return res.rows[0];
}

export async function createUser(username, password) {
  const id = randomUUID();

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const res = await pool.query(
    `INSERT INTO habit_tracker.users (id, username, password, last_daily_reset_date)
     VALUES ($1, $2, $3, $4)
     RETURNING users.id, username, last_daily_reset_date AS "lastDailyResetDate" `,
    [id, username, password, now]
  );
  return res.rows[0];
}

export async function updateLastDailyResetDate(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const res = await pool.query(
    `UPDATE habit_tracker.users
     SET last_daily_reset_date = $1
     WHERE users.id = $2
     RETURNING last_daily_reset_date AS "lastDailyResetDate"
     `,
    [today, userId]
  );
  return res.rows[0];
}

export async function deleteUser(userId) {
  const res = await pool.query(
    `DELETE FROM habit_tracker.users 
    WHERE users.id = $1`,
    [userId]
  );
  return res.rowCount;
}