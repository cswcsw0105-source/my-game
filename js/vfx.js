// VFX/animation module (stage 1 split)
function getCombatTargetCard(side) {
    return document.getElementById(side === 'player' ? 'player-card' : 'enemy-card');
}

function onceAnimationEnd(el, done) {
    if (!el) {
        if (typeof done === 'function') done();
        return;
    }
    const finish = (event) => {
        if (event && event.target !== el) return;
        el.removeEventListener('animationend', finish);
        if (typeof done === 'function') done();
    };
    el.addEventListener('animationend', finish);
}

function animateClass(el, className) {
    if (!el || !className) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    onceAnimationEnd(el, () => el.classList.remove(className));
}

function ensureCombatFxLayer() {
    const ba = document.getElementById('battle-area');
    if (!ba) return null;
    let layer = document.getElementById('combat-fx-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'combat-fx-layer';
        layer.className = 'combat-fx-layer';
        ba.classList.add('combat-stage');
        ba.appendChild(layer);
    }
    return layer;
}

function getCardCenter(side) {
    const card = getCombatTargetCard(side);
    const ba = document.getElementById('battle-area');
    if (!card || !ba) return null;
    const cr = card.getBoundingClientRect();
    const br = ba.getBoundingClientRect();
    return {
        x: cr.left + cr.width / 2 - br.left,
        y: cr.top + cr.height / 2 - br.top,
    };
}

function placeFxNode(el, point) {
    el.style.left = `${point.x}px`;
    el.style.top = `${point.y}px`;
}

function spawnFxNode(className, point, opts) {
    const layer = ensureCombatFxLayer();
    if (!layer || !point) return Promise.resolve(null);
    const el = document.createElement('div');
    el.className = className;
    placeFxNode(el, point);
    if (opts && opts.vars) {
        Object.keys(opts.vars).forEach((key) => el.style.setProperty(key, opts.vars[key]));
    }
    if (opts && opts.text != null) el.textContent = opts.text;
    layer.appendChild(el);
    return new Promise((resolve) => {
        onceAnimationEnd(el, () => {
            if (el.parentNode) el.remove();
            resolve(el);
        });
    });
}

function triggerScreenShake(kind) {
    const stage = document.getElementById('battle-area') || document.querySelector('.screen');
    if (!stage) return;
    const cls = kind === 'boss' ? 'combat-shake-boss' : kind === 'heavy' ? 'combat-shake-heavy' : 'combat-shake-light';
    animateClass(stage, cls);
}

function triggerHitImpact(side) {
    const card = getCombatTargetCard(side);
    if (!card) return;
    animateClass(card, 'hit-impact');
}

function triggerHitFlash(side) {
    triggerHitImpact(side);
}

function showDmgFloat(dmg, isCrit, isPlayer) {
    const targetSide = isPlayer ? 'player' : 'enemy';
    const point = getCardCenter(targetSide);
    if (!point) return;
    const cls = ['floating-damage', isPlayer ? 'floating-damage-player' : 'floating-damage-enemy'];
    if (isCrit) cls.push('floating-damage-crit');
    triggerHitImpact(targetSide);
    const numericDmg = Number(dmg);
    const maxHp = typeof getEffectiveMaxHp === 'function' ? getEffectiveMaxHp() : 0;
    if (isCrit || (isPlayer && Number.isFinite(numericDmg) && maxHp > 0 && numericDmg >= maxHp * 0.18)) {
        triggerScreenShakeHeavy();
    }
    spawnFxNode(cls.join(' '), { x: point.x, y: point.y - 34 }, { text: `${isCrit ? 'CRIT ' : ''}${dmg}` });
}

function triggerCritEffect() {
    const s = document.querySelector('.screen');
    if (!s) return;
    animateClass(s, 'crit-flash');
    animateClass(s, 'crit-blackout');
}

function triggerShakeEffect() {
    triggerScreenShake('light');
}

function triggerScreenShakeHeavy() {
    triggerScreenShake('heavy');
}

function triggerScreenShakeBoss() {
    triggerScreenShake('boss');
}

function triggerBossDim() {
    const s = document.querySelector('.screen');
    if (!s) return;
    animateClass(s, 'boss-dimming');
}

function triggerGuardAura() {
    const c = getCombatTargetCard('player');
    if (!c) return;
    animateClass(c, 'guard-aura');
}

function triggerDodgeMove(side) {
    const c = getCombatTargetCard(side === 'enemy' ? 'enemy' : 'player');
    if (!c) return;
    animateClass(c, 'dodge-move');
}

function normalizeCombatArchetype(jobName) {
    const n = String(jobName || '');
    if (n.includes('마법사') || n.includes('위저드') || n.includes('Mage') || n.includes('성직자')) return 'mage';
    if (n.includes('헌터') || n.includes('암살자') || n.includes('궁수') || n.includes('Hunter')) return 'hunter';
    if (n.includes('버서커') || n.includes('워리어') || n.includes('나이트') || n.includes('Berserker')) return 'berserker';
    return 'berserker';
}

function playMageBoltVfx(fromSide, toSide) {
    const from = getCardCenter(fromSide);
    const to = getCardCenter(toSide);
    if (!from || !to) return Promise.resolve();
    return spawnFxNode('mage-bolt', from, {
        vars: {
            '--fx-dx': `${to.x - from.x}px`,
            '--fx-dy': `${to.y - from.y}px`,
        },
    }).then(() => spawnFxNode('mage-explosion', to));
}

function playBerserkerChargeVfx(fromSide, toSide) {
    const to = getCardCenter(toSide);
    if (!to) return Promise.resolve();
    return spawnFxNode('slash-effect', to);
}

function playHunterStrikeVfx(fromSide, toSide) {
    const from = getCardCenter(fromSide);
    const to = getCardCenter(toSide);
    if (!from || !to) return Promise.resolve();
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return spawnFxNode('hunter-shot', from, {
        vars: {
            '--fx-dx': `${dx}px`,
            '--fx-dy': `${dy}px`,
        },
    }).then(() => spawnFxNode('hunter-impact', to));
}

function playMagicBurstVfx(targetSide) {
    const to = getCardCenter(targetSide);
    if (!to) return Promise.resolve();
    return spawnFxNode('magic-burst', to);
}

function playAssassinStrikeVfx(targetSide) {
    const to = getCardCenter(targetSide);
    if (!to) return Promise.resolve();
    return spawnFxNode('assassin-strike', to);
}

function playCritGoldBurst(targetSide) {
    const to = getCardCenter(targetSide);
    if (!to) return Promise.resolve();
    return spawnFxNode('crit-gold-burst', to);
}

function playBossStrikeVfx(targetSide) {
    const to = getCardCenter(targetSide);
    if (!to) return Promise.resolve();
    triggerBossDim();
    triggerScreenShakeBoss();
    triggerHitFlash(targetSide);
    return spawnFxNode('boss-strike', to);
}

function showMissFloat(targetSide) {
    const p = getCardCenter(targetSide);
    if (!p) return;
    spawnFxNode('floating-damage floating-damage-miss', { x: p.x, y: p.y - 34 }, { text: 'MISS' });
}

function playJobAttackVfx(attackerSide, jobName) {
    const archetype = normalizeCombatArchetype(jobName);
    const targetSide = attackerSide === 'player' ? 'enemy' : 'player';
    if (archetype === 'mage') return playMageBoltVfx(attackerSide, targetSide).then(() => playMagicBurstVfx(targetSide));
    if (archetype === 'hunter') return playHunterStrikeVfx(attackerSide, targetSide);
    return playBerserkerChargeVfx(attackerSide, targetSide);
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

function playV35AttackVfx(attackerSide, actor, attackKind) {
    const targetSide = attackerSide === 'player' ? 'enemy' : 'player';
    if (attackKind === 'magic_attack') {
        return playMageBoltVfx(attackerSide, targetSide).then(() => playMagicBurstVfx(targetSide));
    }
    const weaponKind = inferV35WeaponKind(actor);
    if (weaponKind === 'ranged') return playHunterStrikeVfx(attackerSide, targetSide);
    if (weaponKind === 'staff') return playMageBoltVfx(attackerSide, targetSide);
    if (weaponKind === 'greatScythe') return playAssassinStrikeVfx(targetSide);
    if (weaponKind === 'hammer') {
        triggerScreenShakeHeavy();
        return playBerserkerChargeVfx(attackerSide, targetSide);
    }
    return playBerserkerChargeVfx(attackerSide, targetSide);
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
