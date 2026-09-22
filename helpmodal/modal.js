async function openHelpModal() {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");

  // help.html を読み込む
  const res = await fetch("help.html");
  const html = await res.text();

  content.innerHTML = html;
  overlay.style.display = "flex";
}

function closeHelpModal() {
  document.getElementById("modalOverlay").style.display = "none";
}
