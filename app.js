// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory todos store
let todos = [
  { id:"KA_1",task:"build API", completed:"false"},
  { id:"KA_2",task:"Test API", completed:"false"},
  { id:"KA_3",task:"deploy API", completed:"false"}

];
let todoCounter = 1; // ✅ define the counter globally

// Health check
// Get all todos from in-memory store
app.get('/todos', (req, res) => {
  res.json(todos);
});

// ----------------------
// 📝 Todos API
// ----------------------

// Get a single todo by ID
app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

// Add a new todo with sequential KA-IDs
app.post('/todos', (req, res) => {
  const { task } = req.body;   // ✅ use "task" instead of "text"
  if (!task) {
    return res.status(400).json({ error: 'Todo task is required' });
  }

  // Determine next ID
  let nextId;
  if (todos.length === 0) {
    nextId = "KA-1";
  } else {
    const lastTodo = todos[todos.length - 1];
    const parts = lastTodo.id.split('-');
    const lastNumber = Number(parts[1]);
    nextId = `KA-${isNaN(lastNumber) ? 1 : lastNumber + 1}`;
  }

  const newTodo = {
    id: nextId,
    task,            // ✅ store "task"
    completed: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Update a todo (PATCH for partial updates)
app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (task !== undefined) todo.task = task;
  if (completed !== undefined) todo.completed = completed;

  res.json(todo);
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  const deleted = todos.splice(index, 1);
  res.json(deleted[0]);
});

// ----------------------

// Port from .env (with fallback)
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});