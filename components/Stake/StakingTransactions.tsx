import React from 'react';
import { ethers } from "ethers";
import styles from "../../styles/StakeCoin.module.css";

interface StakingOption {
  period: number;
  apy: number;
  status?: string;
}

interface StakingTransaction {
  amount: ethers.BigNumber;
  lockPeriod: number;
  startTime: number;
  timeStaked: number;
  timeRemaining: number;
  apy: number;
  status: string;
  rewardsPending: ethers.BigNumber;
}

interface StakingTransactionsProps {
  stakingTransactions: StakingTransaction[]; // Changed to accept an array of transactions
  stakingOptions: StakingOption[];
  onUnstake: (index: number) => Promise<void>; // Pass index to handle specific transaction
}

const StakingTransactions: React.FC<StakingTransactionsProps> = ({ stakingTransactions = [], stakingOptions, onUnstake }) => {
  const calculateTimeStaked = (startTime: number, lockPeriod: number) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = startTime + lockPeriod;
    const timeStaked = Math.max(0, Math.min(now, endTime) - startTime);
    const timeRemaining = Math.max(0, endTime - now);

    return {
      timeStaked,
      timeRemaining
    };
  };

  return (
    <div className={styles.stakedContainer}>
      <h2>Your Staking Transactions</h2>
      {stakingTransactions.length > 0 ? (
        stakingTransactions.map((transaction, index) => {
          const { timeStaked, timeRemaining } = calculateTimeStaked(transaction.startTime, transaction.lockPeriod);
          const option = stakingOptions.find(opt => opt.period === transaction.lockPeriod);

          return (
            <div key={index} className={styles.stakingOption}>
              <p>Amount Staked: {ethers.utils.formatUnits(transaction.amount, 18)} MINK</p>
              <p>Lock Period: {option ? option.period / (24 * 60 * 60) : "N/A"} days</p>
              <p>Time Staked: {timeStaked ? Math.floor(timeStaked / (24 * 60 * 60)) : "N/A"} days</p>
              <p>Time Remaining: {timeRemaining ? Math.floor(timeRemaining / (24 * 60 * 60)) : "N/A"} days</p>
              <p>APY: {option ? option.apy : "N/A"}%</p>
              <p>Status: {option ? option.status || "N/A" : "N/A"}</p>
              <p>Rewards Pending: {ethers.utils.formatUnits(transaction.rewardsPending, 18)} MINK</p>
              <button
                onClick={() => onUnstake(index)} // Call onUnstake with index
                className={styles.unstakeButton}
              >
                Unstake
              </button>
              <p>Warning: Early unstaking will result in loss of rewards.</p>
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
