#!/usr/bin/env node

/**
 * Integration test for Node.js 18 upgrade
 * Tests that the complete application works end-to-end
 */

const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

console.log('🚀 Node.js 18 Integration Test\n');

let serverProcess;
let testResults = {
    passed: 0,
    failed: 0,
    total: 4
};

function cleanup() {
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
        console.log('   🧹 Server process terminated');
    }
}

// Test 1: Server starts successfully
function testServerStart() {
    return new Promise((resolve, reject) => {
        console.log('📋 Test 1: Server Startup');

        serverProcess = spawn('npm', ['start'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });

        let serverReady = false;

        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Listening on')) {
                serverReady = true;
                console.log('   ✅ Server started successfully');
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.log('   Server stderr:', data.toString().trim());
        });

        serverProcess.on('close', (code) => {
            if (!serverReady) {
                console.log(`   ❌ Server failed to start (exit code: ${code})`);
                reject(new Error(`Server failed to start`));
            }
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            if (!serverReady) {
                console.log('   ❌ Server startup timeout');
                reject(new Error('Server startup timeout'));
            }
        }, 30000);
    });
}

// Test 2: HTTP endpoint responds
function testHttpEndpoint() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Test 2: HTTP Endpoint');

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 200) {
                console.log('   ✅ HTTP endpoint responds with 200');
                resolve();
            } else {
                console.log(`   ❌ HTTP endpoint returned ${res.statusCode}`);
                reject(new Error(`HTTP endpoint returned ${res.statusCode}`));
            }
        });

        req.on('error', (error) => {
            console.log(`   ❌ HTTP request failed: ${error.message}`);
            reject(error);
        });

        req.setTimeout(5000, () => {
            console.log('   ❌ HTTP request timeout');
            reject(new Error('HTTP request timeout'));
        });

        req.end();
    });
}

// Test 3: WebSocket connection works
function testWebSocketConnection() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Test 3: WebSocket Connection');

        try {
            const ws = new WebSocket('ws://localhost:3000/socket.io/?EIO=4&transport=websocket');

            ws.on('open', () => {
                console.log('   ✅ WebSocket connection established');
                ws.close();
                resolve();
            });

            ws.on('error', (error) => {
                console.log(`   ❌ WebSocket connection failed: ${error.message}`);
                reject(error);
            });

            ws.on('close', () => {
                console.log('   ✅ WebSocket connection closed gracefully');
            });

            setTimeout(() => {
                console.log('   ❌ WebSocket connection timeout');
                ws.close();
                reject(new Error('WebSocket connection timeout'));
            }, 5000);
        } catch (error) {
            console.log(`   ❌ WebSocket test failed: ${error.message}`);
            reject(error);
        }
    });
}

// Test 4: Node.js 18 features in runtime
function testNode18Runtime() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Test 4: Node.js 18 Runtime Features');

        try {
            // Check if fetch is available
            if (typeof globalThis.fetch === 'function') {
                console.log('   ✅ Built-in fetch API available');
            } else {
                console.log('   ⚠️  Built-in fetch API not available');
            }

            // Check Node.js version
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

            if (majorVersion >= 18) {
                console.log(`   ✅ Node.js ${majorVersion} runtime confirmed`);
            } else {
                console.log(`   ❌ Node.js ${majorVersion} is below 18`);
                reject(new Error('Node.js version is below 18'));
                return;
            }

            // Check if running in production-like environment
            const isProduction = process.env.NODE_ENV === 'production';
            console.log(`   ✅ Environment: ${isProduction ? 'production' : 'development'}`);

            resolve();
        } catch (error) {
            console.log(`   ❌ Runtime test failed: ${error.message}`);
            reject(error);
        }
    });
}

// Run all tests
async function runIntegrationTests() {
    console.log('Starting Node.js 18 integration tests...\n');

    try {
        // Test 1: Server startup
        await testServerStart();
        testResults.passed++;

        // Wait a bit for server to fully initialize
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test 2: HTTP endpoint
        await testHttpEndpoint();
        testResults.passed++;

        // Test 3: WebSocket
        await testWebSocketConnection();
        testResults.passed++;

        // Test 4: Runtime features
        await testNode18Runtime();
        testResults.passed++;

    } catch (error) {
        testResults.failed++;
        console.log(`\n   Error: ${error.message}`);
    } finally {
        cleanup();
    }

    console.log('\n📊 Integration Test Results:');
    console.log(`   ✅ Passed: ${testResults.passed}/${testResults.total}`);
    console.log(`   ❌ Failed: ${testResults.failed}/${testResults.total}`);

    if (testResults.failed === 0) {
        console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
        console.log('✅ Node.js 18 upgrade is successful and ready for production');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some integration tests failed');
        console.log('Review the errors above and fix any issues');
        process.exit(1);
    }
}

// Handle cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

runIntegrationTests();
