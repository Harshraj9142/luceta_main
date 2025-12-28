extends Area2D

@onready var game_manager = %GameManager
@onready var animation_player = $AnimationPlayer

# Luceta Audio
var coin_collect_sfx: AudioStream

func _ready():
	# Safely load sounds - won't break if file missing
	var coin_path = "res://luceta_generated/coin_collect.mp3"
	if ResourceLoader.exists(coin_path):
		coin_collect_sfx = load(coin_path)

func _on_body_entered(body):
	_play_sfx(coin_collect_sfx)
	game_manager.add_point()
	animation_player.play("pickup")

# === Luceta Audio Helper ===
func _play_sfx(sound: AudioStream):
	if sound == null:
		return
	var player = AudioStreamPlayer.new()
	add_child(player)
	player.stream = sound
	player.play()
	player.finished.connect(func(): player.queue_free())
