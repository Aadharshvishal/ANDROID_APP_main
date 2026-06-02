import os
import glob

screens_dir = r"d:\d\PDD\mobile_app\screens"

# All files that contain the text back arrows to be replaced
screens_to_fix = glob.glob(os.path.join(screens_dir, "*.js"))

for filepath in screens_to_fix:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Add import if missing and if we are doing a replacement
    needs_import = False

    # Replacements target
    if "<Text style={styles.backArrow}>{'<-'}</Text>" in content:
        content = content.replace("<Text style={styles.backArrow}>{'<-'}</Text>", "<Ionicons name=\"arrow-back\" size={28} color=\"#4F8EF7\" />")
        needs_import = True
    elif "<Text style={styles.backArrow}>{'<'} Back</Text>" in content:
        content = content.replace("<Text style={styles.backArrow}>{'<'} Back</Text>", "<View style={{flexDirection:'row', alignItems:'center'}}><Ionicons name=\"arrow-back\" size={24} color=\"#4F8EF7\" /><Text style={{color:'#4F8EF7', fontSize:16, fontWeight:'700', marginLeft:4}}>Back</Text></View>")
        needs_import = True

    if needs_import and "import { Ionicons }" not in content:
        # insert near the top
        content = content.replace("import React", "import React from 'react';\nimport { Ionicons } from '@expo/vector-icons';\n// ", 1)
        if "Ionicons" not in content:
            content = "import { Ionicons } from '@expo/vector-icons';\n" + content

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {os.path.basename(filepath)}")
