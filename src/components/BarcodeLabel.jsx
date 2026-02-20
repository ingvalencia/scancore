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
    if (largo <= 8) scale = 2.8;
    else if (largo <= 14) scale = 2.4;
    else if (largo <= 18) scale = 2;
    else if (largo <= 22) scale = 1.7;
    else scale = 1.5;

    bwipjs.toCanvas(canvasRef.current, {
      bcid: "code39",
      text: texto,
      scale,
      height: 12,
      includetext: false,
      textxalign: "center",
      backgroundcolor: "FFFFFF",
      paddingwidth: 0,
      paddingheight: 0,
    });
  }, [codigo]);


 return (
  <div className="w-60 h-44 border rounded-lg bg-white relative flex flex-col px-4 py-3 overflow-hidden">

    {/* BLOQUE SUPERIOR - CÓDIGO */}
    <div className="flex flex-col items-center h-[55px]">

      <div className="w-full flex justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ maxWidth: "100%", display: "block" }}
        />
      </div>

      <p className="text-[11px] tracking-wide font-semibold mt-1">
        {codigo}
      </p>

    </div>

    {/* BLOQUE MEDIO - DESCRIPCIÓN */}
    <div className="text-center h-[56px] px-2 overflow-hidden">
      <p
        className="font-semibold text-center break-words"
        style={{
          fontSize: "10.5px",
          lineHeight: "12.5px",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {descripcion}
      </p>
    </div>

    {/* BLOQUE ALMACÉN */}
    <div className="text-center h-[12px] -mt-1">
      <p className="text-[9px] text-gray-600">
        {almacen}
      </p>
    </div>

    {/* FOOTER FIJO - LOGO */}
    <div className="absolute bottom-3 left-0 w-full flex justify-center">
      <img
        src={logo}
        alt="Recórcholis"
        style={{ width: "75px" }}
      />
    </div>

  </div>
);


}
