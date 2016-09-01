const electron = require('electron')
const fs = require('fs')
const path = require('path')
const hjson = require('hjson')
const _ = require('lodash')

// Module to control application life.
const app = electron.app

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// command-line
var argv = require('yargs')
    .usage('Usage: $0 [options]')
    .alias('c', 'config').describe('c', 'Specify path to configuration file')
    .describe('squirrel-install', 'Internal function').boolean('squirrel-install')
    .describe('squirrel-updated', 'Internal function').boolean('squirrel-updated')
    .describe('squirrel-uninstall', 'Internal function').boolean('squirrel-uninstall')
    .describe('squirrel-obsolete', 'Internal function').boolean('squirrel-obsolete')
    .help('h')
    .alias('h', 'help')
    .version()
    .argv;

//console.log(argv);

if (argv.squirrelInstall || argv.squirrelUninstall || argv.squirrelUpdated || argv.squirrelObsolete) {
  console.log('Squirrel install action: exiting.');
  return;
}

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

let settings = null;


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  // remove default menu 
  electron.Menu.setApplicationMenu(null); 

  settings = loadSettingsFile();
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

function loadSettingsFile() {
  let settingsPath
  if (argv.config) {
    // specified path on command-line
    if (!fileExists(argv.config)) {
      console.log("Could not find settings file "+argv.config+". Exiting.");
      app.quit();
      return;
    }
    settingsPath = argv.config;
  } else {
    // find settings path from possible locations 
    const settingsPaths = [ 
      path.join(process.cwd(), "settings.json"),
      path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], "wallkiosk", "settings.json"),
      process.env.ALLUSERSPROFILE ? path.join(process.env.ALLUSERSPROFILE, "wallkiosk", "settings.json") : null,
      process.platform == 'linux' ? path.join("etc","wallkiosk","settings.json") : null,
      process.platform == 'linux' ? path.join("boot","wallkiosk-settings.json") : null,
      process.env.SystemDrive ? path.join(process.env.SystemDrive,"wallkiosk-settings.json") : null,
    ];
    
    settingsPath = _.find(settingsPaths, function(x) { return fileExists(x); });
    if (settingsPath == null) {
      console.log("Could not find any settings file. Checked: ", _.filter(settingsPaths, function(x) { return x != null; }));
      return defaultSettings;
    } 
  }

  console.log("Loading settings from", settingsPath);
  
  let settings = hjson.parse(fs.readFileSync(settingsPath, 'utf8'));
  console.log('Settings as read', settings);
  _.defaults(settings, defaultSettings);
  console.log('Settings with defaultSettings', settings);

  return settings;
}

function fileExists(filePath)
{
    try
    {
        return fs.statSync(filePath).isFile();
    }
    catch (err)
    {
        return false;
    }
}
