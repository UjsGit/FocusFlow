document.addEventListener('DOMContentLoaded', () => {
    const mainToggle     = document.getElementById('mainToggle');
    const sidebarToggle  = document.getElementById('sidebarToggle');
    const commentsToggle = document.getElementById('commentsToggle');
    const scoreLabel     = document.getElementById('statusLabel');
    const helpBtn        = document.getElementById('helpBtn');
    const guide          = document.getElementById('guide');

    // ── 1. Load stored state on open ─────────────────────────────────────────
    chrome.storage.local.get(['focusMode', 'hideSidebar', 'hideComments', 'impulseCount'], (res) => {
        mainToggle.checked     = res.focusMode    ?? true;
        sidebarToggle.checked  = res.hideSidebar  ?? false;
        commentsToggle.checked = res.hideComments ?? false;
        updateScoreLabel(res.impulseCount || 0);
    });

    // ── 2. Help guide toggle ─────────────────────────────────────────────────
    helpBtn.onclick = () => {
        guide.style.display = guide.style.display === 'block' ? 'none' : 'block';
    };

    // ── 3. Toggle handlers — save state and notify content script ────────────
    function sendState() {
        const state = {
            focusMode:    mainToggle.checked,
            hideSidebar:  sidebarToggle.checked,
            hideComments: commentsToggle.checked
        };
        chrome.storage.local.set(state);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                // Reading lastError in callback suppresses "Unchecked" warning
                chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_UI', state }, () => {
                    void chrome.runtime.lastError;
                });
            }
        });
    }

    mainToggle.onchange     = sendState;
    sidebarToggle.onchange  = sendState;
    commentsToggle.onchange = sendState;

    // ── 4. Fetch video stats (counts as a peek) ──────────────────────────────
    // Strategy: try the already-running content script first. If no response,
    // the tab was open before the extension loaded — inject the script, then retry.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0] || !tabs[0].url.includes('youtube.com/watch')) {
            document.getElementById('vidTitle').innerText = 'No video detected';
            return;
        }

        const tabId = tabs[0].id;

        chrome.tabs.sendMessage(tabId, { type: 'GET_STATS' }, (response) => {
            void chrome.runtime.lastError;

            if (response) {
                applyStatsToUI(response);
                return;
            }

            // No response = content script not yet injected into this tab.
            // Use the scripting API to inject it on-demand, then retry once.
            chrome.scripting.executeScript(
                { target: { tabId }, files: ['content.js'] },
                () => {
                    void chrome.runtime.lastError;
                    chrome.scripting.insertCSS(
                        { target: { tabId }, files: ['content-style.css'] },
                        () => {
                            void chrome.runtime.lastError;
                            // Small delay so the injected script can initialise
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tabId, { type: 'GET_STATS' }, (retry) => {
                                    void chrome.runtime.lastError;
                                    if (retry) {
                                        applyStatsToUI(retry);
                                    } else {
                                        // Genuine failure — tell user to reload
                                        document.getElementById('vidTitle').innerText = 'Reload tab to activate';
                                        document.getElementById('timeLeft').innerText = '';
                                    }
                                });
                            }, 300);
                        }
                    );
                }
            );
        });
    });

    // ── Shared UI updater for stats response ─────────────────────────────────
    function applyStatsToUI(response) {
        document.getElementById('vidTitle').innerText     = response.title   || 'Unknown';
        document.getElementById('timeLeft').innerText     = response.timeLeft + ' remaining';
        document.getElementById('popupPercent').innerText = response.percent  + '%';

        const circumference = 150.8;
        const offset = circumference - (response.percent / 100) * circumference;
        document.getElementById('popupCircle').style.strokeDashoffset = offset;

        updateScoreLabel(response.impulseCount);
    }

    // ── 5. 5-Tier Focus Score ────────────────────────────────────────────────
    function updateScoreLabel(count) {
        const tiers = [
            { max: 5,        label: 'Elite Focus',     color: '#3ea6ff' }, // Blue
            { max: 10,       label: 'Steady Progress', color: '#2ba640' }, // Green
            { max: 15,       label: 'Curious Learner', color: '#ffcc00' }, // Yellow
            { max: 20,       label: 'Focus Challenge', color: '#ff8c00' }, // Orange
            { max: Infinity, label: 'Restless Mind',   color: '#ff8989' }  // Red
        ];
        const tier = tiers.find(t => count <= t.max);
        scoreLabel.innerText   = `Focus Score: ${tier.label} (${count} peeks)`;
        scoreLabel.style.color = tier.color;
    }
});
