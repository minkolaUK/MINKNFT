import { ConnectWallet, useAddress, useContract, useContractWrite, useTokenBalance, useContractRead } from "@thirdweb-dev/react";
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

  // New state and contract read for staked amount
  const { data: stakedAmount, refetch: fetchStakedAmount, isLoading: isStakedAmountLoading, error: stakedAmountError } = useContractRead(coinstakingContract, "stakedAmount", [address]);

  const [amount, setAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<number>(0);
  const [transactionDetails, setTransactionDetails] = useState<{
    hash?: string;
    amount?: string;
    timestamp?: string;
    blockNumber?: number;
    status?: string;
  }>({});

  useEffect(() => {
    if (tokenBalanceError) {
      toast.error("Error fetching token balance. Please try again later.");
    }
    if (stakedAmountError) {
      toast.error("Error fetching staked amount. Please try again later.");
    }
  }, [tokenBalanceError, stakedAmountError]);

  useEffect(() => {
    // Fetch staked amount when address changes
    if (address) {
      fetchStakedAmount();
    }
  }, [address, fetchStakedAmount]);

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

  const getStakedAmount = () => {
    if (!stakedAmount) return "0 MINK";
    try {
      return parseFloat(ethers.utils.formatUnits(stakedAmount, 18)).toFixed(4) + " MINK";
    } catch (error) {
      console.error("Error processing staked amount:", error);
      return "Error fetching staked amount";
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
      const amountInUnits = ethers.utils.parseUnits(amount, 18);
      
      // Check for approval first
      const isApproved = await tokenContract?.call("allowance", [address, coinstakingContractAddress]);
      if (ethers.BigNumber.from(isApproved).lt(amountInUnits)) {
        // Request approval if not sufficient
        const approvalTx = await tokenContract?.call("approve", [coinstakingContractAddress, amountInUnits]);
        await approvalTx.wait();
        toast.success("Approval successful. Proceeding to stake...");
      }

      // Proceed to stake
      const stakeTx = await stake({
        args: [amountInUnits, lockPeriod],
      });

      // Wait for the transaction to be mined
      const receipt = await stakeTx.wait();

      // Set transaction details
      setTransactionDetails({
        hash: stakeTx.hash,
        amount: amount,
        timestamp: new Date(receipt.timestamp * 1000).toLocaleString(),
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? "Success" : "Failed",
      });

      toast.success(`Staked successfully! Estimated reward: ${getEstimatedReward()} MINK`);
      fetchStakedAmount(); // Update staked amount display
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
      console.log("Attempting to unstake:", amount);
      const amountInUnits = ethers.utils.parseUnits(amount, 18);

      // Ensure the unstake function is called correctly
      const unstakeTx = await unstake({
        args: [amountInUnits],
      });

      // Wait for the transaction to be mined
      const receipt = await unstakeTx.wait();

      // Set transaction details
      setTransactionDetails({
        hash: unstakeTx.hash,
        amount: amount,
        timestamp: new Date(receipt.timestamp * 1000).toLocaleString(),
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? "Success" : "Failed",
      });

      toast.success("Unstaked successfully!");
      console.log("Unstake successful for amount:", amount);
      fetchStakedAmount(); // Update staked amount display
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
        
        {/* Display Balance at the Top */}
        <div className={styles.balanceContainer}>
          <p className={styles.balance}>
            Total Balance: {isTokenBalanceLoading ? "Loading..." : `${getTokenBalance()} Mink Coin`}
          </p>
        </div>

        {/* Display Staked Amount */}
        <div className={styles.stakedContainer}>
          <h3>Staked Amount</h3>
          <p>{isStakedAmountLoading ? "Loading..." : getStakedAmount()}</p>
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

        {/* Reward Calculator */}
        <div className={styles.rewardCalculator}>
          <h3>Estimated Reward</h3>
          <p>Based on your input, the estimated reward is: {getEstimatedReward()} MINK</p>
        </div>

        {/* Staking Options */}
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

        {/* Display Transaction Details */}
        {transactionDetails.hash && (
          <div className={styles.transactionDetails}>
            <h3>Transaction Details</h3>
            <p><strong>Transaction Hash:</strong> <a href={`https://testnet.etherscan.io/tx/${transactionDetails.hash}`} target="_blank" rel="noopener noreferrer">{transactionDetails.hash}</a></p>
            <p><strong>Amount Staked:</strong> {transactionDetails.amount} MINK</p>
            <p><strong>Timestamp:</strong> {transactionDetails.timestamp}</p>
            <p><strong>Block Number:</strong> {transactionDetails.blockNumber}</p>
            <p><strong>Status:</strong> {transactionDetails.status}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default StakeCoin;
