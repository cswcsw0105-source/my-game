'use strict';

// 3인 파티 런타임 어댑터. 기존 단일 player DOM 계약은 파티 합산값으로 유지한다.
function safeNum(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function ensurePartyMemberRuntimeShape(member) {
    if (!member) return member;
    const role = PARTY_ROLE_DEFINITIONS[member.roleKey] || PARTY_ROLE_DEFINITIONS.knight;
    member.roleKey = role.key;
    member.name = member.name || role.name;
    member.archetype = role.archetype;
    member.aggroWeight = safeNum(member.aggroWeight, role.aggroWeight);
    member.stats = normalizeHumanStats(member.stats || {});
    member.maxHp = Math.max(1, safeNum(member.maxHp, getMaxHpFromStat(member.stats.hp)));
    member.curHp = Math.min(member.maxHp, Math.max(0, safeNum(member.curHp, member.hp == null ? member.maxHp : member.hp)));
    member.hp = member.maxHp;
    member.atk = Math.max(1, safeNum(member.atk, member.stats.str));
    member.def = Math.max(0, safeNum(member.def, member.stats.def));
    member.int = member.stats.int;
    member.wis = member.stats.wis;
    member.agi = member.stats.agi;
    member.divinity = member.stats.divinity;
    member.distortion = member.stats.distortion;
    member.items = Array.isArray(member.items) ? member.items : [];
    member.equipment = member.equipment || { weapon: null, armor: null, accessories: [] };
    member.magic = Array.isArray(member.magic) ? member.magic : role.key === 'mage' ? ['fire', 'heal'] : [];
    member.mastery = member.mastery && typeof member.mastery === 'object' ? member.mastery : {};
    member.statuses = Array.isArray(member.statuses) ? member.statuses : [];
    member.extraDef = Math.max(0, safeNum(member.extraDef, 0));
    member.damageReduction = Math.max(0, safeNum(member.damageReduction, 0));
    return member;
}

function getPartyMembers(actor) {
    if (!actor || !Array.isArray(actor.party)) return [];
    return actor.party.map(ensurePartyMemberRuntimeShape);
}

function getLivingPartyMembers(actor) {
    return getPartyMembers(actor).filter((member) => member.curHp > 0);
}

function isPartyMember(actor) {
    return !!(player && Array.isArray(player.party) && player.party.includes(actor));
}

function syncPartyAggregateState(actor) {
    if (!actor || !Array.isArray(actor.party)) return actor;
    const members = getPartyMembers(actor);
    actor.maxHp = members.reduce((sum, member) => sum + member.maxHp, 0);
    actor.curHp = members.reduce((sum, member) => sum + member.curHp, 0);
    actor.hp = actor.maxHp;
    actor.atk = members.reduce((sum, member) => sum + member.atk, 0);
    actor.def = members.length
        ? Math.round(members.reduce((sum, member) => sum + member.def + member.extraDef, 0) / members.length)
        : 0;
    actor.stats = members[0] ? members[0].stats : normalizeHumanStats({});
    return actor;
}

function ensureHumanRuntimeShape(actor) {
    if (!actor) return actor;
    if (Array.isArray(actor.party)) {
        actor.party = normalizeAdventurerParty(actor.party).map((member, index) => {
            const source = actor.party[index] || member;
            return ensurePartyMemberRuntimeShape({ ...member, ...source, stats: normalizeHumanStats(source.stats || member.stats) });
        });
        actor.name = actor.name || '성혼 원정대';
        actor.baseJob = '3인 파티';
        actor.jobKey = HUMAN_JOB_KEY;
        actor.items = Array.isArray(actor.items) ? actor.items : [];
        actor.equipment = actor.equipment || { weapon: null, armor: null, accessories: [] };
        actor.magic = Array.isArray(actor.magic) ? actor.magic : [];
        actor.skills = Array.isArray(actor.skills) ? actor.skills : [];
        actor.mastery = actor.mastery && typeof actor.mastery === 'object' ? actor.mastery : {};
        actor.statuses = Array.isArray(actor.statuses) ? actor.statuses : [];
        actor.relics = Array.isArray(actor.relics) ? actor.relics : [];
        actor.progress = normalizeDungeonProgress(actor.progress || { floor, stage: dungeonStage });
        syncPartyAggregateState(actor);
        return actor;
    }
    actor.stats = normalizeHumanStats(actor.stats || {
        str: actor.atk,
        def: actor.def,
        hp: Math.max(1, Math.round((safeNum(actor.maxHp, 55) - 50) / 5)),
        int: actor.int,
        wis: actor.wis,
        agi: actor.agi,
        divinity: actor.divinity,
        distortion: actor.distortion,
    });
    actor.maxHp = Math.max(1, safeNum(actor.maxHp, 50 + actor.stats.hp * 5));
    actor.curHp = Math.min(actor.maxHp, Math.max(0, safeNum(actor.curHp, actor.maxHp)));
    actor.atk = Math.max(1, safeNum(actor.atk, actor.stats.str));
    actor.def = Math.max(0, safeNum(actor.def, actor.stats.def));
    actor.int = actor.stats.int;
    actor.wis = actor.stats.wis;
    actor.agi = actor.stats.agi;
    actor.divinity = actor.stats.divinity;
    actor.distortion = actor.stats.distortion;
    actor.progress = normalizeDungeonProgress(actor.progress || { floor, stage: dungeonStage });
    actor.jobKey = HUMAN_JOB_KEY;
    actor.baseJob = '인간 모험가';
    actor.classKey = null;
    actor.items = Array.isArray(actor.items) ? actor.items : [];
    actor.equipment = actor.equipment || { weapon: null, armor: null, accessories: [] };
    actor.magic = Array.isArray(actor.magic) ? actor.magic : [];
    actor.skills = Array.isArray(actor.skills) ? actor.skills : [];
    actor.mastery = actor.mastery && typeof actor.mastery === 'object' ? actor.mastery : {};
    actor.statuses = Array.isArray(actor.statuses) ? actor.statuses : [];
    actor.body = actor.body && typeof actor.body === 'object'
        ? actor.body
        : Object.fromEntries(bodyParts.map((part) => [part, { destroyed: false, twisted: false, indestructible: false }]));
    actor.extraDef = Math.max(0, safeNum(actor.extraDef, 0));
    actor.crit = Math.max(0, safeNum(actor.crit, 0));
    actor.critMult = Math.max(1, safeNum(actor.critMult, 1));
    actor.lifesteal = Math.max(0, safeNum(actor.lifesteal, 0));
    actor.damageReduction = Math.max(0, safeNum(actor.damageReduction, 0));
    actor.potionHealBonus = Math.max(0, safeNum(actor.potionHealBonus, 0));
    return actor;
}

function ensurePlayerSynergyBonuses() {
    if (player) player._syn = null;
    return player && player._syn;
}
function getEffectiveMaxHp() {
    return player ? ensureHumanRuntimeShape(player).maxHp : 1;
}
function getEffectiveAttackPower() {
    return player ? ensureHumanRuntimeShape(player).atk : 1;
}
function getTotalPlayerDefenseForHit() {
    return player ? ensureHumanRuntimeShape(player).def + safeNum(player.extraDef, 0) : 0;
}
function getRawCritChance(extraCrit) { return player ? safeNum(player.crit, 0) + safeNum(extraCrit, 0) : 0; }
function getCritOverflowForMult() { return 0; }
function getCritOverflowMultBonus() { return 0; }
function clampCritMultiplier(value) { return Math.max(1, safeNum(value, 1)); }
function getCritBaseMultBeforeOverflow(extraMult) { return player ? player.critMult + safeNum(extraMult, 0) : 1; }
function getEffectiveCritMult() { return player ? clampCritMultiplier(player.critMult) : 1; }
function getCritInfo() {
    const rawCrit = getRawCritChance(0);
    return { rawCrit, effectiveCrit: Math.min(75, rawCrit), overflow: Math.max(0, rawCrit - 75), overflowMult: 0 };
}
function getLifestealEffective() { return player ? Math.min(0.85, safeNum(player.lifesteal, 0)) : 0; }
function getLifestealOverflowAtk() { return 0; }
function getPlayerDamageReduction() {
    return player ? Math.min(0.6, safeNum(player.damageReduction, 0)) : 0;
}
function getPlayerPotionHealMultiplier() { return player ? 1 + safeNum(player.potionHealBonus, 0) : 1; }
function applyRebirthPctBonusToPlayer() { return player; }
function applyOwnedEquipmentItemBonuses() { return player; }
function fullResyncPlayerCombatStatsFromMetaAndInventory() {
    if (!player) return null;
    ensureHumanRuntimeShape(player);
    if (Array.isArray(player.party)) {
        const members = getPartyMembers(player);
        const byRole = Object.fromEntries(members.map((member) => [member.roleKey, member]));
        members.forEach((member) => {
            const previousHp = member.curHp;
            member.items = [];
            member.atk = member.stats.str;
            member.def = member.stats.def;
            member.extraDef = 0;
            member.maxHp = getMaxHpFromStat(member.stats.hp);
            member.crit = 0;
            member.critMult = 1;
            member.lifesteal = 0;
            member.damageReduction = 0;
            member.potionHealBonus = 0;
            member.curHp = Math.min(member.maxHp, Math.max(0, previousHp));
        });
        for (const item of player.items || []) {
            if (!item) continue;
            const itemText = `${item.name || ''} ${(item.tags || []).join(' ')}`;
            const target = item.type === 'hp' || safeNum(item.def, 0) > 0 || safeNum(item.damageReduction, 0) > 0
                ? byRole.tank
                : /지팡이|마법|마력|마도|보주|주문|arcane/i.test(itemText)
                  ? byRole.mage
                  : byRole.knight;
            if (!target) continue;
            target.items.push(item);
            if (item.type === 'atk' || item.type === 'ring' || item.type === 'rune') target.atk += safeNum(item.value, 0);
            if (item.type === 'hp') target.maxHp += safeNum(item.value, 0);
            target.maxHp += safeNum(item.hpBonus, 0);
            target.extraDef += safeNum(item.def, 0);
            target.crit += safeNum(item.critBonus, 0);
            target.critMult += safeNum(item.critMult, 0);
            target.lifesteal += safeNum(item.lifesteal, 0);
            target.damageReduction += safeNum(item.damageReduction, 0);
            target.potionHealBonus += safeNum(item.potionHealBonus, 0);
            target.curHp = Math.min(target.maxHp, target.curHp);
        }
        const permanentBonus = player.permanentBonus || {};
        player.crit = members.reduce((sum, member) => sum + safeNum(member.crit, 0), 0) + safeNum(permanentBonus.crit, 0);
        player.critMult = members.length
            ? members.reduce((sum, member) => sum + safeNum(member.critMult, 1), 0) / members.length
            : 1;
        player.critMult += safeNum(permanentBonus.critMult, 0);
        player.lifesteal = members.reduce((sum, member) => sum + safeNum(member.lifesteal, 0), 0);
        player.damageReduction = members.reduce((sum, member) => sum + safeNum(member.damageReduction, 0), 0) / Math.max(1, members.length);
        player.potionHealBonus = Math.max(0, ...members.map((member) => safeNum(member.potionHealBonus, 0)));
        syncPartyAggregateState(player);
        return player;
    }
    const previousHp = player.curHp;
    let attack = player.stats.str;
    let maxHp = 50 + player.stats.hp * 5;
    let extraDef = 0;
    let crit = 0;
    let critMult = 1;
    let lifesteal = 0;
    let damageReduction = 0;
    let potionHealBonus = 0;
    for (const item of player.items || []) {
        if (!item) continue;
        if (item.type === 'atk' || item.type === 'ring' || item.type === 'rune') attack += safeNum(item.value, 0);
        if (item.type === 'hp') maxHp += safeNum(item.value, 0);
        maxHp += safeNum(item.hpBonus, 0);
        extraDef += safeNum(item.def, 0);
        crit += safeNum(item.critBonus, 0);
        critMult += safeNum(item.critMult, 0);
        lifesteal += safeNum(item.lifesteal, 0);
        damageReduction += safeNum(item.damageReduction, 0);
        potionHealBonus += safeNum(item.potionHealBonus, 0);
    }
    player.atk = Math.max(1, attack);
    player.def = player.stats.def;
    player.extraDef = Math.max(0, extraDef);
    player.maxHp = Math.max(1, maxHp);
    player.curHp = Math.min(player.maxHp, Math.max(0, previousHp));
    player.crit = Math.max(0, crit);
    player.critMult = Math.max(1, critMult);
    player.lifesteal = Math.max(0, lifesteal);
    player.damageReduction = Math.max(0, damageReduction);
    player.potionHealBonus = Math.max(0, potionHealBonus);
    return player;
}
function isPriestJob() { return false; }
function isPriestBlessed() { return false; }
function isChosenPriest() { return false; }
function formatDivinePowerForDisplay(value) { return String(Math.round(safeNum(value, 0) * 10) / 10); }
function clampDivinePower(value) { return Math.max(-5, Math.min(5, safeNum(value, 0))); }
function normalizeDivineState() {
    if (player) {
        ensureHumanRuntimeShape(player);
        player.stats.divinity = clampDivinePower(player.stats.divinity);
        player.divinity = player.stats.divinity;
    }
}
function getDivineAtkBonus() { return 0; }
function getDivineDefBonus() { return 0; }
function recalcPlayerDivineGainMult() { return 1; }
function addDivinePower(amount) {
    if (!player) return 0;
    ensureHumanRuntimeShape(player);
    const before = player.stats.divinity;
    player.stats.divinity = clampDivinePower(before + safeNum(amount, 0));
    player.divinity = player.stats.divinity;
    return player.stats.divinity - before;
}
function getPlayerGoldGainMult() { return 1; }
function getPlayerFleeBonus() { return 0; }

Object.assign(window, {
    safeNum,
    ensureHumanRuntimeShape,
    ensurePartyMemberRuntimeShape,
    getPartyMembers,
    getLivingPartyMembers,
    isPartyMember,
    syncPartyAggregateState,
    ensurePlayerSynergyBonuses,
    getEffectiveMaxHp,
    getEffectiveAttackPower,
    getTotalPlayerDefenseForHit,
    getRawCritChance,
    getCritOverflowForMult,
    getCritOverflowMultBonus,
    clampCritMultiplier,
    getCritBaseMultBeforeOverflow,
    getEffectiveCritMult,
    getCritInfo,
    getLifestealEffective,
    getLifestealOverflowAtk,
    getPlayerDamageReduction,
    getPlayerPotionHealMultiplier,
    applyRebirthPctBonusToPlayer,
    applyOwnedEquipmentItemBonuses,
    fullResyncPlayerCombatStatsFromMetaAndInventory,
    isPriestJob,
    isPriestBlessed,
    isChosenPriest,
    formatDivinePowerForDisplay,
    clampDivinePower,
    normalizeDivineState,
    getDivineAtkBonus,
    getDivineDefBonus,
    recalcPlayerDivineGainMult,
    addDivinePower,
    getPlayerGoldGainMult,
    getPlayerFleeBonus,
});
