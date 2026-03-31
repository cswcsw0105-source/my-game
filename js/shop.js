// Shop module (stage 2 split)
function openShop() {
    setCombatProcessing(false);
    shopVisitCount++;
    document.getElementById('battle-area').style.display='none';
    document.getElementById('shop-area').style.display='block';
    rerollCost=10; updateUi(); renderShopItems();
}

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
    beginFloorEncounter();
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

function computeShopEquipmentPriceMultiplier(it) {
    if (!it || it.type === 'relic' || it.type === 'merc_shop_direct' || it.type === 'merc_shop_fund') return 1;
    const v = typeof it.value === 'number' ? it.value : 0;
    const d = typeof it.def === 'number' ? it.def : 0;
    const c = typeof it.critBonus === 'number' ? it.critBonus : 0;
    const cm = typeof it.critMult === 'number' ? it.critMult : 0;
    const ls = typeof it.lifesteal === 'number' ? it.lifesteal : 0;
    const m = 1 + v * 0.006 + d * 0.032 + c * 0.011 + cm * 12 + ls * 16;
    return Math.min(4.2, Math.max(0.88, m));
}

function applyShopRarityTuning(baseItem) {
    if (!baseItem) return baseItem;
    if (baseItem.type === 'relic' || baseItem.type === 'potion' || baseItem.type === 'merc_shop_direct' || baseItem.type === 'merc_shop_fund') {
        return { ...baseItem };
    }
    const tuned = { ...baseItem };
    tuned.name = formatShopItemName(tuned.name);
    if (typeof window.applyOfficialStatsToEquipmentItem === 'function') {
        window.applyOfficialStatsToEquipmentItem(tuned, { rebuildDesc: true });
    }
    const basePrice = Math.max(1, safeNum(tuned.price, 1));
    tuned.price = Math.max(1, Math.round(basePrice * computeShopEquipmentPriceMultiplier(tuned)));
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
    grid.className = 'shop-item-grid';
    currentShopItems.forEach((it,idx)=>{
        const isRelic=it.type==='relic', d=document.createElement('div');
        const ownedRelic = isRelic && player.relics && player.relics.includes(it.effect);
        const owned = ownedRelic || (!isRelic && it.type !== 'potion' && it.type !== 'merc_shop_direct' && it.type !== 'merc_shop_fund' && player.items.some((x)=>x.name===it.name));
        const full = !isRelic && getEquipSlotKind(it) && !canEquipMoreOfItem(it);
        const slotLine = getEquipSlotLineHtml(it);
        const combatStats = buildShopItemCombatStatsHtml(it);
        const synHtml = buildShopSynergyHintsHtml(it);
        let bc='#444',bac='#888',bb='#2a2a2a',bt='COMMON';
        if(isRelic){bc='#f1c40f';bac='#f1c40f';bb='#2a2a0a';bt='RELIC';}
        else if(it.rarity==='relic'){bc='#d35400';bac='#f39c12';bb='#2a1a0a';bt='RELIC(용병)';}
        else if(it.rarity==='legendary'){bc='#e74c3c';bac='#e74c3c';bb='#2d1a1a';bt='LEGENDARY';}
        else if(it.rarity==='epic'){bc='#a55eea';bac='#a55eea';bb='#1e1a2d';bt='EPIC';}
        else if(it.rarity==='rare'){bc='#1e90ff';bac='#1e90ff';bb='#1a1e2d';bt='RARE';}
        let nc=isRelic?'#f1c40f':it.rarity==='legendary'?'#e74c3c':it.rarity==='epic'?'#a55eea':it.rarity==='rare'?'#1e90ff':'#e0e0e0';
        let ti=isRelic?'✨':'🎒';
        if(!isRelic){if(it.type==='atk')ti='⚔️';else if(it.type==='hp')ti='🛡️';else if(it.type==='ring')ti='💍';else if(it.type==='potion')ti='🧪';else if(it.type==='merc')ti='⚔️';else if(it.type==='merc_shop_direct')ti='💼';else if(it.type==='merc_shop_fund')ti='🤝';if(it.lifesteal)ti='🩸';if(it.regenPotion)ti='💚';}
        const iu=getUnlockedPoolItems().some(u=>u.name===it.name);
        const pref = isPreferredItem(it.name);
        const btnClass = full ? 'shop-card-btn shop-card-btn--full' : owned ? 'shop-card-btn shop-card-btn--owned' : 'shop-card-btn shop-card-btn--buy';
        const btnDisabled = owned || full ? ' disabled' : '';
        d.className = `shop-item-card${pref ? ' shop-item-card--preferred' : ''}`;
        d.style.cssText = `--shop-bc:${bc};--shop-bb:${bb};--shop-bac:${bac};--shop-name:${nc};`;
        d.onmouseenter = () => { d.style.transform = 'translateY(-2px)'; };
        d.onmouseleave = () => { d.style.transform = ''; };
        d.innerHTML = `<div class="shop-card-head"><span class="shop-card-rarity-badge">${iu ? '🔓 ' : ''}${bt}${pref ? ' ★' : ''}</span><span class="shop-card-type-icon">${ti}</span></div><div class="shop-card-title">${formatShopItemName(it.name)}${
            pref ? ' <span class="shop-card-pref">(선호)</span>' : ''
        }</div>${slotLine}<div class="shop-card-desc">${formatShopItemDesc(it.desc)}</div>${synHtml ? `<div class="shop-card-synergy">${synHtml}</div>` : ''}<div class="shop-card-stats-buy"><div class="shop-card-combat">${combatStats}</div><div class="shop-card-buy"><span class="shop-card-price">💰 ${it.price}G</span><button type="button" class="${btnClass}" onclick="buyItem(event,${idx})"${btnDisabled}>${full ? '공간 없음' : owned ? '보유' : '구매'}</button></div></div>`;
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
    renderShopItems(true);
};

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
    const couponActive = !!(player && player.freeShopCoupon);
    const payPrice = couponActive ? 0 : safeNum(it.price, 0);
    if(gold<payPrice) return writeLog("골드 부족!");
    gold-=payPrice;
    if (couponActive) {
        player.freeShopCoupon = false;
        writeLog(`[쿠폰] 🎫 황금 쿠폰 발동! <b>${it.name}</b>을(를) 0G로 구매했습니다.`);
    }
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
            gold += payPrice;
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
                gold += payPrice;
                alert(`[장착 제한] ${getEquipSlotLabel(slotKind)} 칸이 꽉 찼습니다. (최대 ${lim}개)`);
                return writeLog(`[장착 제한] ${getEquipSlotLabel(slotKind)}는 최대 ${lim}개까지 장착할 수 있습니다.`);
            }
        }
        if(!player.items.some(i=>i.name===it.name)){
            ensureOwnedItemUid(it);
            it._buyPrice = safeNum(it.price, 0);
            player.items.push(it); saveCollection(it.name);
            if(it.type==='atk'||it.type==='ring')player.atk+=it.value;
            if(it.type==='hp'){player.maxHp+=it.value;player.curHp+=it.value;}
            if(it.def)player.extraDef+=it.def;
            if(it.lifesteal)player.lifesteal=(player.lifesteal||0)+it.lifesteal;
            if(it.regenPotion)player.hasRegenPotion=true;
            if(it.critBonus)player.crit=(player.crit||1)+it.critBonus;
            if(it.critMult)player.critMult=(player.critMult||1.8)+it.critMult;
            if(it.penalty&&it.penalty[player.name]){player.acc-=it.penalty[player.name];writeLog(`[패널티] 명중률 -${it.penalty[player.name]}% 적용`);}
            recalcPlayerDivineGainMult();
            writeLog(`[상점] ${it.name} 장착 완료!`);
            renderShopItems(true);
        } else { writeLog(`이미 보유한 장비입니다!`); gold+=it.price; }
    }
    updateUi(); renderActions();
};

window.openShop = openShop;
window.renderShopLeaveButtons = renderShopLeaveButtons;
window.getUnlockedPoolItems = getUnlockedPoolItems;
window.getItemsByRarity = getItemsByRarity;
window.getShopRarityChances = getShopRarityChances;
window.computeShopEquipmentPriceMultiplier = computeShopEquipmentPriceMultiplier;
window.applyShopRarityTuning = applyShopRarityTuning;
window.getShopRarityBoostPrice = getShopRarityBoostPrice;
window.renderShopItems = renderShopItems;
