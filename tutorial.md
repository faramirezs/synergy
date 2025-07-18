--------------------------------------------------------------------------------
Part 1: Introduction to ink! and Smart Contract Setup
This section will introduce you to ink! and Rust basics relevant to smart contract development, covering how to set up your environment, define contract storage, and structure your project.
1.1 Setting Up Your ink! Development Environment
To begin developing with ink!, you need the cargo-contract CLI tool.
• You can install cargo-contract by running the command: cargo install cargo-contract --force --locked. The --force flag ensures you get the latest version, and --locked uses the exact version specified in Cargo.lock.
Once cargo-contract is installed, you can scaffold a new ink! smart contract project:
• Use the command: cargo contract new flipper. This command creates a directory named 'flipper' containing the contract's source code (lib.rs), Rust dependencies, and ink! configuration (Cargo.toml).
After creating your project, you'll want to compile and test it:
• To compile your ink! smart contract, use: cargo contract build. This command typically builds in debug mode, generating a Wasm binary, a metadata file (ABI), and a bundled .contract file in the target/ink directory.
• To run the default tests for your ink! smart contract project, execute: cargo test. This helps ensure basic functionality and compilation correctness.
1.2 Basic Rust and ink! Contract Structure
An ink! smart contract is written in Rust and uses specific macros to define its structure and behavior.
• Contract Module: Every ink! contract is defined within a Rust module annotated with #[ink::contract]. This macro sets up the necessary environment for your contract.
• Contract Storage: The state of your contract is defined in a struct annotated with #[ink(storage)]. This struct represents the contract's internal state.
    ◦ For our Agario buy-in contract, the storage includes administrative fields, game state management, timing, and player/prize pool information.
    ◦ ink::storage::Mapping: This data structure is used for efficient key-value storage within the contract. It's crucial to remember that a value retrieved using Mapping::get() is an owned local copy, not a reference. Therefore, any modifications to this local copy must be explicitly re-inserted into the Mapping using insert() to persist changes in the contract's storage.
• Constructor: A constructor is a special public function marked with #[ink(constructor)]. It's called when the contract is deployed and is responsible for bootstrapping the initial contract state into storage.
    ◦ Our AgarioBuyin contract's constructor takes an admin_fee percentage and initializes all contract fields to their default or starting values, setting the game_admin to the caller of the constructor. It also includes validation to ensure the admin_fee is not greater than 100.
• Message Functions: These are public dispatchable functions marked with #[ink(message)]. They expose the contract's interface to the outside world.
    ◦ Accessing Environment: Within a message function, you can access the contract's execution environment using self.env(). This allows you to retrieve information like the caller's address (self.env().caller()), the transferred value (self.env().transferred_value()), or the current block timestamp (self.env().block_timestamp()).
    ◦ Payable Messages: Some messages can be marked as #[ink(payable)], allowing them to receive funds during invocation, which is essential for the buy-in mechanism.
• Error Handling: ink! uses Rust's Result type for error handling. If a function returns an Err, the transaction state is reverted, similar to require or revert in Solidity. Your contract defines an Error enum with various specific error types like NotAdmin, GameNotInCorrectState, IncorrectBuyInAmount, etc..
1.3 Game State Definition
The AgarioBuyin contract defines an enum called GameState to manage the different stages of the game.
• Inactive: The game is not active and waiting to be started.
• AcceptingDeposits: The game has been started, and players can deposit their buy-in to join.
• InProgress: The game has officially begun.
• WaitingForResults: The game has ended, and the contract is waiting for the winner submission.
Another enum, GameEndReason, defines why a game might end: TimeLimit, LastPlayerStanding, or AdminForced.
--------------------------------------------------------------------------------
Part 2: Game Logic & State Transitions
This section will dive into implementing the core game logic, including player registration, managing game states, handling timing, and applying crucial validations.
2.1 Starting a New Game ()
The start_game function is responsible for initiating a new game round.
• It's an admin-only function, meaning only the game_admin can call it. It checks self.env().caller() != self.game_admin to enforce this.
• It only works if the game_state is Inactive.
• It takes parameters such as buy_in amount, registration_minutes, min_players, and game_duration_minutes.
• Validations: It includes checks for TooFewPlayers (e.g., min_players must be at least 2) and GameNotInCorrectState if a game is already active.
• State Setup: It sets the buy_in_amount, min_players, and calculates the registration_deadline based on the current block timestamp and registration_minutes. The game_duration is also set if provided.
• Transition: Finally, it transitions the game_state to AcceptingDeposits.
2.2 Player Registration and Deposits ()
The deposit function allows players to join the game by sending their buy-in.
• It's a #[ink(message, payable)] function, meaning it can receive funds.
• State and Deadline Checks: It first verifies that the game_state is AcceptingDeposits and that the current time is before the registration_deadline. If the deadline has passed, it returns Error::RegistrationClosed.
• Amount and Player Checks: It ensures the transferred_value matches the buy_in_amount, prevents PlayerAlreadyDeposited, and checks if the game is GameFull if max_players is set.
• Player & Prize Pool Update: If all checks pass, the caller is added to the players mapping, player_count is incremented, and the prize_pool is updated with the deposit_amount.
• Automatic Game Start: After a successful deposit, it calls self.try_begin_game(), which attempts to start the game if the conditions (registration deadline passed and minimum players met) are fulfilled.
2.3 Game State Transitions and Timing
The contract includes functions to manage automatic state transitions and check time remaining.
• try_begin_game: This function is called internally (e.g., after a deposit) or externally to try and transition the game from AcceptingDeposits to InProgress.
    ◦ If the registration_deadline has passed and player_count meets min_players, the game_state changes to InProgress, and game_start_time is recorded.
    ◦ If the registration_deadline has passed but player_count is insufficient, all deposited funds are refund_all_players.
• check_game_conditions: This function allows the contract to be prompted to check if any state transitions are due based on time.
    ◦ In the AcceptingDeposits state: If registration_deadline has passed, it either transitions to InProgress (if enough players) or refunds all players and resets to Inactive (if too few players).
    ◦ In the InProgress state: If a game_duration is set and has expired, it transitions to WaitingForResults.
• Time Remaining Queries:
    ◦ get_registration_time_remaining(): Returns the time left for deposits if the game is AcceptingDeposits, otherwise 0.
    ◦ get_game_time_remaining(): Returns the time left in the game if it's InProgress and has a time limit.
--------------------------------------------------------------------------------
Part 3: Game Conclusion, Prize Distribution & Testing
This final section covers how the game ends, how prizes are distributed (including admin fees), and how to thoroughly test your ink! smart contract.
3.1 Game Conclusion and Prize Distribution
• report_game_end: This function allows the game server or an administrator to signal that the game has concluded.
    ◦ It checks that the game_state is InProgress.
    ◦ For GameEndReason::AdminForced, it requires the caller to be the game_admin. For TimeLimit or LastPlayerStanding, the sources indicate that for MVP, any caller is allowed, but in production, this would be restricted to an authorized game server.
    ◦ Upon successful reporting, the game_state transitions to WaitingForResults.
• submit_winners: This is the critical function for prize distribution, callable only by the game_admin.
    ◦ It requires the game_state to be WaitingForResults.
    ◦ Input Validations: It performs several checks on the provided winners and percentages vectors:
        ▪ NoWinners: Ensures the winners list is not empty.
        ▪ MismatchedData: Checks if the number of winners matches the number of percentages.
        ▪ InvalidPercentages: Verifies that the sum of all percentages does not exceed 100.
    ◦ Admin Fee Calculation: The contract calculates an admin_cut from the prize_pool based on the admin_fee_percentage initialized during contract deployment.
    ◦ Prize Distribution: It iterates through the winners, calculates each prize based on their allocated percentage of the winner_pool (prize pool minus admin fee), and transfers the funds using self.env().transfer(*winner, prize.into()). The admin_cut is also transferred to the game_admin.
    ◦ Game Reset: After prize distribution, the contract calls self.reset_game_state() to return to an Inactive state, clearing all game-specific parameters like buy_in_amount, player_count, and prize_pool.
• Refunds (refund_all_players, force_end_game):
    ◦ The refund_all_players is an internal function used when a game fails to start due to insufficient players. It resets the game state.
    ◦ force_end_game is an admin-only emergency function that allows the admin to force-end an active game and refund all players.
3.2 Events (Temporarily Disabled in Sources)
The contract is designed with a comprehensive event system, although events are currently commented out due to ink! v6 TopicsBuilder compatibility issues.
• Events are defined using #[ink(event)], and specific fields can be indexed as topics using #[ink(topic)] for easier logging and filtering.
• When re-enabled, events would be emitted at critical state changes using self.env().emit_event().
• The contract defines six events to cover game lifecycle and state changes: GameStarted, PlayerJoined, GameBegan, GameTimeExpired, GameEnded, and GameRefunded.
3.3 Unit Testing Your Contract
The provided sources include extensive unit tests for the AgarioBuyin contract, demonstrating how to ensure its functionality and robustness.
• Test Structure: Unit tests are defined within a #[cfg(test)] mod tests block, with individual test functions marked with #[ink::test].
• Constructor Tests: Verify that the constructor initializes the contract correctly and validates inputs (e.g., constructor_works, constructor_validates_admin_fee).
• Query Functions: Test that getter functions (get_game_state, get_player_count, get_prize_pool, etc.) return expected values.
• Functionality Tests:
    ◦ start_game_works and start_game_validates_parameters check game initiation.
    ◦ game_flow_transitions_work and check_game_conditions_handles_transitions verify state changes based on conditions.
    ◦ submit_winners_validates_input ensures correct input validation for prize distribution.
    ◦ submit_winners_distributes_prizes_correctly checks prize calculation logic, including the admin fee.
• Admin Access Control: admin_functions_require_admin and mvp_admin_access_control_comprehensive demonstrate how to mock different callers (ink::env::test::set_caller) to test that admin-only functions are properly restricted.
• Happy Path Flow: The mvp_complete_happy_path_flow test simulates the entire game lifecycle from start to finish, including player deposits, game beginning, ending, and prize distribution. This is a critical test for overall contract correctness.
• Critical Error Cases: mvp_critical_error_cases specifically tests scenarios that should fail, like invalid game parameters or operations in incorrect game states.
• Simulating Time: In tests, registration_deadline and game_start_time can be manually set to simulate the passage of time for automatic transitions.
• Simulating Deposits: For unit tests, player deposits and prize pool increases can be simulated by manually updating contract state fields (e.g., contract.players.insert(...), contract.player_count = ..., contract.prize_pool = ...) rather than requiring actual payable calls.
By following these conceptual and technical foundations, you will be able to build a fully functional, testable Agario-inspired buy-in game contract using ink! and Rust.
