@tool
extends RefCounted
class_name AudioCache

# Caching system for code analysis results and generated audio metadata

var cache_dir: String = "res://.godot/luceta_cache/"
var analysis_cache_file: String = "analysis_cache.json"
var audio_metadata_file: String = "audio_metadata.json"

var analysis_cache: Dictionary = {}
var audio_metadata: Dictionary = {}

func _init():
	_load_cache()

func _load_cache():
	# Load analysis cache
	var cache_path = cache_dir + analysis_cache_file
	if FileAccess.file_exists(cache_path):
		var file = FileAccess.open(cache_path, FileAccess.READ)
		if file:
			var json = JSON.parse_string(file.get_as_text())
			if json:
				analysis_cache = json
			file.close()
	
	# Load audio metadata
	var metadata_path = cache_dir + audio_metadata_file
	if FileAccess.file_exists(metadata_path):
		var file = FileAccess.open(metadata_path, FileAccess.READ)
		if file:
			var json = JSON.parse_string(file.get_as_text())
			if json:
				audio_metadata = json
			file.close()

func get_file_hash(file_path: String) -> String:
	# Get file modification time as a simple hash
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		return ""
	
	var mod_time = FileAccess.get_modified_time(file_path)
	file.close()
	return str(mod_time)

func get_analysis_cache_key(project_path: String) -> String:
	# Generate cache key based on project files
	var key_string = ""
	var gd_files = _find_files(project_path, "*.gd")
	var tscn_files = _find_files(project_path, "*.tscn")
	
	# Use file hashes to detect changes
	for file_path in gd_files:
		key_string += file_path + ":" + get_file_hash(file_path) + "|"
	for file_path in tscn_files:
		key_string += file_path + ":" + get_file_hash(file_path) + "|"
	
	return str(key_string.hash())

func get_cached_analysis(cache_key: String) -> Dictionary:
	if analysis_cache.has(cache_key):
		return analysis_cache[cache_key]
	return {}

func save_analysis_cache(cache_key: String, results: Dictionary):
	analysis_cache[cache_key] = results
	_save_cache()

func is_audio_generated(sound_name: String) -> bool:
	return audio_metadata.has(sound_name)

func get_audio_path(sound_name: String) -> String:
	if audio_metadata.has(sound_name):
		return audio_metadata[sound_name].get("path", "")
	return ""

func save_audio_metadata(sound_name: String, file_path: String, description: String):
	audio_metadata[sound_name] = {
		"path": file_path,
		"description": description,
		"generated_at": Time.get_unix_time_from_system()
	}
	_save_cache()

func _save_cache():
	# Ensure cache directory exists
	var cache_dir_path = cache_dir.trim_prefix("res://")
	var dir = DirAccess.open("res://")
	if dir and not dir.dir_exists(cache_dir_path):
		var parts = cache_dir_path.split("/")
		var current_path = ""
		for part in parts:
			if part.is_empty():
				continue
			current_path += part + "/"
			if not dir.dir_exists(current_path):
				dir.make_dir(current_path)
	
	# Save analysis cache
	var analysis_cache_path = cache_dir + analysis_cache_file
	var file = FileAccess.open(analysis_cache_path, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(analysis_cache))
		file.close()
	
	# Save audio metadata
	var metadata_path = cache_dir + audio_metadata_file
	file = FileAccess.open(metadata_path, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(audio_metadata))
		file.close()

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

func clear_cache():
	analysis_cache.clear()
	audio_metadata.clear()
	_save_cache()

func clear_stale_entries():
	"""Remove cache entries for files that no longer exist on disk"""
	var stale_keys = []
	for sound_name in audio_metadata.keys():
		var path = audio_metadata[sound_name].get("path", "")
		if not path.is_empty() and not FileAccess.file_exists(path):
			stale_keys.append(sound_name)
	
	for key in stale_keys:
		audio_metadata.erase(key)
		print("[AudioCache] Cleared stale entry: ", key)
	
	if stale_keys.size() > 0:
		_save_cache()
	
	return stale_keys.size()

