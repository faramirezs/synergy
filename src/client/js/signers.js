// Local Signers Setup for H160 Addresses
// Modern approach using @polkadot-api/substrate-bindings for reliable demo

import { Sr25519Account } from "@polkadot-api/substrate-bindings"

// Create local test signers for demo with H160 support
export const createLocalSigners = () => {
  // Pre-funded development accounts for reliable demo
  const AliceSigner = Sr25519Account.fromUri("//Alice");
  const BobSigner = Sr25519Account.fromUri("//Bob");
  const CharlieSigner = Sr25519Account.fromUri("//Charlie");
  const DaveSigner = Sr25519Account.fromUri("//Dave");
  const EveSigner = Sr25519Account.fromUri("//Eve");

  // Add names for better UX
  Object.defineProperty(AliceSigner, 'name', { value: 'Alice', writable: false });
  Object.defineProperty(BobSigner, 'name', { value: 'Bob', writable: false });
  Object.defineProperty(CharlieSigner, 'name', { value: 'Charlie', writable: false });
  Object.defineProperty(DaveSigner, 'name', { value: 'Dave', writable: false });
  Object.defineProperty(EveSigner, 'name', { value: 'Eve', writable: false });

  return {
    AliceSigner,
    BobSigner,
    CharlieSigner,
    DaveSigner,
    EveSigner,

    // Helper to get signer by name
    getSigner: (name) => {
      const signers = {
        Alice: AliceSigner,
        Bob: BobSigner,
        Charlie: CharlieSigner,
        Dave: DaveSigner,
        Eve: EveSigner
      };
      return signers[name];
    },

    // Get all available accounts with H160 information
    getAllAccounts: () => [
      { name: "Alice", signer: AliceSigner, address: AliceSigner.address, role: "Admin", balance: "1,000,000 DOT" },
      { name: "Bob", signer: BobSigner, address: BobSigner.address, role: "Player", balance: "100,000 DOT" },
      { name: "Charlie", signer: CharlieSigner, address: CharlieSigner.address, role: "Player", balance: "100,000 DOT" },
      { name: "Dave", signer: DaveSigner, address: DaveSigner.address, role: "Player", balance: "100,000 DOT" },
      { name: "Eve", signer: EveSigner, address: EveSigner.address, role: "Player", balance: "100,000 DOT" }
    ],

    // Auto-map accounts for H160 usage
    async ensureAccountsMapped(papiService) {
      const accounts = this.getAllAccounts();
      console.log("🗺️ Ensuring all accounts are mapped for H160 usage...");
      
      const mappingPromises = accounts.map(async (account) => {
        try {
          const isMapped = await papiService.isAccountMapped(account.address);
          if (!isMapped) {
            console.log(`🗺️ Mapping account ${account.name} for H160 usage...`);
            await papiService.mapAccount(account.signer);
            console.log(`✅ Account ${account.name} mapped successfully`);
          } else {
            console.log(`✅ Account ${account.name} already mapped`);
          }
          return { name: account.name, mapped: true };
        } catch (error) {
          console.error(`❌ Failed to map account ${account.name}:`, error);
          return { name: account.name, mapped: false, error };
        }
      });

      const results = await Promise.all(mappingPromises);
      console.log("🗺️ Account mapping results:", results);
      return results;
    },

    // Get signer info for display
    getSignerInfo: (name) => {
      const signer = this.getSigner(name);
      const account = this.getAllAccounts().find(a => a.name === name);
      
      if (!signer || !account) return null;
      
      return {
        name: account.name,
        address: account.address,
        role: account.role,
        balance: account.balance,
        signer: signer
      };
    }
  };
};

// Export singleton instance for easy import
export const localSigners = createLocalSigners();
