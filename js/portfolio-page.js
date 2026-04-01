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

    function createCardElement(item, sectionName, layout, modalEnabled) {
        const li = document.createElement("li");
        li.className = "swiper-slide horizontal-list__item";

        const mediaUrl = item.videoUrl || item.fullImage || "";
        const content = createCardContent(item, sectionName, layout);

        if (modalEnabled) {
            li.innerHTML =
                '<button class="openModalBtn" data-media-url="' + mediaUrl + '" data-title="' + item.title + '" data-description="' + (item.description || "") + '">' +
                content.media +
                content.overlay +
                "</button>" +
                content.meta +
                content.title;
        } else {
            li.innerHTML = content.media + content.overlay + content.meta + content.title;
        }

        return li;
    }

    function createSectionElement(sectionName, sectionData, layout, modalEnabled) {
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
            list.appendChild(createCardElement(item, sectionName, layout, modalEnabled));
        });

        swiper.appendChild(list);
        section.appendChild(swiper);

        return section;
    }

    function openModal(mediaUrl, description) {
        const modal = document.createElement("div");
        modal.className = "modal modal--device";

        const embedUrl = getYouTubeEmbedUrl(mediaUrl);
        const mediaHtml = embedUrl
            ? '<iframe class="mac-frame__media-embed" src="' + embedUrl + '" title="' + description + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
            : '<img src="' + mediaUrl + '" alt="' + description + '" class="mac-frame__media-image">';

        modal.innerHTML =
            '<div class="modal__content">' +
            '<div class="modal__content-container">' +
            '<span class="modal__close-btn">&times;</span>' +
            '<div class="mac-frame">' +
            '<div class="mac-frame__top">' +
            '<span class="mac-frame__dot mac-frame__dot--close"></span>' +
            '<span class="mac-frame__dot mac-frame__dot--min"></span>' +
            '<span class="mac-frame__dot mac-frame__dot--max"></span>' +
            "</div>" +
            '<div class="mac-frame__screen">' +
            '<div class="mac-frame__media">' + mediaHtml + "</div>" +
            "</div>" +
            "</div>" +
            '<p class="image-description">' + description + "</p>" +
            "</div>" +
            "</div>";

        function closeModal() {
            document.body.classList.remove("no-scroll");
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }

        modal.querySelector(".modal__close-btn").addEventListener("click", closeModal);
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.body.appendChild(modal);
        document.body.classList.add("no-scroll");
    }

    function bindModalEvents(container) {
        container.querySelectorAll(".openModalBtn").forEach(function (button) {
            button.addEventListener("click", function (event) {
                const target = event.currentTarget;
                const mediaUrl = target.getAttribute("data-media-url");
                const description = target.getAttribute("data-description") || target.getAttribute("data-title") || "";

                openModal(mediaUrl, description);
            });
        });
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
        const modalEnabled = container.dataset.portfolioModal !== "false";
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
                    container.appendChild(createSectionElement(sectionName, sectionData, layout, modalEnabled));
                });

                if (modalEnabled) {
                    bindModalEvents(container);
                }

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
