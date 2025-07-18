// Remove the require since we're loading socket.io from script tag
// var io = require('socket.io-client');
var render = require('./render');
var ChatClient = require('./chat-client');
var Canvas = require('./canvas');
var global = require('./global');
// Use simple mock version for now (switch to './contract-connection' when CDN is fixed)
var contractConnection = require('./contract-connection-simple');

var playerNameInput = document.getElementById('playerNameInput');
var socket;

var debug = function (args) {
    if (console && console.log) {
        console.log(args);
    }
};

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    global.mobile = true;
}

function startGame(type) {
    global.playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '').substring(0, 25);
    global.playerType = type;

    global.screen.width = window.innerWidth;
    global.screen.height = window.innerHeight;

    document.getElementById('startMenuWrapper').style.maxHeight = '0px';
    document.getElementById('gameAreaWrapper').style.opacity = 1;

    // Show return to menu button when game starts
    document.getElementById('return-menu-btn').style.display = 'block';

    if (!socket) {
        // Enhanced Socket.io connection for Chrome compatibility
        const socketOptions = {
            query: "type=" + type,
            transports: ['websocket', 'polling'], // Support fallback transports
            forceNew: true,
            reconnection: true,
            timeout: 5000,
            // Auto-detect protocol (HTTP vs HTTPS)
            secure: window.location.protocol === 'https:',
            // Handle both local development and production
            withCredentials: true
        };

        // For production HTTPS sites, ensure secure connection
        if (window.location.protocol === 'https:') {
            socketOptions.upgrade = true;
            socketOptions.rememberUpgrade = true;
        }

        socket = io(socketOptions);

        // Add connection status logging for debugging
        socket.on('connect', () => {
            console.log('✅ Socket.io connected successfully');
            console.log('Transport:', socket.io.engine.transport.name);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket.io connection error:', error);
            handleConnectionError(error);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket.io disconnected:', reason);
            handleDisconnect();
        });

        setupSocket(socket);
    }
    if (!global.animLoopHandle)
        animloop();
    socket.emit('respawn');
    window.chat.socket = socket;
    window.chat.registerFunctions();
    window.canvas.socket = socket;
    global.socket = socket;
}

// Checks if the nick chosen contains valid characters for the game.
function validNick() {
    const name = playerNameInput.value.trim();
    // Allow any non-empty name with reasonable length, but sanitize server-side
    return name.length > 0 && name.length <= 25;
}

window.onload = function () {

    var btn = document.getElementById('startButton'),
        btnS = document.getElementById('spectateButton'),
        nickErrorText = document.querySelector('#startMenu .input-error');

    btnS.onclick = function () {
        startGame('spectator');
    };

    btn.onclick = function () {
        // Checks if the nick is valid.
        if (validNick()) {
            nickErrorText.style.opacity = 0;
            startGame('player');
        } else {
            nickErrorText.style.opacity = 1;
        }
    };

    var settingsMenu = document.getElementById('settingsButton');
    var settings = document.getElementById('settings');

    settingsMenu.onclick = function () {
        if (settings.style.maxHeight == '300px') {
            settings.style.maxHeight = '0px';
        } else {
            settings.style.maxHeight = '300px';
        }
    };

    // Admin Panel Toggle
    var adminMenu = document.getElementById('adminButton');
    var adminPanel = document.getElementById('admin-panel');

    adminMenu.onclick = function () {
        if (adminPanel.style.maxHeight == '600px') {
            adminPanel.style.maxHeight = '0px';
        } else {
            adminPanel.style.maxHeight = '600px';
        }
    };

    // Admin Panel Functionality
    var startGameBtn = document.getElementById('start-game-btn');
    var startNowBtn = document.getElementById('start-now-btn');
    var checkStatusBtn = document.getElementById('check-game-status-btn');
    var forceEndBtn = document.getElementById('force-end-game-btn');
    var adminStatus = document.getElementById('admin-status');
    var registrationTimer = document.getElementById('registration-timer');

    // Timer variables
    var gameTimerInterval = null;
    var registrationDeadline = null;

    function updateAdminStatus(message, isError = false) {
        adminStatus.innerHTML = `<p style="color: ${isError ? '#e74c3c' : '#2ecc71'}">${message}</p>`;
    }

    function startRegistrationTimer(deadlineTimestamp) {
        registrationDeadline = deadlineTimestamp;

        // Show timer
        registrationTimer.style.display = 'block';

        // Clear any existing timer
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
        }

        gameTimerInterval = setInterval(function() {
            const now = Date.now();
            const timeLeft = registrationDeadline - now;

            if (timeLeft <= 0) {
                // Timer expired
                registrationTimer.innerHTML = `
                    <div class="timer-display">⏰ REGISTRATION CLOSED</div>
                    <p class="timer-label">Game should start automatically</p>
                `;
                clearInterval(gameTimerInterval);
                gameTimerInterval = null;

                // Auto-update status
                setTimeout(() => {
                    updateAdminStatus('🎮 Registration ended - Game starting automatically!');
                }, 1000);

                return;
            }

            // Calculate time components
            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            // Update timer display
            registrationTimer.innerHTML = `
                <div class="timer-display">${minutes}:${seconds.toString().padStart(2, '0')}</div>
                <p class="timer-label">Registration ends in</p>
            `;
        }, 1000);
    }

    function stopRegistrationTimer() {
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
            gameTimerInterval = null;
        }
        registrationTimer.style.display = 'none';
    }

    // Check if user is admin (for now, any connected wallet can be admin in mock mode)
    function isAdmin() {
        return window.connectedWallet !== null;
    }

    // Enhanced admin check for production (checks contract admin)
    async function isContractAdmin() {
        if (!window.connectedWallet) {
            return false;
        }

        try {
            // In mock mode, any connected wallet can start games
            // In production, this would check against the contract's admin address
            return window.contractConnection.isAdmin(window.connectedWallet.address);
        } catch (error) {
            console.error('Admin check failed:', error);
            return false;
        }
    }

    // Start Game Button Handler
    startGameBtn.onclick = async function () {
        // Disable button to prevent double-clicks
        startGameBtn.disabled = true;
        startGameBtn.textContent = 'Starting...';

        try {
            if (!isAdmin()) {
                updateAdminStatus('❌ Please connect wallet first to access admin functions', true);
                return;
            }

            // Get and validate form values
            const buyInAmount = parseFloat(document.getElementById('buy-in-amount').value);
            const registrationTime = parseInt(document.getElementById('registration-time').value);
            const minPlayers = parseInt(document.getElementById('min-players').value);
            const gameDuration = parseInt(document.getElementById('game-duration').value);

            // Enhanced validation
            if (isNaN(buyInAmount) || buyInAmount < 0.1 || buyInAmount > 100) {
                updateAdminStatus('❌ Buy-in amount must be between 0.1 and 100 DOT', true);
                return;
            }

            if (isNaN(registrationTime) || registrationTime < 1 || registrationTime > 60) {
                updateAdminStatus('❌ Registration time must be between 1 and 60 minutes', true);
                return;
            }

            if (isNaN(minPlayers) || minPlayers < 2 || minPlayers > 10) {
                updateAdminStatus('❌ Minimum players must be between 2 and 10', true);
                return;
            }

            if (isNaN(gameDuration) || gameDuration < 5 || gameDuration > 60) {
                updateAdminStatus('❌ Game duration must be between 5 and 60 minutes', true);
                return;
            }

            updateAdminStatus('🚀 Starting new buy-in game...');

            // Convert DOT to planck for contract call
            const buyInAmountPlanck = window.contractConnection.formatDOTToPlanck(buyInAmount);

            // Call contract to start game
            const result = await window.contractConnection.startGame(
                window.connectedWallet.address, // admin address
                buyInAmountPlanck,
                registrationTime,
                minPlayers,
                gameDuration
            );

            if (result.success) {
                updateAdminStatus(`✅ Game started! Buy-in: ${buyInAmount} DOT | Min players: ${minPlayers} | Registration: ${registrationTime}min`);

                // Start registration timer
                const registrationDeadlineMs = Date.now() + (registrationTime * 60 * 1000);
                startRegistrationTimer(registrationDeadlineMs);

                // Show start now button
                startNowBtn.style.display = 'block';

            } else {
                updateAdminStatus('❌ Game start failed - please try again', true);
            }

        } catch (error) {
            console.error('Start game error:', error);
            let errorMessage = error.message || 'Unknown error occurred';

            // Provide user-friendly error messages
            if (errorMessage.includes('connection')) {
                errorMessage = 'Connection error - please check your wallet connection';
            } else if (errorMessage.includes('insufficient')) {
                errorMessage = 'Insufficient balance to start game';
            } else if (errorMessage.includes('admin')) {
                errorMessage = 'Only contract admin can start games';
            }

            updateAdminStatus(`❌ Failed to start game: ${errorMessage}`, true);
        } finally {
            // Re-enable button
            startGameBtn.disabled = false;
            startGameBtn.textContent = '🚀 Start Buy-in Game';
        }
    };

    // Start Now Button Handler
    startNowBtn.onclick = async function () {
        if (!isAdmin()) {
            updateAdminStatus('❌ Only admin can start game immediately', true);
            return;
        }

        if (!confirm('Start the game immediately? This will end registration early.')) {
            return;
        }

        try {
            startNowBtn.disabled = true;
            startNowBtn.textContent = 'Starting...';

            updateAdminStatus('⚡ Starting game immediately...');

            // Call contract to start immediately
            const result = await window.contractConnection.startGameNow(window.connectedWallet.address);

            // Stop registration timer
            stopRegistrationTimer();

            if (result.success) {
                updateAdminStatus('🎮 Game started immediately! Registration ended early.');
                startNowBtn.style.display = 'none';
            } else {
                updateAdminStatus('❌ Failed to start game immediately', true);
            }

        } catch (error) {
            console.error('Start now error:', error);
            updateAdminStatus(`❌ Failed to start immediately: ${error.message}`, true);
        } finally {
            startNowBtn.disabled = false;
            startNowBtn.textContent = '⚡ Start Game Now';
        }
    };

    // Return to Menu Button Handler
    var returnMenuBtn = document.getElementById('return-menu-btn');

    returnMenuBtn.onclick = function () {
        if (confirm('Return to main menu? This will leave the current game.')) {
            // Stop any timers
            stopRegistrationTimer();

            // Hide game area and show menu
            document.getElementById('gameAreaWrapper').style.opacity = 0;
            document.getElementById('startMenuWrapper').style.maxHeight = '1000px';

            // Hide return button
            returnMenuBtn.style.display = 'none';

            // Reset admin panel state
            startNowBtn.style.display = 'none';
            updateAdminStatus('Ready to configure new game');

            // Stop game animation loop if running
            if (global.animLoopHandle) {
                window.cancelAnimationFrame(global.animLoopHandle);
                global.animLoopHandle = undefined;
            }

            // Disconnect socket if connected
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        }
    };

    // Check Status Button Handler
    checkStatusBtn.onclick = async function () {
        try {
            updateAdminStatus('📊 Checking game status...');

            const gameState = await window.contractConnection.getGameState();
            const playerCount = await window.contractConnection.getPlayerCount();
            const prizePool = await window.contractConnection.getPrizePool();
            const prizePoolDOT = window.contractConnection.formatBalanceToDOT(prizePool);

            updateAdminStatus(`📊 Game: ${gameState} | Players: ${playerCount} | Prize Pool: ${prizePoolDOT} DOT`);

        } catch (error) {
            console.error('Check status error:', error);
            updateAdminStatus(`❌ Failed to check status: ${error.message}`, true);
        }
    };

    // Force End Game Button Handler
    forceEndBtn.onclick = async function () {
        if (!isAdmin()) {
            updateAdminStatus('❌ Only admin can force end games', true);
            return;
        }

        if (!confirm('Are you sure you want to force end the current game? This action cannot be undone.')) {
            return;
        }

        try {
            updateAdminStatus('⚠️ Force ending game...');

            const result = await window.contractConnection.forceEndGame(window.connectedWallet.address);

            updateAdminStatus('✅ Game force ended successfully');

        } catch (error) {
            console.error('Force end error:', error);
            updateAdminStatus(`❌ Failed to force end game: ${error.message}`, true);
        }
    };

    playerNameInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;

        if (key === global.KEY_ENTER) {
            if (validNick()) {
                nickErrorText.style.opacity = 0;
                startGame('player');
            } else {
                nickErrorText.style.opacity = 1;
            }
        }
    });
};

// TODO: Break out into GameControls.

var playerConfig = {
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
    defaultSize: 30
};

var player = {
    id: -1,
    x: global.screen.width / 2,
    y: global.screen.height / 2,
    screenWidth: global.screen.width,
    screenHeight: global.screen.height,
    target: { x: global.screen.width / 2, y: global.screen.height / 2 }
};
global.player = player;

var foods = [];
var viruses = [];
var fireFood = [];
var users = [];
var leaderboard = [];
var target = { x: player.x, y: player.y };
global.target = target;

window.canvas = new Canvas();
window.chat = new ChatClient();

var visibleBorderSetting = document.getElementById('visBord');
visibleBorderSetting.onchange = settings.toggleBorder;

var showMassSetting = document.getElementById('showMass');
showMassSetting.onchange = settings.toggleMass;

var continuitySetting = document.getElementById('continuity');
// continuitySetting.onchange = settings.toggleContinuity;

var roundFoodSetting = document.getElementById('roundFood');
// roundFoodSetting.onchange = settings.toggleRoundFood;

var darkModeSetting = document.getElementById('darkMode');
if (darkModeSetting) {
    darkModeSetting.onchange = settings.toggleDarkMode;
}

var c = window.canvas.cv;
var graph = c.getContext('2d');

$("#feed").click(function () {
    socket.emit('1');
    window.canvas.reenviar = false;
});

$("#split").click(function () {
    socket.emit('2');
    window.canvas.reenviar = false;
});

function handleDisconnect() {
    if (socket) {
        socket.close();
    }
    if (!global.kicked) { // We have a more specific error message
        render.drawErrorMessage('Disconnected!', graph, global.screen);
    }
}

// Enhanced error handling for Chrome debugging
function handleConnectionError(error) {
    console.error('Socket.io connection error:', error);
    let errorMessage = 'Connection failed!';

    // Provide specific error messages for common Chrome issues
    if (error.message && error.message.includes('websocket')) {
        errorMessage = 'WebSocket connection failed. Try refreshing the page.';
    } else if (error.type === 'TransportError') {
        errorMessage = 'Network connection failed. Check your internet connection.';
    } else if (error.description && error.description.includes('xhr')) {
        errorMessage = 'Connection blocked. Try disabling ad blockers or VPN.';
    }

    render.drawErrorMessage(errorMessage, graph, global.screen);
}

// socket stuff.
function setupSocket(socket) {
    // Handle ping.
    socket.on('pongcheck', function () {
        var latency = Date.now() - global.startPingTime;
        debug('Latency: ' + latency + 'ms');
        window.chat.addSystemLine('Ping: ' + latency + 'ms');
    });

    // Handle error.
    socket.on('connect_error', handleConnectionError);
    socket.on('disconnect', handleDisconnect);

    // Handle connection.
    socket.on('welcome', function (playerSettings, gameSizes) {
        player = playerSettings;
        player.name = global.playerName;
        player.screenWidth = global.screen.width;
        player.screenHeight = global.screen.height;
        player.target = window.canvas.target;

        // Include wallet address if available
        if (window.connectedWallet) {
            player.walletAddress = window.connectedWallet.address;
            console.log('Adding wallet address to player object:', player.walletAddress);
        }

        global.player = player;
        window.chat.player = player;
        socket.emit('gotit', player);
        global.gameStart = true;
        window.chat.addSystemLine('Connected to the game!');
        window.chat.addSystemLine('Type <b>-help</b> for a list of commands.');
        if (global.mobile) {
            document.getElementById('gameAreaWrapper').removeChild(document.getElementById('chatbox'));
        }
        c.focus();
        global.game.width = gameSizes.width;
        global.game.height = gameSizes.height;
        resize();
    });

    socket.on('playerDied', (data) => {
        const player = isUnnamedCell(data.playerEatenName) ? 'An unnamed cell' : data.playerEatenName;
        //const killer = isUnnamedCell(data.playerWhoAtePlayerName) ? 'An unnamed cell' : data.playerWhoAtePlayerName;

        //window.chat.addSystemLine('{GAME} - <b>' + (player) + '</b> was eaten by <b>' + (killer) + '</b>');
        window.chat.addSystemLine('{GAME} - <b>' + (player) + '</b> was eaten');
    });

    socket.on('playerDisconnect', (data) => {
        window.chat.addSystemLine('{GAME} - <b>' + (isUnnamedCell(data.name) ? 'An unnamed cell' : data.name) + '</b> disconnected.');
    });

    socket.on('playerJoin', (data) => {
        window.chat.addSystemLine('{GAME} - <b>' + (isUnnamedCell(data.name) ? 'An unnamed cell' : data.name) + '</b> joined.');
    });

    socket.on('leaderboard', (data) => {
        leaderboard = data.leaderboard;
        var status = '<span class="title">Leaderboard</span>';
        for (var i = 0; i < leaderboard.length; i++) {
            status += '<br />';
            if (leaderboard[i].id == player.id) {
                if (leaderboard[i].name.length !== 0)
                    status += '<span class="me">' + (i + 1) + '. ' + leaderboard[i].name + "</span>";
                else
                    status += '<span class="me">' + (i + 1) + ". An unnamed cell</span>";
            } else {
                if (leaderboard[i].name.length !== 0)
                    status += (i + 1) + '. ' + leaderboard[i].name;
                else
                    status += (i + 1) + '. An unnamed cell';
            }
        }
        //status += '<br />Players: ' + data.players;
        document.getElementById('status').innerHTML = status;
    });

    socket.on('serverMSG', function (data) {
        window.chat.addSystemLine(data);
    });

    // Chat.
    socket.on('serverSendPlayerChat', function (data) {
        window.chat.addChatLine(data.sender, data.message, false);
    });

    // Handle movement.
    socket.on('serverTellPlayerMove', function (playerData, userData, foodsList, massList, virusList) {
        if (global.playerType == 'player') {
            player.x = playerData.x;
            player.y = playerData.y;
            player.hue = playerData.hue;
            player.massTotal = playerData.massTotal;
            player.cells = playerData.cells;
        }
        users = userData;
        foods = foodsList;
        viruses = virusList;
        fireFood = massList;
    });

    // Death.
    socket.on('RIP', function () {
        global.gameStart = false;
        render.drawErrorMessage('You died!', graph, global.screen);
        window.setTimeout(() => {
            document.getElementById('gameAreaWrapper').style.opacity = 0;
            document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
            if (global.animLoopHandle) {
                window.cancelAnimationFrame(global.animLoopHandle);
                global.animLoopHandle = undefined;
            }
        }, 2500);
    });

    socket.on('kick', function (reason) {
        global.gameStart = false;
        global.kicked = true;
        if (reason !== '') {
            render.drawErrorMessage('You were kicked for: ' + reason, graph, global.screen);
        }
        else {
            render.drawErrorMessage('You were kicked!', graph, global.screen);
        }
        socket.close();
    });
}

const isUnnamedCell = (name) => name.length < 1;

const getPosition = (entity, player, screen) => {
    return {
        x: entity.x - player.x + screen.width / 2,
        y: entity.y - player.y + screen.height / 2
    }
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelAnimFrame = (function (handle) {
    return window.cancelAnimationFrame ||
        window.mozCancelAnimationFrame;
})();

function animloop() {
    global.animLoopHandle = window.requestAnimFrame(animloop);
    gameLoop();
}

function gameLoop() {
    if (global.gameStart) {
        graph.fillStyle = global.backgroundColor;
        graph.fillRect(0, 0, global.screen.width, global.screen.height);

        render.drawGrid(global, player, global.screen, graph);
        foods.forEach(food => {
            let position = getPosition(food, player, global.screen);
            render.drawFood(position, food, graph);
        });
        fireFood.forEach(fireFood => {
            let position = getPosition(fireFood, player, global.screen);
            render.drawFireFood(position, fireFood, playerConfig, graph);
        });
        viruses.forEach(virus => {
            let position = getPosition(virus, player, global.screen);
            render.drawVirus(position, virus, graph);
        });


        let borders = { // Position of the borders on the screen
            left: global.screen.width / 2 - player.x,
            right: global.screen.width / 2 + global.game.width - player.x,
            top: global.screen.height / 2 - player.y,
            bottom: global.screen.height / 2 + global.game.height - player.y
        }
        if (global.borderDraw) {
            render.drawBorder(borders, graph);
        }

        var cellsToDraw = [];
        for (var i = 0; i < users.length; i++) {
            let color = 'hsl(' + users[i].hue + ', 100%, 50%)';
            let borderColor = 'hsl(' + users[i].hue + ', 100%, 45%)';
            for (var j = 0; j < users[i].cells.length; j++) {
                cellsToDraw.push({
                    color: color,
                    borderColor: borderColor,
                    mass: users[i].cells[j].mass,
                    name: users[i].name,
                    radius: users[i].cells[j].radius,
                    x: users[i].cells[j].x - player.x + global.screen.width / 2,
                    y: users[i].cells[j].y - player.y + global.screen.height / 2
                });
            }
        }
        cellsToDraw.sort(function (obj1, obj2) {
            return obj1.mass - obj2.mass;
        });
        render.drawCells(cellsToDraw, playerConfig, global.toggleMassState, borders, graph);

        socket.emit('0', window.canvas.target); // playerSendTarget "Heartbeat".
    }
}

window.addEventListener('resize', resize);

function resize() {
    if (!socket) return;

    player.screenWidth = c.width = global.screen.width = global.playerType == 'player' ? window.innerWidth : global.game.width;
    player.screenHeight = c.height = global.screen.height = global.playerType == 'player' ? window.innerHeight : global.game.height;

    if (global.playerType == 'spectator') {
        player.x = global.game.width / 2;
        player.y = global.game.height / 2;
    }

    socket.emit('windowResized', { screenWidth: global.screen.width, screenHeight: global.screen.height });
}

// Make contract connection available globally for console testing
window.contractConnection = contractConnection;

// Test contract connection on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 Agario Game Loading...');

    // Initialize contract connection (mock mode)
    try {
        await contractConnection.connect('ws://localhost:9944'); // Mock connection
        console.log('✅ Contract connection ready (MOCK mode)');
        console.log('💡 Use window.contractConnection in console to interact with contract');
        console.log('💡 Try: testContractConnection() or demoGameWorkflow()');
    } catch (error) {
        console.error('❌ Contract connection failed:', error.message);
    }
});
