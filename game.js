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
const GAME_BUILD = '6.6.0';
/** v6.5.1 핫픽스: 치명/흡혈 상한·명중 기본값 */
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
            acc: Math.max(0, safeNum(raw.acc, 0)),
        };
    } catch (e) {
        return { hp: 0, atk: 0, def: 0, acc: 0 };
    }
}
function getSavedGold() {
    const n = parseInt(String(localStorage.getItem('saved_gold') ?? ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}
function savePermaStats(stats) {
    const s = {
        hp: Math.max(0, safeNum(stats && stats.hp, 0)),
        atk: Math.max(0, safeNum(stats && stats.atk, 0)),
        def: Math.max(0, safeNum(stats && stats.def, 0)),
        acc: Math.max(0, safeNum(stats && stats.acc, 0)),
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
    console.log('[던전] 클라이언트 빌드 v' + GAME_BUILD + ' — 로그에 이 안 보이면 예전 JS 캐시입니다. 강력 새로고침(Cmd+Shift+R)하세요.');
});

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
    let raw = safeNum(player.crit, 5);
    if (player.relics && player.relics.includes('berserk_crit') && player.maxHp && player.curHp <= player.maxHp * 0.3) raw = 100;
    return Math.max(0, raw - CRIT_SOFT_CAP);
}
function getEffectiveCritMult() {
    const base = safeNum(player && player.critMult, 1.8);
    return (base > 0 ? base : 1.8) + getCritOverflowForMult() * CRIT_OVERFLOW_TO_MULT;
}
function getCritInfo() {
    const rawCrit = safeNum(player && player.crit, 5);
    let valueForCap = rawCrit;
    let isBerserkCrit = false;
    if (player && player.relics && player.relics.includes('berserk_crit') && player.maxHp && player.curHp <= player.maxHp * 0.3) {
        valueForCap = 100;
        isBerserkCrit = true;
    }
    const effectiveCrit = Math.min(CRIT_SOFT_CAP, Math.max(0, valueForCap));
    return { rawCrit, effectiveCrit, isBerserkCrit };
}
function getLifestealEffective() {
    const r = safeNum(player && player.lifesteal, 0);
    return Math.min(LIFESTEAL_SOFT_CAP, Math.max(0, r));
}
function getLifestealOverflowAtk() {
    const r = safeNum(player && player.lifesteal, 0);
    if (r <= LIFESTEAL_SOFT_CAP) return 0;
    return Math.floor((r - LIFESTEAL_SOFT_CAP) * 100);
}
function getEffectiveAttackPower() {
    if (!player) return 0;
    let base = safeNum(player.atk, 0) + safeNum(player.extraAtk, 0) + getLifestealOverflowAtk();
    if (player._mercBattleAtkDebuff) base = Math.max(1, Math.floor(base * (1 + player._mercBattleAtkDebuff)));
    return base;
}

function isMercenaryCaptainJob() {
    return player && player.baseJob === '용병단장';
}

/** 상성 계산용 키: 용병단장 + 필드 용병 있으면 용병 직업(카멜레온) */
function getAffinityRelKey() {
    if (!player) return '';
    if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0 && player.fieldMerc.mercJob) {
        return player.fieldMerc.mercJob;
    }
    if (relations[player.name]) return player.name;
    return player.baseJob;
}

function getMercGoldSkipCost() {
    return 28 + floor * 6;
}

/** 필드 용병 피해 배율(고용 템 merc 스펙) */
function getFieldMercAttackMult() {
    if (!player || !player.fieldMerc || player.fieldMerc.mercHp <= 0) return 0;
    const m = player.fieldMerc.merc;
    if (!m) return 0.28;
    if (m.kind === 'dmg') {
        let mult = safeNum(m.mult, 0.28);
        if (player.fieldMerc.infiniteGrowth) mult += safeNum(player.fieldMerc.growthStacks, 0) * 0.004;
        return mult;
    }
    if (m.kind === 'both') return safeNum(m.dmgMult, 0.35);
    if (m.kind === 'heal') return Math.max(0.15, safeNum(m.pct, 0.12) * 0.75);
    return 0.28;
}

function buildFieldMercFromItem(item) {
    const m = item.merc;
    const mj = item.mercJob || '워리어';
    const rarity = item.rarity || 'common';
    const tier = { common: 1, rare: 1.2, epic: 1.45, legendary: 1.75, relic: 2.05 }[rarity] || 1;
    const base = 48 + floor * 5;
    const mercMaxHp = Math.max(20, Math.floor(base * tier + safeNum(player.maxHp, 100) * 0.14));
    return {
        sourceName: item.name,
        mercJob: mj,
        rarity,
        infiniteGrowth: !!item.infiniteGrowth,
        growthStacks: 0,
        mercHp: mercMaxHp,
        mercMaxHp: mercMaxHp,
        merc: { ...m },
    };
}

/** 일반 상점용: 용병 아이템 제외 */
function getNonMercEquipmentPool() {
    return equipmentPool.filter((i) => i && i.type !== 'merc');
}

function getMercCaptainShopPoolForRoll() {
    const lc = Math.min(15, 2 + Math.floor(shopVisitCount / 5)),
        ec = Math.min(35, 10 + Math.floor(shopVisitCount / 3)),
        rc = Math.min(50, 30 + Math.floor(shopVisitCount / 4)),
        cc = Math.max(0, 100 - lc - ec - rc);
    const rand = Math.random() * 100;
    if (rand < lc) {
        const legs = mercenaryFullPool.filter((i) => i.rarity === 'legendary');
        const rels = mercenaryFullPool.filter((i) => i.rarity === 'relic');
        const pool = [...rels, ...legs];
        return pool.length ? pool : mercenaryFullPool;
    }
    if (rand < lc + ec) {
        const p = mercenaryFullPool.filter((i) => i.rarity === 'epic');
        return p.length ? p : mercenaryFullPool;
    }
    if (rand < lc + ec + rc) {
        const p = mercenaryFullPool.filter((i) => i.rarity === 'rare');
        return p.length ? p : mercenaryFullPool;
    }
    const com = mercenaryFullPool.filter((i) => i.rarity === 'common');
    return com.length ? com : mercenaryFullPool;
}

function tryMercenaryRandomEvent() {
    if (!isMercenaryCaptainJob() || !player.fieldMerc || player.fieldMerc.mercHp <= 0) return;
    if (Math.random() > 0.035) return;
    const r = player.fieldMerc.rarity || 'common';
    const low = r === 'common' || r === 'rare';
    const high = r === 'epic' || r === 'legendary' || r === 'relic';
    let neg = 0,
        pos = 0;
    if (low) {
        neg = 0.38;
        pos = 0.06;
    } else if (high) {
        neg = 0.004;
        pos = 0.025;
    } else {
        neg = 0.12;
        pos = 0.04;
    }
    const roll = Math.random();
    if (roll < neg) {
        if (high && Math.random() < 0.92) return;
        player.mercNextBattleDebuff = { atkPct: -0.07 };
        writeLog(`[용병 이벤트] 💢 술집 난투·사기 피해… <b>다음 전투</b> 공격력 일시 하락!`);
        return;
    }
    if (roll < neg + pos) {
        if (player.fieldMerc.infiniteGrowth) {
            player.fieldMerc.growthStacks = safeNum(player.fieldMerc.growthStacks, 0) + 1;
            writeLog(`[용병 이벤트] 🌟 루크의 성장! 무한 스택 +1 (누적 ${player.fieldMerc.growthStacks})`);
            return;
        }
        if (high && Math.random() > 0.35) {
            writeLog(`[용병 이벤트] 고급 용병은 흔들리지 않는다… (미미한 보상)`);
            player.atk += 1;
            return;
        }
        player.atk += 3;
        player.crit += 1;
        writeLog(`[용병 이벤트] ✨ 실전 경험! 공격력+3, 치명+1%`);
        return;
    }
    if (player.fieldMerc.infiniteGrowth && Math.random() < 0.0009) {
        player.fieldMerc.growthStacks = safeNum(player.fieldMerc.growthStacks, 0) + 2;
        writeLog(`[용병 이벤트] 극히 드문 기적… 무한 성장 스택 +2!`);
    }
}

function showUnlockPopup(title, body, color) {
    const popup = document.createElement('div');
    popup.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;background:#1a1a1a;border:2px solid ${color};border-radius:10px;padding:16px 20px;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.8);animation:slideIn 0.3s ease;`;
    popup.innerHTML = `<div style="color:${color};font-weight:700;font-size:1em;margin-bottom:6px;">${title}</div><div style="color:#e0e0e0;font-size:0.88em;line-height:1.5;">${body}</div>`;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.transition='opacity 0.5s'; popup.style.opacity='0'; setTimeout(() => { if (popup.parentNode) document.body.removeChild(popup); }, 500); }, 3000);
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

function buildPermanentShopHtml() {
    const savedGold = getSavedGold();
    const buyCounts = getPermaBuyCount();
    const permaTot = getPermaStats();
    const sumLine = `<p style="color:#888;font-size:0.78em;margin:0 0 12px 0;line-height:1.5;">📌 <b>누적 영구 보너스</b> — 체력 <b style="color:#2ed573">+${permaTot.hp || 0}</b> · 공격 <b style="color:#f1c40f">+${permaTot.atk || 0}</b> · 방어 <b style="color:#1e90ff">+${permaTot.def || 0}</b> · 명중 <b style="color:#a55eea">+${permaTot.acc || 0}</b></p>`;
    const catKeys = ['hp', 'atk', 'def', 'acc'];
    const labels = { hp: '❤️ 체력', atk: '⚔️ 공격력', def: '🛡️ 방어력', acc: '🎯 명중률' };
    const colors = { hp: '#2ed573', atk: '#f1c40f', def: '#1e90ff', acc: '#a55eea' };
    const rows = catKeys.map((key) => {
        const cat = permanentUpgrades.filter((u) => u.id.startsWith(key + '_'));
        const lv = cat.filter((u) => buyCounts[u.id]).length;
        const next = cat[lv];
        const maxed = !next;
        const price = next ? next.price : 0;
        const can = next && savedGold >= price;
        const btnBg = maxed ? '#222' : can ? '#f1c40f' : '#333';
        const btnFg = maxed ? '#555' : can ? '#111' : '#666';
        return `<div style="display:flex;justify-content:space-between;align-items:center;background:#111;border:1px solid #333;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
            <div style="flex:1;">
                <span style="color:${colors[key]};font-weight:700;font-size:0.9em;">${labels[key]}</span>
                <span style="color:#888;font-size:0.8em;margin-left:10px;">Lv.${lv} / ${cat.length}</span>
                <div style="color:#555;font-size:0.72em;margin-top:3px;">${maxed ? '최대 강화' : `다음 비용: <b style="color:#f1c40f;">${price}G</b>`}</div>
            </div>
            <button type="button" onclick="buyPermUpgradeNext('${key}')" ${maxed || !can ? 'disabled' : ''} style="background:${btnBg};color:${btnFg};padding:8px 18px;font-size:0.82em;font-weight:700;border:none;border-radius:6px;cursor:${maxed || !can ? 'not-allowed' : 'pointer'};">${maxed ? 'MAX' : '강화'}</button>
        </div>`;
    }).join('');
    return sumLine + rows;
}

function showPreGameScreen() {
    exitBattleLayout();
    const savedGold = getSavedGold();
    const perma = getPermaStats();
    const globalUnlocked = getUnlockedFloors(null);
    const warriorUnlocked = getUnlockedFloors('워리어');
    const hunterUnlocked = getUnlockedFloors('헌터');
    const wizardUnlocked = getUnlockedFloors('마법사');
    document.getElementById('start-area').style.display = 'block';
    document.getElementById('battle-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'none';
    document.getElementById('start-area').innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <h2 style="color:#f1c40f; margin-bottom:5px;">⚔️ 던전 입장</h2>
            <p style="color:#888; font-size:0.85em;">보존 골드: <b style="color:#f1c40f;">${savedGold}G</b></p>
            ${globalUnlocked.length>0?`<p style="color:#f1c40f;font-size:0.8em;">🔓 공용 해금: ${globalUnlocked.join(', ')}층</p>`:''}
            ${warriorUnlocked.length>0?`<p style="color:#ff4757;font-size:0.8em;">🔓 워리어: ${warriorUnlocked.join(', ')}층</p>`:''}
            ${hunterUnlocked.length>0?`<p style="color:#2ed573;font-size:0.8em;">🔓 헌터: ${hunterUnlocked.join(', ')}층</p>`:''}
            ${wizardUnlocked.length>0?`<p style="color:#1e90ff;font-size:0.8em;">🔓 마법사: ${wizardUnlocked.join(', ')}층</p>`:''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;max-width:520px;margin-left:auto;margin-right:auto;">
            ${['Warrior','Hunter','Wizard','MercenaryCaptain'].map(job=>`
                <div onclick="selectJobAndStart('${job}')" style="background:#1a1a1a;border:2px solid ${jobBase[job].color};border-radius:10px;padding:15px;cursor:pointer;text-align:center;transition:transform 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform='translateY(0)'">
                    <div style="color:${jobBase[job].color};font-weight:700;font-size:1.1em;margin-bottom:8px;">${jobBase[job].name}</div>
                    <div style="color:#888;font-size:0.78em;line-height:1.6;">HP: <b style="color:#2ed573;">${jobBase[job].hp+perma.hp}</b><br>ATK: <b style="color:#f1c40f;">${jobBase[job].atk+perma.atk}</b><br>DEF: <b style="color:#1e90ff;">${jobBase[job].def+perma.def}</b></div>
                </div>`).join('')}
        </div>
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:15px;">
            <h4 style="color:#f1c40f;margin:0 0 8px 0;">🏪 영구 강화 상점</h4>
            <p style="color:#666;font-size:0.75em;margin:0 0 12px 0;">항목마다 <b>강화</b> 한 번에 다음 레벨이 구매됩니다. 포션 영구 강화는 없습니다.</p>
            <div style="max-height:280px;overflow-y:auto;">${buildPermanentShopHtml()}</div>
        </div>`;
}

window.buyPermUpgradeNext = (key) => {
    const buyCounts = getPermaBuyCount();
    const cat = permanentUpgrades.filter((u) => u.id.startsWith(key + '_'));
    const lv = cat.filter((u) => buyCounts[u.id]).length;
    const next = cat[lv];
    if (!next) return;
    buyPermUpgrade(next.id);
};

window.buyPermUpgrade = (id) => {
    const savedGold = getSavedGold();
    const up = permanentUpgrades.find(u => u.id===id);
    if (!up) return;
    const buyCounts = getPermaBuyCount();
    if (buyCounts[id] || savedGold < up.price) return;
    const parts = id.split('_'), level = parseInt(parts[parts.length-1]), prefix = parts.slice(0,-1).join('_');
    if (level > 1 && !buyCounts[`${prefix}_${level-1}`]) return;
    localStorage.setItem('saved_gold', savedGold - up.price);
    buyCounts[id] = true; savePermaBuyCount(buyCounts);
    const perma = getPermaStats();
    if (up.effect.hp) perma.hp += up.effect.hp;
    if (up.effect.atk) perma.atk += up.effect.atk;
    if (up.effect.def) perma.def += up.effect.def;
    if (up.effect.acc) perma.acc += up.effect.acc;
    savePermaStats(perma);
    showPreGameScreen();
};

window.selectJobAndStart = (job) => {
    clearSummonRunStorage();
    const perma = getPermaStats();
    player = {
        ...jobBase[job],
        curHp: jobBase[job].hp+perma.hp, maxHp: jobBase[job].hp+perma.hp,
        atk: jobBase[job].atk+perma.atk, def: jobBase[job].def+perma.def,
        acc: perma.acc, crit: 5, critMult: 1.8,
        items: [], relics: [], extraAtk: 0, potions: 3,
        extraDef: 0, unlockedSkill: null, ultStack: 0, ultMaxStack: 0,
        lifesteal: 0, hasRegenPotion: false,
        baseJob: jobBase[job].name, evolved: false, shieldEmpowered: false,
        summon: null, _awaitPlayerTurn: false,
        fieldMerc: null, mercCooldownTurns: 0, mercNextBattleDebuff: null, _mercBattleAtkDebuff: 0,
    };
    if (job === 'MercenaryCaptain') {
        const st = mercenaryHirePool.find((i) => i.name === '용병: 철검사 아렌');
        if (st) player.items.push({ ...st });
    }
    floor=1; gold=0; totalGoldEarned=0; rerollCost=10; shopVisitCount=0;
    document.getElementById('start-area').style.display='none';
    document.getElementById('battle-area').style.display='block';
    document.getElementById('log-battle').innerHTML='';
    enterBattleLayout(); loadCollection(); spawnEnemy();
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

window.evolve = (idx) => {
    const evol = window._evolOptions[idx];
    const oldName = player.name;
    const baseKey = player.baseJob==='워리어'?'Warrior':player.baseJob==='헌터'?'Hunter':'Wizard';
    player.name = evol.name; player.evolved = true;
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
    document.body.removeChild(window._evolOverlay);
    writeLog(`⚡ [전직] ${oldName} → <b style='color:#f1c40f'>${evol.name}</b>! 궁극기 [${evol.ult}] 획득!`);
    updateUi(); renderActions();
};

function checkFloorUnlock(f) {
    const baseJob = player.baseJob;
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
    if (isMercenaryCaptainJob() && player.items.length > 0 && player.items.every((i) => i.type === 'merc')) {
        writeLog(`[이벤트층] ⚒️ 대장간: 장비 재료가 없어 지나갑니다.`);
        if (floor > 1 && floor % 3 === 0) pendingShop = true;
        spawnEnemy();
        return;
    }
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
            if (item.critBonus) player.crit = Math.max(5, player.crit-item.critBonus);
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

    if (player && player.mercNextBattleDebuff && typeof player.mercNextBattleDebuff.atkPct === 'number') {
        player._mercBattleAtkDebuff = player.mercNextBattleDebuff.atkPct;
    } else if (player) {
        player._mercBattleAtkDebuff = 0;
    }
    if (player) player.mercNextBattleDebuff = null;

    if (player.relics&&player.relics.includes('gambler')) {
        const pa = safeNum(player.atk, 0);
        if (Math.random()<0.5) { player.extraAtk=Math.floor(pa*0.3); writeLog(`[유물] 🎲 도박사: 행운! 공격력 +30%`); }
        else { player.extraAtk=-Math.floor(pa*0.1); writeLog(`[유물] 🎲 도박사: 불운... 공격력 -10%`); }
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
    if (isMercenaryCaptainJob() && !player.fieldMerc && player.mercCooldownTurns <= 0 && floor === 1) {
        const mi = player.items.findIndex((i) => i.type === 'merc');
        if (mi >= 0) {
            const it = player.items[mi];
            player.items.splice(mi, 1);
            player.fieldMerc = buildFieldMercFromItem(it);
            writeLog(`[용병단장] 첫 전투 생존: <b>${it.name}</b> 자동 전개 (인벤 1 소모)`);
        }
    }
    player._awaitPlayerTurn = true;
    updateUi(); renderActions();
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
    else if(['마법사','위저드','소환사'].includes(jn)){defBtn.innerText='✨ 방어막 (60%)';defBtn.onclick=()=>useAction('방어막');}
    div.appendChild(defBtn);

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
}

function applySummonDarkTurnStart() {
    if (!player || !enemy || !player._awaitPlayerTurn) return;
    player._awaitPlayerTurn = false;
    if (player.summon && player.summon.id === 'dark') {
        const hpCost = Math.max(1, Math.floor(player.maxHp * 0.05));
        player.curHp = Math.max(1, player.curHp - hpCost);
        const rawAtk = getEffectiveAttackPower();
        const md = Math.max(1, Math.floor(1.4 * rawAtk - Math.floor(enemy.def * 0.5)));
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
        const accRate=Math.min(95,BASE_HIT_ACCURACY+player.acc);
        if(Math.random()*100<accRate){
            let berserkMult = (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) ? 1.35 : 1;
            if (berserkMult > 1) effectMsg += "<b style='color:#e74c3c'>【광폭화】</b> ";
            let baseDmg;
            if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
                const mm = getFieldMercAttackMult();
                baseDmg = Math.floor((getEffectiveAttackPower() * mm + Math.floor(Math.random() * 6)) * berserkMult);
                const specialChance = 0.1 + Math.random() * 0.1;
                if (Math.random() < specialChance) {
                    baseDmg = Math.floor(baseDmg * 2.55);
                    effectMsg += "<b style='color:#e67e22'>【용병 필살기】</b> ";
                    triggerCritEffect();
                    triggerShakeEffect();
                }
                const mk = player.fieldMerc.merc.kind;
                if (mk === 'heal' || mk === 'both') {
                    const pct = mk === 'heal' ? player.fieldMerc.merc.pct : player.fieldMerc.merc.healPct;
                    if (pct) {
                        const hh = Math.floor(player.maxHp * pct * 0.12);
                        player.curHp = Math.min(player.maxHp, player.curHp + hh);
                        writeLog(`[용병] 교환 타격 — 회복 +${hh}`);
                    }
                }
                tryMercenaryRandomEvent();
            } else if (isMercenaryCaptainJob()) {
                baseDmg = Math.floor((getEffectiveAttackPower() * 0.62 + Math.floor(Math.random() * 6)) * berserkMult);
                effectMsg += "<b style='color:#aaa'>(단장 직격)</b> ";
            } else {
                baseDmg=Math.floor((getEffectiveAttackPower()+Math.floor(Math.random()*8)) * berserkMult);
            }
            const critInfo=getCritInfo();
            let effectiveCrit=critInfo.effectiveCrit;
            if(critInfo.isBerserkCrit){effectMsg+="<b style='color:#ff4757'>🔥 분노!</b> ";}
            let relicAtkMult=1;
            if(player.relics&&player.relics.includes('execute')&&enemy.curHp<=enemy.hp*0.2){relicAtkMult=2;effectMsg+="<b style='color:#e74c3c'>💀 처형!</b> ";}
            if(player.shieldEmpowered){relicAtkMult*=1.5;player.shieldEmpowered=false;effectMsg+="<b style='color:#3498db'>🛡️ 강화!</b> ";}
            let isCrit = false;
            let usedWeak = false;
            if (enemy.weakPoint && player.name === '암살자') {
                usedWeak = true;
                enemy.weakPoint = false;
                isCrit = true;
                baseDmg = Math.floor(baseDmg * getEffectiveCritMult() * 2);
                effectMsg += "<b style='color:#9b59b6'>【약점 노출】</b> <b style='color:#f1c40f'>💥 암살!</b> ";
                triggerCritEffect();
            } else {
                isCrit = Math.random()*100<effectiveCrit;
                if(isCrit){baseDmg=Math.floor(baseDmg*getEffectiveCritMult());effectMsg+="<b style='color:#f1c40f'>💥 치명타!</b> ";triggerCritEffect();}
            }
            const effDef = (usedWeak ? 0 : enemy.def);
            let finalDmg=Math.max(1,Math.floor(baseDmg*multiplier*relicAtkMult)-effDef);
            enemy.curHp-=finalDmg;
            showDmgFloat(finalDmg,isCrit,false); triggerShakeEffect();
            writeLog(`[명중] ${effectMsg}적에게 ${finalDmg} 피해!`);
            if(getLifestealEffective()>0){const h=Math.floor(finalDmg*getLifestealEffective());player.curHp=Math.min(player.maxHp,player.curHp+h);writeLog(`[흡혈] 💉 ${h}`);}
            if (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) {
                const rh = Math.floor(finalDmg * 0.25);
                player.curHp = Math.min(player.maxHp, player.curHp + rh);
                writeLog(`[패시브] 광폭화 흡혈 +${rh}`);
            }
            if (player.summon && player.summon.id === 'fire' && enemy.curHp > 0) {
                const fireDmg = Math.max(1, Math.floor(getEffectiveAttackPower() * 0.10));
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
                setTimeout(()=>{if(!enemy||enemy.curHp<=0)return;const cd=Math.max(1,Math.floor(getEffectiveAttackPower()*0.55)-enemy.def);enemy.curHp-=cd;writeLog(`[유물] ⚡ 연쇄 마법! ${cd} 추가 피해!`);showDmgFloat(cd,false,false);if(enemy.curHp<=0)winBattle();else updateUi();},250);
            }
            if(enemy.curHp<=0&&player.relics&&player.relics.includes('kill_heal')){const kh=Math.floor(player.maxHp*0.15);player.curHp=Math.min(player.maxHp,player.curHp+kh);writeLog(`[유물] 💚 킬 회복 ${kh}!`);}
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
        if(Math.random()*100<guardRate){defendingTurns=2;writeLog(`[성공] 🛡️ 2턴간 피해 60% 감소!`);if(player.relics&&player.relics.includes('shield_empower')){player.shieldEmpowered=true;writeLog(`[유물] ⚡ 철벽의 의지 발동!`);}}
        else writeLog(`[실패] 방패 방어 실패!`);
    } else if (type==='회피') {
        dodgingTurns=2; writeLog(`[회피기] 💨 2번의 공격을 75% 확률로 회피합니다!`);
    } else if (type==='방어막') {
        const shieldRate = 60 + (player._guardBonus||0);
        if(Math.random()*100<shieldRate){shieldedTurns=2;writeLog(`[성공] ✨ 2턴간 피해 50% 감소!`);}
        else writeLog(`[실패] 방어막 전개 실패!`);
    }
    enemyTurn();
};

window.usePotion = () => {
    if (applySummonDarkTurnStart()) return;
    if(player.potions<=0) return writeLog("포션이 없습니다!");
    if(potionUsedThisTurn) return writeLog("이번 턴에 이미 포션을 사용했습니다!");
    player.potions--; potionUsedThisTurn=true;
    if(player.hasRegenPotion){regenTurns=2;regenAmount=Math.floor(player.maxHp*0.25);writeLog(`[포션] 🧪 서서히 회복! (2턴간 매 턴 ${regenAmount})`);}
    else{const h=Math.floor(player.maxHp*0.35);player.curHp=Math.min(player.maxHp,player.curHp+h);writeLog(`[포션] 🧪 즉시 체력 ${h} 회복!`);}
    updateUi(); renderActions();
    /** 포션도 턴을 소모 — 적 턴으로 넘어가야 같은 턴에 공격 연타 불가 */
    enemyTurn();
};

let autoRegenCounter = 0;
function enemyTurn() {
    setTimeout(() => {
        if(regenTurns>0){player.curHp=Math.min(player.maxHp,player.curHp+regenAmount);regenTurns--;writeLog(`[재생] 💚 ${regenAmount} 회복! (남은 턴: ${regenTurns})`);}
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
                if(player.relics&&player.relics.includes('dodge_counter')){const cd=Math.max(1,Math.floor(player.atk*0.6)-enemy.def);enemy.curHp-=cd;player.curHp=Math.min(player.maxHp,player.curHp+10);writeLog(`[유물] 🗡️ 그림자 반격! ${cd} 피해!`);showDmgFloat(cd,false,false);if(enemy.curHp<=0){setTimeout(()=>winBattle(),100);return;}}
            } else writeLog(`[회피 실패] 피하지 못했습니다!`);
        }
        if(hitLanded){
            if(Math.random()*100<80){
                let dmg=Math.max(1,currentEnemyAtk-(player.def+player.extraDef));
                if(shieldedTurns>0){dmg=Math.floor(dmg*0.5);shieldedTurns--;writeLog(`[방어막] ✨ 피해 50% 감소! (${dmg} 입음)`);if(player.relics&&player.relics.includes('barrier_reflect')){const rd=Math.floor(dmg*0.3);enemy.curHp-=rd;writeLog(`[유물] 🔮 마력 반사! ${rd}`);if(enemy.curHp<=0){setTimeout(()=>winBattle(),100);}}}
                else if(defendingTurns>0){dmg=Math.floor(dmg*0.4);defendingTurns--;writeLog(`[철벽 방어] 🛡️ 피해 60% 감소! (${dmg} 입음)`);}
                else writeLog(`[피격] 적의 공격! ${dmg} 데미지.`);
                if (player.summon && player.summon.id === 'golem') {
                    dmg = Math.max(1, Math.floor(dmg * 0.82));
                    writeLog(`[소환] 🪨 골렘이 피해를 줄였습니다! (${dmg})`);
                }
                if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
                    player.fieldMerc.mercHp -= dmg;
                    writeLog(`[어그로] 용병이 맞았다! ${dmg} (용병 ${Math.max(0, player.fieldMerc.mercHp)}/${player.fieldMerc.mercMaxHp})`);
                    showDmgFloat(dmg, false, true);
                    if (player.fieldMerc.mercHp <= 0) {
                        player.fieldMerc = null;
                        player.mercCooldownTurns = 3;
                        writeLog(`💀 용병 전멸! 재소환까지 ${player.mercCooldownTurns}턴 (또는 🪙 긴급 재가동)`);
                    }
                } else {
                    player.curHp-=dmg; showDmgFloat(dmg,false,true);
                }
            } else writeLog(`[럭키] 적의 공격이 빗나갔습니다!`);
        }
        if (isMercenaryCaptainJob() && player.mercCooldownTurns > 0) {
            player.mercCooldownTurns--;
            if (player.mercCooldownTurns === 0) writeLog(`[용병] 재고용 가능 (쿨타임 종료)`);
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
    if(floor===100&&enemy.isBoss) return dungeonClear();
    const clearedFloor=floor; floor++;
    checkFloorUnlock(clearedFloor);

    // 소환사 15층 도달 시 계약의 제단 (1회, 이벤트층/돌발 대신)
    if (floor === 15 && player.name === '소환사' && !localStorage.getItem('summon_altar_done')) {
        setTimeout(() => showContractAltar(), 500);
        return;
    }

    // 이벤트 층 체크
    if (checkEventFloor(floor)) {
        setTimeout(() => showEventFloor(), 500);
        return;
    }
    // 랜덤 인카운터
    if(clearedFloor>5&&!enemy.isBoss&&Math.random()<0.15){
        if(clearedFloor===10&&!player.evolved) setTimeout(()=>checkEvolution(),300);
        setTimeout(()=>showRandomEncounter(),500); return;
    }
    if(clearedFloor===10&&!player.evolved){if(floor>1&&floor%3===0)pendingShop=true;spawnEnemy();setTimeout(()=>checkEvolution(),300);return;}
    if(floor>1&&floor%3===0) pendingShop=true;
    spawnEnemy();
}

function openShop() {
    shopVisitCount++;
    document.getElementById('battle-area').style.display='none';
    document.getElementById('shop-area').style.display='block';
    rerollCost=10; updateUi(); renderShopItems();
}

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
    const lc=Math.min(15,2+Math.floor(shopVisitCount/5)), ec=Math.min(35,10+Math.floor(shopVisitCount/3)), rc=Math.min(50,30+Math.floor(shopVisitCount/4));
    const rand=Math.random()*100;
    const pool = getNonMercEquipmentPool();
    if(rand<lc) return pool.filter(i=>i.rarity==='legendary');
    if(rand<lc+ec) return pool.filter(i=>i.rarity==='epic');
    if(rand<lc+ec+rc) return pool.filter(i=>i.rarity==='rare');
    return pool.filter(i=>i.rarity==='common');
}

function renderShopItems() {
    const list=document.getElementById('shop-list');
    list.innerHTML='';
    const lc=Math.min(15,2+Math.floor(shopVisitCount/5)), ec=Math.min(35,10+Math.floor(shopVisitCount/3)), rc=Math.min(50,30+Math.floor(shopVisitCount/4)), cc=Math.max(0,100-lc-ec-rc);
    const cb=document.createElement('div');
    cb.style.cssText='font-size:0.78em;margin-bottom:10px;display:flex;gap:10px;flex-wrap:wrap;padding:8px;background:#111;border-radius:6px;';
    cb.innerHTML=`<span style="color:#888;">📊 등급 확률 (${shopVisitCount}회)</span><span style="color:#e74c3c;">전설 ${lc}%</span><span style="color:#a55eea;">고급 ${ec}%</span><span style="color:#1e90ff;">희귀 ${rc}%</span><span style="color:#888;">일반 ${cc}%</span>`;
    list.appendChild(cb);
    currentShopItems=[{name:"치유 포션",type:"potion",value:80,price:40,rarity:"common",desc:"최대 체력의 35%를 즉시 회복합니다."}];
    const unlockedItems=getUnlockedPoolItems(), picked=[];
    let tries=0;
    if (isMercenaryCaptainJob()) {
        if (floor >= 18 && Math.random() < 0.28) {
            const ar = mercenaryRelicPool.filter((r) => !player.items.some((i) => i.name === r.name));
            if (ar.length > 0) picked.push({ ...ar[Math.floor(Math.random() * ar.length)] });
        }
    } else if(floor>=20&&Math.random()<0.25&&player.relics){
        const ar=relicPool.filter(r=>{if(player.relics.includes(r.effect))return false;if(!r.onlyFor)return true;return r.onlyFor.some(j=>j===player.name||j===player.baseJob);});
        if(ar.length>0){const relic=ar[Math.floor(Math.random()*ar.length)];picked.push({...relic,type:'relic',value:0});}
    }
    if(!isMercenaryCaptainJob() && unlockedItems.length>0){const ru=unlockedItems[Math.floor(Math.random()*unlockedItems.length)];if(!player.items.some(i=>i.name===ru.name)&&!picked.some(p=>p.name===ru.name))picked.push(ru);}
    while(picked.length<3&&tries<50){
        tries++;
        const pool=isMercenaryCaptainJob()?getMercCaptainShopPoolForRoll():getItemsByRarity();
        if(!pool.length)continue;
        const item=pool[Math.floor(Math.random()*pool.length)];
        if(picked.some(i=>i.name===item.name))continue;
        if(item.onlyFor){const allowed=Array.isArray(item.onlyFor)?item.onlyFor:[item.onlyFor];if(!allowed.includes(player.name)&&!allowed.includes(player.baseJob))continue;}
        picked.push(item);
    }
    currentShopItems.push(...picked);
    const grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px;';
    currentShopItems.forEach((it,idx)=>{
        const isRelic=it.type==='relic', d=document.createElement('div');
        let bc='#444',bac='#888',bb='#2a2a2a',bt='COMMON';
        if(isRelic){bc='#f1c40f';bac='#f1c40f';bb='#2a2a0a';bt='RELIC';}
        else if(it.rarity==='relic'){bc='#d35400';bac='#f39c12';bb='#2a1a0a';bt='RELIC(용병)';}
        else if(it.rarity==='legendary'){bc='#e74c3c';bac='#e74c3c';bb='#2d1a1a';bt='LEGENDARY';}
        else if(it.rarity==='epic'){bc='#a55eea';bac='#a55eea';bb='#1e1a2d';bt='EPIC';}
        else if(it.rarity==='rare'){bc='#1e90ff';bac='#1e90ff';bb='#1a1e2d';bt='RARE';}
        let nc=isRelic?'#f1c40f':it.rarity==='legendary'?'#e74c3c':it.rarity==='epic'?'#a55eea':it.rarity==='rare'?'#1e90ff':'#e0e0e0';
        let ti=isRelic?'✨':'🎒';
        if(!isRelic){if(it.type==='atk')ti='⚔️';else if(it.type==='hp')ti='🛡️';else if(it.type==='acc')ti='🎯';else if(it.type==='potion')ti='🧪';else if(it.type==='merc')ti='⚔️';if(it.lifesteal)ti='🩸';if(it.regenPotion)ti='💚';}
        const iu=getUnlockedPoolItems().some(u=>u.name===it.name);
        d.style.cssText=`background:#1a1a1a;border:1px solid ${bc};border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;transition:transform 0.15s;cursor:default;`;
        d.onmouseenter=()=>d.style.transform='translateY(-2px)'; d.onmouseleave=()=>d.style.transform='translateY(0)';
        d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;"><span style="background:${bb};color:${bac};border:1px solid ${bc};border-radius:4px;font-size:0.7em;font-weight:700;padding:2px 7px;letter-spacing:1px;">${iu?'🔓 ':''}${bt}</span><span style="font-size:1.3em;">${ti}</span></div><div style="color:${nc};font-weight:700;font-size:1em;line-height:1.3;">${it.name}</div><div style="color:#888;font-size:0.78em;line-height:1.5;flex:1;">${it.desc}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;"><span style="color:#f1c40f;font-weight:700;font-size:1em;">💰 ${it.price}G</span><button onclick="buyItem(event,${idx})" style="background:#f1c40f;color:#111;padding:6px 14px;font-size:0.85em;font-weight:700;margin:0;border-radius:6px;">구매</button></div>`;
        grid.appendChild(d);
    });
    list.appendChild(grid);
    const rb=document.createElement('button'); rb.className='reroll-btn'; rb.innerText=`🔄 다시 돌리기 (${rerollCost}G)`; rb.onclick=rerollShop; list.appendChild(rb);
}

window.rerollShop = () => {
    if(gold<rerollCost) return writeLog(`[상점] 골드가 부족합니다.`);
    gold-=rerollCost; rerollCost+=10; writeLog(`[상점] 리롤 완료!`); updateUi(); renderShopItems();
};

function saveCollection(itemName) {
    let c=JSON.parse(localStorage.getItem('item_collection_v5')||'[]');
    if(!c.includes(itemName)){c.push(itemName);localStorage.setItem('item_collection_v5',JSON.stringify(c));}
}
function loadCollection() {}

window.buyItem = (event, idx) => {
    const it=currentShopItems[idx];
    if(gold<it.price) return writeLog("골드 부족!");
    gold-=it.price;
    if(it.type==='relic'){
        player.relics.push(it.effect); saveCollection(it.name);
        writeLog(`[유물 획득] ✨ <b style='color:#f1c40f'>${it.name}</b> 장착!`);
        showUnlockPopup(`✨ 유물 획득!`,`<b style="color:#f1c40f;">${it.name}</b><br>${it.desc}`,'#f1c40f');
    } else if(it.type==='potion'){
        player.potions++; writeLog(`[상점] 포션 구매 완료.`);
    } else if(it.type==='merc'){
        if(!player.items.some(i=>i.name===it.name)){
            player.items.push(it); saveCollection(it.name);
            writeLog(`[상점] ${it.name} 구매! (인벤에서 전투 중 <b>고용</b>)`);
        } else { writeLog(`이미 보유한 고용 아이템입니다!`); gold+=it.price; }
    } else {
        if(!player.items.some(i=>i.name===it.name)){
            player.items.push(it); saveCollection(it.name);
            if(it.type==='atk')player.atk+=it.value;
            if(it.type==='hp'){player.maxHp+=it.value;player.curHp+=it.value;}
            if(it.type==='acc')player.acc+=it.value;
            if(it.def)player.extraDef+=it.def;
            if(it.acc)player.acc+=it.acc;
            if(it.lifesteal)player.lifesteal=(player.lifesteal||0)+it.lifesteal;
            if(it.regenPotion)player.hasRegenPotion=true;
            if(it.critBonus)player.crit=(player.crit||5)+it.critBonus;
            if(it.critMult)player.critMult=(player.critMult||1.8)+it.critMult;
            if(it.penalty&&it.penalty[player.name]){player.acc-=it.penalty[player.name];writeLog(`[패널티] 명중률 -${it.penalty[player.name]}% 적용`);}
            writeLog(`[상점] ${it.name} 장착 완료!`);
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
    writeLog(`[자본주의] 🪙 ${cost}G로 용병 쿨타임을 초기화했습니다!`);
    updateUi(); renderActions();
};

window.useMercenarySlot = (ix) => {
    if (!player || !enemy) return writeLog('[고용] 전투 중에만 사용할 수 있습니다.');
    if (!isMercenaryCaptainJob()) return writeLog('[고용] 용병 고용 아이템은 <b>용병단장</b>만 사용할 수 있습니다.');
    if (player.mercCooldownTurns > 0) return writeLog(`[고용] 재가동 대기 ${player.mercCooldownTurns}턴 — 🪙 긴급 재가동 또는 턴 경과 후 가능.`);
    const it = player.items[ix];
    if (!it || it.type !== 'merc' || !it.merc) return;
    player.items.splice(ix, 1);
    player.fieldMerc = buildFieldMercFromItem(it);
    writeLog(`[고용] <b>${it.name}</b> 필드 전개! 상성: <b>${player.fieldMerc.mercJob}</b> (어그로 1순위)`);
    updateUi(); renderActions();
};
function codexItemMatchesTab(it, tab) {
    if (!it || !it.name) return false;
    if (tab === '용병') return it.type === 'merc';
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

window.toggleCollection = (show) => {
    if (show) {
        if (!window._codexTab) window._codexTab = '공용';
        const mercMode = player && player.baseJob === '용병단장';
        if (mercMode && window._codexTab === '공용') window._codexTab = '용병';
        const tab = window._codexTab;
        const tabs = mercMode ? ['용병', '워리어', '헌터', '마법사'] : ['공용', '워리어', '헌터', '마법사'];
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
        const tabItems = uniqueItems.filter((i) => codexItemMatchesTab(i, tab));
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
        let html = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;align-items:center;">${tabBar}</div>`;
        html += `<p style="color:#888;font-size:0.85em;margin-bottom:15px;">탭: <b style="color:#f1c40f;">${tab}</b> · 해금: <b style="color:#f1c40f;">${collection.length}</b> / ${uniqueItems.length}</p>`;
        if (relicItems.length > 0) {
            html += `<div style="margin-bottom:16px;border-bottom:1px solid #333;padding-bottom:12px;"><div style="background:#2a2a0a;color:#f1c40f;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:8px;letter-spacing:1px;">✨ RELIC (유물)</div>`;
            relicItems.forEach((it) => {
                if (collection.includes(it.name))
                    html += `<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #f1c40f;"><div style="color:#f1c40f;font-weight:700;font-size:0.9em;">✅ ✨ ${it.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${it.desc}</div></div>`;
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
                if (it.owned)
                    html += `<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid ${color};"><div style="color:${color};font-weight:700;font-size:0.9em;">✅ ${it.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${it.desc}</div></div>`;
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
};

function updateUi() {
    if(!player||!enemy) return;
    const pMax = Math.max(1, safeNum(player.maxHp, 1));
    const pCur = Math.max(0, safeNum(player.curHp, 0));
    const eHp = Math.max(1, safeNum(enemy.hp, 1));
    const eCur = Math.max(0, safeNum(enemy.curHp, 0));
    const g = safeNum(gold, 0);
    const pots = Math.max(0, safeNum(player.potions, 0));
    document.getElementById('p-name').innerText=player.name;
    document.getElementById('p-hp').style.width=`${Math.max(0,(pCur/pMax)*100)}%`;
    document.getElementById('p-hp-t').innerText=`${pCur} / ${pMax}`;
    const summLine = document.getElementById('p-summon-line');
    if (summLine) {
        if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
            summLine.innerHTML = `<span style="color:#e67e22;">🛡️ 용병:</span> ${player.fieldMerc.sourceName} <span style="color:#888;">| HP ${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp} · 상성 ${player.fieldMerc.mercJob}</span>`;
        } else if (player.summon && player.summon.name) summLine.innerHTML = `<span style="color:#a55eea;">소환:</span> ${player.summon.name}`;
        else summLine.innerHTML = '';
    }
    const ultLine = document.getElementById('p-ult-stack-line');
    if (ultLine) {
        if (player.unlockedSkill && floor >= 20) ultLine.innerHTML = `<span style="color:#9b59b6;">궁극기</span> [${safeNum(player.ultStack, 0)}/${Math.max(1, safeNum(player.ultMaxStack, 1))}]`;
        else ultLine.innerHTML = '';
    }
    document.getElementById('p-atk-val').textContent=String(getEffectiveAttackPower());
    document.getElementById('p-def-val').textContent=String(safeNum(player.def, 0) + safeNum(player.extraDef, 0));
    document.getElementById('p-acc-val').textContent=`${Math.min(95, BASE_HIT_ACCURACY + safeNum(player.acc, 0))}%`;
    const critInfo=getCritInfo();
    document.getElementById('p-crit-val').textContent=`${Math.round(safeNum(critInfo.effectiveCrit, 0))}%`;
    const critMultEl=document.getElementById('p-crit-mult-val');
    const ecm = getEffectiveCritMult();
    if(critMultEl) critMultEl.textContent=`${(Number.isFinite(ecm) ? ecm : 1.8).toFixed(2)}x`;
    const lsOv=getLifestealOverflowAtk();
    const lsMain=document.getElementById('p-lifesteal-val');
    if(lsMain) lsMain.textContent=`${Math.round(safeNum(getLifestealEffective(), 0) * 100)}%`;
    const lsNote=document.getElementById('p-lifesteal-note');
    if(lsNote) lsNote.textContent=lsOv>0?`흡혈 초과분 → 공격력 +${lsOv}`:'';
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
        const hasItems=(player.items||[]).length>0||(player.relics||[]).length>0|(player.bonusSkills||[]).length>0;
        if(!hasItems){invList.innerHTML='<div style="color:#555;text-align:center;padding:20px;">장비가 없습니다.</div>';}
        else{
            const rl={legendary:{label:'LEGENDARY',color:'#e74c3c',bg:'#2d1a1a'},epic:{label:'EPIC',color:'#a55eea',bg:'#1e1a2d'},rare:{label:'RARE',color:'#1e90ff',bg:'#1a1e2d'},common:{label:'COMMON',color:'#888',bg:'#2a2a2a'}};
            let html='';
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
            const sorted=[...player.items].sort((a,b)=>(ro[a.rarity]||3)-(ro[b.rarity]||3));
            const rg={legendary:[],epic:[],rare:[],common:[]};
            sorted.forEach(it=>{(rg[it.rarity]||rg.common).push(it);});
            Object.entries(rg).forEach(([rarity,items])=>{
                if(!items.length)return;
                const{label,color,bg}=rl[rarity];
                html+=`<div style="margin-bottom:10px;"><div style="background:${bg};color:${color};font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">${label}</div>`;
                items.forEach(it=>{
                    const oi=player.items.indexOf(it);
                    const mercBtn=it.type==='merc'?(isMercenaryCaptainJob()?`<button type="button" onclick="useMercenarySlot(${oi})" style="margin-top:6px;background:#e67e22;color:#111;border:none;padding:4px 10px;font-size:0.75em;font-weight:700;border-radius:4px;cursor:pointer;">⚔️ 고용 (전투)</button>`:`<span style="color:#666;font-size:0.78em;">용병단장 전용</span>`):'';
                    html+=`<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid ${color};"><div style="color:${color};font-weight:700;font-size:0.9em;">${it.type==='merc'?'🛡️ ':''}${it.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;line-height:1.4;">${it.desc}</div>${mercBtn}</div>`;
                });
                html+=`</div>`;
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
    const sg=Math.floor(totalGoldEarned*0.1), ps=getSavedGold();
    localStorage.setItem('saved_gold',ps+sg); exitBattleLayout();
    document.getElementById('battle-area').style.display='none';
    document.querySelector('.screen').innerHTML=`<div style="text-align:center;padding:40px 20px;"><h2 style="color:#ff4757;font-size:2em;">💀 GAME OVER</h2><p style="color:#e0e0e0;font-size:1.1em;margin:15px 0;"><b style="color:#f1c40f;">${floor}층</b>에서 <b style="color:#ff4757;">${enemy?enemy.name:'알 수 없는 적'}</b>에게 쓰러졌습니다.</p><p style="color:#2ed573;font-size:0.95em;">💰 보존 골드: <b>${sg}G</b></p><button onclick="location.reload()" style="background:#ff4757;margin-top:20px;padding:12px 30px;font-size:1em;">🔄 다시 도전하기</button></div>`;
    writeLog(`💀 ${floor}층 게임 오버.`);
}
