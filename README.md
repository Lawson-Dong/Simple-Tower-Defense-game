# Tower Defense Game

A tower defense game built with HTML, CSS, and JavaScript, featuring two different difficulty levels, multiple tower types, and enemy types.

## Game Features

- **Two Levels**: Different path layouts and difficulty settings
- **Three Tower Types**: Basic, Fast, and Strong towers
- **Three Enemy Types**: Basic, Fast, and Strong enemies
- **10 Waves of Enemies**: Enemy count increases with each wave
- **Gold System**: Earn gold by defeating enemies to purchase towers
- **Health System**: Enemies reaching the end reduce health points
- **Win/Lose Conditions**: Win by completing 10 waves, lose when health reaches 0

## How to Run

### Method 1: Direct Run
1. Download the project files to your local machine
2. Open `index.html` in your browser

### Method 2: Using Node.js Server (Optional)
1. Ensure Node.js is installed
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Visit `http://localhost:3000` in your browser

## How to Play

1. **Select Level**: Click the level buttons at the top to choose the level you want to play
2. **Select Tower Type**: Click the tower type buttons on the right to select the tower you want to build
3. **Place Tower**: Click on the game area to place the tower (note: cannot be placed on the path)
4. **Start Wave**: Click the "Start Wave" button to begin a wave of enemies
5. **Upgrade Strategy**: Earn gold by defeating enemies and use it to purchase more towers
6. **Protect Base**: Prevent enemies from reaching the end to protect your base
7. **Complete Level**: Win by completing all 10 waves

## Tower Types

| Tower Type | Cost | Damage | Range | Attack Speed |
|------------|------|--------|-------|-------------|
| Basic      | 50 Gold | 20 | 100 | 1000ms |
| Fast       | 100 Gold | 15 | 80 | 500ms |
| Strong     | 150 Gold | 40 | 120 | 1500ms |

## Enemy Types

| Enemy Type | Health | Speed | Gold Reward |
|------------|--------|-------|-------------|
| Basic      | 50 | 1 | 10 Gold |
| Fast       | 30 | 2 | 15 Gold |
| Strong     | 100 | 0.5 | 25 Gold |

## Game Rules

- **Initial Health**: 10 for Level 1, 8 for Level 2
- **Initial Gold**: 100 for Level 1, 120 for Level 2
- **Enemies per Wave**: Wave number × 3
- **Enemy Speed**: 0.8x for Level 1, 0.9x for Level 2
- **Enemy Reaches End**: Reduces health by 1
- **Health = 0**: Game Over
- **Complete 10 Waves**: Game Win

## Level Information

### Level 1
- **Path**: 12 points with multiple turns and twists
- **Initial Health**: 10
- **Initial Gold**: 100
- **Enemy Speed**: 0.8x (slower)
- **Difficulty**: Moderate, suitable for beginners

### Level 2
- **Path**: 11 points with different layout and direction
- **Initial Health**: 8 (more challenging)
- **Initial Gold**: 120 (more strategy options)
- **Enemy Speed**: 0.9x (faster)
- **Difficulty**: Higher, suitable for experienced players

## Technical Implementation

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend** (Optional): Node.js, Express, Socket.io
- **Code Size**: Approximately 1100 lines

## Project Structure
