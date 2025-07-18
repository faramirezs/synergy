// Modern PAPI Service with H160 Support for Agario Buyin Smart Contract
// Using latest @polkadot-api/sdk-ink with createReviveSdk for H160 address support

import { createClient } from "polkadot-api"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat"
import { getWsProvider } from "polkadot-api/ws-provider/web"

// Modern PAPI client setup with H160 address support
class PAPIService {
  constructor() {
    this.client = null;
    this.typedApi = null;
    this.contractSdk = null;
    this.isConnected = false;
    this.wsUrl = "ws://localhost:9944"; // Default local substrate node
    this.connectionPromise = null;
  }

  async connect(wsUrl = "ws://localhost:9944") {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._doConnect(wsUrl);
    return this.connectionPromise;
  }

  async _doConnect(wsUrl) {
    try {
      console.log("🔗 Connecting to PAPI with modern SDK...");
      this.wsUrl = wsUrl;

      // Create modern PAPI client
      this.client = createClient(
        withPolkadotSdkCompat(getWsProvider(wsUrl))
      );

      console.log("✅ PAPI client created successfully");

      // For MVP, we'll create a basic typed API without descriptors
      // In production, you'd use generated descriptors from: npx papi generate
      this.typedApi = this.client.getTypedApi({
        // Basic chain descriptors - in production use generated ones
        System: {
          Number: {},
          Events: {}
        },
        Revive: {
          map_account: {}
        }
      });

      // For H160 contract support, we'll simulate ReviveSdk capabilities
      // In production: this.contractSdk = createReviveSdk(this.typedApi, contracts.agario_buyin);
      this.contractSdk = this.createMockContractSdk();

      this.isConnected = true;
      console.log("✅ PAPI connected successfully with H160 support");
      
      return true;
    } catch (error) {
      console.error("❌ Failed to connect PAPI:", error);
      this.connectionPromise = null;
      throw error;
    }
  }

  // Mock contract SDK for MVP demo (replace with real createReviveSdk in production)
  createMockContractSdk() {
    return {
      getContract: (address) => ({
        address,
        isCompatible: async () => true,
        query: async (method, params) => {
          console.log(`📞 Contract query: ${method}`, params);
          // Return mock data for demo
          return this.getMockQueryResult(method);
        },
        send: (method, params) => ({
          signAndSubmit: async (signer) => {
            console.log(`📝 Contract transaction: ${method}`, params, `by ${signer.name || 'Unknown'}`);
            return this.getMockTransactionResult(method);
          }
        }),
        filterEvents: (events) => {
          console.log("🔍 Filtering contract events:", events);
          return events.filter(e => e.type === 'contract');
        }
      }),
      addressIsMapped: async (address) => {
        console.log("🗺️ Checking if address is mapped:", address);
        return true; // Mock: assume all addresses are mapped
      }
    };
  }

  getMockQueryResult(method) {
    const mockData = {
      get_game_state: { success: true, value: { response: "Inactive" } },
      get_player_count: { success: true, value: { response: 0 } },
      get_prize_pool: { success: true, value: { response: 0 } },
      get_buy_in_amount: { success: true, value: { response: 0 } },
      get_min_players: { success: true, value: { response: 0 } },
      get_registration_time_remaining: { success: true, value: { response: 0 } },
      get_game_time_remaining: { success: true, value: { response: null } },
      get_registration_deadline: { success: true, value: { response: 0 } },
      get_game_duration: { success: true, value: { response: null } },
      get_game_start_time: { success: true, value: { response: 0 } },
      is_player_registered: { success: true, value: { response: false } },
      get_admin: { success: true, value: { response: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" } }
    };

    return mockData[method] || { success: false, value: "Method not found" };
  }

  getMockTransactionResult(method) {
    return {
      ok: true,
      block: { hash: "0x1234567890abcdef", number: 12345 },
      events: [
        {
          type: 'contract',
          name: method,
          data: { timestamp: Date.now() }
        }
      ]
    };
  }

  getContractSdk() {
    if (!this.contractSdk) {
      throw new Error("PAPI not connected. Call connect() first.");
    }
    return this.contractSdk;
  }

  getTypedApi() {
    if (!this.typedApi) {
      throw new Error("PAPI not connected. Call connect() first.");
    }
    return this.typedApi;
  }

  // Check if an account is mapped for H160 usage
  async isAccountMapped(accountAddress) {
    if (!this.contractSdk) {
      throw new Error("PAPI not connected.");
    }
    return await this.contractSdk.addressIsMapped(accountAddress);
  }

  // Map account for H160 usage (required before contract interaction)
  async mapAccount(signer) {
    if (!this.typedApi) {
      throw new Error("PAPI not connected.");
    }

    console.log(`🗺️ Mapping account ${signer.name || signer.address} for H160 usage...`);
    
    try {
      // In production: await this.typedApi.tx.Revive.map_account().signAndSubmit(signer);
      // For MVP demo: simulate success
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      console.log(`✅ Account ${signer.name || signer.address} mapped for H160 usage`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to map account: ${error.message}`);
      throw new Error(`Failed to map account: ${error.message}`);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      wsUrl: this.wsUrl,
      hasContractSdk: !!this.contractSdk,
      hasTypedApi: !!this.typedApi
    };
  }

  // Disconnect from the network
  async disconnect() {
    try {
      if (this.client) {
        // PAPI client cleanup would go here
        this.client = null;
      }
      
      this.typedApi = null;
      this.contractSdk = null;
      this.isConnected = false;
      this.connectionPromise = null;
      
      console.log("🔌 PAPI disconnected");
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  }
}

// Export singleton instance
export const papiService = new PAPIService();
export default PAPIService;
