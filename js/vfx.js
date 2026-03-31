// VFX/animation module (stage 1 split)
function showDmgFloat(dmg, isCrit, isPlayer) {
    const battleArea = document.getElementById('battle-area');
    if (!battleArea) return;
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;font-weight:900;font-size:${isCrit?'3.2em':'1.4em'};color:${isPlayer?'#ff4757':isCrit?'#f1c40f':'#2ed573'};text-shadow:0 0 16px ${isCrit?'#f1c40f':'transparent'};pointer-events:none;z-index:999;left:${isPlayer?'10%':'55%'};top:25%;animation:dmgFloat 1s ease forwards;`;
    el.innerText = `${isCrit?'💥':''}${dmg}`;
    battleArea.style.position = 'relative';
    battleArea.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
}
function triggerCritEffect() {
    const s = document.querySelector('.screen');
    if (s) {
        s.classList.add('crit-flash');
        s.classList.add('crit-blackout');
        setTimeout(() => s.classList.remove('crit-blackout'), 150);
        setTimeout(() => s.classList.remove('crit-flash'), 500);
    }
}
function triggerShakeEffect() {
    const e = document.getElementById('e-hp');
    if (e) { e.classList.add('shake'); setTimeout(() => e.classList.remove('shake'), 400); }
}
function triggerScreenShakeHeavy() {
    const s = document.querySelector('.screen');
    if (s) {
        s.classList.add('heavy-shake');
        setTimeout(() => s.classList.remove('heavy-shake'), 220);
    }
}
function triggerScreenShakeBoss() {
    const s = document.querySelector('.screen');
    if (!s) return;
    s.classList.add('shake');
    setTimeout(() => s.classList.remove('shake'), 800);
}
function triggerBossDim() {
    const s = document.querySelector('.screen');
    if (!s) return;
    s.style.position = 'relative';
    s.classList.add('boss-dimming');
    setTimeout(() => s.classList.remove('boss-dimming'), 320);
}
function triggerGuardAura() {
    const c = document.getElementById('player-card');
    if (!c) return;
    c.classList.add('guard-aura');
    setTimeout(() => c.classList.remove('guard-aura'), 320);
}
function triggerDodgeMove(side) {
    const c = document.getElementById(side === 'player' ? 'player-card' : 'enemy-card');
    if (!c) return;
    c.classList.add('dodge-move');
    setTimeout(() => c.classList.remove('dodge-move'), 180);
}
function ensureCombatFxLayer() {
    const ba = document.getElementById('battle-area');
    if (!ba) return null;
    let layer = document.getElementById('combat-fx-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'combat-fx-layer';
        layer.className = 'combat-fx-layer';
        ba.style.position = 'relative';
        ba.appendChild(layer);
    }
    return layer;
}
function getCardCenter(side) {
    const card = document.getElementById(side === 'player' ? 'player-card' : 'enemy-card');
    const ba = document.getElementById('battle-area');
    if (!card || !ba) return null;
    const cr = card.getBoundingClientRect();
    const br = ba.getBoundingClientRect();
    return {
        x: cr.left + cr.width / 2 - br.left,
        y: cr.top + cr.height / 2 - br.top,
    };
}
function normalizeCombatArchetype(jobName) {
    const n = String(jobName || '');
    if (n.includes('마법사') || n.includes('위저드') || n.includes('Mage')) return 'mage';
    if (n.includes('헌터') || n.includes('암살자') || n.includes('궁수') || n.includes('Hunter')) return 'hunter';
    if (n.includes('버서커') || n.includes('워리어') || n.includes('Berserker')) return 'berserker';
    return 'berserker';
}
function playMageBoltVfx(fromSide, toSide) {
    const layer = ensureCombatFxLayer();
    const from = getCardCenter(fromSide);
    const to = getCardCenter(toSide);
    if (!layer || !from || !to) return Promise.resolve();
    return new Promise((resolve) => {
        const bolt = document.createElement('div');
        bolt.className = 'mage-bolt';
        bolt.style.left = `${from.x - 6}px`;
        bolt.style.top = `${from.y - 6}px`;
        bolt.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
        layer.appendChild(bolt);
        requestAnimationFrame(() => {
            bolt.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y}px)`;
            bolt.style.opacity = '0.35';
        });
        setTimeout(() => {
            if (bolt.parentNode) bolt.parentNode.removeChild(bolt);
            const ex = document.createElement('div');
            ex.className = 'mage-explosion';
            ex.style.left = `${to.x}px`;
            ex.style.top = `${to.y}px`;
            layer.appendChild(ex);
            setTimeout(() => {
                if (ex.parentNode) ex.parentNode.removeChild(ex);
                resolve();
            }, 430);
        }, 400);
    });
}
function playBerserkerChargeVfx(fromSide, toSide) {
    const layer = ensureCombatFxLayer();
    const to = getCardCenter(toSide);
    if (!layer || !to) return Promise.resolve();
    return new Promise((resolve) => {
        const slash = document.createElement('div');
        slash.className = 'slash-effect';
        slash.style.left = `${to.x}px`;
        slash.style.top = `${to.y}px`;
        layer.appendChild(slash);
        triggerScreenShakeHeavy();
        setTimeout(() => {
            if (slash.parentNode) slash.parentNode.removeChild(slash);
            resolve();
        }, 120);
    });
}
function playHunterStrikeVfx(fromSide, toSide) {
    const layer = ensureCombatFxLayer();
    const to = getCardCenter(toSide);
    if (!layer || !to) return Promise.resolve();
    return new Promise((resolve) => {
        const slash = document.createElement('div');
        slash.className = 'slash-effect';
        slash.style.left = `${to.x + 10}px`;
        slash.style.top = `${to.y + 2}px`;
        layer.appendChild(slash);
        triggerScreenShakeHeavy();
        setTimeout(() => {
            if (slash.parentNode) slash.parentNode.removeChild(slash);
            resolve();
        }, 120);
    });
}
function playMagicBurstVfx(targetSide) {
    const layer = ensureCombatFxLayer();
    const to = getCardCenter(targetSide);
    if (!layer || !to) return Promise.resolve();
    return new Promise((resolve) => {
        const burst = document.createElement('div');
        burst.className = 'magic-burst';
        burst.style.left = `${to.x}px`;
        burst.style.top = `${to.y}px`;
        layer.appendChild(burst);
        const particles = [];
        for (let i = 0; i < 14; i++) {
            const p = document.createElement('div');
            p.className = 'magic-particle';
            p.style.left = `${to.x}px`;
            p.style.top = `${to.y}px`;
            const ang = (Math.PI * 2 * i) / 14;
            const dist = 36 + Math.random() * 52;
            p.style.transition = 'transform 0.36s ease-out, opacity 0.36s ease-out';
            layer.appendChild(p);
            particles.push({ el: p, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist });
        }
        requestAnimationFrame(() => {
            particles.forEach((x) => {
                x.el.style.transform = `translate(${x.dx}px, ${x.dy}px) scale(0.2)`;
                x.el.style.opacity = '0';
            });
        });
        triggerScreenShakeHeavy();
        setTimeout(() => {
            if (burst.parentNode) burst.parentNode.removeChild(burst);
            particles.forEach((x) => { if (x.el.parentNode) x.el.parentNode.removeChild(x.el); });
            resolve();
        }, 390);
    });
}
function playAssassinStrikeVfx(targetSide) {
    const layer = ensureCombatFxLayer();
    const to = getCardCenter(targetSide);
    if (!layer || !to) return;
    const slash = document.createElement('div');
    slash.className = 'assassin-strike';
    slash.style.left = `${to.x}px`;
    slash.style.top = `${to.y + 2}px`;
    layer.appendChild(slash);
    triggerScreenShakeHeavy();
    setTimeout(() => {
        if (slash.parentNode) slash.parentNode.removeChild(slash);
    }, 360);
}
function playCritGoldBurst(targetSide) {
    const layer = ensureCombatFxLayer();
    const to = getCardCenter(targetSide);
    if (!layer || !to) return;
    const burst = document.createElement('div');
    burst.className = 'crit-gold-burst';
    burst.style.left = `${to.x}px`;
    burst.style.top = `${to.y}px`;
    layer.appendChild(burst);
    setTimeout(() => {
        if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 330);
}
function playBossStrikeVfx(targetSide) {
    const layer = ensureCombatFxLayer();
    const to = getCardCenter(targetSide);
    if (!layer || !to) return Promise.resolve();
    return new Promise((resolve) => {
        triggerBossDim();
        setTimeout(() => {
            const slash = document.createElement('div');
            slash.className = 'boss-strike';
            slash.style.left = `${to.x}px`;
            slash.style.top = `${to.y + 4}px`;
            layer.appendChild(slash);
            triggerScreenShakeBoss();
            setTimeout(() => {
                if (slash.parentNode) slash.parentNode.removeChild(slash);
                resolve();
            }, 360);
        }, 300);
    });
}
function showMissFloat(targetSide) {
    const battleArea = document.getElementById('battle-area');
    const p = getCardCenter(targetSide);
    if (!battleArea || !p) return;
    const el = document.createElement('div');
    el.style.cssText =
        `position:absolute;left:${p.x - 20}px;top:${p.y - 30}px;font-weight:900;font-size:1.05em;color:#9aa0aa;text-shadow:0 0 8px rgba(0,0,0,0.5);pointer-events:none;z-index:1300;animation:dmgFloat 0.9s ease forwards;`;
    el.innerText = 'MISS';
    battleArea.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 920);
}
function playJobAttackVfx(attackerSide, jobName) {
    const archetype = normalizeCombatArchetype(jobName);
    if (archetype === 'mage') {
        const targetSide = attackerSide === 'player' ? 'enemy' : 'player';
        return playMageBoltVfx(attackerSide, targetSide).then(() => playMagicBurstVfx(targetSide));
    }
    if (archetype === 'hunter' && attackerSide === 'player') {
        return playBerserkerChargeVfx(attackerSide, 'enemy');
    }
    if (archetype === 'hunter') return playHunterStrikeVfx(attackerSide, attackerSide === 'player' ? 'enemy' : 'player');
    return playBerserkerChargeVfx(attackerSide, attackerSide === 'player' ? 'enemy' : 'player');
}
function consumeHunterEvasionMissPenalty() {
    if (!enemy || !String(enemy.job || '').includes('헌터')) return 0;
    const turns = safeNum(enemy._hunterEvasionTurns, 0);
    if (turns <= 0) return 0;
    enemy._hunterEvasionTurns = Math.max(0, turns - 1);
    writeLog('[헌터 AI] 회피 자세! 이번 공격은 빗나가기 쉬워졌습니다. (빗나감 확률 +50%)');
    return 50;
}

window.showDmgFloat = showDmgFloat;
window.triggerCritEffect = triggerCritEffect;
window.triggerShakeEffect = triggerShakeEffect;
window.triggerScreenShakeHeavy = triggerScreenShakeHeavy;
window.triggerScreenShakeBoss = triggerScreenShakeBoss;
window.triggerBossDim = triggerBossDim;
window.triggerGuardAura = triggerGuardAura;
window.triggerDodgeMove = triggerDodgeMove;
window.ensureCombatFxLayer = ensureCombatFxLayer;
window.getCardCenter = getCardCenter;
window.normalizeCombatArchetype = normalizeCombatArchetype;
window.playMageBoltVfx = playMageBoltVfx;
window.playBerserkerChargeVfx = playBerserkerChargeVfx;
window.playHunterStrikeVfx = playHunterStrikeVfx;
window.playMagicBurstVfx = playMagicBurstVfx;
window.playAssassinStrikeVfx = playAssassinStrikeVfx;
window.playCritGoldBurst = playCritGoldBurst;
window.playBossStrikeVfx = playBossStrikeVfx;
window.showMissFloat = showMissFloat;
window.playJobAttackVfx = playJobAttackVfx;
window.consumeHunterEvasionMissPenalty = consumeHunterEvasionMissPenalty;
