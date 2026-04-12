(function () {
    "use strict";

    const PAGE2_SECTION_ORDER = ["LIST21", "LIST22", "LIST23"];
    const WEB_META_SECTIONS = new Set(["LIST11", "LIST12", "LIST13"]);
    const SCRIPT_URL = document.currentScript && document.currentScript.src
        ? new URL(document.currentScript.src, window.location.href)
        : new URL("js/portfolio-page.js", window.location.href);
    const SITE_ROOT_URL = new URL("../", SCRIPT_URL);
    const DATA_URL = new URL("js/all.json", SITE_ROOT_URL).href;
    let dataPromise;
    let routeLoaderElement;

    function getPortfolioData() {
        if (!dataPromise) {
            dataPromise = fetch(DATA_URL).then(function (response) {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                return response.json();
            });
        }

        return dataPromise;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatMultilineText(value) {
        return escapeHtml(value).replace(/\n/g, "<br />");
    }

    function resolveAssetPath(path) {
        if (!path || typeof path !== "string") {
            return "";
        }

        if (/^(?:https?:)?\/\//i.test(path) || /^data:/i.test(path)) {
            return path;
        }

        return new URL(path.replace(/^\/+/, ""), SITE_ROOT_URL).href;
    }

    function createMediaMarkup(item) {
        const alt = item.alt || item.title || "Portfolio item";
        const coverImage = resolveAssetPath(item.coverImage);

        return '<img class="portfolio-card__image" src="' + escapeHtml(coverImage) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async">';
    }

    function isExternalLink(url) {
        if (!url || typeof url !== "string") {
            return false;
        }

        try {
            const parsedUrl = new URL(url, window.location.origin);
            const isHttp = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
            const isDummyImage = /dummyimage\.com$/i.test(parsedUrl.hostname);
            const isImageFile = /\.(png|jpe?g|webp|gif|svg)([?#].*)?$/i.test(parsedUrl.pathname);

            return isHttp && !isDummyImage && !isImageFile;
        } catch (error) {
            return false;
        }
    }

    function getExternalUrl(item) {
        const candidates = [
            item.link,
            item.LINK,
            item.externalUrl,
            item.linkUrl,
            item.liveUrl,
            item.websiteUrl,
            item.fullImage
        ];

        return candidates.find(isExternalLink) || "";
    }

    function ensureRouteLoader() {
        if (routeLoaderElement) {
            return routeLoaderElement;
        }

        routeLoaderElement = document.createElement("div");
        routeLoaderElement.className = "route-loader";
        routeLoaderElement.setAttribute("aria-hidden", "true");
        routeLoaderElement.innerHTML =
            '<div class="route-loader__inner">' +
            '<div class="route-loader__mark">' +
            '<img class="route-loader__logo" src="' + resolveAssetPath("img/logo.svg") + '" alt="Sally Huang logo">' +
            '<span class="route-loader__spinner"></span>' +
            "</div>" +
            '<p class="route-loader__text" aria-hidden="true">LOADING<span class="route-loader__dots"><span class="route-loader__dot">.</span><span class="route-loader__dot">.</span><span class="route-loader__dot">.</span></span></p>' +
            "</div>" +
            "</div>";

        document.body.appendChild(routeLoaderElement);
        return routeLoaderElement;
    }

    function showRouteLoader() {
        if (typeof window.showRouteLoader === "function") {
            window.showRouteLoader();
            return;
        }

        ensureRouteLoader();
        document.body.classList.add("is-link-loading");
    }

    function hideRouteLoader() {
        if (typeof window.hideRouteLoader === "function") {
            window.hideRouteLoader();
            return;
        }

        document.body.classList.remove("is-link-loading");
    }

    function openExternalUrl(url) {
        showRouteLoader();

        const newWindow = window.open(url, "_blank", "noopener,noreferrer");

        if (newWindow) {
            newWindow.opener = null;
            window.setTimeout(hideRouteLoader, 900);
            return;
        }

        hideRouteLoader();
    }

    function getOrderedEntries(pageData, orderKeys) {
        return orderKeys
            .filter(function (key) { return pageData[key]; })
            .map(function (key) { return [key, pageData[key]]; })
            .concat(Object.entries(pageData).filter(function (entry) { return !orderKeys.includes(entry[0]); }));
    }

    function appendSectionItems(listElement, sectionName, sectionData, layout) {
        sectionData.items.forEach(function (item) {
            listElement.appendChild(createCardElement(item, sectionName, sectionData, layout));
        });
    }

    function createCardContent(item, sectionName, layout) {
        const showsMeta = layout === "web" && WEB_META_SECTIONS.has(sectionName);
        const showsImageTitle = showsMeta || layout === "visual";
        const imageTitleHtml = showsImageTitle && item.title
            ? '<span class="portfolio-card__image-title">' + escapeHtml(item.title) + "</span>"
            : "";
        const descriptionHtml = item.description ? '<p class="web-item__desc">' + formatMultilineText(item.description) + "</p>" : "";
        const metaHtml = showsMeta ? '<div class="web-item__meta">' + descriptionHtml + "</div>" : "";
        const titleHtml = showsImageTitle ? "" : "<h5>" + escapeHtml(item.title) + "</h5>";

        return {
            media: createMediaMarkup(item),
            imageTitle: imageTitleHtml,
            meta: metaHtml,
            title: titleHtml
        };
    }

    function getVisualCategory(sectionName, sectionData) {
        if (!sectionName || !sectionData) {
            return "";
        }

        const title = String(sectionData["title_en-first"] || "").toLowerCase();
        if (sectionName === "LIST21" || title.includes("banner") || title.includes("campaign")) {
            return "banner";
        }
        if (sectionName === "LIST22" || title.includes("digital")) {
            return "landscape";
        }
        if (sectionName === "LIST23" || title.includes("traditional")) {
            return "portrait";
        }

        return "";
    }

    function createCardElement(item, sectionName, sectionData, layout) {
        const li = document.createElement("li");
        li.className = (layout === "visual" ? "macy-grid__item " : "swiper-slide ") + "horizontal-list__item";
        li.dataset.section = sectionName;

        const category = getVisualCategory(sectionName, sectionData);
        if (category) {
            li.dataset.category = category;
        }

        const externalUrl = getExternalUrl(item);
        const content = createCardContent(item, sectionName, layout);

        if (externalUrl) {
            li.innerHTML =
                '<button class="openModalBtn portfolio-card__trigger" type="button" data-external-url="' + escapeHtml(externalUrl) + '" aria-label="Open external link for ' + escapeHtml(item.title || "portfolio item") + '">' +
                content.media +
                content.imageTitle +
                "</button>" +
                content.meta +
                content.title;
        } else {
            li.innerHTML =
                '<div class="openModalBtn">' +
                content.media +
                content.imageTitle +
                "</div>" +
                content.meta +
                content.title;
        }

        return li;
    }

    function createSectionElement(sectionName, sectionData, layout) {
        const section = document.createElement("div");
        section.className = "section section--" + sectionName;

        section.innerHTML =
            '<h3 class="animT blurIncontainer">' +
            '<span class="char char02 section-title section-title--zh">' + escapeHtml(sectionData["title_en-first"]) + "</span><br />" +
            '<span class="char char03 section-title section-title--en">' + escapeHtml(sectionData["title_en-rest"]) + "</span><br />" +
            '<p class="char char01 section-title section-title--desc">' + formatMultilineText(sectionData.title_zh) + "</p>" +
            "</h3>";

        if (layout === "visual") {
            const grid = document.createElement("ul");
            grid.className = "macy-grid";
            grid.id = "macy-" + sectionName.toLowerCase();

            appendSectionItems(grid, sectionName, sectionData, layout);
            section.appendChild(grid);
            return section;
        }

        const swiper = document.createElement("div");
        swiper.className = "swiper mySwiper";

        const list = document.createElement("ul");
        list.className = "swiper-wrapper horizontal-list";

        appendSectionItems(list, sectionName, sectionData, layout);
        swiper.appendChild(list);
        section.appendChild(swiper);

        return section;
    }

    function createUnifiedGrid(pageData, layout, pageKey) {
        if (layout !== "visual") {
            return null;
        }

        const grid = document.createElement("ul");
        grid.className = "macy-grid macy-grid--unified";
        grid.id = "macy-unified";

        const entries = pageKey === "page2"
            ? getOrderedEntries(pageData, PAGE2_SECTION_ORDER)
            : Object.entries(pageData);

        entries.forEach(function (entry) {
            const sectionName = entry[0];
            const sectionData = entry[1];
            appendSectionItems(grid, sectionName, sectionData, layout);
        });

        return grid;
    }

    function appendOrderedVisualSections(container, pageData, orderKeys) {
        const entries = getOrderedEntries(pageData, orderKeys);

        entries.forEach(function (entry) {
            const sectionName = entry[0];
            const sectionData = entry[1];
            container.appendChild(createSectionElement(sectionName, sectionData, "visual"));
        });
    }

    function initSwipers(container) {
        if (typeof Swiper === "undefined") {
            return;
        }

        function getStartOffset() {
            return 0;
        }

        function getEndOffset() {
            return window.matchMedia("(max-width: 768px)").matches ? 40 : 96;
        }

        function bindImageUpdates(swiperInstance, swiperElement) {
            const images = swiperElement.querySelectorAll("img");

            images.forEach(function (image) {
                if (image.complete) {
                    return;
                }

                image.addEventListener("load", function () {
                    swiperInstance.update();
                }, { once: true });

                image.addEventListener("error", function () {
                    swiperInstance.update();
                }, { once: true });
            });
        }

        container.querySelectorAll(".mySwiper").forEach(function (swiperElement) {
            const swiperInstance = new Swiper(swiperElement, {
                slidesPerView: "auto",
                slidesPerGroup: 1,
                spaceBetween: 10,
                slidesOffsetBefore: getStartOffset(),
                slidesOffsetAfter: getEndOffset(),
                watchOverflow: true,
                observer: true,
                observeParents: true,
                on: {
                    resize: function () {
                        this.params.slidesOffsetBefore = getStartOffset();
                        this.params.slidesOffsetAfter = getEndOffset();
                        this.update();
                    }
                }
            });

            bindImageUpdates(swiperInstance, swiperElement);
        });
    }

    function initMacyLayouts(container) {
        if (typeof Masonry === "undefined") {
            return;
        }

        container.querySelectorAll(".macy-grid").forEach(function (grid) {
            const masonryInstance = new Masonry(grid, {
                itemSelector: ".macy-grid__item",
                percentPosition: true,
                horizontalOrder: true,
                gutter: 20
            });

            const refreshLayout = function () {
                masonryInstance.reloadItems();
                masonryInstance.layout();
            };

            window.requestAnimationFrame(refreshLayout);
            window.setTimeout(refreshLayout, 120);
            window.setTimeout(refreshLayout, 320);

            grid.querySelectorAll("img").forEach(function (image) {
                if (image.complete) {
                    refreshLayout();
                    return;
                }

                image.addEventListener("load", refreshLayout, { once: true });
                image.addEventListener("error", refreshLayout, { once: true });
            });

            window.addEventListener("load", refreshLayout, { once: true });
            window.addEventListener("resize", refreshLayout);
        });
    }

    function initExternalLinks(container) {
        container.addEventListener("click", function (event) {
            const trigger = event.target.closest(".portfolio-card__trigger");

            if (!trigger) {
                return;
            }

            const externalUrl = trigger.dataset.externalUrl;
            if (!externalUrl) {
                return;
            }

            event.preventDefault();
            openExternalUrl(externalUrl);
        });

        container.addEventListener("keydown", function (event) {
            const trigger = event.target.closest(".portfolio-card__trigger");

            if (!trigger || (event.key !== "Enter" && event.key !== " ")) {
                return;
            }

            const externalUrl = trigger.dataset.externalUrl;
            if (!externalUrl) {
                return;
            }

            event.preventDefault();
            openExternalUrl(externalUrl);
        });
    }

    function revealInitialSectionHeading(container) {
        const firstHeading = container.querySelector(".section .animT");
        if (firstHeading) {
            firstHeading.classList.add("fadeIn");
        }

        const firstBlurHeading = container.querySelector(".section .blurIncontainer");
        if (!firstBlurHeading) {
            return;
        }

        firstBlurHeading.querySelectorAll(".char01").forEach(function (element) {
            element.style.animationName = "blurInAnim";
            element.style.animationDuration = "1.6s";
            element.style.animationDelay = "0s";
            element.style.animationFillMode = "forwards";
        });

        firstBlurHeading.querySelectorAll(".char02").forEach(function (element) {
            element.style.animationName = "blurInAnim";
            element.style.animationDuration = "1.6s";
            element.style.animationDelay = "0.16s";
            element.style.animationFillMode = "forwards";
        });

        firstBlurHeading.querySelectorAll(".char03").forEach(function (element) {
            element.style.animationName = "blurInAnim";
            element.style.animationDuration = "1.6s";
            element.style.animationDelay = "0.32s";
            element.style.animationFillMode = "forwards";
        });
    }

    function initPortfolioPage(container) {
        const pageKey = container.dataset.portfolioPage;
        const layout = container.dataset.portfolioLayout || "default";
        const unifiedGrid = container.dataset.portfolioUnified === "true";
        if (!pageKey) {
            return;
        }

        getPortfolioData()
            .then(function (data) {
                const pageData = data[pageKey];
                if (!pageData) {
                    throw new Error("Missing portfolio data for " + pageKey);
                }

                if (unifiedGrid && pageKey === "page2") {
                    appendOrderedVisualSections(container, pageData, PAGE2_SECTION_ORDER);
                } else if (unifiedGrid) {
                    const grid = createUnifiedGrid(pageData, layout, pageKey);
                    if (grid) {
                        container.appendChild(grid);
                    }
                } else {
                    Object.entries(pageData).forEach(function (entry) {
                        const sectionName = entry[0];
                        const sectionData = entry[1];
                        container.appendChild(createSectionElement(sectionName, sectionData, layout));
                    });
                }

                if (layout === "visual") {
                    initMacyLayouts(container);
                } else {
                    initSwipers(container);
                }
                initExternalLinks(container);
                revealInitialSectionHeading(container);
                document.dispatchEvent(new CustomEvent("portfolio:content-ready", {
                    detail: {
                        containerId: container.id || "",
                        pageKey: pageKey,
                        layout: layout
                    }
                }));
            })
            .catch(function (error) {
                console.error("Portfolio data load failed:", error);
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("#content[data-portfolio-page]").forEach(initPortfolioPage);
    });
}());
