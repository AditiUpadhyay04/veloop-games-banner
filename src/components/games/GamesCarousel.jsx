import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiGift,
  FiUser,
  FiChevronDown,
  FiDollarSign,
  FiLogOut,
  FiX,
  FiMail,
  FiAward,
} from "react-icons/fi";

import { MdSportsEsports } from "react-icons/md";

import { useNavigate } from "react-router-dom";

import games from "../../data/gamesData";
import GameCard from "./GameCard";

import heroBanner from "../../assets/games/hero-banner.png";

import { useGameCoin } from "../../context/GameCoinContext";

import styles from "./GamesCarousel.module.css";


function GamesCarousel() {
  const navigate = useNavigate();

  const { gameCoins } = useGameCoin();

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDetailsOpen, setProfileDetailsOpen] =
    useState(false);


  // =====================================================
  // USER
  // =====================================================

  const getStoredUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("veloopUser")
      );
    } catch {
      return null;
    }
  };

  const user = getStoredUser();

  const userEmail =
    user?.email || "player@veloop.com";

  const displayName =
    userEmail.split("@")[0] || "Player";


  // =====================================================
  // PROFILE
  // =====================================================

  const handleProfileClick = () => {
    setProfileDetailsOpen(
      (prev) => !prev
    );
  };


  // =====================================================
  // REDEEM
  // =====================================================

  const handleRedeemClick = () => {
    setProfileOpen(false);
    setProfileDetailsOpen(false);

    navigate("/redeem");
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleSignOut = () => {
    localStorage.removeItem("veloopUser");

    setProfileOpen(false);
    setProfileDetailsOpen(false);

    navigate("/login", {
      replace: true,
    });
  };


  return (
    <main className={styles.page}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className={styles.header}>

        <div className={styles.headerInner}>

          {/* LOGO */}

          <button
            type="button"
            className={styles.logo}
            onClick={() => navigate("/")}
          >
            <div className={styles.logoMain}>
              VELOOP
            </div>

            <div className={styles.logoSub}>
              R E W A R D S
            </div>
          </button>


          {/* NAVIGATION */}

          <nav className={styles.nav}>

            <button
              type="button"
              className={`${styles.navItem} ${styles.active}`}
              onClick={() => navigate("/")}
            >
              <MdSportsEsports />

              <span>
                Games
              </span>
            </button>


            <button
              type="button"
              className={styles.navItem}
              onClick={() => navigate("/redeem")}
            >
              <FiGift />

              <span>
                Redeem
              </span>
            </button>

          </nav>


          {/* HEADER RIGHT */}

          <div className={styles.headerRight}>

            {/* COINS */}

            <motion.button
              type="button"
              className={styles.coinBalance}
              onClick={() => navigate("/redeem")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >

              <div className={styles.coinIcon}>
                <FiDollarSign />
              </div>

              <div className={styles.coinText}>

                <strong>
                  {gameCoins}
                </strong>

                <span>
                  Game Coins
                </span>

              </div>

            </motion.button>


            {/* PROFILE */}

            <div className={styles.profileWrapper}>

              <button
                type="button"
                className={`${styles.profile} ${
                  profileOpen
                    ? styles.profileActive
                    : ""
                }`}
                onClick={() => {

                  setProfileOpen(
                    (prev) => !prev
                  );

                  if (profileOpen) {
                    setProfileDetailsOpen(false);
                  }

                }}
                aria-expanded={profileOpen}
              >

                <div className={styles.profileAvatar}>
                  <FiUser />
                </div>

                <div className={styles.profileInfo}>

                  <strong>
                    Hey Player!
                  </strong>

                  <span>
                    Good to see you!
                  </span>

                </div>

                <FiChevronDown
                  className={`${styles.profileArrow} ${
                    profileOpen
                      ? styles.profileArrowOpen
                      : ""
                  }`}
                />

              </button>


              {/* =================================================
                  PROFILE DIALOG
              ================================================= */}

              <AnimatePresence>

                {profileOpen && (
                  <>

                    <motion.div
                      className={styles.profileBackdrop}
                      onClick={() => {
                        setProfileOpen(false);
                        setProfileDetailsOpen(false);
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />


                    <motion.div
                      className={styles.profileDialog}
                      initial={{
                        opacity: 0,
                        y: -10,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        scale: 0.97,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    >

                      {/* DIALOG HEADER */}

                      <div className={styles.dialogHeader}>

                        <div className={styles.dialogUser}>

                          <div className={styles.dialogAvatar}>
                            <FiUser />
                          </div>

                          <div>

                            <strong>
                              Hey Player!
                            </strong>

                            <span>
                              {userEmail}
                            </span>

                          </div>

                        </div>


                        <button
                          type="button"
                          className={styles.closeDialog}
                          onClick={() => {
                            setProfileOpen(false);
                            setProfileDetailsOpen(false);
                          }}
                        >
                          <FiX />
                        </button>

                      </div>


                      {/* COINS */}

                      <div className={styles.dialogCoins}>

                        <div className={styles.smallCoin}>
                          <FiDollarSign />
                        </div>

                        <div>

                          <span>
                            YOUR GAME COINS
                          </span>

                          <strong>
                            {gameCoins}
                          </strong>

                        </div>

                        <button
                          type="button"
                          onClick={handleRedeemClick}
                        >
                          Redeem
                        </button>

                      </div>


                      {/* OPTIONS */}

                      <div className={styles.profileOptions}>

                        {/* PROFILE DETAILS */}

                        <button
                          type="button"
                          className={styles.profileOption}
                          onClick={handleProfileClick}
                        >

                          <div
                            className={`${styles.optionIcon} ${styles.profileOptionIcon}`}
                          >
                            <FiUser />
                          </div>

                          <div className={styles.optionText}>

                            <strong>
                              {profileDetailsOpen
                                ? "Hide Profile Details"
                                : "Profile Details"}
                            </strong>

                            <span>
                              {profileDetailsOpen
                                ? "Close your player information"
                                : "View your player information"}
                            </span>

                          </div>

                          <span className={styles.optionArrow}>
                            {profileDetailsOpen
                              ? "↑"
                              : "→"}
                          </span>

                        </button>


                        {/* PROFILE DETAILS */}

                        <AnimatePresence>

                          {profileDetailsOpen && (

                            <motion.div
                              className={styles.profileDetails}
                              initial={{
                                opacity: 0,
                                height: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                              }}
                              exit={{
                                opacity: 0,
                                height: 0,
                              }}
                              transition={{
                                duration: 0.2,
                              }}
                            >

                              <div
                                className={styles.profileDetailRow}
                              >

                                <div
                                  className={styles.detailIcon}
                                >
                                  <FiUser />
                                </div>

                                <div>

                                  <span>
                                    PLAYER
                                  </span>

                                  <strong>
                                    {displayName}
                                  </strong>

                                </div>

                              </div>


                              <div
                                className={styles.profileDetailRow}
                              >

                                <div
                                  className={styles.detailIcon}
                                >
                                  <FiMail />
                                </div>

                                <div>

                                  <span>
                                    EMAIL
                                  </span>

                                  <strong>
                                    {userEmail}
                                  </strong>

                                </div>

                              </div>


                              <div
                                className={styles.profileDetailRow}
                              >

                                <div
                                  className={styles.detailIcon}
                                >
                                  <FiAward />
                                </div>

                                <div>

                                  <span>
                                    GAME COINS
                                  </span>

                                  <strong>
                                    {gameCoins}
                                  </strong>

                                </div>

                              </div>

                            </motion.div>

                          )}

                        </AnimatePresence>


                        {/* REDEEM */}

                        <button
                          type="button"
                          className={styles.profileOption}
                          onClick={handleRedeemClick}
                        >

                          <div
                            className={`${styles.optionIcon} ${styles.redeemOptionIcon}`}
                          >
                            <FiGift />
                          </div>

                          <div className={styles.optionText}>

                            <strong>
                              Redeem Rewards
                            </strong>

                            <span>
                              Use your Game Coins
                            </span>

                          </div>

                          <span className={styles.optionArrow}>
                            →
                          </span>

                        </button>

                      </div>


                      <div
                        className={styles.dialogDivider}
                      />


                      {/* SIGN OUT */}

                      <button
                        type="button"
                        className={styles.signOutButton}
                        onClick={handleSignOut}
                      >

                        <FiLogOut />

                        <span>
                          Sign Out
                        </span>

                      </button>

                    </motion.div>

                  </>
                )}

              </AnimatePresence>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className={styles.hero}>

        <img
          src={heroBanner}
          alt=""
          className={styles.heroImage}
        />

        <div className={styles.heroOverlay} />


        {/* PREMIUM ANIMATION LAYER */}

        <div className={styles.heroGlowOne} />

        <div className={styles.heroGlowTwo} />

        <div className={styles.heroSweep} />


        <div className={styles.particles}>

          {Array.from({
            length: 22,
          }).map((_, index) => (

            <span
              key={index}
              className={styles.particle}
              style={{
                left: `${5 + (index * 17) % 92}%`,
                top: `${8 + (index * 29) % 82}%`,
                animationDelay: `${(index % 7) * 0.6}s`,
                animationDuration: `${5 + (index % 5)}s`,
              }}
            />

          ))}

        </div>


        {/* FLOATING ELEMENTS */}

        <motion.div
          className={`${styles.floatingIcon} ${styles.floatingIconOne}`}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FiDollarSign />
        </motion.div>


        <motion.div
          className={`${styles.floatingIcon} ${styles.floatingIconTwo}`}
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FiGift />
        </motion.div>


        {/* HERO CONTENT */}

        <div className={styles.heroContent}>

          <motion.div
            className={styles.heroPill}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            PLAY <span>•</span> EARN <span>•</span> REDEEM
          </motion.div>


          <motion.h1
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
              duration: 0.6,
            }}
          >
            Games
          </motion.h1>


          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
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


      {/* =====================================================
          GAMES
      ===================================================== */}

      <section className={styles.gamesWrapper}>

        <div className={styles.gamesPanel}>

          <motion.div
            className={styles.gamesHeading}
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.5,
            }}
          >

            <div className={styles.headingLeft}>

              <div className={styles.gameHeadingIcon}>
                <MdSportsEsports />
              </div>

              <div>

                <h2>
                  Games for You
                </h2>

                <p>
                  13 amazing games. Play, earn and redeem!
                </p>

              </div>

            </div>


            <div className={styles.gameCount}>
              13 GAMES
            </div>

          </motion.div>


          <div className={styles.gamesGrid}>

            {games.map((game, index) => (

              <motion.div
                key={game.id}

                initial={{
                  opacity: 0,
                  y: 25,
                  scale: 0.97,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}

                whileHover={{
                  y: -7,
                  scale: 1.015,
                }}

                whileTap={{
                  scale: 0.985,
                }}

                transition={{
                  delay: Math.min(
                    index * 0.04,
                    0.5
                  ),
                  duration: 0.45,
                  ease: [0.2, 0.7, 0.2, 1],
                }}
              >

                <GameCard
                  game={game}
                />

              </motion.div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          BENEFITS
      ===================================================== */}

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

          <span>
            Play More
          </span>

          <strong>
            Earn More!
          </strong>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className={styles.footer}>

        <div className={styles.footerBrand}>

          <strong>
            VELOOP
          </strong>

          <span>
            {" "}REWARDS
          </span>

        </div>


        <div className={styles.footerLinks}>

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Games
          </button>

          <b>•</b>

          <button
            type="button"
            onClick={() => navigate("/redeem")}
          >
            Redeem
          </button>

          <b>•</b>

          <span>
            Repeat
          </span>

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

function Benefit({
  icon,
  title,
  text,
}) {
  return (
    <div className={styles.benefit}>

      <div className={styles.benefitIcon}>
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {text}
        </span>

      </div>

    </div>
  );
}


export default GamesCarousel;