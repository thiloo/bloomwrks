const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: space,
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: accessToken
});

let overlay = false,
    transformProp = null,
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

client.getEntries({
    'content_type': 'layer'
}).then(layer => {
    console.log('layer',layer);
    // get image url and location on layer
    let images = layer.items.map(image => {
        let links = image.fields.images.map(info => {
            let json = {};
            json.layerId = image.fields.id;
            json.location = info.fields.layerLocation;
            json.url = info.fields.image.fields.file.url;
            json.imageId = info.sys.id;
            json.imageSysId = info.fields.image.sys.id;
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
    levels = layers.length;
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
        client.getEntries({
            'content_type': 'project',
            'sys.id': result.fields.project.sys.id,
        }).then(project => {
            json.title = project.items[0].fields.title;
            json.subtitle = project.items[0].fields.subtitle;
            json.category = project.items[0].fields.category;
            json.description = project.items[0].fields.description;
            json.images = project.items[0].fields.images.map(image => {
                let obj = {};
                obj.id = image.sys.id;
                obj.url = `http:${image.fields.image.fields.file.url}`;
                return obj;
            });
            showBigImage(json);
        });
    });
}

function showBigImage(json) {
    overlay = true;
    $(`#wrap`).append(`<div id="overlay" class="flexContainer">
            <div class="overlay-flex-side"></div>
            <div class="overlay-flex-middle">
                <div class="overlay-image">
                    ${prepareSlide(json)}
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
    var wallopEl = document.querySelector('.Wallop');
    var slider = new Wallop(wallopEl);
}


function prepareSlide(json) {
    return(
        `<div class="Wallop flexContainer">
            <div class="Wallop-buttonPrevious slideButton">
                <
            </div>
            <div class="Wallop-list slideImage">
                ${prepareSlideImage(json)}
            </div>
            <div class="Wallop-buttonNext slideButton">
                >
            </div>

        </div>`
    );
}

function prepareSlideImage(json) {
    return json.images.map(image => {
        if(image.id == json.imageId) {
            return (
                `<div class="Wallop-item Wallop-item--current">
                    <img src="${image.url}" id="${image.id}" class="largeImage" />
                </div>`
            );
        } else {
            return (
                `<div class="Wallop-item">
                    <img src="${image.url}" id="${image.id}" class="largeImage" />
                </div>`
            );
        }
    });
}


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
