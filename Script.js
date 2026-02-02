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

// --- 오디오 시스템 최적화 (재사용 방식) ---
let audioCtx = null;

function playDingSound() {
    try {
        // 처음 한 번만 AudioContext 생성
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // 브라우저가 오디오를 중단시킨 경우(Suspend) 다시 시작
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 띵~ 소리

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch(e) {
        console.log("Audio play failed:", e);
    }
}

// 로고 클릭 이벤트
mainLogo.onclick = () => {
    playDingSound();
    
    // 시각적 피드백
    mainLogo.style.filter = "drop-shadow(0 0 20px #fff)";
    setTimeout(() => {
        mainLogo.style.filter = "drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))";
    }, 200);
};

// --- 게임 제어 로직 ---
document.getElementById('start-btn').onclick = () => {
    // 게임 시작 시에도 오디오 컨텍스트를 활성화 (모바일 대응)
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
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
    el.classList.add('clicked');
    gameData[idx] = turn;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.width = "70%";
    svg.style.height = "70%";

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
        return;
    }
    
    if(!gameData.includes('')) {
        showResult("무승부!");
        active = false;
        return;
    }

    turn = turn === 'X' ? 'O' : 'X';
    turnDisplay.textContent = turn;
    turnDisplay.className = `player-${turn.toLowerCase()}`;
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
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            document.body.appendChild(p);

            p.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(110vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 2000 + 2000,
                easing: 'linear'
            });
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
