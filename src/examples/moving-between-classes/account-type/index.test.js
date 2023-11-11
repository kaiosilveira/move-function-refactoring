import AccountType from '.';

describe('AccountType', () => {
  describe('isPremium', () => {
    it('should return true if account name is "premium"', () => {
      const type = new AccountType('premium');
      expect(type.isPremium).toEqual(true);
    });

    it('should return false if account name is not "premium"', () => {
      const type = new AccountType('regular');
      expect(type.isPremium).toEqual(false);
    });
  });
});
