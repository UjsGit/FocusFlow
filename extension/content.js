let currentVideoId = new URLSearchParams(window.location.search).get('v');

// ── 1. Apply stored state on page load ───────────────────────────────────────
chrome.storage.local.get(['focusMode', 'hideSidebar', 'hideComments'], (res) => {
    applyClasses(res);
});

// ── 2. Toggle CSS classes from state object ──────────────────────────────────
function applyClasses(state) {
    document.body.classList.toggle('ff-active',        state.focusMode     ?? true);
    document.body.classList.toggle('ff-hide-sidebar',  state.hideSidebar   ?? false);
    document.body.classList.toggle('ff-hide-comments', state.hideComments  ?? false);
}

// ── 3. Reset per-video peek counter when navigating to a new video ───────────
// Wrapped in try-catch: if the extension is reloaded while this tab is open,
// the context is invalidated and chrome.* calls throw. We clear the interval
// so dead ticks don't keep crashing silently in the background.
const _intervalId = setInterval(() => {
    try {
        const newVideoId = new URLSearchParams(window.location.search).get('v');
        if (newVideoId && newVideoId !== currentVideoId) {
            currentVideoId = newVideoId;
            chrome.storage.local.set({ impulseCount: 0 });
        }
    } catch (_) {
        clearInterval(_intervalId);
    }
}, 2000);

// ── 4. Message listener ──────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.type === 'UPDATE_UI') {
        applyClasses(msg.state);
        return; // No response needed
    }

    if (msg.type === 'GET_STATS') {
        const video = document.querySelector('video');
        if (!video || isNaN(video.duration)) {
            sendResponse(null);
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        chrome.storage.local.get(['history', 'impulseCount', 'totalLifetimePeeks'], (data) => {
            // Update daily heatmap history
            const history = data.history || {};
            history[today] = (history[today] || 0) + 1;

            // Increment peek counters
            const impulseCount      = (data.impulseCount       || 0) + 1;
            const totalLifetimePeeks = (data.totalLifetimePeeks || 0) + 1;

            chrome.storage.local.set({ history, impulseCount, totalLifetimePeeks });

            sendResponse({
                title:        document.title.replace('- YouTube', '').trim(),
                percent:      Math.round((video.currentTime / video.duration) * 100) || 0,
                timeLeft:     formatTime(video.duration - video.currentTime),
                impulseCount: impulseCount
            });
        });

        return true; // Keep message channel open for async storage call
    }
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}
