export default class Account {
  constructor(number, type, daysOverdrawn) {
    this.number = number;
    this.type = type;
    this.daysOverdrawn = daysOverdrawn;
  }

  get bankCharge() {
    let result = 4.5;
    if (this.daysOverdrawn > 0) result += this.overdraftCharge;
    return result;
  }

  get overdraftCharge() {
    if (this.type.isPremium) {
      const baseCharge = 10;
      if (this.daysOverdrawn <= 7) return baseCharge;
      return baseCharge + (this.daysOverdrawn - 7) * 0.85;
    }

    return this.daysOverdrawn * 1.75;
  }
}
