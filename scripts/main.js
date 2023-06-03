const leftEyeLandmarks = [37, 40];
const rightEyeLandmarks = [43, 46];

const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');

const getMidpoint = (p1, p2) => {
    return [(p1.x + p2.x) / 2, (p1.y + p2.y) / 2].map(Math.round);
};

(async () => {
    await faceapi.loadTinyFaceDetectorModel('../models');
    await faceapi.loadFaceLandmarkTinyModel('../models');
    const input = document.getElementById('image');

    const detectionsWithLandmarks = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
    console.log('detections', detectionsWithLandmarks);
    const detectionsWithLandmarksForSize = faceapi.resizeResults(detectionsWithLandmarks, { width: input.width, height: input.height })
    console.log(detectionsWithLandmarksForSize);
    console.log(detectionsWithLandmarksForSize[0].landmarks.positions[0].x);
    const eyePositions = [
        getMidpoint(detectionsWithLandmarksForSize[0].landmarks.positions[leftEyeLandmarks[0]], detectionsWithLandmarksForSize[0].landmarks.positions[leftEyeLandmarks[1]]),
        getMidpoint(detectionsWithLandmarksForSize[0].landmarks.positions[rightEyeLandmarks[0]], detectionsWithLandmarksForSize[0].landmarks.positions[rightEyeLandmarks[1]]),
    ];

    leftEye.style = `left: ${eyePositions[0][0]}px; top: ${eyePositions[0][1]}px;`;
    rightEye.style = `left: ${eyePositions[1][0]}px; top: ${eyePositions[1][1]}px;`;
})();
