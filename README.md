# intersight-postman

This repository helps Intersight operators learn how to use Postman for interacting with the Intersight API.  The `Intersight-Examples.postman_collection.json` contains a Postman collection which includes the following:

- Pre-request script at the collection level to handle authentication (v2 and v3 keys are supported)
- Example Requests organized by folders for different use cases

## Authentication

Authentication requires a Postman Envrionment configured and selected with the following two keys:

- **api-key:**     found in the Intersight Web interafce after a successful API Key creation
- **secret-key:**  the complete text of the SecretKet.txt file that is downloaded after a successful API Key creation


Several of the requests contain post-request tests to perform various activities

- Update the Postman console
- Set Environment variables
- Unset Environment variables
