import { useAddress, useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
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
  
  const { data: stakedBalance, error: stakedBalanceError } = useContractRead(coinstakingContract, "getStakedBalance", [address]);
  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(coinstakingContract, "unstake");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stakedBalanceError) {
      const message = stakedBalanceError instanceof Error ? stakedBalanceError.message : "Error fetching staked data. Please try again later.";
      toast.error(message);
      setError(message);
    }
  }, [stakedBalanceError]);

  const handleUnstake = async (): Promise<void> => {
    try {
      await unstake({ args: [] }); // Update unstake call as needed
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
          stakedBalance={stakedBalance || ethers.BigNumber.from(0)}
          stakingOptions={stakingOptions}
          onUnstake={handleUnstake}
        />
      </div>
    </div>
  );
};

export default MyTransactions;
