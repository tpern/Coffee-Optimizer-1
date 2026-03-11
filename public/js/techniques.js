/**
 * Brewing Techniques - Interactions
 * Collapsible recipe cards, print recipe, accessibility
 */

(function() {
  'use strict';

  function initCollapsibleRecipes() {
    document.querySelectorAll('.recipe-card').forEach(function(card) {
      var header = card.querySelector('.recipe-card-header');
      var body = card.querySelector('.recipe-card-body');
      var toggle = card.querySelector('.recipe-toggle');

      if (!header || !body) return;

      var isOpen = body.classList.contains('is-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', isOpen);
        toggle.textContent = isOpen ? 'Hide Recipe' : 'View Recipe';
      }

      function toggleOpen() {
        isOpen = !isOpen;
        body.classList.toggle('is-open', isOpen);
        body.setAttribute('aria-hidden', !isOpen);
        if (toggle) {
          toggle.setAttribute('aria-expanded', isOpen);
          toggle.textContent = isOpen ? 'Hide Recipe' : 'View Recipe';
        }
        var header = card.querySelector('.recipe-card-header');
        if (header) header.setAttribute('aria-expanded', isOpen);
      }

      body.setAttribute('aria-hidden', !isOpen);

      header.addEventListener('click', function(e) {
        if (e.target.closest('.btn-recipe') || e.target.closest('a')) return;
        toggleOpen();
      });

      if (toggle) {
        toggle.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleOpen();
        });
      }
    });
  }

  function initPrintButtons() {
    document.querySelectorAll('[data-print-recipe]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var card = btn.closest('.recipe-card');
        if (!card) return;
        var printContent = card.cloneNode(true);
        var toggle = printContent.querySelector('.recipe-toggle');
        var body = printContent.querySelector('.recipe-card-body');
        if (toggle) toggle.remove();
        if (body) body.classList.add('is-open');
        var win = window.open('', '_blank');
        win.document.write('<html><head><title>Recipe</title><link rel="stylesheet" href="/css/techniques.css"></head><body>' + printContent.outerHTML + '</body></html>');
        win.document.close();
        win.print();
        win.close();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initCollapsibleRecipes();
      initPrintButtons();
    });
  } else {
    initCollapsibleRecipes();
    initPrintButtons();
  }
})();
