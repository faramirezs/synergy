# Implementation Plan - ink! v6.0.0-alpha (H160 Migration)

> **🔄 MIGRATION NOTE**: This implementation targets ink! v6.0.0-alpha which uses **pallet-revive** instead of pallet-contracts. Key changes:
> - **AccountId → H160**: Uses Ethereum-style 20-byte addresses instead of 32-byte Substrate addresses
> - **Enhanced Gas Model**: Better gas estimation and execution
> - **Revive Compatibility**: Compatible with Ethereum tooling and addresses
> - **Backward Compatibility**: Smart contracts need migration for H160 address format

- [x] 1. Set up project structure and core contract foundation ✅ COMPLETED
  - ✅ Create new ink! contract project using `cargo contract new agario_buyin`
  - ✅ Configure Cargo.toml with proper dependencies: ink v6.0.0-alpha, scale, scale-info with SCALE codec derives
  - ✅ Set up lib.rs with `#![cfg_attr(not(feature = "std"), no_std, no_main)]` for Wasm compatibility
  - ✅ Configure crate-type as `["cdylib"]` for Wasm blob generation
  - ✅ Add dev-dependencies for ink_e2e testing framework
  - ✅ Set up feature flags: default = ["std"], std = ["ink/std"], e2e-tests = []
  - ✅ Create complete #[ink::contract] module structure with storage, constructor, and basic functionality
  - ✅ Implement GameState enum and Error enum with proper SCALE codec derives
  - ✅ Add constructor with validation and unit tests (2/2 passing)
  - ✅ Verify successful build: `cargo contract build --release` generates optimized 1.9KB wasm
  - ✅ **H160 Migration**: Update all address types from AccountId to H160 for Ethereum-style addresses
  - _Requirements: 7.1, 7.3_ ✅ **COMPLETED**

- [ ] 2. Implement core data types and storage structure (H160 Migration)
  - Define GameState enum with #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)] and #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
  - Create Error enum with variants: NotAdmin, GameNotInCorrectState, IncorrectBuyInAmount, PlayerAlreadyDeposited, NoWinners, RegistrationPeriodNotOver, RegistrationPeriodOver, TransferFailed
  - **🔄 H160 MIGRATION**: Implement #[ink(storage)] AgarioBuyin struct with: game_admin: **H160**, admin_fee_percentage: u8, game_state: GameState, buy_in_amount: Balance, registration_deadline: Timestamp, players: Mapping<**H160**, ()>, player_count: u32, prize_pool: Balance
  - Use ink::storage::Mapping<**H160**, ()> for gas-efficient player storage with O(1) lookups
  - Add proper SCALE codec derives for all custom types to ensure ABI compatibility
  - **Note**: H160 represents 20-byte Ethereum-style addresses (0x1234...abcd format)
  - _Requirements: 5.1, 7.3, 8.1_

- [ ] 3. Implement contract constructor with validation (H160 Update)
  - Create #[ink(constructor)] pub fn new(admin_fee: u8) -> Result<Self, Error> function (constructors are implicitly payable)
  - Add validation: if admin_fee > 100 { return Err(Error::InvalidAdminFee) } before creating Self instance
  - **🔄 H160 MIGRATION**: Use Self::env().caller() to set game_admin to deployer's **H160** address
  - Initialize all fields: game_state: GameState::Inactive, players: Mapping::default(), player_count: 0, prize_pool: 0, registration_deadline: 0, buy_in_amount: 0
  - Return Ok(Self { game_admin, admin_fee_percentage: admin_fee, ... }) on successful validation
  - Write #[ink::test] unit tests using ink::env::test module for environment mocking
  - **🔄 H160 TESTING**: Test with mock H160 addresses (0x1234...abcd format) instead of AccountId
  - Test valid admin fees (0-100) with assert!(matches!(result, Ok(_))) and invalid fees (>100) with assert!(matches!(result, Err(Error::InvalidAdminFee)))
  - _Requirements: 1.1, 1.2_

- [ ] 4. Implement game administration functions (H160 Update)
  - Create #[ink(message)] pub fn start_game(&mut self, buy_in: Balance, registration_period: Timestamp) -> Result<(), Error>
  - **🔄 H160 MIGRATION**: Add access control: if self.env().caller() != self.game_admin { return Err(Error::NotAdmin) } (caller returns H160)
  - Implement state validation: if self.game_state != GameState::Inactive { return Err(Error::GameNotInCorrectState) }
  - Calculate registration deadline: self.env().block_timestamp() + registration_period
  - Reset game state: players.clear(), player_count = 0, prize_pool = 0
  - **🔄 H160 EVENTS**: Emit GameStarted event with #[ink(topic)] on buy_in_amount and deadline for efficient filtering
  - Use self.env().emit_event() for event emission
  - **🔄 H160 TESTING**: Write unit tests with ink::env::test::set_caller() for access control testing using H160 addresses
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 5.1, 7.1_

- [ ] 5. Implement player deposit functionality (H160 Migration)
  - Create #[ink(message, payable)] pub fn deposit(&mut self) -> Result<(), Error> function (payable allows receiving funds)
  - **🔄 H160 MIGRATION**: Get caller: let caller = self.env().caller() (returns H160) and transferred_value = self.env().transferred_value()
  - Add state validation: if self.game_state != GameState::AcceptingDeposits { return Err(Error::GameNotInCorrectState) }
  - Implement deadline check: if self.env().block_timestamp() >= self.registration_deadline { return Err(Error::RegistrationPeriodOver) }
  - Validate buy-in amount: if self.env().transferred_value() != self.buy_in_amount { return Err(Error::IncorrectBuyInAmount) }
  - **🔄 H160 STORAGE**: Check duplicate registration: if self.players.contains(&caller) { return Err(Error::PlayerAlreadyDeposited) }
  - Use self.players.insert(&caller, &()) for O(1) player storage with Blake2_128Concat hashing
  - Update counters: self.player_count += 1, self.prize_pool += transferred_value
  - **🔄 H160 EVENTS**: Emit PlayerDeposited event: self.env().emit_event(PlayerDeposited { player: caller, amount: transferred_value })
  - **🔄 H160 TESTING**: Write unit tests using ink::env::test::set_value_transferred() and ink::env::test::set_block_timestamp() for environment mocking with H160 addresses
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 6. Implement automatic game state transition (H160 Compatible)
  - Create #[ink(message)] pub fn try_begin_game(&mut self) -> Result<(), Error> function
  - Add state validation: if self.game_state != GameState::AcceptingDeposits { return Err(Error::GameNotInCorrectState) }
  - Implement deadline validation: if self.env().block_timestamp() < self.registration_deadline { return Err(Error::RegistrationPeriodNotOver) }
  - Transition game_state to GameState::InProgress when conditions are met
  - Emit GameBegan event with player_count and prize_pool data for frontend synchronization
  - **🔄 H160 TESTING**: Write unit tests using ink::env::test::set_block_timestamp() for timing edge cases
  - Test scenarios: before deadline (should fail), exactly at deadline (should succeed), after deadline (should succeed)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Implement prize distribution with security patterns (H160 Migration)
  - **🔄 H160 MIGRATION**: Create #[ink(message)] pub fn end_game(&mut self, winners: Vec<**H160**>) -> Result<(), Error>
  - Implement checks-effects-interactions pattern: CHECKS (access control, state validation), EFFECTS (state updates), INTERACTIONS (transfers)
  - **🔄 H160 ACCESS**: Add access control: if self.env().caller() != self.game_admin { return Err(Error::NotAdmin) }
  - Add state validation: if self.game_state != GameState::InProgress { return Err(Error::GameNotInCorrectState) }
  - Validate winners: if winners.is_empty() { return Err(Error::NoWinners) }
  - Calculate payouts: admin_cut = self.prize_pool * self.admin_fee_percentage as Balance / 100, winner_share = (self.prize_pool - admin_cut) / winners.len() as Balance
  - Update state first: self.game_state = GameState::Inactive, reset all game variables (players mapping, counters)
  - **🔄 H160 TRANSFERS**: Use self.env().transfer(recipient, amount).map_err(|_| Error::TransferFailed)? for fund transfers with proper error handling
  - Transfer admin_cut to self.game_admin first, then winner_share to each winner in winners vector
  - **🔄 H160 EVENTS**: Emit GameEnded event: self.env().emit_event(GameEnded { winners: winners.clone(), admin_payout: admin_cut, winner_payout: winner_share })
  - **🔄 H160 TESTING**: Write unit tests with mock transfers using conditional compilation #[cfg(test)] and mock_transfer_calls tracking
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 6.1_

- [ ] 8. Implement query functions for contract state (H160 Update)
  - Create #[ink(message)] pub fn get_game_state(&self) -> GameState using &self for read-only access
  - Create #[ink(message)] pub fn get_player_count(&self) -> u32 returning self.player_count
  - Create #[ink(message)] pub fn get_prize_pool(&self) -> Balance returning self.prize_pool
  - **🔄 H160 MIGRATION**: Create #[ink(message)] pub fn is_player_registered(&self, player: **H160**) -> bool using self.players.contains(&player)
  - Add #[ink(message)] pub fn get_registration_deadline(&self) -> Timestamp for frontend timing
  - **🔄 H160 QUERY**: Add #[ink(message)] pub fn get_admin(&self) -> **H160** returning self.game_admin
  - **🔄 H160 TESTING**: Write unit tests for all query functions using read-only contract instances with H160 addresses
  - Test query functions work in all game states
  - _Requirements: 8.2, 8.4_

- [ ] 9. Implement comprehensive error handling (H160 Compatible)
  - Define pub type Result<T> = core::result::Result<T, Error> for consistent error handling
  - Ensure all state-changing functions return Result<(), Error> and query functions return appropriate Result types
  - Add proper error propagation using ? operator: self.env().transfer(recipient, amount).map_err(|_| Error::TransferFailed)?
  - Implement Error enum with #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)] and #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
  - Use pattern matching for error handling: if condition { return Err(Error::SpecificError) }
  - Test all error paths using assert!(matches!(result, Err(Error::SpecificError))) in unit tests
  - Ensure error messages are descriptive and help frontend developers understand failure reasons
  - _Requirements: 5.2, 5.3, 5.4, 8.2_

- [ ] 10. Implement event system with proper indexing (H160 Migration)
  - **🔄 H160 EVENTS**: Define #[ink(event)] pub struct GameStarted { #[ink(topic)] buy_in_amount: Balance, #[ink(topic)] deadline: Timestamp }
  - **🔄 H160 EVENTS**: Define #[ink(event)] pub struct PlayerDeposited { #[ink(topic)] player: **H160**, amount: Balance }
  - Define #[ink(event)] pub struct GameBegan { player_count: u32, total_prize_pool: Balance }
  - **🔄 H160 EVENTS**: Define #[ink(event)] pub struct GameEnded { #[ink(topic)] winners: Vec<**H160**>, admin_payout: Balance, winner_payout: Balance }
  - **🔄 H160 INDEXING**: Use #[ink(topic)] for H160, Balance, and other non-primitive types (avoid primitive_topic linter error)
  - Emit events using self.env().emit_event(EventName { ... }) pattern
  - **🔄 H160 TESTING**: Test event emission using ink::env::test::recorded_events() in unit tests
  - _Requirements: 5.1, 5.4, 8.3_

- [ ] 11. Add comprehensive unit test suite (H160 Testing)
  - **🔄 H160 TESTING**: Write #[ink::test] functions for all constructor scenarios using ink::env::test module with H160 addresses
  - Create helper functions: setup_inactive_contract(), setup_accepting_deposits_game(), setup_in_progress_game()
  - **🔄 H160 FLOW**: Test complete game flow: start_game -> multiple deposits -> try_begin_game -> end_game with H160 addresses
  - Add tests for all error conditions using assert!(matches!(result, Err(Error::SpecificError)))
  - **🔄 H160 ACCESS**: Implement access control tests using ink::env::test::set_caller() with different H160 addresses
  - **🔄 H160 EVENTS**: Test event emission using ink::env::test::recorded_events() and verify event data with H160 addresses
  - Use ink::env::test::set_block_timestamp() and ink::env::test::set_value_transferred() for environment mocking
  - _Requirements: 7.5, 8.5_

- [ ] 12. Implement mock testing for external dependencies (H160 Compatible)
  - Add #[cfg(test)] mock fields to AgarioBuyin storage struct for tracking external calls
  - Create conditional compilation functions: #[cfg(not(test))] for production transfers, #[cfg(test)] for mock transfers
  - Implement mock_transfer_calls: Vec<String> field to track transfer operations in tests
  - **🔄 H160 MOCKING**: Write tests using mock implementations that verify transfer logic without actual fund movements using H160 addresses
  - Use conditional compilation pattern: production code calls self.env().transfer(), test code pushes to mock_transfer_calls
  - _Requirements: 6.3, 7.2_

- [ ] 13. Add end-to-end test suite (H160 E2E Testing)
  - Set up #[cfg(all(test, feature = "e2e-tests"))] mod e2e_tests with ink_e2e framework
  - **🔄 INK! V6**: Install ink-node: download from ink! v6 releases for pallet-revive compatibility
  - **🔄 H160 E2E**: Write #[ink_e2e::test] async fn full_game_lifecycle(mut client: ink_e2e::Client<C, E>) -> E2EResult<()>
  - **🔄 H160 INSTANTIATION**: Test contract instantiation using client.instantiate("agario_buyin", &ink_e2e::alice(), constructor, 0, None) with H160 addresses
  - **🔄 H160 SCENARIOS**: Create multi-player scenarios using ink_e2e::bob(), ink_e2e::charlie() for different H160 addresses
  - Use build_message pattern for contract calls: build_message::<AgarioBuyinRef>(contract_acc_id).call(|contract| contract.method())
  - Test with real blockchain environment using client.call().submit().await for state changes
  - Run tests with: cargo test --features e2e-tests
  - _Requirements: 8.5_

- [ ] 14. Implement storage optimization and fallible operations (H160 Optimization)
  - **🔄 H160 STORAGE**: Use ink::storage::Mapping<**H160**, ()> for O(1) player lookups instead of Vec for gas efficiency
  - Implement fallible operations: if self.players.try_insert(&caller, &()).is_err() { handle_error } for dynamic data
  - Use try_get() for safe retrieval: self.players.try_get(&player).unwrap_or(None) to prevent buffer overflow panics
  - Ensure all storage operations stay within 16 KiB static buffer limits using fallible APIs from ink! v6+
  - **🔄 H160 CLEANUP**: Add storage cleanup in reset_game_state(): use self.players.remove(&player) to allow storage deposit reclamation
  - Use Blake2_128Concat hashing for mapping keys (default for ink::storage::Mapping) for transparent key access
  - **Note**: H160 keys are more gas-efficient than AccountId due to smaller size (20 bytes vs 32 bytes)
  - Avoid storing large dynamic data structures like Vec<String>; use counters and mappings with fixed-size values instead
  - _Requirements: 6.2, 7.2, 7.6_

- [ ] 15. Add linting compliance and security validation (H160 Compliance)
  - **🔄 INK! V6**: Run cargo contract build --lint to check all linter rules: no_main, primitive_topic, storage_never_freed, strict_balance_equality, non_fallible_api
  - Verify no strict balance equality checks: avoid self.env().balance() == exact_amount patterns
  - **🔄 H160 TOPICS**: Confirm proper use of #[ink(topic)] for H160, Balance types only (not u8, u32, bool primitives)
  - Validate storage_never_freed rule: ensure players.remove() capability for storage deposit reclamation
  - Test non_fallible_api compliance: use try_insert(), try_get() for dynamic data operations
  - Ensure contract uses #![cfg_attr(not(feature = "std"), no_std, no_main)] for no_main rule
  - _Requirements: 7.5, 7.7_

- [ ] 16. Create deployment and integration documentation (H160 Documentation)
  - **🔄 INK! V6**: Write deployment scripts: cargo contract build --release, cargo contract instantiate --suri //Alice --args 5 -x
  - Create ABI documentation from generated .contract bundle containing metadata.json and .wasm files
  - **🔄 H160 STORAGE**: Add storage inspection guides: cargo contract storage --contract <H160_ADDRESS> for debugging
  - **🔄 H160 INTEGRATION**: Document polkadot-js/api integration: ContractPromise(api, abi, address) for frontend interaction with H160 addresses
  - **🔄 H160 EXAMPLES**: Create examples for contract.query.getGameState() and contract.tx.deposit() patterns with H160 addresses
  - **🔄 H160 EVENTS**: Document event filtering using api.query.system.events() and contract event decoding with H160 data
  - **🔄 MIGRATION GUIDE**: Add AccountId → H160 migration guide for existing contracts and frontends
  - _Requirements: 8.1, 8.4_

- [ ] 17. Perform final integration testing and validation (H160 Validation)
  - **🔄 H160 TESTING**: Run complete test suite: cargo contract test for unit tests, cargo test --features e2e-tests for E2E tests
  - **🔄 INK! V6**: Validate contract with cargo contract build --lint to ensure all linter rules pass
  - **🔄 INK! V6**: Test deployment on local development node: ink-node in background, then cargo contract instantiate
  - **🔄 H160 INSPECTION**: Verify storage inspection: cargo contract storage --contract <H160_ADDRESS> shows correct contract state
  - **🔄 H160 CALLS**: Test contract calls: cargo contract call --contract <H160_ADDRESS> --message get_game_state --suri //Alice
  - **🔄 H160 EVENTS**: Confirm event emission using polkadot-js/api event filtering and decoding with H160 addresses
  - Validate all requirements against implemented functionality using comprehensive test scenarios
  - **🔄 REVIVE TESTING**: Test pallet-revive compatibility and Ethereum tooling integration if needed
  - _Requirements: All requirements validation_

## 🔄 **H160 Migration Summary**

### **Key Changes for ink! v6.0.0-alpha:**
1. **Address Type**: `AccountId` → `H160` (32-byte → 20-byte Ethereum-style addresses)
2. **Storage**: `Mapping<AccountId, ()>` → `Mapping<H160, ()>`
3. **Events**: All player/admin address fields now use `H160`
4. **Functions**: All address parameters and returns now use `H160`
5. **Testing**: All test addresses now use H160 format (0x1234...abcd)

### **Benefits of H160:**
- **Gas Efficiency**: 20-byte addresses vs 32-byte AccountId
- **Ethereum Compatibility**: Works with Ethereum tooling and wallets
- **Cross-Chain**: Better integration with Ethereum ecosystem
- **Performance**: Smaller address size improves storage efficiency

### **Migration Checklist:**
- [ ] Update all `AccountId` references to `H160`
- [ ] Update storage mappings and event definitions
- [ ] Update test addresses to H160 format
- [ ] Update frontend integration for H160 addresses
- [ ] Update documentation and examples
- [ ] Test with ink-node (pallet-revive compatible)
