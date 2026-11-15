(function () {
  var form = document.getElementById("order-form");
  var nameInput = document.getElementById("order-name");
  var addressField = document.getElementById("address-field");
  var addressInput = document.getElementById("order-address");
  var noteEl = document.getElementById("order-note");
  var copyBtn = document.getElementById("copy-note");
  var totalEl = document.getElementById("order-total");
  var payLink = document.getElementById("pay-link");
  var basePay = "https://cash.app/$movecash2020";

  function selected(name) {
    return form.querySelector('input[name="' + name + '"]:checked');
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
    var delivery = selected("delivery");
    var shipping = delivery && delivery.value === "ship";
    addressField.hidden = !shipping;
    if (!shipping) addressInput.value = addressInput.value;
    noteEl.textContent = noteText();

    if (!delivery) {
      totalEl.textContent = "Choose pickup or shipping to see your total.";
      payLink.href = basePay;
      payLink.classList.add("is-disabled");
      payLink.setAttribute("aria-disabled", "true");
      return;
    }
    var total = delivery.getAttribute("data-total");
    if (delivery.value === "pickup") {
      totalEl.textContent = "Total: $25 for local pickup in Austin.";
    } else {
      totalEl.textContent = "Total: $34 shipped in the lower 48 ($25 plus $9 USPS).";
    }
    payLink.href = basePay + "/" + total;
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
      window.setTimeout(function () {
        copyBtn.textContent = prev;
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
})();
