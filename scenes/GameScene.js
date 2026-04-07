import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
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
        this.add.circle(this.centerX, this.centerY, 300, 0x38bdf8, 0.05);
    }

    create() {

        this.createBackground();
        // 📱 Responsive base
        this.width = this.scale.width;
        this.height = this.scale.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // 🎯 Device type
        this.device = this.width < 500 ? "mobile" :
            this.width < 900 ? "tablet" : "desktop";

        // 🎨 Background
        this.cameras.main.setBackgroundColor("#020617");

        // 💯 Score
        this.score = 0;
        this.scoreText = this.add.text(20, 20, "Score: 0", {
            fontSize: this.device === "mobile" ? "16px" : "20px",
            color: "#94a3b8"
        });

        // 🧠 Questions
        this.questions = [
            { text: "Page Not Found", answer: "404" },
            { text: "Success", answer: "200" },
            { text: "Server Error", answer: "500" },
            { text: "Unauthorized Access", answer: "401" },
            { text: "Forbidden", answer: "403" },
            { text: "Bad Request", answer: "400" },
            { text: "Created Successfully", answer: "201" },
            { text: "No Content", answer: "204" },
            { text: "Gateway Timeout", answer: "504" },
            { text: "Service Unavailable", answer: "503" }
        ];

        this.currentIndex = 0;

        // 💎 Panel
        let panelWidth = this.device === "mobile" ? this.width * 0.85 :
            this.device === "tablet" ? this.width * 0.8 :
                this.width * 0.6;

        let panelHeight = this.device === "mobile" ? this.height * 0.85 :
            this.height * 0.7;

        this.panel = this.add.rectangle(
            this.centerX,
            this.centerY,
            panelWidth,
            panelHeight,
            0x020617,
            0.9
        ).setStrokeStyle(2, 0x38bdf8);

        // 🧾 Question
        let fontSize = this.device === "mobile" ? "20px" :
            this.device === "tablet" ? "24px" : "28px";

        // ✅ Create text FIRST
        this.question = this.add.text(
            this.centerX,
            this.centerY - panelHeight / 2 + 70,
            "",
            {
                fontSize: fontSize,
                color: "#38bdf8",
                align: "center",
                wordWrap: { width: panelWidth * 0.8 }
            }
        ).setOrigin(0.5);

        // ✅ THEN apply animation
        this.tweens.add({
            targets: this.question,
            alpha: { from: 1, to: 0.6 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        // 📦 Drop Zone
        const dropW = this.device === "mobile" ? 160 : 220;
        const dropH = this.device === "mobile" ? 80 : 110;

        this.dropZone = this.add.zone(
            this.centerX,
            this.centerY - 40,
            dropW,
            dropH
        ).setRectangleDropZone(dropW, dropH);

        this.dropBox = this.add.rectangle(
            this.centerX,
            this.centerY - 40,
            dropW,
            dropH
        ).setStrokeStyle(2, 0x22c55e);

        this.add.text(this.centerX, this.centerY - 40, "DROP HERE", {
            fontSize: this.device === "mobile" ? "14px" : "18px",
            color: "#22c55e"
        }).setOrigin(0.5);

        // Load first
        this.loadQuestion();

        // 🎮 Drag
        this.input.on("drag", (pointer, obj, x, y) => {
            obj.x = x;
            obj.y = y;
        });

        this.input.on("drop", (pointer, obj, target) => {
            if (target === this.dropZone) {
                this.checkAnswer(obj);
            }
        });

        this.input.on("dragend", (pointer, obj, dropped) => {
            if (!dropped) {
                obj.x = obj.startX;
                obj.y = obj.startY;
            }
        });

        // 🔄 Resize
        this.scale.on("resize", () => {
            this.scene.restart();
        });
    }

    // 🔄 Load question
    loadQuestion() {
        const q = this.questions[this.currentIndex];
        this.question.setText(q.text);

        if (this.feedbackText) {
            this.feedbackText.destroy();
        }

        this.createDraggables();

        // ✨ animation
        this.tweens.add({
            targets: this.question,
            alpha: 0,
            duration: 150,
            yoyo: true
        });
    }

    // 🎯 Options
    createDraggables() {
        const correct = this.questions[this.currentIndex].answer;

        const all = ["200", "201", "204", "400", "401", "403", "404", "500", "503", "504"];
        const wrong = all.filter(c => c !== correct);

        Phaser.Utils.Array.Shuffle(wrong);

        const selected = wrong.slice(0, 3);
        selected.push(correct);
        Phaser.Utils.Array.Shuffle(selected);

        if (this.draggables) {
            this.draggables.forEach(d => d.destroy());
        }

        // 📐 Grid layout
        const cols = this.device === "mobile" ? 2 :
            this.device === "tablet" ? 3 : 4;

        // const spacingX = this.width / (cols + 1);
        // const spacingY = 70;

        this.draggables = selected.map((code, i) => {
            let col = i % cols;
            let row = Math.floor(i / cols);

            // let x = spacingX * (col + 1);
            // let y = this.centerY + 120 + row * spacingY;

            // const obj = this.add.text(x, y, code, {
            //     fontSize: this.device === "mobile" ? "18px" : "22px",
            //     backgroundColor: "#334155",
            //     padding: { x: 16, y: 10 },
            //     color: "#ffffff"
            // })
            //     .setOrigin(0.5)
            //     .setInteractive();

            const spacing = this.device === "mobile" ? 70 : 120;

            const x = this.centerX - spacing * 1.5 + i * spacing;
            const y = this.centerY + 100;

            const obj = this.add.text(x, y, code, {
                fontSize: "24px",
                backgroundColor: "#1e293b",
                padding: { x: 16, y: 10 },
                color: "#ffffff"
            }).setOrigin(0.5).setInteractive();

            obj.code = code;
            obj.startX = obj.x;
            obj.startY = obj.y;

            // ✨ hover
            obj.on("pointerover", () => obj.setStyle({ backgroundColor: "#334155" }));
            obj.on("pointerout", () => obj.setStyle({ backgroundColor: "#1e293b" }));

            this.input.setDraggable(obj);

            return obj;
        });
    }

    // ✅ Check answer
    checkAnswer(obj) {
        const correct = this.questions[this.currentIndex].answer;

        if (this.feedbackText) this.feedbackText.destroy();

        if (obj.code === correct) {
            this.score++;
            this.scoreText.setText("Score: " + this.score);

            this.feedbackText = this.add.text(this.centerX, this.centerY + 40, "Correct!", {
                fontSize: "26px",
                color: "#22c55e"
            }).setOrigin(0.5);

            this.currentIndex++;

            if (this.currentIndex < this.questions.length) {
                this.time.delayedCall(700, () => this.loadQuestion());
            } else {
                this.time.delayedCall(800, () => {
                    this.scene.start("ResultScene", { score: this.score });
                });
            }

        } else {
            this.feedbackText = this.add.text(this.centerX, this.centerY + 40, "Wrong!", {
                fontSize: "26px",
                color: "#ef4444"
            }).setOrigin(0.5);

            // ❌ shake
            this.tweens.add({
                targets: obj,
                x: obj.x + 10,
                yoyo: true,
                repeat: 3,
                duration: 50
            });

            obj.x = obj.startX;
            obj.y = obj.startY;
        }
    }
}