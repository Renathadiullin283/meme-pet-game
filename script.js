
let allPetsPool = [];

// Загрузка питомцев из внешнего файла
fetch('pets_data.json')
  .then(response => response.json())
  .then(data => {
    allPetsPool = data;
    console.log("Питомцы загружены:", allPetsPool.length);
  });

// Пример вылупления питомца из выбранного типа яйца
function hatchEgg(type) {
  const pool = allPetsPool.map(p => p.base).filter(p => p.rarity === type);
  if (pool.length === 0) return alert("Нет питомцев подходящей редкости");
  const pet = JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
  addPetToDOM(pet);
}
