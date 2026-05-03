// --- AUTH STATE ---
let currentUser = null; // { name, tag, avatar, isGuest }

// --- GAME CONSTANTS & STATE ---
const PLAYER = 'X';
const AI = 'O';

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = PLAYER;
let gameActive = true;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let scoreYou = 0;
let scoreCpu = 0;
let scoreDraw = 0;

// DOM Elements
const boardElement   = document.getElementById('board');
const statusText     = document.getElementById('status-text');
const restartBtn     = document.getElementById('restart-btn');
const retryBtn       = document.getElementById('btn-retry');

// =====================
// === AUTH FLOW ========
// =====================

function loginWithName() {
    const input = document.getElementById('player-name-input');
    const name = input ? input.value.trim() : '';
    const errEl = document.getElementById('login-error');
    if (!name) {
        errEl.innerText = 'Please enter your gamer tag to continue.';
        errEl.classList.remove('hidden');
        input && input.focus();
        return;
    }
    errEl.classList.add('hidden');
    const tag = name.toUpperCase().replace(/\s+/g, '_');
    loginUser({
        name: name,
        tag: tag,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        isGuest: false
    });
    closeMainModal();
}

function continueAsGuest() {
    loginUser({
        name: 'Guest',
        tag: 'GUEST_' + Math.floor(Math.random() * 9999),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
        isGuest: true
    });
    closeMainModal();
}

function loginUser(user) {
    currentUser = user;

    // Update avatar
    const profileImg = document.getElementById('profile-img');
    profileImg.src = user.avatar;
    profileImg.onerror = function() {
        this.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
    };

    // Update profile badge
    const badge = document.getElementById('profile-badge');
    badge.innerText = user.isGuest ? 'GUEST' : user.name.split(' ')[0].toUpperCase().slice(0, 6);
    badge.classList.remove('hidden');

    // Update dropdown info
    document.getElementById('profile-name-display').innerText = user.name;
    document.getElementById('profile-tag-display').innerText = user.isGuest ? 'Playing as Guest' : '#' + user.tag;
}

function closeMainModal() {
    const modal = document.getElementById('login-modal');
    modal.style.transition = 'opacity 0.4s ease';
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 400);
}

function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('hidden');
}

function logout() {
    currentUser = null;
    scoreYou = 0; scoreCpu = 0; scoreDraw = 0;
    document.getElementById('score-you').innerText  = '00';
    document.getElementById('score-cpu').innerText  = '00';
    document.getElementById('score-draw').innerText = '00';
    document.getElementById('profile-menu').classList.add('hidden');
    document.getElementById('profile-badge').classList.add('hidden');
    document.getElementById('profile-img').src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
    document.getElementById('profile-name-display').innerText = 'Not signed in';
    document.getElementById('profile-tag-display').innerText = '-';

    // Show login modal again
    const modal = document.getElementById('login-modal');
    modal.style.display = 'flex';
    modal.style.opacity = '1';

    // Clear the name input
    const input = document.getElementById('player-name-input');
    if (input) { input.value = ''; }

    resetGame();
    switchView('battle');
}

// Close profile menu when clicking outside
document.addEventListener('click', function(e) {
    const menu      = document.getElementById('profile-menu');
    const profileBtn = document.getElementById('profile-btn');
    if (!menu.classList.contains('hidden') &&
        !menu.contains(e.target) &&
        !profileBtn.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// =====================
// === VIEW MANAGEMENT ==
// =====================

function switchView(viewName) {
    const views = ['battle', 'ranks', 'social'];
    views.forEach(v => {
        const viewEl = document.getElementById('view-' + v);
        const navEl  = document.getElementById('nav-' + v);
        if (v === viewName) {
            viewEl.classList.remove('hidden-view');
            navEl.classList.add('text-cyan-400', 'border-t-2', 'border-cyan-400');
            navEl.classList.remove('text-zinc-500');
        } else {
            viewEl.classList.add('hidden-view');
            navEl.classList.remove('text-cyan-400', 'border-t-2', 'border-cyan-400');
            navEl.classList.add('text-zinc-500');
        }
    });
    if (viewName === 'ranks')  renderRanks();
    if (viewName === 'social') renderSocial();
}

// =====================
// === DYNAMIC CONTENT ==
// =====================

function renderRanks() {
    const container = document.getElementById('ranks-container');
    const myName = currentUser
        ? (currentUser.isGuest ? 'GUEST' : currentUser.name.split(' ')[0].toUpperCase())
        : 'YOU';

    const players = [
        { name: 'CYBER_DRAGON', wins: 156, elo: 2450 },
        { name: 'NEON_WITCH',   wins: 142, elo: 2380 },
        { name: 'VOID_WALKER',  wins: 128, elo: 2100 },
        { name: 'HEX_GURU',     wins: 110, elo: 1950 },
        { name: myName,         wins: scoreYou, elo: 1200 + scoreYou * 15, isUser: true }
    ].sort((a, b) => b.wins - a.wins);

    const medalColors = ['text-yellow-400', 'text-zinc-300', 'text-amber-600'];

    container.innerHTML = '';
    players.forEach((p, i) => {
        const isTop3 = i < 3;
        const rankColor = isTop3 ? medalColors[i] : 'text-zinc-500';
        const highlight = p.isUser ? 'ring-1 ring-cyan-400/30 bg-cyan-400/5' : '';
        const rankEl = document.createElement('div');
        rankEl.className = `glass-panel p-4 rounded-xl flex items-center gap-4 ${highlight} transition-all`;
        rankEl.innerHTML = `
            <span class="font-bold text-lg ${rankColor} w-8 text-center">${isTop3 ? ['🥇','🥈','🥉'][i] : '#' + (i+1)}</span>
            <div class="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10 flex-shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow min-w-0">
                <div class="font-bold text-sm truncate ${p.isUser ? 'text-cyan-400' : 'text-white'}">${p.name} ${p.isUser ? '<span class="text-xs text-cyan-400/60">(You)</span>' : ''}</div>
                <div class="text-[10px] text-zinc-500">${p.elo.toLocaleString()} ELO</div>
            </div>
            <div class="font-black text-sm flex-shrink-0 ${p.isUser ? 'text-cyan-400' : 'text-zinc-300'}">${p.wins}W</div>
        `;
        container.appendChild(rankEl);
    });
}

function renderSocial() {
    const container = document.getElementById('social-container');
    const friends = [
        { name: 'GhostProtocol', status: 'Playing Tic Tac Toe', active: true  },
        { name: 'NeuralLinker',  status: 'Online — Main Menu',  active: true  },
        { name: 'StaticNoise',   status: 'Offline · 2h ago',    active: false },
        { name: 'ByteMe',        status: 'Offline · 1d ago',    active: false }
    ];

    const onlineCount = friends.filter(f => f.active).length;
    document.getElementById('social-status').innerText = `${onlineCount} Friends Online`;

    container.innerHTML = '';
    friends.forEach(f => {
        const friendEl = document.createElement('div');
        friendEl.className = `glass-panel rounded-xl flex items-center gap-4 p-4 ${f.active ? '' : 'opacity-50'}`;
        friendEl.innerHTML = `
            <div class="relative flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border-2 ${f.active ? 'border-cyan-400' : 'border-zinc-600'}">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(f.name)}" class="w-full h-full">
                </div>
                <div class="absolute bottom-0 right-0 w-3 h-3 ${f.active ? 'bg-cyan-400' : 'bg-zinc-600'} rounded-full border-2 border-zinc-900"></div>
            </div>
            <div class="flex-grow min-w-0">
                <div class="font-bold text-sm truncate">${f.name}</div>
                <div class="text-xs ${f.active ? 'text-cyan-400' : 'text-zinc-500'} truncate">${f.status}</div>
            </div>
            ${f.active
                ? `<button onclick="challengeFriend('${f.name}')" class="flex-shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-xs font-black uppercase tracking-wide hover:shadow-[0_0_12px_rgba(0,240,255,0.5)] transition-all active:scale-95">Challenge</button>`
                : `<span class="flex-shrink-0 px-3 py-1.5 rounded-lg glass-panel text-zinc-600 text-xs font-bold uppercase">Offline</span>`
            }
        `;
        container.appendChild(friendEl);
    });
}

function challengeFriend(name) {
    switchView('battle');
    statusText.innerText = `VS ${name}!`;
    statusText.className = 'font-headline-lg text-fuchsia-400 neon-magenta-glow uppercase tracking-widest font-bold';
    setTimeout(() => { resetGame(); }, 1200);
}

// =====================
// === GAME LOGIC =======
// =====================

function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'w-24 h-24 md:w-28 md:h-28 glass-panel rounded-lg flex items-center justify-center active:scale-95 transition-all hover:bg-white/5 cursor-pointer';
        btn.dataset.index = i;
        btn.addEventListener('click', handleCellClick);
        boardElement.appendChild(btn);
    }
}

function updateCell(index, player) {
    board[index] = player;
    const btn = boardElement.children[index];
    btn.innerHTML = '';
    const span = document.createElement('span');
    span.className = 'text-5xl font-black select-none pointer-events-none ';
    span.className += player === 'X'
        ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]'
        : 'text-fuchsia-400 drop-shadow-[0_0_12px_rgba(255,36,228,0.8)]';
    span.innerText = player;
    btn.appendChild(span);
    btn.disabled = true;
}

function handleCellClick(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (board[index] !== '' || !gameActive || currentPlayer !== PLAYER) return;

    updateCell(index, PLAYER);
    if (checkWin(board, PLAYER)) {
        endGame(PLAYER);
    } else if (isBoardFull(board)) {
        endGame('DRAW');
    } else {
        currentPlayer = AI;
        setStatus('CPU is thinking…', 'secondary');
        Array.from(boardElement.children).forEach(b => b.disabled = true);
        setTimeout(makeAIMove, 600);
    }
}

function makeAIMove() {
    if (!gameActive) return;
    let bestScore = -Infinity, bestMove = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = AI;
            const score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) { bestScore = score; bestMove = i; }
        }
    }
    if (bestMove !== -1) {
        updateCell(bestMove, AI);
        if (checkWin(board, AI)) {
            endGame(AI);
        } else if (isBoardFull(board)) {
            endGame('DRAW');
        } else {
            currentPlayer = PLAYER;
            setStatus('Your Turn', 'player');
            Array.from(boardElement.children).forEach((b, i) => {
                if (board[i] === '') b.disabled = false;
            });
        }
    }
}

function minimax(boardState, depth, isMaximizing) {
    if (checkWin(boardState, AI))     return 10 - depth;
    if (checkWin(boardState, PLAYER)) return depth - 10;
    if (isBoardFull(boardState))      return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = AI;
                best = Math.max(best, minimax(boardState, depth + 1, false));
                boardState[i] = '';
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = PLAYER;
                best = Math.min(best, minimax(boardState, depth + 1, true));
                boardState[i] = '';
            }
        }
        return best;
    }
}

function checkWin(boardState, player) {
    return winPatterns.some(p => p.every(i => boardState[i] === player));
}

function isBoardFull(boardState) {
    return boardState.every(c => c !== '');
}

function setStatus(text, type) {
    statusText.innerText = text;
    statusText.className = 'font-headline-lg uppercase tracking-widest font-bold ';
    if      (type === 'player')    statusText.className += 'text-cyan-400 neon-cyan-glow';
    else if (type === 'secondary') statusText.className += 'text-fuchsia-400 neon-magenta-glow';
    else if (type === 'win')       statusText.className += 'text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]';
    else if (type === 'lose')      statusText.className += 'text-fuchsia-400 neon-magenta-glow';
    else if (type === 'draw')      statusText.className += 'text-zinc-400';
}

function endGame(result) {
    gameActive = false;
    Array.from(boardElement.children).forEach(b => b.disabled = true);

    if (result === PLAYER) {
        setStatus('🏆 VICTORY!', 'win');
        scoreYou++;
        document.getElementById('score-you').innerText = scoreYou.toString().padStart(2, '0');
    } else if (result === AI) {
        setStatus('💀 DEFEAT!', 'lose');
        scoreCpu++;
        document.getElementById('score-cpu').innerText = scoreCpu.toString().padStart(2, '0');
    } else {
        setStatus('🤝 DRAW!', 'draw');
        scoreDraw++;
        document.getElementById('score-draw').innerText = scoreDraw.toString().padStart(2, '0');
    }

    // Show retry button
    retryBtn.style.opacity = '1';
    retryBtn.style.pointerEvents = 'auto';
    setTimeout(() => {
        retryBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = PLAYER;
    gameActive = true;
    setStatus('Your Turn', 'player');

    // Hide retry button
    retryBtn.style.opacity = '0';
    retryBtn.style.pointerEvents = 'none';

    createBoard();
}

// =====================
// === INIT =============
// =====================

restartBtn.addEventListener('click', resetGame);
retryBtn.addEventListener('click', resetGame);

// Expose for inline HTML handlers
window.switchView        = switchView;
window.loginWithName     = loginWithName;
window.continueAsGuest   = continueAsGuest;
window.toggleProfileMenu = toggleProfileMenu;
window.logout            = logout;
window.challengeFriend   = challengeFriend;

// Boot
createBoard();
renderRanks();
renderSocial();
