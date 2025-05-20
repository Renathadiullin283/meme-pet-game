document.addEventListener('DOMContentLoaded', () => {
    const petCanvas = document.getElementById('pet-canvas');
    const hungerValue = document.getElementById('hunger-value');
    const eggsValue = document.getElementById('eggs-value');
    const coinsValue = document.getElementById('coins-value');
    const feedButton = document.getElementById('feed-button');
    const getPetButton = document.getElementById('get-pet-button');
    const petsContainer = document.getElementById('pets-container');

    let hunger = 100;
    let eggs = 1;
    let coins = 100;
    let pets = [];

    // Создание 3D-сцены
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: petCanvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Добавление света
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Добавление 3D-модели питомца
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();

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

    // Инициализация данных
    hungerValue.textContent = hunger;
    eggsValue.textContent = eggs;
    coinsValue.textContent = coins;
});
