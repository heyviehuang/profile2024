$(document).ready(function() {

    $('.scrollTop').click(function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        var targetPos = $(target).offset().top;
        $('html,body').animate({
            scrollTop: targetPos
        }, 700);
    });


    $(".snow").let_it_snow({
        windPower: 0.01,
        speed: 0.001,
        count: 20,
        size: 3,
        image: "img/img-bgItem-snow.png"
    });
    $("canvas.flake").let_it_snow({
        windPower: 2,
        speed: 0.5,
        count: 2,
        size: 10,
        image: "img/img-bgItem-snow.png"
    });

    $(".anim-sparkle").sparkle({
        color: "#FFFFFF",
        count: 30,
        overlap: 0,
        speed: 1,
        minSize: 4,
        maxSize: 10,
        direction: "both"
    });

    $('.btnTop').click(function(event) {
        event.preventDefault();
        $('html,body').animate({
            scrollTop: 0
        }, 700);
    });

    function showBtnCondition() {
        if ($(this).scrollTop() > 1200) {
            $('.btnTop').fadeIn();
        } else {
            $('.btnTop').fadeOut();
        }
    }
    $(window).scroll(showBtnCondition);

    $(window).scroll(function() {
        var scrollPos = $(window).scrollTop();
        var windowHeight = $(window).height();
        // animated
        $('.animT,.animR,.animB,.animL,.animM').each(function() {
            var thisPos = $(this).offset().top;
            if ((windowHeight + scrollPos) >= thisPos) {
                $(this).addClass('fadeIn');
            }
        });
        $('.blurIncontainer').each(function() {
            var thisPos = $(this).offset().top;
            if ((windowHeight + scrollPos) >= thisPos) {
                $(this).find('char,.char01').css({ 'animation-name': 'blurInAnim', 'animation-duration': '1.6s', 'animation-delay': '0s', 'animation-fill-mode': 'forwards' });
                $(this).find('char,.char02').css({ 'animation-name': 'blurInAnim', 'animation-duration': '1.6s', 'animation-delay': '0.16s', 'animation-fill-mode': 'forwards' });
                $(this).find('char,.char03').css({ 'animation-name': 'blurInAnim', 'animation-duration': '1.6s', 'animation-delay': '0.32s', 'animation-fill-mode': 'forwards' });
            }
        });
    });


    $(function() {
        // 選擇所有的 .infiniteslide 元素
        $('.infiniteslide').each(function(index, element) {
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
    var swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
        },
        pagination: {
            el: ".swiper-pagination",
        },
        navigation: {
            nextEl: ".swiper-next",
        },
    });

    $("#tab1").show();
    $("#tab2").hide();

    // 按鈕切換內容
    $(".tab-btn").click(function() {
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


    window.addEventListener('scroll', function() {
        let sections = document.querySelectorAll('.dynamicBG-container');
        sections.forEach(function(section, index) {
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
            sections.forEach(function(section) {
                section.classList.remove('blur');
            });
        }
    });

    // 打開彈窗
    // $("#openModalBtn").click(function() {
    //     $("body").addClass("no-scroll");
    //     $(".overlay, .webOnWorkModal").fadeIn();
    // });

    // 關閉彈窗
    // $(".closeBtn, .overlay").click(function() {
    //     $("body").removeClass("no-scroll");
    //     $(".overlay, .webOnWorkModal").fadeOut();
    // });


    if (window.innerWidth <= 1024) {
        document.getElementById("FLine01").src = "./img/FLine2.svg";
        document.getElementById("FLine02").src = "./img/FLine2.svg";
    } else {
        document.getElementById("FLine01").src = "./img/FLine.svg";
        document.getElementById("FLine02").src = "./img/FLine.svg";
    }
});