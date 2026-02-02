window.onload = () => {
    // 로고 터치 시 전자음
    const logo = document.getElementById('main-logo');
    if (logo) logo.onclick = playDingSound;

    // 게임 시작 버튼
    document.getElementById('start-btn').onclick = () => {
        initAudio();
        document.getElementById('start-screen').classList.replace('active', 'hidden');
        document.getElementById('game-screen').classList.replace('hidden', 'active');
        buildBoard();
    };

    // [추가] 도움말 열기 버튼
    document.getElementById('info-btn').onclick = () => {
        document.getElementById('modal').classList.remove('hidden');
    };

    // [추가] 도움말 닫기 버튼
    document.getElementById('close-modal-btn').onclick = () => {
        document.getElementById('modal').classList.add('hidden');
    };

    // 다시 하기 버튼
    document.getElementById('banner-restart-btn').onclick = buildBoard;
    
    // 메뉴로 돌아가기 (새로고침)
    document.getElementById('back-btn').onclick = () => location.reload();
};
