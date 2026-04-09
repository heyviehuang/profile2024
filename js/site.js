(function ($) {
    "use strict";

    const SCRIPT_URL = document.currentScript && document.currentScript.src
        ? new URL(document.currentScript.src, window.location.href)
        : new URL("js/site.js", window.location.href);
    const SITE_ROOT_URL = new URL("../", SCRIPT_URL);

    function resolveAssetPath(path) {
        if (!path || typeof path !== "string") {
            return "";
        }

        if (/^(?:https?:)?\/\//i.test(path) || /^data:/i.test(path)) {
            return path;
        }

        return new URL(path.replace(/^\/+/, ""), SITE_ROOT_URL).href;
    }

    const site = {
        init() {
            this.cacheDom();
            this.initRouteLoader();
            this.bindScrollTopLinks();
            this.bindBackToTop();
            this.bindPageTransitions();
            this.initScrollEffects();
            this.initInfiniteSlide();
            this.initMasonry();
            this.initTabs();
            this.initDynamicBackgroundBlur();
            this.initIndexCursor();
        },

        cacheDom() {
            this.$window = $(window);
            this.$body = $("body");
            this.$menu = $("#menu");
            this.$backToTop = $(".btnTop");
        },

        initRouteLoader() {
            if ($(".route-loader").length) {
                return;
            }

            const loaderHtml = [
                '<div class="route-loader" aria-hidden="true">',
                '<div class="route-loader__inner">',
                '<div class="route-loader__mark">',
                '<img class="route-loader__logo" src="' + resolveAssetPath("img/logo.svg") + '" alt="Sally Huang logo">',
                '<span class="route-loader__spinner"></span>',
                "</div>",
                '<p class="route-loader__text" aria-hidden="true">LOADING<span class="route-loader__dots"><span class="route-loader__dot">.</span><span class="route-loader__dot">.</span><span class="route-loader__dot">.</span></span></p>',
                "</div>",
                "</div>"
            ].join("");

            this.$body.append(loaderHtml);

            if (this.shouldShowInitialLoader()) {
                this.$body.addClass("is-link-loading is-initial-loading");
            }
        },

        shouldShowInitialLoader() {
            const navigationEntries = performance.getEntriesByType &&
                performance.getEntriesByType("navigation");
            const navigationType = navigationEntries && navigationEntries[0] ? navigationEntries[0].type : "";

            return this.$body.hasClass("index") && navigationType === "reload";
        },

        showRouteLoader() {
            this.$body.addClass("is-link-loading");
        },

        hideRouteLoader() {
            this.$body.removeClass("is-link-loading");
        },

        isPageTransitionTarget(url) {
            if (!url || typeof url !== "string") {
                return false;
            }

            if (
                url.indexOf("mailto:") === 0 ||
                url.indexOf("tel:") === 0 ||
                url.indexOf("javascript:") === 0
            ) {
                return false;
            }

            const targetUrl = new URL(url, window.location.href);

            if (targetUrl.origin !== window.location.origin) {
                return false;
            }

            const isSamePageHashOnly =
                targetUrl.pathname === window.location.pathname &&
                targetUrl.search === window.location.search &&
                targetUrl.hash;

            return !isSamePageHashOnly;
        },

        bindPageTransitions() {
            const self = this;

            const startPageTransition = function (url) {
                self.showRouteLoader();
                window.requestAnimationFrame(function () {
                    window.requestAnimationFrame(function () {
                        window.setTimeout(function () {
                            window.location.href = url;
                        }, 220);
                    });
                });
            };

            window.showRouteLoader = function () {
                self.showRouteLoader();
            };

            window.hideRouteLoader = function () {
                self.hideRouteLoader();
            };

            $(document).on("click", 'a[href]', function (event) {
                if (
                    event.isDefaultPrevented() ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.which === 2
                ) {
                    return;
                }

                const href = $(this).attr("href");
                const target = $(this).attr("target");

                if (target === "_blank" || !self.isPageTransitionTarget(href)) {
                    return;
                }

                event.preventDefault();
                startPageTransition(href);
            });

            window.navigateWithLoader = function (url) {
                if (!self.isPageTransitionTarget(url)) {
                    window.location.href = url;
                    return;
                }

                startPageTransition(url);
            };

            $(window).on("pageshow", function () {
                if (self.$body.hasClass("is-initial-loading")) {
                    return;
                }

                self.hideRouteLoader();
            });

            $(window).on("load", function () {
                if (!self.$body.hasClass("is-initial-loading")) {
                    return;
                }

                window.setTimeout(function () {
                    self.$body.removeClass("is-initial-loading");
                    self.hideRouteLoader();
                }, 420);
            });
        },

        bindScrollTopLinks() {
            $(".scrollTop").on("click", function (event) {
                event.preventDefault();

                const targetSelector = $(this).attr("href");
                const $target = $(targetSelector);

                if (!$target.length) {
                    return;
                }

                $("html,body").animate({
                    scrollTop: $target.offset().top
                }, 700);
            });
        },

        bindBackToTop() {
            this.$backToTop.on("click", function (event) {
                event.preventDefault();

                $("html,body").animate({
                    scrollTop: 0
                }, 700);
            });
        },

        getButtonTriggerHeight() {
            if (this.$body.hasClass("aboutMe")) {
                return 300;
            }

            if (this.$body.hasClass("otherVisualCreations") || this.$body.hasClass("webCreations")) {
                return 800;
            }

            return 1200;
        },

        initScrollEffects() {
            const triggerHeight = this.getButtonTriggerHeight();

            const updateScrollState = () => {
                const scrollTop = this.$window.scrollTop();
                const scrollBottom = scrollTop + this.$window.height();

                if (scrollTop > triggerHeight) {
                    this.$backToTop.fadeIn();
                } else {
                    this.$backToTop.fadeOut();
                }

                $(".animT,.animR,.animB,.animL,.animM").each(function () {
                    const $element = $(this);
                    if (scrollBottom >= $element.offset().top) {
                        $element.addClass("fadeIn");
                    }
                });

                $(".blurIncontainer").each(function () {
                    const $element = $(this);
                    if (scrollBottom < $element.offset().top) {
                        return;
                    }

                    $element.find("char,.char01").css({
                        "animation-name": "blurInAnim",
                        "animation-duration": "1.6s",
                        "animation-delay": "0s",
                        "animation-fill-mode": "forwards"
                    });
                    $element.find("char,.char02").css({
                        "animation-name": "blurInAnim",
                        "animation-duration": "1.6s",
                        "animation-delay": "0.16s",
                        "animation-fill-mode": "forwards"
                    });
                    $element.find("char,.char03").css({
                        "animation-name": "blurInAnim",
                        "animation-duration": "1.6s",
                        "animation-delay": "0.32s",
                        "animation-fill-mode": "forwards"
                    });
                });
            };

            this.$window.on("scroll", updateScrollState);
            this.$menu.show();
            updateScrollState();
        },

        initInfiniteSlide() {
            if (!$.fn.infiniteslide) {
                return;
            }

            $(".infiniteslide").each(function () {
                const $element = $(this);
                $element.infiniteslide({
                    speed: 100,
                    direction: $element.data("direction"),
                    pauseonhover: false,
                    responsive: false,
                    clone: $element.data("clone")
                });
            });
        },

        initMasonry() {
            if (!$.fn.masonry || !$(".grid").length) {
                return;
            }

            $(".grid").masonry({
                itemSelector: ".grid-item",
                columnWidth: 320
            });
        },

        initTabs() {
            if (!$("#tab1, #tab2").length || !$(".tab-btn").length) {
                return;
            }

            $("#tab1").show();
            $("#tab2").hide();

            $(".tab-btn").on("click", function () {
                const tabId = $(this).attr("id");

                if (tabId === "btn-tab1") {
                    $("#tab1").show();
                    $("#tab2").hide();
                } else if (tabId === "btn-tab2") {
                    $("#tab1").hide();
                    $("#tab2").show();
                }

                $(".tab-btn").removeClass("tab--active");
                $(this).addClass("tab--active");
            });
        },

        initDynamicBackgroundBlur() {
            const sections = document.querySelectorAll(".dynamicBG-container");
            if (!sections.length) {
                return;
            }

            const updateBlurState = () => {
                sections.forEach(function (section) {
                    const rect = section.getBoundingClientRect();
                    const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
                    section.classList.toggle("blur", inView);
                });

                if (window.scrollY <= 0) {
                    sections.forEach(function (section) {
                        section.classList.remove("blur");
                    });
                }
            };

            window.addEventListener("scroll", updateBlurState, { passive: true });
            updateBlurState();
        },

        initIndexCursor() {
            const isIndex = document.body.classList.contains("index");
            const isCoarsePointer = window.matchMedia &&
                window.matchMedia("(pointer: coarse)").matches;

            if (!isIndex || isCoarsePointer) {
                return;
            }

            const cursor = document.createElement("div");
            cursor.className = "cursor-orbit is-light";
            cursor.innerHTML = '<span class="cursor-orbit__dot"></span>';
            document.body.appendChild(cursor);
            document.body.classList.add("cursor-ready");

            const setLight = () => {
                cursor.classList.add("is-light");
                cursor.classList.remove("is-dark");
            };

            const setDark = () => {
                cursor.classList.add("is-dark");
                cursor.classList.remove("is-light");
            };

            const setCursorTone = (element) => {
                if (!element) {
                    setLight();
                    return;
                }

                const section = element.closest(".section");
                if (!section) {
                    setLight();
                    return;
                }

                const sectionId = section.getAttribute("id");
                if (sectionId === "section2" || sectionId === "section5") {
                    setDark();
                    return;
                }

                setLight();
            };

            const updateCursorPosition = function (event) {
                cursor.classList.add("is-active");
                cursor.style.left = event.clientX + "px";
                cursor.style.top = event.clientY + "px";
                setCursorTone(document.elementFromPoint(event.clientX, event.clientY));
            };

            window.addEventListener("pointermove", updateCursorPosition, { passive: true });
            window.addEventListener("mousemove", updateCursorPosition, { passive: true });

            window.addEventListener("mouseleave", function () {
                cursor.classList.remove("is-active");
            });
        }
    };

    $(function () {
        site.init();
    });
}(jQuery));
