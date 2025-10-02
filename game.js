// 游戏配置
const GRID_SIZE = 30; // 30x30的网格
const CELL_SIZE = 20; // 每个格子的大小
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 300; // 初始速度（毫秒）
const MIN_SPEED = 120; // 最小速度（毫秒）
const SPEED_INCREASE = 30; // 每3分速度增加量（毫秒）

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
let currentSpeed = INITIAL_SPEED;
let boundaryEnabled = true; // 边界开关状态，true为开启边界检测

// 更新游戏速度
function updateSpeed() {
    const speedReduction = Math.floor(score / 3) * SPEED_INCREASE;
    const newSpeed = Math.max(INITIAL_SPEED - speedReduction, MIN_SPEED);
    
    if (newSpeed !== currentSpeed && gameRunning && !gamePaused) {
        currentSpeed = newSpeed;
        speedElement.textContent = currentSpeed;
        clearInterval(gameLoop);
        gameLoop = setInterval(update, currentSpeed);
    }
}
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const boundaryElement = document.getElementById('boundaryStatus');
const gameOverElement = document.getElementById('gameOver');
const pauseMenuElement = document.getElementById('pauseMenu');
const instructionsMenuElement = document.getElementById('instructionsMenu');

// 初始化游戏
function initGame() {
    // 显示移动端控制（如果适用）
    showMobileControls();
    
    // 初始化蛇的位置（从中心开始）
    snake = [
        { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }
    ];
    
    // 生成第一个食物
    generateFood();
    
    // 重置游戏状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    currentSpeed = INITIAL_SPEED;
    scoreElement.textContent = score;
    speedElement.textContent = currentSpeed;
    gameOverElement.style.display = 'none';
    pauseMenuElement.style.display = 'none';
    
    // 开始游戏
    gameRunning = true;
    gamePaused = false;
    
    // 开始游戏循环
    gameLoop = setInterval(update, currentSpeed);
}

// 生成食物
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (isSnakePosition(food.x, food.y));
}

// 检查位置是否在蛇身上
function isSnakePosition(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// 更新游戏状态
function update() {
    if (!gameRunning || gamePaused) return;
    
    // 更新方向（防止180°转弯）
    if (canChangeDirection(direction, nextDirection)) {
        direction = nextDirection;
    }
    
    // 计算新的头部位置
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 边界处理
    if (boundaryEnabled) {
        // 开启边界检测 - 传统模式
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            gameOver();
            return;
        }
    } else {
        // 关闭边界检测 - 穿越模式
        if (head.x < 0) {
            head.x = GRID_SIZE - 1; // 从左边界穿越到右边界
        } else if (head.x >= GRID_SIZE) {
            head.x = 0; // 从右边界穿越到左边界
        }
        
        if (head.y < 0) {
            head.y = GRID_SIZE - 1; // 从上边界穿越到下边界
        } else if (head.y >= GRID_SIZE) {
            head.y = 0; // 从下边界穿越到上边界
        }
    }
    
    // 检查自身碰撞
    if (isSnakePosition(head.x, head.y)) {
        gameOver();
        return;
    }
    
    // 将新头部添加到蛇身
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        generateFood();
        // 检查是否需要更新速度
        updateSpeed();
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
    
    // 绘制游戏
    draw();
}

// 检查是否可以改变方向（防止180°转弯）
function canChangeDirection(current, next) {
    const opposites = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    
    return opposites[current] !== next;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        // 蛇头用更亮的颜色
        if (index === 0) {
            ctx.fillStyle = '#66BB6A';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(
        food.x * CELL_SIZE + 2,
        food.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
    );
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    gameOverElement.style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameLoop);
    initGame();
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        // 显示暂停菜单
        pauseMenuElement.style.display = 'flex';
        clearInterval(gameLoop);
    } else {
        // 隐藏暂停菜单，继续游戏
        pauseMenuElement.style.display = 'none';
        gameLoop = setInterval(update, currentSpeed);
    }
}

// 从暂停菜单重新开始游戏
function restartFromPause() {
    // 隐藏暂停菜单
    pauseMenuElement.style.display = 'none';
    // 重置暂停状态
    gamePaused = false;
    // 重新开始游戏
    restartGame();
}

// 显示玩法介绍
function showInstructions() {
    pauseMenuElement.style.display = 'none';
    instructionsMenuElement.style.display = 'flex';
}

// 隐藏玩法介绍
function hideInstructions() {
    instructionsMenuElement.style.display = 'none';
    pauseMenuElement.style.display = 'flex';
}

// 移动端控制处理
let mobileControlInterval;

// 检测是否为移动设备
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// 显示移动端控制
function showMobileControls() {
    const mobileControls = document.getElementById('mobileControls');
    const desktopControls = document.querySelector('.controls');
    
    if (isMobileDevice()) {
        mobileControls.style.display = 'block';
        desktopControls.style.display = 'none';
    } else {
        mobileControls.style.display = 'none';
        desktopControls.style.display = 'block';
    }
}

function handleMobileControl(action) {
    if (!gameRunning) return;
    
    switch (action) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
            // 设置方向
            nextDirection = action;
            // 如果游戏没有暂停，立即执行一次移动
            if (!gamePaused) {
                update();
                // 开始连续移动
                if (mobileControlInterval) {
                    clearInterval(mobileControlInterval);
                }
                mobileControlInterval = setInterval(() => {
                    if (gameRunning && !gamePaused) {
                        update();
                    }
                }, currentSpeed);
            }
            break;
            
        case 'pause':
            togglePause();
            break;
            
        case 'boundary':
            toggleBoundary();
            break;
            
        case 'restart':
            restartGame();
            break;
    }
}

function stopMobileControl() {
    if (mobileControlInterval) {
        clearInterval(mobileControlInterval);
        mobileControlInterval = null;
    }
}

// 切换边界开关状态
function toggleBoundary() {
    boundaryEnabled = !boundaryEnabled;
    
    // 更新UI显示
    boundaryElement.textContent = boundaryEnabled ? '开启' : '关闭';
    
    // 如果游戏正在运行，显示状态提示
    if (gameRunning && !gamePaused) {
        console.log(`边界检测: ${boundaryEnabled ? '开启' : '关闭'}`);
    }
}

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            nextDirection = 'up';
            break;
        case 'ArrowDown':
            e.preventDefault();
            nextDirection = 'down';
            break;
        case 'ArrowLeft':
            e.preventDefault();
            nextDirection = 'left';
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextDirection = 'right';
            break;
        case 'p':
        case 'P':
            e.preventDefault();
            togglePause();
            break;
        case 'c':
        case 'C':
            e.preventDefault();
            toggleBoundary();
            break;
    }
});

// 初始化游戏
window.addEventListener('load', initGame);

// 窗口大小改变时重新检查设备类型
window.addEventListener('resize', showMobileControls);