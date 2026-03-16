// dashboard.js
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

// defaults if backend fails
function setDefaults() {
  document.getElementById("userInfo").textContent = "";
  document.getElementById("greeting").textContent = "Hello! 👋";
  document.getElementById("streak").textContent = "–";
  document.getElementById("progressDots").textContent = "No habits yet. Add some on the Activity page!";
  loadMascotMood();
  updateFireStreak(0);
}

function updateHPBar(pct) {
  const bar   = document.getElementById("hpBarInner");
  const label = document.getElementById("hpLabel");
  if (!bar) return;

  bar.style.width = pct + "%";
  label.textContent = Math.round(pct) + "%";

  if (pct >= 70)      bar.style.background = "#27ae60";
  else if (pct >= 40) bar.style.background = "#f39c12";
  else                bar.style.background = "#e74c3c";
}

function updateFireStreak(streak) {
  const fireWrap = document.getElementById("fireWrap");
  if (!fireWrap) return;
  if (streak > 0) {
    fireWrap.classList.remove("hidden");
  } else {
    fireWrap.classList.add("hidden");
  }
}

function setMascotEmotion(pct) {
  const img   = document.getElementById("emotionMascot");
  const label = document.getElementById("emotionLabel");
  if (!img || !label) return;

  // fade out, swap, fade in
  img.style.opacity = "0";
  setTimeout(() => {
    if (pct === null) {
      img.src = "images/mascot-tired.png";
      label.textContent = "No data yet";
    } else if (pct >= 70) {
      img.src = "images/mascot-happy.png";
      label.textContent = "Amazing!";
    } else if (pct >= 40) {
      img.src = "images/mascot-bored.png";
      label.textContent = "Keep going";
    } else if (pct > 0) {
      img.src = "images/mascot-sad.png";
      label.textContent = "You can do it";
    } else {
      img.src = "images/mascot-tired.png";
      label.textContent = "No data yet";
    }
    img.style.opacity = "1";
  }, 300);
}

async function loadMascotMood() {
  try {
    const data = await apiFetch("/api/analytics/today");
    const progress = data.progress || [];
    if (!progress.length) { setMascotEmotion(null); return; }
    const totalTarget = progress.reduce((sum, h) => sum + (h.target || 0), 0);
    const totalSpent  = progress.reduce((sum, h) => sum + (h.spent  || 0), 0);
    const pct = totalTarget > 0 ? Math.min((totalSpent / totalTarget) * 100, 100) : 0;
    setMascotEmotion(pct);
  } catch (_) {
    setMascotEmotion(null);
  }
}

loadMascotMood();

if (typeof requireAuth === "function") {
  requireAuth(async (user) => {
    document.getElementById("userInfo").textContent = user.displayName || user.email;
    document.getElementById("greeting").textContent =
      `Hello, ${(user.displayName || "there").split(" ")[0]}! 👋`;

    // Streak
    try {
      const streakData = await apiFetch(`/api/users/${user.uid}/streak`, { method: "PUT" });
      document.getElementById("streak").textContent = streakData.streak || 0;
    } catch (_) {
    document.getElementById("streak").textContent = streakData.streak || 0;
    updateFireStreak(streakData.streak || 0);
    }

    // Mascot mood
    await loadMascotMood();

// Today's progress + HP bar
  try {
    const data = await apiFetch("/api/analytics/today");
    const dotsEl = document.getElementById("progressDots");
    if (!data.progress.length) {
      dotsEl.textContent = "No habits yet. Add some on the Activity page!";
      updateHPBar(0);
    } else {
      const totalTarget = data.progress.reduce((sum, h) => sum + (h.target || 0), 0);
      const totalSpent  = data.progress.reduce((sum, h) => sum + (h.spent  || 0), 0);
      const pct = totalTarget > 0 ? Math.min((totalSpent / totalTarget) * 100, 100) : 0;
      updateHPBar(pct);
      dotsEl.innerHTML = data.progress.map(h => {
        const p = h.target > 0 ? Math.min((h.spent / h.target) * 100, 100) : 0;
        return `<div class="progress-item">
          <span class="progress-dot dot-${h.status}"></span>
          <strong>${h.name}</strong>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill fill-${h.status}" style="width:${p}%"></div>
          </div>
          <span style="font-size:0.85em;">${h.spent}/${h.target} min</span>
        </div>`;
      }).join("");
    }
  } catch (_) {
    document.getElementById("progressDots").textContent = "Could not load progress.";
    updateHPBar(0);
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
} else {
  // auth not available, show defaults
  setDefaults();
}