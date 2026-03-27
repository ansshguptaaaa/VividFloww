import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const generateAndDownloadHtml = (elements, projectName) => {
  const zip = new JSZip();

  let htmlBody = '';
  elements.forEach(el => {
    // Convert React camelCase styles to CSS kebab-case
    const styleString = Object.entries(el.styles || {})
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssKey}: ${value};`;
      })
      .join(' ');

    let elementHtml = '';
    if (el.type === 'heading') elementHtml = `<h2 style="${styleString}">${el.content}</h2>`;
    else if (el.type === 'text') elementHtml = `<p style="${styleString}">${el.content}</p>`;
    else if (el.type === 'button') elementHtml = `<button style="${styleString}">${el.content}</button>`;
    else if (el.type === 'image') elementHtml = `<img src="${el.content}" style="${styleString}" alt="" />`;

    if (el.linkUrl) {
      htmlBody += `    <a href="${el.linkUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">\n      ${elementHtml}\n    </a>\n`;
    } else {
      htmlBody += `    ${elementHtml}\n`;
    }
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            margin: 0; 
            padding: 24px; 
            box-sizing: border-box; 
            background-color: #ffffff;
            color: #1a202c;
        }
    </style>
</head>
<body>
${htmlBody}
</body>
</html>`;

  zip.file('index.html', htmlContent);
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `${(projectName || 'vividflow-site').replace(/\\s+/g, '_').toLowerCase()}.zip`);
  });
};
