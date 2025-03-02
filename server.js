require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // Ensure node-fetch is imported correctly
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();

let GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Use the API key from the .env file
let EDAMAM_APP_ID = process.env.EDAMAM_APP_ID; // Edamam App ID from .env file
let EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY; // Edamam App Key from .env file
let EDAMAM_USER_ID = process.env.EDAMAM_USER_ID; // Edamam User ID from .env file

// Log environment variables to verify they are loaded correctly
console.log('GEMINI_API_KEY:', GEMINI_API_KEY);
console.log('EDAMAM_APP_ID:', EDAMAM_APP_ID);
console.log('EDAMAM_APP_KEY:', EDAMAM_APP_KEY);
console.log('EDAMAM_USER_ID:', EDAMAM_USER_ID);

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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Use 'gemini-1.5-pro' model

        // Create a detailed prompt
        const prompt = `Generate a ${skillLevel} workout plan using the following exercises: ${exercises.map(ex => ex.name).join(', ')}. 
            Include sets, reps, and rest periods. Format as HTML paragraphs.`;

        console.log('Sending prompt to Google Generative AI:', prompt);

        // Generate content
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Replace \n with <br> for HTML formatting
        text = text.replace(/\n/g, '<br>');

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

app.post('/generate-meal-plan', async (req, res) => {
    const { dietaryRestrictions, favoriteFoods, calories, protein } = req.body;

    try {
        console.log('Received request to generate meal plan');
        console.log('Dietary Restrictions:', dietaryRestrictions);
        console.log('Favorite Foods:', favoriteFoods);
        console.log('Calories:', calories);
        console.log('Protein:', protein);

        // Fetch recipes from Edamam API
        const edamamUrl = new URL('https://api.edamam.com/api/recipes/v2');
        edamamUrl.searchParams.append('type', 'public'); // Required parameter
        edamamUrl.searchParams.append('beta', 'true'); // Required parameter
        edamamUrl.searchParams.append('q', favoriteFoods.join(',')); // Search query
        edamamUrl.searchParams.append('app_id', EDAMAM_APP_ID); // App ID
        edamamUrl.searchParams.append('app_key', EDAMAM_APP_KEY); // App Key
        dietaryRestrictions.forEach(restriction => {
            edamamUrl.searchParams.append('health', restriction); // Dietary restrictions
        });
        if (calories) {
            edamamUrl.searchParams.append('calories', calories); // Calorie range
        }
        if (protein) {
            edamamUrl.searchParams.append('nutrients[PROCNT]', protein); // Protein range
        }

        const edamamResponse = await fetch(edamamUrl.toString(), {
            headers: {
                'Edamam-Account-User': EDAMAM_USER_ID
            }
        });
        if (!edamamResponse.ok) {
            const errorBody = await edamamResponse.text();
            console.error(`Failed to fetch recipes from Edamam API: ${edamamResponse.statusText}`);
            console.error(`Response body: ${errorBody}`);
            throw new Error(`Failed to fetch recipes from Edamam API: ${edamamResponse.statusText}`);
        }

        const edamamData = await edamamResponse.json();
        const recipes = edamamData.hits.map(hit => hit.recipe);

        console.log('Fetched recipes:', recipes);

        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // Replace with your actual API key
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Use 'gemini-1.5-pro' model

        // Create a detailed prompt
        const prompt = `Generate a 7-day meal plan using some of the following recipes: ${recipes.map(recipe => recipe.label).join(', ')}. 
            Include ingredients, preparation steps, macros, serving size, and other relevant nutritional information. You can choose from outside of the
            recipes as well. Just make sure that there is steak within the meal plan, almost every day. DO NOT USE THE GIVEN RECIPES EVERY MEAL!!!
            Ensure the meal plan meets the following requirements: ${calories} calories and ${protein} grams of protein per day. 
            Feel free to get creative and include different foods and meals that fit the dietary requirements. Format as HTML paragraphs.`;

        console.log('Sending prompt to Google Generative AI:', prompt);

        // Generate content
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        console.log('Generated meal plan:', text);

        // Replace \n with <br> for HTML formatting
        text = text.replace(/\n/g, '<br>');

        // Send the generated meal plan as JSON
        res.json({ 
            mealPlan: text,
            status: 'success'
        });
    } catch (error) {
        console.error('Error generating meal plan:', error);
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