// Check if the browser supports the Web Audio API
if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const micStream = navigator.mediaDevices.getUserMedia({ audio: true });

    micStream.then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 32; // Adjust this value for sensitivity

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function updateColor() {
            analyser.getByteFrequencyData(dataArray);

            // Calculate the average volume
            const averageVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

            // Map the volume to a color gradient from blue to red
            const blue = Math.floor(255 * (1 - averageVolume / 255));
            const red = Math.floor(255 * (averageVolume / 255));

            // Set the background color based on volume
            document.body.style.backgroundColor = `rgb(${red}, 0, ${blue})`;

            requestAnimationFrame(updateColor);
        }

        updateColor();
    }).catch((error) => {
        console.error('Error accessing the microphone:', error);
    });
} else {
    console.error('Web Audio API is not supported in this browser.');
}
