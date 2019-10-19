var game;
var viewSize = 512;

var ready = 1;

// assetMgr.queueDownload("./sprites/file.png");

// assetMgr.downloadAll(function() {
//     // console.log("Done loading image assets");
//     createSprites();
// });

// function createSprites() {
//     var frameduration = 0.15;

//     //createSprite(name, frameWidth, frameHeight, layers, frameduration, frames)

//     // console.log("Done creating sprites");
//     setReady();
// }

document.addEventListener("DOMContentLoaded", setReady);

function setReady() {
    if (ready == 1) {
        start();
    }
    ready++;
}


function start() {
    // Game canvas
    var canvas = document.getElementById("canvas");
    canvas.width = viewSize;
    canvas.height = viewSize;
    // canvas.style.background = '#3C6';
    canvas.style.background = '#000';
    canvas.style.imageRendering = "Pixelated";
    canvas.style.backgroundRepeat = "no-repeat";
    var ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = false;

    // UI canvas
    var uiCanvas = document.getElementById("uiCanvas");
    uiCanvas.width = viewSize;
    uiCanvas.height = viewSize;
    uiCanvas.style.imageRendering = "Pixelated";
    var uiCtx = uiCanvas.getContext('2d', { alpha: true });
    uiCtx.imageSmoothingEnabled = false;

    game = new GameEngine(ctx, uiCtx);
    game.init();
    // controls.init();
}