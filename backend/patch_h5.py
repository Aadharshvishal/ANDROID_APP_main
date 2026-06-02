import h5py
import json

try:
    with h5py.File('OSCC_AI_Model.h5', 'r+') as f:
        if 'model_config' in f.attrs:
            config_str = f.attrs['model_config']
            if isinstance(config_str, bytes):
                config_str = config_str.decode('utf-8')
            
            if '"batch_shape"' in config_str:
                config_str = config_str.replace('"batch_shape"', '"batch_input_shape"')
                f.attrs['model_config'] = config_str.encode('utf-8')
                print('SUCCESS: Patched batch_shape to batch_input_shape in OSCC_AI_Model.h5.')
            else:
                print('No batch_shape found. Perhaps already patched?')
        else:
            print('model_config not found in attributes.')
except Exception as e:
    print(f'Error: {e}')
