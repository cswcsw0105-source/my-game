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
    return player.items.filter(
        (it) => it && getEquipSlotKind(it) && it.type !== 'merc' && it.type !== 'rune'
    );
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
    let drop = Math.random() < 0.5 ? 2 : 3;
    const fleeRollBonus = typeof getPlayerFleeBonus === 'function' ? getPlayerFleeBonus() : 0;
    if (fleeRollBonus > 0 && Math.random() < fleeRollBonus) {
        drop = Math.max(1, drop - 1);
    }
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
        const goldMult = typeof getPlayerGoldGainMult === 'function' ? getPlayerGoldGainMult() : 1;
        const gain = Math.floor((12 + Math.floor(Math.random() * 24) + Math.floor(floor * 0.8)) * goldMult);
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
    beginFloorEncounter();
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
        beginFloorEncounter(); return;
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
    beginFloorEncounter();
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
    beginFloorEncounter();
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
            if(r<0.4){const h=Math.floor(getEffectiveMaxHp()*0.3);player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+h);writeLog(`[이벤트] ⚗️ 회복! +${h}`);}
            else if(r<0.7){player.atk+=8;writeLog(`[이벤트] ⚗️ 강화! 공격력 +8`);}
            else{const d=Math.floor(getEffectiveMaxHp()*0.2);player.curHp=Math.max(1,player.curHp-d);writeLog(`[이벤트] ⚗️ 독! -${d}`);}
        }},
        {label:"버린다",action:()=>writeLog(`[이벤트] 버렸습니다.`)}
    ]},
    { title:"👻 쓰러진 모험가", desc:"쓰러진 모험가의 유품이 있습니다.", choices:[
        {label:"유품을 가져간다 (골드+포션)",action:()=>{const g=30+Math.floor(Math.random()*50);gold+=g;player.potions++;writeLog(`[이벤트] 👻 ${g}G + 포션 1개!`);}},
        {label:"명복을 빈다 (HP 회복)",action:()=>{const h=Math.floor(getEffectiveMaxHp()*0.1);player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+h);writeLog(`[이벤트] 👻 ${h} 회복.`);}}
    ]},
    { title:"🔥 불길한 제단", desc:"악마의 힘을 느낍니다.", choices:[
        {label:"계약 (HP -20%, 공격력 +20 영구)",action:()=>{const d=Math.floor(player.maxHp*0.2);player.curHp=Math.max(1,player.curHp-d);player.maxHp=Math.max(50,player.maxHp-d);player.atk+=20;writeLog(`[이벤트] 🔥 악마 계약! 공격력 +20`);}},
        {label:"거부한다",action:()=>writeLog(`[이벤트] 거부했습니다.`)}
    ]},
    { title:"✨ 신비로운 샘물", desc:"맑은 빛을 발하는 샘물이 있습니다.", choices:[
        {label:"마신다 (체력 완전 회복)",action:()=>{player.curHp=getEffectiveMaxHp();writeLog(`[이벤트] ✨ 체력 완전 회복!`);}},
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
    beginFloorEncounter();
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
    beginFloorEncounter();
};

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
        beginFloorEncounter();
        setTimeout(() => checkEvolution(), 300);
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
window.checkEventFloor = checkEventFloor;
window.showEventFloor = showEventFloor;
window.showContractAltar = showContractAltar;
window.showRandomEncounter = showRandomEncounter;
window.winBattleContinueFrom = winBattleContinueFrom;
