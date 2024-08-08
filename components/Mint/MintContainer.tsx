import { useEffect, useState } from "react";
import { ethers } from "ethers";
import styles from "../../styles/Home.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { tokenContractAddress,NFT_ADDRESS, title, description, welcome, maxSupply, mintPrice, maxPerWallet, currency, currencyName } from "../../const/contractAddresses";
import { useSendTransaction } from "thirdweb/react";
import { claimTo } from "thirdweb/extensions/erc721";
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";

interface MintContainerProps {
  contract: any; // Adjust the type based on your contract
  isLoading: any;
  error: any;
}

const MintContainer: React.FC<MintContainerProps> = ({ contract , isLoading, error}) => {
  const userAddress = useAddress();
  const [quantity] = useState<number>(1); // Always set to 1
  const [totalPrice, setTotalPrice] = useState<number>(parseFloat(mintPrice.toString())); // Calculate the total price for 1 NFT
  const [mintedSuccess, setMintedSuccess] = useState(false);

  const { contract: TokenContract, isLoading: loadingToken, error: TokenError }  = useContract(tokenContractAddress)
  const { mutateAsync: approve, isLoading: loadingApprove } = useContractWrite(TokenContract, "approve")


  useEffect(() => {
    // Set the total price based on the mint price and quantity (which is always 1)
    setTotalPrice(parseFloat((quantity * mintPrice).toFixed(1)));
  }, [quantity]);

  const mint = async () => {
    const mintButton = document.getElementById("mintButton") as HTMLButtonElement | null;

    if (mintButton) {
      mintButton.disabled = true;
      const spinner = '<div class="dot-elastic"></div><span>Waiting for transaction...</span>';
      mintButton.innerHTML = spinner;
    } else {
      console.error("Element with ID 'mintButton' not found");
    }
   
    try {
      const receiver = userAddress;
      const qty = BigInt(quantity);
      const currency = tokenContractAddress; // Native ETC address
      const pricePerToken = ethers.utils.parseEther(mintPrice.toString());
      const allowlistProof = {
        proof: [], // Replace with the actual proof
        quantityLimitPerWallet: BigInt(maxPerWallet), // Ensure this is a BigNumberish type
        pricePerToken: ethers.utils.parseEther(pricePerToken.toString()),
        currency: tokenContractAddress // Native ETC address
      };
      const data = "0x"; // Replace with actual data if needed

      console.log("Try Mint")
        const allowance = await TokenContract?.call("allowance",[userAddress,NFT_ADDRESS]);
        const value = BigInt(mintPrice) * BigInt(10 ** 18);
        
        console.log("Allowance: ", allowance)
        if (allowance < mintPrice){ 
          // Call the `approve` function of the Token Contract
          const data = await approve({ args: [NFT_ADDRESS, value] });
          const call = async () => {
            try {
              const data = await approve({ args: [NFT_ADDRESS, value] });
              console.info("contract call successs", data);
            } catch (err) {
              console.error("contract call failure", err);
            }
          } 
     
        } else {
          console.log("Tokens are already approved.");
        }

      console.log("Try Mint Transaction ");
      const mintTransaction = await contract?.call("claim", [
        receiver,
        qty,
        currency,
        pricePerToken,
        allowlistProof,
        data
      ], {
        value: ethers.utils.parseEther("0"), 
      });

      

      if (mintTransaction) {
        console.log("MINT SUCCESS");
        if (mintButton) {
          mintButton.disabled = false;
          mintButton.innerHTML = "MINT";
        }
        toast.success('MINT SUCCESSFUL!! \n Check Wallet for Mints.', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setMintedSuccess(true);
      } else {
        console.log("Failed to mint!");
        if (mintButton) {
          mintButton.innerText = "Mint";
          mintButton.disabled = false;
        }
      }
    } catch (error: unknown) {
      console.error("Error minting:", error);

      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        const reasonMatch = error.message.match(/Reason: (.+?)(\n|$)/);
        if (reasonMatch) {
          errorMessage = reasonMatch[1];
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        const reasonMatch = error.match(/Reason: (.+?)(\n|$)/);
        if (reasonMatch) {
          errorMessage = reasonMatch[1];
        } else {
          errorMessage = error;
        }
      }

      toast.error(`❌ MINT FAILED!! \n ${errorMessage}`, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      if (mintButton) {
        mintButton.innerText = "Mint";
        mintButton.disabled = false;
      }
    }
  };

  // Token Supply Section
  const [tokenSupply, setTokenSupply] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const fetchTokenSupply = async () => {
    try {
      const totalSupply: string = await contract?.call("totalSupply");
      const formattedSupply = totalSupply.toString();
      setTokenSupply(formattedSupply);

      const mintedTokens = parseInt(totalSupply, 10);
      const totalTokens = maxSupply;
      const percentage = (mintedTokens / totalTokens) * 100;
      setProgressPercentage(percentage);
    } catch (error) {
      console.error('Error fetching token supply:', error);
      setTokenSupply('586'); // Fallback value in case of error
    }
  };

  if (isLoading) {
    console.log("LOADING");
  } else if (contract) {
    fetchTokenSupply();
  } else if (error) {
    console.log("ERROR LOADING CONTRACT");
  }

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
      <div id="mintContainer" className="mintcontainer">
        <h2 id="mint">
          {welcome}
        </h2>
        <div className={styles.infocontainer}>
          <div>
            <h3>Total Supply</h3>
            <div className={styles.infocontainer}><p id="minted">{tokenSupply}</p><p>/</p><p id="totalSupply">{maxSupply}</p></div>
            <div className={styles.progressbar}>
              <div className={styles.progress} style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          <div>
            <h3>Price Per NFT</h3>
            <p id="pricePerMint">{mintPrice} {currencyName}</p>
          </div>
          <div>
            <h3>Max Mint</h3>
            <p id="maxPerMint">1</p>
          </div>
        </div>

        <button
          id="mintButton"
          className={`${styles.herobtn} ${styles.btn} ${styles.mintbtn}`}
          onClick={mint}
        >
          Mint
        </button>
      </div>
    </>
  );
};

export default MintContainer;
