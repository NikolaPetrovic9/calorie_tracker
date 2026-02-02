// ========================================
// KALKULATOR KALORIJA - FINALNA VERZIJA
// ========================================

// Globalne varijable
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
const mealNames = {
    3: ['Doručak', 'Ručak', 'Večera'],
    4: ['Doručak', 'Užina', 'Ručak', 'Večera'],
    5: ['Doručak', 'Užina', 'Ručak', 'Užina 2', 'Večera']
};

// ========================================
// INICIJALIZACIJA
// ========================================

function init() {
    loadSavedMeals(); // Učitaj bazu jela
    loadAppState();   // Učitaj stanje, inpute i ciljeve
    
    // Ako nema sačuvanog stanja obroka, inicijalizuj prazno
    if (meals.length === 0) {
        setMealCount(3);
    } else {
        renderMeals();
        updateTotals();
    }

    renderFoods(); // Prikazuje SVE namirnice odmah
    renderSavedMeals();
}

// ========================================
// KALKULATOR CILJEVA
// ========================================

function calculate() {
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseFloat(document.getElementById('age').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const goalPercentage = parseFloat(document.getElementById('goalType').value);

    // Validacija samo ako korisnik klikne dugme, ali ne i pri automatskom učitavanju
    // (Ovo sprečava alert pri refreshu ako su polja prazna)
    const isManualClick = window.event && window.event.type === 'click';
    
    if ((!weight || !height || !age) && isManualClick) {
        alert('Molimo popunite sva polja!');
        return;
    }

    // Ako podaci nisu potpuni, ne računaj (bitno za load)
    if (!weight || !height || !age) return;

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
    
    // Ažuriranje tekstualnog opisa (UI)
    const deficitValueEl = document.getElementById('deficitValue');
    const goalDescEl = document.getElementById('goalDescription');
    const selectEl = document.getElementById('goalType');
    
    // Moramo naći text opcije na osnovu value-a
    const selectedOption = [...selectEl.options].find(o => o.value == goalPercentage);
    const selectedText = selectedOption ? selectedOption.text : "Cilj";

    deficitValueEl.textContent = Math.round(difference) + (difference > 0 ? '+' : '');
    goalDescEl.textContent = selectedText;
    
    const formulaText = gender === 'female' 
        ? 'Harris-Benedict formula (žene)' 
        : 'Harris-Benedict formula (muškarci)';
    document.getElementById('formulaUsed').textContent = formulaText;
    
    document.getElementById('result').style.display = 'block';
    
    // Čuvamo sve u storage nakon svakog proračuna
    saveAppState();
    updateTotals();
}

// ========================================
// STATE MANAGEMENT (PERSISTENCE)
// ========================================

function saveAppState() {
    // 1. Čuvamo trenutne obroke
    localStorage.setItem('currentMeals', JSON.stringify(meals));
    localStorage.setItem('currentMealCount', currentMealCount);
    
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
    localStorage.setItem('calcSettings', JSON.stringify(settings));
}

function loadAppState() {
    // 1. Učitaj podešavanja kalkulatora i POPUNI INPUTE
    const storedSettings = localStorage.getItem('calcSettings');
    let shouldRecalculate = false;

    if (storedSettings) {
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
    }

    // 2. Učitaj obroke
    const storedMeals = localStorage.getItem('currentMeals');
    const storedCount = localStorage.getItem('currentMealCount');
    
    if (storedMeals && storedCount) {
        meals = JSON.parse(storedMeals);
        currentMealCount = parseInt(storedCount);
        
        // Ažuriraj dugmad za broj obroka
        document.querySelectorAll('.meal-count-btn').forEach(btn => {
            btn.classList.toggle('active', Number(btn.dataset.count) === currentMealCount);
        });
    }

    // 3. BITNO: Pozovi calculate() da bi se osvežio UI (tekst cilja, deficit, kalorije)
    if (shouldRecalculate) {
        calculate();
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
    meals = [];
    
    for (let i = 0; i < count; i++) {
        meals.push({
            name: mealNames[count][i],
            items: []
        });
    }

    activeMealIndex = 0;

    const buttons = document.querySelectorAll('.meal-count-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.count) === count);
    });

    saveAppState();
    renderMeals();
    updateTotals();
}

function setActiveMeal(index) {
    activeMealIndex = index;
    renderMeals();
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

    container.innerHTML = meals.map((meal, index) => {
        const isActive = index === activeMealIndex;
        const stats = calculateMealStats(meal);
        
        return `
            <div class="meal ${isActive ? 'active' : ''}" onclick="setActiveMeal(${index})">
                <div class="meal-actions-top">
                    ${isActive ? `<button class="btn-save-meal" onclick="event.stopPropagation(); saveMealPrompt(${index})">💾 Sačuvaj kao Jelo</button>` : ''}
                </div>
                
                <div class="meal-header">
                    <div class="meal-title-group">
                        <div class="meal-name">${meal.name}</div>
                        <button class="btn-clear-meal" onclick="event.stopPropagation(); clearMeal(${index})" title="Obriši sve iz ovog obroka">🗑️</button>
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
            <div class="dish-header" onclick="event.stopPropagation(); toggleDishDetails(${mealIndex}, ${itemIndex})">
                <div class="meal-food-info">
                    <div class="meal-food-name">🍽️ ${dish.name}</div>
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
                            • ${ing.name}: ${ing.amount}${ing.unit}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="meal-food-controls">
                <button class="quantity-btn" onclick="event.stopPropagation(); adjustDishServing(${mealIndex}, ${itemIndex}, -10)">−</button>
                <div class="quantity-input-wrapper" onclick="event.stopPropagation()">
                    <input 
                        type="number" 
                        class="quantity-input" 
                        value="${dish.servingGrams}"
                        min="10"
                        step="10"
                        onchange="setDishServing(${mealIndex}, ${itemIndex}, this.value)"
                        onclick="event.stopPropagation()"
                    >
                    <span class="quantity-unit">g</span>
                </div>
                <button class="quantity-btn" onclick="event.stopPropagation(); adjustDishServing(${mealIndex}, ${itemIndex}, 10)">+</button>
                <div class="meal-food-cals">${dishStats.calories} kcal</div>
                <button class="quantity-btn delete-btn" onclick="event.stopPropagation(); removeFromMeal(${mealIndex}, ${itemIndex})">×</button>
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
                <div class="meal-food-name">${food.name}</div>
                <div class="meal-food-macros">P: ${macros.protein}g | M: ${macros.fat}g | UH: ${macros.carbs}g</div>
            </div>
            <div class="meal-food-controls">
                <button class="quantity-btn" onclick="event.stopPropagation(); adjustQuantity(${mealIndex}, ${itemIndex}, -1)">−</button>
                <div class="quantity-input-wrapper" onclick="event.stopPropagation()">
                    <input 
                        type="number" 
                        class="quantity-input" 
                        value="${food.amount}"
                        min="${food.unit === 'kom' ? 1 : 10}"
                        step="${food.unit === 'kom' ? 1 : 10}"
                        onchange="setAmount(${mealIndex}, ${itemIndex}, this.value)"
                        onclick="event.stopPropagation()"
                    >
                    <span class="quantity-unit">${food.unit}</span>
                </div>
                <button class="quantity-btn" onclick="event.stopPropagation(); adjustQuantity(${mealIndex}, ${itemIndex}, 1)">+</button>
                <div class="meal-food-cals">${cals} kcal</div>
                <button class="quantity-btn delete-btn" onclick="event.stopPropagation(); removeFromMeal(${mealIndex}, ${itemIndex})">×</button>
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
    if (currentlyEditingMealId) {
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
    renderFoods(); 
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
        id: 'meal-' + Date.now(),
        name: name.trim(),
        foods: foodsOnly.map(f => ({ ...f, isDish: false }))
    };

    savedMeals.push(savedMeal);
    saveSavedMeals();
    renderSavedMeals();
}

function saveSavedMeals() {
    localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
}

function loadSavedMeals() {
    const stored = localStorage.getItem('savedMeals');
    if (stored) {
        try { savedMeals = JSON.parse(stored); } catch (e) { savedMeals = []; }
    }
}

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
            <div class="saved-meal" data-meal-index="${index}">
                <div class="saved-meal-header">
                    <div class="saved-meal-name">${meal.name}</div>
                    <div class="saved-meal-calories">${stats.calories} kcal</div>
                </div>
                <div class="saved-meal-macros">
                    <span class="saved-macro-item">P: ${stats.protein}g</span>
                    <span class="saved-macro-item">M: ${stats.fat}g</span>
                    <span class="saved-macro-item">UH: ${stats.carbs}g</span>
                    <span class="saved-macro-item">Tež: ${stats.totalGrams}g</span>
                </div>
                <div class="saved-meal-ingredients">
                    ${meal.foods.map(f => `<span class="ingredient-tag">${f.name} ${f.amount}${f.unit}</span>`).join('')}
                </div>
                <div class="saved-meal-actions">
                    <button class="btn-small btn-add" data-action="add"><span class="btn-icon">➕</span><span class="btn-text">Dodaj</span></button>
                    <button class="btn-small btn-edit" data-action="edit"><span class="btn-icon">🛠️</span><span class="btn-text">Edituj</span></button>
                    <button class="btn-small btn-rename" data-action="rename"><span class="btn-icon">✏️</span><span class="btn-text">Ime</span></button>
                    <button class="btn-small btn-delete" data-action="delete"><span class="btn-icon">🗑️</span><span class="btn-text">Obriši</span></button>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.saved-meal').forEach((mealEl, index) => {
        const meal = filtered[index];
        mealEl.querySelector('[data-action="add"]').onclick = () => addDishToMeal(meal);
        mealEl.querySelector('[data-action="edit"]').onclick = () => editSavedMeal(meal.id);
        mealEl.querySelector('[data-action="rename"]').onclick = () => renameSavedMeal(meal.id);
        mealEl.querySelector('[data-action="delete"]').onclick = () => deleteSavedMeal(meal.id);
    });
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
        meal.name = newName.trim();
        saveSavedMeals();
        renderSavedMeals();
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
    if (!confirm('Obriši jelo zauvek?')) return;
    savedMeals = savedMeals.filter(m => m.id !== mealId);
    saveSavedMeals();
    renderSavedMeals();
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
            <div class="edit-food-item">
                <div class="edit-food-info">
                    <div class="edit-food-name">${food.name}</div>
                    <div class="edit-food-macros">${food.amount}${food.unit} • ${cals} kcal • P:${macros.protein} M:${macros.fat} UH:${macros.carbs}</div>
                </div>
                <div class="edit-food-controls">
                    <button class="quantity-btn" onclick="adjustEditQuantity(${index}, -1)">−</button>
                    <div class="quantity-input-wrapper">
                        <input type="number" class="quantity-input" value="${food.amount}" min="${food.unit==='kom'?1:10}" step="${food.unit==='kom'?1:10}" onchange="setEditAmount(${index}, this.value)">
                        <span class="quantity-unit">${food.unit}</span>
                    </div>
                    <button class="quantity-btn" onclick="adjustEditQuantity(${index}, 1)">+</button>
                    <button class="quantity-btn delete-btn" onclick="removeFromEdit(${index})">×</button>
                </div>
            </div>`;
    }).join('');
}

// FIX: Prikaz svih namirnica u edit modu (bez limita)
function renderEditFoods() {
    const searchTerm = document.getElementById('editSearchInput').value.toLowerCase();
    const foodList = document.getElementById('editFoodList');
    
    let displayFoods = [];
    
    // Ako nema pretrage, prikaži SVE (ili prvih par stotina ako baza postane ogromna)
    if (searchTerm.length === 0) {
        displayFoods = foods; 
    } else {
        displayFoods = foods.filter(food => food.name.toLowerCase().includes(searchTerm));
    }

    if (displayFoods.length === 0) {
        foodList.innerHTML = '<div class="empty-state">Nema rezultata</div>';
        return;
    }

    foodList.innerHTML = displayFoods.map((food, index) => {
        const originalIndex = foods.indexOf(food);
        return `
        <div class="food-item" onclick="addFoodToEdit(foods[${originalIndex}])">
            <span class="food-name">${food.name}</span>
            <span class="food-calories">${food.calories} kcal / ${food.serving}${food.unit}</span>
        </div>
    `}).join('');
}

function addFoodToEdit(food) {
    const foodItem = { isDish: false, ...food, amount: food.serving, baseCalories: food.calories, baseServing: food.serving };
    editWorkspaceItems.push(foodItem);
    renderEditFoodsList();
    // Ne čistimo input da bi korisnik mogao da doda više istih stvari ako želi, ili očistiti ako želiš
    // document.getElementById('editSearchInput').value = '';
    // renderEditFoods();
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

function saveEditedMeal() {
    if (!currentlyEditingMealId) return;
    const meal = savedMeals.find(m => m.id === currentlyEditingMealId);
    if (editWorkspaceItems.length === 0) { alert('Jelo ne može biti prazno!'); return; }
    
    meal.foods = editWorkspaceItems.map(f => ({ ...f, isDish: false }));
    saveSavedMeals();
    renderSavedMeals();
    closeEditPanel();
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

function handleEditPanelBackdrop(e) { if(e.target.id === 'editPanel') cancelEditMode(); }

// ========================================
// IMPORT / EXPORT
// ========================================

function exportMeals() {
    if (savedMeals.length === 0) { alert('Nema jela za export!'); return; }
    const dataBlob = new Blob([JSON.stringify(savedMeals, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan_ishrane_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importMeals() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (!Array.isArray(imported)) throw new Error("Format nije niz");
                const isValid = imported.every(m => m && m.name && Array.isArray(m.foods));
                if (!isValid) throw new Error("Neispravna struktura jela");

                if (confirm('Klikni OK da ZAMENIŠ jela, Cancel da DODAŠ.')) {
                    savedMeals = imported;
                } else {
                    savedMeals = [...savedMeals, ...imported];
                }
                saveSavedMeals();
                renderSavedMeals();
                alert('Uspešno!');
            } catch (err) {
                alert('Greška: Fajl je oštećen ili neispravan format.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ========================================
// UPDATE TOTALA
// ========================================

function updateTotals() {
    let tCal=0, tPro=0, tFat=0, tCarb=0;
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
        const pC = tPro*4, fC = tFat*9, cC = tCarb*4;
        const total = pC+fC+cC;
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
        el.style.color = rem < 0 ? '#ffcccc' : 'white';
    } else {
        document.getElementById('remaining').textContent = '-';
    }
}

// ========================================
// LISTA NAMIRNICA (RENDER FIX)
// ========================================

function renderFoods() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const foodList = document.getElementById('foodList');
    
    let displayList = [];
    
    // FIX: Nema više limita od 50
    if (searchTerm.length === 0) {
        displayList = foods; // Prikazujemo SVE
    } else {
        displayList = foods.filter(food => food.name.toLowerCase().includes(searchTerm));
    }

    if (displayList.length === 0) {
        foodList.innerHTML = '<div class="empty-state">Nema rezultata</div>';
        return;
    }

    foodList.innerHTML = displayList.map((food, index) => {
        const originalIndex = foods.indexOf(food);
        return `
        <div class="food-item" onclick="addFoodToMeal(foods[${originalIndex}])">
            <span class="food-name">${food.name}</span>
            <span class="food-calories">${food.calories} kcal / ${food.serving}${food.unit}</span>
        </div>
    `}).join('');
}

function searchSavedMeals() { renderSavedMeals(); }

window.onload = init;