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
// [적 레벨 스케일링] 직업별 주스탯(특화) 정의 — 플레이어 포인트바이 하한선과 동일 체계
const ENEMY_ROLE_MAIN_STATS = Object.freeze({
    tank: ['def', 'hp'],
    knight: ['str', 'agi'],
    mage: ['int', 'wis'],
});
const ENEMY_STAT_KEYS = Object.freeze(['str', 'def', 'hp', 'int', 'wis', 'agi']);
// 초반 압축 스케일링 적용 구간 (이 층 이하는 레벨 기반 저압축 공식 사용)
const ENEMY_COMPRESSED_MAX_FLOOR = 5;

// 층-스테이지를 절대 레벨로 환산. 1-1F = Lv.1, 1-2F = Lv.2, 2-1F = Lv.11 ...
function getEnemyLevelForProgress(progress) {
    const p = normalizeDungeonProgress(progress);
    return Math.max(1, (Math.max(1, p.floor) - 1) * STAGES_PER_FLOOR + Math.max(1, p.stage));
}

function rollIntInclusive(min, max) {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return lo + Math.floor(Math.random() * (hi - lo + 1));
}

// [적 스케일링 압축 / 1층 통곡의 벽 방지]
//  Lv.1  : 주스탯 10~13 · 부스탯 4~7 (단일 스탯 14 이상 스폰 원천 차단) · HP 45~65
//  이후  : 레벨당 완만 증가 — 주스탯 +~0.45 / 부스탯 +~0.25 / HP +~3.2 (한 층=레벨 10 → 층당 주스탯 약 +4.5, HP 약 +32)
function buildLeveledEnemyStatBlock(roleKey, level, isBoss) {
    const lv = Math.max(1, Math.floor(safeNum(level, 1)));
    const mains = ENEMY_ROLE_MAIN_STATS[roleKey] || ENEMY_ROLE_MAIN_STATS.knight;
    const g = lv - 1;
    const mainLo = Math.round(10 + g * 0.42);
    const mainHi = Math.round(13 + g * 0.58);
    const subLo = Math.round(4 + g * 0.22);
    const subHi = Math.round(7 + g * 0.34);
    const hpLo = Math.round(45 + g * 3.0);
    const hpHi = Math.round(65 + g * 4.2);
    const bossStatMul = isBoss ? 1.5 : 1;
    const bossHpMul = isBoss ? 1.8 : 1;
    const stats = { divinity: 0, distortion: Math.min(100, lv) };
    ENEMY_STAT_KEYS.forEach((key) => {
        const isMain = mains.includes(key);
        let value = isMain ? rollIntInclusive(mainLo, mainHi) : rollIntInclusive(subLo, subHi);
        if (lv === 1) value = Math.min(13, value); // 단일 스탯 14 이상 스폰 원천 차단
        value = Math.max(1, Math.round(value * (isMain ? bossStatMul : 1)));
        stats[key] = Math.min(100, value);
    });
    const maxHp = Math.max(1, Math.round(rollIntInclusive(hpLo, hpHi) * bossHpMul));
    return { stats, maxHp, level: lv };
}

// [7대 유효 조합 풀] 고정 [탱·마·기] 편성 폐지. tank/mage/knight 무작위 추첨 후
// 2인 이상 파티는 전원 동일 직업 편성을 금지한다 (플레이어와 동일한 7가지 유효 조합).
function pickEnemyPartyRoles(count) {
    const keys = ['tank', 'mage', 'knight'];
    const n = Math.max(1, Math.floor(safeNum(count, 3)));
    const picked = Array.from({ length: n }, () => keys[Math.floor(Math.random() * keys.length)]);
    if (n >= 2 && picked.every((key) => key === picked[0])) {
        picked[n - 1] = picked[0] === 'tank' ? 'mage' : 'tank';
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
    const role = ENEMY_PARTY_ROLE_DEFS[roleKey] || ENEMY_PARTY_ROLE_DEFS.knight;
    // [적 레벨] 층수 기반 절대 레벨 (1-1F = Lv.1). UI 이름에 "직업 Lv.X" 로 표기된다.
    const level = getEnemyLevelForProgress(current);

    let stats;
    let maxHp;
    if (current.floor <= ENEMY_COMPRESSED_MAX_FLOOR) {
        // [적 스케일링 압축] 초반 5개 층은 레벨 기반 저압축 스탯 공식을 사용한다.
        const block = buildLeveledEnemyStatBlock(role.key, level, isBoss);
        stats = block.stats;
        maxHp = block.maxHp;
    } else {
        // 6층+ : 기존 층수 스케일 파이프라인 유지
        const base = buildEnemyStatsForFloor(current.floor, isBoss, current.stage);
        const strStat = Math.max(1, Math.round(base.atk * role.atkMult * rollEnemyStatJitter()));
        const defStat = Math.max(1, Math.round(Math.max(1, base.def) * role.defMult * rollEnemyStatJitter()));
        const hpStat = Math.max(1, Math.round(Math.max(1, base.hpStat) * role.hpMult * rollEnemyStatJitter()));
        const intStat = Math.max(1, Math.round((role.key === 'mage' ? base.int + 8 : base.int) * rollEnemyStatJitter()));
        const wisStat = Math.max(1, Math.round((role.key === 'mage' ? base.wis + 8 : base.wis) * rollEnemyStatJitter()));
        const agiStat = Math.max(1, Math.round((role.key === 'tank' ? Math.max(1, base.agi - 4) : base.agi) * rollEnemyStatJitter()));
        const hpPerPoint = base.hp / Math.max(1, base.hpStat);
        maxHp = Math.max(1, Math.floor(hpStat * hpPerPoint));
        stats = {
            str: Math.min(100, strStat),
            def: Math.min(100, defStat),
            hp: Math.min(100, hpStat),
            int: Math.min(100, intStat),
            wis: Math.min(100, wisStat),
            agi: Math.min(100, agiStat),
            divinity: 0,
            distortion: Math.min(100, current.floor),
        };
    }
    // 전투 수식 연동: 물리 대미지는 힘, 피격 방어는 방어, 명중/회피는 민첩 스탯이 런타임 값의 원천이다.
    const atk = Math.max(1, safeNum(stats.str, 1));
    const def = Math.max(0, safeNum(stats.def, 0));
    return {
        id: `enemy-${current.floor}-${current.stage}-${index}-${Date.now().toString(36)}`,
        name: `${role.name} Lv.${level}`,
        roleKey: role.key,
        job: role.name,
        level,
        archetype: role.archetype,
        element: 'neutral',
        traitTags: [role.key, 'enemyParty'],
        hp: maxHp,
        maxHp,
        curHp: maxHp,
        atk,
        def,
        stats,
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
    // [7대 조합 풀 추첨] 1-1F 포함 모든 층에서 고정 편성 없이 무작위 추첨한다.
    let roles = pickEnemyPartyRoles(size);
    // 방어적 하한선: 어떤 경로로도 적 파티가 비어 무전투 승리가 나지 않도록 최소 1명을 보장한다.
    if (!Array.isArray(roles) || roles.length === 0) roles = ['knight'];
    const party = roles.map((roleKey, index) => createEnemyPartyMember(current, roleKey, index, isBoss));
    // [스폰 HP 강제 주입] 5대 스탯 기반 maxHp가 계산된 직후, 모든 파티원을 만피 상태로 못박아 0 HP 스폰을 원천 차단한다.
    party.forEach((member) => {
        if (!member) return;
        const memberMaxHp = Math.max(1, Math.floor(safeNum(member.maxHp, member.hp || 1)));
        member.maxHp = memberMaxHp;
        member.hp = memberMaxHp;
        member.curHp = memberMaxHp;
    });
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
    // [스폰 HP 강제 주입] 컨테이너/망령을 포함한 모든 적 개체가 maxHp 계산 직후 만피로 스폰되도록 강제한다.
    if (enemy) {
        if (Array.isArray(enemy.party) && enemy.party.length) {
            enemy.party.forEach((member) => {
                if (!member) return;
                const memberMaxHp = Math.max(1, Math.floor(safeNum(member.maxHp, member.hp || 1)));
                member.maxHp = memberMaxHp;
                member.hp = memberMaxHp;
                member.curHp = memberMaxHp;
            });
            if (typeof syncEnemyPartyAggregateState === 'function') syncEnemyPartyAggregateState(enemy);
        }
        const enemyMaxHp = Math.max(1, Math.floor(safeNum(enemy.maxHp, enemy.hp || 1)));
        enemy.maxHp = enemyMaxHp;
        enemy.hp = enemyMaxHp;
        if (!(safeNum(enemy.curHp, 0) > 0)) enemy.curHp = enemyMaxHp;
    }
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
    getEnemyLevelForProgress,
    buildLeveledEnemyStatBlock,
    pickEnemyPartyRoles,
    getEnemyPartyMembers,
    getLivingEnemyPartyMembers,
    isEnemyPartyMember,
    syncEnemyPartyAggregateState,
    ghostToEnemy,
    createDepthMonster,
    spawnEnemy,
});
