import { motion } from "framer-motion";
import {
  FiGift,
  FiUser,
  FiChevronDown,
  FiDollarSign,
} from "react-icons/fi";
import { MdSportsEsports } from "react-icons/md";

import games from "../../data/gamesData";
import GameCard from "./GameCard";

import heroBanner from "../../assets/games/hero-banner.png";
import styles from "./GamesCarousel.module.css";

function GamesCarousel() {
  return (
    <main className={styles.page}>

      {/* ================= HEADER ================= */}
      <header className={styles.header}>
        <div className={styles.headerInner}>

          {/* LOGO */}
          <div className={styles.logo}>
            <div className={styles.logoMain}>VELOOP</div>
            <div className={styles.logoSub}>
              R E W A R D S
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className={styles.nav}>
            <button
              type="button"
              className={`${styles.navItem} ${styles.active}`}
            >
              <MdSportsEsports />
              <span>Games</span>
            </button>

            <button
              type="button"
              className={styles.navItem}
            >
              <FiGift />
              <span>Redeem</span>
            </button>
          </nav>

          {/* HEADER RIGHT */}
          <div className={styles.headerRight}>

            {/* GAME COINS */}
            <div className={styles.coinBalance}>
              <div className={styles.coinIcon}>
                <FiDollarSign />
              </div>

              <div>
                <strong>100</strong>
                <span>Game Coins</span>
              </div>
            </div>

            {/* PROFILE */}
            <div className={styles.profile}>
              <div className={styles.profileAvatar}>
                <FiUser />
              </div>

              <div className={styles.profileInfo}>
                <strong>Hey Player!</strong>
                <span>Good to see you!</span>
              </div>

              <FiChevronDown className={styles.profileArrow} />
            </div>

          </div>
        </div>
      </header>


      {/* ================= HERO ================= */}
      <section className={styles.hero}>

        <img
          src={heroBanner}
          alt=""
          className={styles.heroImage}
        />

        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>

          <motion.div
            className={styles.heroPill}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            PLAY <span>•</span> EARN <span>•</span> REDEEM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.6,
            }}
          >
            Games
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
            }}
          >
            Explore exciting games, complete challenges,
            <br />
            and earn amazing rewards.
          </motion.p>

        </div>
      </section>


      {/* ================= GAMES ================= */}
      <section className={styles.gamesWrapper}>

        <div className={styles.gamesPanel}>

          <div className={styles.gamesHeading}>

            <div className={styles.headingLeft}>

              <div className={styles.gameHeadingIcon}>
                <MdSportsEsports />
              </div>

              <div>
                <h2>Games for You</h2>
                <p>
                  13 amazing games. Play, earn and redeem!
                </p>
              </div>

            </div>

            <div className={styles.gameCount}>
              13 GAMES
            </div>

          </div>


          {/* ================= 13 GAME GRID ================= */}
          <div className={styles.gamesGrid}>

            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: Math.min(index * 0.04, 0.5),
                  duration: 0.45,
                  ease: [0.2, 0.7, 0.2, 1],
                }}
              >
                <GameCard game={game} />
              </motion.div>
            ))}

          </div>

        </div>
      </section>


      {/* ================= BENEFITS ================= */}
      <section className={styles.benefits}>

        <Benefit
          icon={<MdSportsEsports />}
          title="Exciting Games"
          text="for Every Skill"
        />

        <div className={styles.divider} />

        <Benefit
          icon={<FiDollarSign />}
          title="Earn Game Coins"
          text="as You Play"
        />

        <div className={styles.divider} />

        <Benefit
          icon={<FiGift />}
          title="Redeem Real"
          text="Rewards"
        />

        <div className={styles.rewardMessage}>
          <span>Play More</span>
          <strong>Earn More!</strong>
        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>

        <div className={styles.footerBrand}>
          <strong>VELOOP</strong>
          <span> REWARDS</span>
        </div>

        <div className={styles.footerLinks}>
          <span>Games</span>
          <b>•</b>
          <span>Redeem</span>
          <b>•</b>
          <span>Repeat</span>
        </div>

        <div className={styles.footerMessage}>
          Good Games. Greater Rewards.
        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   BENEFIT COMPONENT
========================================================= */

function Benefit({ icon, title, text }) {
  return (
    <div className={styles.benefit}>

      <div className={styles.benefitIcon}>
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

    </div>
  );
}

export default GamesCarousel;