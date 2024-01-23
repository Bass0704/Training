const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();


const port = 5000;
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

// employeedetails Employee

app.post('/api/signup', (req, res) => {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }  
  
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Unsupported Media Type' });
    } 
    const  { EmployerID,Username, EmailID, Password} = req.body;

    if (!EmployerID || !Username || !EmailID || !Password) {
      return res.status(400).json({ error: 'All fields are required' });  
    }
   
    if (!/^[a-zA-Z\s]+$/.test(Username)) {
      return res.status(400).json({ error: 'username should not contain special characters or numbers' });
    }
    if (Password.length < 8 || !/[a-zA-Z]/.test(Password) || !/\d/.test(Password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(Password)){
      return res.status(400).json({ error: 'Password must meet minimum security requirements' });
    }
    if (!/\S+@\S+\.\S+/.test(EmailID)) {
      return res.status(400).json({ error: 'Invalid email format' });
    } 
    const checkEmailQuery = 'SELECT * FROM employeedetails WHERE EmailID = ?';
  db.query(checkEmailQuery, [EmailID], (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      res.status(500).send('Internal Server Error');
    } else if (results.length > 0) {
      res.status(400).json({ error: 'Email address already exists' });
    } else {
  
    
     const query = 'INSERT INTO employeedetails (EmployerID,Username, EmailID, Password,CreatedOn) VALUES (?,?, ?, ?,NOW())';

    db.query(query, [EmployerID,Username, EmailID, Password], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error creating item');
      } else {
        console.log('Employee created successfully');
        res.status(201).json({ id: results.insertId,  EmployerID,Username, EmailID, Password });
      }
    }); 
  }
  });  
});   
 
// Login Employee:  

     app.post('/api/login', (req, res) => { 
        const { EmailID, Password } = req.body;
        if (!EmailID || !Password) {
          return res.status(400).json({ message:'EmailID and Password are required'});
        }
        const query = 'SELECT * FROM employeedetails WHERE EmailID = ? AND Password = ?';
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
 
// Get Single Employee:      
  
app.get('/api/getoneEmployee', (req, res) => {
  const Employee = req.query.EmployerId
  console.log(Employee)

  db.query('SELECT * FROM employeedetails WHERE EmployerId = ?', [Employee], (err, results) => {
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
  db.query('SELECT * FROM employeedetails', (err, results) => { 
   if (err) {
       console.error('MySQL query error:', err);
       return res.status(500).json({ error: 'Internal Server Error' });
       }
     
       return res.status(200).json(results);
       });
     }); 


// DeleteEmployee     

     app.delete('/api/deleteEmployee', (req, resp) => {
     
      var id = req.query.EmployerId;
      
          db.query('DELETE FROM employeedetails WHERE EmployerId= ?', [id],
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
  const EmpID = req.query.EmployerId  
 

  const {Username,  Password} = req.body;
  if (!Username  || !Password) {
    return res.status(400).json({ error: 'All fields are required' });  
  }     
 
  if (!/^[a-zA-Z\s]+$/.test(Username)) {
    return res.status(400).json({ error: 'username should not contain special characters or numbers' });
  }
  if (Password.length < 8 || !/[a-zA-Z]/.test(Password) || !/\d/.test(Password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(Password)) {
    return res.status(400).json({ error: 'Password must meet minimum security requirements' });
  } 
    
   

  db.query(
     'UPDATE employeedetails SET Username=?,  Password=? WHERE EmployerId=?', 
    [Username,  Password,EmpID],(err, result) => {
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
  
  


  //Leave
  app.post('/leaveRequest', (req, res) => {
    const { EmployerId, From_date, To_date,Reason_for_leave,Manager_name } = req.body;
  
    const leaveDuration = calculateLeaveDuration(From_date, To_date);
  
    const insertLeaveQuery = 'INSERT INTO leaveduration (EmployerId, From_date, To_date,Reason_for_leave,Manager_name,duration) VALUES (?, ?, ?,?,?,?)';
    db.query(insertLeaveQuery, [EmployerId, From_date, To_date,Reason_for_leave,Manager_name,leaveDuration], (err, result) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(201).json({ leaveDuration });
      }
    });
  });
  app.get('/leavedetails', (req, res) => {
    const ID = req.query.EmployerId;  
  
    const sql = 'SELECT From_date, To_date,Reason_for_leave,Manager_name FROM leaveduration WHERE EmployerId = ?';
    db.query(sql, [ID], (error, results) => {
      if (error) {
        console.error('Error retrieving leave details: ' + error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }  
  
      const { From_date, To_date,Reason_for_leave,Manager_name } = results[0];
      const duration = calculateLeaveDuration(From_date, To_date);
  
      return res.status(200).json({ message: 'Duration', LeaveDays: duration,From:From_date,To:To_date,Reason:Reason_for_leave,Manager:Manager_name});
      
    });       
  });
  
  function calculateLeaveDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    const leaveDurationDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return leaveDurationDays;
  } 
   
         
    
      function calculateLeaveDuration(startDate, endDate) {
     
      const startMoment = new Date(startDate);
      const endMoment = new Date(endDate);
      const LeaveDays = endMoment - startMoment;
      const durationInDays = LeaveDays / (1000 * 60 * 60 * 24);
      return durationInDays;
    }   


 //Listen and serve port

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`); 
      });  
       
 
