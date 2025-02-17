let firstConnect = true;
const eventSource = new EventSource("/events");

eventSource.onopen = () => {
  if (!firstConnect) {
    console.log("Server reconnected, reloading...");
    window.location.reload();
  }
  firstConnect = false;
};

eventSource.onerror = () => {
  console.log("Lost connection to server, waiting for restart...");
  checkServer();  // Start polling for an instant reload
};

function checkServer() {
  fetch("/")
    .then(() => {
      console.log("Server restarted, reloading...");
      window.location.reload();
    })
    .catch(() => {
      setTimeout(checkServer, 500); // Check every 500ms
    });
}
