import { jsPDF } from 'jspdf';
import { DocumentType } from '../types';

export interface ExportPdfOptions {
    title: string;
    content: string;
    subtitle?: string;
    institution?: string;
    candidateName?: string;
}

/**
 * Clean and format document content into paragraphs
 */
const formatContentForPdf = (rawText: string): string[] => {
    return rawText
        .replace(/\r\n/g, '\n')
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
};

/**
 * Export a single generated academic document as a polished PDF file
 */
export const exportDocumentToPdf = (options: ExportPdfOptions): void => {
    const { title, content, subtitle, institution, candidateName } = options;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const marginX = 20;
    const marginTop = 22;
    const marginBottom = 22;
    const contentWidth = pageWidth - (marginX * 2); // 170mm

    let currentY = marginTop;

    // --- Header Section ---
    // Top decorative bar
    doc.setFillColor(2, 132, 199); // Sky blue
    doc.rect(marginX, currentY, 3.5, 14, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title.toUpperCase(), marginX + 6, currentY + 6);

    // Subtitle / Context
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500

    const subText = subtitle || (institution ? `Prepared for: ${institution}` : 'Academic Application Document');
    const dateText = `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
    
    doc.text(subText, marginX + 6, currentY + 12);
    doc.text(dateText, pageWidth - marginX, currentY + 12, { align: 'right' });

    currentY += 18;

    // Header divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);

    currentY += 8;

    // --- Body Content ---
    const paragraphs = formatContentForPdf(content);
    const lineHeight = 5.2; // in mm
    const paragraphSpacing = 4; // in mm

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59); // slate-800

    paragraphs.forEach((paragraph) => {
        // Split text by content width
        const lines = doc.splitTextToSize(paragraph, contentWidth);
        const paragraphHeight = lines.length * lineHeight;

        // Check page overflow
        if (currentY + paragraphHeight > pageHeight - marginBottom) {
            doc.addPage();
            currentY = marginTop;
        }

        doc.text(lines, marginX, currentY);
        currentY += paragraphHeight + paragraphSpacing;
    });

    // --- Add Footers & Page Numbers ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);

        // Footer text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('Academic Application Assistant • Confidential Application Draft', marginX, pageHeight - 9);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 9, { align: 'right' });
    }

    // Sanitize filename
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${sanitizedTitle}.pdf`);
};

/**
 * Export all drafted documents in one multi-document dossier PDF
 */
export const exportAllDocumentsDossierToPdf = (
    documents: Partial<Record<DocumentType, string>>,
    positionInfo?: string
): void => {
    const docKeys = Object.keys(documents) as DocumentType[];
    if (docKeys.length === 0) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const marginTop = 22;
    const marginBottom = 22;
    const contentWidth = pageWidth - (marginX * 2);

    // --- Cover / Title Page ---
    let currentY = 50;

    doc.setFillColor(2, 132, 199);
    doc.rect(marginX, currentY, 6, 26, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('ACADEMIC APPLICATION DOSSIER', marginX + 10, currentY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Comprehensive Package of Application Documents', marginX + 10, currentY + 18);
    
    currentY += 40;

    if (positionInfo) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        doc.text('TARGET POSITION / INSTITUTION:', marginX, currentY);
        currentY += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const positionLines = doc.splitTextToSize(positionInfo, contentWidth);
        doc.text(positionLines, marginX, currentY);
        currentY += (positionLines.length * 5) + 12;
    }

    // Table of contents summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text('INCLUDED DOCUMENTS:', marginX, currentY);
    currentY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    docKeys.forEach((key, index) => {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(marginX, currentY - 4, contentWidth, 8, 1.5, 1.5, 'F');
        doc.setTextColor(15, 23, 42);
        doc.text(`${index + 1}.  ${key}`, marginX + 4, currentY + 1.5);
        currentY += 11;
    });

    const dateFormatted = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on: ${dateFormatted}`, marginX, pageHeight - 30);

    // --- Render each document on fresh pages ---
    docKeys.forEach((key) => {
        const content = documents[key];
        if (!content) return;

        doc.addPage();
        currentY = marginTop;

        // Document header
        doc.setFillColor(2, 132, 199);
        doc.rect(marginX, currentY, 3.5, 12, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(15, 23, 42);
        doc.text(key.toUpperCase(), marginX + 6, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Academic Dossier • ${key}`, marginX + 6, currentY + 11);

        currentY += 16;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(marginX, currentY, pageWidth - marginX, currentY);
        currentY += 8;

        // Paragraphs
        const paragraphs = formatContentForPdf(content);
        const lineHeight = 5.2;
        const paragraphSpacing = 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);

        paragraphs.forEach((p) => {
            const lines = doc.splitTextToSize(p, contentWidth);
            const paragraphHeight = lines.length * lineHeight;

            if (currentY + paragraphHeight > pageHeight - marginBottom) {
                doc.addPage();
                currentY = marginTop;
            }

            doc.text(lines, marginX, currentY);
            currentY += paragraphHeight + paragraphSpacing;
        });
    });

    // Page numbering for entire document
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Academic Application Assistant • Application Dossier', marginX, pageHeight - 9);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 9, { align: 'right' });
    }

    doc.save('Academic_Application_Dossier.pdf');
};
