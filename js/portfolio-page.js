(function () {
    "use strict";

    const DATA_URL = "/js/all.json";
    let dataPromise;

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

    function getYouTubeId(url) {
        if (!url) {
            return "";
        }

        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
        if (shortMatch) {
            return shortMatch[1];
        }

        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
        if (watchMatch) {
            return watchMatch[1];
        }

        const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
        if (embedMatch) {
            return embedMatch[1];
        }

        return "";
    }

    function getYouTubeEmbedUrl(url) {
        const id = getYouTubeId(url);
        if (!id) {
            return "";
        }

        return "https://www.youtube.com/embed/" + id + "?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&fs=1";
    }

    function createMediaMarkup(item) {
        return '<img src="' + item.coverImage + '" alt="' + item.title + '">';
    }

    function getExternalUrl(item) {
        return item.externalUrl || item.liveUrl || item.websiteUrl || "";
    }

    function createCardContent(item, sectionName, layout) {
        const isFeatured = layout === "web" && sectionName === "LIST11";
        const showsMeta = layout === "web" && (sectionName === "LIST12" || sectionName === "LIST13");
        const descriptionHtml = item.description ? '<p class="web-item__desc">' + item.description + "</p>" : "";
        const overlayHtml = isFeatured
            ? '<div class="web-item__overlay"><h5 class="web-item__title">' + item.title + "</h5>" + descriptionHtml + "</div>"
            : "";
        const metaHtml = showsMeta
            ? '<div class="web-item__meta"><h5 class="web-item__title">' + item.title + "</h5>" + descriptionHtml + "</div>"
            : "";
        const titleHtml = isFeatured || showsMeta ? "" : "<h5>" + item.title + "</h5>";

        return {
            media: createMediaMarkup(item),
            overlay: overlayHtml,
            meta: metaHtml,
            title: titleHtml
        };
    }

    function createCardElement(item, sectionName, layout) {
        const li = document.createElement("li");
        li.className = "swiper-slide horizontal-list__item";

        const externalUrl = getExternalUrl(item);
        const content = createCardContent(item, sectionName, layout);

        if (externalUrl) {
            li.innerHTML =
                '<a class="openModalBtn" href="' + externalUrl + '" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">' +
                content.media +
                content.overlay +
                "</a>" +
                content.meta +
                content.title;
        } else {
            li.innerHTML =
                '<div class="openModalBtn">' +
                content.media +
                content.overlay +
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
            '<span class="char char02">' + sectionData["title_en-first"] + "</span>" +
            '<span class="char char03">' + sectionData["title_en-rest"] + "</span><br />" +
            '<span style="font-size: 1rem;" class="char char01">' + sectionData.title_zh + "</span>" +
            "</h3>";

        const swiper = document.createElement("div");
        swiper.className = "swiper mySwiper";

        const list = document.createElement("ul");
        list.className = "swiper-wrapper horizontal-list";

        sectionData.items.forEach(function (item) {
            list.appendChild(createCardElement(item, sectionName, layout));
        });

        swiper.appendChild(list);
        section.appendChild(swiper);

        return section;
    }

    function initSwipers(container) {
        if (typeof Swiper === "undefined") {
            return;
        }

        function getEdgeOffset() {
            return window.matchMedia("(max-width: 768px)").matches ? 24 : 50;
        }

        container.querySelectorAll(".mySwiper").forEach(function (swiperElement) {
            new Swiper(swiperElement, {
                slidesPerView: "auto",
                slidesPerGroup: 1,
                spaceBetween: 10,
                slidesOffsetBefore: getEdgeOffset(),
                slidesOffsetAfter: getEdgeOffset(),
                watchOverflow: true,
                observer: true,
                observeParents: true,
                on: {
                    resize: function () {
                        const edgeOffset = getEdgeOffset();
                        this.params.slidesOffsetBefore = edgeOffset;
                        this.params.slidesOffsetAfter = edgeOffset;
                        this.update();
                    }
                }
            });
        });
    }

    function initPortfolioPage(container) {
        const pageKey = container.dataset.portfolioPage;
        const layout = container.dataset.portfolioLayout || "default";
        if (!pageKey) {
            return;
        }

        getPortfolioData()
            .then(function (data) {
                const pageData = data[pageKey];
                if (!pageData) {
                    throw new Error("Missing portfolio data for " + pageKey);
                }

                Object.entries(pageData).forEach(function (entry) {
                    const sectionName = entry[0];
                    const sectionData = entry[1];
                    container.appendChild(createSectionElement(sectionName, sectionData, layout));
                });

                initSwipers(container);
            })
            .catch(function (error) {
                console.error("Portfolio data load failed:", error);
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("#content[data-portfolio-page]").forEach(initPortfolioPage);
    });
}());
