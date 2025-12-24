import { GameObjects, Math as PhaserMath, Scene } from 'phaser';

const IDLE_ROWS = 4;
const IDLE_FRAMES_PER_ROW = 4;
const IDLE_FRAME_RATE = 4;
const IDLE_PAUSE_MIN_MS = 1400;
const IDLE_PAUSE_MAX_MS = 2200;
const IDLE_INITIAL_DELAY_MS = 900;
const RUN_FRAME_RATE = 10;
const RUN_FRAMES_TOTAL = 8;

export const IDLE_FRAME_SIZE = 256;

const getNextRow = (lastRow?: number) => {
    if (typeof lastRow !== 'number')
    {
        return PhaserMath.Between(0, IDLE_ROWS - 1);
    }

    return (lastRow + PhaserMath.Between(1, IDLE_ROWS - 1)) % IDLE_ROWS;
};

const scheduleNextIdle = (scene: Scene, sprite: GameObjects.Sprite, delayMs: number, callback: () => void) => {
    const existingTimer = sprite.getData('idleTimer') as { remove: (destroy?: boolean) => void } | undefined;
    if (existingTimer)
    {
        existingTimer.remove(false);
    }

    const timer = scene.time.delayedCall(delayMs, () => {
        if (!sprite.active)
        {
            return;
        }
        callback();
    });

    sprite.setData('idleTimer', timer);
};

const clearIdleLoop = (sprite: GameObjects.Sprite) => {
    const existingTimer = sprite.getData('idleTimer') as { remove: (destroy?: boolean) => void } | undefined;
    if (existingTimer)
    {
        existingTimer.remove(false);
    }

    const previousHandler = sprite.getData('idleCompleteHandler') as (() => void) | undefined;
    if (previousHandler)
    {
        sprite.off('animationcomplete', previousHandler);
    }
};

export const ensureIdleAnimations = (scene: Scene, characterId: string, spriteKey: string) =>
{
    for (let row = 0; row < IDLE_ROWS; row += 1)
    {
        const animationKey = `${characterId}-idle-row-${row}`;
        if (scene.anims.exists(animationKey))
        {
            continue;
        }

        scene.anims.create({
            key: animationKey,
            frames: scene.anims.generateFrameNumbers(spriteKey, {
                start: row * IDLE_FRAMES_PER_ROW,
                end: row * IDLE_FRAMES_PER_ROW + (IDLE_FRAMES_PER_ROW - 1)
            }),
            frameRate: IDLE_FRAME_RATE,
            repeat: 0
        });
    }
};

export const ensureRunAnimation = (scene: Scene, characterId: string, spriteKey: string) =>
{
    const animationKey = `${characterId}-run`;
    if (scene.anims.exists(animationKey))
    {
        return;
    }

    scene.anims.create({
        key: animationKey,
        frames: scene.anims.generateFrameNumbers(spriteKey, {
            start: 0,
            end: RUN_FRAMES_TOTAL - 1
        }),
        frameRate: RUN_FRAME_RATE,
        repeat: -1
    });
};

export const startIdleLoop = (scene: Scene, characterId: string, sprite: GameObjects.Sprite, idleSpriteKey: string) =>
{
    clearIdleLoop(sprite);

    sprite.anims.stop();
    sprite.setTexture(idleSpriteKey, 0);

    const playNext = () => {
        const lastRow = sprite.getData('idleRow') as number | undefined;
        const nextRow = getNextRow(lastRow);
        sprite.setData('idleRow', nextRow);
        sprite.play(`${characterId}-idle-row-${nextRow}`, true);
    };

    const handleComplete = () => {
        sprite.setFrame(0);
        const pause = PhaserMath.Between(IDLE_PAUSE_MIN_MS, IDLE_PAUSE_MAX_MS);
        scheduleNextIdle(scene, sprite, pause, playNext);
    };

    sprite.setData('idleCompleteHandler', handleComplete);
    sprite.on('animationcomplete', handleComplete);

    scheduleNextIdle(scene, sprite, IDLE_INITIAL_DELAY_MS, playNext);
};

export const startRunning = (characterId: string, sprite: GameObjects.Sprite, runSpriteKey: string) =>
{
    clearIdleLoop(sprite);
    sprite.anims.stop();
    sprite.setTexture(runSpriteKey, 0);
    sprite.play(`${characterId}-run`, true);
};
