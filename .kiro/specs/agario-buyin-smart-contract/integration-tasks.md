# Smart Contract Integration Tasks - ink! v6.0.0-alpha (H160 Migration)

> **🔄 MIGRATION NOTE**: This integration targets ink! v6.0.0-alpha which uses **pallet-revive** and **H160 addresses**. Key frontend changes:
> - **AccountId → H160**: All wallet addresses now use Ethereum-style 20-byte format (0x1234...abcd)
> - **Wallet Integration**: Compatible with Ethereum wallets (MetaMask, etc.) alongside Polkadot wallets
> - **Address Handling**: Frontend must handle H160 format instead of SS58 Substrate addresses
> - **Event Filtering**: Events use H160 addresses for improved indexing and compatibility

## Integration Plan: Agario Buy-in Smart Contract Frontend Integration

- [ ] 1. Set up Polkadot.js API integration and wallet connection (H160 Support)
  - **🔄 H160 DEPS**: Install @polkadot/api, @polkadot/extension-dapp, @polkadot/api-contract dependencies with H160 support
  - **🔄 H160 WALLET**: Create wallet connection service in `src/client/js/wallet-service.js` with MetaMask-style UI integration for H160 addresses
  - **🔄 ETHEREUM COMPAT**: Add dual wallet support: Polkadot extension (with H160 conversion) + MetaMask/Ethereum wallets
  - Add wallet connection button to start menu UI alongside existing Play/Spectate buttons
  - **🔄 H160 DISPLAY**: Implement account selection and balance display in `src/client/index.html` start menu with H160 address format
  - Add wallet connection status to global state management in `src/client/js/global.js`
  - **🔄 H160 VALIDATION**: Create error handling for wallet connection failures with H160 address validation
  - **🔄 H160 TESTING**: Test wallet connection flow with testnet and mainnet configurations using H160 addresses
  - _Requirements: 1.1, 2.1, 6.1_

- [ ] 2. Create smart contract interface and ABI integration (H160 Migration)
  - Generate contract ABI from compiled smart contract metadata.json with H160 type definitions
  - **🔄 H160 SERVICE**: Create contract interface service in `src/client/js/contract-service.js` with typed contract methods for H160 addresses
  - Implement contract instantiation with deployed contract address configuration
  - **🔄 H160 METHODS**: Add contract method wrappers for: new(), start_game(), deposit(), try_begin_game(), end_game(winners: **H160[]**), get_game_state()
  - **🔄 H160 QUERIES**: Add query methods: is_player_registered(player: **H160**), get_admin() -> **H160**
  - **🔄 H160 EVENTS**: Create contract event listeners for: GameStarted, PlayerDeposited { player: **H160** }, GameBegan, GameEnded { winners: **H160[]** } events
  - Implement gas estimation and transaction fee calculation display
  - Add contract call status monitoring with pending/success/failure states
  - _Requirements: 1.2, 5.1, 7.1_

- [ ] 3. Implement game administrator interface and controls (H160 Administration)
  - **🔄 H160 AUTH**: Add admin authentication check using connected wallet H160 address vs contract admin H160
  - Create admin control panel in `src/client/index.html` with conditional visibility based on admin status
  - Add start game form with buy-in amount input (Balance) and registration period input (Timestamp)
  - Implement start_game() contract call with form validation and user feedback
  - **🔄 H160 WINNERS**: Add end game interface with winner selection (multiple **H160** inputs or dropdown with address validation)
  - **🔄 H160 DISTRIBUTION**: Create end_game() contract call with winner H160 addresses and prize distribution display
  - Add admin fee configuration display and calculation preview
  - Integrate admin controls with existing chat commands system (extend `src/client/js/chat-client.js`)
  - **🔄 H160 COMMANDS**: Add chat commands like `/admin-status` showing current admin H160 address
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 4.1, 4.2, 4.3_

- [ ] 4. Create player registration and deposit interface (H160 Registration)
  - Add game registration status display to main game UI showing current game state
  - Create deposit button in start menu when game is in AcceptingDeposits state
  - **🔄 H160 DEPOSIT**: Implement deposit() contract call with buy-in amount validation and balance checking from H160 address
  - Add registration deadline countdown timer with real-time updates
  - Create player registration confirmation modal with transaction hash display
  - **🔄 H160 PLAYERS**: Add registered players list/counter display in leaderboard area (`#status` div) showing H160 addresses (truncated for UI)
  - **🔄 H160 FORMATTING**: Implement H160 address formatting utilities (e.g., 0x1234...abcd display format)
  - Implement registration period expiration handling with automatic UI updates
  - Create deposit transaction monitoring with pending/success/failure notifications
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 5. Implement automatic game state transitions and monitoring (H160 State Management)
  - **🔄 H160 POLLING**: Create contract event polling service for real-time game state updates with H160 event filtering
  - Implement try_begin_game() automatic call after registration deadline expires
  - Add game state synchronization between contract and frontend UI states
  - Create game state change notifications integrated with existing chat system
  - Implement automatic UI updates when game transitions between states (Inactive → AcceptingDeposits → InProgress)
  - Add game state persistence in localStorage for page refresh handling
  - Create game state conflict resolution for multiple browser tabs
  - **🔄 H160 SYNC**: Ensure H160 address consistency across all state management operations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.2_

- [ ] 6. Integrate prize distribution and winner declaration (H160 Prize System)
  - **🔄 H160 SELECTION**: Create winner selection interface for game administrators post-game with H160 address input validation
  - Add winner announcement display integrated with existing leaderboard system (`src/client/js/app.js` leaderboard handling)
  - **🔄 H160 DISPLAY**: Display winner H160 addresses with proper formatting and ENS name resolution if available
  - Implement prize calculation display showing admin fee and winner payouts
  - **🔄 H160 MONITORING**: Create prize distribution transaction monitoring with success/failure handling for H160 transfers
  - Add winner notification system using existing chat message system
  - Implement prize claim confirmation with transaction hash display
  - Create post-game statistics display showing total prize pool and distribution
  - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 7. Add comprehensive error handling and user feedback (H160 Error Handling)
  - **🔄 H160 ERRORS**: Create error message mapping for all contract Error enum variants with H160-specific messages
  - Implement user-friendly error messages for: NotAdmin, GameNotInCorrectState, IncorrectBuyInAmount, etc.
  - Add error display integration with existing chat system (`src/client/js/chat-client.js`)
  - **🔄 H160 VALIDATION**: Add H160 address format validation with helpful error messages
  - Create transaction failure handling with retry mechanisms
  - Add network error handling for connection issues
  - **🔄 H160 BALANCE**: Implement insufficient balance error handling with helpful guidance for H160 addresses
  - Create error logging and debugging tools for development
  - **🔄 H160 DEBUGGING**: Add H160 address debugging utilities for development troubleshooting
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 8. Implement real-time event monitoring and UI updates (H160 Event System)
  - **🔄 H160 SUBSCRIPTION**: Create contract event subscription service using Polkadot.js API with H160 event filtering
  - **🔄 H160 HANDLERS**: Add event handlers for GameStarted, PlayerDeposited { player: **H160** }, GameBegan, GameEnded { winners: **H160[]** } events
  - **🔄 H160 UPDATES**: Implement real-time UI updates for player count, prize pool, and game state with H160 player tracking
  - **🔄 H160 LEADERBOARD**: Create event-driven leaderboard updates showing registered players with H160 addresses
  - **🔄 H160 INDEXING**: Add event filtering and indexing for efficient event queries by H160 addresses
  - Implement event persistence for offline/reconnection scenarios
  - Create event-based notifications using existing notification system
  - **🔄 H160 NOTIFICATIONS**: Add H160-specific notification formatting (e.g., "Player 0x1234...abcd deposited 100 tokens")
  - _Requirements: 5.1, 5.4, 8.3_

- [ ] 9. Create game flow integration and state management (H160 Game Flow)
  - **🔄 H160 VALIDATION**: Modify existing game start flow (`src/client/js/app.js` startGame function) to check contract state with H160 validation
  - Add contract state validation before allowing game participation
  - Create game flow coordinator that manages contract state and game logic state
  - **🔄 H160 RESTRICTIONS**: Implement game participation restrictions based on contract registration using H160 addresses
  - **🔄 H160 WINNERS**: Add winner determination integration with existing game end logic (`src/server/server.js` game end events) using H160 addresses
  - Create game result validation against contract state
  - Implement game session management with contract lifecycle
  - **🔄 H160 SESSION**: Track player sessions using H160 addresses for consistency
  - _Requirements: 6.1, 8.1, 8.2_

- [ ] 10. Add transaction monitoring and status management (H160 Transaction System)
  - **🔄 H160 QUEUE**: Create transaction queue management for multiple simultaneous operations with H160 address tracking
  - Implement transaction confirmation monitoring with block confirmation counts
  - Add transaction status display with progress indicators
  - **🔄 H160 HISTORY**: Create transaction history logging and display with H160 address filtering
  - Implement transaction retry mechanisms for failed operations
  - Add gas price optimization and estimation features
  - Create transaction cost calculation and display for user budgeting
  - **🔄 H160 TRACKING**: Add H160-specific transaction tracking and status management
  - _Requirements: 6.2, 6.3_

- [ ] 11. Implement security features and validation (H160 Security)
  - **🔄 H160 VALIDATION**: Add client-side validation for all contract parameters with H160 address format checking
  - Create secure parameter encoding for contract calls
  - **🔄 H160 SIGNATURES**: Implement signature verification for administrative actions using H160 addresses
  - Add rate limiting for contract calls to prevent spam
  - **🔄 H160 SANITIZATION**: Create input sanitization for all user inputs including H160 address validation
  - Implement client-side balance validation before contract calls
  - **🔄 H160 SESSION**: Add session security with wallet connection validation for H160 addresses
  - **🔄 ETHEREUM SECURITY**: Add Ethereum wallet security considerations (MetaMask integration, etc.)
  - _Requirements: 6.1, 6.4, 7.5_

- [ ] 12. Create responsive UI components and mobile optimization (H160 UI/UX)
  - Design mobile-responsive contract interaction components
  - Add touch-friendly contract operation buttons
  - **🔄 H160 MOBILE**: Create mobile-optimized deposit and registration flows with H160 address handling
  - **🔄 H160 RESPONSIVE**: Implement responsive admin control panel with H160 address input fields
  - Add mobile-specific error handling and feedback
  - **🔄 H160 TOUCH**: Create touch-friendly winner selection interface with H160 address picker
  - **🔄 H160 DISPLAY**: Optimize contract status display for mobile screens with abbreviated H160 addresses
  - **🔄 H160 ACCESSIBILITY**: Add accessibility features for H160 address reading and interaction
  - _Requirements: 8.4, 8.5_

- [ ] 13. Add comprehensive testing and validation (H160 Testing)
  - **🔄 H160 UNIT**: Create unit tests for contract integration service using Jest/Mocha with H160 address mocking
  - **🔄 H160 INTEGRATION**: Implement integration tests for complete user flows (registration, deposit, game end) with H160 addresses
  - Add end-to-end testing for admin operations and player interactions
  - **🔄 H160 TESTNET**: Create testnet integration testing with mock contract deployment using H160 addresses
  - **🔄 H160 EVENTS**: Implement contract event testing with simulated scenarios using H160 data
  - Add error handling testing for all contract error conditions
  - Create performance testing for contract call optimization
  - **🔄 H160 VALIDATION**: Add H160 address format validation testing
  - _Requirements: 7.5, 8.5_

- [ ] 14. Implement configuration management and deployment (H160 Configuration)
  - **🔄 H160 CONFIG**: Create environment-specific contract configuration (testnet/mainnet addresses) with H160 format
  - Add contract deployment scripts and configuration management
  - Implement feature flags for contract integration (enable/disable)
  - Create contract upgrade handling and version management
  - **🔄 H160 VALIDATION**: Add configuration validation for contract parameters with H160 address checking
  - **🔄 H160 NETWORK**: Implement contract address validation and network detection for H160 compatibility
  - Create deployment documentation and configuration guides
  - **🔄 MIGRATION DOCS**: Add AccountId → H160 migration documentation for deployment
  - _Requirements: 8.1, 8.2_

- [ ] 15. Add analytics and monitoring integration (H160 Analytics)
  - **🔄 H160 ANALYTICS**: Create contract interaction analytics tracking with H160 address anonymization
  - **🔄 H160 METRICS**: Implement game participation metrics collection with H160 player tracking
  - Add prize distribution analytics and reporting
  - **🔄 H160 BEHAVIOR**: Create user behavior tracking for contract features with H160 pattern analysis
  - Implement performance monitoring for contract operations
  - Add error tracking and reporting for contract issues
  - **🔄 H160 DASHBOARD**: Create dashboard for contract usage statistics with H160 address insights
  - **🔄 PRIVACY**: Ensure H160 address privacy compliance in analytics collection
  - _Requirements: 8.3, 8.4_

## Integration Architecture Overview

### Frontend Components Structure (H160 Updated):
```
src/client/js/
├── wallet-service.js        # Polkadot wallet + Ethereum wallet connection (H160 support)
├── contract-service.js      # Smart contract interface and ABI handling (H160 methods)
├── game-contract.js         # Game-specific contract integration (H160 players/admin)
├── admin-controls.js        # Administrator interface components (H160 validation)
├── player-registration.js   # Player deposit and registration UI (H160 addresses)
├── prize-distribution.js    # Winner selection and prize handling (H160 winners)
├── event-monitor.js         # Contract event monitoring service (H160 events)
├── transaction-manager.js   # Transaction status and monitoring (H160 tracking)
├── h160-utils.js           # H160 address utilities and formatting ✨ NEW
└── contract-utils.js        # Utility functions for contract operations
```

### H160 Address Utilities (New Component):
```javascript
// src/client/js/h160-utils.js
export class H160Utils {
  // Format H160 for display: 0x1234567890abcdef1234567890abcdef12345678 → 0x1234...5678
  static formatAddress(h160Address) { ... }

  // Validate H160 format
  static isValidH160(address) { ... }

  // Convert between formats if needed
  static convertFromAccountId(accountId) { ... }

  // Generate H160 from wallet
  static getH160FromWallet(wallet) { ... }
}
```

### UI Integration Points (H160 Updates):
- **Start Menu**: Add wallet connection with H160 support, registration status, and deposit options
- **Game UI**: Integrate contract status display with existing leaderboard showing H160 players
- **Admin Panel**: Add contract administration controls with H160 address validation
- **Chat System**: Extend for contract notifications with H160 address formatting
- **Settings**: Add contract configuration options with H160 network detection

### Contract Integration Flow (H160 Migration):
1. **Game Session Start**: Admin (H160) calls start_game() → UI updates to show registration
2. **Player Registration**: Players connect wallet → get H160 address → deposit() → registration confirmation
3. **Game Begin**: Auto-call try_begin_game() after deadline → game starts with H160 player tracking
4. **Game End**: Determine winners → admin calls end_game(winners: H160[]) → prize distribution
5. **Reset**: Contract returns to Inactive state → ready for new game

### Error Handling Strategy (H160 Enhanced):
- Map contract errors to user-friendly messages with H160 context
- Integrate with existing chat notification system
- Provide retry mechanisms for failed transactions
- Add fallback UI states for contract unavailability
- **H160 Specific**: Address format validation errors with helpful guidance

### Testing Strategy (H160 Focused):
- Unit tests for each contract service module with H160 mocking
- Integration tests for complete user flows with H160 scenarios
- End-to-end tests with testnet contract deployment using H160 addresses
- Performance tests for contract operation optimization
- **H160 Testing**: Address format validation and conversion testing

### Wallet Integration Strategy (H160 Support):
```javascript
// Dual wallet support for H160 compatibility
const walletStrategies = {
  polkadot: {
    // Traditional Polkadot extension with H160 conversion
    connect: () => connectPolkadotExtension(),
    getH160: (account) => convertAccountIdToH160(account)
  },
  ethereum: {
    // Direct Ethereum wallet support (MetaMask, etc.)
    connect: () => connectEthereumWallet(),
    getH160: (account) => account // Direct H160 support
  }
};
```

## 🔄 **H160 Migration Checklist for Frontend**

### **Required Changes:**
- [ ] **Address Display**: Update all AccountId displays to H160 format (0x1234...abcd)
- [ ] **Wallet Integration**: Add Ethereum wallet support alongside Polkadot wallets
- [ ] **Event Handling**: Update event listeners for H160 address fields
- [ ] **Form Validation**: Add H160 address format validation
- [ ] **Storage**: Update localStorage/state to use H160 addresses
- [ ] **API Calls**: Update all contract method calls to use H160 parameters
- [ ] **Testing**: Update all test data to use H160 addresses
- [ ] **Documentation**: Update integration docs with H160 examples

### **Benefits for Frontend:**
- **Universal Compatibility**: Works with both Polkadot and Ethereum wallets
- **Better UX**: Familiar address format for Ethereum users
- **Cross-Chain Ready**: Easier integration with Ethereum ecosystem
- **Gas Efficiency**: Smaller addresses improve transaction costs

### **Migration Timeline:**
1. **Phase 1**: Update core address handling and validation
2. **Phase 2**: Implement dual wallet support
3. **Phase 3**: Update UI components and event handling
4. **Phase 4**: Comprehensive testing with H160 scenarios
5. **Phase 5**: Documentation and deployment guides
