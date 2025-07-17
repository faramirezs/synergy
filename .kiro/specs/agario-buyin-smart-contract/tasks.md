# 🚀 HACKATHON MVP - Agario Smart Contract Tasks

> **⚡ HACKATHON FOCUS**: Minimal Viable Product for working demo. Advanced features marked for post-hackathon development.

## 🎯 **MVP GOAL**: Working agario contract with basic admin controls and player registration that can be demonstrated in the hackathon.

---

## 🔥 **MUST HAVE - Core MVP Tasks** (Target: 4-6 hours)

### **✅ COMPLETED**
- [x] **Task 1: Project Setup & Foundation** ✅ DONE
  - ✅ Contract builds successfully with `cargo contract build`
  - ✅ Unit tests pass (2/2 passing)
  - ✅ Basic structure in place with AccountId (keeping simple for MVP)
  - ✅ All dependencies configured correctly

### **🔥 MVP CRITICAL PATH**

- [ ] **Task 2: Core Storage & Types** (30 min)
  ```rust
  #[ink(storage)]
  pub struct AgarioBuyin {
      admin: AccountId,
      game_state: GameState,
      buy_in_amount: Balance,
      players: Mapping<AccountId, ()>,
      player_count: u32,
      prize_pool: Balance,
  }
  ```
  - Simple GameState enum: `Inactive | AcceptingDeposits | InProgress`
  - Basic Error enum: `NotAdmin | WrongState | WrongAmount`
  - _Target: Get storage compiling_

- [ ] **Task 3: Essential Functions** (90 min)
  - `start_game(buy_in: Balance)` - Admin starts game, sets buy-in
  - `deposit()` - Payable function for players to join
  - `end_game(winners: Vec<AccountId>)` - Admin distributes prizes
  - `get_game_state()`, `get_player_count()` - Basic queries
  - _Target: Core game flow working_

- [ ] **Task 4: Basic Events** (30 min)
  ```rust
  #[ink(event)]
  pub struct GameStarted { buy_in: Balance }

  #[ink(event)]
  pub struct PlayerJoined { player: AccountId }

  #[ink(event)]
  pub struct GameEnded { winners: Vec<AccountId> }
  ```
  - _Target: Events for frontend integration_

- [ ] **Task 5: MVP Testing** (45 min)
  - Unit tests for happy path: start → deposit → end
  - Test admin access control
  - Test basic error cases
  - _Target: `cargo test` passes with confidence_

- [ ] **Task 6: Contract Deployment** (30 min)
  - `cargo contract build --release`
  - Deploy to local node or testnet
  - Verify contract instantiation works
  - _Target: Live contract for frontend_

**MVP TOTAL: ~4 hours** ⏱️

---

## 🎮 **MVP Frontend Integration** (Target: 2-3 hours)

- [ ] **Task 7: Basic Wallet Connection** (45 min)
  - Connect Polkadot.js extension
  - Display connected account
  - Basic error handling

- [ ] **Task 8: Admin Panel** (60 min)
  - Start game button (admin only)
  - Set buy-in amount
  - End game with winner selection
  - Show current game state

- [ ] **Task 9: Player Interface** (45 min)
  - Deposit button when game active
  - Show current players count
  - Registration status display

- [ ] **Task 10: Event Monitoring** (30 min)
  - Listen for contract events
  - Update UI on state changes
  - Basic notifications

**Frontend TOTAL: ~3 hours** ⏱️

---

## 📋 **NICE TO HAVE - Post-Hackathon Roadmap**

### **Phase 2: Enhanced Features** (Post-Hackathon Week 1)
- [ ] **H160 Migration** - Upgrade to ink! v6 Ethereum-style addresses
- [ ] **Advanced Error Handling** - Comprehensive error messages
- [ ] **Security Patterns** - Checks-effects-interactions, reentrancy protection
- [ ] **Registration Deadlines** - Time-based game progression
- [ ] **Admin Fee System** - Percentage-based prize distribution

### **Phase 3: Production Ready** (Post-Hackathon Week 2-3)
- [ ] **Comprehensive Testing** - E2E tests, edge cases, security tests
- [ ] **Multiple Wallet Support** - MetaMask, mobile wallets
- [ ] **Advanced UI/UX** - Mobile responsive, animations, better design
- [ ] **Event System** - Real-time updates, offline handling
- [ ] **Gas Optimization** - Storage efficiency, batch operations

### **Phase 4: Advanced Features** (Post-Hackathon Month 2)
- [ ] **Multi-Game Support** - Multiple concurrent games
- [ ] **Tournament Mode** - Bracket-style competitions
- [ ] **Analytics Dashboard** - Game statistics, player metrics
- [ ] **Cross-Chain Integration** - Bridge to other networks
- [ ] **DAO Governance** - Community-driven admin selection

---

## 🛠 **Development Commands for MVP**

### **Contract Development**
```bash
# Core development loop
cargo contract test                    # Fast unit testing
cargo contract build --release        # Build for deployment
cargo contract instantiate --suri //Alice --args 5  # Deploy to testnet

# Quick validation
cargo check                           # Fast syntax check
cargo fmt                            # Auto-format code
```

### **Local Testing Setup**
```bash
# Terminal 1: Start local node
substrate-contracts-node --dev

# Terminal 2: Deploy and test
cd agario_buyin
cargo contract build --release
cargo contract instantiate --suri //Alice --args 5 -x
cargo contract call --suri //Bob --contract <CONTRACT_ADDR> --message deposit --value 1000000000000 -x
```

---

## 🎯 **Success Criteria for MVP Demo**

### **Must Demonstrate:**
1. ✅ **Admin Flow**: Connect wallet → Start game → Set buy-in
2. ✅ **Player Flow**: Connect different wallet → Deposit → Join game
3. ✅ **Game End**: Admin selects winners → Prize distribution
4. ✅ **State Updates**: UI reflects contract state changes in real-time

### **Demo Script (2 minutes):**
1. **Admin starts game** - "I'm the admin, starting a new game with 1 DOT buy-in"
2. **Players join** - "Players connect wallets and deposit to join"
3. **Game progress** - "We can see X players registered, prize pool growing"
4. **Game ends** - "Admin declares winners, prizes distributed automatically"
5. **State reset** - "Contract ready for next game"

---

## 🔧 **Simplified Architecture Decisions for MVP**

### **What We're Keeping Simple:**
- **AccountId instead of H160** - Avoid migration complexity for demo
- **Basic Error Handling** - Simple enum, user-friendly messages later
- **Single Game Mode** - One game at a time, no multiple instances
- **Manual Winner Selection** - Admin picks winners, automated scoring later
- **Polkadot.js Only** - Skip multi-wallet complexity for MVP

### **What We'll Improve Post-Hackathon:**
- **H160 Migration** - Ethereum-style addresses for better UX
- **Automated Game Flow** - Time-based transitions, registration deadlines
- **Advanced Security** - Reentrancy protection, formal verification
- **Cross-Chain Support** - Bridge to Ethereum, other networks
- **Mobile App** - Native iOS/Android with better UX

---

## 🚨 **MVP Risk Mitigation**

### **Time Management:**
- ⏰ **4-hour contract target** - If behind, cut testing/optimization
- ⏰ **3-hour frontend target** - If behind, skip animations and focus on core demo
- ⏰ **1-hour buffer** - Final integration testing and bug fixes

### **Technical Risks:**
- 🐛 **Deployment Issues** - Have local node ready as backup
- 🐛 **Frontend Integration** - Test contract calls early, not at the end
- 🐛 **Wallet Connection** - Have multiple test accounts ready
- 🐛 **Event Monitoring** - Polling fallback if subscription fails

### **Demo Backup Plan:**
- 📱 **Screenshots/Video** - Record successful demo in case of live issues
- 🧪 **Local Demo** - Run everything locally if network issues
- 📋 **Manual Simulation** - Talk through the flow with UI mockups if needed

---

## 🏆 **Success Metrics**

### **Technical Success:**
- ✅ Contract deploys and instantiates successfully
- ✅ All core functions work (start, deposit, end)
- ✅ Frontend connects and calls contract methods
- ✅ Events are emitted and received by frontend

### **Demo Success:**
- ✅ Complete user flow demonstrated in <2 minutes
- ✅ Multiple wallets interact with same contract
- ✅ Prize distribution happens automatically
- ✅ Audience understands the concept and implementation

### **Judges' Criteria Alignment:**
- ✅ **Innovation**: Novel application of smart contracts to gaming
- ✅ **Technical Execution**: Working ink! contract with frontend
- ✅ **User Experience**: Clear demo showing end-to-end flow
- ✅ **Business Potential**: Clear path to production deployment

---

*🎯 Remember: The goal is a working demo, not a production-ready system. Focus on core functionality that showcases the concept clearly.*
