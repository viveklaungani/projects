(function() {
    'use strict';

    // --- 0. PREDEFINED EXERCISE DATA ---
    // GIFs sourced from Giphy and other public domain / openly licensed sources if possible.
    // Descriptions are general.
    const INITIAL_EXERCISES_DATA = [
        {
            id: 'bench_press',
            name: 'Bench Press',
            description: 'Targets chest, shoulders, and triceps. Lie on a bench, lower a barbell to your mid-chest, and press it back up.',
            gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmE5YWY1ZDUzM2YwZmM5YjA4Y2I4YjBiOGJmZDM2ODhmYTA1ZDNjYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BhKh9KNXz213sVLncx/giphy.gif',
            logs: [],
            lastDone: null,
            bestPerformance: null // { sets, reps, weight, volume, timestamp }
        },
        {
            id: 'barbell_squat',
            name: 'Barbell Squat',
            description: 'A compound exercise for legs and glutes. Place a barbell on your upper back, squat down as if sitting in a chair, keeping your back straight.',
            gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDZjZTE3MGY4ZGRiNTA0M2RkODNiMDU5ZTljM2RhNzAyZDM4MGM4MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B0l9l52Q3Gx2P83q2X/giphy.gif',
            logs: [],
            lastDone: null,
            bestPerformance: null
        },
        {
            id: 'deadlift',
            name: 'Deadlift',
            description: 'Works multiple muscle groups including back, legs, and glutes. Lift a barbell off the floor to hip level, keeping your back straight.',
            gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGNkYmFiZmRiMDhiNjg4YWVkMzFjZmE5ZTVmZDI5ZjgwNTgzZGViYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/c6MfzLMDtlU2I72g0m/giphy.gif',
            logs: [],
            lastDone: null,
            bestPerformance: null
        },
        {
            id: 'overhead_press',
            name: 'Overhead Press (OHP)',
            description: 'Targets shoulders and triceps. Stand and press a barbell from your front shoulders overhead until arms are fully extended.',
            gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDdhNTgzZjM2MTA1NmNhMjQyYzc2MjhhNDU2Mjk5OWQ2YWY5Y2UwMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Q98ONYJ2sgWu8JKhDE/giphy.gif',
            logs: [],
            lastDone: null,
            bestPerformance: null
        },
        {
            id: 'bicep_curl_db',
            name: 'Dumbbell Bicep Curl',
            description: 'Isolates the biceps. Stand or sit, holding dumbbells with an underhand grip. Curl the dumbbells up towards your shoulders.',
            gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTViYjk0M2U0ZGQzYjE3NTMxMjg2MTg5MmM5NTM0MDZjZWMzOWUxMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Y2A2Ra3dJT2ihf7m0M/giphy.gif',
            logs: [],
            lastDone: null,
            bestPerformance: null
        }
    ];

    // --- 1. STATE MANAGEMENT ---
    let exercises = [];
    const STORAGE_KEY = 'fitnessTrackerExercises';

    // --- 2. DOM ELEMENT REFERENCES ---
    const exerciseListContainer = document.getElementById('exercise-list-container');

    // --- 3. CORE LOGIC FUNCTIONS ---

    function loadData() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            exercises = JSON.parse(storedData);
            // Ensure all exercises from INITIAL_EXERCISES_DATA are present, adding new ones if app was updated
            INITIAL_EXERCISES_DATA.forEach(initialEx => {
                if (!exercises.find(ex => ex.id === initialEx.id)) {
                    exercises.push(JSON.parse(JSON.stringify(initialEx))); // Add new exercise
                }
                // Ensure existing exercises have all properties from initial data (like description, gifUrl)
                const existingEx = exercises.find(ex => ex.id === initialEx.id);
                if (existingEx) {
                    existingEx.name = initialEx.name; // Keep name, desc, gif updated
                    existingEx.description = initialEx.description;
                    existingEx.gifUrl = initialEx.gifUrl;
                    if (!existingEx.logs) existingEx.logs = []; // Ensure logs array exists
                }
            });
        } else {
            // Deep copy initial data to prevent modification of the constant
            exercises = INITIAL_EXERCISES_DATA.map(ex => JSON.parse(JSON.stringify(ex)));
        }
        // Recalculate lastDone and bestPerformance for all exercises on load
        // This is important if the calculation logic changes or to fix old data.
        exercises.forEach(exercise => {
            updateLastDoneAndBestPerformance(exercise);
        });
        saveData(); // Save potentially updated data
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    }

    function formatTimestamp(isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function renderExercises() {
        exerciseListContainer.innerHTML = ''; // Clear existing content

        exercises.forEach(exercise => {
            const card = document.createElement('div');
            card.className = 'exercise-card';
            card.dataset.exerciseId = exercise.id;

            let lastDoneHtml = 'Never';
            if (exercise.lastDone) {
                lastDoneHtml = `Sets: ${exercise.lastDone.sets}, Reps: ${exercise.lastDone.reps}, Weight: ${exercise.lastDone.weight} kg (On: ${formatTimestamp(exercise.lastDone.timestamp)})`;
            }

            let bestPerfHtml = 'No data';
            if (exercise.bestPerformance) {
                bestPerfHtml = `Sets: ${exercise.bestPerformance.sets}, Reps: ${exercise.bestPerformance.reps}, Weight: ${exercise.bestPerformance.weight} kg (Volume: ${exercise.bestPerformance.volume.toFixed(2)}) (On: ${formatTimestamp(exercise.bestPerformance.timestamp)})`;
            }

            card.innerHTML = `
                <h2>${exercise.name}</h2>
                <div class="exercise-details">
                    <p>${exercise.description}</p>
                </div>
                <div class="gif-container">
                    <img src="${exercise.gifUrl}" alt="${exercise.name} GIF" loading="lazy">
                </div>

                <div class="stats">
                    <h4>Last Time Done:</h4>
                    <div class="last-done-info">${lastDoneHtml}</div>
                    <h4>Best Performance (Volume):</h4>
                    <div class="best-performance-info">${bestPerfHtml}</div>
                </div>

                <div class="log-form">
                    <h3>Log New Workout:</h3>
                    <label for="sets-${exercise.id}">Sets:</label>
                    <input type="number" id="sets-${exercise.id}" min="1" placeholder="3">
                    <label for="reps-${exercise.id}">Reps (per set):</label>
                    <input type="number" id="reps-${exercise.id}" min="1" placeholder="10">
                    <label for="weight-${exercise.id}">Weight (kg):</label>
                    <input type="number" id="weight-${exercise.id}" min="0" step="0.1" placeholder="50">
                    <button class="log-button">Log Workout</button>
                </div>
            `;
            exerciseListContainer.appendChild(card);
        });
    }


    function updateLastDoneAndBestPerformance(exercise) {
        if (exercise.logs && exercise.logs.length > 0) {
            // Sort logs by timestamp to find the latest
            exercise.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const lastLog = exercise.logs[0];
            exercise.lastDone = {
                sets: lastLog.sets,
                reps: lastLog.reps,
                weight: lastLog.weight,
                timestamp: lastLog.timestamp
            };

            // Calculate best performance (max volume)
            let bestLog = null;
            exercise.logs.forEach(log => {
                // Ensure volume is calculated if not present (for older data)
                if (log.volume === undefined) {
                     log.volume = parseFloat(log.sets) * parseFloat(log.reps) * parseFloat(log.weight);
                }
                if (!bestLog || log.volume > bestLog.volume) {
                    bestLog = log;
                }
            });
            exercise.bestPerformance = bestLog ? {
                sets: bestLog.sets,
                reps: bestLog.reps,
                weight: bestLog.weight,
                volume: bestLog.volume,
                timestamp: bestLog.timestamp
            } : null;

        } else {
            exercise.lastDone = null;
            exercise.bestPerformance = null;
        }
    }


    function handleLogWorkout(event) {
        if (!event.target.classList.contains('log-button')) {
            return; // Only process clicks on log buttons
        }

        const card = event.target.closest('.exercise-card');
        const exerciseId = card.dataset.exerciseId;

        const setsInput = card.querySelector(`#sets-${exerciseId}`);
        const repsInput = card.querySelector(`#reps-${exerciseId}`);
        const weightInput = card.querySelector(`#weight-${exerciseId}`);

        const sets = parseInt(setsInput.value);
        const reps = parseInt(repsInput.value);
        const weight = parseFloat(weightInput.value);

        if (isNaN(sets) || sets <= 0 || isNaN(reps) || reps <= 0 || isNaN(weight) || weight < 0) {
            alert('Please enter valid numbers for sets, reps, and weight. Weight can be 0.');
            return;
        }

        const exercise = exercises.find(ex => ex.id === exerciseId);
        if (!exercise) {
            console.error('Exercise not found for logging:', exerciseId);
            return;
        }

        const newLog = {
            timestamp: new Date().toISOString(),
            sets: sets,
            reps: reps,
            weight: weight,
            volume: sets * reps * weight
        };

        if (!exercise.logs) {
            exercise.logs = [];
        }
        exercise.logs.push(newLog);

        // Update last done and best performance
        updateLastDoneAndBestPerformance(exercise);

        saveData();
        renderExercises(); // Re-render to show updated stats and clear inputs (implicitly)

        // Clear input fields manually as re-render replaces them
        // This might not be strictly necessary if render correctly rebuilds all inputs blank,
        // but good for explicit control.
        setsInput.value = '';
        repsInput.value = '';
        weightInput.value = '';
    }


    // --- 4. EVENT LISTENERS ---
    // Using event delegation on the container for log buttons
    exerciseListContainer.addEventListener('click', handleLogWorkout);


    // --- 5. INITIALIZATION ---
    function init() {
        loadData();
        renderExercises();
    }

    // Start the app
    init();

})();
