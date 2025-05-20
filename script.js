document.addEventListener('DOMContentLoaded', () => {
    const petImage = document.getElementById('pet-image');
    const hungerValue = document.getElementById('hunger-value');
    const eggsValue = document.getElementById('eggs-value');
    const coinsValue = document.getElementById('coins-value');
    const feedButton = document.getElementById('feed-button');
    const getPetButton = document.getElementById('get-pet-button');
    const eggsButton = document.getElementById('eggs-button');
    const petsButton = document.getElementById('pets-button');
    const petsContainer = document.getElementById('pets-container');

    let hunger = 100;
    let eggs = 1;
    let coins = 100;
    let pets = [];

    // Обновление данных на сервере
    function updateServerData() {
        const data = {
            action: 'update_data',
            hunger: hunger,
            eggs: eggs,
            coins: coins,
            pets: pets
        };

        // Отправка данных на сервер через POST-запрос
        fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Данные обновлены:', data);
        })
        .catch(error => {
            console.error('Ошибка при обновлении данных:', error);
        });
    }

    // Обработка нажатия кнопки "Накормить"
    feedButton.addEventListener('click', () => {
        if (hunger > 0) {
            hunger -= 20;
            hungerValue.textContent = hunger;
            updateServerData();
        }
    });

    // Обработка нажатия кнопки "Получить питомца"
    getPetButton.addEventListener('click', () => {
        if (eggs > 0) {
            eggs -= 1;
            eggsValue.textContent = eggs;
            // Логика получения нового питомца
            const newPet = {
                name: "New Pet",
                image: "images/new_pet.png",
                hunger: 100
            };
            pets.push(newPet);
            // Обновление интерфейса
            updateServerData();
            alert("Вы получили нового питомца!");
            // Отображение нового питомца
            const petElement = document.createElement('img');
            petElement.src = newPet.image;
            petElement.alt = newPet.name;
            petsContainer.appendChild(petElement);
        }
    });

    // Обработка нажатия кнопки "Яйца"
    eggsButton.addEventListener('click', () => {
        // Логика для открытия меню с яйцами
        alert("Открытие меню с яйцами");
    });

    // Обработка нажатия кнопки "Мои питомцы"
    petsButton.addEventListener('click', () => {
        // Логика для открытия меню с питомцами
        alert("Открытие меню с питомцами");
    });

    // Инициализация данных
    hungerValue.textContent = hunger;
    eggsValue.textContent = eggs;
    coinsValue.textContent = coins;
});
