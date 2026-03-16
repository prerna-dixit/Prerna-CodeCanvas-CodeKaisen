const quotes = [
  "Small daily improvements lead to massive results.",
  "The journey of a thousand miles begins with a single step.",
  "Discipline is choosing between what you want now and what you want most.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Consistency beats intensity.",
];
document.getElementById("quote").textContent =
  quotes[Math.floor(Math.random() * quotes.length)];

const mascotUrl = localStorage.getItem("kaizen_mascot_url");
if (mascotUrl) {
  document.getElementById("mascotLeft").innerHTML =
    `<img src="${mascotUrl}" class="mascot-img" alt="mascot" />`;
}

const VIBRANT_COLORS = [
  "#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#ef4444", "#3b82f6", "#84cc16",
];

requireAuth(async (user) => {
  document.getElementById("userInfo").textContent = user.displayName || user.email;
  document.getElementById("greeting").textContent =
    `Hello, ${(user.displayName || "there").split(" ")[0]}! 👋`;

  try {
    const streakData = await apiFetch(`/api/users/${user.uid}/streak`, { method: "PUT" });
    document.getElementById("streak").textContent = streakData.streak || 0;
  } catch (_) {
    try {
      const userData = await fetch(`/api/users/${user.uid}`).then(r => r.json());
      document.getElementById("streak").textContent = userData.streak || 0;
    } catch (_) {}
  }
});