(function () {
    "use strict";

    const DATA_URL = "/js/all.json";
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

    function createMediaMarkup(item) {
        const alt = item.alt || item.title || "Portfolio item";

        return '<img class="portfolio-card__image" src="' + escapeHtml(item.coverImage) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async">';
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
            '<img class="route-loader__logo" src="/img/logo.svg" alt="Sally Huang logo">' +
            '<span class="route-loader__spinner"></span>' +
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

    function createCardContent(item, sectionName, layout) {
        const showsMeta = layout === "web" && (sectionName === "LIST11" || sectionName === "LIST12" || sectionName === "LIST13");
        const showsImageTitle = showsMeta || layout === "visual";
        const imageTitleHtml = showsImageTitle && item.title
            ? '<span class="portfolio-card__image-title">' + escapeHtml(item.title) + "</span>"
            : "";
        const descriptionHtml = item.description ? '<p class="web-item__desc">' + escapeHtml(item.description) + "</p>" : "";
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
        if (sectionName === "LIST21" || sectionName === "LIST24" || title.includes("banner") || title.includes("campaign")) {
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

        if (layout === "visual") {
            const enTitle = [sectionData["title_en-first"], sectionData["title_en-rest"]]
                .filter(Boolean)
                .join(" ");

            section.innerHTML =
                '<h3 class="animT blurIncontainer">' +
                '<span class="char char02">' + escapeHtml(sectionData.title_zh) + "</span><br />" +
                '<span class="char char03">' + escapeHtml(enTitle) + "</span>" +
                "</h3>";
        } else {
            section.innerHTML =
                '<h3 class="animT blurIncontainer">' +
                '<span class="char char02">' + escapeHtml(sectionData["title_en-first"]) + "</span><br />" +
                '<span class="char char03">' + escapeHtml(sectionData["title_en-rest"]) + "</span><br />" +
                '<span style="font-size: 1rem;" class="char char01">' + escapeHtml(sectionData.title_zh) + "</span>" +
                "</h3>";
        }

        if (layout === "visual") {
            const grid = document.createElement("ul");
            grid.className = "macy-grid";
            grid.id = "macy-" + sectionName.toLowerCase();

            sectionData.items.forEach(function (item) {
                grid.appendChild(createCardElement(item, sectionName, sectionData, layout));
            });

            section.appendChild(grid);
            return section;
        }

        const swiper = document.createElement("div");
        swiper.className = "swiper mySwiper";

        const list = document.createElement("ul");
        list.className = "swiper-wrapper horizontal-list";

        sectionData.items.forEach(function (item) {
            list.appendChild(createCardElement(item, sectionName, sectionData, layout));
        });

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

        let entries = Object.entries(pageData);
        if (pageKey === "page2") {
            const desiredOrder = ["LIST21", "LIST22", "LIST23"];
            entries = desiredOrder
                .filter(function (key) { return pageData[key]; })
                .map(function (key) { return [key, pageData[key]]; })
                .concat(entries.filter(function (entry) { return !desiredOrder.includes(entry[0]); }));
        }

        entries.forEach(function (entry) {
            const sectionName = entry[0];
            const sectionData = entry[1];

            sectionData.items.forEach(function (item) {
                grid.appendChild(createCardElement(item, sectionName, sectionData, layout));
            });
        });

        return grid;
    }

    function appendOrderedVisualSections(container, pageData, orderKeys) {
        const entries = orderKeys
            .filter(function (key) { return pageData[key]; })
            .map(function (key) { return [key, pageData[key]]; })
            .concat(Object.entries(pageData).filter(function (entry) { return !orderKeys.includes(entry[0]); }));

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
        if (typeof Macy === "undefined") {
            return;
        }

        container.querySelectorAll(".macy-grid").forEach(function (grid) {
            const macyInstance = Macy({
                container: "#" + grid.id,
                trueOrder: false,
                waitForImages: true,
                margin: {
                    x: 20,
                    y: 24
                },
                columns: 5,
                breakAt: {
                    1500: 4,
                    1200: 3,
                    820: 2,
                    520: 1
                }
            });

            const refreshLayout = function () {
                macyInstance.recalculate(true);
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
                    appendOrderedVisualSections(container, pageData, ["LIST21", "LIST22", "LIST23"]);
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
                    if (!unifiedGrid) {
                        initMacyLayouts(container);
                    }
                } else {
                    initSwipers(container);
                }
                initExternalLinks(container);
                revealInitialSectionHeading(container);
            })
            .catch(function (error) {
                console.error("Portfolio data load failed:", error);
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("#content[data-portfolio-page]").forEach(initPortfolioPage);
    });
}());
