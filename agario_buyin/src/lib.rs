#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod agario_buyin {
    use ink::storage::Mapping;
    use ink::H160;

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
    }

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
