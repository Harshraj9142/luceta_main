@tool
extends RefCounted
class_name LLMAnalyzer

# Handles LLM API calls to analyze code and generate sound effect suggestions
# Uses Groq AI instead of FAL.ai

signal analysis_complete(suggestions: Array)
signal error_occurred(message: String)

var api_key: String = ""
var api_url: String = "https://api.groq.com/openai/v1/chat/completions"
var model: String = "qwen/qwen3-32b"  # Default Groq model

func get_api_key() -> String:
	return api_key

func set_api_key(key: String):
	api_key = key

func set_model(model_name: String):
	model = model_name

func get_model() -> String:
	return model

func get_api_url() -> String:
	return api_url

func analyze_code_for_sounds(code_context: Dictionary) -> void:
	# Build prompt from code analysis results
	var prompt = _build_analysis_prompt(code_context)
	
	# Make API call
	var headers = [
		"Authorization: Key " + api_key,
		"Content-Type: application/json"
	]
	
	var request_data = {
		"prompt": prompt,
		"model": "gpt-4o"  # or whatever model you prefer
	}
	
	var json = JSON.stringify(request_data)
	
	# Use HTTPRequest to make the call
	# Note: This will need to be called from a Node that has HTTPRequest
	# We'll handle this in the dock script
	_emit_request_data(headers, json)

func _build_analysis_prompt(code_context: Dictionary) -> String:
	var prompt = """You are analyzing a Godot game project to suggest sound effects.

Based on the code analysis, here are the detected game events and actions:

EVENTS:
"""
	
	for event in code_context.get("events", []):
		prompt += "- " + event.name + " (" + event.sound_hint + "): " + event.context + "\n"
	
	prompt += "\nACTIONS:\n"
	for action in code_context.get("actions", []):
		prompt += "- " + action.name + " (" + action.sound_hint + ")\n"
	
	prompt += "\nINTERACTIONS:\n"
	for interaction in code_context.get("interactions", []):
		prompt += "- " + interaction.type + " (" + interaction.sound_hint + ")\n"
	
	prompt += """
DIALOGS:
"""
	for dialog in code_context.get("dialogs", []):
		prompt += "- " + dialog.name + ": " + dialog.text + "\n"
	
	prompt += """
Based on this analysis, provide a JSON object with a key "fx" containing an array of sound effect suggestions.
Each suggestion should have:
- "name": unique identifier (e.g., "player_footstep", "coin_collect")
- "description": detailed description of how the sound should sound
- "why": explanation of why this sound is needed
- "context": the game event/action this sound is for

Respond with ONLY valid JSON, no markdown formatting. Example format:
{"fx": [{"name": "player_footstep", "description": "soft grass footstep sound, 0.2s duration", "why": "player walks on grass", "context": "_p_walking function"}]}
"""
	
	return prompt

func _emit_request_data(headers: Array, json: String):
	# This will be handled by the dock which has HTTPRequest node
	# For now, we'll emit a signal that the dock can listen to
	pass

