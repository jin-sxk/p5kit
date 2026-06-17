import p5 from "p5";
import { installP5KitGlobal } from "@p5kit/core";
import "./styles.css";

const p5kit = installP5KitGlobal();

new p5((sketch) => {
  let hue = 190;

  sketch.setup = () => {
    sketch.pixelDensity(1);
    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.colorMode(sketch.HSB, 360, 100, 100, 100);
    sketch.noStroke();
  };

  sketch.draw = () => {
    sketch.background(12, 20, 12);
    hue = (hue + 0.6) % 360;

    const radius = Math.min(sketch.width, sketch.height) * 0.18;
    const x = sketch.width * 0.5 + Math.cos(sketch.frameCount * 0.02) * radius;
    const y = sketch.height * 0.5 + Math.sin(sketch.frameCount * 0.025) * radius;

    sketch.fill(hue, 72, 94, 90);
    sketch.circle(x, y, radius);
    sketch.fill((hue + 42) % 360, 68, 96, 70);
    sketch.circle(sketch.mouseX || sketch.width * 0.5, sketch.mouseY || sketch.height * 0.5, radius * 0.48);
  };

  sketch.mousePressed = () => {
    p5kit.vibrate(18).catch(() => {});
    return false;
  };

  sketch.windowResized = () => {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
  };
}, document.getElementById("app"));
