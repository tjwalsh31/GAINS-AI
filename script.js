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
    
        // Get user inputs
        const selectedBodyParts = Array.from(document.querySelectorAll('input[name="bodyPart"]:checked')).map(checkbox => checkbox.value);
        const skillLevel = document.getElementById('skillLevel').value;
    
        try {
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
    
            // Filter exercises based on skill level
            const filteredExercises = allExercises.filter(exercise => {
                const matchesSkillLevel = (skillLevel === 'advanced') ||
                                         (skillLevel === 'intermediate' && exercise.difficulty !== 'advanced') ||
                                         (skillLevel === 'beginner' && exercise.difficulty === 'beginner');
                return matchesSkillLevel;
            });
    
            // Integrate with Gemini AI to refine the workout plan
            const aiSelectedExercises = await fetch('https://generativelanguage.googleapis.com', { // Replace with actual Gemini API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer AIzaSyCnxHgeTKwPqMyKhyYN3IT-wQiA2AAnaAs' // Replace with your actual API key
                },
                body: JSON.stringify({ exercises: filteredExercises, skillLevel: skillLevel })
            }).then(res => res.json());
    
            // Display the AI-selected exercises
            workoutOutput.innerHTML = aiSelectedExercises.map(exercise => `
                <div class="exercise">
                    <h3>${exercise.name}</h3>
                    <p>Body Part: ${exercise.bodyPart}</p>
                    <p>Equipment: ${exercise.equipment}</p>
                    <p>Target: ${exercise.target}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error generating workout plan:', error);
            workoutOutput.innerHTML = `<p>Failed to load workout plan. Please try again later.</p>`;
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