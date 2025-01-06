// server/optionsserver.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: 'wd.etsisi.upm.es',
    port: 3306,
    user: 'class',
    password: 'Class24_25',
    database: 'marsbd'
});

// Test database connection
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database successfully');
});

// Routes for preferences
app.get('/preferences/:username', (req, res) => {
    const { username } = req.params;
    
    const query = 'SELECT ufos, time FROM prefView WHERE user = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.json({ ufos: 3, time: 60 }); // Default values
        }
        
        res.json(results[0]);
    });
});

app.post('/preferences/:username', (req, res) => {
    const { username } = req.params;
    const { ufos, time } = req.body;
    
    const query = 'UPDATE prefView SET ufos = ?, time = ? WHERE user = ?';
    db.query(query, [ufos, time, username], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ message: 'Preferences updated successfully' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});