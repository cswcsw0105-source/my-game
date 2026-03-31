// Encounter module (stage 2 split)
const _PANIC_RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3, relic: 4 };
const ENCOUNTER_SCENE_WEIGHTS = {
    monster: 60,
    treasure: 10,
    rest: 8,
    altar: 14,
};

function rollEncounterSceneType() {
    const r = Math.random() * 100;
    const m = ENCOUNTER_SCENE_WEIGHTS.monster;
    const t = m + ENCOUNTER_SCENE_WEIGHTS.treasure;
    const rs = t + ENCOUNTER_SCENE_WEIGHTS.rest;
    const a = rs + ENCOUNTER_SCENE_WEIGHTS.altar;
    if (r < m) return 'monster';
    if (r < t) return 'treasure';
    if (r < rs) return 'rest';
    if (r < a) return 'altar';
    return 'monster';
}

function getPanicRunSacrificeItems() {
    if (!player || !Array.isArray(player.items)) return [];
    return player.items.filter((it) => it && getEquipSlotKind(it) && it.type !== 'merc');
}

function pickLowestRaritySacrificeItem() {
    const list = getPanicRunSacrificeItems();
    if (!list.length) return null;
    return [...list].sort(
        (a, b) => (_PANIC_RARITY_ORDER[a.rarity] ?? 9) - (_PANIC_RARITY_ORDER[b.rarity] ?? 9)
    )[0];
}

function buildMonsterEncounterHtml() {
    const sac = getPanicRunSacrificeItems();
    const canFlee = sac.length > 0;
    const fleeDisabled = canFlee ? '' : ' disabled';
    const fleeHint = canFlee
        ? ''
        : '<p style="color:#888;font-size:0.82em;margin:10px 0 0;line-height:1.45;">인벤토리에 희생할 <b>장비</b>(무기·갑옷·반지)가 없습니다. 도망할 수 없습니다.</p>';
    return `
<div style="padding:18px 16px;background:#141820;border:1px solid #2a3548;border-radius:12px;text-align:center;max-width:520px;margin:0 auto;">
  <p style="color:#b8c0d8;font-size:0.95em;line-height:1.55;margin:0 0 8px;">어둠 속에서 적의 기척이 느껴집니다...</p>
  <p style="color:#e0e0e0;font-size:1.05em;font-weight:700;margin:0 0 18px;">${floor}층 — 전투를 피할지, 맞서 싸울지 선택하세요.</p>
  <div style="display:flex;flex-direction:column;gap:10px;align-items:stretch;">
    <button type="button" onclick="ambushEncounterEnemy()" style="background:#8e44ad;color:#fff;padding:12px 16px;font-weight:800;border:none;border-radius:8px;cursor:pointer;font-size:0.95em;">🗡️ 기습하기 (성공 50%)</button>
    <button type="button" onclick="enterCombatFromEncounter()" style="background:#c0392b;color:#fff;padding:12px 16px;font-weight:800;border:none;border-radius:8px;cursor:pointer;font-size:0.95em;">⚔️ 전투 돌입</button>
    <button type="button" onclick="openPanicRunSacrificeModal()"${fleeDisabled} style="background:#34495e;color:#e0e0e0;padding:12px 16px;font-weight:700;border:1px solid #4a6278;border-radius:8px;cursor:pointer;font-size:0.95em;">⚡ 장비 던지고 도망치기</button>
  </div>
  ${fleeHint}
</div>`;
}

function buildTreasureEncounterHtml() {
    return `
<div style="padding:18px 16px;background:#1a1a12;border:1px solid #5a4b1f;border-radius:12px;text-align:center;max-width:520px;margin:0 auto;">
  <p style="color:#f1c40f;font-size:1.06em;font-weight:800;margin:0 0 8px;">📦 보물/함정 방</p>
  <p style="color:#d8d0b8;font-size:0.95em;line-height:1.55;margin:0 0 16px;">몬스터는 없고 낡은 보물상자가 있습니다.</p>
  <div style="display:flex;flex-direction:column;gap:10px;">
    <button type="button" onclick="resolveTreasureChest(true)" style="background:#f39c12;color:#111;padding:12px 16px;font-weight:800;border:none;border-radius:8px;cursor:pointer;font-size:0.95em;">🗝️ 상자를 연다</button>
    <button type="button" onclick="resolveTreasureChest(false)" style="background:#555;color:#ddd;padding:11px 16px;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.92em;">🚶 무시하고 지나간다</button>
  </div>
</div>`;
}

function buildRestEncounterHtml() {
    return `
<div style="padding:18px 16px;background:#142018;border:1px solid #2f5a38;border-radius:12px;text-align:center;max-width:520px;margin:0 auto;">
  <p style="color:#2ed573;font-size:1.05em;font-weight:800;margin:0 0 8px;">🛌 안전한 휴식처</p>
  <p style="color:#c9e8d3;font-size:0.94em;line-height:1.55;margin:0 0 16px;">잠시 몸을 숨길 수 있는 공간입니다. 숨을 고르고 다음 층으로 향할 수 있습니다.</p>
  <button type="button" onclick="resolveRestSpot()" style="background:#2ed573;color:#111;padding:12px 16px;font-weight:800;border:none;border-radius:8px;cursor:pointer;font-size:0.95em;">🫧 잠시 쉰 뒤 이동</button>
</div>`;
}

function buildAltarEncounterHtml() {
    const opts = buildAltarEncounterOptions();
    const cards = opts
        .map(
            (o, i) => `<button type="button" class="altar-option-card" onclick="resolveAltarOption(${i})">
  <span class="altar-option-title">${escapeHtml(o.title)}</span>
  <span class="altar-option-desc">${escapeHtml(o.desc)}</span>
</button>`
        )
        .join('');
    window._altarEncounterOptions = opts;
    return `
<div style="padding:18px 16px;background:#1a101b;border:1px solid #6d2f71;border-radius:12px;text-align:center;max-width:560px;margin:0 auto;">
  <p style="color:#d980fa;font-size:1.06em;font-weight:800;margin:0 0 8px;">🩸 수상한 제단</p>
  <p style="color:#d8c7de;font-size:0.93em;line-height:1.55;margin:0 0 14px;">수상한 제단이 붉은빛을 뿜고 있습니다. 대가를 치르고 각인을 새길 수 있습니다.</p>
  <div class="altar-options-wrap">${cards}</div>
  <button type="button" onclick="skipAltarOption()" style="margin-top:10px;background:#444;color:#ddd;padding:9px 14px;border:none;border-radius:8px;cursor:pointer;">제단에서 물러난다</button>
</div>`;
}

function buildEncounterPhaseHtml(sceneType) {
    if (sceneType === 'treasure') return buildTreasureEncounterHtml();
    if (sceneType === 'rest') return buildRestEncounterHtml();
    if (sceneType === 'altar') return buildAltarEncounterHtml();
    return buildMonsterEncounterHtml();
}

function hideEncounterPhaseUI() {
    const ep = document.getElementById('encounter-phase');
    const hud = document.getElementById('battle-hud');
    if (ep) ep.style.display = 'none';
    if (hud) hud.style.display = 'block';
}

function beginFloorEncounter() {
    setCombatProcessing(false);
    if (pendingShop) {
        spawnEnemy();
        return;
    }
    const scene = window._encounterPhaseScene || rollEncounterSceneType();
    window._encounterPhaseScene = scene;
    window._encounterPhaseActive = true;
    enemy = null;
    const ep = document.getElementById('encounter-phase');
    const hud = document.getElementById('battle-hud');
    if (ep) {
        ep.style.display = 'block';
        ep.innerHTML = buildEncounterPhaseHtml(scene);
    }
    if (hud) hud.style.display = 'none';
    updateUi();
    renderActions();
}

window.enterCombatFromEncounter = function enterCombatFromEncounter() {
    if (!player) return;
    window._encounterPhaseActive = false;
    window._encounterPhaseScene = null;
    hideEncounterPhaseUI();
    window._pendingEncounterCombatMod = null;
    spawnEnemy();
};

window.ambushEncounterEnemy = function ambushEncounterEnemy() {
    if (!player || !window._encounterPhaseActive) return;
    const success = Math.random() < 0.5;
    window._encounterPhaseActive = false;
    window._encounterPhaseScene = null;
    hideEncounterPhaseUI();
    if (success) {
        window._pendingEncounterCombatMod = { enemyHpMul: 0.8 };
        writeLog('[기습] ✅ 적의 허를 찔렀습니다! 적 체력이 20% 깎인 상태로 전투를 시작합니다.');
    } else {
        window._pendingEncounterCombatMod = null;
        const lossPct = 0.1 + Math.random() * 0.05;
        const dmg = Math.max(1, Math.floor(getEffectiveMaxHp() * lossPct));
        player.curHp = Math.max(1, safeNum(player.curHp, 1) - dmg);
        writeLog(`[기습] ❌ 발각되었습니다! 허둥지둥 물러나며 체력 ${dmg}를 잃었습니다.`);
    }
    spawnEnemy();
};

window.openPanicRunSacrificeModal = function openPanicRunSacrificeModal() {
    const list = getPanicRunSacrificeItems();
    if (!list.length) return writeLog('[도망] 희생할 장비가 없습니다.');
    const ov = document.createElement('div');
    ov.id = 'panic-run-overlay';
    ov.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:10050;display:flex;align-items:center;justify-content:center;padding:16px;';
    const rows = list
        .map((it) => {
            ensureOwnedItemUid(it);
            const rk = it.rarity || 'common';
            const col = rk === 'legendary' ? '#e74c3c' : rk === 'epic' ? '#a55eea' : rk === 'rare' ? '#1e90ff' : '#888';
            return `<button type="button" onclick="executePanicRunSacrifice('${escapeJsSingleQuoteString(it._uid)}')" style="width:100%;margin-bottom:8px;padding:10px 12px;text-align:left;background:#1a1a2e;border:1px solid #444;border-radius:8px;cursor:pointer;color:#e0e0e0;">
            <span style="color:${col};font-weight:800;font-size:0.75em;">${rk.toUpperCase()}</span> <b>${escapeHtml(it.name)}</b>
            <span style="color:#666;font-size:0.8em;display:block;margin-top:4px;">이 장비를 던져 적의 시야를 가립니다.</span>
          </button>`;
        })
        .join('');
    ov.innerHTML = `
      <div style="background:#121a24;border:2px solid #1e90ff;border-radius:12px;padding:22px;max-width:420px;width:100%;max-height:90vh;overflow-y:auto;">
        <h3 style="color:#1e90ff;margin:0 0 8px;">⚡ 무엇을 던질까?</h3>
        <p style="color:#888;font-size:0.85em;margin:0 0 14px;line-height:1.45;">한 장비를 희생해야 도망을 시도할 수 있습니다. 선택 후 현재 층에서 <b>2~3층 아래</b>로 떨어집니다.</p>
        ${rows}
        <button type="button" onclick="executePanicRunAuto()" style="width:100%;margin-top:5px;padding:10px;background:#2c3e50;color:#ecf0f1;border:1px solid #555;border-radius:8px;cursor:pointer;font-weight:700;">🎲 가장 낮은 등급 장비 자동 희생</button>
        <button type="button" onclick="closePanicRunModal()" style="width:100%;margin-top:10px;padding:8px;background:#333;color:#aaa;border:none;border-radius:8px;cursor:pointer;">취소</button>
      </div>`;
    document.body.appendChild(ov);
};

window.closePanicRunModal = function closePanicRunModal() {
    const ov = document.getElementById('panic-run-overlay');
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
};

window.executePanicRunAuto = function executePanicRunAuto() {
    const it = pickLowestRaritySacrificeItem();
    if (!it) return writeLog('[도망] 희생할 장비가 없습니다.');
    ensureOwnedItemUid(it);
    executePanicRunSacrifice(it._uid);
};

window.executePanicRunSacrifice = function executePanicRunSacrifice(uid) {
    if (!player || !uid || !window._encounterPhaseActive) return;
    closePanicRunModal();
    const idx = player.items.findIndex((x) => x && x._uid === uid);
    if (idx < 0) return writeLog('[도망] 아이템을 찾을 수 없습니다.');
    const it = player.items[idx];
    if (!getEquipSlotKind(it)) return writeLog('[도망] 장비만 희생할 수 있습니다.');
    const itemName = it.name;
    removeOwnedItemEffects(it);
    player.items.splice(idx, 1);
    if (player.metaSlotId && typeof fullResyncPlayerCombatStatsFromMetaAndInventory === 'function') {
        fullResyncPlayerCombatStatsFromMetaAndInventory();
    }
    failActiveQuestIfLeavingFloor();
    const drop = Math.random() < 0.5 ? 2 : 3;
    const fromFloor = floor;
    floor = Math.max(1, floor - drop);
    writeLog(
        `[패닉] 💨 <b>${escapeHtml(itemName)}</b>을(를) 적에게 집어 던지고 뒤도 돌아보지 않고 미친 듯이 도망쳤습니다… <b style="color:#ff4757;">${fromFloor}층 → ${floor}층</b>으로 굴러떨어졌습니다. (하락 ${drop}층)`
    );
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined') MetaRPG.markRunCheckpoint(player.metaSlotId);
    window._encounterPhaseScene = null;
    beginFloorEncounter();
};

window.resolveTreasureChest = function resolveTreasureChest(openChest) {
    if (!player || !window._encounterPhaseActive) return;
    window._encounterPhaseScene = null;
    if (!openChest) {
        writeLog('[탐험] 상자를 무시하고 조용히 다음 통로로 향했습니다.');
        return advanceFloorAfterNonCombatEncounter();
    }
    const roll = Math.random();
    if (roll < 0.45) {
        const gain = 12 + Math.floor(Math.random() * 24) + Math.floor(floor * 0.8);
        gold += gain;
        totalGoldEarned += gain;
        writeLog(`[보물] 💰 녹슨 상자에서 ${gain}G를 찾았습니다.`);
    } else if (roll < 0.75) {
        player.potions = Math.max(0, safeNum(player.potions, 0)) + 1;
        writeLog('[보물] 🧪 포션 1개를 발견했습니다.');
    } else {
        const dmg = Math.max(1, Math.floor(getEffectiveMaxHp() * (0.1 + Math.random() * 0.08)));
        player.curHp = Math.max(1, safeNum(player.curHp, 1) - dmg);
        writeLog(`[함정] ☠️ 독침 함정! 체력 ${dmg}를 잃었습니다.`);
    }
    advanceFloorAfterNonCombatEncounter();
};

window.resolveRestSpot = function resolveRestSpot() {
    if (!player || !window._encounterPhaseActive) return;
    window._encounterPhaseScene = null;
    const heal = Math.max(1, Math.floor(getEffectiveMaxHp() * (0.1 + Math.random() * 0.06)));
    player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0) + heal);
    writeLog(`[휴식] 🌿 숨을 고르며 체력 ${heal} 회복.`);
    advanceFloorAfterNonCombatEncounter();
};

function buildAltarEncounterOptions() {
    const options = [
        {
            key: 'atk_to_crit',
            title: '공격력 15% 희생 → 치명타 확률 20% 증가',
            desc: '날 선 각인이 공격 대신 치명을 부릅니다.',
            apply: () => {
                const loss = Math.max(1, Math.floor(safeNum(player.atk, 1) * 0.15));
                player.atk = Math.max(1, safeNum(player.atk, 1) - loss);
                player.crit = safeNum(player.crit, 1) + 20;
                return { text: `공격력 ${loss} 희생 → 치명타 확률 +20%` };
            },
        },
        {
            key: 'hp_to_def',
            title: '최대 체력 18% 희생 → 방어 22% 증가',
            desc: '피를 바친 대신 육신이 단단해집니다.',
            apply: () => {
                const hpLoss = Math.max(1, Math.floor(safeNum(player.maxHp, 1) * 0.18));
                player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - hpLoss);
                player.curHp = Math.min(player.maxHp, safeNum(player.curHp, 1));
                const gain = Math.max(1, Math.floor((safeNum(player.def, 0) + safeNum(player.extraDef, 0)) * 0.22));
                player.extraDef = safeNum(player.extraDef, 0) + gain;
                return { text: `최대 체력 ${hpLoss} 희생 → 방어 +${gain}` };
            },
        },
        {
            key: 'def_to_atk',
            title: '방어 20% 희생 → 공격력 18% 증가',
            desc: '안전을 버리고 살기를 얻습니다.',
            apply: () => {
                const defTotal = safeNum(player.def, 0) + safeNum(player.extraDef, 0);
                const loss = Math.max(1, Math.floor(defTotal * 0.2));
                const fromExtra = Math.min(loss, safeNum(player.extraDef, 0));
                player.extraDef = safeNum(player.extraDef, 0) - fromExtra;
                const rem = loss - fromExtra;
                if (rem > 0) player.def = Math.max(0, safeNum(player.def, 0) - rem);
                const gain = Math.max(1, Math.floor(safeNum(player.atk, 1) * 0.18));
                player.atk = safeNum(player.atk, 1) + gain;
                return { text: `방어 ${loss} 희생 → 공격력 +${gain}` };
            },
        },
    ];
    if (Math.random() < 0.05) {
        options.push({
            key: 'golden_coupon',
            title: '모든 스탯 10% 희생 → 황금 쿠폰 획득',
            desc: '다음 상점에서 첫 구매가 0G가 됩니다.',
            apply: () => {
                const atkLoss = Math.max(1, Math.floor(safeNum(player.atk, 1) * 0.1));
                const hpLoss = Math.max(1, Math.floor(safeNum(player.maxHp, 1) * 0.1));
                const defTotal = safeNum(player.def, 0) + safeNum(player.extraDef, 0);
                const defLoss = Math.max(1, Math.floor(defTotal * 0.1));
                player.atk = Math.max(1, safeNum(player.atk, 1) - atkLoss);
                player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - hpLoss);
                player.curHp = Math.min(player.maxHp, safeNum(player.curHp, 1));
                const fromExtra = Math.min(defLoss, safeNum(player.extraDef, 0));
                player.extraDef = safeNum(player.extraDef, 0) - fromExtra;
                const rem = defLoss - fromExtra;
                if (rem > 0) player.def = Math.max(0, safeNum(player.def, 0) - rem);
                player.freeShopCoupon = true;
                return { text: `모든 스탯 10% 희생 → 황금 쿠폰 획득` };
            },
        });
    }
    return options.sort(() => Math.random() - 0.5).slice(0, 3);
}

function pushPassiveContractHistory(msg) {
    if (!player) return;
    if (!Array.isArray(player.passiveContractHistory)) player.passiveContractHistory = [];
    player.passiveContractHistory.unshift(`[${floor}F] ${msg}`);
    if (player.passiveContractHistory.length > 30) player.passiveContractHistory.length = 30;
}

window.resolveAltarOption = function resolveAltarOption(idx) {
    if (!player || !window._encounterPhaseActive) return;
    const opts = window._altarEncounterOptions || [];
    const opt = opts[idx];
    if (!opt || typeof opt.apply !== 'function') return;
    const result = opt.apply();
    if (player.metaSlotId && typeof fullResyncPlayerCombatStatsFromMetaAndInventory === 'function') {
        fullResyncPlayerCombatStatsFromMetaAndInventory();
    }
    const txt = (result && result.text) || opt.title;
    writeLog(`[제단] 🩸 ${txt}`);
    pushPassiveContractHistory(txt);
    window._encounterPhaseScene = null;
    advanceFloorAfterNonCombatEncounter();
};

window.skipAltarOption = function skipAltarOption() {
    if (!window._encounterPhaseActive) return;
    writeLog('[제단] 기묘한 속삭임을 외면하고 지나쳤습니다.');
    window._encounterPhaseScene = null;
    advanceFloorAfterNonCombatEncounter();
};

function advanceFloorAfterNonCombatEncounter() {
    if (!player) return;
    window._encounterPhaseActive = false;
    hideEncounterPhaseUI();
    failActiveQuestIfLeavingFloor();
    const prevFloor = floor;
    floor++;
    checkFloorUnlock(prevFloor);
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) {
        MetaRPG.updateBestFloor(player.metaSlotId, prevFloor);
    }
    if (isMercenaryCaptainJob() && prevFloor >= 19 && prevFloor <= 30 && !player.mercEvolutionChosen) {
        setTimeout(() => showMercEvolutionChoice(() => beginFloorEncounter()), 300);
        return;
    }
    if (floor > 1 && floor % 3 === 0) pendingShop = true;
    beginFloorEncounter();
}

window.rollEncounterSceneType = rollEncounterSceneType;
window.getPanicRunSacrificeItems = getPanicRunSacrificeItems;
window.pickLowestRaritySacrificeItem = pickLowestRaritySacrificeItem;
window.buildMonsterEncounterHtml = buildMonsterEncounterHtml;
window.buildTreasureEncounterHtml = buildTreasureEncounterHtml;
window.buildRestEncounterHtml = buildRestEncounterHtml;
window.buildAltarEncounterHtml = buildAltarEncounterHtml;
window.buildEncounterPhaseHtml = buildEncounterPhaseHtml;
window.hideEncounterPhaseUI = hideEncounterPhaseUI;
window.beginFloorEncounter = beginFloorEncounter;
window.buildAltarEncounterOptions = buildAltarEncounterOptions;
window.pushPassiveContractHistory = pushPassiveContractHistory;
window.advanceFloorAfterNonCombatEncounter = advanceFloorAfterNonCombatEncounter;
