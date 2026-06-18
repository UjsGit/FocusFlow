document.addEventListener('DOMContentLoaded', () => {
    const mainToggle = document.getElementById('mainToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const commentsToggle = document.getElementById('commentsToggle');
    const scoreLabel = document.getElementById('statusLabel');
    const helpBtn = document.getElementById('helpBtn');
    const guide = document.getElementById('guide');

    // 1. Load Initial UI State
    chrome.storage.local.get(['focusMode', 'hideSidebar', 'hideComments', 'impulseCount'], (res) => {
        mainToggle.checked = res.focusMode ?? true;
        sidebarToggle.checked = res.hideSidebar ?? false;
        commentsToggle.checked = res.hideComments ?? false;
        
        const count = res.impulseCount || 0;
        scoreLabel.innerText = count > 5 ? `Focus Score: Weak (${count} peeks)` : `Focus Score: Strong (${count} peeks)`;
        scoreLabel.style.color = count > 5 ? "#ff8989" : "#3ea6ff";
    });

    // 2. Help Guide Toggle
    helpBtn.onclick = () => {
        guide.style.display = guide.style.display === 'block' ? 'none' : 'block';
    };

    // 3. Update States
    function updateState() {
        const state = {
            focusMode: mainToggle.checked,
            hideSidebar: sidebarToggle.checked,
            hideComments: commentsToggle.checked
        };
        chrome.storage.local.set(state);
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_UI", state: state });
        });
    }

    mainToggle.onchange = updateState;
    sidebarToggle.onchange = updateState;
    commentsToggle.onchange = updateState;

    // 4. Get Video Stats
    // 4. GET VIDEO DATA & STATIC SCORE
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]?.url.includes('youtube.com/watch')) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "GET_STATS"}, (response) => {
                if (response) {
                    // Update UI
                    document.getElementById('vidTitle').innerText = response.title;
                    document.getElementById('timeLeft').innerText = response.timeLeft + " remaining";
                    document.getElementById('popupPercent').innerText = response.percent + "%";

                    // Update Circle
                    const circumference = 150.8;
                    const offset = circumference - (response.percent / 100) * circumference;
                    document.getElementById('popupCircle').style.strokeDashoffset = offset;

                    // STATIC SCORE LOGIC (The 5-Peek Rule)
                    // --- 5-TIER FOCUS SPECTRUM LOGIC ---
                    chrome.storage.local.get(['impulseCount'], (res) => {
                        const count = res.impulseCount || 0;
                        const scoreLabel = document.getElementById('statusLabel');
                        
                        if (count <= 5) {
                            scoreLabel.innerText = `Focus Score: Elite Focus (${count} peeks)`;
                            scoreLabel.style.color = "#3ea6ff"; // Blue
                        } 
                        else if (count <= 10) {
                            scoreLabel.innerText = `Focus Score: Steady Progress (${count} peeks)`;
                            scoreLabel.style.color = "#2ba640"; // Green
                        } 
                        else if (count <= 15) {
                            scoreLabel.innerText = `Focus Score: Curious Learner (${count} peeks)`;
                            scoreLabel.style.color = "#ffcc00"; // Yellow
                        }
                        else if (count <= 20) {
                            scoreLabel.innerText = `Focus Score: Focus Challenge (${count} peeks)`;
                            scoreLabel.style.color = "#ff8c00"; // Orange
                        }
                        else {
                            scoreLabel.innerText = `Focus Score: Restless Mind (${count} peeks)`;
                            scoreLabel.style.color = "#ff8989"; // Soft Red
                        }
                    });
                }
            });
        } else {
            document.getElementById('vidTitle').innerText = "No video detected";
        }
    });

    // Statistics page is disabled for v1.0
// document.querySelector('.footer').onclick = () => chrome.tabs.create({ url: 'stats.html' });
});