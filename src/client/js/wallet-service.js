// We'll use dynamic imports for better compatibility
class WalletService {
    constructor() {
        this.accounts = [];
        this.polkadotModule = null;
        console.log('WalletService initialized');
    }

    // Load the Polkadot extension-dapp module dynamically
    async loadPolkadotModule() {
        try {
            console.log('Loading Polkadot extension-dapp module...');
            if (!this.polkadotModule) {
                this.polkadotModule = await import('https://cdn.jsdelivr.net/npm/@polkadot/extension-dapp@0.46.5/+esm');
                console.log('Polkadot module loaded successfully', Object.keys(this.polkadotModule));
            }
            return this.polkadotModule;
        } catch (error) {
            console.error('Failed to load Polkadot module:', error);
            throw new Error('Failed to load wallet integration: ' + error.message);
        }
    }

    async connect() {
        console.log('WalletService.connect() called');
        try {
            // Load the module first
            const module = await this.loadPolkadotModule();
            const { web3Enable, web3Accounts } = module;
            
            console.log('Enabling web3 extensions...');
            const extensions = await web3Enable('Synergy Game');
            console.log('Extensions:', extensions);
            
            if (extensions.length === 0) {
                console.error('No wallet extension found');
                alert('No wallet extension found. Please install Polkadot.js extension.');
                throw new Error('No wallet extension found.');
            }

            console.log('Getting web3 accounts...');
            this.accounts = await web3Accounts();
            console.log('Accounts retrieved:', this.accounts);
            
            if (this.accounts.length === 0) {
                console.error('No accounts found in the extension');
                alert('No accounts found. Please create an account in your Polkadot.js extension.');
                throw new Error('No accounts found.');
            }

            return this.accounts;
        } catch (error) {
            console.error('Error in WalletService.connect():', error);
            throw error;
        }
    }

    getAccounts() {
        return this.accounts;
    }

    getAccount(address) {
        return this.accounts.find(acc => acc.address === address);
    }
}

export const walletService = new WalletService();
