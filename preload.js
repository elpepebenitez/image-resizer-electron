const os = require('os');
const path = require('path');
const { contextBridge } = require('electron')

// exposes on renderer
// we need to specify what we want to pass
contextBridge.exposeInMainWorld('os', {
    homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {
    join: (...args) => path.join(...args),
});