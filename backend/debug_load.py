import tensorflow as tf
import os

MODEL_PATH = "OSCC_AI_Model.h5"

if not os.path.exists(MODEL_PATH):
    print("Model file not found!")
else:
    try:
        print("Attempting to load model...")
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print("✅ Model loaded successfully!")
        model.summary()
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
