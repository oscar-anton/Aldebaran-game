const ROOT_ASSET_PATH = 'assets';
const IMG_PATH = `${ROOT_ASSET_PATH}/img`;

export const ASSET_KEYS = {
    backgrounds: {
        clouds: 'bg-clouds',
        mountains: 'bg-mountains'
    },
    characters: {
        monkeyIdle: 'monkey-idle',
        monkeyRun: 'monkey-run',
        monkeyPixel: 'monkey-pixel',
        linxIdle: 'linx-idle',
        linxRun: 'linx-run',
        linxPixel: 'linx-pixel'
    },
    environment: {
        jungleTiles: 'jungle-tiles'
    },
    ui: {
        logoAldebaran: 'logo-aldebaran'
    }
} as const;

export const ASSET_PATHS = {
    backgrounds: {
        clouds: `${IMG_PATH}/bg_clouds.png`,
        mountains: `${IMG_PATH}/bg_mountains.png`
    },
    characters: {
        monkeyIdle: `${IMG_PATH}/monkey_idle.png`,
        monkeyRun: `${IMG_PATH}/monkey_running.png`,
        monkeyPixel: `${IMG_PATH}/monkey_pixelart.png`,
        linxIdle: `${IMG_PATH}/linx_idle.png`,
        linxRun: `${IMG_PATH}/linx_running.png`,
        linxPixel: `${IMG_PATH}/linx_pixelart.png`
    },
    environment: {
        jungleTiles: `${IMG_PATH}/jungla_tiles.png`
    },
    ui: {
        logoAldebaran: `${ROOT_ASSET_PATH}/logo-aldebaran.png`
    }
} as const;

export type FrameConfig = {
    frameWidth: number;
    frameHeight: number;
    startFrame?: number;
    endFrame?: number;
};

export type ImageAsset = {
    key: string;
    path: string;
};

export type SpriteSheetAsset = {
    key: string;
    path: string;
    frameConfig?: FrameConfig;
};

export const IDLE_FRAME_CONFIG: FrameConfig = {
    frameWidth: 256,
    frameHeight: 256
};

export const MENU_IMAGE_ASSETS: ImageAsset[] = [
    { key: ASSET_KEYS.backgrounds.clouds, path: ASSET_PATHS.backgrounds.clouds },
    { key: ASSET_KEYS.backgrounds.mountains, path: ASSET_PATHS.backgrounds.mountains },
    { key: ASSET_KEYS.ui.logoAldebaran, path: ASSET_PATHS.ui.logoAldebaran },
    { key: ASSET_KEYS.characters.monkeyPixel, path: ASSET_PATHS.characters.monkeyPixel },
    { key: ASSET_KEYS.characters.linxPixel, path: ASSET_PATHS.characters.linxPixel }
];

export const CHARACTER_IMAGE_ASSETS: ImageAsset[] = [
    { key: ASSET_KEYS.characters.monkeyPixel, path: ASSET_PATHS.characters.monkeyPixel },
    { key: ASSET_KEYS.characters.linxPixel, path: ASSET_PATHS.characters.linxPixel }
];

export const CHARACTER_SPRITESHEET_ASSETS: SpriteSheetAsset[] = [
    { key: ASSET_KEYS.characters.monkeyIdle, path: ASSET_PATHS.characters.monkeyIdle, frameConfig: IDLE_FRAME_CONFIG },
    { key: ASSET_KEYS.characters.monkeyRun, path: ASSET_PATHS.characters.monkeyRun, frameConfig: IDLE_FRAME_CONFIG },
    { key: ASSET_KEYS.characters.linxIdle, path: ASSET_PATHS.characters.linxIdle, frameConfig: IDLE_FRAME_CONFIG },
    { key: ASSET_KEYS.characters.linxRun, path: ASSET_PATHS.characters.linxRun, frameConfig: IDLE_FRAME_CONFIG }
];
