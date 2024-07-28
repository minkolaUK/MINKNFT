import { useConnectionStatus, useContract } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import Head from "next/head";
import { abi } from "../const/abi"; // Import the contract ABI
import { NFT_ADDRESS, title, description, welcome } from "../const/contractAddresses";
import MintContainer from "../components/Mint/MintContainer"; // Adjust the import path
import Image from "next/image";

const Roadmap: NextPage = () => {

  const { contract, isLoading, error } = useContract(NFT_ADDRESS,abi);
  const connectionStatus = useConnectionStatus();

  return (

    <>
   <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="apple-touch-icon" sizes="180x180" href="images/x-icon/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="images/x-icon/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="images/x-icon/favicon-16x16.png"/>
        <link rel="manifest" href="images/x-icon/site.webmanifest"/>
    </Head>
  

    <section className={styles.main}>
        {connectionStatus === "connected" ? (
          /* Render content when connected */
          <div className={styles.section}>
           <div className={styles.roadmapContainer}>
           <Image src="/images/roadmap.jpg" alt="roadmap" width={500} height={300} className={styles.roadmapImage} /></div>

           <div className={styles.roadmap}>
            <h1>Mink Coin NFT Road Map</h1>
            <ul>
              <li>Establish Mink Coin social media presence to promote the upcoming MINK NFT minting</li>
              <li>Launch staking opportunities starting September 1th 2024</li>
              <li>Set the yield for Mink at 4.2069</li>
              <li>Introduce the live marketplace for buying and selling Mink NFTs</li>  
              <li>Explore collaborations with other ETC projects</li>
           </ul>
           </div>

            
      
          </div>
        ) : (
          /* Render content when not connected */
          <section className={styles.container}>
            <div>
              <h2 id="welcomeH2">Connect to MetaMask to Get Started</h2>
              <h1 id="welcomeH1">MINK NFT Collection</h1>
            </div>
          </section>
        )}
      </section>
    </>
  );
};

export default Roadmap;
