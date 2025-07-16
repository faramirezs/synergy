# Azure App Service Deployment Guide - Node.js 18

## Quick Fix Summary

Based on the Azure logs showing ".NET Core" instead of Node.js, the following fixes have been applied:

### ✅ **Issue**: Azure serving default static site instead of Node.js app
**Fix**: Updated `package.json` with proper `main` field and `start` script

### ✅ **Issue**: Missing Node.js routing configuration  
**Fix**: Created `web.config` with iisnode handler for proper Node.js routing

### ✅ **Issue**: Build process not running during deployment
**Fix**: Added `.deployment` file to enable Oryx build during deployment

### ✅ **Issue**: Application not binding to Azure's PORT
**Fix**: Verified server.js properly handles `process.env.PORT`

## Files Created/Updated

1. **`package.json`** - Added `main` field and Azure-specific scripts
2. **`web.config`** - Configured iisnode for Node.js routing
3. **`.deployment`** - Enabled build during deployment
4. **`startup.sh`** - Startup script for Azure App Service
5. **`app.json`** - Updated Azure configuration
6. **`manifest.yml`** - Node.js 18 buildpack configuration
7. **`azure-validation.js`** - Deployment validation script

## Deployment Commands

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix Azure App Service deployment for Node.js 18"
git push origin main
```

### 2. Redeploy to Azure App Service
```bash
# Using Azure CLI
az webapp restart --name synergy42 --resource-group <your-resource-group>

# Or trigger a new deployment
az webapp deployment source sync --name synergy42 --resource-group <your-resource-group>
```

### 3. Monitor Deployment Logs
```bash
# Real-time log streaming
az webapp log tail --name synergy42 --resource-group <your-resource-group>

# Or check deployment status
az webapp deployment list --name synergy42 --resource-group <your-resource-group>
```

## Expected Deployment Behavior

After the fixes, you should see:

1. **Build Process**: Azure will run `npm install` and `npm run build`
2. **Node.js Startup**: Application will start with `node bin/server/server.js`
3. **Port Binding**: App will bind to Azure's PORT environment variable
4. **Health Check**: `/health` endpoint will be accessible

## Troubleshooting

### If still seeing ".NET Core" logs:
1. Check that `web.config` is properly configured
2. Verify `package.json` has correct `main` field
3. Ensure `.deployment` file exists and is committed

### If build fails:
1. Check that all dependencies are listed in `package.json`
2. Verify `npm run build` works locally
3. Check Azure build logs for specific errors

### If app doesn't start:
1. Verify `bin/server/server.js` exists after build
2. Check that server.js handles `process.env.PORT`
3. Review Azure application logs for startup errors

## Key Configuration Changes

### package.json
```json
{
  "main": "bin/server/server.js",
  "scripts": {
    "start": "node bin/server/server.js",
    "azure:build": "npm run build",
    "azure:start": "NODE_ENV=production node bin/server/server.js"
  }
}
```

### web.config
```xml
<handlers>
  <add name="iisnode" path="bin/server/server.js" verb="*" modules="iisnode"/>
</handlers>
```

### .deployment
```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
ENABLE_ORYX_BUILD=true
```

## Validation Steps

After deployment, test:

1. **Main endpoint**: `https://synergy42.azurewebsites.net/`
2. **Health check**: `https://synergy42.azurewebsites.net/health`
3. **WebSocket**: Test game functionality

## Status: ✅ Ready for Redeployment

All Azure deployment issues have been fixed. The application should now:
- Deploy correctly with Node.js 18
- Start the proper Node.js application (not default static site)
- Bind to the correct PORT
- Serve the game properly

**Next Action**: Commit changes and redeploy to Azure App Service.
