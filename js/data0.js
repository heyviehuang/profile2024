$(document).ready(function () {
    const lightSections = new Set(['page2', 'page5']);

    function syncNavTheme(anchorLink) {
        const $nav = $('#pp-nav');
        const $menu = $('#menu');
        const currentAnchor = typeof anchorLink === 'string'
            ? anchorLink
            : (window.location.hash || '#page1').replace('#', '');
        const isLightSection = lightSections.has(currentAnchor);
        const isClosingSection = currentAnchor === 'page5';

        $menu
            .toggleClass('theme-light', isLightSection)
            .toggleClass('theme-dark', !isLightSection);

        $('body').toggleClass('is-closing-section', isClosingSection);

        if (!$nav.length) {
            return;
        }
        $nav
            .toggleClass('theme-light', isLightSection)
            .toggleClass('theme-dark', !isLightSection);
    }

    $(window).on('hashchange', function () {
        syncNavTheme();
    });

    $('#pagepiling').pagepiling({
        menu: '#menu',
        anchors: ['page1', 'page2', 'page3', 'page4', 'page5'],
        sectionsColor: [
            '#1c1c1e', // Page 1: Home
            '#EADCC6', // Page 2: About
            '#2D3428', // Page 3: Gallery
            '#2D3428', // Page 4: Web
            '#D9A05B'  // Page 5: Contact
        ],
        navigation: {
            'position': 'right',
            'tooltips': ['Home', 'About Me', 'Gallery', 'Web', 'Contact']
        },
        afterLoad: function (anchorLink) {
            syncNavTheme(anchorLink);
        },
        afterRender: function () {
            //playing the video
            $('video').get(0).play();
            syncNavTheme();
        }
    });
});
