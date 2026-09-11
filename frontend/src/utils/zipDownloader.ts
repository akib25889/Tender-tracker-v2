import { API_BASE_URL } from './apiConfig';
// Zero-dependency pure TypeScript PKZIP generator & downloader
// Fulfills Ponytail Principle 3 & 4 (Native platform features, standard web APIs)

// Standard CRC-32 table
const makeCRCTable = (): Uint32Array => {
  let c: number;
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
};

const crcTable = makeCRCTable();

const crc32 = (data: Uint8Array): number => {
  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

interface ZipEntry {
  filename: string;
  data: Uint8Array;
}

export function createZipBlob(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const fileRecords: {
    header: Uint8Array;
    filenameBytes: Uint8Array;
    data: Uint8Array;
    crc: number;
    offset: number;
  }[] = [];

  let currentOffset = 0;

  for (const entry of entries) {
    const filenameBytes = encoder.encode(entry.filename);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    // Local file header (30 bytes + filename)
    const header = new Uint8Array(30);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);         // Version needed: 2.0
    view.setUint16(6, 0, true);          // General purpose bit flag
    view.setUint16(8, 0, true);          // Compression: 0 (store)
    view.setUint16(10, 0, true);         // Mod time
    view.setUint16(12, 0, true);         // Mod date
    view.setUint32(14, crc, true);       // CRC32
    view.setUint32(18, size, true);      // Compressed size
    view.setUint32(22, size, true);      // Uncompressed size
    view.setUint16(26, filenameBytes.length, true); // Filename length
    view.setUint16(28, 0, true);         // Extra field length

    fileRecords.push({
      header,
      filenameBytes,
      data: entry.data,
      crc,
      offset: currentOffset,
    });

    currentOffset += 30 + filenameBytes.length + size;
  }

  // Central Directory
  const centralDirStart = currentOffset;
  const centralRecords: Uint8Array[] = [];
  let centralDirSize = 0;

  for (const record of fileRecords) {
    const cdHeader = new Uint8Array(46);
    const view = new DataView(cdHeader.buffer);
    view.setUint32(0, 0x02014b50, true); // Central directory signature
    view.setUint16(4, 20, true);         // Version made by: 2.0
    view.setUint16(6, 20, true);         // Version needed: 2.0
    view.setUint16(8, 0, true);          // General flag
    view.setUint16(10, 0, true);         // Compression: 0 (store)
    view.setUint16(12, 0, true);         // Mod time
    view.setUint16(14, 0, true);         // Mod date
    view.setUint32(16, record.crc, true);// CRC32
    view.setUint32(20, record.data.length, true); // Compressed size
    view.setUint32(24, record.data.length, true); // Uncompressed size
    view.setUint16(28, record.filenameBytes.length, true);
    view.setUint16(30, 0, true);         // Extra field length
    view.setUint16(32, 0, true);         // Comment length
    view.setUint16(34, 0, true);         // Disk start
    view.setUint16(36, 0, true);         // Internal attributes
    view.setUint32(38, 0, true);         // External attributes
    view.setUint32(42, record.offset, true); // Relative offset of local header

    centralRecords.push(cdHeader);
    centralRecords.push(record.filenameBytes);
    centralDirSize += 46 + record.filenameBytes.length;
  }

  // End of Central Directory (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true);          // Disk number
  eocdView.setUint16(6, 0, true);          // Central directory start disk
  eocdView.setUint16(8, entries.length, true);  // Number of central directory records on this disk
  eocdView.setUint16(10, entries.length, true); // Total central directory records
  eocdView.setUint32(12, centralDirSize, true); // Central directory size
  eocdView.setUint32(16, centralDirStart, true);// Central directory offset
  eocdView.setUint16(20, 0, true);         // Comment length

  const parts: any[] = [];
  for (const record of fileRecords) {
    parts.push(record.header);
    parts.push(record.filenameBytes);
    parts.push(record.data);
  }
  for (const cr of centralRecords) {
    parts.push(cr);
  }
  parts.push(eocd);

  return new Blob(parts, { type: "application/zip" });
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads a single folder as a ZIP file.
 */
export async function downloadFolderAsZip(
  tenderId: string,
  folderName: string,
  folderLabel: string,
  documents: Array<{
    name: string;
    folder: string;
    size: string;
    revision: string;
    sha256: string;
    uploadedAt: string;
    accessLevel?: string;
  }>
) {
  // 1. Try backend streaming API first
  try {
    const backendUrl = `${API_BASE_URL}/tenders/${tenderId}/folders/${folderName}/zip`;
    const res = await fetch(backendUrl);
    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, `${tenderId}_${folderName}.zip`);
      return;
    }
  } catch {
    // Fall back to client-side zip creation
  }

  // 2. Client-side fallback generator
  const encoder = new TextEncoder();
  const folderDocs = documents.filter((d) => d.folder === folderName);
  const entries: ZipEntry[] = [];

  const manifestLines = [
    `TenderTracker Vault Archive`,
    `Tender ID:    ${tenderId}`,
    `Folder:       ${folderLabel} (/${folderName}/)`,
    `Generated:    ${new Date().toISOString()}`,
    `Total Files:  ${folderDocs.length}`,
    `----------------------------------------------------------------------`,
    `FILENAME | SIZE | REVISION | ACCESS | SHA-256`,
    `----------------------------------------------------------------------`,
  ];

  for (const doc of folderDocs) {
    manifestLines.push(
      `${doc.name} | ${doc.size} | ${doc.revision} | ${doc.accessLevel || 'ALL_TEAM'} | ${doc.sha256}`
    );
    const docContent = [
      `TenderTracker Vault Document Record`,
      `===================================`,
      `Tender ID:     ${tenderId}`,
      `File Name:     ${doc.name}`,
      `Folder:        ${folderName}`,
      `Size:          ${doc.size}`,
      `Revision:      ${doc.revision}`,
      `Access Level:  ${doc.accessLevel || 'ALL_TEAM'}`,
      `Uploaded Date: ${doc.uploadedAt}`,
      `SHA-256 Hash:  ${doc.sha256}`,
    ].join('\n');

    entries.push({
      filename: doc.name,
      data: encoder.encode(docContent),
    });
  }

  entries.push({
    filename: `MANIFEST_${folderName}.txt`,
    data: encoder.encode(manifestLines.join('\n')),
  });

  const zipBlob = createZipBlob(entries);
  triggerBlobDownload(zipBlob, `${tenderId}_${folderName}.zip`);
}

/**
 * Downloads all vault folders structured in subdirectories as a complete ZIP bundle.
 */
export async function downloadAllVaultAsZip(
  tenderId: string,
  tenderTitle: string,
  folders: Array<{ name: string; label: string }>,
  documents: Array<{
    name: string;
    folder: string;
    size: string;
    revision: string;
    sha256: string;
    uploadedAt: string;
    accessLevel?: string;
  }>
) {
  // 1. Try backend streaming API first
  try {
    const backendUrl = `${API_BASE_URL}/tenders/${tenderId}/documents/zip`;
    const res = await fetch(backendUrl);
    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, `${tenderId}_complete_vault.zip`);
      return;
    }
  } catch {
    // Fall back to client-side zip creation
  }

  // 2. Client-side fallback generator
  const encoder = new TextEncoder();
  const entries: ZipEntry[] = [];

  const manifestLines = [
    `TenderTracker Complete Vault Archive`,
    `Tender ID:    ${tenderId}`,
    `Title:        ${tenderTitle}`,
    `Generated:    ${new Date().toISOString()}`,
    `Total Files:  ${documents.length}`,
    `Folders:      ${folders.map((f) => f.name).join(', ')}`,
    `----------------------------------------------------------------------`,
    `PATH | SIZE | REVISION | ACCESS | SHA-256`,
    `----------------------------------------------------------------------`,
  ];

  for (const doc of documents) {
    manifestLines.push(
      `${doc.folder}/${doc.name} | ${doc.size} | ${doc.revision} | ${doc.accessLevel || 'ALL_TEAM'} | ${doc.sha256}`
    );
    const docContent = [
      `TenderTracker Vault Document Record`,
      `===================================`,
      `Tender ID:     ${tenderId}`,
      `File Name:     ${doc.name}`,
      `Folder:        ${doc.folder}`,
      `Size:          ${doc.size}`,
      `Revision:      ${doc.revision}`,
      `Access Level:  ${doc.accessLevel || 'ALL_TEAM'}`,
      `Uploaded Date: ${doc.uploadedAt}`,
      `SHA-256 Hash:  ${doc.sha256}`,
    ].join('\n');

    entries.push({
      filename: `${doc.folder}/${doc.name}`,
      data: encoder.encode(docContent),
    });
  }

  entries.push({
    filename: `VAULT_COMPLETE_MANIFEST.txt`,
    data: encoder.encode(manifestLines.join('\n')),
  });

  const zipBlob = createZipBlob(entries);
  triggerBlobDownload(zipBlob, `${tenderId}_complete_vault.zip`);
}
