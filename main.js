const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const { log } = require('console');

const isMAc = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

// Create the main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // open dev tools if in dev env
    if(isDev) {
       mainWindow.webContents.openDevTools() 
    }
    
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
};

// Create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 600
    });
     
     aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// app is ready
app.whenReady().then(() => {
    createMainWindow();

    // Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    // Remove main window from memory on close
    mainWindow.on('closed', () => (mainMenu = null))

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
});

// Menu template
const menu = [
    ...(isMAc ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []),
    {
        role: 'fileMenu',
    },
    ...(!isMAc ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : [])
];

// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(options);
});

// Resize the image
async function resizeImage({imgPath, width, height, dest}) {
    try {   
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        // Create file name
        const filename = path.basename(imgPath);

        // Create destination folder if it does not exist
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        // Write file to dest folder
        fs.writeFileSync(path.join(dest, filename), newPath);

        // Send success message to render (we are sending an event)
        mainWindow.webContents.send('image:done');

        // open dest folder
        shell.openPath(dest);
    } catch (error) {
        console.log(error);
    }
}

app.on('window-all-closed', () => {
    if (!isMAc) {
        app.quit();
    };
});