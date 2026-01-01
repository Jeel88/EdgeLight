// injected.js - Camera Detector
// Detects when the camera is turned on/off

(function () {
    const ORIGINAL_GUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

    function notifyCameraState(active) {
        console.log("EdgeLight: Camera State ->", active);
        window.postMessage({
            type: 'EDGELIGHT_CAMERA_STATE',
            active: active
        }, '*');
    }

    navigator.mediaDevices.getUserMedia = async function (constraints) {
        console.log("EdgeLight: getUserMedia called", constraints);
        try {
            const stream = await ORIGINAL_GUM(constraints);

            // Check for video tracks
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                notifyCameraState(true);

                videoTracks.forEach(track => {
                    track.addEventListener('ended', () => {
                        console.log("EdgeLight: Track ended");
                        // Check if any other tracks are still live
                        if (stream.active && stream.getVideoTracks().some(t => t.readyState === 'live')) {
                            return;
                        }
                        notifyCameraState(false);
                    });
                });
            }
            return stream;
        } catch (err) {
            console.error("EdgeLight: getUserMedia error", err);
            throw err;
        }
    };

    console.log("EdgeLight: Camera Detector Active (Hooked getUserMedia)");
})();
