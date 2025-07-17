# 🚀 HACKATHON MVP - Frontend Integration Tasks

> **⚡ HACKATHON FOCUS**: Minimal frontend integration for working demo. Advanced features deferred to post-hackathon development.

## 🎯 **MVP GOAL**: Simple web interface that demonstrates smart contract interaction in 2-3 hours.

---

## 🔥 **MUST HAVE - Core Frontend MVP** (Target: 2-3 hours)

### **Task 1: Basic Setup & Wallet Connection** (45 minutes)
- [ ] Install `@polkadot/api` and `@polkadot/extension-dapp`
- [ ] Create `src/client/js/wallet-service.js` with basic Polkadot.js connection
- [ ] Add wallet connection button to start menu
- [ ] Display connected account address and balance
- [ ] Handle connection errors gracefully
- [ ] **MVP Success**: User can connect wallet and see their account

### **Task 2: Contract Interface Setup** (45 minutes)
- [ ] Create `src/client/js/contract-service.js` with contract ABI
- [ ] Initialize contract instance with deployed address
- [ ] Add basic query functions: `getGameState()`, `getPlayerCount()`
- [ ] Test contract connection and queries
- [ ] **MVP Success**: Frontend can read contract state

### **Task 3: Enhanced Admin Interface** (90 minutes)
- [ ] Add admin check: compare connected account with contract admin
- [ ] Create comprehensive admin panel in start menu (visible only to admin)
- [ ] **Game Configuration Form**:
  - [ ] Buy-in amount input (DOT)
  - [ ] Registration time input (1-60 minutes)
  - [ ] Minimum players input (2-20 players)
  - [ ] Game duration input (1-10 minutes, or "No time limit")
- [ ] **Game Control Actions**:
  - [ ] "Start Game" button with full configuration
  - [ ] "Force End Game" button for emergency stops
  - [ ] "Submit Winners" interface with percentage distribution
- [ ] **Game Status Dashboard**:
  - [ ] Current game state with visual indicators
  - [ ] Registration countdown timer
  - [ ] Game duration countdown timer
  - [ ] Player count vs minimum required
- [ ] **MVP Success**: Admin can configure, start, monitor, and end games with timing controls

### **Task 4: Enhanced Player Interface** (60 minutes)
- [ ] **Registration Status Display**:
  - [ ] Show current game state (Inactive/AcceptingDeposits/InProgress/WaitingForResults)
  - [ ] Registration countdown timer with visual progress bar
  - [ ] Player count display with minimum required indicator
  - [ ] Prize pool display with real-time updates
- [ ] **Join Game Controls**:
  - [ ] "Join Game" button (visible when AcceptingDeposits and not full)
  - [ ] Buy-in amount display and confirmation
  - [ ] Registration success/failure feedback
  - [ ] Player registration status (joined/not joined)
- [ ] **Game Progress Tracking**:
  - [ ] Game duration countdown when InProgress
  - [ ] Visual indicators for different game states
  - [ ] Prize pool growth animation
- [ ] **MVP Success**: Players see clear timing info and can join games with proper feedback

### **Task 5: Game Server Integration & Winner Reporting** (75 minutes)
- [ ] **Agario Game Server Hooks**:
  - [ ] Modify `src/server/server.js` to track contract-registered players
  - [ ] Add player mapping: game player ID ↔ wallet AccountId
  - [ ] Implement game end detection (last player standing OR time limit)
  - [ ] Add winner determination logic based on game results
- [ ] **Winner Reporting Interface**:
  - [ ] Create admin interface for winner submission
  - [ ] Support multiple winners with percentage distribution
  - [ ] Auto-populate winners from game server results
  - [ ] Manual override capability for admin
- [ ] **Game State Synchronization**:
  - [ ] Auto-call `check_game_conditions()` periodically
  - [ ] Handle automatic state transitions
  - [ ] Trigger `report_game_end()` when game completes
- [ ] **MVP Success**: Game server automatically reports winners to smart contract

### **Task 6: Enhanced Event Monitoring & UI Updates** (45 minutes)
- [ ] **Comprehensive Event Handling**:
  - [ ] Listen for all enhanced events: `GameStarted`, `PlayerJoined`, `GameBegan`, `GameTimeExpired`, `GameEnded`, `GameRefunded`
  - [ ] Update countdown timers when events received
  - [ ] Handle automatic state transitions
  - [ ] Show winner announcements and prize distributions
- [ ] **Real-time UI Updates**:
  - [ ] Update all timing displays in real-time
  - [ ] Show notifications for important state changes
  - [ ] Handle refund scenarios gracefully
  - [ ] Display winner results and prize amounts
- [ ] **MVP Success**: UI stays perfectly synchronized with contract state and timing

**Enhanced Frontend MVP TOTAL: ~5 hours** ⏱️ (includes timing & game server integration)

---

## 🎮 **Simple UI Integration Points**

### **Enhanced Start Menu** (`src/client/index.html`)
```html
<!-- Add to existing start menu -->
<div id="wallet-section">
  <button id="connect-wallet">Connect Wallet</button>
  <div id="wallet-info" style="display:none">
    <p>Account: <span id="account-address"></span></p>
    <p>Balance: <span id="account-balance"></span> DOT</p>
  </div>
</div>

<div id="admin-panel" style="display:none">
  <h3>🎮 Admin Game Controls</h3>

  <!-- Game Configuration -->
  <div id="game-config" class="admin-section">
    <h4>Game Setup</h4>
    <div class="form-row">
      <label>Buy-in Amount:</label>
      <input type="number" id="buy-in-amount" placeholder="1.0" step="0.1" min="0.1"> DOT
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
    <button id="start-game" class="btn-primary">🚀 Start Game</button>
  </div>

  <!-- Winner Reporting -->
  <div id="winner-submission" class="admin-section" style="display:none">
    <h4>Submit Game Results</h4>
    <div id="winner-list">
      <div class="winner-entry">
        <input type="text" placeholder="Winner wallet address" class="winner-address">
        <input type="number" placeholder="Prize %" min="1" max="100" class="winner-percentage">
      </div>
    </div>
    <button id="add-winner">+ Add Winner</button>
    <button id="submit-winners" class="btn-success">✅ Distribute Prizes</button>
  </div>

  <!-- Game Status Dashboard -->
  <div id="admin-dashboard" class="admin-section">
    <h4>Game Status</h4>
    <div class="status-grid">
      <div class="status-item">
        <span class="label">State:</span>
        <span id="admin-game-state" class="value">Inactive</span>
      </div>
      <div class="status-item">
        <span class="label">Registration:</span>
        <span id="registration-timer" class="value timer">--:--</span>
      </div>
      <div class="status-item">
        <span class="label">Game Time:</span>
        <span id="game-timer" class="value timer">--:--</span>
      </div>
      <div class="status-item">
        <span class="label">Players:</span>
        <span id="admin-player-count" class="value">0/0</span>
      </div>
    </div>
    <button id="force-end-game" class="btn-warning" style="display:none">⚠️ Force End Game</button>
  </div>
</div>

<div id="player-section">
  <div id="game-info">
    <h3>🎯 Current Game</h3>
    <div class="game-status">
      <div class="status-bar">
        <div class="status-indicator" id="state-indicator">
          <span id="game-state">Inactive</span>
        </div>
      </div>

      <div class="game-stats">
        <div class="stat">
          <label>Players:</label>
          <span id="player-count">0</span>/<span id="min-players-display">0</span>
        </div>
        <div class="stat">
          <label>Prize Pool:</label>
          <span id="prize-pool">0</span> DOT
        </div>
        <div class="stat">
          <label>Buy-in:</label>
          <span id="buy-in-display">0</span> DOT
        </div>
      </div>

      <div class="timers">
        <div class="timer-section" id="registration-section" style="display:none">
          <label>Registration ends in:</label>
          <div class="countdown" id="registration-countdown">00:00</div>
          <div class="progress-bar">
            <div class="progress-fill" id="registration-progress"></div>
          </div>
        </div>

        <div class="timer-section" id="game-section" style="display:none">
          <label>Game time remaining:</label>
          <div class="countdown" id="game-countdown">00:00</div>
          <div class="progress-bar">
            <div class="progress-fill" id="game-progress"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="player-actions">
    <button id="join-game" class="btn-primary" style="display:none">
      💰 Join Game (<span id="join-amount">0</span> DOT)
    </button>
    <div id="player-status" style="display:none">
      <span class="status-message">✅ You're registered for this game!</span>
    </div>
  </div>
</div>

<!-- Game Results Display -->
<div id="results-section" style="display:none">
  <h3>🏆 Game Results</h3>
  <div id="winner-list-display"></div>
  <div id="prize-distribution"></div>
</div>
```

### **Enhanced Contract Service** (`src/client/js/contract-service.js`)
```javascript
class ContractService {
  constructor(api, address, abi) {
    this.api = api;
    this.contract = new ContractPromise(api, abi, address);
  }

  async getGameState() {
    const { result, output } = await this.contract.query.getGameState(
      null, { gasLimit: -1 }
    );
    return output.toHuman();
  }

  async getPlayerCount() {
    const { result, output } = await this.contract.query.getPlayerCount(
      null, { gasLimit: -1 }
    );
    return output.toNumber();
  }

  async startGame(signer, buyInAmount, registrationMinutes, minPlayers, gameDurationMinutes) {
    return await this.contract.tx.startGame(
      { gasLimit: -1 },
      buyInAmount,
      registrationMinutes,
      minPlayers,
      gameDurationMinutes
    ).signAndSend(signer);
  }

  async deposit(signer, amount) {
    return await this.contract.tx.deposit({ gasLimit: -1, value: amount })
      .signAndSend(signer);
  }

  async checkGameConditions() {
    return await this.contract.tx.checkGameConditions({ gasLimit: -1 })
      .signAndSend(null); // Read-only call
  }

  async submitWinners(signer, winners, percentages) {
    return await this.contract.tx.submitWinners({ gasLimit: -1 }, winners, percentages)
      .signAndSend(signer);
  }

  async getTimeRemaining() {
    const { result, output } = await this.contract.query.getTimeRemaining(
      null, { gasLimit: -1 }
    );
    return output.toNumber();
  }

  async getRegistrationDeadline() {
    const { result, output } = await this.contract.query.getRegistrationDeadline(
      null, { gasLimit: -1 }
    );
    return output.toNumber();
  }
}
```

### **Game Server Integration** (`src/server/server.js` modifications)
```javascript
// Add to existing server.js for smart contract integration
class SmartContractGameManager {
  constructor(contractService) {
    this.contractService = contractService;
    this.registeredPlayers = new Map(); // gamePlayerId -> walletAddress
    this.gameEndConditions = {
      timeLimit: null,
      lastPlayerStanding: true
    };
  }

  // Track contract-registered players when they join game
  async trackPlayer(socket, walletAddress) {
    const gamePlayerId = socket.id;
    this.registeredPlayers.set(gamePlayerId, walletAddress);
    console.log(`Player ${walletAddress} (${gamePlayerId}) joined game`);
  }

  // Check win conditions during game play
  checkWinConditions() {
    const activePlayers = Array.from(this.registeredPlayers.keys())
      .filter(playerId => players[playerId] && players[playerId].mass > 0);

    // Last player standing
    if (activePlayers.length === 1) {
      const winnerId = activePlayers[0];
      const winnerAddress = this.registeredPlayers.get(winnerId);
      this.reportGameEnd('LastPlayerStanding', [winnerAddress], [100]);
      return true;
    }

    // Time limit reached (checked elsewhere via contract events)
    return false;
  }

  // Report game end to smart contract
  async reportGameEnd(reason, winners, percentages) {
    try {
      console.log(`Game ended: ${reason}, Winners: ${winners}`);

      // First report to contract that game ended
      await this.contractService.reportGameEnd(reason);

      // Then submit winners (admin function)
      // This would typically be done through admin interface
      this.emit('gameEnded', { reason, winners, percentages });

    } catch (error) {
      console.error('Failed to report game end:', error);
    }
  }

  // Handle time-based game end (triggered by contract event)
  handleTimeExpired() {
    // Determine winners based on current game state
    const playerScores = Object.entries(players)
      .filter(([id, player]) => this.registeredPlayers.has(id))
      .map(([id, player]) => ({
        address: this.registeredPlayers.get(id),
        score: player.mass
      }))
      .sort((a, b) => b.score - a.score);

    // Award prizes to top 3 players with decreasing percentages
    const winners = playerScores.slice(0, 3).map(p => p.address);
    const percentages = [50, 30, 20]; // Top 3 get 50%, 30%, 20%

    this.reportGameEnd('TimeLimit', winners, percentages);
  }
}

// Integration with existing game loop
const contractGameManager = new SmartContractGameManager(contractService);

// Modify existing player connection handler
io.on('connection', function(socket) {
  // ... existing code ...

  socket.on('contractPlayerJoin', function(data) {
    contractGameManager.trackPlayer(socket, data.walletAddress);
  });

  // Modify existing game tick to check win conditions
  socket.on('0', function(data) {
    // ... existing movement code ...

    // Check if game should end
    contractGameManager.checkWinConditions();
  });
});

// Listen for contract events
contractService.on('GameTimeExpired', () => {
  contractGameManager.handleTimeExpired();
});
```

### **Event Monitoring** (`src/client/js/event-monitor.js`)
```javascript
class EventMonitor {
  constructor(contract, updateCallback) {
    this.contract = contract;
    this.updateCallback = updateCallback;
  }

  startListening() {
    // Simple polling approach for MVP
    setInterval(async () => {
      const gameState = await this.contract.getGameState();
      const playerCount = await this.contract.getPlayerCount();
      this.updateCallback({ gameState, playerCount });
    }, 2000); // Poll every 2 seconds
  }
}
```

---

## 📋 **NICE TO HAVE - Post-Hackathon Roadmap**

### **Phase 2: Enhanced UI/UX** (Post-Hackathon Week 1)
- [ ] **Real-time Event Subscription** - Replace polling with WebSocket events
- [ ] **Better Error Handling** - User-friendly error messages and retry logic
- [ ] **Loading States** - Spinners and progress indicators for transactions
- [ ] **Transaction History** - Show recent contract interactions
- [ ] **Mobile Responsive** - Optimize for mobile devices

### **Phase 3: Advanced Features** (Post-Hackathon Week 2-3)
- [ ] **Multiple Wallet Support** - MetaMask, WalletConnect, mobile wallets
- [ ] **Account Management** - Switch accounts, multiple connections
- [ ] **Game History** - Past games, statistics, leaderboards
- [ ] **Advanced Admin Tools** - Batch operations, scheduling, analytics
- [ ] **Player Profiles** - Stats, achievements, game history

### **Phase 4: Production Ready** (Post-Hackathon Month 2)
- [ ] **State Management** - Redux/Zustand for complex state
- [ ] **Offline Support** - Service workers, local storage
- [ ] **Performance Optimization** - Lazy loading, code splitting
- [ ] **Accessibility** - Screen readers, keyboard navigation
- [ ] **Testing Suite** - Unit tests, integration tests, E2E tests

---

## 🛠 **Quick Development Setup**

### **Installation** (5 minutes)
```bash
cd src/client
npm install @polkadot/api @polkadot/extension-dapp
```

### **Contract ABI Setup**
```bash
# Copy contract metadata after building
cp ../../agario_buyin/target/ink/agario_buyin.json js/
```

### **Basic Integration Test**
```javascript
// Quick test in browser console
const api = new ApiPromise(WsProvider('ws://localhost:9944'));
await api.isReady;
console.log('API connected');
```

---

## 🎯 **Demo Flow for Judges** (2-minute demo)

### **Enhanced Demo Script (3 minutes):**
1. **[45s] Setup & Configuration**:
   - "Here's our complete agario smart contract with timing and game integration"
   - "Admin configures game: 1 DOT buy-in, 2-minute registration, 3-minute game, 2 min players"
   - "Contract starts accepting registrations with live countdown timer"

2. **[45s] Player Registration with Timing**:
   - "Players have 2 minutes to register - watch the countdown"
   - "Multiple players join, see real-time updates: player count, prize pool, timer"
   - "Registration deadline hits - game automatically begins!"

3. **[60s] Live Game with Contract Integration**:
   - "Agario game starts with only contract-registered players"
   - "Game server tracks player performance and survival"
   - "Time countdown shows 3-minute game limit"
   - "Winner detection: either last player standing OR time expires"

4. **[30s] Automatic Winner Detection & Prize Distribution**:
   - "Game ends (time limit/last standing) - server reports winners to contract"
   - "Admin confirms winners with percentage distribution (50%/30%/20%)"
   - "Smart contract automatically distributes prizes to winner wallets"
   - "Transaction confirmed on-chain, funds transferred instantly"

5. **[20s] Complete Cycle**:
   - "Game resets to Inactive state, ready for next round"
   - "Full game lifecycle: registration → game → winners → reset"
   - "All timing, player tracking, and payments fully automated"

---

## 🚨 **MVP Risk Mitigation & Backup Plans**

### **Technical Backup Plans:**
1. **Wallet Connection Issues**:
   - Pre-connect wallets before demo
   - Have screenshots/video as backup
   - Manual account switching prepared

2. **Contract Call Failures**:
   - Test all functions before demo
   - Have local node as backup
   - Prepare simulated responses if needed

3. **Event Monitoring Issues**:
   - Polling fallback implemented
   - Manual refresh buttons as backup
   - Static state updates if real-time fails

### **Demo Environment Setup:**
```bash
# Terminal 1: Local node
substrate-contracts-node --dev

# Terminal 2: Web server
cd src/client && python -m http.server 8080

# Browser: Multiple wallets
# - Import //Alice (admin)
# - Import //Bob (player 1)
# - Import //Charlie (player 2)
```

---

## 🏆 **Success Criteria**

### **Must Demonstrate:**
- ✅ **Wallet Connection**: Both admin and player wallets connect
- ✅ **Contract Interaction**: Start game, join game, end game all work
- ✅ **Live Updates**: UI reflects contract state changes
- ✅ **Multi-User**: Different accounts interact with same contract

### **Technical Requirements:**
- ✅ Frontend connects to smart contract
- ✅ Basic transactions (start, deposit, end) work
- ✅ Events trigger UI updates
- ✅ Error handling doesn't break demo

### **Judge Evaluation:**
- ✅ **Clear Value Prop**: Judges understand the gaming use case
- ✅ **Technical Competence**: Smart contract + frontend integration works
- ✅ **User Experience**: Demo flows smoothly and makes sense
- ✅ **Implementation Quality**: Code is clean and functional

---

## 📁 **File Structure for MVP**

```
src/client/
├── index.html                 # Updated with wallet/contract UI
├── js/
│   ├── wallet-service.js      # ✨ NEW: Polkadot.js wallet connection
│   ├── contract-service.js    # ✨ NEW: Smart contract interface
│   ├── event-monitor.js       # ✨ NEW: Basic event listening
│   ├── demo-integration.js    # ✨ NEW: Main integration logic
│   ├── agario_buyin.json      # ✨ NEW: Contract ABI
│   ├── app.js                 # Modified: Add contract hooks
│   ├── global.js              # Modified: Add wallet state
│   └── chat-client.js         # Modified: Add contract notifications
├── css/
│   └── main.css               # Modified: Basic wallet/contract styling
```

---

## 🔧 **Key Implementation Decisions for Speed**

### **Simplifications for MVP:**
- **Polling over WebSockets** - Simpler to implement, good enough for demo
- **Basic Error Handling** - Console logs and alerts, not fancy UI
- **Polkadot.js Only** - Skip multi-wallet complexity
- **Simple State Management** - Global variables, not Redux
- **Minimal Styling** - Functional over beautiful
- **AccountId Format** - Keep existing format, H160 migration later

### **What We're Skipping:**
- Complex state management (Redux, MobX)
- Advanced error recovery
- Mobile optimization
- Accessibility features
- Performance optimization
- Comprehensive testing
- Advanced UI animations
- Multi-chain support

---

*🎯 Focus: Get a working demo that clearly shows smart contract + frontend integration. Polish comes later!*
