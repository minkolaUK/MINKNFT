import { ConnectWallet, useAddress, useContract, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "../styles/StakeCoin.module.css";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { coinstakingContractAddress, tokenContractAddress } from "../const/contractAddresses";

// Define the staking options with updated APY rates
const stakingOptions = [
  { period: 90 * 24 * 60 * 60, apy: 2, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 180 * 24 * 60 * 60, apy: 2.5, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 365 * 24 * 60 * 60, apy: 3, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
];

const StakeCoin: NextPage = () => {
  const address = useAddress();
  const { contract: coinstakingContract } = useContract(coinstakingContractAddress);
  const { contract: tokenContract } = useContract(tokenContractAddress);
  const { data: tokenBalance, isLoading: isTokenBalanceLoading, error: tokenBalanceError } = useTokenBalance(tokenContract, address);
  const { mutate: stake, isLoading: isStakeLoading } = useContractWrite(coinstakingContract, "stake");
  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(coinstakingContract, "withdraw");

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

  const calculateReward = (amount: string, apy: number, days: number) => {
    const daysInYear = 365;
    const interestRate = (apy / 100) * (days / daysInYear);
    return Number(amount) * interestRate;
  };

  const getEstimatedReward = () => {
    const selectedOption = stakingOptions.find(option => option.period === lockPeriod);
    if (!selectedOption) return "Select a valid lock period";
    const apy = selectedOption.apy;
    return calculateReward(amount, apy, lockPeriod / (24 * 60 * 60)).toFixed(4);
  };

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }
    if (![90 * 24 * 60 * 60, 180 * 24 * 60 * 60, 365 * 24 * 60 * 60].includes(lockPeriod)) {
      return toast.error("Please select a valid lock period");
    }

    try {
      // Check for approval first
      const isApproved = await tokenContract?.call("allowance", [address, coinstakingContractAddress]);
      if (ethers.BigNumber.from(isApproved).lt(ethers.utils.parseUnits(amount, 18))) {
        // Request approval if not sufficient
        await tokenContract?.call("approve", [coinstakingContractAddress, ethers.utils.parseUnits(amount, 18)]);
        toast.success("Approval successful. Proceeding to stake...");
      }

      // Proceed to stake
      await stake({
        args: [ethers.utils.parseUnits(amount, 18), lockPeriod],
      });
      toast.success(`Staked successfully! Estimated reward: ${getEstimatedReward()} MINK`);
    } catch (error: unknown) {
      console.error("Error staking tokens:", error);

      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        const reasonMatch = error.message.match(/Reason: (.+?)(\n|$)/);
        if (reasonMatch) {
          errorMessage = reasonMatch[1];
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(`Error staking tokens: ${errorMessage}`);
    }
  };

  const handleUnstake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    try {
      await unstake({
        args: [ethers.utils.parseUnits(amount, 18)],
      });
      toast.success("Unstaked successfully!");
    } catch (error) {
      console.error("Error unstaking tokens:", error);

      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        const reasonMatch = error.message.match(/Reason: (.+?)(\n|$)/);
        if (reasonMatch) {
          errorMessage = reasonMatch[1];
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(`Error unstaking tokens: ${errorMessage}`);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-center" autoClose={5000} />
      <div className={styles.container}>
        <h1 className={styles.header}>Stake Your Mink Coin</h1>
        <div className={styles.balanceContainer}>
          <p className={styles.balance}>
            Total Balance: {isTokenBalanceLoading ? "Loading..." : `${getTokenBalance()} Mink Coin`}
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
              <option key={option.period} value={option.period}>
                {option.period / (24 * 60 * 60)} Days ({option.apy}%)
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
        <div className={styles.rewardCalculator}>
          <h3>Estimated Reward</h3>
          <p>Based on your input, the estimated reward is: {getEstimatedReward()} MINK</p>
        </div>
        <div className={styles.stakingOptionsContainer}>
          {stakingOptions.map((option) => (
            <div key={option.period} className={styles.stakingOption}>
              <h3>Lock period: {option.period / (24 * 60 * 60)} days</h3>
              <p>APY Rate: {option.apy}%</p>
              <p>Early unstake fee: {option.earlyUnstakeFee ? `${option.earlyUnstakeFee}%` : 'None'}</p>
              <p>Minimum Staking Amount: {option.minAmount} MINK</p>
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