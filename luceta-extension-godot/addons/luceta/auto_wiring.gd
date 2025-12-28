@tool
extends RefCounted
class_name AutoWiring

# Automatically wires generated sounds to game events
# Now with ACTUAL integration - not just instructions!

signal wiring_complete(wired_count: int)
signal wiring_error(message: String)

func wire_sounds_to_events(sound_mappings: Array, analysis_results: Dictionary) -> Dictionary:
	"""
	Creates wiring suggestions for sounds based on code analysis
	Returns a dictionary with wiring instructions
	"""
	var wiring_instructions = {
		"files_to_modify": [],
		"nodes_to_add": [],
		"connections_to_make": []
	}
	
	# Map sounds to their contexts
	for mapping in sound_mappings:
		var sound_name = mapping.get("name", "")
		var sound_path = mapping.get("path", "")
		var context = mapping.get("context", "")
		
		# Find matching events in analysis
		for event in analysis_results.get("events", []):
			if _contexts_match(context, event.name, sound_name):
				var instruction = {
					"file": event.file,
					"function": event.name,
					"sound_path": sound_path,
					"sound_name": sound_name,
					"type": "function_call",
					"sound_hint": event.get("sound_hint", "")
				}
				wiring_instructions.files_to_modify.append(instruction)
		
		# Check signals
		for signal_data in analysis_results.get("signals", []):
			if context.contains(signal_data.name):
				var instruction = {
					"file": signal_data.file,
					"signal": signal_data.name,
					"sound_path": sound_path,
					"sound_name": sound_name,
					"type": "signal_connection"
				}
				wiring_instructions.connections_to_make.append(instruction)
	
	wiring_complete.emit(wiring_instructions.files_to_modify.size())
	return wiring_instructions

func _contexts_match(context: String, event_name: String, sound_name: String) -> bool:
	"""Check if context matches event or sound name"""
	var ctx_lower = context.to_lower()
	var event_lower = event_name.to_lower()
	var sound_lower = sound_name.to_lower()
	
	# Direct match
	if ctx_lower.contains(event_lower) or event_lower.contains(sound_lower):
		return true
	
	# Keyword matching
	var keywords = ["jump", "death", "die", "collect", "pickup", "coin", "fall", "timer", "tick", "slow"]
	for keyword in keywords:
		if keyword in ctx_lower and keyword in event_lower:
			return true
		if keyword in sound_lower and keyword in event_lower:
			return true
	
	return false

func perform_auto_wiring(sound_mappings: Array, analysis_results: Dictionary) -> Dictionary:
	"""
	Actually modifies game files to integrate sounds automatically
	Returns a report of what was done
	"""
	var report = {
		"scripts_modified": [],
		"scenes_modified": [],
		"errors": [],
		"success": true
	}
	
	# Group sounds by their target file
	var sounds_by_file = {}
	
	for mapping in sound_mappings:
		var sound_name = mapping.get("name", "")
		var sound_path = mapping.get("path", "")
		var context = mapping.get("context", "")
		
		# Determine target file and function
		var target = _find_target_for_sound(sound_name, context, analysis_results)
		if target.is_empty():
			continue
		
		var file_path = target.get("file", "")
		if file_path.is_empty():
			continue
		
		if not sounds_by_file.has(file_path):
			sounds_by_file[file_path] = []
		
		sounds_by_file[file_path].append({
			"sound_name": sound_name,
			"sound_path": sound_path,
			"function": target.get("function", ""),
			"insert_type": target.get("insert_type", "function_start")
		})
	
	# Modify each file
	for file_path in sounds_by_file.keys():
		var sounds = sounds_by_file[file_path]
		var result = _modify_script_file(file_path, sounds)
		
		if result.success:
			report.scripts_modified.append(file_path)
		else:
			report.errors.append(result.error)
			report.success = false
	
	return report

func _find_target_for_sound(sound_name: String, context: String, analysis_results: Dictionary) -> Dictionary:
	"""Find the best target file and function for a sound"""
	var sound_lower = sound_name.to_lower()
	var ctx_lower = context.to_lower()
	
	# Sound name to function mapping
	var sound_function_map = {
		"player_jump": {"keywords": ["jump"], "insert_type": "after_condition"},
		"player_death": {"keywords": ["die", "death", "killed", "body_entered"], "insert_type": "function_start"},
		"player_fall": {"keywords": ["fall", "body_entered"], "insert_type": "function_start"},
		"item_pickup": {"keywords": ["pickup", "collect", "coin", "body_entered"], "insert_type": "function_start"},
		"coin_collect": {"keywords": ["pickup", "collect", "coin", "body_entered"], "insert_type": "function_start"},
		"time_slowdown": {"keywords": ["slow", "time_scale", "body_entered"], "insert_type": "function_start"},
		"timer_tick": {"keywords": ["timer", "tick", "timeout"], "insert_type": "function_start"}
	}
	
	# Find matching keywords
	var target_keywords = []
	var insert_type = "function_start"
	
	for map_name in sound_function_map.keys():
		if map_name in sound_lower or sound_lower in map_name:
			target_keywords = sound_function_map[map_name].keywords
			insert_type = sound_function_map[map_name].insert_type
			break
	
	# Also check context for keywords
	if target_keywords.is_empty():
		if "jump" in ctx_lower:
			target_keywords = ["jump"]
			insert_type = "after_condition"
		elif "death" in ctx_lower or "die" in ctx_lower or "kill" in ctx_lower:
			target_keywords = ["die", "death", "body_entered"]
		elif "collect" in ctx_lower or "pickup" in ctx_lower or "coin" in ctx_lower:
			target_keywords = ["pickup", "collect", "coin", "body_entered"]
	
	# Search in analysis results
	for event in analysis_results.get("events", []):
		var event_name_lower = event.name.to_lower()
		for keyword in target_keywords:
			if keyword in event_name_lower:
				return {
					"file": event.file,
					"function": event.name,
					"insert_type": insert_type
				}
	
	return {}

func _modify_script_file(file_path: String, sounds: Array) -> Dictionary:
	"""Modify a GDScript file to add sound playback"""
	var result = {"success": false, "error": ""}
	
	# Read the file
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		result.error = "Cannot open file: " + file_path
		return result
	
	var content = file.get_as_text()
	file.close()
	
	var original_content = content
	var modified = false
	
	# Check if SFXManager autoload reference exists, if not add it
	var needs_sfx_preload = false
	for sound in sounds:
		if not ("@onready var " + sound.sound_name + "_sfx" in content):
			needs_sfx_preload = true
			break
	
	# Add preload statements after extends line
	if needs_sfx_preload:
		var extends_end = content.find("\n", content.find("extends"))
		if extends_end > 0:
			var preload_section = "\n\n# === Agent SFX Auto-Generated Sounds ===\n"
			for sound in sounds:
				var var_name = sound.sound_name + "_sfx"
				if not (var_name in content):
					preload_section += "@onready var " + var_name + " = preload(\"" + sound.sound_path + "\")\n"
			preload_section += "# === End Agent SFX ===\n"
			
			# Only add if we have new preloads
			if preload_section.contains("preload"):
				content = content.insert(extends_end, preload_section)
				modified = true
	
	# Add sound playback to functions
	for sound in sounds:
		var func_name = sound.get("function", "")
		if func_name.is_empty():
			continue
		
		var play_code = _generate_play_code(sound.sound_name)
		
		# Find the function
		var func_pattern = "func " + func_name + "("
		var func_start = content.find(func_pattern)
		if func_start == -1:
			continue
		
		# Check if sound is already added
		if (sound.sound_name + "_sfx") in content.substr(func_start, 500):
			continue
		
		# Find where to insert based on insert_type
		var insert_pos = -1
		
		if sound.insert_type == "after_condition":
			# For jump, insert after the if condition
			var colon_pos = content.find(":", func_start)
			if colon_pos > 0:
				var next_line = content.find("\n", colon_pos)
				# Look for if statement with jump condition
				var if_pos = content.find("if ", func_start)
				if if_pos > 0 and if_pos < func_start + 500:
					var if_colon = content.find(":", if_pos)
					if if_colon > 0:
						var if_next_line = content.find("\n", if_colon)
						if if_next_line > 0:
							# Find the line after the if body starts
							var body_start = if_next_line + 1
							# Skip to after velocity.y assignment if present
							var velocity_line = content.find("velocity.y", body_start)
							if velocity_line > 0 and velocity_line < body_start + 200:
								insert_pos = content.find("\n", velocity_line) + 1
							else:
								insert_pos = body_start
		else:
			# Default: insert at function start
			var colon_pos = content.find(":", func_start)
			if colon_pos > 0:
				insert_pos = content.find("\n", colon_pos) + 1
		
		if insert_pos > 0:
			# Determine indentation
			var indent = "\t"
			if sound.insert_type == "after_condition":
				indent = "\t\t"
			
			content = content.insert(insert_pos, indent + play_code + "\n")
			modified = true
	
	# Write back if modified
	if modified:
		var write_file = FileAccess.open(file_path, FileAccess.WRITE)
		if not write_file:
			result.error = "Cannot write to file: " + file_path
			return result
		
		write_file.store_string(content)
		write_file.close()
		result.success = true
	else:
		result.success = true  # No changes needed
	
	return result

func _generate_play_code(sound_name: String) -> String:
	"""Generate code to play a sound"""
	var var_name = sound_name + "_sfx"
	return "_play_sfx(" + var_name + ")  # Agent SFX"

func generate_sfx_helper_code() -> String:
	"""Generate helper function for playing sounds"""
	return """
# === Agent SFX Helper Function ===
func _play_sfx(sound: AudioStream):
	var player = AudioStreamPlayer.new()
	add_child(player)
	player.stream = sound
	player.play()
	player.finished.connect(func(): player.queue_free())
# === End Agent SFX Helper ===
"""

func add_sfx_helper_to_file(file_path: String) -> bool:
	"""Add the SFX helper function to a script file if not present"""
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		return false
	
	var content = file.get_as_text()
	file.close()
	
	# Check if helper already exists
	if "_play_sfx" in content:
		return true
	
	# Add helper at the end
	content += "\n" + generate_sfx_helper_code()
	
	var write_file = FileAccess.open(file_path, FileAccess.WRITE)
	if not write_file:
		return false
	
	write_file.store_string(content)
	write_file.close()
	return true

func create_wiring_script_file(instructions: Dictionary, output_path: String = "res://agent_sfx_generated/wiring_instructions.gd"):
	"""
	Creates a helper script file with wiring instructions
	"""
	var script_content = """@tool
extends EditorScript

# Auto-generated wiring instructions by Agent SFX
# This file contains instructions for manually wiring sounds to your game

var wiring_data = """
	
	script_content += JSON.stringify(instructions, "\t")
	script_content += """
	
func _run():
	print("Agent SFX Wiring Instructions:")
	print("==============================")
	for instruction in wiring_data.files_to_modify:
		print("File: ", instruction.file)
		print("Function: ", instruction.function)
		print("Sound: ", instruction.sound_path)
		print("---")
"""
	
	var file = FileAccess.open(output_path, FileAccess.WRITE)
	if file:
		file.store_string(script_content)
		file.close()
		return true
	return false
