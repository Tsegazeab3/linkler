# Linkler Project Mandates

This file contains foundational mandates for Gemini sessions in this repository. 

## Long-Term Memory (MemPalace)
This project uses **MemPalace** to maintain a persistent, navigable memory of every conversation and decision across sessions.

### Session Bootstrap (Mandatory)
Every time a new Gemini session begins, the agent MUST perform the following steps before any other task:
1. **Activate Environment**: `source venv/bin/activate`
2. **Refresh Context**: Run `mempalace search "current project state and recent decisions" --limit 5` to recall the most recent context.
3. **Mine History**: Run `mempalace mine mempalace_history --mode convos --wing linkler_history` to ingest any new session logs.

### Session Persistence
- **Log Activity**: Throughout the session, the agent SHOULD maintain a log of key decisions and progress in `mempalace_history/session_YYYY-MM-DD.md`.
- **Finalize Memory**: Before concluding a session, the agent MUST run `mempalace mine mempalace_history --mode convos` to ensure the current session is permanently filed in the Palace.

## Project Structure & Architecture
(Refer to `GEMINI_CHANGES_SUMMARY.md` for architectural details)
