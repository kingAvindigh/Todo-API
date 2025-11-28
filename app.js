require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json()); // Parse JSON bodies



// In-memory todos array
let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
  { id: 3, task: 'Test the API', completed: true },
];

// GET all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

app.get('/todos/active', (req, res) => {
  console.log('Fetching active todos');
  const activeTodos = todos.filter((t) => !t.completed, false);
  res.json(activeTodos);
});


// GET finished todos
app.get('/todos/completed', (req, res) => {
  const completedTodos = todos.filter((t) => t.completed,true);
  res.json(completedTodos);
});


// GET one todo by id
app.get('/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.json(todo);
});



/// Create a new todo
app.post('/todos', (req, res) => {
  const { task } = req.body;

  // Validation: must not be empty
  if (!task || task.trim() === '') {
    return res.status(400).json({ error: 'Task is required and cannot be empty' });
  }

  // Encrypt task before storing
  const encryptedTask = encrypt(task);

  const newTodo = { id: idCounter++, task: encryptedTask, completed: false };
  todos.push(newTodo);

  res.status(201).json(newTodo);
});



// PATCH update todo
app.patch('/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ message: 'Todo not found' });

  Object.assign(todo, req.body); // merge updates
  res.json(todo);
});

// DELETE remove todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id);

  if (todos.length === initialLength) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.status(204).send(); // no content
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Server error!' });
});

// Port
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`API live on ${PORT}`));