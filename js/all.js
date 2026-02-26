$(document).ready(function () {

    $('.scrollTop').click(function (e) {
        e.preventDefault();
        var target = $(this).attr('href');
        var targetPos = $(target).offset().top;
        $('html,body').animate({
            scrollTop: targetPos
        }, 700);
    });

    // 光塵特效
    // $(".snow").let_it_snow({
    //     windPower: 0.01,
    //     speed: 0.001,
    //     count: 20,
    //     size: 3,
    //     image: "./img/img-bgItem-snow.png"
    // });
    // $("canvas.flake").let_it_snow({
    //     windPower: 2,
    //     speed: 0.5,
    //     count: 2,
    //     size: 10,
    //     image: "./img/img-bgItem-snow.png"
    // });

    // $(".anim-sparkle").sparkle({
    //     color: "#FFFFFF",
    //     count: 30,
    //     overlap: 0,
    //     speed: 1,
    //     minSize: 4,
    //     maxSize: 10,
    //     direction: "both"
    // });


    $('.btnTop').click(function (event) {
        event.preventDefault();
        $('html,body').animate({
            scrollTop: 0
        }, 700);
    });

    // 根據 body class 來設定不同的滾動觸發高度
    let triggerHeight = 1200; // 預設高度

    if ($('body').hasClass("otherVisualCreations", "webCreations")) {
        triggerHeight = 800;
    } else if ($('body').hasClass("aboutMe")) {
        triggerHeight = 300;
    }

    function showBtnCondition() {
        if ($(window).scrollTop() > triggerHeight) {
            $('.btnTop').fadeIn();
            $('#menu').fadeIn();
        } else {
            $('.btnTop').fadeOut();
            $('#menu').fadeOut();
        }
    }

    $(window).scroll(showBtnCondition);


    $(window).scroll(function () {
        var scrollPos = $(window).scrollTop();
        var windowHeight = $(window).height();
        // 淡入淡出動畫
        $('.animT,.animR,.animB,.animL,.animM').each(function () {
            var thisPos = $(this).offset().top;
            if ((windowHeight + scrollPos) >= thisPos) {
                $(this).addClass('fadeIn');
            }
        });

        // 標題文字模糊
        $('.blurIncontainer').each(function () {
            var thisPos = $(this).offset().top;
            if ((windowHeight + scrollPos) >= thisPos) {
                $(this).find('char,.char01').css({ 'animation-name': 'blurInAnim', 'animation-duration': '1.6s', 'animation-delay': '0s', 'animation-fill-mode': 'forwards' });
                $(this).find('char,.char02').css({ 'animation-name': 'blurInAnim', 'animation-duration': '1.6s', 'animation-delay': '0.16s', 'animation-fill-mode': 'forwards' });
                $(this).find('char,.char03').css({ 'animation-name': 'blurInAnim', 'animation-duration': '1.6s', 'animation-delay': '0.32s', 'animation-fill-mode': 'forwards' });
            }
        });
    });

    // infiniteslide
    $(function () {
        // 選擇所有的 .infiniteslide 元素
        $('.infiniteslide').each(function (index, element) {
            var direction = $(element).data('direction');
            var clone = $(element).data('clone');


            // 在每個元素上初始化 infiniteslide 插件
            $(element).infiniteslide({
                'speed': 100, // 速度 單位是 px/秒
                'direction': direction, // 根據 data-direction 屬性設定方向
                'pauseonhover': false, // 滑鼠懸停時暫停
                'responsive': false, // 子元素的寬度以百分比指定時
                'clone': clone // 子元素的複製次數
            });
        });
    });

    $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: 320
    });

    // 按鈕切換內容
    $("#tab1").show();
    $("#tab2").hide();

    $(".tab-btn").click(function () {
        var tabId = $(this).attr("id");

        // 使用 if 條件判斷來切換內容
        if (tabId === "btn-tab1") {
            $("#tab1").show();
            $("#tab2").hide();
        } else if (tabId === "btn-tab2") {
            $("#tab1").hide();
            $("#tab2").show();
        }

        // 切換按鈕的 active 狀態
        $(".tab-btn").removeClass("tab--active");
        $(this).addClass("tab--active");
    });


    // 視差滾動模糊
    window.addEventListener('scroll', function () {
        let sections = document.querySelectorAll('.dynamicBG-container');
        sections.forEach(function (section, index) {
            let rect = section.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                // Add blur class when the section is in view
                section.classList.add('blur');
            } else {
                // Remove blur class when the section is out of view
                section.classList.remove('blur');
            }
        });
        if (window.scrollY <= 0) {
            sections.forEach(function (section) {
                section.classList.remove('blur');
            });
        }
    });

    // 打開彈窗
    // $("#openModalBtn").click(function () {
    //     $("body").addClass("no-scroll");
    //     $(".overlay, .webOnWorkModal").fadeIn();
    // });

    // 關閉彈窗
    // $(".closeBtn, .overlay").click(function () {
    //     $("body").removeClass("no-scroll");
    //     $(".overlay, .webOnWorkModal").fadeOut();
    // });


    // if (window.innerWidth <= 1024) {
    //     document.getElementById("FLine01").src = "./img/FLine2.svg";
    //     document.getElementById("FLine02").src = "./img/FLine2.svg";
    // } else {
    //     document.getElementById("FLine01").src = "./img/FLine.svg";
    //     document.getElementById("FLine02").src = "./img/FLine.svg";
    // }


    // 主頁鼠標
    const isIndex = document.body.classList.contains("index");
    const supportsHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (isIndex && supportsHover) {
        const cursor = document.createElement("div");
        cursor.className = "cursor-orbit is-light";
        cursor.innerHTML = '<span class="cursor-orbit__dot"></span>';
        document.body.appendChild(cursor);

        const setCursorTone = (element) => {
            if (!element) {
                cursor.classList.add("is-light");
                cursor.classList.remove("is-dark");
                return;
            }

            const section = element.closest(".section");
            if (!section) {
                cursor.classList.add("is-light");
                cursor.classList.remove("is-dark");
                return;
            }

            const sectionId = section.getAttribute("id");
            if (sectionId === "section1" || sectionId === "section2") {
                cursor.classList.add("is-light");
                cursor.classList.remove("is-dark");
                return;
            }

            if (sectionId === "section3") {
                const visualContainer = section.querySelector(".otherVisualCreations__container");
                if (visualContainer) {
                    const rect = visualContainer.getBoundingClientRect();
                    const threshold = rect.top + rect.height * 0.3;
                    if (lastMouseY >= threshold) {
                        cursor.classList.add("is-light");
                        cursor.classList.remove("is-dark");
                    } else {
                        cursor.classList.add("is-dark");
                        cursor.classList.remove("is-light");
                    }
                } else {
                    cursor.classList.add("is-dark");
                    cursor.classList.remove("is-light");
                }
                return;
            }

            if (sectionId === "section4") {
                cursor.classList.add("is-dark");
                cursor.classList.remove("is-light");
                return;
            }

            cursor.classList.add("is-light");
            cursor.classList.remove("is-dark");
        };

        let lastMouseY = 0;
        window.addEventListener("mousemove", (event) => {
            cursor.classList.add("is-active");
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
            lastMouseY = event.clientY;
            setCursorTone(document.elementFromPoint(event.clientX, event.clientY));
        });

        window.addEventListener("mouseleave", () => {
            cursor.classList.remove("is-active");
        });
    }
});
