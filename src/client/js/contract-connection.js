// Contract Connection Service for Agario Buy-in Smart Contract
// Uses traditional @polkadot/api for maximum compatibility with existing setup

// Note: @polkadot/api modules need to be loaded from browser CDN or bundled
// These will be available as global variables if loaded via script tags

// Simplified contract metadata extracted from smart contract source
// This represents the ABI of our agario_buyin smart contract
const CONTRACT_METADATA = {
  "source": {
    "hash": "0x0",
    "language": "ink! 6.0.0-alpha",
    "compiler": "rustc 1.75.0"
  },
  "contract": {
    "name": "agario_buyin",
    "version": "0.1.0",
    "authors": ["Synergy Team"]
  },
  "spec": {
    "constructors": [
      {
        "args": [
          {
            "label": "admin_fee",
            "type": {
              "displayName": ["u8"],
              "type": 0
            }
          }
        ],
        "default": false,
        "docs": ["Constructor that initializes the contract with an admin fee percentage."],
        "label": "new",
        "payable": false,
        "returnType": {
          "displayName": ["ink_primitives", "ConstructorResult"],
          "type": 1
        },
        "selector": "0x9bae9d5e"
      }
    ],
    "docs": [],
    "environment": {
      "accountId": {
        "displayName": ["AccountId"],
        "type": 2
      },
      "balance": {
        "displayName": ["Balance"],
        "type": 3
      },
      "blockNumber": {
        "displayName": ["BlockNumber"],
        "type": 4
      },
      "chainExtension": {
        "displayName": ["ChainExtension"],
        "type": 5
      },
      "hash": {
        "displayName": ["Hash"],
        "type": 6
      },
      "maxEventTopics": 4,
      "timestamp": {
        "displayName": ["Timestamp"],
        "type": 7
      }
    },
    "events": [],
    "lang_error": {
      "displayName": ["ink", "LangError"],
      "type": 8
    },
    "messages": [
      {
        "args": [],
        "default": false,
        "docs": ["Get current game state"],
        "label": "get_game_state",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": ["Result"],
          "type": 9
        },
        "selector": "0x12345678"
      },
      {
        "args": [],
        "default": false,
        "docs": ["Get current player count"],
        "label": "get_player_count",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": ["Result"],
          "type": 10
        },
        "selector": "0x12345679"
      },
      {
        "args": [],
        "default": false,
        "docs": ["Get current prize pool"],
        "label": "get_prize_pool",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": ["Result"],
          "type": 11
        },
        "selector": "0x1234567a"
      },
      {
        "args": [
          {
            "label": "buy_in",
            "type": {
              "displayName": ["Balance"],
              "type": 3
            }
          },
          {
            "label": "registration_minutes",
            "type": {
              "displayName": ["u32"],
              "type": 12
            }
          },
          {
            "label": "min_players",
            "type": {
              "displayName": ["u32"],
              "type": 12
            }
          },
          {
            "label": "game_duration_minutes",
            "type": {
              "displayName": ["Option"],
              "type": 13
            }
          }
        ],
        "default": false,
        "docs": ["Start a new game with specified parameters (Admin only)"],
        "label": "start_game",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": ["Result"],
          "type": 14
        },
        "selector": "0x1234567b"
      },
      {
        "args": [],
        "default": false,
        "docs": ["Allow players to deposit and join the game"],
        "label": "deposit",
        "mutates": true,
        "payable": true,
        "returnType": {
          "displayName": ["Result"],
          "type": 14
        },
        "selector": "0x1234567c"
      },
      {
        "args": [
          {
            "label": "winners",
            "type": {
              "displayName": ["Vec"],
              "type": 15
            }
          },
          {
            "label": "percentages",
            "type": {
              "displayName": ["Vec"],
              "type": 16
            }
          },
          {
            "label": "reason",
            "type": {
              "displayName": ["GameEndReason"],
              "type": 17
            }
          }
        ],
        "default": false,
        "docs": ["Submit winners and distribute prizes (Admin only)"],
        "label": "submit_winners",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": ["Result"],
          "type": 14
        },
        "selector": "0x1234567d"
      },
      {
        "args": [],
        "default": false,
        "docs": ["Force end game and refund all players (Admin only)"],
        "label": "force_end_game",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": ["Result"],
          "type": 14
        },
        "selector": "0x1234567e"
      },
      {
        "args": [
          {
            "label": "player",
            "type": {
              "displayName": ["H160"],
              "type": 2
            }
          }
        ],
        "default": false,
        "docs": ["Check if a player is registered"],
        "label": "is_player_registered",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": ["Result"],
          "type": 18
        },
        "selector": "0x1234567f"
      }
    ]
  },
  "types": [
    {
      "id": 0,
      "type": {
        "def": {
          "primitive": "u8"
        }
      }
    },
    {
      "id": 1,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 19
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 8
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 19
          },
          {
            "name": "E",
            "type": 8
          }
        ],
        "path": ["Result"]
      }
    }
  ],
  "version": "4"
};

class ContractConnection {
  constructor() {
    this.api = null;
    this.contract = null;
    this.contractAddress = null; // Will be set when we get the deployed address
    this.isConnected = false;
  }

  /**
   * Connect to the Polkadot node and initialize contract instance
   * @param {string} wsUrl - WebSocket URL of the node
   * @param {string} contractAddress - Deployed contract address (H160 format)
   */
    async connect(wsUrl = 'ws://localhost:9944', contractAddress = null) {
    try {
      console.log('🔗 Connecting to Polkadot node...');

      // Check if Polkadot API is available globally
      if (typeof polkadotApi === 'undefined') {
        throw new Error('Polkadot API not loaded. Please include @polkadot/api in your HTML.');
      }

      // Connect to local node or testnet
      const { ApiPromise, WsProvider } = polkadotApi;
      const provider = new WsProvider(wsUrl);
      this.api = await ApiPromise.create({ provider });

      if (contractAddress) {
        this.contractAddress = contractAddress;

        // Initialize contract instance with our metadata
        const { ContractPromise } = polkadotApi.apiContract;
        this.contract = new ContractPromise(this.api, CONTRACT_METADATA, this.contractAddress);

        console.log('✅ Contract connected:', this.contractAddress);
        this.isConnected = true;
      } else {
        console.log('⚠️  Connected to node but no contract address provided');
        this.isConnected = false;
      }

      return { success: true, api: this.api, contract: this.contract };
    } catch (error) {
      console.error('❌ Failed to connect to contract:', error);
      throw new Error(`Contract connection failed: ${error.message}`);
    }
  }

  /**
   * Set the contract address after deployment
   * @param {string} contractAddress - Deployed contract address
   */
  setContractAddress(contractAddress) {
    this.contractAddress = contractAddress;
    if (this.api) {
      const { ContractPromise } = polkadotApi.apiContract;
      this.contract = new ContractPromise(this.api, CONTRACT_METADATA, this.contractAddress);
      this.isConnected = true;
      console.log('✅ Contract address set:', this.contractAddress);
    }
  }

  /**
   * Check if we're connected to both node and contract
   */
  checkConnection() {
    if (!this.api) {
      throw new Error('Not connected to Polkadot node. Call connect() first.');
    }
    if (!this.contract) {
      throw new Error('Contract not initialized. Set contract address first.');
    }
  }

  // =================
  // QUERY FUNCTIONS (Read-only)
  // =================

  /**
   * Get the current game state
   * @returns {Promise<string>} Game state: 'Inactive', 'AcceptingDeposits', 'InProgress', 'WaitingForResults'
   */
  async getGameState() {
    this.checkConnection();

    try {
      const { result, output } = await this.contract.query.getGameState(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Alice's address for queries
        { gasLimit: -1 }
      );

      if (result.isOk) {
        const gameState = output.toHuman();
        console.log('📊 Game State:', gameState);
        return gameState;
      } else {
        throw new Error('Query failed: ' + result.asErr.toString());
      }
    } catch (error) {
      console.error('❌ getGameState error:', error);
      throw error;
    }
  }

  /**
   * Get the current number of players
   * @returns {Promise<number>} Number of registered players
   */
  async getPlayerCount() {
    this.checkConnection();

    try {
      const { result, output } = await this.contract.query.getPlayerCount(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 }
      );

      if (result.isOk) {
        const playerCount = parseInt(output.toHuman());
        console.log('👥 Player Count:', playerCount);
        return playerCount;
      } else {
        throw new Error('Query failed: ' + result.asErr.toString());
      }
    } catch (error) {
      console.error('❌ getPlayerCount error:', error);
      return 0; // Return 0 on error for UI safety
    }
  }

  /**
   * Get the current prize pool amount
   * @returns {Promise<string>} Prize pool in planck units
   */
  async getPrizePool() {
    this.checkConnection();

    try {
      const { result, output } = await this.contract.query.getPrizePool(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 }
      );

      if (result.isOk) {
        const prizePool = output.toHuman();
        console.log('💰 Prize Pool:', prizePool);
        return prizePool;
      } else {
        throw new Error('Query failed: ' + result.asErr.toString());
      }
    } catch (error) {
      console.error('❌ getPrizePool error:', error);
      return '0'; // Return 0 on error for UI safety
    }
  }

  /**
   * Check if a player is registered for the current game
   * @param {string} playerAddress - H160 address of the player
   * @returns {Promise<boolean>} True if player is registered
   */
  async isPlayerRegistered(playerAddress) {
    this.checkConnection();

    try {
      const { result, output } = await this.contract.query.isPlayerRegistered(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 },
        playerAddress
      );

      if (result.isOk) {
        const isRegistered = output.toHuman();
        console.log('🎮 Player registered:', playerAddress, '→', isRegistered);
        return isRegistered;
      } else {
        throw new Error('Query failed: ' + result.asErr.toString());
      }
    } catch (error) {
      console.error('❌ isPlayerRegistered error:', error);
      return false; // Return false on error for UI safety
    }
  }

  // =================
  // TRANSACTION FUNCTIONS (State-changing)
  // =================

  /**
   * Start a new game (Admin only)
   * @param {Object} signer - Account object from Polkadot.js extension
   * @param {string} buyInAmount - Buy-in amount in planck units
   * @param {number} registrationMinutes - Registration period in minutes
   * @param {number} minPlayers - Minimum number of players required
   * @param {number|null} gameDurationMinutes - Game duration in minutes (null for no limit)
   * @returns {Promise<Object>} Transaction result
   */
  async startGame(signer, buyInAmount, registrationMinutes, minPlayers, gameDurationMinutes = null) {
    this.checkConnection();

    try {
      console.log('🚀 Starting game:', {
        buyInAmount,
        registrationMinutes,
        minPlayers,
        gameDurationMinutes
      });

      const tx = this.contract.tx.startGame(
        { gasLimit: -1 },
        buyInAmount,
        registrationMinutes,
        minPlayers,
        gameDurationMinutes
      );

      const result = await tx.signAndSend(signer);

      console.log('✅ Start game transaction submitted:', result.toString());
      return { success: true, txHash: result.toString() };
    } catch (error) {
      console.error('❌ startGame error:', error);
      throw new Error(`Failed to start game: ${error.message}`);
    }
  }

  /**
   * Deposit buy-in amount to join the game
   * @param {Object} signer - Account object from Polkadot.js extension
   * @param {string} amount - Amount to deposit in planck units
   * @returns {Promise<Object>} Transaction result
   */
  async deposit(signer, amount) {
    this.checkConnection();

    try {
      console.log('💰 Depositing to join game:', amount);

      const tx = this.contract.tx.deposit(
        { gasLimit: -1, value: amount }
      );

      const result = await tx.signAndSend(signer);

      console.log('✅ Deposit transaction submitted:', result.toString());
      return { success: true, txHash: result.toString() };
    } catch (error) {
      console.error('❌ deposit error:', error);
      throw new Error(`Failed to deposit: ${error.message}`);
    }
  }

  /**
   * Submit winners and distribute prizes (Admin only)
   * @param {Object} signer - Admin account object
   * @param {Array<string>} winners - Array of winner H160 addresses
   * @param {Array<number>} percentages - Array of prize percentages (must sum to 100)
   * @param {string} reason - Game end reason: 'TimeLimit', 'LastPlayerStanding', 'AdminForced'
   * @returns {Promise<Object>} Transaction result
   */
  async submitWinners(signer, winners, percentages, reason = 'LastPlayerStanding') {
    this.checkConnection();

    try {
      console.log('🏆 Submitting winners:', { winners, percentages, reason });

      const tx = this.contract.tx.submitWinners(
        { gasLimit: -1 },
        winners,
        percentages,
        reason
      );

      const result = await tx.signAndSend(signer);

      console.log('✅ Submit winners transaction submitted:', result.toString());
      return { success: true, txHash: result.toString() };
    } catch (error) {
      console.error('❌ submitWinners error:', error);
      throw new Error(`Failed to submit winners: ${error.message}`);
    }
  }

  /**
   * Force end the current game and refund all players (Admin only)
   * @param {Object} signer - Admin account object
   * @returns {Promise<Object>} Transaction result
   */
  async forceEndGame(signer) {
    this.checkConnection();

    try {
      console.log('⚠️ Force ending game...');

      const tx = this.contract.tx.forceEndGame(
        { gasLimit: -1 }
      );

      const result = await tx.signAndSend(signer);

      console.log('✅ Force end game transaction submitted:', result.toString());
      return { success: true, txHash: result.toString() };
    } catch (error) {
      console.error('❌ forceEndGame error:', error);
      throw new Error(`Failed to force end game: ${error.message}`);
    }
  }

  // =================
  // UTILITY FUNCTIONS
  // =================

  /**
   * Format balance from planck units to DOT
   * @param {string} planckAmount - Amount in planck units
   * @returns {string} Amount in DOT with 4 decimal places
   */
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

  /**
   * Format balance from DOT to planck units
   * @param {number} dotAmount - Amount in DOT
   * @returns {string} Amount in planck units
   */
  formatDOTToPlanck(dotAmount) {
    try {
      const planck = BigInt(Math.floor(dotAmount * 1e12));
      return planck.toString();
    } catch (error) {
      console.error('❌ formatDOTToPlanck error:', error);
      return '0';
    }
  }

  /**
   * Disconnect from the node
   */
  async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.contract = null;
      this.isConnected = false;
      console.log('🔌 Disconnected from Polkadot node');
    }
  }
}

// Create singleton instance
const contractConnection = new ContractConnection();

// Export using CommonJS pattern
module.exports = contractConnection;
