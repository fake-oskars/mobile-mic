// Check if the browser supports the Web Audio API
if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    let micStream;

    const circle = document.getElementById('circle');

    function startMicrophone() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                analyser.fftSize = 32; // Adjust this value for sensitivity

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                function updateColorAndSize() {
                    analyser.getByteFrequencyData(dataArray);

                    // Calculate the average volume
                    const averageVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

                    // Map the volume to a color gradient from blue to red
                    const blue = Math.floor(255 * (1 - averageVolume / 255));
                    const red = Math.floor(255 * (averageVolume / 255));

                    // Set the background color based on volume
                    document.body.style.backgroundColor = `rgb(${red}, 0, ${blue})`;

                    // Set the size of the circle based on volume
                    const circleSize = averageVolume;
                    circle.style.width = `${circleSize}px`;
                    circle.style.height = `${circleSize}px`;

                    requestAnimationFrame(updateColorAndSize);
                }

                updateColorAndSize();
            })
            .catch((error) => {
                console.error('Error accessing the microphone:', error);
            });
    }

    function stopMicrophone() {
        if (micStream) {
            const tracks = micStream.getTracks();
            tracks.forEach(track => track.stop());
        }
    }

    // Start microphone when page becomes visible
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            startMicrophone();
        } else {
            stopMicrophone();
        }
    });

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

    // Start the microphone initially
    startMicrophone();
} else {
    console.error('Web Audio API is not supported in this browser.');
}
