/* =========================================
   VARIABLES GLOBALES DEL MUNDO
   ========================================= */
const GRID_SIZE = 7;
let dungeon = [];
let currentPos = { x: 3, y: 3 };
let currentRoom; // Variable crucial accedida por otros scripts

/* =========================================
   CLASE OBSTÁCULO (OBSTACLE)
   ========================================= */
class Obstacle {
    constructor(x, y, w, h, type) { this.x = x; this.y = y; this.w = w; this.h = h; this.type = type; }
    draw() {
        if (this.type === 'wall') {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = '#475569'; ctx.fillRect(this.x, this.y, this.w, 4);
            ctx.fillStyle = '#0f172a'; ctx.fillRect(this.x, this.y + this.h - 4, this.w, 4);
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = '#0f172a'; ctx.fillRect(this.x + this.w/2 - 2, this.y + 4, 4, this.h - 8);
        } else {
            ctx.fillStyle = '#020617'; ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.w, this.h);
        }
    }
}

/* =========================================
   CLASE HABITACIÓN (ROOM)
   ========================================= */
class Room {
    constructor(x, y, type) {
        this.x = x; this.y = y; this.type = type;
        this.enemies = []; this.items = []; this.pickups = []; this.obstacles = [];
        this.cleared = (type === 'start' || type === 'item' || type === 'shop');
        this.visited = false;
        this.doors = { N: false, S: false, E: false, W: false };
        
        if (type === 'combat') {
            this.generateLayout();
            let count = 2 + currentFloor + Math.floor(Math.random()*2);
            for(let i=0; i<count; i++) {
                let eType = 'basic'; const r = Math.random();
                if (currentFloor === 1) eType = r > 0.7 ? 'bat' : 'basic';
                if (currentFloor === 2) eType = r > 0.6 ? 'sniper' : (r > 0.3 ? 'spiral' : 'basic');
                if (currentFloor === 3) eType = r > 0.7 ? 'guard' : (r > 0.4 ? 'sniper' : 'spiral');
                this.enemies.push(new Enemy(eType, currentFloor));
            }
        } else if (type === 'boss') {
            this.enemies.push(new Enemy('boss' + currentFloor, currentFloor));
        } else if (type === 'item') {
            this.spawnItem(width/2, height/2, false);
        } else if (type === 'shop') {
            this.spawnItem(width/2 - 140, height/2, true);
            this.spawnItem(width/2 + 140, height/2, true);
        }
    }

    generateLayout() {
        const rand = Math.random(); const cx = width / 2; const cy = height / 2;
        if (rand < 0.5) return; 
        else if (rand < 0.6) { const s=60; this.obstacles.push(new Obstacle(cx-150, cy-100, s, s, 'wall'), new Obstacle(cx+150-s, cy-100, s, s, 'wall'), new Obstacle(cx-150, cy+100-s, s, s, 'wall'), new Obstacle(cx+150-s, cy+100-s, s, s, 'wall')); }
        else if (rand < 0.7) { this.obstacles.push(new Obstacle(cx-100, cy-100, 200, 200, 'pit')); }
        else if (rand < 0.8) { const s=150; this.obstacles.push(new Obstacle(50, 50, s, s, 'wall'), new Obstacle(width-50-s, 50, s, s, 'wall'), new Obstacle(50, height-50-s, s, s, 'wall'), new Obstacle(width-50-s, height-50-s, s, s, 'wall')); }
        else { this.obstacles.push(new Obstacle(cx-200, cy-80, 400, 40, 'wall'), new Obstacle(cx-200, cy+40, 400, 40, 'wall')); }
    }
    
    spawnItem(x, y, isShop) {
        // Lógica de rareza (Tier Logic)
        const r = Math.random();
        let tier = 1;
        if (r > 0.95) tier = 4; // 5% Legendario
        else if (r > 0.80) tier = 3; // 15% Raro
        else if (r > 0.50) tier = 2; // 30% Poco Común
        
        const pool = ITEMS.filter(i => i.tier === tier);
        const item = pool[Math.floor(Math.random() * pool.length)];
        
        this.items.push({ ...item, x, y, isShop, price: 15 * tier, purchased: false });
    }

    update() {
        if (!this.cleared && this.enemies.length === 0) {
            this.cleared = true; 
            if (typeof showClearFeedback === 'function') showClearFeedback();
            
            if (this.type === 'boss' && !this.visited) { 
                this.spawnItem(width/2, height/2 - 50, false); 
                this.pickups.push(new Pickup(width/2, height/2 + 50, 'portal')); 
                this.visited = true; 
            }
        }
        
        this.enemies.forEach(e => e.update()); 
        this.pickups.forEach(p => p.update());
        
        // Colisión con Objetos (Tienda/Drops)
        for(let i=this.items.length-1; i>=0; i--) {
            const it = this.items[i]; if (it.purchased) continue;
            if (Math.hypot(player.x - it.x, player.y - it.y) < 45) {
                if (it.isShop) { 
                    if (player.coins >= it.price) { 
                        player.coins -= it.price; 
                        applyItem(it); 
                        it.purchased = true; 
                        this.items.splice(i, 1); 
                        updateHUD(); 
                    } 
                } else { 
                    applyItem(it); 
                    this.items.splice(i, 1); 
                }
            }
        }
        
        // Colisión con Pickups (Salud/Monedas/Portal)
        for(let i=this.pickups.length-1; i>=0; i--) {
            const p = this.pickups[i];
            if (Math.hypot(player.x - p.x, player.y - p.y) < 35) {
                if (p.type === 'health') { 
                    if (player.hp < player.maxHp) { 
                        player.hp++; 
                        createExplosion(p.x, p.y, '#ef4444', 15); 
                        this.pickups.splice(i, 1); 
                        updateHUD(); 
                    } 
                } else if (p.type === 'coin') { 
                    player.coins++; 
                    createExplosion(p.x, p.y, '#eab308', 10); 
                    this.pickups.splice(i, 1); 
                    updateHUD(); 
                } else if (p.type === 'portal') { 
                    nextFloor(); 
                }
            }
        }
    }
    
    draw() {
        // Cuadrícula de fondo
        ctx.strokeStyle = 'rgba(178, 148, 94, 0.15)'; ctx.lineWidth = 1;
        for(let i=100; i<width; i+=100) { ctx.beginPath(); ctx.moveTo(i, 50); ctx.lineTo(i, height-50); ctx.stroke(); }
        for(let i=100; i<height; i+=100) { ctx.beginPath(); ctx.moveTo(50, i); ctx.lineTo(width-50, i); ctx.stroke(); }
        
        this.obstacles.forEach(o => o.draw());
        
        // Bordes de la sala
        ctx.strokeStyle = '#b2945e'; ctx.setLineDash([]); ctx.lineWidth = 4; ctx.strokeRect(50, 50, width-100, height-100);
        
        // Puertas
        const ds = 90; ctx.fillStyle = this.cleared ? '#4338ca' : '#1a1a24';
        if (this.doors.N) { ctx.beginPath(); ctx.arc(width/2, 50, ds/2, Math.PI, 0); ctx.fill(); ctx.stroke(); }
        if (this.doors.S) { ctx.beginPath(); ctx.arc(width/2, height-50, ds/2, 0, Math.PI); ctx.fill(); ctx.stroke(); }
        if (this.doors.E) { ctx.beginPath(); ctx.arc(width-50, height/2, ds/2, -Math.PI/2, Math.PI/2); ctx.fill(); ctx.stroke(); }
        if (this.doors.W) { ctx.beginPath(); ctx.arc(50, height/2, ds/2, Math.PI/2, -Math.PI/2); ctx.fill(); ctx.stroke(); }
        
        this.enemies.forEach(e => e.draw()); 
        this.pickups.forEach(p => p.draw());
        
        // Dibujo de Items
        this.items.forEach(it => {
            ctx.font = '42px serif'; ctx.textAlign = 'center'; ctx.fillText(it.icon, it.x, it.y);
            
            // Brillo de rareza
            ctx.shadowBlur = 15; ctx.shadowColor = it.color;
            ctx.fillStyle = it.isShop ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'; 
            ctx.beginPath(); ctx.arc(it.x, it.y, 35 + Math.sin(frameCount*0.08)*5, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;

            if (!it.isShop || player.coins < it.price) {
                ctx.fillStyle = it.color; ctx.font = 'bold 12px Georgia'; ctx.fillText(it.name, it.x, it.y + 50);
            }
            if (it.isShop) { 
                ctx.fillStyle = player.coins >= it.price ? '#eab308' : '#ef4444'; ctx.font = 'bold 16px Georgia'; ctx.fillText(`${it.price} ORO`, it.x, it.y + 70); 
            }
        });
        
        if (this.type === 'shop') { 
            ctx.fillStyle = '#b2945e'; ctx.font = 'bold 24px Georgia'; ctx.textAlign = 'center'; ctx.fillText("BAZAR ARCANO", width/2, 120); 
        }
    }
}

/* =========================================
   FUNCIONES DE MAZMORRA
   ========================================= */
function generateDungeon() {
    dungeon = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
    let x = 3, y = 3; currentPos = { x, y };
    const count = 10 + (currentFloor * 3); let c = 0;
    
    // Sala inicial
    dungeon[y][x] = new Room(x, y, 'start'); dungeon[y][x].visited = true;
    const walk = [{x, y}];
    
    // Generación por camino aleatorio (Random Walk)
    while (c < count) {
        let curr = walk[Math.floor(Math.random() * walk.length)];
        let dir = [[0,1],[0,-1],[1,0],[-1,0]][Math.floor(Math.random()*4)];
        let nx = curr.x + dir[0], ny = curr.y + dir[1];
        
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !dungeon[ny][nx]) {
            let type = 'combat'; 
            if (c === 4) type = 'item';
            if (c === 7 && currentFloor > 1) type = 'shop';
            if (c === count - 1) type = 'boss';
            
            dungeon[ny][nx] = new Room(nx, ny, type); walk.push({x: nx, y: ny}); c++;
        }
    }
    
    // Conexión de puertas
    for(let j=0; j<GRID_SIZE; j++) for(let i=0; i<GRID_SIZE; i++) {
        if (!dungeon[j][i]) continue;
        if (j > 0 && dungeon[j-1][i]) dungeon[j][i].doors.N = true;
        if (j < GRID_SIZE-1 && dungeon[j+1][i]) dungeon[j][i].doors.S = true;
        if (i > 0 && dungeon[j][i-1]) dungeon[j][i].doors.W = true;
        if (i < GRID_SIZE-1 && dungeon[j][i+1]) dungeon[j][i].doors.E = true;
    }
    currentRoom = dungeon[y][x];
}

function changeRoom(dx, dy) {
    currentPos.x += dx; currentPos.y += dy;
    currentRoom = dungeon[currentPos.y][currentPos.x]; 
    currentRoom.visited = true;
    
    // Posicionar al jugador en el lado opuesto de la puerta
    if (dx > 0) player.x = 110; else if (dx < 0) player.x = width - 110;
    if (dy > 0) player.y = 110; else if (dy < 0) player.y = height - 110;
    
    player.invul = 90;
    // Limpiar proyectiles al cambiar de sala
    if (typeof bullets !== 'undefined') bullets = [];
    if (typeof enemyBullets !== 'undefined') enemyBullets = [];
    
    updateHUD();
}