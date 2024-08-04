// components/StakeForm.tsx
import React from 'react';
import styles from '../styles/StakeCoin.module.css';

interface StakeFormProps {
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  lockPeriod: number;
  setLockPeriod: React.Dispatch<React.SetStateAction<number>>;
  stakingOptions: Array<{ period: number; apy: number }>;
  handleStake: () => void;
  handleUnstake: () => void;
  isStakeLoading: boolean;
  isUnstakeLoading: boolean;
  getEstimatedReward: () => string;
}

const StakeForm: React.FC<StakeFormProps> = ({
  amount, setAmount, lockPeriod, setLockPeriod, stakingOptions, handleStake, handleUnstake, isStakeLoading, isUnstakeLoading, getEstimatedReward
}) => (
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
    <div className={styles.rewardCalculator}>
      <h3>Estimated Reward</h3>
      <p>Based on your input, the estimated reward is: {getEstimatedReward()} MINK</p>
    </div>
  </div>
);

export default StakeForm;
