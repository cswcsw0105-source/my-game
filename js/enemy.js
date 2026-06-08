// Enemy domain module (stage 3 split)
function getEnemyScalingForFloor(floorValue) {
    const f = Math.max(1, Math.floor(safeNum(floorValue, 1)));
    const wallFloor = BALANCE.enemyWallFloor || 30;
    const preFloors = Math.max(0, Math.min(f - 1, wallFloor - 1));
    const postFloors = Math.max(0, f - wallFloor);
    const pre = Math.pow(BALANCE.enemyPreWallGrowth || 1.055, preFloors);
    const post = Math.pow(BALANCE.enemyPostWallGrowth || 1.065, postFloors);
    const wall = f >= wallFloor;
    return {
        hp: pre * post * (wall ? BALANCE.enemyWallHpMult || 2.2 : 1),
        atk: pre * post * (wall ? BALANCE.enemyWallAtkMult || 2.0 : 1),
        def: Math.pow((BALANCE.enemyPreWallGrowth || 1.055) - 0.012, preFloors) *
            Math.pow((BALANCE.enemyPostWallGrowth || 1.065) - 0.007, postFloors) *
            (wall ? BALANCE.enemyWallDefMult || 2.1 : 1),
    };
}

function buildEnemyStatsForFloor(floorValue, isBoss) {
    const f = Math.max(1, Math.floor(safeNum(floorValue, 1)));
    const s = getEnemyScalingForFloor(f);
    const wave = 1 + ((f % 5) - 2) * 0.025;
    const boss = isBoss ? { hp: 2.65, atk: 1.72, def: 1.65 } : { hp: 1, atk: 1, def: 1 };
    return {
        hp: Math.max(1, Math.floor((44 + f * 4.5) * s.hp * boss.hp * wave)),
        atk: Math.max(1, Math.floor((6 + f * 0.55) * s.atk * boss.atk * wave)),
        def: Math.max(0, Math.floor((1 + f * 0.22) * s.def * boss.def)),
    };
}

function spawnEnemy() {
    setCombatProcessing(false);
    window._victoryState = null;
    window._victoryContinueFn = null;
    if (pendingShop) { pendingShop=false; return openShop(); }
    window._encounterPhaseActive = false;
    hideEncounterPhaseUI();
    defendingTurns=0; dodgingTurns=0; shieldedTurns=0;
    regenTurns=0; regenAmount=0; potionUsedThisTurn=false;
    if (player) { player.mercRegenTurns = 0; player.mercRegenAmount = 0; }

    if (player && player.mercNextBattleDebuff && typeof player.mercNextBattleDebuff.atkPct === 'number') {
        player._mercBattleAtkDebuff = player.mercNextBattleDebuff.atkPct;
    } else if (player) {
        player._mercBattleAtkDebuff = 0;
    }
    if (player) player.mercNextBattleDebuff = null;

    if (player) {
        player._relicTempCrit = 0;
        player.extraAtk = 0;
        player._relicGamblerDefSub = 0;
        player.tacticalSkillUses = {};
        player.tacticalFocusReady = false;
        player.tacticalParryReady = false;
        player.tacticalBarrierReady = false;
    }
    if (player && player.relics && player.relics.includes('gambler')) {
        const pa = safeNum(player.atk, 0);
        const totalDefBase = safeNum(player.def, 0) + safeNum(player.extraDef, 0);
        const r = Math.random();
        if (r < 1 / 3) {
            player.extraAtk = Math.floor(pa * 0.22);
            writeLog(`[유물] 🎲 도박사의 주사위: 공격력 +22% (이번 전투)`);
        } else if (r < 2 / 3) {
            player._relicTempCrit = 18;
            writeLog(`[유물] 🎲 도박사의 주사위: 치명타 확률 +18% (이번 전투)`);
        } else {
            player.extraAtk = -Math.max(1, Math.floor(pa * 0.12));
            player._relicGamblerDefSub = Math.max(4, Math.floor(totalDefBase * 0.1));
            player._relicTempCrit = -12;
            writeLog(
                `[유물] 🎲 도박사의 주사위: 불길한 눈! 공격·방어·치명 약화 (이번 전투만, 공격 약 -12%·방어 -${player._relicGamblerDefSub}·치명 -12%)`
            );
        }
    }

    if (floor%10===0) {
        const stats = buildEnemyStatsForFloor(floor, true);
        const bossHp = stats.hp;
        const bossAtk = stats.atk;
        const bossDef = stats.def;
        if (floor === 100 && typeof emitFinalBossOpeningStory === 'function') emitFinalBossOpeningStory();
        enemy={name:floor === 100 ? '👑 [최종보스] 배신한 조력자' : `👑 [보스] ${floor}층 군주`,job:'보스',hp:bossHp,curHp:bossHp,atk:bossAtk,def:bossDef,isBoss:true,turnCount:1,bossCharge:false,weakPoint:false,_aiGuardedTurns:0,_hunterEvasionTurns:0};
        writeLog(floor === 100 ? '🚨 최종전: 배신한 조력자가 본모습을 드러냈습니다!' : `🚨 경고: ${floor}층의 지배자가 나타났습니다!`);
    } else {
        const eJobs=['워리어','헌터','마법사'];
        let rj=eJobs[Math.floor(Math.random()*eJobs.length)];
        if(rj===lastEnemyJob) rj=eJobs[Math.floor(Math.random()*eJobs.length)];
        lastEnemyJob=rj;
        const stats = buildEnemyStatsForFloor(floor, false);
        let mh = stats.hp;
        let ma = stats.atk;
        let md = stats.def;
        enemy={name:`[${rj}형] ${floor}층 괴수`,job:rj,hp:Math.floor(mh),curHp:Math.floor(mh),atk:Math.floor(ma),def:Math.floor(md),isBoss:false,weakPoint:false,_aiGuardedTurns:0,_hunterEvasionTurns:0};
    }
    if (enemy && window._pendingEncounterCombatMod) {
        const mod = window._pendingEncounterCombatMod;
        if (typeof mod.enemyHpMul === 'number' && mod.enemyHpMul > 0) {
            enemy.curHp = Math.max(1, Math.floor(safeNum(enemy.curHp, 1) * mod.enemyHpMul));
        }
        window._pendingEncounterCombatMod = null;
    }
    if (isMercenaryCaptainJob() && player.mercCompanionKind && !player.fieldMerc && player.mercCooldownTurns <= 0) {
        player.fieldMerc = buildFieldMercFromTemplate();
        const ratio = player.mercReviveAt90Percent ? 0.9 : 1;
        player.fieldMerc.mercHp = Math.max(1, Math.floor(player.fieldMerc.mercMaxHp * ratio));
        const hpNote = ratio < 1 ? ' · 부상 복귀 90%' : ' · 만전';
        writeLog(
            `[용병] 동료 <b>${player.fieldMerc.sourceName}</b> 전개! 상성: <b>${player.fieldMerc.mercAffinityJob}</b>${hpNote} (${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp})`
        );
        player.mercReviveAt90Percent = false;
    }
    if (player) player._playerMissStreak = 0;
    tryActivateFloorQuest();
    player._awaitPlayerTurn = true;
    updateUi(); renderActions();
}

function tryActivateFloorQuest() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const qdef = MetaRPG.FLOOR_QUESTS[floor];
    if (!qdef) {
        player.activeQuest = null;
        return;
    }
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (slot && slot.questFlags && slot.questFlags[qdef.id]) {
        player.activeQuest = null;
        return;
    }
    player.activeQuest = { id: qdef.id, title: qdef.title };
    player._questWins = 0;
    writeLog(`[특수 퀘스트] <b>${qdef.title}</b> — ${qdef.desc}`);
}

window.spawnEnemy = spawnEnemy;
window.tryActivateFloorQuest = tryActivateFloorQuest;
window.getEnemyScalingForFloor = getEnemyScalingForFloor;
window.buildEnemyStatsForFloor = buildEnemyStatsForFloor;
