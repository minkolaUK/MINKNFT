import React, { useState, useEffect } from "react";
import { useAddress, useContract, useSDK } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/Swap.module.css";
import { etcToMinkSwapContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { etcToMinkSwapAbi } from '../const/swapabi';
import { tokenAbi } from '../const/tokenabi';

const Swap = () => {
  const address = useAddress();
  const sdk = useSDK();
  const { contract: swapContract } = useContract(etcToMinkSwapContractAddress, etcToMinkSwapAbi);
  const { contract: tokenContract } = useContract(tokenContractAddress, tokenAbi);

  const [fromToken, setFromToken] = useState<string>("ETC");
  const [toToken, setToToken] = useState<string>("Mink");
  const [amount, setAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("0");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [quoteAmount, setQuoteAmount] = useState<string>("0");

  const fetchBalance = async (token: string) => {
    if (!address) return "0";
    try {
      let balance;
      if (token === "ETC" && sdk) {
        balance = await sdk.getProvider().getBalance(address);
      } else if (token === "Mink" && tokenContract) {
        balance = await tokenContract.call("balanceOf", [address]);
      } else {
        return "0";
      }
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "0";
    }
  };

  useEffect(() => {
    const fetchBalances = async () => {
      const balance = await fetchBalance(fromToken);
      setMaxAmount(balance);
    };

    fetchBalances();
  }, [fromToken, address, sdk, tokenContract]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!swapContract || !amount) return;
      try {
        const parsedAmount = ethers.utils.parseUnits(amount, 18);
        // Assuming the swap contract has a method to fetch the quote
        const quoteResponse = await swapContract.call("getQuote", [
          parsedAmount,
          fromToken === "ETC" ? ethers.constants.AddressZero : tokenContractAddress,
          toToken === "ETC" ? ethers.constants.AddressZero : tokenContractAddress
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
      showErrorToast("Please enter a valid amount greater than 0");
      return;
    }

    if (Number(amount) > Number(maxAmount)) {
      showErrorToast("Amount exceeds your balance");
      return;
    }

    if (fromToken === toToken) {
      showErrorToast("Cannot swap the same token type. Please select different tokens.");
      return;
    }

    try {
      setIsSwapping(true);
      const parsedAmount = ethers.utils.parseUnits(amount, 18);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      // Assuming HebeSwap's contract method names are the same
      const method = fromToken === "ETC" ? "swapExactETCForTokens" : "swapExactTokensForETC";
      const route = [
        fromToken === "ETC" ? ethers.constants.AddressZero : tokenContractAddress,
        toToken === "ETC" ? ethers.constants.AddressZero : tokenContractAddress
      ];

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

  const handleFromTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFromToken = e.target.value;
    setFromToken(selectedFromToken);
    setToToken(selectedFromToken === "ETC" ? "Mink" : "ETC");
  };

  return (
    <div className={styles.swapContainer}>
      <ToastContainer />
      <div className={styles.header}>Token Swap</div>

      <div className={styles.swapBox}>
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
            onChange={handleFromTokenChange}
          >
            <option value="ETC">ETC</option>
            <option value="Mink">Mink Coin</option>
          </select>
        </div>

        <div className={styles.arrow}>
          <img src="images/x-icon/arrow-down.jpg" alt="Arrow Down" className={styles.arrowImage} />
        </div>

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
          <div className={styles.tokenDisplay}>
            {toToken}
          </div>
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
