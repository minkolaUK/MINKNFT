// components/StakedAmount.tsx
import React from 'react';
import styles from '../styles/StakeCoin.module.css';

interface StakedAmountProps {
  totalStaked: string;
  isLoading: boolean;
}

const StakedAmount: React.FC<StakedAmountProps> = ({ totalStaked, isLoading }) => (
  <div className={styles.stakedContainer}>
    <h3>Your Staked Amount</h3>
    <p className={styles.stakedAmount}>{isLoading ? "Loading..." : totalStaked}</p>
  </div>
);

export default StakedAmount;
