const board = document.getElementById('board');
const turnDisplay = document.getElementById('turn-display');
const resultBanner = document.getElementById('result-banner');
const winnerText = document.getElementById('winner-text');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const mainLogo = document.getElementById('main-logo');

// [중요] 박수 소리 파일 호출 (같은 폴더에 applause.wav가 있어야 함)
const winSound = new Audio('applause.wav'); 

let turn = 'X';
let gameData = Array(9).fill('');
let active = true;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// 리얼 연필 소리 (화이트 노이즈 + 필터)
function playPencilSound() {
    initAudio();
    const duration = 0.5;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const bandFilter = audioCtx.createBiquadFilter();
    bandFilter.type = 'bandpass';
    bandFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    bandFilter.Q.setValueAtTime(2, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    noise.connect(bandFilter).connect(gain).connect(audioCtx.destination);
    noise.start();
}

function buildBoard() {
    board.innerHTML = ''; gameData.fill(''); active = true; turn = 'X';
    resultBanner.classList.remove('show');
    turnDisplay.textContent = 'X'; turnDisplay.className = 'player-x';
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
    gameData[idx] = turn;
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    if(turn === 'X') {
        svg.innerHTML = `<line x1="25" y1="25" x2="75" y2="75" class="draw-path" style="stroke:var(--player-x);" />
                         <line x1="75" y1="25" x2="25" y2="75" class="draw-path" style="stroke:var(--player-x);animation-delay:0.1s;" />`;
    } else {
        svg.innerHTML = `<circle cx="50" cy="50" r="30" class="draw-path" style="stroke:var(--player-o);" />`;
    }
    el.appendChild(svg);

    if(checkWinner()) { showResult(turn + " 승리!"); active = false; }
    else if(!gameData.includes('')) { showResult("무승부!"); active = false; }
    else { turn = turn === 'X' ? 'O' : 'X'; turnDisplay.textContent = turn; turnDisplay.className = `player-${turn.toLowerCase()}`; }
}

function showResult(t) {
    winnerText.textContent = t;
    resultBanner.classList.add('show');
    
    // 승리 시 박수 소리 재생
    if (t.includes("승리")) {
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log("오디오 실패:", e));
        startFireworks();
    }
}

function startFireworks() {
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = '-10px';
        p.style.width = p.style.height = Math.random() * 8 + 4 + 'px';
        p.style.backgroundColor = ['#ff4d4d', '#4cc9f0', '#f1c40f'][Math.floor(Math.random()*3)];
        document.body.appendChild(p);
        p.animate([{transform:'translateY(0)'}, {transform:`translateY(105vh) rotate(${Math.random()*360}deg)`}], {duration: 2000 + Math.random()*2000});
        setTimeout(() => p.remove(), 4000);
    }
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4
