const cardTypes = ['MM', 'VV', 'SB', 'BN', 'SMS'];
const rarities = ['C', 'U', 'R', 'E', 'L', 'M'];
const rarityMultipliers = { C: 1, U: 1.5, R: 2, E: 3, L: 5, M: 10 };

export class RandTrend {
  static genCard() {
    return {
      type: cardTypes[Math.floor(Math.random() * cardTypes.length)],
      CP: Math.floor(Math.random() * 13) + 1,
      Vir: Math.floor(Math.random() * 10) + 1,
      Rar: rarities[Math.floor(Math.random() * rarities.length)]
    };
  }

  static calcVal(card) {
    return card.CP * card.Vir * rarityMultipliers[card.Rar];
  }
}