// content.js - EdgeLight Overlay
// Creates a bright border overlay on the page

let overlay = null;
let cameraActive = false;
let extensionEnabled = true;

// 1. Inject Detection Script (injected.js)
function injectScript(file) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
    // console.log("EdgeLight: injected.js script tag added");
}

try {
    injectScript('injected.js');
} catch (e) {
    console.log("EdgeLight: Injection failed. Manual mode may be limited.", e);
}

// 2. Listen for Camera State (from injected.js)
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'EDGELIGHT_CAMERA_STATE') {
        // console.log("EdgeLight: Camera state ->", event.data.active);
        cameraActive = event.data.active;
        refreshOverlayState();
    }
});

// 3. Overlay Logic
function createOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'edgelight-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '2147483647',
        boxSizing: 'border-box',
        display: 'none',
        transition: 'opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)', // Apple-like smooth input
        opacity: '0'
    });
    document.documentElement.appendChild(overlay);
}

function refreshOverlayState() {
    if (!overlay) createOverlay();

    chrome.storage.local.get(['enabled', 'intensity', 'temperature', 'thickness'], (settings) => {
        extensionEnabled = settings.enabled !== false;

        const shouldShow = extensionEnabled && cameraActive;

        if (shouldShow) {
            overlay.style.display = 'block';
            // Update style before fading in
            updateOverlayStyle(settings);

            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
        } else {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (!cameraActive || !extensionEnabled) overlay.style.display = 'none';
            }, 600);
        }
    });
}

function updateOverlayStyle(settings) {
    if (!overlay) return;

    const color = getKelvinColor(settings.temperature || 5500);
    const opacity = (settings.intensity !== undefined ? settings.intensity : 100) / 100;
    const thickness = settings.thickness !== undefined ? settings.thickness : 20;

    // Mac Style Constants
    // Fixed INNER radius to keep the sleek look.
    // Formula: OuterRadius = InnerRadius + Thickness
    const innerRadius = 24;
    const outerRadius = innerRadius + thickness;

    overlay.style.borderRadius = `${outerRadius}px`;
    overlay.style.border = `${thickness}px solid ${color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)}`;
}

// Color Support
function getKelvinColor(k) {
    let r, g, b;
    k = k / 100;
    if (k <= 66) { r = 255; } else { r = k - 60; r = 329.698727446 * Math.pow(r, -0.1332047592); if (r < 0) r = 0; if (r > 255) r = 255; }
    if (k <= 66) { g = k; g = 99.4708025861 * Math.log(g) - 161.1195681661; } else { g = k - 60; g = 288.1221695283 * Math.pow(g, -0.0755148492); }
    if (g < 0) g = 0; if (g > 255) g = 255;
    if (k >= 66) { b = 255; } else { if (k <= 19) { b = 0; } else { b = k - 10; b = 138.5177312231 * Math.log(b) - 305.0447927307; } }
    if (b < 0) b = 0; if (b > 255) b = 255;
    return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
}

// Init
createOverlay();

// Listen
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        refreshOverlayState();
    }
});
