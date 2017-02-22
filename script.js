var transformProp = null,
    getScrollTransform = null,
    $window = null,
    $document = null,
    $content = null,
    scrolled = 0, // amount window has scrolled
    currentLevel = 0, // how deep in the stack are we?
    levels = 3, // number of zoomable sections
    distance3d = 1000, // amount each section is apart from eachother
    levelGuide = {
        '#level-1': 0,
        '#level-2': 1,
        '#level-3': 2
    };

$(function() {
    transformProp = Modernizr.prefixed('transform'); // ie: WebkitTransform

    // cache some jQuery objects
    $window = $(window);
    $document = $(document);
    $content = $('#content');

    // Determines what CSS transform to use. Uses 3d if it's supported.
    getScrollTransform = Modernizr.csstransforms3d
        ? getScroll3DTransform
        : getScroll2DTransform;

    // Zoom when the window is scrolled
    if (Modernizr.csstransforms) {
        $(window).scroll(function() {
            zoom();
        });
    } else {
        // Provide a fallback for browsers that don't support transforms yet, likely through the CSS.
    }
});

function getScroll2DTransform(scroll) {
    // 2D scale is exponential
    var scale = Math.pow(3, scroll * (levels - 1));
    return 'scale(' + scale + ')';
}

function getScroll3DTransform(scroll) {
    var z = (scroll * (levels - 1) * distance3d);
    return 'translate3d( 0, 0, ' + z + 'px )';
}

// applies transform to content from position of scroll
function transformScroll(scroll) {
    var style = {};
    style[transformProp] = getScrollTransform(scroll);
    $content.css(style);
}

function zoom() {
    // normalize scroll value from 0 to 1
    /* Normally this would increase for each pixel (ie 1, 2,…,5400)
        but this turns it into a decimal (ie. 0.0016625103906899418, 0.003948462177888612,…,1)
    */
    scrolled = $window.scrollTop() / ($document.height() - $window.height());
    transformScroll(scrolled);
}
