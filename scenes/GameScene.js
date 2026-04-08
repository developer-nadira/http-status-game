import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }


    preload() {
        this.load.image("white", "https://labs.phaser.io/assets/particles/white.png");
    }

    createBackground() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 🌌 Gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x020617, 0x020617, 0x0f172a, 0x0f172a, 1);
        graphics.fillRect(0, 0, width, height);

        // 🔵 Data flow
        this.add.particles(0, 0, "white", {
            x: 0,
            y: { min: 0, max: height },
            speedX: { min: 80, max: 120 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 3000,
            quantity: 0.7,
            frequency: 80,
            tint: 0x38bdf8
        }).setDepth(0);

        // 💚 Depth layer
        this.add.particles(0, 0, "white", {
            x: width,
            y: { min: 0, max: height },
            speedX: { min: -60, max: -100 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 4000,
            quantity: 0.4,
            frequency: 120,
            tint: 0x22c55e
        }).setDepth(0);
    }

    create() {

        this.scale.on("resize", () => {
            this.scene.restart();
        });

        this.width = this.scale.width;
        this.height = this.scale.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.device =
            this.width < 500 ? "mobile" :
                this.width < 900 ? "tablet" : "desktop";

        this.answered = false;

        this.createBackground();

        // 🟦 PANEL (fixed)
        const panelWidth = this.device === "mobile" ? this.width * 0.9 : this.width * 0.6;
        const panelHeight = this.device === "mobile" ? this.height * 0.6 : this.height * 0.5;

        this.panel = this.add.rectangle(
            this.centerX,
            this.centerY,
            panelWidth,
            panelHeight,
            0x020617,
            0.9
        ).setStrokeStyle(2, 0x38bdf8).setDepth(1);


        // 💯 Score
        this.questions = [
            { text: "Page Not Found", answer: "404" },
            { text: "Success", answer: "200" },
            { text: "Server Error", answer: "500" },
            { text: "Unauthorized Access", answer: "401" }
        ];

        this.score = 0;
        this.totalScore = this.questions.length * 10;

        this.scoreText = this.add.text(20, 20, `Score: 0 / ${this.totalScore}`, {
            fontSize: "20px",
            color: "#ffffff"
        }).setDepth(1);

        this.currentIndex = 0;

        // 🧠 Question
        const topOffset = this.device === "mobile" ? 120 : 180;

        this.question = this.add.text(this.centerX, this.centerY - topOffset, "", {
            fontSize:
                this.device === "mobile" ? "20px" :
                    this.device === "tablet" ? "28px" : "36px",
            color: "#38bdf8",
            fontStyle: "bold"


        }).setOrigin(0.5).setDepth(1);

        // 🎯 Drop zone
        const dropW = this.device === "mobile" ? 160 : 260;
        const dropH = this.device === "mobile" ? 80 : 130;

        this.dropZone = this.add.zone(
            this.centerX,
            this.centerY,
            dropW,
            dropH
        ).setRectangleDropZone(dropW, dropH).setDepth(1);

        this.dropBox = this.add.rectangle(
            this.centerX,
            this.centerY,
            dropW,
            dropH
        ).setStrokeStyle(2, 0x22c55e).setDepth(1);

        this.add.text(this.centerX, this.centerY, "DROP HERE", {
            fontSize: this.device === "mobile" ? "14px" : "20px",
            color: "#22c55e"
        }).setOrigin(0.5).setDepth(2);

        this.loadQuestion();

        // 🎮 Drag
        this.input.on("drag", (pointer, obj, x, y) => {
            obj.x = x;
            obj.y = y;
        });

        // 🎮 Drop
        this.input.on("drop", (pointer, gameObject) => {
            if (this.answered) return;

            this.answered = true;

            if (gameObject.getData("correct")) {
                this.handleCorrect(gameObject);
            } else {
                this.handleWrong(gameObject);
            }
        });

        this.input.on("dragend", (pointer, obj, dropped) => {
            if (!dropped && !this.answered) {
                obj.x = obj.startX;
                obj.y = obj.startY;
            }
        });

        // 🎮 Drag start (ONLY ONCE)
        this.input.on("dragstart", (pointer, obj) => {
            this.tweens.killTweensOf(obj);

            this.tweens.add({
                targets: obj,
                scale: 1.1,
                duration: 120,
                ease: "power1.out"
            });
        });

        // 🎮 Drag end (ONLY ONCE)
        this.input.on("dragend", (pointer, obj) => {
            this.tweens.killTweensOf(obj);

            this.tweens.add({
                targets: obj,
                scale: 1,
                duration: 120,
                ease: "power1.out"
            });
        });
    }

    // 🔄 Next
    nextQuestion() {
        this.answered = false;
        this.currentIndex++;

        if (this.currentIndex < this.questions.length) {
            this.loadQuestion();
        } else {
            this.scene.start("ResultScene", { score: this.score });
        }
    }

    // ✅ Correct
    handleCorrect(obj) {
        obj.setTint(0x22c55e);

        this.tweens.add({
            targets: obj,
            scale: 1.2,
            duration: 200,
            yoyo: true
        });

        this.score += 10;
        this.updateScoreUI();

        this.time.delayedCall(800, () => this.nextQuestion());

        this.draggables.forEach(obj => {
            obj.disableInteractive(); // ✅ stops hover + drag
        });
    }

    updateScoreUI() {
        const percent = Math.floor((this.score / this.totalScore) * 100);
        this.scoreText.setText(`Score: ${this.score}/${this.totalScore} (${percent}%)`);
    }

    // ❌ Wrong
    handleWrong(obj) {
        obj.setTint(0xef4444);

        this.tweens.add({
            targets: obj,
            x: obj.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 3
        });

        this.showCorrectAnswer();

        this.time.delayedCall(1000, () => this.nextQuestion());

        this.draggables.forEach(obj => {
            obj.disableInteractive(); // ✅ stops hover + drag
        });
    }

    showCorrectAnswer() {
        const correct = this.questions[this.currentIndex].answer;

        this.draggables.forEach(opt => {
            if (opt.code === correct) {
                opt.setTint(0x22c55e);
            }
        });
    }

    loadQuestion() {
        const q = this.questions[this.currentIndex];
        this.question.setText(q.text);

        this.createDraggables();
    }

    createDraggables() {
        const correct = this.questions[this.currentIndex].answer;

        const all = ["200", "201", "204", "400", "401", "403", "404", "500"];
        const wrong = all.filter(c => c !== correct);

        Phaser.Utils.Array.Shuffle(wrong);

        const selected = wrong.slice(0, 3);
        selected.push(correct);
        Phaser.Utils.Array.Shuffle(selected);

        if (this.draggables) {
            this.draggables.forEach(d => d.destroy());
        }

        const spacing = this.device === "mobile" ? 70 : 120;

        this.draggables = selected.map((code, i) => {
            const x = this.centerX - spacing * 1.5 + i * spacing;
            const y = this.centerY + (this.device === "mobile" ? 120 : 180);

            const obj = this.add.text(x, y, code, {
                fontSize: this.device === "mobile" ? "18px" : "26px",
                backgroundColor: "#1e293b",
                padding: { x: 16, y: 10 },
                color: "#ffffff"
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true }) // ✅ pointer cursor
                .setDepth(2);

            // 🖱️ HOVER IN
            obj.on("pointerover", () => {

                if (obj.input.dragState !== 0) return; // 🚫 skip if dragging
                obj.setStyle({ backgroundColor: "#334155" });
                obj.setTint(0x38bdf8);

                this.tweens.killTweensOf(obj); // ✅ ADD THIS

                this.tweens.add({
                    targets: obj,
                    scale: 1.05,
                    duration: 100
                });
            });

            // 🖱️ HOVER OUT
            obj.on("pointerout", () => {
                obj.setStyle({ backgroundColor: "#1e293b" });
                obj.clearTint();
                this.tweens.killTweensOf(obj); // ✅ ADD

                this.tweens.add({
                    targets: obj,
                    scale: 1,
                    duration: 100
                });
            });


            obj.code = code;
            obj.startX = x;
            obj.startY = y;

            obj.setData("correct", code === correct);

            this.input.setDraggable(obj);

            return obj;
        });
    }
}