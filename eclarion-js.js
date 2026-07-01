(() => {
  // Initialize Text Reveal Animations
  function initRevealAnimations() {
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      let splitTextLines = new SplitText(element, { type: "lines" }).lines;
      gsap.set(splitTextLines, { color: "rgba(18, 19, 43, 0.2)" });

      let timeline = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          end: "bottom 40%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      splitTextLines.forEach((line, index) => {
        timeline.to(
          line,
          { color: "rgba(18, 19, 43, 1)", ease: "none", duration: 1 },
          index * 0.8
        );
      });
    });
  }

  // Initialize Split and Fade-In Intersection Observers
  function initFadeAndSplitObservers() {
    let splitObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          let target = entry.target;
          let splitType = target.dataset.split || "lines";
          let splitText = new SplitText(target, { type: splitType });
          let splitElements = splitText[splitType] ?? splitText.lines;

          gsap.set(target, { autoAlpha: 1 });
          gsap.from(splitElements, {
            autoAlpha: 0,
            y: 40,
            delay: 0.3,
            duration: 2,
            stagger: 0.2,
            ease: "power3.out",
          });

          splitObserver.unobserve(target);
        });
      },
      { threshold: 0.15 }
    );

    let fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              autoAlpha: 1,
              y: 0,
              delay: 0.3,
              duration: 2,
              ease: "power3.out",
            });
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-split]").forEach((target) => {
      gsap.set(target, { autoAlpha: 0 });
      splitObserver.observe(target);
    });

    document.querySelectorAll("[data-fade-in]").forEach((target) => {
      gsap.set(target, { autoAlpha: 0, y: 40 });
      fadeObserver.observe(target);
    });
  }

  // Navigation Bar Pinning on Scroll
  function initNavPinning() {
    let navElements = document.querySelectorAll("[data-nav]");
    if (navElements.length === 0) return;

    let whiteNavs = [...navElements].filter(
      (nav) => nav.getAttribute("data-wf--c-nav--variant") === "is-white"
    );
    let otherNavs = [...navElements].filter(
      (nav) => nav.getAttribute("data-wf--c-nav--variant") !== "is-white"
    );

    if (whiteNavs.length > 0) {
      ScrollTrigger.create({
        start: 50,
        onEnter: () =>
          whiteNavs.forEach((nav) => nav.classList.add("is-pinned")),
        onLeaveBack: () =>
          whiteNavs.forEach((nav) => nav.classList.remove("is-pinned")),
      });
    }

    if (otherNavs.length > 0) {
      let pinOtherNavs = () =>
        otherNavs.forEach((nav) => nav.classList.add("is-pinned"));
      let unpinOtherNavs = () =>
        otherNavs.forEach((nav) => nav.classList.remove("is-pinned"));

      ScrollTrigger.create({
        start: () => {
          let scrollHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          let threshold =
            window.innerWidth <= 768
              ? window.innerHeight * 0.15
              : window.innerHeight * 0.75;
          return scrollHeight >= threshold
            ? threshold
            : Math.min(50, scrollHeight);
        },
        onEnter: pinOtherNavs,
        onLeaveBack: unpinOtherNavs,
      });
    }
  }

  // Inject Custom Styles for Navbar Hover Effects
  function injectNavbarHoverStyles() {
    let styleTag = document.createElement("style");
    styleTag.textContent = `
    /* Exclude elements that have the .button class or wrap a .button */
    .navbar_list-item:not(.button):not(:has(.button)) {
      position: relative;
    }

    .navbar_list-item:not(.button):not(:has(.button))::after {
      content: '';
      position: absolute;
      bottom: 0; /* Set directly underneath the text */
      left: 0;
      width: 100%;
      height: 1px;
      background-color: #fff;
      transform: scaleX(0);
      transform-origin: right center;
      transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
      pointer-events: none;
    }

    @media (hover: hover) {
      .navbar_list-item:not(.button):not(:has(.button)):hover::after {
        transform: scaleX(1);
        transform-origin: left center;
      }
    }
  `;
    document.head.appendChild(styleTag);
  }

  // Expand Height and Color Observers
  function initExpandAndColorObservers() {
    let expandObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.height = "100%";
            expandObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document
      .querySelectorAll("[data-expand]")
      .forEach((target) => expandObserver.observe(target));

    let colorObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.color = "#3FCFD5";
            colorObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document
      .querySelectorAll("[data-color]")
      .forEach((target) => colorObserver.observe(target));
  }

  // Pin and Fade Right Element Observers
  function initPinAndFadeRightObservers() {
    let pinObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          let target = entry.target;
          let fadeRightTarget = target.parentElement
            ? target.parentElement.querySelector("[data-fade-right]")
            : null;
          let timeline = gsap.timeline();

          timeline.to(target, {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
          });
          if (fadeRightTarget) {
            timeline.to(fadeRightTarget, {
              autoAlpha: 1,
              x: 0,
              duration: 1.2,
              ease: "power3.out",
            });
          }
          pinObserver.unobserve(target);
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-pin]").forEach((target) => {
      gsap.set(target, { autoAlpha: 0, y: -40 });
      let fadeRightTarget = target.parentElement
        ? target.parentElement.querySelector("[data-fade-right]")
        : null;
      if (fadeRightTarget) {
        gsap.set(fadeRightTarget, { autoAlpha: 0, x: 40 });
      }
      pinObserver.observe(target);
    });
  }

  // Complex Header Timeline with ScrollTrigger and SVG Drawing
  function initHeaderTimeline() {
    let headerContainer =
      document.querySelector("[data-header]") ||
      document.querySelector(".section");
    let sliderList = document.querySelector(".header_slider-list");
    let timelineThumb = document.querySelector("[data-timeline-thumb]");
    let progressWrapper = document.querySelector(".timeline_progress-wrapper");
    let navBars = document.querySelectorAll("[data-nav]");

    let activeStepIndex = -1;
    let thumbPositions = [];

    function getOrderData(element) {
      let orderWrapper = element.closest("[data-order]");
      return (
        (orderWrapper &&
          parseInt(orderWrapper.getAttribute("data-order"), 10)) ||
        0
      );
    }

    function sortOrderDesc(a, b) {
      return getOrderData(b) - getOrderData(a);
    }

    let slideWrappers = gsap.utils
      .toArray(".header_slide-image-wrapper")
      .sort(sortOrderDesc);
    let slideImages = gsap.utils
      .toArray(".header_slide-image")
      .sort(sortOrderDesc);
    let headerContents = gsap.utils
      .toArray("[data-header-content]")
      .sort(sortOrderDesc);
    let totalSlides = slideImages.length;

    if (totalSlides === 0 || !timelineThumb || !progressWrapper) return;

    let timelineItemsInner = gsap.utils.toArray(".timeline_item-inner");
    let matchedTimelineItems = slideWrappers.map((wrapper) => {
      let orderWrapper = wrapper.closest("[data-order]");
      let slideId =
        (orderWrapper && orderWrapper.getAttribute("data-slide")) || "";
      return timelineItemsInner.find((item) => item.id === slideId);
    });

    gsap.utils.toArray("[data-order]").forEach((element) => {
      let zIndexValue = parseInt(element.getAttribute("data-order"), 10) || 0;
      element.style.setProperty("z-index", String(zIndexValue), "important");
    });

    let splitHeaders = headerContents.map((content) => {
      let heading = content.querySelector("h1, h2, h3");
      return heading
        ? new SplitText(heading, { type: "lines", linesClass: "split-line" })
        : { lines: [] };
    });

    let headerParagraphs = headerContents.map((content) => {
      return (
        content.querySelector(".max-width-medium") || content.querySelector("p")
      );
    });

    function resetHeaderStates() {
      slideWrappers.forEach((wrapper, index) => {
        if (index === 0) {
          gsap.set(wrapper, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(slideImages[index], { xPercent: 0, scale: 1 });
        } else {
          gsap.set(wrapper, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(slideImages[index], { xPercent: 20, scale: 1.15 });
        }
      });

      headerContents.forEach((content, index) => {
        if (index === 0) {
          gsap.set(content, { autoAlpha: 1, x: 0, y: 0 });
          gsap.set(splitHeaders[0].lines, {
            autoAlpha: 1,
            filter: "blur(0px)",
            y: 0,
          });
          if (headerParagraphs[0]) {
            gsap.set(headerParagraphs[0], { x: 0, y: 0, autoAlpha: 1 });
          }
        } else {
          gsap.set(content, { autoAlpha: 0 });
          gsap.set(splitHeaders[index].lines, {
            autoAlpha: 0,
            filter: "blur(6px)",
            y: 0,
          });
          if (headerParagraphs[index]) {
            gsap.set(headerParagraphs[index], { x: 30, y: 0, autoAlpha: 0 });
          }
        }
      });
    }

    resetHeaderStates();

    matchedTimelineItems.forEach((item) => {
      let embedIcon = item.querySelector(".w-embed");
      let iconSize = window.matchMedia("(max-width: 767px)").matches
        ? "3rem"
        : 88;

      gsap.set(embedIcon, {
        position: "relative",
        width: iconSize,
        height: iconSize,
      });
      gsap.set(embedIcon.querySelectorAll("svg"), {
        position: "absolute",
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
      });

      gsap.set(item.querySelector("[data-icon='step-inactive']"), {
        autoAlpha: 1,
      });

      let activeIcon = item.querySelector("[data-icon='step-active']");
      gsap.set(activeIcon, { autoAlpha: 0, scale: 0.7 });

      let svgPaths = activeIcon.querySelectorAll("path");
      svgPaths.forEach((path) => {
        let length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          stroke: "white",
          strokeWidth: 1.5,
          fill: "transparent",
          attr: { fill: "transparent" },
        });
      });
    });

    function calculateThumbPositions() {
      let wrapperRect = progressWrapper.getBoundingClientRect();
      thumbPositions = matchedTimelineItems.map((item) => {
        let itemRect = item.getBoundingClientRect();
        return itemRect.left + itemRect.width / 2 - wrapperRect.left;
      });
      gsap.set(timelineThumb, {
        width: thumbPositions[Math.max(0, activeStepIndex)],
      });
    }

    calculateThumbPositions();

    function setActiveStep(newIndex) {
      if (newIndex !== activeStepIndex) {
        if (activeStepIndex >= 0) {
          let prevItem = matchedTimelineItems[activeStepIndex];
          prevItem.classList.remove("is-active");

          let prevActiveIcon = prevItem.querySelector(
            "[data-icon='step-active']"
          );
          let prevInactiveIcon = prevItem.querySelector(
            "[data-icon='step-inactive']"
          );
          let prevPaths = prevActiveIcon.querySelectorAll("path");

          gsap.killTweensOf(prevActiveIcon);
          gsap.killTweensOf(prevInactiveIcon);
          gsap.killTweensOf(prevPaths);

          gsap.to(prevPaths, {
            fill: "transparent",
            duration: 0.15,
            ease: "power2.in",
          });
          gsap.to(prevPaths, {
            strokeDashoffset: function (index, path) {
              return path.getTotalLength();
            },
            stagger: 0.04,
            duration: 0.25,
            ease: "power2.in",
            delay: 0.08,
          });
          gsap.to(prevActiveIcon, {
            autoAlpha: 0,
            scale: 0.7,
            duration: 0.3,
            delay: 0.15,
            ease: "power2.in",
          });
          gsap.to(prevInactiveIcon, {
            autoAlpha: 1,
            duration: 0.3,
            delay: 0.2,
            ease: "power2.out",
          });
        }

        let newItem = matchedTimelineItems[newIndex];
        newItem.classList.add("is-active");

        let newActiveIcon = newItem.querySelector("[data-icon='step-active']");
        let newInactiveIcon = newItem.querySelector(
          "[data-icon='step-inactive']"
        );
        let newPaths = newActiveIcon.querySelectorAll("path");

        gsap.killTweensOf(newActiveIcon);
        gsap.killTweensOf(newInactiveIcon);
        gsap.killTweensOf(newPaths);

        gsap.to(newInactiveIcon, {
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
        });
        gsap.to(newActiveIcon, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.15,
          delay: 0.1,
          ease: "power2.out",
        });
        gsap.to(newPaths, {
          strokeDashoffset: 0,
          stagger: 0.06,
          duration: 0.4,
          ease: "power2.out",
          delay: 0.15,
        });
        gsap.to(newPaths, {
          fill: "white",
          duration: 0.25,
          ease: "power2.out",
          delay: 0.45,
        });

        activeStepIndex = newIndex;
      }
    }

    setActiveStep(0);

    let scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: headerContainer,
        start: "top top",
        end: () => "+=" + (totalSlides - 1) * window.innerHeight,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: function (progress) {
            return Math.round(progress * (totalSlides - 1)) / (totalSlides - 1);
          },
          duration: { min: 0.2, max: 0.4 },
          delay: 0.35,
          ease: "power2.inOut",
        },
        onRefresh: calculateThumbPositions,
        onUpdate: function (self) {
          let progressVal = self.progress * (totalSlides - 1);
          let currentIndex = Math.floor(progressVal);
          let nextIndex = Math.min(currentIndex + 1, totalSlides - 1);
          let fractionalProgress = progressVal - currentIndex;
          let transitionProgress = Math.min(fractionalProgress / 0.8, 1);

          gsap.set(timelineThumb, {
            width:
              thumbPositions[currentIndex] +
              (thumbPositions[nextIndex] - thumbPositions[currentIndex]) *
                transitionProgress,
          });
          setActiveStep(fractionalProgress >= 0.8 ? nextIndex : currentIndex);

          if (self.progress >= 0.75) {
            navBars.forEach((nav) => nav.classList.add("is-pinned"));
          } else {
            navBars.forEach((nav) => nav.classList.remove("is-pinned"));
          }
        },
      },
    });

    for (let i = 0; i < totalSlides - 1; i++) {
      scrollTimeline
        .to(
          splitHeaders[i].lines,
          {
            autoAlpha: 0,
            filter: "blur(6px)",
            y: -10,
            stagger: 0.012,
            ease: "power2.in",
            duration: 0.28,
          },
          i
        )
        .to(
          headerParagraphs[i],
          { x: -30, autoAlpha: 0, ease: "power2.in", duration: 0.2 },
          i + 0.05
        )
        .set(headerContents[i], { autoAlpha: 0 }, i + 0.3)
        .fromTo(
          slideWrappers[i],
          { clipPath: "inset(0% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 100% 0% 0%)",
            ease: "power2.inOut",
            duration: 0.7,
          },
          i + 0.1
        )
        .fromTo(
          slideImages[i],
          { xPercent: 0 },
          { xPercent: -30, ease: "power2.inOut", duration: 0.7 },
          i + 0.1
        )
        .fromTo(
          slideImages[i + 1],
          { xPercent: 20, scale: 1.15 },
          { xPercent: 0, scale: 1, ease: "power2.inOut", duration: 0.7 },
          i + 0.1
        )
        .set(headerContents[i + 1], { autoAlpha: 1 }, i + 0.5)
        .fromTo(
          splitHeaders[i + 1].lines,
          { autoAlpha: 0, filter: "blur(6px)", y: 10 },
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            y: 0,
            stagger: 0.03,
            ease: "power3.out",
            duration: 0.45,
          },
          i + 0.55
        )
        .fromTo(
          headerParagraphs[i + 1],
          { x: 30, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, ease: "power2.out", duration: 0.35 },
          i + 0.65
        );
    }

    let headerScrollTrigger = scrollTimeline.scrollTrigger;

    matchedTimelineItems.forEach(function (item, index) {
      item.addEventListener("click", function (event) {
        event.preventDefault();
        let targetScrollY =
          headerScrollTrigger.start +
          (index / (totalSlides - 1)) *
            (headerScrollTrigger.end - headerScrollTrigger.start);
        let scrollObj = { y: window.scrollY };

        gsap.to(scrollObj, {
          y: targetScrollY,
          duration: 0.9,
          ease: "power2.inOut",
          onUpdate: function () {
            window.scrollTo(0, scrollObj.y);
          },
        });
      });
    });

    let timelineOuterWrapper = document.querySelector(
      ".timeline_outer-wrapper"
    );
    if (timelineOuterWrapper) {
      gsap.to(timelineOuterWrapper, {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: headerContainer,
          start: "bottom bottom",
          end: "bottom center",
          scrub: true,
        },
      });
    }

    function triggerRefresh() {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          resetHeaderStates();
          ScrollTrigger.refresh();
        });
      });
    }

    if (document.readyState === "complete") {
      triggerRefresh();
    } else {
      window.addEventListener("load", triggerRefresh);
    }
  }

  // Tabs Component Logic (Responsive for Mobile and Desktop)
  function initTabs() {
    let tabsComponent = document.querySelector(".tabs_component");
    if (!tabsComponent) return;

    if (window.matchMedia("(max-width: 991px)").matches) {
      // Mobile Tabs Logic (Accordion Style)
      let mobileCollapseTab = function (index) {
        let tabItem = tabColumns[index];
        let contentBox = tabItem.querySelector(".tabs_content-box");
        let activeIcon = tabItem.querySelector("[data-active='active']");
        let inactiveIcon = tabItem.querySelector("[data-active='inactive']");

        gsap.to(contentBox, {
          autoAlpha: 0,
          duration: 0.25,
          ease: "power2.in",
        });
        gsap.to(contentBox, {
          height: 0,
          duration: 0.35,
          ease: "power2.inOut",
          delay: 0.1,
        });
        gsap.to(activeIcon, {
          autoAlpha: 0,
          scale: 0.7,
          duration: 0.25,
          ease: "power2.in",
        });
        gsap.to(inactiveIcon, {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      let mobileExpandTab = function (index) {
        let tabItem = tabColumns[index];
        let contentBox = tabItem.querySelector(".tabs_content-box");
        let activeIcon = tabItem.querySelector("[data-active='active']");
        let inactiveIcon = tabItem.querySelector("[data-active='inactive']");

        gsap.to(contentBox, {
          height: tabHeights[index],
          duration: 0.35,
          ease: "power2.inOut",
        });
        gsap.to(contentBox, {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
          delay: 0.15,
        });
        gsap.to(activeIcon, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.6)",
        });
        gsap.to(inactiveIcon, {
          autoAlpha: 0,
          duration: 0.25,
          ease: "power2.in",
        });
      };

      let switchMobileImage = function (oldIndex, newIndex) {
        if (tabImages[oldIndex])
          gsap.to(tabImages[oldIndex], {
            autoAlpha: 0,
            duration: 0.4,
            ease: "power2.inOut",
          });
        if (tabImages[newIndex])
          gsap.to(tabImages[newIndex], {
            autoAlpha: 1,
            duration: 0.4,
            ease: "power2.inOut",
          });
      };

      let tabColumns = gsap.utils.toArray(".tabs_column-item", tabsComponent);
      let tabImages = gsap.utils.toArray(
        ".image-full.is-absolute",
        tabsComponent.querySelector(".tabs_column:not(.has-content)")
      );

      tabColumns.forEach(function (tab) {
        let iconEmbed = tab.querySelector(".icon-1x1-small.w-embed");
        if (iconEmbed) {
          gsap.set(iconEmbed, { position: "relative", width: 12, height: 12 });
          gsap.set(iconEmbed.querySelectorAll("svg"), {
            position: "absolute",
            top: "50%",
            left: "50%",
            xPercent: -50,
            yPercent: -50,
          });
        }
      });

      let tabHeights = tabColumns.map(function (tab) {
        return tab.querySelector(".tabs_content-box").offsetHeight;
      });

      tabImages.forEach(function (image, index) {
        gsap.set(image, { autoAlpha: index === 0 ? 1 : 0 });
      });

      tabColumns.forEach(function (tab, index) {
        let contentBox = tab.querySelector(".tabs_content-box");
        let activeIcon = tab.querySelector("[data-active='active']");
        let inactiveIcon = tab.querySelector("[data-active='inactive']");

        gsap.set(contentBox, {
          overflow: "hidden",
          autoAlpha: index === 0 ? 1 : 0,
          height: index === 0 ? tabHeights[index] : 0,
        });
        gsap.set(activeIcon, {
          autoAlpha: index === 0 ? 1 : 0,
          scale: index === 0 ? 1 : 0.7,
        });
        gsap.set(inactiveIcon, { autoAlpha: index === 0 ? 0 : 1 });
      });

      let currentMobileTab = 0;
      tabColumns.forEach(function (tab, index) {
        tab.style.cursor = "pointer";
        tab.addEventListener("click", function (event) {
          event.preventDefault();
          if (currentMobileTab !== index) {
            if (currentMobileTab !== -1) mobileCollapseTab(currentMobileTab);
            switchMobileImage(currentMobileTab, index);
            mobileExpandTab(index);
            currentMobileTab = index;
          }
        });
      });
      return;
    }

    // Desktop Tabs Logic (Scroll-driven)
    let tabsSection = tabsComponent.closest(".section");
    let tabColumnsDesktop = gsap.utils.toArray(
      ".tabs_column-item",
      tabsComponent
    );
    let tabImagesDesktop = gsap.utils.toArray(
      ".image-full.is-absolute",
      tabsComponent.querySelector(".tabs_column:not(.has-content)")
    );
    let totalTabs = tabColumnsDesktop.length;

    tabColumnsDesktop.forEach(function (tab) {
      let iconEmbed = tab.querySelector(".icon-1x1-small.w-embed");
      if (iconEmbed) {
        gsap.set(iconEmbed, { position: "relative", width: 12, height: 12 });
        gsap.set(iconEmbed.querySelectorAll("svg"), {
          position: "absolute",
          top: "50%",
          left: "50%",
          xPercent: -50,
          yPercent: -50,
        });
      }
    });

    let tabHeightsDesktop = tabColumnsDesktop.map(function (tab) {
      return tab.querySelector(".tabs_content-box").offsetHeight;
    });

    tabImagesDesktop.forEach(function (image, index) {
      gsap.set(image, { autoAlpha: index === 0 ? 1 : 0 });
    });

    tabColumnsDesktop.forEach(function (tab, index) {
      let contentBox = tab.querySelector(".tabs_content-box");
      let activeIcon = tab.querySelector("[data-active='active']");
      let inactiveIcon = tab.querySelector("[data-active='inactive']");

      gsap.set(contentBox, {
        overflow: "hidden",
        autoAlpha: index === 0 ? 1 : 0,
        height: index === 0 ? tabHeightsDesktop[index] : 0,
      });
      gsap.set(activeIcon, {
        autoAlpha: index === 0 ? 1 : 0,
        scale: index === 0 ? 1 : 0.7,
      });
      gsap.set(inactiveIcon, { autoAlpha: index === 0 ? 0 : 1 });
    });

    let isSnapping = false;
    let tabsTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: tabsSection,
        start: "top top",
        end: function () {
          return "+=" + (totalTabs - 1) * window.innerHeight;
        },
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: function (progress) {
            return isSnapping
              ? progress
              : gsap.utils.snap(1 / (totalTabs - 1), progress);
          },
          duration: { min: 0.2, max: 0.4 },
          delay: 0.35,
          ease: "power2.inOut",
        },
      },
    });

    for (let i = 0; i < totalTabs - 1; i++) {
      let currentActiveIcon = tabColumnsDesktop[i].querySelector(
        "[data-active='active']"
      );
      let currentInactiveIcon = tabColumnsDesktop[i].querySelector(
        "[data-active='inactive']"
      );
      let currentContent =
        tabColumnsDesktop[i].querySelector(".tabs_content-box");

      let nextActiveIcon = tabColumnsDesktop[i + 1].querySelector(
        "[data-active='active']"
      );
      let nextInactiveIcon = tabColumnsDesktop[i + 1].querySelector(
        "[data-active='inactive']"
      );
      let nextContent =
        tabColumnsDesktop[i + 1].querySelector(".tabs_content-box");

      tabsTimeline
        .fromTo(
          tabImagesDesktop[i],
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" },
          i
        )
        .fromTo(
          tabImagesDesktop[i + 1],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, ease: "power2.inOut" },
          i
        )
        .fromTo(
          currentActiveIcon,
          { autoAlpha: 1, scale: 1 },
          { autoAlpha: 0, scale: 0.7, duration: 0.25, ease: "power2.in" },
          i
        )
        .fromTo(
          currentInactiveIcon,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
          i
        )
        .fromTo(
          nextInactiveIcon,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.25, ease: "power2.in" },
          i
        )
        .fromTo(
          nextActiveIcon,
          { autoAlpha: 0, scale: 0.7 },
          { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
          i
        )
        .fromTo(
          currentContent,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
          i
        )
        .fromTo(
          currentContent,
          { height: tabHeightsDesktop[i] },
          { height: 0, duration: 0.001 },
          i + 0.3
        )
        .fromTo(
          nextContent,
          { height: 0 },
          { height: tabHeightsDesktop[i + 1], duration: 0.001 },
          i + 0.35
        )
        .fromTo(
          nextContent,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: "power2.out" },
          i + 0.4
        );
    }

    let tabsScrollTrigger = tabsTimeline.scrollTrigger;
    tabColumnsDesktop.forEach(function (tab, index) {
      tab.style.cursor = "pointer";
      tab.addEventListener("click", function (event) {
        event.preventDefault();
        let scrollDivisor = totalTabs > 1 ? totalTabs - 1 : 1;
        let targetScrollY =
          tabsScrollTrigger.start +
          (index / scrollDivisor) *
            (tabsScrollTrigger.end - tabsScrollTrigger.start);
        let scrollObj = { y: window.scrollY };

        isSnapping = true;
        gsap.to(scrollObj, {
          y: targetScrollY,
          duration: 0.9,
          ease: "power2.inOut",
          onUpdate: function () {
            window.scrollTo(0, scrollObj.y);
          },
          onComplete: function () {
            window.scrollTo(0, targetScrollY);
            isSnapping = false;
          },
        });
      });
    });
  }

  // FAQ Accordion Logic
  function initFaq() {
    let faqWrapper = document.querySelector("#faq-wrapper");
    if (!faqWrapper) return;

    let faqItems = gsap.utils.toArray(".tabs_column-item", faqWrapper);
    if (!faqItems.length) return;

    let faqHeights = faqItems.map(function (item) {
      return item.querySelector(".tabs_content-box").offsetHeight;
    });

    faqItems.forEach(function (item) {
      let iconEmbed = item.querySelector(".icon-1x1-small.w-embed");
      if (iconEmbed) {
        gsap.set(iconEmbed, { position: "relative", width: 12, height: 12 });
        gsap.set(iconEmbed.querySelectorAll("svg"), {
          position: "absolute",
          top: "50%",
          left: "50%",
          xPercent: -50,
          yPercent: -50,
        });
      }
    });

    faqItems.forEach(function (item) {
      let contentBox = item.querySelector(".tabs_content-box");
      let activeIcon = item.querySelector("[data-active='active']");
      let inactiveIcon = item.querySelector("[data-active='inactive']");

      gsap.set(contentBox, { overflow: "hidden", autoAlpha: 0, height: 0 });
      gsap.set(activeIcon, { autoAlpha: 0, scale: 0.7 });
      gsap.set(inactiveIcon, { autoAlpha: 1 });
    });

    let currentOpenFaqIndex = -1;

    function collapseFaq(index) {
      let item = faqItems[index];
      let contentBox = item.querySelector(".tabs_content-box");
      let activeIcon = item.querySelector("[data-active='active']");
      let inactiveIcon = item.querySelector("[data-active='inactive']");

      gsap.to(contentBox, { autoAlpha: 0, duration: 0.25, ease: "power2.in" });
      gsap.to(contentBox, {
        height: 0,
        duration: 0.35,
        ease: "power2.inOut",
        delay: 0.1,
      });
      gsap.to(activeIcon, {
        autoAlpha: 0,
        scale: 0.7,
        duration: 0.25,
        ease: "power2.in",
      });
      gsap.to(inactiveIcon, {
        autoAlpha: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    function expandFaq(index) {
      let item = faqItems[index];
      let contentBox = item.querySelector(".tabs_content-box");
      let activeIcon = item.querySelector("[data-active='active']");
      let inactiveIcon = item.querySelector("[data-active='inactive']");

      gsap.to(contentBox, {
        height: faqHeights[index],
        duration: 0.35,
        ease: "power2.inOut",
      });
      gsap.to(contentBox, {
        autoAlpha: 1,
        duration: 0.3,
        ease: "power2.out",
        delay: 0.15,
      });
      gsap.to(activeIcon, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.45,
        ease: "back.out(1.6)",
      });
      gsap.to(inactiveIcon, {
        autoAlpha: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }

    faqItems.forEach(function (item, index) {
      item.style.cursor = "pointer";
      item.addEventListener("click", function (event) {
        event.preventDefault();
        if (currentOpenFaqIndex === index) {
          collapseFaq(index);
          currentOpenFaqIndex = -1;
        } else {
          if (currentOpenFaqIndex !== -1) {
            collapseFaq(currentOpenFaqIndex);
          }
          expandFaq(index);
          currentOpenFaqIndex = index;
        }
      });
    });
  }

  // Infinite Logo Marquee Ticker
  function initLogoMarquee() {
    let logoWrapper = document.querySelector("[data-logos-wrapper]");
    if (!logoWrapper) return;

    logoWrapper.style.position = "relative";
    logoWrapper.style.overflow = "hidden";

    let originalLogos = Array.from(logoWrapper.children);
    originalLogos.forEach((logo) => {
      logo.style.opacity = "0";
      logo.style.pointerEvents = "none";
      logo.style.visibility = "hidden";
    });

    let tickerContainer = document.createElement("div");
    tickerContainer.style.position = "absolute";
    tickerContainer.style.top = "0";
    tickerContainer.style.left = "0";
    tickerContainer.style.width = "100%";

    let wrapperStyles = window.getComputedStyle(logoWrapper);
    let isFlex = wrapperStyles.display === "flex";
    let isGrid = wrapperStyles.display === "grid";

    tickerContainer.style.display =
      wrapperStyles.display !== "inline" ? wrapperStyles.display : "block";
    if (isFlex) {
      tickerContainer.style.flexDirection = wrapperStyles.flexDirection;
      tickerContainer.style.alignItems = wrapperStyles.alignItems;
      tickerContainer.style.justifyContent = wrapperStyles.justifyContent;
    }
    if (isGrid) {
      tickerContainer.style.gridTemplateColumns =
        wrapperStyles.gridTemplateColumns;
      tickerContainer.style.gridAutoFlow = wrapperStyles.gridAutoFlow;
      tickerContainer.style.alignItems = wrapperStyles.alignItems;
      tickerContainer.style.justifyItems = wrapperStyles.justifyItems;
    }
    tickerContainer.style.gap = wrapperStyles.gap;
    tickerContainer.style.willChange = "transform";

    let firstCloneBatch = originalLogos.map((logo) => logo.cloneNode(true));
    firstCloneBatch.forEach((logoClone) => {
      logoClone.style.opacity = "1";
      logoClone.style.pointerEvents = "auto";
      logoClone.style.visibility = "visible";
      tickerContainer.appendChild(logoClone);
    });

    let secondCloneBatch = originalLogos.map((logo) => logo.cloneNode(true));
    secondCloneBatch.forEach((logoClone) => {
      logoClone.style.opacity = "1";
      logoClone.style.pointerEvents = "auto";
      logoClone.style.visibility = "visible";
      tickerContainer.appendChild(logoClone);
    });

    logoWrapper.appendChild(tickerContainer);

    let tickerTween;
    function startTicker() {
      if (tickerTween) tickerTween.kill();

      let firstElement = firstCloneBatch[0];
      let offsetElement = secondCloneBatch[0];
      if (!firstElement || !offsetElement) return;

      let distance = offsetElement.offsetTop - firstElement.offsetTop;
      if (distance > 0) {
        gsap.set(tickerContainer, { y: 0 });
        tickerTween = gsap.to(tickerContainer, {
          y: -distance,
          repeat: -1,
          duration: distance / 60,
          ease: "none",
        });
      }
    }

    gsap.ticker.lagSmoothing(0);
    window.addEventListener("load", startTicker);

    let resizeTimer;
    let cachedWidth = logoWrapper.offsetWidth;
    window.addEventListener("resize", () => {
      let currentWidth = logoWrapper.offsetWidth;
      if (currentWidth !== cachedWidth) {
        cachedWidth = currentWidth;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(startTicker, 150);
      }
    });
    setTimeout(startTicker, 50);
  }

  // Interactive Map and SVG Path Drawing
  function initMapAnimations() {
    let mapSection = document.getElementById("map-section");
    if (!mapSection) return;

    let mapWrapper = mapSection.querySelector("[data-map-wrapper]");
    if (mapWrapper) gsap.set(mapWrapper, { x: "+=0", y: "+=0" });

    let mapSvg = document.getElementById("map");
    if (mapSvg) {
      let svgShapes = mapSvg.querySelectorAll(
        "path, line, polyline, polygon, rect, circle, ellipse"
      );
      svgShapes.forEach((shape) => {
        let length = 5000;
        if (typeof shape.getTotalLength == "function") {
          length = shape.getTotalLength();
        }
        length += 2;
        gsap.set(shape, { strokeDasharray: length, strokeDashoffset: length });
      });

      gsap.to(svgShapes, {
        strokeDashoffset: 0,
        duration: 3,
        ease: "power2.inOut",
        scrollTrigger: { trigger: mapSvg, start: "top 75%" },
      });
    }

    let mapItems = Array.from(document.querySelectorAll(".map_item"));
    if (mapItems.length > 0) {
      mapItems.sort((a, b) => {
        let orderA = parseInt(a.getAttribute("data-order") || 9999, 10);
        let orderB = parseInt(b.getAttribute("data-order") || 9999, 10);
        return orderA - orderB;
      });

      gsap.fromTo(
        mapItems,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          stagger: 0.4,
          scrollTrigger: { trigger: mapSection, start: "top 60%" },
        }
      );
    }
  }

  // Initialize Swiper Sliders
  function initSwiperSliders() {
    let swiperContainers = document.querySelectorAll("[data-swiper]");
    if (swiperContainers.length) {
      swiperContainers.forEach((container) => {
        let gap = container.hasAttribute("data-gap")
          ? Number(container.getAttribute("data-gap"))
          : 16;
        new Swiper(container, {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: gap,
          pagination: {
            el: container.querySelector(".swiper-pagination"),
            clickable: true,
          },
          navigation: {
            prevEl: container.querySelector(".swiper-button-prev"),
            nextEl: container.querySelector(".swiper-button-next"),
          },
          autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
          breakpoints: {
            768: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: gap },
          },
        });
      });
    }
  }

  // Modal Open/Close Logic
  function initModals() {
    let modalWrapper = document.querySelector("[data-modal]");
    if (!modalWrapper) return;

    let openTriggers = document.querySelectorAll("[data-open-modal]");
    let closeTriggers = modalWrapper.querySelectorAll("[data-close-modal]");

    function openModal() {
      modalWrapper.classList.add("is-active");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modalWrapper.classList.remove("is-active");
      document.body.style.overflow = "";
    }

    openTriggers.forEach((trigger) => {
      trigger.addEventListener("click", openModal);
    });

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener("click", closeModal);
    });

    modalWrapper.addEventListener("click", (event) => {
      if (!event.target.closest(".modal_inner-wrapper")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        modalWrapper.classList.contains("is-active")
      ) {
        closeModal();
      }
    });
  }

  // Background Color Transition Settings
  const colorLight = "#ffffff";
  const colorDark = "#12132b";
  const colorMappings = [
    ["rgb(5, 0, 56)", "rgb(255, 255, 255)"],
    ["rgba(5, 0, 56, 0.5)", "rgba(255, 255, 255, 0.5)"],
    ["rgba(5, 0, 56, 0.3)", "rgba(225, 223, 241, 0.3)"],
  ];
  const colorTweenConfig = {
    duration: 0.6,
    ease: "power3.inOut",
    overwrite: "auto",
  };

  // Background Color Alternation on Scroll
  function initBackgroundColorAlternation() {
    let sections = gsap.utils.toArray(".section");
    if (!sections.length) return;

    let alternateSections = sections.filter((section) =>
      section.classList.contains("background-color-alternate")
    );
    if (!alternateSections.length) return;

    let colorDictionary = new Map();
    colorMappings.forEach(([darkColor, lightColor]) => {
      colorDictionary.set(darkColor, lightColor);
      colorDictionary.set(lightColor, darkColor);
    });

    let elementsToColorTransition = [];
    sections.forEach((section) => {
      let isAlternate = alternateSections.includes(section);
      section.querySelectorAll("*").forEach((child) => {
        if (child.hasAttribute("data-color")) return;
        let computedColor = getComputedStyle(child).color;
        if (colorDictionary.has(computedColor)) {
          elementsToColorTransition.push({
            el: child,
            lightColor: isAlternate
              ? colorDictionary.get(computedColor)
              : computedColor,
            darkColor: isAlternate
              ? computedColor
              : colorDictionary.get(computedColor),
          });
        }
      });
    });

    let darkRgb = { r: 18, g: 19, b: 43 };
    let lightRgb = { r: 255, g: 255, b: 255 };
    let currentRgb = { r: darkRgb.r, g: darkRgb.g, b: darkRgb.b };
    let rgbaRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g;

    let layoutBackgrounds = gsap.utils
      .toArray(".section_layout")
      .map((layout) => {
        let bgImage = getComputedStyle(layout).backgroundImage;
        return { el: layout, template: bgImage };
      });

    function applyBackgroundColor() {
      let r = Math.round(currentRgb.r);
      let g = Math.round(currentRgb.g);
      let b = Math.round(currentRgb.b);
      layoutBackgrounds.forEach(({ el: layoutEl, template: bgTemplate }) => {
        layoutEl.style.backgroundImage = bgTemplate.replace(
          rgbaRegex,
          (match) =>
            match.replace(/\d+\s*,\s*\d+\s*,\s*\d+/, `${r}, ${g}, ${b}`)
        );
      });
    }

    function switchToDarkMode() {
      gsap.to(document.body, {
        backgroundColor: colorDark,
        ...colorTweenConfig,
      });
      alternateSections.forEach((section) =>
        gsap.to(section, { backgroundColor: colorDark, ...colorTweenConfig })
      );
      elementsToColorTransition.forEach(
        ({ el: element, darkColor: targetColor }) =>
          gsap.to(element, { color: targetColor, ...colorTweenConfig })
      );
      gsap.to(currentRgb, {
        ...darkRgb,
        ...colorTweenConfig,
        onUpdate: applyBackgroundColor,
      });
    }

    function switchToLightMode() {
      gsap.to(document.body, {
        backgroundColor: colorLight,
        ...colorTweenConfig,
      });
      alternateSections.forEach((section) =>
        gsap.to(section, { backgroundColor: colorLight, ...colorTweenConfig })
      );
      elementsToColorTransition.forEach(
        ({ el: element, lightColor: targetColor }) =>
          gsap.to(element, { color: targetColor, ...colorTweenConfig })
      );
      gsap.to(currentRgb, {
        ...lightRgb,
        ...colorTweenConfig,
        onUpdate: applyBackgroundColor,
      });
    }

    let activeTheme = null;
    function checkScrollTheme() {
      let halfHeight = window.innerHeight / 2;
      let activeSection = null;

      sections.forEach((section) => {
        let rect = section.getBoundingClientRect();
        if (rect.top <= halfHeight && rect.bottom >= halfHeight) {
          activeSection = section;
        }
      });

      if (!activeSection) return;

      let targetTheme = alternateSections.includes(activeSection)
        ? "dark"
        : "light";
      if (targetTheme !== activeTheme) {
        activeTheme = targetTheme;
        if (targetTheme === "dark") {
          switchToDarkMode();
        } else {
          switchToLightMode();
        }
      }
    }

    window.addEventListener("scroll", checkScrollTheme, { passive: true });
    checkScrollTheme();
  }

  // Circular Features Rotation Animation
  function initFeatureCircleRotation() {
    let featureCircle = document.querySelector(".feat_circle");
    let featureItems = document.querySelectorAll(
      ".feat_circle .feat_content-item-wrap"
    );
    let distanceMarkers = document.querySelectorAll(".feat_distance");

    if (!featureCircle || !featureItems.length || !distanceMarkers.length)
      return;

    let radius = featureCircle.offsetWidth / 2;
    let angleIncrement = 30;
    let totalRotations = distanceMarkers.length - 1;

    gsap.set(featureCircle, { force3D: true, transformOrigin: "50% 50%" });

    featureItems.forEach((item, index) => {
      let radianAngle = angleIncrement * index * (Math.PI / 180);
      let xOffset = radius * Math.cos(radianAngle);
      let yOffset = radius * Math.sin(radianAngle);
      let itemHeight = item.offsetHeight;

      item.style.position = "absolute";
      item.style.left = `calc(50% + ${xOffset}px)`;
      item.style.top = `calc(50% + ${yOffset - itemHeight / 2}px)`;
    });

    function updateOpacities(rotationAngle) {
      featureItems.forEach((item, index) => {
        let effectiveAngle =
          ((((angleIncrement * index + rotationAngle) % 360) % 360) + 360) %
          360;
        let distanceFromCenter =
          effectiveAngle > 180 ? 360 - effectiveAngle : effectiveAngle;
        let calculatedOpacity = Math.max(0.05, 1 - distanceFromCenter / 40);

        gsap.set(item.querySelector(".feat_content-content"), {
          opacity: calculatedOpacity,
        });
      });
    }

    updateOpacities(0);

    gsap
      .timeline({
        scrollTrigger: {
          trigger: distanceMarkers[0],
          endTrigger: distanceMarkers[distanceMarkers.length - 1],
          start: "top 80%",
          end: "bottom 95%",
          scrub: 1,
          onUpdate: () => {
            let currentRotation = gsap.getProperty(featureCircle, "rotation");
            updateOpacities(currentRotation);
          },
        },
      })
      .to(
        featureCircle,
        { rotation: -(angleIncrement * totalRotations), ease: "none" },
        0
      )
      .to(
        featureItems,
        { rotation: angleIncrement * totalRotations, ease: "none" },
        0
      );
  }

  // Setup Specific Dropdown for Contact Form
  function setupContactDropdown() {
    initCustomDropdown("[data-dropdown]", "#Sujet");
  }

  // Custom Dropdown Transformation Logic
  function initCustomDropdown(dropdownSelector, selectSelector) {
    let dropdownContainer = document.querySelector(dropdownSelector);
    let originalSelect = document.querySelector(selectSelector);
    if (!dropdownContainer || !originalSelect) return;

    let parentForm = originalSelect.closest("form");
    let toggleBtn = dropdownContainer.querySelector(".w-dropdown-toggle");
    let dropdownList = dropdownContainer.querySelector(".w-dropdown-list");
    let toggleIcon = toggleBtn
      ? toggleBtn.querySelector(".w-icon-dropdown-toggle")
      : null;
    let toggleText = toggleBtn
      ? toggleBtn.querySelector("div:not([class])")
      : null;

    if (!parentForm || !toggleBtn || !dropdownList) return;

    let hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = originalSelect.name || "Sujet";
    hiddenInput.value = "";
    hiddenInput.setAttribute("data-custom-dropdown-input", "");
    parentForm.appendChild(hiddenInput);

    dropdownList.innerHTML = "";

    Array.from(originalSelect.options).forEach(function (option, index) {
      if (index === 0) return;
      let linkItem = document.createElement("a");
      linkItem.href = "#";
      linkItem.className = "dropdown_link w-dropdown-link";
      linkItem.textContent = option.textContent;
      linkItem.dataset.value = option.value;

      linkItem.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (toggleText) toggleText.textContent = option.textContent;
        hiddenInput.value = option.value;
        closeDropdown(dropdownContainer, toggleBtn, dropdownList);
      });

      dropdownList.appendChild(linkItem);
    });

    parentForm.addEventListener("submit", function (event) {
      if (hiddenInput.value) {
        dropdownContainer.classList.remove("is-error");
      } else {
        event.preventDefault();
        dropdownContainer.classList.add("is-error");
      }
    });

    if (toggleIcon) {
      toggleIcon.style.transition = "transform 0.3s ease";
      let updateIconRotation = function () {
        let isOpen =
          dropdownContainer.classList.contains("w--open") ||
          toggleBtn.classList.contains("w--open") ||
          dropdownList.classList.contains("w--open");
        toggleIcon.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
      };

      new MutationObserver(updateIconRotation).observe(dropdownContainer, {
        attributes: true,
        attributeFilter: ["class"],
      });
      new MutationObserver(updateIconRotation).observe(toggleBtn, {
        attributes: true,
        attributeFilter: ["class"],
      });
      new MutationObserver(updateIconRotation).observe(dropdownList, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    originalSelect.remove();
  }

  // Close custom dropdown explicitly
  function closeDropdown(container, toggle, list) {
    container.classList.remove("w--open");
    toggle.classList.remove("w--open");
    list.classList.remove("w--open");
    toggle.setAttribute("aria-expanded", "false");
    list.style.height = "";
  }

  // Mobile Navigation Menu Toggle Animation
  function initMobileNavMenu() {
    let navIconWrapper = document.querySelector(".nav_mobile-icon-wrapper");
    let navListWrapper = document.querySelector(".navbar_list-wrapper");
    if (!navIconWrapper || !navListWrapper) return;

    let iconTopLine = navIconWrapper.querySelector(".nav_mobile-icon-top");
    let iconBottomLine = navIconWrapper.querySelector(
      ".nav_mobile-icon-bottom"
    );
    let navItems = navListWrapper.querySelectorAll(
      ".navbar_list-item:not(.is-placeholder)"
    );
    let allNavContainers = document.querySelectorAll("[data-nav]");

    let isMenuOpen = false;
    let isAnimating = false;
    navIconWrapper.style.cursor = "pointer";
    let desktopBreakpoint = 992;

    function resetOnResize() {
      if (window.innerWidth >= desktopBreakpoint) {
        isMenuOpen = false;
        isAnimating = false;
        navIconWrapper.classList.remove("is-active");
        allNavContainers.forEach((nav) => nav.classList.remove("is-opened"));

        gsap.set(navListWrapper, { clearProps: "all" });
        gsap.set(navItems, { clearProps: "all" });
        gsap.set([iconTopLine, iconBottomLine], { clearProps: "all" });
        document.body.style.overflow = "";
      }
    }

    window.addEventListener("resize", resetOnResize);

    function closeMobileMenu() {
      if (!isMenuOpen || isAnimating) return;
      isMenuOpen = false;
      navIconWrapper.classList.remove("is-active");
      allNavContainers.forEach((nav) => nav.classList.remove("is-opened"));

      gsap.to([iconTopLine, iconBottomLine], {
        y: 0,
        rotation: 0,
        duration: 0.4,
        ease: "power3.inOut",
      });

      isAnimating = true;
      gsap.to(navItems, {
        opacity: 0,
        y: 16,
        duration: 0.25,
        stagger: 0.03,
        ease: "power2.in",
      });
      gsap.to(navListWrapper, {
        opacity: 0,
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.4,
        ease: "power3.in",
        delay: 0.1,
        onComplete: () => {
          gsap.set(navListWrapper, { display: "none" });
          document.body.style.overflow = "";
          isAnimating = false;
        },
      });
    }

    navItems.forEach((item) => {
      let link = item.querySelector("a");
      if (link) link.addEventListener("click", closeMobileMenu);
    });

    navIconWrapper.addEventListener("click", function () {
      if (!isAnimating) {
        if (isMenuOpen) {
          closeMobileMenu();
        } else {
          isMenuOpen = true;
          navIconWrapper.classList.add("is-active");
          allNavContainers.forEach((nav) => nav.classList.add("is-opened"));

          let topRect = iconTopLine.getBoundingClientRect();
          let bottomRect = iconBottomLine.getBoundingClientRect();
          let offsetDistance =
            (bottomRect.top +
              bottomRect.height / 2 -
              (topRect.top + topRect.height / 2)) /
            2;

          gsap.to(iconTopLine, {
            y: offsetDistance,
            rotation: 45,
            duration: 0.4,
            ease: "power3.inOut",
          });
          gsap.to(iconBottomLine, {
            y: -offsetDistance,
            rotation: -45,
            duration: 0.4,
            ease: "power3.inOut",
          });

          isAnimating = true;
          gsap.set(navListWrapper, {
            display: "flex",
            opacity: 0,
            clipPath: "inset(0% 0% 100% 0%)",
          });
          gsap.set(navItems, { opacity: 0, y: 24 });
          document.body.style.overflow = "hidden";

          gsap.to(navListWrapper, {
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.5,
            ease: "power3.out",
            onComplete: () => {
              isAnimating = false;
            },
          });

          gsap.to(navItems, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.15,
          });
        }
      }
    });
  }

  // Inject Mobile Box CSS
  (function () {
    let mobileBoxStyle = document.createElement("style");
    mobileBoxStyle.textContent = `
    @media (max-width: 1024px) {
      [data-mobile-box] {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        transform: translateY(12px) !important;
        transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1),
                    transform 500ms cubic-bezier(0.4, 0, 0.2, 1),
                    visibility 0s linear 500ms;
      }
      [data-mobile-box].is-visible {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transform: translateY(0px) !important;
        transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1),
                    transform 500ms cubic-bezier(0.4, 0, 0.2, 1),
                    visibility 0s linear 0s;
      }
    }
  `;
    (document.head || document.documentElement).appendChild(mobileBoxStyle);
  })();

  // Mobile Pin Interactions
  function initMobilePins() {
    if (window.innerWidth > 1024) return;

    let mobilePins = document.querySelectorAll("[data-mobile-pin]");
    if (!mobilePins.length) return;

    let defaultPin = document.querySelector("[data-mobile-pin='3']");
    let defaultBox = document.querySelector("[data-mobile-box='3']");

    if (defaultPin) defaultPin.classList.add("is-active");
    if (defaultBox) defaultBox.classList.add("is-visible");

    mobilePins.forEach((pin) => {
      pin.addEventListener("click", () => {
        let pinId = pin.dataset.mobilePin;
        let targetBox = document.querySelector(`[data-mobile-box="${pinId}"]`);
        let isActive = pin.classList.contains("is-active");

        mobilePins.forEach((p) => p.classList.remove("is-active"));
        document
          .querySelectorAll("[data-mobile-box]")
          .forEach((box) => box.classList.remove("is-visible"));

        if (!isActive) {
          pin.classList.add("is-active");
          if (targetBox) targetBox.classList.add("is-visible");
        }
      });
    });
  }

  // Initial GSAP Hide Styles
  (function () {
    let hideStyle = document.createElement("style");
    hideStyle.textContent =
      "[data-split], [data-fade-in], [data-fade-right], [data-pin] { visibility: hidden; opacity: 0; }";
    (document.head || document.documentElement).appendChild(hideStyle);
  })();

  // Main Initializer Function
  function initializeAll() {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    initFadeAndSplitObservers();
    initNavPinning();
    injectNavbarHoverStyles();
    initExpandAndColorObservers();
    initPinAndFadeRightObservers();
    initHeaderTimeline();
    initTabs();
    initFaq();
    initRevealAnimations();
    initLogoMarquee();
    initMapAnimations();
    initSwiperSliders();
    initModals();
    initBackgroundColorAlternation();
    initFeatureCircleRotation();
    initMobileNavMenu();
    initMobilePins();

    if (window.location.pathname.startsWith("/contact")) {
      setupContactDropdown();
    }
  }

  // Start executing when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAll);
  } else {
    initializeAll();
  }
})();
