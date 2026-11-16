(function () {
  var form = document.getElementById("order-form");
  var nameInput = document.getElementById("order-name");
  var stateInput = document.getElementById("order-state");
  var zipInput = document.getElementById("order-zip");
  var shipFields = document.getElementById("ship-fields");
  var checkoutItem = document.getElementById("checkout-item");
  var checkoutSubtotal = document.getElementById("checkout-subtotal");
  var checkoutShipping = document.getElementById("checkout-shipping");
  var checkoutTax = document.getElementById("checkout-tax");
  var checkoutTotal = document.getElementById("checkout-total");
  var noteEl = document.getElementById("order-note");
  var copyBtn = document.getElementById("copy-note");
  var totalEl = document.getElementById("order-total");
  var payLink = document.getElementById("pay-link");
  var bundleOffer = document.getElementById("bundle-offer");
  var colorTwo = document.getElementById("color-two");
  var bundleTimeNote = document.getElementById("bundle-time-note");
  var basePay = "https://cash.app/$movecash2020";
  var SHIPPING_CENTS = 900;
  var BUNDLE_CENTS = 3799;
  var TAX_RATE_NUM = 825;
  var TAX_RATE_DEN = 10000;

  function selected(name) {
    return form.querySelector('input[name="' + name + '"]:checked');
  }

  function formatMoney(cents) {
    return "$" + (cents / 100).toFixed(2);
  }

  function pickupCents(color) {
    var raw = color && color.getAttribute("data-pickup-cents");
    var n = raw ? parseInt(raw, 10) : NaN;
    return isFinite(n) ? n : 0;
  }

  function cashAppAmount(cents) {
    return (cents / 100).toFixed(2);
  }

  function isBundle() {
    return !!(bundleOffer && bundleOffer.checked);
  }

  function isMadeToOrder(color) {
    var lead = (color && color.getAttribute("data-lead")) || "";
    return lead.indexOf("made to order") !== -1;
  }

  function colorLabel() {
    var color = selected("color");
    var color2 = selected("color2");
    var first = color ? color.value : "your color";
    if (!isBundle()) return first;
    var second = color2 ? color2.value : "your second color";
    if (color && color2 && first === second) return "two " + first;
    return first + " + " + second;
  }

  function taxCents(taxableCents, applyTax) {
    if (!applyTax) return 0;
    return Math.round(taxableCents * TAX_RATE_NUM / TAX_RATE_DEN);
  }

  function zipValue() {
    return ((zipInput && zipInput.value) || "").trim();
  }

  function validZip(value) {
    return /^\d{5}(?:-\d{4})?$/.test(value);
  }

  function quote() {
    var bundle = isBundle();
    var color = selected("color");
    var color2 = selected("color2");
    var delivery = selected("delivery");
    var shipping = !!(delivery && delivery.value === "ship");
    var subtotal = bundle ? BUNDLE_CENTS : pickupCents(color);
    var ship = shipping ? SHIPPING_CENTS : 0;
    var state = ((stateInput && stateInput.value) || "").trim();
    var applyTax = false;
    var taxKnown = false;
    if (delivery && (!bundle || (color && color2)) && subtotal) {
      if (!shipping) {
        applyTax = true;
        taxKnown = true;
      } else if (state) {
        applyTax = state === "TX";
        taxKnown = true;
      }
    }
    var tax = taxKnown ? taxCents(subtotal + ship, applyTax) : null;
    var total = taxKnown ? subtotal + ship + tax : null;
    return {
      bundle: bundle,
      color: color,
      color2: color2,
      delivery: delivery,
      shipping: shipping,
      subtotal: subtotal,
      ship: ship,
      state: state,
      zip: zipValue(),
      taxKnown: taxKnown,
      tax: tax,
      total: total
    };
  }

  function noteText() {
    var q = quote();
    var item = q.bundle ? "Bundle: " + colorLabel() : colorLabel() + " tray";
    var person = (nameInput.value || "").trim() || "your name";
    if (!q.delivery) {
      return item + ", " + person + ", pickup or shipping";
    }
    if (!q.shipping) {
      return item + ", " + person + ", pickup";
    }
    var place = (q.state || q.zip) ? [q.state, q.zip].filter(Boolean).join(" ") : "state and ZIP";
    return item + ", " + person + ", ship " + place;
  }

  function dashTotals() {
    checkoutSubtotal.textContent = "—";
    checkoutShipping.textContent = "—";
    checkoutTax.textContent = "—";
    checkoutTotal.textContent = "—";
  }

  function disablePay() {
    payLink.href = basePay;
    payLink.classList.add("is-disabled");
    payLink.setAttribute("aria-disabled", "true");
  }

  function sync() {
    var q = quote();
    if (colorTwo) colorTwo.hidden = !q.bundle;
    if (bundleTimeNote) {
      bundleTimeNote.hidden = !(q.bundle && (isMadeToOrder(q.color) || isMadeToOrder(q.color2)));
    }
    if (shipFields) shipFields.hidden = !q.shipping;
    noteEl.textContent = noteText();

    if (q.bundle && q.color && q.color2) {
      checkoutItem.textContent = "Two-tray bundle: " + colorLabel() + " — " + formatMoney(BUNDLE_CENTS);
    } else if (!q.bundle && q.color && q.subtotal) {
      checkoutItem.textContent = (q.color.value) + " — " + formatMoney(q.subtotal);
    } else {
      checkoutItem.textContent = "Choose a color and delivery to review your order.";
    }

    if (!q.delivery || !q.subtotal || (q.bundle && (!q.color || !q.color2))) {
      dashTotals();
      totalEl.textContent = (q.bundle && q.delivery && (!q.color || !q.color2))
        ? "Choose both colors to see your total."
        : "Choose pickup or shipping to see your total.";
      disablePay();
      return;
    }

    checkoutSubtotal.textContent = formatMoney(q.subtotal);
    checkoutShipping.textContent = q.shipping ? formatMoney(q.ship) : "Free";

    if (!q.taxKnown) {
      checkoutTax.textContent = "—";
      checkoutTotal.textContent = "—";
      totalEl.textContent = "Enter your state and ZIP to see your total.";
      disablePay();
      return;
    }

    if (q.shipping && !validZip(q.zip)) {
      checkoutTax.textContent = formatMoney(q.tax);
      checkoutTotal.textContent = formatMoney(q.total);
      totalEl.textContent = "Enter a 5-digit ZIP to finish checkout.";
      disablePay();
      return;
    }

    checkoutTax.textContent = formatMoney(q.tax);
    checkoutTotal.textContent = formatMoney(q.total);
    if (q.shipping) {
      totalEl.textContent = "Total: " + formatMoney(q.total) + " shipped to " + q.state + " " + q.zip + ".";
    } else {
      totalEl.textContent = "Total: " + formatMoney(q.total) + " for local pickup in Austin.";
    }
    payLink.href = basePay + "/" + cashAppAmount(q.total);
    payLink.classList.remove("is-disabled");
    payLink.setAttribute("aria-disabled", "false");
  }

  form.addEventListener("change", sync);
  nameInput.addEventListener("input", sync);
  if (zipInput) zipInput.addEventListener("input", sync);
  if (stateInput) stateInput.addEventListener("change", sync);

  copyBtn.addEventListener("click", function () {
    var text = noteText();
    function ok() {
      var prev = copyBtn.textContent;
      copyBtn.textContent = "Copied";
      copyBtn.classList.add("is-copied");
      window.setTimeout(function () {
        copyBtn.textContent = prev;
        copyBtn.classList.remove("is-copied");
      }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        window.prompt("Copy this payment note:", text);
      });
    } else {
      window.prompt("Copy this payment note:", text);
    }
  });

  payLink.addEventListener("click", function (event) {
    if (payLink.classList.contains("is-disabled")) {
      event.preventDefault();
    }
  });

  sync();

  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    for (var i = 0; i < revealEls.length; i++) revealEls[i].classList.add("is-in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    for (var j = 0; j < revealEls.length; j++) io.observe(revealEls[j]);
    window.setTimeout(function () {
      for (var k = 0; k < revealEls.length; k++) revealEls[k].classList.add("is-in");
    }, 2500);
  }
})();
