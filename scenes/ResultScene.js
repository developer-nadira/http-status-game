import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js";

export default class ResultScene extends Phaser.Scene {
    constructor() {
        super("ResultScene");
    }

    init(data) {
        this.score = data.score || 0;
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
        const width = this.scale.width;
        const height = this.scale.height;

        const centerX = width / 2;
        const centerY = height / 2;

        const device = width < 500 ? "mobile" :
            width < 900 ? "tablet" : "desktop";

        // 🎨 Background
        this.cameras.main.setBackgroundColor("#020617");

        // 💎 Panel
        const panel = this.add.rectangle(
            centerX,
            centerY,
            device === "mobile" ? width * 0.9 : width * 0.6,
            device === "mobile" ? height * 0.6 : height * 0.5,
            0x020617,
            0.9
        ).setStrokeStyle(2, 0x38bdf8);

        // 🎉 Title
        const title = this.add.text(centerX, centerY - 120, "Game Over", {
            fontSize: device === "mobile" ? "24px" : "32px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // ✨ Title animation
        this.tweens.add({
            targets: title,
            alpha: 0.6,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 🏆 Score text
        const scoreText = this.add.text(centerX, centerY - 20, `Score: ${this.score}`, {
            fontSize: device === "mobile" ? "28px" : "36px",
            color: "#22c55e",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // 💥 Score pop animation
        scoreText.setScale(0);

        this.tweens.add({
            targets: scoreText,
            scale: 1,
            duration: 400,
            ease: "Back.Out"
        });

        // 🎮 PLAY AGAIN BUTTON
        const button = this.add.text(centerX, centerY + 100, "PLAY AGAIN", {
            fontSize: device === "mobile" ? "18px" : "24px",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            padding: { x: 25, y: 12 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        // 🔵 Hover effect
        button.on("pointerover", () => {
            this.tweens.add({
                targets: button,
                scale: 1.15,
                duration: 150,
                ease: "Power2"
            });
        });

        button.on("pointerout", () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 150
            });
        });

        button.on("pointerdown", () => {
            this.tweens.add({
                targets: button,
                scale: 0.9,
                duration: 100,
                yoyo: true
            });
        });

        // 🎯 Click
        button.on("pointerdown", () => {
            this.cameras.main.flash(200, 255, 255, 255);

            this.time.delayedCall(200, () => {
                this.scene.start("MenuScene");
            });
        });

        // 🔄 Resize handling
        this.scale.on("resize", () => {
            this.scene.restart({ score: this.score });
        });
    }
}