# intersight-postman

This repository helps Intersight operators learn how to use Postman for interacting with the Intersight API.  The `Intersight-Examples.postman_collection.json` contains a Postman collection which includes the following:

- Pre-request script at the collection level to handle authentication (only v2 keys are currently supported)
- Example Requests organized by folders for different use cases

## Authentication

Authentication requires a Postman Envrionment configured and selected with the following two keys:

- **api-key:**     found in the Intersight Web interafce after a successful API Key creation
- **secret-key:**  the complete text of the SecretKet.txt file that is downloaded after a successful API Key creation


Several of the requests contain post-request tests to perform various activities

- Update the Postman console
- Set Environment variables
- Unset Environment variables

### Using a v3 API Key

In order to use a v3 API key with this collection you'll need to import the collection json as described previously and then replace the pre-request script at the collection level with the contents of `v3_pre_request_script.js`.

One caveat to using the v3 script is the encyrption library looks for specific patterns in private key type declarations and `EC Private Key` is not one of the supported patterns.  To workaround this issue simply change `-----BEGIN EC PRIVATE KEY-----` to `-----BEGIN PRIVATE KEY-----` and `-----END EC PRIVATE KEY-----` to `-----END PRIVATE KEY-----` within your private key stored in your environment variable.