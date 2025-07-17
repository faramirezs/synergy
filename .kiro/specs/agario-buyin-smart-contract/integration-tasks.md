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

### **Task 3: Admin Interface** (60 minutes)
- [ ] Add admin check: compare connected account with contract admin
- [ ] Create admin panel in start menu (visible only to admin)
- [ ] Add "Start Game" button with buy-in amount input
- [ ] Add "End Game" button with winner selection (simple text input)
- [ ] Add current game state display
- [ ] **MVP Success**: Admin can start/end games via UI

### **Task 4: Player Interface** (45 minutes)
- [ ] Add "Join Game" button (visible when game is AcceptingDeposits)
- [ ] Implement deposit transaction with buy-in amount
- [ ] Show player count and prize pool in real-time
- [ ] Display registration status (joined/not joined)
- [ ] **MVP Success**: Players can join games and see live updates

### **Task 5: Basic Event Monitoring** (30 minutes)
- [ ] Listen for `GameStarted`, `PlayerJoined`, `GameEnded` events
- [ ] Update UI when events are received
- [ ] Show simple notifications in chat area
- [ ] Refresh game state on events
- [ ] **MVP Success**: UI updates automatically when contract state changes

**Frontend MVP TOTAL: ~3 hours** ⏱️

---

## 🎮 **Simple UI Integration Points**

### **Start Menu Additions** (`src/client/index.html`)
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
  <h3>Admin Controls</h3>
  <div>
    <input type="number" id="buy-in-amount" placeholder="Buy-in (DOT)" step="0.1">
    <button id="start-game">Start Game</button>
  </div>
  <div>
    <input type="text" id="winner-addresses" placeholder="Winner addresses (comma-separated)">
    <button id="end-game">End Game</button>
  </div>
</div>

<div id="player-section">
  <div id="game-info">
    <p>Game State: <span id="game-state">Inactive</span></p>
    <p>Players: <span id="player-count">0</span></p>
    <p>Prize Pool: <span id="prize-pool">0</span> DOT</p>
  </div>
  <button id="join-game" style="display:none">Join Game</button>
</div>
```

### **Basic Contract Service** (`src/client/js/contract-service.js`)
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

  async startGame(signer, buyInAmount) {
    return await this.contract.tx.startGame({ gasLimit: -1 }, buyInAmount)
      .signAndSend(signer);
  }

  async deposit(signer, amount) {
    return await this.contract.tx.deposit({ gasLimit: -1, value: amount })
      .signAndSend(signer);
  }

  async endGame(signer, winners) {
    return await this.contract.tx.endGame({ gasLimit: -1 }, winners)
      .signAndSend(signer);
  }
}
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

### **Demo Script:**
1. **[30s] Setup**:
   - "Here's our agario smart contract with frontend integration"
   - "I'll connect as admin first" → Connect wallet, show admin panel

2. **[30s] Start Game**:
   - "Starting new game with 1 DOT buy-in" → Click Start Game
   - "Contract state updates to AcceptingDeposits" → Show state change

3. **[45s] Player Registration**:
   - "Switch to player account" → Connect different wallet
   - "Player joins by depositing buy-in" → Click Join Game
   - "See live updates: player count and prize pool" → Show real-time data

4. **[30s] End Game**:
   - "Back to admin to end game" → Switch wallet
   - "Select winners and distribute prizes" → End Game with winner
   - "Contract automatically transfers funds" → Show final state

5. **[15s] Wrap-up**:
   - "Game resets to Inactive, ready for next round"
   - "All interactions are on-chain and verifiable"

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
