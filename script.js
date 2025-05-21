document.addEventListener('DOMContentLoaded', () => {
    const petCanvas = document.getElementById('pet-canvas');
    const hungerValue = document.getElementById('hunger-value');
    const eggsValue = document.getElementById('eggs-value');
    const coinsValue = document.getElementById('coins-value');
    const feedButton = document.getElementById('feed-button');
    const breedButton = document.getElementById('breed-button');
    const petsContainer = document.getElementById('pets-container');
    const inventoryList = document.getElementById('inventory-list');

    let hunger = 100;
    let eggs = 5;
    let coins = 100;
    let pets = [];
    let inventory = [{ name: 'Еда', type: 'food', count: 3 }];

    const petsPool = {
    common: [
        { name: 'Сидящий котик', image: 'images/cat.gif' },
        { name: 'Пицца-дог', image: 'images/pizza_dog.gif' }
    ],
    rare: [
        { name: 'Кот на задних лапах', image: 'images/cat2.gif' },
        { name: 'Корги', image: 'images/dog1.gif' }
    ],
    legendary: [
        { name: 'Пёс с поворотом головы', image: 'images/dog3.gif' },
        { name: 'Дог на диване', image: 'images/dog2.gif' }
    ]
};

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: petCanvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;

    function updatePetMood() {
        if (hunger > 60) cube.material.color.set(0x00ff00);
        else if (hunger > 20) cube.material.color.set(0xffff00);
        else cube.material.color.set(0xff0000);
    }

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();

    setInterval(() => {
        hunger = Math.max(0, hunger - 5);
        hungerValue.textContent = hunger;
        updatePetMood();
        updateServerData();
    }, 10000);

    function saveToLocal() {
        localStorage.setItem('gameData', JSON.stringify({ hunger, eggs, coins, pets, inventory }));
    }

    function loadFromLocal() {
        const data = JSON.parse(localStorage.getItem('gameData'));
        if (data) {
            ({ hunger, eggs, coins, pets, inventory } = data);
            hungerValue.textContent = hunger;
            eggsValue.textContent = eggs;
            coinsValue.textContent = coins;
            pets.forEach(p => addPetToDOM(p));
            updateInventoryDOM();
            updatePetMood();
        }
    }

    function updateInventoryDOM() {
        inventoryList.innerHTML = '';
        inventory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} x${item.count}`;
            li.style.cursor = 'pointer';
            li.onclick = () => {
                if (item.type === 'food' && item.count > 0) {
                    hunger = Math.min(100, hunger + 20);
                    item.count--;
                    document.getElementById('feed-sound').play();
                    hungerValue.textContent = hunger;
                    updatePetMood();
                    updateInventoryDOM();
                    updateServerData();
                }
            };
            inventoryList.appendChild(li);
        });
    }

    function addPetToDOM(pet) {
        const petElement = document.createElement('img');
        petElement.src = pet.image;
        petElement.alt = pet.name;
        petsContainer.appendChild(petElement);
    }

    feedButton.addEventListener('click', () => {
        const foodItem = inventory.find(i => i.type === 'food' && i.count > 0);
        if (foodItem) {
            foodItem.count--;
            hunger = Math.min(100, hunger + 20);
            document.getElementById('feed-sound').play();
            hungerValue.textContent = hunger;
            updatePetMood();
            updateInventoryDOM();
            updateServerData();
        } else {
            alert('Нет еды в инвентаре!');
        }
    });

    breedButton.addEventListener('click', () => {
        if (pets.length >= 2 && coins >= 50) {
            coins -= 50;
            coinsValue.textContent = coins;
            const newPet = { name: 'Baby Pet', image: 'images/baby_pet.png', hunger: 100 };
            pets.push(newPet);
            addPetToDOM(newPet);
            alert('Новый питомец появился в результате скрещивания!');
            updateServerData();
        } else {
            alert('Нужно хотя бы 2 питомца и 50 монет!');
        }
    });

    document.querySelectorAll('.egg-button').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            const eggCost = { common: 1, rare: 2, legendary: 3 };
            if (eggs >= eggCost[type]) {
                eggs -= eggCost[type];
                eggsValue.textContent = eggs;

                const waitTimes = { common: 2000, rare: 4000, legendary: 7000 };
                alert(`Яйцо вылупляется... (${type})`);
                setTimeout(() => {
                    const pool = petsPool[type];
                    const pet = pool[Math.floor(Math.random() * pool.length)];
                    const newPet = { ...pet, hunger: 100 };
                    pets.push(newPet);
                    addPetToDOM(newPet);
                    alert(`Питомец ${pet.name} вылупился из яйца!`);
                    updateServerData();
                }, waitTimes[type]);
            } else {
                alert(`Недостаточно яиц для ${type} яйца.`);
            }
        });
    });

    function updateServerData() {
        saveToLocal();
    }

    window.addEventListener('beforeunload', saveToLocal);
    loadFromLocal();
});
