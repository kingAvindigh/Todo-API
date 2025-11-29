// app.js
app =require('dotenv')
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();


// In-memory store
let todos = [
 { id: 1, task: 'build the API', completed: '' },
 { id: 2, task: 'deploy to render', completed: ''},
{ id: 3, task: 'profit', completed: 'true' }
];
let idCounter = 1;

// Encryption setup
const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32); // In production, load from .env
const iv = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Routes

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Create a new todo
app.post('/todos', (req, res) => {
  const { task } = req.body;

  if (!task || task.trim() === '') {
    return res.status(400).json({ error: 'Task is required and cannot be empty' });
  }

  const encryptedTask = encrypt(task);
  const encryptedCompleted = encrypt(false); // always false by default

  const newTodo = { id: idCounter++, task: encryptedTask, completed: encryptedCompleted };
  todos.push(newTodo);

  res.status(201).json(newTodo);
});

// Update a todo
app.put('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  const { task, completed } = req.body;

  if (task !== undefined) {
    if (task.trim() === '') {
      return res.status(400).json({ error: 'Task cannot be empty' });
    }
    todo.task = encrypt(task);
  }

  if (completed !== undefined) {
    todo.completed = encrypt(completed);
  }

  res.json(todo);
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });

  const deleted = todos.splice(index, 1);
  res.json(deleted[0]);
});

// Start server


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API live on:${PORT}`);
});






