const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
require(path.join(__dirname + '/scripts/ion-scripts/ion-index.js'));

let window_main;

let dLoop = '';
dTesting: for (let i = 0; i < 5; i++) {
    try {
        fs.accessSync(path.join(__dirname + dLoop + '/resources'));
    } catch (err) {
        dLoop += '/..';
        continue dTesting;
    }
}

let required_dir = ['/installed_apps'];
for (let i in required_dir) {
    let dir = path.join(__dirname + dLoop + required_dir[i]);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    console.log(dir);
}

app.on('ready', () => {
    window_main = new BrowserWindow({ frame: false, webPreferences: { nodeIntegration: true } });

    window_main.loadFile('main.html');

    window_main.on('closed', () => {
        app.quit();
    });
});