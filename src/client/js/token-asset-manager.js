/**
 * Token Asset Manager
 * Handles loading and rendering of token assets for players
 */

class TokenAssetManager {
    constructor() {
        this.tokens = new Map();
        this.loadedTokens = new Set();
        this.defaultTokenSize = 64; // Default token size in pixels
        this.tokenTypes = [
            'coin',
            'gem',
            'diamond',
            'star',
            'heart',
            'shield',
            'crown',
            'ring',
            'custom'
        ];
        this.loadDefaultTokens();
    }

    // Load default token assets
    loadDefaultTokens() {
        this.tokenTypes.forEach(type => {
            if (type === 'custom') {
                // Try to load your custom PNG first, fallback to generated token
                this.loadToken(type, '/img/tokens/custom.png');
            } else {
                // Create fallback tokens immediately since we don't have image files
                this.createFallbackToken(type);
            }
        });
    }

    // Load a token asset from URL
    loadToken(tokenId, imageUrl) {
        const img = new Image();
        img.onload = () => {
            this.tokens.set(tokenId, img);
            this.loadedTokens.add(tokenId);
            console.log(`[TOKEN] Loaded token: ${tokenId}`);
        };
        img.onerror = () => {
            console.warn(`[TOKEN] Failed to load token: ${tokenId}, using fallback`);
            this.createFallbackToken(tokenId);
        };
        img.src = imageUrl;
    }

    // Create a fallback token using canvas
    createFallbackToken(tokenId) {
        const canvas = document.createElement('canvas');
        canvas.width = this.defaultTokenSize;
        canvas.height = this.defaultTokenSize;
        const ctx = canvas.getContext('2d');
        
        // Draw a simple circular token with border
        const centerX = this.defaultTokenSize / 2;
        const centerY = this.defaultTokenSize / 2;
        const radius = this.defaultTokenSize / 2 - 4;
        
        // Create gradient background
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, this.getTokenInnerColor(tokenId));
        gradient.addColorStop(1, this.getTokenColor(tokenId));
        
        // Draw main circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = this.getTokenBorderColor(tokenId);
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add inner shine effect
        ctx.beginPath();
        ctx.arc(centerX - 8, centerY - 8, radius / 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        // Add token symbol based on type
        this.drawTokenSymbol(ctx, tokenId, centerX, centerY);
        
        // Convert canvas to image
        const img = new Image();
        img.src = canvas.toDataURL();
        this.tokens.set(tokenId, img);
        this.loadedTokens.add(tokenId);
        console.log(`[TOKEN] Created fallback token: ${tokenId}`);
    }

    // Draw token symbol
    drawTokenSymbol(ctx, tokenId, centerX, centerY) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const symbols = {
            'coin': '$',
            'gem': '♦',
            'diamond': '◆',
            'star': '★',
            'heart': '♥',
            'shield': '⚔',
            'crown': '♔',
            'ring': '○',
            'custom': '🎨'
        };
        
        const symbol = symbols[tokenId] || tokenId.charAt(0).toUpperCase();
        ctx.strokeText(symbol, centerX, centerY);
        ctx.fillText(symbol, centerX, centerY);
    }

    // Get token color based on type
    getTokenColor(tokenId) {
        const colors = {
            'coin': '#FFD700',
            'gem': '#9932CC',
            'diamond': '#87CEEB',
            'star': '#FFD700',
            'heart': '#FF69B4',
            'shield': '#4169E1',
            'crown': '#FFD700',
            'ring': '#C0C0C0',
            'custom': '#FF6B6B'
        };
        return colors[tokenId] || '#FFD700';
    }

    // Get token border color
    getTokenBorderColor(tokenId) {
        const colors = {
            'coin': '#B8860B',
            'gem': '#4B0082',
            'diamond': '#4682B4',
            'star': '#B8860B',
            'heart': '#C71585',
            'shield': '#191970',
            'crown': '#B8860B',
            'ring': '#808080',
            'custom': '#E55555'
        };
        return colors[tokenId] || '#B8860B';
    }

    // Get token inner color
    getTokenInnerColor(tokenId) {
        const colors = {
            'coin': '#FFF8DC',
            'gem': '#DA70D6',
            'diamond': '#E0FFFF',
            'star': '#FFF8DC',
            'heart': '#FFB6C1',
            'shield': '#6495ED',
            'crown': '#FFF8DC',
            'ring': '#D3D3D3',
            'custom': '#FFE5E5'
        };
        return colors[tokenId] || '#FFF8DC';
    }

    // Get token by ID
    getToken(tokenId) {
        return this.tokens.get(tokenId);
    }

    // Check if token is loaded
    isTokenLoaded(tokenId) {
        return this.loadedTokens.has(tokenId);
    }

    // Get random token type
    getRandomTokenType() {
        return this.tokenTypes[Math.floor(Math.random() * this.tokenTypes.length)];
    }

    // Draw token on canvas
    drawToken(ctx, tokenId, x, y, size, rotation = 0) {
        const token = this.getToken(tokenId);
        if (!token) {
            console.warn(`[TOKEN] Token not found: ${tokenId}`);
            return false;
        }

        ctx.save();
        
        // Apply rotation if specified
        if (rotation !== 0) {
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.translate(-x, -y);
        }

        // Draw token centered
        const drawSize = size || this.defaultTokenSize;
        ctx.drawImage(token, x - drawSize/2, y - drawSize/2, drawSize, drawSize);
        
        ctx.restore();
        return true;
    }

    // Draw token with glow effect
    drawTokenWithGlow(ctx, tokenId, x, y, size, glowColor = '#FFD700') {
        const token = this.getToken(tokenId);
        if (!token) return false;

        ctx.save();
        
        // Draw glow effect
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        const drawSize = size || this.defaultTokenSize;
        ctx.drawImage(token, x - drawSize/2, y - drawSize/2, drawSize, drawSize);
        
        ctx.restore();
        return true;
    }

    // Draw token with scale animation
    drawTokenWithScale(ctx, tokenId, x, y, size, scale = 1.0) {
        const token = this.getToken(tokenId);
        if (!token) return false;

        ctx.save();
        
        const drawSize = (size || this.defaultTokenSize) * scale;
        ctx.drawImage(token, x - drawSize/2, y - drawSize/2, drawSize, drawSize);
        
        ctx.restore();
        return true;
    }
}

// Global token manager instance
window.tokenAssetManager = new TokenAssetManager();

module.exports = TokenAssetManager;
