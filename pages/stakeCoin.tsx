import { useAddress, useContract, useContractRead, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import styles from "../styles/StakeCoin.module.css";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { coinstakingContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { abi } from '../const/minkrewardsabi'

// Define the staking options
const stakingOptions = [
  { period: 90 * 24 * 60 * 60, apy: 2, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 180 * 24 * 60 * 60, apy: 2.5, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 365 * 24 * 60 * 60, apy: 3, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
];

const StakeCoin = () => {
  const address = useAddress();
  const { contract: coinstakingContract, isLoading: isContractLoading } = useContract(coinstakingContractAddress, abi);
  const { contract: tokenContract } = useContract(tokenContractAddress);
  const { data: tokenBalance, isLoading: isTokenBalanceLoading, error: tokenBalanceError } = useTokenBalance(tokenContract, address);
  const { data: userStakes, isLoading: isUserStakesLoading, error: userStakesError } = useContractRead(
    coinstakingContract,
    "getUserStakes",
    [address]
  );

  const { mutate: stake, isLoading: isStakeLoading } = useContractWrite(coinstakingContract, "stake");
  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(coinstakingContract, "unstake");

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
          const data = await coinstakingContract.call("pendingRewards", [address]);
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
    if (!userStakes || userStakes.length === 0) return "0 MINK";
    try {
      let totalStaked = BigNumber.from(0);
      userStakes.forEach((stake: any) => {
        totalStaked = totalStaked.add(stake.amount);
      });
      return parseFloat(ethers.utils.formatUnits(totalStaked, 18)).toFixed(4) + " MINK";
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

  const handleStake = async () => {
    if (isNaN(lockPeriod) || lockPeriod === 0) return toast.error("Please select a valid lock period");
    if (!amount || isNaN(Number(amount))) return toast.error("Please enter a valid amount");

    try {
      await stake({ args: [ethers.utils.parseUnits(amount, 18), lockPeriod] });
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

  const handleUnstake = async (stakeIndex: number) => {
    if (isNaN(stakeIndex)) return toast.error("Invalid stake index");

    try {
      await unstake({ args: [stakeIndex, false] });
      toast.success("Unstaked successfully");
      setTransactionDetails({ status: "Success", amount: getTotalStakedAmount(), timestamp: new Date().toLocaleString() });
    } catch (error) {
      console.error("Error unstaking tokens:", error);
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      toast.error(`Error unstaking tokens: ${errorMessage}`);
    }
  };

  const calculateTimeStaked = (startTime: number, period: number) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = startTime + period;
    const timeStaked = Math.max(0, Math.min(now, endTime) - startTime);
    const timeRemaining = Math.max(0, endTime - now);

    return {
      timeStaked,
      timeRemaining
    };
  };

  const isUnstakeAllowed = (stakeStartTime: number, stakePeriod: number) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = stakeStartTime + stakePeriod;
    return now >= endTime;
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
        <button
          className={styles.button}
          onClick={() => {
            if (userStakes && userStakes.length > 0) {
              const stake = userStakes[0]; // Example: unstaking the first stake
              if (isUnstakeAllowed(stake.startTime, stake.period)) {
                handleUnstake(0); // Use appropriate index
              } else {
                toast.error("Unstaking is not allowed yet.");
              }
            }
          }}
          disabled={isUnstakeLoading || !coinstakingContract}
        >
          Unstake
        </button>
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

      {/* Display staking details if available */}
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
