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
        this.draggedTowerType = null;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.tracks = [];
        this.rangeIndicator = null;
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
                enemySpeed: 0.8,
                totalWaves: 3,
                enemiesPerWave: 5
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
                enemySpeed: 0.9,
                totalWaves: 5,
                enemiesPerWave: 8
            },
            {
                name: "关卡 3",
                path: [
                    { x: 50, y: 100 },
                    { x: 200, y: 100 },
                    { x: 200, y: 250 },
                    { x: 100, y: 250 },
                    { x: 100, y: 400 },
                    { x: 300, y: 400 },
                    { x: 300, y: 150 },
                    { x: 500, y: 150 },
                    { x: 500, y: 350 },
                    { x: 400, y: 350 },
                    { x: 400, y: 500 },
                    { x: 600, y: 500 },
                    { x: 600, y: 200 },
                    { x: 700, y: 200 }
                ],
                startHealth: 6,
                startGold: 150,
                enemySpeed: 1.0,
                totalWaves: 10,
                enemiesPerWave: 10
            },
            {
                name: "关卡 4",
                path: [
                    { x: 50, y: 100 },
                    { x: 200, y: 100 },
                    { x: 200, y: 250 },
                    { x: 100, y: 250 },
                    { x: 100, y: 400 },
                    { x: 300, y: 400 },
                    { x: 300, y: 150 },
                    { x: 500, y: 150 },
                    { x: 500, y: 350 },
                    { x: 400, y: 350 },
                    { x: 400, y: 500 },
                    { x: 600, y: 500 },
                    { x: 600, y: 200 },
                    { x: 700, y: 200 }
                ],
                startHealth: 4,
                startGold: 180,
                enemySpeed: 1.0,
                totalWaves: 10,
                enemiesPerWave: 10
            }
        ];
        
        this.currentLevel = 0;
        this.path = this.levels[this.currentLevel].path;
        this.maxHealth = this.levels[this.currentLevel].startHealth;
        this.currentHealth = this.levels[this.currentLevel].startHealth;
        this.currentGold = this.levels[this.currentLevel].startGold;
        
        this.towerTypes = {
            machinegun: {
                name: "Machine Gun",
                cost: 80,
                damage: 12,
                range: 100,
                fireRate: 200,
                areaDamage: false,
                areaRadius: 0
            },
            cannon: {
                name: "Cannon",
                cost: 150,
                damage: 60,
                range: 120,
                fireRate: 1500,
                areaDamage: true,
                areaRadius: 40
            },
            slowgun: {
                name: "Slow Gun",
                cost: 100,
                damage: 5,
                range: 110,
                fireRate: 300,
                areaDamage: false,
                areaRadius: 0,
                slowFactor: 0.5,
                slowDuration: 2000
            },
            walkercannon: {
                name: "Walker Cannon",
                cost: 200,
                damage: 40,
                range: 150,
                fireRate: 1000,
                areaDamage: true,
                areaRadius: 30,
                isWalker: true,
                energy: 0,
                energyCapacity: 100,
                energyPerKill: 10
            },
            therapy: {
                name: "Therapy Tower",
                cost: 120,
                healAmount: 15,
                range: 120,
                healRate: 2000
            }
        };
        
        this.enemyTypes = {
            basic: {
                health: 80,
                speed: 1,
                gold: 12
            },
            fast: {
                health: 50,
                speed: 2,
                gold: 18
            },
            strong: {
                health: 150,
                speed: 0.5,
                gold: 30
            },
            attacker: {
                health: 120,
                speed: 0.6,
                gold: 25,
                canAttack: true,
                attackRange: 150,
                attackDamage: 8,
                attackCooldown: 2500
            },
            converter: {
                health: 100,
                speed: 0.5,
                gold: 35,
                canAttack: true,
                attackRange: 120,
                attackDamage: 4,
                attackCooldown: 3500,
                canConvert: true
            }
        };
        
        this.init();
    }
    
    init() {
        // Initialize game board
        this.gameBoard = document.getElementById('gameBoard');
        this.waveCount = document.getElementById('waveCount');
        this.enemyCount = document.getElementById('enemyCount');
        this.health = document.getElementById('health');
        this.gold = document.getElementById('gold');
        this.energy = document.getElementById('energy');
        
        this.setupStartEndPoints();
        this.drawPath();
        this.setupEventListeners();
        
        this.gameLoop();
    }
    

    
    showLoadingMessage() {
        // Get loading message element
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            // Set message content
            loadingMessage.textContent = 'Loading the next round';
            loadingMessage.style.display = 'block';
            loadingMessage.style.color = 'orange';
            loadingMessage.style.fontSize = '16px';
            loadingMessage.style.marginTop = '10px';
            loadingMessage.style.textAlign = 'center';
            
            // Hide message after 3 seconds
            setTimeout(() => {
                if (loadingMessage) {
                    loadingMessage.textContent = '';
                    loadingMessage.style.display = 'none';
                }
            }, 3000);
        }
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
        document.querySelectorAll('.tower-btn, .track-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tower-btn, .track-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedTowerType = btn.dataset.type;
            });
            
            // Drag start event
            btn.addEventListener('dragstart', (e) => {
                this.draggedTowerType = btn.dataset.type;
                e.dataTransfer.setData('text/plain', btn.dataset.type);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
        
        // Tower placement
        this.gameBoard.addEventListener('click', (e) => {
            if (this.selectedTowerType && !this.gameOver) {
                const rect = this.gameBoard.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (this.canPlaceTower(x, y, this.selectedTowerType)) {
                    let cost = 0;
                    if (this.selectedTowerType === 'track') {
                        cost = this.trackPiece.cost;
                    } else {
                        cost = this.towerTypes[this.selectedTowerType].cost;
                    }
                    
                    if (this.currentGold >= cost) {
                        this.placeTower(x, y, this.selectedTowerType);
                        this.currentGold -= cost;
                        this.updateGameInfo();
                    }
                }
            }
        });
        
        // Drag over event
        this.gameBoard.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // Show range indicator
            const rect = this.gameBoard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.updateRangeIndicator(x, y, this.draggedTowerType);
        });
        
        // Drag end event
        this.gameBoard.addEventListener('dragend', (e) => {
            this.removeRangeIndicator();
            this.draggedTowerType = null;
        });
        
        // Drop event
        this.gameBoard.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            
            const rect = this.gameBoard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.canPlaceTower(x, y, type)) {
                let cost = 0;
                if (type === 'track') {
                    cost = this.trackPiece.cost;
                } else {
                    cost = this.towerTypes[type].cost;
                }
                
                if (this.currentGold >= cost) {
                    this.placeTower(x, y, type);
                    this.currentGold -= cost;
                    this.updateGameInfo();
                }
            }
            
            this.removeRangeIndicator();
            this.draggedTowerType = null;
        });
        
        // Start button
        this.startButton = document.getElementById('startButton');
        this.startButton.addEventListener('click', () => {
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
            this.tracks = [];
            
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
        
        // Clear tracks
        document.querySelectorAll('.track').forEach(track => track.remove());
        
        // Clear enemies
        document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
        
        // Clear projectiles
        document.querySelectorAll('.projectile').forEach(projectile => projectile.remove());
        
        // Clear path
        document.querySelectorAll('.path').forEach(path => path.remove());
        
        // Clear game over/win screens
        document.querySelectorAll('.game-over, .game-win').forEach(screen => screen.remove());
    }
    
    canPlaceTower(x, y, type) {
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
        // Place tower
        const tower = {
            id: Date.now(),
            x: x,
            y: y,
            type: type,
            name: this.towerTypes[type].name,
            cost: this.towerTypes[type].cost,
            damage: this.towerTypes[type].damage || 0,
            range: this.towerTypes[type].range,
            fireRate: this.towerTypes[type].fireRate || 1000,
            areaDamage: this.towerTypes[type].areaDamage || false,
            areaRadius: this.towerTypes[type].areaRadius || 0,
            slowFactor: this.towerTypes[type].slowFactor || 1,
            slowDuration: this.towerTypes[type].slowDuration || 0,
            isWalker: this.towerTypes[type].isWalker || false,
            energy: this.towerTypes[type].energy || 0,
            energyCapacity: this.towerTypes[type].energyCapacity || 100,
            energyPerKill: this.towerTypes[type].energyPerKill || 10,
            healAmount: this.towerTypes[type].healAmount || 0,
            healRate: this.towerTypes[type].healRate || 2000,
            health: 100,
            maxHealth: 100,
            lastFired: 0,
            element: null
        };
        
        const towerElement = document.createElement('div');
        towerElement.className = 'tower';
        towerElement.style.left = (x - 20) + 'px';
        towerElement.style.top = (y - 20) + 'px';
        
        // Set tower color based on type
        if (type === 'machinegun') {
            towerElement.style.backgroundColor = '#00bfff';
            towerElement.style.boxShadow = '0 0 15px rgba(0, 191, 255, 0.7)';
        } else if (type === 'cannon') {
            towerElement.style.backgroundColor = '#ff69b4';
            towerElement.style.boxShadow = '0 0 15px rgba(255, 105, 180, 0.7)';
        } else if (type === 'slowgun') {
            towerElement.style.backgroundColor = '#9370db';
            towerElement.style.boxShadow = '0 0 15px rgba(147, 112, 219, 0.7)';
        } else if (type === 'walkercannon') {
            towerElement.style.backgroundColor = '#ffd700';
            towerElement.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.7)';
            
            // Add click event for walker cannon selection
            towerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectWalker(tower);
            });
        } else if (type === 'therapy') {
            towerElement.style.backgroundColor = '#32cd32';
            towerElement.style.boxShadow = '0 0 15px rgba(50, 205, 50, 0.7)';
        }
        
        towerElement.textContent = tower.name.charAt(0);
        
        // Add health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        healthBar.style.width = '100%';
        healthBar.style.height = '5px';
        healthBar.style.backgroundColor = 'green';
        healthBar.style.position = 'absolute';
        healthBar.style.top = '-5px';
        healthBar.style.left = '0';
        healthBar.style.zIndex = '10';
        towerElement.appendChild(healthBar);
        tower.healthBar = healthBar;
        
        // Add right-click event for tower removal
        towerElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.removeTower(tower);
        });
        
        this.gameBoard.appendChild(towerElement);
        tower.element = towerElement;
        this.towers.push(tower);
    }
    
    selectWalker(walker) {
        // Deselect all other walkers
        this.towers.forEach(tower => {
            if (tower.isWalker && tower.element) {
                tower.element.classList.remove('selected');
            }
        });
        
        // Select current walker
        if (walker.element) {
            walker.element.classList.add('selected');
            
            // Add right-click event to game board for walker movement
            const moveWalker = (e) => {
                e.preventDefault();
                const rect = this.gameBoard.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                this.moveWalker(walker, x, y);
            };
            
            this.gameBoard.addEventListener('contextmenu', moveWalker);
            
            // Remove event listener after a short time
            setTimeout(() => {
                this.gameBoard.removeEventListener('contextmenu', moveWalker);
            }, 5000);
        }
    }
    
    moveWalker(walker, x, y) {
        // Check if walker has enough energy
        if (walker.energy < 20) {
            // Show energy insufficient message
            const message = document.createElement('div');
            message.style.position = 'absolute';
            message.style.left = walker.x + 'px';
            message.style.top = walker.y + 'px';
            message.style.color = 'red';
            message.style.fontWeight = 'bold';
            message.style.zIndex = '100';
            message.textContent = 'Not enough energy!';
            this.gameBoard.appendChild(message);
            
            // Remove message after animation
            setTimeout(() => {
                if (message.parentNode) {
                    this.gameBoard.removeChild(message);
                }
            }, 1000);
            return;
        }
        
        // Check if target position is within movement range
        const distance = Math.sqrt(Math.pow(x - walker.x, 2) + Math.pow(y - walker.y, 2));
        const maxMovementRange = 200; // Maximum movement distance in pixels
        
        if (distance > maxMovementRange) {
            // Show range exceeded message
            const message = document.createElement('div');
            message.style.position = 'absolute';
            message.style.left = walker.x + 'px';
            message.style.top = walker.y + 'px';
            message.style.color = 'red';
            message.style.fontWeight = 'bold';
            message.style.zIndex = '100';
            message.textContent = 'Out of movement range!';
            this.gameBoard.appendChild(message);
            
            // Remove message after animation
            setTimeout(() => {
                if (message.parentNode) {
                    this.gameBoard.removeChild(message);
                }
            }, 1000);
            return;
        }
        
        // Check if target position is valid
        if (this.canPlaceTower(x, y, walker.type)) {
            // Consume energy
            walker.energy -= 20;
            
            // Update walker position
            walker.x = x;
            walker.y = y;
            
            if (walker.element) {
                walker.element.style.left = (x - 20) + 'px';
                walker.element.style.top = (y - 20) + 'px';
            }
            
            // Deselect walker after movement
            if (walker.element) {
                walker.element.classList.remove('selected');
            }
        }
    }
    
    addEnergy(tower, amount) {
        if (tower.isWalker) {
            tower.energy = Math.min(tower.energy + amount, tower.energyCapacity);
        }
    }
    
    updateRangeIndicator(x, y, type) {
        // Remove existing indicator
        this.removeRangeIndicator();
        
        if (!type || this.gameOver) {
            return;
        }
        
        // Create range indicator
        this.rangeIndicator = document.createElement('div');
        this.rangeIndicator.className = 'range-indicator';
        this.rangeIndicator.style.left = (x - 20) + 'px';
        this.rangeIndicator.style.top = (y - 20) + 'px';
        
        // Set range based on tower type
        let range = 0;
        if (type === 'track') {
            range = 20; // Track size
        } else {
            range = this.towerTypes[type].range;
        }
        
        this.rangeIndicator.style.width = (range * 2) + 'px';
        this.rangeIndicator.style.height = (range * 2) + 'px';
        this.rangeIndicator.style.left = (x - range) + 'px';
        this.rangeIndicator.style.top = (y - range) + 'px';
        
        // Check if placement is valid
        if (this.canPlaceTower(x, y, type)) {
            this.rangeIndicator.style.borderColor = 'rgba(0, 255, 0, 0.5)';
        } else {
            this.rangeIndicator.style.borderColor = 'rgba(255, 0, 0, 0.5)';
        }
        
        this.gameBoard.appendChild(this.rangeIndicator);
    }
    
    removeRangeIndicator() {
        if (this.rangeIndicator && this.rangeIndicator.parentNode) {
            this.gameBoard.removeChild(this.rangeIndicator);
            this.rangeIndicator = null;
        }
    }
    
    removeTower(tower) {
        // Calculate refund (half of tower cost)
        const refund = Math.floor(tower.cost / 2);
        this.currentGold += refund;
        
        // Remove tower element from DOM
        if (tower.element && tower.element.parentNode) {
            this.gameBoard.removeChild(tower.element);
        }
        
        // Remove tower from towers array
        const index = this.towers.findIndex(t => t.id === tower.id);
        if (index !== -1) {
            this.towers.splice(index, 1);
        }
        
        // Update UI
        this.updateGameInfo();
        
        // Show refund message (optional)
        const message = document.createElement('div');
        message.style.position = 'absolute';
        message.style.left = tower.x + 'px';
        message.style.top = tower.y + 'px';
        message.style.color = 'gold';
        message.style.fontWeight = 'bold';
        message.style.zIndex = '100';
        message.textContent = '+' + refund + 'G';
        this.gameBoard.appendChild(message);
        
        // Remove message after animation
        setTimeout(() => {
            if (message.parentNode) {
                this.gameBoard.removeChild(message);
            }
        }, 1000);
    }
    
    startWave() {
        if (!this.waveInProgress) {
            this.waveInProgress = true;
            this.enemiesSpawned = 0;
            this.enemiesAlive = 0;
            this.spawnEnemy();
        }
    }
    
    spawnEnemy() {
        const currentLevelConfig = this.levels[this.currentLevel];
        if (this.enemiesSpawned < currentLevelConfig.enemiesPerWave) {
            const enemyType = this.getEnemyType();
            const enemy = {
                id: Date.now(),
                x: this.path[0].x,
                y: this.path[0].y,
                pathIndex: 0,
                health: this.enemyTypes[enemyType].health,
                maxHealth: this.enemyTypes[enemyType].health,
                speed: this.enemyTypes[enemyType].speed * currentLevelConfig.enemySpeed,
                gold: this.enemyTypes[enemyType].gold,
                type: enemyType,
                element: null,
                canAttack: this.enemyTypes[enemyType].canAttack || false,
                attackRange: this.enemyTypes[enemyType].attackRange || 0,
                attackDamage: this.enemyTypes[enemyType].attackDamage || 0,
                attackCooldown: this.enemyTypes[enemyType].attackCooldown || 0,
                lastAttack: 0
            };
            
            const enemyElement = document.createElement('div');
            enemyElement.className = 'enemy';
            enemyElement.style.left = (enemy.x - 15) + 'px';
            enemyElement.style.top = (enemy.y - 15) + 'px';
            enemyElement.textContent = enemy.health;
            
            // Set enemy color based on type
            if (enemyType === 'basic') {
                enemyElement.style.backgroundColor = '#ff4500';
            } else if (enemyType === 'fast') {
                enemyElement.style.backgroundColor = '#ffd700';
            } else if (enemyType === 'strong') {
                enemyElement.style.backgroundColor = '#9400d3';
            } else if (enemyType === 'attacker') {
                enemyElement.style.backgroundColor = '#ff69b4';
            } else if (enemyType === 'converter') {
                enemyElement.style.backgroundColor = '#00ff00';
                enemyElement.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.7)';
            }
            
            this.gameBoard.appendChild(enemyElement);
            enemy.element = enemyElement;
            this.enemies.push(enemy);
            this.enemiesSpawned++;
            this.enemiesAlive++;
            
            setTimeout(() => this.spawnEnemy(), 1500);
        }
    }
    
    getEnemyType() {
        const rand = Math.random();
        if (this.currentLevel === 0) {
            return 'basic';
        } else if (this.currentLevel === 1) {
            if (rand < 0.6) return 'basic';
            if (rand < 0.9) return 'fast';
            return 'strong';
        } else if (this.currentLevel === 2) {
            if (rand < 0.4) return 'basic';
            if (rand < 0.7) return 'fast';
            if (rand < 0.9) return 'strong';
            return 'attacker';
        } else if (this.currentLevel === 3) {
            // 第四关：只生成攻击性敌人，有极小概率生成转化者
            if (rand < 0.01) {
                return 'converter';
            } else {
                return 'attacker';
            }
        }
        return 'basic';
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Check if enemy can attack
            if (enemy.canAttack) {
                this.enemyAttack(enemy);
            }
            
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
    
    enemyAttack(enemy) {
        // Check if enemy is ready to attack
        const now = Date.now();
        if (now - enemy.lastAttack < enemy.attackCooldown) {
            return;
        }
        
        // Find closest tower in range
        let closestTower = null;
        let minDistance = Infinity;
        
        for (const tower of this.towers) {
            // Only attack friendly towers (not converted ones)
            if (!tower.isEnemy) {
                const distance = Math.sqrt(Math.pow(tower.x - enemy.x, 2) + Math.pow(tower.y - enemy.y, 2));
                if (distance < enemy.attackRange && distance < minDistance) {
                    minDistance = distance;
                    closestTower = tower;
                }
            }
        }
        
        if (closestTower) {
            if (enemy.type === 'converter') {
                // Convert tower to enemy
                this.convertTower(closestTower);
            } else {
                // Fire projectile at tower
                this.fireEnemyProjectile(enemy, closestTower);
            }
            enemy.lastAttack = now;
        }
    }
    
    convertTower(tower) {
        // Convert tower to enemy
        tower.isEnemy = true;
        
        // Reduce attack speed and damage for enemy towers
        tower.fireRate = tower.fireRate * 1.5; // Increase fire rate (slower attacks)
        tower.damage = tower.damage * 0.8; // Reduce damage
        
        // Change tower appearance
        if (tower.element) {
            tower.element.style.filter = 'hue-rotate(180deg)';
            tower.element.style.border = '2px solid red';
        }
        
        // Show conversion animation
        if (tower.element) {
            tower.element.classList.add('converted');
            setTimeout(() => {
                if (tower.element) {
                    tower.element.classList.remove('converted');
                }
            }, 1000);
        }
    }
    
    fireEnemyProjectile(enemy, target) {
        const projectile = {
            id: Date.now(),
            x: enemy.x,
            y: enemy.y,
            target: target,
            damage: enemy.attackDamage,
            speed: 2,
            element: null
        };
        
        const projectileElement = document.createElement('div');
        projectileElement.className = 'projectile enemy-projectile';
        projectileElement.style.left = (projectile.x - 5) + 'px';
        projectileElement.style.top = (projectile.y - 5) + 'px';
        projectileElement.style.backgroundColor = '#ff69b4';
        this.gameBoard.appendChild(projectileElement);
        projectile.element = projectileElement;
        
        this.projectiles.push(projectile);
    }
    
    updateTowers() {
        const now = Date.now();
        
        for (const tower of this.towers) {
            if (tower.type === 'therapy') {
                // Therapy tower logic
                if (now - tower.lastFired >= tower.healRate) {
                    this.healTowers(tower);
                    tower.lastFired = now;
                }
            } else {
                // Attacking tower logic
                if (now - tower.lastFired >= tower.fireRate) {
                    const target = this.findTarget(tower);
                    if (target) {
                        this.fireProjectile(tower, target);
                        tower.lastFired = now;
                    }
                }
            }
        }
    }
    
    healTowers(therapyTower) {
        const healRange = therapyTower.range;
        const healAmount = therapyTower.healAmount;
        
        // Heal towers based on alignment
        for (const tower of this.towers) {
            // Skip the therapy tower itself
            if (tower.id === therapyTower.id) {
                continue;
            }
            
            // Calculate distance between therapy tower and target tower
            const distance = Math.sqrt(Math.pow(tower.x - therapyTower.x, 2) + Math.pow(tower.y - therapyTower.y, 2));
            
            // Check if target tower is within heal range, needs healing, and is on the same side
            if (distance <= healRange && tower.health < tower.maxHealth && tower.isEnemy === therapyTower.isEnemy) {
                // Heal the tower
                tower.health = Math.min(tower.maxHealth, tower.health + healAmount);
                
                // Update tower health display
                if (tower.healthBar) {
                    const healthPercentage = tower.health / tower.maxHealth;
                    tower.healthBar.style.width = (healthPercentage * 100) + '%';
                    
                    // Change health bar color based on health
                    if (healthPercentage < 0.2) {
                        tower.healthBar.style.backgroundColor = 'red';
                    } else if (healthPercentage < 0.5) {
                        tower.healthBar.style.backgroundColor = 'orange';
                    } else {
                        tower.healthBar.style.backgroundColor = 'green';
                    }
                }
                
                // Add heal animation
                if (tower.element) {
                    tower.element.classList.add('heal');
                    setTimeout(() => {
                        if (tower.element) {
                            tower.element.classList.remove('heal');
                        }
                    }, 200);
                }
            }
        }
        
        // If therapy tower is enemy, heal enemies too
        if (therapyTower.isEnemy) {
            for (const enemy of this.enemies) {
                // Calculate distance between therapy tower and enemy
                const distance = Math.sqrt(Math.pow(enemy.x - therapyTower.x, 2) + Math.pow(enemy.y - therapyTower.y, 2));
                
                // Check if enemy is within heal range and needs healing
                if (distance <= healRange && enemy.health < enemy.maxHealth) {
                    // Heal the enemy
                    enemy.health = Math.min(enemy.maxHealth, enemy.health + healAmount);
                    
                    // Update enemy health display
                    if (enemy.element) {
                        enemy.element.textContent = enemy.health;
                    }
                    
                    // Add heal animation
                    if (enemy.element) {
                        enemy.element.classList.add('heal');
                        setTimeout(() => {
                            if (enemy.element) {
                                enemy.element.classList.remove('heal');
                            }
                        }, 200);
                    }
                }
            }
        }
    }
    
    findTarget(tower) {
        let closestTarget = null;
        let closestDistance = Infinity;
        
        // If tower is friendly, target enemies and enemy towers
        if (!tower.isEnemy) {
            // Check enemies first
            for (const enemy of this.enemies) {
                const distance = Math.sqrt(Math.pow(tower.x - enemy.x, 2) + Math.pow(tower.y - enemy.y, 2));
                if (distance <= tower.range && distance < closestDistance) {
                    closestTarget = enemy;
                    closestDistance = distance;
                }
            }
            
            // If no enemies, check enemy towers
            if (!closestTarget) {
                for (const enemyTower of this.towers) {
                    if (enemyTower.isEnemy) {
                        const distance = Math.sqrt(Math.pow(tower.x - enemyTower.x, 2) + Math.pow(tower.y - enemyTower.y, 2));
                        if (distance <= tower.range && distance < closestDistance) {
                            closestTarget = enemyTower;
                            closestDistance = distance;
                        }
                    }
                }
            }
        } else {
            // If tower is enemy, target friendly towers
            for (const friendlyTower of this.towers) {
                if (!friendlyTower.isEnemy) {
                    const distance = Math.sqrt(Math.pow(tower.x - friendlyTower.x, 2) + Math.pow(tower.y - friendlyTower.y, 2));
                    if (distance <= tower.range && distance < closestDistance) {
                        closestTarget = friendlyTower;
                        closestDistance = distance;
                    }
                }
            }
        }
        
        return closestTarget;
    }
    
    fireProjectile(tower, target) {
        // Add firing animation to tower
        if (tower.element) {
            tower.element.classList.add('firing');
            setTimeout(() => {
                if (tower.element) {
                    tower.element.classList.remove('firing');
                }
            }, 500);
        }
        
        // Check if tower has area damage
        if (tower.areaDamage) {
            // Create explosion effect at target location
            setTimeout(() => {
                this.createAreaDamage(tower, target.x, target.y);
            }, 500);
        } else {
            // Regular projectile for machine gun and slow gun
            const projectile = {
                id: Date.now(),
                x: tower.x,
                y: tower.y,
                target: target,
                damage: tower.damage,
                speed: 8,
                slowFactor: tower.slowFactor,
                slowDuration: tower.slowDuration,
                element: null
            };
            
            const projectileElement = document.createElement('div');
            projectileElement.className = 'projectile';
            projectileElement.style.left = (projectile.x - 4) + 'px';
            projectileElement.style.top = (projectile.y - 4) + 'px';
            
            // Set projectile color based on tower type
            if (tower.type === 'machinegun') {
                projectileElement.style.backgroundColor = '#0ff';
                projectileElement.style.boxShadow = '0 0 10px #0ff, 0 0 20px #0ff';
            } else if (tower.type === 'cannon') {
                projectileElement.style.backgroundColor = '#f0f';
                projectileElement.style.boxShadow = '0 0 10px #f0f, 0 0 20px #f0f';
            } else if (tower.type === 'slowgun') {
                projectileElement.style.backgroundColor = '#9370db';
                projectileElement.style.boxShadow = '0 0 10px #9370db, 0 0 20px #9370db';
            }
            
            // Set projectile color based on tower alignment
            if (tower.isEnemy) {
                projectileElement.style.filter = 'hue-rotate(180deg)';
            }
            
            this.gameBoard.appendChild(projectileElement);
            projectile.element = projectileElement;
            this.projectiles.push(projectile);
        }
    }
    
    createAreaDamage(tower, x, y) {
        // Create explosion effect
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.width = (tower.areaRadius * 2) + 'px';
        explosion.style.height = (tower.areaRadius * 2) + 'px';
        explosion.style.left = (x - tower.areaRadius) + 'px';
        explosion.style.top = (y - tower.areaRadius) + 'px';
        explosion.style.backgroundColor = '#f0f';
        explosion.style.boxShadow = '0 0 30px #f0f, 0 0 50px #f0f';
        this.gameBoard.appendChild(explosion);
        
        // Remove explosion after animation
        setTimeout(() => {
            if (explosion.parentNode) {
                this.gameBoard.removeChild(explosion);
            }
        }, 500);
        
        // Damage all enemies in area
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const distance = Math.sqrt(Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2));
            
            if (distance <= tower.areaRadius) {
                // Enemy in range
                if (enemy.health > 0) {
                    enemy.health = Math.max(0, enemy.health - tower.damage);
                    enemy.element.textContent = enemy.health;
                    
                    // Add hit animation
                    enemy.element.classList.add('hit');
                    setTimeout(() => {
                        enemy.element.classList.remove('hit');
                    }, 300);
                    
                    if (enemy.health === 0) {
                        // Add death animation
                        enemy.element.classList.add('death');
                        
                        // Create secondary explosion effect
                        const deathExplosion = document.createElement('div');
                        deathExplosion.className = 'explosion';
                        deathExplosion.style.left = (enemy.x - 20) + 'px';
                        deathExplosion.style.top = (enemy.y - 20) + 'px';
                        this.gameBoard.appendChild(deathExplosion);
                        
                        // Remove explosion after animation
                        setTimeout(() => {
                            if (deathExplosion.parentNode) {
                                this.gameBoard.removeChild(deathExplosion);
                            }
                        }, 500);
                        
                        // Remove enemy after death animation
                        setTimeout(() => {
                            this.currentGold += enemy.gold;
                            this.enemiesAlive--;
                            if (enemy.element && enemy.element.parentNode) {
                                this.gameBoard.removeChild(enemy.element);
                            }
                            this.enemies.splice(i, 1);
                        }, 500);
                    }
                }
            }
        }
        
        // Update UI
        this.updateGameInfo();
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            const target = projectile.target;
            
            if (!target) {
                if (projectile.element && projectile.element.parentNode) {
                    this.gameBoard.removeChild(projectile.element);
                }
                this.projectiles.splice(i, 1);
                continue;
            }
            
            const dx = target.x - projectile.x;
            const dy = target.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < projectile.speed) {
                // Hit target
                if (projectile.element && projectile.element.parentNode) {
                    this.gameBoard.removeChild(projectile.element);
                }
                
                // Apply damage
                target.health = Math.max(0, target.health - projectile.damage);
                
                // Check if target is a tower (towers have healthBar property)
                if (target.healthBar) {
                    // Update tower health display
                    const healthPercentage = target.health / target.maxHealth;
                    target.healthBar.style.width = (healthPercentage * 100) + '%';
                    
                    // Change health bar color based on health
                    if (healthPercentage < 0.2) {
                        target.healthBar.style.backgroundColor = 'red';
                    } else if (healthPercentage < 0.5) {
                        target.healthBar.style.backgroundColor = 'orange';
                    } else {
                        target.healthBar.style.backgroundColor = 'green';
                    }
                    
                    // Add hit animation
                    if (target.element) {
                        target.element.classList.add('hit');
                        setTimeout(() => {
                            if (target.element) {
                                target.element.classList.remove('hit');
                            }
                        }, 200);
                    }
                    
                    // Check if tower is destroyed
                    if (target.health === 0) {
                        // Add explosion effect
                        const explosion = document.createElement('div');
                        explosion.className = 'explosion';
                        explosion.style.left = (target.x - 20) + 'px';
                        explosion.style.top = (target.y - 20) + 'px';
                        this.gameBoard.appendChild(explosion);
                        
                        // Remove explosion after animation
                        setTimeout(() => {
                            if (explosion.parentNode) {
                                this.gameBoard.removeChild(explosion);
                            }
                        }, 500);
                        
                        // Remove tower
                        if (target.element && target.element.parentNode) {
                            this.gameBoard.removeChild(target.element);
                        }
                        const towerIndex = this.towers.findIndex(t => t.id === target.id);
                        if (towerIndex !== -1) {
                            this.towers.splice(towerIndex, 1);
                        }
                    }
                } else {
                    // Target is an enemy
                    // Update enemy health display
                    if (target.element) {
                        target.element.textContent = target.health;
                        
                        // Add hit animation
                        target.element.classList.add('hit');
                        setTimeout(() => {
                            if (target.element) {
                                target.element.classList.remove('hit');
                            }
                        }, 300);
                    }
                    
                    // Apply slow effect if tower has slowFactor
                    if (projectile.slowFactor && projectile.slowFactor < 1) {
                        // Store original speed if not already stored
                        if (!target.originalSpeed) {
                            target.originalSpeed = target.speed;
                        }
                        
                        // Apply slow effect
                        target.speed = target.originalSpeed * projectile.slowFactor;
                        if (target.element) {
                            target.element.classList.add('slowed');
                        }
                        
                        // Remove slow effect after duration
                        setTimeout(() => {
                            if (target && target.originalSpeed) {
                                target.speed = target.originalSpeed;
                                if (target.element) {
                                    target.element.classList.remove('slowed');
                                }
                            }
                        }, projectile.slowDuration);
                    }
                    
                    // Check if enemy is dead
                    if (target.health === 0) {
                        // Add death animation and explosion effect
                        if (target.element) {
                            target.element.classList.add('death');
                        }
                        
                        // Create explosion effect
                        const explosion = document.createElement('div');
                        explosion.className = 'explosion';
                        explosion.style.left = (target.x - 20) + 'px';
                        explosion.style.top = (target.y - 20) + 'px';
                        this.gameBoard.appendChild(explosion);
                        
                        // Remove explosion after animation
                        setTimeout(() => {
                            if (explosion.parentNode) {
                                this.gameBoard.removeChild(explosion);
                            }
                        }, 500);
                        
                        // Remove enemy after death animation
                        setTimeout(() => {
                            this.currentGold += target.gold;
                            this.enemiesAlive--;
                            
                            // Add energy to walker cannons
                            this.towers.forEach(tower => {
                                if (tower.isWalker) {
                                    this.addEnergy(tower, tower.energyPerKill);
                                }
                            });
                            
                            if (target.element && target.element.parentNode) {
                                this.gameBoard.removeChild(target.element);
                            }
                            const enemyIndex = this.enemies.findIndex(e => e.id === target.id);
                            if (enemyIndex !== -1) {
                                this.enemies.splice(enemyIndex, 1);
                            }
                        }, 500);
                    }
                }
                
                this.projectiles.splice(i, 1);
            } else {
                // Move projectile towards target
                projectile.x += (dx / distance) * projectile.speed;
                projectile.y += (dy / distance) * projectile.speed;
                
                if (projectile.element) {
                    projectile.element.style.left = (projectile.x - 4) + 'px';
                    projectile.element.style.top = (projectile.y - 4) + 'px';
                }
            }
        }
    }
    
    checkWaveComplete() {
        const currentLevelConfig = this.levels[this.currentLevel];
        // Check if all enemies are dead (health <= 0)
        const allEnemiesDead = this.enemies.every(enemy => enemy.health <= 0);
        if (allEnemiesDead && this.enemiesSpawned >= currentLevelConfig.enemiesPerWave) {
            if (this.waveInProgress) {
                this.waveInProgress = false;
                
                // Check if current wave is the last wave
                if (this.wave === currentLevelConfig.totalWaves) {
                    if (this.currentLevel === 0) {
                        // Complete level 1, move to level 2
                        setTimeout(() => {
                            this.changeLevel(1);
                        }, 2000);
                    } else if (this.currentLevel === 1) {
                        // Complete level 2, move to level 3
                        setTimeout(() => {
                            this.changeLevel(2);
                        }, 2000);
                    } else if (this.currentLevel === 2) {
                        // Complete level 3, move to level 4
                        setTimeout(() => {
                            this.changeLevel(3);
                        }, 2000);
                    } else {
                        // Complete level 4, show victory
                        this.showGameWin();
                    }
                } else {
                    // Move to next wave
                    this.wave++;
                    this.waveCount.textContent = this.wave;
                    // Start the next wave only if it's not beyond total waves
                    if (this.wave <= currentLevelConfig.totalWaves) {
                        // Show loading message
                        this.showLoadingMessage();
                        // Start next wave after 3 seconds
                        setTimeout(() => {
                            this.startWave();
                        }, 3000);
                    }
                }
            }
        }
    }
    
    updateGameInfo() {
        const currentLevelConfig = this.levels[this.currentLevel];
        // Calculate remaining enemies in current wave
        const remainingEnemies = Math.max(0, currentLevelConfig.enemiesPerWave - (this.enemiesSpawned - this.enemiesAlive));
        this.enemyCount.textContent = remainingEnemies;
        this.health.textContent = this.currentHealth;
        this.gold.textContent = this.currentGold;
        
        // Update walker energy display
        this.towers.forEach(tower => {
            if (tower.isWalker && tower.element) {
                // Add or update energy display
                let energyDisplay = tower.element.querySelector('.energy-display');
                if (!energyDisplay) {
                    energyDisplay = document.createElement('div');
                    energyDisplay.className = 'energy-display';
                    tower.element.appendChild(energyDisplay);
                }
                energyDisplay.textContent = Math.floor(tower.energy) + '/' + tower.energyCapacity;
            }
        });
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