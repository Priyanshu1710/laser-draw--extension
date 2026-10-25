// Alt+L toggles the laser on the current tab without opening the popup.
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "toggle-laser" || !tab?.id) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["laser.js"],
    });
  } catch (err) {
    // chrome://, the Web Store and similar pages don't allow script injection.
    console.warn("Laser Draw: cannot run on this page.", err);
  }
});
