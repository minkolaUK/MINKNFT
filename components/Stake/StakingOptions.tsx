import styles from "../../styles/StakeCoin.module.css";

interface StakingOption {
  period: number;
  apy: number;
  earlyUnstakeFee: number | null;
  minAmount: number;
  maxAmount: string;
  status: string;
}

interface StakingOptionsProps {
  options: StakingOption[];
}

const StakingOptions: React.FC<StakingOptionsProps> = ({ options }) => (
  <div className={styles.stakingOptionsContainer}>
    {options.map((option, index) => (
      <div className={styles.stakingOption} key={index}>
        <h3>Lock Period: {option.period / (24 * 60 * 60)} days</h3>
        <p>APY: {option.apy}%</p>
        <p>Status: {option.status}</p>
      </div>
    ))}
  </div>
);

export default StakingOptions;
