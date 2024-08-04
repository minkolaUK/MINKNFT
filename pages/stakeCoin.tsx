import { useAddress, useContract, useContractRead, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { ethers, BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { coinstakingContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { abi } from '../const/coinrewardsabi';
import BalanceInfo from '../components/Stake/BalanceInfo';
import StakeForm from '../components/Stake/StakeForm';
import StakingOptions from '../components/Stake/StakingOptions';
import StakingTransactions from '../components/Stake/StakingTransactions';
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

  const calculateReward = (amount: string, apy: number, days: number): number => {
    const daysInYear = 365;
    const interestRate = (apy / 100) * (days / daysInYear);
    return Number(amount) * interestRate;
  };

  const handleStake = async (): Promise<void> => {
    if (isNaN(lockPeriod) || lockPeriod === 0) {
      toast.error("Please select a valid lock period");
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
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
        tokenBalance={tokenBalance ? tokenBalance.displayValue : undefined} // Use displayValue or undefined
        userStakes={userStakes}
      />
      <StakeForm
        amount={amount}
        setAmount={setAmount}
        lockPeriod={lockPeriod}
        setLockPeriod={setLockPeriod}
        handleStake={handleStake}
        handleUnstake={handleUnstake}
        isStakeLoading={isStakeLoading}
        isUnstakeLoading={isUnstakeLoading}
        coinstakingContract={coinstakingContract}
      />
      <StakingOptions options={stakingOptions} />
      <StakingTransactions userStakes={userStakes} stakingOptions={stakingOptions} />
    </div>
  );
};

export default StakeCoin;
