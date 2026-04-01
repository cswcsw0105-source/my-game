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

const jobBase = {
    Warrior: { name: '워리어', hp: 275, atk: 18, def: 8, color: '#ff4757' },
    Hunter:  { name: '헌터',   hp: 240, atk: 22, def: 5,  color: '#2ed573' },
    Wizard:  { name: '마법사', hp: 170, atk: 44, def: 3,  color: '#1e90ff' },
    /** 동료 용병이 싸움. 단장은 직접 전투 불가에 가깝게 최하위 ATK */
    MercenaryCaptain: { name: '용병단장', hp: 200, atk: 5, def: 4, color: '#e67e22' },
};

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
        { name: '나이트',  bonusAtk: 20, bonusDef: 14, bonusHp: 370, desc: '철벽 수호자. 방어력과 체력이 크게 증가한다.', ult: '신성한 강타' },
        { name: '버서커',  bonusAtk: 34, bonusDef: 5,  bonusHp: 300, desc: '광전사. 공격력이 폭발하지만 체력이 줄어든다.', ult: '분노의 일격' },
    ],
    '헌터': [
        { name: '궁수',   bonusAtk: 27, bonusDef: 6,  bonusHp: 325, bonusAcc: 10, desc: '원거리 특화. 공격력과 명중률이 상승한다.', ult: '폭풍화살' },
        { name: '암살자', bonusAtk: 34, bonusDef: 4,  bonusHp: 280, desc: '그림자 암살자. 공격력이 크게 오르지만 방어가 약해진다.', ult: '그림자 찌르기' },
    ],
    '마법사': [
        { name: '위저드',  bonusAtk: 52, bonusDef: 3,  bonusHp: 245, desc: '고위 마법사. 마법 공격력이 폭발적으로 증가한다.', ult: '메테오' },
        { name: '소환사',  bonusAtk: 40, bonusDef: 9, bonusHp: 285, desc: '소환사. 소환수의 방어막으로 생존력이 증가한다.', ult: '차원 붕괴' },
        { name: '성직자',  bonusAtk: 38, bonusDef: 12, bonusHp: 270, desc: '신성력으로 버틴다. 공격 시 신성력 축적·기도로 가속.', ult: '성광 심판' },
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

const equipmentPool = [
    // ===== 워리어 전용 =====
    { name: "거인족의 대검",      type: "atk", value: 21, price: 90,  rarity: "epic",   onlyFor: ["워리어","나이트","버서커"], critBonus: 6,  desc: "워리어 계열. 공격력(+22). 치명타 확률(+6%)." },
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
];

/**
 * v7 시너지(리워크): 등급별 아이템 조합 시 추가 효과
 * @type {{id:string,name:string,fromTag:string,needCount:number,bonus:{atk?:number,hp?:number,def?:number,acc?:number,crit?:number,critMult?:number},effectDesc:string}[]}
 */
const synergyRules = [
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
    if ((it.type === 'atk' || it.type === 'ring') && typeof it.value === 'number') parts.push(`공격(+${it.value})`);
    if (it.type === 'hp' && typeof it.value === 'number') parts.push(`체력(+${it.value})`);
    if (typeof it.def === 'number' && it.def !== 0) {
        parts.push(it.def > 0 ? `방어(+${it.def})` : `방어(${it.def})`);
    }
    if (typeof it.critBonus === 'number') parts.push(`치명(+${it.critBonus}%)`);
    if (typeof it.critMult === 'number') parts.push(`치명 배율(+${Math.round(it.critMult * 100)}%)`);
    if (typeof it.lifesteal === 'number') parts.push(`흡혈(${Math.round(it.lifesteal * 100)}%)`);
    if (typeof it.divinityGainBonus === 'number') parts.push(`신성 획득(+${Math.round(it.divinityGainBonus * 100)}%)`);
    return parts;
}

function rebuildEquipmentDesc(it, opts) {
    if (!it || it.type === 'relic') return;
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

/** 등급별 총 예산(pt). Legend·Legendary 동일. (상한 강화에 맞춰 소폭 하향) */
const BUDGET_BY_RARITY = {
    common: 44,
    rare: 88,
    epic: 132,
    legendary: 172,
    legend: 172,
};

/** 등급별 스탯 상한 — 과도한 수치 방지(상점/배분 공통) */
function _statMaxForRarity(rk) {
    const R = {
        common: { atk: 26, hp: 95, def: 22, crit: 22, cm: 18, ls: 22 },
        rare: { atk: 38, hp: 155, def: 34, crit: 32, cm: 24, ls: 28 },
        epic: { atk: 52, hp: 220, def: 48, crit: 42, cm: 30, ls: 34 },
        legendary: { atk: 65, hp: 290, def: 62, crit: 52, cm: 36, ls: 40 },
        legend: { atk: 65, hp: 290, def: 62, crit: 52, cm: 36, ls: 40 },
    };
    const k = String(rk || 'common').toLowerCase();
    return R[k] || R.common;
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

/**
 * 스탯 총합(STAT_COST_X100) + 희귀도 계수로 골드 가격 산출 — 상점·해금·드랍 공통.
 */
function computeEquipmentGoldPrice(it) {
    if (!it || it.type === 'relic') return _safeNumForPrice(it && it.price, 0);
    const C = STAT_COST_X100;
    let pt = 0;
    if (it.type === 'hp') pt += C.hp * Math.max(0, _safeNumForPrice(it.value, 0));
    else if (it.type === 'atk' || it.type === 'ring') pt += C.atk * Math.max(0, _safeNumForPrice(it.value, 0));
    pt += C.def * Math.max(0, _safeNumForPrice(it.def, 0));
    pt += C.crit * Math.max(0, _safeNumForPrice(it.critBonus, 0));
    pt += C.cm * Math.max(0, _safeNumForPrice(it.critMult, 0) * 100);
    pt += C.ls * Math.max(0, _safeNumForPrice(it.lifesteal, 0) * 100);
    const rk = String(it.rarity || 'common').toLowerCase();
    const tier = { common: 1, rare: 1.1, epic: 1.26, legendary: 1.42, legend: 1.42 }[rk] || 1;
    const prayer = _safeNumForPrice(it.prayerBonus, 0) * 400;
    const div = _safeNumForPrice(it.divinityGainBonus, 0) * 5200;
    const regen = it.regenPotion ? 1600 : 0;
    const base = 14 + (pt / 100) * 0.34 * tier + prayer + div + regen;
    return Math.max(8, Math.floor(base));
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
 * 등급·특징별 예산 100% 랜덤 배분. 유물(relic 타입·relic 등급) 제외.
 * 상점 복제본에도 동일 적용을 위해 window에 노출.
 */
function applyOfficialStatsToEquipmentItem(it, opts) {
    if (!it) return it;
    const o = opts || {};
    if (it.type === 'relic' || String(it.rarity || '').toLowerCase() === 'relic') return it;

    if (it.tags && it.tags.includes('synergy_priest')) {
        clampEquipmentItemStatsToRarityCaps(it);
        it.price = computeEquipmentGoldPrice(it);
        if (o.rebuildDesc !== false) rebuildEquipmentDesc(it, o);
        return it;
    }

    const rk = String(it.rarity || 'common').toLowerCase();
    const B = BUDGET_BY_RARITY[rk] ?? BUDGET_BY_RARITY.common;
    let Bx = Math.round(B * 100);
    const tagsKey = Array.isArray(it.tags) ? [...it.tags].sort().join(',') : '';
    const seedStr = `${it.name}|${rk}|${it.type}|${tagsKey}`;
    const rnd = _budgetMulberry32(_budgetHashSeed(seedStr));

    const strictFill = !(rk === 'epic' || rk === 'legendary' || rk === 'legend');
    const concept = _detectItemConcept(it);
    it.itemConceptKey = concept;
    it._itemConceptLabelKo = ITEM_CONCEPT_LABEL_KO[concept] || '유틸/하이브리드';

    const keywordTheme = _detectKeywordTheme(it);
    it.keywordThemeKey = keywordTheme || '';
    it._keywordThemeLabelKo = keywordTheme ? KEYWORD_THEME_LABEL_KO[keywordTheme] : '';

    let ch = _mergeNamePersonalityChannels(it, _snapshotStatChannels(it), strictFill);
    ch = _narrowChannelsForConcept(it, ch, concept);
    ch = _enforceEpicLegendChannelBounds(ch, it, rk, rnd);
    const nCh = ['atk', 'hp', 'def', 'crit', 'cm', 'ls'].filter((k) => ch[k]).length;
    Bx = Math.round(Bx * Math.min(1.16, 1 + 0.032 * Math.max(0, nCh - 3)));
    let a = _allocateBudgetToStats(Bx, ch, rnd, rk, it);
    a = _ensureEpicLegendChannelMinimums(a, ch, rk, rnd);
    a = _applyVar15PctToAllocatedStats(a, rnd, it);
    a = _applyRuinTradeoff(it, a, keywordTheme, rnd);
    a = _ensureMinStatLinesAfterRoll(it, a, ch, rk, rnd);

    const round1 = (x) => Math.max(0, Math.round((Number(x) || 0) * 10) / 10);

    delete it.def;
    delete it.acc;
    delete it.critBonus;
    delete it.critMult;
    delete it.lifesteal;

    if (it.type === 'atk' || it.type === 'ring') it.value = Math.max(1, a.atk);
    else if (it.type === 'hp') it.value = Math.max(1, a.hp);

    if (a.def !== 0) it.def = a.def;
    if (a.crit > 0) it.critBonus = round1(a.crit);
    if (a.cm > 0) it.critMult = a.cm / 100;
    if (a.ls > 0) it.lifesteal = a.ls / 100;

    it._officialStatApplied = true;
    clampEquipmentItemStatsToRarityCaps(it);
    if (o.forgeRecipe) {
        it.price = 0;
    } else {
        it.price = computeEquipmentGoldPrice(it);
    }
    if (o.rebuildDesc !== false) rebuildEquipmentDesc(it, o);
    return it;
}

/** 저장 데이터·구버전 보정: 등급 상한으로 장비 수치 클램프 후 설명 갱신 */
function clampEquipmentItemStatsToRarityCaps(it) {
    if (!it || it.type === 'relic' || it.type === 'merc') return it;
    const rk = String(it.rarity || 'common').toLowerCase();
    const M = _statMaxForRarity(rk);
    if (typeof it.value === 'number') {
        if (it.type === 'hp') it.value = Math.max(1, Math.min(M.hp, it.value));
        else if (it.type === 'atk' || it.type === 'ring') it.value = Math.max(1, Math.min(M.atk, it.value));
    }
    if (typeof it.def === 'number') {
        const negCap = rk === 'legendary' || rk === 'legend' ? -22 : -16;
        it.def = Math.min(M.def, Math.max(negCap, it.def));
    }
    if (typeof it.critBonus === 'number') it.critBonus = Math.min(M.crit, Math.max(0, it.critBonus));
    if (typeof it.critMult === 'number') it.critMult = Math.min(M.cm / 100, Math.max(0, it.critMult));
    if (typeof it.lifesteal === 'number') it.lifesteal = Math.min(M.ls / 100, Math.max(0, it.lifesteal));
    return it;
}

if (typeof window !== 'undefined') {
    window.applyOfficialStatsToEquipmentItem = applyOfficialStatsToEquipmentItem;
    window.clampEquipmentItemStatsToRarityCaps = clampEquipmentItemStatsToRarityCaps;
    window.computeEquipmentGoldPrice = computeEquipmentGoldPrice;
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
