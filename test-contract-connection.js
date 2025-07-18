// Test Script for Contract Connection
// Run this in browser console after loading the page

async function testContractConnection() {
    console.log('🧪 Testing Contract Connection...');

    try {
        // Test 1: Check if contract connection is available
        if (typeof window.contractConnection === 'undefined') {
            throw new Error('Contract connection not available globally');
        }
        console.log('✅ Test 1: Contract connection is available');

        // Test 2: Check connection status
        const isConnected = window.contractConnection.isConnected;
        console.log('📊 Connection status:', isConnected);

        // Test 3: Try connecting (should already be connected)
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
        console.log('💡 Next steps:');
        console.log('   1. Deploy the smart contract');
        console.log('   2. Set the real contract address: contractConnection.setContractAddress("REAL_ADDRESS")');
        console.log('   3. Test real contract interactions');

        return true;
    } catch (error) {
        console.error('❌ Contract connection test failed:', error);
        return false;
    }
}

// Instructions for manual testing
console.log(`
🧪 CONTRACT CONNECTION TEST INSTRUCTIONS:

1. Open browser console
2. Run: testContractConnection()
3. Check for successful connection to Polkadot node
4. Verify all functions are working

For real contract testing:
1. Make sure Polkadot node is running on ws://localhost:9944
2. Deploy the agario_buyin contract
3. Set contract address: contractConnection.setContractAddress("YOUR_CONTRACT_ADDRESS")
4. Test real queries: contractConnection.getGameState()
`);

// Make test function available globally
window.testContractConnection = testContractConnection;
