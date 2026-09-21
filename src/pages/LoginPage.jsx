import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMail,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { MdSportsEsports } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import heroBanner from "../assets/games/hero-banner.png";

import styles from "./LoginPage.module.css";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    /*
      FRONTEND AUTH SESSION

      There is currently no authentication backend in the project,
      so this stores the entered email locally.

      When your real backend/auth API is available, replace this
      section with the API login request and token handling.
    */
    localStorage.setItem(
      "veloopUser",
      JSON.stringify({
        email: normalizedEmail,
        loggedIn: true,
        loggedInAt: new Date().toISOString(),
      }),
    );

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 450);
  };

  return (
    <main className={styles.page}>
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className={styles.background}>
        <img src={heroBanner} alt="" className={styles.backgroundImage} />

        <div className={styles.backgroundOverlay} />

        <motion.div
          className={styles.glowOne}
          animate={{
            x: [0, 35, 0],
            y: [0, -20, 0],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={styles.glowTwo}
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className={styles.particles}>
          {Array.from({ length: 20 }).map((_, index) => (
            <motion.span
              key={index}
              className={styles.particle}
              style={{
                left: `${(index * 19) % 100}%`,
                top: `${8 + ((index * 29) % 84)}%`,
              }}
              animate={{
                y: [-7, 8, -7],
                x: [0, index % 2 ? 6 : -6, 0],
                opacity: [0.1, 0.65, 0.1],
              }}
              transition={{
                duration: 3 + (index % 4),
                delay: index * 0.08,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* =====================================================
          TOP BRAND
      ===================================================== */}

      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.logo}
          onClick={() => navigate("/login")}
          aria-label="VELOOP Games"
        >
          <span className={styles.logoMain}>VELOOP</span>
          <span className={styles.logoSub}>R E W A R D S</span>
        </button>

        <div className={styles.topBadge}>
          <FiShield />
          <span>Secure Game Access</span>
        </div>
      </header>

      {/* =====================================================
          LOGIN
      ===================================================== */}

      <section className={styles.content}>
        <motion.div
          className={styles.loginCard}
          initial={{
            opacity: 0,
            y: 24,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.55,
            ease: [0.2, 0.7, 0.2, 1],
          }}
        >
          {/* ICON */}

          <motion.div
            className={styles.gameIcon}
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.15,
              duration: 0.45,
            }}
          >
            <MdSportsEsports />
          </motion.div>

          {/* HEADING */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
              duration: 0.45,
            }}
          >
            <span className={styles.eyebrow}>WELCOME TO VELOOP GAMES</span>

            <h1>Let&apos;s Play!</h1>

            <p className={styles.subtitle}>
              Sign in with your email to continue playing, earning Game Coins
              and unlocking rewards.
            </p>
          </motion.div>

          {/* FORM */}

          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>

            <div
              className={`${styles.inputWrapper} ${
                error ? styles.inputError : ""
              }`}
            >
              <FiMail />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter your email address"
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                className={styles.errorMessage}
                initial={{
                  opacity: 0,
                  y: -4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className={styles.continueButton}
              disabled={loading}
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Continue with Email</span>
                  <FiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          {/* FEATURES */}

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <FiZap />
              </div>

              <div>
                <strong>Play & Earn</strong>
                <span>Collect Game Coins</span>
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <FiCheckCircle />
              </div>

              <div>
                <strong>Track Progress</strong>
                <span>Keep your game journey</span>
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <FiShield />
              </div>

              <div>
                <strong>Secure</strong>
                <span>Your account stays private</span>
              </div>
            </div>
          </div>

          {/* FOOTNOTE */}

          <p className={styles.terms}>
            By continuing, you agree to use VELOOP Games responsibly and keep
            your account information secure.
          </p>
        </motion.div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className={styles.footer}>
        <span>VELOOP</span>
        <b>•</b>
        <span>Games</span>
        <b>•</b>
        <span>Rewards</span>
      </footer>
    </main>
  );
}

export default LoginPage;
