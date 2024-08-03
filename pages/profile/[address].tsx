import {
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useOwnedNFTs,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Container from "../../components/Container/Container";
import NFTGrid from "../../components/NFT/NFTGrid";
import styles from "../../styles/Profile.module.css";
import { NFT as NFTType } from "@thirdweb-dev/sdk";   
import tokenPageStyles from "../../styles/Token.module.css";
import { Flex, SimpleGrid, Text } from "@chakra-ui/react";
import {
  NFT_ADDRESS, projectNfts
} from "../../const/contractAddresses";

// Function to fetch ranking from rarity.json
const fetchRarityRanking = async (tokenId: string) => {
  const response = await fetch('/rarity.json'); // Adjust the path as needed
  const data = await response.json();

  const nftData = data.find((nft: { id: string; }) => nft.id === tokenId);
  console.log("Data: ", nftData)
  return nftData ? nftData.rank : null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [selectedNft, setSelectedNft] = useState<NFTType>();
  const currentUserAddress = useAddress();
  const { contract: nftCollection } = useContract(NFT_ADDRESS);
  const { data: ownedNfts, isLoading: loadingOwnedNfts } = useOwnedNFTs(
    nftCollection,
    router.query.address as string
  );
  const totalOwned = ownedNfts?.length;
  const [transferAddress, setTransferAddress] = useState("");

  const [ranking, setRanking] = useState<number | null>(null);

  useEffect(() => {
    const getRanking = async () => {
      if (selectedNft) {
        const ranking = await fetchRarityRanking(selectedNft.metadata.id);
        setRanking(ranking);
      }
    };
    getRanking();
  }, [selectedNft]);

  console.log("NFT: ", selectedNft)

  const handleTransfer = async () => {
    try {
      if (selectedNft) {
        const tokenId = selectedNft.metadata.id;
        const recipient = transferAddress;
        await nftCollection?.call("safeTransferFrom", [currentUserAddress, recipient, tokenId], {});
      } else {
        console.error("No NFT selected for transfer");
      }
    } catch (error) {
      console.error("Error transferring NFT:", error);
    }
  };

  return (
    <Container maxWidth="lg">
      <div className={styles.activeTabContent}>
        <div className={styles.data}>
          <h3>Your {projectNfts}</h3>
          <h3>Total Owned = {totalOwned}</h3>
        </div>
        <div>
          {!selectedNft ? (
            <NFTGrid
              data={ownedNfts}
              isLoading={loadingOwnedNfts}
              contract={NFT_ADDRESS as string}
              overrideOnclickBehavior={(nft) => {
                setSelectedNft(nft);
              }}
              emptyText={`Looks like you don't own any Mink NFTs in the collection. Head to the stake nft page to buy some!`}
            />
          ) : null}
        </div>

        {/* Render the detailed NFT information outside of the loop */}
        {selectedNft && (
          <div className={tokenPageStyles.container} style={{ marginTop: 0 }}>
            <div className={tokenPageStyles.metadataContainer}>
              <div className={tokenPageStyles.imageContainer}>
                <ThirdwebNftMedia
                  metadata={selectedNft.metadata}
                  className={tokenPageStyles.image}
                />
                <button
                  onClick={() => {
                    setSelectedNft(undefined);
                  }}
                  className={tokenPageStyles.crossButton}
                >
                  X
                </button>
              </div>
            </div>

            <div className={tokenPageStyles.listingContainer}>
              <h1 className={tokenPageStyles.title}>
                {selectedNft.metadata.name}
              </h1>
              {/* Removed Ranking Display */}
              {/* 
              <p className={tokenPageStyles.collectionName}>
                Ranking: {ranking !== null ? ranking : 'Loading...'}
              </p>
              */}
              {/* Removed Mink NFT Data heading */}
              {/* 
              <h3 className={styles.descriptionTitle}>Mink NFT Data:</h3>
              */}
              <SimpleGrid columns={2} spacing={4}>
                {(selectedNft?.metadata?.attributes as { trait_type: string; value: string }[] || []).map(
                  (attribute, index) => (
                    <Flex
                      key={index}
                      direction="column"
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor="#333333"
                      borderColor="#AAAAAA"
                      borderStyle="solid"
                      margin="5px"
                      borderWidth="1"
                      p="10px"
                      borderRadius="4px"
                    >
                      <Text fontSize="large" fontWeight="bold" align="center" margin="1px">
                        {attribute.trait_type}
                      </Text>
                      <Text fontSize="12px" align="center">
                        {attribute.value}
                      </Text>
                    </Flex>
                  )
                )}
              </SimpleGrid>
              <form className={styles.transferLabel}>
                <label>
                  Transfer:&nbsp;
                  <input
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                  />
                </label>
                <button className={styles.btn} type="button" onClick={handleTransfer}>
                  Send It
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
