// UI manager module (stage 1 split)
const BASE_JOB_TITLE_NAMES = Object.freeze({
    Warrior: '워리어',
    Hunter: '헌터',
    Wizard: '마법사',
    '워리어': '워리어',
    '헌터': '헌터',
    '마법사': '마법사',
});

function getBaseJobTitleNameFromKeys() {
    for (let i = 0; i < arguments.length; i++) {
        const raw = arguments[i];
        if (!raw) continue;
        const key = String(raw);
        if (BASE_JOB_TITLE_NAMES[key]) return BASE_JOB_TITLE_NAMES[key];
        if (typeof jobBase !== 'undefined' && jobBase[key] && BASE_JOB_TITLE_NAMES[jobBase[key].name]) {
            return BASE_JOB_TITLE_NAMES[jobBase[key].name];
        }
    }
    return '모험가';
}

function getDynamicCharacterTitleForFloor(floorRef, entity) {
    const f = Math.max(1, Math.floor(safeNum(floorRef, 1)));
    if (f <= 10) return '기억을 잃은 자';
    if (f <= 30) return '과거를 더듬는 자';
    const storyTitle = typeof getStoryTitleForState === 'function'
        ? getStoryTitleForState(entity && entity.playerState, f)
        : null;
    if (storyTitle) return storyTitle;
    const baseName = getBaseJobTitleNameFromKeys(
        entity && entity.originBaseJobKey,
        entity && entity.baseJob,
        entity && entity.jobKey,
        entity && entity.classKey,
        entity && entity.name
    );
    if (f <= 50) return `기억의 파편을 쥔 ${baseName}`;
    const promotion = entity && entity.currentPromotion ? String(entity.currentPromotion) : '';
    if (promotion) return `운명을 자각한 ${promotion}`;
    return '운명을 자각한 자';
}

function getPlayerClassDisplayName() {
    if (!player) return '기억을 잃은 자';
    return getDynamicCharacterTitleForFloor(floor, player);
}

function getSlotClassDisplayName(slot) {
    if (!slot) return '기억을 잃은 자';
    const snapFloor = slot.runSnapshot && slot.runSnapshot.floor ? slot.runSnapshot.floor : null;
    const refFloor = snapFloor || slot.bestFloor || 1;
    return getDynamicCharacterTitleForFloor(refFloor, slot);
}

let activeInventoryPartyRole = 'tank';
let combatTargetSelectionState = null;

function getPartyRoleTabs() {
    return [
        { key: 'tank', label: '탱커', color: '#74b9ff' },
        { key: 'mage', label: '마법사', color: '#a55eea' },
        { key: 'knight', label: '기사', color: '#f1c40f' },
    ];
}

function getActiveInventoryPartyMember() {
    const members = getPartyMembers(player);
    if (!members.length) return null;
    const roleKeys = getPartyRoleTabs().map((role) => role.key);
    if (!roleKeys.includes(activeInventoryPartyRole)) activeInventoryPartyRole = 'tank';
    return members.find((member) => member.roleKey === activeInventoryPartyRole) || members[0];
}

window.setInventoryPartyTab = function setInventoryPartyTab(roleKey) {
    if (!getPartyRoleTabs().some((role) => role.key === roleKey)) return;
    activeInventoryPartyRole = roleKey;
    renderInventoryPanel();
};

const getCombatTargetActorKey = (actor) => {
    if (!actor) return '';
    return String(actor.id || actor.roleKey || actor.name || '');
};

const setCombatTargetSelection = (actionType, actor) => {
    combatTargetSelectionState = {
        actionType,
        actorKey: getCombatTargetActorKey(actor),
    };
};

const clearCombatTargetSelection = () => {
    combatTargetSelectionState = null;
};

const getCombatTargetSelectionForTurn = (turn) => {
    if (!combatTargetSelectionState || !turn || turn.side !== 'player') return null;
    if (combatTargetSelectionState.actorKey !== getCombatTargetActorKey(turn.actor)) {
        clearCombatTargetSelection();
        return null;
    }
    return combatTargetSelectionState;
};

const removeEnemyIntentLaser = () => {
    const existing = document.getElementById('enemy-intent-laser');
    if (existing) existing.remove();
};

const renderEnemyIntentLaser = (sourceSide, targetSide, durationMs) => {
    const layer = typeof ensureCombatFxLayer === 'function' ? ensureCombatFxLayer() : null;
    const from = typeof getCardCenter === 'function' ? getCardCenter(sourceSide || 'enemy') : null;
    const to = typeof getCardCenter === 'function' ? getCardCenter(targetSide || 'player') : null;
    if (!layer || !from || !to) return null;
    removeEnemyIntentLaser();
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.id = 'enemy-intent-laser';
    svg.classList.add('enemy-intent-laser-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const glow = document.createElementNS(svgNs, 'line');
    const core = document.createElementNS(svgNs, 'line');
    [glow, core].forEach((line) => {
        line.setAttribute('x1', String(from.x));
        line.setAttribute('y1', String(from.y));
        line.setAttribute('x2', String(to.x));
        line.setAttribute('y2', String(to.y));
    });
    glow.classList.add('enemy-intent-laser-glow');
    core.classList.add('enemy-intent-laser-core');
    svg.appendChild(glow);
    svg.appendChild(core);
    layer.appendChild(svg);
    setTimeout(() => {
        if (svg.parentNode) svg.remove();
    }, Math.max(180, Number(durationMs) || 560));
    return svg;
};

function buildLargeHpBarRow({ name, current, max, color, subText, dead }) {
    const safeMax = Math.max(1, Math.floor(safeNum(max, 1)));
    const safeCur = Math.max(0, Math.floor(safeNum(current, 0)));
    const pct = Math.max(0, Math.min(100, (safeCur / safeMax) * 100));
    return `<div style="margin:8px 0 10px;${dead ? 'opacity:0.5;' : ''}">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-end;margin:0 2px 4px;line-height:1.25;">
            <span style="font-size:0.86em;font-weight:900;color:${color};white-space:nowrap;">${escapeHtml(name)}</span>
            <span style="font-size:0.82em;font-weight:900;color:#fff;white-space:nowrap;">${safeCur} / ${safeMax}</span>
        </div>
        <div class="hp-bar-outer" style="margin:0;">
            <div class="hp-bar-inner" style="width:${pct}%;background:${color};"></div>
        </div>
        ${subText ? `<div style="font-size:0.68em;color:#9aa4b2;line-height:1.35;margin:4px 2px 0;text-align:left;white-space:normal;">${subText}</div>` : ''}
    </div>`;
}

function renderPartyHpBars() {
    const aggregateOuter = document.querySelector('#player-card > .hp-bar-outer');
    const aggregateText = document.getElementById('p-hp-t');
    const host = document.getElementById('p-party-hp-bars');
    if (!host) return;
    if (!player || !Array.isArray(player.party)) {
        host.style.display = 'none';
        if (aggregateOuter) aggregateOuter.style.display = '';
        if (aggregateText) aggregateText.style.display = '';
        return;
    }
    const members = getPartyMembers(player);
    host.innerHTML = members.map((member) => {
        const stats = member.stats || {};
        const sub = `힘${stats.str} · 방${stats.def} · 체${stats.hp} · 지${stats.int} · 지혜${stats.wis} · 민${stats.agi}`;
        return buildLargeHpBarRow({
            name: member.name,
            current: member.curHp,
            max: member.maxHp,
            color: '#2ed573',
            subText: sub,
            dead: safeNum(member.curHp, 0) <= 0,
        });
    }).join('');
    host.style.display = 'block';
    if (aggregateOuter) aggregateOuter.style.display = 'none';
    if (aggregateText) aggregateText.style.display = 'none';
}

function renderEnemyHpBars() {
    const aggregateOuter = document.querySelector('#enemy-card > .hp-bar-outer');
    const aggregateText = document.getElementById('e-hp-t');
    const host = document.getElementById('e-party-hp-bars');
    if (!host) return;
    if (!enemy || !Array.isArray(enemy.party)) {
        host.style.display = 'none';
        if (aggregateOuter) aggregateOuter.style.display = '';
        if (aggregateText) aggregateText.style.display = '';
        return;
    }
    const members = getEnemyPartyMembers(enemy);
    host.innerHTML = members.map((member) => {
        const stats = member.stats || {};
        const sub = `ATK ${safeNum(member.atk, 0)} · DEF ${safeNum(member.def, 0)} · 민${safeNum(stats.agi, 0)}`;
        return buildLargeHpBarRow({
            name: member.name,
            current: member.curHp,
            max: member.maxHp,
            color: '#ff4757',
            subText: sub,
            dead: safeNum(member.curHp, 0) <= 0,
        });
    }).join('');
    host.style.display = 'block';
    if (aggregateOuter) aggregateOuter.style.display = 'none';
    if (aggregateText) aggregateText.style.display = 'none';
}

function renderTurnIndicator() {
    const el = document.getElementById('turn-indicator');
    if (!el) return;
    if (!player || !enemy || typeof getCurrentTurnEntry !== 'function') {
        el.innerHTML = '';
        return;
    }
    const entry = getCurrentTurnEntry();
    if (!entry || !entry.actor) {
        el.innerHTML = '';
        return;
    }
    const actorName = escapeHtml(entry.actor.name || '대상');
    if (entry.side === 'player') {
        el.innerHTML = `${actorName}의 턴! 행동을 선택하세요.`;
    } else {
        el.innerHTML = `<span style="color:#ffb3b3;">${actorName}의 턴 — 적 행동 처리 중</span>`;
    }
}

function syncV35PlayerStatDisplay() {
    if (!player || !player.stats) return;
    if (Array.isArray(player.party)) {
        syncPartyAggregateState(player);
        const members = getPartyMembers(player);
        const attackElement = document.getElementById('p-atk-val');
        const defenseElement = document.getElementById('p-def-val');
        const hpTextElement = document.getElementById('p-hp-t');
        const statusElement = document.getElementById('p-status');
        if (attackElement) attackElement.textContent = String(getEffectiveAttackPower());
        if (defenseElement) defenseElement.textContent = String(getTotalPlayerDefenseForHit());
        if (hpTextElement) hpTextElement.title = '파티 생존 HP 합계';
        if (statusElement) {
            statusElement.innerHTML = `<span style="color:#9aa4b2;font-size:0.74em;">개별 HP/스탯은 분할 게이지에 표시</span>`;
            statusElement.style.cssText += ';display:block;text-align:center;font-size:0.74em;line-height:1.25;margin:6px auto 4px;max-width:96%;white-space:normal;';
            statusElement.title = '성혼 0 · 뒤틀림 0';
        }
        return;
    }
    const stats = normalizeHumanStats(player.stats);
    const attackElement = document.getElementById('p-atk-val');
    const defenseElement = document.getElementById('p-def-val');
    const hpTextElement = document.getElementById('p-hp-t');
    const statusElement = document.getElementById('p-status');
    if (attackElement) {
        attackElement.textContent = String(getEffectiveAttackPower());
        attackElement.title = `힘 ${stats.str} + 장비 공격 보정`;
    }
    if (defenseElement) {
        defenseElement.textContent = String(getTotalPlayerDefenseForHit());
        defenseElement.title = `방어 ${stats.def} + 장비 방어 보정`;
    }
    if (hpTextElement) hpTextElement.title = `체력 ${stats.hp} · 최대 HP ${getEffectiveMaxHp()}`;
    if (statusElement) {
        statusElement.textContent =
            `힘 ${stats.str} · 방 ${stats.def} · 체 ${stats.hp} · 지 ${stats.int} · 지혜 ${stats.wis} · 민 ${stats.agi}`;
        statusElement.title = `성혼 ${stats.divinity} · 뒤틀림 ${stats.distortion}`;
    }
}

function hasPendingVictoryAdvance() {
    return !!(window._victoryState && window._victoryContinueFn);
}

function setEnemyVictoryMode(active) {
    const card = document.getElementById('enemy-card');
    if (!card) return;
    const panel = document.getElementById('enemy-victory-panel');
    Array.from(card.children).forEach((child) => {
        if (child === panel) return;
        child.style.display = active ? 'none' : '';
    });
    if (panel) panel.style.display = active ? 'block' : 'none';
    card.classList.toggle('enemy-card-victory', !!active);
}

function renderEnemyVictoryPanel() {
    const state = window._victoryState || {};
    const panel = document.getElementById('enemy-victory-panel');
    if (!panel) return;
    setEnemyVictoryMode(true);
    const goldGain = Math.max(0, Math.floor(safeNum(state.goldGain, 0)));
    const expGain = Math.max(0, Math.floor(safeNum(state.expGain, 0)));
    const rewardRows = [
        `<span class="victory-reward-gold">💰 +${goldGain}G 획득</span>`,
        expGain > 0 ? `<span>✦ EXP +${expGain}</span>` : '',
        state.defeatedBoss ? '<span>👑 보스 격파 보상 반영</span>' : '',
    ].filter(Boolean).join('');
    panel.innerHTML = `
        <div class="victory-title">VICTORY</div>
        <div class="victory-subtitle">승리!</div>
        <div class="victory-reward-line">${rewardRows}</div>
        <div class="victory-reward-note">전리품 정산 완료</div>`;
}

function renderVictoryActionButton(div) {
    div.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'next-floor-btn';
    btn.innerText = '➔ 다음 층으로 올라가기';
    btn.onclick = () => continuePendingVictoryAdvance(btn);
    div.appendChild(btn);
}

function showVictoryRewardAndAwaitContinue(payload, continueFn) {
    const p = payload && typeof payload === 'object' ? payload : {};
    window._victoryState = {
        clearedFloor: Math.max(1, Math.floor(safeNum(p.clearedFloor, floor))),
        goldGain: Math.max(0, Math.floor(safeNum(p.goldGain, 0))),
        expGain: Math.max(0, Math.floor(safeNum(p.expGain, 0))),
        defeatedBoss: !!p.defeatedBoss,
        continuing: false,
    };
    window._victoryContinueFn = typeof continueFn === 'function' ? continueFn : null;
    renderEnemyVictoryPanel();
    updatePrologueBattleControls();
    updateUi();
    renderActions();
}

function continuePendingVictoryAdvance(btn) {
    if (!hasPendingVictoryAdvance()) return;
    const state = window._victoryState;
    if (state.continuing) return;
    state.continuing = true;
    if (btn) {
        btn.disabled = true;
        btn.classList.add('next-floor-btn--loading');
        btn.innerText = '등반 중...';
    }
    const battle = document.getElementById('battle-area');
    if (battle) battle.classList.add('battle-climb-fade');
    const continueFn = window._victoryContinueFn;
    setTimeout(() => {
        window._victoryState = null;
        window._victoryContinueFn = null;
        setEnemyVictoryMode(false);
        updatePrologueBattleControls();
        if (typeof continueFn === 'function') continueFn();
        setTimeout(() => {
            if (battle) battle.classList.remove('battle-climb-fade');
        }, 320);
    }, 260);
}

function bindV35ActionButton(button, actionType) {
    if (!button) return;
    button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        if (typeof window.useAction === 'function') window.useAction(actionType, getV35ActionOptionsFromButtonElement(button));
    };
}

function getV35ActionOptionsFromButtonElement(element) {
    if (!element || !element.dataset) return null;
    const options = {};
    if (element.dataset.v35TargetId) options.targetId = element.dataset.v35TargetId;
    if (element.dataset.v35TargetSide) options.targetSide = element.dataset.v35TargetSide;
    return Object.keys(options).length ? options : null;
}

function getV35ActionFromButtonElement(element) {
    if (!element) return null;
    if (element.dataset && element.dataset.v35Action) return element.dataset.v35Action;
    if (element.id === 'attack-btn' || element.id === 'btn-attack') return '공격';
    if (element.id === 'defense-btn' || element.id === 'btn-party-defend') return '방패방어';
    if (element.id === 'heal-btn' || element.id === 'btn-heal') return '힐';
    return null;
}

function installV35ActionButtonDelegation() {
    if (window.__v35ActionButtonDelegationInstalled) return;
    window.__v35ActionButtonDelegationInstalled = true;
    document.addEventListener('click', (event) => {
        const host = document.getElementById('action-btns');
        if (!host) return;
        const button = event.target && event.target.closest ? event.target.closest('button') : null;
        if (!button || !host.contains(button)) return;
        const actionType = getV35ActionFromButtonElement(button);
        if (!actionType) return;
        event.preventDefault();
        event.stopPropagation();
        if (button.disabled || button.dataset.v35Disabled === '1') return;
        if (typeof window.useAction === 'function') window.useAction(actionType, getV35ActionOptionsFromButtonElement(button));
    }, true);
}

installV35ActionButtonDelegation();

function rebindV35PrimaryActionButtons() {
    [
        'attack-btn',
        'btn-attack',
        'defense-btn',
        'btn-party-defend',
        'heal-btn',
        'btn-heal',
    ].forEach((id) => {
        const button = document.getElementById(id);
        const actionType = getV35ActionFromButtonElement(button);
        if (button && actionType) bindV35ActionButton(button, actionType);
    });
}

function renderCombatTargetSelectionPanel(host, actionType, actor) {
    if (!host || !actor) return;
    const isAttack = actionType === '공격';
    const candidates = isAttack
        ? (typeof getLivingEnemyPartyMembers === 'function' ? getLivingEnemyPartyMembers(enemy) : [])
        : (typeof getLivingPartyMembers === 'function' ? getLivingPartyMembers(player) : []);
    if (!candidates.length) return;
    const panel = document.createElement('div');
    panel.dataset.v35TargetPanel = '1';
    panel.style.cssText = 'width:100%;margin-top:8px;padding:9px;background:#10141d;border:1px solid #293142;border-radius:8px;display:flex;flex-direction:column;gap:7px;text-align:left;';
    const title = document.createElement('div');
    title.style.cssText = 'color:#d8dee9;font-size:0.76em;font-weight:900;line-height:1.35;';
    title.textContent = isAttack
        ? `${actor.name || '파티원'}의 공격 대상 선택`
        : `${actor.name || '마법사'}의 힐 대상 선택`;
    panel.appendChild(title);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    candidates.forEach((target) => {
        const cur = Math.max(0, Math.floor(safeNum(target.curHp, 0)));
        const max = Math.max(1, Math.floor(safeNum(target.maxHp, target.hp || 1)));
        const targetButton = document.createElement('button');
        targetButton.type = 'button';
        targetButton.dataset.v35Action = actionType;
        targetButton.dataset.v35TargetId = String(target.id || target.roleKey || target.name || '');
        targetButton.dataset.v35TargetSide = isAttack ? 'enemy' : 'player';
        targetButton.innerText = `${target.name || '대상'} 선택 (${cur}/${max})`;
        targetButton.title = isAttack ? `${target.name || '대상'}만 공격` : `${target.name || '대상'}만 회복`;
        targetButton.style.cssText = `flex:1 1 118px;min-width:0;padding:7px 8px;border-radius:7px;border:1px solid ${isAttack ? '#ff6b81' : '#2ed573'};background:${isAttack ? '#2b1218' : '#102419'};color:${isAttack ? '#ffb3bf' : '#b8f7cc'};font-size:0.72em;font-weight:900;cursor:pointer;white-space:normal;line-height:1.25;`;
        const fullHealTarget = !isAttack && cur >= max;
        if (fullHealTarget) {
            targetButton.dataset.v35Disabled = '1';
            targetButton.disabled = true;
            targetButton.style.opacity = '0.45';
            targetButton.style.cursor = 'not-allowed';
            targetButton.title = `${target.name || '대상'}는 이미 최대 HP`;
        }
        bindV35ActionButton(targetButton, actionType);
        row.appendChild(targetButton);
    });
    panel.appendChild(row);

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.innerText = '대상 선택 취소';
    cancel.style.cssText = 'align-self:flex-end;padding:5px 8px;border-radius:6px;border:1px solid #444;background:#151515;color:#aaa;font-size:0.7em;font-weight:800;cursor:pointer;';
    cancel.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        clearCombatTargetSelection();
        renderActions();
    };
    panel.appendChild(cancel);
    host.appendChild(panel);
}

function renderActions() {
    const div = document.getElementById('action-btns');
    if (!div) return;
    div.style.position = 'relative';
    div.style.zIndex = '1000';
    div.style.pointerEvents = 'auto';
    if (hasPendingVictoryAdvance()) {
        renderVictoryActionButton(div);
        return;
    }
    if (!enemy || window._encounterPhaseActive) {
        clearCombatTargetSelection();
        div.innerHTML = '';
        return;
    }
    if (typeof hasLivingEnemies === 'function' ? !hasLivingEnemies() : safeNum(enemy.curHp, 0) <= 0) {
        clearCombatTargetSelection();
        div.innerHTML = '';
        return;
    }
    const turn = typeof getCurrentTurnEntry === 'function' ? getCurrentTurnEntry() : null;
    if (!turn) {
        clearCombatTargetSelection();
        div.innerHTML = '<div style="color:#888;font-size:0.85em;font-weight:800;padding:8px 0;">턴 순서 계산 중...</div>';
        if (typeof startInitiativeTurnLoop === 'function') setTimeout(() => startInitiativeTurnLoop(), 0);
        return;
    }
    if (turn.side !== 'player') {
        clearCombatTargetSelection();
        div.innerHTML = `
            <div style="width:100%;color:#ffb3b3;font-size:0.85em;font-weight:800;padding:8px 0;">${escapeHtml(turn.actor && turn.actor.name ? turn.actor.name : '적')} 행동 처리 중...</div>
            <button id="attack-btn" type="button" data-v35-action="공격" disabled style="background:#444;opacity:0.45;cursor:not-allowed;">⚔️ 공격</button>
            <button id="defense-btn" type="button" data-v35-action="방패방어" disabled style="background:#444;opacity:0.45;cursor:not-allowed;">🛡️ 파티 방어</button>
            <button id="heal-btn" type="button" data-v35-action="힐" data-v35-heal="1" disabled style="background:#444;opacity:0.45;cursor:not-allowed;">✨ 힐</button>`;
        if (typeof updateCombatButtonsLockState === 'function') updateCombatButtonsLockState();
        return;
    }
    div.innerHTML = '';
    const actor = turn.actor || {};
    const actorName = actor.name || '파티원';
    const canAttack = typeof canActorAttackThisTurn === 'function'
        ? canActorAttackThisTurn(actor)
        : !(safeNum(actor.attackLockTurns, 0) > 0 || actor._attackLockedForThisTurn || actor.weaponDisabledThisTurn);
    const woundedAllies = typeof getLivingPartyMembers === 'function'
        ? getLivingPartyMembers(player).some((member) => safeNum(member.curHp, 0) < safeNum(member.maxHp, member.hp || 1))
        : false;
    const canHeal = !!(
        actor &&
        (actor.roleKey === 'mage' || actor.archetype === 'mage' || (Array.isArray(actor.magic) && actor.magic.includes('heal'))) &&
        woundedAllies
    );
    const makeBtn = (id, text, actionType, bg, disabled, title) => {
        const btn = document.createElement('button');
        btn.id = id;
        btn.type = 'button';
        btn.dataset.v35Action = actionType;
        if (id === 'heal-btn' || id === 'btn-heal') btn.dataset.v35Heal = '1';
        btn.innerText = text;
        btn.style.background = bg;
        btn.style.position = 'relative';
        btn.style.zIndex = '1000';
        btn.style.pointerEvents = 'auto';
        btn.title = title || '';
        if (disabled) {
            btn.dataset.v35Disabled = '1';
            btn.disabled = true;
            btn.style.opacity = '0.45';
            btn.style.cursor = 'not-allowed';
        }
        bindV35ActionButton(btn, actionType);
        div.appendChild(btn);
        return btn;
    };
    makeBtn(
        'attack-btn',
        `⚔️ 공격`,
        '공격',
        player.color || '#d8d8d8',
        false,
        canAttack ? `${actorName}의 힘·민첩·공속 기반 공격` : `${actorName}는 공속 패널티 상태지만 상태 머신이 턴을 진행합니다.`
    );
    makeBtn(
        'defense-btn',
        '🛡️ 파티 방어',
        '방패방어',
        '#888',
        false,
        `${actorName}가 이번 라운드 아군 전체 방어 보정`
    );
    makeBtn(
        'heal-btn',
        '✨ 힐',
        '힐',
        '#4b6b50',
        false,
        canHeal ? `${actorName}의 지혜 기반 단일 대상 치유` : '마법사 턴이며 회복할 아군이 있을 때 가장 효과적'
    );
    clearCombatTargetSelection();
    rebindV35PrimaryActionButtons();
    if (typeof updateCombatButtonsLockState === 'function') updateCombatButtonsLockState();
    return;
}

function renderPassiveContractHistoryPanels() {
    const targets = [
        { sidebarId: 'sidebar-normal', panelId: 'passive-history-normal' },
    ];
    const rows = (player && Array.isArray(player.passiveContractHistory) ? player.passiveContractHistory : [])
        .slice(0, 12)
        .map((x) => `<div style="padding:5px 6px;border-bottom:1px solid #2a2a2a;color:#aab7c9;font-size:0.76em;line-height:1.4;">${escapeHtml(x)}</div>`)
        .join('');
    const body = rows || '<div style="color:#666;font-size:0.76em;padding:6px;line-height:1.4;">아직 각인 기록이 없습니다.</div>';
    for (const t of targets) {
        const sb = document.getElementById(t.sidebarId);
        if (!sb) continue;
        let panel = document.getElementById(t.panelId);
        if (!panel) {
            panel = document.createElement('div');
            panel.id = t.panelId;
            panel.style.cssText = 'width:100%;margin-top:10px;padding-top:8px;border-top:1px solid #2b2b2b;';
            sb.appendChild(panel);
        }
        panel.innerHTML = `<h4 style="color:#d980fa;margin:0 0 6px 0;font-size:0.86em;">🩸 영구 각인 기록</h4><div style="max-height:190px;overflow-y:auto;background:#111;border:1px solid #27253a;border-radius:8px;">${body}</div>`;
    }
}

function updateUi() {
    if (!player) return;
    syncV35PlayerStatDisplay();
    if (!enemy) {
        const shopEl = document.getElementById('shop-area');
        if (shopEl && shopEl.style.display === 'block') {
            const pMax = getEffectiveMaxHp();
            const pCur = Math.max(0, safeNum(player.curHp, 0));
            const g = safeNum(gold, 0);
            const pots = Math.max(0, safeNum(player.potions, 0));
            const sh = document.getElementById('shop-hp-t'),
                sgt = document.getElementById('shop-gold-t');
            if (sh) sh.innerText = `${pCur}/${pMax}`;
            if (sgt) sgt.innerText = String(g);
            ['floor-t', 'gold-t', 'potion-t'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            ['floor-t-battle', 'gold-t-battle', 'potion-t-battle'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            renderInventoryPanel();
            renderPassiveContractHistoryPanels();
        } else if (window._encounterPhaseActive) {
            const g = safeNum(gold, 0);
            const pots = Math.max(0, safeNum(player.potions, 0));
            ['floor-t-battle', 'gold-t-battle', 'potion-t-battle'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            ['floor-t', 'gold-t', 'potion-t'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            renderInventoryPanel();
            renderPassiveContractHistoryPanels();
        }
        return;
    }
    const pMax = getEffectiveMaxHp();
    const pCur = Math.max(0, safeNum(player.curHp, 0));
    if (enemy && Array.isArray(enemy.party) && typeof syncEnemyPartyAggregateState === 'function') {
        syncEnemyPartyAggregateState(enemy);
    }
    const eHp = Math.max(1, safeNum(enemy.hp, safeNum(enemy.maxHp, 1)));
    const eCur = Math.max(0, safeNum(enemy.curHp, 0));
    const g = safeNum(gold, 0);
    const pots = Math.max(0, safeNum(player.potions, 0));
    const mercUi = isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0;
    const fm = player.fieldMerc;
    const summLine = document.getElementById('p-summon-line');
    const critMultEl = document.getElementById('p-crit-mult-val');
    if (mercUi) {
        const mMax = Math.max(1, safeNum(fm.mercMaxHp, 1));
        const mCur = Math.max(0, safeNum(fm.mercHp, 0));
        document.getElementById('p-name').innerHTML = `<span style="color:#2ed573;">🛡️ 전열</span> ${fm.sourceName}`;
        document.getElementById('p-hp').style.width = `${Math.max(0, (mCur / mMax) * 100)}%`;
        document.getElementById('p-hp-t').innerText = `어그로 ${mCur} / ${mMax}`;
        if (summLine) {
            summLine.innerHTML = `<span style="color:#e67e22;">🎖️ 후열 · 지휘</span> <b>${escapeHtml(getPlayerClassDisplayName())}</b> <span style="color:#888;">| HP ${pCur}/${pMax} · 악성 ${Math.round(getMercGachaBadChance() * 100)}% · 지원 ${getMercGachaCost()}G</span>`;
        }
        document.getElementById('p-atk-val').textContent = String(getMercEffectiveAttackPower());
        document.getElementById('p-def-val').textContent = String(safeNum(fm.mercBonusDef, 0));
        document.getElementById('p-crit-val').textContent = `${Math.round(getMercEffectiveCritForMercAttack())}%`;
        const ecmM = getMercEffectiveCritMultForMercAttack();
        if (critMultEl) critMultEl.textContent = `${(Number.isFinite(ecmM) ? ecmM : 1.8).toFixed(2)}x`;
        const lsMain = document.getElementById('p-lifesteal-val');
        const lsNote = document.getElementById('p-lifesteal-note');
        if (lsMain) lsMain.textContent = `${Math.round(safeNum(fm.mercBonusLifesteal, 0) * 100)}%`;
        if (lsNote) lsNote.textContent = '용병 장비 흡혈 (전열)';
    } else {
        const isPartyRun = Array.isArray(player.party);
        document.getElementById('p-name').innerText = isPartyRun ? '성혼 원정대 · 3인 파티' : getPlayerClassDisplayName();
        document.getElementById('p-hp').style.width = `${Math.max(0, (pCur / pMax) * 100)}%`;
        document.getElementById('p-hp-t').innerText = `${pCur} / ${pMax}`;
        if (summLine) {
            const synHint = '';
            const synStatus = '';
            const lvTxt = player.runLevel ? ` · Lv.${player.runLevel}` : '';
            if (isPartyRun) {
                summLine.style.cssText += ';display:block;text-align:center;max-width:92%;margin:6px auto 4px;font-size:0.72em;line-height:1.25;';
                summLine.innerHTML = '<span style="color:#888;">민첩 순서 기반 개별 턴제</span>';
            } else if (isMercenaryCaptainJob()) {
                summLine.innerHTML = `<span style="color:#e67e22;">🎖️ 지휘관 ${escapeHtml(getPlayerClassDisplayName())}</span> <span style="color:#888;">| HP ${pCur}/${pMax}${lvTxt} · 전열 없음${player.mercCooldownTurns > 0 ? ` · 재가동 ${player.mercCooldownTurns}T` : ''}${synHint}</span>${synStatus}`;
            } else if (player.summon && player.summon.name) {
                if (player.name === '소환사' && floor < 100) {
                    summLine.innerHTML = `<span style="color:#a55eea;">소환:</span> ${player.summon.name} <span style="color:#ff4757;font-weight:800;">(잠김: 100층)</span>${synHint}${synStatus}`;
                } else {
                    summLine.innerHTML = `<span style="color:#a55eea;">소환:</span> ${player.summon.name}${synHint}${synStatus}`;
                }
            }
            else if (player.name === '성직자') {
                const dp = formatDivinePowerForDisplay(safeNum(player.divinePower, 0));
                const gm = safeNum(player.divineGainMult, 1);
                const st = player.priestBlessed ? '✨ 신의 가호' : '·';
                summLine.innerHTML = `<span style="color:#888;font-size:0.85em;"><b>${escapeHtml(getPlayerClassDisplayName())}</b>${lvTxt} · <span style="color:#f1c40f;">✨ 신성력 ${dp}/${DIVINE_POWER_MAX}</span> · 획득×${gm.toFixed(2)} · ${st}${synHint}</span>${synStatus}`;
            } else summLine.innerHTML = `<span style="color:#888;font-size:0.85em;"><b>${escapeHtml(getPlayerClassDisplayName())}</b>${lvTxt}${synHint}</span>${synStatus}`;
        }
        document.getElementById('p-atk-val').textContent = String(getEffectiveAttackPower());
        document.getElementById('p-def-val').textContent = String(getTotalPlayerDefenseForHit());
        const critInfo = getCritInfo();
        document.getElementById('p-crit-val').textContent = `${Math.round(safeNum(critInfo.effectiveCrit, 0))}%`;
        const ecm = getEffectiveCritMult();
        if (critMultEl) critMultEl.textContent = `${(Number.isFinite(ecm) ? ecm : 1.8).toFixed(2)}x`;
        const lsOv = getLifestealOverflowAtk();
        const lsMain = document.getElementById('p-lifesteal-val');
        const lsNote = document.getElementById('p-lifesteal-note');
        if (lsMain) lsMain.textContent = `${Math.round(safeNum(getLifestealEffective(), 0) * 100)}%`;
        if (lsNote) lsNote.textContent = lsOv > 0 ? `흡혈 초과분 → 공격력 +${lsOv}` : '';
        const statTag = document.querySelector('#player-card .stat-tag');
        if (statTag && isPartyRun) {
            statTag.style.fontSize = '0.72em';
            statTag.style.lineHeight = '1.45';
            statTag.style.marginTop = '6px';
            statTag.style.whiteSpace = 'normal';
        }
    }
    renderPartyHpBars();
    renderTurnIndicator();
    const ultLine = document.getElementById('p-ult-stack-line');
    if (ultLine) {
        if (player.unlockedSkill && floor >= 20) ultLine.innerHTML = `<span style="color:#9b59b6;">궁극기</span> [${safeNum(player.ultStack, 0)}/${Math.max(1, safeNum(player.ultMaxStack, 1))}]`;
        else ultLine.innerHTML = '';
    }
    ['floor-t-battle','gold-t-battle','potion-t-battle'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.innerText=[floor,g,pots][i];});
    ['floor-t','gold-t','potion-t'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.innerText=[floor,g,pots][i];});
    const sh=document.getElementById('shop-hp-t'), sg=document.getElementById('shop-gold-t');
    if(sh)sh.innerText=`${pCur}/${pMax}`;
    if(sg)sg.innerText=String(g);
    if (hasPendingVictoryAdvance()) {
        renderEnemyVictoryPanel();
        renderInventoryPanel();
        renderPassiveContractHistoryPanels();
        return;
    }
    setEnemyVictoryMode(false);
    const enemyNameEl = document.getElementById('e-name');
    if (enemyNameEl) {
        const hint = window._enemyThinkingHint ? `<div style="color:#ffb3b3;font-size:0.72em;font-weight:600;margin-top:3px;">${escapeHtml(window._enemyThinkingHint)}</div>` : '';
        const livingCount = Array.isArray(enemy.party) ? getLivingEnemyPartyMembers(enemy).length : 1;
        enemyNameEl.innerHTML = `${escapeHtml(enemy.name)}${Array.isArray(enemy.party) ? ` · ${livingCount}명 생존` : ''}${hint}`;
    }
    document.getElementById('e-hp').style.width=`${Math.max(0,(eCur/eHp)*100)}%`;
    document.getElementById('e-hp-t').innerText=`${eCur} / ${eHp}`;
    document.getElementById('e-atk-val').innerText=String(safeNum(enemy.atk, 0));
    document.getElementById('e-def-val').innerText=String(safeNum(enemy.def, 0));
    renderEnemyHpBars();
    renderTurnIndicator();
    const enemyStatus = document.querySelector('#enemy-card .status-badge');
    if (enemyStatus) {
        if (Array.isArray(enemy.party)) {
            enemyStatus.innerHTML = `<span style="color:#9aa4b2;font-size:0.72em;">적 개별 HP는 분할 게이지에 표시</span>`;
            enemyStatus.style.cssText += ';display:block;text-align:center;font-size:0.72em;line-height:1.25;margin:6px auto 4px;max-width:96%;white-space:normal;';
        } else {
            enemyStatus.innerHTML = '';
        }
    }
    renderInventoryPanel();
    renderPassiveContractHistoryPanels();
}

function writeLog(msg) {
    if (!Array.isArray(window._combatLogHistory)) window._combatLogHistory = [];
    window._combatLogHistory.unshift(String(msg));
    if (window._combatLogHistory.length > 220) window._combatLogHistory.length = 220;
    renderSlimBattleLog();
    const p=`<p style="margin:4px 0;border-bottom:1px solid #333;padding-bottom:4px;">${msg}</p>`;
    const battle = document.getElementById('battle-area');
    const isBattle = battle && battle.style.display === 'block';
    if(!isBattle){const l=document.getElementById('log');if(l)l.innerHTML=p+l.innerHTML;}
}

function renderSlimBattleLog() {
    const strip = document.getElementById('battle-log-strip');
    if (!strip) return;
    strip.style.position = 'relative';
    strip.style.zIndex = '1';
    strip.style.overflow = 'hidden';
    const rows = (Array.isArray(window._combatLogHistory) ? window._combatLogHistory : [])
        .slice(0, 3)
        .map((msg) => `<div class="battle-log-line">${msg}</div>`)
        .join('');
    strip.innerHTML = rows || '<div class="battle-log-line battle-log-line-empty">전투 기록 대기</div>';
}

window.renderActions = renderActions;
window.renderPassiveContractHistoryPanels = renderPassiveContractHistoryPanels;
window.updateUi = updateUi;
window.writeLog = writeLog;
window.checkStoryMilestone = checkStoryMilestone;
window.applyStoryChoiceImpact = applyStoryChoiceImpact;
window.adjustPlayerStoryState = adjustPlayerStoryState;
// ===== migrated from bootstrapCore.js =====
/** 시즌 1 (베타) — 최초 1회 전체 진행 데이터 초기화 */
(function applySeason1BetaWipeOnce() {
    const SK = 'dungeon_season_id';
    const SEASON = '1-beta-wipe-s1full';
    if (localStorage.getItem(SK) === SEASON) return;
    const wipe = [
        'dungeon_meta_v7',
        'dungeon_meta_v7_f0',
        'dungeon_meta_v7_f1',
        'dungeon_meta_v7_f2',
        'dungeon_meta_v7_active_file',
        'dungeon_meta_v7_file_migrated_v2',
        'perma_stats',
        'perma_buy_count',
        'saved_gold',
        'item_collection_v5',
        'unlocked_floors_global',
        'unlocked_floors_워리어',
        'unlocked_floors_헌터',
        'unlocked_floors_마법사',
        'summon_contract_json',
        'summon_altar_done',
        'dungeon_quicksave_v7',
        'perma_migrated_v62',
        'perma_migrated_v651',
        'acc_perma_migrated_v71',
        'v703_global_perma_migrated',
        'meta_v7_legacy_migrated',
        'perma_repair_1',
        'user_exported_save_v7',
    ];
    try {
        wipe.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(SK, SEASON);
    } catch (e) {
        /* ignore */
    }
})();

firebase.initializeApp({
    apiKey: "AIzaSyAVWf5U6eBm2ofCcvdirMxkyfZs_1uVIiU",
    authDomain: "project-dungeon-82f2a.firebaseapp.com",
    projectId: "project-dungeon-82f2a",
    storageBucket: "project-dungeon-82f2a.firebasestorage.app",
    messagingSenderId: "301367810513",
    appId: "1:301367810313:web:42979150db5ea7b536a8f0"
});
const auth = firebase.auth();
const db = firebase.firestore();

if (!localStorage.getItem('perma_migrated_v62')) {
    localStorage.removeItem('perma_stats');
    localStorage.removeItem('perma_buy_count');
    localStorage.removeItem('saved_gold');
    localStorage.setItem('perma_migrated_v62', 'true');
}
if (!localStorage.getItem('perma_migrated_v651')) {
    try {
        const ps = JSON.parse(localStorage.getItem('perma_stats') || '{}');
        if ('potion' in ps) delete ps.potion;
        localStorage.setItem('perma_stats', JSON.stringify(ps));
        const bc = JSON.parse(localStorage.getItem('perma_buy_count') || '{}');
        Object.keys(bc).forEach((k) => { if (k.startsWith('pot_')) delete bc[k]; });
        localStorage.setItem('perma_buy_count', JSON.stringify(bc));
    } catch (e) { /* ignore */ }
    localStorage.setItem('perma_migrated_v651', 'true');
}

function clearRankRealtimeSubs() {
    if (Array.isArray(rankRealtimeUnsubs)) {
        rankRealtimeUnsubs.forEach((u) => {
            try { if (typeof u === 'function') u(); } catch (e) { /* ignore */ }
        });
    }
    rankRealtimeUnsubs = [];
}
function getRankTone(rank) {
    if (rank === 1) return { border: '#f1c40f', color: '#f1c40f', bg: '#2b2410', label: '🥇' };
    if (rank === 2) return { border: '#c0c0c0', color: '#d8d8d8', bg: '#232323', label: '🥈' };
    if (rank === 3) return { border: '#cd7f32', color: '#d99a5a', bg: '#2a2018', label: '🥉' };
    return { border: '#111', color: '#bbb', bg: '#171717', label: `#${rank}` };
}
function formatTopPercent(rank, total) {
    const t = Math.max(1, safeNum(total, 1));
    const r = Math.max(1, safeNum(rank, 1));
    const p = Math.max(0.1, (r / t) * 100);
    return `상위 ${p.toFixed(1)}%`;
}
function getCurrentUserKey() {
    if (!currentUser) return '';
    return String(currentUser.uid || currentUser.email || '').trim();
}
function getCurrentUserNick() {
    if (!currentUser) return '';
    const em = String(currentUser.email || '');
    return em ? em.split('@')[0] : 'unknown';
}
function sortRankRows(rows) {
    return rows.sort((a, b) => {
        const fa = safeNum(a.floor, 0);
        const fb = safeNum(b.floor, 0);
        if (fb !== fa) return fb - fa;
        const ta = safeNum(a.updatedAtMs, 0);
        const tb = safeNum(b.updatedAtMs, 0);
        return tb - ta;
    });
}
function renderUserRankInfo() {
    const el = document.getElementById('user-rank-info');
    if (!el) return;
    if (!currentUser) {
        el.innerHTML = '';
        return;
    }
    const meId = getCurrentUserKey();
    const meNick = getCurrentUserNick();
    const chips = [];
    for (const job of RANK_BASE_JOBS) {
        const rows = rankRealtimeCache[job] || [];
        if (!rows.length) continue;
        const idx = rows.findIndex((r) => r && (String(r.userId || '') === meId || String(r.email || '') === meNick));
        if (idx < 0) continue;
        const rank = idx + 1;
        const tone = getRankTone(rank);
        const text = rank > 100 ? `${job} ${formatTopPercent(rank, rows.length)}` : `${job} 서버 ${rank}등`;
        chips.push(`<span style="display:inline-block;margin:2px;padding:4px 8px;border-radius:999px;border:1px solid ${tone.border};background:${tone.bg};color:${tone.color};font-size:0.74em;font-weight:800;">${text}</span>`);
    }
    if (!chips.length) {
        el.innerHTML = `<div style="color:#666;font-size:0.75em;line-height:1.4;">아직 기록이 없습니다.</div>`;
    } else {
        el.innerHTML = chips.join('');
    }
}
function renderRankBoard() {
    const listEl = document.getElementById('rank-list');
    if (!listEl) return;
    if (!currentUser) {
        listEl.innerHTML = '<span style="color:#555;">로그인 후 확인 가능합니다.</span>';
        return;
    }
    let html = '';
    for (const job of RANK_BASE_JOBS) {
        const rows = rankRealtimeCache[job] || [];
        const jc = job === '헌터' ? '#2ed573' : job === '마법사' ? '#1e90ff' : job === '용병단장' ? '#e67e22' : '#ff4757';
        html += `<div style="margin-bottom:16px;"><b style="color:${jc};font-size:0.95em;border-bottom:1px solid #333;display:block;padding-bottom:4px;margin-bottom:8px;">⚔️ ${job} 전직별 실시간 랭킹</b>`;
        if (!rows.length) {
            html += `<div style="color:#555;font-size:0.85em;">기록 없음</div>`;
        } else {
            rows.slice(0, 50).forEach((r, i) => {
                const rank = i + 1;
                const tone = getRankTone(rank);
                const medal = rank <= 3 ? tone.label : `<span style="color:#888;">#${rank}</span>`;
                const jd = r.job !== r.baseJob ? `${r.baseJob}→${r.job}` : r.job;
                const name = r.displayName || r.email || 'unknown';
                html += `<div style="margin-bottom:6px;font-size:0.85em;padding:6px 8px;border:1px solid ${tone.border};border-radius:8px;background:${tone.bg};">
${medal} <b style="color:${tone.color};">${r.floor}층</b> <span style="color:#888;">(${jd})</span> <span style="color:#aaa;">👤${name}</span><br>
<span style="color:#ff4757;font-size:0.8em;margin-left:18px;">💀 ${r.killer || '알 수 없음'}</span>
</div>`;
            });
            if (rows.length > 50) {
                html += `<div style="color:#666;font-size:0.75em;margin-top:4px;">표시는 50위까지, 실시간 집계는 전체 인원 기준입니다.</div>`;
            }
        }
        html += `</div>`;
    }
    listEl.innerHTML = html;
}
function subscribeRankRealtime() {
    clearRankRealtimeSubs();
    rankRealtimeCache = {};
    const q = db.collection('global_ranks');
    const unsub = q.onSnapshot(
        (snap) => {
            const grouped = {};
            RANK_BASE_JOBS.forEach((j) => { grouped[j] = []; });
            snap.forEach((doc) => {
                const d = doc.data() || {};
                const bj = d.baseJob || '';
                if (!RANK_BASE_JOBS.includes(bj)) return;
                const ts = d.timestamp && typeof d.timestamp.toMillis === 'function' ? d.timestamp.toMillis() : 0;
                grouped[bj].push({
                    userId: d.userId || '',
                    email: d.email || 'unknown',
                    displayName: d.displayName || d.email || 'unknown',
                    job: d.job || bj,
                    baseJob: bj,
                    floor: safeNum(d.floor, 0),
                    killer: d.killer || '알 수 없음',
                    updatedAtMs: ts,
                });
            });
            for (const job of RANK_BASE_JOBS) {
                rankRealtimeCache[job] = sortRankRows(grouped[job] || []);
            }
            renderRankBoard();
            renderUserRankInfo();
        },
        () => {
            rankRealtimeCache = {};
            renderRankBoard();
            renderUserRankInfo();
        }
    );
    rankRealtimeUnsubs.push(unsub);
}
let pendingShop = false;
let potionUsedThisTurn = false;
let totalGoldEarned = 0;
let shopVisitCount = 0;
/** 공격 버튼 GCD(광클 방지), 타격감 연출과 동일 500ms */
let attackGcdUntil = 0;
const ATTACK_GCD_MS = 500;
/** 패치 노트/UI와 맞춰 두기 — 캐시 적용 여부 확인용 */
const GAME_BUILD = 'S1';
/** 베이스캠프 오버레이 스크롤 유지 */
window.__baseCampScrollTop = 0;
/** 필드 용병 기본 피해 계수(전역 보정) */
const MERC_DMG_GLOBAL_SCALE = 1.56;
/** 층수에 따른 용병 딜/HP 성장 상한(과도한 폭주 방지) */
const MERC_FLOOR_SCALE_CAP = 1.65;
function clearSummonRunStorage() {
    localStorage.removeItem('summon_altar_done');
    localStorage.removeItem('summon_contract_json');
}

function loadSummonFromStorage() {
    try {
        const raw = localStorage.getItem('summon_contract_json');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) { return null; }
}

function saveSummonToStorage(s) {
    if (s) localStorage.setItem('summon_contract_json', JSON.stringify(s));
    else localStorage.removeItem('summon_contract_json');
}

/** localStorage 깨짐/부분 저장 대비 — undefined 합산으로 NaN 방지 */
function safeNum(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function normalizePlayerFloorGrowth(raw) {
    if (typeof normalizeFloorGrowth === 'function') return normalizeFloorGrowth(raw);
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
        floors: Math.max(0, Math.floor(safeNum(src.floors, 0))),
        atk: Math.max(0, Math.floor(safeNum(src.atk, 0))),
        hp: Math.max(0, Math.floor(safeNum(src.hp, 0))),
    };
}

function uniqueTacticalSkillKeys(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    const out = [];
    arr.forEach((x) => {
        const key = String(x || '').trim();
        if (!key || out.includes(key)) return;
        if (typeof getTacticalSkillDef === 'function' && !getTacticalSkillDef(key)) return;
        out.push(key);
    });
    return out;
}

function uniqueClaimedTacticalMilestones(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    return Array.from(
        new Set(
            arr
                .map((x) => Math.floor(safeNum(x, 0)))
                .filter((x) => Number.isFinite(x) && x > 0)
        )
    );
}

function ensurePlayerRunProgressFields(slot) {
    if (!player) return;
    let growth = normalizePlayerFloorGrowth(player.floorGrowth || (slot && slot.floorGrowth));
    if ((!growth.floors || (!growth.atk && !growth.hp)) && floor > 1 && typeof computeFloorGrowthForClears === 'function') {
        growth = computeFloorGrowthForClears(Math.max(0, floor - 1));
    }
    player.floorGrowth = growth;
    player.tacticalSkills = uniqueTacticalSkillKeys([
        ...(slot && Array.isArray(slot.tacticalSkills) ? slot.tacticalSkills : []),
        ...(Array.isArray(player.tacticalSkills) ? player.tacticalSkills : []),
    ]);
    player.tacticalSkillMilestonesClaimed = uniqueClaimedTacticalMilestones([
        ...(slot && Array.isArray(slot.tacticalSkillMilestonesClaimed) ? slot.tacticalSkillMilestonesClaimed : []),
        ...(Array.isArray(player.tacticalSkillMilestonesClaimed) ? player.tacticalSkillMilestonesClaimed : []),
    ]);
    if (!player.tacticalSkillUses || typeof player.tacticalSkillUses !== 'object') player.tacticalSkillUses = {};
    player.tacticalFocusReady = !!player.tacticalFocusReady;
    player.tacticalParryReady = !!player.tacticalParryReady;
    player.tacticalBarrierReady = !!player.tacticalBarrierReady;
    ensurePlayerStoryState(slot);
}

function normalizeUiPlayerState(raw) {
    if (typeof normalizePlayerState === 'function') return normalizePlayerState(raw);
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
        corruption: Math.max(0, Math.floor(safeNum(src.corruption, 0))),
        purification: Math.max(0, Math.floor(safeNum(src.purification, 0))),
    };
}

function ensurePlayerStoryState(slot) {
    const fromPlayer = player && player.playerState ? player.playerState : null;
    const fromSlot = slot && slot.playerState ? slot.playerState : null;
    const merged = normalizeUiPlayerState(fromPlayer || fromSlot || playerState);
    playerState = merged;
    if (player) {
        player.playerState = merged;
        const title = typeof getStoryTitleForState === 'function' ? getStoryTitleForState(merged, floor) : null;
        if (title) player.storyTitle = title;
        else delete player.storyTitle;
    }
    return merged;
}

function syncPlayerStoryStateToMeta() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined' || typeof MetaRPG.syncRunProgress !== 'function') return;
    ensurePlayerStoryState(player.metaSlotId && typeof MetaRPG.getSlotById === 'function' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    MetaRPG.syncRunProgress(player.metaSlotId, {
        playerState: player.playerState,
    });
}

function adjustPlayerStoryState(delta, reason) {
    if (!player) return null;
    const d = delta && typeof delta === 'object' ? delta : {};
    const cur = ensurePlayerStoryState(player.metaSlotId && typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    const next = normalizeUiPlayerState({
        corruption: cur.corruption + Math.max(0, Math.floor(safeNum(d.corruption, 0))),
        purification: cur.purification + Math.max(0, Math.floor(safeNum(d.purification, 0))),
    });
    playerState = next;
    player.playerState = next;
    syncPlayerStoryStateToMeta();
    const label = reason ? ` — ${escapeHtml(String(reason))}` : '';
    writeLog(
        `[운명] 타락 ${next.corruption} / 정화 ${next.purification}${label ? `<span style="color:#888;">${label}</span>` : ''}`
    );
    updateUi();
    return next;
}

function applyStoryChoiceImpact(choiceKey) {
    const impact = typeof getStoryChoiceImpact === 'function' ? getStoryChoiceImpact(choiceKey) : null;
    if (!impact) return null;
    return adjustPlayerStoryState(impact, impact.label || choiceKey);
}

function syncPlayerRunProgressToMeta() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined' || typeof MetaRPG.syncRunProgress !== 'function') return;
    ensurePlayerStoryState(MetaRPG.getSlotById(player.metaSlotId));
    MetaRPG.syncRunProgress(player.metaSlotId, {
        floorGrowth: player.floorGrowth,
        playerState: player.playerState,
        tacticalSkills: player.tacticalSkills,
        tacticalSkillMilestonesClaimed: player.tacticalSkillMilestonesClaimed,
        starterEquipment: (player.items || []).filter((it) => {
            if (!it) return false;
            return typeof isStarterGearItem === 'function'
                ? isStarterGearItem(it)
                : !!(it.isStarterGear || it.starterGearKind);
        }),
        currentPromotion: player.currentPromotion || null,
    });
}

function applyFloorGrowthRewardForClear(clearedFloor) {
    if (!player) return;
    ensurePlayerRunProgressFields(player.metaSlotId && typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    const step = typeof getFloorGrowthStep === 'function' ? getFloorGrowthStep() : { atk: 1, hp: 5 };
    const atkGain = Math.max(0, Math.floor(safeNum(step.atk, 1)));
    const hpGain = Math.max(0, Math.floor(safeNum(step.hp, 5)));
    if (atkGain <= 0 && hpGain <= 0) return;
    player.floorGrowth = normalizePlayerFloorGrowth(player.floorGrowth);
    player.floorGrowth.floors += 1;
    player.floorGrowth.atk += atkGain;
    player.floorGrowth.hp += hpGain;
    player.atk = Math.max(1, safeNum(player.atk, 1) + atkGain);
    player.maxHp = Math.max(1, safeNum(player.maxHp, 1) + hpGain);
    player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0) + hpGain);
    writeLog(
        `[성장] ${clearedFloor}층 생존 보너스 — 공격 +${atkGain}, 최대 체력 +${hpGain} <span style="color:#888;">(누적 공격 +${player.floorGrowth.atk}, 체력 +${player.floorGrowth.hp})</span>`
    );
    syncPlayerRunProgressToMeta();
}

function getPendingTacticalSkillMilestone(clearedFloor) {
    if (!player || typeof getTacticalSkillMilestoneForFloor !== 'function') return null;
    ensurePlayerRunProgressFields(player.metaSlotId && typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    const milestone = getTacticalSkillMilestoneForFloor(clearedFloor);
    if (!milestone) return null;
    const claimed = uniqueClaimedTacticalMilestones(player.tacticalSkillMilestonesClaimed);
    if (claimed.includes(milestone.floor)) return null;
    const owned = uniqueTacticalSkillKeys(player.tacticalSkills);
    const choices = (Array.isArray(milestone.choices) ? milestone.choices : []).filter((key) => {
        if (owned.includes(key)) return false;
        return typeof getTacticalSkillDef !== 'function' ? true : !!getTacticalSkillDef(key);
    });
    if (!choices.length) {
        player.tacticalSkillMilestonesClaimed = uniqueClaimedTacticalMilestones([...claimed, milestone.floor]);
        syncPlayerRunProgressToMeta();
        return null;
    }
    return { floor: milestone.floor, choices };
}

function renderTacticalSkillRewardOverlay(milestone, onDone) {
    const existing = document.getElementById('tactical-skill-reward-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'tactical-skill-reward-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.86);z-index:10085;display:flex;align-items:center;justify-content:center;padding:16px;';
    const rows = milestone.choices
        .map((key) => {
            const def = typeof getTacticalSkillDef === 'function' ? getTacticalSkillDef(key) : null;
            const icon = def && def.icon ? def.icon : '✦';
            const name = def && def.name ? def.name : key;
            const desc = def && def.shortDesc ? def.shortDesc : '전술 스킬';
            return `<button type="button" class="tactical-skill-choice" data-skill-key="${escapeHtmlAttr(
                key
            )}" style="width:100%;background:#141722;border:1px solid #46506a;color:#e8edf7;border-radius:8px;padding:13px 14px;margin-top:10px;text-align:left;cursor:pointer;font-weight:800;line-height:1.45;">
                <span style="font-size:1.05em;color:#f1c40f;">${icon} ${escapeHtml(name)}</span>
                <span style="display:block;color:#94a3b8;font-size:0.82em;font-weight:600;margin-top:4px;">${escapeHtml(desc)}</span>
            </button>`;
        })
        .join('');
    overlay.innerHTML = `
        <div style="max-width:460px;width:100%;background:#10131d;border:1px solid #f1c40f;border-radius:10px;padding:20px;box-shadow:0 18px 60px rgba(0,0,0,0.58);">
            <div style="color:#f1c40f;font-weight:900;font-size:1.05em;margin-bottom:6px;">전술 각성 · ${milestone.floor}층 돌파</div>
            <p style="color:#9aa4b2;font-size:0.86em;line-height:1.55;margin:0 0 8px;">다음 전투부터 사용할 전술 스킬 하나를 선택하세요.</p>
            ${rows}
        </div>`;
    overlay.querySelectorAll('.tactical-skill-choice').forEach((btn) => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-skill-key');
            const def = typeof getTacticalSkillDef === 'function' ? getTacticalSkillDef(key) : null;
            player.tacticalSkills = uniqueTacticalSkillKeys([...(player.tacticalSkills || []), key]);
            player.tacticalSkillMilestonesClaimed = uniqueClaimedTacticalMilestones([
                ...(player.tacticalSkillMilestonesClaimed || []),
                milestone.floor,
            ]);
            if (player.metaSlotId && typeof MetaRPG !== 'undefined' && typeof MetaRPG.grantTacticalSkillToSlot === 'function') {
                MetaRPG.grantTacticalSkillToSlot(player.metaSlotId, key, milestone.floor);
            }
            syncPlayerRunProgressToMeta();
            overlay.remove();
            writeLog(`[전술] <b>${escapeHtml(def && def.name ? def.name : key)}</b> 습득 — ${escapeHtml(def && def.shortDesc ? def.shortDesc : '전술 확장')}`);
            updateUi();
            renderActions();
            if (typeof onDone === 'function') setTimeout(onDone, 180);
        });
    });
    document.body.appendChild(overlay);
}

function maybeOfferTacticalSkillReward(clearedFloor, onDone) {
    const milestone = getPendingTacticalSkillMilestone(clearedFloor);
    if (!milestone) {
        if (typeof onDone === 'function') onDone();
        return false;
    }
    renderTacticalSkillRewardOverlay(milestone, onDone);
    return true;
}
/** 장착 시너지 보너스 캐시 — 회복 상한·UI 등에서 동일 값 사용 */
// stage 3 split: moved to js/player.js
function getPermaStats() {
    try {
        const s = localStorage.getItem('perma_stats');
        let raw = {};
        if (s && s !== 'null' && s !== 'undefined') {
            const p = JSON.parse(s);
            if (p && typeof p === 'object' && !Array.isArray(p)) raw = p;
        }
        return {
            hp: Math.max(0, safeNum(raw.hp, 0)),
            atk: Math.max(0, safeNum(raw.atk, 0)),
            def: Math.max(0, safeNum(raw.def, 0)),
            acc: 0,
        };
    } catch (e) {
        return { hp: 0, atk: 0, def: 0, acc: 0 };
    }
}
function getSavedGold() {
    if (typeof MetaRPG !== 'undefined') {
        const m = MetaRPG.loadMeta();
        return Math.max(0, safeNum(m.savedGold, 0));
    }
    const n = parseInt(String(localStorage.getItem('saved_gold') ?? ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}
function savePermaStats(stats) {
    const s = {
        hp: Math.max(0, safeNum(stats && stats.hp, 0)),
        atk: Math.max(0, safeNum(stats && stats.atk, 0)),
        def: Math.max(0, safeNum(stats && stats.def, 0)),
        acc: 0,
    };
    localStorage.setItem('perma_stats', JSON.stringify(s));
}
/** 한 번만: 깨진 perma_stats를 정상 JSON으로 덮어씀 */
(function repairPermaStorageOnce() {
    try {
        if (localStorage.getItem('perma_repair_1')) return;
        savePermaStats(getPermaStats());
        localStorage.setItem('perma_repair_1', '1');
    } catch (e) { /* ignore */ }
})();
function getPermaBuyCount() { return JSON.parse(localStorage.getItem('perma_buy_count') || '{}'); }
function savePermaBuyCount(counts) { localStorage.setItem('perma_buy_count', JSON.stringify(counts)); }

function getUnlockedFloors(job) {
    const key = job ? `unlocked_floors_${job}` : 'unlocked_floors_global';
    return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveUnlockedFloor(f, job) {
    const key = job ? `unlocked_floors_${job}` : 'unlocked_floors_global';
    const unlocked = getUnlockedFloors(job);
    if (!unlocked.includes(f)) { unlocked.push(f); localStorage.setItem(key, JSON.stringify(unlocked)); }
}

function updatePrologueBattleControls() {
    const locked = !!(player && player.prologueLocked);
    const victoryLocked = hasPendingVictoryAdvance();
    const saveBtn = document.getElementById('battle-save-main-btn');
    const exitBtn = document.getElementById('battle-exit-main-btn');
    if (saveBtn) saveBtn.style.display = locked || victoryLocked ? 'none' : '';
    if (exitBtn) exitBtn.style.display = 'none';
}

function enterBattleLayout() {
    document.getElementById('sidebar-normal').style.display = 'none';
    const invSb = document.getElementById('sidebar-inventory');
    if (invSb) invSb.style.display = 'flex';
    document.getElementById('log').style.display = 'none';
    updatePrologueBattleControls();
}
function exitBattleLayout() {
    document.getElementById('sidebar-normal').style.display = 'flex';
    const invSb = document.getElementById('sidebar-inventory');
    if (invSb) invSb.style.display = 'none';
    document.getElementById('log').style.display = 'block';
    updatePrologueBattleControls();
}

let mainViewTransitionQueue = Promise.resolve();

function waitForElementTransition(el) {
    return new Promise((resolve) => {
        if (!el) {
            resolve();
            return;
        }
        const onEnd = (event) => {
            if (event && event.target !== el) return;
            el.removeEventListener('transitionend', onEnd);
            resolve();
        };
        el.addEventListener('transitionend', onEnd);
    });
}

function cleanupTransientViewDom() {
    const fx = document.getElementById('combat-fx-layer');
    if (fx) fx.replaceChildren();
    document.querySelectorAll('.premium-combat-vfx,.enemy-intent-laser-svg').forEach((el) => el.remove());
    const ep = document.getElementById('encounter-phase');
    if (ep && ep.style.display === 'none') ep.replaceChildren();
}

function transitionMainView(renderFn) {
    const host = document.getElementById('main-screen') || document.querySelector('.screen');
    if (!host || typeof renderFn !== 'function') {
        if (typeof renderFn === 'function') renderFn();
        return Promise.resolve();
    }
    mainViewTransitionQueue = mainViewTransitionQueue.then(async () => {
        host.classList.add('screen-transitioning');
        void host.offsetWidth;
        host.classList.add('screen-fade-out');
        await waitForElementTransition(host);
        cleanupTransientViewDom();
        renderFn();
        host.classList.remove('screen-fade-out');
        await waitForElementTransition(host);
        host.classList.remove('screen-transitioning');
        cleanupTransientViewDom();
    });
    return mainViewTransitionQueue;
}

function initSynergyTooltipInteractions() {
    return;
}

document.addEventListener('DOMContentLoaded', () => {
    exitBattleLayout();
    initSynergyTooltipInteractions();
    migrateAccPermaV71();
    console.log('[던전] 클라이언트 빌드 v' + GAME_BUILD + ' — 로그에 이 안 보이면 예전 JS 캐시입니다. 강력 새로고침(Cmd+Shift+R)하세요.');
});

/** 구 명중 영구강화 제거 + 골드 환불 (1회) */
function migrateAccPermaV71() {
    if (localStorage.getItem('acc_perma_migrated_v71')) return;
    let refund = 0;
    const buyCounts = getPermaBuyCount();
    let hadAccBuy = false;
    for (let i = 1; i <= 20; i++) {
        const id = 'acc_' + i;
        if (buyCounts[id]) {
            hadAccBuy = true;
            refund += typeof legacyAccUpgradePrice === 'function' ? legacyAccUpgradePrice(i) : 0;
            delete buyCounts[id];
        }
    }
    savePermaBuyCount(buyCounts);
    const ps = getPermaStats();
    if (!hadAccBuy && ps.acc > 0) {
        const tiers = Math.min(20, Math.floor(ps.acc / 2));
        for (let i = 1; i <= tiers; i++) {
            refund += typeof legacyAccUpgradePrice === 'function' ? legacyAccUpgradePrice(i) : 0;
        }
    }
    savePermaStats({ hp: ps.hp, atk: ps.atk, def: ps.def, acc: 0 });
    if (refund > 0) {
        if (typeof MetaRPG !== 'undefined') {
            MetaRPG.addSavedGold(refund);
            const m = MetaRPG.loadMeta();
            m.slots.forEach((s) => {
                if (s.legacyPerma) s.legacyPerma.acc = 0;
                MetaRPG.recalcTechBonus(s);
            });
            MetaRPG.saveMeta(m);
        } else {
            const sg = parseInt(localStorage.getItem('saved_gold') || '0', 10) || 0;
            localStorage.setItem('saved_gold', String(sg + refund));
        }
    } else if (typeof MetaRPG !== 'undefined') {
        const m = MetaRPG.loadMeta();
        m.slots.forEach((s) => {
            if (s.legacyPerma && s.legacyPerma.acc) s.legacyPerma.acc = 0;
            MetaRPG.recalcTechBonus(s);
        });
        MetaRPG.saveMeta(m);
    }
    localStorage.setItem('acc_perma_migrated_v71', '1');
}

/** 테크 노드 효과를 한글로 */
function formatTechEffect(e) {
    if (!e || typeof e !== 'object') return '';
    const parts = [];
    if (e.hp) parts.push(`체력 <b style="color:#2ed573">+${e.hp}</b>`);
    if (e.atk) parts.push(`공격 <b style="color:#f1c40f">+${e.atk}</b>`);
    if (e.def) parts.push(`방어 <b style="color:#1e90ff">+${e.def}</b>`);
    if (e.acc) parts.push(`명중 <b style="color:#a55eea">+${e.acc}%</b>`);
    return parts.length ? parts.join(' · ') : '—';
}

// ===================== 타격감 효과 =====================
// stage 1 split: moved to js/vfx.js
// stage 4 split: combat loop helpers moved to js/combatLogic.js

// stage 3 split: moved to js/player.js
// stage 2 split: shop formatting/filtering moved to js/shop.js
// stage 4 split: combat calculations moved to js/combatLogic.js

function showUnlockPopup(title, body, color) {
    const popup = document.createElement('div');
    popup.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;background:#1a1a1a;border:2px solid ${color};border-radius:10px;padding:16px 20px;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.8);animation:slideIn 0.3s ease;`;
    popup.innerHTML = `<div style="color:${color};font-weight:700;font-size:1em;margin-bottom:6px;">${title}</div><div style="color:#e0e0e0;font-size:0.88em;line-height:1.5;">${body}</div>`;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.transition='opacity 0.5s'; popup.style.opacity='0'; setTimeout(() => { if (popup.parentNode) document.body.removeChild(popup); }, 500); }, 3000);
}

// ===================== 전직 전용 아이템 해금 =====================
const EVO_ITEM_UNLOCK_KEY = 'evo_item_unlocks_v1';
const EVO_ITEM_UNLOCK_MILESTONE_KEY = 'evo_item_unlock_milestones_v1';
const EVO_UNLOCK_NEED_COUNT = 3;
const EVO_MILESTONES = [4, 7, 10]; // 기본 직업 플레이 중(전직 전) 3회 해금
const EVOLUTION_NAMES = ['나이트', '버서커', '궁수', '암살자', '위저드', '소환사', '성직자'];

function isEvolutionJobName(n) {
    return EVOLUTION_NAMES.includes(String(n || ''));
}

function loadEvoItemUnlockState() {
    try {
        const raw = localStorage.getItem(EVO_ITEM_UNLOCK_KEY);
        const o = raw ? JSON.parse(raw) : {};
        return o && typeof o === 'object' ? o : {};
    } catch (e) {
        return {};
    }
}
function saveEvoItemUnlockState(o) {
    try {
        localStorage.setItem(EVO_ITEM_UNLOCK_KEY, JSON.stringify(o && typeof o === 'object' ? o : {}));
    } catch (e) {
        /* ignore */
    }
}
function loadEvoMilestones() {
    try {
        const raw = localStorage.getItem(EVO_ITEM_UNLOCK_MILESTONE_KEY);
        const o = raw ? JSON.parse(raw) : {};
        return o && typeof o === 'object' ? o : {};
    } catch (e) {
        return {};
    }
}
function saveEvoMilestones(o) {
    try {
        localStorage.setItem(EVO_ITEM_UNLOCK_MILESTONE_KEY, JSON.stringify(o && typeof o === 'object' ? o : {}));
    } catch (e) {
        /* ignore */
    }
}
function getUnlockedEvolutionItemNames(evoName) {
    const s = loadEvoItemUnlockState();
    const e = s && s[evoName];
    const arr = e && Array.isArray(e.names) ? e.names : [];
    return arr.filter((x) => typeof x === 'string' && x.length > 0);
}
function isEvolutionItemNameUnlocked(evoName, itemName) {
    return getUnlockedEvolutionItemNames(evoName).includes(String(itemName || ''));
}
function isEvolutionItemSetUnlocked(evoName) {
    return getUnlockedEvolutionItemNames(evoName).length >= EVO_UNLOCK_NEED_COUNT;
}
function pickRandomLockedEvoItemName(evoName) {
    const unlocked = new Set(getUnlockedEvolutionItemNames(evoName));
    const pool = (equipmentPool || []).filter((it) => {
        if (!it || !it.name) return false;
        if (!it.onlyFor || !Array.isArray(it.onlyFor) || it.onlyFor.length !== 1) return false;
        if (it.onlyFor[0] !== evoName) return false;
        if (unlocked.has(it.name)) return false;
        return true;
    });
    if (!pool.length) return null;
    const it = pool[Math.floor(Math.random() * pool.length)];
    return it && it.name ? it.name : null;
}
function unlockEvolutionItemName(evoName, itemName) {
    const evo = String(evoName || '');
    const name = String(itemName || '');
    if (!evo || !name) return false;
    const st = loadEvoItemUnlockState();
    st[evo] = st[evo] && typeof st[evo] === 'object' ? st[evo] : {};
    st[evo].names = Array.isArray(st[evo].names) ? st[evo].names : [];
    if (!st[evo].names.includes(name)) st[evo].names.push(name);
    saveEvoItemUnlockState(st);
    return true;
}
function maybeUnlockEvolutionItemsFromBasePlay(clearedFloor) {
    if (!player || player.evolved) return;
    const base = player.baseJob;
    if (!base || !jobEvolutions || !jobEvolutions[base]) return;
    if (!EVO_MILESTONES.includes(clearedFloor)) return;
    const ms = loadEvoMilestones();
    ms[base] = Array.isArray(ms[base]) ? ms[base] : [];
    if (ms[base].includes(clearedFloor)) return;
    ms[base].push(clearedFloor);
    saveEvoMilestones(ms);

    const evols = jobEvolutions[base] || [];
    const unlockedMsgs = [];
    evols.forEach((e) => {
        if (!e || !e.name) return;
        const evoName = e.name;
        const cur = getUnlockedEvolutionItemNames(evoName).length;
        if (cur >= EVO_UNLOCK_NEED_COUNT) return;
        const pick = pickRandomLockedEvoItemName(evoName);
        if (!pick) return;
        unlockEvolutionItemName(evoName, pick);
        const now = getUnlockedEvolutionItemNames(evoName).length;
        unlockedMsgs.push(`${evoName} (${now}/${EVO_UNLOCK_NEED_COUNT})`);
    });
    if (unlockedMsgs.length) {
        writeLog(`[해금] 🧩 전직 전용 장비 해금 진행: ${unlockedMsgs.join(' · ')} — 도감에서 확인 가능`);
    }
}

function showAuthError(msg) {
    const e = document.getElementById('login-error');
    e.innerText = msg; e.style.display = 'block';
}

window.handleSignup = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    if (!email || pw.length < 6) return showAuthError("❌ 이메일 형식(ex: a@a.com)을 맞추고, 비밀번호는 6자리 이상이어야 합니다!");
    auth.createUserWithEmailAndPassword(email, pw).then(() => alert("가입 환영! 모험을 시작하세요.")).catch(() => showAuthError("❌ 가입 실패"));
};
window.handleLogin = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    if (!email || !pw) return showAuthError("❌ 이메일과 비밀번호를 모두 입력해 주세요!");
    auth.signInWithEmailAndPassword(email, pw).then(() => writeLog("서버 로그인 완료!")).catch(() => showAuthError("❌ 로그인 실패"));
};
window.handleLogout = () => { auth.signOut().then(() => { alert("로그아웃 되었습니다."); location.reload(); }); };

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-info').innerText = user.email.split('@')[0] + " 님";
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('login-area').style.display = 'none';
        exitBattleLayout(); showPreGameScreen(); subscribeRankRealtime();
    } else {
        clearRankRealtimeSubs();
        currentUser = null;
        rankRealtimeCache = {};
        renderUserRankInfo();
        document.getElementById('login-area').style.display = 'block';
        document.getElementById('start-area').style.display = 'none';
        exitBattleLayout();
    }
});

/** 베이스캠프 영구 강화 — 무한 단계, 슬롯 전용 */
function getCampPermaNextPrice(key, level) {
    const growth = (typeof BALANCE !== 'undefined' && BALANCE.permanentUpgradeGrowth) || 1.065;
    const floorEq = (typeof BALANCE !== 'undefined' && BALANCE.upgradeFloorEquivalent) || 1.25;
    const tempo = Math.max(1.28, Math.pow(growth, floorEq * 5.2));
    const T = {
        hp: [20, tempo],
        atk: [24, tempo],
        def: [22, tempo],
        crit: [120, 1.45],
        cm: [180, 1.48],
    };
    const pair = T[key] || T.hp;
    return Math.floor(pair[0] * Math.pow(pair[1], Math.max(0, level)));
}

function buildPermanentShopHtml() {
    if (typeof MetaRPG === 'undefined' || !player || !player.metaSlotId) {
        return '<p style="color:#888;font-size:0.85em;">활성 캐릭터 슬롯이 없습니다.</p>';
    }
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return '';
    MetaRPG.recalcTechBonus(slot);
    const cp = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    const tb = slot.techBonus || {};
    const runGold = safeNum(gold, 0);
    const sumLine = `<p style="color:#888;font-size:0.78em;margin:0 0 12px 0;line-height:1.5;">📌 <b>이 캐릭터 누적</b> — 체력+테크 <b style="color:#2ed573">${Math.ceil(tb.hp || 0)}</b> · 공격 <b style="color:#f1c40f">${Math.ceil(tb.atk || 0)}</b> · 방어 <b style="color:#1e90ff">${Math.ceil(tb.def || 0)}</b> · 치명 <b style="color:#f39c12">+${Math.ceil(tb.crit || 0)}%</b> · 배율 <b style="color:#e67e22">+${Math.ceil((tb.critMult || 0) * 100)}%</b></p><p style="color:#2ed573;font-size:0.8em;">💰 런 골드로 구매: <b>${runGold}G</b></p>`;
    const catKeys = ['hp', 'atk', 'def', 'crit', 'cm'];
    const labels = { hp: '❤️ 체력', atk: '⚔️ 공격', def: '🛡️ 방어', crit: '💥 치명 확률', cm: '🎯 치명 배율' };
    const getCampDeltaText = (key, lv) => {
        if (!['hp', 'atk', 'def'].includes(key) || typeof MetaRPG.getCampStatGrowthBonus !== 'function') return null;
        const now = MetaRPG.getCampStatGrowthBonus(slot, key, lv);
        const next = MetaRPG.getCampStatGrowthBonus(slot, key, lv + 1);
        const delta = Math.max(0, next - now);
        const label = key === 'hp' ? 'HP' : key === 'atk' ? '공격' : '방어';
        return `다음 +${delta} ${label} (≈${((typeof BALANCE !== 'undefined' && BALANCE.upgradeFloorEquivalent) || 1.25).toFixed(2)}층 성장분)`;
    };
    const sub = {
        hp: '층 성장 곡선 연동',
        atk: '층 성장 곡선 연동',
        def: '층 성장 곡선 연동',
        crit: '+1%/단계',
        cm: '+0.10 배율/단계 (≈10%)',
    };
    const colors = { hp: '#2ed573', atk: '#f1c40f', def: '#1e90ff', crit: '#f39c12', cm: '#e67e22' };
    const rows = catKeys
        .map((key) => {
            const lv = cp[key] || 0;
            const price = getCampPermaNextPrice(key, lv);
            const can = runGold >= price;
            const btnBg = can ? '#f1c40f' : '#333';
            const btnFg = can ? '#111' : '#666';
            const deltaText = getCampDeltaText(key, lv) || sub[key];
            return `<div style="display:flex;justify-content:space-between;align-items:center;background:#111;border:1px solid #333;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
            <div style="flex:1;">
                <span style="color:${colors[key]};font-weight:700;font-size:0.9em;">${labels[key]}</span>
                <span style="color:#888;font-size:0.8em;margin-left:10px;">Lv.${lv} · ${deltaText}</span>
                <div style="color:#555;font-size:0.72em;margin-top:3px;">다음 비용: <b style="color:#f1c40f;">${price}G</b></div>
            </div>
            <button type="button" onclick="buyCampPermaNext('${key}')" ${!can ? 'disabled' : ''} style="background:${btnBg};color:${btnFg};padding:8px 18px;font-size:0.82em;font-weight:700;border:none;border-radius:6px;cursor:${!can ? 'not-allowed' : 'pointer'};">강화</button>
        </div>`;
        })
        .join('');
    return sumLine + rows;
}

/** 구버전 전역 perma_stats → 첫 슬롯 campPerma로 1회 이관 */
function migrateGlobalPermaIntoSlotOnce() {
    if (localStorage.getItem('v703_global_perma_migrated')) return;
    if (typeof MetaRPG === 'undefined') return;
    const g = getPermaStats();
    const m = MetaRPG.loadMeta();
    if (!m.slots.length) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    if ((g.hp || 0) + (g.atk || 0) + (g.def || 0) < 1) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    const slot = m.activeSlotId ? m.slots.find((s) => s.id === m.activeSlotId) : m.slots[0];
    if (!slot) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    slot.campPerma = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    slot.campPerma.hp += Math.max(0, Math.floor((g.hp || 0) / 20));
    slot.campPerma.atk += Math.max(0, Math.floor((g.atk || 0) / 3));
    slot.campPerma.def += Math.max(0, Math.floor((g.def || 0) / 2));
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(m);
    savePermaStats({ hp: 0, atk: 0, def: 0, acc: 0 });
    try {
        localStorage.removeItem('perma_buy_count');
    } catch (e) { /* ignore */ }
    localStorage.setItem('v703_global_perma_migrated', '1');
}

function getRaceStoryDef(raceKey) {
    if (typeof raceStories === 'undefined') return null;
    return raceStories[raceKey] || null;
}

function getIntroWeaponDef(weaponKey) {
    if (typeof introWeaponChoices === 'undefined') return null;
    return introWeaponChoices[weaponKey] || null;
}

function getClassStoryDef(classKey) {
    if (typeof classStories === 'undefined') return null;
    return classStories[classKey] || null;
}

function getPromotionStoryDef(promotionKey) {
    if (typeof promotionStories === 'undefined') return null;
    return promotionStories[promotionKey] || null;
}

function getGlobalFloorStoryBand(f) {
    if (typeof floorStories === 'undefined' || !Array.isArray(floorStories.bands)) return null;
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    return floorStories.bands.find((band) => floorNum >= band.from && floorNum <= band.to) || null;
}

function getGlobalFloorStoryDef(f) {
    if (typeof floorStories === 'undefined') return null;
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    const band = getGlobalFloorStoryBand(floorNum);
    const exactLines = floorStories.milestones && floorStories.milestones[floorNum]
        ? floorStories.milestones[floorNum]
        : [];
    const bandLines = [];
    if (band && Array.isArray(band.lines) && band.lines.length) {
        const cadence = Math.max(1, Math.floor(safeNum(band.cadence, 1)));
        const index = Math.min(band.lines.length - 1, Math.floor((floorNum - band.from) / cadence));
        bandLines.push(band.lines[Math.max(0, index)]);
    }
    const lines = [...bandLines, ...exactLines].filter(Boolean);
    if (!lines.length) return null;
    return {
        key: band ? `${band.key}:${floorNum}` : `milestone:${floorNum}`,
        title: band ? `${floorNum}층 ${band.title}` : `${floorNum}층 기억`,
        lines,
    };
}

function getRelicStoryClueLines(relicKey) {
    if (typeof floorStories === 'undefined' || !floorStories.relicClues) return [];
    const f = Math.max(1, Math.floor(safeNum(floor, 1)));
    if (f < 51) return [];
    const band = getGlobalFloorStoryBand(f);
    const key = band && band.key === 'summit_eve' ? 'summit_eve' : 'deep_truth';
    let pool = floorStories.relicClues[key];
    if (!Array.isArray(pool) || !pool.length) pool = floorStories.relicClues.default || [];
    if (!Array.isArray(pool) || !pool.length) return [];
    const seed = `${relicKey || 'relic'}:${f}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return [pool[hash % pool.length]];
}

function writeStoryLines(title, lines) {
    return;
}

function markStorySeen(slotId, flag, lines) {
    if (!slotId || !flag || typeof MetaRPG === 'undefined') return false;
    const m = MetaRPG.loadMeta();
    const slot = m.slots.find((s) => s.id === slotId);
    if (!slot) return false;
    slot.storyFlags = slot.storyFlags || {};
    if (slot.storyFlags[flag]) return false;
    slot.storyFlags[flag] = Date.now();
    slot.storyLog = Array.isArray(slot.storyLog) ? slot.storyLog : [];
    slot.storyLog.push({
        flag,
        at: Date.now(),
        floor: typeof floor !== 'undefined' ? floor : 0,
        lines: Array.isArray(lines) ? lines.slice(0, 6) : [],
    });
    if (slot.storyLog.length > 80) slot.storyLog = slot.storyLog.slice(-80);
    MetaRPG.saveMeta(m);
    return true;
}

function checkStoryMilestone(f) {
    return false;
    /* v3.5에서는 레거시 스토리 마일스톤을 사용하지 않는다.
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return false;
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return false;
    const st = ensurePlayerStoryState(slot);
    const def = typeof getStoryMilestoneDef === 'function' ? getStoryMilestoneDef(floorNum, st) : null;
    if (!def || !Array.isArray(def.lines) || !def.lines.length) return false;
    const flag = `storyData:${floorNum}:${def.key || def.route || 'common'}`;
    if (!markStorySeen(slot.id, flag, def.lines)) return false;
    if (def.trigger === 'inner_monologue') {
        player.storyMonologueUnlocked = true;
    }
    if (def.titleOverride) {
        player.storyTitle = def.titleOverride;
    } else {
        const title = typeof getStoryTitleForState === 'function' ? getStoryTitleForState(st, floorNum) : null;
        if (title) player.storyTitle = title;
    }
    syncPlayerStoryStateToMeta();
    writeStoryLines(def.title || `${floorNum}층 기억`, def.lines);
    if (def.trigger === 'inner_monologue') {
        writeLog('<span style="color:#9b59b6;font-weight:800;">[독백]</span> 내면 독백 분기 시스템 활성화.');
    }
    if (def.titleOverride) {
        writeLog(`<span style="color:#f1c40f;font-weight:800;">[타이틀]</span> ${escapeHtml(def.titleOverride)}로 변화.`);
    }
    return true;
    */
}

function emitRunStartStory(slot) {
    return;
    /* v3.5에서는 레거시 런 시작 스토리를 사용하지 않는다.
    if (!slot) return;
    const race = getRaceStoryDef(slot.raceKey);
    const cls = getClassStoryDef(slot.classKey);
    const lines = [
        ...((race && race.fragments && race.fragments.runStart) || []),
        ...((cls && cls.intro) || []),
    ];
    if (!lines.length) return;
    if (!markStorySeen(slot.id, `runStart:${slot.raceKey || 'none'}:${slot.classKey || slot.jobKey}`, lines)) return;
    const raceName = race ? race.name : '기억';
    const className = cls ? cls.name : jobBase[slot.jobKey] ? jobBase[slot.jobKey].name : '모험가';
    writeStoryLines(`${raceName} / ${className}`, lines);
    */
}

function emitFloorStory(f) {
    return;
    /* v3.5에서는 레거시 층 스토리를 사용하지 않는다.
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return;
    const race = getRaceStoryDef(slot.raceKey);
    const cls = getClassStoryDef(slot.classKey);
    const promo = getPromotionStoryDef(player.name);
    const globalStory = getGlobalFloorStoryDef(f);
    const lines = [
        ...((globalStory && globalStory.lines) || []),
        ...((race && race.fragments && race.fragments.floorMilestones && race.fragments.floorMilestones[f]) || []),
        ...((cls && cls.floorMilestones && cls.floorMilestones[f]) || []),
        ...((promo && promo.floorMilestones && promo.floorMilestones[f]) || []),
    ];
    if (!lines.length) return;
    const globalKey = globalStory ? globalStory.key : 'personal';
    if (!markStorySeen(slot.id, `floor:${f}:${globalKey}:${slot.raceKey || 'none'}:${slot.classKey || slot.jobKey}:${player.name}`, lines)) return;
    writeStoryLines(globalStory ? globalStory.title : `${f}층 기억`, lines);
    */
}

function emitPromotionStory(promotionName) {
    return;
    /* v3.5에서는 직업 및 전직 스토리를 사용하지 않는다.
    if (!player || !player.metaSlotId || !promotionName) return;
    const promo = getPromotionStoryDef(promotionName);
    const lines = (promo && promo.intro) || [];
    if (!lines.length) return;
    if (!markStorySeen(player.metaSlotId, `promotion:${promotionName}`, lines)) return;
    writeStoryLines(`${promotionName} 각성`, lines);
    */
}

function emitRelicStory(it) {
    return;
    /* v3.5에서는 레거시 유물 스토리를 사용하지 않는다.
    if (!player || !player.metaSlotId || !it) return;
    const slot = typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null;
    if (!slot) return;
    const race = getRaceStoryDef(slot.raceKey);
    const cls = getClassStoryDef(slot.classKey);
    const relicKey = it.effect || it.name || 'unknown';
    const raceRelic = race && race.fragments && race.fragments.relic;
    const classRelic = cls && cls.relic;
    const storyBand = getGlobalFloorStoryBand(floor);
    const lines = [
        ...getRelicStoryClueLines(relicKey),
        (raceRelic && (raceRelic[relicKey] || raceRelic.default)) || '',
        (classRelic && (classRelic[relicKey] || classRelic.default)) || '',
    ].filter(Boolean);
    if (!lines.length) return;
    if (!markStorySeen(slot.id, `relic:${relicKey}:${storyBand ? storyBand.key : 'early'}`, lines)) return;
    writeStoryLines('유물 기억', lines);
    */
}

function emitFinalBossOpeningStory() {
    return;
    /* v3.5에서는 레거시 최종 보스 스토리를 사용하지 않는다.
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    if (Math.floor(safeNum(floor, 1)) !== 100) return;
    const lines = typeof floorStories !== 'undefined' && Array.isArray(floorStories.finalBossOpening)
        ? floorStories.finalBossOpening
        : [];
    if (lines.length && markStorySeen(player.metaSlotId, 'finalBossOpening:100', lines)) {
        writeStoryLines('100층 종착지', lines);
    }
    checkStoryMilestone(100);
    */
}

function getIntroMemoryChoiceDef(memoryKey) {
    if (typeof introMemoryChoices === 'undefined') return null;
    return introMemoryChoices[memoryKey] || null;
}

function ensurePrologueScreen() {
    const screen = document.getElementById('prologue-screen');
    if (screen) screen.remove();
    return null;
}

function setMainUiHiddenForPrologue(hidden) {
    const targets = [
        document.querySelector('.container'),
        document.getElementById('log'),
    ].filter(Boolean);
    targets.forEach((el) => {
        if (hidden) {
            if (!Object.prototype.hasOwnProperty.call(el.dataset, 'prePrologueDisplay')) {
                el.dataset.prePrologueDisplay = el.style.display || '';
            }
            el.style.display = 'none';
            return;
        }
        if (Object.prototype.hasOwnProperty.call(el.dataset, 'prePrologueDisplay')) {
            el.style.display = el.dataset.prePrologueDisplay;
            delete el.dataset.prePrologueDisplay;
        } else {
            el.style.display = '';
        }
    });
}

function closePrologueScreen() {
    const screen = document.getElementById('prologue-screen');
    if (screen) screen.remove();
    setMainUiHiddenForPrologue(false);
}

function waitForPrologueDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms || 0)));
}

function applyTutorialBattleFadeIn() {
    const battle = document.getElementById('battle-area');
    if (!battle) return;
    battle.classList.remove('tutorial-battle-fade-in');
    void battle.offsetWidth;
    battle.classList.add('tutorial-battle-fade-in');
    setTimeout(() => {
        if (battle) battle.classList.remove('tutorial-battle-fade-in');
    }, 720);
}

async function playPrologueBattleBridge(startRunFn) {
    const screen = ensurePrologueScreen();
    setMainUiHiddenForPrologue(true);
    screen.classList.remove('prologue-battle-bridge-out');
    screen.classList.add('prologue-battle-bridge');
    screen.innerHTML = `
        <div class="prologue-battle-bridge-card">
            <p>동굴 저편에서 침을 흘리는 괴수의 발자국 소리가 다가옵니다...</p>
            <b>첫 번째 생존 전투 시작.</b>
        </div>`;
    await waitForPrologueDelay(1000);
    setMainUiHiddenForPrologue(false);
    const ok = typeof startRunFn === 'function' ? startRunFn() : true;
    applyTutorialBattleFadeIn();
    screen.classList.add('prologue-battle-bridge-out');
    await waitForPrologueDelay(360);
    if (screen && screen.parentNode) screen.remove();
    setMainUiHiddenForPrologue(false);
    return ok;
}

function buildPrologueChoiceButton(label, handler, tone) {
    const border = tone || '#6b5848';
    return `<button type="button" onclick="${handler}" style="width:100%;background:rgba(5,7,10,0.72);border:1px solid ${border};color:#f2ece6;padding:14px 16px;border-radius:6px;text-align:left;font-size:0.95em;font-weight:800;line-height:1.45;cursor:pointer;box-shadow:0 0 0 1px rgba(255,255,255,0.02) inset;">${escapeHtml(label)}</button>`;
}

let currentPhase = 'memory';
let selectedPrologueMemoryKey = null;

function setProloguePhase(nextPhase, payload) {
    currentPhase = nextPhase || 'memory';
    if (payload && Object.prototype.hasOwnProperty.call(payload, 'memoryKey')) {
        selectedPrologueMemoryKey = payload.memoryKey || null;
    }
    renderProloguePhase();
}

function buildProloguePanelHtml({ eyebrow, text, actionsHtml, mutedText }) {
    return `
        <div style="width:min(700px,100%);">
            ${eyebrow ? `<div style="color:#8f8278;font-size:0.78em;letter-spacing:0;margin-bottom:12px;">${escapeHtml(eyebrow)}</div>` : ''}
            ${mutedText ? `<p style="font-size:0.9em;line-height:1.65;margin:0 0 18px;color:#8f8278;">${escapeHtml(mutedText)}</p>` : ''}
            <p class="prologue-fade-text" style="font-size:1.1em;line-height:1.88;margin:0 0 26px;color:#efe6dc;font-weight:800;animation:prologueFadeIn 520ms ease-out both;">${escapeHtml(text || '')}</p>
            ${actionsHtml ? `<div style="display:flex;flex-direction:column;gap:11px;animation:prologueFadeIn 520ms ease-out 140ms both;">${actionsHtml}</div>` : ''}
        </div>`;
}

function renderProloguePhase() {
    const screen = ensurePrologueScreen();
    setMainUiHiddenForPrologue(true);
    if (!document.getElementById('prologue-fade-style')) {
        const style = document.createElement('style');
        style.id = 'prologue-fade-style';
        style.textContent = '@keyframes prologueFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
        document.head.appendChild(style);
    }

    if (currentPhase === 'memory') {
        selectedPrologueMemoryKey = null;
        const text = typeof introPrologueText !== 'undefined' ? introPrologueText.memoryPrompt : '';
        const choices = typeof introMemoryChoices !== 'undefined' ? Object.keys(introMemoryChoices) : [];
        const actionsHtml = choices
            .map((key) => {
                const c = introMemoryChoices[key];
                const race = getRaceStoryDef(c.raceKey);
                return buildPrologueChoiceButton(
                    c.label,
                    `choosePrologueMemory('${escapeJsSingleQuoteString(key)}')`,
                    race && race.color ? race.color : '#6b5848'
                );
            })
            .join('');
        screen.innerHTML = buildProloguePanelHtml({ text, actionsHtml });
        return;
    }

    const memory = getIntroMemoryChoiceDef(selectedPrologueMemoryKey);
    const race = memory ? getRaceStoryDef(memory.raceKey) : null;
    if (!memory || !race) {
        currentPhase = 'memory';
        selectedPrologueMemoryKey = null;
        renderProloguePhase();
        return;
    }

    if (currentPhase === 'raceStory') {
        const actionsHtml = buildPrologueChoiceButton('눈을 뜬다', 'advanceProloguePhase()', race.color || '#6b5848');
        screen.innerHTML = buildProloguePanelHtml({
            text: race.past,
            actionsHtml,
        });
        return;
    }

    if (currentPhase === 'danger') {
        const text = typeof introPrologueText !== 'undefined' ? introPrologueText.dangerPrompt : '';
        const actionsHtml = buildPrologueChoiceButton('주변의 무기를 살핀다', 'advanceProloguePhase()', '#9b6a4a');
        screen.innerHTML = buildProloguePanelHtml({ text, actionsHtml });
        return;
    }

    if (currentPhase === 'weapon') {
        const text = typeof introPrologueText !== 'undefined' ? introPrologueText.weaponPrompt : '';
        const weaponKeys = typeof introWeaponChoices !== 'undefined' ? Object.keys(introWeaponChoices) : [];
        const actionsHtml = weaponKeys
            .map((key) => {
                const w = introWeaponChoices[key];
                return buildPrologueChoiceButton(
                    w.label,
                    `chooseIntroWeapon('${escapeJsSingleQuoteString(selectedPrologueMemoryKey)}','${escapeJsSingleQuoteString(key)}')`,
                    w.color || '#6b5848'
                );
            })
            .join('');
        screen.innerHTML = buildProloguePanelHtml({ text, actionsHtml });
    }
}

function canCreateCharacterInCurrentFile() {
    if (typeof MetaRPG === 'undefined') return false;
    const m = MetaRPG.loadMeta();
    if (m.slots.length < MetaRPG.MAX_SLOTS) return true;
    const n = MetaRPG.getSaveFileSlotCount ? MetaRPG.getSaveFileSlotCount() : 3;
    for (let fi = 0; fi < n; fi++) {
        const pm = MetaRPG.peekMetaAtFileIndex(fi);
        if (pm && pm.slots && pm.slots.length < MetaRPG.MAX_SLOTS) {
            if (
                confirm(
                    `이 저장 파일의 캐릭터 슬롯이 가득 찼습니다.\n저장 파일 ${fi + 1}번에는 빈 슬롯이 있습니다.\n해당 파일로 전환할까요?`
                )
            ) {
                MetaRPG.setActiveSaveFileIndex(fi);
                showPreGameScreen();
            }
            return false;
        }
    }
    const ans = prompt(
        `모든 저장 파일에서 캐릭터 슬롯이 가득 찼습니다.\n비우고 새로 만들 저장 파일 번호를 입력하세요 (1~${n}).\n※ 해당 파일의 메타·캐릭터 데이터가 삭제됩니다. 취소하려면 취소를 누르세요.`
    );
    if (ans == null) return false;
    const num = parseInt(String(ans).trim(), 10);
    if (!Number.isFinite(num) || num < 1 || num > n) {
        alert('1~' + n + ' 사이 숫자를 입력해 주세요.');
        return false;
    }
    const idx = num - 1;
    if (!confirm(`저장 파일 ${num}번을 완전히 비우고 새 캐릭터를 만듭니다. 계속할까요?`)) return false;
    MetaRPG.clearSaveFile(idx);
    MetaRPG.setActiveSaveFileIndex(idx);
    return true;
}

function startNewCharacterPrologueFlow() {
    if (typeof MetaRPG === 'undefined') return;
    if (!canCreateCharacterInCurrentFile()) return;
    closePrologueScreen();
    rollPartyStats();
}

let prologueBattleBridgeActive = false;

async function confirmNewCharacterFromPrologue(memoryKey, weaponKey) {
    if (typeof MetaRPG === 'undefined') return;
    if (prologueBattleBridgeActive) return;
    const memory = getIntroMemoryChoiceDef(memoryKey);
    const race = memory ? getRaceStoryDef(memory.raceKey) : null;
    const weapon = getIntroWeaponDef(weaponKey);
    if (!memory || !race || !weapon) return setProloguePhase('memory', { memoryKey: null });
    const className = weapon.className || (jobBase[weapon.jobKey] && jobBase[weapon.jobKey].name) || '생존자';
    const r = MetaRPG.createCharacter(`${race.name} ${className}`, weapon.jobKey, {
        raceKey: memory.raceKey,
        memoryKey,
        originBaseJobKey: memory.baseJobKey,
        weaponKey,
        classKey: weapon.classKey,
    });
    if (!r.ok) {
        alert(r.msg || '생성 실패');
        return;
    }
    prologueBattleBridgeActive = true;
    try {
        await playPrologueBattleBridge(() => initRunFromMetaSlot({ forceTutorialBattle: true }));
    } finally {
        prologueBattleBridgeActive = false;
    }
}

function hasOpenCharacterSlot(meta) {
    if (typeof MetaRPG === 'undefined') return true;
    const m = meta || MetaRPG.loadMeta();
    return !m || !Array.isArray(m.slots) || m.slots.length < MetaRPG.MAX_SLOTS;
}

let pendingPartyRoll = null;

function getPendingPartyRollMember(roleKey) {
    if (!Array.isArray(pendingPartyRoll)) return null;
    return pendingPartyRoll.find((entry) => entry && entry.roleKey === roleKey && entry.stats) || null;
}

function hasCompletePendingPartyRoll() {
    return PARTY_ROLE_KEYS.every((roleKey) => !!getPendingPartyRollMember(roleKey));
}

function buildFinalPendingPartyRoll() {
    return PARTY_ROLE_KEYS.map((roleKey) => {
        const role = PARTY_ROLE_DEFINITIONS[roleKey];
        const member = getPendingPartyRollMember(roleKey);
        return {
            roleKey,
            name: role.name,
            stats: {
                str: member.stats.str,
                def: member.stats.def,
                hp: member.stats.hp,
                int: member.stats.int,
                wis: member.stats.wis,
                agi: member.stats.agi,
                divinity: 0,
                distortion: 0,
            },
        };
    });
}

function buildPartyRollRowsHtml() {
    const party = Array.isArray(pendingPartyRoll) ? pendingPartyRoll : [];
    return PARTY_ROLE_KEYS.map((roleKey) => {
        const role = PARTY_ROLE_DEFINITIONS[roleKey];
        const member = party.find((entry) => entry && entry.roleKey === roleKey);
        const stats = member && member.stats;
        const values = stats
            ? `힘 ${stats.str} · 방 ${stats.def} · 체 ${stats.hp} · 지 ${stats.int} · 지혜 ${stats.wis} · 민 ${stats.agi}`
            : `${role.name} 주사위를 굴려 능력치를 결정하세요.`;
        return `<div style="background:#111;border:1px solid #333;border-radius:8px;padding:9px 10px;margin-bottom:7px;text-align:left;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <b style="color:#f1c40f;">${escapeHtml(role.name)}</b>
                <button type="button" class="new-adventure-start-btn" onclick="rollPartyRoleStats('${roleKey}')" style="width:auto;margin:0;padding:7px 10px;font-size:0.78em;">🎲 ${escapeHtml(role.name)} 주사위 굴리기</button>
            </div>
            <div style="color:${stats ? '#ccc' : '#666'};font-size:0.78em;margin-top:6px;">${values}</div>
            <div style="color:#555;font-size:0.7em;margin-top:2px;">성혼 0 · 뒤틀림 0</div>
        </div>`;
    }).join('');
}

function buildNewAdventureStartHtml(extraClass) {
    const className = ['new-adventure-entry', extraClass || ''].filter(Boolean).join(' ');
    return `
        <div id="new-adventure-entry" class="${className}">
            <div style="width:100%;max-width:560px;margin:0 auto 10px;">
                <h4 style="color:#f1c40f;margin:0 0 10px;">🎲 3인 파티 스탯 주사위</h4>
                ${buildPartyRollRowsHtml()}
                <button id="new-adventure-start-btn" class="new-adventure-start-btn" type="button" onclick="confirmPartyAdventure()" ${hasCompletePendingPartyRoll() ? '' : 'disabled'} style="margin-top:8px;">⚔️ 모험 시작</button>
            </div>
        </div>`;
}

window.rollPartyStats = function rollPartyStats() {
    if (!Array.isArray(pendingPartyRoll)) pendingPartyRoll = [];
    showPreGameScreen();
};

window.rollPartyRoleStats = function rollPartyRoleStats(roleKey) {
    if (!PARTY_ROLE_KEYS.includes(roleKey)) return;
    pendingPartyRoll = rerollPartyRoleStartingStats(pendingPartyRoll, roleKey);
    showPreGameScreen();
};

window.confirmPartyAdventure = function confirmPartyAdventure() {
    if (!hasCompletePendingPartyRoll()) {
        writeLog('[주사위] 탱커, 마법사, 기사 주사위를 각각 한 번 이상 굴려 주세요.');
        return;
    }
    const name = prompt('원정대 이름을 입력하세요:', '성혼 원정대');
    if (name == null) return;
    const finalPartyRoll = buildFinalPendingPartyRoll();
    const result = MetaRPG.createCharacter(name || '성혼 원정대', finalPartyRoll);
    if (!result.ok) {
        alert(result.msg || '원정대 생성 실패');
        return;
    }
    pendingPartyRoll = null;
    initRunFromMetaSlot();
};

function ensureHubCreateEntryRendered() {
    const startArea = document.getElementById('start-area');
    if (!startArea) return;
    if (startArea.querySelector('#new-adventure-start-btn')) return;
    if (!hasOpenCharacterSlot()) return;
    const fallback = document.createElement('div');
    fallback.innerHTML = buildNewAdventureStartHtml('new-adventure-entry-fallback');
    const entry = fallback.firstElementChild;
    if (entry) startArea.appendChild(entry);
}

function showPreGameScreen() {
    const lingeringPrologue = document.getElementById('prologue-screen');
    if (lingeringPrologue) lingeringPrologue.remove();
    setMainUiHiddenForPrologue(false);
    exitBattleLayout();
    migrateGlobalPermaIntoSlotOnce();
    if (typeof MetaRPG !== 'undefined') {
        const mx = MetaRPG.loadMeta();
        mx.slots.forEach((s) => MetaRPG.recalcTechBonus(s));
        MetaRPG.saveMeta(mx);
    }
    const m = typeof MetaRPG !== 'undefined' ? MetaRPG.loadMeta() : { slots: [] };
    const esc = (t) =>
        String(t)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    const canStartNewAdventure = hasOpenCharacterSlot(m);
    const slotRows =
        m.slots.length === 0
            ? `<div class="empty-character-slot">
                <p style="color:#888;font-size:0.85em;margin:0 0 12px;">저장된 캐릭터가 없습니다. 아래에서 <b>새 모험가</b>를 만들어 주세요.</p>
                ${canStartNewAdventure ? buildNewAdventureStartHtml('new-adventure-entry-empty') : ''}
            </div>`
            : m.slots
                  .map((s) => {
                      MetaRPG.recalcTechBonus(s);
                      const jb = jobBase[s.jobKey] || { name: '?', color: '#888' };
                      const jobDisplayName = getSlotClassDisplayName(s);
                      const race = getRaceStoryDef(s.raceKey);
                      const weapon = getIntroWeaponDef(s.introWeaponKey);
                      const cls = getClassStoryDef(s.classKey);
                      const techFree = '테크 자유';
                      const rct = s.reincarnationCount || 0;
                      const gen = rct + 1;
                      const rescuedCount = Array.isArray(s.rescuedItems) ? s.rescuedItems.length : 0;
                      const rescueBadge =
                          rescuedCount > 0 ? ` · 구조 장비 <b style="color:#2ed573;">${rescuedCount}</b>개 보존` : '';
                      const rebCost = MetaRPG.getRebirthGoldCost(s);
                      const rebNeedFloor = MetaRPG.getRebirthMinFloor ? MetaRPG.getRebirthMinFloor() : 500;
                      const bestFloor = Math.max(1, s.bestFloor || 1);
                      const partySummary = normalizeAdventurerParty(s.party)
                          .map((member) => `${member.name} 힘${member.stats.str}/방${member.stats.def}/체${member.stats.hp}/지${member.stats.int}/지혜${member.stats.wis}/민${member.stats.agi}`)
                          .join(' · ');
                      const canReb = rct < 3;
                      const rebBtn = canReb
                          ? `<button type="button" onclick="event.stopPropagation();reincarnateFromHub('${s.id}')" style="background:#c0392b;color:#fff;padding:8px 12px;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.82em;">🔁 환생 (${rebCost}G)</button>`
                          : `<span style="color:#555;font-size:0.75em;">환생 3/3</span>`;
                      const lifeBadge =
                          gen > 1
                              ? `<span style="color:#9b59b6;font-weight:700;">${jb.name} ${gen}세</span> · `
                              : '';
                      return `<div style="background:#111;border:1px solid #444;border-radius:10px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                        <div style="text-align:left;">
                            <div style="color:#f1c40f;font-weight:700;">${escapeHtml(jobDisplayName)} ${gen > 1 ? `<span style="color:#aaa;font-size:0.85em;">(인생 ${gen}회차)</span>` : ''}</div>
                            <div style="color:#888;font-size:0.78em;line-height:1.5;">${escapeHtml(partySummary)} · 최고 ${bestFloor}층${rescueBadge}</div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        <button type="button" onclick="resumeMetaSlot('${s.id}')" style="background:#2ed573;color:#111;padding:8px 16px;font-weight:700;border:none;border-radius:8px;cursor:pointer;">이어하기</button>
                        <button type="button" onclick="requestDeleteSaveFile(${typeof MetaRPG !== 'undefined' && typeof MetaRPG.getActiveFileIndex === 'function' ? MetaRPG.getActiveFileIndex() : 0})" style="background:#2a1111;color:#ff8080;padding:8px 12px;font-weight:800;border:1px solid #7f2b2b;border-radius:8px;cursor:pointer;font-size:0.82em;">파일 삭제</button>
                        ${MetaRPG.getRunSnapshot(s.id) ? `<button type="button" onclick="event.stopPropagation();deleteRunSnapshotForSlot('${s.id}')" style="background:#34495e;color:#ecf0f1;padding:8px 12px;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.82em;">🗑 저장 삭제</button>` : ''}
                        ${rebBtn}
                        </div>
                    </div>`;
                  })
                  .join('');
    let saveFileBar = '';
    if (typeof MetaRPG !== 'undefined' && MetaRPG.peekMetaAtFileIndex) {
        const cur = typeof MetaRPG.getActiveFileIndex === 'function' ? MetaRPG.getActiveFileIndex() : 0;
        const n = MetaRPG.getSaveFileSlotCount ? MetaRPG.getSaveFileSlotCount() : 3;
        const parts = [];
        for (let fi = 0; fi < n; fi++) {
            const pm = MetaRPG.peekMetaAtFileIndex(fi);
            const cnt = pm.slots ? pm.slots.length : 0;
            const g = Math.max(0, safeNum(pm.savedGold, 0));
            const active = fi === cur ? ' (현재)' : '';
            parts.push(
                `<button type="button" onclick="switchActiveSaveFile(${fi})" style="background:${fi === cur ? '#2a2a1a' : '#111'};border:1px solid ${fi === cur ? '#f1c40f' : '#444'};color:${fi === cur ? '#f1c40f' : '#888'};padding:8px 10px;border-radius:8px;cursor:pointer;font-size:0.78em;font-weight:700;">파일 ${fi + 1}${active}<br><span style="font-weight:400;color:#888;">캐릭 ${cnt} · ${g}G</span></button>`
            );
        }
        saveFileBar = `<div style="margin-bottom:14px;padding:12px;background:#0d0d12;border:1px solid #333;border-radius:10px;"><div style="color:#f1c40f;font-weight:700;margin-bottom:8px;font-size:0.9em;">💾 저장 파일 (최대 3)</div><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">${parts.join('')}</div><p style="color:#666;font-size:0.72em;margin:8px 0 0;line-height:1.45;">다른 파일을 불러오려면 위 버튼을 누르세요. 모든 파일이 가득 차면 새 캐릭터 생성 시 <b>비울 파일</b>을 묻습니다.</p></div>`;
    }
    const newCharacterEntryHtml =
        m.slots.length > 0 && canStartNewAdventure ? buildNewAdventureStartHtml('new-adventure-entry-secondary') : '';
    document.getElementById('start-area').style.display = 'block';
    document.getElementById('battle-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'none';
    try {
    document.getElementById('start-area').innerHTML = `
        <div style="text-align:center; margin-bottom:16px;">
            <h2 style="color:#f1c40f; margin-bottom:5px;">⚔️ 프로젝트 성혼</h2>
            <p style="color:#9b59b6;font-size:0.88em;margin:0 0 8px;font-weight:700;">베타 v 1.0</p>
            ${saveFileBar}
            <p style="color:#888; font-size:0.85em;">3인 파티 · 100층 미궁 · 6-1 이후 복귀 불가</p>
        </div>
        <div style="max-width:560px;margin:0 auto 16px;">
            <h4 style="color:#f1c40f;margin:0 0 8px 0;">💾 캐릭터 슬롯 (최대 ${typeof MetaRPG !== 'undefined' ? MetaRPG.MAX_SLOTS : 4})</h4>
            ${slotRows}
        </div>
        ${newCharacterEntryHtml}
        <p style="color:#666;font-size:0.75em;max-width:520px;margin:0 auto;line-height:1.5;">※ 1~5층에서 전투를 1회 이상 승리하면 <b>마을 복귀</b> 가능. 마을 정비 후 재출정 시 진행도는 <b>1-1층</b>으로 초기화되며 장비·골드·영구 강화는 유지됩니다. 6-1층부터 복귀 불가.</p>`;
    } catch (err) {
        console.error('[허브]', err);
        document.getElementById('start-area').innerHTML =
            '<p style="color:#ff6b6b;padding:20px;text-align:center;">허브를 불러오는 중 오류가 났습니다. 페이지를 새로고침 해 주세요.<br><span style="color:#888;font-size:0.85em;">' +
            String(err && err.message ? err.message : err) +
            '</span></p>';
    }
    ensureHubCreateEntryRendered();
}

window.resumeMetaSlot = (slotId) => {
    if (typeof MetaRPG === 'undefined') return;
    if (!MetaRPG.setActiveSlot(slotId)) return;
    const snap = MetaRPG.getRunSnapshot(slotId);
    if (snap) loadRunFromMetaSnapshot(snap);
    else initRunFromMetaSlot();
};

/** 허브: 저장 파일 1~3 전환 */
window.switchActiveSaveFile = function switchActiveSaveFile(idx) {
    if (typeof MetaRPG === 'undefined' || typeof MetaRPG.setActiveSaveFileIndex !== 'function') return;
    if (!MetaRPG.setActiveSaveFileIndex(idx)) return;
    showPreGameScreen();
};
window.requestDeleteSaveFile = function requestDeleteSaveFile(idx) {
    if (typeof MetaRPG === 'undefined') return;
    const fileNo = idx + 1;
    const ok = confirm(`저장 파일 ${fileNo}번을 삭제할까요?\n삭제하면 해당 파일의 캐릭터/보존 골드가 모두 사라집니다.`);
    if (!ok) return;
    const ok2 = confirm(`정말로 저장 파일 ${fileNo}번을 삭제하시겠습니까?\n(복구 불가)`);
    if (!ok2) return;
    MetaRPG.clearSaveFile(idx);
    if (typeof MetaRPG.setActiveSaveFileIndex === 'function') MetaRPG.setActiveSaveFileIndex(idx);
    showPreGameScreen();
};

window.reincarnateFromHub = function reincarnateFromHub(slotId) {
    if (typeof MetaRPG === 'undefined') return;
    const slot = MetaRPG.getSlotById(slotId);
    if (!slot) return;
    const cost = MetaRPG.getRebirthGoldCost(slot);
    const needFloor = MetaRPG.getRebirthMinFloor ? MetaRPG.getRebirthMinFloor() : 500;
    const bestFloor = Math.max(1, slot.bestFloor || 1);
    if ((slot.reincarnationCount || 0) >= 3) return alert('환생은 최대 3회입니다.');
    if (bestFloor < needFloor) return alert(`환생 조건 미달: 최고 ${bestFloor}층 (필요 ${needFloor}층)`);
    if (!confirm(`환생: ${cost}G를 지불하고 이 캐릭터의 베이스캠프 영구강화·퀘스트 보너스를 초기화합니다.\n조건: 최고 ${needFloor}층 이상. 환생 시 공격/방어/치명 배율 +10% 누적.`)) return;
    MetaRPG.setActiveSlot(slotId);
    const r = MetaRPG.applyReincarnation(slotId, { payGold: true });
    if (!r.ok) return alert(r.msg);
    alert('환생 완료. 「이어하기」로 새 런을 시작하세요.');
    try {
        showPreGameScreen();
    } catch (e) {
        console.error(e);
        alert('허브 표시 중 오류가 났습니다. 새로고침 해 주세요.');
        location.reload();
    }
};

window.startNewCharacterPrologue = function startNewCharacterPrologue() {
    rollPartyStats();
};

window.choosePrologueMemory = function choosePrologueMemory(memoryKey) {
    return false;
};

window.advanceProloguePhase = function advanceProloguePhase() {
    return false;
};

window.chooseIntroWeapon = function chooseIntroWeapon(memoryKey, weaponKey) {
    return false;
};

window.openTechLinePicker = (jobKey) => {
    if (typeof MetaRPG === 'undefined') return;
    if (!jobKey || !jobBase[jobKey]) {
        showPreGameScreen();
        return;
    }
    const tryCreate = () => confirmNewCharacter(jobKey);
    if (MetaRPG.loadMeta().slots.length >= MetaRPG.MAX_SLOTS) {
        const n = MetaRPG.getSaveFileSlotCount ? MetaRPG.getSaveFileSlotCount() : 3;
        for (let fi = 0; fi < n; fi++) {
            const pm = MetaRPG.peekMetaAtFileIndex(fi);
            if (pm && pm.slots && pm.slots.length < MetaRPG.MAX_SLOTS) {
                if (
                    confirm(
                        `이 저장 파일의 캐릭터 슬롯이 가득 찼습니다.\n저장 파일 ${fi + 1}번에는 빈 슬롯이 있습니다.\n해당 파일로 전환할까요?`
                    )
                ) {
                    MetaRPG.setActiveSaveFileIndex(fi);
                    showPreGameScreen();
                }
                return;
            }
        }
        const ans = prompt(
            `모든 저장 파일에서 캐릭터 슬롯이 가득 찼습니다.\n비우고 새로 만들 저장 파일 번호를 입력하세요 (1~${n}).\n※ 해당 파일의 메타·캐릭터 데이터가 삭제됩니다. 취소하려면 취소를 누르세요.`
        );
        if (ans == null) return;
        const num = parseInt(String(ans).trim(), 10);
        if (!Number.isFinite(num) || num < 1 || num > n) {
            alert('1~' + n + ' 사이 숫자를 입력해 주세요.');
            return;
        }
        const idx = num - 1;
        if (!confirm(`저장 파일 ${num}번을 완전히 비우고 새 캐릭터를 만듭니다. 계속할까요?`)) return;
        MetaRPG.clearSaveFile(idx);
        MetaRPG.setActiveSaveFileIndex(idx);
        tryCreate();
        return;
    }
    tryCreate();
};

window.deleteRunSnapshotForSlot = function deleteRunSnapshotForSlot(slotId) {
    if (typeof MetaRPG === 'undefined') return;
    const existing = document.getElementById('delete-save-confirm-overlay');
    if (existing) existing.remove();

    const ov = document.createElement('div');
    ov.id = 'delete-save-confirm-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:10070;display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML = `
<div style="background:#1a1a2e;border:2px solid #e74c3c;border-radius:14px;padding:22px 20px;max-width:420px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
  <h3 style="color:#e74c3c;margin:0 0 10px;font-size:1.15em;">저장 데이터 삭제</h3>
  <p style="color:#ddd;font-size:0.9em;line-height:1.55;margin:0 0 16px;text-align:left;">
    이 캐릭터의 <b>저장된 런(이어하기) 파일</b>이 <b>완전히 삭제</b>됩니다.<br>
    또한 <b>메타 레벨·EXP가 1 / 0으로 초기화</b>됩니다.<br>
    <span style="color:#f39c12;">삭제 후에는 복구할 수 없습니다.</span> 정말 삭제할까요?
  </p>
  <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
    <button type="button" id="del-save-cancel" style="background:#555;color:#eee;padding:10px 18px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.95em;">취소</button>
    <button type="button" id="del-save-confirm" style="background:#c0392b;color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.95em;">예, 삭제합니다</button>
  </div>
        </div>`;
    document.body.appendChild(ov);

    const close = () => {
        ov.remove();
        document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => {
        if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    ov.querySelector('#del-save-cancel').onclick = close;
    ov.onclick = (e) => {
        if (e.target === ov) close();
    };
    ov.querySelector('#del-save-confirm').onclick = () => {
        close();
        MetaRPG.wipeSavedRunAndResetMetaLevel(slotId);
        showPreGameScreen();
    };
};

function confirmNewCharacter(jobKey) {
    if (typeof MetaRPG === 'undefined') return;
    const name = prompt('캐릭터 이름을 입력하세요 (비우면 무명):', '모험가');
    const r = MetaRPG.createCharacter(name || '무명', jobKey);
    if (!r.ok) {
        alert(r.msg || '생성 실패');
        return;
    }
    initRunFromMetaSlot({ forceTutorialBattle: true });
}

function initRunFromMetaSlot(options) {
    if (typeof MetaRPG === 'undefined') return false;
    const opt = options && typeof options === 'object' ? options : {};
    const m = MetaRPG.loadMeta();
    const slot = m.slots.find((s) => s.id === m.activeSlotId);
    if (!slot) return false;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(MetaRPG.loadMeta());
    const jb = slot.jobKey;
    const job = jobBase[jb];
    if (!job) return false;
    const tb = slot.techBonus || { hp: 0, atk: 0, def: 0, acc: 0, crit: 0, critMult: 0 };
    const lv = slot.level || 1;
    const lb = MetaRPG.getLevelRuntimeBonus(lv);
    const rs = slot.rebirthStatBonus || { hp: 0, atk: 0, def: 0, acc: 0 };
    const fg = normalizePlayerFloorGrowth(slot.floorGrowth);
    const baseHp = job.hp + tb.hp + lb.hp + (rs.hp || 0) + fg.hp;
    const baseAtk = job.atk + tb.atk + lb.atk + (rs.atk || 0) + fg.atk;
    const baseDef = job.def + tb.def + lb.def + (rs.def || 0);
    const baseAcc = tb.acc + lb.acc + (rs.acc || 0);
    const rescuedItems = typeof MetaRPG.getRescuedItems === 'function' ? MetaRPG.getRescuedItems(slot.id) : [];
    const starterItems = Array.isArray(slot.starterEquipment)
        ? slot.starterEquipment
              .map((it) => {
                  try {
                      const copy = JSON.parse(JSON.stringify(it));
                      if (typeof applyStarterGearStats === 'function') applyStarterGearStats(copy);
                      return copy;
                  } catch (e) {
                      return null;
                  }
              })
              .filter(Boolean)
        : typeof buildStarterEquipmentSet === 'function'
          ? buildStarterEquipmentSet({
                raceKey: slot.raceKey,
                weaponKey: slot.introWeaponKey,
                classKey: slot.classKey,
                jobKey: slot.jobKey,
            })
          : [];
    const runItems = [...rescuedItems];
    starterItems.forEach((it) => {
        if (!it) return;
        const kind = it.starterGearKind;
        const exists = runItems.some((owned) => {
            if (!owned) return false;
            if (typeof isStarterGearItem === 'function' && !isStarterGearItem(owned)) return false;
            return owned.starterGearKind === kind;
        });
        if (!exists) runItems.push(it);
    });
    runItems.forEach((it) => {
        if (!it || it.type === 'merc') return;
        if (typeof applyOfficialStatsToEquipmentItem === 'function') applyOfficialStatsToEquipmentItem(it, { rebuildDesc: true });
        else if (typeof clampEquipmentItemStatsToRarityCaps === 'function') clampEquipmentItemStatsToRarityCaps(it);
    });
    clearSummonRunStorage();
    player = {
        ...job,
        curHp: baseHp,
        maxHp: baseHp,
        atk: baseAtk,
        def: baseDef,
        acc: baseAcc,
        crit: 1 + (tb.crit || 0),
        critMult: 1.8 + (tb.critMult || 0),
        divinePower: 0,
        divineGainMult: 1,
        prayerBonusFlat: 0,
        priestBlessed: false,
        chosenPriest: false,
        priestNextCrit: false,
        prayerVulnerableHits: 0,
        prayerCountThisTurn: 0,
        metaSlotId: slot.id,
        runLevel: lv,
        runExp: slot.exp || 0,
        items: runItems,
        relics: [],
        extraAtk: 0,
        _relicGamblerDefSub: 0,
        potions: 3,
        extraDef: 0,
        unlockedSkill: null,
        ultStack: 0,
        ultMaxStack: 0,
        lifesteal: 0,
        hasRegenPotion: false,
        baseJob: job.name,
        raceKey: slot.raceKey || null,
        memoryKey: slot.memoryKey || null,
        originBaseJobKey: slot.originBaseJobKey || jb,
        classKey: slot.classKey || jb,
        introWeaponKey: slot.introWeaponKey || null,
        currentPromotion: slot.currentPromotion || null,
        tutorialBattleActive: !!opt.forceTutorialBattle,
        prologueLocked: !!opt.forceTutorialBattle,
        evolved: false,
        shieldEmpowered: false,
        summon: null,
        _awaitPlayerTurn: false,
        fieldMerc: null,
        mercCooldownTurns: 0,
        mercNextBattleDebuff: null,
        _mercBattleAtkDebuff: 0,
        mercReviveAt90Percent: false,
        _mercCooldownSkipOnce: false,
        mercCompanionKind: null,
        mercEvolution: null,
        mercEvolutionChosen: false,
        mercRegenTurns: 0,
        mercRegenAmount: 0,
        mercBattleTurnCount: 0,
        mercInventory: [],
        activeQuest: null,
        farmingStay: false,
        floorGrowth: fg,
        playerState: normalizeUiPlayerState(slot.playerState),
        tacticalSkills: uniqueTacticalSkillKeys(slot.tacticalSkills),
        tacticalSkillMilestonesClaimed: uniqueClaimedTacticalMilestones(slot.tacticalSkillMilestonesClaimed),
        tacticalSkillUses: {},
        tacticalFocusReady: false,
        tacticalParryReady: false,
        tacticalBarrierReady: false,
        shopRarityBoost: 0,
        freeShopCoupon: false,
        passiveContractHistory: [],
        hunterExposeStacks: 0,
        hunterExposeReady: false,
    };
    ensurePlayerRunProgressFields(slot);
    markPlayedJob(job.name);
    if (player.items.length && typeof fullResyncPlayerCombatStatsFromMetaAndInventory === 'function') {
        fullResyncPlayerCombatStatsFromMetaAndInventory();
        player.curHp = typeof getEffectiveMaxHp === 'function' ? getEffectiveMaxHp() : player.maxHp;
    } else {
        applyRebirthPctBonusToPlayer(slot);
    }
    recalcPlayerDivineGainMult();
    floor = 1;
    gold = 0;
    totalGoldEarned = 0;
    rerollCost = 10;
    shopVisitCount = 0;
    document.getElementById('start-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    const battleLog = document.getElementById('battle-log-strip');
    if (battleLog) battleLog.innerHTML = '';
    enterBattleLayout();
    loadCollection();
    emitRunStartStory(slot);
    if (rescuedItems.length) {
        writeLog(`[구조] 베이스캠프에 보존된 장비 ${player.items.length}개를 장착한 채 1층부터 재등반합니다.`);
    } else if (starterItems.length) {
        writeLog('[장비] 부서지기 직전의 고유 무기와 다 해진 고유 갑옷을 자동 장착했습니다.');
    }
    if (jb === 'MercenaryCaptain') {
        MetaRPG.markRunCheckpoint(slot.id);
        showMercCompanionPicker();
        return true;
    }
    if (opt.forceTutorialBattle) {
        window._encounterPhaseActive = false;
        window._encounterPhaseScene = null;
        hideEncounterPhaseUI();
        writeLog('[튜토리얼] 눈앞의 몬스터가 달려듭니다. 선택한 무기로 첫 전투를 시작합니다!');
        spawnEnemy();
        MetaRPG.markRunCheckpoint(slot.id);
        return true;
    }
    beginFloorEncounter();
    MetaRPG.markRunCheckpoint(slot.id);
    return true;
}

window.buyCampPermaNext = function buyCampPermaNext(key) {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const m = MetaRPG.loadMeta();
    const slot = m.slots.find((s) => s.id === player.metaSlotId);
    if (!slot) return;
    slot.campPerma = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    const lv = slot.campPerma[key] || 0;
    const price = getCampPermaNextPrice(key, lv);
    if (gold < price) return writeLog('[영구] 런 골드 부족');
    gold -= price;
    slot.campPerma[key] = lv + 1;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(m);
    player.party = normalizeAdventurerParty(slot.party).map((member) =>
        ensurePartyMemberRuntimeShape({ ...member, curHp: member.hp })
    );
    player.permanentBonus = { ...(slot.techBonus || {}) };
    fullResyncPlayerCombatStatsFromMetaAndInventory();
    syncPlayerCampaignState();
    writeLog(`[영구] ${key} Lv.${lv + 1} 강화! (-${price}G)`);
    const ov = document.getElementById('base-camp-overlay');
    if (ov) {
        window.__baseCampScrollTop = ov.scrollTop;
        ov.remove();
        openBaseCampTech();
    } else {
    showPreGameScreen();
    }
};

/** 구 세이브 호환 */
window.buyPermUpgradeNext = (key) => buyCampPermaNext(key);
window.buyPermUpgrade = (id) => {
    const key = String(id).split('_')[0];
    if (['hp', 'atk', 'def', 'crit', 'cm'].includes(key)) buyCampPermaNext(key);
};

/** @deprecated v7 — 슬롯/테크 시스템 사용. 직접 호출 시 테크 선택으로 연결 */
window.selectJobAndStart = (job) => {
    openTechLinePicker(job);
};

function showMercCompanionPicker() {
    const overlay = document.createElement('div');
    overlay.id = 'merc-companion-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:10001;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:480px;width:92%;text-align:center;">
            <h2 style="color:#e67e22;margin-bottom:8px;">⚔️ 첫 동료 선택</h2>
            <p style="color:#aaa;font-size:0.88em;margin-bottom:18px;line-height:1.45;">단장은 직접 싸우기 어렵습니다. <b>워리어 · 헌터 · 마법사</b> 중 동료 용병 1명을 고르세요.</p>
            ${['워리어','헌터','마법사'].map((k) => {
                const b = mercCompanionBases[k];
                return `<div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:15px;margin-bottom:10px;cursor:pointer;" onclick="pickMercCompanion('${k}')" onmouseenter="this.style.borderColor='#e67e22'" onmouseleave="this.style.borderColor='#555'">
                    <b style="color:#e0e0e0;">${b.label}</b> <span style="color:#888;font-size:0.85em;">(${k})</span>
                    <p style="color:#666;font-size:0.78em;margin:6px 0 0;">기본 상성: ${b.affinityJob}</p>
                </div>`;
            }).join('')}
        </div>`;
    document.body.appendChild(overlay);
}

window.pickMercCompanion = (kind) => {
    if (!player || player.baseJob !== '용병단장') return;
    if (!['워리어','헌터','마법사'].includes(kind)) return;
    player.mercCompanionKind = kind;
    const el = document.getElementById('merc-companion-overlay');
    if (el) el.remove();
    beginFloorEncounter();
};

function checkEvolution() {
    if (player.evolved || player.baseJob === '용병단장') return;
    if (jobEvolutions[player.baseJob]) setTimeout(() => showEvolutionChoice(jobEvolutions[player.baseJob]), 500);
}

function showEvolutionChoice(evols) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:30px;max-width:460px;width:90%;text-align:center;">
            <h2 style="color:#f1c40f;margin-bottom:8px;">⚡ 10층 달성! 전직 선택</h2>
            <p style="color:#aaa;font-size:0.9em;margin-bottom:20px;">${player.name}의 새로운 길을 선택하세요.</p>
            ${evols.map((e,i) => `
                <div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:15px;margin-bottom:12px;cursor:pointer;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='#f1c40f'" onmouseleave="this.style.borderColor='#555'" onclick="evolve(${i})">
                    <b style="color:#e0e0e0;font-size:1.1em;">${e.name}</b>
                    <p style="color:#888;font-size:0.85em;margin:6px 0 0;">${e.desc}</p>
                    <p style="color:#2ed573;font-size:0.8em;margin:4px 0 0;">ATK:${e.bonusAtk||'-'} / DEF:${e.bonusDef||'-'} / HP:${e.bonusHp||'-'}${e.bonusAcc?` / ACC:+${e.bonusAcc}%`:''}</p>
                    <p style="color:#9b59b6;font-size:0.8em;margin:4px 0 0;">🔥 궁극기: ${e.ult}</p>
                </div>`).join('')}
        </div>`;
    document.body.appendChild(overlay);
    window._evolOptions = evols; window._evolOverlay = overlay;
}

// ===================== 전직도(마인드맵) + 전직 이름 해금 =====================
const EVO_SEEN_KEY = 'evolution_seen_v1';
const PLAYED_JOBS_KEY = 'played_jobs_v1';
function loadSeenEvolutions() {
    try {
        const raw = localStorage.getItem(EVO_SEEN_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function saveSeenEvolutions(arr) {
    try {
        localStorage.setItem(EVO_SEEN_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function markEvolutionSeen(name) {
    const n = String(name || '');
    if (!n) return;
    const cur = loadSeenEvolutions();
    if (!cur.includes(n)) {
        cur.push(n);
        saveSeenEvolutions(cur);
    }
}
function evoLabelOrUnknown(name) {
    const n = String(name || '');
    if (!n) return '???';
    return loadSeenEvolutions().includes(n) ? n : '???';
}
function buildEvolutionMindmapHtml() {
    const rows = [
        { base: '워리어', color: '#ff4757', list: ['나이트', '버서커'] },
        { base: '헌터', color: '#2ed573', list: ['궁수', '암살자'] },
        { base: '마법사', color: '#1e90ff', list: ['위저드', '소환사', '성직자'] },
    ];
    const chips = (names) =>
        names
            .map((n) => {
                const v = evoLabelOrUnknown(n);
                const on = v !== '???';
                return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;border:1px solid ${
                    on ? '#f1c40f' : '#333'
                };background:${on ? '#2a2a1a' : '#0a0a0a'};color:${on ? '#f1c40f' : '#444'};font-weight:800;font-size:0.78em;margin:2px;">${v}</span>`;
            })
            .join('');
    return `<div style="margin:0 0 12px 0;padding:12px;background:#0d0d12;border:1px solid #333;border-radius:10px;">
  <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
    <div style="color:#f1c40f;font-weight:900;">🧭 전직도</div>
    <div style="color:#666;font-size:0.75em;">전직 후 해당 이름이 해금됩니다. (해금 전: ???)</div>
  </div>
  <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">
    ${rows
        .map(
            (r) =>
                `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;"><span style="min-width:66px;color:${r.color};font-weight:900;">${r.base}</span><span style="color:#555;">→</span><div>${chips(
                    r.list
                )}</div></div>`
        )
        .join('')}
  </div>
</div>`;
}

function loadPlayedJobs() {
    try {
        const raw = localStorage.getItem(PLAYED_JOBS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function savePlayedJobs(arr) {
    try {
        localStorage.setItem(PLAYED_JOBS_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function markPlayedJob(name) {
    const n = String(name || '').trim();
    if (!n) return;
    const cur = loadPlayedJobs();
    if (!cur.includes(n)) {
        cur.push(n);
        savePlayedJobs(cur);
    }
}
function collectPlayedBaseJobsFromMeta() {
    const out = [];
    try {
        if (typeof MetaRPG === 'undefined') return out;
        const m = MetaRPG.loadMeta();
        const slots = m && Array.isArray(m.slots) ? m.slots : [];
        slots.forEach((s) => {
            const jb = jobBase[s && s.jobKey];
            if (jb && jb.name) out.push(jb.name);
        });
    } catch (e) {
        /* ignore */
    }
    return out;
}
function getPlayedJobsForEvolutionMap() {
    return new Set([...loadPlayedJobs(), ...collectPlayedBaseJobsFromMeta(), ...loadSeenEvolutions()]);
}
function getJobSpecForTooltip(jobName) {
    const n = String(jobName || '');
    for (const k of Object.keys(jobBase || {})) {
        const j = jobBase[k];
        if (j && j.name === n) {
            return { atk: safeNum(j.atk, 0), def: safeNum(j.def, 0), crit: 1, critMult: 1.8, lifesteal: 0 };
        }
    }
    for (const baseName of Object.keys(jobEvolutions || {})) {
        const list = jobEvolutions[baseName] || [];
        const hit = list.find((x) => x && x.name === n);
        if (hit) {
            return {
                atk: safeNum(hit.bonusAtk, 0),
                def: safeNum(hit.bonusDef, 0),
                crit: 1,
                critMult: 1.8,
                lifesteal: 0,
            };
        }
    }
    return { atk: 0, def: 0, crit: 1, critMult: 1.8, lifesteal: 0 };
}
function getJobPassiveText(jobName) {
    const map = {
        워리어: '강인함: 기본 생존력이 높음',
        헌터: '정밀 사격: 명중/딜 균형',
        마법사: '주문 증폭: 높은 기본 공격력',
        나이트: '철벽 수호: 방어/체력 특화',
        버서커: '광전: 공격 특화',
        궁수: '저격 자세: 명중 강화',
        암살자: '암습: 고화력 일격',
        위저드: '마도 폭주: 마법 화력 특화',
        소환사: '소환 지휘: 소환수 중심 운영',
        성직자: `신성력: 최대 ${DIVINE_POWER_MAX}스택, 가호 방어+${DIVINE_BLESSING_DEF_BONUS}`,
    };
    return map[jobName] || '고유 패시브';
}
function buildPlayedEvolutionMapHtml() {
    const played = getPlayedJobsForEvolutionMap();
    const rows = [
        { base: '워리어', color: '#ff4757', list: ['나이트', '버서커'] },
        { base: '헌터', color: '#2ed573', list: ['궁수', '암살자'] },
        { base: '마법사', color: '#1e90ff', list: ['위저드', '소환사', '성직자'] },
    ];
    const makeCard = (name, color) => {
        const spec = getJobSpecForTooltip(name);
        const tip = `${name}\n패시브: ${getJobPassiveText(name)}\n공격력: ${spec.atk}\n방어력: ${spec.def}\n치명타 확률: ${spec.crit}%\n치명타 배율: ${spec.critMult.toFixed(2)}x\n흡혈: ${Math.round(spec.lifesteal * 100)}%`;
        return `<span title="${tip}" style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid ${color};background:#10141a;color:${color};font-weight:800;font-size:0.8em;margin:3px;cursor:help;">${name}</span>`;
    };
    const body = rows
        .map((r) => {
            const names = [r.base, ...r.list].filter((n) => played.has(n));
            if (!names.length) return '';
            const baseShown = names.includes(r.base) ? makeCard(r.base, r.color) : '';
            const evols = r.list.filter((n) => names.includes(n)).map((n) => makeCard(n, '#f1c40f')).join('');
            return `<div style="padding:10px;border:1px solid #2a2a2a;border-radius:10px;background:#0f0f14;"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">${baseShown || '<span style="color:#555;font-size:0.8em;">(기본 직업 미플레이)</span>'}${evols ? '<span style="color:#666;">→</span>' + evols : ''}</div></div>`;
        })
        .filter(Boolean)
        .join('');
    if (!body) {
        return `<div style="padding:14px;border:1px solid #333;border-radius:10px;background:#0d0d12;color:#888;line-height:1.6;">아직 플레이한 직업 기록이 없습니다.<br>캐릭터를 시작하거나 전직하면 이 전직도에 자동으로 표시됩니다.</div>`;
    }
    return `<div style="margin-bottom:10px;color:#888;font-size:0.82em;line-height:1.55;">직업 칩에 마우스를 올리면 패시브와 기본 스탯 정보를 볼 수 있습니다.</div><div style="display:flex;flex-direction:column;gap:8px;">${body}</div>`;
}
window.toggleEvolutionMap = (show) => {
    if (show) {
        const el = document.getElementById('evolution-list');
        if (el) el.innerHTML = buildPlayedEvolutionMapHtml();
    }
    const modal = document.getElementById('evolution-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
};

window.evolve = (idx) => {
    const evol = window._evolOptions[idx];
    const oldName = player.name;
    player.name = evol.name;
    player.evolved = true;
    player.currentPromotion = evol.name;
    markPlayedJob(evol.name);
    markEvolutionSeen(evol.name);
    if (player.metaSlotId && typeof MetaRPG !== 'undefined') {
        const m = MetaRPG.loadMeta();
        const slot = m.slots.find((s) => s.id === player.metaSlotId);
        if (slot) {
            slot.currentPromotion = evol.name;
            slot.promotionHistory = Array.isArray(slot.promotionHistory) ? slot.promotionHistory : [];
            if (!slot.promotionHistory.includes(evol.name)) slot.promotionHistory.push(evol.name);
            MetaRPG.saveMeta(m);
        }
    }
    fullResyncPlayerCombatStatsFromMetaAndInventory();
    // 궁극기 세팅
    player.unlockedSkill = evol.ult;
    const ultSpec = ultSkills[evol.ult];
    player.ultStack = 0;
    player.ultMaxStack = ultSpec ? ultSpec.stackRequired : 3;
    if (evol.name === '소환사') {
        const saved = loadSummonFromStorage();
        if (saved && saved.id) player.summon = saved;
    }
    document.body.removeChild(window._evolOverlay);
    if (evol.name === '성직자') {
        player.divinePower = clampDivinePower(player.divinePower);
        recalcPlayerDivineGainMult();
        normalizeDivineState();
    }
    writeLog(`⚡ [전직] ${oldName} → <b style='color:#f1c40f'>${evol.name}</b>! 궁극기 [${evol.ult}] 획득!`);
    emitPromotionStory(evol.name);
    updateUi(); renderActions();
};

function checkFloorUnlock(f) {
    const baseJob = player.baseJob;
    checkStoryMilestone(f);
    emitFloorStory(f);
    try { maybeUnlockEvolutionItemsFromBasePlay(f); } catch (e) { /* ignore */ }
    if (f%10===0 && floorUnlocks[f]) {
        const gu = getUnlockedFloors(null);
        if (!gu.includes(f)) { saveUnlockedFloor(f,null); showUnlockPopup(`🔓 ${f}층 달성!`,`공용 아이템<br><b style="color:#f1c40f;">${floorUnlocks[f].name}</b>이 상점에 해금!`,'#f1c40f'); writeLog(`🔓 공용 [${floorUnlocks[f].name}] 해금!`); }
    }
    if (f%5===0 && f%10!==0) {
        let ui = null;
        if (baseJob==='워리어'&&floorUnlocks[f]) ui=floorUnlocks[f];
        else if (baseJob==='헌터'&&floorUnlocksHunter[f]) ui=floorUnlocksHunter[f];
        else if (baseJob==='마법사'&&floorUnlocksWizard[f]) ui=floorUnlocksWizard[f];
        if (ui) {
            const ju = getUnlockedFloors(baseJob);
            if (!ju.includes(f)) { saveUnlockedFloor(f,baseJob); showUnlockPopup(`🔓 ${f}층 달성!`,`${player.name} 전용<br><b style="color:#2ed573;">${ui.name}</b>이 해금!`,'#2ed573'); writeLog(`🔓 전용 [${ui.name}] 해금!`); }
        }
    }
}

// ===================== 인카운터(탐험) + 패닉 런 =====================
// stage 2 split: moved to js/encounter.js

// ===================== 적 스폰 =====================
// stage 3 split: moved to js/enemy.js

// stage 1 split: moved to js/uiManager.js

// stage 4 split: moved to js/combatLogic.js

// stage 2 split: moved to js/encounter.js

function renderCombatLogsFromSnapshotRows(rows) {
    const arr = Array.isArray(rows) ? rows : [];
    const html = arr
        .map((msg) => `<p style="margin:4px 0;border-bottom:1px solid #333;padding-bottom:4px;">${msg}</p>`)
        .join('');
    const n = document.getElementById('log');
    if (n) n.innerHTML = html;
    window._combatLogHistory = arr.slice(0, 220);
    renderSlimBattleLog();
}

function showMercEvolutionChoice(onDone) {
    const kind = player.mercCompanionKind;
    const opts = mercCompanionEvolutions[kind];
    if (!opts || !opts.length) {
        if (onDone) onDone();
        return;
    }
    window._mercEvoOnDone = onDone;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:10002;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:26px;max-width:460px;width:92%;text-align:center;">
            <h2 style="color:#f1c40f;margin-bottom:8px;">⚡ 20~30층: 용병 전직 (1회)</h2>
            <p style="color:#aaa;font-size:0.86em;margin-bottom:16px;line-height:1.45;">플레이어 전직보다 약한 수치이지만 상성·딜에 큰 영향을 줍니다. <b>선택 중에는 적 턴이 없습니다.</b></p>
            ${opts.map((e, i) => `
                <div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:14px;margin-bottom:10px;cursor:pointer;text-align:left;" onclick="resolveMercEvolution(${i})" onmouseenter="this.style.borderColor='#f1c40f'" onmouseleave="this.style.borderColor='#555'">
                    <b style="color:#e0e0e0;">${e.name}</b> <span style="color:#888;font-size:0.8em;">→ ${e.pathJob}</span>
                    <p style="color:#888;font-size:0.82em;margin:6px 0 0;">${e.desc}</p>
                </div>`).join('')}
        </div>`;
    window._mercEvoOverlay = overlay;
    document.body.appendChild(overlay);
}

window.resolveMercEvolution = (idx) => {
    const kind = player.mercCompanionKind;
    const opts = mercCompanionEvolutions[kind];
    if (!opts || !opts[idx]) return;
    const ev = opts[idx];
    player.mercEvolution = ev;
    player.mercEvolutionChosen = true;
    const ov = window._mercEvoOverlay;
    if (ov && ov.parentNode) document.body.removeChild(ov);
    window._mercEvoOverlay = null;
    if (player.fieldMerc) {
        const ratio = player.fieldMerc.mercHp / Math.max(1, player.fieldMerc.mercMaxHp);
        player.fieldMerc = buildFieldMercFromTemplate();
        player.fieldMerc.mercHp = Math.max(1, Math.floor(player.fieldMerc.mercMaxHp * ratio));
    }
    writeLog(`[용병 전직] <b>${ev.name}</b> (${ev.pathJob})!`);
    const cb = window._mercEvoOnDone;
    window._mercEvoOnDone = null;
    if (cb) cb();
    updateUi(); renderActions();
};

function processFloorQuestOnVictory() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const FQ = MetaRPG.FLOOR_QUESTS;
    const qdef = FQ[floor];
    if (!qdef) return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot || (slot.questFlags && slot.questFlags[qdef.id])) return;
    if (qdef.needWins) {
        player._questWins = (player._questWins || 0) + 1;
        if (player._questWins >= qdef.needWins) {
            MetaRPG.grantQuestReward(player.metaSlotId, qdef.reward, qdef.id);
            writeLog(`[퀘스트 완료] <b>${qdef.title}</b> — 영구 보상 적용!`);
            player._questWins = 0;
        } else {
            writeLog(`[퀘스트] ${qdef.title} 진행: ${player._questWins}/${qdef.needWins}`);
        }
    } else if (qdef.needBoss && enemy && enemy.isBoss) {
        MetaRPG.grantQuestReward(player.metaSlotId, qdef.reward, qdef.id);
        writeLog(`[퀘스트 완료] <b>${qdef.title}</b> — 보스 격파!`);
    }
}

// stage 4 split: moved to js/combatLogic.js

/** 21층 이상 훈련 모드: 승리해도 층 증가 없음 (상점에서만 모드 전환) */
function proceedWinBattleFarmContinue() {
    const clearedFloor = floor;
    checkFloorUnlock(clearedFloor);
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, clearedFloor);
    if (isMercenaryCaptainJob() && clearedFloor >= 19 && clearedFloor <= 30 && !player.mercEvolutionChosen) {
        setTimeout(() => showMercEvolutionChoice(() => winBattleContinueFrom(clearedFloor)), 450);
        return;
    }
    winBattleContinueFrom(clearedFloor);
}

function failActiveQuestIfLeavingFloor() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const FQ = MetaRPG.FLOOR_QUESTS;
    const qdef = FQ[floor];
    if (!qdef || !qdef.needWins) return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot || (slot.questFlags && slot.questFlags[qdef.id])) return;
    const need = qdef.needWins;
    const cur = player._questWins || 0;
    if (cur < need) {
        MetaRPG.applyQuestPenalty(player.metaSlotId, qdef.failPenalty);
        writeLog(`[퀘스트 실패] ${qdef.title} — 층 이탈/미완료 패널티!`);
    }
    player._questWins = 0;
}

function proceedWinBattleNextFloor() {
    failActiveQuestIfLeavingFloor();
    const clearedFloor = floor;
    floor++;
    applyFloorGrowthRewardForClear(clearedFloor);
    checkFloorUnlock(clearedFloor);
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, clearedFloor);
    const continueAfterRewards = () => {
        if (isMercenaryCaptainJob() && clearedFloor >= 19 && clearedFloor <= 30 && !player.mercEvolutionChosen) {
            setTimeout(() => showMercEvolutionChoice(() => winBattleContinueFrom(clearedFloor)), 450);
            return;
        }
        winBattleContinueFrom(clearedFloor);
    };
    maybeOfferTacticalSkillReward(clearedFloor, continueAfterRewards);
}

function serializeRunState() {
    const shopEl = document.getElementById('shop-area');
    const inShop = shopEl && shopEl.style.display === 'block';
    let enemySnap = null;
    if (!inShop && enemy && safeNum(enemy.curHp, 0) > 0 && safeNum(enemy.hp, 0) > 0) {
        enemySnap = JSON.parse(JSON.stringify(enemy));
    }
    const slot = typeof MetaRPG !== 'undefined' && player && player.metaSlotId ? MetaRPG.getSlotById(player.metaSlotId) : null;
    const playerSnap = player ? JSON.parse(JSON.stringify(player)) : null;
    if (playerSnap) {
        playerSnap.extraAtk = 0;
        playerSnap._relicTempCrit = 0;
        playerSnap._relicGamblerDefSub = 0;
    }
    return {
        floor,
        gold,
        totalGoldEarned,
        rerollCost,
        shopVisitCount,
        lastEnemyJob,
        pendingShop: inShop ? false : pendingShop,
        restockCrossroadActive: !inShop && !enemySnap && typeof restockCrossroadActive !== 'undefined' && !!restockCrossroadActive,
        restockCrossroadContext: !inShop && !enemySnap && typeof restockCrossroadActive !== 'undefined' && restockCrossroadActive
            ? (restockCrossroadContext || null)
            : null,
        resumeAfterRestockCrossroad: inShop && typeof resumeAfterRestockCrossroad !== 'undefined' && resumeAfterRestockCrossroad
            ? resumeAfterRestockCrossroad
            : null,
        encounterPhase: !inShop && !enemySnap && !!window._encounterPhaseActive,
        encounterScene: !inShop && !enemySnap && !!window._encounterPhaseActive ? (window._encounterPhaseScene || null) : null,
        inShop: !!inShop,
        attackGcdUntil,
        defendingTurns,
        dodgingTurns,
        shieldedTurns,
        regenTurns,
        regenAmount,
        combatLogs: Array.isArray(window._combatLogHistory) ? window._combatLogHistory.slice(0, 220) : [],
        enemyBehaviorState: enemySnap
            ? {
                  bossCharge: !!enemySnap.bossCharge,
                  turnCount: safeNum(enemySnap.turnCount, 1),
                  aiGuardedTurns: safeNum(enemySnap._aiGuardedTurns, 0),
                  hunterEvasionTurns: safeNum(enemySnap._hunterEvasionTurns, 0),
              }
            : null,
        player: playerSnap,
        enemy: enemySnap,
        slotLevel: slot ? slot.level : 1,
        slotExp: slot ? slot.exp : 0,
    };
}

function loadRunFromMetaSnapshot(d) {
    if (!d.player) return alert('저장 데이터가 올바르지 않습니다.');
    if (typeof MetaRPG !== 'undefined' && d.player.metaSlotId) {
        MetaRPG.setActiveSlot(d.player.metaSlotId);
        const m = MetaRPG.loadMeta();
        const sl = m.slots.find((s) => s.id === d.player.metaSlotId);
        if (sl && d.slotLevel != null) {
            sl.level = d.slotLevel;
            sl.exp = d.slotExp != null ? d.slotExp : 0;
            MetaRPG.recalcTechBonus(sl);
            MetaRPG.saveMeta(m);
        }
    }
    floor = d.floor;
    gold = d.gold;
    totalGoldEarned = d.totalGoldEarned;
    rerollCost = d.rerollCost != null ? d.rerollCost : 10;
    shopVisitCount = d.shopVisitCount != null ? d.shopVisitCount : 0;
    lastEnemyJob = d.lastEnemyJob || '';
    pendingShop = !!d.pendingShop;
    const savedInShop = !!d.inShop;
    if (typeof restockCrossroadActive !== 'undefined') restockCrossroadActive = !!d.restockCrossroadActive;
    if (typeof restockCrossroadContext !== 'undefined') restockCrossroadContext = d.restockCrossroadContext || null;
    if (typeof resumeAfterRestockCrossroad !== 'undefined') resumeAfterRestockCrossroad = d.resumeAfterRestockCrossroad || null;
    attackGcdUntil = d.attackGcdUntil || 0;
    defendingTurns = d.defendingTurns || 0;
    dodgingTurns = d.dodgingTurns || 0;
    shieldedTurns = d.shieldedTurns || 0;
    regenTurns = d.regenTurns || 0;
    regenAmount = d.regenAmount || 0;
    window._combatLogHistory = Array.isArray(d.combatLogs) ? d.combatLogs.slice(0, 220) : [];
    player = d.player;
    if (player) {
        player.extraAtk = 0;
        player._relicTempCrit = 0;
        player._relicGamblerDefSub = 0;
        if (player.metaSlotId && typeof MetaRPG !== 'undefined') {
            const storySlot = MetaRPG.getSlotById(player.metaSlotId);
            if (storySlot) {
                player.raceKey = player.raceKey || storySlot.raceKey || null;
                player.memoryKey = player.memoryKey || storySlot.memoryKey || null;
                player.originBaseJobKey = player.originBaseJobKey || storySlot.originBaseJobKey || storySlot.jobKey || null;
                player.classKey = player.classKey || storySlot.classKey || storySlot.jobKey || null;
                player.introWeaponKey = player.introWeaponKey || storySlot.introWeaponKey || null;
                player.currentPromotion = player.currentPromotion || storySlot.currentPromotion || null;
            }
        }
        ensurePlayerRunProgressFields(player.metaSlotId && typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    }
    if (player && player.divinePower == null) player.divinePower = 0;
    if (player && player.divineGainMult == null) player.divineGainMult = 1;
    if (player && player.prayerBonusFlat == null) player.prayerBonusFlat = 0;
    if (player && player.priestBlessed == null) player.priestBlessed = false;
    if (player && player.chosenPriest == null) player.chosenPriest = false;
    if (player && player.priestNextCrit == null) player.priestNextCrit = false;
    if (player && player.prayerVulnerableHits == null) player.prayerVulnerableHits = 0;
    if (player && player.prayerCountThisTurn == null) player.prayerCountThisTurn = 0;
    if (player && player.items && typeof clampEquipmentItemStatsToRarityCaps === 'function') {
        player.items.forEach((it) => {
            if (it && it.type !== 'merc') clampEquipmentItemStatsToRarityCaps(it);
        });
    }
    if (player && player.metaSlotId) fullResyncPlayerCombatStatsFromMetaAndInventory();
    if (player && player.name === '성직자') {
        recalcPlayerDivineGainMult();
        normalizeDivineState();
    }
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, d.floor || 1);
    if (player && player.shopRarityBoost == null) player.shopRarityBoost = 0;
    if (player && player.freeShopCoupon == null) player.freeShopCoupon = false;
    if (player && !Array.isArray(player.passiveContractHistory)) player.passiveContractHistory = [];
    if (player && player.hunterExposeStacks == null) player.hunterExposeStacks = 0;
    if (player && player.hunterExposeReady == null) player.hunterExposeReady = false;
    enemy = d.enemy;
    if (enemy && d.enemyBehaviorState) {
        enemy.bossCharge = !!d.enemyBehaviorState.bossCharge;
        enemy.turnCount = safeNum(d.enemyBehaviorState.turnCount, safeNum(enemy.turnCount, 1));
        enemy._aiGuardedTurns = safeNum(d.enemyBehaviorState.aiGuardedTurns, safeNum(enemy._aiGuardedTurns, 0));
        enemy._hunterEvasionTurns = safeNum(d.enemyBehaviorState.hunterEvasionTurns, safeNum(enemy._hunterEvasionTurns, 0));
    }
    if (enemy && (safeNum(enemy.curHp, 0) <= 0 || safeNum(enemy.hp, 0) <= 0)) {
        enemy = null;
    }
    window._enemyThinkingHint = '';
    setCombatProcessing(false);
    document.getElementById('start-area').style.display = 'none';
    renderCombatLogsFromSnapshotRows(window._combatLogHistory);
    enterBattleLayout();
    if (savedInShop) {
        document.getElementById('battle-area').style.display = 'none';
        document.getElementById('shop-area').style.display = 'block';
        pendingShop = false;
        updateUi();
        renderShopItems();
        writeLog('[저장] 상점에서 이어갑니다.');
        if (player && player.metaSlotId && typeof MetaRPG !== 'undefined') MetaRPG.markRunCheckpoint(player.metaSlotId);
        return;
    }
    document.getElementById('shop-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    if (!enemy) {
        if (pendingShop) {
            document.getElementById('battle-area').style.display = 'none';
            document.getElementById('shop-area').style.display = 'block';
            rerollCost = rerollCost || 10;
            updateUi();
            renderShopItems();
        } else if (typeof restockCrossroadActive !== 'undefined' && restockCrossroadActive && typeof renderRestockCrossroad === 'function') {
            renderRestockCrossroad({ immediate: true });
        } else {
            pendingShop = false;
            if (d.encounterPhase) {
                window._encounterPhaseScene = d.encounterScene || null;
                beginFloorEncounter();
            }
            else spawnEnemy();
        }
    } else {
        updateUi();
        renderActions();
    }
    writeLog('[저장] 런을 불러왔습니다.');
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined') MetaRPG.markRunCheckpoint(player.metaSlotId);
}

/** 저장 후 메인 허브 (보존 골드·스냅샷·체크포인트 갱신) */
window.saveAndExitToMain = function saveAndExitToMain() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') {
        writeLog('[저장] 진행 중인 런이 없습니다.');
        return;
    }
    try {
        const payload = serializeRunState();
        MetaRPG.setRunSnapshot(player.metaSlotId, payload);
        MetaRPG.markRunCheckpoint(player.metaSlotId);
        // 랭킹 반영 기준: 사망/클리어 시점이 아닌 "저장한 층"
        saveRank();
        writeLog('[저장] 런을 저장했습니다. 허브에서 이어하기로 복구할 수 있습니다.');
        returnToHubFromRun(true);
    } catch (e) {
        writeLog('[저장] 실패: ' + (e && e.message));
    }
};

/** 저장 없이 메인 — 메타 EXP/레벨 되돌림, 스냅샷 삭제, 보존 골드 미지급 */
window.exitToMainWithoutSave = function exitToMainWithoutSave() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') {
        writeLog('[허브] 진행 중인 런이 없습니다.');
        return;
    }
    if (!confirm('저장 없이 메인으로 이동합니다. 마지막 저장 시점 데이터는 유지됩니다. 계속할까요?')) return;
    returnToHubFromRun(false);
};

function returnToHubFromRun(savedExit) {
    exitBattleLayout();
    if (savedExit) {
        const sg = Math.floor(totalGoldEarned * 0.12);
        if (typeof MetaRPG !== 'undefined') MetaRPG.addSavedGold(sg);
        writeLog(`[허브] 런 종료 — 보존 골드 +${sg}G`);
    } else {
        writeLog('[허브] 저장 없이 종료 — 런 보존 골드 없음 (마지막 저장 데이터는 유지)');
    }
    player = null;
    enemy = null;
    document.getElementById('battle-area').style.display = 'none';
    showPreGameScreen();
}

window.exportFullSave = function exportFullSave() {
    const keys = [
        'dungeon_meta_v7',
        'dungeon_meta_v7_f0',
        'dungeon_meta_v7_f1',
        'dungeon_meta_v7_f2',
        'dungeon_meta_v7_active_file',
        'dungeon_meta_v7_file_migrated_v2',
        'perma_stats',
        'perma_buy_count',
        'saved_gold',
        'item_collection_v5',
        'unlocked_floors_global',
        'unlocked_floors_워리어',
        'unlocked_floors_헌터',
        'unlocked_floors_마법사',
    ];
    const out = { v: 7, gameBuild: GAME_BUILD, exportedAt: new Date().toISOString() };
    keys.forEach((k) => {
        out[k] = localStorage.getItem(k);
    });
    const blob = new Blob([JSON.stringify(out, null, 0)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dungeon-save-${GAME_BUILD}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    localStorage.setItem('user_exported_save_v7', '1');
    alert('✅ 전체 저장 파일을 내려받았습니다. 안전한 곳에 보관하세요.');
};

window.importFullSave = function importFullSave(inputEl) {
    const f = inputEl.files && inputEl.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        try {
            const data = JSON.parse(r.result);
            if (!data || typeof data !== 'object') throw new Error('형식 오류');
            Object.keys(data).forEach((k) => {
                if (k === 'v' || k === 'gameBuild' || k === 'exportedAt') return;
                if (typeof data[k] === 'string' || data[k] === null) {
                    if (data[k] === null) localStorage.removeItem(k);
                    else localStorage.setItem(k, data[k]);
                }
            });
            alert('✅ 불러오기 완료. 화면을 새로고침합니다.');
            location.reload();
        } catch (e) {
            alert('불러오기 실패: ' + (e && e.message));
        }
    };
    r.readAsText(f);
    inputEl.value = '';
};

window.openBaseCampTech = function openBaseCampTech() {
    if (typeof MetaRPG === 'undefined' || !player || !player.metaSlotId) return;
    const shopEl = document.getElementById('shop-area');
    const inShop = shopEl && shopEl.style.display === 'block';
    if (!inShop) {
        writeLog('[베이스캠프] 상점 화면에서만 입장할 수 있습니다.');
        return;
    }
    if (!player.inTown) {
        writeLog('[베이스캠프] 마을에서만 영구 강화를 이용할 수 있습니다.');
        return;
    }
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(MetaRPG.loadMeta());
    const nodes = MetaRPG.getTechNodesForSlot(slot).slice().sort((a, b) => (a.line || '').localeCompare(b.line || '') || (a.id || '').localeCompare(b.id || ''));
    const runGold = safeNum(gold, 0);
    const bought = new Set(slot.techPurchased || []);
    const ov = document.createElement('div');
    ov.id = 'base-camp-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10055;overflow:auto;padding:20px;';
    const rows = nodes
        .map((n) => {
            const has = bought.has(n.id);
            const can = !has && MetaRPG.canPurchaseNode(slot, n.id) && runGold >= n.cost;
            const st = has ? '✅ 보유' : can ? '구매 가능' : '🔒 선행 필요';
            const fx = formatTechEffect(n.effect);
            return `<div style="background:#111;border:1px solid #444;border-radius:8px;padding:10px;margin-bottom:8px;text-align:left;">
            <b style="color:#f1c40f;">${n.name}</b> <span style="color:#888;font-size:0.8em;">${st}</span>
            <div style="color:#ccc;font-size:0.82em;margin:6px 0;line-height:1.4;">효과: ${fx}</div>
            <div style="color:#f1c40f;font-size:0.8em;margin-bottom:6px;">비용: <b>${n.cost}G</b> (런 골드)</div>
            ${!has && MetaRPG.canPurchaseNode(slot, n.id) ? `<button type="button" onclick="buyTechNode('${n.id}')" style="background:#f1c40f;color:#111;border:none;padding:6px 12px;border-radius:6px;font-weight:700;cursor:pointer;" ${runGold < n.cost ? 'disabled' : ''}>구매</button>` : ''}
          </div>`;
        })
        .join('');
    const permaBlock = `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #444;">
      <h3 style="color:#f1c40f;margin:0 0 10px;font-size:1em;">⚔️ 영구 강화 (이 캐릭터 전용 · 무한 · 런 골드)</h3>
      <p style="color:#888;font-size:0.78em;margin-bottom:10px;">체력·공격·방어·치명(소량)·치명 배율. 슬롯마다 별도입니다.</p>
      ${buildPermanentShopHtml()}
    </div>`;
    ov.innerHTML = `<div style="max-width:520px;margin:0 auto;background:#1a1a2e;border:2px solid #9b59b6;border-radius:12px;padding:20px;">
      <h2 style="color:#9b59b6;margin:0 0 8px;">🏕️ 베이스캠프 (${floor}층)</h2>
      <p style="color:#888;font-size:0.85em;">런 골드: <b style="color:#f1c40f;">${runGold}G</b> · 테크: <b>직업 내 노드 자유 조합</b></p>
      <h3 style="color:#e0e0e0;margin:14px 0 8px;font-size:0.95em;">📊 테크 트리</h3>
      <div style="max-height:min(360px,50vh);overflow:auto;margin:12px 0;">${rows}</div>
      ${permaBlock}
      <button type="button" onclick="document.getElementById('base-camp-overlay').remove()" style="width:100%;margin-top:16px;padding:10px;background:#444;color:#fff;border:none;border-radius:8px;cursor:pointer;">닫기</button>
    </div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => {
        ov.scrollTop = window.__baseCampScrollTop || 0;
    });
};

window.buyTechNode = (nodeId) => {
    if (!player || !player.metaSlotId) return;
    const n = MetaRPG.getTechNodeById(nodeId);
    if (!n) return writeLog('[테크] 노드를 찾을 수 없습니다.');
    const cost = n.cost || 0;
    if (gold < cost) return writeLog('[테크] 런 골드 부족');
    const r = MetaRPG.commitTechPurchase(player.metaSlotId, nodeId);
    if (!r.ok) return writeLog(`[테크] ${r.msg}`);
    const elKeep = document.getElementById('base-camp-overlay');
    if (elKeep) window.__baseCampScrollTop = elKeep.scrollTop;
    gold -= cost;
    writeLog(`[테크] ${r.msg} 구매! (-${cost}G)`);
    const el = document.getElementById('base-camp-overlay');
    if (el) el.remove();
    openBaseCampTech();
    updateUi();
};

function milestoneCenturyFloor() {
    saveRank();
    triggerBossWarning(false);
    const cf = floor;
    window.__centuryMilestoneFloor = cf;
    const sg = Math.floor(totalGoldEarned * 0.15);
    if (typeof MetaRPG !== 'undefined') MetaRPG.addSavedGold(sg);
    exitBattleLayout();
    document.getElementById('battle-area').style.display = 'none';
    const old = document.getElementById('century-milestone-overlay');
    if (old) old.remove();
    const ov = document.createElement('div');
    ov.id = 'century-milestone-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:10090;display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML = `<div style="max-width:460px;width:100%;background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:24px;text-align:center;">
      <h2 style="color:#f1c40f;margin:0 0 8px;">🏆 ${cf}층 이정표</h2>
      <p style="color:#ccc;margin:0 0 6px;">무한 던전은 계속됩니다.</p>
      <p style="color:#2ed573;margin:0 0 14px;">보존 +${sg}G</p>
      <button type="button" onclick="continuePastCentury()" style="background:#9b59b6;color:#fff;padding:12px 20px;margin:8px;border:none;border-radius:8px;cursor:pointer;font-weight:700;">♾️ 계속 (${cf + 1}층)</button>
      <button type="button" onclick="returnToHubFromCenturyMilestone()" style="background:#f1c40f;color:#111;padding:12px 20px;margin:8px;border:none;border-radius:8px;cursor:pointer;font-weight:700;">🏠 허브로</button>
    </div>`;
    document.body.appendChild(ov);
}

window.continuePastCentury = () => {
    const cf = window.__centuryMilestoneFloor || 100;
    floor = cf + 1;
    const ov = document.getElementById('century-milestone-overlay');
    if (ov) ov.remove();
    document.getElementById('battle-area').style.display = 'block';
    enterBattleLayout();
    writeLog(`♾️ ${floor}층부터 진행`);
    beginFloorEncounter();
    updateUi();
};
window.returnToHubFromCenturyMilestone = () => {
    const ov = document.getElementById('century-milestone-overlay');
    if (ov) ov.remove();
    player = null;
    enemy = null;
    document.getElementById('battle-area').style.display = 'none';
    showPreGameScreen();
};

window.reincarnateFromCenturyMilestone = function reincarnateFromCenturyMilestone() {
    alert('환생은 허브에서만 가능하며, 최고 500층 도달 후 진행할 수 있습니다.');
};

// stage 2 split: moved to js/shop.js

function saveCollection(itemName) {
    let c=JSON.parse(localStorage.getItem('item_collection_v5')||'[]');
    if(!c.includes(itemName)){c.push(itemName);localStorage.setItem('item_collection_v5',JSON.stringify(c));}
}
function loadCollection() {}

// ===================== 선호(즐겨찾기) 아이템 =====================
const PREF_ITEMS_KEY = 'preferred_items_v1';
function loadPreferredItems() {
    try {
        const raw = localStorage.getItem(PREF_ITEMS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function savePreferredItems(arr) {
    try {
        localStorage.setItem(PREF_ITEMS_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function isPreferredItem(name) {
    const n = String(name || '');
    if (!n) return false;
    return loadPreferredItems().includes(n);
}
function escapeJsSingleQuoteString(s) {
    // onclick="fn('<here>')" 형태용 이스케이프
    return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
/** HTML attribute (title 등)용 */
function escapeHtmlAttr(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r?\n/g, ' ');
}
/** 툴팁·일반 텍스트 노드용 */
function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** synergyRules.detailDesc 우선, 없으면 effectDesc (상점·툴팁 공통) */
function resolveSynergyDetailText(rule) {
    if (!rule) return '';
    const d = String(rule.detailDesc != null ? rule.detailDesc : '').trim();
    if (d) return d;
    return String(rule.effectDesc != null ? rule.effectDesc : '').trim();
}

function buildSynergyTooltipPopupHtml(rule, opts) {
    const o = opts || {};
    const title = escapeHtml(rule.name || '시너지');
    const mainBody = resolveSynergyDetailText(rule);
    const mainHtml = mainBody
        ? `<div class="syn-tip-line syn-tip-detail">${escapeHtml(mainBody)}</div>`
        : `<div class="syn-tip-line syn-tip-muted">조건을 달성하면 세트 효과가 적용됩니다.</div>`;
    const bonusTxt = formatSynergyBonusHuman(rule.bonus || {});
    const bonusHtml = bonusTxt ? `<div class="syn-tip-line syn-tip-bonus">보정 수치: ${escapeHtml(bonusTxt)}</div>` : '';
    let stateHtml = '';
    if (o.mode === 'shop_fromTag') {
        const need = o.need;
        const next = o.next;
        const willActive = !!o.willActive;
        const display = Math.min(next, need);
        stateHtml = willActive
            ? `<div class="syn-tip-line syn-tip-active"><b>미리보기:</b> 이 아이템까지 포함하면 <span class="syn-tip-on">${display}/${need}</span> → <b>발동</b></div>`
            : `<div class="syn-tip-line"><b>미리보기:</b> 진행 <span class="syn-tip-on">${display}/${need}</span> (현재 장착·인벤 기준)</div>`;
    } else if (o.mode === 'shop_needTags') {
        stateHtml = `<div class="syn-tip-line syn-tip-muted">태그 조합 시너지 — 조건을 채우면 아래 보정이 적용됩니다.</div>`;
    } else if (o.mode === 'status') {
        const p = o.p;
        if (p.active) {
            stateHtml = `<div class="syn-tip-line syn-tip-active"><b>상태:</b> <span class="syn-tip-on">발동 중</span> (전투 스탯에 반영)</div>`;
        } else {
            stateHtml = `<div class="syn-tip-line"><b>상태:</b> 진행 ${p.cur}/${p.need} · <b>미발동</b></div>`;
        }
    }
    return `<span class="synergy-tip-popup" role="tooltip"><span class="syn-tip-title">${title}</span>${mainHtml}${bonusHtml}${stateHtml}</span>`;
}
function formatSynergyBonusHuman(b) {
    if (!b) return '';
    const parts = [];
    if (b.atk) parts.push(`공격+${b.atk}`);
    if (b.hp) parts.push(`체력+${b.hp}`);
    if (b.def) parts.push(`방어+${b.def}`);
    if (b.crit) parts.push(`치명+${b.crit}%`);
    if (b.critMult) parts.push(`치명 배율+${Math.round(b.critMult * 100)}%`);
    return parts.join(', ');
}
window.togglePreferredItem = function togglePreferredItem(name) {
    const n = String(name || '');
    if (!n) return;
    const cur = loadPreferredItems();
    const idx = cur.indexOf(n);
    if (idx >= 0) cur.splice(idx, 1);
    else cur.push(n);
    savePreferredItems(cur);
    try { toggleCollection(true); } catch (e) { /* ignore */ }
    try { renderShopItems(); } catch (e) { /* ignore */ }
};

function getEquipSlotKind(it) {
    if (!it) return null;
    if (it.type === 'atk') return 'weapon';
    if (it.type === 'hp') return 'armor';
    if (it.type === 'ring') return 'ring';
    if (it.type === 'util') return 'ring';
    if (it.type === 'rune') return 'rune';
    return null;
}
function getEquipSlotLimit(kind) {
    if (kind === 'weapon') return 3;
    if (kind === 'armor') return 3;
    if (kind === 'ring') return 6;
    if (kind === 'rune') return 3;
    return Infinity;
}
function getEquipSlotLabel(kind) {
    if (kind === 'weapon') return '무기';
    if (kind === 'armor') return '갑옷';
    if (kind === 'ring') return '반지';
    if (kind === 'rune') return '룬';
    return '장비';
}
function getEquipSlotLineHtml(it) {
    const k = getEquipSlotKind(it);
    if (!k) return '';
    const lim = getEquipSlotLimit(k);
    const label = getEquipSlotLabel(k);
    const icon = k === 'weapon' ? '⚔️' : k === 'armor' ? '🛡️' : k === 'rune' ? '🔮' : '💍';
    return `<div style="color:#9fb0ff;font-size:0.76em;margin-top:4px;line-height:1.35;">${icon} <b>장착 칸</b>: ${label} (동시 최대 ${lim}개)</div>`;
}
/** 상점 카드 — 장비만 HP/공격/방어/치명·배율 등 수치 블록(명중·체감 표시 없음) */
function buildShopItemCombatStatsHtml(it) {
    if (!it || it.type === 'relic' || it.type === 'potion' || it.type === 'merc_shop_direct' || it.type === 'merc_shop_fund' || it.type === 'merc') return '';
    if (typeof buildEquipmentStatParts !== 'function') return '';
    const parts = buildEquipmentStatParts(it);
    if (!parts.length) return '';
    const rows = parts.map((p) => `<div style="font-size:0.74em;color:#d0d8ea;line-height:1.45;">• ${p}</div>`).join('');
    return `<div style="margin-top:6px;padding:8px;background:#141820;border-radius:8px;border:1px solid #2a3548;"><div style="font-size:0.68em;color:#7f8c9d;font-weight:700;margin-bottom:4px;">장비 수치</div>${rows}</div>`;
}
function buildSynergyStatusHtml() {
    return '';
}
function getEquippedCountByKind(kind) {
    return (player.items || []).filter((x) => getEquipSlotKind(x) === kind).length;
}
function canEquipMoreOfItem(it) {
    const k = getEquipSlotKind(it);
    if (!k) return true;
    return getEquippedCountByKind(k) < getEquipSlotLimit(k);
}
window.getEquipSlotKind = getEquipSlotKind;
window.getEquipSlotLimit = getEquipSlotLimit;
window.getEquippedCountByKind = getEquippedCountByKind;
window.canEquipMoreOfItem = canEquipMoreOfItem;

function getItemSynergyHints(it) {
    return [];
    /*
    if (!it || typeof synergyRules === 'undefined' || !Array.isArray(synergyRules)) return [];
    const tags = new Set();
    const tg = it.tags || it.tagList;
    if (Array.isArray(tg)) tg.forEach((t) => tags.add(String(t)));
    if (it.rarity) tags.add('rarity_' + String(it.rarity));
    if (it.type) tags.add('type_' + String(it.type));
    const curTagCounts = {};
    for (const x of player.items || []) {
        if (!x) continue;
        const xt = x.tags || x.tagList;
        if (Array.isArray(xt)) xt.forEach((t) => { const k = String(t); curTagCounts[k] = (curTagCounts[k] || 0) + 1; });
        if (x.rarity) {
            const k = 'rarity_' + String(x.rarity);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
        if (x.type) {
            const k = 'type_' + String(x.type);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
    }
    const alreadyOwned = (player.items || []).some((x) => x && x.name === it.name);
    const hints = [];
    for (const rule of synergyRules) {
        if (!rule) continue;
        if (rule.fromTag && tags.has(String(rule.fromTag)) && rule.needCount) {
            const cur = curTagCounts[rule.fromTag] || 0;
            const next = cur + (alreadyOwned ? 0 : 1);
            hints.push(`${rule.name} ${Math.min(next, rule.needCount)}/${rule.needCount}`);
        } else if (Array.isArray(rule.needTags) && rule.needTags.some((t) => tags.has(String(t)))) {
            hints.push(rule.name || '시너지');
        }
    }
    return hints;
    */
}
/** 상점 카드: 시너지 진행 문구 — 호버 시 떠 있는 툴팁(전체 효과·미리보기) */
function buildShopSynergyHintsHtml(it) {
    return '';
    /*
    if (!it || typeof synergyRules === 'undefined' || !Array.isArray(synergyRules)) return '';
    const tags = new Set();
    const tg = it.tags || it.tagList;
    if (Array.isArray(tg)) tg.forEach((t) => tags.add(String(t)));
    if (it.rarity) tags.add('rarity_' + String(it.rarity));
    if (it.type) tags.add('type_' + String(it.type));
    const curTagCounts = {};
    for (const x of player.items || []) {
        if (!x) continue;
        const xt = x.tags || x.tagList;
        if (Array.isArray(xt)) xt.forEach((t) => { const k = String(t); curTagCounts[k] = (curTagCounts[k] || 0) + 1; });
        if (x.rarity) {
            const k = 'rarity_' + String(x.rarity);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
        if (x.type) {
            const k = 'type_' + String(x.type);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
    }
    const alreadyOwned = (player.items || []).some((x) => x && x.name === it.name);
    const parts = [];
    for (const rule of synergyRules) {
        if (!rule) continue;
        if (rule.fromTag && tags.has(String(rule.fromTag)) && rule.needCount) {
            const cur = curTagCounts[rule.fromTag] || 0;
            const next = cur + (alreadyOwned ? 0 : 1);
            const need = rule.needCount;
            const label = `${rule.name} ${Math.min(next, need)}/${need}`;
            const willActive = next >= need;
            const popup = buildSynergyTooltipPopupHtml(rule, { mode: 'shop_fromTag', next, need, willActive });
            parts.push(
                `<span class="synergy-tip-wrap synergy-tip-wrap--shop"><span class="synergy-tip-trigger synergy-tip-trigger--shop">${escapeHtml(label)}</span>${popup}</span>`
            );
        } else if (Array.isArray(rule.needTags) && rule.needTags.some((t) => tags.has(String(t)))) {
            const popup = buildSynergyTooltipPopupHtml(rule, { mode: 'shop_needTags' });
            parts.push(
                `<span class="synergy-tip-wrap synergy-tip-wrap--shop"><span class="synergy-tip-trigger synergy-tip-trigger--shop">${escapeHtml(rule.name || '시너지')}</span>${popup}</span>`
            );
        }
    }
    if (!parts.length) return '';
    const sep = '<span class="shop-synergy-sep">·</span>';
    return `<div class="shop-card-synergy-inner"><span class="shop-card-synergy-label">시너지:</span>${parts.join(sep)}</div>`;
    */
}
function ensureOwnedItemUid(it) {
    if (!it) return;
    if (!it._uid) it._uid = 'it_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function removeOwnedItemEffects(it) {
    if (!it || !player) return;
    if (it.type === 'rune') {
        if (typeof it.value === 'number' && it.value) {
            player.atk = Math.max(1, safeNum(player.atk, 1) - safeNum(it.value, 0));
        }
        if (typeof it.hpBonus === 'number' && it.hpBonus) {
            player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - safeNum(it.hpBonus, 0));
            player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0));
        }
        if (it.def) player.extraDef = Math.max(0, safeNum(player.extraDef, 0) - safeNum(it.def, 0));
        if (it.lifesteal) player.lifesteal = Math.max(0, safeNum(player.lifesteal, 0) - safeNum(it.lifesteal, 0));
        if (it.critBonus) player.crit = Math.max(1, safeNum(player.crit, 1) - safeNum(it.critBonus, 0));
        if (it.critMult) player.critMult = Math.max(1.8, safeNum(player.critMult, 1.8) - safeNum(it.critMult, 0));
        if (it.damageReduction) player.damageReduction = Math.max(0, safeNum(player.damageReduction, 0) - safeNum(it.damageReduction, 0));
        if (it.potionHealBonus) player.potionHealBonus = Math.max(0, safeNum(player.potionHealBonus, 0) - safeNum(it.potionHealBonus, 0));
        const hasRegen = (player.items || []).some((x) => x !== it && x && x.regenPotion);
        player.hasRegenPotion = !!hasRegen;
        recalcPlayerDivineGainMult();
        return;
    }
    if (it.type === 'atk' || it.type === 'ring') player.atk = Math.max(1, safeNum(player.atk, 1) - safeNum(it.value, 0));
    if (it.type === 'hp') {
        player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - safeNum(it.value, 0));
        player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0));
    }
    if (it.type !== 'rune' && typeof it.hpBonus === 'number' && it.hpBonus) {
        player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - safeNum(it.hpBonus, 0));
        player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0));
    }
    if (it.def) player.extraDef = Math.max(0, safeNum(player.extraDef, 0) - safeNum(it.def, 0));
    if (it.lifesteal) player.lifesteal = Math.max(0, safeNum(player.lifesteal, 0) - safeNum(it.lifesteal, 0));
    if (it.critBonus) player.crit = Math.max(1, safeNum(player.crit, 1) - safeNum(it.critBonus, 0));
    if (it.critMult) player.critMult = Math.max(1.8, safeNum(player.critMult, 1.8) - safeNum(it.critMult, 0));
    if (it.damageReduction) player.damageReduction = Math.max(0, safeNum(player.damageReduction, 0) - safeNum(it.damageReduction, 0));
    if (it.potionHealBonus) player.potionHealBonus = Math.max(0, safeNum(player.potionHealBonus, 0) - safeNum(it.potionHealBonus, 0));
    const hasRegen = (player.items || []).some((x) => x !== it && x && x.regenPotion);
    player.hasRegenPotion = !!hasRegen;
    recalcPlayerDivineGainMult();
}
// stage 2 split: moved to js/shop.js

async function saveRank() {
    if(!currentUser) return;
    try {
        const bj = player.baseJob || player.name;
        const uid = getCurrentUserKey();
        const nick = getCurrentUserNick();
        if (!uid || !bj) return;
        const docId = `${uid}__${bj}`;
        const ref = db.collection("global_ranks").doc(docId);
        const old = await ref.get();
        const oldFloor = old.exists ? safeNum(old.data().floor, 0) : 0;
        if (old.exists && oldFloor >= floor) return;
        await ref.set({
            userId: uid,
            email: nick,
            displayName: nick,
            job: player.name,
            baseJob: bj,
            floor: floor,
            killer: enemy ? enemy.name : "알 수 없음",
            date: new Date().toLocaleDateString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch(e){console.error("랭킹 저장 에러:",e);}
}

async function loadRank() {
    try { renderRankBoard(); } catch(e){document.getElementById('rank-list').innerHTML='랭킹 서버 연결 실패';}
}

window.togglePatchNotes=(show)=>{document.getElementById('patch-modal').style.display=show?'flex':'none';};
window.toggleRank=(show)=>{
    document.getElementById('rank-modal').style.display=show?'flex':'none';
    if(show){
        if (currentUser && (!rankRealtimeUnsubs || !rankRealtimeUnsubs.length)) subscribeRankRealtime();
        loadRank();
    }
};
window.toggleInv = () => {};

window.mercGoldSkipCooldown = () => {
    if (!player || !isMercenaryCaptainJob()) return;
    const cost = getMercGoldSkipCost();
    if (gold < cost) return writeLog('[자본주의] 골드가 부족합니다.');
    gold -= cost;
    player.mercCooldownTurns = 0;
    player._mercCooldownSkipOnce = false;
    if (player.mercCompanionKind) {
        player.mercReviveAt90Percent = false;
        player.fieldMerc = buildFieldMercFromTemplate();
        player.fieldMerc.mercHp = player.fieldMerc.mercMaxHp;
        writeLog(`[자본주의] 🪙 ${cost}G로 동료를 만전 상태로 재전개! (${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp})`);
    } else {
        writeLog(`[자본주의] 🪙 ${cost}G로 쿨타임을 초기화했습니다!`);
    }
    updateUi(); renderActions();
};

window.useMercenarySlot = () => {
    writeLog('[고용] 고용 아이템 시스템은 폐지되었습니다. 시작 시 동료 선택·쿨 종료·🪙 긴급 재가동을 이용하세요.');
};
function codexItemMatchesTab(it, tab) {
    if (!it || !it.name) return false;
    if (tab === '용병') {
        const keys = new Set(getMercEquipmentJobKeys());
        if (it.type === 'merc') return false;
        if (!it.onlyFor || !Array.isArray(it.onlyFor) || it.onlyFor.length === 0) return true;
        return it.onlyFor.some((j) => keys.has(j));
    }
    if (tab === '성직자') {
        if (it.type === 'merc') return false;
        const of = it.onlyFor;
        return Array.isArray(of) && of.includes('성직자');
    }
    if (it.type === 'merc') return false;
    const of = it.onlyFor;
    if (tab === '공용') return !of || (Array.isArray(of) && of.length === 0);
    if (!of || !Array.isArray(of)) return false;
    const W = ['워리어', '나이트', '버서커'];
    const H = ['헌터', '궁수', '암살자'];
    const M = ['마법사', '위저드', '소환사'];
    if (tab === '워리어') return of.some((j) => W.includes(j));
    if (tab === '헌터') return of.some((j) => H.includes(j));
    if (tab === '마법사') return of.some((j) => M.includes(j));
    return false;
}

window.setCodexTab = (t) => {
    window._codexTab = t;
    toggleCollection(true);
};
window.setCodexStatFilter = (f) => {
    window._codexStatFilter = f || 'all';
    toggleCollection(true);
};
function getCodexStatMetric(it, filter) {
    if (!it) return 0;
    if (filter === 'atk') return safeNum(it.type === 'atk' ? it.value : 0, 0);
    if (filter === 'def') return safeNum(it.def, 0);
    if (filter === 'crit') return safeNum(it.critBonus, 0);
    if (filter === 'critMult') return safeNum(it.critMult, 0);
    if (filter === 'ring') return safeNum(it.type === 'ring' ? it.value : 0, 0);
    return 0;
}

window.toggleCollection = (show) => {
    if (show) {
        if (!window._codexTab) window._codexTab = '공용';
        if (!window._codexStatFilter) window._codexStatFilter = 'all';
        const mercMode = player && player.baseJob === '용병단장';
        if (mercMode && window._codexTab === '공용') window._codexTab = '용병';
        const tab = window._codexTab;
        const statFilter = window._codexStatFilter;
        const tabs = mercMode ? ['용병', '워리어', '헌터', '마법사'] : ['공용', '워리어', '헌터', '마법사', '성직자'];
        const collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
        const allItems = [
            ...equipmentPool,
            ...relicPool,
            ...Object.values(floorUnlocks).filter((i) => i && i.name),
            ...Object.values(floorUnlocksHunter).filter((i) => i && i.name),
            ...Object.values(floorUnlocksWizard).filter((i) => i && i.name),
        ];
        const seen = new Set();
        const uniqueItems = allItems.filter((i) => {
            if (!i || !i.name || seen.has(i.name)) return false;
            seen.add(i.name);
            return true;
        });
        let tabItems = uniqueItems.filter((i) => codexItemMatchesTab(i, tab));
        if (statFilter !== 'all') {
            tabItems = tabItems
                .filter((i) => getCodexStatMetric(i, statFilter) > 0)
                .sort((a, b) => getCodexStatMetric(b, statFilter) - getCodexStatMetric(a, statFilter));
        }
        const rarityLabels = {
            relic: { label: 'RELIC', color: '#f39c12', bg: '#2a1a0a' },
            legendary: { label: 'LEGENDARY', color: '#e74c3c', bg: '#2d1a1a' },
            epic: { label: 'EPIC', color: '#a55eea', bg: '#1e1a2d' },
            rare: { label: 'RARE', color: '#1e90ff', bg: '#1a1e2d' },
            common: { label: 'COMMON', color: '#888', bg: '#2a2a2a' },
        };
        const rarityOrder = { relic: 0, legendary: 1, epic: 2, rare: 3, common: 4 };
        const relicItems = tabItems.filter((i) => relicPool.some((r) => r.name === i.name));
        const equipItems = tabItems.filter((i) => !relicPool.some((r) => r.name === i.name));
        const tabBar = tabs
            .map(
                (t) =>
                    `<button type="button" onclick="setCodexTab('${t}')" style="margin:2px;padding:6px 10px;font-size:0.75em;font-weight:700;border-radius:6px;border:1px solid ${t === tab ? '#f1c40f' : '#444'};background:${t === tab ? '#2a2a1a' : '#111'};color:${t === tab ? '#f1c40f' : '#888'};cursor:pointer;">${t}</button>`
            )
            .join('');
        const statFilters = [
            { id: 'all', label: '전체' },
            { id: 'atk', label: '공격력 높은 순' },
            { id: 'def', label: '방어력 높은 순' },
            { id: 'crit', label: '치명 확률 높은 순' },
            { id: 'critMult', label: '치명 배율 높은 순' },
            { id: 'ring', label: '반지 공격 높은 순' },
        ];
        const statBar = statFilters
            .map(
                (x) =>
                    `<button type="button" onclick="setCodexStatFilter('${x.id}')" style="margin:2px;padding:6px 10px;font-size:0.72em;font-weight:700;border-radius:6px;border:1px solid ${x.id === statFilter ? '#2ed573' : '#444'};background:${x.id === statFilter ? '#122a1a' : '#111'};color:${x.id === statFilter ? '#2ed573' : '#888'};cursor:pointer;">${x.label}</button>`
            )
            .join('');
        let html = '';
        html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;align-items:center;">${tabBar}</div>`;
        html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;align-items:center;">${statBar}</div>`;
        html += `<p style="color:#888;font-size:0.85em;margin-bottom:15px;">탭: <b style="color:#f1c40f;">${tab}</b> · 해금: <b style="color:#f1c40f;">${collection.length}</b> / ${uniqueItems.length}</p>`;
        if (tab === '용병') {
            html += `<p style="color:#b87333;font-size:0.78em;margin:-8px 0 12px;line-height:1.45;">📜 <b>동료 장비 풀</b> — 전투 <b>💰 용병 지원</b>·상점 <b>직거래/자금 지원</b>으로 얻는 장비입니다. (이름 중복 없이 랜덤)</p>`;
        }
        if (tab === '성직자') {
            html += `<p style="color:#9b59b6;font-size:0.78em;margin:-8px 0 12px;line-height:1.45;">📜 <b>성직자 전용 장비</b> — 일부 장비에 <b>신성력 획득량 증가</b> 옵션이 붙어 있습니다.</p>`;
        }
        if (relicItems.length > 0) {
            html += `<div style="margin-bottom:16px;border-bottom:1px solid #333;padding-bottom:12px;"><div style="background:#2a2a0a;color:#f1c40f;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:8px;letter-spacing:1px;">✨ RELIC (유물)</div>`;
            relicItems.forEach((it) => {
                if (collection.includes(it.name)) {
                    const pref = isPreferredItem(it.name);
                    html += `<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #f1c40f;display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><div><div style="color:#f1c40f;font-weight:700;font-size:0.9em;">✅ ✨ ${formatShopItemName(it.name)}${pref ? ' <span style="color:#f1c40f;">★</span>' : ''}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${formatShopItemDesc(it.desc)}</div></div><button type="button" onclick="togglePreferredItem('${escapeJsSingleQuoteString(it.name)}')" style="background:${pref ? '#f1c40f' : '#111'};color:${pref ? '#111' : '#f1c40f'};border:1px solid #f1c40f;border-radius:8px;padding:6px 10px;font-weight:900;cursor:pointer;font-size:0.78em;">★</button></div>`;
                }
                else html += `<div style="padding:8px 10px;background:#0a0a0a;border-radius:6px;margin-bottom:4px;border-left:3px solid #333;"><div style="color:#444;font-weight:700;font-size:0.9em;">🔒 ???</div></div>`;
            });
            html += `</div>`;
        }
        const groups = { relic: [], legendary: [], epic: [], rare: [], common: [] };
        equipItems.sort((a, b) => (rarityOrder[a.rarity] ?? 9) - (rarityOrder[b.rarity] ?? 9));
        equipItems.forEach((it) => {
            const owned = collection.includes(it.name);
            const rk = it.rarity === 'relic' ? 'relic' : it.rarity || 'common';
            (groups[rk] || groups.common).push({ ...it, owned });
        });
        Object.entries(groups).forEach(([rarity, items]) => {
            if (!items.length) return;
            const { label, color, bg } = rarityLabels[rarity] || rarityLabels.common;
            html += `<div style="margin-bottom:12px;"><div style="background:${bg};color:${color};font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;letter-spacing:1px;">${label}</div>`;
            items.forEach((it) => {
                if (it.owned) {
                    const pref = isPreferredItem(it.name);
                    html += `<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid ${color};display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><div><div style="color:${color};font-weight:700;font-size:0.9em;">✅ ${formatShopItemName(it.name)}${pref ? ' <span style="color:#f1c40f;">★</span>' : ''}</div>${getEquipSlotLineHtml(it)}<div style="color:#666;font-size:0.78em;margin-top:3px;">${formatShopItemDesc(it.desc)}</div></div><button type="button" onclick="togglePreferredItem('${escapeJsSingleQuoteString(it.name)}')" style="background:${pref ? '#f1c40f' : '#111'};color:${pref ? '#111' : '#f1c40f'};border:1px solid #f1c40f;border-radius:8px;padding:6px 10px;font-weight:900;cursor:pointer;font-size:0.78em;">★</button></div>`;
                }
                else html += `<div style="padding:8px 10px;background:#0a0a0a;border-radius:6px;margin-bottom:4px;border-left:3px solid #333;"><div style="color:#444;font-weight:700;font-size:0.9em;">🔒 ???</div></div>`;
            });
            html += `</div>`;
        });
        document.getElementById('collection-list').innerHTML = html;
    }
    document.getElementById('collection-modal').style.display = show ? 'flex' : 'none';
};

/** 던전·상점 중 왼쪽 인벤 패널 (모달과 동일 내용) */
function renderInventoryPanel() {
    const invList = document.getElementById('inv-list');
    if (!invList || !player) return;
    if (Array.isArray(player.party) && typeof fullResyncPlayerCombatStatsFromMetaAndInventory === 'function') {
        fullResyncPlayerCombatStatsFromMetaAndInventory();
    }
    const hasMercGear = isMercenaryCaptainJob() && player.mercInventory && player.mercInventory.length > 0;
    const rl = {
        legendary: { label: 'LEGENDARY', color: '#e74c3c', bg: '#2d1a1a' },
        epic: { label: 'EPIC', color: '#a55eea', bg: '#1e1a2d' },
        rare: { label: 'RARE', color: '#1e90ff', bg: '#1a1e2d' },
        common: { label: 'COMMON', color: '#888', bg: '#2a2a2a' },
    };
    let html = '';
    const partyMode = Array.isArray(player.party);
    const activeMember = partyMode ? getActiveInventoryPartyMember() : null;
    const sourceItems = activeMember ? (activeMember.items || []) : (player.items || []);
    if (partyMode) {
        const tabs = getPartyRoleTabs()
            .map((role) => {
                const selected = activeMember && activeMember.roleKey === role.key;
                return `<button type="button" onclick="setInventoryPartyTab('${role.key}')" style="flex:1;min-width:0;padding:7px 6px;border-radius:8px;border:1px solid ${selected ? role.color : '#333'};background:${selected ? 'rgba(241,196,15,0.12)' : '#111'};color:${selected ? role.color : '#888'};font-size:0.78em;font-weight:900;cursor:pointer;">${role.label}</button>`;
            })
            .join('');
        const st = activeMember && activeMember.stats ? activeMember.stats : {};
        html += `<div style="display:flex;gap:6px;margin:0 0 10px;">${tabs}</div>`;
        if (activeMember) {
            html += `<div style="margin-bottom:10px;padding:8px 10px;background:#10141d;border:1px solid #293142;border-radius:9px;line-height:1.35;">
                <div style="color:#f1c40f;font-size:0.88em;font-weight:900;">${escapeHtml(activeMember.name)} 장비</div>
                <div style="color:#94a3b8;font-size:0.72em;margin-top:3px;">HP ${Math.max(0, Math.floor(activeMember.curHp))}/${Math.max(1, Math.floor(activeMember.maxHp))} · 힘${st.str} 방${st.def} 체${st.hp} 지${st.int} 지혜${st.wis} 민${st.agi}</div>
            </div>`;
        }
    }
    if (hasMercGear) {
        html += `<div style="margin-bottom:10px;"><div style="background:#164a35;color:#2ed573;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">🛡️ 용병 장비 (전열)</div>`;
        player.mercInventory.forEach((it) => {
            html += `<div class="inv-compact-block" style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #2ed573;"><div style="color:#2ed573;font-weight:700;font-size:0.9em;">${it.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${it.desc || ''}</div></div>`;
        });
        html += `</div>`;
    }
    if (player.relics && player.relics.length > 0) {
        html += `<div style="margin-bottom:10px;"><div style="background:#2a2a0a;color:#f1c40f;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">✨ RELIC</div>`;
        player.relics.forEach((ef) => {
            const r = relicPool.find((rp) => rp.effect === ef);
            if (r) {
                html += `<div class="inv-compact-block" style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #f1c40f;"><div style="color:#f1c40f;font-weight:700;font-size:0.9em;">✨ ${r.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${r.desc}</div></div>`;
            }
        });
        html += `</div>`;
    }
    if (player.bonusSkills && player.bonusSkills.length > 0) {
        html += `<div style="margin-bottom:10px;"><div style="background:#1a0a2a;color:#9b59b6;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">✨ 각성 스킬</div>`;
        const skillNames = {
            bonus_bleed: '피의 분노',
            bonus_regen: '강철 심장',
            bonus_explode: '폭발 일격',
            bonus_guard: '철벽',
            bonus_hunter_eye: '사냥꾼의 눈',
        };
        player.bonusSkills.forEach((s) => {
            html += `<div class="inv-compact-block" style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #9b59b6;"><div style="color:#9b59b6;font-weight:700;font-size:0.9em;">✨ ${skillNames[s] || s}</div></div>`;
        });
        html += `</div>`;
    }
    const ro = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const slotDefs = partyMode
        ? [
            { kind: 'weapon', icon: '⚔️', label: '무기 슬롯', color: '#ffb347', hint: '캐릭터별 최대 1개', limit: 1 },
            { kind: 'rune', icon: '🔮', label: '각인 룬 슬롯', color: '#00cec9', hint: '캐릭터별 최대 1개', limit: 1 },
            { kind: 'armor', icon: '🛡️', label: '갑옷 슬롯', color: '#74b9ff', hint: '캐릭터별 최대 2개', limit: 2 },
            { kind: 'ring', icon: '💍', label: '반지 슬롯', color: '#9b59b6', hint: '캐릭터별 최대 3개', limit: 3 },
        ]
        : [
            { kind: 'rune', icon: '🔮', label: '각인 룬 슬롯', color: '#00cec9', hint: '최대 1개' },
            { kind: 'armor', icon: '🛡️', label: '갑옷 슬롯', color: '#74b9ff', hint: '최대 2개' },
            { kind: 'ring', icon: '💍', label: '반지 슬롯', color: '#9b59b6', hint: '최대 3개' },
            { kind: 'weapon', icon: '⚔️', label: '무기 슬롯', color: '#ffb347', hint: '최대 2개' },
        ];
    html += `<div class="inventory-slot-board">`;
    slotDefs.forEach((sdef) => {
        const limit = Math.max(1, Math.floor(safeNum(sdef.limit, getEquipSlotLimit(sdef.kind))));
        const slotItems = sourceItems
            .filter((it) => getEquipSlotKind(it) === sdef.kind)
            .sort((a, b) => (ro[a.rarity] || 3) - (ro[b.rarity] || 3));
        const cellCount = Math.max(limit, Math.min(slotItems.length, limit));
        html += `<section class="inventory-slot-section" style="--slot-accent:${sdef.color};">
            <div class="inventory-slot-header">
                <span class="inventory-slot-title">${sdef.icon} ${sdef.label}</span>
                <span class="inventory-slot-count">${slotItems.length}/${limit}</span>
            </div>
            <div class="inventory-slot-hint">${sdef.hint}</div>
            <div class="inventory-slot-grid">`;
        for (let i = 0; i < cellCount; i++) {
            const it = slotItems[i];
            if (!it) {
                html += `<div class="inventory-slot-cell inventory-slot-cell-empty">
                    <span class="inventory-empty-mark">+</span>
                    <span>비어 있음</span>
                </div>`;
                continue;
            }
            ensureOwnedItemUid(it);
            const rarity = it.rarity || 'common';
            const rarityInfo = rl[rarity] || rl.common;
            const bp = Math.max(0, safeNum(it._buyPrice != null ? it._buyPrice : it.price, 0));
            const rf = Math.floor(bp * 0.5);
            const starterGear = typeof isStarterGearItem === 'function' ? isStarterGearItem(it) : !!(it.isStarterGear || it.starterGearKind);
            const defectBadge = it.defectType === 'twisted'
                ? '<span class="inventory-item-price" style="margin:0;color:#d980fa;">뒤틀린 · 던전 해제 불가</span>'
                : it.defectType === 'rusted'
                  ? '<span class="inventory-item-price" style="margin:0;color:#ff7675;">녹슨 · 출혈</span>'
                  : '';
            const lockedInDungeon = it.defectType === 'twisted' && player && !player.inTown;
            html += `<div class="inventory-slot-cell inventory-slot-cell-filled" style="--rarity-color:${rarityInfo.color};">
                <div class="inventory-item-top">
                    <span class="inventory-item-rarity" style="background:${rarityInfo.bg};color:${rarityInfo.color};">${rarityInfo.label}</span>
                    ${defectBadge || ''}
                    ${lockedInDungeon
                        ? '<span class="inventory-item-price" style="margin:0;color:#d980fa;">잠김</span>'
                        : starterGear
                        ? '<span class="inventory-item-price" style="margin:0;color:#f1c40f;">고유</span>'
                        : `<button type="button" class="inventory-sell-btn" onclick="sellItemByUid('${escapeJsSingleQuoteString(it._uid)}')">판매</button>`}
                </div>
                <div class="inventory-item-name">${formatShopItemName(it.name)}</div>
                <div class="inventory-item-desc">${formatShopItemDesc(it.desc)}</div>
                <div class="inventory-item-price">${starterGear ? '상점에서 수리 및 복원 가능' : `판매가 <b>${rf}G</b>`}</div>
            </div>`;
        }
        html += `</div></section>`;
    });
    html += `</div>`;
    if (!html.trim()) {
        html = '<div style="color:#555;text-align:center;padding:12px;">장비가 없습니다.</div>';
    }
    invList.innerHTML = html;
}

window.onclick=function(event){
    if(event.target===document.getElementById('patch-modal'))togglePatchNotes(false);
    if(event.target===document.getElementById('rank-modal'))toggleRank(false);
    if(event.target===document.getElementById('collection-modal'))toggleCollection(false);
    if(event.target===document.getElementById('evolution-modal'))toggleEvolutionMap(false);
};

// stage 1 split: moved to js/uiManager.js

// stage 4 split: moved to js/combatLogic.js

window.startInfiniteMode=()=>{
    floor=101; document.querySelector('.screen').innerHTML='';
    document.getElementById('battle-area').style.display='block'; enterBattleLayout();
    writeLog(`♾️ [무한모드] 101층부터 끝없는 도전!`); beginFloorEncounter(); updateUi();
};

// stage 4 split: moved to js/combatLogic.js

/** 사망 후 저장 런으로 복구 — 보존/페널티 없음 */
// stage 4 split: moved to js/combatLogic.js

/** 사망 처리: 보존 골드·퀘스트 페널티 후 허브로 */
// stage 4 split: moved to js/combatLogic.js
