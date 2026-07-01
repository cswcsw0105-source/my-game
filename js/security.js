// Browser hardening layer. Loaded last inside bundle.js.
(function installDungeonClientHardening() {
    try {
    const warnSecurityFailure = (message, err) => {
        try {
            console.warn(message, err);
        } catch (_) {
            // 보안 초기화 중 경고 출력 자체가 실패해도 게임 루프는 계속 진행한다.
        }
    };

    const safeHasOwn = (target, name) => {
        try {
            return Object.prototype.hasOwnProperty.call(target, name);
        } catch (err) {
            warnSecurityFailure(`[보안] 프로퍼티 확인 실패: ${name}`, err);
            return false;
        }
    };

    const safeGetDescriptor = (target, name) => {
        try {
            return Object.getOwnPropertyDescriptor(target, name);
        } catch (err) {
            warnSecurityFailure(`[보안] 프로퍼티 설명자 확인 실패: ${name}`, err);
            return null;
        }
    };

    const safeGetValue = (target, name) => {
        try {
            return target[name];
        } catch (err) {
            warnSecurityFailure(`[보안] 프로퍼티 접근 실패: ${name}`, err);
            return undefined;
        }
    };

    const safeDeleteWindowProperty = (name) => {
        try {
            const descriptor = safeGetDescriptor(window, name);
            if (descriptor && descriptor.configurable === false) {
                warnSecurityFailure(`[보안] 내부 전역 제거 건너뜀(삭제 불가): ${name}`);
                return false;
            }
            const deleted = delete window[name];
            if (!deleted && safeHasOwn(window, name)) {
                warnSecurityFailure(`[보안] 내부 전역 제거 실패(반환 false): ${name}`);
            }
            return deleted;
        } catch (err) {
            warnSecurityFailure(`[보안] 내부 전역 제거 실패: ${name}`, err);
            return false;
        }
    };

    const safeDefineWindowProperty = (name, descriptor, label) => {
        try {
            const current = safeGetDescriptor(window, name);
            if (current && current.configurable === false) {
                warnSecurityFailure(`[보안] ${label} 건너뜀(재정의 불가): ${name}`);
                return false;
            }
            Object.defineProperty(window, name, descriptor);
            return true;
        } catch (err) {
            warnSecurityFailure(`[보안] ${label} 실패: ${name}`, err);
            return false;
        }
    };

    const runtimeKeepNames = new Set([
        'renderActions',
        'updateUi',
        'writeLog',
        'setCombatProcessing',
        'updateCombatButtonsLockState',
        'getActorAttackSpeed',
        'getActorAttackStrikeCount',
        'getActorPostAttackCooldownTurns',
        'canActorAttackThisTurn',
        'getEnemyGuardStateFor',
        'choosePlayerEnemyTarget',
        'hasLivingEnemies',
        'getEnemyPartyMembers',
        'getLivingEnemyPartyMembers',
        'isEnemyPartyMember',
        'syncEnemyPartyAggregateState',
        'ensurePartyMemberRuntimeShape',
        'getPartyMembers',
        'getLivingPartyMembers',
        'isPartyMember',
        'syncPartyAggregateState',
        'playV35AttackVfx',
        'playMagicBurstVfx',
        'showMissFloat',
        'triggerGuardAura',
        'triggerDodgeMove',
    ]);

    const protectedStateNames = [
        'player',
        'playerState',
        'enemy',
        'floor',
        'gold',
        'currentShopItems',
        'currentPotionOffer',
        'lastEnemyJob',
        'rerollCost',
        'defendingTurns',
        'dodgingTurns',
        'shieldedTurns',
        'regenTurns',
        'regenAmount',
        'isProcessing',
    ];

    const publicApiNames = [
        'handleSignup',
        'handleLogin',
        'handleLogout',
        'resumeMetaSlot',
        'switchActiveSaveFile',
        'requestDeleteSaveFile',
        'reincarnateFromHub',
        'startNewCharacterPrologue',
        'choosePrologueMemory',
        'advanceProloguePhase',
        'chooseIntroWeapon',
        'openTechLinePicker',
        'deleteRunSnapshotForSlot',
        'buyCampPermaNext',
        'buyPermUpgradeNext',
        'buyPermUpgrade',
        'selectJobAndStart',
        'pickMercCompanion',
        'toggleEvolutionMap',
        'evolve',
        'resolveMercEvolution',
        'saveAndExitToMain',
        'exitToMainWithoutSave',
        'openBaseCampTech',
        'buyTechNode',
        'continuePastCentury',
        'returnToHubFromCenturyMilestone',
        'reincarnateFromCenturyMilestone',
        'togglePreferredItem',
        'setInventoryPartyTab',
        'togglePatchNotes',
        'toggleRank',
        'toggleGuide',
        'toggleInv',
        'mercGoldSkipCooldown',
        'useMercenarySlot',
        'setCodexTab',
        'setCodexStatFilter',
        'toggleCollection',
        'startInfiniteMode',
        'rollPartyStats',
        'rollPartyRoleStats',
        'confirmPartyAdventure',
        'returnPartyToTown',
        'enterDungeonFromTown',
        'leaveShopContinueAscent',
        'leaveShopTrainHere',
        'nextFloor',
        'rerollShop',
        'buyPotionOffer',
        'buyShopRarityBoost',
        'sellItemByUid',
        'repairStarterGearByUid',
        'buyItem',
        'mercenaryFundGacha',
        'startCombat',
        'executeActiveTurn',
        'advanceNextTurn',
        'advanceInitiativeTurn',
        'useAction',
        'usePotion',
        'resumeFromLastSaveAfterDeath',
        'finalizeGameOverDeath',
        'enterCombatFromEncounter',
        'ambushEncounterEnemy',
        'openPanicRunSacrificeModal',
        'closePanicRunModal',
        'executePanicRunAuto',
        'executePanicRunSacrifice',
        'resolveTreasureChest',
        'resolveRestSpot',
        'resolveAltarOption',
        'skipAltarOption',
        'resolveStatSwap',
        'resolveSkillEvent',
        'resolveForge',
        'resolveContractAltar',
        'resolveEncounter',
        'resolveRestockCrossroad',
        'checkStoryMilestone',
        'applyStoryChoiceImpact',
        'adjustPlayerStoryState',
    ];

    const internalExportNames = [
        'RESTORED_ITEM_DATA',
        'MetaRPG',
        'BASE_CAMP_FLOORS',
        'PARTY_ROLE_KEYS',
        'PARTY_ROLE_DEFINITIONS',
        'applyOfficialStatsToEquipmentItem',
        'clampEquipmentItemStatsToRarityCaps',
        'computeEquipmentGoldPrice',
        'computeFloorGoldReward',
        'rollPartyRoleStartingStats',
        'rollPartyStartingStats',
        'rerollPartyRoleStartingStats',
        'normalizePartyMember',
        'normalizeAdventurerParty',
        'createAdventurerParty',
        'isStarterGearItem',
        'applyStarterGearStats',
        'buildStarterGearItem',
        'buildStarterEquipmentSet',
        'getStarterGearUpgradeCost',
        'upgradeStarterGearItem',
        'normalizeFloorGrowth',
        'computeFloorGrowthForClears',
        'getFloorGrowthStep',
        'tacticalSkillChoices',
        'tacticalSkillMilestones',
        'getTacticalSkillDef',
        'getTacticalSkillMilestoneForFloor',
        'storyData',
        'createDefaultPlayerState',
        'normalizePlayerState',
        'getStoryRouteKey',
        'getStoryEndingKey',
        'getStoryTitleForState',
        'getStoryChoiceImpact',
        'getStoryMilestoneDef',
        'getGlitchedMonsterName',
        'RUNE_POOL_COUNT',
        'ensurePlayerSynergyBonuses',
        'getEffectiveMaxHp',
        'getRawCritChance',
        'getCritOverflowForMult',
        'getCritOverflowMultBonus',
        'clampCritMultiplier',
        'getCritBaseMultBeforeOverflow',
        'getEffectiveCritMult',
        'applyRebirthPctBonusToPlayer',
        'applyOwnedEquipmentItemBonuses',
        'fullResyncPlayerCombatStatsFromMetaAndInventory',
        'getCritInfo',
        'getLifestealEffective',
        'getLifestealOverflowAtk',
        'getPlayerDamageReduction',
        'getPlayerPotionHealMultiplier',
        'isPriestJob',
        'isPriestBlessed',
        'isChosenPriest',
        'formatDivinePowerForDisplay',
        'clampDivinePower',
        'normalizeDivineState',
        'getDivineAtkBonus',
        'getDivineDefBonus',
        'recalcPlayerDivineGainMult',
        'addDivinePower',
        'getEffectiveAttackPower',
        'getTotalPlayerDefenseForHit',
        'getPlayerGoldGainMult',
        'getPlayerFleeBonus',
        'showDmgFloat',
        'triggerCritEffect',
        'triggerShakeEffect',
        'triggerScreenShakeHeavy',
        'triggerScreenShakeBoss',
        'triggerBossDim',
        'triggerGuardAura',
        'triggerDodgeMove',
        'ensureCombatFxLayer',
        'getCardCenter',
        'normalizeCombatArchetype',
        'playMageBoltVfx',
        'playBerserkerChargeVfx',
        'playHunterStrikeVfx',
        'playMagicBurstVfx',
        'playAssassinStrikeVfx',
        'playCritGoldBurst',
        'playBossStrikeVfx',
        'showMissFloat',
        'playJobAttackVfx',
        'inferV35WeaponKind',
        'playV35AttackVfx',
        'consumeHunterEvasionMissPenalty',
        'renderActions',
        'renderPassiveContractHistoryPanels',
        'updateUi',
        'writeLog',
        'openPartyTownFromHub',
        'spawnEnemy',
        'tryActivateFloorQuest',
        'getEnemyScalingForFloor',
        'getBossMultiplier',
        'getBossSoftWallCalibration',
        'buildEnemyStatsForFloor',
        'getEnemyPartyMembers',
        'getLivingEnemyPartyMembers',
        'isEnemyPartyMember',
        'syncEnemyPartyAggregateState',
        'openShop',
        'renderShopLeaveButtons',
        'getUnlockedPoolItems',
        'getItemsByRarity',
        'getShopRarityChances',
        'applyGoldenBalanceShopPrice',
        'applyShopRarityTuning',
        'getShopRarityBoostPrice',
        'renderShopItems',
        'formatShopItemName',
        'formatShopItemDesc',
        'mercCaptainExclusiveItem',
        'getNonMercEquipmentPool',
        'setCombatProcessing',
        'updateCombatButtonsLockState',
        'getActorAttackSpeed',
        'getActorAttackStrikeCount',
        'getActorPostAttackCooldownTurns',
        'canActorAttackThisTurn',
        'getEnemyGuardStateFor',
        'choosePlayerEnemyTarget',
        'hasLivingEnemies',
        'queueEnemyTurnWithPacing',
        'triggerBossWarning',
        'applySummonDarkTurnStart',
        'enemyTurn',
        'winBattle',
        'dungeonClear',
        'gameOver',
        'isMercenaryCaptainJob',
        'getAffinityRelKey',
        'getMercGoldSkipCost',
        'getMercEffectiveAttackPower',
        'getMercBonusAcc',
        'getMercEffectiveCritForMercAttack',
        'getMercEffectiveCritMultForMercAttack',
        'getFieldMercAttackMult',
        'buildFieldMercFromTemplate',
        'getMercGachaCost',
        'tryMercenaryRandomEvent',
        'rollEncounterSceneType',
        'getPanicRunSacrificeItems',
        'pickLowestRaritySacrificeItem',
        'buildMonsterEncounterHtml',
        'buildTreasureEncounterHtml',
        'buildRestEncounterHtml',
        'buildAltarEncounterHtml',
        'buildEncounterPhaseHtml',
        'hideEncounterPhaseUI',
        'buildRestockCrossroadHtml',
        'renderRestockCrossroad',
        'maybeStartRestockCrossroad',
        'resumeRestockCrossroadContext',
        'beginFloorEncounter',
        'buildAltarEncounterOptions',
        'pushPassiveContractHistory',
        'advanceFloorAfterNonCombatEncounter',
        'checkEventFloor',
        'showEventFloor',
        'showContractAltar',
        'showRandomEncounter',
        'winBattleContinueFrom',
        'getEquipSlotKind',
        'getEquipSlotLimit',
        'getEquippedCountByKind',
        'canEquipMoreOfItem',
        'ensurePartyMemberRuntimeShape',
        'getPartyMembers',
        'getLivingPartyMembers',
        'isPartyMember',
        'syncPartyAggregateState',
    ];

    for (const name of internalExportNames) {
        if (!safeHasOwn(window, name)) continue;
        if (runtimeKeepNames.has(name)) continue;
        safeDeleteWindowProperty(name);
    }

    for (const name of protectedStateNames) {
        if (safeHasOwn(window, name)) continue;
        safeDefineWindowProperty(name, {
            get() {
                return undefined;
            },
            set() {
                warnSecurityFailure(`[보안] '${name}' 상태는 런타임 클로저 내부에 캡슐화되어 있습니다.`);
                return false;
            },
            enumerable: false,
            configurable: false,
        }, '전역 상태 보호');
    }

    for (const name of publicApiNames) {
        const value = safeGetValue(window, name);
        if (typeof value !== 'function') continue;
        safeDefineWindowProperty(name, {
            value,
            writable: false,
            enumerable: false,
            configurable: false,
        }, '공개 API 잠금');
    }

    safeDefineWindowProperty('__DUNGEON_SECURE_BUILD', {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false,
    }, '보안 빌드 플래그 설정');
    } catch (fatalErr) {
        try {
            console.warn('[보안] 보안 초기화 중 치명 예외를 흡수하고 게임 실행을 계속합니다.', fatalErr);
        } catch (_) {
            // 최후 방어선: 콘솔 경고조차 실패해도 예외를 재전파하지 않는다.
        }
    }
})();
