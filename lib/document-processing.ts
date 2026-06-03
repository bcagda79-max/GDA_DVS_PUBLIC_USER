import bwipjs from "bwip-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";
import fs from "fs";
import path from "path";

export type ProcessedDocument = {
  buffer: Uint8Array;
  contentType: string;
  fileName: string;
  barcodeBuffer: Uint8Array;
  documentId: string;
};

type DocumentKind = "pdf" | "docx";

// Known department codes
const knownDepartmentCodes: Record<string, string> = {
  BCA: "BCA",
  Admin: "ADM",
  Administration: "SADM",
  Technical: "TECH",
  Tourism: "TOUR",
  Accounts: "ACC",
  General: "GEN",
};

export type Department = string;

/**
 * Derives a short barcode prefix from any department name.
 * Uses the known map first, otherwise takes first 3 uppercase letters.
 */
const getDeptCode = (department: string): string => {
  if (knownDepartmentCodes[department]) return knownDepartmentCodes[department];
  // Take first 3 alphanumeric characters, uppercase
  const code = department.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
  return code || "GDA";
};

export const generateDocumentId = (department: string) => {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GDA-${getDeptCode(department)}-${new Date().getFullYear()}-${random}`;
};

export const getFileExtension = (fileName: string) => {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
};

const createBarcodeBuffer = async (documentId: string) => {
  return bwipjs.toBuffer({
    bcid: "code128",
    text: documentId,
    scale: 2,
    height: 10,
    includetext: false,
    backgroundcolor: "FFFFFF",
  });
};

const buildOutputName = (fileName: string, documentId: string) => {
  const extension = getFileExtension(fileName);
  const baseName = fileName.replace(new RegExp(`\\.${extension}$`, "i"), "");
  return `${baseName}_${documentId}_stamped.${extension}`;
};

const stampPdf = async (input: ArrayBuffer, barcodeBuffer: Buffer, documentId: string) => {
  const pdfDoc = await PDFDocument.load(input);
  const barcodeImage = await pdfDoc.embedPng(barcodeBuffer);
  // Try to embed a light watermark/logo on every page if available
  let logoImage: any = null;
  try {
    const logoPath = path.resolve(process.cwd(), "public", "gda_logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBuf = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBuf);
      try {
        // eslint-disable-next-line no-console
        console.log("stampPdf: embedded logo image for watermark");
      } catch {}
    }
  } catch (e) {
    // ignore watermark on failure
    try {
      // eslint-disable-next-line no-console
      console.error(
        "stampPdf: logo embed failed",
        e instanceof Error ? e.stack || e.message : String(e),
      );
    } catch {}
  }
  const firstPage = pdfDoc.getPages()[0];

  if (!firstPage) {
    throw new Error("The uploaded PDF does not contain any pages.");
  }

  const pageWidth = firstPage.getWidth();
  const pageHeight = firstPage.getHeight();
  const naturalSize = barcodeImage.scale(1);
  const maxWidth = Math.min(pageWidth * 0.28, 180);
  const maxHeight = 36;
  const scale = Math.min(maxWidth / naturalSize.width, maxHeight / naturalSize.height, 1);
  const drawWidth = naturalSize.width * scale;
  const drawHeight = naturalSize.height * scale;
  const drawX = pageWidth - drawWidth - 18;
  const drawY = pageHeight - drawHeight - 14;

  firstPage.drawImage(barcodeImage, {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
  });

  if (logoImage) {
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      try {
        const pw = page.getWidth();
        const ph = page.getHeight();

        // Aim for a large centered watermark occupying ~70% of page width
        const natural = logoImage.scale(1);
        const targetWidth = pw * 0.7;
        const scale = Math.min(targetWidth / natural.width, 1);
        const w = natural.width * scale;
        const h = natural.height * scale;
        const x = (pw - w) / 2;
        const y = (ph - h) / 2;

        // Try drawing with low opacity; if that option isn't supported, fallback to drawing without opacity.
        try {
          page.drawImage(logoImage, { x, y, width: w, height: h, opacity: 0.08 });
        } catch (drawErr) {
          try {
            // eslint-disable-next-line no-console
            console.warn(
              "stampPdf: drawImage with opacity failed, falling back to draw without opacity",
              drawErr instanceof Error ? drawErr.stack || drawErr.message : String(drawErr),
            );
          } catch {}
          page.drawImage(logoImage, { x, y, width: w, height: h });
        }
      } catch {
        // ignore drawing failures
        try {
          // eslint-disable-next-line no-console
          console.error("stampPdf: failed to draw logo on page", (new Error()).stack);
        } catch {}
      }
    }
  }

  // Draw the document ID below the barcode for human-readable verification
  try {
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const textSize = 9;
    const textY = drawY - (textSize + 4);

    firstPage.drawText(documentId, {
      x: drawX,
      y: textY,
      size: textSize,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  } catch {
    // If font embedding fails, continue without text.
  }

  return pdfDoc.save();
};

const makeImageParagraph = (
  relationshipId: string,
  docPrId: number,
  widthEmu: number,
  heightEmu: number,
  documentId?: string,
) => {
  return `
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
        <w:spacing w:before="0" w:after="48"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
            <wp:docPr id="${docPrId}" name="GDAVS Barcode"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="${docPrId}" name="GDAVS Barcode"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${relationshipId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="${widthEmu}" cy="${heightEmu}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
  `.trim() +
    (documentId
      ? `
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
        <w:rPr>
          <w:sz w:val="18"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:t>${documentId}</w:t>
      </w:r>
    </w:p>
  `
      : "");
};

  const makeWatermarkParagraph = (relationshipId: string) => {
    return `
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="0" w:after="0"/>
        </w:pPr>
        <w:r>
          <w:pict>
            <v:shape
              id="GDAWatermark"
              type="#_x0000_t75"
              coordsize="21600,21600"
              stroked="f"
              filled="t"
              style="position:absolute;left:50%;top:50%;margin-left:-180pt;margin-top:-180pt;width:360pt;height:360pt;z-index:-251654144;mso-wrap-style:none;rotation:315"
            >
              <v:imagedata r:id="${relationshipId}" o:title="gda_logo"/>
            </v:shape>
          </w:pict>
        </w:r>
      </w:p>
    `.trim();
  };

const stampDocx = async (input: Buffer, barcodeBuffer: Buffer, documentId: string) => {
  const zip = await JSZip.loadAsync(input);

  zip.file("word/media/gdavs-barcode.png", barcodeBuffer, { binary: true });

  // Do not add a logo watermark for DOCX. DOCX files will receive barcode only.

  const contentTypesFile = zip.file("[Content_Types].xml");
  if (!contentTypesFile) {
    throw new Error("The uploaded DOCX is missing [Content_Types].xml.");
  }

  let contentTypes = await contentTypesFile.async("string");
  if (!contentTypes.includes('Extension="png"')) {
    contentTypes = contentTypes.replace(
      "</Types>",
      '<Default Extension="png" ContentType="image/png"/></Types>',
    );
  }
  zip.file("[Content_Types].xml", contentTypes);

  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (!relsFile) {
    throw new Error("The uploaded DOCX is missing word/_rels/document.xml.rels.");
  }

  const relationshipId = "rIdGDAVSBarcode01";
  let rels = await relsFile.async("string");
  if (!rels.includes(relationshipId)) {
    rels = rels.replace(
      "</Relationships>",
      `<Relationship Id="${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/gdavs-barcode.png"/></Relationships>`,
    );
  }
  zip.file("word/_rels/document.xml.rels", rels);

  const documentFile = zip.file("word/document.xml");
  if (!documentFile) {
    throw new Error("The uploaded DOCX is missing word/document.xml.");
  }

  const documentXml = await documentFile.async("string");
  const barcodeBlock = makeImageParagraph(relationshipId, 101, 2400000, 420000, documentId);
  // Insert only the barcode block for DOCX files (no watermark).
  let updatedXml = documentXml.replace("<w:body>", `<w:body>${barcodeBlock}`);

  zip.file("word/document.xml", updatedXml);

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
};

export const stampUploadedDocument = async (file: File, department: Department) => {
  const extension = getFileExtension(file.name);
  const documentId = generateDocumentId(department);
  const barcodeBuffer = await createBarcodeBuffer(documentId);

  if (extension === "pdf") {
    const stamped = await stampPdf(await file.arrayBuffer(), barcodeBuffer, documentId);

    return {
      buffer: stamped,
      contentType: "application/pdf",
      fileName: buildOutputName(file.name, documentId),
      barcodeBuffer,
      documentId,
    } satisfies ProcessedDocument;
  }

  if (extension === "docx") {
    const stamped = await stampDocx(Buffer.from(await file.arrayBuffer()), barcodeBuffer, documentId);

    return {
      buffer: stamped,
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileName: buildOutputName(file.name, documentId),
      barcodeBuffer,
      documentId,
    } satisfies ProcessedDocument;
  }

  throw new Error("Only PDF and DOCX files are supported.");
};