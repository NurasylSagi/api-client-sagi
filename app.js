const API_URL = "https://pokeapi.co/api/v2/pokemon";

const pokemonList = document.getElementById("pokemon-list");
const pokemonDetails = document.getElementById("pokemon-details");
const compareList = document.getElementById("compare-list");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");

function showLoading(isLoading) {
    loadingElement.hidden = !isLoading;
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.hidden = false;
}

function clearError() {
    errorElement.textContent = "";
    errorElement.hidden = true;
}

// Fetch data from the API
async function fetchPokemon(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
}

// Display a Pokémon card
function createPokemonCard(pokemon) {
    const card = document.createElement("div");
    card.className = "pokemon-card";

    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>ID: ${pokemon.id}</p>
        <button data-id="${pokemon.id}">View Details</button>
    `;

    return card;
}

// Load initial Pokémon list
async function loadPokemonList() {
    showLoading(true);
    clearError();

    try {
        const data = await fetchPokemon(`${API_URL}?limit=12`);

        pokemonList.innerHTML = "";

        const pokemon = await Promise.all(
            data.results.map(item => fetchPokemon(item.url))
        );

        pokemon.forEach(item => {
            pokemonList.appendChild(createPokemonCard(item));
        });
    } catch (error) {
        showError("Could not load Pokémon. Check your internet connection.");
    } finally {
        showLoading(false);
    }
}

// Search Pokémon by name or ID
searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim().toLowerCase();

    if (query === "") {
        showError("Please enter a Pokémon name or ID.");
        return;
    }

    showLoading(true);
    clearError();

    try {
        const pokemon = await fetchPokemon(
            `${API_URL}/${encodeURIComponent(query)}`
        );

        pokemonList.innerHTML = "";
        pokemonList.appendChild(createPokemonCard(pokemon));
    } catch (error) {
        pokemonList.innerHTML = "";
        showError("Pokémon not found or network error.");
    } finally {
        showLoading(false);
    }
});

// Event delegation for detail buttons
pokemonList.addEventListener("click", async (event) => {
    if (!event.target.matches("button[data-id]")) {
        return;
    }

    const id = event.target.dataset.id;

    showLoading(true);
    clearError();

    try {
        const pokemon = await fetchPokemon(`${API_URL}/${id}`);

        pokemonDetails.innerHTML = `
            <h3>${pokemon.name}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Height: ${pokemon.height}</p>
            <p>Weight: ${pokemon.weight}</p>
            <p>Types: ${pokemon.types.map(type => type.type.name).join(", ")}</p>
        `;
    } catch (error) {
        showError("Could not load Pokémon details.");
    } finally {
        showLoading(false);
    }
});

// Two parallel requests using Promise.all
async function loadTwoPokemon() {
    try {
        const [pikachu, charmander] = await Promise.all([
            fetchPokemon(`${API_URL}/pikachu`),
            fetchPokemon(`${API_URL}/charmander`)
        ]);

        compareList.innerHTML = "";
        compareList.appendChild(createPokemonCard(pikachu));
        compareList.appendChild(createPokemonCard(charmander));
    } catch (error) {
        showError("Could not load comparison Pokémon.");
    }
}

loadPokemonList();
loadTwoPokemon();