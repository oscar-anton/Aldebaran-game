import { Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { ASSET_KEYS, GAME_BACKGROUND_COLOR, getVariant } from '../config';
import { GameState } from '../state/GameState';
import { ParallaxBackground } from '../objects/ParallaxBackground';
import { CharacterActor } from '../objects/CharacterActor';
import { GroundGenerator } from '../objects/GroundGenerator';

const CLOUDS_SCROLL_FACTOR = 0.25;
const MOUNTAINS_SCROLL_FACTOR = 0.15;
const CHARACTER_SCALE_FACTOR = 0.33;
const MOVE_SPEED = 260;

export class Game extends Scene
{
    private parallax?: ParallaxBackground;
    private character?: CharacterActor;
    private ground?: GroundGenerator;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const { width, height } = this.scale;
        const variant = getVariant(GameState.getVariantKey());
        const mountainTexture = this.textures.get(ASSET_KEYS.backgrounds.mountains).getSourceImage() as HTMLImageElement;
        const mountainHeight = Math.max(height, mountainTexture.height);
        const mountainY = height - mountainHeight;

        this.cameras.main.setBackgroundColor(GAME_BACKGROUND_COLOR);

        this.parallax = new ParallaxBackground(this, width, height, [
            { key: ASSET_KEYS.backgrounds.clouds, speed: CLOUDS_SCROLL_FACTOR, alpha: 0.75, depth: 0 },
            { key: ASSET_KEYS.backgrounds.mountains, speed: MOUNTAINS_SCROLL_FACTOR, alpha: 1, depth: 1, height: mountainHeight, y: mountainY }
        ]);

        const characterY = height * 0.25;
        const groundY = characterY;

        this.ground = new GroundGenerator(this);
        this.ground.build({
            textureKey: ASSET_KEYS.environment.groundTiles,
            groundY,
            groundYOffset: -30,
            columns: 3,
            rowIndex: 0,
            depth: 2,
            tileOverlap: 1,
            viewportWidth: width,
            bufferTiles: 3
        });

        const baseHeight = Math.min(360, height * 0.45);
        const targetHeight = baseHeight * CHARACTER_SCALE_FACTOR;
        this.character = new CharacterActor(this, {
            x: width * 0.5,
            y: characterY,
            characterId: variant.character.id,
            idleSpriteKey: variant.character.idleSpriteKey,
            runSpriteKey: variant.character.runSpriteKey,
            targetHeight,
            depth: 3
        });

        this.cameras.main.startFollow(this.character.getSprite(), true, 0.2, 1, 0, height * 0.35);

        this.cursors = this.input.keyboard?.createCursorKeys();
        if (this.cursors)
        {
            this.cursors.left?.on('down', () => this.character?.setFacing(-1));
            this.cursors.right?.on('down', () => this.character?.setFacing(1));
        }

        EventBus.emit('current-scene-ready', this);
    }

    update (_time: number, delta: number)
    {
        const character = this.character?.getSprite();
        if (character && this.cursors)
        {
            const movingLeft = this.cursors.left?.isDown;
            const movingRight = this.cursors.right?.isDown;
            let direction = 0;
            if (movingRight)
            {
                direction = 1;
            }
            else if (movingLeft)
            {
                direction = -1;
            }

            if (direction !== 0)
            {
                this.character?.setFacing(direction);
                this.character?.startRunning();

                character.x += direction * MOVE_SPEED * (delta / 1000);
            }
            else
            {
                this.character?.stopRunning();
            }
        }

        if (this.parallax)
        {
            this.parallax.update(this.cameras.main.scrollX);
        }

        if (this.ground)
        {
            this.ground.update(this.cameras.main.scrollX);
        }
    }
}
