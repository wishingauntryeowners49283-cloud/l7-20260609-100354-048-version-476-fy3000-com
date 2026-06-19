(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function filterInScope(scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var category = scope.querySelector("[data-filter-category]");
    var cards = scope.querySelectorAll(".movie-card, .rank-row");
    if (!cards.length && scope.nextElementSibling) {
      cards = scope.nextElementSibling.querySelectorAll(".movie-card, .rank-row");
    }
    var query = normalize(input && input.value);
    var yearValue = year ? year.value : "";
    var categoryValue = category ? category.value : "";

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var cardYear = card.getAttribute("data-year") || "";
      var cardCategory = card.getAttribute("data-category") || "";
      var visible = true;

      if (query && text.indexOf(query) === -1) {
        visible = false;
      }
      if (yearValue && cardYear !== yearValue) {
        visible = false;
      }
      if (categoryValue && cardCategory !== categoryValue) {
        visible = false;
      }

      card.hidden = !visible;
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var controls = scope.querySelectorAll("[data-filter-input], [data-filter-year], [data-filter-category]");
      controls.forEach(function (control) {
        control.addEventListener("input", function () {
          filterInScope(scope);
        });
        control.addEventListener("change", function () {
          filterInScope(scope);
        });
      });
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = slider.querySelectorAll(".hero-slide");
    var dots = slider.querySelectorAll("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var index = 0;

    function go(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        go(Number(dot.getAttribute("data-hero-dot") || 0));
      });
    });

    window.setInterval(function () {
      go(index + 1);
    }, 5200);
  }

  function applyQueryToCategoryPage() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (!query) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var scope = input && input.closest("[data-filter-scope]");
    if (input && scope) {
      input.value = query;
      filterInScope(scope);
      input.focus();
    }
  }

  ready(function () {
    initMenu();
    initFilters();
    initHero();
    applyQueryToCategoryPage();
  });
})();
