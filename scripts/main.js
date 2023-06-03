(async () => {
    let isFirstResize = true;

    const leftEyeLandmark = 36;
    const rightEyeLandmark = 45;
    const glassesPaddingPercentage = 0.8;

    const glasses = document.getElementById('glasses');

    const getLineLength = (p1, p2) => {
        console.log(p1, p2);
        return Math.round(
            Math.sqrt(
                ((p2[0] - p1[0]) ** 2) +
                ((p2[1] - p1[1]) ** 2)
            )
        );
    }

    const calculateAngleDegrees = (p1, p2) => {
        // Calculate the difference between the two points
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];

        // Calculate the angle in radians
        const rad = Math.atan2(dy, dx);

        // Convert the angle to degrees
        let deg = rad * (180 / Math.PI);

        // Normalize the degree to be between 0 and 360
        if(deg < 0) {
            deg = 360 + deg;
        }

        return deg;
    }

    const debounce = (cb, delay = 1000) => {
        let wait = false;

        return (...args) => {
            if (wait) {
                return;
            }

            wait = true;
            setTimeout(() => {
                wait = false;
                cb(...args);
            }, delay);
        }
    };

    await faceapi.loadTinyFaceDetectorModel('../models');
    await faceapi.loadFaceLandmarkTinyModel('../models');
    const input = document.getElementById('image');

    const detectionsWithLandmarks = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);

    const resizeHandler = () => {
        console.log('resize');
        const detectionsWithLandmarksForSize = faceapi.resizeResults(detectionsWithLandmarks, { width: input.width, height: input.height })
        const eyePositions = [
            [detectionsWithLandmarksForSize[0].landmarks.positions[leftEyeLandmark].x, detectionsWithLandmarksForSize[0].landmarks.positions[leftEyeLandmark].y],
            [detectionsWithLandmarksForSize[0].landmarks.positions[rightEyeLandmark].x, detectionsWithLandmarksForSize[0].landmarks.positions[rightEyeLandmark].y],
        ];

        const lineLength = getLineLength(eyePositions[0], eyePositions[1]);
        const glassesRotation = calculateAngleDegrees(eyePositions[0], eyePositions[1]);
        const glassesWidth = lineLength * (1 + glassesPaddingPercentage)
        const glassesOffset = glassesWidth * (glassesPaddingPercentage / 4);

        glasses.style = `
        width: ${glassesWidth}px;
        left: ${eyePositions[0][0] - glassesOffset}px;
        top: ${eyePositions[0][1]}px;
        transform: rotate(${glassesRotation}deg);
        ${isFirstResize ? '' : 'transition: 1s all;'}`;
        isFirstResize = false;
    };

    const debounced = debounce(resizeHandler);
    window.addEventListener('resize', () => {
        debounced();
    });
    resizeHandler();
})();
