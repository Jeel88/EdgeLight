document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleExtension');
    const controlsArea = document.getElementById('controlsArea');
    const intensity = document.getElementById('intensity');
    const thickness = document.getElementById('thickness');
    const temperature = document.getElementById('temperature');

    // Labels
    const valIntensity = document.getElementById('val-intensity');
    const valThickness = document.getElementById('val-thickness');
    const valTemp = document.getElementById('val-temp');

    // Load saved settings
    chrome.storage.local.get(['enabled', 'intensity', 'temperature', 'thickness'], (result) => {
        toggle.checked = result.enabled !== false; // Default true
        intensity.value = result.intensity || 100;
        temperature.value = result.temperature || 5500;
        thickness.value = result.thickness || 50;

        updateUI();
    });

    // Event Listeners
    toggle.addEventListener('change', () => {
        saveSettings();
        updateUI();
    });

    [intensity, temperature, thickness].forEach(el => {
        el.addEventListener('input', () => {
            updateLabels();
            saveSettings();
        });
    });

    function updateLabels() {
        valIntensity.innerText = intensity.value + '%';
        valThickness.innerText = thickness.value + 'px';

        const temp = parseInt(temperature.value);
        if (temp < 4000) valTemp.innerText = 'Warm';
        else if (temp > 7000) valTemp.innerText = 'Cool';
        else valTemp.innerText = 'Neutral';
    }

    function saveSettings() {
        const settings = {
            enabled: toggle.checked,
            intensity: parseInt(intensity.value, 10),
            temperature: parseInt(temperature.value, 10),
            thickness: parseInt(thickness.value, 10)
        };
        chrome.storage.local.set(settings);
    }

    function updateUI() {
        if (toggle.checked) {
            controlsArea.classList.remove('disabled');
        } else {
            controlsArea.classList.add('disabled');
        }
        updateLabels();
    }
});
