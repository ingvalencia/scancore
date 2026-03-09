import React, { useEffect, useRef } from "react";
import bwipjs from "bwip-js";
import logo from "../assets/logo-recorcholis.png";

export default function BarcodeLabel({ codigo, descripcion, almacen, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const texto = String(codigo);
    const largo = texto.length;

    let scale = 2;
    if (largo <= 8) scale = 2.6;
    else if (largo <= 14) scale = 2.2;
    else if (largo <= 18) scale = 2;
    else if (largo <= 22) scale = 1.7;
    else scale = 1.5;

    bwipjs.toCanvas(canvasRef.current, {
      bcid: "code39",
      text: texto,
      scale,
      height: 10,
      includetext: false,
      textxalign: "center",
      backgroundcolor: "FFFFFF",
      paddingwidth: 0,
      paddingheight: 0,
    });
  }, [codigo]);

  return (
    <div
      className={`border rounded-lg bg-white relative flex flex-col items-center justify-between ${className}`}
      style={{
        width: "58mm",
        height: "45mm",
        padding: "4mm",
        boxSizing: "border-box",
      }}
    >
     
      <div style={{ width: "100%", textAlign: "center" }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "30px",
            display: "block",
            margin: "0 auto",
          }}
        />

        <p
          style={{
            fontSize: "10px",
            fontWeight: "600",
            marginTop: "2px",
            letterSpacing: "0.5px",
          }}
        >
          {codigo}
        </p>
      </div>


      <div
        style={{
          textAlign: "center",
          fontSize: "9px",
          lineHeight: "11px",
          height: "28px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {descripcion}
      </div>


      <div style={{ fontSize: "8px", color: "#666" }}>
        {almacen}
      </div>


      <div
        style={{
          position: "absolute",
          bottom: "3mm",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src={logo}
          alt="Recórcholis"
          style={{ width: "60px" }}
        />
      </div>
    </div>
  );
}
