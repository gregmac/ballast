const electron = require('electron')
const fs = require('fs')
const hjson = require('hjson')
const _ = require('lodash')

// Module to control application life.
const app = electron.app

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of all the window objects, if you don't, the windows will
// be closed automatically when the JavaScript object is garbage collected.
let windows = [];

const defaultSettings = {
  displays: [
    {
        "screen":1,
        "url":"http://gregmac.github.com/readme-for-this-app",
        "size":"fullscreen"
    }
  ],
  failureRetryTime: 5000, // time in ms to retry after page failed to load (eg: network failure)
  nonSuccessRetryTime: 15000, // time in ms to retry when getting a non-200 response code from server  
};


let settings = hjson.parse(fs.readFileSync('settings.json', 'utf8'));
console.log('read settings.json', settings);
_.defaults(settings, defaultSettings);
console.log('applied defaultSettings', settings);



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  // remove default menu 
  electron.Menu.setApplicationMenu(null); 

  createAllWindows();
})

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
    createAllWindows()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function createAllWindows() {
  console.log(settings);

  _.forEach(settings.displays, function(display) {
    console.log(display);
    
    let window;
    window = createWindow(settings, display, function() { 
      // Dereference the window object by removing it from array 
      windows = _.remove(windows, window); 
    });
    // add this object 
    windows.push(window);
  });

}


function createWindow (globalSettings, display, onClosed) {
  // Create the browser window.
  let window = new BrowserWindow({
    //fullscreen:true,
    //width:1024,
    //height:768,
    backgroundColor:"#000",
    darkTheme: true,
    webPreferences:{
      zoomFactor: 1.0
    }
  });

  // main content 
  window.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  //window.webContents.openDevTools()

  window.globalSettings = globalSettings;
  window.display = display;

  window.exit = function () {
    console.log('Application exit requested via window', window);
    app.quit();
  }

  // Emitted when the window is closed.
  window.on('closed', onClosed);
}

