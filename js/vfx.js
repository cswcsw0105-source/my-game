// VFX/animation module (stage 1 split)
const PREMIUM_VFX_DEFAULT_MS = 980;

function getCombatTargetCard(side) {
    return document.getElementById(side === 'player' ? 'player-card' : 'enemy-card');
}

const removeVfxElement = (element) => {
    if (!element) return;
    if (typeof element.remove === 'function') {
        element.remove();
        return;
    }
    if (element.parentNode) element.parentNode.removeChild(element);
};

const scheduleVfxRemoval = (element, durationMs) => {
    if (!element) return null;
    const timeoutMs = Math.max(120, Number(durationMs) || PREMIUM_VFX_DEFAULT_MS);
    let removed = false;
    const cleanup = () => {
        if (removed) return;
        removed = true;
        element.removeEventListener('animationend', onAnimationEnd);
        removeVfxElement(element);
    };
    const onAnimationEnd = (event) => {
        if (event && event.target !== element) return;
        setTimeout(cleanup, 0);
    };
    element.addEventListener('animationend', onAnimationEnd);
    return setTimeout(cleanup, timeoutMs);
};

const pulseCombatCardClass = (side, className, durationMs) => {
    const card = getCombatTargetCard(side);
    if (!card || !className) return;
    card.classList.remove(className);
    void card.offsetWidth;
    card.classList.add(className);
    setTimeout(() => card.classList.remove(className), Math.max(120, Number(durationMs) || 240));
};

function ensureCombatFxLayer() {
    const battleArea = document.getElementById('battle-area');
    if (!battleArea) return null;
    let layer = document.getElementById('combat-fx-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'combat-fx-layer';
        layer.className = 'combat-fx-layer';
        battleArea.classList.add('combat-stage');
        battleArea.appendChild(layer);
    }
    return layer;
}

function getCardCenter(side) {
    const card = getCombatTargetCard(side);
    const battleArea = document.getElementById('battle-area');
    if (!card || !battleArea) return null;
    const cardRect = card.getBoundingClientRect();
    const battleRect = battleArea.getBoundingClientRect();
    return {
        x: cardRect.left + cardRect.width / 2 - battleRect.left,
        y: cardRect.top + cardRect.height / 2 - battleRect.top,
    };
}

const spawnCardVfx = (side, className, opts) => {
    const card = getCombatTargetCard(side);
    if (!card) return null;
    const options = opts || {};
    const element = document.createElement('div');
    element.className = `premium-combat-vfx ${className}`;
    if (options.text != null) element.textContent = String(options.text);
    if (options.attrs) {
        Object.keys(options.attrs).forEach((key) => element.setAttribute(key, options.attrs[key]));
    }
    if (options.vars) {
        Object.keys(options.vars).forEach((key) => element.style.setProperty(key, options.vars[key]));
    }
    card.appendChild(element);
    scheduleVfxRemoval(element, options.durationMs || PREMIUM_VFX_DEFAULT_MS);
    return element;
};

const addParticleChildren = (host, count, tone) => {
    if (!host) return;
    const total = Math.max(0, Math.floor(count || 0));
    for (let i = 0; i < total; i += 1) {
        const particle = document.createElement('i');
        particle.style.setProperty('--x', `${Math.round((Math.random() - 0.5) * 140)}px`);
        particle.style.setProperty('--rise', `${Math.round(46 + Math.random() * 88)}px`);
        particle.style.setProperty('--scale', `${(0.62 + Math.random() * 0.95).toFixed(2)}`);
        particle.style.setProperty('--delay', `${(Math.random() * 0.16).toFixed(3)}s`);
        if (tone) particle.dataset.tone = tone;
        host.appendChild(particle);
    }
};

const triggerModernCardImpact = (side, intensity) => {
    const level = intensity === 'heavy' ? 'premium-card-impact-heavy' : 'premium-card-impact';
    pulseCombatCardClass(side, level, intensity === 'heavy' ? 260 : 190);
};

const playPhysicalSlashVfx = (targetSide, intensity) => {
    const slash = spawnCardVfx(targetSide, `premium-physical-slash ${intensity === 'heavy' ? 'premium-physical-slash-heavy' : ''}`, {
        durationMs: 540,
    });
    if (slash) {
        const spark = document.createElement('span');
        spark.className = 'premium-physical-spark';
        slash.appendChild(spark);
    }
    triggerModernCardImpact(targetSide, intensity === 'heavy' ? 'heavy' : 'light');
    return Promise.resolve(slash);
};

const playMagicBlastVfx = (targetSide) => {
    const blast = spawnCardVfx(targetSide, 'premium-magic-blast', { durationMs: 860 });
    addParticleChildren(blast, 14, 'magic');
    pulseCombatCardClass(targetSide, 'premium-card-arcane-glow', 420);
    return Promise.resolve(blast);
};

const playHealAuraVfx = (targetSide, amount) => {
    const aura = spawnCardVfx(targetSide, 'premium-heal-aura', { durationMs: 1060 });
    addParticleChildren(aura, 18, 'heal');
    if (amount > 0) {
        spawnCardVfx(targetSide, 'premium-heal-number', {
            text: `+${Math.max(0, Math.floor(amount))}`,
            durationMs: 920,
        });
    }
    pulseCombatCardClass(targetSide, 'premium-card-heal-glow', 520);
    return Promise.resolve(aura);
};

const playPhysicalShieldVfx = (targetSide) => {
    const shield = spawnCardVfx(targetSide, 'premium-physical-shield', { durationMs: 760 });
    if (shield) {
        const core = document.createElement('span');
        core.className = 'premium-physical-shield-core';
        shield.appendChild(core);
    }
    pulseCombatCardClass(targetSide, 'premium-card-shield-glow', 420);
    return Promise.resolve(shield);
};

const playMagicBarrierVfx = (targetSide) => {
    const barrier = spawnCardVfx(targetSide, 'premium-magic-barrier', { durationMs: 920 });
    if (barrier) {
        const grid = document.createElement('span');
        grid.className = 'premium-magic-barrier-grid';
        barrier.appendChild(grid);
    }
    pulseCombatCardClass(targetSide, 'premium-card-barrier-glow', 520);
    return Promise.resolve(barrier);
};

function showDmgFloat(dmg, isCrit, isPlayer) {
    const targetSide = isPlayer ? 'player' : 'enemy';
    const value = Math.max(0, Math.floor(Number(dmg) || 0));
    spawnCardVfx(targetSide, `premium-damage-number ${isCrit ? 'premium-damage-number-crit' : ''}`, {
        text: isCrit ? `CRIT ${value}` : value,
        durationMs: isCrit ? 1020 : 820,
    });
}

function triggerCritEffect() {
    playPhysicalSlashVfx('enemy', 'heavy');
    spawnCardVfx('enemy', 'premium-critical-flare', { durationMs: 760 });
}

function triggerShakeEffect(side) {
    triggerModernCardImpact(side === 'player' ? 'player' : 'enemy', 'light');
}

function triggerScreenShakeHeavy(side) {
    triggerModernCardImpact(side === 'player' ? 'player' : 'enemy', 'heavy');
}

function triggerScreenShakeBoss(side) {
    triggerModernCardImpact(side === 'player' ? 'player' : 'enemy', 'heavy');
    spawnCardVfx(side === 'player' ? 'player' : 'enemy', 'premium-boss-pressure', { durationMs: 760 });
}

function triggerBossDim() {
    spawnCardVfx('enemy', 'premium-boss-pressure', { durationMs: 760 });
}

function triggerGuardAura() {
    playPhysicalShieldVfx('player');
}

function triggerDodgeMove(side) {
    pulseCombatCardClass(side === 'enemy' ? 'enemy' : 'player', 'premium-card-dodge', 240);
}

function normalizeCombatArchetype(jobName) {
    const n = String(jobName || '');
    if (n.includes('마법사') || n.includes('위저드') || n.includes('Mage') || n.includes('성직자')) return 'mage';
    if (n.includes('헌터') || n.includes('암살자') || n.includes('궁수') || n.includes('Hunter')) return 'hunter';
    if (n.includes('버서커') || n.includes('워리어') || n.includes('나이트') || n.includes('Berserker')) return 'berserker';
    return 'berserker';
}

function playMageBoltVfx(fromSide, toSide) {
    return playMagicBlastVfx(toSide || (fromSide === 'player' ? 'enemy' : 'player'));
}

function playBerserkerChargeVfx(fromSide, toSide) {
    return playPhysicalSlashVfx(toSide || (fromSide === 'player' ? 'enemy' : 'player'));
}

function playHunterStrikeVfx(fromSide, toSide) {
    return playPhysicalSlashVfx(toSide || (fromSide === 'player' ? 'enemy' : 'player'));
}

function playMagicBurstVfx(targetSide) {
    return playMagicBlastVfx(targetSide);
}

function playAssassinStrikeVfx(targetSide) {
    return playPhysicalSlashVfx(targetSide, 'heavy');
}

function playCritGoldBurst(targetSide) {
    spawnCardVfx(targetSide, 'premium-critical-flare', { durationMs: 760 });
    return Promise.resolve();
}

function playBossStrikeVfx(targetSide) {
    triggerBossDim();
    return playPhysicalSlashVfx(targetSide, 'heavy');
}

function showMissFloat(targetSide) {
    spawnCardVfx(targetSide, 'premium-miss-number', { text: 'MISS', durationMs: 760 });
}

function playJobAttackVfx(attackerSide, jobName) {
    const archetype = normalizeCombatArchetype(jobName);
    const targetSide = attackerSide === 'player' ? 'enemy' : 'player';
    return archetype === 'mage' ? playMagicBlastVfx(targetSide) : playPhysicalSlashVfx(targetSide);
}

function inferV35WeaponKind(actor) {
    const explicit = actor && actor.equipment && actor.equipment.weapon;
    if (explicit && weaponTable && weaponTable[explicit]) return explicit;
    const items = Array.isArray(actor && actor.items) ? actor.items : [];
    const weaponItem = [...items].reverse().find((item) => item && item.type === 'atk');
    const name = String(weaponItem && weaponItem.name || '');
    if (/망치|철퇴|해머|너클/i.test(name)) return 'hammer';
    if (/활|화살|석궁|총/i.test(name)) return 'ranged';
    if (/지팡이|마도|마력|보주|주문/i.test(name)) return 'staff';
    if (/낫|사이드/i.test(name)) return 'greatScythe';
    return 'sword';
}

function playV35AttackVfx(attackerSide, actor, attackKind, target) {
    const targetSide = target && (typeof isPartyMember === 'function' && isPartyMember(target)) ? 'player' : attackerSide === 'player' ? 'enemy' : 'player';
    if (attackKind === 'magic_attack') return playMagicBlastVfx(targetSide);
    const weaponKind = inferV35WeaponKind(actor);
    return playPhysicalSlashVfx(targetSide, weaponKind === 'hammer' || weaponKind === 'greatScythe' ? 'heavy' : 'light');
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
window.inferV35WeaponKind = inferV35WeaponKind;
window.playV35AttackVfx = playV35AttackVfx;
window.consumeHunterEvasionMissPenalty = consumeHunterEvasionMissPenalty;
