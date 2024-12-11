export const formatMessageDate = (dateString) => {
  const messageDate = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Función auxiliar para formatear hora
  const formatTime = (date) => {
    return date
      .toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  // Si es hoy
  if (messageDate.toDateString() === now.toDateString()) {
    return formatTime(messageDate);
  }

  // Si es ayer
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  }

  // Si es de este año
  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }

  // Si es de años anteriores
  return messageDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
