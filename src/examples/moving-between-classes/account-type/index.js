export default class AccountType {
  constructor(nameString) {
    this.name = nameString;
  }

  get isPremium() {
    return this.name === 'premium';
  }
}
