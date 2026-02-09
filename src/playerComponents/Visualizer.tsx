import { useEffect, useRef } from "react";

const barScale = 1;
const dataScale = 0.8;

const Visualizer = ({
  analyser,
  source,
}: {
  analyser: AnalyserNode | null;
  source: any;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!analyser || !source || !wrapperRef.current) return;

    // cleanup old canvas
    if (canvasRef.current) {
      canvasRef.current.remove();
    }

    const canvas = document.createElement("canvas");
    canvasRef.current = canvas;
    wrapperRef.current.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let width = 0;
    let height = 0;
    let barWidth = 0;
    let animationId: number;

    const resizeCanvas = () => {
      const rect = wrapperRef.current!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      barWidth = (width / bufferLength) * barScale;
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrapperRef.current);
    resizeCanvas();

    function renderFrame() {
      animationId = requestAnimationFrame(renderFrame);
      if (!analyser || !source) return;

      analyser.getByteFrequencyData(dataArray);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#030816";
      ctx.fillRect(0, 0, width, height);

      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * dataScale;

        const t = i / bufferLength;
        const r = (1 - t) * 255 + t * 2;
        const g = (1 - t) * 238 + t * 215;
        const b = (1 - t) * 8 + t * 242;

        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }

    renderFrame();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      canvas.remove();
    };
  }, [analyser, source]);

  return (
    <div
      ref={wrapperRef}
      id="canvasWrapper"
      className="w-full h-30 md:h-40 lg:h-50"
    />
  );
};

export default Visualizer;
