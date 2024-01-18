const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();


const port = 2000;
app.use(bodyParser.json());


// DB Credentials

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Leave@123',
  database: 'leaveportal',
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

// Signup Employee

app.post('/api/signup', (req, res) => {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    } 
  
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Unsupported Media Type' });
    }
    const  { Username, EmailID, Password} = req.body;

    if (!Username || !EmailID || !Password) {
      return res.status(400).json({ error: 'All fields are required' });  
    }
  
    if (!/^[a-zA-Z\s]+$/.test(Username)) {
      return res.status(400).json({ error: 'username should not contain special characters or numbers' });
    }
    if (Password.length < 8 || !/[a-zA-Z]/.test(Password) || !/\d/.test(Password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(Password)) {
      return res.status(400).json({ error: 'Password must meet minimum security requirements' });
    }
    if (!/\S+@\S+\.\S+/.test(EmailID)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
  
    
     const query = 'INSERT INTO signup (Username, EmailID, Password) VALUES (?, ?, ?)';

    db.query(query, [Username, EmailID, Password], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error creating item');
      } else {
        console.log('Employee created successfully');
        res.status(201).json({ id: results.insertId,  Username, EmailID, Password });
      }
    }); 
    
  });  

// Login Employee

     app.post('/api/Leavelogin', (req, res) => {
        const { EmailID, Password } = req.body;
        if (!EmailID || !Password) {
          return res.status(400).json({ message: 'EmailID and Password are required' });
        }
        const query = 'SELECT * FROM signup WHERE EmailID = ? AND Password = ?';
        db.query(query, [EmailID, Password], (err, results) => {
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

// Get Single Employee      
  
app.get('/api/getoneEmployee', (req, res) => {
  const Employee = req.query.EmployeeId
  console.log(Employee)

  db.query('SELECT * FROM signup WHERE EmployeeId = ?', [Employee], (err, results) => {
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

//GetAllEmployee      
app.get('/api/allEmployee', (req, res) => {
  db.query('SELECT * FROM signup', (err, results) => { 
   if (err) {
       console.error('MySQL query error:', err);
       return res.status(500).json({ error: 'Internal Server Error' });
       }
     
       return res.status(200).json(results);
       });
     }); 


// DeleteEmployee    

     app.delete('/api/deleteEmployee', (req, resp) => {
     
      var id = req.query.EmployeeId;
      
          db.query('DELETE FROM signup WHERE EmployeeId= ?', [id],
              function(error, rows) {
                  if (!error) {
                      console.log('Successfully Deleted!');
                      resp.json(rows);    
                  }
                  else {
                      console.log('Error in deleting');
                  }
              });
      
            });  

 //UpdateEmployee      

 app.put('/api/updateEmployee', (req, res) => {
  const EmpID = req.query.EmployeeId  
 

  const {Username, EmailID, Password} = req.body;
  if (!Username || !EmailID || !Password) {
    return res.status(400).json({ error: 'All fields are required' });  
  }    

  if (!/^[a-zA-Z\s]+$/.test(Username)) {
    return res.status(400).json({ error: 'username should not contain special characters or numbers' });
  }
  if (Password.length < 8 || !/[a-zA-Z]/.test(Password) || !/\d/.test(Password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(Password)) {
    return res.status(400).json({ error: 'Password must meet minimum security requirements' });
  }
  if (!/\S+@\S+\.\S+/.test(EmailID)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }


  db.query(
    'UPDATE signup SET Username=?, EmailID=?, Password=? WHERE EmployeeId=?',
    [Username, EmailID, Password,EmpID],(err, result) => {
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


 //Listen and serve port

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      });    