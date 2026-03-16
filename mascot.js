function setMascotEmotion(pct) {
  const img   = document.getElementById("emotionMascot");
  const label = document.getElementById("emotionLabel");
  if (!img || !label) return;

  if (pct === null) {
    img.src          = "images/mascot-tired.png";
    label.textContent = "No data yet";
    return;
  }
  if (pct >= 70) {
    img.src          = "images/mascot-happy.png";
    label.textContent = "Amazing!";
  } else if (pct >= 40) {
    img.src          = "images/mascot-bored.png";
    label.textContent = "Keep going";
  } else if (pct > 0) {
    img.src          = "images/mascot-sad.png";
    label.textContent = "You can do it";
  } else {
    img.src          = "images/mascot-tired.png";
    label.textContent = "No data yet";
  }
}

async function loadMascotMood() {
  try {
    const data = await apiFetch("/api/analytics/today");
    const progress = data.progress || [];
    if (!progress.length) { setMascotEmotion(null); return; }
    const totalTarget  = progress.reduce((sum, h) => sum + (h.target || 0), 0);
    const totalSpent   = progress.reduce((sum, h) => sum + (h.spent  || 0), 0);
    const pct = totalTarget > 0 ? Math.min((totalSpent / totalTarget) * 100, 100) : 0;
    setMascotEmotion(pct);
  } catch (_) {
    setMascotEmotion(null);
  }
}

loadMascotMood();