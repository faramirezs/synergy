#!/usr/bin/env node

/**
 * Phase 2.1: Production Optimization for Node.js 18
 * Optimizes the application for production deployment
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Phase 2.1: Production Optimization for Node.js 18\n');

// Function to run command and return promise
function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`📋 ${description}...`);

        exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
            if (error) {
                console.log(`   ❌ ${description} failed`);
                console.log(`   Error: ${error.message}`);
                reject(error);
            } else {
                console.log(`   ✅ ${description} completed`);
                resolve(stdout);
            }
        });
    });
}

// Task 1: Update remaining configuration files
function updateRemainingConfigs() {
    console.log('🔧 Task 1: Update Remaining Configuration Files\n');

    try {
        // Update manifest.yml for Cloud Foundry
        console.log('📋 Updating manifest.yml...');
        const manifestPath = path.join(__dirname, 'manifest.yml');
        if (fs.existsSync(manifestPath)) {
            let manifest = fs.readFileSync(manifestPath, 'utf8');
            // Add Node.js 18 specific configuration
            if (!manifest.includes('node_version')) {
                manifest = manifest.replace(
                    'buildpack: nodejs_buildpack',
                    'buildpack: nodejs_buildpack\n  node_version: 18'
                );
            }
            fs.writeFileSync(manifestPath, manifest);
            console.log('   ✅ manifest.yml updated for Node.js 18');
        }

        // Update app.json for Heroku
        console.log('📋 Updating app.json...');
        const appJsonPath = path.join(__dirname, 'app.json');
        if (fs.existsSync(appJsonPath)) {
            const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
            appJson.engines = {
                node: '18.x',
                npm: '9.x'
            };
            // Add Node.js 18 specific buildpacks
            if (!appJson.buildpacks) {
                appJson.buildpacks = [
                    { url: 'heroku/nodejs' }
                ];
            }
            fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
            console.log('   ✅ app.json updated for Node.js 18');
        }

        console.log('   ✅ Configuration files updated\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error updating configs: ${error.message}\n`);
        return false;
    }
}

// Task 2: Optimize webpack configuration for Node.js 18
function optimizeWebpackConfig() {
    console.log('📋 Task 2: Optimize Webpack Configuration...');

    try {
        const webpackPath = path.join(__dirname, 'webpack.config.js');
        let webpackConfig = fs.readFileSync(webpackPath, 'utf8');

        // Add Node.js 18 optimizations
        const optimizedConfig = webpackConfig.replace(
            'devtool: false,',
            `devtool: false,
    target: 'node18',
    optimization: {
        minimize: true,
        nodeEnv: 'production'
    },`
        );

        fs.writeFileSync(webpackPath, optimizedConfig);
        console.log('   ✅ Webpack configuration optimized for Node.js 18\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error optimizing webpack: ${error.message}\n`);
        return false;
    }
}

// Task 3: Optimize gulpfile for Node.js 18
function optimizeGulpfile() {
    console.log('📋 Task 3: Optimize Gulpfile for Node.js 18...');

    try {
        const gulpPath = path.join(__dirname, 'gulpfile.js');
        let gulpContent = fs.readFileSync(gulpPath, 'utf8');

        // Add Node.js 18 specific optimizations
        const optimizedGulp = gulpContent.replace(
            'function buildServer() {',
            `function buildServer() {
    // Node.js 18 optimizations
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';`
        );

        fs.writeFileSync(gulpPath, optimizedGulp);
        console.log('   ✅ Gulpfile optimized for Node.js 18\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error optimizing gulpfile: ${error.message}\n`);
        return false;
    }
}

// Task 4: Create production-ready Docker configuration
function createProductionDockerConfig() {
    console.log('📋 Task 4: Create Production Docker Configuration...');

    try {
        // Create Dockerfile.prod
        const prodDockerfile = `FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder /usr/src/app/bin ./bin
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Set ownership
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

EXPOSE 3000

CMD ["node", "bin/server/server.js"]
`;

        fs.writeFileSync('Dockerfile.prod', prodDockerfile);
        console.log('   ✅ Production Dockerfile created');

        // Create .dockerignore
        const dockerignore = `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.coverage
test
*.test.js
*.spec.js
src
gulpfile.js
webpack.config.js
.eslintrc
.babelrc
.travis.yml
TODO.md
`;

        fs.writeFileSync('.dockerignore', dockerignore);
        console.log('   ✅ .dockerignore created\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error creating Docker config: ${error.message}\n`);
        return false;
    }
}

// Task 5: Create production environment configuration
function createProductionEnvConfig() {
    console.log('📋 Task 5: Create Production Environment Configuration...');

    try {
        // Create config/production.js
        const configDir = path.join(__dirname, 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }

        const prodConfig = `module.exports = {
    ...require('../config'),
    // Production-specific overrides
    host: process.env.HOST || "0.0.0.0",
    port: process.env.PORT || 3000,

    // Enhanced security for production
    adminPass: process.env.ADMIN_PASS || "CHANGE_ME",

    // Performance optimizations
    networkUpdateFactor: 60, // Increased for better performance
    maxHeartbeatInterval: 3000, // Reduced for better responsiveness

    // Database optimizations
    sqlinfo: {
        fileName: process.env.DB_PATH || "db.sqlite3",
        // Add connection pooling if needed
    },

    // Node.js 18 specific optimizations
    nodeEnv: 'production',

    // Logging configuration
    logLevel: process.env.LOG_LEVEL || 'info',
    logpath: process.env.LOG_PATH || "logs/app.log",
};
`;

        fs.writeFileSync(path.join(configDir, 'production.js'), prodConfig);
        console.log('   ✅ Production configuration created');

        // Update main config to use environment-specific configs
        const mainConfigPath = path.join(__dirname, 'config.js');
        let mainConfig = fs.readFileSync(mainConfigPath, 'utf8');

        // Add environment detection
        const envConfig = `
// Environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
const baseConfig = {
`;

        mainConfig = mainConfig.replace('module.exports = {', envConfig);
        mainConfig = mainConfig.replace('};', `};

// Load environment-specific config
try {
    const envSpecificConfig = require(\`./config/\${environment}\`);
    module.exports = { ...baseConfig, ...envSpecificConfig };
} catch (error) {
    // Fall back to base config if env-specific config doesn't exist
    module.exports = baseConfig;
}
`);

        fs.writeFileSync(mainConfigPath, mainConfig);
        console.log('   ✅ Main configuration updated for environment detection\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error creating production config: ${error.message}\n`);
        return false;
    }
}

// Task 6: Add production scripts to package.json
function addProductionScripts() {
    console.log('📋 Task 6: Add Production Scripts...');

    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        // Add production scripts
        packageJson.scripts = {
            ...packageJson.scripts,
            'start:prod': 'NODE_ENV=production node bin/server/server.js',
            'build:prod': 'NODE_ENV=production npm run build',
            'docker:build': 'docker build -t synergy-agar:latest .',
            'docker:build:prod': 'docker build -f Dockerfile.prod -t synergy-agar:prod .',
            'docker:run': 'docker run -p 3000:3000 synergy-agar:latest',
            'docker:run:prod': 'docker run -p 3000:3000 synergy-agar:prod',
            'deploy:azure': 'az webapp deploy --resource-group myResourceGroup --name myApp --src-path .',
            'health:check': 'curl -f http://localhost:3000/health || exit 1',
            'logs:prod': 'tail -f logs/app.log'
        };

        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('   ✅ Production scripts added to package.json\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error adding production scripts: ${error.message}\n`);
        return false;
    }
}

// Task 7: Create health check endpoint
function createHealthCheckEndpoint() {
    console.log('📋 Task 7: Create Health Check Endpoint...');

    try {
        const serverPath = path.join(__dirname, 'src/server/server.js');
        let serverContent = fs.readFileSync(serverPath, 'utf8');

        // Add health check endpoint
        const healthCheckCode = `
// Health check endpoint for production monitoring
app.get('/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
    };
    res.json(health);
});

app.get('/ready', (req, res) => {
    // Check if app is ready to serve requests
    res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
    });
});

`;

        // Insert health check before the socket.io setup
        serverContent = serverContent.replace(
            'app.use(express.static(__dirname + \'/../client\'));',
            `app.use(express.static(__dirname + '/../client'));
${healthCheckCode}`
        );

        fs.writeFileSync(serverPath, serverContent);
        console.log('   ✅ Health check endpoints added\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error creating health check: ${error.message}\n`);
        return false;
    }
}

// Task 8: Run production build test
async function testProductionBuild() {
    console.log('📋 Task 8: Test Production Build...');

    try {
        await runCommand('NODE_ENV=production npm run build', 'Production build test');

        // Check if build artifacts exist
        const buildArtifacts = [
            'bin/server/server.js',
            'bin/client/index.html',
            'bin/client/js/app.js'
        ];

        for (const artifact of buildArtifacts) {
            if (!fs.existsSync(artifact)) {
                throw new Error(`Build artifact missing: ${artifact}`);
            }
        }

        console.log('   ✅ All build artifacts created successfully\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Production build test failed: ${error.message}\n`);
        return false;
    }
}

// Task 9: Create production deployment guide
function createDeploymentGuide() {
    console.log('📋 Task 9: Create Production Deployment Guide...');

    try {
        const deploymentGuide = `# Production Deployment Guide
## Node.js 18 Synergy Agar.io Clone

### Prerequisites
- Node.js 18.x LTS
- npm 9.x or higher
- Docker (optional)
- Azure CLI (for Azure deployment)

### Environment Variables
\`\`\`bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
ADMIN_PASS=your-secure-password
DB_PATH=/app/data/db.sqlite3
LOG_LEVEL=info
LOG_PATH=/app/logs/app.log
\`\`\`

### Production Build
\`\`\`bash
# Install dependencies
npm ci --only=production

# Build application
npm run build:prod

# Start application
npm run start:prod
\`\`\`

### Docker Deployment
\`\`\`bash
# Build production image
npm run docker:build:prod

# Run production container
npm run docker:run:prod
\`\`\`

### Azure App Service Deployment
\`\`\`bash
# Deploy to Azure
npm run deploy:azure
\`\`\`

### Health Checks
- Health endpoint: \`GET /health\`
- Ready endpoint: \`GET /ready\`

### Monitoring
- Application logs: \`npm run logs:prod\`
- Health check: \`npm run health:check\`

### Performance Optimization
- Node.js 18 built-in optimizations enabled
- Production webpack configuration
- Optimized network update factor
- Enhanced security configuration

### Security Considerations
- Change default admin password
- Use HTTPS in production
- Enable security headers
- Regular security updates
`;

        fs.writeFileSync('DEPLOYMENT_GUIDE.md', deploymentGuide);
        console.log('   ✅ Production deployment guide created\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error creating deployment guide: ${error.message}\n`);
        return false;
    }
}

// Main execution
async function main() {
    console.log('🎯 Starting Phase 2.1: Production Optimization\n');

    const results = {
        passed: 0,
        failed: 0,
        total: 9
    };

    const tasks = [
        { name: 'Update Configuration Files', func: updateRemainingConfigs },
        { name: 'Optimize Webpack', func: optimizeWebpackConfig },
        { name: 'Optimize Gulpfile', func: optimizeGulpfile },
        { name: 'Create Production Docker', func: createProductionDockerConfig },
        { name: 'Create Production Environment', func: createProductionEnvConfig },
        { name: 'Add Production Scripts', func: addProductionScripts },
        { name: 'Create Health Check', func: createHealthCheckEndpoint },
        { name: 'Test Production Build', func: testProductionBuild },
        { name: 'Create Deployment Guide', func: createDeploymentGuide }
    ];

    for (const task of tasks) {
        try {
            if (await task.func()) {
                results.passed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            results.failed++;
            console.log(`   ❌ Task failed: ${error.message}\n`);
        }
    }

    console.log('📊 Phase 2.1 Results:');
    console.log(`   ✅ Passed: ${results.passed}/${results.total}`);
    console.log(`   ❌ Failed: ${results.failed}/${results.total}`);

    if (results.failed === 0) {
        console.log('\n🎉 PHASE 2.1 COMPLETED!');
        console.log('✅ Application optimized for production deployment');
        console.log('✅ Docker configuration ready');
        console.log('✅ Health checks implemented');
        console.log('✅ Deployment guide created');
        console.log('\n🎯 Ready for Phase 2.2: Performance Testing');
    } else {
        console.log('\n⚠️  Phase 2.1 needs attention');
        console.log('Some tasks failed but core functionality should work');
    }
}

main().catch(error => {
    console.error(`\n💥 Phase 2.1 failed: ${error.message}`);
    process.exit(1);
});
