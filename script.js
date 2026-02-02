:root { --bg: #1a1a2e; --accent: #e94560; }
body { margin: 0; background: var(--bg); color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
.screen { text-align: center; display: none; flex-direction: column; }
.active { display: flex; }
.hidden { display: none !important; }
#board { display: grid; grid-template-columns: repeat(3, 100px); gap: 10px; margin-top: 20px; }
.cell { width: 100px; height: 100px; background: #16213e; display: flex; justify-content: center; align-items: center; cursor: pointer; border-radius: 10px; }
.hidden-banner { position: fixed; top: -100%; left: 50%; transform: translateX(-50%); background: #e94560; padding: 20px; transition: 0.5s; z-index: 100; border-radius: 0 0 20px 20px; }
.show-banner { top: 0; }
.particle { position: fixed; pointer-events: none; border-radius: 50%; z-index: 999; }
button { padding: 10px 20px; margin: 5px; cursor: pointer; background: var(--accent); color: white; border: none; border-radius: 5px; }
