require(require('path').join(__dirname + '/scripts/ion-scripts/ion-render.js'));

const apps_list = [
    { name: 'Proton', launch: 'Proton-win32-ia32/Proton.exe', location: 'proton-texteditor', type: 'software=Text editor' },
    { name: 'Video Intro Animator', launch: 'setup.html', location: 'hj-video-intro-animator', type: 'tool=Animation tool' },
    { name: 'HJpad', launch: 'HJpad.exe', location: 'hj-hjpad', type: 'software=Text editor' },
    { name: 'Hits n Bits', launch: 'game.html', location: 'hitsnbits', type: 'game=Rythm game' }
];
const fs = require('fs');
const path = require('path');
const $ = require('jquery');
const { shell } = require('electron');
const admzip = require('adm-zip');
const git_dl = require('@etclabscore/dl-github-releases');

let dLoop = '';
dTesting: for (let i = 0; i < 5; i++) {
    try {
        fs.accessSync(path.join(__dirname + dLoop + '/resources'));
    } catch (err) {
        dLoop += '/..';
        continue dTesting;
    }
}

try {
    fs.accessSync(path.join(`${__dirname}${dLoop}/installed_apps`));

    for (let i in apps_list) {
        try {
            fs.accessSync(path.join(`${__dirname}${dLoop}/installed_apps/${apps_list[i].name}`));
            add_installed_app(apps_list[i]);
        } catch (err) {
            add_available_app(apps_list[i]);
            console.log(err);
        }
    }
} catch (err) {
    console.log(err);
}

function add_installed_app(app) {
    let n = document.createElement('div');
    $(n).attr('class', 'app').attr('id', `i-app-${app.name.replace(/\s/g, '')}`);

    let t = document.createElement('text');
    $(t).text(app.name).attr('class', 'app-name-text');
    $(n).append(t);

    let type = document.createElement('text');
    $(type).text(app.type.split('=')[1]).attr('class', `app-type-text ${app.type.split('=')[0]}`);
    $(n).append(type);

    let l = document.createElement('app-button');
    let l2 = document.createElement('app-button');
    $(l).text('Launch').attr('class', 'launch-button').attr('onclick', `launch_app('${app.name}/${app.launch}')`);
    $(l2).text('Uninstall').attr('class', 'launch-button').attr('onclick', `uninstall_app('${JSON.stringify(app)}')`);
    $(n).append(l2);
    $(n).append(l);

    $('#apps-installed').append(n);
}

function add_available_app(app) {
    let n = document.createElement('div');
    $(n).attr('class', 'app').attr('id', `d-app-${app.name.replace(/\s/g, '')}`);

    let t = document.createElement('text');
    $(t).text(app.name).attr('class', 'app-name-text');
    $(n).append(t);

    let type = document.createElement('text');
    $(type).text(app.type.split('=')[1]).attr('class', `app-type-text ${app.type.split('=')[0]}`);
    $(n).append(type);

    let l = document.createElement('app-button');
    $(l).text('Install').attr('id', `launch-${app.name.replace(/\s/g, '')}`).attr('class', 'launch-button').attr('onclick', `download_app('${JSON.stringify(app)}')`);
    $(n).append(l);

    $('#apps-download').append(n);
}

function download_app(app) {
    require('dns').lookup('google.com', (err) => {
        app = JSON.parse(app);

        $(`#launch-${app.name.replace(/\s/g, '')}`).css('display', 'none');
        let dtxt = document.createElement('text');
        $(dtxt).attr('class', 'app-name-status').attr('id', `status-${app.name.replace(/\s/g, '')}`).text('Connecting...');
        $(`#d-app-${app.name.replace(/\s/g, '')}`).append(dtxt);

        if (err && err.code == 'ENOTFOUND') {
            console.error('Unable to connect to the internet.');
            $('#status').text(`Unable to connect to the internet.`);

            $(`#status-${app.name.replace(/\s/g, '')}`).remove();
            $(`#launch-${app.name.replace(/\s/g, '')}`).css('display', '');
        } else {
            let loc = app.location.split('/');

            $(`#status-${app.name.replace(/\s/g, '')}`).remove();

            $(`#launch-${app.name.replace(/\s/g, '')}`).css('display', 'none');
            let dtxt = document.createElement('text');
            $(dtxt).attr('class', 'app-name-status').attr('id', `status-${app.name.replace(/\s/g, '')}`).text('Downloading...');
            $(`#d-app-${app.name.replace(/\s/g, '')}`).append(dtxt);

            let dir = path.join(`${__dirname}${dLoop}/installed_apps/${app.name}`);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            $('#status').text(`Downloading ${app.location}...`);

            let o = {
                hostname: `api.github.com`,
                path: `/repos/HJfod/${app.location}/releases/latest`,
                headers: {
                    'User-Agent': 'request'
                }
            }

            let latest_tag;
            require('https').get(o, (res) => {
                res.on('data', (data) => { latest_tag ? latest_tag += data : latest_tag = data; });
                res.on('end', () => {
                    latest_tag = JSON.parse(latest_tag).tag_name;
                });
            });

            git_dl.default('HJfod', app.location, dir, r => (r.tag_name === latest_tag), a => true).then(() => {
                console.log(`Downloaded in ${dir}`);
                $('#status').text(`Unzipping ${app.location}...`);

                let d = fs.readdirSync(dir);

                if (!fs.existsSync(`${dir}/${d[0]}`)) {
                    $(`#status-${app.name.replace(/\s/g, '')}`).remove();
                    $(`#launch-${app.name.replace(/\s/g, '')}`).css('display', '');
                    console.log('fuck');
                    return;
                }
                let a = fs.readdirSync(`${dir}/${d[0]}`);

                console.log(`${dir}/${d[0]}/${a[0]}`);
                
                let zip = new admzip(`${dir}/${d[0]}/${a[0]}`);

                zip.getEntries().forEach(entry => {
                    console.log(entry);
                    fs.writeFileSync(`${dir}/${entry.entryName}`, zip.readFile(entry));
                });

                console.log(`Installed ${app.name}`);

                $('#status').text(`Succesfully installed ${app.name}!`);

                add_installed_app(app);
                $(`#d-app-${app.name.replace(/\s/g, '')}`).remove();

                fs.unlink(`${dir}/${d[0]}/${a[0]}`, () => {
                    fs.rmdirSync(`${dir}/${d[0]}`);
                });
                

            }).catch((err) => {
                console.error(err.message);
                $('#status').text(`ERROR: ${err.message}`);
                $(`#status-${app.name.replace(/\s/g, '')}`).remove();
                $(`#launch-${app.name.replace(/\s/g, '')}`).css('display', '');
            });
        }
    });
}

function launch_app(app) {
    let dir = path.join(`${__dirname}${dLoop}/installed_apps/${app}`);

    try {
        fs.accessSync(dir);
        shell.openExternal(dir);
        $('#status').text(`Launching ${app}...`);
    } catch (err) {
        console.log(err);
    }
}

function uninstall_app(app) {
    app = JSON.parse(app);
    let dir = path.join(`${__dirname}${dLoop}/installed_apps/${app.name}`);

    try {
        fs.accessSync(dir);
        $(`#i-app-${app.name.replace(/\s/g, '')}`).remove();
        add_available_app(app);

        $('#status').text(`Uninstalling ${dir}...`);

        deleteFolderRecursive(dir);
        console.log(`Uninstalled ${dir}`);
        $('#status').text(`Uninstalled ${app.name}.`);
    } catch (err) {
        console.log(err);
    }
}

const o_fs = require('original-fs');

const deleteFolderRecursive = pth => {
    if (o_fs.existsSync(pth)) {
        o_fs.readdirSync(pth).forEach((file, index) => {
            const curPath = path.join(pth, file);
            if (o_fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                o_fs.unlinkSync(curPath);
            }
        });
        o_fs.rmdirSync(pth);
    }
};