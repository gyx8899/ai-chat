#!/usr/bin/env python3
"""
Skill validator for AgentSkills standard.
Dependencies: None (Standard Library only)
"""
import os
import sys
import re

# Fields that were used in old versions and are now obsolete
OBSOLETE_FIELDS = {'license'}


def validate_skill(skill_path):
    """
    Validates a skill directory structure and SKILL.md frontmatter.
    Checks: required fields, obsolete fields, structure completeness.
    """
    skill_file = os.path.join(skill_path, 'SKILL.md')

    if not os.path.exists(skill_file):
        print(f"❌ Error: SKILL.md not found in {skill_path}")
        return False

    try:
        with open(skill_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # --- Frontmatter structure check ---
        if not content.startswith('---'):
            print("❌ Error: SKILL.md missing YAML frontmatter (must start with '---')")
            return False

        frontmatter_end = content.find('---', 3)
        if frontmatter_end == -1:
            print("❌ Error: Invalid YAML frontmatter (missing closing '---')")
            return False

        fm_content = content[3:frontmatter_end]

        # --- Required fields ---
        name_match = re.search(r'^name:\s*(.+)$', fm_content, re.MULTILINE)
        desc_match = re.search(r'^description:\s*(.+)$', fm_content, re.MULTILINE)

        missing = []
        if not name_match:
            missing.append('name')
        if not desc_match:
            missing.append('description (recommended for auto-triggering)')

        if missing:
            print(f"⚠️  Warning: Missing recommended fields: {', '.join(missing)}")

        # --- Obsolete fields check ---
        for field in OBSOLETE_FIELDS:
            if re.search(rf'^{field}:', fm_content, re.MULTILINE):
                print(f"⚠️  Warning: Obsolete field '{field}' found. Remove it (not part of AgentSkills standard).")

        # --- Description length check ---
        if desc_match:
            desc_value = desc_match.group(1).strip().strip("'\"")
            if len(desc_value) > 250:
                print(f"⚠️  Warning: description is {len(desc_value)} chars (max 250 for display). Front-load key terms.")

        # --- Optional resource directories check ---
        for subdir in ['references', 'templates', 'scripts']:
            # Support both flat and resources/ subdirectory layout
            flat_path = os.path.join(skill_path, subdir)
            nested_path = os.path.join(skill_path, 'resources', subdir)
            if os.path.isdir(flat_path) or os.path.isdir(nested_path):
                print(f"  📁 Found: {subdir}/")

        # --- Success ---
        name = name_match.group(1).strip().strip("'\"") if name_match else '(unnamed)'
        print(f"✅ Skill '{name}' passed validation.")
        return True

    except Exception as e:
        print(f"❌ Error parsing SKILL.md: {str(e)}")
        return False


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 validate_skill.py <path_to_skill_directory>")
        sys.exit(1)

    path = sys.argv[1]
    sys.exit(0 if validate_skill(path) else 1)
