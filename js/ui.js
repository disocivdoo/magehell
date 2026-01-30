/* =========================================
   INTERFAZ DE USUARIO (UI)
   ========================================= */

// Actualiza toda la información visual del HUD
function updateHUD() {
    // 1. Actualizar Corazones
    const container = document.getElementById('hp-container');
    if (!container) return;
    container.innerHTML = '';
    
    const heartSVG = `<svg width="20" height="20" viewBox="0 0 24 24" class="heart-svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    
    if (typeof player !== 'undefined') {
        for(let i=0; i<player.maxHp; i++) {
            const heartWrap = document.createElement('div'); heartWrap.innerHTML = heartSVG;
            const path = heartWrap.querySelector('path'); 
            path.classList.add(i < player.hp ? 'heart-full' : 'heart-empty');
            container.appendChild(heartWrap.firstElementChild);
        }
        
        // 2. Stats Numéricos
        document.getElementById('coin-count').innerText = player.coins;
        document.getElementById('stat-damage').innerText = player.damage.toFixed(1);
        document.getElementById('stat-firerate').innerText = (60 / player.fireDelay).toFixed(1);
        document.getElementById('stat-speed').innerText = player.speed.toFixed(1);
        
        // 3. Lista de Items (Iconos pequeños)
        const list = document.getElementById('item-list');
        if (list) {
            list.innerHTML = '';
            player.items.forEach(it => {
                const icon = document.createElement('div');
                icon.className = 'w-7 h-7 flex items-center justify-center bg-opacity-40 rounded text-sm border';
                icon.style.backgroundColor = it.color + '40';
                icon.style.borderColor = it.color;
                icon.innerText = it.icon; 
                list.appendChild(icon);
            });
        }
    }

    // 4. Minimapa
    const mini = document.getElementById('minimap');
    if (!mini) return;
    mini.innerHTML = '';
    
    // GRID_SIZE y dungeon vienen de world.js
    if (typeof dungeon !== 'undefined' && typeof currentPos !== 'undefined') {
        for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) {
            const cell = document.createElement('div'); cell.className = 'minimap-cell';
            const r = dungeon[y][x];
            if (r) {
                if (x === currentPos.x && y === currentPos.y) cell.classList.add('active');
                else if (r.visited) {
                    cell.classList.add('visited'); 
                    if (r.type === 'boss') cell.classList.add('boss'); 
                    if (r.type === 'item') cell.classList.add('item'); 
                    if (r.type === 'shop') cell.classList.add('shop');
                }
            }
            mini.appendChild(cell);
        }
    }
    
    const info = document.getElementById('room-info');
    if(info && typeof currentFloor !== 'undefined') info.innerText = `PISO ${currentFloor}`;
}

// Aplicar un objeto al jugador y mostrar popup
function applyItem(item) {
    if (typeof player !== 'undefined') {
        item.mod(player); 
        player.items.push(item);
    }
    
    // Pausar juego para leer el item
    // Asumimos que GAME_STATES y currentState están en main.js (disponibles globalmente)
    if (typeof GAME_STATES !== 'undefined') currentState = GAME_STATES.PAUSE;
    
    const popup = document.getElementById('item-popup');
    
    // Configurar colores según rareza
    popup.style.borderColor = item.color;
    const tierLabel = document.getElementById('item-tier');
    tierLabel.innerText = item.tier === 4 ? "LEGENDARIO" : item.tier === 3 ? "RARO" : item.tier === 2 ? "POCO COMÚN" : "COMÚN";
    tierLabel.style.color = item.color;

    document.getElementById('overlay-screen').classList.remove('hidden');
    document.getElementById('start-content').classList.add('hidden');
    popup.classList.remove('hidden');
    
    document.getElementById('item-icon').innerText = item.icon; 
    document.getElementById('item-name').innerText = item.name; 
    document.getElementById('item-desc').innerText = item.desc;
    
    updateHUD();
}

function closeItemPopup() {
    document.getElementById('item-popup').classList.add('hidden'); 
    document.getElementById('overlay-screen').classList.add('hidden');
    if (typeof GAME_STATES !== 'undefined') currentState = GAME_STATES.PLAY;
    // requestAnimationFrame se llama en main.js, aquí solo cambiamos el estado
    if (typeof loop === 'function') requestAnimationFrame(loop);
}

function togglePause() {
    const pauseScreen = document.getElementById('pause-screen');
    const overlay = document.getElementById('overlay-screen');
    
    if (typeof currentState === 'undefined' || typeof GAME_STATES === 'undefined') return;

    if (currentState === GAME_STATES.PLAY) {
        currentState = GAME_STATES.PAUSE; 
        overlay.classList.remove('hidden'); 
        pauseScreen.classList.remove('hidden'); 
        document.getElementById('start-content').classList.add('hidden');
    } else if (currentState === GAME_STATES.PAUSE && !pauseScreen.classList.contains('hidden')) {
        currentState = GAME_STATES.PLAY; 
        overlay.classList.add('hidden'); 
        pauseScreen.classList.add('hidden'); 
        if (typeof loop === 'function') requestAnimationFrame(loop);
    }
}

function showClearFeedback() {
    const el = document.getElementById('room-clear');
    if(el) { 
        el.style.opacity = '1'; 
        setTimeout(() => { if (el) el.style.opacity = '0'; }, 2000); 
    }
    updateHUD();
}

function nextFloor() {
    if (typeof currentFloor !== 'undefined') currentFloor++;
    
    // MAX_FLOORS debería venir de main.js o definirse aquí. Lo usaremos global.
    const maxFloors = (typeof MAX_FLOORS !== 'undefined') ? MAX_FLOORS : 3;

    if (currentFloor > maxFloors) {
        if (typeof currentState !== 'undefined') currentState = 4; // GAME_STATES.WIN
        document.getElementById('start-content').classList.add('hidden');
        document.getElementById('win-screen').classList.remove('hidden');
        document.getElementById('overlay-screen').classList.remove('hidden');
        return;
    }
    
    // Mostrar intro del piso
    if (typeof isIntro !== 'undefined') isIntro = true;
    const intro = document.getElementById('floor-intro');
    document.getElementById('floor-title').innerText = `PISO ${currentFloor}`;
    const sub = currentFloor === 2 ? 'La Biblioteca Prohibida' : 'El Núcleo del Vacío';
    document.getElementById('floor-subtitle').innerText = sub;
    
    intro.style.opacity = '1';
    setTimeout(() => { 
        intro.style.opacity = '0'; 
        if (typeof isIntro !== 'undefined') isIntro = false; 
    }, 1500);
    
    // Regenerar mundo
    if (typeof generateDungeon === 'function') generateDungeon();
    
    // Resetear posición jugador
    if (typeof player !== 'undefined') {
        player.x = width/2; player.y = height/2;
    }
    
    // Limpiar proyectiles globales
    if (typeof bullets !== 'undefined') bullets = [];
    if (typeof enemyBullets !== 'undefined') enemyBullets = [];
    
    updateHUD();
}