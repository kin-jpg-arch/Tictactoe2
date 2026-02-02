const board = document.getElementById('board');
const turnDisplay = document.getElementById('turn-display');
const resultBanner = document.getElementById('result-banner');
const winnerText = document.getElementById('winner-text');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const mainLogo = document.getElementById('main-logo');

let turn = 'X';
let gameData = Array(9).fill('');
let active = true;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// 로고용 "띵" 소리
function playDingSound() {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// 튜닝된 "스으윽-" 연필 소리
function playPencilSound() {
    initAudio();
    const duration = 0.8; 
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // 노이즈 생성
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // "딱" 소리 방지를 위한 필터 레이어
    const lowFilter = audioCtx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.setValueAtTime(3000, audioCtx.currentTime);

    const bandFilter = audioCtx.createBiquadFilter();
    bandFilter.type = 'bandpass';
    bandFilter.frequency.setValueAtTime(1200, audioCtx.currentTime); 
    bandFilter.Q.setValueAtTime(0.5, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    // 0.2초 동안 부드럽게 소리가 올라옴 (스윽-)
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.2); 
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    noise.connect(lowFilter);
    lowFilter.connect(bandFilter);
    bandFilter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
}

mainLogo.onclick = () => {
    playDingSound();
    mainLogo.style.filter = "drop-shadow(0 0 20px #fff)";
    setTimeout(() => mainLogo.style.filter = "drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))", 200);
};

document.getElementById('start-btn').onclick = () => {
    initAudio();
    startScreen.classList.replace('active', 'hidden');
    gameScreen.classList.replace('hidden', 'active');
    buildBoard();
};

document.getElementById('back-btn').onclick = () => {
    resultBanner.classList.remove('show');
    gameScreen.classList.replace('active', 'hidden');
    startScreen.classList.replace('hidden', 'active');
    active = false;
};

document.getElementById('banner-restart-btn').onclick = buildBoard;

function buildBoard() {
    board.innerHTML = '';
    gameData.fill('');
    active = true;
    turn = 'X';
    resultBanner.classList.remove('show');
    turnDisplay.textContent = turn;
    turnDisplay.className = 'player-x';

    for(let i=0; i<9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.onclick = () => play(cell, i);
        board.appendChild(cell);
    }
}

function play(el, idx) {
    if(gameData[idx] !== '' || !active) return;
    
    playPencilSound();
    
    el.classList.add('clicked');
    gameData[idx] = turn;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.width = "70%"; svg.style.height = "70%";

    if(turn === 'X') {
        svg.innerHTML = `
            <line x1="20" y1="20" x2="80" y2="80" class="draw-path" style="stroke: #e94560;" />
            <line x1="80" y1="20" x2="20" y2="80" class="draw-path" style="stroke: #e94560; animation-delay: 0.2s;" />`;
    } else {
        svg.innerHTML = `<circle cx="50" cy="50" r="35" class="draw-path" style="stroke: #4cc9f0;" />`;
    }
    el.appendChild(svg);

    if(checkWinner()) {
        showResult(`${turn} 승리!`);
        active = false;
    } else if(!gameData.includes('')) {
        showResult("무승부!");
        active = false;
    } else {
        turn = turn === 'X' ? 'O' : 'X';
        turnDisplay.textContent = turn;
        turnDisplay.className = `player-${turn.toLowerCase()}`;
    }
}

function showResult(text) {
    winnerText.textContent = text;
    winnerText.style.color = text.includes('X') ? '#e94560' : (text.includes('O') ? '#4cc9f0' : '#f1c40f');
    resultBanner.classList.add('show');
    startFireworks();
}

function startFireworks() {
    const colors = ['#ff4d4d', '#4d94ff', '#ffeb3b', '#ffffff'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            if(!resultBanner.classList.contains('show')) return;
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 6 + 3;
            p.style.width = size + 'px'; p.style.height = size + 'px';
            document.body.appendChild(p);
            p.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(110vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], { duration: Math.random() * 2000 + 2000, easing: 'linear' });
            setTimeout(() => p.remove(), 4000);
        }, i * 80);
    }
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(l => gameData[l[0]] && gameData[l[0]] === gameData[l[1]] && gameData[l[0]] === gameData[l[2]]);
}

document.getElementById('info-btn').onclick = () => document.getElementById('modal').classList.remove('hidden');
document.getElementById('close-modal-btn').onclick = () => document.getElementById('modal').classList.add('hidden');
