import os
import json

base_path = r'C:\Users\Melissa\OneDrive\Repositorios\n8n currículo\Workflows'
files = [f for f in os.listdir(base_path) if f.endswith('.json')]

for f_name in files:
    full_path = os.path.join(base_path, f_name)
    print(f"---FILE_START:{f_name}---")
    with open(full_path, 'r', encoding='utf-8') as f:
        print(f.read())
    print(f"---FILE_END:{f_name}---")
