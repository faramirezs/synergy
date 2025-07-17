# Implementation Plan

- [-] 1. Set up project structure and core contract foundation
  - Create new ink! contract project using `cargo contract new agario_buyin`
  - Configure Cargo.toml with proper dependencies: ink v6, scale, scale-info with SCALE codec derives
  - Set up lib.rs with `#![cfg_attr(not(feature = "std"), no_std, no_main)]` for Wasm compatibility
  - Configure crate-type as `["cdylib"]` for Wasm blob generation
  - Add dev-dependencies for ink_e2e testing framework
  - Set up feature flags: default = ["std"], std = ["ink/std"], e2e-tests = []
  - Create basic #[ink::contract] module structure with placeholder storage
  - _Requirements: 7.1, 7.3_

- [ ] 2. Implement core data types and storage structure
  - Define GameState enum with #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)] and #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
  - Create Error enum with variants: NotAdmin, GameNotInCorrectState, IncorrectBuyInAmount, PlayerAlreadyDeposited, NoWinners, RegistrationPeriodNotOver, RegistrationPeriodOver, TransferFailed
  - Implement #[ink(storage)] AgarioBuyin struct with: game_admin: AccountId, admin_fee_percentage: u8, game_state: GameState, buy_in_amount: Balance, registration_deadline: Timestamp, players: Mapping<AccountId, ()>, player_count: u32, prize_pool: Balance
  - Use ink::storage::Mapping for gas-efficient player storage with O(1) lookups
  - Add proper SCALE codec derives for all custom types to ensure ABI compatibility
  - _Requirements: 5.1, 7.3, 8.1_

- [ ] 3. Implement contract constructor with validation
  - Create #[ink(constructor)] pub fn new(admin_fee: u8) -> Result<Self, Error> function (constructors are implicitly payable)
  - Add validation: if admin_fee > 100 { return Err(Error::InvalidAdminFee) } before creating Self instance
  - Use Self::env().caller() to set game_admin to deployer's AccountId
  - Initialize all fields: game_state: GameState::Inactive, players: Mapping::default(), player_count: 0, prize_pool: 0, registration_deadline: 0, buy_in_amount: 0
  - Return Ok(Self { game_admin, admin_fee_percentage: admin_fee, ... }) on successful validation
  - Write #[ink::test] unit tests using ink::env::test module for environment mocking
  - Test valid admin fees (0-100) with assert!(matches!(result, Ok(_))) and invalid fees (>100) with assert!(matches!(result, Err(Error::InvalidAdminFee)))
  - _Requirements: 1.1, 1.2_

- [ ] 4. Implement game administration functions
  - Create #[ink(message)] pub fn start_game(&mut self, buy_in: Balance, registration_period: Timestamp) -> Result<(), Error>
  - Add access control: if self.env().caller() != self.game_admin { return Err(Error::NotAdmin) }
  - Implement state validation: if self.game_state != GameState::Inactive { return Err(Error::GameNotInCorrectState) }
  - Calculate registration deadline: self.env().block_timestamp() + registration_period
  - Reset game state: players.clear(), player_count = 0, prize_pool = 0
  - Emit GameStarted event with #[ink(topic)] on buy_in_amount and deadline for efficient filtering
  - Use self.env().emit_event() for event emission
  - Write unit tests with ink::env::test::set_caller() for access control testing
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 5.1, 7.1_

- [ ] 5. Implement player deposit functionality
  - Create #[ink(message, payable)] pub fn deposit(&mut self) -> Result<(), Error> function (payable allows receiving funds)
  - Get caller: let caller = self.env().caller() and transferred_value = self.env().transferred_value()
  - Add state validation: if self.game_state != GameState::AcceptingDeposits { return Err(Error::GameNotInCorrectState) }
  - Implement deadline check: if self.env().block_timestamp() >= self.registration_deadline { return Err(Error::RegistrationPeriodOver) }
  - Validate buy-in amount: if self.env().transferred_value() != self.buy_in_amount { return Err(Error::IncorrectBuyInAmount) }
  - Check duplicate registration: if self.players.contains(&caller) { return Err(Error::PlayerAlreadyDeposited) }
  - Use self.players.insert(&caller, &()) for O(1) player storage with Blake2_128Concat hashing
  - Update counters: self.player_count += 1, self.prize_pool += transferred_value
  - Emit PlayerDeposited event: self.env().emit_event(PlayerDeposited { player: caller, amount: transferred_value })
  - Write unit tests using ink::env::test::set_value_transferred() and ink::env::test::set_block_timestamp() for environment mocking
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 6. Implement automatic game state transition
  - Create #[ink(message)] pub fn try_begin_game(&mut self) -> Result<(), Error> function
  - Add state validation: if self.game_state != GameState::AcceptingDeposits { return Err(Error::GameNotInCorrectState) }
  - Implement deadline validation: if self.env().block_timestamp() < self.registration_deadline { return Err(Error::RegistrationPeriodNotOver) }
  - Transition game_state to GameState::InProgress when conditions are met
  - Emit GameBegan event with player_count and prize_pool data for frontend synchronization
  - Write unit tests using ink::env::test::set_block_timestamp() for timing edge cases
  - Test scenarios: before deadline (should fail), exactly at deadline (should succeed), after deadline (should succeed)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Implement prize distribution with security patterns
  - Create #[ink(message)] pub fn end_game(&mut self, winners: Vec<AccountId>) -> Result<(), Error>
  - Implement checks-effects-interactions pattern: CHECKS (access control, state validation), EFFECTS (state updates), INTERACTIONS (transfers)
  - Add access control: if self.env().caller() != self.game_admin { return Err(Error::NotAdmin) }
  - Add state validation: if self.game_state != GameState::InProgress { return Err(Error::GameNotInCorrectState) }
  - Validate winners: if winners.is_empty() { return Err(Error::NoWinners) }
  - Calculate payouts: admin_cut = self.prize_pool * self.admin_fee_percentage as Balance / 100, winner_share = (self.prize_pool - admin_cut) / winners.len() as Balance
  - Update state first: self.game_state = GameState::Inactive, reset all game variables (players mapping, counters)
  - Use self.env().transfer(recipient, amount).map_err(|_| Error::TransferFailed)? for fund transfers with proper error handling
  - Transfer admin_cut to self.game_admin first, then winner_share to each winner in winners vector
  - Emit GameEnded event: self.env().emit_event(GameEnded { winners: winners.clone(), admin_payout: admin_cut, winner_payout: winner_share })
  - Write unit tests with mock transfers using conditional compilation #[cfg(test)] and mock_transfer_calls tracking
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 6.1_

- [ ] 8. Implement query functions for contract state
  - Create #[ink(message)] pub fn get_game_state(&self) -> GameState using &self for read-only access
  - Create #[ink(message)] pub fn get_player_count(&self) -> u32 returning self.player_count
  - Create #[ink(message)] pub fn get_prize_pool(&self) -> Balance returning self.prize_pool
  - Create #[ink(message)] pub fn is_player_registered(&self, player: AccountId) -> bool using self.players.contains(&player)
  - Add #[ink(message)] pub fn get_registration_deadline(&self) -> Timestamp for frontend timing
  - Write unit tests for all query functions using read-only contract instances
  - Test query functions work in all game states
  - _Requirements: 8.2, 8.4_

- [ ] 9. Implement comprehensive error handling
  - Define pub type Result<T> = core::result::Result<T, Error> for consistent error handling
  - Ensure all state-changing functions return Result<(), Error> and query functions return appropriate Result types
  - Add proper error propagation using ? operator: self.env().transfer(recipient, amount).map_err(|_| Error::TransferFailed)?
  - Implement Error enum with #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)] and #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
  - Use pattern matching for error handling: if condition { return Err(Error::SpecificError) }
  - Test all error paths using assert!(matches!(result, Err(Error::SpecificError))) in unit tests
  - Ensure error messages are descriptive and help frontend developers understand failure reasons
  - _Requirements: 5.2, 5.3, 5.4, 8.2_

- [ ] 10. Implement event system with proper indexing
  - Define #[ink(event)] pub struct GameStarted { #[ink(topic)] buy_in_amount: Balance, #[ink(topic)] deadline: Timestamp }
  - Define #[ink(event)] pub struct PlayerDeposited { #[ink(topic)] player: AccountId, amount: Balance }
  - Define #[ink(event)] pub struct GameBegan { player_count: u32, total_prize_pool: Balance }
  - Define #[ink(event)] pub struct GameEnded { #[ink(topic)] winners: Vec<AccountId>, admin_payout: Balance, winner_payout: Balance }
  - Use #[ink(topic)] only for AccountId, Balance, and other non-primitive types (avoid primitive_topic linter error)
  - Emit events using self.env().emit_event(EventName { ... }) pattern
  - Test event emission using ink::env::test::recorded_events() in unit tests
  - _Requirements: 5.1, 5.4, 8.3_

- [ ] 11. Add comprehensive unit test suite
  - Write #[ink::test] functions for all constructor scenarios using ink::env::test module
  - Create helper functions: setup_inactive_contract(), setup_accepting_deposits_game(), setup_in_progress_game()
  - Test complete game flow: start_game -> multiple deposits -> try_begin_game -> end_game
  - Add tests for all error conditions using assert!(matches!(result, Err(Error::SpecificError)))
  - Implement access control tests using ink::env::test::set_caller() with different AccountIds
  - Test event emission using ink::env::test::recorded_events() and verify event data
  - Use ink::env::test::set_block_timestamp() and ink::env::test::set_value_transferred() for environment mocking
  - _Requirements: 7.5, 8.5_

- [ ] 12. Implement mock testing for external dependencies
  - Add #[cfg(test)] mock fields to AgarioBuyin storage struct for tracking external calls
  - Create conditional compilation functions: #[cfg(not(test))] for production transfers, #[cfg(test)] for mock transfers
  - Implement mock_transfer_calls: Vec<String> field to track transfer operations in tests
  - Write tests using mock implementations that verify transfer logic without actual fund movements
  - Use conditional compilation pattern: production code calls self.env().transfer(), test code pushes to mock_transfer_calls
  - _Requirements: 6.3, 7.2_

- [ ] 13. Add end-to-end test suite
  - Set up #[cfg(all(test, feature = "e2e-tests"))] mod e2e_tests with ink_e2e framework
  - Install substrate contracts node: cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git
  - Write #[ink_e2e::test] async fn full_game_lifecycle(mut client: ink_e2e::Client<C, E>) -> E2EResult<()>
  - Test contract instantiation using client.instantiate("agario_buyin", &ink_e2e::alice(), constructor, 0, None)
  - Create multi-player scenarios using ink_e2e::bob(), ink_e2e::charlie() for different players
  - Use build_message pattern for contract calls: build_message::<AgarioBuyinRef>(contract_acc_id).call(|contract| contract.method())
  - Test with real blockchain environment using client.call().submit().await for state changes
  - Run tests with: cargo test --features e2e-tests
  - _Requirements: 8.5_

- [ ] 14. Implement storage optimization and fallible operations
  - Use ink::storage::Mapping<AccountId, ()> for O(1) player lookups instead of Vec for gas efficiency
  - Implement fallible operations: if self.players.try_insert(&caller, &()).is_err() { handle_error } for dynamic data
  - Use try_get() for safe retrieval: self.players.try_get(&player).unwrap_or(None) to prevent buffer overflow panics
  - Ensure all storage operations stay within 16 KiB static buffer limits using fallible APIs from ink! v5+
  - Add storage cleanup in reset_game_state(): use self.players.remove(&player) to allow storage deposit reclamation
  - Use Blake2_128Concat hashing for mapping keys (default for ink::storage::Mapping) for transparent key access
  - Avoid storing large dynamic data structures like Vec<String>; use counters and mappings with fixed-size values instead
  - _Requirements: 6.2, 7.2, 7.6_

- [ ] 15. Add linting compliance and security validation
  - Run cargo contract build --lint to check all linter rules: no_main, primitive_topic, storage_never_freed, strict_balance_equality, non_fallible_api
  - Verify no strict balance equality checks: avoid self.env().balance() == exact_amount patterns
  - Confirm proper use of #[ink(topic)] for AccountId, Balance types only (not u8, u32, bool primitives)
  - Validate storage_never_freed rule: ensure players.remove() capability for storage deposit reclamation
  - Test non_fallible_api compliance: use try_insert(), try_get() for dynamic data operations
  - Ensure contract uses #![cfg_attr(not(feature = "std"), no_std, no_main)] for no_main rule
  - _Requirements: 7.5, 7.7_

- [ ] 16. Create deployment and integration documentation
  - Write deployment scripts: cargo contract build --release, cargo contract instantiate --suri //Alice --args 5 -x
  - Create ABI documentation from generated .contract bundle containing metadata.json and .wasm files
  - Add storage inspection guides: cargo contract storage --contract <ADDRESS> for debugging
  - Document polkadot-js/api integration: ContractPromise(api, abi, address) for frontend interaction
  - Create examples for contract.query.getGameState() and contract.tx.deposit() patterns
  - Document event filtering using api.query.system.events() and contract event decoding
  - _Requirements: 8.1, 8.4_

- [ ] 17. Perform final integration testing and validation
  - Run complete test suite: cargo contract test for unit tests, cargo test --features e2e-tests for E2E tests
  - Validate contract with cargo contract build --lint to ensure all linter rules pass
  - Test deployment on local development node: substrate-contracts-node in background, then cargo contract instantiate
  - Verify storage inspection: cargo contract storage --contract <ADDRESS> shows correct contract state
  - Test contract calls: cargo contract call --contract <ADDRESS> --message get_game_state --suri //Alice
  - Confirm event emission using polkadot-js/api event filtering and decoding
  - Validate all requirements against implemented functionality using comprehensive test scenarios
  - Test Chopsticks fork integration for live state testing if needed
  - _Requirements: All requirements validation_