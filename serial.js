let port;
let writer;

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    if ("serial" in navigator) {
        setupConnectButton();
    } else {
        displayNotSupportedError();
    }
}

function setupConnectButton() {
    const appContainer = document.getElementById('appContainer');
    appContainer.innerHTML = '<button id="connect" class="button is-link">Connect to Serial Device</button>';
    document.getElementById('connect').addEventListener('click', connectSerial);
}

function displayNotSupportedError() {
    const appContainer = document.getElementById('appContainer');
    appContainer.innerHTML = '<div class="notification is-danger">Web Serial API is not supported in this browser. ' +
                             'Please check <a href="https://caniuse.com/web-serial" target="_blank">browser compatibility</a>.</div>';
}

async function connectSerial() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        writer = port.writable.getWriter();
        console.log('Connected to the serial port');
        document.getElementById('connect').style.display = 'none'; // Hide connect button
        enableSlidersAndInputs(); // Enable sliders and inputs
    } catch (err) {
        console.error('There was an error opening the serial port: ', err);
    }
}

function enableSlidersAndInputs() {
    const sliders = document.querySelectorAll('input[type=range]');
    const inputs = document.querySelectorAll('input[type=number]');

    sliders.forEach((slider, index) => {
        slider.disabled = false;
        slider.addEventListener('input', () => {
            inputs[index].value = slider.value;
            sendSliderValue(index, slider.value);
        });
    });

    inputs.forEach((input, index) => {
        input.disabled = false;
        input.addEventListener('input', () => {
            sliders[index].value = input.value;
            sendSliderValue(index, input.value);
        });
    });
}

async function sendSliderValue(index, value) {
    if (writer) {
        const byteArray = [index, parseInt(value)];
        await writer.write(new Uint8Array(byteArray));
        console.log('Slider value sent:', byteArray);
    } else {
        console.error('Serial port not connected or writer not set up.');
    }
}

