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