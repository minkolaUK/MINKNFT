import React, { useState, useEffect } from "react";
import { useAddress, useContract, useSDK } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/Liquidity.module.css";
import { DEXContractAddress } from "../../const/contractAddresses";
import { DEXAbi } from '../../const/dexabi';

const RemoveLiquidity = () => {
  const address = useAddress();
  const sdk = useSDK();
  const { contract: dexContract } = useContract(DEXContractAddress, DEXAbi);

  const [liquidityAmount, setLiquidityAmount] = useState<string>("");
  const [maxLiquidityAmount, setMaxLiquidityAmount] = useState<string>("0");
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  useEffect(() => {
    const fetchLiquidity = async () => {
      if (dexContract && address) {
        try {
          // Assuming you have a method to get user liquidity
          const liquidity = await dexContract.call("getUserLiquidity", [address]);
          setMaxLiquidityAmount(ethers.utils.formatUnits(liquidity, 18));
        } catch (error) {
          console.error("Error fetching liquidity:", error);
        }
      }
    };

    fetchLiquidity();
  }, [address, dexContract]);

  const handleRemoveLiquidity = async () => {
    if (!dexContract || !address) {
      toast.error("Contract not loaded");
      return;
    }

    if (isNaN(Number(liquidityAmount)) || Number(liquidityAmount) <= 0) {
      toast.error("Please enter a valid amount of liquidity");
      return;
    }

    if (Number(liquidityAmount) > Number(maxLiquidityAmount)) {
      toast.error("Liquidity amount exceeds your balance");
      return;
    }

    try {
      setIsRemoving(true);

      const tx = await dexContract.call("removeLiquidity", [ethers.utils.parseUnits(liquidityAmount, 18)]);
      await tx.wait();

      toast.success("Liquidity removed successfully");
    } catch (error) {
      console.error("Error removing liquidity:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={styles.liquidityContainer}>
      <ToastContainer />
      <div className={styles.header}>Remove Liquidity</div>

      <div className={styles.liquidityBox}>
        <div className={styles.box}>
          <div className={styles.boxHeader}>
            Liquidity (Available: {maxLiquidityAmount})
          </div>
          <input
            className={styles.input}
            type="number"
            value={liquidityAmount}
            onChange={(e) => setLiquidityAmount(e.target.value)}
            placeholder="Enter liquidity amount"
          />
        </div>

        <button
          className={styles.removeButton}
          onClick={handleRemoveLiquidity}
          disabled={isRemoving}
        >
          {isRemoving ? "Removing..." : "Remove Liquidity"}
        </button>
      </div>
    </div>
  );
};

export default RemoveLiquidity;
