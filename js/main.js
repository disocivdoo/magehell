/* =========================================
   CONFIGURACIÓN PRINCIPAL Y BUCLE DE JUEGO
   ========================================= */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables Globales (Usadas en otros scripts)
let width, height;
let animationId = null;
let frameCount = 0;
let currentFloor = 1;
let isIntro = false;
const MAX_FLOORS = 3;

// Estados del Juego
const GAME_STATES = { START: 0, PLAY: 1, PAUSE: 2, DEATH: 3, WIN: 4 };
let currentState = GAME_STATES.START;

// Entidades Globales
let player;
let bullets = [];
let enemyBullets = [];
let particles = [];

// Inputs
const keys = {};
let mousePos = { x: 0, y: 0 };

/* =========================================
   INPUTS (TECLADO Y RATÓN)
   ========================================= */
window.onkeydown = (e) => {
    keys[e.code] = true;
    
    // Teclas de Función Globales
    if(e.code === 'KeyH') document.getElementById('main-ui').classList.toggle('hud-hidden');
    if(e.code === 'KeyM') document.getElementById('minimap').classList.toggle('minimap-expanded');
    if(e.code === 'Escape' || e.code === 'KeyP') togglePause(); // togglePause está en ui.js
};

window.onkeyup = (e) => keys[e.code] = false;

window.onmousemove = (e) => { 
    mousePos.x = e.clientX; 
    mousePos.y = e.clientY; 
};

window.onresize = () => { 
    width = canvas.width = window.innerWidth; 
    height = canvas.height = window.innerHeight; 
};

/* =========================================
   INICIO Y REINICIO
   ========================================= */
function initGame() {
    if (animationId) cancelAnimationFrame(animationId);
    
    // Ajustar pantalla
    width = canvas.width = window.innerWidth; 
    height = canvas.height = window.innerHeight;
    
    // Resetear variables
    bullets = []; 
    enemyBullets = []; 
    particles = []; 
    frameCount = 0; 
    currentFloor = 1;
    
    // Crear Jugador y Mundo (Clases definidas en entities.js y world.js)
    player = new Player(); 
    generateDungeon(); // Definida en world.js
    
    // UI Setup
    document.getElementById('overlay-screen').classList.add('hidden'); 
    document.getElementById('death-screen').classList.add('hidden'); 
    document.getElementById('win-screen').classList.add('hidden'); 
    document.getElementById('pause-screen').classList.add('hidden'); 
    document.getElementById('start-content').classList.remove('hidden');
    
    // Intro Animada
    isIntro = true;
    const intro = document.getElementById('floor-intro');
    document.getElementById('floor-title').innerText = `PISO 1`; 
    document.getElementById('floor-subtitle').innerText = 'Las Catacumbas';
    intro.style.opacity = '1'; 
    
    setTimeout(() => { 
        intro.style.opacity = '0'; 
        isIntro = false; 
    }, 1500);
    
    currentState = GAME_STATES.PLAY; 
    updateHUD(); // Definida en ui.js
    loop();
}

/* =========================================
   BUCLE PRINCIPAL (GAME LOOP)
   ========================================= */
function loop() {
    // Si estamos en pausa, muerte o victoria, detenemos la actualización lógica (pero no el dibujo necesariamente)
    if (currentState !== GAME_STATES.PLAY) return;
    
    // Limpiar Pantalla
    ctx.fillStyle = 'rgba(10, 10, 13, 0.4)'; // Efecto de estela leve
    ctx.fillRect(0, 0, width, height);
    
    // --- ACTUALIZACIONES (LOGICA) ---
    if (!isIntro) { 
        frameCount++; 
        if (typeof currentRoom !== 'undefined') currentRoom.update(); 
        if (player) player.update(); 
    }
    
    // --- DIBUJO (RENDER) ---
    if (typeof currentRoom !== 'undefined') currentRoom.draw(); 
    if (player) player.draw();
    
    // Proyectiles del Jugador
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i]; 
        if (!isIntro) {
            b.update(); 
            // Lógica de colisión bala-enemigo
            let hit = false;
            // currentRoom.enemies viene de world.js
            for (let j = currentRoom.enemies.length - 1; j >= 0; j--) {
                const e = currentRoom.enemies[j];
                if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + b.radius) {
                    if (!b.pierced.includes(e)) {
                        e.hp -= b.damage;
                        if (e.hp <= 0) {
                            // Enemigo muerto
                            createExplosion(e.x, e.y, e.type.startsWith('boss') ? '#ef4444' : '#f87171', 15);
                            
                            // Probabilidad de Loot
                            let rand = Math.random();
                            if (player.synergies.vampirism && Math.random() < 0.05 && player.hp < player.maxHp) {
                                player.hp++; updateHUD(); 
                            }
                            if (rand < 0.1) currentRoom.pickups.push(new Pickup(e.x, e.y, 'health'));
                            else if (rand < 0.2) currentRoom.pickups.push(new Pickup(e.x, e.y, 'coin'));
                            
                            // Loot especial Boss
                            if (e.type.startsWith('boss')) {
                                currentRoom.spawnItem(e.x, e.y + 40, false);
                                currentRoom.pickups.push(new Pickup(e.x, e.y - 40, 'portal'));
                            }
                            currentRoom.enemies.splice(j, 1);
                        }
                        
                        // Sinergias (Split)
                        if (b.syns.split) {
                            for(let k=0; k<2; k++) bullets.push(new Bullet(b.x, b.y, Math.random()*Math.PI*2, true, { ...b.syns, split: false }, 5, b.damage/2));
                        }
                        
                        if (b.syns.piercing) b.pierced.push(e); else hit = true;
                    }
                }
            }
            if (hit || b.life <= 0 || b.x < 30 || b.x > width-30 || b.y < 30 || b.y > height-30) {
                if (!b.syns.bouncing || b.bounces <= 0 || b.life <= 0) bullets.splice(i, 1);
            }
        }
        b.draw();
    }
    
    // Proyectiles Enemigos
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i]; 
        if (!isIntro) {
            b.update();
            if (Math.hypot(b.x - player.x, b.y - player.y) < b.radius + player.hitbox) {
                player.takeDamage(); 
                enemyBullets.splice(i, 1);
            } else if (b.life <= 0 || b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
                enemyBullets.splice(i, 1);
            }
        }
        b.draw();
    }
    
    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; 
        if (!isIntro) { p.x += p.vx; p.y += p.vy; p.life -= 0.02; }
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 2, 2);
        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    
    animationId = requestAnimationFrame(loop);
}

// Helper para explosiones
function createExplosion(x, y, color, count) {
    for(let i=0; i<count; i++) {
        particles.push({ 
            x, y, color, life: 1, 
            vx: (Math.random()-0.5)*8, 
            vy: (Math.random()-0.5)*8 
        });
    }
}

// Iniciar configuración inicial de canvas
width = canvas.width = window.innerWidth;
height = canvas.height = window.innerHeight;