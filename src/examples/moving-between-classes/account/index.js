export default class Account {
  constructor(number, type, daysOverdrawn) {
    this.number = number;
    this.type = type;
    this.daysOverdrawn = daysOverdrawn;
  }

  get bankCharge() {
    let result = 4.5;
    if (this.daysOverdrawn > 0) result += this.type.overdraftCharge(this.daysOverdrawn);
    return result;
  }
}
