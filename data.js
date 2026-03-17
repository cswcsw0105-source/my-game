// 직업 상성 관계
const relations = {
    '워리어': { weak: '마법사', strong: '헌터' },
    '헌터': { weak: '워리어', strong: '마법사' },
    '마법사': { weak: '헌터', strong: '워리어' }
};

// 직업별 기본 스탯
const jobBase = {
    Warrior: { name: '워리어', hp: 220, atk: 20, def: 8, color: '#ff4757' },
    Hunter: { name: '헌터', hp: 160, atk: 25, def: 5, color: '#2ed573' },
    Wizard: { name: '마법사', hp: 110, atk: 50, def: 2, color: '#1e90ff' }
};

// 장비 아이템 풀
const equipmentPool = [
    { name: "거인족의 대검", type: "atk", value: 15, price: 80, rarity: "rare", preferred: "워리어", bonusAtk: 10, desc: "워리어가 들면 숨겨진 힘(ATK +10)이 발동하는 묵직한 대검." },
    { name: "중갑옷", type: "hp", value: 80, def: 10, price: 70, rarity: "rare", penalty: { '마법사': 25, '헌터': 15 }, desc: "방어력과 체력을 대폭 올리지만, 너무 무거워 마법사와 헌터는 명중률이 깎인다." },
    { name: "마법사의 지팡이", type: "atk", value: 10, price: 90, rarity: "epic", preferred: "마법사", bonusAtk: 20, desc: "마법사가 쥐면 엄청난 마력(ATK +20)이 증폭되는 신비한 지팡이." },
    { name: "암살자의 단검", type: "atk", value: 12, price: 75, rarity: "rare", preferred: "헌터", bonusAtk: 15, desc: "급소를 노리기 좋은 단검. 헌터 사용 시 추가 공격력(+15)이 붙는다." },
    { name: "미스릴 흉갑", type: "hp", value: 50, def: 15, price: 100, rarity: "epic", preferred: "워리어", bonusHp: 30, desc: "가볍고 단단한 환상의 갑옷. 워리어에겐 추가 체력(+30)을 제공한다." },
    { name: "바람의 부츠", type: "acc", value: 15, price: 60, rarity: "rare", desc: "몸이 깃털처럼 가벼워져 명중률(+15%)이 크게 상승한다." },
    { name: "학자의 로브", type: "hp", value: 40, def: 5, price: 50, rarity: "common", preferred: "마법사", bonusAcc: 10, desc: "마법의 흐름을 돕는 로브. 마법사 착용 시 명중률(+10%) 보정." },
    { name: "저주받은 검", type: "atk", value: 40, price: 120, rarity: "epic", penalty: { '워리어': 15, '헌터': 15, '마법사': 20 }, desc: "압도적인 파괴력을 가졌지만, 정신을 갉아먹어 명중률이 크게 하락한다." },
    { name: "낡은 가죽 갑옷", type: "hp", value: 30, def: 3, price: 30, rarity: "common", desc: "초보 모험가들이 흔히 입는 평범한 가죽 갑옷." },
    { name: "정령의 활", type: "atk", value: 18, price: 110, rarity: "epic", preferred: "헌터", bonusAtk: 15, desc: "바람의 정령이 깃든 활. 헌터의 파괴력(+15)을 극대화한다." }
];
