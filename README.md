# @kimuson/agents-mcp

MCP server that provides unified interface for multiple AI agents (claude-code, codex, gemini-cli, etc.).

## Features

- Unified interface for multiple AI coding agents
- Session management for continued conversations
- Dynamic agent configuration via JSON
- Support for:
  - Claude Code (`claude-code`)
  - Codex (`codex`)
  - Gemini CLI (`gemini-cli`)
  - Copilot CLI (`copilot-cli`) - coming soon

## Usage

### 1. Initialize a configuration file

Generate a default configuration file:

```bash
npx -y @kimuson/agents-mcp@latest init
```

This creates an `agents-mcp.config.json` file with default agent configurations. You can customize the output path:

```bash
npx -y @kimuson/agents-mcp@latest init -o my-config.json
```

Or create your own configuration file manually:

```json
{
  "agents": [
    {
      "name": "coding",
      "description": "For implementing programs",
      "agents": [
        {
          "type": "claude-code"
        }
      ]
    },
    {
      "name": "review",
      "description": "For code review",
      "prompt": "You are an experienced code reviewer. Review the code provided by the user and suggest improvements.",
      "agents": [
        {
          "type": "codex"
        }
      ]
    }
  ]
}
```

Each agent configuration has:

- `name`: Agent name (used in tool calls)
- `description`: What this agent is used for
- `prompt`: (Optional) System prompt for this agent. If provided, it will be prepended to user input
- `agents`: Array of agent configurations (priority order)
  - `type`: CLI type (`claude-code`, `codex`, `gemini-cli`, `copilot-cli`)
  - `model`: (Optional) Model name to use

When `prompt` is provided, the final prompt sent to the agent will be:

```
<agent prompt>

## User Input

<user input>
```

### 2. Configure your MCP client

Add the server to your MCP client configuration (e.g., Claude Desktop, Cline):

```json
{
  "mcpServers": {
    "agents-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@kimuson/agents-mcp@latest",
        "serve",
        "/absolute/path/to/agents-mcp.config.json"
      ]
    }
  }
}
```

**Note:** Use absolute paths for the config file.

### 3. Use the agent-task tool

The server exposes an `agent-task` tool that can be called with:

- `agent`: The agent name (e.g., "coding", "review", "qa")
- `prompt`: The instruction for the agent
- `sessionId` (optional): Session ID to continue a previous conversation

Example response includes the session ID and agent's response.

## CLI Commands

### `serve`

Start the MCP server:

```bash
npx -y @kimuson/agents-mcp@latest serve agents-mcp.config.json
```

Arguments:

- `<config>`: (Required) Path to the configuration file

### `init`

Initialize a new configuration file:

```bash
npx -y @kimuson/agents-mcp@latest init
```

Options:

- `-o, --output <path>`: Output file path (default: `agents-mcp.config.json`)

## Configuration

### Agent Types

- `claude-code`: Claude Code CLI
- `codex`: Codex CLI
- `gemini-cli`: Gemini CLI
- `copilot-cli`: GitHub Copilot CLI (session management not yet supported)

### Agent Priority

If you provide multiple configurations for the same agent name (as an array), the first one will be used. Future versions may support automatic fallback.

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Lint
pnpm lint

# Fix lint issues
pnpm fix

# Build
pnpm build
```

## Requirements

You need to have the corresponding CLI tools installed:

- Claude Code: `claude` command
- Codex: `codex` command
- Gemini CLI: `gemini` command
- Copilot CLI: `copilot` command

## License

MIT
