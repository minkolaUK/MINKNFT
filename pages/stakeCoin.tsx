import React, { useEffect, useState } from "react";
import { useAddress, useContract, useContractRead, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/StakeCoin.module.css";
import { coinstakingContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { coinRewardsAbi } from '../const/coinrewardsabi';
import { tokenAbi } from '../const/tokenabi';

const stakingOptions = [
  { period: 90 * 24 * 60 * 60, apy: 2, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 180 * 24 * 60 * 60, apy: 2.5, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 365 * 24 * 60 * 60, apy: 3, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
];

const StakeCoin = () => {
  const address = useAddress();
  const { contract: coinstakingContract, isLoading: isContractLoading } = useContract(coinstakingContractAddress, coinRewardsAbi);
  const { contract: tokenContract } = useContract(tokenContractAddress, tokenAbi);

  const { data: tokenBalance, isLoading: isTokenBalanceLoading, error: tokenBalanceError } = useTokenBalance(tokenContract, address);
  const { data: userStakes, isLoading: isUserStakesLoading, error: userStakesError } = useContractRead(
    coinstakingContract,
    "getStakedBalance",
    [address]
  );

  const { mutate: stake, isLoading: isStakeLoading } = useContractWrite(coinstakingContract, "stake");
  const { mutate: approveTokens, isLoading: isApproveLoading } = useContractWrite(tokenContract, "approve");

  const [amount, setAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<number>(0);
  const [transactionDetails, setTransactionDetails] = useState<{
    hash?: string;
    amount?: string;
    timestamp?: string;
    blockNumber?: number;
    status?: string;
  }>({});

  const [pendingRewards, setPendingRewards] = useState<string>("0.0000 MINK");
  const [estimatedReward, setEstimatedReward] = useState<string>("0.0000 MINK");
  const [showTransactions, setShowTransactions] = useState<boolean>(false);

  useEffect(() => {
    if (tokenBalanceError) {
      toast.error("Error fetching token balance. Please try again later.");
    }
    if (userStakesError) {
      toast.error("Error fetching staked amount. Please try again later.");
    }
  }, [tokenBalanceError, userStakesError]);

  useEffect(() => {
    if (address && coinstakingContract) {
      const fetchPendingRewards = async () => {
        try {
          const data = await coinstakingContract.call("calculateReward", [address]);
          setPendingRewards(ethers.utils.formatUnits(data, 18));
        } catch (error) {
          console.error("Error fetching pending rewards:", error);
        }
      };

      fetchPendingRewards();
    }
  }, [address, coinstakingContract]);

  useEffect(() => {
    const updateEstimatedReward = () => {
      const selectedOption = stakingOptions.find(option => option.period === lockPeriod);
      if (selectedOption && amount) {
        const reward = calculateReward(amount, selectedOption.apy, lockPeriod / (24 * 60 * 60));
        setEstimatedReward(reward.toFixed(4) + " MINK");
      } else {
        setEstimatedReward("0.0000 MINK");
      }
    };

    updateEstimatedReward();
  }, [amount, lockPeriod]);

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

  const getTotalStakedAmount = () => {
    if (!userStakes) return "0 MINK";
    try {
      return parseFloat(ethers.utils.formatUnits(userStakes, 18)).toFixed(4) + " MINK";
    } catch (error) {
      console.error("Error calculating total staked amount:", error);
      return "Error fetching staked amount";
    }
  };

  const calculateReward = (amount: string, apy: number, days: number) => {
    const daysInYear = 365;
    const interestRate = (apy / 100) * (days / daysInYear);
    return Number(amount) * interestRate;
  };

  const handleApprove = async () => {
    if (!tokenContract) {
      toast.error("Token contract is not loaded");
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount to approve");
    }

    try {
      await approveTokens({ args: [coinstakingContractAddress, ethers.utils.parseUnits(amount, 18)] });
      toast.success("Approval successful");
    } catch (error) {
      console.error("Error approving tokens:", error);
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      toast.error(`Error approving tokens: ${errorMessage}`);
    }
  };

  const handleStake = async () => {
    if (!tokenContract) {
      toast.error("Token contract is not loaded");
      return;
    }

    if (isNaN(lockPeriod) || lockPeriod === 0) return toast.error("Please select a valid lock period");
    if (!amount || isNaN(Number(amount))) return toast.error("Please enter a valid amount");

    try {
      // Check allowance
      const allowance = await tokenContract.call("allowance", [address, coinstakingContractAddress]);
      if (allowance.lt(ethers.utils.parseUnits(amount, 18))) {
        await handleApprove();
      }

      await stake({ args: [ethers.utils.parseUnits(amount, 18)] });
      toast.success("Staked successfully");
      setTransactionDetails({ status: "Success", amount, timestamp: new Date().toLocaleString() });
    } catch (error) {
      console.error("Error staking tokens:", error);
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      toast.error(`Error staking tokens: ${errorMessage}`);
    }
  };

  const handleShowTransactions = () => {
    setShowTransactions(!showTransactions);
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.header}>Stake Mink Coin & Earn Rewards</div>

      {/* Combined Box for Balance, Pending Rewards, and Staked Amount */}
      <div className={styles.stakedContainer}>
        <h2>Your Staked Amount</h2>
        <p>{getTotalStakedAmount()}</p>
        <div className={styles.stakedDetails}>
          <h3>Total Balance</h3>
          <p>{getTokenBalance()} MINK</p>
          <h3>Pending Rewards</h3>
          <p>{pendingRewards} MINK</p>
        </div>
      </div>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to stake"
        />
        <select
          className={styles.select}
          onChange={(e) => setLockPeriod(Number(e.target.value))}
          value={lockPeriod}
        >
          <option value={0}>Select Lock Period</option>
          <option value={90 * 24 * 60 * 60}>90 days</option>
          <option value={180 * 24 * 60 * 60}>180 days</option>
          <option value={365 * 24 * 60 * 60}>365 days</option>
        </select>
        <button className={styles.button} onClick={handleStake} disabled={isStakeLoading || !coinstakingContract}>Stake</button>
        <a href="/transactions" className={styles.button} onClick={handleShowTransactions} style={{ marginTop: '5px' }}>Transactions</a>
      </div>

      {/* Estimated Rewards Section */}
      <div className={styles.estimatedRewardContainer}>
        <h3>Estimated Reward</h3>
        <p>Based on your input, the estimated reward is: {estimatedReward}</p>
      </div>

      <div className={styles.stakingOptionsContainer}>
        {stakingOptions.map((option, index) => (
          <div className={styles.stakingOption} key={index}>
            <h3>Lock Period: {option.period / (24 * 60 * 60)} days</h3>
            <p>APY: {option.apy}%</p>
            <p>Status: {option.status}</p>
          </div>
        ))}
      </div>

      {/* Transaction History Section */}
      {showTransactions && (
        <div className={styles.transactionsContainer}>
          <h2>Transaction History</h2>
          {/* Add your transaction history display logic here */}
          <p>Transaction history content will go here.</p>
        </div>
      )}
    </div>
  );
};

export default StakeCoin;
