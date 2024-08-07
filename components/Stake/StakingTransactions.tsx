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
  totalAmountStaked: ethers.BigNumber | null; // Add this line

}

const StakingTransactions: React.FC<StakingTransactionsProps> = ({ stakingTransactions, stakingOptions, onUnstake, totalAmountStaked }) => {
  // Calculate the total amount staked
  console.log("Staking Transactions: ", stakingTransactions);
  
  // Format timestamp into a readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(); // Include time for more detail
  };

// Calculate time staked and time remaining
const calculateTimeStaked = (startTime: BigNumber, lockPeriod: BigNumber) => {

  // Convert BigNumber values to JavaScript numbers
  const startTimeNumber = startTime.toNumber();
  const lockPeriodNumber = lockPeriod.toNumber();
  console.log("Lock Time:", lockPeriodNumber); // Convert BigNumber to string for logging

  const now = Math.floor(Date.now() / 1000);
  const endTime = startTimeNumber + lockPeriodNumber;
  console.log("End Time:", endTime);

  const timeStaked = now - startTimeNumber;
  const timeRemaining = Math.max(0, endTime - now);

  return { timeStaked, timeRemaining };
};

  return (
    <div className={styles.stakedContainer}>
      <h2>Your Staking Transactions</h2>
      <p>
        Total Amount Staked:{" "}
        {totalAmountStaked ? ethers.utils.formatUnits(totalAmountStaked, 18) : "Loading..."} MINK
      </p>
      
      {stakingTransactions.length > 0 ? (
        stakingTransactions.map((transaction, index) => {
          const { timeStaked, timeRemaining } = calculateTimeStaked(transaction.startTime, transaction.lockPeriod);
          console.log("Time Remaining: ", timeRemaining);
          const option = stakingOptions.find(opt => opt.period === transaction.lockPeriod.toNumber());
 
          return (
            <div key={index} className={styles.stakingOption}>
              <p><strong>Amount Staked:</strong> {ethers.utils.formatUnits(transaction.amount, 18)} MINK</p>
              <p><strong>Lock Period:</strong> {option ? (option.period / (24 * 60 * 60)).toFixed(0) : "N/A"} days</p>
              <p><strong>Time Staked:</strong> {Math.floor(timeStaked / (24 * 60 * 60)).toFixed(0)} days</p>
              <p><strong>Time Remaining:</strong> {Math.floor(timeRemaining / (24 * 60 * 60)).toFixed(0)} days</p>
              <p><strong>APY:</strong> {option ? option.apy : "N/A"}%</p>
              <p><strong>Status:</strong> {option ? option.status : "N/A"}</p>
              <p><strong>Rewards Pending:</strong> {ethers.utils.formatUnits(transaction.rewardsPending, 18)} MINK</p>
              <p><strong>Date & Time:</strong> {formatDate(transaction.startTime.toNumber())}</p>
              <button onClick={() => onUnstake(index)} className={styles.unstakeButton}>
                Unstake
              </button>
              <p><em>Warning: Early unstaking may result in loss of rewards.</em></p>
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
