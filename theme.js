const savedTheme = localStorage.getItem("kaizen_theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("kaizen_theme", next);
  document.getElementById("themeBtn").textContent = next === "dark" ? "☀️ Light" : "🌙 Dark";
}