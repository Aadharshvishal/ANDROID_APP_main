import os
import glob

screens_dir = r"d:\d\PDD\mobile_app\screens"
files = glob.glob(os.path.join(screens_dir, "*.js"))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "// , {" in content or "// ,{" in content:
        # It's broken due to my previous replacement.
        # Original was: import React, { useState } from 'react';
        # Replaced with: import React from 'react';\nimport { Ionicons } from '@expo/vector-icons';\n// , { useState } from 'react';
        
        lines = content.split('\n')
        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            if line.startswith("import React from 'react';"):
                if i+2 < len(lines) and lines[i+1].startswith("import { Ionicons }") and lines[i+2].startswith("// ,"):
                    # Reform the original import React line
                    original_rest = lines[i+2].replace("// ,", ",", 1)
                    new_lines.append(f"import React{original_rest}")
                    new_lines.append(lines[i+1]) # Ionicons
                    i += 3
                    continue
            new_lines.append(line)
            i += 1
            
        with open(f, 'w', encoding='utf-8') as file:
            file.write('\n'.join(new_lines))
        print(f"Fixed imports in {os.path.basename(f)}")
