#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod agario_buyin {
    use ink::storage::Mapping;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct AgarioBuyin {
        /// Administrative fields
        game_admin: AccountId,
        admin_fee_percentage: u8,
        
        /// Game state management
        game_state: GameState,
        buy_in_amount: Balance,
        registration_deadline: Timestamp,
        
        /// Player management
        players: Mapping<AccountId, ()>,
        player_count: u32,
        prize_pool: Balance,
    }

    /// Game state enumeration
    #[derive(Debug, PartialEq, Eq, Clone, Copy, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum GameState {
        Inactive,
        AcceptingDeposits,
        InProgress,
    }

    /// Error types for the contract
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
                registration_deadline: 0,
                players: Mapping::default(),
                player_count: 0,
                prize_pool: 0,
            })
        }

        /// Placeholder message function - will be implemented in later tasks
        #[ink(message)]
        pub fn get_game_state(&self) -> GameState {
            self.game_state
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
            let get_state_result = client.call_dry_run(&ink_e2e::alice(), &get_state, 0, None).await;
            assert!(matches!(get_state_result.return_value(), GameState::Inactive));

            Ok(())
        }
    }
}