import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractWrite,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { 
  minkCoinstakingContractAddress, 
  tokenContractAddress 
} from "../const/contractAddresses";
import styles from "../styles/StakeCoin.module.css"; // Import the CSS module
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const StakeCoin: NextPage = () => {
  const address = useAddress();
  const { contract: stakingContract } = useContract(minkCoinstakingContractAddress);
  const { contract: tokenContract } = useContract(tokenContractAddress);

  const { data: tokenBalance, isLoading: isTokenBalanceLoading, error: tokenBalanceError } = useTokenBalance(tokenContract, address);
  const { mutate: stake, isLoading: isStakeLoading } = useContractWrite(stakingContract, "stake");
  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(stakingContract, "unstake");

  const [amount, setAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<number>(0);

  useEffect(() => {
    if (tokenBalanceError) {
      console.error("Error fetching token balance:", tokenBalanceError);
    }
  }, [tokenBalanceError]);

  const getTokenBalance = () => {
    if (!tokenBalance) return "No balance";

    try {
      if (typeof tokenBalance === 'string') {
        return parseFloat(tokenBalance).toFixed(4);
      } else if (ethers.BigNumber.isBigNumber(tokenBalance)) {
        return parseFloat(ethers.utils.formatUnits(tokenBalance, 18)).toFixed(4);
      } else if (tokenBalance.value && ethers.BigNumber.isBigNumber(tokenBalance.value)) {
        return parseFloat(ethers.utils.formatUnits(tokenBalance.value, 18)).toFixed(4);
      } else {
        throw new Error("Unexpected token balance format");
      }
    } catch (error) {
      console.error("Error processing token balance:", error);
      return "Error fetching balance";
    }
  };

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error("Please enter a valid amount");
    if (![90 * 24 * 60 * 60, 180 * 24 * 60 * 60, 365 * 24 * 60 * 60].includes(lockPeriod)) return toast.error("Please select a valid lock period");

    try {
      await stake({
        args: [ethers.utils.parseUnits(amount, 18), lockPeriod]
      });
      toast.success("Staked successfully!");
    } catch (error) {
      console.error("Error staking tokens:", error);
      toast.error("Error staking tokens. See console for details.");
    }
  };

  const handleUnstake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error("Please enter a valid amount");

    try {
      await unstake({
        args: [ethers.utils.parseUnits(amount, 18)]
      });
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
          <p className={styles.balance}>
            Total Balance: {isTokenBalanceLoading ? "Loading..." : `${getTokenBalance()} Mink`}
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
          <button onClick={handleStake} disabled={isStakeLoading} className={styles.button}>
            {isStakeLoading ? "Staking..." : "Stake"}
          </button>
          <button onClick={handleUnstake} disabled={isUnstakeLoading} className={`${styles.button} ${styles.marginLeft}`}>
            {isUnstakeLoading ? "Unstaking..." : "Unstake"}
          </button>
        </div>
      </div>
    </>
  );
};

export default StakeCoin;
