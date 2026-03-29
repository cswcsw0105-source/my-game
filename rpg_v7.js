/**
 * 던전 v7 — 메타 진행(다중 캐릭터·테크트리·베이스캠프·퀘스트·시너지)
 * game.js에서 MetaRPG.* 호출
 */
(function (global) {
    const STORAGE_KEY = 'dungeon_meta_v7';
    /** 레거시 단일 저장 키 — migrate 후 파일 슬롯으로 이관 */
    const LEGACY_META_KEY = 'dungeon_meta_v7';
    const SAVE_SLOT_COUNT = 3;
    const ACTIVE_FILE_KEY = 'dungeon_meta_v7_active_file';
    const FILE_MIG_FLAG = 'dungeon_meta_v7_file_migrated_v2';

    function slotFileKey(i) {
        return 'dungeon_meta_v7_f' + i;
    }

    function getActiveFileIndex() {
        const v = parseInt(localStorage.getItem(ACTIVE_FILE_KEY) || '0', 10);
        return v >= 0 && v < SAVE_SLOT_COUNT ? v : 0;
    }

    function migrateLegacyMetaToFileSlots() {
        if (localStorage.getItem(FILE_MIG_FLAG)) return;
        try {
            const leg = localStorage.getItem(LEGACY_META_KEY);
            if (leg && !localStorage.getItem(slotFileKey(0))) {
                localStorage.setItem(slotFileKey(0), leg);
            }
        } catch (e) {
            /* ignore */
        }
        localStorage.setItem(FILE_MIG_FLAG, '1');
    }

    const MAX_SLOTS = 4;

    /** 30층 이상에서 상점을 통해서만 베이스캠프 UI (레거시 호환: 층>=30) */
    const BASE_CAMP_FLOORS = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

    function uid() {
        return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function defaultMeta() {
        return {
            version: 1,
            savedGold: 0,
            activeSlotId: null,
            slots: [],
        };
    }

    function ensureSlotV703(s) {
        if (!s) return;
        if (!s.campPerma) s.campPerma = { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
        if (s.reincarnationCount == null) s.reincarnationCount = 0;
        if (!s.rebirthStatBonus) s.rebirthStatBonus = { hp: 0, atk: 0, def: 0, acc: 0 };
        if (!s.rebirthPctBonus) s.rebirthPctBonus = { atkPct: 0, defPct: 0, critMultPct: 0 };
        if (s.bestFloor == null) s.bestFloor = 1;
        /** A/B 라인 고정 제거 — 테크는 직업 내 노드 자유 조합 */
        if (s.techLine === 'A' || s.techLine === 'B') s.techLine = null;
    }

    function loadMeta() {
        migrateLegacyMetaToFileSlots();
        try {
            const raw = localStorage.getItem(slotFileKey(getActiveFileIndex()));
            if (!raw) return defaultMeta();
            const o = JSON.parse(raw);
            if (!o || typeof o !== 'object') return defaultMeta();
            if (!Array.isArray(o.slots)) o.slots = [];
            if (o.savedGold == null) o.savedGold = 0;
            o.slots.forEach(ensureSlotV703);
            return o;
        } catch (e) {
            return defaultMeta();
        }
    }

    function saveMeta(m) {
        localStorage.setItem(slotFileKey(getActiveFileIndex()), JSON.stringify(m));
    }

    function setActiveSaveFileIndex(i) {
        if (i < 0 || i >= SAVE_SLOT_COUNT) return false;
        localStorage.setItem(ACTIVE_FILE_KEY, String(i));
        return true;
    }

    function clearSaveFile(i) {
        if (i < 0 || i >= SAVE_SLOT_COUNT) return false;
        localStorage.removeItem(slotFileKey(i));
        return true;
    }

    function getSaveFileSlotCount() {
        return SAVE_SLOT_COUNT;
    }

    /** 현재 활성 파일을 바꾸지 않고 i번 슬롯 메타만 읽기 (허브 UI용) */
    function peekMetaAtFileIndex(i) {
        migrateLegacyMetaToFileSlots();
        if (i < 0 || i >= SAVE_SLOT_COUNT) return defaultMeta();
        try {
            const raw = localStorage.getItem(slotFileKey(i));
            if (!raw) return defaultMeta();
            const o = JSON.parse(raw);
            if (!o || typeof o !== 'object') return defaultMeta();
            if (!Array.isArray(o.slots)) o.slots = [];
            if (o.savedGold == null) o.savedGold = 0;
            o.slots.forEach(ensureSlotV703);
            return o;
        } catch (e) {
            return defaultMeta();
        }
    }

    /** 구 v6 영구 강화 → 첫 슬롯으로 1회 이관 */
    function migrateLegacyOnce() {
        if (localStorage.getItem('meta_v7_legacy_migrated')) return;
        const m = loadMeta();
        if (m.slots.length > 0) {
            localStorage.setItem('meta_v7_legacy_migrated', '1');
            return;
        }
        try {
            const ps = JSON.parse(localStorage.getItem('perma_stats') || '{}');
            const sg = parseInt(localStorage.getItem('saved_gold') || '0', 10) || 0;
            const hp = Math.max(0, Number(ps.hp) || 0);
            const atk = Math.max(0, Number(ps.atk) || 0);
            const def = Math.max(0, Number(ps.def) || 0);
            const acc = Math.max(0, Number(ps.acc) || 0);
            if (hp + atk + def + acc > 0 || sg > 0) {
                m.slots.push({
                    id: uid(),
                    name: '이전 모험가',
                    jobKey: 'Warrior',
                    techLine: null,
                    techPurchased: [],
                    legacyPerma: { hp, atk, def, acc },
                    extraPerma: { hp: 0, atk: 0, def: 0, acc: 0 },
                    campPerma: { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 },
                    level: 1,
                    exp: 0,
                    metaPenalty: { hp: 0, atk: 0, def: 0, acc: 0 },
                    questFlags: {},
                    reincarnationCount: 0,
                    rebirthStatBonus: { hp: 0, atk: 0, def: 0, acc: 0 },
                });
                m.activeSlotId = m.slots[0].id;
                m.savedGold = sg;
                saveMeta(m);
            }
        } catch (e) { /* ignore */ }
        localStorage.setItem('meta_v7_legacy_migrated', '1');
    }

    /** 테크 노드 정의 — line A/B는 생성 시 고정, 변경 불가 */
    function buildTechNodes() {
        const W = 'Warrior',
            H = 'Hunter',
            Wz = 'Wizard',
            Mc = 'MercenaryCaptain';
        const nodes = [
            // Warrior A — 화력
            { id: 'W_A_1', jobKey: W, line: 'A', name: '침투: 근력 I', cost: 60, requires: [], effect: { atk: 4 } },
            { id: 'W_A_2', jobKey: W, line: 'A', name: '침투: 근력 II', cost: 110, requires: ['W_A_1'], effect: { atk: 7 } },
            { id: 'W_A_3', jobKey: W, line: 'A', name: '침투: 치명 각성', cost: 160, requires: ['W_A_2'], effect: { atk: 5, acc: 3 } },
            // Warrior B — 생존
            { id: 'W_B_1', jobKey: W, line: 'B', name: '철벽: 체력 I', cost: 60, requires: [], effect: { hp: 45 } },
            { id: 'W_B_2', jobKey: W, line: 'B', name: '철벽: 방어', cost: 110, requires: ['W_B_1'], effect: { hp: 35, def: 3 } },
            { id: 'W_B_3', jobKey: W, line: 'B', name: '철벽: 불굴', cost: 160, requires: ['W_B_2'], effect: { def: 5, hp: 40 } },
            // Hunter A
            { id: 'H_A_1', jobKey: H, line: 'A', name: '추적: 민첩', cost: 60, requires: [], effect: { atk: 3, acc: 4 } },
            { id: 'H_A_2', jobKey: H, line: 'A', name: '추적: 약점', cost: 110, requires: ['H_A_1'], effect: { atk: 8 } },
            { id: 'H_A_3', jobKey: H, line: 'A', name: '추적: 일격', cost: 160, requires: ['H_A_2'], effect: { atk: 6, acc: 5 } },
            // Hunter B
            { id: 'H_B_1', jobKey: H, line: 'B', name: '은신: 체력', cost: 60, requires: [], effect: { hp: 40 } },
            { id: 'H_B_2', jobKey: H, line: 'B', name: '은신: 회피 명중', cost: 110, requires: ['H_B_1'], effect: { acc: 10, hp: 25 } },
            { id: 'H_B_3', jobKey: H, line: 'B', name: '은신: 흡혈 각성', cost: 160, requires: ['H_B_2'], effect: { atk: 5, hp: 30 } },
            // Wizard A
            { id: 'Z_A_1', jobKey: Wz, line: 'A', name: '마도: 파괴 I', cost: 60, requires: [], effect: { atk: 6 } },
            { id: 'Z_A_2', jobKey: Wz, line: 'A', name: '마도: 파괴 II', cost: 110, requires: ['Z_A_1'], effect: { atk: 10 } },
            { id: 'Z_A_3', jobKey: Wz, line: 'A', name: '마도: 폭풍', cost: 160, requires: ['Z_A_2'], effect: { atk: 8, acc: 4 } },
            // Wizard B
            { id: 'Z_B_1', jobKey: Wz, line: 'B', name: '결계: 체력', cost: 60, requires: [], effect: { hp: 35, def: 2 } },
            { id: 'Z_B_2', jobKey: Wz, line: 'B', name: '결계: 방벽', cost: 110, requires: ['Z_B_1'], effect: { hp: 50, def: 3 } },
            { id: 'Z_B_3', jobKey: Wz, line: 'B', name: '결계: 봉인', cost: 160, requires: ['Z_B_2'], effect: { def: 6, hp: 40 } },
            // MercenaryCaptain (지휘·생존)
            { id: 'M_A_1', jobKey: Mc, line: 'A', name: '지휘: 보급', cost: 60, requires: [], effect: { atk: 2, hp: 30 } },
            { id: 'M_A_2', jobKey: Mc, line: 'A', name: '지휘: 전술', cost: 110, requires: ['M_A_1'], effect: { atk: 4, acc: 5 } },
            { id: 'M_B_1', jobKey: Mc, line: 'B', name: '생존: 체력', cost: 60, requires: [], effect: { hp: 55 } },
            { id: 'M_B_2', jobKey: Mc, line: 'B', name: '생존: 방어', cost: 110, requires: ['M_B_1'], effect: { hp: 45, def: 4 } },
        ];
        return nodes;
    }

    const TECH_NODES = buildTechNodes();

    function getSlotById(id) {
        const m = loadMeta();
        return m.slots.find((s) => s.id === id) || null;
    }

    function recalcTechBonus(slot) {
        const bought = new Set(slot.techPurchased || []);
        const techMult = 1 + Math.min(3, slot.reincarnationCount || 0) * 0.05;
        let hp = 0,
            atk = 0,
            def = 0,
            acc = 0;
        const jb = slot.jobKey;
        for (const n of TECH_NODES) {
            if (!bought.has(n.id)) continue;
            if (n.jobKey !== jb) continue;
            const e = n.effect || {};
            hp += (e.hp || 0) * techMult;
            atk += (e.atk || 0) * techMult;
            def += (e.def || 0) * techMult;
            acc += (e.acc || 0) * techMult;
        }
        const cp = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
        /** 베이스캠프 영구: 단계당 체력/공/방 상향, 치명 1%/단계·배율 +0.10/단계 (무한) */
        hp += (cp.hp || 0) * 32;
        atk += (cp.atk || 0) * 5;
        def += (cp.def || 0) * 3;
        const critFromCamp = (cp.crit || 0) * 1.0;
        const cmFromCamp = (cp.cm || 0) * 0.1;
        const leg = slot.legacyPerma || { hp: 0, atk: 0, def: 0, acc: 0 };
        const ex = slot.extraPerma || { hp: 0, atk: 0, def: 0, acc: 0 };
        const pen = slot.metaPenalty || { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.techBonus = {
            hp: Math.max(0, hp + (leg.hp || 0) + (ex.hp || 0) - (pen.hp || 0)),
            atk: Math.max(0, atk + (leg.atk || 0) + (ex.atk || 0) - (pen.atk || 0)),
            def: Math.max(0, def + (leg.def || 0) + (ex.def || 0) - (pen.def || 0)),
            acc: Math.max(0, acc + (leg.acc || 0) + (ex.acc || 0) - (pen.acc || 0)),
            crit: critFromCamp,
            critMult: cmFromCamp,
        };
    }

    function getTechNodesForSlot(slot) {
        if (!slot || !slot.jobKey) return [];
        return TECH_NODES.filter((n) => n.jobKey === slot.jobKey);
    }

    function canPurchaseNode(slot, nodeId) {
        const n = TECH_NODES.find((x) => x.id === nodeId);
        if (!n || n.jobKey !== slot.jobKey) return false;
        if ((slot.techPurchased || []).includes(nodeId)) return false;
        const bought = new Set(slot.techPurchased || []);
        for (const r of n.requires || []) {
            if (!bought.has(r)) return false;
        }
        return true;
    }

    function purchaseTechNode(slotId, nodeId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return { ok: false, msg: '슬롯 없음' };
        if (!canPurchaseNode(slot, nodeId)) return { ok: false, msg: '구매 불가(선행 또는 라인 불일치)' };
        const n = TECH_NODES.find((x) => x.id === nodeId);
        const cost = n.cost || 0;
        if (m.savedGold < cost) return { ok: false, msg: '보존 골드 부족' };
        m.savedGold -= cost;
        slot.techPurchased = slot.techPurchased || [];
        slot.techPurchased.push(nodeId);
        recalcTechBonus(slot);
        saveMeta(m);
        return { ok: true, msg: n.name };
    }

    function expToNextLevel(lv) {
        return Math.floor(32 + lv * 18 + lv * lv * 0.35);
    }

    function addExpToSlot(slotId, amount) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return null;
        slot.level = Math.max(1, slot.level || 1);
        slot.exp = Math.max(0, (slot.exp || 0) + amount);
        let need = expToNextLevel(slot.level);
        while (slot.exp >= need) {
            slot.exp -= need;
            slot.level += 1;
            need = expToNextLevel(slot.level);
        }
        saveMeta(m);
        return { level: slot.level, exp: slot.exp, need };
    }

    /** 레벨에 따른 런타임 보너스 (소량) */
    function getLevelRuntimeBonus(level) {
        const lv = Math.max(1, level || 1);
        return {
            hp: Math.floor((lv - 1) * 4),
            atk: Math.floor((lv - 1) * 0.6),
            def: Math.floor((lv - 1) * 0.35),
            acc: Math.floor((lv - 1) * 0.25),
        };
    }

    function hasJobSlot(jobKey) {
        const m = loadMeta();
        return m.slots.some((s) => s.jobKey === jobKey);
    }

    function getRebirthGoldCost(slot) {
        const c = slot.reincarnationCount || 0;
        if (c >= 3) return Infinity;
        return 6000 + c * 10000;
    }

    function getRebirthMinFloor() {
        return 500;
    }

    function updateBestFloor(slotId, floor) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return 1;
        const f = Math.max(1, Math.floor(Number(floor) || 1));
        slot.bestFloor = Math.max(1, slot.bestFloor || 1, f);
        saveMeta(m);
        return slot.bestFloor;
    }

    /** 환생: 런 아이템·영구강화(캠프) 초기화, 환생 보너스 누적, 최대 3회 */
    function applyReincarnation(slotId, options) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return { ok: false, msg: '슬롯 없음' };
        const cur = slot.reincarnationCount || 0;
        if (cur >= 3) return { ok: false, msg: '환생은 최대 3회까지입니다.' };
        const needFloor = getRebirthMinFloor();
        const bestFloor = Math.max(1, slot.bestFloor || 1);
        if (bestFloor < needFloor) return { ok: false, msg: '환생 조건 미달 (최고 ' + bestFloor + '층, 필요 ' + needFloor + '층)' };
        const cost = getRebirthGoldCost(slot);
        if (options && options.payGold && m.savedGold < cost) return { ok: false, msg: '보존 골드 부족 (' + cost + 'G 필요)' };
        if (options && options.payGold) m.savedGold = Math.max(0, m.savedGold - cost);
        slot.reincarnationCount = cur + 1;
        /** 환생 후 이전 런 스냅샷·체크포인트 제거 (저장 런 잔존 버그 방지) */
        slot.runSnapshot = null;
        slot.runCheckpointMeta = { level: 1, exp: 0 };
        slot.level = 1;
        slot.exp = 0;
        /** 영구 연구(테크)도 환생 시 초기화 */
        slot.techLine = null;
        slot.techPurchased = [];
        slot.campPerma = { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
        slot.legacyPerma = { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.extraPerma = { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.metaPenalty = { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.questFlags = {};
        slot.rebirthStatBonus = slot.rebirthStatBonus || { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.rebirthPctBonus = slot.rebirthPctBonus || { atkPct: 0, defPct: 0, critMultPct: 0 };
        slot.rebirthPctBonus.atkPct += 10;
        slot.rebirthPctBonus.defPct += 10;
        slot.rebirthPctBonus.critMultPct += 10;
        recalcTechBonus(slot);
        saveMeta(m);
        return { ok: true, cost };
    }

    function createCharacter(name, jobKey) {
        const m = loadMeta();
        if (m.slots.length >= MAX_SLOTS) return { ok: false, msg: '슬롯 가득 (최대 ' + MAX_SLOTS + ')' };
        const slot = {
            id: uid(),
            name: name || '무명',
            jobKey,
            techLine: null,
            techPurchased: [],
            legacyPerma: { hp: 0, atk: 0, def: 0, acc: 0 },
            extraPerma: { hp: 0, atk: 0, def: 0, acc: 0 },
            campPerma: { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 },
            level: 1,
            exp: 0,
            metaPenalty: { hp: 0, atk: 0, def: 0, acc: 0 },
            questFlags: {},
            reincarnationCount: 0,
            rebirthStatBonus: { hp: 0, atk: 0, def: 0, acc: 0 },
            rebirthPctBonus: { atkPct: 0, defPct: 0, critMultPct: 0 },
            bestFloor: 1,
        };
        recalcTechBonus(slot);
        m.slots.push(slot);
        m.activeSlotId = slot.id;
        saveMeta(m);
        return { ok: true, slot };
    }

    function applyQuestPenalty(slotId, penalty) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.metaPenalty = slot.metaPenalty || { hp: 0, atk: 0, def: 0, acc: 0 };
        const p = penalty || {};
        if (p.hp) slot.metaPenalty.hp += p.hp;
        if (p.atk) slot.metaPenalty.atk += p.atk;
        if (p.def) slot.metaPenalty.def += p.def;
        if (p.acc) slot.metaPenalty.acc += p.acc;
        if (p.goldLoss && m.savedGold > 0) {
            m.savedGold = Math.max(0, Math.floor(m.savedGold * (1 - p.goldLoss)));
        }
        recalcTechBonus(slot);
        saveMeta(m);
    }

    function grantQuestReward(slotId, reward, questId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot || !reward) return;
        if (reward.perma) {
            slot.extraPerma = slot.extraPerma || { hp: 0, atk: 0, def: 0, acc: 0 };
            if (reward.perma.hp) slot.extraPerma.hp += reward.perma.hp;
            if (reward.perma.atk) slot.extraPerma.atk += reward.perma.atk;
            if (reward.perma.def) slot.extraPerma.def += reward.perma.def;
            if (reward.perma.acc) slot.extraPerma.acc += reward.perma.acc;
        }
        if (questId) {
            slot.questFlags = slot.questFlags || {};
            slot.questFlags[questId] = true;
        }
        recalcTechBonus(slot);
        saveMeta(m);
    }

    /** 장착 아이템 시너지 — data.js synergyRules(등급 조합) + 아이템 tags */
    function computeSynergyBonuses(player) {
        const out = { atk: 0, hp: 0, def: 0, acc: 0, crit: 0, critMult: 0, desc: [], progress: [] };
        if (!player || !player.items) return out;
        const tags = new Set();
        const tagCounts = {};
        for (const it of player.items) {
            if (!it) continue;
            const tg = it.tags || it.tagList;
            if (Array.isArray(tg)) {
                tg.forEach((t) => {
                    tags.add(t);
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                });
            }
            // 기본 태그 자동 부여(등급/타입 기반)
            if (it.rarity) {
                const rt = 'rarity_' + String(it.rarity);
                tags.add(rt);
                tagCounts[rt] = (tagCounts[rt] || 0) + 1;
            }
            if (it.type) {
                const tt = 'type_' + String(it.type);
                tags.add(tt);
                tagCounts[tt] = (tagCounts[tt] || 0) + 1;
            }
        }
        const rules = typeof synergyRules !== 'undefined' ? synergyRules : [];
        for (const rule of rules) {
            if (!rule) continue;
            let cur = 0,
                need = 0,
                ok = false;
            if (rule.fromTag && rule.needCount) {
                cur = tagCounts[rule.fromTag] || 0;
                need = rule.needCount;
                ok = cur >= need;
            } else if (rule.needTags) {
                const req = Array.isArray(rule.needTags) ? rule.needTags : [];
                need = req.length;
                cur = req.filter((t) => tags.has(t)).length;
                ok = need > 0 && cur >= need;
            } else {
                continue;
            }
            out.progress.push({
                id: rule.id || '',
                name: rule.name || '시너지',
                cur,
                need,
                active: ok,
                effectDesc: rule.effectDesc || '',
                detailDesc: rule.detailDesc || '',
                bonus: rule.bonus || {},
            });
            if (!ok) continue;
            const b = rule.bonus || {};
            out.atk += b.atk || 0;
            out.hp += b.hp || 0;
            out.def += b.def || 0;
            out.acc += b.acc || 0;
            out.crit += b.crit || 0;
            out.critMult += b.critMult || 0;
            if (rule.name) out.desc.push(rule.name);
        }
        return out;
    }

    /** 층별 리스크 퀘스트 정의 */
    const FLOOR_QUESTS = {
        12: {
            id: 'q12',
            title: '심연의 시험',
            desc: '이 층에서 <b>연속 2전 승리</b> 없이 패배하면 패널티.',
            needWins: 2,
            reward: { perma: { atk: 3, hp: 20 } },
            failPenalty: { atk: 2, hp: 15, goldLoss: 0.15 },
        },
        20: {
            id: 'q20',
            title: '보스 토벌',
            desc: '<b>20층 보스</b>를 처치하면 보상. 층 이탈 시 실패.',
            needBoss: 1,
            reward: { perma: { def: 4, atk: 4 } },
            failPenalty: { def: 3, atk: 3, goldLoss: 0.2 },
        },
    };

    function isBaseCampFloor(f) {
        return typeof f === 'number' && f >= 30;
    }

    function markRunCheckpoint(slotId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.runCheckpointMeta = { level: Math.max(1, slot.level || 1), exp: Math.max(0, slot.exp || 0) };
        saveMeta(m);
    }

    function revertRunToCheckpoint(slotId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot || !slot.runCheckpointMeta) return;
        const c = slot.runCheckpointMeta;
        slot.level = Math.max(1, c.level || 1);
        slot.exp = Math.max(0, c.exp || 0);
        saveMeta(m);
    }

    function setRunSnapshot(slotId, obj) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.runSnapshot = obj;
        saveMeta(m);
    }

    function clearRunSnapshot(slotId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.runSnapshot = null;
        saveMeta(m);
    }

    /** 저장 런 스냅샷 제거 + 런 체크포인트·메타 레벨·EXP 초기화 (저장 삭제 확정 시) */
    function wipeSavedRunAndResetMetaLevel(slotId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.runSnapshot = null;
        slot.runCheckpointMeta = { level: 1, exp: 0 };
        slot.level = 1;
        slot.exp = 0;
        recalcTechBonus(slot);
        saveMeta(m);
    }

    function getRunSnapshot(slotId) {
        const slot = getSlotById(slotId);
        return slot && slot.runSnapshot ? slot.runSnapshot : null;
    }

    /** 보존 골드 없이 테크만 구매 처리 (런 골드는 game.js에서 차감) */
    function commitTechPurchase(slotId, nodeId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return { ok: false, msg: '슬롯 없음' };
        if (!canPurchaseNode(slot, nodeId)) return { ok: false, msg: '구매 불가(선행 또는 라인 불일치)' };
        const n = TECH_NODES.find((x) => x.id === nodeId);
        if (!n) return { ok: false, msg: '노드 없음' };
        slot.techPurchased = slot.techPurchased || [];
        slot.techPurchased.push(nodeId);
        recalcTechBonus(slot);
        saveMeta(m);
        return { ok: true, msg: n.name, cost: n.cost || 0 };
    }

    function getTechNodeById(nodeId) {
        return TECH_NODES.find((x) => x.id === nodeId) || null;
    }

    const MetaRPG = {
        STORAGE_KEY,
        SAVE_SLOT_COUNT,
        LEGACY_META_KEY,
        slotFileKey,
        getActiveFileIndex,
        setActiveSaveFileIndex,
        clearSaveFile,
        getSaveFileSlotCount,
        peekMetaAtFileIndex,
        MAX_SLOTS,
        BASE_CAMP_FLOORS,
        TECH_NODES,
        FLOOR_QUESTS,
        loadMeta,
        saveMeta,
        migrateLegacyOnce,
        getSlotById,
        recalcTechBonus,
        getTechNodesForSlot,
        canPurchaseNode,
        purchaseTechNode,
        expToNextLevel,
        addExpToSlot,
        getLevelRuntimeBonus,
        createCharacter,
        applyQuestPenalty,
        grantQuestReward,
        computeSynergyBonuses,
        isBaseCampFloor,
        expToNextLevel,
        hasJobSlot,
        getRebirthGoldCost,
        getRebirthMinFloor,
        updateBestFloor,
        applyReincarnation,
        markRunCheckpoint,
        revertRunToCheckpoint,
        setRunSnapshot,
        clearRunSnapshot,
        wipeSavedRunAndResetMetaLevel,
        getRunSnapshot,
        commitTechPurchase,
        getTechNodeById,
        setActiveSlot(id) {
            const m = loadMeta();
            if (!m.slots.some((s) => s.id === id)) return false;
            m.activeSlotId = id;
            saveMeta(m);
            return true;
        },
        deleteSlot(id) {
            const m = loadMeta();
            const i = m.slots.findIndex((s) => s.id === id);
            if (i < 0) return false;
            m.slots.splice(i, 1);
            if (m.activeSlotId === id) m.activeSlotId = m.slots[0] ? m.slots[0].id : null;
            saveMeta(m);
            return true;
        },
        addSavedGold(amount) {
            const m = loadMeta();
            m.savedGold = Math.max(0, (m.savedGold || 0) + amount);
            saveMeta(m);
            return m.savedGold;
        },
    };

    migrateLegacyOnce();
    global.MetaRPG = MetaRPG;
    global.BASE_CAMP_FLOORS = BASE_CAMP_FLOORS;
})(typeof window !== 'undefined' ? window : globalThis);
