
document.getElementById('workout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const exercises = document.getElementById('exercises').value.split(',');
    const skillLevel = document.getElementById('skillLevel').value;

    const response = await fetch('/generate-workout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ exercises, skillLevel })
    });

    const data = await response.json();
    document.getElementById('workout-result').innerHTML = data.workoutPlan;
});

document.getElementById('meal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dietaryRestrictions = document.getElementById('dietaryRestrictions').value.split(',');
    const favoriteFoods = document.getElementById('favoriteFoods').value.split(',');
    const calories = document.getElementById('calories').value;
    const protein = document.getElementById('protein').value;

    const response = await fetch('/generate-meal-plan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dietaryRestrictions, favoriteFoods, calories, protein })
    });

    const data = await response.json();
    document.getElementById('meal-result').innerHTML = data.mealPlan;
});
