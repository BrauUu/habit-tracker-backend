import { randomUUID } from 'crypto'
import pool from "../database/config.js";

export async function createIncremental(userId, title, description, resetFrequency) {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO habit_tracker.incrementals (id, user_id, title, description, reset_frequency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING incrementals.id, title, reset_frequency, positive_count, negative_count, description, user_id`,
    [id, userId, title, description, resetFrequency]
  );
  return res.rows[0];
}

export async function findById(incrementalId) {
  const res = await pool.query(
    `SELECT incrementals.id, title, reset_frequency, positive_count, negative_count, description, user_id FROM habit_tracker.incrementals
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
     RETURNING incrementals.id, title, reset_frequency, positive_count, negative_count, description, user_id`,
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
     RETURNING incrementals.id, title, reset_frequency, positive_count, negative_count, description, user_id`,
    [count, incrementalId]
  );
  return res.rowCount;
}

export async function updateNegativeCount(incrementalId, count) {
  const res = await pool.query(
    `UPDATE habit_tracker.incrementals
     SET negative_count = $1
     WHERE id = $2
     RETURNING incrementals.id, title, reset_frequency, positive_count, negative_count, description, user_id`,
    [count, incrementalId]
  );
  return res.rowCount;
}