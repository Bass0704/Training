const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bass@7499',
  database: 'mymam',
});


db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
}); 
app.use(bodyParser.json());
app.post('/api/signup', (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      } 
    
      if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Unsupported Media Type' });
      }
      const  { username, email, phoneNumber, password } = req.body;

      if (!username || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
    
      if (!/^[a-zA-Z\s]+$/.test(username)) {
        return res.status(400).json({ error: 'username should not contain special characters or numbers' });
      }
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) {
        return res.status(400).json({ error: 'Password must meet minimum security requirements' });
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    
      if (!/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
      
      const query = 'INSERT INTO users (username, password, email,phoneNumber) VALUES (?, ?, ?,?)';
      db.query(query, [username, password, email,phoneNumber], (err, result) => {
        if (err) {
          console.error('Error executing MySQL query: ' + err.stack);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
    
        return res.status(201).json({ message: 'User successfully registered.' });
      });
      
  });   
  
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) { 
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      return res.status(200).json({ message: 'Login successful', user: results[0] });
    });
  });

app.get('/api/allusers', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    return res.status(200).json(results);
  });
});

app.put('/api/update', (req, res) => {
  const id = req.params.id;
  const { username, email, phoneNumber, password } = req.body;

  db.query(
    'UPDATE users SET username=?, email=?, phoneNumber=?, password=? WHERE username=?',
    [username, email, phoneNumber, password],
    (err) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      return res.status(200).json({ message: 'User updated successfully' });
    }
  );
});
app.delete('/api/delete', (req, res) => {
  const username = req.params.username;

  db.query('DELETE FROM users WHERE username=?', [username], (err) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
          