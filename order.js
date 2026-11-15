(function () {
  var form = document.getElementById("order-form");
  var nameInput = document.getElementById("order-name");
  var addressField = document.getElementById("address-field");
  var addressInput = document.getElementById("order-address");
  var noteEl = document.getElementById("order-note");
  var copyBtn = document.getElementById("copy-note");
  var totalEl = document.getElementById("order-total");
  var payLink = document.getElementById("pay-link");
  var pickupMeta = document.getElementById("pickup-meta");
  var shipMeta = document.getElementById("ship-meta");
  var basePay = "https://cash.app/$movecash2020";
  var SHIPPING_CENTS = 900;

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

  function noteText() {
    var color = selected("color");
    var delivery = selected("delivery");
    var colorName = color ? color.value : "your color";
    var person = (nameInput.value || "").trim() || "your name";
    if (!delivery) {
      return colorName + ", " + person + ", pickup or shipping address";
    }
    if (delivery.value === "pickup") {
      return colorName + ", " + person + ", pickup";
    }
    var address = (addressInput.value || "").trim() || "your shipping address";
    return colorName + ", " + person + ", " + address;
  }

  function sync() {
    var color = selected("color");
    var delivery = selected("delivery");
    var shipping = delivery && delivery.value === "ship";
    var pickup = pickupCents(color);
    var shipped = pickup + SHIPPING_CENTS;
    addressField.hidden = !shipping;
    if (!shipping) addressInput.value = addressInput.value;
    noteEl.textContent = noteText();

    if (color && pickup) {
      pickupMeta.textContent = formatMoney(pickup);
      shipMeta.textContent = formatMoney(shipped) + " total · " + formatMoney(pickup) + " + $9 USPS";
    } else {
      pickupMeta.textContent = "From $19.99";
      shipMeta.textContent = "From $28.99 total · tray + $9 USPS";
    }

    if (!delivery || !pickup) {
      totalEl.textContent = "Choose pickup or shipping to see your total.";
      payLink.href = basePay;
      payLink.classList.add("is-disabled");
      payLink.setAttribute("aria-disabled", "true");
      return;
    }

    var total = shipping ? shipped : pickup;
    if (delivery.value === "pickup") {
      totalEl.textContent = "Total: " + formatMoney(total) + " for local pickup in Austin.";
    } else {
      totalEl.textContent = "Total: " + formatMoney(total) + " shipped in the lower 48 (" + formatMoney(pickup) + " plus $9 USPS).";
    }
    payLink.href = basePay + "/" + cashAppAmount(total);
    payLink.classList.remove("is-disabled");
    payLink.setAttribute("aria-disabled", "false");
  }

  form.addEventListener("change", sync);
  nameInput.addEventListener("input", sync);
  addressInput.addEventListener("input", sync);

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
