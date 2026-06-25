'use strict';

/*
 * v3.5 캠페인 저장소.
 * 파일명은 기존 번들 순서를 보존하기 위해 유지하지만 v7 데이터와 마이그레이션은 사용하지 않는다.
 */
(function installCampaignStore(global) {
    const STORAGE_KEY = 'turn_rpg_campaign_v35';
    const GHOST_STORAGE_KEY = 'turn_rpg_ghosts_v35';
    const SNAPSHOT_STORAGE_KEY = 'turn_rpg_snapshot_v35';
    const ACTIVE_FILE_KEY = 'turn_rpg_active_file_v35';
    const SAVE_SLOT_COUNT = 3;
    const MAX_SLOTS = 1;
    const BASE_CAMP_FLOORS = [1, 2, 3, 4, 5];
    const TECH_NODES = [];
    const FLOOR_QUESTS = {};

    function clone(value) {
        return value == null ? value : JSON.parse(JSON.stringify(value));
    }

    function emptyMeta() {
        return {
            version: RULESET_VERSION,
            savedGold: 0,
            activeSlotId: null,
            slots: [],
            deadAdventurers: [],
        };
    }

    function loadJson(key, fallback) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || 'null');
            return parsed == null ? fallback : parsed;
        } catch (_error) {
            return fallback;
        }
    }

    function saveJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    }

    function normalizeSlot(slot) {
        if (!slot || typeof slot !== 'object') return null;
        const legacyParty = slot.party || (slot.stats ? [{ roleKey: 'tank', name: '탱커', stats: slot.stats }] : null);
        const party = normalizeAdventurerParty(legacyParty || rollPartyStartingStats());
        const stats = party[0].stats;
        const maxHp = party.reduce((sum, member) => sum + member.maxHp, 0);
        const currentHp = party.reduce((sum, member) => sum + member.hp, 0);
        return {
            id: slot.id || `party-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            name: slot.name || '성혼 원정대',
            species: 'human',
            jobKey: HUMAN_JOB_KEY,
            classKey: null,
            baseJob: '3인 파티',
            originBaseJobKey: HUMAN_JOB_KEY,
            introWeaponKey: null,
            party,
            stats,
            hp: Math.min(maxHp, Math.max(0, Number(slot.hp == null ? currentHp : slot.hp) || 0)),
            maxHp,
            progress: normalizeDungeonProgress(slot.progress),
            permanentDeath: !!slot.permanentDeath,
            diedAt: slot.diedAt || null,
            deathPosition: slot.deathPosition ? normalizeDungeonProgress(slot.deathPosition) : null,
            ghostId: slot.ghostId || null,
            equipment: clone(slot.equipment || { weapon: null, armor: null, accessories: [] }),
            magic: clone(slot.magic || []),
            skills: clone(slot.skills || []),
            mastery: clone(slot.mastery || {}),
            statuses: clone(slot.statuses || []),
            body: clone(slot.body || {}),
            items: clone(slot.items || []),
            relics: clone(slot.relics || []),
            behaviorLogger: clone(slot.behaviorLogger || []),
            behaviorMatrix: clone(slot.behaviorMatrix || null),
            gold: Math.max(0, Number(slot.gold) || 0),
            runWins: Math.max(0, Math.floor(Number(slot.runWins) || 0)),
            level: 1,
            exp: 0,
            bestFloor: Math.max(1, Number(slot.bestFloor) || 1),
            bestStage: Math.max(1, Number(slot.bestStage) || 1),
            techBonus: clone(slot.techBonus || { hp: 0, atk: 0, def: 0, acc: 0, crit: 0, critMult: 0 }),
            campPerma: clone(slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 }),
            campApplied: clone(slot.campApplied || { hp: 0, atk: 0, def: 0 }),
            rebirthStatBonus: { hp: 0, atk: 0, def: 0, acc: 0 },
            rebirthPctBonus: { atkPct: 0, defPct: 0, critMultPct: 0 },
            floorGrowth: { floors: 0, atk: 0, hp: 0 },
            playerState: { corruption: 0, purification: 0 },
            tacticalSkills: [],
            tacticalSkillMilestonesClaimed: [],
            promotionHistory: [],
            currentPromotion: null,
            starterEquipment: [],
            rescuedItems: [],
            createdAt: slot.createdAt || Date.now(),
        };
    }

    function loadMeta() {
        const raw = loadJson(STORAGE_KEY, emptyMeta());
        const meta = raw && raw.version === RULESET_VERSION ? raw : emptyMeta();
        meta.slots = Array.isArray(meta.slots) ? meta.slots.map(normalizeSlot).filter(Boolean) : [];
        meta.deadAdventurers = Array.isArray(meta.deadAdventurers)
            ? meta.deadAdventurers.map(normalizeSlot).filter(Boolean)
            : [];
        if (!meta.slots.some((slot) => slot.id === meta.activeSlotId && !slot.permanentDeath)) {
            const living = meta.slots.find((slot) => !slot.permanentDeath);
            meta.activeSlotId = living ? living.id : null;
        }
        meta.savedGold = Math.max(0, Number(meta.savedGold) || 0);
        return meta;
    }

    function saveMeta(meta) {
        const next = meta && typeof meta === 'object' ? meta : emptyMeta();
        next.version = RULESET_VERSION;
        next.slots = Array.isArray(next.slots) ? next.slots.map(normalizeSlot).filter(Boolean) : [];
        next.deadAdventurers = Array.isArray(next.deadAdventurers)
            ? next.deadAdventurers.map(normalizeSlot).filter(Boolean)
            : [];
        return saveJson(STORAGE_KEY, next);
    }

    function getSlotById(id) {
        return loadMeta().slots.find((slot) => slot.id === id) || null;
    }

    function createCharacter(name, partyRoll) {
        const meta = loadMeta();
        if (meta.slots.some((slot) => !slot.permanentDeath)) {
            return { ok: false, msg: '살아 있는 원정대는 하나만 존재할 수 있습니다.' };
        }
        const actor = createHumanAdventurer({ name: name || '성혼 원정대', party: partyRoll });
        const slot = normalizeSlot(actor);
        meta.slots.push(slot);
        meta.activeSlotId = slot.id;
        saveMeta(meta);
        clearRunSnapshot(slot.id);
        return { ok: true, slot: clone(slot), rolledParty: clone(slot.party) };
    }

    function setActiveSlot(id) {
        const meta = loadMeta();
        const slot = meta.slots.find((entry) => entry.id === id);
        if (!slot || slot.permanentDeath) return false;
        meta.activeSlotId = id;
        saveMeta(meta);
        return true;
    }

    function syncRunProgress(id, patch) {
        const meta = loadMeta();
        const slot = meta.slots.find((entry) => entry.id === id);
        if (!slot || slot.permanentDeath) return false;
        const source = patch || {};
        if (source.stats) slot.stats = normalizeHumanStats(source.stats);
        if (source.party) slot.party = normalizeAdventurerParty(source.party);
        if (source.progress) slot.progress = normalizeDungeonProgress(source.progress);
        if (source.hp != null) slot.hp = Math.max(0, Number(source.hp) || 0);
        if (source.maxHp != null) slot.maxHp = Math.max(1, Number(source.maxHp) || 1);
        if (source.gold != null) slot.gold = Math.max(0, Number(source.gold) || 0);
        if (source.runWins != null) slot.runWins = Math.max(0, Math.floor(Number(source.runWins) || 0));
        for (const key of ['equipment', 'magic', 'skills', 'mastery', 'statuses', 'body', 'items', 'relics', 'behaviorLogger', 'behaviorMatrix']) {
            if (source[key] != null) slot[key] = clone(source[key]);
        }
        slot.bestFloor = Math.max(slot.bestFloor || 1, slot.progress.floor);
        slot.bestStage = slot.bestFloor === slot.progress.floor
            ? Math.max(slot.bestStage || 1, slot.progress.stage)
            : slot.bestStage;
        saveMeta(meta);
        return clone(slot);
    }

    function loadGhostArchive() {
        const raw = loadJson(GHOST_STORAGE_KEY, {});
        return raw && typeof raw === 'object' ? raw : {};
    }

    function saveGhostArchive(archive) {
        return saveJson(GHOST_STORAGE_KEY, archive || {});
    }

    function archiveGhost(actor, progress, killedBy) {
        const ghost = snapshotAdventurerForGhost(actor, progress, killedBy);
        const archive = loadGhostArchive();
        const key = ghost.positionKey;
        if (!Array.isArray(archive[key])) archive[key] = [];
        archive[key].push(ghost);
        saveGhostArchive(archive);
        return clone(ghost);
    }

    function getGhostsAt(progress) {
        const key = getDungeonPositionKey(progress);
        const archive = loadGhostArchive();
        return clone(Array.isArray(archive[key]) ? archive[key] : []);
    }

    function getGhostCombatPower(ghost) {
        const stats = normalizeHumanStats(ghost && ghost.stats || {});
        const statScore = stats.str + stats.def + stats.hp + stats.int + stats.wis + stats.agi;
        const items = Array.isArray(ghost && ghost.items)
            ? ghost.items
            : ghost && ghost.fullSpec && Array.isArray(ghost.fullSpec.items)
              ? ghost.fullSpec.items
              : [];
        const equipmentScore = items.reduce((sum, item) => {
            if (!item) return sum;
            const attack = item.type === 'atk' || item.type === 'ring' || item.type === 'rune' ? Number(item.value) || 0 : 0;
            const hp = item.type === 'hp' ? Number(item.value) || 0 : Number(item.hpBonus) || 0;
            return sum + attack + hp / 5 + (Number(item.def) || 0) * 2 +
                (Number(item.critBonus) || 0) * 1.5 +
                (Number(item.critMult) || 0) * 60 +
                (Number(item.lifesteal) || 0) * 100 +
                (Number(item.damageReduction) || 0) * 120;
        }, 0);
        const magic = Array.isArray(ghost && ghost.magic) ? ghost.magic : [];
        const mastery = ghost && ghost.mastery && typeof ghost.mastery === 'object' ? ghost.mastery : {};
        const magicMastery = Number(mastery.magic || mastery.holyMagic || mastery.twistedMagic) || 0;
        const magicScore = magic.length * 15 + magicMastery * 0.5;
        return Math.max(1, statScore + equipmentScore + magicScore);
    }

    function getGhostEncounter(progress, random) {
        const ghosts = getGhostsAt(progress);
        if (!ghosts.length) return null;
        const rng = typeof random === 'function' ? random : Math.random;
        const weighted = ghosts.map((ghost) => ({ ghost, weight: getGhostCombatPower(ghost) }));
        const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = rng() * total;
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) return clone(entry.ghost);
        }
        return clone(weighted[weighted.length - 1].ghost);
    }

    function markPermanentDeath(slotId, actor, progress, killedBy) {
        const meta = loadMeta();
        const slot = meta.slots.find((entry) => entry.id === slotId);
        if (!slot || slot.permanentDeath) return slot ? { slot: clone(slot), ghost: null } : null;
        const fullActor = {
            ...clone(slot),
            ...clone(actor || {}),
            id: slot.id,
            stats: normalizeHumanStats((actor && actor.stats) || slot.stats),
            party: normalizeAdventurerParty((actor && actor.party) || slot.party),
            progress: normalizeDungeonProgress(progress || (actor && actor.progress) || slot.progress),
        };
        const ghost = archiveGhost(fullActor, fullActor.progress, killedBy);
        slot.permanentDeath = true;
        slot.hp = 0;
        slot.diedAt = Date.now();
        slot.deathPosition = normalizeDungeonProgress(fullActor.progress);
        slot.ghostId = ghost.ghostId;
        slot.progress = normalizeDungeonProgress(fullActor.progress);
        slot.stats = clone(fullActor.stats);
        slot.party = clone(fullActor.party);
        slot.equipment = clone(fullActor.equipment || slot.equipment);
        slot.magic = clone(fullActor.magic || slot.magic);
        slot.skills = clone(fullActor.skills || slot.skills);
        slot.mastery = clone(fullActor.mastery || slot.mastery);
        slot.statuses = clone(fullActor.statuses || slot.statuses);
        slot.body = clone(fullActor.body || slot.body);
        slot.items = clone(fullActor.items || slot.items);
        slot.relics = clone(fullActor.relics || slot.relics);
        slot.behaviorLogger = clone(fullActor.behaviorLogger || slot.behaviorLogger);
        slot.behaviorMatrix = clone(fullActor.behaviorMatrix || slot.behaviorMatrix);
        meta.deadAdventurers = Array.isArray(meta.deadAdventurers) ? meta.deadAdventurers : [];
        meta.deadAdventurers.push(clone(slot));
        meta.slots = meta.slots.filter((entry) => entry.id !== slotId);
        if (meta.activeSlotId === slotId) meta.activeSlotId = null;
        saveMeta(meta);
        clearRunSnapshot(slotId);
        return { slot: clone(slot), ghost };
    }

    function getSnapshotMap() {
        const value = loadJson(SNAPSHOT_STORAGE_KEY, {});
        return value && typeof value === 'object' ? value : {};
    }

    function setRunSnapshot(slotId, payload) {
        const slot = getSlotById(slotId);
        const progress = normalizeDungeonProgress(payload && payload.player && payload.player.progress || slot && slot.progress);
        if (!slot || slot.permanentDeath || !canReturnToBaseCamp(progress)) return false;
        const map = getSnapshotMap();
        map[slotId] = clone(payload);
        saveJson(SNAPSHOT_STORAGE_KEY, map);
        return true;
    }

    function getRunSnapshot(slotId) {
        const slot = getSlotById(slotId);
        if (!slot || slot.permanentDeath) return null;
        const map = getSnapshotMap();
        return clone(map[slotId] || null);
    }

    function clearRunSnapshot(slotId) {
        const map = getSnapshotMap();
        delete map[slotId];
        saveJson(SNAPSHOT_STORAGE_KEY, map);
    }

    function updateBestFloor(slotId, floor, stage) {
        const meta = loadMeta();
        const slot = meta.slots.find((entry) => entry.id === slotId);
        if (!slot) return false;
        const progress = normalizeDungeonProgress({ floor, stage: stage || 1 });
        if (progress.floor > slot.bestFloor || (progress.floor === slot.bestFloor && progress.stage > slot.bestStage)) {
            slot.bestFloor = progress.floor;
            slot.bestStage = progress.stage;
        }
        slot.progress = progress;
        saveMeta(meta);
        return true;
    }

    function isBaseCampFloor(floorRef) {
        const progress = typeof floorRef === 'object'
            ? normalizeDungeonProgress(floorRef)
            : normalizeDungeonProgress({ floor: floorRef, stage: 1 });
        return canReturnToBaseCamp(progress);
    }

    function recalcTechBonus(slot) {
        if (!slot) return null;
        slot.party = normalizeAdventurerParty(slot.party);
        slot.campPerma = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
        slot.campApplied = slot.campApplied || { hp: 0, atk: 0, def: 0 };
        const pending = {
            hp: Math.max(0, (slot.campPerma.hp || 0) - (slot.campApplied.hp || 0)),
            atk: Math.max(0, (slot.campPerma.atk || 0) - (slot.campApplied.atk || 0)),
            def: Math.max(0, (slot.campPerma.def || 0) - (slot.campApplied.def || 0)),
        };
        slot.party.forEach((member) => {
            const oldMaxHp = member.maxHp;
            member.stats.hp = Math.min(100, member.stats.hp + pending.hp);
            member.stats.str = Math.min(100, member.stats.str + pending.atk);
            member.stats.def = Math.min(100, member.stats.def + pending.def);
            member.maxHp = getMaxHpFromStat(member.stats.hp);
            member.hp = Math.min(member.maxHp, Math.max(0, member.hp + Math.max(0, member.maxHp - oldMaxHp)));
        });
        slot.campApplied = {
            hp: Math.max(0, slot.campPerma.hp || 0),
            atk: Math.max(0, slot.campPerma.atk || 0),
            def: Math.max(0, slot.campPerma.def || 0),
        };
        slot.stats = clone(slot.party[0].stats);
        slot.maxHp = slot.party.reduce((sum, member) => sum + member.maxHp, 0);
        slot.hp = slot.party.reduce((sum, member) => sum + member.hp, 0);
        slot.techBonus = {
            hp: (slot.campPerma.hp || 0) * 5,
            atk: slot.campPerma.atk || 0,
            def: slot.campPerma.def || 0,
            acc: 0,
            crit: slot.campPerma.crit || 0,
            critMult: (slot.campPerma.cm || 0) * 0.1,
        };
        return slot.techBonus;
    }

    function getCampStatGrowthBonus(slot, key, level) {
        const lv = Math.max(0, Math.floor(Number(level == null ? slot && slot.campPerma && slot.campPerma[key] : level) || 0));
        if (key === 'hp') return lv * 5;
        if (key === 'atk' || key === 'def') return lv;
        return 0;
    }

    function getActiveFileIndex() {
        const value = Number(localStorage.getItem(ACTIVE_FILE_KEY));
        return Number.isInteger(value) && value >= 0 && value < SAVE_SLOT_COUNT ? value : 0;
    }
    function setActiveSaveFileIndex(index) {
        const value = Math.max(0, Math.min(SAVE_SLOT_COUNT - 1, Math.floor(Number(index) || 0)));
        localStorage.setItem(ACTIVE_FILE_KEY, String(value));
        return true;
    }
    function clearSaveFile() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
        return true;
    }

    const MetaRPG = {
        STORAGE_KEY,
        GHOST_STORAGE_KEY,
        SAVE_SLOT_COUNT,
        MAX_SLOTS,
        BASE_CAMP_FLOORS,
        TECH_NODES,
        FLOOR_QUESTS,
        loadMeta,
        saveMeta,
        getSlotById,
        createCharacter,
        setActiveSlot,
        syncRunProgress,
        archiveGhost,
        getGhostsAt,
        getGhostEncounter,
        getGhostCombatPower,
        markPermanentDeath,
        setRunSnapshot,
        getRunSnapshot,
        clearRunSnapshot,
        updateBestFloor,
        isBaseCampFloor,
        getActiveFileIndex,
        setActiveSaveFileIndex,
        clearSaveFile,
        getSaveFileSlotCount: () => SAVE_SLOT_COUNT,
        peekMetaAtFileIndex: () => loadMeta(),
        slotFileKey: () => STORAGE_KEY,
        recalcTechBonus,
        getCampStatGrowthBonus,
        getTechNodesForSlot: () => [],
        canPurchaseNode: () => false,
        purchaseTechNode: () => ({ ok: false }),
        commitTechPurchase: () => ({ ok: false }),
        getTechNodeById: () => null,
        expToNextLevel: () => Infinity,
        addExpToSlot: () => ({ level: 1, exp: 0, need: Infinity }),
        getLevelRuntimeBonus: () => ({ hp: 0, atk: 0, def: 0, acc: 0 }),
        getRebirthGoldCost: () => Infinity,
        getRebirthMinFloor: () => Infinity,
        applyReincarnation: () => ({ ok: false, msg: '영구 데스 규칙에서는 환생할 수 없습니다.' }),
        applyQuestPenalty: () => false,
        grantQuestReward: () => false,
        computeSynergyBonuses: () => ({ atk: 0, hp: 0, def: 0, acc: 0, crit: 0, critMult: 0, desc: [], progress: [] }),
        hasJobSlot: () => loadMeta().slots.some((slot) => !slot.permanentDeath),
        markRunCheckpoint: () => false,
        revertRunToCheckpoint: () => false,
        grantTacticalSkillToSlot: () => false,
        preserveRescueInventory: () => 0,
        getRescuedItems: () => [],
        wipeSavedRunAndResetMetaLevel(slotId) {
            clearRunSnapshot(slotId);
            return true;
        },
        deleteSlot(id) {
            const meta = loadMeta();
            const index = meta.slots.findIndex((slot) => slot.id === id);
            if (index < 0) return false;
            meta.slots.splice(index, 1);
            if (meta.activeSlotId === id) meta.activeSlotId = null;
            saveMeta(meta);
            clearRunSnapshot(id);
            return true;
        },
        addSavedGold(amount) {
            const meta = loadMeta();
            meta.savedGold = Math.max(0, meta.savedGold + Math.max(0, Number(amount) || 0));
            saveMeta(meta);
            return meta.savedGold;
        },
        migrateLegacyOnce: () => false,
    };

    global.MetaRPG = MetaRPG;
    global.BASE_CAMP_FLOORS = BASE_CAMP_FLOORS;
})(typeof window !== 'undefined' ? window : globalThis);

const MetaRPG = (typeof window !== 'undefined' ? window.MetaRPG : globalThis.MetaRPG);
const BASE_CAMP_FLOORS = (typeof window !== 'undefined' ? window.BASE_CAMP_FLOORS : globalThis.BASE_CAMP_FLOORS);
