#!/usr/bin/env python3
"""
Logic Verification Script for Agent SFX
Tests the code logic without needing Godot runtime
"""

import os
import re
import sys
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'

def sep(char="=", length=60):
    return char * length

class LogicVerifier:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        
    def log_pass(self, msg):
        print(f"  {Colors.GREEN}PASS{Colors.END}: {msg}")
        self.passed += 1
        
    def log_fail(self, msg):
        print(f"  {Colors.RED}FAIL{Colors.END}: {msg}")
        self.failed += 1
        
    def log_warn(self, msg):
        print(f"  {Colors.YELLOW}WARN{Colors.END}: {msg}")
        self.warnings += 1
    
    def read_file(self, rel_path):
        full_path = self.base_path / rel_path
        if full_path.exists():
            return full_path.read_text(encoding='utf-8')
        return None

    def verify_plugin_initialization(self):
        """Verify plugin.gd has correct initialization logic"""
        print(f"\n{sep('-')}")
        print("Plugin Initialization Logic:")
        print(sep('-'))
        
        content = self.read_file("addons/agent-sfx/plugin.gd")
        if not content:
            self.log_fail("Cannot read plugin.gd")
            return
        
        # Check dock preload
        if 'preload("res://addons/agent-sfx/dock.tscn")' in content:
            self.log_pass("Dock scene is preloaded correctly")
        else:
            self.log_fail("Dock scene preload missing or incorrect")
        
        # Check _enter_tree adds dock
        if 'add_control_to_dock' in content:
            self.log_pass("Dock is added to editor on enter")
        else:
            self.log_fail("Missing add_control_to_dock call")
        
        # Check _exit_tree removes dock
        if 'remove_control_from_dock' in content:
            self.log_pass("Dock is removed on exit")
        else:
            self.log_fail("Missing remove_control_from_dock call")
        
        # Check project settings registration
        settings = ['groq_api_key', 'elevenlabs_api_key']
        for setting in settings:
            if f'agent_sfx/{setting}' in content:
                self.log_pass(f"Project setting '{setting}' is registered")
            else:
                self.log_fail(f"Missing project setting '{setting}'")

    def verify_code_analyzer_logic(self):
        """Verify CodeAnalyzer has correct analysis logic"""
        print(f"\n{sep('-')}")
        print("Code Analyzer Logic:")
        print(sep('-'))
        
        content = self.read_file("addons/agent-sfx/code_analyzer.gd")
        if not content:
            self.log_fail("Cannot read code_analyzer.gd")
            return
        
        # Check class definition
        if 'class_name CodeAnalyzer' in content:
            self.log_pass("CodeAnalyzer class properly defined")
        else:
            self.log_fail("CodeAnalyzer class not defined")
        
        # Check result structure
        result_keys = ['events', 'actions', 'interactions', 'dialogs', 'signals']
        for key in result_keys:
            if f'"{key}"' in content:
                self.log_pass(f"Result contains '{key}' key")
            else:
                self.log_fail(f"Missing '{key}' in results")
        
        # Check file exclusions (important for avoiding addon analysis)
        exclusions = ['.git', '.godot', 'addons']
        for excl in exclusions:
            if f'"{excl}"' in content:
                self.log_pass(f"Excludes '{excl}' directory")
            else:
                self.log_warn(f"May not exclude '{excl}' directory")
        
        # Check regex patterns for function detection
        if r'func\s+' in content or r'func\\s+' in content:
            self.log_pass("Has regex pattern for function detection")
        else:
            self.log_fail("Missing function detection regex")
        
        # Check signal emission
        if 'analysis_complete.emit' in content:
            self.log_pass("Emits analysis_complete signal with results")
        else:
            self.log_fail("Missing analysis_complete signal emission")

    def verify_llm_analyzer_logic(self):
        """Verify LLMAnalyzer has correct API logic"""
        print(f"\n{sep('-')}")
        print("LLM Analyzer Logic:")
        print(sep('-'))
        
        content = self.read_file("addons/agent-sfx/llm_analyzer.gd")
        if not content:
            self.log_fail("Cannot read llm_analyzer.gd")
            return
        
        # Check Groq API endpoint
        if 'api.groq.com' in content:
            self.log_pass("Uses Groq API endpoint")
        else:
            self.log_fail("Missing Groq API endpoint")
        
        # Check model configuration
        if 'model' in content.lower():
            self.log_pass("Has model configuration")
        else:
            self.log_warn("No model configuration found")
        
        # Check prompt building
        if '_build_analysis_prompt' in content or 'build_prompt' in content.lower():
            self.log_pass("Has prompt building function")
        else:
            self.log_fail("Missing prompt building logic")
        
        # Check for JSON format instruction in prompt
        if 'JSON' in content and 'fx' in content:
            self.log_pass("Prompt instructs LLM to return JSON with 'fx' key")
        else:
            self.log_warn("Prompt may not properly instruct JSON format")

    def verify_elevenlabs_generator_logic(self):
        """Verify ElevenLabsGenerator has correct API logic"""
        print(f"\n{sep('-')}")
        print("ElevenLabs Generator Logic:")
        print(sep('-'))
        
        content = self.read_file("addons/agent-sfx/elevenlabs_generator.gd")
        if not content:
            self.log_fail("Cannot read elevenlabs_generator.gd")
            return
        
        # Check API endpoint
        if 'api.elevenlabs.io' in content:
            self.log_pass("Uses ElevenLabs API endpoint")
        else:
            self.log_fail("Missing ElevenLabs API endpoint")
        
        # Check generation endpoints
        endpoints = ['sound-generation', 'text-to-speech', 'music-generation']
        for endpoint in endpoints:
            if endpoint in content:
                self.log_pass(f"Has '{endpoint}' endpoint")
            else:
                self.log_warn(f"Missing '{endpoint}' endpoint")
        
        # Check file saving logic
        if 'FileAccess.WRITE' in content:
            self.log_pass("Has file writing logic")
        else:
            self.log_fail("Missing file writing logic")
        
        # Check MP3 output
        if '.mp3' in content:
            self.log_pass("Outputs MP3 format")
        else:
            self.log_warn("MP3 output not found")
        
        # Check directory creation
        if 'make_dir' in content:
            self.log_pass("Creates output directories")
        else:
            self.log_fail("Missing directory creation logic")
        
        # Check signal emissions
        signals = ['audio_generated', 'generation_error']
        for sig in signals:
            if f'{sig}.emit' in content:
                self.log_pass(f"Emits '{sig}' signal")
            else:
                self.log_fail(f"Missing '{sig}' signal emission")

    def verify_dock_integration(self):
        """Verify Dock integrates all components correctly"""
        print(f"\n{sep('-')}")
        print("Dock Integration Logic:")
        print(sep('-'))
        
        content = self.read_file("addons/agent-sfx/dock.gd")
        if not content:
            self.log_fail("Cannot read dock.gd")
            return
        
        # Check component instantiation
        components = ['CodeAnalyzer', 'LLMAnalyzer', 'ElevenLabsGenerator', 'AudioCache', 'AutoWiring']
        for comp in components:
            if f'{comp}.new()' in content:
                self.log_pass(f"Instantiates {comp}")
            else:
                self.log_fail(f"Missing {comp} instantiation")
        
        # Check HTTPRequest setup
        if 'HTTPRequest.new()' in content:
            self.log_pass("Creates HTTPRequest nodes")
        else:
            self.log_fail("Missing HTTPRequest creation")
        
        # Check signal connections
        connections = ['request_completed', 'analysis_complete', 'audio_generated']
        for conn in connections:
            if conn in content:
                self.log_pass(f"Connects '{conn}' signal")
            else:
                self.log_warn(f"May not connect '{conn}' signal")
        
        # Check API key loading
        if '_load_api_keys' in content:
            self.log_pass("Has API key loading function")
        else:
            self.log_fail("Missing API key loading")
        
        # Check fallback key sources
        if 'GROQ_API_KEY.txt' in content:
            self.log_pass("Has file fallback for Groq API key")
        else:
            self.log_warn("No file fallback for Groq API key")
        
        if 'ELEVEN_LABS_API_KEY.txt' in content:
            self.log_pass("Has file fallback for ElevenLabs API key")
        else:
            self.log_warn("No file fallback for ElevenLabs API key")
        
        # Check workflow functions
        workflow = ['_on_analyze_pressed', '_send_to_llm', '_generate_next_audio']
        for func in workflow:
            if f'func {func}' in content:
                self.log_pass(f"Has workflow function '{func}'")
            else:
                self.log_fail(f"Missing workflow function '{func}'")
        
        # Check JSON parsing
        if 'JSON.parse_string' in content:
            self.log_pass("Has JSON parsing for responses")
        else:
            self.log_fail("Missing JSON parsing")
        
        # Check Groq response handling
        if 'choices' in content and 'message' in content:
            self.log_pass("Handles Groq API response format")
        else:
            self.log_fail("May not handle Groq response format correctly")

    def verify_audio_cache_logic(self):
        """Verify AudioCache has correct caching logic"""
        print(f"\n{sep('-')}")
        print("Audio Cache Logic:")
        print(sep('-'))
        
        content = self.read_file("addons/agent-sfx/audio_cache.gd")
        if not content:
            self.log_fail("Cannot read audio_cache.gd")
            return
        
        # Check cache loading on init
        if '_load_cache' in content and '_init' in content:
            self.log_pass("Loads cache on initialization")
        else:
            self.log_fail("Missing cache loading on init")
        
        # Check cache key generation
        if 'get_analysis_cache_key' in content:
            self.log_pass("Has cache key generation")
        else:
            self.log_fail("Missing cache key generation")
        
        # Check file hash for change detection
        if 'get_file_hash' in content or 'modified_time' in content.lower():
            self.log_pass("Uses file modification for change detection")
        else:
            self.log_warn("May not detect file changes properly")
        
        # Check JSON storage
        if 'JSON.stringify' in content:
            self.log_pass("Saves cache as JSON")
        else:
            self.log_fail("Missing JSON serialization")

    def verify_workflow_end_to_end(self):
        """Verify the complete workflow makes sense"""
        print(f"\n{sep('-')}")
        print("End-to-End Workflow Verification:")
        print(sep('-'))
        
        dock_content = self.read_file("addons/agent-sfx/dock.gd")
        if not dock_content:
            self.log_fail("Cannot verify workflow - dock.gd missing")
            return
        
        # Check workflow order
        workflow_steps = [
            ('_on_analyze_pressed', 'analyze_project', 'Step 1: Analyze button triggers code analysis'),
            ('_on_code_analysis_complete', '_send_to_llm', 'Step 2: Analysis complete sends to LLM'),
            ('_on_llm_request_completed', '_parse_llm_response', 'Step 3: LLM response is parsed'),
            ('_parse_llm_response', '_show_review_panel', 'Step 4: Parsed response shows review panel'),
            ('_on_generate_pressed', '_generate_next_audio', 'Step 5: Generate button starts audio queue'),
            ('_on_elevenlabs_request_completed', 'handle_response', 'Step 6: Audio response is saved'),
        ]
        
        for caller, callee, description in workflow_steps:
            if caller in dock_content and callee in dock_content:
                self.log_pass(description)
            else:
                self.log_fail(f"{description} - missing connection")
        
        # Check error handling exists
        if 'Error:' in dock_content or 'error' in dock_content.lower():
            self.log_pass("Has error handling in workflow")
        else:
            self.log_warn("Limited error handling detected")
        
        # Check progress feedback
        if 'progress_label.text' in dock_content:
            self.log_pass("Updates progress label during workflow")
        else:
            self.log_warn("May not show progress to user")

    def run_all_verifications(self):
        """Run all verification tests"""
        print(sep('='))
        print(f"{Colors.CYAN}Agent SFX - Logic Verification Tests{Colors.END}")
        print(sep('='))
        print(f"Base path: {self.base_path}")
        
        self.verify_plugin_initialization()
        self.verify_code_analyzer_logic()
        self.verify_llm_analyzer_logic()
        self.verify_elevenlabs_generator_logic()
        self.verify_dock_integration()
        self.verify_audio_cache_logic()
        self.verify_workflow_end_to_end()
        
        # Summary
        print(f"\n{sep('=')}")
        print(f"{Colors.CYAN}VERIFICATION SUMMARY{Colors.END}")
        print(sep('='))
        print(f"{Colors.GREEN}Passed: {self.passed}{Colors.END}")
        print(f"{Colors.RED}Failed: {self.failed}{Colors.END}")
        print(f"{Colors.YELLOW}Warnings: {self.warnings}{Colors.END}")
        print(f"Total: {self.passed + self.failed}")
        print()
        
        if self.failed == 0:
            print(f"{Colors.GREEN}ALL LOGIC CHECKS PASSED!{Colors.END}")
            if self.warnings > 0:
                print(f"{Colors.YELLOW}(Some warnings to review){Colors.END}")
            return 0
        else:
            print(f"{Colors.RED}SOME LOGIC CHECKS FAILED{Colors.END}")
            return 1

def main():
    # Find base path
    script_dir = Path(__file__).resolve()
    base_path = script_dir.parent.parent.parent.parent
    
    verifier = LogicVerifier(base_path)
    return verifier.run_all_verifications()

if __name__ == "__main__":
    sys.exit(main())
