const keyVault = require('azure-keyvault');
const msRestAzure = require('ms-rest-azure');
const utils = require('util');
const fs = require('fs');


async function fetchSecret(kvClient, vaultUrl, secName, secVersion) {
	return await kvClient.getSecret(vaultUrl, secName, secVersion, { }).then((resp) =>
		{
                    console.info("GOT SECRET:" + utils.inspect(resp));
                    return resp;
                }, err =>
                {
                    console.info(`Error while writing '${secName}'`);
		    throw err;
                }
            );
}	

async function fetchCertificate(kvClient, vaultUrl, certName, certVersion) {
        return await kvClient.getCertificate(vaultUrl, certName, certVersion, { }).then((resp) =>
                {
                    console.info("GOT CERT:" + utils.inspect(resp));
                    return resp;
                }, err =>
                {
                    console.info(`Error while writing '${certName}'`);
                    throw err;
                }
            );
}

async function writeJson(filePath, jsonData)
{
  let data = JSON.stringify(jsonData);
  fs.writeFileSync(filePath, data);
  console.log("Data saved to :" + filePath);
}

async function writeCert(filePath, certData)
{
  await fs.writeFileSync(filePath, certData);
  console.log("Data saved to :" + filePath);
}


async function fetchVaultValues() {
  let clientId=process.env.AZ_APP_ID;
  let clientSecret=process.env.AZ_APP_SECRET;
  let tenantId=process.env.AZ_TENANT;

  let vaultUrl="https://" + process.env.AZ_VAULT_NAME + ".vault.azure.net/"
  let secretsPath = process.env.AZ_SECRET_PATH;
	console.log("CID:" + clientId);

  let credentials = await msRestAzure.loginWithServicePrincipalSecret(clientId, clientSecret, tenantId);
  let kvClient = new keyVault.KeyVaultClient(credentials);
  let secretName= "mikes-password";
  let secretVersion= "88319362eb7849e9a56022d8ccaa9ade";

  let certName= "mikes-test-cert";
  let certVersion= "c1ce7ff070a24b44b8f026b67de22ff2";

  if (process.env.AZ_APP_SECRETS)
  {
      console.log("Fetching Secrets:" + process.env.AZ_APP_SECRETS);
      let tokens = process.env.AZ_APP_SECRETS.split(',');
      console.log(tokens);
      if (tokens)
      {
	  let secretData = [];
          for (let i =0;i< tokens.length;i++) {
            secretPair = tokens[i];
            console.log(secretPair);
            let appSecret = secretPair.split(':');
            console.log(appSecret);
            if (appSecret.length > 1)
            {
                console.log(appSecret[0]);
                let secret = await fetchSecret(kvClient, vaultUrl, appSecret[0],appSecret[1]);
                //console.log("SECRET VAL: " + utils.inspect(secret));
                console.log("SEC VAL:" + secret.value);
		secretData[i] = { "name" : appSecret[0] , "value" : secret.value };
            }
         }
	 console.log("Secrets:" + utils.inspect(secretData));
	 await writeJson(process.env.AZ_SECRET_PATH + process.env.AZ_VAULT_NAME + ".json",  secretData);
      }

  }

  if (process.env.AZ_APP_CERTS)
  {
      console.log("Fetching Certificates:" + process.env.AZ_APP_CERTS);
      let tokens = process.env.AZ_APP_CERTS.split(',');
      console.log(tokens);
      if (tokens)
      {
          let certData = [];
          for (let i =0;i< tokens.length;i++) {
            certPair = tokens[i];
            console.log(certPair);
            let appCert = certPair.split(':');
            console.log(appCert);
            if (appCert.length > 1)
            {
                console.log(appCert[0]);
                let cert = await fetchCertificate(kvClient, vaultUrl, appCert[0],appCert[1]);
                //console.log("SECRET VAL: " + utils.inspect(secret));
                console.log("CERT VAL:" + cert.cer.toString("base64") );
                //secretData[i] = { "name" : certSecret[0] , "value" : secret.value };
                await writeCert(process.env.AZ_SECRET_PATH + appCert[0] + ".cer",  cert.cer.toString("base64"));
	    }
         }
         //await writeJson(process.env.AZ_SECRET_PATH + process.env.AZ_VAULT_NAME + ".json",  secretData);
     //let secret = await fetchSecret(kvClient, vaultUrl, secretName,secretVersion);
     //console.log("SECRET VAL: " + utils.inspect(secret));
     }
  }
	
  //let certificate = await fetchCertificate(kvClient, vaultUrl, certName,certVersion);
  //console.log("CERT VAL: " + utils.inspect(certificate));

}

fetchVaultValues();

console.log("DONE");
