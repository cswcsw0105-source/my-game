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
let currentShopItems = [];
let lastEnemyJob = "";
let rerollCost = 10;
let currentUser = null;
let pendingShop = false; // 상점 대기 플래그

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
        document.getElementById('start-area').style.display = 'block';
        loadRank();
    } else {
        currentUser = null;
        document.getElementById('login-area').style.display = 'block';
        document.getElementById('start-area').style.display = 'none';
    }
});

async function saveRank() {
    if (!currentUser) return;
    try {
        await db.collection("global_ranks").add({
            email: currentUser.email.split('@')[0],
            job: player.name,
            floor: floor,
            killer: enemy ? enemy.name : "알 수 없음",
            date: new Date().toLocaleDateString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) { console.error("랭킹 저장 에러: ", e); }
}

async function loadRank() {
    try {
        const snapshot = await db.collection("global_ranks").orderBy("floor", "desc").limit(5).get();
        let html = "";
        snapshot.forEach((doc) => {
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

window.togglePatchNotes = (show) => { document.getElementById('patch-modal').style.display = show ? 'flex' : 'none'; };
window.onclick = function(event) { if (event.target === document.getElementById('patch-modal')) togglePatchNotes(false); };

window.startGame = (job) => {
    player = { ...jobBase[job], curHp: jobBase[job].hp, maxHp: jobBase[job].hp, acc: 0, items: [], extraAtk: 0, potions: 0, extraDef: 0, unlockedSkill: null };
    document.getElementById('start-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    loadCollection();
    spawnEnemy();
};

function spawnEnemy() {
    // 상점은 winBattle에서 floor++ 직후 pendingShop=true로 설정된 경우에만 열림
    if (pendingShop) {
        pendingShop = false;
        return openShop();
    }

    defendingTurns = 0; dodgingTurns = 0; shieldedTurns = 0;

    if (floor % 10 === 0) {
        enemy = {
            name: `👑 [보스] ${floor}층 군주`,
            job: '보스',
            hp: 200 + floor * 20, curHp: 150 + floor * 20,
            atk: 10 + floor * 3, def: 3 + Math.floor(floor / 3),
            isBoss: true, turnCount: 1, bossCharge: false
        };
        writeLog(`🚨 경고: ${floor}층의 지배자가 나타났습니다! 전투를 준비하세요!`);
    } else {
        const eJobs = ['워리어', '헌터', '마법사'];
        let randomJob = eJobs[Math.floor(Math.random() * eJobs.length)];
        if (randomJob === lastEnemyJob) randomJob = eJobs[Math.floor(Math.random() * eJobs.length)];
        lastEnemyJob = randomJob;
        enemy = {
            name: `[${randomJob}형] ${floor}층 괴수`,
            job: randomJob,
            hp: 40 + floor * 10, curHp: 40 + floor * 10,
            atk: 8 + floor * 2, def: 1 + Math.floor(floor / 3),
            isBoss: false
        };
    }
    updateUi();
    renderActions();
}

function renderActions() {
    const div = document.getElementById('action-btns');
    div.innerHTML = '';

    const atkBtn = document.createElement('button');
    atkBtn.innerText = '⚔️ 공격';
    atkBtn.style.background = player.color;
    atkBtn.onclick = () => useAction('공격');
    div.appendChild(atkBtn);

    const defBtn = document.createElement('button');
    defBtn.style.background = '#888';
    if (player.name === '워리어') { defBtn.innerText = '🛡️ 방어 (80%)'; defBtn.onclick = () => useAction('방패방어'); }
    else if (player.name === '헌터') { defBtn.innerText = '💨 회피 (75%)'; defBtn.onclick = () => useAction('회피'); }
    else if (player.name === '마법사') { defBtn.innerText = '✨ 방어막 (70%)'; defBtn.onclick = () => useAction('방어막'); }
    div.appendChild(defBtn);

    if (player.unlockedSkill) {
        const skillBtn = document.createElement('button');
        skillBtn.innerText = `🔥 ${player.unlockedSkill}`;
        skillBtn.style.background = '#9b59b6';
        skillBtn.onclick = () => useAction('궁극기');
        div.appendChild(skillBtn);
    }

    const pBtn = document.createElement('button');
    pBtn.innerText = `🧪 포션 (${player.potions})`;
    pBtn.className = 'potion-btn';
    pBtn.onclick = usePotion;
    div.appendChild(pBtn);
}

window.useAction = (type) => {
    if (type === '공격') {
        let multiplier = 1.0; let effectMsg = "";
        if (!enemy.isBoss) {
            if (relations[player.name].strong === enemy.job) { multiplier = 1.5; effectMsg = "<b style='color:#2ed573'>(상성 우위!)</b> "; }
            else if (relations[player.name].weak === enemy.job) { multiplier = 0.8; effectMsg = "<b style='color:#ff4757'>(상성 열세..)</b> "; }
        }
        if (Math.random() * 100 < (75 + player.acc)) {
            let baseDmg = player.atk + player.extraAtk + Math.floor(Math.random() * 10);
            let finalDmg = Math.max(1, Math.floor(baseDmg * multiplier) - enemy.def);
            enemy.curHp -= finalDmg;
            writeLog(`[명중] ${effectMsg}적에게 ${finalDmg} 피해!`);
        } else writeLog(`[빗나감] 공격 실패!`);
        if (enemy.curHp <= 0) return winBattle();
    } else if (type === '궁극기') {
        let ultDmg = player.atk + player.extraAtk + 40;
        enemy.curHp -= ultDmg;
        writeLog(`[궁극기] ${player.unlockedSkill} 작렬!!! 방어력을 무시하는 ${ultDmg} 피해!`);
        if (enemy.curHp <= 0) return winBattle();
    } else if (type === '방패방어') {
        if (Math.random() * 100 < 70) { defendingTurns = 2; writeLog(`[성공] 2턴간 피해 70% 감소 방어 태세!`); }
        else writeLog(`[실패] 방패 방어 실패!`);
    } else if (type === '회피') {
        dodgingTurns = 2;
        writeLog(`[회피기 발동] 지금부터 2번의 공격을 75% 확률로 완벽히 회피합니다!`);
    } else if (type === '방어막') {
        if (Math.random() * 100 < 60) { shieldedTurns = 2; writeLog(`[성공] 2턴 동안 데미지 1회 무효화!`); }
        else writeLog(`[실패] 방어막 전개 실패!`);
    }
    enemyTurn();
};

window.usePotion = () => {
    if (player.potions <= 0) return writeLog("소지한 포션이 없습니다!");
    player.potions--;
    let healAmount = Math.floor(player.maxHp * 0.35);
    player.curHp = Math.min(player.maxHp, player.curHp + healAmount);
    writeLog(`[아이템] 🧪 포션 사용! (체력 ${healAmount} 회복)`);
    updateUi(); renderActions();
};

function enemyTurn() {
    setTimeout(() => {
        let hitLanded = true;
        let currentEnemyAtk = enemy.atk;

        if (enemy.isBoss) {
            if (enemy.bossCharge) {
                writeLog(`💥 [강공격] 보스가 묵직한 일격을 내리꽂습니다!!`);
                currentEnemyAtk = enemy.atk * 2.5;
                enemy.bossCharge = false;
            } else if (enemy.turnCount % 4 === 3) {
                enemy.bossCharge = true;
                writeLog(`⚠️ [위험] 보스가 공격을 멈추고 강력한 일격을 준비합니다! (다음 턴 강공격)`);
                enemy.turnCount++; updateUi(); return;
            }
            enemy.turnCount++;
        }

        if (dodgingTurns > 0) {
            dodgingTurns--;
            if (Math.random() * 100 < 75) { writeLog(`[회피 성공] 💨 적의 공격을 피했습니다!`); hitLanded = false; }
            else writeLog(`[회피 실패] 아차, 피하지 못했습니다!`);
        } else if (shieldedTurns > 0) {
            shieldedTurns--;
            writeLog(`[방어막] ✨ 방어막이 데미지를 무효화했습니다!`);
            hitLanded = false;
        }

        if (hitLanded) {
            if (Math.random() * 100 < 75) {
                let dmg = Math.max(1, currentEnemyAtk - (player.def + player.extraDef));
                if (defendingTurns > 0) {
                    dmg = Math.floor(dmg * 0.3); defendingTurns--;
                    writeLog(`[철벽 방어] 🛡️ 데미지 경감! (${dmg} 입음)`);
                } else writeLog(`[피격] 적의 공격! ${dmg} 데미지 입음.`);
                player.curHp -= dmg;
            } else writeLog(`[운 좋음] 럭키! 적의 공격이 허공을 갈랐습니다!`);
        }
        if (player.curHp <= 0) return gameOver();
        updateUi();
    }, 400);
}

function winBattle() {
    const baseGain = enemy.isBoss
        ? 80 + Math.floor(Math.random() * 40) + floor * 5
        : 20 + Math.floor(Math.random() * 15) + Math.floor(floor * 1.5);

    // 상성 열세 상대를 이기면 골드 보너스
    let bonus = 0;
    let bonusMsg = "";
    if (!enemy.isBoss && relations[player.name].weak === enemy.job) {
        bonus = Math.floor(baseGain * 0.5);
        bonusMsg = ` <b style='color:#f1c40f'>(역전 보너스 +${bonus}G!)</b>`;
    }

    const gain = baseGain + bonus;
    gold += gain;
    player.curHp = Math.min(player.maxHp, player.curHp + Math.floor(player.maxHp * 0.15));
    writeLog(`[승리] ${gain}G 획득 및 체력 소량 회복.${bonusMsg}`);
    floor++;
    if (floor > 1 && floor % 3 === 0) pendingShop = true;
    spawnEnemy();
}

function openShop() {
    document.getElementById('battle-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'block';
    rerollCost = 10;
    updateUi();
    renderShopItems();
}

window.nextFloor = () => {
    document.getElementById('shop-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    spawnEnemy();
};

function renderShopItems() {
    const list = document.getElementById('shop-list');
    list.innerHTML = '';
    currentShopItems = [{ name: "치유 포션", type: "potion", value: 80, price: 40, rarity: "common", desc: "최대 체력의 35%를 즉시 회복합니다." }];
    let shuffled = [...equipmentPool].sort(() => 0.5 - Math.random());
    currentShopItems.push(...shuffled.slice(0, 3));

    currentShopItems.forEach((it, idx) => {
        const d = document.createElement('div');
        d.style.cssText = 'margin-bottom:15px; padding:12px; background:#2a2a2a; border-radius:8px; border:1px solid #444;';
        let color = '#ccc';
        if (it.rarity === 'legendary') color = '#e74c3c';
        else if (it.rarity === 'epic') color = '#a55eea';
        else if (it.rarity === 'rare') color = '#1e90ff';
        d.innerHTML = `<span style="color:${color}; font-weight:bold; font-size:1.1em;">${it.name}</span> <span style="color:#f1c40f;">(${it.price}G)</span><br>
                       <div style="font-size:0.85em; color:#999; margin:8px 0; line-height:1.4;">${it.desc}</div>
                       <button onclick="buyItem(event, ${idx})" style="background:#f1c40f; color:#111; padding:8px 15px; margin-top:5px;">구매하기</button>`;
        list.appendChild(d);
    });

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
    let collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
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
            if (it.preferred === player.name) {
                if (it.bonusAtk) player.atk += it.bonusAtk;
                if (it.bonusHp) { player.maxHp += it.bonusHp; player.curHp += it.bonusHp; }
                if (it.bonusAcc) player.acc += it.bonusAcc;
                writeLog(`[보너스] ${player.name} 전용 장비 효과 적용!`);
            }
            if (it.penalty && it.penalty[player.name]) {
                player.acc -= it.penalty[player.name];
                writeLog(`[패널티] 명중률 -${it.penalty[player.name]}% 적용`);
            }
            if (it.unlockSkill) {
                player.unlockedSkill = it.unlockSkill;
                writeLog(`[스킬 해제] 🔥 ${it.unlockSkill} 스킬을 획득했습니다!`);
            }
            writeLog(`[상점] ${it.name} 장착 완료!`);
        } else {
            writeLog(`이미 보유한 장비입니다!`);
            gold += it.price;
        }
    }
    updateUi(); renderActions();
};

function updateUi() {
    if (!player || !enemy) return;

    document.getElementById('p-name').innerText = player.name;
    document.getElementById('p-hp').style.width = `${Math.max(0, (player.curHp / player.maxHp) * 100)}%`;
    document.getElementById('p-hp-t').innerText = `${Math.max(0, player.curHp)} / ${player.maxHp}`;
    document.getElementById('p-atk-val').innerText = player.atk + player.extraAtk;
    document.getElementById('p-def-val').innerText = player.def + player.extraDef;
    document.getElementById('p-acc-val').innerText = `${90 + player.acc}%`;

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

    const invList = document.getElementById('inv-list');
    if (player.items.length === 0) {
        invList.innerHTML = '장비가 없습니다.';
    } else {
        invList.innerHTML = player.items.map(it => {
            let color = '#ccc';
            if (it.rarity === 'legendary') color = '#e74c3c';
            else if (it.rarity === 'epic') color = '#a55eea';
            else if (it.rarity === 'rare') color = '#1e90ff';
            return `<span style="color:${color}; cursor:default;" title="${it.desc}">▸ ${it.name}</span>`;
        }).join('<br>');
    }
}

function writeLog(msg) {
    const log = document.getElementById('log');
    log.innerHTML = `<p style="margin:4px 0; border-bottom:1px solid #333; padding-bottom:4px;">${msg}</p>` + log.innerHTML;
}

function gameOver() {
    saveRank();
    document.getElementById('battle-area').style.display = 'none';
    const screen = document.querySelector('.screen');
    screen.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
            <h2 style="color:#ff4757; font-size:2em;">💀 GAME OVER</h2>
            <p style="color:#e0e0e0; font-size:1.1em; margin:15px 0;">
                <b style="color:#f1c40f;">${floor}층</b>에서 
                <b style="color:#ff4757;">${enemy ? enemy.name : '알 수 없는 적'}</b>에게 쓰러졌습니다.
            </p>
            <p style="color:#888; font-size:0.9em;">기록이 명예의 전당에 저장되었습니다.</p>
            <button onclick="location.reload()" style="background:#ff4757; margin-top:20px; padding:12px 30px; font-size:1em;">
                🔄 다시 도전하기
            </button>
        </div>
    `;
    writeLog(`💀 ${floor}층에서 게임 오버. ${enemy ? enemy.name : ''}에게 패배.`);
}
