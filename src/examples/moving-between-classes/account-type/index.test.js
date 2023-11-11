import AccountType from '.';

describe('AccountType', () => {
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
        expect(premiumAccountType.overdraftCharge(7)).toEqual(10);
      });

      it('should charge a daily amount after the seven initial days on overdraft', () => {
        expect(premiumAccountType.overdraftCharge(8)).toEqual(10.85);
      });
    });

    describe('regular accounts', () => {
      it('should charge the base overdraft charge plus a daily amount for each day in overdraft', () => {
        expect(regularAccountType.overdraftCharge(1)).toEqual(1.75);
      });
    });
  });
});
