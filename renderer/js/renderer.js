const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
    // files are put in the files array, even if there is only one
    const file = e.target.files[0];

    if(!isFileImage(file)) {
        alertError('Please select an image');
        return;
    };

    // get original dimentions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height;
    };

    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'imageresizer');
};

// Send image to main
function sendImage(e) {
    e.preventDefault();
    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;
    
    // Check if there is an image
    if (!img.files[0]) {
        alertError('Please upload an image');
        return;
    }
    // Check if we have a width and height input
    if (width === '' || height === '') {
        alertError('Please fill in a height and width');
        return;
    }

    //Send to main using ipcRenderer
    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height
    })
};

// Catch image:done success event
ipcRenderer.on('image:done', () => {
    alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`);
})

// Make sure file is img
function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg',];
    return file && acceptedImageTypes.includes(file['type']);
};

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center'
        }
    });
};

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center'
        }
    });
};

img.addEventListener('change', loadImage);

form.addEventListener('submit', sendImage);