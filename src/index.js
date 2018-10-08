const gaEventsToTrack = [];
let isRequestIdleCallbackScheduled = false;

function trackGaInBackground() {
  // wenn schon ein callback gescheduled ist, dann returnen wir einfach
  if (isRequestIdleCallbackScheduled) return;
  isRequestIdleCallbackScheduled = true;

  if ("requestIdleCallback" in window) {
    requestIdleCallback(sendPendingEventsToGa);
  } else {
    // falls rIC nicht implementiert
    // callen wir sofort
    // können wir auch in timeout packen
    sendPendingEventsToGa();
  }
}

function sendPendingEventsToGa(deadline) {
  isRequestIdleCallbackScheduled = false;

  // wenn rIC nicht definiert ist, dann ist auch keine deadline übergeben worden
  // um das zu handlen wir das deadline hinzugefügt
  if (typeof deadline === "undefined") {
    deadline = {
      timeRemaining: () => Number.MAX_VALUE
    };
  }

  while (deadline.timeRemaining() > 0 && gaEventsToTrack.length > 0) {
    // send stuff to GA
    const event = gaEventsToTrack.pop();
    console.log(event.name);
    console.log(deadline.timeRemaining());
  }

  // wenn nicht alle events innerhalb der deadline abgearbeitet wurden
  // starten wir von vorne
  if (gaEventsToTrack.length > 0) {
    console.log("NOT DONE!");
    trackGaInBackground();
  }
}

// Test funktionen um zu verdeutlichen wie idle callbacks funktionieren
// wenn main thread mit user code geblockt
(() => {
  const fn = () => console.log("!! interval !!");
  const interval = setInterval(fn, 1);
  setTimeout(() => console.log("!! timeout !!"));
  setTimeout(() => clearInterval(interval), 300);
})();

// Events werden in unser Event Array gepumpt und backgroundtracking aktiviert
(() => {
  for (let i = 0; i < 100; i++) {
    gaEventsToTrack.push({ name: "event" + i });
  }
  trackGaInBackground();
})();

// Test funktionen um zu verdeutlichen wie idle callbacks funktionieren
// wenn main thread mit user code geblockt
(() => {
  let count = 0;
  while (count < 100) {
    console.log(count);
    count++;
  }
})();
