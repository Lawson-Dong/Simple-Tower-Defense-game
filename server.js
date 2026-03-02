const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Game state
let games = {};

// Game class
class Game {
    constructor(gameId) {
        this.id = gameId;
        this.players = [];
        this.wave = 1;
        this.maxHealth = 10;
        this.currentHealth = 10;
        this.currentGold = 100;
        this.enemiesAlive = 0;
        this.enemiesSpawned = 0;
        this.waveInProgress = false;
        this.gameOver = false;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        
        this.path = [
            { x: 50, y: 50 },
            { x: 200, y: 50 },
            { x: 200, y: 200 },
            { x: 600, y: 200 },
            { x: 600, y: 400 },
            { x: 200, y: 400 },
            { x: 200, y: 550 },
            { x: 750, y: 550 }
        ];
        
        this.towerTypes = {
            basic: {
                cost: 50,
                damage: 10,
                range: 100,
                fireRate: 1000
            },
            fast: {
                cost: 100,
                damage: 5,
                range: 80,
                fireRate: 500
            },
            strong: {
                cost: 150,
                damage: 20,
                range: 120,
                fireRate: 1500
            }
        };
        
        this.enemyTypes = {
            basic: {
                health: 50,
                speed: 1,
                gold: 10
            },
            fast: {
                health: 30,
                speed: 2,
                gold: 15
            },
            strong: {
                health: 100,
                speed: 0.5,
                gold: 25
            }
        };
        
        this.gameLoopInterval = setInterval(() => this.gameLoop(), 16); // ~60 FPS
    }
    
    addPlayer(socket) {
        this.players.push(socket.id);
        socket.emit('gameState', {
            wave: this.wave,
            health: this.currentHealth,
            gold: this.currentGold,
            towers: this.towers,
            enemies: this.enemies
        });
    }
    
    removePlayer(socketId) {
        this.players = this.players.filter(id => id !== socketId);
        if (this.players.length === 0) {
            clearInterval(this.gameLoopInterval);
            delete games[this.id];
        }
    }
    
    placeTower(data, socket) {
        const { x, y, type } = data;
        const towerCost = this.towerTypes[type].cost;
        
        if (this.currentGold >= towerCost && this.canPlaceTower(x, y)) {
            const tower = {
                id: Date.now(),
                x: x,
                y: y,
                type: type,
                damage: this.towerTypes[type].damage,
                range: this.towerTypes[type].range,
                fireRate: this.towerTypes[type].fireRate,
                lastFired: 0
            };
            
            this.towers.push(tower);
            this.currentGold -= towerCost;
            
            this.broadcast('towerPlaced', tower);
            this.broadcast('gameStateUpdate', {
                gold: this.currentGold
            });
        }
    }
    
    canPlaceTower(x, y) {
        // Check if tower is on path
        for (let i = 0; i < this.path.length - 1; i++) {
            const start = this.path[i];
            const end = this.path[i + 1];
            
            if (start.x === end.x) {
                // Vertical path
                if (x >= start.x - 20 && x <= start.x + 20 && 
                    y >= Math.min(start.y, end.y) - 20 && y <= Math.max(start.y, end.y) + 20) {
                    return false;
                }
            } else {
                // Horizontal path
                if (y >= start.y - 20 && y <= start.y + 20 && 
                    x >= Math.min(start.x, end.x) - 20 && x <= Math.max(start.x, end.x) + 20) {
                    return false;
                }
            }
        }
        
        // Check if tower is too close to other towers
        for (const tower of this.towers) {
            const distance = Math.sqrt(Math.pow(x - tower.x, 2) + Math.pow(y - tower.y, 2));
            if (distance < 40) {
                return false;
            }
        }
        
        return true;
    }
    
    startWave() {
        if (!this.waveInProgress && !this.gameOver) {
            this.waveInProgress = true;
            this.enemiesSpawned = 0;
            this.enemiesAlive = 0;
            this.spawnEnemy();
            this.broadcast('waveStarted', { wave: this.wave });
        }
    }
    
    spawnEnemy() {
        if (this.enemiesSpawned < this.wave * 5) {
            const enemyType = this.getEnemyType();
            const enemy = {
                id: Date.now(),
                x: this.path[0].x,
                y: this.path[0].y,
                pathIndex: 0,
                health: this.enemyTypes[enemyType].health,
                maxHealth: this.enemyTypes[enemyType].health,
                speed: this.enemyTypes[enemyType].speed,
                gold: this.enemyTypes[enemyType].gold,
                type: enemyType
            };
            
            this.enemies.push(enemy);
            this.enemiesSpawned++;
            this.enemiesAlive++;
            
            this.broadcast('enemySpawned', enemy);
            
            setTimeout(() => this.spawnEnemy(), 1000);
        }
    }
    
    getEnemyType() {
        const rand = Math.random();
        if (rand < 0.6) return 'basic';
        if (rand < 0.9) return 'fast';
        return 'strong';
    }
    
    updateEnemies() {
        const updatedEnemies = [];
        const removedEnemies = [];
        
        for (const enemy of this.enemies) {
            if (enemy.pathIndex < this.path.length - 1) {
                const target = this.path[enemy.pathIndex + 1];
                const dx = target.x - enemy.x;
                const dy = target.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < enemy.speed) {
                    enemy.x = target.x;
                    enemy.y = target.y;
                    enemy.pathIndex++;
                } else {
                    enemy.x += (dx / distance) * enemy.speed;
                    enemy.y += (dy / distance) * enemy.speed;
                }
                
                updatedEnemies.push(enemy);
            } else {
                // Enemy reached end
                this.currentHealth--;
                this.enemiesAlive--;
                removedEnemies.push(enemy.id);
                
                if (this.currentHealth <= 0) {
                    this.gameOver = true;
                    this.broadcast('gameOver', { wave: this.wave });
                }
            }
        }
        
        this.enemies = updatedEnemies;
        
        if (updatedEnemies.length > 0) {
            this.broadcast('enemiesUpdated', updatedEnemies);
        }
        
        if (removedEnemies.length > 0) {
            this.broadcast('enemiesRemoved', removedEnemies);
        }
        
        if (this.currentHealth !== this.maxHealth) {
            this.broadcast('gameStateUpdate', { health: this.currentHealth });
            this.maxHealth = this.currentHealth;
        }
    }
    
    updateTowers() {
        const now = Date.now();
        
        for (const tower of this.towers) {
            if (now - tower.lastFired >= tower.fireRate) {
                const target = this.findTarget(tower);
                if (target) {
                    this.fireProjectile(tower, target);
                    tower.lastFired = now;
                }
            }
        }
    }
    
    findTarget(tower) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        for (const enemy of this.enemies) {
            const distance = Math.sqrt(Math.pow(tower.x - enemy.x, 2) + Math.pow(tower.y - enemy.y, 2));
            if (distance <= tower.range && distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        }
        
        return closestEnemy;
    }
    
    fireProjectile(tower, target) {
        const projectile = {
            id: Date.now(),
            x: tower.x,
            y: tower.y,
            targetId: target.id,
            damage: tower.damage,
            speed: 5
        };
        
        this.projectiles.push(projectile);
        this.broadcast('projectileFired', projectile);
    }
    
    updateProjectiles() {
        const updatedProjectiles = [];
        const removedProjectiles = [];
        const damagedEnemies = [];
        
        for (const projectile of this.projectiles) {
            const target = this.enemies.find(e => e.id === projectile.targetId);
            
            if (!target) {
                removedProjectiles.push(projectile.id);
                continue;
            }
            
            const dx = target.x - projectile.x;
            const dy = target.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < projectile.speed) {
                // Hit enemy
                target.health -= projectile.damage;
                damagedEnemies.push({ id: target.id, health: target.health });
                
                if (target.health <= 0) {
                    this.currentGold += target.gold;
                    this.enemiesAlive--;
                    const enemyIndex = this.enemies.findIndex(e => e.id === target.id);
                    if (enemyIndex !== -1) {
                        this.enemies.splice(enemyIndex, 1);
                    }
                }
                
                removedProjectiles.push(projectile.id);
            } else {
                projectile.x += (dx / distance) * projectile.speed;
                projectile.y += (dy / distance) * projectile.speed;
                updatedProjectiles.push(projectile);
            }
        }
        
        this.projectiles = updatedProjectiles;
        
        if (updatedProjectiles.length > 0) {
            this.broadcast('projectilesUpdated', updatedProjectiles);
        }
        
        if (removedProjectiles.length > 0) {
            this.broadcast('projectilesRemoved', removedProjectiles);
        }
        
        if (damagedEnemies.length > 0) {
            this.broadcast('enemiesDamaged', damagedEnemies);
        }
        
        if (this.currentGold !== this.lastGold) {
            this.broadcast('gameStateUpdate', { gold: this.currentGold });
            this.lastGold = this.currentGold;
        }
    }
    
    checkWaveComplete() {
        if (this.waveInProgress && this.enemiesAlive === 0 && this.enemiesSpawned >= this.wave * 5) {
            this.waveInProgress = false;
            this.wave++;
            this.broadcast('waveCompleted', { wave: this.wave });
            
            if (this.wave > 10) {
                this.gameOver = true;
                this.broadcast('gameWin', { wave: this.wave });
            }
        }
    }
    
    gameLoop() {
        if (!this.gameOver) {
            this.updateEnemies();
            this.updateTowers();
            this.updateProjectiles();
            this.checkWaveComplete();
        }
    }
    
    broadcast(event, data) {
        this.players.forEach(playerId => {
            io.to(playerId).emit(event, data);
        });
    }
}

// Socket.io events
io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);
    
    // Create or join game
    let gameId = 'default';
    if (!games[gameId]) {
        games[gameId] = new Game(gameId);
    }
    
    const game = games[gameId];
    game.addPlayer(socket);
    
    // Events
    socket.on('placeTower', (data) => {
        game.placeTower(data, socket);
    });
    
    socket.on('startWave', () => {
        game.startWave();
    });
    
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        game.removePlayer(socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Game available at http://localhost:${PORT}`);
});