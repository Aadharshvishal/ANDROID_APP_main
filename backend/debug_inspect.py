"""
Inspect h5 model file to determine its architecture.
"""
import h5py
import json

MODEL_PATH = "OSCC_AI_Model.h5"

with h5py.File(MODEL_PATH, "r") as f:
    # Print top-level keys
    print("Top-level keys:", list(f.keys()))

    if "model_config" in f.attrs:
        config = json.loads(f.attrs["model_config"])
        print("\nModel class:", config.get("class_name"))
        layers = config.get("config", {}).get("layers", [])
        print(f"Number of layers: {len(layers)}")
        for i, layer in enumerate(layers):
            print(f"  Layer {i}: {layer.get('class_name')} - {layer.get('config', {}).get('name', '')}")

    if "keras_version" in f.attrs:
        print("\nKeras version:", f.attrs["keras_version"])
    if "backend" in f.attrs:
        print("Backend:", f.attrs["backend"])
