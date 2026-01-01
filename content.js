// content.js - EdgeLight Overlay
// Creates a bright border overlay on the page

let overlay = null;
let cameraActive = false;
let extensionEnabled = true;
let hoverDim = false; // Is mouse over the border?

// 1. Inject Detection Script (injected.js)
function injectScript(file) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}

try {
    injectScript('injected.js');
} catch (e) {
    console.log("EdgeLight: Injection failed. Manual mode may be limited.", e);
}

// 2. Listen for Camera State (from injected.js)
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'EDGELIGHT_CAMERA_STATE') {
        cameraActive = event.data.active;
        refreshOverlayState();
    }
});

// 3. Mouse Tracking for Smart Hover
window.addEventListener('mousemove', (e) => {
    if (!cameraActive || !extensionEnabled) return;

    chrome.storage.local.get(['thickness'], (result) => {
        const thickness = result.thickness || 50;
        const x = e.clientX;
        const y = e.clientY;
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Check if within 'thickness' of any edge
        const nearEdge = (x < thickness) || (x > w - thickness) || (y < thickness) || (y > h - thickness);

        if (nearEdge !== hoverDim) {
            hoverDim = nearEdge;
            refreshOverlayState();
        }
    });
});

// 4. Overlay Logic
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
        transition: 'opacity 0.4s ease-out', // Slightly faster response
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

            // If hovering, dim drastically to allow visibility
            const targetOpacity = hoverDim ? '0.1' : '1';

            updateOverlayStyle(settings);

            requestAnimationFrame(() => {
                overlay.style.opacity = targetOpacity;
            });
        } else {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (!cameraActive || !extensionEnabled) overlay.style.display = 'none';
            }, 400);
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
    const innerRadius = 18;
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
