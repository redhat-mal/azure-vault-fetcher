# Azure Key Vault Init Container to obtain secrets and Certifcates

Create Fether image:

oc new-build registry.access.redhat.com/ubi8/nodejs-12~https://github.com/redhat-mal/azure-vault-fetcher.git --name=vault-fetcher

oc 
