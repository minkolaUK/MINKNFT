import React, { useState, useEffect } from "react";
import { useAddress, useContract, useSDK } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/Liquidity.module.css";
import { DEXContractAddress, tokenContractAddress } from "../../const/contractAddresses";
import { DEXAbi } from '../../const/dexabi';
import { tokenAbi } from '../../const/tokenabi';

const AddLiquidity = () => {
  const address = useAddress();
  const sdk = useSDK();
  const { contract: dexContract } = useContract(DEXContractAddress, DEXAbi);
  const { contract: tokenContract } = useContract(tokenContractAddress, tokenAbi);

  const [amountETC, setAmountETC] = useState<string>("");
  const [amountToken, setAmountToken] = useState<string>("");
  const [maxAmountETC, setMaxAmountETC] = useState<string>("0");
  const [maxAmountToken, setMaxAmountToken] = useState<string>("0");
  const [isAdding, setIsAdding] = useState<boolean>(false);

  useEffect(() => {
    const fetchBalances = async () => {
      if (sdk && address) {
        const etcBalance = await sdk.getProvider().getBalance(address);
        setMaxAmountETC(ethers.utils.formatUnits(etcBalance, 18));

        if (tokenContract) {
          const tokenBalance = await tokenContract.call("balanceOf", [address]);
          setMaxAmountToken(ethers.utils.formatUnits(tokenBalance, 18));
        }
      }
    };

    fetchBalances();
  }, [address, sdk, tokenContract]);

  const handleAddLiquidity = async () => {
    if (!dexContract || !address) {
      toast.error("Contract not loaded");
      return;
    }

    if (isNaN(Number(amountETC)) || Number(amountETC) <= 0) {
      toast.error("Please enter a valid amount of ETC");
      return;
    }

    if (isNaN(Number(amountToken)) || Number(amountToken) <= 0) {
      toast.error("Please enter a valid amount of token");
      return;
    }

    if (Number(amountETC) > Number(maxAmountETC)) {
      toast.error("ETC amount exceeds your balance");
      return;
    }

    if (Number(amountToken) > Number(maxAmountToken)) {
      toast.error("Token amount exceeds your balance");
      return;
    }

    try {
      setIsAdding(true);

      const tx = await dexContract.call("addLiquidity", [ethers.utils.parseUnits(amountToken, 18)], {
        value: ethers.utils.parseUnits(amountETC, 18),
      });
      await tx.wait();

      toast.success("Liquidity added successfully");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={styles.liquidityContainer}>
      <ToastContainer />
      <div className={styles.header}>Add Liquidity</div>

      <div className={styles.liquidityBox}>
        <div className={styles.box}>
          <div className={styles.boxHeader}>
            ETC (Balance: {maxAmountETC} ETC)
          </div>
          <input
            className={styles.input}
            type="number"
            value={amountETC}
            onChange={(e) => setAmountETC(e.target.value)}
            placeholder="Enter ETC amount"
          />
        </div>

        <div className={styles.box}>
          <div className={styles.boxHeader}>
            Token (Balance: {maxAmountToken} Token)
          </div>
          <input
            className={styles.input}
            type="number"
            value={amountToken}
            onChange={(e) => setAmountToken(e.target.value)}
            placeholder="Enter token amount"
          />
        </div>

        <button
          className={styles.addButton}
          onClick={handleAddLiquidity}
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : "Add Liquidity"}
        </button>
      </div>
    </div>
  );
};

export default AddLiquidity;
