// Player domain module (stage 3 split)
function ensurePlayerSynergyBonuses() {
    if (!player) return;
    if (typeof MetaRPG !== 'undefined' && MetaRPG.computeSynergyBonuses) {
        player._syn = MetaRPG.computeSynergyBonuses(player);
    } else {
        player._syn = { atk: 0, hp: 0, def: 0, acc: 0, crit: 0, critMult: 0, desc: [], progress: [] };
    }
}

function getEffectiveMaxHp() {
    if (!player) return 1;
    ensurePlayerSynergyBonuses();
    return Math.max(1, safeNum(player.maxHp, 1) + safeNum(player._syn && player._syn.hp, 0));
}

function getCritOverflowForMult() {
    if (!player) return 0;
    let raw = safeNum(player.crit, 1) + safeNum(player._relicTempCrit, 0);
    return Math.max(0, raw - CRIT_SOFT_CAP);
}

function getEffectiveCritMult() {
    const base = safeNum(player && player.critMult, 1.8);
    const syn = safeNum(player && player._syn && player._syn.critMult, 0);
    return (base > 0 ? base : 1.8) + syn + getCritOverflowForMult() * CRIT_OVERFLOW_TO_MULT;
}

function applyRebirthPctBonusToPlayer(slot) {
    if (!player || !slot) return;
    const rb = slot.rebirthPctBonus || { atkPct: 0, defPct: 0, critMultPct: 0 };
    const atkPct = Math.max(0, safeNum(rb.atkPct, 0));
    const defPct = Math.max(0, safeNum(rb.defPct, 0));
    const cmPct = Math.max(0, safeNum(rb.critMultPct, 0));
    if (atkPct > 0) player.atk = Math.ceil(player.atk * (1 + atkPct / 100));
    if (defPct > 0) player.def = Math.ceil(player.def * (1 + defPct / 100));
    if (cmPct > 0) player.critMult = Math.ceil(player.critMult * (1 + cmPct / 100));
}

function applyOwnedEquipmentItemBonuses(it) {
    if (!it || it.type === 'merc') return;
    if (it.type === 'rune') {
        if (typeof it.value === 'number' && it.value) {
            player.atk = Math.max(1, safeNum(player.atk, 1) + safeNum(it.value, 0));
        }
        if (typeof it.hpBonus === 'number' && it.hpBonus) {
            const add = safeNum(it.hpBonus, 0);
            player.maxHp = Math.max(1, safeNum(player.maxHp, 1) + add);
            player.curHp = safeNum(player.curHp, 0) + add;
        }
        if (it.def) player.extraDef = safeNum(player.extraDef, 0) + safeNum(it.def, 0);
        if (it.lifesteal) player.lifesteal = safeNum(player.lifesteal, 0) + safeNum(it.lifesteal, 0);
        if (it.critBonus) player.crit = safeNum(player.crit, 1) + safeNum(it.critBonus, 0);
        if (it.critMult) player.critMult = safeNum(player.critMult, 1.8) + safeNum(it.critMult, 0);
        if (it.regenPotion) player.hasRegenPotion = true;
        return;
    }
    if (it.type === 'atk' || it.type === 'ring') {
        player.atk = Math.max(1, safeNum(player.atk, 1) + safeNum(it.value, 0));
    }
    if (it.type === 'hp') {
        const add = safeNum(it.value, 0);
        player.maxHp = Math.max(1, safeNum(player.maxHp, 1) + add);
        player.curHp = safeNum(player.curHp, 0) + add;
    }
    if (it.def) player.extraDef = safeNum(player.extraDef, 0) + safeNum(it.def, 0);
    if (it.lifesteal) player.lifesteal = safeNum(player.lifesteal, 0) + safeNum(it.lifesteal, 0);
    if (it.critBonus) player.crit = safeNum(player.crit, 1) + safeNum(it.critBonus, 0);
    if (it.critMult) player.critMult = safeNum(player.critMult, 1.8) + safeNum(it.critMult, 0);
    if (it.penalty && it.penalty[player.name]) {
        player.acc -= safeNum(it.penalty[player.name], 0);
    }
}

function fullResyncPlayerCombatStatsFromMetaAndInventory() {
    if (!player || typeof MetaRPG === 'undefined' || !player.metaSlotId) return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return;
    MetaRPG.recalcTechBonus(slot);
    const tb = slot.techBonus || { hp: 0, atk: 0, def: 0, acc: 0, crit: 0, critMult: 0 };
    const lb = MetaRPG.getLevelRuntimeBonus(slot.level || 1);
    const rs = slot.rebirthStatBonus || { hp: 0, atk: 0, def: 0, acc: 0 };
    const jk = slot.jobKey;
    const job = jobBase[jk];
    if (!job) return;

    let atk;
    let def;
    let maxHp;
    let acc;
    if (player.evolved) {
        const evols = jobEvolutions[player.baseJob];
        const evol = evols && evols.find((e) => e.name === player.name);
        if (evol) {
            atk = safeNum(evol.bonusAtk, job.atk) + safeNum(rs.atk, 0) + safeNum(tb.atk, 0) + safeNum(lb.atk, 0);
            def = safeNum(evol.bonusDef, job.def) + safeNum(rs.def, 0) + safeNum(tb.def, 0) + safeNum(lb.def, 0);
            maxHp = (evol.bonusHp != null ? evol.bonusHp : job.hp) + safeNum(rs.hp, 0) + safeNum(tb.hp, 0) + safeNum(lb.hp, 0);
            acc = (evol.bonusAcc != null ? evol.bonusAcc : 0) + safeNum(rs.acc, 0) + safeNum(tb.acc, 0) + safeNum(lb.acc, 0);
        } else {
            atk = job.atk + safeNum(rs.atk, 0) + safeNum(tb.atk, 0) + safeNum(lb.atk, 0);
            def = job.def + safeNum(rs.def, 0) + safeNum(tb.def, 0) + safeNum(lb.def, 0);
            maxHp = job.hp + safeNum(rs.hp, 0) + safeNum(tb.hp, 0) + safeNum(lb.hp, 0);
            acc = safeNum(rs.acc, 0) + safeNum(tb.acc, 0) + safeNum(lb.acc, 0);
        }
    } else {
        atk = job.atk + safeNum(rs.atk, 0) + safeNum(tb.atk, 0) + safeNum(lb.atk, 0);
        def = job.def + safeNum(rs.def, 0) + safeNum(tb.def, 0) + safeNum(lb.def, 0);
        maxHp = job.hp + safeNum(rs.hp, 0) + safeNum(tb.hp, 0) + safeNum(lb.hp, 0);
        acc = safeNum(rs.acc, 0) + safeNum(tb.acc, 0) + safeNum(lb.acc, 0);
    }

    player.atk = atk;
    player.def = def;
    player.maxHp = maxHp;
    player.curHp = Math.min(safeNum(player.curHp, maxHp), maxHp);
    player.acc = acc;
    player.crit = 1 + safeNum(tb.crit, 0);
    player.critMult = 1.8 + safeNum(tb.critMult, 0);
    player.lifesteal = 0;
    player.extraDef = 0;
    player.extraAtk = 0;

    applyRebirthPctBonusToPlayer(slot);

    for (const it of player.items || []) {
        applyOwnedEquipmentItemBonuses(it);
    }
    player.hasRegenPotion = !!(player.items || []).some((x) => x && x.regenPotion && x.type !== 'merc');

    recalcPlayerDivineGainMult();
}

function getCritInfo() {
    const rawCrit = safeNum(player && player.crit, 1) + safeNum(player && player._relicTempCrit, 0);
    const valueForCap = rawCrit;
    const isBerserkCrit = false;
    let synC = 0;
    if (player && player._syn && player._syn.crit) synC = safeNum(player._syn.crit, 0);
    const effectiveCrit = Math.min(CRIT_SOFT_CAP, Math.max(0, valueForCap + synC));
    return { rawCrit, effectiveCrit, isBerserkCrit };
}

function getLifestealEffective() {
    const r = safeNum(player && player.lifesteal, 0);
    const priestBonus = player && player.priestBlessed ? 0.1 : 0;
    return Math.min(LIFESTEAL_SOFT_CAP, Math.max(0, r + priestBonus));
}

function getLifestealOverflowAtk() {
    const r = safeNum(player && player.lifesteal, 0);
    if (r <= LIFESTEAL_SOFT_CAP) return 0;
    return Math.floor((r - LIFESTEAL_SOFT_CAP) * 100);
}

function isPriestJob() {
    return player && player.name === '성직자';
}

function isPriestBlessed() {
    return !!(player && player.priestBlessed);
}

function isChosenPriest() {
    return !!(player && player.chosenPriest);
}

function formatDivinePowerForDisplay(v) {
    const x = safeNum(v, 0);
    const i = Math.floor(x);
    const frac = x - i;
    if (frac >= 0.1 && frac <= 0.4) return i;
    if (frac >= 0.5 && frac <= 0.9) return i + 1;
    if (frac > 0.4 && frac < 0.5) return Math.round(x);
    return i;
}

function getDivineAtkBonus() {
    if (!isPriestJob()) return 0;
    if (isChosenPriest()) return 200;
    if (isPriestBlessed()) return -50;
    return 0;
}

function getDivineDefBonus() {
    if (!isPriestJob()) return 0;
    if (isPriestBlessed() || isChosenPriest()) return 100;
    return 0;
}

function recalcPlayerDivineGainMult() {
    if (!player || !isPriestJob()) {
        if (player) {
            player.divineGainMult = 1;
            player.prayerBonusFlat = 0;
        }
        return;
    }
    let m = 1;
    let p = 0;
    for (const it of player.items || []) {
        if (it && it.divinityGainBonus != null) m += safeNum(it.divinityGainBonus, 0);
        if (it && it.prayerBonus != null) p += safeNum(it.prayerBonus, 0);
    }
    player.divineGainMult = m;
    player.prayerBonusFlat = Math.max(0, p);
}

function addDivinePower(amount) {
    if (!isPriestJob()) return 0;
    const before = safeNum(player.divinePower, 0);
    const after = Math.max(0, Math.min(200, before + safeNum(amount, 0)));
    player.divinePower = after;
    if (!player.priestBlessed && after >= 30) {
        player.priestBlessed = true;
        player.priestNextCrit = true;
        writeLog('[신성] ✨ 30스택 달성! <b>신의 가호</b> (흡혈+10%, 방어+100, 다음 공격 확정 치명, 공격-50)');
    }
    if (!player.chosenPriest && after >= 200) {
        player.chosenPriest = true;
        player.priestNextCrit = true;
        writeLog('[신성] 👑 200스택 달성! <b>선택받은 성직자</b> (공격+200, 방어무시 20%, 기도 불가)');
    }
    return after - before;
}

function getEffectiveAttackPower() {
    if (!player) return 0;
    let base = safeNum(player.atk, 0) + safeNum(player.extraAtk, 0) + getLifestealOverflowAtk();
    if (player._syn && player._syn.atk) base += safeNum(player._syn.atk, 0);
    if (player._mercBattleAtkDebuff) base = Math.max(1, Math.floor(base * (1 + player._mercBattleAtkDebuff)));
    base += getDivineAtkBonus();
    return Math.max(1, base);
}

function getTotalPlayerDefenseForHit() {
    if (!player) return 0;
    let d =
        safeNum(player.def, 0) +
        safeNum(player.extraDef, 0) +
        safeNum(player._syn && player._syn.def, 0) +
        getDivineDefBonus();
    d -= safeNum(player._relicGamblerDefSub, 0);
    return Math.max(0, d);
}

window.ensurePlayerSynergyBonuses = ensurePlayerSynergyBonuses;
window.getEffectiveMaxHp = getEffectiveMaxHp;
window.getCritOverflowForMult = getCritOverflowForMult;
window.getEffectiveCritMult = getEffectiveCritMult;
window.applyRebirthPctBonusToPlayer = applyRebirthPctBonusToPlayer;
window.applyOwnedEquipmentItemBonuses = applyOwnedEquipmentItemBonuses;
window.fullResyncPlayerCombatStatsFromMetaAndInventory = fullResyncPlayerCombatStatsFromMetaAndInventory;
window.getCritInfo = getCritInfo;
window.getLifestealEffective = getLifestealEffective;
window.getLifestealOverflowAtk = getLifestealOverflowAtk;
window.isPriestJob = isPriestJob;
window.isPriestBlessed = isPriestBlessed;
window.isChosenPriest = isChosenPriest;
window.formatDivinePowerForDisplay = formatDivinePowerForDisplay;
window.getDivineAtkBonus = getDivineAtkBonus;
window.getDivineDefBonus = getDivineDefBonus;
window.recalcPlayerDivineGainMult = recalcPlayerDivineGainMult;
window.addDivinePower = addDivinePower;
window.getEffectiveAttackPower = getEffectiveAttackPower;
window.getTotalPlayerDefenseForHit = getTotalPlayerDefenseForHit;

function sumRuneBonuses(field) {
    if (!player || !Array.isArray(player.items)) return 0;
    let s = 0;
    for (const it of player.items) {
        if (it && it.type === 'rune' && typeof it[field] === 'number') s += safeNum(it[field], 0);
    }
    return s;
}

function getPlayerGoldGainMult() {
    return 1 + sumRuneBonuses('goldGainBonus');
}

/** 패닉 도주 시 층 하락 완화 확률(합산, 상한 55%) */
function getPlayerFleeBonus() {
    return Math.min(0.55, sumRuneBonuses('fleeBonus'));
}

window.getPlayerGoldGainMult = getPlayerGoldGainMult;
window.getPlayerFleeBonus = getPlayerFleeBonus;
