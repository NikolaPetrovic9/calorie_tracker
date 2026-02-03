// ========================================
// KALKULATOR KALORIJA - FINALNA VERZIJA
// SA FIREBASE INTEGRACIJOM
// ========================================

// Konstante
const CALORIES_PER_GRAM = {
    PROTEIN: 4,
    FAT: 9,
    CARBS: 4
};

const LOCAL_STORAGE_KEYS = {
    CURRENT_MEALS: 'currentMeals',
    CURRENT_MEAL_COUNT: 'currentMealCount',
    CALC_SETTINGS: 'calcSettings',
    // SAVED_MEALS ključ je uklonjen, sada se koristi Firebase
};

// ========================================
// FIREBASE PODEŠAVANJA
// ========================================
// Firebase konfiguracija se učitava iz `firebase-config.js` fajla,
// koji se mora uključiti u HTML pre ovog skripta.
// Taj fajl NE SME biti na javnom repozitorijumu.

// Inicijalizacija Firebase-a
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Globalne varijable
let foods = []; // Ova lista će se sada puniti iz Firebase-a
let meals = [];
let activeMealIndex = 0;
let dailyGoal = 0;
let currentMealCount = 3;
let savedMeals = [];

// Edit mode varijable
let currentlyEditingMealId = null;
let editWorkspaceItems = [];
let originalEditItems = [];

// Imena obroka
let initialFoodsLoaded = false;
let initialSavedMealsLoaded = false;

const mealNames = {
    3: ['Doručak', 'Ručak', 'Večera'],
    4: ['Doručak', 'Užina', 'Ručak', 'Večera'],
    5: ['Doručak', 'Užina', 'Ručak', 'Užina 2', 'Večera']
};

// ========================================
// HELPER FUNKCIJE
// ========================================

// FIX #3: Sanitizacija protiv XSS napada
function sanitizeHTML(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========================================
// INICIJALIZACIJA
// ========================================

function initApp() {
    loadAppState(); // Učitaj lokalno stanje (inpute, trenutne obroke)
    try {
        initFirebaseListeners(); // Pokreni slušanje za promene na Firebase
    } catch (error) {
        console.error("KRITIČNA GREŠKA pri inicijalizaciji Firebase listenera:", error);
        alert(
            "Došlo je do kritične greške pri povezivanju sa bazom. Proverite da li je 'databaseURL' ispravan. Pogledajte konzolu za detalje."
        );
        auth.signOut();
        return;
    }
    addEventListeners(); // Poveži sve dogadjaje (klikove, unose...)
    
    // Ako nema sačuvanog stanja obroka, inicijalizuj prazno
    if (meals.length === 0) {
        setMealCount(3);
    } else {
        renderMeals();
        updateTotals();
    }
}

function setupAuth() {
    const loginOverlay = document.getElementById('loginOverlay');
    const appContainer = document.getElementById('appContainer');
    const logoutBtn = document.getElementById('logoutBtn');

    // Novi elementi za email/password prijavu
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const signInBtn = document.getElementById('signInBtn');
    const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');
    const loginError = document.getElementById('loginError');

    const handleAuthError = (error) => {
        console.error("Greška pri autentifikaciji:", error);
        switch (error.code) {
            case 'auth/user-not-found':
                loginError.textContent = 'Korisnik sa ovim email-om ne postoji.';
                break;
            case 'auth/wrong-password':
                loginError.textContent = 'Pogrešna šifra. Pokušajte ponovo.';
                break;
            case 'auth/invalid-email':
                loginError.textContent = 'Unesite ispravnu email adresu.';
                break;
            default:
                loginError.textContent = 'Došlo je do greške. Pokušajte ponovo.';
        }
    };

    auth.onAuthStateChanged(user => {
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (user) {
            // Očisti polja nakon uspešne prijave
            emailInput.value = '';
            passwordInput.value = '';
            loginError.textContent = '';
            // Korisnik je ulogovan
            loginOverlay.style.display = 'none';
            appContainer.style.display = 'block';
            if (!window.appInitialized) {
                loadingOverlay.style.display = 'flex'; // 1. Prikaži loader pre inicijalizacije
                initApp();
                window.appInitialized = true;
            }
        } else {
            // Korisnik nije ulogovan
            loginOverlay.style.display = 'flex';
            appContainer.style.display = 'none';
            window.appInitialized = false;
            // 2. Resetuj flagove za učitavanje za sledeću prijavu
            initialFoodsLoaded = false;
            initialSavedMealsLoaded = false;
        }
    });

    signInBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        loginError.textContent = '';

        if (!email || !password) {
            loginError.textContent = 'Molimo unesite email i šifru.';
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .catch(handleAuthError);
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    showPasswordCheckbox.addEventListener('change', () => {
        passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
    });
}

function initFirebaseListeners() {
    const loadingOverlay = document.getElementById('loadingOverlay');

    // NOVI KORAK: Provera statusa konekcije sa bazom. Ovo je najvažniji test.
    const connectedRef = database.ref(".info/connected");
    connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        console.log("%c✅ Konekcija sa Firebase bazom je USPEŠNA.", "color: green; font-weight: bold;");
      } else {
        // Ovo se može desiti kratko pri učitavanju, ali ako ostane, problem je.
        console.warn("🟡 Konekcija sa Firebase bazom je PREKINUTA ili neuspešna.");
      }
    });

    const hideLoaderIfNeeded = () => {
        if (initialFoodsLoaded && initialSavedMealsLoaded) {
            loadingOverlay.style.display = 'none';
        }
    };

    // Slušaj za promene na listi namirnica
    database.ref('foods').on('value', 
    (snapshot) => {
        const data = snapshot.val();
        foods = []; // Isprazni lokalnu listu
        if (data) {
            // Pretvori Firebase objekat u niz, dodajući ID
            foods = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        // Sortiraj po abecedi za konzistentan prikaz
        foods.sort((a, b) => a.name.localeCompare(b.name));
        
        renderFoods(); // Ponovo iscrtaj listu namirnica
        if (document.getElementById('editPanel').style.display === 'flex') {
            renderEditFoods(); // Ako je panel za editovanje jela otvoren, osveži i njegovu listu
        }

        if (!initialFoodsLoaded) {
            initialFoodsLoaded = true;
            hideLoaderIfNeeded();
        }
    }, 
    (error) => {
        console.error("Firebase greška pri čitanju 'foods':", error);
        alert("Došlo je do greške pri učitavanju podataka o namirnicama. Proverite konzolu za detalje. Najverovatnije problem sa 'Security Rules'.");
        auth.signOut(); // Vrati korisnika na login ekran ako podaci ne mogu da se pročitaju
    });

    // Slušaj za promene na sačuvanim jelima
    database.ref('savedMeals').on('value', 
    (snapshot) => {
        const data = snapshot.val();
        savedMeals = []; // Isprazni lokalnu listu
        if (data) {
            savedMeals = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        renderSavedMeals(); // Ponovo iscrtaj listu sačuvanih jela

        if (!initialSavedMealsLoaded) {
            initialSavedMealsLoaded = true;
            hideLoaderIfNeeded();
        }
    },
    (error) => {
        console.error("Firebase greška pri čitanju 'savedMeals':", error);
        alert("Došlo je do greške pri učitavanju sačuvanih jela. Proverite konzolu za detalje. Najverovatnije problem sa 'Security Rules'.");
        auth.signOut(); // Vrati korisnika na login ekran ako podaci ne mogu da se pročitaju
    });
}

function addEventListeners() {
    document.getElementById('calculateBtn').addEventListener('click', calculate);
    document.querySelectorAll('.meal-count-btn').forEach(btn => {
        btn.addEventListener('click', () => setMealCount(Number(btn.dataset.count)));
    });
    document.getElementById('mealsContainer').addEventListener('click', handleMealContainerClick);
    document.getElementById('mealsContainer').addEventListener('change', handleMealContainerChange); // NOVO: Slušamo promene inputa
    document.getElementById('savedMealsSearch').addEventListener('input', renderSavedMeals);
    document.getElementById('savedMealsContainer').addEventListener('click', handleSavedMealAction);
    document.getElementById('searchInput').addEventListener('input', renderFoods);
    document.getElementById('foodList').addEventListener('click', handleFoodListAction);
    document.getElementById('addNewFoodBtn').addEventListener('click', () => openFoodForm());

    // Event listeneri za edit panel jela
    const editPanel = document.getElementById('editPanel');
    editPanel.addEventListener('click', handleEditPanelClick);
    document.getElementById('editSearchInput').addEventListener('input', renderEditFoods);
    // Novi, delegirani listeneri za interakcije unutar edit panela
    document.getElementById('editFoodsList').addEventListener('click', handleEditWorkspaceClick);
    document.getElementById('editFoodsList').addEventListener('change', handleEditWorkspaceChange); // NOVO: Slušamo promene inputa u edit panelu
    document.getElementById('editPanelFoodSearchList').addEventListener('click', handleEditPanelSearchListClick);

    // Event listeneri za modal za dodavanje/editovanje namirnica
    const foodModal = document.getElementById('foodFormModal');
    foodModal.addEventListener('click', handleFoodFormModalClick); // Za zatvaranje na klik pozadine
    document.getElementById('foodForm').addEventListener('submit', saveFood); // Za submit forme
    document.getElementById('saveFoodBtn').addEventListener('click', () => document.getElementById('foodForm').requestSubmit()); // Povezivanje dugmeta van forme
}

// ========================================
// KALKULATOR CILJEVA
// ========================================

function areCalcInputsValid() {
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const age = document.getElementById('age').value;
    return weight && height && age;
}

function updateGoalCalculationUI() {
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseFloat(document.getElementById('age').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const goalPercentage = parseFloat(document.getElementById('goalType').value);

    if (!areCalcInputsValid()) return;

    let bmr;
    if (gender === 'female') {
        bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
    } else {
        bmr = 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
    }

    const tdee = bmr * activity;
    const difference = tdee * (goalPercentage / 100);
    dailyGoal = Math.round(tdee + difference);

    document.getElementById('dailyGoal').textContent = dailyGoal;
    
    const deficitValueEl = document.getElementById('deficitValue');
    const goalDescEl = document.getElementById('goalDescription');
    const selectEl = document.getElementById('goalType');
    
    const selectedOption = [...selectEl.options].find(o => o.value == goalPercentage);
    const selectedText = selectedOption ? selectedOption.text : "Cilj";

    deficitValueEl.textContent = Math.round(difference) + (difference > 0 ? '+' : '');
    goalDescEl.textContent = selectedText;
    
    document.getElementById('formulaUsed').textContent = `Harris-Benedict (${gender === 'female' ? 'žene' : 'muškarci'})`;
    document.getElementById('result').style.display = 'block';
    updateTotals();
}

function recalculateFromSavedState() {
    if (!areCalcInputsValid()) return;
    updateGoalCalculationUI();
}

function calculate(event) {
    event.preventDefault();
    if (!areCalcInputsValid()) {
        alert('Molimo popunite sva polja!');
        return;
    }
    updateGoalCalculationUI();
    saveAppState();
}

// ========================================
// STATE MANAGEMENT (PERSISTENCE)
// ========================================

function saveAppState() {
    // 1. Čuvamo trenutne obroke
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_MEALS, JSON.stringify(meals));
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_MEAL_COUNT, currentMealCount);
    
    // 2. Čuvamo inpute kalkulatora
    const settings = {
        gender: document.getElementById('gender').value,
        weight: document.getElementById('weight').value,
        height: document.getElementById('height').value,
        age: document.getElementById('age').value,
        activity: document.getElementById('activity').value,
        goalType: document.getElementById('goalType').value,
        resultVisible: document.getElementById('result').style.display
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.CALC_SETTINGS, JSON.stringify(settings));
}

function loadAppState() {
    // 1. Učitaj podešavanja kalkulatora
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEYS.CALC_SETTINGS);
    let shouldRecalculate = false;

    if (storedSettings) {
        try {
            const s = JSON.parse(storedSettings);
            if (s.gender) document.getElementById('gender').value = s.gender;
            if (s.weight) document.getElementById('weight').value = s.weight;
            if (s.height) document.getElementById('height').value = s.height;
            if (s.age) document.getElementById('age').value = s.age;
            if (s.activity) document.getElementById('activity').value = s.activity;
            if (s.goalType) document.getElementById('goalType').value = s.goalType;
            
            // Ako je rezultat bio vidljiv, želimo da se ponovo izračuna i prikaže
            if (s.resultVisible === 'block') {
                shouldRecalculate = true;
            }
        } catch (e) {
            console.error("Greška pri učitavanju podešavanja kalkulatora:", e);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.CALC_SETTINGS);
        }
    }

    // 2. Učitaj obroke
    const storedMeals = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_MEALS);
    const storedCount = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_MEAL_COUNT);

    if (storedMeals && storedCount) {
        try {
            meals = JSON.parse(storedMeals);
            currentMealCount = parseInt(storedCount, 10);
            updateMealCountButtons();

        } catch (e) {
            console.error("Greška pri učitavanju obroka:", e);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_MEALS);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_MEAL_COUNT);
        }
    }

    if (shouldRecalculate) {
        recalculateFromSavedState();
    }
}


// ========================================
// OBROCI
// ========================================

function setMealCount(count) {
    if (meals.length > 0 && meals.some(m => m.items.length > 0)) {
        if(!confirm("Promena broja obroka će resetovati trenutni plan. Nastavi?")) return;
    }

    currentMealCount = count;
    meals = mealNames[count].map(name => ({ name, items: [] }));

    activeMealIndex = 0;

    updateMealCountButtons();
    renderMeals();
    updateTotals();
    saveAppState(); // FIX: Sačuvaj novo stanje nakon promene broja obroka
}

function setActiveMeal(index) {
    activeMealIndex = index;
    renderMeals();
}

function updateMealCountButtons() {
    document.querySelectorAll('.meal-count-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.count) === currentMealCount);
    });
}

function clearMeal(mealIndex) {
    const mealName = meals[mealIndex].name;
    if (confirm(`Da li želiš da obrišeš sve namirnice iz obroka "${mealName}"?`)) {
        meals[mealIndex].items = [];
        saveAppState();
        renderMeals();
        updateTotals();
    }
}

// ========================================
// RENDEROVANJE OBROKA
// ========================================

function renderMeals() {
    const container = document.getElementById('mealsContainer');
    
    if (meals.length === 0) {
        container.innerHTML = '<div class="empty-state">Odaberi broj obroka</div>';
        return;
    }

    updateMealCountButtons();

    container.innerHTML = meals.map((meal, index) => {
        const isActive = index === activeMealIndex;
        const stats = calculateMealStats(meal);
        
        return `
            <div class="meal ${isActive ? 'active' : ''}" data-meal-index="${index}">
                <div class="meal-actions-top">
                    ${isActive ? `<button class="btn-save-meal" data-action="save-as-dish">💾 Sačuvaj kao Jelo</button>` : ''}
                </div>
                <div class="meal-header">
                    <div class="meal-title-group">
                        <div class="meal-name">${sanitizeHTML(meal.name)}</div>
                        <button class="btn-clear-meal" data-action="clear-meal" title="Obriši sve iz ovog obroka">🗑️</button>
                    </div>
                    <div class="meal-calories">${stats.calories} kcal</div>
                </div>
                <div class="meal-macros">
                    <span class="macro-item">P: ${Math.round(stats.protein)}g</span>
                    <span class="macro-item">M: ${Math.round(stats.fat)}g</span>
                    <span class="macro-item">UH: ${Math.round(stats.carbs)}g</span>
                </div>
                <div class="meal-foods">
                    ${meal.items.length > 0 
                        ? meal.items.map((item, itemIndex) => renderMealItem(item, index, itemIndex)).join('')
                        : '<div class="empty-state" style="margin: 0;">Prazno</div>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

function handleMealContainerClick(event) {
    const mealEl = event.target.closest('.meal');
    if (!mealEl) return;

    const mealIndex = Number(mealEl.dataset.mealIndex);
    const actionEl = event.target.closest('[data-action]');

    if (actionEl) {
        const action = actionEl.dataset.action;
        
        // Ignorišemo input akcije na klik da ne bi gubili fokus
        if (action === 'set-qty' || action === 'set-dish') return;

        event.stopPropagation();
        switch(action) {
            case 'save-as-dish': saveMealPrompt(mealIndex); break;
            case 'clear-meal': clearMeal(mealIndex); break;
            case 'toggle-dish': toggleDishDetails(mealIndex, Number(actionEl.dataset.itemIndex)); break;
            case 'adjust-dish': adjustDishServing(mealIndex, Number(actionEl.dataset.itemIndex), Number(actionEl.dataset.amount)); break;
            case 'adjust-qty': adjustQuantity(mealIndex, Number(actionEl.dataset.itemIndex), Number(actionEl.dataset.amount)); break;
            case 'remove-item': removeFromMeal(mealIndex, Number(actionEl.dataset.itemIndex)); break;
        }
    } else {
        // Klik na sam obrok da se aktivira
        setActiveMeal(mealIndex);
    }
}

function handleMealContainerChange(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    
    const mealEl = event.target.closest('.meal');
    if (!mealEl) return;

    const mealIndex = Number(mealEl.dataset.mealIndex);
    const action = actionEl.dataset.action;
    const itemIndex = Number(actionEl.dataset.itemIndex);

    if (action === 'set-qty') {
        setAmount(mealIndex, itemIndex, actionEl.value);
    } else if (action === 'set-dish') {
        setDishServing(mealIndex, itemIndex, actionEl.value);
    }
}

function renderMealItem(item, mealIndex, itemIndex) {
    if (item.isDish) {
        return renderDishItem(item, mealIndex, itemIndex);
    } else {
        return renderFoodItem(item, mealIndex, itemIndex);
    }
}

function renderDishItem(dish, mealIndex, itemIndex) {
    const dishStats = calculateDishStats(dish);
    const isExpanded = dish.showDetails || false;
    
    return `
        <div class="meal-food-item dish-item">
            <div class="dish-header" data-action="toggle-dish" data-item-index="${itemIndex}">
                <div class="meal-food-info">
                    <div class="meal-food-name">🍽️ ${sanitizeHTML(dish.name)}</div>
                    <div class="meal-food-macros">
                        ${dish.servingGrams}g (${dish.servingPercent}%) • 
                        P: ${dishStats.protein}g M: ${dishStats.fat}g UH: ${dishStats.carbs}g
                    </div>
                </div>
                <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
            </div>
            ${isExpanded ? `
                <div class="dish-details">
                    <div class="dish-details-header">Sastojci (ukupno ${dish.totalGrams}g):</div>
                    ${dish.ingredients.map(ing => `
                        <div class="dish-ingredient">
                            • ${sanitizeHTML(ing.name)}: ${ing.amount}${sanitizeHTML(ing.unit)}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="meal-food-controls">
                <button class="quantity-btn" data-action="adjust-dish" data-item-index="${itemIndex}" data-amount="-10">−</button>
                <div class="quantity-input-wrapper">
                    <input 
                        type="number" 
                        class="quantity-input" 
                        value="${dish.servingGrams}"
                        min="10"
                        step="10"
                        data-action="set-dish"
                        data-item-index="${itemIndex}"
                    >
                    <span class="quantity-unit">g</span>
                </div>
                <button class="quantity-btn" data-action="adjust-dish" data-item-index="${itemIndex}" data-amount="10">+</button>
                <div class="meal-food-cals">${dishStats.calories} kcal</div>
                <button class="quantity-btn delete-btn" data-action="remove-item" data-item-index="${itemIndex}">×</button>
            </div>
        </div>
    `;
}

function renderFoodItem(food, mealIndex, itemIndex) {
    const cals = calculateCalories(food);
    const macros = calculateMacros(food);
    
    return `
        <div class="meal-food-item">
            <div class="meal-food-info">
                <div class="meal-food-name">${sanitizeHTML(food.name)}</div>
                <div class="meal-food-macros">P: ${macros.protein}g | M: ${macros.fat}g | UH: ${macros.carbs}g</div>
            </div>
            <div class="meal-food-controls">
                <button class="quantity-btn" data-action="adjust-qty" data-item-index="${itemIndex}" data-amount="-1">−</button>
                <div class="quantity-input-wrapper">
                    <input 
                        type="number" 
                        class="quantity-input" 
                        value="${food.amount}"
                        min="${food.unit === 'kom' ? 1 : 10}"
                        step="${food.unit === 'kom' ? 1 : 10}"
                        data-action="set-qty"
                        data-item-index="${itemIndex}"
                    >
                    <span class="quantity-unit">${sanitizeHTML(food.unit)}</span>
                </div>
                <button class="quantity-btn" data-action="adjust-qty" data-item-index="${itemIndex}" data-amount="1">+</button>
                <div class="meal-food-cals">${cals} kcal</div>
                <button class="quantity-btn delete-btn" data-action="remove-item" data-item-index="${itemIndex}">×</button>
            </div>
        </div>
    `;
}

function toggleDishDetails(mealIndex, itemIndex) {
    const item = meals[mealIndex].items[itemIndex];
    if (item && item.isDish) {
        item.showDetails = !item.showDetails;
        renderMeals();
    }
}

// ========================================
// LOGIKA ZA HRANU I UPDATE
// ========================================

function addFoodToMeal(food) {
    if (document.getElementById('editPanel').style.display === 'flex') {
        addFoodToEdit(food);
        return;
    }
    
    if (meals.length === 0) {
        alert('Prvo odaberi broj obroka!');
        return;
    }

    const foodItem = {
        isDish: false,
        ...food,
        amount: food.serving,
        baseCalories: food.calories,
        baseServing: food.serving
    };

    meals[activeMealIndex].items.push(foodItem);
    
    saveAppState();
    renderMeals();
    updateTotals();

    // Resetuj search, ali zadrži renderovanu listu (sve namirnice)
    document.getElementById('searchInput').value = '';
    renderFoods(); // FIX: Osveži listu namirnica da prikaže sve
}

function addDishToMeal(savedMeal) {
    if (meals.length === 0) {
        alert('Prvo odaberi broj obroka!');
        return;
    }

    const ingredients = JSON.parse(JSON.stringify(savedMeal.foods));
    const totalGrams = ingredients.reduce((sum, f) => sum + f.amount, 0);

    const dishItem = {
        isDish: true,
        id: savedMeal.id,
        name: savedMeal.name,
        totalGrams: totalGrams,
        servingGrams: totalGrams,
        servingPercent: 100,
        ingredients: ingredients,
        showDetails: false
    };

    meals[activeMealIndex].items.push(dishItem);
    saveAppState();
    renderMeals();
    updateTotals();
}

function adjustQuantity(mealIndex, itemIndex, direction) {
    const item = meals[mealIndex].items[itemIndex];
    if (!item || item.isDish) return;

    const step = item.unit === 'kom' ? 1 : 10;
    const newAmount = item.amount + (direction * step);
    const minAmount = item.unit === 'kom' ? 1 : 10;
    
    if (newAmount >= minAmount) {
        item.amount = newAmount;
        saveAppState();
        renderMeals();
        updateTotals();
    }
}

function setAmount(mealIndex, itemIndex, newAmount) {
    const item = meals[mealIndex].items[itemIndex];
    if (!item || item.isDish) return;

    const amount = parseFloat(newAmount);
    if (amount > 0 && !isNaN(amount)) {
        item.amount = amount;
        saveAppState();
        renderMeals();
        updateTotals();
    }
}

function adjustDishServing(mealIndex, itemIndex, grams) {
    const item = meals[mealIndex].items[itemIndex];
    if (!item || !item.isDish) return;

    const newServing = item.servingGrams + grams;
    if (newServing >= 10) {
        item.servingGrams = newServing;
        item.servingPercent = Math.round((newServing / item.totalGrams) * 100);
        saveAppState();
        renderMeals();
        updateTotals();
    }
}

function setDishServing(mealIndex, itemIndex, newGrams) {
    const item = meals[mealIndex].items[itemIndex];
    if (!item || !item.isDish) return;

    const grams = parseFloat(newGrams);
    if (grams > 0 && !isNaN(grams)) {
        item.servingGrams = grams;
        item.servingPercent = Math.round((grams / item.totalGrams) * 100);
        saveAppState();
        renderMeals();
        updateTotals();
    }
}

function removeFromMeal(mealIndex, itemIndex) {
    meals[mealIndex].items.splice(itemIndex, 1);
    saveAppState();
    renderMeals();
    updateTotals();
}

// ========================================
// KALKULACIJE
// ========================================

function calculateMealStats(meal) {
    let calories = 0;
    let protein = 0;
    let fat = 0;
    let carbs = 0;

    meal.items.forEach(item => {
        if (item.isDish) {
            const stats = calculateDishStats(item);
            calories += stats.calories;
            protein += stats.protein;
            fat += stats.fat;
            carbs += stats.carbs;
        } else {
            calories += calculateCalories(item);
            const macros = calculateMacros(item);
            protein += macros.protein;
            fat += macros.fat;
            carbs += macros.carbs;
        }
    });

    return { calories, protein, fat, carbs };
}

function calculateDishStats(dish) {
    const ratio = dish.servingGrams / dish.totalGrams;
    
    let totalCals = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    dish.ingredients.forEach(ing => {
        const ingRatio = ing.amount / ing.baseServing;
        totalCals += (ing.baseCalories * ingRatio);
        totalProtein += (ing.protein * ingRatio);
        totalFat += (ing.fat * ingRatio);
        totalCarbs += (ing.carbs * ingRatio);
    });

    return {
        calories: Math.round(totalCals * ratio),
        protein: Math.round(totalProtein * ratio * 10) / 10,
        fat: Math.round(totalFat * ratio * 10) / 10,
        carbs: Math.round(totalCarbs * ratio * 10) / 10
    };
}

function calculateCalories(food) {
    return Math.round((food.baseCalories / food.baseServing) * food.amount);
}

function calculateMacros(food) {
    const ratio = food.amount / food.baseServing;
    return {
        protein: Math.round(food.protein * ratio * 10) / 10,
        fat: Math.round(food.fat * ratio * 10) / 10,
        carbs: Math.round(food.carbs * ratio * 10) / 10
    };
}

// ========================================
// SAČUVANA JELA
// ========================================

function saveMealPrompt(mealIndex) {
    const meal = meals[mealIndex];
    const foodsOnly = meal.items.filter(item => !item.isDish);
    
    if (foodsOnly.length === 0) {
        alert('Jelo mora sadržati osnovne namirnice da bi se sačuvalo.');
        return;
    }

    const name = prompt('Unesi naziv novog jela:');
    if (!name || name.trim() === '') return;

    const savedMeal = {
        name: name.trim(),
        foods: foodsOnly.map(f => ({ ...f, isDish: false }))
    };
    database.ref('savedMeals').push(savedMeal)
        .then(() => alert('Jelo sačuvano u zajedničku bazu!'))
        .catch(err => {
            console.error("Greška pri čuvanju jela:", err);
            alert("Došlo je do greške pri čuvanju.");
        });
}

// Funkcije saveSavedMeals i loadSavedMeals su uklonjene jer Firebase
// sada upravlja stanjem preko 'on value' listenera.

function renderSavedMeals() {
    const container = document.getElementById('savedMealsContainer');
    const searchTerm = (document.getElementById('savedMealsSearch')?.value || '').toLowerCase();
    
    const filtered = savedMeals.filter(meal => 
        meal.name.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Nema rezultata</div>';
        return;
    }

    container.innerHTML = filtered.map((meal, index) => {
        const stats = calculateSavedMealStats(meal);
        return `
            <div class="saved-meal" data-meal-id="${meal.id}">
                <div class="saved-meal-header">
                    <div class="saved-meal-name">${sanitizeHTML(meal.name)}</div>
                    <div class="saved-meal-calories">${stats.calories} kcal</div>
                </div>
                <div class="saved-meal-macros">
                    <span class="saved-macro-item">P: ${stats.protein}g</span>
                    <span class="saved-macro-item">M: ${stats.fat}g</span>
                    <span class="saved-macro-item">UH: ${stats.carbs}g</span>
                    <span class="saved-macro-item">Tež: ${stats.totalGrams}g</span>
                </div>
                <div class="saved-meal-ingredients">
                    ${meal.foods.map(f => `<span class="ingredient-tag">${sanitizeHTML(f.name)} ${f.amount}${sanitizeHTML(f.unit)}</span>`).join('')}
                </div>
                <div class="saved-meal-actions">
                    <button class="btn-small btn-add" data-action="add" aria-label="Dodaj jelo u obrok"><span class="btn-icon">➕</span><span class="btn-text">Dodaj</span></button>
                    <button class="btn-small btn-edit" data-action="edit" aria-label="Izmeni jelo"><span class="btn-icon">🛠️</span><span class="btn-text">Edituj</span></button>
                    <button class="btn-small btn-rename" data-action="rename" aria-label="Promeni ime jela"><span class="btn-icon">✏️</span><span class="btn-text">Ime</span></button>
                    <button class="btn-small btn-delete" data-action="delete" aria-label="Obriši jelo"><span class="btn-icon">🗑️</span><span class="btn-text">Obriši</span></button>
                </div>
            </div>
        `;
    }).join('');
}

function handleSavedMealAction(event) {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) return;

    const savedMealEl = event.target.closest('.saved-meal');
    if (!savedMealEl) return;

    const mealId = savedMealEl.dataset.mealId;
    const meal = savedMeals.find(m => m.id === mealId);
    if (!meal) return;

    const action = actionButton.dataset.action;

    switch (action) {
        case 'add':
            addDishToMeal(meal);
            break;
        case 'edit':
            editSavedMeal(meal.id);
            break;
        case 'rename':
            renameSavedMeal(meal.id);
            break;
        case 'delete':
            deleteSavedMeal(meal.id);
            break;
    }
}

function calculateSavedMealStats(savedMeal) {
    let cals=0, p=0, f=0, c=0, g=0;
    savedMeal.foods.forEach(food => {
        cals += calculateCalories(food);
        const m = calculateMacros(food);
        p += m.protein; f += m.fat; c += m.carbs;
        g += food.amount;
    });
    return { calories: Math.round(cals), protein: Math.round(p), fat: Math.round(f), carbs: Math.round(c), totalGrams: Math.round(g) };
}

function renameSavedMeal(mealId) {
    const meal = savedMeals.find(m => m.id === mealId);
    if (!meal) return;
    const newName = prompt('Novo ime jela:', meal.name);
    if (newName && newName.trim() !== '') {
        database.ref(`savedMeals/${mealId}/name`).set(newName.trim());
    }
}

function editSavedMeal(mealId) {
    const meal = savedMeals.find(m => m.id === mealId);
    if (!meal) return;
    currentlyEditingMealId = mealId;
    editWorkspaceItems = JSON.parse(JSON.stringify(meal.foods));
    originalEditItems = JSON.parse(JSON.stringify(meal.foods));
    document.getElementById('editPanel').style.display = 'flex';
    document.getElementById('editMealName').textContent = meal.name;
    document.body.style.overflow = 'hidden';
    
    // Čistimo search input i prikazujemo SVE namirnice odmah
    document.getElementById('editSearchInput').value = '';
    renderEditFoodsList();
    renderEditFoods();
}

function deleteSavedMeal(mealId) {
    if (!confirm('Da li ste sigurni da želite da obrišete ovo jelo iz zajedničke baze?')) return;
    database.ref(`savedMeals/${mealId}`).remove();
}

// ========================================
// EDIT MODE LOGIKA (UPDATED)
// ========================================

function renderEditFoodsList() {
    const container = document.getElementById('editFoodsList');
    if (editWorkspaceItems.length === 0) {
        container.innerHTML = `<div class="edit-empty-state"><p>❌ Nema namirnica</p></div>`;
        return;
    }
    
    container.innerHTML = editWorkspaceItems.map((food, index) => {
        const cals = calculateCalories(food);
        const macros = calculateMacros(food);
        return `
            <div class="edit-food-item" data-item-index="${index}">
                 <div class="edit-food-info">
                     <div class="edit-food-name">${sanitizeHTML(food.name)}</div>
                     <div class="edit-food-macros">${food.amount}${sanitizeHTML(food.unit)} • ${cals} kcal • P:${macros.protein} M:${macros.fat} UH:${macros.carbs}</div>
                 </div>
                 <div class="edit-food-controls">
                     <button class="quantity-btn" data-action="adjust-edit-qty" data-amount="-1">−</button>
                     <div class="quantity-input-wrapper">
                         <input type="number" class="quantity-input" value="${food.amount}" min="${food.unit==='kom'?1:10}" step="${food.unit==='kom'?1:10}" data-action="set-edit-qty">
                         <span class="quantity-unit">${sanitizeHTML(food.unit)}</span>
                     </div>
                     <button class="quantity-btn" data-action="adjust-edit-qty" data-amount="1">+</button>
                     <button class="quantity-btn delete-btn" data-action="remove-from-edit">×</button>
                 </div>
            </div>`;
    }).join('');
}

function renderEditFoods() {
    renderFoodSearchList(
        document.getElementById('editSearchInput'), 
        document.getElementById('editPanelFoodSearchList'), 
        () => `<button class="btn-icon-small btn-add-food" data-action="add" title="Dodaj u jelo">➕</button>`
    );
}

function addFoodToEdit(food) {
    const foodItem = { isDish: false, ...food, amount: food.serving, baseCalories: food.calories, baseServing: food.serving };
    editWorkspaceItems.push(foodItem);
    renderEditFoodsList();
}

function adjustEditQuantity(index, dir) {
    const f = editWorkspaceItems[index];
    const s = f.unit === 'kom' ? 1 : 10;
    const n = f.amount + (dir * s);
    if (n >= (f.unit==='kom'?1:10)) { f.amount = n; renderEditFoodsList(); }
}

function setEditAmount(index, val) {
    const f = editWorkspaceItems[index];
    const v = parseFloat(val);
    if (v > 0 && !isNaN(v)) { f.amount = v; renderEditFoodsList(); }
}

function removeFromEdit(index) {
    editWorkspaceItems.splice(index, 1);
    renderEditFoodsList();
}

function handleEditWorkspaceClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const itemEl = event.target.closest('.edit-food-item');
    const itemIndex = Number(itemEl.dataset.itemIndex);
    const action = actionEl.dataset.action;

    // Ignorišemo input akcije na klik
    if (action === 'set-edit-qty') return;

    switch(action) {
        case 'adjust-edit-qty':
            adjustEditQuantity(itemIndex, Number(actionEl.dataset.amount));
            break;
        case 'remove-from-edit':
            removeFromEdit(itemIndex);
            break;
    }
}

function handleEditWorkspaceChange(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const itemEl = event.target.closest('.edit-food-item');
    const itemIndex = Number(itemEl.dataset.itemIndex);
    const action = actionEl.dataset.action;

    if (action === 'set-edit-qty') {
        setEditAmount(itemIndex, actionEl.value);
    }
}

function handleEditPanelSearchListClick(event) {
    const addBtn = event.target.closest('[data-action="add"]');
    if (!addBtn) return;
    const foodItemEl = addBtn.closest('.food-item');
    const foodId = foodItemEl.dataset.foodId;
    const food = foods.find(f => f.id === foodId);
    if (food) addFoodToEdit(food);
}

function saveEditedMeal() {
    if (!currentlyEditingMealId) return;
    const meal = savedMeals.find(m => m.id === currentlyEditingMealId);
    if (!meal) { closeEditPanel(); return; }
    if (editWorkspaceItems.length === 0) { alert('Jelo ne može biti prazno!'); return; }
    
    const updatedData = {
        name: meal.name,
        foods: editWorkspaceItems.map(f => ({ ...f, isDish: false }))
    };
    database.ref(`savedMeals/${currentlyEditingMealId}`).set(updatedData)
        .then(() => closeEditPanel());
}

function cancelEditMode() {
    if (JSON.stringify(editWorkspaceItems) !== JSON.stringify(originalEditItems)) {
        if (!confirm('Odbaci izmene?')) return;
    }
    closeEditPanel();
}

function closeEditPanel() {
    currentlyEditingMealId = null; editWorkspaceItems = []; originalEditItems = [];
    document.getElementById('editPanel').style.display = 'none';
    document.body.style.overflow = '';
}

function handleEditPanelClick(event) {
    const target = event.target;
    // Zatvori ako se klikne na pozadinu
    if (target.id === 'editPanel') {
        cancelEditMode();
        return;
    }
    // Zatvori ako se klikne na dugme za zatvaranje/cancel
    if (target.closest('[data-action="cancel-edit"]')) {
        cancelEditMode();
    } else if (target.closest('[data-action="save-edit"]')) {
        saveEditedMeal();
    }
}

// ========================================
// UPDATE TOTALA
// ========================================

function updateTotals() {
    let tCal=0, tPro=0, tFat=0, tCarb=0;
    const progressCircle = document.querySelector('.progress-circle');
    meals.forEach(m => {
        const s = calculateMealStats(m);
        tCal+=s.calories; tPro+=s.protein; tFat+=s.fat; tCarb+=s.carbs;
    });

    document.getElementById('totalCalories').textContent = Math.round(tCal);
    document.getElementById('totalProtein').textContent = Math.round(tPro);
    document.getElementById('totalFat').textContent = Math.round(tFat);
    document.getElementById('totalCarbs').textContent = Math.round(tCarb);
    
    // Procenti
    if (tCal > 0) {
        const pC = tPro * CALORIES_PER_GRAM.PROTEIN, fC = tFat * CALORIES_PER_GRAM.FAT, cC = tCarb * CALORIES_PER_GRAM.CARBS;
        const total = pC + fC + cC;
        if(total>0) {
            const pp = Math.round((pC/total)*100);
            const fp = Math.round((fC/total)*100);
            document.getElementById('proteinPercent').textContent = pp;
            document.getElementById('fatPercent').textContent = fp;
            document.getElementById('carbsPercent').textContent = 100 - pp - fp;
        }
    } else {
        ['proteinPercent','fatPercent','carbsPercent'].forEach(id=>document.getElementById(id).textContent='0');
    }
    
    // Remaining
    if (dailyGoal > 0) {
        const rem = dailyGoal - tCal;
        const el = document.getElementById('remaining');
        el.textContent = rem >= 0 ? `${Math.round(rem)} kcal` : `Prekoračenje: ${Math.abs(Math.round(rem))} kcal`;
        el.style.color = rem < 0 ? 'var(--danger-red)' : 'white';

        // Ažuriranje kružnog grafikona
        const percent = Math.min(Math.round((tCal / dailyGoal) * 100), 100);
        progressCircle.style.setProperty('--progress-percent', `${percent}%`);
        progressCircle.setAttribute('aria-valuenow', percent);

        // Ako je prekoračeno, oboji ceo krug u crveno
        if (tCal > dailyGoal) {
            progressCircle.style.background = 'conic-gradient(var(--danger-red) 100%, var(--danger-red) 0)';
        } else {
            // Vrati normalnu boju ako nije prekoračeno
            progressCircle.style.background = `conic-gradient(var(--accent-green) var(--progress-percent, 0%), rgba(255, 255, 255, 0.2) 0)`;
        }
    } else {
        document.getElementById('remaining').textContent = '-';
        progressCircle.style.setProperty('--progress-percent', '0%');
        progressCircle.setAttribute('aria-valuenow', 0);
        progressCircle.style.background = '';
    }
}

// ========================================
// LISTA NAMIRNICA
// ========================================

/**
 * Generička funkcija za renderovanje liste namirnica sa pretragom.
 * @param {HTMLInputElement} searchInputEl - Input element za pretragu.
 * @param {HTMLElement} containerEl - Kontejner u koji se renderuje lista.
 * @param {Function} actionsTemplateFn - Funkcija koja vraća HTML string za akcione dugmiće.
 */
function renderFoodSearchList(searchInputEl, containerEl, actionsTemplateFn) {
    const searchTerm = searchInputEl.value.toLowerCase();
    
    const displayList = searchTerm.length === 0
        ? foods
        : foods.filter(food => food.name.toLowerCase().includes(searchTerm));

    if (displayList.length === 0) {
        containerEl.innerHTML = `<div class="empty-state">Nema rezultata.</div>`;
        return;
    }

    containerEl.innerHTML = displayList.map(food => `
        <div class="food-item" data-food-id="${food.id}">
            <div class="food-item-info">
                <span class="food-name">${sanitizeHTML(food.name)}</span>
                <span class="food-calories">${food.calories} kcal / ${food.serving}${sanitizeHTML(food.unit)}</span>
            </div>
            <div class="food-item-actions">${actionsTemplateFn(food)}</div>
        </div>`).join('');
}

function renderFoods() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const foodList = document.getElementById('foodList');

    // Ako je pretraga prazna, prikaži sve. U suprotnom, filtriraj.
    const displayList = searchTerm.length === 0
        ? foods
        : foods.filter(food => food.name.toLowerCase().includes(searchTerm));

    if (displayList.length === 0) {
        foodList.innerHTML = `<div class="empty-state">Nema rezultata.</div>`;
        return;
    }

    renderFoodSearchList(document.getElementById('searchInput'), document.getElementById('foodList'), () => `
        <button class="btn-icon-small" data-action="edit" title="Izmeni namirnicu">✏️</button>
        <button class="btn-icon-small" data-action="delete" title="Obriši namirnicu">🗑️</button>
        <button class="btn-icon-small btn-add-food" data-action="add" title="Dodaj u obrok">➕</button>
    `);
}

function handleFoodListAction(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const foodItemEl = button.closest('.food-item');
    const foodId = foodItemEl.dataset.foodId;
    const food = foods.find(f => f.id === foodId);
    if (!food) return;

    const action = button.dataset.action;
    if (action === 'add') {
        addFoodToMeal(food);
    } else if (action === 'edit') {
        openFoodForm(foodId);
    } else if (action === 'delete') {
        if (confirm(`Da li ste sigurni da želite da obrišete "${food.name}" iz baze?`)) {
            database.ref(`foods/${foodId}`).remove();
        }
    }
}

// ========================================
// UPRAVLJANJE NAMIRNICAMA (NOVO)
// ========================================

function openFoodForm(foodId = null) {
    const modal = document.getElementById('foodFormModal');
    const form = document.getElementById('foodForm');
    form.reset();

    if (foodId) {
        // Edit mode
        const food = foods.find(f => f.id === foodId);
        if (!food) return;
        document.getElementById('foodFormTitle').textContent = 'Izmeni Namirnicu';
        document.getElementById('foodId').value = food.id;
        document.getElementById('foodName').value = food.name;
        document.getElementById('foodCalories').value = food.calories;
        document.getElementById('foodProtein').value = food.protein;
        document.getElementById('foodFat').value = food.fat;
        document.getElementById('foodCarbs').value = food.carbs;
        document.getElementById('foodServing').value = food.serving;
        document.getElementById('foodUnit').value = food.unit;
    } else {
        // Add mode
        document.getElementById('foodFormTitle').textContent = 'Dodaj Novu Namirnicu';
        document.getElementById('foodId').value = '';
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeFoodForm() {
    document.getElementById('foodFormModal').style.display = 'none';
    document.body.style.overflow = '';
}

function saveFood(event) {
    event.preventDefault();
    const foodId = document.getElementById('foodId').value;
    const foodData = {
        name: document.getElementById('foodName').value,
        calories: parseFloat(document.getElementById('foodCalories').value),
        protein: parseFloat(document.getElementById('foodProtein').value),
        fat: parseFloat(document.getElementById('foodFat').value),
        carbs: parseFloat(document.getElementById('foodCarbs').value),
        serving: parseFloat(document.getElementById('foodServing').value),
        unit: document.getElementById('foodUnit').value,
    };

    // Validacija
    if (foodData.calories < 0 || foodData.protein < 0 || foodData.fat < 0 || foodData.carbs < 0 || foodData.serving <= 0) {
        alert("Vrednosti za kalorije, makronutrijente i porciju ne mogu biti negativne, a porcija mora biti veća od 0.");
        return;
    }

    if (foodId) {
        // Update
        database.ref(`foods/${foodId}`).update(foodData).then(closeFoodForm);
    } else {
        // Create
        database.ref('foods').push(foodData).then(closeFoodForm);
    }
}

function handleFoodFormModalClick(event) {
    if (event.target.id === 'foodFormModal' || event.target.closest('[data-action="close-food-form"]')) {
        closeFoodForm();
    }
}

document.addEventListener('DOMContentLoaded', setupAuth);
