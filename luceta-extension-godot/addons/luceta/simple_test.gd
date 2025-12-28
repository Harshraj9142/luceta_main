@tool
extends EditorScript

# Simple test to check if classes load

func _run():
	print("Testing Agent SFX classes...")
	
	# Test if we can create instances
	var cache = AudioCache.new()
	print("✓ AudioCache created successfully")
	
	var analyzer = CodeAnalyzer.new()
	print("✓ CodeAnalyzer created successfully")
	
	var llm = LLMAnalyzer.new()
	print("✓ LLMAnalyzer created successfully")
	
	var generator = ElevenLabsGenerator.new()
	print("✓ ElevenLabsGenerator created successfully")
	
	var wiring = AutoWiring.new()
	print("✓ AutoWiring created successfully")
	
	print("🎉 All classes loaded successfully! The addon is working.")