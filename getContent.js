const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: 'f88hh2wm9go2',
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: '57ab0e543bb9c028d4b10f40469c8eb3f4b9b553587634e01a0acc3655862132'
});

const layers = [[], []];

client.getEntries().then(function({ items }) {
    let i = 0;

    let imageLayers = layers.map(() => {

        let images = items.map(item => {

            // to change to return a JSON including project title and description

            return item.fields.images[i].fields.file.url;
        });
        i++;
        return images;
    });

    renderImages(imageLayers);
});

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
