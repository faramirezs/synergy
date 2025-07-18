/**
 * Contract Deployment Configuration
 * Manages compiled smart contract deployment and integration
 */

// Mock contract address for demo purposes
export const MOCK_CONTRACT_ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

// Contract metadata from compiled agario_buyin.json
export const CONTRACT_METADATA = {
  source: {
    hash: "0x6ece97a2072795578025141bb4f05a18199e0ee9acc32a4ee392433b71f98de2",
    language: "ink! 5.1.1",
    compiler: "rustc 1.88.0"
  },
  contract: {
    name: "agario_buyin",
    version: "0.1.0"
  },
  
  // Key contract functions
  functions: {
    // Constructor
    new: {
      selector: "0x9bae9d5e",
      args: [{ name: "admin_fee", type: "u8" }],
      payable: false
    },
    
    // Main game functions
    create_game: {
      selector: "0x1234abcd", // Mock selector
      args: [
        { name: "buy_in_amount", type: "u128" },
        { name: "max_players", type: "u32" },
        { name: "game_duration", type: "u64" }
      ],
      payable: true
    },
    
    join_game: {
      selector: "0x5678efgh", // Mock selector
      args: [{ name: "game_id", type: "u32" }],
      payable: true
    },
    
    end_game: {
      selector: "0x9012ijkl", // Mock selector
      args: [
        { name: "game_id", type: "u32" },
        { name: "winner", type: "AccountId" }
      ],
      payable: false
    },
    
    get_game_state: {
      selector: "0x3456mnop", // Mock selector
      args: [{ name: "game_id", type: "u32" }],
      payable: false
    },
    
    withdraw_winnings: {
      selector: "0x7890qrst", // Mock selector
      args: [{ name: "game_id", type: "u32" }],
      payable: false
    }
  }
};

// Mock deployment simulation
export class MockContractDeployment {
  constructor() {
    this.isDeployed = false;
    this.contractAddress = null;
    this.games = new Map();
    this.nextGameId = 1;
  }

  async deploy(adminFee = 5) {
    // Simulate deployment delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.isDeployed = true;
    this.contractAddress = MOCK_CONTRACT_ADDRESS;
    this.adminFee = adminFee;
    
    console.log('🚀 Contract deployed successfully!');
    console.log('📍 Contract Address:', this.contractAddress);
    console.log('💰 Admin Fee:', adminFee + '%');
    
    return {
      success: true,
      contractAddress: this.contractAddress,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
  }

  async createGame(buyInAmount, maxPlayers, gameDuration) {
    if (!this.isDeployed) {
      throw new Error('Contract not deployed');
    }

    const gameId = this.nextGameId++;
    const game = {
      id: gameId,
      buyInAmount,
      maxPlayers,
      gameDuration,
      state: 'WaitingForPlayers',
      players: [],
      createdAt: Date.now(),
      prize: 0n
    };

    this.games.set(gameId, game);
    
    console.log(`🎮 Game ${gameId} created with ${buyInAmount} buy-in`);
    
    return {
      success: true,
      gameId,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
  }

  async joinGame(gameId, player, amount) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.state !== 'WaitingForPlayers') {
      throw new Error('Game not accepting players');
    }

    if (game.players.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    if (amount < game.buyInAmount) {
      throw new Error('Insufficient buy-in amount');
    }

    game.players.push({
      address: player,
      joinedAt: Date.now(),
      amount
    });

    game.prize += BigInt(amount);

    // Start game if full
    if (game.players.length === game.maxPlayers) {
      game.state = 'InProgress';
      game.startedAt = Date.now();
    }

    console.log(`👤 Player ${player} joined game ${gameId}`);
    console.log(`💰 Current prize pool: ${game.prize}`);

    return {
      success: true,
      gameState: game.state,
      playerCount: game.players.length,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
  }

  async endGame(gameId, winner) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.state !== 'InProgress') {
      throw new Error('Game not in progress');
    }

    const adminFeeAmount = game.prize * BigInt(this.adminFee) / 100n;
    const winnerAmount = game.prize - adminFeeAmount;

    game.state = 'Finished';
    game.winner = winner;
    game.finishedAt = Date.now();
    game.winnerAmount = winnerAmount;
    game.adminFeeAmount = adminFeeAmount;

    console.log(`🏆 Game ${gameId} ended! Winner: ${winner}`);
    console.log(`💰 Winner prize: ${winnerAmount} (${adminFeeAmount} admin fee)`);

    return {
      success: true,
      winner,
      winnerAmount,
      adminFeeAmount,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
  }

  async getGameState(gameId) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    return {
      success: true,
      game: { ...game }
    };
  }

  async withdrawWinnings(gameId, player) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.state !== 'Finished') {
      throw new Error('Game not finished');
    }

    if (game.winner !== player) {
      throw new Error('Not the winner');
    }

    if (game.withdrawn) {
      throw new Error('Already withdrawn');
    }

    game.withdrawn = true;
    game.withdrawnAt = Date.now();

    console.log(`💸 Player ${player} withdrew ${game.winnerAmount} from game ${gameId}`);

    return {
      success: true,
      amount: game.winnerAmount,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
  }

  getAllGames() {
    return Array.from(this.games.values());
  }

  getActiveGames() {
    return Array.from(this.games.values()).filter(
      game => game.state === 'WaitingForPlayers' || game.state === 'InProgress'
    );
  }
}

// Global mock contract instance
export const mockContract = new MockContractDeployment();

// Auto-deploy on module load for demo
mockContract.deploy().then(() => {
  console.log('✅ Mock contract deployment complete');
}).catch(console.error);
