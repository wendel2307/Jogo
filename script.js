const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const startMessage = document.getElementById('start-message');

let score = 0;
let speed = 5;
let shootingInterval;
let movingLeft = false;
let movingRight = false;
let gameStarted = false; // Flag para verificar se o jogo começou
let cometInterval = 2000; // Intervalo inicial para criação dos cometas
let shootIntervalTime = 200; // Intervalo inicial entre os tiros
const explosionSound = new Audio('explosion.mp3'); // Certifique-se de que o caminho está correto

// Função para criar projétil
function createProjectile() {
    const projectile = document.createElement('div');
    projectile.classList.add('projectile');
    
    // Ajustando a posição inicial do projétil para sair da parte inferior da nave
    projectile.style.left = player.offsetLeft + player.offsetWidth / 2 - 2.5 + 'px';
    projectile.style.bottom = '0px';
    projectile.style.position = 'absolute';
    game.appendChild(projectile);

    // Movimento do projétil
    const projectileInterval = setInterval(() => {
        const currentBottom = parseInt(projectile.style.bottom);
        projectile.style.bottom = currentBottom + 10 + 'px'; // Movimento para cima (aumentando o valor de bottom)

        if (currentBottom > window.innerHeight) { // O projétil sai da tela pelo topo
            clearInterval(projectileInterval);
            projectile.remove();
        }

        // Detectar colisão com cometas
        document.querySelectorAll('.comet').forEach(comet => {
            if (isCollision(projectile, comet)) {
                score += 1;
                scoreDisplay.textContent = `Score: ${score}`;
                comet.remove();
                projectile.remove();
                clearInterval(projectileInterval);
                
                // Verifica se chegou a 20 pontos para alterar a dificuldade
                if (score >= 20) {
                    adjustDifficulty();
                }

                // Acelera os tiros a cada 20 pontos
                if (score % 20 === 0) {
                    increaseShootingSpeed();
                }
            }
        });
    }, 20);
}

// Função para criar cometa
function createComet() {
    const comet = document.createElement('div');
    comet.classList.add('comet');
    comet.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    comet.style.backgroundImage = `url('../Galactica/img/${Math.floor(Math.random() * 4) + 1}.png')`; // Seleciona uma imagem aleatória entre 1 e 4
    game.appendChild(comet);

    comet.style.animationDuration = `${speed}s`;

    // Remover cometa ao sair da tela
    comet.addEventListener('animationend', () => {
        comet.remove();
    });
}

// Função para detectar colisão
function isCollision(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    return !(
        aRect.top > bRect.bottom ||
        aRect.bottom < bRect.top ||
        aRect.right < bRect.left ||
        aRect.left > bRect.right
    );
}

// Função para mover a nave
function movePlayer() {
    if (movingLeft && player.offsetLeft > 0) {
        player.style.left = player.offsetLeft - 10 + 'px'; // Aumenta a velocidade para a esquerda
    }
    if (movingRight && player.offsetLeft < window.innerWidth - player.offsetWidth) {
        player.style.left = player.offsetLeft + 10 + 'px'; // Aumenta a velocidade para a direita
    }
}

// Função para ajustar a dificuldade do jogo após 20 pontos
function adjustDifficulty() {
    // Reduz a duração da animação dos cometas para que eles se movam mais rápido
    speed = 3; // Aumenta a velocidade dos cometas
    cometInterval = 1500; // Reduz o intervalo entre a criação de cometas

    // Atualiza o intervalo de criação de cometas
    clearInterval(cometCreationInterval);
    cometCreationInterval = setInterval(createComet, cometInterval);
}

// Função para acelerar os tiros a cada 20 pontos
function increaseShootingSpeed() {
    if (shootIntervalTime > 100) {
        shootIntervalTime -= 50; // Reduz o intervalo de tempo entre os tiros
        clearInterval(shootingInterval);
        shootingInterval = setInterval(createProjectile, shootIntervalTime);
    }
}

// Função para quando a nave perde
function gameOver() {
    explosionSound.play();  // Toca a explosão quando a nave colide com um cometa
    alert('Game Over! Score: ' + score);
    clearInterval(gameLoop);
    clearInterval(cometCreationInterval);
    location.reload();
}

// Função para iniciar o jogo
function startGame() {
    startMessage.style.display = 'none';
    gameStarted = true;
    cometCreationInterval = setInterval(createComet, cometInterval);

    // Loop principal do jogo
    gameLoop = setInterval(() => {
        const playerRect = player.getBoundingClientRect();

        document.querySelectorAll('.comet').forEach(comet => {
            const cometRect = comet.getBoundingClientRect();

            if (isCollision(player, comet)) {
                gameOver();
            }
        });

        // Movimentar a nave
        movePlayer();
    }, 50);
}

// Eventos para pressionar teclas
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        movingLeft = true;
    } else if (e.key === 'ArrowRight') {
        movingRight = true;
    } else if (e.key === ' ' && !gameStarted) {
        startGame();
    } else if (e.key === ' ' && gameStarted) {
        // Inicia o disparo quando a barra de espaço é pressionada
        if (!shootingInterval) {
            createProjectile();
            shootingInterval = setInterval(createProjectile, shootIntervalTime);
        }
    }
});

// Eventos para liberar teclas
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        movingLeft = false;
    } else if (e.key === 'ArrowRight') {
        movingRight = false;
    } else if (e.key === ' ') {
        // Interrompe o disparo quando a barra de espaço é liberada
        clearInterval(shootingInterval);
        shootingInterval = null;
    }
});

// Atirar enquanto o mouse estiver pressionado
game.addEventListener('mousedown', () => {
    if (!shootingInterval) {
        shootingInterval = setInterval(createProjectile, shootIntervalTime);
    }
});

// Parar de atirar quando o mouse não estiver pressionado
game.addEventListener('mouseup', () => {
    clearInterval(shootingInterval);
    shootingInterval = null;
});
