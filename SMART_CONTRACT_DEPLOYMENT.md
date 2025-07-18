# Smart Contract CI/CD & Deployment Guide

## 🎯 **CI/CD Pipeline Overview**

Our smart contract uses a comprehensive CI/CD pipeline with multiple quality gates:

### **Pipeline Stages:**

1. **🧪 Test Stage**
   - Unit tests (`cargo test`)
   - Contract compilation verification
   - Build artifacts generation (debug & release)
   - Artifact upload for later stages

2. **🔍 Lint Stage**
   - Code formatting (`cargo fmt`)
   - Clippy linting (`cargo clippy`)
   - ink! specific linting (when available)

3. **🔒 Security Stage**
   - Dependency audit (`cargo audit`)
   - Security vulnerability scanning

4. **🔗 Integration Stage**
   - E2E tests with substrate-contracts-node
   - End-to-end contract interaction testing

5. **🚀 Deploy Stage** (main/master branch only)
   - Production build generation
   - Deployment artifact packaging
   - GitHub releases (on version tags)

## 📦 **Build Artifacts**

The pipeline generates three key artifacts:

- **`agario_buyin.contract`** - Complete contract bundle (code + metadata)
- **`agario_buyin.wasm`** - Optimized WebAssembly bytecode
- **`agario_buyin.json`** - Contract ABI and metadata

## 🗂️ **File Management Strategy**

### **What's Ignored (.gitignore):**
```
# Large build directories (5.4GB+)
agario_buyin/target/
agario_buyin/Cargo.lock

# OS and IDE files
.DS_Store, .vscode/, .idea/

# Temporary and log files
*.log, *~, *.swp
```

### **What's Committed:**
- Source code (`src/lib.rs`, `Cargo.toml`)
- CI/CD configurations (`.github/workflows/`)
- Documentation and specifications
- **Important:** Contract artifacts are generated by CI/CD, not committed

### **Artifact Management:**
- **Development**: Artifacts generated locally for testing
- **Staging**: CI/CD generates artifacts for each PR
- **Production**: CI/CD generates artifacts for main branch
- **Releases**: Tagged builds create GitHub releases with artifacts

## 🔄 **Deployment Workflow**

### **Development Process:**
1. Make changes to contract code
2. Local testing: `cargo test` and `cargo contract build`
3. Create PR → triggers CI/CD pipeline
4. All stages must pass for merge approval
5. Merge to main → production artifacts generated

### **Release Process:**
1. Tag version: `git tag v1.0.0`
2. Push tag: `git push origin v1.0.0`
3. CI/CD creates GitHub release with contract artifacts
4. Download artifacts from release for deployment

### **Manual Deployment Commands:**
```bash
# Local build and test
cd agario_buyin
cargo test
cargo contract build --release

# Deploy to testnet (example)
cargo contract instantiate \
  --constructor new \
  --args 5 \
  --suri //Alice \
  --url ws://localhost:9944

# Verify deployment
cargo contract call \
  --contract <CONTRACT_ADDRESS> \
  --message get_game_state \
  --suri //Alice
```

## 📊 **Pipeline Triggers**

- **Push to main/master/develop**: Full pipeline + deployment
- **Pull Requests**: Test, lint, security, integration (no deployment)
- **Manual Trigger**: Full pipeline via GitHub Actions UI
- **Path Filter**: Only triggers on changes to `agario_buyin/` directory

## 🛡️ **Quality Gates**

All stages must pass before deployment:
- ✅ Unit tests pass
- ✅ Code formatting check
- ✅ Linting without warnings
- ✅ Security audit clean
- ✅ E2E tests pass
- ✅ Contract builds successfully

## 🔧 **Local Development Setup**

```bash
# Install required tools
rustup target add wasm32-unknown-unknown
rustup component add rust-src
cargo install cargo-contract

# Development workflow
cd agario_buyin
cargo check          # Quick compilation check
cargo test           # Run unit tests
cargo contract build # Build contract
```

## 📈 **Monitoring & Optimization**

- **Build Time**: ~3-5 minutes for full pipeline
- **Artifact Size**: ~2KB optimized WASM (from ~21KB original)
- **Retention**:
  - Development artifacts: 30 days
  - Production artifacts: 90 days
  - Release artifacts: Permanent

## 🔄 **Latest Updates**

- ✅ **Updated to latest GitHub Actions**:
  - `actions/upload-artifact@v4` (was v3)
  - `actions/cache@v4` (was v3)
  - `dtolnay/rust-toolchain@stable` (replaces deprecated actions-rs/toolchain)
  - `softprops/action-gh-release@v2` (replaces deprecated actions/create-release)
- ✅ **Improved Release Process**: Automatic file uploads to GitHub releases
- ✅ **Better Rust Toolchain Management**: More reliable and faster setup

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **Build fails**: Check Rust version and dependencies
2. **Tests fail**: Verify contract logic and test environment
3. **Linting fails**: Run `cargo fmt` and fix clippy warnings
4. **E2E fails**: Ensure substrate-contracts-node compatibility

### **Quick Fixes:**
```bash
# Fix formatting
cargo fmt

# Fix common clippy issues
cargo clippy --fix

# Clean build
cargo clean && cargo contract build
```

---

**Next Steps:** This pipeline is ready for integration with substrate-based testnets and mainnets. Consider adding deployment scripts for specific networks as needed.
