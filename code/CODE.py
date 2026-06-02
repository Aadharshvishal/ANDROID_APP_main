# ==========================================
# AI-Based Early Detection of OSCC
# Local Python Script (No Colab Required)
# ==========================================

# STEP 1: Import Libraries
import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models
from sklearn.metrics import classification_report, confusion_matrix

# -----------------------------------------

# STEP 2: Dataset Paths
# Update these paths to where you extracted your ZIP
train_path = "dataset/train"
val_path   = "dataset/val"
test_path  = "dataset/test"

IMG_SIZE   = 224
BATCH_SIZE = 32

# -----------------------------------------

# STEP 3: Verify Folders Exist
for path in [train_path, val_path, test_path]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Folder not found: {path}. Please check your dataset path.")

print("Dataset folders found. Starting preprocessing...\n")

# -----------------------------------------

# STEP 4: Data Preprocessing
train_datagen = ImageDataGenerator(rescale=1./255)
val_datagen   = ImageDataGenerator(rescale=1./255)
test_datagen  = ImageDataGenerator(rescale=1./255)

train_data = train_datagen.flow_from_directory(
    train_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary'
)

val_data = val_datagen.flow_from_directory(
    val_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary'
)

test_data = test_datagen.flow_from_directory(
    test_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    shuffle=False
)

# -----------------------------------------

# STEP 5: Build Model (MobileNetV2 Transfer Learning)
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(1, activation='sigmoid')
])

# -----------------------------------------

# STEP 6: Compile Model
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

model.summary()

# -----------------------------------------

# STEP 7: Train Model
print("\nTraining started...\n")
history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=10
)

# -----------------------------------------

# STEP 8: Plot Training History
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Val Accuracy')
plt.title('Accuracy over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.title('Loss over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.tight_layout()
plt.savefig("training_history.png")
plt.show()
print("Training plot saved as training_history.png")

# -----------------------------------------

# STEP 9: Evaluate on Test Set
print("\nEvaluating on test data...\n")
test_loss, test_accuracy = model.evaluate(test_data)
print(f"Test Loss:     {test_loss:.4f}")
print(f"Test Accuracy: {test_accuracy:.4f}")

# -----------------------------------------

# STEP 10: Classification Report
y_pred_probs = model.predict(test_data)
y_pred = (y_pred_probs > 0.5).astype(int).flatten()
y_true = test_data.classes
class_labels = list(test_data.class_indices.keys())

print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=class_labels))

print("Confusion Matrix:")
print(confusion_matrix(y_true, y_pred))

# -----------------------------------------

# STEP 11: Save Model
model.save("OSCC_AI_Model.h5")
print("\nModel saved as OSCC_AI_Model.h5")