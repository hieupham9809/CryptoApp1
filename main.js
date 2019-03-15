// Modules to control application life and create native browser window
//https://www.npmjs.com/package/file-encrypt
const {app, BrowserWindow} = require('electron');
//const Photon = require("electron-photon")
const DataStore = require('./DataStore.js');
//const AesCryptor = require('./symetric.js');
const Safe = require('./safe');
var encryptor = require('file-encryptor');
var key = 'My Super Secret Key';
var options = { algorithm: 'aes-256-gcm' };
//var safe = new Safe("./near.png", "my-password");

var passwordHash = require('password-hash');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const data = new DataStore({name: 'Info'})



function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  if (passwordHash.verify("000000",data.getHashPassword())){
    mainWindow.loadFile('index.html')
    data.saveInfo()
  }
  
  
  // safe.encryptAsync(data).then(result => {
  //   return safe.decryptAsync();
  // });
  
  //Safe.encrypt_aes256cbc('./near.png','mypassword');
  //console.log("completed");
  Safe.decrypt_aes256cbc('./near/near.png.crypted','mypassword','./near/hash_code.txt');
  console.log("completed");
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

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
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
