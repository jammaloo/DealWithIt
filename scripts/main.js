(async () => {
    const imageUrl = 'images/example.jpg';
    const glassesUrl = 'images/glasses.png';
    const proxyPath = 'img.php?url=';
    let glassesList = [];
    let isFirstResize = true;

    const leftEyeLandmark = 36;
    const rightEyeLandmark = 45;
    const glassesPaddingPercentage = 0.8;

    const input = document.getElementById('image');
    const glassesContainer = document.getElementById('overlay');
    const dealWithIt = document.getElementById('dealWithIt');
    const dropZone = document.getElementById('dropZone');

    document.addEventListener('dragenter', () => {
        dropZone.style = "display: flex;"
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

    dropZone.addEventListener('drop', async (e) => {
        dropZone.style = "";
        // Prevent default behavior (Prevent file from being opened)
        e.preventDefault();

        let file;

        if (e.dataTransfer.items) {
            file = e.dataTransfer.items[0].getAsFile();
        } else {
            file = e.dataTransfer.files[0];
        }
        input.src = await toBase64(file);
    });

    document.getElementById('customize').addEventListener('click', (e) => {
        const placeholderUrl = input.src.substr(0, 5) === 'data:' ? '' : input.src;
        window.location.hash = prompt('Please enter the URL of the image', placeholderUrl) || "";
        e.stopPropagation();
        e.preventDefault();
        return false;
    });

    const parseImageSrc = (inputImageUrl = "") => {
        let targetUrl = imageUrl;
        if (inputImageUrl) {
            try {
                new URL(inputImageUrl);
                targetUrl = inputImageUrl;
            } catch (e) {
                alert('Invalid URL provided');
            }
        }
        input.src = targetUrl.substr(0, 4) === 'http' ? proxyPath + encodeURIComponent(targetUrl) : targetUrl;
    };


    const getLineLength = (p1, p2) => {
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

    const init = () => {
        parseImageSrc(window.location.hash.substring(1));
    };

    input.addEventListener('load', async () => {
        await faceapi.loadTinyFaceDetectorModel('./models');
        await faceapi.loadFaceLandmarkTinyModel('./models');

        const detectionsWithLandmarks = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);

        const detectionsWithLandmarksForSize = faceapi.resizeResults(detectionsWithLandmarks, { width: input.width, height: input.height })

        if (glassesList.length !== detectionsWithLandmarksForSize.length) {
            glassesList = [];
            document.querySelectorAll('.glasses').forEach((glasses) => {
                glasses.remove();
            });
            for (let i = 0; i < detectionsWithLandmarksForSize.length; i++) {
                let glasses = new Image();
                glasses.src = glassesUrl;
                glasses.className = 'glasses';
                glasses.style = 'top: -1000px; left: 50vw;';
                glassesContainer.appendChild(glasses);
                glassesList.push(glasses);
            }
        }
        window.setTimeout(() => {

            detectionsWithLandmarksForSize.forEach((detection, i) => {
                let glasses = glassesList[i];
                const eyePositions = [
                    [detection.landmarks.positions[leftEyeLandmark].x, detection.landmarks.positions[leftEyeLandmark].y],
                    [detection.landmarks.positions[rightEyeLandmark].x, detection.landmarks.positions[rightEyeLandmark].y],
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
            });
            isFirstResize = false;
            dealWithIt.style= 'bottom: 20px;';
        }, 100);
    });

    init();

    window.addEventListener('hashchange', () => {
        init();
    });

    const debounced = debounce(init);
    window.addEventListener('resize', () => {
        debounced();
    });
})();
