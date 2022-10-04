const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');

const isMAc = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';


// Create the main window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
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
    Menu.setApplicationMenu(mainMenu)

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

app.on('window-all-closed', () => {
    if (!isMAc) {
        app.quit();
    };
});