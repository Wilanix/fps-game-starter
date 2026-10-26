* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #111;
  color: white;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

body {
  position: relative;
}

canvas {
  display: block;
  width: 100vw;
  height: 100vh;
}

#hud {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

#top-bar {
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.panel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 120px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(15, 18, 27, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
}

.stat span {
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
}

#crosshair {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  opacity: 0.9;
}

#crosshair span {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

#crosshair span::before,
#crosshair span::after {
  content: "";
  position: absolute;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
}

#crosshair span::before {
  left: 11px;
  top: 0;
  width: 2px;
  height: 24px;
}

#crosshair span::after {
  left: 0;
  top: 11px;
  width: 24px;
  height: 2px;
}

#ammo-panel {
  position: absolute;
  right: 22px;
  bottom: 18px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

#weapon-rarity {
  position: absolute;
  left: 22px;
  bottom: 18px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 11px;
}

.rarity-common { border-color: rgba(180, 180, 180, 0.6); color: #d2d2d2; }
.rarity-uncommon { border-color: rgba(78, 209, 117, 0.7); color: #7ef3a6; }
.rarity-rare { border-color: rgba(71, 156, 255, 0.75); color: #81c8ff; }
.rarity-epic { border-color: rgba(176, 112, 255, 0.8); color: #d3a6ff; }
.rarity-legendary { border-color: rgba(255, 184, 77, 0.85); color: #ffcf6d; }

#message {
  position: absolute;
  left: 50%;
  bottom: 36px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid rgba(255,255,255,0.24);
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

#death-screen {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(7, 12, 20, 0.7);
  backdrop-filter: blur(6px);
}

#death-screen.hidden {
  display: none;
}

#death-screen h1 {
  margin: 0 0 8px;
  font-size: clamp(2rem, 4vw, 4rem);
  text-align: center;
}

#death-screen p {
  margin: 0 0 20px;
  text-align: center;
  font-size: 1.1rem;
}

#restart-btn {
  pointer-events: auto;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #60d394, #2d9cdb);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 12px 25px rgba(45, 156, 219, 0.35);
}
