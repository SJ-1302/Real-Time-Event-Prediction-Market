const B = 100.0;

export const getYesProbability = (yesPool: number, noPool: number): number => {
  return (
    Math.exp(yesPool / B) /
    (Math.exp(yesPool / B) + Math.exp(noPool / B))
  );
};

export const getNoProbability = (yesPool: number, noPool: number): number => {
  return 1.0 - getYesProbability(yesPool, noPool);
};

export const calculateCost = (
  currentYesPool: number,
  currentNoPool: number,
  tradeType: 'buy' | 'sell',
  positionType: 'yes' | 'no',
  amountOfShares: number
): number => {
  const sign = tradeType === 'buy' ? 1 : -1;
  const newYes = positionType === 'yes' ? currentYesPool + sign * amountOfShares : currentYesPool;
  const newNo  = positionType === 'no'  ? currentNoPool + sign * amountOfShares : currentNoPool;

  const currentCostFunction = B * Math.log(Math.exp(currentYesPool / B) + Math.exp(currentNoPool / B));
  const newCostFunction = B * Math.log(Math.exp(newYes / B) + Math.exp(newNo / B));

  return Math.abs(newCostFunction - currentCostFunction);
};

export const calculateInitialPools = (targetProbability: number) => {
  const p = Math.max(0.01, Math.min(0.99, targetProbability));
  const yesPool = B * Math.log(p / (1 - p));
  const noPool = 0;
  const shift = yesPool < 0 ? Math.abs(yesPool) : 0;

  return {
    yesPool: yesPool + shift,
    noPool: noPool + shift
  };
};
