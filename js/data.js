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
            const content = document.getElementById('content');

            // 假設 JSON 數據已經通過 fetch 獲取並存儲在 data 中
            for (const [sectionName, sectionData] of Object.entries(data)) {
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

                // 將 ul 添加到 section
                section.appendChild(swiper);

                // 將 section 添加到主容器
                document.getElementById('content').appendChild(section);
                // 初始化 Swiper（對所有 .mySwiper）
                document.querySelectorAll('.mySwiper').forEach(swiperContainer => {
                    new Swiper(swiperContainer, {
                        watchSlidesProgress: true,
                        slidesPerView: 3,
                        spaceBetween: 30, // 調整間距
                        breakpoints: {
                            640: {
                                slidesPerView: 1,
                                spaceBetween: 10
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 20
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30
                            }
                        }
                    });
                });
            }

            // 添加事件監聽器來處理點擊事件
            document.querySelectorAll('.openModalBtn').forEach(button => {
                button.addEventListener('click', event => {
                    const fullImageUrl = event.currentTarget.getAttribute('data-fullimage');
                    openModal(fullImageUrl);
                    $("body").addClass("no-scroll");
                });
            });


        })
        .catch(error => console.error('無法加載JSON數據:', error));

    // 打開滿版圖片彈窗的函數
    function openModal(imageUrl) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
        <div class="modal__content">
            <div class="modal__content-container">
                <span class="modal__close-btn">&times;</span>
                <img src="${imageUrl}" alt="Full Image" class="modal__image">
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
});