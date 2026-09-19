import styles from "./CardThemePreview.module.css";

const games = [
  {
    id: 1,
    name: "Merge Master",
    image: "/src/assets/games/10.jpeg",
    type: "PUZZLE GAME",
  },
  {
    id: 2,
    name: "Word Hunt",
    image: "/src/assets/games/8.jpeg",
    type: "WORD GAME",
  },
  {
    id: 3,
    name: "Blade Master",
    image: "/src/assets/games/1.jpeg",
    type: "ARCADE GAME",
  },
];

function Card({
  game,
  theme,
}) {
  return (
    <div className={`${styles.card} ${styles[theme]}`}>
      <div className={styles.imageWrap}>
        <img src={game.image} alt={game.name} />

        <div className={styles.overlay}>
          <span className={styles.gameType}>{game.type}</span>
          <h3>{game.name}</h3>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.cost}>
          <span className={styles.token}>◉</span>
          <span>20 Tokens</span>
        </div>

        <button>Play Now <span>→</span></button>
      </div>
    </div>
  );
}

export default function CardThemePreview() {
  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <span>CARD THEME PREVIEW</span>
        <h1>Choose Your Game Card Style</h1>
        <p>
          Same content, five completely different visual directions.
        </p>
      </div>

      {/* THEME 1 */}
      <section>
        <h2>01 — Premium Dark</h2>
        <div className={styles.grid}>
          {games.map((game) => (
            <Card
              key={game.id}
              game={game}
              theme="premiumDark"
            />
          ))}
        </div>
      </section>

      {/* THEME 2 */}
      <section>
        <h2>02 — Glassmorphism</h2>
        <div className={styles.grid}>
          {games.map((game) => (
            <Card
              key={game.id}
              game={game}
              theme="glass"
            />
          ))}
        </div>
      </section>

      {/* THEME 3 */}
      <section>
        <h2>03 — Neon Arcade</h2>
        <div className={styles.grid}>
          {games.map((game) => (
            <Card
              key={game.id}
              game={game}
              theme="neon"
            />
          ))}
        </div>
      </section>

      {/* THEME 4 */}
      <section>
        <h2>04 — Soft Premium</h2>
        <div className={styles.grid}>
          {games.map((game) => (
            <Card
              key={game.id}
              game={game}
              theme="soft"
            />
          ))}
        </div>
      </section>

      {/* THEME 5 */}
      <section>
        <h2>05 — Gaming Dashboard</h2>
        <div className={styles.grid}>
          {games.map((game) => (
            <Card
              key={game.id}
              game={game}
              theme="dashboard"
            />
          ))}
        </div>
      </section>
    </div>
  );
}