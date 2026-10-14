# Freddy Life

A browser-based 2D life simulation inspired by Fredericton, New Brunswick.

Explore an apartment and downtown, manage hunger and energy, and earn money working at Freddy Café.

**Status:** Playable prototype in development.
**Developer:** Mahi Sharma — Software Engineering student at UNB.

## Play Online

[Play Freddy Life](https://fantastic-horse-a95ccc.netlify.app)

Desktop keyboard controls: arrow keys to move, E to interact, S to save.

## Features

- Apartment and downtown locations
- Frame-rate-independent movement with normalized diagonal speed
- Rectangle-based obstacle collision detection
- Proximity-based interactions
- Money, hunger, and energy systems
- Meals, resting, and timed café shifts
- Player stats preserved between locations
- Manual saving and loading of stats, location, and position
- Saved-data validation and safe spawn fallback

## Technology

- **JavaScript:** Gameplay logic and state management
- **Phaser:** Rendering, scenes, keyboard input, and game loop
- **Vite:** Development server and production builds
- **localStorage and JSON:** Browser-based save/load
- **Git and GitHub:** Version control and source hosting

## Run Locally

Install Node.js and npm, then run:

```bash
git clone https://github.com/maaahisharma/freddy-life.git
cd freddy-life
npm install
npm run dev-nolog
```

Open the Local URL printed in the terminal, usually http://localhost:8080.

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is blocked.

| Command | Purpose |
| --- | --- |
| `git clone ...` | Downloads the repository |
| `cd freddy-life` | Opens the project directory |
| `npm install` | Installs dependencies |
| `npm run dev-nolog` | Starts development without the template's anonymous usage reporting |
| `npm run build-nolog` | Creates a production build in `dist` |

## Controls

| Key | Action |
| --- | --- |
| Arrow keys | Move |
| E | Interact nearby |
| S | Save progress |

Click inside the game if keyboard controls do not respond.

## Gameplay

1. Leave the apartment through the bottom door.
2. Approach Freddy Café and press E to start a shift.
3. Complete the 10-second shift to earn $25.
4. Return home to eat or rest.
5. Press S to save before closing or refreshing.

Meals cost $10 and restore up to 30 hunger points.
Resting restores energy to 100.
Starting work requires sufficient hunger and energy.

## How It Works

Movement uses elapsed frame time and a normalized direction vector.
Horizontal and vertical movement are checked separately against obstacles,
allowing the player to slide along their edges.

Interactions are stored as objects containing a position, prompt, and
action or destination. Phaser's registry retains player stats when the
scene restarts to change locations.

Saving serializes player data into JSON and stores it in localStorage.
Loading validates stats, location, and coordinates before restoring progress.

## Project Structure

| File | Purpose |
| --- | --- |
| `src/main.js` | Application entry point |
| `src/game/main.js` | Phaser game configuration |
| `src/game/scenes/Game.js` | Locations, movement, interactions, needs, jobs, and saving |
| `public/assets/` | Static game assets |
| `public/style.css` | Page styling |
| `vite/` | Development and production configuration |

## Testing

Manually tested:

- Player movement and obstacle collisions
- Apartment and downtown transitions
- Eating, resting, and café shifts
- Stats preserved when changing locations
- Stats, location, and position restored after saving and refreshing

Automated tests have not been added yet.

## Current Limitations

- Prototype visuals and two locations
- Manual saving; no autosave
- Saves belong to the current browser and website origin
- No accounts, backend, database, or multiplayer
- A café shift must finish before saving

## Planned Improvements

- Character sprites and improved environments
- More locations, jobs, and activities
- Automated tests for game rules and save validation
- Backend accounts and database-backed saves

## Development and Credits

Built from the Phaser Vite template:
https://github.com/phaserjs/template-vite

I am developing this project with AI-assisted guidance for code suggestions,
debugging, and explanations. I integrate changes and manually test gameplay
while learning how the implementation works.

See `LICENSE` for the repository's license.
