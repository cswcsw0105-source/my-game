// VFX/animation module (stage 1 split)
const PREMIUM_VFX_DEFAULT_MS = 980;

// [배속 동기화] 2배속 모드면 모든 연출 타이머/CSS 지속시간을 0.5배로 압축한다.
// (전투 엔진의 waitMs 는 combatLogic 이 별도로 gameSpeed 처리 — 여기서는 순수 연출만 스케일)
function getVfxRate() {
    return Number(typeof window !== 'undefined' && window.gameSpeed) === 2 ? 0.5 : 1;
}
function vfxMs(ms) {
    return Math.max(1, Math.round((Number(ms) || 0) * getVfxRate()));
}
// [배속에서도 스킵 금지] DOM 생명주기 타이머는 절대 이 하한 아래로 내려가지 않는다(2배속 ≈ 180~200ms).
function vfxDur(baseMs, floorMs) {
    return Math.max(Math.max(1, Number(floorMs) || 0), vfxMs(baseMs));
}
// [비동기 턴 동기화] 연출 재생 시간만큼 실제로 대기하는 Promise. 2배속이면 절반이지만 최소 160ms는 보장.
function awaitVfx(baseMs) {
    return new Promise((resolve) => setTimeout(resolve, vfxDur(baseMs, 160)));
}

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
    element.style.setProperty('--vfx-rate', String(getVfxRate()));
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

// [피격 좌표 앵커링 수정] 피격 VFX/대미지 숫자를 '맞은 유닛 카드(행)' 내부에 직접 append 한다.
// 화면 전체 기준 절대 좌표 계산을 폐지 → 행이 흔들리거나 재배치돼도 이펙트가 그 카드 정중앙에 고정된다.
const spawnUnitVfx = (actor, className, opts) => {
    const row = getCombatUnitRowElement(actor);
    const options = opts || {};
    if (!row) {
        // 개별 행이 없을 때만(비파티/망령) 파티 카드 폴백 — 이 경우도 카드 기준 좌표이지 화면 절대 좌표가 아니다.
        return spawnCardVfx(getActorVfxSide(actor), className, options);
    }
    const element = document.createElement('div');
    element.className = `premium-combat-vfx unit-combat-vfx ${className}`;
    // [배속 동기화] 모든 유닛 VFX 는 --vfx-rate(2배속=0.5)를 상속해 CSS 지속시간을 자동 압축한다.
    element.style.setProperty('--vfx-rate', String(getVfxRate()));
    if (options.text != null) element.textContent = String(options.text);
    if (options.vars) {
        Object.keys(options.vars).forEach((key) => element.style.setProperty(key, options.vars[key]));
    }
    // 행 내부 절대배치(inset:0) → flex 중앙정렬로 유닛 몸통/체력바 정중앙에서 팝업.
    element.style.position = 'absolute';
    element.style.left = '0';
    element.style.top = '0';
    element.style.right = '0';
    element.style.bottom = '0';
    element.style.width = 'auto';
    element.style.height = 'auto';
    if (getComputedStyle(row).position === 'static') row.style.position = 'relative';
    row.appendChild(element);
    scheduleVfxRemoval(element, options.durationMs || PREMIUM_VFX_DEFAULT_MS);
    return element;
};

// ===== [타겟팅 하이라이트] 피격 대상 유닛 카드에 .is-targeted (붉은/노란 글로우) 부여/해제 =====
function clearCombatTargetMarks() {
    document.querySelectorAll('.is-targeted').forEach((el) => el.classList.remove('is-targeted'));
}

function markCombatTargetUnit(target) {
    clearCombatTargetMarks();
    if (!target) return;
    const el = getCombatUnitRowElement(target) || getCombatTargetCard(getActorVfxSide(target));
    if (!el) return;
    el.classList.add('is-targeted');
    // 행동 종료(약 900ms 턴) 후 안전 제거 — emitCombatResultVfx 에서도 즉시 해제된다.
    clearTimeout(window._isTargetedClearTimer);
    window._isTargetedClearTimer = setTimeout(clearCombatTargetMarks, 900);
}

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
        row.style.setProperty('--vfx-rate', String(getVfxRate()));
        row.classList.remove('unit-hit-shake');
        row.classList.remove('unit-hit-shake-heavy');
        void row.offsetWidth;
        row.classList.add(className);
        // CSS: heavy 0.2s / light 0.3s (2배속 시 --vfx-rate 로 절반). JS 제거는 살짝 여유를 둔다.
        setTimeout(() => row.classList.remove(className), heavy ? vfxMs(260) : vfxMs(360));
    }, 20);
}

// 피격 대상 카드 전면 중앙에 번쩍이는 물리/마법 피격 플래시 오버레이
function playUnitHitFlashVfx(target, attackKind) {
    const className = attackKind === 'magic' ? 'unit-hit-flash-magic' : 'unit-hit-flash-physical';
    spawnUnitVfx(target, className, { durationMs: vfxDur(620, 260) });
    return awaitVfx(300);
}

function showUnitDmgFloat(target, dmg, isCrit) {
    const value = Math.max(0, Math.floor(Number(dmg) || 0));
    spawnUnitVfx(target, `unit-damage-number ${isCrit ? 'unit-damage-number-crit' : ''}`, {
        text: isCrit ? `CRIT ${value}` : String(value),
        durationMs: isCrit ? 1020 : 820,
    });
}

// [빗나감 전용 플로팅] 타겟 유닛 머리 위에 볼드 하늘색/회색 "MISS!" — 350ms 상승 페이드 후 즉시 DOM 제거.
function showUnitMissFloat(target) {
    const el = spawnUnitVfx(target, 'unit-miss-float', { text: 'MISS!', durationMs: vfxMs(350) });
    if (el) el.style.setProperty('--vfx-rate', String(getVfxRate()));
    return el;
}

// 유닛 카드 정중앙에 이모지 팝업 (⚔️ 회전 슬래시 등). durationMs 후 자동 제거.
// 물리 타격 임팩트는 2배속에서도 최소 200ms 는 화면에 노출된 뒤 사라진다.
function popUnitEmoji(target, emoji, extraClass, durationMs) {
    const el = spawnUnitVfx(target, `unit-emoji-pop ${extraClass || ''}`, {
        text: emoji,
        durationMs: durationMs || vfxDur(340, 200),
    });
    if (el) el.style.setProperty('--vfx-rate', String(getVfxRate()));
    return el;
}

// 임의의 행(공격자) 머리 위에 잠깐 뜨는 아이콘 (🪄 지팡이 등).
function popEmojiAboveRow(rowEl, emoji, durationMs) {
    if (!rowEl) return null;
    const el = document.createElement('div');
    el.className = 'unit-head-emoji';
    el.textContent = emoji;
    el.style.setProperty('--vfx-rate', String(getVfxRate()));
    if (getComputedStyle(rowEl).position === 'static') rowEl.style.position = 'relative';
    rowEl.appendChild(el);
    scheduleVfxRemoval(el, durationMs || vfxMs(180));
    return el;
}

// [물리 공격 대시] 공격자 카드가 타겟 진형 방향으로 15px 전진(transition 0.15s ease-out) 후 복귀.
// 논블로킹. 2배속에서도 스킵되지 않도록 전진 유지 시간을 최소 120ms 확보한다.
function dashRowToward(attackerActor, targetActor, durationMs) {
    const row = getCombatUnitRowElement(attackerActor);
    if (!row) return;
    const from = getUnitCenterInBattleArea(attackerActor);
    const to = getUnitCenterInBattleArea(targetActor);
    let dx = 15;
    let dy = 0;
    if (from && to) {
        const vx = to.x - from.x;
        const vy = to.y - from.y;
        const len = Math.hypot(vx, vy) || 1;
        dx = Math.round((vx / len) * 15);
        dy = Math.round((vy / len) * 15);
    }
    // CSS transition 은 0.15초 ease-out 로 고정(브라우저에서 확실히 보이도록). 유지 시간만 배속 반영.
    const holdMs = durationMs || Math.max(120, vfxMs(140));
    const prevTransition = row.style.transition;
    const prevWillChange = row.style.willChange;
    row.style.willChange = 'transform';
    row.style.transition = 'transform 0.15s ease-out';
    // reflow 강제 후 트랜지션 시작 (첫 프레임 스킵 방지)
    void row.offsetWidth;
    row.style.transform = `translate(${dx}px, ${dy}px)`;
    setTimeout(() => {
        row.style.transform = 'translate(0, 0)';
        setTimeout(() => {
            row.style.transition = prevTransition || '';
            row.style.willChange = prevWillChange || '';
        }, 200);
    }, holdMs);
}

// #combat-fx-layer 기준 유닛 카드(행) 중심 좌표.
function getUnitCenterInBattleArea(actor) {
    const el = getCombatUnitRowElement(actor) || getCombatTargetCard(getActorVfxSide(actor));
    const battleArea = document.getElementById('battle-area');
    if (!el || !battleArea) return null;
    const r = el.getBoundingClientRect();
    const b = battleArea.getBoundingClientRect();
    return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
}

// 공격자 → 타겟으로 이모지 투사체(🔮 등)가 날아가 타겟 중심에서 폭발. 논블로킹.
function flyProjectileBetween(fromActor, toActor, emoji, onArrive) {
    const layer = ensureCombatFxLayer();
    const from = getUnitCenterInBattleArea(fromActor);
    const to = getUnitCenterInBattleArea(toActor);
    if (!layer || !from || !to) {
        if (typeof onArrive === 'function') onArrive();
        return;
    }
    const flyMs = vfxMs(200);
    const el = document.createElement('div');
    el.className = 'unit-projectile';
    el.textContent = emoji;
    el.style.left = `${Math.round(from.x)}px`;
    el.style.top = `${Math.round(from.y)}px`;
    el.style.transform = 'translate(-50%, -50%)';
    el.style.transition = `transform ${flyMs}ms cubic-bezier(0.3, 0.7, 0.4, 1)`;
    layer.appendChild(el);
    requestAnimationFrame(() => {
        el.style.transform = `translate(-50%, -50%) translate(${Math.round(to.x - from.x)}px, ${Math.round(to.y - from.y)}px)`;
    });
    setTimeout(() => {
        removeVfxElement(el);
        spawnUnitVfx(toActor, 'unit-projectile-burst', { durationMs: vfxMs(200) });
        if (typeof onArrive === 'function') onArrive();
    }, flyMs + 10);
}

// [스킬 피격 플래시] 단순 슬래시 대신 금빛/주황빛 마법진 플래시 + 0.2s 묵직한 셰이크.
function playUnitSkillFlashVfx(target) {
    const el = spawnUnitVfx(target, 'unit-skill-flash', { durationMs: vfxDur(360, 220) });
    if (el) el.style.setProperty('--vfx-rate', String(getVfxRate()));
    if (typeof triggerUnitHitShake === 'function') triggerUnitHitShake(target, true);
    return awaitVfx(300);
}

// [마법사 스킬 메테오/폭발] 타겟 중앙에 거대한 🔥/🔮 가 떨어지며 400ms 폭발 팽창(scale 1.5x + 붉은/금빛 섬광).
// 팽창 피크(≈45%)에 맞춰 묵직한 셰이크가 걸리고, Promise 는 ~300~350ms 뒤(2배속 ~180ms) resolve → 피격 판정 동기화.
function playMageSkillExplosionVfx(target, opts) {
    const o = opts || {};
    const emoji = o.emoji || '🔥';
    const blast = spawnUnitVfx(target, 'unit-meteor-blast', { text: emoji, durationMs: vfxDur(460, 260) });
    if (blast) blast.style.setProperty('--vfx-rate', String(getVfxRate()));
    // 붉은/보라 파티클 폭발도 함께
    const burst = spawnUnitVfx(target, 'unit-fireball-burst', { durationMs: vfxDur(640, 320) });
    if (burst) {
        for (let i = 0; i < 20; i += 1) {
            const particle = document.createElement('i');
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 74;
            particle.style.setProperty('--fx', `${Math.round(Math.cos(angle) * distance)}px`);
            particle.style.setProperty('--fy', `${Math.round(Math.sin(angle) * distance)}px`);
            particle.style.setProperty('--fscale', `${(0.6 + Math.random() * 1.1).toFixed(2)}`);
            particle.style.setProperty('--fdelay', `${(Math.random() * 0.12).toFixed(3)}s`);
            particle.dataset.tone = emoji === '🔥' ? (Math.random() < 0.5 ? 'crimson' : 'gold') : (Math.random() < 0.5 ? 'violet' : 'crimson');
            burst.appendChild(particle);
        }
    }
    // 폭발 팽창 피크에 셰이크 + 금빛 마법진 섬광
    setTimeout(() => {
        spawnUnitVfx(target, 'unit-skill-flash', { durationMs: vfxDur(300, 200) });
        if (typeof triggerUnitHitShake === 'function') triggerUnitHitShake(target, true);
    }, vfxDur(160, 90));
    return awaitVfx(340);
}

// [스킬 시전 뱃지] 공격자 유닛 상단에 시전 스킬명 뱃지([🛡️ 철벽 도발] 등)를 300ms 팝업.
function playSkillCastBadge(actor, label) {
    const row = getCombatUnitRowElement(actor) || getCombatTargetCard(getActorVfxSide(actor));
    if (!row || !label) return;
    const el = document.createElement('div');
    el.className = 'skill-cast-badge';
    el.textContent = label;
    el.style.setProperty('--vfx-rate', String(getVfxRate()));
    if (getComputedStyle(row).position === 'static') row.style.position = 'relative';
    row.appendChild(el);
    scheduleVfxRemoval(el, vfxMs(300));
}

// [파이어 볼] 타겟 카드 중앙에 🔥 메테오 폭발. Promise 로 ~340ms(2배속 ~180ms) 대기 후 resolve.
function playFireballExplosionVfx(target) {
    return playMageSkillExplosionVfx(target, { emoji: '🔥' });
}

// [공격 타입별 개체 간 연출] 대시 / ⚔️ 슬래시 / 🪄+🔮 투사체+폭발.
// [비동기 턴 동기화] 반드시 Promise 로 실제 대기한다 — 연출이 보이기 전에 피격 판정/다음 턴이 넘어가지 않도록.
//   · 마법/스킬 첫 타 : ~320ms (2배속 ~180ms)
//   · 물리 첫 타       : ~260ms
//   · 물리 연타(2타~)  : ~120ms (콤보 템포 유지)
function playV35AttackVfx(attackerSide, actor, attackKind, target, strikeIndex) {
    const targetSide = target && (typeof isPartyMember === 'function' && isPartyMember(target)) ? 'player' : attackerSide === 'player' ? 'enemy' : 'player';
    // [타겟 하이라이트] 타격 직전, 맞는 대상 카드에 .is-targeted 부여.
    markCombatTargetUnit(target);
    const isMagic = attackKind === 'magic_attack' || attackKind === 'magic';
    // 스킬 타격(연속 베기 1.8 / 방패 가격 1.3 / 갑옷 파쇄 1.2 / 화염구 힌트 2.2 / 보스 강공 2.5)은
    // _attackMultiplier(>1.15) 로 식별 → 금빛/주황빛 마법진 스킬 플래시로 차별화.
    const isSkillHit = !!(actor && Number(actor._attackMultiplier) > 1.15);
    const hasTargetRow = !!(target && getCombatUnitRowElement(target));
    const isComboHit = Number(strikeIndex) > 0;

    if (isMagic) {
        // 시전자 머리 위 🪄 팝업 → 타겟으로 🔮 투사체 비행 → 타겟 중심 메테오 폭발.
        const casterRow = getCombatUnitRowElement(actor) || getCombatTargetCard(getActorVfxSide(actor));
        if (casterRow) popEmojiAboveRow(casterRow, '🪄', vfxDur(150, 110));
        flyProjectileBetween(actor, target, isSkillHit ? '🔥' : '🔮', () => {
            if (hasTargetRow) {
                playMageSkillExplosionVfx(target, { emoji: isSkillHit ? '🔥' : '🔮' });
            } else {
                playMagicBlastVfx(targetSide);
                if (typeof triggerUnitHitShake === 'function') triggerUnitHitShake(target, true);
            }
        });
        // 투사체 비행(~200) + 폭발 팽창 피크 확보. 이 대기 후 combatLogic 이 피격 판정을 확정한다.
        return awaitVfx(isComboHit ? 150 : 340);
    }

    // 물리: 공격자 카드가 타겟 방향으로 15px 대시(0.15s) 후 복귀 + 타겟 중심 ⚔️ 회전 슬래시.
    if (!isComboHit) dashRowToward(actor, target);
    if (hasTargetRow) {
        popUnitEmoji(target, '⚔️', 'slash-emoji', vfxDur(isComboHit ? 220 : 340, isComboHit ? 150 : 200));
        if (isSkillHit) playUnitSkillFlashVfx(target);
        else playUnitHitFlashVfx(target, 'physical');
        return awaitVfx(isComboHit ? 120 : 260);
    }
    playPhysicalSlashVfx(targetSide, inferV35WeaponKind(actor) === 'hammer' || inferV35WeaponKind(actor) === 'greatScythe' ? 'heavy' : 'light');
    return awaitVfx(isComboHit ? 120 : 240);
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
window.playMageSkillExplosionVfx = playMageSkillExplosionVfx;
window.clearCombatTargetMarks = clearCombatTargetMarks;
window.markCombatTargetUnit = markCombatTargetUnit;
window.getVfxRate = getVfxRate;
window.vfxMs = vfxMs;
window.vfxDur = vfxDur;
window.awaitVfx = awaitVfx;
window.popUnitEmoji = popUnitEmoji;
window.popEmojiAboveRow = popEmojiAboveRow;
window.dashRowToward = dashRowToward;
window.getUnitCenterInBattleArea = getUnitCenterInBattleArea;
window.flyProjectileBetween = flyProjectileBetween;
window.playUnitSkillFlashVfx = playUnitSkillFlashVfx;
window.playSkillCastBadge = playSkillCastBadge;
