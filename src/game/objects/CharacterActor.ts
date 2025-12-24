import { Scene } from 'phaser';

import { ensureIdleAnimations, ensureRunAnimation, IDLE_FRAME_SIZE, startIdleLoop, startRunning } from '../animations/idleAnimations';

const RUN_SCALE_BOOST = 0.2;

export type CharacterActorConfig = {
    x: number;
    y: number;
    characterId: string;
    idleSpriteKey: string;
    runSpriteKey: string;
    targetHeight: number;
    depth?: number;
};

export class CharacterActor
{
    private scene: Scene;
    private sprite: Phaser.Physics.Arcade.Sprite;
    private characterId: string;
    private idleSpriteKey: string;
    private runSpriteKey: string;
    private isRunning = false;
    private isJumping = false;
    private baseScale = 1;
    private runScale = 1;

    constructor (scene: Scene, config: CharacterActorConfig)
    {
        this.scene = scene;
        this.characterId = config.characterId;
        this.idleSpriteKey = config.idleSpriteKey;
        this.runSpriteKey = config.runSpriteKey;

        ensureIdleAnimations(scene, this.characterId, this.idleSpriteKey);
        ensureRunAnimation(scene, this.characterId, this.runSpriteKey);

        this.sprite = scene.physics.add.sprite(config.x, config.y, this.idleSpriteKey)
            .setOrigin(0.5, 1)
            .setDepth(config.depth ?? 2);

        this.setTargetHeight(config.targetHeight);
        startIdleLoop(scene, this.characterId, this.sprite, this.idleSpriteKey);
    }

    setTargetHeight (height: number)
    {
        this.baseScale = height / IDLE_FRAME_SIZE;
        this.runScale = this.baseScale * (1 + RUN_SCALE_BOOST);
        this.sprite.setScale(this.isRunning ? this.runScale : this.baseScale);
    }

    startRunning ()
    {
        if (this.isRunning)
        {
            return;
        }

        this.isRunning = true;
        this.isJumping = false;
        this.sprite.setScale(this.runScale);
        startRunning(this.characterId, this.sprite, this.runSpriteKey);
    }

    stopRunning ()
    {
        if (!this.isRunning)
        {
            return;
        }

        this.isRunning = false;
        this.isJumping = false;
        this.sprite.setScale(this.baseScale);
        startIdleLoop(this.scene, this.characterId, this.sprite, this.idleSpriteKey);
    }

    showJumpFrame (frameIndex = 2)
    {
        const currentFrame = this.sprite.frame?.name;
        if (
            this.isJumping
            && this.sprite.texture.key === this.runSpriteKey
            && (currentFrame === frameIndex || currentFrame === String(frameIndex))
        )
        {
            return;
        }

        this.isJumping = true;
        this.isRunning = false;
        startRunning(this.characterId, this.sprite, this.runSpriteKey);
        this.sprite.anims.stop();
        this.sprite.setTexture(this.runSpriteKey, frameIndex);
        this.sprite.setScale(this.runScale);
    }

    getSprite ()
    {
        return this.sprite;
    }

    setFacing (direction: number)
    {
        this.sprite.setFlipX(direction < 0);
    }
}
