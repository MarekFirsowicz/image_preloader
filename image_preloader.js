class Assets {
    constructor() {
        this.assets = new Map();
    }
    get_key(urls) {
        const regex = /.*\/([^\/]+?)(?:_[^_]+)?\.(?:png|jpg|jpeg|gif|bmp|webp|svg)$/i;
        return Array.isArray(urls)
            ? urls[0].replace(regex, '$1')
            : urls.match(regex)[1];
    }

    get_asset(key) {
        if (!this.assets.has(key)) throw new Error(`No images found for the key: ${key}`)
        return this.assets.get(key)
    }

    get_all_assets() {
        return new Map(this.assets)
    }

    async preload_assets(urls, name = null) {
        const key = name || this.get_key(urls)
        //check if key exist
        if (this.assets.has(key)) throw new Error(`that key already exist: ${key}`)

        if (typeof urls === 'string') {
            //load single image
            const img = await this.load_asset(urls).catch((error) => console.error(error))
            this.assets.set(key, img)

        } else if (Array.isArray(urls) && urls.every((element) => typeof element === 'string')) {
            //load multiple images - sprite sets
            const promises = urls.map((el) => this.load_asset(el).catch((error) => console.error(error)))
            const images = await Promise.all(promises);
            this.assets.set(key, images)
        } else {
            throw new TypeError("urls should be a string or an array of strings");
        }
    }
}

class Image_Preloader extends Assets {
    constructor() {
        super()
    }

    load_asset(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image:' + src));
        });
    }


}


export const image_Preloader = new Image_Preloader()




export const images = [
    // Formats - if key is not provided, it will be created by the this.get_key(urls) method
    // Images can be loaded individually or as an image set (array) - can be used for sprites

    //{ images: './images/img1.png', key: 'img1' },

    //Load image without key 
    //{ images: './images/img2.jpg' },

    // {
    //     images: [
    //         './images/tile_01.png',
    //         './images/tile_02.png'
    //     ], key: 'tileset'
    // },


    //Load image set without key 
    // {
    //     images: [
    //         './images/tile_01.png',
    //         './images/tile_02.png'
    //     ]
    // },
]


// Game init function
async function init(assets) {
    const promises = assets.map(el => image_Preloader.preload_assets(el.images, el.key || null))
    await Promise.all(promises)

    console.log(image_Preloader.get_all_assets())

    //... game code
}


// Initialize function
init(images)