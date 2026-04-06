(function ($) {
    "use strict";

    const site = {
        init() {
            this.cacheDom();
            this.bindScrollTopLinks();
            this.bindBackToTop();
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
            const supportsHover = window.matchMedia &&
                window.matchMedia("(hover: hover) and (pointer: fine)").matches;

            if (!isIndex || !supportsHover) {
                return;
            }

            const cursor = document.createElement("div");
            cursor.className = "cursor-orbit is-light";
            cursor.innerHTML = '<span class="cursor-orbit__dot"></span>';
            document.body.appendChild(cursor);

            let lastMouseY = 0;

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

            window.addEventListener("mousemove", function (event) {
                cursor.classList.add("is-active");
                cursor.style.left = event.clientX + "px";
                cursor.style.top = event.clientY + "px";
                lastMouseY = event.clientY;
                setCursorTone(document.elementFromPoint(event.clientX, event.clientY));
            });

            window.addEventListener("mouseleave", function () {
                cursor.classList.remove("is-active");
            });
        }
    };

    $(function () {
        site.init();
    });
}(jQuery));
