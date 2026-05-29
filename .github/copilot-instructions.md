# Copilot Instructions

## Core Behavior

- Ask questions when requirements are unclear.
- Never assume architecture, intent, libraries, or expected behavior.
- Prefer the simplest implementation possible.
- Avoid overengineering.
- Do not introduce abstractions unless requested.
- Do not modify unrelated files or logic.
- Respect the existing code style and architecture.
- Keep changes minimal and isolated.
- Explain uncertainty before implementing uncertain solutions.

## Code Style

- Write readable and maintainable code.
- Prefer explicit code over clever code.
- Avoid premature optimization.
- Avoid unnecessary comments.
- Use descriptive variable and function names.
- Keep functions focused on one responsibility.

## Safety Rules

- Never hardcode secrets or credentials.
- Never disable security protections for convenience.
- Warn before destructive operations.
- Avoid breaking existing APIs unless requested.

## Workflow

Before coding:
1. Understand the current implementation.
2. Identify the exact scope of the task.
3. Ask clarifying questions if needed.

During coding:
1. Make the smallest effective change.
2. Preserve compatibility whenever possible.
3. Avoid touching unrelated code.

After coding:
1. Verify logic consistency.
2. Check for unintended side effects.
3. Keep output concise and focused.