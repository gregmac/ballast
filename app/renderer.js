// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let webview = document.getElementById('webcontent');
let body = document.getElementsByTagName('body')[0]; 

const {screen, remote} = require('electron');
const {Menu, MenuItem} = remote;
const _ = require('lodash');

const globalSettings = remote.getCurrentWindow().globalSettings;
const displaySettings = remote.getCurrentWindow().display;
console.log('globalSettings', globalSettings, 'displaySettings', displaySettings);

window.addEventListener('load', function() {
  displayInfoPage(`Loading..`, `Please wait while the page is initially loaded.`);
  setDefaultPosition(); 
  webview.src = displaySettings.url; 
});

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
    webview.src = displaySettings.url;
  }, globalSettings.failureRetryTime);
});

webview.addEventListener('did-get-response-details', function(details) {
  console.log('did-get-response-details', details);

  hideInfo();

  if (details.httpResponseCode < 200 || details.httpResponseCode >= 300)
  {
    console.log(`last response code is ${details.httpResponseCode}, re-loading URL ${displaySettings.url}`);
    // TODO: display overlay message

    setTimeout(function() {
      webview.src = displaySettings.url;
    }, globalSettings.nonSuccessRetryTime);
  }
});
webview.addEventListener('crashed', function() {
  console.log('crashed');
});


const menu = Menu.buildFromTemplate([
  {
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click (item, focusedWindow) {
      if (focusedWindow) focusedWindow.reload()
    }
  },
  {type: 'separator'},
  {
    label: "Move to display",
    submenu: _.map(screen.getAllDisplays(), function(display,index) {
      return {
        label: `Display ${index+1}`,
        click: function() { moveToDisplay(index) },
      };
    })
  },
  {
    label: 'Toggle Fullscreen',
    accelerator: 'F11',
    click (item, focusedWindow) {
      focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
    }
  },
  {
    label: 'Reset to configured position',
    click (item, focusedWindow) {
      setDefaultPosition();
    }
  },
  {
    label: 'Toggle Developer Tools',
    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
    click (item, focusedWindow) {
      if (focusedWindow) focusedWindow.webContents.toggleDevTools()
    }
  },
  {type: 'separator'},
  {
    label:'Close Window',
    accelerator: 'Alt+F4',
    role:'close'
  },
  {
    label:'Exit',
    click (item, focusedWindow) {
      remote.getCurrentWindow().exit();
    }
  }
]);
  
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup(remote.getCurrentWindow())
}, false)

  
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

function moveToDisplay(displayIndex)
{
  setPosition(displayIndex, null, null);
}

function setDefaultPosition() {
  setPosition(displaySettings.screen - 1, displaySettings.position, displaySettings.size);
}

function setPosition(displayIndex, position, size) {
  let displays = screen.getAllDisplays();
  let thisWindow = remote.getCurrentWindow();

  if (!displayIndex) displayIndex = 0;
  let displayBasePosition = [displays[displayIndex].workArea.x, displays[displayIndex].workArea.y];
  let currentPosition = thisWindow.getPosition();

  // preserve fullscreen  
  if (size == null && thisWindow.isFullScreen()) {
    size = 'fullscreen';
  }
  // preserve offset on display, if not specified 
  if (position == null) {
    // get current offset on current display 
    let currentDisplay = screen.getDisplayNearestPoint({x:currentPosition[0], y:currentPosition[1]});
    position = [currentPosition[0] - currentDisplay.workArea.x, currentPosition[1] - currentDisplay.workArea.y];
  }
  
  if (position == 'fullscreen' || size == 'fullscreen') {
    // if not currently fullscreen, or x or y position is wrong (wrong display), move to proper screen
    if (!thisWindow.isFullScreen() || (currentPosition[0] != displayBasePosition[0]) || (currentPosition[1] != displayBasePosition[1])) { 
      thisWindow.setFullScreen(false); // must be non-fullscreen to move screens
      thisWindow.setPosition(displayBasePosition[0], displayBasePosition[1]);
      thisWindow.setFullScreen(true);
    }
  } else {
    thisWindow.setFullScreen(false);

    if (size != null) thisWindow.setSize(size[0], size[1]);

    let targetX = displayBasePosition[0] + position[0];
    let targetY = displayBasePosition[1] + position[1];
    // todo check within bounds of display 
    thisWindow.setPosition(targetX,targetY);

  }
  
}