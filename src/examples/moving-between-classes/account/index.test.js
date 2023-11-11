import Account from '.';
import AccountType from '../account-type';

describe('Account', () => {
  const accountNumber = 123;
  const regularAccountType = new AccountType('regular');
  const premiumAccountType = new AccountType('premium');

  describe('overdraftCharge', () => {
    describe('prmium accounts', () => {
      it('should not charge for the first seven days on overdraft if it is a premium account', () => {
        const daysOverdrawn = 7;
        const account = new Account(accountNumber, premiumAccountType, daysOverdrawn);
        expect(account.overdraftCharge).toEqual(10);
      });

      it('should charge a daily amount after the seven initial days on overdraft', () => {
        const daysOverdrawn = 8;
        const account = new Account(accountNumber, premiumAccountType, daysOverdrawn);
        expect(account.overdraftCharge).toEqual(10.85);
      });
    });

    describe('regular accounts', () => {
      it('should charge the base overdraft charge plus a daily amount for each day in overdraft', () => {
        const daysOverdrawn = 1;
        const account = new Account(123, regularAccountType, daysOverdrawn);
        expect(account.overdraftCharge).toEqual(1.75);
      });
    });
  });

  describe('bankCharge', () => {
    it('should return the base charge if account is not on overdraft', () => {
      const daysOverdrawn = 0;
      const account = new Account(premiumAccountType, regularAccountType, daysOverdrawn);
      expect(account.bankCharge).toEqual(4.5);
    });

    it('should return the base charge plus the overdraft charge if account is on overdraft', () => {
      const daysOverdrawn = 1;
      const account = new Account(accountNumber, regularAccountType, daysOverdrawn);
      expect(account.bankCharge).toEqual(6.25);
    });
  });
});
