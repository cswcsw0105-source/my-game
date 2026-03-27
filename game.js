/** 시즌 1 (베타) — 최초 1회 전체 진행 데이터 초기화 */
(function applySeason1BetaWipeOnce() {
    const SK = 'dungeon_season_id';
    const SEASON = '1-beta-wipe-s1full';
    if (localStorage.getItem(SK) === SEASON) return;
    const wipe = [
        'dungeon_meta_v7',
        'dungeon_meta_v7_f0',
        'dungeon_meta_v7_f1',
        'dungeon_meta_v7_f2',
        'dungeon_meta_v7_active_file',
        'dungeon_meta_v7_file_migrated_v2',
        'perma_stats',
        'perma_buy_count',
        'saved_gold',
        'item_collection_v5',
        'unlocked_floors_global',
        'unlocked_floors_워리어',
        'unlocked_floors_헌터',
        'unlocked_floors_마법사',
        'summon_contract_json',
        'summon_altar_done',
        'dungeon_quicksave_v7',
        'perma_migrated_v62',
        'perma_migrated_v651',
        'acc_perma_migrated_v71',
        'v703_global_perma_migrated',
        'meta_v7_legacy_migrated',
        'perma_repair_1',
        'user_exported_save_v7',
    ];
    try {
        wipe.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(SK, SEASON);
    } catch (e) {
        /* ignore */
    }
})();

firebase.initializeApp({
    apiKey: "AIzaSyAVWf5U6eBm2ofCcvdirMxkyfZs_1uVIiU",
    authDomain: "project-dungeon-82f2a.firebaseapp.com",
    projectId: "project-dungeon-82f2a",
    storageBucket: "project-dungeon-82f2a.firebasestorage.app",
    messagingSenderId: "301367810513",
    appId: "1:301367810313:web:42979150db5ea7b536a8f0"
});
const auth = firebase.auth();
const db = firebase.firestore();

if (!localStorage.getItem('perma_migrated_v62')) {
    localStorage.removeItem('perma_stats');
    localStorage.removeItem('perma_buy_count');
    localStorage.removeItem('saved_gold');
    localStorage.setItem('perma_migrated_v62', 'true');
}
if (!localStorage.getItem('perma_migrated_v651')) {
    try {
        const ps = JSON.parse(localStorage.getItem('perma_stats') || '{}');
        if ('potion' in ps) delete ps.potion;
        localStorage.setItem('perma_stats', JSON.stringify(ps));
        const bc = JSON.parse(localStorage.getItem('perma_buy_count') || '{}');
        Object.keys(bc).forEach((k) => { if (k.startsWith('pot_')) delete bc[k]; });
        localStorage.setItem('perma_buy_count', JSON.stringify(bc));
    } catch (e) { /* ignore */ }
    localStorage.setItem('perma_migrated_v651', 'true');
}

let floor = 1, gold = 0, player = null, enemy = null;
let defendingTurns = 0, dodgingTurns = 0, shieldedTurns = 0;
let regenTurns = 0, regenAmount = 0;
let currentShopItems = [];
let currentPotionOffer = null;
let lastEnemyJob = "";
let rerollCost = 10;
let currentUser = null;
let pendingShop = false;
let potionUsedThisTurn = false;
let totalGoldEarned = 0;
let shopVisitCount = 0;
/** 공격 버튼 GCD(광클 방지), 타격감 연출과 동일 500ms */
let attackGcdUntil = 0;
const ATTACK_GCD_MS = 500;
/** 패치 노트/UI와 맞춰 두기 — 캐시 적용 여부 확인용 */
const GAME_BUILD = '7.1.1';
/** 베이스캠프 오버레이 스크롤 유지 */
window.__baseCampScrollTop = 0;
/** 필드 용병 기본 피해 계수(전역 보정) */
const MERC_DMG_GLOBAL_SCALE = 1.56;
/** 층수에 따른 용병 딜/HP 성장 상한(과도한 폭주 방지) */
const MERC_FLOOR_SCALE_CAP = 1.65;
/** 치명 확률 상한 65% — 1% 초과분은 배율로 전환 (1%당 치명 배율 +0.05) */
const CRIT_SOFT_CAP = 65;
const LIFESTEAL_SOFT_CAP = 0.85;
const BASE_HIT_ACCURACY = 75;
const CRIT_OVERFLOW_TO_MULT = 0.01;

function clearSummonRunStorage() {
    localStorage.removeItem('summon_altar_done');
    localStorage.removeItem('summon_contract_json');
}

function loadSummonFromStorage() {
    try {
        const raw = localStorage.getItem('summon_contract_json');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) { return null; }
}

function saveSummonToStorage(s) {
    if (s) localStorage.setItem('summon_contract_json', JSON.stringify(s));
    else localStorage.removeItem('summon_contract_json');
}

/** localStorage 깨짐/부분 저장 대비 — undefined 합산으로 NaN 방지 */
function safeNum(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}
function getPermaStats() {
    try {
        const s = localStorage.getItem('perma_stats');
        let raw = {};
        if (s && s !== 'null' && s !== 'undefined') {
            const p = JSON.parse(s);
            if (p && typeof p === 'object' && !Array.isArray(p)) raw = p;
        }
        return {
            hp: Math.max(0, safeNum(raw.hp, 0)),
            atk: Math.max(0, safeNum(raw.atk, 0)),
            def: Math.max(0, safeNum(raw.def, 0)),
            acc: 0,
        };
    } catch (e) {
        return { hp: 0, atk: 0, def: 0, acc: 0 };
    }
}
function getSavedGold() {
    if (typeof MetaRPG !== 'undefined') {
        const m = MetaRPG.loadMeta();
        return Math.max(0, safeNum(m.savedGold, 0));
    }
    const n = parseInt(String(localStorage.getItem('saved_gold') ?? ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}
function savePermaStats(stats) {
    const s = {
        hp: Math.max(0, safeNum(stats && stats.hp, 0)),
        atk: Math.max(0, safeNum(stats && stats.atk, 0)),
        def: Math.max(0, safeNum(stats && stats.def, 0)),
        acc: 0,
    };
    localStorage.setItem('perma_stats', JSON.stringify(s));
}
/** 한 번만: 깨진 perma_stats를 정상 JSON으로 덮어씀 */
(function repairPermaStorageOnce() {
    try {
        if (localStorage.getItem('perma_repair_1')) return;
        savePermaStats(getPermaStats());
        localStorage.setItem('perma_repair_1', '1');
    } catch (e) { /* ignore */ }
})();
function getPermaBuyCount() { return JSON.parse(localStorage.getItem('perma_buy_count') || '{}'); }
function savePermaBuyCount(counts) { localStorage.setItem('perma_buy_count', JSON.stringify(counts)); }

function getUnlockedFloors(job) {
    const key = job ? `unlocked_floors_${job}` : 'unlocked_floors_global';
    return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveUnlockedFloor(f, job) {
    const key = job ? `unlocked_floors_${job}` : 'unlocked_floors_global';
    const unlocked = getUnlockedFloors(job);
    if (!unlocked.includes(f)) { unlocked.push(f); localStorage.setItem(key, JSON.stringify(unlocked)); }
}

function enterBattleLayout() {
    document.getElementById('sidebar-normal').style.display = 'none';
    document.getElementById('sidebar-battle').style.display = 'flex';
    document.getElementById('log').style.display = 'none';
}
function exitBattleLayout() {
    document.getElementById('sidebar-normal').style.display = 'flex';
    document.getElementById('sidebar-battle').style.display = 'none';
    document.getElementById('log').style.display = 'block';
}
document.addEventListener('DOMContentLoaded', () => {
    exitBattleLayout();
    migrateAccPermaV71();
    console.log('[던전] 클라이언트 빌드 v' + GAME_BUILD + ' — 로그에 이 안 보이면 예전 JS 캐시입니다. 강력 새로고침(Cmd+Shift+R)하세요.');
});

/** 구 명중 영구강화 제거 + 골드 환불 (1회) */
function migrateAccPermaV71() {
    if (localStorage.getItem('acc_perma_migrated_v71')) return;
    let refund = 0;
    const buyCounts = getPermaBuyCount();
    let hadAccBuy = false;
    for (let i = 1; i <= 20; i++) {
        const id = 'acc_' + i;
        if (buyCounts[id]) {
            hadAccBuy = true;
            refund += typeof legacyAccUpgradePrice === 'function' ? legacyAccUpgradePrice(i) : 0;
            delete buyCounts[id];
        }
    }
    savePermaBuyCount(buyCounts);
    const ps = getPermaStats();
    if (!hadAccBuy && ps.acc > 0) {
        const tiers = Math.min(20, Math.floor(ps.acc / 2));
        for (let i = 1; i <= tiers; i++) {
            refund += typeof legacyAccUpgradePrice === 'function' ? legacyAccUpgradePrice(i) : 0;
        }
    }
    savePermaStats({ hp: ps.hp, atk: ps.atk, def: ps.def, acc: 0 });
    if (refund > 0) {
        if (typeof MetaRPG !== 'undefined') {
            MetaRPG.addSavedGold(refund);
            const m = MetaRPG.loadMeta();
            m.slots.forEach((s) => {
                if (s.legacyPerma) s.legacyPerma.acc = 0;
                MetaRPG.recalcTechBonus(s);
            });
            MetaRPG.saveMeta(m);
        } else {
            const sg = parseInt(localStorage.getItem('saved_gold') || '0', 10) || 0;
            localStorage.setItem('saved_gold', String(sg + refund));
        }
    } else if (typeof MetaRPG !== 'undefined') {
        const m = MetaRPG.loadMeta();
        m.slots.forEach((s) => {
            if (s.legacyPerma && s.legacyPerma.acc) s.legacyPerma.acc = 0;
            MetaRPG.recalcTechBonus(s);
        });
        MetaRPG.saveMeta(m);
    }
    localStorage.setItem('acc_perma_migrated_v71', '1');
}

/** 테크 노드 효과를 한글로 */
function formatTechEffect(e) {
    if (!e || typeof e !== 'object') return '';
    const parts = [];
    if (e.hp) parts.push(`체력 <b style="color:#2ed573">+${e.hp}</b>`);
    if (e.atk) parts.push(`공격 <b style="color:#f1c40f">+${e.atk}</b>`);
    if (e.def) parts.push(`방어 <b style="color:#1e90ff">+${e.def}</b>`);
    if (e.acc) parts.push(`명중 <b style="color:#a55eea">+${e.acc}%</b>`);
    return parts.length ? parts.join(' · ') : '—';
}

// ===================== 타격감 효과 =====================
function showDmgFloat(dmg, isCrit, isPlayer) {
    const battleArea = document.getElementById('battle-area');
    if (!battleArea) return;
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;font-weight:900;font-size:${isCrit?'2em':'1.4em'};color:${isPlayer?'#ff4757':isCrit?'#f1c40f':'#2ed573'};text-shadow:0 0 10px ${isCrit?'#f1c40f':'transparent'};pointer-events:none;z-index:999;left:${isPlayer?'10%':'55%'};top:25%;animation:dmgFloat 1s ease forwards;`;
    el.innerText = `${isCrit?'💥':''}${dmg}`;
    battleArea.style.position = 'relative';
    battleArea.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
}
function triggerCritEffect() {
    const s = document.querySelector('.screen');
    if (s) { s.classList.add('crit-flash'); setTimeout(() => s.classList.remove('crit-flash'), 500); }
}
function triggerShakeEffect() {
    const e = document.getElementById('e-hp');
    if (e) { e.classList.add('shake'); setTimeout(() => e.classList.remove('shake'), 400); }
}
function triggerBossWarning(on) {
    const s = document.querySelector('.screen');
    if (s) { if (on) s.classList.add('boss-warning'); else s.classList.remove('boss-warning'); }
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
function formatShopItemName(name) {
    const raw = String(name || '').replace(/\s*·\s*[워헌마]\d{2}\s*$/u, '').trim();
    const hasDigit = /\d/.test(raw);
    const hasJobWord = /(워리어|헌터|마법사|나이트|버서커|궁수|암살자|위저드|소환사|성직자|용병단장)/.test(raw);
    if (!hasDigit && !hasJobWord) return raw;
    // 창의적 표시명(원본 키는 유지) — 같은 원본명은 항상 같은 표시명
    const A = ['새벽', '심연', '유성', '황혼', '성운', '영겁', '폭풍', '흑요'];
    const B = ['서약', '추적', '각인', '잔향', '의식', '성배', '장막', '파편'];
    let h = 0;
    for (let i = 0; i < raw.length; i++) h = (h * 33 + raw.charCodeAt(i)) >>> 0;
    return `${A[h % A.length]}의 ${B[(h >> 3) % B.length]}`;
}
function formatShopItemDesc(desc) {
    let s = String(desc || '');
    s = s.replace(/(?:워리어|헌터|마법사)\s*계열\.\s*/g, '');
    s = s.replace(/(?:[가-힣A-Za-z]+)\s*전용\.\s*/g, '');
    s = s.replace(/(?:[가-힣A-Za-z]+)\s*전용/g, '');
    return s.trim();
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
/** 신성력 UI 표기: 소수 없음 — 소수부 0.1~0.4는 내림, 0.5~0.9는 올림 */
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
    return base;
}
function getTotalPlayerDefenseForHit() {
    if (!player) return 0;
    return safeNum(player.def, 0) + safeNum(player.extraDef, 0) + safeNum(player._syn && player._syn.def, 0) + getDivineDefBonus();
}

function isMercenaryCaptainJob() {
    return player && player.baseJob === '용병단장';
}

/** 상성 계산용 키: 용병단장 + 필드 용병 있으면 용병 직업(카멜레온) */
function getAffinityRelKey() {
    if (!player) return '';
    if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
        return player.fieldMerc.mercAffinityJob || player.fieldMerc.mercJob || '워리어';
    }
    if (relations[player.name]) return player.name;
    return player.baseJob;
}

function getMercGoldSkipCost() {
    return 28 + floor * 6;
}

/** 동료 용병 상성 키(전직 시 pathJob) */
function getMercAffinityJobForField() {
    const kind = player.mercCompanionKind;
    if (!kind || !mercCompanionBases[kind]) return '워리어';
    const ev = player.mercEvolution;
    if (ev && ev.pathJob) return ev.pathJob;
    return mercCompanionBases[kind].affinityJob;
}

/** 가챠·장비 필터: 동료 삼각 직업(+전직 계열) */
function getMercEquipmentJobKeys() {
    const kind = player.mercCompanionKind;
    if (!kind) return [];
    if (kind === '워리어') return ['워리어', '나이트', '버서커'];
    if (kind === '헌터') return ['헌터', '궁수', '암살자'];
    if (kind === '마법사') return ['마법사', '위저드', '소환사', '성직자'];
    return [];
}

function recalcMercGearTotals(fm) {
    if (!fm) return;
    let atk = 0,
        hp = 0,
        acc = 0,
        def = 0,
        crit = 0,
        critMult = 0,
        ls = 0;
    for (const it of fm.mercItems || []) {
        if (!it) continue;
        if (it.type === 'atk') atk += safeNum(it.value, 0);
        if (it.type === 'hp') hp += safeNum(it.value, 0);
        if (it.type === 'acc') acc += safeNum(it.value, 0);
        if (it.def) def += safeNum(it.def, 0);
        if (it.critBonus) crit += safeNum(it.critBonus, 0);
        if (it.critMult) critMult += safeNum(it.critMult, 0);
        if (it.lifesteal) ls += safeNum(it.lifesteal, 0);
    }
    fm.mercBonusAtk = atk;
    fm.mercBonusHp = hp;
    fm.mercBonusAcc = acc;
    fm.mercBonusDef = def;
    fm.mercBonusCrit = crit;
    fm.mercBonusCritMult = critMult;
    fm.mercBonusLifesteal = ls;
}

function getMercFloorBaseAtk() {
    const kind = player.mercCompanionKind || '워리어';
    const base = mercCompanionBases[kind] || mercCompanionBases['워리어'];
    const ev = player.mercEvolution;
    let f = 12 + floor * 3.15;
    if (ev && ev.dmgMult) f *= ev.dmgMult;
    f *= 0.82 + base.dmgCoeff * 0.38;
    return Math.max(6, Math.floor(f));
}

function getMercEffectiveAttackPower() {
    const atkBase = getMercFloorBaseAtk();
    const fm = player.fieldMerc;
    if (!fm) return Math.max(1, atkBase);
    const gear = safeNum(fm.mercBonusAtk, 0);
    const cmd = Math.floor((safeNum(player.atk, 0) + safeNum(player.extraAtk, 0)) * 0.2);
    return Math.max(1, atkBase + gear + cmd);
}

function getMercBonusAcc() {
    return player.fieldMerc ? safeNum(player.fieldMerc.mercBonusAcc, 0) : 0;
}

function getMercEffectiveCritForMercAttack() {
    const fm = player.fieldMerc;
    if (!fm) return Math.min(CRIT_SOFT_CAP, Math.max(0, safeNum(player.crit, 1)));
    const bonus = safeNum(fm.mercBonusCrit, 0);
    return Math.min(CRIT_SOFT_CAP, Math.max(0, safeNum(player.crit, 1) + bonus));
}

function getMercEffectiveCritMultForMercAttack() {
    const fm = player.fieldMerc;
    const base = getEffectiveCritMult();
    if (!fm || !fm.mercBonusCritMult) return base;
    return base + safeNum(fm.mercBonusCritMult, 0) * 0.85;
}

/** 층·동료·전직 기반 배율 — 실제 ATK는 getMercEffectiveAttackPower */
function computeMercDamageCoeff() {
    const kind = player.mercCompanionKind;
    if (!kind || !mercCompanionBases[kind]) return 0.72;
    const base = mercCompanionBases[kind];
    const ev = player.mercEvolution;
    const floorScale = 1 + Math.min(MERC_FLOOR_SCALE_CAP - 1, floor * 0.065);
    let c = 0.42 + base.dmgCoeff * 0.28;
    c *= floorScale;
    if (ev && ev.dmgMult) c *= ev.dmgMult;
    return Math.min(1.32, c * MERC_DMG_GLOBAL_SCALE * 0.42);
}

function getFieldMercAttackMult() {
    if (!player || !player.fieldMerc || player.fieldMerc.mercHp <= 0) return 0;
    return computeMercDamageCoeff();
}

/** 시작 동료 / 전직 반영 필드 용병 생성 — mercItems·mercInventory 연동 */
function buildFieldMercFromTemplate() {
    const kind = player.mercCompanionKind || '워리어';
    const base = mercCompanionBases[kind] || mercCompanionBases['워리어'];
    const ev = player.mercEvolution;
    const floorScale = 1 + Math.min(MERC_FLOOR_SCALE_CAP - 1, floor * 0.088);
    let hpMult = base.hpCoeff * floorScale;
    if (ev && ev.hpMult) hpMult *= ev.hpMult;
    const baseHp = 62 + floor * 8.2;
    let items = [];
    if (player.fieldMerc && player.fieldMerc.mercItems && player.fieldMerc.mercItems.length) {
        items = [...player.fieldMerc.mercItems];
    } else if (player.mercInventory && player.mercInventory.length) {
        items = [...player.mercInventory];
    }
    const evoName = ev ? ev.name : '';
    const label = base.label + (evoName ? ` · ${evoName}` : '');
    const fm = {
        sourceName: label,
        mercJob: base.affinityJob,
        mercAffinityJob: getMercAffinityJobForField(),
        mercCompanionKind: kind,
        mercItems: items,
    };
    recalcMercGearTotals(fm);
    const hpGear = safeNum(fm.mercBonusHp, 0);
    const mercMaxHp = Math.max(38, Math.floor(baseHp * hpMult + safeNum(player.maxHp, 100) * 0.2) + hpGear);
    const prevRatio =
        player.fieldMerc && player.fieldMerc.mercMaxHp > 0 ? player.fieldMerc.mercHp / player.fieldMerc.mercMaxHp : 1;
    fm.mercMaxHp = mercMaxHp;
    fm.mercHp = Math.max(1, Math.floor(mercMaxHp * Math.min(1, prevRatio)));
    player.mercInventory = [...(fm.mercItems || [])];
    return fm;
}

function getMercGachaCost() {
    return 18 + floor * 4;
}

/** 초반 악성 이벤트 50% → 층·전투 턴 경과에 따라 감소 (최소 ~5%) */
function getMercGachaBadChance() {
    const f = Math.max(0, floor - 1);
    const t = safeNum(player.mercBattleTurnCount, 0);
    const reduction = Math.min(0.45, f * 0.018 + t * 0.004);
    return Math.max(0.05, 0.5 - reduction);
}

function getMercGachaCandidatePool() {
    const keys = new Set(getMercEquipmentJobKeys());
    return equipmentPool.filter((it) => {
        if (!it || it.type === 'merc') return false;
        if (!it.onlyFor || !Array.isArray(it.onlyFor) || it.onlyFor.length === 0) return true;
        return it.onlyFor.some((j) => keys.has(j));
    });
}

function getMercExcludedItemNames() {
    const s = new Set();
    (player.fieldMerc && player.fieldMerc.mercItems ? player.fieldMerc.mercItems : []).forEach((i) => {
        if (i && i.name) s.add(i.name);
    });
    (player.mercInventory || []).forEach((i) => {
        if (i && i.name) s.add(i.name);
    });
    return s;
}

/** battle | shop_direct | shop_fund — 등급 가중 + 동일 이름 중복 금지 */
function pickMercItemForPlayer(mode) {
    const ex = getMercExcludedItemNames();
    const pool = getMercGachaCandidatePool().filter((it) => it && !ex.has(it.name));
    if (!pool.length) return null;
    const canLegendary = floor >= 28;
    const canEpic = floor >= 12;
    const byR = { common: [], rare: [], epic: [], legendary: [] };
    for (const it of pool) {
        let r = it.rarity || 'common';
        if (r === 'relic') continue;
        if (r === 'legendary' && !canLegendary) continue;
        if (r === 'epic' && !canEpic) continue;
        if (!byR[r]) r = 'common';
        byR[r].push(it);
    }
    let wc = 0,
        wr = 0,
        we = 0,
        wl = 0;
    if (mode === 'battle') {
        wc = floor < 8 ? 26 : floor < 15 ? 20 : 14;
        wr = floor < 8 ? 44 : floor < 15 ? 36 : 32;
        we = canEpic ? (floor < 22 ? 24 : 38) : 0;
        wl = canLegendary ? (floor < 35 ? 6 : 18) : 0;
    } else if (mode === 'shop_direct') {
        wc = 18;
        wr = 32;
        we = canEpic ? 35 : 0;
        wl = canLegendary ? 15 : 0;
    } else if (mode === 'shop_fund') {
        wc = 8;
        wr = 22;
        we = canEpic ? 45 : 0;
        wl = canLegendary ? 25 : 0;
    }
    const sum = wc + wr + we + wl;
    if (sum <= 0) {
        for (const rk of ['common', 'rare', 'epic', 'legendary']) {
            if (byR[rk] && byR[rk].length) return byR[rk][Math.floor(Math.random() * byR[rk].length)];
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }
    let roll = Math.random() * sum;
    let tier = 'common';
    if ((roll -= wc) < 0) tier = 'common';
    else if ((roll -= wr) < 0) tier = 'rare';
    else if ((roll -= we) < 0) tier = 'epic';
    else tier = 'legendary';
    const order = ['legendary', 'epic', 'rare', 'common'];
    for (let k = 0; k < 6; k++) {
        const arr = byR[tier];
        if (arr && arr.length) return arr[Math.floor(Math.random() * arr.length)];
        const ix = order.indexOf(tier);
        tier = order[(ix + 1) % 4];
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

function applyMercItemGainFromPool(gain) {
    if (!gain || !player) return;
    if (!player.mercInventory) player.mercInventory = [];
    if (!player.fieldMerc || player.fieldMerc.mercHp <= 0) {
        player.mercInventory.push({ ...gain });
        saveCollection(gain.name);
        writeLog(`[용병 장비] <b>${gain.name}</b> 비축 <span style="color:#888;">(${gain.rarity || 'common'})</span> — 복귀 시 장착`);
        return;
    }
    if (!player.fieldMerc.mercItems) player.fieldMerc.mercItems = [];
    player.fieldMerc.mercItems.push({ ...gain });
    player.mercInventory = [...player.fieldMerc.mercItems];
    const prevHp = player.fieldMerc.mercHp;
    const prevMax = player.fieldMerc.mercMaxHp;
    player.fieldMerc = buildFieldMercFromTemplate();
    const deltaMax = player.fieldMerc.mercMaxHp - prevMax;
    player.fieldMerc.mercHp = Math.min(
        player.fieldMerc.mercMaxHp,
        Math.max(1, prevHp + Math.max(0, Math.floor(deltaMax * 0.65)))
    );
    saveCollection(gain.name);
    writeLog(
        `[용병 장비] ✨ <b style="color:#2ed573">${gain.name}</b> 입수 <span style="color:#888;">(${gain.rarity || 'common'})</span>`
    );
}

window.mercenaryFundGacha = () => {
    if (!isMercenaryCaptainJob() || !enemy) return writeLog('[지원] 전투 중에만 사용할 수 있습니다.');
    if (!player.fieldMerc || player.fieldMerc.mercHp <= 0) return writeLog('[지원] 전열 용병이 없습니다.');
    const cost = getMercGachaCost();
    if (gold < cost) return writeLog(`[지원] 골드가 부족합니다. (${cost}G 필요)`);
    gold -= cost;
    const badChance = getMercGachaBadChance();
    const roll = Math.random();
    if (roll < badChance) {
        const kind = Math.floor(Math.random() * 4);
        if (kind === 0) {
            const pct = 0.08 + Math.random() * 0.1;
            const dmg = Math.max(1, Math.floor(player.fieldMerc.mercMaxHp * pct));
            player.fieldMerc.mercHp = Math.max(1, player.fieldMerc.mercHp - dmg);
            writeLog(`[지원·악성] 💢 장비 거래 사기! 용병이 피해를 입었다 <b>-${dmg}</b> HP`);
        } else if (kind === 1 && player.fieldMerc.mercItems && player.fieldMerc.mercItems.length > 0) {
            const ratio = player.fieldMerc.mercHp / Math.max(1, player.fieldMerc.mercMaxHp);
            const ix = Math.floor(Math.random() * player.fieldMerc.mercItems.length);
            const lost = player.fieldMerc.mercItems.splice(ix, 1)[0];
            player.mercInventory = [...player.fieldMerc.mercItems];
            player.fieldMerc = buildFieldMercFromTemplate();
            player.fieldMerc.mercHp = Math.max(1, Math.floor(player.fieldMerc.mercMaxHp * ratio));
            writeLog(`[지원·악성] 🗑️ 용병이 <b>${lost.name}</b>을(를) 잃어버렸다!`);
        } else if (kind === 2) {
            const h = Math.max(1, Math.floor(player.maxHp * (0.06 + Math.random() * 0.06)));
            player.curHp = Math.max(1, player.curHp - h);
            writeLog(`[지원·악성] 😰 단장이 협상에 휘말려 체력 <b>-${h}</b>`);
        } else {
            writeLog(`[지원·악성] 💸 돈만 날렸다… (특별 획득 없음)`);
        }
    } else {
        const it = pickMercItemForPlayer('battle');
        if (!it) {
            const refund = Math.floor(cost * 0.35);
            gold += refund;
            writeLog(`[지원] 📭 마을에 물건이 없다… ${refund}G 환급`);
        } else {
            applyMercItemGainFromPool({ ...it });
        }
    }
    updateUi();
    renderActions();
};

/** 용병단장 전용(단독) 장비 — 타 직업 상점에서 제외 (데이터에 남아 있을 수 있음) */
function mercCaptainExclusiveItem(it) {
    return it && it.onlyFor && Array.isArray(it.onlyFor) && it.onlyFor.length === 1 && it.onlyFor[0] === '용병단장';
}

/** 일반 상점용: 용병 계약 + 단장 전용 장비 제외 */
function getNonMercEquipmentPool() {
    return equipmentPool.filter((i) => {
        if (!i || i.type === 'merc') return false;
        if (mercCaptainExclusiveItem(i)) return false;
        // 전직 전용 아이템 해금 시스템(기본 직업 플레이로 해금)
        if (i.onlyFor && Array.isArray(i.onlyFor) && i.onlyFor.length === 1) {
            const evo = i.onlyFor[0];
            if (isEvolutionJobName(evo)) {
                // 전직 직업으로 플레이할 때만, '해금 완료(3개)' 후에, 해금된 이름만 등장
                if (!player || player.name !== evo) return false;
                if (!isEvolutionItemSetUnlocked(evo)) return false;
                if (!isEvolutionItemNameUnlocked(evo, i.name)) return false;
            }
        }
        return true;
    });
}

function tryMercenaryRandomEvent() {
    if (!isMercenaryCaptainJob() || !player.fieldMerc || player.fieldMerc.mercHp <= 0) return;
    if (Math.random() > 0.016) return;
    const tier = floor <= 12 ? 'low' : floor <= 35 ? 'mid' : 'high';
    let neg = 0,
        pos = 0;
    if (tier === 'low') {
        neg = 0.38;
        pos = 0.06;
    } else if (tier === 'high') {
        neg = 0.004;
        pos = 0.025;
    } else {
        neg = 0.12;
        pos = 0.04;
    }
    const roll = Math.random();
    if (roll < neg) {
        if (tier === 'high' && Math.random() < 0.92) return;
        player.mercNextBattleDebuff = { atkPct: -0.07 };
        writeLog(`[용병 이벤트] 💢 술집 난투·사기 피해… <b>다음 전투</b> 공격력 일시 하락!`);
        return;
    }
    if (roll < neg + pos) {
        if (tier === 'high' && Math.random() > 0.35) {
            writeLog(`[용병 이벤트] 고층의 실전은 거칠다… (미미한 보상)`);
            player.atk += 1;
            return;
        }
        player.atk += 3;
        player.crit += 1;
        writeLog(`[용병 이벤트] ✨ 실전 경험! 공격력+3, 치명+1%`);
    }
}

function showUnlockPopup(title, body, color) {
    const popup = document.createElement('div');
    popup.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;background:#1a1a1a;border:2px solid ${color};border-radius:10px;padding:16px 20px;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.8);animation:slideIn 0.3s ease;`;
    popup.innerHTML = `<div style="color:${color};font-weight:700;font-size:1em;margin-bottom:6px;">${title}</div><div style="color:#e0e0e0;font-size:0.88em;line-height:1.5;">${body}</div>`;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.transition='opacity 0.5s'; popup.style.opacity='0'; setTimeout(() => { if (popup.parentNode) document.body.removeChild(popup); }, 500); }, 3000);
}

// ===================== 전직 전용 아이템 해금 =====================
const EVO_ITEM_UNLOCK_KEY = 'evo_item_unlocks_v1';
const EVO_ITEM_UNLOCK_MILESTONE_KEY = 'evo_item_unlock_milestones_v1';
const EVO_UNLOCK_NEED_COUNT = 3;
const EVO_MILESTONES = [4, 7, 10]; // 기본 직업 플레이 중(전직 전) 3회 해금
const EVOLUTION_NAMES = ['나이트', '버서커', '궁수', '암살자', '위저드', '소환사', '성직자'];

function isEvolutionJobName(n) {
    return EVOLUTION_NAMES.includes(String(n || ''));
}

function loadEvoItemUnlockState() {
    try {
        const raw = localStorage.getItem(EVO_ITEM_UNLOCK_KEY);
        const o = raw ? JSON.parse(raw) : {};
        return o && typeof o === 'object' ? o : {};
    } catch (e) {
        return {};
    }
}
function saveEvoItemUnlockState(o) {
    try {
        localStorage.setItem(EVO_ITEM_UNLOCK_KEY, JSON.stringify(o && typeof o === 'object' ? o : {}));
    } catch (e) {
        /* ignore */
    }
}
function loadEvoMilestones() {
    try {
        const raw = localStorage.getItem(EVO_ITEM_UNLOCK_MILESTONE_KEY);
        const o = raw ? JSON.parse(raw) : {};
        return o && typeof o === 'object' ? o : {};
    } catch (e) {
        return {};
    }
}
function saveEvoMilestones(o) {
    try {
        localStorage.setItem(EVO_ITEM_UNLOCK_MILESTONE_KEY, JSON.stringify(o && typeof o === 'object' ? o : {}));
    } catch (e) {
        /* ignore */
    }
}
function getUnlockedEvolutionItemNames(evoName) {
    const s = loadEvoItemUnlockState();
    const e = s && s[evoName];
    const arr = e && Array.isArray(e.names) ? e.names : [];
    return arr.filter((x) => typeof x === 'string' && x.length > 0);
}
function isEvolutionItemNameUnlocked(evoName, itemName) {
    return getUnlockedEvolutionItemNames(evoName).includes(String(itemName || ''));
}
function isEvolutionItemSetUnlocked(evoName) {
    return getUnlockedEvolutionItemNames(evoName).length >= EVO_UNLOCK_NEED_COUNT;
}
function pickRandomLockedEvoItemName(evoName) {
    const unlocked = new Set(getUnlockedEvolutionItemNames(evoName));
    const pool = (equipmentPool || []).filter((it) => {
        if (!it || !it.name) return false;
        if (!it.onlyFor || !Array.isArray(it.onlyFor) || it.onlyFor.length !== 1) return false;
        if (it.onlyFor[0] !== evoName) return false;
        if (unlocked.has(it.name)) return false;
        return true;
    });
    if (!pool.length) return null;
    const it = pool[Math.floor(Math.random() * pool.length)];
    return it && it.name ? it.name : null;
}
function unlockEvolutionItemName(evoName, itemName) {
    const evo = String(evoName || '');
    const name = String(itemName || '');
    if (!evo || !name) return false;
    const st = loadEvoItemUnlockState();
    st[evo] = st[evo] && typeof st[evo] === 'object' ? st[evo] : {};
    st[evo].names = Array.isArray(st[evo].names) ? st[evo].names : [];
    if (!st[evo].names.includes(name)) st[evo].names.push(name);
    saveEvoItemUnlockState(st);
    return true;
}
function maybeUnlockEvolutionItemsFromBasePlay(clearedFloor) {
    if (!player || player.evolved) return;
    const base = player.baseJob;
    if (!base || !jobEvolutions || !jobEvolutions[base]) return;
    if (!EVO_MILESTONES.includes(clearedFloor)) return;
    const ms = loadEvoMilestones();
    ms[base] = Array.isArray(ms[base]) ? ms[base] : [];
    if (ms[base].includes(clearedFloor)) return;
    ms[base].push(clearedFloor);
    saveEvoMilestones(ms);

    const evols = jobEvolutions[base] || [];
    const unlockedMsgs = [];
    evols.forEach((e) => {
        if (!e || !e.name) return;
        const evoName = e.name;
        const cur = getUnlockedEvolutionItemNames(evoName).length;
        if (cur >= EVO_UNLOCK_NEED_COUNT) return;
        const pick = pickRandomLockedEvoItemName(evoName);
        if (!pick) return;
        unlockEvolutionItemName(evoName, pick);
        const now = getUnlockedEvolutionItemNames(evoName).length;
        unlockedMsgs.push(`${evoName} (${now}/${EVO_UNLOCK_NEED_COUNT})`);
    });
    if (unlockedMsgs.length) {
        writeLog(`[해금] 🧩 전직 전용 장비 해금 진행: ${unlockedMsgs.join(' · ')} — 도감에서 확인 가능`);
    }
}

function showAuthError(msg) {
    const e = document.getElementById('login-error');
    e.innerText = msg; e.style.display = 'block';
}

window.handleSignup = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    if (!email || pw.length < 6) return showAuthError("❌ 이메일 형식(ex: a@a.com)을 맞추고, 비밀번호는 6자리 이상이어야 합니다!");
    auth.createUserWithEmailAndPassword(email, pw).then(() => alert("가입 환영! 모험을 시작하세요.")).catch(() => showAuthError("❌ 가입 실패"));
};
window.handleLogin = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    if (!email || !pw) return showAuthError("❌ 이메일과 비밀번호를 모두 입력해 주세요!");
    auth.signInWithEmailAndPassword(email, pw).then(() => writeLog("서버 로그인 완료!")).catch(() => showAuthError("❌ 로그인 실패"));
};
window.handleLogout = () => { auth.signOut().then(() => { alert("로그아웃 되었습니다."); location.reload(); }); };

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-info').innerText = user.email.split('@')[0] + " 님";
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('login-area').style.display = 'none';
        exitBattleLayout(); showPreGameScreen(); loadRank();
    } else {
        currentUser = null;
        document.getElementById('login-area').style.display = 'block';
        document.getElementById('start-area').style.display = 'none';
        exitBattleLayout();
    }
});

/** 베이스캠프 영구 강화 — 무한 단계, 슬롯 전용 */
function getCampPermaNextPrice(key, level) {
    const T = {
        hp: [18, 1.34],
        atk: [26, 1.38],
        def: [22, 1.38],
        crit: [120, 1.45],
        cm: [180, 1.48],
    };
    const pair = T[key] || T.hp;
    return Math.floor(pair[0] * Math.pow(pair[1], Math.max(0, level)));
}

function buildPermanentShopHtml() {
    if (typeof MetaRPG === 'undefined' || !player || !player.metaSlotId) {
        return '<p style="color:#888;font-size:0.85em;">활성 캐릭터 슬롯이 없습니다.</p>';
    }
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return '';
    MetaRPG.recalcTechBonus(slot);
    const cp = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    const tb = slot.techBonus || {};
    const runGold = safeNum(gold, 0);
    const sumLine = `<p style="color:#888;font-size:0.78em;margin:0 0 12px 0;line-height:1.5;">📌 <b>이 캐릭터 누적</b> — 체력+테크 <b style="color:#2ed573">${Math.ceil(tb.hp || 0)}</b> · 공격 <b style="color:#f1c40f">${Math.ceil(tb.atk || 0)}</b> · 방어 <b style="color:#1e90ff">${Math.ceil(tb.def || 0)}</b> · 치명 <b style="color:#f39c12">+${Math.ceil(tb.crit || 0)}%</b> · 배율 <b style="color:#e67e22">+${Math.ceil((tb.critMult || 0) * 100)}%</b></p><p style="color:#2ed573;font-size:0.8em;">💰 런 골드로 구매: <b>${runGold}G</b></p>`;
    const catKeys = ['hp', 'atk', 'def', 'crit', 'cm'];
    const labels = { hp: '❤️ 체력', atk: '⚔️ 공격', def: '🛡️ 방어', crit: '💥 치명 확률', cm: '🎯 치명 배율' };
    const sub = {
        hp: '+32 HP/단계',
        atk: '+5/단계',
        def: '+3/단계',
        crit: '+1%/단계',
        cm: '+0.10 배율/단계 (≈10%)',
    };
    const colors = { hp: '#2ed573', atk: '#f1c40f', def: '#1e90ff', crit: '#f39c12', cm: '#e67e22' };
    const rows = catKeys
        .map((key) => {
            const lv = cp[key] || 0;
            const price = getCampPermaNextPrice(key, lv);
            const can = runGold >= price;
            const btnBg = can ? '#f1c40f' : '#333';
            const btnFg = can ? '#111' : '#666';
            return `<div style="display:flex;justify-content:space-between;align-items:center;background:#111;border:1px solid #333;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
            <div style="flex:1;">
                <span style="color:${colors[key]};font-weight:700;font-size:0.9em;">${labels[key]}</span>
                <span style="color:#888;font-size:0.8em;margin-left:10px;">Lv.${lv} · ${sub[key]}</span>
                <div style="color:#555;font-size:0.72em;margin-top:3px;">다음 비용: <b style="color:#f1c40f;">${price}G</b></div>
            </div>
            <button type="button" onclick="buyCampPermaNext('${key}')" ${!can ? 'disabled' : ''} style="background:${btnBg};color:${btnFg};padding:8px 18px;font-size:0.82em;font-weight:700;border:none;border-radius:6px;cursor:${!can ? 'not-allowed' : 'pointer'};">강화</button>
        </div>`;
        })
        .join('');
    return sumLine + rows;
}

/** 구버전 전역 perma_stats → 첫 슬롯 campPerma로 1회 이관 */
function migrateGlobalPermaIntoSlotOnce() {
    if (localStorage.getItem('v703_global_perma_migrated')) return;
    if (typeof MetaRPG === 'undefined') return;
    const g = getPermaStats();
    const m = MetaRPG.loadMeta();
    if (!m.slots.length) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    if ((g.hp || 0) + (g.atk || 0) + (g.def || 0) < 1) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    const slot = m.activeSlotId ? m.slots.find((s) => s.id === m.activeSlotId) : m.slots[0];
    if (!slot) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    slot.campPerma = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    slot.campPerma.hp += Math.max(0, Math.floor((g.hp || 0) / 20));
    slot.campPerma.atk += Math.max(0, Math.floor((g.atk || 0) / 3));
    slot.campPerma.def += Math.max(0, Math.floor((g.def || 0) / 2));
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(m);
    savePermaStats({ hp: 0, atk: 0, def: 0, acc: 0 });
    try {
        localStorage.removeItem('perma_buy_count');
    } catch (e) { /* ignore */ }
    localStorage.setItem('v703_global_perma_migrated', '1');
}

function showPreGameScreen() {
    exitBattleLayout();
    migrateGlobalPermaIntoSlotOnce();
    if (typeof MetaRPG !== 'undefined') {
        const mx = MetaRPG.loadMeta();
        mx.slots.forEach((s) => MetaRPG.recalcTechBonus(s));
        MetaRPG.saveMeta(mx);
    }
    const globalUnlocked = getUnlockedFloors(null);
    const warriorUnlocked = getUnlockedFloors('워리어');
    const hunterUnlocked = getUnlockedFloors('헌터');
    const wizardUnlocked = getUnlockedFloors('마법사');
    const m = typeof MetaRPG !== 'undefined' ? MetaRPG.loadMeta() : { slots: [] };
    const esc = (t) =>
        String(t)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    const slotSnapHints = [];
    if (typeof MetaRPG !== 'undefined') {
        m.slots.forEach((s) => {
            const sn = MetaRPG.getRunSnapshot(s.id);
            if (sn && sn.floor) slotSnapHints.push(`<b>${esc(s.name)}</b> ${sn.floor}층`);
        });
    }
    const slotRows =
        m.slots.length === 0
            ? `<p style="color:#888;font-size:0.85em;">저장된 캐릭터가 없습니다. 아래에서 <b>새 모험가</b>를 만들어 주세요.</p>`
            : m.slots
                  .map((s) => {
                      MetaRPG.recalcTechBonus(s);
                      const jb = jobBase[s.jobKey] || { name: '?', color: '#888' };
                      const techFree = '테크 자유';
                      const rct = s.reincarnationCount || 0;
                      const gen = rct + 1;
                      const rebCost = MetaRPG.getRebirthGoldCost(s);
                      const rebNeedFloor = MetaRPG.getRebirthMinFloor ? MetaRPG.getRebirthMinFloor() : 500;
                      const bestFloor = Math.max(1, s.bestFloor || 1);
                      const canReb = rct < 3;
                      const rebBtn = canReb
                          ? `<button type="button" onclick="event.stopPropagation();reincarnateFromHub('${s.id}')" style="background:#c0392b;color:#fff;padding:8px 12px;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.82em;">🔁 환생 (${rebCost}G)</button>`
                          : `<span style="color:#555;font-size:0.75em;">환생 3/3</span>`;
                      const lifeBadge =
                          gen > 1
                              ? `<span style="color:#9b59b6;font-weight:700;">${jb.name} ${gen}세</span> · `
                              : '';
                      return `<div style="background:#111;border:1px solid #444;border-radius:10px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                        <div style="text-align:left;">
                            <div style="color:#f1c40f;font-weight:700;">${esc(s.name)} ${gen > 1 ? `<span style="color:#aaa;font-size:0.85em;">(인생 ${gen}회차)</span>` : ''}</div>
                            <div style="color:#888;font-size:0.78em;">직업 ${jb.name} · ${lifeBadge}${techFree} · 메타 Lv.${s.level || 1} · 최고 ${bestFloor}층 · 환생 ${rct}/3</div>
                            <div style="color:#666;font-size:0.72em;">환생 조건: ${rebNeedFloor}층 이상 도달 + 골드 필요</div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        <button type="button" onclick="resumeMetaSlot('${s.id}')" style="background:#2ed573;color:#111;padding:8px 16px;font-weight:700;border:none;border-radius:8px;cursor:pointer;">이어하기</button>
                        <button type="button" onclick="requestDeleteSaveFile(${typeof MetaRPG !== 'undefined' && typeof MetaRPG.getActiveFileIndex === 'function' ? MetaRPG.getActiveFileIndex() : 0})" style="background:#2a1111;color:#ff8080;padding:8px 12px;font-weight:800;border:1px solid #7f2b2b;border-radius:8px;cursor:pointer;font-size:0.82em;">파일 삭제</button>
                        ${MetaRPG.getRunSnapshot(s.id) ? `<button type="button" onclick="event.stopPropagation();deleteRunSnapshotForSlot('${s.id}')" style="background:#34495e;color:#ecf0f1;padding:8px 12px;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.82em;">🗑 저장 삭제</button>` : ''}
                        ${rebBtn}
                        </div>
                    </div>`;
                  })
                  .join('');
    let saveFileBar = '';
    if (typeof MetaRPG !== 'undefined' && MetaRPG.peekMetaAtFileIndex) {
        const cur = typeof MetaRPG.getActiveFileIndex === 'function' ? MetaRPG.getActiveFileIndex() : 0;
        const n = MetaRPG.getSaveFileSlotCount ? MetaRPG.getSaveFileSlotCount() : 3;
        const parts = [];
        for (let fi = 0; fi < n; fi++) {
            const pm = MetaRPG.peekMetaAtFileIndex(fi);
            const cnt = pm.slots ? pm.slots.length : 0;
            const g = Math.max(0, safeNum(pm.savedGold, 0));
            const active = fi === cur ? ' (현재)' : '';
            parts.push(
                `<button type="button" onclick="switchActiveSaveFile(${fi})" style="background:${fi === cur ? '#2a2a1a' : '#111'};border:1px solid ${fi === cur ? '#f1c40f' : '#444'};color:${fi === cur ? '#f1c40f' : '#888'};padding:8px 10px;border-radius:8px;cursor:pointer;font-size:0.78em;font-weight:700;">파일 ${fi + 1}${active}<br><span style="font-weight:400;color:#888;">캐릭 ${cnt} · ${g}G</span></button>`
            );
        }
        saveFileBar = `<div style="margin-bottom:14px;padding:12px;background:#0d0d12;border:1px solid #333;border-radius:10px;"><div style="color:#f1c40f;font-weight:700;margin-bottom:8px;font-size:0.9em;">💾 저장 파일 (최대 3)</div><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">${parts.join('')}</div><p style="color:#666;font-size:0.72em;margin:8px 0 0;line-height:1.45;">다른 파일을 불러오려면 위 버튼을 누르세요. 모든 파일이 가득 차면 새 캐릭터 생성 시 <b>비울 파일</b>을 묻습니다.</p></div>`;
    }
    const newCharGrid = ['Warrior', 'Hunter', 'Wizard', 'MercenaryCaptain']
        .map((job) => {
            return `
        <div onclick="openTechLinePicker('${job}')" style="background:#1a1a1a;border:2px solid ${jobBase[job].color};border-radius:10px;padding:12px;text-align:center;cursor:pointer;">
            <div style="color:${jobBase[job].color};font-weight:700;">${jobBase[job].name}</div>
            <div style="color:#666;font-size:0.72em;margin-top:4px;">새 캐릭터</div>
        </div>`;
        })
        .join('');
    document.getElementById('start-area').style.display = 'block';
    document.getElementById('battle-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'none';
    try {
    document.getElementById('start-area').innerHTML = `
        <div style="text-align:center; margin-bottom:16px;">
            <h2 style="color:#f1c40f; margin-bottom:5px;">⚔️ 로그라이트 허브</h2>
            <p style="color:#9b59b6;font-size:0.88em;margin:0 0 8px;font-weight:700;">시즌 1.1</p>
            ${saveFileBar}
            <p style="color:#888; font-size:0.85em;">무한 층 · 베이스캠프에서만 영구 성장</p>
            ${globalUnlocked.length > 0 ? `<p style="color:#f1c40f;font-size:0.8em;">🔓 공용 해금: ${globalUnlocked.join(', ')}층</p>` : ''}
            ${warriorUnlocked.length > 0 ? `<p style="color:#ff4757;font-size:0.8em;">🔓 워리어: ${warriorUnlocked.join(', ')}층</p>` : ''}
            ${hunterUnlocked.length > 0 ? `<p style="color:#2ed573;font-size:0.8em;">🔓 헌터: ${hunterUnlocked.join(', ')}층</p>` : ''}
            ${wizardUnlocked.length > 0 ? `<p style="color:#1e90ff;font-size:0.8em;">🔓 마법사: ${wizardUnlocked.join(', ')}층</p>` : ''}
        </div>
        <div style="max-width:560px;margin:0 auto 16px;">
            <h4 style="color:#f1c40f;margin:0 0 8px 0;">💾 캐릭터 슬롯 (최대 ${typeof MetaRPG !== 'undefined' ? MetaRPG.MAX_SLOTS : 4})</h4>
            ${slotRows}
        </div>
        <h4 style="color:#aaa;font-size:0.9em;margin:12px 0;">새 모험가 — 직업만 고르면 됩니다. <b>테크·장비</b>는 플레이 중 원하는 대로 고릅니다.</h4>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;max-width:520px;margin-left:auto;margin-right:auto;">
            ${newCharGrid}
        </div>
        <div style="max-width:560px;margin:0 auto 16px;padding:14px;background:#111;border:1px solid #333;border-radius:10px;text-align:left;">
            <h4 style="color:#f1c40f;margin:0 0 10px;text-align:center;">💾 저장 / 불러오기</h4>
            ${slotSnapHints.length ? `<p style="color:#2ed573;font-size:0.82em;margin:0 0 10px;line-height:1.45;">💾 저장된 런: ${slotSnapHints.join(' · ')} — 캐릭터 <b>이어하기</b>로 복구됩니다.</p>` : '<p style="color:#555;font-size:0.8em;margin:0 0 8px;">저장된 런 없음 — 전투 중 <b>💾 저장 후 메인</b>으로 진행을 남기세요.</p>'}
            <button type="button" onclick="exportFullSave()" style="width:100%;margin-bottom:8px;padding:10px;background:#1e90ff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;">📥 전체 데이터 내보내기 (JSON 백업)</button>
            <label style="display:block;color:#888;font-size:0.82em;">파일에서 복원:
              <input type="file" accept=".json,application/json" style="width:100%;margin-top:6px;" onchange="importFullSave(this)">
            </label>
        </div>
        <p style="color:#666;font-size:0.75em;max-width:520px;margin:0 auto;line-height:1.5;">※ 승리 시 <b>확인 없이</b> 다음 층으로 진행합니다. 21층 이상은 <b>상점</b>에서만 「이 층 훈련」/「등반 계속」을 고를 수 있습니다. <b>30층 이상 상점</b>에서만 베이스캠프(연구·영구 강화)에 들어갈 수 있으며, <b>런 골드</b>로 구매합니다. 메인으로 나갈 때는 <b>저장 후 메인</b>을 권장합니다.</p>`;
    } catch (err) {
        console.error('[허브]', err);
        document.getElementById('start-area').innerHTML =
            '<p style="color:#ff6b6b;padding:20px;text-align:center;">허브를 불러오는 중 오류가 났습니다. 페이지를 새로고침 해 주세요.<br><span style="color:#888;font-size:0.85em;">' +
            String(err && err.message ? err.message : err) +
            '</span></p>';
    }
}

window.resumeMetaSlot = (slotId) => {
    if (typeof MetaRPG === 'undefined') return;
    if (!MetaRPG.setActiveSlot(slotId)) return;
    const snap = MetaRPG.getRunSnapshot(slotId);
    if (snap) loadRunFromMetaSnapshot(snap);
    else initRunFromMetaSlot();
};

/** 허브: 저장 파일 1~3 전환 */
window.switchActiveSaveFile = function switchActiveSaveFile(idx) {
    if (typeof MetaRPG === 'undefined' || typeof MetaRPG.setActiveSaveFileIndex !== 'function') return;
    if (!MetaRPG.setActiveSaveFileIndex(idx)) return;
    showPreGameScreen();
};
window.requestDeleteSaveFile = function requestDeleteSaveFile(idx) {
    if (typeof MetaRPG === 'undefined') return;
    const fileNo = idx + 1;
    const ok = confirm(`저장 파일 ${fileNo}번을 삭제할까요?\n삭제하면 해당 파일의 캐릭터/보존 골드가 모두 사라집니다.`);
    if (!ok) return;
    const ok2 = confirm(`정말로 저장 파일 ${fileNo}번을 삭제하시겠습니까?\n(복구 불가)`);
    if (!ok2) return;
    MetaRPG.clearSaveFile(idx);
    if (typeof MetaRPG.setActiveSaveFileIndex === 'function') MetaRPG.setActiveSaveFileIndex(idx);
    showPreGameScreen();
};

window.reincarnateFromHub = function reincarnateFromHub(slotId) {
    if (typeof MetaRPG === 'undefined') return;
    const slot = MetaRPG.getSlotById(slotId);
    if (!slot) return;
    const cost = MetaRPG.getRebirthGoldCost(slot);
    const needFloor = MetaRPG.getRebirthMinFloor ? MetaRPG.getRebirthMinFloor() : 500;
    const bestFloor = Math.max(1, slot.bestFloor || 1);
    if ((slot.reincarnationCount || 0) >= 3) return alert('환생은 최대 3회입니다.');
    if (bestFloor < needFloor) return alert(`환생 조건 미달: 최고 ${bestFloor}층 (필요 ${needFloor}층)`);
    if (!confirm(`환생: ${cost}G를 지불하고 이 캐릭터의 베이스캠프 영구강화·퀘스트 보너스를 초기화합니다.\n조건: 최고 ${needFloor}층 이상. 환생 시 공격/방어/치명 배율 +10% 누적.`)) return;
    MetaRPG.setActiveSlot(slotId);
    const r = MetaRPG.applyReincarnation(slotId, { payGold: true });
    if (!r.ok) return alert(r.msg);
    alert('환생 완료. 「이어하기」로 새 런을 시작하세요.');
    try {
        showPreGameScreen();
    } catch (e) {
        console.error(e);
        alert('허브 표시 중 오류가 났습니다. 새로고침 해 주세요.');
        location.reload();
    }
};

window.openTechLinePicker = (jobKey) => {
    if (typeof MetaRPG === 'undefined') return;
    const tryCreate = () => confirmNewCharacter(jobKey);
    if (MetaRPG.loadMeta().slots.length >= MetaRPG.MAX_SLOTS) {
        const n = MetaRPG.getSaveFileSlotCount ? MetaRPG.getSaveFileSlotCount() : 3;
        for (let fi = 0; fi < n; fi++) {
            const pm = MetaRPG.peekMetaAtFileIndex(fi);
            if (pm && pm.slots && pm.slots.length < MetaRPG.MAX_SLOTS) {
                if (
                    confirm(
                        `이 저장 파일의 캐릭터 슬롯이 가득 찼습니다.\n저장 파일 ${fi + 1}번에는 빈 슬롯이 있습니다.\n해당 파일로 전환할까요?`
                    )
                ) {
                    MetaRPG.setActiveSaveFileIndex(fi);
                    showPreGameScreen();
                }
                return;
            }
        }
        const ans = prompt(
            `모든 저장 파일에서 캐릭터 슬롯이 가득 찼습니다.\n비우고 새로 만들 저장 파일 번호를 입력하세요 (1~${n}).\n※ 해당 파일의 메타·캐릭터 데이터가 삭제됩니다. 취소하려면 취소를 누르세요.`
        );
        if (ans == null) return;
        const num = parseInt(String(ans).trim(), 10);
        if (!Number.isFinite(num) || num < 1 || num > n) {
            alert('1~' + n + ' 사이 숫자를 입력해 주세요.');
            return;
        }
        const idx = num - 1;
        if (!confirm(`저장 파일 ${num}번을 완전히 비우고 새 캐릭터를 만듭니다. 계속할까요?`)) return;
        MetaRPG.clearSaveFile(idx);
        MetaRPG.setActiveSaveFileIndex(idx);
        tryCreate();
        return;
    }
    tryCreate();
};

window.deleteRunSnapshotForSlot = function deleteRunSnapshotForSlot(slotId) {
    if (typeof MetaRPG === 'undefined') return;
    const existing = document.getElementById('delete-save-confirm-overlay');
    if (existing) existing.remove();

    const ov = document.createElement('div');
    ov.id = 'delete-save-confirm-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:10070;display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML = `
<div style="background:#1a1a2e;border:2px solid #e74c3c;border-radius:14px;padding:22px 20px;max-width:420px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
  <h3 style="color:#e74c3c;margin:0 0 10px;font-size:1.15em;">저장 데이터 삭제</h3>
  <p style="color:#ddd;font-size:0.9em;line-height:1.55;margin:0 0 16px;text-align:left;">
    이 캐릭터의 <b>저장된 런(이어하기) 파일</b>이 <b>완전히 삭제</b>됩니다.<br>
    또한 <b>메타 레벨·EXP가 1 / 0으로 초기화</b>됩니다.<br>
    <span style="color:#f39c12;">삭제 후에는 복구할 수 없습니다.</span> 정말 삭제할까요?
  </p>
  <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
    <button type="button" id="del-save-cancel" style="background:#555;color:#eee;padding:10px 18px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.95em;">취소</button>
    <button type="button" id="del-save-confirm" style="background:#c0392b;color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.95em;">예, 삭제합니다</button>
  </div>
</div>`;
    document.body.appendChild(ov);

    const close = () => {
        ov.remove();
        document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => {
        if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    ov.querySelector('#del-save-cancel').onclick = close;
    ov.onclick = (e) => {
        if (e.target === ov) close();
    };
    ov.querySelector('#del-save-confirm').onclick = () => {
        close();
        MetaRPG.wipeSavedRunAndResetMetaLevel(slotId);
        showPreGameScreen();
    };
};

function confirmNewCharacter(jobKey) {
    if (typeof MetaRPG === 'undefined') return;
    const name = prompt('캐릭터 이름을 입력하세요 (비우면 무명):', '모험가');
    const r = MetaRPG.createCharacter(name || '무명', jobKey);
    if (!r.ok) {
        alert(r.msg || '생성 실패');
        return;
    }
    initRunFromMetaSlot();
}

function initRunFromMetaSlot() {
    if (typeof MetaRPG === 'undefined') return false;
    const m = MetaRPG.loadMeta();
    const slot = m.slots.find((s) => s.id === m.activeSlotId);
    if (!slot) return false;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(MetaRPG.loadMeta());
    const jb = slot.jobKey;
    const job = jobBase[jb];
    if (!job) return false;
    const tb = slot.techBonus || { hp: 0, atk: 0, def: 0, acc: 0, crit: 0, critMult: 0 };
    const lv = slot.level || 1;
    const lb = MetaRPG.getLevelRuntimeBonus(lv);
    const rs = slot.rebirthStatBonus || { hp: 0, atk: 0, def: 0, acc: 0 };
    const baseHp = job.hp + tb.hp + lb.hp + (rs.hp || 0);
    const baseAtk = job.atk + tb.atk + lb.atk + (rs.atk || 0);
    const baseDef = job.def + tb.def + lb.def + (rs.def || 0);
    const baseAcc = tb.acc + lb.acc + (rs.acc || 0);
    clearSummonRunStorage();
    player = {
        ...job,
        curHp: baseHp,
        maxHp: baseHp,
        atk: baseAtk,
        def: baseDef,
        acc: baseAcc,
        crit: 1 + (tb.crit || 0),
        critMult: 1.8 + (tb.critMult || 0),
        divinePower: 0,
        divineGainMult: 1,
        prayerBonusFlat: 0,
        priestBlessed: false,
        chosenPriest: false,
        priestNextCrit: false,
        prayerVulnerableHits: 0,
        prayerCountThisTurn: 0,
        metaSlotId: slot.id,
        runLevel: lv,
        runExp: slot.exp || 0,
        items: [],
        relics: [],
        extraAtk: 0,
        potions: 3,
        extraDef: 0,
        unlockedSkill: null,
        ultStack: 0,
        ultMaxStack: 0,
        lifesteal: 0,
        hasRegenPotion: false,
        baseJob: job.name,
        evolved: false,
        shieldEmpowered: false,
        summon: null,
        _awaitPlayerTurn: false,
        fieldMerc: null,
        mercCooldownTurns: 0,
        mercNextBattleDebuff: null,
        _mercBattleAtkDebuff: 0,
        mercReviveAt90Percent: false,
        _mercCooldownSkipOnce: false,
        mercCompanionKind: null,
        mercEvolution: null,
        mercEvolutionChosen: false,
        mercRegenTurns: 0,
        mercRegenAmount: 0,
        mercBattleTurnCount: 0,
        mercInventory: [],
        activeQuest: null,
        farmingStay: false,
        shopRarityBoost: 0,
    };
    markPlayedJob(job.name);
    applyRebirthPctBonusToPlayer(slot);
    recalcPlayerDivineGainMult();
    floor = 1;
    gold = 0;
    totalGoldEarned = 0;
    rerollCost = 10;
    shopVisitCount = 0;
    document.getElementById('start-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    document.getElementById('log-battle').innerHTML = '';
    enterBattleLayout();
    loadCollection();
    if (jb === 'MercenaryCaptain') {
        MetaRPG.markRunCheckpoint(slot.id);
        showMercCompanionPicker();
        return true;
    }
    spawnEnemy();
    MetaRPG.markRunCheckpoint(slot.id);
    return true;
}

window.buyCampPermaNext = function buyCampPermaNext(key) {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const m = MetaRPG.loadMeta();
    const slot = m.slots.find((s) => s.id === player.metaSlotId);
    if (!slot) return;
    slot.campPerma = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    const lv = slot.campPerma[key] || 0;
    const price = getCampPermaNextPrice(key, lv);
    if (gold < price) return writeLog('[영구] 런 골드 부족');
    gold -= price;
    slot.campPerma[key] = lv + 1;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(m);
    writeLog(`[영구] ${key} Lv.${lv + 1} 강화! (-${price}G)`);
    const ov = document.getElementById('base-camp-overlay');
    if (ov) {
        window.__baseCampScrollTop = ov.scrollTop;
        ov.remove();
        openBaseCampTech();
    } else {
        showPreGameScreen();
    }
};

/** 구 세이브 호환 */
window.buyPermUpgradeNext = (key) => buyCampPermaNext(key);
window.buyPermUpgrade = (id) => {
    const key = String(id).split('_')[0];
    if (['hp', 'atk', 'def', 'crit', 'cm'].includes(key)) buyCampPermaNext(key);
};

/** @deprecated v7 — 슬롯/테크 시스템 사용. 직접 호출 시 테크 선택으로 연결 */
window.selectJobAndStart = (job) => {
    openTechLinePicker(job);
};

function showMercCompanionPicker() {
    const overlay = document.createElement('div');
    overlay.id = 'merc-companion-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:10001;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:480px;width:92%;text-align:center;">
            <h2 style="color:#e67e22;margin-bottom:8px;">⚔️ 첫 동료 선택</h2>
            <p style="color:#aaa;font-size:0.88em;margin-bottom:18px;line-height:1.45;">단장은 직접 싸우기 어렵습니다. <b>워리어 · 헌터 · 마법사</b> 중 동료 용병 1명을 고르세요.</p>
            ${['워리어','헌터','마법사'].map((k) => {
                const b = mercCompanionBases[k];
                return `<div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:15px;margin-bottom:10px;cursor:pointer;" onclick="pickMercCompanion('${k}')" onmouseenter="this.style.borderColor='#e67e22'" onmouseleave="this.style.borderColor='#555'">
                    <b style="color:#e0e0e0;">${b.label}</b> <span style="color:#888;font-size:0.85em;">(${k})</span>
                    <p style="color:#666;font-size:0.78em;margin:6px 0 0;">기본 상성: ${b.affinityJob}</p>
                </div>`;
            }).join('')}
        </div>`;
    document.body.appendChild(overlay);
}

window.pickMercCompanion = (kind) => {
    if (!player || player.baseJob !== '용병단장') return;
    if (!['워리어','헌터','마법사'].includes(kind)) return;
    player.mercCompanionKind = kind;
    const el = document.getElementById('merc-companion-overlay');
    if (el) el.remove();
    spawnEnemy();
};

function checkEvolution() {
    if (player.evolved || player.baseJob === '용병단장') return;
    if (jobEvolutions[player.baseJob]) setTimeout(() => showEvolutionChoice(jobEvolutions[player.baseJob]), 500);
}

function showEvolutionChoice(evols) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:30px;max-width:460px;width:90%;text-align:center;">
            <h2 style="color:#f1c40f;margin-bottom:8px;">⚡ 10층 달성! 전직 선택</h2>
            <p style="color:#aaa;font-size:0.9em;margin-bottom:20px;">${player.name}의 새로운 길을 선택하세요.</p>
            ${evols.map((e,i) => `
                <div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:15px;margin-bottom:12px;cursor:pointer;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='#f1c40f'" onmouseleave="this.style.borderColor='#555'" onclick="evolve(${i})">
                    <b style="color:#e0e0e0;font-size:1.1em;">${e.name}</b>
                    <p style="color:#888;font-size:0.85em;margin:6px 0 0;">${e.desc}</p>
                    <p style="color:#2ed573;font-size:0.8em;margin:4px 0 0;">ATK:${e.bonusAtk||'-'} / DEF:${e.bonusDef||'-'} / HP:${e.bonusHp||'-'}${e.bonusAcc?` / ACC:+${e.bonusAcc}%`:''}</p>
                    <p style="color:#9b59b6;font-size:0.8em;margin:4px 0 0;">🔥 궁극기: ${e.ult}</p>
                </div>`).join('')}
        </div>`;
    document.body.appendChild(overlay);
    window._evolOptions = evols; window._evolOverlay = overlay;
}

// ===================== 전직도(마인드맵) + 전직 이름 해금 =====================
const EVO_SEEN_KEY = 'evolution_seen_v1';
const PLAYED_JOBS_KEY = 'played_jobs_v1';
function loadSeenEvolutions() {
    try {
        const raw = localStorage.getItem(EVO_SEEN_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function saveSeenEvolutions(arr) {
    try {
        localStorage.setItem(EVO_SEEN_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function markEvolutionSeen(name) {
    const n = String(name || '');
    if (!n) return;
    const cur = loadSeenEvolutions();
    if (!cur.includes(n)) {
        cur.push(n);
        saveSeenEvolutions(cur);
    }
}
function evoLabelOrUnknown(name) {
    const n = String(name || '');
    if (!n) return '???';
    return loadSeenEvolutions().includes(n) ? n : '???';
}
function buildEvolutionMindmapHtml() {
    const rows = [
        { base: '워리어', color: '#ff4757', list: ['나이트', '버서커'] },
        { base: '헌터', color: '#2ed573', list: ['궁수', '암살자'] },
        { base: '마법사', color: '#1e90ff', list: ['위저드', '소환사', '성직자'] },
    ];
    const chips = (names) =>
        names
            .map((n) => {
                const v = evoLabelOrUnknown(n);
                const on = v !== '???';
                return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;border:1px solid ${
                    on ? '#f1c40f' : '#333'
                };background:${on ? '#2a2a1a' : '#0a0a0a'};color:${on ? '#f1c40f' : '#444'};font-weight:800;font-size:0.78em;margin:2px;">${v}</span>`;
            })
            .join('');
    return `<div style="margin:0 0 12px 0;padding:12px;background:#0d0d12;border:1px solid #333;border-radius:10px;">
  <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
    <div style="color:#f1c40f;font-weight:900;">🧭 전직도</div>
    <div style="color:#666;font-size:0.75em;">전직 후 해당 이름이 해금됩니다. (해금 전: ???)</div>
  </div>
  <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">
    ${rows
        .map(
            (r) =>
                `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;"><span style="min-width:66px;color:${r.color};font-weight:900;">${r.base}</span><span style="color:#555;">→</span><div>${chips(
                    r.list
                )}</div></div>`
        )
        .join('')}
  </div>
</div>`;
}

function loadPlayedJobs() {
    try {
        const raw = localStorage.getItem(PLAYED_JOBS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function savePlayedJobs(arr) {
    try {
        localStorage.setItem(PLAYED_JOBS_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function markPlayedJob(name) {
    const n = String(name || '').trim();
    if (!n) return;
    const cur = loadPlayedJobs();
    if (!cur.includes(n)) {
        cur.push(n);
        savePlayedJobs(cur);
    }
}
function collectPlayedBaseJobsFromMeta() {
    const out = [];
    try {
        if (typeof MetaRPG === 'undefined') return out;
        const m = MetaRPG.loadMeta();
        const slots = m && Array.isArray(m.slots) ? m.slots : [];
        slots.forEach((s) => {
            const jb = jobBase[s && s.jobKey];
            if (jb && jb.name) out.push(jb.name);
        });
    } catch (e) {
        /* ignore */
    }
    return out;
}
function getPlayedJobsForEvolutionMap() {
    return new Set([...loadPlayedJobs(), ...collectPlayedBaseJobsFromMeta(), ...loadSeenEvolutions()]);
}
function getJobSpecForTooltip(jobName) {
    const n = String(jobName || '');
    for (const k of Object.keys(jobBase || {})) {
        const j = jobBase[k];
        if (j && j.name === n) {
            return { atk: safeNum(j.atk, 0), def: safeNum(j.def, 0), crit: 1, critMult: 1.8, lifesteal: 0 };
        }
    }
    for (const baseName of Object.keys(jobEvolutions || {})) {
        const list = jobEvolutions[baseName] || [];
        const hit = list.find((x) => x && x.name === n);
        if (hit) {
            return {
                atk: safeNum(hit.bonusAtk, 0),
                def: safeNum(hit.bonusDef, 0),
                crit: 1,
                critMult: 1.8,
                lifesteal: 0,
            };
        }
    }
    return { atk: 0, def: 0, crit: 1, critMult: 1.8, lifesteal: 0 };
}
function getJobPassiveText(jobName) {
    const map = {
        워리어: '강인함: 기본 생존력이 높음',
        헌터: '정밀 사격: 명중/딜 균형',
        마법사: '주문 증폭: 높은 기본 공격력',
        나이트: '철벽 수호: 방어/체력 특화',
        버서커: '광전: 공격 특화',
        궁수: '저격 자세: 명중 강화',
        암살자: '암습: 고화력 일격',
        위저드: '마도 폭주: 마법 화력 특화',
        소환사: '소환 지휘: 소환수 중심 운영',
        성직자: '신성력: 기도/가호/선택받은 성직자',
    };
    return map[jobName] || '고유 패시브';
}
function buildPlayedEvolutionMapHtml() {
    const played = getPlayedJobsForEvolutionMap();
    const rows = [
        { base: '워리어', color: '#ff4757', list: ['나이트', '버서커'] },
        { base: '헌터', color: '#2ed573', list: ['궁수', '암살자'] },
        { base: '마법사', color: '#1e90ff', list: ['위저드', '소환사', '성직자'] },
    ];
    const makeCard = (name, color) => {
        const spec = getJobSpecForTooltip(name);
        const tip = `${name}\n패시브: ${getJobPassiveText(name)}\n공격력: ${spec.atk}\n방어력: ${spec.def}\n치명타 확률: ${spec.crit}%\n치명타 배율: ${spec.critMult.toFixed(2)}x\n흡혈: ${Math.round(spec.lifesteal * 100)}%`;
        return `<span title="${tip}" style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid ${color};background:#10141a;color:${color};font-weight:800;font-size:0.8em;margin:3px;cursor:help;">${name}</span>`;
    };
    const body = rows
        .map((r) => {
            const names = [r.base, ...r.list].filter((n) => played.has(n));
            if (!names.length) return '';
            const baseShown = names.includes(r.base) ? makeCard(r.base, r.color) : '';
            const evols = r.list.filter((n) => names.includes(n)).map((n) => makeCard(n, '#f1c40f')).join('');
            return `<div style="padding:10px;border:1px solid #2a2a2a;border-radius:10px;background:#0f0f14;"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">${baseShown || '<span style="color:#555;font-size:0.8em;">(기본 직업 미플레이)</span>'}${evols ? '<span style="color:#666;">→</span>' + evols : ''}</div></div>`;
        })
        .filter(Boolean)
        .join('');
    if (!body) {
        return `<div style="padding:14px;border:1px solid #333;border-radius:10px;background:#0d0d12;color:#888;line-height:1.6;">아직 플레이한 직업 기록이 없습니다.<br>캐릭터를 시작하거나 전직하면 이 전직도에 자동으로 표시됩니다.</div>`;
    }
    return `<div style="margin-bottom:10px;color:#888;font-size:0.82em;line-height:1.55;">직업 칩에 마우스를 올리면 패시브와 기본 스탯 정보를 볼 수 있습니다.</div><div style="display:flex;flex-direction:column;gap:8px;">${body}</div>`;
}
window.toggleEvolutionMap = (show) => {
    if (show) {
        const el = document.getElementById('evolution-list');
        if (el) el.innerHTML = buildPlayedEvolutionMapHtml();
    }
    const modal = document.getElementById('evolution-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
};

window.evolve = (idx) => {
    const evol = window._evolOptions[idx];
    const oldName = player.name;
    const baseKey = player.baseJob==='워리어'?'Warrior':player.baseJob==='헌터'?'Hunter':'Wizard';
    player.name = evol.name; player.evolved = true;
    markPlayedJob(evol.name);
    markEvolutionSeen(evol.name);
    player.atk = evol.bonusAtk||jobBase[baseKey].atk;
    player.def = evol.bonusDef||jobBase[baseKey].def;
    if (evol.bonusHp) { player.maxHp=evol.bonusHp; player.curHp=Math.min(player.curHp,player.maxHp); }
    if (evol.bonusAcc) player.acc = evol.bonusAcc;
    player.extraAtk=0; player.extraDef=0;
    player.items.forEach(it => { if (it.type === 'merc') return; if (it.type==='atk') player.atk+=it.value; if (it.type==='acc') player.acc+=it.value; if (it.def) player.extraDef+=it.def; });
    // 궁극기 세팅
    player.unlockedSkill = evol.ult;
    const ultSpec = ultSkills[evol.ult];
    player.ultStack = 0;
    player.ultMaxStack = ultSpec ? ultSpec.stackRequired : 3;
    if (evol.name === '소환사') {
        const saved = loadSummonFromStorage();
        if (saved && saved.id) player.summon = saved;
    }
    if (player.metaSlotId && typeof MetaRPG !== 'undefined') {
        const slot = MetaRPG.getSlotById(player.metaSlotId);
        if (slot) {
            MetaRPG.recalcTechBonus(slot);
            const tb = slot.techBonus || { hp: 0, atk: 0, def: 0, acc: 0 };
            const lb = MetaRPG.getLevelRuntimeBonus(slot.level || 1);
            player.atk += tb.atk + lb.atk;
            player.def += tb.def + lb.def;
            player.acc += tb.acc + lb.acc;
            player.maxHp += tb.hp + lb.hp;
            player.curHp += tb.hp + lb.hp;
            player.curHp = Math.min(player.maxHp, player.curHp);
        }
    }
    document.body.removeChild(window._evolOverlay);
    if (evol.name === '성직자') {
        player.divinePower = safeNum(player.divinePower, 0);
        recalcPlayerDivineGainMult();
    }
    writeLog(`⚡ [전직] ${oldName} → <b style='color:#f1c40f'>${evol.name}</b>! 궁극기 [${evol.ult}] 획득!`);
    updateUi(); renderActions();
};

function checkFloorUnlock(f) {
    const baseJob = player.baseJob;
    try { maybeUnlockEvolutionItemsFromBasePlay(f); } catch (e) { /* ignore */ }
    if (f%10===0 && floorUnlocks[f]) {
        const gu = getUnlockedFloors(null);
        if (!gu.includes(f)) { saveUnlockedFloor(f,null); showUnlockPopup(`🔓 ${f}층 달성!`,`공용 아이템<br><b style="color:#f1c40f;">${floorUnlocks[f].name}</b>이 상점에 해금!`,'#f1c40f'); writeLog(`🔓 공용 [${floorUnlocks[f].name}] 해금!`); }
    }
    if (f%5===0 && f%10!==0) {
        let ui = null;
        if (baseJob==='워리어'&&floorUnlocks[f]) ui=floorUnlocks[f];
        else if (baseJob==='헌터'&&floorUnlocksHunter[f]) ui=floorUnlocksHunter[f];
        else if (baseJob==='마법사'&&floorUnlocksWizard[f]) ui=floorUnlocksWizard[f];
        if (ui) {
            const ju = getUnlockedFloors(baseJob);
            if (!ju.includes(f)) { saveUnlockedFloor(f,baseJob); showUnlockPopup(`🔓 ${f}층 달성!`,`${player.name} 전용<br><b style="color:#2ed573;">${ui.name}</b>이 해금!`,'#2ed573'); writeLog(`🔓 전용 [${ui.name}] 해금!`); }
        }
    }
}

// ===================== 이벤트 층 =====================
function checkEventFloor(f) {
    // 15, 25, 35, 45, 55, 65, 75, 85, 95층 = 이벤트 층
    const eventFloors = [15, 25, 35, 45, 55, 65, 75, 85, 95];
    return eventFloors.includes(f);
}

function showEventFloor() {
    const roll = Math.random();
    // 20% 대장간, 15% 스킬 이벤트, 65% 스탯 변환
    if (roll < 0.20) {
        showForgeEvent();
    } else if (roll < 0.35 && floor >= 25) {
        showSkillEvent();
    } else {
        showStatSwapEvent();
    }
}

function showStatSwapEvent() {
    const events = [
        {
            title: "⚔️ → 🛡️ 공격을 방어로",
            desc: "공격력의 30%를 방어력으로 전환합니다.",
            action: () => {
                const transfer = Math.floor(player.atk * 0.3);
                player.atk -= transfer; player.extraDef += transfer;
                writeLog(`[이벤트층] ⚔️→🛡️ 공격력 -${transfer}, 방어력 +${transfer}`);
            }
        },
        {
            title: "🛡️ → ⚔️ 방어를 공격으로",
            desc: "방어력의 50%를 공격력으로 전환합니다.",
            action: () => {
                const transfer = Math.floor((player.def+player.extraDef) * 0.5);
                player.extraDef = Math.max(0, player.extraDef - transfer);
                player.def = Math.max(0, player.def - Math.max(0, transfer - player.extraDef));
                player.atk += transfer;
                writeLog(`[이벤트층] 🛡️→⚔️ 방어력 -${transfer}, 공격력 +${transfer}`);
            }
        },
        {
            title: "🛡️ → 💥 방어를 치명타로",
            desc: "방어 확률을 20% 줄이는 대신 치명타 확률 +15%, 치명타 배율 +30%.",
            action: () => {
                player.crit += 15; player.critMult += 0.3;
                writeLog(`[이벤트층] 🛡️→💥 치명타 확률 +15%, 배율 +30%`);
            }
        },
        {
            title: "❤️ → ⚔️ 체력을 공격으로",
            desc: "최대 체력의 20%를 공격력으로 전환합니다.",
            action: () => {
                const transfer = Math.floor(player.maxHp * 0.2);
                player.maxHp -= transfer; player.curHp = Math.min(player.curHp, player.maxHp);
                player.atk += Math.floor(transfer / 5);
                writeLog(`[이벤트층] ❤️→⚔️ 체력 -${transfer}, 공격력 +${Math.floor(transfer/5)}`);
            }
        },
        {
            title: "🎲 랜덤 강화",
            desc: "완전 랜덤! 모든 스탯이 ±20% 변동됩니다.",
            action: () => {
                const atkChange = Math.floor(player.atk * (Math.random()*0.4-0.2));
                const defChange = Math.floor((player.def+player.extraDef) * (Math.random()*0.4-0.2));
                const hpChange = Math.floor(player.maxHp * (Math.random()*0.4-0.2));
                player.atk = Math.max(1, player.atk+atkChange);
                player.extraDef = Math.max(0, player.extraDef+defChange);
                player.maxHp = Math.max(50, player.maxHp+hpChange);
                player.curHp = Math.min(player.curHp, player.maxHp);
                writeLog(`[이벤트층] 🎲 랜덤 강화! ATK${atkChange>=0?'+':''}${atkChange} / DEF${defChange>=0?'+':''}${defChange} / HP${hpChange>=0?'+':''}${hpChange}`);
            }
        }
    ];

    const shuffled = events.sort(() => Math.random()-0.5).slice(0, 3);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #e67e22;border-radius:12px;padding:30px;max-width:500px;width:90%;text-align:center;">
            <h2 style="color:#e67e22;margin-bottom:6px;">🔀 이벤트 층! ${floor}F</h2>
            <p style="color:#aaa;font-size:0.88em;margin-bottom:20px;">운명의 갈림길에 서있습니다. 하나를 선택하세요.</p>
            ${shuffled.map((e,i) => `
                <div onclick="resolveStatSwap(${i})" style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:14px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s;text-align:left;" onmouseenter="this.style.borderColor='#e67e22'" onmouseleave="this.style.borderColor='#555'">
                    <b style="color:#e0e0e0;">${e.title}</b>
                    <p style="color:#888;font-size:0.85em;margin:5px 0 0;">${e.desc}</p>
                </div>`).join('')}
            <button onclick="resolveStatSwap(-1)" style="background:#333;color:#888;width:100%;margin-top:5px;padding:10px;font-size:0.85em;">변화를 거부한다</button>
        </div>`;
    document.body.appendChild(overlay);
    window._statSwapEvents = shuffled;
    window._statSwapOverlay = overlay;
}

window.resolveStatSwap = (idx) => {
    document.body.removeChild(window._statSwapOverlay);
    if (idx >= 0) window._statSwapEvents[idx].action();
    else writeLog(`[이벤트층] 변화를 거부했습니다.`);
    updateUi();
    if (floor > 1 && floor % 3 === 0) pendingShop = true;
    spawnEnemy();
};

// ===================== 스킬 이벤트 =====================
function showSkillEvent() {
    const bonusSkills = [
        { name: "피의 분노", desc: "공격 시 10% 확률로 추가 타격 (공격력 80%).", effect: 'bonus_bleed' },
        { name: "강철 심장", desc: "매 3턴마다 체력 최대치의 5% 자동 회복.", effect: 'bonus_regen' },
        { name: "폭발 일격", desc: "치명타 발동 시 추가로 공격력 50% 고정 피해.", effect: 'bonus_explode' },
        { name: "철벽",      desc: "방어/회피/방어막 성공률 +15%.", effect: 'bonus_guard' },
        { name: "사냥꾼의 눈", desc: "명중률 +10%, 치명타 확률 +8%.", effect: 'bonus_hunter_eye' },
    ].filter(s => !(player.bonusSkills||[]).includes(s.effect));

    if (bonusSkills.length === 0) {
        writeLog(`[이벤트층] 이미 모든 보너스 스킬을 보유하고 있습니다!`);
        if (floor > 1 && floor % 3 === 0) pendingShop = true;
        spawnEnemy(); return;
    }

    const options = bonusSkills.sort(() => Math.random()-0.5).slice(0, 2);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #9b59b6;border-radius:12px;padding:30px;max-width:460px;width:90%;text-align:center;">
            <h2 style="color:#9b59b6;margin-bottom:6px;">✨ 신비로운 각성!</h2>
            <p style="color:#aaa;font-size:0.88em;margin-bottom:20px;">숨겨진 힘을 깨달았습니다. 하나를 선택하세요.</p>
            ${options.map((s,i) => `
                <div onclick="resolveSkillEvent(${i})" style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:14px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s;text-align:left;" onmouseenter="this.style.borderColor='#9b59b6'" onmouseleave="this.style.borderColor='#555'">
                    <b style="color:#9b59b6;">✨ ${s.name}</b>
                    <p style="color:#888;font-size:0.85em;margin:5px 0 0;">${s.desc}</p>
                </div>`).join('')}
            <button onclick="resolveSkillEvent(-1)" style="background:#333;color:#888;width:100%;margin-top:5px;padding:10px;font-size:0.85em;">거절한다</button>
        </div>`;
    document.body.appendChild(overlay);
    window._skillEventOptions = options;
    window._skillEventOverlay = overlay;
}

window.resolveSkillEvent = (idx) => {
    document.body.removeChild(window._skillEventOverlay);
    if (idx >= 0) {
        const skill = window._skillEventOptions[idx];
        if (!player.bonusSkills) player.bonusSkills = [];
        player.bonusSkills.push(skill.effect);
        // 즉시 적용 효과
        if (skill.effect === 'bonus_guard') { player._guardBonus = 15; }
        if (skill.effect === 'bonus_hunter_eye') { player.acc += 10; player.crit += 8; }
        writeLog(`[각성] ✨ <b style='color:#9b59b6'>${skill.name}</b> 습득!`);
        showUnlockPopup('✨ 스킬 각성!', `<b style="color:#9b59b6">${skill.name}</b><br>${skill.desc}`, '#9b59b6');
    } else writeLog(`[이벤트층] 각성을 거부했습니다.`);
    updateUi();
    if (floor > 1 && floor % 3 === 0) pendingShop = true;
    spawnEnemy();
};

// ===================== 대장간 =====================
function showForgeEvent() {
    const commonItems = player.items.filter(i => i.rarity === 'common' && i.type !== 'merc');
    const rareItems = player.items.filter(i => i.rarity === 'rare' && i.type !== 'merc');
    const epicItems = player.items.filter(i => i.rarity === 'epic' && i.type !== 'merc');

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:9999;overflow-y:auto;';

    const recipes = forgeRecipes.filter(r => {
        if (r.materialRarity === 'common') return commonItems.length >= r.materials;
        if (r.materialRarity === 'rare') return rareItems.length >= r.materials;
        if (r.materialRarity === 'epic') return epicItems.length >= r.materials;
        return false;
    });

    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #e67e22;border-radius:12px;padding:30px;max-width:520px;width:90%;text-align:center;margin:20px auto;">
            <h2 style="color:#e67e22;margin-bottom:6px;">⚒️ 대장간</h2>
            <p style="color:#aaa;font-size:0.85em;margin-bottom:5px;">보유: 일반 ${commonItems.length}개 / 희귀 ${rareItems.length}개 / 고급 ${epicItems.length}개</p>
            <p style="color:#666;font-size:0.8em;margin-bottom:18px;">아이템을 합성해 더 강한 장비를 만드세요. 실패 시 재료가 소모됩니다.</p>
            ${recipes.length === 0 ? `<p style="color:#555;padding:20px;">합성 가능한 레시피가 없습니다.<br><span style="font-size:0.85em;">재료: 일반 2개, 희귀 2개, 또는 고급 2개 필요</span></p>` :
            recipes.map((r,i) => `
                <div style="background:#2a2a3e;border:1px solid ${r.rarity==='legendary'?'#e74c3c':r.rarity==='epic'?'#a55eea':'#1e90ff'};border-radius:8px;padding:12px;margin-bottom:10px;text-align:left;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <b style="color:${r.rarity==='legendary'?'#e74c3c':r.rarity==='epic'?'#a55eea':'#1e90ff'}">${r.name}</b>
                            <span style="color:#666;font-size:0.75em;margin-left:8px;">(성공률 ${Math.round(r.successRate*100)}%)</span>
                            <p style="color:#888;font-size:0.8em;margin:4px 0 0;">${r.desc}</p>
                            <p style="color:#555;font-size:0.75em;margin:3px 0 0;">재료: ${r.materialRarity==='common'?'일반':r.materialRarity==='rare'?'희귀':'고급'} ${r.materials}개 소모</p>
                        </div>
                        <button onclick="resolveForge(${i})" style="background:#e67e22;color:#111;padding:8px 14px;font-size:0.85em;font-weight:700;margin:0;border-radius:6px;white-space:nowrap;">합성</button>
                    </div>
                </div>`).join('')}
            <button onclick="resolveForge(-1)" style="background:#333;color:#888;width:100%;margin-top:8px;padding:10px;font-size:0.85em;">대장간을 나간다</button>
        </div>`;
    document.body.appendChild(overlay);
    window._forgeRecipes = recipes;
    window._forgeOverlay = overlay;
}

window.resolveForge = (idx) => {
    document.body.removeChild(window._forgeOverlay);
    if (idx < 0) { writeLog(`[대장간] 그냥 나왔습니다.`); }
    else {
        const recipe = window._forgeRecipes[idx];
        const materialItems = player.items.filter(i => i.rarity === recipe.materialRarity);
        // 재료 소모 (가장 약한 것부터)
        const toRemove = materialItems.slice(0, recipe.materials);
        toRemove.forEach(item => {
            // 스탯 원상복구
            if (item.type==='atk') player.atk = Math.max(1, player.atk - item.value);
            if (item.type==='hp') { player.maxHp = Math.max(50, player.maxHp-item.value); player.curHp = Math.min(player.curHp, player.maxHp); }
            if (item.type==='acc') player.acc -= item.value;
            if (item.def) player.extraDef = Math.max(0, player.extraDef-item.def);
            if (item.lifesteal) player.lifesteal = Math.max(0, player.lifesteal-item.lifesteal);
            if (item.critBonus) player.crit = Math.max(1, player.crit-item.critBonus);
            if (item.critMult) player.critMult = Math.max(1.8, player.critMult-item.critMult);
            player.items = player.items.filter(i => i !== item);
        });

        if (Math.random() < recipe.successRate) {
            const newItem = { ...recipe };
            player.items.push(newItem);
            saveCollection(newItem.name);
            if (newItem.type==='atk') player.atk += newItem.value;
            if (newItem.type==='hp') { player.maxHp += newItem.value; player.curHp += newItem.value; }
            if (newItem.type==='acc') player.acc += newItem.value;
            if (newItem.def) player.extraDef += newItem.def;
            if (newItem.lifesteal) player.lifesteal += newItem.lifesteal;
            if (newItem.critBonus) player.crit += newItem.critBonus;
            if (newItem.critMult) player.critMult += newItem.critMult;
            writeLog(`[대장간] ✅ 합성 성공! <b style='color:${recipe.rarity==='legendary'?'#e74c3c':recipe.rarity==='epic'?'#a55eea':'#1e90ff'}'>${recipe.name}</b> 획득!`);
            showUnlockPopup('⚒️ 합성 성공!', `<b>${recipe.name}</b> 제작 완료!`, '#e67e22');
        } else {
            writeLog(`[대장간] ❌ 합성 실패... 재료 ${recipe.materials}개가 사라졌습니다.`);
            showUnlockPopup('⚒️ 합성 실패', `재료가 소모되었습니다...`, '#ff4757');
        }
    }
    updateUi();
    if (floor > 1 && floor % 3 === 0) pendingShop = true;
    spawnEnemy();
};

// ===================== 랜덤 인카운터 =====================
const encounterEvents = [
    { title:"💀 피눈물 흘리는 여신상", desc:"여신상 앞에 섰습니다.", choices:[
        { label:"최대 체력 절반을 바치고 전설 아이템 획득", action:()=>{
            const s=Math.floor(player.maxHp*0.5); player.maxHp=Math.max(50,player.maxHp-s); player.curHp=Math.max(1,player.curHp-s);
            const l=getNonMercEquipmentPool().filter(i=>i.rarity==='legendary'&&!player.items.some(p=>p.name===i.name));
            if(l.length>0){const it=l[Math.floor(Math.random()*l.length)];player.items.push(it);saveCollection(it.name);if(it.type!=='merc'){if(it.type==='atk')player.atk+=it.value;if(it.type==='hp'){player.maxHp+=it.value;player.curHp+=it.value;}if(it.critBonus)player.crit+=it.critBonus;if(it.critMult)player.critMult+=it.critMult;if(it.lifesteal)player.lifesteal+=it.lifesteal;}writeLog(`[이벤트] 💀 <b style='color:#e74c3c'>${it.name}</b> 획득!`);}
            else{gold+=200;writeLog(`[이벤트] 💀 골드 200G를 받았습니다.`);}
        }},
        {label:"무시하고 지나간다",action:()=>writeLog(`[이벤트] 여신상을 무시했습니다.`)}
    ]},
    { title:"🧙 떠돌이 상인", desc:"수상한 상인이 나타났습니다.", choices:[
        { label:"골드 50G로 랜덤 에픽 아이템", action:()=>{
            if(gold<50){writeLog(`[이벤트] 골드 부족!`);return;}gold-=50;
            const e=getNonMercEquipmentPool().filter(i=>i.rarity==='epic'&&!player.items.some(p=>p.name===i.name));
            if(e.length>0){const it=e[Math.floor(Math.random()*e.length)];player.items.push(it);saveCollection(it.name);if(it.type!=='merc'){if(it.type==='atk')player.atk+=it.value;if(it.type==='hp'){player.maxHp+=it.value;player.curHp+=it.value;}if(it.critBonus)player.crit+=it.critBonus;if(it.critMult)player.critMult+=it.critMult;}writeLog(`[이벤트] 🧙 <b style='color:#a55eea'>${it.name}</b> 획득!`);}
        }},
        {label:"거절한다",action:()=>writeLog(`[이벤트] 상인을 거절했습니다.`)}
    ]},
    { title:"⚗️ 수상한 물약", desc:"바닥에 수상한 물약이 있습니다.", choices:[
        { label:"마신다 (랜덤: 회복/강화/독)", action:()=>{
            const r=Math.random();
            if(r<0.4){const h=Math.floor(player.maxHp*0.3);player.curHp=Math.min(player.maxHp,player.curHp+h);writeLog(`[이벤트] ⚗️ 회복! +${h}`);}
            else if(r<0.7){player.atk+=8;writeLog(`[이벤트] ⚗️ 강화! 공격력 +8`);}
            else{const d=Math.floor(player.maxHp*0.2);player.curHp=Math.max(1,player.curHp-d);writeLog(`[이벤트] ⚗️ 독! -${d}`);}
        }},
        {label:"버린다",action:()=>writeLog(`[이벤트] 버렸습니다.`)}
    ]},
    { title:"👻 쓰러진 모험가", desc:"쓰러진 모험가의 유품이 있습니다.", choices:[
        {label:"유품을 가져간다 (골드+포션)",action:()=>{const g=30+Math.floor(Math.random()*50);gold+=g;player.potions++;writeLog(`[이벤트] 👻 ${g}G + 포션 1개!`);}},
        {label:"명복을 빈다 (HP 회복)",action:()=>{const h=Math.floor(player.maxHp*0.1);player.curHp=Math.min(player.maxHp,player.curHp+h);writeLog(`[이벤트] 👻 ${h} 회복.`);}}
    ]},
    { title:"🔥 불길한 제단", desc:"악마의 힘을 느낍니다.", choices:[
        {label:"계약 (HP -20%, 공격력 +20 영구)",action:()=>{const d=Math.floor(player.maxHp*0.2);player.curHp=Math.max(1,player.curHp-d);player.maxHp=Math.max(50,player.maxHp-d);player.atk+=20;writeLog(`[이벤트] 🔥 악마 계약! 공격력 +20`);}},
        {label:"거부한다",action:()=>writeLog(`[이벤트] 거부했습니다.`)}
    ]},
    { title:"✨ 신비로운 샘물", desc:"맑은 빛을 발하는 샘물이 있습니다.", choices:[
        {label:"마신다 (체력 완전 회복)",action:()=>{player.curHp=player.maxHp;writeLog(`[이벤트] ✨ 체력 완전 회복!`);}},
        {label:"손을 씻는다 (치명타 +5%)",action:()=>{player.crit+=5;writeLog(`[이벤트] ✨ 치명타 확률 +5%!`);}}
    ]}
];

/** 소환사 15층 1회: 계약의 제단 */
function showContractAltar() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:10000;';
    overlay.innerHTML = `
        <div style="background:#1a0a2a;border:2px solid #9b59b6;border-radius:12px;padding:28px;max-width:480px;width:92%;text-align:center;">
            <h2 style="color:#9b59b6;margin-bottom:10px;">🔮 계약의 제단</h2>
            <p style="color:#aaa;font-size:0.88em;margin-bottom:18px;line-height:1.5;">소환수와 계약을 맺습니다. 선택 후 이번 모험 내내 전투에 함께합니다.</p>
            <div onclick="resolveContractAltar('fire')" style="background:#2a1a1a;border:1px solid #e74c3c;border-radius:8px;padding:12px;margin-bottom:10px;cursor:pointer;text-align:left;">
                <b style="color:#e74c3c;">🔥 불의 정령</b>
                <p style="color:#888;font-size:0.82em;margin:6px 0 0;">공격 적중 시, 공격력의 20%만큼 방어 무시 추가 피해.</p>
            </div>
            <div onclick="resolveContractAltar('golem')" style="background:#1a1a2a;border:1px solid #95a5a6;border-radius:8px;padding:12px;margin-bottom:10px;cursor:pointer;text-align:left;">
                <b style="color:#bdc3c7;">🪨 바위 골렘</b>
                <p style="color:#888;font-size:0.82em;margin:6px 0 0;">피격 시 받는 피해를 30% 추가 감소.</p>
            </div>
            <div onclick="resolveContractAltar('dark')" style="background:#0f0f1a;border:1px solid #8e44ad;border-radius:8px;padding:12px;margin-bottom:10px;cursor:pointer;text-align:left;">
                <b style="color:#a55eea;">😈 어둠의 악마</b>
                <p style="color:#888;font-size:0.82em;margin:6px 0 0;">내 턴 시작 시 최대 체력 5%를 잃고, 방어 50% 무시 마법 피해(공격력×2)를 추가로 가합니다.</p>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    window._contractAltarOverlay = overlay;
}

window.resolveContractAltar = (id) => {
    const map = {
        fire: { id: 'fire', name: '불의 정령' },
        golem: { id: 'golem', name: '바위 골렘' },
        dark: { id: 'dark', name: '어둠의 악마' }
    };
    const s = map[id];
    if (!s || !player) return;
    player.summon = s;
    saveSummonToStorage(s);
    localStorage.setItem('summon_altar_done', '1');
    if (window._contractAltarOverlay && window._contractAltarOverlay.parentNode) {
        document.body.removeChild(window._contractAltarOverlay);
    }
    writeLog(`[계약] 🔮 <b style='color:#9b59b6'>${s.name}</b>과(와) 계약을 맺었습니다!`);
    updateUi();
    spawnEnemy();
};

function showRandomEncounter() {
    const event = encounterEvents[Math.floor(Math.random()*encounterEvents.length)];
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #9b59b6;border-radius:12px;padding:30px;max-width:460px;width:90%;text-align:center;">
            <h2 style="color:#9b59b6;margin-bottom:8px;">⚡ 돌발 이벤트!</h2>
            <h3 style="color:#e0e0e0;margin-bottom:12px;">${event.title}</h3>
            <p style="color:#aaa;font-size:0.9em;margin-bottom:24px;">${event.desc}</p>
            ${event.choices.map((c,i)=>`<div onclick="resolveEncounter(${i})" style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:14px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s;text-align:left;" onmouseenter="this.style.borderColor='#9b59b6'" onmouseleave="this.style.borderColor='#555'"><span style="color:#e0e0e0;font-size:0.95em;">${i+1}. ${c.label}</span></div>`).join('')}
        </div>`;
    document.body.appendChild(overlay);
    window._currentEncounter = event; window._encounterOverlay = overlay;
}

window.resolveEncounter = (idx) => {
    const event = window._currentEncounter;
    document.body.removeChild(window._encounterOverlay);
    event.choices[idx].action(); updateUi();
    if (floor>1&&floor%3===0) pendingShop=true;
    spawnEnemy();
};

// ===================== 적 스폰 =====================
function spawnEnemy() {
    if (pendingShop) { pendingShop=false; return openShop(); }
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
    }
    if (player.relics&&player.relics.includes('gambler')) {
        const pa = safeNum(player.atk, 0);
        if (Math.random()<0.5) {
            player.extraAtk=Math.floor(pa*0.22);
            writeLog(`[유물] 🎲 도박사의 주사위: 공격력 +22%`);
        } else {
            player._relicTempCrit = 18;
            writeLog(`[유물] 🎲 도박사의 주사위: 치명타 확률 +18%`);
        }
    }

    if (floor%10===0) {
        let bossHp,bossAtk,bossDef;
        if(floor<=10){bossHp=200+floor*20;bossAtk=12+floor*3;bossDef=3+Math.floor(floor/3);}
        else if(floor<=30){bossHp=400+floor*30;bossAtk=20+floor*5;bossDef=8+Math.floor(floor/2);}
        else if(floor<=60){bossHp=800+floor*40;bossAtk=35+floor*7;bossDef=15+Math.floor(floor/2);}
        else{bossHp=1500+floor*55;bossAtk=60+floor*10;bossDef=25+Math.floor(floor/2);}
        enemy={name:`👑 [보스] ${floor}층 군주`,job:'보스',hp:bossHp,curHp:bossHp,atk:bossAtk,def:bossDef,isBoss:true,turnCount:1,bossCharge:false,weakPoint:false};
        writeLog(`🚨 경고: ${floor}층의 지배자가 나타났습니다!`);
    } else {
        const eJobs=['워리어','헌터','마법사'];
        let rj=eJobs[Math.floor(Math.random()*eJobs.length)];
        if(rj===lastEnemyJob) rj=eJobs[Math.floor(Math.random()*eJobs.length)];
        lastEnemyJob=rj;
        let mh,ma,md;
        if(floor<=10){mh=30+floor*8;ma=5+floor*1.5;md=Math.floor(floor/4);}
        else if(floor<=30){mh=100+floor*15;ma=18+floor*3;md=4+Math.floor(floor/3);}
        else if(floor<=60){mh=300+floor*22;ma=35+floor*5;md=10+Math.floor(floor/2);}
        else{mh=700+floor*30;ma=65+floor*8;md=20+Math.floor(floor/2);}
        enemy={name:`[${rj}형] ${floor}층 괴수`,job:rj,hp:Math.floor(mh),curHp:Math.floor(mh),atk:Math.floor(ma),def:Math.floor(md),isBoss:false,weakPoint:false};
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

function renderActions() {
    const div = document.getElementById('action-btns');
    div.innerHTML = '';
    const atkBtn = document.createElement('button');
    atkBtn.id = 'btn-attack';
    atkBtn.innerText='⚔️ 공격'; atkBtn.style.background=player.color;
    const gcdLeft = attackGcdUntil - Date.now();
    if (gcdLeft > 0) {
        atkBtn.disabled = true;
        atkBtn.style.opacity = '0.45';
        atkBtn.style.cursor = 'not-allowed';
        atkBtn.title = `쿨다운 ${Math.ceil(gcdLeft/100)/10}초`;
    }
    atkBtn.onclick=()=>useAction('공격'); div.appendChild(atkBtn);

    const defBtn = document.createElement('button');
    defBtn.style.background='#888';
    const jn = player.name;
    if(['워리어','나이트','버서커'].includes(jn)){defBtn.innerText='🛡️ 방어 (70%)';defBtn.onclick=()=>useAction('방패방어');}
    else if(player.baseJob === '용병단장'){defBtn.innerText='💨 회피 (75%)';defBtn.onclick=()=>useAction('회피');}
    else if(['헌터','궁수','암살자'].includes(jn)){defBtn.innerText='💨 회피 (75%)';defBtn.onclick=()=>useAction('회피');}
    else if(['마법사','위저드','소환사','성직자'].includes(jn)){defBtn.innerText='✨ 방어막 (60%)';defBtn.onclick=()=>useAction('방어막');}
    div.appendChild(defBtn);

    if (player.name === '성직자') {
        const prayBtn = document.createElement('button');
        prayBtn.style.background = '#9b59b6';
        prayBtn.style.color = '#fff';
        prayBtn.innerText = player.chosenPriest ? '🔒 기도 봉인' : '🙏 기도 (+신성력)';
        prayBtn.disabled = !!player.chosenPriest;
        if (player.chosenPriest) {
            prayBtn.style.opacity = '0.5';
            prayBtn.style.cursor = 'not-allowed';
        }
        prayBtn.onclick = () => useAction('기도');
        div.appendChild(prayBtn);
    }

    if (isMercenaryCaptainJob() && player.mercCooldownTurns > 0 && (!player.fieldMerc || player.fieldMerc.mercHp <= 0)) {
        const cost = getMercGoldSkipCost();
        if (gold >= cost) {
            const gBtn = document.createElement('button');
            gBtn.style.background = '#f1c40f';
            gBtn.style.color = '#111';
            gBtn.innerText = `🪙 긴급 재가동 (${cost}G)`;
            gBtn.onclick = () => mercGoldSkipCooldown();
            div.appendChild(gBtn);
        }
    }

    // 궁극기 버튼 (20층 이상, 스택 표시)
    if (player.unlockedSkill && floor >= 20) {
        const ultBtn = document.createElement('button');
        const isReady = player.ultStack >= player.ultMaxStack;
        ultBtn.style.background = isReady ? '#9b59b6' : '#333';
        ultBtn.style.color = isReady ? '#fff' : '#666';
        ultBtn.style.border = `2px solid ${isReady ? '#9b59b6' : '#555'}`;
        ultBtn.innerHTML = `🔥 ${player.unlockedSkill} <span style="font-size:0.8em;">[${player.ultStack}/${player.ultMaxStack}]</span>`;
        ultBtn.disabled = !isReady;
        ultBtn.onclick = () => useAction('궁극기');
        div.appendChild(ultBtn);
    }

    const pBtn = document.createElement('button');
    pBtn.innerText=`🧪 포션 (${player.potions})`; pBtn.className='potion-btn';
    pBtn.onclick=usePotion; div.appendChild(pBtn);

    if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
        const gc = document.createElement('button');
        gc.style.background = '#16a085';
        gc.style.color = '#fff';
        gc.innerText = `💰 용병 지원 (${getMercGachaCost()}G)`;
        gc.onclick = () => mercenaryFundGacha();
        div.appendChild(gc);
    }
}

function applySummonDarkTurnStart() {
    if (!player || !enemy || !player._awaitPlayerTurn) return;
    player._awaitPlayerTurn = false;
    if (player.name === '소환사' && floor < 100) {
        // 전직 추가 패시브 잠금: 100층 전까지 소환수 비활성
        return false;
    }
    if (player.summon && player.summon.id === 'dark') {
        // 너프: 비용/피해 하향
        const hpCost = Math.max(1, Math.floor(player.maxHp * 0.06));
        player.curHp = Math.max(1, player.curHp - hpCost);
        const rawAtk = getEffectiveAttackPower();
        const md = Math.max(1, Math.floor(1.15 * rawAtk - Math.floor(enemy.def * 0.35)));
        enemy.curHp -= md;
        writeLog(`[소환] 😈 어둠의 악마! 체력 -${hpCost}, 마법 피해 ${md}!`);
        showDmgFloat(md, true, false); triggerShakeEffect();
        if (enemy.curHp <= 0) { winBattle(); return true; }
    }
    return false;
}

window.useAction = (type) => {
    if (type === '공격') {
        const now = Date.now();
        if (now < attackGcdUntil) {
            return writeLog(`[쿨다운] 공격을 너무 빨리 눌렀습니다!`);
        }
    }
    if (applySummonDarkTurnStart()) return;

    if (type==='공격') {
        const now = Date.now();
        attackGcdUntil = now + ATTACK_GCD_MS;
        setTimeout(() => { renderActions(); }, ATTACK_GCD_MS);

        // 스택 증가
        if (player.unlockedSkill && floor >= 20) {
            player.ultStack = Math.min(player.ultMaxStack, player.ultStack + 1);
        }
        let multiplier=1.0, effectMsg="";
        const relKey=getAffinityRelKey();
        if(!enemy.isBoss&&relations[relKey]){
            if(relations[relKey].strong===enemy.job){multiplier=1.5;effectMsg="<b style='color:#2ed573'>(상성 우위!)</b> ";}
            else if(relations[relKey].weak===enemy.job){multiplier=0.8;effectMsg="<b style='color:#ff4757'>(상성 열세..)</b> ";}
        }
        const accRate=isMercenaryCaptainJob()&&player.fieldMerc&&player.fieldMerc.mercHp>0
            ?Math.min(95,BASE_HIT_ACCURACY+player.acc+getMercBonusAcc())
            :Math.min(95,BASE_HIT_ACCURACY+player.acc);
        if(Math.random()*100<accRate){
            let berserkMult = (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) ? 1.35 : 1;
            if (berserkMult > 1) effectMsg += "<b style='color:#e74c3c'>【광폭화】</b> ";
            let baseDmg;
            if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
                const mm = getFieldMercAttackMult();
                baseDmg = Math.floor((getMercEffectiveAttackPower() * mm + Math.floor(Math.random() * 8)) * berserkMult);
                const specialChance = 0.1 + Math.random() * 0.1;
                if (Math.random() < specialChance) {
                    baseDmg = Math.floor(baseDmg * 2.55);
                    effectMsg += "<b style='color:#e67e22'>【용병 필살기】</b> ";
                    triggerCritEffect();
                    triggerShakeEffect();
                }
                tryMercenaryRandomEvent();
            } else if (isMercenaryCaptainJob()) {
                baseDmg = Math.floor((getEffectiveAttackPower() * 0.07 + Math.floor(Math.random() * 4)) * berserkMult);
                effectMsg += "<b style='color:#888'>(단장 직격·최약)</b> ";
            } else {
                baseDmg=Math.floor((getEffectiveAttackPower()+Math.floor(Math.random()*8)) * berserkMult);
            }
            const critInfo=getCritInfo();
            let effectiveCrit=critInfo.effectiveCrit;
            if(critInfo.isBerserkCrit){effectMsg+="<b style='color:#ff4757'>🔥 분노!</b> ";}
            const mercCritMode=isMercenaryCaptainJob()&&player.fieldMerc&&player.fieldMerc.mercHp>0;
            if(mercCritMode){effectiveCrit=getMercEffectiveCritForMercAttack();}
            let relicAtkMult=1;
            if(player.relics&&player.relics.includes('execute')&&enemy.curHp<=enemy.hp*0.35){relicAtkMult*=1.8;effectMsg+="<b style='color:#e74c3c'>💀 집행!</b> ";}
            if(player.relics&&player.relics.includes('berserk_crit')&&player.maxHp&&player.curHp<=player.maxHp*0.35){relicAtkMult*=1.45;effectMsg+="<b style='color:#ff4757'>🔥 격노 심장!</b> ";}
            if(player.shieldEmpowered){relicAtkMult*=1.25;player.shieldEmpowered=false;effectMsg+="<b style='color:#3498db'>🛡️ 수호 증폭!</b> ";}
            if (player && player._arcaneCharge) {
                relicAtkMult *= 1.35;
                player._arcaneCharge = false;
                effectMsg += "<b style='color:#9b59b6'>🔮 연쇄 충전!</b> ";
            }
            let isCrit = false;
            let usedWeak = false;
            if (enemy.weakPoint && player.name === '암살자') {
                usedWeak = true;
                enemy.weakPoint = false;
                isCrit = true;
                baseDmg = Math.floor(baseDmg * (mercCritMode ? getMercEffectiveCritMultForMercAttack() : getEffectiveCritMult()) * 2);
                effectMsg += "<b style='color:#9b59b6'>【약점 노출】</b> <b style='color:#f1c40f'>💥 암살!</b> ";
                triggerCritEffect();
            } else {
                if (player && player.priestNextCrit) {
                    isCrit = true;
                    player.priestNextCrit = false;
                    effectMsg += "<b style='color:#f1c40f'>✨ 신의 가호 치명!</b> ";
                } else {
                    isCrit = Math.random()*100<effectiveCrit;
                }
                if(isCrit){baseDmg=Math.floor(baseDmg*(mercCritMode?getMercEffectiveCritMultForMercAttack():getEffectiveCritMult()));effectMsg+="<b style='color:#f1c40f'>💥 치명타!</b> ";triggerCritEffect();}
            }
            const effDefRaw = (usedWeak ? 0 : enemy.def);
            const effDef = player && player.chosenPriest ? Math.floor(effDefRaw * 0.8) : effDefRaw;
            let finalDmg=Math.max(1,Math.floor(baseDmg*multiplier*relicAtkMult)-effDef);
            enemy.curHp-=finalDmg;
            showDmgFloat(finalDmg,isCrit,false); triggerShakeEffect();
            writeLog(`[명중] ${effectMsg}적에게 ${finalDmg} 피해!`);
            if(mercCritMode&&player.fieldMerc&&safeNum(player.fieldMerc.mercBonusLifesteal,0)>0){
                const mls=Math.min(LIFESTEAL_SOFT_CAP,safeNum(player.fieldMerc.mercBonusLifesteal,0));
                const mh=Math.floor(finalDmg*mls);
                player.fieldMerc.mercHp=Math.min(player.fieldMerc.mercMaxHp,player.fieldMerc.mercHp+mh);
                if(mh>0) writeLog(`[용병 흡혈] 💉 ${mh}`);
            } else if(getLifestealEffective()>0){const h=Math.floor(finalDmg*getLifestealEffective());player.curHp=Math.min(player.maxHp,player.curHp+h);writeLog(`[흡혈] 💉 ${h}`);}
            if (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) {
                const rh = Math.floor(finalDmg * 0.25);
                player.curHp = Math.min(player.maxHp, player.curHp + rh);
                writeLog(`[패시브] 광폭화 흡혈 +${rh}`);
            }
            if (player.summon && player.summon.id === 'fire' && enemy.curHp > 0) {
                // 너프: 불의 정령 추가 피해 하향
                const fireDmg = Math.max(1, Math.floor(getEffectiveAttackPower() * 0.06));
                enemy.curHp -= fireDmg;
                writeLog(`[소환] 🔥 불의 정령 추가 피해 ${fireDmg}!`);
                showDmgFloat(fireDmg, false, false);
                if (enemy.curHp <= 0) { updateUi(); renderActions(); return winBattle(); }
            }

            // 보너스 스킬 처리
            if(player.bonusSkills){
                if(player.bonusSkills.includes('bonus_bleed')&&Math.random()<0.10){const bd=Math.floor(finalDmg*0.8);enemy.curHp-=bd;writeLog(`[스킬] 피의 분노! ${bd} 추가 피해!`);showDmgFloat(bd,false,false);}
                if(isCrit&&player.bonusSkills.includes('bonus_explode')){const ed=Math.floor(getEffectiveAttackPower()*0.5);enemy.curHp-=ed;writeLog(`[스킬] 폭발 일격! ${ed} 추가 피해!`);showDmgFloat(ed,false,false);}
            }
            if(isCrit&&player.relics&&player.relics.includes('chain_cast')&&enemy.curHp>0){
                player._arcaneCharge = true;
                writeLog(`[유물] ⚡ 연쇄 마법진: 다음 공격 피해 증폭 준비!`);
            }
            if(enemy.curHp<=0&&player.relics&&player.relics.includes('kill_heal')){
                const kh=Math.floor(player.maxHp*0.10);
                player.curHp=Math.min(player.maxHp,player.curHp+kh);
                player.critMult = safeNum(player.critMult, 1.8) + 0.03;
                writeLog(`[유물] 💚 혈반지 흡수! 회복 ${kh}, 치명 배율 +3%`);
            }
        } else writeLog(`[빗나감] 공격 실패!`);
        updateUi(); renderActions();
        if(enemy.curHp<=0) return winBattle();

    } else if (type==='궁극기') {
        // 궁극기: 스택 소모, 50% 명중, 초고데미지
        if (player.ultStack < player.ultMaxStack) return writeLog(`[궁극기] 스택이 부족합니다! (${player.ultStack}/${player.ultMaxStack})`);
        player.ultStack = 0;
        const ultSpec = ultSkills[player.unlockedSkill];
        const dmgMult = ultSpec ? ultSpec.dmgMult : 4.0;
        if (Math.random() < 0.5) {
            let berserkMult = (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) ? 1.35 : 1;
            let ultDmg = Math.floor(getEffectiveAttackPower() * dmgMult * berserkMult);
            const critInfo=getCritInfo();
            const isCrit = Math.random()*100 < critInfo.effectiveCrit;
            if (isCrit) { ultDmg = Math.floor(ultDmg*getEffectiveCritMult()); triggerCritEffect(); }
            enemy.curHp -= ultDmg;
            showDmgFloat(ultDmg, isCrit, false); triggerShakeEffect();
            writeLog(`[궁극기] 💥 ${player.unlockedSkill} 炸裂! ${isCrit?'🔥 치명타! ':''}${ultDmg} 피해!`);
            if (getLifestealEffective()>0) { const h=Math.floor(ultDmg*getLifestealEffective()); player.curHp=Math.min(player.maxHp,player.curHp+h); writeLog(`[흡혈] 💉 ${h}`); }
            if (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) {
                const rh = Math.floor(ultDmg * 0.25);
                player.curHp = Math.min(player.maxHp, player.curHp + rh);
                writeLog(`[패시브] 광폭화 흡혈 +${rh}`);
            }
            if (enemy.curHp<=0) { updateUi(); renderActions(); return winBattle(); }
        } else {
            writeLog(`[궁극기] ❌ ${player.unlockedSkill} 발동 실패! (50% 확률)`);
        }
        updateUi(); renderActions();

    } else if (type==='방패방어') {
        const guardRate = 70 + (player._guardBonus||0);
        if(Math.random()*100<guardRate){defendingTurns=2;writeLog(`[성공] 🛡️ 2턴간 피해 60% 감소!`);if(player.relics&&player.relics.includes('shield_empower')){player.shieldEmpowered=true;const rh=Math.floor(player.maxHp*0.08);player.curHp=Math.min(player.maxHp,player.curHp+rh);writeLog(`[유물] ⚡ 철벽의 의지 발동! 회복 +${rh}, 다음 공격 강화`);}}
        else writeLog(`[실패] 방패 방어 실패!`);
    } else if (type==='회피') {
        dodgingTurns=2; writeLog(`[회피기] 💨 2번의 공격을 75% 확률로 회피합니다!`);
    } else if (type==='방어막') {
        const shieldRate = 60 + (player._guardBonus||0);
        if(Math.random()*100<shieldRate){shieldedTurns=2;writeLog(`[성공] ✨ 2턴간 피해 50% 감소!`);}
        else writeLog(`[실패] 방어막 전개 실패!`);
    } else if (type === '기도') {
        if (player.name !== '성직자') return writeLog('[기도] 성직자만 사용할 수 있습니다.');
        if (player.chosenPriest) return writeLog('[기도] 선택받은 성직자는 더 이상 기도할 수 없습니다.');
        player.prayerCountThisTurn = safeNum(player.prayerCountThisTurn, 0);
        if (player.prayerCountThisTurn >= 2) return writeLog('[기도] 이번 턴에는 최대 2번만 기도할 수 있습니다.');
        const gain = (1 + safeNum(player.prayerBonusFlat, 0)) * safeNum(player.divineGainMult, 1);
        addDivinePower(gain);
        player.prayerVulnerableHits = 1;
        player.prayerCountThisTurn += 1;
        writeLog(`[신성력] 🙏 기도 — 신성력 <b>+${gain}</b> (합계 ${formatDivinePowerForDisplay(player.divinePower)} / 최대 200) · 다음 피격 2배`);
        updateUi(); renderActions();
        // 1회차 기도는 무턴, 2회차 기도는 턴 소모
        if (player.prayerCountThisTurn >= 2) {
            enemyTurn();
        }
        return;
    }
    enemyTurn();
};

window.usePotion = () => {
    if (applySummonDarkTurnStart()) return;
    if(player.potions<=0) return writeLog("포션이 없습니다!");
    if(potionUsedThisTurn) return writeLog("이번 턴에 이미 포션을 사용했습니다!");
    player.potions--; potionUsedThisTurn=true;
    if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
        if (player.hasRegenPotion) {
            player.mercRegenTurns = 2;
            player.mercRegenAmount = Math.floor(player.fieldMerc.mercMaxHp * 0.22);
            writeLog(`[포션] 🧪 용병에게 서서히 회복! (2턴간 매 적 턴 전 ${player.mercRegenAmount})`);
        } else {
            const h = Math.floor(player.fieldMerc.mercMaxHp * 0.38);
            player.fieldMerc.mercHp = Math.min(player.fieldMerc.mercMaxHp, player.fieldMerc.mercHp + h);
            writeLog(`[포션] 🧪 용병 체력 ${h} 회복! (${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp})`);
        }
    } else if (isMercenaryCaptainJob()) {
        const h = Math.floor(player.maxHp * 0.12);
        player.curHp = Math.min(player.maxHp, player.curHp + h);
        writeLog(`[포션] 🧪 단장 긴급 체력 ${h} (동료 없음·최소 회복)`);
    } else if(player.hasRegenPotion){regenTurns=2;regenAmount=Math.floor(player.maxHp*0.25);writeLog(`[포션] 🧪 서서히 회복! (2턴간 매 턴 ${regenAmount})`);}
    else{const h=Math.floor(player.maxHp*0.35);player.curHp=Math.min(player.maxHp,player.curHp+h);writeLog(`[포션] 🧪 즉시 체력 ${h} 회복!`);}
    updateUi(); renderActions();
};

let autoRegenCounter = 0;
function enemyTurn() {
    setTimeout(() => {
        if (player && player.name === '성직자') {
            player.prayerCountThisTurn = 0;
        }
        if (isMercenaryCaptainJob()) {
            player.mercBattleTurnCount = safeNum(player.mercBattleTurnCount, 0) + 1;
        }
        if(regenTurns>0){player.curHp=Math.min(player.maxHp,player.curHp+regenAmount);regenTurns--;writeLog(`[재생] 💚 ${regenAmount} 회복! (남은 턴: ${regenTurns})`);}
        if (isMercenaryCaptainJob() && player.mercRegenTurns > 0 && player.fieldMerc && player.fieldMerc.mercHp > 0) {
            player.fieldMerc.mercHp = Math.min(player.fieldMerc.mercMaxHp, player.fieldMerc.mercHp + player.mercRegenAmount);
            player.mercRegenTurns--;
            writeLog(`[용병 재생] 💚 ${player.mercRegenAmount} (남은 턴: ${player.mercRegenTurns})`);
        }
        potionUsedThisTurn=false;

        // 보너스 스킬: 강철 심장 (3턴마다 회복)
        if (player.bonusSkills && player.bonusSkills.includes('bonus_regen')) {
            autoRegenCounter++;
            if (autoRegenCounter % 3 === 0) { const h=Math.floor(player.maxHp*0.05); player.curHp=Math.min(player.maxHp,player.curHp+h); writeLog(`[스킬] 강철 심장 ${h} 회복!`); }
        }

        let hitLanded=true, currentEnemyAtk=enemy.atk;
        if(enemy.isBoss){
            if(enemy.bossCharge){writeLog(`💥 [강공격] 보스의 묵직한 일격!!`);currentEnemyAtk=enemy.atk*2.5;enemy.bossCharge=false;triggerBossWarning(false);}
            else if(enemy.turnCount%4===3){enemy.bossCharge=true;triggerBossWarning(true);writeLog(`⚠️ [위험] 보스가 강공격을 준비합니다!`);enemy.turnCount++;updateUi();return;}
            enemy.turnCount++;
        }
        if(dodgingTurns>0){
            dodgingTurns--;
            if(Math.random()*100<75){
                writeLog(`[회피 성공] 💨 적의 공격을 피했습니다!`); hitLanded=false;
                if(player.relics&&player.relics.includes('dodge_counter')){const cd=Math.max(1,Math.floor(player.atk*0.9)-Math.floor(enemy.def*0.6));enemy.curHp-=cd;writeLog(`[유물] 🗡️ 그림자 반격! ${cd} 피해!`);showDmgFloat(cd,false,false);if(enemy.curHp<=0){setTimeout(()=>winBattle(),100);return;}}
            } else writeLog(`[회피 실패] 피하지 못했습니다!`);
        }
        if(hitLanded){
            if(Math.random()*100<80){
                let dmg=Math.max(1,currentEnemyAtk-getTotalPlayerDefenseForHit());
                if(shieldedTurns>0){dmg=Math.floor(dmg*0.5);shieldedTurns--;writeLog(`[방어막] ✨ 피해 50% 감소! (${dmg} 입음)`);if(player.relics&&player.relics.includes('barrier_reflect')){const rd=Math.floor(dmg*0.45);enemy.curHp-=rd;const heal=Math.floor(player.maxHp*0.05);player.curHp=Math.min(player.maxHp,player.curHp+heal);writeLog(`[유물] 🔮 마력 방벽: 반사 ${rd}, 회복 ${heal}`);if(enemy.curHp<=0){setTimeout(()=>winBattle(),100);}}}
                else if(defendingTurns>0){dmg=Math.floor(dmg*0.4);defendingTurns--;writeLog(`[철벽 방어] 🛡️ 피해 60% 감소! (${dmg} 입음)`);}
                else writeLog(`[피격] 적의 공격! ${dmg} 데미지.`);
                if (player.summon && player.summon.id === 'golem') {
                    // 너프: 골렘 피해 감소 완화
                    dmg = Math.max(1, Math.floor(dmg * 0.90));
                    writeLog(`[소환] 🪨 골렘이 피해를 줄였습니다! (${dmg})`);
                }
                if (player.prayerVulnerableHits && player.prayerVulnerableHits > 0) {
                    dmg = Math.max(1, Math.floor(dmg * 2));
                    player.prayerVulnerableHits = 0;
                    writeLog('[기도 반동] ⚠️ 기도의 반동으로 이번 피격 피해가 2배가 되었습니다.');
                }
                if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
                    player.fieldMerc.mercHp -= dmg;
                    writeLog(`[어그로] 용병이 맞았다! ${dmg} (용병 ${Math.max(0, player.fieldMerc.mercHp)}/${player.fieldMerc.mercMaxHp})`);
                    showDmgFloat(dmg, false, true);
                    if (player.fieldMerc.mercHp <= 0) {
                        if (player.fieldMerc.mercItems && player.fieldMerc.mercItems.length) {
                            player.mercInventory = [...player.fieldMerc.mercItems];
                        }
                        player.fieldMerc = null;
                        player.mercCooldownTurns = 3;
                        player.mercReviveAt90Percent = true;
                        player._mercCooldownSkipOnce = true;
                        writeLog(`💀 용병 전멸! 재소환까지 ${player.mercCooldownTurns}턴 (또는 🪙 긴급 재가동)`);
                    }
                } else {
                    player.curHp-=dmg; showDmgFloat(dmg,false,true);
                }
            } else writeLog(`[럭키] 적의 공격이 빗나갔습니다!`);
        }
        if (isMercenaryCaptainJob() && player.mercCooldownTurns > 0) {
            if (player._mercCooldownSkipOnce) {
                player._mercCooldownSkipOnce = false;
            } else {
                player.mercCooldownTurns--;
            }
        }
        if (isMercenaryCaptainJob() && player.mercCooldownTurns === 0 && !player.fieldMerc && player.mercCompanionKind) {
            player.fieldMerc = buildFieldMercFromTemplate();
            const ratio = player.mercReviveAt90Percent ? 0.9 : 1;
            player.fieldMerc.mercHp = Math.max(1, Math.floor(player.fieldMerc.mercMaxHp * ratio));
            writeLog(
                `[용병] ${ratio < 1 ? '부상에서 복귀' : '전열 재편성'}! HP ${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp} (${ratio < 1 ? '최대의 90%' : '만전'})`
            );
            player.mercReviveAt90Percent = false;
        }
        if (player.name === '암살자' && enemy && Math.random() < 0.15) {
            enemy.weakPoint = true;
            writeLog(`[패시브] 🎯 약점 노출! 다음 공격이 치명적으로 들어갑니다.`);
        }
        player._awaitPlayerTurn = true;
        if(player.curHp<=0) return gameOver();
        updateUi(); renderActions();
    }, 400);
}

function winBattleContinueFrom(clearedFloor) {
    if (floor === 15 && player.name === '소환사' && !localStorage.getItem('summon_altar_done')) {
        setTimeout(() => showContractAltar(), 500);
        return;
    }
    if (checkEventFloor(floor)) {
        setTimeout(() => showEventFloor(), 500);
        return;
    }
    if (clearedFloor > 5 && !enemy.isBoss && Math.random() < 0.15) {
        if (clearedFloor === 10 && !player.evolved) setTimeout(() => checkEvolution(), 300);
        setTimeout(() => showRandomEncounter(), 500);
        return;
    }
    if (clearedFloor === 10 && !player.evolved) {
        if (floor > 1 && floor % 3 === 0) pendingShop = true;
        spawnEnemy();
        setTimeout(() => checkEvolution(), 300);
        return;
    }
    if (floor > 1 && floor % 3 === 0) pendingShop = true;
    spawnEnemy();
}

function showMercEvolutionChoice(onDone) {
    const kind = player.mercCompanionKind;
    const opts = mercCompanionEvolutions[kind];
    if (!opts || !opts.length) {
        if (onDone) onDone();
        return;
    }
    window._mercEvoOnDone = onDone;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:10002;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:26px;max-width:460px;width:92%;text-align:center;">
            <h2 style="color:#f1c40f;margin-bottom:8px;">⚡ 20~30층: 용병 전직 (1회)</h2>
            <p style="color:#aaa;font-size:0.86em;margin-bottom:16px;line-height:1.45;">플레이어 전직보다 약한 수치이지만 상성·딜에 큰 영향을 줍니다. <b>선택 중에는 적 턴이 없습니다.</b></p>
            ${opts.map((e, i) => `
                <div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:14px;margin-bottom:10px;cursor:pointer;text-align:left;" onclick="resolveMercEvolution(${i})" onmouseenter="this.style.borderColor='#f1c40f'" onmouseleave="this.style.borderColor='#555'">
                    <b style="color:#e0e0e0;">${e.name}</b> <span style="color:#888;font-size:0.8em;">→ ${e.pathJob}</span>
                    <p style="color:#888;font-size:0.82em;margin:6px 0 0;">${e.desc}</p>
                </div>`).join('')}
        </div>`;
    window._mercEvoOverlay = overlay;
    document.body.appendChild(overlay);
}

window.resolveMercEvolution = (idx) => {
    const kind = player.mercCompanionKind;
    const opts = mercCompanionEvolutions[kind];
    if (!opts || !opts[idx]) return;
    const ev = opts[idx];
    player.mercEvolution = ev;
    player.mercEvolutionChosen = true;
    const ov = window._mercEvoOverlay;
    if (ov && ov.parentNode) document.body.removeChild(ov);
    window._mercEvoOverlay = null;
    if (player.fieldMerc) {
        const ratio = player.fieldMerc.mercHp / Math.max(1, player.fieldMerc.mercMaxHp);
        player.fieldMerc = buildFieldMercFromTemplate();
        player.fieldMerc.mercHp = Math.max(1, Math.floor(player.fieldMerc.mercMaxHp * ratio));
    }
    writeLog(`[용병 전직] <b>${ev.name}</b> (${ev.pathJob})!`);
    const cb = window._mercEvoOnDone;
    window._mercEvoOnDone = null;
    if (cb) cb();
    updateUi(); renderActions();
};

function processFloorQuestOnVictory() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const FQ = MetaRPG.FLOOR_QUESTS;
    const qdef = FQ[floor];
    if (!qdef) return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot || (slot.questFlags && slot.questFlags[qdef.id])) return;
    if (qdef.needWins) {
        player._questWins = (player._questWins || 0) + 1;
        if (player._questWins >= qdef.needWins) {
            MetaRPG.grantQuestReward(player.metaSlotId, qdef.reward, qdef.id);
            writeLog(`[퀘스트 완료] <b>${qdef.title}</b> — 영구 보상 적용!`);
            player._questWins = 0;
        } else {
            writeLog(`[퀘스트] ${qdef.title} 진행: ${player._questWins}/${qdef.needWins}`);
        }
    } else if (qdef.needBoss && enemy && enemy.isBoss) {
        MetaRPG.grantQuestReward(player.metaSlotId, qdef.reward, qdef.id);
        writeLog(`[퀘스트 완료] <b>${qdef.title}</b> — 보스 격파!`);
    }
}

function winBattle() {
    triggerBossWarning(false);
    let baseGain;
    if(floor<=10){baseGain=enemy.isBoss?50+floor*5:28+Math.floor(Math.random()*8)+floor*2;}
    else{baseGain=enemy.isBoss?65+Math.floor(Math.random()*30)+floor*4:14+Math.floor(Math.random()*12)+Math.floor(floor*1.2);}
    let bonus=0, bonusMsg="";
    const relKey=getAffinityRelKey();
    if(!enemy.isBoss&&relations[relKey]&&relations[relKey].weak===enemy.job){bonus=Math.floor(baseGain*0.3);bonusMsg=` <b style='color:#f1c40f'>(역전 보너스 +${bonus}G!)</b>`;}
    const gain=baseGain+bonus;
    gold+=gain; totalGoldEarned+=gain;
    player.curHp=Math.min(player.maxHp,player.curHp+Math.floor(player.maxHp*0.15));
    writeLog(`[승리] ${gain}G 획득 및 체력 소량 회복.${bonusMsg}`);
    const expGain = 8 + Math.floor(floor * 0.85) + (enemy.isBoss ? 28 : 0);
    if (player.metaSlotId && typeof MetaRPG !== 'undefined') {
        const r = MetaRPG.addExpToSlot(player.metaSlotId, expGain);
        if (r) {
            player.runLevel = r.level;
            player.runExp = r.exp;
            const left = Math.max(0, (r.need || MetaRPG.expToNextLevel(r.level)) - r.exp);
            writeLog(`[EXP] +${expGain} (Lv.${r.level}, 다음 ${left} EXP)`);
        }
    }
    processFloorQuestOnVictory();
    if (floor % 100 === 0 && floor >= 100 && enemy.isBoss) return milestoneCenturyFloor();
    /** 21층 이상 + 상점에서 「훈련 모드」 선택 시에만 승리 후 층 유지, 그 외는 항상 다음 층 */
    if (floor > 20 && player.farmingStay) proceedWinBattleFarmContinue();
    else proceedWinBattleNextFloor();
}

/** 21층 이상 훈련 모드: 승리해도 층 증가 없음 (상점에서만 모드 전환) */
function proceedWinBattleFarmContinue() {
    const clearedFloor = floor;
    checkFloorUnlock(clearedFloor);
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, clearedFloor);
    if (isMercenaryCaptainJob() && clearedFloor >= 19 && clearedFloor <= 30 && !player.mercEvolutionChosen) {
        setTimeout(() => showMercEvolutionChoice(() => winBattleContinueFrom(clearedFloor)), 450);
        return;
    }
    winBattleContinueFrom(clearedFloor);
}

function failActiveQuestIfLeavingFloor() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const FQ = MetaRPG.FLOOR_QUESTS;
    const qdef = FQ[floor];
    if (!qdef || !qdef.needWins) return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot || (slot.questFlags && slot.questFlags[qdef.id])) return;
    const need = qdef.needWins;
    const cur = player._questWins || 0;
    if (cur < need) {
        MetaRPG.applyQuestPenalty(player.metaSlotId, qdef.failPenalty);
        writeLog(`[퀘스트 실패] ${qdef.title} — 층 이탈/미완료 패널티!`);
    }
    player._questWins = 0;
}

function proceedWinBattleNextFloor() {
    failActiveQuestIfLeavingFloor();
    const clearedFloor = floor;
    floor++;
    checkFloorUnlock(clearedFloor);
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, clearedFloor);
    if (isMercenaryCaptainJob() && clearedFloor >= 19 && clearedFloor <= 30 && !player.mercEvolutionChosen) {
        setTimeout(() => showMercEvolutionChoice(() => winBattleContinueFrom(clearedFloor)), 450);
        return;
    }
    winBattleContinueFrom(clearedFloor);
}

function serializeRunState() {
    const shopEl = document.getElementById('shop-area');
    const inShop = shopEl && shopEl.style.display === 'block';
    let enemySnap = null;
    if (!inShop && enemy && safeNum(enemy.curHp, 0) > 0 && safeNum(enemy.hp, 0) > 0) {
        enemySnap = JSON.parse(JSON.stringify(enemy));
    }
    const slot = typeof MetaRPG !== 'undefined' && player && player.metaSlotId ? MetaRPG.getSlotById(player.metaSlotId) : null;
    return {
        floor,
        gold,
        totalGoldEarned,
        rerollCost,
        shopVisitCount,
        lastEnemyJob,
        pendingShop: inShop ? false : pendingShop,
        inShop: !!inShop,
        attackGcdUntil,
        defendingTurns,
        dodgingTurns,
        shieldedTurns,
        regenTurns,
        regenAmount,
        player: JSON.parse(JSON.stringify(player)),
        enemy: enemySnap,
        slotLevel: slot ? slot.level : 1,
        slotExp: slot ? slot.exp : 0,
    };
}

function loadRunFromMetaSnapshot(d) {
    if (!d.player) return alert('저장 데이터가 올바르지 않습니다.');
    if (typeof MetaRPG !== 'undefined' && d.player.metaSlotId) {
        MetaRPG.setActiveSlot(d.player.metaSlotId);
        const m = MetaRPG.loadMeta();
        const sl = m.slots.find((s) => s.id === d.player.metaSlotId);
        if (sl && d.slotLevel != null) {
            sl.level = d.slotLevel;
            sl.exp = d.slotExp != null ? d.slotExp : 0;
            MetaRPG.recalcTechBonus(sl);
            MetaRPG.saveMeta(m);
        }
    }
    floor = d.floor;
    gold = d.gold;
    totalGoldEarned = d.totalGoldEarned;
    rerollCost = d.rerollCost != null ? d.rerollCost : 10;
    shopVisitCount = d.shopVisitCount != null ? d.shopVisitCount : 0;
    lastEnemyJob = d.lastEnemyJob || '';
    pendingShop = !!d.pendingShop;
    const savedInShop = !!d.inShop;
    attackGcdUntil = d.attackGcdUntil || 0;
    defendingTurns = d.defendingTurns || 0;
    dodgingTurns = d.dodgingTurns || 0;
    shieldedTurns = d.shieldedTurns || 0;
    regenTurns = d.regenTurns || 0;
    regenAmount = d.regenAmount || 0;
    player = d.player;
    if (player && player.divinePower == null) player.divinePower = 0;
    if (player && player.divineGainMult == null) player.divineGainMult = 1;
    if (player && player.prayerBonusFlat == null) player.prayerBonusFlat = 0;
    if (player && player.priestBlessed == null) player.priestBlessed = false;
    if (player && player.chosenPriest == null) player.chosenPriest = false;
    if (player && player.priestNextCrit == null) player.priestNextCrit = false;
    if (player && player.prayerVulnerableHits == null) player.prayerVulnerableHits = 0;
    if (player && player.prayerCountThisTurn == null) player.prayerCountThisTurn = 0;
    if (player && player.name === '성직자') recalcPlayerDivineGainMult();
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, d.floor || 1);
    if (player && player.shopRarityBoost == null) player.shopRarityBoost = 0;
    enemy = d.enemy;
    if (enemy && (safeNum(enemy.curHp, 0) <= 0 || safeNum(enemy.hp, 0) <= 0)) {
        enemy = null;
    }
    document.getElementById('start-area').style.display = 'none';
    document.getElementById('log-battle').innerHTML = '';
    enterBattleLayout();
    if (savedInShop) {
        document.getElementById('battle-area').style.display = 'none';
        document.getElementById('shop-area').style.display = 'block';
        pendingShop = false;
        updateUi();
        renderShopItems();
        writeLog('[저장] 상점에서 이어갑니다.');
        if (player && player.metaSlotId && typeof MetaRPG !== 'undefined') MetaRPG.markRunCheckpoint(player.metaSlotId);
        return;
    }
    document.getElementById('shop-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    if (!enemy) {
        if (pendingShop) {
            document.getElementById('battle-area').style.display = 'none';
            document.getElementById('shop-area').style.display = 'block';
            rerollCost = rerollCost || 10;
            updateUi();
            renderShopItems();
        } else {
            pendingShop = false;
            spawnEnemy();
        }
    } else {
        updateUi();
        renderActions();
    }
    writeLog('[저장] 런을 불러왔습니다.');
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined') MetaRPG.markRunCheckpoint(player.metaSlotId);
}

/** 저장 후 메인 허브 (보존 골드·스냅샷·체크포인트 갱신) */
window.saveAndExitToMain = function saveAndExitToMain() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') {
        writeLog('[저장] 진행 중인 런이 없습니다.');
        return;
    }
    try {
        const payload = serializeRunState();
        MetaRPG.setRunSnapshot(player.metaSlotId, payload);
        MetaRPG.markRunCheckpoint(player.metaSlotId);
        writeLog('[저장] 런을 저장했습니다. 허브에서 이어하기로 복구할 수 있습니다.');
        returnToHubFromRun(true);
    } catch (e) {
        writeLog('[저장] 실패: ' + (e && e.message));
    }
};

/** 저장 없이 메인 — 메타 EXP/레벨 되돌림, 스냅샷 삭제, 보존 골드 미지급 */
window.exitToMainWithoutSave = function exitToMainWithoutSave() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') {
        writeLog('[허브] 진행 중인 런이 없습니다.');
        return;
    }
    if (MetaRPG.getRunSnapshot(player.metaSlotId)) {
        if (!confirm('저장하지 않고 나가면 마지막 「저장 후 나가기」 이후의 레벨·인벤 진행이 사라집니다. 계속할까요?')) return;
    } else if (!confirm('저장하지 않고 나가면 이번 런에서 오른 메타 레벨·EXP가 초기화됩니다. 계속할까요?')) return;
    MetaRPG.revertRunToCheckpoint(player.metaSlotId);
    MetaRPG.clearRunSnapshot(player.metaSlotId);
    returnToHubFromRun(false);
};

function returnToHubFromRun(savedExit) {
    exitBattleLayout();
    if (savedExit) {
        const sg = Math.floor(totalGoldEarned * 0.12);
        if (typeof MetaRPG !== 'undefined') MetaRPG.addSavedGold(sg);
        writeLog(`[허브] 런 종료 — 보존 골드 +${sg}G`);
    } else {
        writeLog('[허브] 저장 없이 종료 — 런 보존 골드 없음, 메타 레벨은 체크포인트로 복구됨');
    }
    player = null;
    enemy = null;
    document.getElementById('battle-area').style.display = 'none';
    showPreGameScreen();
}

window.exportFullSave = function exportFullSave() {
    const keys = [
        'dungeon_meta_v7',
        'dungeon_meta_v7_f0',
        'dungeon_meta_v7_f1',
        'dungeon_meta_v7_f2',
        'dungeon_meta_v7_active_file',
        'dungeon_meta_v7_file_migrated_v2',
        'perma_stats',
        'perma_buy_count',
        'saved_gold',
        'item_collection_v5',
        'unlocked_floors_global',
        'unlocked_floors_워리어',
        'unlocked_floors_헌터',
        'unlocked_floors_마법사',
    ];
    const out = { v: 7, gameBuild: GAME_BUILD, exportedAt: new Date().toISOString() };
    keys.forEach((k) => {
        out[k] = localStorage.getItem(k);
    });
    const blob = new Blob([JSON.stringify(out, null, 0)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dungeon-save-${GAME_BUILD}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    localStorage.setItem('user_exported_save_v7', '1');
    alert('✅ 전체 저장 파일을 내려받았습니다. 안전한 곳에 보관하세요.');
};

window.importFullSave = function importFullSave(inputEl) {
    const f = inputEl.files && inputEl.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        try {
            const data = JSON.parse(r.result);
            if (!data || typeof data !== 'object') throw new Error('형식 오류');
            Object.keys(data).forEach((k) => {
                if (k === 'v' || k === 'gameBuild' || k === 'exportedAt') return;
                if (typeof data[k] === 'string' || data[k] === null) {
                    if (data[k] === null) localStorage.removeItem(k);
                    else localStorage.setItem(k, data[k]);
                }
            });
            alert('✅ 불러오기 완료. 화면을 새로고침합니다.');
            location.reload();
        } catch (e) {
            alert('불러오기 실패: ' + (e && e.message));
        }
    };
    r.readAsText(f);
    inputEl.value = '';
};

window.openBaseCampTech = function openBaseCampTech() {
    if (typeof MetaRPG === 'undefined' || !player || !player.metaSlotId) return;
    const shopEl = document.getElementById('shop-area');
    const inShop = shopEl && shopEl.style.display === 'block';
    if (!inShop) {
        writeLog('[베이스캠프] 상점 화면에서만 입장할 수 있습니다.');
        return;
    }
    if (!MetaRPG.isBaseCampFloor(floor)) {
        writeLog('[베이스캠프] 30층 이상에서만 열립니다.');
        return;
    }
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(MetaRPG.loadMeta());
    const nodes = MetaRPG.getTechNodesForSlot(slot).slice().sort((a, b) => (a.line || '').localeCompare(b.line || '') || (a.id || '').localeCompare(b.id || ''));
    const runGold = safeNum(gold, 0);
    const bought = new Set(slot.techPurchased || []);
    const ov = document.createElement('div');
    ov.id = 'base-camp-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10055;overflow:auto;padding:20px;';
    const rows = nodes
        .map((n) => {
            const has = bought.has(n.id);
            const can = !has && MetaRPG.canPurchaseNode(slot, n.id) && runGold >= n.cost;
            const st = has ? '✅ 보유' : can ? '구매 가능' : '🔒 선행 필요';
            const fx = formatTechEffect(n.effect);
            return `<div style="background:#111;border:1px solid #444;border-radius:8px;padding:10px;margin-bottom:8px;text-align:left;">
            <b style="color:#f1c40f;">${n.name}</b> <span style="color:#888;font-size:0.8em;">${st}</span>
            <div style="color:#ccc;font-size:0.82em;margin:6px 0;line-height:1.4;">효과: ${fx}</div>
            <div style="color:#f1c40f;font-size:0.8em;margin-bottom:6px;">비용: <b>${n.cost}G</b> (런 골드)</div>
            ${!has && MetaRPG.canPurchaseNode(slot, n.id) ? `<button type="button" onclick="buyTechNode('${n.id}')" style="background:#f1c40f;color:#111;border:none;padding:6px 12px;border-radius:6px;font-weight:700;cursor:pointer;" ${runGold < n.cost ? 'disabled' : ''}>구매</button>` : ''}
          </div>`;
        })
        .join('');
    const permaBlock = `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #444;">
      <h3 style="color:#f1c40f;margin:0 0 10px;font-size:1em;">⚔️ 영구 강화 (이 캐릭터 전용 · 무한 · 런 골드)</h3>
      <p style="color:#888;font-size:0.78em;margin-bottom:10px;">체력·공격·방어·치명(소량)·치명 배율. 슬롯마다 별도입니다.</p>
      ${buildPermanentShopHtml()}
    </div>`;
    ov.innerHTML = `<div style="max-width:520px;margin:0 auto;background:#1a1a2e;border:2px solid #9b59b6;border-radius:12px;padding:20px;">
      <h2 style="color:#9b59b6;margin:0 0 8px;">🏕️ 베이스캠프 (${floor}층)</h2>
      <p style="color:#888;font-size:0.85em;">런 골드: <b style="color:#f1c40f;">${runGold}G</b> · 테크: <b>직업 내 노드 자유 조합</b></p>
      <h3 style="color:#e0e0e0;margin:14px 0 8px;font-size:0.95em;">📊 테크 트리</h3>
      <div style="max-height:min(360px,50vh);overflow:auto;margin:12px 0;">${rows}</div>
      ${permaBlock}
      <button type="button" onclick="document.getElementById('base-camp-overlay').remove()" style="width:100%;margin-top:16px;padding:10px;background:#444;color:#fff;border:none;border-radius:8px;cursor:pointer;">닫기</button>
    </div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => {
        ov.scrollTop = window.__baseCampScrollTop || 0;
    });
};

window.buyTechNode = (nodeId) => {
    if (!player || !player.metaSlotId) return;
    const n = MetaRPG.getTechNodeById(nodeId);
    if (!n) return writeLog('[테크] 노드를 찾을 수 없습니다.');
    const cost = n.cost || 0;
    if (gold < cost) return writeLog('[테크] 런 골드 부족');
    const r = MetaRPG.commitTechPurchase(player.metaSlotId, nodeId);
    if (!r.ok) return writeLog(`[테크] ${r.msg}`);
    const elKeep = document.getElementById('base-camp-overlay');
    if (elKeep) window.__baseCampScrollTop = elKeep.scrollTop;
    gold -= cost;
    writeLog(`[테크] ${r.msg} 구매! (-${cost}G)`);
    const el = document.getElementById('base-camp-overlay');
    if (el) el.remove();
    openBaseCampTech();
    updateUi();
};

function milestoneCenturyFloor() {
    saveRank();
    triggerBossWarning(false);
    const cf = floor;
    window.__centuryMilestoneFloor = cf;
    const sg = Math.floor(totalGoldEarned * 0.15);
    if (typeof MetaRPG !== 'undefined') MetaRPG.addSavedGold(sg);
    exitBattleLayout();
    document.getElementById('battle-area').style.display = 'none';
    const old = document.getElementById('century-milestone-overlay');
    if (old) old.remove();
    const ov = document.createElement('div');
    ov.id = 'century-milestone-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:10090;display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML = `<div style="max-width:460px;width:100%;background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:24px;text-align:center;">
      <h2 style="color:#f1c40f;margin:0 0 8px;">🏆 ${cf}층 이정표</h2>
      <p style="color:#ccc;margin:0 0 6px;">무한 던전은 계속됩니다.</p>
      <p style="color:#2ed573;margin:0 0 14px;">보존 +${sg}G</p>
      <button type="button" onclick="continuePastCentury()" style="background:#9b59b6;color:#fff;padding:12px 20px;margin:8px;border:none;border-radius:8px;cursor:pointer;font-weight:700;">♾️ 계속 (${cf + 1}층)</button>
      <button type="button" onclick="returnToHubFromCenturyMilestone()" style="background:#f1c40f;color:#111;padding:12px 20px;margin:8px;border:none;border-radius:8px;cursor:pointer;font-weight:700;">🏠 허브로</button>
    </div>`;
    document.body.appendChild(ov);
}

window.continuePastCentury = () => {
    const cf = window.__centuryMilestoneFloor || 100;
    floor = cf + 1;
    const ov = document.getElementById('century-milestone-overlay');
    if (ov) ov.remove();
    document.getElementById('battle-area').style.display = 'block';
    enterBattleLayout();
    writeLog(`♾️ ${floor}층부터 진행`);
    spawnEnemy();
    updateUi();
};
window.returnToHubFromCenturyMilestone = () => {
    const ov = document.getElementById('century-milestone-overlay');
    if (ov) ov.remove();
    player = null;
    enemy = null;
    document.getElementById('battle-area').style.display = 'none';
    showPreGameScreen();
};

window.reincarnateFromCenturyMilestone = function reincarnateFromCenturyMilestone() {
    alert('환생은 허브에서만 가능하며, 최고 500층 도달 후 진행할 수 있습니다.');
};

function openShop() {
    shopVisitCount++;
    document.getElementById('battle-area').style.display='none';
    document.getElementById('shop-area').style.display='block';
    rerollCost=10; updateUi(); renderShopItems();
}

/** 상점 하단: 21층 이상만 「등반 / 이 층 훈련」 분기 */
function renderShopLeaveButtons() {
    const wrap = document.getElementById('shop-leave-actions');
    if (!wrap) return;
    if (floor > 20) {
        const train = player && player.farmingStay;
        wrap.innerHTML = `<p style="color:#888;font-size:0.82em;margin:0 0 10px;line-height:1.45;">21층 이상: 던전으로 돌아갈 때 <b>등반</b>(승리마다 다음 층) 또는 <b>이 층 훈련</b>(승리해도 층 유지)을 고릅니다.</p>
      <button type="button" onclick="leaveShopContinueAscent()" style="background:#2ed573;color:#111;margin-bottom:8px;width:100%;padding:12px;font-weight:700;border:none;border-radius:8px;cursor:pointer;">⬆️ 등반 계속 (승리 시 다음 층)</button>
      <button type="button" onclick="leaveShopTrainHere()" style="background:#3498db;color:#fff;margin-bottom:8px;width:100%;padding:12px;font-weight:700;border:none;border-radius:8px;cursor:pointer;">🔁 이 층에 머물며 훈련</button>
      <p style="color:${train ? '#2ed573' : '#aaa'};font-size:0.78em;margin:0;">${train ? '현재: 훈련 모드 (동일 층 반복)' : '현재: 등반 모드'}</p>`;
    } else {
        wrap.innerHTML = `<button type="button" onclick="nextFloor()" style="background:#444;color:#fff;width:100%;padding:12px;border:none;border-radius:8px;cursor:pointer;font-weight:700;">던전으로 돌아가기</button>`;
    }
}

window.leaveShopContinueAscent = function leaveShopContinueAscent() {
    if (player) player.farmingStay = false;
    writeLog('[상점] 등반 모드 — 승리 시 자동으로 다음 층으로 이동합니다.');
    nextFloor();
};

window.leaveShopTrainHere = function leaveShopTrainHere() {
    if (player) player.farmingStay = true;
    writeLog('[상점] 훈련 모드 — 이 층에서 반복 전투합니다. 등반을 재개하려면 다음 상점에서 「등반 계속」을 누르세요.');
    nextFloor();
};

window.nextFloor = () => {
    document.getElementById('shop-area').style.display='none';
    document.getElementById('battle-area').style.display='block';
    spawnEnemy();
};

function getUnlockedPoolItems() {
    const bj=player.baseJob, result=[];
    getUnlockedFloors(null).forEach(f=>{if(f%10===0&&floorUnlocks[f])result.push(floorUnlocks[f]);});
    getUnlockedFloors(bj).forEach(f=>{
        if(f%5===0&&f%10!==0){
            if(bj==='워리어'&&floorUnlocks[f])result.push(floorUnlocks[f]);
            else if(bj==='헌터'&&floorUnlocksHunter[f])result.push(floorUnlocksHunter[f]);
            else if(bj==='마법사'&&floorUnlocksWizard[f])result.push(floorUnlocksWizard[f]);
        }
    });
    return result;
}

function getItemsByRarity() {
    const c = getShopRarityChances();
    const rand=Math.random()*100;
    const pool = getNonMercEquipmentPool();
    if(rand<c.legendary) return pool.filter(i=>i.rarity==='legendary');
    if(rand<c.legendary+c.epic) return pool.filter(i=>i.rarity==='epic');
    if(rand<c.legendary+c.epic+c.rare) return pool.filter(i=>i.rarity==='rare');
    return pool.filter(i=>i.rarity==='common');
}

function getShopRarityChances() {
    const baseLegendary = Math.min(15, 2 + Math.floor(shopVisitCount / 5));
    const baseEpic = Math.min(35, 10 + Math.floor(shopVisitCount / 3));
    const baseRare = Math.min(50, 30 + Math.floor(shopVisitCount / 4));
    const boostLv = Math.max(0, Math.min(8, safeNum(player && player.shopRarityBoost, 0)));
    let legendary = baseLegendary + boostLv * 2;
    let epic = baseEpic + boostLv * 3;
    let rare = baseRare + boostLv * 3;
    let common = Math.max(0, 100 - legendary - epic - rare);
    if (common === 0 && legendary + epic + rare > 100) {
        const overflow = legendary + epic + rare - 100;
        rare = Math.max(5, rare - overflow);
    }
    common = Math.max(0, 100 - legendary - epic - rare);
    return { legendary, epic, rare, common };
}

function applyShopRarityTuning(baseItem) {
    if (!baseItem) return baseItem;
    if (baseItem.type === 'relic' || baseItem.type === 'potion' || baseItem.type === 'merc_shop_direct' || baseItem.type === 'merc_shop_fund') {
        return { ...baseItem };
    }
    const tuned = { ...baseItem };
    const rk = tuned.rarity || 'common';
    const bonusByRarity = {
        common: { atk: 18, hp: 24, def: 12, acc: 10, critBonus: 8, critMult: 0.25, minPrice: 55 },
        rare: { atk: 34, hp: 48, def: 24, acc: 18, critBonus: 14, critMult: 0.45, minPrice: 95 },
        epic: { atk: 56, hp: 78, def: 38, acc: 28, critBonus: 22, critMult: 0.72, minPrice: 165 },
        legendary: { atk: 86, hp: 122, def: 58, acc: 40, critBonus: 32, critMult: 1.05, minPrice: 255 },
    };
    const b = bonusByRarity[rk] || bonusByRarity.common;
    tuned.name = formatShopItemName(tuned.name);
    if (tuned.type === 'atk') tuned.value = safeNum(tuned.value, 0) + b.atk;
    if (tuned.type === 'hp') tuned.value = safeNum(tuned.value, 0) + b.hp;
    if (tuned.type === 'acc') tuned.value = safeNum(tuned.value, 0) + b.acc;
    tuned.def = safeNum(tuned.def, 0) + b.def;
    tuned.critBonus = safeNum(tuned.critBonus, 0) + b.critBonus;
    tuned.critMult = safeNum(tuned.critMult, 0) + b.critMult;
    // 희귀도 역전 방지: 같은 카테고리에서 상/하위 등급이 뒤집히지 않게 안전 구간으로 보정
    const range = {
        common: { atk: [22, 58], hp: [56, 145], def: [6, 26], acc: [12, 34], crit: [1, 12], cm: [0.10, 0.55], ls: [0.01, 0.10] },
        rare: { atk: [60, 108], hp: [150, 248], def: [27, 50], acc: [35, 58], crit: [13, 22], cm: [0.56, 0.95], ls: [0.11, 0.18] },
        epic: { atk: [110, 178], hp: [250, 380], def: [51, 78], acc: [59, 84], crit: [23, 34], cm: [0.96, 1.35], ls: [0.19, 0.28] },
        legendary: { atk: [180, 270], hp: [385, 560], def: [79, 118], acc: [85, 120], crit: [35, 50], cm: [1.36, 2.10], ls: [0.29, 0.40] },
    };
    const rr = range[rk] || range.common;
    const clamp = (x, mn, mx) => Math.min(mx, Math.max(mn, x));
    if (tuned.type === 'atk') tuned.value = clamp(safeNum(tuned.value, 0), rr.atk[0], rr.atk[1]);
    if (tuned.type === 'hp') tuned.value = clamp(safeNum(tuned.value, 0), rr.hp[0], rr.hp[1]);
    if (tuned.type === 'acc') tuned.value = clamp(safeNum(tuned.value, 0), rr.acc[0], rr.acc[1]);
    tuned.def = clamp(safeNum(tuned.def, 0), rr.def[0], rr.def[1]);
    tuned.critBonus = clamp(safeNum(tuned.critBonus, 0), rr.crit[0], rr.crit[1]);
    tuned.critMult = clamp(safeNum(tuned.critMult, 0), rr.cm[0], rr.cm[1]);
    if (tuned.lifesteal != null) tuned.lifesteal = clamp(safeNum(tuned.lifesteal, 0), rr.ls[0], rr.ls[1]);
    if (tuned.type === 'atk') tuned.value = Math.max(1, safeNum(tuned.value, 0));
    if (tuned.def != null) tuned.def = Math.max(1, safeNum(tuned.def, 0));
    if (tuned.critBonus != null) tuned.critBonus = Math.max(1, safeNum(tuned.critBonus, 0));
    if (tuned.critMult != null) tuned.critMult = Math.max(0.01, safeNum(tuned.critMult, 0));
    if (tuned.lifesteal != null) tuned.lifesteal = Math.max(0.01, safeNum(tuned.lifesteal, 0));
    tuned.price = Math.max(b.minPrice, safeNum(tuned.price, 0));
    tuned.desc = formatShopItemDesc(tuned.desc);
    if (baseItem.divinityGainBonus != null) tuned.divinityGainBonus = baseItem.divinityGainBonus;
    if (baseItem.prayerBonus != null) tuned.prayerBonus = baseItem.prayerBonus;
    return tuned;
}

function getShopRarityBoostPrice() {
    const lv = Math.max(0, Math.min(8, safeNum(player && player.shopRarityBoost, 0)));
    return 120 + lv * 90;
}

function renderShopItems(keepCurrentStock) {
    const list=document.getElementById('shop-list');
    list.innerHTML='';
    const c = getShopRarityChances();
    const cb=document.createElement('div');
    cb.style.cssText='font-size:0.78em;margin-bottom:10px;display:flex;gap:10px;flex-wrap:wrap;padding:8px;background:#111;border-radius:6px;';
    cb.innerHTML=`<span style="color:#888;">📊 등급 확률 (${shopVisitCount}회)</span><span style="color:#e74c3c;">전설 ${c.legendary}%</span><span style="color:#a55eea;">고급 ${c.epic}%</span><span style="color:#1e90ff;">희귀 ${c.rare}%</span><span style="color:#888;">일반 ${c.common}%</span>`;
    list.appendChild(cb);
    if (player) {
        const lv = Math.max(0, Math.min(8, safeNum(player.shopRarityBoost, 0)));
        const b = document.createElement('div');
        b.style.cssText = 'margin-bottom:12px;background:#151522;border:1px solid #4b5cff;border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;';
        if (lv >= 8) {
            b.innerHTML = `<span style="color:#9fb0ff;font-size:0.85em;">✨ 고등급 확률 강화 Lv.MAX (전설/고급/희귀 증가 완료)</span><button type="button" disabled style="background:#555;color:#bbb;border:none;padding:8px 12px;border-radius:6px;font-weight:700;">최대치</button>`;
        } else {
            const pc = getShopRarityBoostPrice();
            b.innerHTML = `<span style="color:#9fb0ff;font-size:0.85em;">✨ 고등급 확률 강화 Lv.${lv} → Lv.${lv + 1}</span><button type="button" onclick="buyShopRarityBoost()" style="background:#4b5cff;color:#fff;border:none;padding:8px 12px;border-radius:6px;font-weight:700;cursor:pointer;">강화 (${pc}G)</button>`;
        }
        list.appendChild(b);
    }
    if (typeof MetaRPG !== 'undefined' && player && MetaRPG.isBaseCampFloor(floor)) {
        const campRow = document.createElement('div');
        campRow.style.cssText = 'margin-bottom:12px;text-align:center;';
        campRow.innerHTML = `<button type="button" onclick="openBaseCampTech()" style="width:100%;padding:12px;background:#9b59b6;color:#fff;border:1px solid #8e44ad;border-radius:8px;font-weight:700;cursor:pointer;">🏕️ 베이스캠프 (연구·영구 강화)</button>`;
        list.appendChild(campRow);
    }
    if (!keepCurrentStock) {
        currentPotionOffer = { name: "치유 포션", type: "potion", value: 80, price: 40, rarity: "common", desc: "최대 체력의 35%를 즉시 회복합니다." };
        currentShopItems = [];
    }
    const unlockedItems=getUnlockedPoolItems(), picked=[];
    let tries=0;
    if (!keepCurrentStock && isMercenaryCaptainJob()) {
        const pd = 95 + floor * 12;
        const pf = 48 + floor * 6;
        currentShopItems.push(
            {
                name: '직접 장비 구매 (직거래)',
                type: 'merc_shop_direct',
                price: pd,
                rarity: 'epic',
                desc: '비용이 큼. 사기 당할 확률 30%. 성공 시 동료·공용 장비 1개 (이미 보유한 이름 제외, 등급 가중 랜덤).',
            },
            {
                name: '용병에게 자금 지원',
                type: 'merc_shop_fund',
                price: pf,
                rarity: 'rare',
                desc: '직거래보다 저렴. 사기 50%. 성공 시 고등급 확률↑ (이름 중복 없음).',
            }
        );
    } else if (!keepCurrentStock) {
        if (floor >= 20 && Math.random() < 0.25 && player.relics) {
            const ar = relicPool.filter((r) => {
                if (player.relics.includes(r.effect)) return false;
                if (!r.onlyFor) return true;
                return r.onlyFor.some((j) => j === player.name || j === player.baseJob);
            });
            if (ar.length > 0) {
                const relic = ar[Math.floor(Math.random() * ar.length)];
                picked.push({ ...relic, type: 'relic', value: 0 });
            }
        }
        if (unlockedItems.length > 0) {
            const ru = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
            if (!player.items.some((i) => i.name === ru.name) && !picked.some((p) => p.name === ru.name)) picked.push(applyShopRarityTuning(ru));
        }
        while (picked.length < 4 && tries < 70) {
            tries++;
            const pool = getItemsByRarity();
            if (!pool.length) continue;
            const item = pool[Math.floor(Math.random() * pool.length)];
            if (picked.some((i) => i.name === item.name)) continue;
            if (item.onlyFor) {
                const allowed = Array.isArray(item.onlyFor) ? item.onlyFor : [item.onlyFor];
                if (!allowed.includes(player.name) && !allowed.includes(player.baseJob)) continue;
            }
            picked.push(applyShopRarityTuning(item));
        }
        currentShopItems.push(...picked);
    }
    if (currentPotionOffer) {
        const pb = document.createElement('div');
        pb.style.cssText = 'background:#1c2d1c;border:1px solid #2ecc71;border-radius:10px;padding:12px;margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;';
        pb.innerHTML = `<div><div style="color:#2ecc71;font-weight:700;">🧪 포션 전용 구매</div><div style="color:#9dd8b4;font-size:0.82em;">${currentPotionOffer.desc}</div></div><button type="button" onclick="buyPotionOffer()" style="background:#2ecc71;color:#111;padding:8px 14px;border:none;border-radius:6px;font-weight:700;cursor:pointer;">구매 (${currentPotionOffer.price}G)</button>`;
        list.appendChild(pb);
    }
    const grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px;';
    currentShopItems.forEach((it,idx)=>{
        const isRelic=it.type==='relic', d=document.createElement('div');
        const ownedRelic = isRelic && player.relics && player.relics.includes(it.effect);
        const owned = ownedRelic || (!isRelic && it.type !== 'potion' && it.type !== 'merc_shop_direct' && it.type !== 'merc_shop_fund' && player.items.some((x)=>x.name===it.name));
        const full = !isRelic && getEquipSlotKind(it) && !canEquipMoreOfItem(it);
        const slotLine = getEquipSlotLineHtml(it);
        const synHtml = buildShopSynergyHintsHtml(it);
        let bc='#444',bac='#888',bb='#2a2a2a',bt='COMMON';
        if(isRelic){bc='#f1c40f';bac='#f1c40f';bb='#2a2a0a';bt='RELIC';}
        else if(it.rarity==='relic'){bc='#d35400';bac='#f39c12';bb='#2a1a0a';bt='RELIC(용병)';}
        else if(it.rarity==='legendary'){bc='#e74c3c';bac='#e74c3c';bb='#2d1a1a';bt='LEGENDARY';}
        else if(it.rarity==='epic'){bc='#a55eea';bac='#a55eea';bb='#1e1a2d';bt='EPIC';}
        else if(it.rarity==='rare'){bc='#1e90ff';bac='#1e90ff';bb='#1a1e2d';bt='RARE';}
        let nc=isRelic?'#f1c40f':it.rarity==='legendary'?'#e74c3c':it.rarity==='epic'?'#a55eea':it.rarity==='rare'?'#1e90ff':'#e0e0e0';
        let ti=isRelic?'✨':'🎒';
        if(!isRelic){if(it.type==='atk')ti='⚔️';else if(it.type==='hp')ti='🛡️';else if(it.type==='acc')ti='🎯';else if(it.type==='potion')ti='🧪';else if(it.type==='merc')ti='⚔️';else if(it.type==='merc_shop_direct')ti='💼';else if(it.type==='merc_shop_fund')ti='🤝';if(it.lifesteal)ti='🩸';if(it.regenPotion)ti='💚';}
        const iu=getUnlockedPoolItems().some(u=>u.name===it.name);
        const pref = isPreferredItem(it.name);
        d.style.cssText=`background:#1a1a1a;border:1px solid ${bc};border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;transition:transform 0.15s;cursor:default;${pref ? 'box-shadow:0 0 0 2px #f1c40f, 0 0 18px rgba(241,196,15,0.35);' : ''}`;
        d.onmouseenter=()=>d.style.transform='translateY(-2px)'; d.onmouseleave=()=>d.style.transform='translateY(0)';
        d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;"><span style="background:${bb};color:${bac};border:1px solid ${bc};border-radius:4px;font-size:0.7em;font-weight:700;padding:2px 7px;letter-spacing:1px;">${iu?'🔓 ':''}${bt}${pref ? ' ★' : ''}</span><span style="font-size:1.3em;">${ti}</span></div><div style="color:${nc};font-weight:700;font-size:1em;line-height:1.3;">${formatShopItemName(it.name)}${pref ? ' <span style="color:#f1c40f;font-size:0.85em;">(선호)</span>' : ''}</div>${slotLine}<div style="color:#888;font-size:0.78em;line-height:1.5;flex:1;">${formatShopItemDesc(it.desc)}${synHtml}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;"><span style="color:#f1c40f;font-weight:700;font-size:1em;">💰 ${it.price}G</span><button onclick="buyItem(event,${idx})" ${(owned || full) ? 'disabled' : ''} style="background:${full ? '#7f2b2b' : owned ? '#555' : '#f1c40f'};color:${full ? '#ffd7d7' : owned ? '#bbb' : '#111'};padding:6px 14px;font-size:0.85em;font-weight:700;margin:0;border-radius:6px;${(owned || full) ? 'cursor:not-allowed;' : ''}">${full ? '공간 없음' : owned ? '보유' : '구매'}</button></div>`;
        grid.appendChild(d);
    });
    list.appendChild(grid);
    const rb=document.createElement('button'); rb.className='reroll-btn'; rb.innerText=`🔄 다시 돌리기 (${rerollCost}G)`; rb.onclick=rerollShop; list.appendChild(rb);
    renderShopLeaveButtons();
}

window.rerollShop = () => {
    if(gold<rerollCost) return writeLog(`[상점] 골드가 부족합니다.`);
    gold-=rerollCost; rerollCost+=10; writeLog(`[상점] 리롤 완료!`); updateUi(); renderShopItems();
};

window.buyPotionOffer = () => {
    if (!player || !currentPotionOffer) return;
    if (gold < currentPotionOffer.price) return writeLog('골드 부족!');
    gold -= currentPotionOffer.price;
    player.potions = safeNum(player.potions, 0) + 1;
    writeLog('[상점] 포션 구매 완료.');
    updateUi();
};

window.buyShopRarityBoost = () => {
    if (!player) return;
    const lv = Math.max(0, Math.min(8, safeNum(player.shopRarityBoost, 0)));
    if (lv >= 8) return writeLog('[상점] 고등급 확률 강화가 최대입니다.');
    const price = getShopRarityBoostPrice();
    if (gold < price) return writeLog('[상점] 골드가 부족합니다.');
    gold -= price;
    player.shopRarityBoost = lv + 1;
    writeLog(`[상점] ✨ 고등급 확률 강화 Lv.${lv + 1}!`);
    updateUi();
    // 버그 수정: 상점 강화 구매 시 현재 진열은 유지(자동 리롤 금지)
    renderShopItems(true);
};

function saveCollection(itemName) {
    let c=JSON.parse(localStorage.getItem('item_collection_v5')||'[]');
    if(!c.includes(itemName)){c.push(itemName);localStorage.setItem('item_collection_v5',JSON.stringify(c));}
}
function loadCollection() {}

// ===================== 선호(즐겨찾기) 아이템 =====================
const PREF_ITEMS_KEY = 'preferred_items_v1';
function loadPreferredItems() {
    try {
        const raw = localStorage.getItem(PREF_ITEMS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function savePreferredItems(arr) {
    try {
        localStorage.setItem(PREF_ITEMS_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function isPreferredItem(name) {
    const n = String(name || '');
    if (!n) return false;
    return loadPreferredItems().includes(n);
}
function escapeJsSingleQuoteString(s) {
    // onclick="fn('<here>')" 형태용 이스케이프
    return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
/** HTML attribute (title 등)용 */
function escapeHtmlAttr(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r?\n/g, ' ');
}
function formatSynergyBonusHuman(b) {
    if (!b) return '';
    const parts = [];
    if (b.atk) parts.push(`공격+${b.atk}`);
    if (b.hp) parts.push(`체력+${b.hp}`);
    if (b.def) parts.push(`방어+${b.def}`);
    if (b.acc) parts.push(`명중+${b.acc}%`);
    if (b.crit) parts.push(`치명+${b.crit}%`);
    if (b.critMult) parts.push(`치명 배율+${Math.round(b.critMult * 100)}%`);
    return parts.join(', ');
}
window.togglePreferredItem = function togglePreferredItem(name) {
    const n = String(name || '');
    if (!n) return;
    const cur = loadPreferredItems();
    const idx = cur.indexOf(n);
    if (idx >= 0) cur.splice(idx, 1);
    else cur.push(n);
    savePreferredItems(cur);
    try { toggleCollection(true); } catch (e) { /* ignore */ }
    try { renderShopItems(); } catch (e) { /* ignore */ }
};

function getEquipSlotKind(it) {
    if (!it) return null;
    if (it.type === 'atk') return 'weapon';
    if (it.type === 'hp') return 'armor';
    if (it.type === 'acc') return 'ring';
    return null;
}
function getEquipSlotLimit(kind) {
    if (kind === 'weapon') return 2;
    if (kind === 'armor') return 2;
    if (kind === 'ring') return 3;
    return Infinity;
}
function getEquipSlotLabel(kind) {
    if (kind === 'weapon') return '무기';
    if (kind === 'armor') return '갑옷';
    if (kind === 'ring') return '반지';
    return '장비';
}
function getEquipSlotLineHtml(it) {
    const k = getEquipSlotKind(it);
    if (!k) return '';
    const lim = getEquipSlotLimit(k);
    const label = getEquipSlotLabel(k);
    const icon = k === 'weapon' ? '⚔️' : k === 'armor' ? '🛡️' : '💍';
    return `<div style="color:#9fb0ff;font-size:0.76em;margin-top:4px;line-height:1.35;">${icon} <b>장착 칸</b>: ${label} (동시 최대 ${lim}개)</div>`;
}
function buildSynergyStatusHtml() {
    if (!player || !player._syn || !Array.isArray(player._syn.progress) || !player._syn.progress.length) return '';
    const chips = player._syn.progress
        .map((p) => {
            const on = !!p.active;
            const bonusTxt = formatSynergyBonusHuman(p.bonus || {});
            const tip = on
                ? `발동 · ${p.effectDesc || ''}${bonusTxt ? ` (${bonusTxt})` : ''}`
                : `진행 ${p.cur}/${p.need} · 발동 시: ${p.effectDesc || bonusTxt || '시너지 효과'}`;
            const title = escapeHtmlAttr(tip);
            return `<span title="${title}" style="display:inline-block;margin:2px;padding:2px 7px;border-radius:999px;border:1px solid ${
                on ? '#2ed573' : '#444'
            };background:${on ? '#123020' : '#111'};color:${on ? '#2ed573' : '#999'};font-size:0.72em;font-weight:700;cursor:help;">${p.name} ${p.cur}/${p.need}</span>`;
        })
        .join('');
    return `<div style="margin-top:3px;">${chips}</div>`;
}
function getEquippedCountByKind(kind) {
    return (player.items || []).filter((x) => getEquipSlotKind(x) === kind).length;
}
function canEquipMoreOfItem(it) {
    const k = getEquipSlotKind(it);
    if (!k) return true;
    return getEquippedCountByKind(k) < getEquipSlotLimit(k);
}
function getItemSynergyHints(it) {
    if (!it || typeof synergyRules === 'undefined' || !Array.isArray(synergyRules)) return [];
    const tags = new Set();
    const tg = it.tags || it.tagList;
    if (Array.isArray(tg)) tg.forEach((t) => tags.add(String(t)));
    if (it.rarity) tags.add('rarity_' + String(it.rarity));
    if (it.type) tags.add('type_' + String(it.type));
    const curTagCounts = {};
    for (const x of player.items || []) {
        if (!x) continue;
        const xt = x.tags || x.tagList;
        if (Array.isArray(xt)) xt.forEach((t) => { const k = String(t); curTagCounts[k] = (curTagCounts[k] || 0) + 1; });
        if (x.rarity) {
            const k = 'rarity_' + String(x.rarity);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
        if (x.type) {
            const k = 'type_' + String(x.type);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
    }
    const alreadyOwned = (player.items || []).some((x) => x && x.name === it.name);
    const hints = [];
    for (const rule of synergyRules) {
        if (!rule) continue;
        if (rule.fromTag && tags.has(String(rule.fromTag)) && rule.needCount) {
            const cur = curTagCounts[rule.fromTag] || 0;
            const next = cur + (alreadyOwned ? 0 : 1);
            hints.push(`${rule.name} ${Math.min(next, rule.needCount)}/${rule.needCount}`);
        } else if (Array.isArray(rule.needTags) && rule.needTags.some((t) => tags.has(String(t)))) {
            hints.push(rule.name || '시너지');
        }
    }
    return hints;
}
/** 상점 카드: 시너지 진행 문구에 마우스 올리면 조건·효과 표시 */
function buildShopSynergyHintsHtml(it) {
    if (!it || typeof synergyRules === 'undefined' || !Array.isArray(synergyRules)) return '';
    const tags = new Set();
    const tg = it.tags || it.tagList;
    if (Array.isArray(tg)) tg.forEach((t) => tags.add(String(t)));
    if (it.rarity) tags.add('rarity_' + String(it.rarity));
    if (it.type) tags.add('type_' + String(it.type));
    const curTagCounts = {};
    for (const x of player.items || []) {
        if (!x) continue;
        const xt = x.tags || x.tagList;
        if (Array.isArray(xt)) xt.forEach((t) => { const k = String(t); curTagCounts[k] = (curTagCounts[k] || 0) + 1; });
        if (x.rarity) {
            const k = 'rarity_' + String(x.rarity);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
        if (x.type) {
            const k = 'type_' + String(x.type);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
    }
    const alreadyOwned = (player.items || []).some((x) => x && x.name === it.name);
    const parts = [];
    for (const rule of synergyRules) {
        if (!rule) continue;
        if (rule.fromTag && tags.has(String(rule.fromTag)) && rule.needCount) {
            const cur = curTagCounts[rule.fromTag] || 0;
            const next = cur + (alreadyOwned ? 0 : 1);
            const label = `${rule.name} ${Math.min(next, rule.needCount)}/${rule.needCount}`;
            const bonusTxt = formatSynergyBonusHuman(rule.bonus || {});
            const willActive = next >= rule.needCount;
            const tip = willActive
                ? `이 구매 시 발동: ${rule.effectDesc || ''}${bonusTxt ? ` (${bonusTxt})` : ''}`
                : `진행 ${Math.min(next, rule.needCount)}/${rule.needCount} · 발동 시: ${rule.effectDesc || bonusTxt || ''}`;
            parts.push(
                `<span title="${escapeHtmlAttr(tip)}" style="cursor:help;border-bottom:1px dotted #2ed573;">${label}</span>`
            );
        } else if (Array.isArray(rule.needTags) && rule.needTags.some((t) => tags.has(String(t)))) {
            const tip = `${rule.effectDesc || rule.name || '시너지'}${formatSynergyBonusHuman(rule.bonus || {}) ? ` (${formatSynergyBonusHuman(rule.bonus || {})})` : ''}`;
            parts.push(`<span title="${escapeHtmlAttr(tip)}" style="cursor:help;border-bottom:1px dotted #2ed573;">${rule.name || '시너지'}</span>`);
        }
    }
    if (!parts.length) return '';
    return `<div style="margin-top:5px;color:#2ed573;">시너지: ${parts.join(' · ')}</div>`;
}
function ensureOwnedItemUid(it) {
    if (!it) return;
    if (!it._uid) it._uid = 'it_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function removeOwnedItemEffects(it) {
    if (!it || !player) return;
    if (it.type === 'atk') player.atk = Math.max(1, safeNum(player.atk, 1) - safeNum(it.value, 0));
    if (it.type === 'hp') {
        player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - safeNum(it.value, 0));
        player.curHp = Math.min(player.maxHp, safeNum(player.curHp, 0));
    }
    if (it.type === 'acc') player.acc = Math.max(0, safeNum(player.acc, 0) - safeNum(it.value, 0));
    if (it.def) player.extraDef = Math.max(0, safeNum(player.extraDef, 0) - safeNum(it.def, 0));
    if (it.acc) player.acc = Math.max(0, safeNum(player.acc, 0) - safeNum(it.acc, 0));
    if (it.lifesteal) player.lifesteal = Math.max(0, safeNum(player.lifesteal, 0) - safeNum(it.lifesteal, 0));
    if (it.critBonus) player.crit = Math.max(1, safeNum(player.crit, 1) - safeNum(it.critBonus, 0));
    if (it.critMult) player.critMult = Math.max(1.8, safeNum(player.critMult, 1.8) - safeNum(it.critMult, 0));
    if (it.penalty && it.penalty[player.name]) player.acc += safeNum(it.penalty[player.name], 0);
    const hasRegen = (player.items || []).some((x) => x !== it && x && x.regenPotion);
    player.hasRegenPotion = !!hasRegen;
    recalcPlayerDivineGainMult();
}
window.sellItemByUid = function sellItemByUid(uid) {
    if (!player || !player.items || !uid) return;
    const idx = player.items.findIndex((x) => x && x._uid === uid);
    if (idx < 0) return;
    const it = player.items[idx];
    const buyPrice = Math.max(0, safeNum(it._buyPrice != null ? it._buyPrice : it.price, 0));
    const refund = Math.floor(buyPrice * 0.5);
    removeOwnedItemEffects(it);
    player.items.splice(idx, 1);
    gold = safeNum(gold, 0) + refund;
    writeLog(`[판매] ${it.name} 판매 (+${refund}G / 구매가 ${buyPrice}G)`);
    updateUi();
    renderActions();
    const sh = document.getElementById('shop-area');
    if (sh && sh.style.display === 'block') renderShopItems(true);
};

window.buyItem = (event, idx) => {
    const it=currentShopItems[idx];
    if(gold<it.price) return writeLog("골드 부족!");
    gold-=it.price;
    if (it.type === 'merc_shop_direct' || it.type === 'merc_shop_fund') {
        const scamRate = it.type === 'merc_shop_direct' ? 0.3 : 0.5;
        const mode = it.type === 'merc_shop_direct' ? 'shop_direct' : 'shop_fund';
        if (Math.random() < scamRate) {
            writeLog(
                `[상점] 💸 <b>${it.name}</b> — 사기당했다! 장비 없음. (사기 확률 ${Math.round(scamRate * 100)}%)`
            );
        } else {
            const gain = pickMercItemForPlayer(mode);
            if (!gain) {
                const refund = Math.floor(it.price * 0.4);
                gold += refund;
                writeLog(`[상점] 📭 물건을 구할 수 없었다… ${refund}G 환급`);
            } else {
                applyMercItemGainFromPool({ ...gain });
            }
        }
        updateUi();
        renderActions();
        return;
    }
    if(it.type==='relic'){
        if (player.relics && player.relics.includes(it.effect)) {
            gold += it.price;
            writeLog(`[상점] 이미 보유한 유물입니다: ${it.name}`);
            renderShopItems(true);
            return;
        }
        player.relics.push(it.effect); saveCollection(it.name);
        writeLog(`[유물 획득] ✨ <b style='color:#f1c40f'>${it.name}</b> 장착!`);
        showUnlockPopup(`✨ 유물 획득!`,`<b style="color:#f1c40f;">${it.name}</b><br>${it.desc}`,'#f1c40f');
    } else if(it.type==='potion'){
        player.potions++; writeLog(`[상점] 포션 구매 완료.`);
    } else {
        const slotKind = getEquipSlotKind(it);
        if (slotKind) {
            const lim = getEquipSlotLimit(slotKind);
            const cur = getEquippedCountByKind(slotKind);
            if (cur >= lim) {
                gold += it.price;
                alert(`[장착 제한] ${getEquipSlotLabel(slotKind)} 칸이 꽉 찼습니다. (최대 ${lim}개)`);
                return writeLog(`[장착 제한] ${getEquipSlotLabel(slotKind)}는 최대 ${lim}개까지 장착할 수 있습니다.`);
            }
        }
        if(!player.items.some(i=>i.name===it.name)){
            ensureOwnedItemUid(it);
            it._buyPrice = safeNum(it.price, 0);
            player.items.push(it); saveCollection(it.name);
            if(it.type==='atk')player.atk+=it.value;
            if(it.type==='hp'){player.maxHp+=it.value;player.curHp+=it.value;}
            if(it.type==='acc')player.acc+=it.value;
            if(it.def)player.extraDef+=it.def;
            if(it.acc)player.acc+=it.acc;
            if(it.lifesteal)player.lifesteal=(player.lifesteal||0)+it.lifesteal;
            if(it.regenPotion)player.hasRegenPotion=true;
            if(it.critBonus)player.crit=(player.crit||1)+it.critBonus;
            if(it.critMult)player.critMult=(player.critMult||1.8)+it.critMult;
            if(it.penalty&&it.penalty[player.name]){player.acc-=it.penalty[player.name];writeLog(`[패널티] 명중률 -${it.penalty[player.name]}% 적용`);}
            recalcPlayerDivineGainMult();
            writeLog(`[상점] ${it.name} 장착 완료!`);
            renderShopItems(true); // 실시간 버튼 상태: 구매 -> 보유
        } else { writeLog(`이미 보유한 장비입니다!`); gold+=it.price; }
    }
    updateUi(); renderActions();
};

async function saveRank() {
    if(!currentUser) return;
    try {
        const bj=player.baseJob||player.name, ue=currentUser.email.split('@')[0];
        const ex=await db.collection("global_ranks").where("email","==",ue).where("baseJob","==",bj).get();
        let ss=true; ex.forEach(doc=>{if(doc.data().floor>=floor)ss=false;});
        if(!ss) return;
        const batch=db.batch(); ex.forEach(doc=>batch.delete(doc.ref)); await batch.commit();
        await db.collection("global_ranks").add({email:ue,job:player.name,baseJob:bj,floor:floor,killer:enemy?enemy.name:"알 수 없음",date:new Date().toLocaleDateString(),timestamp:firebase.firestore.FieldValue.serverTimestamp()});
    } catch(e){console.error("랭킹 저장 에러:",e);}
}

async function loadRank() {
    try {
        if(!currentUser){document.getElementById('rank-list').innerHTML='<span style="color:#555;">로그인 후 확인 가능합니다.</span>';return;}
        const jobs=['워리어','헌터','마법사','용병단장']; let html='';
        for(const job of jobs){
            const snap=await db.collection("global_ranks").where("baseJob","==",job).orderBy("floor","desc").limit(3).get();
            const jc=job==='헌터'?'#2ed573':job==='마법사'?'#1e90ff':job==='용병단장'?'#e67e22':'#ff4757';
            html+=`<div style="margin-bottom:16px;"><b style="color:${jc};font-size:0.95em;border-bottom:1px solid #333;display:block;padding-bottom:4px;margin-bottom:8px;">⚔️ ${job} 랭킹</b>`;
            if(snap.empty){html+=`<div style="color:#555;font-size:0.85em;">기록 없음</div>`;}
            else{let rank=1;snap.forEach(doc=>{const r=doc.data(),medal=rank===1?'🥇':rank===2?'🥈':'🥉',jd=r.job!==r.baseJob?`${r.baseJob}→${r.job}`:r.job;html+=`<div style="margin-bottom:6px;font-size:0.85em;">${medal} <b style="color:#e0e0e0;">${r.floor}층</b> <span style="color:#888;">(${jd})</span> <span style="color:#aaa;">👤${r.email}</span><br><span style="color:#ff4757;font-size:0.8em;margin-left:18px;">💀 ${r.killer}</span></div>`;rank++;});}
            html+=`</div>`;
        }
        document.getElementById('rank-list').innerHTML=html;
    } catch(e){document.getElementById('rank-list').innerHTML='랭킹 서버 연결 실패';}
}

window.togglePatchNotes=(show)=>{document.getElementById('patch-modal').style.display=show?'flex':'none';};
window.toggleRank=(show)=>{document.getElementById('rank-modal').style.display=show?'flex':'none';if(show)loadRank();};
window.toggleInv=(show)=>{document.getElementById('inv-modal').style.display=show?'flex':'none';};

window.mercGoldSkipCooldown = () => {
    if (!player || !isMercenaryCaptainJob()) return;
    const cost = getMercGoldSkipCost();
    if (gold < cost) return writeLog('[자본주의] 골드가 부족합니다.');
    gold -= cost;
    player.mercCooldownTurns = 0;
    player._mercCooldownSkipOnce = false;
    if (player.mercCompanionKind) {
        player.mercReviveAt90Percent = false;
        player.fieldMerc = buildFieldMercFromTemplate();
        player.fieldMerc.mercHp = player.fieldMerc.mercMaxHp;
        writeLog(`[자본주의] 🪙 ${cost}G로 동료를 만전 상태로 재전개! (${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp})`);
    } else {
        writeLog(`[자본주의] 🪙 ${cost}G로 쿨타임을 초기화했습니다!`);
    }
    updateUi(); renderActions();
};

window.useMercenarySlot = () => {
    writeLog('[고용] 고용 아이템 시스템은 폐지되었습니다. 시작 시 동료 선택·쿨 종료·🪙 긴급 재가동을 이용하세요.');
};
function codexItemMatchesTab(it, tab) {
    if (!it || !it.name) return false;
    if (tab === '용병') {
        const keys = new Set(getMercEquipmentJobKeys());
        if (it.type === 'merc') return false;
        if (!it.onlyFor || !Array.isArray(it.onlyFor) || it.onlyFor.length === 0) return true;
        return it.onlyFor.some((j) => keys.has(j));
    }
    if (tab === '성직자') {
        if (it.type === 'merc') return false;
        const of = it.onlyFor;
        return Array.isArray(of) && of.includes('성직자');
    }
    if (it.type === 'merc') return false;
    const of = it.onlyFor;
    if (tab === '공용') return !of || (Array.isArray(of) && of.length === 0);
    if (!of || !Array.isArray(of)) return false;
    const W = ['워리어', '나이트', '버서커'];
    const H = ['헌터', '궁수', '암살자'];
    const M = ['마법사', '위저드', '소환사'];
    if (tab === '워리어') return of.some((j) => W.includes(j));
    if (tab === '헌터') return of.some((j) => H.includes(j));
    if (tab === '마법사') return of.some((j) => M.includes(j));
    return false;
}

window.setCodexTab = (t) => {
    window._codexTab = t;
    toggleCollection(true);
};
window.setCodexStatFilter = (f) => {
    window._codexStatFilter = f || 'all';
    toggleCollection(true);
};
function getCodexStatMetric(it, filter) {
    if (!it) return 0;
    if (filter === 'atk') return safeNum(it.type === 'atk' ? it.value : 0, 0);
    if (filter === 'def') return safeNum(it.def, 0);
    if (filter === 'crit') return safeNum(it.critBonus, 0);
    if (filter === 'critMult') return safeNum(it.critMult, 0);
    if (filter === 'acc') return safeNum(it.type === 'acc' ? it.value : it.acc, 0);
    return 0;
}

window.toggleCollection = (show) => {
    if (show) {
        if (!window._codexTab) window._codexTab = '공용';
        if (!window._codexStatFilter) window._codexStatFilter = 'all';
        const mercMode = player && player.baseJob === '용병단장';
        if (mercMode && window._codexTab === '공용') window._codexTab = '용병';
        const tab = window._codexTab;
        const statFilter = window._codexStatFilter;
        const tabs = mercMode ? ['용병', '워리어', '헌터', '마법사'] : ['공용', '워리어', '헌터', '마법사', '성직자'];
        const collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
        const allItems = [
            ...equipmentPool,
            ...relicPool,
            ...Object.values(floorUnlocks).filter((i) => i && i.name),
            ...Object.values(floorUnlocksHunter).filter((i) => i && i.name),
            ...Object.values(floorUnlocksWizard).filter((i) => i && i.name),
        ];
        const seen = new Set();
        const uniqueItems = allItems.filter((i) => {
            if (!i || !i.name || seen.has(i.name)) return false;
            seen.add(i.name);
            return true;
        });
        let tabItems = uniqueItems.filter((i) => codexItemMatchesTab(i, tab));
        if (statFilter !== 'all') {
            tabItems = tabItems
                .filter((i) => getCodexStatMetric(i, statFilter) > 0)
                .sort((a, b) => getCodexStatMetric(b, statFilter) - getCodexStatMetric(a, statFilter));
        }
        const rarityLabels = {
            relic: { label: 'RELIC', color: '#f39c12', bg: '#2a1a0a' },
            legendary: { label: 'LEGENDARY', color: '#e74c3c', bg: '#2d1a1a' },
            epic: { label: 'EPIC', color: '#a55eea', bg: '#1e1a2d' },
            rare: { label: 'RARE', color: '#1e90ff', bg: '#1a1e2d' },
            common: { label: 'COMMON', color: '#888', bg: '#2a2a2a' },
        };
        const rarityOrder = { relic: 0, legendary: 1, epic: 2, rare: 3, common: 4 };
        const relicItems = tabItems.filter((i) => relicPool.some((r) => r.name === i.name));
        const equipItems = tabItems.filter((i) => !relicPool.some((r) => r.name === i.name));
        const tabBar = tabs
            .map(
                (t) =>
                    `<button type="button" onclick="setCodexTab('${t}')" style="margin:2px;padding:6px 10px;font-size:0.75em;font-weight:700;border-radius:6px;border:1px solid ${t === tab ? '#f1c40f' : '#444'};background:${t === tab ? '#2a2a1a' : '#111'};color:${t === tab ? '#f1c40f' : '#888'};cursor:pointer;">${t}</button>`
            )
            .join('');
        const statFilters = [
            { id: 'all', label: '전체' },
            { id: 'atk', label: '공격력 높은 순' },
            { id: 'def', label: '방어력 높은 순' },
            { id: 'crit', label: '치명 확률 높은 순' },
            { id: 'critMult', label: '치명 배율 높은 순' },
            { id: 'acc', label: '명중률 높은 순' },
        ];
        const statBar = statFilters
            .map(
                (x) =>
                    `<button type="button" onclick="setCodexStatFilter('${x.id}')" style="margin:2px;padding:6px 10px;font-size:0.72em;font-weight:700;border-radius:6px;border:1px solid ${x.id === statFilter ? '#2ed573' : '#444'};background:${x.id === statFilter ? '#122a1a' : '#111'};color:${x.id === statFilter ? '#2ed573' : '#888'};cursor:pointer;">${x.label}</button>`
            )
            .join('');
        let html = '';
        html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;align-items:center;">${tabBar}</div>`;
        html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;align-items:center;">${statBar}</div>`;
        html += `<p style="color:#888;font-size:0.85em;margin-bottom:15px;">탭: <b style="color:#f1c40f;">${tab}</b> · 해금: <b style="color:#f1c40f;">${collection.length}</b> / ${uniqueItems.length}</p>`;
        if (tab === '용병') {
            html += `<p style="color:#b87333;font-size:0.78em;margin:-8px 0 12px;line-height:1.45;">📜 <b>동료 장비 풀</b> — 전투 <b>💰 용병 지원</b>·상점 <b>직거래/자금 지원</b>으로 얻는 장비입니다. (이름 중복 없이 랜덤)</p>`;
        }
        if (tab === '성직자') {
            html += `<p style="color:#9b59b6;font-size:0.78em;margin:-8px 0 12px;line-height:1.45;">📜 <b>성직자 전용 장비</b> — 일부 장비에 <b>신성력 획득량 증가</b> 옵션이 붙어 있습니다.</p>`;
        }
        if (relicItems.length > 0) {
            html += `<div style="margin-bottom:16px;border-bottom:1px solid #333;padding-bottom:12px;"><div style="background:#2a2a0a;color:#f1c40f;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:8px;letter-spacing:1px;">✨ RELIC (유물)</div>`;
            relicItems.forEach((it) => {
                if (collection.includes(it.name)) {
                    const pref = isPreferredItem(it.name);
                    html += `<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #f1c40f;display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><div><div style="color:#f1c40f;font-weight:700;font-size:0.9em;">✅ ✨ ${formatShopItemName(it.name)}${pref ? ' <span style="color:#f1c40f;">★</span>' : ''}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${formatShopItemDesc(it.desc)}</div></div><button type="button" onclick="togglePreferredItem('${escapeJsSingleQuoteString(it.name)}')" style="background:${pref ? '#f1c40f' : '#111'};color:${pref ? '#111' : '#f1c40f'};border:1px solid #f1c40f;border-radius:8px;padding:6px 10px;font-weight:900;cursor:pointer;font-size:0.78em;">★</button></div>`;
                }
                else html += `<div style="padding:8px 10px;background:#0a0a0a;border-radius:6px;margin-bottom:4px;border-left:3px solid #333;"><div style="color:#444;font-weight:700;font-size:0.9em;">🔒 ???</div></div>`;
            });
            html += `</div>`;
        }
        const groups = { relic: [], legendary: [], epic: [], rare: [], common: [] };
        equipItems.sort((a, b) => (rarityOrder[a.rarity] ?? 9) - (rarityOrder[b.rarity] ?? 9));
        equipItems.forEach((it) => {
            const owned = collection.includes(it.name);
            const rk = it.rarity === 'relic' ? 'relic' : it.rarity || 'common';
            (groups[rk] || groups.common).push({ ...it, owned });
        });
        Object.entries(groups).forEach(([rarity, items]) => {
            if (!items.length) return;
            const { label, color, bg } = rarityLabels[rarity] || rarityLabels.common;
            html += `<div style="margin-bottom:12px;"><div style="background:${bg};color:${color};font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;letter-spacing:1px;">${label}</div>`;
            items.forEach((it) => {
                if (it.owned) {
                    const pref = isPreferredItem(it.name);
                    html += `<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid ${color};display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><div><div style="color:${color};font-weight:700;font-size:0.9em;">✅ ${formatShopItemName(it.name)}${pref ? ' <span style="color:#f1c40f;">★</span>' : ''}</div>${getEquipSlotLineHtml(it)}<div style="color:#666;font-size:0.78em;margin-top:3px;">${formatShopItemDesc(it.desc)}</div></div><button type="button" onclick="togglePreferredItem('${escapeJsSingleQuoteString(it.name)}')" style="background:${pref ? '#f1c40f' : '#111'};color:${pref ? '#111' : '#f1c40f'};border:1px solid #f1c40f;border-radius:8px;padding:6px 10px;font-weight:900;cursor:pointer;font-size:0.78em;">★</button></div>`;
                }
                else html += `<div style="padding:8px 10px;background:#0a0a0a;border-radius:6px;margin-bottom:4px;border-left:3px solid #333;"><div style="color:#444;font-weight:700;font-size:0.9em;">🔒 ???</div></div>`;
            });
            html += `</div>`;
        });
        document.getElementById('collection-list').innerHTML = html;
    }
    document.getElementById('collection-modal').style.display = show ? 'flex' : 'none';
};

window.onclick=function(event){
    if(event.target===document.getElementById('patch-modal'))togglePatchNotes(false);
    if(event.target===document.getElementById('rank-modal'))toggleRank(false);
    if(event.target===document.getElementById('inv-modal'))toggleInv(false);
    if(event.target===document.getElementById('collection-modal'))toggleCollection(false);
    if(event.target===document.getElementById('evolution-modal'))toggleEvolutionMap(false);
};

function updateUi() {
    if (!player) return;
    /** 상점만 열린 상태(적 스냅샷 없음)에서도 골드·층·체력 갱신 */
    if (!enemy) {
        const shopEl = document.getElementById('shop-area');
        if (shopEl && shopEl.style.display === 'block') {
            const pMax = Math.max(1, safeNum(player.maxHp, 1));
            const pCur = Math.max(0, safeNum(player.curHp, 0));
            const g = safeNum(gold, 0);
            const pots = Math.max(0, safeNum(player.potions, 0));
            const sh = document.getElementById('shop-hp-t'),
                sgt = document.getElementById('shop-gold-t');
            if (sh) sh.innerText = `${pCur}/${pMax}`;
            if (sgt) sgt.innerText = String(g);
            ['floor-t', 'gold-t', 'potion-t'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            ['floor-t-battle', 'gold-t-battle', 'potion-t-battle'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
        }
        return;
    }
    if (typeof MetaRPG !== 'undefined') {
        player._syn = MetaRPG.computeSynergyBonuses(player);
    } else {
        player._syn = { atk: 0, hp: 0, def: 0, acc: 0, crit: 0, desc: [] };
    }
    const pMax = Math.max(1, safeNum(player.maxHp, 1) + safeNum(player._syn.hp, 0));
    const pCur = Math.max(0, safeNum(player.curHp, 0));
    const eHp = Math.max(1, safeNum(enemy.hp, 1));
    const eCur = Math.max(0, safeNum(enemy.curHp, 0));
    const g = safeNum(gold, 0);
    const pots = Math.max(0, safeNum(player.potions, 0));
    const mercUi = isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0;
    const fm = player.fieldMerc;
    const summLine = document.getElementById('p-summon-line');
    const critMultEl = document.getElementById('p-crit-mult-val');
    if (mercUi) {
        const mMax = Math.max(1, safeNum(fm.mercMaxHp, 1));
        const mCur = Math.max(0, safeNum(fm.mercHp, 0));
        document.getElementById('p-name').innerHTML = `<span style="color:#2ed573;">🛡️ 전열</span> ${fm.sourceName}`;
        document.getElementById('p-hp').style.width = `${Math.max(0, (mCur / mMax) * 100)}%`;
        document.getElementById('p-hp-t').innerText = `어그로 ${mCur} / ${mMax}`;
        if (summLine) {
            summLine.innerHTML = `<span style="color:#e67e22;">🎖️ 후열 · 지휘</span> <b>${player.name}</b> <span style="color:#888;">| HP ${pCur}/${pMax} · 악성 ${Math.round(getMercGachaBadChance() * 100)}% · 지원 ${getMercGachaCost()}G</span>`;
        }
        document.getElementById('p-atk-val').textContent = String(getMercEffectiveAttackPower());
        document.getElementById('p-def-val').textContent = String(safeNum(fm.mercBonusDef, 0));
        document.getElementById('p-acc-val').textContent = `${Math.min(95, BASE_HIT_ACCURACY + safeNum(player.acc, 0) + getMercBonusAcc())}%`;
        document.getElementById('p-crit-val').textContent = `${Math.round(getMercEffectiveCritForMercAttack())}%`;
        const ecmM = getMercEffectiveCritMultForMercAttack();
        if (critMultEl) critMultEl.textContent = `${Math.ceil(Number.isFinite(ecmM) ? ecmM : 1.8)}x`;
        const lsMain = document.getElementById('p-lifesteal-val');
        const lsNote = document.getElementById('p-lifesteal-note');
        if (lsMain) lsMain.textContent = `${Math.round(safeNum(fm.mercBonusLifesteal, 0) * 100)}%`;
        if (lsNote) lsNote.textContent = '용병 장비 흡혈 (전열)';
    } else {
        document.getElementById('p-name').innerText = player.name;
        document.getElementById('p-hp').style.width = `${Math.max(0, (pCur / pMax) * 100)}%`;
        document.getElementById('p-hp-t').innerText = `${pCur} / ${pMax}`;
        if (summLine) {
            const synHint = player._syn && player._syn.desc && player._syn.desc.length ? ` · <span style="color:#f1c40f;">시너지: ${player._syn.desc.join(', ')}</span>` : '';
            const synStatus = buildSynergyStatusHtml();
            const lvTxt = player.runLevel ? ` · Lv.${player.runLevel}` : '';
            if (isMercenaryCaptainJob()) {
                summLine.innerHTML = `<span style="color:#e67e22;">🎖️ 지휘관 ${player.name}</span> <span style="color:#888;">| HP ${pCur}/${pMax}${lvTxt} · 전열 없음${player.mercCooldownTurns > 0 ? ` · 재가동 ${player.mercCooldownTurns}T` : ''}${synHint}</span>${synStatus}`;
            } else if (player.summon && player.summon.name) {
                if (player.name === '소환사' && floor < 100) {
                    summLine.innerHTML = `<span style="color:#a55eea;">소환:</span> ${player.summon.name} <span style="color:#ff4757;font-weight:800;">(잠김: 100층)</span>${synHint}${synStatus}`;
                } else {
                    summLine.innerHTML = `<span style="color:#a55eea;">소환:</span> ${player.summon.name}${synHint}${synStatus}`;
                }
            }
            else if (player.name === '성직자') {
                const dp = formatDivinePowerForDisplay(safeNum(player.divinePower, 0));
                const gm = safeNum(player.divineGainMult, 1);
                const st = player.chosenPriest ? '👑 선택받은 성직자' : player.priestBlessed ? '✨ 신의 가호' : '·';
                summLine.innerHTML = `<span style="color:#888;font-size:0.85em;"><b>${player.name}</b>${lvTxt} · <span style="color:#f1c40f;">✨ 신성력 ${dp}/200</span> · 획득×${gm.toFixed(2)} · ${st}${synHint}</span>${synStatus}`;
            } else summLine.innerHTML = `<span style="color:#888;font-size:0.85em;"><b>${player.name}</b>${lvTxt}${synHint}</span>${synStatus}`;
        }
        document.getElementById('p-atk-val').textContent = String(getEffectiveAttackPower());
        document.getElementById('p-def-val').textContent = String(getTotalPlayerDefenseForHit());
        document.getElementById('p-acc-val').textContent = `${Math.min(95, BASE_HIT_ACCURACY + safeNum(player.acc, 0) + safeNum(player._syn.acc, 0))}%`;
        const critInfo = getCritInfo();
        document.getElementById('p-crit-val').textContent = `${Math.round(safeNum(critInfo.effectiveCrit, 0))}%`;
        const ecm = getEffectiveCritMult();
        if (critMultEl) critMultEl.textContent = `${Math.ceil(Number.isFinite(ecm) ? ecm : 1.8)}x`;
        const lsOv = getLifestealOverflowAtk();
        const lsMain = document.getElementById('p-lifesteal-val');
        const lsNote = document.getElementById('p-lifesteal-note');
        if (lsMain) lsMain.textContent = `${Math.round(safeNum(getLifestealEffective(), 0) * 100)}%`;
        if (lsNote) lsNote.textContent = lsOv > 0 ? `흡혈 초과분 → 공격력 +${lsOv}` : '';
    }
    const ultLine = document.getElementById('p-ult-stack-line');
    if (ultLine) {
        if (player.unlockedSkill && floor >= 20) ultLine.innerHTML = `<span style="color:#9b59b6;">궁극기</span> [${safeNum(player.ultStack, 0)}/${Math.max(1, safeNum(player.ultMaxStack, 1))}]`;
        else ultLine.innerHTML = '';
    }
    document.getElementById('e-name').innerText=enemy.name;
    document.getElementById('e-hp').style.width=`${Math.max(0,(eCur/eHp)*100)}%`;
    document.getElementById('e-hp-t').innerText=`${eCur} / ${eHp}`;
    document.getElementById('e-atk-val').innerText=String(safeNum(enemy.atk, 0));
    document.getElementById('e-def-val').innerText=String(safeNum(enemy.def, 0));
    ['floor-t-battle','gold-t-battle','potion-t-battle'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.innerText=[floor,g,pots][i];});
    ['floor-t','gold-t','potion-t'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.innerText=[floor,g,pots][i];});
    const sh=document.getElementById('shop-hp-t'), sg=document.getElementById('shop-gold-t');
    if(sh)sh.innerText=`${pCur}/${pMax}`;
    if(sg)sg.innerText=String(g);
    const invList=document.getElementById('inv-list');
    if(invList){
        const hasMercGear=isMercenaryCaptainJob()&&player.mercInventory&&player.mercInventory.length>0;
        const hasItems=(player.items||[]).length>0||(player.relics||[]).length>0|(player.bonusSkills||[]).length>0||hasMercGear;
        if(!hasItems){invList.innerHTML='<div style="color:#555;text-align:center;padding:20px;">장비가 없습니다.</div>';}
        else{
            const rl={legendary:{label:'LEGENDARY',color:'#e74c3c',bg:'#2d1a1a'},epic:{label:'EPIC',color:'#a55eea',bg:'#1e1a2d'},rare:{label:'RARE',color:'#1e90ff',bg:'#1a1e2d'},common:{label:'COMMON',color:'#888',bg:'#2a2a2a'}};
            let html='';
            if(hasMercGear){
                html+=`<div style="margin-bottom:10px;"><div style="background:#164a35;color:#2ed573;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">🛡️ 용병 장비 (전열)</div>`;
                player.mercInventory.forEach((it)=>{html+=`<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #2ed573;"><div style="color:#2ed573;font-weight:700;font-size:0.9em;">${it.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${it.desc||''}</div></div>`;});
                html+=`</div>`;
            }
            if(player.relics&&player.relics.length>0){
                html+=`<div style="margin-bottom:10px;"><div style="background:#2a2a0a;color:#f1c40f;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">✨ RELIC</div>`;
                player.relics.forEach(ef=>{const r=relicPool.find(rp=>rp.effect===ef);if(r)html+=`<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #f1c40f;"><div style="color:#f1c40f;font-weight:700;font-size:0.9em;">✨ ${r.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${r.desc}</div></div>`;});
                html+=`</div>`;
            }
            if(player.bonusSkills&&player.bonusSkills.length>0){
                html+=`<div style="margin-bottom:10px;"><div style="background:#1a0a2a;color:#9b59b6;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">✨ 각성 스킬</div>`;
                const skillNames={'bonus_bleed':'피의 분노','bonus_regen':'강철 심장','bonus_explode':'폭발 일격','bonus_guard':'철벽','bonus_hunter_eye':'사냥꾼의 눈'};
                player.bonusSkills.forEach(s=>{html+=`<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #9b59b6;"><div style="color:#9b59b6;font-weight:700;font-size:0.9em;">✨ ${skillNames[s]||s}</div></div>`;});
                html+=`</div>`;
            }
            const ro={'legendary':0,'epic':1,'rare':2,'common':3};
            const slots = [
                { kind: 'weapon', label: '⚔️ 무기', color: '#ffb347' },
                { kind: 'armor', label: '🛡️ 갑옷', color: '#74b9ff' },
                { kind: 'ring', label: '💍 반지', color: '#9b59b6' },
            ];
            slots.forEach((sdef) => {
                const slotItems = (player.items || []).filter((it) => getEquipSlotKind(it) === sdef.kind);
                if (!slotItems.length) return;
                html += `<div style="margin-bottom:12px;"><div style="background:#111;color:${sdef.color};font-size:0.76em;font-weight:900;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">${sdef.label} (${slotItems.length}/${getEquipSlotLimit(sdef.kind)})</div>`;
                const rg={legendary:[],epic:[],rare:[],common:[]};
                slotItems.sort((a,b)=>(ro[a.rarity]||3)-(ro[b.rarity]||3)).forEach(it=>{(rg[it.rarity]||rg.common).push(it);});
                Object.entries(rg).forEach(([rarity,items])=>{
                    if(!items.length)return;
                    const{label,color,bg}=rl[rarity];
                    html+=`<div style="margin:6px 0 8px;"><div style="background:${bg};color:${color};font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">${label}</div>`;
                    items.forEach(it=>{
                        ensureOwnedItemUid(it);
                        const bp = Math.max(0, safeNum(it._buyPrice != null ? it._buyPrice : it.price, 0));
                        const rf = Math.floor(bp * 0.5);
                        html+=`<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid ${color};"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><div><div style="color:${color};font-weight:700;font-size:0.9em;">${formatShopItemName(it.name)}</div>${getEquipSlotLineHtml(it)}<div style="color:#666;font-size:0.78em;margin-top:3px;line-height:1.4;">${formatShopItemDesc(it.desc)}</div><div style="color:#888;font-size:0.72em;margin-top:4px;">판매가: <b style="color:#f1c40f;">${rf}G</b></div></div><button type="button" onclick="sellItemByUid('${escapeJsSingleQuoteString(it._uid)}')" style="background:#553322;color:#ffd7a8;border:1px solid #996633;border-radius:8px;padding:6px 10px;font-size:0.75em;font-weight:800;cursor:pointer;">판매</button></div></div>`;
                    });
                    html+=`</div>`;
                });
                html += `</div>`;
            });
            invList.innerHTML=html;
        }
    }
}

function writeLog(msg) {
    const bs=document.getElementById('sidebar-battle'), isBattle=bs&&bs.style.display==='flex';
    const p=`<p style="margin:4px 0;border-bottom:1px solid #333;padding-bottom:4px;">${msg}</p>`;
    if(isBattle){const bl=document.getElementById('log-battle');if(bl)bl.innerHTML=p+bl.innerHTML;}
    else{const l=document.getElementById('log');if(l)l.innerHTML=p+l.innerHTML;}
}

function dungeonClear() {
    saveRank(); triggerBossWarning(false);
    const sg=Math.floor(totalGoldEarned*0.1), ps=getSavedGold();
    localStorage.setItem('saved_gold',ps+sg); exitBattleLayout();
    document.getElementById('battle-area').style.display='none';
    document.querySelector('.screen').innerHTML=`<div style="text-align:center;padding:40px 20px;"><h2 style="color:#f1c40f;font-size:2em;">🏆 던전 클리어!</h2><p style="color:#e0e0e0;font-size:1.1em;margin:15px 0;"><b style="color:#f1c40f;">${player.name}</b>이(가) 100층을 정복했습니다!</p><p style="color:#2ed573;font-size:0.95em;margin-bottom:5px;">💰 보존 골드: <b>${sg}G</b></p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px;"><button onclick="startInfiniteMode()" style="background:#9b59b6;color:#fff;padding:14px 24px;font-size:1em;font-weight:700;">♾️ 무한모드 도전</button><button onclick="location.reload()" style="background:#f1c40f;color:#111;padding:14px 24px;font-size:1em;font-weight:700;">🏠 메인으로</button></div></div>`;
    writeLog(`🏆 ${player.name}이(가) 100층을 클리어했습니다!!!`);
}

window.startInfiniteMode=()=>{
    floor=101; document.querySelector('.screen').innerHTML='';
    document.getElementById('battle-area').style.display='block'; enterBattleLayout();
    writeLog(`♾️ [무한모드] 101층부터 끝없는 도전!`); spawnEnemy(); updateUi();
};

function gameOver() {
    saveRank(); triggerBossWarning(false);
    window.__deathApplied = false;
    const sg = Math.floor(totalGoldEarned * 0.1);
    const slotId = player && player.metaSlotId;
    const enName = enemy ? enemy.name : '알 수 없는 적';
    const fl = floor;
    window.__deathCtx = { sg, slotId, floor: fl, enemyName: enName };

    exitBattleLayout();
    document.getElementById('battle-area').style.display = 'none';

    finalizeGameOverDeath();
}

/** 사망 후 저장 런으로 복구 — 보존/페널티 없음 */
window.resumeFromLastSaveAfterDeath = function resumeFromLastSaveAfterDeath() {
    window.__deathApplied = true;
    const d = window.__deathCtx || {};
    const slotId = d.slotId;
    if (!slotId || typeof MetaRPG === 'undefined') return location.reload();
    const snap = MetaRPG.getRunSnapshot(slotId);
    if (!snap || !snap.player) {
        alert('저장된 런이 없습니다.');
        return location.reload();
    }
    MetaRPG.setActiveSlot(slotId);
    document.querySelector('.screen').innerHTML = '';
    loadRunFromMetaSnapshot(snap);
};

/** 사망 처리: 보존 골드·퀘스트 페널티 후 허브로 */
window.finalizeGameOverDeath = function finalizeGameOverDeath() {
    if (window.__deathApplied) return;
    window.__deathApplied = true;
    const d = window.__deathCtx || {};
    const sg = d.sg != null ? d.sg : 0;
    const slotId = d.slotId;
    const fl = d.floor != null ? d.floor : floor;
    const enName = d.enemyName || '알 수 없는 적';
    if (typeof MetaRPG !== 'undefined') {
        MetaRPG.addSavedGold(sg);
        if (slotId) {
            const qdef = MetaRPG.FLOOR_QUESTS[fl];
            const sl = MetaRPG.getSlotById(slotId);
            if (qdef && sl && !(sl.questFlags && sl.questFlags[qdef.id])) {
                MetaRPG.applyQuestPenalty(slotId, qdef.failPenalty);
                writeLog(`[퀘스트 실패] 사망으로 <b>${qdef.title}</b> 패널티 적용`);
            }
        }
    } else {
        const ps = getSavedGold();
        localStorage.setItem('saved_gold', ps + sg);
    }
    writeLog(`💀 ${fl}층에서 ${enName}에게 패배했습니다. 허브로 복귀합니다.`);
    returnToHubFromRun(false);
};
