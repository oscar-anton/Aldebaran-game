import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { ASSET_KEYS, GAME_BACKGROUND_COLOR, GameVariantKey, getVariant, getVariantAssets } from '../config';
import { GameState } from '../state/GameState';

type ButtonConfig = {
    x: number;
    y: number;
    width: number;
    height: number;
    delay: number;
    variantKey: GameVariantKey;
};

export class MainMenu extends Scene
{
    private clouds?: GameObjects.TileSprite;
    private mountains?: GameObjects.TileSprite;
    private logo?: GameObjects.Image;
    private titleText?: GameObjects.Text;
    private menuButtons: GameObjects.Container[] = [];
    private menuButtonTargets: GameObjects.GameObject[] = [];
    private loadingText?: GameObjects.Text;
    private isLoading = false;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale;

        this.menuButtons = [];
        this.menuButtonTargets = [];

        this.cameras.main.setBackgroundColor(GAME_BACKGROUND_COLOR);

        this.clouds = this.add.tileSprite(0, 0, width, height, ASSET_KEYS.backgrounds.clouds)
            .setOrigin(0)
            .setAlpha(0.75)
            .setDepth(0);

        this.mountains = this.add.tileSprite(0, 0, width, height, ASSET_KEYS.backgrounds.mountains)
            .setOrigin(0)
            .setAlpha(1)
            .setDepth(1);

        this.logo = this.add.image(width / 2, height * 0.18, ASSET_KEYS.ui.logoAldebaran);
        const logoScale = Math.min(0.26, (width * 0.26) / this.logo.width);
        this.logo.setScale(logoScale).setAlpha(0);

        this.tweens.add({
            targets: this.logo,
            y: this.logo.y + 6,
            alpha: 1,
            duration: 900,
            ease: 'Bounce.easeOut'
        });

        this.tweens.add({
            targets: this.logo,
            y: this.logo.y + 10,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: 900
        });

        const titleFontSize = width < 900 ? 30 : 38;
        this.titleText = this.add.text(width / 2, height * 0.38, 'Aprende ha hacer un videojuego', {
            fontFamily: 'Trebuchet MS',
            fontSize: `${titleFontSize}px`,
            color: '#fef5d4',
            stroke: '#0b0b0b',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.animateEntry(this.titleText, 160, 18);
        this.addFloatTween(this.titleText, 0.01, 2000, 1000, height * 0.38);

        const buttonWidth = Math.min(560, width * 0.8);
        const buttonHeight = width < 900 ? 90 : 104;
        const buttonSpacing = 28;

        const firstButtonY = height * 0.56;
        const secondButtonY = firstButtonY + buttonHeight + buttonSpacing;

        const grade1Button = this.createMenuButton({
            x: width / 2,
            y: firstButtonY,
            width: buttonWidth,
            height: buttonHeight,
            delay: 320,
            variantKey: 'grade1'
        });

        const grade4Button = this.createMenuButton({
            x: width / 2,
            y: secondButtonY,
            width: buttonWidth,
            height: buttonHeight,
            delay: 460,
            variantKey: 'grade4'
        });

        this.menuButtons = [grade1Button, grade4Button];

        EventBus.emit('current-scene-ready', this);
    }

    update (_time: number, delta: number)
    {
        const mountainSpeed = delta * 0.015;
        const cloudSpeed = delta * 0.03;

        if (this.mountains)
        {
            this.mountains.tilePositionX += mountainSpeed;
        }

        if (this.clouds)
        {
            this.clouds.tilePositionX += cloudSpeed;
        }
    }

    private animateEntry (target: GameObjects.GameObject, delay: number, yOffset = 16, duration = 700)
    {
        const gameObject = target as GameObjects.Components.Transform & GameObjects.Components.Alpha;
        const finalY = gameObject.y;

        gameObject.setAlpha(0);
        gameObject.y = finalY + yOffset;

        this.tweens.add({
            targets: target,
            y: finalY,
            alpha: 1,
            duration,
            ease: 'Back.easeOut',
            delay
        });
    }

    private addFloatTween (target: GameObjects.GameObject, offset: number, duration: number, delay = 0, baseY?: number)
    {
        const transform = target as GameObjects.Components.Transform;
        const originY = baseY ?? transform.y;
        this.tweens.add({
            targets: target,
            y: originY + offset * 100,
            duration,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay
        });
    }

    private tweenButtonScale (button: GameObjects.Container, scale: number, duration: number, ease: string)
    {
        const existing = button.getData('scaleTween') as { stop: () => void } | undefined;
        if (existing)
        {
            existing.stop();
        }

        const tween = this.tweens.add({
            targets: button,
            scale,
            duration,
            ease
        });

        button.setData('scaleTween', tween);
    }

    private createMenuButton ({ x, y, width, height, delay, variantKey }: ButtonConfig): GameObjects.Container
    {
        const variant = getVariant(variantKey);
        const leftColumnWidth = Math.max(height * 1.2, width * 0.2);
        const textCenterX = leftColumnWidth / 2;

        const hitPadding = Math.max(12, Math.round(height * 0.12));
        const hitZone = this.add.zone(0, 0, width + hitPadding * 2, height + hitPadding * 2).setOrigin(0.5);
        hitZone.setInteractive({ cursor: 'pointer' });

        const background = this.add.rectangle(0, 0, width, height, 0x0d0d0d, 0.7);
        background.setStrokeStyle(2, 0xffffff, 0.5);

        const characterSprite = this.add.image(-width / 2 + leftColumnWidth / 2, 0, variant.character.pixelArtKey)
            .setOrigin(0.5);

        const spriteMaxSize = Math.min(height * 0.8, leftColumnWidth * 0.75);
        const spriteScale = spriteMaxSize / Math.max(characterSprite.width, characterSprite.height);
        characterSprite.setScale(spriteScale);

        const gradeFontSize = Math.round(height * 0.32);
        const nameFontSize = Math.round(height * 0.22);

        const gradeText = this.add.text(textCenterX, -height * 0.18, variant.menu.gradeText, {
            fontFamily: 'Trebuchet MS',
            fontSize: `${gradeFontSize}px`,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const nameText = this.add.text(textCenterX, height * 0.18, variant.menu.studentName, {
            fontFamily: 'Trebuchet MS',
            fontSize: `${nameFontSize}px`,
            color: '#f7e0a0',
            align: 'center'
        }).setOrigin(0.5);

        const button = this.add.container(x, y, [hitZone, background, characterSprite, gradeText, nameText]);
        button.setSize(width, height);
        button.setAlpha(0);
        this.menuButtonTargets.push(hitZone);
        this.animateEntry(button, delay, 20);
        this.addFloatTween(button, 0.05, 1800, delay + 600, y);

        hitZone.on('pointerover', () => {
            background.setFillStyle(0x1a1a1a, 0.85);
            background.setStrokeStyle(2, 0xf7d37a, 1);
            this.tweenButtonScale(button, 1.03, 520, 'Elastic.easeOut');
        });

        hitZone.on('pointerout', () => {
            background.setFillStyle(0x0d0d0d, 0.7);
            background.setStrokeStyle(2, 0xffffff, 0.5);
            this.tweenButtonScale(button, 1, 480, 'Elastic.easeOut');
        });

        hitZone.on('pointerdown', () => {
            this.tweenButtonScale(button, 0.99, 110, 'Sine.easeOut');
        });

        hitZone.on('pointerup', () => this.startVariant(variantKey));

        return button;
    }

    private startVariant (variantKey: GameVariantKey)
    {
        if (this.isLoading)
        {
            return;
        }

        this.isLoading = true;
        this.menuButtonTargets.forEach((target) => {
            if ('disableInteractive' in target)
            {
                (target as GameObjects.GameObject).disableInteractive();
            }
        });

        this.fadeMenuUI();

        const queuedAssets = this.queueVariantAssets(variantKey);
        if (queuedAssets === 0)
        {
            this.finishStartVariant(variantKey);
            return;
        }

        this.showLoadingText();
        this.load.once('complete', () => this.finishStartVariant(variantKey));
        this.load.start();
    }

    private queueVariantAssets (variantKey: GameVariantKey): number
    {
        const assets = getVariantAssets(variantKey);
        let queued = 0;

        assets.images.forEach((asset) => {
            if (this.textures.exists(asset.key))
            {
                return;
            }

            this.load.image(asset.key, asset.path);
            queued += 1;
        });

        assets.spritesheets.forEach((asset) => {
            if (this.textures.exists(asset.key))
            {
                return;
            }

            if (asset.frameConfig)
            {
                this.load.spritesheet(asset.key, asset.path, asset.frameConfig);
            }
            else
            {
                this.load.image(asset.key, asset.path);
            }

            queued += 1;
        });

        return queued;
    }

    private showLoadingText ()
    {
        if (this.loadingText)
        {
            return;
        }

        const { width, height } = this.scale;
        this.loadingText = this.add.text(width / 2, height - 48, 'Cargando...', {
            fontFamily: 'Trebuchet MS',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.loadingText,
            alpha: 0.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private fadeMenuUI ()
    {
        const targets: GameObjects.GameObject[] = [...this.menuButtons];
        if (this.logo)
        {
            targets.push(this.logo);
        }
        if (this.titleText)
        {
            targets.push(this.titleText);
        }

        this.tweens.add({
            targets,
            alpha: 0.25,
            duration: 240,
            ease: 'Sine.easeOut'
        });
    }

    private finishStartVariant (variantKey: GameVariantKey)
    {
        GameState.setVariantKey(variantKey);

        this.cameras.main.fadeOut(350, 5, 5, 5);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Game');
        });
    }
}
