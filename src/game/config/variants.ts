import { ASSET_KEYS } from './assets';

export type GameVariantKey = 'grade1' | 'grade4';

export type CharacterId = 'linx' | 'monkey';
export type EnemyId = 'snake' | 'tiger';
export type ItemId = 'diamond' | 'banana';
export type HomeId = 'cave' | 'hut';
export type ThemeId = 'mountain' | 'jungle';

export type ParallaxLayerConfig = {
    key: string;
    speed: number;
};

export type GameVariant = {
    key: GameVariantKey;
    label: string;
    gradeLabel: string;
    menu: {
        gradeText: string;
        studentName: string;
    };
    character: {
        id: CharacterId;
        label: string;
        idleSpriteKey: string;
        runSpriteKey: string;
        pixelArtKey: string;
    };
    enemy: {
        id: EnemyId;
        label: string;
    };
    item: {
        id: ItemId;
        label: string;
    };
    environment: {
        theme: ThemeId;
        home: HomeId;
        backgroundLayers: ParallaxLayerConfig[];
    };
};

export const gameVariants: Record<GameVariantKey, GameVariant> = {
    grade1: {
        key: 'grade1',
        label: '1º de primaria',
        gradeLabel: '1º de primaria',
        menu: {
            gradeText: '1º de primaria',
            studentName: 'Inés Antón García'
        },
        character: {
            id: 'linx',
            label: 'Linx',
            idleSpriteKey: ASSET_KEYS.characters.linxIdle,
            runSpriteKey: ASSET_KEYS.characters.linxRun,
            pixelArtKey: ASSET_KEYS.characters.linxPixel
        },
        enemy: {
            id: 'snake',
            label: 'Serpiente'
        },
        item: {
            id: 'diamond',
            label: 'Diamante'
        },
        environment: {
            theme: 'mountain',
            home: 'cave',
            backgroundLayers: [
                { key: ASSET_KEYS.backgrounds.mountains, speed: 0.2 },
                { key: ASSET_KEYS.backgrounds.clouds, speed: 0.4 }
            ]
        }
    },
    grade4: {
        key: 'grade4',
        label: '4º de primaria',
        gradeLabel: '4º de primaria',
        menu: {
            gradeText: '4º de primaria',
            studentName: 'Vega Antón García'
        },
        character: {
            id: 'monkey',
            label: 'Monkey',
            idleSpriteKey: ASSET_KEYS.characters.monkeyIdle,
            runSpriteKey: ASSET_KEYS.characters.monkeyRun,
            pixelArtKey: ASSET_KEYS.characters.monkeyPixel
        },
        enemy: {
            id: 'tiger',
            label: 'Tigre'
        },
        item: {
            id: 'banana',
            label: 'Platano'
        },
        environment: {
            theme: 'jungle',
            home: 'hut',
            backgroundLayers: [
                { key: ASSET_KEYS.backgrounds.mountains, speed: 0.2 },
                { key: ASSET_KEYS.backgrounds.clouds, speed: 0.4 }
            ]
        }
    }
};

export const defaultVariantKey: GameVariantKey = 'grade1';

export const getVariant = (variantKey: GameVariantKey): GameVariant => gameVariants[variantKey];
