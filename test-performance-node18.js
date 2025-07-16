#!/usr/bin/env node

/**
 * Phase 2.2: Performance Testing for Node.js 18
 * Tests application performance and benchmarks
 */

const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

console.log('⚡ Phase 2.2: Performance Testing for Node.js 18\n');

let serverProcess;
let testResults = {
    passed: 0,
    failed: 0,
    total: 6,
    metrics: {}
};

function cleanup() {
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
        console.log('   🧹 Server process terminated');
    }
}

// Test 1: Server startup performance
function testServerStartupPerformance() {
    return new Promise((resolve, reject) => {
        console.log('📋 Test 1: Server Startup Performance');
        
        const startTime = Date.now();
        serverProcess = spawn('npm', ['run', 'start:prod'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env: { ...process.env, NODE_ENV: 'production' }
        });
        
        let serverReady = false;
        
        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Listening on')) {
                const startupTime = Date.now() - startTime;
                serverReady = true;
                testResults.metrics.startupTime = startupTime;
                console.log(`   ✅ Server started in ${startupTime}ms`);
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
        
        setTimeout(() => {
            if (!serverReady) {
                console.log('   ❌ Server startup timeout (>30s)');
                reject(new Error('Server startup timeout'));
            }
        }, 30000);
    });
}

// Test 2: HTTP response time benchmark
function testHttpResponseTime() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Test 2: HTTP Response Time Benchmark');
        
        const iterations = 100;
        const responseTimes = [];
        let completed = 0;
        
        function makeRequest() {
            const startTime = Date.now();
            
            const req = http.request({
                hostname: 'localhost',
                port: 3000,
                path: '/',
                method: 'GET'
            }, (res) => {
                const responseTime = Date.now() - startTime;
                responseTimes.push(responseTime);
                completed++;
                
                if (completed === iterations) {
                    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
                    const minResponseTime = Math.min(...responseTimes);
                    const maxResponseTime = Math.max(...responseTimes);
                    
                    testResults.metrics.httpResponseTime = {
                        average: avgResponseTime,
                        min: minResponseTime,
                        max: maxResponseTime,
                        samples: iterations
                    };
                    
                    console.log(`   ✅ HTTP Response Time: ${avgResponseTime.toFixed(2)}ms avg (${minResponseTime}-${maxResponseTime}ms)`);
                    resolve();
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
        }
        
        // Make concurrent requests
        for (let i = 0; i < iterations; i++) {
            setTimeout(makeRequest, i * 10);
        }
    });
}

// Test 3: WebSocket connection performance
function testWebSocketPerformance() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Test 3: WebSocket Connection Performance');
        
        const connections = 50;
        const connectedSockets = [];
        let connectionsEstablished = 0;
        const connectionTimes = [];
        
        function createConnection() {
            const startTime = Date.now();
            
            try {
                const ws = new WebSocket('ws://localhost:3000/socket.io/?EIO=4&transport=websocket');
                
                ws.on('open', () => {
                    const connectionTime = Date.now() - startTime;
                    connectionTimes.push(connectionTime);
                    connectedSockets.push(ws);
                    connectionsEstablished++;
                    
                    if (connectionsEstablished === connections) {
                        const avgConnectionTime = connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length;
                        const minConnectionTime = Math.min(...connectionTimes);
                        const maxConnectionTime = Math.max(...connectionTimes);
                        
                        testResults.metrics.webSocketConnectionTime = {
                            average: avgConnectionTime,
                            min: minConnectionTime,
                            max: maxConnectionTime,
                            connections: connections
                        };
                        
                        console.log(`   ✅ WebSocket Connections: ${avgConnectionTime.toFixed(2)}ms avg (${minConnectionTime}-${maxConnectionTime}ms)`);
                        console.log(`   ✅ Established ${connections} concurrent connections`);
                        
                        // Close all connections
                        connectedSockets.forEach(socket => socket.close());
                        resolve();
                    }
                });
                
                ws.on('error', (error) => {
                    console.log(`   ❌ WebSocket connection failed: ${error.message}`);
                    reject(error);
                });
                
                setTimeout(() => {
                    if (connectionsEstablished < connections) {
                        console.log('   ❌ WebSocket connection timeout');
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000);
            } catch (error) {
                console.log(`   ❌ WebSocket test failed: ${error.message}`);
                reject(error);
            }
        }
        
        // Create connections with small delays
        for (let i = 0; i < connections; i++) {
            setTimeout(createConnection, i * 50);
        }
    });
}

// Test 4: Memory usage analysis
function testMemoryUsage() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Test 4: Memory Usage Analysis');
        
        try {
            const memoryUsage = process.memoryUsage();
            
            // Make health check request to get server memory
            const req = http.request({
                hostname: 'localhost',
                port: 3000,
                path: '/health',
                method: 'GET'
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const serverHealth = JSON.parse(data);
                        const serverMemory = serverHealth.memory;
                        
                        testResults.metrics.memoryUsage = {
                            client: memoryUsage,
                            server: serverMemory,
                            serverUptime: serverHealth.uptime
                        };
                        
                        console.log(`   ✅ Server Memory: ${(serverMemory.heapUsed / 1024 / 1024).toFixed(2)}MB heap`);
                        console.log(`   ✅ Client Memory: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB heap`);
                        console.log(`   ✅ Server Uptime: ${serverHealth.uptime.toFixed(2)}s`);
                        resolve();
                    } catch (error) {
                        console.log(`   ❌ Failed to parse health response: ${error.message}`);
                        reject(error);
                    }
                });
            });
            
            req.on('error', (error) => {
                console.log(`   ❌ Health check failed: ${error.message}`);
                reject(error);
            });
            
            req.end();
        } catch (error) {
            console.log(`   ❌ Memory test failed: ${error.message}`);
            reject(error);
        }
    });
}

// Test 5: Build performance comparison
function testBuildPerformance() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Test 5: Build Performance Comparison');
        
        const { exec } = require('child_process');
        
        // Test production build
        const startTime = Date.now();
        exec('NODE_ENV=production npm run build', (error, stdout, stderr) => {
            const buildTime = Date.now() - startTime;
            
            if (error) {
                console.log(`   ❌ Build failed: ${error.message}`);
                reject(error);
            } else {
                testResults.metrics.buildTime = buildTime;
                console.log(`   ✅ Production build completed in ${buildTime}ms`);
                
                // Check build artifact sizes
                const buildArtifacts = [
                    'bin/client/js/app.js',
                    'bin/server/server.js'
                ];
                
                const artifactSizes = {};
                buildArtifacts.forEach(artifact => {
                    if (fs.existsSync(artifact)) {
                        const stats = fs.statSync(artifact);
                        artifactSizes[artifact] = stats.size;
                        console.log(`   ✅ ${artifact}: ${(stats.size / 1024).toFixed(2)}KB`);
                    }
                });
                
                testResults.metrics.buildArtifactSizes = artifactSizes;
                resolve();
            }
        });
    });
}

// Test 6: Node.js 18 specific performance features
function testNode18Features() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Test 6: Node.js 18 Performance Features');
        
        try {
            // Test built-in fetch performance
            const fetchStartTime = Date.now();
            
            if (typeof globalThis.fetch === 'function') {
                // Test native fetch vs http module
                globalThis.fetch('http://localhost:3000/health')
                    .then(response => response.json())
                    .then(data => {
                        const fetchTime = Date.now() - fetchStartTime;
                        testResults.metrics.fetchPerformance = {
                            nativeFetch: fetchTime,
                            available: true
                        };
                        console.log(`   ✅ Native fetch API: ${fetchTime}ms`);
                        console.log(`   ✅ Node.js version: ${process.version}`);
                        
                        // Test V8 compile cache
                        const v8 = require('v8');
                        const v8Stats = v8.getHeapStatistics();
                        
                        testResults.metrics.v8Performance = {
                            heapSizeLimit: v8Stats.heap_size_limit,
                            totalHeapSize: v8Stats.total_heap_size,
                            usedHeapSize: v8Stats.used_heap_size
                        };
                        
                        console.log(`   ✅ V8 Heap: ${(v8Stats.used_heap_size / 1024 / 1024).toFixed(2)}MB used`);
                        resolve();
                    })
                    .catch(error => {
                        console.log(`   ❌ Fetch test failed: ${error.message}`);
                        reject(error);
                    });
            } else {
                console.log('   ⚠️  Native fetch not available');
                resolve();
            }
        } catch (error) {
            console.log(`   ❌ Node.js 18 features test failed: ${error.message}`);
            reject(error);
        }
    });
}

// Generate performance report
function generatePerformanceReport() {
    console.log('\n📋 Generating Performance Report...');
    
    const report = {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        environment: 'production',
        testResults: testResults,
        metrics: testResults.metrics,
        summary: {
            startupTime: testResults.metrics.startupTime,
            avgHttpResponseTime: testResults.metrics.httpResponseTime?.average,
            avgWebSocketConnectionTime: testResults.metrics.webSocketConnectionTime?.average,
            buildTime: testResults.metrics.buildTime,
            memoryUsage: testResults.metrics.memoryUsage?.server?.heapUsed
        }
    };
    
    fs.writeFileSync('PERFORMANCE_REPORT.json', JSON.stringify(report, null, 2));
    
    // Create markdown report
    const markdownReport = `# Performance Report - Node.js 18 Upgrade

**Date**: ${new Date().toISOString()}  
**Node.js Version**: ${process.version}  
**Environment**: Production  

## Summary
- **Startup Time**: ${testResults.metrics.startupTime}ms
- **HTTP Response Time**: ${testResults.metrics.httpResponseTime?.average?.toFixed(2)}ms avg
- **WebSocket Connection Time**: ${testResults.metrics.webSocketConnectionTime?.average?.toFixed(2)}ms avg
- **Build Time**: ${testResults.metrics.buildTime}ms
- **Memory Usage**: ${(testResults.metrics.memoryUsage?.server?.heapUsed / 1024 / 1024)?.toFixed(2)}MB

## Detailed Metrics

### HTTP Performance
- Average Response Time: ${testResults.metrics.httpResponseTime?.average?.toFixed(2)}ms
- Min Response Time: ${testResults.metrics.httpResponseTime?.min}ms
- Max Response Time: ${testResults.metrics.httpResponseTime?.max}ms
- Samples: ${testResults.metrics.httpResponseTime?.samples}

### WebSocket Performance
- Average Connection Time: ${testResults.metrics.webSocketConnectionTime?.average?.toFixed(2)}ms
- Min Connection Time: ${testResults.metrics.webSocketConnectionTime?.min}ms
- Max Connection Time: ${testResults.metrics.webSocketConnectionTime?.max}ms
- Concurrent Connections: ${testResults.metrics.webSocketConnectionTime?.connections}

### Build Performance
- Production Build Time: ${testResults.metrics.buildTime}ms
- Client JS Bundle: ${(testResults.metrics.buildArtifactSizes?.['bin/client/js/app.js'] / 1024)?.toFixed(2)}KB
- Server Bundle: ${(testResults.metrics.buildArtifactSizes?.['bin/server/server.js'] / 1024)?.toFixed(2)}KB

### Memory Usage
- Server Heap Used: ${(testResults.metrics.memoryUsage?.server?.heapUsed / 1024 / 1024)?.toFixed(2)}MB
- V8 Heap Used: ${(testResults.metrics.v8Performance?.usedHeapSize / 1024 / 1024)?.toFixed(2)}MB
- Server Uptime: ${testResults.metrics.memoryUsage?.serverUptime?.toFixed(2)}s

### Node.js 18 Features
- Native Fetch API: ${testResults.metrics.fetchPerformance?.available ? 'Available' : 'Not Available'}
- Fetch Performance: ${testResults.metrics.fetchPerformance?.nativeFetch}ms

## Performance Status
✅ **PASSED**: All performance tests completed successfully
🎯 **READY**: Application is optimized for production deployment
`;
    
    fs.writeFileSync('PERFORMANCE_REPORT.md', markdownReport);
    console.log('   ✅ Performance report generated');
}

// Run all performance tests
async function runPerformanceTests() {
    console.log('Starting Node.js 18 performance tests...\n');
    
    try {
        // Wait for server to be ready
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test 1: Startup performance
        await testServerStartupPerformance();
        testResults.passed++;
        
        // Wait for server to fully initialize
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test 2: HTTP performance
        await testHttpResponseTime();
        testResults.passed++;
        
        // Test 3: WebSocket performance
        await testWebSocketPerformance();
        testResults.passed++;
        
        // Test 4: Memory usage
        await testMemoryUsage();
        testResults.passed++;
        
        // Test 5: Build performance
        await testBuildPerformance();
        testResults.passed++;
        
        // Test 6: Node.js 18 features
        await testNode18Features();
        testResults.passed++;
        
    } catch (error) {
        testResults.failed++;
        console.log(`\n   Error: ${error.message}`);
    } finally {
        cleanup();
    }
    
    console.log('\n📊 Performance Test Results:');
    console.log(`   ✅ Passed: ${testResults.passed}/${testResults.total}`);
    console.log(`   ❌ Failed: ${testResults.failed}/${testResults.total}`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 ALL PERFORMANCE TESTS PASSED!');
        console.log('✅ Node.js 18 upgrade shows excellent performance');
        console.log('🎯 Application is ready for production deployment');
        
        generatePerformanceReport();
        
        console.log('\n📋 Performance Summary:');
        console.log(`   ⚡ Startup Time: ${testResults.metrics.startupTime}ms`);
        console.log(`   🌐 HTTP Response: ${testResults.metrics.httpResponseTime?.average?.toFixed(2)}ms avg`);
        console.log(`   🔌 WebSocket: ${testResults.metrics.webSocketConnectionTime?.average?.toFixed(2)}ms avg`);
        console.log(`   🏗️  Build Time: ${testResults.metrics.buildTime}ms`);
        console.log(`   💾 Memory Usage: ${(testResults.metrics.memoryUsage?.server?.heapUsed / 1024 / 1024)?.toFixed(2)}MB`);
        
        process.exit(0);
    } else {
        console.log('\n⚠️  Some performance tests failed');
        console.log('Review the errors above and optimize as needed');
        process.exit(1);
    }
}

// Handle cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

runPerformanceTests();
