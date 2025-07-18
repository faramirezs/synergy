// Modern Event Monitor for Real-time Contract Updates
// Comprehensive event system with type-safe monitoring and fallback polling

class ModernEventMonitor {
  constructor(typedApi, contractService) {
    this.typedApi = typedApi;
    this.contractService = contractService;
    this.isListening = false;
    this.subscriptions = [];
    this.eventHandlers = {};
    this.pollingInterval = null;
    this.pollingFrequency = 3000; // 3 seconds
    this.lastKnownState = {};
  }

  // ==================== EVENT HANDLER MANAGEMENT ====================

  // Add event handler
  on(eventName, handler) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);
    console.log(`📡 Event handler added for: ${eventName}`);
  }

  // Remove event handler
  off(eventName, handler) {
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(h => h !== handler);
      console.log(`📡 Event handler removed for: ${eventName}`);
    }
  }

  // Emit event to handlers
  emit(eventName, data) {
    console.log(`📡 Emitting event: ${eventName}`, data);
    
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Error in event handler for ${eventName}:`, error);
        }
      });
    }

    // Also emit to generic handlers
    if (this.eventHandlers['*']) {
      this.eventHandlers['*'].forEach(handler => {
        try {
          handler({ eventName, data });
        } catch (error) {
          console.error(`❌ Error in generic event handler:`, error);
        }
      });
    }
  }

  // ==================== EVENT LISTENING SETUP ====================

  // Start listening for contract events
  async startListening() {
    if (this.isListening) {
      console.log("📡 Already listening for events");
      return;
    }

    try {
      console.log("📡 Starting event monitoring...");

      // For MVP, we'll primarily use polling since event subscription
      // requires proper chain connection which might not be available
      this.startPolling();
      
      // Try to set up proper event subscription if possible
      try {
        await this.setupEventSubscription();
      } catch (error) {
        console.log("⚠️ Event subscription failed, using polling only:", error.message);
      }

      this.isListening = true;
      console.log("✅ Event monitoring started");
      
    } catch (error) {
      console.error("❌ Failed to start event listening:", error);
      throw error;
    }
  }

  // Setup chain event subscription (production version)
  async setupEventSubscription() {
    if (!this.typedApi || !this.typedApi.query) {
      throw new Error("TypedApi not available for event subscription");
    }

    try {
      // Subscribe to finalized blocks and filter for contract events
      const subscription = this.typedApi.query.System.Events.watchValue("finalized").subscribe({
        next: (events) => {
          this.processChainEvents(events);
        },
        error: (error) => {
          console.error("❌ Event subscription error:", error);
          this.emit("error", { type: "subscription", error });
        }
      });

      this.subscriptions.push(subscription);
      console.log("✅ Chain event subscription established");

    } catch (error) {
      console.error("❌ Failed to setup event subscription:", error);
      throw error;
    }
  }

  // Process raw chain events and filter for contract events
  processChainEvents(systemEvents) {
    if (!Array.isArray(systemEvents)) return;

    systemEvents.forEach(({ event }) => {
      try {
        // Filter for contract events
        if (event.type === "Contracts" && event.value && event.value.type === "ContractEmitted") {
          const contractAddress = event.value.value.contract;
          const data = event.value.value.data;

          // Only process events from our contract
          if (contractAddress === this.contractService.contractAddress) {
            this.processContractEvent(data);
          }
        }
      } catch (error) {
        console.error("❌ Error processing chain event:", error);
      }
    });
  }

  // Process specific contract events
  processContractEvent(eventData) {
    try {
      // Decode event data based on contract ABI
      const decoded = this.decodeContractEvent(eventData);

      if (decoded) {
        console.log("📡 Contract event received:", decoded);
        this.emit(decoded.eventName, decoded.data);
        this.emit("contractEvent", decoded);
      }
    } catch (error) {
      console.error("❌ Failed to decode contract event:", error);
    }
  }

  // Decode contract event data (simplified for MVP)
  decodeContractEvent(eventData) {
    try {
      const dataHex = eventData.toString();

      // Simple pattern matching for known events
      // In production, you'd use proper ABI decoding
      if (dataHex.includes("GameStarted")) {
        return {
          eventName: "GameStarted",
          data: {
            type: "GameStarted",
            timestamp: Date.now(),
            raw: dataHex
          }
        };
      } else if (dataHex.includes("PlayerJoined")) {
        return {
          eventName: "PlayerJoined",
          data: {
            type: "PlayerJoined",
            timestamp: Date.now(),
            raw: dataHex
          }
        };
      } else if (dataHex.includes("GameBegan")) {
        return {
          eventName: "GameBegan",
          data: {
            type: "GameBegan",
            timestamp: Date.now(),
            raw: dataHex
          }
        };
      } else if (dataHex.includes("GameTimeExpired")) {
        return {
          eventName: "GameTimeExpired",
          data: {
            type: "GameTimeExpired",
            timestamp: Date.now(),
            raw: dataHex
          }
        };
      } else if (dataHex.includes("GameEnded")) {
        return {
          eventName: "GameEnded",
          data: {
            type: "GameEnded",
            timestamp: Date.now(),
            raw: dataHex
          }
        };
      } else if (dataHex.includes("GameRefunded")) {
        return {
          eventName: "GameRefunded",
          data: {
            type: "GameRefunded",
            timestamp: Date.now(),
            raw: dataHex
          }
        };
      }

      return null;
    } catch (error) {
      console.error("❌ Error decoding contract event:", error);
      return null;
    }
  }

  // ==================== POLLING MECHANISM ====================

  // Backup polling mechanism for reliable updates
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    console.log(`📊 Starting state polling every ${this.pollingFrequency}ms`);

    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollContractState();
      } catch (error) {
        console.error("❌ Polling error:", error);
        this.emit("error", { type: "polling", error });
      }
    }, this.pollingFrequency);
  }

  // Poll contract state and emit updates
  async pollContractState() {
    try {
      const currentState = await this.contractService.getFullGameInfo();
      
      // Check for state changes
      const changes = this.detectStateChanges(this.lastKnownState, currentState);
      
      if (changes.length > 0) {
        console.log("📊 State changes detected:", changes);
        
        changes.forEach(change => {
          this.emit("stateChange", change);
        });
      }

      // Always emit current state
      this.emit("stateUpdate", {
        ...currentState,
        timestamp: Date.now()
      });

      // Update last known state
      this.lastKnownState = { ...currentState };

    } catch (error) {
      console.error("❌ Error polling contract state:", error);
      // Don't throw here to keep polling running
    }
  }

  // Detect meaningful state changes
  detectStateChanges(oldState, newState) {
    const changes = [];

    if (!oldState || Object.keys(oldState).length === 0) {
      return [{ type: "initial", data: newState }];
    }

    // Game state change
    if (oldState.gameState !== newState.gameState) {
      changes.push({
        type: "gameStateChange",
        from: oldState.gameState,
        to: newState.gameState,
        timestamp: Date.now()
      });

      // Emit specific state transition events
      this.emitStateTransitionEvent(oldState.gameState, newState.gameState);
    }

    // Player count change
    if (oldState.playerCount !== newState.playerCount) {
      changes.push({
        type: "playerCountChange",
        from: oldState.playerCount,
        to: newState.playerCount,
        timestamp: Date.now()
      });

      if (newState.playerCount > oldState.playerCount) {
        this.emit("PlayerJoined", {
          newPlayerCount: newState.playerCount,
          prizePool: newState.prizePool
        });
      }
    }

    // Prize pool change
    if (oldState.prizePool !== newState.prizePool) {
      changes.push({
        type: "prizePoolChange",
        from: oldState.prizePool,
        to: newState.prizePool,
        timestamp: Date.now()
      });
    }

    // Registration time running out
    if (oldState.registrationTimeRemaining > 0 && newState.registrationTimeRemaining === 0) {
      changes.push({
        type: "registrationExpired",
        timestamp: Date.now()
      });
    }

    // Game time running out
    if (oldState.gameTimeRemaining > 0 && newState.gameTimeRemaining === 0) {
      changes.push({
        type: "gameTimeExpired",
        timestamp: Date.now()
      });

      this.emit("GameTimeExpired", {
        timestamp: Date.now()
      });
    }

    return changes;
  }

  // Emit specific state transition events
  emitStateTransitionEvent(fromState, toState) {
    if (fromState === "Inactive" && toState === "AcceptingDeposits") {
      this.emit("GameStarted", {
        timestamp: Date.now(),
        message: "Game registration opened"
      });
    } else if (fromState === "AcceptingDeposits" && toState === "InProgress") {
      this.emit("GameBegan", {
        timestamp: Date.now(),
        message: "Game started"
      });
    } else if (toState === "WaitingForResults") {
      this.emit("GameEnded", {
        timestamp: Date.now(),
        message: "Game ended, waiting for results"
      });
    } else if (toState === "Inactive") {
      this.emit("GameReset", {
        timestamp: Date.now(),
        message: "Game reset to inactive"
      });
    }
  }

  // ==================== TIMER MANAGEMENT ====================

  // Start countdown timers for UI updates
  startTimers() {
    // Update timers every second for smooth UI updates
    setInterval(() => {
      this.emit("timerTick", {
        timestamp: Date.now()
      });
    }, 1000);
  }

  // ==================== LIFECYCLE MANAGEMENT ====================

  // Stop listening and cleanup
  stopListening() {
    console.log("📡 Stopping event monitoring...");

    // Clear subscriptions
    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.error("❌ Error unsubscribing:", error);
      }
    });
    this.subscriptions = [];

    // Clear polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isListening = false;
    console.log("✅ Event monitoring stopped");
  }

  // Get monitoring status
  getStatus() {
    return {
      isListening: this.isListening,
      subscriptionCount: this.subscriptions.length,
      handlerCount: Object.keys(this.eventHandlers).length,
      isPolling: !!this.pollingInterval,
      pollingFrequency: this.pollingFrequency
    };
  }

  // Adjust polling frequency
  setPollingFrequency(milliseconds) {
    this.pollingFrequency = milliseconds;
    if (this.isListening) {
      this.startPolling(); // Restart with new frequency
    }
    console.log(`📊 Polling frequency updated to ${milliseconds}ms`);
  }

  // Manual state refresh
  async refreshState() {
    try {
      console.log("🔄 Manual state refresh...");
      await this.pollContractState();
      console.log("✅ State refreshed");
    } catch (error) {
      console.error("❌ Error refreshing state:", error);
      throw error;
    }
  }
}

export default ModernEventMonitor;
