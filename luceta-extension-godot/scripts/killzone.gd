extends Area2D

# Luceta Audio
var slime_death_sfx: AudioStream

@onready var timer = $Timer

# Luceta Audio
var player_death_sfx: AudioStream

func _ready():
	if ResourceLoader.exists("res://luceta_generated/slime_death.mp3"):
		slime_death_sfx = load("res://luceta_generated/slime_death.mp3")
	# Safely load sounds - won't break if file missing
	var death_path = "res://luceta_generated/player_death.mp3"
	if ResourceLoader.exists(death_path):
		player_death_sfx = load(death_path)

func _on_body_entered(body):
	_play_sfx(slime_death_sfx)
	_play_sfx(player_death_sfx)
	print("You died!")
	Engine.time_scale = 0.5
	body.get_node("CollisionShape2D").queue_free()
	timer.start()

func _on_timer_timeout():
	Engine.time_scale = 1.0
	get_tree().reload_current_scene()

# === Luceta Audio Helper ===
func _play_sfx(sound: AudioStream):
	if sound == null:
		return
	var player = AudioStreamPlayer.new()
	add_child(player)
	player.stream = sound
	player.play()
	player.finished.connect(func(): player.queue_free())
