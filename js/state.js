// Global runtime state (single source of truth)
let floor = 1, dungeonStage = 1, gold = 0, player = null, enemy = null;
let playerState = typeof createDefaultPlayerState === 'function'
    ? createDefaultPlayerState()
    : { corruption: 0, purification: 0 };
let defendingTurns = 0, dodgingTurns = 0, shieldedTurns = 0;
let regenTurns = 0, regenAmount = 0;
let isProcessing = false;
let currentShopItems = [];
let currentPotionOffer = null;
let lastEnemyJob = "";
let rerollCost = 10;
let currentUser = null;
const RANK_BASE_JOBS = ['인간 모험가'];
let rankRealtimeUnsubs = [];
let rankRealtimeCache = {};
window._combatLogHistory = [];

// Core balance constants shared by player/combat/UI modules.
const BASE_HIT_ACCURACY = (typeof BALANCE !== 'undefined' && BALANCE.baseHitAccuracy) || 90;
const LIFESTEAL_SOFT_CAP = (typeof BALANCE !== 'undefined' && BALANCE.lifestealSoftCap) || 0.85;

const CRIT_SOFT_CAP = (typeof BALANCE !== 'undefined' && BALANCE.critSoftCap) || 65;
const CRIT_OVERFLOW_TO_MULT = (typeof BALANCE !== 'undefined' && BALANCE.critOverflowToMult) || 0.05;
const CRIT_MULT_HARD_CAP = (typeof BALANCE !== 'undefined' && BALANCE.critMultHardCap) || 5;

const DIVINE_POWER_MAX = (typeof BALANCE !== 'undefined' && BALANCE.divinePowerMax) || 20;
const DIVINE_BLESSING_THRESHOLD = (typeof BALANCE !== 'undefined' && BALANCE.divineBlessingThreshold) || 20;
const DIVINE_BLESSING_DEF_BONUS = (typeof BALANCE !== 'undefined' && BALANCE.divineBlessingDefBonus) || 20;
const DIVINE_BLESSING_LIFESTEAL_BONUS =
    (typeof BALANCE !== 'undefined' && BALANCE.divineBlessingLifestealBonus) || 0.05;
