
const createButton = document.getElementById("createMeeting");
const joinButton = document.getElementById("joinMeeting");
const meetingInput = document.getElementById("meetingLink");
const message = document.getElementById("message");
const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.style.color =
    type === "success" ? "#81dcb9" : "#ffb9b9";
}

function createMeetingId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

createButton.addEventListener("click", async () => {
  if (!window.isSecureContext || !crypto.getRandomValues) {
    showMessage(
      "Please open MeetingX in a secure browser context."
    );
    return;
  }

  const meetingId = createMeetingId();

  // Prototype link only. A real shared meeting requires
  // a hosted app and a signaling service.
  const meetingUrl = new URL(window.location.href);
  meetingUrl.search = "";
  meetingUrl.hash = "";
  meetingUrl.searchParams.set("room", meetingId);

  try {
    await navigator.clipboard.writeText(meetingUrl.href);
    showMessage(
      "Prototype link copied. Real video calling is not connected yet.",
      "success"
    );
  } catch {
    meetingInput.value = meetingUrl.href;
    meetingInput.focus();
    meetingInput.select();

    showMessage(
      "Prototype link created. Copy it manually; video calling is not connected yet.",
      "success"
    );
  }
});

joinButton.addEventListener("click", () => {
  const value = meetingInput.value.trim();

  if (!value) {
    showMessage("Please paste a meeting link or room code.");
    meetingInput.focus();
    return;
  }

  let roomId = value;

  try {
    const url = new URL(value);

    roomId =
      url.searchParams.get("room") ||
      url.pathname.split("/").filter(Boolean).pop() ||
      "";
  } catch {
    // Treat the entered value as a possible room code.
  }

  if (!/^[a-f0-9]{32}$/i.test(roomId)) {
    showMessage("Please enter a valid MeetingX prototype link or room code.");
    return;
  }

  showMessage(
    "Room code recognized. Real video calling will be added in the next stage.",
    "success"
  );
});

meetingInput.addEventListener("input", () => {
  message.textContent = "";
});
