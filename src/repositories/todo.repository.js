import { randomUUID } from 'crypto'
import pool from "../database/config.js";

export async function createTodo(userId, title, description, dueDate) {
  const id = randomUUID();
  const res = await pool.query(
    `INSERT INTO habit_tracker.todos (id, user_id, title, description, due_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING todos.id, title, done_date, due_date, description, user_id`,
    [id, userId, title, description, dueDate]
  );
  return res.rows[0];
}

export async function findById(todoId) {
  const res = await pool.query(
    `SELECT todos.id, title, done_date, due_date, description, user_id FROM habit_tracker.todos
     WHERE id = $1`,
    [todoId]
  );
  return res.rows[0];
}

export async function updateTodo(todoId, title, description, dueDate) {
  const res = await pool.query(
    `UPDATE habit_tracker.todos
     SET title=$1, description=$2, due_date=$3
     WHERE id = $4
     RETURNING todos.id, title, done_date, due_date, description, user_id`,
    [title, description, dueDate, todoId]
  );
  return res.rows[0];
}

export async function deleteTodo(todoId) {
   const res = await pool.query(
     "DELETE FROM habit_tracker.todos WHERE id = $1",
    [todoId]
  );
  return res.rowCount;
}

export async function updateDoneDate(todoId, doneDate) {
  const res = await pool.query(
    `UPDATE habit_tracker.todos
     SET done_date = $1
     WHERE id = $2
     RETURNING todos.id, title, done_date, due_date, description, user_id`,
    [doneDate, todoId]
  );
  return res.rowCount;
}