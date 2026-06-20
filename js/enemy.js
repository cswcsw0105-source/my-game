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
    return {
        hp: Math.max(1, Math.floor(originalHp * 0.75)),
        atk: Math.max(1, Math.floor(originalAtk * 0.75)),
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
    const stats = buildEnemyStatsForFloor(current.floor, isBoss, current.stage);
    const archetypes = [monsterArchetypeTable.warrior, monsterArchetypeTable.hunter, monsterArchetypeTable.mage];
    const archetype = isBoss
        ? monsterArchetypeTable.boss
        : archetypes[Math.floor(Math.random() * archetypes.length)];
    return {
        id: `monster-${current.floor}-${current.stage}-${Date.now().toString(36)}`,
        name: isBoss ? `👑 [보스] ${current.floor}-${current.stage}층 군주` : `[${archetype.job}] ${current.floor}-${current.stage}층 괴수`,
        job: archetype.job,
        archetype: archetype.key,
        element: archetype.element,
        affinity: { strong: archetype.strong, weak: archetype.weak },
        traitTags: Array.from(archetype.traitTags || [archetype.key, archetype.element]),
        hp: stats.hp,
        curHp: stats.hp,
        atk: stats.atk,
        def: stats.def,
        stats: {
            str: stats.str,
            def: Math.min(100, stats.def),
            hp: stats.hpStat,
            int: stats.int,
            wis: stats.wis,
            agi: stats.agi,
            divinity: 0,
            distortion: Math.min(100, current.floor),
        },
        equipment: { weapon: null, armor: null, accessories: [] },
        magic: [],
        skills: [],
        mastery: {},
        statuses: [],
        body: Object.fromEntries(bodyParts.map((part) => [part, { destroyed: false, twisted: false, indestructible: false }])),
        isBoss,
        turnCount: 0,
    };
}

function spawnEnemy() {
    const progress = getCurrentDungeonProgress();
    floor = progress.floor;
    dungeonStage = progress.stage;
    const ghost = typeof MetaRPG !== 'undefined' ? MetaRPG.getGhostEncounter(progress) : null;
    enemy = ghost ? ghostToEnemy(ghost) : createDepthMonster(progress);
    if (typeof writeLog === 'function') {
        writeLog(
            ghost
                ? `[망령] ${formatDungeonPosition(progress)}에 박제된 <b>${enemy.name}</b>이 나타났습니다. 사망 당시의 모든 스펙을 유지합니다.`
                : `[진행] ${formatDungeonPosition(progress)} — ${enemy.name} 출현`
        );
    }
    if (typeof updateUi === 'function') updateUi();
    if (typeof renderActions === 'function') renderActions();
    return enemy;
}

Object.assign(window, {
    getCurrentDungeonProgress,
    buildEnemyStatsForFloor,
    ghostToEnemy,
    createDepthMonster,
    spawnEnemy,
});
