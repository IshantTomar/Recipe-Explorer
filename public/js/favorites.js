// favorites.js
// Handles adding favorites from single pages and rendering favorites on index

// utility: get favorites array from localStorage
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch (e) {
        return [];
    }
}

// utility: save favorites array to localStorage
function saveFavorites(list) {
    localStorage.setItem("favorites", JSON.stringify(list));
}

// Add a favorite item (object: { id, name, thumb, type })
function addFavorite(item) {
    const list = getFavorites();
    if (!list.some(f => f.id === item.id && f.type === item.type)) {
        list.push(item);
        saveFavorites(list);
        return true;
    }
    return false;
}

// Remove a favorite by id+type
function removeFavorite(id, type) {
    let list = getFavorites();
    list = list.filter(f => !(f.id === id && f.type === type));
    saveFavorites(list);
    return list;
}

// Render favorites into container element for given type ('meal' or 'drink')
function renderFavoritesTo(containerSelector, type) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const list = getFavorites().filter(f => f.type === type);
    if (!list.length) {
        container.innerHTML = `<p>No favorites yet.</p>`;
        return;
    }

    container.innerHTML = list.map(item => `
    <a class="fav-card" href="/${type}/${item.id}">
      <img src="${item.thumb}" alt="${item.name}">
      <p>${item.name}</p>
    </a>
  `).join("");
}

// Called on single pages to wire the favorite button (button must have id)
function wireSingleFavoriteButton(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener("click", () => {
        const item = {
            id: btn.dataset.id,
            name: btn.dataset.name,
            thumb: btn.dataset.thumb,
            type: btn.dataset.type // 'meal' or 'drink'
        };

        const added = addFavorite(item);
        if (added) {
            btn.textContent = "❤️ Added to Favorites";
            btn.disabled = true;
        } else {
            btn.textContent = "✅ Already in Favorites";
            btn.disabled = true;
        }
    });
}

// On index page: populate both favorites rows
function initIndexFavorites() {
    renderFavoritesTo("#favorite-meals", "meal");
    renderFavoritesTo("#favorite-drinks", "drink");
}

// Expose functions globally for inline calls
window.favHelpers = {
    wireSingleFavoriteButton,
    initIndexFavorites,
    addFavorite,
    removeFavorite,
    getFavorites
};
