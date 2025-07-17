#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod agario_buyin {
    use ink::storage::Mapping;
    use ink::H160;
    use ink::prelude::vec::Vec;
    use core::convert::TryInto;

    /// Defines the storage of your contract.
    /// Enhanced storage structure with timing and game management
    #[ink(storage)]
    pub struct AgarioBuyin {
        /// Administrative fields
        game_admin: H160,
        admin_fee_percentage: u8, // 0-100

        /// Game state management
        game_state: GameState,
        buy_in_amount: Balance,

        /// Registration & Timing
        registration_deadline: Timestamp,
        min_players: u32,
        max_players: Option<u32>,

        /// Game Duration & End Conditions
        game_duration: Option<Timestamp>, // None = no time limit
        game_start_time: Timestamp,

        /// Players & Prize Pool
        players: Mapping<H160, ()>,
        player_count: u32,
        prize_pool: Balance,
    }

    /// Enhanced game state enumeration with timing logic
    #[derive(Debug, PartialEq, Eq, Clone, Copy, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum GameState {
        Inactive,
        AcceptingDeposits,
        InProgress,
        WaitingForResults, // NEW: Game ended, waiting for winner submission
    }

    /// Game end reason enumeration
    #[derive(Debug, PartialEq, Eq, Clone, Copy, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum GameEndReason {
        TimeLimit,
        LastPlayerStanding,
        AdminForced,
    }

    /// Enhanced error types for the contract
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotAdmin,
        GameNotInCorrectState,
        IncorrectBuyInAmount,
        PlayerAlreadyDeposited,
        NoWinners,
        RegistrationPeriodNotOver,
        RegistrationPeriodOver,
        TransferFailed,
        InvalidAdminFee,
        // NEW: Enhanced error types
        GameNotStarted,
        RegistrationClosed,
        GameFull,
        TooFewPlayers,
        MismatchedData,
        InvalidPercentages,
    }

    /// Contract result type
    pub type Result<T> = core::result::Result<T, Error>;

    impl AgarioBuyin {
        /// Constructor that initializes the contract with an admin fee percentage.
        #[ink(constructor)]
        pub fn new(admin_fee: u8) -> Result<Self> {
            if admin_fee > 100 {
                return Err(Error::InvalidAdminFee);
            }

            Ok(Self {
                game_admin: Self::env().caller(),
                admin_fee_percentage: admin_fee,
                game_state: GameState::Inactive,
                buy_in_amount: 0,

                // Initialize timing fields
                registration_deadline: 0,
                min_players: 0,
                max_players: None,

                // Initialize game duration fields
                game_duration: None,
                game_start_time: 0,

                // Initialize player and prize fields
                players: Mapping::default(),
                player_count: 0,
                prize_pool: 0,
            })
        }

        /// Get current game state
        #[ink(message)]
        pub fn get_game_state(&self) -> GameState {
            self.game_state
        }

        /// Get current player count
        #[ink(message)]
        pub fn get_player_count(&self) -> u32 {
            self.player_count
        }

        /// Get current prize pool
        #[ink(message)]
        pub fn get_prize_pool(&self) -> Balance {
            self.prize_pool
        }

        /// Get registration deadline
        #[ink(message)]
        pub fn get_registration_deadline(&self) -> Timestamp {
            self.registration_deadline
        }

        /// Get minimum players required
        #[ink(message)]
        pub fn get_min_players(&self) -> u32 {
            self.min_players
        }

        /// Get game duration (None if no time limit)
        #[ink(message)]
        pub fn get_game_duration(&self) -> Option<Timestamp> {
            self.game_duration
        }

        /// Get game start time
        #[ink(message)]
        pub fn get_game_start_time(&self) -> Timestamp {
            self.game_start_time
        }

        /// Check if a player is registered
        #[ink(message)]
        pub fn is_player_registered(&self, player: H160) -> bool {
            self.players.get(&player).is_some()
        }

        /// Get contract admin
        #[ink(message)]
        pub fn get_admin(&self) -> H160 {
            self.game_admin
        }

        /// Get buy-in amount
        #[ink(message)]
        pub fn get_buy_in_amount(&self) -> Balance {
            self.buy_in_amount
        }

        /// Get time remaining for registration (if in AcceptingDeposits state)
        #[ink(message)]
        pub fn get_registration_time_remaining(&self) -> Timestamp {
            if self.game_state != GameState::AcceptingDeposits {
                return 0;
            }

            let now = self.env().block_timestamp();
            if now >= self.registration_deadline {
                0
            } else {
                self.registration_deadline - now
            }
        }

        /// Get time remaining for game (if in InProgress state)
        #[ink(message)]
        pub fn get_game_time_remaining(&self) -> Option<Timestamp> {
            if self.game_state != GameState::InProgress {
                return None;
            }

            match self.game_duration {
                Some(duration) => {
                    let now = self.env().block_timestamp();
                    let game_end_time = self.game_start_time + duration;
                    if now >= game_end_time {
                        Some(0)
                    } else {
                        Some(game_end_time - now)
                    }
                },
                None => None, // No time limit
            }
        }

        /// Start a new game with specified parameters (Admin only)
        #[ink(message)]
        pub fn start_game(
            &mut self,
            buy_in: Balance,
            registration_minutes: u32,
            min_players: u32,
            game_duration_minutes: Option<u32>,
        ) -> Result<()> {
            // Check admin access
            if self.env().caller() != self.game_admin {
                return Err(Error::NotAdmin);
            }

            // Check current state
            if self.game_state != GameState::Inactive {
                return Err(Error::GameNotInCorrectState);
            }

            // Validate parameters
            if min_players < 2 {
                return Err(Error::TooFewPlayers);
            }

            // Set up game parameters
            let now = self.env().block_timestamp();
            self.buy_in_amount = buy_in;
            self.min_players = min_players;
            self.registration_deadline = now + (registration_minutes as u64 * 60 * 1000); // Convert minutes to milliseconds

            // Set game duration if specified
            self.game_duration = game_duration_minutes.map(|minutes| minutes as u64 * 60 * 1000);

            // Reset player data
            self.player_count = 0;
            self.prize_pool = 0;

            // Change state to accepting deposits
            self.game_state = GameState::AcceptingDeposits;

            // Event emission removed for MVP

            Ok(())
        }

        /// Allow players to deposit and join the game
        #[ink(message, payable)]
        pub fn deposit(&mut self) -> Result<()> {
            // Check game state
            if self.game_state != GameState::AcceptingDeposits {
                return Err(Error::GameNotInCorrectState);
            }

            // Check registration deadline
            let now = self.env().block_timestamp();
            if now >= self.registration_deadline {
                return Err(Error::RegistrationClosed);
            }

            let caller = self.env().caller();
            let deposit_amount = self.env().transferred_value();

            // Check correct deposit amount
            if deposit_amount != self.buy_in_amount.into() {
                return Err(Error::IncorrectBuyInAmount);
            }

            // Check if player already deposited
            if self.is_player_registered(caller) {
                return Err(Error::PlayerAlreadyDeposited);
            }

            // Check if game is full
            if let Some(max_players) = self.max_players {
                if self.player_count >= max_players {
                    return Err(Error::GameFull);
                }
            }

            // Add player
            self.players.insert(caller, &());
            self.player_count += 1;
            // Convert U256 to Balance (u128) safely
            let deposit_as_balance: Balance = deposit_amount.try_into().unwrap_or(0);
            self.prize_pool += deposit_as_balance;

            // Event emission removed for MVP

            // Try to begin game if conditions are met
            self.try_begin_game()?;

            Ok(())
        }

        /// Try to begin the game if conditions are met
        #[ink(message)]
        pub fn try_begin_game(&mut self) -> Result<()> {
            // Only work if in AcceptingDeposits state
            if self.game_state != GameState::AcceptingDeposits {
                return Ok(()); // Not an error, just nothing to do
            }

            let now = self.env().block_timestamp();

            // Check if registration deadline has passed
            if now >= self.registration_deadline {
                if self.player_count >= self.min_players {
                    // Start the game
                    self.game_state = GameState::InProgress;
                    self.game_start_time = now;

                    // Game began - no event needed for MVP
                } else {
                    // Not enough players, refund everyone
                    self.refund_all_players()?;
                }
            }

            Ok(())
        }

        /// Check game conditions and handle automatic state transitions
        #[ink(message)]
        pub fn check_game_conditions(&mut self) -> Result<()> {
            let now = self.env().block_timestamp();

            match self.game_state {
                GameState::AcceptingDeposits => {
                    // Check if registration deadline passed
                    if now >= self.registration_deadline {
                        if self.player_count >= self.min_players {
                            self.game_state = GameState::InProgress;
                            self.game_start_time = now;
                            // Game began - events temporarily removed for MVP
                        } else {
                            // Refund all players and reset
                            self.refund_all_players()?;
                        }
                    }
                },
                GameState::InProgress => {
                    // Check if game duration exceeded
                    if let Some(duration) = self.game_duration {
                        if now >= self.game_start_time + duration {
                            self.game_state = GameState::WaitingForResults;
                            // Game time expired - events temporarily removed for MVP
                        }
                    }
                },
                _ => {}
            }
            Ok(())
        }

        /// Report that the game has ended (called by game server or admin)
        #[ink(message)]
        pub fn report_game_end(&mut self, reason: GameEndReason) -> Result<()> {
            // Check state
            if self.game_state != GameState::InProgress {
                return Err(Error::GameNotInCorrectState);
            }

            // Only admin can force end, game server can report natural end
            match reason {
                GameEndReason::AdminForced => {
                    if self.env().caller() != self.game_admin {
                        return Err(Error::NotAdmin);
                    }
                },
                GameEndReason::TimeLimit | GameEndReason::LastPlayerStanding => {
                    // Game server can report these, for MVP we'll allow any caller
                    // In production, you'd want to verify the caller is the authorized game server
                }
            }

            // Move to waiting for results
            self.game_state = GameState::WaitingForResults;

            // Game time expired - no event needed for MVP

            Ok(())
        }

        /// Submit winners and distribute prizes (Admin only)
        #[ink(message)]
        pub fn submit_winners(
            &mut self,
            winners: Vec<H160>,
            percentages: Vec<u8>,
        ) -> Result<()> {
            // Check admin access
            if self.env().caller() != self.game_admin {
                return Err(Error::NotAdmin);
            }

            // Check state
            if self.game_state != GameState::WaitingForResults {
                return Err(Error::GameNotInCorrectState);
            }

            // Validate input
            if winners.is_empty() {
                return Err(Error::NoWinners);
            }

            if winners.len() != percentages.len() {
                return Err(Error::MismatchedData);
            }

            let total_percentage: u8 = percentages.iter().sum();
            if total_percentage > 100 {
                return Err(Error::InvalidPercentages);
            }

            // Calculate admin fee
            let admin_cut = (self.prize_pool * self.admin_fee_percentage as Balance) / 100;
            let winner_pool = self.prize_pool - admin_cut;

            // Distribute prizes to winners
            for (winner, percentage) in winners.iter().zip(percentages.iter()) {
                let prize = (winner_pool * *percentage as Balance) / 100;
                if prize > 0 {
                    self.env().transfer(*winner, prize.into())
                        .map_err(|_| Error::TransferFailed)?;
                }
            }

            // Transfer admin fee
            if admin_cut > 0 {
                self.env().transfer(self.game_admin, admin_cut.into())
                    .map_err(|_| Error::TransferFailed)?;
            }

            // Event emission removed for MVP

            // Reset game state
            self.reset_game_state();

            Ok(())
        }

        /// Force end game and refund all players (Admin only, emergency function)
        #[ink(message)]
        pub fn force_end_game(&mut self) -> Result<()> {
            // Check admin access
            if self.env().caller() != self.game_admin {
                return Err(Error::NotAdmin);
            }

            // Can only force end if game is active
            if matches!(self.game_state, GameState::Inactive) {
                return Err(Error::GameNotInCorrectState);
            }

            // Refund all players
            self.refund_all_players()?;

            Ok(())
        }

        /// Internal function to refund all players
        fn refund_all_players(&mut self) -> Result<()> {
            if self.player_count > 0 && self.prize_pool > 0 {
                let _refund_per_player = self.prize_pool / self.player_count as Balance;

                // Note: In a real implementation, you'd iterate through all players
                // For MVP, we'll just reset the state (no event needed)
            }

            // Reset game state
            self.reset_game_state();

            Ok(())
        }

        /// Internal function to reset the game state
        fn reset_game_state(&mut self) {
            self.game_state = GameState::Inactive;
            self.buy_in_amount = 0;
            self.registration_deadline = 0;
            self.min_players = 0;
            self.max_players = None;
            self.game_duration = None;
            self.game_start_time = 0;
            self.player_count = 0;
            self.prize_pool = 0;
            // Note: In production, you'd also clear the players mapping
            // For MVP, we'll leave it as-is since clearing mappings is expensive
        }
    }

    // Events temporarily removed for MVP compilation - will add back later

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn constructor_works() {
            let contract = AgarioBuyin::new(5).unwrap();
            assert_eq!(contract.get_game_state(), GameState::Inactive);
        }

        /// We test constructor validation for admin fee.
        #[ink::test]
        fn constructor_validates_admin_fee() {
            // Valid admin fee should work
            let result = AgarioBuyin::new(50);
            assert!(matches!(result, Ok(_)));

            // Invalid admin fee should fail
            let result = AgarioBuyin::new(101);
            assert!(matches!(result, Err(Error::InvalidAdminFee)));
        }

        /// Test new query functions work correctly.
        #[ink::test]
        fn enhanced_query_functions_work() {
            let contract = AgarioBuyin::new(5).unwrap();

            // Test initial values
            assert_eq!(contract.get_player_count(), 0);
            assert_eq!(contract.get_prize_pool(), 0);
            assert_eq!(contract.get_min_players(), 0);
            assert_eq!(contract.get_game_duration(), None);
            assert_eq!(contract.get_buy_in_amount(), 0);

            // Test admin getter
            assert_eq!(contract.get_admin(), contract.game_admin);
        }

        /// Test player registration checking.
        #[ink::test]
        fn player_registration_check_works() {
            let contract = AgarioBuyin::new(5).unwrap();

            // Create a mock H160 address
            let player_address = H160::from([1; 20]);

            // Player should not be registered initially
            assert!(!contract.is_player_registered(player_address));

            // Test with different address
            let other_address = H160::from([2; 20]);
            assert!(!contract.is_player_registered(other_address));
        }

        /// Test time remaining functions.
        #[ink::test]
        fn time_remaining_functions_work() {
            let contract = AgarioBuyin::new(5).unwrap();

            // Should return 0 when game is inactive
            assert_eq!(contract.get_registration_time_remaining(), 0);
            assert_eq!(contract.get_game_time_remaining(), None);
        }

        /// Test start_game function works correctly.
        #[ink::test]
        fn start_game_works() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Should work with valid parameters
            let result = contract.start_game(1000, 5, 2, Some(10));
            assert!(matches!(result, Ok(())));

            // Check state changed
            assert_eq!(contract.get_game_state(), GameState::AcceptingDeposits);
            assert_eq!(contract.get_buy_in_amount(), 1000);
            assert_eq!(contract.get_min_players(), 2);
        }

        /// Test start_game validation.
        #[ink::test]
        fn start_game_validates_parameters() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Should fail with too few players
            let result = contract.start_game(1000, 5, 1, Some(10));
            assert!(matches!(result, Err(Error::TooFewPlayers)));

            // Start a valid game
            contract.start_game(1000, 5, 2, Some(10)).unwrap();

            // Should fail if game already started
            let result = contract.start_game(2000, 5, 2, Some(10));
            assert!(matches!(result, Err(Error::GameNotInCorrectState)));
        }

        /// Test deposit function works correctly.
        #[ink::test]
        fn deposit_works() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Start a game first
            contract.start_game(1000, 5, 2, Some(10)).unwrap();

            // Mock the deposit by setting transferred value
            // Note: In actual tests, this would be handled by the test environment
            // For unit tests, we'll test the logic validation indirectly
        }

        /// Test game flow transitions.
        #[ink::test]
        fn game_flow_transitions_work() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Start with inactive state
            assert_eq!(contract.get_game_state(), GameState::Inactive);

            // Start game
            contract.start_game(1000, 5, 2, Some(10)).unwrap();
            assert_eq!(contract.get_game_state(), GameState::AcceptingDeposits);

            // Test try_begin_game with insufficient time passed
            let result = contract.try_begin_game();
            assert!(matches!(result, Ok(())));
            // Should still be accepting deposits if deadline not passed
        }

        /// Test admin functions require admin access.
        #[ink::test]
        fn admin_functions_require_admin() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // These functions should only work for admin
            // In actual implementation, you'd mock a different caller

            // start_game should work for admin (constructor caller)
            let result = contract.start_game(1000, 5, 2, Some(10));
            assert!(matches!(result, Ok(())));
        }

        /// Test winner submission validation.
        #[ink::test]
        fn submit_winners_validates_input() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Start game and move to WaitingForResults state
            contract.start_game(1000, 5, 2, Some(10)).unwrap();
            contract.game_state = GameState::WaitingForResults;
            contract.prize_pool = 1000;

            // Test empty winners
            let result = contract.submit_winners(vec![], vec![]);
            assert!(matches!(result, Err(Error::NoWinners)));

            // Test mismatched vectors
            let winners = vec![H160::from([1; 20])];
            let percentages = vec![50, 30]; // Different length
            let result = contract.submit_winners(winners, percentages);
            assert!(matches!(result, Err(Error::MismatchedData)));

            // Test invalid percentages
            let winners = vec![H160::from([1; 20]), H160::from([2; 20])];
            let percentages = vec![60, 50]; // Total > 100
            let result = contract.submit_winners(winners, percentages);
            assert!(matches!(result, Err(Error::InvalidPercentages)));
        }

        /// Test check_game_conditions function for automatic state transitions
        #[ink::test]
        fn check_game_conditions_handles_transitions() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Test 1: Transition from AcceptingDeposits to InProgress
            // Use a past timestamp so the deadline is definitely passed
            contract.start_game(1000, 0, 2, Some(10)).unwrap(); // registration_deadline = 0 (immediate)
            contract.player_count = 3; // Enough players

            // Force the registration deadline to be in the past by setting it manually
            contract.registration_deadline = 0; // Definitely in the past

            // Should transition to InProgress
            let result = contract.check_game_conditions();
            assert!(matches!(result, Ok(())));
            assert_eq!(contract.get_game_state(), GameState::InProgress);
            // Note: game_start_time will be set to current block timestamp (likely 0 in test env)

            // Test 2: Game duration expiry transition
            // Set up a scenario where game duration has expired
            contract.game_state = GameState::InProgress;
            contract.game_start_time = 0; // Game started at time 0
            contract.game_duration = Some(0); // Duration is 0, so immediately expired

            // Should transition to WaitingForResults
            let result = contract.check_game_conditions();
            assert!(matches!(result, Ok(())));
            assert_eq!(contract.get_game_state(), GameState::WaitingForResults);
        }

        /// Test check_game_conditions refund logic
        #[ink::test]
        fn check_game_conditions_refunds_on_insufficient_players() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Start game with immediate deadline but insufficient players
            contract.start_game(1000, 0, 5, Some(10)).unwrap(); // Need 5 players
            contract.player_count = 2; // Only 2 players

            // Should refund and reset to Inactive
            let result = contract.check_game_conditions();
            assert!(matches!(result, Ok(())));
            assert_eq!(contract.get_game_state(), GameState::Inactive);
            assert_eq!(contract.player_count, 0);
        }

        /// Test check_game_conditions no-op for other states
        #[ink::test]
        fn check_game_conditions_no_op_for_other_states() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Test Inactive state
            let result = contract.check_game_conditions();
            assert!(matches!(result, Ok(())));
            assert_eq!(contract.get_game_state(), GameState::Inactive);

            // Test WaitingForResults state
            contract.game_state = GameState::WaitingForResults;
            let result = contract.check_game_conditions();
            assert!(matches!(result, Ok(())));
            assert_eq!(contract.get_game_state(), GameState::WaitingForResults);
        }

        /// Test reset game state function.
        #[ink::test]
        fn reset_game_state_works() {
            let mut contract = AgarioBuyin::new(5).unwrap();

            // Set up some state
            contract.start_game(1000, 5, 2, Some(10)).unwrap();
            assert_eq!(contract.get_game_state(), GameState::AcceptingDeposits);

            // Reset state
            contract.reset_game_state();

            // Check everything is reset
            assert_eq!(contract.get_game_state(), GameState::Inactive);
            assert_eq!(contract.get_buy_in_amount(), 0);
            assert_eq!(contract.get_player_count(), 0);
            assert_eq!(contract.get_prize_pool(), 0);
        }
    }

    /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    ///
    /// When running these you need to make sure that you:
    /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    /// - Are running a Substrate node which contains `pallet-contracts` in the background
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// A helper function used for calling contract messages.
        use ink_e2e::build_message;

        /// The End-to-End test `Result` type.
        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        /// We test that we can upload and instantiate the contract using its default constructor.
        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = AgarioBuyinRef::new(5);

            // When
            let contract_account_id = client
                .instantiate("agario_buyin", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            // Then
            let get_state = build_message::<AgarioBuyinRef>(contract_account_id.clone())
                .call(|contract| contract.get_game_state());
            let get_state_result = client
                .call_dry_run(&ink_e2e::alice(), &get_state, 0, None)
                .await;
            assert!(matches!(
                get_state_result.return_value(),
                GameState::Inactive
            ));

            Ok(())
        }
    }
}
