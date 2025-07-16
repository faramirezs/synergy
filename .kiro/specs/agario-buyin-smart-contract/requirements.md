# Requirements Document

## Introduction

This feature implements a Polkadot smart contract written in ink! to manage the player buy-in mechanism for an Agario-like game. The smart contract serves as a secure on-chain treasury that collects entry fees, holds them in escrow during gameplay, and distributes the prize pool to winners and administrators upon game completion. The contract focuses solely on financial transactions while the game logic remains in the frontend application.

The contract follows ink! best practices including proper event emission, secure storage patterns using `ink::storage::Mapping`, fallible storage operations for dynamic data, and comprehensive error handling with custom error enums.

## Requirements

### Requirement 1

**User Story:** As a game administrator, I want to initialize and configure a new game session, so that players can join with a specified buy-in amount within a registration window.

#### Acceptance Criteria

1. WHEN the contract is deployed THEN the system SHALL set the deployer as the game administrator
2. WHEN the administrator calls start_game with buy-in amount and registration period THEN the system SHALL transition to AcceptingDeposits state
3. WHEN start_game is called THEN the system SHALL calculate and store the registration deadline as current timestamp plus registration period
4. IF the game is not in Inactive state THEN the system SHALL reject start_game calls with GameNotInCorrectState error
5. IF a non-administrator calls start_game THEN the system SHALL reject with NotAdmin error
6. WHEN a game is started THEN the system SHALL emit GameStarted event with buy-in amount and deadline

### Requirement 2

**User Story:** As a player, I want to deposit the required buy-in amount to register and join a game, so that I can participate and compete for the prize pool using my Polkadot account identity.

#### Acceptance Criteria

1. WHEN a player calls deposit with correct buy-in amount before deadline THEN the system SHALL accept the deposit, register the player's AccountId, and add them to the game
2. WHEN a valid deposit is made THEN the system SHALL increment player count, add amount to prize pool, and store the player's AccountId in the players mapping
3. WHEN a player deposits THEN the system SHALL use the caller's AccountId as their unique game identifier without requiring separate registration
4. IF the game is not in AcceptingDeposits state THEN the system SHALL reject deposits with GameNotInCorrectState error
5. IF the deposit amount does not match buy-in amount THEN the system SHALL reject with IncorrectBuyInAmount error
6. IF a player AccountId has already deposited THEN the system SHALL reject subsequent deposits with PlayerAlreadyDeposited error
7. IF the registration deadline has passed THEN the system SHALL reject deposits with RegistrationPeriodOver error
8. WHEN a successful deposit is made THEN the system SHALL emit PlayerDeposited event with player AccountId and amount

### Requirement 3

**User Story:** As any user, I want the game to automatically transition to in-progress state after the registration deadline, so that no more players can join and the game can proceed.

#### Acceptance Criteria

1. WHEN try_begin_game is called after registration deadline THEN the system SHALL transition from AcceptingDeposits to InProgress state
2. WHEN the game transitions to InProgress THEN the system SHALL emit GameBegan event
3. IF try_begin_game is called before deadline THEN the system SHALL reject with RegistrationPeriodNotOver error
4. IF the game is not in AcceptingDeposits state THEN the system SHALL reject with GameNotInCorrectState error

### Requirement 4

**User Story:** As a game administrator, I want to declare winners and distribute the prize pool, so that winning players receive their rewards and I receive my administrative fee.

#### Acceptance Criteria

1. WHEN the administrator calls end_game with winner addresses THEN the system SHALL calculate admin fee and remaining prize pool
2. WHEN end_game is executed THEN the system SHALL transfer admin fee percentage to administrator account
3. WHEN end_game is executed THEN the system SHALL distribute remaining prize pool equally among all winners
4. WHEN prizes are distributed THEN the system SHALL transition game state back to Inactive
5. IF end_game is called by non-administrator THEN the system SHALL reject with NotAdmin error
6. IF the game is not in InProgress state THEN the system SHALL reject with GameNotInCorrectState error
7. IF the winners list is empty THEN the system SHALL reject with NoWinners error
8. WHEN end_game completes successfully THEN the system SHALL emit GameEnded event with winners, admin payout, and winner payout amounts

### Requirement 5

**User Story:** As a developer integrating with the contract, I want comprehensive error handling and events, so that I can provide clear feedback to users and track game state changes.

#### Acceptance Criteria

1. WHEN any contract function encounters an error condition THEN the system SHALL return a specific Error enum variant
2. WHEN state changes occur THEN the system SHALL emit appropriate events for frontend integration
3. WHEN errors occur THEN the system SHALL provide descriptive error types including NotAdmin, GameNotInCorrectState, IncorrectBuyInAmount, PlayerAlreadyDeposited, NoWinners, RegistrationPeriodNotOver, and RegistrationPeriodOver
4. WHEN events are emitted THEN the system SHALL include relevant data for frontend state synchronization

### Requirement 6

**User Story:** As a user of the system, I want the contract to be secure and gas-efficient, so that my funds are protected and transaction costs are minimized.

#### Acceptance Criteria

1. WHEN end_game function executes THEN the system SHALL follow checks-effects-interactions pattern to prevent reentrancy attacks
2. WHEN storing player data THEN the system SHALL use ink::storage::Mapping for gas-efficient lookups and insertions
3. WHEN handling funds THEN the system SHALL ensure all transfers are atomic and properly validated
4. WHEN state changes occur THEN the system SHALL update all relevant state variables before external interactions
5. WHEN access control is required THEN the system SHALL verify caller permissions before executing privileged operations

### Requirement 7

**User Story:** As a developer, I want the contract to follow ink! best practices and security patterns, so that the contract is maintainable, secure, and passes linting checks.

#### Acceptance Criteria

1. WHEN defining events THEN the system SHALL use #[ink(event)] attribute and include #[ink(topic)] for indexed fields
2. WHEN implementing storage operations THEN the system SHALL use fallible try_* methods for dynamic data to prevent buffer overflows
3. WHEN defining custom data structures THEN the system SHALL derive scale::Encode and scale::Decode traits for SCALE codec compatibility
4. WHEN implementing message functions THEN the system SHALL use &self for read-only operations and &mut self for state-changing operations
5. WHEN the contract is built THEN the system SHALL pass cargo contract build --lint without security warnings
6. WHEN storing data that can be removed THEN the system SHALL provide mechanisms to free storage and allow deposit reclamation
7. WHEN handling Balance comparisons THEN the system SHALL avoid strict equality checks to prevent common smart contract vulnerabilities

### Requirement 8

**User Story:** As a frontend developer, I want predictable contract interfaces and comprehensive metadata, so that I can easily integrate with the contract using polkadot-js/api.

#### Acceptance Criteria

1. WHEN the contract is compiled THEN the system SHALL generate complete ABI metadata for all public functions and events
2. WHEN functions return errors THEN the system SHALL use Result<(), Error> pattern for consistent error handling
3. WHEN events are emitted THEN the system SHALL include all necessary data for frontend state synchronization and user notifications
4. WHEN the contract is deployed THEN the system SHALL be queryable via contractsApi.getStorage for storage inspection
5. WHEN message functions are called THEN the system SHALL provide clear success/failure responses that can be decoded by frontend applications