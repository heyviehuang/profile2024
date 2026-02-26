$(document).ready(function () {
    const jsonUrl = '/js/all.json';

    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // 處理 page1 的數據
            if (document.getElementById("content")) {
                processPageData(data.page1, "content");
            }

            // 初始化 Swiper
            initializeSwipers();
        })
        .catch(error => console.error('無法加載JSON數據:', error));

    function processPageData(pageData, containerId) {
        const content = document.getElementById(containerId);

        if (!content) {
            console.error(`無法找到容器: ${containerId}`);
            return;
        }

        // 假設 JSON 數據已經通過 fetch 獲取並存儲在 pageData 中
        for (const [sectionName, sectionData] of Object.entries(pageData)) {
            const section = document.createElement('div');
            section.classList.add('section', `section--${sectionName}`);

            // 動態生成每個 LIST 的標題
            section.innerHTML = `
            <h3 class="animT blurIncontainer">
                <span class="char char02">${sectionData["title_en-first"]}</span><span class="char char03">${sectionData["title_en-rest"]}</span><br />
                <span style="font-size: 1rem;" class="char char01">${sectionData["title_zh"]}</span>
            </h3>`;

            // 創建 ul 容器
            const ul = document.createElement('ul');
            ul.classList.add('swiper-wrapper', 'horizontal-list');

            // 遍歷該 LIST 中的 items
            sectionData.items.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('swiper-slide', 'horizontal-list__item');

                // 動態生成每個 item 的結構
                const videoUrl = item.videoUrl || item.fullImage || "";
                const isFeatured = sectionName === "LIST11";
                const isList12 = sectionName === "LIST12";
                const isList13 = sectionName === "LIST13";
                                const descriptionHtml = item.description ? `<p class="web-item__desc">${item.description}</p>` : '';
                const overlay = isFeatured
                    ? `
                    <div class="web-item__overlay">
                        <h5 class="web-item__title">${item.title}</h5>
                        ${descriptionHtml}
                    </div>
                    `
                    : '';
                const metaHtml = (isList12 || isList13)
                    ? `
                    <div class="web-item__meta">
                        <h5 class="web-item__title">${item.title}</h5>
                        ${descriptionHtml}
                    </div>
                    `
                    : '';
                const titleHtml = isFeatured || isList12 || isList13 ? '' : `<h5>${item.title}</h5>`;
                const dualMedia = false;
                const mediaHtml = dualMedia
                    ? `
                    <div class="web-item__split">
                        <div class="web-item__device web-item__device--pc">
                            <img class="web-item__media" src="${item.coverImage}" alt="${item.title} PC">
                        </div>
                        <div class="web-item__device web-item__device--mb">
                            <img class="web-item__media" src="${item.coverImage2}" alt="${item.title} Mobile">
                        </div>
                    </div>
                    `
                    : `<img src="${item.coverImage}" alt="${item.title}">`;
                li.innerHTML = `
                <button class="openModalBtn" data-video="${videoUrl}" data-title="${item.title}" data-description="${item.description || ""}">
                    ${mediaHtml}
                    ${overlay}
                </button>
                ${metaHtml}
                ${titleHtml}
                `;

                // 將 li 添加到 ul
                ul.appendChild(li);
            });

            const swiper = document.createElement('div');
            swiper.classList.add('swiper', 'mySwiper');
            swiper.appendChild(ul);

            // 將 swiper 添加到 section
            section.appendChild(swiper);

            // 將 section 添加到主容器
            content.appendChild(section);
        }

        // 添加事件監聽器來處理點擊事件
        document.querySelectorAll('.openModalBtn').forEach(button => {
            button.addEventListener('click', event => {
                const videoUrl = event.currentTarget.getAttribute('data-video');
                const description = event.currentTarget.getAttribute('data-description') || event.currentTarget.getAttribute('data-title') || ''; // 獲取圖片說明
                openModal(videoUrl, description);
                $("body").addClass("no-scroll");
            });
        });
    }

    // 初始化 Swiper 的函數
    function initializeSwipers() {
        const swipers = document.querySelectorAll('.mySwiper');
        swipers.forEach(swiper => {
            swiper.classList.add('swiper--offset');
            new Swiper(swiper, {
                // Swiper 配置選項
                slidesPerView: 3,
                spaceBetween: 10,
                on: {
                    sliderFirstMove: function () {
                        this.el.classList.remove('swiper--offset');
                    },
                    touchStart: function () {
                        this.el.classList.remove('swiper--offset');
                    },
                    reachBeginning: function () {
                        this.el.classList.add('swiper--offset');
                    }
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        });
    }

    // 打開滿版圖片彈窗的函數
    function openModal(videoUrl, description) {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'modal--device');
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        const mediaHtml = embedUrl
            ? `<iframe class="mac-frame__media-embed" src="${embedUrl}" title="${description}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            : `<img src="${videoUrl}" alt="${description}" class="mac-frame__media-image">`;
        modal.innerHTML = `
        <div class="modal__content">
            <div class="modal__content-container">
                <span class="modal__close-btn">&times;</span>
                <div class="mac-frame">
                    <div class="mac-frame__top">
                        <span class="mac-frame__dot mac-frame__dot--close"></span>
                        <span class="mac-frame__dot mac-frame__dot--min"></span>
                        <span class="mac-frame__dot mac-frame__dot--max"></span>
                    </div>
                    <div class="mac-frame__screen">
                        <div class="mac-frame__media">
                            ${mediaHtml}
                        </div>
                    </div>
                </div>
                <p class="image-description">${description}</p> <!-- 新增文字說明 -->
            </div>
        </div>
        `;

        document.body.appendChild(modal);

        // 關閉彈窗的邏輯
        modal.querySelector('.modal__close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            $("body").removeClass("no-scroll");
        });

        // 點擊彈窗外部關閉彈窗
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                document.body.removeChild(modal);
                $("body").removeClass("no-scroll");
            }
        });
    }

    function getYouTubeEmbedUrl(url) {
        if (!url) {
            return "";
        }

        const id = getYouTubeId(url);
        if (!id) {
            return "";
        }

        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&fs=1`;
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
});
