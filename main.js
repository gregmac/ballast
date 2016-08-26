const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const displayUrl = "https://lh4.googleusercontent.com/pyirBixNKOs_rc3C_Ff_rRPotD0kdLOj9CBfVsJzBKgfdrPLfrYKrNI04idpE9FD8rpmRkxf9OzX2xUcQ80MUzF-5ZSSCZw4XIVqOK_gEq7vBGu_GR9BeoEiaIPaDLXchQ";
//const displayUrl = "http://httpstat.us/404";

const infoPageUrl = `file://${__dirname}/index.html`;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// track last get-response-details recorded 
let lastHttpResponse = null;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  displayInfoPage(`Loading..`, `Please wait while the page is initially loaded.`);

  mainWindow.webContents.on('did-fail-load', function(event, errorCode, errorDescription, validatedURL, isMainFrame) {
    console.log('did-fail-load', {
      event:event, 
      errorCode:errorCode, 
      errorDescription:errorDescription, 
      validatedURL:validatedURL, 
      isMainFrame:isMainFrame});

    lastHttpResponse = null;
    displayInfoPage(`Error`, `Page failed to load: ${errorDescription} (${errorCode})`);
    
    setTimeout(function() {
      mainWindow.loadURL(displayUrl);
    }, 5000);
  });

  // mainWindow.webContents.on('did-finish-load', function(event, e2, e3) {
  //   console.log('did-finish-load', {event:event, e2:e2, e3:e3});
    

  // });

  mainWindow.webContents.on('did-get-response-details', function(event, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType) {
    if (originalURL != infoPageUrl) {
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
        mainWindow.loadURL(displayUrl);
      }
    }
  });
  mainWindow.webContents.on('new-window', function(event, url, frameName, disposition) {
    console.log('new-window', {
      event:event,
      url:url,  
      frameName:frameName, 
      disposition:disposition});
    event.preventDefault();
  });
  mainWindow.webContents.on('crashed', function() {
    console.log('crashed');
  });


  mainWindow.loadURL(displayUrl);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function displayInfoPage(header, details)
{
  global.infoPage = {
    header:header,
    details:details
  }


  // and load the index.html of the app.
  mainWindow.loadURL(infoPageUrl);
}