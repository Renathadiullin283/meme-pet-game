document.addEventListener('DOMContentLoaded', () => {
  const hungerValue = document.getElementById('hunger-value');
  const eggsValue = document.getElementById('eggs-value');
  const coinsValue = document.getElementById('coins-value');
  const feedButton = document.getElementById('feed-button');
  const breedButton = document.getElementById('breed-button');
  const inventoryList = document.getElementById('inventory-list');
  const petImage = document.getElementById('pet-image');
  const prevPetBtn = document.getElementById('prev-pet');
  const nextPetBtn = document.getElementById('next-pet');

  let hunger = 100;
  let coins = 100;
  let eggs = { common: 3, rare: 2, legendary: 1 };
  let inventory = [{ name: 'Еда', type: 'food', count: 3 }];
  let pets = [];
  let activePetIndex = 0;

  const petsPool = {
    common: [
      { name: 'Сидящий котик', image: 'images/cat.gif' },
      { name: 'Пицца-дог', image: 'images/pizza_dog.gif' }
    ],
    rare: [
      { name: 'Кот на лапках', image: 'images/cat2.gif' },
      { name: 'Корги', image: 'images/dog1.gif' }
    ],
    legendary: [
      { name: 'Пёс с поворотом', image: 'images/dog3.gif' },
      { name: 'Дог на диване', image: 'images/dog2.gif' }
    ]
  };

  function updateActivePet() {
    if (pets.length > 0) {
      const pet = pets[activePetIndex % pets.length];
      petImage.src = pet.image;
      petImage.alt = pet.name;
    } else {
      petImage.src = '';
      petImage.alt = '';
    }
  }

  prevPetBtn.addEventListener('click', () => {
    if (pets.length > 0) {
      activePetIndex = (activePetIndex - 1 + pets.length) % pets.length;
      updateActivePet();
    }
  });

  nextPetBtn.addEventListener('click', () => {
    if (pets.length > 0) {
      activePetIndex = (activePetIndex + 1) % pets.length;
      updateActivePet();
    }
  });

  function updateInventoryDOM() {
    inventoryList.innerHTML = '';
    inventory.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} x${item.count}`;
      li.onclick = () => {
        if (item.type === 'food' && item.count > 0) {
          hunger = Math.min(100, hunger + 20);
          item.count--;
          hungerValue.textContent = hunger;
          updateInventoryDOM();
        }
      };
      inventoryList.appendChild(li);
    });
  }

  function updateUI() {
    hungerValue.textContent = hunger;
    coinsValue.textContent = coins;
    eggsValue.textContent = Object.values(eggs).reduce((a, b) => a + b, 0);
    updateInventoryDOM();
    updateActivePet();
  }

  function addPetToDOM(pet) {
    pets.push(pet);
    activePetIndex = pets.length - 1;
    updateActivePet();
  }

  feedButton.addEventListener('click', () => {
    const foodItem = inventory.find(i => i.type === 'food' && i.count > 0);
    if (foodItem) {
      foodItem.count--;
      hunger = Math.min(100, hunger + 20);
      hungerValue.textContent = hunger;
      updateInventoryDOM();
    } else {
      alert('Нет еды в инвентаре!');
    }
  });

  breedButton.addEventListener('click', () => {
    if (pets.length >= 2 && coins >= 50) {
      coins -= 50;
      const baby = { name: 'Мемный малыш', image: 'images/baby_pet.png' };
      addPetToDOM(baby);
      updateUI();
      alert('Появился новый питомец!');
    } else {
      alert('Нужно хотя бы 2 питомца и 50 монет');
    }
  });

  document.querySelectorAll('.egg-button').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.getAttribute('data-type');
      if (eggs[type] > 0) {
        eggs[type]--;
        const wait = { common: 1000, rare: 3000, legendary: 5000 }[type];
        setTimeout(() => {
          const pool = petsPool[type];
          const pet = pool[Math.floor(Math.random() * pool.length)];
          addPetToDOM(pet);
          updateUI();
          alert(`${pet.name} вылупился из ${type} яйца!`);
        }, wait);
        updateUI();
      } else {
        alert(`Нет ${type} яиц!`);
      }
    });
  });

  updateUI();
});
