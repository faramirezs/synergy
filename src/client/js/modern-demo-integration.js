// Main Demo Integration - Modern PAPI SDK Integration for Agario Buyin
// Comprehensive integration using modern @polkadot-api/sdk-ink with full type safety

import { papiService } from './papi-service.js';
import { localSigners } from './signers.js';
import ModernContractService from './contract-service.js';
import ModernEventMonitor from './event-monitor.js';

// Global state management
class DemoIntegration {
  constructor() {
    this.contractService = null;
    this.eventMonitor = null;
    this.currentSigner = null;
    this.currentAccount = null;
    this.gameState = {};
    this.isInitialized = false;
    this.contractAddress = "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc"; // Mock address for MVP
    
    // Bind methods to preserve 'this' context
    this.handleGameStateUpdate = this.handleGameStateUpdate.bind(this);
    this.handleGameEvents = this.handleGameEvents.bind(this);
  }

  // ==================== INITIALIZATION ====================

  async initialize() {
    if (this.isInitialized) {
      console.log("✅ Demo integration already initialized");
      return;
    }

    try {
      console.log("🚀 Initializing demo integration...");
      
      // Setup UI event handlers first
      this.setupUIEventHandlers();
      
      // Connect to PAPI
      await papiService.connect();
      console.log("✅ PAPI connected");

      // Initialize contract service with mock support
      const contractSdk = papiService.getContractSdk();
      this.contractService = new ModernContractService(contractSdk, this.contractAddress);
      
      // Verify contract compatibility (will use mock if real contract unavailable)
      await this.contractService.verifyCompatibility();
      console.log("✅ Contract service initialized (mock mode enabled)");

      // Initialize event monitoring
      const typedApi = papiService.getTypedApi();
      this.eventMonitor = new ModernEventMonitor(typedApi, this.contractService);
      
      // Setup event handlers
      this.setupEventHandlers();
      
      // Start event monitoring
      await this.eventMonitor.startListening();
      console.log("✅ Event monitoring started");

      // Auto-map accounts for H160 usage
      await localSigners.ensureAccountsMapped(papiService);
      console.log("✅ Accounts mapped for H160 usage");

      // Populate account selector
      this.populateAccountSelector();
      
      // Initialize UI state
      this.updateConnectionStatus(true);
      
      this.isInitialized = true;
      console.log("🎉 Demo integration initialized successfully!");
      
      // Initial state fetch
      await this.refreshGameState();
      
    } catch (error) {
      console.error("❌ Failed to initialize demo integration:", error);
      this.showError("Failed to initialize: " + error.message);
      throw error;
    }
  }

  // ==================== UI EVENT HANDLERS ====================

  setupUIEventHandlers() {
    console.log("🎮 Setting up UI event handlers...");

    // Account selection
    const accountSelect = document.getElementById('account-select');
    if (accountSelect) {
      accountSelect.addEventListener('change', (e) => {
        this.handleAccountChange(e.target.value);
      });
    }

    // Connection buttons
    const connectBtn = document.getElementById('connect-modern-wallet');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => {
        this.handleConnect();
      });
    }

    const disconnectBtn = document.getElementById('disconnect-wallet');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        this.handleDisconnect();
      });
    }

    // Admin controls
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
      startGameBtn.addEventListener('click', () => {
        this.handleStartGame();
      });
    }

    const dryRunStartBtn = document.getElementById('dry-run-start');
    if (dryRunStartBtn) {
      dryRunStartBtn.addEventListener('click', () => {
        this.handleDryRunStart();
      });
    }

    const forceEndBtn = document.getElementById('force-end-game');
    if (forceEndBtn) {
      forceEndBtn.addEventListener('click', () => {
        this.handleForceEndGame();
      });
    }

    const refreshBtn = document.getElementById('refresh-state');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshGameState();
      });
    }

    // Player controls
    const joinGameBtn = document.getElementById('join-game');
    if (joinGameBtn) {
      joinGameBtn.addEventListener('click', () => {
        this.handleJoinGame();
      });
    }

    const dryRunJoinBtn = document.getElementById('dry-run-join');
    if (dryRunJoinBtn) {
      dryRunJoinBtn.addEventListener('click', () => {
        this.handleDryRunJoin();
      });
    }

    // Winner submission
    const submitWinnersBtn = document.getElementById('submit-winners');
    if (submitWinnersBtn) {
      submitWinnersBtn.addEventListener('click', () => {
        this.handleSubmitWinners();
      });
    }

    // Event log controls
    const clearEventsBtn = document.getElementById('clear-events');
    if (clearEventsBtn) {
      clearEventsBtn.addEventListener('click', () => {
        this.clearEventLog();
      });
    }

    // No time limit checkbox
    const noTimeLimitCheck = document.getElementById('no-time-limit');
    if (noTimeLimitCheck) {
      noTimeLimitCheck.addEventListener('change', (e) => {
        const gameDurationInput = document.getElementById('game-duration');
        if (gameDurationInput) {
          gameDurationInput.disabled = e.target.checked;
        }
      });
    }

    console.log("✅ UI event handlers setup complete");
  }

  setupEventHandlers() {
    console.log("📡 Setting up contract event handlers...");

    // Game state updates
    this.eventMonitor.on('stateUpdate', this.handleGameStateUpdate);
    this.eventMonitor.on('stateChange', this.handleGameEvents);

    // Specific game events
    this.eventMonitor.on('GameStarted', (data) => {
      this.logEvent('Game Started', 'Registration is now open!', 'success');
      this.showNotification('🚀 Game Started! Registration is now open.', 'success');
    });

    this.eventMonitor.on('PlayerJoined', (data) => {
      this.logEvent('Player Joined', `Player count: ${data.newPlayerCount}`, 'info');
      this.showNotification(`👤 New player joined! Total: ${data.newPlayerCount}`, 'info');
    });

    this.eventMonitor.on('GameBegan', (data) => {
      this.logEvent('Game Began', 'The game has started!', 'success');
      this.showNotification('🎮 Game has begun!', 'success');
    });

    this.eventMonitor.on('GameTimeExpired', (data) => {
      this.logEvent('Game Time Expired', 'Time limit reached!', 'warning');
      this.showNotification('⏰ Game time expired!', 'warning');
    });

    this.eventMonitor.on('GameEnded', (data) => {
      this.logEvent('Game Ended', 'Waiting for results...', 'info');
      this.showNotification('🏁 Game ended, waiting for results...', 'info');
    });

    this.eventMonitor.on('GameReset', (data) => {
      this.logEvent('Game Reset', 'Ready for next game', 'info');
      this.showNotification('🔄 Game reset, ready for next round!', 'info');
    });

    // Timer updates
    this.eventMonitor.on('timerTick', () => {
      this.updateTimers();
    });

    // Error handling
    this.eventMonitor.on('error', (error) => {
      console.error('Event monitor error:', error);
      this.showError('Event monitoring error: ' + error.error?.message);
    });

    console.log("✅ Event handlers setup complete");
  }

  // ==================== ACCOUNT MANAGEMENT ====================

  populateAccountSelector() {
    const accountSelect = document.getElementById('account-select');
    if (!accountSelect) return;

    const accounts = localSigners.getAllAccounts();
    
    // Clear existing options (except first one)
    while (accountSelect.children.length > 1) {
      accountSelect.removeChild(accountSelect.lastChild);
    }

    // Add account options
    accounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.name;
      option.textContent = `${account.name} (${account.role})`;
      accountSelect.appendChild(option);
    });

    console.log("✅ Account selector populated");
  }

  handleAccountChange(accountName) {
    if (!accountName) {
      this.currentSigner = null;
      this.currentAccount = null;
      this.updateWalletInfo(null);
      return;
    }

    try {
      const accountInfo = localSigners.getSignerInfo(accountName);
      if (accountInfo) {
        this.currentSigner = accountInfo.signer;
        this.currentAccount = accountInfo;
        
        console.log("👤 Account selected:", accountInfo);
        this.updateWalletInfo(accountInfo);
        this.updateUIForAccount(accountInfo);
        
        // Check if player is registered for current game
        this.checkPlayerRegistration();
      }
    } catch (error) {
      console.error("❌ Error selecting account:", error);
      this.showError("Failed to select account: " + error.message);
    }
  }

  async checkPlayerRegistration() {
    if (!this.currentAccount || !this.contractService) return;

    try {
      const isRegistered = await this.contractService.isPlayerRegistered(this.currentAccount.address);
      this.updatePlayerRegistrationStatus(isRegistered);
    } catch (error) {
      console.error("❌ Error checking player registration:", error);
    }
  }

  updatePlayerRegistrationStatus(isRegistered) {
    const statusElement = document.getElementById('player-registered-status');
    if (statusElement) {
      statusElement.textContent = isRegistered ? 'Registered' : 'Not Registered';
      statusElement.className = isRegistered ? 'registered' : 'not-registered';
    }

    const joinGameBtn = document.getElementById('join-game');
    const playerStatus = document.getElementById('player-status');
    
    if (isRegistered) {
      if (joinGameBtn) joinGameBtn.style.display = 'none';
      if (playerStatus) playerStatus.style.display = 'block';
    } else {
      if (joinGameBtn && this.gameState.gameState === 'AcceptingDeposits') {
        joinGameBtn.style.display = 'block';
      }
      if (playerStatus) playerStatus.style.display = 'none';
    }
  }

  // ==================== CONNECTION MANAGEMENT ====================

  async handleConnect() {
    try {
      await this.initialize();
      this.showNotification('✅ Connected to modern PAPI SDK!', 'success');
    } catch (error) {
      this.showError('Failed to connect: ' + error.message);
    }
  }

  async handleDisconnect() {
    try {
      if (this.eventMonitor) {
        this.eventMonitor.stopListening();
      }
      
      await papiService.disconnect();
      
      this.contractService = null;
      this.eventMonitor = null;
      this.currentSigner = null;
      this.currentAccount = null;
      this.isInitialized = false;
      
      this.updateConnectionStatus(false);
      this.showNotification('🔌 Disconnected from PAPI', 'info');
    } catch (error) {
      this.showError('Error during disconnect: ' + error.message);
    }
  }

  // ==================== GAME CONTROL HANDLERS ====================

  async handleStartGame() {
    if (!this.currentSigner) {
      this.showError('Please select an account first');
      return;
    }

    if (this.currentAccount.role !== 'Admin') {
      this.showError('Only admin can start games');
      return;
    }

    try {
      const buyInAmount = document.getElementById('buy-in-amount').value || '1000000000000';
      const registrationMinutes = parseInt(document.getElementById('registration-minutes').value) || 5;
      const minPlayers = parseInt(document.getElementById('min-players').value) || 2;
      const noTimeLimit = document.getElementById('no-time-limit').checked;
      const gameDurationMinutes = noTimeLimit ? null : (parseInt(document.getElementById('game-duration').value) || 3);

      console.log("🚀 Starting game with params:", {
        buyInAmount,
        registrationMinutes,
        minPlayers,
        gameDurationMinutes
      });

      this.showNotification('🚀 Starting game...', 'info');

      const result = await this.contractService.startGame(
        this.currentSigner,
        parseInt(buyInAmount),
        registrationMinutes,
        minPlayers,
        gameDurationMinutes
      );

      this.logEvent('Game Started', 'Admin started new game', 'success');
      this.showNotification('✅ Game started successfully!', 'success');
      
      // Refresh state
      await this.refreshGameState();
      
    } catch (error) {
      console.error("❌ Start game error:", error);
      this.showError('Failed to start game: ' + error.message);
    }
  }

  async handleDryRunStart() {
    if (!this.currentAccount) {
      this.showError('Please select an account first');
      return;
    }

    try {
      const buyInAmount = document.getElementById('buy-in-amount').value || '1000000000000';
      const registrationMinutes = parseInt(document.getElementById('registration-minutes').value) || 5;
      const minPlayers = parseInt(document.getElementById('min-players').value) || 2;
      const noTimeLimit = document.getElementById('no-time-limit').checked;
      const gameDurationMinutes = noTimeLimit ? null : (parseInt(document.getElementById('game-duration').value) || 3);

      console.log("🧪 Dry run start game...");

      const result = await this.contractService.dryRunStartGame(
        this.currentAccount.address,
        parseInt(buyInAmount),
        registrationMinutes,
        minPlayers,
        gameDurationMinutes
      );

      if (result.success) {
        this.showNotification(`✅ Dry run successful! Gas required: ${result.gasRequired}`, 'success');
      } else {
        this.showError(`❌ Dry run failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error("❌ Dry run error:", error);
      this.showError('Dry run error: ' + error.message);
    }
  }

  async handleJoinGame() {
    if (!this.currentSigner) {
      this.showError('Please select an account first');
      return;
    }

    try {
      console.log("💰 Player joining game...");

      const buyInAmount = this.gameState.buyInAmount || 1000000000000;
      
      this.showNotification('💰 Joining game...', 'info');

      const result = await this.contractService.deposit(this.currentSigner, buyInAmount);

      this.logEvent('Player Joined', `${this.currentAccount.name} joined the game`, 'success');
      this.showNotification('✅ Successfully joined the game!', 'success');
      
      // Refresh state
      await this.refreshGameState();
      
    } catch (error) {
      console.error("❌ Join game error:", error);
      this.showError('Failed to join game: ' + error.message);
    }
  }

  async handleDryRunJoin() {
    if (!this.currentAccount) {
      this.showError('Please select an account first');
      return;
    }

    try {
      console.log("🧪 Dry run join game...");

      const buyInAmount = this.gameState.buyInAmount || 1000000000000;
      
      const result = await this.contractService.dryRunDeposit(this.currentAccount.address, buyInAmount);

      if (result.success && result.wouldSucceed) {
        this.showNotification(`✅ Can join game! Gas required: ${result.gasRequired}`, 'success');
      } else {
        this.showError(`❌ Cannot join game: ${result.error}`);
      }
      
    } catch (error) {
      console.error("❌ Dry run join error:", error);
      this.showError('Dry run error: ' + error.message);
    }
  }

  async handleForceEndGame() {
    if (!this.currentSigner || this.currentAccount.role !== 'Admin') {
      this.showError('Only admin can force end games');
      return;
    }

    try {
      console.log("⚠️ Force ending game...");

      this.showNotification('⚠️ Force ending game...', 'warning');

      const result = await this.contractService.forceEndGame(this.currentSigner);

      this.logEvent('Game Force Ended', 'Admin force ended the game', 'warning');
      this.showNotification('⚠️ Game force ended', 'warning');
      
      // Refresh state
      await this.refreshGameState();
      
    } catch (error) {
      console.error("❌ Force end error:", error);
      this.showError('Failed to force end game: ' + error.message);
    }
  }

  async handleSubmitWinners() {
    if (!this.currentSigner || this.currentAccount.role !== 'Admin') {
      this.showError('Only admin can submit winners');
      return;
    }

    try {
      // Collect winner data from UI
      const winnerEntries = document.querySelectorAll('.winner-entry');
      const winners = [];
      const percentages = [];

      winnerEntries.forEach(entry => {
        const addressSelect = entry.querySelector('.winner-address');
        const percentageInput = entry.querySelector('.winner-percentage');
        
        if (addressSelect.value && percentageInput.value) {
          winners.push(addressSelect.value);
          percentages.push(parseInt(percentageInput.value));
        }
      });

      if (winners.length === 0) {
        this.showError('Please add at least one winner');
        return;
      }

      console.log("🏆 Submitting winners:", { winners, percentages });

      this.showNotification('🏆 Submitting winners...', 'info');

      const result = await this.contractService.submitWinners(this.currentSigner, winners, percentages);

      this.logEvent('Winners Submitted', `${winners.length} winners, ${percentages.reduce((a, b) => a + b, 0)}% distributed`, 'success');
      this.showNotification('✅ Winners submitted and prizes distributed!', 'success');
      
      // Refresh state
      await this.refreshGameState();
      
    } catch (error) {
      console.error("❌ Submit winners error:", error);
      this.showError('Failed to submit winners: ' + error.message);
    }
  }

  // ==================== STATE MANAGEMENT ====================

  async refreshGameState() {
    if (!this.contractService) return;

    try {
      console.log("🔄 Refreshing game state...");
      const gameInfo = await this.contractService.getFullGameInfo();
      this.gameState = gameInfo;
      this.updateGameUI(gameInfo);
      
      // Check player registration if account selected
      if (this.currentAccount) {
        await this.checkPlayerRegistration();
      }
      
    } catch (error) {
      console.error("❌ Error refreshing game state:", error);
    }
  }

  handleGameStateUpdate(data) {
    console.log("📊 Game state update received:", data);
    this.gameState = data;
    this.updateGameUI(data);
  }

  handleGameEvents(data) {
    console.log("🎮 Game event received:", data);
    this.logEvent(data.type, JSON.stringify(data), 'info');
  }

  // ==================== UI UPDATES ====================

  updateConnectionStatus(connected) {
    const connectBtn = document.getElementById('connect-modern-wallet');
    const disconnectBtn = document.getElementById('disconnect-wallet');
    const walletInfo = document.getElementById('wallet-info');

    if (connected) {
      if (connectBtn) connectBtn.style.display = 'none';
      if (disconnectBtn) disconnectBtn.style.display = 'block';
      if (walletInfo) walletInfo.style.display = 'block';
    } else {
      if (connectBtn) connectBtn.style.display = 'block';
      if (disconnectBtn) disconnectBtn.style.display = 'none';
      if (walletInfo) walletInfo.style.display = 'none';
    }
  }

  updateWalletInfo(accountInfo) {
    if (!accountInfo) return;

    const nameElement = document.getElementById('current-account-name');
    const roleElement = document.getElementById('account-role');
    const addressElement = document.getElementById('account-address');
    const balanceElement = document.getElementById('account-balance');

    if (nameElement) nameElement.textContent = accountInfo.name;
    if (roleElement) roleElement.textContent = accountInfo.role;
    if (addressElement) addressElement.textContent = accountInfo.address;
    if (balanceElement) balanceElement.textContent = accountInfo.balance;
  }

  updateUIForAccount(accountInfo) {
    const adminPanel = document.getElementById('admin-panel');
    
    if (adminPanel) {
      adminPanel.style.display = accountInfo.role === 'Admin' ? 'block' : 'none';
    }
  }

  updateGameUI(gameInfo) {
    this.updateGameStatus(gameInfo);
    this.updateTimers(gameInfo);
    this.updatePlayerInfo(gameInfo);
    this.updateAdminDashboard(gameInfo);
    this.updateActionButtons(gameInfo);
  }

  updateGameStatus(gameInfo) {
    const stateElement = document.getElementById('game-state');
    const adminStateElement = document.getElementById('admin-game-state');
    const stateIndicator = document.getElementById('state-indicator');

    if (stateElement) stateElement.textContent = gameInfo.gameState;
    if (adminStateElement) adminStateElement.textContent = gameInfo.gameState;
    
    if (stateIndicator) {
      stateIndicator.className = `status-indicator ${gameInfo.gameState.toLowerCase()}`;
    }
  }

  updateTimers(gameInfo) {
    const registrationTimer = document.getElementById('registration-countdown');
    const gameTimer = document.getElementById('game-countdown');
    const adminRegTimer = document.getElementById('registration-timer');
    const adminGameTimer = document.getElementById('game-timer');

    if (registrationTimer) {
      registrationTimer.textContent = gameInfo.formatted?.registrationTimeRemaining || '--:--';
    }
    if (gameTimer) {
      gameTimer.textContent = gameInfo.formatted?.gameTimeRemaining || '--:--';
    }
    if (adminRegTimer) {
      adminRegTimer.textContent = gameInfo.formatted?.registrationTimeRemaining || '--:--';
    }
    if (adminGameTimer) {
      adminGameTimer.textContent = gameInfo.formatted?.gameTimeRemaining || '--:--';
    }

    // Show/hide timer sections based on game state
    const registrationSection = document.getElementById('registration-section');
    const gameSection = document.getElementById('game-section');

    if (registrationSection) {
      registrationSection.style.display = gameInfo.gameState === 'AcceptingDeposits' ? 'block' : 'none';
    }
    if (gameSection) {
      gameSection.style.display = gameInfo.gameState === 'InProgress' ? 'block' : 'none';
    }
  }

  updatePlayerInfo(gameInfo) {
    const playerCountElement = document.getElementById('player-count');
    const adminPlayerCountElement = document.getElementById('admin-player-count');
    const prizePoolElement = document.getElementById('prize-pool');
    const adminPrizePoolElement = document.getElementById('admin-prize-pool');
    const minPlayersDisplay = document.getElementById('min-players-display');
    const joinAmountElement = document.getElementById('join-amount');

    if (playerCountElement) playerCountElement.textContent = gameInfo.playerCount || 0;
    if (adminPlayerCountElement) {
      adminPlayerCountElement.textContent = `${gameInfo.playerCount || 0}/${gameInfo.minPlayers || 0}`;
    }
    if (prizePoolElement) prizePoolElement.textContent = gameInfo.formatted?.prizePool || '0';
    if (adminPrizePoolElement) adminPrizePoolElement.textContent = gameInfo.formatted?.prizePool || '0';
    if (minPlayersDisplay) minPlayersDisplay.textContent = gameInfo.minPlayers || 0;
    if (joinAmountElement) joinAmountElement.textContent = gameInfo.formatted?.buyInAmount || '0';
  }

  updateAdminDashboard(gameInfo) {
    const winnerSection = document.getElementById('winner-submission');
    const forceEndBtn = document.getElementById('force-end-game');

    if (winnerSection) {
      winnerSection.style.display = gameInfo.gameState === 'WaitingForResults' ? 'block' : 'none';
    }

    if (forceEndBtn) {
      const canForceEnd = gameInfo.gameState !== 'Inactive' && this.currentAccount?.role === 'Admin';
      forceEndBtn.style.display = canForceEnd ? 'block' : 'none';
    }
  }

  updateActionButtons(gameInfo) {
    const joinGameBtn = document.getElementById('join-game');
    const dryRunJoinBtn = document.getElementById('dry-run-join');

    const canJoin = gameInfo.gameState === 'AcceptingDeposits' && this.currentAccount?.role === 'Player';
    
    if (joinGameBtn) {
      joinGameBtn.style.display = canJoin ? 'block' : 'none';
    }
    if (dryRunJoinBtn) {
      dryRunJoinBtn.style.display = canJoin ? 'block' : 'none';
    }
  }

  // ==================== EVENT LOGGING ====================

  logEvent(title, message, type = 'info') {
    const eventLog = document.getElementById('event-log');
    if (!eventLog) return;

    const eventElement = document.createElement('div');
    eventElement.className = `event-entry ${type}`;
    eventElement.innerHTML = `
      <div class="event-header">
        <span class="event-title">${title}</span>
        <span class="event-time">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="event-message">${message}</div>
    `;

    // Remove placeholder if it exists
    const placeholder = eventLog.querySelector('.event-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    eventLog.insertBefore(eventElement, eventLog.firstChild);

    // Limit to 50 events
    while (eventLog.children.length > 50) {
      eventLog.removeChild(eventLog.lastChild);
    }
  }

  clearEventLog() {
    const eventLog = document.getElementById('event-log');
    if (eventLog) {
      eventLog.innerHTML = '<p class="event-placeholder">Event log cleared...</p>';
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(notification);
    }

    // Set colors based on type
    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196F3'
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    notification.style.opacity = '1';

    // Auto hide after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 5000);
  }

  showError(message) {
    console.error("❌ Error:", message);
    this.showNotification(message, 'error');
    this.logEvent('Error', message, 'error');
  }
}

// Create and export singleton instance
export const demoIntegration = new DemoIntegration();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 DOM loaded, demo integration ready");
  
  // Setup auto-connect button if it exists
  const autoConnectBtn = document.getElementById('auto-connect-demo');
  if (autoConnectBtn) {
    autoConnectBtn.addEventListener('click', () => {
      demoIntegration.initialize();
    });
  }
});

export default DemoIntegration;
