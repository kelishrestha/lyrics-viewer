import { useEffect } from "react";

const width = 350;
const height = 125;
const barScale = 1;
const dataScale = 0.5;

const Visualizer = ({ analyser, source }: { analyser: AnalyserNode | null, source: any }) => {
  useEffect(() => {
    if (!analyser || !source) return;
    const container = document.querySelector("#canvasWrapper");
    const oldCanvas = document.querySelector("#canvasWrapper canvas");
    if (oldCanvas) oldCanvas.remove();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    container?.appendChild(canvas);

    const ctx = canvas?.getContext("2d");

    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    const barWidth = (width / bufferLength) * barScale;
    let barHeight;
    let x;

    function renderFrame() {
      if(!ctx) return
      if(!analyser) return

      requestAnimationFrame(renderFrame);
      x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#030816";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * dataScale;

        const t = i / bufferLength;
        const r = (1 - t) * 255 + t * 2;
        const g = (1 - t) * 238 + t * 215;
        const b = (1 - t) * 8 + t * 242;

        ctx.fillStyle =
          "rgb(" +
          Math.floor(r) +
          "," +
          Math.floor(g) +
          "," +
          Math.floor(b) +
          ")";

        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }

    renderFrame();
  }, [analyser, source]);

  return <div id="canvasWrapper" />;
};

export default Visualizer;
