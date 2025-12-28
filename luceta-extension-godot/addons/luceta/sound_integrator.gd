@tool
extends RefCounted
class_name SoundIntegrator

# Integrates generated sounds into Godot game scripts

signal integration_complete(report: Dictionary)

# Map sound keywords to target scripts and functions
const SOUND_TARGETS = {
	# Player sounds
	"jump": {"scripts": ["player"], "functions": ["_physics_process", "_process"], "pattern": "JUMP_VELOCITY"},
	"land": {"scripts": ["player"], "functions": ["_physics_process", "_process"], "pattern": "is_on_floor"},
	"walk": {"scripts": ["player"], "functions": ["_physics_process", "_process"], "pattern": "velocity"},
	"footstep": {"scripts": ["player"], "functions": ["_physics_process", "_process"], "pattern": "velocity"},
	"run": {"scripts": ["player"], "functions": ["_physics_process", "_process"], "pattern": "velocity"},
	
	# Death/damage sounds
	"death": {"scripts": ["killzone", "player", "game_manager", "game"], "functions": ["_on_body_entered", "_on_area_entered", "die", "game_over"], "pattern": ""},
	"die": {"scripts": ["killzone", "player", "game_manager", "game"], "functions": ["_on_body_entered", "_on_area_entered", "die", "game_over"], "pattern": ""},
	"hurt": {"scripts": ["player", "killzone"], "functions": ["_on_body_entered", "take_damage", "hurt"], "pattern": ""},
	"damage": {"scripts": ["player", "killzone"], "functions": ["_on_body_entered", "take_damage"], "pattern": ""},
	"kill": {"scripts": ["killzone"], "functions": ["_on_body_entered", "_on_area_entered"], "pattern": ""},
	"fall": {"scripts": ["killzone"], "functions": ["_on_body_entered"], "pattern": ""},
	
	# Collectible sounds
	"coin": {"scripts": ["coin", "collectible", "pickup"], "functions": ["_on_body_entered", "_on_area_entered", "collect"], "pattern": ""},
	"collect": {"scripts": ["coin", "collectible", "pickup", "item"], "functions": ["_on_body_entered", "_on_area_entered", "collect"], "pattern": ""},
	"pickup": {"scripts": ["coin", "collectible", "pickup", "item"], "functions": ["_on_body_entered", "_on_area_entered"], "pattern": ""},
	"item": {"scripts": ["coin", "collectible", "pickup", "item"], "functions": ["_on_body_entered", "_on_area_entered"], "pattern": ""},
	"gem": {"scripts": ["coin", "collectible", "gem"], "functions": ["_on_body_entered", "_on_area_entered"], "pattern": ""},
	"powerup": {"scripts": ["powerup", "item", "collectible"], "functions": ["_on_body_entered", "_on_area_entered"], "pattern": ""},
	
	# Enemy sounds
	"enemy": {"scripts": ["enemy", "slime", "mob", "monster"], "functions": ["_on_body_entered", "_physics_process", "_process"], "pattern": ""},
	"slime": {"scripts": ["slime", "enemy"], "functions": ["_on_body_entered", "_physics_process"], "pattern": ""},
	"hit": {"scripts": ["enemy", "slime", "player"], "functions": ["_on_body_entered", "take_damage", "hit"], "pattern": ""},
	"attack": {"scripts": ["enemy", "slime", "player"], "functions": ["attack", "_on_body_entered"], "pattern": ""},
	
	# UI sounds
	"button": {"scripts": ["menu", "ui", "main_menu"], "functions": ["_on_button_pressed", "_pressed"], "pattern": ""},
	"click": {"scripts": ["menu", "ui"], "functions": ["_on_button_pressed", "_pressed", "_gui_input"], "pattern": ""},
	"menu": {"scripts": ["menu", "ui", "main_menu"], "functions": ["_ready", "_on_button_pressed"], "pattern": ""},
	
	# Background/ambient - goes to game_manager/game/main scene
	"background": {"scripts": ["game_manager", "game", "main", "level", "world"], "functions": ["_ready"], "pattern": ""},
	"ambient": {"scripts": ["game_manager", "game", "main", "level", "world"], "functions": ["_ready"], "pattern": ""},
	"ambience": {"scripts": ["game_manager", "game", "main", "level", "world"], "functions": ["_ready"], "pattern": ""},
	"music": {"scripts": ["game_manager", "game", "main", "level", "music"], "functions": ["_ready"], "pattern": ""},
	"rain": {"scripts": ["game_manager", "game", "main", "level", "world"], "functions": ["_ready"], "pattern": ""},
}

func integrate_sounds(sound_mappings: Array, project_path: String = "res://") -> Dictionary:
	var report = {
		"success": true,
		"files_modified": [],
		"sounds_integrated": [],
		"errors": [],
		"skipped": []
	}
	
	var script_files = _find_script_files(project_path)
	print("[SoundIntegrator] Found ", script_files.size(), " script files")
	
	for mapping in sound_mappings:
		var sound_name = mapping.get("name", "")
		var sound_path = mapping.get("path", "")
		var context = mapping.get("context", "")
		
		if sound_name.is_empty() or sound_path.is_empty():
			continue
		
		print("[SoundIntegrator] Integrating: ", sound_name, " -> ", sound_path)
		
		var target = _find_target_script(sound_name, context, script_files)
		
		if target.is_empty():
			print("[SoundIntegrator] No target found for: ", sound_name)
			report.skipped.append({"sound": sound_name, "reason": "No target script found"})
			continue
		
		print("[SoundIntegrator] Target: ", target.file_path, " -> ", target.function)
		
		var result = _add_sound_to_script(target.file_path, sound_name, sound_path, target.function, target.pattern)
		
		if result.success:
			report.sounds_integrated.append(sound_name)
			if not (target.file_path in report.files_modified):
				report.files_modified.append(target.file_path)
		else:
			report.errors.append({"sound": sound_name, "error": result.error})
	
	integration_complete.emit(report)
	return report

func _find_script_files(root: String) -> Array:
	var files = []
	var dir = DirAccess.open(root)
	if not dir:
		return files
	
	dir.list_dir_begin()
	var name = dir.get_next()
	while name != "":
		var path = root.path_join(name)
		if dir.current_is_dir():
			if name != ".git" and name != ".godot" and name != "addons" and name != "luceta_generated":
				files.append_array(_find_script_files(path))
		elif name.ends_with(".gd"):
			files.append(path)
		name = dir.get_next()
	return files

func _find_target_script(sound_name: String, context: String, script_files: Array) -> Dictionary:
	var sound_lower = sound_name.to_lower().replace("_", " ").replace("-", " ")
	var context_lower = context.to_lower()
	
	print("[SoundIntegrator] Finding target for: ", sound_name)
	print("[SoundIntegrator] sound_lower: ", sound_lower)
	print("[SoundIntegrator] context_lower: ", context_lower)
	
	# Check each keyword in SOUND_TARGETS
	for keyword in SOUND_TARGETS.keys():
		if keyword in sound_lower or keyword in context_lower:
			print("[SoundIntegrator] Matched keyword: ", keyword)
			var target = SOUND_TARGETS[keyword]
			
			# Try to find matching script
			for script_name in target.scripts:
				for file_path in script_files:
					var file_name = file_path.get_file().to_lower()
					print("[SoundIntegrator] Checking script_name '", script_name, "' in file '", file_name, "'")
					if script_name in file_name:
						print("[SoundIntegrator] Found script: ", file_path)
						# Find the best matching function, or use _ready as default
						var best_func = _find_best_function(file_path, target.functions)
						if best_func.is_empty():
							best_func = "_ready"  # Will be created if doesn't exist
						print("[SoundIntegrator] Using function: ", best_func)
						return {
							"file_path": file_path,
							"function": best_func,
							"pattern": target.pattern
						}
	
	print("[SoundIntegrator] No keyword match, trying context fallback...")
	
	# Fallback: try to match based on context mentioning a script name
	for file_path in script_files:
		var file_name = file_path.get_file().replace(".gd", "").to_lower()
		if file_name in context_lower or file_name in sound_lower:
			print("[SoundIntegrator] Context fallback matched: ", file_path)
			return {
				"file_path": file_path,
				"function": "_ready",
				"pattern": ""
			}
	
	print("[SoundIntegrator] No target found!")
	return {}

func _find_best_function(file_path: String, target_functions: Array) -> String:
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		return ""
	
	var content = file.get_as_text()
	file.close()
	
	# Return the first matching function found in the file
	for func_name in target_functions:
		if ("func " + func_name) in content:
			return func_name
	
	# Fallback to _ready if it exists
	if "func _ready" in content:
		return "_ready"
	
	return ""


func _add_sound_to_script(file_path: String, sound_name: String, sound_path: String, target_func: String, pattern: String) -> Dictionary:
	var result = {"success": false, "error": ""}
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		result.error = "Cannot read: " + file_path
		return result
	
	var content = file.get_as_text()
	file.close()
	
	var var_name = sound_name.replace("-", "_").replace(" ", "_") + "_sfx"
	
	# Already has this sound?
	if var_name in content:
		result.success = true
		return result
	
	# Check if this is a background/ambient sound that should auto-play
	var sound_lower = sound_name.to_lower()
	var is_background = "background" in sound_lower or "ambient" in sound_lower or "ambience" in sound_lower or "music" in sound_lower
	
	var lines = content.split("\n")
	var new_content = ""
	
	var extends_idx = -1
	var ready_idx = -1
	var target_func_idx = -1
	var pattern_idx = -1
	var has_ready = false
	var has_helper = "func _play_sfx" in content
	
	# Find key lines
	for i in range(lines.size()):
		var line = lines[i]
		if line.begins_with("extends"):
			extends_idx = i
		if "func _ready(" in line:
			ready_idx = i
			has_ready = true
		if ("func " + target_func) in line:
			target_func_idx = i
		if not pattern.is_empty() and pattern in line:
			pattern_idx = i
	
	# Build new content
	for i in range(lines.size()):
		var line = lines[i]
		new_content += line + "\n"
		
		# Add variable after extends
		if i == extends_idx:
			new_content += "\n# Luceta Audio\n"
			new_content += "var " + var_name + ": AudioStream\n"
		
		# Add load in _ready (and auto-play for background sounds)
		if has_ready and i == ready_idx:
			new_content += "\tif ResourceLoader.exists(\"" + sound_path + "\"):\n"
			new_content += "\t\t" + var_name + " = load(\"" + sound_path + "\")\n"
			if is_background:
				new_content += "\t\t_play_background_sfx(" + var_name + ")\n"
		
		# Add play call for non-background sounds
		if not is_background:
			if pattern_idx >= 0 and i == pattern_idx:
				new_content += "\t\t_play_sfx(" + var_name + ")\n"
			elif pattern_idx < 0 and target_func_idx >= 0 and i == target_func_idx:
				new_content += "\t_play_sfx(" + var_name + ")\n"
	
	# Add _ready if missing
	if not has_ready:
		new_content += "\nfunc _ready():\n"
		new_content += "\tif ResourceLoader.exists(\"" + sound_path + "\"):\n"
		new_content += "\t\t" + var_name + " = load(\"" + sound_path + "\")\n"
		if is_background:
			new_content += "\t\t_play_background_sfx(" + var_name + ")\n"
	
	# Add helper if missing
	if not has_helper:
		new_content += "\n# === Luceta Audio Helper ===\n"
		new_content += "func _play_sfx(sound: AudioStream):\n"
		new_content += "\tif sound == null:\n"
		new_content += "\t\treturn\n"
		new_content += "\tvar player = AudioStreamPlayer.new()\n"
		new_content += "\tadd_child(player)\n"
		new_content += "\tplayer.stream = sound\n"
		new_content += "\tplayer.play()\n"
		new_content += "\tplayer.finished.connect(func(): player.queue_free())\n"
	
	# Add background helper for looping music
	if is_background and "func _play_background_sfx" not in content:
		new_content += "\nfunc _play_background_sfx(sound: AudioStream):\n"
		new_content += "\tif sound == null:\n"
		new_content += "\t\treturn\n"
		new_content += "\tvar player = AudioStreamPlayer.new()\n"
		new_content += "\tadd_child(player)\n"
		new_content += "\tplayer.stream = sound\n"
		new_content += "\tplayer.bus = \"Music\"\n"
		new_content += "\tplayer.play()\n"
		new_content += "\t# Loop the background music\n"
		new_content += "\tplayer.finished.connect(func(): player.play())\n"
	
	# Write
	var write_file = FileAccess.open(file_path, FileAccess.WRITE)
	if not write_file:
		result.error = "Cannot write: " + file_path
		return result
	
	write_file.store_string(new_content)
	write_file.close()
	
	result.success = true
	return result
