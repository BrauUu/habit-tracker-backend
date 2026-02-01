import { randomUUID } from 'crypto'
import pool from "../database/config.js";

export async function createDaily(userId, title, description, daysOfTheWeek) {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO dailies (id, user_id, title, description, days_of_the_week)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, userId, title, description, daysOfTheWeek]
  );
  return res.rows[0];
}

export async function getPendingDailiesByUserId(userId) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1);

  const res = await pool.query(
     `SELECT dailies.* FROM dailies INNER JOIN users on dailies.user_id = users.id WHERE users.id = $1 and dailies.done = false and ${yesterday.getDay()} = any (dailies.days_of_the_week)`,
    [userId]
  );
  return res.rows;
}

export async function undoAllDailies(userId) {
  const res = await pool.query(
    `UPDATE dailies
     SET done = false
     WHERE user_id = $1`,
    [userId]
  );
  return res.rowCount;
}

export async function findById(dailyId) {
  const res = await pool.query(
    `SELECT * FROM dailies
     WHERE id = $1`,
    [dailyId]
  );
  return res.rows[0];
}

export async function updateDaily(dailyId, title, description, daysOfTheWeek) {
  const res = await pool.query(
    `UPDATE dailies
     SET title=$1, description=$2, days_of_the_week=$3
     WHERE id = $4
     RETURNING *`,
    [title, description, daysOfTheWeek, dailyId]
  );
  return res.rows[0];
}

export async function deleteDaily(dailyId) {
   const res = await pool.query(
     "DELETE FROM dailies WHERE id = $1",
    [dailyId]
  );
  return res.rowCount;
}

export async function checkOrUncheckDaily(dailyId, check) {
  const res = await pool.query(
    `UPDATE dailies
     SET done = $2
     WHERE id = $1
     RETURNING *`,
    [dailyId, check]
  );
  return res.rows[0];
}

export async function updateStreak(dailyId, streak) {
  const res = await pool.query(
    `UPDATE dailies
     SET streak = $1
     WHERE id = $2
     RETURNING *`,
    [streak, dailyId]
  );
  return res.rowCount;
}