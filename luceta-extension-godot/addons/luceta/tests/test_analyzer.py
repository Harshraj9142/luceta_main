#!/usr/bin/env python3
"""
Code Analyzer Logic Test
Simulates the CodeAnalyzer.gd logic in Python to verify it works correctly
"""

import os
import re
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    END = '\033[0m'

def sep(char="=", length=60):
    return char * length

class CodeAnalyzerSimulator:
    """Python simulation of the GDScript CodeAnalyzer"""
    
    def __init__(self, project_path):
        self.project_path = Path(project_path)
        self.results = {
            "events": [],
            "actions": [],
            "interactions": [],
            "dialogs": [],
            "signals": []
        }
    
    def find_files(self, root, extension):
        """Find all files with given extension, excluding .git, .godot, addons"""
        files = []
        root_path = Path(root)
        
        if not root_path.exists():
            return files
            
        for item in root_path.iterdir():
            if item.is_dir():
                if item.name not in ['.git', '.godot', 'addons']:
                    files.extend(self.find_files(item, extension))
            elif item.suffix == extension:
                files.append(item)
        
        return files
    
    def analyze_gd_file(self, file_path):
        """Analyze a single GDScript file"""
        results = {
            "events": [],
            "actions": [],
            "interactions": [],
            "signals": []
        }
        
        try:
            content = file_path.read_text(encoding='utf-8')
        except:
            return results
        
        # Extract functions starting with _ or on_
        func_pattern = r'func\s+(_[a-zA-Z_][a-zA-Z0-9_]*|on_[a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)'
        for match in re.finditer(func_pattern, content):
            func_name = match.group().replace('func ', '').split('(')[0]
            
            # Extract function body (simplified)
            func_start = content.find(match.group())
            func_body = content[func_start:func_start+500]  # Get next 500 chars
            
            if self.has_audio_play(func_body) or self.is_action_function(func_name, func_body):
                event = {
                    "type": "function",
                    "name": func_name,
                    "file": str(file_path),
                    "context": func_body[:200],
                    "sound_hint": self.infer_sound_type(func_name, func_body)
                }
                results["events"].append(event)
        
        # Extract signals
        signal_pattern = r'signal\s+([a-zA-Z_][a-zA-Z0-9_]*)'
        for match in re.finditer(signal_pattern, content):
            signal_name = match.group(1)
            results["signals"].append({
                "type": "signal",
                "name": signal_name,
                "file": str(file_path)
            })
        
        # Extract state machines
        state_pattern = r'enum\s+STATE\s*\{([^}]*)\}'
        for match in re.finditer(state_pattern, content):
            enum_content = match.group(1)
            states = re.findall(r'([A-Z_][A-Z0-9_]*)', enum_content)
            for state in states:
                results["actions"].append({
                    "type": "state",
                    "name": state,
                    "file": str(file_path),
                    "sound_hint": self.infer_sound_from_state(state)
                })
        
        # Check for Area2D interactions
        if 'Area2D' in content or 'CollisionShape2D' in content:
            if '_on_area_entered' in content or '_on_body_entered' in content:
                results["interactions"].append({
                    "type": "collision",
                    "file": str(file_path),
                    "sound_hint": "interaction"
                })
        
        return results
    
    def analyze_scene_file(self, file_path):
        """Analyze a scene file for dialogs and signals"""
        results = {
            "dialogs": [],
            "signals": []
        }
        
        try:
            content = file_path.read_text(encoding='utf-8')
        except:
            return results
        
        # Find RichTextLabel nodes (potential dialogs)
        dialog_pattern = r'\[node name="([^"]+)" type="RichTextLabel"'
        for match in re.finditer(dialog_pattern, content):
            node_name = match.group(1)
            results["dialogs"].append({
                "type": "dialog",
                "name": node_name,
                "file": str(file_path),
                "text": ""
            })
        
        # Find signal connections
        connection_pattern = r'\[connection signal="([^"]+)"'
        for match in re.finditer(connection_pattern, content):
            signal_name = match.group(1)
            results["signals"].append({
                "type": "signal_connection",
                "name": signal_name,
                "file": str(file_path)
            })
        
        return results
    
    def has_audio_play(self, body):
        """Check if function body contains audio playback"""
        body_lower = body.lower()
        return any(x in body_lower for x in ['.play()', 'audiostreamplayer', 'sfx', 'play_sound'])
    
    def is_action_function(self, name, body):
        """Check if function is an action that might need sound"""
        action_keywords = ['jump', 'attack', 'collect', 'pickup', 'drop', 'interact', 
                          'move', 'walk', 'run', 'chop', 'hit', 'damage', 'heal', 
                          'open', 'close', 'enter', 'exit']
        name_lower = name.lower()
        body_lower = body.lower()
        
        return any(kw in name_lower or kw in body_lower for kw in action_keywords)
    
    def infer_sound_type(self, func_name, body):
        """Infer what type of sound this event would need"""
        name_lower = func_name.lower()
        
        if any(x in name_lower for x in ['walk', 'step', 'move']):
            return "footstep"
        elif 'jump' in name_lower:
            return "jump"
        elif any(x in name_lower for x in ['attack', 'chop', 'hit']):
            return "attack"
        elif any(x in name_lower for x in ['collect', 'pickup', 'coin']):
            return "collect"
        elif any(x in name_lower for x in ['area_entered', 'body_entered']):
            return "interaction"
        elif any(x in name_lower for x in ['dialog', 'speak']):
            return "dialog"
        else:
            return "generic"
    
    def infer_sound_from_state(self, state):
        """Infer sound type from state name"""
        state_lower = state.lower()
        
        if any(x in state_lower for x in ['walk', 'run']):
            return "footstep"
        elif any(x in state_lower for x in ['attack', 'chop']):
            return "attack"
        elif 'jump' in state_lower:
            return "jump"
        else:
            return "state_transition"
    
    def analyze_project(self):
        """Run full project analysis"""
        print(f"\n{Colors.CYAN}Scanning project: {self.project_path}{Colors.END}\n")
        
        # Find and analyze GD files
        gd_files = self.find_files(self.project_path, '.gd')
        print(f"Found {len(gd_files)} .gd files to analyze")
        
        for file_path in gd_files:
            print(f"  Analyzing: {file_path.relative_to(self.project_path)}")
            file_results = self.analyze_gd_file(file_path)
            self.results["events"].extend(file_results["events"])
            self.results["actions"].extend(file_results["actions"])
            self.results["interactions"].extend(file_results["interactions"])
            self.results["signals"].extend(file_results["signals"])
        
        # Find and analyze scene files
        tscn_files = self.find_files(self.project_path, '.tscn')
        print(f"\nFound {len(tscn_files)} .tscn files to analyze")
        
        for file_path in tscn_files:
            print(f"  Analyzing: {file_path.relative_to(self.project_path)}")
            scene_results = self.analyze_scene_file(file_path)
            self.results["dialogs"].extend(scene_results["dialogs"])
            self.results["signals"].extend(scene_results["signals"])
        
        return self.results


def main():
    print(sep('='))
    print(f"{Colors.MAGENTA}Agent SFX - Code Analyzer Test{Colors.END}")
    print(sep('='))
    
    # Find project root
    script_dir = Path(__file__).resolve()
    base_path = script_dir.parent.parent.parent.parent
    
    # Run analyzer
    analyzer = CodeAnalyzerSimulator(base_path)
    results = analyzer.analyze_project()
    
    # Display results
    print(f"\n{sep('=')}")
    print(f"{Colors.CYAN}ANALYSIS RESULTS{Colors.END}")
    print(sep('='))
    
    # Events
    print(f"\n{Colors.GREEN}EVENTS DETECTED ({len(results['events'])}){Colors.END}")
    print(sep('-'))
    for event in results['events']:
        print(f"  {Colors.YELLOW}•{Colors.END} {event['name']}")
        print(f"    Type: {event['type']}")
        print(f"    Sound Hint: {event['sound_hint']}")
        print(f"    File: {Path(event['file']).name}")
        print()
    
    # Actions (States)
    print(f"\n{Colors.GREEN}STATES/ACTIONS DETECTED ({len(results['actions'])}){Colors.END}")
    print(sep('-'))
    for action in results['actions']:
        print(f"  {Colors.YELLOW}•{Colors.END} {action['name']}")
        print(f"    Sound Hint: {action['sound_hint']}")
        print(f"    File: {Path(action['file']).name}")
        print()
    
    # Interactions
    print(f"\n{Colors.GREEN}INTERACTIONS DETECTED ({len(results['interactions'])}){Colors.END}")
    print(sep('-'))
    for interaction in results['interactions']:
        print(f"  {Colors.YELLOW}•{Colors.END} {interaction['type']}")
        print(f"    Sound Hint: {interaction['sound_hint']}")
        print(f"    File: {Path(interaction['file']).name}")
        print()
    
    # Signals
    print(f"\n{Colors.GREEN}SIGNALS DETECTED ({len(results['signals'])}){Colors.END}")
    print(sep('-'))
    for signal in results['signals'][:10]:  # Limit to 10
        print(f"  {Colors.YELLOW}•{Colors.END} {signal['name']} ({signal['type']})")
        print(f"    File: {Path(signal['file']).name}")
    if len(results['signals']) > 10:
        print(f"  ... and {len(results['signals']) - 10} more signals")
    
    # Dialogs
    print(f"\n{Colors.GREEN}DIALOGS DETECTED ({len(results['dialogs'])}){Colors.END}")
    print(sep('-'))
    for dialog in results['dialogs']:
        print(f"  {Colors.YELLOW}•{Colors.END} {dialog['name']}")
        print(f"    File: {Path(dialog['file']).name}")
    
    # Summary
    print(f"\n{sep('=')}")
    print(f"{Colors.CYAN}SUMMARY{Colors.END}")
    print(sep('='))
    total = (len(results['events']) + len(results['actions']) + 
             len(results['interactions']) + len(results['signals']) + 
             len(results['dialogs']))
    print(f"Total items detected: {total}")
    print(f"  Events: {len(results['events'])}")
    print(f"  Actions/States: {len(results['actions'])}")
    print(f"  Interactions: {len(results['interactions'])}")
    print(f"  Signals: {len(results['signals'])}")
    print(f"  Dialogs: {len(results['dialogs'])}")
    
    if results['events'] or results['actions']:
        print(f"\n{Colors.GREEN}✅ Analyzer is working correctly!{Colors.END}")
        print("These events and actions will be sent to the LLM for sound suggestions.")
        return 0
    else:
        print(f"\n{Colors.YELLOW}⚠️ No events detected - check if game files exist{Colors.END}")
        return 1

if __name__ == "__main__":
    exit(main())
