export default class AccountType {
  constructor(nameString) {
    this.name = nameString;
  }

  get isPremium() {
    return this.name === 'premium';
  }

  overdraftCharge(account) {
    const { daysOverdrawn } = account;
    if (this.isPremium) {
      const baseCharge = 10;
      if (daysOverdrawn <= 7) return baseCharge;
      return baseCharge + (daysOverdrawn - 7) * 0.85;
    }

    return daysOverdrawn * 1.75;
  }
}
