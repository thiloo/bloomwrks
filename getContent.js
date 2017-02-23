const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: 'f5w6053ana68',
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: 'e5ef71a8009233f87ba815f7bb42afe5087583f6ec9ba87317545eec5af4fabb'
});

let overlay = false;

client.getEntries({
    'content_type': 'layer'
}).then(layer => {
    console.log(layer);
    // get image url and location on layer
    let images = layer.items.map(image => {
        let links = image.fields.images.map(info => {
            let json = {};
            json.layerId = image.fields.id;
            json.location = info.fields.layerLocation;
            json.url = info.fields.image.fields.file.url;
            json.imageId = info.sys.id;
            return json;
        });
        return links;
    });
    sortLayers(images);
});

function sortLayers(layers) {
    let sorted = layers.sort((a, b) => {
        return b[0].layerId - a[0].layerId;
    });
    renderLayers(sorted);
}

function renderLayers(layers) {
    let i = 1;
    layers.map(layer => {
        $('#content').append(`<section id="level-${i}">
            <div class="flexContainer">
                <div class="flexItem" id="fi-1-l-${i}"></div>
                <div class="flexItem" id="fi-2-l-${i}"></div>
                <div class="flexItem" id="fi-3-l-${i}"></div>
                <div class="flexItem" id="fi-4-l-${i}"></div>
                <div class="flexItem" id="fi-5-l-${i}"></div>
                <div class="flexItem" id="fi-6-l-${i}"></div>
            </div>
            </section>`);
        layer.map(image => {
            $(`#fi-${image.location}-l-${i}`).append(`<img src="http:${image.url}" class="smallImage" id="${image.imageId}" />`);
        });
        i++;
    });

    attachClick();
}

function attachClick() {
    $('img').click((e) => {
        getSpecificImage(e.target.id, e.target.src);
    });
}

function getSpecificImage(id, url) {
    let json = {};
    client.getEntry(id).then(result => {
        json.imageId = id;
        json.imageUrl = url;
        json.projectId = result.fields.project.sys.id;
        client.getEntry(result.fields.project.sys.id).then(project => {
            json.title = project.fields.title;
            json.subtitle = project.fields.subtitle;
            json.category = project.fields.category;
            json.description = project.fields.description;
            showBigImage(json);
        });
    });
}

function showBigImage(json) {
    overlay = true;
    console.log(json);
    $(`#wrap`).append(`<div id="overlay" class="flexContainer">
            <div class="overlay-flex-side"></div>
            <div class="overlay-flex-middle">
                <div class="overlay-image">
                    <img src="${json.imageUrl}" class="largeImage" />
                </div>
                <div class="overlay-text">
                    <h2>${json.title}</h2>
                    <p>${json.description}</p>
                </div>
            </div>
            <div class="overlay-flex-side">
                <div id="close-overlay">X</div>
            </div>
        </div>`);
    $(`#close-overlay`).click(() => {
        $('#overlay').remove();
        overlay = false;
    });
}

let transformProp = null,
    getScrollTransform = null,
    $window = null,
    $document = null,
    $content = null,
    scrolled = 0, // amount window has scrolled
    currentLevel = 0, // how deep in the stack are we?
    levels = 5, // number of zoomable sections
    distance3d = 1000, // amount each section is apart from eachother
    levelGuide = {
        '#level-1': 0,
        '#level-2': 1,
        '#level-3': 2,
        '#level-4': 3
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
    if(overlay) return;
    // normalize scroll value from 0 to 1
    /* Normally this would increase for each pixel (ie 1, 2,…,5400)
        but this turns it into a decimal (ie. 0.0016625103906899418, 0.003948462177888612,…,1)
    */
    scrolled = $window.scrollTop() / ($document.height() - $window.height());
    transformScroll(scrolled);
}
