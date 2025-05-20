document.addEventListener('DOMContentLoaded', () => {
    const petImage = document.getElementById('pet-image');
    const hungerValue = document.getElementById('hunger-value');
    const eggsValue = document.getElementById('eggs-value');
    const coinsValue = document.getElementById('coins-value');
    const feedButton = document.getElementById('feed-button');
    const getPetButton = document.getElementById('get-pet-button');
    const petsContainer = document.getElementById('pets-container');
    const noPetMessage = document.getElementById('no-pet-message');

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
            // Скрытие сообщения
            noPetMessage.style.display = 'none';
            // Отображение изображения питомца
            petImage.src = newPet.image;
            petImage.style.display = 'block';
        }
    });

    // Инициализация данных
    hungerValue.textContent = hunger;
    eggsValue.textContent = eggs;
    coinsValue.textContent = coins;

    // Проверка наличия питомца
    if (pets.length === 0) {
        noPetMessage.style.display = 'block';
        petImage.style.display = 'none';
    } else {
        petImage.src = pets[0].image;
        petImage.style.display = 'block';
    }
});
