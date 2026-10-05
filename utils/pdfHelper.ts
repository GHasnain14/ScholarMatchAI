import { jsPDF } from 'jspdf';

/**
 * Creates a formatted PDF Blob from raw academic CV text
 */
export function generatePdfBlobFromText(text: string, title: string = 'Curriculum Vitae'): Blob {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    const margin = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;

    // Header title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(title.toUpperCase(), margin, 50);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Academic Profile Document • AI Preview Copy', margin, 65);

    // Separator line
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(1);
    doc.line(margin, 72, pageWidth - margin, 72);

    // Content body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700
    const splitText = doc.splitTextToSize(text, maxLineWidth);

    let y = 92;
    const lineHeight = 14;
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < splitText.length; i++) {
        const line = splitText[i];
        if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        // Bold headings if line starts with uppercase title
        const isHeader = /^[A-Z\s&]{4,}:/.test(line.trim()) || /^[0-9]\./.test(line.trim());
        if (isHeader) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 58, 138); // blue-900
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85); // slate-700
        }

        doc.text(line, margin, y);
        y += lineHeight;
    }

    return doc.output('blob');
}
