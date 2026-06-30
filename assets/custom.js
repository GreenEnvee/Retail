/*
* Pipeline Theme
*
* Use this file to add custom Javascript to Pipeline.
*
*/


(function() {
  var defaultConfig = {
    enabled: false,
    defaultSelected: false,
    variantId: '',
    label: '',
    helperText: ''
  };

  function normalizeConfig(cfg) {
    return {
      enabled: Boolean(cfg.enabled),
      defaultSelected: Boolean(cfg.defaultSelected),
      variantId: String(cfg.variantId || '').trim(),
      label: String(cfg.label || '').trim(),
      helperText: String(cfg.helperText || '').trim()
    };
  }

  var config = normalizeConfig(Object.assign({}, defaultConfig, window.__shippingProtectionConfig || {}));

  if (!config.enabled || !config.variantId) {
    return;
  }

  function ShippingProtectionManager(cfg) {
    this.config = cfg;
    this.cart = null;
    this.cartRequest = null;
    this.busy = false;
    this.normalizing = false;
    this.pendingOperation = null;
    this.resubmittingCheckout = false;
    this.optOutStorageKey = 'shipping-protection-opt-out:' + this.config.variantId;
    this.handleToggleChange = this.handleToggleChange.bind(this);
    this.handleCartChange = this.handleCartChange.bind(this);
    this.handleCartInit = this.handleCartInit.bind(this);
    this.handleCheckoutSubmit = this.handleCheckoutSubmit.bind(this);
    this.init();
  }

  ShippingProtectionManager.prototype.init = function() {
    document.addEventListener('change', this.handleToggleChange);
    document.addEventListener('theme:cart:change', this.handleCartChange);
    document.addEventListener('theme:cart:init', this.handleCartInit);
    document.addEventListener('submit', this.handleCheckoutSubmit);
    this.fetchCart();
    this.applyState();
  };

  ShippingProtectionManager.prototype.handleToggleChange = function(event) {
    var toggle = event.target.closest('[data-shipping-protection-toggle]');
    if (!toggle) return;

    if (this.busy) {
      event.preventDefault();
      toggle.checked = this.hasProtection();
      return;
    }

    if (toggle.checked) {
      this.clearOptOut();
      this.enableProtection();
    } else {
      this.setOptOut();
      this.disableProtection();
    }
  };

  ShippingProtectionManager.prototype.handleCartChange = function(event) {
    var _this = this;

    if (event.detail && event.detail.cart) {
      this.cart = event.detail.cart;
    }

    this.normalizeProtectionState()
      .then(function(didNormalize) {
        if (didNormalize) {
          return false;
        }

        return _this.maybeAutoEnableProtection();
      })
      .then(function(didAutoEnable) {
        if (!didAutoEnable) {
          _this.applyState();
        }
      });
  };

  ShippingProtectionManager.prototype.handleCartInit = function() {
    if (!this.cart) {
      this.fetchCart();
    }
  };

  ShippingProtectionManager.prototype.handleCheckoutSubmit = function(event) {
    var _this = this;
    var form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    var submitter = event.submitter || form.querySelector('[name="checkout"]');
    if (!(submitter instanceof HTMLElement) || submitter.getAttribute('name') !== 'checkout') {
      return;
    }

    if (this.resubmittingCheckout) {
      this.resubmittingCheckout = false;
      return;
    }

    if (!this.busy || !this.pendingOperation) {
      return;
    }

    event.preventDefault();

    this.pendingOperation
      .catch(function() { return null; })
      .then(function() {
        if (!document.body.contains(form)) return;

        _this.resubmittingCheckout = true;

        if (typeof form.requestSubmit === 'function' && submitter instanceof HTMLElement) {
          form.requestSubmit(submitter);
        } else {
          form.submit();
        }
      });
  };

  ShippingProtectionManager.prototype.fetchCart = function() {
    var _this = this;

    if (this.cartRequest) return this.cartRequest;

    this.cartRequest = fetch(window.theme.routes.cart + '.js', { credentials: 'same-origin' })
      .then(function(response) { return response.json(); })
      .then(function(cart) {
        _this.syncCartState(cart);
        return cart;
      })
      .catch(function(error) {
        console.error('[Shipping Protection] Could not load cart', error);
        return null;
      })
      .finally(function() {
        _this.cartRequest = null;
      });

    return this.cartRequest;
  };

  ShippingProtectionManager.prototype.syncCartState = function(cart) {
    if (!cart) return;

    this.cart = cart;
    document.dispatchEvent(new CustomEvent('theme:cart:change', {
      detail: { cart: cart },
      bubbles: true
    }));
  };

  ShippingProtectionManager.prototype.refreshCartUI = function() {
    document.dispatchEvent(new CustomEvent('theme:cart:reload', {
      bubbles: true
    }));
  };

  ShippingProtectionManager.prototype.getOptOut = function() {
    try {
      return window.sessionStorage.getItem(this.optOutStorageKey) === 'true';
    } catch (error) {
      return false;
    }
  };

  ShippingProtectionManager.prototype.setOptOut = function() {
    try {
      window.sessionStorage.setItem(this.optOutStorageKey, 'true');
    } catch (error) {
      return;
    }
  };

  ShippingProtectionManager.prototype.clearOptOut = function() {
    try {
      window.sessionStorage.removeItem(this.optOutStorageKey);
    } catch (error) {
      return;
    }
  };

  ShippingProtectionManager.prototype.getProtectionItems = function() {
    var items = this.cart && Array.isArray(this.cart.items) ? this.cart.items : [];
    var variantId = this.config.variantId;

    return items.filter(function(item) {
      return String(item.variant_id) === variantId;
    });
  };

  ShippingProtectionManager.prototype.getMerchandiseItems = function() {
    var items = this.cart && Array.isArray(this.cart.items) ? this.cart.items : [];
    var variantId = this.config.variantId;

    return items.filter(function(item) {
      return String(item.variant_id) !== variantId;
    });
  };

  ShippingProtectionManager.prototype.getProtectionQuantity = function() {
    return this.getProtectionItems().reduce(function(total, item) {
      return total + Number(item.quantity || 0);
    }, 0);
  };

  ShippingProtectionManager.prototype.hasProtection = function() {
    return this.getProtectionQuantity() > 0;
  };

  ShippingProtectionManager.prototype.hasMerchandiseItems = function() {
    return this.getMerchandiseItems().length > 0;
  };

  ShippingProtectionManager.prototype.shouldAutoEnableProtection = function() {
    return this.config.defaultSelected
      && this.hasMerchandiseItems()
      && !this.hasProtection()
      && !this.getOptOut();
  };

  ShippingProtectionManager.prototype.normalizeProtectionState = function() {
    var _this = this;

    if (!this.cart || this.normalizing) {
      return Promise.resolve(false);
    }

    var protectionItems = this.getProtectionItems();
    var totalQuantity = this.getProtectionQuantity();

    if (!protectionItems.length) {
      return Promise.resolve(false);
    }

    if (!this.hasMerchandiseItems()) {
      return this.disableProtection(true).then(function() { return true; });
    }

    if (protectionItems.length > 1 || totalQuantity > 1) {
      return this.setProtectionQuantity(1).then(function() { return true; });
    }

    return Promise.resolve(false);
  };

  ShippingProtectionManager.prototype.maybeAutoEnableProtection = function() {
    var _this = this;

    if (this.busy || !this.cart) {
      return Promise.resolve(false);
    }

    if (!this.hasMerchandiseItems()) {
      this.clearOptOut();
      return Promise.resolve(false);
    }

    if (!this.shouldAutoEnableProtection()) {
      return Promise.resolve(false);
    }

    return this.enableProtection({ autoSelected: true }).then(function() {
      return true;
    });
  };

  ShippingProtectionManager.prototype.setBusyState = function(isBusy) {
    this.busy = isBusy;

    var nodes = document.querySelectorAll('[data-shipping-protection]');
    nodes.forEach(function(node) {
      node.classList.toggle('cart--loading', isBusy);
      node.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    });

    var hasMerchandiseItems = this.hasMerchandiseItems();
    var toggles = document.querySelectorAll('[data-shipping-protection-toggle]');
    toggles.forEach(function(toggle) {
      toggle.disabled = isBusy || !hasMerchandiseItems;
    });
  };

  ShippingProtectionManager.prototype.applyState = function() {
    var hasCart = !!this.cart;
    var checked = hasCart && (this.hasProtection() || this.shouldAutoEnableProtection());
    var hasMerchandiseItems = hasCart && this.hasMerchandiseItems();
    var disabled = this.busy || !hasCart || !hasMerchandiseItems;
    var wrappers = document.querySelectorAll('[data-shipping-protection]');
    var toggles = document.querySelectorAll('[data-shipping-protection-toggle]');

    wrappers.forEach(function(wrapper) {
      wrapper.classList.toggle('is-hidden', hasCart && !hasMerchandiseItems && !checked);
    });

    toggles.forEach(function(toggle) {
      toggle.checked = checked;
      toggle.disabled = disabled;
    });
  };

  ShippingProtectionManager.prototype.enableProtection = function(options) {
    var _this = this;
    var settings = Object.assign({ autoSelected: false }, options);

    if (this.hasProtection()) {
      this.applyState();
      return Promise.resolve();
    }

    if (!this.hasMerchandiseItems()) {
      this.applyState();
      return Promise.resolve();
    }

    this.setBusyState(true);

    var request = fetch(window.theme.routes.cart + '/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        id: Number(this.config.variantId),
        quantity: 1
      })
    })
      .then(function(response) {
        if (!response.ok) throw new Error('Could not add shipping protection');
        if (!settings.autoSelected) {
          _this.clearOptOut();
        }
        return _this.fetchCart();
      })
      .then(function(cart) {
        _this.refreshCartUI();
        return cart;
      })
      .finally(function() {
        _this.setBusyState(false);
        _this.applyState();
        _this.pendingOperation = null;
      });

    this.pendingOperation = request;
    return request;
  };

  ShippingProtectionManager.prototype.disableProtection = function(skipApplyState) {
    var _this = this;
    var protectionItems = this.getProtectionItems();

    if (!protectionItems.length) {
      if (!skipApplyState) {
        this.applyState();
      }
      return Promise.resolve();
    }

    this.setBusyState(true);

    var request = this.updateLineItem(protectionItems[0].key, 0)
      .then(function(cart) {
        _this.refreshCartUI();
        return cart;
      })
      .finally(function() {
        _this.setBusyState(false);
        if (!skipApplyState) {
          _this.applyState();
        }
        _this.pendingOperation = null;
      });

    this.pendingOperation = request;
    return request;
  };

  ShippingProtectionManager.prototype.setProtectionQuantity = function(quantity) {
    var _this = this;
    var protectionItems = this.getProtectionItems();

    if (!protectionItems.length) {
      return Promise.resolve();
    }

    this.normalizing = true;
    this.setBusyState(true);

    var requests = protectionItems.map(function(item, index) {
      var nextQuantity = index === 0 ? quantity : 0;
      return function() {
        return _this.updateLineItem(item.key, nextQuantity, true);
      };
    });

    var request = requests.reduce(function(promise, requestFn) {
      return promise.then(requestFn);
    }, Promise.resolve())
      .then(function(cart) {
        if (cart) {
          _this.syncCartState(cart);
          _this.refreshCartUI();
        }
        return cart;
      })
      .finally(function() {
        _this.normalizing = false;
        _this.setBusyState(false);
        _this.applyState();
        _this.pendingOperation = null;
      });

    this.pendingOperation = request;
    return request;
  };

  ShippingProtectionManager.prototype.updateLineItem = function(key, quantity, skipFetch) {
    var _this = this;

    return fetch(window.theme.routes.root_url + 'cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        id: key,
        quantity: quantity
      })
    })
      .then(function(response) {
        if (!response.ok) throw new Error('Could not update shipping protection');
        return response.json();
      })
      .then(function(cart) {
        if (skipFetch) {
          _this.cart = cart;
          return cart;
        }

        _this.syncCartState(cart);
        return cart;
      })
      .catch(function(error) {
        console.error('[Shipping Protection] Could not update shipping protection', error);
        throw error;
      });
  };

  new ShippingProtectionManager(config);
})();
