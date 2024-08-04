import React from "react";
import { useState } from "react";
import styles from "../../styles/StakeCoin.module.css";
import { toast } from "react-toastify";

interface StakeFormProps {
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  lockPeriod: number;
  setLockPeriod: React.Dispatch<React.SetStateAction<number>>;
  handleStake: () => Promise<void>;
  handleUnstake: (stakeIndex: number) => Promise<void>;
  isStakeLoading: boolean;
  isUnstakeLoading: boolean;
  coinstakingContract?: any;
  userStakes?: any[]; // Add userStakes to the props
}

const StakeForm: React.FC<StakeFormProps> = ({
  amount, setAmount, lockPeriod, setLockPeriod,
  handleStake, handleUnstake, isStakeLoading, isUnstakeLoading,
  coinstakingContract, userStakes
}) => (
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
);

const isUnstakeAllowed = (stakeStartTime: number, stakePeriod: number) => {
  const now = Math.floor(Date.now() / 1000);
  const endTime = stakeStartTime + stakePeriod;
  return now >= endTime;
};

export default StakeForm;
