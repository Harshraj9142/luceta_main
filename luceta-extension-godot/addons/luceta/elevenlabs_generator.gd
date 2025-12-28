@tool
extends RefCounted
class_name ElevenLabsGenerator

# Handles ElevenLabs API calls for audio generation

signal audio_generated(sound_name: String, file_path: String)
signal generation_progress(current: int, total: int, sound_name: String)
signal generation_complete(all_files: Array)
signal generation_error(sound_name: String, error_message: String)

var api_key: String = ""
var base_url: String = "https://api.elevenlabs.io/v1"
var output_directory: String = "res://luceta_generated/"

func set_api_key(key: String):
	api_key = key

func set_output_directory(path: String):
	output_directory = path
	# Ensure directory exists
	var dir = DirAccess.open("res://")
	if not dir.dir_exists(output_directory.trim_prefix("res://")):
		dir.make_dir_recursive(output_directory.trim_prefix("res://"))

func generate_sound_effect(sound_data: Dictionary, http_request: HTTPRequest) -> void:
	"""
	Generate a sound effect using ElevenLabs sound generation API
	sound_data should have: name, description
	"""
	var sound_name = sound_data.get("name", "unnamed")
	var description = sound_data.get("description", "")
	
	if description.is_empty():
		generation_error.emit(sound_name, "Description is empty")
		return
	
	if api_key.is_empty():
		generation_error.emit(sound_name, "ElevenLabs API key not set")
		return
	
	# Correct endpoint for sound effects
	var url = base_url + "/sound-generation"
	var headers = [
		"xi-api-key: " + api_key,
		"Content-Type: application/json"
	]
	
	var request_data = {
		"text": description,
		"duration_seconds": _estimate_duration(description),
		"prompt_influence": 0.3
	}
	
	var json = JSON.stringify(request_data)
	print("[Luceta] Generating sound: ", sound_name)
	print("[Luceta] URL: ", url)
	print("[Luceta] Request data: ", json)
	
	var error = http_request.request(url, headers, HTTPClient.METHOD_POST, json)
	
	if error != OK:
		print("[Luceta] Request error code: ", error)
		generation_error.emit(sound_name, "Failed to send request: " + str(error))

func generate_dialog(sound_data: Dictionary, http_request: HTTPRequest) -> void:
	"""
	Generate dialog audio using ElevenLabs text-to-speech API
	sound_data should have: name, dialog (text), voice_id (optional), use_dialogue_api (optional)
	"""
	var sound_name = sound_data.get("name", "unnamed")
	var dialog_text = sound_data.get("dialog", "")
	var voice_id = sound_data.get("voice_id", "Xb7hH8MSUJpSbSDYk0k2")
	var model_id = sound_data.get("model_id", "eleven_multilingual_v2")
	var use_dialogue_api = sound_data.get("use_dialogue_api", false)
	
	if dialog_text.is_empty():
		generation_error.emit(sound_name, "Dialog text is empty")
		return
	
	# Use Text to Dialogue API if requested (better for multi-speaker conversations)
	if use_dialogue_api:
		_generate_text_to_dialogue(sound_name, dialog_text, voice_id, model_id, http_request)
	else:
		# Standard Text to Speech
		var url = base_url + "/text-to-speech/" + voice_id + "?output_format=mp3_44100_128"
		var headers = [
			"xi-api-key: " + api_key,
			"Content-Type: application/json"
		]
		
		var request_data = {
			"text": dialog_text,
			"model_id": model_id
		}
		
		var json = JSON.stringify(request_data)
		var error = http_request.request(url, headers, HTTPClient.METHOD_POST, json)
		
		if error != OK:
			generation_error.emit(sound_name, "Failed to send request: " + str(error))

func _generate_text_to_dialogue(sound_name: String, dialog_text: String, voice_id: String, model_id: String, http_request: HTTPRequest):
	"""
	Generate dialogue using Text to Dialogue API (better for multi-speaker conversations)
	"""
	var url = base_url + "/text-to-dialogue"
	var headers = [
		"xi-api-key: " + api_key,
		"Content-Type: application/json"
	]
	
	var request_data = {
		"text": dialog_text,
		"voice_id": voice_id,
		"model_id": model_id,
		"output_format": "mp3_44100_128"
	}
	
	var json = JSON.stringify(request_data)
	var error = http_request.request(url, headers, HTTPClient.METHOD_POST, json)
	
	if error != OK:
		generation_error.emit(sound_name, "Failed to send dialogue request: " + str(error))

func generate_music(sound_data: Dictionary, http_request: HTTPRequest) -> void:
	"""
	Generate background music using ElevenLabs Music API
	sound_data should have: name, description/prompt, duration (optional)
	Note: API access coming soon, currently web-only
	"""
	var sound_name = sound_data.get("name", "unnamed")
	var prompt = sound_data.get("description", sound_data.get("prompt", ""))
	var duration = sound_data.get("duration", 30.0)  # Default 30 seconds
	
	if prompt.is_empty():
		generation_error.emit(sound_name, "Music prompt is empty")
		return
	
	# Note: Music API endpoint may vary when it becomes available
	# This is a placeholder for when the API is released
	var url = base_url + "/music-generation"
	var headers = [
		"xi-api-key: " + api_key,
		"Content-Type: application/json"
	]
	
	var request_data = {
		"prompt": prompt,
		"duration": duration
	}
	
	var json = JSON.stringify(request_data)
	var error = http_request.request(url, headers, HTTPClient.METHOD_POST, json)
	
	if error != OK:
		generation_error.emit(sound_name, "Failed to send music request: " + str(error))

func handle_response(sound_name: String, response_code: int, body: PackedByteArray, audio_type: String = "sfx") -> String:
	"""
	Handle HTTP response and save audio file
	Returns the file path if successful, empty string if error
	audio_type: "sfx", "dialog", "music", "bgm"
	"""
	print("[Luceta] Response code: ", response_code, " for sound: ", sound_name, " (", body.size(), " bytes)")
	
	if response_code == 0:
		generation_error.emit(sound_name, "Network error - request failed to connect")
		return ""
	
	if response_code != 200:
		var error_text = body.get_string_from_utf8()
		print("[Luceta] Error response: ", error_text)
		generation_error.emit(sound_name, "API returned error code: " + str(response_code))
		return ""
	
	# Check if body is empty or too small
	if body.is_empty():
		generation_error.emit(sound_name, "Empty response from API")
		return ""
	
	if body.size() < 100:
		generation_error.emit(sound_name, "Response too small - likely corrupted (" + str(body.size()) + " bytes)")
		return ""
	
	# Determine file path based on audio type
	var subdir = ""
	match audio_type:
		"dialog":
			subdir = "dialog/"
		"music", "bgm":
			subdir = "music/"
		_:
			subdir = ""  # Sound effects go to root
	
	var file_path = output_directory + subdir + sound_name + ".mp3"
	var global_path = ProjectSettings.globalize_path(file_path)
	
	print("[Luceta] Saving to res path: ", file_path)
	print("[Luceta] Saving to global path: ", global_path)
	
	# Ensure directory exists using global path
	var dir_global_path = global_path.get_base_dir()
	var dir = DirAccess.open(dir_global_path.get_base_dir())
	if dir:
		if not DirAccess.dir_exists_absolute(dir_global_path):
			var err = DirAccess.make_dir_recursive_absolute(dir_global_path)
			if err != OK:
				print("[Luceta] Failed to create directory: ", dir_global_path, " error: ", err)
				generation_error.emit(sound_name, "Failed to create directory")
				return ""
			print("[Luceta] Created directory: ", dir_global_path)
	
	# Delete existing file first to avoid corruption
	if FileAccess.file_exists(global_path):
		DirAccess.remove_absolute(global_path)
	
	# Save file using global path for reliability
	var file = FileAccess.open(global_path, FileAccess.WRITE)
	if not file:
		var error = FileAccess.get_open_error()
		print("[Luceta] Failed to open file: ", global_path, " error: ", error)
		generation_error.emit(sound_name, "Failed to open file for writing: " + global_path + " (error: " + str(error) + ")")
		return ""
	
	file.store_buffer(body)
	file.flush()  # Ensure data is written to disk
	file.close()
	
	# Verify the file was written correctly
	if not FileAccess.file_exists(global_path):
		print("[Luceta] File does not exist after write: ", global_path)
		generation_error.emit(sound_name, "File not found after write")
		return ""
	
	var verify_file = FileAccess.open(global_path, FileAccess.READ)
	if verify_file:
		var written_size = verify_file.get_length()
		verify_file.close()
		if written_size != body.size():
			generation_error.emit(sound_name, "File size mismatch after write: expected " + str(body.size()) + ", got " + str(written_size))
			return ""
		print("[Luceta] Verified file size: ", written_size, " bytes")
	else:
		generation_error.emit(sound_name, "Could not verify written file")
		return ""
	
	print("[Luceta] Successfully saved: ", file_path)
	
	# Import the resource so Godot recognizes it
	EditorInterface.get_resource_filesystem().scan()
	
	audio_generated.emit(sound_name, file_path)
	return file_path

func _estimate_duration(description: String) -> float:
	# Estimate duration based on description keywords
	# ElevenLabs requires duration between 0.5 and 22 seconds
	var desc_lower = description.to_lower()
	var duration: float = 1.5  # Default - slightly longer for more impact
	
	# Background/ambient sounds - longer duration
	if "background" in desc_lower or "ambient" in desc_lower or "ambience" in desc_lower:
		duration = 15.0
	elif "loop" in desc_lower or "looping" in desc_lower:
		duration = 12.0
	elif "rain" in desc_lower or "thunder" in desc_lower or "weather" in desc_lower:
		duration = 15.0
	elif "music" in desc_lower or "bgm" in desc_lower or "melody" in desc_lower:
		duration = 15.0
	# Short, punchy sounds
	elif "short" in desc_lower or "quick" in desc_lower or "brief" in desc_lower or "snappy" in desc_lower:
		duration = 0.8
	elif "footstep" in desc_lower or "step" in desc_lower:
		duration = 0.5
	elif "jump" in desc_lower or "whoosh" in desc_lower or "springy" in desc_lower:
		duration = 0.8
	elif "collect" in desc_lower or "pickup" in desc_lower or "coin" in desc_lower or "chime" in desc_lower:
		duration = 0.8
	# Medium sounds
	elif "death" in desc_lower or "die" in desc_lower or "dramatic" in desc_lower:
		duration = 1.5
	elif "explosion" in desc_lower or "impact" in desc_lower or "hit" in desc_lower:
		duration = 1.2
	elif "punchy" in desc_lower or "powerful" in desc_lower:
		duration = 1.0
	
	# Clamp to valid range (0.5 to 22 for sound effects)
	return clampf(duration, 0.5, 22.0)
