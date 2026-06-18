let isFocusMode = true;
let currentVideoId = new URLSearchParams(window.location.search).get('v');

// 1. Initial Load
chrome.storage.local.get(['focusMode', 'hideSidebar', 'hideComments'], (res) => {
    applyClasses(res);
});

function applyClasses(state) {
    document.body.classList.toggle('ff-active', state.focusMode ?? true);
    document.body.classList.toggle('ff-hide-sidebar', state.hideSidebar ?? false);
    document.body.classList.toggle('ff-hide-comments', state.hideComments ?? false);
}

// 2. URL Observer (Reset per-video peeks)
setInterval(() => {
    let newVideoId = new URLSearchParams(window.location.search).get('v');
    if (newVideoId && newVideoId !== currentVideoId) {
        currentVideoId = newVideoId;
        chrome.storage.local.set({ impulseCount: 0 });
    }
}, 2000);

// 3. Message Listener
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "UPDATE_UI") {
        applyClasses(msg.state);
    }
    
    if (msg.type === "GET_STATS") {
        const video = document.querySelector('video');
        if (video) {
            // 1. Get today's date for heatmap
            const today = new Date().toISOString().split('T')[0];

            chrome.storage.local.get(['history', 'impulseCount', 'totalLifetimePeeks'], (data) => {
                // 2. Update Heatmap History (Silent)
                let history = data.history || {};
                history[today] = (history[today] || 0) + 1;

                // 3. Update peek stats
                let currentPeeks = (data.impulseCount || 0) + 1;
                let lifetimePeeks = (data.totalLifetimePeeks || 0) + 1;
                
                chrome.storage.local.set({ 
                    history: history,
                    impulseCount: currentPeeks,
                    totalLifetimePeeks: lifetimePeeks 
                });

                // 4. Send everything back to Popup
                sendResponse({
                    title: document.title.replace("- YouTube", "").trim(),
                    percent: Math.round((video.currentTime / video.duration) * 100),
                    timeLeft: formatTime(video.duration - video.currentTime),
                    duration: video.duration // <--- This is the new part for relative scoring
                });
            });
            return true; // Keeps the message channel open for the async storage call
        }
    }
});

function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}