import React, { useEffect, useState } from 'react';
import { useAddress, useContract, useContractRead, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { coinstakingContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { abi } from '../const/coinrewardsabi';
import BalanceInfo from '../components/Stake/BalanceInfo';
import StakeForm from '../components/Stake/StakeForm';
import StakingOptions from '../components/Stake/StakingOptions';
import { useRouter } from 'next/router';
import styles from "../styles/StakeCoin.module.css";

// Define the staking options
const stakingOptions = [
  { period: 90 * 24 * 60 * 60, apy: 2, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 180 * 24 * 60 * 60, apy: 2.5, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
  { period: 365 * 24 * 60 * 60, apy: 3, earlyUnstakeFee: null, minAmount: 0, maxAmount: '∞', status: 'Active' },
];

const StakeCoin = () => {
  const address = useAddress();
  const { contract: coinstakingContract } = useContract(coinstakingContractAddress, abi);
  const { contract: tokenContract } = useContract(tokenContractAddress);

  const { data: tokenBalance, error: tokenBalanceError } = useTokenBalance(tokenContract, address);
  const { data: userStakes, error: userStakesError } = useContractRead(coinstakingContract, "getUserStakes", [address]);

  const { mutate: stake, isLoading: isStakeLoading } = useContractWrite(coinstakingContract, "stake");
  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(coinstakingContract, "unstake");

  const [amount, setAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<number>(0);
  const [estimatedReward, setEstimatedReward] = useState<string>("0.0000 MINK");

  const router = useRouter(); // Initialize the router for navigation

  useEffect(() => {
    if (tokenBalanceError) {
      const message = tokenBalanceError instanceof Error ? tokenBalanceError.message : "Error fetching token balance. Please try again later.";
      toast.error(message);
    }
    if (userStakesError) {
      const message = userStakesError instanceof Error ? userStakesError.message : "Error fetching staked amount. Please try again later.";
      toast.error(message);
    }
  }, [tokenBalanceError, userStakesError]);

  useEffect(() => {
    const getEstimatedReward = () => {
      const selectedOption = stakingOptions.find(option => option.period === lockPeriod);
      if (!selectedOption) {
        setEstimatedReward("Select a valid lock period");
        return;
      }
      const apy = selectedOption.apy;
      const days = lockPeriod / (24 * 60 * 60);
      const reward = calculateReward(amount, apy, days);
      setEstimatedReward(reward.toFixed(4) + " MINK");
    };
    getEstimatedReward();
  }, [amount, lockPeriod]);

  const calculateReward = (amount: string, apy: number, days: number): number => {
    const daysInYear = 365;
    const interestRate = (apy / 100) * (days / daysInYear);
    return Number(amount) * interestRate;
  };

  const handleStake = async (): Promise<void> => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (![90 * 24 * 60 * 60, 180 * 24 * 60 * 60, 365 * 24 * 60 * 60].includes(lockPeriod)) {
      toast.error("Please select a valid lock period");
      return;
    }

    try {
      await stake({ args: [ethers.utils.parseUnits(amount, 18), lockPeriod] });
      toast.success("Staked successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error staking tokens:", error);
      toast.error(`Error staking tokens: ${message}`);
    }
  };

  const handleUnstake = async (stakeIndex: number): Promise<void> => {
    if (isNaN(stakeIndex)) {
      toast.error("Invalid stake index");
      return;
    }

    try {
      await unstake({ args: [stakeIndex, false] });
      toast.success("Unstaked successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error unstaking tokens:", error);
      toast.error(`Error unstaking tokens: ${message}`);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.header}>Stake Mink Coin & Earn Rewards</div>
      <BalanceInfo
        tokenBalance={tokenBalance ? tokenBalance.displayValue : undefined}
        userStakes={userStakes}
      />
      <div className={styles.stakeOptionsContainer}>
        <StakeForm
          amount={amount}
          setAmount={setAmount}
          lockPeriod={lockPeriod}
          setLockPeriod={setLockPeriod}
          handleStake={handleStake}
          handleUnstake={handleUnstake}
          isStakeLoading={isStakeLoading}
          isUnstakeLoading={isUnstakeLoading}
          estimatedReward={estimatedReward}
          coinstakingContract={coinstakingContract}
        />
        <StakingOptions options={stakingOptions} />
      </div>
    </div>
  );
};

export default StakeCoin;
