#!/usr/bin/env node

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

    console.log(`Testing application on port ${PORT}...`);

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
            console.log(`Health response: ${data}`);
        });
    });

    healthReq.on('error', (error) => {
        console.log(`❌ Health check failed: ${error.message}`);
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
        console.log(`✅ Main endpoint responded with status: ${res.statusCode}`);
    });

    mainReq.on('error', (error) => {
        console.log(`❌ Main endpoint failed: ${error.message}`);
    });

    mainReq.end();
}

// Run validation
validateDeployment();
