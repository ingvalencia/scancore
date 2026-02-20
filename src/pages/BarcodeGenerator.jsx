import React, { useState } from "react";
import BarcodeLabel from "../components/BarcodeLabel";
import * as XLSX from "xlsx";

import { useRef } from "react";

function normalizarTexto(texto) {
  return texto
    ?.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export default function BarcodeGenerator() {
  const [fileName, setFileName] = useState("");
  const [dataExcel, setDataExcel] = useState([]);
  const [error, setError] = useState("");
  const [filtroSubfamilia, setFiltroSubfamilia] = useState("todas");
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 30;
  const [modoGeneracion, setModoGeneracion] = useState("ambos");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoGeneracion, setTipoGeneracion] = useState("seleccionados");
  const etiquetasRef = useRef(null);


  const subfamiliasUnicas = [
    "todas",
    ...new Set(dataExcel.map((item) => item.subfamilia).filter(Boolean)),
  ];

  const dataFiltrada =
    filtroSubfamilia === "todas"
      ? dataExcel
      : dataExcel.filter(
          (item) => item.subfamilia === filtroSubfamilia
        );

  const totalPaginas = Math.ceil(dataFiltrada.length / filasPorPagina) || 1;

  const indiceInicio = (paginaActual - 1) * filasPorPagina;
  const indiceFin = indiceInicio + filasPorPagina;
  const datosPagina = dataFiltrada.slice(indiceInicio, indiceFin);

  const toggleSeleccion = (articulo) => {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(articulo)) {
        nuevo.delete(articulo);
      } else {
        nuevo.add(articulo);
      }
      return nuevo;
    });
  };

  const seleccionarTodosPagina = (datosPagina) => {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      const todosSeleccionados = datosPagina.every((d) =>
        nuevo.has(d.articulo)
      );

      if (todosSeleccionados) {
        datosPagina.forEach((d) => nuevo.delete(d.articulo));
      } else {
        datosPagina.forEach((d) => nuevo.add(d.articulo));
      }

      return nuevo;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setPaginaActual(1);
    setSeleccionados(new Set());

    const reader = new FileReader();

    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (rawData.length === 0) {
        setError("El archivo está vacío.");
        return;
      }

      const columnas = Object.keys(rawData[0]).map((c) => c.trim());

      const buscarColumna = (posibles) =>
        columnas.find((col) =>
          posibles.some((p) =>
            normalizarTexto(col).includes(normalizarTexto(p))
          )
        );

      const colArticulo = buscarColumna([
        "num articulo",
        "numero articulo",
        "articulo",
      ]);

      const colCodigo = buscarColumna([
        "codigo barras",
        "codigo de barras",
        "codigo",
      ]);

      const colDescripcion = buscarColumna([
        "descripcion",
      ]);

      const colAlmacen = buscarColumna([
        "almacen",
      ]);

      const colSubfamilia = buscarColumna([
        "subfamilia",
      ]);

      if (
        !colArticulo ||
        !colCodigo ||
        !colDescripcion ||
        !colAlmacen ||
        !colSubfamilia
      ) {
        setError(
          "No se pudieron detectar correctamente las columnas requeridas."
        );
        setDataExcel([]);
        return;
      }

      const datosLimpios = rawData.map((row) => ({
        articulo: row[colArticulo],
        codigo_barras: row[colCodigo],
        descripcion: row[colDescripcion],
        almacen: row[colAlmacen],
        subfamilia: row[colSubfamilia],
      }));

      setDataExcel(datosLimpios);
    };

    reader.readAsBinaryString(file);
  };





  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-slate-900 text-white px-10 py-6 shadow-md">
        <h1 className="text-2xl font-semibold tracking-wide">
          Sistema Generador de Códigos de Barras - GRUPO DINIZ
        </h1>

        <p className="text-sm text-gray-300 mt-1">
          Carga de archivo Excel y generación masiva de etiquetas
        </p>

        <div className="mt-3 text-xs text-gray-400 tracking-wider">
          <p>Versión 1.0</p>
          <p>ÁREA DE TI - DESARROLLO SAP</p>
        </div>
      </header>

      <main className="flex-1 p-10">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="bg-slate-50 border border-gray-200 rounded-2xl p-12 mb-10 shadow-sm">

            <div className="flex flex-col items-center justify-center text-center">

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 tracking-wide">
                  Carga de Archivo Excel
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Selecciona el archivo con la información de artículos para generar etiquetas
                </p>
              </div>

              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="excelUpload"
              />

              <label
                htmlFor="excelUpload"
                className="inline-flex items-center gap-3 bg-slate-900 text-white
                          px-8 py-4 rounded-xl cursor-pointer
                          shadow-md hover:bg-slate-800 transition
                          text-sm font-semibold tracking-wide"
              >
                Seleccionar archivo Excel
              </label>

              {fileName && (
                <div className="mt-6 bg-green-50 border border-green-200
                                rounded-xl px-6 py-3 text-sm text-green-700 font-medium">
                  Archivo cargado correctamente: <span className="font-semibold">{fileName}</span>
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200
                                rounded-xl px-6 py-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

            </div>
          </div>

          {dataExcel.length > 0 && (
            <div className="mt-10">
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                  {/* SUBFAMILIA */}
                  <div>
                    <label className="block text-xs font-bold tracking-[0.15em] text-slate-500 mb-3">
                      SUBFAMILIA
                    </label>

                    <div className="relative">
                      <select
                        value={filtroSubfamilia}
                        onChange={(e) => {
                          setFiltroSubfamilia(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="w-full appearance-none bg-white border border-gray-300
                                  rounded-xl px-5 py-4 text-sm font-medium text-slate-800
                                  shadow-sm transition
                                  focus:outline-none focus:ring-2 focus:ring-slate-900
                                  focus:border-slate-900"
                      >
                        {subfamiliasUnicas.map((sub, i) => (
                          <option key={i} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>

                      {/* Flecha custom */}
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* TIPO GENERACIÓN */}
                  <div>
                    <label className="block text-xs font-bold tracking-[0.15em] text-slate-500 mb-3">
                      TIPO DE CÓDIGO A GENERAR
                    </label>

                    <div className="relative">
                      <select
                        value={modoGeneracion}
                        onChange={(e) => setModoGeneracion(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-300
                                  rounded-xl px-5 py-4 text-sm font-medium text-slate-800
                                  shadow-sm transition
                                  focus:outline-none focus:ring-2 focus:ring-slate-900
                                  focus:border-slate-900"
                      >
                        <option value="articulo">Solo Num. Artículo</option>
                        <option value="codigo">Solo Código de barras</option>

                      </select>

                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">

                    {/* HEADER */}
                    <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-center w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-slate-900 cursor-pointer"
                            onChange={() => {
                              setSeleccionados(prev => {
                                const nuevo = new Set(prev);

                                const todosSeleccionados = dataFiltrada.every(d =>
                                  nuevo.has(d.articulo)
                                );

                                if (todosSeleccionados) {
                                  dataFiltrada.forEach(d => nuevo.delete(d.articulo));
                                } else {
                                  dataFiltrada.forEach(d => nuevo.add(d.articulo));
                                }

                                return nuevo;
                              });
                            }}
                            checked={
                              dataFiltrada.length > 0 &&
                              dataFiltrada.every(d =>
                                seleccionados.has(d.articulo)
                              )
                            }
                          />
                        </th>
                        <th className="px-6 py-4 text-left font-semibold">Num. Artículo</th>
                        <th className="px-6 py-4 text-left font-semibold">Código de barras</th>
                        <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                        <th className="px-6 py-4 text-left font-semibold">Almacén</th>
                        <th className="px-6 py-4 text-left font-semibold">Subfamilia</th>
                      </tr>
                    </thead>

                    {/* BODY */}
                    <tbody className="divide-y divide-gray-100">

                      {datosPagina.map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 transition duration-150"
                        >
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-slate-900 cursor-pointer"
                              checked={seleccionados.has(row.articulo)}
                              onChange={() =>
                                toggleSeleccion(row.articulo)
                              }
                            />
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-800">
                            {row.articulo}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {row.codigo_barras}
                          </td>

                          <td className="px-6 py-4 text-slate-700 max-w-sm truncate">
                            {row.descripcion}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {row.almacen}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
                              {row.subfamilia}
                            </span>
                          </td>
                        </tr>
                      ))}

                    </tbody>
                  </table>
                </div>

              </div>

              <div className="mt-10 flex flex-col items-center gap-5">

                <div className="text-sm font-medium text-slate-600 tracking-wide">
                  Página <span className="font-semibold text-slate-900">{paginaActual}</span>
                  {" "}de{" "}
                  <span className="font-semibold text-slate-900">{totalPaginas}</span>
                </div>

                <div className="flex gap-4">

                  <button
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((p) => p - 1)}
                    className="px-6 py-2 rounded-xl border border-gray-300
                              text-sm font-medium text-slate-700
                              bg-white shadow-sm transition
                              hover:bg-slate-100
                              disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  <button
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((p) => p + 1)}
                    className="px-6 py-2 rounded-xl bg-slate-900 text-white
                              text-sm font-medium shadow-md transition
                              hover:bg-slate-800
                              disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>

                </div>

              </div>

              <div className="mt-12 flex justify-center">

                <button
                  onClick={() => setMostrarModal(true)}
                  className="bg-slate-900 text-white
                            px-10 py-4 rounded-2xl
                            text-sm font-semibold tracking-wide
                            shadow-lg transition duration-200
                            hover:bg-slate-800 hover:shadow-xl
                            active:scale-[0.98]"
                >
                  Generar etiquetas
                </button>

              </div>

              <p className="text-xs text-gray-500 mt-2">
                Total registros cargados: {dataExcel.length}
              </p>
            </div>




          )}
        </div>
      </main>

       {mostrarModal && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white w-[95%] max-w-7xl h-[92%] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            {/* HEADER (NO SE IMPRIME) */}
            <div className="flex items-center justify-between px-10 py-6 border-b border-gray-200 bg-slate-50 no-print">

              <div>
                <h2 className="text-xl font-semibold text-slate-900 tracking-wide">
                  Vista previa de etiquetas
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Revisión antes de impresión
                </p>
              </div>

              <button
                onClick={() => setMostrarModal(false)}
                className="text-slate-500 hover:text-slate-900 text-2xl font-light transition"
              >
                ✕
              </button>

            </div>

            {/* CONTROLES (NO SE IMPRIME) */}
            <div className="flex items-center justify-center px-10 py-6 border-b border-gray-100 no-print">

              <button
                onClick={() => window.print()}
                className="px-8 py-3 rounded-2xl text-sm font-semibold tracking-wide
                          bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
              >
                Imprimir etiquetas
              </button>

            </div>

            {/* CONTENIDO (SÍ SE IMPRIME) */}
            <div className="flex-1 overflow-auto bg-gray-100 px-10 py-10 print-area">

              <div ref={etiquetasRef}>
                {(tipoGeneracion === "seleccionados"
                  ? dataExcel.filter(item => seleccionados.has(item.articulo))
                  : dataFiltrada
                )
                  .reduce((pages, item) => {
                    const etiquetas = [];

                    if (modoGeneracion === "articulo" || modoGeneracion === "ambos") {
                      etiquetas.push({
                        key: `${item.articulo}-art`,
                        codigo: item.articulo,
                        descripcion: item.descripcion,
                        almacen: item.almacen,
                      });
                    }

                    if (modoGeneracion === "codigo" || modoGeneracion === "ambos") {
                      etiquetas.push({
                        key: `${item.articulo}-cod`,
                        codigo: item.codigo_barras,
                        descripcion: item.descripcion,
                        almacen: item.almacen,
                      });
                    }

                    etiquetas.forEach(e => {
                      if (pages.length === 0 || pages[pages.length - 1].length === 12) {
                        pages.push([]);
                      }
                      pages[pages.length - 1].push(e);
                    });

                    return pages;
                  }, [])
                  .map((page, pageIndex) => (
                    <div
                      key={pageIndex}
                      className="bg-white mx-auto mb-16 shadow-lg rounded-xl"
                      style={{
                        width: "210mm",
                        minHeight: "297mm",
                        padding: "15mm",
                        boxSizing: "border-box"
                      }}
                    >
                      <div className="grid grid-cols-3 gap-6">
                        {page.map(label => (
                          <BarcodeLabel
                            key={label.key}
                            codigo={label.codigo}
                            descripcion={label.descripcion}
                            almacen={label.almacen}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

            </div>

          </div>

        </div>
      )}

      <style>
    {`
    @media print {

      @page {
        size: A4;
        margin: 0;
      }

      body {
        margin: 0;
      }

      body * {
        visibility: hidden;
      }

      .print-area, .print-area * {
        visibility: visible;
      }

      .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 210mm;
        min-height: 297mm;
      }

      .no-print {
        display: none !important;
      }

      header, footer {
        display: none !important;
      }

    }
    `}
    </style>



    </div>


  );




}
