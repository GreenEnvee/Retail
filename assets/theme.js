
/*
* @license
* Pipeline Theme (c) Groupthought Themes
*
* This file is included for advanced development by
* Shopify Agencies.  Modified versions of the theme
* code are not supported by Shopify or Groupthought.
*
*/

(function (AOS, FlickityFade, scrollLock, Flickity, Sqrl, MicroModal, Rellax, themeCurrency, axios, FlickitySync, themeAddresses) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var Sqrl__namespace = /*#__PURE__*/_interopNamespaceDefault(Sqrl);

    (function() {
        const env = {"NODE_ENV":"production"};
        try {
            if (process) {
                process.env = Object.assign({}, process.env);
                Object.assign(process.env, env);
                return;
            }
        } catch (e) {} // avoid ReferenceError: process is not defined
        globalThis.process = { env:env };
    })();

    // From https://developer.chrome.com/blog/using-requestidlecallback/#checking-for-requestidlecallback
    window.requestIdleCallback = window.requestIdleCallback || function(cb) {
        var start = Date.now();
        return setTimeout(function() {
            cb({
                didTimeout: false,
                timeRemaining: function() {
                    return Math.max(0, 50 - (Date.now() - start));
                }
            });
        }, 1);
    };
    window.cancelIdleCallback = window.cancelIdleCallback || function(id) {
        clearTimeout(id);
    };

    function moveModals(container) {
        const modals = container.querySelectorAll('[data-modal]');
        const modalBin = document.querySelector('[data-modal-container]');
        modals.forEach((element)=>{
            const alreadyAdded = modalBin.querySelector(`[id="${element.id}"]`);
            if (!alreadyAdded) {
                modalBin.appendChild(element);
            }
        });
    }

    function floatLabels(container) {
        const floats = container.querySelectorAll('.float__wrapper');
        floats.forEach((element)=>{
            const label = element.querySelector('label');
            const input = element.querySelector('input, textarea');
            if (label) {
                input.addEventListener('keyup', (event)=>{
                    if (event.target.value !== '') {
                        label.classList.add('label--float');
                    } else {
                        label.classList.remove('label--float');
                    }
                });
            }
            if (input && input.value && input.value.length) {
                label.classList.add('label--float');
            }
        });
    }
    function errorTabIndex(container) {
        const errata = container.querySelectorAll('.errors');
        errata.forEach((element)=>{
            element.setAttribute('tabindex', '0');
            element.setAttribute('aria-live', 'assertive');
            element.setAttribute('role', 'alert');
        });
    }

    // Remove loading class from all already loaded images
    function removeLoadingClassFromLoadedImages(container) {
        container.querySelectorAll('img').forEach((el)=>{
            if (el.complete) {
                el.parentNode.classList.remove('loading-shimmer');
            }
        });
    }
    // Remove loading class from image on `load` event
    function handleImageLoaded(el) {
        if (el.tagName == 'IMG' && el.parentNode.classList.contains('loading-shimmer')) {
            el.parentNode.classList.remove('loading-shimmer');
        }
    }

    function readHeights() {
        const h = {};
        h.windowHeight = window.innerHeight;
        h.announcementHeight = getHeight('[data-announcement-bar]');
        h.toolbarHeight = getHeight('[data-toolbar-height]');
        h.footerHeight = getHeight('[data-section-type*="footer"]');
        h.menuHeight = getHeight('[data-header-height]');
        h.headerHeight = h.menuHeight + h.announcementHeight;
        h.logoHeight = getFooterLogoWithPadding();
        h.stickyHeader = document.querySelector('[data-header-sticky="sticky"]') ? h.menuHeight : 0;
        h.backfillHeight = getHeight('[data-header-backfill]');
        return h;
    }
    function setVarsOnResize() {
        document.addEventListener('theme:resize', resizeVars);
        setVars();
    }
    function setVars() {
        const { windowHeight , announcementHeight , toolbarHeight , headerHeight , logoHeight , menuHeight , footerHeight , stickyHeader , backfillHeight  } = readHeights();
        document.documentElement.style.setProperty('--scrollbar-width', `${getScrollbarWidth()}px`);
        document.documentElement.style.setProperty('--footer-logo', `${logoHeight}px`);
        document.documentElement.style.setProperty('--full-screen', `${windowHeight}px`);
        document.documentElement.style.setProperty('--three-quarters', `${windowHeight * 0.75}px`);
        document.documentElement.style.setProperty('--two-thirds', `${windowHeight * 0.66}px`);
        document.documentElement.style.setProperty('--one-half', `${windowHeight * 0.5}px`);
        document.documentElement.style.setProperty('--one-third', `${windowHeight * 0.33}px`);
        document.documentElement.style.setProperty('--one-fifth', `${windowHeight * 0.2}px`);
        document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
        document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
        document.documentElement.style.setProperty('--toolbar-height', `${toolbarHeight}px`);
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
        document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
        document.documentElement.style.setProperty('--menu-height-sticky', `${stickyHeader}px`);
        // if backfill estimation is within 1px rounded, don't force a layout shift
        let newBackfill = Math.abs(backfillHeight - menuHeight) > 1 ? `${menuHeight}px` : 'auto';
        document.documentElement.style.setProperty('--menu-backfill-height', newBackfill);
    }
    function resizeVars() {
        // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
        const { windowHeight , announcementHeight , toolbarHeight , headerHeight , logoHeight , menuHeight , footerHeight , stickyHeader , backfillHeight  } = readHeights();
        document.documentElement.style.setProperty('--scrollbar-width', `${getScrollbarWidth()}px`);
        document.documentElement.style.setProperty('--full-screen', `${windowHeight}px`);
        document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
        document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
        document.documentElement.style.setProperty('--toolbar-height', `${toolbarHeight}px`);
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
        document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
        document.documentElement.style.setProperty('--menu-height-sticky', `${stickyHeader}px`);
        // if backfill estimation is within 1px rounded, don't force a layout shift
        let newBackfill = Math.abs(backfillHeight - menuHeight) > 1 ? `${menuHeight}px` : 'auto';
        document.documentElement.style.setProperty('--menu-backfill-height', newBackfill);
    }
    function getHeight(selector) {
        const el = document.querySelector(selector);
        if (el) {
            return el.clientHeight;
        } else {
            return 0;
        }
    }
    function getFooterLogoWithPadding() {
        const height = getHeight('[data-footer-logo]');
        if (height > 0) {
            return height + 20;
        } else {
            return 0;
        }
    }
    function getScrollbarWidth() {
        // Creating invisible container
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // forcing scrollbar to appear
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        document.body.appendChild(outer);
        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);
        // Calculating difference between container's full width and the child width
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        // Removing temporary elements from the DOM
        outer.parentNode.removeChild(outer);
        return scrollbarWidth;
    }

    function singles(frame, wrappers) {
        // sets the height of any frame passed in with the
        // tallest js-overflow-content as well as any image in that frame
        let padding = 64;
        let tallest = 0;
        wrappers.forEach((wrap)=>{
            if (wrap.offsetHeight > tallest) {
                const getMarginTop = parseInt(window.getComputedStyle(wrap).marginTop);
                const getMarginBottom = parseInt(window.getComputedStyle(wrap).marginBottom);
                const getMargin = getMarginTop + getMarginBottom;
                if (getMargin > padding) {
                    padding = getMargin;
                }
                tallest = wrap.offsetHeight;
            }
        });
        const images = frame.querySelectorAll('[data-overflow-background]');
        const frames = [
            frame,
            ...images
        ];
        frames.forEach((el)=>{
            el.style.setProperty('min-height', `calc(${tallest + padding}px + var(--menu-height))`);
        });
    }
    function doubles(section) {
        let footerLogoH = document.querySelector('[data-footer-logo]') ? document.querySelector('[data-footer-logo]').clientHeight + 20 : 0;
        const lastSection = document.querySelector('#MainContent .shopify-section:last-child [data-section-id]');
        const lastSectionAttrID = lastSection ? lastSection.getAttribute('data-section-id') : null;
        if (lastSectionAttrID !== null && section.getAttribute('data-section-id') !== lastSectionAttrID || !lastSection) {
            footerLogoH = 0;
        }
        if (window.innerWidth < window.theme.sizes.medium) {
            // if we are below the small breakpoint, the double section acts like two independent
            // single frames
            let singleFrames = section.querySelectorAll('[data-overflow-frame]');
            singleFrames.forEach((singleframe)=>{
                const wrappers = singleframe.querySelectorAll('[data-overflow-content]');
                singles(singleframe, wrappers);
            });
            return;
        }
        // Javascript can't execute calc() (from `--outer` variable) - create a new div with width property instead `getPropertyValue('--outer')`
        const htmlObject = document.createElement('div');
        section.prepend(htmlObject);
        htmlObject.style.display = 'none';
        htmlObject.style.width = getComputedStyle(section).getPropertyValue('--outer');
        const padding = parseInt(getComputedStyle(htmlObject).getPropertyValue('width')) * 2;
        section.firstChild.remove();
        let tallest = 0;
        const frames = section.querySelectorAll('[data-overflow-frame]');
        const contentWrappers = section.querySelectorAll('[data-overflow-content]');
        contentWrappers.forEach((content)=>{
            if (content.offsetHeight > tallest) {
                tallest = content.offsetHeight;
            }
        });
        const images = section.querySelectorAll('[data-overflow-background]');
        let applySizes = [
            ...frames,
            ...images
        ];
        applySizes.forEach((el)=>{
            el.style.setProperty('min-height', `${tallest + padding}px`);
        });
        section.style.setProperty('min-height', `${tallest + padding + 2 + footerLogoH}px`);
    }
    function preventOverflow(container) {
        const singleFrames = container.querySelectorAll('.js-overflow-container');
        if (singleFrames) {
            singleFrames.forEach((frame)=>{
                const wrappers = frame.querySelectorAll('.js-overflow-content');
                singles(frame, wrappers);
                document.addEventListener('theme:resize', ()=>{
                    singles(frame, wrappers);
                });
            });
            // Reload slides if container has slideshow
            const slideshows = container.querySelectorAll('[data-slideshow-wrapper]');
            if (slideshows.length) {
                slideshows.forEach((slideshow)=>{
                    const slideshowInstance = FlickityFade.data(slideshow);
                    if (typeof slideshowInstance !== 'undefined') {
                        slideshowInstance.reloadCells();
                    }
                });
            }
        }
        const doubleSections = container.querySelectorAll('[data-overflow-wrapper]');
        if (doubleSections) {
            doubleSections.forEach((section)=>{
                doubles(section);
                document.addEventListener('theme:resize', ()=>{
                    doubles(section);
                });
            });
        }
    }

    // Adapted from https://github.com/component/debounce/blob/master/index.js
    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing. The function also has a property 'clear'
     * that is a function which will clear the timer to prevent previously scheduled executions.
     *
     * @source underscore.js
     * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
     * @param {Function} function to wrap
     * @param {Number} timeout in ms (`100`)
     * @param {Boolean} whether to execute at the beginning (`false`)
     * @api public
     */ function debounce$1(func, wait = 500, immediate = false) {
        var timeout, args, context, timestamp, result;
        if (wait == null) wait = 100;
        function later() {
            var last = Date.now() - timestamp;
            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null;
                }
            }
        }
        var debounced = function() {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
        debounced.clear = function() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        };
        debounced.flush = function() {
            if (timeout) {
                result = func.apply(context, args);
                context = args = null;
                clearTimeout(timeout);
                timeout = null;
            }
        };
        return debounced;
    }

    let lastWindowWidth = window.innerWidth;
    let lastWindowHeight = window.innerHeight;
    function dispatch$2() {
        document.dispatchEvent(new CustomEvent('theme:resize', {
            bubbles: true
        }));
        if (lastWindowWidth !== window.innerWidth) {
            document.dispatchEvent(new CustomEvent('theme:resize:width', {
                bubbles: true
            }));
            lastWindowWidth = window.innerWidth;
        }
        if (lastWindowHeight !== window.innerHeight) {
            document.dispatchEvent(new CustomEvent('theme:resize:height', {
                bubbles: true
            }));
            lastWindowHeight = window.innerHeight;
        }
    }
    let raf;
    function resizeListener() {
        window.addEventListener('resize', ()=>{
            if (raf) {
                window.cancelAnimationFrame(raf);
            }
            raf = window.requestAnimationFrame(debounce$1(dispatch$2, 50));
        });
    }

    let prev = window.pageYOffset;
    let up = null;
    let down = null;
    let wasUp = null;
    let wasDown = null;
    let scrollLockTimer = 0;
    function dispatch$1() {
        const position = window.pageYOffset;
        if (position > prev) {
            down = true;
            up = false;
        } else if (position < prev) {
            down = false;
            up = true;
        } else {
            up = null;
            down = null;
        }
        prev = position;
        document.dispatchEvent(new CustomEvent('theme:scroll', {
            detail: {
                up,
                down,
                position
            },
            bubbles: false
        }));
        if (up && !wasUp) {
            document.dispatchEvent(new CustomEvent('theme:scroll:up', {
                detail: {
                    position
                },
                bubbles: false
            }));
        }
        if (down && !wasDown) {
            document.dispatchEvent(new CustomEvent('theme:scroll:down', {
                detail: {
                    position
                },
                bubbles: false
            }));
        }
        wasDown = down;
        wasUp = up;
    }
    function lock(e) {
        // Prevent body scroll lock race conditions
        setTimeout(()=>{
            if (scrollLockTimer) {
                clearTimeout(scrollLockTimer);
            }
            scrollLock.disablePageScroll(e.detail, {
                allowTouchMove: (el)=>el.tagName === 'TEXTAREA'
            });
            document.documentElement.setAttribute('data-scroll-locked', '');
        });
    }
    function unlock(e) {
        const timeout = e.detail;
        if (timeout) {
            scrollLockTimer = setTimeout(removeScrollLock, timeout);
        } else {
            removeScrollLock();
        }
    }
    function removeScrollLock() {
        scrollLock.clearQueueScrollLocks();
        scrollLock.enablePageScroll();
        document.documentElement.removeAttribute('data-scroll-locked');
    }
    function scrollListener() {
        let raf;
        window.addEventListener('scroll', function() {
            if (raf) {
                window.cancelAnimationFrame(raf);
            }
            raf = window.requestAnimationFrame(dispatch$1);
        }, {
            passive: true
        });
        window.addEventListener('theme:scroll:lock', lock);
        window.addEventListener('theme:scroll:unlock', unlock);
    }

    const selectors$17 = {
        time: 'time',
        days: '[data-days]',
        hours: '[data-hours]',
        minutes: '[data-minutes]',
        seconds: '[data-seconds]',
        shopifySection: '.shopify-section'
    };
    const attributes$2 = {
        expirationBehavior: 'data-expiration-behavior'
    };
    const classes$I = {
        showMessage: 'show-message',
        hideCountdown: 'hidden'
    };
    const settings = {
        hideSection: 'hide-section',
        showMessage: 'show-message'
    };
    let CountdownTimer = class CountdownTimer extends HTMLElement {
        connectedCallback() {
            if (isNaN(this.endDate)) {
                this.onComplete();
                return;
            }
            if (this.endDate <= Date.now()) {
                this.onComplete();
                return;
            }
            // Update the countdown every second
            this.interval = setInterval(this.update, 1000);
        }
        disconnectedCallback() {
            this.stopTimer();
        }
        convertTime(timeInMs) {
            const days = this.formatDigits(parseInt(timeInMs / this.daysInMs, 10));
            timeInMs -= days * this.daysInMs;
            const hours = this.formatDigits(parseInt(timeInMs / this.hoursInMs, 10));
            timeInMs -= hours * this.hoursInMs;
            const minutes = this.formatDigits(parseInt(timeInMs / this.minutesInMs, 10));
            timeInMs -= minutes * this.minutesInMs;
            const seconds = this.formatDigits(parseInt(timeInMs / this.secondsInMs, 10));
            return {
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            };
        }
        // Make numbers less than 10 to appear with a leading zero like 01, 02, 03
        formatDigits(number) {
            if (number < 10) number = '0' + number;
            return number;
        }
        render(timer) {
            this.days.textContent = timer.days;
            this.hours.textContent = timer.hours;
            this.minutes.textContent = timer.minutes;
            this.seconds.textContent = timer.seconds;
        }
        stopTimer() {
            clearInterval(this.interval);
        }
        onComplete() {
            this.render({
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            });
            if (this.shouldHideOnComplete) {
                this.shopifySection.classList.add(classes$I.hideCountdown);
            }
            if (this.shouldShowMessage) {
                this.classList.add(classes$I.showMessage);
            }
        }
        // Function to update the countdown
        update() {
            const timeNow = new Date().getTime();
            const timeDiff = this.endDate - timeNow;
            if (timeDiff <= 0) {
                this.stopTimer();
                this.onComplete();
            }
            const timeRemaining = this.convertTime(timeDiff);
            this.render(timeRemaining);
        }
        constructor(){
            super();
            this.shopifySection = this.closest(selectors$17.shopifySection);
            this.expirationBehavior = this.getAttribute(attributes$2.expirationBehavior);
            this.time = this.querySelector(selectors$17.time);
            this.days = this.querySelector(selectors$17.days);
            this.hours = this.querySelector(selectors$17.hours);
            this.minutes = this.querySelector(selectors$17.minutes);
            this.seconds = this.querySelector(selectors$17.seconds);
            // Get the current and expiration dates in Unix timestamp format (milliseconds)
            this.endDate = Date.parse(this.time.dateTime);
            this.daysInMs = 1000 * 60 * 60 * 24;
            this.hoursInMs = this.daysInMs / 24;
            this.minutesInMs = this.hoursInMs / 60;
            this.secondsInMs = this.minutesInMs / 60;
            this.shouldHideOnComplete = this.expirationBehavior === settings.hideSection;
            this.shouldShowMessage = this.expirationBehavior === settings.showMessage;
            this.update = this.update.bind(this);
        }
    };

    resizeListener();
    scrollListener();
    // Remove "loading-shimmer" class from cached and very fast images
    removeLoadingClassFromLoadedImages(document);
    // Watch for any load events that bubble up from child elements
    document.addEventListener('load', (e)=>{
        const el = e.target;
        // Capture load events from img tags and then remove their `loading-shimmer` class
        handleImageLoaded(el);
    }, true);
    // Tasks to run when the DOM elements are available
    window.addEventListener('DOMContentLoaded', ()=>{
        setVarsOnResize();
        floatLabels(document);
        errorTabIndex(document);
        moveModals(document);
        if (window.theme.settings.animate_scroll) {
            AOS.refresh();
        }
    });
    // Tasks to run when entire page has finished loading including images, stylesheets, async scripts, etc
    window.addEventListener('load', ()=>{
        // Fix any text overflow in position:absolute elements
        preventOverflow(document);
        // Catch any images that loaded before our load event listener above and remove "loading-shimmer" class
        removeLoadingClassFromLoadedImages(document);
    });
    document.addEventListener('shopify:section:load', (e)=>{
        const container = e.target;
        floatLabels(container);
        errorTabIndex(container);
        moveModals(container);
        preventOverflow(container);
        if (window.theme.settings.animate_scroll) {
            AOS.refresh();
        }
    });
    document.addEventListener('shopify:section:reorder', ()=>{
        document.dispatchEvent(new CustomEvent('theme:header:check', {
            bubbles: false
        }));
    });
    if (!customElements.get('countdown-timer')) {
        customElements.define('countdown-timer', CountdownTimer);
    }

    const showElement = (elem, removeProp = false, prop = 'block')=>{
        if (elem) {
            if (removeProp) {
                elem.style.removeProperty('display');
            } else {
                elem.style.display = prop;
            }
        }
    };

    function FetchError(object) {
        this.status = object.status || null;
        this.headers = object.headers || null;
        this.json = object.json || null;
        this.body = object.body || null;
    }
    FetchError.prototype = Error.prototype;

    const selectors$16 = {
        scrollbar: 'data-scrollbar-slider',
        scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
        scrollbarArrowNext: '[data-scrollbar-arrow-next]'
    };
    const classes$H = {
        hidden: 'is-hidden'
    };
    const times$1 = {
        delay: 200
    };
    let NativeScrollbar = class NativeScrollbar {
        init() {
            if (this.arrowNext && this.arrowPrev) {
                if (window.isRTL) {
                    this.togglePrevArrow();
                } else {
                    this.toggleNextArrow();
                }
                this.events();
            }
        }
        resize() {
            document.addEventListener('theme:resize', ()=>{
                if (window.isRTL) {
                    this.togglePrevArrow();
                } else {
                    this.toggleNextArrow();
                }
            });
        }
        events() {
            this.arrowNext.addEventListener('click', (event)=>{
                event.preventDefault();
                this.goToNext();
            });
            this.arrowPrev.addEventListener('click', (event)=>{
                event.preventDefault();
                this.goToPrev();
            });
            this.scrollbar.addEventListener('scroll', ()=>{
                this.togglePrevArrow();
                this.toggleNextArrow();
            });
        }
        goToNext() {
            const position = this.scrollbar.getBoundingClientRect().width / 2 + this.scrollbar.scrollLeft;
            this.move(position);
            this.arrowPrev.classList.remove(classes$H.hidden);
            this.toggleNextArrow();
        }
        goToPrev() {
            const position = this.scrollbar.scrollLeft - this.scrollbar.getBoundingClientRect().width / 2;
            this.move(position);
            this.arrowNext.classList.remove(classes$H.hidden);
            this.togglePrevArrow();
        }
        toggleNextArrow() {
            setTimeout(()=>{
                if (window.isRTL) {
                    this.arrowNext.classList.toggle(classes$H.hidden, this.scrollbar.scrollLeft === 0);
                } else {
                    this.arrowNext.classList.toggle(classes$H.hidden, Math.round(this.scrollbar.scrollLeft + this.scrollbar.getBoundingClientRect().width + 1) >= this.scrollbar.scrollWidth);
                }
            }, times$1.delay);
        }
        togglePrevArrow() {
            setTimeout(()=>{
                if (window.isRTL) {
                    this.arrowPrev.classList.toggle(classes$H.hidden, Math.abs(this.scrollbar.scrollLeft) + this.scrollbar.getBoundingClientRect().width + 1 >= this.scrollbar.scrollWidth);
                } else {
                    this.arrowPrev.classList.toggle(classes$H.hidden, this.scrollbar.scrollLeft <= 0);
                }
            }, times$1.delay);
        }
        scrollToVisibleElement() {
            [].forEach.call(this.scrollbar.children, (element)=>{
                element.addEventListener('click', (event)=>{
                    if (event.target.tagName.toLowerCase() === 'a' || event.currentTarget && event.currentTarget.tagName.toLowerCase() === 'a' || event.currentTarget && event.currentTarget.querySelector('a')) {
                        event.preventDefault();
                    }
                    this.move(element.offsetLeft - element.clientWidth);
                });
            });
        }
        move(offsetLeft) {
            this.scrollbar.scrollTo({
                top: 0,
                left: offsetLeft,
                behavior: 'smooth'
            });
        }
        constructor(scrollbar){
            this.scrollbar = scrollbar;
            this.arrowNext = this.scrollbar.parentNode.querySelector(selectors$16.scrollbarArrowNext);
            this.arrowPrev = this.scrollbar.parentNode.querySelector(selectors$16.scrollbarArrowPrev);
            this.init();
            this.resize();
            if (this.scrollbar.hasAttribute(selectors$16.scrollbar)) {
                this.scrollToVisibleElement();
            }
        }
    };

    const selectors$15 = {
        siblingsInnerHolder: '[data-sibling-inner]'
    };
    let Siblings = class Siblings {
        init() {
            this.siblings.forEach((sibling)=>{
                new NativeScrollbar(sibling);
            });
        }
        constructor(holder){
            this.siblings = holder.querySelectorAll(selectors$15.siblingsInnerHolder);
            this.init();
        }
    };
    const siblings = {
        onLoad () {
            new Siblings(this.container);
        }
    };

    const cookieDefaultValues = {
        expires: 7,
        path: '/',
        domain: window.location.hostname
    };
    let Cookies = class Cookies {
        /**
       * Write cookie
       * @param value - String
       */ write(value) {
            document.cookie = `${this.options.name}=${value}; expires=${this.options.expires}; path=${this.options.path}; domain=${this.options.domain}`;
        }
        /**
       * Read cookies and returns an array of values
       * @returns Array
       */ read() {
            let cookieValuesArr = [];
            const hasCookieWithThisName = document.cookie.split('; ').find((row)=>row.startsWith(this.options.name)
            );
            if (document.cookie.indexOf('; ') !== -1 && hasCookieWithThisName) {
                const cookieValue = document.cookie.split('; ').find((row)=>row.startsWith(this.options.name)
                ).split('=')[1];
                if (cookieValue !== null) {
                    cookieValuesArr = cookieValue.split(',');
                }
            }
            return cookieValuesArr;
        }
        destroy() {
            document.cookie = `${this.options.name}=null; expires=${this.options.expires}; path=${this.options.path}; domain=${this.options.domain}`;
        }
        remove(removedValue) {
            const cookieValue = this.read();
            const position = cookieValue.indexOf(removedValue);
            if (position !== -1) {
                cookieValue.splice(position, 1);
                this.write(cookieValue);
            }
        }
        constructor(options = {}){
            this.options = {
                ...cookieDefaultValues,
                ...options
            };
        }
    };

    const config = {
        howManyToShow: 4,
        howManyToStoreInMemory: 10,
        wrapper: '[data-recently-viewed-products]',
        limit: 'data-limit',
        recentTabLink: '[data-recent-link-tab]',
        recentWrapper: '[data-recent-wrapper]',
        recentViewedTab: '[data-recently-viewed-tab]',
        tabsHolderScroll: '[data-tabs-holder-scroll]',
        apiContent: '[data-api-content]',
        dataMinimum: 'data-minimum',
        dataItemId: 'data-item-id'
    };
    const classes$G = {
        hide: 'hide',
        containerWithoutTabsNav: 'section-without-title--skip'
    };
    const cookieConfig = {
        expires: 90,
        name: 'shopify_recently_viewed'
    };
    const sections$p = [];
    const excludedHandles = [];
    let RecentProducts = class RecentProducts {
        renderProducts() {
            const recentlyViewedHandlesArray = this.cookie.read();
            const arrayURLs = [];
            let counter = 0;
            if (recentlyViewedHandlesArray.length > 0) {
                for(let index = 0; index < recentlyViewedHandlesArray.length; index++){
                    const handle = recentlyViewedHandlesArray[index];
                    if (excludedHandles.includes(handle)) {
                        continue;
                    }
                    const url = `${window.theme.routes.root_url}products/${handle}?section_id=api-product-grid-item`;
                    arrayURLs.push(url);
                    counter++;
                    if (counter === this.howManyToShow || counter === recentlyViewedHandlesArray.length - 1) {
                        break;
                    }
                }
                if (arrayURLs.length > 0 && arrayURLs.length >= this.minimum) {
                    this.container.classList.remove(classes$G.hide);
                    if (this.recentViewedLink && this.recentViewedLink.previousElementSibling) {
                        this.tabsHolderScroll.classList.remove(classes$G.hide);
                        this.container.classList.add(classes$G.containerWithoutTabsNav);
                    }
                    const fecthRequests = arrayURLs.map((url)=>fetch(url, {
                            mode: 'no-cors'
                        }).then(this.handleErrors)
                    );
                    const productMarkups = [];
                    Promise.allSettled(fecthRequests).then((responses)=>{
                        return Promise.all(responses.map(async (response)=>{
                            if (response.status === 'fulfilled') {
                                productMarkups.push(await response.value.text());
                            }
                        }));
                    }).then(()=>{
                        productMarkups.forEach((markup)=>{
                            const buffer = document.createElement('div');
                            const slide = document.createElement('div');
                            buffer.innerHTML = markup;
                            const item = buffer.querySelector(`[${config.dataItemId}]`);
                            const isEmptyProduct = item.getAttribute(config.dataItemId) === '';
                            if (isEmptyProduct) {
                                return;
                            }
                            slide.classList.add('product-grid-slide');
                            slide.setAttribute('data-carousel-slide', null);
                            slide.setAttribute('data-item', null);
                            slide.innerHTML = buffer.querySelector(config.apiContent).innerHTML;
                            this.wrapper.appendChild(slide);
                        });
                        new Siblings(this.container);
                    }).then(()=>{
                        showElement(this.wrapper, true);
                        this.container.dispatchEvent(new CustomEvent('theme:recent-products:added', {
                            bubbles: true
                        }));
                    });
                } else if (this.recentViewedTab) {
                    const hasSiblingTabs = Array.prototype.filter.call(this.recentViewedTab.parentNode.children, (child)=>{
                        return child !== this.recentViewedTab;
                    }).length > 1;
                    if (this.recentViewedLink && this.recentViewedLink.previousElementSibling) {
                        this.tabsHolderScroll.classList.add(classes$G.hide);
                        this.container.classList.remove(classes$G.containerWithoutTabsNav);
                    }
                    if (!hasSiblingTabs) {
                        this.container.classList.add(classes$G.hide);
                    }
                } else {
                    this.container.classList.add(classes$G.hide);
                }
            }
        }
        handleErrors(response) {
            if (!response.ok) {
                return response.text().then(function(text) {
                    const e = new FetchError({
                        status: response.statusText,
                        headers: response.headers,
                        text: text
                    });
                    throw e;
                });
            }
            return response;
        }
        constructor(section){
            this.container = section.container;
            this.cookie = new Cookies(cookieConfig);
            this.wrapper = this.container.querySelector(config.wrapper);
            if (this.wrapper === null) {
                return;
            }
            this.howManyToShow = parseInt(this.container.querySelector(config.recentWrapper).getAttribute(config.limit)) || config.howManyToShow;
            this.minimum = parseInt(this.container.querySelector(config.recentWrapper).getAttribute(config.dataMinimum));
            this.recentViewedTab = this.container.querySelector(config.recentViewedTab);
            this.recentViewedLink = this.container.querySelector(config.recentTabLink);
            this.tabsHolderScroll = this.container.querySelector(config.tabsHolderScroll);
            this.renderProducts();
        }
    };
    let RecordRecentlyViewed = class RecordRecentlyViewed {
        updateCookie() {
            let recentlyViewed = this.cookie.read();
            // In what position is that product in memory.
            const position = recentlyViewed.indexOf(this.handle);
            // If not in memory.
            if (position === -1) {
                // Add product at the start of the list.
                recentlyViewed.unshift(this.handle);
                // Only keep what we need.
                recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
            } else {
                // Remove the product and place it at start of list.
                recentlyViewed.splice(position, 1);
                recentlyViewed.unshift(this.handle);
            }
            // Update cookie.
            const recentlyViewedString = recentlyViewed.join(',');
            this.cookie.write(recentlyViewedString);
        }
        constructor(handle){
            this.handle = encodeURIComponent(handle);
            this.cookie = new Cookies(cookieConfig);
            if (typeof this.handle === 'undefined') {
                return;
            }
            excludedHandles.push(this.handle);
            this.updateCookie();
        }
    };
    const recentProducts = {
        onLoad () {
            sections$p[this.id] = new RecentProducts(this);
        }
    };

    /**
     * Checks the device resolution/touch
     * -----------------------------------------------------------------------------
     *
     * Ensures that we always know if we are using a Touch, Mobile, Tablet, or Desktop device.
     *
     * if (resolution.isMobile) {}
     *
     * It refreshes dynamically. We can also check when that happens by using the onChange method:
     *
     * resolution.onChange(() => {
     *  // only triggers once when we hop between different media screen sizes
     *  // for example, from Mobile(<= 768px) to Tablet(>= 769px and <=1100px)
     *  // or from Tablet(>= 769px and <=1100px) to Desktop(>=1101px)
     *
     *  if (resolution.isMobile() || resolution.isTouch()) {}
     * });
     *
     */ function resolution$1() {
        const touchQuery = `(any-pointer: coarse)`;
        const mobileQuery = `(max-width: ${window.theme.sizes.medium}px)`;
        const tabletQuery = `(min-width: ${window.theme.sizes.medium + 1}px) and (max-width: ${window.theme.sizes.large}px)`;
        const desktopQuery = `(min-width: ${window.theme.sizes.large + 1}px)`;
        resolution$1.isTouch = ()=>{
            const touchMatches = window.matchMedia(touchQuery).matches;
            document.documentElement.classList.toggle('supports-touch', touchMatches);
            return touchMatches;
        };
        resolution$1.isMobile = ()=>window.matchMedia(mobileQuery).matches
        ;
        resolution$1.isTablet = ()=>window.matchMedia(tabletQuery).matches
        ;
        resolution$1.isDesktop = ()=>window.matchMedia(desktopQuery).matches
        ;
        const queries = [
            [
                touchQuery,
                resolution$1.isTouch
            ],
            [
                mobileQuery,
                resolution$1.isMobile
            ],
            [
                tabletQuery,
                resolution$1.isTablet
            ],
            [
                desktopQuery,
                resolution$1.isDesktop
            ], 
        ];
        resolution$1.onChange = (callback)=>{
            queries.forEach((query)=>{
                window.matchMedia(query[0]).addEventListener('change', ()=>{
                    if (query[1]() && callback) callback();
                });
            });
        };
    }resolution$1();

    function Listeners() {
        this.entries = [];
    }Listeners.prototype.add = function(element, event, fn) {
        this.entries.push({
            element: element,
            event: event,
            fn: fn
        });
        element.addEventListener(event, fn);
    };
    Listeners.prototype.removeAll = function() {
        this.entries = this.entries.filter(function(listener) {
            listener.element.removeEventListener(listener.event, listener.fn);
            return false;
        });
    };

    /**
     * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */ function getVariantFromSerializedArray(product, collection) {
        _validateProductStructure(product);
        // If value is an array of options
        var optionArray = _createOptionArrayFromOptionCollection(product, collection);
        return getVariantFromOptionArray(product, optionArray);
    }
    /**
     * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */ function getVariantFromOptionArray(product, options) {
        _validateProductStructure(product);
        _validateOptionsArray(options);
        var result = product.variants.filter(function(variant) {
            return options.every(function(option, index) {
                return variant.options[index] === option;
            });
        });
        return result[0] || null;
    }
    /**
     * Creates an array of selected options from the object
     * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
     * @param {Object} product Product JSON object
     * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
     */ function _createOptionArrayFromOptionCollection(product, collection) {
        _validateProductStructure(product);
        _validateSerializedArray(collection);
        var optionArray = [];
        collection.forEach(function(option) {
            for(var i = 0; i < product.options.length; i++){
                var name = product.options[i].name || product.options[i];
                if (name.toLowerCase() === option.name.toLowerCase()) {
                    optionArray[i] = option.value;
                    break;
                }
            }
        });
        return optionArray;
    }
    /**
     * Check if the product data is a valid JS object
     * Error will be thrown if type is invalid
     * @param {object} product Product JSON object
     */ function _validateProductStructure(product) {
        if (typeof product !== 'object') {
            throw new TypeError(product + ' is not an object.');
        }
        if (Object.keys(product).length === 0 && product.constructor === Object) {
            throw new Error(product + ' is empty.');
        }
    }
    /**
     * Validate the structure of the array
     * It must be formatted like jQuery's serializeArray()
     * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
     */ function _validateSerializedArray(collection) {
        if (!Array.isArray(collection)) {
            throw new TypeError(collection + ' is not an array.');
        }
        if (collection.length === 0) {
            throw new Error(collection + ' is empty.');
        }
        if (collection[0].hasOwnProperty('name')) {
            if (typeof collection[0].name !== 'string') {
                throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
            }
        } else {
            throw new Error(collection[0] + 'does not contain name key.');
        }
    }
    /**
     * Validate the structure of the array
     * It must be formatted as list of values
     * @param {Array} collection Array of object (e.g. ['36', 'Black'])
     */ function _validateOptionsArray(options) {
        if (Array.isArray(options) && typeof options[0] === 'object') {
            throw new Error(options + 'is not a valid array of options.');
        }
    }

    var selectors$14 = {
        idInput: '[name="id"]',
        planInput: '[name="selling_plan"]',
        optionInput: '[name^="options"]',
        quantityInput: '[name="quantity"]',
        propertyInput: '[name^="properties"]'
    };
    /**
     * Constructor class that creates a new instance of a product form controller.
     *
     * @param {Element} element - the outer wrapper containing the product form and all related input elements
     * @param {Object} form - DOM element which is equal to the <form> node to submit the product form inputs
     * @param {Object} product - A product object
     * @param {Object} options - Optional options object
     * @param {Function} options.onOptionChange - Callback for whenever an option input changes
     * @param {Function} options.onPlanChange - Callback for changes to name=selling_plan
     * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
     * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
     * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
     */ let ProductFormReader = class ProductFormReader {
        /**
       * Cleans up all event handlers that were assigned when the Product Form was constructed.
       * Useful for use when a section needs to be reloaded in the theme editor.
       */ destroy() {
            this._listeners.removeAll();
        }
        /**
       * Getter method which returns the array of currently selected option values
       *
       * @returns {Array} An array of option values
       */ options() {
            return this._serializeInputValues(this.optionInputs, function(item) {
                var regex = /(?:^(options\[))(.*?)(?:\])/;
                item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
                return item;
            });
        }
        /**
       * Getter method which returns the currently selected variant, or `null` if variant
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */ variant() {
            const opts = this.options();
            if (opts.length) {
                return getVariantFromSerializedArray(this.product, opts);
            } else {
                return this.product.variants[0];
            }
        }
        /**
       * Getter method which returns the current selling plan, or `null` if plan
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */ plan(variant) {
            let plan = {
                allocation: null,
                group: null,
                detail: null
            };
            const formData = new FormData(this.form);
            const id = formData.get('selling_plan');
            if (variant && variant.selling_plan_allocations && variant.selling_plan_allocations.length > 0) {
                const uniqueVariantSellingPlanGroupIDs = [
                    ...new Set(variant.selling_plan_allocations.map((sellingPlan)=>sellingPlan.selling_plan_group_id
                    ))
                ];
                const productSubsGroup = this.element.querySelectorAll('[data-subscription-group]');
                if (!productSubsGroup.length) {
                    return;
                }
                productSubsGroup.forEach((group)=>group.style.display = "none"
                );
                uniqueVariantSellingPlanGroupIDs.forEach((groupId)=>{
                    this.element.querySelector(`[data-selling-plan-group="${groupId}"]`).style.display = "block";
                });
            }
            if (id && variant) {
                plan.allocation = variant.selling_plan_allocations.find(function(item) {
                    return item.selling_plan_id.toString() === id.toString();
                });
            }
            if (plan.allocation) {
                plan.group = this.product.selling_plan_groups.find(function(item) {
                    return item.id.toString() === plan.allocation.selling_plan_group_id.toString();
                });
            }
            if (plan.group) {
                plan.detail = plan.group.selling_plans.find(function(item) {
                    return item.id.toString() === id.toString();
                });
            }
            if (plan && plan.allocation && plan.detail && plan.allocation) {
                return plan;
            } else return null;
        }
        /**
       * Getter method which returns a collection of objects containing name and values
       * of property inputs
       *
       * @returns {Array} Collection of objects with name and value keys
       */ properties() {
            return this._serializeInputValues(this.propertyInputs, function(item) {
                var regex = /(?:^(properties\[))(.*?)(?:\])/;
                item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
                return item;
            });
        }
        /**
       * Getter method which returns the current quantity or 1 if no quantity input is
       * included in the form
       *
       * @returns {Array} Collection of objects with name and value keys
       */ quantity() {
            return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
        }
        getFormState() {
            const variant = this.variant();
            return {
                options: this.options(),
                variant: variant,
                properties: this.properties(),
                quantity: this.quantity(),
                plan: this.plan(variant)
            };
        }
        // Private Methods
        // -----------------------------------------------------------------------------
        _setIdInputValue(variant) {
            if (variant && variant.id) {
                this.variantElement.value = variant.id.toString();
            } else {
                this.variantElement.value = '';
            }
            this.variantElement.dispatchEvent(new Event('change'));
        }
        _onSubmit(options, event) {
            event.dataset = this.getFormState();
            if (options.onFormSubmit) {
                options.onFormSubmit(event);
            }
        }
        _onOptionChange(event) {
            this._setIdInputValue(event.dataset.variant);
        }
        _onFormEvent(cb) {
            if (typeof cb === 'undefined') {
                return Function.prototype;
            }
            return (function(event) {
                event.dataset = this.getFormState();
                this._setIdInputValue(event.dataset.variant);
                cb(event);
            }).bind(this);
        }
        _initInputs(selector, cb) {
            var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));
            return elements.map((function(element) {
                this._listeners.add(element, 'change', this._onFormEvent(cb));
                return element;
            }).bind(this));
        }
        _serializeInputValues(inputs, transform) {
            return inputs.reduce(function(options, input) {
                if (input.checked || input.type !== 'radio' && input.type !== 'checkbox' // Or if its any other type of input
                ) {
                    options.push(transform({
                        name: input.name,
                        value: input.value
                    }));
                }
                return options;
            }, []);
        }
        _validateProductObject(product) {
            if (typeof product !== 'object') {
                throw new TypeError(product + ' is not an object.');
            }
            if (typeof product.variants[0].options === 'undefined') {
                throw new TypeError('Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route');
            }
            return product;
        }
        constructor(element, form, product, options){
            this.element = element;
            this.form = form.tagName == 'FORM' ? form : form.querySelector('form');
            this.product = this._validateProductObject(product);
            this.variantElement = this.form.querySelector(selectors$14.idInput);
            options = options || {};
            this.clickedElement = null;
            this._listeners = new Listeners();
            this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));
            this.optionInputs = this._initInputs(selectors$14.optionInput, options.onOptionChange);
            this.planInputs = this._initInputs(selectors$14.planInput, options.onPlanChange);
            this.quantityInputs = this._initInputs(selectors$14.quantityInput, options.onQuantityChange);
            this.propertyInputs = this._initInputs(selectors$14.propertyInput, options.onPropertyChange);
        }
    };

    function getProductJson(handle) {
        const requestRoute = `${window.theme.routes.root_url}products/${handle}.js`;
        return window.fetch(requestRoute).then((response)=>{
            return response.json();
        }).catch((e)=>{
            console.error(e);
        });
    }

    function getScript(url, callback, callbackError) {
        let head = document.getElementsByTagName('head')[0];
        let done = false;
        let script = document.createElement('script');
        script.src = url;
        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
                callback();
            } else {
                callbackError();
            }
        };
        head.appendChild(script);
    }

    const loaders = {};
    function loadScript(options = {}) {
        if (!options.type) {
            options.type = 'json';
        }
        if (options.url) {
            if (loaders[options.url]) {
                return loaders[options.url];
            } else {
                return getScriptWithPromise(options.url, options.type);
            }
        } else if (options.json) {
            if (loaders[options.json]) {
                return Promise.resolve(loaders[options.json]);
            } else {
                const request = window.fetch(options.json).then((response)=>{
                    return response.json();
                }).then((response)=>{
                    loaders[options.json] = response;
                    return response;
                }).catch((error)=>{
                    loaders[options.json] = null;
                });
                loaders[options.json] = request;
                return request;
            }
        } else if (options.name) {
            const key = ''.concat(options.name, options.version);
            if (loaders[key]) {
                return loaders[key];
            } else {
                return loadShopifyWithPromise(options);
            }
        } else {
            return Promise.reject();
        }
    }function getScriptWithPromise(url, type) {
        const loader = new Promise((resolve, reject)=>{
            if (type === 'text') {
                fetch(url).then((response)=>response.text()
                ).then((data)=>{
                    resolve(data);
                }).catch((error)=>{
                    reject(error);
                });
            } else {
                getScript(url, function() {
                    resolve();
                }, function() {
                    reject();
                });
            }
        });
        loaders[url] = loader;
        return loader;
    }
    function loadShopifyWithPromise(options) {
        const key = ''.concat(options.name, options.version);
        const loader = new Promise((resolve, reject)=>{
            try {
                window.Shopify.loadFeatures([
                    {
                        name: options.name,
                        version: options.version,
                        onLoad: (err)=>{
                            onLoadFromShopify(resolve, reject, err);
                        }
                    }, 
                ]);
            } catch (err) {
                reject(err);
            }
        });
        loaders[key] = loader;
        return loader;
    }
    function onLoadFromShopify(resolve, reject, err) {
        if (err) {
            return reject(err);
        } else {
            return resolve();
        }
    }

    const selectors$13 = {
        wrapper: '[data-swapper-wrapper]',
        target: '[data-swapper-target]',
        hover: 'data-swapper-hover'
    };
    let sections$o = {};
    let Swapper = class Swapper {
        init() {
            this.hovers.forEach((hover)=>{
                hover.addEventListener('mouseenter', (function() {
                    const newContent = hover.getAttribute(selectors$13.hover);
                    this.target.innerHTML = `${newContent}`;
                }).bind(this));
            });
            this.hovers.forEach((hover)=>{
                hover.addEventListener('mouseleave', (function() {
                    this.target.innerHTML = this.deafaultContent;
                }).bind(this));
            });
            this.hovers.forEach((hover)=>{
                hover.addEventListener('click', (function() {
                    const clickedContent = hover.getAttribute(selectors$13.hover);
                    this.deafaultContent = `${clickedContent}`;
                }).bind(this));
            });
        }
        constructor(el){
            this.container = el;
            this.target = this.container.querySelector(selectors$13.target);
            this.hovers = this.container.querySelectorAll(`[${selectors$13.hover}]`);
            if (this.target && this.hovers.length) {
                this.deafaultContent = this.target.innerHTML;
                this.init();
            }
        }
    };
    function makeSwappers(container) {
        sections$o[container.id] = [];
        const els = container.querySelectorAll(selectors$13.wrapper);
        els.forEach((el)=>{
            sections$o[container.id].push(new Swapper(el));
        });
    }
    const swapperSection = {
        onLoad () {
            makeSwappers(this.container);
        }
    };

    const defaults$2 = {
        color: 'ash'
    };
    const selectors$12 = {
        swatch: 'data-swatch',
        outerGrid: '[data-grid-item]',
        imageSlide: '[data-grid-image]',
        dataGridImageDefault: 'data-grid-image-default',
        dataGridImageTarget: 'data-grid-image-target',
        image: 'data-swatch-image',
        imageId: 'data-swatch-image-id',
        variant: 'data-swatch-variant',
        link: '[data-grid-link]',
        wrapper: '[data-grid-swatches]',
        template: '[data-swatch-template]',
        handle: 'data-swatch-handle',
        label: 'data-swatch-label',
        index: 'data-swatch-index',
        dataMediaId: 'data-media-id',
        dataMediaSrcPlaceholder: 'data-media-src-placeholder',
        dataFetchedImage: 'data-fetched-image',
        dataFetchedImageIndex: 'data-fetched-image-index'
    };
    const classes$F = {
        fade: 'is-fade'
    };
    let ColorMatch = class ColorMatch {
        getColor() {
            return this.match;
        }
        init() {
            const getColors = loadScript({
                json: window.theme.assets.swatches
            });
            return getColors.then((colors)=>{
                return this.matchColors(colors, this.settings.color);
            }).catch((e)=>{
                console.log('failed to load swatch colors script');
                console.log(e);
            });
        }
        matchColors(colors, name) {
            let bg = '#E5E5E5';
            let img = null;
            const path = window.theme.assets.base || '/';
            const comparisonName = name.toLowerCase().replace(/\s/g, '');
            const array = colors.colors;
            if (array) {
                const variantNameMatch = (nameObject)=>{
                    const indexName = Object.keys(nameObject).toString();
                    const neatName = indexName.toLowerCase().replace(/\s/g, '');
                    return neatName === comparisonName;
                };
                const position = array.findIndex(variantNameMatch);
                if (position > -1) {
                    const value = Object.values(array[position])[0];
                    const valueLowerCase = value.toLowerCase();
                    if (valueLowerCase.includes('.jpg') || valueLowerCase.includes('.jpeg') || valueLowerCase.includes('.png') || valueLowerCase.includes('.svg')) {
                        img = `${path}${encodeURIComponent(value)}`;
                        bg = '#888888';
                    } else {
                        bg = value;
                    }
                }
            }
            return {
                color: this.settings.color,
                path: img,
                hex: bg
            };
        }
        constructor(options = {}){
            this.settings = {
                ...defaults$2,
                ...options
            };
            this.match = this.init();
        }
    };
    let RadioSwatch = class RadioSwatch extends HTMLElement {
        init() {
            this.setStyles();
            // Change PGI slider image
            if (this.variant && this.outer) {
                // Get images on quickview load
                this.outer.addEventListener('theme:quickview:media', (e)=>{
                    if (e && e.detail && e.detail.media) {
                        this.media = e.detail.media;
                    }
                });
            }
        }
        setStyles() {
            if (this.colorMatch.hex) {
                this.element.style.setProperty('--swatch', `${this.colorMatch.hex}`);
            }
            if (this.colorMatch.path) {
                this.element.style.setProperty('background-image', `url(${this.colorMatch.path})`);
                this.element.style.setProperty('background-size', 'cover');
            }
        }
        replaceImage() {
            // Add new loaded image in PGI slider
            if (this.imageReplace && this.imageSlide && this.imageId) {
                if (this.imageSlide.hasAttribute(selectors$12.dataGridImageTarget) && this.imageSlide.getAttribute(selectors$12.dataGridImageTarget) !== this.imageId) {
                    this.imageSlide.classList.add(classes$F.fade);
                    const timeoutDelay = parseFloat(window.getComputedStyle(this.imageSlide).getPropertyValue('animation-duration')) * 1000;
                    setTimeout(()=>{
                        this.imageSlide.classList.remove(classes$F.fade);
                    }, timeoutDelay);
                }
                this.imageSlide.setAttribute(selectors$12.dataGridImageTarget, this.imageId);
                this.imageSlide.style.setProperty('background-color', '#fff');
                if (!this.imageSlide.hasAttribute(selectors$12.dataGridImageDefault)) {
                    this.imageSlide.setAttribute(selectors$12.dataGridImageDefault, window.getComputedStyle(this.imageSlide).backgroundImage);
                }
                this.imageSlide.style.setProperty('background-image', this.imageReplace);
            }
        }
        constructor(){
            super();
            this.element = this.querySelector(`[${selectors$12.swatch}]`);
            this.colorString = this.element.getAttribute(selectors$12.swatch);
            this.image = this.element.getAttribute(selectors$12.image);
            this.imageId = this.element.getAttribute(selectors$12.imageId);
            this.variant = this.element.getAttribute(selectors$12.variant);
            this.outer = this.element.closest(selectors$12.outerGrid);
            this.media = null;
            this.imageSlide = null;
            this.imageDefault = null;
            this.stopSlideAnimation = false;
            const matcher = new ColorMatch({
                color: this.colorString
            });
            matcher.getColor().then((result)=>{
                this.colorMatch = result;
                this.init();
            });
        }
    };
    let GridSwatch = class GridSwatch {
        init() {
            this.wrap.innerHTML = '';
            this.swatches.forEach((swatch, index)=>{
                let variant1 = this.product.variants.find((variant)=>{
                    return variant.options.includes(swatch);
                });
                const image = variant1.featured_media ? variant1.featured_media.preview_image.src : '';
                const imageId = variant1.featured_media ? variant1.featured_media.id : '';
                const rand = Math.floor(Math.random() * 9999);
                this.wrap.innerHTML += Sqrl__namespace.render(this.template, {
                    color: swatch,
                    uniq: `${this.product.id}-${variant1.id}-${rand}`,
                    variant: variant1.id,
                    product_id: this.product.id,
                    image_id: imageId,
                    image,
                    index
                });
            });
            new NativeScrollbar(this.wrap);
        }
        constructor(wrap){
            this.template = document.querySelector(selectors$12.template).innerHTML;
            this.wrap = wrap;
            this.handle = wrap.getAttribute(selectors$12.handle);
            const label = wrap.getAttribute(selectors$12.label).trim().toLowerCase();
            getProductJson(this.handle).then((product)=>{
                this.product = product;
                this.colorOption = product.options.find(function(element) {
                    return element.name.toLowerCase() === label || null;
                });
                if (this.colorOption) {
                    this.swatches = this.colorOption.values;
                    this.init();
                }
            });
        }
    };
    function makeGridSwatches(container) {
        const gridSwatchWrappers = container.querySelectorAll(selectors$12.wrapper);
        gridSwatchWrappers.forEach((wrap)=>{
            new GridSwatch(wrap);
        });
    }
    const swatchGridSection = {
        onLoad () {
            makeGridSwatches(this.container);
            makeSwappers(this.container);
        }
    };

    const selectors$11 = {
        holderItems: '[data-custom-scrollbar-items]',
        scrollbar: '[data-custom-scrollbar]',
        scrollbarTrack: '[data-custom-scrollbar-track]'
    };
    const classes$E = {
        hide: 'hide'
    };
    const sections$n = {};
    let CustomScrollbar = class CustomScrollbar {
        events() {
            this.holderItems.addEventListener('scroll', this.calculatePosition.bind(this));
            this.holderItems.addEventListener('theme:carousel:scroll', this.calculatePosition.bind(this));
            document.addEventListener('theme:resize:width', this.calculateTrackWidth.bind(this));
            document.addEventListener('theme:resize:width', this.calculatePosition.bind(this));
        }
        calculateTrackWidth() {
            // Javascript can't execute calc() (from `--outer` variable) - create a new div with width property instead `getPropertyValue('--outer')` to can get the width of `after` on the holder
            const htmlObject = document.createElement('div');
            this.holderItems.prepend(htmlObject);
            htmlObject.style.display = 'none';
            htmlObject.style.width = getComputedStyle(this.holderItems).getPropertyValue('--outer');
            const widthAfter = parseInt(getComputedStyle(htmlObject).getPropertyValue('width'));
            this.holderItems.firstChild.remove();
            this.scrollbarWidth = this.scrollbar.clientWidth === 0 ? this.scrollbar.parentNode.getBoundingClientRect().width : this.scrollbar.clientWidth;
            setTimeout(()=>{
                const childWidth = this.children[0].clientWidth;
                const childMarginRight = Number(getComputedStyle(this.children[0]).marginRight.replace('px', ''));
                const childMarginLeft = Number(getComputedStyle(this.children[0]).marginLeft.replace('px', ''));
                // Minus `childMarginRight` is added to the end with minus because the last child doesn't have margin-right
                this.scrollWidth = this.children.length * (childWidth + childMarginRight + childMarginLeft) + widthAfter - childMarginRight;
                this.trackWidth = (this.scrollbarWidth + widthAfter) / this.scrollWidth * 100;
                this.trackWidth = this.trackWidth < 5 ? 5 : this.trackWidth;
                this.scrollbar.style.setProperty('--track-width', `${this.trackWidth}%`);
                const hideScrollbar = Math.ceil(this.trackWidth) >= 100;
                this.scrollbar.classList.toggle(classes$E.hide, hideScrollbar);
            }, 100);
        }
        calculatePosition() {
            let position = this.holderItems.scrollLeft / (this.holderItems.scrollWidth - this.holderItems.clientWidth);
            position *= this.scrollbar.clientWidth - this.scrollbarTrack.clientWidth;
            position = position < 0 ? 0 : position;
            position = isNaN(position) ? 0 : position;
            this.scrollbar.style.setProperty('--position', `${Math.round(position)}px`);
            document.dispatchEvent(new CustomEvent('theme:scrollbar:scroll', {
                bubbles: true,
                detail: {
                    holder: this.holderItems
                }
            }));
        }
        constructor(holder, children = null){
            this.holderItems = holder.querySelector(selectors$11.holderItems);
            this.scrollbar = holder.querySelector(selectors$11.scrollbar);
            this.scrollbarTrack = holder.querySelector(selectors$11.scrollbarTrack);
            this.trackWidth = 0;
            this.scrollWidth = 0;
            if (this.scrollbar && this.holderItems) {
                this.children = children || this.holderItems.children;
                this.events();
                this.calculateTrackWidth();
            }
        }
    };
    const customScrollbar = {
        onLoad () {
            sections$n[this.id] = new CustomScrollbar(this.container);
        }
    };

    const selectors$10 = {
        carousel: '[data-carousel]',
        carouselWithProgress: 'data-carousel-progress',
        carouselSlide: '[data-carousel-slide]',
        carouselFirstSlidePhoto: '[data-grid-slide]',
        pgiFirstSlidePhoto: 'product-grid-item-variant:not([hidden]) [data-grid-slide]',
        wrapper: '[data-wrapper]',
        carouselTrack: '[data-carousel-track]',
        slider: '.flickity-slider',
        carouselOptions: 'data-options',
        carouselCustomScrollbar: 'data-custom-scrollbar-items',
        carouselPrev: '.flickity-button.previous',
        carouselNext: '.flickity-button.next',
        recentlyViewHolder: 'data-recently-viewed-products',
        relatedHolder: 'data-related-products',
        sectionHolder: '[data-section-id]'
    };
    const classes$D = {
        wrapper: 'wrapper',
        arrowsForceTop: 'flickity-force-arrows-top',
        arrowsOnSide: 'not-moved-arrows',
        hide: 'hide',
        flickityEnabled: 'flickity-enabled',
        hiddenArrows: 'hidden-arrows',
        flickityStatic: 'flickity-static'
    };
    const offsets$1 = {
        additionalOffsetWrapper: 112
    };
    let Carousel = class Carousel extends HTMLElement {
        connectedCallback() {
            this.carousel = this.container.querySelector(selectors$10.carousel);
            this.carouselTrack = this.container.querySelector(selectors$10.carouselTrack);
            this.wrapper = this.container.closest(selectors$10.wrapper);
            this.section = this.container.closest(selectors$10.sectionHolder);
            this.slidesVisible = null;
            this.carouselInstance = null;
            this.carouselPrev = null;
            this.carouselNext = null;
            this.customOptions = {};
            this.toggleWrapperModifierEvent = ()=>this.toggleWrapperModifier()
            ;
            if (this.carousel && this.carousel.hasAttribute(selectors$10.recentlyViewHolder)) {
                // Check carousel in recently viewed products
                this.section.addEventListener('theme:recent-products:added', ()=>{
                    this.init();
                });
            } else if (this.carousel && this.carousel.hasAttribute(selectors$10.relatedHolder)) {
                // Check carousel in recommendation products but without overwrite option
                this.section.addEventListener('theme:related-products:added', ()=>{
                    this.init();
                });
            } else {
                this.init();
            }
        }
        init() {
            if (!this.carousel) {
                return;
            }
            this.slidesTotal = this.carousel.querySelectorAll(selectors$10.carouselSlide).length;
            this.getGridLayout();
            this.trackVisibleSlides();
            if (this.carousel.hasAttribute(selectors$10.carouselOptions)) {
                this.customOptions = JSON.parse(decodeURIComponent(this.carousel.getAttribute(selectors$10.carouselOptions)));
            }
            this.initCarousel();
            this.calculatedArrowsTopPosition();
            this.toggleWrapperModifier();
            document.addEventListener('theme:resize:width', this.toggleWrapperModifierEvent);
            if (this.carousel.hasAttribute(selectors$10.carouselWithProgress)) {
                this.progressBarCalculate();
            }
            if (this.carousel.hasAttribute(selectors$10.carouselCustomScrollbar)) {
                new CustomScrollbar(this.container);
            }
        }
        initCarousel() {
            this.options = {
                accessibility: true,
                contain: true,
                freeScroll: true,
                prevNextButtons: true,
                wrapArround: false,
                groupCells: false,
                autoPlay: false,
                pageDots: false,
                cellAlign: window.isRTL ? 'right' : 'left',
                rightToLeft: window.isRTL,
                dragThreshold: 10,
                arrowShape: {
                    x0: 10,
                    x1: 60,
                    y1: 50,
                    x2: 67.5,
                    y2: 42.5,
                    x3: 25
                },
                on: {
                    ready: ()=>{
                        this.removeIncorrectAria();
                    },
                    resize: ()=>{
                        this.toggleArrows();
                        this.calculatedArrowsTopPosition();
                        setTimeout(()=>{
                            this.visibleSlides();
                        }, 100);
                    }
                },
                ...this.customOptions
            };
            this.carouselInstance = new Flickity(this.carousel, this.options);
            this.carouselPrev = this.carousel.querySelector(selectors$10.carouselPrev);
            this.carouselNext = this.carousel.querySelector(selectors$10.carouselNext);
            this.container.addEventListener('theme:tab:change', ()=>{
                this.carouselInstance.resize();
                this.carouselPrev = this.carousel.querySelector(selectors$10.carouselPrev);
                this.carouselNext = this.carousel.querySelector(selectors$10.carouselNext);
            });
            this.carouselInstance.on('dragStart', ()=>{
                this.carouselInstance.slider.style.pointerEvents = 'none';
                if (!resolution$1.isMobile) this.containDrag();
            });
            this.carouselInstance.on('dragEnd', ()=>{
                this.carouselInstance.slider.style.pointerEvents = 'auto';
                if (!resolution$1.isMobile) this.containDrag();
            });
            this.carouselInstance.on('change', (index)=>this.lockArrows(index)
            );
            setTimeout(()=>{
                this.visibleSlides();
            }, 100);
            if (Shopify.designMode) {
                setTimeout(()=>{
                    if (this.carouselInstance.options.watchCSS && !this.carousel.classList.contains(classes$D.flickityEnabled)) {
                        this.carouselInstance.destroy();
                        this.carouselInstance = new Flickity(this.carousel, this.options);
                        this.carouselInstance.resize();
                        this.carouselPrev = this.carousel.querySelector(selectors$10.carouselPrev);
                        this.carouselNext = this.carousel.querySelector(selectors$10.carouselNext);
                    } else {
                        this.carouselInstance.resize();
                    }
                }, 10);
            }
            this.carousel.classList.toggle(classes$D.flickityStatic, this.smallItems === this.carousel.querySelectorAll(selectors$10.carouselSlide).length);
            makeGridSwatches(this.container);
            new Siblings(this.container);
        }
        calculatedArrowsTopPosition() {
            const carouselFirstSlidePhoto = this.container.querySelector(selectors$10.carouselFirstSlidePhoto);
            const pgiFirstSlidePhoto = this.container.querySelector(selectors$10.pgiFirstSlidePhoto);
            if (pgiFirstSlidePhoto) {
                const buttonOffset = pgiFirstSlidePhoto.offsetHeight / 2;
                this.carousel.style.setProperty('--buttons-top', `${buttonOffset}px`);
            } else if (carouselFirstSlidePhoto) {
                const buttonOffset = carouselFirstSlidePhoto.offsetHeight / 2;
                this.carousel.style.setProperty('--buttons-top', `${buttonOffset}px`);
            }
        }
        toggleWrapperModifier() {
            if (!this.wrapper) {
                return;
            }
            const scrollbarWidth = Number(getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-width').replace('px', ''));
            const wrapperWidth = this.wrapper.clientWidth;
            this.wrapperWidthWithGutter = wrapperWidth + offsets$1.additionalOffsetWrapper + scrollbarWidth;
            if (window.innerWidth >= this.wrapperWidthWithGutter) {
                // the screen is wide, have the arrows beside the carousel
                this.wrapper.classList.remove(classes$D.arrowsForceTop);
                this.section.classList.add(classes$D.arrowsOnSide);
            }
            if (window.innerWidth < this.wrapperWidthWithGutter) {
                // the screen is too narrow for arrows beside the carousel
                // add the wrapper--full class to trick the layout
                this.wrapper.classList.add(classes$D.arrowsForceTop);
                this.section.classList.remove(classes$D.arrowsOnSide);
            }
        }
        progressBarCalculate() {
            if (this.carouselInstance !== null && this.carouselTrack) {
                this.carouselInstance.on('scroll', (progress)=>{
                    progress = Math.max(0, Math.min(1, progress)) * 100 + '%';
                    this.carouselTrack.style.width = progress;
                });
            }
        }
        getGridLayout() {
            this.largeItems = Number(getComputedStyle(this.carousel).getPropertyValue('--grid-large-items')) || 3;
            this.mediumItems = Number(getComputedStyle(this.carousel).getPropertyValue('--grid-medium-items')) || this.largeItems;
            this.smallItems = Number(getComputedStyle(this.carousel).getPropertyValue('--grid-small-items')) || this.mediumItems || this.largeItems;
        }
        visibleSlides() {
            if (!this.carousel) {
                return;
            }
            this.getGridLayout();
            const carouselWidth = this.carousel.clientWidth || this.carouselInstance.size.width;
            const slideWidth = this.carouselInstance !== null && this.carouselInstance.selectedElement ? this.carouselInstance.selectedElement.clientWidth : this.carousel.querySelector(selectors$10.carouselSlide).clientWidth;
            const countSlides = this.carouselInstance !== null && this.carouselInstance.slides ? this.carouselInstance.slides.length : this.carousel.querySelectorAll(selectors$10.carouselSlide).length;
            const numberOfVisibleSlides = Math.floor(carouselWidth / slideWidth);
            this.section.classList.remove(classes$D.hiddenArrows);
            if (this.carouselPrev && this.carouselNext) {
                this.carouselPrev.classList.remove(classes$D.hide);
                this.carouselNext.classList.remove(classes$D.hide);
            }
            // Desktop
            if (window.innerWidth > window.theme.sizes.large && !this.options.groupCells) {
                if (numberOfVisibleSlides <= this.largeItems && countSlides <= this.largeItems && this.carouselPrev && this.carouselNext) {
                    this.hideArrows();
                }
            }
            // Tablet
            if (window.innerWidth >= window.theme.sizes.medium && window.innerWidth <= window.theme.sizes.large && !this.options.groupCells) {
                if (numberOfVisibleSlides <= this.mediumItems && countSlides <= this.mediumItems && this.carouselPrev && this.carouselNext) {
                    this.hideArrows();
                }
            }
            // Mobile
            if (window.innerWidth < window.theme.sizes.medium && !this.options.groupCells) {
                if (numberOfVisibleSlides <= this.smallItems && countSlides <= this.smallItems && this.carouselPrev && this.carouselNext) {
                    this.hideArrows();
                }
            }
        }
        trackVisibleSlides() {
            const isSmallDown = window.matchMedia(`(max-width: ${window.theme.sizes.medium - 1}px)`);
            const isTablet = window.matchMedia(`(min-width: ${window.theme.sizes.medium}px) and (max-width: ${window.theme.sizes.large - 1}px)`);
            const isDesktop = window.matchMedia(`(min-width: ${window.theme.sizes.large}px)`);
            isSmallDown.addEventListener('change', (event)=>{
                event.matches ? this.slidesVisible = this.smallItems : true;
            });
            isSmallDown.matches ? this.slidesVisible = this.smallItems : true;
            isTablet.addEventListener('change', (event)=>{
                event.matches ? this.slidesVisible = this.mediumItems : true;
            });
            isTablet.matches ? this.slidesVisible = this.mediumItems : true;
            isDesktop.addEventListener('change', (event)=>{
                event.matches ? this.slidesVisible = this.largeItems : true;
            });
            isDesktop.matches ? this.slidesVisible = this.largeItems : true;
        }
        containDrag() {
            // Dragging agressively in flickity will select the last cell in the list
            // instead of the first cell of the last slide (slide is a set of cells).
            // We detect drag events, and move the selection back to the first cell
            // of the last slide -- the lastSelectableCell.
            const lastSelectableCell = this.slidesTotal - this.slidesVisible;
            if (this.carouselInstance.selectedIndex >= lastSelectableCell) {
                this.carouselInstance.select(lastSelectableCell);
                this.lockArrows(this.carouselInstance.selectedIndex);
            }
        }
        lockArrows(index) {
            if (this.options.wrapAround || this.options.groupCells) {
                return;
            }
            const nextIndex = parseInt(index);
            const lastSelectableCell = this.slidesTotal - this.slidesVisible;
            this.carouselNext.disabled = nextIndex >= lastSelectableCell;
        }
        showArrows() {
            this.carouselPrev.classList.remove(classes$D.hide);
            this.carouselNext.classList.remove(classes$D.hide);
            this.section.classList.remove(classes$D.hiddenArrows);
        }
        hideArrows() {
            this.carouselPrev.classList.add(classes$D.hide);
            this.carouselNext.classList.add(classes$D.hide);
            this.section.classList.add(classes$D.hiddenArrows);
        }
        toggleArrows() {
            if (this.carouselPrev && this.carouselNext) {
                if (this.carouselPrev.disabled && this.carouselNext.disabled) {
                    this.hideArrows();
                } else {
                    this.showArrows();
                }
            }
        }
        // Flickity VERY annoyingly adds aria-hidden="true" to all slides except the current one which causes lighthouse accessibility failure
        // see https://github.com/metafizzy/flickity/issues/1228
        removeIncorrectAria() {
            const slidesHidden = this.carousel.querySelectorAll('[aria-hidden="true"]');
            slidesHidden.forEach((el)=>el.removeAttribute('aria-hidden')
            );
        }
        constructor(){
            super();
            this.container = this;
        }
    };
    if (!customElements.get('flickity-carousel')) {
        customElements.define('flickity-carousel', Carousel);
    }

    const selectors$$ = {
        templateAddresses: '[data-address-wrapper]',
        addressNewForm: '[data-new-address-form]',
        addressNewFormInner: '[new-address-form-inner]',
        btnNew: '.address-new-toggle',
        btnEdit: '.address-edit-toggle',
        btnDelete: '.address-delete',
        classHide: 'hide',
        dataFormId: 'data-form-id',
        dataConfirmMessage: 'data-confirm-message',
        defaultConfirmMessage: 'Are you sure you wish to delete this address?',
        editAddress: '#EditAddress',
        addressCountryNew: 'AddressCountryNew',
        addressProvinceNew: 'AddressProvinceNew',
        addressProvinceContainerNew: 'AddressProvinceContainerNew',
        addressCountryOption: '.address-country-option',
        addressCountry: 'AddressCountry',
        addressProvince: 'AddressProvince',
        addressProvinceContainer: 'AddressProvinceContainer'
    };
    let Addresses = class Addresses {
        init() {
            if (this.addressNewForm) {
                const section = this.section;
                const newAddressFormInner = this.addressNewForm.querySelector(selectors$$.addressNewFormInner);
                this.customerAddresses();
                const newButtons = section.querySelectorAll(selectors$$.btnNew);
                if (newButtons.length) {
                    newButtons.forEach((element)=>{
                        element.addEventListener('click', function() {
                            newAddressFormInner.classList.toggle(selectors$$.classHide);
                        });
                    });
                }
                const editButtons = section.querySelectorAll(selectors$$.btnEdit);
                if (editButtons.length) {
                    editButtons.forEach((element)=>{
                        element.addEventListener('click', function() {
                            const formId = this.getAttribute(selectors$$.dataFormId);
                            section.querySelector(`${selectors$$.editAddress}_${formId}`).classList.toggle(selectors$$.classHide);
                        });
                    });
                }
                const deleteButtons = section.querySelectorAll(selectors$$.btnDelete);
                if (deleteButtons.length) {
                    deleteButtons.forEach((element)=>{
                        element.addEventListener('click', function() {
                            const formId = this.getAttribute(selectors$$.dataFormId);
                            const confirmMessage = this.getAttribute(selectors$$.dataConfirmMessage);
                            if (confirm(confirmMessage || selectors$$.defaultConfirmMessage)) {
                                Shopify.postLink(window.theme.routes.account_addresses_url + '/' + formId, {
                                    parameters: {
                                        _method: 'delete'
                                    }
                                });
                            }
                        });
                    });
                }
            }
        }
        customerAddresses() {
            // Initialize observers on address selectors, defined in shopify_common.js
            if (Shopify.CountryProvinceSelector) {
                new Shopify.CountryProvinceSelector(selectors$$.addressCountryNew, selectors$$.addressProvinceNew, {
                    hideElement: selectors$$.addressProvinceContainerNew
                });
            }
            // Initialize each edit form's country/province selector
            const countryOptions = this.section.querySelectorAll(selectors$$.addressCountryOption);
            countryOptions.forEach((element)=>{
                const formId = element.getAttribute(selectors$$.dataFormId);
                const countrySelector = `${selectors$$.addressCountry}_${formId}`;
                const provinceSelector = `${selectors$$.addressProvince}_${formId}`;
                const containerSelector = `${selectors$$.addressProvinceContainer}_${formId}`;
                new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
                    hideElement: containerSelector
                });
            });
        }
        constructor(section){
            this.section = section;
            this.addressNewForm = this.section.querySelector(selectors$$.addressNewForm);
            this.init();
        }
    };
    const template = document.querySelector(selectors$$.templateAddresses);
    if (template) {
        new Addresses(template);
    }

    /**
     * Password Template Script
     * ------------------------------------------------------------------------------
     * A file that contains code for the Password template.
     *
     * @namespace password
     */ (function() {
        var recoverPasswordForm = document.querySelector('#RecoverPassword');
        if (recoverPasswordForm) {
            customerLogin();
        }
        function customerLogin() {
            var config = {
                recoverPasswordForm: '#RecoverPassword',
                hideRecoverPasswordLink: '#HideRecoverPasswordLink'
            };
            checkUrlHash();
            resetPasswordSuccess();
            document.querySelector(config.recoverPasswordForm).addEventListener('click', onShowHidePasswordForm);
            document.querySelector(config.hideRecoverPasswordLink).addEventListener('click', onShowHidePasswordForm);
            function onShowHidePasswordForm(evt) {
                evt.preventDefault();
                toggleRecoverPasswordForm();
            }
            function checkUrlHash() {
                var hash = window.location.hash;
                // Allow deep linking to recover password form
                if (hash === '#recover') {
                    toggleRecoverPasswordForm();
                }
            }
            /**
         *  Show/Hide recover password form
         */ function toggleRecoverPasswordForm() {
                var emailValue = document.querySelector('#CustomerEmail').value;
                document.querySelector('#RecoverEmail').value = emailValue;
                document.querySelector('#RecoverPasswordForm').classList.toggle('display-none');
                document.querySelector('#CustomerLoginForm').classList.toggle('display-none');
            }
            /**
         *  Show reset password success message
         */ function resetPasswordSuccess() {
                var formSuccess = document.querySelector('.reset-password-success');
                // check if reset password form was successfully submited.
                if (formSuccess) {
                    document.querySelector('#ResetSuccess').classList.remove('display-none');
                }
            }
        }
    })();

    window.Shopify = window.Shopify || {};
    window.Shopify.theme = window.Shopify.theme || {};
    window.Shopify.theme.sections = window.Shopify.theme.sections || {};
    window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
    window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
    const registered = window.Shopify.theme.sections.registered;
    const instances = window.Shopify.theme.sections.instances;
    const selectors$_ = {
        id: 'data-section-id',
        type: 'data-section-type'
    };
    let Registration = class Registration {
        getStack() {
            return this.callStack;
        }
        constructor(type = null, components = []){
            this.type = type;
            this.components = validateComponentsArray(components);
            this.callStack = {
                onLoad: [],
                onUnload: [],
                onSelect: [],
                onDeselect: [],
                onBlockSelect: [],
                onBlockDeselect: [],
                onReorder: []
            };
            components.forEach((comp)=>{
                for (const [key, value] of Object.entries(comp)){
                    const arr = this.callStack[key];
                    if (Array.isArray(arr) && typeof value === 'function') {
                        arr.push(value);
                    } else {
                        console.warn(`Unregisted function: '${key}' in component: '${this.type}'`);
                        console.warn(value);
                    }
                }
            });
        }
    };
    let Section = class Section {
        callFunctions(key, e = null) {
            this.callStack[key].forEach((func)=>{
                const props = {
                    id: this.id,
                    type: this.type,
                    container: this.container
                };
                if (e) {
                    func.call(props, e);
                } else {
                    func.call(props);
                }
            });
        }
        onLoad() {
            this.callFunctions('onLoad');
        }
        onUnload() {
            this.callFunctions('onUnload');
        }
        onSelect(e) {
            this.callFunctions('onSelect', e);
        }
        onDeselect(e) {
            this.callFunctions('onDeselect', e);
        }
        onBlockSelect(e) {
            this.callFunctions('onBlockSelect', e);
        }
        onBlockDeselect(e) {
            this.callFunctions('onBlockDeselect', e);
        }
        onReorder(e) {
            this.callFunctions('onReorder', e);
        }
        constructor(container, registration){
            this.container = validateContainerElement(container);
            this.id = container.getAttribute(selectors$_.id);
            this.type = registration.type;
            this.callStack = registration.getStack();
            try {
                this.onLoad();
            } catch (e) {
                // We catch all errors throw in sections in order to prevent minor errors in apps from breaking everything else
                console.warn(`Error in section: ${this.id}`);
                console.warn(this);
                console.error(e);
            }
        }
    };
    function validateContainerElement(container) {
        if (!(container instanceof Element)) {
            throw new TypeError('Theme Sections: Attempted to load section. The section container provided is not a DOM element.');
        }
        if (container.getAttribute(selectors$_.id) === null) {
            throw new Error('Theme Sections: The section container provided does not have an id assigned to the ' + selectors$_.id + ' attribute.');
        }
        return container;
    }
    function validateComponentsArray(value) {
        if (typeof value !== 'undefined' && typeof value !== 'object' || value === null) {
            throw new TypeError('Theme Sections: The components object provided is not a valid');
        }
        return value;
    }
    /*
     * @shopify/theme-sections
     * -----------------------------------------------------------------------------
     *
     * A framework to provide structure to your Shopify sections and a load and unload
     * lifecycle. The lifecycle is automatically connected to theme editor events so
     * that your sections load and unload as the editor changes the content and
     * settings of your sections.
     */ function register(type, components) {
        if (typeof type !== 'string') {
            throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');
        }
        if (typeof registered[type] !== 'undefined') {
            throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
        }
        if (!Array.isArray(components)) {
            components = [
                components
            ];
        }
        const section = new Registration(type, components);
        registered[type] = section;
        return registered;
    }
    function load(types, containers) {
        types = normalizeType(types);
        if (typeof containers === 'undefined') {
            containers = document.querySelectorAll('[' + selectors$_.type + ']');
        }
        containers = normalizeContainers(containers);
        types.forEach(function(type) {
            const registration = registered[type];
            if (typeof registration === 'undefined') {
                return;
            }
            containers = containers.filter(function(container) {
                // Filter from list of containers because container already has an instance loaded
                if (isInstance(container)) {
                    return false;
                }
                // Filter from list of containers because container doesn't have data-section-type attribute
                if (container.getAttribute(selectors$_.type) === null) {
                    return false;
                }
                // Keep in list of containers because current type doesn't match
                if (container.getAttribute(selectors$_.type) !== type) {
                    return true;
                }
                instances.push(new Section(container, registration));
                // Filter from list of containers because container now has an instance loaded
                return false;
            });
        });
    }
    function unload(selector) {
        var instancesToUnload = getInstances(selector);
        instancesToUnload.forEach(function(instance) {
            var index = instances.map(function(e) {
                return e.id;
            }).indexOf(instance.id);
            instances.splice(index, 1);
            instance.onUnload();
        });
    }
    function reorder(selector) {
        var instancesToReorder = getInstances(selector);
        instancesToReorder.forEach(function(instance) {
            instance.onReorder();
        });
    }
    function getInstances(selector) {
        var filteredInstances = [];
        // Fetch first element if its an array
        if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
            var firstElement = selector[0];
        }
        // If selector element is DOM element
        if (selector instanceof Element || firstElement instanceof Element) {
            var containers = normalizeContainers(selector);
            containers.forEach(function(container) {
                filteredInstances = filteredInstances.concat(instances.filter(function(instance) {
                    return instance.container === container;
                }));
            });
        // If select is type string
        } else if (typeof selector === 'string' || typeof firstElement === 'string') {
            var types = normalizeType(selector);
            types.forEach(function(type) {
                filteredInstances = filteredInstances.concat(instances.filter(function(instance) {
                    return instance.type === type;
                }));
            });
        }
        return filteredInstances;
    }
    function getInstanceById(id) {
        var instance;
        for(var i = 0; i < instances.length; i++){
            if (instances[i].id === id) {
                instance = instances[i];
                break;
            }
        }
        return instance;
    }
    function isInstance(selector) {
        return getInstances(selector).length > 0;
    }
    function normalizeType(types) {
        // If '*' then fetch all registered section types
        if (types === '*') {
            types = Object.keys(registered);
        // If a single section type string is passed, put it in an array
        } else if (typeof types === 'string') {
            types = [
                types
            ];
        // If single section constructor is passed, transform to array with section
        // type string
        } else if (types.constructor === Section) {
            types = [
                types.prototype.type
            ];
        // If array of typed section constructors is passed, transform the array to
        // type strings
        } else if (Array.isArray(types) && types[0].constructor === Section) {
            types = types.map(function(Section1) {
                return Section1.type;
            });
        }
        types = types.map(function(type) {
            return type.toLowerCase();
        });
        return types;
    }
    function normalizeContainers(containers) {
        // Nodelist with entries
        if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
            containers = Array.prototype.slice.call(containers);
        // Empty Nodelist
        } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
            containers = [];
        // Handle null (document.querySelector() returns null with no match)
        } else if (containers === null) {
            containers = [];
        // Single DOM element
        } else if (!Array.isArray(containers) && containers instanceof Element) {
            containers = [
                containers
            ];
        }
        return containers;
    }
    if (window.Shopify.designMode) {
        document.addEventListener('shopify:section:load', function(event) {
            var id = event.detail.sectionId;
            var container = event.target.querySelector('[' + selectors$_.id + '="' + id + '"]');
            if (container !== null) {
                load(container.getAttribute(selectors$_.type), container);
            }
        });
        document.addEventListener('shopify:section:reorder', function(event) {
            var id = event.detail.sectionId;
            var container = event.target.querySelector('[' + selectors$_.id + '="' + id + '"]');
            var instance = getInstances(container)[0];
            if (typeof instance === 'object') {
                reorder(container);
            }
        });
        document.addEventListener('shopify:section:unload', function(event) {
            var id = event.detail.sectionId;
            var container = event.target.querySelector('[' + selectors$_.id + '="' + id + '"]');
            var instance = getInstances(container)[0];
            if (typeof instance === 'object') {
                unload(container);
            }
        });
        document.addEventListener('shopify:section:select', function(event) {
            var instance = getInstanceById(event.detail.sectionId);
            if (typeof instance === 'object') {
                instance.onSelect(event);
            }
        });
        document.addEventListener('shopify:section:deselect', function(event) {
            var instance = getInstanceById(event.detail.sectionId);
            if (typeof instance === 'object') {
                instance.onDeselect(event);
            }
        });
        document.addEventListener('shopify:block:select', function(event) {
            var instance = getInstanceById(event.detail.sectionId);
            if (typeof instance === 'object') {
                instance.onBlockSelect(event);
            }
        });
        document.addEventListener('shopify:block:deselect', function(event) {
            var instance = getInstanceById(event.detail.sectionId);
            if (typeof instance === 'object') {
                instance.onBlockDeselect(event);
            }
        });
    }

    /**
     * A11y Helpers
     * -----------------------------------------------------------------------------
     * A collection of useful functions that help make your theme more accessible
     */ /**
     * Moves focus to an HTML element
     * eg for In-page links, after scroll, focus shifts to content area so that
     * next `tab` is where user expects. Used in bindInPageLinks()
     * eg move focus to a modal that is opened. Used in trapFocus()
     *
     * @param {Element} container - Container DOM element to trap focus inside of
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     */ function forceFocus(element, options) {
        options = options || {};
        element.focus();
        if (typeof options.className !== 'undefined') {
            element.classList.add(options.className);
        }
        element.addEventListener('blur', callback);
        function callback(event) {
            event.target.removeEventListener(event.type, callback);
            if (typeof options.className !== 'undefined') {
                element.classList.remove(options.className);
            }
        }
    }
    /**
     * If there's a hash in the url, focus the appropriate element
     * This compensates for older browsers that do not move keyboard focus to anchor links.
     * Recommendation: To be called once the page in loaded.
     *
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     * @param {string} options.ignore - Selector for elements to not include.
     */ function focusHash(options) {
        options = options || {};
        var hash = window.location.hash;
        var element = document.getElementById(hash.slice(1));
        // if we are to ignore this element, early return
        if (element && options.ignore && element.matches(options.ignore)) {
            return false;
        }
        if (hash && element) {
            forceFocus(element, options);
        }
    }
    /**
     * When an in-page (url w/hash) link is clicked, focus the appropriate element
     * This compensates for older browsers that do not move keyboard focus to anchor links.
     * Recommendation: To be called once the page in loaded.
     *
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     * @param {string} options.ignore - CSS selector for elements to not include.
     */ function bindInPageLinks(options) {
        options = options || {};
        var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));
        function queryCheck(selector) {
            return document.getElementById(selector) !== null;
        }
        return links.filter(function(link) {
            if (link.hash === '#' || link.hash === '') {
                return false;
            }
            if (options.ignore && link.matches(options.ignore)) {
                return false;
            }
            if (!queryCheck(link.hash.substr(1))) {
                return false;
            }
            var element = document.querySelector(link.hash);
            if (!element) {
                return false;
            }
            link.addEventListener('click', function() {
                forceFocus(element, options);
            });
            return true;
        });
    }
    function focusable$1(container) {
        var elements = Array.prototype.slice.call(container.querySelectorAll('[tabindex],' + '[draggable],' + 'a[href],' + 'area,' + 'button:enabled,' + 'input:not([type=hidden]):enabled,' + 'object,' + 'select:enabled,' + 'textarea:enabled' + '[data-focus-element]'));
        // Filter out elements that are not visible.
        // Copied from jQuery https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
        return elements.filter(function(element) {
            return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        });
    }
    /**
     * Traps the focus in a particular container
     *
     * @param {Element} container - Container DOM element to trap focus inside of
     * @param {Element} elementToFocus - Element to be focused on first
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     */ var trapFocusHandlers = {};
    function trapFocus(container, options) {
        options = options || {};
        var elements = focusable$1(container);
        var elementToFocus = options.elementToFocus || container;
        var first = elements[0];
        var last = elements[elements.length - 1];
        removeTrapFocus();
        trapFocusHandlers.focusin = function(event) {
            if (container !== event.target && !container.contains(event.target) && first && first === event.target) {
                first.focus();
            }
            if (event.target !== container && event.target !== last && event.target !== first) return;
            document.addEventListener('keydown', trapFocusHandlers.keydown);
        };
        trapFocusHandlers.focusout = function() {
            document.removeEventListener('keydown', trapFocusHandlers.keydown);
        };
        trapFocusHandlers.keydown = function(event) {
            if (event.code !== 'Tab') return; // If not TAB key
            // On the last focusable element and tab forward, focus the first element.
            if (event.target === last && !event.shiftKey) {
                event.preventDefault();
                first.focus();
            }
            //  On the first focusable element and tab backward, focus the last element.
            if ((event.target === container || event.target === first) && event.shiftKey) {
                event.preventDefault();
                last.focus();
            }
        };
        document.addEventListener('focusout', trapFocusHandlers.focusout);
        document.addEventListener('focusin', trapFocusHandlers.focusin);
        forceFocus(elementToFocus, options);
    }
    /**
     * Removes the trap of focus from the page
     */ function removeTrapFocus() {
        document.removeEventListener('focusin', trapFocusHandlers.focusin);
        document.removeEventListener('focusout', trapFocusHandlers.focusout);
        document.removeEventListener('keydown', trapFocusHandlers.keydown);
    }
    /**
     * Add a preventive message to external links and links that open to a new window.
     * @param {string} elements - Specific elements to be targeted
     * @param {object} options.messages - Custom messages to overwrite with keys: newWindow, external, newWindowExternal
     * @param {string} options.messages.newWindow - When the link opens in a new window (e.g. target="_blank")
     * @param {string} options.messages.external - When the link is to a different host domain.
     * @param {string} options.messages.newWindowExternal - When the link is to a different host domain and opens in a new window.
     * @param {object} options.prefix - Prefix to namespace "id" of the messages
     */ function accessibleLinks(elements, options) {
        if (typeof elements !== 'string') {
            throw new TypeError(elements + ' is not a String.');
        }
        elements = document.querySelectorAll(elements);
        if (elements.length === 0) {
            return;
        }
        options = options || {};
        options.messages = options.messages || {};
        var messages1 = {
            newWindow: options.messages.newWindow || 'Opens in a new window.',
            external: options.messages.external || 'Opens external website.',
            newWindowExternal: options.messages.newWindowExternal || 'Opens external website in a new window.'
        };
        var prefix = options.prefix || 'a11y';
        var messageSelectors = {
            newWindow: prefix + '-new-window-message',
            external: prefix + '-external-message',
            newWindowExternal: prefix + '-new-window-external-message'
        };
        function generateHTML(messages) {
            var container = document.createElement('ul');
            var htmlMessages = Object.keys(messages).reduce(function(html, key) {
                return html += '<li id=' + messageSelectors[key] + '>' + messages[key] + '</li>';
            }, '');
            container.setAttribute('hidden', true);
            container.innerHTML = htmlMessages;
            document.body.appendChild(container);
        }
        function externalSite(link) {
            return link.hostname !== window.location.hostname;
        }
        elements.forEach(function(link) {
            var target = link.getAttribute('target');
            var rel = link.getAttribute('rel');
            var isExternal = externalSite(link);
            var isTargetBlank = target === '_blank';
            var missingRelNoopener = rel === null || rel.indexOf('noopener') === -1;
            if (isTargetBlank && missingRelNoopener) {
                var relValue = rel === null ? 'noopener' : rel + ' noopener';
                link.setAttribute('rel', relValue);
            }
            if (isExternal && isTargetBlank) {
                link.setAttribute('aria-describedby', messageSelectors.newWindowExternal);
            } else if (isExternal) {
                link.setAttribute('aria-describedby', messageSelectors.external);
            } else if (isTargetBlank) {
                link.setAttribute('aria-describedby', messageSelectors.newWindow);
            }
        });
        generateHTML(messages1);
    }

    var a11y = /*#__PURE__*/Object.freeze({
        __proto__: null,
        accessibleLinks: accessibleLinks,
        bindInPageLinks: bindInPageLinks,
        focusHash: focusHash,
        focusable: focusable$1,
        forceFocus: forceFocus,
        removeTrapFocus: removeTrapFocus,
        trapFocus: trapFocus
    });

    const selectors$Z = {
        focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    };
    function modal(unique) {
        const uniqueID = `data-popup-${unique}`;
        MicroModal.init({
            openTrigger: uniqueID,
            disableScroll: true,
            onShow: (modal1, el, event)=>{
                event.preventDefault();
                const firstFocus = modal1.querySelector(selectors$Z.focusable);
                trapFocus(modal1, {
                    elementToFocus: firstFocus
                });
            },
            onClose: (modal, el, event)=>{
                event.preventDefault();
                removeTrapFocus();
                el.focus();
            }
        });
    }

    const selectors$Y = {
        trigger: '[data-toggle-password-modal]',
        errors: '.storefront-password-form .errors'
    };
    const sections$m = {};
    let PasswordPage = class PasswordPage {
        init() {
            modal('password');
            if (this.errors) {
                this.trigger.click();
            }
        }
        constructor(section){
            this.container = section.container;
            this.trigger = this.container.querySelector(selectors$Y.trigger);
            this.errors = this.container.querySelector(selectors$Y.errors);
            this.init();
        }
    };
    const passwordSection = {
        onLoad () {
            sections$m[this.id] = new PasswordPage(this);
        }
    };
    register('password', passwordSection);

    /**
     * Gift Card Template Script
     * ------------------------------------------------------------------------------
     * A file that contains scripts highly couple code to the Gift Card template.
     */ (function() {
        var config = {
            qrCode: '#QrCode',
            giftCardCode: '.giftcard__code'
        };
        // init QR code
        const qrCode = document.querySelector(config.qrCode);
        if (qrCode) {
            function loadGiftCard() {
                const qrCodeText = qrCode.getAttribute('data-identifier');
                new QRCode(qrCode, {
                    text: qrCodeText,
                    width: 120,
                    height: 120
                });
            }
            window.addEventListener('load', loadGiftCard);
        }
        const giftCardCode = document.querySelector(config.giftCardCode);
        if (giftCardCode) {
            // Auto-select gift card code on click, based on ID passed to the function
            function selectText() {
                var text = document.querySelector('#GiftCardDigits');
                var range = '';
                if (document.body.createTextRange) {
                    range = document.body.createTextRange();
                    range.moveToElementText(text);
                    range.select();
                } else if (window.getSelection) {
                    var selection = window.getSelection();
                    range = document.createRange();
                    range.selectNodeContents(text);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            giftCardCode.addEventListener('click', selectText());
        }
    })();

    const selectors$X = {
        parallaxWrapper: '[data-parallax-wrapper]',
        parallaxImg: '[data-parallax-img]'
    };
    let sections$l = {};
    const parallaxImage = {
        onLoad () {
            sections$l[this.id] = [];
            const frames = this.container.querySelectorAll(selectors$X.parallaxWrapper);
            frames.forEach((frame)=>{
                const inner = frame.querySelector(selectors$X.parallaxImg);
                sections$l[this.id].push(new Rellax(inner, {
                    center: true,
                    round: true,
                    frame: frame
                }));
            });
        },
        onUnload: function() {
            sections$l[this.id].forEach((image)=>{
                if (typeof image.destroy === 'function') {
                    image.destroy();
                }
            });
        }
    };

    register('article', parallaxImage);

    const selectors$W = {
        frame: '[data-ticker-frame]',
        scale: '[data-ticker-scale]',
        text: '[data-ticker-text]'
    };
    const attributes$1 = {
        clone: 'data-clone',
        ariaHidden: 'aria-hidden'
    };
    const classes$C = {
        animationClass: 'ticker--animated',
        unloadedClass: 'ticker--unloaded',
        comparitorClass: 'ticker__comparitor'
    };
    const sections$k = {};
    let Ticker = class Ticker {
        init() {
            this.addComparitor();
            this.resizeEvent = debounce$1(()=>this.checkWidth()
            , 300);
            this.listen();
        }
        addComparitor() {
            this.comparitor = this.text.cloneNode(true);
            this.comparitor.classList.add(classes$C.comparitorClass);
            this.frame.appendChild(this.comparitor);
            this.scale.classList.remove(classes$C.unloadedClass);
        }
        unload() {
            document.removeEventListener('theme:resize', this.resizeEvent);
        }
        listen() {
            document.addEventListener('theme:resize', this.resizeEvent);
            this.checkWidth();
        }
        checkWidth() {
            const padding = window.getComputedStyle(this.frame).paddingLeft.replace('px', '') * 2;
            // Animate all the items - cloned too
            Array.from(this.text.parentNode.children).forEach((child)=>{
                child.classList.add(classes$C.animationClass);
            });
            if (this.frame.clientWidth - padding < this.comparitor.clientWidth || this.stopClone) {
                if (this.scale.childElementCount === 1) {
                    this.clone = this.text.cloneNode(true);
                    this.clone.setAttribute(attributes$1.ariaHidden, true);
                    this.clone.setAttribute(attributes$1.clone, '');
                    this.scale.appendChild(this.clone);
                    if (this.stopClone) {
                        for(let index = 0; index < 10; index++){
                            const cloneSecond = this.text.cloneNode(true);
                            cloneSecond.setAttribute(attributes$1.ariaHidden, true);
                            cloneSecond.setAttribute(attributes$1.clone, '');
                            this.scale.appendChild(cloneSecond);
                        }
                    }
                }
                const animationTimeFrame = this.text.clientWidth / this.space * this.timeIndex;
                this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
            } else {
                let clone = this.scale.querySelector(`[${attributes$1.clone}]`);
                if (clone) {
                    this.scale.removeChild(clone);
                }
                this.text.classList.remove(classes$C.animationClass);
            }
        }
        constructor(el, stopClone = false){
            this.frame = el;
            this.stopClone = stopClone;
            this.scale = this.frame.querySelector(selectors$W.scale);
            this.text = this.frame.querySelector(selectors$W.text);
            this.space = 100; // 100px
            this.timeIndex = 1.63; // 100px going to move for 1.63s
            this.init();
        }
    };
    const ticker = {
        onLoad () {
            sections$k[this.id] = [];
            const el1 = this.container.querySelectorAll(selectors$W.frame);
            el1.forEach((el)=>{
                sections$k[this.id].push(new Ticker(el));
            });
        },
        onUnload () {
            sections$k[this.id].forEach((el)=>{
                if (typeof el.unload === 'function') {
                    el.unload();
                }
            });
        }
    };

    const selectors$V = {
        frame: '[data-ticker-frame]',
        slideValue: 'data-slide',
        tickerScale: '[data-ticker-scale]',
        tickerText: '[data-ticker-text]'
    };
    const classes$B = {
        trickerAnimated: 'ticker--animated'
    };
    const sections$j = {};
    let Bar = class Bar {
        init() {
            this.initTickers(true);
        }
        /**
       * Init tickers in sliders
       */ initTickers(stopClone = false) {
            const frame = this.container.querySelector(selectors$V.frame);
            if (frame) {
                new Ticker(frame, stopClone);
            }
        }
        toggleTicker(e, isStopped) {
            const tickerScale = this.container.querySelector(selectors$V.tickerScale);
            const element = this.container.querySelector(`[${selectors$V.slideValue}="${e.detail.blockId}"]`);
            if (!element || !tickerScale) return;
            if (isStopped) {
                const gutter = Number(getComputedStyle(element).getPropertyValue('--gutter').replace('px', ''));
                const leftPosition = -(element.offsetLeft - gutter);
                tickerScale.setAttribute('data-stop', '');
                tickerScale.querySelectorAll(selectors$V.tickerText).forEach((textHolder)=>{
                    textHolder.classList.remove(classes$B.trickerAnimated);
                    textHolder.style.transform = `translate3d(${leftPosition}px, 0, 0)`;
                });
            }
            if (!isStopped) {
                tickerScale.querySelectorAll(selectors$V.tickerText).forEach((textHolder)=>{
                    textHolder.classList.add(classes$B.trickerAnimated);
                    textHolder.removeAttribute('style');
                });
                tickerScale.removeAttribute('data-stop');
            }
        }
        onBlockSelect(e) {
            this.toggleTicker(e, true);
        }
        onBlockDeselect(e) {
            this.toggleTicker(e, false);
        }
        constructor(section){
            this.container = section.container;
            this.init();
        }
    };
    const logos = {
        onLoad () {
            sections$j[this.id] = [];
            sections$j[this.id].push(new Bar(this));
        },
        onBlockSelect (e) {
            sections$j[this.id].forEach((el)=>{
                if (typeof el.onBlockSelect === 'function') {
                    el.onBlockSelect(e);
                }
            });
        },
        onBlockDeselect (e) {
            sections$j[this.id].forEach((el)=>{
                if (typeof el.onBlockSelect === 'function') {
                    el.onBlockDeselect(e);
                }
            });
        }
    };
    register('logos', logos);

    register('blog', parallaxImage);

    var selectors$U = {
        drawerWrappper: '[data-drawer]',
        drawerScrolls: '[data-drawer-scrolls]',
        input: '[data-predictive-search-input]',
        underlay: '[data-drawer-underlay]',
        stagger: '[data-stagger-animation]',
        drawerToggle: 'data-drawer-toggle',
        firstFocus: 'data-first-focus',
        children: ':scope > * > [data-animates]',
        focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    };
    var classes$A = {
        isVisible: 'drawer--visible',
        displayNone: 'display-none'
    };
    var sections$i = {};
    let Drawer = class Drawer {
        unload() {
        // wipe listeners
        }
        connectToggle() {
            this.buttons.forEach((btn)=>{
                btn.addEventListener('click', (function(e) {
                    e.preventDefault();
                    this.drawer.dispatchEvent(new CustomEvent('theme:drawer:toggle', {
                        bubbles: false
                    }));
                }).bind(this));
            });
        }
        connectDrawer() {
            this.drawer.addEventListener('theme:drawer:toggle', (function() {
                if (this.drawer.classList.contains(classes$A.isVisible)) {
                    this.drawer.dispatchEvent(new CustomEvent('theme:drawer:close', {
                        bubbles: false
                    }));
                } else {
                    this.drawer.dispatchEvent(new CustomEvent('theme:drawer:open', {
                        bubbles: false
                    }));
                }
            }).bind(this));
            this.drawer.addEventListener('theme:drawer:close', this.hideDrawer.bind(this));
            this.drawer.addEventListener('theme:drawer:open', this.showDrawer.bind(this));
        }
        staggerChildAnimations() {
            this.staggers.forEach((el)=>{
                const children = el.querySelectorAll(selectors$U.children);
                children.forEach((child, index)=>{
                    child.style.transitionDelay = `${index * 50 + 10}ms`;
                });
            });
        }
        closers() {
            this.drawer.addEventListener('keyup', (function(evt) {
                if (evt.code !== 'Escape') {
                    return;
                }
                this.hideDrawer();
            }).bind(this));
            this.underlay.addEventListener('click', (function() {
                this.hideDrawer();
            }).bind(this));
        }
        setFocus() {
            const closeButton = this.drawer.querySelector(selectors$U.firstFocus);
            trapFocus(this.drawer, {
                elementToFocus: closeButton
            });
        }
        showDrawer() {
            this.drawer.classList.remove(classes$A.displayNone);
            // animates after display none is removed
            setTimeout(()=>{
                this.buttons.forEach((el)=>el.setAttribute('aria-expanded', true)
                );
                this.drawer.classList.add(classes$A.isVisible);
                document.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                    bubbles: true,
                    detail: this.drawerScrolls
                }));
                this.drawer.addEventListener('transitionend', this.setFocus.bind(this), {
                    once: true
                });
                this.drawer.addEventListener('transitioncancel', this.setFocus.bind(this), {
                    once: true
                });
            }, 1);
        }
        hideDrawer() {
            window.theme.state.cartOpen = false;
            this.buttons.forEach((el)=>el.setAttribute('aria-expanded', true)
            );
            this.drawer.classList.remove(classes$A.isVisible);
            this.drawerScrolls.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                bubbles: true
            }));
            document.dispatchEvent(new CustomEvent('theme:sliderule:close', {
                bubbles: false
            }));
            removeTrapFocus();
            this.buttons[0].focus();
            // adds display none after animations
            setTimeout(()=>{
                if (!this.drawer.classList.contains(classes$A.isVisible)) {
                    this.drawer.classList.add(classes$A.displayNone);
                }
            }, 800);
        }
        constructor(el){
            this.drawer = el;
            this.drawerScrolls = this.drawer.querySelector(selectors$U.drawerScrolls);
            this.underlay = this.drawer.querySelector(selectors$U.underlay);
            this.key = this.drawer.dataset.drawer;
            const btnSelector = `[${selectors$U.drawerToggle}='${this.key}']`;
            this.buttons = document.querySelectorAll(btnSelector);
            this.staggers = this.drawer.querySelectorAll(selectors$U.stagger);
            this.connectToggle();
            this.connectDrawer();
            this.closers();
            this.staggerChildAnimations();
        }
    };
    const drawer = {
        onLoad () {
            sections$i[this.id] = [];
            const els = this.container.querySelectorAll(selectors$U.drawerWrappper);
            els.forEach((el)=>{
                sections$i[this.id].push(new Drawer(el));
            });
        },
        onUnload: function() {
            sections$i[this.id].forEach((el)=>{
                if (typeof el.unload === 'function') {
                    el.unload();
                }
            });
        }
    };

    const selectors$T = {
        announcement: '[data-announcement-bar]',
        transparent: 'data-header-transparent',
        header: '[data-header-wrapper] header'
    };
    const classes$z = {
        stuck: 'js__header__stuck',
        stuckAnimated: 'js__header__stuck--animated',
        triggerAnimation: 'js__header__stuck--trigger-animation',
        stuckBackdrop: 'js__header__stuck__backdrop'
    };
    let sections$h = {};
    let Sticky = class Sticky {
        unload() {
            document.removeEventListener('theme:scroll', this.listen);
            document.removeEventListener('theme:scroll:up', this.scrollUpDirectional);
            document.removeEventListener('theme:scroll:down', this.scrollDownDirectional);
        }
        listen() {
            if (this.sticks || this.animated) {
                document.addEventListener('theme:scroll', (e)=>{
                    if (e.detail.down) {
                        if (!this.currentlyStuck && e.detail.position > this.stickDown) {
                            this.stickSimple();
                        }
                        if (!this.currentlyBlurred && e.detail.position > this.blur) {
                            this.addBlur();
                        }
                    } else {
                        if (e.detail.position <= this.stickUp) {
                            this.unstickSimple();
                        }
                        if (e.detail.position <= this.blur) {
                            this.removeBlur();
                        }
                    }
                });
            }
            if (this.animated) {
                document.addEventListener('theme:scroll:up', this.scrollUpDirectional.bind(this));
                document.addEventListener('theme:scroll:down', this.scrollDownDirectional.bind(this));
            }
        }
        stickSimple() {
            if (this.animated) {
                this.cls.add(classes$z.stuckAnimated);
            }
            this.cls.add(classes$z.stuck);
            this.wrapper.setAttribute(selectors$T.transparent, false);
            this.currentlyStuck = true;
        }
        unstickSimple() {
            this.cls.remove(classes$z.stuck);
            this.wrapper.setAttribute(selectors$T.transparent, this.transparent);
            if (this.animated) {
                this.cls.remove(classes$z.stuckAnimated);
            }
            this.currentlyStuck = false;
        }
        scrollDownInit() {
            if (window.scrollY > this.stickDown) {
                this.stickSimple();
            }
            if (window.scrollY > this.blur) {
                this.addBlur();
            }
        }
        stickDirectional() {
            this.cls.add(classes$z.triggerAnimation);
        }
        unstickDirectional() {
            this.cls.remove(classes$z.triggerAnimation);
        }
        scrollDownDirectional() {
            this.unstickDirectional();
        }
        scrollUpDirectional() {
            if (window.scrollY <= this.stickDown) {
                this.unstickDirectional();
            } else {
                this.stickDirectional();
            }
        }
        addBlur() {
            this.cls.add(classes$z.stuckBackdrop);
            this.currentlyBlurred = true;
        }
        removeBlur() {
            this.cls.remove(classes$z.stuckBackdrop);
            this.currentlyBlurred = false;
        }
        constructor(el){
            this.wrapper = el;
            this.type = this.wrapper.dataset.headerSticky;
            this.transparent = this.wrapper.dataset.headerTransparent;
            this.sticks = this.type === 'sticky';
            this.animated = this.type === 'directional';
            this.currentlyStuck = false;
            this.cls = this.wrapper.classList;
            const announcementEl = document.querySelector(selectors$T.announcement);
            const announcementHeight = announcementEl ? announcementEl.clientHeight : 0;
            const headerHeight = document.querySelector(selectors$T.header).clientHeight;
            this.blur = headerHeight + announcementHeight;
            this.stickDown = headerHeight + announcementHeight;
            this.stickUp = announcementHeight;
            if (this.wrapper.getAttribute(selectors$T.transparent) !== 'false') {
                this.blur = announcementHeight;
            }
            if (this.sticks) {
                this.stickDown = announcementHeight;
                this.scrollDownInit();
            }
            this.listen();
        }
    };
    const stickyHeader = {
        onLoad () {
            sections$h = new Sticky(this.container);
        },
        onUnload: function() {
            if (typeof sections$h.unload === 'function') {
                sections$h.unload();
            }
        }
    };

    const selectors$S = {
        disclosureToggle: 'data-hover-disclosure-toggle',
        disclosureWrappper: '[data-hover-disclosure]',
        link: '[data-top-link]',
        wrapper: '[data-header-wrapper]',
        stagger: '[data-stagger]',
        staggerPair: '[data-stagger-first]',
        staggerAfter: '[data-stagger-second]',
        staggerImage: '[data-grid-item], [data-header-image]'
    };
    const classes$y = {
        isVisible: 'is-visible',
        meganavVisible: 'meganav--visible',
        grandparent: 'grandparent'
    };
    let sections$g = {};
    let disclosures = {};
    let HoverDisclosure = class HoverDisclosure {
        onBlockSelect(evt) {
            if (this.disclosure.contains(evt.target)) {
                this.showDisclosure();
            }
        }
        onBlockDeselect(evt) {
            if (this.disclosure.contains(evt.target)) {
                this.hideDisclosure();
            }
        }
        showDisclosure() {
            if (this.grandparent) {
                this.wrapper.classList.add(classes$y.meganavVisible);
            } else {
                this.wrapper.classList.remove(classes$y.meganavVisible);
            }
            this.trigger.setAttribute('aria-expanded', true);
            this.trigger.classList.add(classes$y.isVisible);
            this.disclosure.classList.add(classes$y.isVisible);
        }
        hideDisclosure() {
            this.disclosure.classList.remove(classes$y.isVisible);
            this.trigger.classList.remove(classes$y.isVisible);
            this.trigger.setAttribute('aria-expanded', false);
            this.wrapper.classList.remove(classes$y.meganavVisible);
        }
        staggerChildAnimations() {
            const simple = this.disclosure.querySelectorAll(selectors$S.stagger);
            simple.forEach((el, index)=>{
                el.style.transitionDelay = `${index * 50 + 10}ms`;
            });
            const pairs = this.disclosure.querySelectorAll(selectors$S.staggerPair);
            pairs.forEach((child, i)=>{
                const d1 = i * 150;
                child.style.transitionDelay = `${d1}ms`;
                child.parentElement.querySelectorAll(selectors$S.staggerAfter).forEach((grandchild, i2)=>{
                    const di1 = i2 + 1;
                    const d2 = di1 * 20;
                    grandchild.style.transitionDelay = `${d1 + d2}ms`;
                });
            });
            const images = this.disclosure.querySelectorAll(selectors$S.staggerImage);
            images.forEach((el, index)=>{
                el.style.transitionDelay = `${(index + 1) * 80}ms`;
            });
        }
        handleTablets() {
            // first click opens the popup, second click opens the link
            this.trigger.addEventListener('touchstart', (function(e) {
                const isOpen = this.disclosure.classList.contains(classes$y.isVisible);
                if (!isOpen) {
                    e.preventDefault();
                    this.showDisclosure();
                }
            }).bind(this), {
                passive: true
            });
        }
        connectHoverToggle() {
            this.trigger.addEventListener('pointerenter', this.showDisclosure.bind(this));
            this.link.addEventListener('focus', this.showDisclosure.bind(this));
            this.trigger.addEventListener('pointerleave', this.hideDisclosure.bind(this));
            this.trigger.addEventListener('focusout', (function(e) {
                const inMenu = this.trigger.contains(e.relatedTarget);
                if (!inMenu) {
                    this.hideDisclosure();
                }
            }).bind(this));
            this.disclosure.addEventListener('keyup', (function(evt) {
                if (evt.code !== 'Escape') {
                    return;
                }
                this.hideDisclosure();
            }).bind(this));
        }
        constructor(el){
            this.disclosure = el;
            this.wrapper = el.closest(selectors$S.wrapper);
            this.key = this.disclosure.id;
            const btnSelector = `[${selectors$S.disclosureToggle}='${this.key}']`;
            this.trigger = document.querySelector(btnSelector);
            this.link = this.trigger.querySelector(selectors$S.link);
            this.grandparent = this.trigger.classList.contains(classes$y.grandparent);
            this.trigger.setAttribute('aria-haspopup', true);
            this.trigger.setAttribute('aria-expanded', false);
            this.trigger.setAttribute('aria-controls', this.key);
            this.connectHoverToggle();
            this.handleTablets();
            this.staggerChildAnimations();
        }
    };
    const hoverDisclosure = {
        onLoad () {
            sections$g[this.id] = [];
            disclosures = this.container.querySelectorAll(selectors$S.disclosureWrappper);
            disclosures.forEach((el)=>{
                sections$g[this.id].push(new HoverDisclosure(el));
            });
        },
        onBlockSelect (evt) {
            sections$g[this.id].forEach((el)=>{
                if (typeof el.onBlockSelect === 'function') {
                    el.onBlockSelect(evt);
                }
            });
        },
        onBlockDeselect (evt) {
            sections$g[this.id].forEach((el)=>{
                if (typeof el.onBlockDeselect === 'function') {
                    el.onBlockDeselect(evt);
                }
            });
        },
        onUnload: function() {
            sections$g[this.id].forEach((el)=>{
                if (typeof el.unload === 'function') {
                    el.unload();
                }
            });
        }
    };

    const selectors$R = {
        item: '[data-main-menu-text-item]',
        wrapper: '[data-text-items-wrapper]',
        text: '.navtext',
        isActive: 'data-menu-active',
        sectionOuter: '[data-header-wrapper]',
        underlineCurrent: 'data-underline-current',
        defaultItem: '.menu__item.main-menu--active .navtext, .header__desktop__button.main-menu--active .navtext'
    };
    let sections$f = {};
    let defaultPositions = null;
    let HoverLine = class HoverLine {
        init() {
            if (this.itemList.length) {
                this.listen();
                this.listenResize();
                this.textBottom = null;
                this.setHeight();
                if (defaultPositions) {
                    if (this.defaultItem) {
                        const startingLeft = this.defaultItem.offsetLeft || 0;
                        this.sectionOuter.style.setProperty('--bar-left', `${startingLeft}px`);
                    }
                    this.reset();
                } else {
                    // initialize at left edge of first item im menu
                    const startingLeft = this.sectionOuter.querySelector(selectors$R.item).offsetLeft;
                    this.sectionOuter.style.setProperty('--bar-left', `${startingLeft}px`);
                    this.sectionOuter.style.setProperty('--bar-width', '0px');
                }
                this.sectionOuter.style.setProperty('--bar-opacity', '1');
            }
        }
        unload() {
            document.removeEventListener('theme:resize', this.reset);
            defaultPositions = null;
        }
        listenResize() {
            document.addEventListener('theme:resize', this.reset.bind(this));
        }
        setDefault() {
            if (this.defaultItem) {
                defaultPositions = {
                    left: this.defaultItem.offsetLeft || null,
                    width: this.defaultItem.clientWidth || null
                };
            }
        }
        setHeight() {
            const height = this.wrapper.clientHeight;
            const text = this.itemList[0].querySelector(selectors$R.text);
            const textHeight = text.clientHeight;
            const textBottom = Math.floor(height / 2 - textHeight / 2) - 4;
            if (this.textBottom !== textBottom) {
                this.sectionOuter.style.setProperty('--bar-text', `${textHeight}px`);
                this.sectionOuter.style.setProperty('--bar-bottom', `${textBottom}px`);
                this.textBottom = textBottom;
            }
        }
        listen() {
            this.itemList.forEach((element)=>{
                element.addEventListener('pointerenter', (evt)=>{
                    const item = evt.target.querySelector(selectors$R.text);
                    this.startBar(item);
                });
            });
            this.wrapper.addEventListener('pointerleave', this.clearBar.bind(this));
        }
        startBar(item) {
            this.setHeight();
            let active = this.sectionOuter.getAttribute(selectors$R.isActive) !== 'false';
            let left = item.offsetLeft;
            let width = item.clientWidth;
            if (active) {
                this.render(width, left);
            } else {
                this.sectionOuter.setAttribute(selectors$R.isActive, true);
                this.render(0, left);
                setTimeout(()=>{
                    this.render(width, left);
                }, 10);
            }
        }
        render(width, left) {
            this.sectionOuter.style.setProperty('--bar-left', `${left}px`);
            this.sectionOuter.style.setProperty('--bar-width', `${width}px`);
        }
        reset() {
            this.setDefault();
            if (defaultPositions && defaultPositions.left && defaultPositions.width) {
                this.sectionOuter.style.setProperty('--bar-left', `${defaultPositions.left}px`);
                this.sectionOuter.style.setProperty('--bar-width', `${defaultPositions.width}px`);
            } else {
                this.sectionOuter.style.setProperty('--bar-width', '0px');
            }
        }
        clearBar() {
            // allow the bar to jump between text sections for cart and main menu
            this.sectionOuter.setAttribute(selectors$R.isActive, false);
            setTimeout(()=>{
                let active = this.sectionOuter.getAttribute(selectors$R.isActive) !== 'false';
                if (!active) {
                    this.reset();
                }
            }, 150);
        }
        constructor(el){
            this.wrapper = el;
            this.itemList = this.wrapper.querySelectorAll(selectors$R.item);
            this.sectionOuter = document.querySelector(selectors$R.sectionOuter);
            this.underlineCurrent = this.sectionOuter.getAttribute(selectors$R.underlineCurrent) === 'true';
            this.defaultItem = null;
            if (this.underlineCurrent) {
                this.defaultItem = this.wrapper.querySelector(selectors$R.defaultItem);
            }
            this.setDefault();
            document.fonts.ready.then(()=>{
                this.init();
            });
        }
    };
    const hoverUnderline = {
        onLoad () {
            sections$f[this.id] = [];
            const els = this.container.querySelectorAll(selectors$R.wrapper);
            els.forEach((el)=>{
                sections$f[this.id].push(new HoverLine(el));
            });
        },
        onUnload: function() {
            sections$f[this.id].forEach((el)=>{
                if (typeof el.unload === 'function') {
                    el.unload();
                }
            });
            delete sections$f[this.id];
        }
    };

    const selectors$Q = {
        price: 'data-header-cart-price',
        count: 'data-header-cart-count',
        dot: 'data-header-cart-full'
    };
    let Totals = class Totals {
        listen() {
            document.addEventListener('theme:cart:change', (function(event) {
                this.cart = event.detail.cart;
                this.update();
            }).bind(this));
        }
        update() {
            if (this.cart) {
                this.prices.forEach((price)=>{
                    price.setAttribute(selectors$Q.price, this.cart.total_price);
                    const newTotal = themeCurrency.formatMoney(this.cart.total_price, theme.moneyFormat);
                    price.innerHTML = newTotal;
                });
                this.counts.forEach((count)=>{
                    count.setAttribute(selectors$Q.count, this.cart.item_count);
                    count.innerHTML = `(${this.cart.item_count})`;
                });
                this.dots.forEach((dot)=>{
                    const full = this.cart.item_count > 0;
                    dot.setAttribute(selectors$Q.dot, full);
                });
            }
        }
        constructor(el){
            this.section = el;
            this.counts = this.section.querySelectorAll(`[${selectors$Q.count}]`);
            this.prices = this.section.querySelectorAll(`[${selectors$Q.price}]`);
            this.dots = this.section.querySelectorAll(`[${selectors$Q.dot}]`);
            this.cart = null;
            this.listen();
        }
    };
    const headerTotals = {
        onLoad () {
            new Totals(this.container);
        }
    };

    const selectors$P = {
        wrapper: '[data-search-popdown-wrap]',
        popdownTrigger: 'data-popdown-toggle',
        close: '[data-close-popdown]',
        input: '[data-predictive-search-input]',
        underlay: '[data-search-underlay]'
    };
    const classes$x = {
        underlayVisible: 'underlay--visible',
        isVisible: 'is-visible'
    };
    let sections$e = {};
    let SearchPopdownTriggers = class SearchPopdownTriggers {
        initTriggerEvents() {
            this.trigger.setAttribute('aria-haspopup', true);
            this.trigger.setAttribute('aria-expanded', false);
            this.trigger.setAttribute('aria-controls', this.key);
            this.trigger.addEventListener('click', (function(evt) {
                evt.preventDefault();
                this.showPopdown();
            }).bind(this));
            this.trigger.addEventListener('keyup', (function(evt) {
                if (evt.code !== 'Space') {
                    return;
                }
                this.showPopdown();
            }).bind(this));
        }
        initPopdownEvents() {
            this.popdown.addEventListener('keyup', (function(evt) {
                if (evt.code !== 'Escape') {
                    return;
                }
                this.hidePopdown();
            }).bind(this));
            this.close.addEventListener('click', (function() {
                this.hidePopdown();
            }).bind(this));
            this.underlay.addEventListener('click', (function() {
                this.hidePopdown();
            }).bind(this));
        }
        hidePopdown() {
            this.popdown.classList.remove(classes$x.isVisible);
            this.underlay.classList.remove(classes$x.underlayVisible);
            this.trigger.focus();
            removeTrapFocus();
            this.popdown.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                bubbles: true
            }));
        }
        showPopdown() {
            this.popdown.classList.add(classes$x.isVisible);
            this.underlay.classList.add(classes$x.underlayVisible);
            trapFocus(this.popdown, {
                elementToFocus: this.input
            });
            this.popdown.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                bubbles: true
            }));
        }
        constructor(trigger){
            this.trigger = trigger;
            this.key = this.trigger.getAttribute(selectors$P.popdownTrigger);
            this.popdown = document.querySelector(`[id='${this.key}']`);
            this.input = this.popdown.querySelector(selectors$P.input);
            this.close = this.popdown.querySelector(selectors$P.close);
            this.wrapper = this.popdown.closest(selectors$P.wrapper);
            this.underlay = this.wrapper.querySelector(selectors$P.underlay);
            this.initTriggerEvents();
            this.initPopdownEvents();
        }
    };
    const searchPopdown = {
        onLoad () {
            sections$e[this.id] = {};
            const trigger = this.container.querySelector(`[${selectors$P.popdownTrigger}]`);
            if (trigger) {
                sections$e[this.id] = new SearchPopdownTriggers(trigger);
            }
        },
        onUnload: function() {
            if (typeof sections$e[this.id].unload === 'function') {
                sections$e[this.id].unload();
            }
        }
    };

    const selectors$O = {
        wrapper: '[data-product-add-popdown-wrapper]',
        closeDrawer: '[data-close-popdown]',
        apiContent: '[data-api-content]',
        cartAjaxEnabled: '[data-ajax-disable="false"]',
        cartAjaxDisabled: '[data-ajax-disable="true"]',
        cartToggleButton: '[data-drawer-toggle="drawer-cart"]',
        cartDrawer: '[data-drawer="drawer-cart"]'
    };
    const classes$w = {
        visible: 'is-visible',
        focusEnable: 'focus-enabled'
    };
    let globalTimer;
    let CartPopdown = class CartPopdown {
        renderPopdown(event) {
            const variant = event.detail.variant;
            const url = `${window.theme.routes.root_url}variants/${variant.id}/?section_id=api-product-popdown`;
            const instance = this;
            axios.get(url).then(function(response) {
                // handle success
                const fresh = document.createElement('div');
                fresh.innerHTML = response.data;
                instance.popdown.innerHTML = fresh.querySelector(selectors$O.apiContent).innerHTML;
                instance.connectCartButton();
                instance.connectCloseButton();
                // If user is navigating with keyboard, focus on the view cart button after popdown opens
                if (document.body.classList.contains(classes$w.focusEnable)) {
                    const cartButton = instance.popdown.querySelector(selectors$O.cartToggleButton);
                    setTimeout(()=>{
                        cartButton.focus();
                    }, 0);
                }
            }).catch(function(error) {
                console.warn(error);
            });
        }
        connectCloseButton() {
            // Enable close button
            this.popdown.classList.add(classes$w.visible);
            const closer = this.popdown.querySelector(selectors$O.closeDrawer);
            closer.addEventListener('click', (function(e) {
                e.preventDefault();
                this.popdown.classList.remove(classes$w.visible);
            }).bind(this));
            this.popdownTimer();
        }
        connectCartButton() {
            // Hook into cart drawer
            const cartButton = this.popdown.querySelector(selectors$O.cartToggleButton);
            const cartDrawer = document.querySelector(selectors$O.cartDrawer);
            if (cartDrawer) {
                cartButton.addEventListener('click', (function(e) {
                    e.preventDefault();
                    this.popdown.classList.remove(classes$w.visible);
                    cartDrawer.dispatchEvent(new CustomEvent('theme:drawer:open', {
                        bubbles: false
                    }));
                }).bind(this));
            }
        }
        popdownTimer() {
            clearTimeout(globalTimer);
            globalTimer = setTimeout(()=>{
                if (this.popdown.contains(document.activeElement)) {
                    // While the user is focused inside of the popdown keep restarting the auto-close timer
                    this.popdownTimer();
                } else {
                    this.popdown.classList.remove(classes$w.visible);
                }
            }, 5000);
        }
        constructor(){
            this.popdown = document.querySelector(selectors$O.wrapper);
            this.cartAjaxEnabled = document.querySelector(selectors$O.cartAjaxEnabled);
            this.cartAjaxDisabled = document.querySelector(selectors$O.cartAjaxDisabled);
            document.addEventListener('theme:cart:popdown', (e)=>{
                if (this.cartAjaxEnabled) {
                    // if we are on the cart page, refresh the cart without popdown
                    this.cartAjaxEnabled.dispatchEvent(new CustomEvent('theme:cart:reload', {
                        bubbles: true
                    }));
                } else if (this.cartAjaxDisabled) {
                    // ajax is disabled, refresh the whole page
                    window.location.reload();
                } else {
                    this.renderPopdown(e);
                }
            });
        }
    };
    const cartPopdown = {
        onLoad () {
            new CartPopdown(this);
        }
    };

    const selectors$N = {
        dataGridItemVariant: 'data-grid-item-variant',
        dataGridImageTarget: 'data-grid-image-target',
        dataSwatchGridImageIndex: 'data-grid-image',
        dataGridImage: 'data-grid-image',
        dataSwatchImageId: 'data-swatch-image-id',
        dataSwatchIndex: 'data-swatch-index'
    };
    let ProductGridItem = class ProductGridItem extends HTMLElement {
        connectedCallback() {
            if (this.gridItemVariantLinks.length) {
                this.gridItemVariantLinks.forEach((element)=>{
                    if (!element.hasAttribute(selectors$N.dataGridItemVariant)) return;
                    this.swatchHoverEvent(element);
                    this.swatchClickEvent(element);
                });
            }
        }
        swatchHoverEvent(swatchLink) {
            swatchLink.addEventListener('mouseenter', ()=>{
                if (swatchLink.hasAttribute(selectors$N.dataGridItemVariant)) {
                    const product = swatchLink.getAttribute(selectors$N.dataGridItemVariant);
                    // Ensure all images are loaded for this swatch
                    this.container.querySelectorAll(`product-grid-item-variant[${selectors$N.dataGridItemVariant}="${product}"] product-grid-item-image`).forEach((image)=>{
                        image.setAttribute('loading', 'eager');
                    });
                }
            });
        }
        swatchClickEvent(swatchLink) {
            swatchLink.addEventListener('click', (e)=>{
                e.preventDefault();
                this.container.querySelectorAll(`a[${selectors$N.dataGridItemVariant}]`).forEach((link)=>link.removeAttribute('aria-selected')
                );
                swatchLink.setAttribute('aria-selected', 'true');
                if (swatchLink.hasAttribute(selectors$N.dataGridItemVariant)) {
                    const swatchLinkVariant = swatchLink.getAttribute(selectors$N.dataGridItemVariant);
                    // Show content for swatch
                    this.container.querySelectorAll(`product-grid-item-variant[${selectors$N.dataGridItemVariant}]`).forEach((swatchElement)=>{
                        const swatchElementVariant = swatchElement.getAttribute(selectors$N.dataGridItemVariant);
                        if (swatchElementVariant === swatchLinkVariant) {
                            swatchElement.removeAttribute('hidden');
                        } else {
                            swatchElement.setAttribute('hidden', '');
                        }
                    });
                }
            });
        }
        constructor(){
            super();
            this.container = this;
            this.gridItemVariantLinks = this.container.querySelectorAll(`a[${selectors$N.dataGridItemVariant}]`);
        }
    };

    const selectors$M = {
        productGridItemLink: '[data-grid-link]',
        dataGridImages: 'data-grid-images',
        dataGridImage: 'data-grid-image',
        dataGridImageTarget: 'data-grid-image-target',
        dataGridCurrentImage: 'data-grid-current-image',
        dataGridPagination: 'data-grid-pagination',
        dataGridPage: 'data-grid-page',
        dataGridItemVariant: 'data-grid-item-variant',
        dataSlideForFilterSelectedVariant: 'data-slide-for-filter-selected-variant',
        dataSlideForVariantMedia: 'data-slide-for-variant-media',
        dataSlideshowStyle: 'data-slideshow-style',
        styleWidth: '--width'
    };
    const classes$v = {
        fade: 'is-fade',
        active: 'is-active',
        mobile: 'is-mobile',
        pagination: 'product-grid-item__pagination',
        productGridItemImage: 'product-grid-item__image'
    };
    // Only create pagination if the style is cycle_images
    // If the style is second_immediately we show the second image immmidiately
    // without pagination or a timer. If the style is disabled we do nothing on
    // hover, only change images on swatch click
    let ProductGridItemVariant = class ProductGridItemVariant extends HTMLElement {
        static get observedAttributes() {
            return [
                'hidden'
            ];
        }
        /*
      Ensure that image at index is loaded
      */ preloadImage(index) {
            // For now, we don't have a mobile slideshow so do not preload
            if (this.isMobile) return;
            const childElement = [
                ...this.images
            ][index];
            if (!childElement) {
                throw new Error(`No child element at index ${index}`);
            }
            childElement.setAttribute('loading', 'eager');
        }
        /*
      Load all images by replacing each template with it's content
      */ preloadImages() {
            [
                ...this.imagesHolder.children
            ].forEach((_el, i)=>this.preloadImage(i)
            );
        }
        connectedCallback() {
            this.toggleMobile();
            document.addEventListener('theme:resize:width', ()=>this.toggleMobile()
            );
            if (this.isMobile) return;
            if (this.imageCount > 1) {
                // Create slider of PGI images if the images are more than 1
                this.createPaging();
                this.container.addEventListener('theme:swatch:change', this.swatchChangeEvent);
                this.container.addEventListener('mouseenter', this.mouseEnterEvent);
                this.container.addEventListener('mouseleave', this.mouseLeaveEvent);
            }
            this.intersectionObserver.observe(this.container);
        }
        disconnectedCallback() {
            this.container.removeEventListener('theme:swatch:change', this.swatchChangeEvent);
            this.container.removeEventListener('mouseenter', this.mouseEnterEvent);
            this.container.removeEventListener('mouseleave', this.mouseLeaveEvent);
        }
        swatchChangeEvent(e) {
            // Change the image if the swatch is clicked
            const id = e.detail.id;
            const target = this.container.querySelector(`[${selectors$M.dataGridImageTarget}="${id}"]`);
            if (target) {
                const index = target.getAttribute(selectors$M.dataGridImage);
                this.pagingProgressCounter = 0;
                this.changeImage(index);
                if (e.detail.stopSlideAnimation) {
                    this.stopPaging();
                }
            }
        }
        mouseEnterEvent() {
            this.preloadImages();
            switch(this.slideshowStyle){
                case 'cycle_images':
                    // Start slideshow
                    this.pagingProgressPause = this.isMobile;
                    this.progressPaging();
                    break;
                case 'second_immediately':
                    this.changeImage(this.getNextIndex());
                    break;
                case 'disabled':
                    break;
                default:
                    throw new Error(`Unknown option ${this.slideshowStyle}`);
            }
        }
        mouseLeaveEvent() {
            // Stop slideshow and rewind to first image
            this.pagingProgressPause = true;
            this.resetSlideshow();
            this.progressPaging();
        }
        attributeChangedCallback(name, prevValue, newValue) {
            if (name === 'hidden' && prevValue == null && newValue != null) {
                // When hiding or showing a PGI, reset it's slideshow to show the image for the current variant
                this.showVariant();
            }
        }
        toggleMobile() {
            this.container.classList.toggle(classes$v.mobile, this.isMobile);
        }
        get isMobile() {
            const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            return windowWidth < window.theme.sizes.medium;
        }
        resetSlideshow() {
            const forcedDefaultSlide = this.container.querySelector(`[${selectors$M.dataSlideForFilterSelectedVariant}]`);
            // if a variant is selected by a collection filter show the variant image instead of the image at [0]
            if (forcedDefaultSlide) {
                let imageIndex = Number(forcedDefaultSlide.getAttribute(selectors$M.dataGridImage));
                this.changeImage(imageIndex);
            } else {
                this.changeImage(0);
            }
            this.pagingProgressPause = true;
        }
        showVariant() {
            const variantImage = this.container.querySelector(`[${selectors$M.dataSlideForVariantMedia}]`);
            // if a swatch is clicked, show the variant image instead of the image at [0]
            if (variantImage) {
                let imageIndex = Number(variantImage.getAttribute(selectors$M.dataGridImage));
                this.changeImage(imageIndex);
            } else {
                this.changeImage(0);
            }
            this.pagingProgressPause = true;
        }
        getNextIndex() {
            let currentImage = this.container.querySelector(`[${selectors$M.dataGridImage}][${selectors$M.dataGridCurrentImage}]`);
            if (currentImage) {
                const currentIndex = Number(currentImage.getAttribute(selectors$M.dataGridImage));
                const nextIndex = (currentIndex + 1) % this.imageCount;
                return nextIndex;
            } else {
                return 0;
            }
        }
        changeImage(index) {
            const currentImage = this.images[index % this.imageCount];
            if (!currentImage) return;
            this.activeImages.forEach((image)=>image.removeAttribute(selectors$M.dataGridCurrentImage)
            );
            currentImage.setAttribute(selectors$M.dataGridCurrentImage, 'true');
            if (this.slideshowStyle === 'cycle_images') {
                this.changePaging(index);
            }
        }
        changePaging(index = 0) {
            // Change active class on slider pagination
            const activePage = this.container.querySelector(`[${selectors$M.dataGridPage}].${classes$v.active}`);
            const currentPage = this.container.querySelector(`[${selectors$M.dataGridPage}="${index}"]`);
            if (activePage) {
                activePage.style.setProperty(selectors$M.styleWidth, '100%');
                activePage.classList.remove(classes$v.active);
            }
            if (currentPage) {
                currentPage.classList.add(classes$v.active);
                this.progressPaging();
            }
        }
        progressPaging() {
            // Play/pause the PGI images slider
            const element = this.container.querySelector(`[${selectors$M.dataGridPage}].${classes$v.active}`);
            if (!element || this.isMobile) return;
            this.stopPaging();
            if (this.pagingProgressCounter === 0) {
                element.style.setProperty(selectors$M.styleWidth, '0%');
            }
            this.interval = setInterval(()=>{
                if (this.pagingProgressCounter >= 100 && !this.pagingProgressPause) {
                    this.stopPaging();
                    this.pagingProgressCounter = 0;
                    this.changeImage(this.getNextIndex());
                } else if (!this.pagingProgressPause) {
                    this.pagingProgressCounter++;
                    element.style.setProperty(selectors$M.styleWidth, `${this.pagingProgressCounter}%`);
                }
            }, this.timeout / 100);
        }
        stopPaging() {
            // Stop slider
            if (this.interval) {
                clearInterval(this.interval);
            }
        }
        createPaging() {
            // Create pagination of PGI images slider
            if (this.imagesHolder && this.slideshowStyle === 'cycle_images') {
                let pagination = '';
                for(let index = 0; index < this.imageCount; index++){
                    let activeClass = '';
                    if (index === 0) {
                        activeClass = `class="${classes$v.active}"`;
                    }
                    pagination += `<span ${activeClass} ${selectors$M.dataGridPage}="${index}">${index + 1}</span>`;
                }
                if (pagination !== '') {
                    let pagingContainer = this.container.querySelector(`[${selectors$M.dataGridPagination}]`);
                    if (!pagingContainer) {
                        pagingContainer = document.createElement('div');
                        pagingContainer.className = classes$v.pagination;
                        pagingContainer.setAttribute(selectors$M.dataGridPagination, '');
                    }
                    pagingContainer.innerHTML = pagination;
                    this.imagesHolder.parentElement.prepend(pagingContainer);
                }
            }
        }
        removePaging() {
            // Remove the slider pagination holder
            const pagingContainer = this.container.querySelector(`[${selectors$M.dataGridPagination}]`);
            if (pagingContainer) {
                pagingContainer.remove();
            }
        }
        get imagesHolder() {
            return this.container.querySelector(`[${selectors$M.dataGridImages}]`);
        }
        get images() {
            return this.imagesHolder.querySelectorAll(`[${selectors$M.dataGridImage}]`);
        }
        get activeImages() {
            return this.imagesHolder.querySelectorAll(`[${selectors$M.dataGridImage}][${selectors$M.dataGridCurrentImage}]`);
        }
        get links() {
            return this.container.querySelectorAll(selectors$M.productGridItemLink);
        }
        get slideshowStyle() {
            return this.container.getAttribute(selectors$M.dataSlideshowStyle);
        }
        get imageCount() {
            return this.images.length;
        }
        constructor(){
            super();
            this.container = this;
            this.mobileStopSlideshow = 'true';
            this.timeout = window.theme.settings.cycle_images_hover_delay * 1000 || 1500;
            this.interval = null;
            this.pagingProgressPause = false;
            this.pagingProgressCounter = 0;
            this.siblingsFetchCounter = 0;
            this.siblingLoadImageIndex = null;
            this.intersectionObserver = new IntersectionObserver((entries)=>{
                entries.forEach((entry)=>{
                    if (entry.isIntersecting) {
                        // As soon as grid item is on-screen preload second slideshow image so that it appears immediately when hovering
                        if (this.imageCount > 1) {
                            this.preloadImage(1);
                        }
                    }
                });
            }, {
                threshold: 0.1
            });
        }
    };

    const selectors$L = {
        dataGridCurrentImage: 'data-grid-current-image'
    };
    const classes$u = {
        active: 'is-active'
    };
    let ProductGridItemImage = class ProductGridItemImage extends HTMLElement {
        static get observedAttributes() {
            return [
                'loading',
                selectors$L.dataGridCurrentImage
            ];
        }
        connectedCallback() {
            if (this.getAttribute(selectors$L.dataGridCurrentImage) === null) {
                this.hide();
            } else {
                this.show();
            }
        }
        attributeChangedCallback(name, _oldValue, newValue) {
            switch(name){
                case 'loading':
                    if (newValue === null || newValue === 'eager') {
                        this.eagerLoad();
                    }
                    break;
                case selectors$L.dataGridCurrentImage:
                    if (newValue === null) {
                        this.hide();
                    } else {
                        this.show();
                    }
                    break;
            }
        }
        show() {
            this.classList.add(classes$u.active);
        }
        hide() {
            this.classList.remove(classes$u.active);
        }
        // Ensure that child image has loaded in case the child was wrapped in `<template>` to prevent eager loading
        eagerLoad() {
            const childElement = this.firstElementChild;
            switch(childElement.nodeName){
                case 'TEMPLATE':
                    // For template children, replace the template with the child img tag which will load the image
                    const template = childElement;
                    const templateContent = template.content;
                    // Make sure template children images load immediatley
                    templateContent.querySelectorAll('img').forEach((imgEl)=>{
                        imgEl.setAttribute('loading', 'eager');
                        imgEl.setAttribute('fetchpriority', 'high');
                    });
                    template.replaceWith(templateContent);
                    break;
                case 'IMG':
                    // For image children, make sure they load immediately if they were otherwise set to lazy load
                    childElement.setAttribute('loading', 'eager');
                    childElement.setAttribute('fetchpriority', 'high');
                    break;
            }
        }
    };

    const selectors$K = {
        popoutWrapper: '[data-popout]',
        popoutList: '[data-popout-list]',
        popoutListScroll: 'data-popout-list-scroll',
        popoutToggle: 'data-popout-toggle',
        popoutInput: '[data-popout-input]',
        popoutOptions: '[data-popout-option]',
        popoutPrevent: 'data-popout-prevent',
        popoutQuantity: 'data-quantity-field',
        dataValue: 'data-value',
        ariaExpanded: 'aria-expanded',
        ariaCurrent: 'aria-current'
    };
    const classes$t = {
        listVisible: 'popout-list--visible',
        currentSuffix: '--current'
    };
    let PopoutSelect = class PopoutSelect extends HTMLElement {
        unload() {
            if (this.popoutOptions.length) {
                this.popoutOptions.forEach((element)=>{
                    element.removeEventListener('theme:popout:click', this.popupOptionsClick.bind(this));
                    element.removeEventListener('click', this._connectOptionsDispatch.bind(this));
                });
            }
            this.popoutToggle.removeEventListener('click', this.popupToggleClick.bind(this));
            this.popoutToggle.removeEventListener('focusout', this.popupToggleFocusout.bind(this));
            this.popoutList.removeEventListener('focusout', this.popupListFocusout.bind(this));
            this.container.removeEventListener('keyup', this.containerKeyup.bind(this));
            if (this.outsidePopupToggle) {
                this.outsidePopupToggle.removeEventListener('click', this.popupToggleClick.bind(this));
                this.outsidePopupToggle.removeEventListener('focusout', this.popupToggleFocusout.bind(this));
            }
        }
        popupToggleClick(evt) {
            const ariaExpanded = evt.currentTarget.getAttribute(selectors$K.ariaExpanded) === 'true';
            evt.currentTarget.setAttribute(selectors$K.ariaExpanded, !ariaExpanded);
            this.popoutList.classList.toggle(classes$t.listVisible);
            this.popupListMaxWidth();
            if (this.popoutList.hasAttribute(selectors$K.popoutListScroll)) {
                setTimeout(()=>{
                    this.popoutList.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                        bubbles: true
                    }));
                }, 1);
            }
        }
        popupToggleFocusout(evt) {
            const popoutLostFocus = this.container.contains(evt.relatedTarget);
            if (!popoutLostFocus) {
                this._hideList();
            }
        }
        popupListFocusout(evt) {
            const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
            const isVisible = this.popoutList.classList.contains(classes$t.listVisible);
            if (isVisible && !childInFocus) {
                this._hideList();
            }
        }
        popupListMaxWidth() {
            this.popoutList.style.maxWidth = `${parseInt(document.body.clientWidth - this.popoutList.getBoundingClientRect().left)}px`;
        }
        popupOptionsClick(evt) {
            const link = evt.target.closest(selectors$K.popoutOptions);
            if (link.attributes.href.value === '#') {
                evt.preventDefault();
                let attrValue = '';
                if (evt.currentTarget.getAttribute(selectors$K.dataValue)) {
                    attrValue = evt.currentTarget.getAttribute(selectors$K.dataValue);
                }
                this.popoutInput.value = attrValue;
                if (this.popoutPrevent) {
                    this.popoutInput.dispatchEvent(new Event('change'));
                    if (!evt.detail.preventTrigger && this.popoutInput.hasAttribute(selectors$K.popoutQuantity)) {
                        this.popoutInput.dispatchEvent(new Event('input'));
                    }
                    const currentElement = this.popoutList.querySelector(`[class*="${classes$t.currentSuffix}"]`);
                    let targetClass = classes$t.currentSuffix;
                    if (currentElement && currentElement.classList.length) {
                        for (const currentElementClass of currentElement.classList){
                            if (currentElementClass.includes(classes$t.currentSuffix)) {
                                targetClass = currentElementClass;
                                break;
                            }
                        }
                    }
                    const listTargetElement = this.popoutList.querySelector(`.${targetClass}`);
                    if (listTargetElement) {
                        listTargetElement.classList.remove(`${targetClass}`);
                        evt.currentTarget.parentElement.classList.add(`${targetClass}`);
                    }
                    const targetAttribute = this.popoutList.querySelector(`[${selectors$K.ariaCurrent}]`);
                    if (targetAttribute && targetAttribute.hasAttribute(`${selectors$K.ariaCurrent}`)) {
                        targetAttribute.removeAttribute(`${selectors$K.ariaCurrent}`);
                        evt.currentTarget.setAttribute(`${selectors$K.ariaCurrent}`, 'true');
                    }
                    if (attrValue !== '') {
                        this.replaceTextContent(this.popoutToggle, attrValue);
                        if (this.outsidePopupToggle) {
                            this.replaceTextContent(this.outsidePopupToggle, attrValue);
                        }
                    }
                    this.popupToggleFocusout(evt);
                    this.popupListFocusout(evt);
                } else {
                    this._submitForm(attrValue);
                }
            }
        }
        replaceTextContent(elem, newContent) {
            Array.from(elem.childNodes).forEach((node)=>{
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = newContent;
                }
            });
        }
        updatePopout(evt) {
            const targetElement = this.popoutList.querySelector(`[${selectors$K.dataValue}="${this.popoutInput.value}"]`);
            if (targetElement) {
                targetElement.dispatchEvent(new CustomEvent('theme:popout:click', {
                    cancelable: true,
                    bubbles: true,
                    detail: {
                        preventTrigger: true
                    }
                }));
            }
        }
        containerKeyup(evt) {
            if (evt.code !== 'Escape') {
                return;
            }
            this._hideList();
            this.popoutToggle.focus();
        }
        bodyClick(evt) {
            const isOption = this.container.contains(evt.target);
            const isVisible = this.popoutList.classList.contains(classes$t.listVisible);
            this.outsidePopupToggle === evt.target;
            if (isVisible && !isOption) {
                this._hideList();
            }
        }
        _connectToggle() {
            this.popoutToggle.addEventListener('click', this.popupToggleClick.bind(this));
            if (this.outsidePopupToggle) {
                this.outsidePopupToggle.addEventListener('click', this.popupToggleClick.bind(this));
            }
        }
        _connectOptions() {
            if (this.popoutOptions.length) {
                this.popoutOptions.forEach((element)=>{
                    element.addEventListener('theme:popout:click', this.popupOptionsClick.bind(this));
                    element.addEventListener('click', this._connectOptionsDispatch.bind(this));
                });
            }
        }
        _connectOptionsDispatch(evt) {
            const event = new CustomEvent('theme:popout:click', {
                cancelable: true,
                bubbles: true,
                detail: {
                    preventTrigger: false
                }
            });
            if (!evt.target.dispatchEvent(event)) {
                evt.preventDefault();
            }
        }
        _onFocusOut() {
            this.popoutToggle.addEventListener('focusout', this.popupToggleFocusout.bind(this));
            if (this.outsidePopupToggle) {
                this.outsidePopupToggle.addEventListener('focusout', this.popupToggleFocusout.bind(this));
            }
            this.popoutList.addEventListener('focusout', this.popupListFocusout.bind(this));
            this.container.addEventListener('keyup', this.containerKeyup.bind(this));
            document.body.addEventListener('click', this.bodyClick.bind(this));
        }
        _submitForm(value) {
            const form = this.container.closest('form');
            if (form) {
                form.submit();
            }
        }
        _hideList() {
            this.popoutList.classList.remove(classes$t.listVisible);
            this.popoutToggle.setAttribute(selectors$K.ariaExpanded, false);
            if (this.outsidePopupToggle) {
                this.outsidePopupToggle.setAttribute(selectors$K.ariaExpanded, false);
            }
        }
        constructor(){
            super();
            this.container = this.querySelector(selectors$K.popoutWrapper);
            this.popoutList = this.container.querySelector(selectors$K.popoutList);
            this.popoutToggle = this.container.querySelector(`[${selectors$K.popoutToggle}]`);
            this.outsidePopupToggle = document.querySelector(`[${selectors$K.popoutToggle}="${this.popoutList.id}"]`);
            this.popoutInput = this.container.querySelector(selectors$K.popoutInput);
            this.popoutOptions = this.container.querySelectorAll(selectors$K.popoutOptions);
            this.popoutPrevent = this.container.getAttribute(selectors$K.popoutPrevent) === 'true';
            this._connectOptions();
            this._connectToggle();
            this._onFocusOut();
            this.popupListMaxWidth();
            if (this.popoutInput && this.popoutInput.hasAttribute(selectors$K.popoutQuantity)) {
                document.addEventListener('theme:popout:update', this.updatePopout.bind(this));
            }
            document.addEventListener('theme:resize', ()=>{
                this.popupListMaxWidth();
            });
        }
    };

    const slideDown = (target, duration = 500, checkHidden = true)=>{
        let display = window.getComputedStyle(target).display;
        if (checkHidden && display !== 'none') {
            return;
        }
        target.style.removeProperty('display');
        if (display === 'none') display = 'block';
        target.style.display = display;
        let height = target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        target.offsetHeight;
        target.style.boxSizing = 'border-box';
        target.style.transitionTimingFunction = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.height = height + 'px';
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        window.setTimeout(()=>{
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.style.removeProperty('transition-timing-function');
        }, duration);
    };

    const slideUp = (target, duration = 500)=>{
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionTimingFunction = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
        target.style.transitionDuration = duration + 'ms';
        target.style.boxSizing = 'border-box';
        target.style.height = target.offsetHeight + 'px';
        target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        window.setTimeout(()=>{
            target.style.display = 'none';
            target.style.removeProperty('height');
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.style.removeProperty('transition-timing-function');
        }, duration);
    };

    const selectors$J = {
        accordionGroup: '[data-accordion-group]',
        accordionToggle: 'data-accordion-trigger',
        accordionBody: '[data-accordion-body]',
        accordionBodyMobile: 'data-accordion-body-mobile',
        rangeSlider: 'data-range-holder',
        section: '[data-section-id]'
    };
    const classes$s = {
        open: 'accordion-is-open'
    };
    let sections$d = {};
    let Accordion = class Accordion {
        mobileAccordions() {
            if (window.innerWidth < window.theme.sizes.medium) {
                this.init();
                this.setDefaultState();
            } else {
                this.resetMobileAccordions();
                this.body.removeAttribute('style');
            }
            document.addEventListener('theme:resize', ()=>{
                if (window.innerWidth < window.theme.sizes.medium) {
                    this.init();
                    this.setDefaultState();
                } else {
                    this.resetMobileAccordions();
                    this.body.removeAttribute('style');
                }
            });
        }
        init() {
            this.trigger.setAttribute('aria-haspopup', true);
            this.trigger.setAttribute('aria-expanded', false);
            this.trigger.setAttribute('aria-controls', this.key);
            this.setDefaultState();
            this.trigger.addEventListener('click', this.toggleEvent);
            this.body.addEventListener('keyup', this.keyboardEvent);
            this.body.addEventListener('theme:accordion:close', this.hideEvent);
        }
        hideEvents() {
            this.hideAccordion();
        }
        clickEvents(e) {
            e.preventDefault();
            this.toggleState();
        }
        keyboardEvents(e) {
            if (e.code !== 'Escape') {
                return;
            }
            this.hideAccordion();
            this.trigger.focus();
        }
        resetMobileAccordions() {
            this.trigger.removeEventListener('click', this.toggleEvent);
            this.body.removeEventListener('keyup', this.keyboardEvent);
            this.body.removeEventListener('theme:accordion:close', this.hideEvent);
        }
        setDefaultState() {
            if (this.trigger.classList.contains(classes$s.open)) {
                showElement(this.body);
            } else {
                this.hideAccordion();
            }
        }
        getSiblings() {
            const section = this.body.closest(selectors$J.section);
            const groupsArray = [
                ...section.querySelectorAll(selectors$J.accordionGroup)
            ];
            const syncWrapper = groupsArray.filter((el)=>el.contains(this.body)
            ).shift();
            if (syncWrapper) {
                const allChilden = [
                    ...syncWrapper.querySelectorAll(selectors$J.accordionBody)
                ];
                const onlySiblings = allChilden.filter((el)=>!el.contains(this.body)
                );
                return onlySiblings;
            } else return [];
        }
        closeSiblings() {
            this.syncBodies.forEach((accordionBody)=>{
                accordionBody.dispatchEvent(new CustomEvent('theme:accordion:close', {
                    bubbles: false
                }));
            });
        }
        toggleState() {
            if (this.trigger.classList.contains(classes$s.open)) {
                this.hideAccordion();
            } else {
                this.showAccordion();
                this.closeSiblings();
                // Collection filters
                // Accordion with range slider custom event to reload
                if (this.body.hasAttribute(selectors$J.rangeSlider)) {
                    setTimeout(()=>{
                        document.dispatchEvent(new CustomEvent('theme:price-range:reset', {
                            bubbles: false
                        }));
                    }, 400);
                }
            }
        }
        hideAccordion() {
            this.trigger.classList.remove(classes$s.open);
            slideUp(this.body);
        }
        showAccordion() {
            this.trigger.classList.add(classes$s.open);
            slideDown(this.body);
            setTimeout(()=>{
                this.checkInViewportAndScrollTo();
            }, 600);
        }
        checkInViewportAndScrollTo() {
            const rect = this.trigger.getBoundingClientRect();
            const windowScrollY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
            const inViewport = rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
            if (!inViewport) {
                window.scrollTo({
                    top: windowScrollY + rect.top,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }
        onBlockSelect(evt) {
            if (this.body.contains(evt.target)) {
                this.showAccordion();
            }
        }
        onBlockDeselect(evt) {
            if (this.body.contains(evt.target)) {
                this.hideAccordion();
            }
        }
        constructor(el){
            this.body = el;
            this.key = this.body.id;
            const btnSelector = `[${selectors$J.accordionToggle}='${this.key}']`;
            this.trigger = document.querySelector(btnSelector);
            this.toggleEvent = (e)=>this.clickEvents(e)
            ;
            this.keyboardEvent = (e)=>this.keyboardEvents(e)
            ;
            this.hideEvent = ()=>this.hideEvents()
            ;
            this.syncBodies = this.getSiblings();
            if (this.body.hasAttribute(selectors$J.accordionBodyMobile)) {
                this.mobileAccordions();
            } else {
                this.init();
            }
        }
    };
    const accordion = {
        onLoad () {
            sections$d[this.id] = [];
            const els = this.container.querySelectorAll(selectors$J.accordionBody);
            els.forEach((el)=>{
                sections$d[this.id].push(new Accordion(el));
            });
        },
        onUnload: function() {
            sections$d[this.id].forEach((el)=>{
                if (typeof el.unload === 'function') {
                    el.unload();
                }
            });
        },
        onSelect: function() {
            if (this.type === 'accordion-single') {
                this.container.querySelector(`[${selectors$J.accordionToggle}]`).click();
            }
        },
        onDeselect: function() {
            if (this.type === 'accordion-single') {
                this.container.querySelector(`[${selectors$J.accordionToggle}]`).click();
            }
        },
        onBlockSelect (evt) {
            sections$d[this.id].forEach((el)=>{
                if (typeof el.onBlockSelect === 'function') {
                    el.onBlockSelect(evt);
                }
            });
        },
        onBlockDeselect (evt) {
            sections$d[this.id].forEach((el)=>{
                if (typeof el.onBlockSelect === 'function') {
                    el.onBlockDeselect(evt);
                }
            });
        }
    };

    const hideElement = (elem)=>{
        if (elem) {
            elem.style.display = 'none';
        }
    };

    const selectors$I = {
        inputSearch: 'input[type="search"]',
        focusedElements: '[aria-selected="true"] a',
        resetButton: 'button[type="reset"]'
    };
    const classes$r = {
        hidden: 'is-hidden'
    };
    let HeaderSearchForm = class HeaderSearchForm extends HTMLElement {
        toggleResetButton() {
            const resetIsHidden = this.resetButton.classList.contains(classes$r.hidden);
            if (this.input.value.length > 0 && resetIsHidden) {
                this.resetButton.classList.remove(classes$r.hidden);
            } else if (this.input.value.length === 0 && !resetIsHidden) {
                this.resetButton.classList.add(classes$r.hidden);
            }
        }
        onChange() {
            this.toggleResetButton();
        }
        shouldResetForm() {
            return !document.querySelector(selectors$I.focusedElements);
        }
        onFormReset(event) {
            // Prevent default so the form reset doesn't set the value gotten from the url on page load
            event.preventDefault();
            // Don't reset if the user has selected an element on the predictive search dropdown
            if (this.shouldResetForm()) {
                this.input.value = '';
                this.toggleResetButton();
                event.target.querySelector(selectors$I.inputSearch).focus();
            }
        }
        constructor(){
            super();
            this.input = this.querySelector(selectors$I.inputSearch);
            this.resetButton = this.querySelector(selectors$I.resetButton);
            if (this.input) {
                this.input.form.addEventListener('reset', this.onFormReset.bind(this));
                this.input.addEventListener('input', debounce$1((event)=>{
                    this.onChange(event);
                }, 300).bind(this));
            }
        }
    };
    customElements.define('header-search-form', HeaderSearchForm);

    const selectors$H = {
        allVisibleElements: '[role="option"]',
        ariaSelected: '[aria-selected="true"]',
        predictiveSearch: 'predictive-search',
        predictiveSearchResults: '[data-predictive-search-results]',
        predictiveSearchStatus: '[data-predictive-search-status]',
        searchInput: '[data-predictive-search-input]',
        searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
        searchResultsGroupsWrapper: 'data-search-results-groups-wrapper',
        searchForText: '[data-predictive-search-search-for-text]',
        sectionPredictiveSearch: '#shopify-section-predictive-search',
        selectedLink: '[aria-selected="true"] a',
        selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
        loader: '[data-loading-indicator]'
    };
    let PredictiveSearch = class PredictiveSearch extends HeaderSearchForm {
        connectedCallback() {
            this.input.addEventListener('focus', this.onFocus.bind(this));
            this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));
            this.addEventListener('focusout', this.onFocusOut.bind(this));
            this.addEventListener('keyup', this.onKeyup.bind(this));
            this.addEventListener('keydown', this.onKeydown.bind(this));
        }
        getQuery() {
            return this.input.value.trim();
        }
        onChange() {
            super.onChange();
            const newSearchTerm = this.getQuery();
            if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
                var // Remove the results when they are no longer relevant for the new search term
                // so they don't show up when the dropdown opens again
                ref;
                (ref = this.querySelector(selectors$H.searchResultsGroupsWrapper)) === null || ref === void 0 ? void 0 : ref.remove();
            }
            // Update the term asap, don't wait for the predictive search query to finish loading
            this.updateSearchForTerm(this.searchTerm, newSearchTerm);
            this.searchTerm = newSearchTerm;
            if (!this.searchTerm.length) {
                this.reset();
                return;
            }
            this.getSearchResults(this.searchTerm);
        }
        onFormSubmit(event) {
            if (!this.getQuery().length || this.querySelector(selectors$H.selectedLink)) event.preventDefault();
        }
        onFormReset(event) {
            super.onFormReset(event);
            if (super.shouldResetForm()) {
                this.searchTerm = '';
                this.abortController.abort();
                this.abortController = new AbortController();
                this.closeResults(true);
            }
        }
        shouldResetForm() {
            return !document.querySelector(selectors$H.selectedLink);
        }
        onFocus() {
            const currentSearchTerm = this.getQuery();
            if (!currentSearchTerm.length) return;
            if (this.searchTerm !== currentSearchTerm) {
                // Search term was changed from other search input, treat it as a user change
                this.onChange();
            } else if (this.getAttribute('results') === 'true') {
                this.open();
            } else {
                this.getSearchResults(this.searchTerm);
            }
        }
        onFocusOut() {
            setTimeout(()=>{
                if (!this.contains(document.activeElement)) this.close();
            });
        }
        onKeyup(event) {
            if (!this.getQuery().length) this.close(true);
            event.preventDefault();
            switch(event.code){
                case 'ArrowUp':
                    this.switchOption('up');
                    break;
                case 'ArrowDown':
                    this.switchOption('down');
                    break;
                case 'Enter':
                    this.selectOption();
                    break;
            }
        }
        onKeydown(event) {
            // Prevent the cursor from moving in the input when using the up and down arrow keys
            if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
                event.preventDefault();
            }
        }
        updateSearchForTerm(previousTerm, newTerm) {
            const searchForTextElement = this.querySelector(selectors$H.searchForText);
            const currentButtonText = searchForTextElement === null || searchForTextElement === void 0 ? void 0 : searchForTextElement.innerText;
            if (currentButtonText) {
                var ref;
                if (((ref = currentButtonText.match(previousTerm)) === null || ref === void 0 ? void 0 : ref.length) > 1) {
                    // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
                    return;
                }
                const newButtonText = currentButtonText.replace(previousTerm, newTerm);
                searchForTextElement.innerText = newButtonText;
            }
        }
        switchOption(direction) {
            if (!this.getAttribute('open')) return;
            const moveUp = direction === 'up';
            const selectedElement = this.querySelector(selectors$H.ariaSelected);
            // Filter out hidden elements (duplicated page and article resources) thanks
            // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
            const allVisibleElements = Array.from(this.querySelectorAll(selectors$H.allVisibleElements)).filter((element)=>element.offsetParent !== null
            );
            let activeElementIndex = 0;
            if (moveUp && !selectedElement) return;
            let selectedElementIndex = -1;
            let i = 0;
            while(selectedElementIndex === -1 && i <= allVisibleElements.length){
                if (allVisibleElements[i] === selectedElement) {
                    selectedElementIndex = i;
                }
                i++;
            }
            this.statusElement.textContent = '';
            if (!moveUp && selectedElement) {
                activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
            } else if (moveUp) {
                activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
            }
            if (activeElementIndex === selectedElementIndex) return;
            const activeElement = allVisibleElements[activeElementIndex];
            activeElement.setAttribute('aria-selected', true);
            if (selectedElement) selectedElement.setAttribute('aria-selected', false);
            this.input.setAttribute('aria-activedescendant', activeElement.id);
        }
        selectOption() {
            const selectedOption = this.querySelector(selectors$H.selectedOption);
            if (selectedOption) selectedOption.click();
        }
        getSearchResults(searchTerm) {
            const queryKey = searchTerm.replace(' ', '-').toLowerCase();
            this.setLiveRegionLoadingState();
            if (this.cachedResults[queryKey]) {
                this.renderSearchResults(this.cachedResults[queryKey]);
                return;
            }
            showElement(this.loader);
            fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`, {
                signal: this.abortController.signal
            }).then(this.handleErrors).then((response)=>response.text()
            ).then((response)=>{
                const resultsMarkup = new DOMParser().parseFromString(response, 'text/html').querySelector(selectors$H.sectionPredictiveSearch).innerHTML;
                // Save bandwidth keeping the cache in all instances synced
                this.allPredictiveSearchInstances.forEach((predictiveSearchInstance)=>{
                    predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
                });
                this.renderSearchResults(resultsMarkup);
            }).catch((e)=>{
                console.error(e);
            }).finally(()=>{
                hideElement(this.loader);
            });
        }
        setLiveRegionLoadingState() {
            this.statusElement = this.statusElement || this.querySelector(selectors$H.predictiveSearchStatus);
            this.loadingText = this.loadingText || this.getAttribute('data-loading-text');
            this.setLiveRegionText(this.loadingText);
            this.setAttribute('loading', true);
        }
        setLiveRegionText(statusText) {
            this.statusElement.setAttribute('aria-hidden', 'false');
            this.statusElement.textContent = statusText;
            setTimeout(()=>{
                this.statusElement.setAttribute('aria-hidden', 'true');
            }, 1000);
        }
        renderSearchResults(resultsMarkup) {
            this.predictiveSearchResults.innerHTML = resultsMarkup;
            this.setAttribute('results', true);
            this.setLiveRegionResults();
            this.open();
        }
        setLiveRegionResults() {
            this.removeAttribute('loading');
            this.setLiveRegionText(this.querySelector(selectors$H.searchResultsLiveRegion).textContent);
        }
        open() {
            this.setAttribute('open', true);
            this.input.setAttribute('aria-expanded', true);
            this.isOpen = true;
        }
        close(clearSearchTerm = false) {
            this.closeResults(clearSearchTerm);
            this.isOpen = false;
        }
        closeResults(clearSearchTerm = false) {
            var ref;
            if (clearSearchTerm) {
                this.input.value = '';
                this.removeAttribute('results');
            }
            const selected = this.querySelector(selectors$H.ariaSelected);
            if (selected) selected.setAttribute('aria-selected', false);
            this.input.setAttribute('aria-activedescendant', '');
            this.removeAttribute('loading');
            this.removeAttribute('open');
            this.input.setAttribute('aria-expanded', false);
            (ref = this.predictiveSearchResults) === null || ref === void 0 ? void 0 : ref.removeAttribute('style');
        }
        reset() {
            this.predictiveSearchResults.innerHTML = '';
            this.input.val = '';
            this.a11y.removeTrapFocus();
        }
        handleErrors(response) {
            if (!response.ok) {
                return response.json().then(function(json) {
                    const e = new FetchError({
                        status: response.statusText,
                        headers: response.headers,
                        json: json
                    });
                    throw e;
                });
            }
            return response;
        }
        constructor(){
            super();
            this.wrapper = this;
            this.a11y = a11y;
            this.abortController = new AbortController();
            this.allPredictiveSearchInstances = document.querySelectorAll(selectors$H.predictiveSearch);
            this.cachedResults = {};
            this.input = this.wrapper.querySelector(selectors$H.searchInput);
            this.isOpen = false;
            this.predictiveSearchResults = this.querySelector(selectors$H.predictiveSearchResults);
            this.searchTerm = '';
            this.loader = this.wrapper.querySelector(selectors$H.loader);
        }
    };

    function getWindowWidth() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }
    function isDesktop() {
        return getWindowWidth() >= window.theme.sizes.small;
    }
    function isMobile() {
        return getWindowWidth() < window.theme.sizes.small;
    }

    const selectors$G = {
        inputSearch: 'input[type="search"]'
    };
    let MainSearch = class MainSearch extends HeaderSearchForm {
        setupEventListeners() {
            let allSearchForms = [];
            this.allSearchInputs.forEach((input)=>allSearchForms.push(input.form)
            );
            this.input.addEventListener('focus', this.onInputFocus.bind(this));
            if (allSearchForms.length < 2) return;
            allSearchForms.forEach((form)=>form.addEventListener('reset', this.onFormReset.bind(this))
            );
            this.allSearchInputs.forEach((input)=>input.addEventListener('input', this.onInput.bind(this))
            );
        }
        onFormReset(event) {
            super.onFormReset(event);
            if (super.shouldResetForm()) {
                this.keepInSync('', this.input);
            }
        }
        onInput(event) {
            const target = event.target;
            this.keepInSync(target.value, target);
        }
        onInputFocus() {
            if (!isDesktop()) {
                this.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
        keepInSync(value, target) {
            this.allSearchInputs.forEach((input)=>{
                if (input !== target) {
                    input.value = value;
                }
            });
        }
        constructor(){
            super();
            this.allSearchInputs = document.querySelectorAll(selectors$G.inputSearch);
            this.setupEventListeners();
        }
    };

    const selectors$F = {
        drawer: 'data-drawer-scrolls',
        slideruleOpen: 'data-sliderule-open',
        slideruleClose: 'data-sliderule-close',
        sliderulePane: 'data-sliderule-pane',
        slideruleWrappper: '[data-sliderule]',
        dataAnimates: 'data-animates',
        children: `:scope > [data-animates],
             :scope > * > [data-animates],
             :scope > * > * >[data-animates],
             :scope .sliderule-grid  > *`
    };
    const classes$q = {
        isVisible: 'is-visible',
        isHiding: 'is-hiding',
        isHidden: 'is-hidden'
    };
    let sections$c = {};
    let HeaderMobileSliderule = class HeaderMobileSliderule {
        clickEvents() {
            this.trigger.addEventListener('click', (function() {
                this.showSliderule();
            }).bind(this));
            this.exit.forEach((element)=>{
                element.addEventListener('click', (function() {
                    this.hideSliderule();
                }).bind(this));
            });
        }
        keyboardEvents() {
            this.trigger.addEventListener('keyup', (function(evt) {
                if (evt.code !== 'Space') {
                    return;
                }
                this.showSliderule();
            }).bind(this));
            this.sliderule.addEventListener('keyup', (function(evt) {
                if (evt.code !== 'Escape') {
                    return;
                }
                this.hideSliderule();
                this.buttons[0].focus();
            }).bind(this));
        }
        staggerChildAnimations(reverse = false) {
            const childrenArr = reverse ? Array.prototype.slice.call(this.children).slice().reverse() : this.children;
            childrenArr.forEach((child, index)=>{
                child.style.transitionDelay = index * 50 + 10 + 'ms';
            });
        }
        hideSliderule(close = false) {
            const paneStyle = window.getComputedStyle(this.pane);
            const paneTransitionDuration = parseFloat(paneStyle.getPropertyValue('transition-duration')) * 1000;
            const children = close ? this.pane.querySelectorAll(`.${classes$q.isVisible}`) : this.children;
            this.pane.style.setProperty('--sliderule-height', 'auto');
            this.staggerChildAnimations(true);
            this.pane.classList.add(classes$q.isHiding);
            this.sliderule.classList.add(classes$q.isHiding);
            this.sliderule.classList.remove(classes$q.isVisible);
            children.forEach((el)=>{
                el.classList.remove(classes$q.isVisible);
            });
            const newPosition = parseInt(this.pane.dataset.sliderulePane, 10) - 1;
            this.pane.setAttribute(selectors$F.sliderulePane, newPosition);
            const hidedSelector = close ? `[${selectors$F.dataAnimates}].${classes$q.isHidden}` : `[${selectors$F.dataAnimates}="${newPosition}"].${classes$q.isHidden}`;
            const hidedItems = this.pane.querySelectorAll(hidedSelector);
            if (hidedItems.length) {
                hidedItems.forEach((element)=>{
                    element.classList.remove(classes$q.isHidden);
                });
            }
            setTimeout(()=>{
                this.pane.classList.remove(classes$q.isHiding);
                this.sliderule.classList.remove(classes$q.isHiding);
                this.staggerChildAnimations();
            }, paneTransitionDuration);
        }
        showSliderule() {
            this.pane.style.setProperty('--sliderule-height', 'auto');
            this.sliderule.classList.add(classes$q.isVisible);
            this.children.forEach((el)=>{
                el.classList.add(classes$q.isVisible);
            });
            const oldPosition = parseInt(this.pane.dataset.sliderulePane, 10);
            const newPosition = oldPosition + 1;
            this.pane.setAttribute(selectors$F.sliderulePane, newPosition);
            const hidedItems = this.pane.querySelectorAll(`[${selectors$F.dataAnimates}="${oldPosition}"]`);
            if (hidedItems.length) {
                const hidedItemsTransition = parseFloat(window.getComputedStyle(hidedItems[0]).getPropertyValue('transition-duration')) * 1000;
                setTimeout(()=>{
                    hidedItems.forEach((element)=>{
                        element.classList.add(classes$q.isHidden);
                    });
                }, hidedItemsTransition);
            }
            const newHeight = parseInt(this.trigger.nextElementSibling.offsetHeight);
            this.pane.style.setProperty('--sliderule-height', `${newHeight}px`);
            const drawerScrollY = this.drawer.scrollTop;
            const scrollToElement = this.pane.offsetTop;
            const enableScrollTo = scrollToElement < drawerScrollY && this.pane.offsetHeight >= this.drawer.offsetHeight;
            if (enableScrollTo) {
                this.drawer.scrollTo({
                    top: scrollToElement,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }
        closeSliderule() {
            if (this.pane && this.pane.hasAttribute(selectors$F.sliderulePane) && parseInt(this.pane.getAttribute(selectors$F.sliderulePane)) > 0) {
                this.hideSliderule(true);
                if (parseInt(this.pane.getAttribute(selectors$F.sliderulePane)) > 0) {
                    this.pane.setAttribute(selectors$F.sliderulePane, 0);
                }
            }
        }
        constructor(el){
            this.sliderule = el;
            this.wrapper = el.closest(selectors$F.wrapper);
            this.key = this.sliderule.id;
            const btnSelector = `[${selectors$F.slideruleOpen}='${this.key}']`;
            const exitSelector = `[${selectors$F.slideruleClose}='${this.key}']`;
            this.trigger = document.querySelector(btnSelector);
            this.drawer = document.querySelector(`[${selectors$F.drawer}]`);
            this.exit = document.querySelectorAll(exitSelector);
            this.pane = document.querySelector(`[${selectors$F.sliderulePane}]`);
            this.children = this.sliderule.querySelectorAll(selectors$F.children);
            this.trigger.setAttribute('aria-haspopup', true);
            this.trigger.setAttribute('aria-expanded', false);
            this.trigger.setAttribute('aria-controls', this.key);
            this.clickEvents();
            this.staggerChildAnimations();
            document.addEventListener('theme:sliderule:close', this.closeSliderule.bind(this));
        }
    };
    const headerMobileSliderule = {
        onLoad () {
            sections$c[this.id] = [];
            const els = this.container.querySelectorAll(selectors$F.slideruleWrappper);
            els.forEach((el)=>{
                sections$c[this.id].push(new HeaderMobileSliderule(el));
            });
        }
    };

    const selectors$E = {
        widthContent: '[data-takes-space]',
        desktop: '[data-header-desktop]',
        cloneClass: 'js__header__clone',
        showMobileClass: 'js__show__mobile',
        backfill: '[data-header-backfill]',
        transparent: 'data-header-transparent',
        overrideBorder: 'header-override-border',
        firstSectionHasImage: '.main-content > .shopify-section:first-child [data-overlay-header]',
        preventTransparentHeader: '.main-content > .shopify-section:first-child [data-prevent-transparent-header]',
        deadLink: '.navlink[href="#"]'
    };
    const classes$p = {
        hasOverlay: 'has-overlay'
    };
    let sections$b = {};
    let Header = class Header {
        unload() {
            document.removeEventListener('theme:resize', this.checkWidth);
        }
        checkForImage() {
            this.overlayedImages = document.querySelectorAll(selectors$E.firstSectionHasImage);
            let preventTransparentHeader = document.querySelectorAll(selectors$E.preventTransparentHeader).length;
            if (this.overlayedImages.length && !preventTransparentHeader && this.transparent) {
                // is transparent and has image, overlay the image
                document.querySelector(selectors$E.backfill).style.display = 'none';
                this.listenOverlay();
            } else {
                this.wrapper.setAttribute(selectors$E.transparent, false);
            }
            if (this.overlayedImages.length && !preventTransparentHeader && !this.transparent) {
                // Have image but not transparent, remove border bottom
                this.wrapper.classList.add(selectors$E.overrideBorder);
                this.subtractHeaderHeight();
            }
        }
        listenOverlay() {
            document.addEventListener('theme:resize', this.checkWidth.bind(this));
            this.subtractAnnouncementHeight();
        }
        listenWidth() {
            document.addEventListener('theme:resize', this.checkWidth.bind(this));
            this.checkWidth();
        }
        killDeadLinks() {
            this.deadLinks.forEach((el)=>{
                el.onclick = (e)=>{
                    e.preventDefault();
                };
            });
        }
        subtractAnnouncementHeight() {
            const { windowHeight , announcementHeight  } = readHeights();
            this.overlayedImages.forEach((el)=>{
                el.style.setProperty('--full-screen', `${windowHeight - announcementHeight}px`);
                el.classList.add(classes$p.hasOverlay);
            });
        }
        subtractHeaderHeight() {
            const { windowHeight , headerHeight  } = readHeights();
            this.overlayedImages.forEach((el)=>{
                el.style.setProperty('--full-screen', `${windowHeight - headerHeight}px`);
            });
        }
        checkWidth() {
            if (document.body.clientWidth < this.minWidth) {
                this.wrapper.classList.add(selectors$E.showMobileClass);
            } else {
                this.wrapper.classList.remove(selectors$E.showMobileClass);
            }
        }
        getMinWidth() {
            const comparitor = this.wrapper.cloneNode(true);
            comparitor.classList.add(selectors$E.cloneClass);
            document.body.appendChild(comparitor);
            const wideElements = comparitor.querySelectorAll(selectors$E.widthContent);
            let minWidth = 0;
            if (wideElements.length === 3) {
                minWidth = _sumSplitWidths(wideElements);
            } else {
                minWidth = _sumWidths(wideElements);
            }
            document.body.removeChild(comparitor);
            return minWidth + wideElements.length * 20;
        }
        constructor(el){
            this.wrapper = el;
            this.style = this.wrapper.dataset.style;
            this.desktop = this.wrapper.querySelector(selectors$E.desktop);
            this.transparent = this.wrapper.getAttribute(selectors$E.transparent) !== 'false';
            this.overlayedImages = document.querySelectorAll(selectors$E.firstSectionHasImage);
            this.deadLinks = document.querySelectorAll(selectors$E.deadLink);
            this.killDeadLinks();
            if (this.style !== 'drawer' && this.desktop) {
                this.minWidth = this.getMinWidth();
                this.listenWidth();
            }
            this.checkForImage();
            window.dispatchEvent(new Event('resize'));
            document.addEventListener('theme:header:check', this.checkForImage.bind(this));
        }
    };
    function _sumSplitWidths(nodes) {
        let arr = [];
        nodes.forEach((el)=>{
            arr.push(el.clientWidth);
        });
        if (arr[0] > arr[2]) {
            arr[2] = arr[0];
        } else {
            arr[0] = arr[2];
        }
        const width = arr.reduce((a, b)=>a + b
        );
        return width;
    }
    function _sumWidths(nodes) {
        let width = 0;
        nodes.forEach((el)=>{
            width += el.clientWidth;
        });
        return width;
    }
    const header = {
        onLoad () {
            sections$b = new Header(this.container);
        },
        onUnload: function() {
            if (typeof sections$b.unload === 'function') {
                sections$b.unload();
            }
        }
    };
    register('header', [
        header,
        drawer,
        headerMobileSliderule,
        stickyHeader,
        hoverDisclosure,
        hoverUnderline,
        headerTotals,
        searchPopdown,
        cartPopdown,
        swatchGridSection,
        accordion,
        ticker
    ]);
    if (!customElements.get('popout-select')) {
        customElements.define('popout-select', PopoutSelect);
    }
    if (!customElements.get('radio-swatch')) {
        customElements.define('radio-swatch', RadioSwatch);
    }
    if (!customElements.get('product-grid-item')) {
        customElements.define('product-grid-item', ProductGridItem);
    }
    if (!customElements.get('product-grid-item-variant')) {
        customElements.define('product-grid-item-variant', ProductGridItemVariant);
    }
    if (!customElements.get('product-grid-item-image')) {
        customElements.define('product-grid-item-image', ProductGridItemImage);
    }
    if (!customElements.get('predictive-search')) {
        customElements.define('predictive-search', PredictiveSearch);
    }
    if (!customElements.get('main-search')) {
        customElements.define('main-search', MainSearch);
    }

    const selectors$D = {
        newsletterForm: '[data-newsletter-form]'
    };
    const classes$o = {
        success: 'has-success',
        error: 'has-error'
    };
    const sections$a = {};
    let NewsletterCheckForResult = class NewsletterCheckForResult {
        init() {
            this.newsletter.addEventListener('submit', this.newsletterSubmit);
            this.showMessage();
        }
        newsletterSubmitEvent(e) {
            if (this.stopSubmit) {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.removeStorage();
                this.writeStorage();
                this.stopSubmit = false;
                this.newsletter.submit();
            }
        }
        checkForChallengePage() {
            this.isChallengePage = window.location.pathname === '/challenge';
        }
        writeStorage() {
            if (this.sessionStorage !== undefined) {
                this.sessionStorage.setItem('newsletter_form_id', this.newsletter.id);
            }
        }
        readStorage() {
            this.formID = this.sessionStorage.getItem('newsletter_form_id');
        }
        removeStorage() {
            this.sessionStorage.removeItem('newsletter_form_id');
        }
        showMessage() {
            this.readStorage();
            if (this.newsletter.id === this.formID) {
                const newsletter = document.getElementById(this.formID);
                if (window.location.search.indexOf('?customer_posted=true') !== -1) {
                    newsletter.classList.remove(classes$o.error);
                    newsletter.classList.add(classes$o.success);
                } else if (window.location.search.indexOf('accepts_marketing') !== -1) {
                    newsletter.classList.remove(classes$o.success);
                    newsletter.classList.add(classes$o.error);
                }
                // Prevents the form from scrolling subsequent pagloads
                this.removeStorage();
                this.scrollToForm(newsletter);
            }
        }
        scrollToForm(newsletter) {
            const rect = newsletter.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
            if (!isVisible) {
                setTimeout(()=>{
                    window.scroll({
                        top: rect.top,
                        left: 0,
                        behavior: 'smooth'
                    });
                }, 400);
            }
        }
        unload() {
            this.newsletter.removeEventListener('submit', this.newsletterSubmit);
        }
        constructor(newsletter){
            this.sessionStorage = window.sessionStorage;
            this.newsletter = newsletter;
            this.stopSubmit = true;
            this.isChallengePage = false;
            this.formID = null;
            this.checkForChallengePage();
            this.newsletterSubmit = (e)=>this.newsletterSubmitEvent(e)
            ;
            if (!this.isChallengePage) {
                this.init();
            }
        }
    };
    const newsletterCheckForResultSection = {
        onLoad () {
            sections$a[this.id] = [];
            const newsletters = this.container.querySelectorAll(selectors$D.newsletterForm);
            newsletters.forEach((form)=>{
                sections$a[this.id].push(new NewsletterCheckForResult(form));
            });
        },
        onUnload () {
            sections$a[this.id].forEach((form)=>{
                if (typeof form.unload === 'function') {
                    form.unload();
                }
            });
        }
    };

    const selectors$C = {
        shopPayWrapper: '[data-shop-pay-wrapper]',
        shopLoginButton: 'shop-login-button',
        shopFollowButton: 'shop-follow-button',
        followOnShopButton: 'follow-on-shop-button',
        heartIcon: 'heart-icon',
        shopLogo: 'shop-logo'
    };
    const sections$9 = {};
    let ShopPayLink = class ShopPayLink {
        init() {
            if (!this.shopLoginButton || !this.shopPayWrapper) return;
            this.mainButtonStyles = `
      :host {
        --bg-color: ${this.shopPayWrapper.dataset.bg};
        --text-color: ${this.shopPayWrapper.dataset.text};
        --hover-color: ${this.shopPayWrapper.dataset.hover};
      }

      .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--text-color);
      }

      .button:not(.button--following):focus-visible .follow-icon-wrapper:before,
      .button:not(.button--following):hover .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--hover-color);
      }

      .button {
        background: transparent;
        color: var(--text-color);
      }

      .following-text {
        color: var(--text-color);
      }

      .button--following:focus-visible,
      .button--following:hover {
        background: var(--bg-color);
      }

      .button:not(.button--following):focus-visible .follow-icon-wrapper:before,
      .button:not(.button--following):hover .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--hover-color);
      }
    `;
            this.svgIconsStyles = `
      :host {
        color: ${this.shopPayWrapper.dataset.text};
      }
    `;
            customElements.whenDefined(selectors$C.shopLoginButton).then((res)=>{
                requestAnimationFrame(()=>{
                    const shadowRoot1 = this.shopLoginButton.shadowRoot;
                    const shopFollowButton = shadowRoot1 === null || shadowRoot1 === void 0 ? void 0 : shadowRoot1.querySelector(selectors$C.shopFollowButton);
                    const shadowRoot2 = shopFollowButton === null || shopFollowButton === void 0 ? void 0 : shopFollowButton.shadowRoot;
                    const followOnShopButton = shadowRoot2 === null || shadowRoot2 === void 0 ? void 0 : shadowRoot2.querySelector(selectors$C.followOnShopButton);
                    const shadowRoot3 = followOnShopButton === null || followOnShopButton === void 0 ? void 0 : followOnShopButton.shadowRoot;
                    if (shadowRoot3) this.overwriteStyles(shadowRoot3.host.shadowRoot, this.mainButtonStyles);
                    const heartIcon = shadowRoot3.querySelector(selectors$C.heartIcon);
                    const shadowRoot4 = heartIcon === null || heartIcon === void 0 ? void 0 : heartIcon.shadowRoot;
                    const shopLogo = shadowRoot3.querySelector(selectors$C.shopLogo);
                    const shadowRoot5 = shopLogo === null || shopLogo === void 0 ? void 0 : shopLogo.shadowRoot;
                    if (shadowRoot4) this.overwriteStyles(shadowRoot4.host.shadowRoot, this.svgIconsStyles);
                    if (shadowRoot5) this.overwriteStyles(shadowRoot5.host.shadowRoot, this.svgIconsStyles);
                });
            });
        }
        overwriteStyles(element, styles) {
            let style = document.createElement('style');
            style.innerHTML = styles;
            element.appendChild(style);
        }
        constructor(container){
            this.container = container;
            this.shopPayWrapper = document.querySelector(selectors$C.shopPayWrapper);
            this.shopLoginButton = document.querySelector(selectors$C.shopLoginButton);
            this.init();
        }
    };
    const shopPayLink = {
        onLoad () {
            sections$9[this.id] = new ShopPayLink(this.container);
        }
    };

    register('footer', [
        accordion,
        newsletterCheckForResultSection,
        shopPayLink
    ]);
    if (!customElements.get('popout-select')) {
        customElements.define('popout-select', PopoutSelect);
    }

    const defaultOptions$1 = {
        cc_load_policy: 1,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        controls: 1,
        showinfo: 0,
        ecver: 2,
        fs: 1,
        rel: 0
    };
    const selectors$B = {
        player: 'iframe, [data-replace]',
        videoId: 'data-video-id'
    };
    function embedYoutube(uniqueKey, options) {
        const playerOptions = {
            ...defaultOptions$1,
            ...options
        };
        const playerWrapper = document.querySelector(`[data-player="${uniqueKey}"]`);
        const playerElement = playerWrapper.querySelector(selectors$B.player);
        const youtubeKey = playerWrapper.querySelector(`[${selectors$B.videoId}]`).getAttribute(selectors$B.videoId);
        loadScript({
            url: 'https://www.youtube.com/iframe_api'
        });
        const playerPromise = window.youtubeLoaderPromise.then(()=>{
            let player = new window.YT.Player(playerElement, {
                videoId: youtubeKey,
                playerVars: {
                    ...playerOptions
                },
                events: {
                    onStateChange: (event)=>{
                        // We need these play/pause events because the YouTube video does not emit the regular play/pause events on Mobile
                        if (event.data == 1) {
                            playerWrapper.dispatchEvent(new CustomEvent('play'));
                        } else if (event.data == 2) {
                            playerWrapper.dispatchEvent(new CustomEvent('pause'));
                        }
                    }
                }
            });
            playerWrapper.addEventListener('pause', ()=>{
                try {
                    player.pauseVideo();
                } catch (e) {
                    console.warn(e);
                }
            });
            playerWrapper.addEventListener('play', ()=>{
                try {
                    if (player.playVideo) {
                        player.playVideo();
                    } else {
                        player.addEventListener('onReady', ()=>{
                            player.playVideo();
                        });
                    }
                } catch (e) {
                    console.warn(e);
                }
            });
            playerWrapper.addEventListener('destroy', ()=>{
                try {
                    if (player.destroy) {
                        player.destroy();
                    }
                } catch (e) {
                    console.warn(e);
                }
            });
            return player;
        }).catch((err)=>{
            console.error(err);
        });
        return playerPromise;
    }window.youtubeLoaderPromise = new Promise((resolve)=>{
        window.onYouTubeIframeAPIReady = function() {
            resolve();
        };
    });

    const defaultOptions = {
        autoplay: true,
        loop: true,
        controls: true,
        muted: false,
        playsinline: true
    };
    const selectors$A = {
        player: 'iframe, [data-replace]',
        videoId: 'data-video-id'
    };
    function embedVimeo(uniqueKey, options) {
        const playerOptions = {
            ...defaultOptions,
            ...options
        };
        const playerWrapper = document.querySelector(`[data-player="${uniqueKey}"]`);
        const playerElement = playerWrapper.querySelector(selectors$A.player);
        const vimeoKey = playerWrapper.querySelector(`[${selectors$A.videoId}]`).getAttribute(selectors$A.videoId);
        const loadedPromise = loadScript({
            url: 'https://player.vimeo.com/api/player.js'
        });
        const vimeoSelector = `select-${uniqueKey}`;
        playerElement.setAttribute('id', vimeoSelector);
        const returnPlayer = loadedPromise.then(()=>{
            const player = new window.Vimeo.Player(vimeoSelector, {
                ...playerOptions,
                id: vimeoKey
            });
            // We need these play/pause events because the Vimeo video does not emit the regular play/pause events on Mobile
            player.on('play', ()=>{
                playerWrapper.dispatchEvent(new CustomEvent('play'));
            });
            player.on('pause', ()=>{
                playerWrapper.dispatchEvent(new CustomEvent('pause'));
            });
            playerWrapper.addEventListener('pause', ()=>{
                try {
                    if (player.pause) {
                        player.pause();
                    }
                } catch (e) {
                    console.warn(e);
                }
            });
            playerWrapper.addEventListener('play', ()=>{
                if (player.play) {
                    // Check if it is paused to avoid playing an already playing video which sometimes results in an error
                    player.getPaused().then((paused)=>{
                        if (paused) {
                            player.play();
                        }
                    });
                }
            });
            playerWrapper.addEventListener('destroy', ()=>{
                try {
                    if (player.destroy) {
                        player.destroy();
                    }
                } catch (e) {
                    console.log(e);
                }
            });
            return player;
        }).catch((err)=>{
            console.error(err);
        });
        return returnPlayer;
    }

    const selectors$z = {
        videoPopup: '[data-video-popup]',
        videoAutoplay: '[data-video-autoplay]',
        attrUnique: 'data-unique',
        attrVideoId: 'data-video-id',
        attrVideoType: 'data-video-type',
        attrPlayer: 'data-player'
    };
    let PopupVideo = class PopupVideo {
        init() {
            this.triggers.forEach((trigger)=>{
                const unique = trigger.getAttribute(selectors$z.attrUnique);
                const video = trigger.getAttribute(selectors$z.attrVideoId);
                const type = trigger.getAttribute(selectors$z.attrVideoType);
                // Find the modal body, which has been moved to the document root
                // and append a unique ID for youtube and vimeo to init players.
                const uniqueKey = `${video}-${unique}`;
                const player = document.querySelector(`[${selectors$z.attrPlayer}="${uniqueKey}"]`);
                // Modal Event Logic:
                // When a modal opens it creates and plays the video
                // When a modal opens it pauses background videos in this section
                // --
                // When a modal closes it destroys the player
                // When a modal closes it plays background videos anywhere on the page
                MicroModal.init({
                    onShow: ()=>{
                        if (this.backgroundVideo && typeof this.backgroundVideo.pause === 'function') {
                            this.backgroundVideo.pause();
                        }
                        let playerPromise = {};
                        if (type === 'youtube') {
                            playerPromise = embedYoutube(uniqueKey);
                        } else if (type === 'vimeo') {
                            playerPromise = embedVimeo(uniqueKey);
                        }
                        playerPromise.then(()=>{
                            player.dispatchEvent(new CustomEvent('play'));
                        });
                    },
                    onClose: (modal, el, event)=>{
                        event.preventDefault();
                        player.dispatchEvent(new CustomEvent('destroy'));
                        if (this.backgroundVideo && typeof this.backgroundVideo.play === 'function') {
                            this.backgroundVideo.play();
                        }
                    },
                    openTrigger: `data-trigger-${video}-${unique}`
                });
            });
        }
        constructor(section){
            this.container = section.container;
            this.triggers = this.container.querySelectorAll(selectors$z.videoPopup);
            this.backgroundVideo = this.container.querySelector(selectors$z.videoAutoplay);
            this.init();
        }
    };
    const popupVideoSection = {
        onLoad () {
            new PopupVideo(this);
        }
    };

    const selectors$y = {
        button: '[data-scroll-down]'
    };
    let ScrollButton = class ScrollButton {
        init() {
            const buttons = this.wrapper.querySelectorAll(selectors$y.button);
            if (buttons) {
                buttons.forEach((btn)=>{
                    btn.addEventListener('click', this.scroll.bind(this));
                });
            }
        }
        scroll() {
            const bottom = this.wrapper.offsetTop + this.wrapper.clientHeight;
            window.scroll({
                top: bottom,
                left: 0,
                behavior: 'smooth'
            });
        }
        constructor(el){
            this.wrapper = el;
            this.init();
        }
    };
    const scrollButton = {
        onLoad () {
            this.scrollButton = new ScrollButton(this.container);
        },
        onUnload: function() {
            delete this.scrollButton;
        }
    };

    register('video', [
        parallaxImage,
        scrollButton,
        popupVideoSection
    ]);

    register('page-faq', accordion);

    register('hero', [
        parallaxImage,
        scrollButton,
        customScrollbar
    ]);

    const selectors$x = {
        slider: '[data-slider]',
        photo: '[data-grid-slide]',
        wrapper: '[data-wrapper]',
        carouselCustomScrollbar: 'data-custom-scrollbar-items'
    };
    const attributes = {
        showDots: 'data-show-dots'
    };
    const classes$n = {
        wrapper: 'wrapper',
        wrapperModifier: 'wrapper--full',
        hide: 'hide'
    };
    const offsets = {
        scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
        additionalOffsetWrapper: 112
    };
    const sections$8 = {};
    let Slider = class Slider {
        init() {
            const instance = this;
            const sliderOptions = {
                initialIndex: 0,
                accessibility: true,
                autoPlay: false,
                contain: true,
                pageDots: this.pageDots,
                adaptiveHeight: false,
                wrapAround: false,
                groupCells: false,
                cellAlign: 'left',
                freeScroll: true,
                prevNextButtons: true,
                draggable: true,
                rightToLeft: window.isRTL,
                watchCSS: true,
                arrowShape: {
                    x0: 10,
                    x1: 60,
                    y1: 50,
                    x2: 67.5,
                    y2: 42.5,
                    x3: 25
                },
                on: {
                    ready: function() {
                        instance.removeIncorrectAria();
                    }
                }
            };
            this.flkty = new Flickity(this.slideshow, sliderOptions);
            this.container.addEventListener('theme:tab:change', ()=>{
                this.flkty.resize();
            });
            this.toggleWrapperModifier();
            document.addEventListener('theme:resize:width', this.toggleWrapperModifier.bind(this));
            if (this.slideshow.hasAttribute(selectors$x.carouselCustomScrollbar)) {
                new CustomScrollbar(this.container);
            }
            new Siblings(this.container);
        }
        toggleWrapperModifier() {
            if (!this.wrapper.classList.contains(classes$n.wrapper)) {
                return;
            }
            this.wrapper.classList.toggle(classes$n.wrapperModifier, this.wrapperWidthWithGutter >= window.innerWidth);
        }
        // Flickity VERY annoyingly adds aria-hidden="true" to all slides except the current one which causes lighthouse accessibility failure
        // see https://github.com/metafizzy/flickity/issues/1228
        removeIncorrectAria() {
            const slidesHidden = this.slideshow.querySelectorAll('[aria-hidden="true"]');
            slidesHidden.forEach((el)=>el.removeAttribute('aria-hidden')
            );
        }
        onUnload() {
            if (this.slideshow && this.flkty) {
                this.flkty.options.watchCSS = false;
                this.flkty.destroy();
            }
        }
        constructor(container, el){
            this.container = container;
            this.slideshow = el;
            this.wrapper = this.container.querySelector(selectors$x.wrapper);
            this.wrapperWidth = Number(getComputedStyle(document.documentElement).getPropertyValue('--LAYOUT-WIDTH').replace('px', ''));
            this.wrapperWidthWithGutter = this.wrapperWidth + offsets.additionalOffsetWrapper + offsets.scrollbarWidth;
            this.pageDots = this.slideshow.getAttribute(attributes.showDots) === 'true';
            this.firstPhoto = this.container.querySelector(selectors$x.photo);
            if (this.firstPhoto) {
                const buttonOffset = this.firstPhoto.offsetHeight / 2;
                this.slideshow.style.setProperty('--buttons-top', `${buttonOffset}px`);
            }
            if (!this.slideshow) return;
            this.flkty = null;
            this.init();
        }
    };
    const productSliderSection = {
        onLoad () {
            sections$8[this.id] = [];
            const els = this.container.querySelectorAll(selectors$x.slider);
            els.forEach((el)=>{
                sections$8[this.id].push(new Slider(this.container, el));
            });
        },
        onUnload (e) {
            sections$8[this.id].forEach((el)=>{
                if (typeof el.onUnload === 'function') {
                    el.onUnload(e);
                }
            });
        }
    };

    register('custom-content', [
        parallaxImage,
        popupVideoSection,
        swatchGridSection,
        productSliderSection
    ]);
    if (!customElements.get('radio-swatch')) {
        customElements.define('radio-swatch', RadioSwatch);
    }
    if (!customElements.get('product-grid-item')) {
        customElements.define('product-grid-item', ProductGridItem);
    }
    if (!customElements.get('product-grid-item-variant')) {
        customElements.define('product-grid-item-variant', ProductGridItemVariant);
    }
    if (!customElements.get('product-grid-item-image')) {
        customElements.define('product-grid-item-image', ProductGridItemImage);
    }

    const sections$7 = [];
    const selectors$w = {
        wrapper: '[data-slideshow-wrapper]',
        speed: 'data-slideshow-speed',
        autoplay: 'data-slideshow-autoplay',
        slideCount: 'data-slideshow-slides',
        prevButton: '[data-slide-custom-prev]',
        nextButton: '[data-slide-custom-next]',
        slideshoIndex: 'data-slideshow-index'
    };
    const classes$m = {
        isEnable: 'flickity-enabled'
    };
    let Slideshow = class Slideshow {
        init() {
            const settings = {
                autoPlay: this.autoplay && this.speed ? parseInt(this.speed) : false,
                contain: false,
                pageDots: true,
                adaptiveHeight: true,
                accessibility: true,
                wrapAround: this.slideCount !== 2,
                prevNextButtons: false,
                draggable: true,
                fade: true,
                rightToLeft: window.isRTL
            };
            this.flkty = new FlickityFade(this.wrapper, settings);
            if (this.prevButtons.length) {
                this.prevButtons.forEach((e)=>{
                    e.onclick = ()=>{
                        this.flkty.previous(true, false);
                    };
                });
            }
            if (this.nextButtons.length) {
                this.nextButtons.forEach((e)=>{
                    e.onclick = ()=>{
                        this.flkty.next(true, false);
                    };
                });
            }
            document.addEventListener('theme:scroll', this.scrollEvent);
        }
        scrollEvents() {
            if (this.flkty && this.autoplay && this.speed) {
                const slideshow = this.flkty.element;
                const slideshowBottomPosition = slideshow.getBoundingClientRect().top + window.scrollY + slideshow.offsetHeight;
                if (window.pageYOffset > slideshowBottomPosition) {
                    if (this.flkty.player.state === 'playing') {
                        this.flkty.pausePlayer();
                    }
                } else if (this.flkty.player.state === 'paused') {
                    this.flkty.playPlayer();
                }
            }
        }
        unload() {
            document.removeEventListener('theme:scroll', this.scrollEvent);
            if (this.flkty && this.wrapper && this.wrapper.classList.contains(classes$m.isEnable)) {
                this.flkty.destroy();
            }
        }
        onBlockSelect(evt) {
            const indexEl = evt.target.closest(`[${selectors$w.slideshoIndex}]`);
            const slideIndex = indexEl.getAttribute(selectors$w.slideshoIndex);
            const select = parseInt(slideIndex);
            this.flkty.selectCell(select);
            this.flkty.stopPlayer();
        }
        onBlockDeselect() {
            if (this.autoplay) {
                this.flkty.playPlayer();
            }
        }
        constructor(section){
            this.container = section.container;
            this.wrapper = section.container.querySelector(selectors$w.wrapper);
            this.speed = this.wrapper.getAttribute(selectors$w.speed);
            this.autoplay = this.wrapper.getAttribute(selectors$w.autoplay) === 'true';
            this.slideCount = parseInt(this.wrapper.getAttribute(selectors$w.slideCount), 10);
            this.prevButtons = this.wrapper.querySelectorAll(selectors$w.prevButton);
            this.nextButtons = this.wrapper.querySelectorAll(selectors$w.nextButton);
            this.flkty = null;
            this.scrollEvent = ()=>this.scrollEvents()
            ;
            this.init();
        }
    };
    const slideshowSection = {
        onLoad () {
            sections$7[this.id] = new Slideshow(this);
        },
        onUnload () {
            if (typeof sections$7[this.id].unload === 'function') {
                sections$7[this.id].unload();
            }
        },
        onBlockSelect (evt) {
            if (typeof sections$7[this.id].onBlockSelect === 'function') {
                sections$7[this.id].onBlockSelect(evt);
            }
        },
        onBlockDeselect (evt) {
            if (typeof sections$7[this.id].onBlockSelect === 'function') {
                sections$7[this.id].onBlockDeselect(evt);
            }
        }
    };
    register('slideshow', [
        slideshowSection,
        parallaxImage,
        scrollButton
    ]);

    const selectors$v = {
        rangeSlider: '[data-range-slider]',
        rangeDotLeft: '[data-range-left]',
        rangeDotRight: '[data-range-right]',
        rangeLine: '[data-range-line]',
        rangeHolder: '[data-range-holder]',
        dataMin: 'data-se-min',
        dataMax: 'data-se-max',
        dataMinValue: 'data-se-min-value',
        dataMaxValue: 'data-se-max-value',
        dataStep: 'data-se-step',
        dataFilterUpdate: 'data-range-filter-update',
        priceMin: '[data-field-price-min]',
        priceMax: '[data-field-price-max]'
    };
    const classes$l = {
        isInitialized: 'is-initialized'
    };
    let RangeSlider = class RangeSlider {
        init() {
            this.setDefaultValues();
            // link events
            this.touchLeft.addEventListener('mousedown', this.onStartEvent);
            this.touchRight.addEventListener('mousedown', this.onStartEvent);
            this.touchLeft.addEventListener('touchstart', this.onStartEvent);
            this.touchRight.addEventListener('touchstart', this.onStartEvent);
            // initialize
            this.slider.classList.add(classes$l.isInitialized);
        }
        setDefaultValues() {
            // retrieve default values
            let defaultMinValue = this.min;
            if (this.slider.hasAttribute(selectors$v.dataMinValue)) {
                defaultMinValue = parseFloat(this.slider.getAttribute(selectors$v.dataMinValue));
            }
            let defaultMaxValue = this.max;
            if (this.slider.hasAttribute(selectors$v.dataMaxValue)) {
                defaultMaxValue = parseFloat(this.slider.getAttribute(selectors$v.dataMaxValue));
            }
            // check values are correct
            if (defaultMinValue < this.min) {
                defaultMinValue = this.min;
            }
            if (defaultMaxValue > this.max) {
                defaultMaxValue = this.max;
            }
            if (defaultMinValue > defaultMaxValue) {
                defaultMinValue = defaultMaxValue;
            }
            if (this.slider.getAttribute(selectors$v.dataStep)) {
                this.step = Math.abs(parseFloat(this.slider.getAttribute(selectors$v.dataStep)));
            }
            // initial reset
            this.reset();
            // usefull values, min, max, normalize fact is the width of both touch buttons
            this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
            this.selectedTouch = null;
            this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;
            // set defualt values
            this.setMinValue(defaultMinValue);
            this.setMaxValue(defaultMaxValue);
        }
        reset() {
            this.touchLeft.style.left = '0px';
            this.touchRight.style.left = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
            this.lineSpan.style.marginLeft = '0px';
            this.lineSpan.style.width = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
            this.startX = 0;
            this.x = 0;
        }
        setMinValue(minValue) {
            const ratio = (minValue - this.min) / (this.max - this.min);
            this.touchLeft.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact))) + 'px';
            this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
            this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
            this.slider.setAttribute(selectors$v.dataMinValue, minValue);
        }
        setMaxValue(maxValue) {
            const ratio = (maxValue - this.min) / (this.max - this.min);
            this.touchRight.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact)) + this.normalizeFact) + 'px';
            this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
            this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
            this.slider.setAttribute(selectors$v.dataMaxValue, maxValue);
        }
        onStart(event) {
            // Prevent default dragging of selected content
            event.preventDefault();
            let eventTouch = event;
            if (event.touches) {
                eventTouch = event.touches[0];
            }
            if (event.currentTarget === this.touchLeft) {
                this.x = this.touchLeft.offsetLeft;
            } else if (event.currentTarget === this.touchRight) {
                this.x = this.touchRight.offsetLeft;
            }
            this.startX = eventTouch.pageX - this.x;
            this.selectedTouch = event.currentTarget;
            document.addEventListener('mousemove', this.onMoveEvent);
            document.addEventListener('mouseup', this.onStopEvent);
            document.addEventListener('touchmove', this.onMoveEvent);
            document.addEventListener('touchend', this.onStopEvent);
        }
        onMove(event) {
            let eventTouch = event;
            if (event.touches) {
                eventTouch = event.touches[0];
            }
            this.x = eventTouch.pageX - this.startX;
            if (this.selectedTouch === this.touchLeft) {
                if (this.x > this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10) {
                    this.x = this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10;
                } else if (this.x < 0) {
                    this.x = 0;
                }
                this.selectedTouch.style.left = this.x + 'px';
            } else if (this.selectedTouch === this.touchRight) {
                if (this.x < this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10) {
                    this.x = this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10;
                } else if (this.x > this.maxX) {
                    this.x = this.maxX;
                }
                this.selectedTouch.style.left = this.x + 'px';
            }
            // update line span
            this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
            this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
            // write new value
            this.calculateValue();
            // call on change
            if (this.slider.getAttribute('on-change')) {
                const fn = new Function('min, max', this.slider.getAttribute('on-change'));
                fn(this.slider.getAttribute(selectors$v.dataMinValue), this.slider.getAttribute(selectors$v.dataMaxValue));
            }
            this.onChange(this.slider.getAttribute(selectors$v.dataMinValue), this.slider.getAttribute(selectors$v.dataMaxValue));
        }
        onStop(event) {
            document.removeEventListener('mousemove', this.onMoveEvent);
            document.removeEventListener('mouseup', this.onStopEvent);
            document.removeEventListener('touchmove', this.onMoveEvent);
            document.removeEventListener('touchend', this.onStopEvent);
            this.selectedTouch = null;
            // write new value
            this.calculateValue();
            // call did changed
            this.onChanged(this.slider.getAttribute(selectors$v.dataMinValue), this.slider.getAttribute(selectors$v.dataMaxValue));
        }
        onChange(min, max) {
            const rangeHolder = this.slider.closest(selectors$v.rangeHolder);
            if (rangeHolder) {
                const priceMin = rangeHolder.querySelector(selectors$v.priceMin);
                const priceMax = rangeHolder.querySelector(selectors$v.priceMax);
                if (priceMin && priceMax) {
                    priceMin.value = min;
                    priceMax.value = max;
                }
            }
        }
        onChanged(min, max) {
            if (this.slider.hasAttribute(selectors$v.dataFilterUpdate)) {
                this.slider.dispatchEvent(new CustomEvent('theme:range:update', {
                    bubbles: true
                }));
            }
        }
        calculateValue() {
            const newValue = (this.lineSpan.offsetWidth - this.normalizeFact) / this.initialValue;
            let minValue = this.lineSpan.offsetLeft / this.initialValue;
            let maxValue = minValue + newValue;
            minValue = minValue * (this.max - this.min) + this.min;
            maxValue = maxValue * (this.max - this.min) + this.min;
            if (this.step !== 0.0) {
                let multi = Math.floor(minValue / this.step);
                minValue = this.step * multi;
                multi = Math.floor(maxValue / this.step);
                maxValue = this.step * multi;
            }
            if (this.selectedTouch === this.touchLeft) {
                this.slider.setAttribute(selectors$v.dataMinValue, minValue);
            }
            if (this.selectedTouch === this.touchRight) {
                this.slider.setAttribute(selectors$v.dataMaxValue, maxValue);
            }
        }
        constructor(section){
            this.container = section.container;
            this.slider = section.querySelector(selectors$v.rangeSlider);
            if (this.slider) {
                this.onMoveEvent = (event)=>this.onMove(event)
                ;
                this.onStopEvent = (event)=>this.onStop(event)
                ;
                this.onStartEvent = (event)=>this.onStart(event)
                ;
                this.startX = 0;
                this.x = 0;
                // retrieve touch button
                this.touchLeft = this.slider.querySelector(selectors$v.rangeDotLeft);
                this.touchRight = this.slider.querySelector(selectors$v.rangeDotRight);
                this.lineSpan = this.slider.querySelector(selectors$v.rangeLine);
                // get some properties
                this.min = parseFloat(this.slider.getAttribute(selectors$v.dataMin));
                this.max = parseFloat(this.slider.getAttribute(selectors$v.dataMax));
                this.step = 0.0;
                // normalize flag
                this.normalizeFact = 26;
                this.init();
                document.addEventListener('theme:price-range:reset', ()=>{
                    this.setDefaultValues();
                });
            }
        }
    };

    const throttle$1 = (fn, wait)=>{
        let prev, next;
        return function invokeFn(...args) {
            const now = Date.now();
            next = clearTimeout(next);
            if (!prev || now - prev >= wait) {
                // eslint-disable-next-line prefer-spread
                fn.apply(null, args);
                prev = now;
            } else {
                next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
            }
        };
    };

    const selectors$u = {
        filtersWrappper: 'data-filters',
        underlay: '[data-filters-underlay]',
        filtersHideDesktop: 'data-default-hide',
        filtersToggle: 'data-filters-toggle',
        focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        groupHeading: 'data-group-heading',
        showMore: 'data-show-more'
    };
    const classes$k = {
        show: 'drawer--visible',
        defaultVisible: 'filters--default-visible',
        hide: 'hidden',
        expand: 'is-expanded',
        hidden: 'is-hidden',
        focusEnable: 'focus-enabled'
    };
    const sections$6 = {};
    let Filters = class Filters {
        unload() {
            if (this.filtersToggleButtons.length) {
                this.filtersToggleButtons.forEach((element)=>{
                    element.removeEventListener('click', this.connectToggleMemory);
                });
            }
            if (this.showMoreButtons.length) {
                this.showMoreButtons.forEach((button)=>{
                    button.removeEventListener('click', this.connectShowHiddenOptions);
                });
            }
        }
        expandingEvents() {
            if (this.showMoreButtons.length) {
                this.showMoreButtons.forEach((button)=>{
                    button.addEventListener('click', throttle$1(this.connectShowHiddenOptions, 500));
                });
            }
        }
        showHiddenOptions(evt) {
            const element = evt.target.hasAttribute(selectors$u.showMore) ? evt.target : evt.target.closest(`[${selectors$u.showMore}]`);
            element.classList.add(classes$k.hidden);
            element.previousElementSibling.querySelectorAll(`.${classes$k.hidden}`).forEach((option)=>{
                option.classList.remove(classes$k.hidden);
            });
        }
        connectToggle(refresh = false) {
            this.filtersToggleButtons.forEach((button)=>{
                const isDynamic = button.closest(`[${selectors$u.filtersWrappper}]`) !== null;
                if (isDynamic && refresh || isDynamic && !refresh || !isDynamic && !refresh) {
                    button.addEventListener('click', this.connectToggleMemory.bind(this));
                }
            });
        }
        connectToggleFunction(evt) {
            const ariaExpanded = evt.currentTarget.getAttribute('aria-expanded') === 'true';
            if (ariaExpanded) {
                this.hideFilters();
            } else {
                this.showFilters();
            }
        }
        onFocusOut() {
            this.container.addEventListener('focusout', (function(evt) {
                if (window.innerWidth >= window.theme.sizes.medium) {
                    return;
                }
                const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
                const isVisible = this.container.classList.contains(classes$k.show);
                const isFocusEnabled = document.body.classList.contains(classes$k.focusEnable);
                if (isFocusEnabled && isVisible && !childInFocus) {
                    this.hideFilters();
                }
            }).bind(this));
            this.container.addEventListener('keyup', (function(evt) {
                if (evt.code !== 'Escape') {
                    return;
                }
                this.hideFilters();
                this.filtersToggleButtons[0].focus();
            }).bind(this));
            this.underlay.addEventListener('click', (function() {
                this.hideFilters();
            }).bind(this));
        }
        getShowOnLoad() {
            const selector = `[${selectors$u.filtersHideDesktop}='false']`;
            const showOnDesktop = document.querySelector(selector);
            const isDesktop = window.innerWidth >= window.theme.sizes.medium;
            if (showOnDesktop && isDesktop) {
                return true;
            } else {
                return false;
            }
        }
        showFilters() {
            this.filtersToggleButtons = document.querySelectorAll(this.selector);
            this.container.classList.remove(classes$k.hide);
            // animates after display none is removed
            setTimeout(()=>{
                this.filtersToggleButtons.forEach((btn)=>btn.setAttribute('aria-expanded', true)
                );
                this.filtersToggleButtons.forEach((btn)=>btn.classList.add(classes$k.show)
                );
                this.container.classList.add(classes$k.show);
                this.container.querySelector(selectors$u.focusable).focus();
            }, 1);
        }
        hideFilters() {
            this.filtersToggleButtons = document.querySelectorAll(this.selector);
            this.filtersToggleButtons.forEach((btn)=>btn.setAttribute('aria-expanded', false)
            );
            this.container.classList.remove(classes$k.show);
            this.container.classList.remove(classes$k.defaultVisible);
            this.filtersToggleButtons.forEach((btn)=>btn.classList.remove(classes$k.show)
            );
            this.filtersToggleButtons.forEach((btn)=>btn.classList.remove(classes$k.defaultVisible)
            );
            // adds display none after animations
            setTimeout(()=>{
                if (!this.container.classList.contains(classes$k.show)) {
                    this.container.classList.add(classes$k.hide);
                }
            }, 800);
        }
        constructor(filters, refresh = false){
            this.container = filters;
            this.underlay = this.container.querySelector(selectors$u.underlay);
            this.groupHeadings = this.container.querySelectorAll(`[${selectors$u.groupHeading}]`);
            this.showMoreButtons = this.container.querySelectorAll(`[${selectors$u.showMore}]`);
            this.triggerKey = this.container.getAttribute(selectors$u.filtersWrappper);
            this.selector = `[${selectors$u.filtersToggle}='${this.triggerKey}']`;
            this.filtersToggleButtons = document.querySelectorAll(this.selector);
            this.connectToggleMemory = (evt)=>this.connectToggleFunction(evt)
            ;
            this.connectShowHiddenOptions = (evt)=>this.showHiddenOptions(evt)
            ;
            this.connectToggle(refresh);
            this.onFocusOut();
            this.expandingEvents();
            if (this.getShowOnLoad()) {
                this.showFilters();
            } else {
                this.hideFilters();
            }
        }
    };
    const collectionFiltersSidebar = {
        onLoad () {
            sections$6[this.id] = [];
            const wrappers = this.container.querySelectorAll(`[${selectors$u.filtersWrappper}]`);
            wrappers.forEach((wrapper)=>{
                sections$6[this.id].push(new Filters(wrapper));
            });
        },
        onUnload: function() {
            sections$6[this.id].forEach((filters)=>{
                if (typeof filters.unload === 'function') {
                    filters.unload();
                }
            });
        }
    };

    const selectors$t = {
        collectionSidebar: '[data-collection-sidebar]',
        form: '[data-sidebar-filter-form]',
        inputs: 'input, select, label, textarea',
        priceMin: 'data-field-price-min',
        priceMax: 'data-field-price-max',
        rangeMin: 'data-se-min-value',
        rangeMax: 'data-se-max-value',
        rangeMinDefault: 'data-se-min',
        rangeMaxDefault: 'data-se-max',
        productsContainer: '[data-products-grid]',
        filterUpdateUrlButton: '[data-filter-update-url]',
        activeFiltersHolder: '[data-active-filters]',
        activeFiltersCount: '[data-active-filters-count]',
        productsCount: '[data-products-count]',
        dataSort: 'data-sort-enabled',
        collectionTools: '[data-collection-tools]',
        filtersWrappper: '[data-filters]',
        headerSticky: '[data-header-sticky="sticky"]',
        headerHeight: '[data-header-height]',
        gridLarge: 'data-grid-large',
        gridSmall: 'data-grid-small',
        accordionBody: '[data-accordion-body]',
        checkedOption: 'input:checked',
        optionHolder: '[data-option-holder]'
    };
    const classes$j = {
        classHidden: 'is-hidden',
        classLoading: 'is-loading'
    };
    const times = {
        loadingDelay: 1000,
        scrollTime: 1000
    };
    let FiltersForm = class FiltersForm {
        init() {
            this.showAllOptions();
            if (this.form) {
                new RangeSlider(this.form);
                this.sidebar.addEventListener('input', debounce$1((e)=>{
                    const type = e.type;
                    const target = e.target;
                    if (!selectors$t.inputs.includes(type) || !this.form || typeof this.form.submit !== 'function') {
                        return;
                    }
                    const priceMin = this.form.querySelector(`[${selectors$t.priceMin}]`);
                    const priceMax = this.form.querySelector(`[${selectors$t.priceMax}]`);
                    if (target.hasAttribute(selectors$t.priceMin) || target.hasAttribute(selectors$t.priceMax)) {
                        const rangeMin = this.form.querySelector(`[${selectors$t.rangeMin}]`);
                        const rangeMax = this.form.querySelector(`[${selectors$t.rangeMax}]`);
                        const rangeMinDefault = parseInt(rangeMin.getAttribute(selectors$t.rangeMinDefault));
                        const rangeMaxDefault = parseInt(rangeMax.getAttribute(selectors$t.rangeMaxDefault));
                        if (priceMin.value && !priceMax.value) {
                            priceMax.value = rangeMaxDefault;
                        }
                        if (priceMax.value && !priceMin.value) {
                            priceMin.value = rangeMinDefault;
                        }
                        if (priceMin.value <= rangeMinDefault && priceMax.value >= rangeMaxDefault) {
                            priceMin.placeholder = rangeMinDefault;
                            priceMax.placeholder = rangeMaxDefault;
                            priceMin.value = '';
                            priceMax.value = '';
                        }
                    }
                    this.filtering(e);
                }, 1500));
                this.form.addEventListener('theme:range:update', (e)=>this.updateRange(e)
                );
            }
            if (this.sidebar) {
                this.sidebar.addEventListener('click', (e)=>this.updateFilterFromUrl(e)
                );
            }
            if (this.activeFiltersHolder) {
                this.activeFiltersHolder.addEventListener('click', (e)=>this.updateFilterFromUrl(e)
                );
            }
            if (this.productsContainer) {
                this.productsContainer.addEventListener('click', (e)=>this.updateFilterFromUrl(e)
                );
            }
            // Color swatches tooltips
            makeSwappers(this.sidebar);
        }
        /**
       * Update range slider (price money)
       * @param {Object} e
       */ updateRange(e) {
            if (this.form && typeof this.form.submit === 'function') {
                const rangeMin = this.form.querySelector(`[${selectors$t.rangeMin}]`);
                const rangeMax = this.form.querySelector(`[${selectors$t.rangeMax}]`);
                const priceMin = this.form.querySelector(`[${selectors$t.priceMin}]`);
                const priceMax = this.form.querySelector(`[${selectors$t.priceMax}]`);
                const checkElements = rangeMin && rangeMax && priceMin && priceMax;
                if (checkElements && rangeMin.hasAttribute(selectors$t.rangeMin) && rangeMax.hasAttribute(selectors$t.rangeMax)) {
                    const priceMinValue = parseInt(priceMin.placeholder);
                    const priceMaxValue = parseInt(priceMax.placeholder);
                    const rangeMinValue = parseInt(rangeMin.getAttribute(selectors$t.rangeMin));
                    const rangeMaxValue = parseInt(rangeMax.getAttribute(selectors$t.rangeMax));
                    if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
                        priceMin.value = rangeMinValue;
                        priceMax.value = rangeMaxValue;
                        this.filtering(e);
                    }
                }
            }
        }
        /**
       * Update filter on last clicked element
       * @param {Object} e
       */ updateFilterFromUrl(e) {
            const target = e.target;
            if (target.matches(selectors$t.filterUpdateUrlButton) || target.closest(selectors$t.filterUpdateUrlButton) && target) {
                e.preventDefault();
                const button = target.matches(selectors$t.filterUpdateUrlButton) ? target : target.closest(selectors$t.filterUpdateUrlButton);
                this.filtering(e, button.getAttribute('href'));
            }
        }
        /**
       * Add filters to history api
       *
       * @param {Object} e
       * @param {String} replaceHref
       */ addToHistory(e, replaceHref = '') {
            const sortValue = this.sort ? this.sort.getAttribute(selectors$t.dataSort) : '';
            if (!e || e && e.type !== 'popstate') {
                if (replaceHref === '') {
                    const searchParams = new window.URL(window.location.href).searchParams;
                    const filterUrlParams = Object.fromEntries(searchParams);
                    const filterUrlRemoveString = searchParams.toString();
                    if (filterUrlRemoveString.includes('filter.') || filterUrlRemoveString.includes('sort_by') || filterUrlRemoveString.includes('page')) {
                        for(const key in filterUrlParams){
                            if (key.includes('filter.') || key.includes('sort_by') || key.includes('page')) {
                                searchParams.delete(key);
                            }
                        }
                    }
                    if (this.form) {
                        const formParams = new URLSearchParams(new FormData(this.form));
                        for (let [key, val] of formParams.entries()){
                            if (key.includes('filter.') && val) {
                                searchParams.append(key, val);
                            }
                        }
                        // if submitted price equal to price range min and max remove price parameters
                        const rangeMin = this.form.querySelector(`[${selectors$t.rangeMin}]`);
                        const rangeMax = this.form.querySelector(`[${selectors$t.rangeMax}]`);
                        const priceMin = this.form.querySelector(`[${selectors$t.priceMin}]`);
                        const priceMax = this.form.querySelector(`[${selectors$t.priceMax}]`);
                        const checkElements = rangeMin && rangeMax && priceMin && priceMax;
                        if (checkElements && rangeMin.hasAttribute(selectors$t.rangeMinDefault) && rangeMax.hasAttribute(selectors$t.rangeMaxDefault)) {
                            const rangeMinDefault = parseFloat(rangeMin.getAttribute(selectors$t.rangeMinDefault), 10);
                            const rangeMaxDefault = parseFloat(rangeMax.getAttribute(selectors$t.rangeMaxDefault), 10);
                            const priceMinValue = priceMin.value === '' ? parseFloat(priceMin.placeholder, 10) : parseFloat(priceMin.value, 10);
                            const priceMaxValue = priceMax.value === '' ? parseFloat(priceMax.placeholder, 10) : parseFloat(priceMax.value, 10);
                            if (priceMinValue <= rangeMinDefault && priceMaxValue >= rangeMaxDefault) {
                                searchParams.delete('filter.v.price.gte');
                                searchParams.delete('filter.v.price.lte');
                            }
                        }
                    }
                    if (sortValue || e && e.detail && e.detail.href) {
                        const sortString = sortValue ? sortValue : e.detail.params;
                        searchParams.set('sort_by', sortString);
                    }
                    const filterUrlString = searchParams.toString();
                    const filterNewParams = filterUrlString ? `?${filterUrlString}` : location.pathname;
                    window.history.pushState(null, '', filterNewParams);
                    return;
                }
                window.history.pushState(null, '', replaceHref);
            }
        }
        /**
       * Get filter result and append them to their holders
       */ getFilterResult() {
            this.productsContainer.classList.add(classes$j.classLoading);
            this.getGridValues();
            // use the section_id to target the collection section and exclude other sections on the page
            const url = new window.URL(window.location.href);
            const params = url.searchParams;
            params.set('section_id', this.section.id);
            fetch(`${window.location.pathname}${url.search}`).then((response)=>response.text()
            ).then((response)=>{
                const responseHolder = document.createElement('div');
                responseHolder.innerHTML = response;
                if (this.sidebar) {
                    this.sidebar.innerHTML = responseHolder.querySelector(selectors$t.collectionSidebar).innerHTML;
                }
                if (this.activeFiltersCount) {
                    this.activeFiltersCount.innerHTML = responseHolder.querySelector(selectors$t.activeFiltersCount).innerHTML;
                }
                this.productsContainer.innerHTML = responseHolder.querySelector(selectors$t.productsContainer).innerHTML;
                // Show active filters holder
                this.activeFiltersHolder.innerHTML = responseHolder.querySelector(selectors$t.activeFiltersHolder).innerHTML;
                this.activeFiltersHolder.parentNode.classList.toggle(classes$j.classHidden, this.activeFiltersHolder.innerHTML === '');
                if (this.productsCount) {
                    this.productsCount.innerHTML = responseHolder.querySelector(selectors$t.productsCount).innerHTML;
                }
                this.setGridValues();
                this.refreshFunctionalities();
                setTimeout(()=>{
                    this.productsContainer.classList.remove(classes$j.classLoading);
                }, times.loadingDelay);
            });
        }
        /**
       * Refresh functionalities
       */ refreshFunctionalities() {
            // Init range slider
            this.form = this.container.querySelector(selectors$t.form);
            if (this.form) {
                new RangeSlider(this.form);
                this.form.addEventListener('theme:range:update', (e)=>this.updateRange(e)
                );
            }
            // Init filters
            const filters = this.container.querySelectorAll(selectors$t.filtersWrappper);
            filters.forEach((filter)=>{
                new Filters(filter, true);
            });
            // Init accordions
            const accordions = this.container.querySelectorAll(selectors$t.accordionBody);
            accordions.forEach((accordion)=>{
                new Accordion(accordion);
            });
            // Init siblings
            new Siblings(this.container);
            // Color swatches tooltips
            if (this.sidebar) {
                makeSwappers(this.sidebar);
            }
            // Init product swatches
            makeGridSwatches(this.container);
            this.showAllOptions();
        }
        // Get grid values
        getGridValues() {
            if (this.layoutLarge) {
                this.layoutLargeValue = this.layoutLarge.getAttribute(selectors$t.gridLarge);
            }
            if (this.layoutSmall) {
                this.layoutSmallValue = this.layoutSmall.getAttribute(selectors$t.gridSmall);
            }
        }
        // Set grid values on AJAX
        setGridValues() {
            if (this.layoutLarge) {
                this.layoutLarge = this.container.querySelector(`[${selectors$t.gridLarge}]`);
                this.layoutLarge.setAttribute(selectors$t.gridLarge, this.layoutLargeValue);
            }
            if (this.layoutSmall) {
                this.layoutSmall = this.container.querySelector(`[${selectors$t.gridSmall}]`);
                this.layoutSmall.setAttribute(selectors$t.gridSmall, this.layoutSmallValue);
            }
        }
        // Show all options if in the filter have selected option but it is hidden
        showAllOptions() {
            const checkedOptions = this.container.querySelectorAll(selectors$t.checkedOption);
            checkedOptions.forEach((option)=>{
                if (option.closest(selectors$t.optionHolder) && option.closest(selectors$t.optionHolder).classList.contains(classes$j.classHidden)) {
                    const button = option.closest(selectors$t.accordionBody).nextElementSibling;
                    if (!button.classList.contains(selectors$t.classHidden)) {
                        button.dispatchEvent(new Event('click'));
                    }
                }
            });
        }
        /**
       * Filtering method and scroll at the top on the section
       * @param {Object} e
       * @param {String} replaceHref
       */ filtering(e, replaceHref = '') {
            if (e.state === null) return; // skip when we update the url with a button with href="#id" used for link
            // Scroll to filter tools
            const headerH = this.headerIsSticky ? document.querySelector(selectors$t.headerHeight).getBoundingClientRect().height : 0;
            const scrollToElement = this.container.offsetTop - headerH;
            let options = {
                root: null,
                rootMargin: `${headerH}px`,
                threshold: 1.0
            };
            const handleFilterAndScroll = (entries)=>{
                const [entry] = entries;
                setTimeout(()=>{
                    this.addToHistory(e, replaceHref);
                    this.getFilterResult();
                }, entry.isIntersecting ? 10 : times.scrollTime);
                observer.unobserve(this.productsContainer);
                if (entry.isIntersecting) return;
                window.scrollTo({
                    top: scrollToElement,
                    left: 0,
                    behavior: 'smooth'
                });
            };
            const observer = new IntersectionObserver(handleFilterAndScroll, options);
            observer.observe(this.productsContainer);
        }
        constructor(section){
            this.section = section;
            this.container = this.section.container;
            this.sidebar = this.container.querySelector(selectors$t.collectionSidebar);
            this.form = section.container.querySelector(selectors$t.form);
            this.sort = this.container.querySelector(`[${selectors$t.dataSort}]`);
            this.productsContainer = this.container.querySelector(selectors$t.productsContainer);
            this.activeFiltersHolder = this.container.querySelector(selectors$t.activeFiltersHolder);
            this.activeFiltersCount = this.container.querySelector(selectors$t.activeFiltersCount);
            this.productsCount = this.container.querySelector(selectors$t.productsCount);
            this.headerIsSticky = document.querySelector(selectors$t.headerSticky) !== null;
            this.layoutLarge = this.container.querySelector(`[${selectors$t.gridLarge}]`);
            this.layoutSmall = this.container.querySelector(`[${selectors$t.gridSmall}]`);
            if (this.productsContainer && this.sidebar) {
                this.init();
            }
            if (this.sort) {
                this.container.addEventListener('theme:form:filter', (e)=>this.filtering(e)
                );
            }
            if (this.sidebar || this.sort) {
                window.addEventListener('popstate', (e)=>this.filtering(e)
                );
            }
        }
    };
    const collectionFiltersForm = {
        onLoad () {
            this.filterForm = new FiltersForm(this);
        },
        onUnload () {
            if (this.filterForm && typeof this.filterForm.unload === 'function') {
                this.filterForm.unload();
            }
        }
    };

    register('search-page', [
        collectionFiltersSidebar,
        collectionFiltersForm,
        swatchGridSection,
        accordion
    ]);
    if (!customElements.get('popout-select')) {
        customElements.define('popout-select', PopoutSelect);
    }
    if (!customElements.get('radio-swatch')) {
        customElements.define('radio-swatch', RadioSwatch);
    }
    if (!customElements.get('product-grid-item')) {
        customElements.define('product-grid-item', ProductGridItem);
    }
    if (!customElements.get('product-grid-item-variant')) {
        customElements.define('product-grid-item-variant', ProductGridItemVariant);
    }
    if (!customElements.get('product-grid-item-image')) {
        customElements.define('product-grid-item-image', ProductGridItemImage);
    }

    const selectors$s = {
        zoomImage: '[data-image-zoom]',
        modalContainer: '[data-modal-container]',
        attrUnique: 'data-unique',
        image: 'data-src'
    };
    let GalleryZoom = class GalleryZoom {
        init() {
            this.triggers.forEach((trigger)=>{
                const unique = trigger.getAttribute(selectors$s.attrUnique);
                const modalIsAdded = this.modalContainer.querySelector(`#zoom-${unique}`);
                if (modalIsAdded) {
                    const newModal = this.container.querySelector(`#zoom-${unique}`);
                    if (newModal) {
                        modalIsAdded.parentNode.removeChild(modalIsAdded);
                        this.modalContainer.appendChild(newModal);
                    }
                }
                MicroModal.init({
                    disableScroll: true,
                    openTrigger: `data-popup-${unique}`,
                    onShow: (modal)=>{
                        var images = modal.querySelectorAll(`[${selectors$s.image}]`, modal);
                        images.forEach((image)=>{
                            if (image.getAttribute('src') === null) {
                                const bigImage = image.getAttribute(selectors$s.image);
                                image.setAttribute('src', bigImage);
                            }
                        });
                    },
                    onClose: (modal, el, event)=>{
                        event.preventDefault();
                    }
                });
            });
        }
        constructor(container){
            this.container = container;
            this.triggers = this.container.querySelectorAll(selectors$s.zoomImage);
            this.modalContainer = document.querySelector(selectors$s.modalContainer);
            this.init();
        }
    };
    const galleryZoomSection = {
        onLoad () {
            new GalleryZoom(this.container);
        }
    };

    register('gallery', [
        galleryZoomSection,
        popupVideoSection,
        customScrollbar
    ]);

    const tokensReducer = (acc, token)=>{
        const { el , elStyle , elHeight , rowsLimit , rowsWrapped , options  } = acc;
        let oldBuffer = acc.buffer;
        let newBuffer = oldBuffer;
        if (rowsWrapped === rowsLimit + 1) {
            return {
                ...acc
            };
        }
        const textBeforeWrap = oldBuffer;
        let newRowsWrapped = rowsWrapped;
        let newHeight = elHeight;
        el.innerHTML = newBuffer = oldBuffer.length ? `${oldBuffer}${options.delimiter}${token}${options.replaceStr}` : `${token}${options.replaceStr}`;
        if (parseFloat(elStyle.height) > parseFloat(elHeight)) {
            newRowsWrapped++;
            newHeight = elStyle.height;
            if (newRowsWrapped === rowsLimit + 1) {
                el.innerHTML = newBuffer = textBeforeWrap[textBeforeWrap.length - 1] === '.' && options.replaceStr === '...' ? `${textBeforeWrap}..` : `${textBeforeWrap}${options.replaceStr}`;
                return {
                    ...acc,
                    elHeight: newHeight,
                    rowsWrapped: newRowsWrapped
                };
            }
        }
        el.innerHTML = newBuffer = textBeforeWrap.length ? `${textBeforeWrap}${options.delimiter}${token}` : `${token}`;
        return {
            ...acc,
            buffer: newBuffer,
            elHeight: newHeight,
            rowsWrapped: newRowsWrapped
        };
    };
    const ellipsis = (selector = '', rows = 1, options = {})=>{
        const defaultOptions = {
            replaceStr: '...',
            debounceDelay: 250,
            delimiter: ' '
        };
        const opts = {
            ...defaultOptions,
            ...options
        };
        const elements = selector && (selector instanceof NodeList ? selector : selector.nodeType === 1 // if node type is Node.ELEMENT_NODE
         ? [
            selector
        ] // wrap it in (NodeList) if it is a single node
         : document.querySelectorAll(selector));
        for(let i = 0; i < elements.length; i++){
            const el = elements[i];
            const elementHtml = el.innerHTML;
            const commentRegex = /<!--[\s\S]*?-->/g;
            const htmlWithoutComments = elementHtml.replace(commentRegex, '');
            const splittedText = htmlWithoutComments.split(opts.delimiter);
            el.innerHTML = '';
            const elStyle = window.getComputedStyle(el);
            splittedText.reduce(tokensReducer, {
                el,
                buffer: el.innerHTML,
                elStyle,
                elHeight: 0,
                rowsLimit: rows,
                rowsWrapped: 0,
                options: opts
            });
        }
    };

    function isTouch() {
        const isTouch1 = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        document.documentElement.classList.toggle('supports-touch', isTouch1);
        return isTouch1;
    }isTouch();

    let modelJsonSections = {};
    let models = {};
    let xrButtons = {};
    const selectors$r = {
        productSlideshow: '[data-product-slideshow]',
        productXr: '[data-shopify-xr]',
        dataMediaId: 'data-media-id',
        dataModelId: 'data-model-id',
        modelViewer: 'model-viewer',
        dataModel3d: 'data-shopify-model3d-id',
        modelJson: '#ModelJson-'
    };
    function initSectionModels(modelViewerContainer, sectionId) {
        modelJsonSections[sectionId] = {
            loaded: false
        };
        const mediaId = modelViewerContainer.getAttribute(selectors$r.dataMediaId);
        const modelViewerElement = modelViewerContainer.querySelector(selectors$r.modelViewer);
        const modelId = modelViewerElement.getAttribute(selectors$r.dataModelId);
        if (modelViewerContainer.closest(selectors$r.productSlideshow) !== null) {
            const xrButton = modelViewerContainer.closest(selectors$r.productSlideshow).parentElement.querySelector(selectors$r.productXr);
            xrButtons[sectionId] = {
                $element: xrButton,
                defaultId: modelId
            };
        }
        models[mediaId] = {
            modelId: modelId,
            mediaId: mediaId,
            sectionId: sectionId,
            $container: modelViewerContainer,
            $element: modelViewerElement
        };
        window.Shopify.loadFeatures([
            {
                name: 'shopify-xr',
                version: '1.0',
                onLoad: setupShopifyXr
            },
            {
                name: 'model-viewer-ui',
                version: '1.0',
                onLoad: setupModelViewerUi
            }, 
        ]);
    }function setupShopifyXr(errors) {
        if (errors) {
            console.warn(errors);
            return;
        }
        if (!window.ShopifyXR) {
            document.addEventListener('shopify_xr_initialized', function() {
                setupShopifyXr();
            });
            return;
        }
        for(const sectionId in modelJsonSections){
            if (modelJsonSections.hasOwnProperty(sectionId)) {
                const modelSection = modelJsonSections[sectionId];
                if (modelSection.loaded) continue;
                const modelJson = document.querySelector(`${selectors$r.modelJson}${sectionId}`);
                if (modelJson) {
                    window.ShopifyXR.addModels(JSON.parse(modelJson.innerHTML));
                    modelSection.loaded = true;
                }
            }
        }
        window.ShopifyXR.setupXRElements();
    }
    function setupModelViewerUi(errors) {
        if (errors) {
            console.warn(errors);
            return;
        }
        for(const key in models){
            if (models.hasOwnProperty(key)) {
                const model = models[key];
                if (!model.modelViewerUi) {
                    model.modelViewerUi = new Shopify.ModelViewerUI(model.$element);
                }
                setupModelViewerListeners(model);
            }
        }
    }
    function setupModelViewerListeners(model) {
        const xrButton = xrButtons[model.sectionId];
        model.$container.addEventListener('pause', function() {
            if (model.modelViewerUi.pause) {
                model.modelViewerUi.pause();
            }
        });
        model.$container.addEventListener('play', function() {
            if (model.modelViewerUi.play) {
                model.modelViewerUi.play();
                if (xrButton && xrButton.$element && model && model.modelId && selectors$r.dataModel3d) {
                    xrButton.$element.setAttribute(selectors$r.dataModel3d, model.modelId);
                }
            }
        });
        model.$element.addEventListener('shopify_model_viewer_ui_toggle_play', ()=>{
            model.$container.dispatchEvent(new CustomEvent('theme:media:play'));
        });
        model.$element.addEventListener('shopify_model_viewer_ui_toggle_pause', ()=>{
            model.$container.dispatchEvent(new CustomEvent('theme:media:pause'));
        });
    }

    async function productNativeVideo(uniqueKey) {
        const playerElement = document.querySelector(`[data-player="${uniqueKey}"]`);
        const videoElement = playerElement.querySelector('video');
        const videoLoad = {
            name: 'video-ui',
            version: '1.0'
        };
        await loadScript(videoLoad);
        const player = new window.Shopify.Plyr(videoElement);
        playerElement.addEventListener('pause', ()=>{
            if (player.pause) {
                player.pause();
            }
        });
        playerElement.addEventListener('play', ()=>{
            try {
                if (player.play) {
                    // Check if it is paused to avoid playing an already playing video which sometimes results in error
                    if (player.paused) {
                        player.play();
                    }
                } else {
                    player.addEventListener('onReady', ()=>{
                        player.play();
                    });
                }
            } catch (e) {
                console.warn(e);
            }
        });
        playerElement.addEventListener('destroy', ()=>{
            try {
                if (player.destroy) {
                    player.destroy();
                }
            } catch (e) {
                console.warn(e);
            }
        });
        return player;
    }

    const selectors$q = {
        productSlideshow: '[data-product-slideshow]',
        slideshowMobileStyle: 'data-slideshow-mobile-style',
        slideshowDesktopStyle: 'data-slideshow-desktop-style',
        productThumbs: '[data-product-thumbs]',
        leftThumbsHolder: '[data-thumbs-holder]',
        thumbImage: '[data-slideshow-thumbnail]',
        mediaSlide: '[data-media-slide]',
        dataMediaId: 'data-media-id',
        dataMediaSelect: 'data-media-select',
        mediaType: 'data-type',
        videoPlayerExternal: '[data-type="external_video"]',
        videoPlayerNative: '[data-type="video"]',
        modelViewer: '[data-type="model"]',
        modelViewerTag: 'model-viewer',
        allPlayers: '[data-player]',
        loopVideo: 'data-enable-video-looping',
        verticalAlignment: '[data-thumbnails-left]',
        arrowPrev: '[data-thumbs-arrow-prev]',
        arrowNext: '[data-thumbs-arrow-next]',
        aspectRatio: 'data-aspect-ratio',
        flickitylockHeight: 'flickity-lock-height'
    };
    const classes$i = {
        flickityDisableClass: 'flickity-disabled-mobile',
        flickityEnabled: 'flickity-enabled',
        selected: 'is-selected',
        active: 'is-activated',
        show: 'show',
        enableVideoDraggable: 'enable-video-draggable',
        hide: 'hide'
    };
    let Media = class Media {
        init() {
            this.storeEvents();
            this.connectSliderMediaEvents();
            this.detectVideos();
            this.detect3d();
            this.scrollThumbs();
            document.addEventListener('theme:resize:width', ()=>{
                this.scrollThumbs();
            });
            resolution$1.onChange(()=>{
                this.connectSliderMediaEvents();
            });
        }
        connectSliderMediaEvents() {
            resolution$1.isMobile() ? this.createMobileSlider() : this.createDesktopSlider();
        }
        createMobileSlider() {
            if (this.hasDesktopSlider && this.flkty) {
                this.destroySlider();
                this.hasDesktopSlider = false;
            }
            // defaults to "thumbs" option
            const mobileOptions = {
                autoPlay: false,
                prevNextButtons: false,
                pageDots: false,
                adaptiveHeight: true,
                accessibility: true,
                watchCSS: false,
                wrapAround: true,
                rightToLeft: window.isRTL,
                dragThreshold: 80,
                contain: true,
                fade: true
            };
            if (this.mobileStyle == 'carousel') {
                mobileOptions.contain = false;
                mobileOptions.dragThreshold = 10;
                mobileOptions.fade = false;
            }
            if (this.mobileStyle == 'slideshow') {
                mobileOptions.pageDots = true;
                mobileOptions.fade = false;
                mobileOptions.dragThreshold = 10;
            }
            if (this.mobileStyle == 'none') return;
            this.createSlider(mobileOptions);
            this.hasMobileSlider = true;
        }
        createDesktopSlider() {
            if (this.hasMobileSlider && this.flkty) {
                this.destroySlider();
                this.hasMobileSlider = false;
            }
            if (this.desktopStyle == 'none') {
                return;
            }
            const desktopOptions = {
                autoPlay: false,
                prevNextButtons: false,
                pageDots: false,
                adaptiveHeight: true,
                accessibility: true,
                watchCSS: false,
                wrapAround: true,
                rightToLeft: window.isRTL,
                dragThreshold: 80,
                contain: true,
                fade: true
            };
            this.createSlider(desktopOptions);
            this.hasDesktopSlider = true;
        }
        createSlider(options) {
            this.flkty = new Flickity(this.slideshow, options);
            this.flkty.resize();
            this.currentSlide = this.slideshow.querySelectorAll(selectors$q.mediaSlide)[0];
            this.setDraggable();
            this.addEventListeners();
        }
        destroySlider() {
            this.removeEventListeners();
            this.flkty.destroy();
        }
        storeEvents() {
            this.storeFlktyChange = (e)=>this.doFlktyChange(e)
            ;
            this.storeFlktySettle = (e)=>this.doFlktySettle(e)
            ;
            this.storeImageChange = (e)=>this.doImageChange(e)
            ;
            this.storeArrowPrevClick = (e)=>this.doArrowPrevClick(e)
            ;
            this.storeArrowNextClick = (e)=>this.doArrowNextClick(e)
            ;
            this.storeThumbClick = (e)=>this.doThumbClick(e)
            ;
            this.storeThumbContainerScroll = (e)=>this.doThumbContainerScroll(e)
            ;
        }
        addEventListeners() {
            var ref, ref1, ref2;
            this.flkty.on('change', this.storeFlktyChange);
            this.flkty.on('settle', this.storeFlktySettle);
            this.slideshow.addEventListener('theme:image:change', this.storeImageChange);
            (ref = this.arrowPrev) === null || ref === void 0 ? void 0 : ref.addEventListener('click', this.storeArrowPrevClick);
            (ref1 = this.arrowNext) === null || ref1 === void 0 ? void 0 : ref1.addEventListener('click', this.storeArrowNextClick);
            (ref2 = this.thumbs) === null || ref2 === void 0 ? void 0 : ref2.addEventListener('scroll', this.storeThumbContainerScroll);
            this.thumbImages.forEach((thumb)=>{
                thumb.addEventListener('click', this.storeThumbClick);
            });
        }
        removeEventListeners() {
            var ref, ref3, ref4;
            this.flkty.on('change', this.storeFlktyChange);
            this.flkty.on('settle', this.storeFlktySettle);
            this.slideshow.removeEventListener('theme:image:change', this.storeImageChange);
            (ref = this.arrowPrev) === null || ref === void 0 ? void 0 : ref.removeEventListener('click', this.storeArrowPrevClick);
            (ref3 = this.arrowNext) === null || ref3 === void 0 ? void 0 : ref3.removeEventListener('click', this.storeArrowNextClick);
            (ref4 = this.thumbs) === null || ref4 === void 0 ? void 0 : ref4.removeEventListener('scroll', this.storeThumbContainerScroll);
            this.thumbImages.forEach((thumb)=>{
                thumb.removeEventListener('click', this.storeThumbClick);
            });
        }
        addMediaEventListeners(media) {
            if (!media) return;
            media.addEventListener('play', ()=>{
                if (resolution$1.isMobile() || resolution$1.isTouch()) {
                    this.updateDraggable(false);
                }
            });
            media.addEventListener('pause', ()=>{
                if (resolution$1.isMobile() || resolution$1.isTouch()) {
                    this.updateDraggable(true);
                }
            });
        }
        doFlktyChange(index) {
            var ref, ref5;
            // Pause previous slide media
            if (this.mediaType === 'model' || this.mediaType === 'video' || this.mediaType === 'external_video') {
                this.currentSlide.dispatchEvent(new CustomEvent('pause'));
            }
            this.currentSlide = this.flkty.cells[index].element;
            this.slideshow.classList.remove(selectors$q.flickitylockHeight);
            const id = this.currentSlide.getAttribute(selectors$q.dataMediaId);
            const currentThumb = (ref = this.thumbWrapper) === null || ref === void 0 ? void 0 : ref.querySelector(`[${selectors$q.dataMediaSelect}="${id}"]`);
            (ref5 = this.thumbWrapper) === null || ref5 === void 0 ? void 0 : ref5.querySelector(`.${classes$i.active}`).classList.remove(classes$i.active);
            currentThumb === null || currentThumb === void 0 ? void 0 : currentThumb.classList.add(classes$i.active);
            this.scrollThumbs();
            // when swatch images are hidden by specific alt-text, the slider breaks on change so we select the featured variant image to "fix" it
            // Timeout is needed to slow it down a bit until the images refresh and the currentThumb variable has the right value
            setTimeout(()=>{
                if ((currentThumb === null || currentThumb === void 0 ? void 0 : currentThumb.classList.contains(classes$i.hide)) || this.currentSlide.classList.contains(classes$i.hide)) {
                    //Select the next visible media - the image may not be apart of any group and is at the end.
                    let length = this.flkty.cells.length;
                    //Move to index 0 if drag is to the left otherwise increase index
                    const moveLeft = this.flkty.dragStartPosition < this.flkty.dragX;
                    for(let n = 0; n < length; n++){
                        let position = moveLeft ? index - n : index + n;
                        // When index - n is negative add length to wrap
                        if (position < 0) position = position + length;
                        // When index + n is >= length minus length to wrap
                        if (position >= length) position = position - length;
                        const mediaSelect = this.flkty.cells[position].element;
                        if (!mediaSelect.classList.contains(classes$i.hide)) {
                            this.lastMediaSelect = mediaSelect.getAttribute(selectors$q.dataMediaId);
                            break;
                        }
                    }
                    if (this.lastMediaSelect) {
                        this.slideshow.dispatchEvent(new CustomEvent('theme:image:change', {
                            detail: {
                                id: this.lastMediaSelect
                            }
                        }));
                    } else window.location.reload();
                }
            });
        }
        doFlktySettle(index) {
            this.allSlides = this.flkty.cells;
            this.currentSlide = this.flkty.cells[index].element;
            this.setDraggable();
            const isFocusEnabled = document.body.classList.contains(selectors$q.focusEnabled);
            if (isFocusEnabled) this.currentSlide.dispatchEvent(new Event('focus'));
            this.scrollThumbs();
        }
        doImageChange(event) {
            var mediaId = event.detail.id;
            this.lastMediaSelect = mediaId;
            const mediaIdString = `[${selectors$q.dataMediaId}="${mediaId}"]`;
            const matchesMedia = (cell)=>{
                return cell.element.matches(mediaIdString);
            };
            const index = this.flkty.cells.findIndex(matchesMedia);
            this.flkty.select(index);
            this.scrollThumbs();
        }
        doThumbContainerScroll() {
            this.scrollThumbs('scroll');
        }
        doArrowPrevClick() {
            this.scrollThumbs('clickPrev');
        }
        doArrowNextClick() {
            this.scrollThumbs('clickNext');
        }
        doThumbClick(event) {
            const id = event.currentTarget.getAttribute(selectors$q.dataMediaSelect);
            this.slideshow.dispatchEvent(new CustomEvent('theme:image:change', {
                detail: {
                    id: id
                }
            }));
        }
        setDraggable() {
            if (this.currentSlide) {
                this.mediaType = this.currentSlide.getAttribute(selectors$q.mediaType);
                if (this.mediaType === 'model' || this.mediaType === 'video' || this.mediaType === 'external_video') {
                    if (!resolution$1.isMobile() || !resolution$1.isTouch()) {
                        // Play on Desktop
                        this.currentSlide.dispatchEvent(new CustomEvent('play'));
                        this.updateDraggable(false);
                    } else {
                        this.updateDraggable(true); // Triggering this to ensure the first video also has the 'draggable' elements active on Mobile
                    }
                } else {
                    this.updateDraggable(true);
                }
            }
        }
        updateDraggable(state) {
            if (!this.flkty) return;
            this.flkty.options.draggable = state;
            this.flkty.updateDraggable();
            this.slideshow.classList.toggle(classes$i.enableVideoDraggable, state);
        }
        detect3d() {
            const modelViewerElements = this.container.querySelectorAll(selectors$q.modelViewer);
            if (modelViewerElements) {
                modelViewerElements.forEach((element)=>{
                    initSectionModels(element, this.section.id);
                    element.addEventListener('theme:media:play', ()=>{
                        this.updateDraggable(false);
                    });
                    element.addEventListener('theme:media:pause', ()=>{
                        this.updateDraggable(true);
                    });
                });
                document.addEventListener('shopify_xr_launch', (function() {
                    this.container.querySelectorAll(selectors$q.allPlayers).forEach((player)=>{
                        player.dispatchEvent(new CustomEvent('pause'));
                    });
                }).bind(this));
            }
        }
        detectVideos() {
            const playerElements = this.section.container.querySelectorAll(`${selectors$q.videoPlayerExternal}, ${selectors$q.videoPlayerNative}`);
            for (var player of playerElements){
                const uniqueKey = player.dataset.player;
                const host = player.dataset.host;
                let videoPlayerPromise;
                if (host === 'youtube') {
                    // Youtube
                    videoPlayerPromise = embedYoutube(uniqueKey);
                } else if (host === 'vimeo') {
                    // Vimeo
                    videoPlayerPromise = embedVimeo(uniqueKey);
                } else {
                    // Native video
                    videoPlayerPromise = productNativeVideo(uniqueKey);
                }
                if (this.loopVideo === true) {
                    videoPlayerPromise.then((videoPlayer)=>{
                        if (host) {
                            // Youtube and Vimeo
                            return _setToLoop(videoPlayer, host);
                        } else {
                            // Native video
                            videoPlayer.loop = true;
                            return videoPlayer;
                        }
                    }).catch((err)=>{
                        console.error(err);
                    });
                }
                this.addMediaEventListeners(player);
            }
        }
        pauseAllMedia() {
            const all = this.container.querySelector(selectors$q.mediaSlide);
            all.dispatchEvent(new CustomEvent('pause'));
        }
        pauseOtherMedia(uniqueKey) {
            const otherMedia = this.container.querySelector(`${selectors$q.mediaSlide}:not([data-player="${uniqueKey}"])`);
            otherMedia.dispatchEvent(new CustomEvent('pause'));
        }
        destroy() {
            this.container.querySelectorAll(selectors$q.allPlayers).forEach((player)=>{
                player.dispatchEvent(new CustomEvent('destroy'));
            });
        }
        scrollThumbs(event) {
            this.thumbs = this.container.querySelector(selectors$q.productThumbs);
            if (this.thumbs) {
                this.thumb = this.thumbs.querySelector(`.${classes$i.active}`);
                this.thumbItems = this.container.querySelectorAll(selectors$q.thumbImage);
                this.lastThumb = this.thumbItems[this.thumbItems.length - 1];
                if (!this.thumb) return;
                this.thumbsScrollTop = this.thumbs.scrollTop;
                this.thumbsScrollLeft = this.thumbs.scrollLeft;
                this.thumbsWidth = this.thumbs.offsetWidth;
                this.thumbsHeight = this.slideshow.offsetWidth / this.thumb.getAttribute(selectors$q.aspectRatio);
                this.thumbsPositionBottom = this.thumbsScrollTop + this.thumbsHeight;
                this.thumbsPositionRight = this.thumbsScrollLeft + this.thumbsWidth;
                this.checkThumbPositions();
                this.toggleToActiveThumb(event);
                this.toggleArrows();
            }
        }
        checkThumbPositions() {
            this.thumbWidth = this.thumb.offsetWidth;
            this.thumbHeight = this.thumb.offsetHeight;
            this.thumbPosTop = this.thumb.offsetTop;
            this.thumbPosLeft = this.thumb.offsetLeft;
            this.lastThumbRightPos = this.lastThumb.offsetLeft + this.thumbWidth;
            this.lastThumbBottomPos = this.lastThumb.offsetTop + this.thumbHeight;
            this.scrollTopPosition = this.thumbPosTop + this.thumbHeight / 2 - this.thumbsHeight / 2;
            this.scrollLeftPosition = this.thumbPosLeft + this.thumbWidth / 2 - this.thumbsWidth / 2;
            this.topCheck = this.thumbsScrollTop > 0;
            this.bottomCheck = this.thumbsPositionBottom < this.lastThumbBottomPos;
            this.leftCheck = this.thumbsScrollLeft > 0;
            this.rightCheck = this.thumbsPositionRight < this.lastThumbRightPos;
            this.verticalCheck = this.bottomCheck || this.topCheck;
            this.horizontalCheck = this.rightCheck || this.leftCheck;
        }
        toggleToActiveThumb(event) {
            if (event !== 'scroll') {
                if (event == 'clickPrev') {
                    if (this.verticalCheck) {
                        this.scrollTopPosition = this.thumbsScrollTop - this.thumbsHeight;
                        this.scrollLeftPosition = 0;
                    } else {
                        this.scrollTopPosition = 0;
                        this.scrollLeftPosition = this.thumbsScrollLeft - this.thumbsWidth;
                    }
                }
                if (event == 'clickNext') {
                    if (this.verticalCheck) {
                        this.scrollTopPosition = this.thumbsScrollTop + this.thumbsHeight;
                        this.scrollLeftPosition = 0;
                    } else {
                        this.scrollTopPosition = 0;
                        this.scrollLeftPosition = this.thumbsScrollLeft + this.thumbsWidth;
                    }
                }
                this.thumbs.scrollTo({
                    top: this.scrollTopPosition,
                    left: this.scrollLeftPosition,
                    behavior: 'smooth'
                });
            }
        }
        toggleArrows() {
            if (this.verticalCheck || this.verticalAlignment && !this.verticalCheck) {
                this.arrowPrev.classList.toggle(classes$i.show, this.topCheck);
                this.arrowNext.classList.toggle(classes$i.show, this.bottomCheck);
            }
            if (this.horizontalCheck || !this.verticalAlignment && !this.horizontalCheck) {
                this.arrowPrev.classList.toggle(classes$i.show, this.leftCheck);
                this.arrowNext.classList.toggle(classes$i.show, this.rightCheck);
            }
        }
        constructor(section){
            var ref, ref6;
            this.section = section;
            this.container = section.container;
            this.slideshow = this.container.querySelector(selectors$q.productSlideshow);
            this.mobileStyle = ((ref = this.slideshow) === null || ref === void 0 ? void 0 : ref.getAttribute(selectors$q.slideshowMobileStyle)) || 'none';
            this.desktopStyle = ((ref6 = this.slideshow) === null || ref6 === void 0 ? void 0 : ref6.getAttribute(selectors$q.slideshowDesktopStyle)) || 'none';
            this.arrowPrev = this.container.querySelector(selectors$q.arrowPrev);
            this.arrowNext = this.container.querySelector(selectors$q.arrowNext);
            this.leftThumbsHolder = this.container.querySelector(selectors$q.leftThumbsHolder);
            this.thumbWrapper = this.container.querySelector(selectors$q.productThumbs);
            this.thumbImages = this.container.querySelectorAll(selectors$q.thumbImage);
            this.loopVideo = this.container.getAttribute(selectors$q.loopVideo) === 'true';
            this.verticalAlignment = Boolean(this.container.querySelector(selectors$q.verticalAlignment));
            this.flkty = null;
            this.lastMediaSelect = null;
            this.thumbs = this.container.querySelector(selectors$q.productThumbs);
            this.currentSlide = null;
            this.mediaType = null;
            this.hasMobileSlider = false;
            this.hasDesktopSlider = false;
            this.init();
        }
    };
    function _setToLoop(player, host) {
        if (host === 'youtube') {
            player.addEventListener('onStateChange', (event)=>{
                if (event.data === 0) {
                    // video is over, replay
                    event.target.playVideo();
                }
            });
        } else if (host === 'vimeo') {
            player.on('ended', ()=>{
                // video is over, replay
                player.play();
            });
        }
        return player;
    }

    const selectors$p = {
        pickupContainer: 'data-store-availability-container',
        shopifySection: '[data-api-content]',
        drawer: '[data-pickup-drawer]',
        drawerOpen: '[data-pickup-drawer-open]',
        drawerClose: '[data-pickup-drawer-close]',
        drawerBody: '[data-pickup-body]'
    };
    const classes$h = {
        isVisible: 'drawer--visible',
        isHidden: 'hide',
        isPickupVisible: 'is-pickup-visible'
    };
    let sections$5 = {};
    let PickupAvailability = class PickupAvailability {
        fetchPickupAvailability(event) {
            const container = this.container.querySelector(`[${selectors$p.pickupContainer}]`);
            if (!container) return;
            const variantID = event && event.detail.variant ? event.detail.variant.id : container.getAttribute(selectors$p.pickupContainer);
            if (event && !event.detail.variant) {
                container.classList.add(classes$h.isHidden);
                return;
            }
            if (variantID) {
                fetch(`${window.theme.routes.root_url}variants/${variantID}/?section_id=api-pickup-availability`).then(this.handleErrors).then((response)=>response.text()
                ).then((text)=>{
                    const pickupAvailabilityHTML = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$p.shopifySection).innerHTML;
                    container.innerHTML = pickupAvailabilityHTML;
                    container.classList.remove(classes$h.isHidden);
                    this.drawer = this.container.querySelector(selectors$p.drawer);
                    this.buttonDrawerOpen = this.container.querySelector(selectors$p.drawerOpen);
                    this.buttonDrawerClose = this.container.querySelectorAll(selectors$p.drawerClose);
                    this.drawerBody = this.container.querySelector(selectors$p.drawerBody);
                    if (this.buttonDrawerOpen) {
                        this.buttonDrawerOpen.addEventListener('click', ()=>this.openDrawer()
                        );
                    }
                    if (this.buttonDrawerClose.length) {
                        this.buttonDrawerClose.forEach((element)=>{
                            element.addEventListener('click', ()=>this.closeDrawer()
                            );
                        });
                    }
                }).catch((e)=>{
                    console.error(e);
                });
            }
        }
        openDrawer() {
            if (this.drawer) {
                document.body.classList.add(classes$h.isPickupVisible);
                this.drawer.classList.add(classes$h.isVisible);
                this.drawer.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                    bubbles: true
                }));
                this.drawerBody.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                    bubbles: true
                }));
            }
        }
        closeDrawer() {
            if (this.drawer) {
                document.body.classList.remove(classes$h.isPickupVisible);
                this.drawer.classList.remove(classes$h.isVisible);
                this.drawer.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                    bubbles: true
                }));
                this.drawerBody.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                    bubbles: true
                }));
            }
        }
        handleErrors(response) {
            if (!response.ok) {
                return response.json().then(function(json) {
                    const e = new FetchError({
                        status: response.statusText,
                        headers: response.headers,
                        json: json
                    });
                    throw e;
                });
            }
            return response;
        }
        constructor(section){
            this.container = section.container;
            this.drawer = null;
            this.buttonDrawerOpen = null;
            this.buttonDrawerClose = null;
            this.drawerBody = null;
            this.fetchPickupAvailability();
            this.container.addEventListener('theme:variant:change', (event)=>this.fetchPickupAvailability(event)
            );
        }
    };
    const pickupAvailability = {
        onLoad () {
            sections$5[this.id] = new PickupAvailability(this);
        }
    };

    const selectors$o = {
        wrapper: '[data-quantity-selector]',
        increase: '[data-increase-quantity]',
        decrease: '[data-decrease-quantity]',
        input: '[data-quantity-input]'
    };
    let Quantity = class Quantity {
        initButtons() {
            this.increase.addEventListener('click', (function(e) {
                e.preventDefault();
                let v = parseInt(this.input.value, 10);
                v = isNaN(v) ? 0 : v;
                v++;
                this.input.value = v;
                this.input.dispatchEvent(new Event('change'));
            }).bind(this));
            this.decrease.addEventListener('click', (function(e) {
                e.preventDefault();
                let v = parseInt(this.input.value, 10);
                v = isNaN(v) ? 0 : v;
                v--;
                v = Math.max(this.min, v);
                this.input.value = v;
                this.input.dispatchEvent(new Event('change'));
            }).bind(this));
        }
        constructor(wrapper){
            this.wrapper = wrapper;
            this.increase = this.wrapper.querySelector(selectors$o.increase);
            this.decrease = this.wrapper.querySelector(selectors$o.decrease);
            this.input = this.wrapper.querySelector(selectors$o.input);
            this.min = parseInt(this.input.getAttribute('min'), 10);
            this.initButtons();
        }
    };
    function initQtySection(container) {
        const quantityWrappers = container.querySelectorAll(selectors$o.wrapper);
        quantityWrappers.forEach((qty)=>{
            new Quantity(qty);
        });
    }

    const selectors$n = {
        form: '[data-product-form]',
        optionPosition: 'data-option-position',
        optionInput: '[name^="options"], [data-popout-option]',
        selectOptionValue: 'data-value'
    };
    const classes$g = {
        soldOut: 'sold-out',
        unavailable: 'unavailable'
    };
    /**
     * Variant Sellout Precrime Click Preview
     * I think of this like the precrime machine in Minority report.  It gives a preview
     * of every possible click action, given the current form state.  The logic is:
     *
     * for each clickable name=options[] variant selection element
     * find the value of the form if the element were clicked
     * lookup the variant with those value in the product json
     * clear the classes, add .unavailable if it's not found,
     * and add .sold-out if it is out of stock
     *
     * Caveat: we rely on the option position so we don't need
     * to keep a complex map of keys and values.
     */ let SelloutVariants = class SelloutVariants {
        init() {
            this.update();
        }
        update() {
            this.getCurrentState();
            this.optionElements.forEach((el)=>{
                const val = el.value || el.getAttribute(selectors$n.selectOptionValue);
                const positionString = el.closest(`[${selectors$n.optionPosition}]`).getAttribute(selectors$n.optionPosition);
                // subtract one because option.position in liquid does not count form zero, but JS arrays do
                const position = parseInt(positionString, 10) - 1;
                let newVals = [
                    ...this.selections
                ];
                newVals[position] = val;
                const found = this.productJSON.variants.find((element)=>{
                    // only return true if every option matches our hypothetical selection
                    let perfectMatch = true;
                    for(let index = 0; index < newVals.length; index++){
                        if (element.options[index] !== newVals[index]) {
                            perfectMatch = false;
                        }
                    }
                    return perfectMatch;
                });
                el.classList.remove(classes$g.soldOut, classes$g.unavailable);
                if (typeof found === 'undefined') {
                    el.classList.add(classes$g.unavailable);
                } else if (found && found.available === false) {
                    el.classList.add(classes$g.soldOut);
                }
            });
        }
        getCurrentState() {
            this.formData = new FormData(this.form);
            this.selections = [];
            for (var value of this.formData.entries()){
                if (value[0].includes('options[')) {
                    // push the current state of the form, dont worry about the group name
                    // we will be using the array position instead of the name to match values
                    this.selections.push(value[1]);
                }
            }
        }
        constructor(section, productJSON){
            this.container = section;
            this.productJSON = productJSON;
            this.form = this.container.querySelector(selectors$n.form);
            this.formData = new FormData(this.form);
            this.optionElements = this.container.querySelectorAll(selectors$n.optionInput);
            if (this.productJSON && this.form) {
                this.init();
            }
        }
    };

    const selectors$m = {
        outerSection: '[data-section-id]',
        quickviewModal: '[data-quickview-modal]',
        productFormWrapper: '[data-product-form-wrapper]',
        productForm: '[data-product-form]',
        productSlideshow: '[data-product-slideshow]',
        addToCart: '[data-add-to-cart]',
        addToCartText: '[data-add-to-cart-text]',
        comparePrice: '[data-compare-price]',
        comparePriceText: '[data-compare-text]',
        buttonsWrapper: '[data-buttons-wrapper]',
        originalSelectorId: '[data-product-select]',
        priceWrapper: '[data-price-wrapper]',
        priceButton: '[data-button-price]',
        productJson: '[data-product-json]',
        productPrice: '[data-product-price]',
        unitPrice: '[data-product-unit-price]',
        unitBase: '[data-product-base]',
        unitWrapper: '[data-product-unit]',
        dataEnableHistoryState: 'data-enable-history-state',
        optionPosition: 'data-option-position',
        optionValue: '[data-option-value]',
        subPrices: '[data-subscription-watch-price]',
        subSelectors: '[data-subscription-selectors]',
        priceOffWrap: '[data-price-off]',
        priceOffType: '[data-price-off-type]',
        priceOffAmount: '[data-price-off-amount]',
        subsToggle: '[data-toggles-group]',
        subsChild: 'data-group-toggle',
        subDescription: '[data-plan-description]',
        remainingCount: '[data-remaining-count]',
        remainingMax: 'data-remaining-max',
        remainingWrapper: '[data-remaining-wrapper]',
        remainingJSON: '[data-product-remaining-json]',
        isPreOrder: '[data-product-preorder]'
    };
    const classes$f = {
        hide: 'hide',
        variantSoldOut: 'variant--soldout',
        variantUnavailable: 'variant--unavailable',
        productPriceSale: 'product__price--sale',
        remainingLow: 'count-is-low',
        remainingIn: 'count-is-in',
        remainingOut: 'count-is-out',
        remainingUnavailable: 'count-is-unavailable'
    };
    let ProductForm = class ProductForm extends HTMLElement {
        connectedCallback() {
            this.outerSection = this.container.closest(selectors$m.outerSection);
            this.quickview = this.container.closest(selectors$m.quickviewModal);
            this.outerWrapper = this.quickview ? this.quickview : this.outerSection;
            this.productFormWrapper = this.container.closest(selectors$m.productFormWrapper);
            this.productFormElement = this.container.querySelector(selectors$m.productForm);
            this.productForm = this.container.querySelector(selectors$m.productForm);
            this.slideshow = this.outerWrapper.querySelector(selectors$m.productSlideshow);
            this.enableHistoryState = this.outerSection && this.outerSection.hasAttribute(selectors$m.dataEnableHistoryState) ? this.outerSection.getAttribute(selectors$m.dataEnableHistoryState) === 'true' : false;
            this.hasUnitPricing = this.outerWrapper.querySelector(selectors$m.unitWrapper);
            this.subSelectors = this.outerWrapper.querySelector(selectors$m.subSelectors);
            this.subPrices = this.outerWrapper.querySelector(selectors$m.subPrices);
            this.priceOffWrap = this.outerWrapper.querySelector(selectors$m.priceOffWrap);
            this.priceOffAmount = this.outerWrapper.querySelector(selectors$m.priceOffAmount);
            this.priceOffType = this.outerWrapper.querySelector(selectors$m.priceOffType);
            this.planDecription = this.outerWrapper.querySelector(selectors$m.subDescription);
            this.isPreOrder = this.container.querySelector(selectors$m.isPreOrder);
            this.remainingWrapper = this.outerWrapper.querySelector(selectors$m.remainingWrapper);
            const remainingMaxWrap = this.outerWrapper.querySelector(`[${selectors$m.remainingMax}]`);
            this.sellout = null;
            if (this.remainingWrapper && remainingMaxWrap) {
                this.remainingMaxInt = parseInt(remainingMaxWrap.getAttribute(selectors$m.remainingMax), 10);
                this.remainingCount = this.outerWrapper.querySelector(selectors$m.remainingCount);
                this.remainingJSONWrapper = this.outerWrapper.querySelector(selectors$m.remainingJSON);
                this.remainingJSON = null;
                if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
                    this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
                } else {
                    console.warn('Missing product quantity JSON');
                }
            }
            initQtySection(this.outerWrapper);
            let productJSONText = null;
            this.productJSON = null;
            const productElemJSON = this.outerWrapper.querySelector(selectors$m.productJson);
            if (productElemJSON) {
                productJSONText = productElemJSON.innerHTML;
            }
            if (productJSONText && this.productForm) {
                this.productJSON = JSON.parse(productJSONText);
                this.sellout = new SelloutVariants(this.outerWrapper, this.productJSON);
                this.linkForm();
            } else {
                console.warn('Missing product form or product JSON');
            }
            // Add cookie for recent products
            if (this.productJSON) {
                new RecordRecentlyViewed(this.productJSON.handle);
            }
        }
        destroy() {
            this.productForm.destroy();
        }
        linkForm() {
            this.productForm = new ProductFormReader(this.outerWrapper, this.productFormElement, this.productJSON, {
                onOptionChange: this.onOptionChange.bind(this),
                onPlanChange: this.onPlanChange.bind(this),
                onQuantityChange: this.onQuantityChange.bind(this)
            });
            this.pushState(this.productForm.getFormState(), true);
            this.subsToggleListeners();
        }
        onOptionChange(evt) {
            this.pushState(evt.dataset);
        }
        onPlanChange(evt) {
            if (this.subPrices) {
                this.pushState(evt.dataset);
            }
        }
        onQuantityChange(evt) {
            const formState = evt.dataset;
            this.productState = this.setProductState(formState);
            this.updateButtonPrices(formState);
        }
        pushState(formState, init = false) {
            this.productState = this.setProductState(formState);
            this.updateProductImage(formState);
            this.updateAddToCartState(formState);
            this.updateProductPrices(formState);
            this.updateSaleText(formState);
            this.updateSubscriptionText(formState);
            this.updateLegend(formState);
            this.updateRemaining(formState);
            this.fireHookEvent(formState);
            if (this.sellout) {
                this.sellout.update(formState);
            }
            if (this.enableHistoryState && !init) {
                this.updateHistoryState(formState);
            }
        }
        updateAddToCartState(formState) {
            const variant = formState.variant;
            let addText = theme.strings.addToCart;
            const priceWrapper = this.outerWrapper.querySelectorAll(selectors$m.priceWrapper);
            const buttonsWrapper = this.outerWrapper.querySelector(selectors$m.buttonsWrapper);
            const addToCart = buttonsWrapper === null || buttonsWrapper === void 0 ? void 0 : buttonsWrapper.querySelectorAll(selectors$m.addToCart);
            const addToCartText = buttonsWrapper === null || buttonsWrapper === void 0 ? void 0 : buttonsWrapper.querySelectorAll(selectors$m.addToCartText);
            if (this.isPreOrder) {
                addText = theme.strings.preOrder;
            }
            if (priceWrapper.length && variant) {
                priceWrapper.forEach((element)=>{
                    element.classList.remove(classes$f.hide);
                });
            }
            if (addToCart === null || addToCart === void 0 ? void 0 : addToCart.length) {
                addToCart.forEach((element)=>{
                    if (variant) {
                        if (variant.available) {
                            element.disabled = false;
                        } else {
                            element.disabled = true;
                        }
                    } else {
                        element.disabled = true;
                    }
                });
            }
            if (addToCartText === null || addToCartText === void 0 ? void 0 : addToCartText.length) {
                addToCartText.forEach((element)=>{
                    if (variant) {
                        if (variant.available) {
                            element.innerHTML = addText;
                        } else {
                            element.innerHTML = theme.strings.soldOut;
                        }
                    } else {
                        element.innerHTML = theme.strings.unavailable;
                    }
                });
            }
            /*
          Critical JS: Update the hidden form input to the new variand ID
        */ if (buttonsWrapper && variant) {
                const formSelect = buttonsWrapper.querySelector(selectors$m.originalSelectorId);
                if (formSelect) {
                    formSelect.value = variant.id;
                }
            }
            /*
          Add or remove the CSS classes for sold out and unavailable variant states
        */ if (buttonsWrapper && this.productFormWrapper) {
                if (variant) {
                    if (variant.available) {
                        this.productFormWrapper.classList.remove(classes$f.variantSoldOut, classes$f.variantUnavailable);
                    } else {
                        this.productFormWrapper.classList.add(classes$f.variantSoldOut);
                        this.productFormWrapper.classList.remove(classes$f.variantUnavailable);
                    }
                } else {
                    this.productFormWrapper.classList.add(classes$f.variantUnavailable);
                    this.productFormWrapper.classList.remove(classes$f.variantSoldOut);
                }
            }
        }
        updateLegend(formState) {
            const variant = formState.variant;
            if (variant) {
                const vals = this.container.parentNode.querySelectorAll(selectors$m.optionValue);
                vals.forEach((val)=>{
                    const wrapper = val.closest(`[${selectors$m.optionPosition}]`);
                    if (wrapper) {
                        const position = wrapper.getAttribute(selectors$m.optionPosition);
                        const index = parseInt(position, 10) - 1;
                        this.newValue = variant.options[index];
                        val.innerHTML = this.newValue;
                    }
                });
            }
        }
        updateHistoryState(formState) {
            const variant = formState.variant;
            const plan = formState.plan;
            const location = window.location.href;
            if (variant && location.includes('/product')) {
                const url = new window.URL(location);
                const params = url.searchParams;
                params.set('variant', variant.id);
                if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
                    params.set('selling_plan', plan.detail.id);
                } else {
                    params.delete('selling_plan');
                }
                url.search = params.toString();
                const urlString = url.toString();
                window.history.replaceState({
                    path: urlString
                }, '', urlString);
            }
        }
        updateRemaining(formState) {
            const variant = formState.variant;
            if (variant && this.remainingWrapper && this.remainingJSON && this.remainingCount) {
                const newQuantity = this.remainingJSON[variant.id];
                if (newQuantity && newQuantity <= this.remainingMaxInt && newQuantity > 0) {
                    this.remainingWrapper.classList.remove(classes$f.remainingIn, classes$f.remainingOut, classes$f.remainingUnavailable);
                    this.remainingWrapper.classList.add(classes$f.remainingLow);
                    this.remainingCount.innerHTML = newQuantity;
                } else if (this.productState.soldOut) {
                    this.remainingWrapper.classList.remove(classes$f.remainingLow, classes$f.remainingIn, classes$f.remainingUnavailable);
                    this.remainingWrapper.classList.add(classes$f.remainingOut);
                } else if (this.productState.available) {
                    this.remainingWrapper.classList.remove(classes$f.remainingLow, classes$f.remainingOut, classes$f.remainingUnavailable);
                    this.remainingWrapper.classList.add(classes$f.remainingIn);
                }
            } else if (this.remainingWrapper) {
                this.remainingWrapper.classList.remove(classes$f.remainingIn, classes$f.remainingOut, classes$f.remainingLow);
                this.remainingWrapper.classList.add(classes$f.remainingUnavailable);
            }
        }
        getBaseUnit(variant) {
            return variant.unit_price_measurement.reference_value === 1 ? variant.unit_price_measurement.reference_unit : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
        }
        subsToggleListeners() {
            const toggles = this.outerWrapper.querySelectorAll(selectors$m.subsToggle);
            toggles.forEach((toggle)=>{
                toggle.addEventListener('change', (function(e) {
                    const val = e.target.value.toString();
                    const selected = this.outerWrapper.querySelector(`[${selectors$m.subsChild}="${val}"]`);
                    const groups = this.outerWrapper.querySelectorAll(`[${selectors$m.subsChild}]`);
                    if (selected) {
                        selected.classList.remove(classes$f.hide);
                        const first = selected.querySelector(`[name="selling_plan"]`);
                        first.checked = true;
                        first.dispatchEvent(new Event('change'));
                    }
                    groups.forEach((group)=>{
                        if (group !== selected) {
                            group.classList.add(classes$f.hide);
                            const plans = group.querySelectorAll(`[name="selling_plan"]`);
                            plans.forEach((plan)=>{
                                plan.checked = false;
                                plan.dispatchEvent(new Event('change'));
                            });
                        }
                    });
                }).bind(this));
            });
        }
        updateSaleText(formState) {
            if (this.productState.planSale) {
                this.updateSaleTextSubscription(formState);
            } else if (this.productState.onSale) {
                this.updateSaleTextStandard(formState);
            } else if (this.priceOffWrap) {
                this.priceOffWrap.classList.add(classes$f.hide);
            }
        }
        updateSaleTextStandard(formState) {
            if (!this.priceOffType) return;
            this.priceOffType.innerHTML = window.theme.strings.sale || 'sale';
            const variant = formState.variant;
            if (window.theme.settings.badge_sale_type && window.theme.settings.badge_sale_type === 'percentage') {
                const discountFloat = (variant.compare_at_price - variant.price) / variant.compare_at_price;
                const discountInt = Math.floor(discountFloat * 100);
                this.priceOffAmount.innerHTML = `${discountInt}%`;
            } else {
                const discount = variant.compare_at_price - variant.price;
                this.priceOffAmount.innerHTML = this.formattingMoney(discount);
            }
            this.priceOffWrap.classList.remove(classes$f.hide);
        }
        updateSaleTextSubscription(formState) {
            this.priceOffType.innerHTML = window.theme.strings.subscription || 'subscripton';
            const variant = formState.variant;
            const adjustment = formState.plan.detail.price_adjustments[0];
            const discount = adjustment.value;
            if (adjustment && adjustment.value_type === 'percentage') {
                this.priceOffAmount.innerHTML = `${discount}%`;
            } else if (adjustment && adjustment.value_type === 'price') {
                this.priceOffAmount.innerHTML = this.formattingMoney(variant.price - adjustment.value);
            } else {
                this.priceOffAmount.innerHTML = this.formattingMoney(discount);
            }
            this.priceOffWrap.classList.remove(classes$f.hide);
        }
        updateSubscriptionText(formState) {
            if (formState.plan && this.planDecription && formState.plan.detail.description !== null) {
                this.planDecription.innerHTML = formState.plan.detail.description;
                this.planDecription.classList.remove(classes$f.hide);
            } else if (this.planDecription) {
                this.planDecription.classList.add(classes$f.hide);
            }
        }
        getPrices(formState) {
            const variant = formState.variant;
            const plan = formState.plan;
            let comparePrice = '';
            let price = '';
            if (this.productState.available) {
                comparePrice = variant.compare_at_price;
                price = variant.price;
            }
            if (this.productState.hasPlan) {
                price = plan.allocation.price;
            }
            if (this.productState.planSale) {
                comparePrice = plan.allocation.compare_at_price;
                price = plan.allocation.price;
            }
            return {
                price: price,
                comparePrice: comparePrice
            };
        }
        updateButtonPrices(formState) {
            const priceButtons = this.outerWrapper.querySelectorAll(selectors$m.priceButton);
            const { price  } = this.getPrices(formState);
            if (priceButtons.length) {
                priceButtons.forEach((btn)=>{
                    const btnPrice = formState.quantity * price;
                    btn.innerHTML = this.formattingMoney(btnPrice);
                });
            }
        }
        updateProductPrices(formState) {
            const variant = formState.variant;
            const priceWrappers = this.outerWrapper.querySelectorAll(selectors$m.priceWrapper);
            const priceButtons = this.outerWrapper.querySelectorAll(selectors$m.priceButton);
            const { price , comparePrice  } = this.getPrices(formState);
            priceWrappers.forEach((wrap)=>{
                const comparePriceEl = wrap.querySelector(selectors$m.comparePrice);
                const productPriceEl = wrap.querySelector(selectors$m.productPrice);
                const comparePriceText = wrap.querySelector(selectors$m.comparePriceText);
                if (comparePriceEl) {
                    if (this.productState.onSale || this.productState.planSale) {
                        comparePriceEl.classList.remove(classes$f.hide);
                        comparePriceText.classList.remove(classes$f.hide);
                        productPriceEl.classList.add(classes$f.productPriceSale);
                    } else {
                        comparePriceEl.classList.add(classes$f.hide);
                        comparePriceText.classList.add(classes$f.hide);
                        productPriceEl.classList.remove(classes$f.productPriceSale);
                    }
                    comparePriceEl.innerHTML = this.formattingMoney(comparePrice);
                }
                if (productPriceEl) {
                    if (variant) {
                        productPriceEl.innerHTML = this.formattingMoney(price);
                    } else {
                        productPriceEl.innerHTML = '&nbsp;';
                    }
                }
            });
            if (priceButtons.length) {
                priceButtons.forEach((btn)=>{
                    const btnPrice = formState.quantity * price;
                    btn.innerHTML = this.formattingMoney(btnPrice);
                });
            }
            if (this.hasUnitPricing) {
                this.updateProductUnits(formState);
            }
        }
        updateProductUnits(formState) {
            const variant = formState.variant;
            const plan = formState.plan;
            let unitPrice = null;
            if (variant && variant.unit_price) {
                unitPrice = variant.unit_price;
            }
            if (plan && plan.allocation && plan.allocation.unit_price) {
                unitPrice = plan.allocation.unit_price;
            }
            if (unitPrice) {
                const base = this.getBaseUnit(variant);
                this.outerWrapper.querySelector(selectors$m.unitPrice).innerHTML = this.formattingMoney(unitPrice);
                this.outerWrapper.querySelector(selectors$m.unitBase).innerHTML = base;
                showElement(this.outerWrapper.querySelector(selectors$m.unitWrapper));
            } else {
                hideElement(this.outerWrapper.querySelector(selectors$m.unitWrapper));
            }
        }
        fireHookEvent(formState) {
            const variant = formState.variant;
            this.container.dispatchEvent(new CustomEvent('theme:variant:change', {
                detail: {
                    variant: variant
                },
                bubbles: true
            }));
        }
        /**
       * Tracks aspects of the product state that are relevant to UI updates
       * @param {object} evt - variant change event
       * @return {object} productState - represents state of variant + plans
       *  productState.available - current variant and selling plan options result in valid offer
       *  productState.soldOut - variant is sold out
       *  productState.onSale - variant is on sale
       *  productState.showUnitPrice - variant has unit price
       *  productState.requiresPlan - all the product variants requires a selling plan
       *  productState.hasPlan - there is a valid selling plan
       *  productState.planSale - plan has a discount to show next to price
       *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscribtion
       */ setProductState(dataset) {
            const variant = dataset.variant;
            const plan = dataset.plan;
            const productState = {
                available: true,
                soldOut: false,
                onSale: false,
                showUnitPrice: false,
                requiresPlan: false,
                hasPlan: false,
                planPerDelivery: false,
                planSale: false
            };
            if (!variant || variant.requires_selling_plan && !plan) {
                productState.available = false;
            } else {
                if (!variant.available) {
                    productState.soldOut = true;
                }
                if (variant.compare_at_price > variant.price) {
                    productState.onSale = true;
                }
                if (variant.unit_price) {
                    productState.showUnitPrice = true;
                }
                if (this.productJSON && this.productJSON.requires_selling_plan) {
                    productState.requiresPlan = true;
                }
                if (plan && this.subPrices) {
                    productState.hasPlan = true;
                    if (plan.allocation.per_delivery_price !== plan.allocation.price) {
                        productState.planPerDelivery = true;
                    }
                    if (plan.allocation.compare_at_price > plan.allocation.price) {
                        productState.planSale = true;
                    }
                }
            }
            return productState;
        }
        updateProductImage(formState) {
            const variant = formState.variant;
            if (variant) {
                if (this.slideshow && variant.featured_media && variant.featured_media.id) {
                    // Update variant image, if one is set
                    this.slideshow.dispatchEvent(new CustomEvent('theme:image:change', {
                        detail: {
                            id: variant.featured_media.id
                        }
                    }));
                    // Scroll viewport so image is in view
                    this.scrollImageViewport(variant);
                }
            }
        }
        scrollImageViewport(variant) {
            // Scroll to fit variant image in window, if images are stacked and image is not in viewport
            const desktopOrTablet = resolution$1.isDesktop() || resolution$1.isTablet();
            if (desktopOrTablet && this.slideshow.hasAttribute('data-vertical-images')) {
                const selectedImage = this.slideshow.querySelector(`[data-media-id="${variant.featured_media.id}"]`);
                // Get the top and bottom position of the selected image relative to the viewport
                const imageRect = selectedImage.getBoundingClientRect();
                const selectedImageTop = imageRect.top;
                const selectedImageBottom = imageRect.bottom;
                const imageWithinViewport = imageRect.height < window.innerHeight;
                // Check if the image is not fully within the viewport
                if (selectedImageTop < 0 || imageWithinViewport && selectedImageBottom > window.innerHeight) {
                    // Calculate scroll position based on whether the top or the bottom of the image is out of view
                    let scrollPosition = selectedImageTop + window.scrollY;
                    // If the top of the image is above the viewport, adjust the scroll position to the top of the image
                    if (selectedImageTop < 0) {
                        scrollPosition = selectedImageTop + window.scrollY;
                    } else if (selectedImageBottom > window.innerHeight) {
                        scrollPosition = selectedImageTop + window.scrollY - (window.innerHeight - imageRect.height);
                    }
                    // Scroll to the calculated position
                    window.scrollTo({
                        top: scrollPosition,
                        left: 0,
                        behavior: 'smooth'
                    });
                }
            }
        }
        formattingMoney(money) {
            if (theme.settings.currency_code_enable) {
                return themeCurrency.formatMoney(money, theme.moneyFormat) + ` ${theme.currencyCode}`;
            } else {
                return themeCurrency.formatMoney(money, theme.moneyFormat);
            }
        }
        constructor(){
            super();
            this.container = this;
        }
    };

    let ProductComplimentary = class ProductComplimentary extends HTMLElement {
        connectedCallback() {
            fetch(this.dataset.url).then((response)=>response.text()
            ).then((text)=>{
                const fresh = document.createElement('div');
                fresh.innerHTML = text;
                const newContent = fresh.querySelector('[data-api-content]');
                if (newContent) {
                    this.innerHTML = newContent.innerHTML;
                }
                const loader = this.closest('[data-product-complimentary-loaded]');
                if (loader && newContent.innerHTML.trim() !== '') {
                    // js-unloaded state hides the wrapper pre-render and
                    // keeps it hidden for empty recommendations
                    loader.classList.remove('js-unloaded');
                }
            }).catch((e)=>{
                console.error(e);
            });
        }
        constructor(){
            super();
        }
    };

    const selectors$l = {
        slideshow: '[data-product-slideshow]',
        singeImage: '[data-product-image]',
        zoomButton: '[data-zoom-button]',
        zoomWrapper: '[data-zoom-wrapper]',
        mediaId: 'data-media-id'
    };
    function productPhotoswipeZoom(container, json) {
        const loadedPromise = loadScript({
            url: window.theme.assets.photoswipe
        });
        const returnZoom = loadedPromise.then(()=>{
            const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
            const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;
            const triggers = container.querySelectorAll(selectors$l.zoomButton);
            triggers.forEach((trigger)=>{
                trigger.addEventListener('click', (event)=>{
                    const el = container.querySelector(selectors$l.zoomWrapper);
                    const dataId = event.target.closest(`[${selectors$l.mediaId}]`).getAttribute(selectors$l.mediaId).toString();
                    const items = [];
                    for(let i = 0; i < json.media.length; i++){
                        if (json.media[i].media_type === 'image') {
                            items[items.length] = {
                                src: json.media[i].src,
                                w: json.media[i].width,
                                h: json.media[i].height,
                                id: json.media[i].id
                            };
                        }
                    }
                    const findImage = (element)=>element.id.toString() === dataId
                    ;
                    const index = items.findIndex(findImage);
                    const options = {
                        index,
                        showHideOpacity: true,
                        showAnimationDuration: 150,
                        hideAnimationDuration: 250,
                        bgOpacity: 1,
                        spacing: 0,
                        allowPanToNext: false,
                        maxSpreadZoom: 3,
                        history: false,
                        loop: true,
                        pinchToClose: false,
                        modal: false,
                        closeOnScroll: false,
                        closeOnVerticalDrag: true,
                        getDoubleTapZoom: function getDoubleTapZoom(isMouseClick, item) {
                            if (isMouseClick) {
                                return 1.67;
                            } else {
                                return item.initialZoomLevel < 0.7 ? 1 : 1.3;
                            }
                        },
                        getThumbBoundsFn: function getThumbBoundsFn() {
                            let imageLocation = container.querySelector(selectors$l.slideshow);
                            if (!imageLocation) {
                                imageLocation = container.querySelector(selectors$l.singeImage);
                            }
                            const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                            const rect = imageLocation.getBoundingClientRect();
                            return {
                                x: rect.left,
                                y: rect.top + pageYScroll,
                                w: rect.width
                            };
                        }
                    };
                    el.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                        bubbles: true
                    }));
                    // Initializes and opens PhotoSwipe
                    const gallery = new PhotoSwipe(el, PhotoSwipeUI, items, options);
                    gallery.init();
                    gallery.listen('close', function() {
                        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                            bubbles: true
                        }));
                    });
                });
            });
        }).catch((e)=>console.error(e)
        );
        return returnZoom;
    }

    const selectors$k = {
        body: 'body',
        dataRelatedSectionElem: '[data-related-section]',
        dataTabsHolder: '[data-tabs-holder]',
        dataTab: 'data-tab',
        dataTabIndex: 'data-tab-index',
        blockId: 'data-block-id',
        tabsLi: '.tabs > button',
        tabLink: '.tab-link',
        tabLinkRecent: '.tab-link__recent',
        tabContent: '.tab-content',
        scrollbarHolder: '[data-scrollbar]',
        scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
        scrollbarArrowNext: '[data-scrollbar-arrow-next]',
        firstElement: 'a:first-child, input:first-child'
    };
    const classes$e = {
        classCurrent: 'current',
        classHide: 'hide',
        classAlt: 'alt',
        isFocused: 'is-focused'
    };
    const sections$4 = {};
    let GlobalTabs = class GlobalTabs {
        init() {
            const ctx = this.container;
            const tabsNavList = ctx.querySelectorAll(selectors$k.tabsLi);
            const firstTabLink = ctx.querySelector(`${selectors$k.tabLink}-0`);
            const firstTabContent = ctx.querySelector(`${selectors$k.tabContent}-0`);
            if (firstTabContent) {
                firstTabContent.classList.add(classes$e.classCurrent);
            }
            if (firstTabLink) {
                firstTabLink.classList.add(classes$e.classCurrent);
            }
            this.checkVisibleTabLinks();
            this.container.addEventListener('theme:tabs:check', ()=>this.checkRecentTab()
            );
            this.container.addEventListener('theme:tabs:hide', ()=>this.hideRelatedTab()
            );
            if (tabsNavList.length) {
                tabsNavList.forEach((element)=>{
                    const tabId = parseInt(element.getAttribute(selectors$k.dataTab));
                    const tab = ctx.querySelector(`${selectors$k.tabContent}-${tabId}`);
                    element.addEventListener('click', ()=>{
                        this.tabChange(element, tab);
                    });
                    element.addEventListener('keyup', (event)=>{
                        if ((event.code === 'Space' || event.code === 'Enter') && this.body.classList.contains(classes$e.isFocused)) {
                            this.tabChange(element, tab);
                            if (tab.querySelector('a, input')) {
                                this.accessibility.lastFocused = element;
                                this.accessibility.a11y.trapFocus(tab, {
                                    elementToFocus: tab.querySelector(selectors$k.firstElement)
                                });
                            }
                        }
                    });
                });
            }
        }
        tabChange(element, tab) {
            this.container.querySelector(`${selectors$k.tabsLi}.${classes$e.classCurrent}`).classList.remove(classes$e.classCurrent);
            this.container.querySelector(`${selectors$k.tabContent}.${classes$e.classCurrent}`).classList.remove(classes$e.classCurrent);
            element.classList.add(classes$e.classCurrent);
            tab.classList.add(classes$e.classCurrent);
            if (element.classList.contains(classes$e.classHide)) {
                tab.classList.add(classes$e.classHide);
            }
            this.checkVisibleTabLinks();
            this.container.dispatchEvent(new CustomEvent('theme:tab:change'));
        }
        initNativeScrollbar() {
            if (this.scrollbarHolder.length) {
                this.scrollbarHolder.forEach((scrollbar)=>{
                    new NativeScrollbar(scrollbar);
                });
            }
        }
        checkVisibleTabLinks() {
            const tabsNavList = this.container.querySelectorAll(selectors$k.tabsLi);
            const tabsNavListHided = this.container.querySelectorAll(`${selectors$k.tabLink}.${classes$e.classHide}`);
            const difference = tabsNavList.length - tabsNavListHided.length;
            if (difference < 2) {
                this.container.classList.add(classes$e.classAlt);
            } else {
                this.container.classList.remove(classes$e.classAlt);
            }
        }
        checkRecentTab() {
            const tabLink = this.container.querySelector(selectors$k.tabLinkRecent);
            if (tabLink) {
                tabLink.classList.remove(classes$e.classHide);
                const tabLinkIdx = parseInt(tabLink.getAttribute(selectors$k.dataTab));
                const tabContent = this.container.querySelector(`${selectors$k.tabContent}[${selectors$k.dataTabIndex}="${tabLinkIdx}"]`);
                if (tabContent) {
                    tabContent.classList.remove(classes$e.classHide);
                }
                this.checkVisibleTabLinks();
                this.initNativeScrollbar();
            }
        }
        hideRelatedTab() {
            const relatedSection = this.container.querySelector(selectors$k.dataRelatedSectionElem);
            if (!relatedSection) {
                return;
            }
            const parentTabContent = relatedSection.closest(`${selectors$k.tabContent}.${classes$e.classCurrent}`);
            if (!parentTabContent) {
                return;
            }
            const parentTabContentIdx = parseInt(parentTabContent.getAttribute(selectors$k.dataTabIndex));
            const tabsNavList = this.container.querySelectorAll(selectors$k.tabsLi);
            if (tabsNavList.length > parentTabContentIdx) {
                const nextTabsNavLink = tabsNavList[parentTabContentIdx].nextElementSibling;
                if (nextTabsNavLink) {
                    tabsNavList[parentTabContentIdx].classList.add(classes$e.classHide);
                    nextTabsNavLink.dispatchEvent(new Event('click'));
                    this.initNativeScrollbar();
                }
            }
        }
        onBlockSelect(evt) {
            const element = this.container.querySelector(`${selectors$k.tabLink}[${selectors$k.blockId}="${evt.detail.blockId}"]`);
            if (element) {
                element.dispatchEvent(new Event('click'));
                element.parentNode.scrollTo({
                    top: 0,
                    left: element.offsetLeft - element.clientWidth,
                    behavior: 'smooth'
                });
            }
        }
        constructor(holder){
            this.container = holder;
            this.body = document.querySelector(selectors$k.body);
            this.accessibility = window.accessibility;
            if (this.container) {
                this.scrollbarHolder = this.container.querySelectorAll(selectors$k.scrollbarHolder);
                this.init();
                // Init native scrollbar
                this.initNativeScrollbar();
            }
        }
    };
    const tabs$1 = {
        onLoad () {
            sections$4[this.id] = [];
            const tabHolders = this.container.querySelectorAll(selectors$k.dataTabsHolder);
            tabHolders.forEach((holder)=>{
                sections$4[this.id].push(new GlobalTabs(holder));
            });
        },
        onBlockSelect (e) {
            sections$4[this.id].forEach((el)=>{
                if (typeof el.onBlockSelect === 'function') {
                    el.onBlockSelect(e);
                }
            });
        }
    };

    const selectors$j = {
        urlInput: '[data-share-url]',
        section: 'data-section-type',
        shareDetails: '[data-share-details]',
        shareSummary: '[data-share-summary]',
        shareCopy: '[data-share-copy]',
        shareButton: '[data-share-button]',
        closeButton: '[data-close-button]',
        successMessage: '[data-success-message]',
        shareHolder: '[data-share-holder]'
    };
    const classes$d = {
        hidden: 'is-hidden'
    };
    let ShareButton = class ShareButton extends HTMLElement {
        init() {
            if (navigator.share) {
                this.mainDetailsToggle.classList.add(classes$d.hidden);
                this.shareButton.classList.remove(classes$d.hidden);
                this.shareButton.addEventListener('click', ()=>{
                    navigator.share({
                        url: this.urlToShare,
                        title: document.title
                    });
                });
            } else {
                this.mainDetailsToggle.addEventListener('toggle', this.toggleDetails.bind(this));
                this.mainDetailsToggle.addEventListener('focusout', ()=>{
                    setTimeout(()=>{
                        if (!this.contains(document.activeElement)) {
                            this.close();
                        }
                    });
                });
                this.shareCopy.addEventListener('click', this.copyToClipboard.bind(this));
                this.closeButton.addEventListener('click', this.close.bind(this));
                this.container.addEventListener('keyup', this.keyboardEvents.bind(this));
            }
        }
        updateShareLink() {
            if (this.container.getAttribute(selectors$j.section) == 'product') {
                this.container.addEventListener('theme:variant:change', (event)=>{
                    if (event.detail.variant) {
                        this.urlToShare = `${this.urlToShare.split('?')[0]}?variant=${event.detail.variant.id}`;
                        if (this.urlInput) {
                            this.urlInput.value = `${this.urlToShare.split('?')[0]}?variant=${event.detail.variant.id}`;
                        }
                    }
                });
            }
        }
        toggleDetails() {
            if (!this.mainDetailsToggle.open) {
                this.successMessage.classList.add(classes$d.hidden);
                this.successMessage.textContent = '';
                this.closeButton.classList.add(classes$d.hidden);
                this.shareCopy.focus();
            }
        }
        copyToClipboard() {
            navigator.clipboard.writeText(this.urlInput.value).then(()=>{
                this.successMessage.classList.remove(classes$d.hidden);
                this.successMessage.textContent = theme.strings.successMessage;
                this.closeButton.classList.remove(classes$d.hidden);
                this.closeButton.focus();
            });
        }
        close() {
            this.mainDetailsToggle.removeAttribute('open');
            this.shareSummary.setAttribute('aria-expanded', false);
        }
        keyboardEvents(e) {
            if (e.code !== 'Escape') {
                return;
            }
            this.mainDetailsToggle.focus();
            this.close();
        }
        constructor(){
            super();
            this.container = this.closest(`[${selectors$j.section}]`);
            this.mainDetailsToggle = this.querySelector(selectors$j.shareDetails);
            this.shareButton = this.querySelector(selectors$j.shareButton);
            this.shareCopy = this.querySelector(selectors$j.shareCopy);
            this.shareSummary = this.querySelector(selectors$j.shareSummary);
            this.closeButton = this.querySelector(selectors$j.closeButton);
            this.successMessage = this.querySelector(selectors$j.successMessage);
            this.shareHolder = this.querySelector(selectors$j.shareHolder);
            this.urlInput = this.querySelector(selectors$j.urlInput);
            this.urlToShare = this.urlInput ? this.urlInput.value : document.location.href;
            this.init();
            this.updateShareLink();
        }
    };

    const selectors$i = {
        groupImage: 'data-image-filter',
        slider: '[data-product-slideshow]',
        thumbSlider: '[data-product-thumbs]',
        thumbs: '[data-slideshow-thumbnail]',
        slides: '[data-media-slide]'
    };
    const classes$c = {
        hide: 'hide',
        flickityEnable: 'flickity-enabled'
    };
    let GroupVariantImages = class GroupVariantImages {
        listen() {
            this.container.addEventListener('theme:variant:change', (event)=>{
                if (event.detail.variant) {
                    this.variantImage = event.detail.variant.featured_image;
                    this.filterImages();
                }
            });
        }
        filterImages() {
            if (this.variantImage !== null && this.variantImage.alt !== null) {
                this.variantImageAlt = this.variantImage.alt.split('#')[1];
                this.showImages();
            } else {
                this.resetImages();
            }
            this.refreshSliders();
        }
        resetImages() {
            this.thumbs.forEach((thumb)=>thumb.classList.remove(classes$c.hide)
            );
            this.slides.forEach((slide)=>slide.classList.remove(classes$c.hide)
            );
        }
        showImages() {
            this.thumbs.forEach((thumb)=>{
                if (thumb.getAttribute(selectors$i.groupImage) === '' || thumb.getAttribute(selectors$i.groupImage) === this.variantImageAlt) {
                    thumb.classList.remove(classes$c.hide);
                } else {
                    thumb.classList.add(classes$c.hide);
                }
            });
            this.slides.forEach((slide)=>{
                if (slide.getAttribute(selectors$i.groupImage) === '' || slide.getAttribute(selectors$i.groupImage) === this.variantImageAlt) {
                    slide.classList.remove(classes$c.hide);
                } else {
                    slide.classList.add(classes$c.hide);
                }
            });
        }
        refreshSliders() {
            if (this.slider !== null) {
                if (this.slider.classList.contains(classes$c.flickityEnable)) {
                    const slider = FlickityFade.data(this.slider);
                    if (typeof slider !== 'undefined') {
                        slider.reloadCells();
                    }
                }
            }
            if (this.thumbSlider !== null) {
                if (this.thumbSlider.classList.contains(classes$c.flickityEnable)) {
                    const thumbSlider = FlickitySync.data(this.thumbSlider);
                    if (typeof thumbSlider !== 'undefined') {
                        thumbSlider.reloadCells();
                    }
                }
            }
        }
        constructor(section){
            this.section = section;
            this.container = section.container;
            this.slider = this.container.querySelector(selectors$i.slider);
            this.thumbSlider = this.container.querySelector(selectors$i.thumbSlider);
            this.thumbs = this.container.querySelectorAll(selectors$i.thumbs);
            this.slides = this.container.querySelectorAll(selectors$i.slides);
            this.variantImage = null;
            this.listen();
        }
    };

    const selectors$h = {
        sizeButton: '[data-size-button]',
        mediaHolder: '[data-media-slide]'
    };
    const classes$b = {
        classExpanded: 'is-expanded'
    };
    let ImageCaption = class ImageCaption {
        init() {
            this.sizeButtons.forEach((button)=>{
                button.addEventListener('click', ()=>{
                    button.classList.toggle(classes$b.classExpanded);
                    button.closest(selectors$h.mediaHolder).classList.toggle(classes$b.classExpanded);
                });
            });
        }
        constructor(container){
            this.container = container;
            this.sizeButtons = this.container.querySelectorAll(selectors$h.sizeButton);
            if (this.sizeButtons.length > 0) {
                this.init();
            }
        }
    };

    const selectors$g = {
        productJson: '[data-product-json]',
        zoomButton: '[data-zoom-button]',
        toggleTruncateHolder: '[data-truncated-holder]',
        toggleTruncateButton: '[data-truncated-button]',
        toggleTruncateContent: 'data-truncated-content'
    };
    const classes$a = {
        classExpanded: 'is-expanded',
        classVisible: 'is-visible'
    };
    const sections$3 = [];
    let ProductTemplate = class ProductTemplate {
        init() {
            this.zoomEnabled = this.container.querySelector(selectors$g.zoomButton) !== null;
            if (this.zoomEnabled) {
                productPhotoswipeZoom(this.container, this.product);
            }
            if (this.truncateElementHolder && this.truncateElement) {
                setTimeout(this.resizeEventTruncate, 50);
                document.addEventListener('theme:resize', this.resizeEventTruncate);
            }
            new ImageCaption(this.container);
        }
        truncateText() {
            if (this.truncateElementHolder.classList.contains(classes$a.classVisible)) return;
            const styles = this.truncateElement.querySelectorAll('style');
            if (styles.length) {
                styles.forEach((style)=>{
                    this.truncateElementHolder.prepend(style);
                });
            }
            const truncateElementCloned = this.truncateElement.cloneNode(true);
            const truncateElementClass = this.truncateElement.getAttribute(selectors$g.toggleTruncateContent);
            const truncateNextElement = this.truncateElement.nextElementSibling;
            if (truncateNextElement) {
                truncateNextElement.remove();
            }
            this.truncateElement.parentElement.append(truncateElementCloned);
            const truncateAppendedElement = this.truncateElement.nextElementSibling;
            truncateAppendedElement.classList.add(truncateElementClass);
            truncateAppendedElement.removeAttribute(selectors$g.toggleTruncateContent);
            showElement(truncateAppendedElement);
            ellipsis(truncateAppendedElement, 5, {
                replaceStr: '',
                delimiter: ' '
            });
            hideElement(truncateAppendedElement);
            if (this.truncateElement.innerHTML !== truncateAppendedElement.innerHTML) {
                this.truncateElementHolder.classList.add(classes$a.classExpanded);
            } else {
                truncateAppendedElement.remove();
                this.truncateElementHolder.classList.remove(classes$a.classExpanded);
            }
            this.toggleTruncatedContent(this.truncateElementHolder);
        }
        toggleTruncatedContent(holder) {
            const toggleButton = holder.querySelector(selectors$g.toggleTruncateButton);
            if (toggleButton) {
                toggleButton.addEventListener('click', (e)=>{
                    e.preventDefault();
                    holder.classList.remove(classes$a.classExpanded);
                    holder.classList.add(classes$a.classVisible);
                });
            }
        }
        onBlockSelect(event) {
            const block = this.container.querySelector(`[data-block-id="${event.detail.blockId}"]`);
            if (block) {
                block.dispatchEvent(new Event('click'));
            }
        }
        onBlockDeselect(event) {
            const block = this.container.querySelector(`[data-block-id="${event.detail.blockId}"]`);
            if (block) {
                block.dispatchEvent(new Event('click'));
            }
        }
        onUnload() {
            this.media.destroy();
            if (this.truncateElementHolder && this.truncateElement) {
                document.removeEventListener('theme:resize', this.resizeEventTruncate);
            }
        }
        constructor(section){
            this.section = section;
            this.id = section.id;
            this.container = section.container;
            this.settings = section.settings;
            modal(this.id);
            this.media = new Media(section);
            new GroupVariantImages(section);
            const productJSON = this.container.querySelector(selectors$g.productJson);
            if (productJSON && productJSON.innerHTML !== '') {
                this.product = JSON.parse(productJSON.innerHTML);
            } else {
                console.error('Missing product JSON');
                return;
            }
            this.truncateElementHolder = this.container.querySelector(selectors$g.toggleTruncateHolder);
            this.truncateElement = this.container.querySelector(`[${selectors$g.toggleTruncateContent}]`);
            this.resizeEventTruncate = ()=>this.truncateText()
            ;
            this.init();
        }
    };
    const productSection = {
        onLoad () {
            sections$3[this.id] = new ProductTemplate(this);
        },
        onUnload () {
            if (typeof sections$3[this.id].unload === 'function') {
                sections$3[this.id].unload();
            }
        },
        onBlockSelect (evt) {
            if (typeof sections$3[this.id].onBlockSelect === 'function') {
                sections$3[this.id].onBlockSelect(evt);
            }
        },
        onBlockDeselect (evt) {
            if (typeof sections$3[this.id].onBlockDeselect === 'function') {
                sections$3[this.id].onBlockDeselect(evt);
            }
        }
    };
    register('product', [
        productSection,
        pickupAvailability,
        accordion,
        tabs$1,
        swapperSection
    ]);
    if (!customElements.get('product-form')) {
        customElements.define('product-form', ProductForm);
    }
    if (!customElements.get('product-complimentary')) {
        customElements.define('product-complimentary', ProductComplimentary);
    }
    if (!customElements.get('radio-swatch')) {
        customElements.define('radio-swatch', RadioSwatch);
    }
    if (!customElements.get('popout-select')) {
        customElements.define('popout-select', PopoutSelect);
    }
    if (!customElements.get('share-button')) {
        customElements.define('share-button', ShareButton);
    }

    const selectors$f = {
        toggle: 'data-toggle-grid',
        large: 'data-grid-large',
        small: 'data-grid-small'
    };
    const classes$9 = {
        active: 'is-active'
    };
    const options = {
        breakpoint: window.theme.sizes.small
    };
    var sections$2 = {};
    let Toggle = class Toggle {
        init() {
            this.toggle.addEventListener('click', this.toggleFunction);
            document.addEventListener('theme:resize:width', this.toggleFunction);
            this.toggleEvent(false);
        }
        unload() {
            this.toggle.removeEventListener('click', this.toggleFunction);
            document.removeEventListener('theme:resize:width', this.toggleFunction);
        }
        toggleEvent(evt = true) {
            const clickEvent = evt && evt.type === 'click';
            const isLarge = window.innerWidth >= options.breakpoint;
            const selector = isLarge ? selectors$f.large : selectors$f.small;
            const grid = this.container.querySelector(`[${selector}]`);
            const gridNumber = grid.getAttribute(selector);
            const activeToggle = this.toggle.parentElement.querySelector(`[${selectors$f.toggle}].${classes$9.active}`);
            let currentToggle = this.toggle.parentElement.querySelector(`[${selectors$f.toggle}="${gridNumber}"]`);
            if (clickEvent) {
                currentToggle = this.toggle;
                grid.setAttribute(selector, this.value);
            }
            if (activeToggle) {
                activeToggle.classList.remove(classes$9.active);
            }
            if (currentToggle) {
                currentToggle.classList.add(classes$9.active);
            }
        }
        constructor(toggle, container){
            this.container = container || document;
            this.toggle = toggle;
            this.value = this.toggle.getAttribute(selectors$f.toggle);
            this.toggleFunction = (evt)=>this.toggleEvent(evt)
            ;
            this.init();
        }
    };
    const toggleSection = {
        onLoad () {
            sections$2[this.id] = [];
            const buttons = this.container.querySelectorAll(`[${selectors$f.toggle}]`);
            buttons.forEach((button)=>{
                sections$2[this.id].push(new Toggle(button, this.container));
            });
        },
        onUnload: function() {
            sections$2[this.id].forEach((toggle)=>{
                if (typeof toggle.unload === 'function') {
                    toggle.unload();
                }
            });
        }
    };

    const selectors$e = {
        sort: 'data-sort-enabled',
        sortLinks: '[data-sort-link]',
        sortButtonText: '[data-sort-button-text]',
        sortValue: 'data-value'
    };
    const classes$8 = {
        active: 'popout-list__item--current'
    };
    let Sort = class Sort {
        init() {
            this.sortLinks.forEach((link)=>{
                link.addEventListener('click', (e)=>{
                    e.preventDefault();
                    this.sortingResults(e);
                });
            });
        }
        sortingResults(e) {
            const link = e.currentTarget;
            const sort = link.getAttribute(selectors$e.sortValue);
            const text = link.innerText;
            this.sortButtonText.innerText = text;
            this.sortButtonText.parentNode.dispatchEvent(new Event('click'));
            this.sort.querySelector(`.${classes$8.active}`).classList.remove(classes$8.active);
            link.parentNode.classList.add(classes$8.active);
            this.sort.setAttribute(selectors$e.sort, sort);
            this.container.dispatchEvent(new CustomEvent('theme:form:filter', {
                bubbles: true,
                detail: {
                    params: sort
                }
            }));
        }
        constructor(section){
            this.container = section.container;
            this.sort = this.container.querySelector(`[${selectors$e.sort}]`);
            this.sortLinks = this.container.querySelectorAll(selectors$e.sortLinks);
            this.sortButtonText = this.container.querySelector(selectors$e.sortButtonText);
            if (this.sort) {
                this.init();
            }
        }
    };

    var selectors$d = {
        swatch: 'data-swatch'
    };
    let Collection = class Collection {
        init() {
            new Sort(this.section);
        }
        constructor(section){
            this.section = section;
            this.container = this.section.container;
            this.swatches = this.container.querySelectorAll(`[${selectors$d.swatch}]`);
            this.init();
        }
    };
    const collectionSection = {
        onLoad () {
            this.collection = new Collection(this);
        }
    };
    register('collection', [
        collectionSection,
        collectionFiltersSidebar,
        collectionFiltersForm,
        toggleSection,
        swatchGridSection,
        accordion,
        siblings
    ]);
    if (!customElements.get('popout-select')) {
        customElements.define('popout-select', PopoutSelect);
    }
    if (!customElements.get('radio-swatch')) {
        customElements.define('radio-swatch', RadioSwatch);
    }
    if (!customElements.get('product-grid-item')) {
        customElements.define('product-grid-item', ProductGridItem);
    }
    if (!customElements.get('product-grid-item-variant')) {
        customElements.define('product-grid-item-variant', ProductGridItemVariant);
    }
    if (!customElements.get('product-grid-item-image')) {
        customElements.define('product-grid-item-image', ProductGridItemImage);
    }

    register('collection-row', [
        swatchGridSection,
        siblings,
        customScrollbar
    ]);
    if (!customElements.get('radio-swatch')) {
        customElements.define('radio-swatch', RadioSwatch);
    }
    if (!customElements.get('product-grid-item')) {
        customElements.define('product-grid-item', ProductGridItem);
    }
    if (!customElements.get('product-grid-item-variant')) {
        customElements.define('product-grid-item-variant', ProductGridItemVariant);
    }
    if (!customElements.get('product-grid-item-image')) {
        customElements.define('product-grid-item-image', ProductGridItemImage);
    }

    register('collection-tabs', [
        tabs$1,
        productSliderSection,
        swatchGridSection
    ]);
    if (!customElements.get('radio-swatch')) {
        customElements.define('radio-swatch', RadioSwatch);
    }
    if (!customElements.get('product-grid-item')) {
        customElements.define('product-grid-item', ProductGridItem);
    }
    if (!customElements.get('product-grid-item-variant')) {
        customElements.define('product-grid-item-variant', ProductGridItemVariant);
    }
    if (!customElements.get('product-grid-item-image')) {
        customElements.define('product-grid-item-image', ProductGridItemImage);
    }

    var styles = {};
    styles.basic = [];
    /* eslint-disable */ styles.light = [
        {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'on'
                },
                {
                    lightness: '64'
                },
                {
                    hue: '#ff0000'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#bdbdbd'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [
                {
                    color: '#f0f0f0'
                },
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'landscape.natural.landcover',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'landscape.natural.terrain',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'geometry.fill',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [
                {
                    lightness: '100'
                }
            ]
        },
        {
            featureType: 'poi.park',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'on'
                }
            ]
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [
                {
                    saturation: '-41'
                },
                {
                    color: '#e8ede7'
                }
            ]
        },
        {
            featureType: 'poi.park',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'all',
            stylers: [
                {
                    saturation: '-100'
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'labels',
            stylers: [
                {
                    lightness: '25'
                },
                {
                    gamma: '1.06'
                },
                {
                    saturation: '-100'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
                {
                    gamma: '10.00'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                },
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry.fill',
            stylers: [
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.fill',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    gamma: '10.00'
                },
                {
                    lightness: '100'
                },
                {
                    weight: '0.4'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'simplified'
                },
                {
                    weight: '0.01'
                },
                {
                    lightness: '39'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    weight: '0.50'
                },
                {
                    gamma: '10.00'
                },
                {
                    lightness: '100'
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'water',
            elementType: 'all',
            stylers: [
                {
                    color: '#cfe5ee'
                },
                {
                    visibility: 'on'
                }
            ]
        }, 
    ];
    styles.light_blank = [
        {
            featureType: 'all',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                },
                {
                    lightness: '64'
                },
                {
                    hue: '#ff0000'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#bdbdbd'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [
                {
                    color: '#f0f0f0'
                },
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'landscape.natural.landcover',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'landscape.natural.terrain',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'geometry.fill',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [
                {
                    lightness: '100'
                }
            ]
        },
        {
            featureType: 'poi.park',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'on'
                }
            ]
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [
                {
                    saturation: '-41'
                },
                {
                    color: '#e8ede7'
                }
            ]
        },
        {
            featureType: 'poi.park',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'all',
            stylers: [
                {
                    saturation: '-100'
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'labels',
            stylers: [
                {
                    lightness: '25'
                },
                {
                    gamma: '1.06'
                },
                {
                    saturation: '-100'
                },
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
                {
                    gamma: '10.00'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                },
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry.fill',
            stylers: [
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.fill',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    gamma: '10.00'
                },
                {
                    lightness: '100'
                },
                {
                    weight: '0.4'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                },
                {
                    weight: '0.01'
                },
                {
                    lightness: '39'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    weight: '0.50'
                },
                {
                    gamma: '10.00'
                },
                {
                    lightness: '100'
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'water',
            elementType: 'all',
            stylers: [
                {
                    color: '#cfe5ee'
                },
                {
                    visibility: 'on'
                }
            ]
        }, 
    ];
    styles.white_blank = [
        {
            featureType: 'all',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#444444'
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [
                {
                    color: '#f2f2f2'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'all',
            stylers: [
                {
                    saturation: -100
                },
                {
                    lightness: 45
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'water',
            elementType: 'all',
            stylers: [
                {
                    color: '#e4e4e4'
                },
                {
                    visibility: 'on'
                }
            ]
        }, 
    ];
    styles.white_label = [
        {
            featureType: 'all',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [
                {
                    gamma: '3.86'
                },
                {
                    lightness: '100'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#cccccc'
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [
                {
                    color: '#f2f2f2'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'all',
            stylers: [
                {
                    saturation: -100
                },
                {
                    lightness: 45
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'labels.text',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'water',
            elementType: 'all',
            stylers: [
                {
                    color: '#e4e4e4'
                },
                {
                    visibility: 'on'
                }
            ]
        }, 
    ];
    styles.dark_blank = [
        {
            featureType: 'all',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    saturation: 36
                },
                {
                    color: '#000000'
                },
                {
                    lightness: 40
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    visibility: 'on'
                },
                {
                    color: '#000000'
                },
                {
                    lightness: 16
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 20
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 17
                },
                {
                    weight: 1.2
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 20
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 21
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 17
                },
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 29
                },
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 18
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 16
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 19
                }
            ]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 17
                }
            ]
        }, 
    ];
    styles.dark_label = [
        {
            featureType: 'all',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    saturation: 36
                },
                {
                    color: '#000000'
                },
                {
                    lightness: 40
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    visibility: 'on'
                },
                {
                    color: '#000000'
                },
                {
                    lightness: 16
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 20
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 17
                },
                {
                    weight: 1.2
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'simplified'
                },
                {
                    lightness: '-82'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    invert_lightness: true
                },
                {
                    weight: '7.15'
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 20
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 21
                }
            ]
        },
        {
            featureType: 'road',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'simplified'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 17
                },
                {
                    weight: '0.8'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 29
                },
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 18
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 16
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    weight: '0.01'
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'labels',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'all',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 19
                }
            ]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#000000'
                },
                {
                    lightness: 17
                }
            ]
        }, 
    ];
    /* eslint-enable */ function mapStyle(key) {
        return styles[key];
    }

    window.theme.allMaps = window.theme.allMaps || {};
    let allMaps = window.theme.allMaps;
    const selectors$c = {
        mapContainer: '[data-map-container]',
        style: 'data-style',
        apiKey: 'data-api-key',
        zoom: 'data-zoom',
        address: 'data-address',
        latLongCorrection: 'data-latlong-correction',
        lat: 'data-lat',
        long: 'data-long'
    };
    let Map$1 = class Map {
        initMaps() {
            const urlKey = `https://maps.googleapis.com/maps/api/js?key=${this.key}`;
            loadScript({
                url: urlKey
            }).then(()=>{
                return this.enableCorrection === 'true' && this.lat !== '' && this.long !== '' ? new window.google.maps.LatLng(this.lat, this.long) : geocodeAddressPromise(this.address);
            }).then((center)=>{
                var zoom = parseInt(this.zoomString, 10);
                const styles = mapStyle(this.styleString);
                var mapOptions = {
                    zoom,
                    styles,
                    center,
                    draggable: true,
                    clickableIcons: false,
                    scrollwheel: false,
                    zoomControl: false,
                    disableDefaultUI: true
                };
                const map = createMap(this.mapWrap, mapOptions);
                return map;
            }).then((map)=>{
                this.map = map;
                allMaps[this.id] = map;
            }).catch((e)=>{
                console.log('Failed to load Google Map');
                console.log(e);
            });
        }
        onUnload() {
            if (typeof window.google !== 'undefined') {
                window.google.maps.event.clearListeners(this.map, 'resize');
            }
        }
        constructor(section){
            this.container = section.container;
            this.mapWrap = this.container.querySelector(selectors$c.mapContainer);
            this.styleString = this.container.getAttribute(selectors$c.style) || '';
            this.key = this.container.getAttribute(selectors$c.apiKey);
            this.zoomString = this.container.getAttribute(selectors$c.zoom) || 14;
            this.address = this.container.getAttribute(selectors$c.address);
            this.enableCorrection = this.container.getAttribute(selectors$c.latLongCorrection);
            this.lat = this.container.getAttribute(selectors$c.lat);
            this.long = this.container.getAttribute(selectors$c.long);
            if (this.key) {
                this.initMaps();
            }
        }
    };
    function createMap(container, options) {
        var map = new window.google.maps.Map(container, options);
        var center = map.getCenter();
        new window.google.maps.Marker({
            map: map,
            position: center
        });
        window.google.maps.event.addDomListener(window, 'resize', function() {
            window.google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
        });
        return map;
    }
    function geocodeAddressPromise(address) {
        return new Promise((resolve, reject)=>{
            var geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({
                address: address
            }, function(results, status) {
                if (status == 'OK') {
                    var latLong = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    resolve(latLong);
                } else {
                    reject(status);
                }
            });
        });
    }
    const mapSection = {
        onLoad () {
            allMaps[this.id] = new Map$1(this);
        },
        onUnload () {
            if (typeof allMaps[this.id].unload === 'function') {
                allMaps[this.id].unload();
            }
        }
    };
    register('section-map', mapSection);

    register('section-columns', [
        popupVideoSection,
        customScrollbar
    ]);

    const selectors$b = {
        dataRelatedSectionElem: '[data-related-section]',
        dataRelatedProduct: '[data-grid-item]',
        carousel: '[data-carousel]',
        dataLimit: 'data-limit',
        dataMinimum: 'data-minimum',
        dataLargeLayout: 'data-layout-desktop',
        dataMediumLayout: 'data-layout-tablet',
        dataSmallLayout: 'data-layout-mobile',
        recentlyViewed: '[data-recent-wrapper]',
        recentlyViewedWrapper: '[data-recently-viewed-wrapper]',
        productId: 'data-product-id'
    };
    let Related = class Related {
        init() {
            const relatedSection1 = this.container.querySelector(selectors$b.dataRelatedSectionElem);
            if (!relatedSection1) {
                return;
            }
            const productId = relatedSection1.getAttribute(selectors$b.productId);
            const limit = relatedSection1.getAttribute(selectors$b.dataLimit);
            const layoutLarge = relatedSection1.getAttribute(selectors$b.dataLargeLayout);
            const layoutMedium = relatedSection1.getAttribute(selectors$b.dataMediumLayout);
            const layoutSmall = relatedSection1.getAttribute(selectors$b.dataSmallLayout);
            const route = window.theme.routes.product_recommendations_url || '/recommendations/products/';
            const requestUrl = `${route}?section_id=related&limit=${limit}&product_id=${productId}`;
            axios.get(requestUrl).then((response)=>{
                const fresh = document.createElement('div');
                fresh.innerHTML = response.data;
                const inner = fresh.querySelector(selectors$b.dataRelatedSectionElem);
                if (inner.querySelector(selectors$b.dataRelatedProduct)) {
                    const innerHtml = inner.innerHTML;
                    relatedSection1.innerHTML = innerHtml;
                    relatedSection1.querySelector(selectors$b.carousel).style.setProperty('--grid-large-items', layoutLarge);
                    relatedSection1.querySelector(selectors$b.carousel).style.setProperty('--grid-medium-items', layoutMedium);
                    relatedSection1.querySelector(selectors$b.carousel).style.setProperty('--grid-small-items', layoutSmall);
                    relatedSection1.dispatchEvent(new CustomEvent('theme:related-products:added', {
                        bubbles: true
                    }));
                } else {
                    relatedSection1.dispatchEvent(new CustomEvent('theme:tabs:hide', {
                        bubbles: true
                    }));
                }
            }).catch(function(error) {
                console.warn(error);
            });
        }
        recent() {
            const recentlyViewedHolder = this.container.querySelector(selectors$b.recentlyViewed);
            const recentlyViewedWrapper = this.container.querySelector(selectors$b.recentlyViewedWrapper);
            const recentProducts1 = this.container.querySelectorAll(selectors$b.dataRelatedProduct);
            const minimumNumberProducts = recentlyViewedHolder.hasAttribute(selectors$b.dataMinimum) ? parseInt(recentlyViewedHolder.getAttribute(selectors$b.dataMinimum)) : 4;
            const checkRecentInRelated = !recentlyViewedWrapper && recentProducts1.length > 0;
            const checkRecentOutsideRelated = recentlyViewedWrapper && recentProducts1.length >= minimumNumberProducts;
            if (checkRecentInRelated || checkRecentOutsideRelated) {
                recentlyViewedHolder.dispatchEvent(new CustomEvent('theme:tabs:check', {
                    bubbles: true
                }));
            }
        }
        constructor(section){
            this.section = section;
            this.container = section.container;
            this.init();
            this.container.addEventListener('theme:recent-products:added', ()=>{
                this.recent();
            });
        }
    };
    const relatedSection = {
        onLoad () {
            this.section = new Related(this);
        }
    };
    register('related', [
        relatedSection,
        tabs$1,
        recentProducts
    ]);
    if (!customElements.get('radio-swatch')) {
        customElements.define('radio-swatch', RadioSwatch);
    }
    if (!customElements.get('product-grid-item')) {
        customElements.define('product-grid-item', ProductGridItem);
    }
    if (!customElements.get('product-grid-item-variant')) {
        customElements.define('product-grid-item-variant', ProductGridItemVariant);
    }
    if (!customElements.get('product-grid-item-image')) {
        customElements.define('product-grid-item-image', ProductGridItemImage);
    }

    const selectors$a = {
        cartNote: '[data-cart-note]'
    };
    class CartNotes {
        initInputs() {
            this.inputs.forEach((input)=>{
                input.addEventListener('input', debounce$1((function(e) {
                    const note = e.target.value.toString() || '';
                    this.saveNotes(note);
                }).bind(this), 300));
            });
        }
        saveNotes(newNote) {
            window.fetch(`${window.theme.routes.cart}/update.js`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    note: newNote
                })
            }).catch((e)=>{
                console.error(e);
            });
        }
        constructor(element){
            this.inputs = element.querySelectorAll(selectors$a.cartNote);
            this.initInputs();
        }
    }

    const getUrlString = (params, keys = [], isArray = false)=>{
        const p = Object.keys(params).map((key)=>{
            let val = params[key];
            if (Object.prototype.toString.call(val) === '[object Object]' || Array.isArray(val)) {
                if (Array.isArray(params)) {
                    keys.push('');
                } else {
                    keys.push(key);
                }
                return getUrlString(val, keys, Array.isArray(val));
            } else {
                let tKey = key;
                if (keys.length > 0) {
                    const tKeys = isArray ? keys : [
                        ...keys,
                        key
                    ];
                    tKey = tKeys.reduce((str, k)=>{
                        return str === '' ? k : `${str}[${k}]`;
                    }, '');
                }
                if (isArray) {
                    return `${tKey}[]=${val}`;
                } else {
                    return `${tKey}=${val}`;
                }
            }
        }).join('&');
        keys.pop();
        return p;
    };

    const selectors$9 = {
        html: 'html',
        submitButton: '[data-submit-shipping]',
        form: '[data-shipping-estimate-form]',
        template: '[data-response-template]',
        country: '#estimate_address_country',
        province: '#estimate_address_province',
        zip: '#estimate_address_zip',
        wrapper: '[data-response-wrapper]',
        defaultData: 'data-default-fullname',
        lang: 'lang',
        defaultData: 'data-default'
    };
    const classes$7 = {
        success: 'shipping--success',
        error: 'errors',
        disable: 'disabled'
    };
    class ShippingCalculator {
        enableButtons() {
            this.button.removeAttribute('disabled');
            this.button.classList.remove(classes$7.disable);
        }
        disableButtons() {
            this.button.setAttribute('disabled', 'disabled');
            this.button.classList.add(classes$7.disable);
        }
        render(rates) {
            if (this.template && this.ratesWrapper) {
                const rendered = Sqrl__namespace.render(this.template, rates);
                this.ratesWrapper.innerHTML = rendered;
            }
            this.enableButtons();
            this.ratesWrapper.style.removeProperty('display');
        }
        estimate(shipping_address) {
            const encodedShippingAddressData = encodeURI(getUrlString({
                shipping_address: shipping_address
            }));
            const url = `${window.theme.routes.cart}/shipping_rates.json?${encodedShippingAddressData}`;
            const instance = this;
            axios.get(url).then(function(response) {
                // handle success
                const items = instance.sanitize(response);
                instance.render(items);
                instance.enableButtons();
                instance.ratesWrapper.style.removeProperty('display');
            }).catch(function(error) {
                // handle errors
                const errors = instance.sanitizeErrors(error);
                instance.render(errors);
            });
        }
        sanitize(response) {
            const sanitized = {};
            sanitized.class = classes$7.success;
            sanitized.items = [];
            if (response.data.shipping_rates && response.data.shipping_rates.length > 0) {
                const rates = response.data.shipping_rates;
                rates.forEach((r)=>{
                    let item = {};
                    item.title = r.presentment_name;
                    item.value = themeCurrency.formatMoney(r.price, theme.moneyFormat);
                    sanitized.items.push(item);
                });
            } else {
                sanitized.items[0] = {
                    value: theme.strings.noShippingAvailable
                };
            }
            return sanitized;
        }
        sanitizeErrors(response) {
            const errors = {};
            errors.class = classes$7.error;
            errors.items = [];
            if (typeof response.data === 'object') {
                for (const [key, value] of Object.entries(response.data)){
                    let item = {};
                    item.title = key.toString();
                    item.value = value.toString();
                    errors.items.push(item);
                }
            } else {
                errors.items[0] = {
                    value: theme.strings.noShippingAvailable
                };
            }
            return errors;
        }
        init() {
            const htmlEl = document.querySelector(selectors$9.html);
            let locale = 'en';
            if (htmlEl.hasAttribute(selectors$9.lang) && htmlEl.getAttribute(selectors$9.lang) !== '') {
                locale = htmlEl.getAttribute(selectors$9.lang);
            }
            if (this.form) {
                themeAddresses.AddressForm(this.form, locale, {
                    shippingCountriesOnly: true
                });
            }
            if (this.country && this.country.hasAttribute(selectors$9.defaultData) && this.province && this.province.hasAttribute(selectors$9.defaultData)) {
                this.country.addEventListener('change', function() {
                    this.country.removeAttribute(selectors$9.defaultData);
                    this.province.removeAttribute(selectors$9.defaultData);
                });
            }
            if (this.button) {
                this.button.addEventListener('click', (function(e) {
                    e.preventDefault();
                    this.disableButtons();
                    while(this.ratesWrapper.firstChild)this.ratesWrapper.removeChild(this.ratesWrapper.firstChild);
                    this.ratesWrapper.style.display = 'none';
                    const shippingAddress = {};
                    let elemCountryVal = this.country.value;
                    let elemProvinceVal = this.province.value;
                    const elemCountryData = this.country.getAttribute(selectors$9.defaultData);
                    if (elemCountryVal === '' && elemCountryData && elemCountryData !== '') {
                        elemCountryVal = elemCountryData;
                    }
                    const elemProvinceData = this.province.getAttribute(selectors$9.defaultData);
                    if (elemProvinceVal === '' && elemProvinceData && elemProvinceData !== '') {
                        elemProvinceVal = elemProvinceData;
                    }
                    shippingAddress.zip = this.zip.value || '';
                    shippingAddress.country = elemCountryVal || '';
                    shippingAddress.province = elemProvinceVal || '';
                    this.estimate(shippingAddress);
                }).bind(this));
            }
        }
        constructor(section){
            this.button = section.container.querySelector(selectors$9.submitButton);
            this.template = section.container.querySelector(selectors$9.template).innerHTML;
            this.ratesWrapper = section.container.querySelector(selectors$9.wrapper);
            this.form = section.container.querySelector(selectors$9.form);
            this.country = section.container.querySelector(selectors$9.country);
            this.province = section.container.querySelector(selectors$9.province);
            this.zip = section.container.querySelector(selectors$9.zip);
            this.init();
        }
    }

    const selectors$8 = {
        cartMessage: '[data-cart-message]',
        cartMessageValue: 'data-cart-message',
        leftToSpend: '[data-left-to-spend]',
        cartProgress: '[data-cart-progress]',
        limit: 'data-limit',
        percent: 'data-percent'
    };
    const classes$6 = {
        isHidden: 'is-hidden',
        isSuccess: 'is-success'
    };
    let CartShippingMessage = class CartShippingMessage {
        init() {
            this.cartFreeLimitShipping = Number(this.cartMessage[0].getAttribute(selectors$8.limit)) * 100 * this.rate;
            this.shippingAmount = 0;
            this.circumference = 28 * Math.PI; // radius - stroke * 4 * PI
            this.exchangeRateConversions(this.cartFreeLimitShipping, this.shippingAmount);
            this.cartBarProgress();
            this.listen();
        }
        listen() {
            document.addEventListener('theme:cart:change', (function(event) {
                this.cart = event.detail.cart;
                this.render();
            }).bind(this));
        }
        render() {
            const totalPrice = this.cart.total_price;
            this.freeShippingMessageHandle(totalPrice);
            if (this.cart && this.cart.total_price) {
                // Build cart again if the quantity of the changed product is 0 or cart discounts are changed
                if (this.cartMessage.length > 0) {
                    this.shippingAmount = totalPrice;
                    this.updateProgress();
                }
            }
        }
        freeShippingMessageHandle(total) {
            if (this.cartMessage.length > 0) {
                this.container.querySelectorAll(selectors$8.cartMessage).forEach((message)=>{
                    const hasFreeShipping = message.hasAttribute(selectors$8.cartMessageValue) && message.getAttribute(selectors$8.cartMessageValue) === 'true' && total >= this.cartFreeLimitShipping && total !== 0;
                    message.classList.toggle(classes$6.isSuccess, hasFreeShipping);
                });
            }
        }
        cartBarProgress(progress = null) {
            this.container.querySelectorAll(selectors$8.cartProgress).forEach((element)=>{
                this.setProgress(element, progress === null ? element.getAttribute(selectors$8.percent) : progress);
            });
        }
        setProgress(holder, percent) {
            const offset = this.circumference - percent / 100 * this.circumference / 2;
            holder.style.strokeDashoffset = offset;
        }
        updateProgress() {
            const newPercentValue = this.shippingAmount / this.cartFreeLimitShipping * 100;
            this.exchangeRateConversions(this.cartFreeLimitShipping, this.shippingAmount);
            this.cartBarProgress(newPercentValue > 100 ? 100 : newPercentValue);
        }
        exchangeRateConversions(cartFreeLimitShipping, shippingAmount) {
            const leftToSpend = theme.settings.currency_code_enable ? themeCurrency.formatMoney(cartFreeLimitShipping - shippingAmount, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(cartFreeLimitShipping - shippingAmount, theme.moneyFormat);
            this.container.querySelectorAll(selectors$8.leftToSpend).forEach((element)=>{
                element.innerHTML = leftToSpend.replace('.00', '');
            });
        }
        constructor(section){
            this.container = section;
            this.cartMessage = this.container.querySelectorAll(selectors$8.cartMessage);
            this.rate = window.Shopify.currency.rate;
            if (this.cartMessage.length > 0) {
                this.init();
            }
        }
    };

    const selectors$7 = {
        drawer: '[data-drawer="drawer-cart"]',
        shipping: '[data-shipping-estimate-form]',
        loader: '[data-cart-loading]',
        form: '[data-cart-form]',
        emptystate: '[data-cart-empty]',
        progress: '[data-cart-progress]',
        items: '[data-line-items]',
        subtotal: '[data-cart-subtotal]',
        bottom: '[data-cart-bottom]',
        quantity: '[data-quantity-selector]',
        errors: '[data-form-errors]',
        item: '[data-cart-item]',
        finalPrice: '[data-cart-final]',
        key: 'data-update-cart',
        remove: 'data-remove-key',
        pageUpsellWrapper: '[data-cart-page-upsell-wrapper]',
        cartPage: '[data-section-type="cart"]',
        bar: '[data-cart-bar]',
        ship: '[data-cart-message]',
        itemLoadbar: '[data-item-loadbar]',
        cartMessageContainer: '[data-cart-message-container]',
        apiContent: '[data-api-content]'
    };
    const classes$5 = {
        hidden: 'cart--hidden',
        loading: 'cart--loading'
    };
    let CartItems = class CartItems {
        listen() {
            document.addEventListener('theme:cart:change', (function(event) {
                this.cart = event.detail.cart;
                this.stale = true;
            }).bind(this));
            document.addEventListener('theme:cart:init', (function() {
                this.init();
            }).bind(this));
            document.addEventListener('theme:cart:reload', (function() {
                this.stale = true;
                if (this.cart) {
                    this.loadHTML();
                } else {
                    this.init().then(()=>this.loadHTML()
                    );
                }
            }).bind(this));
            if (this.drawer) {
                this.drawer.addEventListener('theme:drawer:open', (function() {
                    if (this.cart) {
                        this.loadHTML();
                    } else {
                        this.init().then(()=>this.loadHTML()
                        );
                    }
                    // tell the add to cart whether to open a popdown
                    window.theme.state.cartOpen = true;
                }).bind(this));
                this.drawer.addEventListener('theme:drawer:close', function() {
                    window.theme.state.cartOpen = false;
                });
            }
            new CartNotes(this.container);
            new CartShippingMessage(this.container);
        }
        init() {
            return window.fetch(`${window.theme.routes.cart}.js`).then(this.handleErrors).then((response)=>{
                return response.json();
            }).then((response)=>{
                this.cart = response;
                this.fireChange(response);
                return response;
            }).catch((e)=>{
                console.error(e);
            });
        }
        loadHTML(plain = false) {
            if (this.stale) {
                if (this.cart && this.cart.item_count > 0) {
                    this.loadForm(plain);
                } else {
                    this.showEmpty();
                    this.cartMessages.forEach((message)=>{
                        new CartShippingMessage(message);
                    });
                }
            }
            this.stale = false;
        }
        initInputs() {
            this.inputs = this.container.querySelectorAll(`[${selectors$7.key}]`);
            this.inputs.forEach((input)=>{
                const key = input.getAttribute(selectors$7.key);
                input.addEventListener('change', (function(e) {
                    const quantity = parseInt(e.target.value, 10);
                    this.latestClick = e.target.closest(selectors$7.item);
                    this.lockState();
                    this.updateCart(key, quantity);
                }).bind(this));
            });
        }
        initRemove() {
            this.removers = this.container.querySelectorAll(`[${selectors$7.remove}]`);
            this.removers.forEach((remover)=>{
                const key = remover.getAttribute(selectors$7.remove);
                remover.addEventListener('click', (function(e) {
                    e.preventDefault();
                    this.latestClick = e.target.closest(selectors$7.item);
                    this.lockState();
                    this.updateCart(key, 0);
                }).bind(this));
            });
        }
        lockState() {
            this.latestClick.querySelector(selectors$7.itemLoadbar).style.display = 'block';
            this.loader.classList.add(classes$5.loading);
        }
        updateCart(clickedKey, newQuantity) {
            window.fetch(`${window.theme.routes.cart}/change.js`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: clickedKey,
                    quantity: newQuantity
                })
            }).then(this.handleErrors).then((response)=>{
                return response.json();
            }).then((response)=>{
                this.cart = response;
                slideUp(this.errors);
                this.fireChange(response);
                this.stale = true;
                this.loadHTML();
            }).catch((e)=>{
                if (e instanceof FetchError) {
                    var ref, ref1;
                    let defaultMessage = window.theme.strings.stockout || 'Could not update cart, please reload';
                    let messageText = ((ref = e.json) === null || ref === void 0 ? void 0 : ref.message) || e.message || defaultMessage;
                    let descriptionText = ((ref1 = e.json) === null || ref1 === void 0 ? void 0 : ref1.description) || '';
                    // Low stock erros have the same text content for heading and description
                    let contentToShow = messageText === descriptionText ? `<p>${messageText}</p>` : `<p>${messageText}</p> <p>${descriptionText}</p>`;
                    this.showError(contentToShow);
                    this.loadForm(); // Reset form for cases like "stockout"
                } else {
                    let error = `<p>${e.message || defaultMessage}</p>`;
                    this.showError(error);
                    throw e;
                }
            });
        }
        fireChange(newCart) {
            document.dispatchEvent(new CustomEvent('theme:cart:change', {
                detail: {
                    cart: newCart
                },
                bubbles: true
            }));
        }
        updateTotal() {
            if (this.cart && this.cart.total_price != undefined) {
                const price = themeCurrency.formatMoney(this.cart.total_price, theme.moneyFormat);
                this.finalPrice.innerHTML = price + ` ${theme.currencyCode}`;
            }
            if (this.subtotal && this.cart) {
                window.fetch(`${window.theme.routes.root_url}?section_id=api-cart-subtotal`).then(this.handleErrors).then((response)=>{
                    return response.text();
                }).then((response)=>{
                    const fresh = document.createElement('div');
                    fresh.innerHTML = response;
                    this.subtotal.innerHTML = fresh.querySelector(selectors$7.apiContent).innerHTML;
                });
            }
        }
        showError(message) {
            slideUp(this.errors);
            this.errors.innerHTML = message;
            window.setTimeout(()=>{
                slideDown(this.errors);
            }, 600);
        }
        loadForm(plain = false) {
            if (plain) {
                this.showForm();
                this.initQuantity();
                this.initQuickview();
                this.updateTotal();
                return;
            }
            window.fetch(`${window.theme.routes.root_url}?section_id=api-cart-items`).then(this.handleErrors).then((response)=>{
                return response.text();
            }).then((response)=>{
                const fresh = document.createElement('div');
                fresh.innerHTML = response;
                this.items.innerHTML = fresh.querySelector(selectors$7.apiContent).innerHTML;
                this.showForm();
                this.initQuantity();
                this.initQuickview();
                this.updateTotal();
            });
        }
        initQuickview() {
            const pageUpsellWrapper = this.items.querySelector(selectors$7.pageUpsellWrapper);
            const oldPageUpsellWrapper = this.bottom.querySelector(selectors$7.pageUpsellWrapper);
            if (oldPageUpsellWrapper) {
                oldPageUpsellWrapper.remove();
            }
            // Move the upsell to the bottom of the cart beside the checkout button
            if (this.cartPage && pageUpsellWrapper) {
                this.bottom.insertBefore(pageUpsellWrapper, this.bottom.firstChild);
                Alpine.initTree(this.bottom); // Neccesary since we're moving the element around and Alpine isn't able to keep track of tha
            }
        }
        initQuantity() {
            initQtySection(this.container);
            this.initInputs();
            this.initRemove();
        }
        showForm() {
            if (this.bar) {
                this.bar.classList.remove(classes$5.hidden);
            }
            if (this.ship) {
                this.ship.classList.remove(classes$5.hidden);
            }
            if (this.progress) {
                this.progress.classList.remove(classes$5.hidden);
            }
            this.form.classList.remove(classes$5.hidden);
            this.bottom.classList.remove(classes$5.hidden);
            this.loader.classList.remove(classes$5.loading);
            this.emptystate.classList.add(classes$5.hidden);
        }
        showEmpty() {
            if (this.bar) {
                this.bar.classList.add(classes$5.hidden);
            }
            if (this.ship) {
                this.ship.classList.add(classes$5.hidden);
            }
            if (this.progress) {
                this.progress.classList.add(classes$5.hidden);
            }
            this.emptystate.classList.remove(classes$5.hidden);
            this.loader.classList.remove(classes$5.loading);
            this.form.classList.add(classes$5.hidden);
            this.bottom.classList.add(classes$5.hidden);
        }
        handleErrors(response) {
            if (!response.ok) {
                return response.json().then(function(json) {
                    const e = new FetchError({
                        status: response.statusText,
                        headers: response.headers,
                        json: json
                    });
                    throw e;
                });
            }
            return response;
        }
        constructor(section){
            this.section = section;
            this.container = section.container;
            this.cartMessages = document.querySelectorAll(selectors$7.cartMessageContainer);
            this.bar = this.container.querySelector(selectors$7.bar);
            this.ship = this.container.querySelector(selectors$7.ship);
            this.drawer = this.container.querySelector(selectors$7.drawer);
            this.form = this.container.querySelector(selectors$7.form);
            this.loader = this.container.querySelector(selectors$7.loader);
            this.bottom = this.container.querySelector(selectors$7.bottom);
            this.items = this.container.querySelector(selectors$7.items);
            this.subtotal = this.container.querySelector(selectors$7.subtotal);
            this.errors = this.container.querySelector(selectors$7.errors);
            this.finalPrice = this.container.querySelector(selectors$7.finalPrice);
            this.emptystate = this.container.querySelector(selectors$7.emptystate);
            this.progress = this.container.querySelector(selectors$7.progress);
            this.latestClick = null;
            this.cart = null;
            this.stale = true;
            this.cartPage = document.querySelector(selectors$7.cartPage);
            this.listen();
        }
    };
    const cartDrawer = {
        onLoad () {
            const isDrawerCart = document.querySelector(selectors$7.drawer);
            if (isDrawerCart) {
                this.cart = new CartItems(this);
            }
            const hasShipping = this.container.querySelector(selectors$7.shipping);
            if (hasShipping) {
                new ShippingCalculator(this);
            }
        },
        onUnload: function() {
            if (this.cart && typeof this.cart.unload === 'function') {
                this.cart.unload();
            }
        }
    };

    const selectors$6 = {
        ajaxDisable: 'data-ajax-disable',
        shipping: '[data-shipping-estimate-form]',
        input: '[data-update-cart]',
        update: '[data-update-button]',
        bottom: '[data-cart-bottom]',
        upsellWrapper: '[data-cart-page-upsell-wrapper]'
    };
    const classes$4 = {
        dirty: 'cart--dirty',
        heartBeat: 'heart-beat'
    };
    const cartSection = {
        onLoad () {
            const hasShipping = this.container.querySelector(selectors$6.shipping);
            if (hasShipping) {
                new ShippingCalculator(this);
            }
            this.disabled = this.container.getAttribute(selectors$6.ajaxDisable) == 'true';
            if (this.disabled) {
                this.cart = new AjaxDisabledCart(this);
                return;
            }
            this.cart = new CartItems(this);
            const initPromise = this.cart.init();
            initPromise.then(()=>{
                this.cart.loadHTML(true);
            });
        }
    };
    let AjaxDisabledCart = class AjaxDisabledCart {
        initQuantity() {
            initQtySection(this.container);
        }
        moveUpsell() {
            const bottom = this.container.querySelector(selectors$6.bottom);
            bottom.insertBefore(this.upsellWrapper, bottom.firstChild);
        }
        initInputs() {
            this.inputs.forEach((input)=>{
                input.addEventListener('change', (function() {
                    this.updateBtn.classList.add(classes$4.dirty);
                    this.updateBtn.classList.add(classes$4.heartBeat);
                    setTimeout((function() {
                        this.updateBtn.classList.remove(classes$4.heartBeat);
                    }).bind(this), 1300);
                }).bind(this));
            });
        }
        constructor(section){
            window.theme.state.cartOpen = true;
            this.section = section;
            this.container = section.container;
            this.inputs = this.container.querySelectorAll(selectors$6.input);
            this.quantityWrappers = this.container.querySelectorAll(selectors$6.qty);
            this.updateBtn = this.container.querySelector(selectors$6.update);
            this.upsellWrapper = this.container.querySelector(selectors$6.upsellWrapper);
            this.initQuantity();
            this.initInputs();
            if (this.upsellWrapper) {
                this.moveUpsell();
            }
            document.addEventListener('theme:cart:reload', (function() {
                window.location.reload();
            }).bind(this));
        }
    };
    register('cart', [
        cartSection,
        accordion
    ]);

    register('cart-drawer', [
        drawer,
        cartDrawer,
        accordion
    ]);

    register('accordion-single', accordion);

    const fadeIn = (el, display, callback = null)=>{
        el.style.opacity = 0;
        el.style.display = 'block';
        (function fade() {
            let val = parseFloat(el.style.opacity);
            if (!((val += 0.1) > 1)) {
                el.style.opacity = val;
                requestAnimationFrame(fade);
            }
            if (val === 1 && typeof callback === 'function') {
                callback();
            }
        })();
    };

    const fadeOut = (el, callback = null)=>{
        el.style.opacity = 1;
        (function fade() {
            if ((el.style.opacity -= 0.1) < 0) {
                el.style.display = 'none';
            } else {
                requestAnimationFrame(fade);
            }
            if (parseFloat(el.style.opacity) === 0 && typeof callback === 'function') {
                callback();
            }
        })();
    };

    const selectors$5 = {
        tracking: '[data-tracking-consent]',
        trackingAccept: '[data-confirm-cookies]',
        close: '[data-close-modal]',
        popupInner: '[data-popup-inner]',
        newsletterPopup: '[data-newsletter]',
        newsletterPopupHolder: '[data-newsletter-holder]',
        newsletterField: '[data-newsletter-field]',
        newsletterForm: '[data-newsletter-form]',
        promoPopup: '[data-promo-text]',
        delayAttribite: 'data-popup-delay',
        cookieNameAttribute: 'data-cookie-name',
        dataTargetReferrer: 'data-target-referrer'
    };
    const classes$3 = {
        hide: 'hide',
        hasValue: 'has-value',
        success: 'has-success',
        error: 'has-error',
        desktop: 'desktop',
        mobile: 'mobile'
    };
    let sections$1 = {};
    let PopupCookie = class PopupCookie {
        write() {
            const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row)=>row.startsWith(this.name)
            );
            if (hasCookie || document.cookie.indexOf('; ') === -1) {
                document.cookie = `${this.name}=${this.value}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
            }
        }
        read() {
            if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row)=>row.startsWith(this.name)
            )) {
                const returnCookie = document.cookie.split('; ').find((row)=>row.startsWith(this.name)
                ).split('=')[1];
                return returnCookie;
            } else return false;
        }
        destroy() {
            if (document.cookie.split('; ').find((row)=>row.startsWith(this.name)
            )) {
                document.cookie = `${this.name}=null; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
            }
        }
        constructor(name, value){
            this.configuration = {
                expires: null,
                path: '/',
                domain: window.location.hostname
            };
            this.name = name;
            this.value = value;
        }
    };
    let DelayShow = class DelayShow {
        hide() {
            this.show = false;
        }
        always() {
            if (this.show) {
                fadeIn(this.element);
            }
        }
        delayed() {
            // Show popup after 10s
            setTimeout(()=>{
                this.always();
            }, 10000);
        }
        // Scroll to the bottom of the page
        bottom() {
            let raf;
            const onScroll = ()=>{
                if (raf) {
                    window.cancelAnimationFrame(raf);
                }
                raf = window.requestAnimationFrame(()=>{
                    window.requestIdleCallback(()=>{
                        if (Math.round(window.scrollY + window.innerHeight) >= Math.round(document.body.clientHeight)) {
                            this.always();
                            window.removeEventListener('scroll', onScroll, {
                                passive: true
                            });
                        }
                    }, {
                        timeout: 300
                    });
                });
            };
            window.addEventListener('scroll', onScroll, {
                passive: true
            });
        }
        onScroll() {}
        // Idle for 1 min
        idle() {
            let timer = 0;
            let idleTime = 60000;
            const documentEvents = [
                'mousemove',
                'mousedown',
                'click',
                'touchmove',
                'touchstart',
                'touchend',
                'keydown',
                'keypress'
            ];
            const windowEvents = [
                'load',
                'resize',
                'scroll'
            ];
            const startTimer = ()=>{
                timer = setTimeout(()=>{
                    timer = 0;
                    this.always();
                }, idleTime);
                documentEvents.forEach((eventType)=>{
                    document.addEventListener(eventType, resetTimer);
                });
                windowEvents.forEach((eventType)=>{
                    window.addEventListener(eventType, resetTimer);
                });
            };
            const resetTimer = ()=>{
                if (timer) {
                    clearTimeout(timer);
                }
                documentEvents.forEach((eventType)=>{
                    document.removeEventListener(eventType, resetTimer);
                });
                windowEvents.forEach((eventType)=>{
                    window.removeEventListener(eventType, resetTimer);
                });
                startTimer();
            };
            startTimer();
        }
        constructor(holder, element){
            this.show = true;
            this.element = element;
            this.delay = holder.getAttribute(selectors$5.delayAttribite);
            if (this.delay === 'always') {
                this.always();
            }
            if (this.delay === 'delayed') {
                this.delayed();
            }
            if (this.delay === 'bottom') {
                this.bottom();
            }
            if (this.delay === 'idle') {
                this.idle();
            }
        }
    };
    let TargetReferrer = class TargetReferrer {
        init() {
            if (this.locationPath.indexOf(this.el.getAttribute(selectors$5.dataTargetReferrer)) === -1 && !window.Shopify.designMode) {
                this.el.parentNode.removeChild(this.el);
            }
        }
        constructor(el){
            this.el = el;
            this.locationPath = location.href;
            if (!this.el.hasAttribute(selectors$5.dataTargetReferrer)) {
                return;
            }
            this.init();
        }
    };
    let Tracking = class Tracking {
        init() {
            if (this.showPopup) {
                fadeIn(this.modalInner);
            }
            this.clickEvents();
        }
        clickEvents() {
            this.close.addEventListener('click', (event)=>{
                event.preventDefault();
                window.Shopify.customerPrivacy.setTrackingConsent(false, ()=>fadeOut(this.modalInner)
                );
            });
            this.acceptButton.addEventListener('click', (event)=>{
                event.preventDefault();
                window.Shopify.customerPrivacy.setTrackingConsent(true, ()=>fadeOut(this.modalInner)
                );
            });
            document.addEventListener('trackingConsentAccepted', function() {
                console.log('trackingConsentAccepted event fired');
            });
        }
        onBlockSelect(evt) {
            if (this.popup.contains(evt.target) && this.showPopup) {
                fadeIn(this.modalInner);
            }
        }
        onBlockDeselect(evt) {
            if (this.popup.contains(evt.target)) {
                fadeOut(this.modalInner);
            }
        }
        constructor(el){
            this.popup = el;
            this.modal = document.querySelector(selectors$5.tracking);
            this.modalInner = this.popup.querySelector(selectors$5.popupInner);
            this.close = this.modal.querySelector(selectors$5.close);
            this.acceptButton = this.modal.querySelector(selectors$5.trackingAccept);
            this.enable = this.modal.getAttribute('data-enable') === 'true';
            this.showPopup = false;
            window.Shopify.loadFeatures([
                {
                    name: 'consent-tracking-api',
                    version: '0.1'
                }, 
            ], (error)=>{
                if (error) {
                    throw error;
                }
                const userCanBeTracked = window.Shopify.customerPrivacy.userCanBeTracked();
                const userTrackingConsent = window.Shopify.customerPrivacy.getTrackingConsent();
                this.showPopup = !userCanBeTracked && userTrackingConsent === 'no_interaction' && this.enable;
                if (window.Shopify.designMode) {
                    this.showPopup = true;
                }
                this.init();
            });
        }
    };
    let PromoText = class PromoText {
        init() {
            const cookieExists = this.cookie.read() !== false;
            if (!cookieExists || window.Shopify.designMode) {
                if (!window.Shopify.designMode) {
                    new DelayShow(this.popup, this.popupInner);
                } else {
                    fadeIn(this.popupInner);
                }
                this.clickEvents();
            }
        }
        clickEvents() {
            this.close.addEventListener('click', (event)=>{
                event.preventDefault();
                fadeOut(this.popupInner);
                this.cookie.write();
            });
        }
        onBlockSelect(evt) {
            if (this.popup.classList.contains(classes$3.mobile)) {
                this.hasDeviceClass = classes$3.mobile;
            }
            if (this.popup.classList.contains(classes$3.desktop)) {
                this.hasDeviceClass = classes$3.desktop;
            }
            if (this.hasDeviceClass !== '') {
                this.popup.classList.remove(this.hasDeviceClass);
            }
            if (this.popup.contains(evt.target)) {
                fadeIn(this.popupInner);
            }
        }
        onBlockDeselect(evt) {
            if (this.popup.contains(evt.target)) {
                fadeOut(this.popupInner);
            }
            if (this.hasDeviceClass !== '') {
                this.popup.classList.add(this.hasDeviceClass);
            }
        }
        constructor(el){
            this.popup = el;
            this.popupInner = this.popup.querySelector(selectors$5.popupInner);
            this.close = this.popup.querySelector(selectors$5.close);
            this.cookie = new PopupCookie(this.popup.getAttribute(selectors$5.cookieNameAttribute), 'user_has_closed');
            this.isTargeted = new TargetReferrer(this.popup);
            this.hasDeviceClass = '';
            this.init();
        }
    };
    let NewsletterPopup = class NewsletterPopup {
        init() {
            const cookieExists = this.cookie.read() !== false;
            if (!cookieExists || window.Shopify.designMode) {
                this.show();
                this.checkForSuccess();
            }
        }
        show() {
            if (!window.Shopify.designMode) {
                this.delayShow = new DelayShow(this.popup, this.popupInner);
            } else {
                fadeIn(this.popupInner);
            }
            this.inputField();
            this.closePopup();
        }
        preventDelayShow() {
            //prevent delay show from showing the popup after close
            if (this.delayShow) {
                this.delayShow.hide();
            }
        }
        checkForSuccess() {
            //check for success or error message to show the form without delay
            const hasError = this.form.classList.contains(classes$3.error);
            const hasSuccess = this.form.classList.contains(classes$3.success);
            if (hasSuccess || hasError) {
                fadeIn(this.popupInner);
                this.preventDelayShow();
                //write cookie if has success
                if (hasSuccess) {
                    this.cookie.write();
                }
            }
        }
        closePopup() {
            this.close.addEventListener('click', (event)=>{
                event.preventDefault();
                fadeOut(this.popupInner);
                this.cookie.write();
                this.preventDelayShow();
            });
        }
        inputField() {
            this.newsletterField.addEventListener('input', ()=>{
                if (this.newsletterField.value !== '') {
                    this.holder.classList.add(classes$3.hasValue, this.newsletterField.value !== '');
                }
            });
            this.newsletterField.addEventListener('focus', ()=>{
                if (this.newsletterField.value !== '') {
                    this.holder.classList.add(classes$3.hasValue, this.newsletterField.value !== '');
                }
            });
            this.newsletterField.addEventListener('focusout', ()=>{
                setTimeout(()=>{
                    this.holder.classList.remove(classes$3.hasValue);
                }, 2000);
            });
        }
        onBlockSelect(evt) {
            if (this.popup.contains(evt.target)) {
                fadeIn(this.popupInner);
            }
        }
        onBlockDeselect(evt) {
            if (this.popup.contains(evt.target)) {
                fadeOut(this.popupInner);
            }
        }
        constructor(el){
            this.popup = el;
            this.popupInner = this.popup.querySelector(selectors$5.popupInner);
            this.holder = this.popup.querySelector(selectors$5.newsletterPopupHolder);
            this.close = this.popup.querySelector(selectors$5.close);
            this.newsletterField = this.popup.querySelector(selectors$5.newsletterField);
            this.cookie = new PopupCookie(this.popup.getAttribute(selectors$5.cookieNameAttribute), 'newsletter_is_closed');
            this.form = this.popup.querySelector(selectors$5.newsletterForm);
            this.isTargeted = new TargetReferrer(this.popup);
            this.delayShow = null;
            this.init();
        }
    };
    const popupSection = {
        onLoad () {
            sections$1[this.id] = [];
            const tracking = this.container.querySelectorAll(selectors$5.tracking);
            tracking.forEach((el)=>{
                sections$1[this.id].push(new Tracking(el));
            });
            const newsletterPopup = this.container.querySelectorAll(selectors$5.newsletterPopup);
            newsletterPopup.forEach((el)=>{
                sections$1[this.id].push(new NewsletterPopup(el));
            });
            const promoPopup = this.container.querySelectorAll(selectors$5.promoPopup);
            promoPopup.forEach((el)=>{
                sections$1[this.id].push(new PromoText(el));
            });
        },
        onBlockSelect (evt) {
            sections$1[this.id].forEach((el)=>{
                if (typeof el.onBlockSelect === 'function') {
                    el.onBlockSelect(evt);
                }
            });
        },
        onBlockDeselect (evt) {
            sections$1[this.id].forEach((el)=>{
                if (typeof el.onBlockDeselect === 'function') {
                    el.onBlockDeselect(evt);
                }
            });
        }
    };
    register('popups', [
        newsletterCheckForResultSection,
        popupSection
    ]);

    const selectors$4 = {
        dot: 'data-look-dot',
        productsHolder: 'data-products-holder',
        slider: '[data-carousel]',
        buttonClose: '[data-button-close-holder]',
        slideIndex: 'data-carousel-index',
        blockId: 'data-block-id',
        focusable: 'button'
    };
    const classes$2 = {
        active: 'is-active',
        expand: 'is-expanded'
    };
    const sections = {};
    let Look = class Look {
        init() {
            this.keyEvents = (e)=>this.keyboardEventShowProductHolder(e)
            ;
            this.keyCloseEvent = (e)=>this.hideProductsHolder(e)
            ;
            this.clickEventsDot = (e)=>this.clickEventShowProductsHolder(e)
            ;
            this.clickEventToClose = (e)=>this.clickEventCloseProductsHolder(e)
            ;
            this.toggleOnResize = (e)=>debounce$1(this.onResize(e), 200)
            ;
            this.initSlider();
            this.addEvents();
        }
        /**
       * Init slider and add event for select slide
       */ initSlider() {
            if (!this.slider) {
                return;
            }
            this.carousel = Flickity.data(this.slider);
            this.carousel.options.wrapAround = true;
            this.carousel.options.freeScroll = false;
            this.carousel.resize();
            this.carousel.on('change', (index)=>{
                this.currentDot = this.container.querySelector(`[${selectors$4.dot}="${index}"]`);
                this.currentDot.classList.add(classes$2.active);
                this.removeClassOnSiblingDots();
            });
        }
        /**
       * Add events
       */ addEvents() {
            this.dots.forEach((dot)=>{
                dot.addEventListener('click', this.clickEventsDot);
                dot.addEventListener('keyup', this.keyEvents);
            });
            document.addEventListener('keyup', this.keyCloseEvent);
            document.addEventListener('theme:resize', this.toggleOnResize);
            if (this.buttonClose) {
                this.buttonClose.addEventListener('click', this.clickEventToClose);
            }
        }
        /**
       * Show products holder
       */ showProductsHolder() {
            const selectCellAnimate = !this.productsHolder.classList.contains(classes$2.expand);
            this.currentDot.classList.toggle(classes$2.active);
            this.productsHolder.classList.toggle(classes$2.expand, this.currentDot.classList.contains(classes$2.active));
            if (isMobile()) {
                this.productsHolder.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                    bubbles: true
                }));
            }
            if (this.currentDot.classList.contains(classes$2.active)) {
                this.hasDefaultOpen = true;
                this.carousel.selectCell(Number(this.currentDot.getAttribute(selectors$4.dot)), true, selectCellAnimate);
            }
            this.removeClassOnSiblingDots();
        }
        /**
       * Hide products holder on keypress button 'escape'
       * @param {Object} e
       * @returns
       */ hideProductsHolder(e) {
            if (e.code !== 'Escape') {
                return;
            }
            this.removeClasses();
            removeTrapFocus();
            this.currentDot.focus();
        }
        /**
       * Remove classes on productsHolder and currentDot
       */ removeClasses() {
            this.productsHolder.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                bubbles: true
            }));
            this.productsHolder.classList.remove(classes$2.expand);
            this.currentDot.classList.remove(classes$2.active);
            this.hasDefaultOpen = false;
        }
        /**
       * Click event method for show products holder
       * @param {Object} e
       */ clickEventShowProductsHolder(e) {
            this.currentDot = e.currentTarget;
            this.showProductsHolder();
        }
        /**
       * Click event method for hide products holder
       */ clickEventCloseProductsHolder() {
            this.removeClasses();
        }
        /**
       * Keyboard event method for show products holder and active trapfocus
       * @param {Object} e
       * @returns
       */ keyboardEventShowProductHolder(e) {
            if (e.code !== 'Enter' && e.code !== 'Space') {
                return;
            }
            setTimeout(()=>{
                const firstFocus = this.productsHolder.querySelector(selectors$4.focusable);
                trapFocus(this.productsHolder, {
                    elementToFocus: firstFocus
                });
            }, 400);
        }
        /**
       * Hide default expanded for mobile devices and show if exists for larger devices
       */ onResize() {
            if (this.currentDot) {
                if (window.innerWidth < window.theme.sizes.medium) {
                    this.removeClasses();
                } else if (this.hasDefaultOpen) {
                    this.currentDot.classList.add(classes$2.active);
                    this.productsHolder.classList.add(classes$2.expand);
                }
            }
        }
        /**
       * Remove events
       */ removeEvents() {
            this.dots.forEach((dot)=>{
                dot.removeEventListener('click', this.clickEventsDot);
                dot.removeEventListener('keyup', this.keyEvents);
            });
            document.removeEventListener('keyup', this.keyCloseEvent);
            document.removeEventListener('theme:resize', this.toggleOnResize);
            if (this.buttonClose) {
                this.buttonClose.removeEventListener('click', this.clickEventToClose);
            }
        }
        /**
       * Remove active class on sibling dots
       */ removeClassOnSiblingDots() {
            for (let sibling of this.currentDot.parentNode.children){
                if (sibling !== this.currentDot) {
                    sibling.classList.remove(classes$2.active);
                }
            }
        }
        onUnload() {
            if (this.slider && this.carousel) {
                this.carousel.destroy();
            }
            this.removeEvents();
        }
        onBlockSelect(e) {
            if (this.slider && this.carousel) {
                const slide = this.container.querySelector(`[${selectors$4.blockId}="${e.detail.blockId}"]`);
                this.productsHolder.classList.add(classes$2.expand);
                this.carousel.selectCell(Number(slide.getAttribute(selectors$4.slideIndex)), true, true);
            }
        }
        onBlockDeselect() {
            if (window.innerWidth < window.theme.sizes.medium) {
                this.productsHolder.classList.remove(classes$2.expand);
                this.currentDot.classList.remove(classes$2.active);
            }
        }
        constructor(section){
            this.section = section;
            this.container = this.section.container;
            this.dots = this.container.querySelectorAll(`[${selectors$4.dot}]`);
            this.productsHolder = this.container.querySelector(`[${selectors$4.productsHolder}]`);
            this.slider = this.container.querySelector(selectors$4.slider);
            this.buttonClose = this.container.querySelector(selectors$4.buttonClose);
            this.currentDot = this.container.querySelector(`[${selectors$4.dot}].${classes$2.active}`);
            this.hasDefaultOpen = Boolean(this.currentDot);
            this.init();
        }
    };
    const lookSection = {
        onLoad () {
            sections[this.id] = [];
            sections[this.id].push(new Look(this));
        },
        onUnload () {
            sections[this.id].forEach((el)=>{
                if (typeof el.onUnload === 'function') {
                    el.onUnload();
                }
            });
        },
        onBlockSelect (e) {
            sections[this.id].forEach((el)=>{
                if (typeof el.onBlockSelect === 'function') {
                    el.onBlockSelect(e);
                }
            });
        },
        onBlockDeselect (e) {
            sections[this.id].forEach((el)=>{
                if (typeof el.onBlockDeselect === 'function') {
                    el.onBlockDeselect(e);
                }
            });
        }
    };
    register('look', [
        lookSection
    ]);

    const wrap$1 = (toWrap, wrapperClass = '', wrapper)=>{
        wrapper = wrapper || document.createElement('div');
        wrapper.classList.add(wrapperClass);
        toWrap.parentNode.insertBefore(wrapper, toWrap);
        return wrapper.appendChild(toWrap);
    };

    // Animate on scroll
    if (window.theme.settings.animate_scroll) {
        AOS.init({
            once: true
        });
    }
    document.addEventListener('DOMContentLoaded', function() {
        // Detect menu height early to prevent CLS
        const menuEl = document.querySelector('[data-header-height]');
        if (menuEl) {
            const menuHeight = menuEl.clientHeight || 0;
            document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
        }
        // Load all registered sections on the page.
        load('*');
        // Animate on hover
        if (window.theme.settings.animate_hover) {
            document.body.classList.add('theme-animate-hover');
        }
        // Target tables to make them scrollable
        const tableSelectors = '.rte table';
        const tables = document.querySelectorAll(tableSelectors);
        tables.forEach((table)=>{
            wrap$1(table, 'rte__table-wrapper');
        });
        // Target iframes to make them responsive
        const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"], .rte iframe#admin_bar_iframe';
        const frames = document.querySelectorAll(iframeSelectors);
        frames.forEach((frame)=>{
            wrap$1(frame, 'rte__video-wrapper');
        });
        document.addEventListener('mousedown', ()=>{
            document.body.classList.remove('focus-enabled');
        });
        document.addEventListener('keyup', (event)=>{
            if (event.code === 'Tab') {
                document.body.classList.add('focus-enabled');
            }
        });
        // Apply a specific class to the html element for browser support of cookies.
        if (window.navigator.cookieEnabled) {
            document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
        }
        // Common a11y fixes
        focusHash();
        bindInPageLinks();
        let hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
        if (!hasNativeSmoothScroll) {
            loadScript({
                url: window.theme.assets.smoothscroll
            });
        }
    });

    // node_modules/tabbable/dist/index.esm.js
    var candidateSelectors = [
        "input",
        "select",
        "textarea",
        "a[href]",
        "button",
        "[tabindex]",
        "audio[controls]",
        "video[controls]",
        '[contenteditable]:not([contenteditable="false"])',
        "details>summary:first-of-type",
        "details"
    ];
    var candidateSelector = /* @__PURE__ */ candidateSelectors.join(",");
    var matches = typeof Element === "undefined" ? function() {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    var getCandidates = function getCandidates2(el, includeContainer, filter) {
        var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
        if (includeContainer && matches.call(el, candidateSelector)) {
            candidates.unshift(el);
        }
        candidates = candidates.filter(filter);
        return candidates;
    };
    var isContentEditable = function isContentEditable2(node) {
        return node.contentEditable === "true";
    };
    var getTabindex = function getTabindex2(node) {
        var tabindexAttr = parseInt(node.getAttribute("tabindex"), 10);
        if (!isNaN(tabindexAttr)) {
            return tabindexAttr;
        }
        if (isContentEditable(node)) {
            return 0;
        }
        if ((node.nodeName === "AUDIO" || node.nodeName === "VIDEO" || node.nodeName === "DETAILS") && node.getAttribute("tabindex") === null) {
            return 0;
        }
        return node.tabIndex;
    };
    var sortOrderedTabbables = function sortOrderedTabbables2(a, b) {
        return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
    };
    var isInput = function isInput2(node) {
        return node.tagName === "INPUT";
    };
    var isHiddenInput = function isHiddenInput2(node) {
        return isInput(node) && node.type === "hidden";
    };
    var isDetailsWithSummary = function isDetailsWithSummary2(node) {
        var r = node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
            return child.tagName === "SUMMARY";
        });
        return r;
    };
    var getCheckedRadio = function getCheckedRadio2(nodes, form) {
        for(var i = 0; i < nodes.length; i++){
            if (nodes[i].checked && nodes[i].form === form) {
                return nodes[i];
            }
        }
    };
    var isTabbableRadio = function isTabbableRadio2(node) {
        if (!node.name) {
            return true;
        }
        var radioScope = node.form || node.ownerDocument;
        var queryRadios = function queryRadios2(name) {
            return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
        };
        var radioSet;
        if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") {
            radioSet = queryRadios(window.CSS.escape(node.name));
        } else {
            try {
                radioSet = queryRadios(node.name);
            } catch (err) {
                console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
                return false;
            }
        }
        var checked = getCheckedRadio(radioSet, node.form);
        return !checked || checked === node;
    };
    var isRadio = function isRadio2(node) {
        return isInput(node) && node.type === "radio";
    };
    var isNonTabbableRadio = function isNonTabbableRadio2(node) {
        return isRadio(node) && !isTabbableRadio(node);
    };
    var isHidden = function isHidden2(node, displayCheck) {
        if (getComputedStyle(node).visibility === "hidden") {
            return true;
        }
        var isDirectSummary = matches.call(node, "details>summary:first-of-type");
        var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
        if (matches.call(nodeUnderDetails, "details:not([open]) *")) {
            return true;
        }
        if (!displayCheck || displayCheck === "full") {
            while(node){
                if (getComputedStyle(node).display === "none") {
                    return true;
                }
                node = node.parentElement;
            }
        } else if (displayCheck === "non-zero-area") {
            var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
            return width === 0 && height === 0;
        }
        return false;
    };
    var isDisabledFromFieldset = function isDisabledFromFieldset2(node) {
        if (isInput(node) || node.tagName === "SELECT" || node.tagName === "TEXTAREA" || node.tagName === "BUTTON") {
            var parentNode = node.parentElement;
            while(parentNode){
                if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
                    for(var i = 0; i < parentNode.children.length; i++){
                        var child = parentNode.children.item(i);
                        if (child.tagName === "LEGEND") {
                            if (child.contains(node)) {
                                return false;
                            }
                            return true;
                        }
                    }
                    return true;
                }
                parentNode = parentNode.parentElement;
            }
        }
        return false;
    };
    var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable2(options, node) {
        if (node.disabled || isHiddenInput(node) || isHidden(node, options.displayCheck) || isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
            return false;
        }
        return true;
    };
    var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable2(options, node) {
        if (!isNodeMatchingSelectorFocusable(options, node) || isNonTabbableRadio(node) || getTabindex(node) < 0) {
            return false;
        }
        return true;
    };
    var tabbable = function tabbable2(el, options) {
        options = options || {};
        var regularTabbables = [];
        var orderedTabbables = [];
        var candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
        candidates.forEach(function(candidate, i) {
            var candidateTabindex = getTabindex(candidate);
            if (candidateTabindex === 0) {
                regularTabbables.push(candidate);
            } else {
                orderedTabbables.push({
                    documentOrder: i,
                    tabIndex: candidateTabindex,
                    node: candidate
                });
            }
        });
        var tabbableNodes = orderedTabbables.sort(sortOrderedTabbables).map(function(a) {
            return a.node;
        }).concat(regularTabbables);
        return tabbableNodes;
    };
    var focusable = function focusable2(el, options) {
        options = options || {};
        var candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
        return candidates;
    };
    var focusableCandidateSelector = /* @__PURE__ */ candidateSelectors.concat("iframe").join(",");
    var isFocusable = function isFocusable2(node, options) {
        options = options || {};
        if (!node) {
            throw new Error("No node provided");
        }
        if (matches.call(node, focusableCandidateSelector) === false) {
            return false;
        }
        return isNodeMatchingSelectorFocusable(options, node);
    };
    // node_modules/focus-trap/dist/focus-trap.esm.js
    function ownKeys$1(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            if (enumerableOnly) {
                symbols = symbols.filter(function(sym) {
                    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
            }
            keys.push.apply(keys, symbols);
        }
        return keys;
    }
    function _objectSpread2(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i] != null ? arguments[i] : {};
            if (i % 2) {
                ownKeys$1(Object(source), true).forEach(function(key) {
                    _defineProperty(target, key, source[key]);
                });
            } else if (Object.getOwnPropertyDescriptors) {
                Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
            } else {
                ownKeys$1(Object(source)).forEach(function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                });
            }
        }
        return target;
    }
    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }
        return obj;
    }
    var activeFocusTraps = function() {
        var trapQueue = [];
        return {
            activateTrap: function activateTrap(trap) {
                if (trapQueue.length > 0) {
                    var activeTrap = trapQueue[trapQueue.length - 1];
                    if (activeTrap !== trap) {
                        activeTrap.pause();
                    }
                }
                var trapIndex = trapQueue.indexOf(trap);
                if (trapIndex === -1) {
                    trapQueue.push(trap);
                } else {
                    trapQueue.splice(trapIndex, 1);
                    trapQueue.push(trap);
                }
            },
            deactivateTrap: function deactivateTrap(trap) {
                var trapIndex = trapQueue.indexOf(trap);
                if (trapIndex !== -1) {
                    trapQueue.splice(trapIndex, 1);
                }
                if (trapQueue.length > 0) {
                    trapQueue[trapQueue.length - 1].unpause();
                }
            }
        };
    }();
    var isSelectableInput = function isSelectableInput2(node) {
        return node.tagName && node.tagName.toLowerCase() === "input" && typeof node.select === "function";
    };
    var isEscapeEvent = function isEscapeEvent2(e) {
        return e.key === "Escape" || e.key === "Esc" || e.keyCode === 27;
    };
    var isTabEvent = function isTabEvent2(e) {
        return e.key === "Tab" || e.keyCode === 9;
    };
    var delay = function delay2(fn) {
        return setTimeout(fn, 0);
    };
    var findIndex = function findIndex2(arr, fn) {
        var idx = -1;
        arr.every(function(value, i) {
            if (fn(value)) {
                idx = i;
                return false;
            }
            return true;
        });
        return idx;
    };
    var valueOrHandler = function valueOrHandler2(value) {
        for(var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
            params[_key - 1] = arguments[_key];
        }
        return typeof value === "function" ? value.apply(void 0, params) : value;
    };
    var createFocusTrap = function createFocusTrap2(elements, userOptions) {
        var doc = document;
        var config = _objectSpread2({
            returnFocusOnDeactivate: true,
            escapeDeactivates: true,
            delayInitialFocus: true
        }, userOptions);
        var state = {
            // @type {Array<HTMLElement>}
            containers: [],
            // list of objects identifying the first and last tabbable nodes in all containers/groups in
            //  the trap
            // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
            //  is active, but the trap should never get to a state where there isn't at least one group
            //  with at least one tabbable node in it (that would lead to an error condition that would
            //  result in an error being thrown)
            // @type {Array<{ container: HTMLElement, firstTabbableNode: HTMLElement|null, lastTabbableNode: HTMLElement|null }>}
            tabbableGroups: [],
            nodeFocusedBeforeActivation: null,
            mostRecentlyFocusedNode: null,
            active: false,
            paused: false,
            // timer ID for when delayInitialFocus is true and initial focus in this trap
            //  has been delayed during activation
            delayInitialFocusTimer: void 0
        };
        var trap;
        var getOption = function getOption2(configOverrideOptions, optionName, configOptionName) {
            return configOverrideOptions && configOverrideOptions[optionName] !== void 0 ? configOverrideOptions[optionName] : config[configOptionName || optionName];
        };
        var containersContain = function containersContain2(element) {
            return state.containers.some(function(container) {
                return container.contains(element);
            });
        };
        var getNodeForOption = function getNodeForOption2(optionName) {
            var optionValue = config[optionName];
            if (!optionValue) {
                return null;
            }
            var node = optionValue;
            if (typeof optionValue === "string") {
                node = doc.querySelector(optionValue);
                if (!node) {
                    throw new Error("`".concat(optionName, "` refers to no known node"));
                }
            }
            if (typeof optionValue === "function") {
                node = optionValue();
                if (!node) {
                    throw new Error("`".concat(optionName, "` did not return a node"));
                }
            }
            return node;
        };
        var getInitialFocusNode = function getInitialFocusNode2() {
            var node;
            if (getOption({}, "initialFocus") === false) {
                return false;
            }
            if (getNodeForOption("initialFocus") !== null) {
                node = getNodeForOption("initialFocus");
            } else if (containersContain(doc.activeElement)) {
                node = doc.activeElement;
            } else {
                var firstTabbableGroup = state.tabbableGroups[0];
                var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
                node = firstTabbableNode || getNodeForOption("fallbackFocus");
            }
            if (!node) {
                throw new Error("Your focus-trap needs to have at least one focusable element");
            }
            return node;
        };
        var updateTabbableNodes = function updateTabbableNodes2() {
            state.tabbableGroups = state.containers.map(function(container) {
                var tabbableNodes = tabbable(container);
                if (tabbableNodes.length > 0) {
                    return {
                        container,
                        firstTabbableNode: tabbableNodes[0],
                        lastTabbableNode: tabbableNodes[tabbableNodes.length - 1]
                    };
                }
                return void 0;
            }).filter(function(group) {
                return !!group;
            });
            if (state.tabbableGroups.length <= 0 && !getNodeForOption("fallbackFocus")) {
                throw new Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");
            }
        };
        var tryFocus = function tryFocus2(node) {
            if (node === false) {
                return;
            }
            if (node === doc.activeElement) {
                return;
            }
            if (!node || !node.focus) {
                tryFocus2(getInitialFocusNode());
                return;
            }
            node.focus({
                preventScroll: !!config.preventScroll
            });
            state.mostRecentlyFocusedNode = node;
            if (isSelectableInput(node)) {
                node.select();
            }
        };
        var getReturnFocusNode = function getReturnFocusNode2(previousActiveElement) {
            var node = getNodeForOption("setReturnFocus");
            return node ? node : previousActiveElement;
        };
        var checkPointerDown = function checkPointerDown2(e) {
            if (containersContain(e.target)) {
                return;
            }
            if (valueOrHandler(config.clickOutsideDeactivates, e)) {
                trap.deactivate({
                    // if, on deactivation, we should return focus to the node originally-focused
                    //  when the trap was activated (or the configured `setReturnFocus` node),
                    //  then assume it's also OK to return focus to the outside node that was
                    //  just clicked, causing deactivation, as long as that node is focusable;
                    //  if it isn't focusable, then return focus to the original node focused
                    //  on activation (or the configured `setReturnFocus` node)
                    // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
                    //  which will result in the outside click setting focus to the node
                    //  that was clicked, whether it's focusable or not; by setting
                    //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
                    //  on activation (or the configured `setReturnFocus` node)
                    returnFocus: config.returnFocusOnDeactivate && !isFocusable(e.target)
                });
                return;
            }
            if (valueOrHandler(config.allowOutsideClick, e)) {
                return;
            }
            e.preventDefault();
        };
        var checkFocusIn = function checkFocusIn2(e) {
            var targetContained = containersContain(e.target);
            if (targetContained || e.target instanceof Document) {
                if (targetContained) {
                    state.mostRecentlyFocusedNode = e.target;
                }
            } else {
                e.stopImmediatePropagation();
                tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
            }
        };
        var checkTab = function checkTab2(e) {
            updateTabbableNodes();
            var destinationNode = null;
            if (state.tabbableGroups.length > 0) {
                var containerIndex = findIndex(state.tabbableGroups, function(_ref) {
                    var container = _ref.container;
                    return container.contains(e.target);
                });
                if (containerIndex < 0) {
                    if (e.shiftKey) {
                        destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
                    } else {
                        destinationNode = state.tabbableGroups[0].firstTabbableNode;
                    }
                } else if (e.shiftKey) {
                    var startOfGroupIndex = findIndex(state.tabbableGroups, function(_ref2) {
                        var firstTabbableNode = _ref2.firstTabbableNode;
                        return e.target === firstTabbableNode;
                    });
                    if (startOfGroupIndex < 0 && state.tabbableGroups[containerIndex].container === e.target) {
                        startOfGroupIndex = containerIndex;
                    }
                    if (startOfGroupIndex >= 0) {
                        var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
                        var destinationGroup = state.tabbableGroups[destinationGroupIndex];
                        destinationNode = destinationGroup.lastTabbableNode;
                    }
                } else {
                    var lastOfGroupIndex = findIndex(state.tabbableGroups, function(_ref3) {
                        var lastTabbableNode = _ref3.lastTabbableNode;
                        return e.target === lastTabbableNode;
                    });
                    if (lastOfGroupIndex < 0 && state.tabbableGroups[containerIndex].container === e.target) {
                        lastOfGroupIndex = containerIndex;
                    }
                    if (lastOfGroupIndex >= 0) {
                        var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;
                        var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
                        destinationNode = _destinationGroup.firstTabbableNode;
                    }
                }
            } else {
                destinationNode = getNodeForOption("fallbackFocus");
            }
            if (destinationNode) {
                e.preventDefault();
                tryFocus(destinationNode);
            }
        };
        var checkKey = function checkKey2(e) {
            if (isEscapeEvent(e) && valueOrHandler(config.escapeDeactivates) !== false) {
                e.preventDefault();
                trap.deactivate();
                return;
            }
            if (isTabEvent(e)) {
                checkTab(e);
                return;
            }
        };
        var checkClick = function checkClick2(e) {
            if (valueOrHandler(config.clickOutsideDeactivates, e)) {
                return;
            }
            if (containersContain(e.target)) {
                return;
            }
            if (valueOrHandler(config.allowOutsideClick, e)) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        };
        var addListeners = function addListeners2() {
            if (!state.active) {
                return;
            }
            activeFocusTraps.activateTrap(trap);
            state.delayInitialFocusTimer = config.delayInitialFocus ? delay(function() {
                tryFocus(getInitialFocusNode());
            }) : tryFocus(getInitialFocusNode());
            doc.addEventListener("focusin", checkFocusIn, true);
            doc.addEventListener("mousedown", checkPointerDown, {
                capture: true,
                passive: false
            });
            doc.addEventListener("touchstart", checkPointerDown, {
                capture: true,
                passive: false
            });
            doc.addEventListener("click", checkClick, {
                capture: true,
                passive: false
            });
            doc.addEventListener("keydown", checkKey, {
                capture: true,
                passive: false
            });
            return trap;
        };
        var removeListeners = function removeListeners2() {
            if (!state.active) {
                return;
            }
            doc.removeEventListener("focusin", checkFocusIn, true);
            doc.removeEventListener("mousedown", checkPointerDown, true);
            doc.removeEventListener("touchstart", checkPointerDown, true);
            doc.removeEventListener("click", checkClick, true);
            doc.removeEventListener("keydown", checkKey, true);
            return trap;
        };
        trap = {
            activate: function activate(activateOptions) {
                if (state.active) {
                    return this;
                }
                var onActivate = getOption(activateOptions, "onActivate");
                var onPostActivate = getOption(activateOptions, "onPostActivate");
                var checkCanFocusTrap = getOption(activateOptions, "checkCanFocusTrap");
                if (!checkCanFocusTrap) {
                    updateTabbableNodes();
                }
                state.active = true;
                state.paused = false;
                state.nodeFocusedBeforeActivation = doc.activeElement;
                if (onActivate) {
                    onActivate();
                }
                var finishActivation = function finishActivation2() {
                    if (checkCanFocusTrap) {
                        updateTabbableNodes();
                    }
                    addListeners();
                    if (onPostActivate) {
                        onPostActivate();
                    }
                };
                if (checkCanFocusTrap) {
                    checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
                    return this;
                }
                finishActivation();
                return this;
            },
            deactivate: function deactivate(deactivateOptions) {
                if (!state.active) {
                    return this;
                }
                clearTimeout(state.delayInitialFocusTimer);
                state.delayInitialFocusTimer = void 0;
                removeListeners();
                state.active = false;
                state.paused = false;
                activeFocusTraps.deactivateTrap(trap);
                var onDeactivate = getOption(deactivateOptions, "onDeactivate");
                var onPostDeactivate = getOption(deactivateOptions, "onPostDeactivate");
                var checkCanReturnFocus = getOption(deactivateOptions, "checkCanReturnFocus");
                if (onDeactivate) {
                    onDeactivate();
                }
                var returnFocus = getOption(deactivateOptions, "returnFocus", "returnFocusOnDeactivate");
                var finishDeactivation = function finishDeactivation2() {
                    delay(function() {
                        if (returnFocus) {
                            tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
                        }
                        if (onPostDeactivate) {
                            onPostDeactivate();
                        }
                    });
                };
                if (returnFocus && checkCanReturnFocus) {
                    checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
                    return this;
                }
                finishDeactivation();
                return this;
            },
            pause: function pause() {
                if (state.paused || !state.active) {
                    return this;
                }
                state.paused = true;
                removeListeners();
                return this;
            },
            unpause: function unpause() {
                if (!state.paused || !state.active) {
                    return this;
                }
                state.paused = false;
                updateTabbableNodes();
                addListeners();
                return this;
            },
            updateContainerElements: function updateContainerElements(containerElements) {
                var elementsAsArray = [].concat(containerElements).filter(Boolean);
                state.containers = elementsAsArray.map(function(element) {
                    return typeof element === "string" ? doc.querySelector(element) : element;
                });
                if (state.active) {
                    updateTabbableNodes();
                }
                return this;
            }
        };
        trap.updateContainerElements(elements);
        return trap;
    };
    // packages/focus/src/index.js
    function src_default$2(Alpine) {
        let lastFocused;
        let currentFocused;
        window.addEventListener("focusin", ()=>{
            lastFocused = currentFocused;
            currentFocused = document.activeElement;
        });
        Alpine.magic("focus", (el)=>{
            let within = el;
            return {
                __noscroll: false,
                __wrapAround: false,
                within (el2) {
                    within = el2;
                    return this;
                },
                withoutScrolling () {
                    this.__noscroll = true;
                    return this;
                },
                noscroll () {
                    this.__noscroll = true;
                    return this;
                },
                withWrapAround () {
                    this.__wrapAround = true;
                    return this;
                },
                wrap () {
                    return this.withWrapAround();
                },
                focusable (el2) {
                    return isFocusable(el2);
                },
                previouslyFocused () {
                    return lastFocused;
                },
                lastFocused () {
                    return lastFocused;
                },
                focused () {
                    return currentFocused;
                },
                focusables () {
                    if (Array.isArray(within)) return within;
                    return focusable(within, {
                        displayCheck: "none"
                    });
                },
                all () {
                    return this.focusables();
                },
                isFirst (el2) {
                    let els = this.all();
                    return els[0] && els[0].isSameNode(el2);
                },
                isLast (el2) {
                    let els = this.all();
                    return els.length && els.slice(-1)[0].isSameNode(el2);
                },
                getFirst () {
                    return this.all()[0];
                },
                getLast () {
                    return this.all().slice(-1)[0];
                },
                getNext () {
                    let list = this.all();
                    let current = document.activeElement;
                    if (list.indexOf(current) === -1) return;
                    if (this.__wrapAround && list.indexOf(current) === list.length - 1) {
                        return list[0];
                    }
                    return list[list.indexOf(current) + 1];
                },
                getPrevious () {
                    let list = this.all();
                    let current = document.activeElement;
                    if (list.indexOf(current) === -1) return;
                    if (this.__wrapAround && list.indexOf(current) === 0) {
                        return list.slice(-1)[0];
                    }
                    return list[list.indexOf(current) - 1];
                },
                first () {
                    this.focus(this.getFirst());
                },
                last () {
                    this.focus(this.getLast());
                },
                next () {
                    this.focus(this.getNext());
                },
                previous () {
                    this.focus(this.getPrevious());
                },
                prev () {
                    return this.previous();
                },
                focus (el2) {
                    if (!el2) return;
                    setTimeout(()=>{
                        if (!el2.hasAttribute("tabindex")) el2.setAttribute("tabindex", "0");
                        el2.focus({
                            preventScroll: this._noscroll
                        });
                    });
                }
            };
        });
        Alpine.directive("trap", Alpine.skipDuringClone((el, { expression , modifiers  }, { effect , evaluateLater , cleanup  })=>{
            let evaluator = evaluateLater(expression);
            let oldValue = false;
            let trap = createFocusTrap(el, {
                escapeDeactivates: false,
                allowOutsideClick: true,
                fallbackFocus: ()=>el
                ,
                initialFocus: el.querySelector("[autofocus]")
            });
            let undoInert = ()=>{};
            let undoDisableScrolling = ()=>{};
            const releaseFocus = ()=>{
                undoInert();
                undoInert = ()=>{};
                undoDisableScrolling();
                undoDisableScrolling = ()=>{};
                trap.deactivate({
                    returnFocus: !modifiers.includes("noreturn")
                });
            };
            effect(()=>evaluator((value)=>{
                    if (oldValue === value) return;
                    if (value && !oldValue) {
                        setTimeout(()=>{
                            if (modifiers.includes("inert")) undoInert = setInert(el);
                            if (modifiers.includes("noscroll")) undoDisableScrolling = disableScrolling();
                            trap.activate();
                        });
                    }
                    if (!value && oldValue) {
                        releaseFocus();
                    }
                    oldValue = !!value;
                })
            );
            cleanup(releaseFocus);
        }, // When cloning, we only want to add aria-hidden attributes to the
        // DOM and not try to actually trap, as trapping can mess with the
        // live DOM and isn't just isolated to the cloned DOM.
        (el, { expression , modifiers  }, { evaluate  })=>{
            if (modifiers.includes("inert") && evaluate(expression)) setInert(el);
        }));
    }
    function setInert(el) {
        let undos = [];
        crawlSiblingsUp(el, (sibling)=>{
            let cache = sibling.hasAttribute("aria-hidden");
            sibling.setAttribute("aria-hidden", "true");
            undos.push(()=>cache || sibling.removeAttribute("aria-hidden")
            );
        });
        return ()=>{
            while(undos.length)undos.pop()();
        };
    }
    function crawlSiblingsUp(el, callback) {
        if (el.isSameNode(document.body) || !el.parentNode) return;
        Array.from(el.parentNode.children).forEach((sibling)=>{
            if (sibling.isSameNode(el)) {
                crawlSiblingsUp(el.parentNode, callback);
            } else {
                callback(sibling);
            }
        });
    }
    function disableScrolling() {
        let overflow = document.documentElement.style.overflow;
        let paddingRight = document.documentElement.style.paddingRight;
        let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
        return ()=>{
            document.documentElement.style.overflow = overflow;
            document.documentElement.style.paddingRight = paddingRight;
        };
    }
    // packages/focus/builds/module.js
    var module_default$2 = src_default$2;

    // packages/intersect/src/index.js
    function src_default$1(Alpine) {
        Alpine.directive("intersect", Alpine.skipDuringClone((el, { value , expression , modifiers  }, { evaluateLater , cleanup  })=>{
            let evaluate = evaluateLater(expression);
            let options = {
                rootMargin: getRootMargin(modifiers),
                threshold: getThreshold(modifiers)
            };
            let observer = new IntersectionObserver((entries)=>{
                entries.forEach((entry)=>{
                    if (entry.isIntersecting === (value === "leave")) return;
                    evaluate();
                    modifiers.includes("once") && observer.disconnect();
                });
            }, options);
            observer.observe(el);
            cleanup(()=>{
                observer.disconnect();
            });
        }));
    }
    function getThreshold(modifiers) {
        if (modifiers.includes("full")) return 0.99;
        if (modifiers.includes("half")) return 0.5;
        if (!modifiers.includes("threshold")) return 0;
        let threshold = modifiers[modifiers.indexOf("threshold") + 1];
        if (threshold === "100") return 1;
        if (threshold === "0") return 0;
        return Number(`.${threshold}`);
    }
    function getLengthValue(rawValue) {
        let match = rawValue.match(/^(-?[0-9]+)(px|%)?$/);
        return match ? match[1] + (match[2] || "px") : void 0;
    }
    function getRootMargin(modifiers) {
        const key = "margin";
        const fallback = "0px 0px 0px 0px";
        const index = modifiers.indexOf(key);
        if (index === -1) return fallback;
        let values = [];
        for(let i = 1; i < 5; i++){
            values.push(getLengthValue(modifiers[index + i] || ""));
        }
        values = values.filter((v)=>v !== void 0
        );
        return values.length ? values.join(" ").trim() : fallback;
    }
    // packages/intersect/builds/module.js
    var module_default$1 = src_default$1;

    // packages/alpinejs/src/scheduler.js
    var flushPending = false;
    var flushing = false;
    var queue = [];
    var lastFlushedIndex = -1;
    function scheduler(callback) {
        queueJob(callback);
    }
    function queueJob(job) {
        if (!queue.includes(job)) queue.push(job);
        queueFlush();
    }
    function dequeueJob(job) {
        let index = queue.indexOf(job);
        if (index !== -1 && index > lastFlushedIndex) queue.splice(index, 1);
    }
    function queueFlush() {
        if (!flushing && !flushPending) {
            flushPending = true;
            queueMicrotask(flushJobs);
        }
    }
    function flushJobs() {
        flushPending = false;
        flushing = true;
        for(let i = 0; i < queue.length; i++){
            queue[i]();
            lastFlushedIndex = i;
        }
        queue.length = 0;
        lastFlushedIndex = -1;
        flushing = false;
    }
    // packages/alpinejs/src/reactivity.js
    var reactive;
    var effect;
    var release;
    var raw;
    var shouldSchedule = true;
    function disableEffectScheduling(callback) {
        shouldSchedule = false;
        callback();
        shouldSchedule = true;
    }
    function setReactivityEngine(engine) {
        reactive = engine.reactive;
        release = engine.release;
        effect = (callback)=>engine.effect(callback, {
                scheduler: (task)=>{
                    if (shouldSchedule) {
                        scheduler(task);
                    } else {
                        task();
                    }
                }
            })
        ;
        raw = engine.raw;
    }
    function overrideEffect(override) {
        effect = override;
    }
    function elementBoundEffect(el) {
        let cleanup2 = ()=>{};
        let wrappedEffect = (callback)=>{
            let effectReference = effect(callback);
            if (!el._x_effects) {
                el._x_effects = new Set();
                el._x_runEffects = ()=>{
                    el._x_effects.forEach((i)=>i()
                    );
                };
            }
            el._x_effects.add(effectReference);
            cleanup2 = ()=>{
                if (effectReference === void 0) return;
                el._x_effects.delete(effectReference);
                release(effectReference);
            };
            return effectReference;
        };
        return [
            wrappedEffect,
            ()=>{
                cleanup2();
            }
        ];
    }
    // packages/alpinejs/src/mutation.js
    var onAttributeAddeds = [];
    var onElRemoveds = [];
    var onElAddeds = [];
    function onElAdded(callback) {
        onElAddeds.push(callback);
    }
    function onElRemoved(el, callback) {
        if (typeof callback === "function") {
            if (!el._x_cleanups) el._x_cleanups = [];
            el._x_cleanups.push(callback);
        } else {
            callback = el;
            onElRemoveds.push(callback);
        }
    }
    function onAttributesAdded(callback) {
        onAttributeAddeds.push(callback);
    }
    function onAttributeRemoved(el, name, callback) {
        if (!el._x_attributeCleanups) el._x_attributeCleanups = {};
        if (!el._x_attributeCleanups[name]) el._x_attributeCleanups[name] = [];
        el._x_attributeCleanups[name].push(callback);
    }
    function cleanupAttributes(el, names) {
        if (!el._x_attributeCleanups) return;
        Object.entries(el._x_attributeCleanups).forEach(([name, value])=>{
            if (names === void 0 || names.includes(name)) {
                value.forEach((i)=>i()
                );
                delete el._x_attributeCleanups[name];
            }
        });
    }
    var observer$1 = new MutationObserver(onMutate);
    var currentlyObserving = false;
    function startObservingMutations() {
        observer$1.observe(document, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeOldValue: true
        });
        currentlyObserving = true;
    }
    function stopObservingMutations() {
        flushObserver();
        observer$1.disconnect();
        currentlyObserving = false;
    }
    var recordQueue = [];
    var willProcessRecordQueue = false;
    function flushObserver() {
        recordQueue = recordQueue.concat(observer$1.takeRecords());
        if (recordQueue.length && !willProcessRecordQueue) {
            willProcessRecordQueue = true;
            queueMicrotask(()=>{
                processRecordQueue();
                willProcessRecordQueue = false;
            });
        }
    }
    function processRecordQueue() {
        onMutate(recordQueue);
        recordQueue.length = 0;
    }
    function mutateDom(callback) {
        if (!currentlyObserving) return callback();
        stopObservingMutations();
        let result = callback();
        startObservingMutations();
        return result;
    }
    var isCollecting = false;
    var deferredMutations = [];
    function deferMutations() {
        isCollecting = true;
    }
    function flushAndStopDeferringMutations() {
        isCollecting = false;
        onMutate(deferredMutations);
        deferredMutations = [];
    }
    function onMutate(mutations) {
        if (isCollecting) {
            deferredMutations = deferredMutations.concat(mutations);
            return;
        }
        let addedNodes = [];
        let removedNodes = [];
        let addedAttributes = new Map();
        let removedAttributes = new Map();
        for(let i1 = 0; i1 < mutations.length; i1++){
            if (mutations[i1].target._x_ignoreMutationObserver) continue;
            if (mutations[i1].type === "childList") {
                mutations[i1].addedNodes.forEach((node)=>node.nodeType === 1 && addedNodes.push(node)
                );
                mutations[i1].removedNodes.forEach((node)=>node.nodeType === 1 && removedNodes.push(node)
                );
            }
            if (mutations[i1].type === "attributes") {
                let el = mutations[i1].target;
                let name = mutations[i1].attributeName;
                let oldValue = mutations[i1].oldValue;
                let add2 = ()=>{
                    if (!addedAttributes.has(el)) addedAttributes.set(el, []);
                    addedAttributes.get(el).push({
                        name,
                        value: el.getAttribute(name)
                    });
                };
                let remove = ()=>{
                    if (!removedAttributes.has(el)) removedAttributes.set(el, []);
                    removedAttributes.get(el).push(name);
                };
                if (el.hasAttribute(name) && oldValue === null) {
                    add2();
                } else if (el.hasAttribute(name)) {
                    remove();
                    add2();
                } else {
                    remove();
                }
            }
        }
        removedAttributes.forEach((attrs, el)=>{
            cleanupAttributes(el, attrs);
        });
        addedAttributes.forEach((attrs, el)=>{
            onAttributeAddeds.forEach((i)=>i(el, attrs)
            );
        });
        for (let node2 of removedNodes){
            if (addedNodes.includes(node2)) continue;
            onElRemoveds.forEach((i)=>i(node2)
            );
            if (node2._x_cleanups) {
                while(node2._x_cleanups.length)node2._x_cleanups.pop()();
            }
        }
        addedNodes.forEach((node)=>{
            node._x_ignoreSelf = true;
            node._x_ignore = true;
        });
        for (let node1 of addedNodes){
            if (removedNodes.includes(node1)) continue;
            if (!node1.isConnected) continue;
            delete node1._x_ignoreSelf;
            delete node1._x_ignore;
            onElAddeds.forEach((i)=>i(node1)
            );
            node1._x_ignore = true;
            node1._x_ignoreSelf = true;
        }
        addedNodes.forEach((node)=>{
            delete node._x_ignoreSelf;
            delete node._x_ignore;
        });
        addedNodes = null;
        removedNodes = null;
        addedAttributes = null;
        removedAttributes = null;
    }
    // packages/alpinejs/src/scope.js
    function scope(node) {
        return mergeProxies(closestDataStack(node));
    }
    function addScopeToNode(node, data2, referenceNode) {
        node._x_dataStack = [
            data2,
            ...closestDataStack(referenceNode || node)
        ];
        return ()=>{
            node._x_dataStack = node._x_dataStack.filter((i)=>i !== data2
            );
        };
    }
    function closestDataStack(node) {
        if (node._x_dataStack) return node._x_dataStack;
        if (typeof ShadowRoot === "function" && node instanceof ShadowRoot) {
            return closestDataStack(node.host);
        }
        if (!node.parentNode) {
            return [];
        }
        return closestDataStack(node.parentNode);
    }
    function mergeProxies(objects) {
        let thisProxy = new Proxy({}, {
            ownKeys: ()=>{
                return Array.from(new Set(objects.flatMap((i)=>Object.keys(i)
                )));
            },
            has: (target, name)=>{
                return objects.some((obj)=>obj.hasOwnProperty(name)
                );
            },
            get: (target, name)=>{
                return (objects.find((obj)=>{
                    if (obj.hasOwnProperty(name)) {
                        let descriptor = Object.getOwnPropertyDescriptor(obj, name);
                        if (descriptor.get && descriptor.get._x_alreadyBound || descriptor.set && descriptor.set._x_alreadyBound) {
                            return true;
                        }
                        if ((descriptor.get || descriptor.set) && descriptor.enumerable) {
                            let getter = descriptor.get;
                            let setter = descriptor.set;
                            let property = descriptor;
                            getter = getter && getter.bind(thisProxy);
                            setter = setter && setter.bind(thisProxy);
                            if (getter) getter._x_alreadyBound = true;
                            if (setter) setter._x_alreadyBound = true;
                            Object.defineProperty(obj, name, {
                                ...property,
                                get: getter,
                                set: setter
                            });
                        }
                        return true;
                    }
                    return false;
                }) || {})[name];
            },
            set: (target, name, value)=>{
                let closestObjectWithKey = objects.find((obj)=>obj.hasOwnProperty(name)
                );
                if (closestObjectWithKey) {
                    closestObjectWithKey[name] = value;
                } else {
                    objects[objects.length - 1][name] = value;
                }
                return true;
            }
        });
        return thisProxy;
    }
    // packages/alpinejs/src/interceptor.js
    function initInterceptors(data2) {
        let isObject2 = (val)=>typeof val === "object" && !Array.isArray(val) && val !== null
        ;
        let recurse = (obj, basePath = "")=>{
            Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(([key, { value , enumerable  }])=>{
                if (enumerable === false || value === void 0) return;
                let path = basePath === "" ? key : `${basePath}.${key}`;
                if (typeof value === "object" && value !== null && value._x_interceptor) {
                    obj[key] = value.initialize(data2, path, key);
                } else {
                    if (isObject2(value) && value !== obj && !(value instanceof Element)) {
                        recurse(value, path);
                    }
                }
            });
        };
        return recurse(data2);
    }
    function interceptor(callback, mutateObj = ()=>{}) {
        let obj = {
            initialValue: void 0,
            _x_interceptor: true,
            initialize (data2, path, key) {
                return callback(this.initialValue, ()=>get(data2, path)
                , (value)=>set(data2, path, value)
                , path, key);
            }
        };
        mutateObj(obj);
        return (initialValue)=>{
            if (typeof initialValue === "object" && initialValue !== null && initialValue._x_interceptor) {
                let initialize = obj.initialize.bind(obj);
                obj.initialize = (data2, path, key)=>{
                    let innerValue = initialValue.initialize(data2, path, key);
                    obj.initialValue = innerValue;
                    return initialize(data2, path, key);
                };
            } else {
                obj.initialValue = initialValue;
            }
            return obj;
        };
    }
    function get(obj, path) {
        return path.split(".").reduce((carry, segment)=>carry[segment]
        , obj);
    }
    function set(obj, path, value) {
        if (typeof path === "string") path = path.split(".");
        if (path.length === 1) obj[path[0]] = value;
        else if (path.length === 0) throw error;
        else {
            if (obj[path[0]]) return set(obj[path[0]], path.slice(1), value);
            else {
                obj[path[0]] = {};
                return set(obj[path[0]], path.slice(1), value);
            }
        }
    }
    // packages/alpinejs/src/magics.js
    var magics = {};
    function magic(name, callback) {
        magics[name] = callback;
    }
    function injectMagics(obj, el) {
        Object.entries(magics).forEach(([name, callback])=>{
            let memoizedUtilities = null;
            function getUtilities() {
                if (memoizedUtilities) {
                    return memoizedUtilities;
                } else {
                    let [utilities, cleanup2] = getElementBoundUtilities(el);
                    memoizedUtilities = {
                        interceptor,
                        ...utilities
                    };
                    onElRemoved(el, cleanup2);
                    return memoizedUtilities;
                }
            }
            Object.defineProperty(obj, `$${name}`, {
                get () {
                    return callback(el, getUtilities());
                },
                enumerable: false
            });
        });
        return obj;
    }
    // packages/alpinejs/src/utils/error.js
    function tryCatch(el, expression, callback, ...args) {
        try {
            return callback(...args);
        } catch (e) {
            handleError(e, el, expression);
        }
    }
    function handleError(error2, el, expression = void 0) {
        Object.assign(error2, {
            el,
            expression
        });
        console.warn(`Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + '"\n\n' : ""}`, el);
        setTimeout(()=>{
            throw error2;
        }, 0);
    }
    // packages/alpinejs/src/evaluator.js
    var shouldAutoEvaluateFunctions = true;
    function dontAutoEvaluateFunctions(callback) {
        let cache = shouldAutoEvaluateFunctions;
        shouldAutoEvaluateFunctions = false;
        let result = callback();
        shouldAutoEvaluateFunctions = cache;
        return result;
    }
    function evaluate(el, expression, extras = {}) {
        let result;
        evaluateLater(el, expression)((value)=>result = value
        , extras);
        return result;
    }
    function evaluateLater(...args) {
        return theEvaluatorFunction(...args);
    }
    var theEvaluatorFunction = normalEvaluator;
    function setEvaluator(newEvaluator) {
        theEvaluatorFunction = newEvaluator;
    }
    function normalEvaluator(el, expression) {
        let overriddenMagics = {};
        injectMagics(overriddenMagics, el);
        let dataStack = [
            overriddenMagics,
            ...closestDataStack(el)
        ];
        let evaluator = typeof expression === "function" ? generateEvaluatorFromFunction(dataStack, expression) : generateEvaluatorFromString(dataStack, expression, el);
        return tryCatch.bind(null, el, expression, evaluator);
    }
    function generateEvaluatorFromFunction(dataStack, func) {
        return (receiver = ()=>{}, { scope: scope2 = {} , params =[]  } = {})=>{
            let result = func.apply(mergeProxies([
                scope2,
                ...dataStack
            ]), params);
            runIfTypeOfFunction(receiver, result);
        };
    }
    var evaluatorMemo = {};
    function generateFunctionFromString(expression, el) {
        if (evaluatorMemo[expression]) {
            return evaluatorMemo[expression];
        }
        let AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
        let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression) || /^(let|const)\s/.test(expression) ? `(async()=>{ ${expression} })()` : expression;
        const safeAsyncFunction = ()=>{
            try {
                return new AsyncFunction([
                    "__self",
                    "scope"
                ], `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`);
            } catch (error2) {
                handleError(error2, el, expression);
                return Promise.resolve();
            }
        };
        let func = safeAsyncFunction();
        evaluatorMemo[expression] = func;
        return func;
    }
    function generateEvaluatorFromString(dataStack, expression, el) {
        let func = generateFunctionFromString(expression, el);
        return (receiver = ()=>{}, { scope: scope2 = {} , params =[]  } = {})=>{
            func.result = void 0;
            func.finished = false;
            let completeScope = mergeProxies([
                scope2,
                ...dataStack
            ]);
            if (typeof func === "function") {
                let promise = func(func, completeScope).catch((error2)=>handleError(error2, el, expression)
                );
                if (func.finished) {
                    runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
                    func.result = void 0;
                } else {
                    promise.then((result)=>{
                        runIfTypeOfFunction(receiver, result, completeScope, params, el);
                    }).catch((error2)=>handleError(error2, el, expression)
                    ).finally(()=>func.result = void 0
                    );
                }
            }
        };
    }
    function runIfTypeOfFunction(receiver, value, scope2, params, el) {
        if (shouldAutoEvaluateFunctions && typeof value === "function") {
            let result = value.apply(scope2, params);
            if (result instanceof Promise) {
                result.then((i)=>runIfTypeOfFunction(receiver, i, scope2, params)
                ).catch((error2)=>handleError(error2, el, value)
                );
            } else {
                receiver(result);
            }
        } else if (typeof value === "object" && value instanceof Promise) {
            value.then((i)=>receiver(i)
            );
        } else {
            receiver(value);
        }
    }
    // packages/alpinejs/src/directives.js
    var prefixAsString = "x-";
    function prefix(subject = "") {
        return prefixAsString + subject;
    }
    function setPrefix(newPrefix) {
        prefixAsString = newPrefix;
    }
    var directiveHandlers = {};
    function directive(name, callback) {
        directiveHandlers[name] = callback;
        return {
            before (directive2) {
                if (!directiveHandlers[directive2]) {
                    console.warn("Cannot find directive `${directive}`. `${name}` will use the default order of execution");
                    return;
                }
                const pos = directiveOrder.indexOf(directive2);
                directiveOrder.splice(pos >= 0 ? pos : directiveOrder.indexOf("DEFAULT"), 0, name);
            }
        };
    }
    function directives(el, attributes, originalAttributeOverride) {
        attributes = Array.from(attributes);
        if (el._x_virtualDirectives) {
            let vAttributes = Object.entries(el._x_virtualDirectives).map(([name, value])=>({
                    name,
                    value
                })
            );
            let staticAttributes = attributesOnly(vAttributes);
            vAttributes = vAttributes.map((attribute)=>{
                if (staticAttributes.find((attr)=>attr.name === attribute.name
                )) {
                    return {
                        name: `x-bind:${attribute.name}`,
                        value: `"${attribute.value}"`
                    };
                }
                return attribute;
            });
            attributes = attributes.concat(vAttributes);
        }
        let transformedAttributeMap = {};
        let directives2 = attributes.map(toTransformedAttributes((newName, oldName)=>transformedAttributeMap[newName] = oldName
        )).filter(outNonAlpineAttributes).map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride)).sort(byPriority);
        return directives2.map((directive2)=>{
            return getDirectiveHandler(el, directive2);
        });
    }
    function attributesOnly(attributes) {
        return Array.from(attributes).map(toTransformedAttributes()).filter((attr)=>!outNonAlpineAttributes(attr)
        );
    }
    var isDeferringHandlers = false;
    var directiveHandlerStacks = new Map();
    var currentHandlerStackKey = Symbol();
    function deferHandlingDirectives(callback) {
        isDeferringHandlers = true;
        let key = Symbol();
        currentHandlerStackKey = key;
        directiveHandlerStacks.set(key, []);
        let flushHandlers = ()=>{
            while(directiveHandlerStacks.get(key).length)directiveHandlerStacks.get(key).shift()();
            directiveHandlerStacks.delete(key);
        };
        let stopDeferring = ()=>{
            isDeferringHandlers = false;
            flushHandlers();
        };
        callback(flushHandlers);
        stopDeferring();
    }
    function getElementBoundUtilities(el) {
        let cleanups = [];
        let cleanup2 = (callback)=>cleanups.push(callback)
        ;
        let [effect3, cleanupEffect] = elementBoundEffect(el);
        cleanups.push(cleanupEffect);
        let utilities = {
            Alpine: alpine_default,
            effect: effect3,
            cleanup: cleanup2,
            evaluateLater: evaluateLater.bind(evaluateLater, el),
            evaluate: evaluate.bind(evaluate, el)
        };
        let doCleanup = ()=>cleanups.forEach((i)=>i()
            )
        ;
        return [
            utilities,
            doCleanup
        ];
    }
    function getDirectiveHandler(el, directive2) {
        let noop = ()=>{};
        let handler4 = directiveHandlers[directive2.type] || noop;
        let [utilities, cleanup2] = getElementBoundUtilities(el);
        onAttributeRemoved(el, directive2.original, cleanup2);
        let fullHandler = ()=>{
            if (el._x_ignore || el._x_ignoreSelf) return;
            handler4.inline && handler4.inline(el, directive2, utilities);
            handler4 = handler4.bind(handler4, el, directive2, utilities);
            isDeferringHandlers ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler4) : handler4();
        };
        fullHandler.runCleanups = cleanup2;
        return fullHandler;
    }
    var startingWith = (subject, replacement)=>({ name , value  })=>{
            if (name.startsWith(subject)) name = name.replace(subject, replacement);
            return {
                name,
                value
            };
        }
    ;
    var into = (i)=>i
    ;
    function toTransformedAttributes(callback = ()=>{}) {
        return ({ name , value  })=>{
            let { name: newName , value: newValue  } = attributeTransformers.reduce((carry, transform)=>{
                return transform(carry);
            }, {
                name,
                value
            });
            if (newName !== name) callback(newName, name);
            return {
                name: newName,
                value: newValue
            };
        };
    }
    var attributeTransformers = [];
    function mapAttributes(callback) {
        attributeTransformers.push(callback);
    }
    function outNonAlpineAttributes({ name  }) {
        return alpineAttributeRegex().test(name);
    }
    var alpineAttributeRegex = ()=>new RegExp(`^${prefixAsString}([^:^.]+)\\b`)
    ;
    function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
        return ({ name , value  })=>{
            let typeMatch = name.match(alpineAttributeRegex());
            let valueMatch = name.match(/:([a-zA-Z0-9\-:]+)/);
            let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
            let original = originalAttributeOverride || transformedAttributeMap[name] || name;
            return {
                type: typeMatch ? typeMatch[1] : null,
                value: valueMatch ? valueMatch[1] : null,
                modifiers: modifiers.map((i)=>i.replace(".", "")
                ),
                expression: value,
                original
            };
        };
    }
    var DEFAULT = "DEFAULT";
    var directiveOrder = [
        "ignore",
        "ref",
        "data",
        "id",
        "bind",
        "init",
        "for",
        "model",
        "modelable",
        "transition",
        "show",
        "if",
        DEFAULT,
        "teleport"
    ];
    function byPriority(a, b) {
        let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
        let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
        return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
    }
    // packages/alpinejs/src/utils/dispatch.js
    function dispatch(el, name, detail = {}) {
        el.dispatchEvent(new CustomEvent(name, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        }));
    }
    // packages/alpinejs/src/utils/walk.js
    function walk(el, callback) {
        if (typeof ShadowRoot === "function" && el instanceof ShadowRoot) {
            Array.from(el.children).forEach((el2)=>walk(el2, callback)
            );
            return;
        }
        let skip = false;
        callback(el, ()=>skip = true
        );
        if (skip) return;
        let node = el.firstElementChild;
        while(node){
            walk(node, callback);
            node = node.nextElementSibling;
        }
    }
    // packages/alpinejs/src/utils/warn.js
    function warn(message, ...args) {
        console.warn(`Alpine Warning: ${message}`, ...args);
    }
    // packages/alpinejs/src/lifecycle.js
    var started = false;
    function start() {
        if (started) warn("Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.");
        started = true;
        if (!document.body) warn("Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?");
        dispatch(document, "alpine:init");
        dispatch(document, "alpine:initializing");
        startObservingMutations();
        onElAdded((el)=>initTree(el, walk)
        );
        onElRemoved((el)=>destroyTree(el)
        );
        onAttributesAdded((el, attrs)=>{
            directives(el, attrs).forEach((handle)=>handle()
            );
        });
        let outNestedComponents = (el)=>!closestRoot(el.parentElement, true)
        ;
        Array.from(document.querySelectorAll(allSelectors())).filter(outNestedComponents).forEach((el)=>{
            initTree(el);
        });
        dispatch(document, "alpine:initialized");
    }
    var rootSelectorCallbacks = [];
    var initSelectorCallbacks = [];
    function rootSelectors() {
        return rootSelectorCallbacks.map((fn)=>fn()
        );
    }
    function allSelectors() {
        return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn)=>fn()
        );
    }
    function addRootSelector(selectorCallback) {
        rootSelectorCallbacks.push(selectorCallback);
    }
    function addInitSelector(selectorCallback) {
        initSelectorCallbacks.push(selectorCallback);
    }
    function closestRoot(el, includeInitSelectors = false) {
        return findClosest(el, (element)=>{
            const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
            if (selectors.some((selector)=>element.matches(selector)
            )) return true;
        });
    }
    function findClosest(el, callback) {
        if (!el) return;
        if (callback(el)) return el;
        if (el._x_teleportBack) el = el._x_teleportBack;
        if (!el.parentElement) return;
        return findClosest(el.parentElement, callback);
    }
    function isRoot(el) {
        return rootSelectors().some((selector)=>el.matches(selector)
        );
    }
    var initInterceptors2 = [];
    function interceptInit(callback) {
        initInterceptors2.push(callback);
    }
    function initTree(el, walker = walk, intercept = ()=>{}) {
        deferHandlingDirectives(()=>{
            walker(el, (el2, skip)=>{
                intercept(el2, skip);
                initInterceptors2.forEach((i)=>i(el2, skip)
                );
                directives(el2, el2.attributes).forEach((handle)=>handle()
                );
                el2._x_ignore && skip();
            });
        });
    }
    function destroyTree(root) {
        walk(root, (el)=>cleanupAttributes(el)
        );
    }
    // packages/alpinejs/src/nextTick.js
    var tickStack = [];
    var isHolding = false;
    function nextTick(callback = ()=>{}) {
        queueMicrotask(()=>{
            isHolding || setTimeout(()=>{
                releaseNextTicks();
            });
        });
        return new Promise((res)=>{
            tickStack.push(()=>{
                callback();
                res();
            });
        });
    }
    function releaseNextTicks() {
        isHolding = false;
        while(tickStack.length)tickStack.shift()();
    }
    function holdNextTicks() {
        isHolding = true;
    }
    // packages/alpinejs/src/utils/classes.js
    function setClasses(el, value) {
        if (Array.isArray(value)) {
            return setClassesFromString(el, value.join(" "));
        } else if (typeof value === "object" && value !== null) {
            return setClassesFromObject(el, value);
        } else if (typeof value === "function") {
            return setClasses(el, value());
        }
        return setClassesFromString(el, value);
    }
    function setClassesFromString(el, classString) {
        let missingClasses = (classString2)=>classString2.split(" ").filter((i)=>!el.classList.contains(i)
            ).filter(Boolean)
        ;
        let addClassesAndReturnUndo = (classes)=>{
            el.classList.add(...classes);
            return ()=>{
                el.classList.remove(...classes);
            };
        };
        classString = classString === true ? classString = "" : classString || "";
        return addClassesAndReturnUndo(missingClasses(classString));
    }
    function setClassesFromObject(el, classObject) {
        let split = (classString)=>classString.split(" ").filter(Boolean)
        ;
        let forAdd = Object.entries(classObject).flatMap(([classString, bool])=>bool ? split(classString) : false
        ).filter(Boolean);
        let forRemove = Object.entries(classObject).flatMap(([classString, bool])=>!bool ? split(classString) : false
        ).filter(Boolean);
        let added = [];
        let removed = [];
        forRemove.forEach((i)=>{
            if (el.classList.contains(i)) {
                el.classList.remove(i);
                removed.push(i);
            }
        });
        forAdd.forEach((i)=>{
            if (!el.classList.contains(i)) {
                el.classList.add(i);
                added.push(i);
            }
        });
        return ()=>{
            removed.forEach((i)=>el.classList.add(i)
            );
            added.forEach((i)=>el.classList.remove(i)
            );
        };
    }
    // packages/alpinejs/src/utils/styles.js
    function setStyles(el, value) {
        if (typeof value === "object" && value !== null) {
            return setStylesFromObject(el, value);
        }
        return setStylesFromString(el, value);
    }
    function setStylesFromObject(el, value) {
        let previousStyles = {};
        Object.entries(value).forEach(([key, value2])=>{
            previousStyles[key] = el.style[key];
            if (!key.startsWith("--")) {
                key = kebabCase(key);
            }
            el.style.setProperty(key, value2);
        });
        setTimeout(()=>{
            if (el.style.length === 0) {
                el.removeAttribute("style");
            }
        });
        return ()=>{
            setStyles(el, previousStyles);
        };
    }
    function setStylesFromString(el, value) {
        let cache = el.getAttribute("style", value);
        el.setAttribute("style", value);
        return ()=>{
            el.setAttribute("style", cache || "");
        };
    }
    function kebabCase(subject) {
        return subject.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    }
    // packages/alpinejs/src/utils/once.js
    function once(callback, fallback = ()=>{}) {
        let called = false;
        return function() {
            if (!called) {
                called = true;
                callback.apply(this, arguments);
            } else {
                fallback.apply(this, arguments);
            }
        };
    }
    // packages/alpinejs/src/directives/x-transition.js
    directive("transition", (el, { value , modifiers , expression  }, { evaluate: evaluate2  })=>{
        if (typeof expression === "function") expression = evaluate2(expression);
        if (expression === false) return;
        if (!expression || typeof expression === "boolean") {
            registerTransitionsFromHelper(el, modifiers, value);
        } else {
            registerTransitionsFromClassString(el, expression, value);
        }
    });
    function registerTransitionsFromClassString(el, classString, stage) {
        registerTransitionObject(el, setClasses, "");
        let directiveStorageMap = {
            enter: (classes)=>{
                el._x_transition.enter.during = classes;
            },
            "enter-start": (classes)=>{
                el._x_transition.enter.start = classes;
            },
            "enter-end": (classes)=>{
                el._x_transition.enter.end = classes;
            },
            leave: (classes)=>{
                el._x_transition.leave.during = classes;
            },
            "leave-start": (classes)=>{
                el._x_transition.leave.start = classes;
            },
            "leave-end": (classes)=>{
                el._x_transition.leave.end = classes;
            }
        };
        directiveStorageMap[stage](classString);
    }
    function registerTransitionsFromHelper(el, modifiers, stage) {
        registerTransitionObject(el, setStyles);
        let doesntSpecify = !modifiers.includes("in") && !modifiers.includes("out") && !stage;
        let transitioningIn = doesntSpecify || modifiers.includes("in") || [
            "enter"
        ].includes(stage);
        let transitioningOut = doesntSpecify || modifiers.includes("out") || [
            "leave"
        ].includes(stage);
        if (modifiers.includes("in") && !doesntSpecify) {
            modifiers = modifiers.filter((i, index)=>index < modifiers.indexOf("out")
            );
        }
        if (modifiers.includes("out") && !doesntSpecify) {
            modifiers = modifiers.filter((i, index)=>index > modifiers.indexOf("out")
            );
        }
        let wantsAll = !modifiers.includes("opacity") && !modifiers.includes("scale");
        let wantsOpacity = wantsAll || modifiers.includes("opacity");
        let wantsScale = wantsAll || modifiers.includes("scale");
        let opacityValue = wantsOpacity ? 0 : 1;
        let scaleValue = wantsScale ? modifierValue(modifiers, "scale", 95) / 100 : 1;
        let delay = modifierValue(modifiers, "delay", 0) / 1e3;
        let origin = modifierValue(modifiers, "origin", "center");
        let property = "opacity, transform";
        let durationIn = modifierValue(modifiers, "duration", 150) / 1e3;
        let durationOut = modifierValue(modifiers, "duration", 75) / 1e3;
        let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
        if (transitioningIn) {
            el._x_transition.enter.during = {
                transformOrigin: origin,
                transitionDelay: `${delay}s`,
                transitionProperty: property,
                transitionDuration: `${durationIn}s`,
                transitionTimingFunction: easing
            };
            el._x_transition.enter.start = {
                opacity: opacityValue,
                transform: `scale(${scaleValue})`
            };
            el._x_transition.enter.end = {
                opacity: 1,
                transform: `scale(1)`
            };
        }
        if (transitioningOut) {
            el._x_transition.leave.during = {
                transformOrigin: origin,
                transitionDelay: `${delay}s`,
                transitionProperty: property,
                transitionDuration: `${durationOut}s`,
                transitionTimingFunction: easing
            };
            el._x_transition.leave.start = {
                opacity: 1,
                transform: `scale(1)`
            };
            el._x_transition.leave.end = {
                opacity: opacityValue,
                transform: `scale(${scaleValue})`
            };
        }
    }
    function registerTransitionObject(el, setFunction, defaultValue = {}) {
        if (!el._x_transition) el._x_transition = {
            enter: {
                during: defaultValue,
                start: defaultValue,
                end: defaultValue
            },
            leave: {
                during: defaultValue,
                start: defaultValue,
                end: defaultValue
            },
            in (before = ()=>{}, after = ()=>{}) {
                transition(el, setFunction, {
                    during: this.enter.during,
                    start: this.enter.start,
                    end: this.enter.end
                }, before, after);
            },
            out (before = ()=>{}, after = ()=>{}) {
                transition(el, setFunction, {
                    during: this.leave.during,
                    start: this.leave.start,
                    end: this.leave.end
                }, before, after);
            }
        };
    }
    window.Element.prototype._x_toggleAndCascadeWithTransitions = function(el, value, show, hide) {
        const nextTick2 = document.visibilityState === "visible" ? requestAnimationFrame : setTimeout;
        let clickAwayCompatibleShow = ()=>nextTick2(show)
        ;
        if (value) {
            if (el._x_transition && (el._x_transition.enter || el._x_transition.leave)) {
                el._x_transition.enter && (Object.entries(el._x_transition.enter.during).length || Object.entries(el._x_transition.enter.start).length || Object.entries(el._x_transition.enter.end).length) ? el._x_transition.in(show) : clickAwayCompatibleShow();
            } else {
                el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
            }
            return;
        }
        el._x_hidePromise = el._x_transition ? new Promise((resolve, reject)=>{
            el._x_transition.out(()=>{}, ()=>resolve(hide)
            );
            el._x_transitioning.beforeCancel(()=>reject({
                    isFromCancelledTransition: true
                })
            );
        }) : Promise.resolve(hide);
        queueMicrotask(()=>{
            let closest = closestHide(el);
            if (closest) {
                if (!closest._x_hideChildren) closest._x_hideChildren = [];
                closest._x_hideChildren.push(el);
            } else {
                nextTick2(()=>{
                    let hideAfterChildren = (el2)=>{
                        let carry = Promise.all([
                            el2._x_hidePromise,
                            ...(el2._x_hideChildren || []).map(hideAfterChildren)
                        ]).then(([i])=>i()
                        );
                        delete el2._x_hidePromise;
                        delete el2._x_hideChildren;
                        return carry;
                    };
                    hideAfterChildren(el).catch((e)=>{
                        if (!e.isFromCancelledTransition) throw e;
                    });
                });
            }
        });
    };
    function closestHide(el) {
        let parent = el.parentNode;
        if (!parent) return;
        return parent._x_hidePromise ? parent : closestHide(parent);
    }
    function transition(el, setFunction, { during , start: start2 , end  } = {}, before = ()=>{}, after = ()=>{}) {
        if (el._x_transitioning) el._x_transitioning.cancel();
        if (Object.keys(during).length === 0 && Object.keys(start2).length === 0 && Object.keys(end).length === 0) {
            before();
            after();
            return;
        }
        let undoStart, undoDuring, undoEnd;
        performTransition(el, {
            start () {
                undoStart = setFunction(el, start2);
            },
            during () {
                undoDuring = setFunction(el, during);
            },
            before,
            end () {
                undoStart();
                undoEnd = setFunction(el, end);
            },
            after,
            cleanup () {
                undoDuring();
                undoEnd();
            }
        });
    }
    function performTransition(el, stages) {
        let interrupted, reachedBefore, reachedEnd;
        let finish = once(()=>{
            mutateDom(()=>{
                interrupted = true;
                if (!reachedBefore) stages.before();
                if (!reachedEnd) {
                    stages.end();
                    releaseNextTicks();
                }
                stages.after();
                if (el.isConnected) stages.cleanup();
                delete el._x_transitioning;
            });
        });
        el._x_transitioning = {
            beforeCancels: [],
            beforeCancel (callback) {
                this.beforeCancels.push(callback);
            },
            cancel: once(function() {
                while(this.beforeCancels.length){
                    this.beforeCancels.shift()();
                }
                finish();
            }),
            finish
        };
        mutateDom(()=>{
            stages.start();
            stages.during();
        });
        holdNextTicks();
        requestAnimationFrame(()=>{
            if (interrupted) return;
            let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, "").replace("s", "")) * 1e3;
            let delay = Number(getComputedStyle(el).transitionDelay.replace(/,.*/, "").replace("s", "")) * 1e3;
            if (duration === 0) duration = Number(getComputedStyle(el).animationDuration.replace("s", "")) * 1e3;
            mutateDom(()=>{
                stages.before();
            });
            reachedBefore = true;
            requestAnimationFrame(()=>{
                if (interrupted) return;
                mutateDom(()=>{
                    stages.end();
                });
                releaseNextTicks();
                setTimeout(el._x_transitioning.finish, duration + delay);
                reachedEnd = true;
            });
        });
    }
    function modifierValue(modifiers, key, fallback) {
        if (modifiers.indexOf(key) === -1) return fallback;
        const rawValue = modifiers[modifiers.indexOf(key) + 1];
        if (!rawValue) return fallback;
        if (key === "scale") {
            if (isNaN(rawValue)) return fallback;
        }
        if (key === "duration" || key === "delay") {
            let match = rawValue.match(/([0-9]+)ms/);
            if (match) return match[1];
        }
        if (key === "origin") {
            if ([
                "top",
                "right",
                "left",
                "center",
                "bottom"
            ].includes(modifiers[modifiers.indexOf(key) + 2])) {
                return [
                    rawValue,
                    modifiers[modifiers.indexOf(key) + 2]
                ].join(" ");
            }
        }
        return rawValue;
    }
    // packages/alpinejs/src/clone.js
    var isCloning = false;
    function skipDuringClone(callback, fallback = ()=>{}) {
        return (...args)=>isCloning ? fallback(...args) : callback(...args)
        ;
    }
    function onlyDuringClone(callback) {
        return (...args)=>isCloning && callback(...args)
        ;
    }
    function clone(oldEl, newEl) {
        if (!newEl._x_dataStack) newEl._x_dataStack = oldEl._x_dataStack;
        isCloning = true;
        dontRegisterReactiveSideEffects(()=>{
            cloneTree(newEl);
        });
        isCloning = false;
    }
    function cloneTree(el) {
        let hasRunThroughFirstEl = false;
        let shallowWalker = (el2, callback)=>{
            walk(el2, (el3, skip)=>{
                if (hasRunThroughFirstEl && isRoot(el3)) return skip();
                hasRunThroughFirstEl = true;
                callback(el3, skip);
            });
        };
        initTree(el, shallowWalker);
    }
    function dontRegisterReactiveSideEffects(callback) {
        let cache = effect;
        overrideEffect((callback2, el)=>{
            let storedEffect = cache(callback2);
            release(storedEffect);
            return ()=>{};
        });
        callback();
        overrideEffect(cache);
    }
    // packages/alpinejs/src/utils/bind.js
    function bind(el, name, value, modifiers = []) {
        if (!el._x_bindings) el._x_bindings = reactive({});
        el._x_bindings[name] = value;
        name = modifiers.includes("camel") ? camelCase(name) : name;
        switch(name){
            case "value":
                bindInputValue(el, value);
                break;
            case "style":
                bindStyles(el, value);
                break;
            case "class":
                bindClasses(el, value);
                break;
            case "selected":
            case "checked":
                bindAttributeAndProperty(el, name, value);
                break;
            default:
                bindAttribute(el, name, value);
                break;
        }
    }
    function bindInputValue(el, value) {
        if (el.type === "radio") {
            if (el.attributes.value === void 0) {
                el.value = value;
            }
            if (window.fromModel) {
                el.checked = checkedAttrLooseCompare(el.value, value);
            }
        } else if (el.type === "checkbox") {
            if (Number.isInteger(value)) {
                el.value = value;
            } else if (!Number.isInteger(value) && !Array.isArray(value) && typeof value !== "boolean" && ![
                null,
                void 0
            ].includes(value)) {
                el.value = String(value);
            } else {
                if (Array.isArray(value)) {
                    el.checked = value.some((val)=>checkedAttrLooseCompare(val, el.value)
                    );
                } else {
                    el.checked = !!value;
                }
            }
        } else if (el.tagName === "SELECT") {
            updateSelect(el, value);
        } else {
            if (el.value === value) return;
            el.value = value;
        }
    }
    function bindClasses(el, value) {
        if (el._x_undoAddedClasses) el._x_undoAddedClasses();
        el._x_undoAddedClasses = setClasses(el, value);
    }
    function bindStyles(el, value) {
        if (el._x_undoAddedStyles) el._x_undoAddedStyles();
        el._x_undoAddedStyles = setStyles(el, value);
    }
    function bindAttributeAndProperty(el, name, value) {
        bindAttribute(el, name, value);
        setPropertyIfChanged(el, name, value);
    }
    function bindAttribute(el, name, value) {
        if ([
            null,
            void 0,
            false
        ].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
            el.removeAttribute(name);
        } else {
            if (isBooleanAttr(name)) value = name;
            setIfChanged(el, name, value);
        }
    }
    function setIfChanged(el, attrName, value) {
        if (el.getAttribute(attrName) != value) {
            el.setAttribute(attrName, value);
        }
    }
    function setPropertyIfChanged(el, propName, value) {
        if (el[propName] !== value) {
            el[propName] = value;
        }
    }
    function updateSelect(el, value) {
        const arrayWrappedValue = [].concat(value).map((value2)=>{
            return value2 + "";
        });
        Array.from(el.options).forEach((option)=>{
            option.selected = arrayWrappedValue.includes(option.value);
        });
    }
    function camelCase(subject) {
        return subject.toLowerCase().replace(/-(\w)/g, (match, char)=>char.toUpperCase()
        );
    }
    function checkedAttrLooseCompare(valueA, valueB) {
        return valueA == valueB;
    }
    function isBooleanAttr(attrName) {
        const booleanAttributes = [
            "disabled",
            "checked",
            "required",
            "readonly",
            "hidden",
            "open",
            "selected",
            "autofocus",
            "itemscope",
            "multiple",
            "novalidate",
            "allowfullscreen",
            "allowpaymentrequest",
            "formnovalidate",
            "autoplay",
            "controls",
            "loop",
            "muted",
            "playsinline",
            "default",
            "ismap",
            "reversed",
            "async",
            "defer",
            "nomodule"
        ];
        return booleanAttributes.includes(attrName);
    }
    function attributeShouldntBePreservedIfFalsy(name) {
        return ![
            "aria-pressed",
            "aria-checked",
            "aria-expanded",
            "aria-selected"
        ].includes(name);
    }
    function getBinding(el, name, fallback) {
        if (el._x_bindings && el._x_bindings[name] !== void 0) return el._x_bindings[name];
        return getAttributeBinding(el, name, fallback);
    }
    function extractProp(el, name, fallback, extract = true) {
        if (el._x_bindings && el._x_bindings[name] !== void 0) return el._x_bindings[name];
        if (el._x_inlineBindings && el._x_inlineBindings[name] !== void 0) {
            let binding = el._x_inlineBindings[name];
            binding.extract = extract;
            return dontAutoEvaluateFunctions(()=>{
                return evaluate(el, binding.expression);
            });
        }
        return getAttributeBinding(el, name, fallback);
    }
    function getAttributeBinding(el, name, fallback) {
        let attr = el.getAttribute(name);
        if (attr === null) return typeof fallback === "function" ? fallback() : fallback;
        if (attr === "") return true;
        if (isBooleanAttr(name)) {
            return !![
                name,
                "true"
            ].includes(attr);
        }
        return attr;
    }
    // packages/alpinejs/src/utils/debounce.js
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    // packages/alpinejs/src/utils/throttle.js
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            let context = this, args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(()=>inThrottle = false
                , limit);
            }
        };
    }
    // packages/alpinejs/src/plugin.js
    function plugin(callback) {
        let callbacks = Array.isArray(callback) ? callback : [
            callback
        ];
        callbacks.forEach((i)=>i(alpine_default)
        );
    }
    // packages/alpinejs/src/store.js
    var stores = {};
    var isReactive = false;
    function store(name, value) {
        if (!isReactive) {
            stores = reactive(stores);
            isReactive = true;
        }
        if (value === void 0) {
            return stores[name];
        }
        stores[name] = value;
        if (typeof value === "object" && value !== null && value.hasOwnProperty("init") && typeof value.init === "function") {
            stores[name].init();
        }
        initInterceptors(stores[name]);
    }
    function getStores() {
        return stores;
    }
    // packages/alpinejs/src/binds.js
    var binds = {};
    function bind2(name, bindings) {
        let getBindings = typeof bindings !== "function" ? ()=>bindings
         : bindings;
        if (name instanceof Element) {
            applyBindingsObject(name, getBindings());
        } else {
            binds[name] = getBindings;
        }
    }
    function injectBindingProviders(obj) {
        Object.entries(binds).forEach(([name, callback])=>{
            Object.defineProperty(obj, name, {
                get () {
                    return (...args)=>{
                        return callback(...args);
                    };
                }
            });
        });
        return obj;
    }
    function applyBindingsObject(el, obj, original) {
        let cleanupRunners = [];
        while(cleanupRunners.length)cleanupRunners.pop()();
        let attributes = Object.entries(obj).map(([name, value])=>({
                name,
                value
            })
        );
        let staticAttributes = attributesOnly(attributes);
        attributes = attributes.map((attribute)=>{
            if (staticAttributes.find((attr)=>attr.name === attribute.name
            )) {
                return {
                    name: `x-bind:${attribute.name}`,
                    value: `"${attribute.value}"`
                };
            }
            return attribute;
        });
        directives(el, attributes, original).map((handle)=>{
            cleanupRunners.push(handle.runCleanups);
            handle();
        });
    }
    // packages/alpinejs/src/datas.js
    var datas = {};
    function data$1(name, callback) {
        datas[name] = callback;
    }
    function injectDataProviders(obj, context) {
        Object.entries(datas).forEach(([name, callback])=>{
            Object.defineProperty(obj, name, {
                get () {
                    return (...args)=>{
                        return callback.bind(context)(...args);
                    };
                },
                enumerable: false
            });
        });
        return obj;
    }
    // packages/alpinejs/src/alpine.js
    var Alpine$1 = {
        get reactive () {
            return reactive;
        },
        get release () {
            return release;
        },
        get effect () {
            return effect;
        },
        get raw () {
            return raw;
        },
        version: "3.12.3",
        flushAndStopDeferringMutations,
        dontAutoEvaluateFunctions,
        disableEffectScheduling,
        startObservingMutations,
        stopObservingMutations,
        setReactivityEngine,
        closestDataStack,
        skipDuringClone,
        onlyDuringClone,
        addRootSelector,
        addInitSelector,
        addScopeToNode,
        deferMutations,
        mapAttributes,
        evaluateLater,
        interceptInit,
        setEvaluator,
        mergeProxies,
        extractProp,
        findClosest,
        closestRoot,
        destroyTree,
        interceptor,
        transition,
        setStyles,
        mutateDom,
        directive,
        throttle,
        debounce,
        evaluate,
        initTree,
        nextTick,
        prefixed: prefix,
        prefix: setPrefix,
        plugin,
        magic,
        store,
        start,
        clone,
        bound: getBinding,
        $data: scope,
        walk,
        data: data$1,
        bind: bind2
    };
    var alpine_default = Alpine$1;
    // node_modules/@vue/shared/dist/shared.esm-bundler.js
    function makeMap(str, expectsLowerCase) {
        const map = Object.create(null);
        const list = str.split(",");
        for(let i = 0; i < list.length; i++){
            map[list[i]] = true;
        }
        return (val)=>!!map[val]
        ;
    }
    var EMPTY_OBJ = Object.freeze({}) ;
    var extend = Object.assign;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var hasOwn = (val, key)=>hasOwnProperty.call(val, key)
    ;
    var isArray = Array.isArray;
    var isMap = (val)=>toTypeString(val) === "[object Map]"
    ;
    var isString$1 = (val)=>typeof val === "string"
    ;
    var isSymbol = (val)=>typeof val === "symbol"
    ;
    var isObject = (val)=>val !== null && typeof val === "object"
    ;
    var objectToString = Object.prototype.toString;
    var toTypeString = (value)=>objectToString.call(value)
    ;
    var toRawType = (value)=>{
        return toTypeString(value).slice(8, -1);
    };
    var isIntegerKey = (key)=>isString$1(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key
    ;
    var cacheStringFunction = (fn)=>{
        const cache = Object.create(null);
        return (str)=>{
            const hit = cache[str];
            return hit || (cache[str] = fn(str));
        };
    };
    var capitalize = cacheStringFunction((str)=>str.charAt(0).toUpperCase() + str.slice(1)
    );
    var hasChanged = (value, oldValue)=>value !== oldValue && (value === value || oldValue === oldValue)
    ;
    // node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
    var targetMap = new WeakMap();
    var effectStack = [];
    var activeEffect;
    var ITERATE_KEY = Symbol("iterate" );
    var MAP_KEY_ITERATE_KEY = Symbol("Map key iterate" );
    function isEffect(fn) {
        return fn && fn._isEffect === true;
    }
    function effect2(fn, options = EMPTY_OBJ) {
        if (isEffect(fn)) {
            fn = fn.raw;
        }
        const effect3 = createReactiveEffect(fn, options);
        if (!options.lazy) {
            effect3();
        }
        return effect3;
    }
    function stop(effect3) {
        if (effect3.active) {
            cleanup(effect3);
            if (effect3.options.onStop) {
                effect3.options.onStop();
            }
            effect3.active = false;
        }
    }
    var uid = 0;
    function createReactiveEffect(fn, options) {
        const effect3 = function reactiveEffect() {
            if (!effect3.active) {
                return fn();
            }
            if (!effectStack.includes(effect3)) {
                cleanup(effect3);
                try {
                    enableTracking();
                    effectStack.push(effect3);
                    activeEffect = effect3;
                    return fn();
                } finally{
                    effectStack.pop();
                    resetTracking();
                    activeEffect = effectStack[effectStack.length - 1];
                }
            }
        };
        effect3.id = uid++;
        effect3.allowRecurse = !!options.allowRecurse;
        effect3._isEffect = true;
        effect3.active = true;
        effect3.raw = fn;
        effect3.deps = [];
        effect3.options = options;
        return effect3;
    }
    function cleanup(effect3) {
        const { deps  } = effect3;
        if (deps.length) {
            for(let i = 0; i < deps.length; i++){
                deps[i].delete(effect3);
            }
            deps.length = 0;
        }
    }
    var shouldTrack = true;
    var trackStack = [];
    function pauseTracking() {
        trackStack.push(shouldTrack);
        shouldTrack = false;
    }
    function enableTracking() {
        trackStack.push(shouldTrack);
        shouldTrack = true;
    }
    function resetTracking() {
        const last = trackStack.pop();
        shouldTrack = last === void 0 ? true : last;
    }
    function track(target, type, key) {
        if (!shouldTrack || activeEffect === void 0) {
            return;
        }
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, depsMap = new Map());
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, dep = new Set());
        }
        if (!dep.has(activeEffect)) {
            dep.add(activeEffect);
            activeEffect.deps.push(dep);
            if (activeEffect.options.onTrack) {
                activeEffect.options.onTrack({
                    effect: activeEffect,
                    target,
                    type,
                    key
                });
            }
        }
    }
    function trigger(target, type, key, newValue, oldValue, oldTarget) {
        const depsMap = targetMap.get(target);
        if (!depsMap) {
            return;
        }
        const effects = new Set();
        const add2 = (effectsToAdd)=>{
            if (effectsToAdd) {
                effectsToAdd.forEach((effect3)=>{
                    if (effect3 !== activeEffect || effect3.allowRecurse) {
                        effects.add(effect3);
                    }
                });
            }
        };
        if (type === "clear") {
            depsMap.forEach(add2);
        } else if (key === "length" && isArray(target)) {
            depsMap.forEach((dep, key2)=>{
                if (key2 === "length" || key2 >= newValue) {
                    add2(dep);
                }
            });
        } else {
            if (key !== void 0) {
                add2(depsMap.get(key));
            }
            switch(type){
                case "add":
                    if (!isArray(target)) {
                        add2(depsMap.get(ITERATE_KEY));
                        if (isMap(target)) {
                            add2(depsMap.get(MAP_KEY_ITERATE_KEY));
                        }
                    } else if (isIntegerKey(key)) {
                        add2(depsMap.get("length"));
                    }
                    break;
                case "delete":
                    if (!isArray(target)) {
                        add2(depsMap.get(ITERATE_KEY));
                        if (isMap(target)) {
                            add2(depsMap.get(MAP_KEY_ITERATE_KEY));
                        }
                    }
                    break;
                case "set":
                    if (isMap(target)) {
                        add2(depsMap.get(ITERATE_KEY));
                    }
                    break;
            }
        }
        const run = (effect3)=>{
            if (effect3.options.onTrigger) {
                effect3.options.onTrigger({
                    effect: effect3,
                    target,
                    key,
                    type,
                    newValue,
                    oldValue,
                    oldTarget
                });
            }
            if (effect3.options.scheduler) {
                effect3.options.scheduler(effect3);
            } else {
                effect3();
            }
        };
        effects.forEach(run);
    }
    var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
    var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map((key)=>Symbol[key]
    ).filter(isSymbol));
    var get2 = /* @__PURE__ */ createGetter();
    var shallowGet = /* @__PURE__ */ createGetter(false, true);
    var readonlyGet = /* @__PURE__ */ createGetter(true);
    var shallowReadonlyGet = /* @__PURE__ */ createGetter(true, true);
    var arrayInstrumentations = {};
    [
        "includes",
        "indexOf",
        "lastIndexOf"
    ].forEach((key)=>{
        const method = Array.prototype[key];
        arrayInstrumentations[key] = function(...args) {
            const arr = toRaw(this);
            for(let i = 0, l = this.length; i < l; i++){
                track(arr, "get", i + "");
            }
            const res = method.apply(arr, args);
            if (res === -1 || res === false) {
                return method.apply(arr, args.map(toRaw));
            } else {
                return res;
            }
        };
    });
    [
        "push",
        "pop",
        "shift",
        "unshift",
        "splice"
    ].forEach((key)=>{
        const method = Array.prototype[key];
        arrayInstrumentations[key] = function(...args) {
            pauseTracking();
            const res = method.apply(this, args);
            resetTracking();
            return res;
        };
    });
    function createGetter(isReadonly = false, shallow = false) {
        return function get3(target, key, receiver) {
            if (key === "__v_isReactive") {
                return !isReadonly;
            } else if (key === "__v_isReadonly") {
                return isReadonly;
            } else if (key === "__v_raw" && receiver === (isReadonly ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
                return target;
            }
            const targetIsArray = isArray(target);
            if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
                return Reflect.get(arrayInstrumentations, key, receiver);
            }
            const res = Reflect.get(target, key, receiver);
            if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
                return res;
            }
            if (!isReadonly) {
                track(target, "get", key);
            }
            if (shallow) {
                return res;
            }
            if (isRef(res)) {
                const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
                return shouldUnwrap ? res.value : res;
            }
            if (isObject(res)) {
                return isReadonly ? readonly(res) : reactive2(res);
            }
            return res;
        };
    }
    var set2 = /* @__PURE__ */ createSetter();
    var shallowSet = /* @__PURE__ */ createSetter(true);
    function createSetter(shallow = false) {
        return function set3(target, key, value, receiver) {
            let oldValue = target[key];
            if (!shallow) {
                value = toRaw(value);
                oldValue = toRaw(oldValue);
                if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
                    oldValue.value = value;
                    return true;
                }
            }
            const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
            const result = Reflect.set(target, key, value, receiver);
            if (target === toRaw(receiver)) {
                if (!hadKey) {
                    trigger(target, "add", key, value);
                } else if (hasChanged(value, oldValue)) {
                    trigger(target, "set", key, value, oldValue);
                }
            }
            return result;
        };
    }
    function deleteProperty(target, key) {
        const hadKey = hasOwn(target, key);
        const oldValue = target[key];
        const result = Reflect.deleteProperty(target, key);
        if (result && hadKey) {
            trigger(target, "delete", key, void 0, oldValue);
        }
        return result;
    }
    function has(target, key) {
        const result = Reflect.has(target, key);
        if (!isSymbol(key) || !builtInSymbols.has(key)) {
            track(target, "has", key);
        }
        return result;
    }
    function ownKeys(target) {
        track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
        return Reflect.ownKeys(target);
    }
    var mutableHandlers = {
        get: get2,
        set: set2,
        deleteProperty,
        has,
        ownKeys
    };
    var readonlyHandlers = {
        get: readonlyGet,
        set (target, key) {
            {
                console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
            }
            return true;
        },
        deleteProperty (target, key) {
            {
                console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
            }
            return true;
        }
    };
    extend({}, mutableHandlers, {
        get: shallowGet,
        set: shallowSet
    });
    extend({}, readonlyHandlers, {
        get: shallowReadonlyGet
    });
    var toReactive = (value)=>isObject(value) ? reactive2(value) : value
    ;
    var toReadonly = (value)=>isObject(value) ? readonly(value) : value
    ;
    var toShallow = (value)=>value
    ;
    var getProto = (v)=>Reflect.getPrototypeOf(v)
    ;
    function get$1(target, key, isReadonly = false, isShallow = false) {
        target = target["__v_raw"];
        const rawTarget = toRaw(target);
        const rawKey = toRaw(key);
        if (key !== rawKey) {
            !isReadonly && track(rawTarget, "get", key);
        }
        !isReadonly && track(rawTarget, "get", rawKey);
        const { has: has2  } = getProto(rawTarget);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        if (has2.call(rawTarget, key)) {
            return wrap(target.get(key));
        } else if (has2.call(rawTarget, rawKey)) {
            return wrap(target.get(rawKey));
        } else if (target !== rawTarget) {
            target.get(key);
        }
    }
    function has$1(key, isReadonly = false) {
        const target = this["__v_raw"];
        const rawTarget = toRaw(target);
        const rawKey = toRaw(key);
        if (key !== rawKey) {
            !isReadonly && track(rawTarget, "has", key);
        }
        !isReadonly && track(rawTarget, "has", rawKey);
        return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    }
    function size(target, isReadonly = false) {
        target = target["__v_raw"];
        !isReadonly && track(toRaw(target), "iterate", ITERATE_KEY);
        return Reflect.get(target, "size", target);
    }
    function add(value) {
        value = toRaw(value);
        const target = toRaw(this);
        const proto = getProto(target);
        const hadKey = proto.has.call(target, value);
        if (!hadKey) {
            target.add(value);
            trigger(target, "add", value, value);
        }
        return this;
    }
    function set$1(key, value) {
        value = toRaw(value);
        const target = toRaw(this);
        const { has: has2 , get: get3  } = getProto(target);
        let hadKey = has2.call(target, key);
        if (!hadKey) {
            key = toRaw(key);
            hadKey = has2.call(target, key);
        } else {
            checkIdentityKeys(target, has2, key);
        }
        const oldValue = get3.call(target, key);
        target.set(key, value);
        if (!hadKey) {
            trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
            trigger(target, "set", key, value, oldValue);
        }
        return this;
    }
    function deleteEntry(key) {
        const target = toRaw(this);
        const { has: has2 , get: get3  } = getProto(target);
        let hadKey = has2.call(target, key);
        if (!hadKey) {
            key = toRaw(key);
            hadKey = has2.call(target, key);
        } else {
            checkIdentityKeys(target, has2, key);
        }
        const oldValue = get3 ? get3.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
            trigger(target, "delete", key, void 0, oldValue);
        }
        return result;
    }
    function clear() {
        const target = toRaw(this);
        const hadItems = target.size !== 0;
        const oldTarget = isMap(target) ? new Map(target) : new Set(target) ;
        const result = target.clear();
        if (hadItems) {
            trigger(target, "clear", void 0, void 0, oldTarget);
        }
        return result;
    }
    function createForEach(isReadonly, isShallow) {
        return function forEach(callback, thisArg) {
            const observed = this;
            const target = observed["__v_raw"];
            const rawTarget = toRaw(target);
            const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
            !isReadonly && track(rawTarget, "iterate", ITERATE_KEY);
            return target.forEach((value, key)=>{
                return callback.call(thisArg, wrap(value), wrap(key), observed);
            });
        };
    }
    function createIterableMethod(method, isReadonly, isShallow) {
        return function(...args) {
            const target = this["__v_raw"];
            const rawTarget = toRaw(target);
            const targetIsMap = isMap(rawTarget);
            const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
            const isKeyOnly = method === "keys" && targetIsMap;
            const innerIterator = target[method](...args);
            const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
            !isReadonly && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
            return {
                next () {
                    const { value , done  } = innerIterator.next();
                    return done ? {
                        value,
                        done
                    } : {
                        value: isPair ? [
                            wrap(value[0]),
                            wrap(value[1])
                        ] : wrap(value),
                        done
                    };
                },
                [Symbol.iterator] () {
                    return this;
                }
            };
        };
    }
    function createReadonlyMethod(type) {
        return function(...args) {
            {
                const key = args[0] ? `on key "${args[0]}" ` : ``;
                console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
            }
            return type === "delete" ? false : this;
        };
    }
    var mutableInstrumentations = {
        get (key) {
            return get$1(this, key);
        },
        get size () {
            return size(this);
        },
        has: has$1,
        add,
        set: set$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, false)
    };
    var shallowInstrumentations = {
        get (key) {
            return get$1(this, key, false, true);
        },
        get size () {
            return size(this);
        },
        has: has$1,
        add,
        set: set$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, true)
    };
    var readonlyInstrumentations = {
        get (key) {
            return get$1(this, key, true);
        },
        get size () {
            return size(this, true);
        },
        has (key) {
            return has$1.call(this, key, true);
        },
        add: createReadonlyMethod("add"),
        set: createReadonlyMethod("set"),
        delete: createReadonlyMethod("delete"),
        clear: createReadonlyMethod("clear"),
        forEach: createForEach(true, false)
    };
    var shallowReadonlyInstrumentations = {
        get (key) {
            return get$1(this, key, true, true);
        },
        get size () {
            return size(this, true);
        },
        has (key) {
            return has$1.call(this, key, true);
        },
        add: createReadonlyMethod("add"),
        set: createReadonlyMethod("set"),
        delete: createReadonlyMethod("delete"),
        clear: createReadonlyMethod("clear"),
        forEach: createForEach(true, true)
    };
    var iteratorMethods = [
        "keys",
        "values",
        "entries",
        Symbol.iterator
    ];
    iteratorMethods.forEach((method)=>{
        mutableInstrumentations[method] = createIterableMethod(method, false, false);
        readonlyInstrumentations[method] = createIterableMethod(method, true, false);
        shallowInstrumentations[method] = createIterableMethod(method, false, true);
        shallowReadonlyInstrumentations[method] = createIterableMethod(method, true, true);
    });
    function createInstrumentationGetter(isReadonly, shallow) {
        const instrumentations = shallow ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly ? readonlyInstrumentations : mutableInstrumentations;
        return (target, key, receiver)=>{
            if (key === "__v_isReactive") {
                return !isReadonly;
            } else if (key === "__v_isReadonly") {
                return isReadonly;
            } else if (key === "__v_raw") {
                return target;
            }
            return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
        };
    }
    var mutableCollectionHandlers = {
        get: createInstrumentationGetter(false, false)
    };
    var readonlyCollectionHandlers = {
        get: createInstrumentationGetter(true, false)
    };
    function checkIdentityKeys(target, has2, key) {
        const rawKey = toRaw(key);
        if (rawKey !== key && has2.call(target, rawKey)) {
            const type = toRawType(target);
            console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
        }
    }
    var reactiveMap = new WeakMap();
    var shallowReactiveMap = new WeakMap();
    var readonlyMap = new WeakMap();
    var shallowReadonlyMap = new WeakMap();
    function targetTypeMap(rawType) {
        switch(rawType){
            case "Object":
            case "Array":
                return 1;
            case "Map":
            case "Set":
            case "WeakMap":
            case "WeakSet":
                return 2;
            default:
                return 0;
        }
    }
    function getTargetType(value) {
        return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
    }
    function reactive2(target) {
        if (target && target["__v_isReadonly"]) {
            return target;
        }
        return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
    }
    function readonly(target) {
        return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
    }
    function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
        if (!isObject(target)) {
            {
                console.warn(`value cannot be made reactive: ${String(target)}`);
            }
            return target;
        }
        if (target["__v_raw"] && !(isReadonly && target["__v_isReactive"])) {
            return target;
        }
        const existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        const targetType = getTargetType(target);
        if (targetType === 0) {
            return target;
        }
        const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
        proxyMap.set(target, proxy);
        return proxy;
    }
    function toRaw(observed) {
        return observed && toRaw(observed["__v_raw"]) || observed;
    }
    function isRef(r) {
        return Boolean(r && r.__v_isRef === true);
    }
    // packages/alpinejs/src/magics/$nextTick.js
    magic("nextTick", ()=>nextTick
    );
    // packages/alpinejs/src/magics/$dispatch.js
    magic("dispatch", (el)=>dispatch.bind(dispatch, el)
    );
    // packages/alpinejs/src/magics/$watch.js
    magic("watch", (el, { evaluateLater: evaluateLater2 , effect: effect3  })=>(key, callback)=>{
            let evaluate2 = evaluateLater2(key);
            let firstTime = true;
            let oldValue;
            let effectReference = effect3(()=>evaluate2((value)=>{
                    JSON.stringify(value);
                    if (!firstTime) {
                        queueMicrotask(()=>{
                            callback(value, oldValue);
                            oldValue = value;
                        });
                    } else {
                        oldValue = value;
                    }
                    firstTime = false;
                })
            );
            el._x_effects.delete(effectReference);
        }
    );
    // packages/alpinejs/src/magics/$store.js
    magic("store", getStores);
    // packages/alpinejs/src/magics/$data.js
    magic("data", (el)=>scope(el)
    );
    // packages/alpinejs/src/magics/$root.js
    magic("root", (el)=>closestRoot(el)
    );
    // packages/alpinejs/src/magics/$refs.js
    magic("refs", (el)=>{
        if (el._x_refs_proxy) return el._x_refs_proxy;
        el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
        return el._x_refs_proxy;
    });
    function getArrayOfRefObject(el) {
        let refObjects = [];
        let currentEl = el;
        while(currentEl){
            if (currentEl._x_refs) refObjects.push(currentEl._x_refs);
            currentEl = currentEl.parentNode;
        }
        return refObjects;
    }
    // packages/alpinejs/src/ids.js
    var globalIdMemo = {};
    function findAndIncrementId(name) {
        if (!globalIdMemo[name]) globalIdMemo[name] = 0;
        return ++globalIdMemo[name];
    }
    function closestIdRoot(el, name) {
        return findClosest(el, (element)=>{
            if (element._x_ids && element._x_ids[name]) return true;
        });
    }
    function setIdRoot(el, name) {
        if (!el._x_ids) el._x_ids = {};
        if (!el._x_ids[name]) el._x_ids[name] = findAndIncrementId(name);
    }
    // packages/alpinejs/src/magics/$id.js
    magic("id", (el)=>(name, key = null)=>{
            let root = closestIdRoot(el, name);
            let id = root ? root._x_ids[name] : findAndIncrementId(name);
            return key ? `${name}-${id}-${key}` : `${name}-${id}`;
        }
    );
    // packages/alpinejs/src/magics/$el.js
    magic("el", (el)=>el
    );
    // packages/alpinejs/src/magics/index.js
    warnMissingPluginMagic("Focus", "focus", "focus");
    warnMissingPluginMagic("Persist", "persist", "persist");
    function warnMissingPluginMagic(name, magicName, slug) {
        magic(magicName, (el)=>warn(`You can't use [$${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el)
        );
    }
    // packages/alpinejs/src/entangle.js
    function entangle({ get: outerGet , set: outerSet  }, { get: innerGet , set: innerSet  }) {
        let firstRun = true;
        let outerHash, outerHashLatest;
        let reference = effect(()=>{
            let outer, inner;
            if (firstRun) {
                outer = outerGet();
                innerSet(outer);
                inner = innerGet();
                firstRun = false;
            } else {
                outer = outerGet();
                inner = innerGet();
                outerHashLatest = JSON.stringify(outer);
                JSON.stringify(inner);
                if (outerHashLatest !== outerHash) {
                    inner = innerGet();
                    innerSet(outer);
                    inner = outer;
                } else {
                    outerSet(inner);
                    outer = inner;
                }
            }
            outerHash = JSON.stringify(outer);
            JSON.stringify(inner);
        });
        return ()=>{
            release(reference);
        };
    }
    // packages/alpinejs/src/directives/x-modelable.js
    directive("modelable", (el, { expression  }, { effect: effect3 , evaluateLater: evaluateLater2 , cleanup: cleanup2  })=>{
        let func = evaluateLater2(expression);
        let innerGet = ()=>{
            let result;
            func((i)=>result = i
            );
            return result;
        };
        let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
        let innerSet = (val)=>evaluateInnerSet(()=>{}, {
                scope: {
                    __placeholder: val
                }
            })
        ;
        let initialValue = innerGet();
        innerSet(initialValue);
        queueMicrotask(()=>{
            if (!el._x_model) return;
            el._x_removeModelListeners["default"]();
            let outerGet = el._x_model.get;
            let outerSet = el._x_model.set;
            let releaseEntanglement = entangle({
                get () {
                    return outerGet();
                },
                set (value) {
                    outerSet(value);
                }
            }, {
                get () {
                    return innerGet();
                },
                set (value) {
                    innerSet(value);
                }
            });
            cleanup2(releaseEntanglement);
        });
    });
    // packages/alpinejs/src/directives/x-teleport.js
    var teleportContainerDuringClone = document.createElement("div");
    directive("teleport", (el, { modifiers , expression  }, { cleanup: cleanup2  })=>{
        if (el.tagName.toLowerCase() !== "template") warn("x-teleport can only be used on a <template> tag", el);
        let target = skipDuringClone(()=>{
            return document.querySelector(expression);
        }, ()=>{
            return teleportContainerDuringClone;
        })();
        if (!target) warn(`Cannot find x-teleport element for selector: "${expression}"`);
        let clone2 = el.content.cloneNode(true).firstElementChild;
        el._x_teleport = clone2;
        clone2._x_teleportBack = el;
        if (el._x_forwardEvents) {
            el._x_forwardEvents.forEach((eventName)=>{
                clone2.addEventListener(eventName, (e)=>{
                    e.stopPropagation();
                    el.dispatchEvent(new e.constructor(e.type, e));
                });
            });
        }
        addScopeToNode(clone2, {}, el);
        mutateDom(()=>{
            if (modifiers.includes("prepend")) {
                target.parentNode.insertBefore(clone2, target);
            } else if (modifiers.includes("append")) {
                target.parentNode.insertBefore(clone2, target.nextSibling);
            } else {
                target.appendChild(clone2);
            }
            initTree(clone2);
            clone2._x_ignore = true;
        });
        cleanup2(()=>clone2.remove()
        );
    });
    // packages/alpinejs/src/directives/x-ignore.js
    var handler = ()=>{};
    handler.inline = (el, { modifiers  }, { cleanup: cleanup2  })=>{
        modifiers.includes("self") ? el._x_ignoreSelf = true : el._x_ignore = true;
        cleanup2(()=>{
            modifiers.includes("self") ? delete el._x_ignoreSelf : delete el._x_ignore;
        });
    };
    directive("ignore", handler);
    // packages/alpinejs/src/directives/x-effect.js
    directive("effect", (el, { expression  }, { effect: effect3  })=>effect3(evaluateLater(el, expression))
    );
    // packages/alpinejs/src/utils/on.js
    function on(el, event, modifiers, callback) {
        let listenerTarget = el;
        let handler4 = (e)=>callback(e)
        ;
        let options = {};
        let wrapHandler = (callback2, wrapper)=>(e)=>wrapper(callback2, e)
        ;
        if (modifiers.includes("dot")) event = dotSyntax(event);
        if (modifiers.includes("camel")) event = camelCase2(event);
        if (modifiers.includes("passive")) options.passive = true;
        if (modifiers.includes("capture")) options.capture = true;
        if (modifiers.includes("window")) listenerTarget = window;
        if (modifiers.includes("document")) listenerTarget = document;
        if (modifiers.includes("debounce")) {
            let nextModifier = modifiers[modifiers.indexOf("debounce") + 1] || "invalid-wait";
            let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
            handler4 = debounce(handler4, wait);
        }
        if (modifiers.includes("throttle")) {
            let nextModifier = modifiers[modifiers.indexOf("throttle") + 1] || "invalid-wait";
            let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
            handler4 = throttle(handler4, wait);
        }
        if (modifiers.includes("prevent")) handler4 = wrapHandler(handler4, (next, e)=>{
            e.preventDefault();
            next(e);
        });
        if (modifiers.includes("stop")) handler4 = wrapHandler(handler4, (next, e)=>{
            e.stopPropagation();
            next(e);
        });
        if (modifiers.includes("self")) handler4 = wrapHandler(handler4, (next, e)=>{
            e.target === el && next(e);
        });
        if (modifiers.includes("away") || modifiers.includes("outside")) {
            listenerTarget = document;
            handler4 = wrapHandler(handler4, (next, e)=>{
                if (el.contains(e.target)) return;
                if (e.target.isConnected === false) return;
                if (el.offsetWidth < 1 && el.offsetHeight < 1) return;
                if (el._x_isShown === false) return;
                next(e);
            });
        }
        if (modifiers.includes("once")) {
            handler4 = wrapHandler(handler4, (next, e)=>{
                next(e);
                listenerTarget.removeEventListener(event, handler4, options);
            });
        }
        handler4 = wrapHandler(handler4, (next, e)=>{
            if (isKeyEvent(event)) {
                if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
                    return;
                }
            }
            next(e);
        });
        listenerTarget.addEventListener(event, handler4, options);
        return ()=>{
            listenerTarget.removeEventListener(event, handler4, options);
        };
    }
    function dotSyntax(subject) {
        return subject.replace(/-/g, ".");
    }
    function camelCase2(subject) {
        return subject.toLowerCase().replace(/-(\w)/g, (match, char)=>char.toUpperCase()
        );
    }
    function isNumeric(subject) {
        return !Array.isArray(subject) && !isNaN(subject);
    }
    function kebabCase2(subject) {
        if ([
            " ",
            "_"
        ].includes(subject)) return subject;
        return subject.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]/, "-").toLowerCase();
    }
    function isKeyEvent(event) {
        return [
            "keydown",
            "keyup"
        ].includes(event);
    }
    function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
        let keyModifiers = modifiers.filter((i)=>{
            return ![
                "window",
                "document",
                "prevent",
                "stop",
                "once",
                "capture"
            ].includes(i);
        });
        if (keyModifiers.includes("debounce")) {
            let debounceIndex = keyModifiers.indexOf("debounce");
            keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
        }
        if (keyModifiers.includes("throttle")) {
            let debounceIndex = keyModifiers.indexOf("throttle");
            keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
        }
        if (keyModifiers.length === 0) return false;
        if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0])) return false;
        const systemKeyModifiers = [
            "ctrl",
            "shift",
            "alt",
            "meta",
            "cmd",
            "super"
        ];
        const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier)=>keyModifiers.includes(modifier)
        );
        keyModifiers = keyModifiers.filter((i)=>!selectedSystemKeyModifiers.includes(i)
        );
        if (selectedSystemKeyModifiers.length > 0) {
            const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier)=>{
                if (modifier === "cmd" || modifier === "super") modifier = "meta";
                return e[`${modifier}Key`];
            });
            if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
                if (keyToModifiers(e.key).includes(keyModifiers[0])) return false;
            }
        }
        return true;
    }
    function keyToModifiers(key) {
        if (!key) return [];
        key = kebabCase2(key);
        let modifierToKeyMap = {
            ctrl: "control",
            slash: "/",
            space: " ",
            spacebar: " ",
            cmd: "meta",
            esc: "escape",
            up: "arrow-up",
            down: "arrow-down",
            left: "arrow-left",
            right: "arrow-right",
            period: ".",
            equal: "=",
            minus: "-",
            underscore: "_"
        };
        modifierToKeyMap[key] = key;
        return Object.keys(modifierToKeyMap).map((modifier)=>{
            if (modifierToKeyMap[modifier] === key) return modifier;
        }).filter((modifier)=>modifier
        );
    }
    // packages/alpinejs/src/directives/x-model.js
    directive("model", (el, { modifiers , expression  }, { effect: effect3 , cleanup: cleanup2  })=>{
        let scopeTarget = el;
        if (modifiers.includes("parent")) {
            scopeTarget = el.parentNode;
        }
        let evaluateGet = evaluateLater(scopeTarget, expression);
        let evaluateSet;
        if (typeof expression === "string") {
            evaluateSet = evaluateLater(scopeTarget, `${expression} = __placeholder`);
        } else if (typeof expression === "function" && typeof expression() === "string") {
            evaluateSet = evaluateLater(scopeTarget, `${expression()} = __placeholder`);
        } else {
            evaluateSet = ()=>{};
        }
        let getValue = ()=>{
            let result;
            evaluateGet((value)=>result = value
            );
            return isGetterSetter(result) ? result.get() : result;
        };
        let setValue = (value)=>{
            let result;
            evaluateGet((value2)=>result = value2
            );
            if (isGetterSetter(result)) {
                result.set(value);
            } else {
                evaluateSet(()=>{}, {
                    scope: {
                        __placeholder: value
                    }
                });
            }
        };
        if (typeof expression === "string" && el.type === "radio") {
            mutateDom(()=>{
                if (!el.hasAttribute("name")) el.setAttribute("name", expression);
            });
        }
        var event = el.tagName.toLowerCase() === "select" || [
            "checkbox",
            "radio"
        ].includes(el.type) || modifiers.includes("lazy") ? "change" : "input";
        let removeListener = isCloning ? ()=>{} : on(el, event, modifiers, (e)=>{
            setValue(getInputValue(el, modifiers, e, getValue()));
        });
        if (modifiers.includes("fill") && [
            null,
            ""
        ].includes(getValue())) {
            el.dispatchEvent(new Event(event, {}));
        }
        if (!el._x_removeModelListeners) el._x_removeModelListeners = {};
        el._x_removeModelListeners["default"] = removeListener;
        cleanup2(()=>el._x_removeModelListeners["default"]()
        );
        if (el.form) {
            let removeResetListener = on(el.form, "reset", [], (e)=>{
                nextTick(()=>el._x_model && el._x_model.set(el.value)
                );
            });
            cleanup2(()=>removeResetListener()
            );
        }
        el._x_model = {
            get () {
                return getValue();
            },
            set (value) {
                setValue(value);
            }
        };
        el._x_forceModelUpdate = (value)=>{
            value = value === void 0 ? getValue() : value;
            if (value === void 0 && typeof expression === "string" && expression.match(/\./)) value = "";
            window.fromModel = true;
            mutateDom(()=>bind(el, "value", value)
            );
            delete window.fromModel;
        };
        effect3(()=>{
            let value = getValue();
            if (modifiers.includes("unintrusive") && document.activeElement.isSameNode(el)) return;
            el._x_forceModelUpdate(value);
        });
    });
    function getInputValue(el, modifiers, event, currentValue) {
        return mutateDom(()=>{
            var _detail;
            if (event instanceof CustomEvent && event.detail !== void 0) return (_detail = event.detail) !== null && _detail !== void 0 ? _detail : event.target.value;
            else if (el.type === "checkbox") {
                if (Array.isArray(currentValue)) {
                    let newValue = modifiers.includes("number") ? safeParseNumber(event.target.value) : event.target.value;
                    return event.target.checked ? currentValue.concat([
                        newValue
                    ]) : currentValue.filter((el2)=>!checkedAttrLooseCompare2(el2, newValue)
                    );
                } else {
                    return event.target.checked;
                }
            } else if (el.tagName.toLowerCase() === "select" && el.multiple) {
                return modifiers.includes("number") ? Array.from(event.target.selectedOptions).map((option)=>{
                    let rawValue = option.value || option.text;
                    return safeParseNumber(rawValue);
                }) : Array.from(event.target.selectedOptions).map((option)=>{
                    return option.value || option.text;
                });
            } else {
                let rawValue = event.target.value;
                return modifiers.includes("number") ? safeParseNumber(rawValue) : modifiers.includes("trim") ? rawValue.trim() : rawValue;
            }
        });
    }
    function safeParseNumber(rawValue) {
        let number = rawValue ? parseFloat(rawValue) : null;
        return isNumeric2(number) ? number : rawValue;
    }
    function checkedAttrLooseCompare2(valueA, valueB) {
        return valueA == valueB;
    }
    function isNumeric2(subject) {
        return !Array.isArray(subject) && !isNaN(subject);
    }
    function isGetterSetter(value) {
        return value !== null && typeof value === "object" && typeof value.get === "function" && typeof value.set === "function";
    }
    // packages/alpinejs/src/directives/x-cloak.js
    directive("cloak", (el)=>queueMicrotask(()=>mutateDom(()=>el.removeAttribute(prefix("cloak"))
            )
        )
    );
    // packages/alpinejs/src/directives/x-init.js
    addInitSelector(()=>`[${prefix("init")}]`
    );
    directive("init", skipDuringClone((el, { expression  }, { evaluate: evaluate2  })=>{
        if (typeof expression === "string") {
            return !!expression.trim() && evaluate2(expression, {}, false);
        }
        return evaluate2(expression, {}, false);
    }));
    // packages/alpinejs/src/directives/x-text.js
    directive("text", (el, { expression  }, { effect: effect3 , evaluateLater: evaluateLater2  })=>{
        let evaluate2 = evaluateLater2(expression);
        effect3(()=>{
            evaluate2((value)=>{
                mutateDom(()=>{
                    el.textContent = value;
                });
            });
        });
    });
    // packages/alpinejs/src/directives/x-html.js
    directive("html", (el, { expression  }, { effect: effect3 , evaluateLater: evaluateLater2  })=>{
        let evaluate2 = evaluateLater2(expression);
        effect3(()=>{
            evaluate2((value)=>{
                mutateDom(()=>{
                    el.innerHTML = value;
                    el._x_ignoreSelf = true;
                    initTree(el);
                    delete el._x_ignoreSelf;
                });
            });
        });
    });
    // packages/alpinejs/src/directives/x-bind.js
    mapAttributes(startingWith(":", into(prefix("bind:"))));
    var handler2 = (el, { value , modifiers , expression , original  }, { effect: effect3  })=>{
        if (!value) {
            let bindingProviders = {};
            injectBindingProviders(bindingProviders);
            let getBindings = evaluateLater(el, expression);
            getBindings((bindings)=>{
                applyBindingsObject(el, bindings, original);
            }, {
                scope: bindingProviders
            });
            return;
        }
        if (value === "key") return storeKeyForXFor(el, expression);
        if (el._x_inlineBindings && el._x_inlineBindings[value] && el._x_inlineBindings[value].extract) {
            return;
        }
        let evaluate2 = evaluateLater(el, expression);
        effect3(()=>evaluate2((result)=>{
                if (result === void 0 && typeof expression === "string" && expression.match(/\./)) {
                    result = "";
                }
                mutateDom(()=>bind(el, value, result, modifiers)
                );
            })
        );
    };
    handler2.inline = (el, { value , modifiers , expression  })=>{
        if (!value) return;
        if (!el._x_inlineBindings) el._x_inlineBindings = {};
        el._x_inlineBindings[value] = {
            expression,
            extract: false
        };
    };
    directive("bind", handler2);
    function storeKeyForXFor(el, expression) {
        el._x_keyExpression = expression;
    }
    // packages/alpinejs/src/directives/x-data.js
    addRootSelector(()=>`[${prefix("data")}]`
    );
    directive("data", skipDuringClone((el, { expression  }, { cleanup: cleanup2  })=>{
        expression = expression === "" ? "{}" : expression;
        let magicContext = {};
        injectMagics(magicContext, el);
        let dataProviderContext = {};
        injectDataProviders(dataProviderContext, magicContext);
        let data2 = evaluate(el, expression, {
            scope: dataProviderContext
        });
        if (data2 === void 0 || data2 === true) data2 = {};
        injectMagics(data2, el);
        let reactiveData = reactive(data2);
        initInterceptors(reactiveData);
        let undo = addScopeToNode(el, reactiveData);
        reactiveData["init"] && evaluate(el, reactiveData["init"]);
        cleanup2(()=>{
            reactiveData["destroy"] && evaluate(el, reactiveData["destroy"]);
            undo();
        });
    }));
    // packages/alpinejs/src/directives/x-show.js
    directive("show", (el, { modifiers , expression  }, { effect: effect3  })=>{
        let evaluate2 = evaluateLater(el, expression);
        if (!el._x_doHide) el._x_doHide = ()=>{
            mutateDom(()=>{
                el.style.setProperty("display", "none", modifiers.includes("important") ? "important" : void 0);
            });
        };
        if (!el._x_doShow) el._x_doShow = ()=>{
            mutateDom(()=>{
                if (el.style.length === 1 && el.style.display === "none") {
                    el.removeAttribute("style");
                } else {
                    el.style.removeProperty("display");
                }
            });
        };
        let hide = ()=>{
            el._x_doHide();
            el._x_isShown = false;
        };
        let show = ()=>{
            el._x_doShow();
            el._x_isShown = true;
        };
        let clickAwayCompatibleShow = ()=>setTimeout(show)
        ;
        let toggle = once((value)=>value ? show() : hide()
        , (value)=>{
            if (typeof el._x_toggleAndCascadeWithTransitions === "function") {
                el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
            } else {
                value ? clickAwayCompatibleShow() : hide();
            }
        });
        let oldValue;
        let firstTime = true;
        effect3(()=>evaluate2((value)=>{
                if (!firstTime && value === oldValue) return;
                if (modifiers.includes("immediate")) value ? clickAwayCompatibleShow() : hide();
                toggle(value);
                oldValue = value;
                firstTime = false;
            })
        );
    });
    // packages/alpinejs/src/directives/x-for.js
    directive("for", (el, { expression  }, { effect: effect3 , cleanup: cleanup2  })=>{
        let iteratorNames = parseForExpression(expression);
        let evaluateItems = evaluateLater(el, iteratorNames.items);
        let evaluateKey = evaluateLater(el, el._x_keyExpression || "index");
        el._x_prevKeys = [];
        el._x_lookup = {};
        effect3(()=>loop(el, iteratorNames, evaluateItems, evaluateKey)
        );
        cleanup2(()=>{
            Object.values(el._x_lookup).forEach((el2)=>el2.remove()
            );
            delete el._x_prevKeys;
            delete el._x_lookup;
        });
    });
    function loop(el, iteratorNames, evaluateItems, evaluateKey) {
        let isObject2 = (i)=>typeof i === "object" && !Array.isArray(i)
        ;
        let templateEl = el;
        evaluateItems((items)=>{
            if (isNumeric3(items) && items >= 0) {
                items = Array.from(Array(items).keys(), (i)=>i + 1
                );
            }
            if (items === void 0) items = [];
            let lookup = el._x_lookup;
            let prevKeys = el._x_prevKeys;
            let scopes = [];
            let keys = [];
            if (isObject2(items)) {
                items = Object.entries(items).map(([key, value])=>{
                    let scope2 = getIterationScopeVariables(iteratorNames, value, key, items);
                    evaluateKey((value2)=>keys.push(value2)
                    , {
                        scope: {
                            index: key,
                            ...scope2
                        }
                    });
                    scopes.push(scope2);
                });
            } else {
                for(let i = 0; i < items.length; i++){
                    let scope2 = getIterationScopeVariables(iteratorNames, items[i], i, items);
                    evaluateKey((value)=>keys.push(value)
                    , {
                        scope: {
                            index: i,
                            ...scope2
                        }
                    });
                    scopes.push(scope2);
                }
            }
            let adds = [];
            let moves = [];
            let removes = [];
            let sames = [];
            for(let i7 = 0; i7 < prevKeys.length; i7++){
                let key = prevKeys[i7];
                if (keys.indexOf(key) === -1) removes.push(key);
            }
            prevKeys = prevKeys.filter((key)=>!removes.includes(key)
            );
            let lastKey = "template";
            for(let i2 = 0; i2 < keys.length; i2++){
                let key = keys[i2];
                let prevIndex = prevKeys.indexOf(key);
                if (prevIndex === -1) {
                    prevKeys.splice(i2, 0, key);
                    adds.push([
                        lastKey,
                        i2
                    ]);
                } else if (prevIndex !== i2) {
                    let keyInSpot = prevKeys.splice(i2, 1)[0];
                    let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
                    prevKeys.splice(i2, 0, keyForSpot);
                    prevKeys.splice(prevIndex, 0, keyInSpot);
                    moves.push([
                        keyInSpot,
                        keyForSpot
                    ]);
                } else {
                    sames.push(key);
                }
                lastKey = key;
            }
            for(let i3 = 0; i3 < removes.length; i3++){
                let key = removes[i3];
                if (!!lookup[key]._x_effects) {
                    lookup[key]._x_effects.forEach(dequeueJob);
                }
                lookup[key].remove();
                lookup[key] = null;
                delete lookup[key];
            }
            for(let i4 = 0; i4 < moves.length; i4++){
                let [keyInSpot, keyForSpot] = moves[i4];
                let elInSpot = lookup[keyInSpot];
                let elForSpot = lookup[keyForSpot];
                let marker = document.createElement("div");
                mutateDom(()=>{
                    if (!elForSpot) warn(`x-for ":key" is undefined or invalid`, templateEl);
                    elForSpot.after(marker);
                    elInSpot.after(elForSpot);
                    elForSpot._x_currentIfEl && elForSpot.after(elForSpot._x_currentIfEl);
                    marker.before(elInSpot);
                    elInSpot._x_currentIfEl && elInSpot.after(elInSpot._x_currentIfEl);
                    marker.remove();
                });
                elForSpot._x_refreshXForScope(scopes[keys.indexOf(keyForSpot)]);
            }
            for(let i5 = 0; i5 < adds.length; i5++){
                let [lastKey2, index] = adds[i5];
                let lastEl = lastKey2 === "template" ? templateEl : lookup[lastKey2];
                if (lastEl._x_currentIfEl) lastEl = lastEl._x_currentIfEl;
                let scope2 = scopes[index];
                let key = keys[index];
                let clone2 = document.importNode(templateEl.content, true).firstElementChild;
                let reactiveScope = reactive(scope2);
                addScopeToNode(clone2, reactiveScope, templateEl);
                clone2._x_refreshXForScope = (newScope)=>{
                    Object.entries(newScope).forEach(([key2, value])=>{
                        reactiveScope[key2] = value;
                    });
                };
                mutateDom(()=>{
                    lastEl.after(clone2);
                    initTree(clone2);
                });
                if (typeof key === "object") {
                    warn("x-for key cannot be an object, it must be a string or an integer", templateEl);
                }
                lookup[key] = clone2;
            }
            for(let i6 = 0; i6 < sames.length; i6++){
                lookup[sames[i6]]._x_refreshXForScope(scopes[keys.indexOf(sames[i6])]);
            }
            templateEl._x_prevKeys = keys;
        });
    }
    function parseForExpression(expression) {
        let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
        let stripParensRE = /^\s*\(|\)\s*$/g;
        let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
        let inMatch = expression.match(forAliasRE);
        if (!inMatch) return;
        let res = {};
        res.items = inMatch[2].trim();
        let item = inMatch[1].replace(stripParensRE, "").trim();
        let iteratorMatch = item.match(forIteratorRE);
        if (iteratorMatch) {
            res.item = item.replace(forIteratorRE, "").trim();
            res.index = iteratorMatch[1].trim();
            if (iteratorMatch[2]) {
                res.collection = iteratorMatch[2].trim();
            }
        } else {
            res.item = item;
        }
        return res;
    }
    function getIterationScopeVariables(iteratorNames, item, index, items) {
        let scopeVariables = {};
        if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
            let names = iteratorNames.item.replace("[", "").replace("]", "").split(",").map((i)=>i.trim()
            );
            names.forEach((name, i)=>{
                scopeVariables[name] = item[i];
            });
        } else if (/^\{.*\}$/.test(iteratorNames.item) && !Array.isArray(item) && typeof item === "object") {
            let names = iteratorNames.item.replace("{", "").replace("}", "").split(",").map((i)=>i.trim()
            );
            names.forEach((name)=>{
                scopeVariables[name] = item[name];
            });
        } else {
            scopeVariables[iteratorNames.item] = item;
        }
        if (iteratorNames.index) scopeVariables[iteratorNames.index] = index;
        if (iteratorNames.collection) scopeVariables[iteratorNames.collection] = items;
        return scopeVariables;
    }
    function isNumeric3(subject) {
        return !Array.isArray(subject) && !isNaN(subject);
    }
    // packages/alpinejs/src/directives/x-ref.js
    function handler3() {}
    handler3.inline = (el, { expression  }, { cleanup: cleanup2  })=>{
        let root = closestRoot(el);
        if (!root._x_refs) root._x_refs = {};
        root._x_refs[expression] = el;
        cleanup2(()=>delete root._x_refs[expression]
        );
    };
    directive("ref", handler3);
    // packages/alpinejs/src/directives/x-if.js
    directive("if", (el, { expression  }, { effect: effect3 , cleanup: cleanup2  })=>{
        let evaluate2 = evaluateLater(el, expression);
        let show = ()=>{
            if (el._x_currentIfEl) return el._x_currentIfEl;
            let clone2 = el.content.cloneNode(true).firstElementChild;
            addScopeToNode(clone2, {}, el);
            mutateDom(()=>{
                el.after(clone2);
                initTree(clone2);
            });
            el._x_currentIfEl = clone2;
            el._x_undoIf = ()=>{
                walk(clone2, (node)=>{
                    if (!!node._x_effects) {
                        node._x_effects.forEach(dequeueJob);
                    }
                });
                clone2.remove();
                delete el._x_currentIfEl;
            };
            return clone2;
        };
        let hide = ()=>{
            if (!el._x_undoIf) return;
            el._x_undoIf();
            delete el._x_undoIf;
        };
        effect3(()=>evaluate2((value)=>{
                value ? show() : hide();
            })
        );
        cleanup2(()=>el._x_undoIf && el._x_undoIf()
        );
    });
    // packages/alpinejs/src/directives/x-id.js
    directive("id", (el, { expression  }, { evaluate: evaluate2  })=>{
        let names = evaluate2(expression);
        names.forEach((name)=>setIdRoot(el, name)
        );
    });
    // packages/alpinejs/src/directives/x-on.js
    mapAttributes(startingWith("@", into(prefix("on:"))));
    directive("on", skipDuringClone((el, { value , modifiers , expression  }, { cleanup: cleanup2  })=>{
        let evaluate2 = expression ? evaluateLater(el, expression) : ()=>{};
        if (el.tagName.toLowerCase() === "template") {
            if (!el._x_forwardEvents) el._x_forwardEvents = [];
            if (!el._x_forwardEvents.includes(value)) el._x_forwardEvents.push(value);
        }
        let removeListener = on(el, value, modifiers, (e)=>{
            evaluate2(()=>{}, {
                scope: {
                    $event: e
                },
                params: [
                    e
                ]
            });
        });
        cleanup2(()=>removeListener()
        );
    }));
    // packages/alpinejs/src/directives/index.js
    warnMissingPluginDirective("Collapse", "collapse", "collapse");
    warnMissingPluginDirective("Intersect", "intersect", "intersect");
    warnMissingPluginDirective("Focus", "trap", "focus");
    warnMissingPluginDirective("Mask", "mask", "mask");
    function warnMissingPluginDirective(name, directiveName2, slug) {
        directive(directiveName2, (el)=>warn(`You can't use [x-${directiveName2}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el)
        );
    }
    // packages/alpinejs/src/index.js
    alpine_default.setEvaluator(normalEvaluator);
    alpine_default.setReactivityEngine({
        reactive: reactive2,
        effect: effect2,
        release: stop,
        raw: toRaw
    });
    var src_default = alpine_default;
    // packages/alpinejs/builds/module.js
    var module_default = src_default;

    function isHtmlElement(node) {
        return node != undefined && node != null && node != false && 'nodeType' in node && node.nodeType === Node.ELEMENT_NODE;
    }

    function isPlainObject(x) {
        return typeof x === 'object' && x !== null && !Array.isArray(x) && !(x instanceof Date);
    }

    undefined && undefined.__rest || function(s, e) {
        var t = {};
        for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
    };

    function addUniqueItem(array, item) {
        array.indexOf(item) === -1 && array.push(item);
    }
    function removeItem(arr, item) {
        const index = arr.indexOf(item);
        index > -1 && arr.splice(index, 1);
    }

    const clamp = (min, max, v)=>Math.min(Math.max(v, min), max)
    ;

    const defaults$1 = {
        duration: 0.3,
        delay: 0,
        endDelay: 0,
        repeat: 0,
        easing: "ease"
    };

    const isNumber = (value)=>typeof value === "number"
    ;

    const isEasingList = (easing)=>Array.isArray(easing) && !isNumber(easing[0])
    ;

    const wrap = (min, max, v)=>{
        const rangeSize = max - min;
        return ((v - min) % rangeSize + rangeSize) % rangeSize + min;
    };

    function getEasingForSegment(easing, i) {
        return isEasingList(easing) ? easing[wrap(0, easing.length, i)] : easing;
    }

    const mix = (min, max, progress)=>-progress * min + progress * max + min
    ;

    const noop = ()=>{};
    const noopReturn = (v)=>v
    ;

    const progress = (min, max, value)=>max - min === 0 ? 1 : (value - min) / (max - min)
    ;

    function fillOffset(offset, remaining) {
        const min = offset[offset.length - 1];
        for(let i = 1; i <= remaining; i++){
            const offsetProgress = progress(0, remaining, i);
            offset.push(mix(min, 1, offsetProgress));
        }
    }
    function defaultOffset$1(length) {
        const offset = [
            0
        ];
        fillOffset(offset, length - 1);
        return offset;
    }

    function interpolate(output, input = defaultOffset$1(output.length), easing = noopReturn) {
        const length = output.length;
        /**
         * If the input length is lower than the output we
         * fill the input to match. This currently assumes the input
         * is an animation progress value so is a good candidate for
         * moving outside the function.
         */ const remainder = length - input.length;
        remainder > 0 && fillOffset(input, remainder);
        return (t)=>{
            let i = 0;
            for(; i < length - 2; i++){
                if (t < input[i + 1]) break;
            }
            let progressInRange = clamp(0, 1, progress(input[i], input[i + 1], t));
            const segmentEasing = getEasingForSegment(easing, i);
            progressInRange = segmentEasing(progressInRange);
            return mix(output[i], output[i + 1], progressInRange);
        };
    }

    const isCubicBezier = (easing)=>Array.isArray(easing) && isNumber(easing[0])
    ;

    const isEasingGenerator = (easing)=>typeof easing === "object" && Boolean(easing.createAnimation)
    ;

    const isFunction$1 = (value)=>typeof value === "function"
    ;

    const isString = (value)=>typeof value === "string"
    ;

    const time = {
        ms: (seconds)=>seconds * 1000
        ,
        s: (milliseconds)=>milliseconds / 1000
    };

    /*
      Convert velocity into velocity per second

      @param [number]: Unit per frame
      @param [number]: Frame duration in ms
    */ function velocityPerSecond(velocity, frameDuration) {
        return frameDuration ? velocity * (1000 / frameDuration) : 0;
    }

    /*
      Bezier function generator

      This has been modified from Gaëtan Renaudeau's BezierEasing
      https://github.com/gre/bezier-easing/blob/master/src/index.js
      https://github.com/gre/bezier-easing/blob/master/LICENSE
      
      I've removed the newtonRaphsonIterate algo because in benchmarking it
      wasn't noticiably faster than binarySubdivision, indeed removing it
      usually improved times, depending on the curve.

      I also removed the lookup table, as for the added bundle size and loop we're
      only cutting ~4 or so subdivision iterations. I bumped the max iterations up
      to 12 to compensate and this still tended to be faster for no perceivable
      loss in accuracy.

      Usage
        const easeOut = cubicBezier(.17,.67,.83,.67);
        const x = easeOut(0.5); // returns 0.627...
    */ // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    const calcBezier = (t, a1, a2)=>(((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t
    ;
    const subdivisionPrecision = 0.0000001;
    const subdivisionMaxIterations = 12;
    function binarySubdivide(x, lowerBound, upperBound, mX1, mX2) {
        let currentX;
        let currentT;
        let i = 0;
        do {
            currentT = lowerBound + (upperBound - lowerBound) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - x;
            if (currentX > 0.0) {
                upperBound = currentT;
            } else {
                lowerBound = currentT;
            }
        }while (Math.abs(currentX) > subdivisionPrecision && ++i < subdivisionMaxIterations)
        return currentT;
    }
    function cubicBezier(mX1, mY1, mX2, mY2) {
        // If this is a linear gradient, return linear easing
        if (mX1 === mY1 && mX2 === mY2) return noopReturn;
        const getTForX = (aX)=>binarySubdivide(aX, 0, 1, mX1, mX2)
        ;
        // If animation is at start/end, return t without easing
        return (t)=>t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2)
        ;
    }

    const steps = (steps1, direction = "end")=>(progress)=>{
            progress = direction === "end" ? Math.min(progress, 0.999) : Math.max(progress, 0.001);
            const expanded = progress * steps1;
            const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded);
            return clamp(0, 1, rounded / steps1);
        }
    ;

    const namedEasings = {
        ease: cubicBezier(0.25, 0.1, 0.25, 1.0),
        "ease-in": cubicBezier(0.42, 0.0, 1.0, 1.0),
        "ease-in-out": cubicBezier(0.42, 0.0, 0.58, 1.0),
        "ease-out": cubicBezier(0.0, 0.0, 0.58, 1.0)
    };
    const functionArgsRegex = /\((.*?)\)/;
    function getEasingFunction(definition) {
        // If already an easing function, return
        if (isFunction$1(definition)) return definition;
        // If an easing curve definition, return bezier function
        if (isCubicBezier(definition)) return cubicBezier(...definition);
        // If we have a predefined easing function, return
        if (namedEasings[definition]) return namedEasings[definition];
        // If this is a steps function, attempt to create easing curve
        if (definition.startsWith("steps")) {
            const args = functionArgsRegex.exec(definition);
            if (args) {
                const argsArray = args[1].split(",");
                return steps(parseFloat(argsArray[0]), argsArray[1].trim());
            }
        }
        return noopReturn;
    }

    let Animation = class Animation {
        play() {
            const now = performance.now();
            this.playState = "running";
            if (this.pauseTime !== undefined) {
                this.startTime = now - this.pauseTime;
            } else if (!this.startTime) {
                this.startTime = now;
            }
            this.cancelTimestamp = this.startTime;
            this.pauseTime = undefined;
            this.frameRequestId = requestAnimationFrame(this.tick);
        }
        pause() {
            this.playState = "paused";
            this.pauseTime = this.t;
        }
        finish() {
            this.playState = "finished";
            this.tick(0);
        }
        stop() {
            var _a;
            this.playState = "idle";
            if (this.frameRequestId !== undefined) {
                cancelAnimationFrame(this.frameRequestId);
            }
            (_a = this.reject) === null || _a === void 0 ? void 0 : _a.call(this, false);
        }
        cancel() {
            this.stop();
            this.tick(this.cancelTimestamp);
        }
        reverse() {
            this.rate *= -1;
        }
        commitStyles() {}
        updateDuration(duration) {
            this.duration = duration;
            this.totalDuration = duration * (this.repeat + 1);
        }
        get currentTime() {
            return this.t;
        }
        set currentTime(t) {
            if (this.pauseTime !== undefined || this.rate === 0) {
                this.pauseTime = t;
            } else {
                this.startTime = performance.now() - t / this.rate;
            }
        }
        get playbackRate() {
            return this.rate;
        }
        set playbackRate(rate) {
            this.rate = rate;
        }
        constructor(output, keyframes = [
            0,
            1
        ], { easing , duration: initialDuration = defaults$1.duration , delay =defaults$1.delay , endDelay =defaults$1.endDelay , repeat =defaults$1.repeat , offset , direction ="normal" ,  } = {}){
            this.startTime = null;
            this.rate = 1;
            this.t = 0;
            this.cancelTimestamp = null;
            this.easing = noopReturn;
            this.duration = 0;
            this.totalDuration = 0;
            this.repeat = 0;
            this.playState = "idle";
            this.finished = new Promise((resolve, reject)=>{
                this.resolve = resolve;
                this.reject = reject;
            });
            easing = easing || defaults$1.easing;
            if (isEasingGenerator(easing)) {
                const custom = easing.createAnimation(keyframes);
                easing = custom.easing;
                keyframes = custom.keyframes || keyframes;
                initialDuration = custom.duration || initialDuration;
            }
            this.repeat = repeat;
            this.easing = isEasingList(easing) ? noopReturn : getEasingFunction(easing);
            this.updateDuration(initialDuration);
            const interpolate$1 = interpolate(keyframes, offset, isEasingList(easing) ? easing.map(getEasingFunction) : noopReturn);
            this.tick = (timestamp)=>{
                var _a;
                // TODO: Temporary fix for OptionsResolver typing
                delay = delay;
                let t = 0;
                if (this.pauseTime !== undefined) {
                    t = this.pauseTime;
                } else {
                    t = (timestamp - this.startTime) * this.rate;
                }
                this.t = t;
                // Convert to seconds
                t /= 1000;
                // Rebase on delay
                t = Math.max(t - delay, 0);
                /**
                 * If this animation has finished, set the current time
                 * to the total duration.
                 */ if (this.playState === "finished" && this.pauseTime === undefined) {
                    t = this.totalDuration;
                }
                /**
                 * Get the current progress (0-1) of the animation. If t is >
                 * than duration we'll get values like 2.5 (midway through the
                 * third iteration)
                 */ const progress = t / this.duration;
                // TODO progress += iterationStart
                /**
                 * Get the current iteration (0 indexed). For instance the floor of
                 * 2.5 is 2.
                 */ let currentIteration = Math.floor(progress);
                /**
                 * Get the current progress of the iteration by taking the remainder
                 * so 2.5 is 0.5 through iteration 2
                 */ let iterationProgress = progress % 1.0;
                if (!iterationProgress && progress >= 1) {
                    iterationProgress = 1;
                }
                /**
                 * If iteration progress is 1 we count that as the end
                 * of the previous iteration.
                 */ iterationProgress === 1 && currentIteration--;
                /**
                 * Reverse progress if we're not running in "normal" direction
                 */ const iterationIsOdd = currentIteration % 2;
                if (direction === "reverse" || direction === "alternate" && iterationIsOdd || direction === "alternate-reverse" && !iterationIsOdd) {
                    iterationProgress = 1 - iterationProgress;
                }
                const p = t >= this.totalDuration ? 1 : Math.min(iterationProgress, 1);
                const latest = interpolate$1(this.easing(p));
                output(latest);
                const isAnimationFinished = this.pauseTime === undefined && (this.playState === "finished" || t >= this.totalDuration + endDelay);
                if (isAnimationFinished) {
                    this.playState = "finished";
                    (_a = this.resolve) === null || _a === void 0 ? void 0 : _a.call(this, latest);
                } else if (this.playState !== "idle") {
                    this.frameRequestId = requestAnimationFrame(this.tick);
                }
            };
            this.play();
        }
    };

    var invariant = function() {};
    if (process.env.NODE_ENV !== 'production') {
        invariant = function(check, message) {
            if (!check) {
                throw new Error(message);
            }
        };
    }

    /**
     * The MotionValue tracks the state of a single animatable
     * value. Currently, updatedAt and current are unused. The
     * long term idea is to use this to minimise the number
     * of DOM reads, and to abstract the DOM interactions here.
     */ let MotionValue = class MotionValue {
        setAnimation(animation) {
            this.animation = animation;
            animation === null || animation === void 0 ? void 0 : animation.finished.then(()=>this.clearAnimation()
            ).catch(()=>{});
        }
        clearAnimation() {
            this.animation = this.generator = undefined;
        }
    };

    const data = new WeakMap();
    function getAnimationData(element) {
        if (!data.has(element)) {
            data.set(element, {
                transforms: [],
                values: new Map()
            });
        }
        return data.get(element);
    }
    function getMotionValue(motionValues, name) {
        if (!motionValues.has(name)) {
            motionValues.set(name, new MotionValue());
        }
        return motionValues.get(name);
    }

    /**
     * A list of all transformable axes. We'll use this list to generated a version
     * of each axes for each transform.
     */ const axes = [
        "",
        "X",
        "Y",
        "Z"
    ];
    /**
     * An ordered array of each transformable value. By default, transform values
     * will be sorted to this order.
     */ const order = [
        "translate",
        "scale",
        "rotate",
        "skew"
    ];
    const transformAlias = {
        x: "translateX",
        y: "translateY",
        z: "translateZ"
    };
    const rotation = {
        syntax: "<angle>",
        initialValue: "0deg",
        toDefaultUnit: (v)=>v + "deg"
    };
    const baseTransformProperties = {
        translate: {
            syntax: "<length-percentage>",
            initialValue: "0px",
            toDefaultUnit: (v)=>v + "px"
        },
        rotate: rotation,
        scale: {
            syntax: "<number>",
            initialValue: 1,
            toDefaultUnit: noopReturn
        },
        skew: rotation
    };
    const transformDefinitions = new Map();
    const asTransformCssVar = (name)=>`--motion-${name}`
    ;
    /**
     * Generate a list of every possible transform key
     */ const transforms = [
        "x",
        "y",
        "z"
    ];
    order.forEach((name)=>{
        axes.forEach((axis)=>{
            transforms.push(name + axis);
            transformDefinitions.set(asTransformCssVar(name + axis), baseTransformProperties[name]);
        });
    });
    /**
     * A function to use with Array.sort to sort transform keys by their default order.
     */ const compareTransformOrder = (a, b)=>transforms.indexOf(a) - transforms.indexOf(b)
    ;
    /**
     * Provide a quick way to check if a string is the name of a transform
     */ const transformLookup = new Set(transforms);
    const isTransform = (name)=>transformLookup.has(name)
    ;
    const addTransformToElement = (element, name)=>{
        // Map x to translateX etc
        if (transformAlias[name]) name = transformAlias[name];
        const { transforms: transforms1  } = getAnimationData(element);
        addUniqueItem(transforms1, name);
        /**
         * TODO: An optimisation here could be to cache the transform in element data
         * and only update if this has changed.
         */ element.style.transform = buildTransformTemplate(transforms1);
    };
    const buildTransformTemplate = (transforms2)=>transforms2.sort(compareTransformOrder).reduce(transformListToString, "").trim()
    ;
    const transformListToString = (template, name)=>`${template} ${name}(var(${asTransformCssVar(name)}))`
    ;

    const isCssVar = (name)=>name.startsWith("--")
    ;
    const registeredProperties = new Set();
    function registerCssVariable(name) {
        if (registeredProperties.has(name)) return;
        registeredProperties.add(name);
        try {
            const { syntax , initialValue  } = transformDefinitions.has(name) ? transformDefinitions.get(name) : {};
            CSS.registerProperty({
                name,
                inherits: false,
                syntax,
                initialValue
            });
        } catch (e) {}
    }

    const testAnimation = (keyframes, options)=>document.createElement("div").animate(keyframes, options)
    ;
    const featureTests = {
        cssRegisterProperty: ()=>typeof CSS !== "undefined" && Object.hasOwnProperty.call(CSS, "registerProperty")
        ,
        waapi: ()=>Object.hasOwnProperty.call(Element.prototype, "animate")
        ,
        partialKeyframes: ()=>{
            try {
                testAnimation({
                    opacity: [
                        1
                    ]
                });
            } catch (e) {
                return false;
            }
            return true;
        },
        finished: ()=>Boolean(testAnimation({
                opacity: [
                    0,
                    1
                ]
            }, {
                duration: 0.001
            }).finished)
        ,
        linearEasing: ()=>{
            try {
                testAnimation({
                    opacity: 0
                }, {
                    easing: "linear(0, 1)"
                });
            } catch (e) {
                return false;
            }
            return true;
        }
    };
    const results = {};
    const supports = {};
    for(const key in featureTests){
        supports[key] = ()=>{
            if (results[key] === undefined) results[key] = featureTests[key]();
            return results[key];
        };
    }

    // Create a linear easing point for every x second
    const resolution = 0.015;
    const generateLinearEasingPoints = (easing, duration)=>{
        let points = "";
        const numPoints = Math.round(duration / resolution);
        for(let i = 0; i < numPoints; i++){
            points += easing(progress(0, numPoints - 1, i)) + ", ";
        }
        return points.substring(0, points.length - 2);
    };
    const convertEasing = (easing, duration)=>{
        if (isFunction$1(easing)) {
            return supports.linearEasing() ? `linear(${generateLinearEasingPoints(easing, duration)})` : defaults$1.easing;
        } else {
            return isCubicBezier(easing) ? cubicBezierAsString(easing) : easing;
        }
    };
    const cubicBezierAsString = ([a, b, c, d])=>`cubic-bezier(${a}, ${b}, ${c}, ${d})`
    ;

    function hydrateKeyframes(keyframes, readInitialValue) {
        for(let i = 0; i < keyframes.length; i++){
            if (keyframes[i] === null) {
                keyframes[i] = i ? keyframes[i - 1] : readInitialValue();
            }
        }
        return keyframes;
    }
    const keyframesList = (keyframes)=>Array.isArray(keyframes) ? keyframes : [
            keyframes
        ]
    ;

    function getStyleName(key) {
        if (transformAlias[key]) key = transformAlias[key];
        return isTransform(key) ? asTransformCssVar(key) : key;
    }

    const style = {
        get: (element, name)=>{
            name = getStyleName(name);
            let value = isCssVar(name) ? element.style.getPropertyValue(name) : getComputedStyle(element)[name];
            if (!value && value !== 0) {
                const definition = transformDefinitions.get(name);
                if (definition) value = definition.initialValue;
            }
            return value;
        },
        set: (element, name, value)=>{
            name = getStyleName(name);
            if (isCssVar(name)) {
                element.style.setProperty(name, value);
            } else {
                element.style[name] = value;
            }
        }
    };

    function stopAnimation(animation, needsCommit = true) {
        if (!animation || animation.playState === "finished") return;
        // Suppress error thrown by WAAPI
        try {
            if (animation.stop) {
                animation.stop();
            } else {
                needsCommit && animation.commitStyles();
                animation.cancel();
            }
        } catch (e) {}
    }

    function getUnitConverter(keyframes, definition) {
        var _a;
        let toUnit = (definition === null || definition === void 0 ? void 0 : definition.toDefaultUnit) || noopReturn;
        const finalKeyframe = keyframes[keyframes.length - 1];
        if (isString(finalKeyframe)) {
            const unit = ((_a = finalKeyframe.match(/(-?[\d.]+)([a-z%]*)/)) === null || _a === void 0 ? void 0 : _a[2]) || "";
            if (unit) toUnit = (value)=>value + unit
            ;
        }
        return toUnit;
    }

    function getDevToolsRecord() {
        return window.__MOTION_DEV_TOOLS_RECORD;
    }
    function animateStyle(element, key, keyframesDefinition, options = {}, AnimationPolyfill) {
        const record = getDevToolsRecord();
        const isRecording = options.record !== false && record;
        let animation;
        let { duration =defaults$1.duration , delay =defaults$1.delay , endDelay =defaults$1.endDelay , repeat =defaults$1.repeat , easing =defaults$1.easing , persist =false , direction , offset , allowWebkitAcceleration =false ,  } = options;
        const data = getAnimationData(element);
        const valueIsTransform = isTransform(key);
        let canAnimateNatively = supports.waapi();
        /**
         * If this is an individual transform, we need to map its
         * key to a CSS variable and update the element's transform style
         */ valueIsTransform && addTransformToElement(element, key);
        const name = getStyleName(key);
        const motionValue = getMotionValue(data.values, name);
        /**
         * Get definition of value, this will be used to convert numerical
         * keyframes into the default value type.
         */ const definition = transformDefinitions.get(name);
        /**
         * Stop the current animation, if any. Because this will trigger
         * commitStyles (DOM writes) and we might later trigger DOM reads,
         * this is fired now and we return a factory function to create
         * the actual animation that can get called in batch,
         */ stopAnimation(motionValue.animation, !(isEasingGenerator(easing) && motionValue.generator) && options.record !== false);
        /**
         * Batchable factory function containing all DOM reads.
         */ return ()=>{
            const readInitialValue = ()=>{
                var _a, _b;
                return (_b = (_a = style.get(element, name)) !== null && _a !== void 0 ? _a : definition === null || definition === void 0 ? void 0 : definition.initialValue) !== null && _b !== void 0 ? _b : 0;
            };
            /**
             * Replace null values with the previous keyframe value, or read
             * it from the DOM if it's the first keyframe.
             */ let keyframes = hydrateKeyframes(keyframesList(keyframesDefinition), readInitialValue);
            /**
             * Detect unit type of keyframes.
             */ const toUnit = getUnitConverter(keyframes, definition);
            if (isEasingGenerator(easing)) {
                const custom = easing.createAnimation(keyframes, key !== "opacity", readInitialValue, name, motionValue);
                easing = custom.easing;
                keyframes = custom.keyframes || keyframes;
                duration = custom.duration || duration;
            }
            /**
             * If this is a CSS variable we need to register it with the browser
             * before it can be animated natively. We also set it with setProperty
             * rather than directly onto the element.style object.
             */ if (isCssVar(name)) {
                if (supports.cssRegisterProperty()) {
                    registerCssVariable(name);
                } else {
                    canAnimateNatively = false;
                }
            }
            /**
             * If we've been passed a custom easing function, and this browser
             * does **not** support linear() easing, and the value is a transform
             * (and thus a pure number) we can still support the custom easing
             * by falling back to the animation polyfill.
             */ if (valueIsTransform && !supports.linearEasing() && (isFunction$1(easing) || isEasingList(easing) && easing.some(isFunction$1))) {
                canAnimateNatively = false;
            }
            /**
             * If we can animate this value with WAAPI, do so.
             */ if (canAnimateNatively) {
                /**
                 * Convert numbers to default value types. Currently this only supports
                 * transforms but it could also support other value types.
                 */ if (definition) {
                    keyframes = keyframes.map((value)=>isNumber(value) ? definition.toDefaultUnit(value) : value
                    );
                }
                /**
                 * If this browser doesn't support partial/implicit keyframes we need to
                 * explicitly provide one.
                 */ if (keyframes.length === 1 && (!supports.partialKeyframes() || isRecording)) {
                    keyframes.unshift(readInitialValue());
                }
                const animationOptions = {
                    delay: time.ms(delay),
                    duration: time.ms(duration),
                    endDelay: time.ms(endDelay),
                    easing: !isEasingList(easing) ? convertEasing(easing, duration) : undefined,
                    direction,
                    iterations: repeat + 1,
                    fill: "both"
                };
                animation = element.animate({
                    [name]: keyframes,
                    offset,
                    easing: isEasingList(easing) ? easing.map((thisEasing)=>convertEasing(thisEasing, duration)
                    ) : undefined
                }, animationOptions);
                /**
                 * Polyfill finished Promise in browsers that don't support it
                 */ if (!animation.finished) {
                    animation.finished = new Promise((resolve, reject)=>{
                        animation.onfinish = resolve;
                        animation.oncancel = reject;
                    });
                }
                const target = keyframes[keyframes.length - 1];
                animation.finished.then(()=>{
                    if (persist) return;
                    // Apply styles to target
                    style.set(element, name, target);
                    // Ensure fill modes don't persist
                    animation.cancel();
                }).catch(noop);
                /**
                 * This forces Webkit to run animations on the main thread by exploiting
                 * this condition:
                 * https://trac.webkit.org/browser/webkit/trunk/Source/WebCore/platform/graphics/ca/GraphicsLayerCA.cpp?rev=281238#L1099
                 *
                 * This fixes Webkit's timing bugs, like accelerated animations falling
                 * out of sync with main thread animations and massive delays in starting
                 * accelerated animations in WKWebView.
                 */ if (!allowWebkitAcceleration) animation.playbackRate = 1.000001;
            /**
                 * If we can't animate the value natively then we can fallback to the numbers-only
                 * polyfill for transforms.
                 */ } else if (AnimationPolyfill && valueIsTransform) {
                /**
                 * If any keyframe is a string (because we measured it from the DOM), we need to convert
                 * it into a number before passing to the Animation polyfill.
                 */ keyframes = keyframes.map((value)=>typeof value === "string" ? parseFloat(value) : value
                );
                /**
                 * If we only have a single keyframe, we need to create an initial keyframe by reading
                 * the current value from the DOM.
                 */ if (keyframes.length === 1) {
                    keyframes.unshift(parseFloat(readInitialValue()));
                }
                animation = new AnimationPolyfill((latest)=>{
                    style.set(element, name, toUnit ? toUnit(latest) : latest);
                }, keyframes, Object.assign(Object.assign({}, options), {
                    duration,
                    easing
                }));
            } else {
                const target = keyframes[keyframes.length - 1];
                style.set(element, name, definition && isNumber(target) ? definition.toDefaultUnit(target) : target);
            }
            if (isRecording) {
                record(element, key, keyframes, {
                    duration,
                    delay: delay,
                    easing,
                    repeat,
                    offset
                }, "motion-one");
            }
            motionValue.setAnimation(animation);
            return animation;
        };
    }

    const getOptions = (options, key)=>/**
     * TODO: Make test for this
     * Always return a new object otherwise delay is overwritten by results of stagger
     * and this results in no stagger
     */ options[key] ? Object.assign(Object.assign({}, options), options[key]) : Object.assign({}, options)
    ;

    function resolveElements(elements, selectorCache) {
        var _a;
        if (typeof elements === "string") {
            if (selectorCache) {
                (_a = selectorCache[elements]) !== null && _a !== void 0 ? _a : selectorCache[elements] = document.querySelectorAll(elements);
                elements = selectorCache[elements];
            } else {
                elements = document.querySelectorAll(elements);
            }
        } else if (elements instanceof Element) {
            elements = [
                elements
            ];
        }
        /**
         * Return an empty array
         */ return Array.from(elements || []);
    }

    const createAnimation = (factory)=>factory()
    ;
    const withControls = (animationFactory, options, duration = defaults$1.duration)=>{
        return new Proxy({
            animations: animationFactory.map(createAnimation).filter(Boolean),
            duration,
            options
        }, controls);
    };
    /**
     * TODO:
     * Currently this returns the first animation, ideally it would return
     * the first active animation.
     */ const getActiveAnimation = (state)=>state.animations[0]
    ;
    const controls = {
        get: (target, key)=>{
            const activeAnimation = getActiveAnimation(target);
            switch(key){
                case "duration":
                    return target.duration;
                case "currentTime":
                    return time.s((activeAnimation === null || activeAnimation === void 0 ? void 0 : activeAnimation[key]) || 0);
                case "playbackRate":
                case "playState":
                    return activeAnimation === null || activeAnimation === void 0 ? void 0 : activeAnimation[key];
                case "finished":
                    if (!target.finished) {
                        target.finished = Promise.all(target.animations.map(selectFinished)).catch(noop);
                    }
                    return target.finished;
                case "stop":
                    return ()=>{
                        target.animations.forEach((animation)=>stopAnimation(animation)
                        );
                    };
                case "forEachNative":
                    /**
                     * This is for internal use only, fire a callback for each
                     * underlying animation.
                     */ return (callback)=>{
                        target.animations.forEach((animation)=>callback(animation, target)
                        );
                    };
                default:
                    return typeof (activeAnimation === null || activeAnimation === void 0 ? void 0 : activeAnimation[key]) === "undefined" ? undefined : ()=>target.animations.forEach((animation)=>animation[key]()
                        )
                    ;
            }
        },
        set: (target, key, value)=>{
            switch(key){
                case "currentTime":
                    value = time.ms(value);
                case "currentTime":
                case "playbackRate":
                    for(let i = 0; i < target.animations.length; i++){
                        target.animations[i][key] = value;
                    }
                    return true;
            }
            return false;
        }
    };
    const selectFinished = (animation)=>animation.finished
    ;

    function stagger(duration = 0.1, { start =0 , from =0 , easing  } = {}) {
        return (i, total)=>{
            const fromIndex = isNumber(from) ? from : getFromIndex(from, total);
            const distance = Math.abs(fromIndex - i);
            let delay = duration * distance;
            if (easing) {
                const maxDelay = total * duration;
                const easingFunction = getEasingFunction(easing);
                delay = easingFunction(delay / maxDelay) * maxDelay;
            }
            return start + delay;
        };
    }
    function getFromIndex(from, total) {
        if (from === "first") {
            return 0;
        } else {
            const lastIndex = total - 1;
            return from === "last" ? lastIndex : lastIndex / 2;
        }
    }
    function resolveOption(option, i, total) {
        return isFunction$1(option) ? option(i, total) : option;
    }

    function createAnimate(AnimatePolyfill) {
        return function animate(elements, keyframes, options = {}) {
            elements = resolveElements(elements);
            const numElements = elements.length;
            invariant(Boolean(numElements), "No valid element provided.");
            invariant(Boolean(keyframes), "No keyframes defined.");
            /**
             * Create and start new animations
             */ const animationFactories = [];
            for(let i = 0; i < numElements; i++){
                const element = elements[i];
                for(const key in keyframes){
                    const valueOptions = getOptions(options, key);
                    valueOptions.delay = resolveOption(valueOptions.delay, i, numElements);
                    const animation = animateStyle(element, key, keyframes[key], valueOptions, AnimatePolyfill);
                    animationFactories.push(animation);
                }
            }
            return withControls(animationFactories, options, /**
             * TODO:
             * If easing is set to spring or glide, duration will be dynamically
             * generated. Ideally we would dynamically generate this from
             * animation.effect.getComputedTiming().duration but this isn't
             * supported in iOS13 or our number polyfill. Perhaps it's possible
             * to Proxy animations returned from animateStyle that has duration
             * as a getter.
             */ options.duration);
        };
    }

    const animate$1 = createAnimate(Animation);

    function __rest(s, e) {
        var t = {};
        for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
    }

    function calcNextTime(current, next, prev, labels) {
        var _a;
        if (isNumber(next)) {
            return next;
        } else if (next.startsWith("-") || next.startsWith("+")) {
            return Math.max(0, current + parseFloat(next));
        } else if (next === "<") {
            return prev;
        } else {
            return (_a = labels.get(next)) !== null && _a !== void 0 ? _a : current;
        }
    }

    function eraseKeyframes(sequence, startTime, endTime) {
        for(let i = 0; i < sequence.length; i++){
            const keyframe = sequence[i];
            if (keyframe.at > startTime && keyframe.at < endTime) {
                removeItem(sequence, keyframe);
                // If we remove this item we have to push the pointer back one
                i--;
            }
        }
    }
    function addKeyframes(sequence, keyframes, easing, offset, startTime, endTime) {
        /**
         * Erase every existing value between currentTime and targetTime,
         * this will essentially splice this timeline into any currently
         * defined ones.
         */ eraseKeyframes(sequence, startTime, endTime);
        for(let i = 0; i < keyframes.length; i++){
            sequence.push({
                value: keyframes[i],
                at: mix(startTime, endTime, offset[i]),
                easing: getEasingForSegment(easing, i)
            });
        }
    }

    function compareByTime(a, b) {
        if (a.at === b.at) {
            return a.value === null ? 1 : -1;
        } else {
            return a.at - b.at;
        }
    }

    function timeline(definition1, options = {}) {
        var _a;
        const animationDefinitions = createAnimationsFromTimeline(definition1, options);
        /**
         * Create and start animations
         */ const animationFactories = animationDefinitions.map((definition)=>animateStyle(...definition, Animation)
        ).filter(Boolean);
        return withControls(animationFactories, options, // Get the duration from the first animation definition
        (_a = animationDefinitions[0]) === null || _a === void 0 ? void 0 : _a[3].duration);
    }
    function createAnimationsFromTimeline(definition, _a = {}) {
        var { defaultOptions ={}  } = _a, timelineOptions = __rest(_a, [
            "defaultOptions"
        ]);
        const animationDefinitions = [];
        const elementSequences = new Map();
        const elementCache = {};
        const timeLabels = new Map();
        let prevTime = 0;
        let currentTime = 0;
        let totalDuration = 0;
        /**
         * Build the timeline by mapping over the definition array and converting
         * the definitions into keyframes and offsets with absolute time values.
         * These will later get converted into relative offsets in a second pass.
         */ for(let i1 = 0; i1 < definition.length; i1++){
            const segment = definition[i1];
            /**
             * If this is a timeline label, mark it and skip the rest of this iteration.
             */ if (isString(segment)) {
                timeLabels.set(segment, currentTime);
                continue;
            } else if (!Array.isArray(segment)) {
                timeLabels.set(segment.name, calcNextTime(currentTime, segment.at, prevTime, timeLabels));
                continue;
            }
            const [elementDefinition, keyframes, options = {}] = segment;
            /**
             * If a relative or absolute time value has been specified we need to resolve
             * it in relation to the currentTime.
             */ if (options.at !== undefined) {
                currentTime = calcNextTime(currentTime, options.at, prevTime, timeLabels);
            }
            /**
             * Keep track of the maximum duration in this definition. This will be
             * applied to currentTime once the definition has been parsed.
             */ let maxDuration = 0;
            /**
             * Find all the elements specified in the definition and parse value
             * keyframes from their timeline definitions.
             */ const elements = resolveElements(elementDefinition, elementCache);
            const numElements = elements.length;
            for(let elementIndex = 0; elementIndex < numElements; elementIndex++){
                const element = elements[elementIndex];
                const elementSequence = getElementSequence(element, elementSequences);
                for(const key in keyframes){
                    const valueSequence = getValueSequence(key, elementSequence);
                    let valueKeyframes = keyframesList(keyframes[key]);
                    const valueOptions = getOptions(options, key);
                    let { duration =defaultOptions.duration || defaults$1.duration , easing =defaultOptions.easing || defaults$1.easing ,  } = valueOptions;
                    if (isEasingGenerator(easing)) {
                        invariant(key === "opacity" || valueKeyframes.length > 1, "spring must be provided 2 keyframes within timeline()");
                        const custom = easing.createAnimation(valueKeyframes, key !== "opacity", ()=>0
                        , key);
                        easing = custom.easing;
                        valueKeyframes = custom.keyframes || valueKeyframes;
                        duration = custom.duration || duration;
                    }
                    const delay = resolveOption(options.delay, elementIndex, numElements) || 0;
                    const startTime = currentTime + delay;
                    const targetTime = startTime + duration;
                    /**
                     *
                     */ let { offset =defaultOffset$1(valueKeyframes.length)  } = valueOptions;
                    /**
                     * If there's only one offset of 0, fill in a second with length 1
                     *
                     * TODO: Ensure there's a test that covers this removal
                     */ if (offset.length === 1 && offset[0] === 0) {
                        offset[1] = 1;
                    }
                    /**
                     * Fill out if offset if fewer offsets than keyframes
                     */ const remainder = offset.length - valueKeyframes.length;
                    remainder > 0 && fillOffset(offset, remainder);
                    /**
                     * If only one value has been set, ie [1], push a null to the start of
                     * the keyframe array. This will let us mark a keyframe at this point
                     * that will later be hydrated with the previous value.
                     */ valueKeyframes.length === 1 && valueKeyframes.unshift(null);
                    /**
                     * Add keyframes, mapping offsets to absolute time.
                     */ addKeyframes(valueSequence, valueKeyframes, easing, offset, startTime, targetTime);
                    maxDuration = Math.max(delay + duration, maxDuration);
                    totalDuration = Math.max(targetTime, totalDuration);
                }
            }
            prevTime = currentTime;
            currentTime += maxDuration;
        }
        /**
         * For every element and value combination create a new animation.
         */ elementSequences.forEach((valueSequences, element)=>{
            for(const key in valueSequences){
                const valueSequence = valueSequences[key];
                /**
                 * Arrange all the keyframes in ascending time order.
                 */ valueSequence.sort(compareByTime);
                const keyframes = [];
                const valueOffset = [];
                const valueEasing = [];
                /**
                 * For each keyframe, translate absolute times into
                 * relative offsets based on the total duration of the timeline.
                 */ for(let i = 0; i < valueSequence.length; i++){
                    const { at , value , easing  } = valueSequence[i];
                    keyframes.push(value);
                    valueOffset.push(progress(0, totalDuration, at));
                    valueEasing.push(easing || defaults$1.easing);
                }
                /**
                 * If the first keyframe doesn't land on offset: 0
                 * provide one by duplicating the initial keyframe. This ensures
                 * it snaps to the first keyframe when the animation starts.
                 */ if (valueOffset[0] !== 0) {
                    valueOffset.unshift(0);
                    keyframes.unshift(keyframes[0]);
                    valueEasing.unshift("linear");
                }
                /**
                 * If the last keyframe doesn't land on offset: 1
                 * provide one with a null wildcard value. This will ensure it
                 * stays static until the end of the animation.
                 */ if (valueOffset[valueOffset.length - 1] !== 1) {
                    valueOffset.push(1);
                    keyframes.push(null);
                }
                animationDefinitions.push([
                    element,
                    key,
                    keyframes,
                    Object.assign(Object.assign(Object.assign({}, defaultOptions), {
                        duration: totalDuration,
                        easing: valueEasing,
                        offset: valueOffset
                    }), timelineOptions), 
                ]);
            }
        });
        return animationDefinitions;
    }
    function getElementSequence(element, sequences) {
        !sequences.has(element) && sequences.set(element, {});
        return sequences.get(element);
    }
    function getValueSequence(name, sequences) {
        if (!sequences[name]) sequences[name] = [];
        return sequences[name];
    }

    const sampleT = 5; // ms
    function calcGeneratorVelocity(resolveValue, t, current) {
        const prevT = Math.max(t - sampleT, 0);
        return velocityPerSecond(current - resolveValue(prevT), t - prevT);
    }

    const defaults = {
        stiffness: 100.0,
        damping: 10.0,
        mass: 1.0
    };

    const calcDampingRatio = (stiffness = defaults.stiffness, damping = defaults.damping, mass = defaults.mass)=>damping / (2 * Math.sqrt(stiffness * mass))
    ;

    function hasReachedTarget(origin, target, current) {
        return origin < target && current >= target || origin > target && current <= target;
    }

    const spring$1 = ({ stiffness =defaults.stiffness , damping =defaults.damping , mass =defaults.mass , from =0 , to =1 , velocity =0.0 , restSpeed =2 , restDistance =0.5 ,  } = {})=>{
        velocity = velocity ? time.s(velocity) : 0.0;
        const state = {
            done: false,
            hasReachedTarget: false,
            current: from,
            target: to
        };
        const initialDelta = to - from;
        const undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000;
        const dampingRatio = calcDampingRatio(stiffness, damping, mass);
        let resolveSpring;
        if (dampingRatio < 1) {
            const angularFreq = undampedAngularFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
            // Underdamped spring (bouncy)
            resolveSpring = (t)=>to - Math.exp(-dampingRatio * undampedAngularFreq * t) * ((-velocity + dampingRatio * undampedAngularFreq * initialDelta) / angularFreq * Math.sin(angularFreq * t) + initialDelta * Math.cos(angularFreq * t))
            ;
        } else {
            // Critically damped spring
            resolveSpring = (t)=>{
                return to - Math.exp(-undampedAngularFreq * t) * (initialDelta + (-velocity + undampedAngularFreq * initialDelta) * t);
            };
        }
        return (t)=>{
            state.current = resolveSpring(t);
            const currentVelocity = t === 0 ? velocity : calcGeneratorVelocity(resolveSpring, t, state.current);
            const isBelowVelocityThreshold = Math.abs(currentVelocity) <= restSpeed;
            const isBelowDisplacementThreshold = Math.abs(to - state.current) <= restDistance;
            state.done = isBelowVelocityThreshold && isBelowDisplacementThreshold;
            state.hasReachedTarget = hasReachedTarget(from, to, state.current);
            return state;
        };
    };

    const glide$1 = ({ from =0 , velocity =0.0 , power =0.8 , decay =0.325 , bounceDamping , bounceStiffness , changeTarget , min , max , restDistance =0.5 , restSpeed ,  })=>{
        decay = time.ms(decay);
        const state = {
            hasReachedTarget: false,
            done: false,
            current: from,
            target: from
        };
        const isOutOfBounds = (v)=>min !== undefined && v < min || max !== undefined && v > max
        ;
        const nearestBoundary = (v)=>{
            if (min === undefined) return max;
            if (max === undefined) return min;
            return Math.abs(min - v) < Math.abs(max - v) ? min : max;
        };
        let amplitude = power * velocity;
        const ideal = from + amplitude;
        const target = changeTarget === undefined ? ideal : changeTarget(ideal);
        state.target = target;
        /**
         * If the target has changed we need to re-calculate the amplitude, otherwise
         * the animation will start from the wrong position.
         */ if (target !== ideal) amplitude = target - from;
        const calcDelta = (t)=>-amplitude * Math.exp(-t / decay)
        ;
        const calcLatest = (t)=>target + calcDelta(t)
        ;
        const applyFriction = (t)=>{
            const delta = calcDelta(t);
            const latest = calcLatest(t);
            state.done = Math.abs(delta) <= restDistance;
            state.current = state.done ? target : latest;
        };
        /**
         * Ideally this would resolve for t in a stateless way, we could
         * do that by always precalculating the animation but as we know
         * this will be done anyway we can assume that spring will
         * be discovered during that.
         */ let timeReachedBoundary;
        let spring$1$1;
        const checkCatchBoundary = (t)=>{
            if (!isOutOfBounds(state.current)) return;
            timeReachedBoundary = t;
            spring$1$1 = spring$1({
                from: state.current,
                to: nearestBoundary(state.current),
                velocity: calcGeneratorVelocity(calcLatest, t, state.current),
                damping: bounceDamping,
                stiffness: bounceStiffness,
                restDistance,
                restSpeed
            });
        };
        checkCatchBoundary(0);
        return (t)=>{
            /**
             * We need to resolve the friction to figure out if we need a
             * spring but we don't want to do this twice per frame. So here
             * we flag if we updated for this frame and later if we did
             * we can skip doing it again.
             */ let hasUpdatedFrame = false;
            if (!spring$1$1 && timeReachedBoundary === undefined) {
                hasUpdatedFrame = true;
                applyFriction(t);
                checkCatchBoundary(t);
            }
            /**
             * If we have a spring and the provided t is beyond the moment the friction
             * animation crossed the min/max boundary, use the spring.
             */ if (timeReachedBoundary !== undefined && t > timeReachedBoundary) {
                state.hasReachedTarget = true;
                return spring$1$1(t - timeReachedBoundary);
            } else {
                state.hasReachedTarget = false;
                !hasUpdatedFrame && applyFriction(t);
                return state;
            }
        };
    };

    const timeStep = 10;
    const maxDuration = 10000;
    function pregenerateKeyframes(generator, toUnit = noopReturn) {
        let overshootDuration = undefined;
        let timestamp = timeStep;
        let state = generator(0);
        const keyframes = [
            toUnit(state.current)
        ];
        while(!state.done && timestamp < maxDuration){
            state = generator(timestamp);
            keyframes.push(toUnit(state.done ? state.target : state.current));
            if (overshootDuration === undefined && state.hasReachedTarget) {
                overshootDuration = timestamp;
            }
            timestamp += timeStep;
        }
        const duration = timestamp - timeStep;
        /**
         * If generating an animation that didn't actually move,
         * generate a second keyframe so we have an origin and target.
         */ if (keyframes.length === 1) keyframes.push(state.current);
        return {
            keyframes,
            duration: duration / 1000,
            overshootDuration: (overshootDuration !== null && overshootDuration !== void 0 ? overshootDuration : duration) / 1000
        };
    }

    function canGenerate(value) {
        return isNumber(value) && !isNaN(value);
    }
    function getAsNumber(value) {
        return isString(value) ? parseFloat(value) : value;
    }
    function createGeneratorEasing(createGenerator) {
        const keyframesCache = new WeakMap();
        return (options = {})=>{
            const generatorCache = new Map();
            const getGenerator = (from = 0, to = 100, velocity = 0, isScale = false)=>{
                const key = `${from}-${to}-${velocity}-${isScale}`;
                if (!generatorCache.has(key)) {
                    generatorCache.set(key, createGenerator(Object.assign({
                        from,
                        to,
                        velocity,
                        restSpeed: isScale ? 0.05 : 2,
                        restDistance: isScale ? 0.01 : 0.5
                    }, options)));
                }
                return generatorCache.get(key);
            };
            const getKeyframes = (generator, toUnit)=>{
                if (!keyframesCache.has(generator)) {
                    keyframesCache.set(generator, pregenerateKeyframes(generator, toUnit));
                }
                return keyframesCache.get(generator);
            };
            return {
                createAnimation: (keyframes, shouldGenerate = true, getOrigin, name, motionValue)=>{
                    let settings;
                    let origin;
                    let target;
                    let velocity = 0;
                    let toUnit = noopReturn;
                    const numKeyframes = keyframes.length;
                    /**
                     * If we should generate an animation for this value, run some preperation
                     * like resolving target/origin, finding a unit (if any) and determine if
                     * it is actually possible to generate.
                     */ if (shouldGenerate) {
                        toUnit = getUnitConverter(keyframes, name ? transformDefinitions.get(getStyleName(name)) : undefined);
                        const targetDefinition = keyframes[numKeyframes - 1];
                        target = getAsNumber(targetDefinition);
                        if (numKeyframes > 1 && keyframes[0] !== null) {
                            /**
                             * If we have multiple keyframes, take the initial keyframe as the origin.
                             */ origin = getAsNumber(keyframes[0]);
                        } else {
                            const prevGenerator = motionValue === null || motionValue === void 0 ? void 0 : motionValue.generator;
                            /**
                             * If we have an existing generator for this value we can use it to resolve
                             * the animation's current value and velocity.
                             */ if (prevGenerator) {
                                /**
                                 * If we have a generator for this value we can use it to resolve
                                 * the animations's current value and velocity.
                                 */ const { animation , generatorStartTime  } = motionValue;
                                const startTime = (animation === null || animation === void 0 ? void 0 : animation.startTime) || generatorStartTime || 0;
                                const currentTime = (animation === null || animation === void 0 ? void 0 : animation.currentTime) || performance.now() - startTime;
                                const prevGeneratorCurrent = prevGenerator(currentTime).current;
                                origin = prevGeneratorCurrent;
                                velocity = calcGeneratorVelocity((t)=>prevGenerator(t).current
                                , currentTime, prevGeneratorCurrent);
                            } else if (getOrigin) {
                                /**
                                 * As a last resort, read the origin from the DOM.
                                 */ origin = getAsNumber(getOrigin());
                            }
                        }
                    }
                    /**
                     * If we've determined it is possible to generate an animation, do so.
                     */ if (canGenerate(origin) && canGenerate(target)) {
                        const generator = getGenerator(origin, target, velocity, name === null || name === void 0 ? void 0 : name.includes("scale"));
                        settings = Object.assign(Object.assign({}, getKeyframes(generator, toUnit)), {
                            easing: "linear"
                        });
                        // TODO Add test for this
                        if (motionValue) {
                            motionValue.generator = generator;
                            motionValue.generatorStartTime = performance.now();
                        }
                    }
                    /**
                     * If by now we haven't generated a set of keyframes, create a generic generator
                     * based on the provided props that animates from 0-100 to fetch a rough
                     * "overshootDuration" - the moment when the generator first hits the animation target.
                     * Then return animation settings that will run a normal animation for that duration.
                     */ if (!settings) {
                        const keyframesMetadata = getKeyframes(getGenerator(0, 100));
                        settings = {
                            easing: "ease",
                            duration: keyframesMetadata.overshootDuration
                        };
                    }
                    return settings;
                }
            };
        };
    }

    const spring = createGeneratorEasing(spring$1);

    const glide = createGeneratorEasing(glide$1);

    const thresholds = {
        any: 0,
        all: 1
    };
    function inView(elementOrSelector, onStart, { root , margin: rootMargin , amount ="any"  } = {}) {
        /**
         * If this browser doesn't support IntersectionObserver, return a dummy stop function.
         * Default triggering of onStart is tricky - it could be used for starting/stopping
         * videos, lazy loading content etc. We could provide an option to enable a fallback, or
         * provide a fallback callback option.
         */ if (typeof IntersectionObserver === "undefined") {
            return ()=>{};
        }
        const elements = resolveElements(elementOrSelector);
        const activeIntersections = new WeakMap();
        const onIntersectionChange = (entries)=>{
            entries.forEach((entry)=>{
                const onEnd = activeIntersections.get(entry.target);
                /**
                 * If there's no change to the intersection, we don't need to
                 * do anything here.
                 */ if (entry.isIntersecting === Boolean(onEnd)) return;
                if (entry.isIntersecting) {
                    const newOnEnd = onStart(entry);
                    if (isFunction$1(newOnEnd)) {
                        activeIntersections.set(entry.target, newOnEnd);
                    } else {
                        observer.unobserve(entry.target);
                    }
                } else if (onEnd) {
                    onEnd(entry);
                    activeIntersections.delete(entry.target);
                }
            });
        };
        const observer = new IntersectionObserver(onIntersectionChange, {
            root,
            rootMargin,
            threshold: typeof amount === "number" ? amount : thresholds[amount]
        });
        elements.forEach((element)=>observer.observe(element)
        );
        return ()=>observer.disconnect()
        ;
    }

    const resizeHandlers = new WeakMap();
    let observer;
    function getElementSize(target, borderBoxSize) {
        if (borderBoxSize) {
            const { inlineSize , blockSize  } = borderBoxSize[0];
            return {
                width: inlineSize,
                height: blockSize
            };
        } else if (target instanceof SVGElement && "getBBox" in target) {
            return target.getBBox();
        } else {
            return {
                width: target.offsetWidth,
                height: target.offsetHeight
            };
        }
    }
    function notifyTarget({ target , contentRect , borderBoxSize ,  }) {
        var _a;
        (_a = resizeHandlers.get(target)) === null || _a === void 0 ? void 0 : _a.forEach((handler)=>{
            handler({
                target,
                contentSize: contentRect,
                get size () {
                    return getElementSize(target, borderBoxSize);
                }
            });
        });
    }
    function notifyAll(entries) {
        entries.forEach(notifyTarget);
    }
    function createResizeObserver() {
        if (typeof ResizeObserver === "undefined") return;
        observer = new ResizeObserver(notifyAll);
    }
    function resizeElement(target, handler) {
        if (!observer) createResizeObserver();
        const elements = resolveElements(target);
        elements.forEach((element)=>{
            let elementHandlers = resizeHandlers.get(element);
            if (!elementHandlers) {
                elementHandlers = new Set();
                resizeHandlers.set(element, elementHandlers);
            }
            elementHandlers.add(handler);
            observer === null || observer === void 0 ? void 0 : observer.observe(element);
        });
        return ()=>{
            elements.forEach((element)=>{
                const elementHandlers = resizeHandlers.get(element);
                elementHandlers === null || elementHandlers === void 0 ? void 0 : elementHandlers.delete(handler);
                if (!(elementHandlers === null || elementHandlers === void 0 ? void 0 : elementHandlers.size)) {
                    observer === null || observer === void 0 ? void 0 : observer.unobserve(element);
                }
            });
        };
    }

    const windowCallbacks = new Set();
    let windowResizeHandler;
    function createWindowResizeHandler() {
        windowResizeHandler = ()=>{
            const size = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            const info = {
                target: window,
                size,
                contentSize: size
            };
            windowCallbacks.forEach((callback)=>callback(info)
            );
        };
        window.addEventListener("resize", windowResizeHandler);
    }
    function resizeWindow(callback) {
        windowCallbacks.add(callback);
        if (!windowResizeHandler) createWindowResizeHandler();
        return ()=>{
            windowCallbacks.delete(callback);
            if (!windowCallbacks.size && windowResizeHandler) {
                windowResizeHandler = undefined;
            }
        };
    }

    function resize(a, b) {
        return isFunction$1(a) ? resizeWindow(a) : resizeElement(a, b);
    }

    /**
     * A time in milliseconds, beyond which we consider the scroll velocity to be 0.
     */ const maxElapsed = 50;
    const createAxisInfo = ()=>({
            current: 0,
            offset: [],
            progress: 0,
            scrollLength: 0,
            targetOffset: 0,
            targetLength: 0,
            containerLength: 0,
            velocity: 0
        })
    ;
    const createScrollInfo = ()=>({
            time: 0,
            x: createAxisInfo(),
            y: createAxisInfo()
        })
    ;
    const keys = {
        x: {
            length: "Width",
            position: "Left"
        },
        y: {
            length: "Height",
            position: "Top"
        }
    };
    function updateAxisInfo(element, axisName, info, time) {
        const axis = info[axisName];
        const { length , position  } = keys[axisName];
        const prev = axis.current;
        const prevTime = info.time;
        axis.current = element["scroll" + position];
        axis.scrollLength = element["scroll" + length] - element["client" + length];
        axis.offset.length = 0;
        axis.offset[0] = 0;
        axis.offset[1] = axis.scrollLength;
        axis.progress = progress(0, axis.scrollLength, axis.current);
        const elapsed = time - prevTime;
        axis.velocity = elapsed > maxElapsed ? 0 : velocityPerSecond(axis.current - prev, elapsed);
    }
    function updateScrollInfo(element, info, time) {
        updateAxisInfo(element, "x", info, time);
        updateAxisInfo(element, "y", info, time);
        info.time = time;
    }

    function calcInset(element, container) {
        let inset = {
            x: 0,
            y: 0
        };
        let current = element;
        while(current && current !== container){
            if (current instanceof HTMLElement) {
                inset.x += current.offsetLeft;
                inset.y += current.offsetTop;
                current = current.offsetParent;
            } else if (current instanceof SVGGraphicsElement && "getBBox" in current) {
                const { top , left  } = current.getBBox();
                inset.x += left;
                inset.y += top;
                /**
                 * Assign the next parent element as the <svg /> tag.
                 */ while(current && current.tagName !== "svg"){
                    current = current.parentNode;
                }
            }
        }
        return inset;
    }

    const ScrollOffset = {
        Enter: [
            [
                0,
                1
            ],
            [
                1,
                1
            ], 
        ],
        Exit: [
            [
                0,
                0
            ],
            [
                1,
                0
            ], 
        ],
        Any: [
            [
                1,
                0
            ],
            [
                0,
                1
            ], 
        ],
        All: [
            [
                0,
                0
            ],
            [
                1,
                1
            ], 
        ]
    };

    const namedEdges = {
        start: 0,
        center: 0.5,
        end: 1
    };
    function resolveEdge(edge, length, inset = 0) {
        let delta = 0;
        /**
         * If we have this edge defined as a preset, replace the definition
         * with the numerical value.
         */ if (namedEdges[edge] !== undefined) {
            edge = namedEdges[edge];
        }
        /**
         * Handle unit values
         */ if (isString(edge)) {
            const asNumber = parseFloat(edge);
            if (edge.endsWith("px")) {
                delta = asNumber;
            } else if (edge.endsWith("%")) {
                edge = asNumber / 100;
            } else if (edge.endsWith("vw")) {
                delta = asNumber / 100 * document.documentElement.clientWidth;
            } else if (edge.endsWith("vh")) {
                delta = asNumber / 100 * document.documentElement.clientHeight;
            } else {
                edge = asNumber;
            }
        }
        /**
         * If the edge is defined as a number, handle as a progress value.
         */ if (isNumber(edge)) {
            delta = length * edge;
        }
        return inset + delta;
    }

    const defaultOffset = [
        0,
        0
    ];
    function resolveOffset(offset, containerLength, targetLength, targetInset) {
        let offsetDefinition = Array.isArray(offset) ? offset : defaultOffset;
        let targetPoint = 0;
        let containerPoint = 0;
        if (isNumber(offset)) {
            /**
             * If we're provided offset: [0, 0.5, 1] then each number x should become
             * [x, x], so we default to the behaviour of mapping 0 => 0 of both target
             * and container etc.
             */ offsetDefinition = [
                offset,
                offset
            ];
        } else if (isString(offset)) {
            offset = offset.trim();
            if (offset.includes(" ")) {
                offsetDefinition = offset.split(" ");
            } else {
                /**
                 * If we're provided a definition like "100px" then we want to apply
                 * that only to the top of the target point, leaving the container at 0.
                 * Whereas a named offset like "end" should be applied to both.
                 */ offsetDefinition = [
                    offset,
                    namedEdges[offset] ? offset : `0`
                ];
            }
        }
        targetPoint = resolveEdge(offsetDefinition[0], targetLength, targetInset);
        containerPoint = resolveEdge(offsetDefinition[1], containerLength);
        return targetPoint - containerPoint;
    }

    const point = {
        x: 0,
        y: 0
    };
    function resolveOffsets(container, info, options) {
        let { offset: offsetDefinition = ScrollOffset.All  } = options;
        const { target =container , axis ="y"  } = options;
        const lengthLabel = axis === "y" ? "height" : "width";
        const inset = target !== container ? calcInset(target, container) : point;
        /**
         * Measure the target and container. If they're the same thing then we
         * use the container's scrollWidth/Height as the target, from there
         * all other calculations can remain the same.
         */ const targetSize = target === container ? {
            width: container.scrollWidth,
            height: container.scrollHeight
        } : {
            width: target.clientWidth,
            height: target.clientHeight
        };
        const containerSize = {
            width: container.clientWidth,
            height: container.clientHeight
        };
        /**
         * Reset the length of the resolved offset array rather than creating a new one.
         * TODO: More reusable data structures for targetSize/containerSize would also be good.
         */ info[axis].offset.length = 0;
        /**
         * Populate the offset array by resolving the user's offset definition into
         * a list of pixel scroll offets.
         */ let hasChanged = !info[axis].interpolate;
        const numOffsets = offsetDefinition.length;
        for(let i = 0; i < numOffsets; i++){
            const offset = resolveOffset(offsetDefinition[i], containerSize[lengthLabel], targetSize[lengthLabel], inset[axis]);
            if (!hasChanged && offset !== info[axis].interpolatorOffsets[i]) {
                hasChanged = true;
            }
            info[axis].offset[i] = offset;
        }
        /**
         * If the pixel scroll offsets have changed, create a new interpolator function
         * to map scroll value into a progress.
         */ if (hasChanged) {
            info[axis].interpolate = interpolate(defaultOffset$1(numOffsets), info[axis].offset);
            info[axis].interpolatorOffsets = [
                ...info[axis].offset
            ];
        }
        info[axis].progress = info[axis].interpolate(info[axis].current);
    }

    function measure(container, target = container, info) {
        /**
         * Find inset of target within scrollable container
         */ info.x.targetOffset = 0;
        info.y.targetOffset = 0;
        if (target !== container) {
            let node = target;
            while(node && node != container){
                info.x.targetOffset += node.offsetLeft;
                info.y.targetOffset += node.offsetTop;
                node = node.offsetParent;
            }
        }
        info.x.targetLength = target === container ? target.scrollWidth : target.clientWidth;
        info.y.targetLength = target === container ? target.scrollHeight : target.clientHeight;
        info.x.containerLength = container.clientWidth;
        info.y.containerLength = container.clientHeight;
    }
    function createOnScrollHandler(element, onScroll, info, options = {}) {
        const axis = options.axis || "y";
        return {
            measure: ()=>measure(element, options.target, info)
            ,
            update: (time)=>{
                updateScrollInfo(element, info, time);
                if (options.offset || options.target) {
                    resolveOffsets(element, info, options);
                }
            },
            notify: isFunction$1(onScroll) ? ()=>onScroll(info)
             : scrubAnimation(onScroll, info[axis])
        };
    }
    function scrubAnimation(controls, axisInfo) {
        controls.pause();
        controls.forEachNative((animation, { easing  })=>{
            var _a, _b;
            if (animation.updateDuration) {
                if (!easing) animation.easing = noopReturn;
                animation.updateDuration(1);
            } else {
                const timingOptions = {
                    duration: 1000
                };
                if (!easing) timingOptions.easing = "linear";
                (_b = (_a = animation.effect) === null || _a === void 0 ? void 0 : _a.updateTiming) === null || _b === void 0 ? void 0 : _b.call(_a, timingOptions);
            }
        });
        return ()=>{
            controls.currentTime = axisInfo.progress;
        };
    }

    const scrollListeners = new WeakMap();
    const resizeListeners = new WeakMap();
    const onScrollHandlers = new WeakMap();
    const getEventTarget = (element)=>element === document.documentElement ? window : element
    ;
    function scroll(onScroll, _a1 = {}) {
        var { container =document.documentElement  } = _a1, options = __rest(_a1, [
            "container"
        ]);
        let containerHandlers1 = onScrollHandlers.get(container);
        /**
         * Get the onScroll handlers for this container.
         * If one isn't found, create a new one.
         */ if (!containerHandlers1) {
            containerHandlers1 = new Set();
            onScrollHandlers.set(container, containerHandlers1);
        }
        /**
         * Create a new onScroll handler for the provided callback.
         */ const info = createScrollInfo();
        const containerHandler = createOnScrollHandler(container, onScroll, info, options);
        containerHandlers1.add(containerHandler);
        /**
         * Check if there's a scroll event listener for this container.
         * If not, create one.
         */ if (!scrollListeners.has(container)) {
            const listener = ()=>{
                const time = performance.now();
                for (const handler of containerHandlers1)handler.measure();
                for (const handler1 of containerHandlers1)handler1.update(time);
                for (const handler2 of containerHandlers1)handler2.notify();
            };
            scrollListeners.set(container, listener);
            const target = getEventTarget(container);
            window.addEventListener("resize", listener, {
                passive: true
            });
            if (container !== document.documentElement) {
                resizeListeners.set(container, resize(container, listener));
            }
            target.addEventListener("scroll", listener, {
                passive: true
            });
        }
        const listener1 = scrollListeners.get(container);
        const onLoadProcesss = requestAnimationFrame(listener1);
        return ()=>{
            var _a;
            if (typeof onScroll !== "function") onScroll.stop();
            cancelAnimationFrame(onLoadProcesss);
            /**
             * Check if we even have any handlers for this container.
             */ const containerHandlers = onScrollHandlers.get(container);
            if (!containerHandlers) return;
            containerHandlers.delete(containerHandler);
            if (containerHandlers.size) return;
            /**
             * If no more handlers, remove the scroll listener too.
             */ const listener = scrollListeners.get(container);
            scrollListeners.delete(container);
            if (listener) {
                getEventTarget(container).removeEventListener("scroll", listener);
                (_a = resizeListeners.get(container)) === null || _a === void 0 ? void 0 : _a();
                window.removeEventListener("resize", listener);
            }
        };
    }

    function animateProgress(target, options = {}) {
        return withControls([
            ()=>{
                const animation = new Animation(target, [
                    0,
                    1
                ], options);
                animation.finished.catch(()=>{});
                return animation;
            }, 
        ], options, options.duration);
    }
    function animate(target, keyframesOrOptions, options) {
        const factory = isFunction$1(target) ? animateProgress : animate$1;
        return factory(target, keyframesOrOptions, options);
    }

    var ThemeEvent;
    (function(ThemeEvent1) {
        ThemeEvent1["CART_ITEM_ADD"] = "theme:cart-item:add";
        ThemeEvent1["CART_ITEM_UPDATE"] = "theme:cart-item:update";
        ThemeEvent1["ERROR"] = "theme:error";
    })(ThemeEvent || (ThemeEvent = {}));

    var ThemeEditorEvent;
    (function(ThemeEditorEvent1) {
        ThemeEditorEvent1["INSPECTOR_ACTIVATED"] = "shopify:inspector:activate";
        ThemeEditorEvent1["INSPECTOR_DEACTIVATED"] = "shopify:inspector:deactivate";
        ThemeEditorEvent1["SECTION_LOAD"] = "shopify:section:load";
        ThemeEditorEvent1["SECTION_UNLOAD"] = "shopify:section:unload";
        ThemeEditorEvent1["SECTION_SELECT"] = "shopify:section:select";
        ThemeEditorEvent1["SECTION_DESELECT"] = "shopify:section:deselect";
        ThemeEditorEvent1["SECTION_REORDER"] = "shopify:section:reorder";
        ThemeEditorEvent1["BLOCK_SELECT"] = "shopify:block:select";
        ThemeEditorEvent1["BLOCK_DESELECT"] = "shopify:block:deselect";
    })(ThemeEditorEvent || (ThemeEditorEvent = {}));

    undefined && undefined.__rest || function(s, e) {
        var t = {};
        for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
    };

    const ANIMATE_CONTEXT_KEY = Symbol('ANIMATE_CONTEXT_KEY');
    function motionone(Alpine) {
        Alpine.directive('animate', ($el, { expression , modifiers  }, { evaluateLater , effect , cleanup  })=>{
            if (!isHtmlElement($el)) {
                throw new Error(`Expected HTMLElement but got ${$el}`);
            }
            if (!expression) {
                throw new Error('Expected x-animate to be passed a motionone keyframes object but was passed nothing. See https://motion.dev/dom/animate#keyframes');
            }
            const keyframesFn = evaluateLater(expression);
            const context = Alpine.reactive({
                controls: null
            });
            // Autoplay the animation unless .pause modifier is present
            const autoplay = !modifiers.includes('pause');
            effect(()=>{
                keyframesFn((keyframes)=>{
                    if (!isPlainObject(keyframes)) {
                        throw new Error(String.raw`Expected x-animate to be passed a motionone keyframes object but got '${String(keyframes)}'. See https://motion.dev/dom/animate#keyframes`);
                    }
                    context.controls = animate($el, keyframes, {
                        autoplay
                    });
                });
                // Make controls available on node
                Alpine.addScopeToNode($el, {
                    [ANIMATE_CONTEXT_KEY]: context
                });
            });
        });
        Alpine.magic('m1', ()=>({
                animate,
                timeline,
                stagger,
                spring,
                glide,
                scroll,
                inView
            })
        );
        Alpine.magic('animation', ($el)=>{
            const context = Alpine.$data($el)[ANIMATE_CONTEXT_KEY];
            if (!context) throw new Error('$animation needs to be used on or inside an element with x-animate directive');
            return context.controls;
        });
    }

    const selectors$3 = {
        announcementBar: '[data-announcement-bar]',
        tickerFrame: '[data-ticker-frame]',
        tickerScale: '[data-ticker-scale]',
        tickerText: '[data-ticker-text]'
    };
    const classes$1 = {
        isSelected: 'is-selected',
        tickerAnimated: 'ticker--animated'
    };
    function announcementTicker(options = {
        stopClone: false,
        waitForSlider: false
    }) {
        var ref1;
        return {
            tickerFrames: (ref1 = this.$el.closest(selectors$3.announcementBar)) === null || ref1 === void 0 ? void 0 : ref1.querySelectorAll(selectors$3.tickerFrame),
            init () {
                var ref;
                if ((options === null || options === void 0 ? void 0 : options.waitForSlider) && ((ref = this.tickerFrames) === null || ref === void 0 ? void 0 : ref.length) > 1) {
                    // Optionally defer ticker initialization until the announcement slider is loaded
                    document.addEventListener('theme:announcement:loaded', this.initTicker.bind(this));
                } else {
                    this.initTicker();
                }
            },
            initTicker () {
                new Ticker(this.$el, options === null || options === void 0 ? void 0 : options.stopClone);
            },
            toggleTicker (event, isStopped) {
                const tickerScale = this.$el.querySelector(selectors$3.tickerScale);
                const element = this.$el.querySelector(`[x-ref="${event.detail.blockId}"]`);
                if (!element || element.offsetParent === null) return; // No element or the element is hidden
                if (isStopped) {
                    const itemsSpacing = Number(getComputedStyle(element).getPropertyValue('--items-spacing').replace('px', ''));
                    const leftPosition = -(element.offsetLeft + itemsSpacing);
                    tickerScale.setAttribute('data-stop', '');
                    tickerScale.querySelectorAll(selectors$3.tickerText).forEach((textHolder)=>{
                        textHolder.classList.remove(classes$1.tickerAnimated);
                        textHolder.style.transform = `translate3d(${leftPosition}px, 0, 0)`;
                    });
                }
                if (!isStopped) {
                    tickerScale.querySelectorAll(selectors$3.tickerText).forEach((textHolder)=>{
                        textHolder.classList.add(classes$1.tickerAnimated);
                        textHolder.removeAttribute('style');
                    });
                    tickerScale.removeAttribute('data-stop');
                }
            },
            onBlockSelect (event) {
                this.toggleTicker(event, true);
            },
            onBlockDeselect (event) {
                this.toggleTicker(event, false);
            }
        };
    }
    function announcementSlider(speed = 4000) {
        return {
            options: {
                initialIndex: 0,
                autoPlay: speed,
                contain: true,
                pageDots: false,
                adaptiveHeight: true,
                wrapAround: true,
                groupCells: false,
                cellAlign: 'left',
                freeScroll: false,
                prevNextButtons: true,
                draggable: true,
                rightToLeft: window.isRTL,
                on: {
                    ready: ()=>{
                        setTimeout(()=>{
                            this.$el.dispatchEvent(new CustomEvent('theme:announcement:loaded', {
                                bubbles: true,
                                detail: {
                                    slider: this.$el
                                }
                            }));
                        }, 50);
                    }
                }
            },
            flkty: null,
            desktopSlides: [],
            mobileSlides: [],
            isMobileSliderInitialized: false,
            init () {
                this.$nextTick(()=>{
                    // Slow down the initialization so the 'target referrer' slides get removed by the 'x-target-referrer' directive first
                    if (this.$el.children.length < 2) return;
                    this.flkty = new Flickity(this.$el, this.options);
                    this.removeDeviceSpecificSlides();
                    resolution$1.onChange(()=>{
                        this.updateDeviceSpecificSlides();
                    });
                    this.scrollEvent = ()=>this.scrollEvents()
                    ;
                    this.resizeEvent = ()=>this.resizeEvents()
                    ;
                    document.addEventListener('theme:resize', this.resizeEvent);
                    document.addEventListener('theme:scroll', this.scrollEvent);
                });
            },
            removeDeviceSpecificSlides () {
                const slides = this.flkty.getCellElements();
                slides.forEach((slide, index)=>{
                    slide.classList.remove(classes$1.isSelected);
                    if (slide.dataset.device == 'desktop') {
                        this.desktopSlides.push([
                            slide,
                            index
                        ]);
                        if (resolution$1.isMobile()) {
                            this.flkty.remove(slide);
                        }
                    }
                    if (slide.dataset.device == 'mobile') {
                        this.mobileSlides.push([
                            slide,
                            index
                        ]);
                        if (resolution$1.isDesktop() || resolution$1.isTablet()) {
                            this.flkty.remove(slide);
                        }
                    }
                });
                // Fix slides "transform" position bug that appears after resizing the window just before the slide changes
                setTimeout(()=>{
                    this.flkty.resize();
                }, 1000);
                this.handleSliderAutoplay();
                this.isMobileSliderInitialized = resolution$1.isMobile();
            },
            updateDeviceSpecificSlides () {
                if (resolution$1.isDesktop() || resolution$1.isTablet()) {
                    if (this.isMobileSliderInitialized) {
                        // Insert desktop-only slides
                        this.desktopSlides.forEach((slide)=>{
                            this.flkty.insert(slide[0], slide[1]);
                        });
                        // Remove mobile-only slides
                        this.mobileSlides.forEach((slide)=>{
                            this.flkty.remove(slide[0]);
                        });
                    }
                }
                if (resolution$1.isMobile()) {
                    if (!this.isMobileSliderInitialized) {
                        // Insert mobile-only slides
                        this.mobileSlides.forEach((slide)=>{
                            this.flkty.insert(slide[0], slide[1]);
                        });
                        // Remove desktop-only slides
                        this.desktopSlides.forEach((slide)=>{
                            this.flkty.remove(slide[0]);
                        });
                    }
                }
                // Fix slides "transform" position bug that appears after resizing the window just before the slide changes
                setTimeout(()=>{
                    this.flkty.resize();
                }, 1000);
                this.handleSliderAutoplay();
                this.isMobileSliderInitialized = resolution$1.isMobile();
            },
            handleSliderAutoplay () {
                var ref;
                if (((ref = this.flkty) === null || ref === void 0 ? void 0 : ref.slides.length) > 1) {
                    this.flkty.playPlayer();
                } else {
                    this.flkty.pausePlayer();
                }
            },
            resizeEvents () {
                this.flkty.resize();
            },
            scrollEvents () {
                if (!this.flkty.options.autoPlay) return;
                const slider = this.flkty.element;
                const sliderBottomPosition = slider.getBoundingClientRect().top + window.scrollY + slider.offsetHeight;
                if (window.pageYOffset > sliderBottomPosition) {
                    if (this.flkty.player.state === 'playing') {
                        this.flkty.pausePlayer();
                    }
                } else if (this.flkty.player.state === 'paused') {
                    this.flkty.playPlayer();
                }
            },
            onBlockSelect (event) {
                const slide = this.$el.querySelector(`[x-ref="${event.detail.blockId}"]`);
                if (!slide) return;
                const slideIndex = parseInt([
                    ...slide.parentNode.children
                ].indexOf(slide));
                // Go to selected slide, pause autoplay
                this.flkty.selectCell(slideIndex);
                this.flkty.stopPlayer();
            },
            onBlockDeselect () {
                this.flkty.playPlayer();
            },
            onUnload () {
                this.flkty.options.watchCSS = false;
                this.flkty.destroy();
            }
        };
    }
    function announcement() {
        new CartShippingMessage(this.$el);
    }

    const STATES$1 = {
        INITIAL: 0,
        LOADING: 1,
        SUCCESS: 2,
        ERROR: 3
    };
    const selectors$2 = {
        popdown: '[data-product-add-popdown-wrapper]',
        errors: '[data-add-action-errors]',
        errorBoundary: '[data-error-boundary]',
        errorDisplay: '[data-error-display]',
        quickviewModal: '[data-quickview-modal]',
        cartPageUpsellWrapper: '[data-cart-page-upsell-wrapper]',
        sectionTypeCart: '[data-section-type="cart"]',
        ajaxDisable: '[data-ajax-disable="true"]'
    };
    const defaultTimes = {
        durationAddButtonDisable: 3500,
        hideErrorTime: 5000
    };
    /*
    NOTE this is an initial crack at migrating existing product instant add logic
    from WebComponents / direct DOM manipulation style to using Alpine. As such, it is
    fairly rough and not at all (yet) idiomatic Alpine.
    */ function productAddButtonForm(options = {}) {
        const times = {
            ...defaultTimes,
            ...options.times
        };
        return {
            state: STATES$1.INITIAL,
            error: '',
            isUpsell: false,
            isInCartPage: false,
            // Selectors
            get cartPageUpsellWrapper () {
                return this.$el.closest(selectors$2.cartPageUpsellWrapper);
            },
            get sectionTypeCart () {
                return this.$el.closest(selectors$2.sectionTypeCart);
            },
            get form () {
                if (this.isUpsell && this.isInCartPage) {
                    // Get Cart form element to construct a proper FormData object that would contain the productAddButtonForm's fields and their values
                    return this.$el.closest('form');
                }
                return this.$el.querySelector('form');
            },
            get button () {
                return this.$el.querySelector('button');
            },
            get popdown () {
                return document.querySelector(selectors$2.popdown);
            },
            get errorDisplay () {
                let errorsEl = this.$el.querySelector(selectors$2.errors);
                if (!errorsEl) {
                    const ancestorErrorBoundary = this.$el.closest(selectors$2.errorBoundary);
                    if (ancestorErrorBoundary) {
                        errorsEl = ancestorErrorBoundary.querySelector(selectors$2.errorDisplay);
                    }
                }
                if (!errorsEl) {
                    errorsEl = this.$el.querySelector(selectors$2.errorDisplay);
                }
                return errorsEl;
            },
            get quickViewModal () {
                return this.$el.closest(selectors$2.quickviewModal);
            },
            // Getters
            get isInitial () {
                return this.state === STATES$1.INITIAL;
            },
            get isLoading () {
                return this.state === STATES$1.LOADING;
            },
            get isSuccess () {
                return this.state === STATES$1.SUCCESS;
            },
            get isError () {
                return this.state === STATES$1.ERROR;
            },
            get isDisabled () {
                return this.isLoading;
            },
            get isAjaxDisabled () {
                return !!this.$el.closest(selectors$2.ajaxDisable);
            },
            // Bleh, this kind of sucks but neccesary evil for now
            get isInsideQuickViewModal () {
                return Boolean(this.quickViewModal);
            },
            // Handlers
            handleClickAddButton (e) {
                e.preventDefault();
                this.state = STATES$1.LOADING;
                const formData = new FormData(this.form);
                this.addToCart(formData).then(this.handleSuccess.bind(this)).catch(this.handleError.bind(this));
            },
            handleSuccess (response) {
                const variant = response.data;
                this.state = STATES$1.SUCCESS;
                this.updateHeaderTotal();
                // Reset the state back to initial after a duration
                setTimeout(()=>{
                    this.state = STATES$1.INITIAL;
                }, times.durationAddButtonDisable);
                // If we're inside of a quick view, close the quick view.
                if (this.isInsideQuickViewModal) {
                    this.closeQuickView();
                }
                // If cart is open, reload the cart instead of opening a popdown
                if (window.theme.state.cartOpen || this.isInCartPage || this.isOnCartPage) {
                    this.reloadCart();
                } else {
                    this.openPopdown(variant);
                }
            },
            handleError (error) {
                if (error === null || error === void 0 ? void 0 : error.data) {
                    this.state = STATES$1.ERROR;
                    if (error.data.description && typeof error.data.description === 'string') {
                        // Standard stockout error
                        this.error = error.data.description;
                    } else if (error.data.message && typeof error.data.message === 'string') {
                        // Standard giftcard validation error
                        this.error = error.data.message;
                    } else if (error.data.description && typeof error.data.description === 'object') {
                        // Error is custom object, print keys and values into message to avoid [Object object]
                        this.error = Object.keys(error.data.description).map((key)=>{
                            return `${key}: ${error.data.description[key]}`;
                        }).join('<br>');
                    } else {
                        // Fallback
                        this.error = 'Network error: please try again';
                    }
                    if (this.errorDisplay) {
                        const errorsHTML = `<div class="errors">${this.error}</div>`;
                        this.errorDisplay.innerHTML = errorsHTML;
                        slideDown(this.errorDisplay);
                        setTimeout(()=>{
                            slideUp(this.errorDisplay);
                        }, times.hideErrorTime);
                    }
                } else {
                    throw error;
                }
            },
            // Actions
            addToCart (formData) {
                const url = `${window.theme.routes.cart}/add.js`;
                const formPayload = new URLSearchParams(formData).toString();
                return axios.post(url, formPayload, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            },
            updateHeaderTotal () {
                return axios.get(`${window.theme.routes.cart}.js`).then((response)=>{
                    document.dispatchEvent(new CustomEvent('theme:cart:change', {
                        detail: {
                            cart: response.data
                        },
                        bubbles: true
                    }));
                }).catch((e)=>{
                    console.error(e);
                });
            },
            closeQuickView () {
                this.quickViewModal.dispatchEvent(new CustomEvent('theme:quickview:close'));
            },
            reloadCart () {
                document.dispatchEvent(new CustomEvent('theme:cart:reload', {
                    bubbles: true
                }));
            },
            openPopdown (variant) {
                this.popdown.dispatchEvent(new CustomEvent('theme:cart:popdown', {
                    detail: {
                        variant: variant
                    },
                    bubbles: true
                }));
            },
            get isInCartPage () {
                return Boolean(this.sectionTypeCart);
            },
            get isOnCartPage () {
                return Boolean(document.body.querySelector(selectors$2.sectionTypeCart));
            },
            get isUpsell () {
                return Boolean(this.cartPageUpsellWrapper);
            },
            // Initialization
            init () {
                this.button.addEventListener('click', this.handleClickAddButton.bind(this));
            }
        };
    }

    const STATES = {
        INITIAL: 0,
        LOADING: 1
    };
    const selectors$1 = {
        quickviewHolder: 'data-quickview-holder',
        addButtonWrapper: '[data-add-action-wrapper]',
        modalContent: '[data-product-quickview-ajax]',
        quickviewModal: '[data-quickview-modal]',
        quickviewModalScrolls: '[data-drawer-scrolls]',
        quickviewModalTemplate: '[data-quickview-modal-template]',
        quickviewHead: '[data-quickview-head]',
        quickviewFormArea: '[data-quickview-form-area]',
        toggleButton: '[data-toggle-button]',
        media: '[data-media-slide]',
        mediaId: '[data-media-id]',
        focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    };
    const classes = {
        hide: 'hide',
        active: 'is-active',
        expanded: 'is-expanded',
        loading: 'loading'
    };
    const visibleParts = {
        minPart: 250,
        mediumPart: 400
    };
    /*
    NOTE this is an initial crack at migrating existing product quick view modal logic
    from WebComponents / direct DOM manipulation style to using Alpine. As such, it is
    very rough and not at all (yet) idiomatic Alpine.
    */ function productQuickViewButton(_productId, handle) {
        return {
            state: STATES.INITIAL,
            // Selectors
            get quickviewHolder () {
                return this.$el.querySelector(`[${selectors$1.quickviewHolder}]`);
            },
            // Getters
            get isInitial () {
                return this.state === STATES.INITIAL;
            },
            get isLoading () {
                return this.state === STATES.LOADING;
            },
            get isDisabled () {
                return this.isLoading;
            },
            // Methods
            clickQuickviewButton (e) {
                if (this.modal && this.modalID) {
                    // Reset modal ID before html content is loaded
                    this.modal.id = this.modalID;
                }
                if (document.documentElement.hasAttribute('data-scroll-locked')) {
                    this.scrollLockEnable = false;
                }
                this.state = STATES.LOADING;
                this.getQuickviewHTML();
            },
            getQuickviewHTML () {
                window.fetch(`${window.theme.routes.root_url}products/${handle}?section_id=api-product-quickview`).then(this.handleErrors).then((response)=>{
                    return response.text();
                }).then((response)=>{
                    const fresh = document.createElement('div');
                    fresh.innerHTML = response;
                    this.modalContent = this.modal.querySelector(selectors$1.modalContent);
                    this.modalContent.innerHTML = fresh.querySelector('[data-api-content]').innerHTML;
                    this.modalScroll = this.modal.querySelector(selectors$1.quickviewModalScrolls);
                    const images = this.modalContent.querySelector(selectors$1.mediaId);
                    if (images) {
                        const imagesHolder = document.createElement('div');
                        imagesHolder.innerHTML = images.parentElement.innerHTML;
                        this.quickviewHolder.dispatchEvent(new CustomEvent('theme:quickview:media', {
                            bubbles: true,
                            detail: {
                                media: imagesHolder
                            }
                        }));
                    }
                    const section = {
                        container: this.modalContent
                    };
                    this.media = new Media(section);
                    this.modalCreate();
                    this.state = STATES.INITIAL;
                });
            },
            modalCreate () {
                MicroModal.show(this.modalID, {
                    onShow: (modal, el, event)=>{
                        this.quickviewHead = modal.querySelector(selectors$1.quickviewHead);
                        this.quickviewFormArea = modal.querySelector(selectors$1.quickviewFormArea);
                        this.toggleButton = modal.querySelector(selectors$1.toggleButton);
                        this.toggleForm('loading');
                        document.addEventListener('theme:resize', throttle$1(()=>{
                            this.toggleForm('resize');
                        }, 500));
                        this.clickEventToggleForm();
                        const firstFocus = modal.querySelector(selectors$1.focusable);
                        trapFocus(modal, {
                            elementToFocus: firstFocus
                        });
                        this.modal.addEventListener('theme:quickview:close', this.modalClose);
                        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                            bubbles: true,
                            detail: this.modalScroll
                        }));
                        new ImageCaption(this.modal);
                    },
                    onClose: (modal, el, event)=>{
                        this.media.destroy();
                        const allMedia = modal.querySelectorAll(selectors$1.media);
                        allMedia.forEach((media)=>{
                            media.dispatchEvent(new CustomEvent('pause'));
                        });
                        removeTrapFocus();
                        el.focus();
                        this.modal.removeEventListener('theme:quickview:close', this.modalClose);
                        if (this.scrollLockEnable) {
                            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                                bubbles: true
                            }));
                        } else {
                            this.scrollLockEnable = true;
                        }
                    }
                });
            },
            modalClose () {
                MicroModal.close(this.modalID);
            },
            handleErrors (response) {
                if (!response.ok) {
                    return response.json().then(function(json) {
                        const e = new FetchError({
                            status: response.statusText,
                            headers: response.headers,
                            json: json
                        });
                        throw e;
                    });
                }
                return response;
            },
            toggleForm (event) {
                if (this.windowH === window.innerHeight && event === 'resize') {
                    return;
                }
                if (!this.toggleButton.classList.contains(classes.hide)) {
                    this.toggleButton.classList.add(classes.hide);
                }
                if (!this.quickviewFormArea.classList.contains(classes.expanded)) {
                    this.quickviewFormArea.classList.add(classes.expanded);
                }
                if (event === 'resize') {
                    this.quickviewFormArea.classList.add(classes.expanded);
                    this.toggleButton.classList.add(classes.hide);
                    this.windowH = window.innerHeight;
                }
                setTimeout(()=>{
                    const imagesVisiblePartOfImages = window.innerHeight - this.quickviewHead.offsetHeight - this.quickviewFormArea.offsetHeight;
                    const hasMediumVisiblePart = imagesVisiblePartOfImages < visibleParts.mediumPart && imagesVisiblePartOfImages > visibleParts.minPart;
                    const missingVisiblePart = imagesVisiblePartOfImages < visibleParts.minPart;
                    if (hasMediumVisiblePart || missingVisiblePart) {
                        this.toggleButton.classList.remove(classes.hide);
                        this.toggleButton.classList.add(classes.active);
                    } else {
                        this.toggleButton.classList.add(classes.hide);
                    }
                    if (missingVisiblePart) {
                        if (event === 'loading') {
                            this.quickviewFormArea.classList.add(classes.loading);
                            setTimeout(()=>{
                                this.quickviewFormArea.classList.remove(classes.loading);
                            }, 50);
                        }
                        this.quickviewFormArea.classList.remove(classes.expanded);
                        this.toggleButton.classList.remove(classes.active);
                    } else {
                        this.quickviewFormArea.classList.add(classes.expanded);
                    }
                }, 200);
            },
            clickEventToggleForm () {
                if (!this.toggleButton) return;
                this.toggleButton.addEventListener('click', ()=>{
                    this.toggleButton.classList.toggle(classes.active);
                    this.quickviewFormArea.classList.toggle(classes.expanded);
                });
            },
            // Initialization
            init () {
                if (this.quickviewHolder) {
                    this.modalTemplate = this.quickviewHolder.querySelector(selectors$1.quickviewModalTemplate);
                    this.modal = document.querySelector(selectors$1.quickviewModal);
                    this.modalID = this.quickviewHolder.getAttribute(selectors$1.quickviewHolder);
                    this.modalContent = null;
                    this.modalScroll = null;
                    this.scrollLockEnable = true;
                    this.windowH = window.innerHeight;
                    if (this.modalTemplate && !this.modal) {
                        const modalTemplateInner = this.modalTemplate.innerHTML;
                        const htmlObject = document.createElement('div');
                        htmlObject.innerHTML = modalTemplateInner;
                        this.modalHtml = htmlObject.querySelector(selectors$1.quickviewModal);
                        document.body.appendChild(this.modalHtml);
                        this.modal = document.querySelector(selectors$1.quickviewModal);
                    }
                }
            }
        };
    }

    function toggle() {
        return {
            isOpen: false,
            get isClosed () {
                return !this.isOpen;
            },
            toggle () {
                if (this.isOpen) {
                    return this.close();
                }
                this.open();
            },
            open () {
                this.isOpen = true;
            },
            close () {
                if (!this.isOpen) return;
                this.isOpen = false;
            }
        };
    }

    function isFunction(x) {
        return typeof x === 'function';
    }

    /**
     * Higher-order component that allows you to compose multiple components into a single component
     * while preserving reactivity, access to magics, access to the parent scope, and calling each component's `init()` method
     *
     * @example
     *
     * <div x-data="compose(componentA, componentB)">
     *  <span x-text="somePropFromComponentA"></span>
     *  <span x-text="somePropFromComponentB"></span>
     * </div>
     *
     * @param components
     * @returns
     */ function compose(...components) {
        return components.reduce((composedComponent, componentOrComponentFunction)=>{
            const component = isFunction(componentOrComponentFunction) ? componentOrComponentFunction() : componentOrComponentFunction;
            // Add the init method to the list of initializers to be called in order once composed component is initialized
            if (component.init) {
                composedComponent._initializers.push(component.init);
            }
            // Delete the init method so it doesn't get called twice
            delete component.init;
            // Add property descriptors from component to composed component
            const extendedComponent = Object.defineProperties(composedComponent, Object.getOwnPropertyDescriptors(component));
            return extendedComponent;
        }, {
            _initializers: [],
            init () {
                // Call each initializer in order
                this._initializers.forEach((initializer)=>initializer.call(this)
                );
            }
        });
    }

    function productGridItemQuickAddMenu() {
        return compose(toggle(), {
            controller: null,
            init () {
                this.$watch('isOpen', (isOpen)=>{
                    if (isOpen) {
                        this.listen();
                    } else {
                        this.unlisten();
                    }
                });
            },
            // Only listen for events when the menu is open in order to reduce unnecessary event listeners
            listen () {
                this.controller = new AbortController();
                // Close on mouse leave
                this.$el.addEventListener('mouseleave', ()=>{
                    this.close();
                }, {
                    signal: this.controller.signal
                });
                // Close on click outside
                document.addEventListener('click', (e)=>{
                    if (this.$el.contains(e.target)) return;
                    // Additional check for special implementations like x-collapse
                    // where the element doesn't have display: none
                    if (this.$el._x_isShown === false) return;
                    this.close();
                }, {
                    signal: this.controller.signal
                });
                // Close on focus outside
                document.addEventListener('focusin', (e)=>{
                    if (this.$el.contains(e.target)) return;
                    this.close();
                }, {
                    signal: this.controller.signal
                });
                // Close when esc pressed
                document.addEventListener('keydown', (e)=>{
                    if (e.key === 'Escape') {
                        this.close();
                    }
                }, {
                    signal: this.controller.signal
                });
            },
            unlisten () {
                // Remove all listeners
                this.controller.abort();
                this.controller = null;
            }
        });
    }

    const selectors = {
        tablist: '[role="tablist"]',
        tab: '[role="tab"]'
    };
    function tabs(initialIndex = 0) {
        return {
            selectedIndex: null,
            init () {
                // Set the first available tab on the page on page load.
                this.$nextTick(()=>this.select(initialIndex)
                );
            },
            // Selectors
            get tablist () {
                return this.$el.querySelector(selectors.tablist);
            },
            get tabs () {
                var ref;
                return (ref = this.tablist) === null || ref === void 0 ? void 0 : ref.querySelectorAll(selectors.tab);
            },
            getTab (index) {
                var ref;
                return (ref = this.tabs) === null || ref === void 0 ? void 0 : ref[index];
            },
            isSelected (index) {
                return this.selectedIndex === index;
            },
            // Actions
            select (index, scrollIntoView = true) {
                this.selectedIndex = index;
                const tab = this.getTab(index);
                if (tab && scrollIntoView) {
                    this.tablist.scrollTo({
                        top: 0,
                        left: tab.offsetLeft - tab.clientWidth,
                        behavior: 'smooth'
                    });
                }
            },
            // Shared directives
            bindTabs: {
                ['x-id']: "['tab', 'tab-panel']"
            },
            bindTablist: {
                [':role']: "'tablist'",
                ['@keydown.right.prevent.stop']: '$focus.wrap().next()',
                ['@keydown.home.prevent.stop']: '$focus.first()',
                ['@keydown.page-up.prevent.stop']: '$focus.first()',
                ['@keydown.left.prevent.stop']: '$focus.wrap().prev()',
                ['@keydown.end.prevent.stop']: '$focus.last()',
                ['@keydown.page-down.prevent.stop']: '$focus.last()'
            },
            bindTabpanels: {},
            bindTab (index) {
                return {
                    [':id']: `$id('tab', ${index + 1})`,
                    [':role']: "'tab'",
                    ['@click']: `select(${index})`,
                    ['@mousedown.prevent']: '',
                    ['@focus']: `select(${index})`,
                    [':tabindex']: `isSelected(${index}) ? 0 : -1`,
                    [':aria-selected']: `isSelected(${index})`,
                    [':aria-controls']: `$id('tab-panel', ${index + 1})`
                };
            },
            bindTabpanel (index) {
                return {
                    [':id']: `$id('tab-panel', ${index + 1})`,
                    [':role']: "'tabpanel'",
                    ['x-show']: `isSelected(${index})`,
                    [':aria-labelledby']: `$id('tab', ${index + 1})`
                };
            }
        };
    }

    function overflow(options1 = {}) {
        const inset = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            ...options1.inset
        };
        return {
            get overflowContainer () {
                return this.$refs.overflowContainer;
            },
            isOverflowing: {
                top: false,
                bottom: false,
                left: false,
                right: false
            },
            checkOverflow () {
                const scrollOffsetBottom = this.overflowContainer.scrollHeight - this.overflowContainer.scrollTop - inset.bottom;
                const scrollOffsetRight = this.overflowContainer.scrollWidth - this.overflowContainer.scrollLeft - inset.right;
                this.isOverflowing.top = this.overflowContainer.scrollTop - inset.top > 0;
                this.isOverflowing.bottom = scrollOffsetBottom > this.overflowContainer.clientHeight;
                this.isOverflowing.left = this.overflowContainer.scrollLeft - inset.left > 0;
                this.isOverflowing.right = scrollOffsetRight > this.overflowContainer.clientWidth;
            },
            scrollTo (options) {
                this.overflowContainer.scrollTo(options);
            }
        };
    }

    /**
     * Directive to allow repeatedly triggering an action while the mouse is held down or while element is being touched
     *
     * e.g.
     *
     * <button x-hold.250ms="console.log('clicked')">Hold me down</button>
     */ var hold = (($el, { modifiers , expression  }, { cleanup , evaluate  })=>{
        let intervalId = null;
        let firstModifier = modifiers[0] || '';
        let time = Number.isInteger(firstModifier.split('ms')[0]) ? Number(firstModifier.split('ms')[0]) : 25;
        const startAction = ()=>{
            intervalId = setInterval(()=>{
                evaluate(expression);
            }, time);
        };
        const stopAction = ()=>{
            clearInterval(intervalId);
        };
        $el.addEventListener('mousedown', startAction);
        $el.addEventListener('mouseup', stopAction);
        $el.addEventListener('mouseleave', stopAction);
        $el.addEventListener('touchstart', startAction);
        $el.addEventListener('touchend', stopAction);
        cleanup(()=>{
            $el.removeEventListener('mousedown', startAction);
            $el.removeEventListener('mouseup', stopAction);
            $el.removeEventListener('mouseleave', stopAction);
            $el.removeEventListener('touchstart', startAction);
            $el.removeEventListener('touchend', stopAction);
        });
    });

    /**
     * Directive to remove an element based on the previously loaded page
     * e.g.
     * <div x-target-referrer="/collections/all"></div>
     */ var targetReferrer = ((el, { expression  })=>{
        if (!expression) return;
        if (document.referrer.indexOf(expression) === -1 && !window.Shopify.designMode) {
            el.parentNode.removeChild(el);
        }
    });

    /**
     * Magic to nudge the scroll position of an element by a certain amount
     *
     * @example
     *
     * <button x-on:click="$nudge($refs.someElement, 10)">Nudge!</button>
     */ // TODO test me
    function nudge(_$el) {
        return (target, { left , top , ...options })=>{
            target.scrollTo({
                ...left && {
                    left: Math.max(Math.min(target.scrollLeft + left, target.scrollWidth), 0)
                },
                ...top && {
                    left: Math.max(Math.min(target.scrollTop + top, target.scrollHeight), 0)
                },
                ...options
            });
        };
    }

    module_default.plugin(motionone);
    /* Data */ module_default.data('announcement', announcement);
    module_default.data('announcementSlider', announcementSlider);
    module_default.data('announcementTicker', announcementTicker);
    module_default.data('productAddButtonForm', productAddButtonForm);
    module_default.data('productQuickViewButton', productQuickViewButton);
    module_default.data('productGridItemQuickAddMenu', productGridItemQuickAddMenu);
    module_default.data('toggle', toggle);
    module_default.data('tabs', tabs);
    module_default.data('overflow', overflow);
    /* Magics */ module_default.magic('nudge', nudge);
    /* Directives */ module_default.directive('hold', hold);
    module_default.directive('target-referrer', targetReferrer);
    /* Plugins */ module_default.plugin(module_default$2);
    module_default.plugin(module_default$1);
    /* Initialization */ module_default.start();
    // Mainly for Alpine.js devtools to work
    window.Alpine = module_default;

})(themeVendor.AOS, themeVendor.FlickityFade, themeVendor.ScrollLock, themeVendor.Flickity, themeVendor.Sqrl, themeVendor.MicroModal, themeVendor.Rellax, themeVendor.themeCurrency, themeVendor.axios, themeVendor.FlickitySync, themeVendor.themeAddresses);
