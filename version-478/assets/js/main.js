(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
      });
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var keyword = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        if (keyword) {
          window.location.href = target + "?q=" + encodeURIComponent(keyword);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
    var queryInput = root.querySelector("[data-local-search]");
    var typeFilter = root.querySelector("[data-type-filter]");
    var yearFilter = root.querySelector("[data-year-filter]");
    var countNode = root.querySelector("[data-result-count]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (queryInput && query) {
      queryInput.value = query;
    }
    function matchYear(cardYear, filterYear) {
      if (!filterYear) {
        return true;
      }
      var year = parseInt(cardYear || "0", 10);
      if (filterYear === "2020") {
        return year <= 2020;
      }
      return String(year) === filterYear;
    }
    function apply() {
      var text = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var typeValue = typeFilter ? typeFilter.value : "";
      var yearValue = yearFilter ? yearFilter.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute("data-text") || "") + " " + (card.getAttribute("data-title") || "")).toLowerCase();
        var typeText = card.getAttribute("data-type") || "";
        var yearText = card.getAttribute("data-year") || "";
        var okText = !text || haystack.indexOf(text) !== -1;
        var okType = !typeValue || typeText.indexOf(typeValue) !== -1;
        var okYear = matchYear(yearText, yearValue);
        var ok = okText && okType && okYear;
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (countNode) {
        countNode.textContent = visible ? "筛选结果 " + visible + " 部" : "暂无匹配结果";
      }
    }
    [queryInput, typeFilter, yearFilter].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
