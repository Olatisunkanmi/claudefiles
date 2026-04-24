# Claude Code Files

Portable configuration for Claude Code — skills, commands, hooks, sounds, and settings deployed to `~/.claude/`. Think dotfiles, but for Claude.

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Olatisunkanmi/claudefiles.git ~/.claude
   cd ~/.claude
   ```

2. **Run the setup command:**
   ```bash
   /setup
   ```
   
   This deploys all configuration files to their proper locations and configures Claude Code.

## What Gets Installed

The setup process installs the following components:

### Skills (`~/.claude/skills/`)
Custom Claude Code skills that extend functionality. Each skill has a `SKILL.md` file with YAML frontmatter.

### Commands (`~/.claude/commands/`)
Global slash commands that work across all projects. Each command is a `.md` file with YAML frontmatter defining:
- `name` - The command name
- `allowed-tools` - Tools the command can use
- `description` - What the command does

### Hooks (`~/.claude/hooks/`)
Event-driven scripts that execute during Claude Code sessions:
- **SessionStart** - Runs when Claude Code starts
- **UserPromptSubmit** - Runs when you submit a prompt
- **Stop** - Runs when Claude Code stops
- **PostToolUse** - Runs after tool execution
- **PreToolUse** - Runs before tool execution

### Sounds (`~/.claude/sounds/`)
Audio feedback for various Claude Code events (`.wav` files).

### Plugins
Installed automatically via the Claude Code marketplace system. Configured in `claudefiles.yaml`.

## Architecture

- **`claudefiles.yaml`** - Main configuration file that defines install targets and settings
- **`/setup`** - Project-level command that reads the manifest and deploys everything
- **Platform detection** - Automatically configures platform-specific settings (macOS/Linux)

## Directory Structure

```
~/.claude/
├── skills/           # Custom Claude Code skills
├── commands/         # Global slash commands  
├── hooks/           # Event-driven scripts
├── sounds/          # Audio feedback files
├── CLAUDE.md        # Global Claude Code instructions
└── settings.json    # Claude Code settings (auto-merged)
```

## Requirements

- **Claude Code** - This configuration is built specifically for Claude Code
- **Git** - For cloning and version control
- **Platform**: macOS or Linux
  - macOS: Uses `afplay` for audio
  - Linux: Uses `aplay` for audio

## Usage

### Discovering Skills
```bash
find ~/.claude/skills -name "SKILL.md"
```

### Available Commands
After setup, you'll have access to global commands like:
- `/gcw` - Git commit workflow
- `/gitconfig` - Git configuration

### Sound Feedback
The system provides audio feedback for various events:
- Startup sounds when Claude Code starts
- Random response sounds when you submit prompts  
- Completion sounds when tasks finish

## Customization

### Adding New Skills
1. Create a directory in `skills/`
2. Add a `SKILL.md` file with YAML frontmatter:
   ```yaml
   ---
   name: "My Skill"
   description: "What this skill does"
   ---
   ```

### Adding New Commands
1. Create a `.md` file in `commands/`
2. Add YAML frontmatter:
   ```yaml
   ---
   name: "mycommand"
   allowed-tools: ["Read", "Write", "Bash"]
   description: "What this command does"
   ---
   ```

### Modifying Hooks
Edit the `hooks:` section in `claudefiles.yaml` to customize event-driven behavior.

## Marketplace Integration

This repository is registered as a Claude Code plugin marketplace (`Olatisunkanmi/claudefiles`). Plugins in `plugins/` are automatically discovered and installed.

## Development

- **`.resource/`** - Contains source materials (gitignored, not deployed)
- When adding content from `.resource/`, copy and adapt rather than symlink
- All configuration follows the conventions defined in `CLAUDE.md`

## Troubleshooting

### Setup Command Not Found
Make sure you're running `/setup` from within the cloned repository directory. It's a project-level command that only works in this repo.

### Audio Not Working
Check that your platform has the required audio player:
- **macOS**: `afplay` (built-in)
- **Linux**: `aplay` (install via package manager)

### Hooks Not Executing  
Verify hook scripts have execute permissions:
```bash
chmod +x ~/.claude/hooks/*
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your skills, commands, or configurations
4. Test with `/setup`
5. Submit a pull request

---

For more detailed information, see the main `CLAUDE.md` file and individual component documentation.
