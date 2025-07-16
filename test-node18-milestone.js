#!/usr/bin/env node

/**
 * Test script for Node.js 18 upgrade milestone
 * Tests basic functionality after Node.js 18 upgrade
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');

console.log('🚀 Starting Node.js 18 Upgrade Milestone Tests...\n');

// Test 1: Verify Node.js version
function testNodeVersion() {
    return new Promise((resolve, reject) => {
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

        console.log(`📋 Test 1: Node.js Version Check`);
        console.log(`   Current version: ${nodeVersion}`);

        if (majorVersion >= 18) {
            console.log(`   ✅ PASS: Node.js ${majorVersion} is >= 18`);
            resolve();
        } else {
            console.log(`   ❌ FAIL: Node.js ${majorVersion} is < 18`);
            reject(new Error(`Node.js version ${nodeVersion} is less than 18`));
        }
    });
}

// Test 2: Check if package.json has engines field
function testPackageJsonEngines() {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 Test 2: Package.json Engines Field`);

        try {
            const packagePath = path.join(__dirname, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            if (packageJson.engines && packageJson.engines.node) {
                console.log(`   Engine requirement: ${packageJson.engines.node}`);
                console.log(`   ✅ PASS: Engines field exists`);
                resolve();
            } else {
                console.log(`   ❌ FAIL: No engines field in package.json`);
                reject(new Error('Missing engines field in package.json'));
            }
        } catch (error) {
            console.log(`   ❌ FAIL: Error reading package.json: ${error.message}`);
            reject(error);
        }
    });
}

// Test 3: Check if scripts use npx
function testNpxScripts() {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 Test 3: NPX Scripts Check`);

        try {
            const packagePath = path.join(__dirname, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            const scripts = packageJson.scripts;
            const hasNpxStart = scripts.start && scripts.start.includes('npx gulp');
            const hasNpxBuild = scripts.build && scripts.build.includes('npx gulp');

            console.log(`   Start script: ${scripts.start}`);
            console.log(`   Build script: ${scripts.build}`);

            if (hasNpxStart && hasNpxBuild) {
                console.log(`   ✅ PASS: Scripts use npx gulp`);
                resolve();
            } else {
                console.log(`   ❌ FAIL: Scripts don't use npx gulp`);
                reject(new Error('Scripts should use npx gulp'));
            }
        } catch (error) {
            console.log(`   ❌ FAIL: Error checking scripts: ${error.message}`);
            reject(error);
        }
    });
}

// Test 4: Test Docker build (if Docker is available)
function testDockerBuild() {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 Test 4: Docker Build Test`);

        exec('docker --version', (error) => {
            if (error) {
                console.log(`   ⚠️  SKIP: Docker not available`);
                resolve();
                return;
            }

            console.log(`   Building Docker image...`);
            exec('docker build -t synergy-node18-test .', { timeout: 120000 }, (error, stdout, stderr) => {
                if (error) {
                    console.log(`   ❌ FAIL: Docker build failed`);
                    console.log(`   Error: ${error.message}`);
                    reject(error);
                } else {
                    console.log(`   ✅ PASS: Docker build successful`);
                    resolve();
                }
            });
        });
    });
}

// Test 5: Test npm install
function testNpmInstall() {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 Test 5: NPM Install Test`);

        exec('npm install', { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                console.log(`   ❌ FAIL: npm install failed`);
                console.log(`   Error: ${error.message}`);
                reject(error);
            } else {
                console.log(`   ✅ PASS: npm install successful`);
                resolve();
            }
        });
    });
}

// Test 6: Test build process
function testBuildProcess() {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 Test 6: Build Process Test`);

        exec('npm run build', { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                console.log(`   ❌ FAIL: Build process failed`);
                console.log(`   Error: ${error.message}`);
                console.log(`   Stderr: ${stderr}`);
                reject(error);
            } else {
                console.log(`   ✅ PASS: Build process successful`);
                resolve();
            }
        });
    });
}

// Test 7: Test server start (quick test)
function testServerStart() {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 Test 7: Server Start Test`);

        const serverProcess = exec('npm start', { timeout: 30000 });
        let serverStarted = false;

        serverProcess.stdout.on('data', (data) => {
            console.log(`   Server output: ${data.toString().trim()}`);
            if (data.toString().includes('Listening on')) {
                serverStarted = true;
                console.log(`   ✅ PASS: Server started successfully`);
                serverProcess.kill();
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.log(`   Server error: ${data.toString().trim()}`);
        });

        serverProcess.on('close', (code) => {
            if (!serverStarted) {
                console.log(`   ❌ FAIL: Server failed to start (exit code: ${code})`);
                reject(new Error(`Server failed to start`));
            }
        });

        setTimeout(() => {
            if (!serverStarted) {
                console.log(`   ❌ FAIL: Server start timeout`);
                serverProcess.kill();
                reject(new Error('Server start timeout'));
            }
        }, 25000);
    });
}

// Run all tests
async function runTests() {
    const tests = [
        testNodeVersion,
        testPackageJsonEngines,
        testNpxScripts,
        testNpmInstall,
        testBuildProcess,
        testDockerBuild,
        testServerStart
    ];

    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const test of tests) {
        try {
            await test();
            passed++;
        } catch (error) {
            failed++;
            console.log(`   Error details: ${error.message}`);
        }
    }

    console.log(`\n📊 Test Results:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);

    if (failed === 0) {
        console.log(`\n🎉 All tests passed! Node.js 18 upgrade milestone achieved!`);
        process.exit(0);
    } else {
        console.log(`\n💥 Some tests failed. Please check the issues above.`);
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error(`\n💥 Test runner error: ${error.message}`);
    process.exit(1);
});
