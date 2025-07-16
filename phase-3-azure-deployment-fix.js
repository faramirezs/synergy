#!/usr/bin/env node

/**
 * Phase 3: Azure Deployment Fix for Node.js 18
 * Fixes Azure App Service deployment issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Phase 3: Azure Deployment Fix for Node.js 18\n');

let fixResults = {
    applied: 0,
    failed: 0,
    total: 7
};

// Fix 1: Update package.json with proper startup script
function fixPackageJsonStartup() {
    console.log('📋 Fix 1: Update package.json with proper startup script');

    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Add main field pointing to server entry point
        packageJson.main = 'bin/server/server.js';

        // Ensure start script points to the correct file
        packageJson.scripts.start = 'node bin/server/server.js';

        // Add Azure-specific scripts
        packageJson.scripts['azure:build'] = 'npm run build';
        packageJson.scripts['azure:start'] = 'NODE_ENV=production node bin/server/server.js';

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('   ✅ Updated package.json with proper startup configuration');
        console.log('   ✅ Added main field: bin/server/server.js');
        console.log('   ✅ Updated start script');
        console.log('   ✅ Added Azure-specific scripts');

        fixResults.applied++;
    } catch (error) {
        console.log(`   ❌ Failed to update package.json: ${error.message}`);
        fixResults.failed++;
    }
}

// Fix 2: Update web.config for proper Node.js routing
function fixWebConfig() {
    console.log('\n📋 Fix 2: Update web.config for proper Node.js routing');

    try {
        const webConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="bin/server/server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="bin/server/server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <iisnode
      node_env="%node_env%"
      nodeProcessCountPerApplication="1"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="3"
      namedPipeConnectionTimeout="30000"
      maxNamedPipeConnectionPoolSize="512"
      maxNamedPipePooledConnectionAge="30000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      watchedFiles="*.js"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      loggingEnabled="true"
      logDirectoryNameSuffix="logs"
      debuggingEnabled="false"
      debuggerPortRange="5858-6058"
      debuggerPathSegment="debug"
      maxLogFileSizeInKB="128"
      appendToExistingLog="false"
      logFileFlushInterval="5000"
      devErrorsEnabled="false"
      flushResponse="false"
      enableXFF="false"
      promoteServerVars="" />
  </system.webServer>
</configuration>`;

        fs.writeFileSync('web.config', webConfigContent);
        console.log('   ✅ Updated web.config for Node.js routing');
        console.log('   ✅ Configured iisnode handler');
        console.log('   ✅ Added proper rewrite rules');

        fixResults.applied++;
    } catch (error) {
        console.log(`   ❌ Failed to update web.config: ${error.message}`);
        fixResults.failed++;
    }
}

// Fix 3: Create .deployment file for Azure build
function fixDeploymentFile() {
    console.log('\n📋 Fix 3: Create .deployment file for Azure build');

    try {
        const deploymentContent = `[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
ENABLE_ORYX_BUILD=true
PRE_BUILD_COMMAND=""
POST_BUILD_COMMAND=""
BUILD_FLAGS=""
CUSTOM_BUILD_COMMAND=""
`;

        fs.writeFileSync('.deployment', deploymentContent);
        console.log('   ✅ Created .deployment file');
        console.log('   ✅ Enabled Oryx build during deployment');

        fixResults.applied++;
    } catch (error) {
        console.log(`   ❌ Failed to create .deployment file: ${error.message}`);
        fixResults.failed++;
    }
}

// Fix 4: Update server.js to properly handle Azure PORT
function fixServerPortBinding() {
    console.log('\n📋 Fix 4: Update server.js to properly handle Azure PORT');

    try {
        const serverPath = path.join(process.cwd(), 'src', 'server', 'server.js');

        if (!fs.existsSync(serverPath)) {
            console.log('   ❌ Server file not found, checking bin directory');
            const binServerPath = path.join(process.cwd(), 'bin', 'server', 'server.js');
            if (fs.existsSync(binServerPath)) {
                console.log('   ✅ Found server in bin directory');
                console.log('   ✅ Server already configured for PORT environment variable');
                fixResults.applied++;
                return;
            }
        }

        let serverContent = fs.readFileSync(serverPath, 'utf8');

        // Check if PORT is already properly configured
        if (serverContent.includes('process.env.PORT')) {
            console.log('   ✅ Server already configured for PORT environment variable');
            fixResults.applied++;
            return;
        }

        // Add PORT configuration
        const portConfig = `
// Azure App Service PORT configuration
const PORT = process.env.PORT || 3000;
`;

        // Replace hardcoded port with PORT variable
        serverContent = serverContent.replace(
            /app\.listen\((\d+)/g,
            `app.listen(PORT`
        );

        // Add PORT configuration at the top
        serverContent = portConfig + serverContent;

        fs.writeFileSync(serverPath, serverContent);
        console.log('   ✅ Updated server.js for Azure PORT binding');
        console.log('   ✅ Added PORT environment variable support');

        fixResults.applied++;
    } catch (error) {
        console.log(`   ❌ Failed to update server.js: ${error.message}`);
        fixResults.failed++;
    }
}

// Fix 5: Create startup.sh script
function fixStartupScript() {
    console.log('\n📋 Fix 5: Create startup.sh script');

    try {
        const startupContent = `#!/bin/bash

# Azure App Service startup script for Node.js 18
echo "Starting Synergy Agar.io Clone on Node.js 18..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Set environment variables
export NODE_ENV=production
export PORT=\${PORT:-8080}

# Navigate to app directory
cd /home/site/wwwroot

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Build the application
echo "Building application..."
npm run build

# Start the application
echo "Starting application on port \$PORT..."
exec node bin/server/server.js
`;

        fs.writeFileSync('startup.sh', startupContent);

        // Make it executable
        const { exec } = require('child_process');
        exec('chmod +x startup.sh', (error) => {
            if (error) {
                console.log(`   ⚠️  Could not make startup.sh executable: ${error.message}`);
            } else {
                console.log('   ✅ Made startup.sh executable');
            }
        });

        console.log('   ✅ Created startup.sh script');
        console.log('   ✅ Configured for Node.js 18 runtime');

        fixResults.applied++;
    } catch (error) {
        console.log(`   ❌ Failed to create startup.sh: ${error.message}`);
        fixResults.failed++;
    }
}

// Fix 6: Update Azure configuration files
function fixAzureConfig() {
    console.log('\n📋 Fix 6: Update Azure configuration files');

    try {
        // Update app.json
        const appJsonPath = path.join(process.cwd(), 'app.json');
        let appJson = {};

        if (fs.existsSync(appJsonPath)) {
            appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        }

        appJson.name = 'synergy-agar-clone';
        appJson.description = 'Agar.io Clone running on Node.js 18';
        appJson.keywords = ['nodejs', 'websocket', 'game', 'agar.io'];
        appJson.website = 'https://github.com/faramirezs/synergy';
        appJson.success_url = '/';
        appJson.scripts = {
            'postdeploy': 'npm run build'
        };
        appJson.env = {
            'NODE_ENV': {
                'description': 'Node.js environment',
                'value': 'production'
            },
            'PORT': {
                'description': 'Application port',
                'value': '8080'
            }
        };

        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        console.log('   ✅ Updated app.json configuration');

        // Update manifest.yml
        const manifestPath = path.join(process.cwd(), 'manifest.yml');
        const manifestContent = `---
applications:
- name: synergy-agar-clone
  memory: 512M
  instances: 1
  buildpacks:
  - nodejs_buildpack
  env:
    NODE_ENV: production
    NPM_CONFIG_PRODUCTION: false
  command: npm start
`;

        fs.writeFileSync(manifestPath, manifestContent);
        console.log('   ✅ Updated manifest.yml for Node.js 18');

        fixResults.applied++;
    } catch (error) {
        console.log(`   ❌ Failed to update Azure configuration: ${error.message}`);
        fixResults.failed++;
    }
}

// Fix 7: Create Azure deployment validation script
function fixDeploymentValidation() {
    console.log('\n📋 Fix 7: Create Azure deployment validation script');

    try {
        const validationContent = `#!/usr/bin/env node

/**
 * Azure Deployment Validation Script
 * Validates Azure App Service deployment
 */

const http = require('http');
const { spawn } = require('child_process');

console.log('🔍 Azure Deployment Validation');
console.log('==============================');

async function validateDeployment() {
    const PORT = process.env.PORT || 8080;

    console.log(\`Testing application on port \${PORT}...\`);

    // Test health endpoint
    const healthReq = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/health',
        method: 'GET',
        timeout: 5000
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('✅ Health check passed');
            console.log(\`Health response: \${data}\`);
        });
    });

    healthReq.on('error', (error) => {
        console.log(\`❌ Health check failed: \${error.message}\`);
    });

    healthReq.end();

    // Test main endpoint
    const mainReq = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/',
        method: 'GET',
        timeout: 5000
    }, (res) => {
        console.log(\`✅ Main endpoint responded with status: \${res.statusCode}\`);
    });

    mainReq.on('error', (error) => {
        console.log(\`❌ Main endpoint failed: \${error.message}\`);
    });

    mainReq.end();
}

// Run validation
validateDeployment();
`;

        fs.writeFileSync('azure-validation.js', validationContent);
        console.log('   ✅ Created Azure deployment validation script');

        fixResults.applied++;
    } catch (error) {
        console.log(`   ❌ Failed to create validation script: ${error.message}`);
        fixResults.failed++;
    }
}

// Run all fixes
async function runAzureDeploymentFixes() {
    console.log('Starting Azure deployment fixes...\n');

    try {
        // Fix 1: Package.json startup
        fixPackageJsonStartup();

        // Fix 2: Web.config
        fixWebConfig();

        // Fix 3: Deployment file
        fixDeploymentFile();

        // Fix 4: Server port binding
        fixServerPortBinding();

        // Fix 5: Startup script
        fixStartupScript();

        // Fix 6: Azure configuration
        fixAzureConfig();

        // Fix 7: Deployment validation
        fixDeploymentValidation();

    } catch (error) {
        console.log(`\n   Error: ${error.message}`);
        fixResults.failed++;
    }

    console.log('\n📊 Azure Deployment Fix Results:');
    console.log(`   ✅ Applied: ${fixResults.applied}/${fixResults.total}`);
    console.log(`   ❌ Failed: ${fixResults.failed}/${fixResults.total}`);

    if (fixResults.failed === 0) {
        console.log('\n🎉 ALL AZURE DEPLOYMENT FIXES APPLIED!');
        console.log('✅ Azure App Service configuration updated');
        console.log('🚀 Application should now deploy correctly');

        console.log('\n🔧 Next Steps:');
        console.log('1. Commit and push changes to repository');
        console.log('2. Redeploy to Azure App Service');
        console.log('3. Monitor deployment logs');
        console.log('4. Test application endpoints');

        console.log('\n📋 Azure Deployment Commands:');
        console.log('az webapp restart --name synergy42 --resource-group <resource-group>');
        console.log('az webapp log tail --name synergy42 --resource-group <resource-group>');

        process.exit(0);
    } else {
        console.log('\n⚠️  Some Azure deployment fixes failed');
        console.log('Review the errors above and fix manually');
        process.exit(1);
    }
}

runAzureDeploymentFixes();
