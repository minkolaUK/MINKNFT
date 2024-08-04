// components/StakingOptions.tsx
import React from 'react';
import styles from '../styles/StakeCoin.module.css';

interface StakingOption {
  period: number;
  apy: number;
  earlyUnstakeFee: number | null;
  minAmount: number;
  maxAmount: string;
  status: string;
}

interface StakingOptionsProps {
  stakingOptions: StakingOption[];
}

const StakingOptions: React.FC<StakingOptionsProps> = ({ stakingOptions }) => (
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
);

export default StakingOptions;
