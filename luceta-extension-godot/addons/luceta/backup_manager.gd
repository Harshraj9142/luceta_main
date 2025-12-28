@tool
extends RefCounted
class_name BackupManager

# Manages backups of modified files for safe revert functionality

const BACKUP_DIR = "res://agent_sfx_generated/.backups/"
const BACKUP_MANIFEST = "res://agent_sfx_generated/.backups/manifest.json"

var backups: Dictionary = {}  # file_path -> backup_path

func _init():
	_ensure_backup_dir()
	_load_manifest()

func _ensure_backup_dir():
	var dir = DirAccess.open("res://")
	if dir:
		if not dir.dir_exists("agent_sfx_generated/.backups"):
			dir.make_dir_recursive("agent_sfx_generated/.backups")

func _load_manifest():
	if FileAccess.file_exists(BACKUP_MANIFEST):
		var file = FileAccess.open(BACKUP_MANIFEST, FileAccess.READ)
		if file:
			var json = JSON.parse_string(file.get_as_text())
			if json and json is Dictionary:
				backups = json
			file.close()

func _save_manifest():
	var file = FileAccess.open(BACKUP_MANIFEST, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(backups, "\t"))
		file.close()

func backup_file(file_path: String, force: bool = false) -> bool:
	"""Create a backup of a file before modifying it. Set force=true to update existing backup."""
	if not FileAccess.file_exists(file_path):
		return false
	
	# If already backed up and not forcing, skip
	# But we keep the ORIGINAL backup, not update it
	if backups.has(file_path) and not force:
		return true
	
	# Read original content
	var file = FileAccess.open(file_path, FileAccess.READ)
	if not file:
		return false
	var content = file.get_as_text()
	file.close()
	
	# Create backup filename
	var timestamp = str(Time.get_unix_time_from_system())
	var backup_name = file_path.get_file().get_basename() + "_" + timestamp + "." + file_path.get_extension()
	var backup_path = BACKUP_DIR + backup_name
	
	# Write backup
	var backup_file = FileAccess.open(backup_path, FileAccess.WRITE)
	if not backup_file:
		return false
	backup_file.store_string(content)
	backup_file.close()
	
	# Record in manifest
	backups[file_path] = {
		"backup_path": backup_path,
		"timestamp": timestamp,
		"original_content_hash": content.hash()
	}
	_save_manifest()
	
	print("[BackupManager] Backed up: ", file_path, " -> ", backup_path)
	return true

func restore_file(file_path: String) -> bool:
	"""Restore a file from its backup"""
	if not backups.has(file_path):
		return false
	
	var backup_info = backups[file_path]
	var backup_path = backup_info.backup_path
	
	if not FileAccess.file_exists(backup_path):
		return false
	
	# Read backup
	var backup_file = FileAccess.open(backup_path, FileAccess.READ)
	if not backup_file:
		return false
	var content = backup_file.get_as_text()
	backup_file.close()
	
	# Write to original location
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	if not file:
		return false
	file.store_string(content)
	file.close()
	
	# Remove from manifest
	backups.erase(file_path)
	_save_manifest()
	
	return true

func restore_all() -> Dictionary:
	"""Restore all backed up files and clean up everything"""
	var report = {
		"restored": [],
		"failed": [],
		"sounds_deleted": []
	}
	
	print("[BackupManager] Starting restore_all...")
	print("[BackupManager] Files to restore: ", backups.keys())
	
	# Restore all script files
	var files_to_restore = backups.keys().duplicate()
	for file_path in files_to_restore:
		print("[BackupManager] Restoring: ", file_path)
		if restore_file(file_path):
			report.restored.append(file_path)
		else:
			report.failed.append(file_path)
	
	# Delete ALL generated sound files (mp3 and import files)
	var gen_dir = DirAccess.open("res://agent_sfx_generated/")
	if gen_dir:
		gen_dir.list_dir_begin()
		var file_name = gen_dir.get_next()
		while file_name != "":
			if not gen_dir.current_is_dir():
				# Delete mp3 files
				if file_name.ends_with(".mp3"):
					if gen_dir.remove(file_name) == OK:
						report.sounds_deleted.append(file_name)
						print("[BackupManager] Deleted sound: ", file_name)
				# Delete import files
				elif file_name.ends_with(".import"):
					gen_dir.remove(file_name)
			file_name = gen_dir.get_next()
		gen_dir.list_dir_end()
	
	# Clear the audio metadata cache
	var cache_path = "res://.godot/agent_sfx_cache/audio_metadata.json"
	if FileAccess.file_exists(cache_path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(cache_path))
		print("[BackupManager] Cleared audio cache")
	
	# Clear analysis cache too
	var analysis_cache_path = "res://.godot/agent_sfx_cache/analysis_cache.json"
	if FileAccess.file_exists(analysis_cache_path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(analysis_cache_path))
		print("[BackupManager] Cleared analysis cache")
	
	# Clean up old backup files that are no longer in manifest
	_cleanup_orphan_backups()
	
	print("[BackupManager] Restore complete. Restored: ", report.restored.size(), ", Deleted sounds: ", report.sounds_deleted.size())
	
	return report

func _cleanup_orphan_backups():
	"""Remove backup files that are no longer in the manifest"""
	var dir = DirAccess.open(BACKUP_DIR)
	if not dir:
		return
	
	dir.list_dir_begin()
	var file_name = dir.get_next()
	while file_name != "":
		if not dir.current_is_dir() and file_name != "manifest.json":
			# Check if this backup is still referenced
			var is_referenced = false
			for file_path in backups.keys():
				var backup_info = backups[file_path]
				if backup_info.backup_path.ends_with(file_name):
					is_referenced = true
					break
			
			if not is_referenced:
				dir.remove(file_name)
				print("[BackupManager] Removed orphan backup: ", file_name)
		file_name = dir.get_next()
	dir.list_dir_end()

func has_backups() -> bool:
	"""Check if there are any backups available"""
	return not backups.is_empty()

func get_backed_up_files() -> Array:
	"""Get list of files that have backups"""
	return backups.keys()

func clear_backups():
	"""Clear all backups (use after successful integration)"""
	var dir = DirAccess.open(BACKUP_DIR)
	if dir:
		dir.list_dir_begin()
		var file_name = dir.get_next()
		while file_name != "":
			if not dir.current_is_dir() and file_name != "manifest.json":
				dir.remove(file_name)
			file_name = dir.get_next()
		dir.list_dir_end()
	
	backups.clear()
	_save_manifest()
