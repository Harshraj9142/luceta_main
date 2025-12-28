extends CharacterBody2D

# Luceta Audio
var slime_hit_sfx: AudioStream

# Luceta Audio
var player_hurt_sfx: AudioStream

# Luceta Audio
var player_run_sfx: AudioStream

# Luceta Audio
var player_land_sfx: AudioStream


const SPEED = 130.0
const JUMP_VELOCITY = -300.0

var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")

@onready var animated_sprite = $AnimatedSprite2D

# Luceta Audio
var player_jump_sfx: AudioStream

func _ready():
	if ResourceLoader.exists("res://luceta_generated/slime_hit.mp3"):
		slime_hit_sfx = load("res://luceta_generated/slime_hit.mp3")
	_play_sfx(slime_hit_sfx)
	if ResourceLoader.exists("res://luceta_generated/player_hurt.mp3"):
		player_hurt_sfx = load("res://luceta_generated/player_hurt.mp3")
	_play_sfx(player_hurt_sfx)
	if ResourceLoader.exists("res://luceta_generated/player_run.mp3"):
		player_run_sfx = load("res://luceta_generated/player_run.mp3")
	if ResourceLoader.exists("res://luceta_generated/player_land.mp3"):
		player_land_sfx = load("res://luceta_generated/player_land.mp3")
	# Safely load sounds - won't break if file missing
	var jump_path = "res://luceta_generated/player_jump.mp3"
	if ResourceLoader.exists(jump_path):
		player_jump_sfx = load(jump_path)

func _physics_process(delta):
	if not is_on_floor():
		velocity.y += gravity * delta

	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = JUMP_VELOCITY
		_play_sfx(player_jump_sfx)

	var direction = Input.get_axis("move_left", "move_right")
	
	if direction > 0:
		animated_sprite.flip_h = false
	elif direction < 0:
		animated_sprite.flip_h = true
	
	if is_on_floor():
		_play_sfx(player_land_sfx)
		if direction == 0:
			animated_sprite.play("idle")
		else:
			animated_sprite.play("run")
	else:
		animated_sprite.play("jump")
	
	if direction:
		velocity.x = direction * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)
		_play_sfx(player_run_sfx)

	move_and_slide()

# === Luceta Audio Helper ===
func _play_sfx(sound: AudioStream):
	if sound == null:
		return
	var player = AudioStreamPlayer.new()
	add_child(player)
	player.stream = sound
	player.play()
	player.finished.connect(func(): player.queue_free())
