const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();

let GEMINI_API_KEY = 'AIzaSyBECfb52p0lSx9qD-ddjX4yCdSrV_HJ4L4';

// Enable CORS for all routes with specific origin
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Ensure this matches your frontend URL
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.post('/generate-workout', async (req, res) => {
    const { exercises, skillLevel } = req.body;

    try {
        console.log('Received request to generate workout plan');
        console.log('Exercises:', exercises);
        console.log('Skill Level:', skillLevel);

        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // Replace with your actual API key
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Use 'gemini-1.5-flash' model

        // Create a detailed prompt
        const prompt = `Generate a workout plan using the following exercises: ${exercises.map(ex => ex.name).join(', ')}. 
            Include sets, reps, and rest periods. Format as HTML paragraphs.`;

        console.log('Sending prompt to Google Generative AI:', prompt);

        // Generate content
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Send the generated workout plan as JSON
        res.json({ 
            workoutPlan: text,
            status: 'success'
        });
    } catch (error) {
        console.error('Error generating workout plan:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack // Include stack trace for debugging
        });
    }
});

// Start the server on port 3005
const port = 3005;
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Exiting...`);
        process.exit(1); // Exit the process with an error code
    } else {
        throw err;
    }
});