
// ========== Telegram WebApp init ==========
let tg = window.Telegram.WebApp;
tg.expand();

// ========== Игровое состояние ==========
let player = {
  level: 1,
  xp: 0,
  coins: 100,
  pets: [],
  eggs: { common: 1, rare: 0, legendary: 0 },
  inventory: [],
  activePetIndex: 0
};

let allPets = [];

// ========== Загрузка питомцев ==========
fetch('pets_data.json')
  .then(res => res.json())
  .then(data => {
    allPets = data;
    console.log('Загружено питомцев:', allPets.length);
    loadProgress();
    renderAll();
  });

// ========== Сохранение и загрузка ==========
function saveProgress() {
  localStorage.setItem('memepet_save', JSON.stringify(player));
  if (tg && tg.sendData) {
    tg.sendData(JSON.stringify({ type: 'save', data: player }));
  }
}

function loadProgress() {
  const saved = localStorage.getItem('memepet_save');
  if (saved) player = JSON.parse(saved);
}

// ========== Уровень, XP, монеты ==========
function addXP(amount) {
  player.xp += amount;
  const xpMax = 50 + player.level * 25;
  while (player.xp >= xpMax) {
    player.xp -= xpMax;
    player.level++;
    tryEvolvePet();
  }
  renderStats();
  saveProgress();
}

// ========== Эволюция питомца ==========
function tryEvolvePet() {
  const pet = player.pets[player.activePetIndex];
  if (!pet || !pet.stage || !pet.name) return;
  const base = allPets.find(p => p.base.name === pet.name || p.stage1.name === pet.name || p.stage2.name === pet.name);
  if (!base) return;
  if (pet.stage === 'base' && player.level >= 5) {
    Object.assign(pet, base.stage1);
    pet.stage = 'stage1';
  } else if (pet.stage === 'stage1' && player.level >= 10) {
    Object.assign(pet, base.stage2);
    pet.stage = 'stage2';
  }
}

// ========== Вылупление яиц ==========
function hatchEgg(rarity) {
  if (player.eggs[rarity] <= 0) return alert("Нет яиц!");
  const pool = allPets.map(p => p.base).filter(p => p.rarity === rarity);
  if (!pool.length) return alert("Нет питомцев этой редкости!");
  const pet = JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
  pet.stage = 'base';
  pet.currentHp = pet.hp;
  player.pets.push(pet);
  player.eggs[rarity]--;
  addXP(10);
  renderAll();
  saveProgress();
}

// ========== PvP бой ==========
function startPvPBattle() {
  const pet = player.pets[player.activePetIndex];
  if (!pet) return alert("Нет активного питомца!");
  const enemy = generateEnemy();
  let log = [`Ты: ${pet.name} (${pet.hp}/${pet.attack})`, `Враг: ${enemy.name} (${enemy.hp}/${enemy.attack})`];
  let myHP = pet.hp, enemyHP = enemy.hp;
  while (myHP > 0 && enemyHP > 0) {
    enemyHP -= pet.attack;
    if (enemyHP <= 0) break;
    myHP -= enemy.attack;
  }
  if (myHP > 0) {
    log.push("Победа! +20 монет, +10 XP");
    player.coins += 20;
    addXP(10);
  } else {
    log.push("Поражение... +2 XP");
    addXP(2);
  }
  alert(log.join('\n'));
  renderStats();
  saveProgress();
}

function generateEnemy() {
  return {
    name: "Враг",
    image: "enemy.gif",
    hp: 100 + Math.floor(Math.random() * 30),
    attack: 8 + Math.floor(Math.random() * 8)
  };
}

// ========== Отображение UI ==========
function renderStats() {
  document.getElementById("player-level").textContent = player.level;
  document.getElementById("player-xp").textContent = player.xp;
  document.getElementById("player-coins").textContent = player.coins;
}

function renderActivePet() {
  const pet = player.pets[player.activePetIndex];
  if (!pet) return;
  document.getElementById("active-pet-name").textContent = pet.name;
  document.getElementById("active-pet-hp").textContent = pet.hp;
  document.getElementById("active-pet-atk").textContent = pet.attack;
  document.getElementById("active-pet-img").src = "images/" + pet.image;
}

function renderPets() {
  const container = document.getElementById("pets-grid");
  if (!container) return;
  container.innerHTML = "";
  player.pets.forEach((pet, i) => {
    const el = document.createElement("div");
    el.className = "pet-card";
    el.innerHTML = `
      <img src="images/${pet.image}" alt="${pet.name}">
      <h4>${pet.name}</h4>
      <p>HP: ${pet.hp} | ATK: ${pet.attack}</p>
      <p>Стадия: ${pet.stage}</p>
      <button onclick="setActivePet(${i})">Выбрать</button>`;
    container.appendChild(el);
  });
}

function setActivePet(index) {
  player.activePetIndex = index;
  renderActivePet();
  saveProgress();
}

function renderAll() {
  renderStats();
  renderActivePet();
  renderPets();
}
