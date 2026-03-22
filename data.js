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
};

const floorUnlocks = {
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
    5:   { name: "철의 의지",   type: "hp",  value: 30, def: 8,  price: 50,  rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "5층 해금. 워리어 계열. 체력(+30), 방어(+8)." },
    15:  { name: "광전사의 도끼", type: "atk", value: 20, price: 70, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "15층 해금. 워리어 계열. 공격력(+20)." },
    25:  { name: "성기사의 방패", type: "hp",  value: 50, def: 18, price: 100, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "25층 해금. 워리어 계열. 체력(+50), 방어(+18)." },
    35:  { name: "분노의 갑옷",  type: "hp",  value: 80, def: 22, price: 130, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "35층 해금. 워리어 계열. 체력(+80), 방어(+22)." },
    45:  { name: "전쟁신의 갑주", type: "hp",  value: 60, def: 28, price: 160, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], desc: "45층 해금. 워리어 계열. 체력(+60), 방어(+28)." },
};

const floorUnlocksHunter = {
    5:  { name: "독수리의 눈",   type: "acc", value: 20, price: 50,  rarity: "rare", onlyFor: ["헌터","궁수","암살자"], tags: ["precision"], desc: "5층 해금. 헌터 계열. 명중률(+20%)." },
    15: { name: "바람의 화살",   type: "atk", value: 18, price: 70,  rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "15층 해금. 헌터 계열. 공격력(+18)." },
    25: { name: "그림자 단검",   type: "atk", value: 30, price: 100, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], lifesteal: 0.2, desc: "25층 해금. 헌터 계열. 공격력(+30), 흡혈 20%." },
    35: { name: "암살자의 망토", type: "hp",  value: 40, price: 120, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "35층 해금. 헌터 계열. 체력(+40)." },
    45: { name: "정령의 화살통", type: "atk", value: 45, price: 160, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], desc: "45층 해금. 헌터 계열. 공격력(+45)." },
};

const floorUnlocksWizard = {
    5:  { name: "마나의 수정",   type: "atk", value: 15, price: 50,  rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "5층 해금. 마법사 계열. 공격력(+15)." },
    15: { name: "고대의 서적",   type: "atk", value: 25, price: 70,  rarity: "rare", onlyFor: ["마법사","위저드","소환사"], desc: "15층 해금. 마법사 계열. 공격력(+25)." },
    25: { name: "혼돈의 오브",   type: "atk", value: 38, price: 100, rarity: "epic", onlyFor: ["마법사","위저드","소환사"], desc: "25층 해금. 마법사 계열. 공격력(+38)." },
    35: { name: "시간의 모래시계", type: "hp", value: 50, def: 10, price: 120, rarity: "epic", onlyFor: ["마법사","위저드","소환사"], desc: "35층 해금. 마법사 계열. 체력(+50), 방어(+10)." },
    45: { name: "신계의 마법진", type: "atk", value: 60, price: 160, rarity: "legendary", onlyFor: ["마법사","위저드","소환사"], desc: "45층 해금. 마법사 계열. 공격력(+60)." },
};

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
    { name: "광전사의 팔찌", type: "atk", value: 14, lifesteal: 0.06, price: 72, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], tags: ["blood", "heavy"], desc: "공격(+14), 흡혈(6%)." },
    { name: "수호 기사의 인장", type: "hp", value: 35, def: 14, price: 65, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+35), 방어(+14)." },
    { name: "철의 반지", type: "atk", value: 12, def: 5, price: 60, rarity: "rare", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+12), 방어(+5)." },
    // 워리어 — epic x5 (fix: use hp+def instead of invalid type def)
    { name: "룬문자 대검", type: "atk", value: 24, critBonus: 5, price: 118, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+24), 치명(+5%)." },
    { name: "드워프 판금", type: "hp", value: 70, def: 14, price: 115, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+70), 방어(+14)." },
    { name: "피의 맹세", type: "atk", value: 20, lifesteal: 0.1, price: 122, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+20), 흡혈(10%)." },
    { name: "성역의 방패", type: "hp", value: 55, def: 18, price: 120, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+55), 방어(+18)." },
    { name: "전장의 함성", type: "atk", value: 18, critMult: 0.12, price: 125, rarity: "epic", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+18), 치명 배율(+12%)." },
    // 워리어 — legendary x5
    { name: "태양검 엑소더스", type: "atk", value: 38, critBonus: 8, critMult: 0.15, price: 195, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+38), 치명(+8%), 배율(+15%)." },
    { name: "불멸의 요새", type: "hp", value: 120, def: 24, price: 200, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], desc: "체력(+120), 방어(+24)." },
    { name: "광기의 도끼 루트", type: "atk", value: 42, lifesteal: 0.12, price: 205, rarity: "legendary", onlyFor: ["버서커"], desc: "버서커. 공격(+42), 흡혈(12%)." },
    { name: "성기사의 성배", type: "hp", value: 90, def: 20, price: 198, rarity: "legendary", onlyFor: ["나이트"], desc: "나이트. 체력(+90), 방어(+20)." },
    { name: "전쟁신의 유산", type: "atk", value: 35, def: 12, price: 210, rarity: "legendary", onlyFor: ["워리어","나이트","버서커"], desc: "공격(+35), 방어(+12)." },
    // 헌터 계열 — common x5
    { name: "나무 활", type: "atk", value: 8, price: 29, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+8)." },
    { name: "가죽 장갑", type: "acc", value: 10, price: 31, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "명중(+10%)." },
    { name: "작은 단검", type: "atk", value: 10, critBonus: 2, price: 33, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+10), 치명(+2%)." },
    { name: "숲길 장화", type: "hp", value: 32, price: 27, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "체력(+32)." },
    { name: "독침 화살", type: "atk", value: 9, lifesteal: 0.04, price: 35, rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+9), 흡혈(4%)." },
    // 헌터 — rare x5
    { name: "바람의 시위", type: "acc", value: 16, critBonus: 4, price: 66, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "명중(+16%), 치명(+4%)." },
    { name: "암살자의 가면", type: "atk", value: 17, critMult: 0.15, price: 74, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+17), 치명 배율(+15%)." },
    { name: "맹금의 깃털", type: "atk", value: 15, acc: 8, price: 69, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+15), 명중(+8%)." },
    { name: "그림자 장화", type: "hp", value: 38, def: 5, price: 71, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "체력(+38), 방어(+5)." },
    { name: "독니 화살", type: "atk", value: 16, lifesteal: 0.08, price: 73, rarity: "rare", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+16), 흡혈(8%)." },
    // 헌터 — epic x5
    { name: "폭풍 시위", type: "atk", value: 26, acc: 12, price: 124, rarity: "epic", onlyFor: ["궁수"], desc: "궁수. 공격(+26), 명중(+12%)." },
    { name: "암흑 각오", type: "atk", value: 30, critMult: 0.28, price: 128, rarity: "epic", onlyFor: ["암살자"], desc: "암살자. 공격(+30), 치명 배율(+28%)." },
    { name: "정찰병의 망원경", type: "acc", value: 22, critBonus: 6, price: 119, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "명중(+22%), 치명(+6%)." },
    { name: "맹독 가죽", type: "atk", value: 24, lifesteal: 0.1, price: 126, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+24), 흡혈(10%)." },
    { name: "천둥 화살", type: "atk", value: 28, critBonus: 7, price: 127, rarity: "epic", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+28), 치명(+7%)." },
    // 헌터 — legendary x5
    { name: "별빛 석궁", type: "atk", value: 40, acc: 15, critBonus: 9, price: 202, rarity: "legendary", onlyFor: ["궁수"], desc: "궁수. 공격(+40), 명중(+15%), 치명(+9%)." },
    { name: "심연의 낫", type: "atk", value: 44, critMult: 0.35, lifesteal: 0.1, price: 208, rarity: "legendary", onlyFor: ["암살자"], desc: "암살자. 공격(+44), 배율(+35%), 흡혈(10%)." },
    { name: "천둥신의 활시위", type: "atk", value: 36, critMult: 0.22, price: 198, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+36), 치명 배율(+22%)." },
    { name: "바람의 군주", type: "atk", value: 38, acc: 14, price: 204, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+38), 명중(+14%)." },
    { name: "피의 계약서", type: "atk", value: 32, lifesteal: 0.14, critBonus: 8, price: 206, rarity: "legendary", onlyFor: ["헌터","궁수","암살자"], desc: "공격(+32), 흡혈(14%), 치명(+8%)." },
    // 마법사 계열 — common x5
    { name: "마나 잔류석", type: "atk", value: 9, price: 30, rarity: "common", onlyFor: ["마법사","위저드","소환사"], tags: ["arcane"], desc: "공격(+9)." },
    { name: "초급 주문서", type: "atk", value: 7, critBonus: 2, price: 28, rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+7), 치명(+2%)." },
    { name: "마법사 학도 로브", type: "hp", value: 40, def: 5, price: 32, rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "체력(+40), 방어(+5)." },
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
    { name: "소환진 팔찌", type: "hp", value: 75, def: 11, lifesteal: 0.1, price: 124, rarity: "epic", onlyFor: ["소환사"], desc: "소환사. 체력(+75), 방어(+11), 흡혈(10%)." },
    { name: "혼돈 오브", type: "atk", value: 27, critBonus: 7, price: 121, rarity: "epic", onlyFor: ["마법사","위저드","소환사"], desc: "공격(+27), 치명(+7%)." },
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
    { name: "구리 반지", type: "atk", value: 2, price: 12, rarity: "common", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 공격(+2)." },
    { name: "이끼 낀 돌", type: "hp", value: 9, def: 1, price: 13, rarity: "common", desc: "공용. 체력(+9), 방어(+1)." },
    { name: "가죽 끈", type: "acc", value: 4, price: 14, rarity: "common", desc: "공용. 명중(+4%)." },
    { name: "작은 철못", type: "atk", value: 4, price: 15, rarity: "common", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 공격(+4)." },
    { name: "마른 허브", type: "hp", value: 7, price: 11, rarity: "common", onlyFor: ["마법사", "위저드", "소환사"], tags: ["arcane"], desc: "마계. 체력(+7)." },
    { name: "부서진 수정", type: "atk", value: 4, critBonus: 1, price: 16, rarity: "common", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+4), 치명(+1%)." },
    { name: "녹슨 못", type: "atk", value: 3, def: 1, price: 12, rarity: "common", desc: "공용. 공격(+3), 방어(+1)." },
    { name: "짚신", type: "hp", value: 8, price: 10, rarity: "common", desc: "공용. 체력(+8)." },
    { name: "유리 조각", type: "atk", value: 5, critBonus: 1, price: 18, rarity: "common", desc: "공용. 공격(+5), 치명(+1%)." },
    { name: "작은 방울", type: "acc", value: 5, price: 17, rarity: "common", desc: "공용. 명중(+5%)." },
    { name: "밧줄 조각", type: "hp", value: 10, price: 14, rarity: "common", desc: "공용. 체력(+10)." },
    { name: "납 동전", type: "atk", value: 4, price: 13, rarity: "common", desc: "공용. 공격(+4)." },
    { name: "마른 고기", type: "hp", value: 11, price: 15, rarity: "common", lifesteal: 0.02, desc: "공용. 체력(+11), 흡혈(2%)." },
    { name: "작은 방패 파편", type: "hp", value: 9, def: 2, price: 19, rarity: "common", onlyFor: ["워리어", "나이트", "버서커"], tags: ["heavy"], desc: "워계. 체력(+9), 방어(+2)." },
    { name: "깃털 화살", type: "atk", value: 5, acc: 3, price: 20, rarity: "common", onlyFor: ["헌터", "궁수", "암살자"], tags: ["precision"], desc: "헌계. 공격(+5), 명중(+3%)." },
    { name: "연습용 오브", type: "atk", value: 5, critMult: 0.04, price: 21, rarity: "common", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+5), 치명 배율(+4%)." },
    { name: "청동 팔찌", type: "atk", value: 6, def: 1, price: 22, rarity: "rare", desc: "공용. 공격(+6), 방어(+1)." },
    { name: "은박 반지", type: "hp", value: 14, price: 24, rarity: "rare", desc: "공용. 체력(+14)." },
    { name: "가는 철검", type: "atk", value: 7, critBonus: 2, price: 26, rarity: "rare", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 공격(+7), 치명(+2%)." },
    { name: "사냥꾼 주머니", type: "atk", value: 6, lifesteal: 0.03, price: 27, rarity: "rare", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 공격(+6), 흡혈(3%)." },
    { name: "마력 잔물결", type: "atk", value: 6, price: 25, rarity: "rare", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+6)." },
    { name: "단단한 가죽", type: "hp", value: 16, def: 2, price: 28, rarity: "rare", desc: "공용. 체력(+16), 방어(+2)." },
    { name: "바람 깃털", type: "acc", value: 8, critBonus: 1, price: 29, rarity: "rare", desc: "공용. 명중(+8%), 치명(+1%)." },
    { name: "작은 루비", type: "atk", value: 8, price: 32, rarity: "rare", desc: "공용. 공격(+8)." },
    { name: "강철 버클", type: "hp", value: 13, def: 3, price: 31, rarity: "rare", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 체력(+13), 방어(+3)." },
    { name: "야간 투시경", type: "acc", value: 9, price: 33, rarity: "rare", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 명중(+9%)." },
    { name: "마나 잔디", type: "hp", value: 18, price: 34, rarity: "rare", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 체력(+18)." },
    { name: "냉기 결정", type: "atk", value: 9, critBonus: 2, price: 38, rarity: "epic", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+9), 치명(+2%)." },
    { name: "강철 너클", type: "atk", value: 10, critMult: 0.06, price: 39, rarity: "epic", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 공격(+10), 치명 배율(+6%)." },
    { name: "독침 통", type: "atk", value: 9, lifesteal: 0.05, price: 40, rarity: "epic", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 공격(+9), 흡혈(5%)." },
    { name: "별무늬 천", type: "hp", value: 22, price: 41, rarity: "epic", desc: "공용. 체력(+22)." },
    { name: "암흑 가루", type: "atk", value: 11, acc: 4, price: 44, rarity: "epic", desc: "공용. 공격(+11), 명중(+4%)." },
    { name: "은빛 고리", type: "atk", value: 10, def: 2, price: 42, rarity: "epic", desc: "공용. 공격(+10), 방어(+2)." },
    { name: "화염 잔재", type: "atk", value: 12, critBonus: 3, price: 48, rarity: "epic", desc: "공용. 공격(+12), 치명(+3%)." },
    { name: "빛바랜 망토", type: "hp", value: 20, def: 3, price: 46, rarity: "epic", desc: "공용. 체력(+20), 방어(+3)." },
    { name: "수정 렌즈", type: "acc", value: 11, critBonus: 2, price: 47, rarity: "epic", desc: "공용. 명중(+11%), 치명(+2%)." },
    { name: "천상의 파편", type: "atk", value: 14, critMult: 0.08, price: 52, rarity: "legendary", desc: "전설. 공격(+14), 치명 배율(+8%)." },
    { name: "고대 철판", type: "hp", value: 28, def: 5, price: 54, rarity: "legendary", desc: "전설. 체력(+28), 방어(+5)." },
    { name: "폭풍의 씨앗", type: "atk", value: 13, acc: 5, price: 53, rarity: "legendary", onlyFor: ["마법사", "위저드", "소환사"], desc: "마계. 공격(+13), 명중(+5%)." },
    { name: "용해액 병", type: "atk", value: 12, lifesteal: 0.07, price: 51, rarity: "legendary", onlyFor: ["헌터", "궁수", "암살자"], desc: "헌계. 공격(+12), 흡혈(7%)." },
    { name: "성스러운 철", type: "atk", value: 13, def: 3, price: 55, rarity: "legendary", onlyFor: ["워리어", "나이트", "버서커"], desc: "워계. 공격(+13), 방어(+3)." },
    { name: "심해 비늘", type: "hp", value: 26, lifesteal: 0.06, price: 56, rarity: "legendary", desc: "전설. 체력(+26), 흡혈(6%)." },
    { name: "얼음 핵", type: "atk", value: 14, critBonus: 3, price: 57, rarity: "legendary", desc: "전설. 공격(+14), 치명(+3%)." },
    { name: "시간의 가루", type: "hp", value: 24, def: 4, price: 58, rarity: "legendary", desc: "전설. 체력(+24), 방어(+4)." },
    { name: "혼령 실", type: "atk", value: 11, critMult: 0.09, price: 50, rarity: "epic", desc: "공용. 공격(+11), 치명 배율(+9%)." },
    { name: "태양 가루", type: "acc", value: 10, price: 45, rarity: "epic", desc: "공용. 명중(+10%)." },
    { name: "암석 심장", type: "hp", value: 30, price: 59, rarity: "legendary", desc: "전설. 체력(+30)." },
    { name: "유리한 거래", type: "atk", value: 9, price: 36, rarity: "rare", desc: "공용. 공격(+9)." },
    { name: "잊힌 인장", type: "hp", value: 17, def: 2, price: 37, rarity: "rare", desc: "공용. 체력(+17), 방어(+2)." },
    { name: "바람의 조각", type: "atk", value: 8, acc: 4, price: 35, rarity: "rare", desc: "공용. 공격(+8), 명중(+4%)." },
    { name: "대지의 알", type: "hp", value: 19, price: 43, rarity: "epic", desc: "공용. 체력(+19)." },
    { name: "불꽃 심지", type: "atk", value: 10, critBonus: 2, price: 49, rarity: "epic", desc: "공용. 공격(+10), 치명(+2%)." },
];

const equipmentPool = [
    // ===== 워리어 전용 =====
    { name: "거인족의 대검",      type: "atk", value: 22, price: 90,  rarity: "epic",   onlyFor: ["워리어","나이트","버서커"], critBonus: 6,  desc: "워리어 계열. 공격력(+22). 치명타 확률(+6%)." },
    { name: "미스릴 흉갑",        type: "hp",  value: 80, def: 16, price: 90,  rarity: "epic",   onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 체력(+80), 방어(+16)." },
    { name: "용사의 방패",        type: "hp",  value: 50, def: 14, price: 60,  rarity: "rare",   onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 체력(+50), 방어(+14)." },
    { name: "전쟁의 도끼",        type: "atk", value: 18, price: 70,  rarity: "rare",   onlyFor: ["워리어","나이트","버서커"], critBonus: 4,  desc: "워리어 계열. 공격력(+18). 치명타 확률(+4%)." },
    { name: "분노의 투구",        type: "atk", value: 12, price: 50,  rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 공격력(+12)." },
    { name: "철벽의 각반",        type: "hp",  value: 30, def: 10, price: 45,  rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 체력(+30), 방어(+10)." },
    { name: "강철 팔찌",          type: "atk", value: 8,  def: 6,  price: 40,  rarity: "common", onlyFor: ["워리어","나이트","버서커"], desc: "워리어 계열. 공격력(+8), 방어(+6)." },
    { name: "파괴자의 도끼",      type: "atk", value: 35, price: 130, rarity: "epic",   onlyFor: ["버서커"], critBonus: 10, desc: "버서커 전용. 공격력(+35). 치명타 확률(+10%)." },
    { name: "성기사의 검",        type: "atk", value: 28, def: 8, price: 120, rarity: "epic",   onlyFor: ["나이트"], desc: "나이트 전용. 공격력(+28), 방어(+8)." },

    // ===== 헌터 전용 =====
    { name: "정령왕의 활",        type: "atk", value: 22, price: 95,  rarity: "epic",   onlyFor: ["헌터","궁수","암살자"], critBonus: 8,  desc: "헌터 계열. 공격력(+22). 치명타 확률(+8%)." },
    { name: "암살자의 단검",      type: "atk", value: 18, price: 70,  rarity: "rare",   onlyFor: ["헌터","궁수","암살자"], critMult: 0.25, desc: "헌터 계열. 공격력(+18). 치명타 배율(+25%)." },
    { name: "독화살 통",          type: "atk", value: 14, price: 55,  rarity: "rare",   onlyFor: ["헌터","궁수","암살자"], desc: "헌터 계열. 공격력(+14)." },
    { name: "그림자 망토",        type: "hp",  value: 40, def: 4, price: 45,  rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "헌터 계열. 체력(+40), 방어(+4)." },
    { name: "사냥꾼의 장갑",      type: "acc", value: 18, price: 50,  rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "헌터 계열. 명중률(+18%)." },
    { name: "바람의 신발",        type: "acc", value: 12, price: 35,  rarity: "common", onlyFor: ["헌터","궁수","암살자"], desc: "헌터 계열. 명중률(+12%)." },
    { name: "독이 묻은 화살촉",   type: "atk", value: 10, price: 40,  rarity: "common", onlyFor: ["헌터","궁수","암살자"], lifesteal: 0.08, desc: "헌터 계열. 공격력(+10). 흡혈(8%)." },
    { name: "폭풍의 활",          type: "atk", value: 32, price: 120, rarity: "epic",   onlyFor: ["궁수"], critBonus: 6, acc: 10, desc: "궁수 전용. 공격력(+32). 치명타(+6%), 명중(+10%)." },
    { name: "그림자 쌍검",        type: "atk", value: 28, price: 110, rarity: "epic",   onlyFor: ["암살자"], critMult: 0.4, lifesteal: 0.12, desc: "암살자 전용. 공격력(+28). 치명타 배율(+40%), 흡혈(12%)." },

    // ===== 마법사 전용 =====
    { name: "대마법사의 지팡이",  type: "atk", value: 28, price: 100, rarity: "epic",   onlyFor: ["마법사","위저드","소환사"], critMult: 0.4, desc: "마법사 계열. 공격력(+28). 치명타 배율(+40%)." },
    { name: "학자의 로브",        type: "hp",  value: 50, def: 6, price: 45,  rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "마법사 계열. 체력(+50), 방어(+6)." },
    { name: "마력 증폭기",        type: "atk", value: 20, price: 75,  rarity: "rare",   onlyFor: ["마법사","위저드","소환사"], critMult: 0.25, desc: "마법사 계열. 공격력(+20). 치명타 배율(+25%)." },
    { name: "정령의 로브",        type: "hp",  value: 65, def: 8, price: 65,  rarity: "rare",   onlyFor: ["마법사","위저드","소환사"], desc: "마법사 계열. 체력(+65), 방어(+8)." },
    { name: "마나 크리스탈",      type: "atk", value: 15, price: 50,  rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "마법사 계열. 공격력(+15)." },
    { name: "마력 구슬",          type: "atk", value: 10, price: 35,  rarity: "common", onlyFor: ["마법사","위저드","소환사"], desc: "마법사 계열. 공격력(+10)." },
    { name: "마법사의 모자",      type: "atk", value: 8,  price: 30,  rarity: "common", onlyFor: ["마법사","위저드","소환사"], critBonus: 3, desc: "마법사 계열. 공격력(+8). 치명타 확률(+3%)." },
    { name: "고대 마법진",        type: "atk", value: 38, price: 130, rarity: "epic",   onlyFor: ["위저드"], critMult: 0.5, desc: "위저드 전용. 공격력(+38). 치명타 배율(+50%)." },
    { name: "소환사의 인장",      type: "hp",  value: 80, def: 12, price: 120, rarity: "epic",   onlyFor: ["소환사"], lifesteal: 0.15, desc: "소환사 전용. 체력(+80), 방어(+12). 흡혈(15%)." },

    // ===== 공용 =====
    { name: "드래곤의 심장",      type: "hp",  value: 130, def: 14, price: 180, rarity: "legendary", desc: "전설. 체력(+130), 방어(+14)." },
    { name: "엑스칼리버",         type: "atk", value: 45, acc: 10, price: 200, rarity: "legendary", critBonus: 10, critMult: 0.3, desc: "전설. 공격력(+45), 명중(+10%), 치명타 확률(+10%), 배율(+30%)." },
    { name: "흡혈 반지",          type: "atk", value: 8,  price: 60,  rarity: "rare",   lifesteal: 0.15, desc: "공용. 공격력(+8). 흡혈(15%)." },
    { name: "흡혈 망토",          type: "hp",  value: 35, price: 75,  rarity: "rare",   lifesteal: 0.25, desc: "공용. 체력(+35). 흡혈(25%)." },
    { name: "저주받은 검",        type: "atk", value: 38, price: 100, rarity: "epic",   penalty: { '워리어': 15, '헌터': 20, '마법사': 25 }, critBonus: 12, desc: "공용. 공격력(+38). 치명타(+12%). 명중률 대폭 하락." },
    { name: "바람의 부츠",        type: "acc", value: 20, price: 55,  rarity: "rare",   desc: "공용. 명중률(+20%)." },
    { name: "중갑옷",             type: "hp",  value: 75, def: 12, price: 65,  rarity: "rare",   penalty: { '마법사': 20, '헌터': 15 }, desc: "공용. 체력(+75), 방어(+12). 마법사·헌터는 명중률 감소." },
    { name: "낡은 가죽 갑옷",     type: "hp",  value: 35, def: 4,  price: 25,  rarity: "common", desc: "공용. 체력(+35), 방어(+4)." },
    { name: "회복의 목걸이",      type: "hp",  value: 20, price: 40,  rarity: "common", regenPotion: true, desc: "공용. 체력(+20). 포션 사용 시 2턴간 서서히 회복." },
    { name: "대지의 반지",        type: "hp",  value: 45, def: 5,  price: 50,  rarity: "common", desc: "공용. 체력(+45), 방어(+5)." },
    { name: "수련자의 검",        type: "atk", value: 6,  price: 20,  rarity: "common", desc: "공용. 공격력(+6)." },
    { name: "견습 갑옷",          type: "hp",  value: 25, def: 3,  price: 20,  rarity: "common", desc: "공용. 체력(+25), 방어(+3)." },
    { name: "행운의 동전",        type: "acc", value: 8,  price: 25,  rarity: "common", critBonus: 2, desc: "공용. 명중률(+8%), 치명타 확률(+2%)." },
    { name: "불꽃 반지",          type: "atk", value: 12, price: 45,  rarity: "common", critBonus: 3, desc: "공용. 공격력(+12), 치명타 확률(+3%)." },
    { name: "생명의 돌",          type: "hp",  value: 55, price: 45,  rarity: "rare",   desc: "공용. 체력(+55)." },
    { name: "전투 반지",          type: "atk", value: 14, def: 4, price: 55,  rarity: "rare",   desc: "공용. 공격력(+14), 방어(+4)." },
    { name: "용의 비늘 조각",     type: "hp",  value: 60, def: 8,  price: 70,  rarity: "rare",   desc: "공용. 체력(+60), 방어(+8)." },
    { name: "고대 유물 파편",     type: "atk", value: 18, acc: 5, price: 65,  rarity: "rare",   desc: "공용. 공격력(+18), 명중률(+5%)." },
    { name: "피의 에센스",        type: "atk", value: 20, price: 80,  rarity: "epic",   lifesteal: 0.18, critBonus: 5, desc: "공용. 공격력(+20). 흡혈(18%), 치명타(+5%)." },
    { name: "불사의 갑옷",        type: "hp",  value: 90, def: 15, price: 140, rarity: "epic",   desc: "공용. 체력(+90), 방어(+15)." },
    { name: "번개의 반지",        type: "atk", value: 25, price: 110, rarity: "epic",   critBonus: 8, critMult: 0.2, desc: "공용. 공격력(+25). 치명타 확률(+8%), 배율(+20%)." },
    { name: "폭군의 갑옷",        type: "hp",  value: 110, def: 20, price: 170, rarity: "legendary", critBonus: 5, desc: "전설. 체력(+110), 방어(+20), 치명타(+5%)." },
    { name: "세계수의 가지",      type: "hp",  value: 80, price: 150, rarity: "legendary", regenPotion: true, lifesteal: 0.2, desc: "전설. 체력(+80). 포션 강화, 흡혈(20%)." },
    ...equipmentPoolV651,
    ...equipmentPoolExtra703,
];

/**
 * v7 시너지: 장착 아이템 tags 조합 — 확장 시 tags·needTags만 추가하면 됨
 * @type {{id:string,name:string,needTags:string[],bonus:{atk?:number,hp?:number,def?:number,acc?:number,crit?:number}}[]}
 */
const synergyRules = [
    { id: 'syn_blade_blood', name: '⚔️ 피의 검귀', needTags: ['blade', 'blood'], bonus: { atk: 4, crit: 2 } },
    { id: 'syn_heavy_wall', name: '🛡️ 중장갑', needTags: ['heavy', 'blood'], bonus: { hp: 22, def: 2 } },
    { id: 'syn_precision_arcane', name: '🎯 마법 조준', needTags: ['precision', 'arcane'], bonus: { atk: 3, acc: 3 } },
];

const relicPool = [
    { id: 'relic_warrior_berserk', name: "분노의 심장",    desc: "체력이 30% 이하일 때 치명타가 극대화(표시 65%·초과분은 배율로 전환).", onlyFor: ["워리어","나이트","버서커"], rarity: "legendary", effect: "berserk_crit",    price: 180 },
    { id: 'relic_warrior_shield',  name: "철벽의 의지",    desc: "방어 성공 시 다음 공격 데미지 +50%.",    onlyFor: ["워리어","나이트","버서커"], rarity: "epic",      effect: "shield_empower",  price: 120 },
    { id: 'relic_hunter_dodge',    name: "그림자 반격",    desc: "회피 성공 시 공격력의 60% 고정 피해 + 체력 10 흡혈.", onlyFor: ["헌터","궁수","암살자"], rarity: "legendary", effect: "dodge_counter", price: 180 },
    { id: 'relic_hunter_execute',  name: "처형자의 표식",  desc: "적 체력이 20% 이하일 때 공격력 2배.",    onlyFor: ["헌터","궁수","암살자"], rarity: "epic",      effect: "execute",         price: 120 },
    { id: 'relic_wizard_chain',    name: "연쇄 마법진",    desc: "치명타 발동 시 즉시 한 번 더 공격.",     onlyFor: ["마법사","위저드","소환사"], rarity: "legendary", effect: "chain_cast",     price: 180 },
    { id: 'relic_wizard_barrier',  name: "마력 방벽",      desc: "방어막 성공 시 받은 피해의 30% 반사.",   onlyFor: ["마법사","위저드","소환사"], rarity: "epic",      effect: "barrier_reflect", price: 120 },
    { id: 'relic_common_vampire',  name: "뱀파이어의 반지", desc: "킬 시 최대 체력의 15% 즉시 회복.",      onlyFor: null, rarity: "epic",      effect: "kill_heal",       price: 130 },
    { id: 'relic_common_gambler',  name: "도박사의 주사위", desc: "매 전투 시작 시 50% 확률로 공격력 +30%, 50% 확률로 -10%.", onlyFor: null, rarity: "rare", effect: "gambler", price: 80 },
];

// 대장간 합성 레시피
const forgeRecipes = [
    { name: "강화 철검",     type: "atk", value: 28, def: 0,  price: 0, rarity: "rare",      desc: "대장간 합성. 공격력(+28).",          materials: 2, materialRarity: "common", successRate: 0.85 },
    { name: "강화 갑주",     type: "hp",  value: 70, def: 12, price: 0, rarity: "rare",      desc: "대장간 합성. 체력(+70), 방어(+12).", materials: 2, materialRarity: "common", successRate: 0.85 },
    { name: "강화 반지",     type: "acc", value: 22, price: 0, rarity: "rare",      desc: "대장간 합성. 명중률(+22%)",          materials: 2, materialRarity: "common", successRate: 0.85, critBonus: 4 },
    { name: "영웅의 무기",   type: "atk", value: 42, price: 0, rarity: "epic",      desc: "대장간 합성. 공격력(+42).",          materials: 2, materialRarity: "rare",   successRate: 0.65, critBonus: 8 },
    { name: "영웅의 갑옷",   type: "hp",  value: 100, def: 18, price: 0, rarity: "epic",     desc: "대장간 합성. 체력(+100), 방어(+18).", materials: 2, materialRarity: "rare", successRate: 0.65 },
    { name: "전설의 파편",   type: "atk", value: 60, price: 0, rarity: "legendary", desc: "대장간 합성. 공격력(+60). 치명타(+12%).", materials: 3, materialRarity: "rare", successRate: 0.40, critBonus: 12 },
    { name: "불멸의 심장",   type: "hp",  value: 140, def: 22, price: 0, rarity: "legendary", desc: "대장간 합성. 체력(+140), 방어(+22).", materials: 3, materialRarity: "rare", successRate: 0.40 },
    { name: "파멸의 각인",   type: "atk", value: 50, price: 0, rarity: "legendary", desc: "대장간 합성. 공격력(+50). 흡혈(25%), 치명타 배율(+40%).", materials: 2, materialRarity: "epic", successRate: 0.50, lifesteal: 0.25, critMult: 0.4 },
];

/** v7.0.4 — 스탯만 약 30% 너프 (가격은 원본 유지) */
(function applyItemBalance703() {
    const M = 0.7;
    function nerf(it) {
        if (!it || it._bal703) return;
        if (typeof it.value === 'number') it.value = Math.max(1, Math.round(it.value * M));
        if (typeof it.def === 'number') it.def = Math.max(0, Math.round(it.def * M));
        if (typeof it.acc === 'number') it.acc = Math.max(0, Math.round(it.acc * M));
        if (typeof it.critBonus === 'number') it.critBonus = Math.max(1, Math.round(it.critBonus * M));
        if (typeof it.critMult === 'number') it.critMult = Math.round(it.critMult * M * 100) / 100;
        if (typeof it.lifesteal === 'number') it.lifesteal = Math.round(it.lifesteal * M * 100) / 100;
        it._bal703 = true;
    }
    if (typeof equipmentPool !== 'undefined' && Array.isArray(equipmentPool)) equipmentPool.forEach(nerf);
    function nerfUnlock(obj) {
        if (!obj) return;
        Object.keys(obj).forEach((k) => nerf(obj[k]));
    }
    nerfUnlock(typeof floorUnlocks !== 'undefined' ? floorUnlocks : null);
    nerfUnlock(typeof floorUnlocksHunter !== 'undefined' ? floorUnlocksHunter : null);
    nerfUnlock(typeof floorUnlocksWizard !== 'undefined' ? floorUnlocksWizard : null);
    if (typeof forgeRecipes !== 'undefined' && Array.isArray(forgeRecipes)) forgeRecipes.forEach(nerf);
})();
