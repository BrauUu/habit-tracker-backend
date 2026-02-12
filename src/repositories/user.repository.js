import { randomUUID } from 'crypto'
import pool from "../database/config.js";

export async function getByUsername(username) {
    const res = await pool.query(
        "SELECT users.id, username, last_daily_reset_date, last_weekly_reset_date FROM habit_tracker.users WHERE username = $1",
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

export async function getDailiesByUserId(userId) {
  const res = await pool.query(
     "SELECT dailies.id, title, done, streak, description, days_of_the_week, user_id FROM habit_tracker.dailies INNER JOIN habit_tracker.users on dailies.user_id = users.id WHERE users.id = $1",
    [userId]
  );
  return res.rows;
}

export async function getTodosByUserId(userId) {
  const res = await pool.query(
     "SELECT todos.id, title, done_date, due_date, description, user_id FROM habit_tracker.todos INNER JOIN habit_tracker.users on todos.user_id = users.id WHERE users.id = $1",
    [userId]
  );
  return res.rows;
}

export async function getIncrementalsByUserId(userId) {
  const res = await pool.query(
     "SELECT incrementals.id, title, reset_frequency, positive_count, negative_count, description, user_id FROM habit_tracker.incrementals INNER JOIN habit_tracker.users on incrementals.user_id = users.id WHERE users.id = $1",
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