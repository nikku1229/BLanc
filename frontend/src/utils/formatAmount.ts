export const isNegative = (amount: number): boolean => {
  return amount < 0;
};

export const formatBalance = (balance: number): string => {
  if (isNegative(balance)) {
    return `-₹${Math.abs(balance).toFixed(2)}`;
  }
  return `₹${balance.toFixed(2)}`;
};
