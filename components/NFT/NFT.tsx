import {
  ThirdwebNftMedia,
} from "@thirdweb-dev/react";
import { NFT } from "@thirdweb-dev/sdk";
import React from "react";
import styles from "./NFT.module.css";


type Props = {
  nft: NFT;
  contract: string;
};


export default function NFTComponent({ nft }: Props) {
 
return (
    <>
      <ThirdwebNftMedia metadata={nft.metadata} className={styles.nftImage} />
      
   
      <p className={styles.nftName}>{nft.metadata.name}</p>
      {/*<p className={styles.nftName}>
        Ranking:  {nft?.metadata.ranking as string}
        </p>*/}    </>
  );
}
