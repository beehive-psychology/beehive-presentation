/* ============================================================
   BEEHIVE × MUHAMMADIYAH — PRESENTATION CONTROLLER
   ============================================================ */

(() => {
  "use strict";

  const stage = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const navCount = document.getElementById("navCount");
  const progressBar = document.getElementById("progressBar");
  const prevButton = document.querySelector("[data-prev]");
  const nextButton = document.querySelector("[data-next]");

  if (!stage || slides.length === 0) return;

  const total = slides.length;
  let current = 0;
  let touchStartX = null;
  let touchStartY = null;

  const pad = (value) => String(value).padStart(2, "0");

  function indexFromHash() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (!match) return -1;

    const index = Number(match[1]) - 1;
    return index >= 0 && index < total ? index : -1;
  }

  function goTo(index, updateHash = true) {
    const next = Math.max(0, Math.min(total - 1, index));

    slides.forEach((slide, i) => {
      const isActive = i === next;
      slide.classList.toggle("active", isActive);
      slide.hidden = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    current = next;

    if (navCount) navCount.textContent = `[${pad(current + 1)}-${pad(total)}]`;

    if (progressBar) {
      progressBar.style.width = `${((current + 1) / total) * 100}%`;
    }

    prevButton?.toggleAttribute("disabled", current === 0);
    nextButton?.toggleAttribute("disabled", current === total - 1);

    if (updateHash) {
      const hash = `#slide-${current + 1}`;
      if (window.location.hash !== hash) {
        try {
          history.replaceState(null, "", hash);
        } catch {
          /* file:// previews may block history updates */
        }
      }
    }
  }

  function next() {
    if (current < total - 1) goTo(current + 1);
  }

  function previous() {
    if (current > 0) goTo(current - 1);
  }

  function fitStage() {
    const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    document.documentElement.style.setProperty("--scale", String(scale));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  /* ---------------- navigation ---------------- */

  prevButton?.addEventListener("click", previous);
  nextButton?.addEventListener("click", next);

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
      case " ":
        event.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        event.preventDefault();
        previous();
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        break;
      case "End":
        event.preventDefault();
        goTo(total - 1);
        break;
      case "f":
      case "F":
        event.preventDefault();
        toggleFullscreen();
        break;
      default:
        break;
    }
  });

  /* ---------------- touch / swipe ---------------- */

  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    touchStartX = event.clientX;
    touchStartY = event.clientY;
  });

  stage.addEventListener("pointerup", (event) => {
    if (touchStartX === null || touchStartY === null) return;

    const deltaX = event.clientX - touchStartX;
    const deltaY = event.clientY - touchStartY;

    touchStartX = null;
    touchStartY = null;

    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) next();
      else previous();
    }
  });

  /* ---------------- deep links ---------------- */

  window.addEventListener("hashchange", () => {
    const index = indexFromHash();
    if (index >= 0 && index !== current) goTo(index, false);
  });

  window.addEventListener("resize", fitStage);
  window.visualViewport?.addEventListener("resize", fitStage);

  /* ---------------- boot ---------------- */

  fitStage();

  const initial = indexFromHash();
  if (initial > 0) {
    goTo(initial, false);
  } else {
    goTo(0, false);
  }

  console.log("Beehive Presentation ready · 18 slides");
  console.log("Bee True. Bee You.");
})();
