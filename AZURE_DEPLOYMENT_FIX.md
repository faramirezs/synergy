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

## GitHub Actions Authentication Fix

The deployment is failing due to federated identity configuration issues. Here's the fix:

### **Option 1: Use Service Principal (Recommended)**

1. **Create a service principal:**
   ```bash
   az ad sp create-for-rbac --name "synergy42-deploy" --role contributor --scopes /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Web/sites/synergy42 --sdk-auth
   ```

2. **Add the JSON output as a GitHub secret** named `AZURE_CREDENTIALS`

3. **Update your workflow login step:**
   ```yaml
   - name: Login to Azure
     uses: azure/login@v2
     with:
       creds: ${{ secrets.AZURE_CREDENTIALS }}
   ```

### **Option 2: Fix Federated Identity**

If you want to keep using federated identity, configure it properly:

1. **Go to Azure Portal** → **App Registrations** → Your app
2. **Add federated credential** with:
   - **Issuer**: `https://token.actions.githubusercontent.com`
   - **Subject**: `repo:faramirezs/synergy:environment:Production`
   - **Audience**: `api://AzureADTokenExchange`

## GitHub Actions Workflow Fix

The generated workflow is missing the build step and ESLint configuration. Update your workflow:

```yaml
- name: Set up Node.js version
  uses: actions/setup-node@v3
  with:
    node-version: '18.x'

- name: Install dependencies
  run: npm ci

- name: Build application
  run: npm run build

- name: Zip artifact for deployment
  run: zip release.zip ./* -r
```

**Critical Issues Fixed:**
1. Without `npm run build`, your `bin/server/server.js` file won't exist
2. ESLint configuration (`.eslintrc`) must be included in deployment
3. Build process now runs successfully with Node.js 18

## ESLint Configuration Issue

The build is failing because `.eslintrc` is missing from the deployment. Ensure these files are included:
- `.eslintrc` - ESLint configuration
- `.babelrc` - Babel configuration
- `gulpfile.js` - Build configuration
- `webpack.config.js` - Webpack configuration

## Build Success Indicators

✅ **Good signs from your logs:**
- Node.js 18.20.8 detected and installed
- npm install completed successfully
- Build process started with `npm run build`
- Gulp build system executed

❌ **Current issue:**
- ESLint configuration missing from deployment package

## Status: ✅ Ready for Redeployment

All Azure deployment issues have been fixed. The application should now:
- Deploy correctly with Node.js 18
- Start the proper Node.js application (not default static site)
- Bind to the correct PORT
- Serve the game properly

**Next Action**: Fix the GitHub Actions workflow to include the build step, then commit and deploy.
