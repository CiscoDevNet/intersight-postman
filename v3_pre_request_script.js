function doHttpSig() {

    var navigator = {}; //fake a navigator object for the lib
    var window    = {}; //fake a window object for the lib
    
    eval(pm.collectionVariables.get("jsrsasign-js")); //import javascript jsrsasign
    
    
    function computeHttpSignature(config, headerHash) {
      console.log("inside computeHttpSignature");
      var template = 'keyId="${keyId}",algorithm="${algorithm}",headers="${headers}",signature="${signature}"',
          sig = template;
    
      // compute sig here
      var signingBase = '';
      config.headers.forEach(function(h){
        if (signingBase !== '') { signingBase += '\n'; }
        signingBase += h.toLowerCase() + ": " + headerHash[h];
      });
  
      var kjursig = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
      kjursig.init(config.secretkey);
      kjursig.updateString(signingBase);
      var hash = kjursig.sign();
      console.log(hash);
    
      var signatureOptions = {
            keyId : config.keyId,
            algorithm: config.algorithm,
            headers: config.headers,
            signature : hextob64(hash)
          };
    
      // build sig string here
      Object.keys(signatureOptions).forEach(function(key) {
        var pattern = "${" + key + "}",
            value = (typeof signatureOptions[key] != 'string') ? signatureOptions[key].join(' ') : signatureOptions[key];
        sig = sig.replace(pattern, value);
      });
      return sig;
    }

    // Resolve all the Postman variables that are part of the request or URI
    let sdk = require('postman-collection');
    let newRequest = new sdk.Request(pm.request.toJSON());
    let resolvedRequest = newRequest.toObjectResolved(
        null, [pm.variables.toObject()], { ignoreOwnVariables: true }
        );
    
    console.log("Resolved Request:");
    console.log(resolvedRequest);
    
    var body = "";
    if (
        request.method.toLowerCase() == "get" ||
        request.method.toLowerCase() == "delete" ) {
        body="";
    } else {
        body=resolvedRequest.body.raw;
    }

    var computedDigest = 'SHA-256=' + CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(body));
    console.log("computedDigest:");
    console.log(computedDigest);
    
    var curDate = new Date().toGMTString();
    var targetUrl = "/" + resolvedRequest.url.path.join("/");
    var host = resolvedRequest.url.host.join(".");
    
    // Process Query String
    console.log("Query String:");
    var queryString  = "";
    var paramCount = 0;
    pm.request.url.query.all().forEach( (param) => {
        // Append each URL encoded parameter to the targetUrl
        // However unencode Commas (,), Colons (:), Dollar Signs (:)
        // and Forward Slashes (/)
        if (!param.disabled) {
            if (paramCount > 0) {
                queryString += '&';
            }
            paramCount++;
            // Append each URL encoded parameter to the targetUrl unencode 
            // 24 $ Dollar Sign
            // 28 ( Left Parenthesis 
            // 29 ) Right Parenthesis
            // 2B + Plus Sign
            // 2C , Comma
            // 2F / Forward Slash
            // 3A : Colon
            // 3D = Equals Sign
            // 40 @ At Sign
            //

            // Replace any variables within params with COLLECTION variable
            let paramValue = param.value;
            let replaceVars = paramValue.match(/\{\{[\w\-]+\}\}/g);
            if(replaceVars) {
                replaceVars.forEach(replaceVar => {
                    paramValue = paramValue.replace(replaceVar, pm.collectionVariables.get(replaceVar.replace('{{', '').replace('}}', '')));
                })
            }
            
            queryString += (
                param.key + "=" +
                encodeURIComponent(paramValue).
                replace(/['()=]/g, escape).
                replace(/%(?:24|28|29|2B|2C|2F|3A|3D|40)/g, unescape)
            );
        }
    });
    console.log(queryString);
    // console.log(pm.collectionVariables.get(''))
    
    if (queryString.length > 0) {
        queryStringTmp = queryString.replace("%25","%")
        targetUrl += "?" + queryStringTmp;
        console.log("Target Url: " + targetUrl );
    }
    
    var headerHash = {
          date : curDate,
          digest : computedDigest,
          host : host,
          '(request-target)' : request.method.toLowerCase() + ' ' + targetUrl
        };
    
    console.log(headerHash);
    
    var configHash = {
          algorithm : 'hs2019',
          keyId : environment['api-key'],
          secretkey : environment['secret-key'],
          headers : [ '(request-target)', 'date', 'digest', 'host' ]
        };
    var sig = computeHttpSignature(configHash, headerHash);
    console.log(sig);
    pm.collectionVariables.set('httpsig', sig);
    pm.collectionVariables.set('computed-digest', computedDigest);
    pm.collectionVariables.set("current-date", curDate);
    pm.collectionVariables.set("target-url", targetUrl);
    pm.request.headers.add({
        key: 'Accept',
        value: 'application/json'
    });
    pm.request.headers.add({
        key: 'Accept',
        value: 'application/json'
    });
    pm.request.headers.add({
        key: 'Authorization',
        value: `Signature ${sig}`
    });
    pm.request.headers.add({
        key: 'Digest',
        value: computedDigest
    });
    pm.request.headers.add({
        key: 'Date',
        value: curDate
    });
    pm.request.headers.add({
        key: 'Content-Type',
        value: 'application/json'
    });
}

if (pm.collectionVariables.get('jsrsasign-js') === undefined || pm.collectionVariables.get('jsrsasign-js') == "") {
    console.log("jsrasign library not already downloaded. Downloading now. ");
    
    pm.sendRequest({
        url: "http://kjur.github.io/jsrsasign/jsrsasign-latest-all-min.js",
        method: "GET",
        body: {}
    }, function (err, res) {
        console.log(res.text());
        pm.collectionVariables.set("jsrsasign-js", res.text());
        doHttpSig();
    });
    
} else {
    console.log("Do doHttpSig")
    doHttpSig();
}