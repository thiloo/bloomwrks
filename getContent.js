const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: 'f5w6053ana68',
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: 'e5ef71a8009233f87ba815f7bb42afe5087583f6ec9ba87317545eec5af4fabb'
});

const layers = [[], []];

client.getEntries({
    'content_type': 'layer'
}).then(layer => {
    // get image url and location on layer
    let images = layer.items.map(image => {
        let links = image.fields.images.map(info => {
            let json = {};
            json.layerId = image.fields.id;
            json.location = info.fields.layerLocation;
            json.url = info.fields.image.fields.file.url;
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
    console.log(layers);
    let i = 1;
    layers.map(layer => {
        $('#content').append(`<section id="level-${i}"></section>`);
        layer.map(image => {
            $(`#level-${i}`).append(`<img src="http:${image.url}" class="location-${image.location}"/>`);
        });
        i++;
    });
}

// client.getEntries().then(function(items) {
//     console.log(items);
//     let i = 0;
//
//     let imageLayers = layers.map(() => {
//
//         let images = items.map(item => {
//
//             // to change to return a JSON including project title and description
//
//             return item.fields.images[i].fields.file.url;
//         });
//         i++;
//         return images;
//     });
//
//     renderImages(imageLayers);
// });

const renderImages = (layers) => {
    let i = 1;
    layers.map(layer => {
        $('#content').append(`<section id="level-${i}"></section>`);
        layer.map(image => {
            $(`#level-${i}`).append(`<img src="http:${image}" />`);
        });
        i++;
    });
};
