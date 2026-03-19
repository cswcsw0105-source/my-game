// 🔥 파이어베이스 호환 설정
firebase.initializeApp({
    apiKey: "AIzaSyAVWf5U6eBm2ofCcvdirMxkyfZs_1uVIiU",
    authDomain: "project-dungeon-82f2a.firebaseapp.com",
    projectId: "project-dungeon-82f2a",
    storageBucket: "project-dungeon-82f2a.firebasestorage.app",
    messagingSenderId: "301367810513",
    appId: "1:301367810513:web:42979150db5ea7b536a8f0"
});

const auth = firebase.auth();
const db = firebase.firestore();

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

function getPermaStats() {
    return JSON.parse(localStorage.getItem('perma_stats') || '{"hp":0,"atk":0,"def":0,"acc":0,"potion":0}');
}
function savePermaStats(stats) {
    localStorage.setItem('perma_stats', JSON.stringify(stats));
}
function getPermaBuyCount() {
    return JSON.parse(localStorage.getItem('perma_buy_count') || '{}');
}
function savePermaBuyCount(counts) {
    localStorage.setItem('perma_buy_count', JSON.stringify(counts));
}

function getUnlockedFloors(job) {
    const key = job ? `unlocked_floors_${job}` : 'unlocked_floors_global';
    return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveUnlockedFloor(f, job) {
    const key = job ? `unlocked_floors_${job}` : 'unlocked_floors_global';
    const unlocked = getUnlockedFloors(job);
    if (!unlocked.includes(f)) {
        unlocked.push(f);
        localStorage.setItem(key, JSON.stringify(unlocked));
    }
}

function showAuthError(msg) {
    const errEl = document.getElementById('login-error');
    errEl.innerText = msg;
    errEl.style.display = 'block';
}

window.handleSignup = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    if (!email || pw.length < 6) return showAuthError("❌ 이메일 형식(ex: a@a.com)을 맞추고, 비밀번호는 6자리 이상이어야 합니다!");
    auth.createUserWithEmailAndPassword(email, pw)
        .then(() => { alert("가입 환영! 모험을 시작하세요."); })
        .catch(() => { showAuthError("❌ 가입 실패: 이미 있는 아이디거나 형식이 잘못되었습니다."); });
};

window.handleLogin = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    if (!email || !pw) return showAuthError("❌ 이메일과 비밀번호를 모두 입력해 주세요!");
    auth.signInWithEmailAndPassword(email, pw)
        .then(() => { writeLog("서버 로그인 완료!"); })
        .catch(() => { showAuthError("❌ 로그인 실패: 아이디나 비밀번호가 틀렸습니다."); });
};

window.handleLogout = () => {
    auth.signOut().then(() => { alert("로그아웃 되었습니다."); location.reload(); });
};

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-info').innerText = user.email.split('@')[0] + " 님";
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('login-area').style.display = 'none';
        showPreGameScreen();
        loadRank();
    } else {
        currentUser = null;
        document.getElementById('login-area').style.display = 'block';
        document.getElementById('start-area').style.display = 'none';
    }
});

function showPreGameScreen() {
    const savedGold = parseInt(localStorage.getItem('saved_gold') || '0');
    const perma = getPermaStats();
    const buyCounts = getPermaBuyCount();
    const globalUnlocked = getUnlockedFloors(null);
    const warriorUnlocked = getUnlockedFloors('워리어');
    const hunterUnlocked = getUnlockedFloors('헌터');
    const wizardUnlocked = getUnlockedFloors('마법사');

    document.getElementById('start-area').style.display = 'block';
    document.getElementById('start-area').innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <h2 style="color:#f1c40f; margin-bottom:5px;">⚔️ 던전 입장</h2>
            <p style="color:#888; font-size:0.85em;">보존 골드: <b style="color:#f1c40f;">${savedGold}G</b></p>
            ${globalUnlocked.length > 0 ? `<p style="color:#f1c40f; font-size:0.8em;">🔓 공용 해금: ${globalUnlocked.join(', ')}층</p>` : ''}
            ${warriorUnlocked.length > 0 ? `<p style="color:#ff4757; font-size:0.8em;">🔓 워리어: ${warriorUnlocked.join(', ')}층</p>` : ''}
            ${hunterUnlocked.length > 0 ? `<p style="color:#2ed573; font-size:0.8em;">🔓 헌터: ${hunterUnlocked.join(', ')}층</p>` : ''}
            ${wizardUnlocked.length > 0 ? `<p style="color:#1e90ff; font-size:0.8em;">🔓 마법사: ${wizardUnlocked.join(', ')}층</p>` : ''}
        </div>

        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px;">
            ${['Warrior','Hunter','Wizard'].map(job => `
                <div onclick="selectJobAndStart('${job}')"
                    style="background:#1a1a1a; border:2px solid ${jobBase[job].color}; border-radius:10px; padding:15px; cursor:pointer; text-align:center; transition:transform 0.15s;"
                    onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform='translateY(0)'">
                    <div style="color:${jobBase[job].color}; font-weight:700; font-size:1.1em; margin-bottom:8px;">${jobBase[job].name}</div>
                    <div style="color:#888; font-size:0.78em; line-height:1.6;">
                        HP: <b style="color:#2ed573;">${jobBase[job].hp + perma.hp}</b><br>
                        ATK: <b style="color:#f1c40f;">${jobBase[job].atk + perma.atk}</b><br>
                        DEF: <b style="color:#1e90ff;">${jobBase[job].def + perma.def}</b>
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="background:#1a1a1a; border:1px solid #333; border-radius:10px; padding:15px;">
            <h4 style="color:#f1c40f; margin:0 0 12px 0;">🏪 영구 강화 상점</h4>
            <div style="display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap;">
                ${[
                    { key: 'hp',  label: '❤️ 체력',   color: '#2ed573' },
                    { key: 'atk', label: '⚔️ 공격력', color: '#f1c40f' },
                    { key: 'def', label: '🛡️ 방어력', color: '#1e90ff' },
                    { key: 'acc', label: '🎯 명중률', color: '#a55eea' },
                    { key: 'pot', label: '🧪 포션',   color: '#e67e22' },
                ].map(cat => `
                    <button onclick="switchUpgradeTab('${cat.key}')"
                        id="tab_${cat.key}"
                        style="background:#1a1a2a; color:${cat.color}; border:1px solid ${cat.color}; border-radius:6px; padding:6px 12px; font-size:0.8em; font-weight:700; cursor:pointer;">
                        ${cat.label}
                    </button>
                `).join('')}
            </div>
            <div id="upgrade-list" style="max-height:220px; overflow-y:auto;"></div>
        </div>
    `;
    switchUpgradeTab('hp');
}

window.switchUpgradeTab = (key) => {
    const savedGold = parseInt(localStorage.getItem('saved_gold') || '0');
    const buyCounts = getPermaBuyCount();
    const catUpgrades = permanentUpgrades.filter(u => u.id.startsWith(key + '_'));

    ['hp','atk','def','acc','pot'].forEach(k => {
        const tab = document.getElementById(`tab_${k}`);
        if (tab) tab.style.opacity = k === key ? '1' : '0.4';
    });

    const list = document.getElementById('upgrade-list');
    if (!list) return;

    const totalBought = catUpgrades.filter(u => buyCounts[u.id]).length;
    const nextIdx = totalBought;

    list.innerHTML = catUpgrades.map((up, i) => {
        const bought = !!buyCounts[up.id];
        const isNext = i === nextIdx;
        const canAfford = savedGold >= up.price;
        const locked = i > nextIdx;

        let bg = '#1a1a1a', borderColor = '#333', textColor = '#888';
        if (bought) { bg = '#0a1a0a'; borderColor = '#2ed573'; textColor = '#2ed573'; }
        else if (isNext && canAfford) { bg = '#1a1a0a'; borderColor = '#f1c40f'; textColor = '#e0e0e0'; }
        else if (isNext && !canAfford) { borderColor = '#555'; textColor = '#666'; }
        else if (locked) { textColor = '#444'; }

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:${bg}; border:1px solid ${borderColor}; border-radius:6px; padding:8px 12px; margin-bottom:5px;">
                <div>
                    <span style="color:${textColor}; font-weight:700; font-size:0.85em;">
                        ${bought ? '✅' : locked ? '🔒' : '⬜'} ${up.name}
                    </span>
                    <div style="color:#555; font-size:0.75em;">${up.desc}</div>
                </div>
                <button onclick="buyPermUpgrade('${up.id}')"
                    ${bought || locked || !canAfford ? 'disabled' : ''}
                    style="background:${bought ? '#0a2a0a' : isNext && canAfford ? '#f1c40f' : '#222'};
                           color:${bought ? '#2ed573' : isNext && canAfford ? '#111' : '#444'};
                           padding:5px 12px; font-size:0.8em; font-weight:700; margin:0; border-radius:5px;
                           cursor:${bought || locked || !canAfford ? 'not-allowed' : 'pointer'}; white-space:nowrap;">
                    ${bought ? '완료' : locked ? '잠금' : up.price + 'G'}
                </button>
            </div>
        `;
    }).join('');
};

window.buyPermUpgrade = (id) => {
    const savedGold = parseInt(localStorage.getItem('saved_gold') || '0');
    const up = permanentUpgrades.find(u => u.id === id);
    if (!up) return;
    const buyCounts = getPermaBuyCount();
    if (buyCounts[id] || savedGold < up.price) return;

    const parts = id.split('_');
    const level = parseInt(parts[parts.length - 1]);
    const prefix = parts.slice(0, -1).join('_');
    if (level > 1 && !buyCounts[`${prefix}_${level - 1}`]) return;

    localStorage.setItem('saved_gold', savedGold - up.price);
    buyCounts[id] = true;
    savePermaBuyCount(buyCounts);

    const perma = getPermaStats();
    if (up.effect.hp)     perma.hp     += up.effect.hp;
    if (up.effect.atk)    perma.atk    += up.effect.atk;
    if (up.effect.def)    perma.def    += up.effect.def;
    if (up.effect.acc)    perma.acc    += up.effect.acc;
    if (up.effect.potion) perma.potion += up.effect.potion;
    savePermaStats(perma);

    switchUpgradeTab(prefix.replace('perm_', ''));
    showPreGameScreen();
};

window.selectJobAndStart = (job) => {
    const perma = getPermaStats();
    player = {
    ...jobBase[job],
    curHp: jobBase[job].hp + perma.hp,
    maxHp: jobBase[job].hp + perma.hp,
    atk: jobBase[job].atk + perma.atk,
    def: jobBase[job].def + perma.def,
    acc: perma.acc,
    crit: 5,        // 기본 치명타 확률 5%
    critMult: 1.8,  // 치명타 배율 180%
    items: [], extraAtk: 0, potions: perma.potion,
    extraDef: 0, unlockedSkill: null,
    lifesteal: 0, hasRegenPotion: false,
    baseJob: jobBase[job].name,
    evolved: false
};
    floor = 1;
    gold = 0;
    totalGoldEarned = 0;
    rerollCost = 10;
    document.getElementById('start-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    loadCollection();
    spawnEnemy();
};

function checkEvolution() {
    if (player.evolved) return;
    const baseJob = player.baseJob;
    if (jobEvolutions[baseJob]) {
        setTimeout(() => { showEvolutionChoice(jobEvolutions[baseJob]); }, 500);
    }
}

function showEvolutionChoice(evols) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:30px;max-width:460px;width:90%;text-align:center;">
            <h2 style="color:#f1c40f;margin-bottom:8px;">⚡ 10층 달성! 전직 선택</h2>
            <p style="color:#aaa;font-size:0.9em;margin-bottom:20px;">${player.name}의 새로운 길을 선택하세요.</p>
            ${evols.map((e, i) => `
                <div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:15px;margin-bottom:12px;cursor:pointer;transition:border-color 0.2s;"
                    onmouseenter="this.style.borderColor='#f1c40f'" onmouseleave="this.style.borderColor='#555'"
                    onclick="evolve(${i})">
                    <b style="color:#e0e0e0;font-size:1.1em;">${e.name}</b>
                    <p style="color:#888;font-size:0.85em;margin:6px 0 0;">${e.desc}</p>
                    <p style="color:#2ed573;font-size:0.8em;margin:4px 0 0;">
                        ATK: ${e.bonusAtk || '-'} / DEF: ${e.bonusDef || '-'} / HP: ${e.bonusHp || '-'}${e.bonusAcc ? ` / ACC: +${e.bonusAcc}%` : ''}
                    </p>
                </div>
            `).join('')}
        </div>
    `;
    document.body.appendChild(overlay);
    window._evolOptions = evols;
    window._evolOverlay = overlay;
}

window.evolve = (idx) => {
    const evol = window._evolOptions[idx];
    const oldName = player.name;
    const baseKey = player.baseJob === '워리어' ? 'Warrior' : player.baseJob === '헌터' ? 'Hunter' : 'Wizard';
    player.name = evol.name;
    player.evolved = true;
    player.atk = evol.bonusAtk || jobBase[baseKey].atk;
    player.def = evol.bonusDef || jobBase[baseKey].def;
    if (evol.bonusHp) { player.maxHp = evol.bonusHp; player.curHp = Math.min(player.curHp, player.maxHp); }
    if (evol.bonusAcc) player.acc = evol.bonusAcc;
    player.extraAtk = 0; player.extraDef = 0;
    player.items.forEach(it => {
        if (it.type === 'atk') player.atk += it.value;
        if (it.type === 'acc') player.acc += it.value;
        if (it.def) player.extraDef += it.def;
    });
    document.body.removeChild(window._evolOverlay);
    writeLog(`⚡ [전직] ${oldName} → <b style='color:#f1c40f'>${evol.name}</b>! 스탯 재설정 완료.`);
    updateUi(); renderActions();
};

function checkFloorUnlock(f) {
    const baseJob = player.baseJob;
    if (f % 10 === 0 && floorUnlocks[f]) {
        const globalUnlocked = getUnlockedFloors(null);
        if (!globalUnlocked.includes(f)) {
            saveUnlockedFloor(f, null);
            writeLog(`🔓 <b style='color:#f1c40f'>${f}층 달성!</b> 공용 아이템 [${floorUnlocks[f].name}] 해금!`);
        }
    }
    if (f % 5 === 0 && f % 10 !== 0) {
        let unlockItem = null;
        if (baseJob === '워리어' && floorUnlocks[f]) unlockItem = floorUnlocks[f];
        else if (baseJob === '헌터' && floorUnlocksHunter[f]) unlockItem = floorUnlocksHunter[f];
        else if (baseJob === '마법사' && floorUnlocksWizard[f]) unlockItem = floorUnlocksWizard[f];
        if (unlockItem) {
            const jobUnlocked = getUnlockedFloors(baseJob);
            if (!jobUnlocked.includes(f)) {
                saveUnlockedFloor(f, baseJob);
                writeLog(`🔓 <b style='color:#2ed573'>${f}층 달성!</b> ${player.name} 전용 [${unlockItem.name}] 해금!`);
            }
        }
    }
}

function spawnEnemy() {
    if (pendingShop) { pendingShop = false; return openShop(); }
    defendingTurns = 0; dodgingTurns = 0; shieldedTurns = 0;
    regenTurns = 0; regenAmount = 0;
    potionUsedThisTurn = false;

    if (floor % 10 === 0) {
        let bossHp, bossAtk, bossDef;
        if (floor <= 10) { bossHp = 200 + floor * 20; bossAtk = 12 + floor * 3; bossDef = 3 + Math.floor(floor / 3); }
        else if (floor <= 30) { bossHp = 400 + floor * 30; bossAtk = 20 + floor * 5; bossDef = 8 + Math.floor(floor / 2); }
        else if (floor <= 60) { bossHp = 800 + floor * 40; bossAtk = 35 + floor * 7; bossDef = 15 + Math.floor(floor / 2); }
        else { bossHp = 1500 + floor * 55; bossAtk = 60 + floor * 10; bossDef = 25 + Math.floor(floor / 2); }
        enemy = {
            name: `👑 [보스] ${floor}층 군주`, job: '보스',
            hp: bossHp, curHp: bossHp, atk: bossAtk, def: bossDef,
            isBoss: true, turnCount: 1, bossCharge: false
        };
        writeLog(`🚨 경고: ${floor}층의 지배자가 나타났습니다!`);
    } else {
        const eJobs = ['워리어', '헌터', '마법사'];
        let randomJob = eJobs[Math.floor(Math.random() * eJobs.length)];
        if (randomJob === lastEnemyJob) randomJob = eJobs[Math.floor(Math.random() * eJobs.length)];
        lastEnemyJob = randomJob;
        let mobHp, mobAtk, mobDef;
        if (floor <= 10) { mobHp = 30 + floor * 8; mobAtk = 5 + floor * 1.5; mobDef = Math.floor(floor / 4); }
        else if (floor <= 30) { mobHp = 100 + floor * 15; mobAtk = 18 + floor * 3; mobDef = 4 + Math.floor(floor / 3); }
        else if (floor <= 60) { mobHp = 300 + floor * 22; mobAtk = 35 + floor * 5; mobDef = 10 + Math.floor(floor / 2); }
        else { mobHp = 700 + floor * 30; mobAtk = 65 + floor * 8; mobDef = 20 + Math.floor(floor / 2); }
        enemy = {
            name: `[${randomJob}형] ${floor}층 괴수`, job: randomJob,
            hp: Math.floor(mobHp), curHp: Math.floor(mobHp),
            atk: Math.floor(mobAtk), def: Math.floor(mobDef),
            isBoss: false
        };
    }
    updateUi(); renderActions();
}

function renderActions() {
    const div = document.getElementById('action-btns');
    div.innerHTML = '';
    const atkBtn = document.createElement('button');
    atkBtn.innerText = '⚔️ 공격'; atkBtn.style.background = player.color;
    atkBtn.onclick = () => useAction('공격');
    div.appendChild(atkBtn);

    const defBtn = document.createElement('button');
    defBtn.style.background = '#888';
    const jobName = player.name;
    if (['워리어','나이트','버서커'].includes(jobName)) { defBtn.innerText = '🛡️ 방어 (70%)'; defBtn.onclick = () => useAction('방패방어'); }
    else if (['헌터','궁수','암살자'].includes(jobName)) { defBtn.innerText = '💨 회피 (75%)'; defBtn.onclick = () => useAction('회피'); }
    else if (['마법사','위저드','소환사'].includes(jobName)) { defBtn.innerText = '✨ 방어막 (60%)'; defBtn.onclick = () => useAction('방어막'); }
    div.appendChild(defBtn);

    if (player.unlockedSkill) {
        const skillBtn = document.createElement('button');
        skillBtn.innerText = `🔥 ${player.unlockedSkill}`; skillBtn.style.background = '#9b59b6';
        skillBtn.onclick = () => useAction('궁극기');
        div.appendChild(skillBtn);
    }
    const pBtn = document.createElement('button');
    pBtn.innerText = `🧪 포션 (${player.potions})`; pBtn.className = 'potion-btn';
    pBtn.onclick = usePotion;
    div.appendChild(pBtn);
}

window.useAction = (type) => {
    potionUsedThisTurn = false;
    if (type === '공격') {
    let multiplier = 1.0; let effectMsg = "";
    const relKey = relations[player.name] ? player.name : player.baseJob;
    if (!enemy.isBoss && relations[relKey]) {
        if (relations[relKey].strong === enemy.job) { multiplier = 1.5; effectMsg = "<b style='color:#2ed573'>(상성 우위!)</b> "; }
        else if (relations[relKey].weak === enemy.job) { multiplier = 0.8; effectMsg = "<b style='color:#ff4757'>(상성 열세..)</b> "; }
    }
    // 명중률 100% 캡
   const accRate = Math.min(95, 85 + player.acc);  
        // 최대 95%로 캡
    if (Math.random() * 100 < accRate) {
        let baseDmg = player.atk + player.extraAtk + Math.floor(Math.random() * 8);
        // 치명타 체크
        let isCrit = Math.random() * 100 < player.crit;
        if (isCrit) { baseDmg = Math.floor(baseDmg * player.critMult); effectMsg += "<b style='color:#f1c40f'>💥 치명타!</b> "; }
        let finalDmg = Math.max(1, Math.floor(baseDmg * multiplier) - enemy.def);
        enemy.curHp -= finalDmg;
        writeLog(`[명중] ${effectMsg}적에게 ${finalDmg} 피해!`);
        if (player.lifesteal > 0) {
            const heal = Math.floor(finalDmg * player.lifesteal);
            player.curHp = Math.min(player.maxHp, player.curHp + heal);
            writeLog(`[흡혈] 💉 ${heal} 체력 흡수!`);
        }
    } else writeLog(`[빗나감] 공격 실패!`);
    if (enemy.curHp <= 0) return winBattle();
    } else if (type === '궁극기') {
    let ultDmg = player.atk + player.extraAtk + 40;
    const isCrit = Math.random() * 100 < player.crit;
    if (isCrit) { ultDmg = Math.floor(ultDmg * player.critMult); }
    enemy.curHp -= ultDmg;
    writeLog(`[궁극기] ${player.unlockedSkill} 작렬!!! ${isCrit ? '💥 치명타! ' : ''}방어력 무시 ${ultDmg} 피해!`);
    if (player.lifesteal > 0) {
        const heal = Math.floor(ultDmg * player.lifesteal);
        player.curHp = Math.min(player.maxHp, player.curHp + heal);
        writeLog(`[흡혈] 💉 ${heal} 체력 흡수!`);
    }
    if (enemy.curHp <= 0) return winBattle();
    } else if (type === '방패방어') {
        if (Math.random() * 100 < 70) { defendingTurns = 2; writeLog(`[성공] 🛡️ 2턴간 피해 60% 감소!`); }
        else writeLog(`[실패] 방패 방어 실패!`);
    } else if (type === '회피') {
        dodgingTurns = 2; writeLog(`[회피기] 💨 2번의 공격을 75% 확률로 회피합니다!`);
    } else if (type === '방어막') {
        if (Math.random() * 100 < 60) { shieldedTurns = 2; writeLog(`[성공] ✨ 2턴간 피해 50% 감소!`); }
        else writeLog(`[실패] 방어막 전개 실패!`);
    }
    enemyTurn();
};

window.usePotion = () => {
    if (player.potions <= 0) return writeLog("소지한 포션이 없습니다!");
    if (potionUsedThisTurn) return writeLog("이번 턴에 이미 포션을 사용했습니다!");
    player.potions--;
    potionUsedThisTurn = true;
    if (player.hasRegenPotion) {
        regenTurns = 2;
        regenAmount = Math.floor(player.maxHp * 0.25);
        writeLog(`[포션] 🧪 서서히 회복 시작! (2턴간 매 턴 ${regenAmount} 회복, 총 ${regenAmount * 2})`);
    } else {
        let healAmount = Math.floor(player.maxHp * 0.35);
        player.curHp = Math.min(player.maxHp, player.curHp + healAmount);
        writeLog(`[포션] 🧪 즉시 체력 ${healAmount} 회복!`);
    }
    updateUi(); renderActions();
};

function enemyTurn() {
    setTimeout(() => {
        if (regenTurns > 0) {
            player.curHp = Math.min(player.maxHp, player.curHp + regenAmount);
            regenTurns--;
            writeLog(`[재생] 💚 ${regenAmount} 체력 회복! (남은 턴: ${regenTurns})`);
        }
        potionUsedThisTurn = false;
        let hitLanded = true;
        let currentEnemyAtk = enemy.atk;

        if (enemy.isBoss) {
            if (enemy.bossCharge) {
                writeLog(`💥 [강공격] 보스의 묵직한 일격!!`);
                currentEnemyAtk = enemy.atk * 2.5;
                enemy.bossCharge = false;
            } else if (enemy.turnCount % 4 === 3) {
                enemy.bossCharge = true;
                writeLog(`⚠️ [위험] 보스가 강공격을 준비합니다!`);
                enemy.turnCount++; updateUi(); return;
            }
            enemy.turnCount++;
        }

        if (dodgingTurns > 0) {
            dodgingTurns--;
            if (Math.random() * 100 < 75) { writeLog(`[회피 성공] 💨 적의 공격을 피했습니다!`); hitLanded = false; }
            else writeLog(`[회피 실패] 피하지 못했습니다!`);
        }
        if (hitLanded) {
            if (Math.random() * 100 < 80) {
                let dmg = Math.max(1, currentEnemyAtk - (player.def + player.extraDef));
                if (shieldedTurns > 0) {
                    dmg = Math.floor(dmg * 0.5); shieldedTurns--;
                    writeLog(`[방어막] ✨ 피해 50% 감소! (${dmg} 입음)`);
                } else if (defendingTurns > 0) {
                    dmg = Math.floor(dmg * 0.4); defendingTurns--;
                    writeLog(`[철벽 방어] 🛡️ 피해 60% 감소! (${dmg} 입음)`);
                } else writeLog(`[피격] 적의 공격! ${dmg} 데미지.`);
                player.curHp -= dmg;
            } else writeLog(`[럭키] 적의 공격이 빗나갔습니다!`);
        }
        if (player.curHp <= 0) return gameOver();
        updateUi();
    }, 400);
}

function winBattle() {
    let baseGain;
    if (floor <= 10) {
        baseGain = enemy.isBoss ? 50 + floor * 5 : 28 + Math.floor(Math.random() * 8) + floor * 2;
    } else {
        baseGain = enemy.isBoss
            ? 65 + Math.floor(Math.random() * 30) + floor * 4
            : 14 + Math.floor(Math.random() * 12) + Math.floor(floor * 1.2);
    }
    let bonus = 0; let bonusMsg = "";
    const relKey = relations[player.name] ? player.name : player.baseJob;
    if (!enemy.isBoss && relations[relKey] && relations[relKey].weak === enemy.job) {
        bonus = Math.floor(baseGain * 0.3);
        bonusMsg = ` <b style='color:#f1c40f'>(역전 보너스 +${bonus}G!)</b>`;
    }
    const gain = baseGain + bonus;
    gold += gain;
    totalGoldEarned += gain;
    player.curHp = Math.min(player.maxHp, player.curHp + Math.floor(player.maxHp * 0.15));
    writeLog(`[승리] ${gain}G 획득 및 체력 소량 회복.${bonusMsg}`);

    if (floor === 100 && enemy.isBoss) return dungeonClear();

    const clearedFloor = floor;
    floor++;
    checkFloorUnlock(clearedFloor);

    if (clearedFloor === 10 && !player.evolved) {
        if (floor > 1 && floor % 3 === 0) pendingShop = true;
        spawnEnemy();
        setTimeout(() => checkEvolution(), 300);
        return;
    }

    if (floor > 1 && floor % 3 === 0) pendingShop = true;
    spawnEnemy();
}

function openShop() {
    document.getElementById('battle-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'block';
    rerollCost = 10;
    updateUi(); renderShopItems();
}

window.nextFloor = () => {
    document.getElementById('shop-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    spawnEnemy();
};

function getUnlockedPoolItems() {
    const baseJob = player.baseJob;
    const result = [];
    const globalUnlocked = getUnlockedFloors(null);
    globalUnlocked.forEach(f => {
        if (f % 10 === 0 && floorUnlocks[f]) result.push(floorUnlocks[f]);
    });
    const jobUnlocked = getUnlockedFloors(baseJob);
    jobUnlocked.forEach(f => {
        if (f % 5 === 0 && f % 10 !== 0) {
            if (baseJob === '워리어' && floorUnlocks[f]) result.push(floorUnlocks[f]);
            else if (baseJob === '헌터' && floorUnlocksHunter[f]) result.push(floorUnlocksHunter[f]);
            else if (baseJob === '마법사' && floorUnlocksWizard[f]) result.push(floorUnlocksWizard[f]);
        }
    });
    return result;
}

function getItemsByRarity() {
    const rand = Math.random() * 100;
    if (rand < 5)  return equipmentPool.filter(i => i.rarity === 'legendary');
    if (rand < 20) return equipmentPool.filter(i => i.rarity === 'epic');
    if (rand < 50) return equipmentPool.filter(i => i.rarity === 'rare');
    return equipmentPool.filter(i => i.rarity === 'common');
}

function renderShopItems() {
    const list = document.getElementById('shop-list');
    list.innerHTML = '';
    currentShopItems = [{ name: "치유 포션", type: "potion", value: 80, price: 40, rarity: "common", desc: "최대 체력의 35%를 즉시 회복합니다." }];

    const unlockedItems = getUnlockedPoolItems();
    const picked = [];
    let tries = 0;

    if (unlockedItems.length > 0) {
        const randUnlocked = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
        if (!player.items.some(i => i.name === randUnlocked.name)) picked.push(randUnlocked);
    }

    while (picked.length < 3 && tries < 50) {
        tries++;
        const pool = getItemsByRarity();
        if (!pool.length) continue;
        const item = pool[Math.floor(Math.random() * pool.length)];
        if (picked.some(i => i.name === item.name)) continue;
        if (item.onlyFor) {
            const allowed = Array.isArray(item.onlyFor) ? item.onlyFor : [item.onlyFor];
            if (!allowed.includes(player.name) && !allowed.includes(player.baseJob)) continue;
        }
        picked.push(item);
    }
    currentShopItems.push(...picked);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-top:12px;';

    currentShopItems.forEach((it, idx) => {
        const d = document.createElement('div');
        let borderColor = '#444', badgeColor = '#888', badgeBg = '#2a2a2a', badgeText = 'COMMON';
        if (it.rarity === 'legendary') { borderColor = '#e74c3c'; badgeColor = '#e74c3c'; badgeBg = '#2d1a1a'; badgeText = 'LEGENDARY'; }
        else if (it.rarity === 'epic') { borderColor = '#a55eea'; badgeColor = '#a55eea'; badgeBg = '#1e1a2d'; badgeText = 'EPIC'; }
        else if (it.rarity === 'rare') { borderColor = '#1e90ff'; badgeColor = '#1e90ff'; badgeBg = '#1a1e2d'; badgeText = 'RARE'; }
        let nameColor = '#e0e0e0';
        if (it.rarity === 'legendary') nameColor = '#e74c3c';
        else if (it.rarity === 'epic') nameColor = '#a55eea';
        else if (it.rarity === 'rare') nameColor = '#1e90ff';
        let typeIcon = '🎒';
        if (it.type === 'atk') typeIcon = '⚔️';
        else if (it.type === 'hp') typeIcon = '🛡️';
        else if (it.type === 'acc') typeIcon = '🎯';
        else if (it.type === 'potion') typeIcon = '🧪';
        if (it.lifesteal) typeIcon = '🩸';
        if (it.regenPotion) typeIcon = '💚';
        const isUnlocked = getUnlockedPoolItems().some(u => u.name === it.name);

        d.style.cssText = `background:#1a1a1a; border:1px solid ${borderColor}; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:8px; transition:transform 0.15s; cursor:default;`;
        d.onmouseenter = () => d.style.transform = 'translateY(-2px)';
        d.onmouseleave = () => d.style.transform = 'translateY(0)';
        d.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="background:${badgeBg}; color:${badgeColor}; border:1px solid ${borderColor}; border-radius:4px; font-size:0.7em; font-weight:700; padding:2px 7px; letter-spacing:1px;">${isUnlocked ? '🔓 ' : ''}${badgeText}</span>
                <span style="font-size:1.3em;">${typeIcon}</span>
            </div>
            <div style="color:${nameColor}; font-weight:700; font-size:1em; line-height:1.3;">${it.name}</div>
            <div style="color:#888; font-size:0.78em; line-height:1.5; flex:1;">${it.desc}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <span style="color:#f1c40f; font-weight:700; font-size:1em;">💰 ${it.price}G</span>
                <button onclick="buyItem(event, ${idx})" style="background:#f1c40f; color:#111; padding:6px 14px; font-size:0.85em; font-weight:700; margin:0; border-radius:6px;">구매</button>
            </div>
        `;
        grid.appendChild(d);
    });

    list.appendChild(grid);
    const rerollBtn = document.createElement('button');
    rerollBtn.className = 'reroll-btn';
    rerollBtn.innerText = `🔄 다시 돌리기 (${rerollCost}G)`;
    rerollBtn.onclick = rerollShop;
    list.appendChild(rerollBtn);
}

window.rerollShop = () => {
    if (gold < rerollCost) return writeLog(`[상점] 골드가 부족합니다.`);
    gold -= rerollCost; rerollCost += 10;
    writeLog(`[상점] 리롤 완료!`);
    updateUi(); renderShopItems();
};

function saveCollection(itemName) {
    let collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
    if (!collection.includes(itemName)) {
        collection.push(itemName);
        localStorage.setItem('item_collection_v5', JSON.stringify(collection));
        loadCollection();
    }
}

function loadCollection() {
    const collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
    document.getElementById('collection-count').innerText = `${collection.length} / ${equipmentPool.length}`;
}

window.buyItem = (event, idx) => {
    const it = currentShopItems[idx];
    if (gold < it.price) return writeLog("골드 부족!");
    gold -= it.price;
    if (it.type === 'potion') {
        player.potions++;
        writeLog(`[상점] 포션 구매 완료.`);
    } else {
        if (!player.items.some(i => i.name === it.name)) {
            player.items.push(it);
            saveCollection(it.name);
            if (it.type === 'atk') player.atk += it.value;
            if (it.type === 'hp') { player.maxHp += it.value; player.curHp += it.value; }
            if (it.type === 'acc') player.acc += it.value;
            if (it.def) player.extraDef += it.def;
            if (it.acc) player.acc += it.acc;
            if (it.lifesteal) player.lifesteal = (player.lifesteal || 0) + it.lifesteal;
            if (it.regenPotion) player.hasRegenPotion = true;
            if (it.penalty && it.penalty[player.name]) {
                player.acc -= it.penalty[player.name];
                writeLog(`[패널티] 명중률 -${it.penalty[player.name]}% 적용`);
            }
            if (it.critBonus) player.crit = (player.crit || 5) + it.critBonus;
            if (it.critMult)  player.critMult = (player.critMult || 1.8) + it.critMult;
            if (it.unlockSkill) {
                player.unlockedSkill = it.unlockSkill;
                writeLog(`[스킬 해제] 🔥 ${it.unlockSkill} 스킬 획득!`);
            }
            writeLog(`[상점] ${it.name} 장착 완료!`);
        } else {
            writeLog(`이미 보유한 장비입니다!`);
            gold += it.price;
        }
    }
    updateUi(); renderActions();
};

async function saveRank() {
    if (!currentUser) return;
    try {
        const baseJob = player.baseJob || player.name;
        const userEmail = currentUser.email.split('@')[0];
        const existing = await db.collection("global_ranks")
            .where("email", "==", userEmail)
            .where("baseJob", "==", baseJob)
            .get();
        let shouldSave = true;
        existing.forEach(doc => { if (doc.data().floor >= floor) shouldSave = false; });
        if (!shouldSave) return;
        const batch = db.batch();
        existing.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        await db.collection("global_ranks").add({
            email: userEmail, job: player.name, baseJob: baseJob,
            floor: floor, killer: enemy ? enemy.name : "알 수 없음",
            date: new Date().toLocaleDateString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) { console.error("랭킹 저장 에러: ", e); }
}

async function loadRank() {
    try {
        if (!currentUser) {
            document.getElementById('rank-list').innerHTML = '<span style="color:#555;">로그인 후 확인 가능합니다.</span>';
            return;
        }
        const jobs = ['워리어', '헌터', '마법사'];
        let html = '';
        for (const job of jobs) {
            const snapshot = await db.collection("global_ranks")
                .where("baseJob", "==", job)
                .orderBy("floor", "desc")
                .limit(3)
                .get();
            let jobColor = '#ff4757';
            if (job === '헌터') jobColor = '#2ed573';
            else if (job === '마법사') jobColor = '#1e90ff';
            html += `<div style="margin-bottom:16px;">
                <b style="color:${jobColor}; font-size:0.95em; border-bottom:1px solid #333; display:block; padding-bottom:4px; margin-bottom:8px;">⚔️ ${job} 랭킹</b>`;
            if (snapshot.empty) {
                html += `<div style="color:#555; font-size:0.85em;">기록 없음</div>`;
            } else {
                let rank = 1;
                snapshot.forEach(doc => {
                    const r = doc.data();
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
                    const jobDisplay = r.job !== r.baseJob ? `${r.baseJob}→${r.job}` : r.job;
                    html += `<div style="margin-bottom:6px; font-size:0.85em;">
                        ${medal} <b style="color:#e0e0e0;">${r.floor}층</b>
                        <span style="color:#888;"> (${jobDisplay})</span>
                        <span style="color:#aaa;"> 👤${r.email}</span><br>
                        <span style="color:#ff4757; font-size:0.8em; margin-left:18px;">💀 ${r.killer}</span>
                    </div>`;
                    rank++;
                });
            }
            html += `</div>`;
        }
        document.getElementById('rank-list').innerHTML = html;
    } catch (e) {
        document.getElementById('rank-list').innerHTML = '랭킹 서버 연결 실패';
    }
}

window.togglePatchNotes = (show) => { document.getElementById('patch-modal').style.display = show ? 'flex' : 'none'; };
window.toggleRank = (show) => {
    document.getElementById('rank-modal').style.display = show ? 'flex' : 'none';
    if (show) loadRank();
};
window.toggleInv = (show) => {
    document.getElementById('inv-modal').style.display = show ? 'flex' : 'none';
};
window.toggleCollection = (show) => {
    if (show) {
        const collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
        const allItems = [...equipmentPool, ...Object.values(floorUnlocks), ...Object.values(floorUnlocksHunter), ...Object.values(floorUnlocksWizard)];
        const rarityLabels = {
            legendary: { label: 'LEGENDARY', color: '#e74c3c', bg: '#2d1a1a' },
            epic:      { label: 'EPIC',      color: '#a55eea', bg: '#1e1a2d' },
            rare:      { label: 'RARE',      color: '#1e90ff', bg: '#1a1e2d' },
            common:    { label: 'COMMON',    color: '#888',    bg: '#2a2a2a' },
        };
        const groups = { legendary: [], epic: [], rare: [], common: [] };
        allItems.forEach(it => {
            if (it && it.name) {
                const owned = collection.includes(it.name);
                (groups[it.rarity] || groups.common).push({ ...it, owned });
            }
        });
        let html = `<p style="color:#888; font-size:0.85em; margin-bottom:15px;">획득한 아이템: <b style="color:#f1c40f;">${collection.length}</b> / ${allItems.filter(i=>i&&i.name).length}</p>`;
        Object.entries(groups).forEach(([rarity, items]) => {
            if (items.length === 0) return;
            const { label, color, bg } = rarityLabels[rarity];
            html += `<div style="margin-bottom:12px;"><div style="background:${bg}; color:${color}; font-size:0.7em; font-weight:700; padding:3px 8px; border-radius:4px; display:inline-block; margin-bottom:6px; letter-spacing:1px;">${label}</div>`;
            items.forEach(it => {
                html += `<div style="padding:8px 10px; background:#111; border-radius:6px; margin-bottom:4px; border-left:3px solid ${color}; opacity:${it.owned ? '1' : '0.3'};">
                    <div style="color:${color}; font-weight:700; font-size:0.9em;">${it.owned ? '✅' : '🔒'} ${it.name}</div>
                    <div style="color:#666; font-size:0.78em; margin-top:3px;">${it.desc}</div>
                </div>`;
            });
            html += `</div>`;
        });
        document.getElementById('collection-list').innerHTML = html;
    }
    document.getElementById('collection-modal').style.display = show ? 'flex' : 'none';
};
window.onclick = function(event) {
    if (event.target === document.getElementById('patch-modal')) togglePatchNotes(false);
    if (event.target === document.getElementById('rank-modal')) toggleRank(false);
    if (event.target === document.getElementById('inv-modal')) toggleInv(false);
    if (event.target === document.getElementById('collection-modal')) toggleCollection(false);
};

function updateUi() {
    if (!player || !enemy) return;
    document.getElementById('p-name').innerText = player.name;
    document.getElementById('p-hp').style.width = `${Math.max(0, (player.curHp / player.maxHp) * 100)}%`;
    document.getElementById('p-hp-t').innerText = `${Math.max(0, player.curHp)} / ${player.maxHp}`;
    document.getElementById('p-atk-val').innerText = player.atk + player.extraAtk;
    document.getElementById('p-def-val').innerText = player.def + player.extraDef;
    document.getElementById('p-acc-val').innerText = `${85 + player.acc}%`;
    document.getElementById('e-name').innerText = enemy.name;
    document.getElementById('e-hp').style.width = `${Math.max(0, (enemy.curHp / enemy.hp) * 100)}%`;
    document.getElementById('e-hp-t').innerText = `${Math.max(0, enemy.curHp)} / ${enemy.hp}`;
    document.getElementById('e-atk-val').innerText = enemy.atk;
    document.getElementById('e-def-val').innerText = enemy.def;
    document.getElementById('floor-t').innerText = floor;
    document.getElementById('gold-t').innerText = gold;
    document.getElementById('potion-t').innerText = player.potions;
    document.getElementById('shop-hp-t').innerText = `${Math.max(0, player.curHp)}/${player.maxHp}`;
    document.getElementById('shop-gold-t').innerText = gold;
    document.getElementById('p-acc-val').innerText = `${Math.min(100, 85 + player.acc)}%`;
    document.getElementById('p-crit-val').innerText = `${player.crit || 5}%`;
    document.getElementById('p-lifesteal-val').innerText = `${Math.round((player.lifesteal || 0) * 100)}%`;
    document.getElementById('p-acc-val').innerText = `${Math.min(100, 85 + player.acc)}%`;
    document.getElementById('p-crit-val').innerText = `${player.crit || 5}%`;
    document.getElementById('p-lifesteal-val').innerText = `${Math.round((player.lifesteal || 0) * 100)}%`;

    const collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
    document.getElementById('collection-count').innerText = `${collection.length} / ${equipmentPool.length}`;

    const invList = document.getElementById('inv-list');
    if (player.items.length === 0) {
        invList.innerHTML = '<div style="color:#555; text-align:center; padding:20px;">장비가 없습니다.</div>';
    } else {
        const rarityOrder = { 'legendary': 0, 'epic': 1, 'rare': 2, 'common': 3 };
        const sorted = [...player.items].sort((a, b) => (rarityOrder[a.rarity] || 3) - (rarityOrder[b.rarity] || 3));
        const rarityGroups = { legendary: [], epic: [], rare: [], common: [] };
        sorted.forEach(it => { (rarityGroups[it.rarity] || rarityGroups.common).push(it); });
        const rarityLabels = {
            legendary: { label: 'LEGENDARY', color: '#e74c3c', bg: '#2d1a1a' },
            epic:      { label: 'EPIC',      color: '#a55eea', bg: '#1e1a2d' },
            rare:      { label: 'RARE',      color: '#1e90ff', bg: '#1a1e2d' },
            common:    { label: 'COMMON',    color: '#888',    bg: '#2a2a2a' },
        };
        let html = '';
        Object.entries(rarityGroups).forEach(([rarity, items]) => {
            if (items.length === 0) return;
            const { label, color, bg } = rarityLabels[rarity];
            html += `<div style="margin-bottom:10px;"><div style="background:${bg}; color:${color}; font-size:0.7em; font-weight:700; padding:3px 8px; border-radius:4px; display:inline-block; margin-bottom:6px; letter-spacing:1px;">${label}</div>`;
            items.forEach(it => {
                html += `<div style="padding:8px 10px; background:#111; border-radius:6px; margin-bottom:4px; border-left:3px solid ${color};">
                    <div style="color:${color}; font-weight:700; font-size:0.9em;">${it.name}</div>
                    <div style="color:#666; font-size:0.78em; margin-top:3px; line-height:1.4;">${it.desc}</div>
                </div>`;
            });
            html += `</div>`;
        });
        invList.innerHTML = html;
    }
}

function writeLog(msg) {
    const log = document.getElementById('log');
    log.innerHTML = `<p style="margin:4px 0; border-bottom:1px solid #333; padding-bottom:4px;">${msg}</p>` + log.innerHTML;
}

function dungeonClear() {
    saveRank();
    const savedGold = Math.floor(totalGoldEarned * 0.1);
    const prevSaved = parseInt(localStorage.getItem('saved_gold') || '0');
    localStorage.setItem('saved_gold', prevSaved + savedGold);
    document.getElementById('battle-area').style.display = 'none';
    const screen = document.querySelector('.screen');
    screen.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
            <h2 style="color:#f1c40f; font-size:2em;">🏆 던전 클리어!</h2>
            <p style="color:#e0e0e0; font-size:1.1em; margin:15px 0;">
                <b style="color:#f1c40f;">${player.name}</b>이(가) 100층을 정복했습니다!
            </p>
            <p style="color:#2ed573; font-size:0.95em; margin-bottom:5px;">💰 보존 골드: <b>${savedGold}G</b></p>
            <p style="color:#888; font-size:0.85em; margin-bottom:25px;">전설로 기록되었습니다.</p>
            <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                <button onclick="startInfiniteMode()" style="background:#9b59b6; color:#fff; padding:14px 24px; font-size:1em; font-weight:700;">♾️ 무한모드 도전</button>
                <button onclick="location.reload()" style="background:#f1c40f; color:#111; padding:14px 24px; font-size:1em; font-weight:700;">🏠 메인으로 돌아가기</button>
            </div>
            <p style="color:#555; font-size:0.8em; margin-top:15px;">무한모드: 101층부터 끝없이 계속됩니다.</p>
        </div>
    `;
    writeLog(`🏆 ${player.name}이(가) 100층을 클리어했습니다!!!`);
}

window.startInfiniteMode = () => {
    floor = 101;
    document.querySelector('.screen').innerHTML = '';
    document.getElementById('battle-area').style.display = 'block';
    writeLog(`♾️ [무한모드] 101층부터 끝없는 도전이 시작됩니다!`);
    spawnEnemy();
    updateUi();
};

function gameOver() {
    saveRank();
    const savedGold = Math.floor(totalGoldEarned * 0.1);
    const prevSaved = parseInt(localStorage.getItem('saved_gold') || '0');
    localStorage.setItem('saved_gold', prevSaved + savedGold);
    document.getElementById('battle-area').style.display = 'none';
    const screen = document.querySelector('.screen');
    screen.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
            <h2 style="color:#ff4757; font-size:2em;">💀 GAME OVER</h2>
            <p style="color:#e0e0e0; font-size:1.1em; margin:15px 0;">
                <b style="color:#f1c40f;">${floor}층</b>에서 
                <b style="color:#ff4757;">${enemy ? enemy.name : '알 수 없는 적'}</b>에게 쓰러졌습니다.
            </p>
            <p style="color:#2ed573; font-size:0.95em;">💰 보존 골드: <b>${savedGold}G</b> (다음 게임에 사용 가능)</p>
            <p style="color:#888; font-size:0.9em;">기록이 명예의 전당에 저장되었습니다.</p>
            <button onclick="location.reload()" style="background:#ff4757; margin-top:20px; padding:12px 30px; font-size:1em;">🔄 다시 도전하기</button>
        </div>
    `;
    writeLog(`💀 ${floor}층 게임 오버. ${enemy ? enemy.name : ''}에게 패배.`);
}
