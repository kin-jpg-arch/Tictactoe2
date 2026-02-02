const winSound = new Audio('applause.wav');
let audioCtx = null;
let turn = 'X';
let gameData = Array(9).fill('');
let active = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// 사각사각 연필 소리
function playPencilSound() {
    initAudio();
    const duration = 0.4;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    noise.connect(filter).connect(gain).connect(audioCtx.destination);
    noise.start();
}

// [기능 추가] 다시 시작할 때 소리 멈춤
function stopApplause() {
    winSound.pause();
    winSound.currentTime = 0;
}

function buildBoard() {
    stopApplause(); // 박수 소리 즉시 중단
    const board = document.getElementById('board');
    board.innerHTML = '';
    gameData.fill('');
    active = true;
    turn = 'X';
    document.getElementById('turn-display').textContent = 'X';
    document.getElementById('turn-display').className = 'player-x';
    document.getElementById('result-banner').classList.remove('show');

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.onclick = () => play(cell, i);
        board.appendChild(cell);
    }
}

// [기능 복구] SVG 그리기 함수
function play(el, idx) {
    if (gameData[idx] !== '' || !active) return;
    playPencilSound();
    gameData[idx] = turn;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.width = "70%";
    svg.style.height = "70%";

    if (turn === 'X') {
        svg.innerHTML = `
            <line x1="20" y1="20" x2="80" y2="80" class="draw-path" style="stroke:#e94560; stroke-width:10; stroke-linecap:round;" />
            <line x1="80" y1="20" x2="20" y2="80" class="draw-path" style="stroke:#e94560; stroke-width:10; stroke-linecap:round; animation-delay:0.1s;" />
        `;
    } else {
        svg.innerHTML = `
            <circle cx="50" cy="50" r="35" class="draw-path" style="stroke:#4cc9f0; stroke-width:10; stroke-linecap:round; fill:none;" />
        `;
    }
    el.appendChild(svg);

    if (checkWinner()) {
        showResult(turn + " 승리!");
    } else if (!gameData.includes('')) {
        showResult("무승부!");
    } else {
        turn = turn === 'X' ? 'O' : 'X';
        const display = document.getElementById('turn-display');
        display.textContent = turn;
        display.className = `player-${turn.toLowerCase()}`;
    }
}

function showResult(t) {
    document.getElementById('winner-text').textContent = t;
    document.getElementById('result-banner').classList.add('show');
    active = false;

    if (t.includes("승리")) {
        winSound.play().catch(e => console.log(e));
        // 폭죽 효과 (필요 시 추가)
    }
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(l => gameData[l[0]] && gameData[l[0]] === gameData[l[1]] && gameData[l[0]] === gameData[l[2]]);
}

window.onload = () => {
    document.getElementById('start-btn').onclick = () => {
        initAudio();
        document.getElementById('start-screen').classList.replace('active', 'hidden');
        document.getElementById('game-screen').classList.replace('hidden', 'active');
        buildBoard();
    };
    document.getElementById('banner-restart-btn').onclick = buildBoard;
    document.getElementById('back-btn').onclick = () => location.reload();
};
