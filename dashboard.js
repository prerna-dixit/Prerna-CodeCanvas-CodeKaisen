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

  // Streak
  try {
    const streakData = await apiFetch(`/api/users/${user.uid}/streak`, { method: "PUT" });
    document.getElementById("streak").textContent = streakData.streak || 0;
  } catch (_) {
    try {
      const userData = await fetch(`/api/users/${user.uid}`).then(r => r.json());
      document.getElementById("streak").textContent = userData.streak || 0;
    } catch (_) {}
  }

  // Mascot mood
  await loadMascotMood();

  // Today's progress
  try {
    const data = await apiFetch("/api/analytics/today");
    const dotsEl = document.getElementById("progressDots");
    if (!data.progress.length) {
      dotsEl.textContent = "No habits yet. Add some on the Activity page!";
    } else {
      dotsEl.innerHTML = data.progress.map(h => {
        const pct = h.target > 0 ? Math.min((h.spent / h.target) * 100, 100) : 0;
        return `<div class="progress-item">
          <span class="progress-dot dot-${h.status}"></span>
          <strong>${h.name}</strong>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill fill-${h.status}" style="width:${pct}%"></div>
          </div>
          <span style="font-size:0.85em; color:#666;">${h.spent}/${h.target} min</span>
        </div>`;
      }).join("");
    }
  } catch (e) {
    document.getElementById("progressDots").textContent = "Could not load progress.";
  }

  // Doughnut chart
  try {
    const dist = await apiFetch("/api/analytics/distribution");
    if (dist.length) {
      new Chart(document.getElementById("pieChart"), {
        type: "doughnut",
        data: {
          labels: dist.map(d => d.habit),
          datasets: [{
            data: dist.map(d => d.minutes),
            backgroundColor: VIBRANT_COLORS.slice(0, dist.length),
            borderWidth: 2,
            borderColor: "#fff",
          }],
        },
        options: {
          plugins: {
            legend: { position: "bottom", labels: { padding: 12, usePointStyle: true } },
            tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} min` } },
          },
        },
      });
    }
  } catch (_) {}

  // Bar chart
  try {
    const weekly = await apiFetch("/api/analytics/weekly");
    if (weekly.length) {
      new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
          labels: weekly.map(d => d.date.slice(5)),
          datasets: [{
            label: "Score %",
            data: weekly.map(d => d.score),
            backgroundColor: weekly.map(d =>
              d.score >= 70 ? "#27ae60" : d.score >= 40 ? "#f39c12" : "#e74c3c"
            ),
            borderRadius: 4,
          }],
        },
        options: {
          scales: {
            y: { min: 0, max: 100, grid: { color: "#f0f0f0" } },
            x: { grid: { display: false } },
          },
          plugins: { legend: { display: false } },
        },
      });
    }
  } catch (_) {}

});