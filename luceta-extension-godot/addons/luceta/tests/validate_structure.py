#!/usr/bin/env python3
"""
Static Code Structure Validator for Agent SFX
Validates code structure without needing to run Godot
"""

import os
import re
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def separator(char="=", length=60):
    return char * length

def validate_file_exists(filepath, base_path):
    full_path = base_path / filepath
    exists = full_path.exists()
    status = f"{Colors.GREEN}✅{Colors.END}" if exists else f"{Colors.RED}❌{Colors.END}"
    print(f"  {status} {filepath}")
    return exists

def validate_class_in_file(filepath, class_name, base_path):
    full_path = base_path / filepath
    if not full_path.exists():
        return False
    
    content = full_path.read_text(encoding='utf-8')
    has_class = f"class_name {class_name}" in content or f"extends" in content
    status = f"{Colors.GREEN}✅{Colors.END}" if has_class else f"{Colors.RED}❌{Colors.END}"
    print(f"  {status} Class '{class_name}' in {filepath}")
    return has_class

def validate_method_in_file(filepath, method_name, base_path):
    full_path = base_path / filepath
    if not full_path.exists():
        return False
    
    content = full_path.read_text(encoding='utf-8')
    # Look for function definition
    pattern = rf'func\s+{re.escape(method_name)}\s*\('
    has_method = bool(re.search(pattern, content))
    status = f"{Colors.GREEN}✅{Colors.END}" if has_method else f"{Colors.RED}❌{Colors.END}"
    print(f"  {status} Method '{method_name}' in {filepath}")
    return has_method

def validate_api_endpoints(filepath, base_path):
    full_path = base_path / filepath
    if not full_path.exists():
        return False
    
    content = full_path.read_text(encoding='utf-8')
    
    # Check for Groq API
    has_groq = "groq.com" in content or "api.groq.com" in content
    # Check for ElevenLabs API
    has_elevenlabs = "elevenlabs.io" in content or "api.elevenlabs.io" in content
    
    print(f"  {Colors.GREEN if has_groq else Colors.RED}{'✅' if has_groq else '❌'}{Colors.END} Groq API endpoint")
    print(f"  {Colors.GREEN if has_elevenlabs else Colors.RED}{'✅' if has_elevenlabs else '❌'}{Colors.END} ElevenLabs API endpoint")
    
    return has_groq and has_elevenlabs

def main():
    print(separator("=", 60))
    print(f"{Colors.BLUE}Agent SFX - Static Code Structure Validator{Colors.END}")
    print(separator("=", 60))
    print()
    
    # Find the project root (godot-game directory)
    script_dir = Path(__file__).resolve()
    # Go up: tests -> agent-sfx -> addons -> godot-game
    base_path = script_dir.parent.parent.parent.parent
    
    print(f"{Colors.BLUE}Validating from: {base_path}{Colors.END}")
    print()
    
    passed = 0
    failed = 0
    
    # Validate required files
    print(separator("-", 60))
    print("Required Files:")
    print(separator("-", 60))
    
    required_files = [
        "addons/agent-sfx/plugin.gd",
        "addons/agent-sfx/plugin.cfg",
        "addons/agent-sfx/dock.gd",
        "addons/agent-sfx/dock.tscn",
        "addons/agent-sfx/code_analyzer.gd",
        "addons/agent-sfx/llm_analyzer.gd",
        "addons/agent-sfx/elevenlabs_generator.gd",
        "addons/agent-sfx/audio_cache.gd",
        "addons/agent-sfx/auto_wiring.gd"
    ]
    
    for filepath in required_files:
        if validate_file_exists(filepath, base_path):
            passed += 1
        else:
            failed += 1
    
    print()
    
    # Validate classes
    print(separator("-", 60))
    print("Class Definitions:")
    print(separator("-", 60))
    
    classes = [
        ("code_analyzer.gd", "CodeAnalyzer"),
        ("llm_analyzer.gd", "LLMAnalyzer"),
        ("elevenlabs_generator.gd", "ElevenLabsGenerator"),
        ("audio_cache.gd", "AudioCache"),
        ("auto_wiring.gd", "AutoWiring")
    ]
    
    for filepath, class_name in classes:
        full_path = f"addons/agent-sfx/{filepath}"
        if validate_class_in_file(full_path, class_name, base_path):
            passed += 1
        else:
            failed += 1
    
    print()
    
    # Validate critical methods
    print(separator("-", 60))
    print("Critical Methods:")
    print(separator("-", 60))
    
    methods = [
        ("code_analyzer.gd", "analyze_project"),
        ("code_analyzer.gd", "_find_files"),
        ("llm_analyzer.gd", "set_api_key"),
        ("llm_analyzer.gd", "get_api_key"),
        ("elevenlabs_generator.gd", "generate_sound_effect"),
        ("elevenlabs_generator.gd", "generate_dialog"),
        ("elevenlabs_generator.gd", "handle_response"),
        ("audio_cache.gd", "get_analysis_cache_key"),
        ("audio_cache.gd", "save_audio_metadata"),
        ("dock.gd", "_initialize"),
        ("dock.gd", "_on_analyze_pressed"),
        ("dock.gd", "_on_generate_pressed"),
    ]
    
    for filepath, method_name in methods:
        full_path = f"addons/agent-sfx/{filepath}"
        if validate_method_in_file(full_path, method_name, base_path):
            passed += 1
        else:
            failed += 1
    
    print()
    
    # Validate API endpoints
    print(separator("-", 60))
    print("API Integration:")
    print(separator("-", 60))
    
    if validate_api_endpoints("addons/agent-sfx/llm_analyzer.gd", base_path):
        passed += 1
    else:
        failed += 1
    
    if validate_api_endpoints("addons/agent-sfx/elevenlabs_generator.gd", base_path):
        passed += 1
    else:
        failed += 1
    
    print()
    
    # Summary
    print(separator("=", 60))
    print(f"{Colors.BLUE}VALIDATION SUMMARY{Colors.END}")
    print(separator("=", 60))
    print(f"{Colors.GREEN}Passed: {passed}{Colors.END}")
    print(f"{Colors.RED}Failed: {failed}{Colors.END}")
    print(f"Total: {passed + failed}")
    print()
    
    if failed == 0:
        print(f"{Colors.GREEN}✅ ALL VALIDATIONS PASSED!{Colors.END}")
        return 0
    else:
        print(f"{Colors.RED}❌ SOME VALIDATIONS FAILED{Colors.END}")
        return 1

if __name__ == "__main__":
    exit(main())

