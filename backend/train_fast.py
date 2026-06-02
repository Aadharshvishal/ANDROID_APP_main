import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models

# 1. Paths
train_path = r"D:\d\PDD\Dataset photos\train"
val_path   = r"D:\d\PDD\Dataset photos\val"

IMG_SIZE   = 224
BATCH_SIZE = 32
EPOCHS     = 2  # Reduced to 2 for ultra-fast generation

print("Loading dataset...")
train_datagen = ImageDataGenerator(rescale=1./255)
val_datagen   = ImageDataGenerator(rescale=1./255)

train_data = train_datagen.flow_from_directory(
    train_path, target_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH_SIZE, class_mode='binary'
)

val_data = val_datagen.flow_from_directory(
    val_path, target_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH_SIZE, class_mode='binary'
)

print("Building MobileNetV2...")
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False

inputs = tf.keras.Input(shape=(224, 224, 3))
x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dense(128, activation='relu')(x)
x = layers.Dropout(0.5)(x)
outputs = layers.Dense(1, activation='sigmoid')(x)

model = models.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

print("Starting training (Just 2 epochs)...")
model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS
)

model.save("OSCC_AI_Model.keras")
print("✅ Saved native Keras 3 model to OSCC_AI_Model.keras")
