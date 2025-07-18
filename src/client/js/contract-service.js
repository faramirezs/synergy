// Modern Contract Service for Agario Buyin Smart Contract
// Using modern @polkadot-api/sdk-ink with full type safety and H160 support
// Now with mock deployment support for demo purposes

import { mockContract, MOCK_CONTRACT_ADDRESS } from './contract-deployment.js';

class ModernContractService {
  constructor(contractSdk, contractAddress) {
    this.contractSdk = contractSdk;
    this.contractAddress = contractAddress || MOCK_CONTRACT_ADDRESS;
    this.useMockContract = true; // Use mock until real deployment
    
    if (this.useMockContract) {
      this.contract = mockContract;
      console.log("🎭 Modern Contract Service initialized with mock contract");
    } else {
      this.contract = contractSdk.getContract(contractAddress);
      console.log("🔗 Modern Contract Service initialized for address:", contractAddress);
    }
  }

  // Verify contract compatibility
  async verifyCompatibility() {
    try {
      const isCompatible = await this.contract.isCompatible();
      if (!isCompatible) {
        throw new Error("Contract ABI has changed - please redeploy");
      }
      console.log("✅ Contract compatibility verified");
      return true;
    } catch (error) {
      console.error("❌ Contract compatibility check failed:", error);
      throw error;
    }
  }

  // ==================== TYPED QUERY FUNCTIONS ====================

  async getGameState() {
    try {
      if (this.useMockContract) {
        // Mock implementation
        const activeGames = this.contract.getActiveGames();
        const state = activeGames.length > 0 ? activeGames[0].state : 'NotStarted';
        console.log("📊 Game state:", state);
        return state;
      }

      const result = await this.contract.query("get_game_state", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("📊 Game state:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getGameState error:", error);
      throw error;
    }
  }

  async getPlayerCount() {
    try {
      if (this.useMockContract) {
        // Mock implementation
        const activeGames = this.contract.getActiveGames();
        const playerCount = activeGames.length > 0 ? activeGames[0].players.length : 0;
        console.log("👥 Player count:", playerCount);
        return playerCount;
      }

      const result = await this.contract.query("get_player_count", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("👥 Player count:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getPlayerCount error:", error);
      throw error;
    }
  }

  async getPrizePool() {
    try {
      if (this.useMockContract) {
        // Mock implementation
        const activeGames = this.contract.getActiveGames();
        const prizePool = activeGames.length > 0 ? activeGames[0].prize : 0n;
        console.log("💰 Prize pool:", prizePool);
        return prizePool;
      }

      const result = await this.contract.query("get_prize_pool", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("💰 Prize pool:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getPrizePool error:", error);
      throw error;
    }
  }

  async getBuyInAmount() {
    try {
      if (this.useMockContract) {
        // Mock implementation - return demo buy-in amount
        const buyInAmount = 1000000000000; // 1 DOT in planck
        console.log("💳 Buy-in amount:", buyInAmount);
        return buyInAmount;
      }

      const result = await this.contract.query("get_buy_in_amount", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("💳 Buy-in amount:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getBuyInAmount error:", error);
      throw error;
    }
  }

  async getMinPlayers() {
    try {
      if (this.useMockContract) {
        // Mock implementation
        const minPlayers = 2;
        console.log("🎯 Min players:", minPlayers);
        return minPlayers;
      }

      const result = await this.contract.query("get_min_players", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("🎯 Min players:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getMinPlayers error:", error);
      throw error;
    }
  }

  async getRegistrationTimeRemaining() {
    try {
      const result = await this.contract.query("get_registration_time_remaining", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("⏰ Registration time remaining:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getRegistrationTimeRemaining error:", error);
      throw error;
    }
  }

  async getGameTimeRemaining() {
    try {
      const result = await this.contract.query("get_game_time_remaining", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("⏱️ Game time remaining:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getGameTimeRemaining error:", error);
      throw error;
    }
  }

  async getRegistrationDeadline() {
    try {
      const result = await this.contract.query("get_registration_deadline", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("📅 Registration deadline:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getRegistrationDeadline error:", error);
      throw error;
    }
  }

  async getGameDuration() {
    try {
      const result = await this.contract.query("get_game_duration", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("⏳ Game duration:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getGameDuration error:", error);
      throw error;
    }
  }

  async getGameStartTime() {
    try {
      const result = await this.contract.query("get_game_start_time", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("🚀 Game start time:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getGameStartTime error:", error);
      throw error;
    }
  }

  async isPlayerRegistered(h160Address) {
    try {
      const result = await this.contract.query("is_player_registered", {
        origin: this.contractAddress,
        data: { player: h160Address },
      });

      if (result.success) {
        console.log(`👤 Player ${h160Address} registered:`, result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ isPlayerRegistered error:", error);
      throw error;
    }
  }

  async getAdmin() {
    try {
      const result = await this.contract.query("get_admin", {
        origin: this.contractAddress,
      });

      if (result.success) {
        console.log("👑 Admin address:", result.value.response);
        return result.value.response;
      } else {
        throw new Error(`Query failed: ${result.value}`);
      }
    } catch (error) {
      console.error("❌ getAdmin error:", error);
      throw error;
    }
  }

  // ==================== TYPED TRANSACTION FUNCTIONS ====================

  async startGame(signer, buyInAmount, registrationMinutes, minPlayers, gameDurationMinutes = null) {
    try {
      console.log("🚀 Starting game with params:", {
        buyInAmount,
        registrationMinutes,
        minPlayers,
        gameDurationMinutes,
        signer: signer.name || 'Unknown'
      });

      if (this.useMockContract) {
        // Mock implementation
        const gameResult = await this.contract.createGame(
          buyInAmount,
          minPlayers,
          gameDurationMinutes || 3600000 // 1 hour default
        );
        
        console.log("✅ Game started successfully (mock)", gameResult);
        return { 
          success: true, 
          gameId: gameResult.gameId,
          transactionHash: gameResult.transactionHash,
          events: [{ type: 'GameStarted', data: gameResult }] 
        };
      }

      const txResult = await this.contract
        .send("start_game", {
          origin: signer.address,
          data: {
            buy_in: buyInAmount,
            registration_minutes: registrationMinutes,
            min_players: minPlayers,
            game_duration_minutes: gameDurationMinutes,
          },
        })
        .signAndSubmit(signer);

      if (txResult.ok) {
        const contractEvents = this.contract.filterEvents(txResult.events);
        console.log("✅ Game started successfully", { block: txResult.block, events: contractEvents });
        return { success: true, block: txResult.block, events: contractEvents };
      } else {
        throw new Error(`Transaction failed: ${txResult.dispatchError}`);
      }
    } catch (error) {
      console.error("❌ startGame error:", error);
      throw error;
    }
  }

  async deposit(signer, amount) {
    try {
      console.log("💰 Player deposit:", {
        player: signer.name || 'Unknown',
        amount,
        address: signer.address
      });

      if (this.useMockContract) {
        // Mock implementation - find active game and join
        const activeGames = this.contract.getActiveGames();
        if (activeGames.length === 0) {
          throw new Error("No active games to join");
        }

        const gameResult = await this.contract.joinGame(
          activeGames[0].id,
          signer.address,
          amount
        );

        console.log("✅ Deposit successful (mock)", gameResult);
        return { 
          success: true, 
          gameId: activeGames[0].id,
          transactionHash: gameResult.transactionHash,
          events: [{ type: 'PlayerJoined', data: gameResult }] 
        };
      }

      const txResult = await this.contract
        .send("deposit", {
          origin: signer.address,
          value: amount, // Value for payable function
        })
        .signAndSubmit(signer);

      if (txResult.ok) {
        const contractEvents = this.contract.filterEvents(txResult.events);
        console.log("✅ Deposit successful", { block: txResult.block, events: contractEvents });
        return { success: true, block: txResult.block, events: contractEvents };
      } else {
        throw new Error(`Transaction failed: ${txResult.dispatchError}`);
      }
    } catch (error) {
      console.error("❌ deposit error:", error);
      throw error;
    }
  }

  async submitWinners(signer, winners, percentages) {
    try {
      console.log("🏆 Submitting winners:", {
        winners,
        percentages,
        signer: signer.name || 'Unknown'
      });

      if (this.useMockContract) {
        // Mock implementation - end the first active game
        const activeGames = this.contract.getActiveGames();
        if (activeGames.length === 0) {
          throw new Error("No active games to end");
        }

        const gameResult = await this.contract.endGame(
          activeGames[0].id,
          winners[0] // Use first winner
        );

        console.log("✅ Winners submitted successfully (mock)", gameResult);
        return { 
          success: true, 
          gameId: activeGames[0].id,
          transactionHash: gameResult.transactionHash,
          events: [{ type: 'GameEnded', data: gameResult }] 
        };
      }

      // winners: Vec<H160>, percentages: Vec<u8>
      const txResult = await this.contract
        .send("submit_winners", {
          origin: signer.address,
          data: {
            winners: winners,  // Array of H160 addresses
            percentages: percentages,
          },
        })
        .signAndSubmit(signer);

      if (txResult.ok) {
        const contractEvents = this.contract.filterEvents(txResult.events);
        console.log("✅ Winners submitted successfully", { block: txResult.block, events: contractEvents });
        return { success: true, block: txResult.block, events: contractEvents };
      } else {
        throw new Error(`Transaction failed: ${txResult.dispatchError}`);
      }
    } catch (error) {
      console.error("❌ submitWinners error:", error);
      throw error;
    }
  }

  async forceEndGame(signer) {
    try {
      console.log("⚠️ Force ending game by:", signer.name || 'Unknown');

      const txResult = await this.contract
        .send("force_end_game", {
          origin: signer.address,
        })
        .signAndSubmit(signer);

      if (txResult.ok) {
        const contractEvents = this.contract.filterEvents(txResult.events);
        console.log("✅ Game force ended", { block: txResult.block, events: contractEvents });
        return { success: true, block: txResult.block, events: contractEvents };
      } else {
        throw new Error(`Transaction failed: ${txResult.dispatchError}`);
      }
    } catch (error) {
      console.error("❌ forceEndGame error:", error);
      throw error;
    }
  }

  async checkGameConditions(signer) {
    try {
      console.log("🔍 Checking game conditions...");

      const txResult = await this.contract
        .send("check_game_conditions", {
          origin: signer.address,
        })
        .signAndSubmit(signer);

      if (txResult.ok) {
        const contractEvents = this.contract.filterEvents(txResult.events);
        console.log("✅ Game conditions checked", { block: txResult.block, events: contractEvents });
        return { success: true, block: txResult.block, events: contractEvents };
      } else {
        throw new Error(`Transaction failed: ${txResult.dispatchError}`);
      }
    } catch (error) {
      console.error("❌ checkGameConditions error:", error);
      throw error;
    }
  }

  // ==================== DRY-RUN CAPABILITIES ====================

  async dryRunDeposit(account, amount) {
    try {
      console.log("🧪 Dry run deposit:", { account, amount });

      const result = await this.contract.query("deposit", {
        origin: account,
        value: amount,
      });

      if (result.success) {
        return {
          success: true,
          wouldSucceed: true,
          gasRequired: result.value.gasRequired || "Unknown",
          events: result.value.events || [],
        };
      } else {
        return {
          success: false,
          wouldSucceed: false,
          error: result.value,
        };
      }
    } catch (error) {
      console.error("❌ dryRunDeposit error:", error);
      return {
        success: false,
        wouldSucceed: false,
        error: error.message,
      };
    }
  }

  async dryRunStartGame(account, buyInAmount, registrationMinutes, minPlayers, gameDurationMinutes = null) {
    try {
      console.log("🧪 Dry run start game:", {
        account,
        buyInAmount,
        registrationMinutes,
        minPlayers,
        gameDurationMinutes
      });

      const result = await this.contract.query("start_game", {
        origin: account,
        data: {
          buy_in: buyInAmount,
          registration_minutes: registrationMinutes,
          min_players: minPlayers,
          game_duration_minutes: gameDurationMinutes,
        },
      });

      return result.success ?
        { success: true, gasRequired: result.value.gasRequired || "Unknown" } :
        { success: false, error: result.value };
    } catch (error) {
      console.error("❌ dryRunStartGame error:", error);
      return { success: false, error: error.message };
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  formatBalance(balance) {
    // Convert planck to DOT (assuming 12 decimal places)
    const DOT_DECIMALS = 12;
    const divisor = Math.pow(10, DOT_DECIMALS);
    return (balance / divisor).toFixed(4);
  }

  formatTimestamp(timestamp) {
    if (!timestamp || timestamp === 0) return "N/A";
    return new Date(timestamp).toLocaleString();
  }

  formatTimeRemaining(milliseconds) {
    if (!milliseconds || milliseconds <= 0) return "Expired";
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Get comprehensive game info
  async getFullGameInfo() {
    try {
      const [
        gameState,
        playerCount,
        prizePool,
        buyInAmount,
        minPlayers,
        registrationTimeRemaining,
        gameTimeRemaining,
        admin
      ] = await Promise.all([
        this.getGameState(),
        this.getPlayerCount(),
        this.getPrizePool(),
        this.getBuyInAmount(),
        this.getMinPlayers(),
        this.getRegistrationTimeRemaining(),
        this.getGameTimeRemaining(),
        this.getAdmin()
      ]);

      return {
        gameState,
        playerCount,
        prizePool,
        buyInAmount,
        minPlayers,
        registrationTimeRemaining,
        gameTimeRemaining,
        admin,
        formatted: {
          prizePool: this.formatBalance(prizePool),
          buyInAmount: this.formatBalance(buyInAmount),
          registrationTimeRemaining: this.formatTimeRemaining(registrationTimeRemaining),
          gameTimeRemaining: gameTimeRemaining ? this.formatTimeRemaining(gameTimeRemaining) : "No limit"
        }
      };
    } catch (error) {
      console.error("❌ getFullGameInfo error:", error);
      throw error;
    }
  }
}

export default ModernContractService;
