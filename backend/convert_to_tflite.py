import tensorflow as tf
import os

def convert():
    model_path = os.path.join(os.path.dirname(__file__), "OSCC_AI_Model.keras")
    tflite_path = os.path.join(os.path.dirname(__file__), "OSCC_AI_Model.tflite")

    if not os.path.exists(model_path):
        print(f"Error: Model file not found at {model_path}")
        return

    print("Loading Keras model...")
    model = tf.keras.models.load_model(model_path)

    print("Converting to TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)

    # Optimization (Optional but recommended for mobile)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]

    tflite_model = converter.convert()

    print(f"Saving TFLite model to {tflite_path}...")
    with open(tflite_path, "wb") as f:
        f.write(tflite_model)

    print("Conversion successful!")

if __name__ == "__main__":
    convert()
