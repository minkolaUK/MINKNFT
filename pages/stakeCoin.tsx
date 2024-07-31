import { useState, useEffect } from "react";
import { useContract, useContractWrite, useTokenBalance } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { stakingContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StakeCoin: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<number>(0);

  const { contract: minkStakingContract } = useContract(stakingContractAddress);
  const { contract: tokenContract } = useContract(tokenContractAddress);

  const { data: tokenBalance, isLoading: isTokenBalanceLoading, error: tokenBalanceError } = useTokenBalance(tokenContract, userAddress);
  const { mutate: stake, isLoading: isStakeLoading } = useContractWrite(minkStakingContract, "stake");
  const { mutate: unstake, isLoading: isUnstakeLoading } = useContractWrite(minkStakingContract, "unstake");

  useEffect(() => {
    async function fetchUserAddress() {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
        } else {
          console.error("Ethereum provider not found");
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
      }
    }

    fetchUserAddress();
  }, []);

  useEffect(() => {
    if (tokenBalanceError) {
      console.error("Error fetching token balance:", tokenBalanceError);
    }
  }, [tokenBalanceError]);

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error("Please enter a valid amount");
    if (![90 * 24 * 60 * 60, 180 * 24 * 60 * 60, 365 * 24 * 60 * 60].includes(lockPeriod)) return toast.error("Please select a valid lock period");

    try {
      await stake([ethers.utils.parseUnits(amount, 18), lockPeriod]);
      toast.success("Staked successfully!");
    } catch (error) {
      console.error("Error staking tokens:", error);
      toast.error("Error staking tokens. See console for details.");
    }
  };

  const handleUnstake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error("Please enter a valid amount");

    try {
      await unstake([ethers.utils.parseUnits(amount, 18)]);
      toast.success("Unstaked successfully!");
    } catch (error) {
      console.error("Error unstaking tokens:", error);
      toast.error("Error unstaking tokens. See console for details.");
    }
  };

  const getTokenBalance = () => {
    if (tokenBalance) {
      if (typeof tokenBalance === 'string') {
        return tokenBalance;
      } else if (ethers.BigNumber.isBigNumber(tokenBalance)) {
        return ethers.utils.formatUnits(tokenBalance, 18);
      } else if (tokenBalance.value && ethers.BigNumber.isBigNumber(tokenBalance.value)) {
        return ethers.utils.formatUnits(tokenBalance.value, 18);
      } else {
        console.error("Unexpected token balance format:", tokenBalance);
        return "Error fetching balance";
      }
    }
    return "Error fetching balance";
  };

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div style={styles.container}>
        <h1 style={styles.header}>Stake Your Mink Coin</h1>
        <div style={styles.balanceContainer}>
          <p style={styles.balance}>
            Total Balance: {isTokenBalanceLoading ? "Loading..." : `${getTokenBalance()} Mink`}
          </p>
        </div>
        <div style={styles.inputContainer}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            style={styles.input}
          />
          <select
            value={lockPeriod}
            onChange={(e) => setLockPeriod(Number(e.target.value))}
            style={styles.select}
          >
            <option value={0}>Select lock period</option>
            <option value={90 * 24 * 60 * 60}>3 Months (3%)</option>
            <option value={180 * 24 * 60 * 60}>6 Months (3.5%)</option>
            <option value={365 * 24 * 60 * 60}>12 Months (5%)</option>
          </select>
          <button onClick={handleStake} disabled={isStakeLoading} style={styles.button}>
            {isStakeLoading ? "Staking..." : "Stake"}
          </button>
          <button onClick={handleUnstake} disabled={isUnstakeLoading} style={{ ...styles.button, marginLeft: "10px" }}>
            {isUnstakeLoading ? "Unstaking..." : "Unstake"}
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",  // Slightly lighter and transparent black
    color: "#fff",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
    marginTop: "120px",
  },
  header: {
    fontSize: "2em",
    marginBottom: "20px",
    color: "#fff",
  },
  balanceContainer: {
    marginBottom: "20px",
  },
  balance: {
    fontSize: "1.2em",
    color: "#fff",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "1em",
    borderRadius: "5px",
    border: "1px solid #555",
    marginBottom: "10px",
    color: "#000",
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "300px",
  },
  select: {
    padding: "10px",
    fontSize: "1em",
    borderRadius: "5px",
    border: "1px solid #555",
    marginBottom: "10px",
    backgroundColor: "#fff",
    color: "#000",
    width: "100%",
    maxWidth: "300px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1em",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    transition: "background-color 0.3s",
    marginBottom: "10px",
  },
} as const;

export default StakeCoin;
