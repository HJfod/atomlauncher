module.exports = {};

let files = ['ion-main.js', 'ion-main.css', 'ion-menu-toolbox.js', 'ion-menu-toolbox.css', 'ion-tabs.js', 'ion-tabs.css', 'ion-elements.js', 'ion-elements.css'];

let path = require('path');

for (let i in files) {
    let n;
    switch (files[i].split('.').pop()) {
        case 'js':
            n = document.createElement('script');
            n.type = 'text/javascript';
            n.src = path.join(__dirname + '/' + files[i]);
            break;
        case 'css':
            n = document.createElement('link');
            n.rel = 'stylesheet';
            n.href = path.join(__dirname + '/' + files[i]);
            break;
    }
    document.getElementsByTagName('body')[0].appendChild(n);
}