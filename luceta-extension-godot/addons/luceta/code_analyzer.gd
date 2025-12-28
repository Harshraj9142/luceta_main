@tool
extends RefCounted
class_name CodeAnalyzer

# Analyzes GDScript files and scene files to extract game events and actions
# that would benefit from sound effects

signal analysis_complete(results: Dictionary)

var project_path: String

func analyze_project(project_root: String):
	project_path = project_root
	var results = {
		"events": [],
		"actions": [],
		"interactions": [],
		"dialogs": [],
		"signals": []
	}
	
	# Scan all .gd files
	var gd_files = _find_files(project_root, "*.gd")
	for file_path in gd_files:
		var file_results = _analyze_gd_file(file_path)
		results.events.append_array(file_results.events)
		results.actions.append_array(file_results.actions)
		results.interactions.append_array(file_results.interactions)
		results.signals.append_array(file_results.signals)
	
	# Scan all .tscn files
	var tscn_files = _find_files(project_root, "*.tscn")
	for file_path in tscn_files:
		var scene_results = _analyze_scene_file(file_path)
		results.dialogs.append_array(scene_results.dialogs)
		results.signals.append_array(scene_results.signals)
	
	analysis_complete.emit(results)
	return results

func _find_files(root: String, pattern: String) -> Array:
	var files = []
	var dir = DirAccess.open(root)
	if not dir:
		return files
	
	dir.list_dir_begin()
	var file_name = dir.get_next()
	
	while file_name != "":
		if dir.current_is_dir():
			if file_name != ".git" and file_name != ".godot" and file_name != "addons":
				var subdir = root + "/" + file_name
				files.append_array(_find_files(subdir, pattern))
		elif file_name.ends_with(pattern.trim_prefix("*")):
			files.append(root + "/" + file_name)
		file_name = dir.get_next()
	
	return files

func _analyze_gd_file(file_path: String) -> Dictionary:
	var results = {
		"events": [],
		"actions": [],
		"interactions": [],
		"signals": []
	}
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		return results
	
	var content = file.get_as_text()
	file.close()
	
	# Extract function names that might need sounds
	var regex = RegEx.new()
	regex.compile("func\\s+(_[a-zA-Z_][a-zA-Z0-9_]*|on_[a-zA-Z_][a-zA-Z0-9_]*)\\([^)]*\\)")
	
	var matches = regex.search_all(content)
	for match in matches:
		var func_name = match.get_string()
		func_name = func_name.replace("func ", "").split("(")[0]
		
		# Check if function contains audio-related code
		var func_body = _extract_function_body(content, func_name)
		if func_body:
			if _has_audio_play(func_body) or _is_action_function(func_name, func_body):
				var event = {
					"type": "function",
					"name": func_name,
					"file": file_path,
					"context": _extract_context(func_body),
					"sound_hint": _infer_sound_type(func_name, func_body)
				}
				results.events.append(event)
	
	# Extract signal connections
	regex.compile("signal\\s+([a-zA-Z_][a-zA-Z0-9_]*)")
	matches = regex.search_all(content)
	for match in matches:
		var signal_name = match.get_string(1)
		results.signals.append({
			"type": "signal",
			"name": signal_name,
			"file": file_path
		})
	
	# Extract state machines
	var state_pattern = RegEx.create_from_string("enum\\s+STATE\\s*\\{[^}]*\\}")
	regex.compile("enum\\s+STATE\\s*\\{[^}]*\\}")
	matches = regex.search_all(content)
	for match in matches:
		var enum_content = match.get_string()
		var states = _extract_enum_values(enum_content)
		for state in states:
			results.actions.append({
				"type": "state",
				"name": state,
				"file": file_path,
				"sound_hint": _infer_sound_from_state(state)
			})
	
	# Extract area/collision interactions
	if "Area2D" in content or "CollisionShape2D" in content:
		if "_on_area_entered" in content or "_on_body_entered" in content:
			results.interactions.append({
				"type": "collision",
				"file": file_path,
				"sound_hint": "interaction"
			})
	
	return results

func _analyze_scene_file(file_path: String) -> Dictionary:
	var results = {
		"dialogs": [],
		"signals": []
	}
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		return results
	
	var content = file.get_as_text()
	file.close()
	
	# Extract RichTextLabel nodes (dialogs)
	var regex = RegEx.new()
	regex.compile("\\[node name=\"([^\"]+)\" type=\"RichTextLabel\"")
	
	var matches = regex.search_all(content)
	for match in matches:
		var node_name = match.get_string(1)
		# Try to extract text content
		var text_match = RegEx.new()
		text_match.compile("text = \"([^\"]+)\"")
		var text_matches = text_match.search_all(content)
		var dialog_text = ""
		if text_matches.size() > 0:
			# Find text after this node definition
			var node_start = content.find("[node name=\"" + node_name + "\"")
			if node_start >= 0:
				var node_section = content.substr(node_start, 500)
				var text_result = text_match.search(node_section)
				if text_result:
					dialog_text = text_result.get_string(1)
		
		results.dialogs.append({
			"type": "dialog",
			"name": node_name,
			"file": file_path,
			"text": dialog_text
		})
	
	# Extract signal connections
	var connection_pattern = RegEx.create_from_string("\\[connection signal=\"([^\"]+)\"")
	regex.compile("\\[connection signal=\"([^\"]+)\"")
	matches = regex.search_all(content)
	for match in matches:
		var signal_name = match.get_string(1)
		results.signals.append({
			"type": "signal_connection",
			"name": signal_name,
			"file": file_path
		})
	
	return results

func _extract_function_body(content: String, func_name: String) -> String:
	var func_start = content.find("func " + func_name)
	if func_start == -1:
		return ""
	
	var start = content.find("{", func_start)
	if start == -1:
		start = content.find(":", func_start)
		if start == -1:
			return ""
		start += 1
	
	var depth = 0
	var in_string = false
	var string_char = ""
	var i = start
	
	while i < content.length():
		var char = content[i]
		
		if not in_string:
			if char == "\"" or char == "'":
				in_string = true
				string_char = char
			elif char == "{":
				depth += 1
			elif char == "}":
				if depth == 0:
					return content.substr(start, i - start)
				depth -= 1
		else:
			if char == string_char and content[i-1] != "\\":
				in_string = false
		
		i += 1
	
	return content.substr(start)

func _has_audio_play(body: String) -> bool:
	return ".play()" in body or "AudioStreamPlayer" in body or "SFX" in body or "play_sound" in body.to_lower()

func _is_action_function(name: String, body: String) -> bool:
	var action_keywords = ["jump", "attack", "collect", "pickup", "drop", "interact", "move", "walk", "run", "chop", "hit", "damage", "heal", "open", "close", "enter", "exit"]
	var name_lower = name.to_lower()
	var body_lower = body.to_lower()
	
	for keyword in action_keywords:
		if keyword in name_lower or keyword in body_lower:
			return true
	return false

func _extract_context(body: String) -> String:
	# Extract relevant context from function body
	var lines = body.split("\n")
	var context_lines = []
	for line in lines:
		line = line.strip_edges()
		if line.length() > 0 and not line.begins_with("#"):
			if line.length() < 100:  # Avoid very long lines
				context_lines.append(line)
			if context_lines.size() >= 5:
				break
	return "\n".join(context_lines)

func _infer_sound_type(func_name: String, body: String) -> String:
	var name_lower = func_name.to_lower()
	var body_lower = body.to_lower()
	
	if "walk" in name_lower or "step" in name_lower or "move" in name_lower:
		return "footstep"
	elif "jump" in name_lower:
		return "jump"
	elif "attack" in name_lower or "chop" in name_lower or "hit" in name_lower:
		return "attack"
	elif "collect" in name_lower or "pickup" in name_lower or "coin" in name_lower:
		return "collect"
	elif "area_entered" in name_lower or "body_entered" in name_lower:
		return "interaction"
	elif "dialog" in name_lower or "speak" in name_lower:
		return "dialog"
	else:
		return "generic"

func _extract_enum_values(enum_content: String) -> Array:
	var values = []
	var regex = RegEx.new()
	regex.compile("([A-Z_][A-Z0-9_]*)")
	var matches = regex.search_all(enum_content)
	for match in matches:
		values.append(match.get_string())
	return values

func _infer_sound_from_state(state: String) -> String:
	var state_lower = state.to_lower()
	if "walk" in state_lower or "run" in state_lower:
		return "footstep"
	elif "attack" in state_lower or "chop" in state_lower:
		return "attack"
	elif "jump" in state_lower:
		return "jump"
	else:
		return "state_transition"

