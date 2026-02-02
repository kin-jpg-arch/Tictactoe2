const winSound = new Audio('applause.wav');
let audioCtx = null;
let turn = 'X';
let gameData = Array(9).fill('');
let active = true;

// 오디오 초기화
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// [로고용 전자음] 띵~ 하는 깔끔한 소리
function playDingSound() {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 음정
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// [최신 연필 소리] 더 리얼한 사각거림
function playPencilSound() {
    initAudio();
    const duration = 0.35;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // 핑크 노이즈 느낌의 랜덤 데이터
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, audioCtx.currentTime); // 주파수 대역 최적화
    filter.Q.setValueAtTime(1.2, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    noise.connect(filter).connect(gain).connect(audioCtx.destination);
    noise.start();
}

// [폭죽 효과] 화면 전체에 퍼지는 파티클
function startFireworks() {
    const colors = ['#e94560', '#4cc9f0', '#f1c40f', '#ff00ff'];
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        // 랜덤 시작 위치 및 스타일
        const startX = Math.random() * 100;
        p.style.left = startX + 'vw';
        p.style.top = '100vh'; // 아래에서 위로
        p.style.width = p.style.height = Math.random() * 7 + 3 + 'px';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.position = 'fixed';
        p.style.borderRadius = '50%';
        p.style.zIndex = '1000';
        
        document.body.appendChild(p);

        // 애니메이션 설정
        const destinationX = (Math.random() - 0.5) * 30; // 약간 옆으로 퍼지게
        const destinationY = -(Math.random() * 80 + 20); // 위로 솟구치게
        
        p.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${destinationX}vw, ${destinationY}vh)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 1500,
            easing: 'ease-out'
        }).onfinish = () => p.remove();
    }
}

function stopApplause() {
    winSound.pause();
    winSound.currentTime = 0;
}

function buildBoard() {
    stopApplause();
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

function play(el, idx) {
    if (gameData[idx] !== '' || !active) return;
    playPencilSound();
    gameData[idx] = turn;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.width = "70%"; svg.style.height = "70%";

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
        startFireworks(); // 승리 시 폭죽 실행
    }
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(l => gameData[l[0]] && gameData[l[0]] === gameData[l[1]] && gameData[l[0]] === gameData[l[2]]);
}

window.onload = () => {
    // 로고 터치 시 전자음 연결
    document.getElementById('main-logo').onclick = playDingSound;

    document.getElementById('start-btn').onclick = () => {
        initAudio();
        document.getElementById('start-screen').classList.replace('active', 'hidden');
        document.getElementById('game-screen').classList.replace('hidden', 'active');
        buildBoard();
    };
    document.getElementById('banner-restart-btn').onclick = buildBoard;
    document.getElementById('back-btn').onclick = () => location.reload();
};
