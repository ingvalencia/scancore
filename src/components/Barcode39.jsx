import React, { useEffect, useRef } from "react";
import bwipjs from "bwip-js";


function normalizarCode39(value = "") {
  return String(value).toUpperCase().replace(/[^A-Z0-9 \-.\$\/\+%]/g, "");
}

export default function Barcode39({
  value = "ABC123",
  scale = 3,
  height = 12,
  includetext = true,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const clean = normalizarCode39(value);

    try {
      bwipjs.toCanvas(canvas, {
        bcid: "code39",
        text: clean,
        scale,
        height,
        includetext,
        textxalign: "center",
      });
    } catch (e) {
      
      const ctx = canvas.getContext("2d");
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value, scale, height, includetext]);

  return <canvas ref={canvasRef} />;
}
