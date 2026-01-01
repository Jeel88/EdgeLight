document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleExtension');
    const controlsArea = document.getElementById('controlsArea');
    const intensity = document.getElementById('intensity');
    const temperature = document.getElementById('temperature');
    const thickness = document.getElementById('thickness');

    // Load saved settings
    chrome.storage.local.get(['enabled', 'intensity', 'temperature', 'thickness'], (result) => {
        toggle.checked = result.enabled !== false; // Default true
        intensity.value = result.intensity || 100;
        temperature.value = result.temperature || 5500;
        thickness.value = result.thickness || 50;

        updateControlsState();
    });

    // Event Listeners
    toggle.addEventListener('change', () => {
        saveSettings();
        updateControlsState();
    });

    intensity.addEventListener('input', saveSettings);
    temperature.addEventListener('input', saveSettings);
    thickness.addEventListener('input', saveSettings);

    function saveSettings() {
        const settings = {
            enabled: toggle.checked,
            intensity: parseInt(intensity.value, 10),
            temperature: parseInt(temperature.value, 10),
            thickness: parseInt(thickness.value, 10)
        };
        chrome.storage.local.set(settings);
    }

    function updateControlsState() {
        if (toggle.checked) {
            controlsArea.classList.remove('disabled');
        } else {
            controlsArea.classList.add('disabled');
        }
    }
});
