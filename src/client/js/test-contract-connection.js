// Test Script for Contract Connection
// Run this in browser console after loading the page

async function testContractConnection() {
    console.log('🧪 Testing Contract Connection (Mock Version)...');

    try {
        // Test 1: Check if contract connection is available
        if (typeof window.contractConnection === 'undefined') {
            throw new Error('Contract connection not available globally');
        }
        console.log('✅ Test 1: Contract connection is available');

        // Test 2: Check connection status
        const isConnected = window.contractConnection.isConnected;
        console.log('📊 Connection status:', isConnected);

        // Test 3: Try connecting (this will use mock connection)
        if (!isConnected) {
            console.log('🔗 Attempting to connect...');
            await window.contractConnection.connect('ws://localhost:9944');
        }

        // Test 4: Set a dummy contract address for testing
        const dummyAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
        console.log('🏷️ Setting dummy contract address for testing...');
        window.contractConnection.setContractAddress(dummyAddress);

        // Test 5: Test query functions (these will fail with real calls but should show proper error handling)
        console.log('🔍 Testing query functions...');

        try {
            const gameState = await window.contractConnection.getGameState();
            console.log('Game State:', gameState);
        } catch (error) {
            console.log('Expected error for getGameState (no real contract):', error.message);
        }

        try {
            const playerCount = await window.contractConnection.getPlayerCount();
            console.log('Player Count:', playerCount);
        } catch (error) {
            console.log('Expected error for getPlayerCount (no real contract):', error.message);
        }

        try {
            const prizePool = await window.contractConnection.getPrizePool();
            console.log('Prize Pool:', prizePool);
        } catch (error) {
            console.log('Expected error for getPrizePool (no real contract):', error.message);
        }

        // Test 6: Test utility functions
        console.log('🔧 Testing utility functions...');
        const dotAmount = window.contractConnection.formatBalanceToDOT('1000000000000'); // 1 DOT in planck
        const planckAmount = window.contractConnection.formatDOTToPlanck(1.5); // 1.5 DOT
        console.log('Format 1 DOT from planck:', dotAmount);
        console.log('Format 1.5 DOT to planck:', planckAmount);

                console.log('🎉 All contract connection tests completed!');
        console.log('💡 This is currently using MOCK mode. For real testing:');
        console.log('   1. Deploy the smart contract');
        console.log('   2. Fix CDN loading issues');
        console.log('   3. Switch back to real contract connection');
        console.log('   4. Set the real contract address: contractConnection.setContractAddress("REAL_ADDRESS")');

        return true;
    } catch (error) {
        console.error('❌ Contract connection test failed:', error);
        return false;
    }
}

// Instructions for manual testing
console.log(`
🧪 CONTRACT CONNECTION TEST INSTRUCTIONS:

BASIC TESTING:
1. Run: testContractConnection()        // Test connection and basic functions
2. Run: demoGameWorkflow()             // Full game workflow demo

AVAILABLE FUNCTIONS:
• contractConnection.connect()          // Connect to node
• contractConnection.setContractAddress() // Set contract address
• contractConnection.getGameState()     // Get current game state
• contractConnection.getPlayerCount()   // Get player count
• contractConnection.getPrizePool()     // Get prize pool
• contractConnection.startGame()        // Start new game (admin)
• contractConnection.deposit()          // Join game with deposit
• contractConnection.submitWinners()    // End game and distribute prizes

CURRENT STATUS: Using MOCK mode for testing
TO SWITCH TO REAL MODE: Fix CDN loading and change app.js import
`);

// Complete game demo workflow
async function demoGameWorkflow() {
    console.log('🎮 DEMO: Complete Game Workflow');
    console.log('='.repeat(50));

    try {
        const cc = window.contractConnection;

        // Step 1: Connect and set address
        console.log('📋 Step 1: Connect to contract');
        await cc.connect('ws://localhost:9944');
        cc.setContractAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

        // Step 2: Check initial state
        console.log('\n📋 Step 2: Check initial game state');
        const initialState = await cc.getGameState();
        const initialPlayers = await cc.getPlayerCount();
        const initialPrize = await cc.getPrizePool();

        // Step 3: Admin starts a game
        console.log('\n📋 Step 3: Admin starts a new game');
        const buyInAmount = cc.formatDOTToPlanck(1.0); // 1 DOT buy-in
        await cc.startGame(
            'mock-admin',
            buyInAmount,
            5, // 5 minutes registration
            2, // minimum 2 players
            10 // 10 minutes game duration
        );

        // Step 4: Check game state after starting
        console.log('\n📋 Step 4: Check game state after starting');
        const gameState = await cc.getGameState();

        // Step 5: Players join the game
        console.log('\n📋 Step 5: Players join the game');
        await cc.deposit('mock-player1', buyInAmount);
        await cc.deposit('mock-player2', buyInAmount);

        // Step 6: Check updated state
        console.log('\n📋 Step 6: Check state after players join');
        const playersAfterJoin = await cc.getPlayerCount();
        const prizeAfterJoin = await cc.getPrizePool();
        console.log('Prize pool in DOT:', cc.formatBalanceToDOT(prizeAfterJoin));

        // Step 7: Submit winners
        console.log('\n📋 Step 7: Game ends, submit winners');
        await cc.submitWinners(
            'mock-admin',
            ['player1-address', 'player2-address'],
            [70, 30], // 70% to winner, 30% to second place
            'LastPlayerStanding'
        );

        // Step 8: Check final state
        console.log('\n📋 Step 8: Check final state');
        const finalState = await cc.getGameState();
        const finalPlayers = await cc.getPlayerCount();
        const finalPrize = await cc.getPrizePool();

        console.log('\n🎉 Demo completed successfully!');
        console.log('This shows the complete buy-in game workflow');

    } catch (error) {
        console.error('❌ Demo failed:', error);
    }
}

// Make test functions available globally
window.testContractConnection = testContractConnection;
window.demoGameWorkflow = demoGameWorkflow;
