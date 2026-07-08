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

// ===== [유닛 단위 타격 연출] 피격당하는 '정확한 대상 캐릭터의 카드(행)' 좌표를 추적해 VFX를 재생한다 =====
function getCombatUnitRowElement(actor) {
    if (!actor) return null;
    const unitId = String(actor.id || actor.roleKey || actor.name || '');
    if (!unitId) return null;
    try {
        const selectorId = (typeof CSS !== 'undefined' && CSS.escape) ? CSS.escape(unitId) : unitId.replace(/"/g, '\\"');
        return document.querySelector(`[data-combat-unit-id="${selectorId}"]`);
    } catch (err) {
        return null;
    }
}

function getActorVfxSide(actor) {
    const playerSide = (typeof player !== 'undefined' && actor === player) ||
        (typeof isPartyMember === 'function' && isPartyMember(actor));
    return playerSide ? 'player' : 'enemy';
}

// 대상 유닛 행의 화면 좌표를 계산해 combat-fx-layer 위에 오버레이를 띄운다.
// 행(innerHTML)이 매 프레임 재렌더링되어도 오버레이가 살아남도록 fx 레이어에 부착한다.
const spawnUnitVfx = (actor, className, opts) => {
    const row = getCombatUnitRowElement(actor);
    if (!row) return spawnCardVfx(getActorVfxSide(actor), className, opts);
    const layer = ensureCombatFxLayer();
    const battleArea = document.getElementById('battle-area');
    const options = opts || {};
    const element = document.createElement('div');
    element.className = `premium-combat-vfx unit-combat-vfx ${className}`;
    if (options.text != null) element.textContent = String(options.text);
    if (options.vars) {
        Object.keys(options.vars).forEach((key) => element.style.setProperty(key, options.vars[key]));
    }
    if (layer && battleArea) {
        const rowRect = row.getBoundingClientRect();
        const battleRect = battleArea.getBoundingClientRect();
        element.style.left = `${Math.round(rowRect.left - battleRect.left)}px`;
        element.style.top = `${Math.round(rowRect.top - battleRect.top)}px`;
        element.style.width = `${Math.round(rowRect.width)}px`;
        element.style.height = `${Math.round(rowRect.height)}px`;
        element.style.inset = 'auto';
        layer.appendChild(element);
    } else {
        row.appendChild(element);
    }
    scheduleVfxRemoval(element, options.durationMs || PREMIUM_VFX_DEFAULT_MS);
    return element;
};

const pulseCombatUnitClass = (actor, className, durationMs) => {
    const row = getCombatUnitRowElement(actor);
    if (!row || !className) {
        pulseCombatCardClass(getActorVfxSide(actor), className, durationMs);
        return;
    }
    row.classList.remove(className);
    void row.offsetWidth;
    row.classList.add(className);
    setTimeout(() => row.classList.remove(className), Math.max(120, Number(durationMs) || 240));
};

// [국소 셰이크] 파티 전체가 아니라 피가 깎인 '그 캐릭터의 카드만' 쿵 하고 흔들린다.
// 행동 직후 updateUi가 행을 재생성할 수 있어, 다음 틱에 id로 행을 재탐색해 흔든다.
function triggerUnitHitShake(actor, heavy) {
    setTimeout(() => {
        const row = getCombatUnitRowElement(actor);
        if (!row) {
            triggerModernCardImpact(getActorVfxSide(actor), heavy ? 'heavy' : 'light');
            return;
        }
        const className = heavy ? 'unit-hit-shake-heavy' : 'unit-hit-shake';
        row.classList.remove('unit-hit-shake');
        row.classList.remove('unit-hit-shake-heavy');
        void row.offsetWidth;
        row.classList.add(className);
        setTimeout(() => row.classList.remove(className), heavy ? 460 : 380);
    }, 40);
}

// 피격 대상 카드 전면 중앙에 번쩍이는 물리/마법 피격 플래시 오버레이
function playUnitHitFlashVfx(target, attackKind) {
    const className = attackKind === 'magic' ? 'unit-hit-flash-magic' : 'unit-hit-flash-physical';
    return Promise.resolve(spawnUnitVfx(target, className, { durationMs: 620 }));
}

function showUnitDmgFloat(target, dmg, isCrit) {
    const value = Math.max(0, Math.floor(Number(dmg) || 0));
    spawnUnitVfx(target, `unit-damage-number ${isCrit ? 'unit-damage-number-crit' : ''}`, {
        text: isCrit ? `CRIT ${value}` : String(value),
        durationMs: isCrit ? 1020 : 820,
    });
}

function showUnitMissFloat(target) {
    spawnUnitVfx(target, 'unit-miss-number', { text: 'MISS', durationMs: 760 });
}

// [파이어 볼] 타겟 카드 전면의 보라/붉은색 대형 폭발 파티클
function playFireballExplosionVfx(target) {
    const burst = spawnUnitVfx(target, 'unit-fireball-burst', { durationMs: 1040 });
    if (burst) {
        for (let i = 0; i < 22; i += 1) {
            const particle = document.createElement('i');
            const angle = Math.random() * Math.PI * 2;
            const distance = 34 + Math.random() * 78;
            particle.style.setProperty('--fx', `${Math.round(Math.cos(angle) * distance)}px`);
            particle.style.setProperty('--fy', `${Math.round(Math.sin(angle) * distance)}px`);
            particle.style.setProperty('--fscale', `${(0.6 + Math.random() * 1.15).toFixed(2)}`);
            particle.style.setProperty('--fdelay', `${(Math.random() * 0.15).toFixed(3)}s`);
            particle.dataset.tone = Math.random() < 0.5 ? 'violet' : 'crimson';
            burst.appendChild(particle);
        }
    }
    triggerUnitHitShake(target, true);
    return Promise.resolve(burst);
}

function playV35AttackVfx(attackerSide, actor, attackKind, target) {
    const targetSide = target && (typeof isPartyMember === 'function' && isPartyMember(target)) ? 'player' : attackerSide === 'player' ? 'enemy' : 'player';
    // 대상 유닛 행이 있으면 파티 전체가 아닌 '정확한 피격 대상 카드'에만 타격 플래시를 띄운다.
    if (target && getCombatUnitRowElement(target)) {
        return playUnitHitFlashVfx(target, attackKind === 'magic_attack' ? 'magic' : 'physical');
    }
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
window.getCombatUnitRowElement = getCombatUnitRowElement;
window.spawnUnitVfx = spawnUnitVfx;
window.pulseCombatUnitClass = pulseCombatUnitClass;
window.triggerUnitHitShake = triggerUnitHitShake;
window.playUnitHitFlashVfx = playUnitHitFlashVfx;
window.showUnitDmgFloat = showUnitDmgFloat;
window.showUnitMissFloat = showUnitMissFloat;
window.playFireballExplosionVfx = playFireballExplosionVfx;
