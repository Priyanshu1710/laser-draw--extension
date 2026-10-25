const button = document.getElementById("toggle");
const status = document.getElementById("status");

const render = (isOn) => {
  button.textContent = isOn ? "Turn laser off" : "Turn laser on";
  button.classList.toggle("active", isOn);
};

const showBlocked = () => {
  button.disabled = true;
  status.textContent =
    "Chrome doesn't allow extensions on this page. Open a normal website and try again.";
};

const init = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return showBlocked();

  const isLaserOn = async () => {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => Boolean(window.__laserDrawStop),
    });
    return result.result;
  };

  try {
    render(await isLaserOn());
  } catch {
    return showBlocked();
  }

  button.addEventListener("click", async () => {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["laser.js"],
    });
    const isOn = await isLaserOn();
    render(isOn);
    if (isOn) window.close(); // get the popup out of the way so you can point
  });
};

init();
