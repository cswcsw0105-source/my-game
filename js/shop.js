// Shop module (stage 2 split)
function openShop() {
    setCombatProcessing(false);
    shopVisitCount++;
    rerollCost = 10;
    transitionMainView(() => {
        const battle = document.getElementById('battle-area');
        const shop = document.getElementById('shop-area');
        const encounter = document.getElementById('encounter-phase');
        if (encounter) {
            encounter.style.display = 'none';
            encounter.replaceChildren();
        }
        if (battle) battle.style.display = 'none';
        if (shop) shop.style.display = 'block';
        updateUi();
        renderShopItems();
    });
}

function renderShopLeaveButtons() {
    const wrap = document.getElementById('shop-leave-actions');
    if (!wrap) return;
    wrap.innerHTML = `<p style="color:#888;font-size:0.82em;margin:0 0 10px;line-height:1.45;">재출정 시 장비·골드·영구 강화는 유지되며 미궁 진행도는 <b>1-1층</b>으로 초기화됩니다.</p>
      <button type="button" onclick="enterDungeonFromTown()" style="background:#444;color:#fff;width:100%;padding:12px;border:none;border-radius:8px;cursor:pointer;font-weight:700;">⚔️ 미궁 1-1층으로 출정</button>`;
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
    if (typeof enterDungeonFromTown === 'function') enterDungeonFromTown();
};

function getUnlockedPoolItems() {
    const currentFloor = Math.max(1, Number(floor) || 1);
    return [floorUnlocks, floorUnlocksHunter, floorUnlocksWizard]
        .flatMap((table) => Object.entries(table || {}))
        .filter(([unlockFloor]) => Number(unlockFloor) <= currentFloor)
        .map(([, item]) => item)
        .filter(Boolean);
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

/** 용병단장 전용(단독) 장비 — 타 직업 상점에서 제외 (데이터에 남아 있을 수 있음) */
function mercCaptainExclusiveItem(it) {
    return false;
}

/** 일반 상점용: 용병 계약 + 단장 전용 장비 제외 */
function getNonMercEquipmentPool() {
    return equipmentPool.filter((item) => item && item.type !== 'merc');
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

function applyGoldenBalanceShopPrice(item) {
    if (!item) return item;
    if (item.type === 'potion') return item;
    if (item.type === 'merc_shop_direct' || item.type === 'merc_shop_fund') return item;
    if (typeof computeEquipmentGoldPrice === 'function') {
        item.price = computeEquipmentGoldPrice(item, { shopFloor: floor });
    }
    return item;
}

function applyShopRarityTuning(baseItem) {
    if (!baseItem) return baseItem;
    if (baseItem.type === 'relic' || baseItem.type === 'potion' || baseItem.type === 'merc_shop_direct' || baseItem.type === 'merc_shop_fund') {
        const tuned = { ...baseItem };
        tuned.price = Math.max(1, Math.floor(safeNum(tuned.price, 1) * 0.5));
        return tuned;
    }
    if (baseItem.type === 'rune') {
        const tuned = { ...baseItem };
        tuned.name = formatShopItemName(tuned.name);
        if (typeof applyOfficialStatsToEquipmentItem === 'function') {
            applyOfficialStatsToEquipmentItem(tuned, { rebuildDesc: true });
        }
        applyGoldenBalanceShopPrice(tuned);
        tuned.desc = formatShopItemDesc(tuned.desc);
        return tuned;
    }
    const tuned = { ...baseItem };
    tuned.name = formatShopItemName(tuned.name);
    if (typeof applyOfficialStatsToEquipmentItem === 'function') {
        applyOfficialStatsToEquipmentItem(tuned, { rebuildDesc: true });
    }
    applyGoldenBalanceShopPrice(tuned);
    tuned.desc = formatShopItemDesc(tuned.desc);
    return tuned;
}

function isShopEquipmentForDedupe(it) {
    return !!it && ['atk', 'hp', 'ring', 'rune', 'util'].includes(String(it.type || ''));
}

function getShopSynergyFingerprint(it) {
    return 'none';
}

function getShopSemanticStats(it) {
    const type = String((it && it.type) || '');
    return {
        atk: type === 'atk' || type === 'ring' || type === 'rune' ? Math.max(0, safeNum(it.value, 0)) : 0,
        hp: type === 'hp' ? Math.max(0, safeNum(it.value, 0)) : Math.max(0, safeNum(it.hpBonus, 0)),
        def: safeNum(it.def, 0),
        crit: Math.max(0, safeNum(it.critBonus, 0)),
        critMult: Math.max(0, Number(safeNum(it.critMult, 0).toFixed ? safeNum(it.critMult, 0).toFixed(3) : safeNum(it.critMult, 0))),
        lifesteal: Math.max(0, Number(safeNum(it.lifesteal, 0).toFixed ? safeNum(it.lifesteal, 0).toFixed(3) : safeNum(it.lifesteal, 0))),
        damageReduction: Math.max(0, Number(safeNum(it.damageReduction, 0).toFixed ? safeNum(it.damageReduction, 0).toFixed(3) : safeNum(it.damageReduction, 0))),
        potionHeal: Math.max(0, Number(safeNum(it.potionHealBonus, 0).toFixed ? safeNum(it.potionHealBonus, 0).toFixed(3) : safeNum(it.potionHealBonus, 0))),
        prayer: Math.max(0, safeNum(it.prayerBonus, 0)),
        divinity: Math.max(0, Number(safeNum(it.divinityGainBonus, 0).toFixed ? safeNum(it.divinityGainBonus, 0).toFixed(3) : safeNum(it.divinityGainBonus, 0))),
        gold: Math.max(0, Number(safeNum(it.goldGainBonus, 0).toFixed ? safeNum(it.goldGainBonus, 0).toFixed(3) : safeNum(it.goldGainBonus, 0))),
        flee: Math.max(0, Number(safeNum(it.fleeBonus, 0).toFixed ? safeNum(it.fleeBonus, 0).toFixed(3) : safeNum(it.fleeBonus, 0))),
    };
}

function getShopPrimaryStatRole(it) {
    const explicit = String((it && it.itemRole) || '').toLowerCase();
    if (explicit === 'offense' || explicit === 'defense' || explicit === 'utility') return explicit;
    const s = getShopSemanticStats(it);
    if (s.hp > 0 || s.def > 0 || s.damageReduction > 0) return 'durability';
    if (s.atk > 0) return 'attack';
    if (s.crit > 0 || s.critMult > 0) return 'critical';
    if (s.lifesteal > 0) return 'sustain';
    if (s.gold > 0 || s.flee > 0 || s.potionHeal > 0) return 'utility';
    if (s.prayer > 0 || s.divinity > 0) return 'divine';
    return String(it && it.type ? it.type : 'misc');
}

function getShopFamilyKey(it) {
    const rarity = typeof normalizeRarityKey === 'function'
        ? normalizeRarityKey(it && it.rarity)
        : String((it && it.rarity) || 'common').toLowerCase();
    return `${rarity}|${getShopSynergyFingerprint(it)}`;
}

function getShopStatSignature(it) {
    const s = getShopSemanticStats(it);
    return ['atk', 'hp', 'def', 'crit', 'critMult', 'lifesteal', 'damageReduction', 'potionHeal', 'prayer', 'divinity', 'gold', 'flee']
        .map((k) => `${k}:${s[k]}`)
        .join('|');
}

function hasShopTwinEquipmentConflict(candidate, stock) {
    if (!isShopEquipmentForDedupe(candidate)) return false;
    const family = getShopFamilyKey(candidate);
    const role = getShopPrimaryStatRole(candidate);
    const sig = getShopStatSignature(candidate);
    return (stock || []).some((it) => {
        if (!isShopEquipmentForDedupe(it)) return false;
        if (getShopFamilyKey(it) !== family) return false;
        return getShopPrimaryStatRole(it) === role || getShopStatSignature(it) === sig;
    });
}

function tryPushDistinctShopItem(target, rawItem, opts) {
    const options = opts || {};
    if (!rawItem) return false;
    const tuned = applyShopRarityTuning({ ...rawItem });
    const stock = [...(options.stock || currentShopItems || []), ...(target || [])];
    if (stock.some((p) => p && p.name === tuned.name)) return false;
    if (!options.allowOwned && player && Array.isArray(player.items) && player.items.some((x) => x && x.name === tuned.name)) return false;
    if (hasShopTwinEquipmentConflict(tuned, stock)) return false;
    if (options.prepend) target.unshift(tuned);
    else target.push(tuned);
    return true;
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
    if (typeof MetaRPG !== 'undefined' && player && player.inTown) {
        const campRow = document.createElement('div');
        campRow.style.cssText = 'margin-bottom:12px;text-align:center;';
        campRow.innerHTML = `<button type="button" onclick="openBaseCampTech()" style="width:100%;padding:12px;background:#9b59b6;color:#fff;border:1px solid #8e44ad;border-radius:8px;font-weight:700;cursor:pointer;">🏕️ 베이스캠프 (연구·영구 강화)</button>`;
        list.appendChild(campRow);
    }
    if (!keepCurrentStock) {
        currentPotionOffer = { name: "치유 포션", type: "potion", value: 120, price: 20, rarity: "common", desc: "최대 체력의 35%를 즉시 회복합니다." };
        currentShopItems = [];
    }
    const unlockedItems=getUnlockedPoolItems(), picked=[];
    let tries=0;
    if (!keepCurrentStock && isMercenaryCaptainJob()) {
        const pd = typeof computeEquipmentGoldPrice === 'function'
            ? computeEquipmentGoldPrice({ rarity: 'epic' }, { shopFloor: floor })
            : 400 + floor * 15;
        const pf = typeof computeEquipmentGoldPrice === 'function'
            ? computeEquipmentGoldPrice({ rarity: 'rare' }, { shopFloor: floor })
            : 120 + floor * 5;
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
        const runeMerc = getNonMercEquipmentPool().filter((i) => i && i.type === 'rune');
        if (runeMerc.length) {
            const shuffled = [...runeMerc].sort(() => Math.random() - 0.5);
            for (const raw of shuffled) {
                if (tryPushDistinctShopItem(currentShopItems, raw, { stock: [] })) break;
            }
        }
    } else if (!keepCurrentStock) {
        if (floor >= 20 && Math.random() < 0.25 && player.relics) {
            const ar = relicPool.filter((r) => !player.relics.includes(r.effect));
            if (ar.length > 0) {
                const relic = ar[Math.floor(Math.random() * ar.length)];
                tryPushDistinctShopItem(picked, { ...relic, type: 'relic', value: 0 }, { stock: currentShopItems, allowOwned: true });
            }
        }
        if (unlockedItems.length > 0) {
            const ru = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
            tryPushDistinctShopItem(picked, ru, { stock: currentShopItems });
        }
        while (picked.length < 4 && tries < 180) {
            tries++;
            const pool = getItemsByRarity();
            if (!pool.length) continue;
            const item = pool[Math.floor(Math.random() * pool.length)];
            tryPushDistinctShopItem(picked, item, { stock: currentShopItems });
        }
        /** 풀에 생성 장비가 매우 많아 랜덤만으로는 룬이 거의 안 나옴 → 매 상점에 룬 1칸 확정 */
        const runeOnly = getNonMercEquipmentPool().filter((i) => i && i.type === 'rune');
        if (runeOnly.length && !picked.some((p) => p && p.type === 'rune')) {
            const shuffled = [...runeOnly].sort(() => Math.random() - 0.5);
            for (const raw of shuffled) {
                if (tryPushDistinctShopItem(picked, raw, { stock: currentShopItems, prepend: true })) {
                    while (picked.length > 4) picked.pop();
                    break;
                }
            }
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
        const synHtml = '';
        let bc='#444',bac='#888',bb='#2a2a2a',bt='COMMON';
        if(isRelic){bc='#f1c40f';bac='#f1c40f';bb='#2a2a0a';bt='RELIC';}
        else if(it.rarity==='relic'){bc='#d35400';bac='#f39c12';bb='#2a1a0a';bt='RELIC(용병)';}
        else if(it.rarity==='legendary'){bc='#e74c3c';bac='#e74c3c';bb='#2d1a1a';bt='LEGENDARY';}
        else if(it.rarity==='epic'){bc='#a55eea';bac='#a55eea';bb='#1e1a2d';bt='EPIC';}
        else if(it.rarity==='rare'){bc='#1e90ff';bac='#1e90ff';bb='#1a1e2d';bt='RARE';}
        let nc=isRelic?'#f1c40f':it.rarity==='legendary'?'#e74c3c':it.rarity==='epic'?'#a55eea':it.rarity==='rare'?'#1e90ff':'#e0e0e0';
        let ti=isRelic?'✨':'🎒';
        if(!isRelic){if(it.type==='atk')ti='⚔️';else if(it.type==='hp')ti='🛡️';else if(it.type==='ring')ti='💍';else if(it.type==='rune')ti='🔮';else if(it.type==='potion')ti='🧪';else if(it.type==='merc')ti='⚔️';else if(it.type==='merc_shop_direct')ti='💼';else if(it.type==='merc_shop_fund')ti='🤝';if(it.lifesteal)ti='🩸';if(it.regenPotion)ti='💚';}
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
    gold-=rerollCost; rerollCost+=10; syncPlayerCampaignState(); writeLog(`[상점] 리롤 완료!`); updateUi(); renderShopItems();
};

window.buyPotionOffer = () => {
    if (!player || !currentPotionOffer) return;
    if (gold < currentPotionOffer.price) return writeLog('골드 부족!');
    gold -= currentPotionOffer.price;
    player.potions = safeNum(player.potions, 0) + 1;
    syncPlayerCampaignState();
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
    syncPlayerCampaignState();
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
    fullResyncPlayerCombatStatsFromMetaAndInventory();
    syncPlayerCampaignState();
    gold = safeNum(gold, 0) + refund;
    syncPlayerCampaignState();
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
        if (typeof emitRelicStory === 'function') emitRelicStory(it);
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
            if (it.type === 'rune') {
                if (typeof it.value === 'number' && it.value) player.atk += it.value;
                if (typeof it.hpBonus === 'number' && it.hpBonus) {
                    player.maxHp += it.hpBonus;
                    player.curHp += it.hpBonus;
                }
                if (it.def) player.extraDef += it.def;
                if (it.lifesteal) player.lifesteal = (player.lifesteal || 0) + it.lifesteal;
                if (it.damageReduction) player.damageReduction = (player.damageReduction || 0) + it.damageReduction;
                if (it.potionHealBonus) player.potionHealBonus = (player.potionHealBonus || 0) + it.potionHealBonus;
                if (it.regenPotion) player.hasRegenPotion = true;
                if (it.critBonus) player.crit = (player.crit || 1) + it.critBonus;
                if (it.critMult) player.critMult = (player.critMult || 1.8) + it.critMult;
            } else {
                if(it.type==='atk'||it.type==='ring')player.atk+=it.value;
                if(it.type==='hp'){player.maxHp+=it.value;player.curHp+=it.value;}
                if(typeof it.hpBonus === 'number' && it.hpBonus){player.maxHp+=it.hpBonus;player.curHp+=it.hpBonus;}
                if(it.def)player.extraDef+=it.def;
                if(it.lifesteal)player.lifesteal=(player.lifesteal||0)+it.lifesteal;
                if(it.damageReduction)player.damageReduction=(player.damageReduction||0)+it.damageReduction;
                if(it.potionHealBonus)player.potionHealBonus=(player.potionHealBonus||0)+it.potionHealBonus;
                if(it.regenPotion)player.hasRegenPotion=true;
                if(it.critBonus)player.crit=(player.crit||1)+it.critBonus;
                if(it.critMult)player.critMult=(player.critMult||1.8)+it.critMult;
            }
            recalcPlayerDivineGainMult();
            fullResyncPlayerCombatStatsFromMetaAndInventory();
            syncPlayerCampaignState();
            writeLog(`[상점] ${it.name} 장착 완료!`);
            renderShopItems(true);
        } else { writeLog(`이미 보유한 장비입니다!`); gold+=it.price; }
    }
    syncPlayerCampaignState();
    updateUi(); renderActions();
};

window.openShop = openShop;
window.renderShopLeaveButtons = renderShopLeaveButtons;
window.getUnlockedPoolItems = getUnlockedPoolItems;
window.getItemsByRarity = getItemsByRarity;
window.getShopRarityChances = getShopRarityChances;
window.applyGoldenBalanceShopPrice = applyGoldenBalanceShopPrice;
window.applyShopRarityTuning = applyShopRarityTuning;
window.getShopRarityBoostPrice = getShopRarityBoostPrice;
window.renderShopItems = renderShopItems;
window.formatShopItemName = formatShopItemName;
window.formatShopItemDesc = formatShopItemDesc;
window.mercCaptainExclusiveItem = mercCaptainExclusiveItem;
window.getNonMercEquipmentPool = getNonMercEquipmentPool;
