# 🏆 Hackathon Cloud Development Guide

## 🚀 Quick Start: Zero Local Setup Required

### **Option 1: Smart Contract Only Build**
1. Go to: `GitHub Actions` → `Smart Contract - Hackathon Cloud Build`
2. Click `Run workflow`
3. Select build type:
   - `quick-build`: Fast build, skip tests (2-3 minutes)
   - `full-build-with-tests`: Complete build with tests (4-5 minutes)
   - `deployment-ready`: Production-ready build (5-6 minutes)
4. Download artifacts from the completed run

### **Option 2: Full Stack Deployment**
1. Go to: `GitHub Actions` → `Hackathon Full Stack Deploy`
2. Click `Run workflow`
3. Configure:
   - Environment: `development` for testing, `staging` for demos
   - Network: `pop-testnet` for hackathon
   - Skip contract tests: `true` for faster builds
4. Get live URL: `https://synergy42.azurewebsites.net`

## 🏃‍♂️ Speed Comparison

### **Local Development:**
- Initial setup: 30-45 minutes
- Rust toolchain: ~1.5GB
- cargo-contract: ~500MB
- Dependencies: ~1GB
- **Total space: ~3GB**
- Build time: 3-5 minutes

### **Cloud Development:**
- Initial setup: 0 minutes
- Local space: 0 bytes
- Build time: 2-4 minutes
- **Total space: 0GB**
- Parallel builds: ✅ Multiple team members

## 🛠️ Development Workflow

### **1. Code Changes**
```bash
# Edit locally (just text editor needed)
git add .
git commit -m "Update contract logic"
git push origin main
```

### **2. Build & Test**
- Trigger workflow manually
- Wait 2-4 minutes
- Download artifacts if needed

### **3. Deploy & Demo**
- Use full stack deploy
- Get live URL instantly
- Perfect for hackathon demos

## 📦 Available Artifacts

After each build, you get:
- `agario_buyin.contract` - Complete contract bundle
- `agario_buyin.wasm` - WebAssembly bytecode
- `agario_buyin.json` - Contract metadata/ABI

## 🔧 Local Development (If Needed)

If you need local development:

```bash
# Minimal local setup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install cargo-contract

# Or use Docker
docker run --rm -v $(pwd):/code -w /code paritytech/contracts-ci-linux cargo contract build
```

## 🎯 Hackathon Strategy

### **Day 1-2: Pure Cloud Development**
- Focus on contract logic
- Use quick builds for iteration
- No local Rust setup needed

### **Day 3-4: Frontend Integration**
- Use full stack deployment
- Test with live contract
- Iterate quickly

### **Day 5: Demo Preparation**
- Use deployment-ready builds
- Test on staging environment
- Perfect for presentations

## 🚨 Emergency Fallbacks

### **If GitHub Actions Fails:**
1. Use `azure-deployment-alternative.yml`
2. Local development as last resort
3. Docker-based builds

### **If Azure Deployment Fails:**
1. Download artifacts manually
2. Use local development server
3. Deploy to alternative platforms

## 📊 Resource Usage

### **GitHub Actions Limits:**
- 2,000 minutes/month (free tier)
- Each build: 3-5 minutes
- ~400-600 builds possible per month

### **Azure Deployment:**
- Already configured
- Automatic SSL certificates
- Custom domain ready

## 🔍 Debugging

### **Contract Issues:**
- Check workflow logs
- Download artifacts to inspect
- Use contract metadata for debugging

### **Frontend Issues:**
- Check deployment logs
- Test locally with downloaded contract
- Use browser developer tools

## 💡 Pro Tips

1. **Use quick-build for iterations**: Skip tests during development
2. **Parallel development**: Multiple team members can trigger builds
3. **Cache benefits**: Second builds are faster (~1-2 minutes)
4. **Artifact retention**: 30 days for hackathon duration
5. **Live demos**: Use staging environment for presentations

## 🎪 Demo Day Checklist

- [ ] Contract deployed to testnet
- [ ] Frontend deployed to Azure
- [ ] Live URL accessible
- [ ] Contract integration working
- [ ] Backup artifacts downloaded
- [ ] Alternative deployment ready

## 🤝 Team Collaboration

### **Roles:**
- **Smart Contract Dev**: Triggers contract builds
- **Frontend Dev**: Uses artifacts for integration
- **DevOps**: Monitors deployments
- **Demo**: Uses live URLs for presentations

### **Communication:**
- Slack integration available
- Email notifications on build completion
- Real-time status in GitHub Actions tab

---

**TL;DR: Yes, cloud development is perfect for hackathons! Zero local setup, faster builds, and instant deployment. Use the workflows above to save space and speed up development.**
