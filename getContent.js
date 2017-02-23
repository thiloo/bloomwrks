const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: 'f5w6053ana68',
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: 'e5ef71a8009233f87ba815f7bb42afe5087583f6ec9ba87317545eec5af4fabb'
});

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
    $(`#close-overlay`).click(() => $('#overlay').remove());
}
