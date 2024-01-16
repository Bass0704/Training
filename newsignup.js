const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// DB Credentials
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bass@7499',
  database: 'mymam',
});

//Db connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
  
}); 
app.use(bodyParser.json());

// Signup Users      

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

      db.query(query, [username, password, email,phoneNumber], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error creating item');
        } else {
          console.log('User created successfully');
          res.status(201).json({ id: results.insertId,  username, email, phoneNumber, password });
        }
      }); 
      
    });     

// Login Users       
   
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
    
// Get Single User      
  
    app.get('/api/getoneuser', (req, res) => {
      const userID = req.query.id
      console.log(userID)
    
      db.query('SELECT * FROM users WHERE id = ?', [userID], (err, results) => {
        if (err) {
          res.status(500).send('Error retrieving user');
        } else {
          if (results.length === 0) {
            res.status(404).send('user not found');
          } else {
            res.send(results[0]);
          }
        }
      });
    }); 

//Update User      

    app.put('/api/update', (req, res) => {
      const userID = req.query.id
     
    
      const {username, email, phoneNumber, password } = req.body;
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
      db.query(
        'UPDATE users SET username=?, email=?, phoneNumber=?, password=? WHERE id=?',
        [username, email, phoneNumber, password,userID],(err, result) => {
          if (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            if (result.affectedRows > 0) {
              res.json({ message: 'user updated successfully' });
            } else {
              res.status(404).json({ error: 'user not found' });
            }
          }
        });
      }); 
      
// Delete User      

     app.delete('/api/delete', (req, resp) => {
     
     var id = req.query.id;
     
         db.query('DELETE FROM users WHERE id = ?', [id],
             function(error, rows) {
                 if (!error) {
                     console.log('Successful deleted!');
                     resp.json(rows);    
                 }
                 else {
                     console.log('Error in deleting');
                 }
             });
     
           }); 
     
// Get All Users      
    app.get('/api/allusers', (req, res) => {
     db.query('SELECT * FROM users', (err, results) => { 
      if (err) {
          console.error('MySQL query error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
          }
        
          return res.status(200).json(results);
          });
        });      
    



//Listen and serve port
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      }); 
               
 