import { randomUUID } from 'crypto'
import pool from "../database/config.js";


export async function createDaily(userId, title, description, daysOfTheWeek) {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO habit_tracker.dailies (id, user_id, title, description, days_of_the_week)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING dailies.id, title, done, streak, description, days_of_the_week, user_id`,
    [id, userId, title, description, daysOfTheWeek]
  );
  return res.rows[0];
}

export async function getPendingDailiesByUserId(userId) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1);

  const res = await pool.query(
     `SELECT dailies.id FROM habit_tracker.dailies INNER JOIN habit_tracker.users on dailies.user_id = users.id WHERE users.id = $1 and dailies.done = false and ${yesterday.getDay()} = any (dailies.days_of_the_week)`,
    [userId]
  );
  return res.rows;
}

export async function findById(dailyId) {
  const res = await pool.query(
    `SELECT dailies.id, title, done, streak, description, days_of_the_week, user_id FROM habit_tracker.dailies
     WHERE id = $1`,
    [dailyId]
  );
  return res.rows[0];
}

export async function updateDaily(dailyId, title, description, daysOfTheWeek) {
  const res = await pool.query(
    `UPDATE habit_tracker.dailies
     SET title=$1, description=$2, days_of_the_week=$3
     WHERE id = $4
     RETURNING dailies.id, title, done, streak, description, days_of_the_week, user_id`,
    [title, description, daysOfTheWeek, dailyId]
  );
  return res.rows[0];
}

export async function deleteDaily(dailyId) {
   const res = await pool.query(
     "DELETE FROM habit_tracker.dailies WHERE id = $1",
    [dailyId]
  );
  return res.rowCount;
}

export async function checkOrUncheckDaily(dailyId, check) {
  const res = await pool.query(
    `UPDATE habit_tracker.dailies
     SET done = $2
     WHERE id = $1
     RETURNING dailies.id, title, done, streak, description, days_of_the_week, user_id`,
    [dailyId, check]
  );
  return res.rows[0];
}

export async function updateStreak(dailyId, streak) {
  const res = await pool.query(
    `UPDATE habit_tracker.dailies
     SET streak = $1
     WHERE id = $2
     RETURNING dailies.id, title, done, streak, description, days_of_the_week, user_id`,
    [streak, dailyId]
  );
  return res.rowCount;
}

export async function getYesterdayDailies(userId) {

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const yesterdayDayOfWeek = yesterday.getDay()

  const res = await pool.query(
    `SELECT dailies.id, done, streak, days_of_the_week FROM habit_tracker.dailies
     WHERE $1 = any(days_of_the_week) and user_id = $2`,
    [yesterdayDayOfWeek, userId]
  );
  return res.rows;
}

export async function updateDailyDoneAndStreak(dailyId, streak) {
  const res = await pool.query(
    `UPDATE habit_tracker.dailies
     SET done = false, streak = $2
     WHERE dailies.id = $1 
     RETURNING dailies.id, done, streak`,
    [dailyId, streak]
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