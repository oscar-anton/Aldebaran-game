import { Math as PhaserMath, Scene } from 'phaser';

export type GroundGeneratorConfig = {
  textureKey: string;
  groundY: number;              // Y de COLISIÓN (suelo real)
  groundYOffset?: number;       // Offset VISUAL (sube/baja el sprite)
  columns: number;
  rowIndex?: number;
  depth?: number;
  heightScale?: number;
  widthScale?: number;
  tileOverlap?: number;
  viewportWidth?: number;
  bufferTiles?: number;
};

type GroundGeneratorState = {
  textureKey: string;

  // Físico vs visual (separados)
  collisionY: number;      // y del body (sin offset)
  visualY: number;         // y del sprite (con offset)
  visualYOffset: number;

  tileWidth: number;
  tileHeight: number;
  columns: number;
  frameStart: number;
  depth: number;
  displayWidth: number;
  displayHeight: number;
  stepX: number;
  viewportWidth: number;
  bufferTiles: number;
};

export class GroundGenerator {
  private scene: Scene;

  // Usamos SpriteWithStaticBody para poder tocar body.position sin liarla
  private tiles: Phaser.Types.Physics.Arcade.SpriteWithStaticBody[] = [];
  private config?: GroundGeneratorState;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  build(config: GroundGeneratorConfig) {
    this.clear();

    const rowIndex = config.rowIndex ?? 0;
    const depth = config.depth ?? 2;
    const heightScale = config.heightScale ?? 1;
    const widthScale = config.widthScale ?? 1;
    const visualYOffset = Math.round(config.groundYOffset ?? 0);

    const viewportWidth = config.viewportWidth ?? this.scene.scale.width;
    const bufferTiles = config.bufferTiles ?? 2;
    const tileOverlap = Math.max(0, config.tileOverlap ?? 1);

    const texture = this.scene.textures.get(config.textureKey);
    const baseFrame = texture.get(0);
    const tileWidth = baseFrame.width;
    const tileHeight = baseFrame.height;

    const displayWidth = Math.round(tileWidth * widthScale);
    const displayHeight = Math.round(tileHeight * heightScale);

    const stepX = Math.max(1, Math.round(displayWidth - tileOverlap));
    const tileCount = Math.ceil(viewportWidth / stepX) + bufferTiles * 2;

    // 👇 separación clave:
    const collisionY = Math.round(config.groundY);         // suelo real (body)
    const visualY = Math.round(config.groundY + visualYOffset); // sprite “un poco más alto/abajo”

    const frameStart = rowIndex * config.columns;

    let cursorX = -bufferTiles * stepX;

    for (let index = 0; index < tileCount; index += 1) {
      const column = PhaserMath.Between(0, config.columns - 1);

      const tile = this.createTile(cursorX, column, {
        textureKey: config.textureKey,
        frameStart,
        depth,
        displayWidth,
        displayHeight,
        collisionY,
        visualY
      });

      this.tiles.push(tile);
      cursorX += stepX;
    }

    this.config = {
      textureKey: config.textureKey,
      collisionY,
      visualY,
      visualYOffset,
      tileWidth,
      tileHeight,
      columns: config.columns,
      frameStart,
      depth,
      displayWidth,
      displayHeight,
      stepX,
      viewportWidth,
      bufferTiles
    };
  }

  update(scrollX: number) {
    if (!this.config || this.tiles.length === 0) return;

    const buffer = this.config.stepX * this.config.bufferTiles;
    const viewLeft = scrollX - buffer;
    const viewRight = scrollX + this.config.viewportWidth + buffer;

    this.tiles.sort((a, b) => a.x - b.x);

    let left = this.tiles[0];
    let right = this.tiles[this.tiles.length - 1];

    // Recycle de izquierda a derecha
    while (left.x + this.config.displayWidth < viewLeft) {
      const tile = this.tiles.shift();
      if (!tile) break;

      const column = PhaserMath.Between(0, this.config.columns - 1);

      tile.x = Math.round(right.x + this.config.stepX);
      this.applyFrameAndPositions(tile, column);

      this.tiles.push(tile);
      right = tile;
      left = this.tiles[0];
    }

    // Recycle de derecha a izquierda
    while (right.x > viewRight) {
      const tile = this.tiles.pop();
      if (!tile) break;

      const column = PhaserMath.Between(0, this.config.columns - 1);

      tile.x = Math.round(left.x - this.config.stepX);
      this.applyFrameAndPositions(tile, column);

      this.tiles.unshift(tile);
      left = tile;
      right = this.tiles[this.tiles.length - 1];
    }
  }

  getTiles() {
    return this.tiles;
  }

  private createTile(
    x: number,
    column: number,
    options: {
      textureKey: string;
      frameStart: number;
      depth: number;
      displayWidth: number;
      displayHeight: number;
      collisionY: number;
      visualY: number;
    }
  ) {
    // 👇 IMPORTANTE: staticSprite (no staticImage)
    const tile = this.scene.physics.add
      .staticSprite(x, options.visualY, options.textureKey, options.frameStart + column)
      .setOrigin(0, 0)
      .setDepth(options.depth);

    tile.setDisplaySize(options.displayWidth, options.displayHeight);

    // Calcula el body una vez con el size correcto
    tile.refreshBody();

    // 👇 y ahora fijamos el body donde toca (sin offset)
    tile.body.position.x = x;
    tile.body.position.y = options.collisionY;

    return tile;
  }

  private applyFrameAndPositions(tile: Phaser.Types.Physics.Arcade.SpriteWithStaticBody, column: number) {
    if (!this.config) return;

    // Frame y size visual
    tile.setFrame(this.config.frameStart + column);
    tile.setDisplaySize(this.config.displayWidth, this.config.displayHeight);
    tile.setDepth(this.config.depth);

    // 👇 posición VISUAL
    tile.y = this.config.visualY;

    // 👇 posición FÍSICA (body)
    // Ojo: no llamamos refreshBody aquí para que no “arrastre” el body al visualY
    tile.body.position.x = tile.x;
    tile.body.position.y = this.config.collisionY;
  }

  private clear() {
    this.tiles.forEach((tile) => tile.destroy());
    this.tiles = [];
  }
}
