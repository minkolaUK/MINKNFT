import React, { useEffect, useState } from 'react';
import { useContract, useConnectionStatus, useAddress } from "@thirdweb-dev/react";
import { rewardsabi } from "../const/abi";
import Container from "../components/Container/Container";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import { REWARDSADDRESS, title, description, welcome } from "../const/contractAddresses";
import { ethers } from 'ethers';

export default function Rewards() {
  const { contract } = useContract(REWARDSADDRESS, rewardsabi);
  const currentUserAddress = useAddress();

  console.log("USER: ", currentUserAddress)
  const connectionStatus = useConnectionStatus();
  const [totalTokens, setTotalTokens] = useState<string | null>(null);
  const [totalEtherInRewards, setTotalEtherInRewards] = useState<string | null>(null);
  const [minimumToReward, setMinimumToReward] = useState<string | null>(null);
  const [totalUserClaimed, setTotalUserClaimed] = useState<string | null>(null);
  const [totalClaimable, setTotalClaimable] = useState<string | null>(null); // New state variable
  const [unclaimedRewards, setUnclaimedRewards] = useState<string | null>(null);
  
  const handleClaimRewards = async () => {
    if (contract) {
      try {
        const tx = await contract.call("ClaimAllRewards", [], { from: currentUserAddress });
        console.log("Claim transaction hash:", tx.hash);
        // Optionally, you can add logic to listen for transaction confirmation
      } catch (error) {
        console.error("Error claiming rewards:", error);
      }
    }
  };
  useEffect(() => {
    const fetchContractData = async () => {
      if (contract) {
        try {
          // Fetch total tokens
          const tokens = await contract.call("TotalTokens");
          console.log("Total Tokens:", tokens.toString());
          setTotalTokens(tokens.toString());

          // Fetch total ether in rewards
          const totalEther = await contract.call("TotalEtherInRewards");
          const totalEtherInEth = ethers.utils.formatEther(totalEther);
          console.log("Total Ether in Rewards:", totalEtherInEth);
          setTotalEtherInRewards(totalEtherInEth);

          // Fetch minimum to reward
          const minToReward = await contract.call("MinimumToReward");
          const minToRewardInEth = ethers.utils.formatEther(minToReward);
          console.log("Minimum to Reward:", minToRewardInEth);
          setMinimumToReward(minToRewardInEth);

          // Fetch total user claimed (assuming current user's address is available)
          const userClaimed = await contract.call("UserTotalClaimed", [currentUserAddress]);
          const userClaimedInEth = ethers.utils.formatEther(userClaimed);
          console.log("Total User Claimed:", userClaimedInEth);
          setTotalUserClaimed(userClaimedInEth);

          /*// Fetch total unclaimed rewards for the user
          const unclaimed = await contract.call("GetTotalUnclaimed", []);
          const unclaimedInEth = ethers.utils.formatEther(unclaimed);
          console.log("Unclaimed Rewards:", unclaimedInEth);
          setUnclaimedRewards(unclaimedInEth);*/
          
        } catch (error) {
          console.error("Error fetching contract data:", error);
        }
      }
    };
    fetchContractData();
  }, [contract]);

  useEffect(() => {
    if (totalEtherInRewards !== null && totalUserClaimed !== null) {
      const unclaimedRewardsAmount = ethers.utils.parseEther(totalEtherInRewards).sub(ethers.utils.parseEther(totalUserClaimed));
      const unclaimedRewardsInEth = ethers.utils.formatEther(unclaimedRewardsAmount);
      console.log("Unclaimed Rewards:", unclaimedRewardsInEth);
      setTotalClaimable(unclaimedRewardsInEth);

    }
  }, [totalEtherInRewards, totalUserClaimed]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Container maxWidth="lg">
        <div className={styles.main}>
          {connectionStatus === "connected" ? (
            <>
              {/*<div className={styles.countdown}>
                <h2>Total NFTs: {totalTokens}</h2>
                <h2>Total Ether in Rewards: {totalEtherInRewards}</h2>
                <h2>Minimum to Reward: {minimumToReward}</h2>
                </div>*/}

              <div className={styles.countdown}>
                <h2>Your Total Claimed Rewards: {totalUserClaimed}</h2>
                {/*<h2>Your Total Claimable Reward: {unclaimedRewards}</h2>*/}
                <button className={styles.btn} onClick={handleClaimRewards}>Claim Rewards</button>

              </div>
            </>
          ) : (
            <section className={styles.container}>
              <div>
                <h2 id="welcomeH2">Connect to MetaMask to Get Started</h2>
                <h1 id="welcomeH1">{welcome}</h1>
              </div>
            </section>
          )}
        </div>
      </Container>
    </>
  );
}
