// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let webview = document.getElementById('webcontent');
let body = document.getElementsByTagName('body')[0]; 

const displayUrl = "https://lh4.googleusercontent.com/pyirBixNKOs_rc3C_Ff_rRPotD0kdLOj9CBfVsJzBKgfdrPLfrYKrNI04idpE9FD8rpmRkxf9OzX2xUcQ80MUzF-5ZSSCZw4XIVqOK_gEq7vBGu_GR9BeoEiaIPaDLXchQ";
//const displayUrl = "http://httpstat.us/404";


  displayInfoPage(`Loading..`, `Please wait while the page is initially loaded.`);
  webview.src = displayUrl;

  webview.addEventListener('did-fail-load',   function(event, errorCode, errorDescription, validatedURL, isMainFrame) {
    console.log('did-fail-load', {
      event:event, 
      errorCode:errorCode, 
      errorDescription:errorDescription, 
      validatedURL:validatedURL, 
      isMainFrame:isMainFrame});

    lastHttpResponse = null;
    displayInfoPage(`Error`, `Page failed to load: ${errorDescription} (${errorCode})`);
    
    setTimeout(function() {
      webview.src = displayUrl;
    }, 5000);
  });

  // webview.addEventListener('did-finish-load', function(event, e2, e3) {
  //   console.log('did-finish-load', {event:event, e2:e2, e3:e3});
    

  // });

  webview.addEventListener('did-get-response-details', function(event, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType) {
    lastHttpResponse = {
        event:event, 
        status:status, 
        newURL:newURL, 
        originalURL:originalURL, 
        httpResponseCode:httpResponseCode, 
        requestMethod:requestMethod, 
        referrer:referrer, 
        headers:headers, 
        resourceType:resourceType
    };
    console.log('did-get-response-details', lastHttpResponse);

    if (lastHttpResponse.httpResponseCode < 200 || lastHttpResponse.httpResponseCode >= 300)
    {
        console.log(`last response code is ${lastHttpResponse.httpResponseCode}, re-loading URL ${displayUrl}`);
        webview.src = displayUrl;
    } else {
        hideInfo();
    }
  });
  webview.addEventListener('crashed', function() {
    console.log('crashed');
  });

  
function displayInfoPage(header, details)
{
    body.className = 'info';
    document.getElementById('infoTitle').innerHTML = header;
    document.getElementById('infoText').innerHTML = details;
}
function hideInfo()
{
    body.className = '';
}