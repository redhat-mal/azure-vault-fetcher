
echo "Creaating service principal for $1 and vault $2"

role_data=$(az ad sp create-for-rbac --role Contributor --name $1)

#role_data=$(cat test.json)
echo "ROLE DATA: $role_data"
app_id=$(echo $role_data | jq -r .appId)
secret_id=$(echo $role_data | jq -r .password)
tenant_id=$(echo $role_data | jq -r .tenant)

echo "APPID: $app_id"
if [ -z "$app_id" ]; then
    exit -1
fi
echo "SECID: $secret_id"
echo "TENID: $tenant_id"


cat > /tmp/$app_id.properties << EOF
AZ_APP_ID=$app_id
AZ_APP_SECRET=$secret_id
AZ_TENANT=$tenant_id
EOF

az keyvault set-policy -n $2 --spn $app_id --secret-permissions get list  
az keyvault set-policy -n $2 --spn $app_id --certificate-permissions get list

oc create secret generic azure-vault-config --from-env-file=/tmp/$app_id.properties

rm /tmp/$app_id.properties

