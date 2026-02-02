// 1. 전역 변수 선언 (DOM 요소들이 제대로 있는지 확인)
const winSound = new Audio('applause.wav');
let audioCtx = null;
let turn = 'X';
let gameData = Array(9).fill('');
let active = true;

// 2. 오디오 컨텍스트 초기화 (사용자 상호작용 필수)
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// 3. 연필 소리 생성기
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
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    noise.connect(filter).connect(gain).connect(audioCtx.destination);
    noise.start();
}

// 4. 게임 보드 생성
function buildBoard() {
    const board = document.getElementById('board');
    if (!board) return;
    board.innerHTML = '';
    gameData.fill('');
    active = true;
    turn = 'X';
    document.getElementById('turn-display').textContent = 'X';
    document.getElementById('result-banner').classList.remove('show');

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.onclick = () => play(cell, i);
        board.appendChild(cell);
    }
}

// 5. 수 놓기
function play(el, idx) {
    if (gameData[idx] !== '' || !active) return;
    playPencilSound();
    gameData[idx] = turn;
    el.textContent = turn; // 우선 텍스트로 테스트 (SVG 이전에 작동 확인용)
    el.style.color = turn === 'X' ? '#e94560' : '#4cc9f0';

    if (checkWinner()) {
        showResult(turn + " 승리!");
    } else if (!gameData.includes('')) {
        showResult("무승부!");
    } else {
        turn = turn === 'X' ? 'O' : 'X';
        document.getElementById('turn-display').textContent = turn;
    }
}

// 6. 결과 표시 및 박수 소리
function showResult(t) {
    document.getElementById('winner-text').textContent = t;
    document.getElementById('result-banner').classList.add('show');
    active = false;

    if (t.includes("승리")) {
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log("오디오 재생 차단됨:", e));
    }
}

// 7. 승리 판정
function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(l => gameData[l[0]] && gameData[l[0]] === gameData[l[1]] && gameData[l[0]] === gameData[l[2]]);
}

// 8. 페이지 로드 시 이벤트 연결 (이게 핵심!)
window.onload = () => {
    document.getElementById('start-btn').onclick = () => {
        initAudio();
        document.getElementById('start-screen').classList.replace('active', 'hidden');
        document.getElementById('game-screen').classList.replace('hidden', 'active');
        buildBoard();
    };

    document.getElementById('banner-restart-btn').onclick = buildBoard;
};
