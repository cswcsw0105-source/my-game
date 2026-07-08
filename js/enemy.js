'use strict';

function getCurrentDungeonProgress() {
    if (player && player.progress) return normalizeDungeonProgress(player.progress);
    return normalizeDungeonProgress({ floor, stage: dungeonStage });
}

function buildEnemyStatsForFloor(floorRef, isBoss, stageRef) {
    const majorFloor = Math.max(1, Math.min(MAX_DUNGEON_FLOOR, Math.floor(safeNum(floorRef, 1))));
    const stage = Math.max(1, Math.min(STAGES_PER_FLOOR, Math.floor(safeNum(stageRef, 1))));
    const effectiveFloor = majorFloor + (stage - 1) / STAGES_PER_FLOOR;
    const wallFloor = BALANCE.enemyWallFloor || 30;
    const preFloors = Math.max(0, Math.min(effectiveFloor - 1, wallFloor - 1));
    const postFloors = Math.max(0, effectiveFloor - wallFloor);
    const pre = Math.pow(BALANCE.enemyPreWallGrowth || 1.058, preFloors);
    const post = Math.pow(BALANCE.enemyPostWallGrowth || 1.067, postFloors);
    const wall = effectiveFloor >= wallFloor;
    const hpScale = pre * post * (wall ? BALANCE.enemyWallHpMult || 1.5 : 1);
    const atkScale = pre * post * (wall ? BALANCE.enemyWallAtkMult || 1.35 : 1);
    const defScale =
        Math.pow((BALANCE.enemyPreWallGrowth || 1.058) - 0.012, preFloors) *
        Math.pow((BALANCE.enemyPostWallGrowth || 1.067) - 0.007, postFloors) *
        (wall ? BALANCE.enemyWallDefMult || 2.18 : 1);
    const wave = 1 + ((stage - 1) - 4.5) * 0.008;
    const boss = isBoss ? { hp: 2.65, atk: 1.72, def: 1.65 } : { hp: 1, atk: 1, def: 1 };
    const originalHp = Math.max(1, Math.floor((44 + effectiveFloor * 4.5) * hpScale * boss.hp * wave));
    const originalAtk = Math.max(1, Math.floor((6 + effectiveFloor * 0.55) * atkScale * boss.atk * wave));
    const originalDef = Math.max(0, Math.floor((1 + effectiveFloor * 0.22) * defScale * boss.def));
    const earlyPartyZone = majorFloor <= 5;
    const partyHpScale = earlyPartyZone ? 7.0 : 1;
    const partyAtkScale = earlyPartyZone ? 6.5 : 1;
    return {
        hp: Math.max(1, Math.floor(originalHp * 0.75 * partyHpScale)),
        atk: Math.max(1, Math.floor(originalAtk * 0.75 * partyAtkScale)),
        def: originalDef,
        originalHp,
        originalAtk,
        str: Math.min(100, Math.max(1, originalAtk)),
        hpStat: Math.min(100, Math.max(1, Math.round((originalHp - 50) / 5))),
        int: Math.min(100, Math.max(1, Math.floor(5 + effectiveFloor * 0.4))),
        wis: Math.min(100, Math.max(1, Math.floor(5 + effectiveFloor * 0.38))),
        agi: Math.min(100, Math.max(1, Math.floor(8 + effectiveFloor * 0.5))),
    };
}

const ENEMY_PARTY_ROLE_DEFS = Object.freeze({
    tank: Object.freeze({ key: 'tank', name: '탱커', archetype: 'tank', hpMult: 1.35, atkMult: 0.86, defMult: 1.55, aggroWeight: 5 }),
    mage: Object.freeze({ key: 'mage', name: '마법사', archetype: 'mage', hpMult: 0.86, atkMult: 1.22, defMult: 0.82, aggroWeight: 1 }),
    knight: Object.freeze({ key: 'knight', name: '기사', archetype: 'knight', hpMult: 1.04, atkMult: 1.04, defMult: 1.08, aggroWeight: 2 }),
});
const EARLY_NORMAL_ENEMY_STAT_MULT = 0.65;

function pickEnemyPartyRoles(count) {
    const keys = ['tank', 'mage', 'knight'];
    const picked = [];
    const counts = {};
    while (picked.length < count) {
        const available = keys.filter((key) => (counts[key] || 0) < 2);
        const key = available[Math.floor(Math.random() * available.length)] || 'knight';
        picked.push(key);
        counts[key] = (counts[key] || 0) + 1;
    }
    if (count >= 3 && Object.keys(counts).length === 1) {
        picked[2] = picked[0] === 'tank' ? 'mage' : 'tank';
    }
    return picked;
}

function getEnemyPartySize(progress, isBoss) {
    const current = normalizeDungeonProgress(progress);
    if (isBoss) return 3;
    // [던전 생성기 수리] 1-1 스타터 전투는 무전투 승리 버그 방지를 위해 최소 편성을 강제한다.
    if (current.floor === 1 && current.stage === 1) return 3;
    if (current.floor <= 2) return 3;
    if (current.floor <= 5) return Math.random() < 0.7 ? 3 : 2;
    return 1 + Math.floor(Math.random() * 3);
}

// [적 스탯 오버홀] 층수 난이도 스케일 안에서 스탯이 지극히 랜덤하게 균형을 맞추도록 하는 지터(0.85~1.15배)
function rollEnemyStatJitter() {
    return 0.85 + Math.random() * 0.3;
}

function createEnemyPartyMember(progress, roleKey, index, isBoss) {
    const current = normalizeDungeonProgress(progress);
    const base = buildEnemyStatsForFloor(current.floor, isBoss, current.stage);
    const role = ENEMY_PARTY_ROLE_DEFS[roleKey] || ENEMY_PARTY_ROLE_DEFS.knight;
    const earlyNormalNerf = !isBoss && current.floor >= 1 && current.floor <= 5 ? EARLY_NORMAL_ENEMY_STAT_MULT : 1;
    // [적 스탯 오버홀] 아군과 동일 체계의 5대 스탯 [힘/방어/체력/지능/민첩]을
    // 층수 스케일링 기반으로 랜덤 생성한다. (★마법 계열 '지혜' 스탯은 적 데이터에서 완전히 제외)
    const strStat = Math.max(1, Math.round(base.atk * role.atkMult * earlyNormalNerf * rollEnemyStatJitter()));
    const defStat = Math.max(1, Math.round(Math.max(1, base.def) * role.defMult * rollEnemyStatJitter()));
    const hpStat = Math.max(1, Math.round(Math.max(1, base.hpStat) * role.hpMult * rollEnemyStatJitter()));
    const intStat = Math.max(1, Math.round((role.key === 'mage' ? base.int + 8 : base.int) * rollEnemyStatJitter()));
    const agiStat = Math.max(1, Math.round((role.key === 'tank' ? Math.max(1, base.agi - 4) : base.agi) * rollEnemyStatJitter()));
    // 최대 HP는 생성된 [체력] 스탯과 정비례한다. (층수 스케일 HP 총량을 체력 1포인트당 가치로 환산)
    const hpPerPoint = (base.hp * earlyNormalNerf) / Math.max(1, base.hpStat);
    const maxHp = Math.max(1, Math.floor(hpStat * hpPerPoint));
    // 전투 수식 연동: 물리 대미지는 힘, 피격 방어는 방어, 명중/회피는 민첩 스탯이 런타임 값의 원천이다.
    const atk = strStat;
    const def = defStat;
    return {
        id: `enemy-${current.floor}-${current.stage}-${index}-${Date.now().toString(36)}`,
        name: `${role.name} ${index + 1}`,
        roleKey: role.key,
        job: role.name,
        archetype: role.archetype,
        element: 'neutral',
        traitTags: [role.key, 'enemyParty'],
        hp: maxHp,
        maxHp,
        curHp: maxHp,
        atk,
        def,
        stats: {
            str: Math.min(100, strStat),
            def: Math.min(100, defStat),
            hp: Math.min(100, hpStat),
            int: Math.min(100, intStat),
            agi: Math.min(100, agiStat),
            divinity: 0,
            distortion: Math.min(100, current.floor),
        },
        equipment: { weapon: null, armor: null, accessories: [] },
        magic: role.key === 'mage' ? ['fire', 'heal'] : [],
        skills: [],
        mastery: {},
        statuses: [],
        body: Object.fromEntries(bodyParts.map((part) => [part, { destroyed: false, twisted: false, indestructible: false }])),
        turnCount: 0,
    };
}

function getEnemyPartyMembers(actor) {
    if (!actor || !Array.isArray(actor.party)) return actor ? [actor] : [];
    return actor.party.filter(Boolean);
}

function getLivingEnemyPartyMembers(actor) {
    return getEnemyPartyMembers(actor).filter((member) => safeNum(member.curHp, 0) > 0);
}

function isEnemyPartyMember(actor) {
    return !!(enemy && Array.isArray(enemy.party) && enemy.party.includes(actor));
}

function syncEnemyPartyAggregateState(actor) {
    if (!actor || !Array.isArray(actor.party)) return actor;
    const members = getEnemyPartyMembers(actor);
    actor.hp = members.reduce((sum, member) => sum + Math.max(1, safeNum(member.maxHp, member.hp || 1)), 0);
    actor.maxHp = actor.hp;
    actor.curHp = members.reduce((sum, member) => sum + Math.max(0, safeNum(member.curHp, 0)), 0);
    actor.atk = members.reduce((sum, member) => sum + Math.max(0, safeNum(member.atk, 0)), 0);
    actor.def = members.length
        ? Math.round(members.reduce((sum, member) => sum + Math.max(0, safeNum(member.def, 0)), 0) / members.length)
        : 0;
    return actor;
}

function ghostToEnemy(ghost) {
    const stats = normalizeHumanStats(ghost.stats);
    const fullSpec = JSON.parse(JSON.stringify(ghost.fullSpec || {}));
    return {
        ...fullSpec,
        id: ghost.ghostId,
        ghostId: ghost.ghostId,
        isPlayerGhost: true,
        name: ghost.monsterName,
        job: '망령',
        hp: ghost.maxHp,
        curHp: ghost.maxHp,
        atk: Math.max(1, safeNum(fullSpec.atk, stats.str)),
        def: Math.max(0, safeNum(fullSpec.def, stats.def)),
        extraDef: Math.max(0, safeNum(fullSpec.extraDef, 0)),
        stats,
        equipment: JSON.parse(JSON.stringify(ghost.equipment || {})),
        magic: JSON.parse(JSON.stringify(ghost.magic || [])),
        skills: JSON.parse(JSON.stringify(ghost.skills || [])),
        mastery: JSON.parse(JSON.stringify(ghost.mastery || {})),
        statuses: JSON.parse(JSON.stringify(ghost.statuses || [])),
        body: JSON.parse(JSON.stringify(ghost.body || {})),
        items: JSON.parse(JSON.stringify(ghost.items || [])),
        relics: JSON.parse(JSON.stringify(ghost.relics || [])),
        behaviorLogger: JSON.parse(JSON.stringify(ghost.behaviorLogger || [])),
        behaviorMatrix: ghost.behaviorMatrix ? JSON.parse(JSON.stringify(ghost.behaviorMatrix)) : null,
        sourceSnapshot: JSON.parse(JSON.stringify(ghost)),
        isBoss: false,
        turnCount: 0,
    };
}

function createDepthMonster(progress) {
    const current = normalizeDungeonProgress(progress);
    const isBoss = current.stage === STAGES_PER_FLOOR;
    const size = getEnemyPartySize(current, isBoss);
    let roles = pickEnemyPartyRoles(size);
    // [던전 생성기 수리] 1-1 스타터 몹은 기사 1 · 탱커 1을 반드시 포함하도록 하드코딩 편성한다.
    if (current.floor === 1 && current.stage === 1) {
        roles = ['knight', 'tank', 'knight'];
    }
    // 방어적 하한선: 어떤 경로로도 적 파티가 비어 무전투 승리가 나지 않도록 최소 1명을 보장한다.
    if (!Array.isArray(roles) || roles.length === 0) roles = ['knight'];
    const party = roles.map((roleKey, index) => createEnemyPartyMember(current, roleKey, index, isBoss));
    const container = {
        id: `enemy-party-${current.floor}-${current.stage}-${Date.now().toString(36)}`,
        name: isBoss ? `👑 ${current.floor}-${current.stage}층 적 파티` : `${current.floor}-${current.stage}층 적 파티`,
        job: '적 파티',
        archetype: 'enemyParty',
        element: 'neutral',
        traitTags: ['enemyParty'],
        party,
        isBoss,
        isEnemyParty: true,
        turnCount: 0,
    };
    return syncEnemyPartyAggregateState(container);
}

function spawnEnemy() {
    const progress = getCurrentDungeonProgress();
    floor = progress.floor;
    dungeonStage = progress.stage;
    const ghost = typeof MetaRPG !== 'undefined' ? MetaRPG.getGhostEncounter(progress) : null;
    enemy = ghost ? ghostToEnemy(ghost) : createDepthMonster(progress);
    // [무전투 보상 차단] 스폰 순간 살아있는 적 수를 기록해 두고, 실제 전투가 성립한 경우에만 보상을 허용한다.
    const spawnLivingEnemies = typeof getLivingEnemyPartyMembers === 'function'
        ? getLivingEnemyPartyMembers(enemy)
        : (enemy && safeNum(enemy.curHp, 0) > 0 ? [enemy] : []);
    enemy._spawnLivingCount = spawnLivingEnemies.length;
    enemy._battleRewardEligible = spawnLivingEnemies.length > 0;
    if (typeof resetInitiativeTimeline === 'function') resetInitiativeTimeline();
    if (typeof writeLog === 'function') {
        const partyInfo = !ghost && enemy && Array.isArray(enemy.party)
            ? ` (${enemy.party.map((member) => member.job).join(' · ')})`
            : '';
        writeLog(
            ghost
                ? `[망령] ${formatDungeonPosition(progress)}에 박제된 <b>${enemy.name}</b>이 나타났습니다. 사망 당시의 모든 스펙을 유지합니다.`
                : `[진행] ${formatDungeonPosition(progress)} — ${enemy.name}${partyInfo} 출현`
        );
    }
    if (typeof updateUi === 'function') updateUi();
    if (typeof renderActions === 'function') renderActions();
    if (typeof startInitiativeTurnLoop === 'function') setTimeout(() => startInitiativeTurnLoop(), 0);
    return enemy;
}

Object.assign(window, {
    getCurrentDungeonProgress,
    buildEnemyStatsForFloor,
    getEnemyPartyMembers,
    getLivingEnemyPartyMembers,
    isEnemyPartyMember,
    syncEnemyPartyAggregateState,
    ghostToEnemy,
    createDepthMonster,
    spawnEnemy,
});
