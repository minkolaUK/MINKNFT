import React from 'react';
import { ethers } from "ethers";
import styles from "../../styles/StakeCoin.module.css";

interface StakingOption {
  period: number;
  apy: number;
  status?: string;
}

interface StakingTransactionsProps {
  stakedBalance: ethers.BigNumber;  // Changed from userStakes to stakedBalance
  stakingOptions: StakingOption[];
  onUnstake: () => Promise<void>; // Update onUnstake to handle a single balance
}

const StakingTransactions: React.FC<StakingTransactionsProps> = ({ stakedBalance, stakingOptions, onUnstake }) => {
  // Example period and startTime for demonstration purposes
  const startTime = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // 30 days ago
  const period = 90 * 24 * 60 * 60; // 90 days

  const calculateTimeStaked = (startTime: number, period: number) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = startTime + period;
    const timeStaked = Math.max(0, Math.min(now, endTime) - startTime);
    const timeRemaining = Math.max(0, endTime - now);

    return {
      timeStaked,
      timeRemaining
    };
  };

  const { timeStaked, timeRemaining } = calculateTimeStaked(startTime, period);
  const option = stakingOptions.find(opt => opt.period === period);

  return (
    <div className={styles.stakedContainer}>
      <h2>Your Staking Transactions</h2>
      {stakedBalance ? (
        <div className={styles.stakingOption}>
          <p>Amount Staked: {ethers.utils.formatUnits(stakedBalance, 18)} MINK</p>
          <p>Lock Period: {option ? option.period / (24 * 60 * 60) : "N/A"} days</p>
          <p>Time Staked: {timeStaked ? Math.floor(timeStaked / (24 * 60 * 60)) : "N/A"} days</p>
          <p>Time Remaining: {timeRemaining ? Math.floor(timeRemaining / (24 * 60 * 60)) : "N/A"} days</p>
          <p>APY: {option ? option.apy : "N/A"}%</p>
          <p>Status: {option ? option.status || "N/A" : "N/A"}</p>
          <button
            onClick={onUnstake} // Call onUnstake without index
            className={styles.unstakeButton}
          >
            Unstake
          </button>
        </div>
      ) : (
        <p>No staking transactions found.</p>
      )}
    </div>
  );
};

export default StakingTransactions;
