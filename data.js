// 직업 상성 관계
const relations = {
    '워리어': { weak: '마법사', strong: '헌터' },
    '헌터': { weak: '워리어', strong: '마법사' },
    '마법사': { weak: '헌터', strong: '워리어' }
};

// ⚖️ [밸런스 패치] 워리어 기본 체력 너프 (220 -> 180) 방패 의존도 증가
const jobBase = {
    Warrior: { name: '워리어', hp: 180, atk: 14, def: 6, color: '#ff4757' },
    Hunter:  { name: '헌터',   hp: 160, atk: 18, def: 3, color: '#2ed573' },
    Wizard:  { name: '마법사', hp: 110, atk: 38, def: 1, color: '#1e90ff' }
};

// v5.1 아이템 풀 (포션 설명 수정)
const equipmentPool = [
    { name: "대마법사의 지팡이", type: "atk", value: 25, price: 100, rarity: "epic", preferred: "마법사", bonusAtk: 25, unlockSkill: "메테오", desc: "마력을 폭발시켜(+25) 방어력을 무시하는 [🔥 메테오] 스킬이 해제된다." },
    { name: "거인족의 대검", type: "atk", value: 20, price: 90, rarity: "epic", preferred: "워리어", bonusAtk: 20, unlockSkill: "대회전", desc: "공격력(+20)이 증가하며 강력한 광역기 [💥 대회전] 스킬이 해제된다." },
    { name: "정령왕의 활", type: "atk", value: 22, price: 95, rarity: "epic", preferred: "헌터", bonusAtk: 20, unlockSkill: "폭풍화살", desc: "파괴력(+20)이 극대화되며 [🌪️ 폭풍화살] 스킬이 해제된다." },
    { name: "드래곤의 심장", type: "hp", value: 150, def: 15, price: 200, rarity: "legendary", desc: "전설 속 드래곤의 심장. 압도적인 체력(+150)과 방어력(+15)을 부여한다." },
    { name: "엑스칼리버", type: "atk", value: 50, acc: 10, price: 220, rarity: "legendary", desc: "성검. 엄청난 공격력(+50)과 명중률(+10%)을 동시에 올려준다." },
    { name: "미스릴 흉갑", type: "hp", value: 80, def: 15, price: 100, rarity: "epic", preferred: "워리어", bonusHp: 50, desc: "가볍고 단단한 환상의 갑옷. 워리어에겐 추가 체력(+50)을 제공한다." },
    { name: "저주받은 검", type: "atk", value: 45, price: 110, rarity: "epic", penalty: { '워리어': 20, '헌터': 20, '마법사': 30 }, desc: "파괴력은 엄청나지만, 정신을 갉아먹어 명중률이 크게 하락한다." },
    { name: "바람의 부츠", type: "acc", value: 20, price: 60, rarity: "rare", desc: "몸이 깃털처럼 가벼워져 명중률(+20%)이 크게 상승한다." },
    { name: "암살자의 단검", type: "atk", value: 15, price: 75, rarity: "rare", preferred: "헌터", bonusAtk: 15, desc: "급소를 노리기 좋은 단검. 헌터 사용 시 추가 공격력(+15)이 붙는다." },
    { name: "학자의 로브", type: "hp", value: 40, def: 5, price: 50, rarity: "common", preferred: "마법사", bonusAcc: 15, desc: "마법의 흐름을 돕는 로브. 마법사 착용 시 명중률(+15%) 보정." },
    { name: "중갑옷", type: "hp", value: 80, def: 10, price: 70, rarity: "rare", penalty: { '마법사': 25, '헌터': 15 }, desc: "방어력을 올리지만, 너무 무거워 마법사와 헌터는 명중률이 깎인다." },
    { name: "낡은 가죽 갑옷", type: "hp", value: 30, def: 3, price: 30, rarity: "common", desc: "초보 모험가들이 흔히 입는 평범한 가죽 갑옷." }
];
