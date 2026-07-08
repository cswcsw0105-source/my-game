'use strict';

/*
 * v3.5 순수 턴제 전투/진행 엔진.
 * 플레이어와 적은 각자 한 턴에 공격/방어/힐 중 하나만 수행한다.
 */

let combatTurnNumber = 1;
let playerTurnSpent = false;
let playerGuardState = null;
let enemyGuardState = null;
const BEHAVIOR_ACTIONS = Object.freeze(['physical_attack', 'magic_attack', 'defend', 'dodge', 'heal']);
const ARCHETYPE_ADVANTAGE = Object.freeze({ warrior: 'hunter', hunter: 'mage', mage: 'warrior' });
const DEFECTIVE_DROP_CHANCE = 0.2;
const DEFECTIVE_DROP_FLOOR_MAX = 5;
const DEFECTIVE_DROP_TYPES = Object.freeze(['rusted', 'twisted']);
const DEFECTIVE_EQUIPMENT_KIND_KEYS = Object.freeze(['weapon', 'armor', 'ring']);
const DISTORTION_TURN_START_THRESHOLD = 30;
const PLAYER_PARTY_DEFENSE_BONUS = 0.35;
let initiativeQueue = [];
let currentTurnEntry = null;
let initiativeRound = 1;
let initiativeAdvanceInProgress = false;
let combatVictorySettlementLocked = false;
// [철벽 도발] 탱커 어그로 강제 고정 버프. roundsLeft가 남아 있는 동안
// 적 AI의 공격 타겟 연산(Intent)이 무조건 탱커로 변조된다.
let tankTauntState = null;

window.combatState = window.combatState || {
    turnQueue: [],
    currentTurnIndex: 0,
    isCombatActive: false,
    isActionLocked: false,
};
if (typeof window.combatState.isActionLocked !== 'boolean') window.combatState.isActionLocked = false;

function isMercenaryCaptainJob() { return false; }
function getAffinityRelKey() { return '인간 모험가'; }
function getMercGoldSkipCost() { return Infinity; }
function getMercEffectiveAttackPower() { return 0; }
function getMercBonusAcc() { return 0; }
function getMercEffectiveCritForMercAttack() { return 0; }
function getMercEffectiveCritMultForMercAttack() { return 1; }
function getFieldMercAttackMult() { return 0; }
function buildFieldMercFromTemplate() { return null; }
function getMercGachaCost() { return Infinity; }
function tryMercenaryRandomEvent() { return false; }
function queueEnemyTurnWithPacing() { return advanceInitiativeTurn(); }
function triggerBossWarning() {}
function applySummonDarkTurnStart() { return false; }

function setCombatProcessing(flag) {
    isProcessing = !!flag;
    updateCombatButtonsLockState();
}

function updateCombatButtonsLockState() {
    const host = document.getElementById('action-btns');
    if (!host) return;
    const locked = !!isProcessing || !!(window.combatState && window.combatState.isActionLocked);
    host.querySelectorAll('button').forEach((button) => {
        button.disabled = locked || button.dataset.v35Disabled === '1';
        button.classList.toggle('combat-btn-processing', locked);
    });
}

function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getActorRollBonus(actor) {
    const stats = getActorStats(actor);
    const divinity = safeNum(stats.divinity, safeNum(actor && actor.divinity, 0));
    const divineBonus = divinity >= 5 ? 0.05 : divinity <= -5 ? -0.03 : 0;
    const wisdomLuck = Math.min(0.08, Math.max(0, stats.wis) * 0.0008);
    return divineBonus + wisdomLuck;
}

function probabilityRoll(chance, actorOrRandom, maybeRandom) {
    const actor = typeof actorOrRandom === 'function' ? null : actorOrRandom;
    const random = typeof actorOrRandom === 'function' ? actorOrRandom : maybeRandom;
    const capped = capProbability(chance + (actor ? getActorRollBonus(actor) : 0));
    const rng = typeof random === 'function' ? random : Math.random;
    const roll = rng();
    return { success: roll < capped, chance: capped, roll };
}

function getActorStats(actor) {
    if (actor === player) ensureHumanRuntimeShape(actor);
    const raw = actor && actor.stats || {};
    const stats = normalizeHumanStats(raw);
    // [적 스탯 오버홀] 적 데이터에는 '지혜' 스탯이 존재하지 않는다.
    // 마법 대미지/시전 성공률 등 지혜 기반 수식이 깨지지 않도록 지능 스탯을 대신 연결한다.
    // (아군 파티원은 항상 지혜를 보유하므로 이 분기는 적에게만 적용된다.)
    if (!(raw && raw.wis != null && Number.isFinite(Number(raw.wis)))) stats.wis = stats.int;
    return stats;
}

function getActorDisplayName(actor) {
    if (isPartyMember(actor)) return actor.name;
    if (actor === player) return player.name || '성혼 원정대';
    return actor && actor.name ? actor.name : '대상';
}

const KOREAN_DIGIT_HAS_BATCHIM = Object.freeze({ '0': false, '1': true, '2': false, '3': true, '4': false, '5': false, '6': true, '7': true, '8': true, '9': false });

function hasKoreanBatchim(text) {
    const str = String(text || '').trim();
    if (!str) return false;
    const lastChar = str.charAt(str.length - 1);
    if (lastChar >= '0' && lastChar <= '9') return !!KOREAN_DIGIT_HAS_BATCHIM[lastChar];
    const code = lastChar.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
    return false;
}

function withEulReul(text) { return `${text}${hasKoreanBatchim(text) ? '을' : '를'}`; }
function withIGa(text) { return `${text}${hasKoreanBatchim(text) ? '이' : '가'}`; }

function getActorSideLabel(actor) {
    return (actor === player || isPartyMember(actor)) ? '아군' : '적';
}

function getActorFullLabel(actor) {
    return `${getActorSideLabel(actor)} ${getActorDisplayName(actor)}`;
}

// ===== [MP 시스템 + 직업별 액티브 스킬] =====
const PARTY_ACTIVE_SKILLS = Object.freeze({
    tank: Object.freeze({
        key: 'ironTaunt',
        name: '🛡️ 철벽 도발',
        mpCost: 20,
        targeting: 'self',
        description: '다음 1라운드 동안 적 전원의 공격 타겟을 탱커로 강제 고정',
    }),
    knight: Object.freeze({
        key: 'chainSlash',
        name: '💥 연속 베기',
        mpCost: 25,
        targeting: 'enemy',
        description: '적 1명에게 기본 물리 공격력 1.8배의 강타',
    }),
    mage: Object.freeze({
        key: 'fireball',
        name: '🔥 파이어 볼',
        mpCost: 30,
        targeting: 'enemy',
        description: '적 1명에게 지능 비례 2.2배의 극딜 마법 폭발',
    }),
});

function getPartyActiveSkillFor(actor) {
    if (!actor || !isPartyMember(actor)) return null;
    return PARTY_ACTIVE_SKILLS[actor.roleKey] || null;
}

function getActorMaxMp(actor) {
    return Math.max(0, safeNum(actor && actor.maxMp, 0));
}

function getActorMp(actor) {
    return Math.max(0, Math.min(getActorMaxMp(actor), safeNum(actor && actor.mp, 0)));
}

function setActorMp(actor, value) {
    if (!actor) return;
    actor.mp = Math.max(0, Math.min(getActorMaxMp(actor), safeNum(value, 0)));
}

function spendActorMp(actor, cost) {
    const amount = Math.max(0, safeNum(cost, 0));
    if (getActorMp(actor) < amount) return false;
    setActorMp(actor, getActorMp(actor) - amount);
    return true;
}

function canActorUseActiveSkill(actor) {
    const skill = getPartyActiveSkillFor(actor);
    return !!skill && getActorMp(actor) >= skill.mpCost;
}

// [MP 자연 회복] 지혜/민첩 스탯에 비례한 5~10 MP 리젠
function getActorMpRegenAmount(actor) {
    const stats = getActorStats(actor);
    return Math.max(5, Math.min(10, 5 + Math.floor((Math.max(0, stats.wis) + Math.max(0, stats.agi)) / 30)));
}

function regenPartyMpAtRoundStart() {
    if (!player || !Array.isArray(player.party)) return;
    const rows = [];
    getLivingPartyMembers(player).forEach((member) => {
        if (getActorMaxMp(member) <= 0) return;
        const before = getActorMp(member);
        setActorMp(member, before + getActorMpRegenAmount(member));
        const gained = getActorMp(member) - before;
        if (gained > 0) rows.push(`${member.name} +${gained}`);
    });
    if (rows.length) writeLog(`[마나 회복] ${rows.join(' · ')} MP`);
}

function getActiveTauntTank() {
    if (!tankTauntState || safeNum(tankTauntState.roundsLeft, 0) <= 0) return null;
    const tank = getLivingPartyMembers(player).find((member) => member.id === tankTauntState.tankId) || null;
    if (!tank) tankTauntState = null;
    return tank;
}

function tickTauntStateAtRoundStart() {
    if (!tankTauntState) return;
    tankTauntState.roundsLeft = safeNum(tankTauntState.roundsLeft, 0) - 1;
    if (tankTauntState.roundsLeft <= 0) {
        tankTauntState = null;
        writeLog('[도발 해제] 철벽 도발의 효과가 끝나 적들의 시선이 다시 흩어집니다.');
    }
}

function chooseEnemyPartyTarget(random) {
    const living = getLivingPartyMembers(player);
    if (!living.length) return null;
    // [철벽 도발] 도발 버프가 살아있는 동안 적 AI의 타겟 연산은 무조건 탱커로 고정된다.
    const tauntTank = getActiveTauntTank();
    if (tauntTank) return tauntTank;
    const total = living.reduce((sum, member) => sum + Math.max(0.1, safeNum(member.aggroWeight, 1)), 0);
    const rng = typeof random === 'function' ? random : Math.random;
    let roll = rng() * total;
    for (const member of living) {
        roll -= Math.max(0.1, safeNum(member.aggroWeight, 1));
        if (roll <= 0) return member;
    }
    return living[living.length - 1];
}

function getPartyGuardStateFor(member) {
    if (!playerGuardState || !member) return null;
    if (playerGuardState.members && playerGuardState.members[member.id]) return playerGuardState.members[member.id];
    return playerGuardState.mode ? playerGuardState : null;
}

function getMinimumDamageFor(attacker, defender) {
    return (attacker === enemy || isEnemyPartyMember(attacker)) && isPartyMember(defender) ? 3 : 1;
}

function stripDefectPrefix(name) {
    return String(name || '').replace(/^\[(녹슨|뒤틀린)\]\s*/u, '$1 ');
}

function getEnemyGuardStateFor(member) {
    if (!enemyGuardState || !member) return null;
    if (enemyGuardState.members && enemyGuardState.members[member.id]) return enemyGuardState.members[member.id];
    return enemyGuardState.mode ? enemyGuardState : null;
}

function choosePlayerEnemyTarget() {
    const living = typeof getLivingEnemyPartyMembers === 'function' ? getLivingEnemyPartyMembers(enemy) : (enemy && enemy.curHp > 0 ? [enemy] : []);
    if (!living.length) return null;
    return living[0];
}

const getCombatTargetId = (actor) => String(actor && (actor.id || actor.roleKey || actor.name) || '');

const findCombatTargetById = (candidates, targetId) => {
    const wanted = String(targetId || '');
    if (!wanted) return null;
    return (Array.isArray(candidates) ? candidates : []).find((candidate) =>
        getCombatTargetId(candidate) === wanted ||
        String(candidate && candidate.roleKey || '') === wanted ||
        String(candidate && candidate.name || '') === wanted
    ) || null;
};

const getPlayerAttackTargetCandidates = () => (
    typeof getLivingEnemyPartyMembers === 'function' ? getLivingEnemyPartyMembers(enemy) : []
);

const getPlayerHealTargetCandidates = () => (
    typeof getLivingPartyMembers === 'function' ? getLivingPartyMembers(player) : []
);

const isMageHealerActor = (actor) => !!(
    actor &&
    isPartyMember(actor) &&
    (actor.roleKey === 'mage' || actor.archetype === 'mage' || (Array.isArray(actor.magic) && actor.magic.includes('heal')))
);

const getWoundedPlayerHealTargets = () => getPlayerHealTargetCandidates()
    .filter((member) => getCurrentHp(member) > 0 && getCurrentHp(member) < actorMaxHp(member));

const canPlayerActorUseHealAction = (actor) => isMageHealerActor(actor) && getWoundedPlayerHealTargets().length > 0;

function hasLivingEnemies() {
    return (typeof getLivingEnemyPartyMembers === 'function' ? getLivingEnemyPartyMembers(enemy) : []).length > 0;
}

function getCurrentTurnEntry() {
    return currentTurnEntry;
}

function resetInitiativeTimeline() {
    initiativeQueue = [];
    currentTurnEntry = null;
    initiativeRound = 1;
    initiativeAdvanceInProgress = false;
    playerTurnSpent = false;
    tankTauntState = null;
    window.combatState.turnQueue = [];
    window.combatState.currentTurnIndex = 0;
    window.combatState.isCombatActive = false;
    window.combatState.isResolvingTurn = false;
    window.combatState.awaitingPlayerInput = false;
    window.combatState.isActionLocked = false;
}

function clearPendingVictoryAdvanceState() {
    if (typeof window !== 'undefined') {
        window._victoryState = null;
        window._victoryContinueFn = null;
    }
    if (typeof setEnemyVictoryMode === 'function') setEnemyVictoryMode(false);
    if (typeof updatePrologueBattleControls === 'function') updatePrologueBattleControls();
}

function resetCombatVictorySettlementLock() {
    combatVictorySettlementLocked = false;
}

function resetFreshDungeonEntryVictoryGate() {
    resetCombatVictorySettlementLock();
    if (player) {
        player.runWins = 0;
        player.hasWonBattle = false;
        player.victoryCount = 0;
    }
    clearPendingVictoryAdvanceState();
}

function getActorInitiative(actor) {
    const stats = getActorStats(actor);
    return Math.max(0, safeNum(stats.agi, safeNum(actor && actor.agi, 0)));
}

function isTurnActorAlive(entry) {
    if (!entry || !entry.actor) return false;
    if (entry.side === 'player') return isPartyMember(entry.actor) && getCurrentHp(entry.actor) > 0;
    if (entry.side === 'enemy') return (isEnemyPartyMember(entry.actor) || entry.actor === enemy) && getCurrentHp(entry.actor) > 0;
    return false;
}

function buildInitiativeQueue() {
    const playerEntries = getLivingPartyMembers(player).map((actor, index) => ({
        side: 'player',
        actor,
        initiative: getActorInitiative(actor),
        orderBias: 100 - index,
    }));
    const enemyEntries = getLivingEnemyPartyMembers(enemy).map((actor, index) => ({
        side: 'enemy',
        actor,
        initiative: getActorInitiative(actor),
        orderBias: 50 - index,
    }));
    return [...playerEntries, ...enemyEntries].sort((a, b) => {
        if (b.initiative !== a.initiative) return b.initiative - a.initiative;
        return b.orderBias - a.orderBias;
    });
}

function getTurnOrderPreviewText() {
    const state = window.combatState || {};
    const rows = Array.isArray(state.turnQueue) && state.turnQueue.length
        ? state.turnQueue.slice(state.currentTurnIndex || 0)
        : currentTurnEntry
          ? [currentTurnEntry, ...initiativeQueue]
          : initiativeQueue;
    return rows
        .filter((entry) => entry && entry.actor)
        .slice(0, 6)
        .map((entry) => `${entry.actor.name || '?'}(${entry.initiative})`)
        .join(' → ');
}

function setCombatActionButtonsDisabled(disabled) {
    ['attack-btn', 'btn-attack', 'defense-btn', 'btn-party-defend', 'heal-btn', 'btn-heal', 'skill-btn', 'potion-btn'].forEach((id) => {
        const button = document.getElementById(id);
        if (!button) return;
        if (disabled && button.dataset && button.dataset.v35Disabled === '1') {
            button.disabled = true;
            return;
        }
        button.disabled = !!disabled;
        button.classList.toggle('combat-btn-processing', !!disabled);
    });
}

const TURN_TRANSITION_LOCK_MS = 900;

function setCombatActionLock(locked) {
    if (window.combatState) window.combatState.isActionLocked = !!locked;
    setCombatActionButtonsDisabled(!!locked);
    updateCombatButtonsLockState();
}

// 행동/턴 전환마다 강제 딜레이를 걸어 VFX 재생 시간을 확보하고 버튼 연타를 원천 차단한다.
async function lockedAdvanceToNextTurn(options) {
    setCombatActionLock(true);
    await waitMs(TURN_TRANSITION_LOCK_MS);
    if (window.combatState) window.combatState.isActionLocked = false;
    await advanceNextTurn(options);
}

function rebindCombatActionButtonsForActiveTurn() {
    const bindings = [
        ['attack-btn', '공격'],
        ['btn-attack', '공격'],
        ['defense-btn', '방패방어'],
        ['btn-party-defend', '방패방어'],
        ['heal-btn', '힐'],
        ['btn-heal', '힐'],
        ['skill-btn', '스킬'],
    ];
    bindings.forEach(([id, actionType]) => {
        const button = document.getElementById(id);
        if (!button) return;
        button.onclick = (event) => {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            }
            if (button.disabled || (button.dataset && button.dataset.v35Disabled === '1')) return;
            window.useAction(
                actionType,
                typeof getV35ActionOptionsFromButtonElement === 'function'
                    ? getV35ActionOptionsFromButtonElement(button)
                    : null
            );
        };
    });
}

function getEquippedWeapon(actor) {
    const key = actor && actor.equipment && actor.equipment.weapon;
    if (key && weaponTable[key]) return weaponTable[key];
    const items = getActorEquipmentItems(actor);
    const weaponItem = items.find((item) => item && item.type === 'atk');
    if (!weaponItem) return null;
    const text = `${weaponItem.name || ''} ${(weaponItem.tags || []).join(' ')}`;
    let profile = weaponTable.sword;
    if (/망치|hammer/i.test(text)) profile = weaponTable.hammer;
    else if (/활|총|석궁|ranged|bow|gun/i.test(text)) profile = weaponTable.ranged;
    else if (/지팡이|staff|마법|마력|보주|주문/i.test(text)) profile = weaponTable.staff;
    else if (/낫|scythe/i.test(text)) profile = weaponTable.greatScythe;
    return { ...profile, item: weaponItem, value: safeNum(weaponItem.value, safeNum(profile.value, 0)) };
}

function getEquippedArmor(actor) {
    const key = actor && actor.equipment && actor.equipment.armor;
    if (key && armorTable[key]) return armorTable[key];
    const items = getActorEquipmentItems(actor);
    const armorItem = items.find((item) => item && (item.type === 'hp' || safeNum(item.def, 0) > 0 || safeNum(item.damageReduction, 0) > 0));
    if (!armorItem) return null;
    const text = `${armorItem.name || ''} ${(armorItem.tags || []).join(' ')}`;
    const profile = /방패|shield/i.test(text) ? armorTable.shield : armorTable.armor;
    return {
        ...profile,
        item: armorItem,
        def: safeNum(armorItem.def, safeNum(profile.def, 0)),
        mitigation: safeNum(armorItem.damageReduction, safeNum(profile.mitigation, 0)),
        nullifyChance: safeNum(armorItem.nullifyChance, safeNum(profile.nullifyChance, 0)),
    };
}

function getActorEquipmentItems(actor) {
    return Array.isArray(actor && actor.items) ? actor.items.filter(Boolean) : [];
}

function getActorCombatArchetype(actor) {
    const items = getActorEquipmentItems(actor);
    const weapon = getEquippedWeapon(actor);
    const text = items.map((item) => `${item.name || ''} ${(item.tags || []).join(' ')}`).join(' ');
    if (
        (actor && Array.isArray(actor.magic) && actor.magic.length) ||
        (weapon && weapon.magicFocus) ||
        /지팡이|마법|마력|마도|룬|보주|주문|arcane/i.test(text)
    ) return 'mage';
    if (/활|화살|석궁|총|단검|사냥|정찰|precision|wind/i.test(text)) return 'hunter';
    return 'warrior';
}

function getAffinityState(attackerArchetype, defenderArchetype) {
    if (!attackerArchetype || !defenderArchetype || attackerArchetype === defenderArchetype) return 'neutral';
    if (ARCHETYPE_ADVANTAGE[attackerArchetype] === defenderArchetype) return 'advantage';
    if (ARCHETYPE_ADVANTAGE[defenderArchetype] === attackerArchetype) return 'disadvantage';
    return 'neutral';
}

function getHpBucket(actor) {
    const ratio = actorMaxHp(actor) > 0 ? getCurrentHp(actor) / actorMaxHp(actor) : 0;
    if (ratio <= 0.25) return '0-25';
    if (ratio <= 0.5) return '26-50';
    if (ratio <= 0.75) return '51-75';
    return '76-100';
}

function isBehaviorLearningZone(progress) {
    const current = normalizeDungeonProgress(progress);
    return current.floor >= 6 && current.floor <= 10;
}

function hasMagicAttackCapability(actor) {
    if (actor && Array.isArray(actor.magic) && actor.magic.length > 0) return true;
    if (getEquippedWeapon(actor) && getEquippedWeapon(actor).magicFocus) return true;
    return getActorCombatArchetype(actor) === 'mage';
}

function classifyPlayerAttackAction(actor) {
    return hasMagicAttackCapability(actor) ? 'magic_attack' : 'physical_attack';
}

function recordPlayerBehavior(action) {
    if (!player || !enemy || !BEHAVIOR_ACTIONS.includes(action)) return;
    const progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
    if (!isBehaviorLearningZone(progress)) return;
    player.behaviorLogger = Array.isArray(player.behaviorLogger) ? player.behaviorLogger : [];
    const hpRatio = actorMaxHp(player) > 0 ? getCurrentHp(player) / actorMaxHp(player) : 0;
    const playerArchetype = getActorCombatArchetype(player);
    const sampleEnemy = choosePlayerEnemyTarget() || enemy;
    const enemyArchetype = sampleEnemy.archetype || getActorCombatArchetype(sampleEnemy);
    player.behaviorLogger.push({
        floor: progress.floor,
        stage: progress.stage,
        turn: combatTurnNumber,
        hpRatio,
        hpBucket: getHpBucket(player),
        enemyArchetype,
        enemyElement: sampleEnemy.element || 'neutral',
        enemyTraits: Array.isArray(sampleEnemy.traitTags) ? sampleEnemy.traitTags.slice() : [],
        affinity: getAffinityState(playerArchetype, enemyArchetype),
        playerArchetype,
        action,
    });
}

function createActionCounter() {
    return Object.fromEntries(BEHAVIOR_ACTIONS.map((action) => [action, 0]));
}

function addBehaviorCount(target, action) {
    if (!target.counts) target.counts = createActionCounter();
    target.counts[action] = (target.counts[action] || 0) + 1;
    target.total = (target.total || 0) + 1;
}

function finalizeBehaviorNode(node) {
    const counts = node.counts || createActionCounter();
    const total = Math.max(0, Number(node.total) || 0);
    node.probabilities = Object.fromEntries(
        BEHAVIOR_ACTIONS.map((action) => [action, total > 0 ? (counts[action] || 0) / total : 0])
    );
    return node;
}

function buildBehaviorProbabilityMatrix(logRows) {
    const rows = Array.isArray(logRows) ? logRows.filter((row) => row && BEHAVIOR_ACTIONS.includes(row.action)) : [];
    const matrix = {};
    const hpTotals = {};
    const global = { counts: createActionCounter(), total: 0 };
    for (const row of rows) {
        const hpBucket = row.hpBucket || '76-100';
        const enemyArchetype = row.enemyArchetype || 'unknown';
        const affinity = row.affinity || 'neutral';
        matrix[hpBucket] = matrix[hpBucket] || {};
        matrix[hpBucket][enemyArchetype] = matrix[hpBucket][enemyArchetype] || {};
        matrix[hpBucket][enemyArchetype][affinity] =
            matrix[hpBucket][enemyArchetype][affinity] || { counts: createActionCounter(), total: 0 };
        hpTotals[hpBucket] = hpTotals[hpBucket] || { counts: createActionCounter(), total: 0 };
        addBehaviorCount(matrix[hpBucket][enemyArchetype][affinity], row.action);
        addBehaviorCount(hpTotals[hpBucket], row.action);
        addBehaviorCount(global, row.action);
    }
    Object.values(matrix).forEach((byArchetype) =>
        Object.values(byArchetype).forEach((byAffinity) =>
            Object.values(byAffinity).forEach(finalizeBehaviorNode)
        )
    );
    Object.values(hpTotals).forEach(finalizeBehaviorNode);
    finalizeBehaviorNode(global);
    return { version: 1, actions: BEHAVIOR_ACTIONS.slice(), matrix, hpTotals, global, sampleCount: rows.length };
}

function weightedActionRoll(probabilities, allowedActions, random) {
    const allowed = new Set(allowedActions || []);
    const entries = BEHAVIOR_ACTIONS
        .filter((action) => allowed.has(action))
        .map((action) => [action, Math.max(0, Number(probabilities && probabilities[action]) || 0)])
        .filter(([, weight]) => weight > 0);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    if (total <= 0) return null;
    const rng = typeof random === 'function' ? random : Math.random;
    let roll = rng() * total;
    for (const [action, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return action;
    }
    return entries[entries.length - 1][0];
}

function getAllowedEnemyActions(actor) {
    const actions = ['physical_attack', 'defend', 'dodge'];
    if (hasMagicAttackCapability(actor)) actions.push('magic_attack');
    if (actorCanHeal(actor)) actions.push('heal');
    return actions;
}

function chooseLearnedGhostAction(actor) {
    const behavior = actor && actor.behaviorMatrix;
    if (!actor || !actor.isPlayerGhost || !behavior) return null;
    const hpBucket = getHpBucket(actor);
    const targetArchetype = getActorCombatArchetype(player);
    const ghostArchetype = getActorCombatArchetype(actor);
    const affinity = getAffinityState(ghostArchetype, targetArchetype);
    const exact = behavior.matrix && behavior.matrix[hpBucket] &&
        behavior.matrix[hpBucket][targetArchetype] &&
        behavior.matrix[hpBucket][targetArchetype][affinity];
    const hpFallback = behavior.hpTotals && behavior.hpTotals[hpBucket];
    const source = exact && exact.total > 0 ? exact : hpFallback && hpFallback.total > 0 ? hpFallback : behavior.global;
    return source && source.total > 0
        ? weightedActionRoll(source.probabilities, getAllowedEnemyActions(actor))
        : null;
}

function calculateAttackChance(attacker, defender) {
    const attackStats = getActorStats(attacker);
    const defendStats = getActorStats(defender);
    const mastery = safeNum(attacker && attacker.mastery && attacker.mastery.weapon, 0);
    const chance = 0.68 + attackStats.agi * 0.004 + attackStats.int * 0.001 + mastery * 0.002 - defendStats.agi * 0.0006;
    return Math.max(0.5, chance);
}

function getActorWeaponDisplayName(actor) {
    const weapon = getEquippedWeapon(actor);
    if (weapon && weapon.name) return weapon.name;
    if (actor && actor.roleKey === 'mage') return '지팡이';
    if (actor && actor.roleKey === 'knight') return '검';
    return '무기';
}

function getWeaponEfficiencyPowerBonus(actor, weapon, stats) {
    const key = weapon && weapon.key
        ? weapon.key
        : actor && actor.roleKey === 'mage'
          ? 'staff'
          : actor && actor.roleKey === 'tank'
            ? 'hammer'
            : 'sword';
    if (key === 'hammer') return Math.floor(stats.str * 0.22 + stats.def * 0.18);
    if (key === 'ranged') return Math.floor(stats.agi * 0.3 + stats.int * 0.08);
    if (key === 'staff') return Math.floor(stats.wis * 0.34 + stats.int * 0.22);
    if (key === 'greatScythe') return Math.floor(stats.str * 0.2 + safeNum(stats.distortion, 0) * 0.12);
    return Math.floor(stats.str * 0.18 + stats.agi * 0.08);
}

const EARLY_FLOOR_DAMAGE_BUFF_MULT = 1.45;
const EARLY_FLOOR_DAMAGE_BUFF_MAX_FLOOR = 5;

function getEarlyFloorDamageMultiplier() {
    return safeNum(floor, 1) <= EARLY_FLOOR_DAMAGE_BUFF_MAX_FLOOR ? EARLY_FLOOR_DAMAGE_BUFF_MULT : 1;
}

function calculatePhysicalDamage(attacker, defender) {
    const attackStats = getActorStats(attacker);
    const defendStats = getActorStats(defender);
    const weapon = getEquippedWeapon(attacker);
    const armor = getEquippedArmor(defender);
    let rawPower = safeNum(attacker && attacker.atk, attackStats.str) + Math.floor(attackStats.str * 0.25);
    rawPower += getWeaponEfficiencyPowerBonus(attacker, weapon, attackStats);
    const attackerRatio = actorMaxHp(attacker) > 0 ? getCurrentHp(attacker) / actorMaxHp(attacker) : 1;
    const defenderRatio = actorMaxHp(defender) > 0 ? getCurrentHp(defender) / actorMaxHp(defender) : 1;
    if (attacker && attacker.archetype === 'warrior' && attackerRatio <= 0.45) rawPower *= attackerRatio <= 0.25 ? 1.55 : 1.3;
    if (attacker && attacker.archetype === 'hunter' && defenderRatio <= 0.4) rawPower *= 1.45;
    if (attacker && attacker._attackMultiplier) rawPower *= attacker._attackMultiplier;
    const runtimeDefense = safeNum(defender && defender.def, defendStats.def) + safeNum(defender && defender.extraDef, 0);
    const totalDefense = Math.max(0, runtimeDefense + (armor ? safeNum(armor.def, 0) : 0));
    const ratioReduced = rawPower * (100 / (100 + totalDefense));
    const mitigation = Math.min(
        0.6,
        Math.max(0, safeNum(armor && armor.mitigation, 0) + safeNum(defender && defender.damageReduction, 0))
    );
    const reduced = Math.floor(ratioReduced * (1 - mitigation) * getEarlyFloorDamageMultiplier());
    return Math.max(getMinimumDamageFor(attacker, defender), reduced);
}

function calculateMagicDamage(attacker, defender) {
    const attackStats = getActorStats(attacker);
    const defendStats = getActorStats(defender);
    const mastery = safeNum(attacker && attacker.mastery && (attacker.mastery.magic || attacker.mastery.holyMagic), 0);
    const rawPower = attackStats.wis * 1.45 + attackStats.int * 0.45 + mastery * 0.25;
    const reduced = Math.floor(rawPower * (100 / (100 + Math.max(0, defendStats.def * 0.7))) * getEarlyFloorDamageMultiplier());
    return Math.max(getMinimumDamageFor(attacker, defender), reduced);
}

function getCurrentHp(actor) {
    return actor === player ? safeNum(actor.curHp, 0) : safeNum(actor.curHp, 0);
}

function setCurrentHp(actor, value) {
    const max = actor === player
        ? getEffectiveMaxHp()
        : Math.max(1, safeNum(actor.maxHp, safeNum(actor.hp, 1)));
    actor.curHp = Math.max(0, Math.min(max, safeNum(value, 0)));
    if (isPartyMember(actor)) syncPartyAggregateState(player);
}

function actorMaxHp(actor) {
    return actor === player
        ? getEffectiveMaxHp()
        : Math.max(1, safeNum(actor.maxHp, safeNum(actor.hp, 1)));
}

function actorCanHeal(actor) {
    const stats = getActorStats(actor);
    return stats.wis > 0 && getCurrentHp(actor) < actorMaxHp(actor);
}

function getActorAttackSpeed(actor) {
    const stats = getActorStats(actor);
    const weapon = getEquippedWeapon(actor);
    return Math.max(0, stats.agi + safeNum(weapon && weapon.speed, 45));
}

function getActorAttackStrikeCount(actor) {
    const speed = getActorAttackSpeed(actor);
    if (speed >= 125) return 3;
    if (speed >= 90) return 2;
    return 1;
}

function getActorPostAttackCooldownTurns(actor) {
    const weapon = getEquippedWeapon(actor);
    if (weapon && safeNum(weapon.cooldownTurns, 0) > 0) return Math.max(1, Math.floor(safeNum(weapon.cooldownTurns, 0)));
    return getActorAttackSpeed(actor) < 55 ? 1 : 0;
}

function canActorAttackThisTurn(actor) {
    return !!actor && safeNum(actor.attackLockTurns, 0) <= 0 && !actor._attackLockedForThisTurn && !actor.weaponDisabledThisTurn;
}

function gainActorWeaponMastery(actor, amount) {
    if (!actor) return;
    actor.mastery = actor.mastery && typeof actor.mastery === 'object' ? actor.mastery : {};
    const stats = getActorStats(actor);
    const gain = safeNum(amount, 1) * (1 + Math.max(0, stats.int) / 100);
    actor.mastery.weapon = Math.max(0, safeNum(actor.mastery.weapon, 0) + gain);
}

function gainActorMagicMastery(actor, amount) {
    if (!actor) return;
    actor.mastery = actor.mastery && typeof actor.mastery === 'object' ? actor.mastery : {};
    const stats = getActorStats(actor);
    const gain = safeNum(amount, 1) * (1 + Math.max(0, stats.int) / 120);
    actor.mastery.magic = Math.max(0, safeNum(actor.mastery.magic, 0) + gain);
}

function resolveAttackAction(attacker, defender, guardState) {
    const hit = probabilityRoll(calculateAttackChance(attacker, defender), attacker);
    const weaponName = getActorWeaponDisplayName(attacker);
    if (!hit.success) return { type: 'attack', success: false, reason: 'miss', hit, weaponName };

    if (guardState && guardState.mode === 'dodge') {
        const dodgeStats = getActorStats(defender);
        const dodge = probabilityRoll(0.18 + dodgeStats.agi * 0.005, defender);
        if (dodge.success) return { type: 'attack', success: false, reason: 'dodged', hit, dodge, weaponName };
        if (dodgeStats.agi < 35) {
            defender.statuses = Array.isArray(defender.statuses) ? defender.statuses : [];
            defender.statuses.push({ key: 'ankleSprain', turns: 2, agilityPenalty: 20 });
        }
    }

    const armor = getEquippedArmor(defender);
    if (armor && !((attacker === enemy || isEnemyPartyMember(attacker)) && isPartyMember(defender))) {
        const nullify = probabilityRoll(safeNum(armor.nullifyChance, 0), defender);
        if (nullify.success) return { type: 'attack', success: true, damage: 0, nullified: true, hit, nullify, weaponName };
    }

    let damage = calculatePhysicalDamage(attacker, defender);
    if (guardState && guardState.mode === 'shield') {
        const defendStats = getActorStats(defender);
        const partyBonus = guardState.partyWide ? PLAYER_PARTY_DEFENSE_BONUS : 0;
        const block = probabilityRoll(0.22 + defendStats.def * 0.004 + partyBonus * 0.25, defender);
        if (block.success) {
            damage = Math.max(getMinimumDamageFor(attacker, defender), Math.floor(damage * (0.45 - partyBonus * 0.25)));
            setCurrentHp(defender, getCurrentHp(defender) - damage);
            return { type: 'attack', success: true, damage, guarded: true, hit, block, weaponName };
        }
        damage = guardState.partyWide
            ? Math.max(getMinimumDamageFor(attacker, defender), Math.floor(damage * (1 - partyBonus)))
            : Math.floor(damage * 1.65);
    }

    setCurrentHp(defender, getCurrentHp(defender) - damage);
    return { type: 'attack', success: true, damage, hit, weaponName };
}

function resolveMagicAttackAction(attacker, defender, guardState) {
    const cast = probabilityRoll(0.4 + getActorStats(attacker).wis * 0.004, attacker);
    if (!cast.success) return { type: 'attack', attackKind: 'magic', success: false, reason: 'miss', hit: cast };
    let damage = calculateMagicDamage(attacker, defender);
    if (guardState && guardState.mode === 'dodge') {
        const dodge = probabilityRoll(0.12 + getActorStats(defender).agi * 0.004, defender);
        if (dodge.success) return { type: 'attack', attackKind: 'magic', success: false, reason: 'dodged', hit: cast, dodge };
    }
    if (guardState && guardState.mode === 'shield') {
        damage = Math.max(getMinimumDamageFor(attacker, defender), Math.floor(damage * (guardState.partyWide ? 0.48 : 0.7)));
        setCurrentHp(defender, getCurrentHp(defender) - damage);
        return { type: 'attack', attackKind: 'magic', success: true, damage, guarded: true, hit: cast };
    }
    setCurrentHp(defender, getCurrentHp(defender) - damage);
    return { type: 'attack', attackKind: 'magic', success: true, damage, hit: cast };
}

// [파이어 볼] 지능 스탯 비례 2.2배 극딜 마법. 일반 마법 공격(지혜 주 계수)과 달리 지능이 주 계수다.
function resolveFireballSkillAction(attacker, defender, guardState) {
    const stats = getActorStats(attacker);
    const cast = probabilityRoll(0.55 + stats.wis * 0.004, attacker);
    if (!cast.success) return { type: 'attack', attackKind: 'magic', success: false, reason: 'miss', hit: cast, skillKey: 'fireball' };
    const defendStats = getActorStats(defender);
    if (guardState && guardState.mode === 'dodge') {
        const dodge = probabilityRoll(0.1 + defendStats.agi * 0.003, defender);
        if (dodge.success) return { type: 'attack', attackKind: 'magic', success: false, reason: 'dodged', hit: cast, dodge, skillKey: 'fireball' };
    }
    const mastery = safeNum(attacker && attacker.mastery && attacker.mastery.magic, 0);
    const rawPower = stats.int * 2.2 + stats.wis * 0.8 + mastery * 0.25;
    let damage = Math.floor(rawPower * (100 / (100 + Math.max(0, defendStats.def * 0.7))) * getEarlyFloorDamageMultiplier());
    if (guardState && guardState.mode === 'shield') damage = Math.floor(damage * 0.7);
    damage = Math.max(getMinimumDamageFor(attacker, defender), damage);
    setCurrentHp(defender, getCurrentHp(defender) - damage);
    return { type: 'attack', attackKind: 'magic', success: true, damage, hit: cast, skillKey: 'fireball' };
}

function resolveHealAction(actor, healTarget) {
    const stats = getActorStats(actor);
    const cast = probabilityRoll(0.4 + stats.wis * 0.004, actor);
    if (!cast.success) return { type: 'heal', success: false, reason: 'castFailed', cast };
    const divineHealBonus = safeNum(stats.divinity, safeNum(actor && actor.divinity, 0)) >= 5 ? 1.05 : 1;
    const amount = Math.max(1, Math.floor((8 + stats.wis * 1.6) * divineHealBonus));
    const target = healTarget || actor;
    const before = getCurrentHp(target);
    setCurrentHp(target, before + amount);
    return { type: 'heal', success: true, healed: getCurrentHp(target) - before, cast };
}

function maybeTriggerCorruptedHeal(actor, target) {
    if (!actor || !target || safeNum(floor, 1) < 6) return;
    const stats = getActorStats(actor);
    const distortion = safeNum(target.stats && target.stats.distortion, safeNum(target.distortion, 0));
    if (!probabilityRoll(0.08 + distortion * 0.002, actor).success) return;
    target.twistedBody = Math.max(0, safeNum(target.twistedBody, 0)) + 1;
    target.stats = normalizeHumanStats(target.stats || {});
    target.stats.distortion = Math.min(100, target.stats.distortion + 1);
    target.distortion = target.stats.distortion;
    writeLog(`[오염된 힐] ${target.name}의 뒤틀린 신체 반응이 증가했습니다. (지혜 ${stats.wis})`);
}

function tryResolveSecondSelfTurn(actor) {
    if (!actor || safeNum(actor.stats && actor.stats.distortion, actor.distortion) < DISTORTION_TURN_START_THRESHOLD) return false;
    const chance = 0.18 + Math.min(0.57, (safeNum(actor.stats.distortion, actor.distortion) - DISTORTION_TURN_START_THRESHOLD) * 0.01);
    if (!probabilityRoll(chance, actor).success) return false;
    const actions = ['allyAttack', 'selfHarm', 'weaponDisabled', 'masteryLoss'];
    const pick = actions[Math.floor(Math.random() * actions.length)] || 'selfHarm';
    if (pick === 'allyAttack') {
        const allies = getLivingPartyMembers(player).filter((member) => member !== actor);
        const target = allies[Math.floor(Math.random() * allies.length)] || null;
        if (target) {
            const result = resolveAttackAction(actor, target, null);
            writeLog(`[제2의 자아] ${actor.name}가 ${target.name}를 공격했습니다.`);
            describeCombatResult(actor, target, result);
            emitCombatResultVfx(target, result);
        } else {
            const damage = Math.max(3, Math.floor(actorMaxHp(actor) * 0.08));
            setCurrentHp(actor, getCurrentHp(actor) - damage);
            writeLog(`[제2의 자아] ${actor.name}가 자기 몸을 찢어 ${damage} 피해를 입었습니다.`);
        }
    } else if (pick === 'selfHarm') {
        const damage = Math.max(3, Math.floor(actorMaxHp(actor) * 0.1));
        setCurrentHp(actor, getCurrentHp(actor) - damage);
        writeLog(`[제2의 자아] ${actor.name}가 자해하여 ${damage} 피해를 입었습니다.`);
    } else if (pick === 'weaponDisabled') {
        actor.weaponDisabledThisTurn = true;
        actor.attackLockTurns = Math.max(1, safeNum(actor.attackLockTurns, 0));
        writeLog(`[제2의 자아] ${actor.name}의 무기 사용이 이번 턴 봉쇄되었습니다.`);
    } else {
        actor.mastery = actor.mastery && typeof actor.mastery === 'object' ? actor.mastery : {};
        actor.mastery.weapon = Math.max(0, safeNum(actor.mastery.weapon, 0) - 1);
        writeLog(`[제2의 자아] ${actor.name}의 무기 숙련도가 하락했습니다.`);
    }
    syncPartyAggregateState(player);
    return true;
}

function spendPlayerAction() {
    if (playerTurnSpent) return false;
    playerTurnSpent = true;
    return true;
}

function describeCombatResult(actor, target, result) {
    if (!result) return;
    const actorName = getActorFullLabel(actor);
    const targetName = getActorFullLabel(target);
    if (result.type === 'attack') {
        const dmgType = result.attackKind === 'magic' ? '마법' : '물리';
        if (result.reason === 'miss') writeLog(`[전투] ${withIGa(actorName)} ${targetName} 공격에 실패했습니다.`);
        else if (result.reason === 'dodged') writeLog(`[전투] ${withIGa(targetName)} ${actorName}의 공격을 완전히 회피했습니다.`);
        else if (result.nullified) writeLog(`[전투] ${targetName}의 장비가 ${actorName}의 공격을 완전히 차단했습니다.`);
        else writeLog(`[전투] ${withIGa(actorName)} ${withEulReul(targetName)} 공격하여 ${result.damage}의 ${dmgType} 피해를 입혔습니다.${result.guarded ? ' (방어 성공)' : ''}`);
        return;
    }
    if (result.type === 'heal') {
        writeLog(result.success
            ? `[전투] ${actorName}가 ${targetName}에게 힐을 사용해 HP ${result.healed} 회복`
            : `[전투] ${actorName}의 힐이 실패했습니다.`);
    }
}

function isDefectiveDropEligible() {
    const progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
    return progress.floor >= 1 &&
        progress.floor <= DEFECTIVE_DROP_FLOOR_MAX &&
        progress.stage < STAGES_PER_FLOOR &&
        enemy &&
        !enemy.isBoss &&
        !enemy.isPlayerGhost;
}

function getOpenDefectiveDropKinds() {
    return DEFECTIVE_EQUIPMENT_KIND_KEYS.filter((kind) => {
        if (typeof getEquippedCountByKind !== 'function' || typeof getEquipSlotLimit !== 'function') return true;
        return getEquippedCountByKind(kind) < getEquipSlotLimit(kind);
    });
}

function pickBaseEquipmentForDefectiveDrop(kind) {
    const pool = (typeof equipmentPool !== 'undefined' && Array.isArray(equipmentPool)) ? equipmentPool : [];
    const typeByKind = { weapon: 'atk', armor: 'hp', ring: 'ring' };
    const targetType = typeByKind[kind];
    const candidates = pool.filter((item) => {
        if (!item || item.type !== targetType) return false;
        if (item.type === 'rune' || item.type === 'relic' || item.type === 'potion' || item.type === 'merc') return false;
        return true;
    });
    if (!candidates.length) return null;
    const byRarity = candidates.filter((item) => ['common', 'rare'].includes(String(item.rarity || 'common').toLowerCase()));
    const usable = byRarity.length ? byRarity : candidates;
    return usable[Math.floor(Math.random() * usable.length)] || null;
}

function scaleDefectiveItemPower(item, multiplier) {
    const statFields = ['value', 'hpBonus', 'def', 'critBonus', 'critMult', 'lifesteal', 'damageReduction', 'potionHealBonus'];
    statFields.forEach((field) => {
        const value = Number(item[field]);
        if (!Number.isFinite(value) || value <= 0) return;
        item[field] = field === 'critMult' || field === 'lifesteal' || field === 'damageReduction' || field === 'potionHealBonus'
            ? Number((value * multiplier).toFixed(4))
            : Math.max(1, Math.round(value * multiplier));
    });
    return item;
}

function createDefectiveDropItem(kind) {
    const base = pickBaseEquipmentForDefectiveDrop(kind);
    if (!base) return null;
    const item = JSON.parse(JSON.stringify(base));
    const defectType = DEFECTIVE_DROP_TYPES[Math.floor(Math.random() * DEFECTIVE_DROP_TYPES.length)] || 'rusted';
    const label = defectType === 'twisted' ? '뒤틀린' : '녹슨';
    item.name = `[${label}] ${String(item.name || '장비').replace(/^\[(녹슨|뒤틀린)\]\s*/u, '')}`;
    item.defectType = defectType;
    item.defectLabel = label;
    item.fieldDrop = true;
    item.cursedLock = defectType === 'twisted';
    item.tags = Array.isArray(item.tags) ? Array.from(new Set([...item.tags, 'field_drop', `defect_${defectType}`])) : ['field_drop', `defect_${defectType}`];
    item._uid = `drop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    item._buyPrice = Math.max(1, Math.floor(safeNum(item.price, 10) * 0.35));
    if (defectType === 'twisted') {
        scaleDefectiveItemPower(item, 1.45);
    }
    if (typeof rebuildEquipmentDesc === 'function') rebuildEquipmentDesc(item);
    const penaltyDesc = defectType === 'twisted'
        ? '하자: 매 턴 종료 시 장착자의 뒤틀림 +1. 던전 안에서는 해제 불가.'
        : '하자: 매 턴 종료 시 장착자가 중금속 중독 출혈 피해를 받음.';
    item.desc = `${item.desc || ''}${item.desc ? ' ' : ''}${penaltyDesc}`;
    return item;
}

function tryAwardDefectiveEquipmentDrop() {
    if (!player || !isDefectiveDropEligible()) return null;
    if (Math.random() >= DEFECTIVE_DROP_CHANCE) return null;
    const openKinds = getOpenDefectiveDropKinds();
    if (!openKinds.length) {
        writeLog('[드롭] 장비가 떨어졌지만 파티 인벤토리 슬롯이 가득 차 회수하지 못했습니다.');
        return null;
    }
    const kind = openKinds[Math.floor(Math.random() * openKinds.length)] || 'weapon';
    const item = createDefectiveDropItem(kind);
    if (!item) return null;
    player.items = Array.isArray(player.items) ? player.items : [];
    player.items.push(item);
    if (typeof saveCollection === 'function') saveCollection(item.name);
    if (typeof fullResyncPlayerCombatStatsFromMetaAndInventory === 'function') {
        fullResyncPlayerCombatStatsFromMetaAndInventory();
    }
    const penalty = item.defectType === 'twisted' ? '뒤틀림 잠식' : '중금속 중독';
    writeLog(`[드롭] <b>${stripDefectPrefix(item.name)}</b> 획득 — 하자 장비(${penalty})가 파티 인벤토리에 들어왔습니다.`);
    return item;
}

function applyDefectiveEquipmentTurnEndEffects() {
    if (!player || !Array.isArray(player.party)) return false;
    let changed = false;
    getLivingPartyMembers(player).forEach((member) => {
        const equipped = Array.isArray(member.items) ? member.items : [];
        equipped.forEach((item) => {
            if (!item || !item.defectType) return;
            if (item.defectType === 'rusted') {
                const damage = Math.max(Math.max(1, Math.floor(safeNum(floor, 1))), Math.ceil(member.maxHp * 0.025));
                setCurrentHp(member, member.curHp - damage);
                writeLog(`[출혈] ${member.name}가 ${stripDefectPrefix(item.name)}의 중금속 중독으로 인해 ${damage}의 피해를 입었습니다.`);
                changed = true;
                return;
            }
            if (item.defectType === 'twisted') {
                member.stats = normalizeHumanStats(member.stats || {});
                member.stats.distortion = Math.min(100, safeNum(member.stats.distortion, 0) + 1);
                member.distortion = member.stats.distortion;
                writeLog(`[잠식] ${member.name}가 ${stripDefectPrefix(item.name)}의 저주로 인해 뒤틀림 수치가 1 상승했습니다.`);
                changed = true;
            }
        });
    });
    if (changed) {
        syncPartyAggregateState(player);
        syncPlayerCampaignState();
        if (getLivingPartyMembers(player).length === 0) {
            gameOver();
            return true;
        }
    }
    return changed;
}

function emitCombatResultVfx(target, result) {
    if (!result) return;
    const isPlayerSide = target === player || isPartyMember(target);
    const targetSide = isPlayerSide ? 'player' : 'enemy';
    // [유닛 타격 연동] 대상의 개별 카드(행)가 렌더링되어 있으면 파티 전체가 아닌
    // '정확한 피격 대상 카드'에만 데미지 플로트/셰이크를 재생한다.
    const hasUnitRow = typeof getCombatUnitRowElement === 'function' && !!getCombatUnitRowElement(target);
    if (result.reason === 'miss' || result.reason === 'dodged') {
        if (hasUnitRow && typeof showUnitMissFloat === 'function') showUnitMissFloat(target);
        else showMissFloat(targetSide);
        if (result.reason === 'dodged') {
            if (hasUnitRow && typeof pulseCombatUnitClass === 'function') pulseCombatUnitClass(target, 'premium-card-dodge', 240);
            else triggerDodgeMove(targetSide);
        }
        return;
    }
    if (result.type === 'attack') {
        if (result.nullified || result.guarded) {
            if (result.attackKind === 'magic' && typeof playMagicBarrierVfx === 'function') playMagicBarrierVfx(targetSide);
            else if (typeof playPhysicalShieldVfx === 'function') playPhysicalShieldVfx(targetSide);
        }
        if (hasUnitRow && typeof showUnitDmgFloat === 'function') showUnitDmgFloat(target, Math.max(0, result.damage || 0), false);
        else showDmgFloat(Math.max(0, result.damage || 0), false, isPlayerSide);
        if ((result.damage || 0) > 0) {
            if (hasUnitRow && typeof triggerUnitHitShake === 'function') triggerUnitHitShake(target, false);
            else triggerShakeEffect(targetSide);
        }
    }
}

async function previewEnemyTargetIntent(unit, target) {
    if (!unit || !target) return;
    window._enemyThinkingHint = `${unit.name || '적'} → ${target.name || '대상'} 조준`;
    if (typeof updateUi === 'function') updateUi();
    if (typeof renderEnemyIntentLaser === 'function') renderEnemyIntentLaser('enemy', 'player', 560);
    await waitMs(260);
    window._enemyThinkingHint = '';
    if (typeof updateUi === 'function') updateUi();
}

function chooseEnemyAction(actor) {
    const unit = actor || enemy;
    const learned = chooseLearnedGhostAction(unit);
    if (learned) return learned;
    const hpRatio = getCurrentHp(unit) / actorMaxHp(unit);
    if (enemy && enemy.isBoss) {
        unit.turnCount = Math.max(1, safeNum(unit.turnCount, 1));
        if (unit._bossChargeReady) return 'physical_attack';
        if (unit.turnCount % 4 === 3) return 'charge';
    }
    if (unit.archetype === 'knight' && getCurrentHp(player) / actorMaxHp(player) <= 0.4) return 'physical_attack';
    if (unit.archetype === 'mage' && hpRatio <= 0.38 && probabilityRoll(0.65).success) return 'defend';
    if (hpRatio <= 0.3 && actorCanHeal(unit)) return 'heal';
    if (hpRatio <= 0.55 && probabilityRoll(0.25).success) return getActorStats(unit).agi >= 45 ? 'dodge' : 'defend';
    return hasMagicAttackCapability(unit) && probabilityRoll(0.25).success ? 'magic_attack' : 'physical_attack';
}

async function enemyTurn() {
    if (!window.combatState || !window.combatState.isCombatActive) startCombat();
    else await executeActiveTurn();
}

async function executeEnemyUnitTurn(unit, forcedTarget) {
    if (!unit || getCurrentHp(unit) <= 0 || !player || getLivingPartyMembers(player).length === 0) return;
    const action = chooseEnemyAction(unit);
    if (action === 'charge') {
        unit._bossChargeReady = true;
        writeLog(`[적 행동] ${unit.name} — 강공격 준비`);
    } else if (action === 'heal') {
        const allies = getLivingEnemyPartyMembers(enemy);
        const targetAlly = allies.slice().sort((a, b) => a.curHp / a.maxHp - b.curHp / b.maxHp)[0] || unit;
        const result = resolveHealAction(unit, targetAlly);
        describeCombatResult(unit, targetAlly, result);
        if (result && result.success && typeof playHealAuraVfx === 'function') playHealAuraVfx('enemy', result.healed);
    } else if (action === 'defend' || action === 'dodge') {
        enemyGuardState = enemyGuardState && enemyGuardState.members ? enemyGuardState : { members: {} };
        enemyGuardState.members[unit.id] = { mode: action === 'defend' ? 'shield' : 'dodge', turn: combatTurnNumber };
        writeLog(`[적 행동] ${unit.name} — ${action === 'defend' ? '방어' : '회피'} 준비`);
    } else {
        const target = forcedTarget && getCurrentHp(forcedTarget) > 0 ? forcedTarget : chooseEnemyPartyTarget();
        if (!target) {
            gameOver();
            return;
        }
        writeLog(`[어그로] ${unit.name} → ${target.name} 타겟`);
        unit._attackMultiplier = unit._bossChargeReady ? 2.5 : 1;
        await playV35AttackVfx('enemy', unit, action, target);
        const result = action === 'magic_attack'
            ? resolveMagicAttackAction(unit, target, getPartyGuardStateFor(target))
            : resolveAttackAction(unit, target, getPartyGuardStateFor(target));
        unit._attackMultiplier = 1;
        unit._bossChargeReady = false;
        describeCombatResult(unit, target, result);
        emitCombatResultVfx(target, result);
    }
    if (enemy && Array.isArray(enemy.party)) syncEnemyPartyAggregateState(enemy);
}

async function finishActiveInitiativeTurn() {
    await lockedAdvanceToNextTurn();
}

function refreshCombatTurnQueue() {
    window.combatState.turnQueue = buildInitiativeQueue();
    initiativeQueue = window.combatState.turnQueue.slice();
    if (!window.combatState.turnQueue.length) return;
    // [라운드 시작 훅] 도발 지속시간 차감 + 파티 전원 MP 자연 회복
    tickTauntStateAtRoundStart();
    regenPartyMpAtRoundStart();
    writeLog(`[라운드] ${initiativeRound}라운드 시작 — 민첩 순서: ${getTurnOrderPreviewText()}`);
    initiativeRound += 1;
}

function startCombat() {
    if (!player || !enemy) return;
    resetCombatVictorySettlementLock();
    window.combatState.isCombatActive = true;
    window.combatState.currentTurnIndex = 0;
    window.combatState.isResolvingTurn = false;
    window.combatState.awaitingPlayerInput = false;
    window.combatState.isActionLocked = false;
    initiativeRound = 1;
    playerGuardState = null;
    enemyGuardState = null;
    playerTurnSpent = false;
    tankTauntState = null;
    refreshCombatTurnQueue();
    executeActiveTurn();
}

async function advanceInitiativeTurn() {
    return executeActiveTurn();
}

function startInitiativeTurnLoop() {
    if (!player || !enemy) return;
    if (!window.combatState.isCombatActive) {
        startCombat();
        return;
    }
    if (window.combatState.awaitingPlayerInput) return;
    executeActiveTurn();
}

async function executeActiveTurn() {
    const state = window.combatState;
    if (!state || !state.isCombatActive || state.isResolvingTurn || !player || !enemy) return;
    if (state.awaitingPlayerInput && currentTurnEntry && currentTurnEntry.side === 'player') return;
    if (getLivingPartyMembers(player).length === 0) {
        state.isCombatActive = false;
        currentTurnEntry = null;
        gameOver();
        return;
    }
    if (!hasLivingEnemies()) {
        state.isCombatActive = false;
        currentTurnEntry = null;
        winBattle();
        return;
    }
    if (!Array.isArray(state.turnQueue) || !state.turnQueue.length || state.currentTurnIndex >= state.turnQueue.length) {
        state.currentTurnIndex = 0;
        playerGuardState = null;
        enemyGuardState = null;
        refreshCombatTurnQueue();
    }

    const activeEntry = state.turnQueue[state.currentTurnIndex];
    currentTurnEntry = activeEntry || null;
    initiativeQueue = state.turnQueue.slice(state.currentTurnIndex + 1);
    if (!activeEntry || !isTurnActorAlive(activeEntry)) {
        await advanceNextTurn({ skipTurnEffects: true });
        return;
    }

    if (activeEntry.side === 'player') {
        state.awaitingPlayerInput = true;
        playerTurnSpent = false;
        activeEntry.actor.weaponDisabledThisTurn = false;
        activeEntry.actor._attackLockedForThisTurn = false;
        if (safeNum(activeEntry.actor.attackLockTurns, 0) > 0) {
            activeEntry.actor._attackLockedForThisTurn = true;
            activeEntry.actor.attackLockTurns = Math.max(0, safeNum(activeEntry.actor.attackLockTurns, 0) - 1);
            writeLog(`[공속 패널티] ${activeEntry.actor.name}는 이번 턴 공격할 수 없습니다.`);
        }
        if (window.combatState) window.combatState.isActionLocked = false;
        setCombatProcessing(false);
        writeLog(`[턴] ${activeEntry.actor.name}의 턴 — 행동을 선택하세요.`);
        updateUi();
        renderActions();
        rebindCombatActionButtonsForActiveTurn();
        setCombatActionButtonsDisabled(false);
        return;
    }

    state.isResolvingTurn = true;
    state.awaitingPlayerInput = false;
    setCombatProcessing(true);
    const target = chooseEnemyPartyTarget();
    window._enemyThinkingHint = target ? `🎯 타겟: ${target.name}` : '';
    updateUi();
    renderActions();
    setCombatActionButtonsDisabled(true);
    if (target && typeof renderEnemyIntentLaser === 'function') renderEnemyIntentLaser('enemy', 'player', 900);
    await waitMs(650);
    await executeEnemyUnitTurn(activeEntry.actor, target);
    window._enemyThinkingHint = '';
    state.isResolvingTurn = false;
    await lockedAdvanceToNextTurn();
}

async function advanceNextTurn(options) {
    const state = window.combatState;
    if (!state || !state.isCombatActive) return;
    const opt = options && typeof options === 'object' ? options : {};
    if (!opt.skipTurnEffects) {
        if (currentTurnEntry && currentTurnEntry.side === 'enemy' && enemy && enemy.isBoss) {
            enemy.turnCount = Math.max(1, safeNum(enemy.turnCount, 1)) + 1;
        }
        if (applyDefectiveEquipmentTurnEndEffects()) {
            if (!player || getLivingPartyMembers(player).length === 0) {
                state.isCombatActive = false;
                return;
            }
        }
        combatTurnNumber += 1;
    }

    if (!player || getLivingPartyMembers(player).length === 0) {
        state.isCombatActive = false;
        currentTurnEntry = null;
        gameOver();
        return;
    }
    if (!enemy || !hasLivingEnemies()) {
        state.isCombatActive = false;
        currentTurnEntry = null;
        winBattle();
        return;
    }

    state.currentTurnIndex += 1;
    if (state.currentTurnIndex >= state.turnQueue.length) {
        state.currentTurnIndex = 0;
        playerGuardState = null;
        enemyGuardState = null;
        refreshCombatTurnQueue();
    }
    await executeActiveTurn();
}

window.useAction = async function useAction(type, options) {
    const turn = currentTurnEntry;
    const actor = turn && turn.side === 'player' ? turn.actor : null;
    const livingPlayers = player ? getLivingPartyMembers(player) : [];
    const livingEnemies = enemy ? getPlayerAttackTargetCandidates() : [];
    const normalizedType = type === '힐' ? '힐' : type === '공격' ? '공격' : type === '스킬' ? '스킬' : '방패방어';
    const requestedTargetId = options && options.targetId ? String(options.targetId) : null;
    const matchesTargetId = (candidate) =>
        !!candidate && String(candidate.id || candidate.roleKey || candidate.name || '') === requestedTargetId;

    if (
        isProcessing ||
        (window.combatState && window.combatState.isActionLocked) ||
        !player ||
        !enemy ||
        !turn ||
        turn.side !== 'player' ||
        !actor ||
        !isTurnActorAlive(turn) ||
        livingPlayers.length === 0 ||
        livingEnemies.length === 0
    ) {
        if (typeof updateUi === 'function') updateUi();
        if (typeof renderActions === 'function') renderActions();
        return;
    }
    if (normalizedType === '힐' && !canPlayerActorUseHealAction(actor)) {
        // 턴을 소모하지 않고 다시 행동을 선택하게 한다.
        writeLog(`[힐 불가] ${actor.name}는 힐을 사용할 수 없거나 회복할 아군이 없습니다. 다른 행동을 선택하세요.`);
        if (window.combatState) window.combatState.awaitingPlayerInput = true;
        updateUi();
        renderActions();
        return;
    }
    // [액티브 스킬] 스킬 미보유/마나 부족은 턴을 소모하지 않고 행동을 다시 고르게 한다.
    if (normalizedType === '스킬') {
        const requestedSkill = getPartyActiveSkillFor(actor);
        if (!requestedSkill) {
            writeLog(`[스킬 불가] ${actor.name}가 사용할 수 있는 특수 스킬이 없습니다. 다른 행동을 선택하세요.`);
            if (window.combatState) window.combatState.awaitingPlayerInput = true;
            updateUi();
            renderActions();
            return;
        }
        if (getActorMp(actor) < requestedSkill.mpCost) {
            writeLog(`[마나 부족] ${requestedSkill.name} 시전에는 MP ${requestedSkill.mpCost}가 필요합니다. (현재 ${getActorMp(actor)} MP)`);
            if (window.combatState) window.combatState.awaitingPlayerInput = true;
            updateUi();
            renderActions();
            return;
        }
    }

    // 대상 선택: 공격은 살아있는 적이 2명 이상, 힐은 부상당한 아군(자신 포함)이
    // 2명 이상일 때 대상 선택 패널을 먼저 보여준다. 대상이 하나면 자동 지정.
    if (!requestedTargetId && typeof renderCombatTargetSelectionPanel === 'function') {
        const woundedAllies = normalizedType === '힐' ? getWoundedPlayerHealTargets() : [];
        const offensiveSkill = normalizedType === '스킬' ? getPartyActiveSkillFor(actor) : null;
        const needsTargetPanel = normalizedType === '공격'
            ? livingEnemies.length > 1
            : normalizedType === '스킬'
              ? !!(offensiveSkill && offensiveSkill.targeting === 'enemy' && livingEnemies.length > 1)
              : normalizedType === '힐' && woundedAllies.length > 1;
        if (needsTargetPanel) {
            if (typeof clearCombatTargetSelection === 'function') clearCombatTargetSelection();
            const panelHost = document.getElementById('action-btns');
            if (panelHost) {
                panelHost.querySelectorAll('[data-v35-target-panel]').forEach((el) => el.remove());
                renderCombatTargetSelectionPanel(panelHost, normalizedType, actor);
                if (window.combatState) window.combatState.awaitingPlayerInput = true;
                return;
            }
        }
    }

    if (window.combatState) window.combatState.awaitingPlayerInput = false;

    if (typeof clearCombatTargetSelection === 'function') clearCombatTargetSelection();

    if (!spendPlayerAction()) {
        writeLog('[턴 제한] 한 턴에는 공격/방어/힐 중 하나만 선택할 수 있습니다.');
        if (window.combatState) window.combatState.awaitingPlayerInput = true;
        updateUi();
        renderActions();
        return;
    }

    setCombatActionLock(true);
    setCombatProcessing(true);
    try {
        if (normalizedType === '공격') {
            const learnedAction = classifyPlayerAttackAction(actor);
            const target = (requestedTargetId && livingEnemies.find(matchesTargetId)) || livingEnemies[0];
            const strikes = learnedAction === 'physical_attack' ? getActorAttackStrikeCount(actor) : 1;
            recordPlayerBehavior(learnedAction);
            writeLog(`[타겟] ${actor.name} → ${target.name || '적'} ${requestedTargetId ? '지정' : '자동 지정'}`);

            for (let i = 0; i < strikes; i++) {
                if (getCurrentHp(target) <= 0) break;
                if (typeof playV35AttackVfx === 'function') await playV35AttackVfx('player', actor, learnedAction, target);
                const result = learnedAction === 'magic_attack'
                    ? resolveMagicAttackAction(actor, target, getEnemyGuardStateFor(target))
                    : resolveAttackAction(actor, target, getEnemyGuardStateFor(target));
                describeCombatResult(actor, target, result);
                emitCombatResultVfx(target, result);
                if (learnedAction === 'magic_attack') gainActorMagicMastery(actor, 1);
                else gainActorWeaponMastery(actor, 1);
                if (enemy && Array.isArray(enemy.party)) syncEnemyPartyAggregateState(enemy);
                if (!hasLivingEnemies() || getCurrentHp(target) <= 0) break;
                if (strikes > 1) await waitMs(90);
            }

            const cooldownTurns = getActorPostAttackCooldownTurns(actor);
            if (cooldownTurns > 0) {
                actor.attackLockTurns = Math.max(safeNum(actor.attackLockTurns, 0), cooldownTurns);
                writeLog(`[공속 패널티] ${actor.name}는 공격 후 ${cooldownTurns}턴 동안 공격 버튼이 잠깁니다.`);
            }
            enemyGuardState = null;
            if (enemy && Array.isArray(enemy.party)) syncEnemyPartyAggregateState(enemy);
        } else if (normalizedType === '힐') {
            const woundedTargets = getWoundedPlayerHealTargets();
            const target = (requestedTargetId
                && (woundedTargets.find(matchesTargetId) || livingPlayers.find(matchesTargetId)))
                || woundedTargets[0]
                || livingPlayers[0];
            recordPlayerBehavior('heal');
            writeLog(`[타겟] ${actor.name} → ${target.name || '아군'} ${requestedTargetId ? '힐 지정' : '자동 힐 지정'}`);
            const result = resolveHealAction(actor, target);
            describeCombatResult(actor, target, result);
            if (result && result.success) {
                if (typeof playHealAuraVfx === 'function') await playHealAuraVfx('player', result.healed);
                gainActorMagicMastery(actor, 1);
                maybeTriggerCorruptedHeal(actor, target);
            }
            syncPartyAggregateState(player);
        } else if (normalizedType === '스킬') {
            const skill = getPartyActiveSkillFor(actor);
            spendActorMp(actor, skill.mpCost);
            if (skill.key === 'ironTaunt') {
                // [탱커 - 철벽 도발] 남은 현재 라운드 + 다음 1라운드 동안 어그로 강제 고정
                recordPlayerBehavior('defend');
                tankTauntState = { tankId: actor.id, roundsLeft: 2 };
                writeLog(`[전투] 탱커가 철벽 도발을 시전하여 적들의 시선을 끌어 모읍니다! (MP -${skill.mpCost})`);
                if (typeof playPhysicalShieldVfx === 'function') playPhysicalShieldVfx('player');
                if (typeof triggerUnitHitShake === 'function') triggerUnitHitShake(actor, false);
            } else if (skill.key === 'chainSlash') {
                // [기사 - 연속 베기] 물리 공격력 1.8배 강타 + 피격 카드 2연속 셰이크
                recordPlayerBehavior('physical_attack');
                const target = (requestedTargetId && livingEnemies.find(matchesTargetId)) || livingEnemies[0];
                writeLog(`[스킬] ${withIGa(actor.name)} ${withEulReul(target.name || '적')} 향해 연속 베기를 발동합니다! (MP -${skill.mpCost})`);
                actor._attackMultiplier = 1.8;
                if (typeof playV35AttackVfx === 'function') await playV35AttackVfx('player', actor, 'physical_attack', target);
                const result = resolveAttackAction(actor, target, getEnemyGuardStateFor(target));
                actor._attackMultiplier = 1;
                describeCombatResult(actor, target, result);
                emitCombatResultVfx(target, result);
                if (result && result.success && (result.damage || 0) > 0 && typeof triggerUnitHitShake === 'function') {
                    setTimeout(() => triggerUnitHitShake(target, true), 220);
                }
                gainActorWeaponMastery(actor, 1);
                enemyGuardState = null;
                if (enemy && Array.isArray(enemy.party)) syncEnemyPartyAggregateState(enemy);
            } else if (skill.key === 'fireball') {
                // [마법사 - 파이어 볼] 지능 비례 2.2배 마법 폭발 + 보라/붉은색 폭발 파티클
                recordPlayerBehavior('magic_attack');
                const target = (requestedTargetId && livingEnemies.find(matchesTargetId)) || livingEnemies[0];
                writeLog(`[스킬] ${withIGa(actor.name)} ${withEulReul(target.name || '적')} 향해 파이어 볼을 시전합니다! (MP -${skill.mpCost})`);
                const result = resolveFireballSkillAction(actor, target, getEnemyGuardStateFor(target));
                if (typeof playFireballExplosionVfx === 'function') await playFireballExplosionVfx(target);
                describeCombatResult(actor, target, result);
                emitCombatResultVfx(target, result);
                gainActorMagicMastery(actor, 2);
                enemyGuardState = null;
                if (enemy && Array.isArray(enemy.party)) syncEnemyPartyAggregateState(enemy);
            }
            syncPartyAggregateState(player);
        } else {
            const members = Object.fromEntries(getLivingPartyMembers(player).map((member) => [
                member.id,
                { mode: 'shield', turn: combatTurnNumber, partyWide: true, defBonus: PLAYER_PARTY_DEFENSE_BONUS },
            ]));
            recordPlayerBehavior('defend');
            playerGuardState = {
                mode: 'shield',
                turn: combatTurnNumber,
                partyWide: true,
                members,
            };
            if (typeof triggerGuardAura === 'function') triggerGuardAura();
            writeLog(`[플레이어 행동] ${actor.name} — 파티 방어. 이번 라운드 아군 전체 방어 태세`);
        }

        syncPartyAggregateState(player);
        updateUi();
        if (!hasLivingEnemies()) {
            await waitMs(120);
            winBattle();
        } else {
            await finishActiveInitiativeTurn();
        }
    } catch (err) {
        console.error('[전투 행동 오류]', err);
        playerTurnSpent = false;
        if (window.combatState) window.combatState.awaitingPlayerInput = true;
        setCombatProcessing(false);
        writeLog(`[오류] ${actor.name}의 행동 처리 중 문제가 발생했습니다. 다시 선택하세요.`);
        updateUi();
        renderActions();
    }
};

// [포션 사용] 기존 턴제 파이프라인 위에 증분 결합된 긴급 회복 커맨드.
// HP 비율(현재HP/최대HP)이 가장 낮은 아군 1명을 자동 정밀 타겟팅해
// 대상 최대 체력의 40%를 즉시 회복시키고, lockedAdvanceToNextTurn으로 900ms 턴 전환을 보장한다.
const COMBAT_POTION_HEAL_RATIO = 0.4;

window.useCombatPotion = async function useCombatPotion() {
    const turn = currentTurnEntry;
    const actor = turn && turn.side === 'player' ? turn.actor : null;
    if (
        isProcessing ||
        (window.combatState && window.combatState.isActionLocked) ||
        !player ||
        !enemy ||
        !turn ||
        turn.side !== 'player' ||
        !actor ||
        !isTurnActorAlive(turn) ||
        getLivingPartyMembers(player).length === 0 ||
        !hasLivingEnemies()
    ) {
        if (typeof updateUi === 'function') updateUi();
        if (typeof renderActions === 'function') renderActions();
        return;
    }
    const potionCount = Math.max(0, safeNum(player.potions, 0));
    if (potionCount <= 0) {
        // 턴을 소모하지 않고 다시 행동을 선택하게 한다.
        writeLog('[포션 없음] 소지한 포션이 없습니다. 다른 행동을 선택하세요.');
        if (window.combatState) window.combatState.awaitingPlayerInput = true;
        updateUi();
        renderActions();
        return;
    }
    if (!spendPlayerAction()) {
        writeLog('[턴 제한] 한 턴에는 공격/방어/힐/포션 중 하나만 선택할 수 있습니다.');
        if (window.combatState) window.combatState.awaitingPlayerInput = true;
        updateUi();
        renderActions();
        return;
    }
    if (typeof clearCombatTargetSelection === 'function') clearCombatTargetSelection();
    if (window.combatState) window.combatState.awaitingPlayerInput = false;
    // 클릭 즉시 액션 락을 발동해 연타 꼼수를 차단하고 모든 커맨드 버튼을 잠근다.
    setCombatActionLock(true);
    setCombatProcessing(true);
    try {
        const target = getLivingPartyMembers(player)
            .slice()
            .sort((a, b) => getCurrentHp(a) / actorMaxHp(a) - getCurrentHp(b) / actorMaxHp(b))[0] || actor;
        const healMultiplier = typeof getPlayerPotionHealMultiplier === 'function' ? getPlayerPotionHealMultiplier() : 1;
        const healAmount = Math.max(1, Math.floor(actorMaxHp(target) * COMBAT_POTION_HEAL_RATIO * healMultiplier));
        const before = getCurrentHp(target);
        setCurrentHp(target, before + healAmount);
        const healed = getCurrentHp(target) - before;
        player.potions = potionCount - 1;
        writeLog(`[전투] ${withIGa(getActorFullLabel(actor))} 포션을 사용하여 체력이 가장 낮은 ${withEulReul(getActorFullLabel(target))} 치유하고 ${healed}의 체력을 회복시켰습니다. (남은 포션 ${player.potions}개)`);
        if (typeof playHealAuraVfx === 'function') await playHealAuraVfx('player', healed);
        syncPartyAggregateState(player);
        updateUi();
        // 기존에 구축된 900ms 잠금 턴 전환 파이프라인으로 다음 캐릭터 턴으로 자연스럽게 넘어간다.
        await finishActiveInitiativeTurn();
    } catch (err) {
        console.error('[포션 사용 오류]', err);
        playerTurnSpent = false;
        if (window.combatState) window.combatState.awaitingPlayerInput = true;
        setCombatProcessing(false);
        setCombatActionLock(false);
        writeLog('[오류] 포션 사용 처리 중 문제가 발생했습니다. 다시 선택하세요.');
        updateUi();
        renderActions();
    }
};

window.usePotion = function usePotion() {
    const turn = currentTurnEntry;
    if (isProcessing || !player || !turn || turn.side !== 'player' || getLivingPartyMembers(player).length === 0) return;
    if (!spendPlayerAction()) return writeLog('[턴 제한] 이번 턴의 행동을 이미 사용했습니다.');
    if (typeof clearCombatTargetSelection === 'function') clearCombatTargetSelection();
    const target = getLivingPartyMembers(player).slice().sort((a, b) => a.curHp / a.maxHp - b.curHp / b.maxHp)[0];
    const result = resolveHealAction(turn.actor, target);
    describeCombatResult(turn.actor, target, result);
    syncPartyAggregateState(player);
    updateUi();
    finishActiveInitiativeTurn();
};

function syncPlayerCampaignState() {
    if (!player || !player.metaSlotId) return;
    ensureHumanRuntimeShape(player);
    syncPartyAggregateState(player);
    player.progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
    MetaRPG.syncRunProgress(player.metaSlotId, {
        stats: player.stats,
        party: getPartyMembers(player).map((member) => ({ ...member, hp: member.curHp })),
        progress: player.progress,
        hp: player.curHp,
        maxHp: player.maxHp,
        gold,
        runWins: player.runWins,
        equipment: player.equipment,
        magic: player.magic,
        skills: player.skills,
        mastery: player.mastery,
        statuses: player.statuses,
        body: player.body,
        items: player.items,
        relics: player.relics,
        behaviorLogger: player.behaviorLogger,
        behaviorMatrix: player.behaviorMatrix,
    });
}

function enterNextDungeonStage() {
    const current = normalizeDungeonProgress({ floor, stage: dungeonStage });
    const next = advanceDungeonProgress(current);
    if (next.completed) {
        dungeonClear();
        return;
    }
    floor = next.floor;
    dungeonStage = next.stage;
    player.progress = { floor, stage: dungeonStage };
    if (hasCrossedPointOfNoReturn(player.progress)) MetaRPG.clearRunSnapshot(player.metaSlotId);
    syncPlayerCampaignState();
    writeLog(`[전진] ${formatDungeonPosition(player.progress)} 진입${hasCrossedPointOfNoReturn(player.progress) ? ' · 복귀 불가' : ''}`);
    resetCombatVictorySettlementLock();
    const goldBeforeStageEntry = Math.max(0, safeNum(gold, 0));
    spawnEnemy();
    if (Math.max(0, safeNum(gold, 0)) !== goldBeforeStageEntry) {
        gold = goldBeforeStageEntry;
        syncPlayerCampaignState();
        updateUi();
    }
}

function onCombatVictory() {
    if (!player || combatVictorySettlementLocked) return null;
    // [무전투 보상 차단] 스폰 시점에 살아있는 적이 한 명도 없던 인카운터(적 배열 길이 0)는
    // 실제 전투가 성립하지 않은 것으로 간주하여 골드/진행 보상을 지급하지 않는다.
    if (!enemy || safeNum(enemy._spawnLivingCount, undefined) === 0) {
        combatVictorySettlementLocked = true;
        writeLog('[경고] 유효한 전투 없이 승리 판정이 발생하여 보상 지급을 차단했습니다.');
        return null;
    }
    combatVictorySettlementLocked = true;
    const reward = computeFloorGoldReward(floor + (dungeonStage - 1) / STAGES_PER_FLOOR, {
        isBoss: dungeonStage === STAGES_PER_FLOOR,
    });
    gold = Math.max(0, safeNum(gold, 0)) + reward;
    player.runWins = Math.max(0, safeNum(player.runWins, 0)) + 1;
    player.hasWonBattle = true;
    player.victoryCount = player.runWins;
    if (typeof totalGoldEarned !== 'undefined') totalGoldEarned = Math.max(0, safeNum(totalGoldEarned, 0)) + reward;
    writeLog(`[승리] ${formatDungeonPosition({ floor, stage: dungeonStage })} 전투 종료 · ${reward}G 획득`);
    syncPlayerCampaignState();
    return {
        reward,
        clearedFloor: floor,
        defeatedBoss: dungeonStage === STAGES_PER_FLOOR,
    };
}

function winBattle() {
    setCombatProcessing(false);
    resetInitiativeTimeline();
    playerTurnSpent = false;
    playerGuardState = null;
    enemyGuardState = null;
    const settlement = onCombatVictory();
    if (!settlement) {
        updateUi();
        renderActions();
        return;
    }
    tryAwardDefectiveEquipmentDrop();
    getLivingPartyMembers(player).forEach((member) => {
        setCurrentHp(member, member.curHp + Math.max(1, Math.floor(member.maxHp * 0.08)));
    });
    syncPartyAggregateState(player);
    syncPlayerCampaignState();
    const continueForward = () => enterNextDungeonStage();
    if (typeof showVictoryRewardAndAwaitContinue === 'function') {
        showVictoryRewardAndAwaitContinue(
            { clearedFloor: settlement.clearedFloor, goldGain: settlement.reward, expGain: 0, defeatedBoss: settlement.defeatedBoss },
            continueForward
        );
    } else {
        continueForward();
    }
}

function gameOver() {
    if (!player) return;
    setCombatProcessing(false);
    ensureHumanRuntimeShape(player);
    player.curHp = 0;
    player.party = getPartyMembers(player).map((member) => ({ ...member, hp: member.curHp }));
    player.progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
    player.behaviorMatrix = isBehaviorLearningZone(player.progress)
        ? buildBehaviorProbabilityMatrix(player.behaviorLogger)
        : null;
    const killedBy = enemy ? { id: enemy.id || null, name: enemy.name, ghostId: enemy.ghostId || null } : null;
    const archived = MetaRPG.markPermanentDeath(player.metaSlotId, player, player.progress, killedBy);
    const ghostName = archived && archived.ghost ? archived.ghost.monsterName : `${player.name}의 망령`;
    writeLog(
        `[영구 사망] ${player.name} — ${formatDungeonPosition(player.progress)}에서 사망. ` +
        `모든 스탯·무기·갑옷·마법·스킬이 동일한 <b>${ghostName}</b>으로 박제되었습니다.`
    );
    enemy = null;
    const battleArea = document.getElementById('battle-area');
    if (battleArea) battleArea.style.display = 'none';
    if (typeof exitBattleLayout === 'function') exitBattleLayout();
    player = null;
    floor = 1;
    dungeonStage = 1;
    if (typeof showPreGameScreen === 'function') showPreGameScreen();
}

function dungeonClear() {
    if (player) {
        player.progress = { floor: MAX_DUNGEON_FLOOR, stage: STAGES_PER_FLOOR };
        syncPlayerCampaignState();
    }
    writeLog('[완주] 100-10층 돌파');
    enemy = null;
    updateUi();
    renderActions();
}

function buildRuntimePlayerFromSlot(slot) {
    const party = normalizeAdventurerParty(slot.party).map((member) =>
        ensurePartyMemberRuntimeShape({
            ...member,
            curHp: member.hp,
            maxHp: member.maxHp,
        })
    );
    const stats = party[0].stats;
    return ensureHumanRuntimeShape({
        id: slot.id,
        metaSlotId: slot.id,
        name: slot.name,
        color: '#d8d8d8',
        party,
        stats,
        curHp: party.reduce((sum, member) => sum + member.curHp, 0),
        maxHp: party.reduce((sum, member) => sum + member.maxHp, 0),
        atk: party.reduce((sum, member) => sum + member.stats.str, 0),
        def: Math.round(party.reduce((sum, member) => sum + member.stats.def, 0) / party.length),
        int: stats.int,
        wis: stats.wis,
        agi: stats.agi,
        divinity: stats.divinity,
        distortion: stats.distortion,
        progress: normalizeDungeonProgress(slot.progress),
        equipment: JSON.parse(JSON.stringify(slot.equipment || { weapon: null, armor: null, accessories: [] })),
        magic: JSON.parse(JSON.stringify(slot.magic || [])),
        skills: JSON.parse(JSON.stringify(slot.skills || [])),
        mastery: JSON.parse(JSON.stringify(slot.mastery || {})),
        statuses: JSON.parse(JSON.stringify(slot.statuses || [])),
        body: JSON.parse(JSON.stringify(slot.body || {})),
        items: JSON.parse(JSON.stringify(slot.items || [])),
        relics: JSON.parse(JSON.stringify(slot.relics || [])),
        behaviorLogger: JSON.parse(JSON.stringify(slot.behaviorLogger || [])),
        behaviorMatrix: slot.behaviorMatrix ? JSON.parse(JSON.stringify(slot.behaviorMatrix)) : null,
        permanentBonus: JSON.parse(JSON.stringify(slot.techBonus || {})),
        potions: 0,
        runWins: Math.max(0, safeNum(slot.runWins, 0)),
        baseJob: '3인 파티',
        jobKey: HUMAN_JOB_KEY,
        classKey: null,
        runLevel: 1,
        runExp: 0,
        tacticalSkills: [],
        tacticalSkillUses: {},
        passiveContractHistory: [],
        floorGrowth: { floors: 0, atk: 0, hp: 0 },
        playerState: { corruption: 0, purification: 0 },
    });
}

function initHumanRunFromActiveSlot() {
    const meta = MetaRPG.loadMeta();
    const slot = meta.slots.find((entry) => entry.id === meta.activeSlotId);
    if (!slot || slot.permanentDeath) return false;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(meta);
    player = buildRuntimePlayerFromSlot(slot);
    fullResyncPlayerCombatStatsFromMetaAndInventory();
    floor = player.progress.floor;
    dungeonStage = player.progress.stage;
    gold = Math.max(0, safeNum(slot.gold, 0));
    if (floor === 1 && dungeonStage === 1) {
        resetFreshDungeonEntryVictoryGate();
        syncPlayerCampaignState();
    }
    combatTurnNumber = 1;
    playerTurnSpent = false;
    playerGuardState = null;
    enemyGuardState = null;
    document.getElementById('start-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    if (typeof enterBattleLayout === 'function') enterBattleLayout();
    writeLog(
        `[원정대] ${player.party.map((member) =>
            `${member.name}(힘 ${member.stats.str}/방 ${member.stats.def}/체 ${member.stats.hp}/지 ${member.stats.int}/지혜 ${member.stats.wis}/민 ${member.stats.agi})`
        ).join(' · ')}`
    );
    const goldBeforeInitialSpawn = Math.max(0, safeNum(gold, 0));
    spawnEnemy();
    if (Math.max(0, safeNum(gold, 0)) !== goldBeforeInitialSpawn) {
        gold = goldBeforeInitialSpawn;
        syncPlayerCampaignState();
        updateUi();
    }
    return true;
}

// 기존 DOM 이벤트가 호출하는 이름을 유지하되 직업 인수는 무시한다.
window.confirmNewCharacter = function confirmNewCharacter() {
    if (typeof confirmPartyAdventure === 'function') confirmPartyAdventure();
};

window.initRunFromMetaSlot = function initRunFromMetaSlot() {
    return initHumanRunFromActiveSlot();
};
if (typeof initRunFromMetaSlot === 'function') {
    initRunFromMetaSlot = window.initRunFromMetaSlot;
}
if (typeof confirmNewCharacter === 'function') {
    confirmNewCharacter = window.confirmNewCharacter;
}
if (typeof loadRunFromMetaSnapshot === 'function') {
    loadRunFromMetaSnapshot = function loadHumanRunFromSnapshot() {
        return initHumanRunFromActiveSlot();
    };
}

window.returnPartyToTown = function returnPartyToTown() {
    if (!player || !player.metaSlotId || player.inTown) return;
    const progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
    if (!canReturnToBaseCamp(progress)) {
        writeLog(`[복귀 불가] ${formatDungeonPosition(progress)}부터는 마을로 돌아갈 수 없습니다.`);
        return;
    }
    if (safeNum(player.runWins, 0) < 1) {
        writeLog('[복귀 불가] 이번 회차에서 전투를 최소 1회 승리해야 마을로 돌아갈 수 있습니다.');
        return;
    }
    getPartyMembers(player).forEach((member) => setCurrentHp(member, member.maxHp));
    syncPartyAggregateState(player);
    player.inTown = true;
    resetFreshDungeonEntryVictoryGate();
    syncPlayerCampaignState();
    if (typeof exitBattleLayout === 'function') exitBattleLayout();
    enemy = null;
    writeLog('[마을] 원정대가 귀환했습니다. 장비 구매와 영구 강화를 정비할 수 있습니다.');
    openShop();
};

window.enterDungeonFromTown = function enterDungeonFromTown() {
    if (!player || !player.inTown) return;
    const goldBeforeEntry = Math.max(0, safeNum(gold, 0));
    floor = 1;
    dungeonStage = 1;
    player.progress = { floor: 1, stage: 1 };
    player.inTown = false;
    gold = goldBeforeEntry;
    enemy = null;
    resetInitiativeTimeline();
    resetFreshDungeonEntryVictoryGate();
    combatTurnNumber = 1;
    playerTurnSpent = false;
    playerGuardState = null;
    enemyGuardState = null;
    syncPlayerCampaignState();
    const shopArea = document.getElementById('shop-area');
    const battleArea = document.getElementById('battle-area');
    if (shopArea) shopArea.style.display = 'none';
    if (battleArea) battleArea.style.display = 'block';
    if (typeof enterBattleLayout === 'function') enterBattleLayout();
    writeLog('[출정] 장비·골드·영구 강화 유지 · 미궁 진행도 1-1층 초기화');
    spawnEnemy();
    if (Math.max(0, safeNum(gold, 0)) !== goldBeforeEntry) {
        gold = goldBeforeEntry;
        syncPlayerCampaignState();
        updateUi();
    }
};

window.openPartyTownFromHub = function openPartyTownFromHub() {
    if (typeof writeLog === 'function') {
        writeLog('[마을 잠금] 로비에서는 마을에 진입할 수 없습니다. 던전에서 전투를 1회 이상 승리한 뒤 복귀하세요.');
    }
    return false;
};

window.saveAndExitToMain = window.returnPartyToTown;
window.exitToMainWithoutSave = window.returnPartyToTown;

function installHumanActionButtons() {
    const originalRenderActions = typeof renderActions === 'function' ? renderActions : null;
    if (!originalRenderActions || originalRenderActions.__humanWrapped) return;
    const wrapped = function renderHumanActions() {
        originalRenderActions();
        const host = document.getElementById('action-btns');
        if (!host || !player || !enemy || (typeof hasLivingEnemies === 'function' ? !hasLivingEnemies() : enemy.curHp <= 0)) return;
        const turn = typeof getCurrentTurnEntry === 'function' ? getCurrentTurnEntry() : null;
        if (!turn || turn.side !== 'player') return;
        if (host.querySelector('[data-v35-action]')) {
            updateCombatButtonsLockState();
            return;
        }
        const buttons = Array.from(host.querySelectorAll('button'));
        const defense = buttons.find((button) => !button.onclick && button !== buttons[0]);
        if (defense) {
            defense.innerText = '🛡️ 파티 방어';
            defense.onclick = () => useAction('방패방어');
        }
        if (!host.querySelector('[data-v35-heal]')) {
            const heal = document.createElement('button');
            heal.dataset.v35Heal = '1';
            heal.innerText = '✨ 힐';
            heal.style.background = '#4b6b50';
            heal.onclick = () => useAction('힐');
            host.appendChild(heal);
        }
        const potion = host.querySelector('.potion-btn');
        if (potion) potion.remove();
        updateCombatButtonsLockState();
    };
    wrapped.__humanWrapped = true;
    renderActions = wrapped;
    window.renderActions = wrapped;
}

installHumanActionButtons();

function installDungeonProgressUiAdapter() {
    const originalUpdateUi = typeof updateUi === 'function' ? updateUi : null;
    if (!originalUpdateUi || originalUpdateUi.__v35ProgressWrapped) return;
    const wrapped = function updateV35Ui() {
        originalUpdateUi();
        const position = `${floor}-${dungeonStage}`;
        ['floor-t-battle', 'floor-t'].forEach((id) => {
            const element = document.getElementById(id);
            if (element) element.innerText = position;
        });
        const progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
        const canReturn = canReturnToBaseCamp(progress) && safeNum(player && player.runWins, 0) >= 1;
        ['battle-save-main-btn', 'battle-exit-main-btn'].forEach((id, index) => {
            const button = document.getElementById(id);
            if (!button) return;
            if (index === 1) {
                button.style.display = 'none';
                return;
            }
            button.style.display = '';
            button.innerText = '🏠 마을로 복귀';
            button.onclick = () => returnPartyToTown();
            button.disabled = !canReturn;
            button.title = canReturn
                ? `${formatDungeonPosition(progress)}: 마을 복귀 가능`
                : hasCrossedPointOfNoReturn(progress)
                  ? `${formatDungeonPosition(progress)}: 6-1층 진입 후 복귀 불가`
                  : '이번 회차에서 전투를 1회 이상 승리해야 복귀할 수 있습니다.';
        });
    };
    wrapped.__v35ProgressWrapped = true;
    updateUi = wrapped;
    window.updateUi = wrapped;
}

installDungeonProgressUiAdapter();

Object.assign(window, {
    setCombatProcessing,
    updateCombatButtonsLockState,
    probabilityRoll,
    getCurrentTurnEntry,
    resetInitiativeTimeline,
    startCombat,
    executeActiveTurn,
    advanceNextTurn,
    advanceInitiativeTurn,
    startInitiativeTurnLoop,
    calculateAttackChance,
    calculatePhysicalDamage,
    getActorAttackSpeed,
    getActorAttackStrikeCount,
    getActorPostAttackCooldownTurns,
    canActorAttackThisTurn,
    getEnemyGuardStateFor,
    choosePlayerEnemyTarget,
    hasLivingEnemies,
    chooseEnemyPartyTarget,
    getPartyActiveSkillFor,
    canActorUseActiveSkill,
    getActorMp,
    getActorMaxMp,
    getActorMpRegenAmount,
    getActiveTauntTank,
    enemyTurn,
    winBattle,
    gameOver,
    dungeonClear,
    syncPlayerCampaignState,
    enterNextDungeonStage,
    initHumanRunFromActiveSlot,
    returnPartyToTown: window.returnPartyToTown,
    enterDungeonFromTown: window.enterDungeonFromTown,
    openPartyTownFromHub: window.openPartyTownFromHub,
    isMercenaryCaptainJob,
    getAffinityRelKey,
    getMercGoldSkipCost,
    getMercEffectiveAttackPower,
    getMercBonusAcc,
    getMercEffectiveCritForMercAttack,
    getMercEffectiveCritMultForMercAttack,
    getFieldMercAttackMult,
    buildFieldMercFromTemplate,
    getMercGachaCost,
    tryMercenaryRandomEvent,
    queueEnemyTurnWithPacing,
    triggerBossWarning,
    applySummonDarkTurnStart,
});
