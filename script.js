// --- DOM 取得 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('startButton');
const scoreValue = document.getElementById('scoreValue');
const planeOptions = document.querySelectorAll('.plane-option');
const confirmPlaneBtn = document.getElementById('confirmPlaneBtn');

// --- 遊戲設定 ---
const playerSpeed = 5;
const bulletSpeed = 10;
const enemySpeed = 2;

// --- 狀態變數 ---
let score = 0;
let nextHealthScore = 100;
let difficultyLevel = 1;
let nextDifficultyScore = 1000;
let enemySpawnRate = 0.01;
let enemyFireRate = 0.01;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
const keys = {};
const bullets = [];
const enemyBullets = [];
const enemies = [];
const obstacles = [];

// --- 載入圖片 ---
const enemyImg1 = new Image();
enemyImg1.src = './img/alien4-removebg-preview.png'; // 確保路徑相對於 GitHub Pages
const enemyImg2 = new Image();
enemyImg2.src = './img/alien-removebg-preview.png';
const enemyImg3 = new Image();
enemyImg3.src = './img/alien2-removebg-preview.png';
const obstacleImg = new Image();
obstacleImg.src = './img/island-removebg-preview.png';

// 玩家戰機圖片載入（根據 localStorage）
const playerImg = new Image();
function loadPlayerImg() {
    let planeType = localStorage.getItem('selectedPlane') || "1";
    if (planeType === "2") {
        playerImg.src = './img/player2.png';
    } else if (planeType === "3") {
        playerImg.src = './img/player3.png';
    } else {
        playerImg.src = './img/player1.png';
    }
}
loadPlayerImg();

// --- 玩家物件 ---
const player = {
    x: canvas.width / 2 - 32,
    y: canvas.height - 96,
    width: 64,
    height: 64,
    health: 5,
    draw: function() {
        if (playerImg.complete && playerImg.naturalWidth !== 0) {
            ctx.drawImage(playerImg, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
};

// --- 遊戲主邏輯 ---
function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= playerSpeed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += playerSpeed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= playerSpeed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += playerSpeed;
}

function fireBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 8,
        y: player.y,
        width: 16,
        height: 32,
        draw: function() {
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    });
}

function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bulletSpeed;
        bullets[i].draw();
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
    for (let i = 0; i < enemyBullets.length; i++) {
        enemyBullets[i].y += bulletSpeed;
        enemyBullets[i].draw();
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
            i--;
        }
    }
}

function spawnEnemy() {
    if (Math.random() < enemySpawnRate) {
        let enemyType = Math.ceil(Math.random() * 3);
        enemies.push({
            x: Math.random() * (canvas.width - 64),
            y: -64,
            width: 64,
            height: 64,
            health: enemyType,
            type: enemyType,
            draw: function() {
                if (this.type === 1) {
                    if (enemyImg1.complete && enemyImg1.naturalWidth !== 0) {
                        ctx.drawImage(enemyImg1, this.x, this.y, this.width, this.height);
                    } else {
                        ctx.fillStyle = 'red';
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    }
                } else if (this.type === 2) {
                    if (enemyImg2.complete && enemyImg2.naturalWidth !== 0) {
                        ctx.drawImage(enemyImg2, this.x, this.y, this.width, this.height);
                    } else {
                        ctx.fillStyle = 'orange';
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    }
                } else if (this.type === 3) {
                    if (enemyImg3.complete && enemyImg3.naturalWidth !== 0) {
                        ctx.drawImage(enemyImg3, this.x, this.y, this.width, this.height);
                    } else {
                        ctx.fillStyle = 'yellow';
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    }
                }
            }
        });
    }
}

function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += enemySpeed;
        enemies[i].draw();
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            i--;
        }
        if (Math.random() < enemyFireRate) {
            enemyBullets.push({
                x: enemies[i].x + enemies[i].width / 2 - 8,
                y: enemies[i].y + enemies[i].height,
                width: 16,
                height: 32,
                draw: function() {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            });
        }
    }
}

function spawnObstacle() {
    if (Math.random() < 0.005) {
        obstacles.push({
            x: Math.random() * (canvas.width - 64),
            y: -64,
            width: 64,
            height: 64,
            draw: function() {
                if (obstacleImg.complete && obstacleImg.naturalWidth !== 0) {
                    ctx.drawImage(obstacleImg, this.x, this.y, this.width, this.height);
                } else {
                    ctx.fillStyle = 'gray';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            }
        });
    }
}

function moveObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += enemySpeed;
        obstacles[i].draw();
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
        }
    }
}

function checkCollisions() {
    // 子彈互撞
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemyBullets.length - 1; j >= 0; j--) {
            if (
                bullets[i].x < enemyBullets[j].x + enemyBullets[j].width &&
                bullets[i].x + bullets[i].width > enemyBullets[j].x &&
                bullets[i].y < enemyBullets[j].y + enemyBullets[j].height &&
                bullets[i].y + bullets[i].height > enemyBullets[j].y
            ) {
                bullets.splice(i, 1);
                enemyBullets.splice(j, 1);
                break;
            }
        }
    }
    // 玩家子彈與敵人
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (
                bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y
            ) {
                enemies[j].health--;
                bullets.splice(i, 1);
                if (enemies[j].health <= 0) {
                    score += enemies[j].type * 10;
                    while (score >= nextHealthScore) {
                        player.health += 2;
                        if (player.health > 10) player.health = 10;
                        nextHealthScore += 100;
                    }
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
    // 敵機子彈與玩家
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (
            enemyBullets[i].x < player.x + player.width &&
            enemyBullets[i].x + enemyBullets[i].width > player.x &&
            enemyBullets[i].y < player.y + player.height &&
            enemyBullets[i].y + enemyBullets[i].height > player.y
        ) {
            player.health--;
            enemyBullets.splice(i, 1);
            if (player.health <= 0) {
                gameOver();
            }
            break;
        }
    }
    // 障礙物與玩家
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (
            obstacles[i].x < player.x + player.width &&
            obstacles[i].x + obstacles[i].width > player.x &&
            obstacles[i].y < player.y + player.height &&
            obstacles[i].y + obstacles[i].height > player.y
        ) {
            player.health--;
            obstacles.splice(i, 1);
            if (player.health <= 0) {
                gameOver();
            }
            break;
        }
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 難度提升
    while (score >= nextDifficultyScore) {
        difficultyLevel++;
        enemySpawnRate += 0.05;
        enemyFireRate += 0.03;
        nextDifficultyScore += 100;
    }

    movePlayer();
    moveBullets();
    spawnEnemy();
    moveEnemies();
    spawnObstacle();
    moveObstacles();
    checkCollisions();

    player.draw();

    // 顯示血量
    ctx.fillStyle = 'white';
    ctx.font = '16px sans-serif';
    ctx.fillText('Health: ' + player.health, 10, 30);

    // 顯示分數
    scoreElement.textContent = 'Score: ' + score + ' | High Score: ' + highScore;
    if (scoreValue) scoreValue.textContent = score;

    requestAnimationFrame(update);
}

// --- 事件監聽 ---
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    if (e.key === ' ') fireBullet();
});
window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

// --- 修改遊戲開始邏輯 ---
startButton.style.display = 'block'; // 預設顯示開始按鈕
startButton.addEventListener('click', function () {
    document.getElementById('planeSelectPage').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    startButton.style.display = 'none';
    update(); // 開始遊戲主迴圈
});

// --- 隱藏或移除登入面板 ---
const authPanel = document.getElementById('authPanel');
authPanel.style.display = 'none';

// --- 遊戲結束 ---
function gameOver() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        alert('Game Over! New High Score: ' + score);
    } else {
        alert('Game Over! Your Score: ' + score);
    }
    location.reload();
}

// --- 戰機選擇頁邏輯 ---
let selectedPlane = null;
planeOptions.forEach(option => {
    option.onclick = function() {
        planeOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        selectedPlane = this.getAttribute('data-plane');
        confirmPlaneBtn.disabled = false;
    };
});
confirmPlaneBtn.onclick = function() {
    localStorage.setItem('selectedPlane', selectedPlane);
    loadPlayerImg(); // 重新載入戰機圖片
    document.getElementById('planeSelectPage').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('startButton').style.display = 'block';
};