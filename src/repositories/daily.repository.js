import { randomUUID } from 'crypto'
import pool from "../database/config.js";


export async function createDaily(userId, title, description, daysOfTheWeek) {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO habit_tracker.dailies (id, user_id, title, description, days_of_the_week)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING dailies.id, title, done, streak, description, days_of_the_week AS "daysOfTheWeek", user_id AS "userId"`,
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
    `SELECT dailies.id, title, done, streak, description, days_of_the_week AS "daysOfTheWeek", user_id AS "userId" FROM habit_tracker.dailies
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
     RETURNING dailies.id, title, done, streak, description, days_of_the_week AS "daysOfTheWeek", user_id AS "userId"`,
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
     RETURNING dailies.id, title, done, streak, description, days_of_the_week AS "daysOfTheWeek", user_id AS "userId"`,
    [dailyId, check]
  );
  return res.rows[0];
}

export async function updateStreak(dailyId, streak) {
  const res = await pool.query(
    `UPDATE habit_tracker.dailies
     SET streak = $1
     WHERE id = $2
     RETURNING dailies.id, title, done, streak, description, days_of_the_week AS "daysOfTheWeek", user_id AS "userId"`,
    [streak, dailyId]
  );
  return res.rowCount;
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
    `SELECT dailies.id, title, done, streak, description, days_of_the_week AS "daysOfTheWeek", user_id AS "userId" FROM habit_tracker.dailies 
    INNER JOIN habit_tracker.users on dailies.user_id = users.id 
    WHERE users.id = $1`,
    [userId]
  );
  return res.rows;
}

export async function bulkCreateDailies(userId, dailies, client) {
  if (dailies.length === 0) return [];

  const params = dailies.flatMap(daily => [
    randomUUID(),
    userId,
    daily.title,
    daily.done,
    daily.streak,
    daily.description || null,
    daily.daysOfTheWeek
  ]);

  const query = `
    INSERT INTO habit_tracker.dailies (id, user_id, title, done, streak, description, days_of_the_week)
    VALUES ${values}
    RETURNING dailies.id, title, done, streak, description, days_of_the_week AS "daysOfTheWeek", user_id AS "userId"
  `;

  const res = await client.query(query, params);
  return res.rows;
}

export async function getDailiesToBeReordered(oldPosition, newPosition, client = pool) {

  const start = oldPosition < newPosition ? oldPosition + 1 : newPosition
  const end = oldPosition < newPosition ? newPosition : oldPosition - 1

  const res = await client.query(
    `SELECT dailies.id, "order", title FROM habit_tracker.dailies
     WHERE "order" BETWEEN $1 AND $2`,
    [start, end]
  );

  return res.rows

}

export async function reorderOtherDailies(dailies, oldPosition, newPosition, client = pool) {
  const step = oldPosition < newPosition ? -1 : 1

  const values = dailies.map((daily, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
    .join(', ')

  const params = dailies.flatMap(daily => [
    daily.id,
    Number(daily.order) + step
  ])

  const res = await client.query(
    `UPDATE habit_tracker.dailies d
     SET "order" = v.new_order::bigint
     FROM (VALUES ${values}) AS v(id, new_order)
     WHERE d.id = v.id::uuid
     RETURNING d.id, d."order"`,
    params
  );

  return res.rows
}

export async function reorderActualDaily(dailyId, newPosition, client = pool) {

  const res = await client.query(
    `UPDATE habit_tracker.dailies
      SET "order" = $1
      WHERE dailies.id = $2 
      RETURNING dailies.id, "order"`,
    [newPosition, dailyId]
  );

  return res.rows
}


