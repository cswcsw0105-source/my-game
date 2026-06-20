'use strict';

// v3.5에는 전투 외 랜덤 인카운터, 직업 이벤트, 전직 이벤트가 없다.
function hideEncounterPhaseUI() {
    window._encounterPhaseActive = false;
    window._encounterPhaseScene = null;
    const host = document.getElementById('encounter-phase');
    if (host) {
        host.style.display = 'none';
        host.innerHTML = '';
    }
}

function beginFloorEncounter() {
    hideEncounterPhaseUI();
    return spawnEnemy();
}

function processFloorQuestOnVictory() {}
function processFloorQuestOnLeave() {}
function processFloorMilestone() {}
function tryRandomEncounter() { return false; }
function startEncounterPhase() { return beginFloorEncounter(); }
function resumeRestockCrossroadContext() { return beginFloorEncounter(); }
function renderRestockCrossroad() { return beginFloorEncounter(); }
function resolveRestockCrossroad() { return beginFloorEncounter(); }

Object.assign(window, {
    hideEncounterPhaseUI,
    beginFloorEncounter,
    processFloorQuestOnVictory,
    processFloorQuestOnLeave,
    processFloorMilestone,
    tryRandomEncounter,
    startEncounterPhase,
    resumeRestockCrossroadContext,
    renderRestockCrossroad,
    resolveRestockCrossroad,
});
