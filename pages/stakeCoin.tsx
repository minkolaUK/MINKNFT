import { ConnectWallet, useAddress, useContract, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "../styles/StakeCoin.module.css"; // Import the CSS module
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { coinstakingContractAddress, tokenContractAddress } from "../const/contractAddresses";

// Define the staking options
const stakingOptions = [
  { period: 7, apy: 20, earlyUnstakeFee: 0.1, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 10, apy: 40, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 32, apy: 60, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 90, apy: 100, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
];

const StakeCoin: NextPage = () => {
  const address = useAddress();
  const { contract: coinstakingContract } = useContract(coinstakingContractAddress);
  const { contract: tokenContract } = useContract(tokenContractAddress);
  const { data: tokenBalance, isLoading: isTokenBalanceLoading, error: tokenBalanceError } = useTokenBalance(tokenContract, address);
  const { mutate: stake, isLoading: isStakeLoading } = useContractWrite(coinstakingContract, "stake");
  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(coinstakingContract, "unstake");

  const [amount, setAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<number>(0);

  useEffect(() => {
    if (tokenBalanceError) {
      toast.error("Error fetching token balance. Please try again later.");
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
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }
    if (![7, 10, 32, 90].includes(lockPeriod)) {
      return toast.error("Please select a valid lock period");
    }

    try {
      await stake({
        args: [ethers.utils.parseUnits(amount, 18), lockPeriod * 24 * 60 * 60]
      });
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
      <ToastContainer position="bottom-center" autoClose={5000} />
      <div className={styles.container}>
        <h1 className={styles.header}>Stake Your Coin</h1>
        <div className={styles.balanceContainer}>
          <p className={styles.balance}>
            Total Balance: {isTokenBalanceLoading ? "Loading..." : `${getTokenBalance()} Coins`}
          </p>
        </div>
        <div className={styles.inputContainer}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className={styles.input}
            min="0"
            step="0.01"
          />
          <select
            value={lockPeriod}
            onChange={(e) => setLockPeriod(Number(e.target.value))}
            className={styles.select}
          >
            <option value={0}>Select lock period</option>
            {stakingOptions.map((option) => (
              <option key={option.period} value={option.period * 24 * 60 * 60}>
                {option.period} Days ({option.apy}%)
              </option>
            ))}
          </select>
          <button onClick={handleStake} disabled={isStakeLoading} className={styles.button}>
            {isStakeLoading ? "Staking..." : "Stake"}
          </button>
          <button onClick={handleUnstake} disabled={isUnstakeLoading} className={`${styles.button} ${styles.marginLeft}`}>
            {isUnstakeLoading ? "Unstaking..." : "Unstake"}
          </button>
        </div>
        <div className={styles.stakingOptionsContainer}>
          {stakingOptions.map((option) => (
            <div key={option.period} className={styles.stakingOption}>
              <h3>Lock period: {option.period} days</h3>
              <p>APY Rate: {option.apy}%</p>
              <p>Early unstake fee: {option.earlyUnstakeFee ? `${option.earlyUnstakeFee}%` : 'None'}</p>
              <p>Minimum Staking Amount: {option.minAmount} BAT</p>
              <p>Maximum Staking Amount: {option.maxAmount}</p>
              <p>Status: {option.status}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StakeCoin;
