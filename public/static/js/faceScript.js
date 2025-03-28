async function setupCamera() {
    const video = document.getElementById("video");
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    return new Promise(resolve => video.onloadedmetadata = resolve);
}

async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri("../../models");
    console.log("Model Loaded!");
}

async function startFaceDetection() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    async function detect() {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
        // Clear the canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Flip video horizontally
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Detect faces

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;

        detections.forEach(({ box }) => {
            console.log("Face detected:", box);
            // Adjust box x-coordinate since the video is mirrored
            const flippedX = canvas.width - (box.x + box.width);
            ctx.strokeRect(flippedX, box.y, box.width, box.height);
        });

        requestAnimationFrame(detect);
    }

    detect();
}

setupCamera().then(loadModels).then(startFaceDetection);
