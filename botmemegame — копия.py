import asyncio
from telegram import Update, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import Application, CommandHandler, MessageHandler, filters
import json
import uuid
import pickle
import os
import signal

# Конфигурационные параметры
BOT_TOKEN = "7687263835:AAEucSi1BOS2wHs__Tgq4cMRiBlQP8QI6mQ"
WEB_APP_URL = "https://renathadiullin283.github.io/meme-pet-game/"

# Пути к данным
DATA_DIR = os.path.expanduser("~/meme_pet_data")
DATA_PATH = os.path.join(DATA_DIR, "users.pkl")
os.makedirs(DATA_DIR, exist_ok=True)

def save_users():
    """Сохраняет данные пользователей с обработкой ошибок"""
    try:
        with open(DATA_PATH, 'wb') as f:
            pickle.dump(users_db, f)
        print(f"✅ Данные сохранены: {len(users_db)} пользователей")
    except Exception as e:
        print(f"🔥 Ошибка сохранения: {str(e)}")

def load_users():
    """Загружает данные пользователей"""
    global users_db
    try:
        with open(DATA_PATH, 'rb') as f:
            users_db = pickle.load(f)
            print(f"✅ Загружено {len(users_db)} пользователей")
    except (FileNotFoundError, EOFError):
        users_db = {}
        print("❌ Создана новая БД")

load_users()

class Pet:
    def __init__(self, pet_name, image_url):
        self.id = str(uuid.uuid4())
        self.name = pet_name
        self.image = image_url
        self.level = 1
        self.hunger = 100

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image": self.image,
            "level": self.level,
            "hunger": self.hunger
        }

async def start(update: Update, context):
    global users_db
    user_id = update.effective_user.id
    
    if user_id not in users_db:
        users_db[user_id] = {
            "eggs": 1,
            "pets": [],
            "meme_coins": 100
        }
        save_users()
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton(
            "🎮 Открыть игру", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ])
    
    await update.message.reply_text(
        "Добро пожаловать в MemePet!",
        reply_markup=keyboard
    )

async def handle_webapp_data(update: Update, context):
    global users_db
    user_id = update.effective_user.id
    
    try:
        data = json.loads(update.effective_message.web_app_data.data)
        action = data.get("action")
        
        # Проверка регистрации пользователя
        if user_id not in users_db:
            raise ValueError("Сначала запустите команду /start")

        user_data = users_db[user_id]
        
        # Гарантируем наличие обязательных полей
        user_data.setdefault("eggs", 0)
        user_data.setdefault("pets", [])
        user_data.setdefault("meme_coins", 0)

        if action == "get_data":
            await update.message.reply_text(
                json.dumps(user_data),
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔄 Обновить", web_app=WebAppInfo(url=WEB_APP_URL))]
                ])
            )   
            new_pet = Pet("Doge", "https://i.imgur.com/5JZ8Q2a.png")
            users_db[user_id]["pets"].append(new_pet.to_dict())
            users_db[user_id]["eggs"] -= 1
            save_users()
            await update.message.reply_text(f"🎉 Вы получили: {new_pet.name}!")
            await update.message.reply_text(
                json.dumps(users_db[user_id]),
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔄 Обновить", web_app=WebAppInfo(url=WEB_APP_URL))]
                ])
            )
        
        elif action == "feed":
            if not users_db[user_id]["pets"]:
                raise ValueError("Нет питомца!")
            
            users_db[user_id]["pets"][0]["hunger"] = max(0, users_db[user_id]["pets"][0]["hunger"] - 20)
            save_users()
            await update.message.reply_text("🍖 Питомец накормлен!")
            await update.message.reply_text(
                json.dumps(users_db[user_id]),
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔄 Обновить", web_app=WebAppInfo(url=WEB_APP_URL))]
                ])
            )
        
        else:
            raise ValueError("Неизвестное действие")

    except Exception as e:
        print(f"🚨 Ошибка: {str(e)}")
        await update.message.reply_text(f"⚠️ Ошибка: {str(e)}")

def save_on_exit(signum, frame):
    print("\n🔴 Завершение работы...")
    save_users()
    exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, save_on_exit)
    signal.signal(signal.SIGTERM, save_on_exit)
    
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))
    
    print("🤖 Бот запущен")
    asyncio.run(app.run_polling())