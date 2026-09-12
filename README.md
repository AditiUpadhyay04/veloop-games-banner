# VELOOP Rewards — Games Banner Experience

A responsive React-based gaming rewards experience built for the VELOOP Games Banner Development Task.

The project includes a horizontal carousel featuring 13 game banners, token-based game entry, two fully playable games, a centralized Game Coin system, revive/reward flows, and a Game Coin redemption section.

---

## Features

### Games Banner Experience
- 13 game banners displayed in a responsive horizontal carousel
- Smooth automatic carousel movement
- Touch, swipe, mouse and trackpad interaction
- Carousel dot indicators
- No left/right navigation arrows
- Responsive design from 320px to large desktop screens
- Consistent card dimensions and visual presentation
- Infinite Play Now shimmer animation
- Hover and active interaction states

### Token System
- Every game costs 20 Tokens to play
- Centralized Token state using React Context
- Token balance is checked before starting a game
- Insufficient-token state is handled with a user-friendly modal
- Token balance is displayed throughout the experience

### Fully Playable Games

Two games from the 13-game collection are implemented as interactive playable experiences:

#### 1. Blade Master
- Game-specific home screen
- First-time gameplay guide
- Interactive dart/target gameplay
- Desktop and responsive interaction
- Throw limit and scoring system
- Game-over state
- Revive option with additional throws
- No Thanks flow
- Game Coin reward on completion

#### 2. Word Hunt
- Game-specific home screen
- First-time gameplay guide
- Multiple progressively challenging levels
- Interactive word-search grid
- Straight-line word selection
- Supports touch and pointer interaction
- Timer-based gameplay
- Level completion state
- Revive option
- No Thanks flow
- Game Coin rewards

### Game Coin System
- Centralized Game Coin balance using React Context
- Shared balance across games and redemption
- Game completion rewards Game Coins
- Revive and game-over flows are connected to the centralized balance
- Redemption balance updates immediately

### Redemption
Users can redeem their Game Coins for:

- VE
- SVE
- Gems
- Tokens
- Spins

Includes:
- Redemption confirmation modal
- Successful redemption state
- Insufficient Game Coins state
- Current Game Coin balance
- Responsive reward cards

---

## Tech Stack

- React.js
- Vite
- JavaScript (JSX)
- Bootstrap
- CSS Modules
- React Router
- React Hooks
- React Context API
- React Icons
- Framer Motion

---

## Project Structure

```text
veloop-games-banner/
│
├── public/
│
├── src/
│   ├── assets/
│   │   └── games/
│   │       ├── 1.jpeg
│   │       ├── 2.jpeg
│   │       ├── ...
│   │       ├── 13.jpeg
│   │       ├── game_coin.jpeg
│   │       ├── multi_gems.jpeg
│   │       ├── multi_SVEs.jpeg
│   │       ├── multi_token.jpeg
│   │       ├── multi_VEs.jpeg
│   │       └── signle_spin.jpeg
│   │
│   ├── components/
│   │   └── games/
│   │       ├── CarouselDots.jsx
│   │       ├── GameCard.jsx
│   │       ├── GameCard.module.css
│   │       ├── GamesCarousel.jsx
│   │       ├── GamesCarousel.module.css
│   │       ├── PlayNowButton.jsx
│   │       ├── PlayNowButton.module.css
│   │       ├── TokenCost.jsx
│   │       └── TokenCost.module.css
│   │
│   ├── context/
│   │   ├── GameCoinContext.jsx
│   │   └── TokenContext.jsx
│   │
│   ├── data/
│   │   └── gamesData.js
│   │
│   ├── games/
│   │   ├── gameOne/
│   │   │   ├── BladeMasterGame.jsx
│   │   │   └── BladeMasterGame.module.css
│   │   │
│   │   └── gameTwo/
│   │       ├── WordHuntGame.jsx
│   │       └── WordHuntGame.module.css
│   │
│   ├── pages/
│   │   ├── GameHomePage.jsx
│   │   ├── GameHomePage.module.css
│   │   ├── RedeemPage.jsx
│   │   └── RedeemPage.module.css
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── package-lock.json
└── README.md