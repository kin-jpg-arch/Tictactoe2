// 1. 전역 변수 및 오디오 설정
const winSound = new Audio('applause.wav');
let audioCtx = null;
let turn = 'X';
let gameData = Array(9).fill('');
let active = true;

// 오디오 컨텍스트 초기화 (사용자 클릭 시 실행)
function initAudio() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { console.error("오디오 초기화 에러:", e); }
}

// 로고 클릭 시 '띵' 소리 (전자음)
function playDingSound() {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.5);
}

// 최신 사각사각 연필 소리
function playPencilSound() {
    initAudio();
    if (!audioCtx) return;
    const duration = 0.3;
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, audioCtx.currentTime);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    noise.connect(filter).connect(gain).connect(audioCtx.destination);
    noise.start();
}

// 다시 시작 시 박수 소리 멈춤
function stopApplause() {
    winSound.pause();
    winSound.currentTime = 0;
}

// 폭죽 효과 (입자 생성)
function startFireworks() {
    const colors = ['#e94560', '#4cc9f0', '#f1c40f'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            position: fixed; left: ${Math.random() * 100}vw; top: 100vh;
            width: ${Math.random() * 6 + 4}px; height: ${Math.random() * 6 + 4}px;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%; z-index: 1000; pointer-events: none;
        `;
        document.body.appendChild(p);
        p.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${(Math.random() - 0.5) * 40}vw, -${Math.random() * 80 + 20}vh)`, opacity: 0 }
        ], { duration: 1500 + Math.random() * 1000 }).onfinish = () => p.remove();
    }
}

// 게임 보드 초기화
function buildBoard() {
    stopApplause();
    const board = document.getElementById('board');
    if (!board) return;
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

// 수 놓기 및 SVG 그리기
function play(el, idx) {
    if (gameData[idx] !== '' || !active) return;
    playPencilSound();
    gameData[idx] = turn;

    if (turn === 'X') {
        el.innerHTML = `
            <svg viewBox="0 0 100 100" style="width:70%; height:70%;">
                <line x1="20" y1="20" x2="80" y2="80" stroke="#e94560" stroke-width="12" stroke-linecap="round" />
                <line x1="80" y1="20" x2="20" y2="80" stroke="#e94560" stroke-width="12" stroke-linecap="round" />
            </svg>`;
    } else {
        el.innerHTML = `
            <svg viewBox="0 0 100 100" style="width:70%; height:70%;">
                <circle cx="50" cy="50" r="35" stroke="#4cc9f0" stroke-width="12" stroke-linecap="round" fill="none" />
            </svg>`;
    }

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
        winSound.play().catch(e => console.log("박수 소리 재생 차단됨"));
        startFireworks();
    }
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(l => gameData[l[0]] && gameData[l[0]] === gameData[l[1]] && gameData[l[0]] === gameData[l[2]]);
}

// 페이지 로드 시 모든 버튼 연결 (안전한 연결 방식)
window.onload = () => {
    const connect = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };

    connect('main-logo', playDing
