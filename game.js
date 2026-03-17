// 🔥 1. Firebase 서버 모듈 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 2. 선웅이가 직접 발급받은 서버 마스터 열쇠!
const firebaseConfig = {
  apiKey: "AIzaSyAVWf5U6eBm2ofCcvdirMxkyfZs_1uVIiU",
  authDomain: "project-dungeon-82f2a.firebaseapp.com",
  projectId: "project-dungeon-82f2a",
  storageBucket: "project-dungeon-82f2a.firebasestorage.app",
  messagingSenderId: "301367810513",
  appId: "1:301367810513:web:42979150db5ea7b536a8f0",
  measurementId: "G-8JPW5N59QX"
};

// 🔥 3. 서버 연결 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 기존 게임 변수들
let floor = 1, gold = 0, player = null, enemy = null;
let defendingTurns = 0, dodgingTurns = 0, shieldedTurns = 0;
let currentShopItems = []; 
let lastEnemyJob = ""; 
let rerollCost = 10;
let currentUser = null; // 현재 로그인한 유저 정보

// 🔥 4. 로그인/회원가입 로직
window.handleSignup = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    createUserWithEmailAndPassword(auth, email, pw)
        .then((userCredential) => { alert("가입 환영! 모험을 시작하세요."); })
        .catch((error) => { alert("가입 실패: " + error.message); });
};

window.handleLogin = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    signInWithEmailAndPassword(auth, email, pw)
        .then((userCredential) => { writeLog("서버 로그인 완료!"); })
        .catch((error) => { alert("로그인 실패: 아이디나 비번을 확인하세요."); });
};

window.handleLogout = () => {
    signOut(auth).then(() => { alert("로그아웃 되었습니다."); location.reload(); });
};

// 로그인 상태 감지기 (접속하면 바로 실행됨)
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-info').innerText = user.email.split('@')[0] + " 님";
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('start-area').style.display = 'block';
        loadRank(); // 로그인 성공하면 랭킹 불러오기
    } else {
        currentUser = null;
        document.getElementById('login-area').style.display = 'block';
        document.getElementById('start-area').style.display = 'none';
    }
});

// 🔥 5. 서버에 랭킹 저장 & 불러오기 로직
async function saveRank() {
    if (!currentUser) return;
    try {
        await addDoc(collection(db, "global_ranks"), {
            email: currentUser.email.split('@')[0],
            job: player.name,
            floor: floor,
            killer: enemy ? enemy.name : "알 수 없음",
            date: new Date().toLocaleDateString(),
            timestamp: new Date() // 정렬을 위한 타임스탬프
        });
    } catch (e) { console.error("랭킹 저장 에러: ", e); }
}

async function loadRank() {
    try {
        // 서버에서 가장 높은 층수 기준으로 상위 5명 불러오기!
        const q = query(collection(db, "global_ranks"), orderBy("floor", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        let html = "";
        querySnapshot.forEach((doc) => {
            const r = doc.data();
            html += `<div style="margin-bottom:8px; border-bottom:1px dashed #333; padding-bottom:5px;">
                        <b style="color:#e0e0e0;">${r.floor}층 (${r.job}) - 👤${r.email}</b><br>
                        <span style="color:#ff4757;">💀 사인: ${r.killer}</span>
                    </div>`;
        });
        document.getElementById('rank-list').innerHTML = html || '아직 기록이 없습니다. 첫 1위를 차지하세요!';
    } catch (e) {
        document.getElementById('rank-list').innerHTML = '랭킹 서버 연결 실패';
    }
}

// ================= 여기서부터는 기존 게임 로직 =================
window.togglePatchNotes = (show) => { document.getElementById('patch-modal').style.display = show ? 'flex' : 'none'; };
window.onclick = function(event) { if (event.target === document.getElementById('patch-modal')) togglePatchNotes(false); };

window.startGame = (job) => {
    player = { ...jobBase[job], curHp: jobBase[job].hp, maxHp: jobBase[job].hp, acc: 0, items: [], extraAtk: 0, potions: 0, extraDef: 0, unlockedSkill: null };
    document.getElementById('start-area').style.display = 'none'; document.getElementById('battle-area').style.display = 'block';
    loadCollection(); spawnEnemy();
};

function spawnEnemy() {
    if (floor > 1 && floor % 3 === 0 && document.getElementById('shop-area').style.display === 'none') return openShop();
    defendingTurns = 0; dodgingTurns = 0; shieldedTurns = 0;
    const eJobs = ['워리어', '헌터', '마법사'];
    let randomJob = eJobs[Math.floor(Math.random() * eJobs.length)];
    if (randomJob === lastEnemyJob) randomJob = eJobs[Math.floor(Math.random() * eJobs.length)];
    lastEnemyJob = randomJob;

    enemy = { name: `[${randomJob}형] ${floor}층 괴수`, job: randomJob, hp: 50 + floor*15, curHp: 50 + floor*15, atk: 12 + floor*3, def: 2 + Math.floor(floor/2) };
    updateUi(); renderActions();
}

function renderActions() {
    const div = document.getElementById('action-btns'); div.innerHTML = '';
    const atkBtn = document.createElement('button'); atkBtn.innerText = '⚔️ 공격'; atkBtn.style.background = player.color; atkBtn.onclick = () => useAction('공격'); div.appendChild(atkBtn);
    const defBtn = document.createElement('button'); defBtn.style.background = '#888';
    if (player.name === '워리어') { defBtn.innerText = '🛡️ 방어 (80%)'; defBtn.onclick = () => useAction('방패방어'); } 
    else if (player.name === '헌터') { defBtn.innerText = '💨 회피 (60%)'; defBtn.onclick = () => useAction('회피'); } 
    else if (player.name === '마법사') { defBtn.innerText = '✨ 방어막 (70%)'; defBtn.onclick = () => useAction('방어막'); }
    div.appendChild(defBtn);

    if (player.unlockedSkill) {
        const skillBtn = document.createElement('button'); skillBtn.innerText = `🔥 ${player.unlockedSkill}`; skillBtn.style.background = '#9b59b6'; skillBtn.onclick = () => useAction('궁극기'); div.appendChild(skillBtn);
    }
    const pBtn = document.createElement('button'); pBtn.innerText = `🧪 포션 (${player.potions})`; pBtn.className = 'potion-btn'; pBtn.onclick = usePotion; div.appendChild(pBtn);
}

window.useAction = (type) => {
    if (type === '공격') {
        let multiplier = 1.0; let effectMsg = "";
        if (relations[player.name].strong === enemy.job) { multiplier = 1.5; effectMsg = "<b style='color:#2ed573'>(상성 우위!)</b> "; } 
        else if (relations[player.name].weak === enemy.job) { multiplier = 0.8; effectMsg = "<b style='color:#ff4757'>(상성 열세..)</b> "; }

        if (Math.random() * 100 < (90 + player.acc)) {
            let baseDmg = player.atk + player.extraAtk + Math.floor(Math.random()*10);
            let finalDmg = Math.max(1, Math.floor(baseDmg * multiplier) - enemy.def);
            enemy.curHp -= finalDmg; writeLog(`[명중] ${effectMsg}적에게 ${finalDmg} 피해!`);
        } else writeLog(`[빗나감] 공격 실패!`);
        if (enemy.curHp <= 0) return winBattle();
    } else if (type === '궁극기') {
        let ultDmg = player.atk + player.extraAtk + 40; enemy.curHp -= ultDmg; writeLog(`[궁극기] ${player.unlockedSkill} 작렬!!! 적에게 방어력을 무시하는 ${ultDmg} 피해!`);
        if (enemy.curHp <= 0) return winBattle();
    } else if (type === '방패방어') {
        if (Math.random() * 100 < 80) { defendingTurns = 2; writeLog(`[성공] 2턴간 피해 70% 감소 방어 태세!`); } else writeLog(`[실패] 방패 방어 실패!`);
    } else if (type === '회피') { dodgingTurns = 2; writeLog(`[회피기] 2턴 동안 60% 확률로 피합니다!`);
    } else if (type === '방어막') {
        if (Math.random() * 100 < 70) { shieldedTurns = 2; writeLog(`[성공] 2턴 동안 데미지 1회 무효화!`); } else writeLog(`[실패] 방어막 전개 실패!`);
    }
    enemyTurn();
};

window.usePotion = () => {
    if (player.potions <= 0) return writeLog("소지한 포션이 없습니다!");
    player.potions--; player.curHp = Math.min(player.maxHp, player.curHp + 80); writeLog(`[아이템] 🧪 포션 사용! (체력 80 회복)`); updateUi(); renderActions();
};

function enemyTurn() {
    setTimeout(() => {
        let hitLanded = true;
        if (dodgingTurns > 0) { dodgingTurns--; if (Math.random() * 100 < 60) { writeLog(`[회피 성공] 💨 공격을 피했습니다!`); hitLanded = false; } else writeLog(`[회피 실패] 피하지 못했습니다!`); } 
        else if (shieldedTurns > 0) { shieldedTurns--; writeLog(`[방어막] ✨ 방어막이 데미지를 무효화했습니다!`); hitLanded = false; }

        if (hitLanded) {
            if (Math.random() * 100 < 85) {
                let dmg = Math.max(1, enemy.atk - (player.def + player.extraDef));
                if(defendingTurns > 0) { dmg = Math.floor(dmg * 0.3); defendingTurns--; writeLog(`[철벽 방어] 🛡️ 데미지 경감! (${dmg} 입음)`); } 
                else writeLog(`[피격] 적의 공격! ${dmg} 데미지 입음.`); player.curHp -= dmg;
            } else writeLog(`[운 좋음] 럭키! 적의 공격이 허공을 갈랐습니다!`);
        }
        if (player.curHp <= 0) gameOver();
        updateUi();
    }, 400);
}

function winBattle() {
    const gain = 30 + Math.floor(Math.random()*20); gold += gain; player.curHp = Math.min(player.maxHp, player.curHp + Math.floor(player.maxHp * 0.15));
    writeLog(`[승리] ${gain}G 획득 및 체력 소량 회복.`); floor++; spawnEnemy();
}

function openShop() { document.getElementById('battle-area').style.display = 'none'; document.getElementById('shop-area').style.display = 'block'; updateUi(); renderShopItems(); }

function renderShopItems() {
    const list = document.getElementById('shop-list'); list.innerHTML = '';
    currentShopItems = [{ name: "치유 포션", type: "potion", value: 80, price: 40, rarity: "common", desc: "체력을 80 회복합니다." }];
    let shuffled = [...equipmentPool].sort(() => 0.5 - Math.random()); currentShopItems.push(...shuffled.slice(0, 3));

    currentShopItems.forEach((it, idx) => {
        const d = document.createElement('div'); d.style.marginBottom = '15px'; d.style.padding = '12px'; d.style.background = '#2a2a2a'; d.style.borderRadius = '8px'; d.style.border = '1px solid #444';
        let color = '#ccc'; if (it.rarity === 'legendary') color = '#e74c3c'; else if (it.rarity === 'epic') color = '#a55eea'; else if (it.rarity === 'rare') color = '#1e90ff';
        d.innerHTML = `<span style="color:${color}; font-weight:bold; font-size:1.1em;">${it.name}</span> <span style="color:#f1c40f;">(${it.price}G)</span> <br>
                       <div style="font-size:0.85em; color:#999; margin:8px 0; line-height:1.4;">${it.desc}</div>
                       <button onclick="buyItem(event, ${idx})" style="background:#f1c40f; color:#111; padding:8px 15px; margin-top:5px;">구매하기</button>`;
        list.appendChild(d);
    });
    const rerollBtn = document.createElement('button'); rerollBtn.className = 'reroll-btn'; rerollBtn.innerText = `🔄 다시 돌리기 (${rerollCost}G)`; rerollBtn.onclick = rerollShop; list.appendChild(rerollBtn);
}

window.rerollShop = () => {
    if (gold < rerollCost) return writeLog(`[상점] 골드가 부족합니다.`);
    gold -= rerollCost; rerollCost += 10; writeLog(`[상점] 리롤 완료!`); updateUi(); renderShopItems();
};

function saveCollection(itemName) {
    let collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
    if (!collection.includes(itemName)) { collection.push(itemName); localStorage.setItem('item_collection_v5', JSON.stringify(collection)); loadCollection(); }
}

function loadCollection() {
    let collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]'); document.getElementById('collection-count').innerText = `${collection.length} / ${equipmentPool.length}`;
}

window.buyItem = (event, idx) => {
    const it = currentShopItems[idx]; if (gold < it.price) return writeLog("골드 부족!"); gold -= it.price;
    if (it.type === 'potion') { player.potions++; writeLog(`[상점] 포션 구매 완료.`); } 
    else {
        if (!player.items.some(i => i.name === it.name)) {
            player.items.push(it); saveCollection(it.name);
            if (it.type === 'atk') player.atk += it.value; if (it.type === 'hp') { player.maxHp += it.value; player.curHp += it.value; } if (it.type === 'acc') player.acc += it.value; if (it.def) player.extraDef += it.def;
            if (it.preferred === player.name) {
                if (it.bonusAtk) player.extraAtk += it.bonusAtk; if (it.bonusHp) { player.maxHp += it.bonusHp; player.curHp += it.bonusHp; } if (it.bonusAcc) player.acc += it.bonusAcc;
                if (it.unlockSkill) player.unlockedSkill = it.unlockSkill;
            }
            if (it.penalty && it.penalty[player.name]) player.acc -= it.penalty[player.name];
            event.target.innerText = "판매됨"; event.target.disabled = true; event.target.style.background = "#555"; event.target.style.color = "#999";
        } else { player.maxHp += 15; player.curHp += 15; writeLog("중복 보너스: HP +15"); }
    }
    updateUi(); renderActions();
};

window.nextFloor = () => { floor++; document.getElementById('shop-area').style.display = 'none'; document.getElementById('battle-area').style.display = 'block'; spawnEnemy(); };

function updateUi() {
    document.getElementById('p-hp').style.width = (player.curHp/player.maxHp*100)+'%'; document.getElementById('p-hp-t').innerText = `${player.curHp}/${player.maxHp}`;
    document.getElementById('p-atk-val').innerText = player.atk + (player.extraAtk || 0); document.getElementById('p-def-val').innerText = player.def + (player.extraDef || 0);
    document.getElementById('p-acc-val').innerText = `${90 + player.acc}%`;
    if(enemy && enemy.curHp > 0) {
        document.getElementById('e-hp').style.width = (enemy.curHp/enemy.hp*100)+'%'; document.getElementById('e-hp-t').innerText = `${enemy.curHp}/${enemy.hp}`;
        document.getElementById('e-name').innerText = enemy.name; document.getElementById('e-atk-val').innerText = enemy.atk; document.getElementById('e-def-val').innerText = enemy.def;
    }
    document.getElementById('floor-t').innerText = floor; document.getElementById('gold-t').innerText = gold;
    document.getElementById('shop-gold-t').innerText = gold; document.getElementById('shop-hp-t').innerText = `${player.curHp}/${player.maxHp}`; document.getElementById('potion-t').innerText = player.potions;
    
    let statusText = ""; if (defendingTurns > 0) statusText = `🛡️ 방어 중 (${defendingTurns}턴)`; else if (dodgingTurns > 0) statusText = `💨 회피 준비 (${dodgingTurns}턴)`; else if (shieldedTurns > 0) statusText = `✨ 방어막 (${shieldedTurns}턴)`;
    document.getElementById('p-status').innerText = statusText;

    let accMsg = player.acc < 0 ? `<span style="color:#ff4757;">${player.acc}%</span>` : `+${player.acc}%`;
    document.getElementById('inv-list').innerHTML = player.items.map(i => {
        let color = '#ccc'; if (i.rarity === 'legendary') color = '#e74c3c'; else if (i.rarity === 'epic') color = '#a55eea'; else if (i.rarity === 'rare') color = '#1e90ff';
        return `<div class="stat-tag" style="color:${color};">▪ ${i.name}<div class="tooltip-text">${i.desc}</div></div>`;
    }).join('') + `<br><div style="font-size:0.85em; color:#888; margin-top:5px;">명중 보정: ${accMsg}</div>`;
}

// 게임 오버 시 파이어베이스 서버로 전송!
async function gameOver() { 
    await saveRank(); 
    alert(`사망했습니다. (사인: ${enemy.name})`); 
    location.reload(); 
}

function writeLog(m) { const l = document.getElementById('log'); l.innerHTML = `> ${m}<br>` + l.innerHTML; l.scrollTop = l.scrollHeight; }
