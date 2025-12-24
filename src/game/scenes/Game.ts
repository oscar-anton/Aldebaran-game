import { Input, Scene } from 'phaser';

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
const GROUND_Y_FACTOR = 0.25;
const GROUND_Y_OFFSET = -30;
const JUMP_VELOCITY = 520;
const DOUBLE_JUMP_VELOCITY = 520;
const DOUBLE_JUMP_SPIN_DURATION_MS = 520;
const JUMP_FRAME_INDEX = 2;
const DOUBLE_JUMP_ENABLED = true;

export class Game extends Scene
{
    private parallax?: ParallaxBackground;
    private character?: CharacterActor;
    private ground?: GroundGenerator;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private hasDoubleJumped = false;
    private wasOnGround = false;
    private lastMoveDirection = 1;

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

        const groundBaseY = height * GROUND_Y_FACTOR;
        const groundY = groundBaseY;
        const characterY = groundBaseY + GROUND_Y_OFFSET;

        this.ground = new GroundGenerator(this);
        this.ground.build({
            textureKey: ASSET_KEYS.environment.groundTiles,
            groundY,
            groundYOffset: GROUND_Y_OFFSET,
            columns: 3,
            rowIndex: 0,
            depth: 2,
            tileOverlap: 1,
            viewportWidth: width,
            widthScale: 0.5,
            heightScale: 0.6,
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

        if (this.ground)
        {
            this.physics.add.collider(this.character.getSprite(), this.ground.getTiles());
        }

        this.cameras.main.startFollow(this.character.getSprite(), true, 0.2, 1, 0, height * 0.35);

        this.cursors = this.input.keyboard?.createCursorKeys();
        if (this.cursors)
        {
            this.cursors.left?.on('down', () => this.character?.setFacing(-1));
            this.cursors.right?.on('down', () => this.character?.setFacing(1));
        }

        EventBus.emit('current-scene-ready', this);
    }

    update (_time: number, _delta: number)
    {
        const character = this.character?.getSprite();
        if (character && this.cursors)
        {
            const body = character.body as Phaser.Physics.Arcade.Body;
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

            const isOnGround = body.blocked.down || body.touching.down;
            if (isOnGround && !this.wasOnGround)
            {
                this.hasDoubleJumped = false;
                const existing = character.getData('doubleJumpTween') as { stop: () => void } | undefined;
                if (existing)
                {
                    existing.stop();
                }
                this.resetSpinPivot(character);
                character.setAngle(0);
            }

            if (direction !== 0)
            {
                this.character?.setFacing(direction);
                this.lastMoveDirection = direction;
                body.setVelocityX(direction * MOVE_SPEED);
                if (isOnGround)
                {
                    this.character?.startRunning();
                }
            }
            else
            {
                body.setVelocityX(0);
                if (isOnGround)
                {
                    this.character?.resetToIdle();
                }
            }

            if (!isOnGround)
            {
                this.character?.showJumpFrame(JUMP_FRAME_INDEX);
            }

            if (this.cursors.up && Input.Keyboard.JustDown(this.cursors.up))
            {
                if (isOnGround)
                {
                    body.setVelocityY(-JUMP_VELOCITY);
                    this.character?.showJumpFrame(JUMP_FRAME_INDEX);
                }
                else if (DOUBLE_JUMP_ENABLED && !this.hasDoubleJumped && body.velocity.y < 0)
                {
                    this.hasDoubleJumped = true;
                    body.setVelocityY(-DOUBLE_JUMP_VELOCITY);
                    this.character?.showJumpFrame(JUMP_FRAME_INDEX);
                    this.spinCharacter(this.lastMoveDirection);
                }
            }

            this.wasOnGround = isOnGround;
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

    private spinCharacter (direction: number)
    {
        const sprite = this.character?.getSprite();
        if (!sprite)
        {
            return;
        }

        this.setSpinPivot(sprite);
        const spin = direction >= 0 ? 360 : -360;
        const existing = sprite.getData('doubleJumpTween') as { stop: () => void } | undefined;
        if (existing)
        {
            existing.stop();
        }

        const tween = this.tweens.add({
            targets: sprite,
            angle: sprite.angle + spin,
            duration: DOUBLE_JUMP_SPIN_DURATION_MS,
            ease: 'Cubic.easeOut'
        });

        sprite.setData('doubleJumpTween', tween);
    }

    private setSpinPivot (sprite: Phaser.Physics.Arcade.Sprite)
    {
        if (sprite.getData('spinPivot') === 'center')
        {
            return;
        }

        const shift = sprite.displayHeight * 0.5;
        sprite.setData('spinPivotShift', shift);
        sprite.setOrigin(0.5, 0.5);
        sprite.y -= shift;
        sprite.setData('spinPivot', 'center');
    }

    private resetSpinPivot (sprite: Phaser.Physics.Arcade.Sprite)
    {
        if (sprite.getData('spinPivot') !== 'center')
        {
            return;
        }

        const shift = sprite.getData('spinPivotShift');
        const amount = typeof shift === 'number' ? shift : sprite.displayHeight * 0.5;
        sprite.setOrigin(0.5, 1);
        sprite.y += amount;
        sprite.setData('spinPivot', 'bottom');
    }
}
