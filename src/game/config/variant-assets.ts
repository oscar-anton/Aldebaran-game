import { ASSET_KEYS, ASSET_PATHS, IDLE_FRAME_CONFIG, ImageAsset, SpriteSheetAsset } from './assets';
import { GameVariantKey } from './variants';

export type VariantAssetBundle = {
    images: ImageAsset[];
    spritesheets: SpriteSheetAsset[];
};

const variantImages: Record<GameVariantKey, ImageAsset[]> = {
    grade1: [
        { key: ASSET_KEYS.environment.jungleTiles, path: ASSET_PATHS.environment.jungleTiles },
        { key: ASSET_KEYS.characters.linxPixel, path: ASSET_PATHS.characters.linxPixel }
    ],
    grade4: [
        { key: ASSET_KEYS.environment.jungleTiles, path: ASSET_PATHS.environment.jungleTiles },
        { key: ASSET_KEYS.characters.monkeyPixel, path: ASSET_PATHS.characters.monkeyPixel }
    ]
};

const variantSpritesheets: Record<GameVariantKey, SpriteSheetAsset[]> = {
    grade1: [
        { key: ASSET_KEYS.characters.linxIdle, path: ASSET_PATHS.characters.linxIdle, frameConfig: IDLE_FRAME_CONFIG },
        { key: ASSET_KEYS.characters.linxRun, path: ASSET_PATHS.characters.linxRun, frameConfig: IDLE_FRAME_CONFIG }
    ],
    grade4: [
        { key: ASSET_KEYS.characters.monkeyIdle, path: ASSET_PATHS.characters.monkeyIdle, frameConfig: IDLE_FRAME_CONFIG },
        { key: ASSET_KEYS.characters.monkeyRun, path: ASSET_PATHS.characters.monkeyRun, frameConfig: IDLE_FRAME_CONFIG }
    ]
};

export const getVariantAssets = (variantKey: GameVariantKey): VariantAssetBundle => ({
    images: variantImages[variantKey],
    spritesheets: variantSpritesheets[variantKey]
});
