(() => {
  "use strict";

  /* ============================================================
   * CONFIG
   * ========================================================== */
  const SELECTORS = {
    swiper: ".swiper",
    nextArrow: ".swiper-arrow.is-next",
    prevArrow: ".swiper-arrow.is-previous",
    insertWrap: "[data-element='insert']",
    contents: "[data-element='contents']",
    quote: "[data-element='quote']",
    slider: "[data-element='slider']",
    pinTrigger: ".pin_trigger",
    singleRoomPin: "[data-wf--c-pin-element--variant]",
    staticRoomPin: "[data-wf--c-static-pin-element--variant]",
    roomPill: ".types_wrapper-item[data-trigger]",
    slideAnchor: "[data-slide]",
  };

  /* ============================================================
   * UTILITIES
   * ========================================================== */
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // open & close contact modal
  const m = document.querySelector(".contact-modal_component"),
    o = document.querySelector(".contact-modal_background-overlay"),
    c = document.querySelector(".contact-modal_close-button");
  document
    .querySelectorAll("[data-trigger='contact']")
    .forEach((t) =>
      t.addEventListener("click", () => m?.classList.add("show"))
    );
  [o, c].forEach((el) =>
    el?.addEventListener("click", () => m?.classList.remove("show"))
  );
  document.addEventListener(
    "keydown",
    (e) => e.key === "Escape" && m?.classList.remove("show")
  );

  /* ============================================================
   * MODULE: Swipers
   * ========================================================== */
  const Swipers = (() => {
    function findArrow(box, selector) {
      return (
        box.querySelector(selector) ||
        (box.parentElement && box.parentElement.querySelector(selector))
      );
    }

    function build(box) {
      if (!box || box.swiper || typeof Swiper === "undefined") return;

      const isRoomSlider = box.hasAttribute("data-room");
      const dataSlides = parseFloat(box.getAttribute("data-slides"));
      const desktopSlides = Number.isNaN(dataSlides) ? "auto" : dataSlides;

      new Swiper(box, {
        spaceBetween: 20,
        loop: false,
        slidesPerView: 1,
        slidesPerGroup: 1,
        watchOverflow: false,
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        navigation: {
          nextEl: findArrow(box, SELECTORS.nextArrow),
          prevEl: findArrow(box, SELECTORS.prevArrow),
        },
        breakpoints: isRoomSlider
          ? {
              768: { slidesPerView: 3, slidesPerGroup: 1 },
              992: { slidesPerView: 3, slidesPerGroup: 1 },
            }
          : {
              768: { slidesPerView: 2 },
              992: { slidesPerView: desktopSlides },
            },
        on: {
          init(swiper) {
            const el = swiper.el;
            const ro = new ResizeObserver((entries) => {
              for (const entry of entries) {
                if (entry.contentRect.width > 100) {
                  swiper.update();
                  ro.disconnect();
                }
              }
            });
            ro.observe(el);
            setTimeout(() => {
              swiper.update();
              ro.disconnect();
            }, 500);
          },
        },
      });
    }

    function init(scope = document, includeInserted = false) {
      scope.querySelectorAll(SELECTORS.swiper).forEach((box) => {
        if (!includeInserted && box.closest(SELECTORS.insertWrap)) return;
        build(box);
      });
    }

    return { build, init };
  })();

  /* ============================================================
   * MODULE: Listing pins (hover / click reveal)
   * ========================================================== */
  const ListingPins = (() => {
    function init(scope = document) {
      const triggers = [...scope.querySelectorAll(SELECTORS.pinTrigger)];
      if (!triggers.length) return;

      let active = null;

      function setIcon(trigger, isActive) {
        const inactive = trigger.querySelector("[data-inactive]");
        const activeIcon = trigger.querySelector("[data-active]");
        if (inactive) inactive.style.opacity = isActive ? "0" : "1";
        if (activeIcon) activeIcon.style.opacity = isActive ? "1" : "0";
      }

      function hideAll() {
        triggers.forEach((trigger) => {
          const target = trigger.previousElementSibling;
          if (target) target.style.opacity = "0";
          setIcon(trigger, false);
        });
        active = null;
      }

      function show(trigger) {
        hideAll();
        const target = trigger.previousElementSibling;
        if (target) target.style.opacity = "1";
        setIcon(trigger, true);
        active = trigger;
      }

      hideAll();

      triggers.forEach((trigger) => {
        trigger.addEventListener("mouseenter", () => show(trigger));
        trigger.addEventListener("mouseleave", hideAll);
        trigger.addEventListener("click", () => {
          if (active === trigger) {
            hideAll();
          } else {
            show(trigger);
          }
        });
      });
    }

    return { init };
  })();

  /* ============================================================
   * MODULE: Single room pins (positioned + content placement)
   * ---------------------------------------------------------
   * Two pin kinds share this module:
   *  - [data-wf--c-pin-element--variant]         -> randomized
   *    position within its quadrant, re-rolled on every layout
   *    pass via place().
   *  - [data-wf--c-static-pin-element--variant]  -> author-fixed
   *    position (CSS/Webflow controls left/top). place() skips
   *    the randomization branch entirely and only reads the
   *    current geometry so positionContent() still has what it
   *    needs to point the hover content box the right way.
   * ========================================================== */
  const SingleRoomPins = (() => {
    function init(scope = document) {
      const attr = "data-wf--c-pin-element--variant";
      const staticAttr = "data-wf--c-static-pin-element--variant";
      const pins = [
        ...scope.querySelectorAll(
          `${SELECTORS.singleRoomPin}, ${SELECTORS.staticRoomPin}`
        ),
      ];
      if (!pins.length) return;

      const rootSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const minW = 23.5 * rootSize;
      const gap = 1.25 * rootSize;
      const edge = 0.5 * rootSize;
      const radius = "1.875rem";

      const items = pins.map((el) => {
        const isStatic = el.hasAttribute(staticAttr);
        return {
          el,
          content: el.querySelector(".pin_content"),
          variant: (isStatic ? el.getAttribute(staticAttr) : el.getAttribute(attr)) || "",
          isStatic,
          rx: Math.random(),
          ry: Math.random(),
        };
      });

      function place(item) {
        const el = item.el;
        const parent = el.offsetParent || el.parentElement;
        if (!parent) return;

        const pw = parent.clientWidth;
        const ph = parent.clientHeight;
        const ew = el.offsetWidth;
        const eh = el.offsetHeight;

        if (item.isStatic) {
          item.left = el.offsetLeft;
          item.top = el.offsetTop;
          item.pw = pw;
          item.ph = ph;
          item.ew = ew;
          item.eh = eh;
          return;
        }

        const v = item.variant;

        let leftMin, leftMax, topMin, topMax;

        if (v === "center") {
          leftMin = pw * 0.25;
          leftMax = pw * 0.75 - ew;
          topMin = ph * 0.25;
          topMax = ph * 0.75 - eh;
        } else {
          if (v.includes("right")) {
            leftMin = pw / 2;
            leftMax = pw - ew;
          } else {
            leftMin = 0;
            leftMax = pw / 2 - ew;
          }

          if (v.includes("bottom")) {
            topMin = ph / 2;
            topMax = ph - eh;
          } else {
            topMin = 0;
            topMax = ph / 2 - eh;
          }
        }

        const left = Math.max(
          0,
          Math.min(leftMin + (leftMax - leftMin) * item.rx, pw - ew)
        );
        const top = Math.max(
          0,
          Math.min(topMin + (topMax - topMin) * item.ry, ph - eh)
        );

        el.style.left = `${left}px`;
        el.style.top = `${top}px`;

        item.left = left;
        item.top = top;
        item.pw = pw;
        item.ph = ph;
        item.ew = ew;
        item.eh = eh;
      }

      function positionContent(item) {
        const content = item.content;
        if (!content || item.pw == null) return;

        const pinRight = item.left + item.ew;
        const pinBottom = item.top + item.eh;

        const roomRight = item.pw - item.left;
        const roomLeft = pinRight;
        const roomDown = item.ph - item.top;
        const roomUp = pinBottom;

        const openRight = roomRight >= roomLeft;
        const openUp = roomUp >= roomDown;

        const avail = Math.max(
          0,
          (openRight ? roomRight : roomLeft) - gap - edge
        );

        content.style.minWidth = `${Math.min(minW, avail)}px`;
        content.style.maxWidth = `${avail}px`;

        if (openUp && openRight) {
          content.style.inset = `auto auto ${gap}px ${gap}px`;
          content.style.borderRadius = `${radius} ${radius} ${radius} 0`;
        } else if (openUp && !openRight) {
          content.style.inset = `auto ${gap}px ${gap}px auto`;
          content.style.borderRadius = `${radius} ${radius} 0 ${radius}`;
        } else if (!openUp && openRight) {
          content.style.inset = `${gap}px auto auto ${gap}px`;
          content.style.borderRadius = `0 ${radius} ${radius} ${radius}`;
        } else {
          content.style.inset = `${gap}px ${gap}px auto auto`;
          content.style.borderRadius = `${radius} 0 ${radius} ${radius}`;
        }
      }

      function update() {
        items.forEach((item) => {
          place(item);
          positionContent(item);
        });
      }

      update();
      window.addEventListener("resize", debounce(update, 150));
    }

    return { init };
  })();

  /* ============================================================
   * MODULE: CMS insert (token replacement -> native elements)
   * ========================================================== */
  const CmsInsert = (() => {
    function findClosestRelated(startEl, selector) {
      let el = startEl;
      while (el) {
        const found = el.querySelector(selector);
        if (found) return found;
        el = el.parentElement;
      }
      return null;
    }

    function placeInsertToken(contents, token, el) {
      if (!contents || !el) return;

      const walker = document.createTreeWalker(contents, NodeFilter.SHOW_TEXT);
      let node;

      while ((node = walker.nextNode())) {
        const idx = node.nodeValue.indexOf(token);
        if (idx === -1) continue;

        const parent = node.parentNode;
        const after = node.splitText(idx);
        after.nodeValue = after.nodeValue.slice(token.length);

        let block = parent;
        while (block.parentNode && block.parentNode !== contents) {
          block = block.parentNode;
        }

        if (block !== contents && block.textContent.trim() === "") {
          contents.replaceChild(el, block);
        } else {
          parent.insertBefore(el, after);
        }

        el.style.display = "block";
        return;
      }
    }

    function init(scope = document) {
      scope.querySelectorAll(SELECTORS.contents).forEach((contents) => {
        const insert = findClosestRelated(
          contents.parentElement,
          SELECTORS.insertWrap
        );
        if (!insert) return;

        const quote = insert.querySelector(SELECTORS.quote);
        const slider = insert.querySelector(SELECTORS.slider);

        if (quote) placeInsertToken(contents, "{{quote}}", quote);
        if (slider) placeInsertToken(contents, "{{slider}}", slider);

        insert.remove();

        if (slider) {
          slider.querySelectorAll(SELECTORS.swiper).forEach((box) => {
            if (box.swiper) {
              box.swiper.update();
            } else {
              Swipers.build(box);
            }
          });
        }
      });
    }

    return { init };
  })();

  /* ============================================================
   * MODULE: Sync slider (click-driven trigger/image/text groups)
   * ========================================================== */
  const SyncSlider = (() => {
    let booted = false;

    function wire(options) {
      const {
        triggerAttr = "data-trigger",
        triggerSelector = `[data-trigger]:not([data-trigger='contact'])`,
        groupAttrs = ["data-image", "data-text"],
        activeClass = "is-active",
        defaultValue = null,
        root = document,
      } = options;

      const groups = groupAttrs.map((attr) => ({
        attr,
        els: [...root.querySelectorAll(`[${attr}]`)],
      }));

      if (!groups.some((group) => group.els.length)) return false;

      const hasMatch = (value) =>
        groups.some(({ attr, els }) =>
          els.some((el) => el.getAttribute(attr) === value)
        );

      const triggers = [...root.querySelectorAll(triggerSelector)].filter(
        (trigger) => hasMatch(trigger.getAttribute(triggerAttr))
      );
      if (!triggers.length) return false;

      function activate(value) {
        groups.forEach(({ attr, els }) => {
          els.forEach((el) => {
            const match = el.getAttribute(attr) === value;
            el.style.opacity = match ? "1" : "0";
            el.style.pointerEvents = match ? "auto" : "none";
          });
        });

        triggers.forEach((trigger) => {
          trigger.classList.toggle(
            activeClass,
            trigger.getAttribute(triggerAttr) === value
          );
        });
      }

      triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
          activate(trigger.getAttribute(triggerAttr));
        });
      });

      activate(defaultValue ?? triggers[0].getAttribute(triggerAttr));
      return true;
    }

    function init(options = {}) {
      if (booted) return;
      if (wire(options)) {
        booted = true;
        return;
      }

      const root = options.root ?? document;
      const mo = new MutationObserver(() => {
        if (wire(options)) {
          booted = true;
          mo.disconnect();
        }
      });
      mo.observe(root === document ? document.documentElement : root, {
        childList: true,
        subtree: true,
      });
      setTimeout(() => mo.disconnect(), 8000);
    }

    function reset() {
      booted = false;
    }

    return { init, reset };
  })();

  /* ============================================================
   * MODULE: Room switch (pill <-> slide, matched by value)
   * ---------------------------------------------------------
   * Two layouts, same trigger mechanism:
   *  - Absolute stack  -> toggle opacity via is-hidden
   *  - .is-relative    -> sticky/in-flow. All math uses LAYOUT
   *    position (offsetTop chain), never rendered geometry, so
   *    sticky pinning can't distort the click target or the spy.
   * ========================================================== */
  const RoomSwitch = (() => {
    let booted = false;
    const bound = new WeakSet();

    function getScroller(el) {
      let node = el.parentElement;
      while (node && node !== document.body) {
        const oy = getComputedStyle(node).overflowY;
        if (
          (oy === "auto" || oy === "scroll") &&
          node.scrollHeight > node.clientHeight
        ) {
          return node;
        }
        node = node.parentElement;
      }
      return window;
    }

    function layoutTop(el, scroller) {
      const stop = scroller === window ? null : scroller;
      let top = 0;
      let node = el;
      while (node && node !== stop) {
        top += node.offsetTop;
        node = node.offsetParent;
      }
      return top;
    }

    // True in-flow top of a slide, immune to sticky pinning.
    // offsetTop is NOT sticky-proof: a pinned slide reports a top near the
    // current scroll position, so scrolling "back" to an already-pinned slide
    // computes a target ≈ where we already are and nothing happens. Neutralize
    // the slide's own sticky positioning, read its real offset, then restore.
    // The read is synchronous and position is restored before paint, so there
    // is no visible flicker. (Assumes only the slides are sticky, not their
    // ancestors up to the scroller — matches the documented DOM.)
    function flowTop(el, scroller) {
      const prev = el.style.position;
      el.style.position = "static";
      const top = layoutTop(el, scroller);
      el.style.position = prev;
      return top;
    }

    function getScroll(scroller) {
      return scroller === window
        ? window.scrollY || document.documentElement.scrollTop
        : scroller.scrollTop;
    }

    function getViewport(scroller) {
      return scroller === window ? window.innerHeight : scroller.clientHeight;
    }

    function scrollTo(scroller, top) {
      if (scroller === window) {
        if (window.lenis && typeof window.lenis.scrollTo === "function") {
          window.lenis.scrollTo(top);
        } else {
          window.scrollTo({ top, behavior: "smooth" });
        }
      } else {
        scroller.scrollTo({ top, behavior: "smooth" });
      }
    }

    function wire(scope) {
      const pills = [...scope.querySelectorAll(SELECTORS.roomPill)].filter(
        (pill) => pill.dataset.trigger
      );
      const slides = [...scope.querySelectorAll(SELECTORS.slideAnchor)];
      if (!pills.length || !slides.length) return false;

      const relativeSlides = slides.filter((slide) =>
        slide.classList.contains("is-relative")
      );

      function setActivePill(value) {
        pills.forEach((pill) =>
          pill.classList.toggle("is-active", pill.dataset.trigger === value)
        );
      }

      function showAbsolute(value) {
        slides.forEach((slide) => {
          if (slide.classList.contains("is-relative")) return;
          slide.classList.toggle("is-hidden", slide.dataset.slide !== value);
        });
      }

      function activate(value, isInitial) {
        setActivePill(value);

        const target = slides.find((slide) => slide.dataset.slide === value);
        if (!target) {
          console.warn(
            `RoomSwitch: no [data-slide="${value}"] found — ignored`
          );
          return;
        }

        if (target.classList.contains("is-relative")) {
          if (isInitial) return;
          const scroller = getScroller(target);
          const margin =
            parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
          scrollTo(scroller, flowTop(target, scroller) - margin);
        } else {
          showAbsolute(value);
        }
      }

      pills.forEach((pill) => {
        if (bound.has(pill)) return;
        bound.add(pill);
        pill.addEventListener("click", (e) => {
          e.preventDefault();
          activate(pill.dataset.trigger, false);
        });
      });

      // scroll-spy: position-derived (not edge-triggered), so it
      // resolves correctly scrolling both up and down through sticky slides
      if (relativeSlides.length) {
        const scroller = getScroller(relativeSlides[0]);

        function spyUpdate() {
          const line = getScroll(scroller) + getViewport(scroller) / 2;
          let current = relativeSlides[0];
          for (const slide of relativeSlides) {
            if (layoutTop(slide, scroller) <= line) {
              current = slide;
            } else {
              break;
            }
          }
          if (current) setActivePill(current.dataset.slide);
        }

        let ticking = false;
        function onScroll() {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            spyUpdate();
            ticking = false;
          });
        }

        const scrollTarget = scroller === window ? window : scroller;
        scrollTarget.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", debounce(spyUpdate, 150));
        requestAnimationFrame(spyUpdate);
      }

      const initial =
        pills.find((pill) => pill.classList.contains("is-active")) || pills[0];
      activate(initial.dataset.trigger, true);
      return true;
    }

    function init(scope = document) {
      if (booted) return;
      if (wire(scope)) {
        booted = true;
        return;
      }

      const mo = new MutationObserver(() => {
        if (wire(document)) {
          booted = true;
          mo.disconnect();
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => mo.disconnect(), 8000);
    }

    return { init };
  })();

  /* ============================================================
   * BOOTSTRAP
   * ========================================================== */
  function initPage(scope = document) {
    Swipers.init(scope, false);
    ListingPins.init(scope);
    SingleRoomPins.init(scope);
    CmsInsert.init(scope);
    SyncSlider.init({ root: scope });
    RoomSwitch.init(scope);
  }

  onReady(() => {
    initPage(document);
  });

  document.addEventListener("inserts:ready", () => {
    CmsInsert.init(document);
    Swipers.init(document, true);
    SyncSlider.reset();
    SyncSlider.init({ root: document });
    RoomSwitch.init(document);
  });
})();
