from pymongo import MongoClient
from deep_translator import GoogleTranslator
import re
import time

# 🔌 Conexión
client = MongoClient("mongodb+srv://oscarblaugrana:dcBVGQu9dgoWjt9K@fitbalance.4vcdip8.mongodb.net/")
db = client["fitbalance"]
collection = db["Food"]

translator = GoogleTranslator(source='en', target='es')

# 🧼 limpieza base
def clean_name(name):
    name = re.sub(r"\b(NFS|NS)\b", "", name)

    remove_words = [
        "raw", "cooked", "frozen", "drained",
        "with salt", "without skin", "boneless",
        "separable lean only"
    ]
    for word in remove_words:
        name = re.sub(word, "", name, flags=re.IGNORECASE)

    name = re.sub(r",+", ",", name)
    name = re.sub(r"\s+", " ", name)

    return name.strip(" ,")

# 🧠 normalización inteligente
def normalize_spanish(text):
    replacements = {
        "carne de res molida": "Carne molida",
        "carne molida de res": "Carne molida",
        "papas fritas": "Papas fritas",
        "pollo pechuga": "Pechuga de pollo",
        "huevo entero": "Huevo",
        "leche entera": "Leche",
        "arroz blanco": "Arroz",
        "pan blanco": "Pan",
    }

    text = text.lower()

    for key, value in replacements.items():
        if key in text:
            return value

    return text.capitalize()

# 🔄 proceso principal
for food in collection.find():
    try:
        # 🛑 evitar reprocesar
        if isinstance(food.get("name"), dict):
            continue

        name_en_raw = food.get("name", "")
        name_en_clean = clean_name(name_en_raw)

        # ✂️ simplificar nombre
        main_part = name_en_clean.split(",")[0]

        # 🌍 traducir
        name_es_raw = translator.translate(main_part) if main_part else ""

        # 🧠 normalizar
        name_es_final = normalize_spanish(name_es_raw)

        # 🧱 nuevo documento (SIN fiber ni sugar)
        new_doc = {
            "name": {
                "en": main_part,
                "es": name_es_final
            },
            "portion_size_g": food.get("portion_size_g", 100),
            "nutrients": {
                "energy_kcal": food.get("nutrients", {}).get("energy_kcal", 0),
                "protein_g": food.get("nutrients", {}).get("protein_g", 0),
                "carbohydrates_g": food.get("nutrients", {}).get("carbohydrates_g", 0),
                "fat_g": food.get("nutrients", {}).get("fat_g", 0)
            }
        }

        # 💾 actualizar (YA SIN conflicto)
        collection.update_one(
            {"_id": food["_id"]},
            {
                "$set": new_doc,
                "$unset": {
                    "category": ""
                }
            }
        )

        print(f"✔ {main_part} → {name_es_final}")

        time.sleep(0.1)  # ⚡ más rápido pero estable

    except Exception as e:
        print(f"❌ Error con {food.get('name')}: {e}")