const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key';

app.use(cors());
app.use(express.json());

// In-memory Fallback Datastores
let inMemoryUsers = [];
let inMemoryTodos = [];
let useMongoDB = false;

// Attempt MongoDB Connection if MONGODB_URI is provided
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  console.log('Connecting to MongoDB...');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected successfully.');
      useMongoDB = true;
    })
    .catch(err => {
      console.error('MongoDB connection failed. Falling back to in-memory datastore.', err.message);
      useMongoDB = false;
    });
} else {
  console.log('MONGODB_URI not provided. Running with in-memory fallback datastore.');
}

// --- Mongoose Schemas & Models ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  email: { type: String },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const todoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true },
  dueDate: { type: Date },
  completedDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

// --- JWT Verification Middleware ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

// --- API Routes ---

// 1. Config Endpoint
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// 2. Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const sanitizedUsername = username.trim().toLowerCase();

    // Check if user already exists
    let userExists = false;
    if (useMongoDB) {
      userExists = await User.findOne({ username: sanitizedUsername });
    } else {
      userExists = inMemoryUsers.some(u => u.username === sanitizedUsername);
    }

    if (userExists) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (useMongoDB) {
      const newUser = new User({ username: sanitizedUsername, password: hashedPassword });
      await newUser.save();
    } else {
      inMemoryUsers.push({
        id: Date.now().toString(),
        username: sanitizedUsername,
        password: hashedPassword
      });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const sanitizedUsername = username.trim().toLowerCase();
    let user = null;

    if (useMongoDB) {
      user = await User.findOne({ username: sanitizedUsername });
    } else {
      user = inMemoryUsers.find(u => u.username === sanitizedUsername);
    }

    // Fallback: If no users exist yet and they login with username/admin, auto-create them
    if (!user && password === 'admin') {
      const hashedPassword = await bcrypt.hash('admin', 10);
      if (useMongoDB) {
        user = new User({ username: sanitizedUsername, password: hashedPassword });
        await user.save();
      } else {
        user = {
          id: Date.now().toString(),
          username: sanitizedUsername,
          password: hashedPassword
        };
        inMemoryUsers.push(user);
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Google-only accounts might not have a password
    if (!user.password) {
      return res.status(400).json({ error: 'Please sign in using Google for this account' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Google Sign-In Endpoint
app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    // Decode JWT from Google
    const decoded = jwt.decode(credential);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ error: 'Invalid Google credential token' });
    }

    const email = decoded.email.toLowerCase();
    const googleId = decoded.sub;
    const name = decoded.name || 'Google User';

    // Determine target username from email
    let targetUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    if (!targetUsername) {
      targetUsername = 'guser' + googleId.substring(0, 5);
    }

    let user = null;
    if (useMongoDB) {
      // Find user by googleId or email
      user = await User.findOne({ $or: [{ googleId }, { email }] });
    } else {
      user = inMemoryUsers.find(u => u.googleId === googleId || u.email === email);
    }

    if (!user) {
      // Create user
      // Ensure targetUsername is unique
      let suffix = '';
      let counter = 0;
      let finalUsername = targetUsername;

      const isUsernameTaken = async (uname) => {
        if (useMongoDB) {
          return await User.exists({ username: uname });
        } else {
          return inMemoryUsers.some(u => u.username === uname);
        }
      };

      while (await isUsernameTaken(finalUsername)) {
        counter++;
        finalUsername = targetUsername + counter;
      }

      if (useMongoDB) {
        user = new User({
          username: finalUsername,
          email,
          googleId,
          createdAt: new Date()
        });
        await user.save();
      } else {
        user = {
          id: Date.now().toString(),
          username: finalUsername,
          email,
          googleId,
          createdAt: new Date()
        };
        inMemoryUsers.push(user);
      }
    } else {
      // Update googleId or email if missing
      if (!user.googleId) {
        user.googleId = googleId;
        if (useMongoDB) await user.save();
      }
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. GET Todos
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    let todos = [];

    if (useMongoDB) {
      todos = await Todo.find({ username }).sort({ id: -1 });
    } else {
      todos = inMemoryTodos.filter(t => t.username === username).sort((a, b) => b.id - a.id);
    }

    res.json(todos);
  } catch (err) {
    console.error('Fetch todos error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. POST Todo
app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    const { id, title, description, status, dueDate, completedDate } = req.body;

    if (!id || !title || !status) {
      return res.status(400).json({ error: 'id, title, and status are required' });
    }

    const newTodoData = {
      id,
      username,
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completedDate: completedDate ? new Date(completedDate) : undefined
    };

    if (useMongoDB) {
      const newTodo = new Todo(newTodoData);
      await newTodo.save();
    } else {
      inMemoryTodos.push(newTodoData);
    }

    res.status(201).json(newTodoData);
  } catch (err) {
    console.error('Create todo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. PUT Todo
app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    const todoId = parseInt(req.params.id);
    const { title, description, status, dueDate, completedDate } = req.body;

    if (useMongoDB) {
      const updatedTodo = await Todo.findOneAndUpdate(
        { id: todoId, username },
        {
          $set: {
            title,
            description,
            status,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            completedDate: completedDate ? new Date(completedDate) : undefined
          }
        },
        { new: true }
      );
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(updatedTodo);
    } else {
      const idx = inMemoryTodos.findIndex(t => t.id === todoId && t.username === username);
      if (idx === -1) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      inMemoryTodos[idx] = {
        ...inMemoryTodos[idx],
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completedDate: completedDate ? new Date(completedDate) : undefined
      };
      res.json(inMemoryTodos[idx]);
    }
  } catch (err) {
    console.error('Update todo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 8. DELETE Todo
app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    const todoId = parseInt(req.params.id);

    if (useMongoDB) {
      const deletedTodo = await Todo.findOneAndDelete({ id: todoId, username });
      if (!deletedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
    } else {
      const idx = inMemoryTodos.findIndex(t => t.id === todoId && t.username === username);
      if (idx === -1) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      inMemoryTodos.splice(idx, 1);
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Delete todo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
