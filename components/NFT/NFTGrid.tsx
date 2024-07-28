import type { NFT as NFTType } from "@thirdweb-dev/sdk";
import Link from "next/link";
import React from "react";
import Skeleton from "../Skeleton/Skeleton";
import NFT from "./NFT";
import styles from "../../styles/Buy.module.css";

type Props = {
  isLoading: boolean;
  data: NFTType[] | undefined;
  overrideOnclickBehavior?: (nft: NFTType) => void;
  emptyText?: string;
  contract: string,
};

export default function NFTGrid({
  isLoading,
  data,
  overrideOnclickBehavior,
  emptyText = "No NFTs found for this collection.",
  contract
}: Props) {

  // Check if data is not available
  if (isLoading || !data) {
    return (
      <div className={styles.nftGridContainer}>
        {[...Array(20)].map((_, index) => (
          <div key={index} className={styles.nftContainer}>
            <Skeleton key={index} width={"130px"} height="150px" />
          </div>
        ))}
      </div>
    );
  }

  console.log("NFT: ", data);

  // Filter out NFTs without metadata or with id equal to 0
  const filteredData = data.filter(
    (nft) => nft.metadata && nft.metadata.id !== "0"
  );

  // Check if there are NFTs with metadata
  if (filteredData.length === 0) {
    return <p>{emptyText}</p>;
  }

  return (
    <div className={styles.nftGridContainer}>
      {filteredData.map((nft) =>
        !overrideOnclickBehavior ? (
          <Link
            href={`/token/${contract}/${nft.metadata.id}`}
            key={nft.metadata.id}
            className={styles.nftContainer}
          >
            <NFT nft={nft} contract={contract} />
          </Link>
        ) : (
          <div
            key={nft.metadata.id}
            className={styles.nftContainer}
            onClick={() => overrideOnclickBehavior(nft)}
          >
            <NFT nft={nft} contract={contract} />
          </div>
        )
      )}
    </div>
  );
}
