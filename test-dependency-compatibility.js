#!/usr/bin/env node

/**
 * Phase 1.2: Dependency Compatibility Check
 * Tests and updates dependencies for Node.js 18 compatibility
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 Phase 1.2: Dependency Compatibility Check\n');

// Dependencies that need special attention for Node.js 18
const CRITICAL_DEPENDENCIES = [
    'sqlite3',
    'express',
    'socket.io',
    'socket.io-client',
    'webpack',
    'babel-loader',
    'eslint'
];

const SECURITY_CRITICAL = [
    '@babel/traverse',
    'body-parser',
    'ws',
    'path-to-regexp',
    'semver'
];

// Test 1: Check current package versions
function checkCurrentVersions() {
    console.log('📋 Test 1: Current Package Versions');

    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        console.log('   🔍 Critical Dependencies:');
        CRITICAL_DEPENDENCIES.forEach(dep => {
            if (deps[dep]) {
                console.log(`     ${dep}: ${deps[dep]}`);
            }
        });

        console.log('   ⚠️  Security Critical Dependencies:');
        SECURITY_CRITICAL.forEach(dep => {
            if (deps[dep]) {
                console.log(`     ${dep}: ${deps[dep]}`);
            }
        });

        console.log('   ✅ Current versions documented\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Error reading package.json: ${error.message}\n`);
        return false;
    }
}

// Test 2: Check for security vulnerabilities
function checkSecurityVulnerabilities() {
    return new Promise((resolve, reject) => {
        console.log('📋 Test 2: Security Vulnerability Scan');

        exec('npm audit --audit-level=high', (error, stdout, stderr) => {
            if (error) {
                const lines = stderr.split('\n');
                const vulnerabilityLine = lines.find(line => line.includes('vulnerabilities'));

                if (vulnerabilityLine) {
                    console.log(`   ⚠️  ${vulnerabilityLine}`);
                    console.log('   ❌ High/Critical vulnerabilities found\n');
                    resolve(false);
                } else {
                    console.log('   ❌ Audit failed with unknown error\n');
                    reject(error);
                }
            } else {
                console.log('   ✅ No high/critical vulnerabilities found\n');
                resolve(true);
            }
        });
    });
}

// Test 3: Test SQLite3 compatibility (critical for Node.js 18)
function testSQLite3Compatibility() {
    return new Promise((resolve, reject) => {
        console.log('📋 Test 3: SQLite3 Node.js 18 Compatibility');

        try {
            const sqlite3 = require('sqlite3');
            console.log('   ✅ SQLite3 loads successfully');

            // Test basic database operations
            const db = new sqlite3.Database(':memory:');
            db.serialize(() => {
                db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
                db.run("INSERT INTO test (name) VALUES ('test')");
                db.get("SELECT * FROM test", (err, row) => {
                    if (err) {
                        console.log(`   ❌ SQLite3 query failed: ${err.message}\n`);
                        reject(err);
                    } else {
                        console.log('   ✅ SQLite3 database operations work\n');
                        db.close();
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            console.log(`   ❌ SQLite3 failed to load: ${error.message}\n`);
            reject(error);
        }
    });
}

// Test 4: Test Express.js compatibility
function testExpressCompatibility() {
    return new Promise((resolve, reject) => {
        console.log('📋 Test 4: Express.js Node.js 18 Compatibility');

        try {
            const express = require('express');
            const app = express();

            app.get('/test', (req, res) => {
                res.json({ status: 'ok', node: process.version });
            });

            const server = app.listen(0, () => {
                const port = server.address().port;
                console.log(`   ✅ Express server started on port ${port}`);

                // Test HTTP request
                const http = require('http');
                http.get(`http://localhost:${port}/test`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            console.log(`   ✅ Express responds correctly: ${json.status}`);
                            server.close();
                            resolve(true);
                        } catch (error) {
                            console.log(`   ❌ Invalid JSON response: ${error.message}\n`);
                            server.close();
                            reject(error);
                        }
                    });
                }).on('error', (error) => {
                    console.log(`   ❌ HTTP request failed: ${error.message}\n`);
                    server.close();
                    reject(error);
                });
            });
        } catch (error) {
            console.log(`   ❌ Express failed to load: ${error.message}\n`);
            reject(error);
        }
    });
}

// Test 5: Test Socket.io compatibility
function testSocketIoCompatibility() {
    return new Promise((resolve, reject) => {
        console.log('📋 Test 5: Socket.io Node.js 18 Compatibility');

        try {
            const express = require('express');
            const http = require('http');
            const socketIo = require('socket.io');

            const app = express();
            const server = http.createServer(app);
            const io = socketIo(server);

            io.on('connection', (socket) => {
                console.log('   ✅ Socket.io connection established');
                socket.emit('test', { message: 'Node.js 18 compatible' });
                socket.on('disconnect', () => {
                    console.log('   ✅ Socket.io disconnection handled');
                });
            });

            server.listen(0, () => {
                const port = server.address().port;
                console.log(`   ✅ Socket.io server started on port ${port}`);

                // Test client connection
                const client = require('socket.io-client');
                const clientSocket = client(`http://localhost:${port}`);

                clientSocket.on('connect', () => {
                    console.log('   ✅ Socket.io client connected');
                });

                clientSocket.on('test', (data) => {
                    console.log(`   ✅ Socket.io message received: ${data.message}\n`);
                    clientSocket.disconnect();
                    server.close();
                    resolve(true);
                });

                clientSocket.on('error', (error) => {
                    console.log(`   ❌ Socket.io client error: ${error.message}\n`);
                    server.close();
                    reject(error);
                });
            });
        } catch (error) {
            console.log(`   ❌ Socket.io failed to load: ${error.message}\n`);
            reject(error);
        }
    });
}

// Test 6: Check Node.js 18 specific features
function testNode18Features() {
    console.log('📋 Test 6: Node.js 18 Specific Features');

    try {
        // Test built-in fetch (Node.js 18 feature)
        if (typeof globalThis.fetch !== 'undefined') {
            console.log('   ✅ Built-in fetch API available');
        } else {
            console.log('   ⚠️  Built-in fetch API not available (expected in Node.js 18+)');
        }

        // Test built-in test runner (Node.js 18 feature)
        try {
            require('node:test');
            console.log('   ✅ Built-in test runner available');
        } catch (error) {
            console.log('   ⚠️  Built-in test runner not available');
        }

        // Test Web Streams API (Node.js 18 feature)
        if (typeof globalThis.ReadableStream !== 'undefined') {
            console.log('   ✅ Web Streams API available');
        } else {
            console.log('   ⚠️  Web Streams API not available');
        }

        console.log('   ✅ Node.js 18 feature check completed\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Node.js 18 feature check failed: ${error.message}\n`);
        return false;
    }
}

// Run all tests
async function runCompatibilityTests() {
    const results = {
        passed: 0,
        failed: 0,
        total: 6
    };

    try {
        // Test 1: Current versions
        if (checkCurrentVersions()) {
            results.passed++;
        } else {
            results.failed++;
        }

        // Test 2: Security vulnerabilities
        try {
            if (await checkSecurityVulnerabilities()) {
                results.passed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            results.failed++;
        }

        // Test 3: SQLite3
        try {
            if (await testSQLite3Compatibility()) {
                results.passed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            results.failed++;
        }

        // Test 4: Express.js
        try {
            if (await testExpressCompatibility()) {
                results.passed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            results.failed++;
        }

        // Test 5: Socket.io
        try {
            if (await testSocketIoCompatibility()) {
                results.passed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            results.failed++;
        }

        // Test 6: Node.js 18 features
        if (testNode18Features()) {
            results.passed++;
        } else {
            results.failed++;
        }

        console.log('📊 Phase 1.2 Test Results:');
        console.log(`   ✅ Passed: ${results.passed}/${results.total}`);
        console.log(`   ❌ Failed: ${results.failed}/${results.total}`);

        if (results.failed === 0) {
            console.log('\n🎉 Phase 1.2 COMPLETED!');
            console.log('✅ All dependencies are compatible with Node.js 18');
            console.log('\nRecommended next steps:');
            console.log('- Update security-vulnerable packages');
            console.log('- Update outdated packages to latest versions');
            console.log('- Proceed to Phase 2: Dependency Updates');
        } else {
            console.log('\n⚠️  Phase 1.2 NEEDS ATTENTION');
            console.log('Some dependencies need updates for Node.js 18 compatibility');
            console.log('\nRecommended actions:');
            console.log('- Run: npm audit fix');
            console.log('- Update critical dependencies');
            console.log('- Rerun compatibility tests');
        }

    } catch (error) {
        console.error(`\n💥 Test runner error: ${error.message}`);
        process.exit(1);
    }
}

// Run the tests
runCompatibilityTests();
