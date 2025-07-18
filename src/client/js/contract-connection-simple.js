// Simplified Contract Connection for Testing
// This version provides mock responses for testing the interface without requiring Polkadot API

class SimpleContractConnection {
  constructor() {
    this.contractAddress = null;
    this.isConnected = false;
    this.mockData = {
      gameState: 'Inactive',
      playerCount: 0,
      prizePool: '0',
      adminAddress: null, // Will be set when game is started
      buyInAmount: '0',
      minPlayers: 2,
      registrationDeadline: null,
      gameDuration: null,
      players: []
    };
  }

  async connect(wsUrl = 'ws://localhost:9944', contractAddress = null) {
    console.log('🔗 [MOCK] Connecting to Polkadot node...');

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (contractAddress) {
      this.contractAddress = contractAddress;
      this.isConnected = true;
      console.log('✅ [MOCK] Contract connected:', this.contractAddress);
    } else {
      console.log('⚠️ [MOCK] Connected to mock node but no contract address provided');
      this.isConnected = false;
    }

    return { success: true, api: 'mock-api', contract: 'mock-contract' };
  }

  setContractAddress(contractAddress) {
    this.contractAddress = contractAddress;
    this.isConnected = true;
    console.log('✅ [MOCK] Contract address set:', this.contractAddress);
  }

  checkConnection() {
    if (!this.isConnected) {
      throw new Error('[MOCK] Contract not connected. Call connect() first.');
    }
  }

  // Mock query functions
  async getGameState() {
    this.checkConnection();
    console.log('📊 [MOCK] Getting game state...');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('📊 Game State:', this.mockData.gameState);
    return this.mockData.gameState;
  }

  async getPlayerCount() {
    this.checkConnection();
    console.log('👥 [MOCK] Getting player count...');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('👥 Player Count:', this.mockData.playerCount);
    return this.mockData.playerCount;
  }

  async getPrizePool() {
    this.checkConnection();
    console.log('💰 [MOCK] Getting prize pool...');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('💰 Prize Pool:', this.mockData.prizePool);
    return this.mockData.prizePool;
  }

  async isPlayerRegistered(playerAddress) {
    this.checkConnection();
    console.log('🎮 [MOCK] Checking player registration:', playerAddress);
    await new Promise(resolve => setTimeout(resolve, 200));
    const isRegistered = false; // Mock: no players registered initially
    console.log('🎮 Player registered:', playerAddress, '→', isRegistered);
    return isRegistered;
  }

  // Mock transaction functions
  async startGame(signer, buyInAmount, registrationMinutes, minPlayers, gameDurationMinutes = null) {
    this.checkConnection();
    console.log('🚀 [MOCK] Starting game with params:', {
      admin: signer,
      buyInAmount,
      registrationMinutes,
      minPlayers,
      gameDurationMinutes
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update mock state
    this.mockData.gameState = 'AcceptingDeposits';
    this.mockData.adminAddress = signer;
    this.mockData.buyInAmount = buyInAmount;
    this.mockData.minPlayers = minPlayers;
    this.mockData.registrationDeadline = Date.now() + (registrationMinutes * 60 * 1000);
    this.mockData.gameDuration = gameDurationMinutes;
    this.mockData.playerCount = 0;
    this.mockData.prizePool = '0';
    this.mockData.players = [];

    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    console.log('✅ [MOCK] Start game transaction submitted:', txHash);
    console.log('🎭 [MOCK] Game state updated:', this.mockData);
    return { success: true, txHash };
  }

  async deposit(signer, amount) {
    this.checkConnection();
    console.log('💰 [MOCK] Depositing to join game:', amount);

    await new Promise(resolve => setTimeout(resolve, 800));

    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    console.log('✅ [MOCK] Deposit transaction submitted:', txHash);
    return { success: true, txHash };
  }

  // Helper function to check if an address is the admin
  isAdmin(address) {
    if (!this.mockData.adminAddress) {
      return false; // No game started yet
    }
    return this.mockData.adminAddress === address;
  }

  // Immediate start game function
  async startGameNow(signer) {
    this.checkConnection();
    console.log('⚡ [MOCK] Starting game immediately:', signer);

    if (!this.isAdmin(signer)) {
      throw new Error('Only admin can start game immediately');
    }

    if (this.mockData.gameState !== 'AcceptingDeposits') {
      throw new Error('No game in registration phase to start');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Update mock state to active game
    this.mockData.gameState = 'Active';
    this.mockData.registrationDeadline = Date.now(); // Set to now

    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    console.log('✅ [MOCK] Game started immediately:', txHash);
    console.log('🎭 [MOCK] Game state updated:', this.mockData);
    return { success: true, txHash };
  }

  // Get detailed game info for admin panel
  async getGameInfo() {
    this.checkConnection();
    console.log('📋 [MOCK] Getting detailed game info...');

    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      gameState: this.mockData.gameState,
      adminAddress: this.mockData.adminAddress,
      buyInAmount: this.mockData.buyInAmount,
      minPlayers: this.mockData.minPlayers,
      playerCount: this.mockData.playerCount,
      prizePool: this.mockData.prizePool,
      registrationDeadline: this.mockData.registrationDeadline,
      gameDuration: this.mockData.gameDuration,
      players: this.mockData.players
    };
  }

  async submitWinners(signer, winners, percentages, reason = 'LastPlayerStanding') {
    this.checkConnection();
    console.log('🏆 [MOCK] Submitting winners:', { winners, percentages, reason });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update mock state
    this.mockData.gameState = 'Inactive';
    this.mockData.playerCount = 0;
    this.mockData.prizePool = '0';

    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    console.log('✅ [MOCK] Submit winners transaction submitted:', txHash);
    return { success: true, txHash };
  }

  async forceEndGame(signer) {
    this.checkConnection();
    console.log('⚠️ [MOCK] Force ending game...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset mock state
    this.mockData.gameState = 'Inactive';
    this.mockData.playerCount = 0;
    this.mockData.prizePool = '0';

    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    console.log('✅ [MOCK] Force end game transaction submitted:', txHash);
    return { success: true, txHash };
  }

  // Utility functions
  formatBalanceToDOT(planckAmount) {
    try {
      const planck = BigInt(planckAmount);
      const dot = Number(planck) / 1e12; // 1 DOT = 10^12 planck
      return dot.toFixed(4);
    } catch (error) {
      console.error('❌ formatBalanceToDOT error:', error);
      return '0.0000';
    }
  }

  formatDOTToPlanck(dotAmount) {
    try {
      const planck = BigInt(Math.floor(dotAmount * 1e12));
      return planck.toString();
    } catch (error) {
      console.error('❌ formatDOTToPlanck error:', error);
      return '0';
    }
  }

  async disconnect() {
    this.isConnected = false;
    console.log('🔌 [MOCK] Disconnected from mock node');
  }

  // Helper method to simulate state changes for testing
  setMockGameState(state, playerCount = 0, prizePool = '0') {
    this.mockData.gameState = state;
    this.mockData.playerCount = playerCount;
    this.mockData.prizePool = prizePool;
    console.log('🎭 [MOCK] State updated:', this.mockData);
  }
}

// Export singleton instance
const simpleContractConnection = new SimpleContractConnection();

// Export using CommonJS pattern
module.exports = simpleContractConnection;
