// 직업 상성 (기본 3직업 기준)
const relations = {
    '워리어':  { weak: '마법사', strong: '헌터' },
    '헌터':   { weak: '워리어', strong: '마법사' },
    '마법사':  { weak: '헌터',  strong: '워리어' },
    // 전직 직업은 기본 직업 상성 그대로 상속
    '나이트':  { weak: '마법사', strong: '헌터' },
    '버서커':  { weak: '마법사', strong: '헌터' },
    '궁수':   { weak: '워리어', strong: '마법사' },
    '암살자':  { weak: '워리어', strong: '마법사' },
    '위저드':  { weak: '헌터',  strong: '워리어' },
    '소환사':  { weak: '헌터',  strong: '워리어' },
};

const jobBase = {
    Warrior: { name: '워리어', hp: 180, atk: 14, def: 6,  color: '#ff4757' },
    Hunter:  { name: '헌터',   hp: 160, atk: 18, def: 3,  color: '#2ed573' },
    Wizard:  { name: '마법사', hp: 110, atk: 38, def: 1,  color: '#1e90ff' },
};

// 전직 정보
const jobEvolutions = {
    '워리어':  [
        { name: '나이트',  condition: '방어구 아이템 2개 보유', trigger: 'defense2',  bonusHp: 40, bonusDef: 4, desc: '철벽 수호자. 방어력과 체력이 크게 증가한다.' },
        { name: '버서커', condition: '공격 아이템 2개 보유',   trigger: 'attack2',   bonusAtk: 8, bonusHp: -20, desc: '광전사. 공격력이 폭발하지만 체력이 줄어든다.' },
    ],
    '헌터':   [
        { name: '궁수',   condition: '활 관련 아이템 보유',    trigger: 'bow',       bonusAtk: 6, bonusAcc: 10, desc: '원거리 특화. 공격력과 명중률이 상승한다.' },
        { name: '암살자', condition: '단검 관련 아이템 보유',   trigger: 'dagger',    bonusAtk: 10, bonusDef: -1, desc: '그림자 암살자. 공격력이 크게 오르지만 방어가 약해진다.' },
    ],
    '마법사':  [
        { name: '위저드',  condition: '지팡이 관련 아이템 보유', trigger: 'staff',     bonusAtk: 12, bonusHp: -10, desc: '고위 마법사. 마법 공격력이 폭발적으로 증가한다.' },
        { name: '소환사',  condition: '로브 관련 아이템 보유',   trigger: 'robe',      bonusHp: 30, bonusDef: 3, desc: '소환사. 소환수의 방어막으로 생존력이 증가한다.' },
    ],
};

// 아이템 풀 (등급별 확률: legendary 5%, epic 20%, rare 35%, common 40%)
const equipmentPool = [
    // ===== 워리어 전용 =====
    { name: "거인족의 대검",      type: "atk", value: 15, price: 90,  rarity: "epic",      onlyFor: "워리어",  bonusAtk: 15, unlockSkill: "대회전",  evolTrigger: "attack2",  desc: "워리어 전용. 공격력(+15)이 증가하며 [💥 대회전] 스킬이 해제된다." },
    { name: "미스릴 흉갑",        type: "hp",  value: 60, def: 12, price: 90,  rarity: "epic",      onlyFor: "워리어",  bonusHp: 30, evolTrigger: "defense2", desc: "워리어 전용. 체력(+60), 방어(+12). 방어구 전직 조건에 기여한다." },
    { name: "용사의 방패",        type: "hp",  value: 30, def: 10, price: 60,  rarity: "rare",      onlyFor: "워리어",  evolTrigger: "defense2", desc: "워리어 전용. 체력(+30), 방어(+10). 방어구 전직 조건에 기여한다." },
    { name: "전쟁의 도끼",        type: "atk", value: 12, price: 70,  rarity: "rare",      onlyFor: "워리어",  evolTrigger: "attack2",  penalty: { '워리어': 0, '헌터': 30, '마법사': 30 }, desc: "워리어 전용. 공격력(+12). 공격 전직 조건에 기여한다." },
    { name: "분노의 투구",        type: "atk", value: 8,  price: 50,  rarity: "common",    onlyFor: "워리어",  desc: "워리어 전용. 공격력(+8). 착용 시 방어 성공률 -10%." , penalty: {'워리어': 10} },

    // ===== 헌터 전용 =====
    { name: "정령왕의 활",        type: "atk", value: 16, price: 95,  rarity: "epic",      onlyFor: "헌터",    bonusAtk: 14, unlockSkill: "폭풍화살", evolTrigger: "bow",    desc: "헌터 전용. 공격력(+16)이 증가하며 [🌪️ 폭풍화살] 스킬이 해제된다." },
    { name: "암살자의 단검",       type: "atk", value: 12, price: 70,  rarity: "rare",      onlyFor: "헌터",    bonusAtk: 10, evolTrigger: "dagger",  desc: "헌터 전용. 공격력(+12). 단검 전직 조건에 기여한다." },
    { name: "독화살 통",           type: "atk", value: 8,  price: 55,  rarity: "rare",      onlyFor: "헌터",    evolTrigger: "bow",     desc: "헌터 전용. 공격력(+8). 활 전직 조건에 기여한다." },
    { name: "그림자 망토",         type: "hp",  value: 25, def: 2, price: 45,  rarity: "common",    onlyFor: "헌터",    evolTrigger: "dagger",  desc: "헌터 전용. 체력(+25), 방어(+2). 단검 전직 조건에 기여한다." },
    { name: "사냥꾼의 장갑",       type: "acc", value: 15, price: 50,  rarity: "common",    onlyFor: "헌터",    desc: "헌터 전용. 명중률(+15%). 적을 정확히 노린다." },

    // ===== 마법사 전용 =====
    { name: "대마법사의 지팡이",   type: "atk", value: 20, price: 100, rarity: "epic",      onlyFor: "마법사",  bonusAtk: 18, unlockSkill: "메테오",  evolTrigger: "staff",   desc: "마법사 전용. 공격력(+20)이 증가하며 [🔥 메테오] 스킬이 해제된다." },
    { name: "학자의 로브",         type: "hp",  value: 35, def: 4, price: 45,  rarity: "common",    onlyFor: "마법사",  bonusAcc: 10, evolTrigger: "robe",    desc: "마법사 전용. 체력(+35), 방어(+4), 명중률(+10%). 로브 전직 조건에 기여한다." },
    { name: "마력 증폭기",         type: "atk", value: 14, price: 75,  rarity: "rare",      onlyFor: "마법사",  evolTrigger: "staff",   desc: "마법사 전용. 공격력(+14). 지팡이 전직 조건에 기여한다." },
    { name: "정령의 로브",         type: "hp",  value: 45, def: 6, price: 65,  rarity: "rare",      onlyFor: "마법사",  evolTrigger: "robe",    desc: "마법사 전용. 체력(+45), 방어(+6). 로브 전직 조건에 기여한다." },
    { name: "마나 크리스탈",       type: "atk", value: 10, price: 50,  rarity: "common",    onlyFor: "마법사",  desc: "마법사 전용. 공격력(+10). 마나를 농축시킨 결정체." },

    // ===== 공용 =====
    { name: "드래곤의 심장",       type: "hp",  value: 100, def: 10, price: 180, rarity: "legendary", desc: "전설. 체력(+100), 방어(+10). 압도적인 생존력." },
    { name: "엑스칼리버",          type: "atk", value: 35, acc: 8,  price: 200, rarity: "legendary", desc: "전설. 공격력(+35), 명중률(+8%). 성검의 힘." },
    { name: "흡혈 반지",           type: "atk", value: 5,  price: 60,  rarity: "rare",      lifesteal: 0.15, desc: "공용. 공격력(+5). 공격 시 가한 피해의 15%만큼 체력 회복." },
    { name: "흡혈 망토",           type: "hp",  value: 20, price: 75,  rarity: "rare",      lifesteal: 0.25, desc: "공용. 체력(+20). 공격 시 가한 피해의 25%만큼 체력 회복." },
    { name: "저주받은 검",         type: "atk", value: 30, price: 100, rarity: "epic",      penalty: { '워리어': 15, '헌터': 20, '마법사': 25 }, desc: "공용. 공격력(+30). 강력하지만 명중률이 크게 하락한다." },
    { name: "바람의 부츠",         type: "acc", value: 18, price: 55,  rarity: "rare",      desc: "공용. 명중률(+18%). 바람처럼 빠른 발놀림." },
    { name: "중갑옷",              type: "hp",  value: 60, def: 8,  price: 65,  rarity: "rare",      penalty: { '마법사': 20, '헌터': 15 }, desc: "공용. 체력(+60), 방어(+8). 마법사·헌터는 명중률 감소." },
    { name: "낡은 가죽 갑옷",      type: "hp",  value: 25, def: 2,  price: 25,  rarity: "common",    desc: "공용. 체력(+25), 방어(+2). 초보 모험가용." },
    { name: "회복의 목걸이",       type: "hp",  value: 15, price: 40,  rarity: "common",    regenPotion: true, desc: "공용. 체력(+15). 포션 사용 시 즉시 회복 대신 2턴간 서서히 회복하며 총량이 증가한다." },
    { name: "대지의 반지",         type: "hp",  value: 30, def: 3,  price: 50,  rarity: "common",    desc: "공용. 체력(+30), 방어(+3). 대지의 힘이 깃든 반지." },
];
