# FocusFlow

FocusFlow is a lightweight Chrome extension that helps you stay focused while watching YouTube.

It hides distracting elements such as the video progress bar, sidebar, and comments so you can concentrate on the content instead of constantly checking how much time is left.

## Features

- Hide the YouTube progress bar and time display
- Hide the recommended videos sidebar
- Hide the comments section
- Enable or disable each distraction shield independently
- View your current video progress from the extension popup
- Display the current video title and remaining time
- Track local focus statistics and peek counts
- Focus score system with five focus levels
- Help guide built into the extension popup
- No analytics, advertisements, or external tracking
- Stores data locally in your browser

## Focus Score

FocusFlow uses a simple five-level focus score based on the number of recorded peeks:

| Peeks | Focus Level |
| --- | --- |
| 0–5 | Elite Focus |
| 6–10 | Steady Progress |
| 11–15 | Curious Learner |
| 16–20 | Focus Challenge |
| 21+ | Restless Mind |

The score is designed to encourage intentional viewing and reduce the habit of repeatedly checking the video timeline.

## Installation

### Install from the Chrome Web Store

You can install FocusFlow directly from the Chrome Web Store:

[Install FocusFlow](https://chromewebstore.google.com/detail/bmokhpcdehepdpacjlappndgaklegmin)

### Install manually from source

1. Download or clone this repository:

   ```bash
   git clone https://github.com/UjsGit/FocusFlow.git
   ```

2. Open Chrome and navigate to:

   ```text
   chrome://extensions
   ```

3. Enable **Developer mode** in the top-right corner.

4. Click **Load unpacked**.

5. Select the `extension` folder from this repository.

6. Open YouTube and click the FocusFlow icon in the Chrome toolbar.

## How to Use

1. Open a YouTube video.
2. Click the **FocusFlow** extension icon.
3. Turn on **Focus Mode** to hide the progress bar and time display.
4. Enable **Hide Sidebar** if you want to remove recommended videos.
5. Enable **Hide Comments** if you want to remove the comments section.
6. Open the extension popup whenever you want to view your current video progress and focus score.

Your selected settings are saved locally and reused on future YouTube pages.

## How It Works

FocusFlow is built as a Manifest V3 Chrome extension.

- `content.js` applies the selected settings to YouTube pages.
- `content-style.css` hides the progress bar, sidebar, live chat, and comments.
- `popup.html` provides the extension interface.
- `popup.js` manages settings, video statistics, and the focus score.
- `chrome.storage.local` stores settings and focus statistics locally in the browser.

The extension only runs on YouTube pages matching:

```text
https://www.youtube.com/*
```

## Project Structure

```text
FocusFlow/
├── extension/
│   ├── content.js              # YouTube page logic and local statistics
│   ├── content-style.css       # Styles used to hide distracting elements
│   ├── icon.png                # Extension icon
│   ├── manifest.json           # Chrome extension configuration
│   ├── popup.html              # Extension popup interface
│   └── popup.js                # Popup behavior and focus score logic
├── index.html                  # FocusFlow privacy policy page
├── LICENSE                    # MIT License
└── README.md                  # Project documentation
```

## Privacy

FocusFlow is designed with privacy in mind.

- No personal information is collected.
- No browsing history is sent to external servers.
- No analytics or tracking scripts are used.
- No advertisements are included.
- Focus settings and statistics are stored locally using Chrome's local storage.
- The extension only reads the YouTube video title and duration to display progress information.

Read the full privacy policy here:

[FocusFlow Privacy Policy](https://ujsgit.github.io/FocusFlow/)

## Permissions

FocusFlow uses the following Chrome permissions:

- `storage` — Saves settings and focus statistics locally.
- `activeTab` — Communicates with the active YouTube tab.
- `scripting` — Injects the extension scripts when required.

## Development

FocusFlow is built using standard web technologies:

- HTML
- CSS
- JavaScript
- Chrome Extensions Manifest V3

No build tools or package installation are required.

To make changes:

1. Edit the files inside the `extension` directory.
2. Open `chrome://extensions` in Chrome.
3. Click the **Reload** button for FocusFlow.
4. Refresh the YouTube tab to test your changes.

## Limitations

- FocusFlow currently supports YouTube in Google Chrome and Chromium-based browsers.
- YouTube UI changes may affect the selectors used to hide certain elements.
- Full historical statistics are planned for a future release.
- The extension must be reloaded from the extensions page after source code changes during development.

## Contributing

Contributions, suggestions, and bug reports are welcome.

If you find an issue:

1. Open an issue in this repository.
2. Describe the problem clearly.
3. Include your browser version and the affected YouTube page.
4. Add steps to reproduce the issue whenever possible.

