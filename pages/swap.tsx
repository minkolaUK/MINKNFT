import React, { useState, useEffect } from "react";
import { useAddress, useContract } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/Swap.module.css";
import { etcToMinkSwapContractAddress } from "../const/contractAddresses";
import { etcToMinkSwapAbi } from '../const/swapabi';

const Swap = () => {
  const address = useAddress();
  const { contract: swapContract } = useContract(etcToMinkSwapContractAddress, etcToMinkSwapAbi);

  const [fromToken, setFromToken] = useState<string>("ETC");
  const [toToken, setToToken] = useState<string>("Mink");
  const [amount, setAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("0");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [quoteAmount, setQuoteAmount] = useState<string>("0");

  // Function to fetch balances based on token type
  const fetchBalance = async (token: string) => {
    if (!swapContract || !address) return "0";
    try {
      let balance;
      if (token === "ETC") {
        balance = await swapContract.call("getETCBalance", [address]);
      } else if (token === "Mink") {
        balance = await swapContract.call("getMinkBalance", [address]);
      }
      // Format balance based on decimals, assuming 18 decimal places
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "0";
    }
  };

  // Fetch balance whenever fromToken changes
  useEffect(() => {
    const fetchBalances = async () => {
      const balance = await fetchBalance(fromToken);
      setMaxAmount(balance);
    };

    fetchBalances();
  }, [fromToken, address, swapContract]);

  // Fetch quote whenever amount or token changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!swapContract || !amount) return;
      try {
        const parsedAmount = ethers.utils.parseUnits(amount, 18);
        const quoteResponse = await swapContract.call("quote", [
          parsedAmount,
          await swapContract.call("getReserveA"),
          await swapContract.call("getReserveB")
        ]);
        setQuoteAmount(ethers.utils.formatUnits(quoteResponse, 18));
      } catch (error) {
        console.error("Error getting quote:", error);
        toast.error("Error getting quote");
      }
    };

    fetchQuote();
  }, [amount, fromToken, toToken, swapContract]);

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  const handleSwap = async () => {
    if (!swapContract) {
      showErrorToast("Swap contract is not loaded");
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      showErrorToast("Please enter a valid amount");
      return;
    }

    try {
      setIsSwapping(true);
      const parsedAmount = ethers.utils.parseUnits(amount, 18);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const method = fromToken === "ETC" ? "swapExactETCForTokens" : "swapExactTokensForETC"; // Adjust based on token swap direction
      const route = [fromToken === "ETC" ? ethers.constants.AddressZero : etcToMinkSwapContractAddress, 
                     toToken === "ETC" ? ethers.constants.AddressZero : etcToMinkSwapContractAddress];

      const tx = await swapContract.call(method, [
        parsedAmount,
        route,
        address,
        deadline
      ]);

      await tx.wait();
      toast.success("Swap successful");
    } catch (error) {
      console.error("Error swapping tokens:", error);
      showErrorToast(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className={styles.swapContainer}>
      <ToastContainer />
      <div className={styles.header}>Token Swap</div>

      <div className={styles.swapBox}>
        {/* From Token Box */}
        <div className={styles.box}>
          <div className={styles.boxHeader}>
            From: {fromToken} (Balance: {maxAmount} {fromToken})
          </div>
          <input
            className={styles.input}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <button
            className={styles.maxButton}
            onClick={() => setAmount(maxAmount)}
          >
            Max
          </button>
          <select
            className={styles.select}
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
          >
            <option value="ETC">ETC</option>
            <option value="Mink">Mink Coin</option>
          </select>
        </div>

        {/* Arrow Indicator */}
        <div className={styles.arrow}>
          <img src="images\x-icon\arrow-dow.jpg" alt="Arrow Down" className={styles.arrowImage} />
        </div>

        {/* To Token Box */}
        <div className={styles.box}>
          <div className={styles.boxHeader}>
            To: {toToken} (Estimated: {quoteAmount} {toToken})
          </div>
          <input
            className={styles.input}
            type="text"
            value={quoteAmount}
            placeholder="Estimated amount"
            readOnly
          />
          <select
            className={styles.select}
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
          >
            <option value="ETC">ETC</option>
            <option value="Mink">Mink Coin</option>
          </select>
        </div>
      </div>

      <button
        className={styles.swapButton}
        onClick={handleSwap}
        disabled={isSwapping}
      >
        {isSwapping ? "Swapping..." : "Swap"}
      </button>
    </div>
  );
};

export default Swap;
