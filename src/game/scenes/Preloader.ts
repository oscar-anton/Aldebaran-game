import { Scene } from 'phaser';

import { MENU_IMAGE_ASSETS } from '../config';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        const { width, height } = this.cameras.main;
        const barWidth = Math.min(460, width * 0.6);
        const barHeight = 24;

        this.add.rectangle(width / 2, height / 2, barWidth + 8, barHeight + 8).setStrokeStyle(2, 0xffffff, 0.8);

        const bar = this.add.rectangle(width / 2 - barWidth / 2, height / 2, 4, barHeight, 0xffffff).setOrigin(0, 0.5);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar
            bar.width = 4 + (barWidth * progress);

        });
    }

    preload ()
    {
        MENU_IMAGE_ASSETS.forEach((asset) => {
            this.load.image(asset.key, asset.path);
        });
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
