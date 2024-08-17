import React, { useState, useEffect } from "react";
import { useAddress, useContract, useSDK } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "/styles/Swap.module.css";
import { DEXContractAddress, tokenContractAddress } from "../const/contractAddresses";
import { DEXAbi } from '../const/dexabi';
import { tokenAbi } from '../const/tokenabi';

const AddRemoveLiquidity = () => {
  const address = useAddress();
  const sdk = useSDK();
  const { contract: swapContract } = useContract(DEXContractAddress, DEXAbi);
  const { contract: tokenContract } = useContract(tokenContractAddress, tokenAbi);

  // Add Liquidity State
  const [addFromToken, setAddFromToken] = useState<string>("ETC");
  const [addAmount, setAddAmount] = useState<string>("");
  const [addMaxAmount, setAddMaxAmount] = useState<string>("0");

  // Remove Liquidity State
  const [removeFromToken, setRemoveFromToken] = useState<string>("ETC");
  const [removeAmount, setRemoveAmount] = useState<string>("");
  const [removeMaxAmount, setRemoveMaxAmount] = useState<string>("0");

  // Fetch balance
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
      const addBalance = await fetchBalance(addFromToken);
      setAddMaxAmount(addBalance);

      const removeBalance = await fetchBalance(removeFromToken);
      setRemoveMaxAmount(removeBalance);
    };

    fetchBalances();
  }, [addFromToken, removeFromToken, address, sdk, tokenContract]);

  // Handle Add Liquidity
  const handleAddLiquidity = async () => {
    if (!swapContract) {
      toast.error("Swap contract is not loaded");
      return;
    }

    if (isNaN(Number(addAmount)) || Number(addAmount) <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (Number(addAmount) > Number(addMaxAmount)) {
      toast.error("Amount exceeds your balance");
      return;
    }

    try {
      const parsedAmount = ethers.utils.parseUnits(addAmount, 18);
      let tx;
      if (addFromToken === "ETC") {
        tx = await swapContract.call("addLiquidityETC", [parsedAmount], { value: parsedAmount });
      } else {
        tx = await swapContract.call("addLiquidityTokens", [parsedAmount]);
      }
      await tx.wait();
      toast.success("Liquidity added successfully");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handle Remove Liquidity
  const handleRemoveLiquidity = async () => {
    if (!swapContract) {
      toast.error("Swap contract is not loaded");
      return;
    }

    if (isNaN(Number(removeAmount)) || Number(removeAmount) <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (Number(removeAmount) > Number(removeMaxAmount)) {
      toast.error("Amount exceeds your balance");
      return;
    }

    try {
      const parsedAmount = ethers.utils.parseUnits(removeAmount, 18);
      let tx;
      if (removeFromToken === "ETC") {
        tx = await swapContract.call("removeLiquidityETC", [parsedAmount]);
      } else {
        tx = await swapContract.call("removeLiquidityTokens", [parsedAmount]);
      }
      await tx.wait();
      toast.success("Liquidity removed successfully");
    } catch (error) {
      console.error("Error removing liquidity:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className={styles.swapContainer}>
      <ToastContainer />
      <div className={styles.header}>Add/Remove Liquidity</div>

      {/* Add Liquidity Section */}
      <div className={styles.box}>
        <div className={styles.boxHeader}>Add Liquidity</div>
        <div>
          <div className={styles.boxHeader}>
            From: {addFromToken} (Balance: {addMaxAmount} {addFromToken})
          </div>
          <input
            className={styles.input}
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <button
            className={styles.maxButton}
            onClick={() => setAddAmount(addMaxAmount)}
          >
            Max
          </button>
          <select
            className={styles.select}
            value={addFromToken}
            onChange={(e) => setAddFromToken(e.target.value)}
          >
            <option value="ETC">ETC</option>
            <option value="Mink">Mink Coin</option>
          </select>
        </div>
        <button
          className={styles.swapButton}
          onClick={handleAddLiquidity}
        >
          Add Liquidity
        </button>
      </div>

      {/* Remove Liquidity Section */}
      <div className={styles.box}>
        <div className={styles.boxHeader}>Remove Liquidity</div>
        <div>
          <div className={styles.boxHeader}>
            From: {removeFromToken} (Balance: {removeMaxAmount} {removeFromToken})
          </div>
          <input
            className={styles.input}
            type="number"
            value={removeAmount}
            onChange={(e) => setRemoveAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <button
            className={styles.maxButton}
            onClick={() => setRemoveAmount(removeMaxAmount)}
          >
            Max
          </button>
          <select
            className={styles.select}
            value={removeFromToken}
            onChange={(e) => setRemoveFromToken(e.target.value)}
          >
            <option value="ETC">ETC</option>
            <option value="Mink">Mink Coin</option>
          </select>
        </div>
        <button
          className={styles.swapButton}
          onClick={handleRemoveLiquidity}
        >
          Remove Liquidity
        </button>
      </div>
    </div>
  );
};

export default AddRemoveLiquidity;
