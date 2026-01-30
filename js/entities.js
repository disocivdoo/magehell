/* =========================================
   JUGADOR (PLAYER)
   ========================================= */
class Player {
    constructor() { this.reset(); }
    
    reset() {
        this.x = width/2; this.y = height/2;
        this.hp = 3; this.maxHp = 6;
        this.speed = 5.0; this.focusSpeed = 2.0;
        this.fireDelay = 20; this.lastFire = 0;
        this.hitbox = 4;
        this.invul = 0;
        this.multishot = 1;
        this.damage = 1;
        this.coins = 0;
        this.synergies = { bouncing: false, piercing: false, split: false, homing: false, vampirism: false };
        this.items = [];
    }

    update() {
        if (this.invul > 0) this.invul--;
        
        // Movimiento
        const isFocus = keys['ShiftLeft'] || keys['ShiftRight'];
        let s = isFocus ? this.focusSpeed : this.speed;
        
        // Mostrar indicador de "Modo Precisión" en la UI
        const focusUI = document.getElementById('focus-indicator');
        if (focusUI) focusUI.style.display = isFocus ? 'block' : 'none';

        let dx = 0, dy = 0;
        if (keys['KeyW'] || keys['ArrowUp']) dy -= s;
        if (keys['KeyS'] || keys['ArrowDown']) dy += s;
        if (keys['KeyA'] || keys['ArrowLeft']) dx -= s;
        if (keys['KeyD'] || keys['ArrowRight']) dx += s;

        const newX = this.x + dx; if (this.canMove(newX, this.y)) this.x = newX;
        const newY = this.y + dy; if (this.canMove(this.x, newY)) this.y = newY;

        // Mantener dentro del canvas
        const m = 50; 
        this.x = Math.max(m, Math.min(width - m, this.x)); 
        this.y = Math.max(m, Math.min(height - m, this.y));

        // Disparo automático
        if (frameCount - this.lastFire > this.fireDelay) { this.shoot(); this.lastFire = frameCount; }

        this.checkDoorTransition();
    }

    canMove(x, y) {
        if (x < 50 || x > width - 50 || y < 50 || y > height - 50) return true; 
        if (typeof currentRoom !== 'undefined' && currentRoom.obstacles) {
            for (let obs of currentRoom.obstacles) {
                if (x + 8 > obs.x && x - 8 < obs.x + obs.w && y + 8 > obs.y && y - 8 < obs.y + obs.h) return false;
            }
        }
        return true;
    }

    shoot() {
        const baseAngle = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
        const spread = 0.22;
        const startAngle = baseAngle - ((this.multishot - 1) * spread) / 2;
        
        for (let i = 0; i < this.multishot; i++) {
            const angle = startAngle + (i * spread);
            bullets.push(new Bullet(this.x, this.y, angle, true, this.synergies, 8.5, this.damage));
        }
    }

    checkDoorTransition() {
        if (typeof currentRoom === 'undefined' || !currentRoom.cleared) return;
        const gate = 65;
        if (this.y < gate && currentRoom.doors.N) changeRoom(0, -1);
        if (this.y > height - gate && currentRoom.doors.S) changeRoom(0, 1);
        if (this.x < gate && currentRoom.doors.W) changeRoom(-1, 0);
        if (this.x > width - gate && currentRoom.doors.E) changeRoom(1, 0);
    }

    takeDamage() {
        if (this.invul > 0) return;
        this.hp--;
        this.invul = 80;
        createExplosion(this.x, this.y, '#f87171', 20);
        updateHUD();
        
        if (this.hp <= 0) {
            // Muerte
            currentState = 3; // GAME_STATES.DEATH (Usamos 3 directo por si no se ha cargado main.js aun)
            document.getElementById('start-content').classList.add('hidden');
            document.getElementById('death-screen').classList.remove('hidden');
            document.getElementById('overlay-screen').classList.remove('hidden');
            // Nota: animationId es global, se define en main.js
            if (typeof animationId !== 'undefined' && animationId) cancelAnimationFrame(animationId);
        }
    }

    draw() {
        ctx.save();
        if (this.invul > 0 && frameCount % 4 < 2) ctx.globalAlpha = 0.3;
        ctx.translate(this.x, this.y);
        
        const angleToMouse = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
        const isFacingLeft = angleToMouse < -Math.PI / 2 || angleToMouse > Math.PI / 2;
        
        // Dibujo del Mago
        // Túnica
        ctx.fillStyle = '#312e81'; ctx.beginPath(); ctx.moveTo(-14, 15); ctx.lineTo(14, 15); ctx.lineTo(8, -5); ctx.lineTo(-8, -5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#b2945e'; ctx.lineWidth = 1.5; ctx.stroke();
        // Mangas
        ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.arc(8, 5, 5, 0, Math.PI * 2); ctx.arc(-8, 5, 5, 0, Math.PI * 2); ctx.fill();
        // Cabeza
        ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.arc(0, -8, 7, 0, Math.PI * 2); ctx.fill();
        // Barba
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
        // Sombrero
        ctx.save(); ctx.rotate(isFacingLeft ? -0.1 : 0.1); ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.moveTo(-16, -12); ctx.lineTo(16, -12); ctx.lineTo(0, -35); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#b2945e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, -16); ctx.lineTo(9, -16); ctx.stroke(); ctx.restore();
        
        // Báculo
        ctx.save(); ctx.rotate(angleToMouse); ctx.strokeStyle = '#4b2e1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(25, 5); ctx.stroke();
        ctx.fillStyle = '#6366f1'; ctx.shadowBlur = 10; ctx.shadowColor = '#6366f1'; ctx.beginPath(); ctx.arc(28, 5, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
        
        // Hitbox Indicator (Shift)
        const isFocus = keys['ShiftLeft'] || keys['ShiftRight'];
        ctx.fillStyle = isFocus ? '#fff' : 'rgba(99, 102, 241, 0.5)'; ctx.shadowBlur = isFocus ? 15 : 0; ctx.shadowColor = '#fff';
        ctx.beginPath(); ctx.arc(0, 0, this.hitbox, 0, Math.PI * 2); ctx.fill();
        
        if (isFocus) { 
            ctx.restore(); ctx.save(); ctx.translate(this.x, this.y); 
            ctx.strokeStyle = 'rgba(178, 148, 94, 0.8)'; ctx.setLineDash([3, 5]); 
            ctx.beginPath(); ctx.arc(0, 0, 25, frameCount * 0.05, frameCount * 0.05 + Math.PI * 2); ctx.stroke(); 
        }
        ctx.restore();
    }
}

/* =========================================
   ENEMIGOS (ENEMY)
   ========================================= */
class Enemy {
    constructor(type, floor) {
        this.type = type;
        this.floor = floor;
        // Posición aleatoria segura (lejos de bordes)
        this.x = Math.random() * (width - 300) + 150;
        this.y = Math.random() * (height - 300) + 150;
        
        const hpMulti = 1 + (floor * 0.5);
        if (type.startsWith('boss')) { this.hp = 120 * hpMulti; this.radius = 55; } 
        else if (type === 'guard') { this.hp = 15 * hpMulti; this.radius = 28; } 
        else if (type === 'bat') { this.hp = 4 * hpMulti; this.radius = 12; } 
        else { this.hp = 8 * hpMulti; this.radius = 22; }
        
        this.maxHp = this.hp;
        this.timer = Math.floor(Math.random() * 100);
        
        // Evitar spawnear dentro de paredes
        if (typeof currentRoom !== 'undefined' && currentRoom.obstacles) {
            for(let i=0; i<3; i++) {
               if (this.isInWall()) { 
                   this.x = Math.random() * (width - 200) + 100; 
                   this.y = Math.random() * (height - 200) + 100; 
               }
            }
        }
    }

    isInWall() {
        if (!currentRoom || !currentRoom.obstacles) return false;
        for (let obs of currentRoom.obstacles) {
            if (obs.type === 'wall' && this.x + this.radius > obs.x && this.x - this.radius < obs.x + obs.w && this.y + this.radius > obs.y && this.y - this.radius < obs.y + obs.h) return true;
        }
        return false;
    }

    update() {
        this.timer++;
        // Vibración si está atascado en pared
        if (this.isInWall()) { this.x += (Math.random()-0.5)*2; this.y += (Math.random()-0.5)*2; }

        if (this.type === 'bat') {
            // IA Murciélago: Se acerca oscilando
            this.x += Math.sin(this.timer * 0.1) * 2; this.y += Math.cos(this.timer * 0.1) * 2;
            if (this.timer % 40 === 0) { 
                const angle = Math.atan2(player.y - this.y, player.x - this.x); 
                enemyBullets.push(new Bullet(this.x, this.y, angle, false, {}, 6)); 
            }
        }
        
        if (this.type === 'basic' && this.timer % (70 - this.floor*5) === 0) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x); 
            enemyBullets.push(new Bullet(this.x, this.y, angle, false, {}, 4.0));
        }
        
        if (this.type === 'sniper' && this.timer % 120 === 0) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x); 
            enemyBullets.push(new Bullet(this.x, this.y, angle, false, {}, 12.0));
        }
        
        if (this.type === 'guard' && this.timer % 90 === 0) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x); 
            for(let i=-1; i<=1; i++) enemyBullets.push(new Bullet(this.x, this.y, angle + (i*0.2), false, {}, 5.0));
        }
        
        if (this.type === 'spiral' && this.timer % 5 === 0) {
            const angle = this.timer * 0.18; 
            enemyBullets.push(new Bullet(this.x, this.y, angle, false, {}, 3.5));
        }
        
        // Lógica de Jefes
        if (this.type.startsWith('boss')) {
            if (this.type === 'boss1') {
                if (this.timer % 80 === 0) { for(let i=0; i<12; i++) enemyBullets.push(new Bullet(this.x, this.y, (Math.PI*2/12)*i, false, {}, 3)); }
                if (this.timer % 100 === 0) { const angle = Math.atan2(player.y - this.y, player.x - this.x); enemyBullets.push(new Bullet(this.x, this.y, angle, false, {}, 6)); }
            } else if (this.type === 'boss2') {
                if (this.timer % 4 === 0) { const angle = this.timer * 0.2; enemyBullets.push(new Bullet(this.x, this.y, angle, false, {}, 4)); enemyBullets.push(new Bullet(this.x, this.y, angle + Math.PI, false, {}, 4)); }
            } else if (this.type === 'boss3') {
                if (this.timer % 60 === 0) { for(let i=0; i<20; i++) enemyBullets.push(new Bullet(this.x, this.y, (Math.PI*2/20)*i + (this.timer*0.01), false, {}, 3.5)); }
                if (this.timer % 10 === 0) { const offset = Math.sin(this.timer * 0.1) * 1.5; enemyBullets.push(new Bullet(this.x, this.y, offset, false, {}, 7)); enemyBullets.push(new Bullet(this.x, this.y, offset + Math.PI, false, {}, 7)); }
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Renderizado según tipo
        if (this.type === 'bat') {
            ctx.fillStyle = '#581c87'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(10, 0); ctx.lineTo(0, 8); ctx.lineTo(-10, 0); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-3, -2, 2, 0, Math.PI*2); ctx.arc(3, -2, 2, 0, Math.PI*2); ctx.fill();
        } else if (this.type === 'sniper') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x); ctx.rotate(angle);
            ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-10, 8); ctx.lineTo(-10, -8); ctx.fill();
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(100,0); ctx.stroke();
        } else if (this.type === 'guard') {
            ctx.fillStyle = '#3f6212'; ctx.fillRect(-14, -14, 28, 28); ctx.strokeStyle = '#84cc16'; ctx.strokeRect(-14, -14, 28, 28);
        } else if (this.type === 'basic') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x); ctx.rotate(angle);
            ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.fillRect(0, -3, 8, 2); 
            ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, -12); ctx.lineTo(24, 0); ctx.lineTo(8, 12); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (this.type === 'spiral') {
            ctx.rotate(this.timer * 0.08); ctx.strokeStyle = '#d946ef'; ctx.lineWidth = 2; ctx.beginPath(); for(let i=0; i<3; i++) { const rOffset = (Math.PI*2/3)*i; const rx = Math.cos(rOffset) * 20; const ry = Math.sin(rOffset) * 20; ctx.moveTo(rx, ry); ctx.lineTo(0,0); } ctx.stroke();
            ctx.fillStyle = '#4a044e'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
        } else if (this.type.startsWith('boss')) {
            const isFinal = this.type === 'boss3'; const color = isFinal ? '#ef4444' : (this.type === 'boss2' ? '#a855f7' : '#eab308');
            ctx.rotate(this.timer * 0.02); ctx.strokeStyle = color; ctx.lineWidth = 4;
            ctx.beginPath(); for(let i=0; i<8; i++) { const a = (Math.PI*2/8)*i; const r = i%2===0 ? this.radius : this.radius*0.6; ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); } ctx.closePath(); ctx.stroke();
            ctx.fillStyle = '#1a1a1a'; ctx.fill(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
        
        // Barra de Vida
        const barColor = this.type.startsWith('boss') ? '#ef4444' : '#dc2626'; const yOff = this.radius + 10;
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(this.x - 15, this.y + yOff, 30, 4);
        ctx.fillStyle = barColor; ctx.fillRect(this.x - 15, this.y + yOff, 30 * (this.hp / this.maxHp), 4);
    }
}