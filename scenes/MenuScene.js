import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
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

    create() {

        this.createBackground();
        // 📱 Responsive center
        const width = this.scale.width;
        const height = this.scale.height;

        const centerX = width / 2;
        const centerY = height / 2;

        // 🎨 Background
        this.cameras.main.setBackgroundColor("#020617");

        // ✨ Glow panel (premium look)
        const panelWidth = width * 0.7;
        const panelHeight = height * 0.5;

        const panel = this.add.rectangle(
            centerX,
            centerY,
            panelWidth,
            panelHeight,
            0x020617,
            0.9
        ).setStrokeStyle(2, 0x38bdf8);

        // ✅ FIXED INNER PANEL
        this.innerPanel = this.add.rectangle(
            centerX,
            centerY,
            panelWidth * 0.85,
            panelHeight * 0.7,
            0x020617,
            0.95
        ).setStrokeStyle(1, 0x38bdf8);

        // 🌟 Title
        const title = this.add.text(centerX, centerY - 80, "HTTP: Living Internet", {
            fontSize: width < 500 ? "22px" : "32px",
            color: "#e2e8f0",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // ✨ Title glow animation
        this.tweens.add({
            targets: title,
            alpha: 0.6,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 🎮 START BUTTON
        const button = this.add.text(centerX, centerY + 40, "START", {
            fontSize: width < 500 ? "20px" : "26px",
            backgroundColor: "#22c55e",
            color: "#ffffff",
            padding: { x: 30, y: 15 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        // 🟢 Hover effect
        button.on("pointerover", () => {
            button.setStyle({ backgroundColor: "#16a34a" });
            this.tweens.add({
                targets: button,
                scale: 1.1,
                duration: 150
            });
        });

        button.on("pointerout", () => {
            button.setStyle({ backgroundColor: "#22c55e" });
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 150
            });
        });

        // 🎯 Click effect
        button.on("pointerdown", () => {
            this.cameras.main.flash(200, 255, 255, 255);

            this.time.delayedCall(200, () => {
                this.scene.start("GameScene");
            });
        });

        // 📱 Resize handling
        this.scale.on("resize", () => {
            this.scene.restart();
        });
    }
}