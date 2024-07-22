import React from 'react';
import styles from '../../styles/Home.module.css'; // Import your CSS module
import Image from 'next/image'; // Import the Image component from next/image
import {NFT_ADDRESS, twitterLink, telegramLink, discordLink} from '../../const/contractAddresses';


const Footer = () => {
  const contract = NFT_ADDRESS;

  return (
    <>
      <footer className={styles.footer}>
        
        <div className={styles.footer2}>
          
          <a className={styles.iconFooter} href={twitterLink} target="_blank" rel="noopener noreferrer">
            <Image src="/images/header/twitter.webp" alt="Twitter"  width={25} height={25}  />
          </a>
          <a className={styles.iconFooter} href={discordLink} target="_blank" rel="noopener noreferrer">
            <Image src="/images/header/discord.webp" alt="Discord"   width={25} height={25}/>
          </a>
        </div>

        <footer className={styles.footer2}>
        <div className={styles.links}>
          <div className={styles.footer1}>
            <p>© 2024 Mink Coin. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </footer>
    </>
  );
};

export default Footer;