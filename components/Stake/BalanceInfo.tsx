import { ethers, BigNumber } from "ethers";
import styles from "../../styles/StakeCoin.module.css";

interface BalanceInfoProps {
  tokenBalance?: string | ethers.BigNumber;
  userStakes?: any[];
}

const BalanceInfo: React.FC<BalanceInfoProps> = ({ tokenBalance, userStakes }) => {
  const formatBalance = (balance: string | ethers.BigNumber) => {
    if (typeof balance === 'string') {
      return parseFloat(balance).toFixed(4);
    } else if (ethers.BigNumber.isBigNumber(balance)) {
      return parseFloat(ethers.utils.formatUnits(balance, 18)).toFixed(4);
    }
    return "Error";
  };

  const getTotalStakedAmount = () => {
    if (!userStakes || userStakes.length === 0) return "0 MINK";
    try {
      let totalStaked = ethers.BigNumber.from(0);
      userStakes.forEach((stake: any) => {
        totalStaked = totalStaked.add(stake.amount);
      });
      return parseFloat(ethers.utils.formatUnits(totalStaked, 18)).toFixed(4) + " MINK";
    } catch (error) {
      console.error("Error calculating total staked amount:", error);
      return "Error";
    }
  };

  return (
    <div className={styles.stakedContainer}>
      <h2>Your Balance</h2>
      <p>{formatBalance(tokenBalance)} MINK</p>
      <h2>Total Staked Amount</h2>
      <p>{getTotalStakedAmount()}</p>
      <h2>Pending Rewards</h2>
      <p>0.0000 MINK</p> {/* Implement pending rewards logic */}
    </div>
  );
};

export default BalanceInfo;
