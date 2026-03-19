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
};

const jobBase = {
    Warrior: { name: '워리어', hp: 320, atk: 22, def: 10, color: '#ff4757' },
    Hunter:  { name: '헌터',   hp: 280, atk: 26, def: 5,  color: '#2ed573' },
    Wizard:  { name: '마법사', hp: 200, atk: 52, def: 3,  color: '#1e90ff' },
};

const jobEvolutions = {
    '워리어': [
        { name: '나이트',  trigger: 'defense2', bonusAtk: 24, bonusDef: 18, bonusHp: 420, desc: '철벽 수호자. 방어력과 체력이 크게 증가한다.' },
        { name: '버서커', trigger: 'attack2',  bonusAtk: 42, bonusDef: 5,  bonusHp: 340, desc: '광전사. 공격력이 폭발하지만 체력이 줄어든다.' },
    ],
    '헌터': [
        { name: '궁수',   trigger: 'bow',      bonusAtk: 34, bonusDef: 6,  bonusHp: 370, bonusAcc: 15, desc: '원거리 특화. 공격력과 명중률이 상승한다.' },
        { name: '암살자', trigger: 'dagger',   bonusAtk: 46, bonusDef: 4,  bonusHp: 320, desc: '그림자 암살자. 공격력이 크게 오르지만 방어가 약해진다.' },
    ],
    '마법사': [
        { name: '위저드',  trigger: 'staff',  bonusAtk: 78, bonusDef: 2,  bonusHp: 260, desc: '고위 마법사. 마법 공격력이 폭발적으로 증가한다.' },
        { name: '소환사',  trigger: 'robe',   bonusAtk: 58, bonusDef: 10, bonusHp: 320, desc: '소환사. 소환수의 방어막으로 생존력이 증가한다.' },
    ],
};

// 층 달성 해금 아이템 (10층마다 공용, 5층마다 직업별)
const floorUnlocks = {
    // 공용 해금 (10층마다)
    10:  { name: "용기의 목걸이",     type: "hp",  value: 40, def: 5,  price: 60,  rarity: "rare",      desc: "10층 달성 해금. 체력(+40), 방어(+5)." },
    20:  { name: "전사의 팔찌",       type: "atk", value: 18, price: 75,  rarity: "rare",      desc: "20층 달성 해금. 공격력(+18)." },
    30:  { name: "불사조의 깃털",     type: "hp",  value: 60, price: 90,  rarity: "epic",      regenPotion: true, desc: "30층 달성 해금. 체력(+60). 포션 효과 강화." },
    40:  { name: "심연의 보석",       type: "atk", value: 25, price: 110, rarity: "epic",      lifesteal: 0.2, desc: "40층 달성 해금. 공격력(+25). 흡혈 20%." },
    50:  { name: "천공의 갑옷",       type: "hp",  value: 100, def: 20, price: 150, rarity: "epic",     desc: "50층 달성 해금. 체력(+100), 방어(+20)." },
    60:  { name: "파멸의 검",         type: "atk", value: 40, price: 160, rarity: "legendary", lifesteal: 0.3, desc: "60층 달성 해금. 공격력(+40). 흡혈 30%." },
    70:  { name: "불멸의 반지",       type: "hp",  value: 120, def: 25, price: 180, rarity: "legendary", desc: "70층 달성 해금. 체력(+120), 방어(+25)." },
    80:  { name: "신의 축복",         type: "atk", value: 55, acc: 15, price: 200, rarity: "legendary", desc: "80층 달성 해금. 공격력(+55), 명중률(+15%)." },
    90:  { name: "용왕의 비늘",       type: "hp",  value: 150, def: 30, price: 220, rarity: "legendary", desc: "90층 달성 해금. 체력(+150), 방어(+30)." },
    100: { name: "전설의 유산",       type: "atk", value: 80, acc: 20, price: 250, rarity: "legendary", lifesteal: 0.4, desc: "100층 달성! 전설의 유산. 공격력(+80), 명중률(+20%), 흡혈 40%." },

    // 직업별 해금 (5층마다) - 워리어/나이트/버서커
    5:   { name: "철의 의지",   type: "hp",  value: 30, def: 8,  price: 50,  rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "5층 달성 해금. 워리어 계열 전용. 체력(+30), 방어(+8)." },
    15:  { name: "광전사의 도끼", type: "atk", value: 20, price: 70, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "15층 달성 해금. 워리어 계열 전용. 공격력(+20)." },
    25:  { name: "성기사의 방패", type: "hp",  value: 50, def: 18, price: 100, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "25층 달성 해금. 워리어 계열 전용. 체력(+50), 방어(+18)." },
    35:  { name: "분노의 갑옷",  type: "hp",  value: 80, def: 22, price: 130, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "35층 달성 해금. 워리어 계열 전용. 체력(+80), 방어(+22)." },
    45:  { name: "전쟁신의 검",  type: "atk", value: 50, price: 160, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], unlockSkill: "신성한 강타", desc: "45층 달성 해금. 워리어 계열 전용. 공격력(+50). [신성한 강타] 스킬 해제." },
};

// 5층마다 헌터/마법사 계열 해금 아이템 별도 정의
const floorUnlocksHunter = {
    5:  { name: "독수리의 눈",   type: "acc", value: 20, price: 50,  rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "5층 달성 해금. 헌터 계열 전용. 명중률(+20%)." },
    15: { name: "바람의 화살",   type: "atk", value: 18, price: 70,  rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "15층 달성 해금. 헌터 계열 전용. 공격력(+18)." },
    25: { name: "그림자 단검",   type: "atk", value: 30, price: 100, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], lifesteal: 0.2, desc: "25층 달성 해금. 헌터 계열 전용. 공격력(+30), 흡혈 20%." },
    35: { name: "암살자의 망토", type: "hp",  value: 40, price: 120, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "35층 달성 해금. 헌터 계열 전용. 체력(+40)." },
    45: { name: "정령의 화살통", type: "atk", value: 45, price: 160, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], unlockSkill: "정령 폭발", desc: "45층 달성 해금. 헌터 계열 전용. 공격력(+45). [정령 폭발] 스킬 해제." },
};

const floorUnlocksWizard = {
    5:  { name: "마나의 수정",   type: "atk", value: 15, price: 50,  rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "5층 달성 해금. 마법사 계열 전용. 공격력(+15)." },
    15: { name: "고대의 서적",   type: "atk", value: 25, price: 70,  rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "15층 달성 해금. 마법사 계열 전용. 공격력(+25)." },
    25: { name: "혼돈의 오브",   type: "atk", value: 38, price: 100, rarity: "epic", onlyFor: ["마법사","위저드","소환사"], desc: "25층 달성 해금. 마법사 계열 전용. 공격력(+38)." },
    35: { name: "시간의 모래시계", type: "hp", value: 50, def: 10, price: 120, rarity: "epic", onlyFor: ["마법사","위저드","소환사"], desc: "35층 달성 해금. 마법사 계열 전용. 체력(+50), 방어(+10)." },
    45: { name: "신계의 마법진", type: "atk", value: 60, price: 160, rarity: "legendary", onlyFor: ["마법사","위저드","소환사"], unlockSkill: "차원 붕괴", desc: "45층 달성 해금. 마법사 계열 전용. 공격력(+60). [차원 붕괴] 스킬 해제." },
};

// 영구 강화 — 각 스탯 20단계, 점진적 비용 증가
function generateUpgrades(id, name, effectKey, baseEffect, baseCost, costMult) {
    return Array.from({length: 20}, (_, i) => ({
        id: `${id}_${i+1}`,
        name: `${name} Lv.${i+1}`,
        desc: `${name} +${baseEffect * (i+1)} 영구 적용 (누적)`,
        effect: { [effectKey]: baseEffect },
        price: Math.floor(baseCost * Math.pow(costMult, i)),
        maxBuy: 1
    }));
}

const permanentUpgrades = [
    ...generateUpgrades('hp',  '체력',   'hp',     20,  20,  1.35),
    ...generateUpgrades('atk', '공격력', 'atk',    3,   30,  1.4),
    ...generateUpgrades('def', '방어력', 'def',    2,   25,  1.4),
    ...generateUpgrades('acc', '명중률', 'acc',    2,   25,  1.45),
    ...generateUpgrades('pot', '포션',   'potion', 1,   40,  1.5),
];

const equipmentPool = [
    const equipmentPool = [
    // ===== 워리어 전용 =====
    { name: "거인족의 대검",      type: "atk", value: 22, price: 90,  rarity: "epic",      onlyFor: ["워리어"], unlockSkill: "대회전",  evolTrigger: "attack2",  desc: "워리어 전용. 공격력(+22). [💥 대회전] 스킬 해제." },
    { name: "미스릴 흉갑",        type: "hp",  value: 80, def: 16, price: 90,  rarity: "epic",      onlyFor: ["워리어"], bonusHp: 40, evolTrigger: "defense2", desc: "워리어 전용. 체력(+80), 방어(+16)." },
    { name: "용사의 방패",        type: "hp",  value: 50, def: 14, price: 60,  rarity: "rare",      onlyFor: ["워리어"], evolTrigger: "defense2", desc: "워리어 전용. 체력(+50), 방어(+14)." },
    { name: "전쟁의 도끼",        type: "atk", value: 18, price: 70,  rarity: "rare",      onlyFor: ["워리어"], evolTrigger: "attack2",  desc: "워리어 전용. 공격력(+18)." },
    { name: "분노의 투구",        type: "atk", value: 12, price: 50,  rarity: "common",    onlyFor: ["워리어"], penalty: {'워리어': 10}, desc: "워리어 전용. 공격력(+12). 방어 성공률 -10%." },

    // ===== 헌터 전용 =====
    { name: "정령왕의 활",        type: "atk", value: 22, price: 95,  rarity: "epic",      onlyFor: ["헌터"], bonusAtk: 20, unlockSkill: "폭풍화살", evolTrigger: "bow",    desc: "헌터 전용. 공격력(+22). [🌪️ 폭풍화살] 스킬 해제." },
    { name: "암살자의 단검",      type: "atk", value: 18, price: 70,  rarity: "rare",      onlyFor: ["헌터"], bonusAtk: 15, evolTrigger: "dagger",  desc: "헌터 전용. 공격력(+18)." },
    { name: "독화살 통",          type: "atk", value: 14, price: 55,  rarity: "rare",      onlyFor: ["헌터"], evolTrigger: "bow",     desc: "헌터 전용. 공격력(+14)." },
    { name: "그림자 망토",        type: "hp",  value: 40, def: 4, price: 45,  rarity: "common",    onlyFor: ["헌터"], evolTrigger: "dagger",  desc: "헌터 전용. 체력(+40), 방어(+4)." },
    { name: "사냥꾼의 장갑",      type: "acc", value: 18, price: 50,  rarity: "common",    onlyFor: ["헌터"], desc: "헌터 전용. 명중률(+18%)." },

    // ===== 마법사 전용 =====
    { name: "대마법사의 지팡이",  type: "atk", value: 28, price: 100, rarity: "epic",      onlyFor: ["마법사"], bonusAtk: 25, unlockSkill: "메테오",  evolTrigger: "staff",   desc: "마법사 전용. 공격력(+28). [🔥 메테오] 스킬 해제." },
    { name: "학자의 로브",        type: "hp",  value: 50, def: 6, price: 45,  rarity: "common",    onlyFor: ["마법사"], bonusAcc: 12, evolTrigger: "robe",    desc: "마법사 전용. 체력(+50), 방어(+6), 명중률(+12%)." },
    { name: "마력 증폭기",        type: "atk", value: 20, price: 75,  rarity: "rare",      onlyFor: ["마법사"], evolTrigger: "staff",   desc: "마법사 전용. 공격력(+20)." },
    { name: "정령의 로브",        type: "hp",  value: 65, def: 8, price: 65,  rarity: "rare",      onlyFor: ["마법사"], evolTrigger: "robe",    desc: "마법사 전용. 체력(+65), 방어(+8)." },
    { name: "마나 크리스탈",      type: "atk", value: 15, price: 50,  rarity: "common",    onlyFor: ["마법사"], desc: "마법사 전용. 공격력(+15)." },

    // ===== 공용 =====
    { name: "드래곤의 심장",      type: "hp",  value: 130, def: 14, price: 180, rarity: "legendary", desc: "전설. 체력(+130), 방어(+14)." },
    { name: "엑스칼리버",         type: "atk", value: 45, acc: 10, price: 200, rarity: "legendary", desc: "전설. 공격력(+45), 명중률(+10%)." },
    { name: "흡혈 반지",          type: "atk", value: 8,  price: 60,  rarity: "rare",      lifesteal: 0.15, desc: "공용. 공격력(+8). 공격 시 피해의 15% 체력 흡수." },
    { name: "흡혈 망토",          type: "hp",  value: 35, price: 75,  rarity: "rare",      lifesteal: 0.25, desc: "공용. 체력(+35). 공격 시 피해의 25% 체력 흡수." },
    { name: "저주받은 검",        type: "atk", value: 38, price: 100, rarity: "epic",      penalty: { '워리어': 15, '헌터': 20, '마법사': 25 }, desc: "공용. 공격력(+38). 명중률 대폭 하락." },
    { name: "바람의 부츠",        type: "acc", value: 20, price: 55,  rarity: "rare",      desc: "공용. 명중률(+20%)." },
    { name: "중갑옷",             type: "hp",  value: 75, def: 12, price: 65,  rarity: "rare",      penalty: { '마법사': 20, '헌터': 15 }, desc: "공용. 체력(+75), 방어(+12). 마법사·헌터는 명중률 감소." },
    { name: "낡은 가죽 갑옷",     type: "hp",  value: 35, def: 4,  price: 25,  rarity: "common",    desc: "공용. 체력(+35), 방어(+4)." },
    { name: "회복의 목걸이",      type: "hp",  value: 20, price: 40,  rarity: "common",    regenPotion: true, desc: "공용. 체력(+20). 포션 사용 시 2턴간 서서히 회복." },
    { name: "대지의 반지",        type: "hp",  value: 45, def: 5,  price: 50,  rarity: "common",    desc: "공용. 체력(+45), 방어(+5)." },
];
