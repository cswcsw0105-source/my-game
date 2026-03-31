// Combat core module (stage 4 split)
function setCombatProcessing(flag) {
    isProcessing = !!flag;
    updateCombatButtonsLockState();
}
function updateCombatButtonsLockState() {
    const div = document.getElementById('action-btns');
    if (!div) return;
    const buttons = div.querySelectorAll('button');
    buttons.forEach((btn) => {
        btn.classList.toggle('combat-btn-processing', !!isProcessing);
        if (isProcessing) btn.setAttribute('aria-disabled', 'true');
        else btn.removeAttribute('aria-disabled');
    });
}
function queueEnemyTurnWithPacing() {
    const delay = 1000 + Math.floor(Math.random() * 401);
    setCombatProcessing(true);
    window._enemyThinkingHint = '타락한 선구자가 당신의 빈틈을 노립니다...';
    writeLog(`[긴장] ${window._enemyThinkingHint}`);
    updateUi();
    setTimeout(() => {
        window._enemyThinkingHint = '';
        enemyTurn();
    }, delay);
}
function triggerBossWarning(on) {
    const s = document.querySelector('.screen');
    if (s) {
        if (on) {
            s.classList.add('boss-warning');
            s.classList.add('boss-warning-glow');
        } else {
            s.classList.remove('boss-warning');
            s.classList.remove('boss-warning-glow');
        }
    }
}
function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
        def = 0,
        crit = 0,
        critMult = 0,
        ls = 0;
    for (const it of fm.mercItems || []) {
        if (!it) continue;
        if (it.type === 'atk' || it.type === 'ring') atk += safeNum(it.value, 0);
        if (it.type === 'hp') hp += safeNum(it.value, 0);
        if (it.def) def += safeNum(it.def, 0);
        if (it.critBonus) crit += safeNum(it.critBonus, 0);
        if (it.critMult) critMult += safeNum(it.critMult, 0);
        if (it.lifesteal) ls += safeNum(it.lifesteal, 0);
    }
    fm.mercBonusAtk = atk;
    fm.mercBonusHp = hp;
    fm.mercBonusAcc = 0;
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

function applySummonDarkTurnStart() {
    if (!player || !enemy || !player._awaitPlayerTurn) return;
    player._awaitPlayerTurn = false;
    if (player.name === '소환사' && floor < 100) {
        return false;
    }
    if (player.summon && player.summon.id === 'dark') {
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

window.useAction = async (type) => {
    if (isProcessing) return;
    setCombatProcessing(true);
    if (type === '공격') {
        const now = Date.now();
        if (now < attackGcdUntil) {
            setCombatProcessing(false);
            return writeLog(`[쿨다운] 공격을 너무 빨리 눌렀습니다!`);
        }
    }
    if (applySummonDarkTurnStart()) {
        setCombatProcessing(false);
        return;
    }
    if (player) ensurePlayerSynergyBonuses();

    if (type==='공격') {
        await playJobAttackVfx('player', player.name || player.baseJob);
        const now = Date.now();
        attackGcdUntil = now + ATTACK_GCD_MS;
        setTimeout(() => { renderActions(); }, ATTACK_GCD_MS);

        if (player.unlockedSkill && floor >= 20) {
            player.ultStack = Math.min(player.ultMaxStack, player.ultStack + 1);
        }
        let multiplier=1.0, effectMsg="";
        const relKey=getAffinityRelKey();
        if(!enemy.isBoss&&relations[relKey]){
            if(relations[relKey].strong===enemy.job){multiplier=1.5;effectMsg="<b style='color:#2ed573'>(상성 우위!)</b> ";}
            else if(relations[relKey].weak===enemy.job){multiplier=0.8;effectMsg="<b style='color:#ff4757'>(상성 열세..)</b> ";}
        }
        const synAcc = safeNum(player._syn && player._syn.acc, 0);
        const mercAcc = isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0 ? getMercBonusAcc() : 0;
        const missPenalty = consumeHunterEvasionMissPenalty();
        const accRateBase =
            Math.min(95, BASE_HIT_ACCURACY + safeNum(player.acc, 0) + synAcc + mercAcc);
        const accRate = Math.max(5, accRateBase - missPenalty);
        let hitLanded = false;
        const prevStreak = safeNum(player._playerMissStreak, 0);
        if (prevStreak >= 3) {
            hitLanded = true;
            player._playerMissStreak = 0;
        } else if (Math.random() * 100 < accRate) {
            hitLanded = true;
            player._playerMissStreak = 0;
        } else {
            player._playerMissStreak = prevStreak + 1;
        }
        if(hitLanded){
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
                playCritGoldBurst('enemy');
            } else {
                if (player && player.priestNextCrit) {
                    isCrit = true;
                    player.priestNextCrit = false;
                    effectMsg += "<b style='color:#f1c40f'>✨ 신의 가호 치명!</b> ";
                } else {
                    isCrit = Math.random()*100<effectiveCrit;
                }
                if(isCrit){baseDmg=Math.floor(baseDmg*(mercCritMode?getMercEffectiveCritMultForMercAttack():getEffectiveCritMult()));effectMsg+="<b style='color:#f1c40f'>💥 치명타!</b> ";triggerCritEffect(); playCritGoldBurst('enemy');}
            }
            const effDefRaw = (usedWeak ? 0 : enemy.def);
            const effDef = player && player.chosenPriest ? Math.floor(effDefRaw * 0.8) : effDefRaw;
            let finalDmg=Math.max(1,Math.floor(baseDmg*multiplier*relicAtkMult)-effDef);
            if (enemy._aiGuardedTurns && enemy._aiGuardedTurns > 0) {
                finalDmg = Math.max(1, Math.floor(finalDmg * 0.62));
                enemy._aiGuardedTurns = Math.max(0, enemy._aiGuardedTurns - 1);
                writeLog('[적 AI] 방어 태세로 피해 일부를 흘렸습니다.');
            }
            enemy.curHp-=finalDmg;
            showDmgFloat(finalDmg,isCrit,false); triggerShakeEffect();
            writeLog(`[명중] ${effectMsg}적에게 ${finalDmg} 피해!`);
            if(mercCritMode&&player.fieldMerc&&safeNum(player.fieldMerc.mercBonusLifesteal,0)>0){
                const mls=Math.min(LIFESTEAL_SOFT_CAP,safeNum(player.fieldMerc.mercBonusLifesteal,0));
                const mh=Math.floor(finalDmg*mls);
                player.fieldMerc.mercHp=Math.min(player.fieldMerc.mercMaxHp,player.fieldMerc.mercHp+mh);
                if(mh>0) writeLog(`[용병 흡혈] 💉 ${mh}`);
            } else if(getLifestealEffective()>0){const h=Math.floor(finalDmg*getLifestealEffective());player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+h);writeLog(`[흡혈] 💉 ${h}`);}
            if (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) {
                const rh = Math.floor(finalDmg * 0.25);
                player.curHp = Math.min(getEffectiveMaxHp(), player.curHp + rh);
                writeLog(`[패시브] 광폭화 흡혈 +${rh}`);
            }
            if (player.summon && player.summon.id === 'fire' && enemy.curHp > 0) {
                const fireDmg = Math.max(1, Math.floor(getEffectiveAttackPower() * 0.06));
                enemy.curHp -= fireDmg;
                writeLog(`[소환] 🔥 불의 정령 추가 피해 ${fireDmg}!`);
                showDmgFloat(fireDmg, false, false);
                if (enemy.curHp <= 0) { updateUi(); renderActions(); return winBattle(); }
            }

            if(player.bonusSkills){
                if(player.bonusSkills.includes('bonus_bleed')&&Math.random()<0.10){const bd=Math.floor(finalDmg*0.8);enemy.curHp-=bd;writeLog(`[스킬] 피의 분노! ${bd} 추가 피해!`);showDmgFloat(bd,false,false);}
                if(isCrit&&player.bonusSkills.includes('bonus_explode')){const ed=Math.floor(getEffectiveAttackPower()*0.5);enemy.curHp-=ed;writeLog(`[스킬] 폭발 일격! ${ed} 추가 피해!`);showDmgFloat(ed,false,false);}
            }
            if(isCrit&&player.relics&&player.relics.includes('chain_cast')&&enemy.curHp>0){
                player._arcaneCharge = true;
                writeLog(`[유물] ⚡ 연쇄 마법진: 다음 공격 피해 증폭 준비!`);
            }
            if(enemy.curHp<=0&&player.relics&&player.relics.includes('kill_heal')){
                const kh=Math.floor(getEffectiveMaxHp()*0.10);
                player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+kh);
                player.critMult = safeNum(player.critMult, 1.8) + 0.03;
                writeLog(`[유물] 💚 혈반지 흡수! 회복 ${kh}, 치명 배율 +3%`);
            }
        } else { writeLog(`[빗나감] 공격 실패!`); triggerDodgeMove('enemy'); showMissFloat('enemy'); }
        updateUi(); renderActions();
        if(enemy.curHp<=0) return winBattle();

    } else if (type==='궁극기') {
        await playJobAttackVfx('player', player.name || player.baseJob);
        if (player.ultStack < player.ultMaxStack) return writeLog(`[궁극기] 스택이 부족합니다! (${player.ultStack}/${player.ultMaxStack})`);
        player.ultStack = 0;
        const ultSpec = ultSkills[player.unlockedSkill];
        const dmgMult = ultSpec ? ultSpec.dmgMult : 4.0;
        const missPenalty = consumeHunterEvasionMissPenalty();
        const ultHitRate = Math.max(5, 50 - missPenalty);
        if (Math.random() * 100 < ultHitRate) {
            let berserkMult = (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) ? 1.35 : 1;
            let ultDmg = Math.floor(getEffectiveAttackPower() * dmgMult * berserkMult);
            const critInfo=getCritInfo();
            const isCrit = Math.random()*100 < critInfo.effectiveCrit;
            if (isCrit) { ultDmg = Math.floor(ultDmg*getEffectiveCritMult()); triggerCritEffect(); playCritGoldBurst('enemy'); }
            if (enemy._aiGuardedTurns && enemy._aiGuardedTurns > 0) {
                ultDmg = Math.max(1, Math.floor(ultDmg * 0.62));
                enemy._aiGuardedTurns = Math.max(0, enemy._aiGuardedTurns - 1);
                writeLog('[적 AI] 방어막이 궁극기 피해를 일부 상쇄했습니다.');
            }
            enemy.curHp -= ultDmg;
            showDmgFloat(ultDmg, isCrit, false); triggerShakeEffect();
            writeLog(`[궁극기] 💥 ${player.unlockedSkill} 炸裂! ${isCrit?'🔥 치명타! ':''}${ultDmg} 피해!`);
            if (getLifestealEffective()>0) { const h=Math.floor(ultDmg*getLifestealEffective()); player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+h); writeLog(`[흡혈] 💉 ${h}`); }
            if (player.name==='버서커' && player.curHp <= player.maxHp * 0.5) {
                const rh = Math.floor(ultDmg * 0.25);
                player.curHp = Math.min(getEffectiveMaxHp(), player.curHp + rh);
                writeLog(`[패시브] 광폭화 흡혈 +${rh}`);
            }
            if (enemy.curHp<=0) { updateUi(); renderActions(); return winBattle(); }
        } else {
            writeLog(`[궁극기] ❌ ${player.unlockedSkill} 발동 실패! (50% 확률)`);
        }
        updateUi(); renderActions();

    } else if (type==='방패방어') {
        const guardRate = 70 + (player._guardBonus||0);
        if(Math.random()*100<guardRate){defendingTurns=2;writeLog(`[성공] 🛡️ 2턴간 피해 60% 감소!`);if(player.relics&&player.relics.includes('shield_empower')){player.shieldEmpowered=true;const rh=Math.floor(getEffectiveMaxHp()*0.08);player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+rh);writeLog(`[유물] ⚡ 철벽의 의지 발동! 회복 +${rh}, 다음 공격 강화`);}}
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
        if (player.prayerCountThisTurn >= 2) {
            queueEnemyTurnWithPacing();
        } else {
            setCombatProcessing(false);
        }
        return;
    }
    queueEnemyTurnWithPacing();
};

window.usePotion = () => {
    if (isProcessing) return;
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
        const h = Math.floor(getEffectiveMaxHp() * 0.12);
        player.curHp = Math.min(getEffectiveMaxHp(), player.curHp + h);
        writeLog(`[포션] 🧪 단장 긴급 체력 ${h} (동료 없음·최소 회복)`);
    } else if(player.hasRegenPotion){regenTurns=2;regenAmount=Math.floor(getEffectiveMaxHp()*0.25);writeLog(`[포션] 🧪 서서히 회복! (2턴간 매 턴 ${regenAmount})`);}
    else{const h=Math.floor(getEffectiveMaxHp()*0.35);player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+h);writeLog(`[포션] 🧪 즉시 체력 ${h} 회복!`);}
    updateUi(); renderActions();
};

let autoRegenCounter = 0;
function enemyTurn() {
    setTimeout(async () => {
        if (!enemy || !player) return;
        let earlyUnlockSet = false;
        const scheduleEarlyUnlock = (animMs) => {
            const ms = Math.max(0, safeNum(animMs, 0) - 200);
            setTimeout(() => {
                earlyUnlockSet = true;
                setCombatProcessing(false);
            }, ms);
        };
        if (player && player.name === '성직자') {
            player.prayerCountThisTurn = 0;
        }
        if (isMercenaryCaptainJob()) {
            player.mercBattleTurnCount = safeNum(player.mercBattleTurnCount, 0) + 1;
        }
        if(regenTurns>0){player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+regenAmount);regenTurns--;writeLog(`[재생] 💚 ${regenAmount} 회복! (남은 턴: ${regenTurns})`);}
        if (isMercenaryCaptainJob() && player.mercRegenTurns > 0 && player.fieldMerc && player.fieldMerc.mercHp > 0) {
            player.fieldMerc.mercHp = Math.min(player.fieldMerc.mercMaxHp, player.fieldMerc.mercHp + player.mercRegenAmount);
            player.mercRegenTurns--;
            writeLog(`[용병 재생] 💚 ${player.mercRegenAmount} (남은 턴: ${player.mercRegenTurns})`);
        }
        potionUsedThisTurn=false;

        if (player.bonusSkills && player.bonusSkills.includes('bonus_regen')) {
            autoRegenCounter++;
            if (autoRegenCounter % 3 === 0) { const h=Math.floor(getEffectiveMaxHp()*0.05); player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+h); writeLog(`[스킬] 강철 심장 ${h} 회복!`); }
        }

        let hitLanded=true, currentEnemyAtk=enemy.atk;
        const enemyHpRate = safeNum(enemy.curHp, 1) / Math.max(1, safeNum(enemy.hp, 1));
        const playerHpRate = safeNum(player.curHp, 1) / Math.max(1, safeNum(getEffectiveMaxHp(), 1));
        const isHunterEnemy = String(enemy.job || '').includes('헌터');
        const hunterExecutionMode = isHunterEnemy && playerHpRate <= 0.4;
        let enemyIntent = 'attack';
        if (!enemy.isBoss) {
            if (enemyHpRate < 0.9 && Math.random() < 0.18) enemyIntent = 'guard';
            if (String(enemy.job || '').includes('마법사') && enemyHpRate <= 0.38 && Math.random() < 0.65) enemyIntent = 'barrier';
            if (isHunterEnemy && enemyHpRate <= 0.4 && Math.random() < 0.55) enemyIntent = 'evasion';
            if (hunterExecutionMode) enemyIntent = 'attack';
            if (enemyHpRate >= 0.9 && (enemyIntent === 'guard' || enemyIntent === 'barrier')) enemyIntent = 'attack';
        }
        if (String(enemy.job || '').includes('워리어') && enemyHpRate <= 0.45) {
            currentEnemyAtk = Math.floor(currentEnemyAtk * (enemyHpRate <= 0.25 ? 1.55 : 1.3));
            writeLog('[적 AI] 광폭한 압박! 체력이 낮아진 적의 공격이 폭증합니다.');
        }
        if (enemyIntent === 'guard') {
            enemy._aiGuardedTurns = 1;
            writeLog('[적 AI] 적이 자세를 낮추고 방어 태세를 취합니다.');
            player._awaitPlayerTurn = true;
            setCombatProcessing(false);
            updateUi(); renderActions();
            return;
        }
        if (enemyIntent === 'barrier') {
            enemy._aiGuardedTurns = 2;
            writeLog('[적 AI] 마법사가 긴급 방어막을 전개했습니다.');
            player._awaitPlayerTurn = true;
            setCombatProcessing(false);
            updateUi(); renderActions();
            return;
        }
        if (enemyIntent === 'evasion') {
            enemy._hunterEvasionTurns = 1;
            writeLog('[적 AI] 헌터가 몸을 낮추고 회피 자세를 취합니다. 다음 1턴, 당신의 공격은 빗나가기 쉬워집니다.');
            player._awaitPlayerTurn = true;
            setCombatProcessing(false);
            updateUi(); renderActions();
            return;
        }
        if(enemy.isBoss){
            if(enemy.bossCharge){writeLog(`💥 [강공격] 보스의 묵직한 일격!!`);currentEnemyAtk=enemy.atk*2.5;enemy.bossCharge=false;triggerBossWarning(false);}
            else if(enemy.turnCount%4===3){
                enemy.bossCharge=true;
                triggerBossWarning(true);
                writeLog(`⚠️ [위험] 보스가 강공격을 준비합니다!`);
                enemy.turnCount++;
                await waitMs(220);
                player._awaitPlayerTurn = true;
                setCombatProcessing(false);
                updateUi();
                renderActions();
                return;
            }
            enemy.turnCount++;
        }
        if(dodgingTurns>0){
            dodgingTurns--;
            if(Math.random()*100<75){
                writeLog(`[회피 성공] 💨 적의 공격을 피했습니다!`); hitLanded=false;
                triggerDodgeMove('player'); showMissFloat('player');
                if(player.relics&&player.relics.includes('dodge_counter')){const cd=Math.max(1,Math.floor(player.atk*0.9)-Math.floor(enemy.def*0.6));enemy.curHp-=cd;writeLog(`[유물] 🗡️ 그림자 반격! ${cd} 피해!`);showDmgFloat(cd,false,false);if(enemy.curHp<=0){setTimeout(()=>winBattle(),100);return;}}
            } else writeLog(`[회피 실패] 피하지 못했습니다!`);
        }
        if(hitLanded){
            const enemyHitRate = hunterExecutionMode ? 100 : 80;
            if(Math.random()*100<enemyHitRate){
                if (enemy.isBoss) {
                    scheduleEarlyUnlock(660);
                    await playBossStrikeVfx('player');
                } else {
                    scheduleEarlyUnlock(360);
                    await playJobAttackVfx('enemy', enemy.job || '');
                }
                let dmg=Math.max(1,currentEnemyAtk-getTotalPlayerDefenseForHit());
                if (hunterExecutionMode) {
                    dmg = Math.max(1, Math.floor(dmg * 1.45));
                    writeLog('[헌터 AI] ☠️ 처형인 본능 발동! 약해진 상대를 향해 확정 치명타 급 습격!');
                    triggerCritEffect();
                    playCritGoldBurst('player');
                }
                if(shieldedTurns>0){dmg=Math.floor(dmg*0.5);shieldedTurns--;writeLog(`[방어막] ✨ 피해 50% 감소! (${dmg} 입음)`); triggerGuardAura(); if(player.relics&&player.relics.includes('barrier_reflect')){const rd=Math.floor(dmg*0.45);enemy.curHp-=rd;const heal=Math.floor(getEffectiveMaxHp()*0.05);player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+heal);writeLog(`[유물] 🔮 마력 방벽: 반사 ${rd}, 회복 ${heal}`);if(enemy.curHp<=0){setTimeout(()=>winBattle(),100);}}}
                else if(defendingTurns>0){dmg=Math.floor(dmg*0.4);defendingTurns--;writeLog(`[철벽 방어] 🛡️ 피해 60% 감소! (${dmg} 입음)`); triggerGuardAura();}
                else writeLog(`[피격] 적의 공격! ${dmg} 데미지.`);
                if (player.summon && player.summon.id === 'golem') {
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
                if (String(enemy.job || '').includes('헌터')) {
                    if (player.hunterExposeReady) {
                        const bonusFixed = Math.max(1, Math.floor(getEffectiveMaxHp() * 0.1));
                        player.curHp = Math.max(0, player.curHp - bonusFixed);
                        player.hunterExposeReady = false;
                        player.hunterExposeStacks = 0;
                        playAssassinStrikeVfx('player');
                        writeLog(`[헌터] 🎯 약점 공격 발동! 추가 고정 피해 ${bonusFixed}`);
                    } else {
                        player.hunterExposeStacks = Math.max(0, safeNum(player.hunterExposeStacks, 0)) + 1;
                        const cur = Math.min(3, player.hunterExposeStacks);
                        writeLog(`[헌터] 약점을 간파합니다... (${cur}/3)`);
                        if (player.hunterExposeStacks >= 3) {
                            player.hunterExposeReady = true;
                            writeLog('[헌터] 다음 타격은 치명적인 약점 공격으로 강화됩니다!');
                        }
                    }
                }
                }
            } else { writeLog(`[럭키] 적의 공격이 빗나갔습니다!`); triggerDodgeMove('player'); showMissFloat('player'); }
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
        if (!earlyUnlockSet) setCombatProcessing(false);
        updateUi(); renderActions();
    }, 120);
}

function winBattle() {
    setCombatProcessing(false);
    triggerBossWarning(false);
    let baseGain;
    if(floor<=10){baseGain=enemy.isBoss?50+floor*5:28+Math.floor(Math.random()*8)+floor*2;}
    else{baseGain=enemy.isBoss?65+Math.floor(Math.random()*30)+floor*4:14+Math.floor(Math.random()*12)+Math.floor(floor*1.2);}
    let bonus=0, bonusMsg="";
    const relKey=getAffinityRelKey();
    if(!enemy.isBoss&&relations[relKey]&&relations[relKey].weak===enemy.job){bonus=Math.floor(baseGain*0.3);bonusMsg=` <b style='color:#f1c40f'>(역전 보너스 +${bonus}G!)</b>`;}
    const gain=baseGain+bonus;
    gold+=gain; totalGoldEarned+=gain;
    { const _em = getEffectiveMaxHp(); player.curHp = Math.min(_em, player.curHp + Math.floor(_em * 0.15)); }
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
    if (floor > 20 && player.farmingStay) proceedWinBattleFarmContinue();
    else proceedWinBattleNextFloor();
}

function dungeonClear() {
    triggerBossWarning(false);
    const sg=Math.floor(totalGoldEarned*0.1), ps=getSavedGold();
    localStorage.setItem('saved_gold',ps+sg); exitBattleLayout();
    document.getElementById('battle-area').style.display='none';
    document.querySelector('.screen').innerHTML=`<div style="text-align:center;padding:40px 20px;"><h2 style="color:#f1c40f;font-size:2em;">🏆 던전 클리어!</h2><p style="color:#e0e0e0;font-size:1.1em;margin:15px 0;"><b style="color:#f1c40f;">${player.name}</b>이(가) 100층을 정복했습니다!</p><p style="color:#2ed573;font-size:0.95em;margin-bottom:5px;">💰 보존 골드: <b>${sg}G</b></p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px;"><button onclick="startInfiniteMode()" style="background:#9b59b6;color:#fff;padding:14px 24px;font-size:1em;font-weight:700;">♾️ 무한모드 도전</button><button onclick="location.reload()" style="background:#f1c40f;color:#111;padding:14px 24px;font-size:1em;font-weight:700;">🏠 메인으로</button></div></div>`;
    writeLog(`🏆 ${player.name}이(가) 100층을 클리어했습니다!!!`);
}

function gameOver() {
    setCombatProcessing(false);
    triggerBossWarning(false);
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

window.setCombatProcessing = setCombatProcessing;
window.updateCombatButtonsLockState = updateCombatButtonsLockState;
window.queueEnemyTurnWithPacing = queueEnemyTurnWithPacing;
window.triggerBossWarning = triggerBossWarning;
window.applySummonDarkTurnStart = applySummonDarkTurnStart;
window.enemyTurn = enemyTurn;
window.winBattle = winBattle;
window.dungeonClear = dungeonClear;
window.gameOver = gameOver;
window.isMercenaryCaptainJob = isMercenaryCaptainJob;
window.getAffinityRelKey = getAffinityRelKey;
window.getMercGoldSkipCost = getMercGoldSkipCost;
window.getMercEffectiveAttackPower = getMercEffectiveAttackPower;
window.getMercBonusAcc = getMercBonusAcc;
window.getMercEffectiveCritForMercAttack = getMercEffectiveCritForMercAttack;
window.getMercEffectiveCritMultForMercAttack = getMercEffectiveCritMultForMercAttack;
window.getFieldMercAttackMult = getFieldMercAttackMult;
window.buildFieldMercFromTemplate = buildFieldMercFromTemplate;
window.getMercGachaCost = getMercGachaCost;
window.tryMercenaryRandomEvent = tryMercenaryRandomEvent;
