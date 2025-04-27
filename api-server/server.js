const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Configure CORS to allow requests from specific origins
const corsOptions = {
    //origin: 'http://localhost:9090', // Allow requests from http://localhost:9090
    origin: '*',
    methods: 'GET,POST', // Allow GET and POST methods
    allowedHeaders: 'Content-Type', // Allow Content-Type header
    optionsSuccessStatus: 200 // Respond to preflight requests with 200 status
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions)); // Enable preflight requests for all routes

// In-memory storage for ages
const ages = {
  Alex: 22,
  Anna: 33,
  Beppo: 44,
  Benno: 55,
  Willy: 66
};

// GET endpoint to get age by name
app.get('/age/:name', (req, res) => {
    const name = req.params.name;
    if (ages[name]) {
        res.json({ name, age: ages[name] });
    } else {
        res.status(404).json({ error: 'Name not found' });
    }
});

// POST endpoint to set age for a name
app.post('/age', (req, res) => {
    const { name, age } = req.body;
    if (!name || !age) {
        return res.status(400).json({ error: 'Name and age are required' });
    }
    ages[name] = age;
    res.status(201).json({ name, age });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
