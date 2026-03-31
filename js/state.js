// Global runtime state (single source of truth)
let floor = 1, gold = 0, player = null, enemy = null;
let defendingTurns = 0, dodgingTurns = 0, shieldedTurns = 0;
let regenTurns = 0, regenAmount = 0;
let isProcessing = false;
let currentShopItems = [];
let currentPotionOffer = null;
let lastEnemyJob = "";
let rerollCost = 10;
let currentUser = null;
const RANK_BASE_JOBS = ['워리어', '헌터', '마법사', '용병단장'];
let rankRealtimeUnsubs = [];
let rankRealtimeCache = {};
window._combatLogHistory = [];
