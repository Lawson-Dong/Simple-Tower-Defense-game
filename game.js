class TowerDefenseGame {
    constructor() {
        this.gameBoard = document.getElementById('gameBoard');
        this.waveCount = document.getElementById('waveCount');
        this.enemyCount = document.getElementById('enemyCount');
        this.health = document.getElementById('health');
        this.gold = document.getElementById('gold');
        this.startWaveBtn = document.getElementById('startWave');
        
        this.gameBoard.width = 800;
        this.gameBoard.height = 600;
        
        this.selectedTowerType = null;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.wave = 1;
        this.enemiesAlive = 0;
        this.enemiesSpawned = 0;
        this.waveInProgress = false;
        this.gameOver = false;
        
        // 关卡路径
        this.levels = [
            {
                name: "关卡 1",
                path: [
                    { x: 50, y: 100 },
                    { x: 300, y: 100 },
                    { x: 300, y: 200 },
                    { x: 150, y: 200 },
                    { x: 150, y: 350 },
                    { x: 400, y: 350 },
                    { x: 400, y: 150 },
                    { x: 650, y: 150 },
                    { x: 650, y: 400 },
                    { x: 350, y: 400 },
                    { x: 350, y: 500 },
                    { x: 700, y: 500 }
                ],
                startHealth: 10,
                startGold: 100,
                enemySpeed: 0.8
            },
            {
                name: "关卡 2",
                path: [
                    { x: 50, y: 50 },
                    { x: 50, y: 200 },
                    { x: 250, y: 200 },
                    { x: 250, y: 100 },
                    { x: 450, y: 100 },
                    { x: 450, y: 300 },
                    { x: 150, y: 300 },
                    { x: 150, y: 450 },
                    { x: 550, y: 450 },
                    { x: 550, y: 250 },
                    { x: 700, y: 250 }
                ],
                startHealth: 8,
                startGold: 120,
                enemySpeed: 0.9
            }
        ];
        
        this.currentLevel = 0;
        this.path = this.levels[this.currentLevel].path;
        this.maxHealth = this.levels[this.currentLevel].startHealth;
        this.currentHealth = this.levels[this.currentLevel].startHealth;
        this.currentGold = this.levels[this.currentLevel].startGold;
        
        this.towerTypes = {
            basic: {
                cost: 50,
                damage: 20,
                range: 100,
                fireRate: 1000
            },
            fast: {
                cost: 100,
                damage: 15,
                range: 80,
                fireRate: 500
            },
            strong: {
                cost: 150,
                damage: 40,
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
        
        this.init();
    }
    
    init() {
        this.setupStartEndPoints();
        this.drawPath();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupStartEndPoints() {
        const startPoint = document.querySelector('.start-point');
        const endPoint = document.querySelector('.end-point');
        
        if (startPoint && endPoint) {
            const start = this.path[0];
            const end = this.path[this.path.length - 1];
            
            startPoint.style.left = start.x + 'px';
            startPoint.style.top = start.y + 'px';
            
            endPoint.style.left = end.x + 'px';
            endPoint.style.top = end.y + 'px';
        }
    }
    
    drawPath() {
        for (let i = 0; i < this.path.length - 1; i++) {
            const start = this.path[i];
            const end = this.path[i + 1];
            const pathElement = document.createElement('div');
            pathElement.className = 'path';
            
            if (start.x === end.x) {
                // Vertical path
                pathElement.style.width = '20px';
                pathElement.style.height = Math.abs(end.y - start.y) + 'px';
                pathElement.style.left = (start.x - 10) + 'px';
                pathElement.style.top = Math.min(start.y, end.y) + 'px';
            } else {
                // Horizontal path
                pathElement.style.width = Math.abs(end.x - start.x) + 'px';
                pathElement.style.height = '20px';
                pathElement.style.left = Math.min(start.x, end.x) + 'px';
                pathElement.style.top = (start.y - 10) + 'px';
            }
            
            this.gameBoard.appendChild(pathElement);
        }
    }
    
    setupEventListeners() {
        // Tower selection
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedTowerType = btn.dataset.type;
            });
        });
        
        // Tower placement
        this.gameBoard.addEventListener('click', (e) => {
            if (this.selectedTowerType && !this.gameOver) {
                const rect = this.gameBoard.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (this.canPlaceTower(x, y)) {
                    const towerCost = this.towerTypes[this.selectedTowerType].cost;
                    if (this.currentGold >= towerCost) {
                        this.placeTower(x, y, this.selectedTowerType);
                        this.currentGold -= towerCost;
                        this.updateGameInfo();
                    }
                }
            }
        });
        
        // Start wave
        this.startWaveBtn.addEventListener('click', () => {
            if (!this.waveInProgress && !this.gameOver) {
                this.startWave();
            }
        });
        
        // Level selection
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const levelIndex = parseInt(btn.dataset.level);
                this.changeLevel(levelIndex);
            });
        });
    }
    
    changeLevel(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.levels.length) {
            // Clear existing game elements
            this.clearGameElements();
            
            // Reset game state
            this.currentLevel = levelIndex;
            this.path = this.levels[this.currentLevel].path;
            this.wave = 1;
            this.maxHealth = this.levels[this.currentLevel].startHealth;
            this.currentHealth = this.levels[this.currentLevel].startHealth;
            this.currentGold = this.levels[this.currentLevel].startGold;
            this.enemiesAlive = 0;
            this.enemiesSpawned = 0;
            this.waveInProgress = false;
            this.gameOver = false;
            this.towers = [];
            this.enemies = [];
            this.projectiles = [];
            
            // Update UI
            this.waveCount.textContent = this.wave;
            this.updateGameInfo();
            
            // Setup new level
            this.setupStartEndPoints();
            this.drawPath();
        }
    }
    
    clearGameElements() {
        // Clear towers
        document.querySelectorAll('.tower').forEach(tower => tower.remove());
        
        // Clear enemies
        document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
        
        // Clear projectiles
        document.querySelectorAll('.projectile').forEach(projectile => projectile.remove());
        
        // Clear path
        document.querySelectorAll('.path').forEach(path => path.remove());
        
        // Clear game over/win screens
        document.querySelectorAll('.game-over, .game-win').forEach(screen => screen.remove());
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
    
    placeTower(x, y, type) {
        const tower = {
            id: Date.now(),
            x: x,
            y: y,
            type: type,
            damage: this.towerTypes[type].damage,
            range: this.towerTypes[type].range,
            fireRate: this.towerTypes[type].fireRate,
            lastFired: 0,
            element: null
        };
        
        const towerElement = document.createElement('div');
        towerElement.className = 'tower';
        towerElement.style.left = (x - 20) + 'px';
        towerElement.style.top = (y - 20) + 'px';
        towerElement.textContent = type.charAt(0).toUpperCase();
        
        this.gameBoard.appendChild(towerElement);
        tower.element = towerElement;
        this.towers.push(tower);
    }
    
    startWave() {
        this.waveInProgress = true;
        this.enemiesSpawned = 0;
        this.enemiesAlive = 0;
        this.spawnEnemy();
    }
    
    spawnEnemy() {
        if (this.enemiesSpawned < this.wave * 3) {
            const enemyType = this.getEnemyType();
            const enemy = {
                id: Date.now(),
                x: this.path[0].x,
                y: this.path[0].y,
                pathIndex: 0,
                health: this.enemyTypes[enemyType].health,
                maxHealth: this.enemyTypes[enemyType].health,
                speed: this.enemyTypes[enemyType].speed * this.levels[this.currentLevel].enemySpeed,
                gold: this.enemyTypes[enemyType].gold,
                type: enemyType,
                element: null
            };
            
            const enemyElement = document.createElement('div');
            enemyElement.className = 'enemy';
            enemyElement.style.left = (enemy.x - 15) + 'px';
            enemyElement.style.top = (enemy.y - 15) + 'px';
            enemyElement.textContent = enemy.health;
            
            this.gameBoard.appendChild(enemyElement);
            enemy.element = enemyElement;
            this.enemies.push(enemy);
            this.enemiesSpawned++;
            this.enemiesAlive++;
            
            setTimeout(() => this.spawnEnemy(), 2000);
        }
    }
    
    getEnemyType() {
        const rand = Math.random();
        if (rand < 0.6) return 'basic';
        if (rand < 0.9) return 'fast';
        return 'strong';
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.pathIndex < this.path.length - 1) {
                const target = this.path[enemy.pathIndex + 1];
                const dx = target.x - enemy.x;
                const dy = target.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < enemy.speed) {
                    enemy.x = target.x;
                    enemy.y = target.y;
                    enemy.pathIndex++;
                    
                    // Check if enemy reached the end
                    if (enemy.pathIndex === this.path.length - 1) {
                        // Enemy reached end
                        this.currentHealth--;
                        this.enemiesAlive--;
                        this.gameBoard.removeChild(enemy.element);
                        this.enemies.splice(i, 1);
                        
                        // Update UI
                        this.updateGameInfo();
                        
                        if (this.currentHealth <= 0) {
                            this.gameOver = true;
                            this.showGameOver();
                        }
                        return;
                    }
                } else {
                    enemy.x += (dx / distance) * enemy.speed;
                    enemy.y += (dy / distance) * enemy.speed;
                }
                
                enemy.element.style.left = (enemy.x - 15) + 'px';
                enemy.element.style.top = (enemy.y - 15) + 'px';
            } else {
                // Enemy reached end
                this.currentHealth--;
                this.enemiesAlive--;
                this.gameBoard.removeChild(enemy.element);
                this.enemies.splice(i, 1);
                
                // Update UI
                this.updateGameInfo();
                
                if (this.currentHealth <= 0) {
                    this.gameOver = true;
                    this.showGameOver();
                }
            }
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
            target: target,
            damage: tower.damage,
            speed: 5,
            element: null
        };
        
        const projectileElement = document.createElement('div');
        projectileElement.className = 'projectile';
        projectileElement.style.left = (projectile.x - 4) + 'px';
        projectileElement.style.top = (projectile.y - 4) + 'px';
        
        this.gameBoard.appendChild(projectileElement);
        projectile.element = projectileElement;
        this.projectiles.push(projectile);
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            const target = projectile.target;
            
            if (!target || !this.enemies.includes(target)) {
                this.gameBoard.removeChild(projectile.element);
                this.projectiles.splice(i, 1);
                continue;
            }
            
            const dx = target.x - projectile.x;
            const dy = target.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < projectile.speed) {
                // Hit enemy
                target.health -= projectile.damage;
                target.element.textContent = target.health;
                
                if (target.health <= 0) {
                    this.currentGold += target.gold;
                    this.enemiesAlive--;
                    this.gameBoard.removeChild(target.element);
                    const enemyIndex = this.enemies.findIndex(e => e.id === target.id);
                    if (enemyIndex !== -1) {
                        this.enemies.splice(enemyIndex, 1);
                    }
                }
                
                this.gameBoard.removeChild(projectile.element);
                this.projectiles.splice(i, 1);
            } else {
                projectile.x += (dx / distance) * projectile.speed;
                projectile.y += (dy / distance) * projectile.speed;
                projectile.element.style.left = (projectile.x - 4) + 'px';
                projectile.element.style.top = (projectile.y - 4) + 'px';
            }
        }
    }
    
    checkWaveComplete() {
        if (this.waveInProgress && this.enemiesAlive === 0 && this.enemiesSpawned >= this.wave * 3) {
            this.waveInProgress = false;
            this.wave++;
            this.waveCount.textContent = this.wave;
            
            if (this.wave > 10) {
                this.showGameWin();
            }
        }
    }
    
    updateGameInfo() {
        this.enemyCount.textContent = this.enemiesAlive;
        this.health.textContent = this.currentHealth;
        this.gold.textContent = this.currentGold;
    }
    
    showGameOver() {
        const gameOverElement = document.createElement('div');
        gameOverElement.className = 'game-over';
        gameOverElement.innerHTML = `
            <h2>Game Over!</h2>
            <p>You made it to wave ${this.wave}</p>
            <button class="btn" onclick="location.reload()">Play Again</button>
        `;
        this.gameBoard.appendChild(gameOverElement);
    }
    
    showGameWin() {
        const gameWinElement = document.createElement('div');
        gameWinElement.className = 'game-win';
        gameWinElement.innerHTML = `
            <h2>You Win!</h2>
            <p>You completed all waves!</p>
            <button class="btn" onclick="location.reload()">Play Again</button>
        `;
        this.gameBoard.appendChild(gameWinElement);
        this.gameOver = true;
    }
    
    gameLoop() {
        if (!this.gameOver) {
            this.updateEnemies();
            this.updateTowers();
            this.updateProjectiles();
            this.checkWaveComplete();
            this.updateGameInfo();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TowerDefenseGame();
});