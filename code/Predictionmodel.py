# ==========================================
# AI-Based Early Detection of OSCC
# Final Prediction System — Local Version
# ==========================================

# STEP 1: Import Libraries
import sys
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import matplotlib.pyplot as plt

# -----------------------------------------

# STEP 2: Load Saved Model
model_path = "OSCC_AI_Model.h5"  # Place the model in the same folder as this script

try:
    model = tf.keras.models.load_model(model_path, compile=False)
    print("✅ Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Could not load model: {e}")
    print("Make sure OSCC_AI_Model.h5 is in the same folder as this script.")
    sys.exit(1)

# -----------------------------------------

# STEP 3: Get Image Path
# You can either hardcode the path below or pass it as a command-line argument
# Example: python oscc_predict.py my_image.jpg

if len(sys.argv) > 1:
    img_path = sys.argv[1]
else:
    img_path = input("\n📤 Enter the full path to the oral image: ").strip()

# Validate image path
import os
if not os.path.exists(img_path):
    print(f"❌ Image not found: {img_path}")
    sys.exit(1)

print(f"\n🖼️  Image loaded: {img_path}")

# -----------------------------------------

# STEP 4: Preprocess Image
img = image.load_img(img_path, target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = img_array / 255.0                        # Normalize
img_array = np.expand_dims(img_array, axis=0)        # Expand dimensions

# -----------------------------------------

# STEP 5: Make Prediction
prediction = model.predict(img_array)[0][0]

# -----------------------------------------

# STEP 6: Show Raw Probability
print(f"\n🧠 OSCC Probability: {prediction:.4f}")

# -----------------------------------------

# STEP 7: Display Image
plt.imshow(img)
plt.axis('off')
plt.title("Oral Image — OSCC Prediction")
plt.tight_layout()
plt.show()

# ==========================================
# 🔎 3-Level Medical Decision Logic
# ==========================================

threshold_high        = 0.85
threshold_suspicious  = 0.60

if prediction >= threshold_high:
    print("\n🔴 Result: High Risk of OSCC")
    print(f"   Confidence     : {prediction * 100:.2f}%")
    print("   Recommendation : Immediate Medical Evaluation Advised")

elif prediction >= threshold_suspicious:
    print("\n🟡 Result: Suspicious Lesion Detected")
    print(f"   Confidence     : {prediction * 100:.2f}%")
    print("   Recommendation : Further Clinical Examination Required")

else:
    print("\n🟢 Result: Normal Oral Tissue")
    print(f"   Confidence     : {(1 - prediction) * 100:.2f}%")
    print("   Recommendation : No immediate concern. Routine check-up advised.")