import React from "react";
import { BigNumber, ethers } from "ethers";

// Define the shape of each staking transaction
interface StakingTransaction {
  amount: BigNumber;
  lockPeriod: number;
  startTime: number;
  rewardsPending: BigNumber;
}

// Define the shape of the props for the StakingTransactions component
interface StakingTransactionsProps {
  stakingTransactions: StakingTransaction[];
  stakingOptions: { period: number; apy: number; status: string }[];
  onUnstake: (index: number) => Promise<void>;
}

const StakingTransactions: React.FC<StakingTransactionsProps> = ({ stakingTransactions, stakingOptions, onUnstake }) => {
  // Calculate the total amount staked
  const totalAmountStaked = stakingTransactions.reduce((total, tx) => total.add(tx.amount), BigNumber.from(0));

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString(); // Format to locale string
  };

  const calculateTimeStaked = (startTime: number, lockPeriod: number) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = startTime + lockPeriod;
    const timeStaked = Math.max(0, Math.min(now, endTime) - startTime);
    const timeRemaining = Math.max(0, endTime - now);

    return { timeStaked, timeRemaining };
  };

  return (
    <div>
      <h2>Your Staking Transactions</h2>
      <p>Total Amount Staked: {ethers.utils.formatUnits(totalAmountStaked, 18)} MINK</p>

      {stakingTransactions.length > 0 ? (
        stakingTransactions.map((transaction, index) => {
          const { timeStaked, timeRemaining } = calculateTimeStaked(transaction.startTime, transaction.lockPeriod);
          const option = stakingOptions.find(opt => opt.period === transaction.lockPeriod);

          return (
            <div key={index}>
              <p>Amount Staked: {ethers.utils.formatUnits(transaction.amount, 18)} MINK</p>
              <p>Lock Period: {option ? option.period / (24 * 60 * 60) : "N/A"} days</p>
              <p>Time Staked: {timeStaked ? Math.floor(timeStaked / (24 * 60 * 60)) : "N/A"} days</p>
              <p>Time Remaining: {timeRemaining ? Math.floor(timeRemaining / (24 * 60 * 60)) : "N/A"} days</p>
              <p>APY: {option ? option.apy : "N/A"}%</p>
              <p>Status: {option ? option.status || "N/A" : "N/A"}</p>
              <p>Rewards Pending: {ethers.utils.formatUnits(transaction.rewardsPending, 18)} MINK</p>
              <p>Date & Time: {formatDate(transaction.startTime)}</p>
              <button onClick={() => onUnstake(index)}>
                Unstake
              </button>
              <p>Warning: Early unstaking may result in loss of rewards.</p>
            </div>
          );
        })
      ) : (
        <p>No staking transactions found.</p>
      )}
    </div>
  );
};

export default StakingTransactions;
