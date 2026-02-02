const board = document.getElementById('board');
const turnDisplay = document.getElementById('turn-display');
const resultBanner = document.getElementById('result-banner');
const winnerText = document.getElementById('winner-text');

let turn = 'X';
let gameData = Array(9).fill('');
let active = true;

// 홈으로 가기 (정석적인 화면 전환)
document.getElementById('back-btn').onclick = () => {
    resultBanner.classList.remove('show');
    document.getElementById('game-screen').classList.replace('active', 'hidden');
    document.getElementById('start-screen').classList.replace('hidden', 'active');
    active = false;
};

document.getElementById('start-btn').onclick = () => {
    document.getElementById('start-screen').classList.replace('active', 'hidden');
    document.getElementById('game-screen').classList.replace('hidden', 'active');
    buildBoard();
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
        // 원의 경로(Path)를 직접 그려서 '끝까지' 그려지도록 보장
        svg.innerHTML = `
            <circle cx="50" cy="50" r="35" class="draw-path" style="stroke: #4cc9f0;" />`;
    }
    el.appendChild(svg);

    if(checkWinner()) {
        showResult(`${turn} 승리!`);
        active = false;
        return;
    }
    
    if(!gameData.includes('')) {
        showResult("DRAW!");
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
    for (let i = 0; i < 70; i++) {
        setTimeout(() => {
            if(!resultBanner.classList.contains('show')) return; // 배너 닫히면 중단
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 4;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            document.body.appendChild(p);

            p.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(110vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 2000 + 3000,
                easing: 'linear'
            });

            setTimeout(() => p.remove(), 5000);
        }, i * 60);
    }
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(l => gameData[l[0]] && gameData[l[0]] === gameData[l[1]] && gameData[l[0]] === gameData[l[2]]);
}

// 모달 제어
document.getElementById('info-btn').onclick = () => document.getElementById('modal').classList.remove('hidden');
document.getElementById('close-modal-btn').onclick = () => document.getElementById('modal').classList.add('hidden');