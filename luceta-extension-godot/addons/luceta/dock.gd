@tool
extends Control

# Main editor dock for Luceta - Enhanced with retry, custom prompts, and revert

var analyze_button: Button
var revert_button: Button
var progress_label: Label
var progress_bar: ProgressBar
var results_container: VBoxContainer
var scroll_container: ScrollContainer
var review_panel: PanelContainer
var suggestions_list: VBoxContainer
var generate_button: Button
var integrate_button: Button
var add_sound_button: Button
var sound_name_edit: LineEdit
var sound_prompt_edit: LineEdit

var code_analyzer: CodeAnalyzer
var llm_analyzer: LLMAnalyzer
var audio_generator: ElevenLabsGenerator
var audio_cache: AudioCache
var auto_wiring: AutoWiring
var sound_integrator: SoundIntegrator
var backup_manager: BackupManager

var analysis_results: Dictionary = {}
var sound_suggestions: Array = []
var http_request: HTTPRequest
var elevenlabs_request: HTTPRequest

var plugin: EditorPlugin
var generation_queue: Array = []
var currently_generating: Dictionary = {}
var generated_files: Array = []
var is_generating: bool = false
var retry_count: int = 0
const MAX_RETRIES = 3

func _initialize(p: EditorPlugin):
	plugin = p
	code_analyzer = CodeAnalyzer.new()
	llm_analyzer = LLMAnalyzer.new()
	audio_generator = ElevenLabsGenerator.new()
	audio_cache = AudioCache.new()
	auto_wiring = AutoWiring.new()
	sound_integrator = SoundIntegrator.new()
	backup_manager = BackupManager.new()
	
	_setup_ui_references()
	_setup_http_requests()
	_connect_signals()
	_load_api_keys()
	
	audio_generator.set_output_directory("res://luceta_generated/")
	
	# Clear any stale cache entries for deleted files
	var cleared = audio_cache.clear_stale_entries()
	if cleared > 0:
		print("[Luceta] Cleared ", cleared, " stale cache entries")
	
	if review_panel:
		review_panel.visible = false
	
	_update_revert_button()


func _setup_ui_references():
	analyze_button = $VBoxContainer/TopPanel/VBoxContainer2/HBoxContainer/AnalyzeButton
	revert_button = $VBoxContainer/TopPanel/VBoxContainer2/HBoxContainer/RevertButton
	progress_label = $VBoxContainer/TopPanel/VBoxContainer2/HBoxContainer/ProgressLabel
	progress_bar = $VBoxContainer/TopPanel/VBoxContainer2/ProgressBar
	scroll_container = $VBoxContainer/ScrollContainer
	results_container = $VBoxContainer/ScrollContainer/ResultsContainer
	review_panel = $VBoxContainer/ReviewPanel
	suggestions_list = $VBoxContainer/ReviewPanel/MarginContainer/VBoxContainer/SuggestionsScroll/SuggestionsList
	generate_button = $VBoxContainer/ReviewPanel/MarginContainer/VBoxContainer/ButtonsContainer/GenerateButton
	integrate_button = $VBoxContainer/ReviewPanel/MarginContainer/VBoxContainer/ButtonsContainer/IntegrateButton
	add_sound_button = $VBoxContainer/ReviewPanel/MarginContainer/VBoxContainer/AddSoundPanel/AddSoundVBox/AddSoundHBox/AddSoundButton
	sound_name_edit = $VBoxContainer/ReviewPanel/MarginContainer/VBoxContainer/AddSoundPanel/AddSoundVBox/AddSoundHBox/SoundNameEdit
	sound_prompt_edit = $VBoxContainer/ReviewPanel/MarginContainer/VBoxContainer/AddSoundPanel/AddSoundVBox/SoundPromptEdit
	
	if progress_bar:
		progress_bar.visible = false
		progress_bar.max_value = 100

func _setup_http_requests():
	http_request = HTTPRequest.new()
	http_request.use_threads = true
	add_child(http_request)
	http_request.request_completed.connect(_on_llm_request_completed)
	
	elevenlabs_request = HTTPRequest.new()
	elevenlabs_request.use_threads = true
	elevenlabs_request.timeout = 60.0
	add_child(elevenlabs_request)
	elevenlabs_request.request_completed.connect(_on_elevenlabs_request_completed)

func _connect_signals():
	audio_generator.audio_generated.connect(_on_audio_generated)
	audio_generator.generation_progress.connect(_on_generation_progress)
	audio_generator.generation_complete.connect(_on_generation_complete)
	audio_generator.generation_error.connect(_on_generation_error)
	
	if analyze_button:
		analyze_button.pressed.connect(_on_analyze_pressed)
	if generate_button:
		generate_button.pressed.connect(_on_generate_pressed)
	if integrate_button:
		integrate_button.pressed.connect(_on_integrate_pressed)
	if revert_button:
		revert_button.pressed.connect(_on_revert_pressed)
	if add_sound_button:
		add_sound_button.pressed.connect(_on_add_sound_pressed)


func _load_api_keys():
	var groq_key = ProjectSettings.get_setting("luceta/groq_api_key", "")
	if groq_key.is_empty():
		groq_key = ProjectSettings.get_setting("luceta/fal_api_key", "")
		if groq_key.is_empty():
			var file = FileAccess.open("res://GROQ_API_KEY.txt", FileAccess.READ)
			if file:
				groq_key = file.get_as_text().strip_edges()
				file.close()
	llm_analyzer.set_api_key(groq_key)
	
	var elevenlabs_key = ProjectSettings.get_setting("luceta/elevenlabs_api_key", "")
	if elevenlabs_key.is_empty():
		var file = FileAccess.open("res://ELEVEN_LABS_API_KEY.txt", FileAccess.READ)
		if file:
			elevenlabs_key = file.get_as_text().strip_edges()
			file.close()
	audio_generator.set_api_key(elevenlabs_key)

func _update_revert_button():
	if revert_button:
		revert_button.disabled = not backup_manager.has_backups()

func _on_add_sound_pressed():
	var name = sound_name_edit.text.strip_edges()
	var prompt = sound_prompt_edit.text.strip_edges()
	
	if name.is_empty():
		progress_label.text = "❌ Please enter a sound name"
		return
	if prompt.is_empty():
		progress_label.text = "❌ Please enter a sound description"
		return
	
	# Add to suggestions
	sound_suggestions.append({
		"name": name,
		"description": prompt,
		"why": "Custom sound added by user",
		"context": "User defined"
	})
	
	# Clear inputs
	sound_name_edit.text = ""
	sound_prompt_edit.text = ""
	
	# Refresh UI
	_show_review_panel()
	progress_label.text = "✅ Added custom sound: " + name


func _on_revert_pressed():
	var confirm = ConfirmationDialog.new()
	confirm.title = "Revert All Changes?"
	confirm.dialog_text = "This will:\n• Restore all modified scripts to their original state\n• Delete all generated sound files\n\nAre you sure?"
	confirm.confirmed.connect(func():
		_perform_revert()
		confirm.queue_free()
	)
	confirm.canceled.connect(func(): confirm.queue_free())
	add_child(confirm)
	confirm.popup_centered()

func _perform_revert():
	progress_label.text = "↩️ Reverting changes..."
	
	var report = backup_manager.restore_all()
	
	# Clear in-memory caches
	audio_cache.clear_cache()
	sound_suggestions.clear()
	generated_files.clear()
	generation_queue.clear()
	analysis_results.clear()
	
	var msg = "↩️ Reverted: "
	msg += str(report.restored.size()) + " files restored, "
	msg += str(report.sounds_deleted.size()) + " sounds deleted"
	
	if report.failed.size() > 0:
		msg += " (" + str(report.failed.size()) + " failed)"
	
	progress_label.text = msg
	_update_revert_button()
	
	# Hide review panel since we cleared everything
	if review_panel:
		review_panel.visible = false
	
	# Refresh filesystem
	EditorInterface.get_resource_filesystem().scan()
	
	# Show success dialog
	var dialog = AcceptDialog.new()
	dialog.title = "Revert Complete"
	var details = "Restored files:\n"
	for f in report.restored:
		details += "  • " + f.get_file() + "\n"
	details += "\nDeleted sounds:\n"
	for s in report.sounds_deleted:
		details += "  • " + s + "\n"
	details += "\nCaches cleared. Click 'Analyze Code' to start fresh."
	dialog.dialog_text = details
	dialog.confirmed.connect(func(): dialog.queue_free())
	add_child(dialog)
	dialog.popup_centered()

func _on_analyze_pressed():
	if not analyze_button:
		return
	
	analyze_button.disabled = true
	progress_label.text = "Analyzing code..."
	if progress_bar:
		progress_bar.visible = true
		progress_bar.value = 0
	
	if results_container:
		for child in results_container.get_children():
			child.queue_free()
	
	var project_path = ProjectSettings.globalize_path("res://")
	var cache_key = audio_cache.get_analysis_cache_key(project_path)
	var cached_results = audio_cache.get_cached_analysis(cache_key)
	
	if not cached_results.is_empty():
		progress_label.text = "Using cached analysis..."
		await get_tree().process_frame
		_on_code_analysis_complete(cached_results)
		return
	
	code_analyzer.analysis_complete.connect(_on_code_analysis_complete, CONNECT_ONE_SHOT)
	code_analyzer.analyze_project(project_path)


func _on_code_analysis_complete(results: Dictionary):
	analysis_results = results
	var project_path = ProjectSettings.globalize_path("res://")
	var cache_key = audio_cache.get_analysis_cache_key(project_path)
	audio_cache.save_analysis_cache(cache_key, results)
	
	progress_label.text = "Code analysis complete. Querying LLM..."
	if progress_bar:
		progress_bar.value = 50
	
	_send_to_llm(results)

func _send_to_llm(code_results: Dictionary):
	var prompt = _build_llm_prompt(code_results)
	var api_key = llm_analyzer.get_api_key()
	
	if api_key.is_empty():
		progress_label.text = "Error: Groq API key not set!"
		analyze_button.disabled = false
		if progress_bar:
			progress_bar.visible = false
		return
	
	var url = llm_analyzer.get_api_url()
	var headers = [
		"Authorization: Bearer " + api_key,
		"Content-Type: application/json"
	]
	
	var request_data = {
		"model": llm_analyzer.get_model(),
		"messages": [{"role": "user", "content": prompt}],
		"temperature": 0.6,
		"max_tokens": 4096
	}
	
	var json = JSON.stringify(request_data)
	var error = http_request.request(url, headers, HTTPClient.METHOD_POST, json)
	
	if error != OK:
		progress_label.text = "Error: Failed to send request"
		analyze_button.disabled = false
		if progress_bar:
			progress_bar.visible = false

func _build_llm_prompt(code_results: Dictionary) -> String:
	var prompt = """You are an expert game audio designer analyzing a Godot game project to suggest sound effects.

IMPORTANT GUIDELINES:

FOR SOUND EFFECTS (player actions, collectibles, enemies):
- Make them HIGHLY ENERGETIC, PUNCHY, and SATISFYING
- Use words like: punchy, crisp, satisfying, impactful, dynamic, powerful, snappy
- Sound effects should feel rewarding and give strong feedback

FOR BACKGROUND/AMBIENT MUSIC:
- Make it SOFT, GENTLE, MELODIC, and RELAXING
- Use words like: soft, gentle, soothing, calm, peaceful, melodic, ambient, lo-fi
- Should NOT be punchy or energetic - it's background atmosphere
- Think lo-fi beats, soft piano, gentle synths, peaceful ambience

DO NOT INCLUDE:
- Footstep sounds (player_walk, player_run, footsteps) - NOT NEEDED
- Walking sounds - NOT NEEDED

NAMING CONVENTION - USE THESE EXACT PREFIXES:
- Player sounds: "player_jump", "player_land", "player_hurt" (NO footsteps!)
- Death sounds: "player_death", "enemy_death", "slime_death"
- Collectibles: "coin_collect", "gem_collect", "item_pickup", "powerup_collect"
- Enemy sounds: "enemy_hit", "enemy_attack", "slime_bounce", "slime_hit"
- UI sounds: "button_click", "menu_open", "menu_close"
- Background: "background_ambience", "background_music", "ambient_rain"

DETECTED GAME EVENTS:
"""
	for event in code_results.get("events", []):
		prompt += "- " + event.name + " (" + event.sound_hint + "): " + event.context + "\n"
	prompt += "\nDETECTED ACTIONS:\n"
	for action in code_results.get("actions", []):
		prompt += "- " + action.name + " (" + action.sound_hint + ")\n"
	
	prompt += """
REQUIRED OUTPUT:
Provide a JSON object with key 'fx' containing an array of sound suggestions.

MANDATORY SOUNDS TO INCLUDE:
1. "background_ambience" - MUST BE: Soft, gentle, melodic lo-fi ambient music with light rain, peaceful piano notes, calm and soothing atmosphere, very relaxed mood, 15 seconds loopable
2. For each player action detected (jump, death, etc.) - use "player_" prefix, make PUNCHY
3. For each collectible detected - use "_collect" suffix, make SATISFYING
4. For each enemy detected - use "enemy_" or specific enemy name prefix

DO NOT INCLUDE footstep or walking sounds!

EXAMPLE FORMAT:
{
  "fx": [
    {
      "name": "player_jump",
      "description": "Powerful, punchy whoosh with a satisfying springy pop, energetic and responsive, 0.5s",
      "why": "Player jump action needs audio feedback",
      "context": "player.gd _physics_process"
    },
    {
      "name": "coin_collect",
      "description": "Bright, sparkling chime with satisfying magical shimmer, crisp and rewarding, 0.5s",
      "why": "Collecting coins needs rewarding feedback",
      "context": "coin.gd _on_body_entered"
    },
    {
      "name": "player_death",
      "description": "Dramatic impact with punchy thud, quick descending tone, 1s",
      "why": "Player death needs clear audio cue",
      "context": "killzone.gd _on_body_entered"
    },
    {
      "name": "background_ambience",
      "description": "Soft, gentle lo-fi ambient music with light rain patter, peaceful melodic piano notes, warm pad synths, calm and soothing atmosphere, very relaxed and dreamy mood, 15s loopable",
      "why": "Creates peaceful immersive game atmosphere",
      "context": "game_manager.gd _ready"
    }
  ]
}

Respond with ONLY valid JSON, no markdown. Use the exact naming convention shown above.
REMEMBER: Background music must be SOFT and MELODIC, not punchy! NO FOOTSTEPS!"""
	return prompt


func _on_llm_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray):
	if response_code == 200:
		var json = JSON.parse_string(body.get_string_from_utf8())
		if json and json.has("choices") and json.choices.size() > 0:
			var content = json.choices[0].get("message", {}).get("content", "")
			if not content.is_empty():
				_parse_llm_response(content)
				return
	
	progress_label.text = "Error: LLM request failed (code " + str(response_code) + ")"
	analyze_button.disabled = false
	if progress_bar:
		progress_bar.visible = false

func _parse_llm_response(output: String):
	var json_start = output.find("{")
	var json_end = output.rfind("}")
	if json_start >= 0 and json_end > json_start:
		output = output.substr(json_start, json_end - json_start + 1)
	
	var json = JSON.parse_string(output)
	if json and json.has("fx") and json.fx is Array:
		sound_suggestions = json.fx
		_show_review_panel()
	else:
		progress_label.text = "Error: Invalid LLM response"
		analyze_button.disabled = false
		if progress_bar:
			progress_bar.visible = false

func _show_review_panel():
	review_panel.visible = true
	
	for child in suggestions_list.get_children():
		child.queue_free()
	
	await get_tree().process_frame
	
	var generated_count = 0
	for i in range(sound_suggestions.size()):
		var suggestion = sound_suggestions[i]
		var item = _create_suggestion_item(suggestion, i)
		suggestions_list.add_child(item)
		
		# Check if file actually exists on disk
		var sound_name = suggestion.get("name", "")
		var audio_path = "res://luceta_generated/" + sound_name + ".mp3"
		var global_path = ProjectSettings.globalize_path(audio_path)
		
		if FileAccess.file_exists(global_path):
			generated_count += 1
			print("[Luceta] Found generated file: ", audio_path)
		else:
			print("[Luceta] File not found: ", global_path)
	
	progress_label.text = "✅ " + str(sound_suggestions.size()) + " sounds (" + str(generated_count) + " generated)"
	analyze_button.disabled = false
	if progress_bar:
		progress_bar.visible = false
	
	if generate_button:
		generate_button.disabled = false
	if integrate_button:
		integrate_button.disabled = (generated_count == 0)


func _create_suggestion_item(suggestion: Dictionary, index: int) -> Control:
	var container = PanelContainer.new()
	var margin = MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 4)
	margin.add_theme_constant_override("margin_right", 4)
	margin.add_theme_constant_override("margin_top", 4)
	margin.add_theme_constant_override("margin_bottom", 4)
	container.add_child(margin)
	
	var vbox = VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 2)
	margin.add_child(vbox)
	
	# Name row
	var name_hbox = HBoxContainer.new()
	var name_label = Label.new()
	name_label.text = "Name:"
	name_label.custom_minimum_size.x = 50
	var name_edit = LineEdit.new()
	name_edit.text = suggestion.get("name", "")
	name_edit.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_edit.text_changed.connect(func(t): sound_suggestions[index]["name"] = t)
	name_hbox.add_child(name_label)
	name_hbox.add_child(name_edit)
	vbox.add_child(name_hbox)
	
	# Description (editable prompt) - use LineEdit for compactness
	var desc_hbox = HBoxContainer.new()
	var desc_label = Label.new()
	desc_label.text = "Prompt:"
	desc_label.custom_minimum_size.x = 50
	var desc_edit = LineEdit.new()
	desc_edit.text = suggestion.get("description", "")
	desc_edit.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	desc_edit.text_changed.connect(func(t): sound_suggestions[index]["description"] = t)
	desc_hbox.add_child(desc_label)
	desc_hbox.add_child(desc_edit)
	vbox.add_child(desc_hbox)
	
	# Status and buttons row
	var btn_hbox = HBoxContainer.new()
	btn_hbox.add_theme_constant_override("separation", 4)
	
	# Check if file actually exists on disk using global path
	var sound_name = suggestion.get("name", "")
	var audio_path = "res://luceta_generated/" + sound_name + ".mp3"
	var global_path = ProjectSettings.globalize_path(audio_path)
	
	var file_exists = FileAccess.file_exists(global_path)
	
	if file_exists:
		var preview_btn = Button.new()
		preview_btn.text = "▶"
		preview_btn.tooltip_text = "Play sound"
		preview_btn.pressed.connect(func(): _preview_audio(audio_path))
		btn_hbox.add_child(preview_btn)
		
		var regen_btn = Button.new()
		regen_btn.text = "🔄"
		regen_btn.tooltip_text = "Regenerate"
		regen_btn.pressed.connect(func(): _regenerate_single(index))
		btn_hbox.add_child(regen_btn)
	
	var remove_btn = Button.new()
	remove_btn.text = "🗑"
	remove_btn.tooltip_text = "Remove"
	remove_btn.pressed.connect(func(): _remove_suggestion(index))
	btn_hbox.add_child(remove_btn)
	
	var status_label = Label.new()
	if file_exists:
		status_label.text = "✅ Generated"
		status_label.add_theme_color_override("font_color", Color.GREEN)
	else:
		status_label.text = "⏳ Not generated"
		status_label.add_theme_color_override("font_color", Color.YELLOW)
	status_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	btn_hbox.add_child(status_label)
	
	vbox.add_child(btn_hbox)
	
	return container


func _regenerate_single(index: int):
	if index < 0 or index >= sound_suggestions.size():
		return
	
	var suggestion = sound_suggestions[index]
	var sound_name = suggestion.get("name", "")
	
	# Delete existing file
	var old_path = audio_cache.get_audio_path(sound_name)
	if old_path and FileAccess.file_exists(old_path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(old_path))
		if FileAccess.file_exists(old_path + ".import"):
			DirAccess.remove_absolute(ProjectSettings.globalize_path(old_path + ".import"))
	
	# Add to queue and generate
	generation_queue = [suggestion]
	generated_files.clear()
	retry_count = 0
	progress_label.text = "🔄 Regenerating: " + sound_name
	_generate_next_audio()

func _preview_audio(file_path: String):
	var audio_stream = load(file_path) as AudioStream
	if not audio_stream:
		push_error("Failed to load audio: " + file_path)
		return
	
	var player = AudioStreamPlayer.new()
	add_child(player)
	player.stream = audio_stream
	player.play()
	player.finished.connect(func(): player.queue_free())

func _remove_suggestion(index: int):
	sound_suggestions.remove_at(index)
	_show_review_panel()

func _on_generate_pressed():
	if sound_suggestions.is_empty():
		progress_label.text = "❌ No sounds to generate"
		return
	
	var elevenlabs_key = ProjectSettings.get_setting("luceta/elevenlabs_api_key", "")
	if elevenlabs_key.is_empty():
		var file = FileAccess.open("res://ELEVEN_LABS_API_KEY.txt", FileAccess.READ)
		if file:
			elevenlabs_key = file.get_as_text().strip_edges()
			file.close()
	
	if elevenlabs_key.is_empty():
		progress_label.text = "❌ ElevenLabs API key not set!"
		return
	
	audio_generator.set_api_key(elevenlabs_key)
	generate_button.disabled = true
	progress_label.text = "Generating audio..."
	if progress_bar:
		progress_bar.visible = true
		progress_bar.value = 0
		progress_bar.max_value = sound_suggestions.size()
	
	# Reset state completely
	generation_queue.clear()
	generated_files.clear()
	is_generating = false  # Reset flag to ensure we can start fresh
	retry_count = 0
	
	# Ensure output directory exists
	var dir = DirAccess.open("res://")
	if dir and not dir.dir_exists("luceta_generated"):
		dir.make_dir("luceta_generated")
	
	# Check each suggestion - verify file actually exists on disk, not just in cache
	for suggestion in sound_suggestions:
		var sound_name = suggestion.get("name", "")
		var audio_path = "res://luceta_generated/" + sound_name + ".mp3"
		
		# Check if file actually exists on disk (not just in cache)
		if FileAccess.file_exists(audio_path):
			generated_files.append(audio_path)
			print("[Luceta] Skipping already generated: ", sound_name)
		else:
			# Clear stale cache entry if file doesn't exist
			if audio_cache.is_audio_generated(sound_name):
				print("[Luceta] Clearing stale cache for: ", sound_name)
			generation_queue.append(suggestion)
	
	if generation_queue.is_empty():
		progress_label.text = "✅ All sounds already generated!"
		generate_button.disabled = false
		if progress_bar:
			progress_bar.visible = false
		if integrate_button:
			integrate_button.disabled = false
		return
	
	print("[Luceta] Starting generation of ", generation_queue.size(), " sounds")
	_generate_next_audio()


func _generate_next_audio():
	print("[Luceta] _generate_next_audio called, is_generating=", is_generating, ", queue size=", generation_queue.size())
	
	if is_generating:
		print("[Luceta] Already generating, skipping")
		return
	
	if generation_queue.is_empty():
		print("[Luceta] Queue empty, generation complete")
		is_generating = false
		_on_generation_complete(generated_files)
		return
	
	is_generating = true
	var suggestion = generation_queue.pop_front()
	currently_generating = suggestion
	retry_count = 0
	
	var sound_name = suggestion.get("name", "unknown")
	var description = suggestion.get("description", "")
	
	print("[Luceta] Generating: ", sound_name, " - ", description.substr(0, 50))
	progress_label.text = "🎵 Generating: " + sound_name
	if progress_bar:
		progress_bar.value = sound_suggestions.size() - generation_queue.size()
	
	audio_generator.generate_sound_effect(suggestion, elevenlabs_request)

func _on_elevenlabs_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray):
	var sound_name = currently_generating.get("name", "unknown")
	
	# Check for errors and retry
	if result != HTTPRequest.RESULT_SUCCESS or response_code != 200:
		retry_count += 1
		if retry_count < MAX_RETRIES:
			progress_label.text = "⚠️ Retrying " + sound_name + " (" + str(retry_count) + "/" + str(MAX_RETRIES) + ")"
			await get_tree().create_timer(2.0).timeout
			audio_generator.generate_sound_effect(currently_generating, elevenlabs_request)
			return
		else:
			push_error("[Luceta] Failed after " + str(MAX_RETRIES) + " retries: " + sound_name)
			progress_label.text = "❌ Failed: " + sound_name
			is_generating = false
			await get_tree().create_timer(1.0).timeout
			_generate_next_audio()
			return
	
	# Validate response body before saving
	if body.size() < 100:
		push_error("[Luceta] Response too small, likely corrupted: " + sound_name + " (" + str(body.size()) + " bytes)")
		retry_count += 1
		if retry_count < MAX_RETRIES:
			progress_label.text = "⚠️ Corrupted response, retrying " + sound_name + " (" + str(retry_count) + "/" + str(MAX_RETRIES) + ")"
			await get_tree().create_timer(2.0).timeout
			audio_generator.generate_sound_effect(currently_generating, elevenlabs_request)
			return
		else:
			progress_label.text = "❌ Failed (corrupted): " + sound_name
			is_generating = false
			await get_tree().create_timer(1.0).timeout
			_generate_next_audio()
			return
	
	# Check for valid MP3 header (ID3 tag or MP3 frame sync)
	if not _is_valid_mp3(body):
		push_error("[Luceta] Invalid MP3 data for: " + sound_name)
		retry_count += 1
		if retry_count < MAX_RETRIES:
			progress_label.text = "⚠️ Invalid audio, retrying " + sound_name + " (" + str(retry_count) + "/" + str(MAX_RETRIES) + ")"
			await get_tree().create_timer(2.0).timeout
			audio_generator.generate_sound_effect(currently_generating, elevenlabs_request)
			return
		else:
			progress_label.text = "❌ Failed (invalid audio): " + sound_name
			is_generating = false
			await get_tree().create_timer(1.0).timeout
			_generate_next_audio()
			return
	
	var file_path = audio_generator.handle_response(sound_name, response_code, body, "sfx")
	
	if not file_path.is_empty():
		# Verify the file was written correctly
		if _verify_saved_file(file_path, body.size()):
			generated_files.append(file_path)
			audio_cache.save_audio_metadata(sound_name, file_path, currently_generating.get("description", ""))
			progress_label.text = "✅ Saved: " + sound_name
		else:
			push_error("[Luceta] File verification failed: " + file_path)
			progress_label.text = "⚠️ Save verification failed: " + sound_name
	
	# Wait longer between requests to ensure file is fully written and API rate limits are respected
	progress_label.text = "⏳ Waiting before next sound..."
	await get_tree().create_timer(1.5).timeout
	is_generating = false
	_generate_next_audio()

func _is_valid_mp3(data: PackedByteArray) -> bool:
	"""Check if the data starts with a valid MP3 header (ID3 tag or MP3 frame sync)"""
	if data.size() < 3:
		return false
	
	# Check for ID3 tag (ID3v2)
	if data[0] == 0x49 and data[1] == 0x44 and data[2] == 0x33:  # "ID3"
		return true
	
	# Check for MP3 frame sync (0xFF followed by 0xE0-0xFF)
	if data[0] == 0xFF and (data[1] & 0xE0) == 0xE0:
		return true
	
	return false

func _verify_saved_file(file_path: String, expected_size: int) -> bool:
	"""Verify the saved file exists and has the expected size"""
	var global_path = ProjectSettings.globalize_path(file_path)
	if not FileAccess.file_exists(file_path):
		return false
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		return false
	
	var actual_size = file.get_length()
	file.close()
	
	# Allow some tolerance (within 10 bytes) for any filesystem differences
	return abs(actual_size - expected_size) < 10

func _on_audio_generated(sound_name: String, file_path: String):
	pass

func _on_generation_progress(current: int, total: int, sound_name: String):
	progress_label.text = "Generating: " + sound_name

func _on_generation_complete(all_files: Array):
	progress_label.text = "✅ Generated " + str(all_files.size()) + " sounds!"
	generate_button.disabled = false
	if progress_bar:
		progress_bar.visible = false
	if integrate_button:
		integrate_button.disabled = false
	_show_review_panel()

func _on_generation_error(sound_name: String, error_message: String):
	push_error("[Luceta] " + sound_name + ": " + error_message)
	is_generating = false
	await get_tree().create_timer(1.0).timeout
	_generate_next_audio()


func _on_integrate_pressed():
	if sound_suggestions.is_empty():
		progress_label.text = "❌ No sounds to integrate"
		return
	
	progress_label.text = "🔗 Integrating sounds..."
	if integrate_button:
		integrate_button.disabled = true
	
	var sound_mappings = []
	for suggestion in sound_suggestions:
		var sound_name = suggestion.get("name", "")
		var audio_path = audio_cache.get_audio_path(sound_name)
		
		# Also check directly in the generated folder
		if audio_path.is_empty() or not ResourceLoader.exists(audio_path):
			audio_path = "res://luceta_generated/" + sound_name + ".mp3"
		
		if ResourceLoader.exists(audio_path):
			sound_mappings.append({
				"name": sound_name,
				"path": audio_path,
				"context": suggestion.get("context", "")
			})
			# Update cache
			audio_cache.save_audio_metadata(sound_name, audio_path, suggestion.get("description", ""))
	
	if sound_mappings.is_empty():
		progress_label.text = "❌ No generated sounds found to integrate"
		if integrate_button:
			integrate_button.disabled = false
		return
	
	# Backup files before modifying
	var script_files = _find_script_files("res://")
	for file_path in script_files:
		backup_manager.backup_file(file_path)
	
	# Perform integration
	var report = sound_integrator.integrate_sounds(sound_mappings, "res://")
	
	if report.sounds_integrated.size() > 0:
		progress_label.text = "✅ Integrated " + str(report.sounds_integrated.size()) + " sounds!"
		EditorInterface.get_resource_filesystem().scan()
		_update_revert_button()
		_show_integration_dialog(report)
	elif report.skipped.size() > 0:
		progress_label.text = "⚠️ Could not find integration points"
		_show_manual_help(sound_mappings)
	else:
		progress_label.text = "⚠️ Integration had errors"
		for err in report.errors:
			push_error("[Luceta] " + str(err))
	
	if integrate_button:
		integrate_button.disabled = false

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

func _show_integration_dialog(report: Dictionary):
	var dialog = AcceptDialog.new()
	dialog.title = "🎉 Integration Complete!"
	var msg = "Integrated sounds:\n"
	for s in report.sounds_integrated:
		msg += "  • " + s + "\n"
	msg += "\nModified files:\n"
	for f in report.files_modified:
		msg += "  • " + f.get_file() + "\n"
	msg += "\nUse 'Revert All' to undo changes."
	dialog.dialog_text = msg
	dialog.confirmed.connect(func(): dialog.queue_free())
	add_child(dialog)
	dialog.popup_centered()

func _show_manual_help(mappings: Array):
	var dialog = AcceptDialog.new()
	dialog.title = "Manual Integration"
	var msg = "Add this code to your scripts:\n\n"
	for m in mappings:
		msg += "var " + m.name + "_sfx = load(\"" + m.path + "\")\n"
	msg += "\nThen call: _play_sfx(sound_sfx)"
	dialog.dialog_text = msg
	dialog.confirmed.connect(func(): dialog.queue_free())
	add_child(dialog)
	dialog.popup_centered()
