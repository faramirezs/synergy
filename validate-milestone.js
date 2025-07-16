#!/usr/bin/env node

/**
 * Quick validation test for Node.js 18 upgrade milestone
 * Tests that the basic configuration changes work
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🎯 Node.js 18 Upgrade Milestone - Quick Validation\n');

// Test basic configuration
function validateConfiguration() {
    console.log('📋 Validating Configuration Changes...');

    // Check Dockerfile
    const dockerfile = fs.readFileSync(path.join(__dirname, 'Dockerfile'), 'utf8');
    if (dockerfile.includes('FROM node:18-alpine')) {
        console.log('   ✅ Dockerfile updated to Node.js 18');
    } else {
        console.log('   ❌ Dockerfile not updated to Node.js 18');
        return false;
    }

    // Check package.json
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    if (packageJson.engines && packageJson.engines.node === '>=18.0.0') {
        console.log('   ✅ Package.json engines field set to Node.js 18+');
    } else {
        console.log('   ❌ Package.json engines field not properly set');
        return false;
    }

    if (packageJson.scripts.start.includes('npx gulp')) {
        console.log('   ✅ Scripts updated to use npx gulp');
    } else {
        console.log('   ❌ Scripts not updated to use npx gulp');
        return false;
    }

    // Check .babelrc
    const babelrc = JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc'), 'utf8'));
    if (babelrc.presets[0][1].targets.node === '18') {
        console.log('   ✅ Babel configured for Node.js 18');
    } else {
        console.log('   ❌ Babel not configured for Node.js 18');
        return false;
    }

    return true;
}

// Test build process
function testBuild() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Testing Build Process...');

        exec('npm run build', { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                console.log('   ❌ Build failed');
                console.log('   Error:', error.message);
                reject(error);
            } else {
                console.log('   ✅ Build successful');

                // Check if build artifacts exist
                const binExists = fs.existsSync(path.join(__dirname, 'bin'));
                const serverExists = fs.existsSync(path.join(__dirname, 'bin/server'));
                const clientExists = fs.existsSync(path.join(__dirname, 'bin/client'));

                if (binExists && serverExists && clientExists) {
                    console.log('   ✅ Build artifacts created successfully');
                    resolve();
                } else {
                    console.log('   ❌ Build artifacts missing');
                    reject(new Error('Build artifacts missing'));
                }
            }
        });
    });
}

// Test Node.js version compatibility
function testNodeVersion() {
    console.log('\n📋 Testing Node.js Version Compatibility...');

    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    console.log(`   Current Node.js version: ${version}`);

    if (majorVersion >= 18) {
        console.log('   ✅ Node.js version is 18 or higher');
        return true;
    } else {
        console.log('   ❌ Node.js version is below 18');
        return false;
    }
}

// Main test function
async function runValidation() {
    console.log('Starting validation...\n');

    try {
        // Test 1: Configuration validation
        const configValid = validateConfiguration();
        if (!configValid) {
            throw new Error('Configuration validation failed');
        }

        // Test 2: Node.js version
        const nodeValid = testNodeVersion();
        if (!nodeValid) {
            throw new Error('Node.js version validation failed');
        }

        // Test 3: Build process
        await testBuild();

        console.log('\n🎉 MILESTONE ACHIEVED!');
        console.log('✅ Node.js 18 upgrade Phase 1.1 completed successfully');
        console.log('\nNext steps:');
        console.log('- Test application functionality');
        console.log('- Update dependencies for Node.js 18 compatibility');
        console.log('- Deploy to staging environment');

        process.exit(0);

    } catch (error) {
        console.log('\n💥 Validation failed:', error.message);
        process.exit(1);
    }
}

runValidation();
