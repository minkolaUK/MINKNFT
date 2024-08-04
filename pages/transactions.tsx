import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { coinstakingContractAddress } from "../const/contractAddresses";
import { abi } from '../const/coinrewardsabi';
import StakingTransactions from '../components/Stake/StakingTransactions';
import styles from "../styles/StakeCoin.module.css";

// Define the staking options
const stakingOptions = [
  { period: 90 * 24 * 60 * 60, apy: 2, status: 'Active' },
  { period: 180 * 24 * 60 * 60, apy: 2.5, status: 'Active' },
  { period: 365 * 24 * 60 * 60, apy: 3, status: 'Active' },
];

const MyTransactions: React.FC = () => {
  const address = useAddress();
  const { contract: coinstakingContract } = useContract(coinstakingContractAddress, abi);
  const { data: userStakes, error: userStakesError } = useContractRead(coinstakingContract, "getUserStakes", [address]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userStakesError) {
      const message = userStakesError instanceof Error ? userStakesError.message : "Error fetching staked data. Please try again later.";
      toast.error(message);
      setError(message);
    }
  }, [userStakesError]);

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.header}>My Transactions</div>
      {error && <p>Error: {error}</p>}
      <StakingTransactions
        userStakes={userStakes || []}
        stakingOptions={stakingOptions}
      />
    </div>
  );
};

export default MyTransactions;
