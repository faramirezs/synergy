# 🚀 HACKATHON MVP - Frontend Integration Tasks

> **⚡ HACKATHON FOCUS**: Minimal frontend integration for working demo using **modern @polkadot-api/sdk-ink**. Advanced features deferred to post-hackathon development.

## 🎯 **MVP GOAL**: Simple web interface that demonstrates smart contract interaction using modern PAPI SDK in 2-3 hours.

---

## 🔥 **MUST HAVE - Core Frontend MVP** (Target: 2-3 hours)

### **Task 1: Modern SDK Setup & Local Signers** (45 minutes)
- [ ] Install modern PAPI dependencies: `@polkadot-api/sdk-ink`, `@polkadot-api/descriptors`
- [ ] Generate typed API descriptors for local substrate node
- [ ] Create `src/client/js/papi-service.js` with modern PAPI connection
- [ ] Setup local signers (AliceSigner, BobSigner, CharlieSigner) for demo
- [ ] Create wallet interface with account switching
- [ ] **MVP Success**: Modern SDK connected with local test accounts

### **Task 2: Modern Contract Interface Setup with H160 Addresses** (45 minutes)
- [ ] Generate contract descriptors from metadata: `papi ink add ./agario_buyin.json`
- [ ] Create `src/client/js/contract-service.js` using modern `createReviveSdk()` for H160 support
- [ ] Initialize contract instance with deployed H160 address using `getContract()`
- [ ] Handle account mapping requirements for H160 addresses with `addressIsMapped()`
- [ ] Add typed query functions: `getGameState()`, `getPlayerCount()` with H160 types
- [ ] Test contract connection with dry-run queries using H160 addresses
- [ ] **MVP Success**: Frontend can read contract state with full H160 type safety

### **Task 3: Enhanced Admin Interface with Modern Transactions** (90 minutes)
- [ ] Add admin check using typed account comparison
- [ ] Create comprehensive admin panel with modern transaction handling
- [ ] **Game Configuration Form**:
  - [ ] Buy-in amount input (DOT) with proper Balance type handling
  - [ ] Registration time input (1-60 minutes) with Timestamp conversion
  - [ ] Minimum players input (2-20 players) with u32 validation
  - [ ] Game duration input (1-10 minutes, or "No time limit") with Option<Timestamp>
- [ ] **Game Control Actions**:
  - [ ] "Start Game" button using `.send()` with AliceSigner
  - [ ] "Force End Game" button with proper error handling
  - [ ] "Submit Winners" interface with typed Vec<H160> and Vec<u8>
- [ ] **Game Status Dashboard**:
  - [ ] Current GameState enum display with type safety
  - [ ] Registration countdown timer using contract Timestamp queries
  - [ ] Game duration countdown with automatic updates
  - [ ] Player count vs minimum required with real-time updates
- [ ] **MVP Success**: Admin can configure, start, monitor, and end games with modern SDK

### **Task 4: Enhanced Player Interface with Typed Queries** (60 minutes)
- [ ] **Registration Status Display**:
  - [ ] Show current GameState (Inactive/AcceptingDeposits/InProgress/WaitingForResults)
  - [ ] Registration countdown using `getRegistrationTimeRemaining()` queries
  - [ ] Player count display with typed u32 values
  - [ ] Prize pool display using typed Balance with automatic formatting
- [ ] **Join Game Controls**:
  - [ ] "Join Game" button using `.send()` with current signer
  - [ ] Buy-in amount display with proper DOT formatting
  - [ ] Registration success/failure feedback using transaction events
  - [ ] Player registration status using `isPlayerRegistered()` queries
- [ ] **Game Progress Tracking**:
  - [ ] Game duration countdown using `getGameTimeRemaining()` queries
  - [ ] Visual indicators for different GameState values
  - [ ] Prize pool growth animation with Balance type handling
- [ ] **MVP Success**: Players see clear timing info and can join games with full type safety

### **Task 5: Game Server Integration with Event Monitoring** (75 minutes)
- [ ] **Agario Game Server Hooks**:
  - [ ] Modify `src/server/server.js` to use contract event subscription
  - [ ] Add player mapping: game player ID ↔ typed H160 address
  - [ ] Implement game end detection using GameState monitoring
  - [ ] Add winner determination logic with typed results
- [ ] **Winner Reporting Interface**:
  - [ ] Create admin interface using typed `submitWinners()` calls
  - [ ] Support multiple winners with Vec<H160> and Vec<u8> types
  - [ ] Auto-populate winners from game server with type validation
  - [ ] Manual override capability using AliceSigner
- [ ] **Game State Synchronization**:
  - [ ] Auto-call `checkGameConditions()` using contract queries
  - [ ] Handle automatic state transitions via event monitoring
  - [ ] Trigger `reportGameEnd()` with typed GameEndReason enum
- [ ] **MVP Success**: Game server automatically reports winners using modern SDK

### **Task 6: Comprehensive Event Monitoring & Type-Safe Updates** (45 minutes)
- [ ] **Event Subscription Setup**:
  - [ ] Listen for typed events: `GameStarted`, `PlayerJoined`, `GameBegan`, `GameTimeExpired`, `GameEnded`, `GameRefunded`
  - [ ] Use modern event filtering with `filterEvents()` method
  - [ ] Handle event data with full TypeScript type safety
  - [ ] Implement event-driven UI updates
- [ ] **Real-time UI Updates**:
  - [ ] Update countdown timers using event-triggered queries
  - [ ] Show notifications for state changes with typed data
  - [ ] Handle refund scenarios using `GameRefunded` events
  - [ ] Display winner results with proper Balance formatting
- [ ] **MVP Success**: UI stays perfectly synchronized using modern event system

**Enhanced Frontend MVP TOTAL: ~5 hours** ⏱️ (using modern @polkadot-api/sdk-ink)

---

## 🎮 **Modern SDK Integration Points**

### **PAPI Service Setup with H160 Support** (`src/client/js/papi-service.js`)
```javascript
import { createClient } from "polkadot-api"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat"
import { getWsProvider } from "polkadot-api/ws-provider/web"
import { createReviveSdk } from "@polkadot-api/sdk-ink"  // Use ReviveSdk for H160
import { localNode, contracts } from "@polkadot-api/descriptors"

// Modern PAPI client setup with H160 address support
class PAPIService {
  constructor() {
    this.client = null;
    this.typedApi = null;
    this.contractSdk = null;
    this.isConnected = false;
  }

  async connect(wsUrl = "ws://localhost:9944") {
    try {
      this.client = createClient(
        withPolkadotSdkCompat(getWsProvider(wsUrl))
      );

      this.typedApi = this.client.getTypedApi(localNode);
      // Use createReviveSdk for H160 address support (ink! v6+)
      this.contractSdk = createReviveSdk(this.typedApi, contracts.agario_buyin);

      this.isConnected = true;
      console.log("PAPI connected successfully with H160 support");
    } catch (error) {
      console.error("Failed to connect PAPI:", error);
      throw error;
    }
  }

  getContractSdk() {
    if (!this.contractSdk) {
      throw new Error("PAPI not connected. Call connect() first.");
    }
    return this.contractSdk;
  }

  getTypedApi() {
    if (!this.typedApi) {
      throw new Error("PAPI not connected. Call connect() first.");
    }
    return this.typedApi;
  }

  // Check if an account is mapped for H160 usage
  async isAccountMapped(accountAddress) {
    if (!this.contractSdk) {
      throw new Error("PAPI not connected.");
    }
    return await this.contractSdk.addressIsMapped(accountAddress);
  }

  // Map account for H160 usage (required before contract interaction)
  async mapAccount(signer) {
    if (!this.typedApi) {
      throw new Error("PAPI not connected.");
    }

    const txResult = await this.typedApi.tx.Revive.map_account()
      .signAndSubmit(signer);

    if (txResult.ok) {
      console.log(`Account ${signer.address} mapped for H160 usage`);
      return true;
    } else {
      throw new Error(`Failed to map account: ${txResult.dispatchError}`);
    }
  }
}

export default PAPIService;
```

### **Local Signers Setup for H160 Addresses** (`src/client/js/signers.js`)
```javascript
import { Sr25519Account } from "@polkadot-api/substrate-bindings"
import { getDeploymentAddressWithNonce } from "@polkadot-api/sdk-ink"

// Create local test signers for demo with H160 support
export const createLocalSigners = () => {
  const AliceSigner = Sr25519Account.fromUri("//Alice");
  const BobSigner = Sr25519Account.fromUri("//Bob");
  const CharlieSigner = Sr25519Account.fromUri("//Charlie");
  const DaveSigner = Sr25519Account.fromUri("//Dave");
  const EveSigner = Sr25519Account.fromUri("//Eve");

  return {
    AliceSigner,
    BobSigner,
    CharlieSigner,
    DaveSigner,
    EveSigner,

    // Helper to get signer by name
    getSigner: (name) => {
      const signers = {
        Alice: AliceSigner,
        Bob: BobSigner,
        Charlie: CharlieSigner,
        Dave: DaveSigner,
        Eve: EveSigner
      };
      return signers[name];
    },

    // Get all available accounts with H160 information
    getAllAccounts: () => [
      { name: "Alice", signer: AliceSigner, address: AliceSigner.address, role: "Admin" },
      { name: "Bob", signer: BobSigner, address: BobSigner.address, role: "Player" },
      { name: "Charlie", signer: CharlieSigner, address: CharlieSigner.address, role: "Player" },
      { name: "Dave", signer: DaveSigner, address: DaveSigner.address, role: "Player" },
      { name: "Eve", signer: EveSigner, address: EveSigner.address, role: "Player" }
    ],

    // Auto-map accounts for H160 usage
    async ensureAccountsMapped(papiService) {
      const accounts = this.getAllAccounts();
      const mappingPromises = accounts.map(async (account) => {
        try {
          const isMapped = await papiService.isAccountMapped(account.address);
          if (!isMapped) {
            console.log(`Mapping account ${account.name} for H160 usage...`);
            await papiService.mapAccount(account.signer);
            console.log(`✅ Account ${account.name} mapped successfully`);
          } else {
            console.log(`✅ Account ${account.name} already mapped`);
          }
          return { name: account.name, mapped: true };
        } catch (error) {
          console.error(`❌ Failed to map account ${account.name}:`, error);
          return { name: account.name, mapped: false, error };
        }
      });

      const results = await Promise.all(mappingPromises);
      console.log("Account mapping results:", results);
      return results;
    }
  };
};
```

### **Modern Contract Service** (`src/client/js/contract-service.js`)
```javascript
import { Binary } from "polkadot-api"

class ModernContractService {
  constructor(contractSdk, contractAddress) {
    this.contractSdk = contractSdk;
    this.contract = contractSdk.getContract(contractAddress);
    this.contractAddress = contractAddress;
  }

  // Verify contract compatibility
  async verifyCompatibility() {
    const isCompatible = await this.contract.isCompatible();
    if (!isCompatible) {
      throw new Error("Contract ABI has changed - please redeploy");
    }
    return true;
  }

  // Modern typed queries
  async getGameState() {
    const result = await this.contract.query("get_game_state", {
      origin: this.contractAddress, // Use contract address for queries
    });

    if (result.success) {
      return result.value.response;
    } else {
      throw new Error(`Query failed: ${result.value}`);
    }
  }

  async getPlayerCount() {
    const result = await this.contract.query("get_player_count", {
      origin: this.contractAddress,
    });

    if (result.success) {
      return result.value.response;
    } else {
      throw new Error(`Query failed: ${result.value}`);
    }
  }

  async getPrizePool() {
    const result = await this.contract.query("get_prize_pool", {
      origin: this.contractAddress,
    });

    if (result.success) {
      return result.value.response;
    } else {
      throw new Error(`Query failed: ${result.value}`);
    }
  }

  async getRegistrationTimeRemaining() {
    const result = await this.contract.query("get_registration_time_remaining", {
      origin: this.contractAddress,
    });

    if (result.success) {
      return result.value.response;
    } else {
      throw new Error(`Query failed: ${result.value}`);
    }
  }

  async getGameTimeRemaining() {
    const result = await this.contract.query("get_game_time_remaining", {
      origin: this.contractAddress,
    });

    if (result.success) {
      return result.value.response;
    } else {
      throw new Error(`Query failed: ${result.value}`);
    }
  }

    async isPlayerRegistered(h160Address) {
    const result = await this.contract.query("is_player_registered", {
      origin: this.contractAddress,
      data: { player: h160Address },
    });

    if (result.success) {
      return result.value.response;
    } else {
      throw new Error(`Query failed: ${result.value}`);
    }
  }

  // Modern typed transactions
  async startGame(signer, buyInAmount, registrationMinutes, minPlayers, gameDurationMinutes = null) {
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
      // Filter contract events
      const contractEvents = this.contract.filterEvents(txResult.events);
      return { success: true, block: txResult.block, events: contractEvents };
    } else {
      throw new Error(`Transaction failed: ${txResult.dispatchError}`);
    }
  }

  async deposit(signer, amount) {
    const txResult = await this.contract
      .send("deposit", {
        origin: signer.address,
        value: amount, // Value for payable function
      })
      .signAndSubmit(signer);

    if (txResult.ok) {
      const contractEvents = this.contract.filterEvents(txResult.events);
      return { success: true, block: txResult.block, events: contractEvents };
    } else {
      throw new Error(`Transaction failed: ${txResult.dispatchError}`);
    }
  }

  async reportGameEnd(signer, reason) {
    const txResult = await this.contract
      .send("report_game_end", {
        origin: signer.address,
        data: { reason },
      })
      .signAndSubmit(signer);

    if (txResult.ok) {
      const contractEvents = this.contract.filterEvents(txResult.events);
      return { success: true, block: txResult.block, events: contractEvents };
    } else {
      throw new Error(`Transaction failed: ${txResult.dispatchError}`);
    }
  }

    async submitWinners(signer, winners, percentages) {
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
      return { success: true, block: txResult.block, events: contractEvents };
    } else {
      throw new Error(`Transaction failed: ${txResult.dispatchError}`);
    }
  }

  async forceEndGame(signer) {
    const txResult = await this.contract
      .send("force_end_game", {
        origin: signer.address,
      })
      .signAndSubmit(signer);

    if (txResult.ok) {
      const contractEvents = this.contract.filterEvents(txResult.events);
      return { success: true, block: txResult.block, events: contractEvents };
    } else {
      throw new Error(`Transaction failed: ${txResult.dispatchError}`);
    }
  }

  // Modern dry-run capabilities
  async dryRunDeposit(account, amount) {
    const result = await this.contract.query("deposit", {
      origin: account,
      value: amount,
    });

    if (result.success) {
      return {
        success: true,
        wouldSucceed: true,
        gasRequired: result.value.gasRequired,
        events: result.value.events,
      };
    } else {
      return {
        success: false,
        wouldSucceed: false,
        error: result.value,
      };
    }
  }

  async dryRunStartGame(account, buyInAmount, registrationMinutes, minPlayers, gameDurationMinutes = null) {
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
      { success: true, gasRequired: result.value.gasRequired } :
      { success: false, error: result.value };
  }
}

export default ModernContractService;
```

### **Modern Event Monitor** (`src/client/js/event-monitor.js`)
```javascript
class ModernEventMonitor {
  constructor(typedApi, contractService) {
    this.typedApi = typedApi;
    this.contractService = contractService;
    this.isListening = false;
    this.subscriptions = [];
    this.eventHandlers = {};
  }

  // Add event handler
  on(eventName, handler) {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);
  }

  // Remove event handler
  off(eventName, handler) {
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(h => h !== handler);
    }
  }

  // Emit event to handlers
  emit(eventName, data) {
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  // Start listening for contract events
  async startListening() {
    if (this.isListening) return;

    try {
      // Subscribe to finalized blocks and filter for contract events
      const subscription = this.typedApi.query.System.Events.watchValue("finalized").subscribe({
        next: (events) => {
          this.processEvents(events);
        },
        error: (error) => {
          console.error("Event subscription error:", error);
          this.emit("error", { type: "subscription", error });
        }
      });

      this.subscriptions.push(subscription);
      this.isListening = true;
      console.log("Started listening for contract events");

      // Also poll contract state periodically for backup
      this.startPolling();

    } catch (error) {
      console.error("Failed to start event listening:", error);
      throw error;
    }
  }

  // Process raw events and filter for contract events
  processEvents(systemEvents) {
    systemEvents.forEach(({ event }) => {
      // Filter for contract events
      if (event.type === "Contracts" && event.value.type === "ContractEmitted") {
        const contractAddress = event.value.value.contract;
        const data = event.value.value.data;

        // Only process events from our contract
        if (contractAddress === this.contractService.contractAddress) {
          this.processContractEvent(data);
        }
      }
    });
  }

  // Process specific contract events
  processContractEvent(eventData) {
    try {
      // Decode event data based on contract ABI
      // This would need to match the actual event structure from the contract
      const decoded = this.decodeContractEvent(eventData);

      if (decoded) {
        console.log("Contract event:", decoded);
        this.emit(decoded.eventName, decoded.data);
        this.emit("anyEvent", decoded);
      }
    } catch (error) {
      console.error("Failed to decode contract event:", error);
    }
  }

  // Decode contract event data (simplified - would need actual ABI parsing)
  decodeContractEvent(eventData) {
    // This is a simplified decoder - in practice you'd use the contract ABI
    // to properly decode the event data structure

    // For MVP, we'll implement basic event detection
    const dataHex = eventData.toString();

    // Simple pattern matching for known events
    if (dataHex.includes("GameStarted")) {
      return { eventName: "GameStarted", data: { raw: dataHex } };
    } else if (dataHex.includes("PlayerJoined")) {
      return { eventName: "PlayerJoined", data: { raw: dataHex } };
    } else if (dataHex.includes("GameBegan")) {
      return { eventName: "GameBegan", data: { raw: dataHex } };
    } else if (dataHex.includes("GameTimeExpired")) {
      return { eventName: "GameTimeExpired", data: { raw: dataHex } };
    } else if (dataHex.includes("GameEnded")) {
      return { eventName: "GameEnded", data: { raw: dataHex } };
    } else if (dataHex.includes("GameRefunded")) {
      return { eventName: "GameRefunded", data: { raw: dataHex } };
    }

    return null;
  }

  // Backup polling mechanism
  startPolling() {
    setInterval(async () => {
      try {
        const gameState = await this.contractService.getGameState();
        const playerCount = await this.contractService.getPlayerCount();
        const prizePool = await this.contractService.getPrizePool();

        this.emit("stateUpdate", {
          gameState,
          playerCount,
          prizePool,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000); // Poll every 3 seconds
  }

  // Stop listening
  stopListening() {
    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    });

    this.subscriptions = [];
    this.isListening = false;
    console.log("Stopped listening for events");
  }
}

export default ModernEventMonitor;
```

### **Enhanced Start Menu** (`src/client/index.html`)
```html
<!-- Add to existing start menu -->
<div id="modern-wallet-section">
  <h3>🔗 Wallet Connection</h3>
  <div id="account-selector">
    <label>Select Demo Account:</label>
    <select id="account-select">
      <option value="">Choose account...</option>
      <option value="Alice">Alice (Admin)</option>
      <option value="Bob">Bob (Player)</option>
      <option value="Charlie">Charlie (Player)</option>
      <option value="Dave">Dave (Player)</option>
      <option value="Eve">Eve (Player)</option>
    </select>
  </div>

  <div id="wallet-info" style="display:none">
    <div class="account-card">
      <div class="account-name">
        <strong id="current-account-name">Account</strong>
        <span class="account-role" id="account-role"></span>
      </div>
      <div class="account-details">
        <p><strong>Address:</strong> <code id="account-address"></code></p>
        <p><strong>Balance:</strong> <span id="account-balance">Loading...</span> DOT</p>
      </div>
    </div>
  </div>

  <button id="connect-modern-wallet" style="display:none">Connect to Contract</button>
  <button id="disconnect-wallet" style="display:none">Disconnect</button>
</div>

<div id="admin-panel" style="display:none">
  <h3>🎮 Admin Game Controls</h3>
  <div class="admin-notice">
    <p>⚡ Using modern @polkadot-api/sdk-ink with full type safety</p>
  </div>

  <!-- Game Configuration with Type Validation -->
  <div id="game-config" class="admin-section">
    <h4>Game Setup</h4>
    <div class="form-row">
      <label>Buy-in Amount:</label>
      <input type="number" id="buy-in-amount" placeholder="1000000000000" step="1000000000" min="1000000000">
      <small>Planck units (1 DOT = 10^12 planck)</small>
    </div>
    <div class="form-row">
      <label>Registration Time:</label>
      <input type="number" id="registration-minutes" placeholder="5" min="1" max="60"> minutes
    </div>
    <div class="form-row">
      <label>Min Players:</label>
      <input type="number" id="min-players" placeholder="2" min="2" max="20">
    </div>
    <div class="form-row">
      <label>Game Duration:</label>
      <input type="number" id="game-duration" placeholder="3" min="1" max="10"> minutes
      <label><input type="checkbox" id="no-time-limit"> No time limit</label>
    </div>
    <button id="start-game" class="btn-primary">🚀 Start Game (with AliceSigner)</button>
    <button id="dry-run-start" class="btn-secondary">🧪 Dry Run Start</button>
  </div>

  <!-- Winner Reporting with Type Safety -->
  <div id="winner-submission" class="admin-section" style="display:none">
    <h4>Submit Game Results</h4>
    <div id="winner-list">
      <div class="winner-entry">
        <select class="winner-address">
          <option value="">Select winner H160 address...</option>
          <!-- Populated dynamically with registered players (H160 addresses) -->
        </select>
        <input type="number" placeholder="Prize %" min="1" max="100" class="winner-percentage">
        <button class="remove-winner">×</button>
      </div>
    </div>
    <button id="add-winner">+ Add Winner</button>
    <button id="submit-winners" class="btn-success">✅ Distribute Prizes (AliceSigner)</button>
    <div class="winner-validation">
      <p>Total percentage: <span id="total-percentage">0</span>%</p>
    </div>
  </div>

  <!-- Game Status Dashboard with Type Information -->
  <div id="admin-dashboard" class="admin-section">
    <h4>Game Status (Live Queries)</h4>
    <div class="status-grid">
      <div class="status-item">
        <span class="label">State:</span>
        <span id="admin-game-state" class="value">Inactive</span>
        <small class="type-info">GameState enum</small>
      </div>
      <div class="status-item">
        <span class="label">Registration:</span>
        <span id="registration-timer" class="value timer">--:--</span>
        <small class="type-info">Timestamp query</small>
      </div>
      <div class="status-item">
        <span class="label">Game Time:</span>
        <span id="game-timer" class="value timer">--:--</span>
        <small class="type-info">Option&lt;Timestamp&gt;</small>
      </div>
      <div class="status-item">
        <span class="label">Players:</span>
        <span id="admin-player-count" class="value">0/0</span>
        <small class="type-info">u32 values</small>
      </div>
      <div class="status-item">
        <span class="label">Prize Pool:</span>
        <span id="admin-prize-pool" class="value">0</span>
        <small class="type-info">Balance type</small>
      </div>
    </div>
    <button id="force-end-game" class="btn-warning" style="display:none">⚠️ Force End Game</button>
    <button id="refresh-state" class="btn-secondary">🔄 Refresh State</button>
  </div>
</div>

<div id="player-section">
  <div id="game-info">
    <h3>🎯 Current Game (Type-Safe Queries)</h3>
    <div class="game-status">
      <div class="status-bar">
        <div class="status-indicator" id="state-indicator">
          <span id="game-state">Inactive</span>
          <small class="type-info">Live GameState</small>
        </div>
      </div>

      <div class="game-stats">
        <div class="stat">
          <label>Players:</label>
          <span id="player-count">0</span>/<span id="min-players-display">0</span>
          <small class="type-info">u32 queries</small>
        </div>
        <div class="stat">
          <label>Prize Pool:</label>
          <span id="prize-pool">0</span> DOT
          <small class="type-info">Balance formatting</small>
        </div>
        <div class="stat">
          <label>Registration Status:</label>
          <span id="player-registered-status">Unknown</span>
          <small class="type-info">bool query</small>
        </div>
      </div>

      <div class="timers">
        <div class="timer-section" id="registration-section" style="display:none">
          <label>Registration ends in:</label>
          <div class="countdown" id="registration-countdown">00:00</div>
          <div class="progress-bar">
            <div class="progress-fill" id="registration-progress"></div>
          </div>
          <small class="type-info">Timestamp calculations</small>
        </div>

        <div class="timer-section" id="game-section" style="display:none">
          <label>Game time remaining:</label>
          <div class="countdown" id="game-countdown">00:00</div>
          <div class="progress-bar">
            <div class="progress-fill" id="game-progress"></div>
          </div>
          <small class="type-info">Option&lt;Timestamp&gt; handling</small>
        </div>
      </div>
    </div>
  </div>

  <div id="player-actions">
    <button id="join-game" class="btn-primary" style="display:none">
      💰 Join Game (<span id="join-amount">0</span> DOT)
    </button>
    <button id="dry-run-join" class="btn-secondary" style="display:none">
      🧪 Dry Run Join
    </button>
    <div id="player-status" style="display:none">
      <span class="status-message">✅ You're registered for this game!</span>
    </div>
  </div>
</div>

<!-- Modern Event Display -->
<div id="event-section">
  <h3>📡 Live Contract Events</h3>
  <div id="event-log" class="event-container">
    <p class="event-placeholder">Listening for contract events...</p>
  </div>
  <button id="clear-events" class="btn-secondary">Clear Events</button>
</div>

<!-- Game Results Display with Type Information -->
<div id="results-section" style="display:none">
  <h3>🏆 Game Results (Event-Driven)</h3>
  <div id="winner-list-display"></div>
  <div id="prize-distribution"></div>
  <div class="results-meta">
    <p><strong>Event Data:</strong> <code id="results-raw-data"></code></p>
  </div>
</div>
```

---

## 🛠 **Quick Development Setup with Modern SDK**

### **Installation** (5 minutes)
```bash
cd src/client

# Install modern PAPI dependencies
npm install @polkadot-api/sdk-ink @polkadot-api/descriptors
npm install @polkadot-api/substrate-bindings
npm install polkadot-api

# Generate descriptors for local development
npx papi generate
```

### **Generate Contract Descriptors**
```bash
# After building the contract
cp ../../agario_buyin/target/ink/agario_buyin.json ./

# Generate typed contract interface
npx papi ink add ./agario_buyin.json
```

### **Modern Integration Test**
```javascript
// Quick test in browser console with modern SDK
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const client = createClient(getWsProvider("ws://localhost:9944"));
const typedApi = client.getTypedApi(localNode);
console.log("Modern PAPI connected:", await typedApi.query.System.Number.getValue());
```

---

## 🎯 **Enhanced Demo Flow for Judges** (3-minute demo)

### **Modern SDK Demo Script (3 minutes):**
1. **[45s] Modern Setup & Type Safety**:
   - "Using latest @polkadot-api/sdk-ink with full TypeScript type safety"
   - "Alice (admin) configures game with proper Balance/Timestamp types"
   - "Dry-run validation shows gas estimates and success probability"
   - "Transaction sent with AliceSigner, full event filtering"

2. **[45s] Type-Safe Player Registration**:
   - "Bob and Charlie switch accounts using local signers"
   - "Join game with typed deposit() calls and proper value handling"
   - "Real-time queries show u32 player counts and Balance prize pool"
   - "Type-safe registration validation with immediate feedback"

3. **[60s] Live Game with Event Monitoring**:
   - "Event subscription shows real-time contract events"
   - "Game server integration with typed H160 address mapping"
   - "Automatic state transitions monitored via GameState enum"
   - "Winner detection with full type validation using H160 addresses"

4. **[30s] Type-Safe Winner Distribution**:
   - "Admin submits winners using Vec<H160> and Vec<u8> types"
   - "Transaction events show successful Balance transfers to H160 addresses"
   - "Full type safety prevents common integration errors"
   - "Event-driven UI updates show final results with Ethereum-compatible addresses"

### **Key Technical Highlights:**
- ✅ **Modern SDK**: Latest @polkadot-api/sdk-ink with createReviveSdk for H160 support
- ✅ **Local Signers**: No browser extension needed, immediate demo
- ✅ **H160 Addresses**: Ethereum-compatible addressing with automatic account mapping
- ✅ **Type Safety**: Proper Balance, Timestamp, H160 handling
- ✅ **Event System**: Real-time contract event monitoring
- ✅ **Dry Runs**: Transaction validation before sending

---

## 🚨 **MVP Risk Mitigation with Modern SDK**

### **Technical Advantages:**
1. **No Browser Extensions**: Local signers eliminate wallet connection issues
2. **Type Safety**: Compile-time validation prevents runtime errors
3. **Better Error Handling**: Typed errors with clear messaging
4. **Reliable Events**: Modern event subscription with fallback polling
5. **Faster Development**: Auto-generated types speed up integration

### **Demo Environment Setup:**
```bash
# Terminal 1: Local node with contract deployed
substrate-contracts-node --dev

# Terminal 2: Contract deployment
cd agario_buyin
cargo contract build --release
cargo contract instantiate --suri //Alice --args 5 -x

# Terminal 3: Modern web server
cd src/client && python -m http.server 8080

# Browser: No wallet extension needed!
# Local signers handle everything
```

---

## 🏆 **Enhanced Success Criteria**

### **Must Demonstrate with Modern SDK:**
- ✅ **H160 Type Safety**: All contract interactions properly typed with H160 addresses
- ✅ **Local Signers**: No browser extension dependency with automatic account mapping
- ✅ **Event Monitoring**: Real-time contract event subscription
- ✅ **Error Handling**: Proper transaction error management
- ✅ **Performance**: Fast queries and efficient updates

### **Technical Excellence:**
- ✅ **Modern Architecture**: Latest PAPI patterns and best practices
- ✅ **Type Coverage**: Full TypeScript integration
- ✅ **Event-Driven**: Real-time UI updates via contract events
- ✅ **Reliability**: Fallback mechanisms and error recovery
- ✅ **Developer Experience**: Clear, maintainable code structure

---

## 📁 **Updated File Structure for Modern MVP**

```
src/client/
├── index.html                 # Updated with modern wallet UI
├── js/
│   ├── papi-service.js        # ✨ NEW: Modern PAPI client setup
│   ├── signers.js             # ✨ NEW: Local test signers (Alice, Bob, etc.)
│   ├── contract-service.js    # ✨ NEW: Modern ink SDK contract interface
│   ├── event-monitor.js       # ✨ NEW: Event subscription with fallback
│   ├── demo-integration.js    # ✨ NEW: Main integration logic
│   ├── balance-utils.js       # ✨ NEW: Balance formatting utilities
│   ├── app.js                 # Modified: Add modern contract hooks
│   ├── global.js              # Modified: Add typed wallet state
│   └── chat-client.js         # Modified: Add contract event notifications
├── css/
│   └── main.css               # Modified: Modern wallet/contract styling
├── agario_buyin.json          # Contract metadata
└── polkadot-api.json          # Generated PAPI descriptors
```

---

## 🔧 **Key Modern SDK Advantages**

### **Development Speed Improvements:**
- **Auto-generated Types** - No manual ABI parsing or type definitions
- **Local Signers** - No browser extension setup or user interaction
- **Better DevEx** - TypeScript completion and error detection
- **Faster Queries** - Optimized RPC calls and caching
- **Reliable Events** - Modern subscription patterns with reconnection
- **H160 Compatibility** - Ethereum-compatible addresses with automatic mapping

### **Production Benefits:**
- **Type Safety** - Prevents common integration errors at compile time
- **H160 Compatibility** - Ethereum-compatible addresses enable cross-chain interoperability
- **Performance** - Optimized for modern dApps with efficient state management
- **Maintainability** - Clear separation of concerns and modern patterns
- **Scalability** - Better handling of multiple contracts and complex state
- **Future-Proof** - Built on latest Polkadot standards with Ethereum compatibility

---

*🎯 Focus: Leverage modern @polkadot-api/sdk-ink for the best possible developer experience and demo reliability!*
