// components/TokenBalance.tsx
import React from 'react';
import styles from '../styles/StakeCoin.module.css';

interface TokenBalanceProps {
  balance: string;
  isLoading: boolean;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ balance, isLoading }) => (
  <div className={styles.balanceContainer}>
    <p className={styles.balance}>
      Total Balance: {isLoading ? "Loading..." : `${balance} Mink Coin`}
    </p>
  </div>
);

export default TokenBalance;
