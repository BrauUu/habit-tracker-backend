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
     WHERE todos.id = $1`,
    [todoId]
  );
  return res.rows[0];
}

export async function updateTodo(todoId, title, description, dueDate) {
  const res = await pool.query(
    `UPDATE habit_tracker.todos
     SET title=$1, description=$2, due_date=$3
     WHERE todos.id = $4
     RETURNING todos.id, title, done_date, due_date, description, user_id`,
    [title, description, dueDate, todoId]
  );
  return res.rows[0];
}

export async function deleteTodo(todoId) {
  const res = await pool.query(
    "DELETE FROM habit_tracker.todos WHERE todos.id = $1",
    [todoId]
  );
  return res.rowCount;
}

export async function updateDoneDate(todoId, doneDate) {
  const res = await pool.query(
    `UPDATE habit_tracker.todos
     SET done_date = $1
     WHERE todos.id = $2
     RETURNING todos.id, title, done_date, due_date, description, user_id`,
    [doneDate, todoId]
  );
  return res.rowCount;
}

export async function deleteTodosOlderThan7Days(userId) {

  const today = new Date()
  const doneDate = new Date()
  doneDate.setDate(today.getDate() - 7)
  doneDate.setHours(0, 0, 0, 0);

  const res = await pool.query(
    `DELETE FROM habit_tracker.todos 
     WHERE todos.id = $1 and done_date <= $2
     RETURNING todos.id`,
    [userId, doneDate]
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

export async function bulkCreateTodos(userId, todos, client ) {
  if (todos.length === 0) return [];
  
  const values = todos.map((_, index) => {
    const offset = index * 6;
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
  }).join(', ');
  
  const params = todos.flatMap(todo => [
    randomUUID(),
    userId,
    todo.title,
    todo.description || null,
    todo.due_date || null,
    todo.done_date || null
  ]);
  
  const query = `
    INSERT INTO habit_tracker.todos (id, user_id, title, description, due_date, done_date)
    VALUES ${values}
    RETURNING id, title, done_date, due_date, description, user_id
  `;
  
  const res = await client.query(query, params);
  return res.rows;
}
