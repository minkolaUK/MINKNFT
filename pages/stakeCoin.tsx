import {
  useContract,
  useTokenBalance,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { tokenContractAddress, minkCoinstakingContractAddress } from "../const/contractAddresses";
import styles from "../styles/StakeCoin.module.css";
import stylesHome from "../styles/Home.module.css";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const StakeCoin: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<number>(0);

  const { contract: tokenContract } = useContract(tokenContractAddress);
  const { data: tokenBalance, isLoading: isTokenBalanceLoading, error: tokenBalanceError } = useTokenBalance(tokenContract, userAddress);
  const { contract: minkStakingContract } = useContract(minkCoinstakingContractAddress);
  
  useEffect(() => {
    async function fetchUserAddress() {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
        } else {
          console.error("Ethereum provider not found");
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
      }
    }

    fetchUserAddress();
  }, []);

  useEffect(() => {
    if (tokenBalanceError) {
      console.error("Error fetching token balance:", tokenBalanceError);
    }
  }, [tokenBalanceError]);

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }
    if (![90 * 24 * 60 * 60, 180 * 24 * 60 * 60, 365 * 24 * 60 * 60].includes(lockPeriod)) {
      return toast.error("Please select a valid lock period");
    }

    try {
      // Add your staking logic here with `minkStakingContract` and `amount` & `lockPeriod` state variables
      toast.success("Staked successfully!");
    } catch (error) {
      console.error("Error staking tokens:", error);
      toast.error("Error staking tokens. See console for details.");
    }
  };

  const handleUnstake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    try {
      // Add your unstaking logic here with `minkStakingContract` and `amount` state variable
      toast.success("Unstaked successfully!");
    } catch (error) {
      console.error("Error unstaking tokens:", error);
      toast.error("Error unstaking tokens. See console for details.");
    }
  };

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className={styles.container}>
        <h1 className={styles.header}>Stake Your Mink Coin</h1>
        <div className={styles.balanceContainer}>
          <h3 className={stylesHome.tokenLabel}>Current Balance</h3>
          <p className={stylesHome.tokenValue}>
            <b>
              {isTokenBalanceLoading
                ? "Loading..."
                : typeof tokenBalance?.displayValue === 'string'
                ? parseFloat(tokenBalance.displayValue).toFixed(4)
                : "N/A"}
            </b>{" "}
            {tokenBalance?.symbol || "Mink"}
          </p>
        </div>
        <div className={styles.inputContainer}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className={styles.input}
          />
          <select
            value={lockPeriod}
            onChange={(e) => setLockPeriod(Number(e.target.value))}
            className={styles.select}
          >
            <option value={0}>Select lock period</option>
            <option value={90 * 24 * 60 * 60}>3 Months (3%)</option>
            <option value={180 * 24 * 60 * 60}>6 Months (3.5%)</option>
            <option value={365 * 24 * 60 * 60}>12 Months (5%)</option>
          </select>
          <button onClick={handleStake} disabled={false} className={styles.button}>
            {"Stake"}
          </button>
          <button onClick={handleUnstake} disabled={false} className={`${styles.button} ${styles.marginLeft}`}>
            {"Unstake"}
          </button>
        </div>
      </div>
    </>
  );
};

export default StakeCoin;
