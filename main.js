const axios = require('axios');
const dotenv = require('dotenv').config();

// Environment variables
const WPENGINE_PASSWORD = process.env.WPENGINE_PASSWORD;
const WPENGINE_USER_ID = process.env.WPENGINE_USER_ID;

// user value
const userPrimaryDomain = 'www.airdoctorinc.com';

// Authorization token
const authorization = "Basic " + Buffer.from(WPENGINE_USER_ID + ":" + WPENGINE_PASSWORD).toString('base64')

// Function to get installation data.
async function getInstallations() {
    try {
       const response = await axios.get('https://api.wpengineapi.com/v1/installs',{
        headers: {
            'Authorization': authorization,
        },
       });
       return response.data.results;
    } catch (error) {
        throw new Error(`Error fetching installations data: ${error.message}`);
    }
}

// Function to find id based on primary domain
function findIdByPrimaryDomain(installations, userPrimaryDomain) {
    const matchingResult = installations.find(result => result.primary_domain === userPrimaryDomain);
    return matchingResult ? matchingResult.id : null;
}


// Function to trigger backups
async function triggerBackup(installationId) {
    try {
        const backupBody = {
            description: "Automatic backup creation",
            notification_emails: [
                "samrakshak@ciwebgroup.com"
              ]
        };
        const response = await axios.post(`https://api.wpengineapi.com/v1/installs/${installationId}/backups`, backupBody,{
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/json',
            },
        });
       // handle response
       if (response.status === 202) {
         return response.data.id;
       }else {
        throw new Error(`Backup request failed with status ${response.status}`);
       }

    } catch (error) {
        throw new Error(`Error triggering backup: ${error.message}`);
    }
}


// check the backup status
async function backupStatus(installationId,backupId) {
   try {
      const response = await axios.get(`https://api.wpengineapi.com/v1/installs/${installationId}/backups/${backupId}`,{
        headers: {
            'Authorization': authorization,
        }
      });
      return response.data
   } catch (error) {
    throw new Error(`Error fetching installations data: ${error.message}`);
   }
}


// Main function to execute the logic
async function main(){
    try {
        const installations = await getInstallations();

        const installationId = findIdByPrimaryDomain(installations, userPrimaryDomain)
        // console.log(triggerBackup(installationId))
        console.log(installationId)
        const backupId = await triggerBackup(installationId)
        const backupResult = await backupStatus(installationId,backupId)
        console.log(backupResult)

    } catch (error) {
        console.error(error.message);
    }
}

// call main function 
main()