/* ==========================================================================
   BeaTaN Games — Catálogo Interactivo
   Filtrado en tiempo real por categoría y búsqueda instantánea.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var filterBtns = document.querySelectorAll("[data-game-filter]");
    var searchInput = document.getElementById("gameSearch");
    var gameCards = document.querySelectorAll(".bt-game-card");
    var counterEl = document.getElementById("catalogCount");

    var currentFilter = "all";
    var currentQuery = "";

    function updateCatalog() {
      var visibleCount = 0;
      var totalCount = gameCards.length;

      gameCards.forEach(function (card) {
        var categories = (card.getAttribute("data-categories") || "").toLowerCase().split(" ");
        var title = (card.querySelector(".bt-game-card__title") || {}).textContent || "";
        var desc = (card.querySelector(".bt-game-card__desc") || {}).textContent || "";
        var tags = (card.querySelector(".bt-game-card__tags") || {}).textContent || "";
        var studio = (card.querySelector(".bt-game-card__studio") || {}).textContent || "";

        var textContent = (title + " " + desc + " " + tags + " " + studio).toLowerCase();

        var matchesCategory = currentFilter === "all" || categories.indexOf(currentFilter) !== -1;
        var matchesSearch = !currentQuery || textContent.indexOf(currentQuery) !== -1;

        if (matchesCategory && matchesSearch) {
          card.classList.remove("is-hidden");
          visibleCount++;
        } else {
          card.classList.add("is-hidden");
        }
      });

      if (counterEl) {
        if (visibleCount === totalCount) {
          counterEl.textContent = "Mostrando los " + totalCount + " juegos disponibles";
        } else if (visibleCount === 0) {
          counterEl.textContent = "No se encontraron juegos con esos criterios";
        } else {
          counterEl.textContent = "Mostrando " + visibleCount + " de " + totalCount + " juegos";
        }
      }
    }

    // Manejo de botones de filtro
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        currentFilter = btn.getAttribute("data-game-filter") || "all";
        updateCatalog();
      });
    });

    // Manejo de campo de búsqueda
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        currentQuery = (e.target.value || "").trim().toLowerCase();
        updateCatalog();
      });
    }

    // Inicializar
    updateCatalog();
  });
})();
