import { defaultVariantKey, GameVariantKey } from '../config';
import { EventBus } from '../EventBus';

let currentVariantKey: GameVariantKey = defaultVariantKey;

export const GameState = {
    getVariantKey: (): GameVariantKey => currentVariantKey,
    setVariantKey: (variantKey: GameVariantKey) => {
        if (variantKey === currentVariantKey)
        {
            return;
        }

        currentVariantKey = variantKey;
        EventBus.emit('variant-changed', variantKey);
    }
};
