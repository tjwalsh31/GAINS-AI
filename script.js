function changeTab(tabName) {
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(tab => tab.style.display = 'none');

    // Remove the "active" class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show the selected tab content
    document.getElementById(tabName).style.display = 'block';

    // Add the "active" class to the clicked tab
    document.querySelector(`[onclick="changeTab('${tabName}')"]`).classList.add('active');
}

// Open the default tab on page load
document.getElementById('defaultOpen').click();

async function generateMealPlan() {
    const mealOutput = document.getElementById('meal-output');
    mealOutput.innerHTML = `<p>Loading your AI-generated meal plan...</p>`;

    const dietaryRestrictions = Array.from(document.querySelectorAll('input[name="dietaryRestriction"]:checked')).map(checkbox => checkbox.value);
    const favoriteFoods = document.getElementById('favoriteFoods').value.split(',').map(food => food.trim());
    const calories = document.getElementById('calories').value;
    const protein = document.getElementById('protein').value;

    try {
        console.log('Sending request to Node.js server to generate meal plan');
        // Call the Node.js server to generate the meal plan
        const response = await fetch('http://localhost:3005/generate-meal-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dietaryRestrictions, favoriteFoods, calories, protein })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate meal plan: ${response.statusText}`);
        }

        // Parse the response as JSON
        const data = await response.json();
        console.log('Received meal plan from Node.js server:', data.mealPlan);

        // Display the meal plan
        mealOutput.innerHTML = `
            <div class="meal-plan">
                <h3>Your AI-Generated Meal Plan:</h3>
                <p>${data.mealPlan}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error generating meal plan:', error);
        mealOutput.innerHTML = `
            <p>Failed to load meal plan. Please try again later.</p>
            <p>Error: ${error.message}</p>
        `;
    }
}

async function generateWorkout() {
    const workoutOutput = document.getElementById('workout-output');
    workoutOutput.innerHTML = `<p>Loading your AI-generated workout plan...</p>`;

    const selectedBodyParts = Array.from(document.querySelectorAll('input[name="bodyPart"]:checked')).map(checkbox => checkbox.value);
    const skillLevel = document.getElementById('skillLevel').value; // Get skill level value

    const prompt = `Generate a workout plan for the following body parts: ${selectedBodyParts.join(', ')}. Skill level: ${skillLevel}.`;

    try {
        console.log('Fetching exercises from ExerciseDB');
        // Fetch exercises for each selected body part from ExerciseDB
        let allExercises = [];
        for (const bodyPart of selectedBodyParts) {
            const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '69d48150d3msh8c3eb0b05f8a0abp1af5abjsn5e4218f69a42',
                    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch exercises for ${bodyPart}`);
            }

            const data = await response.json();
            allExercises = allExercises.concat(data);
        }

        console.log('Filtering exercises based on body part');
        // Filter exercises based on body part only
        const filteredExercises = allExercises.filter(exercise => selectedBodyParts.includes(exercise.bodyPart.toLowerCase()));

        console.log('Filtered Exercises:', filteredExercises);

        console.log('Sending request to Node.js server to generate workout plan');
        // Call the Node.js server to generate the workout plan
        const response = await fetch('http://localhost:3005/generate-workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ exercises: filteredExercises, skillLevel: skillLevel }) // Include skill level in the request
        });

        if (!response.ok) {
            throw new Error(`Failed to generate workout plan: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received workout plan from Node.js server:', data.workoutPlan);

        // Display the workout plan
        workoutOutput.innerHTML = `
            <div class="workout-plan">
                <h3>Your AI-Generated Workout Plan:</h3>
                <p>${data.workoutPlan}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error generating workout plan:', error);
        workoutOutput.innerHTML = `
            <p>Failed to load workout plan. Please try again later.</p>
            <p>Error: ${error.message}</p>
        `;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testListWorkouts(bodyPart, retries = 3, delayMs = 1000) {
    try {
        // Use the correct endpoint for the ExerciseDB API
        const url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'd47f788badmsh829fb15b0d01428p133b75jsn596099baedb4',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        };

        // Fetch data from the API
        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                console.warn(`Rate limit exceeded. Retrying in ${delayMs}ms...`);
                await delay(delayMs);
                return testListWorkouts(bodyPart, retries - 1, delayMs * 2); // Exponential backoff
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Log the exercises for the specified body part
        console.log(`Workouts for ${bodyPart}:`);
        data.forEach(exercise => {
            console.log(`- ${exercise.name}`);
        });
    } catch (error) {
        console.error(`Failed to load workouts for ${bodyPart}. Error: ${error.message}`);
    }
}

// Example usage:
//testListWorkouts('chest');
//testListWorkouts('waist');