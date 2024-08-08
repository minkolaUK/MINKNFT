import React from "react";
import { BigNumber, ethers } from "ethers";
import styles from '../../styles/StakeCoin.module.css'; // Ensure this path is correct

// Define the shape of each staking transaction
interface StakingTransaction {
  amount: BigNumber;
  lockPeriod: BigNumber;
  startTime: BigNumber;
  rewardsPending: BigNumber;
}

// Define the shape of the props for the StakingTransactions component
interface StakingTransactionsProps {
  stakingTransactions: StakingTransaction[];
  stakingOptions: { period: number; apy: number; status: string }[];
  onUnstake: (index: number) => Promise<void>;
  totalAmountStaked: ethers.BigNumber | null;
  totalRewards: string;
}

const StakingTransactions: React.FC<StakingTransactionsProps> = ({ stakingTransactions, stakingOptions, onUnstake, totalAmountStaked, totalRewards }) => {
  // Format timestamp into a readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(); // Include time for more detail
  };

  // Calculate time staked and time remaining
  const calculateTimeStaked = (startTime: BigNumber, lockPeriod: BigNumber) => {
    const startTimeNumber = startTime.toNumber();
    const lockPeriodNumber = lockPeriod.toNumber();
    const now = Math.floor(Date.now() / 1000);
    const endTime = startTimeNumber + lockPeriodNumber;

    const timeStaked = now - startTimeNumber;
    const timeRemaining = Math.max(0, endTime - now);

    return { timeStaked, timeRemaining };
  };

  // Calculate pending rewards
  const calculateRewardsPending = (amount: BigNumber, timeStaked: number, apy: number) => {
    console.log(amount,timeStaked,apy)
    const apyBigNumber = ethers.utils.parseUnits((apy / 100).toString(), 18);
  
    const secondsInYear = BigNumber.from(365 * 24 * 60 * 60);
    const timeStakedBN = BigNumber.from(timeStaked);

    const rewardsPending = amount
      .mul(apyBigNumber)
      .mul(timeStakedBN)
      .div(secondsInYear)
      .div(ethers.utils.parseUnits("1", 18));
    return rewardsPending;
  };

  return (
    <div className={styles.stakedContainer}>
      <h2>Your Staking Transactions</h2>
      <p>
        Total Amount Staked:{" "}
        {totalAmountStaked ? ethers.utils.formatUnits(totalAmountStaked, 18) : "Loading..."} MINK
      </p>
      <p>Your Total Pending Rewards:{" "}
          {totalRewards} MINK</p>
      
      {stakingTransactions.length > 0 ? (
        stakingTransactions.map((transaction, index) => {
          const { timeStaked, timeRemaining } = calculateTimeStaked(transaction.startTime, transaction.lockPeriod);
          const option = stakingOptions.find(opt => opt.period === transaction.lockPeriod.toNumber());
          const rewardsPending = option ? calculateRewardsPending(transaction.amount, timeStaked, option.apy) : BigNumber.from(0);

          return (
            <div key={index} className={styles.stakingOption}>
              <p><strong>Amount Staked:</strong> {ethers.utils.formatUnits(transaction.amount, 18)} MINK</p>
              <p><strong>Lock Period:</strong> {option ? (option.period / (24 * 60 * 60)).toFixed(0) : "N/A"} days</p>
              <p><strong>Time Staked:</strong> {Math.floor(timeStaked / (24 * 60 * 60)).toFixed(0)} days</p>
              <p><strong>Time Remaining:</strong> {Math.floor(timeRemaining / (24 * 60 * 60)).toFixed(0)} days</p>
              <p><strong>APY:</strong> {option ? option.apy : "N/A"}%</p>
              <p><strong>Status:</strong> {transaction.amount.isZero() ? "Unstaked" : (option ? option.status : "N/A")}</p>
              <p><strong>Rewards Pending:</strong> {ethers.utils.formatUnits(rewardsPending, 18)} MINK</p>
              <p><strong>Date & Time:</strong> {formatDate(transaction.startTime.toNumber())}</p>
              <button onClick={() => onUnstake(index)} className={styles.unstakeButton}>
                Unstake
              </button>
              <p><em>Warning: Early unstaking will result in loss of rewards.</em></p>
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
