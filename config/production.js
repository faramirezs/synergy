module.exports = {
    ...require('../config'),
    // Production-specific overrides
    host: process.env.HOST || "0.0.0.0",
    port: process.env.PORT || 3000,
    
    // Enhanced security for production
    adminPass: process.env.ADMIN_PASS || "CHANGE_ME",
    
    // Performance optimizations
    networkUpdateFactor: 60, // Increased for better performance
    maxHeartbeatInterval: 3000, // Reduced for better responsiveness
    
    // Database optimizations
    sqlinfo: {
        fileName: process.env.DB_PATH || "db.sqlite3",
        // Add connection pooling if needed
    },
    
    // Node.js 18 specific optimizations
    nodeEnv: 'production',
    
    // Logging configuration
    logLevel: process.env.LOG_LEVEL || 'info',
    logpath: process.env.LOG_PATH || "logs/app.log",
};
