// Tiers: 1=Común (Gris), 2=Poco Común (Verde), 3=Raro (Azul), 4=Legendario (Dorado)
const ITEMS = [
    // ==========================================
    // TIER 1 - COMÚN (Gris) - Mejoras básicas
    // ==========================================
    { id: 'dmg_small', name: 'Runa Desgastada', desc: '+0.5 Daño', icon: 'ᛟ', tier: 1, color: '#9ca3af', mod: (p) => p.damage += 0.5 },
    { id: 'spd_small', name: 'Botas Viejas', desc: '+Velocidad de Movimiento', icon: '👢', tier: 1, color: '#9ca3af', mod: (p) => { p.speed += 0.5; p.focusSpeed += 0.2; } },
    { id: 'fr_small', name: 'Página Suelta', desc: '+Velocidad de Ataque leve', icon: '📃', tier: 1, color: '#9ca3af', mod: (p) => { p.fireDelay = Math.max(4, p.fireDelay - 2); } },
    { id: 'apple', name: 'Manzana Roja', desc: 'Cura 1 Corazón', icon: '🍎', tier: 1, color: '#9ca3af', mod: (p) => p.hp = Math.min(p.hp + 1, p.maxHp) },
    { id: 'coin_pouch', name: 'Bolsa de Cobre', desc: '+10 Oro', icon: '💰', tier: 1, color: '#9ca3af', mod: (p) => p.coins += 10 },
    { id: 'wooden_shield', name: 'Escudo de Madera', desc: '+1 Contenedor de Vida', icon: '🛡️', tier: 1, color: '#9ca3af', mod: (p) => { p.maxHp += 1; p.hp += 1; } },
    { id: 'espresso', name: 'Café Negro', desc: '+Disparo, -Precisión leve', icon: '☕', tier: 1, color: '#9ca3af', mod: (p) => p.fireDelay = Math.max(5, p.fireDelay - 3) },
    { id: 'feather', name: 'Pluma de Cuervo', desc: '+Velocidad, +Agilidad', icon: '🪶', tier: 1, color: '#9ca3af', mod: (p) => { p.speed += 0.3; p.focusSpeed += 0.3; } },

    // ==========================================
    // TIER 2 - POCO COMÚN (Verde) - Mejoras notables
    // ==========================================
    { id: 'rubber', name: 'Espejo de Éter', desc: 'Hechizos rebotan una vez', icon: '🔮', tier: 2, color: '#4ade80', mod: (p) => p.synergies.bouncing = true },
    { id: 'hp_up', name: 'Cristal de Vida', desc: '+1 Contenedor, +Cura total', icon: '💚', tier: 2, color: '#4ade80', mod: (p) => { p.maxHp += 1; p.hp = p.maxHp; } },
    { id: 'dmg_med', name: 'Pergamino de Fuego', desc: '+1.0 Daño', icon: '🔥', tier: 2, color: '#4ade80', mod: (p) => p.damage += 1.0 },
    { id: 'iron_armor', name: 'Cota de Malla', desc: '+2 Vida Max, -Velocidad', icon: '🧥', tier: 2, color: '#4ade80', mod: (p) => { p.maxHp += 2; p.hp += 2; p.speed -= 0.5; } },
    { id: 'sharp_knife', name: 'Cuchillo Afilado', desc: '+1.5 Daño', icon: '🔪', tier: 2, color: '#4ade80', mod: (p) => p.damage += 1.5 },
    { id: 'gem_box', name: 'Caja de Joyas', desc: '+25 Oro', icon: '💎', tier: 2, color: '#4ade80', mod: (p) => p.coins += 25 },
    { id: 'thunder_boots', name: 'Botas de Trueno', desc: '+Velocidad considerable', icon: '⚡', tier: 2, color: '#4ade80', mod: (p) => { p.speed += 1.2; } },
    { id: 'blood_ring', name: 'Anillo de Sangre', desc: '+2 Daño, -1 Vida Max', icon: '💍', tier: 2, color: '#4ade80', mod: (p) => { p.damage += 2; p.maxHp = Math.max(1, p.maxHp - 1); if(p.hp > p.maxHp) p.hp = p.maxHp; } },

    // ==========================================
    // TIER 3 - RARO (Azul) - Cambios de mecánica
    // ==========================================
    { id: 'piercing', name: 'Daga de Sombras', desc: 'Hechizos atraviesan enemigos', icon: '🗡️', tier: 3, color: '#60a5fa', mod: (p) => p.synergies.piercing = true },
    { id: 'split', name: 'Cristal Fractal', desc: 'Fragmentación al impactar', icon: '❄️', tier: 3, color: '#60a5fa', mod: (p) => p.synergies.split = true },
    { id: 'vampire', name: 'Cáliz de Sangre', desc: 'Probabilidad de curar al matar', icon: '🍷', tier: 3, color: '#60a5fa', mod: (p) => p.synergies.vampirism = true },
    { id: 'cursed_skull', name: 'Cráneo Maldito', desc: '+4 Daño, Vida Max se reduce a la mitad', icon: '💀', tier: 3, color: '#60a5fa', mod: (p) => { p.damage += 4; p.maxHp = Math.max(1, Math.floor(p.maxHp / 2)); if(p.hp > p.maxHp) p.hp = p.maxHp; } },
    { id: 'treasure_chest', name: 'Cofre del Rey', desc: '+60 Oro', icon: '👑', tier: 3, color: '#60a5fa', mod: (p) => p.coins += 60 },
    { id: 'gatling_gear', name: 'Engranaje Arcano', desc: 'Disparo ultra rápido, -Daño', icon: '⚙️', tier: 3, color: '#60a5fa', mod: (p) => { p.fireDelay = Math.max(3, p.fireDelay - 10); p.damage *= 0.7; } },
    { id: 'barrier_rune', name: 'Runa de Barrera', desc: '+3 Contenedores de Vida', icon: '💠', tier: 3, color: '#60a5fa', mod: (p) => { p.maxHp += 3; p.hp += 3; } },

    // ==========================================
    // TIER 4 - LEGENDARIO (Dorado) - Poderes divinos
    // ==========================================
    { id: 'homing', name: 'Ojo de Vidente', desc: 'Hechizos teledirigidos', icon: '👁️', tier: 4, color: '#fbbf24', mod: (p) => p.synergies.homing = true },
    { id: 'multishot', name: 'Báculo de Hidra', desc: '+2 Proyectiles adicionales', icon: '🔱', tier: 4, color: '#fbbf24', mod: (p) => p.multishot += 2 },
    { id: 'minigun', name: 'Alma de la Tormenta', desc: 'Velocidad de ataque extrema', icon: '🌪️', tier: 4, color: '#fbbf24', mod: (p) => { p.fireDelay = 4; } },
    { id: 'phoenix_feather', name: 'Pluma de Fénix', desc: 'Cura total, +Max Vida, +Velocidad', icon: '🔥', tier: 4, color: '#fbbf24', mod: (p) => { p.maxHp += 2; p.hp = p.maxHp; p.speed += 1.5; } },
    { id: 'chronos_glass', name: 'Reloj de Chronos', desc: 'Disparas al límite físico posible', icon: '⏳', tier: 4, color: '#fbbf24', mod: (p) => { p.fireDelay = 3; } },
    { id: 'oblivion_orb', name: 'Orbe del Olvido', desc: '+5 Daño puro', icon: '⚫', tier: 4, color: '#fbbf24', mod: (p) => p.damage += 5.0 },
    { id: 'emperor_crown', name: 'Corona del Emperador', desc: '+Todos los atributos', icon: '✨', tier: 4, color: '#fbbf24', mod: (p) => { p.damage += 2; p.speed += 1; p.maxHp += 2; p.hp += 2; p.fireDelay -= 2; p.coins += 20; } }
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