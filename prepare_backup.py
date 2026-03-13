
import os
import json

base_path = r'c:\Users\Melissa\OneDrive\Repositorios\n8n currículo\web-app-v2'
excludes = ['node_modules', 'dist', '.git', 'package-lock.json', 'public', 'assets', 'vite.svg', 'react.svg']
binary_extensions = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico']

def get_files(path):
    all_files = []
    for root, dirs, filenames in os.walk(path):
        # Filter directories
        dirs[:] = [d for d in dirs if d not in excludes]
        
        for filename in filenames:
            if any(filename.endswith(ext) for ext in binary_extensions):
                continue
            if filename in excludes:
                continue
                
            full_path = os.path.join(root, filename)
            rel_path = os.path.relpath(full_path, base_path).replace('\\', '/')
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    all_files.append({'path': 'web-app-v2/' + rel_path, 'content': content})
            except Exception as e:
                print(f"Error reading {full_path}: {e}")
    return all_files

files = get_files(base_path)

# Split into chunks of 15 files to avoid large payloads
chunk_size = 15
for i in range(0, len(files), chunk_size):
    chunk = files[i:i + chunk_size]
    with open(f'backup_chunk_{i//chunk_size}.json', 'w', encoding='utf-8') as f:
        json.dump(chunk, f)
    print(f"Created backup_chunk_{i//chunk_size}.json with {len(chunk)} files")
