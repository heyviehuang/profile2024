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
                processPageData(data.page2, "content");
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
            section.classList.add('section');

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
                li.innerHTML = `
                <button class="openModalBtn" data-fullimage="${item.fullImage}">
                    <img src="${item.coverImage}" alt="${item.title}">
                </button>
                <h5>${item.title}</h5>
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
                const fullImageUrl = event.currentTarget.getAttribute('data-fullimage');
                const description = event.currentTarget.nextElementSibling.textContent; // 獲取圖片說明
                openModal(fullImageUrl, description);
                $("body").addClass("no-scroll");
            });
        });
    }

    // 初始化 Swiper 的函數
    function initializeSwipers() {
        const swipers = document.querySelectorAll('.mySwiper');
        swipers.forEach(swiper => {
            new Swiper(swiper, {
                // Swiper 配置選項
                slidesPerView: 3,
                spaceBetween: 10,
            });
        });
    }
});