#!/bin/bash

# GitHub Secret Setup Script for Azure Deployment

echo "Setting up GitHub Secrets for Azure Deployment..."
echo "============================================="

# The publish profile content from your synergy42.PublishSettings file
PUBLISH_PROFILE_CONTENT='<publishData><publishProfile profileName="synergy42 - Web Deploy" publishMethod="MSDeploy" publishUrl="synergy42-akfhbrcfaub5fwat.scm.northeurope-01.azurewebsites.net:443" msdeploySite="synergy42" userName="$synergy42" userPWD="gCcNfaWLSCRCMPjScmbtzlgH14Qz3m2C6vGmb8v7LkyiirJ8ExtahajGwlF6" destinationAppUrl="http://synergy42-akfhbrcfaub5fwat.northeurope-01.azurewebsites.net" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="https://portal.azure.com" webSystem="WebSites"><databases /></publishProfile><publishProfile profileName="synergy42 - FTP" publishMethod="FTP" publishUrl="ftps://waws-prod-db3-341.ftp.azurewebsites.windows.net/site/wwwroot" ftpPassiveMode="True" userName="synergy42\$synergy42" userPWD="gCcNfaWLSCRCMPjScmbtzlgH14Qz3m2C6vGmb8v7LkyiirJ8ExtahajGwlF6" destinationAppUrl="http://synergy42-akfhbrcfaub5fwat.northeurope-01.azurewebsites.net" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="https://portal.azure.com" webSystem="WebSites"><databases /></publishProfile><publishProfile profileName="synergy42 - Zip Deploy" publishMethod="ZipDeploy" publishUrl="synergy42-akfhbrcfaub5fwat.scm.northeurope-01.azurewebsites.net:443" userName="$synergy42" userPWD="gCcNfaWLSCRCMPjScmbtzlgH14Qz3m2C6vGmb8v7LkyiirJ8ExtahajGwlF6" destinationAppUrl="http://synergy42-akfhbrcfaub5fwat.northeurope-01.azurewebsites.net" SQLServerDBConnectionString="" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="https://portal.azure.com" webSystem="WebSites"><databases /></publishProfile></publishData>'

echo "To set up the GitHub secret, follow these steps:"
echo ""
echo "1. Go to your GitHub repository: https://github.com/faramirezs/synergy"
echo "2. Go to Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret'"
echo "4. Name: AZUREAPPSERVICE_PUBLISHPROFILE_SYNERGY42"
echo "5. Value: Copy the entire publish profile content below"
echo ""
echo "===== PUBLISH PROFILE CONTENT (copy this) ====="
echo "$PUBLISH_PROFILE_CONTENT"
echo "================================================="
echo ""
echo "After setting up the secret, you can deploy by pushing to the master branch."
echo ""
echo "The workflow will now:"
echo "✅ Include hidden files like .eslintrc in the deployment package"
echo "✅ Use the correct publish profile for authentication"
echo "✅ Deploy to your Azure Web App: synergy42-akfhbrcfaub5fwat.northeurope-01.azurewebsites.net"
