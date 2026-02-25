import { randomUUID } from 'crypto'
import pool from "../database/config.js";
import { formatResetFrequencyEnum } from '../utils/constants.js'

export async function createIncremental(userId, title, description, resetFrequency) {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO habit_tracker.incrementals (id, user_id, title, description, reset_frequency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING incrementals.id, title, reset_frequency AS "resetFrequency", positive_count AS "positiveCount", negative_count AS "negativeCount", description, user_id AS "userId"`,
    [id, userId, title, description, resetFrequency]
  );
  return res.rows[0];
}

export async function findById(incrementalId) {
  const res = await pool.query(
    `SELECT incrementals.id, title, reset_frequency AS "resetFrequency", positive_count AS "positiveCount", negative_count AS "negativeCount", description, user_id AS "userId" FROM habit_tracker.incrementals
     WHERE id = $1`,
    [incrementalId]
  );
  return res.rows[0];
}

export async function updateIncremental(incrementalId, title, description, resetFrequency) {
  const res = await pool.query(
    `UPDATE habit_tracker.incrementals
     SET title=$1, description=$2, reset_frequency=$3
     WHERE id = $4
     RETURNING incrementals.id, title, reset_frequency AS "resetFrequency", positive_count AS "positiveCount", negative_count AS "negativeCount", description, user_id AS "userId"`,
    [title, description, resetFrequency, incrementalId]
  );
  return res.rows[0];
}

export async function deleteIncremental(incrementalId) {
  const res = await pool.query(
    "DELETE FROM habit_tracker.incrementals WHERE id = $1",
    [incrementalId]
  );
  return res.rowCount;
}

export async function updatePositiveCount(incrementalId, count) {
  const res = await pool.query(
    `UPDATE habit_tracker.incrementals
     SET positive_count = $1
     WHERE id = $2
     RETURNING incrementals.id, title, reset_frequency AS "resetFrequency", positive_count AS "positiveCount", negative_count AS "negativeCount", description, user_id AS "userId"`,
    [count, incrementalId]
  );
  return res.rowCount;
}

export async function updateNegativeCount(incrementalId, count) {
  const res = await pool.query(
    `UPDATE habit_tracker.incrementals
     SET negative_count = $1
     WHERE id = $2
     RETURNING incrementals.id, title, reset_frequency AS "resetFrequency", positive_count AS "positiveCount", negative_count AS "negativeCount", description, user_id AS "userId"`,
    [count, incrementalId]
  );
  return res.rowCount;
}

export async function resetIncrementals(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0);

  const todayDayOfWeek = today.getDay()

  const res = await pool.query(
    `UPDATE habit_tracker.incrementals
     SET positive_count = 0, negative_count = 0
     WHERE user_id = $1 AND (reset_frequency = $2 OR reset_frequency = 0)
     RETURNING incrementals.id, positive_count AS "positiveCount", negative_count AS "negativeCount"`,
    [userId, todayDayOfWeek]
  );
  return res.rows;
}

export async function getIncrementalsByUserId(userId) {
  const res = await pool.query(
    `SELECT incrementals.id, title, reset_frequency AS "resetFrequency", positive_count AS "positiveCount", negative_count AS "negativeCount", description, user_id AS "userId" FROM habit_tracker.incrementals 
     INNER JOIN habit_tracker.users on incrementals.user_id = users.id 
     WHERE users.id = $1`,
    [userId]
  );
  return res.rows;
}

export async function bulkCreateIncrementals(userId, incrementals, client) {
  if (incrementals.length === 0) return [];

  const values = incrementals.map((_, index) => {
    const offset = index * 7;
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
  }).join(', ');

  const params = incrementals.flatMap(incremental => [
    randomUUID(),
    userId,
    incremental.title,
    incremental.positiveCount,
    incremental.negativeCount,
    incremental.description || null,
    formatResetFrequencyEnum(incremental).resetFrequency
  ]);

  const query = `
    INSERT INTO habit_tracker.incrementals (id, user_id, title, positive_count, negative_count, description, reset_frequency)
    VALUES ${values}
    RETURNING incrementals.id, title, reset_frequency AS "resetFrequency", positive_count AS "positiveCount", negative_count AS "negativeCount", description, user_id AS "userId"
  `;

  const res = await client.query(query, params);
  return res.rows;
}
