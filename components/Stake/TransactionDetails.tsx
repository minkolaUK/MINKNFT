// components/TransactionDetails.tsx
import React from 'react';
import styles from '../styles/StakeCoin.module.css';

interface TransactionDetailsProps {
  details: {
    hash?: string;
    amount?: string;
    timestamp?: string;
    blockNumber?: number;
    status?: string;
  };
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ details }) => (
  details.hash ? (
    <div className={styles.transactionDetails}>
      <h3>Transaction Details</h3>
      <p><strong>Transaction Hash:</strong> <a href={`https://etc-mordor.blockscout.com/tx/${details.hash}`} target="_blank" rel="noopener noreferrer">{details.hash}</a></p>
      <p><strong>Amount Staked:</strong> {details.amount} MINK</p>
      <p><strong>Timestamp:</strong> {details.timestamp}</p>
      <p><strong>Block Number:</strong> {details.blockNumber}</p>
      <p><strong>Status:</strong> {details.status}</p>
    </div>
  ) : null
);

export default TransactionDetails;
