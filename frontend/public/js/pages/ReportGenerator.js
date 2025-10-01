// ReportGenerator.js
// Lógica reutilizable para generación y descarga de reportes en cualquier listado
// Uso: importar y llamar a ReportGenerator.generateReport({columns, data, format, filename})

const ReportGenerator = {
	generateReport: function ({
		columns,
		data,
		format = "excel",
		filename = "reporte",
	}) {
		if (format === "csv") {
			const csv = this._toCSV(columns, data);
			this._downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8");
		} else if (format === "excel" || format === "xlsx") {
			const xml = this._toExcelXML(columns, data, filename);
			// SpreadsheetML debe descargarse como .xls para evitar advertencias en Excel
			this._downloadFile(xml, `${filename}.xls`, "application/vnd.ms-excel");
		} else if (format === "pdf") {
			// Usar HTML estilado como en Usuarios para generar/imprimir PDF
			this.generateHTMLPdf({
				title: filename
					.replace(/_/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase()),
				columns,
				data,
				filename,
			});
		} else {
			alert("Formato no soportado");
		}
	},
	generateHTMLPdf: function ({
		title = "Reporte",
		columns = [],
		data = [],
		filename = "reporte",
	}) {
		try {
			const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #1f2937; }
        h1 { color: #39a900; text-align: center; margin-bottom: 8px; }
        .subtitle { text-align: center; color: #6b7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #39a900; color: white; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .header-info { margin-bottom: 10px; font-size: 12px; color: #374151; }
        .footer { margin-top: 12px; font-size: 11px; color: #6b7280; text-align: right; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
    </head>
<body>
    <div class="header-info">
        <div><strong>Fecha:</strong> ${new Date().toLocaleDateString(
					"es-ES"
				)}</div>
        <div><strong>Total de registros:</strong> ${
					Array.isArray(data) ? data.length : 0
				}</div>
    </div>
    <h1>${title}</h1>
    <div class="subtitle">Exportado desde Sistema de Gestión Agrícola</div>
    <table>
        <thead>
            <tr>
                ${columns.map((col) => `<th>${col.header}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
            ${data
							.map(
								(row) => `
                <tr>
                    ${columns
											.map((col) => `<td>${row[col.key] ?? ""}</td>`)
											.join("")}
                </tr>`
							)
							.join("")}
        </tbody>
    </table>
    <div class="footer">Generado por SGAL · ${new Date().toLocaleString(
			"es-ES"
		)}</div>
    <div class="no-print" style="text-align:center;margin-top:12px;">
        <button onclick="window.print()" style="padding:8px 12px;">Imprimir / Guardar como PDF</button>
        <button onclick="window.close()" style="padding:8px 12px;">Cerrar</button>
    </div>
</body>
</html>`;
			const win = window.open("", "_blank");
			if (!win) {
				alert(
					"Bloqueador de ventanas emergentes activo. Permite pop-ups para continuar."
				);
				return;
			}
			win.document.open();
			win.document.write(html);
			win.document.close();
			// auto print after short delay
			setTimeout(() => {
				try {
					win.print();
				} catch (_) {}
			}, 400);
		} catch (e) {
			console.error("Error generando PDF:", e);
			alert("No se pudo generar el PDF.");
		}
	},
	_toCSV: function (columns, data) {
		const header = columns.map((col) => col.header).join(",");
		const rows = data.map((row) =>
			columns.map((col) => row[col.key]).join(",")
		);
		return [header, ...rows].join("\r\n");
	},
	_downloadFile: function (content, filename, mimeType) {
		const blob = new Blob([content], { type: mimeType + ";charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	},
	_toExcelXML: function (columns, data, sheetName = "Reporte") {
		// Limitar y sanear nombre de hoja (máx 31, sin \ / ? * [ ])
		const cleanSheetName =
			String(sheetName)
				.replace(/[\\\/\?\*\[\]]/g, "")
				.slice(0, 31) || "Reporte";

		// Estilos SpreadsheetML
		const styles = `
<Styles>
  <Style ss:ID="Default" ss:Name="Normal">
    <Alignment ss:Vertical="Center"/>
    <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
    <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sHeader">
    <Font ss:Bold="1" ss:Color="#FFFFFF"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    <Interior ss:Color="#39A900" ss:Pattern="Solid"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
    </Borders>
  </Style>
  <Style ss:ID="sRow">
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
    </Borders>
  </Style>
  <Style ss:ID="sAlt">
    <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
    </Borders>
  </Style>
  <Style ss:ID="sNumber">
    <NumberFormat ss:Format="Standard"/>
  </Style>
</Styles>`;

		// Column widths (aproximación según largo del header)
		const colDefs = columns
			.map((col) => {
				const base = Math.max(8, String(col.header || "").length);
				const width = Math.min(60, Math.round(base * 7)); // ancho aprox.
				return `<Column ss:AutoFitWidth="1" ss:Width="${width}"/>`;
			})
			.join("");

		const workbookOpen =
			`<?xml version="1.0"?>\n` +
			`<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">\n${styles}\n`;

		const worksheetOpen = `<Worksheet ss:Name="${this._escapeXml(
			cleanSheetName
		)}">\n<Table>\n${colDefs}`;

		const headerRow = `<Row ss:AutoFitHeight="1">${columns
			.map(
				(col) =>
					`<Cell ss:StyleID="sHeader"><Data ss:Type="String">${this._escapeXml(
						col.header
					)}</Data></Cell>`
			)
			.join("")}</Row>`;

		const rows = Array.isArray(data) ? data : [];
		const isNumber = (v) =>
			typeof v === "number" ||
			(!!v && !isNaN(v) && /^-?\d+(\.\d+)?$/.test(String(v).trim()));
		const dataRows = rows
			.map((row, idx) => {
				const style = idx % 2 === 0 ? "sRow" : "sAlt";
				const cells = columns
					.map((col) => {
						const val = row[col.key];
						if (isNumber(val)) {
							return `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${String(
								val
							).replace(/,/g, "")}</Data></Cell>`;
						}
						return `<Cell ss:StyleID="${style}"><Data ss:Type="String">${this._escapeXml(
							val ?? ""
						)}</Data></Cell>`;
					})
					.join("");
				return `<Row>${cells}</Row>`;
			})
			.join("");

		const tableClose = `</Table>`;
		const worksheetOptions = `
<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
  <FreezePanes/>
  <FrozenNoSplit/>
  <SplitHorizontal>1</SplitHorizontal>
  <TopRowBottomPane>1</TopRowBottomPane>
  <ActivePane>2</ActivePane>
  <Print>
    <ValidPrinterInfo/>
    <FitWidth>1</FitWidth>
    <FitHeight>0</FitHeight>
    <PaperSizeIndex>9</PaperSizeIndex>
  </Print>
</WorksheetOptions>`;

		const worksheetClose = `${worksheetOptions}\n</Worksheet>`;
		const workbookClose = `\n</Workbook>`;

		return (
			workbookOpen +
			worksheetOpen +
			headerRow +
			dataRows +
			tableClose +
			worksheetClose +
			workbookClose
		);
	},
	_escapeXml: function (text) {
		return String(text)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	},
	_toPDF: function (columns, data, filename) {
		// Requiere jsPDF y autoTable (debe estar incluido en el HTML)
		if (
			typeof window.jspdf === "undefined" &&
			typeof window.jsPDF === "undefined"
		) {
			alert("jsPDF y autoTable no están cargados.");
			return;
		}
		const doc = new (window.jspdf?.jsPDF || window.jsPDF)();
		const headers = [columns.map((col) => col.header)];
		const rows = data.map((row) => columns.map((col) => row[col.key]));
		if (doc.autoTable) {
			doc.autoTable({ head: headers, body: rows });
		} else if (window.jspdf && window.jspdf.autoTable) {
			window.jspdf.autoTable(doc, { head: headers, body: rows });
		} else {
			alert("autoTable no está disponible en jsPDF.");
			return;
		}
		doc.save(`${filename}.pdf`);
	},
};

// Exportar para uso con import (ESModules) o global
if (typeof module !== "undefined" && module.exports) {
	module.exports = ReportGenerator;
} else {
	window.ReportGenerator = ReportGenerator;
}
