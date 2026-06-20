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
function queueEnemyTurnWithPacing() { return enemyTurn(); }
function triggerBossWarning() {}
function applySummonDarkTurnStart() { return false; }

function setCombatProcessing(flag) {
    isProcessing = !!flag;
    updateCombatButtonsLockState();
}

function updateCombatButtonsLockState() {
    const host = document.getElementById('action-btns');
    if (!host) return;
    host.querySelectorAll('button').forEach((button) => {
        button.disabled = !!isProcessing || button.disabled;
        button.classList.toggle('combat-btn-processing', !!isProcessing);
    });
}

function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function probabilityRoll(chance, random) {
    const capped = capProbability(chance);
    const rng = typeof random === 'function' ? random : Math.random;
    const roll = rng();
    return { success: roll < capped, chance: capped, roll };
}

function getActorStats(actor) {
    if (actor === player) ensureHumanRuntimeShape(actor);
    return normalizeHumanStats(actor && actor.stats || {});
}

function getEquippedWeapon(actor) {
    const key = actor && actor.equipment && actor.equipment.weapon;
    return weaponTable[key] || null;
}

function getEquippedArmor(actor) {
    const key = actor && actor.equipment && actor.equipment.armor;
    return armorTable[key] || null;
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
    const enemyArchetype = enemy.archetype || getActorCombatArchetype(enemy);
    player.behaviorLogger.push({
        floor: progress.floor,
        stage: progress.stage,
        turn: combatTurnNumber,
        hpRatio,
        hpBucket: getHpBucket(player),
        enemyArchetype,
        enemyElement: enemy.element || 'neutral',
        enemyTraits: Array.isArray(enemy.traitTags) ? enemy.traitTags.slice() : [],
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
    return 0.42 + attackStats.agi * 0.004 + mastery * 0.002 - defendStats.agi * 0.0015;
}

function calculatePhysicalDamage(attacker, defender) {
    const attackStats = getActorStats(attacker);
    const defendStats = getActorStats(defender);
    const weapon = getEquippedWeapon(attacker);
    const armor = getEquippedArmor(defender);
    let rawPower = safeNum(attacker && attacker.atk, attackStats.str) + (weapon ? safeNum(weapon.value, 0) : 0);
    const attackerRatio = actorMaxHp(attacker) > 0 ? getCurrentHp(attacker) / actorMaxHp(attacker) : 1;
    const defenderRatio = actorMaxHp(defender) > 0 ? getCurrentHp(defender) / actorMaxHp(defender) : 1;
    if (attacker && attacker.archetype === 'warrior' && attackerRatio <= 0.45) rawPower *= attackerRatio <= 0.25 ? 1.55 : 1.3;
    if (attacker && attacker.archetype === 'hunter' && defenderRatio <= 0.4) rawPower *= 1.45;
    if (attacker && attacker._attackMultiplier) rawPower *= attacker._attackMultiplier;
    const runtimeDefense = safeNum(defender && defender.def, defendStats.def) + safeNum(defender && defender.extraDef, 0);
    const flatBlocked = Math.max(0, rawPower - runtimeDefense - (armor ? safeNum(armor.def, 0) : 0));
    const mitigation = armor ? Math.min(0.6, Math.max(0, safeNum(armor.mitigation, 0))) : 0;
    return Math.max(0, Math.floor(flatBlocked * (1 - mitigation)));
}

function calculateMagicDamage(attacker, defender) {
    const attackStats = getActorStats(attacker);
    const defendStats = getActorStats(defender);
    const mastery = safeNum(attacker && attacker.mastery && (attacker.mastery.magic || attacker.mastery.holyMagic), 0);
    const rawPower = attackStats.wis * 1.35 + attackStats.int * 0.45 + mastery * 0.25;
    return Math.max(0, Math.floor(rawPower - defendStats.def * 0.35));
}

function getCurrentHp(actor) {
    return actor === player ? safeNum(actor.curHp, 0) : safeNum(actor.curHp, 0);
}

function setCurrentHp(actor, value) {
    const max = actor === player ? getEffectiveMaxHp() : Math.max(1, safeNum(actor.hp, 1));
    actor.curHp = Math.max(0, Math.min(max, safeNum(value, 0)));
}

function actorMaxHp(actor) {
    return actor === player ? getEffectiveMaxHp() : Math.max(1, safeNum(actor.hp, 1));
}

function actorCanHeal(actor) {
    const stats = getActorStats(actor);
    return stats.wis > 0 && getCurrentHp(actor) < actorMaxHp(actor);
}

function resolveAttackAction(attacker, defender, guardState) {
    const hit = probabilityRoll(calculateAttackChance(attacker, defender));
    if (!hit.success) return { type: 'attack', success: false, reason: 'miss', hit };

    if (guardState && guardState.mode === 'dodge') {
        const dodgeStats = getActorStats(defender);
        const dodge = probabilityRoll(0.18 + dodgeStats.agi * 0.005);
        if (dodge.success) return { type: 'attack', success: false, reason: 'dodged', hit, dodge };
        if (dodgeStats.agi < 35) {
            defender.statuses = Array.isArray(defender.statuses) ? defender.statuses : [];
            defender.statuses.push({ key: 'ankleSprain', turns: 2, agilityPenalty: 20 });
        }
    }

    const armor = getEquippedArmor(defender);
    if (armor) {
        const nullify = probabilityRoll(safeNum(armor.nullifyChance, 0));
        if (nullify.success) return { type: 'attack', success: true, damage: 0, nullified: true, hit, nullify };
    }

    let damage = calculatePhysicalDamage(attacker, defender);
    if (guardState && guardState.mode === 'shield') {
        const defendStats = getActorStats(defender);
        const block = probabilityRoll(0.22 + defendStats.def * 0.004);
        if (block.success) {
            damage = Math.max(0, Math.floor(damage * 0.45));
            setCurrentHp(defender, getCurrentHp(defender) - damage);
            return { type: 'attack', success: true, damage, guarded: true, hit, block };
        }
        damage = Math.floor(damage * 1.65);
    }

    setCurrentHp(defender, getCurrentHp(defender) - damage);
    return { type: 'attack', success: true, damage, hit };
}

function resolveMagicAttackAction(attacker, defender, guardState) {
    const cast = probabilityRoll(0.4 + getActorStats(attacker).wis * 0.004);
    if (!cast.success) return { type: 'attack', attackKind: 'magic', success: false, reason: 'miss', hit: cast };
    let damage = calculateMagicDamage(attacker, defender);
    if (guardState && guardState.mode === 'dodge') {
        const dodge = probabilityRoll(0.12 + getActorStats(defender).agi * 0.004);
        if (dodge.success) return { type: 'attack', attackKind: 'magic', success: false, reason: 'dodged', hit: cast, dodge };
    }
    if (guardState && guardState.mode === 'shield') damage = Math.max(0, Math.floor(damage * 0.7));
    setCurrentHp(defender, getCurrentHp(defender) - damage);
    return { type: 'attack', attackKind: 'magic', success: true, damage, hit: cast };
}

function resolveHealAction(actor) {
    const stats = getActorStats(actor);
    const cast = probabilityRoll(0.4 + stats.wis * 0.004);
    if (!cast.success) return { type: 'heal', success: false, reason: 'castFailed', cast };
    const amount = Math.max(1, Math.floor(8 + stats.wis * 1.5));
    const before = getCurrentHp(actor);
    setCurrentHp(actor, before + amount);
    return { type: 'heal', success: true, healed: getCurrentHp(actor) - before, cast };
}

function spendPlayerAction() {
    if (playerTurnSpent) return false;
    playerTurnSpent = true;
    return true;
}

function describeCombatResult(actor, target, result) {
    if (!result) return;
    const actorName = actor === player ? '플레이어' : actor.name;
    if (result.type === 'attack') {
        if (result.reason === 'miss') writeLog(`[빗나감] ${actorName}의 공격 실패`);
        else if (result.reason === 'dodged') writeLog(`[회피] ${target === player ? '플레이어' : target.name}이 공격을 완전히 회피`);
        else if (result.nullified) writeLog(`[무효화] 장비가 ${actorName}의 공격을 완전히 차단`);
        else writeLog(`[공격] ${actorName} → ${result.damage} 피해${result.guarded ? ' (방어 성공)' : ''}`);
        return;
    }
    if (result.type === 'heal') {
        writeLog(result.success ? `[힐] ${actorName} 체력 ${result.healed} 회복` : `[힐 실패] ${actorName}의 마법 실패`);
    }
}

function chooseEnemyAction() {
    const learned = chooseLearnedGhostAction(enemy);
    if (learned) return learned;
    const hpRatio = getCurrentHp(enemy) / actorMaxHp(enemy);
    if (enemy.isBoss) {
        enemy.turnCount = Math.max(1, safeNum(enemy.turnCount, 1));
        if (enemy._bossChargeReady) return 'physical_attack';
        if (enemy.turnCount % 4 === 3) return 'charge';
    }
    if (enemy.archetype === 'hunter' && getCurrentHp(player) / actorMaxHp(player) <= 0.4) return 'physical_attack';
    if (enemy.archetype === 'mage' && hpRatio <= 0.38 && probabilityRoll(0.65).success) return 'defend';
    if (hpRatio <= 0.3 && actorCanHeal(enemy)) return 'heal';
    if (hpRatio <= 0.55 && probabilityRoll(0.25).success) return getActorStats(enemy).agi >= 45 ? 'dodge' : 'defend';
    return hasMagicAttackCapability(enemy) && probabilityRoll(0.25).success ? 'magic_attack' : 'physical_attack';
}

async function enemyTurn() {
    if (!enemy || !player || enemy.curHp <= 0 || player.curHp <= 0) return;
    setCombatProcessing(true);
    await waitMs(300);
    const action = chooseEnemyAction();
    if (action === 'charge') {
        enemy._bossChargeReady = true;
        writeLog(`[적 행동] ${enemy.name} — 강공격 준비`);
    } else if (action === 'heal') {
        const result = resolveHealAction(enemy);
        describeCombatResult(enemy, enemy, result);
        enemyGuardState = null;
    } else if (action === 'defend' || action === 'dodge') {
        enemyGuardState = { mode: action === 'defend' ? 'shield' : 'dodge', turn: combatTurnNumber };
        writeLog(`[적 행동] ${enemy.name} — ${action === 'defend' ? '방어' : '회피'} 준비`);
    } else {
        enemy._attackMultiplier = enemy._bossChargeReady ? 2.5 : 1;
        const result = action === 'magic_attack'
            ? resolveMagicAttackAction(enemy, player, playerGuardState)
            : resolveAttackAction(enemy, player, playerGuardState);
        enemy._attackMultiplier = 1;
        enemy._bossChargeReady = false;
        describeCombatResult(enemy, player, result);
        playerGuardState = null;
    }
    if (enemy.isBoss) enemy.turnCount = Math.max(1, safeNum(enemy.turnCount, 1)) + 1;
    if (player.curHp <= 0) {
        gameOver();
        return;
    }
    combatTurnNumber += 1;
    playerTurnSpent = false;
    setCombatProcessing(false);
    updateUi();
    renderActions();
}

window.useAction = async function useAction(type) {
    if (isProcessing || !player || !enemy || player.curHp <= 0 || enemy.curHp <= 0) return;
    if (!spendPlayerAction()) {
        writeLog('[턴 제한] 한 턴에는 공격/방어/힐 중 하나만 선택할 수 있습니다.');
        return;
    }
    setCombatProcessing(true);
    let result = null;
    if (type === '공격') {
        const learnedAction = classifyPlayerAttackAction(player);
        recordPlayerBehavior(learnedAction);
        result = learnedAction === 'magic_attack'
            ? resolveMagicAttackAction(player, enemy, enemyGuardState)
            : resolveAttackAction(player, enemy, enemyGuardState);
        enemyGuardState = null;
        describeCombatResult(player, enemy, result);
    } else if (type === '힐') {
        recordPlayerBehavior('heal');
        result = resolveHealAction(player);
        describeCombatResult(player, player, result);
    } else {
        const mode = type === '회피' ? 'dodge' : 'shield';
        recordPlayerBehavior(mode === 'dodge' ? 'dodge' : 'defend');
        playerGuardState = { mode, turn: combatTurnNumber };
        writeLog(`[플레이어 행동] ${mode === 'dodge' ? '회피' : '방어'} 준비`);
    }
    updateUi();
    if (enemy.curHp <= 0) {
        await waitMs(120);
        winBattle();
        return;
    }
    await enemyTurn();
};

window.usePotion = function usePotion() {
    if (isProcessing || !player || player.curHp <= 0) return;
    if (!spendPlayerAction()) return writeLog('[턴 제한] 이번 턴의 행동을 이미 사용했습니다.');
    const result = resolveHealAction(player);
    describeCombatResult(player, player, result);
    updateUi();
    enemyTurn();
};

function syncPlayerCampaignState() {
    if (!player || !player.metaSlotId) return;
    ensureHumanRuntimeShape(player);
    player.progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
    MetaRPG.syncRunProgress(player.metaSlotId, {
        stats: player.stats,
        progress: player.progress,
        hp: player.curHp,
        maxHp: player.maxHp,
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
    if (current.stage === STAGES_PER_FLOOR && typeof openShop === 'function') {
        openShop();
        return;
    }
    spawnEnemy();
}

function winBattle() {
    setCombatProcessing(false);
    playerTurnSpent = false;
    playerGuardState = null;
    enemyGuardState = null;
    const reward = computeFloorGoldReward(floor + (dungeonStage - 1) / STAGES_PER_FLOOR, {
        isBoss: dungeonStage === STAGES_PER_FLOOR,
    });
    gold = Math.max(0, safeNum(gold, 0)) + reward;
    if (typeof totalGoldEarned !== 'undefined') totalGoldEarned = Math.max(0, safeNum(totalGoldEarned, 0)) + reward;
    writeLog(`[승리] ${formatDungeonPosition({ floor, stage: dungeonStage })} 전투 종료 · ${reward}G 획득`);
    setCurrentHp(player, Math.min(getEffectiveMaxHp(), player.curHp + Math.max(1, Math.floor(getEffectiveMaxHp() * 0.08))));
    syncPlayerCampaignState();
    const continueForward = () => enterNextDungeonStage();
    if (typeof showVictoryRewardAndAwaitContinue === 'function') {
        showVictoryRewardAndAwaitContinue(
            { clearedFloor: floor, goldGain: reward, expGain: 0, defeatedBoss: dungeonStage === STAGES_PER_FLOOR },
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
    const stats = normalizeHumanStats(slot.stats);
    const maxHp = Math.max(1, safeNum(slot.maxHp, 50 + stats.hp * 5));
    return ensureHumanRuntimeShape({
        id: slot.id,
        metaSlotId: slot.id,
        name: slot.name,
        color: '#d8d8d8',
        stats,
        curHp: Math.min(maxHp, Math.max(1, safeNum(slot.hp, maxHp))),
        maxHp,
        atk: stats.str,
        def: stats.def,
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
        potions: 0,
        baseJob: '인간 모험가',
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
    player = buildRuntimePlayerFromSlot(slot);
    fullResyncPlayerCombatStatsFromMetaAndInventory();
    floor = player.progress.floor;
    dungeonStage = player.progress.stage;
    gold = 0;
    combatTurnNumber = 1;
    playerTurnSpent = false;
    playerGuardState = null;
    enemyGuardState = null;
    document.getElementById('start-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    if (typeof enterBattleLayout === 'function') enterBattleLayout();
    writeLog(
        `[생성] 인간 모험가 주사위 — 힘 ${player.stats.str}, 방어 ${player.stats.def}, 체력 ${player.stats.hp}, ` +
        `지능 ${player.stats.int}, 지혜 ${player.stats.wis}, 민첩 ${player.stats.agi}, 성혼 0, 뒤틀림 0`
    );
    spawnEnemy();
    return true;
}

// 기존 DOM 이벤트가 호출하는 이름을 유지하되 직업 인수는 무시한다.
window.confirmNewCharacter = function confirmNewCharacter() {
    const name = prompt('캐릭터 이름을 입력하세요 (비우면 인간 모험가):', '인간 모험가');
    const result = MetaRPG.createCharacter(name || '인간 모험가');
    if (!result.ok) {
        alert(result.msg || '생성 실패');
        return;
    }
    initHumanRunFromActiveSlot();
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

window.saveAndExitToMain = function saveAndExitToMain() {
    if (!player || !player.metaSlotId) return;
    const progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
    if (!canReturnToBaseCamp(progress)) {
        writeLog(`[복귀 불가] ${formatDungeonPosition(progress)}부터는 베이스캠프로 돌아갈 수 없습니다.`);
        return;
    }
    syncPlayerCampaignState();
    const payload = typeof serializeRunState === 'function' ? serializeRunState() : { player, floor, dungeonStage };
    MetaRPG.setRunSnapshot(player.metaSlotId, payload);
    if (typeof exitBattleLayout === 'function') exitBattleLayout();
    document.getElementById('battle-area').style.display = 'none';
    player = null;
    enemy = null;
    if (typeof showPreGameScreen === 'function') showPreGameScreen();
};

window.exitToMainWithoutSave = function exitToMainWithoutSave() {
    if (!player) return;
    const progress = normalizeDungeonProgress({ floor, stage: dungeonStage });
    if (!canReturnToBaseCamp(progress)) {
        writeLog(`[복귀 불가] ${formatDungeonPosition(progress)}부터는 오직 전진만 가능합니다.`);
        return;
    }
    window.saveAndExitToMain();
};

function installHumanActionButtons() {
    const originalRenderActions = typeof renderActions === 'function' ? renderActions : null;
    if (!originalRenderActions || originalRenderActions.__humanWrapped) return;
    const wrapped = function renderHumanActions() {
        originalRenderActions();
        const host = document.getElementById('action-btns');
        if (!host || !player || !enemy || enemy.curHp <= 0) return;
        const buttons = Array.from(host.querySelectorAll('button'));
        const defense = buttons.find((button) => !button.onclick && button !== buttons[0]);
        if (defense) {
            defense.innerText = player.stats.agi >= 45 ? '💨 회피' : '🛡️ 방어';
            defense.onclick = () => useAction(player.stats.agi >= 45 ? '회피' : '방패방어');
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
        const canReturn = canReturnToBaseCamp(progress);
        ['battle-save-main-btn', 'battle-exit-main-btn'].forEach((id) => {
            const button = document.getElementById(id);
            if (!button) return;
            button.disabled = !canReturn;
            button.title = canReturn
                ? `${formatDungeonPosition(progress)}: 베이스캠프 복귀 가능`
                : `${formatDungeonPosition(progress)}: 6-1층 진입 후 복귀 불가`;
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
    calculateAttackChance,
    calculatePhysicalDamage,
    enemyTurn,
    winBattle,
    gameOver,
    dungeonClear,
    syncPlayerCampaignState,
    enterNextDungeonStage,
    initHumanRunFromActiveSlot,
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
