// export interface BetResult {
//     candidateName: string;
//     expectedOdds: number;
//     actualOdds: number;
//     expectedAmount: number;
//     actualAmount: number;
//     expectedProfit: number;
//     actualProfit: number;
//   }
  
  export type BetResult = {
    name: string;
    odds: number;
    amount: number;
    profit: number;
  };