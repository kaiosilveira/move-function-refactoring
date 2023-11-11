import AccountType from '.';
import Account from '../account';

describe('AccountType', () => {
  const accountNumber = 123;
  const regularAccountType = new AccountType('regular');
  const premiumAccountType = new AccountType('premium');

  describe('isPremium', () => {
    it('should return true if account name is "premium"', () => {
      expect(premiumAccountType.isPremium).toEqual(true);
    });

    it('should return false if account name is not "premium"', () => {
      expect(regularAccountType.isPremium).toEqual(false);
    });
  });

  describe('overdraftCharge', () => {
    describe('prmium accounts', () => {
      it('should not charge for the first seven days on overdraft if it is a premium account', () => {
        const daysOverdrawn = 7;
        const account = new Account(accountNumber, premiumAccountType, daysOverdrawn);
        expect(premiumAccountType.overdraftCharge(account)).toEqual(10);
      });

      it('should charge a daily amount after the seven initial days on overdraft', () => {
        const daysOverdrawn = 8;
        const account = new Account(accountNumber, premiumAccountType, daysOverdrawn);
        expect(premiumAccountType.overdraftCharge(account)).toEqual(10.85);
      });
    });

    describe('regular accounts', () => {
      it('should charge the base overdraft charge plus a daily amount for each day in overdraft', () => {
        const daysOverdrawn = 1;
        const account = new Account(accountNumber, regularAccountType, daysOverdrawn);
        expect(regularAccountType.overdraftCharge(account)).toEqual(1.75);
      });
    });
  });
});
