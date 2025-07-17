import { walletService } from './wallet-service.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded in demo-integration.js');
    
    // Get wallet elements
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletInfoDiv = document.getElementById('wallet-info');
    const accountAddressSpan = document.getElementById('account-address');
    const accountBalanceSpan = document.getElementById('account-balance');
    
    // Make sure wallet button was found
    if (!connectWalletBtn) {
        console.error('Connect wallet button not found in the DOM!');
        return;
    }

    console.log('Setting up Connect Wallet button click handler...');
    
    // Add click handler to wallet button
    connectWalletBtn.addEventListener('click', async () => {
        console.log('Connect Wallet button clicked!');
        
        try {
            // Disable button while connecting
            connectWalletBtn.disabled = true;
            connectWalletBtn.textContent = 'Connecting...';
            
            console.log('Attempting to connect wallet via walletService.connect()...');
            const accounts = await walletService.connect();
            console.log('Wallet connected successfully!', accounts);
            
            const firstAccount = accounts[0];
            console.log('First account:', firstAccount);

            // Update UI with account info
            accountAddressSpan.textContent = firstAccount.address;
            const accountName = firstAccount.meta.name || 'Unnamed';
            accountBalanceSpan.textContent = accountName;

            // Show account info and hide button
            walletInfoDiv.style.display = 'block';
            connectWalletBtn.style.display = 'none';
            
            // Alert success (temporary for debugging)
            alert(`Wallet connected: ${accountName} (${firstAccount.address.slice(0, 10)}...)`);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet: ' + error.message);
            
            // Reset button state
            connectWalletBtn.disabled = false;
            connectWalletBtn.textContent = 'Connect Wallet';
        }
    });
    
    // Just log the button to confirm we have the right reference
    console.log('Button reference:', connectWalletBtn);
});
