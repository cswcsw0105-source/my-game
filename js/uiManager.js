// UI manager module (stage 1 split)
function renderActions() {
    const div = document.getElementById('action-btns');
    if (!div) return;
    if (!enemy || window._encounterPhaseActive) {
        div.innerHTML = '';
        return;
    }
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
    updateCombatButtonsLockState();
}

function renderPassiveContractHistoryPanels() {
    const targets = [
        { sidebarId: 'sidebar-normal', panelId: 'passive-history-normal' },
        { sidebarId: 'sidebar-battle', panelId: 'passive-history-battle' },
    ];
    const rows = (player && Array.isArray(player.passiveContractHistory) ? player.passiveContractHistory : [])
        .slice(0, 12)
        .map((x) => `<div style="padding:5px 6px;border-bottom:1px solid #2a2a2a;color:#aab7c9;font-size:0.76em;line-height:1.4;">${escapeHtml(x)}</div>`)
        .join('');
    const body = rows || '<div style="color:#666;font-size:0.76em;padding:6px;line-height:1.4;">아직 각인 기록이 없습니다.</div>';
    for (const t of targets) {
        const sb = document.getElementById(t.sidebarId);
        if (!sb) continue;
        let panel = document.getElementById(t.panelId);
        if (!panel) {
            panel = document.createElement('div');
            panel.id = t.panelId;
            panel.style.cssText = 'width:100%;margin-top:10px;padding-top:8px;border-top:1px solid #2b2b2b;';
            sb.appendChild(panel);
        }
        panel.innerHTML = `<h4 style="color:#d980fa;margin:0 0 6px 0;font-size:0.86em;">🩸 영구 각인 기록</h4><div style="max-height:190px;overflow-y:auto;background:#111;border:1px solid #27253a;border-radius:8px;">${body}</div>`;
    }
}

function updateUi() {
    if (!player) return;
    if (!enemy) {
        const shopEl = document.getElementById('shop-area');
        if (shopEl && shopEl.style.display === 'block') {
            const pMax = getEffectiveMaxHp();
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
            renderInventoryPanel();
            renderPassiveContractHistoryPanels();
        } else if (window._encounterPhaseActive) {
            const g = safeNum(gold, 0);
            const pots = Math.max(0, safeNum(player.potions, 0));
            ['floor-t-battle', 'gold-t-battle', 'potion-t-battle'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            ['floor-t', 'gold-t', 'potion-t'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            renderInventoryPanel();
            renderPassiveContractHistoryPanels();
        }
        return;
    }
    const pMax = getEffectiveMaxHp();
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
    const enemyNameEl = document.getElementById('e-name');
    if (enemyNameEl) {
        const hint = window._enemyThinkingHint ? `<div style="color:#ffb3b3;font-size:0.72em;font-weight:600;margin-top:3px;">${escapeHtml(window._enemyThinkingHint)}</div>` : '';
        enemyNameEl.innerHTML = `${escapeHtml(enemy.name)}${hint}`;
    }
    document.getElementById('e-hp').style.width=`${Math.max(0,(eCur/eHp)*100)}%`;
    document.getElementById('e-hp-t').innerText=`${eCur} / ${eHp}`;
    document.getElementById('e-atk-val').innerText=String(safeNum(enemy.atk, 0));
    document.getElementById('e-def-val').innerText=String(safeNum(enemy.def, 0));
    ['floor-t-battle','gold-t-battle','potion-t-battle'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.innerText=[floor,g,pots][i];});
    ['floor-t','gold-t','potion-t'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.innerText=[floor,g,pots][i];});
    const sh=document.getElementById('shop-hp-t'), sg=document.getElementById('shop-gold-t');
    if(sh)sh.innerText=`${pCur}/${pMax}`;
    if(sg)sg.innerText=String(g);
    renderInventoryPanel();
    renderPassiveContractHistoryPanels();
}

function writeLog(msg) {
    if (!Array.isArray(window._combatLogHistory)) window._combatLogHistory = [];
    window._combatLogHistory.unshift(String(msg));
    if (window._combatLogHistory.length > 220) window._combatLogHistory.length = 220;
    const bs=document.getElementById('sidebar-battle'), isBattle=bs&&bs.style.display==='flex';
    const p=`<p style="margin:4px 0;border-bottom:1px solid #333;padding-bottom:4px;">${msg}</p>`;
    if(isBattle){const bl=document.getElementById('log-battle');if(bl)bl.innerHTML=p+bl.innerHTML;}
    else{const l=document.getElementById('log');if(l)l.innerHTML=p+l.innerHTML;}
}

window.renderActions = renderActions;
window.renderPassiveContractHistoryPanels = renderPassiveContractHistoryPanels;
window.updateUi = updateUi;
window.writeLog = writeLog;
