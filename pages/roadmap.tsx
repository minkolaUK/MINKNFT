import { useConnectionStatus, useContract } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import Head from "next/head";
import { abi } from "../const/abi";
import { NFT_ADDRESS, title, description } from "../const/contractAddresses";
import Image from "next/image";

const Roadmap: NextPage = () => {
  const { contract, isLoading, error } = useContract(NFT_ADDRESS, abi);
  const connectionStatus = useConnectionStatus();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/x-icon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/x-icon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/x-icon/favicon-16x16.png" />
        <link rel="manifest" href="/images/x-icon/site.webmanifest" />
      </Head>

      <main className={styles.main}>
        {connectionStatus === "connected" ? (
          <ConnectedContent />
        ) : (
          <DisconnectedContent />
        )}
      </main>
    </>
  );
};

const ConnectedContent: React.FC = () => (
  <section className={styles.section}>
    <div className={styles.roadmapContainer}>
      <Image
        src="/images/roadmap.jpg"
        alt="Roadmap"
        width={350}
        height={250}
        className={styles.roadmapImage}
      />
    </div>
    <div className={styles.roadmap}>
      <h1>Mink Coin NFT Road Map</h1>
      <ul>
        <li>Establish Mink Coin social media presence to promote the upcoming MINK NFT Collection starting September 1st 2024</li>
        <li>Launch Mink Coin staking which is a decentralized finance (DeFi) application where users can stake their tokens to earn rewards view their balances, and manage their stakes.</li>
        <li>Launch minting and staking opportunities for Mink NFTs</li>
        <li>Anyone that stakes Mink NFTs will be rewarded in Mink Coin daily; each NFT will earn 4.2069 Mink Coin per day</li>
        <li>Explore collaborations with other ETC projects</li>
      </ul>
    </div>
  </section>
);

const DisconnectedContent: React.FC = () => (
  <section className={styles.container}>
    <div>
      <h2 id="welcomeH2">Connect to MetaMask to Get Started</h2>
      <h1 id="welcomeH1">MINK NFT Collection</h1>
    </div>
  </section>
);

export default Roadmap;
