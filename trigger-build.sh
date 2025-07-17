#!/bin/bash

# 🏆 Hackathon Cloud Build Trigger Script
# Usage: ./trigger-build.sh [contract|fullstack] [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="faramirezs"
REPO_NAME="synergy"
BRANCH="main"

# Function to display usage
show_usage() {
    echo -e "${BLUE}🏆 Hackathon Cloud Build Trigger${NC}"
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./trigger-build.sh contract [quick|full|deploy]"
    echo "  ./trigger-build.sh fullstack [development|staging|production]"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./trigger-build.sh contract quick          # Quick contract build"
    echo "  ./trigger-build.sh contract full           # Full contract build with tests"
    echo "  ./trigger-build.sh fullstack development   # Full stack deployment"
    echo ""
    echo -e "${YELLOW}Requirements:${NC}"
    echo "  - GitHub CLI installed (gh)"
    echo "  - Authenticated with GitHub (gh auth login)"
    echo ""
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found${NC}"
    echo "Install: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Parse arguments
BUILD_TYPE=$1
ENVIRONMENT=$2

if [ -z "$BUILD_TYPE" ]; then
    show_usage
    exit 1
fi

case $BUILD_TYPE in
    "contract")
        WORKFLOW="smart-contract-ci.yml"
        case $ENVIRONMENT in
            "quick")
                BUILD_MODE="quick-build"
                SKIP_TESTS="true"
                ;;
            "full")
                BUILD_MODE="full-build-with-tests"
                SKIP_TESTS="false"
                ;;
            "deploy")
                BUILD_MODE="deployment-ready"
                SKIP_TESTS="false"
                ;;
            *)
                BUILD_MODE="quick-build"
                SKIP_TESTS="true"
                ;;
        esac

        echo -e "${BLUE}🦀 Triggering Smart Contract Build${NC}"
        echo -e "${YELLOW}Build Mode:${NC} $BUILD_MODE"
        echo -e "${YELLOW}Skip Tests:${NC} $SKIP_TESTS"

        gh workflow run $WORKFLOW \
            --ref $BRANCH \
            -f build_type=$BUILD_MODE \
            -f skip_tests=$SKIP_TESTS
        ;;

    "fullstack")
        WORKFLOW="hackathon-full-deploy.yml"
        case $ENVIRONMENT in
            "development"|"staging"|"production")
                DEPLOY_ENV=$ENVIRONMENT
                ;;
            *)
                DEPLOY_ENV="development"
                ;;
        esac

        echo -e "${BLUE}🌐 Triggering Full Stack Deployment${NC}"
        echo -e "${YELLOW}Environment:${NC} $DEPLOY_ENV"
        echo -e "${YELLOW}Network:${NC} pop-testnet"

        gh workflow run $WORKFLOW \
            --ref $BRANCH \
            -f deploy_environment=$DEPLOY_ENV \
            -f skip_contract_tests=true \
            -f contract_network=pop-testnet
        ;;

    *)
        echo -e "${RED}❌ Invalid build type: $BUILD_TYPE${NC}"
        show_usage
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Build triggered successfully!${NC}"
echo -e "${YELLOW}Monitor progress:${NC} https://github.com/$REPO_OWNER/$REPO_NAME/actions"

# Wait a moment and show recent runs
echo -e "${BLUE}📊 Recent workflow runs:${NC}"
gh run list --limit 3 --json displayTitle,status,conclusion,url --template '{{range .}}{{.displayTitle}} - {{.status}} ({{.conclusion}}) {{.url}}{{"\n"}}{{end}}'

echo -e "${GREEN}🎯 Tip:${NC} Use 'gh run watch' to monitor the latest run"
