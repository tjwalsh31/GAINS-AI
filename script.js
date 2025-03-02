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

function generateMealPlan() {
    const mealOutput = document.getElementById('meal-output');
    mealOutput.innerHTML = `<p>Your AI-generated meal plan will appear here.</p>`;
    // Call your API or logic here to generate the meal plan
}

async function generateWorkout() {
    const workoutOutput = document.getElementById('workout-output');
    workoutOutput.innerHTML = `<p>Loading your AI-generated workout plan...</p>`;

    const selectedBodyParts = Array.from(document.querySelectorAll('input[name="bodyPart"]:checked')).map(checkbox => checkbox.value);
    const skillLevel = document.getElementById('skillLevel').value;

    let intervalId = setInterval(() => {
        console.log('Still working on generating the workout plan...');
    }, 1000); // Log every second

    try {
        console.log('Fetching exercises from ExerciseDB');
        // Fetch exercises for each selected body part from ExerciseDB
        let allExercises = [];
        for (const bodyPart of selectedBodyParts) {
            const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'd47f788badmsh829fb15b0d01428p133b75jsn596099baedb4',
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
        // Filter exercises based on body part
        const filteredExercises = allExercises.filter(exercise => selectedBodyParts.includes(exercise.bodyPart));

        console.log('Filtered Exercises:', filteredExercises);

        console.log('Sending request to Node.js server to generate workout plan');
        // Call the Node.js server to generate the workout plan
        const response = await fetch('http://localhost:3005/generate-workout', { // Updated port number to 3005
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ exercises: filteredExercises, skillLevel: skillLevel })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate workout plan: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let workoutPlan = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            workoutPlan += decoder.decode(value, { stream: true });
            workoutOutput.innerHTML = `
                <div class="workout-plan">
                    <h3>Your AI-Generated Workout Plan:</h3>
                    <p>${workoutPlan}</p>
                </div>
            `;
        }

        console.log('Received workout plan from Node.js server:', workoutPlan);
    } catch (error) {
        console.error('Error generating workout plan:', error);
        workoutOutput.innerHTML = `<p>Failed to load workout plan. Please try again later.</p>`;
    } finally {
        clearInterval(intervalId); // Clear the interval when done
    }
}

async function testListWorkouts(bodyPart) {
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
testListWorkouts('chest');
testListWorkouts('waist');