import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styles from '../../styles/StakeCoin.module.css';

interface StakingTransaction {
  amount: string; // Updated to string to handle data from API
  lockPeriod: number;
  startTime: number;
  timeStaked: number;
  timeRemaining: number;
  apy: number;
  status: string;
  rewardsPending: string; // Updated to string to handle data from API
}

interface StakingTransactionsProps {
  stakingOptions: { period: number; apy: number; status?: string }[];
  onUnstake: (index: number) => Promise<void>;
}

const StakingTransactions: React.FC<StakingTransactionsProps> = ({ stakingOptions, onUnstake }) => {
  const [stakingTransactions, setStakingTransactions] = useState<StakingTransaction[]>([]);
  
  // Fetch staking transactions on component mount
  useEffect(() => {
    const fetchStakingTransactions = async () => {
      try {
        // Replace with your Blockscout API endpoint
        const response = await fetch('https://etc-mordor.blockscout.com/api?module=account&action=tokentx&address=0xe574AC002C39614b34E0B2499dFc1f6FABad8b6D');
        const data = await response.json();

        const transactions = data.result.map((tx: any) => ({
          amount: tx.value,
          lockPeriod: 0, // Adjust this if necessary
          startTime: parseInt(tx.timeStamp),
          timeStaked: 0, // Adjust this if necessary
          timeRemaining: 0, // Adjust this if necessary
          apy: 0, // Adjust this if necessary
          status: 'N/A', // Adjust this if necessary
          rewardsPending: '0', // Adjust this if necessary
        }));

        setStakingTransactions(transactions);
      } catch (error) {
        console.error('Error fetching staking transactions:', error);
      }
    };

    fetchStakingTransactions();
  }, []);

  // Calculate the total amount staked
  const totalAmountStaked = stakingTransactions.reduce((total, tx) => total.add(ethers.BigNumber.from(tx.amount)), ethers.BigNumber.from(0));

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // Format to locale string
  };

  const calculateTimeStaked = (startTime: number, lockPeriod: number) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = startTime + lockPeriod;
    const timeStaked = Math.max(0, Math.min(now, endTime) - startTime);
    const timeRemaining = Math.max(0, endTime - now);

    return { timeStaked, timeRemaining };
  };

  return (
    <div className={styles.stakedContainer}>
      <h2>Your Staking Transactions</h2>
      <p>Total Amount Staked: {ethers.utils.formatUnits(totalAmountStaked, 18)} MINK</p>

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
              <p>Date & Time: {formatDate(transaction.startTime)}</p>
              <button
                onClick={() => onUnstake(index)}
                className={styles.unstakeButton}
              >
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
