#!/usr/bin/env node
'use strict';

/*
 * v3.5 캠페인 시뮬레이터 정의.
 * 직접 실행할 때만 동작하며 코드 수정 과정에서는 실행하지 않는다.
 */

const data = require('../data.js');

function seededRandom(seed) {
    let state = seed >>> 0;
    return function random() {
        state += 0x6d2b79f5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function readIntegerArgument(name, fallback) {
    const prefix = `--${name}=`;
    const argument = process.argv.find((value) => value.startsWith(prefix));
    const parsed = argument ? Number(argument.slice(prefix.length)) : fallback;
    return Number.isInteger(parsed) ? parsed : fallback;
}

function buildCampaign(seed) {
    const random = seededRandom(seed);
    const actor = data.createHumanAdventurer({ random });
    return {
        seed,
        actor,
        progress: data.createDungeonProgress(1, 1),
        permanentDeath: false,
        ghostArchive: {},
    };
}

function advanceCampaign(campaign) {
    if (campaign.permanentDeath) return campaign;
    const next = data.advanceDungeonProgress(campaign.progress);
    campaign.progress = { floor: next.floor, stage: next.stage };
    return campaign;
}

function killCampaignActor(campaign, killedBy) {
    if (campaign.permanentDeath) return null;
    const ghost = data.snapshotAdventurerForGhost(campaign.actor, campaign.progress, killedBy);
    if (!Array.isArray(campaign.ghostArchive[ghost.positionKey])) campaign.ghostArchive[ghost.positionKey] = [];
    campaign.ghostArchive[ghost.positionKey].push(ghost);
    campaign.actor.hp = 0;
    campaign.actor.permanentDeath = true;
    campaign.permanentDeath = true;
    return ghost;
}

function summarizeCampaign(campaign) {
    return {
        seed: campaign.seed,
        startingStats: campaign.actor.stats,
        position: data.formatDungeonPosition(campaign.progress),
        canReturnToBaseCamp: data.canReturnToBaseCamp(campaign.progress),
        permanentDeath: campaign.permanentDeath,
        archivedGhosts: Object.values(campaign.ghostArchive).reduce((sum, ghosts) => sum + ghosts.length, 0),
    };
}

function main() {
    const seed = readIntegerArgument('seed', 3500);
    const stages = Math.max(0, readIntegerArgument('stages', 0));
    const campaign = buildCampaign(seed);
    for (let index = 0; index < stages; index += 1) advanceCampaign(campaign);
    console.log(JSON.stringify(summarizeCampaign(campaign), null, 2));
}

if (require.main === module) main();

module.exports = {
    seededRandom,
    buildCampaign,
    advanceCampaign,
    killCampaignActor,
    summarizeCampaign,
};
