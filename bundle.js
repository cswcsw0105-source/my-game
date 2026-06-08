// Generated runtime bundle. Source files remain canonical; index.html loads this IIFE bundle.
(function dungeonRuntimeBundle(){
'use strict';

// ---- data.js ----
/**
 * v7 장비 확장 필드 (선택)
 * - tags: string[] — 시너지 키 (synergyRules.needTags 와 매칭)
 * - meta: { setId?, season? } — 향후 세트/시즌용 확장 슬롯
 */
const relations = {
    '워리어':  { weak: '마법사', strong: '헌터' },
    '헌터':   { weak: '워리어', strong: '마법사' },
    '마법사':  { weak: '헌터',  strong: '워리어' },
    '나이트':  { weak: '마법사', strong: '헌터' },
    '버서커':  { weak: '마법사', strong: '헌터' },
    '궁수':   { weak: '워리어', strong: '마법사' },
    '암살자':  { weak: '워리어', strong: '마법사' },
    '위저드':  { weak: '헌터',  strong: '워리어' },
    '소환사':  { weak: '헌터',  strong: '워리어' },
    '성직자':  { weak: '헌터',  strong: '워리어' },
};

const BALANCE = Object.freeze({
    baseHitAccuracy: 90,
    lifestealSoftCap: 0.85,
    critSoftCap: 65,
    critOverflowToMult: 0.05,
    critMultHardCap: 5,
    divinePowerMax: 20,
    divineBlessingThreshold: 20,
    divineBlessingDefBonus: 20,
    divineBlessingLifestealBonus: 0.05,

    enemyWallFloor: 30,
    enemyPreWallGrowth: 1.058,
    enemyPostWallGrowth: 1.067,
    enemyWallHpMult: 1.5,
    enemyWallAtkMult: 1.35,
    enemyWallDefMult: 2.18,
    upgradeFloorEquivalent: 1.25,

    rarityPower: {
        common: 1.15,
        rare: 1.85,
        epic: 3.4,
        legendary: 7,
        legend: 7,
    },
    goldReward: {
        normalBaseMin: 6,
        normalBaseMax: 10,
        floorStep: 3,
        normalMultiplier: 1.3,
        normalMin: 15,
        bossMultiplier: 2.4,
        bossFlatBonus: 20,
        bossFloorBonus: 2,
    },
    shopPriceByRarity: {
        common: { base: 40, floorStep: 2 },
        rare: { base: 120, floorStep: 5 },
        epic: { base: 400, floorStep: 15 },
        legendary: { base: 1500, floorStep: 50 },
    },
    floorGrowth: {
        atkPerFloor: 1,
        hpPerFloor: 5,
    },
    equipmentFloorWeightStep: 0.005,
    equipmentFloorWeightCap: 1.65,
    equipmentBaseStats: {
        weaponAtk: 14,
        ringAtk: 11,
        armorHp: 72,
        armorDef: 10,
        hybridDef: 4,
        crit: 5,
        critMult: 0.08,
        lifesteal: 0.03,
        prayerBonus: 1,
        divinityGainBonus: 0.015,
    },
});

const tacticalSkillChoices = Object.freeze({
    parry: Object.freeze({
        key: 'parry',
        name: '패링',
        type: 'defense',
        icon: '🛡️',
        shortDesc: '다음 피격 1회 무효화',
        battleLog: '다음 적 공격을 한 번 무력화합니다.',
    }),
    focus: Object.freeze({
        key: 'focus',
        name: '집중 공격',
        type: 'attack',
        icon: '🎯',
        shortDesc: '다음 공격 치명 확률 +60%',
        critBonus: 60,
        battleLog: '다음 공격의 치명타 확률이 크게 상승합니다.',
    }),
    barrier: Object.freeze({
        key: 'barrier',
        name: '방어막',
        type: 'defense',
        icon: '✨',
        shortDesc: '다음 피격 1회 무효화',
        battleLog: '붉은 마굴의 충격을 한 번 완전히 흘려냅니다.',
    }),
});

const tacticalSkillMilestones = Object.freeze([
    Object.freeze({ floor: 5, choices: Object.freeze(['parry', 'focus']) }),
    Object.freeze({ floor: 15, choices: Object.freeze(['barrier', 'focus']) }),
    Object.freeze({ floor: 30, choices: Object.freeze(['parry', 'barrier', 'focus']) }),
]);

const jobBase = {
    Warrior: { name: '워리어', hp: 300, atk: 19, def: 10, color: '#ff4757' },
    Hunter:  { name: '헌터',   hp: 245, atk: 25, def: 5,  color: '#2ed573' },
    Wizard:  { name: '마법사', hp: 185, atk: 42, def: 3,  color: '#1e90ff' },
    /** 동료 용병이 싸움. 단장은 직접 전투 불가에 가깝게 최하위 ATK */
    MercenaryCaptain: { name: '용병단장', hp: 210, atk: 5, def: 5, color: '#e67e22' },
};

const introPrologueText = Object.freeze({
    memoryPrompt:
        '정신을 차리려 눈을 감자, 기억의 파편들이 스쳐 지나갑니다. 당신이 기억하는 마지막 기억은 무엇입니까?',
    dangerPrompt:
        '당신은 과거에 엄청난 사건들이 가득했던 존재였습니다. 지금은 어떤 일인지 과거의 일이 하나도 기억나지 않습니다.. 그리고 현재 당신의 앞에는 몬스터가 침을 흘리며 당신을 쳐다보고 있습니다!',
    weaponPrompt:
        '옆에는 금방이라도 부셔질 것 같은 무기들이 널부러져 있습니다. 시간이 별로 없습니다. 무엇을 집겠습니까?',
});

const introMemoryChoices = Object.freeze({
    betrayed_heroes: {
        key: 'betrayed_heroes',
        label: '나를 배신한 동료들의 차가운 눈빛',
        raceKey: 'human',
        baseJobKey: 'Warrior',
    },
    demon_lord_mockery: {
        key: 'demon_lord_mockery',
        label: '나를 멸시하던 마왕의 비웃음',
        raceKey: 'demon',
        baseJobKey: 'Wizard',
    },
    burning_tribe: {
        key: 'burning_tribe',
        label: '불타오르던 고향 부족의 불길',
        raceKey: 'beastkin',
        baseJobKey: 'Hunter',
    },
});

const raceStories = Object.freeze({
    human: {
        key: 'human',
        name: '인간',
        color: '#f1c40f',
        summary: '배신당한 자',
        past:
            '인간 용사와 왕에게 이용당한 끝에 토사구팽당하고, 복수심만 남긴 채 마굴 아래로 떨어진 인간.',
        fragments: {
            runStart: [
                '왕의 깃발 아래에서 들었던 환호가 아직 귓가에 남아 있다. 마지막에 돌아온 것은 축복이 아니라 처형 명령이었다.',
                '당신을 용사라 부르던 인간들은 전쟁이 끝나자 가장 먼저 당신의 이름을 지웠다.',
            ],
            floorMilestones: {
                5: ['녹슨 검날에 왕실 문장이 비친다. 당신은 그 문장을 지키기 위해 너무 많은 피를 흘렸다.'],
                10: ['인간 용사의 얼굴이 떠오른다. 그는 당신의 어깨를 두드린 뒤, 같은 손으로 등을 밀었다.'],
                20: ['왕의 명령서는 불타 사라졌지만 문장은 기억난다. “영웅은 전쟁 뒤에 가장 위험하다.”'],
                30: ['마굴의 문이 닫히던 순간, 인간 왕은 눈을 피하지 않았다. 당신의 복수는 아직 시작도 하지 않았다.'],
            },
            relic: {
                default: '유물이 손에 닿자 왕궁의 맹세문이 피 묻은 조롱처럼 되살아난다.',
            },
        },
    },
    demon: {
        key: 'demon',
        name: '마족',
        color: '#e74c3c',
        summary: '추방당한 군주',
        past:
            '마계의 군주였으나 흑막의 계략으로 권좌와 힘을 빼앗기고, 최하층 던전으로 추방당한 마족.',
        fragments: {
            runStart: [
                '마기가 당신을 알아보고 낮게 떨린다. 그러나 그것은 복종이 아니라, 폐위된 군주를 향한 조롱에 가깝다.',
                '왕좌의 감촉은 사라졌지만 빼앗긴 힘의 공백은 아직 심장 한가운데 남아 있다.',
            ],
            floorMilestones: {
                5: ['벽에 새겨진 봉인문은 당신의 군단 문법을 흉내 냈다. 진짜 명령권자는 따로 있었다.'],
                10: ['무너진 군기가 발밑에서 바스러진다. 부하들은 배신한 것이 아니라 누군가에게 조종당했다.'],
                20: ['마계의 법정이 떠오른다. 당신의 죄명은 반역, 판결문에는 조력자의 인장이 희미하게 찍혀 있었다.'],
                30: ['심층의 마기가 무릎 꿇으려다 멈춘다. 당신은 아직 군주지만, 왕관은 다른 손에 있다.'],
            },
            relic: {
                default: '유물 안쪽에서 잃어버린 왕권의 명령 체계가 반응한다. 당신은 이것을 빼앗긴 적이 있다.',
            },
        },
    },
    beastkin: {
        key: 'beastkin',
        name: '수인',
        color: '#2ed573',
        summary: '짓밟힌 생존자',
        past:
            '전쟁의 참화 속에서 부족을 잃고, 살아남기 위해 힘을 갈망하며 마굴로 숨어 들어온 수인.',
        fragments: {
            runStart: [
                '발밑의 진동이 전장을 떠올리게 한다. 부족의 울음소리는 사라졌지만 살아남으라는 본능만은 남았다.',
                '당신은 도망친 것이 아니다. 언젠가 되돌아가기 위해 더 깊은 어둠으로 숨은 것이다.',
            ],
            floorMilestones: {
                5: ['부서진 뼈장식이 흙 속에 묻혀 있다. 부족의 전사들이 여기까지 밀려왔던 흔적이다.'],
                10: ['피 냄새 사이로 익숙한 약초 향이 섞인다. 치료받지 못한 아이들의 숨소리가 잠깐 들린다.'],
                20: ['전쟁을 일으킨 자들은 힘을 숭배했다. 당신은 그들의 언어로 대답하기 위해 이를 악문다.'],
                30: ['심층의 포효가 뼈를 울린다. 부족을 짓밟은 힘의 근원이 이 아래에서 아직 살아 있다.'],
            },
            relic: {
                default: '유물이 손에 닿자 잃어버린 부족의 사냥 노래가 낮은 장송곡처럼 맴돈다.',
            },
        },
    },
});

const storyData = Object.freeze({
    playerStateDefaults: Object.freeze({
        corruption: 0,
        purification: 0,
    }),
    routeTitles: Object.freeze({
        neutral: null,
        corruption: '마력을 탐하는 자',
        purification: '진실을 가르는 자',
    }),
    endingTitles: Object.freeze({
        demonKing: '마왕의 그릇',
        hero: '환각을 깨뜨린 용사',
    }),
    choiceImpacts: Object.freeze({
        trust_helper: Object.freeze({
            corruption: 1,
            purification: 0,
            label: '조력자 신뢰',
        }),
        embrace_dark_power: Object.freeze({
            corruption: 2,
            purification: 0,
            label: '어둠의 힘 수용',
        }),
        doubt_helper: Object.freeze({
            corruption: 0,
            purification: 1,
            label: '조력자 의심',
        }),
        resist_hallucination: Object.freeze({
            corruption: 0,
            purification: 2,
            label: '환각 저항',
        }),
    }),
    milestones: Object.freeze({
        30: Object.freeze({
            key: 'bossLastWords30',
            title: '30층 보스의 유언',
            trigger: 'inner_monologue',
            lines: Object.freeze([
                '그 검을... 더는 고치지 마라... 조력자의 꼭두각시 녀석...',
                '쓰러진 보스의 목소리는 저주가 아니라 경고에 가까웠다.',
                '조력자가 말해 주지 않은 무언가가, 이 마굴의 중층부터 모습을 드러내기 시작한다.',
            ]),
        }),
    }),
    routeMilestones: Object.freeze([31, 40, 50, 60, 70, 80]),
    routes: Object.freeze({
        neutral: Object.freeze({
            title: null,
            milestones: Object.freeze({
                31: Object.freeze([
                    '30층 너머의 공기는 달라졌다. 조력자의 말과 보스의 유언이 머릿속에서 서로를 밀어낸다.',
                    '아직 무엇도 확신할 수 없다. 다만 이제부터의 등반은 단순한 생존이 아니다.',
                ]),
                40: Object.freeze([
                    '길은 위로 이어지지만, 기억은 계속 아래로 가라앉는다.',
                    '복수와 의심 사이에서 당신의 손은 아직 어느 쪽도 완전히 붙잡지 못했다.',
                ]),
                50: Object.freeze([
                    '마굴의 중층 끝에서 조력자의 조언은 더 친절해지고, 몬스터들의 눈빛은 더 인간적으로 변한다.',
                    '어느 쪽이 거짓인지 판단하기에는 아직 피 냄새가 너무 짙다.',
                ]),
                60: Object.freeze([
                    '심층의 문이 열릴수록 조력자의 목소리는 가까워지고, 보스들의 경고는 선명해진다.',
                    '당신은 아직 선택하지 않았다. 그래서 마굴은 더 많은 환영을 준비한다.',
                ]),
                70: Object.freeze([
                    '유물은 힘을 주지만 동시에 질문을 남긴다. 이 힘은 회복인가, 계승인가.',
                ]),
                80: Object.freeze([
                    '심층의 마지막 봉인이 흔들린다. 이제 중립은 오래 버틸 수 없는 자세가 되었다.',
                ]),
            }),
        }),
        corruption: Object.freeze({
            title: '마력을 탐하는 자',
            milestones: Object.freeze({
                31: Object.freeze([
                    '조력자는 낮게 웃으며 말한다. “잘했다. 이제야 네게 어울리는 힘을 받아들이기 시작했군.”',
                    '보스의 경고는 비겁한 패자의 변명처럼 들린다. 복수에는 더 많은 마력이 필요하다.',
                ]),
                40: Object.freeze([
                    '조력자의 칭찬은 점점 달콤해진다. “너를 버린 자들이 이 모습을 보면 무릎 꿇을 것이다.”',
                    '당신은 그 장면을 상상한다. 왕의 얼굴, 용사의 떨리는 손, 그리고 당신의 검 끝.',
                ]),
                50: Object.freeze([
                    '몬스터의 비명이 짧게 끊길 때마다 마굴은 더 선명한 힘으로 답한다.',
                    '죄책감은 약자의 언어다. 당신을 버린 세계에는 약속보다 공포가 더 잘 통한다.',
                ]),
                60: Object.freeze([
                    '조력자는 말한다. “망설이지 마라. 이곳의 모든 피는 네 왕관을 위한 제물이다.”',
                    '당신은 부정하지 않는다. 손에 감긴 마력은 이제 낯설지 않다.',
                ]),
                70: Object.freeze([
                    '심층의 마력은 당신을 두려워하지 않는다. 오히려 오래 기다린 주인처럼 살갗에 스며든다.',
                    '복수는 목표가 아니라 의식이 되어 간다.',
                ]),
                80: Object.freeze([
                    '마굴의 마지막 봉인이 당신의 심장 박동에 맞춰 열린다.',
                    '조력자는 속삭인다. “곧 완성된다. 네 분노가 곧 왕좌가 될 것이다.”',
                ]),
            }),
        }),
        purification: Object.freeze({
            title: '진실을 가르는 자',
            milestones: Object.freeze({
                31: Object.freeze([
                    '보스의 눈은 죽기 직전까지 당신이 아니라 조력자의 그림자를 보고 있었다.',
                    '당신은 처음으로 검을 내려다본다. 이 무기는 적을 베는 도구인가, 누군가의 명령을 수행하는 사슬인가.',
                ]),
                40: Object.freeze([
                    '벽의 그림자는 공격하지 않는다. 그 안에는 도망치다 쓰러진 몬스터들의 기억이 남아 있다.',
                    '당신은 그들의 눈망울에서 슬픔을 본다. 괴물이라는 말만으로 지워지지 않는 감정이다.',
                ]),
                50: Object.freeze([
                    '조력자의 설명은 완벽하지만, 완벽하기 때문에 더 수상하다.',
                    '이 마굴의 적들은 모두 당신을 막으려 한다. 죽이려는 것이 아니라, 멈추게 하려는 것처럼.',
                ]),
                60: Object.freeze([
                    '환각이 왕관과 복수를 보여 줄수록 당신은 그 뒤의 빈틈을 찾는다.',
                    '분노는 아직 뜨겁지만, 이제 그것을 쥔 손은 조력자의 것이 아니다.',
                ]),
                70: Object.freeze([
                    '몬스터 하나가 쓰러지기 전 아주 작게 고개를 젓는다. 당신은 그 뜻을 이해해 버렸다.',
                    '이 등반이 구원이 아니라 학살이라면, 진짜 적은 꼭대기가 아니라 곁에 있다.',
                ]),
                80: Object.freeze([
                    '심층의 마지막 문 앞에서 조력자의 목소리가 처음으로 갈라진다.',
                    '당신은 환각을 베어 낸다. 남은 것은 복수보다 무거운 진실이다.',
                ]),
            }),
        }),
    }),
    endings: Object.freeze({
        demonKing: Object.freeze({
            key: 'endingDemonKing',
            title: '마왕화 엔딩 분기',
            battleTitle: '마왕 계승식',
            lines: Object.freeze([
                '조력자는 더 이상 인간의 얼굴을 유지하지 않는다. 그는 무릎을 꿇고 당신을 올려다본다.',
                '“훌륭하다. 네 분노와 욕망은 마왕의 그릇으로 손색이 없다.”',
                '부서진 왕관이 허공에서 맞물린다. 최종전은 처단이 아니라 계승식으로 변한다.',
            ]),
        }),
        hero: Object.freeze({
            key: 'endingHero',
            title: '용사화 엔딩 분기',
            battleTitle: '환각 파쇄',
            lines: Object.freeze([
                '조력자가 펼친 환각이 왕관과 복수를 속삭인다. 당신은 그 모든 장면을 검등으로 깨뜨린다.',
                '“나는 네가 만든 마왕이 아니다. 무고한 자들의 피값을 치르게 하러 왔다.”',
                '진짜 악마가 모습을 드러낸다. 당신의 칼끝은 더 이상 복수심이 아니라 죗값을 향한다.',
            ]),
        }),
    }),
});

const introWeaponChoices = Object.freeze({
    old_sword: {
        key: 'old_sword',
        label: '낡은 검',
        jobKey: 'Warrior',
        classKey: 'sword_warrior',
        className: '검사',
        color: '#ff4757',
        desc: '녹슬었지만 균형이 남아 있는 검. 가장 정직하게 적을 베는 길.',
    },
    giant_hammer: {
        key: 'giant_hammer',
        label: '거대한 망치',
        jobKey: 'Warrior',
        classKey: 'hammer_vanguard',
        className: '파쇄 전사',
        color: '#d35400',
        desc: '손잡이가 갈라진 대형 망치. 느리지만 한 번 맞으면 뼈째 부순다.',
    },
    broken_staff: {
        key: 'broken_staff',
        label: '부러진 지팡이',
        jobKey: 'Wizard',
        classKey: 'broken_staff_mage',
        className: '마법사',
        color: '#1e90ff',
        desc: '끝이 부러진 지팡이. 불안정하지만 마력의 잔향이 살아 있다.',
    },
    snapped_bow: {
        key: 'snapped_bow',
        label: '줄 끊어진 활',
        jobKey: 'Hunter',
        classKey: 'desperate_archer',
        className: '헌터',
        color: '#2ed573',
        desc: '끊어진 활줄을 임시로 묶었다. 거리와 약점을 읽는 자에게 맞다.',
    },
});

const classStories = Object.freeze({
    sword_warrior: {
        jobKey: 'Warrior',
        name: '검사',
        intro: ['검을 쥐는 순간 손목이 먼저 자세를 잡는다. 당신은 이 움직임을 오래전에 배웠다.'],
        floorMilestones: {
            10: ['검날의 녹이 벗겨지며 오래된 검술의 감각이 조금 돌아온다.'],
        },
        relic: {
            default: '유물이 검 손잡이와 공명한다. 잊었던 전장의 함성이 들린다.',
        },
    },
    hammer_vanguard: {
        jobKey: 'Warrior',
        name: '파쇄 전사',
        intro: ['망치를 들어 올리는 순간 어깨의 오래된 흉터가 뜨겁게 욱신거린다. 방어선을 부수던 기억이다.'],
        floorMilestones: {
            10: ['바닥의 균열을 따라 망치를 내리치고 싶은 충동이 인다. 이 무기는 문도, 방패도, 뼈도 부순다.'],
        },
        relic: {
            default: '유물이 둔탁한 박동을 낸다. 무너뜨려야 할 성문 하나가 기억 속에서 열린다.',
        },
    },
    broken_staff_mage: {
        jobKey: 'Wizard',
        name: '마법사',
        intro: ['부러진 지팡이 끝에서 푸른 불꽃이 한 번 튄다. 주문은 기억나지 않지만 마력은 당신을 기억한다.'],
        floorMilestones: {
            10: ['벽의 룬을 읽는 순간 혀끝에 잊힌 주문의 첫 음절이 맴돈다.'],
        },
        relic: {
            default: '유물이 지팡이의 균열을 따라 빛난다. 사라진 연구실의 냄새가 되살아난다.',
        },
    },
    desperate_archer: {
        jobKey: 'Hunter',
        name: '헌터',
        intro: ['끊어진 활줄을 묶자 손가락이 저릿하다. 불완전한 무기라도 급소를 노리기에는 충분하다.'],
        floorMilestones: {
            10: ['어둠 속 움직임이 선으로 보인다. 당신은 도망치는 적의 숨을 세는 법을 알고 있다.'],
        },
        relic: {
            default: '유물이 활대에 닿자 오래된 사냥 표식이 시야 가장자리에 떠오른다.',
        },
    },
});

const promotionStories = Object.freeze({
    '나이트': {
        intro: ['갑옷의 무게가 낯설지 않다. 누군가를 지키지 못했던 기억이 방패 안쪽에서 울린다.'],
        floorMilestones: {
            30: ['통곡의 벽 앞에서 나이트의 맹세가 다시 세워진다. 이번에는 물러서지 않는다.'],
        },
    },
    '버서커': {
        intro: ['이성보다 먼저 피가 대답한다. 분노는 기억보다 깊은 곳에 남아 있었다.'],
        floorMilestones: {
            30: ['심층의 압박이 분노를 먹이 삼아 더 크게 타오른다.'],
        },
    },
    '궁수': {
        intro: ['시야가 길게 열린다. 숨 한 번에 거리, 바람, 심장 박동이 정렬된다.'],
        floorMilestones: {
            30: ['통곡의 벽 너머에서도 약점은 있다. 찾는 데 시간이 걸릴 뿐이다.'],
        },
    },
    '암살자': {
        intro: ['그림자가 당신을 피하지 않는다. 오히려 기다렸다는 듯 몸을 감싼다.'],
        floorMilestones: {
            30: ['이 깊이의 어둠은 적의 편이 아니다. 당신의 칼끝도 같은 어둠에서 나온다.'],
        },
    },
    '위저드': {
        intro: ['부서졌던 주문 체계가 다시 맞물린다. 세계가 잠깐 수식처럼 보인다.'],
        floorMilestones: {
            30: ['마굴의 심장이 뿜는 마력은 위험하지만, 읽을 수 있다면 무기가 된다.'],
        },
    },
    '소환사': {
        intro: ['비어 있던 곁에 낯선 기척이 선다. 당신은 혼자 싸우던 존재가 아니었다.'],
        floorMilestones: {
            30: ['심층의 문 너머에서 응답이 온다. 부름을 들은 것은 하나가 아니다.'],
        },
    },
    '성직자': {
        intro: ['기도의 말은 기억나지 않는다. 하지만 빛은 당신의 침묵에도 응답한다.'],
        floorMilestones: {
            30: ['통곡의 벽 앞에서 신성력이 흔들린다. 믿음이 아니라 선택을 시험하는 빛이다.'],
        },
    },
});

const floorStories = Object.freeze({
    bands: [
        {
            key: 'middle_doubt',
            title: '중층 - 의구심',
            from: 31,
            to: 50,
            cadence: 4,
            lines: [
                '베이스캠프의 조력자는 위로 갈수록 기억이 선명해질 거라고 했다. 하지만 벽에 남은 흔적은 그 말을 비웃듯 반대로 이어진다.',
                '돌바닥에 새겨진 표식이 낯익다. 당신이 도망친 흔적이 아니라, 누군가 당신을 이쪽으로 몰아넣은 흔적이다.',
                '조력자가 건네준 지도와 기억 속 통로가 조금씩 어긋난다. 지도는 항상 더 위험한 방으로 당신을 인도하고 있었다.',
                '잃어버린 목소리 하나가 돌아온다. “그를 믿지 마.” 누구의 경고였는지는 아직 떠오르지 않는다.',
                '상층으로 오를수록 몬스터는 흉폭해지지만, 그보다 더 불편한 것은 조력자가 지나치게 많은 것을 알고 있다는 사실이다.',
            ],
        },
        {
            key: 'deep_truth',
            title: '심층 - 진실',
            from: 51,
            to: 80,
            cadence: 5,
            lines: [
                '유물의 표면에 조력자의 인장이 떠오른다. 그는 처음부터 이 물건들이 어디에 있는지 알고 있었다.',
                '기억의 조각이 맞물린다. 당신은 유물을 모으는 사람이 아니라, 유물을 봉인하던 사람이었다.',
                '베이스캠프에서 들었던 조언들이 하나의 명령문처럼 다시 들린다. 그는 당신을 돕는 척하며 봉인을 풀게 만들고 있었다.',
                '심층의 문들은 당신의 피가 아니라 조력자가 준 표식에 반응한다. 열쇠는 당신이 아니라 그가 쥐고 있었다.',
                '유물이 하나씩 모일수록 마굴의 심장은 더 크게 뛴다. 당신이 강해지는 만큼, 오래된 배신도 완성되어 간다.',
                '기억 속에서 조력자의 얼굴이 선명해진다. 그는 구조자가 아니었다. 마지막 순간 당신의 등을 민 손이었다.',
            ],
        },
        {
            key: 'summit_eve',
            title: '꼭대기 - 결전 전야',
            from: 81,
            to: 99,
            cadence: 4,
            lines: [
                '모든 기억이 돌아온다. 처음 깨어났을 때 등 뒤에 흩어져 있던 파괴된 장비들은 쓰레기가 아니라, 원래 당신의 무기였다.',
                '낡은 검, 망치, 지팡이, 활. 무엇을 집었든 그 잔해는 모두 한때 당신의 손에 맞춰져 있었다.',
                '조력자는 당신의 무기를 부수고 기억을 가둔 뒤, 빈손의 당신에게 다시 무기를 고르게 했다. 선택은 자유가 아니라 실험이었다.',
                '꼭대기로 이어지는 계단마다 배신의 장면이 또렷해진다. 이제 필요한 것은 해명이 아니라 처단이다.',
                '마굴 전체가 떨린다. 유물은 봉인을 풀었고, 당신은 기억을 되찾았다. 남은 것은 배신자의 이름을 부르는 일뿐이다.',
            ],
        },
    ],
    milestones: {
        31: ['30층의 벽을 넘자 공기가 달라진다. 조력자가 말한 “안전한 길”은 이곳 어디에도 보이지 않는다.'],
        35: ['베이스캠프에서 들었던 농담과 같은 문장이 벽의 낡은 경고문에 새겨져 있다. 그는 이곳을 처음 보는 사람이 아니었다.'],
        40: ['기억 속 누군가가 유물을 부수라고 외친다. 하지만 조력자는 늘 유물을 모으라고만 했다.'],
        45: ['손바닥에 남은 오래된 상처가 지도의 붉은 표시와 겹친다. 당신은 이미 이 길을 한 번 올라갔었다.'],
        50: ['중층의 끝에서 의심은 확신이 된다. 조력자의 설명은 너무 깔끔했고, 당신의 기억은 너무 피투성이였다.'],
        51: ['심층의 첫 문이 열린다. 문에 새겨진 이름은 몬스터의 것이 아니라 조력자의 것이다.'],
        55: ['유물 조각이 조력자의 목소리로 속삭인다. “조금만 더 모으면 된다.” 도움의 말이 아니라 조종의 명령이다.'],
        60: ['심연의 보스가 쓰러진 자리에서 오래된 봉인문이 뜯겨 나간다. 당신이 이긴 것이 아니라, 누군가가 기다리던 문이 열린 것이다.'],
        65: ['기억의 조각 속 조력자는 당신에게 칼을 겨누지 않았다. 그는 웃으며 당신의 무기를 등 뒤에서 부쉈다.'],
        70: ['마굴의 심장은 당신이 들고 온 유물에 반응한다. 조력자는 당신을 전사로 만든 것이 아니라 운반책으로 만들었다.'],
        75: ['베이스캠프의 불빛이 멀어질수록 거짓말은 선명해진다. 이제 돌아가도 그는 같은 미소로 다음 유물을 요구할 것이다.'],
        80: ['심층의 마지막 봉인이 풀린다. 조력자가 원한 것은 당신의 생존이 아니라, 당신만 열 수 있는 문이었다.'],
        81: ['꼭대기의 계단 앞에서 기억이 완전히 열린다. 당신은 패배자가 아니라 봉인을 지키던 마지막 수문장이었다.'],
        85: ['등 뒤의 부서진 장비들이 하나의 형상을 이룬다. 그것들은 모두 원래 당신의 무기였고, 그가 산산조각 낸 증거였다.'],
        90: ['바람 없는 통로에서 배신자의 이름이 울린다. 이제 그 이름은 공포가 아니라 목표다.'],
        95: ['정상에 가까워질수록 몬스터들은 물러서지 않는다. 그들은 조력자를 지키는 것이 아니라, 풀려난 재앙을 두려워하고 있다.'],
        99: ['마지막 문 앞에서 당신은 모든 선택을 다시 떠올린다. 이번에는 누가 무기를 고르게 만들었는지 알고 있다.'],
        100: ['종착지의 문이 열린다. 베이스캠프의 조력자가 그 안에서 기다리고 있다. 더 이상 조력자라는 이름은 필요 없다.'],
    },
    relicClues: {
        deep_truth: [
            '유물 안쪽에 조력자의 봉인이 남아 있다. 그는 당신보다 먼저 이 유물들을 만졌고, 당신이 가져오기를 기다렸다.',
            '기억의 조각이 유물에 비친다. 조력자는 “회복”이라는 말로 봉인 해제를 숨겼다.',
            '유물은 당신을 강하게 만드는 동시에 꼭대기의 잠금을 푼다. 조력자는 두 결과를 모두 알고 있었다.',
            '유물 속 목소리가 말한다. “모으지 마라.” 하지만 그 경고는 조력자의 주문에 눌려 아주 늦게 들려왔다.',
        ],
        summit_eve: [
            '유물이 더 이상 조력자의 말을 흉내 내지 않는다. 이제 그것은 당신의 원래 사명을 기억하고 있다.',
            '유물의 빛이 부서진 장비의 잔상을 비춘다. 당신은 처음부터 무기를 잃은 것이 아니라 빼앗긴 것이었다.',
            '마지막 조각이 맞춰진다. 조력자가 원한 최종 열쇠는 유물이 아니라, 기억을 되찾은 당신 자신이다.',
        ],
        default: [
            '유물이 차갑게 떨린다. 이 힘은 선물이 아니라 오래전에 당신이 봉인했던 경고다.',
        ],
    },
    finalBossOpening: [
        '100층. 종착지의 방 한가운데, 베이스캠프의 조력자가 익숙한 미소로 서 있다.',
        '그는 당신이 모아 온 유물들을 바라보며 고개를 끄덕인다. “마침내 다 가져왔군.”',
        '모든 기억이 완성된다. 그는 당신을 구한 자가 아니라, 당신을 배신하고 무기를 부순 뒤 기억을 봉인한 자였다.',
        '조력자의 그림자가 거대한 형상으로 부풀어 오른다. 이제 마지막 전투가 시작된다.',
    ],
});

/** 시작 시 동료 1명: 워리어/헌터/마법사 (고용 아이템 없음) — v6.6.3 기본 성장 상향 */
const mercCompanionBases = {
    워리어: { label: '선봉 검사', affinityJob: '워리어', dmgCoeff: 0.62, hpCoeff: 1.14 },
    헌터: { label: '척후 궁수', affinityJob: '헌터', dmgCoeff: 0.64, hpCoeff: 1.05 },
    마법사: { label: '견습 마도', affinityJob: '마법사', dmgCoeff: 0.66, hpCoeff: 0.98 },
};

/** 20~30층 1회: 용병 전직 (플레이어 전직보다 약한 배율) */
const mercCompanionEvolutions = {
    워리어: [
        { name: '철기사대', pathJob: '나이트', dmgMult: 1.1, hpMult: 1.12, desc: '방어·체력 중시 (본가 나이트보다 약화).' },
        { name: '광전 부대', pathJob: '버서커', dmgMult: 1.18, hpMult: 0.93, desc: '공격 특화 (본가 버서커보다 약화).' },
    ],
    헌터: [
        { name: '저격 지원', pathJob: '궁수', dmgMult: 1.1, hpMult: 1.04, desc: '안정 딜.' },
        { name: '암살 계약', pathJob: '암살자', dmgMult: 1.16, hpMult: 0.95, desc: '고딜.' },
    ],
    마법사: [
        { name: '전투 마도', pathJob: '위저드', dmgMult: 1.14, hpMult: 0.96, desc: '마법 화력.' },
        { name: '보조 소환', pathJob: '소환사', dmgMult: 1.06, hpMult: 1.1, desc: '체력·지원.' },
    ],
};

const jobEvolutions = {
    '워리어': [
        { name: '나이트',  bonusAtk: 23, bonusDef: 18, bonusHp: 390, desc: '철벽 수호자. 방어력과 체력이 크게 증가한다.', ult: '신성한 강타' },
        { name: '버서커',  bonusAtk: 37, bonusDef: 5,  bonusHp: 310, desc: '광전사. 공격력이 폭발하지만 체력이 줄어든다.', ult: '분노의 일격' },
    ],
    '헌터': [
        { name: '궁수',   bonusAtk: 29, bonusDef: 6,  bonusHp: 330, bonusAcc: 12, desc: '원거리 특화. 공격력과 명중률이 상승한다.', ult: '폭풍화살' },
        { name: '암살자', bonusAtk: 36, bonusDef: 4,  bonusHp: 285, desc: '그림자 암살자. 공격력이 크게 오르지만 방어가 약해진다.', ult: '그림자 찌르기' },
    ],
    '마법사': [
        { name: '위저드',  bonusAtk: 50, bonusDef: 3,  bonusHp: 250, desc: '고위 마법사. 마법 공격력이 폭발적으로 증가한다.', ult: '메테오' },
        { name: '소환사',  bonusAtk: 38, bonusDef: 10, bonusHp: 300, desc: '소환사. 소환수의 방어막으로 생존력이 증가한다.', ult: '차원 붕괴' },
        { name: '성직자',  bonusAtk: 35, bonusDef: 11, bonusHp: 285, desc: '신성력으로 버틴다. 신성력은 최대 20스택까지 축적된다.', ult: '성광 심판' },
    ],
};

// 궁극기 스펙 정의
const ultSkills = {
    '신성한 강타': { desc: '신성한 힘으로 적을 강타. 방어력 무시 초대형 피해.', dmgMult: 4.35, stackRequired: 4 },
    '분노의 일격': { desc: '분노가 폭발하여 적에게 광기의 피해를 입힌다.', dmgMult: 4.65, stackRequired: 3 },
    '폭풍화살':   { desc: '바람의 힘을 담아 적을 꿰뚫는다.', dmgMult: 4.05, stackRequired: 3 },
    '그림자 찌르기': { desc: '그림자 속에서 나타나 치명적인 일격을 가한다.', dmgMult: 5.05, stackRequired: 4 },
    '메테오':     { desc: '하늘에서 거대한 운석을 소환한다.', dmgMult: 4.45, stackRequired: 4 },
    '차원 붕괴':  { desc: '차원을 찢어 적에게 혼돈의 피해를 입힌다.', dmgMult: 4.15, stackRequired: 4 },
    '성광 심판': { desc: '신성한 빛이 적을 심판한다.', dmgMult: 4.25, stackRequired: 4 },
};

const floorUnlocks = {
    10:  { name: "용기의 목걸이",     type: "hp",  value: 40, def: 5,  price: 60,  rarity: "rare",      desc: "10층 달성 해금. 체력(+40), 방어(+5)." },
    20:  { name: "전사의 팔찌",       type: "ring", value: 18, price: 75,  rarity: "rare",      desc: "20층 달성 해금. 공격(+18)." },
    30:  { name: "불사조의 깃털",     type: "hp",  value: 60, price: 90,  rarity: "epic",      regenPotion: true, desc: "30층 달성 해금. 체력(+60). 포션 효과 강화." },
    40:  { name: "심연의 보석",       type: "atk", value: 25, price: 110, rarity: "epic",      lifesteal: 0.2, desc: "40층 달성 해금. 공격력(+25). 흡혈 20%." },
    50:  { name: "천공의 갑옷",       type: "hp",  value: 100, def: 20, price: 150, rarity: "epic",     desc: "50층 달성 해금. 체력(+100), 방어(+20)." },
    60:  { name: "파멸의 검",         type: "atk", value: 40, price: 160, rarity: "legendary", lifesteal: 0.3, desc: "60층 달성 해금. 공격력(+40). 흡혈 30%." },
    70:  { name: "불멸의 흉갑",       type: "hp",  value: 120, def: 25, price: 180, rarity: "legendary", desc: "70층 달성 해금. 체력(+120), 방어(+25)." },
    80:  { name: "신의 축복",         type: "atk", value: 55, price: 200, rarity: "legendary", desc: "80층 달성 해금. 공격력(+55), 명중률(+15%)." },
    90:  { name: "용왕의 비늘",       type: "hp",  value: 150, def: 30, price: 220, rarity: "legendary", desc: "90층 달성 해금. 체력(+150), 방어(+30)." },
    100: { name: "전설의 유산",       type: "atk", value: 80, price: 250, rarity: "legendary", lifesteal: 0.4, desc: "100층 달성! 전설의 유산. 공격력(+80), 명중률(+20%), 흡혈 40%." },
    5:   { name: "철의 의지",   type: "hp",  value: 30, def: 8,  price: 50,  rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "5층 해금. 워리어 계열. 체력(+30), 방어(+8)." },
    15:  { name: "광전사의 도끼", type: "atk", value: 20, price: 70, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "15층 해금. 워리어 계열. 공격력(+20)." },
    25:  { name: "성기사의 방패", type: "hp",  value: 50, def: 18, price: 100, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "25층 해금. 워리어 계열. 체력(+50), 방어(+18)." },
    35:  { name: "분노의 갑옷",  type: "hp",  value: 80, def: 22, price: 130, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "35층 해금. 워리어 계열. 체력(+80), 방어(+22)." },
    45:  { name: "전쟁신의 갑주", type: "hp",  value: 60, def: 28, price: 160, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], desc: "45층 해금. 워리어 계열. 체력(+60), 방어(+28)." },
};

const floorUnlocksHunter = {
    5:  { name: "독수리의 눈",   type: "ring", value: 20, price: 50,  rarity: "rare", onlyFor: ["헌터","궁수","암살자"], tags: ["precision"], desc: "5층 해금. 헌터 계열. 명중률(+20%)." },
    15: { name: "바람의 화살",   type: "atk", value: 18, price: 70,  rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "15층 해금. 헌터 계열. 공격력(+18)." },
    25: { name: "그림자 단검",   type: "atk", value: 30, price: 100, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], lifesteal: 0.2, desc: "25층 해금. 헌터 계열. 공격력(+30), 흡혈 20%." },
    35: { name: "은신 망토", type: "hp",  value: 40, price: 120, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "35층 해금. 헌터 계열. 체력(+40)." },
    45: { name: "정령의 화살통", type: "atk", value: 45, price: 160, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], desc: "45층 해금. 헌터 계열. 공격력(+45)." },
};

const floorUnlocksWizard = {
    5:  { name: "마나의 수정",   type: "atk", value: 15, price: 50,  rarity: "rare", onlyFor: ["마법사","위저드","소환사","성직자"], desc: "5층 해금. 마법사 계열. 공격력(+15)." },
    15: { name: "고대의 서적",   type: "atk", value: 25, price: 70,  rarity: "rare", onlyFor: ["마법사","위저드","소환사","성직자"], desc: "15층 해금. 마법사 계열. 공격력(+25)." },
    25: { name: "혼돈의 보주",   type: "atk", value: 38, price: 100, rarity: "epic", onlyFor: ["마법사","위저드","소환사","성직자"], desc: "25층 해금. 마법사 계열. 공격력(+38)." },
    35: { name: "시간의 모래시계", type: "hp", value: 50, def: 10, price: 120, rarity: "epic", onlyFor: ["마법사","위저드","소환사","성직자"], desc: "35층 해금. 마법사 계열. 체력(+50), 방어(+10)." },
    45: { name: "신계의 마법진", type: "atk", value: 60, price: 160, rarity: "legendary", onlyFor: ["마법사","위저드","소환사","성직자"], desc: "45층 해금. 마법사 계열. 공격력(+60)." },
};

const UPGRADE_ORDER_KO = ['일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '십일', '십이', '십삼', '십사', '십오', '십육', '십칠', '십팔', '십구', '이십'];
function generateUpgrades(id, name, effectKey, baseEffect, baseCost, costMult) {
    return Array.from({ length: 20 }, (_, i) => ({
        id: `${id}_${i + 1}`,
        name: `${name} ${UPGRADE_ORDER_KO[i]}차`,
        desc: `${name} +${baseEffect * (i + 1)} 영구 적용 (누적)`,
        effect: { [effectKey]: baseEffect },
        price: Math.floor(baseCost * Math.pow(costMult, i)),
        maxBuy: 1
    }));
}

/** 베이스캠프 영구 강화 — 체력/공격/방어만 (명중 제거 v7.0.1) */
const permanentUpgrades = [
    ...generateUpgrades('hp',  '체력',   'hp',     20,  20,  1.35),
    ...generateUpgrades('atk', '공격력', 'atk',    3,   30,  1.4),
    ...generateUpgrades('def', '방어력', 'def',    2,   25,  1.4),
];

/** 구 명중 영구강화 단계별 비용 (환불 전용, generateUpgrades와 동일 식) */
function legacyAccUpgradePrice(level) {
    const baseCost = 25,
        costMult = 1.45;
    return Math.floor(baseCost * Math.pow(costMult, Math.max(0, level - 1)));
}

/** 직업별 추가 장비 (희귀도별) */
const equipmentPoolV651 = [
    // 워리어 계열 — common x5
    { name: "녹슨 철퇴", type: "atk", value: 7, def: 3, price: 28, rarity: "common", onlyFor: ["워리어","나이트","버서커"], tags: ["blade", "heavy"], desc: "공격(+7), 방어(+3)." },
    { name: "훈련용 목검", type: "atk", value: 9, price: 32, rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+9)." },
    { name: "보병의 흉갑", type: "hp", value: 28, def: 6, price: 30, rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+28), 방어(+6)." },
    { name: "철벽 방패", type: "hp", value: 22, def: 8, price: 34, rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+22), 방어(+8)." },
    { name: "전장의 붕대", type: "hp", value: 35, price: 26, rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+35)." },
    // 워리어 — rare x5
    { name: "기사단 양날검", type: "atk", value: 16, critBonus: 3, price: 62, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+16), 치명(+3%)." },
    { name: "가시 갑옷", type: "hp", value: 45, def: 10, price: 68, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+45), 방어(+10)." },
    { name: "광전사의 팔찌", type: "ring", value: 14, lifesteal: 0.06, price: 72, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], tags: ["blood", "heavy"], desc: "공격(+14), 흡혈(6%)." },
    { name: "수호 기사의 인장", type: "hp", value: 35, def: 14, price: 65, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+35), 방어(+14)." },
    { name: "철의 반지", type: "ring", value: 12, def: 5, price: 60, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+12), 방어(+5)." },
    // 워리어 — epic x5 (fix: use hp+def instead of invalid type def)
    { name: "룬문자 대검", type: "atk", value: 24, critBonus: 5, price: 118, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+24), 치명(+5%)." },
    { name: "깊은 광산 판금", type: "hp", value: 70, def: 14, price: 115, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+70), 방어(+14)." },
    { name: "피의 맹세", type: "atk", value: 20, lifesteal: 0.1, price: 122, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+20), 흡혈(10%)." },
    { name: "성역의 방패", type: "hp", value: 55, def: 18, price: 120, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+55), 방어(+18)." },
    { name: "전장의 함성", type: "atk", value: 18, critMult: 0.12, price: 125, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+18), 치명 배율(+12%)." },
    // 워리어 — legendary x5
    { name: "태양검 심연", type: "atk", value: 38, critBonus: 8, critMult: 0.15, price: 195, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+38), 치명(+8%), 배율(+15%)." },
    { name: "불멸의 요새", type: "hp", value: 120, def: 24, price: 200, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+120), 방어(+24)." },
    { name: "광기의 도끼 잔향", type: "atk", value: 42, lifesteal: 0.12, price: 205, rarity: "legendary", onlyFor: ["버서커"], desc: "버서커. 공격(+42), 흡혈(12%)." },
    { name: "성기사의 성배", type: "hp", value: 90, def: 20, price: 198, rarity: "legendary", onlyFor: ["나이트"], desc: "나이트. 체력(+90), 방어(+20)." },
    { name: "전쟁신의 유산", type: "atk", value: 35, def: 12, price: 210, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+35), 방어(+12)." },
    // 헌터 계열 — common x5
    { name: "나무 활", type: "atk", value: 8, price: 29, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+8)." },
    { name: "가죽 장갑", type: "hp", value: 36, def: 4, price: 31, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "체력(+36), 방어(+4)." },
    { name: "작은 단검", type: "atk", value: 10, critBonus: 2, price: 33, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+10), 치명(+2%)." },
    { name: "숲길 장화", type: "hp", value: 32, price: 27, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "체력(+32)." },
    { name: "독침 화살", type: "atk", value: 9, lifesteal: 0.04, price: 35, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+9), 흡혈(4%)." },
    // 헌터 — rare x5
    { name: "바람의 시위", type: "ring", value: 16, critBonus: 4, price: 66, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "명중(+16%), 치명(+4%)." },
    { name: "그림자 가면", type: "atk", value: 17, critMult: 0.15, price: 74, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+17), 치명 배율(+15%)." },
    { name: "맹금의 깃털", type: "atk", value: 15, price: 69, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+15), 명중(+8%)." },
    { name: "그림자 장화", type: "hp", value: 38, def: 5, price: 71, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "체력(+38), 방어(+5)." },
    { name: "독니 화살", type: "atk", value: 16, lifesteal: 0.08, price: 73, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+16), 흡혈(8%)." },
    // 헌터 — epic x5
    { name: "폭풍 시위", type: "atk", value: 26, price: 124, rarity: "epic", onlyFor: ["궁수"], desc: "궁수. 공격(+26), 명중(+12%)." },
    { name: "암흑 각오", type: "atk", value: 30, critMult: 0.28, price: 128, rarity: "epic", onlyFor: ["암살자"], desc: "암살자. 공격(+30), 치명 배율(+28%)." },
    { name: "정찰병의 망원경", type: "ring", value: 22, critBonus: 6, price: 119, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "명중(+22%), 치명(+6%)." },
    { name: "맹독 가죽", type: "atk", value: 24, lifesteal: 0.1, price: 126, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+24), 흡혈(10%)." },
    { name: "천둥 화살", type: "atk", value: 28, critBonus: 7, price: 127, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+28), 치명(+7%)." },
    // 헌터 — legendary x5
    { name: "별빛 석궁", type: "atk", value: 40, critBonus: 9, price: 202, rarity: "legendary", onlyFor: ["궁수"], desc: "궁수. 공격(+40), 명중(+15%), 치명(+9%)." },
    { name: "심연의 낫", type: "atk", value: 44, critMult: 0.35, lifesteal: 0.1, price: 208, rarity: "legendary", onlyFor: ["암살자"], desc: "암살자. 공격(+44), 배율(+35%), 흡혈(10%)." },
    { name: "천둥신의 활시위", type: "atk", value: 36, critMult: 0.22, price: 198, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+36), 치명 배율(+22%)." },
    { name: "바람의 군주", type: "atk", value: 38, price: 204, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+38), 명중(+14%)." },
    { name: "피의 계약서", type: "atk", value: 32, lifesteal: 0.14, critBonus: 8, price: 206, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+32), 흡혈(14%), 치명(+8%)." },
    // 마법사 계열 — common x5
    { name: "마나 잔류석", type: "atk", value: 9, price: 30, rarity: "common", onlyFor: ["마법사","위저드","소환사"], tags: ["arcane"], desc: "공격(+9)." },
    { name: "초급 주문서", type: "atk", value: 7, critBonus: 2, price: 28, rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+7), 치명(+2%)." },
    { name: "마도 학도 로브", type: "hp", value: 40, def: 5, price: 32, rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "체력(+40), 방어(+5)." },
    { name: "정령 가루", type: "atk", value: 8, critMult: 0.08, price: 31, rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+8), 치명 배율(+8%)." },
    { name: "마력 전도체", type: "atk", value: 11, price: 34, rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+11)." },
    // 마법사 — rare x5
    { name: "고대 룬스톤", type: "atk", value: 18, critMult: 0.18, price: 71, rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+18), 치명 배율(+18%)." },
    { name: "마력 증폭 링", type: "atk", value: 16, lifesteal: 0.06, price: 73, rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+16), 흡혈(6%)." },
    { name: "시간의 모래", type: "hp", value: 48, def: 7, price: 70, rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "체력(+48), 방어(+7)." },
    { name: "번개 인장", type: "atk", value: 19, critBonus: 4, price: 72, rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+19), 치명(+4%)." },
    { name: "심연의 페이지", type: "atk", value: 17, critMult: 0.14, price: 74, rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+17), 치명 배율(+14%)." },
    // 마법사 — epic x5
    { name: "성역 마도서", type: "atk", value: 32, critMult: 0.32, price: 128, rarity: "epic", onlyFor: ["위저드"], desc: "위저드. 공격(+32), 치명 배율(+32%)." },
    { name: "소환진 외피", type: "hp", value: 75, def: 11, lifesteal: 0.1, price: 124, rarity: "epic", onlyFor: ["소환사"], desc: "소환사. 체력(+75), 방어(+11), 흡혈(10%)." },
    { name: "혼돈 보주", type: "atk", value: 27, critBonus: 7, price: 121, rarity: "epic", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+27), 치명(+7%)." },
    { name: "별무리 로브", type: "hp", value: 62, def: 9, price: 119, rarity: "epic", onlyFor: ["마법사","위저드","소환사"], desc: "체력(+62), 방어(+9)." },
    { name: "마력 폭풍 지팡이", type: "atk", value: 30, critMult: 0.25, price: 126, rarity: "epic", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+30), 치명 배율(+25%)." },
    // 마법사 — legendary x5
    { name: "천공의 지팡이", type: "atk", value: 42, critMult: 0.38, price: 205, rarity: "legendary", onlyFor: ["위저드"], desc: "위저드. 공격(+42), 치명 배율(+38%)." },
    { name: "차원문 인장", type: "hp", value: 95, def: 14, lifesteal: 0.12, price: 200, rarity: "legendary", onlyFor: ["소환사"], desc: "소환사. 체력(+95), 방어(+14), 흡혈(12%)." },
    { name: "마도 제국의 왕관", type: "atk", value: 36, critBonus: 10, price: 198, rarity: "legendary", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+36), 치명(+10%)." },
    { name: "불멸의 마력 심장", type: "atk", value: 34, critMult: 0.3, price: 202, rarity: "legendary", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+34), 치명 배율(+30%)." },
    { name: "세계수의 잎새", type: "hp", value: 85, def: 12, price: 196, rarity: "legendary", onlyFor: ["마법사","위저드","소환사"], desc: "체력(+85), 방어(+12)." },
];

/** v7.0.3 — 상점 풀 확장 (밸런스 조정된 저~중 스탯) */
const equipmentPoolExtra703 = [
    { name: "낡은 끈", type: "hp", value: 6, price: 10, rarity: "common", desc: "공용. 체력(+6)." },
    { name: "조각난 화살촉", type: "atk", value: 3, price: 11, rarity: "common", desc: "공용. 공격(+3)." },
    { name: "구리 반지", type: "ring", value: 2, price: 12, rarity: "common", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 공격(+2)." },
    { name: "이끼 낀 돌", type: "hp", value: 9, def: 1, price: 13, rarity: "common", desc: "공용. 체력(+9), 방어(+1)." },
    { name: "가죽 끈", type: "ring", value: 4, price: 14, rarity: "common", desc: "공용. 명중(+4%)." },
    { name: "작은 철못", type: "atk", value: 4, price: 15, rarity: "common", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 공격(+4)." },
    { name: "마른 허브", type: "hp", value: 7, price: 11, rarity: "common", onlyFor: ["마법사", "위저드", "소환사"], tags: ["arcane"], desc: "마계. 체력(+7)." },
    { name: "부서진 수정", type: "atk", value: 4, critBonus: 1, price: 16, rarity: "common", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+4), 치명(+1%)." },
    { name: "녹슨 못", type: "atk", value: 3, def: 1, price: 12, rarity: "common", desc: "공용. 공격(+3), 방어(+1)." },
    { name: "짚신", type: "hp", value: 8, price: 10, rarity: "common", desc: "공용. 체력(+8)." },
    { name: "유리 조각", type: "atk", value: 5, critBonus: 1, price: 18, rarity: "common", desc: "공용. 공격(+5), 치명(+1%)." },
    { name: "작은 방울", type: "ring", value: 5, price: 17, rarity: "common", desc: "공용. 명중(+5%)." },
    { name: "밧줄 조각", type: "hp", value: 10, price: 14, rarity: "common", desc: "공용. 체력(+10)." },
    { name: "납 동전", type: "atk", value: 4, price: 13, rarity: "common", desc: "공용. 공격(+4)." },
    { name: "마른 고기", type: "hp", value: 11, price: 15, rarity: "common", lifesteal: 0.02, desc: "공용. 체력(+11), 흡혈(2%)." },
    { name: "작은 방패 파편", type: "hp", value: 9, def: 2, price: 19, rarity: "common", onlyFor: ["워리어", "나이트", "버서커"], tags: ["heavy"], desc: "워계. 체력(+9), 방어(+2)." },
    { name: "깃털 화살", type: "atk", value: 5, price: 20, rarity: "common", onlyFor: ["헌터", "궁수", "암살자"], tags: ["precision"], desc: "헌계. 공격(+5), 명중(+3%)." },
    { name: "연습용 구슬", type: "atk", value: 5, critMult: 0.04, price: 21, rarity: "common", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+5), 치명 배율(+4%)." },
    { name: "청동 팔찌", type: "atk", value: 6, def: 1, price: 22, rarity: "rare", desc: "공용. 공격(+6), 방어(+1)." },
    { name: "은박 반지", type: "ring", value: 14, price: 24, rarity: "rare", desc: "공용. 공격(+14)." },
    { name: "가는 철검", type: "atk", value: 7, critBonus: 2, price: 26, rarity: "rare", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 공격(+7), 치명(+2%)." },
    { name: "사냥꾼 주머니", type: "atk", value: 6, lifesteal: 0.03, price: 27, rarity: "rare", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 공격(+6), 흡혈(3%)." },
    { name: "마력 잔물결", type: "atk", value: 6, price: 25, rarity: "rare", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+6)." },
    { name: "단단한 가죽", type: "hp", value: 16, def: 2, price: 28, rarity: "rare", desc: "공용. 체력(+16), 방어(+2)." },
    { name: "바람 깃털", type: "ring", value: 8, critBonus: 1, price: 29, rarity: "rare", desc: "공용. 명중(+8%), 치명(+1%)." },
    { name: "작은 붉은 수정", type: "atk", value: 8, price: 32, rarity: "rare", desc: "공용. 공격(+8)." },
    { name: "강철 버클", type: "hp", value: 13, def: 3, price: 31, rarity: "rare", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 체력(+13), 방어(+3)." },
    { name: "야간 투시경", type: "ring", value: 9, price: 33, rarity: "rare", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 명중(+9%)." },
    { name: "마나 잔디", type: "hp", value: 18, price: 34, rarity: "rare", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 체력(+18)." },
    { name: "냉기 결정", type: "atk", value: 9, critBonus: 2, price: 38, rarity: "epic", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+9), 치명(+2%)." },
    { name: "강철 너클", type: "atk", value: 10, critMult: 0.06, price: 39, rarity: "epic", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 공격(+10), 치명 배율(+6%)." },
    { name: "독침 통", type: "atk", value: 9, lifesteal: 0.05, price: 40, rarity: "epic", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 공격(+9), 흡혈(5%)." },
    { name: "별무늬 천", type: "hp", value: 22, price: 41, rarity: "epic", desc: "공용. 체력(+22)." },
    { name: "암흑 가루", type: "atk", value: 11, price: 44, rarity: "epic", desc: "공용. 공격(+11), 명중(+4%)." },
    { name: "은빛 고리", type: "atk", value: 10, def: 2, price: 42, rarity: "epic", desc: "공용. 공격(+10), 방어(+2)." },
    { name: "화염 잔재", type: "atk", value: 12, critBonus: 3, price: 48, rarity: "epic", desc: "공용. 공격(+12), 치명(+3%)." },
    { name: "빛바랜 망토", type: "hp", value: 20, def: 3, price: 46, rarity: "epic", desc: "공용. 체력(+20), 방어(+3)." },
    { name: "수정 렌즈", type: "ring", value: 11, critBonus: 2, price: 47, rarity: "epic", desc: "공용. 명중(+11%), 치명(+2%)." },
    { name: "천상의 파편", type: "atk", value: 14, critMult: 0.08, price: 52, rarity: "legendary", desc: "전설. 공격(+14), 치명 배율(+8%)." },
    { name: "고대 철판", type: "hp", value: 28, def: 5, price: 54, rarity: "legendary", desc: "전설. 체력(+28), 방어(+5)." },
    { name: "폭풍의 씨앗", type: "atk", value: 13, price: 53, rarity: "legendary", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+13), 명중(+5%)." },
    { name: "용해액 병", type: "atk", value: 12, lifesteal: 0.07, price: 51, rarity: "legendary", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 공격(+12), 흡혈(7%)." },
    { name: "성스러운 철", type: "atk", value: 13, def: 3, price: 55, rarity: "legendary", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 공격(+13), 방어(+3)." },
    { name: "심해 비늘", type: "hp", value: 26, lifesteal: 0.06, price: 56, rarity: "legendary", desc: "전설. 체력(+26), 흡혈(6%)." },
    { name: "얼음 핵", type: "atk", value: 14, critBonus: 3, price: 57, rarity: "legendary", desc: "전설. 공격(+14), 치명(+3%)." },
    { name: "시간의 가루", type: "hp", value: 24, def: 4, price: 58, rarity: "legendary", desc: "전설. 체력(+24), 방어(+4)." },
    { name: "혼령 실", type: "atk", value: 11, critMult: 0.09, price: 50, rarity: "epic", desc: "공용. 공격(+11), 치명 배율(+9%)." },
    { name: "태양 가루", type: "ring", value: 10, price: 45, rarity: "epic", desc: "공용. 명중(+10%)." },
    { name: "암석 심장", type: "hp", value: 30, price: 59, rarity: "legendary", desc: "전설. 체력(+30)." },
    { name: "유리한 거래", type: "atk", value: 9, price: 36, rarity: "rare", desc: "공용. 공격(+9)." },
    { name: "잊힌 인장", type: "hp", value: 17, def: 2, price: 37, rarity: "rare", desc: "공용. 체력(+17), 방어(+2)." },
    { name: "바람의 조각", type: "atk", value: 8, price: 35, rarity: "rare", desc: "공용. 공격(+8), 명중(+4%)." },
    { name: "대지의 알", type: "hp", value: 19, price: 43, rarity: "epic", desc: "공용. 체력(+19)." },
    { name: "불꽃 심지", type: "atk", value: 10, critBonus: 2, price: 49, rarity: "epic", desc: "공용. 공격(+10), 치명(+2%)." },
];

/** 직업 전용 장비 추가 (워·헌·마 각 50종, 이름 중복 없음) — 접미사를 무기/갑옷/반지로 분리해 슬롯과 이름 일치 */
const equipmentPoolS1Extra = (function generateEquipmentPoolS1Extra() {
    const W = ['워리어', '나이트', '버서커'];
    const H = ['헌터', '궁수', '암살자'];
    const Z = ['마법사', '위저드', '소환사'];
    const wP = ['철벽','강철','용병','성역','전장','파쇄','불굴','수호','심연','맹세','야수','검은','붉은','푸른','금빛','은빛','전설','파멸','천벌','신성','맹렬','철기','용맹','빛의','어둠','불꽃','얼음','폭풍','번개','대지','하늘','재앙','구원','철의','강철심','불굴','수호','심연','야수','맹렬','성기사','광전','성역','검은철','붉은장','푸른빛','은빛','금빛','낡은','전장','맹세'];
    const wWeapon = ['대검','도끼','창','너클','철퇴','양날검','장검','모닝스타','리치','그레이트소드','전장검','언월도'];
    const wArmor = ['흉갑','각반','투구','손갑','망토','부츠','갑옷','방패','벨트','요새','유산'];
    const wRing = ['링','인장','휘장','방울','반지'];
    const hP = ['바람','그림자','맹금','독','야생','달빛','별빛','숲','늪','절벽','저격','추적','은신','암살','날렵','민첩','독수리','뱀','여우','늑대','새벽','황혼','서리','폭풍','번개','유령','맹독','은빛','금빛','진홍','밤','안개','이슬','빙결','화염','천둥','유성','유령','침묵','속삭임','날쌤','예리','냉기','불꽃','질풍','신속','급습','매복'];
    const hWeapon = ['활','단검','화살','시위','석궁','쇠뇌','표창','비수','투척칼','독침','함정'];
    const hArmor = ['망토','장갑','부츠','화살통','목걸이','가죽','띠','깃털'];
    const hRing = ['반지','주머니','표식','망원경','눈','휘장','링'];
    const zP = ['고대','마나','별','심연','시간','공허','불꽃','얼음','번개','혼돈','성스러운','금지된','잊힌','비밀','대마도','소환','차원','천공','심장','눈동자','지팡이','보주','룬','인장','페이지','서적','모래','수정','수호','파동','잔향','심연','성역','마력','주문','봉인','파괴','정화','저주','축복','각성','각인','결계','마도','영혼','불사','불멸','환영','심연'];
    const zWeapon = ['지팡이','보주','페이지','마력봉','각인','결정','파편','구슬','주문봉'];
    const zArmor = ['로브','모래시계','수정','수호진','결계','주문서','마도서','장막','목걸이','심장','문자 봉인석'];
    const zRing = ['링','인장','구슬','장식핀','주술목'];
    const out = [];
    function nameForSlot(i, pArr, weaponS, armorS, ringS, slotKind) {
        const a = pArr[(i * 7) % pArr.length];
        const pick = (arr) => arr[(i * 11) % arr.length];
        if (slotKind === 'weapon') return `${a} ${pick(weaponS)}`;
        if (slotKind === 'armor') return `${a} ${pick(armorS)}`;
        return `${a} ${pick(ringS)}`;
    }
    function addLine(jobArr, tag, jobKey, i, pArr, weaponS, armorS, ringS) {
        const rar = i % 25 === 0 ? 'legendary' : i % 6 === 0 ? 'epic' : i % 2 === 0 ? 'rare' : 'common';
        const v = 6 + (i * 7) % 28;
        const p = 22 + i * 2 + (rar === 'legendary' ? 100 : rar === 'epic' ? 40 : 0);
        const k = i % 6;
        const tg = tag ? [tag] : undefined;
        const slotNm = k === 1 ? 'armor' : k === 3 ? 'ring' : 'weapon';
        const nm = nameForSlot(i, pArr, weaponS, armorS, ringS, slotNm);
        if (k === 0) {
            const d = Math.floor(v / 10);
            out.push({
                name: nm,
                type: 'atk',
                value: v,
                def: d,
                price: p,
                rarity: rar,
                onlyFor: jobArr,
                tags: tg,
                desc: `공격(+${v}), 방어(+${d}).`,
            });
        } else if (k === 1) {
            const df = 4 + (i % 12);
            out.push({
                name: nm,
                type: 'hp',
                value: v * 2,
                def: df,
                price: p,
                rarity: rar,
                onlyFor: jobArr,
                tags: tg,
                desc: `체력(+${v * 2}), 방어(+${df}).`,
            });
        } else if (k === 2) {
            const cb = 2 + (i % 9);
            out.push({
                name: nm,
                type: 'atk',
                value: v,
                critBonus: cb,
                price: p,
                rarity: rar,
                onlyFor: jobArr,
                tags: tg,
                desc: `공격(+${v}), 치명(+${cb}%).`,
            });
        } else if (k === 3) {
            const ac = 10 + (i % 15);
            out.push({
                name: nm,
                type: 'ring',
                value: ac,
                price: p,
                rarity: rar,
                onlyFor: jobArr,
                tags: tg,
                desc: `반지 공격(+${ac}).`,
            });
        } else if (k === 4) {
            const ls = Math.round((0.04 + (i % 9) * 0.012) * 1000) / 1000;
            out.push({
                name: nm,
                type: 'atk',
                value: v,
                lifesteal: ls,
                price: p,
                rarity: rar,
                onlyFor: jobArr,
                tags: tg,
                desc: `공격(+${v}), 흡혈(${Math.round(ls * 100)}%).`,
            });
        } else {
            const cm = Math.round((0.06 + (i % 8) * 0.03) * 100) / 100;
            out.push({
                name: nm,
                type: 'atk',
                value: v,
                critMult: cm,
                price: p,
                rarity: rar,
                onlyFor: jobArr,
                tags: tg,
                desc: `공격(+${v}), 치명 배율(+${Math.round(cm * 100)}%).`,
            });
        }
    }
    for (let i = 1; i <= 50; i++) addLine(W, 'heavy', 'w', i, wP, wWeapon, wArmor, wRing);
    for (let i = 1; i <= 50; i++) addLine(H, 'precision', 'h', i, hP, hWeapon, hArmor, hRing);
    for (let i = 1; i <= 50; i++) addLine(Z, 'arcane', 'm', i, zP, zWeapon, zArmor, zRing);
    return out;
})();

/** 성직자 전용 장비 60종 — 신성력 획득 보너스(divinityGainBonus) 일부 포함 */
const equipmentPoolPriest = (function genPriestPool() {
    const out = [];
    const rc = ['common', 'common', 'rare', 'epic', 'legendary'];
    const roots = ['공명의', '서약의', '찬가의', '축성의', '은총의', '심판의', '계시의', '영광의'];
    const marks = ['인장', '성배', '잔향', '빛결', '유성', '서광', '성운', '찬란'];
    for (let i = 0; i < 60; i++) {
        const r = rc[i % 5];
        const typ = i % 3 === 0 ? 'atk' : i % 3 === 1 ? 'hp' : 'ring';
        const nm = `${roots[Math.floor(i / 8)]} ${marks[i % 8]}`;
        const base = 4 + (i % 20);
        const prayerBonus = r === 'epic' || r === 'legendary' ? 2 : 1;
        const o = {
            name: nm,
            type: typ,
            rarity: r,
            onlyFor: ['성직자'],
            price: 0,
            prayerBonus,
            desc: '',
        };
        if (typ === 'atk') o.value = base + 2;
        else if (typ === 'hp') o.value = base * 3 + 8;
        else o.value = 5 + (i % 16);

        const mod = i % 4;
        if (mod === 0) {
            o.value = (o.value || 0) + (r === 'legendary' ? 14 : r === 'epic' ? 10 : r === 'rare' ? 7 : 4);
        } else if (mod === 1) {
            o.def = (o.def || 0) + (r === 'legendary' ? 26 : r === 'epic' ? 18 : r === 'rare' ? 12 : 7);
        } else if (mod === 2) {
            o.critBonus = (o.critBonus || 0) + (r === 'legendary' ? 9 : r === 'epic' ? 6 : r === 'rare' ? 4 : 2);
        } else {
            o.critMult = (o.critMult || 0) + (r === 'legendary' ? 0.22 : r === 'epic' ? 0.14 : r === 'rare' ? 0.09 : 0.05);
        }
        if (i % 6 === 0) o.divinityGainBonus = 0.04 + (r === 'legendary' ? 0.08 : r === 'epic' ? 0.05 : r === 'rare' ? 0.03 : 0.01);
        if (i % 11 === 0) {
            o.lifesteal = (o.lifesteal || 0) + (r === 'legendary' ? 0.1 : r === 'epic' ? 0.07 : r === 'rare' ? 0.05 : 0.03);
        }
        if (i % 13 === 0) {
            o.critMult = (o.critMult || 0) + (r === 'legendary' ? 0.1 : r === 'epic' ? 0.08 : r === 'rare' ? 0.05 : 0.03);
        }
        if (i % 7 === 0 && typ === 'hp') {
            o.def = (o.def || 0) + (r === 'legendary' ? 6 : r === 'epic' ? 5 : 4);
        }
        if (i % 9 === 0 && (typ === 'atk' || typ === 'ring')) {
            o.critBonus = (o.critBonus || 0) + (r === 'legendary' ? 5 : r === 'epic' ? 4 : r === 'rare' ? 3 : 2);
        }
        o.tags = [`rarity_${r}`, `type_${typ}`, `synergy_priest`];
        out.push(o);
    }
    return out;
})();

/** 룬 전용 칸 1개 — 등급별 고정 상점가. 골드·도주 유틸 및 소량 전투 스탯. */
const runePool = [
    { name: '구리 각인 룬', type: 'rune', rarity: 'common', goldGainBonus: 0.025, desc: '공용. 골드 획득(+2.5%).' },
    { name: '바람의 은빛 룬', type: 'rune', rarity: 'common', fleeBonus: 0.07, desc: '공용. 패닉 도주 시 층 하락 완화(+7% 발동).' },
    { name: '불꽃 박석 룬', type: 'rune', rarity: 'common', value: 4, desc: '공용. 공격(+4).' },
    { name: '청동 수호 룬', type: 'rune', rarity: 'rare', hpBonus: 32, def: 5, desc: '공용. 체력(+32), 방어(+5).' },
    { name: '매매의 황금 룬', type: 'rune', rarity: 'rare', goldGainBonus: 0.055, desc: '공용. 골드 획득(+5.5%).' },
    { name: '그림자 도피 룬', type: 'rune', rarity: 'rare', fleeBonus: 0.12, desc: '공용. 패닉 도주 하락 완화(+12%).' },
    { name: '심연 파열 룬', type: 'rune', rarity: 'epic', value: 12, critBonus: 4, desc: '공용. 공격(+12), 치명(+4%).' },
    { name: '대지 심장 룬', type: 'rune', rarity: 'epic', hpBonus: 52, def: 10, goldGainBonus: 0.04, desc: '공용. 체력(+52), 방어(+10), 골드(+4%).' },
    { name: '유물 잔광 룬', type: 'rune', rarity: 'legendary', value: 18, critMult: 0.12, goldGainBonus: 0.085, desc: '공용. 공격(+18), 치명 배율(+12%), 골드(+8.5%).' },
    { name: '공허 이탈 룬', type: 'rune', rarity: 'legendary', fleeBonus: 0.2, goldGainBonus: 0.06, desc: '공용. 도주 하락 완화(+20%), 골드(+6%).' },
];

const equipmentPool = [
    // ===== 워리어 전용 =====
    { name: "거인족의 대검",      type: "atk", value: 21, price: 90,  rarity: "epic",   onlyFor: ["워리어","나이트","버서커"], critBonus: 6,  desc: "워리어 계열. 공격력(+21). 치명타 확률(+6%)." },
    { name: "찬빛 합금 흉갑",        type: "hp",  value: 80, def: 16, price: 90,  rarity: "epic",   onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 체력(+80), 방어(+16)." },
    { name: "용사의 방패",        type: "hp",  value: 50, def: 14, price: 60,  rarity: "rare",   onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 체력(+50), 방어(+14)." },
    { name: "전쟁의 도끼",        type: "atk", value: 18, price: 70,  rarity: "rare",   onlyFor: ["워리어","나이트","버서커"], critBonus: 4,  desc: "워리어 계열. 공격력(+18). 치명타 확률(+4%)." },
    { name: "분노의 투구",        type: "hp",  value: 55, def: 8, price: 50,  rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 체력(+55), 방어(+8)." },
    { name: "철벽의 각반",        type: "hp",  value: 30, def: 10, price: 45,  rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 체력(+30), 방어(+10)." },
    { name: "강철 팔찌",          type: "ring", value: 8,  def: 6,  price: 40,  rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 공격(+8), 방어(+6)." },
    { name: "파괴자의 도끼",      type: "atk", value: 35, price: 130, rarity: "epic",   onlyFor: ["버서커"], critBonus: 10, desc: "버서커 전용. 공격력(+35). 치명타 확률(+10%)." },
    { name: "성기사의 검",        type: "atk", value: 28, def: 8, price: 120, rarity: "epic",   onlyFor: ["나이트"], desc: "나이트 전용. 공격력(+28), 방어(+8)." },

    // ===== 헌터 전용 =====
    { name: "정령왕의 활",        type: "atk", value: 22, price: 95,  rarity: "epic",   onlyFor: ["헌터","궁수","암살자"], critBonus: 8,  desc: "헌터 계열. 공격력(+22). 치명타 확률(+8%)." },
    { name: "은신 단검",      type: "atk", value: 18, price: 70,  rarity: "rare",   onlyFor: ["헌터","궁수","암살자"], critMult: 0.25, desc: "헌터 계열. 공격력(+18). 치명타 배율(+25%)." },
    { name: "독화살 통",          type: "atk", value: 14, price: 55,  rarity: "rare",   onlyFor: ["헌터","궁수","암살자"], desc: "헌터 계열. 공격력(+14)." },
    { name: "그림자 망토",        type: "hp",  value: 40, def: 4, price: 45,  rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "헌터 계열. 체력(+40), 방어(+4)." },
    { name: "사냥꾼의 장갑",      type: "hp",  value: 52, def: 5, price: 50,  rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "헌터 계열. 체력(+52), 방어(+5)." },
    { name: "바람의 신발",        type: "hp",  value: 38, def: 4, price: 35,  rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "헌터 계열. 체력(+38), 방어(+4)." },
    { name: "독이 묻은 화살촉",   type: "atk", value: 10, price: 40,  rarity: "common", onlyFor: ["헌터","궁수","암살자"], lifesteal: 0.08, desc: "헌터 계열. 공격력(+10). 흡혈(8%)." },
    { name: "폭풍의 활",          type: "atk", value: 32, price: 120, rarity: "epic",   onlyFor: ["궁수"], critBonus: 6, desc: "궁수 전용. 공격력(+32). 치명타(+6%), 명중(+10%)." },
    { name: "그림자 쌍검",        type: "atk", value: 28, price: 110, rarity: "epic",   onlyFor: ["암살자"], critMult: 0.4, lifesteal: 0.12, desc: "암살자 전용. 공격력(+28). 치명타 배율(+40%), 흡혈(12%)." },

    // ===== 마법사 전용 =====
    { name: "고대 마도 지팡이",  type: "atk", value: 28, price: 100, rarity: "epic",   onlyFor: ["마법사","위저드","소환사"], critMult: 0.4, desc: "마법사 계열. 공격력(+28). 치명타 배율(+40%)." },
    { name: "학자의 로브",        type: "hp",  value: 50, def: 6, price: 45,  rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "마법사 계열. 체력(+50), 방어(+6)." },
    { name: "마력 증폭기",        type: "atk", value: 20, price: 75,  rarity: "rare",   onlyFor: ["마법사","위저드","소환사"], critMult: 0.25, desc: "마법사 계열. 공격력(+20). 치명타 배율(+25%)." },
    { name: "정령의 로브",        type: "hp",  value: 65, def: 8, price: 65,  rarity: "rare",   onlyFor: ["마법사","위저드","소환사"], desc: "마법사 계열. 체력(+65), 방어(+8)." },
    { name: "마력 수정",      type: "atk", value: 15, price: 50,  rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "마법사 계열. 공격력(+15)." },
    { name: "마력 구슬",          type: "atk", value: 10, price: 35,  rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "마법사 계열. 공격력(+10)." },
    { name: "마력 봉인 관",      type: "atk", value: 8,  price: 30,  rarity: "common", onlyFor: ["마법사","위저드","소환사"], critBonus: 3, desc: "마법사 계열. 공격력(+8). 치명타 확률(+3%)." },
    { name: "고대 마법진",        type: "atk", value: 38, price: 130, rarity: "epic",   onlyFor: ["위저드"], critMult: 0.5, desc: "위저드 전용. 공격력(+38). 치명타 배율(+50%)." },
    { name: "차원 부름 인장",      type: "hp",  value: 80, def: 12, price: 120, rarity: "epic",   onlyFor: ["소환사"], lifesteal: 0.15, desc: "소환사 전용. 체력(+80), 방어(+12). 흡혈(15%)." },

    // ===== 공용 =====
    { name: "드래곤의 심장",      type: "hp",  value: 130, def: 14, price: 180, rarity: "legendary", desc: "전설. 체력(+130), 방어(+14)." },
    { name: "빛의 잔광검",         type: "atk", value: 45, price: 200, rarity: "legendary", critBonus: 10, critMult: 0.3, desc: "전설. 공격력(+45), 명중(+10%), 치명타 확률(+10%), 배율(+30%)." },
    { name: "흡혈 반지",          type: "ring", value: 8,  price: 60,  rarity: "rare",   lifesteal: 0.15, desc: "공용. 공격(+8). 흡혈(15%)." },
    { name: "흡혈 망토",          type: "hp",  value: 35, price: 75,  rarity: "rare",   lifesteal: 0.25, desc: "공용. 체력(+35). 흡혈(25%)." },
    { name: "저주받은 검",        type: "atk", value: 38, price: 100, rarity: "epic",   penalty: { '워리어': 15, '헌터': 20, '마법사': 25 }, critBonus: 12, desc: "공용. 공격력(+38). 치명타(+12%). 명중률 대폭 하락." },
    { name: "바람의 부츠",        type: "hp",  value: 48, def: 6, price: 55,  rarity: "rare",   desc: "공용. 체력(+48), 방어(+6)." },
    { name: "중갑옷",             type: "hp",  value: 75, def: 12, price: 65,  rarity: "rare",   penalty: { '마법사': 20, '헌터': 15 }, desc: "공용. 체력(+75), 방어(+12). 마법사·헌터는 명중률 감소." },
    { name: "낡은 가죽 갑옷",     type: "hp",  value: 35, def: 4,  price: 25,  rarity: "common", desc: "공용. 체력(+35), 방어(+4)." },
    { name: "회복의 목걸이",      type: "hp",  value: 20, price: 40,  rarity: "common", regenPotion: true, desc: "공용. 체력(+20). 포션 사용 시 2턴간 서서히 회복." },
    { name: "대지의 반지",        type: "ring", value: 45, def: 5,  price: 50,  rarity: "common", desc: "공용. 공격(+45), 방어(+5)." },
    { name: "수련자의 검",        type: "atk", value: 6,  price: 20,  rarity: "common", desc: "공용. 공격력(+6)." },
    { name: "견습 갑옷",          type: "hp",  value: 25, def: 3,  price: 20,  rarity: "common", desc: "공용. 체력(+25), 방어(+3)." },
    { name: "행운의 동전",        type: "ring", value: 8,  price: 25,  rarity: "common", critBonus: 2, desc: "공용. 명중률(+8%), 치명타 확률(+2%)." },
    { name: "불꽃 반지",          type: "ring", value: 12, price: 45,  rarity: "common", critBonus: 3, desc: "공용. 공격(+12), 치명(+3%)." },
    { name: "생명의 돌",          type: "hp",  value: 55, price: 45,  rarity: "rare",   desc: "공용. 체력(+55)." },
    { name: "전투 반지",          type: "ring", value: 14, def: 4, price: 55,  rarity: "rare",   desc: "공용. 공격(+14), 방어(+4)." },
    { name: "용의 비늘 조각",     type: "hp",  value: 60, def: 8,  price: 70,  rarity: "rare",   desc: "공용. 체력(+60), 방어(+8)." },
    { name: "고대 유물 파편",     type: "atk", value: 18, price: 65,  rarity: "rare",   desc: "공용. 공격력(+18), 명중률(+5%)." },
    { name: "피의 에센스",        type: "atk", value: 20, price: 80,  rarity: "epic",   lifesteal: 0.18, critBonus: 5, desc: "공용. 공격력(+20). 흡혈(18%), 치명타(+5%)." },
    { name: "불사의 갑옷",        type: "hp",  value: 90, def: 15, price: 140, rarity: "epic",   desc: "공용. 체력(+90), 방어(+15)." },
    { name: "번개의 반지",        type: "ring", value: 25, price: 110, rarity: "epic",   critBonus: 8, critMult: 0.2, desc: "공용. 공격(+25). 치명(+8%), 배율(+20%)." },
    { name: "폭군의 갑옷",        type: "hp",  value: 110, def: 20, price: 170, rarity: "legendary", critBonus: 5, desc: "전설. 체력(+110), 방어(+20), 치명타(+5%)." },
    { name: "세계수의 가지",      type: "hp",  value: 80, price: 150, rarity: "legendary", regenPotion: true, lifesteal: 0.2, desc: "전설. 체력(+80). 포션 강화, 흡혈(20%)." },
    ...equipmentPoolV651,
    ...equipmentPoolExtra703,
    ...equipmentPoolS1Extra,
    ...equipmentPoolPriest,
    ...runePool,
];

/**
 * v7 시너지(리워크): 등급별 아이템 조합 시 추가 효과
 * @type {{id:string,name:string,fromTag:string,needCount:number,bonus:{atk?:number,hp?:number,def?:number,acc?:number,crit?:number,critMult?:number},effectDesc:string}[]}
 */
const synergyRules = [
    {
        id: 'syn_role_offense_blade',
        name: '전투 공명',
        fromTag: 'role_offense',
        needCount: 2,
        bonus: { atk: 18, crit: 4 },
        effectDesc: '공격형 2개: 공격+18, 치명+4%',
        detailDesc:
            '공격형 장비가 동시에 2개 이상 장착되면 발동합니다. 무기·공격 반지·공격 룬 빌드의 화력을 끌어올립니다.',
    },
    {
        id: 'syn_role_guard',
        name: '수호 공명',
        fromTag: 'role_defense',
        needCount: 2,
        bonus: { hp: 70, def: 10 },
        effectDesc: '방어형 2개: 체력+70, 방어+10',
        detailDesc:
            '방어형 장비가 동시에 2개 이상 장착되면 발동합니다. 갑옷·방패·수호 룬 중심의 생존력을 보강합니다.',
    },
    {
        id: 'syn_role_utility',
        name: '풍요 공명',
        fromTag: 'role_utility',
        needCount: 2,
        bonus: { hp: 35, critMult: 0.08 },
        effectDesc: '유틸형 2개: 체력+35, 치명배율+8%',
        detailDesc:
            '유틸형 장비가 동시에 2개 이상 장착되면 발동합니다. 골드·흡혈·포션 보조 장비를 전투 가치로 이어 줍니다.',
    },
    {
        id: 'syn_common_echo',
        name: '잔향 공명',
        fromTag: 'rarity_common',
        needCount: 3,
        bonus: { def: 8, hp: 30 },
        effectDesc: '일반 3개: 방어+8, 체력+30',
        detailDesc:
            '인벤토리에 일반(common) 등급 장비가 동시에 3개 이상 장착되면 발동합니다. 방어력과 체력이 추가로 오릅니다.',
    },
    {
        id: 'syn_rare_oath',
        name: '서약 공명',
        fromTag: 'rarity_rare',
        needCount: 2,
        bonus: { atk: 14, def: 6 },
        effectDesc: '희귀 2개: 공격+14, 방어+6',
        detailDesc:
            '인벤토리에 희귀(rare) 등급 장비가 동시에 2개 이상 장착되면 발동합니다. 공격력과 방어력이 추가로 오릅니다.',
    },
    {
        id: 'syn_epic_hymn',
        name: '찬가 공명',
        fromTag: 'rarity_epic',
        needCount: 2,
        bonus: { crit: 8, critMult: 0.18 },
        effectDesc: '영웅 2개: 치명+8%, 치명배율+18%',
        detailDesc:
            '인벤토리에 에픽(epic) 등급 장비가 동시에 2개 이상 장착되면 발동합니다. 치명타 확률과 치명타 배율이 추가로 오릅니다.',
    },
    {
        id: 'syn_legend_glory',
        name: '영광 공명',
        fromTag: 'rarity_legendary',
        needCount: 2,
        bonus: { atk: 26, hp: 70, def: 12 },
        effectDesc: '전설 2개: 공격+26, 체력+70, 방어+12',
        detailDesc:
            '인벤토리에 전설(legendary) 등급 장비가 동시에 2개 이상 장착되면 발동합니다. 공격·체력·방어가 크게 추가됩니다.',
    },
];

const relicPool = [
    { id: 'relic_warrior_berserk', name: "분노의 심장",    desc: "체력 35% 이하일 때 피해 +45%.", onlyFor: ["워리어","나이트","버서커"], rarity: "legendary", effect: "berserk_crit",    price: 210 },
    { id: 'relic_warrior_shield',  name: "철벽의 의지",    desc: "방어 성공 시 체력 8% 회복 + 다음 공격 피해 25% 증가.", onlyFor: ["워리어","나이트","버서커"], rarity: "epic",      effect: "shield_empower",  price: 155 },
    { id: 'relic_hunter_dodge',    name: "그림자 반격",    desc: "회피 성공 시 적 방어 일부 무시 반격(강화된 반격 피해).", onlyFor: ["헌터","궁수","암살자"], rarity: "legendary", effect: "dodge_counter", price: 210 },
    { id: 'relic_hunter_execute',  name: "처형자의 표식",  desc: "적 체력 35% 이하일 때 피해 80% 증가.", onlyFor: ["헌터","궁수","암살자"], rarity: "epic",      effect: "execute",         price: 150 },
    { id: 'relic_wizard_chain',    name: "연쇄 마법진",    desc: "치명타 시 연쇄 충전: 다음 공격 피해 35% 증가.", onlyFor: ["마법사","위저드","소환사","성직자"], rarity: "legendary", effect: "chain_cast",     price: 210 },
    { id: 'relic_wizard_barrier',  name: "마력 방벽",      desc: "방어막으로 피해 감소 시 반사 45% + 체력 5% 회복.", onlyFor: ["마법사","위저드","소환사","성직자"], rarity: "epic",      effect: "barrier_reflect", price: 150 },
    { id: 'relic_common_vampire',  name: "뱀파이어의 반지", desc: "적 처치 시 체력 10% 회복 + 치명타 배율 영구 +3%.", onlyFor: null, rarity: "epic",      effect: "kill_heal",       price: 160 },
    { id: 'relic_common_gambler',  name: "도박사의 주사위", desc: "전투 시작 시만 무작위(⅓씩): 공격 +22% · 치명 +18% · 또는 공격·방어·치명 일부 감소(이번 전투만).", onlyFor: null, rarity: "rare", effect: "gambler", price: 110 },
];

// 대장간 합성 레시피
const forgeRecipes = [
    { name: "강화 철검",     type: "atk", value: 28, def: 0,  price: 0, rarity: "rare",      desc: "대장간 합성. 공격력(+28).",          materials: 2, materialRarity: "common", successRate: 0.85 },
    { name: "강화 갑주",     type: "hp",  value: 70, def: 12, price: 0, rarity: "rare",      desc: "대장간 합성. 체력(+70), 방어(+12).", materials: 2, materialRarity: "common", successRate: 0.85 },
    { name: "강화 반지",     type: "ring", value: 22, price: 0, rarity: "rare",      desc: "대장간 합성. 명중률(+22%)",          materials: 2, materialRarity: "common", successRate: 0.85, critBonus: 4 },
    { name: "영웅의 무기",   type: "atk", value: 42, price: 0, rarity: "epic",      desc: "대장간 합성. 공격력(+42).",          materials: 2, materialRarity: "rare",   successRate: 0.65, critBonus: 8 },
    { name: "영웅의 갑옷",   type: "hp",  value: 100, def: 18, price: 0, rarity: "epic",     desc: "대장간 합성. 체력(+100), 방어(+18).", materials: 2, materialRarity: "rare", successRate: 0.65 },
    { name: "전설의 파편",   type: "atk", value: 60, price: 0, rarity: "legendary", desc: "대장간 합성. 공격력(+60). 치명타(+12%).", materials: 3, materialRarity: "rare", successRate: 0.40, critBonus: 12 },
    { name: "불멸의 심장",   type: "hp",  value: 140, def: 22, price: 0, rarity: "legendary", desc: "대장간 합성. 체력(+140), 방어(+22).", materials: 3, materialRarity: "rare", successRate: 0.40 },
    { name: "파멸의 각인",   type: "atk", value: 50, price: 0, rarity: "legendary", desc: "대장간 합성. 공격력(+50). 흡혈(25%), 치명타 배율(+40%).", materials: 2, materialRarity: "epic", successRate: 0.50, lifesteal: 0.25, critMult: 0.4 },
];

/** 비유물 장비 스탯 설명 줄 생성 */
function buildEquipmentStatParts(it) {
    const parts = [];
    if (it.type === 'rune') {
        if (typeof it.value === 'number' && it.value) parts.push(`공격(+${it.value})`);
        if (typeof it.hpBonus === 'number' && it.hpBonus) parts.push(`체력(+${it.hpBonus})`);
        if (typeof it.def === 'number' && it.def !== 0) parts.push(it.def > 0 ? `방어(+${it.def})` : `방어(${it.def})`);
        if (typeof it.damageReduction === 'number') parts.push(`피해 감소(+${Math.round(it.damageReduction * 100)}%)`);
        if (typeof it.critBonus === 'number') parts.push(`치명(+${it.critBonus}%)`);
        if (typeof it.critMult === 'number') parts.push(`치명 배율(+${Math.round(it.critMult * 100)}%)`);
        if (typeof it.lifesteal === 'number') parts.push(`흡혈(${Math.round(it.lifesteal * 100)}%)`);
        if (typeof it.goldGainBonus === 'number') parts.push(`골드 획득(+${Math.round(it.goldGainBonus * 100)}%)`);
        if (typeof it.potionHealBonus === 'number') parts.push(`포션 회복(+${Math.round(it.potionHealBonus * 100)}%)`);
        if (typeof it.fleeBonus === 'number') parts.push(`도주 완화(${Math.round(it.fleeBonus * 100)}%)`);
        return parts;
    }
    if ((it.type === 'atk' || it.type === 'ring') && typeof it.value === 'number') parts.push(`공격(+${it.value})`);
    if (it.type === 'hp' && typeof it.value === 'number') parts.push(`체력(+${it.value})`);
    if (typeof it.hpBonus === 'number' && it.hpBonus) parts.push(`체력(+${it.hpBonus})`);
    if (typeof it.def === 'number' && it.def !== 0) {
        parts.push(it.def > 0 ? `방어(+${it.def})` : `방어(${it.def})`);
    }
    if (typeof it.damageReduction === 'number') parts.push(`피해 감소(+${Math.round(it.damageReduction * 100)}%)`);
    if (typeof it.critBonus === 'number') parts.push(`치명(+${it.critBonus}%)`);
    if (typeof it.critMult === 'number') parts.push(`치명 배율(+${Math.round(it.critMult * 100)}%)`);
    if (typeof it.lifesteal === 'number') parts.push(`흡혈(${Math.round(it.lifesteal * 100)}%)`);
    if (typeof it.goldGainBonus === 'number') parts.push(`골드 획득(+${Math.round(it.goldGainBonus * 100)}%)`);
    if (typeof it.potionHealBonus === 'number') parts.push(`포션 회복(+${Math.round(it.potionHealBonus * 100)}%)`);
    if (typeof it.fleeBonus === 'number') parts.push(`도주 완화(${Math.round(it.fleeBonus * 100)}%)`);
    if (typeof it.divinityGainBonus === 'number') parts.push(`신성 획득(+${Math.round(it.divinityGainBonus * 100)}%)`);
    return parts;
}

function rebuildEquipmentDesc(it, opts) {
    if (!it || it.type === 'relic') return;
    if (it.type === 'rune') {
        const parts = buildEquipmentStatParts(it);
        it.desc = parts.length ? `룬. ${parts.join(', ')}.` : (it.desc || '');
        return;
    }
    const parts = buildEquipmentStatParts(it);
    const s = parts.join(', ');
    if (opts && opts.floorUnlockKey != null) {
        const fk = Number(opts.floorUnlockKey);
        let base =
            fk === 100 ? `100층 달성! 전설의 유산. ${s}.` : `${fk}층 달성 해금. ${s}.`;
        if (it.regenPotion) base += ' 포션 효과 강화.';
        it.desc = base;
        return;
    }
    if (opts && opts.forgeRecipe) {
        it.desc = `대장간 합성. ${s}.`;
        return;
    }
    if (it.prayerBonus != null) {
        it.desc = `기도 보너스(+${it.prayerBonus}), ${s}.`;
        return;
    }
    if (it.regenPotion) {
        it.desc = s ? `${s}. 포션 효과 강화.` : '포션 효과 강화.';
        return;
    }
    it.desc = s ? `${s}.` : (it.desc || '');
}

function getRarityPowerMultiplier(rk) {
    const key = normalizeRarityKey(rk);
    return (BALANCE.rarityPower && BALANCE.rarityPower[key]) || BALANCE.rarityPower.common;
}

function normalizeRarityKey(rk) {
    const key = String(rk || 'common').toLowerCase();
    if (key === 'legend') return 'legendary';
    if (key === 'rare' || key === 'epic' || key === 'legendary') return key;
    return 'common';
}

function getRarityBaseGoldPrice(rk) {
    const key = normalizeRarityKey(rk);
    return getShopPriceForRarity(key, 1);
}

function normalizeBalanceFloor(floorRef, fallback) {
    const raw = floorRef == null ? fallback : floorRef;
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    const fb = Number(fallback);
    if (Number.isFinite(fb) && fb > 0) return Math.floor(fb);
    return 1;
}

function getFloorGrowthStep() {
    const cfg = BALANCE.floorGrowth || {};
    return {
        atk: Math.max(0, Math.floor(_safeNumForPrice(cfg.atkPerFloor, 1))),
        hp: Math.max(0, Math.floor(_safeNumForPrice(cfg.hpPerFloor, 5))),
    };
}

function normalizeFloorGrowth(raw) {
    const out = raw && typeof raw === 'object' ? raw : {};
    const floors = Math.max(0, Math.floor(Number(out.floors) || 0));
    const atk = Math.max(0, Math.floor(Number(out.atk) || 0));
    const hp = Math.max(0, Math.floor(Number(out.hp) || 0));
    return { floors, atk, hp };
}

function computeFloorGrowthForClears(clearCount) {
    const floors = Math.max(0, Math.floor(Number(clearCount) || 0));
    const step = getFloorGrowthStep();
    return {
        floors,
        atk: floors * step.atk,
        hp: floors * step.hp,
    };
}

function getTacticalSkillDef(skillKey) {
    const key = String(skillKey || '').trim();
    return key ? tacticalSkillChoices[key] || null : null;
}

function getTacticalSkillMilestoneForFloor(floorRef) {
    const f = normalizeBalanceFloor(floorRef, 1);
    return tacticalSkillMilestones.find((m) => m && m.floor === f) || null;
}

function createDefaultPlayerState() {
    const d = storyData && storyData.playerStateDefaults ? storyData.playerStateDefaults : {};
    return {
        corruption: Math.max(0, Math.floor(Number(d.corruption) || 0)),
        purification: Math.max(0, Math.floor(Number(d.purification) || 0)),
    };
}

function normalizePlayerState(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
        corruption: Math.max(0, Math.floor(Number(src.corruption) || 0)),
        purification: Math.max(0, Math.floor(Number(src.purification) || 0)),
    };
}

function getStoryRouteKey(playerStateRef) {
    const st = normalizePlayerState(playerStateRef);
    if (st.corruption > st.purification) return 'corruption';
    if (st.purification > st.corruption) return 'purification';
    return 'neutral';
}

function getStoryEndingKey(playerStateRef) {
    return getStoryRouteKey(playerStateRef) === 'purification' ? 'hero' : 'demonKing';
}

function getStoryTitleForState(playerStateRef, floorRef) {
    const f = normalizeBalanceFloor(floorRef, 1);
    const route = getStoryRouteKey(playerStateRef);
    if (f >= 31 && f < 100) {
        return (storyData.routeTitles && storyData.routeTitles[route]) || null;
    }
    if (f >= 100) {
        const endingKey = getStoryEndingKey(playerStateRef);
        return (storyData.endingTitles && storyData.endingTitles[endingKey]) || null;
    }
    return null;
}

function getStoryChoiceImpact(choiceKey) {
    const key = String(choiceKey || '').trim();
    if (!key || !storyData.choiceImpacts || !storyData.choiceImpacts[key]) return null;
    const raw = storyData.choiceImpacts[key];
    return Object.freeze({
        corruption: Math.max(0, Math.floor(Number(raw.corruption) || 0)),
        purification: Math.max(0, Math.floor(Number(raw.purification) || 0)),
        label: raw.label || key,
    });
}

function getRouteMilestoneFloor(floorRef) {
    const f = normalizeBalanceFloor(floorRef, 1);
    const milestones = Array.isArray(storyData.routeMilestones) ? storyData.routeMilestones : [];
    if (milestones.includes(f)) return f;
    return null;
}

function getStoryMilestoneDef(floorRef, playerStateRef) {
    const f = normalizeBalanceFloor(floorRef, 1);
    if (storyData.milestones && storyData.milestones[f]) {
        const def = storyData.milestones[f];
        return {
            key: def.key || `common:${f}`,
            route: 'common',
            title: def.title || `${f}층 기억`,
            trigger: def.trigger || null,
            lines: Array.isArray(def.lines) ? Array.from(def.lines) : [],
            titleOverride: null,
        };
    }
    if (f >= 31 && f <= 80) {
        const route = getStoryRouteKey(playerStateRef);
        const milestoneFloor = getRouteMilestoneFloor(f);
        if (!milestoneFloor) return null;
        const routeData = storyData.routes && storyData.routes[route] ? storyData.routes[route] : storyData.routes.neutral;
        const lines =
            routeData && routeData.milestones && routeData.milestones[milestoneFloor]
                ? Array.from(routeData.milestones[milestoneFloor])
                : [];
        if (!lines.length) return null;
        return {
            key: `${route}:${milestoneFloor}`,
            route,
            title: routeData.title ? `${milestoneFloor}층 · ${routeData.title}` : `${milestoneFloor}층 갈림길`,
            trigger: 'route_monologue',
            lines,
            titleOverride: routeData.title || null,
        };
    }
    if (f === 100) {
        const endingKey = getStoryEndingKey(playerStateRef);
        const ending = storyData.endings && storyData.endings[endingKey] ? storyData.endings[endingKey] : null;
        if (!ending) return null;
        return {
            key: ending.key || `ending:${endingKey}`,
            route: endingKey,
            title: ending.title || '최종 대면',
            trigger: 'ending_branch',
            lines: Array.isArray(ending.lines) ? Array.from(ending.lines) : [],
            titleOverride: (storyData.endingTitles && storyData.endingTitles[endingKey]) || null,
            battleTitle: ending.battleTitle || null,
        };
    }
    return null;
}

function getShopPriceForRarity(rk, floorRef) {
    const key = normalizeRarityKey(rk);
    const f = normalizeBalanceFloor(floorRef, 1);
    const table = BALANCE.shopPriceByRarity || {};
    const spec = table[key] || table.common || { base: 40, floorStep: 2 };
    const base = _safeNumForPrice(spec.base, 40);
    const step = _safeNumForPrice(spec.floorStep, 2);
    return Math.max(1, Math.floor(base + f * step));
}

function clampShopPriceToRarityOrder(rk, price, floorRef) {
    const order = ['common', 'rare', 'epic', 'legendary'];
    const key = normalizeRarityKey(rk);
    const idx = order.indexOf(key);
    if (idx < 0) return Math.max(1, Math.floor(_safeNumForPrice(price, 1)));
    const f = normalizeBalanceFloor(floorRef, 1);
    let out = Math.max(1, Math.floor(_safeNumForPrice(price, getShopPriceForRarity(key, f))));
    if (idx > 0) {
        const lowerTierPrice = getShopPriceForRarity(order[idx - 1], f);
        out = Math.max(out, lowerTierPrice + 1);
    }
    if (idx < order.length - 1) {
        const upperTierPrice = getShopPriceForRarity(order[idx + 1], f);
        out = Math.min(out, upperTierPrice - 1);
    }
    return Math.max(1, out);
}

function getPriceFloorReference(it, explicitFloorRef) {
    if (explicitFloorRef && typeof explicitFloorRef === 'object') {
        const candidates = [
            explicitFloorRef.shopFloor,
            explicitFloorRef.priceFloor,
            explicitFloorRef.currentFloor,
            explicitFloorRef.floor,
        ];
        for (const raw of candidates) {
            const n = Number(raw);
            if (Number.isFinite(n) && n > 0) return Math.floor(n);
        }
    } else {
        const n = Number(explicitFloorRef);
        if (Number.isFinite(n) && n > 0) return Math.floor(n);
    }
    return getEquipmentFloorReference(it);
}

function computeFloorGoldReward(floorRef, opts) {
    const cfg = BALANCE.goldReward || {};
    const f = normalizeBalanceFloor(floorRef, 1);
    const minBase = Math.floor(_safeNumForPrice(cfg.normalBaseMin, 6));
    const maxBase = Math.max(minBase, Math.floor(_safeNumForPrice(cfg.normalBaseMax, 10)));
    const spread = maxBase - minBase + 1;
    const rolledBase = minBase + Math.floor(Math.random() * spread);
    const floorStep = _safeNumForPrice(cfg.floorStep, 3);
    const normalMin = _safeNumForPrice(cfg.normalMin, 15);
    const normalMultiplier = _safeNumForPrice(cfg.normalMultiplier, 1);
    let gain = Math.max(normalMin, rolledBase + f * floorStep) * normalMultiplier;
    if (opts && opts.isBoss) {
        gain = gain * _safeNumForPrice(cfg.bossMultiplier, 2.4)
            + _safeNumForPrice(cfg.bossFlatBonus, 20)
            + f * _safeNumForPrice(cfg.bossFloorBonus, 2);
    }
    if (opts && Number.isFinite(Number(opts.multiplier))) {
        gain *= Number(opts.multiplier);
    }
    return Math.max(1, Math.floor(gain));
}

function getEquipmentFloorReference(it) {
    if (!it) return 1;
    const candidates = [it.unlockFloor, it.floorUnlock, it.requiredFloor, it.minFloor, it.floor];
    for (const raw of candidates) {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) return Math.floor(n);
    }
    return 1;
}

function getEquipmentFloorWeight(it) {
    const floorRef = getEquipmentFloorReference(it);
    const step = _safeNumForPrice(BALANCE.equipmentFloorWeightStep, 0.005);
    const cap = _safeNumForPrice(BALANCE.equipmentFloorWeightCap, 1.45);
    const raw = 1 + Math.max(0, floorRef - 1) * step;
    return Math.min(cap, Math.max(1, raw));
}

function getEquipmentPowerScale(it) {
    return getRarityPowerMultiplier(it && it.rarity) * getEquipmentFloorWeight(it);
}

function buildStableEquipmentEffectId(it) {
    const raw = `${String((it && it.name) || 'legendary').trim()}|${String((it && it.type) || 'gear')}`;
    let h = 2166136261;
    for (let i = 0; i < raw.length; i++) {
        h ^= raw.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return `legendary_${(h >>> 0).toString(36)}`;
}

function ensureLegendaryUniqueEffectPlaceholder(it) {
    if (!it || normalizeRarityKey(it.rarity) !== 'legendary' || it.type === 'rune' || it.type === 'relic') {
        if (it && normalizeRarityKey(it.rarity) !== 'legendary') {
            delete it.uniqueEffectId;
            delete it.effectDescription;
        }
        return it;
    }
    if (!it.uniqueEffectId) it.uniqueEffectId = buildStableEquipmentEffectId(it);
    if (!it.effectDescription) {
        it.effectDescription = '전설 고유 효과 슬롯. 추후 전용 패시브 또는 발동 효과를 연결할 수 있습니다.';
    }
    return it;
}

/** 등급별 총 예산(pt): 일반 1x, 희귀 1.5x, 영웅 2.5x, 전설 4.5x */
const BASE_EQUIPMENT_BUDGET = 48;
const BUDGET_BY_RARITY = {
    common: Math.round(BASE_EQUIPMENT_BUDGET * getRarityPowerMultiplier('common')),
    rare: Math.round(BASE_EQUIPMENT_BUDGET * getRarityPowerMultiplier('rare')),
    epic: Math.round(BASE_EQUIPMENT_BUDGET * getRarityPowerMultiplier('epic')),
    legendary: Math.round(BASE_EQUIPMENT_BUDGET * getRarityPowerMultiplier('legendary')),
    legend: Math.round(BASE_EQUIPMENT_BUDGET * getRarityPowerMultiplier('legend')),
};

/** 등급별 스탯 상한도 동일한 희귀도 파워 배율을 기준으로 확장 */
function _statMaxForRarity(rk) {
    const m = getRarityPowerMultiplier(rk);
    return {
        atk: Math.round(22 * m),
        hp: Math.round(90 * m),
        def: Math.round(16 * m),
        crit: Math.round(14 * m),
        cm: Math.round(12 * m),
        ls: Math.round(10 * m),
    };
}

/**
 * 1pt = 0.01 예산 스케일 단위. 원본 비용: 공격1, 방0.5, 체0.2, 치명1%3, 배율1%10
 * 흡혈은 표에 없어 1%=5원본pt로 처리.
 */
const STAT_COST_X100 = {
    atk: 100,
    def: 50,
    hp: 20,
    crit: 300,
    cm: 1000,
    ls: 500,
};

function _budgetHashSeed(str) {
    let h = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function _budgetMulberry32(seed) {
    return function rnd() {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** 태그·원본 필드·타입으로 배분 채널 결정 (반지·무기는 atk 채널) */
function _snapshotStatChannels(it) {
    const tags = Array.isArray(it.tags) ? it.tags : [];
    const t = it.type;
    const ch = {
        atk: t === 'atk' || t === 'ring',
        hp: t === 'hp',
        def: false,
        crit: false,
        cm: false,
        ls: false,
    };
    if (typeof it.def === 'number' && it.def !== 0) ch.def = true;
    if (typeof it.critBonus === 'number' && it.critBonus > 0) ch.crit = true;
    if (typeof it.critMult === 'number' && it.critMult > 0) ch.cm = true;
    if (typeof it.lifesteal === 'number' && it.lifesteal > 0) ch.ls = true;
    for (const g of tags) {
        if (g === 'heavy') ch.def = true;
        if (g === 'precision') ch.crit = true;
        if (g === 'arcane') {
            ch.crit = true;
            ch.cm = true;
        }
        if (g === 'blood') ch.ls = true;
        if (g === 'blade') ch.crit = true;
    }
    return ch;
}

/** 데이터에 `itemConcept: 'berserker' | 'assassin' | 'vampire' | 'tank' | 'hybrid'` 로 재정의 가능 */
const ITEM_CONCEPT_LABEL_KO = {
    berserker: '극딜/광전사',
    assassin: '치명/암살',
    vampire: '흡혈/생존',
    tank: '탱커/수호',
    hybrid: '유틸/하이브리드',
};

function _detectItemConcept(it) {
    if (it && it.itemConcept && ITEM_CONCEPT_LABEL_KO[it.itemConcept]) return it.itemConcept;
    const n = String((it && it.name) || '');
    const t = it && it.type;
    if (/파멸|광기|파쇄|맹렬|전쟁신의 유산|광전사의|광기의|극딜/.test(n)) return 'berserker';
    if ((t === 'atk' || t === 'ring') && /분노/.test(n)) return 'berserker';
    if (/저주/.test(n) && /검|도끼|철퇴|너클/.test(n)) return 'berserker';
    if (/암살|그림자 단검|급소|처형|심연의 낫|독니|맹금|암흑 각오|폭풍 시위|정찰병의 망원경/.test(n)) return 'assassin';
    if (/피의|흡혈|맹세|계약서|포식|뱀파이어|심해 비늘|용해액|그림자 단검|맹독 가죽|피의 계약|생명의 돌|세계수의 가지/.test(n)) return 'vampire';
    if (/방패|요새|흉갑|갑옷|암석|성기사의 성배|불멸의 요새|용왕|수호|성역의 방패|깊은 광산 판금|고대 철판|세계수의 잎새|암석 심장|천공의 갑옷|불멸의 흉갑/.test(n)) return 'tank';
    if (/신의 축복|전설의 유산|마도 제국의 왕관|시간의 모래시계|별무리|천상의 파편|혼령 실|태양 가루|은빛 고리|대지의 알/.test(n)) return 'hybrid';
    if (it && it.type === 'hp' && /방패|갑옷|흉갑|요새|비늘|망토|로브|심장|판금|방어|붕대|알|천/.test(n)) return 'tank';
    if (it && (it.type === 'atk' || it.type === 'ring') && /룬|별|천공|마도|보주|지팡이|활|화살|석궁|심연|혼돈|마력 폭풍|성역 마도서/.test(n)) return 'assassin';
    return 'hybrid';
}

function _narrowChannelsForConcept(it, ch, concept) {
    const c = { ...ch };
    const n = String((it && it.name) || '');
    const t = it && it.type;
    if (concept === 'berserker' && (t === 'atk' || t === 'ring')) {
        c.def = false;
        if (!/맹세|흡혈|피의|계약|피/.test(n)) c.ls = false;
    }
    if (concept === 'assassin') {
        c.def = false;
        if (!/피|흡혈|독|맹독|그림자 단검/.test(n)) c.ls = false;
    }
    if (concept === 'tank' && t === 'hp') {
        c.crit = false;
        c.cm = false;
        if (!/비늘|심해|피|흡혈|생명|소환진/.test(n)) c.ls = false;
    }
    if (concept === 'vampire') {
        if (!/심연|암살|급소|혼돈|보주/.test(n)) c.crit = false;
        if (!/심연|차원|마도|별/.test(n)) c.cm = false;
    }
    if (/저주/.test(n) && (t === 'atk' || t === 'ring')) c.def = false;
    return c;
}

function _conceptStatWeights(concept, ch, it, rnd) {
    const j = () => 0.92 + rnd() * 0.16;
    const w = { atk: 0, hp: 0, def: 0, crit: 0, cm: 0, ls: 0 };
    const name = String((it && it.name) || '');
    const h = (_budgetHashSeed(name + '|' + concept) % 1000) / 8000;

    if (concept === 'berserker') {
        if (ch.atk) w.atk = (6.4 + h) * j();
        if (ch.crit) w.crit = (0.85 + h * 2) * j();
        if (ch.cm) w.cm = (0.5 + h) * j();
        if (ch.ls) w.ls = 0.32 * j();
        if (ch.hp) w.hp = 1.4 * j();
        if (ch.def) w.def = 0.12 * j();
    } else if (concept === 'assassin') {
        if (ch.atk) w.atk = (2.1 + h * 3) * j();
        if (ch.crit) w.crit = (4.6 + h * 2) * j();
        if (ch.cm) w.cm = (3.9 + h * 2) * j();
        if (ch.ls) w.ls = 0.45 * j();
        if (ch.def) w.def = 0.18 * j();
        if (ch.hp) w.hp = 1.1 * j();
    } else if (concept === 'vampire') {
        if (ch.ls) w.ls = (5.6 + h) * j();
        if (ch.hp) w.hp = (3.9 + h * 2) * j();
        if (ch.atk) w.atk = (2.1 + h) * j();
        if (ch.def) w.def = 1.15 * j();
        if (ch.crit) w.crit = 0.75 * j();
        if (ch.cm) w.cm = 0.65 * j();
    } else if (concept === 'tank') {
        if (ch.hp) w.hp = (5.1 + h * 2) * j();
        if (ch.def) w.def = (5.3 + h * 2) * j();
        if (ch.atk) w.atk = 0.32 * j();
        if (ch.ls) w.ls = 0.38 * j();
        if (ch.crit) w.crit = 0.14 * j();
        if (ch.cm) w.cm = 0.11 * j();
    } else {
        if (ch.atk) w.atk = (2 + h) * j();
        if (ch.hp) w.hp = (2 + h) * j();
        if (ch.def) w.def = (1.55 + h) * j();
        if (ch.crit) w.crit = (1.35 + h) * j();
        if (ch.cm) w.cm = (1.35 + h) * j();
        if (ch.ls) w.ls = (1.15 + h) * j();
    }
    for (const k of Object.keys(w)) if (!ch[k]) w[k] = 0;
    return w;
}

function _uniquifyStatWeights(w, name) {
    const h = _budgetHashSeed(String(name || 'item'));
    const keys = ['atk', 'hp', 'def', 'crit', 'cm', 'ls'];
    const o = {};
    keys.forEach((k, i) => {
        const bump = 1 + (((h >> (i * 4)) & 0x1f) / 240);
        o[k] = (w[k] || 0) * bump;
    });
    return o;
}

/** [파멸·피·저주] / [신·축복·불사·용왕] / [번개·별·시간] — 데이터 `keywordTheme: 'ruin'|'divine'|'arcane'` 로 덮어쓰기 가능 */
function _detectKeywordTheme(it) {
    if (it && it.keywordTheme && /^(ruin|divine|arcane)$/.test(it.keywordTheme)) return it.keywordTheme;
    const n = String((it && it.name) || '');
    if (/신|축복|불사|용왕/.test(n)) return 'divine';
    if (/번개|별|시간/.test(n)) return 'arcane';
    if (/파멸|저주|피의|핏물|진홍|뱀파이어의|계약서|포식/.test(n)) return 'ruin';
    return null;
}

const KEYWORD_THEME_LABEL_KO = {
    ruin: '[파멸·피·저주]',
    divine: '[신·축복·불사·용왕]',
    arcane: '[번개·별·시간]',
};

function _applyKeywordThemeToWeights(w, theme, ch) {
    if (!theme) return w;
    const o = { atk: w.atk || 0, hp: w.hp || 0, def: w.def || 0, crit: w.crit || 0, cm: w.cm || 0, ls: w.ls || 0 };
    const pri = { ruin: ['atk', 'crit', 'ls'], divine: ['hp', 'def'], arcane: ['crit', 'cm'] };
    const boost = 2.35;
    const cut = 0.42;
    const P = pri[theme];
    if (!P) return w;
    for (const k of P) {
        if (ch[k]) o[k] *= boost;
    }
    for (const k of Object.keys(o)) {
        if (!P.includes(k) && ch[k]) o[k] *= cut;
    }
    for (const k of Object.keys(o)) if (!ch[k]) o[k] = 0;
    return o;
}

function _pickSecondaryChannel(it, ch, rnd) {
    const n = String((it && it.name) || '');
    const pools = [
        [/파멸|저주|피의|피\b|뱀파이어/.test(n), ['crit', 'ls', 'cm', 'def']],
        [/신|축복|불사|용왕/.test(n), ['def', 'crit', 'cm', 'ls']],
        [/번개|별|시간/.test(n), ['cm', 'crit', 'ls', 'def']],
    ];
    let order = ['crit', 'def', 'cm', 'ls'];
    for (const [ok, ord] of pools) {
        if (ok) {
            order = ord;
            break;
        }
    }
    const sec = ['def', 'crit', 'cm', 'ls'];
    for (const k of order) {
        if (sec.includes(k) && !ch[k]) return k;
    }
    return sec[Math.floor(rnd() * 4)];
}

function _dropSecondaryChannel(it, ch, secList, rnd) {
    const n = String((it && it.name) || '');
    const lowFirst = ['ls', 'def', 'crit', 'cm'];
    if (/흡혈|피|맹세/.test(n)) lowFirst.splice(lowFirst.indexOf('ls'), 1);
    for (const k of lowFirst) {
        if (secList.includes(k)) return k;
    }
    return secList[secList.length - 1];
}

/**
 * 에픽/전설: 스탯 라인 2~4개 (주스탯 1 + 부스탯 1~3)
 */
function _enforceEpicLegendChannelBounds(ch, it, rk, rnd) {
    const rkLo = String(rk || '').toLowerCase();
    if (!['epic', 'legendary', 'legend'].includes(rkLo)) return ch;
    const out = { ...ch };
    const secKeys = ['def', 'crit', 'cm', 'ls'];
    let sec = secKeys.filter((k) => out[k]);
    if (!(out.atk || out.hp)) return out;
    while (sec.length < 1) {
        const add = _pickSecondaryChannel(it, out, rnd);
        out[add] = true;
        sec = secKeys.filter((k) => out[k]);
    }
    while (sec.length > 3) {
        const drop = _dropSecondaryChannel(it, out, sec, rnd);
        out[drop] = false;
        sec = secKeys.filter((k) => out[k]);
    }
    return out;
}

/** 할당 직후 각 스탯에 [0.85, 1.15] 무작위 배율 */
function _applyVar15PctToAllocatedStats(a, rnd, it) {
    const roll = () => 0.85 + rnd() * 0.3;
    const round1 = (x) => Math.max(0, Math.round((Number(x) || 0) * 10) / 10);
    if (a.atk > 0) a.atk = Math.max(1, Math.round(a.atk * roll()));
    if (a.hp > 0) a.hp = Math.max(1, Math.round(a.hp * roll()));
    if (a.def !== 0) a.def = Math.round(a.def * roll());
    if (a.crit > 0) a.crit = round1(a.crit * roll());
    if (a.cm > 0) a.cm = Math.max(1, Math.round(a.cm * roll()));
    if (a.ls > 0) a.ls = Math.max(1, Math.round(a.ls * roll()));
    return a;
}

function _countAllocatedStatLines(it, a) {
    let n = 0;
    if ((it.type === 'atk' || it.type === 'ring') && a.atk > 0) n++;
    if (it.type === 'hp' && a.hp > 0) n++;
    if (a.def !== 0 && a.def != null) n++;
    if (a.crit > 0) n++;
    if (a.cm > 0) n++;
    if (a.ls > 0) n++;
    return n;
}

function _ensureEpicLegendChannelMinimums(a, ch, rk, rnd) {
    const rkLo = String(rk || '').toLowerCase();
    if (!['epic', 'legendary', 'legend'].includes(rkLo)) return a;
    if (ch.crit && a.crit < 0.4) a.crit = Math.round((0.6 + rnd() * 2.2) * 10) / 10;
    if (ch.cm && a.cm < 4) a.cm = 4 + Math.floor(rnd() * 18);
    if (ch.ls && a.ls < 3) a.ls = 3 + Math.floor(rnd() * 12);
    if (ch.def && a.def === 0) a.def = 1 + Math.floor(rnd() * 5);
    return a;
}

function _ensureMinStatLinesAfterRoll(it, a, ch, rk, rnd) {
    const rkLo = String(rk || '').toLowerCase();
    if (!['epic', 'legendary', 'legend'].includes(rkLo)) return a;
    let guard = 0;
    while (_countAllocatedStatLines(it, a) < 2 && guard++ < 12) {
        if (ch.crit && a.crit <= 0) a.crit = Math.round((0.5 + rnd() * 2) * 10) / 10;
        else if (ch.def && a.def === 0) a.def = 1 + Math.floor(rnd() * 3);
        else if (ch.ls && a.ls <= 0) a.ls = 3 + Math.floor(rnd() * 8);
        else if (ch.cm && a.cm <= 0) a.cm = 5 + Math.floor(rnd() * 15);
        else if ((it.type === 'atk' || it.type === 'ring') && a.atk <= 1) a.atk += 1 + Math.floor(rnd() * 3);
        else if (it.type === 'hp' && a.hp <= 1) a.hp += 2 + Math.floor(rnd() * 6);
        else break;
    }
    return a;
}

function _applyRuinTradeoff(it, a, theme, rnd) {
    if (theme !== 'ruin') return a;
    const n = String((it && it.name) || '');
    const t = it && it.type;
    if (rnd() < 0.55 && (t === 'atk' || t === 'ring') && a.def >= 0) {
        a.def = -Math.max(3, Math.min(14, Math.floor(4 + rnd() * 10)));
    }
    if (rnd() < 0.35 && t === 'hp' && a.hp > 5) {
        a.hp = Math.max(1, Math.floor(a.hp * (0.88 + rnd() * 0.08)));
    }
    if (/저주/.test(n) && rnd() < 0.7) {
        const pen = it.penalty;
        if (!pen || typeof pen !== 'object' || Object.keys(pen).length === 0) {
            const base = 4 + Math.floor(rnd() * 6);
            it.penalty = { 워리어: base, 헌터: base + 4, 마법사: base + 8 };
        }
    }
    return a;
}

/**
 * 아이템 이름(한글 키워드) + 등급으로 스탯 채널 가중 — 공격/체력 주채널은 타입이 유지되고 부가로 방어·치명·배율·흡혈을 섞음.
 * @param {boolean} [strictFill=true] 일반·희귀: 부가 스탯 최소 개수 보장. 에픽/전설은 false로 붕어빵 완화.
 */
function _mergeNamePersonalityChannels(it, ch, strictFill) {
    const name = String(it.name || '');
    const t = it.type;
    const out = { atk: !!ch.atk, hp: !!ch.hp, def: !!ch.def, crit: !!ch.crit, cm: !!ch.cm, ls: !!ch.ls };
    const mark = (key) => {
        if (key === 'atk' && t !== 'atk' && t !== 'ring') return;
        if (key === 'hp' && t !== 'hp') return;
        out[key] = true;
    };
    if (/피|흡혈|포식|뱀파이어|생명|핏물|혈|진홍|붉은|핏방울|피의|심장|에센스/.test(name)) mark('ls');
    if (/갑옷|흉갑|방패|철벽|요새|각반|부츠|망토|로브|갑주|방어|수호|성역|판금|흉장|케이프|비늘|갑피|방어구|장갑|요새|벽|붕대|심장|거북|철판|고대 철/.test(name)) mark('def');
    if (/검|도끼|창|활|화살|단검|너클|철퇴|지팡이|보주|석궁|쇠뇌|무기|타격|파쇄|파멸|양날|대검|리치|모닝|그레이트|장검|언월|비수|표창|함정|독침|시위|화살통|끈|못|동전|촉|화살/.test(name)) {
        if (t === 'atk' || t === 'ring') mark('atk');
        mark('crit');
    }
    if (/치명|급소|암살|약점|명중|독수리|별빛|심연|예리|날카|급습|매복|저격|추적|은신|그림자|맹금|독니|처형|표식|조준|시위|눈|망원경/.test(name)) mark('crit');
    if (/룬|마도|폭풍|심판|각성|천공|영광|성스|신성|금빛|별무리|차원|혼돈|보주|페이지|서적|마력|마나|수정|주문|봉인|결계|불꽃|얼음|번개|천둥|유성|운석|잔류|가루|모래|결정|핵|폭군|제국|왕관|심장/.test(name)) {
        mark('cm');
        mark('crit');
    }
    if (/마나|마력|정령|고대|학도|보조|소환|잔향|수호진|암흑|혼령|시간|별|초급|주문서/.test(name)) {
        mark('cm');
    }
    if (/독|맹독|화염|얼음|번개|천둥|폭풍|유리|수정 렌즈|렌즈/.test(name)) mark('crit');

    if (strictFill !== false) {
        const sec = ['def', 'crit', 'cm', 'ls'];
        const seed = _budgetHashSeed(name + '|' + String(t) + '|sec');
        const rnd = _budgetMulberry32(seed);
        let secCount = sec.filter((k) => out[k]).length;
        let guard = 0;
        while (secCount < 2 && guard++ < 16) {
            out[sec[Math.floor(rnd() * 4)]] = true;
            secCount = sec.filter((k) => out[k]).length;
        }
        const rk = String(it.rarity || '').toLowerCase();
        if ((rk === 'epic' || rk === 'legendary' || rk === 'legend') && secCount < 3) {
            for (const pick of sec) {
                if (!out[pick]) {
                    out[pick] = true;
                    break;
                }
            }
        }
    }
    return out;
}

function _safeNumForPrice(v, fb) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
}

function _roundScaledStat(v, minValue) {
    const min = minValue == null ? 0 : minValue;
    return Math.max(min, Math.round(Number.isFinite(v) ? v : 0));
}

function _fixedDecimals(v, digits) {
    const n = Number(v);
    return Number((Number.isFinite(n) ? n : 0).toFixed(digits));
}

function _hasOwnStat(it, key) {
    return !!it && Object.prototype.hasOwnProperty.call(it, key);
}

const EQUIPMENT_ROLE_LABELS = Object.freeze({
    offense: '공격형',
    defense: '방어형',
    utility: '유틸형',
});

const EQUIPMENT_ROLE_TAGS = Object.freeze({
    offense: ['role_offense', 'synergy_blade'],
    defense: ['role_defense', 'synergy_guard'],
    utility: ['role_utility', 'synergy_utility'],
});

const LEGACY_CONCEPT_TAGS = new Set(['blade', 'heavy', 'precision', 'arcane', 'blood']);

function getEquipmentRoleLabel(role) {
    return EQUIPMENT_ROLE_LABELS[role] || EQUIPMENT_ROLE_LABELS.offense;
}

function detectEquipmentRole(it) {
    if (!it) return 'offense';
    const explicit = String(it.itemRole || it.equipmentRole || '').toLowerCase();
    if (explicit === 'offense' || explicit === 'defense' || explicit === 'utility') return explicit;
    const n = String(it.name || '');
    const t = String(it.type || '');
    const weaponRx =
        /검|도끼|창|활|화살|단검|너클|철퇴|지팡이|보주|시위|석궁|쇠뇌|표창|비수|독침|대검|양날검|마력봉|주문봉|파열|파멸|폭풍|번개|천둥|화염|냉기|얼음|심연|혼돈|전쟁|광전|분노|전사의|전장|맹렬|처형|암살|급소|저격|추적|조준|눈|렌즈|망원경/;
    const defenseRx =
        /갑옷|갑주|흉갑|갑옷|방패|방어|수호|성역|철벽|요새|불멸|판금|비늘|짚신|장화|부츠|로브|망토|가죽|외피|장갑|투구|각반|벨트|버클|붕대|갑피|철판|대지|암석|바위|심장|성배|성기사|세계수|결계|수호진/;
    const utilityRx =
        /풍요|도둑|황금|행운|상인|매매|거래|동전|보물|회복|포션|치유|허브|흡혈|피의|피\b|혈|뱀파이어|생명|에센스|계약|맹세|도피|이탈|공허|바람의 은빛|도주|탈출|재생/;
    if (t === 'rune') {
        if (/방어|수호|대지|심장|결계|방패|철벽/.test(n)) return 'defense';
        if (/공격|파열|불꽃|번개|심연|화염|냉기|폭풍/.test(n)) return 'offense';
        return 'utility';
    }
    const hasWeaponConcept = weaponRx.test(n);
    const hasDefenseConcept = defenseRx.test(n);
    const hasUtilityConcept = utilityRx.test(n);
    if (t === 'hp') {
        if (hasUtilityConcept && /회복|포션|치유|허브|흡혈|피의|피\b|혈|뱀파이어|생명|에센스|계약|맹세|재생|세계수/.test(n)) {
            return 'utility';
        }
        return 'defense';
    }
    if (t === 'ring') {
        if (hasUtilityConcept) return 'utility';
        if (hasDefenseConcept) return 'defense';
        return 'offense';
    }
    if (t === 'atk') {
        if (hasUtilityConcept && !hasWeaponConcept) return 'utility';
        return 'offense';
    }
    if (hasUtilityConcept) return 'utility';
    if (hasDefenseConcept) return 'defense';
    if (hasWeaponConcept) return 'offense';
    return 'offense';
}

function normalizeEquipmentTagsForRole(it, role) {
    if (!it) return;
    const rk = normalizeRarityKey(it.rarity);
    const base = Array.isArray(it.tags) ? it.tags : [];
    const kept = base
        .map((t) => String(t || '').trim())
        .filter((t) => {
            if (!t) return false;
            if (LEGACY_CONCEPT_TAGS.has(t)) return false;
            if (/^role_/i.test(t) || /^synergy_/i.test(t)) return false;
            if (/^rarity_/i.test(t) || /^type_/i.test(t)) return false;
            return true;
        });
    it.tags = Array.from(
        new Set([
            ...kept,
            `rarity_${rk}`,
            `type_${String(it.type || 'gear')}`,
            ...(EQUIPMENT_ROLE_TAGS[role] || EQUIPMENT_ROLE_TAGS.offense),
        ])
    );
    it.itemRole = role;
    it.itemRoleLabel = getEquipmentRoleLabel(role);
}

function clearEquipmentGeneratedStats(it) {
    [
        'value',
        'hpBonus',
        'def',
        'critBonus',
        'critMult',
        'lifesteal',
        'goldGainBonus',
        'fleeBonus',
        'damageReduction',
        'potionHealBonus',
        'divinityGainBonus',
        'prayerBonus',
        'regenPotion',
        'penalty',
    ].forEach((key) => {
        delete it[key];
    });
}

function stripStatsOutsideRole(it, role) {
    if (!it) return it;
    const r = role || detectEquipmentRole(it);
    if (r === 'offense') {
        delete it.hpBonus;
        delete it.def;
        delete it.damageReduction;
        delete it.lifesteal;
        delete it.goldGainBonus;
        delete it.fleeBonus;
        delete it.potionHealBonus;
        delete it.divinityGainBonus;
        delete it.prayerBonus;
        delete it.regenPotion;
        if (it.type === 'hp') delete it.value;
    } else if (r === 'defense') {
        if (it.type !== 'hp') delete it.value;
        delete it.critBonus;
        delete it.critMult;
        delete it.lifesteal;
        delete it.goldGainBonus;
        delete it.fleeBonus;
        delete it.potionHealBonus;
        delete it.divinityGainBonus;
        delete it.prayerBonus;
        delete it.regenPotion;
        delete it.penalty;
    } else {
        delete it.value;
        delete it.hpBonus;
        delete it.def;
        delete it.damageReduction;
        delete it.critBonus;
        delete it.critMult;
        delete it.divinityGainBonus;
        delete it.prayerBonus;
        delete it.penalty;
    }
    return it;
}

function getEquipmentQualityMultiplier(it, rnd) {
    const roll = typeof rnd === 'function' ? rnd() : 0.5;
    const name = String((it && it.name) || '');
    let q = 0.74 + roll * 0.68;
    if (/명품|왕|제국|전설|영광|천공|태양|세계수|불멸|심연|파멸|용왕|전쟁신/.test(name)) q += 0.14;
    if (/낡은|녹슨|부서진|조각난|작은|마른|짚신|유리|끈|못|파편/.test(name)) q -= 0.14;
    return Math.max(0.62, Math.min(1.55, q));
}

function getRoleScale(it, rnd) {
    return getRarityPowerMultiplier(it && it.rarity) * getEquipmentFloorWeight(it) * getEquipmentQualityMultiplier(it, rnd);
}

function assignOffenseStats(it, scale, rnd) {
    const rk = normalizeRarityKey(it.rarity);
    const name = String(it.name || '');
    const mainBase = it.type === 'ring' ? 9 : it.type === 'rune' ? 8 : 13;
    it.value = _roundScaledStat(mainBase * scale * (0.88 + rnd() * 0.24), 1);
    const wantsCrit = /치명|급소|암살|약점|눈|렌즈|망원경|독수리|표식|조준|예리|날카|심연|그림자|처형/.test(name);
    const wantsCritMult = /마도|폭풍|천공|별|번개|천둥|혼돈|보주|지팡이|파멸|마력|각성|심판|왕관/.test(name);
    if (rk !== 'common' || wantsCrit || rnd() > 0.42) {
        it.critBonus = _roundScaledStat((rk === 'legendary' ? 3.4 : rk === 'epic' ? 2.5 : rk === 'rare' ? 1.55 : 0.85) * scale, 1);
    }
    if (rk === 'legendary' || rk === 'epic' || wantsCritMult || rnd() > 0.55) {
        it.critMult = _fixedDecimals((rk === 'legendary' ? 0.028 : rk === 'epic' ? 0.022 : 0.015) * scale, 2);
    }
}

function assignDefenseStats(it, scale, rnd) {
    const rk = normalizeRarityKey(it.rarity);
    const hp = _roundScaledStat(54 * scale * (0.9 + rnd() * 0.24), 1);
    if (it.type === 'hp') it.value = hp;
    else it.hpBonus = hp;
    it.def = _roundScaledStat(7.5 * scale * (0.82 + rnd() * 0.36), 1);
    const reductionBase = rk === 'legendary' ? 0.024 : rk === 'epic' ? 0.019 : rk === 'rare' ? 0.014 : 0.009;
    it.damageReduction = _fixedDecimals(Math.min(0.18, Math.max(0.01, reductionBase * scale)), 3);
}

function assignUtilityStats(it, scale, rnd) {
    const rk = normalizeRarityKey(it.rarity);
    const name = String(it.name || '');
    const wantsGold = /풍요|황금|행운|도둑|상인|매매|거래|동전|보물|유산|잔광/.test(name);
    const wantsLifesteal = /흡혈|피의|피\b|혈|뱀파이어|에센스|계약|맹세|생명|심장/.test(name);
    const wantsPotion = /회복|포션|치유|허브|세계수|재생|불사조/.test(name);
    const wantsFlee = /도피|이탈|공허|바람|도주|탈출/.test(name);
    const picks = [];
    if (wantsGold) picks.push('gold');
    if (wantsLifesteal) picks.push('lifesteal');
    if (wantsPotion) picks.push('potion');
    if (wantsFlee) picks.push('flee');
    if (!picks.length) {
        const order = ['gold', 'lifesteal', 'potion', 'flee'];
        picks.push(order[Math.floor(rnd() * order.length)]);
    }
    if ((rk === 'epic' || rk === 'legendary') && picks.length < 2) {
        const extra = ['gold', 'lifesteal', 'potion', 'flee'].find((x) => !picks.includes(x));
        if (extra) picks.push(extra);
    }
    if (rk === 'legendary' && picks.length < 3) {
        const extra = ['gold', 'lifesteal', 'potion', 'flee'].find((x) => !picks.includes(x));
        if (extra) picks.push(extra);
    }
    const mult = 0.8 + rnd() * 0.32;
    if (picks.includes('gold')) {
        it.goldGainBonus = _fixedDecimals(Math.min(0.35, Math.max(0.025, 0.018 * scale * mult)), 3);
    }
    if (picks.includes('lifesteal')) {
        it.lifesteal = _fixedDecimals(Math.min(0.3, Math.max(0.025, 0.016 * scale * mult)), 3);
    }
    if (picks.includes('potion')) {
        it.potionHealBonus = _fixedDecimals(Math.min(0.45, Math.max(0.08, 0.03 * scale * mult)), 3);
    }
    if (picks.includes('flee')) {
        it.fleeBonus = _fixedDecimals(Math.min(0.3, Math.max(0.05, 0.02 * scale * mult)), 3);
    }
}

function applyRoleBoundStatsToEquipmentItem(it) {
    const role = detectEquipmentRole(it);
    const seed = _budgetHashSeed(`${String(it.name || '')}|${String(it.type || '')}|${normalizeRarityKey(it.rarity)}|${getEquipmentFloorReference(it)}|role`);
    const rnd = _budgetMulberry32(seed);
    clearEquipmentGeneratedStats(it);
    const scale = getRoleScale(it, rnd);
    if (role === 'defense') assignDefenseStats(it, scale, rnd);
    else if (role === 'utility') assignUtilityStats(it, scale, rnd);
    else assignOffenseStats(it, scale, rnd);
    normalizeEquipmentTagsForRole(it, role);
    stripStatsOutsideRole(it, role);
    return it;
}

function computeEquipmentStatValueScore(it) {
    if (!it) return 0;
    const hpValue = (it.type === 'hp' ? safeNumberForStatScore(it.value) : 0) + safeNumberForStatScore(it.hpBonus);
    const atkValue = (it.type === 'atk' || it.type === 'ring' || it.type === 'rune') ? safeNumberForStatScore(it.value) : 0;
    return (
        atkValue * 1.55 +
        hpValue * 0.23 +
        Math.max(0, safeNumberForStatScore(it.def)) * 2.4 +
        Math.max(0, safeNumberForStatScore(it.critBonus)) * 4.8 +
        Math.max(0, safeNumberForStatScore(it.critMult)) * 100 * 2.8 +
        Math.max(0, safeNumberForStatScore(it.damageReduction)) * 100 * 6.8 +
        Math.max(0, safeNumberForStatScore(it.lifesteal)) * 100 * 4.5 +
        Math.max(0, safeNumberForStatScore(it.goldGainBonus)) * 100 * 3.7 +
        Math.max(0, safeNumberForStatScore(it.potionHealBonus)) * 100 * 2.8 +
        Math.max(0, safeNumberForStatScore(it.fleeBonus)) * 100 * 1.8
    );
}

function safeNumberForStatScore(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function _ensureMinPercentStat(it, key, minValue, digits) {
    if (!it) return;
    const cur = Number(it[key]);
    const safe = Number.isFinite(cur) ? cur : 0;
    it[key] = _fixedDecimals(Math.max(safe, minValue), digits);
}

function _ensureMinFlatStat(it, key, minValue) {
    if (!it) return;
    const cur = Number(it[key]);
    const safe = Number.isFinite(cur) ? cur : 0;
    it[key] = Math.max(Math.floor(safe), minValue);
}

function applyHighRarityMeritStats(it) {
    if (!it || it.type === 'relic' || it.type === 'merc') return it;
    const rk = normalizeRarityKey(it.rarity);
    if (rk !== 'epic' && rk !== 'legendary') return it;
    const isLegendary = rk === 'legendary';
    const role = detectEquipmentRole(it);
    if (role === 'offense') {
        _ensureMinFlatStat(it, 'critBonus', isLegendary ? 16 : 10);
        if (isLegendary) _ensureMinPercentStat(it, 'critMult', 0.22, 2);
    } else if (role === 'defense') {
        _ensureMinPercentStat(it, 'damageReduction', isLegendary ? 0.1 : 0.055, 3);
    } else {
        if (!it.goldGainBonus && !it.lifesteal && !it.potionHealBonus && !it.fleeBonus) {
            it.goldGainBonus = isLegendary ? 0.22 : 0.14;
        }
    }
    stripStatsOutsideRole(it, role);
    return it;
}

/**
 * 공식 가격: 등급별 기준가 + 현재 층수 계수.
 * 등급 간 가격 역전을 막기 위해 하위 등급은 상위 등급 가격 미만으로 클램프한다.
 */
function computeEquipmentGoldPrice(it, explicitFloorRef) {
    if (!it) return 0;
    const key = normalizeRarityKey(it.rarity);
    const priceFloor = getPriceFloorReference(it, explicitFloorRef);
    const basePrice = getShopPriceForRarity(key, priceFloor);
    const statScore = computeEquipmentStatValueScore(it);
    const baselineScore = {
        common: 10,
        rare: 42,
        epic: 85,
        legendary: 170,
    }[key] || 10;
    const rarityCoeff = {
        common: 3,
        rare: 2,
        epic: 1.2,
        legendary: 0.72,
    }[key] || 3;
    const floorCoeff = rarityCoeff + Math.min(1.4, Math.max(1, priceFloor) * 0.035);
    const rolePremium = it.itemRole === 'utility' ? 1.08 : it.itemRole === 'defense' ? 1.03 : 1;
    const premiumScore = Math.max(0, statScore - baselineScore);
    const rawPrice = basePrice + Math.round((premiumScore * floorCoeff + statScore * 0.22) * rolePremium);
    return clampShopPriceToRarityOrder(key, rawPrice, priceFloor);
}

function _jitterWeights(base, rnd) {
    const out = {};
    const VAR = 0.2;
    for (const k of Object.keys(base)) {
        const v = base[k];
        if (v <= 0) {
            out[k] = 0;
            continue;
        }
        const m = 1 - VAR + rnd() * (2 * VAR);
        out[k] = v * m;
    }
    let sum = 0;
    for (const k of Object.keys(out)) sum += out[k];
    if (sum <= 0) return out;
    for (const k of Object.keys(out)) out[k] /= sum;
    return out;
}

function _baseWeightsFromChannels(ch) {
    return {
        atk: ch.atk ? 2.4 : 0,
        hp: ch.hp ? 2.4 : 0,
        def: ch.def ? 1.35 : 0,
        crit: ch.crit ? 1.05 : 0,
        cm: ch.cm ? 1.05 : 0,
        ls: ch.ls ? 0.95 : 0,
    };
}

/**
 * 예산 Bx(= 원 pt ×100)를 채널에 맞춰 100% 소비. 반환: 원 단위 스탯 정수·비율
 * @param {object} [it] 있으면 컨셉 가중·이름 기반 미세 차별 적용
 */
function _allocateBudgetToStats(Bx, ch, rnd, rarityKey, it) {
    const concept = it && (it.itemConceptKey || _detectItemConcept(it));
    const theme = it && (it.keywordThemeKey || _detectKeywordTheme(it));
    let w0 =
        it && concept
            ? _conceptStatWeights(concept, ch, it, rnd)
            : _baseWeightsFromChannels(ch);
    if (it && concept) {
        w0 = _uniquifyStatWeights(
            w0,
            `${String(it.name || '')}|${String(it.rarity || '')}|${String(it.type || '')}|${concept}`,
        );
        if (theme) w0 = _applyKeywordThemeToWeights(w0, theme, ch);
    }
    const keys = ['atk', 'hp', 'def', 'crit', 'cm', 'ls'];
    const mask = {
        atk: ch.atk,
        hp: ch.hp,
        def: ch.def,
        crit: ch.crit,
        cm: ch.cm,
        ls: ch.ls,
    };
    let baseSum = 0;
    for (const k of keys) {
        if (mask[k]) baseSum += w0[k];
    }
    if (baseSum <= 0) {
        if (ch.atk) mask.atk = true;
        else if (ch.hp) mask.hp = true;
        w0 = _baseWeightsFromChannels(ch);
        for (const k of keys) {
            if (!mask[k]) w0[k] = 0;
            else if (!(k in w0) || w0[k] === 0) w0[k] = 1;
        }
    }
    const filtered = {};
    for (const k of keys) filtered[k] = mask[k] ? w0[k] : 0;
    const w = _jitterWeights(filtered, rnd);

    const C = STAT_COST_X100;
    const res = { atk: 0, hp: 0, def: 0, crit: 0, cm: 0, ls: 0 };
    let Brem = Bx;
    if (ch.atk) {
        res.atk = 1;
        Brem -= C.atk;
    }
    if (ch.hp) {
        res.hp = 1;
        Brem -= C.hp;
    }
    if (Brem < 0) Brem = 0;

    const parts = [];
    const STAT_MAX = _statMaxForRarity(rarityKey);
    if (ch.atk) {
        const pool = Brem * w.atk;
        const u = pool / C.atk;
        parts.push({ key: 'atk', u, cost: C.atk });
    }
    if (ch.hp) {
        const pool = Brem * w.hp;
        const u = pool / C.hp;
        parts.push({ key: 'hp', u, cost: C.hp });
    }
    if (ch.def) {
        const pool = Brem * w.def;
        const u = pool / C.def;
        parts.push({ key: 'def', u, cost: C.def });
    }
    if (ch.crit) {
        const pool = Brem * w.crit;
        const u = pool / C.crit;
        parts.push({ key: 'crit', u, cost: C.crit });
    }
    if (ch.cm) {
        const pool = Brem * w.cm;
        const u = pool / C.cm;
        parts.push({ key: 'cm', u, cost: C.cm });
    }
    if (ch.ls) {
        const pool = Brem * w.ls;
        const u = pool / C.ls;
        parts.push({ key: 'ls', u, cost: C.ls });
    }

    const remArr = [];
    for (const p of parts) {
        const baseKey = p.key;
        const existing = res[baseKey];
        const u = Number.isFinite(p.u) ? p.u : 0;
        const fl = Math.max(0, Math.floor(u));
        const r = u - fl;
        const room = Math.max(0, STAT_MAX[baseKey] - existing);
        const add = Math.min(fl, room);
        res[baseKey] = existing + add;
        remArr.push({ key: p.key, cost: p.cost, max: STAT_MAX[p.key], r });
    }

    const costOf = (k) => C[k];
    let spent = 0;
    for (const k of Object.keys(res)) {
        spent += res[k] * costOf(k);
    }
    let left = Bx - spent;

    remArr.sort((a, b) => b.r - a.r);
    let rr = 0;
    while (left > 0 && remArr.length) {
        let progressed = false;
        for (let k = 0; k < remArr.length; k++) {
            const p = remArr[(rr + k) % remArr.length];
            if (p.cost <= left && res[p.key] < p.max) {
                res[p.key]++;
                left -= p.cost;
                rr = (rr + k + 1) % remArr.length;
                progressed = true;
                break;
            }
        }
        if (!progressed) break;
    }

    if (left > 0) {
        const allow = { atk: ch.atk, hp: ch.hp, def: ch.def, crit: ch.crit, cm: ch.cm, ls: ch.ls };
        const tryAdd = [
            ['hp', C.hp],
            ['atk', C.atk],
            ['def', C.def],
            ['crit', C.crit],
            ['cm', C.cm],
            ['ls', C.ls],
        ];
        let guard2 = 0;
        while (left > 0 && guard2++ < 50000) {
            let ok = false;
            for (const [key, cst] of tryAdd) {
                if (!allow[key]) continue;
                if (cst <= left && res[key] < STAT_MAX[key]) {
                    res[key]++;
                    left -= cst;
                    ok = true;
                    break;
                }
            }
            if (!ok) break;
        }
    }

    return res;
}

/**
 * 비유물 장비 공식화:
 * 기본 수치 × 등급 배율 × 층 가중치로 무기·방어구·반지를 전부 재계산한다.
 */
function applyOfficialStatsToEquipmentItem(it, opts) {
    if (!it) return it;
    const o = opts || {};
    if (it.type === 'relic' || String(it.rarity || '').toLowerCase() === 'relic') return it;
    if (!['atk', 'hp', 'ring', 'rune'].includes(String(it.type || ''))) return it;
    if (o.floorUnlockKey != null) {
        const floorRef = Number(o.floorUnlockKey);
        if (Number.isFinite(floorRef) && floorRef > 0) it.unlockFloor = Math.floor(floorRef);
    }

    delete it.itemConceptKey;
    delete it.keywordThemeKey;
    delete it._itemConceptLabelKo;
    delete it._keywordThemeLabelKo;

    applyRoleBoundStatsToEquipmentItem(it);
    applyHighRarityMeritStats(it);
    it._officialStatApplied = true;
    clampEquipmentItemStatsToRarityCaps(it);
    ensureLegendaryUniqueEffectPlaceholder(it);
    it.price = computeEquipmentGoldPrice(
        it,
        o.floorUnlockKey != null ? { priceFloor: Number(o.floorUnlockKey) } : undefined,
    );
    if (o.rebuildDesc !== false) rebuildEquipmentDesc(it, o);
    return it;
}

/** 저장 데이터·구버전 보정: 등급 상한으로 장비 수치 클램프 후 설명 갱신 */
function clampEquipmentItemStatsToRarityCaps(it) {
    if (!it || it.type === 'relic' || it.type === 'merc') return it;
    if (!['atk', 'hp', 'ring', 'rune'].includes(String(it.type || ''))) return it;
    const role = detectEquipmentRole(it);
    stripStatsOutsideRole(it, role);
    normalizeEquipmentTagsForRole(it, role);
    const rk = normalizeRarityKey(it.rarity);
    const M = _statMaxForRarity(rk);
    if (typeof it.value === 'number') {
        if (it.type === 'hp') it.value = Math.max(1, Math.min(M.hp, it.value));
        else if (it.type === 'atk' || it.type === 'ring') it.value = Math.max(1, Math.min(M.atk, it.value));
        else if (it.type === 'rune') it.value = Math.max(1, Math.min(M.atk, it.value));
    }
    if (typeof it.hpBonus === 'number') {
        it.hpBonus = Math.max(1, Math.min(M.hp, it.hpBonus));
    }
    if (typeof it.def === 'number') {
        it.def = Math.min(M.def, Math.max(0, it.def));
    }
    if (typeof it.critBonus === 'number') it.critBonus = Math.min(M.crit, Math.max(0, it.critBonus));
    if (typeof it.critMult === 'number') it.critMult = Math.min(M.cm / 100, Math.max(0, it.critMult));
    if (typeof it.lifesteal === 'number') it.lifesteal = Math.min(M.ls / 100, Math.max(0, it.lifesteal));
    if (typeof it.damageReduction === 'number') {
        const reductionCap = rk === 'legendary' ? 0.2 : rk === 'epic' ? 0.13 : rk === 'rare' ? 0.075 : 0.04;
        it.damageReduction = Math.min(reductionCap, Math.max(0, it.damageReduction));
    }
    if (typeof it.goldGainBonus === 'number') {
        const goldCap = rk === 'legendary' ? 0.35 : rk === 'epic' ? 0.22 : rk === 'rare' ? 0.08 : 0.04;
        it.goldGainBonus = Math.min(goldCap, Math.max(0, it.goldGainBonus));
    }
    if (typeof it.potionHealBonus === 'number') {
        const potionCap = rk === 'legendary' ? 0.5 : rk === 'epic' ? 0.32 : rk === 'rare' ? 0.2 : 0.12;
        it.potionHealBonus = Math.min(potionCap, Math.max(0, it.potionHealBonus));
    }
    if (typeof it.fleeBonus === 'number') {
        const fleeCap = rk === 'legendary' ? 0.3 : rk === 'epic' ? 0.18 : rk === 'rare' ? 0.12 : 0.07;
        it.fleeBonus = Math.min(fleeCap, Math.max(0, it.fleeBonus));
    }
    return it;
}

if (typeof window !== 'undefined') {
    window.applyOfficialStatsToEquipmentItem = applyOfficialStatsToEquipmentItem;
    window.clampEquipmentItemStatsToRarityCaps = clampEquipmentItemStatsToRarityCaps;
    window.computeEquipmentGoldPrice = computeEquipmentGoldPrice;
    window.computeFloorGoldReward = computeFloorGoldReward;
    window.normalizeFloorGrowth = normalizeFloorGrowth;
    window.computeFloorGrowthForClears = computeFloorGrowthForClears;
    window.getFloorGrowthStep = getFloorGrowthStep;
    window.tacticalSkillChoices = tacticalSkillChoices;
    window.tacticalSkillMilestones = tacticalSkillMilestones;
    window.getTacticalSkillDef = getTacticalSkillDef;
    window.getTacticalSkillMilestoneForFloor = getTacticalSkillMilestoneForFloor;
    window.storyData = storyData;
    window.createDefaultPlayerState = createDefaultPlayerState;
    window.normalizePlayerState = normalizePlayerState;
    window.getStoryRouteKey = getStoryRouteKey;
    window.getStoryEndingKey = getStoryEndingKey;
    window.getStoryTitleForState = getStoryTitleForState;
    window.getStoryChoiceImpact = getStoryChoiceImpact;
    window.getStoryMilestoneDef = getStoryMilestoneDef;
    window.RUNE_POOL_COUNT = typeof runePool !== 'undefined' ? runePool.length : 0;
}

/** 공식 기반 스탯 테이블 적용 (비유물 전용) */
(function applyOfficialStatTable() {
    function runOne(it, opts) {
        if (!it) return;
        applyOfficialStatsToEquipmentItem(it, opts);
    }
    if (typeof equipmentPool !== 'undefined' && Array.isArray(equipmentPool)) {
        equipmentPool.forEach((it) => runOne(it, {}));
    }
    function applyObj(obj) {
        if (!obj) return;
        Object.keys(obj).forEach((k) => {
            runOne(obj[k], { floorUnlockKey: k });
        });
    }
    applyObj(typeof floorUnlocks !== 'undefined' ? floorUnlocks : null);
    applyObj(typeof floorUnlocksHunter !== 'undefined' ? floorUnlocksHunter : null);
    applyObj(typeof floorUnlocksWizard !== 'undefined' ? floorUnlocksWizard : null);
    if (typeof forgeRecipes !== 'undefined' && Array.isArray(forgeRecipes)) {
        forgeRecipes.forEach((it) => runOne(it, { forgeRecipe: true }));
    }
})();

// ---- rpg_v7.js ----
/**
 * 던전 v7 — 메타 진행(다중 캐릭터·테크트리·베이스캠프·퀘스트·시너지)
 * game.js에서 MetaRPG.* 호출
 */
(function (global) {
    const STORAGE_KEY = 'dungeon_meta_v7';
    /** 레거시 단일 저장 키 — migrate 후 파일 슬롯으로 이관 */
    const LEGACY_META_KEY = 'dungeon_meta_v7';
    const SAVE_SLOT_COUNT = 3;
    const ACTIVE_FILE_KEY = 'dungeon_meta_v7_active_file';
    const FILE_MIG_FLAG = 'dungeon_meta_v7_file_migrated_v2';

    function slotFileKey(i) {
        return 'dungeon_meta_v7_f' + i;
    }

    function getActiveFileIndex() {
        const v = parseInt(localStorage.getItem(ACTIVE_FILE_KEY) || '0', 10);
        return v >= 0 && v < SAVE_SLOT_COUNT ? v : 0;
    }

    function migrateLegacyMetaToFileSlots() {
        if (localStorage.getItem(FILE_MIG_FLAG)) return;
        try {
            const leg = localStorage.getItem(LEGACY_META_KEY);
            if (leg && !localStorage.getItem(slotFileKey(0))) {
                localStorage.setItem(slotFileKey(0), leg);
            }
        } catch (e) {
            /* ignore */
        }
        localStorage.setItem(FILE_MIG_FLAG, '1');
    }

    const MAX_SLOTS = 4;

    /** 30층 이상에서 상점을 통해서만 베이스캠프 UI (레거시 호환: 층>=30) */
    const BASE_CAMP_FLOORS = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

    function uid() {
        return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function defaultMeta() {
        return {
            version: 1,
            savedGold: 0,
            activeSlotId: null,
            slots: [],
        };
    }

    function ensureSlotV703(s) {
        if (!s) return;
        if (!s.campPerma) s.campPerma = { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
        if (s.reincarnationCount == null) s.reincarnationCount = 0;
        if (!s.rebirthStatBonus) s.rebirthStatBonus = { hp: 0, atk: 0, def: 0, acc: 0 };
        if (!s.rebirthPctBonus) s.rebirthPctBonus = { atkPct: 0, defPct: 0, critMultPct: 0 };
        if (s.bestFloor == null) s.bestFloor = 1;
        s.floorGrowth = normalizeSlotFloorGrowth(s.floorGrowth);
        s.playerState = normalizeSlotPlayerState(s.playerState);
        s.tacticalSkills = uniqueStringArray(s.tacticalSkills);
        s.tacticalSkillMilestonesClaimed = uniqueNumberArray(s.tacticalSkillMilestonesClaimed);
        s.promotionHistory = uniqueStringArray(s.promotionHistory);
        s.rescuedItems = normalizeRescuedItems(s.rescuedItems);
        /** A/B 라인 고정 제거 — 테크는 직업 내 노드 자유 조합 */
        if (s.techLine === 'A' || s.techLine === 'B') s.techLine = null;
    }

    function normalizeSlotFloorGrowth(raw) {
        if (typeof normalizeFloorGrowth === 'function') return normalizeFloorGrowth(raw);
        const src = raw && typeof raw === 'object' ? raw : {};
        return {
            floors: Math.max(0, Math.floor(Number(src.floors) || 0)),
            atk: Math.max(0, Math.floor(Number(src.atk) || 0)),
            hp: Math.max(0, Math.floor(Number(src.hp) || 0)),
        };
    }

    function normalizeSlotPlayerState(raw) {
        if (typeof normalizePlayerState === 'function') return normalizePlayerState(raw);
        const src = raw && typeof raw === 'object' ? raw : {};
        return {
            corruption: Math.max(0, Math.floor(Number(src.corruption) || 0)),
            purification: Math.max(0, Math.floor(Number(src.purification) || 0)),
        };
    }

    function uniqueStringArray(raw) {
        const arr = Array.isArray(raw) ? raw : [];
        return Array.from(new Set(arr.map((x) => String(x || '').trim()).filter(Boolean)));
    }

    function uniqueNumberArray(raw) {
        const arr = Array.isArray(raw) ? raw : [];
        return Array.from(
            new Set(
                arr
                    .map((x) => Math.floor(Number(x) || 0))
                    .filter((x) => Number.isFinite(x) && x > 0)
            )
        );
    }

    function normalizeRescuedItems(raw) {
        const arr = Array.isArray(raw) ? raw : [];
        return arr
            .filter((it) => it && typeof it === 'object' && ['atk', 'hp', 'ring', 'rune'].includes(String(it.type || '')))
            .slice(0, 12)
            .map((it) => {
                try {
                    const copy = JSON.parse(JSON.stringify(it));
                    if (copy.type === 'merc') return null;
                    return copy;
                } catch (e) {
                    return null;
                }
            })
            .filter(Boolean);
    }

    function loadMeta() {
        migrateLegacyMetaToFileSlots();
        try {
            const raw = localStorage.getItem(slotFileKey(getActiveFileIndex()));
            if (!raw) return defaultMeta();
            const o = JSON.parse(raw);
            if (!o || typeof o !== 'object') return defaultMeta();
            if (!Array.isArray(o.slots)) o.slots = [];
            if (o.savedGold == null) o.savedGold = 0;
            o.slots.forEach(ensureSlotV703);
            return o;
        } catch (e) {
            return defaultMeta();
        }
    }

    function saveMeta(m) {
        localStorage.setItem(slotFileKey(getActiveFileIndex()), JSON.stringify(m));
    }

    function setActiveSaveFileIndex(i) {
        if (i < 0 || i >= SAVE_SLOT_COUNT) return false;
        localStorage.setItem(ACTIVE_FILE_KEY, String(i));
        return true;
    }

    function clearSaveFile(i) {
        if (i < 0 || i >= SAVE_SLOT_COUNT) return false;
        localStorage.removeItem(slotFileKey(i));
        return true;
    }

    function getSaveFileSlotCount() {
        return SAVE_SLOT_COUNT;
    }

    /** 현재 활성 파일을 바꾸지 않고 i번 슬롯 메타만 읽기 (허브 UI용) */
    function peekMetaAtFileIndex(i) {
        migrateLegacyMetaToFileSlots();
        if (i < 0 || i >= SAVE_SLOT_COUNT) return defaultMeta();
        try {
            const raw = localStorage.getItem(slotFileKey(i));
            if (!raw) return defaultMeta();
            const o = JSON.parse(raw);
            if (!o || typeof o !== 'object') return defaultMeta();
            if (!Array.isArray(o.slots)) o.slots = [];
            if (o.savedGold == null) o.savedGold = 0;
            o.slots.forEach(ensureSlotV703);
            return o;
        } catch (e) {
            return defaultMeta();
        }
    }

    /** 구 v6 영구 강화 → 첫 슬롯으로 1회 이관 */
    function migrateLegacyOnce() {
        if (localStorage.getItem('meta_v7_legacy_migrated')) return;
        const m = loadMeta();
        if (m.slots.length > 0) {
            localStorage.setItem('meta_v7_legacy_migrated', '1');
            return;
        }
        try {
            const ps = JSON.parse(localStorage.getItem('perma_stats') || '{}');
            const sg = parseInt(localStorage.getItem('saved_gold') || '0', 10) || 0;
            const hp = Math.max(0, Number(ps.hp) || 0);
            const atk = Math.max(0, Number(ps.atk) || 0);
            const def = Math.max(0, Number(ps.def) || 0);
            const acc = Math.max(0, Number(ps.acc) || 0);
            if (hp + atk + def + acc > 0 || sg > 0) {
                m.slots.push({
                    id: uid(),
                    name: '이전 모험가',
                    jobKey: 'Warrior',
                    techLine: null,
                    techPurchased: [],
                    legacyPerma: { hp, atk, def, acc },
                    extraPerma: { hp: 0, atk: 0, def: 0, acc: 0 },
                    campPerma: { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 },
                    level: 1,
                    exp: 0,
                    metaPenalty: { hp: 0, atk: 0, def: 0, acc: 0 },
                    questFlags: {},
                    reincarnationCount: 0,
                    rebirthStatBonus: { hp: 0, atk: 0, def: 0, acc: 0 },
                });
                m.activeSlotId = m.slots[0].id;
                m.savedGold = sg;
                saveMeta(m);
            }
        } catch (e) { /* ignore */ }
        localStorage.setItem('meta_v7_legacy_migrated', '1');
    }

    /** 테크 노드 정의 — line A/B는 생성 시 고정, 변경 불가 */
    function buildTechNodes() {
        const W = 'Warrior',
            H = 'Hunter',
            Wz = 'Wizard',
            Mc = 'MercenaryCaptain';
        const nodes = [
            // Warrior A — 화력
            { id: 'W_A_1', jobKey: W, line: 'A', name: '침투: 근력 I', cost: 60, requires: [], effect: { atk: 4 } },
            { id: 'W_A_2', jobKey: W, line: 'A', name: '침투: 근력 II', cost: 110, requires: ['W_A_1'], effect: { atk: 7 } },
            { id: 'W_A_3', jobKey: W, line: 'A', name: '침투: 치명 각성', cost: 160, requires: ['W_A_2'], effect: { atk: 5, acc: 3 } },
            // Warrior B — 생존
            { id: 'W_B_1', jobKey: W, line: 'B', name: '철벽: 체력 I', cost: 60, requires: [], effect: { hp: 45 } },
            { id: 'W_B_2', jobKey: W, line: 'B', name: '철벽: 방어', cost: 110, requires: ['W_B_1'], effect: { hp: 35, def: 3 } },
            { id: 'W_B_3', jobKey: W, line: 'B', name: '철벽: 불굴', cost: 160, requires: ['W_B_2'], effect: { def: 5, hp: 40 } },
            // Hunter A
            { id: 'H_A_1', jobKey: H, line: 'A', name: '추적: 민첩', cost: 60, requires: [], effect: { atk: 3, acc: 4 } },
            { id: 'H_A_2', jobKey: H, line: 'A', name: '추적: 약점', cost: 110, requires: ['H_A_1'], effect: { atk: 8 } },
            { id: 'H_A_3', jobKey: H, line: 'A', name: '추적: 일격', cost: 160, requires: ['H_A_2'], effect: { atk: 6, acc: 5 } },
            // Hunter B
            { id: 'H_B_1', jobKey: H, line: 'B', name: '은신: 체력', cost: 60, requires: [], effect: { hp: 40 } },
            { id: 'H_B_2', jobKey: H, line: 'B', name: '은신: 회피 명중', cost: 110, requires: ['H_B_1'], effect: { acc: 10, hp: 25 } },
            { id: 'H_B_3', jobKey: H, line: 'B', name: '은신: 흡혈 각성', cost: 160, requires: ['H_B_2'], effect: { atk: 5, hp: 30 } },
            // Wizard A
            { id: 'Z_A_1', jobKey: Wz, line: 'A', name: '마도: 파괴 I', cost: 60, requires: [], effect: { atk: 6 } },
            { id: 'Z_A_2', jobKey: Wz, line: 'A', name: '마도: 파괴 II', cost: 110, requires: ['Z_A_1'], effect: { atk: 10 } },
            { id: 'Z_A_3', jobKey: Wz, line: 'A', name: '마도: 폭풍', cost: 160, requires: ['Z_A_2'], effect: { atk: 8, acc: 4 } },
            // Wizard B
            { id: 'Z_B_1', jobKey: Wz, line: 'B', name: '결계: 체력', cost: 60, requires: [], effect: { hp: 35, def: 2 } },
            { id: 'Z_B_2', jobKey: Wz, line: 'B', name: '결계: 방벽', cost: 110, requires: ['Z_B_1'], effect: { hp: 50, def: 3 } },
            { id: 'Z_B_3', jobKey: Wz, line: 'B', name: '결계: 봉인', cost: 160, requires: ['Z_B_2'], effect: { def: 6, hp: 40 } },
            // MercenaryCaptain (지휘·생존)
            { id: 'M_A_1', jobKey: Mc, line: 'A', name: '지휘: 보급', cost: 60, requires: [], effect: { atk: 2, hp: 30 } },
            { id: 'M_A_2', jobKey: Mc, line: 'A', name: '지휘: 전술', cost: 110, requires: ['M_A_1'], effect: { atk: 4, acc: 5 } },
            { id: 'M_B_1', jobKey: Mc, line: 'B', name: '생존: 체력', cost: 60, requires: [], effect: { hp: 55 } },
            { id: 'M_B_2', jobKey: Mc, line: 'B', name: '생존: 방어', cost: 110, requires: ['M_B_1'], effect: { hp: 45, def: 4 } },
        ];
        return nodes;
    }

    const TECH_NODES = buildTechNodes();

    function getSlotById(id) {
        const m = loadMeta();
        return m.slots.find((s) => s.id === id) || null;
    }

    function getCampStatGrowthBonus(slot, key, level) {
        const lv = Math.max(0, Number(level) || 0);
        if (!slot || lv <= 0) return 0;
        const job = typeof jobBase !== 'undefined' ? jobBase[slot.jobKey] : null;
        if (!job) return 0;
        const floorEquivalent = lv * ((typeof BALANCE !== 'undefined' && BALANCE.upgradeFloorEquivalent) || 1.25);
        const perFloorGrowth = (typeof BALANCE !== 'undefined' && BALANCE.enemyPostWallGrowth) || 1.065;
        const growth = Math.pow(perFloorGrowth, floorEquivalent) - 1;
        const ref = {
            hp: Math.max(1, Number(job.hp) || 1),
            atk: Math.max(1, Number(job.atk) || 1),
            def: Math.max(8, Number(job.def) || 1),
        }[key];
        return Math.floor(ref * growth);
    }

    function recalcTechBonus(slot) {
        const bought = new Set(slot.techPurchased || []);
        const techMult = 1 + Math.min(3, slot.reincarnationCount || 0) * 0.05;
        let hp = 0,
            atk = 0,
            def = 0,
            acc = 0;
        const jb = slot.jobKey;
        for (const n of TECH_NODES) {
            if (!bought.has(n.id)) continue;
            if (n.jobKey !== jb) continue;
            const e = n.effect || {};
            hp += (e.hp || 0) * techMult;
            atk += (e.atk || 0) * techMult;
            def += (e.def || 0) * techMult;
            acc += (e.acc || 0) * techMult;
        }
        const cp = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
        /** 베이스캠프 영구: 1단계 ≈ 1.25층 성장분, 4단계 ≈ 5층 돌파분 */
        hp += getCampStatGrowthBonus(slot, 'hp', cp.hp || 0);
        atk += getCampStatGrowthBonus(slot, 'atk', cp.atk || 0);
        def += getCampStatGrowthBonus(slot, 'def', cp.def || 0);
        const critFromCamp = (cp.crit || 0) * 1.0;
        const cmFromCamp = (cp.cm || 0) * 0.1;
        const leg = slot.legacyPerma || { hp: 0, atk: 0, def: 0, acc: 0 };
        const ex = slot.extraPerma || { hp: 0, atk: 0, def: 0, acc: 0 };
        const pen = slot.metaPenalty || { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.techBonus = {
            hp: Math.max(0, hp + (leg.hp || 0) + (ex.hp || 0) - (pen.hp || 0)),
            atk: Math.max(0, atk + (leg.atk || 0) + (ex.atk || 0) - (pen.atk || 0)),
            def: Math.max(0, def + (leg.def || 0) + (ex.def || 0) - (pen.def || 0)),
            acc: Math.max(0, acc + (leg.acc || 0) + (ex.acc || 0) - (pen.acc || 0)),
            crit: critFromCamp,
            critMult: cmFromCamp,
        };
    }

    function getTechNodesForSlot(slot) {
        if (!slot || !slot.jobKey) return [];
        return TECH_NODES.filter((n) => n.jobKey === slot.jobKey);
    }

    function canPurchaseNode(slot, nodeId) {
        const n = TECH_NODES.find((x) => x.id === nodeId);
        if (!n || n.jobKey !== slot.jobKey) return false;
        if ((slot.techPurchased || []).includes(nodeId)) return false;
        const bought = new Set(slot.techPurchased || []);
        for (const r of n.requires || []) {
            if (!bought.has(r)) return false;
        }
        return true;
    }

    function purchaseTechNode(slotId, nodeId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return { ok: false, msg: '슬롯 없음' };
        if (!canPurchaseNode(slot, nodeId)) return { ok: false, msg: '구매 불가(선행 또는 라인 불일치)' };
        const n = TECH_NODES.find((x) => x.id === nodeId);
        const cost = n.cost || 0;
        if (m.savedGold < cost) return { ok: false, msg: '보존 골드 부족' };
        m.savedGold -= cost;
        slot.techPurchased = slot.techPurchased || [];
        slot.techPurchased.push(nodeId);
        recalcTechBonus(slot);
        saveMeta(m);
        return { ok: true, msg: n.name };
    }

    function expToNextLevel(lv) {
        return Math.floor(32 + lv * 18 + lv * lv * 0.35);
    }

    function addExpToSlot(slotId, amount) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return null;
        slot.level = Math.max(1, slot.level || 1);
        slot.exp = Math.max(0, (slot.exp || 0) + amount);
        let need = expToNextLevel(slot.level);
        while (slot.exp >= need) {
            slot.exp -= need;
            slot.level += 1;
            need = expToNextLevel(slot.level);
        }
        saveMeta(m);
        return { level: slot.level, exp: slot.exp, need };
    }

    /** 레벨에 따른 런타임 보너스 (소량) */
    function getLevelRuntimeBonus(level) {
        const lv = Math.max(1, level || 1);
        return {
            hp: Math.floor((lv - 1) * 4),
            atk: Math.floor((lv - 1) * 0.6),
            def: Math.floor((lv - 1) * 0.35),
            acc: Math.floor((lv - 1) * 0.25),
        };
    }

    function hasJobSlot(jobKey) {
        const m = loadMeta();
        return m.slots.some((s) => s.jobKey === jobKey);
    }

    function getRebirthGoldCost(slot) {
        const c = slot.reincarnationCount || 0;
        if (c >= 3) return Infinity;
        return 6000 + c * 10000;
    }

    function getRebirthMinFloor() {
        return 500;
    }

    function updateBestFloor(slotId, floor) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return 1;
        const f = Math.max(1, Math.floor(Number(floor) || 1));
        slot.bestFloor = Math.max(1, slot.bestFloor || 1, f);
        saveMeta(m);
        return slot.bestFloor;
    }

    /** 환생: 런 아이템·영구강화(캠프) 초기화, 환생 보너스 누적, 최대 3회 */
    function applyReincarnation(slotId, options) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return { ok: false, msg: '슬롯 없음' };
        const cur = slot.reincarnationCount || 0;
        if (cur >= 3) return { ok: false, msg: '환생은 최대 3회까지입니다.' };
        const needFloor = getRebirthMinFloor();
        const bestFloor = Math.max(1, slot.bestFloor || 1);
        if (bestFloor < needFloor) return { ok: false, msg: '환생 조건 미달 (최고 ' + bestFloor + '층, 필요 ' + needFloor + '층)' };
        const cost = getRebirthGoldCost(slot);
        if (options && options.payGold && m.savedGold < cost) return { ok: false, msg: '보존 골드 부족 (' + cost + 'G 필요)' };
        if (options && options.payGold) m.savedGold = Math.max(0, m.savedGold - cost);
        slot.reincarnationCount = cur + 1;
        /** 환생 후 이전 런 스냅샷·체크포인트 제거 (저장 런 잔존 버그 방지) */
        slot.runSnapshot = null;
        slot.runCheckpointMeta = { level: 1, exp: 0 };
        slot.level = 1;
        slot.exp = 0;
        /** 영구 연구(테크)도 환생 시 초기화 */
        slot.techLine = null;
        slot.techPurchased = [];
        slot.campPerma = { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
        slot.legacyPerma = { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.extraPerma = { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.metaPenalty = { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.questFlags = {};
        slot.floorGrowth = normalizeSlotFloorGrowth(null);
        slot.playerState = normalizeSlotPlayerState(null);
        slot.tacticalSkills = [];
        slot.tacticalSkillMilestonesClaimed = [];
        slot.rescuedItems = [];
        slot.rebirthStatBonus = slot.rebirthStatBonus || { hp: 0, atk: 0, def: 0, acc: 0 };
        slot.rebirthPctBonus = slot.rebirthPctBonus || { atkPct: 0, defPct: 0, critMultPct: 0 };
        slot.rebirthPctBonus.atkPct += 10;
        slot.rebirthPctBonus.defPct += 10;
        slot.rebirthPctBonus.critMultPct += 10;
        recalcTechBonus(slot);
        saveMeta(m);
        return { ok: true, cost };
    }

    function createCharacter(name, jobKey, options) {
        const m = loadMeta();
        if (m.slots.length >= MAX_SLOTS) return { ok: false, msg: '슬롯 가득 (최대 ' + MAX_SLOTS + ')' };
        const opt = options && typeof options === 'object' ? options : {};
        const raceKey =
            opt.raceKey && typeof raceStories !== 'undefined' && raceStories[opt.raceKey] ? opt.raceKey : null;
        const memoryKey =
            opt.memoryKey && typeof introMemoryChoices !== 'undefined' && introMemoryChoices[opt.memoryKey]
                ? opt.memoryKey
                : null;
        const originBaseJobKey =
            opt.originBaseJobKey && typeof jobBase !== 'undefined' && jobBase[opt.originBaseJobKey]
                ? opt.originBaseJobKey
                : memoryKey && typeof introMemoryChoices !== 'undefined'
                  ? introMemoryChoices[memoryKey].baseJobKey
                  : jobKey;
        const weaponKey =
            opt.weaponKey && typeof introWeaponChoices !== 'undefined' && introWeaponChoices[opt.weaponKey]
                ? opt.weaponKey
                : null;
        const classKey =
            opt.classKey && typeof classStories !== 'undefined' && classStories[opt.classKey]
                ? opt.classKey
                : weaponKey && typeof introWeaponChoices !== 'undefined'
                  ? introWeaponChoices[weaponKey].classKey
                  : jobKey;
        const slot = {
            id: uid(),
            name: name || '무명',
            jobKey,
            raceKey,
            memoryKey,
            originBaseJobKey,
            introWeaponKey: weaponKey,
            classKey,
            currentPromotion: null,
            promotionHistory: [],
            playerState: normalizeSlotPlayerState(opt.playerState),
            storyFlags: {},
            storyLog: [],
            techLine: null,
            techPurchased: [],
            legacyPerma: { hp: 0, atk: 0, def: 0, acc: 0 },
            extraPerma: { hp: 0, atk: 0, def: 0, acc: 0 },
            campPerma: { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 },
            level: 1,
            exp: 0,
            metaPenalty: { hp: 0, atk: 0, def: 0, acc: 0 },
            questFlags: {},
            reincarnationCount: 0,
            rebirthStatBonus: { hp: 0, atk: 0, def: 0, acc: 0 },
            rebirthPctBonus: { atkPct: 0, defPct: 0, critMultPct: 0 },
            bestFloor: 1,
            floorGrowth: normalizeSlotFloorGrowth(null),
            tacticalSkills: [],
            tacticalSkillMilestonesClaimed: [],
            rescuedItems: [],
        };
        recalcTechBonus(slot);
        m.slots.push(slot);
        m.activeSlotId = slot.id;
        saveMeta(m);
        return { ok: true, slot };
    }

    function applyQuestPenalty(slotId, penalty) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.metaPenalty = slot.metaPenalty || { hp: 0, atk: 0, def: 0, acc: 0 };
        const p = penalty || {};
        if (p.hp) slot.metaPenalty.hp += p.hp;
        if (p.atk) slot.metaPenalty.atk += p.atk;
        if (p.def) slot.metaPenalty.def += p.def;
        if (p.acc) slot.metaPenalty.acc += p.acc;
        if (p.goldLoss && m.savedGold > 0) {
            m.savedGold = Math.max(0, Math.floor(m.savedGold * (1 - p.goldLoss)));
        }
        recalcTechBonus(slot);
        saveMeta(m);
    }

    function grantQuestReward(slotId, reward, questId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot || !reward) return;
        if (reward.perma) {
            slot.extraPerma = slot.extraPerma || { hp: 0, atk: 0, def: 0, acc: 0 };
            if (reward.perma.hp) slot.extraPerma.hp += reward.perma.hp;
            if (reward.perma.atk) slot.extraPerma.atk += reward.perma.atk;
            if (reward.perma.def) slot.extraPerma.def += reward.perma.def;
            if (reward.perma.acc) slot.extraPerma.acc += reward.perma.acc;
        }
        if (questId) {
            slot.questFlags = slot.questFlags || {};
            slot.questFlags[questId] = true;
        }
        recalcTechBonus(slot);
        saveMeta(m);
    }

    /** 장착 아이템 시너지 — data.js synergyRules(등급 조합) + 아이템 tags */
    function computeSynergyBonuses(player) {
        const out = { atk: 0, hp: 0, def: 0, acc: 0, crit: 0, critMult: 0, desc: [], progress: [] };
        if (!player || !player.items) return out;
        const tags = new Set();
        const tagCounts = {};
        for (const it of player.items) {
            if (!it) continue;
            const tg = it.tags || it.tagList;
            if (Array.isArray(tg)) {
                tg.forEach((t) => {
                    tags.add(t);
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                });
            }
            // 기본 태그 자동 부여(등급/타입 기반)
            if (it.rarity) {
                const rt = 'rarity_' + String(it.rarity);
                tags.add(rt);
                tagCounts[rt] = (tagCounts[rt] || 0) + 1;
            }
            if (it.type) {
                const tt = 'type_' + String(it.type);
                tags.add(tt);
                tagCounts[tt] = (tagCounts[tt] || 0) + 1;
            }
        }
        const rules = typeof synergyRules !== 'undefined' ? synergyRules : [];
        for (const rule of rules) {
            if (!rule) continue;
            let cur = 0,
                need = 0,
                ok = false;
            if (rule.fromTag && rule.needCount) {
                cur = tagCounts[rule.fromTag] || 0;
                need = rule.needCount;
                ok = cur >= need;
            } else if (rule.needTags) {
                const req = Array.isArray(rule.needTags) ? rule.needTags : [];
                need = req.length;
                cur = req.filter((t) => tags.has(t)).length;
                ok = need > 0 && cur >= need;
            } else {
                continue;
            }
            out.progress.push({
                id: rule.id || '',
                name: rule.name || '시너지',
                cur,
                need,
                active: ok,
                effectDesc: rule.effectDesc || '',
                detailDesc: rule.detailDesc || '',
                bonus: rule.bonus || {},
            });
            if (!ok) continue;
            const b = rule.bonus || {};
            out.atk += b.atk || 0;
            out.hp += b.hp || 0;
            out.def += b.def || 0;
            out.acc += b.acc || 0;
            out.crit += b.crit || 0;
            out.critMult += b.critMult || 0;
            if (rule.name) out.desc.push(rule.name);
        }
        return out;
    }

    /** 층별 리스크 퀘스트 정의 */
    const FLOOR_QUESTS = {
        12: {
            id: 'q12',
            title: '심연의 시험',
            desc: '이 층에서 <b>연속 2전 승리</b> 없이 패배하면 패널티.',
            needWins: 2,
            reward: { perma: { atk: 3, hp: 20 } },
            failPenalty: { atk: 2, hp: 15, goldLoss: 0.15 },
        },
        20: {
            id: 'q20',
            title: '보스 토벌',
            desc: '<b>20층 보스</b>를 처치하면 보상. 층 이탈 시 실패.',
            needBoss: 1,
            reward: { perma: { def: 4, atk: 4 } },
            failPenalty: { def: 3, atk: 3, goldLoss: 0.2 },
        },
    };

    function isBaseCampFloor(f) {
        return typeof f === 'number' && f >= 30;
    }

    function markRunCheckpoint(slotId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.runCheckpointMeta = { level: Math.max(1, slot.level || 1), exp: Math.max(0, slot.exp || 0) };
        saveMeta(m);
    }

    function revertRunToCheckpoint(slotId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot || !slot.runCheckpointMeta) return;
        const c = slot.runCheckpointMeta;
        slot.level = Math.max(1, c.level || 1);
        slot.exp = Math.max(0, c.exp || 0);
        saveMeta(m);
    }

    function syncRunProgress(slotId, progress) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return null;
        const p = progress && typeof progress === 'object' ? progress : {};
        if (p.floorGrowth) slot.floorGrowth = normalizeSlotFloorGrowth(p.floorGrowth);
        if (p.playerState) slot.playerState = normalizeSlotPlayerState(p.playerState);
        if (Array.isArray(p.tacticalSkills)) slot.tacticalSkills = uniqueStringArray(p.tacticalSkills);
        if (Array.isArray(p.tacticalSkillMilestonesClaimed)) {
            slot.tacticalSkillMilestonesClaimed = uniqueNumberArray(p.tacticalSkillMilestonesClaimed);
        }
        if (p.currentPromotion) {
            slot.currentPromotion = String(p.currentPromotion);
            slot.promotionHistory = uniqueStringArray([...(slot.promotionHistory || []), slot.currentPromotion]);
        }
        saveMeta(m);
        return slot;
    }

    function grantTacticalSkillToSlot(slotId, skillKey, milestoneFloor) {
        const key = String(skillKey || '').trim();
        if (!key) return { ok: false, msg: '스킬 없음' };
        if (typeof getTacticalSkillDef === 'function' && !getTacticalSkillDef(key)) {
            return { ok: false, msg: '정의되지 않은 스킬' };
        }
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return { ok: false, msg: '슬롯 없음' };
        slot.tacticalSkills = uniqueStringArray([...(slot.tacticalSkills || []), key]);
        const mf = Math.floor(Number(milestoneFloor) || 0);
        if (mf > 0) {
            slot.tacticalSkillMilestonesClaimed = uniqueNumberArray([...(slot.tacticalSkillMilestonesClaimed || []), mf]);
        }
        saveMeta(m);
        return { ok: true, skillKey: key, skills: slot.tacticalSkills };
    }

    function setRunSnapshot(slotId, obj) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        if (obj && obj.player) {
            const p = obj.player;
            if (p.floorGrowth) slot.floorGrowth = normalizeSlotFloorGrowth(p.floorGrowth);
            if (p.playerState) slot.playerState = normalizeSlotPlayerState(p.playerState);
            if (Array.isArray(p.tacticalSkills)) slot.tacticalSkills = uniqueStringArray(p.tacticalSkills);
            if (Array.isArray(p.tacticalSkillMilestonesClaimed)) {
                slot.tacticalSkillMilestonesClaimed = uniqueNumberArray(p.tacticalSkillMilestonesClaimed);
            }
            if (p.currentPromotion) {
                slot.currentPromotion = String(p.currentPromotion);
                slot.promotionHistory = uniqueStringArray([...(slot.promotionHistory || []), slot.currentPromotion]);
            }
        }
        slot.runSnapshot = obj;
        saveMeta(m);
    }

    function clearRunSnapshot(slotId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.runSnapshot = null;
        saveMeta(m);
    }

    function preserveRescueInventory(slotId, items) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return 0;
        slot.rescuedItems = normalizeRescuedItems(items);
        slot.runSnapshot = null;
        slot.runCheckpointMeta = { level: Math.max(1, slot.level || 1), exp: Math.max(0, slot.exp || 0) };
        saveMeta(m);
        return slot.rescuedItems.length;
    }

    function getRescuedItems(slotId) {
        const slot = getSlotById(slotId);
        return slot ? normalizeRescuedItems(slot.rescuedItems) : [];
    }

    /** 저장 런 스냅샷 제거 + 런 체크포인트·메타 레벨·EXP 초기화 (저장 삭제 확정 시) */
    function wipeSavedRunAndResetMetaLevel(slotId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return;
        slot.runSnapshot = null;
        slot.runCheckpointMeta = { level: 1, exp: 0 };
        slot.level = 1;
        slot.exp = 0;
        slot.floorGrowth = normalizeSlotFloorGrowth(null);
        slot.tacticalSkills = [];
        slot.tacticalSkillMilestonesClaimed = [];
        slot.rescuedItems = [];
        recalcTechBonus(slot);
        saveMeta(m);
    }

    function getRunSnapshot(slotId) {
        const slot = getSlotById(slotId);
        return slot && slot.runSnapshot ? slot.runSnapshot : null;
    }

    /** 보존 골드 없이 테크만 구매 처리 (런 골드는 game.js에서 차감) */
    function commitTechPurchase(slotId, nodeId) {
        const m = loadMeta();
        const slot = m.slots.find((s) => s.id === slotId);
        if (!slot) return { ok: false, msg: '슬롯 없음' };
        if (!canPurchaseNode(slot, nodeId)) return { ok: false, msg: '구매 불가(선행 또는 라인 불일치)' };
        const n = TECH_NODES.find((x) => x.id === nodeId);
        if (!n) return { ok: false, msg: '노드 없음' };
        slot.techPurchased = slot.techPurchased || [];
        slot.techPurchased.push(nodeId);
        recalcTechBonus(slot);
        saveMeta(m);
        return { ok: true, msg: n.name, cost: n.cost || 0 };
    }

    function getTechNodeById(nodeId) {
        return TECH_NODES.find((x) => x.id === nodeId) || null;
    }

    const MetaRPG = {
        STORAGE_KEY,
        SAVE_SLOT_COUNT,
        LEGACY_META_KEY,
        slotFileKey,
        getActiveFileIndex,
        setActiveSaveFileIndex,
        clearSaveFile,
        getSaveFileSlotCount,
        peekMetaAtFileIndex,
        MAX_SLOTS,
        BASE_CAMP_FLOORS,
        TECH_NODES,
        FLOOR_QUESTS,
        loadMeta,
        saveMeta,
        migrateLegacyOnce,
        getSlotById,
        recalcTechBonus,
        getCampStatGrowthBonus,
        getTechNodesForSlot,
        canPurchaseNode,
        purchaseTechNode,
        expToNextLevel,
        addExpToSlot,
        getLevelRuntimeBonus,
        createCharacter,
        applyQuestPenalty,
        grantQuestReward,
        computeSynergyBonuses,
        isBaseCampFloor,
        expToNextLevel,
        hasJobSlot,
        getRebirthGoldCost,
        getRebirthMinFloor,
        updateBestFloor,
        applyReincarnation,
        markRunCheckpoint,
        revertRunToCheckpoint,
        syncRunProgress,
        grantTacticalSkillToSlot,
        setRunSnapshot,
        clearRunSnapshot,
        preserveRescueInventory,
        getRescuedItems,
        wipeSavedRunAndResetMetaLevel,
        getRunSnapshot,
        commitTechPurchase,
        getTechNodeById,
        setActiveSlot(id) {
            const m = loadMeta();
            if (!m.slots.some((s) => s.id === id)) return false;
            m.activeSlotId = id;
            saveMeta(m);
            return true;
        },
        deleteSlot(id) {
            const m = loadMeta();
            const i = m.slots.findIndex((s) => s.id === id);
            if (i < 0) return false;
            m.slots.splice(i, 1);
            if (m.activeSlotId === id) m.activeSlotId = m.slots[0] ? m.slots[0].id : null;
            saveMeta(m);
            return true;
        },
        addSavedGold(amount) {
            const m = loadMeta();
            m.savedGold = Math.max(0, (m.savedGold || 0) + amount);
            saveMeta(m);
            return m.savedGold;
        },
    };

    migrateLegacyOnce();
    global.MetaRPG = MetaRPG;
    global.BASE_CAMP_FLOORS = BASE_CAMP_FLOORS;
})(typeof window !== 'undefined' ? window : globalThis);

const MetaRPG = (typeof window !== 'undefined' ? window.MetaRPG : globalThis.MetaRPG);
const BASE_CAMP_FLOORS = (typeof window !== 'undefined' ? window.BASE_CAMP_FLOORS : globalThis.BASE_CAMP_FLOORS);

// ---- js/state.js ----
// Global runtime state (single source of truth)
let floor = 1, gold = 0, player = null, enemy = null;
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
const RANK_BASE_JOBS = ['워리어', '헌터', '마법사', '용병단장'];
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

// ---- js/vfx.js ----
// VFX/animation module (stage 1 split)
function getCombatTargetCard(side) {
    return document.getElementById(side === 'player' ? 'player-card' : 'enemy-card');
}

function onceAnimationEnd(el, done) {
    if (!el) {
        if (typeof done === 'function') done();
        return;
    }
    const finish = (event) => {
        if (event && event.target !== el) return;
        el.removeEventListener('animationend', finish);
        if (typeof done === 'function') done();
    };
    el.addEventListener('animationend', finish);
}

function animateClass(el, className) {
    if (!el || !className) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    onceAnimationEnd(el, () => el.classList.remove(className));
}

function ensureCombatFxLayer() {
    const ba = document.getElementById('battle-area');
    if (!ba) return null;
    let layer = document.getElementById('combat-fx-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'combat-fx-layer';
        layer.className = 'combat-fx-layer';
        ba.classList.add('combat-stage');
        ba.appendChild(layer);
    }
    return layer;
}

function getCardCenter(side) {
    const card = getCombatTargetCard(side);
    const ba = document.getElementById('battle-area');
    if (!card || !ba) return null;
    const cr = card.getBoundingClientRect();
    const br = ba.getBoundingClientRect();
    return {
        x: cr.left + cr.width / 2 - br.left,
        y: cr.top + cr.height / 2 - br.top,
    };
}

function placeFxNode(el, point) {
    el.style.left = `${point.x}px`;
    el.style.top = `${point.y}px`;
}

function spawnFxNode(className, point, opts) {
    const layer = ensureCombatFxLayer();
    if (!layer || !point) return Promise.resolve(null);
    const el = document.createElement('div');
    el.className = className;
    placeFxNode(el, point);
    if (opts && opts.vars) {
        Object.keys(opts.vars).forEach((key) => el.style.setProperty(key, opts.vars[key]));
    }
    if (opts && opts.text != null) el.textContent = opts.text;
    layer.appendChild(el);
    return new Promise((resolve) => {
        onceAnimationEnd(el, () => {
            if (el.parentNode) el.remove();
            resolve(el);
        });
    });
}

function triggerScreenShake(kind) {
    const stage = document.getElementById('battle-area') || document.querySelector('.screen');
    if (!stage) return;
    const cls = kind === 'boss' ? 'combat-shake-boss' : kind === 'heavy' ? 'combat-shake-heavy' : 'combat-shake-light';
    animateClass(stage, cls);
}

function triggerHitImpact(side) {
    const card = getCombatTargetCard(side);
    if (!card) return;
    animateClass(card, 'hit-impact');
}

function triggerHitFlash(side) {
    triggerHitImpact(side);
}

function showDmgFloat(dmg, isCrit, isPlayer) {
    const targetSide = isPlayer ? 'player' : 'enemy';
    const point = getCardCenter(targetSide);
    if (!point) return;
    const cls = ['floating-damage', isPlayer ? 'floating-damage-player' : 'floating-damage-enemy'];
    if (isCrit) cls.push('floating-damage-crit');
    triggerHitImpact(targetSide);
    const numericDmg = Number(dmg);
    const maxHp = typeof getEffectiveMaxHp === 'function' ? getEffectiveMaxHp() : 0;
    if (isCrit || (isPlayer && Number.isFinite(numericDmg) && maxHp > 0 && numericDmg >= maxHp * 0.18)) {
        triggerScreenShakeHeavy();
    }
    spawnFxNode(cls.join(' '), { x: point.x, y: point.y - 34 }, { text: `${isCrit ? 'CRIT ' : ''}${dmg}` });
}

function triggerCritEffect() {
    const s = document.querySelector('.screen');
    if (!s) return;
    animateClass(s, 'crit-flash');
    animateClass(s, 'crit-blackout');
}

function triggerShakeEffect() {
    triggerScreenShake('light');
}

function triggerScreenShakeHeavy() {
    triggerScreenShake('heavy');
}

function triggerScreenShakeBoss() {
    triggerScreenShake('boss');
}

function triggerBossDim() {
    const s = document.querySelector('.screen');
    if (!s) return;
    animateClass(s, 'boss-dimming');
}

function triggerGuardAura() {
    const c = getCombatTargetCard('player');
    if (!c) return;
    animateClass(c, 'guard-aura');
}

function triggerDodgeMove(side) {
    const c = getCombatTargetCard(side === 'enemy' ? 'enemy' : 'player');
    if (!c) return;
    animateClass(c, 'dodge-move');
}

function normalizeCombatArchetype(jobName) {
    const n = String(jobName || '');
    if (n.includes('마법사') || n.includes('위저드') || n.includes('Mage') || n.includes('성직자')) return 'mage';
    if (n.includes('헌터') || n.includes('암살자') || n.includes('궁수') || n.includes('Hunter')) return 'hunter';
    if (n.includes('버서커') || n.includes('워리어') || n.includes('나이트') || n.includes('Berserker')) return 'berserker';
    return 'berserker';
}

function playMageBoltVfx(fromSide, toSide) {
    const from = getCardCenter(fromSide);
    const to = getCardCenter(toSide);
    if (!from || !to) return Promise.resolve();
    return spawnFxNode('mage-bolt', from, {
        vars: {
            '--fx-dx': `${to.x - from.x}px`,
            '--fx-dy': `${to.y - from.y}px`,
        },
    }).then(() => spawnFxNode('mage-explosion', to));
}

function playBerserkerChargeVfx(fromSide, toSide) {
    const to = getCardCenter(toSide);
    if (!to) return Promise.resolve();
    return spawnFxNode('slash-effect', to);
}

function playHunterStrikeVfx(fromSide, toSide) {
    const from = getCardCenter(fromSide);
    const to = getCardCenter(toSide);
    if (!from || !to) return Promise.resolve();
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return spawnFxNode('hunter-shot', from, {
        vars: {
            '--fx-dx': `${dx}px`,
            '--fx-dy': `${dy}px`,
        },
    }).then(() => spawnFxNode('hunter-impact', to));
}

function playMagicBurstVfx(targetSide) {
    const to = getCardCenter(targetSide);
    if (!to) return Promise.resolve();
    return spawnFxNode('magic-burst', to);
}

function playAssassinStrikeVfx(targetSide) {
    const to = getCardCenter(targetSide);
    if (!to) return Promise.resolve();
    return spawnFxNode('assassin-strike', to);
}

function playCritGoldBurst(targetSide) {
    const to = getCardCenter(targetSide);
    if (!to) return Promise.resolve();
    return spawnFxNode('crit-gold-burst', to);
}

function playBossStrikeVfx(targetSide) {
    const to = getCardCenter(targetSide);
    if (!to) return Promise.resolve();
    triggerBossDim();
    triggerScreenShakeBoss();
    triggerHitFlash(targetSide);
    return spawnFxNode('boss-strike', to);
}

function showMissFloat(targetSide) {
    const p = getCardCenter(targetSide);
    if (!p) return;
    spawnFxNode('floating-damage floating-damage-miss', { x: p.x, y: p.y - 34 }, { text: 'MISS' });
}

function playJobAttackVfx(attackerSide, jobName) {
    const archetype = normalizeCombatArchetype(jobName);
    const targetSide = attackerSide === 'player' ? 'enemy' : 'player';
    if (archetype === 'mage') return playMageBoltVfx(attackerSide, targetSide).then(() => playMagicBurstVfx(targetSide));
    if (archetype === 'hunter') return playHunterStrikeVfx(attackerSide, targetSide);
    return playBerserkerChargeVfx(attackerSide, targetSide);
}

function consumeHunterEvasionMissPenalty() {
    if (!enemy || !String(enemy.job || '').includes('헌터')) return 0;
    const turns = safeNum(enemy._hunterEvasionTurns, 0);
    if (turns <= 0) return 0;
    enemy._hunterEvasionTurns = Math.max(0, turns - 1);
    writeLog('[헌터 AI] 회피 자세! 이번 공격은 빗나가기 쉬워졌습니다. (빗나감 확률 +50%)');
    return 50;
}

window.showDmgFloat = showDmgFloat;
window.triggerCritEffect = triggerCritEffect;
window.triggerShakeEffect = triggerShakeEffect;
window.triggerScreenShakeHeavy = triggerScreenShakeHeavy;
window.triggerScreenShakeBoss = triggerScreenShakeBoss;
window.triggerBossDim = triggerBossDim;
window.triggerGuardAura = triggerGuardAura;
window.triggerDodgeMove = triggerDodgeMove;
window.ensureCombatFxLayer = ensureCombatFxLayer;
window.getCardCenter = getCardCenter;
window.normalizeCombatArchetype = normalizeCombatArchetype;
window.playMageBoltVfx = playMageBoltVfx;
window.playBerserkerChargeVfx = playBerserkerChargeVfx;
window.playHunterStrikeVfx = playHunterStrikeVfx;
window.playMagicBurstVfx = playMagicBurstVfx;
window.playAssassinStrikeVfx = playAssassinStrikeVfx;
window.playCritGoldBurst = playCritGoldBurst;
window.playBossStrikeVfx = playBossStrikeVfx;
window.showMissFloat = showMissFloat;
window.playJobAttackVfx = playJobAttackVfx;
window.consumeHunterEvasionMissPenalty = consumeHunterEvasionMissPenalty;

// ---- js/player.js ----
// Player domain module (stage 3 split)
function ensurePlayerSynergyBonuses() {
    if (!player) return;
    if (typeof MetaRPG !== 'undefined' && MetaRPG.computeSynergyBonuses) {
        player._syn = MetaRPG.computeSynergyBonuses(player);
    } else {
        player._syn = { atk: 0, hp: 0, def: 0, acc: 0, crit: 0, critMult: 0, desc: [], progress: [] };
    }
}

function getEffectiveMaxHp() {
    if (!player) return 1;
    ensurePlayerSynergyBonuses();
    return Math.max(1, safeNum(player.maxHp, 1) + safeNum(player._syn && player._syn.hp, 0));
}

function getRawCritChance(extraCrit) {
    if (!player) return Math.max(0, safeNum(extraCrit, 0));
    ensurePlayerSynergyBonuses();
    return Math.max(
        0,
        safeNum(player.crit, 1) +
            safeNum(player._relicTempCrit, 0) +
            safeNum(player._syn && player._syn.crit, 0) +
            safeNum(extraCrit, 0)
    );
}

function getCritOverflowForMult(extraCrit) {
    return Math.max(0, getRawCritChance(extraCrit) - CRIT_SOFT_CAP);
}

function getCritOverflowMultBonus(extraCrit) {
    return getCritOverflowForMult(extraCrit) * CRIT_OVERFLOW_TO_MULT;
}

function clampCritMultiplier(value) {
    return Math.min(CRIT_MULT_HARD_CAP, Math.max(1, safeNum(value, 1.8)));
}

function getCritBaseMultBeforeOverflow(extraMult) {
    if (player) ensurePlayerSynergyBonuses();
    const base = safeNum(player && player.critMult, 1.8);
    const syn = safeNum(player && player._syn && player._syn.critMult, 0);
    return (base > 0 ? base : 1.8) + syn + safeNum(extraMult, 0);
}

function getEffectiveCritMult() {
    return clampCritMultiplier(getCritBaseMultBeforeOverflow(0) + getCritOverflowMultBonus(0));
}

function applyRebirthPctBonusToPlayer(slot) {
    if (!player || !slot) return;
    const rb = slot.rebirthPctBonus || { atkPct: 0, defPct: 0, critMultPct: 0 };
    const atkPct = Math.max(0, safeNum(rb.atkPct, 0));
    const defPct = Math.max(0, safeNum(rb.defPct, 0));
    const cmPct = Math.max(0, safeNum(rb.critMultPct, 0));
    if (atkPct > 0) player.atk = Math.ceil(player.atk * (1 + atkPct / 100));
    if (defPct > 0) player.def = Math.ceil(player.def * (1 + defPct / 100));
    if (cmPct > 0) player.critMult = safeNum((player.critMult * (1 + cmPct / 100)).toFixed(4), player.critMult);
}

function applyOwnedEquipmentItemBonuses(it) {
    if (!it || it.type === 'merc') return;
    if (it.type === 'rune') {
        if (typeof it.value === 'number' && it.value) {
            player.atk = Math.max(1, safeNum(player.atk, 1) + safeNum(it.value, 0));
        }
        if (typeof it.hpBonus === 'number' && it.hpBonus) {
            const add = safeNum(it.hpBonus, 0);
            player.maxHp = Math.max(1, safeNum(player.maxHp, 1) + add);
            player.curHp = safeNum(player.curHp, 0) + add;
        }
        if (it.def) player.extraDef = safeNum(player.extraDef, 0) + safeNum(it.def, 0);
        if (it.lifesteal) player.lifesteal = safeNum(player.lifesteal, 0) + safeNum(it.lifesteal, 0);
        if (it.critBonus) player.crit = safeNum(player.crit, 1) + safeNum(it.critBonus, 0);
        if (it.critMult) player.critMult = safeNum(player.critMult, 1.8) + safeNum(it.critMult, 0);
        if (it.damageReduction) player.damageReduction = safeNum(player.damageReduction, 0) + safeNum(it.damageReduction, 0);
        if (it.potionHealBonus) player.potionHealBonus = safeNum(player.potionHealBonus, 0) + safeNum(it.potionHealBonus, 0);
        if (it.regenPotion) player.hasRegenPotion = true;
        return;
    }
    if (it.type === 'atk' || it.type === 'ring') {
        player.atk = Math.max(1, safeNum(player.atk, 1) + safeNum(it.value, 0));
    }
    if (it.type === 'hp') {
        const add = safeNum(it.value, 0);
        player.maxHp = Math.max(1, safeNum(player.maxHp, 1) + add);
        player.curHp = safeNum(player.curHp, 0) + add;
    }
    if (it.type !== 'rune' && typeof it.hpBonus === 'number' && it.hpBonus) {
        const add = safeNum(it.hpBonus, 0);
        player.maxHp = Math.max(1, safeNum(player.maxHp, 1) + add);
        player.curHp = safeNum(player.curHp, 0) + add;
    }
    if (it.def) player.extraDef = safeNum(player.extraDef, 0) + safeNum(it.def, 0);
    if (it.lifesteal) player.lifesteal = safeNum(player.lifesteal, 0) + safeNum(it.lifesteal, 0);
    if (it.critBonus) player.crit = safeNum(player.crit, 1) + safeNum(it.critBonus, 0);
    if (it.critMult) player.critMult = safeNum(player.critMult, 1.8) + safeNum(it.critMult, 0);
    if (it.damageReduction) player.damageReduction = safeNum(player.damageReduction, 0) + safeNum(it.damageReduction, 0);
    if (it.potionHealBonus) player.potionHealBonus = safeNum(player.potionHealBonus, 0) + safeNum(it.potionHealBonus, 0);
    if (it.penalty && it.penalty[player.name]) {
        player.acc -= safeNum(it.penalty[player.name], 0);
    }
}

function fullResyncPlayerCombatStatsFromMetaAndInventory() {
    if (!player || typeof MetaRPG === 'undefined' || !player.metaSlotId) return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return;
    MetaRPG.recalcTechBonus(slot);
    const tb = slot.techBonus || { hp: 0, atk: 0, def: 0, acc: 0, crit: 0, critMult: 0 };
    const lb = MetaRPG.getLevelRuntimeBonus(slot.level || 1);
    const rs = slot.rebirthStatBonus || { hp: 0, atk: 0, def: 0, acc: 0 };
    const jk = slot.jobKey;
    const job = jobBase[jk];
    if (!job) return;

    let atk;
    let def;
    let maxHp;
    let acc;
    if (player.evolved) {
        const evols = jobEvolutions[player.baseJob];
        const evol = evols && evols.find((e) => e.name === player.name);
        if (evol) {
            atk = safeNum(evol.bonusAtk, job.atk) + safeNum(rs.atk, 0) + safeNum(tb.atk, 0) + safeNum(lb.atk, 0);
            def = safeNum(evol.bonusDef, job.def) + safeNum(rs.def, 0) + safeNum(tb.def, 0) + safeNum(lb.def, 0);
            maxHp = (evol.bonusHp != null ? evol.bonusHp : job.hp) + safeNum(rs.hp, 0) + safeNum(tb.hp, 0) + safeNum(lb.hp, 0);
            acc = (evol.bonusAcc != null ? evol.bonusAcc : 0) + safeNum(rs.acc, 0) + safeNum(tb.acc, 0) + safeNum(lb.acc, 0);
        } else {
            atk = job.atk + safeNum(rs.atk, 0) + safeNum(tb.atk, 0) + safeNum(lb.atk, 0);
            def = job.def + safeNum(rs.def, 0) + safeNum(tb.def, 0) + safeNum(lb.def, 0);
            maxHp = job.hp + safeNum(rs.hp, 0) + safeNum(tb.hp, 0) + safeNum(lb.hp, 0);
            acc = safeNum(rs.acc, 0) + safeNum(tb.acc, 0) + safeNum(lb.acc, 0);
        }
    } else {
        atk = job.atk + safeNum(rs.atk, 0) + safeNum(tb.atk, 0) + safeNum(lb.atk, 0);
        def = job.def + safeNum(rs.def, 0) + safeNum(tb.def, 0) + safeNum(lb.def, 0);
        maxHp = job.hp + safeNum(rs.hp, 0) + safeNum(tb.hp, 0) + safeNum(lb.hp, 0);
        acc = safeNum(rs.acc, 0) + safeNum(tb.acc, 0) + safeNum(lb.acc, 0);
    }

    const fg = typeof normalizeFloorGrowth === 'function'
        ? normalizeFloorGrowth(player.floorGrowth || slot.floorGrowth)
        : {
              floors: Math.max(0, Math.floor(safeNum(player.floorGrowth && player.floorGrowth.floors, 0))),
              atk: Math.max(0, Math.floor(safeNum(player.floorGrowth && player.floorGrowth.atk, 0))),
              hp: Math.max(0, Math.floor(safeNum(player.floorGrowth && player.floorGrowth.hp, 0))),
          };
    player.floorGrowth = fg;
    atk += fg.atk;
    maxHp += fg.hp;

    player.atk = atk;
    player.def = def;
    player.maxHp = maxHp;
    player.curHp = Math.min(safeNum(player.curHp, maxHp), maxHp);
    player.acc = acc;
    player.crit = 1 + safeNum(tb.crit, 0);
    player.critMult = 1.8 + safeNum(tb.critMult, 0);
    player.lifesteal = 0;
    player.extraDef = 0;
    player.extraAtk = 0;
    player.damageReduction = 0;
    player.potionHealBonus = 0;

    applyRebirthPctBonusToPlayer(slot);

    for (const it of player.items || []) {
        applyOwnedEquipmentItemBonuses(it);
    }
    player.hasRegenPotion = !!(player.items || []).some((x) => x && x.regenPotion && x.type !== 'merc');

    recalcPlayerDivineGainMult();
}

function getCritInfo() {
    const rawCrit = getRawCritChance(0);
    const isBerserkCrit = false;
    const effectiveCrit = Math.min(CRIT_SOFT_CAP, rawCrit);
    return { rawCrit, effectiveCrit, isBerserkCrit };
}

function getLifestealEffective() {
    const r = safeNum(player && player.lifesteal, 0);
    const priestBonus = player && player.priestBlessed ? DIVINE_BLESSING_LIFESTEAL_BONUS : 0;
    return Math.min(LIFESTEAL_SOFT_CAP, Math.max(0, r + priestBonus));
}

function getLifestealOverflowAtk() {
    const r = safeNum(player && player.lifesteal, 0);
    if (r <= LIFESTEAL_SOFT_CAP) return 0;
    return Math.floor((r - LIFESTEAL_SOFT_CAP) * 100);
}

function getPlayerDamageReduction() {
    return Math.min(0.55, Math.max(0, safeNum(player && player.damageReduction, 0)));
}

function getPlayerPotionHealMultiplier() {
    return 1 + Math.min(0.8, Math.max(0, safeNum(player && player.potionHealBonus, 0)));
}

function isPriestJob() {
    return player && player.name === '성직자';
}

function isPriestBlessed() {
    return !!(player && player.priestBlessed);
}

function isChosenPriest() {
    return !!(player && player.chosenPriest);
}

function formatDivinePowerForDisplay(v) {
    const x = clampDivinePower(v);
    const i = Math.floor(x);
    const frac = x - i;
    if (frac >= 0.1 && frac <= 0.4) return i;
    if (frac >= 0.5 && frac <= 0.9) return i + 1;
    if (frac > 0.4 && frac < 0.5) return Math.round(x);
    return i;
}

function clampDivinePower(v) {
    return Math.max(0, Math.min(DIVINE_POWER_MAX, safeNum(v, 0)));
}

function normalizeDivineState() {
    if (!player) return;
    if (!isPriestJob()) {
        player.divinePower = 0;
        player.divineGainMult = 1;
        player.prayerBonusFlat = 0;
        player.priestBlessed = false;
        player.chosenPriest = false;
        player.priestNextCrit = false;
        return;
    }
    player.divinePower = clampDivinePower(player.divinePower);
    const blessed = player.divinePower >= DIVINE_BLESSING_THRESHOLD;
    player.priestBlessed = blessed;
    player.chosenPriest = false;
    if (!blessed) player.priestNextCrit = false;
}

function getDivineAtkBonus() {
    if (!isPriestJob()) return 0;
    return 0;
}

function getDivineDefBonus() {
    if (!isPriestJob()) return 0;
    return isPriestBlessed() ? DIVINE_BLESSING_DEF_BONUS : 0;
}

function recalcPlayerDivineGainMult() {
    if (!player || !isPriestJob()) {
        if (player) {
            player.divineGainMult = 1;
            player.prayerBonusFlat = 0;
        }
        return;
    }
    let m = 1;
    let p = 0;
    for (const it of player.items || []) {
        if (it && it.divinityGainBonus != null) m += safeNum(it.divinityGainBonus, 0);
        if (it && it.prayerBonus != null) p += safeNum(it.prayerBonus, 0);
    }
    player.divineGainMult = m;
    player.prayerBonusFlat = Math.max(0, p);
    normalizeDivineState();
}

function addDivinePower(amount) {
    if (!isPriestJob()) return 0;
    normalizeDivineState();
    const before = clampDivinePower(player.divinePower);
    const wasBlessed = !!player.priestBlessed;
    const after = clampDivinePower(before + safeNum(amount, 0));
    player.divinePower = after;
    if (!wasBlessed && after >= DIVINE_BLESSING_THRESHOLD) {
        player.priestBlessed = true;
        player.priestNextCrit = true;
        writeLog(
            `[신성] ✨ ${DIVINE_BLESSING_THRESHOLD}스택 달성! <b>신의 가호</b> (흡혈+${Math.round(
                DIVINE_BLESSING_LIFESTEAL_BONUS * 100
            )}%, 방어+${DIVINE_BLESSING_DEF_BONUS}, 다음 공격 확정 치명)`
        );
    }
    return after - before;
}

function getEffectiveAttackPower() {
    if (!player) return 0;
    let base = safeNum(player.atk, 0) + safeNum(player.extraAtk, 0) + getLifestealOverflowAtk();
    if (player._syn && player._syn.atk) base += safeNum(player._syn.atk, 0);
    if (player._mercBattleAtkDebuff) base = Math.max(1, Math.floor(base * (1 + player._mercBattleAtkDebuff)));
    base += getDivineAtkBonus();
    return Math.max(1, base);
}

function getTotalPlayerDefenseForHit() {
    if (!player) return 0;
    let d =
        safeNum(player.def, 0) +
        safeNum(player.extraDef, 0) +
        safeNum(player._syn && player._syn.def, 0) +
        getDivineDefBonus();
    d -= safeNum(player._relicGamblerDefSub, 0);
    return Math.max(0, d);
}

window.ensurePlayerSynergyBonuses = ensurePlayerSynergyBonuses;
window.getEffectiveMaxHp = getEffectiveMaxHp;
window.getRawCritChance = getRawCritChance;
window.getCritOverflowForMult = getCritOverflowForMult;
window.getCritOverflowMultBonus = getCritOverflowMultBonus;
window.clampCritMultiplier = clampCritMultiplier;
window.getCritBaseMultBeforeOverflow = getCritBaseMultBeforeOverflow;
window.getEffectiveCritMult = getEffectiveCritMult;
window.applyRebirthPctBonusToPlayer = applyRebirthPctBonusToPlayer;
window.applyOwnedEquipmentItemBonuses = applyOwnedEquipmentItemBonuses;
window.fullResyncPlayerCombatStatsFromMetaAndInventory = fullResyncPlayerCombatStatsFromMetaAndInventory;
window.getCritInfo = getCritInfo;
window.getLifestealEffective = getLifestealEffective;
window.getLifestealOverflowAtk = getLifestealOverflowAtk;
window.getPlayerDamageReduction = getPlayerDamageReduction;
window.getPlayerPotionHealMultiplier = getPlayerPotionHealMultiplier;
window.isPriestJob = isPriestJob;
window.isPriestBlessed = isPriestBlessed;
window.isChosenPriest = isChosenPriest;
window.formatDivinePowerForDisplay = formatDivinePowerForDisplay;
window.clampDivinePower = clampDivinePower;
window.normalizeDivineState = normalizeDivineState;
window.getDivineAtkBonus = getDivineAtkBonus;
window.getDivineDefBonus = getDivineDefBonus;
window.recalcPlayerDivineGainMult = recalcPlayerDivineGainMult;
window.addDivinePower = addDivinePower;
window.getEffectiveAttackPower = getEffectiveAttackPower;
window.getTotalPlayerDefenseForHit = getTotalPlayerDefenseForHit;

function sumOwnedItemBonuses(field) {
    if (!player || !Array.isArray(player.items)) return 0;
    let s = 0;
    for (const it of player.items) {
        if (it && it.type !== 'merc' && typeof it[field] === 'number') s += safeNum(it[field], 0);
    }
    return s;
}

function getPlayerGoldGainMult() {
    return 1 + sumOwnedItemBonuses('goldGainBonus');
}

/** 패닉 도주 시 층 하락 완화 확률(합산, 상한 55%) */
function getPlayerFleeBonus() {
    return Math.min(0.55, sumOwnedItemBonuses('fleeBonus'));
}

window.getPlayerGoldGainMult = getPlayerGoldGainMult;
window.getPlayerFleeBonus = getPlayerFleeBonus;

// ---- js/enemy.js ----
// Enemy domain module (stage 3 split)
function getEnemyScalingForFloor(floorValue) {
    const f = Math.max(1, Math.floor(safeNum(floorValue, 1)));
    const wallFloor = BALANCE.enemyWallFloor || 30;
    const preFloors = Math.max(0, Math.min(f - 1, wallFloor - 1));
    const postFloors = Math.max(0, f - wallFloor);
    const pre = Math.pow(BALANCE.enemyPreWallGrowth || 1.055, preFloors);
    const post = Math.pow(BALANCE.enemyPostWallGrowth || 1.065, postFloors);
    const wall = f >= wallFloor;
    return {
        hp: pre * post * (wall ? BALANCE.enemyWallHpMult || 2.2 : 1),
        atk: pre * post * (wall ? BALANCE.enemyWallAtkMult || 2.0 : 1),
        def: Math.pow((BALANCE.enemyPreWallGrowth || 1.055) - 0.012, preFloors) *
            Math.pow((BALANCE.enemyPostWallGrowth || 1.065) - 0.007, postFloors) *
            (wall ? BALANCE.enemyWallDefMult || 2.1 : 1),
    };
}

function buildEnemyStatsForFloor(floorValue, isBoss) {
    const f = Math.max(1, Math.floor(safeNum(floorValue, 1)));
    const s = getEnemyScalingForFloor(f);
    const wave = 1 + ((f % 5) - 2) * 0.025;
    const boss = isBoss ? { hp: 2.65, atk: 1.72, def: 1.65 } : { hp: 1, atk: 1, def: 1 };
    return {
        hp: Math.max(1, Math.floor((44 + f * 4.5) * s.hp * boss.hp * wave)),
        atk: Math.max(1, Math.floor((6 + f * 0.55) * s.atk * boss.atk * wave)),
        def: Math.max(0, Math.floor((1 + f * 0.22) * s.def * boss.def)),
    };
}

function spawnEnemy() {
    setCombatProcessing(false);
    window._victoryState = null;
    window._victoryContinueFn = null;
    if (pendingShop) { pendingShop=false; return openShop(); }
    window._encounterPhaseActive = false;
    hideEncounterPhaseUI();
    defendingTurns=0; dodgingTurns=0; shieldedTurns=0;
    regenTurns=0; regenAmount=0; potionUsedThisTurn=false;
    if (player) { player.mercRegenTurns = 0; player.mercRegenAmount = 0; }

    if (player && player.mercNextBattleDebuff && typeof player.mercNextBattleDebuff.atkPct === 'number') {
        player._mercBattleAtkDebuff = player.mercNextBattleDebuff.atkPct;
    } else if (player) {
        player._mercBattleAtkDebuff = 0;
    }
    if (player) player.mercNextBattleDebuff = null;

    if (player) {
        player._relicTempCrit = 0;
        player.extraAtk = 0;
        player._relicGamblerDefSub = 0;
        player.tacticalSkillUses = {};
        player.tacticalFocusReady = false;
        player.tacticalParryReady = false;
        player.tacticalBarrierReady = false;
    }
    if (player && player.relics && player.relics.includes('gambler')) {
        const pa = safeNum(player.atk, 0);
        const totalDefBase = safeNum(player.def, 0) + safeNum(player.extraDef, 0);
        const r = Math.random();
        if (r < 1 / 3) {
            player.extraAtk = Math.floor(pa * 0.22);
            writeLog(`[유물] 🎲 도박사의 주사위: 공격력 +22% (이번 전투)`);
        } else if (r < 2 / 3) {
            player._relicTempCrit = 18;
            writeLog(`[유물] 🎲 도박사의 주사위: 치명타 확률 +18% (이번 전투)`);
        } else {
            player.extraAtk = -Math.max(1, Math.floor(pa * 0.12));
            player._relicGamblerDefSub = Math.max(4, Math.floor(totalDefBase * 0.1));
            player._relicTempCrit = -12;
            writeLog(
                `[유물] 🎲 도박사의 주사위: 불길한 눈! 공격·방어·치명 약화 (이번 전투만, 공격 약 -12%·방어 -${player._relicGamblerDefSub}·치명 -12%)`
            );
        }
    }

    if (floor%10===0) {
        const stats = buildEnemyStatsForFloor(floor, true);
        const bossHp = stats.hp;
        const bossAtk = stats.atk;
        const bossDef = stats.def;
        if (floor === 100 && typeof emitFinalBossOpeningStory === 'function') emitFinalBossOpeningStory();
        enemy={name:floor === 100 ? '👑 [최종보스] 배신한 조력자' : `👑 [보스] ${floor}층 군주`,job:'보스',hp:bossHp,curHp:bossHp,atk:bossAtk,def:bossDef,isBoss:true,turnCount:1,bossCharge:false,weakPoint:false,_aiGuardedTurns:0,_hunterEvasionTurns:0};
        writeLog(floor === 100 ? '🚨 최종전: 배신한 조력자가 본모습을 드러냈습니다!' : `🚨 경고: ${floor}층의 지배자가 나타났습니다!`);
    } else {
        const eJobs=['워리어','헌터','마법사'];
        let rj=eJobs[Math.floor(Math.random()*eJobs.length)];
        if(rj===lastEnemyJob) rj=eJobs[Math.floor(Math.random()*eJobs.length)];
        lastEnemyJob=rj;
        const stats = buildEnemyStatsForFloor(floor, false);
        let mh = stats.hp;
        let ma = stats.atk;
        let md = stats.def;
        enemy={name:`[${rj}형] ${floor}층 괴수`,job:rj,hp:Math.floor(mh),curHp:Math.floor(mh),atk:Math.floor(ma),def:Math.floor(md),isBoss:false,weakPoint:false,_aiGuardedTurns:0,_hunterEvasionTurns:0};
    }
    if (enemy && window._pendingEncounterCombatMod) {
        const mod = window._pendingEncounterCombatMod;
        if (typeof mod.enemyHpMul === 'number' && mod.enemyHpMul > 0) {
            enemy.curHp = Math.max(1, Math.floor(safeNum(enemy.curHp, 1) * mod.enemyHpMul));
        }
        window._pendingEncounterCombatMod = null;
    }
    if (isMercenaryCaptainJob() && player.mercCompanionKind && !player.fieldMerc && player.mercCooldownTurns <= 0) {
        player.fieldMerc = buildFieldMercFromTemplate();
        const ratio = player.mercReviveAt90Percent ? 0.9 : 1;
        player.fieldMerc.mercHp = Math.max(1, Math.floor(player.fieldMerc.mercMaxHp * ratio));
        const hpNote = ratio < 1 ? ' · 부상 복귀 90%' : ' · 만전';
        writeLog(
            `[용병] 동료 <b>${player.fieldMerc.sourceName}</b> 전개! 상성: <b>${player.fieldMerc.mercAffinityJob}</b>${hpNote} (${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp})`
        );
        player.mercReviveAt90Percent = false;
    }
    if (player) player._playerMissStreak = 0;
    tryActivateFloorQuest();
    player._awaitPlayerTurn = true;
    updateUi(); renderActions();
}

function tryActivateFloorQuest() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const qdef = MetaRPG.FLOOR_QUESTS[floor];
    if (!qdef) {
        player.activeQuest = null;
        return;
    }
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (slot && slot.questFlags && slot.questFlags[qdef.id]) {
        player.activeQuest = null;
        return;
    }
    player.activeQuest = { id: qdef.id, title: qdef.title };
    player._questWins = 0;
    writeLog(`[특수 퀘스트] <b>${qdef.title}</b> — ${qdef.desc}`);
}

window.spawnEnemy = spawnEnemy;
window.tryActivateFloorQuest = tryActivateFloorQuest;
window.getEnemyScalingForFloor = getEnemyScalingForFloor;
window.buildEnemyStatsForFloor = buildEnemyStatsForFloor;

// ---- js/uiManager.js ----
// UI manager module (stage 1 split)
const BASE_JOB_TITLE_NAMES = Object.freeze({
    Warrior: '워리어',
    Hunter: '헌터',
    Wizard: '마법사',
    '워리어': '워리어',
    '헌터': '헌터',
    '마법사': '마법사',
});

function getBaseJobTitleNameFromKeys() {
    for (let i = 0; i < arguments.length; i++) {
        const raw = arguments[i];
        if (!raw) continue;
        const key = String(raw);
        if (BASE_JOB_TITLE_NAMES[key]) return BASE_JOB_TITLE_NAMES[key];
        if (typeof jobBase !== 'undefined' && jobBase[key] && BASE_JOB_TITLE_NAMES[jobBase[key].name]) {
            return BASE_JOB_TITLE_NAMES[jobBase[key].name];
        }
    }
    return '모험가';
}

function getDynamicCharacterTitleForFloor(floorRef, entity) {
    const f = Math.max(1, Math.floor(safeNum(floorRef, 1)));
    if (f <= 10) return '기억을 잃은 자';
    if (f <= 30) return '과거를 더듬는 자';
    const storyTitle = typeof getStoryTitleForState === 'function'
        ? getStoryTitleForState(entity && entity.playerState, f)
        : null;
    if (storyTitle) return storyTitle;
    const baseName = getBaseJobTitleNameFromKeys(
        entity && entity.originBaseJobKey,
        entity && entity.baseJob,
        entity && entity.jobKey,
        entity && entity.classKey,
        entity && entity.name
    );
    if (f <= 50) return `기억의 파편을 쥔 ${baseName}`;
    const promotion = entity && entity.currentPromotion ? String(entity.currentPromotion) : '';
    if (promotion) return `운명을 자각한 ${promotion}`;
    return '운명을 자각한 자';
}

function getPlayerClassDisplayName() {
    if (!player) return '기억을 잃은 자';
    return getDynamicCharacterTitleForFloor(floor, player);
}

function getSlotClassDisplayName(slot) {
    if (!slot) return '기억을 잃은 자';
    const snapFloor = slot.runSnapshot && slot.runSnapshot.floor ? slot.runSnapshot.floor : null;
    const refFloor = snapFloor || slot.bestFloor || 1;
    return getDynamicCharacterTitleForFloor(refFloor, slot);
}

function hasPendingVictoryAdvance() {
    return !!(window._victoryState && window._victoryContinueFn);
}

function setEnemyVictoryMode(active) {
    const card = document.getElementById('enemy-card');
    if (!card) return;
    const panel = document.getElementById('enemy-victory-panel');
    Array.from(card.children).forEach((child) => {
        if (child === panel) return;
        child.style.display = active ? 'none' : '';
    });
    if (panel) panel.style.display = active ? 'block' : 'none';
    card.classList.toggle('enemy-card-victory', !!active);
}

function renderEnemyVictoryPanel() {
    const state = window._victoryState || {};
    const panel = document.getElementById('enemy-victory-panel');
    if (!panel) return;
    setEnemyVictoryMode(true);
    const goldGain = Math.max(0, Math.floor(safeNum(state.goldGain, 0)));
    const expGain = Math.max(0, Math.floor(safeNum(state.expGain, 0)));
    const rewardRows = [
        `<span class="victory-reward-gold">💰 +${goldGain}G 획득</span>`,
        expGain > 0 ? `<span>✦ EXP +${expGain}</span>` : '',
        state.defeatedBoss ? '<span>👑 보스 격파 보상 반영</span>' : '',
    ].filter(Boolean).join('');
    panel.innerHTML = `
        <div class="victory-title">VICTORY</div>
        <div class="victory-subtitle">승리!</div>
        <div class="victory-reward-line">${rewardRows}</div>
        <div class="victory-reward-note">전리품 정산 완료</div>`;
}

function renderVictoryActionButton(div) {
    div.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'next-floor-btn';
    btn.innerText = '➔ 다음 층으로 올라가기';
    btn.onclick = () => continuePendingVictoryAdvance(btn);
    div.appendChild(btn);
}

function showVictoryRewardAndAwaitContinue(payload, continueFn) {
    const p = payload && typeof payload === 'object' ? payload : {};
    window._victoryState = {
        clearedFloor: Math.max(1, Math.floor(safeNum(p.clearedFloor, floor))),
        goldGain: Math.max(0, Math.floor(safeNum(p.goldGain, 0))),
        expGain: Math.max(0, Math.floor(safeNum(p.expGain, 0))),
        defeatedBoss: !!p.defeatedBoss,
        continuing: false,
    };
    window._victoryContinueFn = typeof continueFn === 'function' ? continueFn : null;
    renderEnemyVictoryPanel();
    updatePrologueBattleControls();
    updateUi();
    renderActions();
}

function continuePendingVictoryAdvance(btn) {
    if (!hasPendingVictoryAdvance()) return;
    const state = window._victoryState;
    if (state.continuing) return;
    state.continuing = true;
    if (btn) {
        btn.disabled = true;
        btn.classList.add('next-floor-btn--loading');
        btn.innerText = '등반 중...';
    }
    const battle = document.getElementById('battle-area');
    if (battle) battle.classList.add('battle-climb-fade');
    const continueFn = window._victoryContinueFn;
    setTimeout(() => {
        window._victoryState = null;
        window._victoryContinueFn = null;
        setEnemyVictoryMode(false);
        updatePrologueBattleControls();
        if (typeof continueFn === 'function') continueFn();
        setTimeout(() => {
            if (battle) battle.classList.remove('battle-climb-fade');
        }, 320);
    }, 260);
}

function renderActions() {
    const div = document.getElementById('action-btns');
    if (!div) return;
    if (hasPendingVictoryAdvance()) {
        renderVictoryActionButton(div);
        return;
    }
    if (!enemy || window._encounterPhaseActive) {
        div.innerHTML = '';
        return;
    }
    if (safeNum(enemy.curHp, 0) <= 0) {
        div.innerHTML = '';
        return;
    }
    div.innerHTML = '';
    const atkBtn = document.createElement('button');
    atkBtn.id = 'btn-attack';
    atkBtn.innerText='⚔️ 공격'; atkBtn.style.background=player.color;
    const gcdLeft = attackGcdUntil - Date.now();
    if (gcdLeft > 0) {
        atkBtn.disabled = true;
        atkBtn.style.opacity = '0.45';
        atkBtn.style.cursor = 'not-allowed';
        atkBtn.title = `쿨다운 ${Math.ceil(gcdLeft/100)/10}초`;
    }
    atkBtn.onclick=()=>useAction('공격'); div.appendChild(atkBtn);

    const defBtn = document.createElement('button');
    defBtn.style.background='#888';
    const jn = player.name;
    if(['워리어','나이트','버서커'].includes(jn)){defBtn.innerText='🛡️ 방어 (70%)';defBtn.onclick=()=>useAction('방패방어');}
    else if(player.baseJob === '용병단장'){defBtn.innerText='💨 회피 (75%)';defBtn.onclick=()=>useAction('회피');}
    else if(['헌터','궁수','암살자'].includes(jn)){defBtn.innerText='💨 회피 (75%)';defBtn.onclick=()=>useAction('회피');}
    else if(['마법사','위저드','소환사','성직자'].includes(jn)){defBtn.innerText='✨ 방어막 (60%)';defBtn.onclick=()=>useAction('방어막');}
    div.appendChild(defBtn);

    if (player.name === '성직자') {
        const prayBtn = document.createElement('button');
        const divinePower = clampDivinePower(player.divinePower);
        const divineAtCap = divinePower >= DIVINE_POWER_MAX;
        prayBtn.style.background = '#9b59b6';
        prayBtn.style.color = '#fff';
        prayBtn.innerText = divineAtCap ? `🙏 신성력 최대 (${DIVINE_POWER_MAX})` : '🙏 기도 (+신성력)';
        prayBtn.disabled = divineAtCap;
        if (divineAtCap) {
            prayBtn.style.opacity = '0.5';
            prayBtn.style.cursor = 'not-allowed';
        }
        prayBtn.onclick = () => useAction('기도');
        div.appendChild(prayBtn);
    }

    const tacticalKeys = uniqueTacticalSkillKeys(player.tacticalSkills);
    tacticalKeys.forEach((key) => {
        const def = typeof getTacticalSkillDef === 'function' ? getTacticalSkillDef(key) : null;
        if (!def) return;
        const used = !!(player.tacticalSkillUses && player.tacticalSkillUses[key]);
        const alreadyReady =
            (key === 'focus' && player.tacticalFocusReady) ||
            (key === 'parry' && player.tacticalParryReady) ||
            (key === 'barrier' && player.tacticalBarrierReady);
        const tBtn = document.createElement('button');
        tBtn.className = 'tactical-action-btn';
        tBtn.style.background = def.type === 'attack' ? '#7c3aed' : '#0f766e';
        tBtn.style.color = '#fff';
        tBtn.innerText = `${def.icon || '✦'} ${def.name}`;
        tBtn.title = def.shortDesc || def.name;
        tBtn.disabled = used || alreadyReady;
        if (tBtn.disabled) {
            tBtn.style.opacity = '0.5';
            tBtn.style.cursor = 'not-allowed';
        }
        tBtn.onclick = () => useAction(`전술:${key}`);
        div.appendChild(tBtn);
    });

    if (isMercenaryCaptainJob() && player.mercCooldownTurns > 0 && (!player.fieldMerc || player.fieldMerc.mercHp <= 0)) {
        const cost = getMercGoldSkipCost();
        if (gold >= cost) {
            const gBtn = document.createElement('button');
            gBtn.style.background = '#f1c40f';
            gBtn.style.color = '#111';
            gBtn.innerText = `🪙 긴급 재가동 (${cost}G)`;
            gBtn.onclick = () => mercGoldSkipCooldown();
            div.appendChild(gBtn);
        }
    }

    if (player.unlockedSkill && floor >= 20) {
        const ultBtn = document.createElement('button');
        const isReady = player.ultStack >= player.ultMaxStack;
        ultBtn.style.background = isReady ? '#9b59b6' : '#333';
        ultBtn.style.color = isReady ? '#fff' : '#666';
        ultBtn.style.border = `2px solid ${isReady ? '#9b59b6' : '#555'}`;
        ultBtn.innerHTML = `🔥 ${player.unlockedSkill} <span style="font-size:0.8em;">[${player.ultStack}/${player.ultMaxStack}]</span>`;
        ultBtn.disabled = !isReady;
        ultBtn.onclick = () => useAction('궁극기');
        div.appendChild(ultBtn);
    }

    const pBtn = document.createElement('button');
    pBtn.innerText=`🧪 포션 (${player.potions})`; pBtn.className='potion-btn';
    pBtn.onclick=usePotion; div.appendChild(pBtn);

    if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
        const gc = document.createElement('button');
        gc.style.background = '#16a085';
        gc.style.color = '#fff';
        gc.innerText = `💰 용병 지원 (${getMercGachaCost()}G)`;
        gc.onclick = () => mercenaryFundGacha();
        div.appendChild(gc);
    }
    updateCombatButtonsLockState();
}

function renderPassiveContractHistoryPanels() {
    const targets = [
        { sidebarId: 'sidebar-normal', panelId: 'passive-history-normal' },
    ];
    const rows = (player && Array.isArray(player.passiveContractHistory) ? player.passiveContractHistory : [])
        .slice(0, 12)
        .map((x) => `<div style="padding:5px 6px;border-bottom:1px solid #2a2a2a;color:#aab7c9;font-size:0.76em;line-height:1.4;">${escapeHtml(x)}</div>`)
        .join('');
    const body = rows || '<div style="color:#666;font-size:0.76em;padding:6px;line-height:1.4;">아직 각인 기록이 없습니다.</div>';
    for (const t of targets) {
        const sb = document.getElementById(t.sidebarId);
        if (!sb) continue;
        let panel = document.getElementById(t.panelId);
        if (!panel) {
            panel = document.createElement('div');
            panel.id = t.panelId;
            panel.style.cssText = 'width:100%;margin-top:10px;padding-top:8px;border-top:1px solid #2b2b2b;';
            sb.appendChild(panel);
        }
        panel.innerHTML = `<h4 style="color:#d980fa;margin:0 0 6px 0;font-size:0.86em;">🩸 영구 각인 기록</h4><div style="max-height:190px;overflow-y:auto;background:#111;border:1px solid #27253a;border-radius:8px;">${body}</div>`;
    }
}

function updateUi() {
    if (!player) return;
    if (!enemy) {
        const shopEl = document.getElementById('shop-area');
        if (shopEl && shopEl.style.display === 'block') {
            const pMax = getEffectiveMaxHp();
            const pCur = Math.max(0, safeNum(player.curHp, 0));
            const g = safeNum(gold, 0);
            const pots = Math.max(0, safeNum(player.potions, 0));
            const sh = document.getElementById('shop-hp-t'),
                sgt = document.getElementById('shop-gold-t');
            if (sh) sh.innerText = `${pCur}/${pMax}`;
            if (sgt) sgt.innerText = String(g);
            ['floor-t', 'gold-t', 'potion-t'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            ['floor-t-battle', 'gold-t-battle', 'potion-t-battle'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            renderInventoryPanel();
            renderPassiveContractHistoryPanels();
        } else if (window._encounterPhaseActive) {
            const g = safeNum(gold, 0);
            const pots = Math.max(0, safeNum(player.potions, 0));
            ['floor-t-battle', 'gold-t-battle', 'potion-t-battle'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            ['floor-t', 'gold-t', 'potion-t'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = [floor, g, pots][i];
            });
            renderInventoryPanel();
            renderPassiveContractHistoryPanels();
        }
        return;
    }
    const pMax = getEffectiveMaxHp();
    const pCur = Math.max(0, safeNum(player.curHp, 0));
    const eHp = Math.max(1, safeNum(enemy.hp, 1));
    const eCur = Math.max(0, safeNum(enemy.curHp, 0));
    const g = safeNum(gold, 0);
    const pots = Math.max(0, safeNum(player.potions, 0));
    const mercUi = isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0;
    const fm = player.fieldMerc;
    const summLine = document.getElementById('p-summon-line');
    const critMultEl = document.getElementById('p-crit-mult-val');
    if (mercUi) {
        const mMax = Math.max(1, safeNum(fm.mercMaxHp, 1));
        const mCur = Math.max(0, safeNum(fm.mercHp, 0));
        document.getElementById('p-name').innerHTML = `<span style="color:#2ed573;">🛡️ 전열</span> ${fm.sourceName}`;
        document.getElementById('p-hp').style.width = `${Math.max(0, (mCur / mMax) * 100)}%`;
        document.getElementById('p-hp-t').innerText = `어그로 ${mCur} / ${mMax}`;
        if (summLine) {
            summLine.innerHTML = `<span style="color:#e67e22;">🎖️ 후열 · 지휘</span> <b>${escapeHtml(getPlayerClassDisplayName())}</b> <span style="color:#888;">| HP ${pCur}/${pMax} · 악성 ${Math.round(getMercGachaBadChance() * 100)}% · 지원 ${getMercGachaCost()}G</span>`;
        }
        document.getElementById('p-atk-val').textContent = String(getMercEffectiveAttackPower());
        document.getElementById('p-def-val').textContent = String(safeNum(fm.mercBonusDef, 0));
        document.getElementById('p-crit-val').textContent = `${Math.round(getMercEffectiveCritForMercAttack())}%`;
        const ecmM = getMercEffectiveCritMultForMercAttack();
        if (critMultEl) critMultEl.textContent = `${(Number.isFinite(ecmM) ? ecmM : 1.8).toFixed(2)}x`;
        const lsMain = document.getElementById('p-lifesteal-val');
        const lsNote = document.getElementById('p-lifesteal-note');
        if (lsMain) lsMain.textContent = `${Math.round(safeNum(fm.mercBonusLifesteal, 0) * 100)}%`;
        if (lsNote) lsNote.textContent = '용병 장비 흡혈 (전열)';
    } else {
        document.getElementById('p-name').innerText = getPlayerClassDisplayName();
        document.getElementById('p-hp').style.width = `${Math.max(0, (pCur / pMax) * 100)}%`;
        document.getElementById('p-hp-t').innerText = `${pCur} / ${pMax}`;
        if (summLine) {
            const synHint = player._syn && player._syn.desc && player._syn.desc.length ? ` · <span style="color:#f1c40f;">시너지: ${player._syn.desc.join(', ')}</span>` : '';
            const synStatus = buildSynergyStatusHtml();
            const lvTxt = player.runLevel ? ` · Lv.${player.runLevel}` : '';
            if (isMercenaryCaptainJob()) {
                summLine.innerHTML = `<span style="color:#e67e22;">🎖️ 지휘관 ${escapeHtml(getPlayerClassDisplayName())}</span> <span style="color:#888;">| HP ${pCur}/${pMax}${lvTxt} · 전열 없음${player.mercCooldownTurns > 0 ? ` · 재가동 ${player.mercCooldownTurns}T` : ''}${synHint}</span>${synStatus}`;
            } else if (player.summon && player.summon.name) {
                if (player.name === '소환사' && floor < 100) {
                    summLine.innerHTML = `<span style="color:#a55eea;">소환:</span> ${player.summon.name} <span style="color:#ff4757;font-weight:800;">(잠김: 100층)</span>${synHint}${synStatus}`;
                } else {
                    summLine.innerHTML = `<span style="color:#a55eea;">소환:</span> ${player.summon.name}${synHint}${synStatus}`;
                }
            }
            else if (player.name === '성직자') {
                const dp = formatDivinePowerForDisplay(safeNum(player.divinePower, 0));
                const gm = safeNum(player.divineGainMult, 1);
                const st = player.priestBlessed ? '✨ 신의 가호' : '·';
                summLine.innerHTML = `<span style="color:#888;font-size:0.85em;"><b>${escapeHtml(getPlayerClassDisplayName())}</b>${lvTxt} · <span style="color:#f1c40f;">✨ 신성력 ${dp}/${DIVINE_POWER_MAX}</span> · 획득×${gm.toFixed(2)} · ${st}${synHint}</span>${synStatus}`;
            } else summLine.innerHTML = `<span style="color:#888;font-size:0.85em;"><b>${escapeHtml(getPlayerClassDisplayName())}</b>${lvTxt}${synHint}</span>${synStatus}`;
        }
        document.getElementById('p-atk-val').textContent = String(getEffectiveAttackPower());
        document.getElementById('p-def-val').textContent = String(getTotalPlayerDefenseForHit());
        const critInfo = getCritInfo();
        document.getElementById('p-crit-val').textContent = `${Math.round(safeNum(critInfo.effectiveCrit, 0))}%`;
        const ecm = getEffectiveCritMult();
        if (critMultEl) critMultEl.textContent = `${(Number.isFinite(ecm) ? ecm : 1.8).toFixed(2)}x`;
        const lsOv = getLifestealOverflowAtk();
        const lsMain = document.getElementById('p-lifesteal-val');
        const lsNote = document.getElementById('p-lifesteal-note');
        if (lsMain) lsMain.textContent = `${Math.round(safeNum(getLifestealEffective(), 0) * 100)}%`;
        if (lsNote) lsNote.textContent = lsOv > 0 ? `흡혈 초과분 → 공격력 +${lsOv}` : '';
    }
    const ultLine = document.getElementById('p-ult-stack-line');
    if (ultLine) {
        if (player.unlockedSkill && floor >= 20) ultLine.innerHTML = `<span style="color:#9b59b6;">궁극기</span> [${safeNum(player.ultStack, 0)}/${Math.max(1, safeNum(player.ultMaxStack, 1))}]`;
        else ultLine.innerHTML = '';
    }
    ['floor-t-battle','gold-t-battle','potion-t-battle'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.innerText=[floor,g,pots][i];});
    ['floor-t','gold-t','potion-t'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.innerText=[floor,g,pots][i];});
    const sh=document.getElementById('shop-hp-t'), sg=document.getElementById('shop-gold-t');
    if(sh)sh.innerText=`${pCur}/${pMax}`;
    if(sg)sg.innerText=String(g);
    if (hasPendingVictoryAdvance()) {
        renderEnemyVictoryPanel();
        renderInventoryPanel();
        renderPassiveContractHistoryPanels();
        return;
    }
    setEnemyVictoryMode(false);
    const enemyNameEl = document.getElementById('e-name');
    if (enemyNameEl) {
        const hint = window._enemyThinkingHint ? `<div style="color:#ffb3b3;font-size:0.72em;font-weight:600;margin-top:3px;">${escapeHtml(window._enemyThinkingHint)}</div>` : '';
        enemyNameEl.innerHTML = `${escapeHtml(enemy.name)}${hint}`;
    }
    document.getElementById('e-hp').style.width=`${Math.max(0,(eCur/eHp)*100)}%`;
    document.getElementById('e-hp-t').innerText=`${eCur} / ${eHp}`;
    document.getElementById('e-atk-val').innerText=String(safeNum(enemy.atk, 0));
    document.getElementById('e-def-val').innerText=String(safeNum(enemy.def, 0));
    renderInventoryPanel();
    renderPassiveContractHistoryPanels();
}

function writeLog(msg) {
    if (!Array.isArray(window._combatLogHistory)) window._combatLogHistory = [];
    window._combatLogHistory.unshift(String(msg));
    if (window._combatLogHistory.length > 220) window._combatLogHistory.length = 220;
    renderSlimBattleLog();
    const p=`<p style="margin:4px 0;border-bottom:1px solid #333;padding-bottom:4px;">${msg}</p>`;
    const battle = document.getElementById('battle-area');
    const isBattle = battle && battle.style.display === 'block';
    if(!isBattle){const l=document.getElementById('log');if(l)l.innerHTML=p+l.innerHTML;}
}

function renderSlimBattleLog() {
    const strip = document.getElementById('battle-log-strip');
    if (!strip) return;
    const rows = (Array.isArray(window._combatLogHistory) ? window._combatLogHistory : [])
        .slice(0, 3)
        .map((msg) => `<div class="battle-log-line">${msg}</div>`)
        .join('');
    strip.innerHTML = rows || '<div class="battle-log-line battle-log-line-empty">전투 기록 대기</div>';
}

window.renderActions = renderActions;
window.renderPassiveContractHistoryPanels = renderPassiveContractHistoryPanels;
window.updateUi = updateUi;
window.writeLog = writeLog;
window.checkStoryMilestone = checkStoryMilestone;
window.applyStoryChoiceImpact = applyStoryChoiceImpact;
window.adjustPlayerStoryState = adjustPlayerStoryState;
// ===== migrated from bootstrapCore.js =====
/** 시즌 1 (베타) — 최초 1회 전체 진행 데이터 초기화 */
(function applySeason1BetaWipeOnce() {
    const SK = 'dungeon_season_id';
    const SEASON = '1-beta-wipe-s1full';
    if (localStorage.getItem(SK) === SEASON) return;
    const wipe = [
        'dungeon_meta_v7',
        'dungeon_meta_v7_f0',
        'dungeon_meta_v7_f1',
        'dungeon_meta_v7_f2',
        'dungeon_meta_v7_active_file',
        'dungeon_meta_v7_file_migrated_v2',
        'perma_stats',
        'perma_buy_count',
        'saved_gold',
        'item_collection_v5',
        'unlocked_floors_global',
        'unlocked_floors_워리어',
        'unlocked_floors_헌터',
        'unlocked_floors_마법사',
        'summon_contract_json',
        'summon_altar_done',
        'dungeon_quicksave_v7',
        'perma_migrated_v62',
        'perma_migrated_v651',
        'acc_perma_migrated_v71',
        'v703_global_perma_migrated',
        'meta_v7_legacy_migrated',
        'perma_repair_1',
        'user_exported_save_v7',
    ];
    try {
        wipe.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(SK, SEASON);
    } catch (e) {
        /* ignore */
    }
})();

firebase.initializeApp({
    apiKey: "AIzaSyAVWf5U6eBm2ofCcvdirMxkyfZs_1uVIiU",
    authDomain: "project-dungeon-82f2a.firebaseapp.com",
    projectId: "project-dungeon-82f2a",
    storageBucket: "project-dungeon-82f2a.firebasestorage.app",
    messagingSenderId: "301367810513",
    appId: "1:301367810313:web:42979150db5ea7b536a8f0"
});
const auth = firebase.auth();
const db = firebase.firestore();

if (!localStorage.getItem('perma_migrated_v62')) {
    localStorage.removeItem('perma_stats');
    localStorage.removeItem('perma_buy_count');
    localStorage.removeItem('saved_gold');
    localStorage.setItem('perma_migrated_v62', 'true');
}
if (!localStorage.getItem('perma_migrated_v651')) {
    try {
        const ps = JSON.parse(localStorage.getItem('perma_stats') || '{}');
        if ('potion' in ps) delete ps.potion;
        localStorage.setItem('perma_stats', JSON.stringify(ps));
        const bc = JSON.parse(localStorage.getItem('perma_buy_count') || '{}');
        Object.keys(bc).forEach((k) => { if (k.startsWith('pot_')) delete bc[k]; });
        localStorage.setItem('perma_buy_count', JSON.stringify(bc));
    } catch (e) { /* ignore */ }
    localStorage.setItem('perma_migrated_v651', 'true');
}

function clearRankRealtimeSubs() {
    if (Array.isArray(rankRealtimeUnsubs)) {
        rankRealtimeUnsubs.forEach((u) => {
            try { if (typeof u === 'function') u(); } catch (e) { /* ignore */ }
        });
    }
    rankRealtimeUnsubs = [];
}
function getRankTone(rank) {
    if (rank === 1) return { border: '#f1c40f', color: '#f1c40f', bg: '#2b2410', label: '🥇' };
    if (rank === 2) return { border: '#c0c0c0', color: '#d8d8d8', bg: '#232323', label: '🥈' };
    if (rank === 3) return { border: '#cd7f32', color: '#d99a5a', bg: '#2a2018', label: '🥉' };
    return { border: '#111', color: '#bbb', bg: '#171717', label: `#${rank}` };
}
function formatTopPercent(rank, total) {
    const t = Math.max(1, safeNum(total, 1));
    const r = Math.max(1, safeNum(rank, 1));
    const p = Math.max(0.1, (r / t) * 100);
    return `상위 ${p.toFixed(1)}%`;
}
function getCurrentUserKey() {
    if (!currentUser) return '';
    return String(currentUser.uid || currentUser.email || '').trim();
}
function getCurrentUserNick() {
    if (!currentUser) return '';
    const em = String(currentUser.email || '');
    return em ? em.split('@')[0] : 'unknown';
}
function sortRankRows(rows) {
    return rows.sort((a, b) => {
        const fa = safeNum(a.floor, 0);
        const fb = safeNum(b.floor, 0);
        if (fb !== fa) return fb - fa;
        const ta = safeNum(a.updatedAtMs, 0);
        const tb = safeNum(b.updatedAtMs, 0);
        return tb - ta;
    });
}
function renderUserRankInfo() {
    const el = document.getElementById('user-rank-info');
    if (!el) return;
    if (!currentUser) {
        el.innerHTML = '';
        return;
    }
    const meId = getCurrentUserKey();
    const meNick = getCurrentUserNick();
    const chips = [];
    for (const job of RANK_BASE_JOBS) {
        const rows = rankRealtimeCache[job] || [];
        if (!rows.length) continue;
        const idx = rows.findIndex((r) => r && (String(r.userId || '') === meId || String(r.email || '') === meNick));
        if (idx < 0) continue;
        const rank = idx + 1;
        const tone = getRankTone(rank);
        const text = rank > 100 ? `${job} ${formatTopPercent(rank, rows.length)}` : `${job} 서버 ${rank}등`;
        chips.push(`<span style="display:inline-block;margin:2px;padding:4px 8px;border-radius:999px;border:1px solid ${tone.border};background:${tone.bg};color:${tone.color};font-size:0.74em;font-weight:800;">${text}</span>`);
    }
    if (!chips.length) {
        el.innerHTML = `<div style="color:#666;font-size:0.75em;line-height:1.4;">아직 기록이 없습니다.</div>`;
    } else {
        el.innerHTML = chips.join('');
    }
}
function renderRankBoard() {
    const listEl = document.getElementById('rank-list');
    if (!listEl) return;
    if (!currentUser) {
        listEl.innerHTML = '<span style="color:#555;">로그인 후 확인 가능합니다.</span>';
        return;
    }
    let html = '';
    for (const job of RANK_BASE_JOBS) {
        const rows = rankRealtimeCache[job] || [];
        const jc = job === '헌터' ? '#2ed573' : job === '마법사' ? '#1e90ff' : job === '용병단장' ? '#e67e22' : '#ff4757';
        html += `<div style="margin-bottom:16px;"><b style="color:${jc};font-size:0.95em;border-bottom:1px solid #333;display:block;padding-bottom:4px;margin-bottom:8px;">⚔️ ${job} 전직별 실시간 랭킹</b>`;
        if (!rows.length) {
            html += `<div style="color:#555;font-size:0.85em;">기록 없음</div>`;
        } else {
            rows.slice(0, 50).forEach((r, i) => {
                const rank = i + 1;
                const tone = getRankTone(rank);
                const medal = rank <= 3 ? tone.label : `<span style="color:#888;">#${rank}</span>`;
                const jd = r.job !== r.baseJob ? `${r.baseJob}→${r.job}` : r.job;
                const name = r.displayName || r.email || 'unknown';
                html += `<div style="margin-bottom:6px;font-size:0.85em;padding:6px 8px;border:1px solid ${tone.border};border-radius:8px;background:${tone.bg};">
${medal} <b style="color:${tone.color};">${r.floor}층</b> <span style="color:#888;">(${jd})</span> <span style="color:#aaa;">👤${name}</span><br>
<span style="color:#ff4757;font-size:0.8em;margin-left:18px;">💀 ${r.killer || '알 수 없음'}</span>
</div>`;
            });
            if (rows.length > 50) {
                html += `<div style="color:#666;font-size:0.75em;margin-top:4px;">표시는 50위까지, 실시간 집계는 전체 인원 기준입니다.</div>`;
            }
        }
        html += `</div>`;
    }
    listEl.innerHTML = html;
}
function subscribeRankRealtime() {
    clearRankRealtimeSubs();
    rankRealtimeCache = {};
    const q = db.collection('global_ranks');
    const unsub = q.onSnapshot(
        (snap) => {
            const grouped = {};
            RANK_BASE_JOBS.forEach((j) => { grouped[j] = []; });
            snap.forEach((doc) => {
                const d = doc.data() || {};
                const bj = d.baseJob || '';
                if (!RANK_BASE_JOBS.includes(bj)) return;
                const ts = d.timestamp && typeof d.timestamp.toMillis === 'function' ? d.timestamp.toMillis() : 0;
                grouped[bj].push({
                    userId: d.userId || '',
                    email: d.email || 'unknown',
                    displayName: d.displayName || d.email || 'unknown',
                    job: d.job || bj,
                    baseJob: bj,
                    floor: safeNum(d.floor, 0),
                    killer: d.killer || '알 수 없음',
                    updatedAtMs: ts,
                });
            });
            for (const job of RANK_BASE_JOBS) {
                rankRealtimeCache[job] = sortRankRows(grouped[job] || []);
            }
            renderRankBoard();
            renderUserRankInfo();
        },
        () => {
            rankRealtimeCache = {};
            renderRankBoard();
            renderUserRankInfo();
        }
    );
    rankRealtimeUnsubs.push(unsub);
}
let pendingShop = false;
let potionUsedThisTurn = false;
let totalGoldEarned = 0;
let shopVisitCount = 0;
/** 공격 버튼 GCD(광클 방지), 타격감 연출과 동일 500ms */
let attackGcdUntil = 0;
const ATTACK_GCD_MS = 500;
/** 패치 노트/UI와 맞춰 두기 — 캐시 적용 여부 확인용 */
const GAME_BUILD = 'S1';
/** 베이스캠프 오버레이 스크롤 유지 */
window.__baseCampScrollTop = 0;
/** 필드 용병 기본 피해 계수(전역 보정) */
const MERC_DMG_GLOBAL_SCALE = 1.56;
/** 층수에 따른 용병 딜/HP 성장 상한(과도한 폭주 방지) */
const MERC_FLOOR_SCALE_CAP = 1.65;
function clearSummonRunStorage() {
    localStorage.removeItem('summon_altar_done');
    localStorage.removeItem('summon_contract_json');
}

function loadSummonFromStorage() {
    try {
        const raw = localStorage.getItem('summon_contract_json');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) { return null; }
}

function saveSummonToStorage(s) {
    if (s) localStorage.setItem('summon_contract_json', JSON.stringify(s));
    else localStorage.removeItem('summon_contract_json');
}

/** localStorage 깨짐/부분 저장 대비 — undefined 합산으로 NaN 방지 */
function safeNum(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function normalizePlayerFloorGrowth(raw) {
    if (typeof normalizeFloorGrowth === 'function') return normalizeFloorGrowth(raw);
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
        floors: Math.max(0, Math.floor(safeNum(src.floors, 0))),
        atk: Math.max(0, Math.floor(safeNum(src.atk, 0))),
        hp: Math.max(0, Math.floor(safeNum(src.hp, 0))),
    };
}

function uniqueTacticalSkillKeys(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    const out = [];
    arr.forEach((x) => {
        const key = String(x || '').trim();
        if (!key || out.includes(key)) return;
        if (typeof getTacticalSkillDef === 'function' && !getTacticalSkillDef(key)) return;
        out.push(key);
    });
    return out;
}

function uniqueClaimedTacticalMilestones(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    return Array.from(
        new Set(
            arr
                .map((x) => Math.floor(safeNum(x, 0)))
                .filter((x) => Number.isFinite(x) && x > 0)
        )
    );
}

function ensurePlayerRunProgressFields(slot) {
    if (!player) return;
    let growth = normalizePlayerFloorGrowth(player.floorGrowth || (slot && slot.floorGrowth));
    if ((!growth.floors || (!growth.atk && !growth.hp)) && floor > 1 && typeof computeFloorGrowthForClears === 'function') {
        growth = computeFloorGrowthForClears(Math.max(0, floor - 1));
    }
    player.floorGrowth = growth;
    player.tacticalSkills = uniqueTacticalSkillKeys([
        ...(slot && Array.isArray(slot.tacticalSkills) ? slot.tacticalSkills : []),
        ...(Array.isArray(player.tacticalSkills) ? player.tacticalSkills : []),
    ]);
    player.tacticalSkillMilestonesClaimed = uniqueClaimedTacticalMilestones([
        ...(slot && Array.isArray(slot.tacticalSkillMilestonesClaimed) ? slot.tacticalSkillMilestonesClaimed : []),
        ...(Array.isArray(player.tacticalSkillMilestonesClaimed) ? player.tacticalSkillMilestonesClaimed : []),
    ]);
    if (!player.tacticalSkillUses || typeof player.tacticalSkillUses !== 'object') player.tacticalSkillUses = {};
    player.tacticalFocusReady = !!player.tacticalFocusReady;
    player.tacticalParryReady = !!player.tacticalParryReady;
    player.tacticalBarrierReady = !!player.tacticalBarrierReady;
    ensurePlayerStoryState(slot);
}

function normalizeUiPlayerState(raw) {
    if (typeof normalizePlayerState === 'function') return normalizePlayerState(raw);
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
        corruption: Math.max(0, Math.floor(safeNum(src.corruption, 0))),
        purification: Math.max(0, Math.floor(safeNum(src.purification, 0))),
    };
}

function ensurePlayerStoryState(slot) {
    const fromPlayer = player && player.playerState ? player.playerState : null;
    const fromSlot = slot && slot.playerState ? slot.playerState : null;
    const merged = normalizeUiPlayerState(fromPlayer || fromSlot || playerState);
    playerState = merged;
    if (player) {
        player.playerState = merged;
        const title = typeof getStoryTitleForState === 'function' ? getStoryTitleForState(merged, floor) : null;
        if (title) player.storyTitle = title;
        else delete player.storyTitle;
    }
    return merged;
}

function syncPlayerStoryStateToMeta() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined' || typeof MetaRPG.syncRunProgress !== 'function') return;
    ensurePlayerStoryState(player.metaSlotId && typeof MetaRPG.getSlotById === 'function' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    MetaRPG.syncRunProgress(player.metaSlotId, {
        playerState: player.playerState,
    });
}

function adjustPlayerStoryState(delta, reason) {
    if (!player) return null;
    const d = delta && typeof delta === 'object' ? delta : {};
    const cur = ensurePlayerStoryState(player.metaSlotId && typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    const next = normalizeUiPlayerState({
        corruption: cur.corruption + Math.max(0, Math.floor(safeNum(d.corruption, 0))),
        purification: cur.purification + Math.max(0, Math.floor(safeNum(d.purification, 0))),
    });
    playerState = next;
    player.playerState = next;
    syncPlayerStoryStateToMeta();
    const label = reason ? ` — ${escapeHtml(String(reason))}` : '';
    writeLog(
        `[운명] 타락 ${next.corruption} / 정화 ${next.purification}${label ? `<span style="color:#888;">${label}</span>` : ''}`
    );
    updateUi();
    return next;
}

function applyStoryChoiceImpact(choiceKey) {
    const impact = typeof getStoryChoiceImpact === 'function' ? getStoryChoiceImpact(choiceKey) : null;
    if (!impact) return null;
    return adjustPlayerStoryState(impact, impact.label || choiceKey);
}

function syncPlayerRunProgressToMeta() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined' || typeof MetaRPG.syncRunProgress !== 'function') return;
    ensurePlayerStoryState(MetaRPG.getSlotById(player.metaSlotId));
    MetaRPG.syncRunProgress(player.metaSlotId, {
        floorGrowth: player.floorGrowth,
        playerState: player.playerState,
        tacticalSkills: player.tacticalSkills,
        tacticalSkillMilestonesClaimed: player.tacticalSkillMilestonesClaimed,
        currentPromotion: player.currentPromotion || null,
    });
}

function applyFloorGrowthRewardForClear(clearedFloor) {
    if (!player) return;
    ensurePlayerRunProgressFields(player.metaSlotId && typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    const step = typeof getFloorGrowthStep === 'function' ? getFloorGrowthStep() : { atk: 1, hp: 5 };
    const atkGain = Math.max(0, Math.floor(safeNum(step.atk, 1)));
    const hpGain = Math.max(0, Math.floor(safeNum(step.hp, 5)));
    if (atkGain <= 0 && hpGain <= 0) return;
    player.floorGrowth = normalizePlayerFloorGrowth(player.floorGrowth);
    player.floorGrowth.floors += 1;
    player.floorGrowth.atk += atkGain;
    player.floorGrowth.hp += hpGain;
    player.atk = Math.max(1, safeNum(player.atk, 1) + atkGain);
    player.maxHp = Math.max(1, safeNum(player.maxHp, 1) + hpGain);
    player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0) + hpGain);
    writeLog(
        `[성장] ${clearedFloor}층 생존 보너스 — 공격 +${atkGain}, 최대 체력 +${hpGain} <span style="color:#888;">(누적 공격 +${player.floorGrowth.atk}, 체력 +${player.floorGrowth.hp})</span>`
    );
    syncPlayerRunProgressToMeta();
}

function getPendingTacticalSkillMilestone(clearedFloor) {
    if (!player || typeof getTacticalSkillMilestoneForFloor !== 'function') return null;
    ensurePlayerRunProgressFields(player.metaSlotId && typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    const milestone = getTacticalSkillMilestoneForFloor(clearedFloor);
    if (!milestone) return null;
    const claimed = uniqueClaimedTacticalMilestones(player.tacticalSkillMilestonesClaimed);
    if (claimed.includes(milestone.floor)) return null;
    const owned = uniqueTacticalSkillKeys(player.tacticalSkills);
    const choices = (Array.isArray(milestone.choices) ? milestone.choices : []).filter((key) => {
        if (owned.includes(key)) return false;
        return typeof getTacticalSkillDef !== 'function' ? true : !!getTacticalSkillDef(key);
    });
    if (!choices.length) {
        player.tacticalSkillMilestonesClaimed = uniqueClaimedTacticalMilestones([...claimed, milestone.floor]);
        syncPlayerRunProgressToMeta();
        return null;
    }
    return { floor: milestone.floor, choices };
}

function renderTacticalSkillRewardOverlay(milestone, onDone) {
    const existing = document.getElementById('tactical-skill-reward-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'tactical-skill-reward-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.86);z-index:10085;display:flex;align-items:center;justify-content:center;padding:16px;';
    const rows = milestone.choices
        .map((key) => {
            const def = typeof getTacticalSkillDef === 'function' ? getTacticalSkillDef(key) : null;
            const icon = def && def.icon ? def.icon : '✦';
            const name = def && def.name ? def.name : key;
            const desc = def && def.shortDesc ? def.shortDesc : '전술 스킬';
            return `<button type="button" class="tactical-skill-choice" data-skill-key="${escapeHtmlAttr(
                key
            )}" style="width:100%;background:#141722;border:1px solid #46506a;color:#e8edf7;border-radius:8px;padding:13px 14px;margin-top:10px;text-align:left;cursor:pointer;font-weight:800;line-height:1.45;">
                <span style="font-size:1.05em;color:#f1c40f;">${icon} ${escapeHtml(name)}</span>
                <span style="display:block;color:#94a3b8;font-size:0.82em;font-weight:600;margin-top:4px;">${escapeHtml(desc)}</span>
            </button>`;
        })
        .join('');
    overlay.innerHTML = `
        <div style="max-width:460px;width:100%;background:#10131d;border:1px solid #f1c40f;border-radius:10px;padding:20px;box-shadow:0 18px 60px rgba(0,0,0,0.58);">
            <div style="color:#f1c40f;font-weight:900;font-size:1.05em;margin-bottom:6px;">전술 각성 · ${milestone.floor}층 돌파</div>
            <p style="color:#9aa4b2;font-size:0.86em;line-height:1.55;margin:0 0 8px;">다음 전투부터 사용할 전술 스킬 하나를 선택하세요.</p>
            ${rows}
        </div>`;
    overlay.querySelectorAll('.tactical-skill-choice').forEach((btn) => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-skill-key');
            const def = typeof getTacticalSkillDef === 'function' ? getTacticalSkillDef(key) : null;
            player.tacticalSkills = uniqueTacticalSkillKeys([...(player.tacticalSkills || []), key]);
            player.tacticalSkillMilestonesClaimed = uniqueClaimedTacticalMilestones([
                ...(player.tacticalSkillMilestonesClaimed || []),
                milestone.floor,
            ]);
            if (player.metaSlotId && typeof MetaRPG !== 'undefined' && typeof MetaRPG.grantTacticalSkillToSlot === 'function') {
                MetaRPG.grantTacticalSkillToSlot(player.metaSlotId, key, milestone.floor);
            }
            syncPlayerRunProgressToMeta();
            overlay.remove();
            writeLog(`[전술] <b>${escapeHtml(def && def.name ? def.name : key)}</b> 습득 — ${escapeHtml(def && def.shortDesc ? def.shortDesc : '전술 확장')}`);
            updateUi();
            renderActions();
            if (typeof onDone === 'function') setTimeout(onDone, 180);
        });
    });
    document.body.appendChild(overlay);
}

function maybeOfferTacticalSkillReward(clearedFloor, onDone) {
    const milestone = getPendingTacticalSkillMilestone(clearedFloor);
    if (!milestone) {
        if (typeof onDone === 'function') onDone();
        return false;
    }
    renderTacticalSkillRewardOverlay(milestone, onDone);
    return true;
}
/** 장착 시너지 보너스 캐시 — 회복 상한·UI 등에서 동일 값 사용 */
// stage 3 split: moved to js/player.js
function getPermaStats() {
    try {
        const s = localStorage.getItem('perma_stats');
        let raw = {};
        if (s && s !== 'null' && s !== 'undefined') {
            const p = JSON.parse(s);
            if (p && typeof p === 'object' && !Array.isArray(p)) raw = p;
        }
        return {
            hp: Math.max(0, safeNum(raw.hp, 0)),
            atk: Math.max(0, safeNum(raw.atk, 0)),
            def: Math.max(0, safeNum(raw.def, 0)),
            acc: 0,
        };
    } catch (e) {
        return { hp: 0, atk: 0, def: 0, acc: 0 };
    }
}
function getSavedGold() {
    if (typeof MetaRPG !== 'undefined') {
        const m = MetaRPG.loadMeta();
        return Math.max(0, safeNum(m.savedGold, 0));
    }
    const n = parseInt(String(localStorage.getItem('saved_gold') ?? ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}
function savePermaStats(stats) {
    const s = {
        hp: Math.max(0, safeNum(stats && stats.hp, 0)),
        atk: Math.max(0, safeNum(stats && stats.atk, 0)),
        def: Math.max(0, safeNum(stats && stats.def, 0)),
        acc: 0,
    };
    localStorage.setItem('perma_stats', JSON.stringify(s));
}
/** 한 번만: 깨진 perma_stats를 정상 JSON으로 덮어씀 */
(function repairPermaStorageOnce() {
    try {
        if (localStorage.getItem('perma_repair_1')) return;
        savePermaStats(getPermaStats());
        localStorage.setItem('perma_repair_1', '1');
    } catch (e) { /* ignore */ }
})();
function getPermaBuyCount() { return JSON.parse(localStorage.getItem('perma_buy_count') || '{}'); }
function savePermaBuyCount(counts) { localStorage.setItem('perma_buy_count', JSON.stringify(counts)); }

function getUnlockedFloors(job) {
    const key = job ? `unlocked_floors_${job}` : 'unlocked_floors_global';
    return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveUnlockedFloor(f, job) {
    const key = job ? `unlocked_floors_${job}` : 'unlocked_floors_global';
    const unlocked = getUnlockedFloors(job);
    if (!unlocked.includes(f)) { unlocked.push(f); localStorage.setItem(key, JSON.stringify(unlocked)); }
}

function updatePrologueBattleControls() {
    const locked = !!(player && player.prologueLocked);
    const victoryLocked = hasPendingVictoryAdvance();
    const saveBtn = document.getElementById('battle-save-main-btn');
    const exitBtn = document.getElementById('battle-exit-main-btn');
    if (saveBtn) saveBtn.style.display = locked || victoryLocked ? 'none' : '';
    if (exitBtn) exitBtn.style.display = locked || victoryLocked ? 'none' : '';
}

function enterBattleLayout() {
    document.getElementById('sidebar-normal').style.display = 'none';
    const invSb = document.getElementById('sidebar-inventory');
    if (invSb) invSb.style.display = 'flex';
    document.getElementById('log').style.display = 'none';
    updatePrologueBattleControls();
}
function exitBattleLayout() {
    document.getElementById('sidebar-normal').style.display = 'flex';
    const invSb = document.getElementById('sidebar-inventory');
    if (invSb) invSb.style.display = 'none';
    document.getElementById('log').style.display = 'block';
    updatePrologueBattleControls();
}

let mainViewTransitionQueue = Promise.resolve();

function waitForElementTransition(el) {
    return new Promise((resolve) => {
        if (!el) {
            resolve();
            return;
        }
        const onEnd = (event) => {
            if (event && event.target !== el) return;
            el.removeEventListener('transitionend', onEnd);
            resolve();
        };
        el.addEventListener('transitionend', onEnd);
    });
}

function cleanupTransientViewDom() {
    const fx = document.getElementById('combat-fx-layer');
    if (fx) fx.replaceChildren();
    document.querySelectorAll('.floating-damage').forEach((el) => el.remove());
    const ep = document.getElementById('encounter-phase');
    if (ep && ep.style.display === 'none') ep.replaceChildren();
}

function transitionMainView(renderFn) {
    const host = document.getElementById('main-screen') || document.querySelector('.screen');
    if (!host || typeof renderFn !== 'function') {
        if (typeof renderFn === 'function') renderFn();
        return Promise.resolve();
    }
    mainViewTransitionQueue = mainViewTransitionQueue.then(async () => {
        host.classList.add('screen-transitioning');
        void host.offsetWidth;
        host.classList.add('screen-fade-out');
        await waitForElementTransition(host);
        cleanupTransientViewDom();
        renderFn();
        host.classList.remove('screen-fade-out');
        await waitForElementTransition(host);
        host.classList.remove('screen-transitioning');
        cleanupTransientViewDom();
    });
    return mainViewTransitionQueue;
}

/** 시너지 커스텀 툴팁: 터치/클릭으로 열고, 바깥 클릭 시 닫음 (PC는 @media hover로 마우스 호버도 유지) */
function initSynergyTooltipInteractions() {
    document.addEventListener(
        'click',
        (e) => {
            const raw = e.target;
            const el = raw && raw.nodeType === 1 ? raw : raw && raw.parentElement;
            if (!el || !el.closest) return;
            const trigger = el.closest('.synergy-tip-trigger');
            if (trigger) {
                const wrap = trigger.closest('.synergy-tip-wrap');
                if (wrap) {
                    e.stopPropagation();
                    const wasOpen = wrap.classList.contains('synergy-tip-open');
                    document.querySelectorAll('.synergy-tip-wrap.synergy-tip-open').forEach((w) => w.classList.remove('synergy-tip-open'));
                    if (!wasOpen) wrap.classList.add('synergy-tip-open');
                    return;
                }
            }
            if (!el.closest('.synergy-tip-wrap')) {
                document.querySelectorAll('.synergy-tip-wrap.synergy-tip-open').forEach((w) => w.classList.remove('synergy-tip-open'));
            }
        },
        false
    );
}

document.addEventListener('DOMContentLoaded', () => {
    exitBattleLayout();
    initSynergyTooltipInteractions();
    migrateAccPermaV71();
    console.log('[던전] 클라이언트 빌드 v' + GAME_BUILD + ' — 로그에 이 안 보이면 예전 JS 캐시입니다. 강력 새로고침(Cmd+Shift+R)하세요.');
});

/** 구 명중 영구강화 제거 + 골드 환불 (1회) */
function migrateAccPermaV71() {
    if (localStorage.getItem('acc_perma_migrated_v71')) return;
    let refund = 0;
    const buyCounts = getPermaBuyCount();
    let hadAccBuy = false;
    for (let i = 1; i <= 20; i++) {
        const id = 'acc_' + i;
        if (buyCounts[id]) {
            hadAccBuy = true;
            refund += typeof legacyAccUpgradePrice === 'function' ? legacyAccUpgradePrice(i) : 0;
            delete buyCounts[id];
        }
    }
    savePermaBuyCount(buyCounts);
    const ps = getPermaStats();
    if (!hadAccBuy && ps.acc > 0) {
        const tiers = Math.min(20, Math.floor(ps.acc / 2));
        for (let i = 1; i <= tiers; i++) {
            refund += typeof legacyAccUpgradePrice === 'function' ? legacyAccUpgradePrice(i) : 0;
        }
    }
    savePermaStats({ hp: ps.hp, atk: ps.atk, def: ps.def, acc: 0 });
    if (refund > 0) {
        if (typeof MetaRPG !== 'undefined') {
            MetaRPG.addSavedGold(refund);
            const m = MetaRPG.loadMeta();
            m.slots.forEach((s) => {
                if (s.legacyPerma) s.legacyPerma.acc = 0;
                MetaRPG.recalcTechBonus(s);
            });
            MetaRPG.saveMeta(m);
        } else {
            const sg = parseInt(localStorage.getItem('saved_gold') || '0', 10) || 0;
            localStorage.setItem('saved_gold', String(sg + refund));
        }
    } else if (typeof MetaRPG !== 'undefined') {
        const m = MetaRPG.loadMeta();
        m.slots.forEach((s) => {
            if (s.legacyPerma && s.legacyPerma.acc) s.legacyPerma.acc = 0;
            MetaRPG.recalcTechBonus(s);
        });
        MetaRPG.saveMeta(m);
    }
    localStorage.setItem('acc_perma_migrated_v71', '1');
}

/** 테크 노드 효과를 한글로 */
function formatTechEffect(e) {
    if (!e || typeof e !== 'object') return '';
    const parts = [];
    if (e.hp) parts.push(`체력 <b style="color:#2ed573">+${e.hp}</b>`);
    if (e.atk) parts.push(`공격 <b style="color:#f1c40f">+${e.atk}</b>`);
    if (e.def) parts.push(`방어 <b style="color:#1e90ff">+${e.def}</b>`);
    if (e.acc) parts.push(`명중 <b style="color:#a55eea">+${e.acc}%</b>`);
    return parts.length ? parts.join(' · ') : '—';
}

// ===================== 타격감 효과 =====================
// stage 1 split: moved to js/vfx.js
// stage 4 split: combat loop helpers moved to js/combatLogic.js

// stage 3 split: moved to js/player.js
// stage 2 split: shop formatting/filtering moved to js/shop.js
// stage 4 split: combat calculations moved to js/combatLogic.js

function showUnlockPopup(title, body, color) {
    const popup = document.createElement('div');
    popup.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;background:#1a1a1a;border:2px solid ${color};border-radius:10px;padding:16px 20px;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.8);animation:slideIn 0.3s ease;`;
    popup.innerHTML = `<div style="color:${color};font-weight:700;font-size:1em;margin-bottom:6px;">${title}</div><div style="color:#e0e0e0;font-size:0.88em;line-height:1.5;">${body}</div>`;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.transition='opacity 0.5s'; popup.style.opacity='0'; setTimeout(() => { if (popup.parentNode) document.body.removeChild(popup); }, 500); }, 3000);
}

// ===================== 전직 전용 아이템 해금 =====================
const EVO_ITEM_UNLOCK_KEY = 'evo_item_unlocks_v1';
const EVO_ITEM_UNLOCK_MILESTONE_KEY = 'evo_item_unlock_milestones_v1';
const EVO_UNLOCK_NEED_COUNT = 3;
const EVO_MILESTONES = [4, 7, 10]; // 기본 직업 플레이 중(전직 전) 3회 해금
const EVOLUTION_NAMES = ['나이트', '버서커', '궁수', '암살자', '위저드', '소환사', '성직자'];

function isEvolutionJobName(n) {
    return EVOLUTION_NAMES.includes(String(n || ''));
}

function loadEvoItemUnlockState() {
    try {
        const raw = localStorage.getItem(EVO_ITEM_UNLOCK_KEY);
        const o = raw ? JSON.parse(raw) : {};
        return o && typeof o === 'object' ? o : {};
    } catch (e) {
        return {};
    }
}
function saveEvoItemUnlockState(o) {
    try {
        localStorage.setItem(EVO_ITEM_UNLOCK_KEY, JSON.stringify(o && typeof o === 'object' ? o : {}));
    } catch (e) {
        /* ignore */
    }
}
function loadEvoMilestones() {
    try {
        const raw = localStorage.getItem(EVO_ITEM_UNLOCK_MILESTONE_KEY);
        const o = raw ? JSON.parse(raw) : {};
        return o && typeof o === 'object' ? o : {};
    } catch (e) {
        return {};
    }
}
function saveEvoMilestones(o) {
    try {
        localStorage.setItem(EVO_ITEM_UNLOCK_MILESTONE_KEY, JSON.stringify(o && typeof o === 'object' ? o : {}));
    } catch (e) {
        /* ignore */
    }
}
function getUnlockedEvolutionItemNames(evoName) {
    const s = loadEvoItemUnlockState();
    const e = s && s[evoName];
    const arr = e && Array.isArray(e.names) ? e.names : [];
    return arr.filter((x) => typeof x === 'string' && x.length > 0);
}
function isEvolutionItemNameUnlocked(evoName, itemName) {
    return getUnlockedEvolutionItemNames(evoName).includes(String(itemName || ''));
}
function isEvolutionItemSetUnlocked(evoName) {
    return getUnlockedEvolutionItemNames(evoName).length >= EVO_UNLOCK_NEED_COUNT;
}
function pickRandomLockedEvoItemName(evoName) {
    const unlocked = new Set(getUnlockedEvolutionItemNames(evoName));
    const pool = (equipmentPool || []).filter((it) => {
        if (!it || !it.name) return false;
        if (!it.onlyFor || !Array.isArray(it.onlyFor) || it.onlyFor.length !== 1) return false;
        if (it.onlyFor[0] !== evoName) return false;
        if (unlocked.has(it.name)) return false;
        return true;
    });
    if (!pool.length) return null;
    const it = pool[Math.floor(Math.random() * pool.length)];
    return it && it.name ? it.name : null;
}
function unlockEvolutionItemName(evoName, itemName) {
    const evo = String(evoName || '');
    const name = String(itemName || '');
    if (!evo || !name) return false;
    const st = loadEvoItemUnlockState();
    st[evo] = st[evo] && typeof st[evo] === 'object' ? st[evo] : {};
    st[evo].names = Array.isArray(st[evo].names) ? st[evo].names : [];
    if (!st[evo].names.includes(name)) st[evo].names.push(name);
    saveEvoItemUnlockState(st);
    return true;
}
function maybeUnlockEvolutionItemsFromBasePlay(clearedFloor) {
    if (!player || player.evolved) return;
    const base = player.baseJob;
    if (!base || !jobEvolutions || !jobEvolutions[base]) return;
    if (!EVO_MILESTONES.includes(clearedFloor)) return;
    const ms = loadEvoMilestones();
    ms[base] = Array.isArray(ms[base]) ? ms[base] : [];
    if (ms[base].includes(clearedFloor)) return;
    ms[base].push(clearedFloor);
    saveEvoMilestones(ms);

    const evols = jobEvolutions[base] || [];
    const unlockedMsgs = [];
    evols.forEach((e) => {
        if (!e || !e.name) return;
        const evoName = e.name;
        const cur = getUnlockedEvolutionItemNames(evoName).length;
        if (cur >= EVO_UNLOCK_NEED_COUNT) return;
        const pick = pickRandomLockedEvoItemName(evoName);
        if (!pick) return;
        unlockEvolutionItemName(evoName, pick);
        const now = getUnlockedEvolutionItemNames(evoName).length;
        unlockedMsgs.push(`${evoName} (${now}/${EVO_UNLOCK_NEED_COUNT})`);
    });
    if (unlockedMsgs.length) {
        writeLog(`[해금] 🧩 전직 전용 장비 해금 진행: ${unlockedMsgs.join(' · ')} — 도감에서 확인 가능`);
    }
}

function showAuthError(msg) {
    const e = document.getElementById('login-error');
    e.innerText = msg; e.style.display = 'block';
}

window.handleSignup = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    if (!email || pw.length < 6) return showAuthError("❌ 이메일 형식(ex: a@a.com)을 맞추고, 비밀번호는 6자리 이상이어야 합니다!");
    auth.createUserWithEmailAndPassword(email, pw).then(() => alert("가입 환영! 모험을 시작하세요.")).catch(() => showAuthError("❌ 가입 실패"));
};
window.handleLogin = () => {
    const email = document.getElementById('email-input').value;
    const pw = document.getElementById('pw-input').value;
    if (!email || !pw) return showAuthError("❌ 이메일과 비밀번호를 모두 입력해 주세요!");
    auth.signInWithEmailAndPassword(email, pw).then(() => writeLog("서버 로그인 완료!")).catch(() => showAuthError("❌ 로그인 실패"));
};
window.handleLogout = () => { auth.signOut().then(() => { alert("로그아웃 되었습니다."); location.reload(); }); };

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-info').innerText = user.email.split('@')[0] + " 님";
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('login-area').style.display = 'none';
        exitBattleLayout(); showPreGameScreen(); subscribeRankRealtime();
    } else {
        clearRankRealtimeSubs();
        currentUser = null;
        rankRealtimeCache = {};
        renderUserRankInfo();
        document.getElementById('login-area').style.display = 'block';
        document.getElementById('start-area').style.display = 'none';
        exitBattleLayout();
    }
});

/** 베이스캠프 영구 강화 — 무한 단계, 슬롯 전용 */
function getCampPermaNextPrice(key, level) {
    const growth = (typeof BALANCE !== 'undefined' && BALANCE.enemyPostWallGrowth) || 1.065;
    const floorEq = (typeof BALANCE !== 'undefined' && BALANCE.upgradeFloorEquivalent) || 1.25;
    const tempo = Math.max(1.28, Math.pow(growth, floorEq * 5.2));
    const T = {
        hp: [20, tempo],
        atk: [24, tempo],
        def: [22, tempo],
        crit: [120, 1.45],
        cm: [180, 1.48],
    };
    const pair = T[key] || T.hp;
    return Math.floor(pair[0] * Math.pow(pair[1], Math.max(0, level)));
}

function buildPermanentShopHtml() {
    if (typeof MetaRPG === 'undefined' || !player || !player.metaSlotId) {
        return '<p style="color:#888;font-size:0.85em;">활성 캐릭터 슬롯이 없습니다.</p>';
    }
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return '';
    MetaRPG.recalcTechBonus(slot);
    const cp = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    const tb = slot.techBonus || {};
    const runGold = safeNum(gold, 0);
    const sumLine = `<p style="color:#888;font-size:0.78em;margin:0 0 12px 0;line-height:1.5;">📌 <b>이 캐릭터 누적</b> — 체력+테크 <b style="color:#2ed573">${Math.ceil(tb.hp || 0)}</b> · 공격 <b style="color:#f1c40f">${Math.ceil(tb.atk || 0)}</b> · 방어 <b style="color:#1e90ff">${Math.ceil(tb.def || 0)}</b> · 치명 <b style="color:#f39c12">+${Math.ceil(tb.crit || 0)}%</b> · 배율 <b style="color:#e67e22">+${Math.ceil((tb.critMult || 0) * 100)}%</b></p><p style="color:#2ed573;font-size:0.8em;">💰 런 골드로 구매: <b>${runGold}G</b></p>`;
    const catKeys = ['hp', 'atk', 'def', 'crit', 'cm'];
    const labels = { hp: '❤️ 체력', atk: '⚔️ 공격', def: '🛡️ 방어', crit: '💥 치명 확률', cm: '🎯 치명 배율' };
    const getCampDeltaText = (key, lv) => {
        if (!['hp', 'atk', 'def'].includes(key) || typeof MetaRPG.getCampStatGrowthBonus !== 'function') return null;
        const now = MetaRPG.getCampStatGrowthBonus(slot, key, lv);
        const next = MetaRPG.getCampStatGrowthBonus(slot, key, lv + 1);
        const delta = Math.max(0, next - now);
        const label = key === 'hp' ? 'HP' : key === 'atk' ? '공격' : '방어';
        return `다음 +${delta} ${label} (≈${((typeof BALANCE !== 'undefined' && BALANCE.upgradeFloorEquivalent) || 1.25).toFixed(2)}층 성장분)`;
    };
    const sub = {
        hp: '층 성장 곡선 연동',
        atk: '층 성장 곡선 연동',
        def: '층 성장 곡선 연동',
        crit: '+1%/단계',
        cm: '+0.10 배율/단계 (≈10%)',
    };
    const colors = { hp: '#2ed573', atk: '#f1c40f', def: '#1e90ff', crit: '#f39c12', cm: '#e67e22' };
    const rows = catKeys
        .map((key) => {
            const lv = cp[key] || 0;
            const price = getCampPermaNextPrice(key, lv);
            const can = runGold >= price;
            const btnBg = can ? '#f1c40f' : '#333';
            const btnFg = can ? '#111' : '#666';
            const deltaText = getCampDeltaText(key, lv) || sub[key];
            return `<div style="display:flex;justify-content:space-between;align-items:center;background:#111;border:1px solid #333;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
            <div style="flex:1;">
                <span style="color:${colors[key]};font-weight:700;font-size:0.9em;">${labels[key]}</span>
                <span style="color:#888;font-size:0.8em;margin-left:10px;">Lv.${lv} · ${deltaText}</span>
                <div style="color:#555;font-size:0.72em;margin-top:3px;">다음 비용: <b style="color:#f1c40f;">${price}G</b></div>
            </div>
            <button type="button" onclick="buyCampPermaNext('${key}')" ${!can ? 'disabled' : ''} style="background:${btnBg};color:${btnFg};padding:8px 18px;font-size:0.82em;font-weight:700;border:none;border-radius:6px;cursor:${!can ? 'not-allowed' : 'pointer'};">강화</button>
        </div>`;
        })
        .join('');
    return sumLine + rows;
}

/** 구버전 전역 perma_stats → 첫 슬롯 campPerma로 1회 이관 */
function migrateGlobalPermaIntoSlotOnce() {
    if (localStorage.getItem('v703_global_perma_migrated')) return;
    if (typeof MetaRPG === 'undefined') return;
    const g = getPermaStats();
    const m = MetaRPG.loadMeta();
    if (!m.slots.length) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    if ((g.hp || 0) + (g.atk || 0) + (g.def || 0) < 1) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    const slot = m.activeSlotId ? m.slots.find((s) => s.id === m.activeSlotId) : m.slots[0];
    if (!slot) {
        localStorage.setItem('v703_global_perma_migrated', '1');
        return;
    }
    slot.campPerma = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    slot.campPerma.hp += Math.max(0, Math.floor((g.hp || 0) / 20));
    slot.campPerma.atk += Math.max(0, Math.floor((g.atk || 0) / 3));
    slot.campPerma.def += Math.max(0, Math.floor((g.def || 0) / 2));
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(m);
    savePermaStats({ hp: 0, atk: 0, def: 0, acc: 0 });
    try {
        localStorage.removeItem('perma_buy_count');
    } catch (e) { /* ignore */ }
    localStorage.setItem('v703_global_perma_migrated', '1');
}

function getRaceStoryDef(raceKey) {
    if (typeof raceStories === 'undefined') return null;
    return raceStories[raceKey] || null;
}

function getIntroWeaponDef(weaponKey) {
    if (typeof introWeaponChoices === 'undefined') return null;
    return introWeaponChoices[weaponKey] || null;
}

function getClassStoryDef(classKey) {
    if (typeof classStories === 'undefined') return null;
    return classStories[classKey] || null;
}

function getPromotionStoryDef(promotionKey) {
    if (typeof promotionStories === 'undefined') return null;
    return promotionStories[promotionKey] || null;
}

function getGlobalFloorStoryBand(f) {
    if (typeof floorStories === 'undefined' || !Array.isArray(floorStories.bands)) return null;
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    return floorStories.bands.find((band) => floorNum >= band.from && floorNum <= band.to) || null;
}

function getGlobalFloorStoryDef(f) {
    if (typeof floorStories === 'undefined') return null;
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    const band = getGlobalFloorStoryBand(floorNum);
    const exactLines = floorStories.milestones && floorStories.milestones[floorNum]
        ? floorStories.milestones[floorNum]
        : [];
    const bandLines = [];
    if (band && Array.isArray(band.lines) && band.lines.length) {
        const cadence = Math.max(1, Math.floor(safeNum(band.cadence, 1)));
        const index = Math.min(band.lines.length - 1, Math.floor((floorNum - band.from) / cadence));
        bandLines.push(band.lines[Math.max(0, index)]);
    }
    const lines = [...bandLines, ...exactLines].filter(Boolean);
    if (!lines.length) return null;
    return {
        key: band ? `${band.key}:${floorNum}` : `milestone:${floorNum}`,
        title: band ? `${floorNum}층 ${band.title}` : `${floorNum}층 기억`,
        lines,
    };
}

function getRelicStoryClueLines(relicKey) {
    if (typeof floorStories === 'undefined' || !floorStories.relicClues) return [];
    const f = Math.max(1, Math.floor(safeNum(floor, 1)));
    if (f < 51) return [];
    const band = getGlobalFloorStoryBand(f);
    const key = band && band.key === 'summit_eve' ? 'summit_eve' : 'deep_truth';
    let pool = floorStories.relicClues[key];
    if (!Array.isArray(pool) || !pool.length) pool = floorStories.relicClues.default || [];
    if (!Array.isArray(pool) || !pool.length) return [];
    const seed = `${relicKey || 'relic'}:${f}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return [pool[hash % pool.length]];
}

function writeStoryLines(title, lines) {
    const arr = Array.isArray(lines) ? lines.filter(Boolean) : [];
    if (!arr.length) return;
    const safeTitle = escapeHtml(title || '기억');
    const body = arr.map((line) => `<span style="display:block;margin-top:3px;">${escapeHtml(line)}</span>`).join('');
    writeLog(`<span style="color:#9b59b6;font-weight:800;">[${safeTitle}]</span> ${body}`);
}

function markStorySeen(slotId, flag, lines) {
    if (!slotId || !flag || typeof MetaRPG === 'undefined') return false;
    const m = MetaRPG.loadMeta();
    const slot = m.slots.find((s) => s.id === slotId);
    if (!slot) return false;
    slot.storyFlags = slot.storyFlags || {};
    if (slot.storyFlags[flag]) return false;
    slot.storyFlags[flag] = Date.now();
    slot.storyLog = Array.isArray(slot.storyLog) ? slot.storyLog : [];
    slot.storyLog.push({
        flag,
        at: Date.now(),
        floor: typeof floor !== 'undefined' ? floor : 0,
        lines: Array.isArray(lines) ? lines.slice(0, 6) : [],
    });
    if (slot.storyLog.length > 80) slot.storyLog = slot.storyLog.slice(-80);
    MetaRPG.saveMeta(m);
    return true;
}

function checkStoryMilestone(f) {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return false;
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return false;
    const st = ensurePlayerStoryState(slot);
    const def = typeof getStoryMilestoneDef === 'function' ? getStoryMilestoneDef(floorNum, st) : null;
    if (!def || !Array.isArray(def.lines) || !def.lines.length) return false;
    const flag = `storyData:${floorNum}:${def.key || def.route || 'common'}`;
    if (!markStorySeen(slot.id, flag, def.lines)) return false;
    if (def.trigger === 'inner_monologue') {
        player.storyMonologueUnlocked = true;
    }
    if (def.titleOverride) {
        player.storyTitle = def.titleOverride;
    } else {
        const title = typeof getStoryTitleForState === 'function' ? getStoryTitleForState(st, floorNum) : null;
        if (title) player.storyTitle = title;
    }
    syncPlayerStoryStateToMeta();
    writeStoryLines(def.title || `${floorNum}층 기억`, def.lines);
    if (def.trigger === 'inner_monologue') {
        writeLog('<span style="color:#9b59b6;font-weight:800;">[독백]</span> 내면 독백 분기 시스템 활성화.');
    }
    if (def.titleOverride) {
        writeLog(`<span style="color:#f1c40f;font-weight:800;">[타이틀]</span> ${escapeHtml(def.titleOverride)}로 변화.`);
    }
    return true;
}

function emitRunStartStory(slot) {
    if (!slot) return;
    const race = getRaceStoryDef(slot.raceKey);
    const cls = getClassStoryDef(slot.classKey);
    const lines = [
        ...((race && race.fragments && race.fragments.runStart) || []),
        ...((cls && cls.intro) || []),
    ];
    if (!lines.length) return;
    if (!markStorySeen(slot.id, `runStart:${slot.raceKey || 'none'}:${slot.classKey || slot.jobKey}`, lines)) return;
    const raceName = race ? race.name : '기억';
    const className = cls ? cls.name : jobBase[slot.jobKey] ? jobBase[slot.jobKey].name : '모험가';
    writeStoryLines(`${raceName} / ${className}`, lines);
}

function emitFloorStory(f) {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return;
    const race = getRaceStoryDef(slot.raceKey);
    const cls = getClassStoryDef(slot.classKey);
    const promo = getPromotionStoryDef(player.name);
    const globalStory = getGlobalFloorStoryDef(f);
    const lines = [
        ...((globalStory && globalStory.lines) || []),
        ...((race && race.fragments && race.fragments.floorMilestones && race.fragments.floorMilestones[f]) || []),
        ...((cls && cls.floorMilestones && cls.floorMilestones[f]) || []),
        ...((promo && promo.floorMilestones && promo.floorMilestones[f]) || []),
    ];
    if (!lines.length) return;
    const globalKey = globalStory ? globalStory.key : 'personal';
    if (!markStorySeen(slot.id, `floor:${f}:${globalKey}:${slot.raceKey || 'none'}:${slot.classKey || slot.jobKey}:${player.name}`, lines)) return;
    writeStoryLines(globalStory ? globalStory.title : `${f}층 기억`, lines);
}

function emitPromotionStory(promotionName) {
    if (!player || !player.metaSlotId || !promotionName) return;
    const promo = getPromotionStoryDef(promotionName);
    const lines = (promo && promo.intro) || [];
    if (!lines.length) return;
    if (!markStorySeen(player.metaSlotId, `promotion:${promotionName}`, lines)) return;
    writeStoryLines(`${promotionName} 각성`, lines);
}

function emitRelicStory(it) {
    if (!player || !player.metaSlotId || !it) return;
    const slot = typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null;
    if (!slot) return;
    const race = getRaceStoryDef(slot.raceKey);
    const cls = getClassStoryDef(slot.classKey);
    const relicKey = it.effect || it.name || 'unknown';
    const raceRelic = race && race.fragments && race.fragments.relic;
    const classRelic = cls && cls.relic;
    const storyBand = getGlobalFloorStoryBand(floor);
    const lines = [
        ...getRelicStoryClueLines(relicKey),
        (raceRelic && (raceRelic[relicKey] || raceRelic.default)) || '',
        (classRelic && (classRelic[relicKey] || classRelic.default)) || '',
    ].filter(Boolean);
    if (!lines.length) return;
    if (!markStorySeen(slot.id, `relic:${relicKey}:${storyBand ? storyBand.key : 'early'}`, lines)) return;
    writeStoryLines('유물 기억', lines);
}

function emitFinalBossOpeningStory() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    if (Math.floor(safeNum(floor, 1)) !== 100) return;
    const lines = typeof floorStories !== 'undefined' && Array.isArray(floorStories.finalBossOpening)
        ? floorStories.finalBossOpening
        : [];
    if (lines.length && markStorySeen(player.metaSlotId, 'finalBossOpening:100', lines)) {
        writeStoryLines('100층 종착지', lines);
    }
    checkStoryMilestone(100);
}

function getIntroMemoryChoiceDef(memoryKey) {
    if (typeof introMemoryChoices === 'undefined') return null;
    return introMemoryChoices[memoryKey] || null;
}

function ensurePrologueScreen() {
    let screen = document.getElementById('prologue-screen');
    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'prologue-screen';
        screen.style.cssText =
            'position:fixed;inset:0;z-index:12000;background:radial-gradient(circle at 50% 35%,#221510 0%,#09090d 48%,#020203 100%);color:#e8e0d8;display:flex;align-items:center;justify-content:center;padding:22px;box-sizing:border-box;';
        document.body.appendChild(screen);
    }
    screen.style.display = 'flex';
    return screen;
}

function setMainUiHiddenForPrologue(hidden) {
    const targets = [
        document.querySelector('.container'),
        document.getElementById('log'),
    ].filter(Boolean);
    targets.forEach((el) => {
        if (hidden) {
            if (!Object.prototype.hasOwnProperty.call(el.dataset, 'prePrologueDisplay')) {
                el.dataset.prePrologueDisplay = el.style.display || '';
            }
            el.style.display = 'none';
            return;
        }
        if (Object.prototype.hasOwnProperty.call(el.dataset, 'prePrologueDisplay')) {
            el.style.display = el.dataset.prePrologueDisplay;
            delete el.dataset.prePrologueDisplay;
        } else {
            el.style.display = '';
        }
    });
}

function closePrologueScreen() {
    const screen = document.getElementById('prologue-screen');
    if (screen) screen.remove();
    setMainUiHiddenForPrologue(false);
}

function waitForPrologueDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms || 0)));
}

function applyTutorialBattleFadeIn() {
    const battle = document.getElementById('battle-area');
    if (!battle) return;
    battle.classList.remove('tutorial-battle-fade-in');
    void battle.offsetWidth;
    battle.classList.add('tutorial-battle-fade-in');
    setTimeout(() => {
        if (battle) battle.classList.remove('tutorial-battle-fade-in');
    }, 720);
}

async function playPrologueBattleBridge(startRunFn) {
    const screen = ensurePrologueScreen();
    setMainUiHiddenForPrologue(true);
    screen.classList.remove('prologue-battle-bridge-out');
    screen.classList.add('prologue-battle-bridge');
    screen.innerHTML = `
        <div class="prologue-battle-bridge-card">
            <p>동굴 저편에서 침을 흘리는 괴수의 발자국 소리가 다가옵니다...</p>
            <b>첫 번째 생존 전투 시작.</b>
        </div>`;
    await waitForPrologueDelay(1000);
    setMainUiHiddenForPrologue(false);
    const ok = typeof startRunFn === 'function' ? startRunFn() : true;
    applyTutorialBattleFadeIn();
    screen.classList.add('prologue-battle-bridge-out');
    await waitForPrologueDelay(360);
    if (screen && screen.parentNode) screen.remove();
    setMainUiHiddenForPrologue(false);
    return ok;
}

function buildPrologueChoiceButton(label, handler, tone) {
    const border = tone || '#6b5848';
    return `<button type="button" onclick="${handler}" style="width:100%;background:rgba(5,7,10,0.72);border:1px solid ${border};color:#f2ece6;padding:14px 16px;border-radius:6px;text-align:left;font-size:0.95em;font-weight:800;line-height:1.45;cursor:pointer;box-shadow:0 0 0 1px rgba(255,255,255,0.02) inset;">${escapeHtml(label)}</button>`;
}

let currentPhase = 'memory';
let selectedPrologueMemoryKey = null;

function setProloguePhase(nextPhase, payload) {
    currentPhase = nextPhase || 'memory';
    if (payload && Object.prototype.hasOwnProperty.call(payload, 'memoryKey')) {
        selectedPrologueMemoryKey = payload.memoryKey || null;
    }
    renderProloguePhase();
}

function buildProloguePanelHtml({ eyebrow, text, actionsHtml, mutedText }) {
    return `
        <div style="width:min(700px,100%);">
            ${eyebrow ? `<div style="color:#8f8278;font-size:0.78em;letter-spacing:0;margin-bottom:12px;">${escapeHtml(eyebrow)}</div>` : ''}
            ${mutedText ? `<p style="font-size:0.9em;line-height:1.65;margin:0 0 18px;color:#8f8278;">${escapeHtml(mutedText)}</p>` : ''}
            <p class="prologue-fade-text" style="font-size:1.1em;line-height:1.88;margin:0 0 26px;color:#efe6dc;font-weight:800;animation:prologueFadeIn 520ms ease-out both;">${escapeHtml(text || '')}</p>
            ${actionsHtml ? `<div style="display:flex;flex-direction:column;gap:11px;animation:prologueFadeIn 520ms ease-out 140ms both;">${actionsHtml}</div>` : ''}
        </div>`;
}

function renderProloguePhase() {
    const screen = ensurePrologueScreen();
    setMainUiHiddenForPrologue(true);
    if (!document.getElementById('prologue-fade-style')) {
        const style = document.createElement('style');
        style.id = 'prologue-fade-style';
        style.textContent = '@keyframes prologueFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
        document.head.appendChild(style);
    }

    if (currentPhase === 'memory') {
        selectedPrologueMemoryKey = null;
        const text = typeof introPrologueText !== 'undefined' ? introPrologueText.memoryPrompt : '';
        const choices = typeof introMemoryChoices !== 'undefined' ? Object.keys(introMemoryChoices) : [];
        const actionsHtml = choices
            .map((key) => {
                const c = introMemoryChoices[key];
                const race = getRaceStoryDef(c.raceKey);
                return buildPrologueChoiceButton(
                    c.label,
                    `choosePrologueMemory('${escapeJsSingleQuoteString(key)}')`,
                    race && race.color ? race.color : '#6b5848'
                );
            })
            .join('');
        screen.innerHTML = buildProloguePanelHtml({ text, actionsHtml });
        return;
    }

    const memory = getIntroMemoryChoiceDef(selectedPrologueMemoryKey);
    const race = memory ? getRaceStoryDef(memory.raceKey) : null;
    if (!memory || !race) {
        currentPhase = 'memory';
        selectedPrologueMemoryKey = null;
        renderProloguePhase();
        return;
    }

    if (currentPhase === 'raceStory') {
        const actionsHtml = buildPrologueChoiceButton('눈을 뜬다', 'advanceProloguePhase()', race.color || '#6b5848');
        screen.innerHTML = buildProloguePanelHtml({
            text: race.past,
            actionsHtml,
        });
        return;
    }

    if (currentPhase === 'danger') {
        const text = typeof introPrologueText !== 'undefined' ? introPrologueText.dangerPrompt : '';
        const actionsHtml = buildPrologueChoiceButton('주변의 무기를 살핀다', 'advanceProloguePhase()', '#9b6a4a');
        screen.innerHTML = buildProloguePanelHtml({ text, actionsHtml });
        return;
    }

    if (currentPhase === 'weapon') {
        const text = typeof introPrologueText !== 'undefined' ? introPrologueText.weaponPrompt : '';
        const weaponKeys = typeof introWeaponChoices !== 'undefined' ? Object.keys(introWeaponChoices) : [];
        const actionsHtml = weaponKeys
            .map((key) => {
                const w = introWeaponChoices[key];
                return buildPrologueChoiceButton(
                    w.label,
                    `chooseIntroWeapon('${escapeJsSingleQuoteString(selectedPrologueMemoryKey)}','${escapeJsSingleQuoteString(key)}')`,
                    w.color || '#6b5848'
                );
            })
            .join('');
        screen.innerHTML = buildProloguePanelHtml({ text, actionsHtml });
    }
}

function canCreateCharacterInCurrentFile() {
    if (typeof MetaRPG === 'undefined') return false;
    const m = MetaRPG.loadMeta();
    if (m.slots.length < MetaRPG.MAX_SLOTS) return true;
    const n = MetaRPG.getSaveFileSlotCount ? MetaRPG.getSaveFileSlotCount() : 3;
    for (let fi = 0; fi < n; fi++) {
        const pm = MetaRPG.peekMetaAtFileIndex(fi);
        if (pm && pm.slots && pm.slots.length < MetaRPG.MAX_SLOTS) {
            if (
                confirm(
                    `이 저장 파일의 캐릭터 슬롯이 가득 찼습니다.\n저장 파일 ${fi + 1}번에는 빈 슬롯이 있습니다.\n해당 파일로 전환할까요?`
                )
            ) {
                MetaRPG.setActiveSaveFileIndex(fi);
                showPreGameScreen();
            }
            return false;
        }
    }
    const ans = prompt(
        `모든 저장 파일에서 캐릭터 슬롯이 가득 찼습니다.\n비우고 새로 만들 저장 파일 번호를 입력하세요 (1~${n}).\n※ 해당 파일의 메타·캐릭터 데이터가 삭제됩니다. 취소하려면 취소를 누르세요.`
    );
    if (ans == null) return false;
    const num = parseInt(String(ans).trim(), 10);
    if (!Number.isFinite(num) || num < 1 || num > n) {
        alert('1~' + n + ' 사이 숫자를 입력해 주세요.');
        return false;
    }
    const idx = num - 1;
    if (!confirm(`저장 파일 ${num}번을 완전히 비우고 새 캐릭터를 만듭니다. 계속할까요?`)) return false;
    MetaRPG.clearSaveFile(idx);
    MetaRPG.setActiveSaveFileIndex(idx);
    return true;
}

function startNewCharacterPrologueFlow() {
    if (typeof MetaRPG === 'undefined') return;
    if (!canCreateCharacterInCurrentFile()) return;
    ensurePrologueScreen();
    setMainUiHiddenForPrologue(true);
    setProloguePhase('memory', { memoryKey: null });
}

let prologueBattleBridgeActive = false;

async function confirmNewCharacterFromPrologue(memoryKey, weaponKey) {
    if (typeof MetaRPG === 'undefined') return;
    if (prologueBattleBridgeActive) return;
    const memory = getIntroMemoryChoiceDef(memoryKey);
    const race = memory ? getRaceStoryDef(memory.raceKey) : null;
    const weapon = getIntroWeaponDef(weaponKey);
    if (!memory || !race || !weapon) return setProloguePhase('memory', { memoryKey: null });
    const className = weapon.className || (jobBase[weapon.jobKey] && jobBase[weapon.jobKey].name) || '생존자';
    const r = MetaRPG.createCharacter(`${race.name} ${className}`, weapon.jobKey, {
        raceKey: memory.raceKey,
        memoryKey,
        originBaseJobKey: memory.baseJobKey,
        weaponKey,
        classKey: weapon.classKey,
    });
    if (!r.ok) {
        alert(r.msg || '생성 실패');
        return;
    }
    prologueBattleBridgeActive = true;
    try {
        await playPrologueBattleBridge(() => initRunFromMetaSlot({ forceTutorialBattle: true }));
    } finally {
        prologueBattleBridgeActive = false;
    }
}

function hasOpenCharacterSlot(meta) {
    if (typeof MetaRPG === 'undefined') return true;
    const m = meta || MetaRPG.loadMeta();
    return !m || !Array.isArray(m.slots) || m.slots.length < MetaRPG.MAX_SLOTS;
}

function buildNewAdventureStartHtml(extraClass) {
    const className = ['new-adventure-entry', extraClass || ''].filter(Boolean).join(' ');
    return `
        <div id="new-adventure-entry" class="${className}">
            <button id="new-adventure-start-btn" class="new-adventure-start-btn" type="button" onclick="startNewCharacterPrologue()">새로운 모험 시작</button>
        </div>`;
}

function ensureHubCreateEntryRendered() {
    const startArea = document.getElementById('start-area');
    if (!startArea) return;
    if (startArea.querySelector('#new-adventure-start-btn')) return;
    if (!hasOpenCharacterSlot()) return;
    const fallback = document.createElement('div');
    fallback.innerHTML = buildNewAdventureStartHtml('new-adventure-entry-fallback');
    const entry = fallback.firstElementChild;
    if (entry) startArea.appendChild(entry);
}

function showPreGameScreen() {
    const lingeringPrologue = document.getElementById('prologue-screen');
    if (lingeringPrologue) lingeringPrologue.remove();
    setMainUiHiddenForPrologue(false);
    exitBattleLayout();
    migrateGlobalPermaIntoSlotOnce();
    if (typeof MetaRPG !== 'undefined') {
        const mx = MetaRPG.loadMeta();
        mx.slots.forEach((s) => MetaRPG.recalcTechBonus(s));
        MetaRPG.saveMeta(mx);
    }
    const globalUnlocked = getUnlockedFloors(null);
    const warriorUnlocked = getUnlockedFloors('워리어');
    const hunterUnlocked = getUnlockedFloors('헌터');
    const wizardUnlocked = getUnlockedFloors('마법사');
    const m = typeof MetaRPG !== 'undefined' ? MetaRPG.loadMeta() : { slots: [] };
    const esc = (t) =>
        String(t)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    const slotSnapHints = [];
    if (typeof MetaRPG !== 'undefined') {
        m.slots.forEach((s) => {
            const sn = MetaRPG.getRunSnapshot(s.id);
            if (sn && sn.floor) slotSnapHints.push(`<b>${escapeHtml(getSlotClassDisplayName(s))}</b> ${sn.floor}층`);
        });
    }
    const canStartNewAdventure = hasOpenCharacterSlot(m);
    const slotRows =
        m.slots.length === 0
            ? `<div class="empty-character-slot">
                <p style="color:#888;font-size:0.85em;margin:0 0 12px;">저장된 캐릭터가 없습니다. 아래에서 <b>새 모험가</b>를 만들어 주세요.</p>
                ${canStartNewAdventure ? buildNewAdventureStartHtml('new-adventure-entry-empty') : ''}
            </div>`
            : m.slots
                  .map((s) => {
                      MetaRPG.recalcTechBonus(s);
                      const jb = jobBase[s.jobKey] || { name: '?', color: '#888' };
                      const jobDisplayName = getSlotClassDisplayName(s);
                      const race = getRaceStoryDef(s.raceKey);
                      const weapon = getIntroWeaponDef(s.introWeaponKey);
                      const cls = getClassStoryDef(s.classKey);
                      const techFree = '테크 자유';
                      const rct = s.reincarnationCount || 0;
                      const gen = rct + 1;
                      const rescuedCount = Array.isArray(s.rescuedItems) ? s.rescuedItems.length : 0;
                      const rescueBadge =
                          rescuedCount > 0 ? ` · 구조 장비 <b style="color:#2ed573;">${rescuedCount}</b>개 보존` : '';
                      const rebCost = MetaRPG.getRebirthGoldCost(s);
                      const rebNeedFloor = MetaRPG.getRebirthMinFloor ? MetaRPG.getRebirthMinFloor() : 500;
                      const bestFloor = Math.max(1, s.bestFloor || 1);
                      const canReb = rct < 3;
                      const rebBtn = canReb
                          ? `<button type="button" onclick="event.stopPropagation();reincarnateFromHub('${s.id}')" style="background:#c0392b;color:#fff;padding:8px 12px;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.82em;">🔁 환생 (${rebCost}G)</button>`
                          : `<span style="color:#555;font-size:0.75em;">환생 3/3</span>`;
                      const lifeBadge =
                          gen > 1
                              ? `<span style="color:#9b59b6;font-weight:700;">${jb.name} ${gen}세</span> · `
                              : '';
                      return `<div style="background:#111;border:1px solid #444;border-radius:10px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                        <div style="text-align:left;">
                            <div style="color:#f1c40f;font-weight:700;">${escapeHtml(jobDisplayName)} ${gen > 1 ? `<span style="color:#aaa;font-size:0.85em;">(인생 ${gen}회차)</span>` : ''}</div>
                            <div style="color:#888;font-size:0.78em;">${race ? `종족 ${race.name} · ` : ''}${weapon ? `무기 ${weapon.label} · ` : ''}직업 ${escapeHtml(jobDisplayName)}${cls ? `(${cls.name})` : ''} · ${lifeBadge}${techFree} · 메타 Lv.${s.level || 1} · 최고 ${bestFloor}층 · 환생 ${rct}/3${rescueBadge}</div>
                            <div style="color:#666;font-size:0.72em;">환생 조건: ${rebNeedFloor}층 이상 도달 + 골드 필요</div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        <button type="button" onclick="resumeMetaSlot('${s.id}')" style="background:#2ed573;color:#111;padding:8px 16px;font-weight:700;border:none;border-radius:8px;cursor:pointer;">이어하기</button>
                        <button type="button" onclick="requestDeleteSaveFile(${typeof MetaRPG !== 'undefined' && typeof MetaRPG.getActiveFileIndex === 'function' ? MetaRPG.getActiveFileIndex() : 0})" style="background:#2a1111;color:#ff8080;padding:8px 12px;font-weight:800;border:1px solid #7f2b2b;border-radius:8px;cursor:pointer;font-size:0.82em;">파일 삭제</button>
                        ${MetaRPG.getRunSnapshot(s.id) ? `<button type="button" onclick="event.stopPropagation();deleteRunSnapshotForSlot('${s.id}')" style="background:#34495e;color:#ecf0f1;padding:8px 12px;font-weight:700;border:none;border-radius:8px;cursor:pointer;font-size:0.82em;">🗑 저장 삭제</button>` : ''}
                        ${rebBtn}
                        </div>
                    </div>`;
                  })
                  .join('');
    let saveFileBar = '';
    if (typeof MetaRPG !== 'undefined' && MetaRPG.peekMetaAtFileIndex) {
        const cur = typeof MetaRPG.getActiveFileIndex === 'function' ? MetaRPG.getActiveFileIndex() : 0;
        const n = MetaRPG.getSaveFileSlotCount ? MetaRPG.getSaveFileSlotCount() : 3;
        const parts = [];
        for (let fi = 0; fi < n; fi++) {
            const pm = MetaRPG.peekMetaAtFileIndex(fi);
            const cnt = pm.slots ? pm.slots.length : 0;
            const g = Math.max(0, safeNum(pm.savedGold, 0));
            const active = fi === cur ? ' (현재)' : '';
            parts.push(
                `<button type="button" onclick="switchActiveSaveFile(${fi})" style="background:${fi === cur ? '#2a2a1a' : '#111'};border:1px solid ${fi === cur ? '#f1c40f' : '#444'};color:${fi === cur ? '#f1c40f' : '#888'};padding:8px 10px;border-radius:8px;cursor:pointer;font-size:0.78em;font-weight:700;">파일 ${fi + 1}${active}<br><span style="font-weight:400;color:#888;">캐릭 ${cnt} · ${g}G</span></button>`
            );
        }
        saveFileBar = `<div style="margin-bottom:14px;padding:12px;background:#0d0d12;border:1px solid #333;border-radius:10px;"><div style="color:#f1c40f;font-weight:700;margin-bottom:8px;font-size:0.9em;">💾 저장 파일 (최대 3)</div><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">${parts.join('')}</div><p style="color:#666;font-size:0.72em;margin:8px 0 0;line-height:1.45;">다른 파일을 불러오려면 위 버튼을 누르세요. 모든 파일이 가득 차면 새 캐릭터 생성 시 <b>비울 파일</b>을 묻습니다.</p></div>`;
    }
    const newCharacterEntryHtml =
        m.slots.length > 0 && canStartNewAdventure ? buildNewAdventureStartHtml('new-adventure-entry-secondary') : '';
    document.getElementById('start-area').style.display = 'block';
    document.getElementById('battle-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'none';
    try {
    document.getElementById('start-area').innerHTML = `
        <div style="text-align:center; margin-bottom:16px;">
            <h2 style="color:#f1c40f; margin-bottom:5px;">⚔️ 로그라이트 허브</h2>
            <p style="color:#9b59b6;font-size:0.88em;margin:0 0 8px;font-weight:700;">시즌 1</p>
            ${saveFileBar}
            <p style="color:#888; font-size:0.85em;">무한 층 · 베이스캠프에서만 영구 성장</p>
            ${globalUnlocked.length > 0 ? `<p style="color:#f1c40f;font-size:0.8em;">🔓 공용 해금: ${globalUnlocked.join(', ')}층</p>` : ''}
            ${warriorUnlocked.length > 0 ? `<p style="color:#ff4757;font-size:0.8em;">🔓 워리어: ${warriorUnlocked.join(', ')}층</p>` : ''}
            ${hunterUnlocked.length > 0 ? `<p style="color:#2ed573;font-size:0.8em;">🔓 헌터: ${hunterUnlocked.join(', ')}층</p>` : ''}
            ${wizardUnlocked.length > 0 ? `<p style="color:#1e90ff;font-size:0.8em;">🔓 마법사: ${wizardUnlocked.join(', ')}층</p>` : ''}
        </div>
        <div style="max-width:560px;margin:0 auto 16px;">
            <h4 style="color:#f1c40f;margin:0 0 8px 0;">💾 캐릭터 슬롯 (최대 ${typeof MetaRPG !== 'undefined' ? MetaRPG.MAX_SLOTS : 4})</h4>
            ${slotRows}
        </div>
        ${newCharacterEntryHtml}
        <div style="max-width:560px;margin:0 auto 16px;padding:14px;background:#111;border:1px solid #333;border-radius:10px;text-align:left;">
            <h4 style="color:#f1c40f;margin:0 0 10px;text-align:center;">💾 저장 / 불러오기</h4>
            ${slotSnapHints.length ? `<p style="color:#2ed573;font-size:0.82em;margin:0 0 10px;line-height:1.45;">💾 저장된 런: ${slotSnapHints.join(' · ')} — 캐릭터 <b>이어하기</b>로 복구됩니다.</p>` : '<p style="color:#555;font-size:0.8em;margin:0 0 8px;">저장된 런 없음 — 전투 중 <b>💾 저장 후 메인</b>으로 진행을 남기세요.</p>'}
            <button type="button" onclick="exportFullSave()" style="width:100%;margin-bottom:8px;padding:10px;background:#1e90ff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;">📥 전체 데이터 내보내기 (JSON 백업)</button>
            <label style="display:block;color:#888;font-size:0.82em;">파일에서 복원:
              <input type="file" accept=".json,application/json" style="width:100%;margin-top:6px;" onchange="importFullSave(this)">
            </label>
        </div>
        <p style="color:#666;font-size:0.75em;max-width:520px;margin:0 auto;line-height:1.5;">※ 승리 시 <b>확인 없이</b> 다음 층으로 진행합니다. 21층 이상은 <b>상점</b>에서만 「이 층 훈련」/「등반 계속」을 고를 수 있습니다. <b>30층 이상 상점</b>에서만 베이스캠프(연구·영구 강화)에 들어갈 수 있으며, <b>런 골드</b>로 구매합니다. 메인으로 나갈 때는 <b>저장 후 메인</b>을 권장합니다.</p>`;
    } catch (err) {
        console.error('[허브]', err);
        document.getElementById('start-area').innerHTML =
            '<p style="color:#ff6b6b;padding:20px;text-align:center;">허브를 불러오는 중 오류가 났습니다. 페이지를 새로고침 해 주세요.<br><span style="color:#888;font-size:0.85em;">' +
            String(err && err.message ? err.message : err) +
            '</span></p>';
    }
    ensureHubCreateEntryRendered();
}

window.resumeMetaSlot = (slotId) => {
    if (typeof MetaRPG === 'undefined') return;
    if (!MetaRPG.setActiveSlot(slotId)) return;
    const snap = MetaRPG.getRunSnapshot(slotId);
    if (snap) loadRunFromMetaSnapshot(snap);
    else initRunFromMetaSlot();
};

/** 허브: 저장 파일 1~3 전환 */
window.switchActiveSaveFile = function switchActiveSaveFile(idx) {
    if (typeof MetaRPG === 'undefined' || typeof MetaRPG.setActiveSaveFileIndex !== 'function') return;
    if (!MetaRPG.setActiveSaveFileIndex(idx)) return;
    showPreGameScreen();
};
window.requestDeleteSaveFile = function requestDeleteSaveFile(idx) {
    if (typeof MetaRPG === 'undefined') return;
    const fileNo = idx + 1;
    const ok = confirm(`저장 파일 ${fileNo}번을 삭제할까요?\n삭제하면 해당 파일의 캐릭터/보존 골드가 모두 사라집니다.`);
    if (!ok) return;
    const ok2 = confirm(`정말로 저장 파일 ${fileNo}번을 삭제하시겠습니까?\n(복구 불가)`);
    if (!ok2) return;
    MetaRPG.clearSaveFile(idx);
    if (typeof MetaRPG.setActiveSaveFileIndex === 'function') MetaRPG.setActiveSaveFileIndex(idx);
    showPreGameScreen();
};

window.reincarnateFromHub = function reincarnateFromHub(slotId) {
    if (typeof MetaRPG === 'undefined') return;
    const slot = MetaRPG.getSlotById(slotId);
    if (!slot) return;
    const cost = MetaRPG.getRebirthGoldCost(slot);
    const needFloor = MetaRPG.getRebirthMinFloor ? MetaRPG.getRebirthMinFloor() : 500;
    const bestFloor = Math.max(1, slot.bestFloor || 1);
    if ((slot.reincarnationCount || 0) >= 3) return alert('환생은 최대 3회입니다.');
    if (bestFloor < needFloor) return alert(`환생 조건 미달: 최고 ${bestFloor}층 (필요 ${needFloor}층)`);
    if (!confirm(`환생: ${cost}G를 지불하고 이 캐릭터의 베이스캠프 영구강화·퀘스트 보너스를 초기화합니다.\n조건: 최고 ${needFloor}층 이상. 환생 시 공격/방어/치명 배율 +10% 누적.`)) return;
    MetaRPG.setActiveSlot(slotId);
    const r = MetaRPG.applyReincarnation(slotId, { payGold: true });
    if (!r.ok) return alert(r.msg);
    alert('환생 완료. 「이어하기」로 새 런을 시작하세요.');
    try {
        showPreGameScreen();
    } catch (e) {
        console.error(e);
        alert('허브 표시 중 오류가 났습니다. 새로고침 해 주세요.');
        location.reload();
    }
};

window.startNewCharacterPrologue = function startNewCharacterPrologue() {
    startNewCharacterPrologueFlow();
};

window.choosePrologueMemory = function choosePrologueMemory(memoryKey) {
    setProloguePhase('raceStory', { memoryKey });
};

window.advanceProloguePhase = function advanceProloguePhase() {
    if (currentPhase === 'raceStory') {
        setProloguePhase('danger', { memoryKey: selectedPrologueMemoryKey });
        return;
    }
    if (currentPhase === 'danger') {
        setProloguePhase('weapon', { memoryKey: selectedPrologueMemoryKey });
    }
};

window.chooseIntroWeapon = function chooseIntroWeapon(memoryKey, weaponKey) {
    return confirmNewCharacterFromPrologue(memoryKey, weaponKey);
};

window.openTechLinePicker = (jobKey) => {
    if (typeof MetaRPG === 'undefined') return;
    if (!jobKey || !jobBase[jobKey]) {
        showPreGameScreen();
        return;
    }
    const tryCreate = () => confirmNewCharacter(jobKey);
    if (MetaRPG.loadMeta().slots.length >= MetaRPG.MAX_SLOTS) {
        const n = MetaRPG.getSaveFileSlotCount ? MetaRPG.getSaveFileSlotCount() : 3;
        for (let fi = 0; fi < n; fi++) {
            const pm = MetaRPG.peekMetaAtFileIndex(fi);
            if (pm && pm.slots && pm.slots.length < MetaRPG.MAX_SLOTS) {
                if (
                    confirm(
                        `이 저장 파일의 캐릭터 슬롯이 가득 찼습니다.\n저장 파일 ${fi + 1}번에는 빈 슬롯이 있습니다.\n해당 파일로 전환할까요?`
                    )
                ) {
                    MetaRPG.setActiveSaveFileIndex(fi);
                    showPreGameScreen();
                }
                return;
            }
        }
        const ans = prompt(
            `모든 저장 파일에서 캐릭터 슬롯이 가득 찼습니다.\n비우고 새로 만들 저장 파일 번호를 입력하세요 (1~${n}).\n※ 해당 파일의 메타·캐릭터 데이터가 삭제됩니다. 취소하려면 취소를 누르세요.`
        );
        if (ans == null) return;
        const num = parseInt(String(ans).trim(), 10);
        if (!Number.isFinite(num) || num < 1 || num > n) {
            alert('1~' + n + ' 사이 숫자를 입력해 주세요.');
            return;
        }
        const idx = num - 1;
        if (!confirm(`저장 파일 ${num}번을 완전히 비우고 새 캐릭터를 만듭니다. 계속할까요?`)) return;
        MetaRPG.clearSaveFile(idx);
        MetaRPG.setActiveSaveFileIndex(idx);
        tryCreate();
        return;
    }
    tryCreate();
};

window.deleteRunSnapshotForSlot = function deleteRunSnapshotForSlot(slotId) {
    if (typeof MetaRPG === 'undefined') return;
    const existing = document.getElementById('delete-save-confirm-overlay');
    if (existing) existing.remove();

    const ov = document.createElement('div');
    ov.id = 'delete-save-confirm-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:10070;display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML = `
<div style="background:#1a1a2e;border:2px solid #e74c3c;border-radius:14px;padding:22px 20px;max-width:420px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
  <h3 style="color:#e74c3c;margin:0 0 10px;font-size:1.15em;">저장 데이터 삭제</h3>
  <p style="color:#ddd;font-size:0.9em;line-height:1.55;margin:0 0 16px;text-align:left;">
    이 캐릭터의 <b>저장된 런(이어하기) 파일</b>이 <b>완전히 삭제</b>됩니다.<br>
    또한 <b>메타 레벨·EXP가 1 / 0으로 초기화</b>됩니다.<br>
    <span style="color:#f39c12;">삭제 후에는 복구할 수 없습니다.</span> 정말 삭제할까요?
  </p>
  <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
    <button type="button" id="del-save-cancel" style="background:#555;color:#eee;padding:10px 18px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.95em;">취소</button>
    <button type="button" id="del-save-confirm" style="background:#c0392b;color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.95em;">예, 삭제합니다</button>
  </div>
        </div>`;
    document.body.appendChild(ov);

    const close = () => {
        ov.remove();
        document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => {
        if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    ov.querySelector('#del-save-cancel').onclick = close;
    ov.onclick = (e) => {
        if (e.target === ov) close();
    };
    ov.querySelector('#del-save-confirm').onclick = () => {
        close();
        MetaRPG.wipeSavedRunAndResetMetaLevel(slotId);
        showPreGameScreen();
    };
};

function confirmNewCharacter(jobKey) {
    if (typeof MetaRPG === 'undefined') return;
    const name = prompt('캐릭터 이름을 입력하세요 (비우면 무명):', '모험가');
    const r = MetaRPG.createCharacter(name || '무명', jobKey);
    if (!r.ok) {
        alert(r.msg || '생성 실패');
        return;
    }
    initRunFromMetaSlot({ forceTutorialBattle: true });
}

function initRunFromMetaSlot(options) {
    if (typeof MetaRPG === 'undefined') return false;
    const opt = options && typeof options === 'object' ? options : {};
    const m = MetaRPG.loadMeta();
    const slot = m.slots.find((s) => s.id === m.activeSlotId);
    if (!slot) return false;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(MetaRPG.loadMeta());
    const jb = slot.jobKey;
    const job = jobBase[jb];
    if (!job) return false;
    const tb = slot.techBonus || { hp: 0, atk: 0, def: 0, acc: 0, crit: 0, critMult: 0 };
    const lv = slot.level || 1;
    const lb = MetaRPG.getLevelRuntimeBonus(lv);
    const rs = slot.rebirthStatBonus || { hp: 0, atk: 0, def: 0, acc: 0 };
    const fg = normalizePlayerFloorGrowth(slot.floorGrowth);
    const baseHp = job.hp + tb.hp + lb.hp + (rs.hp || 0) + fg.hp;
    const baseAtk = job.atk + tb.atk + lb.atk + (rs.atk || 0) + fg.atk;
    const baseDef = job.def + tb.def + lb.def + (rs.def || 0);
    const baseAcc = tb.acc + lb.acc + (rs.acc || 0);
    const rescuedItems = typeof MetaRPG.getRescuedItems === 'function' ? MetaRPG.getRescuedItems(slot.id) : [];
    rescuedItems.forEach((it) => {
        if (!it || it.type === 'merc') return;
        if (typeof applyOfficialStatsToEquipmentItem === 'function') applyOfficialStatsToEquipmentItem(it, { rebuildDesc: true });
        else if (typeof clampEquipmentItemStatsToRarityCaps === 'function') clampEquipmentItemStatsToRarityCaps(it);
    });
    clearSummonRunStorage();
    player = {
        ...job,
        curHp: baseHp,
        maxHp: baseHp,
        atk: baseAtk,
        def: baseDef,
        acc: baseAcc,
        crit: 1 + (tb.crit || 0),
        critMult: 1.8 + (tb.critMult || 0),
        divinePower: 0,
        divineGainMult: 1,
        prayerBonusFlat: 0,
        priestBlessed: false,
        chosenPriest: false,
        priestNextCrit: false,
        prayerVulnerableHits: 0,
        prayerCountThisTurn: 0,
        metaSlotId: slot.id,
        runLevel: lv,
        runExp: slot.exp || 0,
        items: rescuedItems,
        relics: [],
        extraAtk: 0,
        _relicGamblerDefSub: 0,
        potions: 3,
        extraDef: 0,
        unlockedSkill: null,
        ultStack: 0,
        ultMaxStack: 0,
        lifesteal: 0,
        hasRegenPotion: false,
        baseJob: job.name,
        raceKey: slot.raceKey || null,
        memoryKey: slot.memoryKey || null,
        originBaseJobKey: slot.originBaseJobKey || jb,
        classKey: slot.classKey || jb,
        introWeaponKey: slot.introWeaponKey || null,
        currentPromotion: slot.currentPromotion || null,
        tutorialBattleActive: !!opt.forceTutorialBattle,
        prologueLocked: !!opt.forceTutorialBattle,
        evolved: false,
        shieldEmpowered: false,
        summon: null,
        _awaitPlayerTurn: false,
        fieldMerc: null,
        mercCooldownTurns: 0,
        mercNextBattleDebuff: null,
        _mercBattleAtkDebuff: 0,
        mercReviveAt90Percent: false,
        _mercCooldownSkipOnce: false,
        mercCompanionKind: null,
        mercEvolution: null,
        mercEvolutionChosen: false,
        mercRegenTurns: 0,
        mercRegenAmount: 0,
        mercBattleTurnCount: 0,
        mercInventory: [],
        activeQuest: null,
        farmingStay: false,
        floorGrowth: fg,
        playerState: normalizeUiPlayerState(slot.playerState),
        tacticalSkills: uniqueTacticalSkillKeys(slot.tacticalSkills),
        tacticalSkillMilestonesClaimed: uniqueClaimedTacticalMilestones(slot.tacticalSkillMilestonesClaimed),
        tacticalSkillUses: {},
        tacticalFocusReady: false,
        tacticalParryReady: false,
        tacticalBarrierReady: false,
        shopRarityBoost: 0,
        freeShopCoupon: false,
        passiveContractHistory: [],
        hunterExposeStacks: 0,
        hunterExposeReady: false,
    };
    ensurePlayerRunProgressFields(slot);
    markPlayedJob(job.name);
    if (player.items.length && typeof fullResyncPlayerCombatStatsFromMetaAndInventory === 'function') {
        fullResyncPlayerCombatStatsFromMetaAndInventory();
        player.curHp = typeof getEffectiveMaxHp === 'function' ? getEffectiveMaxHp() : player.maxHp;
    } else {
        applyRebirthPctBonusToPlayer(slot);
    }
    recalcPlayerDivineGainMult();
    floor = 1;
    gold = 0;
    totalGoldEarned = 0;
    rerollCost = 10;
    shopVisitCount = 0;
    document.getElementById('start-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    const battleLog = document.getElementById('battle-log-strip');
    if (battleLog) battleLog.innerHTML = '';
    enterBattleLayout();
    loadCollection();
    emitRunStartStory(slot);
    if (player.items.length) {
        writeLog(`[구조] 베이스캠프에 보존된 장비 ${player.items.length}개를 장착한 채 1층부터 재등반합니다.`);
    }
    if (jb === 'MercenaryCaptain') {
        MetaRPG.markRunCheckpoint(slot.id);
        showMercCompanionPicker();
        return true;
    }
    if (opt.forceTutorialBattle) {
        window._encounterPhaseActive = false;
        window._encounterPhaseScene = null;
        hideEncounterPhaseUI();
        writeLog('[튜토리얼] 눈앞의 몬스터가 달려듭니다. 선택한 무기로 첫 전투를 시작합니다!');
        spawnEnemy();
        MetaRPG.markRunCheckpoint(slot.id);
        return true;
    }
    beginFloorEncounter();
    MetaRPG.markRunCheckpoint(slot.id);
    return true;
}

window.buyCampPermaNext = function buyCampPermaNext(key) {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const m = MetaRPG.loadMeta();
    const slot = m.slots.find((s) => s.id === player.metaSlotId);
    if (!slot) return;
    slot.campPerma = slot.campPerma || { hp: 0, atk: 0, def: 0, crit: 0, cm: 0 };
    const lv = slot.campPerma[key] || 0;
    const price = getCampPermaNextPrice(key, lv);
    if (gold < price) return writeLog('[영구] 런 골드 부족');
    gold -= price;
    slot.campPerma[key] = lv + 1;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(m);
    writeLog(`[영구] ${key} Lv.${lv + 1} 강화! (-${price}G)`);
    const ov = document.getElementById('base-camp-overlay');
    if (ov) {
        window.__baseCampScrollTop = ov.scrollTop;
        ov.remove();
        openBaseCampTech();
    } else {
    showPreGameScreen();
    }
};

/** 구 세이브 호환 */
window.buyPermUpgradeNext = (key) => buyCampPermaNext(key);
window.buyPermUpgrade = (id) => {
    const key = String(id).split('_')[0];
    if (['hp', 'atk', 'def', 'crit', 'cm'].includes(key)) buyCampPermaNext(key);
};

/** @deprecated v7 — 슬롯/테크 시스템 사용. 직접 호출 시 테크 선택으로 연결 */
window.selectJobAndStart = (job) => {
    openTechLinePicker(job);
};

function showMercCompanionPicker() {
    const overlay = document.createElement('div');
    overlay.id = 'merc-companion-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:10001;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:480px;width:92%;text-align:center;">
            <h2 style="color:#e67e22;margin-bottom:8px;">⚔️ 첫 동료 선택</h2>
            <p style="color:#aaa;font-size:0.88em;margin-bottom:18px;line-height:1.45;">단장은 직접 싸우기 어렵습니다. <b>워리어 · 헌터 · 마법사</b> 중 동료 용병 1명을 고르세요.</p>
            ${['워리어','헌터','마법사'].map((k) => {
                const b = mercCompanionBases[k];
                return `<div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:15px;margin-bottom:10px;cursor:pointer;" onclick="pickMercCompanion('${k}')" onmouseenter="this.style.borderColor='#e67e22'" onmouseleave="this.style.borderColor='#555'">
                    <b style="color:#e0e0e0;">${b.label}</b> <span style="color:#888;font-size:0.85em;">(${k})</span>
                    <p style="color:#666;font-size:0.78em;margin:6px 0 0;">기본 상성: ${b.affinityJob}</p>
                </div>`;
            }).join('')}
        </div>`;
    document.body.appendChild(overlay);
}

window.pickMercCompanion = (kind) => {
    if (!player || player.baseJob !== '용병단장') return;
    if (!['워리어','헌터','마법사'].includes(kind)) return;
    player.mercCompanionKind = kind;
    const el = document.getElementById('merc-companion-overlay');
    if (el) el.remove();
    beginFloorEncounter();
};

function checkEvolution() {
    if (player.evolved || player.baseJob === '용병단장') return;
    if (jobEvolutions[player.baseJob]) setTimeout(() => showEvolutionChoice(jobEvolutions[player.baseJob]), 500);
}

function showEvolutionChoice(evols) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:30px;max-width:460px;width:90%;text-align:center;">
            <h2 style="color:#f1c40f;margin-bottom:8px;">⚡ 10층 달성! 전직 선택</h2>
            <p style="color:#aaa;font-size:0.9em;margin-bottom:20px;">${player.name}의 새로운 길을 선택하세요.</p>
            ${evols.map((e,i) => `
                <div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:15px;margin-bottom:12px;cursor:pointer;transition:border-color 0.2s;" onmouseenter="this.style.borderColor='#f1c40f'" onmouseleave="this.style.borderColor='#555'" onclick="evolve(${i})">
                    <b style="color:#e0e0e0;font-size:1.1em;">${e.name}</b>
                    <p style="color:#888;font-size:0.85em;margin:6px 0 0;">${e.desc}</p>
                    <p style="color:#2ed573;font-size:0.8em;margin:4px 0 0;">ATK:${e.bonusAtk||'-'} / DEF:${e.bonusDef||'-'} / HP:${e.bonusHp||'-'}${e.bonusAcc?` / ACC:+${e.bonusAcc}%`:''}</p>
                    <p style="color:#9b59b6;font-size:0.8em;margin:4px 0 0;">🔥 궁극기: ${e.ult}</p>
                </div>`).join('')}
        </div>`;
    document.body.appendChild(overlay);
    window._evolOptions = evols; window._evolOverlay = overlay;
}

// ===================== 전직도(마인드맵) + 전직 이름 해금 =====================
const EVO_SEEN_KEY = 'evolution_seen_v1';
const PLAYED_JOBS_KEY = 'played_jobs_v1';
function loadSeenEvolutions() {
    try {
        const raw = localStorage.getItem(EVO_SEEN_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function saveSeenEvolutions(arr) {
    try {
        localStorage.setItem(EVO_SEEN_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function markEvolutionSeen(name) {
    const n = String(name || '');
    if (!n) return;
    const cur = loadSeenEvolutions();
    if (!cur.includes(n)) {
        cur.push(n);
        saveSeenEvolutions(cur);
    }
}
function evoLabelOrUnknown(name) {
    const n = String(name || '');
    if (!n) return '???';
    return loadSeenEvolutions().includes(n) ? n : '???';
}
function buildEvolutionMindmapHtml() {
    const rows = [
        { base: '워리어', color: '#ff4757', list: ['나이트', '버서커'] },
        { base: '헌터', color: '#2ed573', list: ['궁수', '암살자'] },
        { base: '마법사', color: '#1e90ff', list: ['위저드', '소환사', '성직자'] },
    ];
    const chips = (names) =>
        names
            .map((n) => {
                const v = evoLabelOrUnknown(n);
                const on = v !== '???';
                return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;border:1px solid ${
                    on ? '#f1c40f' : '#333'
                };background:${on ? '#2a2a1a' : '#0a0a0a'};color:${on ? '#f1c40f' : '#444'};font-weight:800;font-size:0.78em;margin:2px;">${v}</span>`;
            })
            .join('');
    return `<div style="margin:0 0 12px 0;padding:12px;background:#0d0d12;border:1px solid #333;border-radius:10px;">
  <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">
    <div style="color:#f1c40f;font-weight:900;">🧭 전직도</div>
    <div style="color:#666;font-size:0.75em;">전직 후 해당 이름이 해금됩니다. (해금 전: ???)</div>
  </div>
  <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">
    ${rows
        .map(
            (r) =>
                `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;"><span style="min-width:66px;color:${r.color};font-weight:900;">${r.base}</span><span style="color:#555;">→</span><div>${chips(
                    r.list
                )}</div></div>`
        )
        .join('')}
  </div>
</div>`;
}

function loadPlayedJobs() {
    try {
        const raw = localStorage.getItem(PLAYED_JOBS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function savePlayedJobs(arr) {
    try {
        localStorage.setItem(PLAYED_JOBS_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function markPlayedJob(name) {
    const n = String(name || '').trim();
    if (!n) return;
    const cur = loadPlayedJobs();
    if (!cur.includes(n)) {
        cur.push(n);
        savePlayedJobs(cur);
    }
}
function collectPlayedBaseJobsFromMeta() {
    const out = [];
    try {
        if (typeof MetaRPG === 'undefined') return out;
        const m = MetaRPG.loadMeta();
        const slots = m && Array.isArray(m.slots) ? m.slots : [];
        slots.forEach((s) => {
            const jb = jobBase[s && s.jobKey];
            if (jb && jb.name) out.push(jb.name);
        });
    } catch (e) {
        /* ignore */
    }
    return out;
}
function getPlayedJobsForEvolutionMap() {
    return new Set([...loadPlayedJobs(), ...collectPlayedBaseJobsFromMeta(), ...loadSeenEvolutions()]);
}
function getJobSpecForTooltip(jobName) {
    const n = String(jobName || '');
    for (const k of Object.keys(jobBase || {})) {
        const j = jobBase[k];
        if (j && j.name === n) {
            return { atk: safeNum(j.atk, 0), def: safeNum(j.def, 0), crit: 1, critMult: 1.8, lifesteal: 0 };
        }
    }
    for (const baseName of Object.keys(jobEvolutions || {})) {
        const list = jobEvolutions[baseName] || [];
        const hit = list.find((x) => x && x.name === n);
        if (hit) {
            return {
                atk: safeNum(hit.bonusAtk, 0),
                def: safeNum(hit.bonusDef, 0),
                crit: 1,
                critMult: 1.8,
                lifesteal: 0,
            };
        }
    }
    return { atk: 0, def: 0, crit: 1, critMult: 1.8, lifesteal: 0 };
}
function getJobPassiveText(jobName) {
    const map = {
        워리어: '강인함: 기본 생존력이 높음',
        헌터: '정밀 사격: 명중/딜 균형',
        마법사: '주문 증폭: 높은 기본 공격력',
        나이트: '철벽 수호: 방어/체력 특화',
        버서커: '광전: 공격 특화',
        궁수: '저격 자세: 명중 강화',
        암살자: '암습: 고화력 일격',
        위저드: '마도 폭주: 마법 화력 특화',
        소환사: '소환 지휘: 소환수 중심 운영',
        성직자: `신성력: 최대 ${DIVINE_POWER_MAX}스택, 가호 방어+${DIVINE_BLESSING_DEF_BONUS}`,
    };
    return map[jobName] || '고유 패시브';
}
function buildPlayedEvolutionMapHtml() {
    const played = getPlayedJobsForEvolutionMap();
    const rows = [
        { base: '워리어', color: '#ff4757', list: ['나이트', '버서커'] },
        { base: '헌터', color: '#2ed573', list: ['궁수', '암살자'] },
        { base: '마법사', color: '#1e90ff', list: ['위저드', '소환사', '성직자'] },
    ];
    const makeCard = (name, color) => {
        const spec = getJobSpecForTooltip(name);
        const tip = `${name}\n패시브: ${getJobPassiveText(name)}\n공격력: ${spec.atk}\n방어력: ${spec.def}\n치명타 확률: ${spec.crit}%\n치명타 배율: ${spec.critMult.toFixed(2)}x\n흡혈: ${Math.round(spec.lifesteal * 100)}%`;
        return `<span title="${tip}" style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid ${color};background:#10141a;color:${color};font-weight:800;font-size:0.8em;margin:3px;cursor:help;">${name}</span>`;
    };
    const body = rows
        .map((r) => {
            const names = [r.base, ...r.list].filter((n) => played.has(n));
            if (!names.length) return '';
            const baseShown = names.includes(r.base) ? makeCard(r.base, r.color) : '';
            const evols = r.list.filter((n) => names.includes(n)).map((n) => makeCard(n, '#f1c40f')).join('');
            return `<div style="padding:10px;border:1px solid #2a2a2a;border-radius:10px;background:#0f0f14;"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">${baseShown || '<span style="color:#555;font-size:0.8em;">(기본 직업 미플레이)</span>'}${evols ? '<span style="color:#666;">→</span>' + evols : ''}</div></div>`;
        })
        .filter(Boolean)
        .join('');
    if (!body) {
        return `<div style="padding:14px;border:1px solid #333;border-radius:10px;background:#0d0d12;color:#888;line-height:1.6;">아직 플레이한 직업 기록이 없습니다.<br>캐릭터를 시작하거나 전직하면 이 전직도에 자동으로 표시됩니다.</div>`;
    }
    return `<div style="margin-bottom:10px;color:#888;font-size:0.82em;line-height:1.55;">직업 칩에 마우스를 올리면 패시브와 기본 스탯 정보를 볼 수 있습니다.</div><div style="display:flex;flex-direction:column;gap:8px;">${body}</div>`;
}
window.toggleEvolutionMap = (show) => {
    if (show) {
        const el = document.getElementById('evolution-list');
        if (el) el.innerHTML = buildPlayedEvolutionMapHtml();
    }
    const modal = document.getElementById('evolution-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
};

window.evolve = (idx) => {
    const evol = window._evolOptions[idx];
    const oldName = player.name;
    player.name = evol.name;
    player.evolved = true;
    player.currentPromotion = evol.name;
    markPlayedJob(evol.name);
    markEvolutionSeen(evol.name);
    if (player.metaSlotId && typeof MetaRPG !== 'undefined') {
        const m = MetaRPG.loadMeta();
        const slot = m.slots.find((s) => s.id === player.metaSlotId);
        if (slot) {
            slot.currentPromotion = evol.name;
            slot.promotionHistory = Array.isArray(slot.promotionHistory) ? slot.promotionHistory : [];
            if (!slot.promotionHistory.includes(evol.name)) slot.promotionHistory.push(evol.name);
            MetaRPG.saveMeta(m);
        }
    }
    fullResyncPlayerCombatStatsFromMetaAndInventory();
    // 궁극기 세팅
    player.unlockedSkill = evol.ult;
    const ultSpec = ultSkills[evol.ult];
    player.ultStack = 0;
    player.ultMaxStack = ultSpec ? ultSpec.stackRequired : 3;
    if (evol.name === '소환사') {
        const saved = loadSummonFromStorage();
        if (saved && saved.id) player.summon = saved;
    }
    document.body.removeChild(window._evolOverlay);
    if (evol.name === '성직자') {
        player.divinePower = clampDivinePower(player.divinePower);
        recalcPlayerDivineGainMult();
        normalizeDivineState();
    }
    writeLog(`⚡ [전직] ${oldName} → <b style='color:#f1c40f'>${evol.name}</b>! 궁극기 [${evol.ult}] 획득!`);
    emitPromotionStory(evol.name);
    updateUi(); renderActions();
};

function checkFloorUnlock(f) {
    const baseJob = player.baseJob;
    checkStoryMilestone(f);
    emitFloorStory(f);
    try { maybeUnlockEvolutionItemsFromBasePlay(f); } catch (e) { /* ignore */ }
    if (f%10===0 && floorUnlocks[f]) {
        const gu = getUnlockedFloors(null);
        if (!gu.includes(f)) { saveUnlockedFloor(f,null); showUnlockPopup(`🔓 ${f}층 달성!`,`공용 아이템<br><b style="color:#f1c40f;">${floorUnlocks[f].name}</b>이 상점에 해금!`,'#f1c40f'); writeLog(`🔓 공용 [${floorUnlocks[f].name}] 해금!`); }
    }
    if (f%5===0 && f%10!==0) {
        let ui = null;
        if (baseJob==='워리어'&&floorUnlocks[f]) ui=floorUnlocks[f];
        else if (baseJob==='헌터'&&floorUnlocksHunter[f]) ui=floorUnlocksHunter[f];
        else if (baseJob==='마법사'&&floorUnlocksWizard[f]) ui=floorUnlocksWizard[f];
        if (ui) {
            const ju = getUnlockedFloors(baseJob);
            if (!ju.includes(f)) { saveUnlockedFloor(f,baseJob); showUnlockPopup(`🔓 ${f}층 달성!`,`${player.name} 전용<br><b style="color:#2ed573;">${ui.name}</b>이 해금!`,'#2ed573'); writeLog(`🔓 전용 [${ui.name}] 해금!`); }
        }
    }
}

// ===================== 인카운터(탐험) + 패닉 런 =====================
// stage 2 split: moved to js/encounter.js

// ===================== 적 스폰 =====================
// stage 3 split: moved to js/enemy.js

// stage 1 split: moved to js/uiManager.js

// stage 4 split: moved to js/combatLogic.js

// stage 2 split: moved to js/encounter.js

function renderCombatLogsFromSnapshotRows(rows) {
    const arr = Array.isArray(rows) ? rows : [];
    const html = arr
        .map((msg) => `<p style="margin:4px 0;border-bottom:1px solid #333;padding-bottom:4px;">${msg}</p>`)
        .join('');
    const n = document.getElementById('log');
    if (n) n.innerHTML = html;
    window._combatLogHistory = arr.slice(0, 220);
    renderSlimBattleLog();
}

function showMercEvolutionChoice(onDone) {
    const kind = player.mercCompanionKind;
    const opts = mercCompanionEvolutions[kind];
    if (!opts || !opts.length) {
        if (onDone) onDone();
        return;
    }
    window._mercEvoOnDone = onDone;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:10002;';
    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:26px;max-width:460px;width:92%;text-align:center;">
            <h2 style="color:#f1c40f;margin-bottom:8px;">⚡ 20~30층: 용병 전직 (1회)</h2>
            <p style="color:#aaa;font-size:0.86em;margin-bottom:16px;line-height:1.45;">플레이어 전직보다 약한 수치이지만 상성·딜에 큰 영향을 줍니다. <b>선택 중에는 적 턴이 없습니다.</b></p>
            ${opts.map((e, i) => `
                <div style="background:#2a2a3e;border:1px solid #555;border-radius:8px;padding:14px;margin-bottom:10px;cursor:pointer;text-align:left;" onclick="resolveMercEvolution(${i})" onmouseenter="this.style.borderColor='#f1c40f'" onmouseleave="this.style.borderColor='#555'">
                    <b style="color:#e0e0e0;">${e.name}</b> <span style="color:#888;font-size:0.8em;">→ ${e.pathJob}</span>
                    <p style="color:#888;font-size:0.82em;margin:6px 0 0;">${e.desc}</p>
                </div>`).join('')}
        </div>`;
    window._mercEvoOverlay = overlay;
    document.body.appendChild(overlay);
}

window.resolveMercEvolution = (idx) => {
    const kind = player.mercCompanionKind;
    const opts = mercCompanionEvolutions[kind];
    if (!opts || !opts[idx]) return;
    const ev = opts[idx];
    player.mercEvolution = ev;
    player.mercEvolutionChosen = true;
    const ov = window._mercEvoOverlay;
    if (ov && ov.parentNode) document.body.removeChild(ov);
    window._mercEvoOverlay = null;
    if (player.fieldMerc) {
        const ratio = player.fieldMerc.mercHp / Math.max(1, player.fieldMerc.mercMaxHp);
        player.fieldMerc = buildFieldMercFromTemplate();
        player.fieldMerc.mercHp = Math.max(1, Math.floor(player.fieldMerc.mercMaxHp * ratio));
    }
    writeLog(`[용병 전직] <b>${ev.name}</b> (${ev.pathJob})!`);
    const cb = window._mercEvoOnDone;
    window._mercEvoOnDone = null;
    if (cb) cb();
    updateUi(); renderActions();
};

function processFloorQuestOnVictory() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const FQ = MetaRPG.FLOOR_QUESTS;
    const qdef = FQ[floor];
    if (!qdef) return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot || (slot.questFlags && slot.questFlags[qdef.id])) return;
    if (qdef.needWins) {
        player._questWins = (player._questWins || 0) + 1;
        if (player._questWins >= qdef.needWins) {
            MetaRPG.grantQuestReward(player.metaSlotId, qdef.reward, qdef.id);
            writeLog(`[퀘스트 완료] <b>${qdef.title}</b> — 영구 보상 적용!`);
            player._questWins = 0;
        } else {
            writeLog(`[퀘스트] ${qdef.title} 진행: ${player._questWins}/${qdef.needWins}`);
        }
    } else if (qdef.needBoss && enemy && enemy.isBoss) {
        MetaRPG.grantQuestReward(player.metaSlotId, qdef.reward, qdef.id);
        writeLog(`[퀘스트 완료] <b>${qdef.title}</b> — 보스 격파!`);
    }
}

// stage 4 split: moved to js/combatLogic.js

/** 21층 이상 훈련 모드: 승리해도 층 증가 없음 (상점에서만 모드 전환) */
function proceedWinBattleFarmContinue() {
    const clearedFloor = floor;
    checkFloorUnlock(clearedFloor);
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, clearedFloor);
    if (isMercenaryCaptainJob() && clearedFloor >= 19 && clearedFloor <= 30 && !player.mercEvolutionChosen) {
        setTimeout(() => showMercEvolutionChoice(() => winBattleContinueFrom(clearedFloor)), 450);
        return;
    }
    winBattleContinueFrom(clearedFloor);
}

function failActiveQuestIfLeavingFloor() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') return;
    const FQ = MetaRPG.FLOOR_QUESTS;
    const qdef = FQ[floor];
    if (!qdef || !qdef.needWins) return;
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot || (slot.questFlags && slot.questFlags[qdef.id])) return;
    const need = qdef.needWins;
    const cur = player._questWins || 0;
    if (cur < need) {
        MetaRPG.applyQuestPenalty(player.metaSlotId, qdef.failPenalty);
        writeLog(`[퀘스트 실패] ${qdef.title} — 층 이탈/미완료 패널티!`);
    }
    player._questWins = 0;
}

function proceedWinBattleNextFloor() {
    failActiveQuestIfLeavingFloor();
    const clearedFloor = floor;
    floor++;
    applyFloorGrowthRewardForClear(clearedFloor);
    checkFloorUnlock(clearedFloor);
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, clearedFloor);
    const continueAfterRewards = () => {
        if (isMercenaryCaptainJob() && clearedFloor >= 19 && clearedFloor <= 30 && !player.mercEvolutionChosen) {
            setTimeout(() => showMercEvolutionChoice(() => winBattleContinueFrom(clearedFloor)), 450);
            return;
        }
        winBattleContinueFrom(clearedFloor);
    };
    maybeOfferTacticalSkillReward(clearedFloor, continueAfterRewards);
}

function serializeRunState() {
    const shopEl = document.getElementById('shop-area');
    const inShop = shopEl && shopEl.style.display === 'block';
    let enemySnap = null;
    if (!inShop && enemy && safeNum(enemy.curHp, 0) > 0 && safeNum(enemy.hp, 0) > 0) {
        enemySnap = JSON.parse(JSON.stringify(enemy));
    }
    const slot = typeof MetaRPG !== 'undefined' && player && player.metaSlotId ? MetaRPG.getSlotById(player.metaSlotId) : null;
    const playerSnap = player ? JSON.parse(JSON.stringify(player)) : null;
    if (playerSnap) {
        playerSnap.extraAtk = 0;
        playerSnap._relicTempCrit = 0;
        playerSnap._relicGamblerDefSub = 0;
    }
    return {
        floor,
        gold,
        totalGoldEarned,
        rerollCost,
        shopVisitCount,
        lastEnemyJob,
        pendingShop: inShop ? false : pendingShop,
        restockCrossroadActive: !inShop && !enemySnap && typeof restockCrossroadActive !== 'undefined' && !!restockCrossroadActive,
        restockCrossroadContext: !inShop && !enemySnap && typeof restockCrossroadActive !== 'undefined' && restockCrossroadActive
            ? (restockCrossroadContext || null)
            : null,
        resumeAfterRestockCrossroad: inShop && typeof resumeAfterRestockCrossroad !== 'undefined' && resumeAfterRestockCrossroad
            ? resumeAfterRestockCrossroad
            : null,
        encounterPhase: !inShop && !enemySnap && !!window._encounterPhaseActive,
        encounterScene: !inShop && !enemySnap && !!window._encounterPhaseActive ? (window._encounterPhaseScene || null) : null,
        inShop: !!inShop,
        attackGcdUntil,
        defendingTurns,
        dodgingTurns,
        shieldedTurns,
        regenTurns,
        regenAmount,
        combatLogs: Array.isArray(window._combatLogHistory) ? window._combatLogHistory.slice(0, 220) : [],
        enemyBehaviorState: enemySnap
            ? {
                  bossCharge: !!enemySnap.bossCharge,
                  turnCount: safeNum(enemySnap.turnCount, 1),
                  aiGuardedTurns: safeNum(enemySnap._aiGuardedTurns, 0),
                  hunterEvasionTurns: safeNum(enemySnap._hunterEvasionTurns, 0),
              }
            : null,
        player: playerSnap,
        enemy: enemySnap,
        slotLevel: slot ? slot.level : 1,
        slotExp: slot ? slot.exp : 0,
    };
}

function loadRunFromMetaSnapshot(d) {
    if (!d.player) return alert('저장 데이터가 올바르지 않습니다.');
    if (typeof MetaRPG !== 'undefined' && d.player.metaSlotId) {
        MetaRPG.setActiveSlot(d.player.metaSlotId);
        const m = MetaRPG.loadMeta();
        const sl = m.slots.find((s) => s.id === d.player.metaSlotId);
        if (sl && d.slotLevel != null) {
            sl.level = d.slotLevel;
            sl.exp = d.slotExp != null ? d.slotExp : 0;
            MetaRPG.recalcTechBonus(sl);
            MetaRPG.saveMeta(m);
        }
    }
    floor = d.floor;
    gold = d.gold;
    totalGoldEarned = d.totalGoldEarned;
    rerollCost = d.rerollCost != null ? d.rerollCost : 10;
    shopVisitCount = d.shopVisitCount != null ? d.shopVisitCount : 0;
    lastEnemyJob = d.lastEnemyJob || '';
    pendingShop = !!d.pendingShop;
    const savedInShop = !!d.inShop;
    if (typeof restockCrossroadActive !== 'undefined') restockCrossroadActive = !!d.restockCrossroadActive;
    if (typeof restockCrossroadContext !== 'undefined') restockCrossroadContext = d.restockCrossroadContext || null;
    if (typeof resumeAfterRestockCrossroad !== 'undefined') resumeAfterRestockCrossroad = d.resumeAfterRestockCrossroad || null;
    attackGcdUntil = d.attackGcdUntil || 0;
    defendingTurns = d.defendingTurns || 0;
    dodgingTurns = d.dodgingTurns || 0;
    shieldedTurns = d.shieldedTurns || 0;
    regenTurns = d.regenTurns || 0;
    regenAmount = d.regenAmount || 0;
    window._combatLogHistory = Array.isArray(d.combatLogs) ? d.combatLogs.slice(0, 220) : [];
    player = d.player;
    if (player) {
        player.extraAtk = 0;
        player._relicTempCrit = 0;
        player._relicGamblerDefSub = 0;
        if (player.metaSlotId && typeof MetaRPG !== 'undefined') {
            const storySlot = MetaRPG.getSlotById(player.metaSlotId);
            if (storySlot) {
                player.raceKey = player.raceKey || storySlot.raceKey || null;
                player.memoryKey = player.memoryKey || storySlot.memoryKey || null;
                player.originBaseJobKey = player.originBaseJobKey || storySlot.originBaseJobKey || storySlot.jobKey || null;
                player.classKey = player.classKey || storySlot.classKey || storySlot.jobKey || null;
                player.introWeaponKey = player.introWeaponKey || storySlot.introWeaponKey || null;
                player.currentPromotion = player.currentPromotion || storySlot.currentPromotion || null;
            }
        }
        ensurePlayerRunProgressFields(player.metaSlotId && typeof MetaRPG !== 'undefined' ? MetaRPG.getSlotById(player.metaSlotId) : null);
    }
    if (player && player.divinePower == null) player.divinePower = 0;
    if (player && player.divineGainMult == null) player.divineGainMult = 1;
    if (player && player.prayerBonusFlat == null) player.prayerBonusFlat = 0;
    if (player && player.priestBlessed == null) player.priestBlessed = false;
    if (player && player.chosenPriest == null) player.chosenPriest = false;
    if (player && player.priestNextCrit == null) player.priestNextCrit = false;
    if (player && player.prayerVulnerableHits == null) player.prayerVulnerableHits = 0;
    if (player && player.prayerCountThisTurn == null) player.prayerCountThisTurn = 0;
    if (player && player.items && typeof clampEquipmentItemStatsToRarityCaps === 'function') {
        player.items.forEach((it) => {
            if (it && it.type !== 'merc') clampEquipmentItemStatsToRarityCaps(it);
        });
    }
    if (player && player.metaSlotId) fullResyncPlayerCombatStatsFromMetaAndInventory();
    if (player && player.name === '성직자') {
        recalcPlayerDivineGainMult();
        normalizeDivineState();
    }
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined' && MetaRPG.updateBestFloor) MetaRPG.updateBestFloor(player.metaSlotId, d.floor || 1);
    if (player && player.shopRarityBoost == null) player.shopRarityBoost = 0;
    if (player && player.freeShopCoupon == null) player.freeShopCoupon = false;
    if (player && !Array.isArray(player.passiveContractHistory)) player.passiveContractHistory = [];
    if (player && player.hunterExposeStacks == null) player.hunterExposeStacks = 0;
    if (player && player.hunterExposeReady == null) player.hunterExposeReady = false;
    enemy = d.enemy;
    if (enemy && d.enemyBehaviorState) {
        enemy.bossCharge = !!d.enemyBehaviorState.bossCharge;
        enemy.turnCount = safeNum(d.enemyBehaviorState.turnCount, safeNum(enemy.turnCount, 1));
        enemy._aiGuardedTurns = safeNum(d.enemyBehaviorState.aiGuardedTurns, safeNum(enemy._aiGuardedTurns, 0));
        enemy._hunterEvasionTurns = safeNum(d.enemyBehaviorState.hunterEvasionTurns, safeNum(enemy._hunterEvasionTurns, 0));
    }
    if (enemy && (safeNum(enemy.curHp, 0) <= 0 || safeNum(enemy.hp, 0) <= 0)) {
        enemy = null;
    }
    window._enemyThinkingHint = '';
    setCombatProcessing(false);
    document.getElementById('start-area').style.display = 'none';
    renderCombatLogsFromSnapshotRows(window._combatLogHistory);
    enterBattleLayout();
    if (savedInShop) {
        document.getElementById('battle-area').style.display = 'none';
        document.getElementById('shop-area').style.display = 'block';
        pendingShop = false;
        updateUi();
        renderShopItems();
        writeLog('[저장] 상점에서 이어갑니다.');
        if (player && player.metaSlotId && typeof MetaRPG !== 'undefined') MetaRPG.markRunCheckpoint(player.metaSlotId);
        return;
    }
    document.getElementById('shop-area').style.display = 'none';
    document.getElementById('battle-area').style.display = 'block';
    if (!enemy) {
        if (pendingShop) {
            document.getElementById('battle-area').style.display = 'none';
            document.getElementById('shop-area').style.display = 'block';
            rerollCost = rerollCost || 10;
            updateUi();
            renderShopItems();
        } else if (typeof restockCrossroadActive !== 'undefined' && restockCrossroadActive && typeof renderRestockCrossroad === 'function') {
            renderRestockCrossroad({ immediate: true });
        } else {
            pendingShop = false;
            if (d.encounterPhase) {
                window._encounterPhaseScene = d.encounterScene || null;
                beginFloorEncounter();
            }
            else spawnEnemy();
        }
    } else {
        updateUi();
        renderActions();
    }
    writeLog('[저장] 런을 불러왔습니다.');
    if (player && player.metaSlotId && typeof MetaRPG !== 'undefined') MetaRPG.markRunCheckpoint(player.metaSlotId);
}

/** 저장 후 메인 허브 (보존 골드·스냅샷·체크포인트 갱신) */
window.saveAndExitToMain = function saveAndExitToMain() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') {
        writeLog('[저장] 진행 중인 런이 없습니다.');
        return;
    }
    try {
        const payload = serializeRunState();
        MetaRPG.setRunSnapshot(player.metaSlotId, payload);
        MetaRPG.markRunCheckpoint(player.metaSlotId);
        // 랭킹 반영 기준: 사망/클리어 시점이 아닌 "저장한 층"
        saveRank();
        writeLog('[저장] 런을 저장했습니다. 허브에서 이어하기로 복구할 수 있습니다.');
        returnToHubFromRun(true);
    } catch (e) {
        writeLog('[저장] 실패: ' + (e && e.message));
    }
};

/** 저장 없이 메인 — 메타 EXP/레벨 되돌림, 스냅샷 삭제, 보존 골드 미지급 */
window.exitToMainWithoutSave = function exitToMainWithoutSave() {
    if (!player || !player.metaSlotId || typeof MetaRPG === 'undefined') {
        writeLog('[허브] 진행 중인 런이 없습니다.');
        return;
    }
    if (!confirm('저장 없이 메인으로 이동합니다. 마지막 저장 시점 데이터는 유지됩니다. 계속할까요?')) return;
    returnToHubFromRun(false);
};

function returnToHubFromRun(savedExit) {
    exitBattleLayout();
    if (savedExit) {
        const sg = Math.floor(totalGoldEarned * 0.12);
        if (typeof MetaRPG !== 'undefined') MetaRPG.addSavedGold(sg);
        writeLog(`[허브] 런 종료 — 보존 골드 +${sg}G`);
    } else {
        writeLog('[허브] 저장 없이 종료 — 런 보존 골드 없음 (마지막 저장 데이터는 유지)');
    }
    player = null;
    enemy = null;
    document.getElementById('battle-area').style.display = 'none';
    showPreGameScreen();
}

window.exportFullSave = function exportFullSave() {
    const keys = [
        'dungeon_meta_v7',
        'dungeon_meta_v7_f0',
        'dungeon_meta_v7_f1',
        'dungeon_meta_v7_f2',
        'dungeon_meta_v7_active_file',
        'dungeon_meta_v7_file_migrated_v2',
        'perma_stats',
        'perma_buy_count',
        'saved_gold',
        'item_collection_v5',
        'unlocked_floors_global',
        'unlocked_floors_워리어',
        'unlocked_floors_헌터',
        'unlocked_floors_마법사',
    ];
    const out = { v: 7, gameBuild: GAME_BUILD, exportedAt: new Date().toISOString() };
    keys.forEach((k) => {
        out[k] = localStorage.getItem(k);
    });
    const blob = new Blob([JSON.stringify(out, null, 0)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dungeon-save-${GAME_BUILD}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    localStorage.setItem('user_exported_save_v7', '1');
    alert('✅ 전체 저장 파일을 내려받았습니다. 안전한 곳에 보관하세요.');
};

window.importFullSave = function importFullSave(inputEl) {
    const f = inputEl.files && inputEl.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        try {
            const data = JSON.parse(r.result);
            if (!data || typeof data !== 'object') throw new Error('형식 오류');
            Object.keys(data).forEach((k) => {
                if (k === 'v' || k === 'gameBuild' || k === 'exportedAt') return;
                if (typeof data[k] === 'string' || data[k] === null) {
                    if (data[k] === null) localStorage.removeItem(k);
                    else localStorage.setItem(k, data[k]);
                }
            });
            alert('✅ 불러오기 완료. 화면을 새로고침합니다.');
            location.reload();
        } catch (e) {
            alert('불러오기 실패: ' + (e && e.message));
        }
    };
    r.readAsText(f);
    inputEl.value = '';
};

window.openBaseCampTech = function openBaseCampTech() {
    if (typeof MetaRPG === 'undefined' || !player || !player.metaSlotId) return;
    const shopEl = document.getElementById('shop-area');
    const inShop = shopEl && shopEl.style.display === 'block';
    if (!inShop) {
        writeLog('[베이스캠프] 상점 화면에서만 입장할 수 있습니다.');
        return;
    }
    if (!MetaRPG.isBaseCampFloor(floor)) {
        writeLog('[베이스캠프] 30층 이상에서만 열립니다.');
        return;
    }
    const slot = MetaRPG.getSlotById(player.metaSlotId);
    if (!slot) return;
    MetaRPG.recalcTechBonus(slot);
    MetaRPG.saveMeta(MetaRPG.loadMeta());
    const nodes = MetaRPG.getTechNodesForSlot(slot).slice().sort((a, b) => (a.line || '').localeCompare(b.line || '') || (a.id || '').localeCompare(b.id || ''));
    const runGold = safeNum(gold, 0);
    const bought = new Set(slot.techPurchased || []);
    const ov = document.createElement('div');
    ov.id = 'base-camp-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10055;overflow:auto;padding:20px;';
    const rows = nodes
        .map((n) => {
            const has = bought.has(n.id);
            const can = !has && MetaRPG.canPurchaseNode(slot, n.id) && runGold >= n.cost;
            const st = has ? '✅ 보유' : can ? '구매 가능' : '🔒 선행 필요';
            const fx = formatTechEffect(n.effect);
            return `<div style="background:#111;border:1px solid #444;border-radius:8px;padding:10px;margin-bottom:8px;text-align:left;">
            <b style="color:#f1c40f;">${n.name}</b> <span style="color:#888;font-size:0.8em;">${st}</span>
            <div style="color:#ccc;font-size:0.82em;margin:6px 0;line-height:1.4;">효과: ${fx}</div>
            <div style="color:#f1c40f;font-size:0.8em;margin-bottom:6px;">비용: <b>${n.cost}G</b> (런 골드)</div>
            ${!has && MetaRPG.canPurchaseNode(slot, n.id) ? `<button type="button" onclick="buyTechNode('${n.id}')" style="background:#f1c40f;color:#111;border:none;padding:6px 12px;border-radius:6px;font-weight:700;cursor:pointer;" ${runGold < n.cost ? 'disabled' : ''}>구매</button>` : ''}
          </div>`;
        })
        .join('');
    const permaBlock = `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #444;">
      <h3 style="color:#f1c40f;margin:0 0 10px;font-size:1em;">⚔️ 영구 강화 (이 캐릭터 전용 · 무한 · 런 골드)</h3>
      <p style="color:#888;font-size:0.78em;margin-bottom:10px;">체력·공격·방어·치명(소량)·치명 배율. 슬롯마다 별도입니다.</p>
      ${buildPermanentShopHtml()}
    </div>`;
    ov.innerHTML = `<div style="max-width:520px;margin:0 auto;background:#1a1a2e;border:2px solid #9b59b6;border-radius:12px;padding:20px;">
      <h2 style="color:#9b59b6;margin:0 0 8px;">🏕️ 베이스캠프 (${floor}층)</h2>
      <p style="color:#888;font-size:0.85em;">런 골드: <b style="color:#f1c40f;">${runGold}G</b> · 테크: <b>직업 내 노드 자유 조합</b></p>
      <h3 style="color:#e0e0e0;margin:14px 0 8px;font-size:0.95em;">📊 테크 트리</h3>
      <div style="max-height:min(360px,50vh);overflow:auto;margin:12px 0;">${rows}</div>
      ${permaBlock}
      <button type="button" onclick="document.getElementById('base-camp-overlay').remove()" style="width:100%;margin-top:16px;padding:10px;background:#444;color:#fff;border:none;border-radius:8px;cursor:pointer;">닫기</button>
    </div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => {
        ov.scrollTop = window.__baseCampScrollTop || 0;
    });
};

window.buyTechNode = (nodeId) => {
    if (!player || !player.metaSlotId) return;
    const n = MetaRPG.getTechNodeById(nodeId);
    if (!n) return writeLog('[테크] 노드를 찾을 수 없습니다.');
    const cost = n.cost || 0;
    if (gold < cost) return writeLog('[테크] 런 골드 부족');
    const r = MetaRPG.commitTechPurchase(player.metaSlotId, nodeId);
    if (!r.ok) return writeLog(`[테크] ${r.msg}`);
    const elKeep = document.getElementById('base-camp-overlay');
    if (elKeep) window.__baseCampScrollTop = elKeep.scrollTop;
    gold -= cost;
    writeLog(`[테크] ${r.msg} 구매! (-${cost}G)`);
    const el = document.getElementById('base-camp-overlay');
    if (el) el.remove();
    openBaseCampTech();
    updateUi();
};

function milestoneCenturyFloor() {
    saveRank();
    triggerBossWarning(false);
    const cf = floor;
    window.__centuryMilestoneFloor = cf;
    const sg = Math.floor(totalGoldEarned * 0.15);
    if (typeof MetaRPG !== 'undefined') MetaRPG.addSavedGold(sg);
    exitBattleLayout();
    document.getElementById('battle-area').style.display = 'none';
    const old = document.getElementById('century-milestone-overlay');
    if (old) old.remove();
    const ov = document.createElement('div');
    ov.id = 'century-milestone-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:10090;display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML = `<div style="max-width:460px;width:100%;background:#1a1a2e;border:2px solid #f1c40f;border-radius:12px;padding:24px;text-align:center;">
      <h2 style="color:#f1c40f;margin:0 0 8px;">🏆 ${cf}층 이정표</h2>
      <p style="color:#ccc;margin:0 0 6px;">무한 던전은 계속됩니다.</p>
      <p style="color:#2ed573;margin:0 0 14px;">보존 +${sg}G</p>
      <button type="button" onclick="continuePastCentury()" style="background:#9b59b6;color:#fff;padding:12px 20px;margin:8px;border:none;border-radius:8px;cursor:pointer;font-weight:700;">♾️ 계속 (${cf + 1}층)</button>
      <button type="button" onclick="returnToHubFromCenturyMilestone()" style="background:#f1c40f;color:#111;padding:12px 20px;margin:8px;border:none;border-radius:8px;cursor:pointer;font-weight:700;">🏠 허브로</button>
    </div>`;
    document.body.appendChild(ov);
}

window.continuePastCentury = () => {
    const cf = window.__centuryMilestoneFloor || 100;
    floor = cf + 1;
    const ov = document.getElementById('century-milestone-overlay');
    if (ov) ov.remove();
    document.getElementById('battle-area').style.display = 'block';
    enterBattleLayout();
    writeLog(`♾️ ${floor}층부터 진행`);
    beginFloorEncounter();
    updateUi();
};
window.returnToHubFromCenturyMilestone = () => {
    const ov = document.getElementById('century-milestone-overlay');
    if (ov) ov.remove();
    player = null;
    enemy = null;
    document.getElementById('battle-area').style.display = 'none';
    showPreGameScreen();
};

window.reincarnateFromCenturyMilestone = function reincarnateFromCenturyMilestone() {
    alert('환생은 허브에서만 가능하며, 최고 500층 도달 후 진행할 수 있습니다.');
};

// stage 2 split: moved to js/shop.js

function saveCollection(itemName) {
    let c=JSON.parse(localStorage.getItem('item_collection_v5')||'[]');
    if(!c.includes(itemName)){c.push(itemName);localStorage.setItem('item_collection_v5',JSON.stringify(c));}
}
function loadCollection() {}

// ===================== 선호(즐겨찾기) 아이템 =====================
const PREF_ITEMS_KEY = 'preferred_items_v1';
function loadPreferredItems() {
    try {
        const raw = localStorage.getItem(PREF_ITEMS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) return [];
        return arr.filter((x) => typeof x === 'string' && x.length > 0);
    } catch (e) {
        return [];
    }
}
function savePreferredItems(arr) {
    try {
        localStorage.setItem(PREF_ITEMS_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {
        /* ignore */
    }
}
function isPreferredItem(name) {
    const n = String(name || '');
    if (!n) return false;
    return loadPreferredItems().includes(n);
}
function escapeJsSingleQuoteString(s) {
    // onclick="fn('<here>')" 형태용 이스케이프
    return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
/** HTML attribute (title 등)용 */
function escapeHtmlAttr(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r?\n/g, ' ');
}
/** 툴팁·일반 텍스트 노드용 */
function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** synergyRules.detailDesc 우선, 없으면 effectDesc (상점·툴팁 공통) */
function resolveSynergyDetailText(rule) {
    if (!rule) return '';
    const d = String(rule.detailDesc != null ? rule.detailDesc : '').trim();
    if (d) return d;
    return String(rule.effectDesc != null ? rule.effectDesc : '').trim();
}

function buildSynergyTooltipPopupHtml(rule, opts) {
    const o = opts || {};
    const title = escapeHtml(rule.name || '시너지');
    const mainBody = resolveSynergyDetailText(rule);
    const mainHtml = mainBody
        ? `<div class="syn-tip-line syn-tip-detail">${escapeHtml(mainBody)}</div>`
        : `<div class="syn-tip-line syn-tip-muted">조건을 달성하면 세트 효과가 적용됩니다.</div>`;
    const bonusTxt = formatSynergyBonusHuman(rule.bonus || {});
    const bonusHtml = bonusTxt ? `<div class="syn-tip-line syn-tip-bonus">보정 수치: ${escapeHtml(bonusTxt)}</div>` : '';
    let stateHtml = '';
    if (o.mode === 'shop_fromTag') {
        const need = o.need;
        const next = o.next;
        const willActive = !!o.willActive;
        const display = Math.min(next, need);
        stateHtml = willActive
            ? `<div class="syn-tip-line syn-tip-active"><b>미리보기:</b> 이 아이템까지 포함하면 <span class="syn-tip-on">${display}/${need}</span> → <b>발동</b></div>`
            : `<div class="syn-tip-line"><b>미리보기:</b> 진행 <span class="syn-tip-on">${display}/${need}</span> (현재 장착·인벤 기준)</div>`;
    } else if (o.mode === 'shop_needTags') {
        stateHtml = `<div class="syn-tip-line syn-tip-muted">태그 조합 시너지 — 조건을 채우면 아래 보정이 적용됩니다.</div>`;
    } else if (o.mode === 'status') {
        const p = o.p;
        if (p.active) {
            stateHtml = `<div class="syn-tip-line syn-tip-active"><b>상태:</b> <span class="syn-tip-on">발동 중</span> (전투 스탯에 반영)</div>`;
        } else {
            stateHtml = `<div class="syn-tip-line"><b>상태:</b> 진행 ${p.cur}/${p.need} · <b>미발동</b></div>`;
        }
    }
    return `<span class="synergy-tip-popup" role="tooltip"><span class="syn-tip-title">${title}</span>${mainHtml}${bonusHtml}${stateHtml}</span>`;
}
function formatSynergyBonusHuman(b) {
    if (!b) return '';
    const parts = [];
    if (b.atk) parts.push(`공격+${b.atk}`);
    if (b.hp) parts.push(`체력+${b.hp}`);
    if (b.def) parts.push(`방어+${b.def}`);
    if (b.crit) parts.push(`치명+${b.crit}%`);
    if (b.critMult) parts.push(`치명 배율+${Math.round(b.critMult * 100)}%`);
    return parts.join(', ');
}
window.togglePreferredItem = function togglePreferredItem(name) {
    const n = String(name || '');
    if (!n) return;
    const cur = loadPreferredItems();
    const idx = cur.indexOf(n);
    if (idx >= 0) cur.splice(idx, 1);
    else cur.push(n);
    savePreferredItems(cur);
    try { toggleCollection(true); } catch (e) { /* ignore */ }
    try { renderShopItems(); } catch (e) { /* ignore */ }
};

function getEquipSlotKind(it) {
    if (!it) return null;
    if (it.type === 'atk') return 'weapon';
    if (it.type === 'hp') return 'armor';
    if (it.type === 'ring') return 'ring';
    if (it.type === 'rune') return 'rune';
    return null;
}
function getEquipSlotLimit(kind) {
    if (kind === 'weapon') return 2;
    if (kind === 'armor') return 2;
    if (kind === 'ring') return 3;
    if (kind === 'rune') return 1;
    return Infinity;
}
function getEquipSlotLabel(kind) {
    if (kind === 'weapon') return '무기';
    if (kind === 'armor') return '갑옷';
    if (kind === 'ring') return '반지';
    if (kind === 'rune') return '룬';
    return '장비';
}
function getEquipSlotLineHtml(it) {
    const k = getEquipSlotKind(it);
    if (!k) return '';
    const lim = getEquipSlotLimit(k);
    const label = getEquipSlotLabel(k);
    const icon = k === 'weapon' ? '⚔️' : k === 'armor' ? '🛡️' : k === 'rune' ? '🔮' : '💍';
    return `<div style="color:#9fb0ff;font-size:0.76em;margin-top:4px;line-height:1.35;">${icon} <b>장착 칸</b>: ${label} (동시 최대 ${lim}개)</div>`;
}
/** 상점 카드 — 장비만 HP/공격/방어/치명·배율 등 수치 블록(명중·체감 표시 없음) */
function buildShopItemCombatStatsHtml(it) {
    if (!it || it.type === 'relic' || it.type === 'potion' || it.type === 'merc_shop_direct' || it.type === 'merc_shop_fund' || it.type === 'merc') return '';
    if (typeof buildEquipmentStatParts !== 'function') return '';
    const parts = buildEquipmentStatParts(it);
    if (!parts.length) return '';
    const rows = parts.map((p) => `<div style="font-size:0.74em;color:#d0d8ea;line-height:1.45;">• ${p}</div>`).join('');
    return `<div style="margin-top:6px;padding:8px;background:#141820;border-radius:8px;border:1px solid #2a3548;"><div style="font-size:0.68em;color:#7f8c9d;font-weight:700;margin-bottom:4px;">장비 수치</div>${rows}</div>`;
}
function buildSynergyStatusHtml() {
    if (!player || !player._syn || !Array.isArray(player._syn.progress) || !player._syn.progress.length) return '';
    const rulesById = {};
    if (typeof synergyRules !== 'undefined' && Array.isArray(synergyRules)) {
        for (const r of synergyRules) {
            if (r && r.id) rulesById[r.id] = r;
        }
    }
    const chips = player._syn.progress
        .map((p) => {
            const on = !!p.active;
            const rule = rulesById[p.id] || {
                name: p.name,
                effectDesc: p.effectDesc || '',
                detailDesc: p.detailDesc || '',
                bonus: p.bonus || {},
            };
            const popup = buildSynergyTooltipPopupHtml(rule, { mode: 'status', p });
            const label = `${escapeHtml(p.name)} ${p.cur}/${p.need}`;
            const chipInner = `<span style="display:inline-block;margin:2px;padding:2px 7px;border-radius:999px;border:1px solid ${
                on ? '#2ed573' : '#444'
            };background:${on ? '#123020' : '#111'};color:${on ? '#2ed573' : '#999'};font-size:0.72em;font-weight:700;">${label}</span>`;
            return `<span class="synergy-tip-wrap" style="display:inline-block;vertical-align:middle;"><span class="synergy-tip-trigger synergy-tip-trigger--chip" style="display:inline-block;">${chipInner}</span>${popup}</span>`;
        })
        .join('');
    return `<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;">${chips}</div>`;
}
function getEquippedCountByKind(kind) {
    return (player.items || []).filter((x) => getEquipSlotKind(x) === kind).length;
}
function canEquipMoreOfItem(it) {
    const k = getEquipSlotKind(it);
    if (!k) return true;
    return getEquippedCountByKind(k) < getEquipSlotLimit(k);
}
window.getEquipSlotKind = getEquipSlotKind;
window.getEquipSlotLimit = getEquipSlotLimit;
window.getEquippedCountByKind = getEquippedCountByKind;
window.canEquipMoreOfItem = canEquipMoreOfItem;

function getItemSynergyHints(it) {
    if (!it || typeof synergyRules === 'undefined' || !Array.isArray(synergyRules)) return [];
    const tags = new Set();
    const tg = it.tags || it.tagList;
    if (Array.isArray(tg)) tg.forEach((t) => tags.add(String(t)));
    if (it.rarity) tags.add('rarity_' + String(it.rarity));
    if (it.type) tags.add('type_' + String(it.type));
    const curTagCounts = {};
    for (const x of player.items || []) {
        if (!x) continue;
        const xt = x.tags || x.tagList;
        if (Array.isArray(xt)) xt.forEach((t) => { const k = String(t); curTagCounts[k] = (curTagCounts[k] || 0) + 1; });
        if (x.rarity) {
            const k = 'rarity_' + String(x.rarity);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
        if (x.type) {
            const k = 'type_' + String(x.type);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
    }
    const alreadyOwned = (player.items || []).some((x) => x && x.name === it.name);
    const hints = [];
    for (const rule of synergyRules) {
        if (!rule) continue;
        if (rule.fromTag && tags.has(String(rule.fromTag)) && rule.needCount) {
            const cur = curTagCounts[rule.fromTag] || 0;
            const next = cur + (alreadyOwned ? 0 : 1);
            hints.push(`${rule.name} ${Math.min(next, rule.needCount)}/${rule.needCount}`);
        } else if (Array.isArray(rule.needTags) && rule.needTags.some((t) => tags.has(String(t)))) {
            hints.push(rule.name || '시너지');
        }
    }
    return hints;
}
/** 상점 카드: 시너지 진행 문구 — 호버 시 떠 있는 툴팁(전체 효과·미리보기) */
function buildShopSynergyHintsHtml(it) {
    if (!it || typeof synergyRules === 'undefined' || !Array.isArray(synergyRules)) return '';
    const tags = new Set();
    const tg = it.tags || it.tagList;
    if (Array.isArray(tg)) tg.forEach((t) => tags.add(String(t)));
    if (it.rarity) tags.add('rarity_' + String(it.rarity));
    if (it.type) tags.add('type_' + String(it.type));
    const curTagCounts = {};
    for (const x of player.items || []) {
        if (!x) continue;
        const xt = x.tags || x.tagList;
        if (Array.isArray(xt)) xt.forEach((t) => { const k = String(t); curTagCounts[k] = (curTagCounts[k] || 0) + 1; });
        if (x.rarity) {
            const k = 'rarity_' + String(x.rarity);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
        if (x.type) {
            const k = 'type_' + String(x.type);
            curTagCounts[k] = (curTagCounts[k] || 0) + 1;
        }
    }
    const alreadyOwned = (player.items || []).some((x) => x && x.name === it.name);
    const parts = [];
    for (const rule of synergyRules) {
        if (!rule) continue;
        if (rule.fromTag && tags.has(String(rule.fromTag)) && rule.needCount) {
            const cur = curTagCounts[rule.fromTag] || 0;
            const next = cur + (alreadyOwned ? 0 : 1);
            const need = rule.needCount;
            const label = `${rule.name} ${Math.min(next, need)}/${need}`;
            const willActive = next >= need;
            const popup = buildSynergyTooltipPopupHtml(rule, { mode: 'shop_fromTag', next, need, willActive });
            parts.push(
                `<span class="synergy-tip-wrap synergy-tip-wrap--shop"><span class="synergy-tip-trigger synergy-tip-trigger--shop">${escapeHtml(label)}</span>${popup}</span>`
            );
        } else if (Array.isArray(rule.needTags) && rule.needTags.some((t) => tags.has(String(t)))) {
            const popup = buildSynergyTooltipPopupHtml(rule, { mode: 'shop_needTags' });
            parts.push(
                `<span class="synergy-tip-wrap synergy-tip-wrap--shop"><span class="synergy-tip-trigger synergy-tip-trigger--shop">${escapeHtml(rule.name || '시너지')}</span>${popup}</span>`
            );
        }
    }
    if (!parts.length) return '';
    const sep = '<span class="shop-synergy-sep">·</span>';
    return `<div class="shop-card-synergy-inner"><span class="shop-card-synergy-label">시너지:</span>${parts.join(sep)}</div>`;
}
function ensureOwnedItemUid(it) {
    if (!it) return;
    if (!it._uid) it._uid = 'it_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function removeOwnedItemEffects(it) {
    if (!it || !player) return;
    if (it.type === 'rune') {
        if (typeof it.value === 'number' && it.value) {
            player.atk = Math.max(1, safeNum(player.atk, 1) - safeNum(it.value, 0));
        }
        if (typeof it.hpBonus === 'number' && it.hpBonus) {
            player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - safeNum(it.hpBonus, 0));
            player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0));
        }
        if (it.def) player.extraDef = Math.max(0, safeNum(player.extraDef, 0) - safeNum(it.def, 0));
        if (it.lifesteal) player.lifesteal = Math.max(0, safeNum(player.lifesteal, 0) - safeNum(it.lifesteal, 0));
        if (it.critBonus) player.crit = Math.max(1, safeNum(player.crit, 1) - safeNum(it.critBonus, 0));
        if (it.critMult) player.critMult = Math.max(1.8, safeNum(player.critMult, 1.8) - safeNum(it.critMult, 0));
        if (it.damageReduction) player.damageReduction = Math.max(0, safeNum(player.damageReduction, 0) - safeNum(it.damageReduction, 0));
        if (it.potionHealBonus) player.potionHealBonus = Math.max(0, safeNum(player.potionHealBonus, 0) - safeNum(it.potionHealBonus, 0));
        const hasRegen = (player.items || []).some((x) => x !== it && x && x.regenPotion);
        player.hasRegenPotion = !!hasRegen;
        recalcPlayerDivineGainMult();
        return;
    }
    if (it.type === 'atk' || it.type === 'ring') player.atk = Math.max(1, safeNum(player.atk, 1) - safeNum(it.value, 0));
    if (it.type === 'hp') {
        player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - safeNum(it.value, 0));
        player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0));
    }
    if (it.type !== 'rune' && typeof it.hpBonus === 'number' && it.hpBonus) {
        player.maxHp = Math.max(1, safeNum(player.maxHp, 1) - safeNum(it.hpBonus, 0));
        player.curHp = Math.min(getEffectiveMaxHp(), safeNum(player.curHp, 0));
    }
    if (it.def) player.extraDef = Math.max(0, safeNum(player.extraDef, 0) - safeNum(it.def, 0));
    if (it.lifesteal) player.lifesteal = Math.max(0, safeNum(player.lifesteal, 0) - safeNum(it.lifesteal, 0));
    if (it.critBonus) player.crit = Math.max(1, safeNum(player.crit, 1) - safeNum(it.critBonus, 0));
    if (it.critMult) player.critMult = Math.max(1.8, safeNum(player.critMult, 1.8) - safeNum(it.critMult, 0));
    if (it.damageReduction) player.damageReduction = Math.max(0, safeNum(player.damageReduction, 0) - safeNum(it.damageReduction, 0));
    if (it.potionHealBonus) player.potionHealBonus = Math.max(0, safeNum(player.potionHealBonus, 0) - safeNum(it.potionHealBonus, 0));
    if (it.penalty && it.penalty[player.name]) player.acc += safeNum(it.penalty[player.name], 0);
    const hasRegen = (player.items || []).some((x) => x !== it && x && x.regenPotion);
    player.hasRegenPotion = !!hasRegen;
    recalcPlayerDivineGainMult();
}
// stage 2 split: moved to js/shop.js

async function saveRank() {
    if(!currentUser) return;
    try {
        const bj = player.baseJob || player.name;
        const uid = getCurrentUserKey();
        const nick = getCurrentUserNick();
        if (!uid || !bj) return;
        const docId = `${uid}__${bj}`;
        const ref = db.collection("global_ranks").doc(docId);
        const old = await ref.get();
        const oldFloor = old.exists ? safeNum(old.data().floor, 0) : 0;
        if (old.exists && oldFloor >= floor) return;
        await ref.set({
            userId: uid,
            email: nick,
            displayName: nick,
            job: player.name,
            baseJob: bj,
            floor: floor,
            killer: enemy ? enemy.name : "알 수 없음",
            date: new Date().toLocaleDateString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch(e){console.error("랭킹 저장 에러:",e);}
}

async function loadRank() {
    try { renderRankBoard(); } catch(e){document.getElementById('rank-list').innerHTML='랭킹 서버 연결 실패';}
}

window.togglePatchNotes=(show)=>{document.getElementById('patch-modal').style.display=show?'flex':'none';};
window.toggleRank=(show)=>{
    document.getElementById('rank-modal').style.display=show?'flex':'none';
    if(show){
        if (currentUser && (!rankRealtimeUnsubs || !rankRealtimeUnsubs.length)) subscribeRankRealtime();
        loadRank();
    }
};
window.toggleInv = () => {};

window.mercGoldSkipCooldown = () => {
    if (!player || !isMercenaryCaptainJob()) return;
    const cost = getMercGoldSkipCost();
    if (gold < cost) return writeLog('[자본주의] 골드가 부족합니다.');
    gold -= cost;
    player.mercCooldownTurns = 0;
    player._mercCooldownSkipOnce = false;
    if (player.mercCompanionKind) {
        player.mercReviveAt90Percent = false;
        player.fieldMerc = buildFieldMercFromTemplate();
        player.fieldMerc.mercHp = player.fieldMerc.mercMaxHp;
        writeLog(`[자본주의] 🪙 ${cost}G로 동료를 만전 상태로 재전개! (${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp})`);
    } else {
        writeLog(`[자본주의] 🪙 ${cost}G로 쿨타임을 초기화했습니다!`);
    }
    updateUi(); renderActions();
};

window.useMercenarySlot = () => {
    writeLog('[고용] 고용 아이템 시스템은 폐지되었습니다. 시작 시 동료 선택·쿨 종료·🪙 긴급 재가동을 이용하세요.');
};
function codexItemMatchesTab(it, tab) {
    if (!it || !it.name) return false;
    if (tab === '용병') {
        const keys = new Set(getMercEquipmentJobKeys());
        if (it.type === 'merc') return false;
        if (!it.onlyFor || !Array.isArray(it.onlyFor) || it.onlyFor.length === 0) return true;
        return it.onlyFor.some((j) => keys.has(j));
    }
    if (tab === '성직자') {
        if (it.type === 'merc') return false;
        const of = it.onlyFor;
        return Array.isArray(of) && of.includes('성직자');
    }
    if (it.type === 'merc') return false;
    const of = it.onlyFor;
    if (tab === '공용') return !of || (Array.isArray(of) && of.length === 0);
    if (!of || !Array.isArray(of)) return false;
    const W = ['워리어', '나이트', '버서커'];
    const H = ['헌터', '궁수', '암살자'];
    const M = ['마법사', '위저드', '소환사'];
    if (tab === '워리어') return of.some((j) => W.includes(j));
    if (tab === '헌터') return of.some((j) => H.includes(j));
    if (tab === '마법사') return of.some((j) => M.includes(j));
    return false;
}

window.setCodexTab = (t) => {
    window._codexTab = t;
    toggleCollection(true);
};
window.setCodexStatFilter = (f) => {
    window._codexStatFilter = f || 'all';
    toggleCollection(true);
};
function getCodexStatMetric(it, filter) {
    if (!it) return 0;
    if (filter === 'atk') return safeNum(it.type === 'atk' ? it.value : 0, 0);
    if (filter === 'def') return safeNum(it.def, 0);
    if (filter === 'crit') return safeNum(it.critBonus, 0);
    if (filter === 'critMult') return safeNum(it.critMult, 0);
    if (filter === 'ring') return safeNum(it.type === 'ring' ? it.value : 0, 0);
    return 0;
}

window.toggleCollection = (show) => {
    if (show) {
        if (!window._codexTab) window._codexTab = '공용';
        if (!window._codexStatFilter) window._codexStatFilter = 'all';
        const mercMode = player && player.baseJob === '용병단장';
        if (mercMode && window._codexTab === '공용') window._codexTab = '용병';
        const tab = window._codexTab;
        const statFilter = window._codexStatFilter;
        const tabs = mercMode ? ['용병', '워리어', '헌터', '마법사'] : ['공용', '워리어', '헌터', '마법사', '성직자'];
        const collection = JSON.parse(localStorage.getItem('item_collection_v5') || '[]');
        const allItems = [
            ...equipmentPool,
            ...relicPool,
            ...Object.values(floorUnlocks).filter((i) => i && i.name),
            ...Object.values(floorUnlocksHunter).filter((i) => i && i.name),
            ...Object.values(floorUnlocksWizard).filter((i) => i && i.name),
        ];
        const seen = new Set();
        const uniqueItems = allItems.filter((i) => {
            if (!i || !i.name || seen.has(i.name)) return false;
            seen.add(i.name);
            return true;
        });
        let tabItems = uniqueItems.filter((i) => codexItemMatchesTab(i, tab));
        if (statFilter !== 'all') {
            tabItems = tabItems
                .filter((i) => getCodexStatMetric(i, statFilter) > 0)
                .sort((a, b) => getCodexStatMetric(b, statFilter) - getCodexStatMetric(a, statFilter));
        }
        const rarityLabels = {
            relic: { label: 'RELIC', color: '#f39c12', bg: '#2a1a0a' },
            legendary: { label: 'LEGENDARY', color: '#e74c3c', bg: '#2d1a1a' },
            epic: { label: 'EPIC', color: '#a55eea', bg: '#1e1a2d' },
            rare: { label: 'RARE', color: '#1e90ff', bg: '#1a1e2d' },
            common: { label: 'COMMON', color: '#888', bg: '#2a2a2a' },
        };
        const rarityOrder = { relic: 0, legendary: 1, epic: 2, rare: 3, common: 4 };
        const relicItems = tabItems.filter((i) => relicPool.some((r) => r.name === i.name));
        const equipItems = tabItems.filter((i) => !relicPool.some((r) => r.name === i.name));
        const tabBar = tabs
            .map(
                (t) =>
                    `<button type="button" onclick="setCodexTab('${t}')" style="margin:2px;padding:6px 10px;font-size:0.75em;font-weight:700;border-radius:6px;border:1px solid ${t === tab ? '#f1c40f' : '#444'};background:${t === tab ? '#2a2a1a' : '#111'};color:${t === tab ? '#f1c40f' : '#888'};cursor:pointer;">${t}</button>`
            )
            .join('');
        const statFilters = [
            { id: 'all', label: '전체' },
            { id: 'atk', label: '공격력 높은 순' },
            { id: 'def', label: '방어력 높은 순' },
            { id: 'crit', label: '치명 확률 높은 순' },
            { id: 'critMult', label: '치명 배율 높은 순' },
            { id: 'ring', label: '반지 공격 높은 순' },
        ];
        const statBar = statFilters
            .map(
                (x) =>
                    `<button type="button" onclick="setCodexStatFilter('${x.id}')" style="margin:2px;padding:6px 10px;font-size:0.72em;font-weight:700;border-radius:6px;border:1px solid ${x.id === statFilter ? '#2ed573' : '#444'};background:${x.id === statFilter ? '#122a1a' : '#111'};color:${x.id === statFilter ? '#2ed573' : '#888'};cursor:pointer;">${x.label}</button>`
            )
            .join('');
        let html = '';
        html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;align-items:center;">${tabBar}</div>`;
        html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;align-items:center;">${statBar}</div>`;
        html += `<p style="color:#888;font-size:0.85em;margin-bottom:15px;">탭: <b style="color:#f1c40f;">${tab}</b> · 해금: <b style="color:#f1c40f;">${collection.length}</b> / ${uniqueItems.length}</p>`;
        if (tab === '용병') {
            html += `<p style="color:#b87333;font-size:0.78em;margin:-8px 0 12px;line-height:1.45;">📜 <b>동료 장비 풀</b> — 전투 <b>💰 용병 지원</b>·상점 <b>직거래/자금 지원</b>으로 얻는 장비입니다. (이름 중복 없이 랜덤)</p>`;
        }
        if (tab === '성직자') {
            html += `<p style="color:#9b59b6;font-size:0.78em;margin:-8px 0 12px;line-height:1.45;">📜 <b>성직자 전용 장비</b> — 일부 장비에 <b>신성력 획득량 증가</b> 옵션이 붙어 있습니다.</p>`;
        }
        if (relicItems.length > 0) {
            html += `<div style="margin-bottom:16px;border-bottom:1px solid #333;padding-bottom:12px;"><div style="background:#2a2a0a;color:#f1c40f;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:8px;letter-spacing:1px;">✨ RELIC (유물)</div>`;
            relicItems.forEach((it) => {
                if (collection.includes(it.name)) {
                    const pref = isPreferredItem(it.name);
                    html += `<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #f1c40f;display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><div><div style="color:#f1c40f;font-weight:700;font-size:0.9em;">✅ ✨ ${formatShopItemName(it.name)}${pref ? ' <span style="color:#f1c40f;">★</span>' : ''}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${formatShopItemDesc(it.desc)}</div></div><button type="button" onclick="togglePreferredItem('${escapeJsSingleQuoteString(it.name)}')" style="background:${pref ? '#f1c40f' : '#111'};color:${pref ? '#111' : '#f1c40f'};border:1px solid #f1c40f;border-radius:8px;padding:6px 10px;font-weight:900;cursor:pointer;font-size:0.78em;">★</button></div>`;
                }
                else html += `<div style="padding:8px 10px;background:#0a0a0a;border-radius:6px;margin-bottom:4px;border-left:3px solid #333;"><div style="color:#444;font-weight:700;font-size:0.9em;">🔒 ???</div></div>`;
            });
            html += `</div>`;
        }
        const groups = { relic: [], legendary: [], epic: [], rare: [], common: [] };
        equipItems.sort((a, b) => (rarityOrder[a.rarity] ?? 9) - (rarityOrder[b.rarity] ?? 9));
        equipItems.forEach((it) => {
            const owned = collection.includes(it.name);
            const rk = it.rarity === 'relic' ? 'relic' : it.rarity || 'common';
            (groups[rk] || groups.common).push({ ...it, owned });
        });
        Object.entries(groups).forEach(([rarity, items]) => {
            if (!items.length) return;
            const { label, color, bg } = rarityLabels[rarity] || rarityLabels.common;
            html += `<div style="margin-bottom:12px;"><div style="background:${bg};color:${color};font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;letter-spacing:1px;">${label}</div>`;
            items.forEach((it) => {
                if (it.owned) {
                    const pref = isPreferredItem(it.name);
                    html += `<div style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid ${color};display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><div><div style="color:${color};font-weight:700;font-size:0.9em;">✅ ${formatShopItemName(it.name)}${pref ? ' <span style="color:#f1c40f;">★</span>' : ''}</div>${getEquipSlotLineHtml(it)}<div style="color:#666;font-size:0.78em;margin-top:3px;">${formatShopItemDesc(it.desc)}</div></div><button type="button" onclick="togglePreferredItem('${escapeJsSingleQuoteString(it.name)}')" style="background:${pref ? '#f1c40f' : '#111'};color:${pref ? '#111' : '#f1c40f'};border:1px solid #f1c40f;border-radius:8px;padding:6px 10px;font-weight:900;cursor:pointer;font-size:0.78em;">★</button></div>`;
                }
                else html += `<div style="padding:8px 10px;background:#0a0a0a;border-radius:6px;margin-bottom:4px;border-left:3px solid #333;"><div style="color:#444;font-weight:700;font-size:0.9em;">🔒 ???</div></div>`;
            });
            html += `</div>`;
        });
        document.getElementById('collection-list').innerHTML = html;
    }
    document.getElementById('collection-modal').style.display = show ? 'flex' : 'none';
};

/** 던전·상점 중 왼쪽 인벤 패널 (모달과 동일 내용) */
function renderInventoryPanel() {
    const invList = document.getElementById('inv-list');
    if (!invList || !player) return;
    const hasMercGear = isMercenaryCaptainJob() && player.mercInventory && player.mercInventory.length > 0;
    const rl = {
        legendary: { label: 'LEGENDARY', color: '#e74c3c', bg: '#2d1a1a' },
        epic: { label: 'EPIC', color: '#a55eea', bg: '#1e1a2d' },
        rare: { label: 'RARE', color: '#1e90ff', bg: '#1a1e2d' },
        common: { label: 'COMMON', color: '#888', bg: '#2a2a2a' },
    };
    let html = '';
    if (hasMercGear) {
        html += `<div style="margin-bottom:10px;"><div style="background:#164a35;color:#2ed573;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">🛡️ 용병 장비 (전열)</div>`;
        player.mercInventory.forEach((it) => {
            html += `<div class="inv-compact-block" style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #2ed573;"><div style="color:#2ed573;font-weight:700;font-size:0.9em;">${it.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${it.desc || ''}</div></div>`;
        });
        html += `</div>`;
    }
    if (player.relics && player.relics.length > 0) {
        html += `<div style="margin-bottom:10px;"><div style="background:#2a2a0a;color:#f1c40f;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">✨ RELIC</div>`;
        player.relics.forEach((ef) => {
            const r = relicPool.find((rp) => rp.effect === ef);
            if (r) {
                html += `<div class="inv-compact-block" style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #f1c40f;"><div style="color:#f1c40f;font-weight:700;font-size:0.9em;">✨ ${r.name}</div><div style="color:#666;font-size:0.78em;margin-top:3px;">${r.desc}</div></div>`;
            }
        });
        html += `</div>`;
    }
    if (player.bonusSkills && player.bonusSkills.length > 0) {
        html += `<div style="margin-bottom:10px;"><div style="background:#1a0a2a;color:#9b59b6;font-size:0.7em;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;">✨ 각성 스킬</div>`;
        const skillNames = {
            bonus_bleed: '피의 분노',
            bonus_regen: '강철 심장',
            bonus_explode: '폭발 일격',
            bonus_guard: '철벽',
            bonus_hunter_eye: '사냥꾼의 눈',
        };
        player.bonusSkills.forEach((s) => {
            html += `<div class="inv-compact-block" style="padding:8px 10px;background:#111;border-radius:6px;margin-bottom:4px;border-left:3px solid #9b59b6;"><div style="color:#9b59b6;font-weight:700;font-size:0.9em;">✨ ${skillNames[s] || s}</div></div>`;
        });
        html += `</div>`;
    }
    const ro = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const slotDefs = [
        { kind: 'rune', icon: '🔮', label: '각인 룬 슬롯', color: '#00cec9', hint: '최대 1개' },
        { kind: 'armor', icon: '🛡️', label: '갑옷 슬롯', color: '#74b9ff', hint: '최대 2개' },
        { kind: 'ring', icon: '💍', label: '반지 슬롯', color: '#9b59b6', hint: '최대 3개' },
        { kind: 'weapon', icon: '⚔️', label: '무기 슬롯', color: '#ffb347', hint: '최대 2개' },
    ];
    html += `<div class="inventory-slot-board">`;
    slotDefs.forEach((sdef) => {
        const limit = getEquipSlotLimit(sdef.kind);
        const slotItems = (player.items || [])
            .filter((it) => getEquipSlotKind(it) === sdef.kind)
            .sort((a, b) => (ro[a.rarity] || 3) - (ro[b.rarity] || 3));
        const cellCount = Math.max(limit, slotItems.length);
        html += `<section class="inventory-slot-section" style="--slot-accent:${sdef.color};">
            <div class="inventory-slot-header">
                <span class="inventory-slot-title">${sdef.icon} ${sdef.label}</span>
                <span class="inventory-slot-count">${slotItems.length}/${limit}</span>
            </div>
            <div class="inventory-slot-hint">${sdef.hint}</div>
            <div class="inventory-slot-grid">`;
        for (let i = 0; i < cellCount; i++) {
            const it = slotItems[i];
            if (!it) {
                html += `<div class="inventory-slot-cell inventory-slot-cell-empty">
                    <span class="inventory-empty-mark">+</span>
                    <span>비어 있음</span>
                </div>`;
                continue;
            }
            ensureOwnedItemUid(it);
            const rarity = it.rarity || 'common';
            const rarityInfo = rl[rarity] || rl.common;
            const bp = Math.max(0, safeNum(it._buyPrice != null ? it._buyPrice : it.price, 0));
            const rf = Math.floor(bp * 0.5);
            html += `<div class="inventory-slot-cell inventory-slot-cell-filled" style="--rarity-color:${rarityInfo.color};">
                <div class="inventory-item-top">
                    <span class="inventory-item-rarity" style="background:${rarityInfo.bg};color:${rarityInfo.color};">${rarityInfo.label}</span>
                    <button type="button" class="inventory-sell-btn" onclick="sellItemByUid('${escapeJsSingleQuoteString(it._uid)}')">판매</button>
                </div>
                <div class="inventory-item-name">${formatShopItemName(it.name)}</div>
                <div class="inventory-item-desc">${formatShopItemDesc(it.desc)}</div>
                <div class="inventory-item-price">판매가 <b>${rf}G</b></div>
            </div>`;
        }
        html += `</div></section>`;
    });
    html += `</div>`;
    if (!html.trim()) {
        html = '<div style="color:#555;text-align:center;padding:12px;">장비가 없습니다.</div>';
    }
    invList.innerHTML = html;
}

window.onclick=function(event){
    if(event.target===document.getElementById('patch-modal'))togglePatchNotes(false);
    if(event.target===document.getElementById('rank-modal'))toggleRank(false);
    if(event.target===document.getElementById('collection-modal'))toggleCollection(false);
    if(event.target===document.getElementById('evolution-modal'))toggleEvolutionMap(false);
};

// stage 1 split: moved to js/uiManager.js

// stage 4 split: moved to js/combatLogic.js

window.startInfiniteMode=()=>{
    floor=101; document.querySelector('.screen').innerHTML='';
    document.getElementById('battle-area').style.display='block'; enterBattleLayout();
    writeLog(`♾️ [무한모드] 101층부터 끝없는 도전!`); beginFloorEncounter(); updateUi();
};

// stage 4 split: moved to js/combatLogic.js

/** 사망 후 저장 런으로 복구 — 보존/페널티 없음 */
// stage 4 split: moved to js/combatLogic.js

/** 사망 처리: 보존 골드·퀘스트 페널티 후 허브로 */
// stage 4 split: moved to js/combatLogic.js

// ---- js/encounter.js ----
// Encounter module (stage 2 split)
const _PANIC_RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3, relic: 4 };
const ENCOUNTER_SCENE_WEIGHTS = {
    monster: 60,
    treasure: 10,
    rest: 8,
    altar: 14,
};
let restockCrossroadActive = false;
let restockCrossroadContext = null;
let resumeAfterRestockCrossroad = null;

function isBossFloorNumber(floorValue) {
    const floorNum = Math.max(1, Math.floor(safeNum(floorValue, 1)));
    return floorNum % 10 === 0;
}

function startBossFloorCombat(opts) {
    pendingShop = false;
    restockCrossroadActive = false;
    restockCrossroadContext = null;
    resumeAfterRestockCrossroad = null;
    window._encounterPhaseActive = false;
    window._encounterPhaseScene = null;
    window._pendingEncounterCombatMod = null;
    const enterBoss = () => {
        const shop = document.getElementById('shop-area');
        const battle = document.getElementById('battle-area');
        if (shop) shop.style.display = 'none';
        if (battle) battle.style.display = 'block';
        hideEncounterPhaseUI();
        spawnEnemy();
    };
    if (opts && opts.immediate) enterBoss();
    else transitionMainView(enterBoss);
}

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

function isRestockCrossroadFloor(f) {
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    return floorNum > 1 && floorNum % 3 === 0 && !isBossFloorNumber(floorNum);
}

function hasSeenRestockCrossroad(f) {
    if (!player) return true;
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    return Array.isArray(player._restockCrossroadsSeen) && player._restockCrossroadsSeen.includes(floorNum);
}

function markRestockCrossroadSeen(f) {
    if (!player) return;
    const floorNum = Math.max(1, Math.floor(safeNum(f, 1)));
    if (!Array.isArray(player._restockCrossroadsSeen)) player._restockCrossroadsSeen = [];
    if (!player._restockCrossroadsSeen.includes(floorNum)) player._restockCrossroadsSeen.push(floorNum);
    if (player._restockCrossroadsSeen.length > 40) player._restockCrossroadsSeen = player._restockCrossroadsSeen.slice(-40);
}

function buildRestockCrossroadHtml() {
    return `
<div class="restock-crossroad-card">
  <p class="restock-crossroad-kicker">${floor}층 재정비 분기점</p>
  <h2 class="restock-crossroad-title">희미한 등불</h2>
  <p class="restock-crossroad-copy">저 멀리 희미한 등불과 함께 조력자의 상점이 보입니다. 몬스터들의 기운도 강해지고 있습니다. 당신은 어떻게 하겠습니까?</p>
  <div class="restock-crossroad-actions">
    <button type="button" class="restock-crossroad-btn restock-crossroad-btn--shop" onclick="resolveRestockCrossroad('shop')">상점에 진입하여 재정비한다</button>
    <button type="button" class="restock-crossroad-btn restock-crossroad-btn--climb" onclick="resolveRestockCrossroad('climb')">상점을 무시하고 계속 등반한다</button>
  </div>
</div>`;
}

function hideEncounterPhaseUI() {
    const ep = document.getElementById('encounter-phase');
    const hud = document.getElementById('battle-hud');
    if (ep) {
        ep.style.display = 'none';
        ep.replaceChildren();
    }
    if (hud) hud.style.display = 'block';
}

function renderRestockCrossroad(opts) {
    setCombatProcessing(false);
    restockCrossroadActive = true;
    window._encounterPhaseActive = false;
    window._encounterPhaseScene = null;
    window._pendingEncounterCombatMod = null;
    enemy = null;
    const renderCrossroad = () => {
        const ep = document.getElementById('encounter-phase');
        const hud = document.getElementById('battle-hud');
        if (ep) {
            ep.replaceChildren();
            ep.style.display = 'block';
            ep.insertAdjacentHTML('beforeend', buildRestockCrossroadHtml());
        }
        if (hud) hud.style.display = 'none';
        updateUi();
        renderActions();
    };
    if (opts && opts.immediate) renderCrossroad();
    else transitionMainView(renderCrossroad);
}

function maybeStartRestockCrossroad(clearedFloor, flowKind, extraContext) {
    if (isBossFloorNumber(floor)) return false;
    if (!player || !isRestockCrossroadFloor(floor) || hasSeenRestockCrossroad(floor)) return false;
    markRestockCrossroadSeen(floor);
    restockCrossroadContext = {
        clearedFloor: Math.max(1, Math.floor(safeNum(clearedFloor, floor - 1))),
        flowKind: flowKind || 'encounter',
        defeatedBoss: !!(extraContext && extraContext.defeatedBoss),
    };
    renderRestockCrossroad();
    return true;
}

function resumeRestockCrossroadContext(context, opts) {
    const ctx = context || {};
    if (ctx.flowKind === 'battle') {
        winBattleContinueFrom(ctx.clearedFloor, {
            skipCrossroad: true,
            immediate: !!(opts && opts.immediate),
            defeatedBoss: !!ctx.defeatedBoss,
        });
        return;
    }
    beginFloorEncounter(opts && opts.immediate ? { immediate: true } : undefined);
}

window.resolveRestockCrossroad = function resolveRestockCrossroad(choice) {
    if (!player || !restockCrossroadActive) return;
    const context = restockCrossroadContext || {
        clearedFloor: Math.max(1, floor - 1),
        flowKind: 'encounter',
        defeatedBoss: false,
    };
    restockCrossroadActive = false;
    restockCrossroadContext = null;
    if (choice === 'shop') {
        resumeAfterRestockCrossroad = context;
        writeLog('[분기점] 조력자의 상점에 들러 재정비하기로 했습니다.');
        openShop();
        return;
    }
    writeLog('[분기점] 상점을 지나치고 위험한 등반을 계속합니다.');
    resumeRestockCrossroadContext(context);
};

function beginFloorEncounter(opts) {
    setCombatProcessing(false);
    if (isBossFloorNumber(floor)) {
        startBossFloorCombat(opts);
        return;
    }
    if (pendingShop) {
        spawnEnemy();
        return;
    }
    if (restockCrossroadActive) {
        renderRestockCrossroad(opts);
        return;
    }
    const scene = window._encounterPhaseScene || rollEncounterSceneType();
    window._encounterPhaseScene = scene;
    window._encounterPhaseActive = true;
    enemy = null;
    const renderEncounter = () => {
        const ep = document.getElementById('encounter-phase');
        const hud = document.getElementById('battle-hud');
        if (ep) {
            ep.replaceChildren();
            ep.style.display = 'block';
            ep.insertAdjacentHTML('beforeend', buildEncounterPhaseHtml(scene));
        }
        if (hud) hud.style.display = 'none';
        updateUi();
        renderActions();
    };
    if (opts && opts.immediate) renderEncounter();
    else transitionMainView(renderEncounter);
}

window.enterCombatFromEncounter = function enterCombatFromEncounter() {
    if (!player) return;
    window._encounterPhaseActive = false;
    window._encounterPhaseScene = null;
    window._pendingEncounterCombatMod = null;
    transitionMainView(() => {
        hideEncounterPhaseUI();
        spawnEnemy();
    });
};

window.ambushEncounterEnemy = function ambushEncounterEnemy() {
    if (!player || !window._encounterPhaseActive) return;
    const success = Math.random() < 0.5;
    window._encounterPhaseActive = false;
    window._encounterPhaseScene = null;
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
    transitionMainView(() => {
        hideEncounterPhaseUI();
        spawnEnemy();
    });
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
        const baseGain = typeof computeFloorGoldReward === 'function'
            ? computeFloorGoldReward(floor, { multiplier: 1.1 })
            : Math.max(15, 6 + Math.floor(Math.random() * 5) + floor * 3);
        const gain = Math.floor(baseGain * goldMult);
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
    if (maybeStartRestockCrossroad(prevFloor, 'encounter')) return;
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
    if (maybeStartRestockCrossroad(Math.max(1, floor - 1), 'encounter')) return;
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
        if (maybeStartRestockCrossroad(Math.max(1, floor - 1), 'encounter')) return;
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
    if (maybeStartRestockCrossroad(Math.max(1, floor - 1), 'encounter')) return;
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
    if (maybeStartRestockCrossroad(Math.max(1, floor - 1), 'encounter')) return;
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
    if (maybeStartRestockCrossroad(Math.max(1, floor - 1), 'encounter')) return;
    beginFloorEncounter();
};

function winBattleContinueFrom(clearedFloor, opts) {
    const defeatedBoss = opts && typeof opts.defeatedBoss === 'boolean' ? opts.defeatedBoss : !!(enemy && enemy.isBoss);
    if (isBossFloorNumber(floor)) {
        beginFloorEncounter(opts && opts.immediate ? { immediate: true } : undefined);
        return;
    }
    if (!(opts && opts.skipCrossroad) && maybeStartRestockCrossroad(clearedFloor, 'battle', { defeatedBoss })) return;
    if (floor === 15 && player.name === '소환사' && !localStorage.getItem('summon_altar_done')) {
        setTimeout(() => showContractAltar(), 500);
        return;
    }
    if (checkEventFloor(floor)) {
        setTimeout(() => showEventFloor(), 500);
        return;
    }
    if (clearedFloor > 5 && !defeatedBoss && Math.random() < 0.15) {
        if (clearedFloor === 10 && !player.evolved) setTimeout(() => checkEvolution(), 300);
        setTimeout(() => showRandomEncounter(), 500);
        return;
    }
    if (clearedFloor === 10 && !player.evolved) {
        beginFloorEncounter(opts && opts.immediate ? { immediate: true } : undefined);
        setTimeout(() => checkEvolution(), 300);
        return;
    }
    beginFloorEncounter(opts && opts.immediate ? { immediate: true } : undefined);
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
window.buildRestockCrossroadHtml = buildRestockCrossroadHtml;
window.renderRestockCrossroad = renderRestockCrossroad;
window.maybeStartRestockCrossroad = maybeStartRestockCrossroad;
window.resumeRestockCrossroadContext = resumeRestockCrossroadContext;
window.beginFloorEncounter = beginFloorEncounter;
window.buildAltarEncounterOptions = buildAltarEncounterOptions;
window.pushPassiveContractHistory = pushPassiveContractHistory;
window.advanceFloorAfterNonCombatEncounter = advanceFloorAfterNonCombatEncounter;
window.checkEventFloor = checkEventFloor;
window.showEventFloor = showEventFloor;
window.showContractAltar = showContractAltar;
window.showRandomEncounter = showRandomEncounter;
window.winBattleContinueFrom = winBattleContinueFrom;

// ---- js/shop.js ----
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
    const crossroadContext = typeof resumeAfterRestockCrossroad !== 'undefined'
        ? resumeAfterRestockCrossroad
        : null;
    resumeAfterRestockCrossroad = null;
    transitionMainView(() => {
        document.getElementById('shop-area').style.display='none';
        document.getElementById('battle-area').style.display='block';
        if (crossroadContext && typeof resumeRestockCrossroadContext === 'function') {
            resumeRestockCrossroadContext(crossroadContext, { immediate: true });
        } else {
            beginFloorEncounter({ immediate: true });
        }
    });
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
    return it && it.onlyFor && Array.isArray(it.onlyFor) && it.onlyFor.length === 1 && it.onlyFor[0] === '용병단장';
}

/** 일반 상점용: 용병 계약 + 단장 전용 장비 제외 */
function getNonMercEquipmentPool() {
    return equipmentPool.filter((i) => {
        if (!i || i.type === 'merc') return false;
        if (mercCaptainExclusiveItem(i)) return false;
        // 전직 전용 아이템 해금 시스템(기본 직업 플레이로 해금)
        if (i.onlyFor && Array.isArray(i.onlyFor) && i.onlyFor.length === 1) {
            const evo = i.onlyFor[0];
            if (isEvolutionJobName(evo)) {
                // 전직 직업으로 플레이할 때만, '해금 완료(3개)' 후에, 해금된 이름만 등장
                if (!player || player.name !== evo) return false;
                if (!isEvolutionItemSetUnlocked(evo)) return false;
                if (!isEvolutionItemNameUnlocked(evo, i.name)) return false;
            }
        }
        return true;
    });
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
        return applyGoldenBalanceShopPrice({ ...baseItem });
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
    return !!it && ['atk', 'hp', 'ring', 'rune'].includes(String(it.type || ''));
}

function getShopSynergyFingerprint(it) {
    const rawTags = Array.isArray(it && it.tags) ? it.tags : [];
    const tags = rawTags
        .map((t) => String(t || '').trim())
        .filter((t) => t && !/^rarity_/i.test(t) && !/^type_/i.test(t))
        .sort();
    return tags.length ? tags.join('+') : 'none';
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
            const ar = relicPool.filter((r) => {
                if (player.relics.includes(r.effect)) return false;
                if (!r.onlyFor) return true;
                return r.onlyFor.some((j) => j === player.name || j === player.baseJob);
            });
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
            if (item.onlyFor) {
                const allowed = Array.isArray(item.onlyFor) ? item.onlyFor : [item.onlyFor];
                if (!allowed.includes(player.name) && !allowed.includes(player.baseJob)) continue;
            }
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
        const synHtml = buildShopSynergyHintsHtml(it);
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
                if(it.penalty&&it.penalty[player.name]){player.acc-=it.penalty[player.name];writeLog(`[패널티] 명중률 -${it.penalty[player.name]}% 적용`);}
            }
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
window.applyGoldenBalanceShopPrice = applyGoldenBalanceShopPrice;
window.applyShopRarityTuning = applyShopRarityTuning;
window.getShopRarityBoostPrice = getShopRarityBoostPrice;
window.renderShopItems = renderShopItems;
window.formatShopItemName = formatShopItemName;
window.formatShopItemDesc = formatShopItemDesc;
window.mercCaptainExclusiveItem = mercCaptainExclusiveItem;
window.getNonMercEquipmentPool = getNonMercEquipmentPool;

// ---- js/combatLogic.js ----
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
    if (!fm) return Math.min(CRIT_SOFT_CAP, getRawCritChance(0));
    const bonus = safeNum(fm.mercBonusCrit, 0);
    return Math.min(CRIT_SOFT_CAP, getRawCritChance(bonus));
}

function getMercEffectiveCritMultForMercAttack() {
    const fm = player.fieldMerc;
    const bonusCrit = fm ? safeNum(fm.mercBonusCrit, 0) : 0;
    const bonusMult = fm ? safeNum(fm.mercBonusCritMult, 0) * 0.85 : 0;
    return clampCritMultiplier(getCritBaseMultBeforeOverflow(bonusMult) + getCritOverflowMultBonus(bonusCrit));
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
        if (!it || it.type === 'merc' || it.type === 'rune') return false;
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

function useTacticalSkillAction(skillKey) {
    if (!player || !enemy) return false;
    const key = String(skillKey || '').trim();
    const owned = Array.isArray(player.tacticalSkills) ? player.tacticalSkills : [];
    const def = typeof getTacticalSkillDef === 'function' ? getTacticalSkillDef(key) : null;
    if (!key || !def || !owned.includes(key)) {
        writeLog('[전술] 아직 배운 전술 스킬이 아닙니다.');
        return false;
    }
    player.tacticalSkillUses = player.tacticalSkillUses && typeof player.tacticalSkillUses === 'object'
        ? player.tacticalSkillUses
        : {};
    if (player.tacticalSkillUses[key]) {
        writeLog('[전술] 이 전투에서 이미 사용한 스킬입니다.');
        return false;
    }
    if (key === 'focus' && player.tacticalFocusReady) return false;
    if (key === 'parry' && player.tacticalParryReady) return false;
    if (key === 'barrier' && player.tacticalBarrierReady) return false;
    player.tacticalSkillUses[key] = 1;
    if (key === 'focus') player.tacticalFocusReady = true;
    if (key === 'parry') player.tacticalParryReady = true;
    if (key === 'barrier') player.tacticalBarrierReady = true;
    writeLog(`[전술] <b>${def.icon || '✦'} ${def.name}</b> — ${def.battleLog || def.shortDesc || '전술 준비 완료'}`);
    updateUi();
    renderActions();
    return true;
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

    if (String(type || '').startsWith('전술:')) {
        const key = String(type).split(':')[1] || '';
        if (!useTacticalSkillAction(key)) {
            setCombatProcessing(false);
            return;
        }
        queueEnemyTurnWithPacing();
        return;
    }

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
            if (player.tacticalFocusReady) {
                const focusDef = typeof getTacticalSkillDef === 'function' ? getTacticalSkillDef('focus') : null;
                effectiveCrit = Math.min(100, effectiveCrit + safeNum(focusDef && focusDef.critBonus, 60));
                player.tacticalFocusReady = false;
                effectMsg += "<b style='color:#a78bfa'>🎯 집중 공격!</b> ";
            }
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
        } else { writeLog(`[빗나감] 공격 실패!`); showMissFloat('enemy'); }
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
        if (player.name !== '성직자') {
            setCombatProcessing(false);
            return writeLog('[기도] 성직자만 사용할 수 있습니다.');
        }
        normalizeDivineState();
        if (clampDivinePower(player.divinePower) >= DIVINE_POWER_MAX) {
            setCombatProcessing(false);
            return writeLog(`[기도] 신성력은 이미 최대치입니다. (${DIVINE_POWER_MAX}/${DIVINE_POWER_MAX})`);
        }
        player.prayerCountThisTurn = safeNum(player.prayerCountThisTurn, 0);
        if (player.prayerCountThisTurn >= 2) {
            setCombatProcessing(false);
            return writeLog('[기도] 이번 턴에는 최대 2번만 기도할 수 있습니다.');
        }
        const gain = (1 + safeNum(player.prayerBonusFlat, 0)) * safeNum(player.divineGainMult, 1);
        const actualGain = addDivinePower(gain);
        player.prayerVulnerableHits = 1;
        player.prayerCountThisTurn += 1;
        writeLog(
            `[신성력] 🙏 기도 — 신성력 <b>+${formatDivinePowerForDisplay(actualGain)}</b> (합계 ${formatDivinePowerForDisplay(
                player.divinePower
            )} / 최대 ${DIVINE_POWER_MAX}) · 다음 피격 2배`
        );
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
    const potionHealMult = typeof getPlayerPotionHealMultiplier === 'function'
        ? getPlayerPotionHealMultiplier()
        : 1;
    const potionHeal = (maxHp, ratio) => Math.max(1, Math.floor(maxHp * ratio * potionHealMult));
    if (isMercenaryCaptainJob() && player.fieldMerc && player.fieldMerc.mercHp > 0) {
        if (player.hasRegenPotion) {
            player.mercRegenTurns = 2;
            player.mercRegenAmount = potionHeal(player.fieldMerc.mercMaxHp, 0.22);
            writeLog(`[포션] 🧪 용병에게 서서히 회복! (2턴간 매 적 턴 전 ${player.mercRegenAmount})`);
        } else {
            const h = potionHeal(player.fieldMerc.mercMaxHp, 0.38);
            player.fieldMerc.mercHp = Math.min(player.fieldMerc.mercMaxHp, player.fieldMerc.mercHp + h);
            writeLog(`[포션] 🧪 용병 체력 ${h} 회복! (${player.fieldMerc.mercHp}/${player.fieldMerc.mercMaxHp})`);
        }
    } else if (isMercenaryCaptainJob()) {
        const h = potionHeal(getEffectiveMaxHp(), 0.12);
        player.curHp = Math.min(getEffectiveMaxHp(), player.curHp + h);
        writeLog(`[포션] 🧪 단장 긴급 체력 ${h} (동료 없음·최소 회복)`);
    } else if(player.hasRegenPotion){regenTurns=2;regenAmount=potionHeal(getEffectiveMaxHp(),0.25);writeLog(`[포션] 🧪 서서히 회복! (2턴간 매 턴 ${regenAmount})`);}
    else{const h=potionHeal(getEffectiveMaxHp(),0.35);player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+h);writeLog(`[포션] 🧪 즉시 체력 ${h} 회복!`);}
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
                showMissFloat('player');
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
                let tacticalNullified = false;
                if (player.tacticalParryReady) {
                    player.tacticalParryReady = false;
                    tacticalNullified = true;
                    dmg = 0;
                    writeLog('[전술] 🛡️ 패링 성공 — 이번 피격을 무효화했습니다.');
                    triggerGuardAura();
                    showMissFloat('player');
                } else if (player.tacticalBarrierReady) {
                    player.tacticalBarrierReady = false;
                    tacticalNullified = true;
                    dmg = 0;
                    writeLog('[전술] ✨ 방어막 발동 — 이번 피격을 완전히 흘렸습니다.');
                    triggerGuardAura();
                    showMissFloat('player');
                } else if(shieldedTurns>0){dmg=Math.floor(dmg*0.5);shieldedTurns--;writeLog(`[방어막] ✨ 피해 50% 감소! (${dmg} 입음)`); triggerGuardAura(); if(player.relics&&player.relics.includes('barrier_reflect')){const rd=Math.floor(dmg*0.45);enemy.curHp-=rd;const heal=Math.floor(getEffectiveMaxHp()*0.05);player.curHp=Math.min(getEffectiveMaxHp(),player.curHp+heal);writeLog(`[유물] 🔮 마력 방벽: 반사 ${rd}, 회복 ${heal}`);if(enemy.curHp<=0){setTimeout(()=>winBattle(),100);}}}
                else if(defendingTurns>0){dmg=Math.floor(dmg*0.4);defendingTurns--;writeLog(`[철벽 방어] 🛡️ 피해 60% 감소! (${dmg} 입음)`); triggerGuardAura();}
                else writeLog(`[피격] 적의 공격! ${dmg} 데미지.`);
                if (!tacticalNullified) {
                    if (player.summon && player.summon.id === 'golem') {
                        dmg = Math.max(1, Math.floor(dmg * 0.90));
                        writeLog(`[소환] 🪨 골렘이 피해를 줄였습니다! (${dmg})`);
                    }
                    if (player.prayerVulnerableHits && player.prayerVulnerableHits > 0) {
                        dmg = Math.max(1, Math.floor(dmg * 2));
                        player.prayerVulnerableHits = 0;
                        writeLog('[기도 반동] ⚠️ 기도의 반동으로 이번 피격 피해가 2배가 되었습니다.');
                    }
                    const gearReduction = typeof getPlayerDamageReduction === 'function'
                        ? getPlayerDamageReduction()
                        : 0;
                    if (gearReduction > 0 && dmg > 0) {
                        const beforeReduction = dmg;
                        dmg = Math.max(1, Math.floor(dmg * (1 - gearReduction)));
                        if (beforeReduction !== dmg) {
                            writeLog(`[장비] 피해 감소 ${Math.round(gearReduction * 100)}% 적용 (${beforeReduction} → ${dmg})`);
                        }
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
                }
            } else { writeLog(`[럭키] 적의 공격이 빗나갔습니다!`); showMissFloat('player'); }
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
    const baseGain = typeof computeFloorGoldReward === 'function'
        ? computeFloorGoldReward(floor, { isBoss: !!(enemy && enemy.isBoss) })
        : Math.max(15, 6 + Math.floor(Math.random() * 5) + floor * 3);
    let bonus=0, bonusMsg="";
    const relKey=getAffinityRelKey();
    if(!enemy.isBoss&&relations[relKey]&&relations[relKey].weak===enemy.job){bonus=Math.floor(baseGain*0.3);bonusMsg=` <b style='color:#f1c40f'>(역전 보너스 +${bonus}G!)</b>`;}
    const goldMult = typeof getPlayerGoldGainMult === 'function' ? getPlayerGoldGainMult() : 1;
    const gain = Math.floor((baseGain + bonus) * goldMult);
    gold+=gain; totalGoldEarned+=gain;
    { const _em = getEffectiveMaxHp(); player.curHp = Math.min(_em, player.curHp + Math.floor(_em * 0.15)); }
    writeLog(`[승리] ${gain}G 획득 및 체력 소량 회복.${bonusMsg}`);
    if (player.tutorialBattleActive) {
        player.tutorialBattleActive = false;
        player.prologueLocked = false;
        writeLog('[튜토리얼] 첫 전투를 넘겼습니다. 이제 마굴을 오르며 잃어버린 기억을 추적합니다.');
        if (typeof updatePrologueBattleControls === 'function') updatePrologueBattleControls();
    }
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
    const defeatedBoss = !!(enemy && enemy.isBoss);
    const continueAfterVictory = () => {
        if (floor % 100 === 0 && floor >= 100 && defeatedBoss) return milestoneCenturyFloor();
        if (floor > 20 && player.farmingStay) proceedWinBattleFarmContinue();
        else proceedWinBattleNextFloor();
    };
    if (typeof showVictoryRewardAndAwaitContinue === 'function') {
        showVictoryRewardAndAwaitContinue(
            {
                clearedFloor: floor,
                goldGain: gain,
                expGain,
                defeatedBoss,
            },
            continueAfterVictory
        );
    } else {
        continueAfterVictory();
    }
}

function dungeonClear() {
    triggerBossWarning(false);
    const sg=Math.floor(totalGoldEarned*0.1), ps=getSavedGold();
    const clearTitle = typeof getPlayerClassDisplayName === 'function' ? getPlayerClassDisplayName() : player.name;
    localStorage.setItem('saved_gold',ps+sg); exitBattleLayout();
    document.getElementById('battle-area').style.display='none';
    document.querySelector('.screen').innerHTML=`<div style="text-align:center;padding:40px 20px;"><h2 style="color:#f1c40f;font-size:2em;">🏆 던전 클리어!</h2><p style="color:#e0e0e0;font-size:1.1em;margin:15px 0;"><b style="color:#f1c40f;">${escapeHtml(clearTitle)}</b>이(가) 100층을 정복했습니다!</p><p style="color:#2ed573;font-size:0.95em;margin-bottom:5px;">💰 보존 골드: <b>${sg}G</b></p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px;"><button onclick="startInfiniteMode()" style="background:#9b59b6;color:#fff;padding:14px 24px;font-size:1em;font-weight:700;">♾️ 무한모드 도전</button><button onclick="location.reload()" style="background:#f1c40f;color:#111;padding:14px 24px;font-size:1em;font-weight:700;">🏠 메인으로</button></div></div>`;
    writeLog(`🏆 ${escapeHtml(clearTitle)}이(가) 100층을 클리어했습니다!!!`);
}

function gameOver() {
    setCombatProcessing(false);
    triggerBossWarning(false);
    window.__deathApplied = false;
    const carriedGold = Math.max(0, Math.floor(safeNum(gold, 0)));
    const sg = Math.floor(carriedGold * 0.2);
    const lostGold = Math.max(0, carriedGold - sg);
    const slotId = player && player.metaSlotId;
    const enName = enemy ? enemy.name : '알 수 없는 적';
    const fl = floor;
    const rescuedItems = player && Array.isArray(player.items)
        ? player.items.filter((it) => it && it.type !== 'merc' && getEquipSlotKind(it))
        : [];
    window.__deathCtx = { sg, lostGold, slotId, floor: fl, enemyName: enName, rescuedItemCount: rescuedItems.length };

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
    const lostGold = d.lostGold != null ? d.lostGold : Math.max(0, Math.floor(safeNum(gold, 0)) - sg);
    const slotId = d.slotId;
    const fl = d.floor != null ? d.floor : floor;
    const enName = d.enemyName || '알 수 없는 적';
    let rescuedItemCount = d.rescuedItemCount != null ? d.rescuedItemCount : 0;
    if (typeof MetaRPG !== 'undefined') {
        if (slotId) {
            if (typeof MetaRPG.preserveRescueInventory === 'function') {
                rescuedItemCount = MetaRPG.preserveRescueInventory(slotId, player && player.items);
            } else if (typeof MetaRPG.clearRunSnapshot === 'function') {
                MetaRPG.clearRunSnapshot(slotId);
            }
        }
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
    writeLog(
        `💀 ${fl}층에서 ${enName}에게 패배했습니다. 구조대가 베이스캠프로 회수했습니다. ` +
            `장비 ${rescuedItemCount}개 보존, 골드 ${lostGold}G 손실, ${sg}G 회수.`
    );
    if (typeof MetaRPG !== 'undefined' && slotId) MetaRPG.setActiveSlot(slotId);
    player = null;
    enemy = null;
    floor = 1;
    gold = 0;
    totalGoldEarned = 0;
    pendingShop = false;
    exitBattleLayout();
    document.getElementById('battle-area').style.display = 'none';
    document.getElementById('shop-area').style.display = 'none';
    showPreGameScreen();
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

// ---- js/bootstrapCore.js ----
// Bootstrap shell (post-migration)
(function bootstrapShellInit() {
    // keep file as orchestrator placeholder only
    window.__bootstrapShellReady = true;
})();

window.addEventListener('load', () => {
    // All runtime logic is loaded from domain modules.
});

// ---- game.js ----
// Thin controller entrypoint after modular split.
// Core runtime lives in js/bootstrapCore.js and feature modules.
(function gameControllerInit() {
    window.__gameControllerReady = true;
})();

// ---- js/security.js ----
// Browser hardening layer. Loaded last inside bundle.js.
(function installDungeonClientHardening() {
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
        'exportFullSave',
        'importFullSave',
        'openBaseCampTech',
        'buyTechNode',
        'continuePastCentury',
        'returnToHubFromCenturyMilestone',
        'reincarnateFromCenturyMilestone',
        'togglePreferredItem',
        'togglePatchNotes',
        'toggleRank',
        'toggleInv',
        'mercGoldSkipCooldown',
        'useMercenarySlot',
        'setCodexTab',
        'setCodexStatFilter',
        'toggleCollection',
        'startInfiniteMode',
        'leaveShopContinueAscent',
        'leaveShopTrainHere',
        'nextFloor',
        'rerollShop',
        'buyPotionOffer',
        'buyShopRarityBoost',
        'sellItemByUid',
        'buyItem',
        'mercenaryFundGacha',
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
        'MetaRPG',
        'BASE_CAMP_FLOORS',
        'applyOfficialStatsToEquipmentItem',
        'clampEquipmentItemStatsToRarityCaps',
        'computeEquipmentGoldPrice',
        'computeFloorGoldReward',
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
        'consumeHunterEvasionMissPenalty',
        'renderActions',
        'renderPassiveContractHistoryPanels',
        'updateUi',
        'writeLog',
        'spawnEnemy',
        'tryActivateFloorQuest',
        'getEnemyScalingForFloor',
        'buildEnemyStatsForFloor',
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
    ];

    for (const name of internalExportNames) {
        if (!Object.prototype.hasOwnProperty.call(window, name)) continue;
        try {
            delete window[name];
        } catch (err) {
            console.warn(`[보안] 내부 전역 제거 실패: ${name}`, err);
        }
    }

    for (const name of protectedStateNames) {
        if (Object.prototype.hasOwnProperty.call(window, name)) continue;
        try {
            Object.defineProperty(window, name, {
                get() {
                    return undefined;
                },
                set() {
                    console.warn(`[보안] '${name}' 상태는 런타임 클로저 내부에 캡슐화되어 있습니다.`);
                    return false;
                },
                enumerable: false,
                configurable: false,
            });
        } catch (err) {
            console.warn(`[보안] 전역 상태 보호 실패: ${name}`, err);
        }
    }

    for (const name of publicApiNames) {
        const value = window[name];
        if (typeof value !== 'function') continue;
        try {
            Object.defineProperty(window, name, {
                value,
                writable: false,
                enumerable: false,
                configurable: false,
            });
        } catch (err) {
            console.warn(`[보안] 공개 API 잠금 실패: ${name}`, err);
        }
    }

    try {
        Object.defineProperty(window, '__DUNGEON_SECURE_BUILD', {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false,
        });
    } catch (err) {
        console.warn('[보안] 보안 빌드 플래그 설정 실패', err);
    }
})();


})();
