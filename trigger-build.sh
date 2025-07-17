#!/bin/bash
# 🚀 Optimized Hackathon Cloud Build Script
# Usage: ./trigger-build-optimized.sh [contract|fullstack] [build_type]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Optimized Hackathon Cloud Build${NC}"
echo -e "${YELLOW}⚡ With aggressive caching for 60-70% faster builds${NC}"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found. Install with: brew install gh${NC}"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Please authenticate with GitHub: gh auth login${NC}"
    exit 1
fi

BUILD_TYPE=${1:-contract}
BUILD_MODE=${2:-quick-build}

case $BUILD_TYPE in
    "contract")
        echo -e "${GREEN}🔨 Building smart contract only${NC}"
        case $BUILD_MODE in
            "quick"|"quick-build")
                echo -e "${YELLOW}⚡ Quick build - syntax check only (~30 seconds)${NC}"
                gh workflow run "smart-contract-ci.yml" \
                    -f build_type=quick-build \
                    -f skip_tests=true
                ;;
            "test"|"full-build-with-tests")
                echo -e "${YELLOW}🧪 Full build with tests (~90 seconds)${NC}"
                gh workflow run "smart-contract-ci.yml" \
                    -f build_type=full-build-with-tests \
                    -f skip_tests=false
                ;;
            "deploy"|"deployment-ready")
                echo -e "${YELLOW}🚀 Deployment ready build (~2 minutes)${NC}"
                gh workflow run "smart-contract-ci.yml" \
                    -f build_type=deployment-ready \
                    -f skip_tests=false
                ;;
            *)
                echo -e "${RED}❌ Invalid build mode. Use: quick, test, or deploy${NC}"
                exit 1
                ;;
        esac
        ;;
    "fullstack")
        echo -e "${GREEN}🌐 Building full stack (contract + frontend)${NC}"
        echo -e "${YELLOW}⚡ Optimized build with caching (~3-4 minutes)${NC}"

        # Determine environment from build mode
        case $BUILD_MODE in
            "dev"|"development")
                DEPLOY_ENV="development"
                ;;
            "staging")
                DEPLOY_ENV="staging"
                ;;
            "prod"|"production")
                DEPLOY_ENV="production"
                ;;
            *)
                DEPLOY_ENV="development"
                ;;
        esac

        gh workflow run "hackathon-full-deploy.yml" \
            -f deploy_environment=$DEPLOY_ENV \
            -f skip_contract_tests=false \
            -f contract_network=pop-testnet
        ;;
    *)
        echo -e "${RED}❌ Invalid build type. Use: contract or fullstack${NC}"
        echo -e "${BLUE}Examples:${NC}"
        echo -e "  ./trigger-build.sh contract quick    # 30s"
        echo -e "  ./trigger-build.sh contract test     # 90s"
        echo -e "  ./trigger-build.sh contract deploy   # 2m"
        echo -e "  ./trigger-build.sh fullstack dev     # 3-4m"
        echo -e "  ./trigger-build.sh fullstack staging # 3-4m"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Build triggered successfully!${NC}"
echo -e "${BLUE}📊 Monitor progress: https://github.com/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/actions${NC}"
echo -e "${YELLOW}💾 Artifacts available for 30 days after build${NC}"
echo -e "${GREEN}⚡ Subsequent builds will be 60-70% faster due to caching${NC}"

# Wait a moment and show recent runs
echo -e "${BLUE}📊 Recent workflow runs:${NC}"
gh run list --limit 3 --json displayTitle,status,conclusion,url --template '{{range .}}{{.displayTitle}} - {{.status}} ({{.conclusion}}) {{.url}}{{"\n"}}{{end}}'

echo -e "${GREEN}🎯 Tip:${NC} Use 'gh run watch' to monitor the latest run"
