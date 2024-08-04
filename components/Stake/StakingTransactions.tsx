import { ethers } from "ethers";
import styles from "../../styles/StakeCoin.module.css";

interface StakingOption {
  period: number;
  apy: number;
  status?: string; // Add status property
}

interface StakingTransaction {
  amount: ethers.BigNumber; // Use ethers.BigNumber instead of `any`
  startTime: number;
  period: number;
}

interface StakingTransactionsProps {
  userStakes?: StakingTransaction[];
  stakingOptions: StakingOption[];
}

const StakingTransactions: React.FC<StakingTransactionsProps> = ({ userStakes, stakingOptions }) => {
  const calculateTimeStaked = (startTime: number, period: number) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = startTime + period;
    const timeStaked = Math.max(0, Math.min(now, endTime) - startTime);
    const timeRemaining = Math.max(0, endTime - now);

    return {
      timeStaked,
      timeRemaining
    };
  };

  return (
    <div className={styles.stakedContainer}>
      <h2>Your Staking Transactions</h2>
      {userStakes && userStakes.length > 0 ? (
        userStakes.map((stake, index) => {
          const { timeStaked, timeRemaining } = calculateTimeStaked(stake.startTime, stake.period);
          const option = stakingOptions.find(opt => opt.period === stake.period);

          return (
            <div key={index} className={styles.stakingOption}>
              <p>Amount Staked: {stake.amount ? ethers.utils.formatUnits(stake.amount, 18) : "N/A"} MINK</p>
              <p>Lock Period: {option ? option.period / (24 * 60 * 60) : "N/A"} days</p>
              <p>Time Staked: {timeStaked ? Math.floor(timeStaked / (24 * 60 * 60)) : "N/A"} days</p>
              <p>Time Remaining: {timeRemaining ? Math.floor(timeRemaining / (24 * 60 * 60)) : "N/A"} days</p>
              <p>APY: {option ? option.apy : "N/A"}%</p>
              <p>Status: {option ? option.status || "N/A" : "N/A"}</p>
            </div>
          );
        })
      ) : (
        <p>No staking transactions found.</p>
      )}
    </div>
  );
};

export default StakingTransactions;
