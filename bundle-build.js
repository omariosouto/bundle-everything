const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Function to read a file asynchronously
function readFileAsync(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

// Main function to process the HTML file
async function inlineResources(htmlFilePath) {
    const htmlContent = await readFileAsync(htmlFilePath);
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Inline CSS
    const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
    for (let link of linkTags) {
        const cssPath = path.join(path.dirname(htmlFilePath), link.href);
        const cssContent = await readFileAsync(cssPath);
        const style = document.createElement('style');
        style.textContent = cssContent;
        link.parentNode.replaceChild(style, link);
    }

    // Inline JavaScript
    const scriptTags = document.querySelectorAll('script[src]');
    for (let script of scriptTags) {
        const scriptPath = path.join(path.dirname(htmlFilePath), script.src);
        const scriptContent = await readFileAsync(scriptPath);
        const inlineScript = document.createElement('script');
        inlineScript.textContent = scriptContent;
        script.parentNode.replaceChild(inlineScript, script);
    }

    // Save the modified HTML to a new file
    fs.writeFileSync('output.html', dom.serialize());
    console.log('output.html has been created with inlined CSS and JavaScript.');
}

// Replace 'index.html' with the path to your HTML file
inlineResources('./nextjsbuild/index.html').catch(console.error);
