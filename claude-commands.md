# Claude Code Commands Cheatsheet

Quick reference for slash commands in an interactive Claude Code session.

---

## Session Management

| Command | Description |
|---------|-------------|
| `/clear` | Start a new conversation with empty context (previous session stays resumable) |
| `/resume [session]` | Open session picker or jump directly to a session by ID/name |
| `/compact [instructions]` | Summarize conversation history to free context; pass focus hint e.g. `/compact focus on auth refactor` |
| `/context` | Visualize current context usage as a grid with capacity warnings and optimization tips |
| `/rewind` | Rewind conversation and/or code changes to a previous point |
| `/branch [name]` | Fork the conversation at this point; original stays resumable |
| `/rename [name]` | Name the current session (auto-generates if omitted) |
| `/exit` | Exit the CLI |

---

## Output & Clipboard

| Command | Description |
|---------|-------------|
| `/copy [N]` | Copy last response to clipboard; `N` selects Nth-latest; interactive picker for code blocks |
| `/diff` | Open interactive diff viewer of uncommitted changes and per-turn diffs |
| `/export [filename]` | Export current conversation as plain text |
| `/recap` | Generate a one-line summary of the current session |
| `/focus` | Toggle focus view showing last prompt, tool-call summary, and final response (fullscreen only) |

---

## Model & Configuration

| Command | Description |
|---------|-------------|
| `/model [model]` | Select or change the AI model |
| `/effort [level]` | Set reasoning effort: `low`, `medium`, `high`, `xhigh`, `max`, or `auto` |
| `/fast [on\|off]` | Toggle fast mode |
| `/config` | Open settings UI (theme, model, output style, and other preferences) |
| `/theme` | Change color theme |
| `/color [color]` | Set prompt bar color for this session (red, blue, green, yellow, purple, orange, pink, cyan) |

---

## Code Review & Planning

| Command | Description |
|---------|-------------|
| `/review [PR]` | Review a pull request in the current session |
| `/ultrareview [PR]` | Deep multi-agent cloud code review; no-arg form reviews the current branch |
| `/security-review` | Analyze pending changes for security vulnerabilities |
| `/plan [description]` | Enter plan mode; optional description auto-starts a task |
| `/ultraplan <prompt>` | Draft a plan in the browser, then execute remotely or send to terminal |

---

## Development Workflows

| Command | Description |
|---------|-------------|
| `/simplify [focus]` | Review changed files for quality/reuse issues and fix them (runs 3 agents in parallel) |
| `/batch <instruction>` | Orchestrate large-scale changes across the codebase in parallel |
| `/loop [interval] [prompt]` | Run a prompt repeatedly on an interval; omit interval for self-paced execution |
| `/btw <question>` | Ask a quick side question without adding it to the main conversation |
| `/debug [description]` | Enable debug logging for the current session |

---

## Permissions & Tools

| Command | Description |
|---------|-------------|
| `/permissions` | Manage allow/ask/deny rules for tool permissions |
| `/fewer-permission-prompts` | Scan transcripts and add tool allowlist to settings to reduce permission prompts |
| `/mcp` | Manage MCP server connections and OAuth authentication |
| `/ide` | Manage and view status of IDE integrations |
| `/hooks` | View hook configurations for tool events |
| `/add-dir <path>` | Add a working directory for file access in this session |

---

## Memory & Project Context

| Command | Description |
|---------|-------------|
| `/memory` | Edit CLAUDE.md memory files, toggle auto-memory, and view auto-memory entries |
| `/init` | Initialize or update CLAUDE.md project guidance file |

---

## Agents & Tasks

| Command | Description |
|---------|-------------|
| `/tasks` | List and manage background tasks |
| `/agents` | Manage agent configurations |
| `/schedule [description]` | Create, list, or run routines on a cron schedule |
| `/autofix-pr [prompt]` | Spawn a web session to watch a PR and push fixes on CI failure or review comments |

---

## Account & Usage

| Command | Description |
|---------|-------------|
| `/usage` | Show session cost, plan usage limits, and activity stats |
| `/login` | Sign in to Anthropic account |
| `/logout` | Sign out of Anthropic account |
| `/upgrade` | Open upgrade page to switch to a higher plan tier |
| `/extra-usage` | Configure extra usage to keep working when rate limits are hit |
| `/privacy-settings` | View and update privacy settings (Pro/Max only) |

---

## Help & Diagnostics

| Command | Description |
|---------|-------------|
| `/help` | Show help and available commands |
| `/status` | Show version, model, account, and connectivity info |
| `/doctor` | Diagnose installation and settings; press `f` to auto-fix issues |
| `/release-notes` | View changelog with an interactive version picker |
| `/insights` | Analyze sessions for usage patterns and friction points |
| `/powerup` | Discover Claude Code features through quick interactive lessons |
| `/heapdump` | Write a heap snapshot to Desktop for diagnosing high memory usage |

---

## Remote & Integrations

| Command | Description |
|---------|-------------|
| `/desktop` | Continue the current session in the Claude Code Desktop app |
| `/remote-control` | Make this session available for remote control from claude.ai |
| `/teleport` | Pull a claude.ai web session into this terminal (requires claude.ai subscription) |
| `/web-setup` | Connect GitHub account to Claude Code on the web using local `gh` CLI credentials |
| `/install-github-app` | Set up Claude GitHub Actions for the repository |
| `/install-slack-app` | Install the Claude Slack app |
| `/setup-bedrock` | Configure Amazon Bedrock auth, region, and model |
| `/setup-vertex` | Configure Google Vertex AI auth, project, and region |

---

## Setup & Customization

| Command | Description |
|---------|-------------|
| `/terminal-setup` | Configure terminal keybindings (Shift+Enter and other shortcuts) |
| `/keybindings` | Open or create keybindings configuration file |
| `/statusline` | Configure shell status line integration |
| `/voice [hold\|tap\|off]` | Toggle voice dictation mode |
| `/tui [default\|fullscreen]` | Set terminal UI renderer; `fullscreen` enables flicker-free alt-screen |

---

## Plugins & Skills

| Command | Description |
|---------|-------------|
| `/skills` | List available skills; press `t` to sort by token count |
| `/plugin` | Manage Claude Code plugins |
| `/reload-plugins` | Reload active plugins to apply pending changes |

---

> MCP servers can expose custom prompts as commands using the format `/mcp__<server>__<prompt>`.
