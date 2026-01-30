class Bullet {
    constructor(x, y, angle, playerOwned, syns = {}, speed = 8, damage = 1) {
        this.x = x; this.y = y; this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
        this.playerOwned = playerOwned; this.syns = { ...syns }; this.radius = playerOwned ? 5 : 6;
        this.color = playerOwned ? '#818cf8' : '#ef4444'; this.bounces = this.syns.bouncing ? 4 : 0;
        this.pierced = []; this.damage = damage; this.life = 400;
    }
    update() {
        // Lógica de teledirigido (Homing)
        if (this.syns.homing && this.playerOwned) {
            let target = null, minDist = 600;
            // Busca enemigos en la sala actual
            if (typeof currentRoom !== 'undefined' && currentRoom.enemies) {
                currentRoom.enemies.forEach(e => {
                    let d = Math.hypot(e.x - this.x, e.y - this.y);
                    if (d < minDist) { minDist = d; target = e; }
                });
            }
            if (target) {
                let angle = Math.atan2(target.y - this.y, target.x - this.x);
                this.vx += Math.cos(angle) * 0.7; this.vy += Math.sin(angle) * 0.7;
                let mag = Math.hypot(this.vx, this.vy);
                this.vx = (this.vx / mag) * 9; this.vy = (this.vy / mag) * 9;
            }
        }

        this.x += this.vx; this.y += this.vy; this.life--;
        
        // Rebotes en paredes
        let hitWall = false;
        if (typeof currentRoom !== 'undefined' && currentRoom.obstacles) {
            for (let obs of currentRoom.obstacles) {
                if (obs.type === 'wall') {
                    if (this.x + this.radius > obs.x && this.x - this.radius < obs.x + obs.w && this.y + this.radius > obs.y && this.y - this.radius < obs.y + obs.h) {
                        hitWall = true; this.x -= this.vx; this.y -= this.vy;
                        if (this.x < obs.x || this.x > obs.x + obs.w) this.vx *= -1; else this.vy *= -1;
                        this.bounces--; break;
                    }
                }
            }
        }

        // Rebotes en bordes del mapa
        if (!hitWall && this.bounces > 0) {
            const m = 45;
            if (this.x < m || this.x > width-m) { this.vx *= -1; this.bounces--; }
            if (this.y < m || this.y > height-m) { this.vy *= -1; this.bounces--; }
        }
        
        if (hitWall && this.bounces < 0) this.life = 0;
        
        // Partículas de estela
        if (frameCount % 2 === 0 && typeof particles !== 'undefined') {
            particles.push({ x: this.x, y: this.y, color: this.color, life: 0.5, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2 });
        }
    }
    draw() {
        ctx.fillStyle = this.color; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.x - this.radius*0.3, this.y - this.radius*0.3, this.radius*0.3, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    }
}