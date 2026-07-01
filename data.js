'use strict';

/*
 * 순수 턴제 RPG 데이터 v3.5
 * 기존 스토리/직업/장비 데이터는 제거되었다. 아래 호환 키는 기존 DOM 렌더러가
 * 단일 인간 모험가를 표시하기 위해 필요한 최소 계약만 제공한다.
 */

const RULESET_VERSION = '3.5';
const GAME_VERSION = '베타 v3.9';
const LAST_UPDATE = '2026-07-01 00:00';
const HUMAN_JOB_KEY = 'Human';
const PARTY_ROLE_KEYS = Object.freeze(['tank', 'mage', 'knight']);
const PARTY_ROLE_DEFINITIONS = Object.freeze({
    tank: Object.freeze({ key: 'tank', name: '탱커', aggroWeight: 7, archetype: 'warrior' }),
    mage: Object.freeze({ key: 'mage', name: '마법사', aggroWeight: 1, archetype: 'mage' }),
    knight: Object.freeze({ key: 'knight', name: '기사', aggroWeight: 2.5, archetype: 'warrior' }),
});
const MAX_DUNGEON_FLOOR = 100;
const STAGES_PER_FLOOR = 10;
const LAST_SAFE_RETURN_FLOOR = 5;
const LAST_SAFE_RETURN_STAGE = 10;
const RESTORED_ITEMS = typeof globalThis !== 'undefined' && globalThis.RESTORED_ITEM_DATA
    ? globalThis.RESTORED_ITEM_DATA
    : typeof module !== 'undefined' && module.exports
      ? require('./js/restoredItemData.js')
      : {};

const BALANCE = Object.freeze({
    statBaseCap: 100,
    probabilityCap: 0.75,
    divinityMin: -5,
    divinityMax: 5,
    distortionMin: 0,
    distortionMax: 100,
    maxDungeonFloor: MAX_DUNGEON_FLOOR,
    stagesPerFloor: STAGES_PER_FLOOR,
    lastSafeReturnFloor: LAST_SAFE_RETURN_FLOOR,
    lastSafeReturnStage: LAST_SAFE_RETURN_STAGE,
    baseHitAccuracy: 55,
    permanentUpgradeGrowth: 1,
    upgradeFloorEquivalent: 1,
    critSoftCap: 0,
    critOverflowToMult: 0,
    critMultHardCap: 1,
    lifestealSoftCap: 0,
    divinePowerMax: 5,
    divineBlessingThreshold: 5,
    divineBlessingDefBonus: 0,
    divineBlessingLifestealBonus: 0,
    floorGrowth: Object.freeze({ atkPerFloor: 0, hpPerFloor: 0 }),
    enemyScaling: Object.freeze({
        pre30HpAtkStep: 0.045,
        pre30DefStep: 0.03,
        post30HpAtkStep: 0.03,
        post30DefStep: 0.02,
    }),
    enemyWallFloor: 30,
    enemyPreWallGrowth: 1.058,
    enemyPostWallGrowth: 1.067,
    enemyWallHpMult: 1.5,
    enemyWallAtkMult: 1.35,
    enemyWallDefMult: 2.18,
    goldReward: Object.freeze({
        normalBaseMin: 0,
        normalBaseMax: 0,
        normalMultiplier: 1,
        normalMin: 0,
        normalCap: 0,
        normalAffinityCap: 0,
        bossMultiplier: 1,
        bossFlatBonus: 0,
        bossFloorBonus: 0,
    }),
    rarityPower: Object.freeze({ common: 1, rare: 1, epic: 1, legendary: 1, legend: 1 }),
    shopPriceByRarity: Object.freeze({}),
});

const STAT_KEYS = Object.freeze(['str', 'def', 'hp', 'int', 'wis', 'agi', 'divinity', 'distortion']);

const statDefinitions = Object.freeze({
    str: Object.freeze({ key: 'str', name: '힘', short: 'Str', min: 1, max: 100 }),
    def: Object.freeze({ key: 'def', name: '방어력', short: 'Def', min: 1, max: 100 }),
    hp: Object.freeze({ key: 'hp', name: '체력', short: 'Hp', min: 1, max: 100 }),
    int: Object.freeze({ key: 'int', name: '지능', short: 'Int', min: 1, max: 100 }),
    wis: Object.freeze({ key: 'wis', name: '지혜', short: 'Wis', min: 1, max: 100 }),
    agi: Object.freeze({ key: 'agi', name: '민첩', short: 'Agi', min: 1, max: 100 }),
    divinity: Object.freeze({ key: 'divinity', name: '성혼', short: 'Divinity', min: -5, max: 5 }),
    distortion: Object.freeze({ key: 'distortion', name: '뒤틀림', short: 'Distortion', min: 0, max: 100 }),
});

const weaponTable = Object.freeze({
    hammer: Object.freeze({ key: 'hammer', name: '망치', type: 'atk', value: 34, speed: 20, cooldownTurns: 2, partBreakBonus: 0.25 }),
    sword: Object.freeze({ key: 'sword', name: '검', type: 'atk', value: 20, speed: 55, agilityExtraStrike: true }),
    ranged: Object.freeze({ key: 'ranged', name: '활/총', type: 'atk', value: 18, speed: 60, weaknessMastery: true }),
    staff: Object.freeze({ key: 'staff', name: '지팡이', type: 'atk', value: 14, speed: 50, magicFocus: true }),
    greatScythe: Object.freeze({ key: 'greatScythe', name: '대낫', type: 'atk', value: 28, speed: 42, selfSacrifice: true, twistedLifesteal: true }),
});

const armorTable = Object.freeze({
    shield: Object.freeze({ key: 'shield', name: '방패', type: 'hp', value: 0, def: 14, nullifyChance: 0.08 }),
    armor: Object.freeze({ key: 'armor', name: '갑옷', type: 'hp', value: 0, def: 18, mitigation: 0.25, nullifyChance: 0.05 }),
});

const magicTable = Object.freeze({
    lightning: Object.freeze({ key: 'lightning', name: '전기', school: 'holy' }),
    fire: Object.freeze({ key: 'fire', name: '화염', school: 'holy' }),
    poison: Object.freeze({ key: 'poison', name: '독', school: 'holy' }),
    ice: Object.freeze({ key: 'ice', name: '얼음', school: 'holy' }),
    water: Object.freeze({ key: 'water', name: '물', school: 'holy' }),
    heal: Object.freeze({ key: 'heal', name: '힐', school: 'holy' }),
    recreation: Object.freeze({ key: 'recreation', name: '재창조', school: 'twisted' }),
    twistedFire: Object.freeze({ key: 'twistedFire', name: '뒤틀린 불', school: 'twisted' }),
    twistedPoison: Object.freeze({ key: 'twistedPoison', name: '뒤틀린 독', school: 'twisted' }),
    twistedIce: Object.freeze({ key: 'twistedIce', name: '뒤틀린 얼음', school: 'twisted' }),
});

const bodyParts = Object.freeze(['head', 'torso', 'arm', 'leg', 'eye']);
const monsterArchetypeTable = Object.freeze({
    warrior: Object.freeze({ key: 'warrior', job: '워리어형', element: 'earth', strong: 'hunter', weak: 'mage', traitTags: Object.freeze(['warrior', 'earth']) }),
    hunter: Object.freeze({ key: 'hunter', job: '헌터형', element: 'wind', strong: 'mage', weak: 'warrior', traitTags: Object.freeze(['hunter', 'wind']) }),
    mage: Object.freeze({ key: 'mage', job: '마법사형', element: 'arcane', strong: 'warrior', weak: 'hunter', traitTags: Object.freeze(['mage', 'arcane']) }),
    boss: Object.freeze({ key: 'boss', job: '보스', element: 'void', strong: null, weak: null, traitTags: Object.freeze(['boss', 'void']) }),
});

function safeNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, safeNumber(value, min)));
}

function randomIntInclusive(min, max, random) {
    const rng = typeof random === 'function' ? random : Math.random;
    return Math.floor(rng() * (max - min + 1)) + min;
}

function rollHumanStartingStats(random) {
    return {
        str: randomIntInclusive(1, 30, random),
        def: randomIntInclusive(1, 30, random),
        hp: randomIntInclusive(1, 30, random),
        int: randomIntInclusive(1, 30, random),
        wis: randomIntInclusive(1, 30, random),
        agi: randomIntInclusive(1, 30, random),
        divinity: 0,
        distortion: 0,
    };
}

function normalizeStartingRollStats(raw) {
    const source = raw || {};
    return {
        str: clamp(source.str, 1, 30),
        def: clamp(source.def, 1, 30),
        hp: clamp(source.hp, 1, 30),
        int: clamp(source.int, 1, 30),
        wis: clamp(source.wis, 1, 30),
        agi: clamp(source.agi, 1, 30),
        divinity: 0,
        distortion: 0,
    };
}

function cloneStartingPartyRollMember(raw, roleKey) {
    const role = PARTY_ROLE_DEFINITIONS[roleKey] || PARTY_ROLE_DEFINITIONS.knight;
    if (!raw || !raw.stats) return null;
    return {
        roleKey: role.key,
        name: role.name,
        stats: normalizeStartingRollStats(raw.stats),
    };
}

function rollPartyRoleStartingStats(roleKey, random) {
    const role = PARTY_ROLE_DEFINITIONS[roleKey] || PARTY_ROLE_DEFINITIONS.knight;
    return {
        roleKey: role.key,
        name: role.name,
        stats: rollHumanStartingStats(random),
    };
}

function rollPartyStartingStats(random) {
    return PARTY_ROLE_KEYS.map((roleKey) => rollPartyRoleStartingStats(roleKey, random));
}

function rerollPartyRoleStartingStats(rawParty, roleKey, random) {
    const role = PARTY_ROLE_DEFINITIONS[roleKey] || PARTY_ROLE_DEFINITIONS.knight;
    const source = Array.isArray(rawParty) ? rawParty : [];
    return PARTY_ROLE_KEYS
        .map((key, index) => {
            if (key === role.key) return rollPartyRoleStartingStats(key, random);
            const existing = source.find((member) => member && member.roleKey === key) || source[index];
            return cloneStartingPartyRollMember(existing, key);
        })
        .filter(Boolean);
}

function normalizeHumanStats(raw) {
    const source = raw || {};
    return {
        str: clamp(source.str, 1, 100),
        def: clamp(source.def, 1, 100),
        hp: clamp(source.hp, 1, 100),
        int: clamp(source.int, 1, 100),
        wis: clamp(source.wis, 1, 100),
        agi: clamp(source.agi, 1, 100),
        divinity: clamp(source.divinity, -5, 5),
        distortion: clamp(source.distortion, 0, 100),
    };
}

function getMaxHpFromStat(hpStat) {
    return 50 + clamp(hpStat, 1, 100) * 5;
}

function normalizePartyMember(raw, roleKey) {
    const role = PARTY_ROLE_DEFINITIONS[roleKey] || PARTY_ROLE_DEFINITIONS.knight;
    const source = raw || {};
    const stats = normalizeHumanStats(source.stats || source);
    const maxHp = Math.max(1, safeNumber(source.maxHp, getMaxHpFromStat(stats.hp)));
    return {
        id: source.id || `${role.key}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        roleKey: role.key,
        name: source.name || role.name,
        archetype: role.archetype,
        aggroWeight: role.aggroWeight,
        stats,
        hp: clamp(source.hp == null ? maxHp : source.hp, 0, maxHp),
        maxHp,
        equipment: JSON.parse(JSON.stringify(source.equipment || { weapon: null, armor: null, accessories: [] })),
        magic: Array.isArray(source.magic) ? source.magic.slice() : role.key === 'mage' ? ['fire', 'heal'] : [],
        mastery: source.mastery && typeof source.mastery === 'object' ? JSON.parse(JSON.stringify(source.mastery)) : {},
        statuses: Array.isArray(source.statuses) ? JSON.parse(JSON.stringify(source.statuses)) : [],
        body: source.body && typeof source.body === 'object'
            ? JSON.parse(JSON.stringify(source.body))
            : Object.fromEntries(bodyParts.map((part) => [part, { destroyed: false, twisted: false, indestructible: false }])),
    };
}

function normalizeAdventurerParty(rawParty) {
    const source = Array.isArray(rawParty) ? rawParty : [];
    return PARTY_ROLE_KEYS.map((roleKey, index) => {
        const matched = source.find((member) => member && member.roleKey === roleKey) || source[index];
        return normalizePartyMember(matched || { stats: rollHumanStartingStats() }, roleKey);
    });
}

function createAdventurerParty(options) {
    const input = options || {};
    const rolled = Array.isArray(input.party) ? input.party : rollPartyStartingStats(input.random);
    return normalizeAdventurerParty(rolled);
}

function createDungeonProgress(floor, stage) {
    return {
        floor: clamp(Math.floor(safeNumber(floor, 1)), 1, MAX_DUNGEON_FLOOR),
        stage: clamp(Math.floor(safeNumber(stage, 1)), 1, STAGES_PER_FLOOR),
    };
}

function normalizeDungeonProgress(raw) {
    return createDungeonProgress(raw && raw.floor, raw && raw.stage);
}

function getDungeonPositionKey(progress) {
    const normalized = normalizeDungeonProgress(progress);
    return `${normalized.floor}-${normalized.stage}`;
}

function formatDungeonPosition(progress) {
    const normalized = normalizeDungeonProgress(progress);
    return `${normalized.floor}-${normalized.stage}층`;
}

function advanceDungeonProgress(progress) {
    const current = normalizeDungeonProgress(progress);
    if (current.floor === MAX_DUNGEON_FLOOR && current.stage === STAGES_PER_FLOOR) {
        return { ...current, completed: true };
    }
    if (current.stage < STAGES_PER_FLOOR) return { floor: current.floor, stage: current.stage + 1, completed: false };
    return { floor: current.floor + 1, stage: 1, completed: false };
}

function canReturnToBaseCamp(progress) {
    const current = normalizeDungeonProgress(progress);
    return current.floor <= LAST_SAFE_RETURN_FLOOR;
}

function hasCrossedPointOfNoReturn(progress) {
    const current = normalizeDungeonProgress(progress);
    return current.floor >= 6;
}

function createHumanAdventurer(options) {
    const input = options || {};
    const party = createAdventurerParty({ party: input.party, random: input.random });
    const stats = party[0].stats;
    const maxHp = party.reduce((sum, member) => sum + member.maxHp, 0);
    return {
        id: input.id || `party-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name: input.name || '성혼 원정대',
        species: 'human',
        jobKey: HUMAN_JOB_KEY,
        classKey: null,
        baseJob: '3인 파티',
        party,
        stats,
        hp: party.reduce((sum, member) => sum + member.hp, 0),
        maxHp,
        progress: normalizeDungeonProgress(input.progress),
        permanentDeath: false,
        equipment: {
            weapon: input.weapon || null,
            armor: input.armor || null,
            accessories: Array.isArray(input.accessories) ? input.accessories.slice() : [],
        },
        magic: Array.isArray(input.magic) ? input.magic.slice() : [],
        skills: Array.isArray(input.skills) ? input.skills.slice() : [],
        mastery: input.mastery && typeof input.mastery === 'object' ? JSON.parse(JSON.stringify(input.mastery)) : {},
        statuses: [],
        body: Object.fromEntries(bodyParts.map((part) => [part, { destroyed: false, twisted: false, indestructible: false }])),
        createdAt: input.createdAt || Date.now(),
    };
}

function snapshotAdventurerForGhost(actor, progress, killedBy) {
    const source = actor || {};
    const normalizedProgress = normalizeDungeonProgress(progress || source.progress);
    let completeSnapshot = {};
    try {
        completeSnapshot = JSON.parse(JSON.stringify(source));
    } catch (_error) {
        completeSnapshot = {};
    }
    return {
        ghostId: `ghost-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        sourceActorId: source.id || source.metaSlotId || null,
        name: source.name || '이름 없는 망령',
        monsterName: `${source.name || '이름 없는 모험가'}의 망령`,
        type: 'playerGhost',
        position: normalizedProgress,
        positionKey: getDungeonPositionKey(normalizedProgress),
        killedBy: killedBy || null,
        stats: normalizeHumanStats(source.stats || {
            str: source.atk,
            def: source.def,
            hp: Math.max(1, Math.round((source.maxHp - 50) / 5)),
            int: source.int,
            wis: source.wis,
            agi: source.agi,
            divinity: source.divinity,
            distortion: source.distortion,
        }),
        currentHp: Math.max(1, safeNumber(source.maxHp, getMaxHpFromStat(source.stats && source.stats.hp))),
        maxHp: Math.max(1, safeNumber(source.maxHp, getMaxHpFromStat(source.stats && source.stats.hp))),
        equipment: JSON.parse(JSON.stringify(source.equipment || {
            weapon: source.weapon || null,
            armor: source.armor || null,
            accessories: source.accessories || [],
        })),
        magic: JSON.parse(JSON.stringify(source.magic || [])),
        skills: JSON.parse(JSON.stringify(source.skills || [])),
        mastery: JSON.parse(JSON.stringify(source.mastery || {})),
        statuses: JSON.parse(JSON.stringify(source.statuses || [])),
        body: JSON.parse(JSON.stringify(source.body || {})),
        items: JSON.parse(JSON.stringify(source.items || [])),
        relics: JSON.parse(JSON.stringify(source.relics || [])),
        behaviorLogger: JSON.parse(JSON.stringify(source.behaviorLogger || [])),
        behaviorMatrix: source.behaviorMatrix ? JSON.parse(JSON.stringify(source.behaviorMatrix)) : null,
        fullSpec: completeSnapshot,
        archivedAt: Date.now(),
    };
}

function capProbability(value) {
    return clamp(value, 0, BALANCE.probabilityCap);
}

/*
 * 기존 DOM 렌더러 호환 계약. 직업 선택지는 하나뿐이며 스토리/전직 데이터는 비어 있다.
 */
const jobBase = Object.freeze({
    Human: Object.freeze({ name: '3인 원정대', hp: 150, atk: 3, def: 3, color: '#d8d8d8' }),
});
const jobEvolutions = Object.freeze({});
const relations = Object.freeze({});
const raceStories = Object.freeze({
    human: Object.freeze({ key: 'human', name: '인간', color: '#d8d8d8', summary: '단 한 명의 인간 모험가', fragments: Object.freeze({}) }),
});
const classStories = Object.freeze({});
const promotionStories = Object.freeze({});
const floorStories = Object.freeze({ bands: Object.freeze([]), milestones: Object.freeze({}), relicClues: Object.freeze({}), finalBossOpening: Object.freeze([]) });
const storyData = Object.freeze({
    playerStateDefaults: Object.freeze({ corruption: 0, purification: 0 }),
    routeTitles: Object.freeze({ neutral: null }),
    endingTitles: Object.freeze({}),
    choiceImpacts: Object.freeze({}),
});
const introMemoryChoices = Object.freeze({
    human: Object.freeze({ key: 'human', label: '아무것도 기억나지 않는다', raceKey: 'human', baseJobKey: HUMAN_JOB_KEY }),
});
const introWeaponChoices = Object.freeze({
    unarmed: Object.freeze({ key: 'unarmed', label: '빈손', className: '인간 모험가', classKey: null, jobKey: HUMAN_JOB_KEY }),
});
const introPrologueText = Object.freeze({
    memoryPrompt: '기억은 없다. 한 명의 인간 모험가가 미궁 앞에 서 있다.',
    dangerPrompt: '앞으로 나아가거나 죽는다.',
    weaponPrompt: '아직 장비가 없다.',
});
const tacticalSkillChoices = Object.freeze({});
const tacticalSkillMilestones = Object.freeze([]);
const equipmentPool = JSON.parse(JSON.stringify(RESTORED_ITEMS.equipmentPool || []));
const relicPool = JSON.parse(JSON.stringify(RESTORED_ITEMS.relicPool || []));
const forgeRecipes = JSON.parse(JSON.stringify(RESTORED_ITEMS.forgeRecipes || []));
const permanentUpgrades = JSON.parse(JSON.stringify(RESTORED_ITEMS.permanentUpgrades || []));
const floorUnlocks = JSON.parse(JSON.stringify(RESTORED_ITEMS.floorUnlocks || {}));
const floorUnlocksHunter = JSON.parse(JSON.stringify(RESTORED_ITEMS.floorUnlocksHunter || {}));
const floorUnlocksWizard = JSON.parse(JSON.stringify(RESTORED_ITEMS.floorUnlocksWizard || {}));
const synergyRules = Object.freeze([]);
const ultSkills = {};
const mercCompanionBases = {};
const mercEvolutions = {};

function buildStarterEquipmentSet() {
    return [];
}
function applyStarterGearStats(item) {
    return item;
}
function isStarterGearItem() {
    return false;
}
function normalizeRarityKey(value) {
    const key = String(value || 'common').toLowerCase();
    return key === 'legend' ? 'legendary' : ['common', 'rare', 'epic', 'legendary'].includes(key) ? key : 'common';
}
function computeEquipmentGoldPrice(item, floorRef) {
    if (item && Number.isFinite(Number(item.price)) && Number(item.price) > 0) {
        if (item._v35PriceDiscountApplied) return Math.max(1, Math.floor(Number(item.price)));
        item._v35PriceDiscountApplied = true;
        return Math.max(1, Math.floor(Number(item.price) * 0.5));
    }
    const floorValue = floorRef && typeof floorRef === 'object'
        ? Number(floorRef.shopFloor || floorRef.priceFloor || floorRef.floor || 1)
        : Number(floorRef || 1);
    const base = { common: 40, rare: 110, epic: 360, legendary: 1200 }[normalizeRarityKey(item && item.rarity)] || 40;
    if (item) item._v35PriceDiscountApplied = true;
    return Math.max(1, Math.floor((base + Math.max(1, floorValue) * 2) * 0.5));
}
function computeFloorGoldReward(floorRef, options) {
    const depth = Math.max(1, Number(floorRef) || 1);
    return Math.max(1, Math.floor((10 + depth * 2) * 1.6 * (options && options.isBoss ? 2.2 : 1)));
}
function applyOfficialStatsToEquipmentItem(item) {
    if (item && !item._v35PowerBuffApplied && item.type !== 'relic' && item.type !== 'potion') {
        const integerFields = ['value', 'hpBonus', 'def', 'critBonus', 'prayerBonus'];
        const ratioFields = [
            'critMult',
            'lifesteal',
            'damageReduction',
            'goldGainBonus',
            'potionHealBonus',
            'fleeBonus',
            'divinityGainBonus',
        ];
        integerFields.forEach((field) => {
            if (Number.isFinite(Number(item[field])) && Number(item[field]) > 0) {
                item[field] = Math.max(1, Math.round(Number(item[field]) * 1.5));
            }
        });
        ratioFields.forEach((field) => {
            if (Number.isFinite(Number(item[field])) && Number(item[field]) > 0) {
                item[field] = Number((Number(item[field]) * 1.5).toFixed(4));
            }
        });
        item._v35PowerBuffApplied = true;
        rebuildEquipmentDesc(item);
    }
    if (item && (!Number.isFinite(Number(item.price)) || Number(item.price) <= 0)) {
        item.price = computeEquipmentGoldPrice(item, 1);
    }
    return item;
}
function clampEquipmentItemStatsToRarityCaps(item) {
    return item;
}
function buildEquipmentStatParts(item) {
    if (!item) return [];
    const parts = [];
    if ((item.type === 'atk' || item.type === 'ring' || item.type === 'rune') && Number(item.value)) parts.push(`공격(+${item.value})`);
    if (item.type === 'hp' && Number(item.value)) parts.push(`체력(+${item.value})`);
    if (Number(item.hpBonus)) parts.push(`체력(+${item.hpBonus})`);
    if (Number(item.def)) parts.push(`방어(${item.def > 0 ? '+' : ''}${item.def})`);
    if (Number(item.critBonus)) parts.push(`치명(+${item.critBonus}%)`);
    if (Number(item.critMult)) parts.push(`치명 배율(+${Math.round(item.critMult * 100)}%)`);
    if (Number(item.lifesteal)) parts.push(`흡혈(${Math.round(item.lifesteal * 100)}%)`);
    if (Number(item.damageReduction)) parts.push(`피해 감소(+${Math.round(item.damageReduction * 100)}%)`);
    if (Number(item.goldGainBonus)) parts.push(`골드 획득(+${Math.round(item.goldGainBonus * 100)}%)`);
    if (Number(item.potionHealBonus)) parts.push(`포션 회복(+${Math.round(item.potionHealBonus * 100)}%)`);
    if (Number(item.fleeBonus)) parts.push(`도주 완화(${Math.round(item.fleeBonus * 100)}%)`);
    return parts;
}
function rebuildEquipmentDesc(item) {
    if (!item) return item;
    const parts = buildEquipmentStatParts(item);
    if (parts.length) item.desc = `${parts.join(', ')}.`;
    return item;
}
function normalizePlayerState(raw) {
    const source = raw || {};
    return { corruption: Math.max(0, Math.floor(safeNumber(source.corruption, 0))), purification: Math.max(0, Math.floor(safeNumber(source.purification, 0))) };
}
function normalizeFloorGrowth(raw) {
    const source = raw || {};
    return { floors: Math.max(0, Math.floor(safeNumber(source.floors, 0))), atk: 0, hp: 0 };
}
function getStoryTitleForState() {
    return null;
}
function getEnemyScalingForFloor(floor) {
    const step = Math.max(0, Math.floor(safeNumber(floor, 1)) - 1);
    return { hpAtk: 1 + step * 0.045, def: 1 + step * 0.03 };
}
function getBossMultiplier() {
    return { hp: 1.5, atk: 1.25, def: 1.15 };
}
function getBossSoftWallCalibration() {
    return { hp: 1, atk: 1, def: 1 };
}

const TURN_RPG_DATA = Object.freeze({
    version: RULESET_VERSION,
    maxFloor: MAX_DUNGEON_FLOOR,
    stagesPerFloor: STAGES_PER_FLOOR,
    statDefinitions,
    weaponTable,
    armorTable,
    magicTable,
    monsterArchetypeTable,
});

if (typeof globalThis !== 'undefined') {
    Object.assign(globalThis, {
        RULESET_VERSION,
        GAME_VERSION,
        LAST_UPDATE,
        HUMAN_JOB_KEY,
        PARTY_ROLE_KEYS,
        PARTY_ROLE_DEFINITIONS,
        MAX_DUNGEON_FLOOR,
        STAGES_PER_FLOOR,
        LAST_SAFE_RETURN_FLOOR,
        LAST_SAFE_RETURN_STAGE,
        TURN_RPG_DATA,
        rollHumanStartingStats,
        rollPartyRoleStartingStats,
        rollPartyStartingStats,
        rerollPartyRoleStartingStats,
        normalizeHumanStats,
        normalizePartyMember,
        normalizeAdventurerParty,
        createAdventurerParty,
        createHumanAdventurer,
        createDungeonProgress,
        normalizeDungeonProgress,
        getDungeonPositionKey,
        formatDungeonPosition,
        advanceDungeonProgress,
        canReturnToBaseCamp,
        hasCrossedPointOfNoReturn,
        snapshotAdventurerForGhost,
        capProbability,
        monsterArchetypeTable,
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RULESET_VERSION,
        GAME_VERSION,
        LAST_UPDATE,
        HUMAN_JOB_KEY,
        PARTY_ROLE_KEYS,
        PARTY_ROLE_DEFINITIONS,
        MAX_DUNGEON_FLOOR,
        STAGES_PER_FLOOR,
        LAST_SAFE_RETURN_FLOOR,
        LAST_SAFE_RETURN_STAGE,
        BALANCE,
        STAT_KEYS,
        statDefinitions,
        weaponTable,
        armorTable,
        magicTable,
        monsterArchetypeTable,
        rollHumanStartingStats,
        rollPartyRoleStartingStats,
        rollPartyStartingStats,
        rerollPartyRoleStartingStats,
        normalizeHumanStats,
        normalizePartyMember,
        normalizeAdventurerParty,
        createAdventurerParty,
        getMaxHpFromStat,
        createHumanAdventurer,
        createDungeonProgress,
        normalizeDungeonProgress,
        getDungeonPositionKey,
        formatDungeonPosition,
        advanceDungeonProgress,
        canReturnToBaseCamp,
        hasCrossedPointOfNoReturn,
        snapshotAdventurerForGhost,
        capProbability,
        TURN_RPG_DATA,
    };
}
