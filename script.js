document.addEventListener('DOMContentLoaded', () => {
    const petImage = document.getElementById('pet-image');
    const hungerValue = document.getElementById('hunger-value');
    const eggsValue = document.getElementById('eggs-value');
    const coinsValue = document.getElementById('coins-value');
    const feedButton = document.getElementById('feed-button');

    let hunger = 100;
    let eggs = 1;
    let coins = 100;

    // Обновление данных на сервере
    function updateServerData() {
        const data = {
            action: 'update_data',
            hunger: hunger,
            eggs: eggs,
            coins: coins
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

    // Инициализация данных
    hungerValue.textContent = hunger;
    eggsValue.textContent = eggs;
    coinsValue.textContent = coins;
});