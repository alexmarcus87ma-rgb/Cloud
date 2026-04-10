# Project Config

## Stack
Next.js 16, TypeScript, Tailwind CSS, SQLite, Bun, BetterAuth

## Commands
- `bun dev` — start server
- `bun install` — install packages

## Project
Retro cyberpunk arcade app with auth and 2 games.
- Auth: BetterAuth, email + password only
- DB: SQLite (better-sqlite3)
- 2 account types: Tetris | Pacman
- User picks game at register — locked permanently
- After login → redirect directly to user's game
- Global leaderboard across both games

## Pages
- `/` landing page
- `/login` login
- `/register` register + game selection
- `/dashboard` redirects to game
- `/leaderboard` global scores

## Design
- Cyberpunk '89 style
- Colors: black, neon green (#00FF41), magenta (#FF00FF), cyan (#00FFFF)
- Font: "Press Start 2P" (Google Fonts)
- Effects: glow, scanlines overlay, glitch text animations
- No plain white backgrounds ever

## Rules
- TypeScript always
- Tailwind for styling only, no separate CSS files
- Components in /app/components
- Always use Plan Mode before any changes
- Never modify DB schema without asking first

## Documentation
When library setup or API reference is needed:
- Spawn parallel sub-agent with Sonnet 4.6
- Sub-agent uses Context7 MCP for docs
- Return only relevant snippets to main context