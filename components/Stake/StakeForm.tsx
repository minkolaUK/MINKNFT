import React from 'react';
import Link from 'next/link';
import styles from "../../styles/StakeCoin.module.css";

interface StakeFormProps {
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  lockPeriod: number;
  setLockPeriod: React.Dispatch<React.SetStateAction<number>>;
  handleStake: () => Promise<void>;
  handleUnstake: (stakeIndex: number) => Promise<void>;
  isStakeLoading: boolean;
  isUnstakeLoading: boolean;
  estimatedReward: string;
  coinstakingContract: any;
}

const StakeForm: React.FC<StakeFormProps> = ({
  amount,
  setAmount,
  lockPeriod,
  setLockPeriod,
  handleStake,
  handleUnstake,
  isStakeLoading,
  isUnstakeLoading,
  estimatedReward,
  coinstakingContract
}) => {
  return (
    <div className={styles.formContainer}>
      <h2>Enter Amount to stake and select Lock Period</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to stake"
        className={styles.input}
      />
      <select
        value={lockPeriod}
        onChange={(e) => setLockPeriod(Number(e.target.value))}
        className={styles.select}
      >
        <option value={0}>Select Lock Period</option>
        <option value={90 * 24 * 60 * 60}>90 days</option>
        <option value={180 * 24 * 60 * 60}>180 days</option>
        <option value={365 * 24 * 60 * 60}>365 days</option>
      </select>
      <div className={styles.buttonContainer}>
        <button
          onClick={handleStake}
          disabled={isStakeLoading || !coinstakingContract}
          className={styles.button}
        >
          {isStakeLoading ? 'Staking...' : 'Stake'}
        </button>
        <button
          onClick={() => handleUnstake(0)} // Adjust index or pass dynamically
          disabled={isUnstakeLoading || !coinstakingContract}
          className={styles.button}
        >
          {isUnstakeLoading ? 'Unstaking...' : 'Unstake'}
        </button>
      </div>
      <Link href="/transactions" legacyBehavior>
        <a className={styles.viewTransactionsLink}>
          View Transactions
        </a>
      </Link>
      <div className={styles.estimatedRewardContainer}>
        <h3>Estimated Reward</h3>
        <p>{estimatedReward}</p>
      </div>
    </div>
  );
};

export default StakeForm;
