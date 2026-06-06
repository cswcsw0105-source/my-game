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

function getRawCritChance(extraCrit) {
    if (!player) return Math.max(0, safeNum(extraCrit, 0));
    ensurePlayerSynergyBonuses();
    return Math.max(
        0,
        safeNum(player.crit, 1) +
            safeNum(player._relicTempCrit, 0) +
            safeNum(player._syn && player._syn.crit, 0) +
            safeNum(extraCrit, 0)
    );
}

function getCritOverflowForMult(extraCrit) {
    return Math.max(0, getRawCritChance(extraCrit) - CRIT_SOFT_CAP);
}

function getCritOverflowMultBonus(extraCrit) {
    return getCritOverflowForMult(extraCrit) * CRIT_OVERFLOW_TO_MULT;
}

function clampCritMultiplier(value) {
    return Math.min(CRIT_MULT_HARD_CAP, Math.max(1, safeNum(value, 1.8)));
}

function getCritBaseMultBeforeOverflow(extraMult) {
    if (player) ensurePlayerSynergyBonuses();
    const base = safeNum(player && player.critMult, 1.8);
    const syn = safeNum(player && player._syn && player._syn.critMult, 0);
    return (base > 0 ? base : 1.8) + syn + safeNum(extraMult, 0);
}

function getEffectiveCritMult() {
    return clampCritMultiplier(getCritBaseMultBeforeOverflow(0) + getCritOverflowMultBonus(0));
}

function applyRebirthPctBonusToPlayer(slot) {
    if (!player || !slot) return;
    const rb = slot.rebirthPctBonus || { atkPct: 0, defPct: 0, critMultPct: 0 };
    const atkPct = Math.max(0, safeNum(rb.atkPct, 0));
    const defPct = Math.max(0, safeNum(rb.defPct, 0));
    const cmPct = Math.max(0, safeNum(rb.critMultPct, 0));
    if (atkPct > 0) player.atk = Math.ceil(player.atk * (1 + atkPct / 100));
    if (defPct > 0) player.def = Math.ceil(player.def * (1 + defPct / 100));
    if (cmPct > 0) player.critMult = safeNum((player.critMult * (1 + cmPct / 100)).toFixed(4), player.critMult);
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

    const fg = typeof normalizeFloorGrowth === 'function'
        ? normalizeFloorGrowth(player.floorGrowth || slot.floorGrowth)
        : {
              floors: Math.max(0, Math.floor(safeNum(player.floorGrowth && player.floorGrowth.floors, 0))),
              atk: Math.max(0, Math.floor(safeNum(player.floorGrowth && player.floorGrowth.atk, 0))),
              hp: Math.max(0, Math.floor(safeNum(player.floorGrowth && player.floorGrowth.hp, 0))),
          };
    player.floorGrowth = fg;
    atk += fg.atk;
    maxHp += fg.hp;

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
    const rawCrit = getRawCritChance(0);
    const isBerserkCrit = false;
    const effectiveCrit = Math.min(CRIT_SOFT_CAP, rawCrit);
    return { rawCrit, effectiveCrit, isBerserkCrit };
}

function getLifestealEffective() {
    const r = safeNum(player && player.lifesteal, 0);
    const priestBonus = player && player.priestBlessed ? DIVINE_BLESSING_LIFESTEAL_BONUS : 0;
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
    const x = clampDivinePower(v);
    const i = Math.floor(x);
    const frac = x - i;
    if (frac >= 0.1 && frac <= 0.4) return i;
    if (frac >= 0.5 && frac <= 0.9) return i + 1;
    if (frac > 0.4 && frac < 0.5) return Math.round(x);
    return i;
}

function clampDivinePower(v) {
    return Math.max(0, Math.min(DIVINE_POWER_MAX, safeNum(v, 0)));
}

function normalizeDivineState() {
    if (!player) return;
    if (!isPriestJob()) {
        player.divinePower = 0;
        player.divineGainMult = 1;
        player.prayerBonusFlat = 0;
        player.priestBlessed = false;
        player.chosenPriest = false;
        player.priestNextCrit = false;
        return;
    }
    player.divinePower = clampDivinePower(player.divinePower);
    const blessed = player.divinePower >= DIVINE_BLESSING_THRESHOLD;
    player.priestBlessed = blessed;
    player.chosenPriest = false;
    if (!blessed) player.priestNextCrit = false;
}

function getDivineAtkBonus() {
    if (!isPriestJob()) return 0;
    return 0;
}

function getDivineDefBonus() {
    if (!isPriestJob()) return 0;
    return isPriestBlessed() ? DIVINE_BLESSING_DEF_BONUS : 0;
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
    normalizeDivineState();
}

function addDivinePower(amount) {
    if (!isPriestJob()) return 0;
    normalizeDivineState();
    const before = clampDivinePower(player.divinePower);
    const wasBlessed = !!player.priestBlessed;
    const after = clampDivinePower(before + safeNum(amount, 0));
    player.divinePower = after;
    if (!wasBlessed && after >= DIVINE_BLESSING_THRESHOLD) {
        player.priestBlessed = true;
        player.priestNextCrit = true;
        writeLog(
            `[신성] ✨ ${DIVINE_BLESSING_THRESHOLD}스택 달성! <b>신의 가호</b> (흡혈+${Math.round(
                DIVINE_BLESSING_LIFESTEAL_BONUS * 100
            )}%, 방어+${DIVINE_BLESSING_DEF_BONUS}, 다음 공격 확정 치명)`
        );
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
window.getRawCritChance = getRawCritChance;
window.getCritOverflowForMult = getCritOverflowForMult;
window.getCritOverflowMultBonus = getCritOverflowMultBonus;
window.clampCritMultiplier = clampCritMultiplier;
window.getCritBaseMultBeforeOverflow = getCritBaseMultBeforeOverflow;
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
window.clampDivinePower = clampDivinePower;
window.normalizeDivineState = normalizeDivineState;
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
