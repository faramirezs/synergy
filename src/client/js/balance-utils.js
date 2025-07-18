// Balance Utilities for Modern PAPI SDK Integration
// Handles DOT balance formatting and conversion between different units

export class BalanceUtils {
  constructor() {
    this.DOT_DECIMALS = 12; // DOT has 12 decimal places
    this.PLANCK_PER_DOT = Math.pow(10, this.DOT_DECIMALS);
  }

  // Convert planck (smallest unit) to DOT
  planckToDot(planckAmount) {
    if (!planckAmount || planckAmount === 0) return 0;
    return Number(planckAmount) / this.PLANCK_PER_DOT;
  }

  // Convert DOT to planck
  dotToPlanck(dotAmount) {
    if (!dotAmount || dotAmount === 0) return 0;
    return Math.floor(Number(dotAmount) * this.PLANCK_PER_DOT);
  }

  // Format balance for display
  formatBalance(balance, options = {}) {
    const {
      decimals = 4,
      showUnit = true,
      compact = false
    } = options;

    if (!balance || balance === 0) {
      return showUnit ? '0 DOT' : '0';
    }

    const dotAmount = this.planckToDot(balance);
    
    if (compact && dotAmount >= 1000000) {
      const millions = dotAmount / 1000000;
      return showUnit ? `${millions.toFixed(1)}M DOT` : `${millions.toFixed(1)}M`;
    } else if (compact && dotAmount >= 1000) {
      const thousands = dotAmount / 1000;
      return showUnit ? `${thousands.toFixed(1)}K DOT` : `${thousands.toFixed(1)}K`;
    }

    const formatted = dotAmount.toFixed(decimals);
    return showUnit ? `${formatted} DOT` : formatted;
  }

  // Format for input fields (returns planck as string)
  formatForInput(balance) {
    if (!balance || balance === 0) return '';
    return balance.toString();
  }

  // Parse input value to planck
  parseInput(inputValue, unit = 'DOT') {
    if (!inputValue || inputValue.trim() === '') return 0;
    
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return 0;

    if (unit === 'DOT') {
      return this.dotToPlanck(numValue);
    } else {
      // Assume planck
      return Math.floor(numValue);
    }
  }

  // Validate balance input
  validateBalanceInput(inputValue, unit = 'DOT') {
    if (!inputValue || inputValue.trim() === '') {
      return { valid: false, error: 'Amount is required' };
    }

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      return { valid: false, error: 'Invalid number format' };
    }

    if (numValue <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (unit === 'DOT' && numValue > 1000000000) {
      return { valid: false, error: 'Amount too large' };
    }

    return { valid: true, value: this.parseInput(inputValue, unit) };
  }

  // Get common buy-in amounts for UI
  getCommonBuyInAmounts() {
    return [
      { label: '0.001 DOT', value: this.dotToPlanck(0.001) },
      { label: '0.01 DOT', value: this.dotToPlanck(0.01) },
      { label: '0.1 DOT', value: this.dotToPlanck(0.1) },
      { label: '1 DOT', value: this.dotToPlanck(1) },
      { label: '10 DOT', value: this.dotToPlanck(10) },
      { label: '100 DOT', value: this.dotToPlanck(100) }
    ];
  }

  // Format timestamp to human readable
  formatTimestamp(timestamp) {
    if (!timestamp || timestamp === 0) return 'N/A';
    
    try {
      const date = new Date(Number(timestamp));
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  }

  // Format duration in milliseconds to human readable
  formatDuration(milliseconds) {
    if (!milliseconds || milliseconds <= 0) return 'Expired';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Format countdown timer (MM:SS format)
  formatCountdown(milliseconds) {
    if (!milliseconds || milliseconds <= 0) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Calculate percentage for winner distribution
  calculateWinnerPercentages(winners) {
    if (!winners || winners.length === 0) return [];
    
    // Common distribution patterns
    const patterns = {
      1: [100],
      2: [60, 40],
      3: [50, 30, 20],
      4: [40, 30, 20, 10],
      5: [35, 25, 20, 15, 5]
    };
    
    return patterns[winners.length] || this.equalDistribution(winners.length);
  }

  // Equal distribution among winners
  equalDistribution(count) {
    if (count <= 0) return [];
    
    const percentage = Math.floor(100 / count);
    const remainder = 100 - (percentage * count);
    
    const distribution = new Array(count).fill(percentage);
    
    // Add remainder to first winner
    if (remainder > 0) {
      distribution[0] += remainder;
    }
    
    return distribution;
  }

  // Validate percentage distribution
  validatePercentages(percentages) {
    if (!Array.isArray(percentages) || percentages.length === 0) {
      return { valid: false, error: 'No percentages provided' };
    }

    const total = percentages.reduce((sum, p) => sum + (Number(p) || 0), 0);
    
    if (total > 100) {
      return { valid: false, error: 'Total percentage exceeds 100%' };
    }

    if (total <= 0) {
      return { valid: false, error: 'Total percentage must be greater than 0%' };
    }

    const hasInvalid = percentages.some(p => {
      const num = Number(p);
      return isNaN(num) || num < 0 || num > 100;
    });

    if (hasInvalid) {
      return { valid: false, error: 'Invalid percentage values (must be 0-100)' };
    }

    return { valid: true, total };
  }

  // Get formatted prize distribution
  getFormattedPrizeDistribution(prizePool, percentages) {
    if (!prizePool || !percentages || percentages.length === 0) {
      return [];
    }

    return percentages.map((percentage, index) => {
      const prizeAmount = Math.floor((prizePool * percentage) / 100);
      return {
        position: index + 1,
        percentage,
        amount: prizeAmount,
        formatted: this.formatBalance(prizeAmount)
      };
    });
  }
}

// Export singleton instance
export const balanceUtils = new BalanceUtils();
export default BalanceUtils;
