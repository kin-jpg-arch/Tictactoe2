let turn = 'X';
let gameData = Array(9).fill('');
let active = true;
let audioCtx = null;

function playEasterEggSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.5);
}

function buildBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    gameData.fill('');
    active = true;
    turn = 'X';
    document.getElementById('turn').textContent = turn;
    document.getElementById('turn').style.color = 'var(--player-x)';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.onclick = () => {
            if (gameData[i] || !active) return;
            gameData[i] = turn;
            if (turn === 'X') {
                cell.innerHTML = `<svg viewBox="0 0 100 100" style="width:70%; height:70%;"><line x1="25" y1="25" x2="75" y2="75" class="draw-path" stroke="var(--player-x)" stroke-width="12" stroke-linecap="round" /><line x1="75" y1="25" x2="25" y2="75" class="draw-path" stroke="var(--player-x)" stroke-width="12" stroke-linecap="round" style="animation-delay:0.1s" /></svg>`;
            } else {
                cell.innerHTML = `<svg viewBox="0 0 100 100" style="width:70%; height:70%;"><circle cx="50" cy="50" r="30" class="draw-path" stroke="var(--player-o)" stroke-width="12" fill="none" stroke-linecap="round" /></svg>`;
            }
            if (checkWinner()) {
                document.getElementById('turn').textContent = turn + " 승리!";
                active = false;
            } else if (!gameData.includes('')) {
                document.getElementById('turn').textContent = "무승부";
                active = false;
            } else {
                turn = turn === 'X' ? 'O' : 'X';
                const statusSpan = document.getElementById('turn');
                statusSpan.textContent = turn;
                statusSpan.style.color = turn === 'X' ? 'var(--player-x)' : 'var(--player-o)';
            }
        };
        board.appendChild(cell);
    }
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(l => gameData[l[0]] && gameData[l[0]] === gameData[l[1]] && gameData[l[0]] === gameData[l[2]]);
}

window.onload = () => {
    buildBoard();
    document.getElementById('reset-btn').onclick = buildBoard;
    document.getElementById('main-logo').onclick = playEasterEggSound;
};
