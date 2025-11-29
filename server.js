const express = require('express');

// Import the fetchMeals helper function
const { fetchMeals } = require('./helpers/fetchMeals');

// Import the fetchDrinks helper function
const { fetchDrinks } = require('./helpers/fetchDrinks');

// Initialize Express app
const app = express();
const PORT = 3000;

// Serve static files from "public" folder
app.use(express.static('public'));

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Home route
app.get('/', async (req, res) => {
    try {
        // Fetch meals and drinks data using the helper functions
        const meals = await fetchMeals();
        meals.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
        const drinks = await fetchDrinks();
        drinks.sort((a, b) => a.strDrink.localeCompare(b.strDrink));
        res.render("index", {
            meals: meals,
            drinks: drinks
        });
    } catch (error) {
        res.status(500).send('Error fetching meals data');
    }
});

// Meals route to return JSON data
app.get('/meals', async (req, res) => {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching meals data');
    }
});

// Drinks route to return JSON data
app.get('/drinks', async (req, res) => {
    try {
        const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/search.php?f=a');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching meals data');
    }
});

// Search route
app.get("/search", async (req, res) => {
    const q = req.query.q?.trim().toLowerCase();

    // if query empty → show full lists
    if (!q) {
        const meals = await fetchMeals();
        const drinks = await fetchDrinks();

        return res.render("search-results", {
            foundMeal: null,
            foundDrink: null,
            meals,
            drinks,
            q
        });
    }

    // Fetch full lists only once
    const meals = await fetchMeals();
    const drinks = await fetchDrinks();

    // EXACT MATCH (case-insensitive)
    const foundMeal = meals.find(m => m.strMeal.toLowerCase() === q);
    const foundDrink = drinks.find(d => d.strDrink.toLowerCase() === q);

    // If nothing exact-match → show list page again
    if (!foundMeal && !foundDrink) {
        return res.render("search-results", {
            foundMeal: null,
            foundDrink: null,
            meals,
            drinks,
            q
        });
    }

    // Otherwise show exact result
    res.render("search-results", {
        foundMeal,
        foundDrink,
        meals,
        drinks,
        q
    });
});

// Single meal route
app.get("/meal/:id", async (req, res) => {
    const id = req.params.id;

    const meals = await fetchMeals();
    const drinks = await fetchDrinks();
    const data = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const json = await data.json();

    const meal = json.meals ? json.meals[0] : null;

    res.render("partials/single-meal", { meal, meals, drinks });
});


//single drink route
app.get("/drink/:id", async (req, res) => {
    const id = req.params.id;

    const meals = await fetchMeals();
    const drinks = await fetchDrinks();
    const data = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
    const json = await data.json();

    const drink = json.drinks ? json.drinks[0] : null;

    res.render("partials/single-drink", { drink, meals, drinks });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});