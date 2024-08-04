import { useAddress, useContract, useContractRead, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import styles from "../styles/StakeCoin.module.css";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { coinstakingContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { minkrewardsabi } from "../const/minkrewardsabi";

// Define the staking options
const stakingOptions = [
  { period: 90 * 24 * 60 * 60, apy: 2, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 180 * 24 * 60 * 60, apy: 2.5, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 365 * 24 * 60 * 60, apy: 3, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
];

const StakeCoin = () => {
  const address = useAddress();
  const { contract: coinstakingContract } = useContract(coinstakingContractAddress, minkrewardsabi);
  const { contract: tokenContract } = useContract(tokenContractAddress);
  const { data: tokenBalance, isLoading: isTokenBalanceLoading, error: tokenBalanceError } = useTokenBalance(tokenContract, address);
  const { data: userStakes, isLoading: isUserStakesLoading, error: userStakesError } = useContractRead(
    coinstakingContract,
    "getUserStakes",
    [address]
  );

  // Define contract methods
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

  useEffect(() => {
    if (tokenBalanceError) {
      toast.error("Error fetching token balance. Please try again later.");
    }
    if (userStakesError) {
      toast.error("Error fetching staked amount. Please try again later.");
    }
  }, [tokenBalanceError, userStakesError]);

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

  const getEstimatedReward = () => {
    const selectedOption = stakingOptions.find(option => option.period === lockPeriod);
    if (!selectedOption) return "Select a valid lock period";
    const apy = selectedOption.apy;
    return calculateReward(amount, apy, lockPeriod / (24 * 60 * 60)).toFixed(4);
  };

  const handleTransaction = async (transactionFn: () => Promise<any>, successMessage: string) => {
    try {
      const tx = await transactionFn();
      if (tx && tx.hash) {
        const receipt = await tx.wait();
        setTransactionDetails({
          hash: tx.hash,
          amount: amount,
          timestamp: new Date().toLocaleString(),
          blockNumber: receipt.blockNumber,
          status: receipt.status === 1 ? "Success" : "Failed",
        });
        toast.success(successMessage);
      } else {
        toast.error("Please Confirm Transaction");
      }
    } catch (error) {
      console.error("Error processing transaction:", error);
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      toast.error(`Error processing transaction: ${errorMessage}`);
    }
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
      const allowance = await tokenContract?.call("allowance", [address, coinstakingContractAddress]);

      if (ethers.BigNumber.from(allowance).lt(amountInUnits)) {
        const approvalTx = await tokenContract?.call("approve", [coinstakingContractAddress, ethers.constants.MaxUint256]);
        await approvalTx.wait(); // Ensure this is correct based on the library
        toast.success("Approval successful. Proceeding to stake...");
      }

      await handleTransaction(
        async () => stake({ args: [amountInUnits, lockPeriod] }),
        `Staked successfully! Estimated reward: ${getEstimatedReward()} MINK`
      );
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

  const handleUnstake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    try {
      const amountInUnits = ethers.utils.parseUnits(amount, 18);
      await handleTransaction(
        async () => unstake({ args: [amountInUnits] }),
        "Unstaked successfully!"
      );
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
          <h3>Your Staked Amount</h3>
          <p className={styles.stakedAmount}>{isUserStakesLoading ? "Loading..." : getTotalStakedAmount()}</p>
        </div>

        {/* Stake Input */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to stake"
            className={styles.input}
          />
          <select value={lockPeriod} onChange={(e) => setLockPeriod(Number(e.target.value))} className={styles.select}>
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
            <p><strong>Transaction Hash:</strong> <a href={`https://etc-mordor.blockscout.com/tx/${transactionDetails.hash}`} target="_blank" rel="noopener noreferrer">{transactionDetails.hash}</a></p>
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
