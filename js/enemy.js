// Enemy domain module (stage 3 split)
function spawnEnemy() {
    setCombatProcessing(false);
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
        let bossHp,bossAtk,bossDef;
        const _BH = 1.48, _BA = 1.52;
        if(floor<=10){bossHp=200+floor*20;bossAtk=12+floor*3;bossDef=3+Math.floor(floor/3);}
        else if(floor<=30){bossHp=400+floor*30;bossAtk=20+floor*5;bossDef=8+Math.floor(floor/2);}
        else if(floor<=60){bossHp=800+floor*40;bossAtk=35+floor*7;bossDef=15+Math.floor(floor/2);}
        else{bossHp=1500+floor*55;bossAtk=60+floor*10;bossDef=25+Math.floor(floor/2);}
        bossHp = Math.floor(bossHp * _BH);
        bossAtk = Math.floor(bossAtk * _BA);
        bossDef = Math.max(0, Math.floor(bossDef * 1.12));
        enemy={name:`👑 [보스] ${floor}층 군주`,job:'보스',hp:bossHp,curHp:bossHp,atk:bossAtk,def:bossDef,isBoss:true,turnCount:1,bossCharge:false,weakPoint:false,_aiGuardedTurns:0,_hunterEvasionTurns:0};
        writeLog(`🚨 경고: ${floor}층의 지배자가 나타났습니다!`);
    } else {
        const eJobs=['워리어','헌터','마법사'];
        let rj=eJobs[Math.floor(Math.random()*eJobs.length)];
        if(rj===lastEnemyJob) rj=eJobs[Math.floor(Math.random()*eJobs.length)];
        lastEnemyJob=rj;
        let mh,ma,md;
        const _MH = 1.46, _MA = 1.5;
        if(floor<=10){mh=30+floor*8;ma=5+floor*1.5;md=Math.floor(floor/4);}
        else if(floor<=30){mh=100+floor*15;ma=18+floor*3;md=4+Math.floor(floor/3);}
        else if(floor<=60){mh=300+floor*22;ma=35+floor*5;md=10+Math.floor(floor/2);}
        else{mh=700+floor*30;ma=65+floor*8;md=20+Math.floor(floor/2);}
        mh = Math.floor(mh * _MH);
        ma = Math.floor(ma * _MA);
        md = Math.max(0, Math.floor(md * 1.1));
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
