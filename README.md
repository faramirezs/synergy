# 🦑 GameTreasury Protocol - ink! Smart Contract Framework

[![Build Status](https://github.com/faramirezs/synergy/workflows/Smart%20Contract%20CI/badge.svg)](https://github.com/faramirezs/synergy/actions)
[![ink! Version](https://img.shields.io/badge/ink!-5.0-blue)](https://use.ink/)
[![Polkadot](https://img.shields.io/badge/Polkadot-Ecosystem-pink)](https://polkadot.network/)

> **A production-ready smart contract framework for game monetization, built with ink! and Polkadot**

*Born from a 48-hour hackathon journey at Web3 Summit, where 42 Berlin students went from "What's ink!?" to shipping a fully functional Agario game treasury smart contract.*

## 🎯 Overview

GameTreasury Protocol is a comprehensive smart contract framework designed to lower the barrier for game studios to integrate blockchain treasuries. Built on Polkadot using ink!, it provides battle-tested patterns for game monetization, player management, and secure prize distribution.

## 🚀 Key Features

- **🎮 Complete Game Lifecycle Management**: Player registration, game execution, automated prize distribution
- **💰 Secure Treasury Logic**: Multi-winner support, configurable admin fees, automatic payouts
- **🛡️ Battle-Tested Security**: 23+ comprehensive unit tests, access control, error handling
- **⚡ Optimized CI/CD**: 60-70% faster builds with aggressive caching
- **📚 Developer-Friendly**: Complete documentation, tutorials, integration examples
- **🔧 Production-Ready**: Used in real hackathon environment under pressure

## 📁 Project Structure

```
synergy/
├── src/
│   └── lib.rs              # Main smart contract implementation
├── .github/
│   └── workflows/
│       └── smart-contract-ci.yml  # Optimized CI/CD pipeline
├── ink-tutorial.md         # Complete developer tutorial (1,400+ lines)
├── pitch-deck.md          # Business case and technical architecture
├── trigger-build.sh       # Build automation script
└── README.md              # This file
```

## 🛠️ Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) toolchain
- [cargo-contract](https://github.com/paritytech/cargo-contract) v3.2.0+
- [Polkadot.js Extension](https://polkadot.js.org/extension/) for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/faramirezs/synergy.git
cd synergy

# Install cargo-contract
cargo install --force --locked cargo-contract --version 3.2.0

# Build the contract
cargo contract build --release
```

### Quick Build Options

Use our optimized build script for faster development:

```bash
# Quick syntax check (~30 seconds)
./trigger-build.sh contract quick

# Full build with tests (~90 seconds)
./trigger-build.sh contract test

# Deployment-ready build (~2 minutes)
./trigger-build.sh contract deploy
```

## 🎮 Contract Features

### Core Treasury Logic

```rust
#[ink(storage)]
pub struct AgarioBuyin {
    game_admin: H160,
    admin_fee_percentage: u8,
    game_state: GameState,
    buy_in_amount: Balance,
    players: Mapping<H160, ()>,
    prize_pool: Balance,
    // ... enhanced game management fields
}
```

### Game States

- **`Inactive`**: Contract deployed, ready for configuration
- **`AcceptingDeposits`**: Players can join and deposit buy-ins
- **`InProgress`**: Game is active, no new players allowed
- **`WaitingForResults`**: Game ended, waiting for winner submission

### Key Functions

#### Player Functions
- `deposit()`: Join game with buy-in payment
- `is_player_registered()`: Check registration status
- `get_game_state()`: Current game phase

#### Admin Functions
- `start_game()`: Initialize new game round
- `submit_winners()`: Distribute prizes to winners
- `force_end_game()`: Emergency refund mechanism

#### Query Functions
- `get_prize_pool()`: Current total prize pool
- `get_player_count()`: Number of registered players
- `get_time_remaining()`: Time left for registration/game

## 📖 Documentation

### Complete Tutorial
Our comprehensive tutorial (`ink-tutorial.md`) covers:
- Chapter 1: Your First Smart Contract - The Flipper
- Chapter 2: Storing Data Like a Pro
- Chapter 3: Managing Multiple Players with Mapping
- Chapter 4: Game States and Smart Logic
- Chapter 5: Handling Money - The Payable World
- Chapter 6: Access Control - Who's the Boss?
- Chapter 7: Error Handling - When Things Go Wrong
- And much more...

### Business Case
Check out `pitch-deck.md` for:
- Market opportunity analysis
- Technical architecture overview
- Business model and revenue streams
- Competitive advantages

## 🧪 Testing

We maintain comprehensive test coverage with 23+ unit tests:

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Test specific functionality
cargo test test_start_game_works
```

### Test Categories
- Constructor validation
- Game state transitions
- Player registration logic
- Payment handling
- Access control
- Error conditions
- Time-based functions

## 🚀 Deployment

### Testnet Deployment

```bash
# Build for deployment
cargo contract build --release

# Deploy to Pop Testnet (example)
cargo contract instantiate \
    --constructor new \
    --args 5 \
    --suri //Alice \
    --url wss://rpc.testnet.pop.ink

# Verify deployment
cargo contract call \
    --contract <CONTRACT_ADDRESS> \
    --message get_admin \
    --suri //Alice \
    --url wss://rpc.testnet.pop.ink
```

### Production Considerations

- Set appropriate admin fee percentage (typically 1-10%)
- Configure proper access controls
- Test all game scenarios thoroughly
- Monitor gas costs and optimize
- Implement proper error handling

## 🏗️ Architecture

### Smart Contract Layer
- **ink! v5.0**: Rust-based smart contract development
- **Polkadot Substrate**: Cross-chain compatible runtime
- **WASM Target**: Efficient bytecode execution

### Security Features
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive parameter checking
- **Safe Math**: Overflow protection with saturating operations
- **Error Handling**: Detailed error types and recovery

### Gas Optimization
- **Efficient Storage**: Mapping-based player tracking
- **Lazy Evaluation**: On-demand state transitions
- **Batch Operations**: Minimize transaction costs

## 💡 Use Cases

### Tournament Systems
```rust
// Configure tournament bracket
game.start_game(buy_in: 50_000_000_000, // 50 DOT
                min_players: 8,
                max_players: Some(16),
                duration_minutes: Some(120));
```

### Battle Royale Modes
```rust
// Last player standing
game.start_game(buy_in: 10_000_000_000, // 10 DOT
                min_players: 20,
                max_players: Some(100),
                duration_minutes: None); // No time limit
```

### Seasonal Leagues
```rust
// Recurring competitions with multiple prize tiers
game.submit_winners(winners: vec![alice, bob, charlie],
                   percentages: vec![60, 25, 15]); // 60%, 25%, 15%
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `cargo test`
5. Submit a pull request

### Development Guidelines
- Follow Rust best practices
- Maintain test coverage above 95%
- Update documentation for new features
- Use conventional commit messages

## 📊 Performance Metrics

### Build Times (With Optimized CI)
- **Quick Build**: ~30 seconds (syntax check only)
- **Full Build + Tests**: ~90 seconds
- **Deployment Ready**: ~2 minutes
- **Cache Hit**: 60-70% faster subsequent builds

### Contract Metrics
- **WASM Size**: ~45KB (optimized)
- **Metadata**: ~15KB
- **Gas Cost**: Efficient mapping-based operations
- **Storage**: Minimal on-chain footprint

## 🌟 Hackathon Origins

This project was born during a 48-hour hackathon at Web3 Summit, where our team of 42 Berlin students:

- ✅ Learned ink! smart contract development from scratch
- ✅ Built a complete Agario game treasury system
- ✅ Implemented 23+ comprehensive unit tests
- ✅ Created production-ready CI/CD pipeline
- ✅ Documented the entire development journey
- ✅ Demonstrated real-world blockchain gaming integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Game Integration Example]
- **Documentation**: [Complete ink! Tutorial](ink-tutorial.md)
- **Business Case**: [Pitch Deck](pitch-deck.md)
- **CI/CD Pipeline**: [GitHub Actions](.github/workflows/smart-contract-ci.yml)
- **ink! Documentation**: [use.ink](https://use.ink/)
- **Polkadot**: [polkadot.network](https://polkadot.network/)

## 🙏 Acknowledgments

- **42 Berlin**: For providing the foundation in Rust programming
- **Web3 Summit**: For hosting the hackathon that sparked this project
- **Polkadot Team**: For building the amazing Substrate framework
- **ink! Community**: For excellent documentation and support
- **Parity Technologies**: For the robust development tools

---

**Built with ❤️ by 42 Berlin students | Powered by ink! and Polkadot**

*Ready to revolutionize game monetization? Let's build the future of blockchain gaming together!*
