// content.js - EdgeLight Overlay
// Creates a bright border overlay on the page

let overlay = null;

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
        pointerEvents: 'none', // Allow clicking through the empty middle
        zIndex: '2147483647',   // Max z-index
        boxSizing: 'border-box',
        display: 'none'         // Hidden by default
    });
    document.documentElement.appendChild(overlay);
}

function updateOverlay(settings) {
    if (!overlay) createOverlay();

    if (!settings.enabled) {
        overlay.style.display = 'none';
        return;
    }

    overlay.style.display = 'block';

    // Calculate RGB from Temperature
    const color = getKelvinColor(settings.temperature || 5500);
    const opacity = (settings.intensity !== undefined ? settings.intensity : 50) / 100;
    const thickness = settings.thickness !== undefined ? settings.thickness : 20; // Default 20px

    // Border Style
    // We use a thick border.
    overlay.style.border = `${thickness}px solid ${color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)}`;
}

// Color Support
function getKelvinColor(k) {
    let r, g, b;
    k = k / 100;
    if (k <= 66) {
        r = 255;
    } else {
        r = k - 60;
        r = 329.698727446 * Math.pow(r, -0.1332047592);
        if (r < 0) r = 0; if (r > 255) r = 255;
    }
    if (k <= 66) {
        g = k;
        g = 99.4708025861 * Math.log(g) - 161.1195681661;
    } else {
        g = k - 60;
        g = 288.1221695283 * Math.pow(g, -0.0755148492);
    }
    if (g < 0) g = 0; if (g > 255) g = 255;
    if (k >= 66) {
        b = 255;
    } else {
        if (k <= 19) {
            b = 0;
        } else {
            b = k - 10;
            b = 138.5177312231 * Math.log(b) - 305.0447927307;
        }
    }
    if (b < 0) b = 0; if (b > 255) b = 255;
    return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
}

// Init
createOverlay();

// Listen
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        chrome.storage.local.get(['enabled', 'intensity', 'temperature', 'thickness'], (result) => {
            updateOverlay(result);
        });
    }
});

// Load initial
chrome.storage.local.get(['enabled', 'intensity', 'temperature', 'thickness'], (result) => {
    // Set defaults if new installs might miss them, though popup usually sets them logic handles undefined
    updateOverlay(result);
});
