@tool
extends EditorPlugin

const DOCK_SCENE = preload("res://addons/agent-sfx/dock.tscn")
var dock: Control

func _enter_tree():
	# Register project settings
	_add_project_settings()
	
	# Add the dock to the editor
	dock = DOCK_SCENE.instantiate()
	add_control_to_dock(DOCK_SLOT_LEFT_UL, dock)
	
	# Initialize the dock
	if dock.has_method("_initialize"):
		dock._initialize(self)

func _exit_tree():
	# Remove the dock from the editor
	if dock:
		remove_control_from_docks(dock)
		dock.queue_free()

func _add_project_settings():
	# Register Groq API key setting
	if not ProjectSettings.has_setting("agent_sfx/groq_api_key"):
		ProjectSettings.set_setting("agent_sfx/groq_api_key", "")
		ProjectSettings.set_initial_value("agent_sfx/groq_api_key", "")
		ProjectSettings.add_property_info({
			"name": "agent_sfx/groq_api_key",
			"type": TYPE_STRING,
			"hint": PROPERTY_HINT_PASSWORD,
			"hint_string": "Groq AI API key for LLM analysis"
		})
	
	# Keep old FAL key for backward compatibility (but mark as deprecated)
	if not ProjectSettings.has_setting("agent_sfx/fal_api_key"):
		ProjectSettings.set_setting("agent_sfx/fal_api_key", "")
		ProjectSettings.set_initial_value("agent_sfx/fal_api_key", "")
	
	# Register ElevenLabs API key setting
	if not ProjectSettings.has_setting("agent_sfx/elevenlabs_api_key"):
		ProjectSettings.set_setting("agent_sfx/elevenlabs_api_key", "")
		ProjectSettings.set_initial_value("agent_sfx/elevenlabs_api_key", "")
		ProjectSettings.add_property_info({
			"name": "agent_sfx/elevenlabs_api_key",
			"type": TYPE_STRING,
			"hint": PROPERTY_HINT_PASSWORD,
			"hint_string": "ElevenLabs API key for audio generation"
		})
	
	ProjectSettings.save()

