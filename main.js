import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js";

import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import ResultScene from "./scenes/ResultScene.js";

const config = {
    type: Phaser.AUTO,

    backgroundColor: "#020617",

    scale: {
        mode: Phaser.Scale.RESIZE, // 🔥 TRUE responsive
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: "arcade"
    },

    scene: [BootScene, MenuScene, GameScene, ResultScene]
};

const game = new Phaser.Game(config);

// Optional: global resize debug
window.addEventListener("resize", () => {
    console.log("Resized:", window.innerWidth, window.innerHeight);
});