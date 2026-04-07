import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        this.load.image("white", "https://labs.phaser.io/assets/particles/white.png");
    }

    create() {
        this.scene.start("MenuScene");
    }

    createBackground() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 🌌 Gradient background (top → bottom)
        const graphics = this.add.graphics();

        const colorTop = 0x020617;
        const colorBottom = 0x0f172a;

        graphics.fillGradientStyle(colorTop, colorTop, colorBottom, colorBottom, 1);
        graphics.fillRect(0, 0, width, height);

        // ✨ Particle background
        const particles = this.add.particles(0, 0, "white", {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            speedY: { min: 20, max: 60 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 4000,
            quantity: 2,
            blendMode: "ADD"
        });

        particles.setDepth(-1);
    }
}