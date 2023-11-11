import Account from '.';
import AccountType from '../account-type';

describe('Account', () => {
  const accountNumber = 123;
  const premiumAccountType = new AccountType(true);
  const regularAccountType = new AccountType(false);

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
