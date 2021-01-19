const mealsContainer = document.querySelector('.meals');
const favMealContainer = document.querySelector('.fav__row');
const search = document.querySelector('.search');


// функция для получения random meal
async function getRandomMeal(){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();

    const meal = await respData.meals[0];
    addMeal(meal, true);
}

// запускаем функцию чтобюы всегда отобразить рандомную блюду
getRandomMeal();

// очищаем favMeal и добавляем favMeal если есть в ЛС
fetchFavMeals();

// функция для полученя блюдо по назовании
async function getMealsBySearch(term){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const respData = await resp.json();

    const meals = await respData.meals;

    return meals;
}

// для получения данные блюдо по ИД
async function getMealById(id){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const respData = await resp.json();

    const meal = respData.meals[0];

    return meal;
}


const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    searchByValue();
});



async function searchByValue(){
    const value = search.value;
    const meals = await getMealsBySearch(value);

    // очистим от предедущих блюд 
    mealsContainer.innerHTML = ``;

    if(value === ''){
        search.style.border = '1px solid red';
        mealsContainer.innerHTML = `<div style='color: red; text-align:center'>Write something to search</div>`;
    }else {
        search.style.border = '';
        if(meals){
            meals.forEach(meal => {
                addMeal(meal);
                search.value = '';
            });
        }else {
            mealsContainer.innerHTML = `<div class="no">Sorry, I can't find ${value}</div>`;
            search.value = '';
        }
    }

}


function addMeal(mealData, random = false){
    // вытаскиваем нуюные нам элементы то есть деструктизация 
    const {strMeal, strMealThumb, idMeal} = mealData;
    const mealCard = document.createElement('div');
    mealCard.classList.add('meal__card');

    mealCard.innerHTML = `
        <h2 class="random__recipe">${random ? 'Random Recipe' : ''}</h2>
        <img src=${strMealThumb} alt="">
        <div class="meal__info">
            <h2>${strMeal}</h2>
            <button class="fav__btn">
                <i class="fa fa-heart"></i>
            </button>
        </div>
    `;

   const favBtn = mealCard.querySelector('.fav__btn');

   favBtn.addEventListener('click', () => {
        if(favBtn.classList.contains('active')){
            favBtn.classList.remove('active');
            removeMealLS(idMeal);
        }else {
            favBtn.classList.add('active');
            addMealLS(idMeal);
        }

        fetchFavMeals();
        
   });

   mealCard.addEventListener('click', (e) => {
        if(e.target.parentNode.classList.contains('meal__card')){
            showMealInfo(mealData);
        }

   });

    mealsContainer.appendChild(mealCard);

    
}


//  работа с локальным хранилищем 
function getMealsLS(){
    const mealsIds = JSON.parse(localStorage.getItem('mealsIds'));
    
    return mealsIds === null ? [] : mealsIds ;
}

function addMealLS(id){
    const mealsIds = getMealsLS();

    mealsIds.push(id);

    localStorage.setItem('mealsIds', JSON.stringify(mealsIds));

}

 function removeMealLS(id){

    const mealsIds = getMealsLS();

    localStorage.setItem('mealsIds', JSON.stringify(mealsIds.filter(mealId => mealId !== id)));
}



// ======================= получем все понравшиеся блюды от ЛС и добавляем на страницу 
async function fetchFavMeals() {
    // при каждом понравившим блюде сначало очистим контейнер 
    favMealContainer.innerHTML = ``;

    // получаем ид блюды 
    const mealIds = getMealsLS();

    for(let i = 0; i < mealIds.length; i++){
        // получем каждую ИД отдельно
        const mealId = mealIds[i];
        // получаем от сервера все данные блюдо по ИД 
        meal = await getMealById(mealId);

        // функция для добавление данных на страницу 
        addFavMeal(meal);
    }
    

}


function addFavMeal(mealData){
    const {strMeal, strMealThumb, idMeal} = mealData;
    
    const favMeal = document.createElement('div');
    favMeal.classList.add('fav__item');

    favMeal.innerHTML = `
        <img src=${strMealThumb} alt=${strMeal}>
        <span>${strMeal}</span>
        <button class='fav__item-close'><i class="fas fa-window-close"></i></button>
    `;

    const closeBtn = favMeal.querySelector('.fav__item-close');
    
    closeBtn.addEventListener('click', () => {
        removeMealLS(idMeal);
        fetchFavMeals();
    });

    favMeal.addEventListener('click', (e) => {
        if(e.target.parentNode.classList.contains('fav__item')){
            showMealInfo(mealData);
        }
    });

    favMealContainer.appendChild(favMeal);

}

function showMealInfo(mealData){
    const popup = document.createElement('div');
    popup.classList.add('popup');

    popup.innerHTML = `
        <div class='meal__popup'>
        <button class="close__popup">&times;</button>
        <h2 class="meal__info-title">${mealData.strMeal}</h2>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">

        <p class="meal__info-about">${mealData.strInstructions.length > 100 ? mealData.strInstructions.slice(0,500)+' ...' : mealData.strInstructions}</p>
        </div>
    `;

    const closePopup = popup.querySelector('.close__popup');

    closePopup.addEventListener('click', () => {
        popup.remove();
    });

    document.body.appendChild(popup);
}