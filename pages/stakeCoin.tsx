import React, { useEffect, useState } from "react";
import { useAddress, useContract, useContractRead, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/StakeCoin.module.css";
import { coinstakingContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { coinRewardsAbi } from '../const/coinrewardsabi';
import { tokenAbi } from '../const/tokenabi';
import Link from "next/link";

const stakingOptions = [
  { period: 90 * 24 * 60 * 60, apy: 2, minAmount: ethers.utils.parseUnits("1000", 18), maxAmount: "Unlimited", status: 'Active' },
  { period: 180 * 24 * 60 * 60, apy: 2.5, minAmount: ethers.utils.parseUnits("10000", 18), maxAmount: "Unlimited", status: 'Active' },
  { period: 365 * 24 * 60 * 60, apy: 3, minAmount: ethers.utils.parseUnits("1000000", 18), maxAmount: "Unlimited", status: 'Active' },
];

const StakeCoin = () => {
  const address = useAddress();
  const { contract: coinstakingContract } = useContract(coinstakingContractAddress, coinRewardsAbi);
  const { contract: tokenContract } = useContract(tokenContractAddress, tokenAbi);

  const { data: tokenBalance, error: tokenBalanceError } = useTokenBalance(tokenContract, address);
  const { data: userStakes, error: userStakesError } = useContractRead(
    coinstakingContract,
    "getStakedBalance",
    [address]
  );

  const { mutate: stake, isLoading: isStakeLoading } = useContractWrite(coinstakingContract, "stake");
  const { mutate: approveTokens, isLoading: isApproveLoading } = useContractWrite(tokenContract, "approve");

  const [amount, setAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<number>(0);
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

    const parsedAmount = ethers.utils.parseUnits(amount, 18);

    // Define specific minimum amounts for each lock period
    const minAmount90Days = ethers.utils.parseUnits("1000", 18);
    const minAmount180Days = ethers.utils.parseUnits("10000", 18);
    const minAmount365Days = ethers.utils.parseUnits("1000000", 18);

    // Determine the minimum amount required based on the selected lock period
    let requiredMinAmount;
    if (lockPeriod === 90 * 24 * 60 * 60) {
      requiredMinAmount = minAmount90Days;
    } else if (lockPeriod === 180 * 24 * 60 * 60) {
      requiredMinAmount = minAmount180Days;
    } else if (lockPeriod === 365 * 24 * 60 * 60) {
      requiredMinAmount = minAmount365Days;
    }

    // Check if the amount meets the minimum requirement for the selected option
    if (requiredMinAmount && parsedAmount.lt(requiredMinAmount)) {
      return toast.error(`The minimum staking amount for ${lockPeriod / (24 * 60 * 60)} days is ${ethers.utils.formatUnits(requiredMinAmount, 18)} MINK.`);
    }

    try {
      // Check allowance
      const allowance = await tokenContract.call("allowance", [address, coinstakingContractAddress]);
      if (allowance.lt(parsedAmount)) {
        await handleApprove();
      }
      await stake({ args: [parsedAmount, lockPeriod] });
      toast.success("Staked successfully");
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

  const calculateTimeStaked = (startTime: number, period: number) => {
    const now = Math.floor(Date.now() / 1000);
    const timeStaked = now - startTime;
    const timeRemaining = startTime + period - now;
    return { timeStaked, timeRemaining };
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.header}>Stake Mink Coin & Earn Rewards</div>

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
          {stakingOptions.map((option, index) => (
            <option key={index} value={option.period}>
              {option.period / (24 * 60 * 60)} days - Minimum {ethers.utils.formatUnits(option.minAmount, 18)} MINK
            </option>
          ))}
        </select>
        <button className={styles.button} onClick={handleStake} disabled={isStakeLoading || !coinstakingContract}>
          Stake
        </button>
        <Link href="/transactions" legacyBehavior>
          <a className={styles.viewTransactionsLink} onClick={handleShowTransactions}>
            {showTransactions ? "Hide Transactions" : "View Transactions"}
          </a>
        </Link>
      </div>

      {showTransactions && (
        <div className={styles.transactionsContainer}>
          <h2>Transaction History</h2>
          <p>Transaction history content will go here.</p>
        </div>
      )}

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
            <p>Min: {ethers.utils.formatUnits(option.minAmount, 18)}</p>
            <p>Max: {option.maxAmount}</p>
          </div>
        ))}
      </div>

      {userStakes && userStakes.length > 0 && (
        <div className={styles.stakedContainer}>
          <h2>Staking Details</h2>
          {userStakes.map((stake: any, index: number) => {
            const { timeStaked, timeRemaining } = calculateTimeStaked(stake.startTime, stake.period);
            const option = stakingOptions.find(opt => opt.period === stake.period);

            return (
              <div key={index} className={styles.stakingOption}>
                <p>Amount Staked: {stake.amount ? ethers.utils.formatUnits(stake.amount, 18) : "N/A"} MINK</p>
                <p>Lock Period: {option ? option.period / (24 * 60 * 60) : "N/A"} days</p>
                <p>Time Staked: {timeStaked ? Math.floor(timeStaked / (24 * 60 * 60)) : "N/A"} days</p>
                <p>Time Remaining: {timeRemaining ? Math.floor(timeRemaining / (24 * 60 * 60)) : "N/A"} days</p>
                <p>APY: {option ? option.apy : "N/A"}%</p>
                <p>Status: {option ? option.status : "N/A"}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StakeCoin;
