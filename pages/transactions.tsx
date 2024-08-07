import React, { useEffect, useState } from 'react';
import { useAddress, useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { coinstakingContractAddress } from "../const/contractAddresses";
import { coinRewardsAbi } from '../const/coinrewardsabi';
import StakingTransactions from '../components/Stake/StakingTransactions';
import styles from "../styles/StakeCoin.module.css";
import { ethers } from "ethers";

const stakingOptions = [
  { period: 90 * 24 * 60 * 60, apy: 2, status: 'Active' },
  { period: 180 * 24 * 60 * 60, apy: 2.5, status: 'Active' },
  { period: 365 * 24 * 60 * 60, apy: 3, status: 'Active' },
];

const MyTransactions: React.FC = () => {
  const address = useAddress();
  const { contract: coinstakingContract } = useContract(coinstakingContractAddress, coinRewardsAbi);

  const { data: stakingHistory = [], error: stakingHistoryError } = useContractRead(coinstakingContract, "getStakingHistory", [address]);

  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(coinstakingContract, "unstake");

  const [error, setError] = useState<string | null>(null);
  const [stakingTransactions, setStakingTransactions] = useState<any[]>([]);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    if (stakingHistoryError) {
      const message = stakingHistoryError instanceof Error ? stakingHistoryError.message : "Error fetching staking history. Please try again later.";
      toast.error(message);
      setError(message);
    }
  }, [stakingHistoryError]);

  useEffect(() => {
    const fetchStakingData = async () => {
      if (!coinstakingContract) return;

      const transactions = await Promise.all(stakingHistory.map(async (timestamp: number, index: number) => {
        // Assuming the staking amount can be fetched by index. Adjust if necessary.
        const amountStaked = await coinstakingContract.call("getStakedBalance", [address]);

        const period = stakingOptions.find(opt => opt.period === (timestamp + 90 * 24 * 60 * 60 - timestamp))?.period || 0;
        const lockEndTime = timestamp + period;
        const now = Math.floor(Date.now() / 1000);
        const timeStaked = Math.max(0, Math.min(now, lockEndTime) - timestamp);
        const timeRemaining = Math.max(0, lockEndTime - now);
        const option = stakingOptions.find(opt => opt.period === period);

        return {
          amount: amountStaked,
          lockPeriod: period,
          startTime: timestamp,
          timeStaked: Math.floor(timeStaked / (24 * 60 * 60)),
          timeRemaining: Math.floor(timeRemaining / (24 * 60 * 60)),
          apy: option ? option.apy : 0,
          status: option ? option.status : "N/A",
          rewardsPending: ethers.BigNumber.from("0"), // Fetch actual rewards if necessary
        };
      }));

      setStakingTransactions(transactions);
    };

    fetchStakingData();
  }, [stakingHistory, coinstakingContract, address]);

  const handleUnstake = async (index: number): Promise<void> => {
    if (!coinstakingContract) return;
    try {
      // Call the unstake method
      await unstake({ args: [index] });

      // On success, notify the user
      toast.success("Unstaked successfully");

      // Optionally, you can update the transaction hash if the `unstake` function provides one
      // If not, you might not need this step
      // setTransactionHash(receipt.hash);

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error unstaking tokens:", error);
      toast.error(`Error unstaking tokens: ${message}`);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.header}>My Transactions</div>
      {error && <p>Error: {error}</p>}
      <div className={styles.stakedContainer}>
        <StakingTransactions
          stakingTransactions={stakingTransactions}
          stakingOptions={stakingOptions}
          onUnstake={handleUnstake}
        />
      </div>
    </div>
  );
};

export default MyTransactions;
