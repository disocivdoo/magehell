// Tiers: 1=Común (Gris), 2=Poco Común (Verde), 3=Raro (Azul), 4=Legendario (Dorado)
const ITEMS = [
    // TIER 1 - COMÚN
    { id: 'dmg_small', name: 'Runa Desgastada', desc: '+0.5 Daño', icon: 'ᛟ', tier: 1, color: '#9ca3af', mod: (p) => p.damage += 0.5 },
    { id: 'spd_small', name: 'Botas Viejas', desc: '+Velocidad de Movimiento', icon: '👢', tier: 1, color: '#9ca3af', mod: (p) => { p.speed += 0.5; p.focusSpeed += 0.2; } },
    { id: 'fr_small', name: 'Pagina Suelta', desc: '+Velocidad de Ataque leve', icon: '📃', tier: 1, color: '#9ca3af', mod: (p) => { p.fireDelay = Math.max(4, p.fireDelay - 2); } },
    
    // TIER 2 - POCO COMÚN
    { id: 'rubber', name: 'Espejo de Éter', desc: 'Hechizos rebotan una vez', icon: '🔮', tier: 2, color: '#4ade80', mod: (p) => p.synergies.bouncing = true },
    { id: 'hp_up', name: 'Cristal de Vida', desc: '+1 Contenedor de Vida', icon: '❤️', tier: 2, color: '#4ade80', mod: (p) => { p.maxHp += 1; p.hp += 1; } },
    { id: 'dmg_med', name: 'Pergamino de Fuego', desc: '+1.0 Daño', icon: '🔥', tier: 2, color: '#4ade80', mod: (p) => p.damage += 1.0 },
    
    // TIER 3 - RARO
    { id: 'piercing', name: 'Daga de Sombras', desc: 'Hechizos atraviesan enemigos', icon: '🗡️', tier: 3, color: '#60a5fa', mod: (p) => p.synergies.piercing = true },
    { id: 'split', name: 'Cristal Fractal', desc: 'Fragmentación al impactar', icon: '❄️', tier: 3, color: '#60a5fa', mod: (p) => p.synergies.split = true },
    { id: 'vampire', name: 'Cáliz de Sangre', desc: 'Probabilidad de curar al matar', icon: '🍷', tier: 3, color: '#60a5fa', mod: (p) => p.synergies.vampirism = true },
    
    // TIER 4 - LEGENDARIO
    { id: 'homing', name: 'Ojo de Vidente', desc: 'Hechizos teledirigidos', icon: '👁️', tier: 4, color: '#fbbf24', mod: (p) => p.synergies.homing = true },
    { id: 'multishot', name: 'Báculo de Hidra', desc: '+2 Proyectiles', icon: '🔱', tier: 4, color: '#fbbf24', mod: (p) => p.multishot += 2 },
    { id: 'minigun', name: 'Alma de la Tormenta', desc: 'Velocidad de ataque extrema', icon: '⚡', tier: 4, color: '#fbbf24', mod: (p) => { p.fireDelay = Math.max(3, p.fireDelay - 8); } }
];

class Pickup {
    constructor(x, y, type) { this.x = x; this.y = y; this.type = type; this.timer = 0; }
    update() { this.timer++; }
    draw() {
        const b = Math.sin(this.timer * 0.1) * 3;
        if (this.type === 'portal') {
            ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.timer * 0.05); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.rect(-15, -15, 30, 30); ctx.stroke(); ctx.rotate(Math.PI/4); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.rect(-10, -10, 20, 20); ctx.stroke(); ctx.restore();
            ctx.fillStyle = '#fff'; ctx.font = '10px serif'; ctx.textAlign = 'center'; ctx.fillText("SIGUIENTE PISO", this.x, this.y - 25 + b);
        } else if (this.type === 'health') {
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(this.x, this.y+b, 6, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(this.x, this.y+b, 5, 0, Math.PI*2); ctx.fill();
        }
    }
}