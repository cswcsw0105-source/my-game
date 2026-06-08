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
