import { GameObjects, Scene } from 'phaser';

export type ParallaxLayerConfig = {
    key: string;
    speed: number;
    alpha?: number;
    depth?: number;
    height?: number;
    y?: number;
    verticalFactor?: number;
};

export class ParallaxBackground
{
    private layers: Array<{ sprite: GameObjects.TileSprite; speed: number; baseY: number; verticalFactor: number }> = [];

    constructor (scene: Scene, width: number, height: number, layers: ParallaxLayerConfig[])
    {
        this.layers = layers.map((layer) => {
            const layerHeight = layer.height ?? height;
            const layerY = layer.y ?? 0;
            const sprite = scene.add.tileSprite(0, layerY, width, layerHeight, layer.key)
                .setOrigin(0)
                .setAlpha(layer.alpha ?? 1)
                .setDepth(layer.depth ?? 0)
                .setScrollFactor(0);

            return {
                sprite,
                speed: layer.speed,
                baseY: layerY,
                verticalFactor: layer.verticalFactor ?? 0
            };
        });
    }

    update (scrollX: number, offsetY = 0)
    {
        this.layers.forEach((layer) => {
            layer.sprite.tilePositionX = scrollX * layer.speed;
            if (layer.verticalFactor !== 0)
            {
                layer.sprite.y = layer.baseY + (offsetY * layer.verticalFactor);
            }
        });
    }
}
