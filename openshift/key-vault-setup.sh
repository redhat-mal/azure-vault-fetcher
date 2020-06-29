
echo "Creaating service principal for $1"

role_data=$(az ad sp create-for-rbac --role Contributor --name $1)

#role_data=$(cat test.json)

app_id=$(echo $role_data | jq -r .appId)
secret_id=$(echo $role_data | jq -r .password)
tenant_id=$(echo $role_data | jq -r .tenant)

echo "APPID: $app_id"
if [ -z "$app_id" ]; then
    exit -1
fi

cat > /tmp/$app_id.properties << EOF
APP_ID=$app_id
AZ_APP_SECRET=$secret_id
AZ_TENANT=$tenant_id
EOF

oc create secret generic $1-vault-config --from-env-file=/tmp/$app_id.properties

rm /tmp/$app_id.properties

