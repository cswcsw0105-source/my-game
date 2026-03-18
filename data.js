// 직업 상성
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
    Warrior: { name: '워리어', hp: 240, atk: 18, def: 8,  color: '#ff4757' },
    Hunter:  { name: '헌터',   hp: 210, atk: 22, def: 4,  color: '#2ed573' },
    Wizard:  { name: '마법사', hp: 150, atk: 45, def: 2,  color: '#1e90ff' },
};

const jobEvolutions = {
    '워리어': [
        { name: '나이트',  condition: '방어구 아이템 2개 보유', trigger: 'defense2', bonusAtk: 20, bonusDef: 15, bonusHp: 280, desc: '철벽 수호자. 방어력과 체력이 크게 증가한다.' },
        { name: '버서커', condition: '공격 아이템 2개 보유',   trigger: 'attack2',  bonusAtk: 35, bonusDef: 4,  bonusHp: 200, desc: '광전사. 공격력이 폭발하지만 체력이 줄어든다.' },
    ],
    '헌터': [
        { name: '궁수',   condition: '활 관련 아이템 보유',   trigger: 'bow',      bonusAtk: 28, bonusDef: 5,  bonusHp: 220, bonusAcc: 15, desc: '원거리 특화. 공격력과 명중률이 상승한다.' },
        { name: '암살자', condition: '단검 관련 아이템 보유',  trigger: 'dagger',   bonusAtk: 38, bonusDef: 3,  bonusHp: 190, desc: '그림자 암살자. 공격력이 크게 오르지만 방어가 약해진다.' },
    ],
    '마법사': [
        { name: '위저드',  condition: '지팡이 관련 아이템 보유', trigger: 'staff',  bonusAtk: 65, bonusDef: 2,  bonusHp: 140, desc: '고위 마법사. 마법 공격력이 폭발적으로 증가한다.' },
        { name: '소환사',  condition: '로브 관련 아이템 보유',   trigger: 'robe',   bonusAtk: 48, bonusDef: 8,  bonusHp: 185, desc: '소환사. 소환수의 방어막으로 생존력이 증가한다.' },
    ],
};

const equipmentPool = [
    // ===== 워리어 전용 =====
    { name: "거인족의 대검",    type: "atk", value: 22, price: 90,  rarity: "epic",      onlyFor: "워리어", bonusAtk: 22, unlockSkill: "대회전",  evolTrigger: "attack2",  desc: "워리어 전용. 공격력(+22). [💥 대회전] 스킬 해제. 공격 전직 조건." },
    { name: "미스릴 흉갑",      type: "hp",  value: 80, def: 16, price: 90,  rarity: "epic",      onlyFor: "워리어", bonusHp: 40, evolTrigger: "defense2", desc: "워리어 전용. 체력(+80), 방어(+16). 방어구 전직 조건." },
    { name: "용사의 방패",      type: "hp",  value: 50, def: 14, price: 60,  rarity: "rare",      onlyFor: "워리어", evolTrigger: "defense2", desc: "워리어 전용. 체력(+50), 방어(+14). 방어구 전직 조건." },
    { name: "전쟁의 도끼",      type: "atk", value: 18, price: 70,  rarity: "rare",      onlyFor: "워리어", evolTrigger: "attack2",  desc: "워리어 전용. 공격력(+18). 공격 전직 조건." },
    { name: "분노의 투구",      type: "atk", value: 12, price: 50,  rarity: "common",    onlyFor: "워리어", penalty: {'워리어': 10}, desc: "워리어 전용. 공격력(+12). 방어 성공률 -10%." },

    // ===== 헌터 전용 =====
    { name: "정령왕의 활",      type: "atk", value: 22, price: 95,  rarity: "epic",      onlyFor: "헌터",   bonusAtk: 20, unlockSkill: "폭풍화살", evolTrigger: "bow",     desc: "헌터 전용. 공격력(+22). [🌪️ 폭풍화살] 스킬 해제. 활 전직 조건." },
    { name: "암살자의 단검",    type: "atk", value: 18, price: 70,  rarity: "rare",      onlyFor: "헌터",   bonusAtk: 15, evolTrigger: "dagger",  desc: "헌터 전용. 공격력(+18). 단검 전직 조건." },
    { name: "독화살 통",        type: "atk", value: 14, price: 55,  rarity: "rare",      onlyFor: "헌터",   evolTrigger: "bow",     desc: "헌터 전용. 공격력(+14). 활 전직 조건." },
    { name: "그림자 망토",      type: "hp",  value: 40, def: 4, price: 45,  rarity: "common",    onlyFor: "헌터",   evolTrigger: "dagger",  desc: "헌터 전용. 체력(+40), 방어(+4). 단검 전직 조건." },
    { name: "사냥꾼의 장갑",    type: "acc", value: 18, price: 50,  rarity: "common",    onlyFor: "헌터",   desc: "헌터 전용. 명중률(+18%)." },

    // ===== 마법사 전용 =====
    { name: "대마법사의 지팡이", type: "atk", value: 28, price: 100, rarity: "epic",     onlyFor: "마법사", bonusAtk: 25, unlockSkill: "메테오",  evolTrigger: "staff",   desc: "마법사 전용. 공격력(+28). [🔥 메테오] 스킬 해제. 지팡이 전직 조건." },
    { name: "학자의 로브",      type: "hp",  value: 50, def: 6, price: 45,  rarity: "common",    onlyFor: "마법사", bonusAcc: 12, evolTrigger: "robe",    desc: "마법사 전용. 체력(+50), 방어(+6), 명중률(+12%). 로브 전직 조건." },
    { name: "마력 증폭기",      type: "atk", value: 20, price: 75,  rarity: "rare",      onlyFor: "마법사", evolTrigger: "staff",   desc: "마법사 전용. 공격력(+20). 지팡이 전직 조건." },
    { name: "정령의 로브",      type: "hp",  value: 65, def: 8, price: 65,  rarity: "rare",      onlyFor: "마법사", evolTrigger: "robe",    desc: "마법사 전용. 체력(+65), 방어(+8). 로브 전직 조건." },
    { name: "마나 크리스탈",    type: "atk", value: 15, price: 50,  rarity: "common",    onlyFor: "마법사", desc: "마법사 전용. 공격력(+15)." },

    // ===== 공용 =====
    { name: "드래곤의 심장",    type: "hp",  value: 130, def: 14, price: 180, rarity: "legendary", desc: "전설. 체력(+130), 방어(+14)." },
    { name: "엑스칼리버",       type: "atk", value: 45, acc: 10, price: 200, rarity: "legendary", desc: "전설. 공격력(+45), 명중률(+10%)." },
    { name: "흡혈 반지",        type: "atk", value: 8,  price: 60,  rarity: "rare",      lifesteal: 0.15, desc: "공용. 공격력(+8). 공격 시 피해의 15% 체력 흡수." },
    { name: "흡혈 망토",        type: "hp",  value: 35, price: 75,  rarity: "rare",      lifesteal: 0.25, desc: "공용. 체력(+35). 공격 시 피해의 25% 체력 흡수." },
    { name: "저주받은 검",      type: "atk", value: 38, price: 100, rarity: "epic",      penalty: { '워리어': 15, '헌터': 20, '마법사': 25 }, desc: "공용. 공격력(+38). 명중률 대폭 하락." },
    { name: "바람의 부츠",      type: "acc", value: 20, price: 55,  rarity: "rare",      desc: "공용. 명중률(+20%)." },
    { name: "중갑옷",           type: "hp",  value: 75, def: 12, price: 65,  rarity: "rare",      penalty: { '마법사': 20, '헌터': 15 }, desc: "공용. 체력(+75), 방어(+12). 마법사·헌터는 명중률 감소." },
    { name: "낡은 가죽 갑옷",   type: "hp",  value: 35, def: 4,  price: 25,  rarity: "common",    desc: "공용. 체력(+35), 방어(+4)." },
    { name: "회복의 목걸이",    type: "hp",  value: 20, price: 40,  rarity: "common",    regenPotion: true, desc: "공용. 체력(+20). 포션 사용 시 2턴간 서서히 회복. 총 회복량 증가." },
    { name: "대지의 반지",      type: "hp",  value: 45, def: 5,  price: 50,  rarity: "common",    desc: "공용. 체력(+45), 방어(+5)." },
];
