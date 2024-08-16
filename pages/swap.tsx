import React, { useState } from "react";
import { useAddress, useContract } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/Swap.module.css"; // Import the updated CSS file
import { etcToMinkSwapContractAddress } from "../const/contractAddresses";
import { etcToMinkSwapAbi } from '../const/swapabi'; // ABI JSON

const Swap = () => {
  const address = useAddress();
  const { contract: swapContract } = useContract(etcToMinkSwapContractAddress, etcToMinkSwapAbi);

  const [amount, setAmount] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  const handleSwap = async () => {
    if (!swapContract) {
      toast.error("Swap contract is not loaded");
      return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount to swap");
      return;
    }

    try {
      setIsSwapping(true);
      const parsedAmount = ethers.utils.parseUnits(amount, 18);

      // Replace with actual swap method and parameters
      const tx = await swapContract.call("swapExactETHForTokens", [
        parsedAmount,
        [ethers.constants.AddressZero, etcToMinkSwapContractAddress], // Example route
        address,
        Math.floor(Date.now() / 1000) + 60 * 20 // Deadline
      ]);
      await tx.wait();

      toast.success("Swap successful");
    } catch (error) {
      console.error("Error swapping tokens:", error);
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      toast.error(`Error swapping tokens: ${errorMessage}`);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className={styles.swapContainer}>
      <ToastContainer />
      <div className={styles.header}>Swap ETC to Mink Coin</div>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount of ETC to swap"
        />
        <button
          className={styles.button}
          onClick={handleSwap}
          disabled={isSwapping}
        >
          {isSwapping ? "Swapping..." : "Swap"}
        </button>
      </div>
    </div>
  );
};

export default Swap;
