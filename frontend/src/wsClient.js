let socket = null;

export function connectChatSocket(url, onMessage, onOpen, onClose) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("WebSocket connected");
    onOpen && onOpen();
  };

  socket.onmessage = (event) => {
    onMessage && onMessage(JSON.parse(event.data));
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    onClose && onClose();
  };

  socket.onerror = (err) => {
    console.error("WebSocket error", err);
  };

  return socket;
}

export function sendChatMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}
