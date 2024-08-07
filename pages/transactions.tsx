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
  console.log("Staking History: ", stakingHistory)
  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(coinstakingContract, "unstake");

  const [totalAmountStaked, setTotalAmountStaked] = useState<ethers.BigNumber | null>(null);
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

      // Fetch total amount staked
      try {
        const amount = await coinstakingContract.call("getStakedBalance", [address]);
        setTotalAmountStaked(amount);
      } catch (error) {
        console.error("Error fetching total amount staked:", error);
        toast.error("Error fetching total amount staked.");
      }

      // Fetch staking history
      try {
        const transactions = await Promise.all(stakingHistory.map(async (timestamp: number, index: number) => {
          const amountStaked = stakingHistory[index].amount;
          console.log("Amount", amountStaked);
          const period = stakingHistory[index].lockPeriod;
          console.log("Period: ", period);
          const timeStaked = stakingHistory[index].timestamp;
          console.log("Time Staked: ", timeStaked);
          const lockEndTime = timeStaked + period;
          const now = Math.floor(Date.now() / 1000);
          const timeRemaining = Math.max(0, lockEndTime - now);
          const option = stakingOptions.find(opt => opt.period === period);

          return {
            amount: amountStaked,
            lockPeriod: period,
            startTime: timeStaked,
            timeStaked: Math.floor(timeStaked / (24 * 60 * 60)),
            timeRemaining: Math.floor(timeRemaining / (24 * 60 * 60)),
            apy: option ? option.apy : 0,
            status: option ? option.status : "N/A",
            rewardsPending: ethers.BigNumber.from("0"), // Fetch actual rewards if necessary
          };
        }));

        setStakingTransactions(transactions);
      } catch (error) {
        console.error("Error fetching staking data:", error);
        toast.error("Error fetching staking data.");
      }
    };

    fetchStakingData();
  }, [stakingHistory, coinstakingContract, address]);

  const handleUnstake = async (index: number): Promise<void> => {
    if (!coinstakingContract) return;
    try {
      await unstake({ args: [index] });
      toast.success("Unstaked successfully");
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
          totalAmountStaked={totalAmountStaked}
        />
      </div>
    </div>
  );
};

export default MyTransactions;
