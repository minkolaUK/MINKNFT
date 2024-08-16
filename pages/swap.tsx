import React, { useState, useEffect } from "react";
import { useAddress, useContract, useTokenBalance } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/Swap.module.css";
import { etcToMinkSwapContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { etcToMinkSwapAbi } from '../const/swapabi';

const Swap = () => {
  const address = useAddress();
  const { contract: swapContract } = useContract(etcToMinkSwapContractAddress, etcToMinkSwapAbi);

  const { contract: etcTokenContract } = useContract(tokenContractAddress.ETC, "token");
  const { contract: minkTokenContract } = useContract(tokenContractAddress.Mink, "token");

  const { data: etcBalance } = useTokenBalance(etcTokenContract, address);
  const { data: minkBalance } = useTokenBalance(minkTokenContract, address);

  const [fromToken, setFromToken] = useState<string>("ETC");
  const [toToken, setToToken] = useState<string>("Mink");
  const [amount, setAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("0");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [quoteAmount, setQuoteAmount] = useState<string>("0");
  const [isExactInput, setIsExactInput] = useState<boolean>(true); // State to track exact input or output

  useEffect(() => {
    if (fromToken === "ETC" && etcBalance) {
      setMaxAmount(ethers.utils.formatUnits(etcBalance, 18));
    } else if (fromToken === "Mink" && minkBalance) {
      setMaxAmount(ethers.utils.formatUnits(minkBalance, 18));
    }
  }, [fromToken, etcBalance, minkBalance]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!swapContract || !amount) return;
      try {
        const parsedAmount = ethers.utils.parseUnits(amount, 18);
        const quoteResponse = await swapContract.call("getQuote", [
          fromToken === "ETC" ? tokenContractAddress.ETC : tokenContractAddress.Mink,
          toToken === "Mink" ? tokenContractAddress.Mink : tokenContractAddress.ETC,
          parsedAmount
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

      let tx;
      if (fromToken === "ETC") {
        // ETC -> Mink Swap
        if (isExactInput) {
          tx = await swapContract.call("swapExactInputSingle", [
            parsedAmount,
            tokenContractAddress.Mink, // The token we want to receive
            address,
            deadline,
          ]);
        } else {
          tx = await swapContract.call("swapExactOutputSingle", [
            ethers.utils.parseUnits(quoteAmount, 18),
            parsedAmount,
            tokenContractAddress.Mink, // The token we want to receive
            address,
            deadline,
          ]);
        }
      } else {
        // Mink -> ETC Swap
        if (isExactInput) {
          tx = await swapContract.call("swapExactInputSingle", [
            parsedAmount,
            tokenContractAddress.ETC, // The token we want to receive
            address,
            deadline,
          ]);
        } else {
          tx = await swapContract.call("swapExactOutputSingle", [
            ethers.utils.parseUnits(quoteAmount, 18),
            parsedAmount,
            tokenContractAddress.ETC, // The token we want to receive
            address,
            deadline,
          ]);
        }
      }

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

        <div className={styles.arrow}>
          <img src=".\images\x-icon\arrow-dow.jpg" alt="Arrow Down" className={styles.arrowImage} />
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

      <div className={styles.toggle}>
        <label>
          <input
            type="radio"
            value="exactInput"
            checked={isExactInput}
            onChange={() => setIsExactInput(true)}
          />
          Exact Input
        </label>
        <label>
          <input
            type="radio"
            value="exactOutput"
            checked={!isExactInput}
            onChange={() => setIsExactInput(false)}
          />
          Exact Output
        </label>
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
