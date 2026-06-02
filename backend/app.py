from flask import Flask, request, jsonify
from flask_cors import CORS
try:
    import tensorflow as tf
except Exception:
    tf = None
import numpy as np
from PIL import Image
import io
import os
import random

app = Flask(__name__)
CORS(app)  # Allow requests from the mobile app

# Supabase server client (uses SERVICE_ROLE_KEY - keep secret)
try:
    from supabase import create_client
except Exception:
    create_client = None

# Supabase server client (uses SERVICE_ROLE_KEY - keep secret)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = None
if create_client and SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("Supabase client initialized")
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
else:
    if not create_client:
        print("Supabase client library not installed; DB writes will be disabled.")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Load the trained OSCC .keras model
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
MODEL_PATH = os.path.join(os.path.dirname(__file__), "OSCC_AI_Model.keras")

model = None

def load_model():
    global model
    if tf is None:
        print("TensorFlow not available; skipping model load.")
        return False
    if not os.path.exists(MODEL_PATH):
        print(f"Model file not found at: {MODEL_PATH}")
        return False
    try:
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print("âœ… OSCC Model loaded successfully (Native Keras 3)!")
        return True
    except Exception as e:
        print(f"Failed to load model: {e}")
        return False

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Health check endpoint
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "running",
        "model_loaded": model is not None,
        "message": "OSCC Detection API is active"
    })

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Prediction endpoint
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@app.route("/predict", methods=["POST"])
def predict():
    skip_model = os.getenv("SKIP_MODEL", "").lower() in ("1", "true", "yes")
    if model is None and not skip_model:
        return jsonify({
            "error": "Model not loaded. Please ensure OSCC_AI_Model.keras is present or set SKIP_MODEL=true to simulate predictions."
        }), 503

    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Use key 'image' in form-data."}), 400

    file = request.files["image"]

    try:
        # Read and preprocess image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img = img.resize((224, 224))
        
        img_array = np.array(img, dtype=np.float32)
        img_array = img_array / 255.0                        # Normalize [0, 1]
        img_array = np.expand_dims(img_array, axis=0)        # Shape: (1, 224, 224, 3)

        # Run prediction (or simulate if model missing)
        if model is not None:
            raw_score = float(model.predict(img_array)[0][0])
        else:
            raw_score = float(random.uniform(0, 1))

        # 3-Level Medical Decision Logic
        THRESHOLD_HIGH        = 0.85
        THRESHOLD_SUSPICIOUS  = 0.60

        if raw_score >= THRESHOLD_HIGH:
            risk_level      = "High Risk"
            confidence      = round(raw_score * 100, 2)
            recommendation  = "Immediate Medical Evaluation Advised"
            color_code      = "red"
        elif raw_score >= THRESHOLD_SUSPICIOUS:
            risk_level      = "Suspicious"
            confidence      = round(raw_score * 100, 2)
            recommendation  = "Further Clinical Examination Required"
            color_code      = "yellow"
        else:
            risk_level      = "Normal"
            confidence      = round((1 - raw_score) * 100, 2)
            recommendation  = "No immediate concern. Routine check-up advised."
            color_code      = "green"

        return jsonify({
            "risk_level":     risk_level,
            "confidence":     confidence,
            "recommendation": recommendation,
            "color_code":     color_code,
            "raw_score":      raw_score
        })

        # Persist prediction to Supabase (non-blocking; log failures)
        if supabase:
            try:
                supabase.table('predictions').insert({
                    'raw_score': float(raw_score),
                    'risk_level': risk_level,
                    'confidence': float(confidence),
                    'recommendation': recommendation
                }).execute()
            except Exception as e:
                print(f"Failed to write prediction to Supabase: {e}")

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Run the server
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if __name__ == "__main__":
    skip_model = os.getenv("SKIP_MODEL", "").lower() in ("1", "true", "yes")
    if load_model() or skip_model:
        if not load_model():
            print("Model not loaded — running in simulated prediction mode (SKIP_MODEL=true).")
        print("\n>> Starting OSCC Detection API on http://0.0.0.0:5000\n")
        app.run(host="0.0.0.0", port=5000, debug=False)
    else:
        print("\nWARNING  Server not started - model file missing or incompatible. To start anyway set SKIP_MODEL=true")

