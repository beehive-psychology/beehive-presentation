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

  const featureOverlay = document.getElementById("featureOverlay");
  const featureTitle = document.getElementById("featureViewerTitle");
  const featureDescription = document.getElementById("featureViewerDescription");
  const featurePageTitle = document.getElementById("featurePageTitle");
  const featurePageDescription = document.getElementById("featurePageDescription");
  const featureDocumentImage = document.getElementById("featureDocumentImage");
  const featurePageCount = document.getElementById("featurePageCount");
  const featurePagePrev = document.getElementById("featurePagePrev");
  const featurePageNext = document.getElementById("featurePageNext");
  const featureClose = document.querySelector("[data-close-feature]");

  if (!stage || slides.length === 0) return;

  const total = slides.length;
  let current = 0;
  let touchStartX = null;
  let touchStartY = null;
  let activeFeature = null;
  let activeFeaturePage = 0;

  const featureContent = {
    laporan: {
      title: "Laporan Instan",
      description: "Pratinjau Laporan Sesi — 7 halaman presentasi.",
      pages: [
        { title: "Laporan Sesi", image: "assets/laporan-sesi-01.png" },
        { title: "Kepesertaan & Statistik Kecerdasan", image: "assets/laporan-sesi-02.png" },
        { title: "Sepuluh Besar IQ", image: "assets/laporan-sesi-03.png" },
        { title: "Sebaran Tipe Kepribadian", image: "assets/laporan-sesi-04.png" },
        { title: "Profil Peserta", image: "assets/laporan-sesi-05.png" },
        { title: "Rekap & Cetak: Unduh Excel dan Lihat Laporan", image: "assets/laporan-sesi-06.png" },
        { title: "Rekap & Cetak: Laporan Siswa dan Unduh PDF", image: "assets/laporan-sesi-07.png" }
      ],
      alt: "Halaman contoh Laporan Sesi"
    },
    rekap: {
      title: "Rekap & Cetak",
      description: "Pratinjau Contoh Laporan SMA — 7 halaman PDF.",
      pages: [
        { title: "Contoh Laporan SMA · Halaman 1", image: "assets/rekap-01.png" },
        { title: "Contoh Laporan SMA · Halaman 2", image: "assets/rekap-02.png" },
        { title: "Contoh Laporan SMA · Halaman 3", image: "assets/rekap-03.png" },
        { title: "Contoh Laporan SMA · Halaman 4", image: "assets/rekap-04.png" },
        { title: "Contoh Laporan SMA · Halaman 5", image: "assets/rekap-05.png" },
        { title: "Contoh Laporan SMA · Halaman 6", image: "assets/rekap-06.png" },
        { title: "Contoh Laporan SMA · Halaman 7", image: "assets/rekap-07.png" }
      ],
      alt: "Halaman contoh laporan SMA"
    }
  };

  const pad = (value) => String(value).padStart(2, "0");

  function indexFromHash() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (!match) return -1;

    const index = Number(match[1]) - 1;
    return index >= 0 && index < total ? index : -1;
  }

  function goTo(index, updateHash = true) {
    if (activeFeature) closeFeature();

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

  function renderFeaturePage() {
    if (!activeFeature || !featureOverlay) return;

    const feature = featureContent[activeFeature];
    const pageTotal = feature.pages.length;

    const page = feature.pages[activeFeaturePage];
    featureTitle.textContent = feature.title;
    featureDescription.textContent = feature.description;
    featurePageTitle.textContent = page.title;
    featurePageDescription.textContent = `Halaman ${activeFeaturePage + 1} dari ${pageTotal}`;
    featureDocumentImage.src = page.image;
    featureDocumentImage.alt = `${feature.alt}, ${page.title}`;
    featurePageCount.textContent = `${pad(activeFeaturePage + 1)} / ${pad(pageTotal)}`;

    featurePagePrev.disabled = activeFeaturePage === 0;
    featurePageNext.disabled = activeFeaturePage === pageTotal - 1;
  }

  function openFeature(name) {
    if (!featureContent[name] || !featureOverlay || current !== 9) return;

    activeFeature = name;
    activeFeaturePage = 0;
    renderFeaturePage();

    featureOverlay.hidden = false;
    featureOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("feature-view-open");
    featureClose?.focus();
  }

  function closeFeature() {
    if (!featureOverlay || !activeFeature) return;

    const previousFeature = activeFeature;
    activeFeature = null;
    featureOverlay.hidden = true;
    featureOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("feature-view-open");

    document.querySelector(`[data-open-feature="${previousFeature}"]`)?.focus();
  }

  function changeFeaturePage(direction) {
    if (!activeFeature) return;

    const pages = featureContent[activeFeature].pages;
    activeFeaturePage = Math.max(0, Math.min(pages.length - 1, activeFeaturePage + direction));
    renderFeaturePage();
  }

  /* ---------------- navigation ---------------- */

  prevButton?.addEventListener("click", previous);
  nextButton?.addEventListener("click", next);

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-feature]");
    if (trigger) openFeature(trigger.dataset.openFeature);
  });

  featureClose?.addEventListener("click", closeFeature);
  featurePagePrev?.addEventListener("click", () => changeFeaturePage(-1));
  featurePageNext?.addEventListener("click", () => changeFeaturePage(1));

  document.addEventListener("keydown", (event) => {
    if (activeFeature) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFeature();
      } else if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        changeFeaturePage(1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        changeFeaturePage(-1);
      }
      return;
    }

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
    if (event.pointerType === "mouse" || activeFeature) return;
    touchStartX = event.clientX;
    touchStartY = event.clientY;
  });

  stage.addEventListener("pointerup", (event) => {
    if (activeFeature || touchStartX === null || touchStartY === null) return;

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

  console.log(`Beehive Presentation ready · ${total} slides`);
  console.log("Bee True. Bee You.");
})();
