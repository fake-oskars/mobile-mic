if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const micStream = navigator.mediaDevices.getUserMedia({ audio: true });

    micStream.then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 2048; // Adjust this value for sensitivity (higher values for better frequency resolution)

        const dataArray = new Float32Array(analyser.frequencyBinCount);

        function updateColor() {
            analyser.getFloatFrequencyData(dataArray);

            // Calculate the average volume
            const averageVolume = Math.abs(dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length);

            // Map the volume to a more complex color gradient
            const hue = 240 - (averageVolume * 120); // Blue to red
            const saturation = 100;
            const lightness = 50;

            // Convert HSL to RGB
            const rgb = hslToRgb(hue / 360, saturation / 100, lightness / 100);

            // Set the background color based on volume
            document.body.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

            requestAnimationFrame(updateColor);
        }

        updateColor();
    }).catch((error) => {
        console.error('Error accessing the microphone:', error);
    });
} else {
    console.error('Web Audio API is not supported in this browser.');
}

// Function to convert HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


// Function to update the clock with the correct timezone
function updateClock() {
    const options = {
        timeZone: 'Europe/Riga', // Timezone for Latvia (GMT+2)
        hour12: false, // Use 24-hour format
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3, // Display milliseconds
    };

    const currentTime = new Date().toLocaleTimeString('en-US', options);
    document.getElementById('clock').textContent = currentTime;
}

// Update the clock every millisecond
setInterval(updateClock, 1);
