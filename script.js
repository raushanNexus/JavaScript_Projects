
const input = document.getElementById("qrInput");
const result = document.getElementById("result");
const qrContainer = document.getElementById("qrcode");
const generatedUrl = document.getElementById("generatedUrl");
const status = document.getElementById("status");

let currentUrl = "";

// Generate QR Code + URL
function generateQr() {
    const value = input.value.trim();

    if (!value) {
        status.textContent = "Please enter a name or website URL!";
        result.hidden = true;
        return;
    }

    // Direct URL or search by name
    if (/^https?:\/\//i.test(value)) {
        try {
            const url = new URL(value);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("Invalid URL");
            }

            currentUrl = url.href;
        } catch (error) {
            status.textContent = "Please enter a valid URL.";
            return;
        }
    } else if (
        /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(value) &&
        !value.includes(" ")
    ) {
        currentUrl = "https://" + value;
    } else {
        currentUrl =
            "https://www.google.com/search?q=" +
            encodeURIComponent(value);
    }

    // Check QR library
    if (typeof QRCode === "undefined") {
        status.textContent =
            "QR library not loaded. Check your internet connection.";
        return;
    }

    // Display the clickable URL
    generatedUrl.href = currentUrl;
    generatedUrl.textContent = currentUrl;

    // Generate QR
    qrContainer.innerHTML = "";

    new QRCode(qrContainer, {
        text: currentUrl,
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.H
    });

    result.hidden = false;
    status.textContent = "QR Code and URL generated successfully!";
}

// Get generated QR canvas
function getCanvas() {
    const canvas = qrContainer.querySelector("canvas");

    if (!canvas) {
        status.textContent = "Generate a QR code first!";
        return null;
    }

    return canvas;
}

// Download PNG
function downloadPNG() {
    const canvas = getCanvas();
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

// Download JPG
function downloadJPG() {
    const canvas = getCanvas();
    if (!canvas) return;

    const output = document.createElement("canvas");
    output.width = canvas.width;
    output.height = canvas.height;

    const ctx = output.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, output.width, output.height);
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = "qr-code.jpg";
    link.href = output.toDataURL("image/jpeg", 1);
    link.click();
}

// Download SVG
function downloadSVG() {
    const canvas = getCanvas();
    if (!canvas) return;

    const size = canvas.width;
    const pixels = canvas.getContext("2d")
        .getImageData(0, 0, size, size).data;

    const paths = [];

    for (let y = 0; y < size; y++) {
        let x = 0;

        while (x < size) {
            const i = (y * size + x) * 4;
            const dark = pixels[i] < 128 &&
                         pixels[i + 1] < 128 &&
                         pixels[i + 2] < 128;

            if (!dark) {
                x++;
                continue;
            }

            const start = x;

            while (x < size) {
                const j = (y * size + x) * 4;
                if (!(pixels[j] < 128 &&
                      pixels[j + 1] < 128 &&
                      pixels[j + 2] < 128)) break;
                x++;
            }

            paths.push(
                `M${start} ${y}h${x - start}v1h-${x - start}z`
            );
        }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg"
        width="${size}" height="${size}"
        viewBox="0 0 ${size} ${size}"
        shape-rendering="crispEdges">
        <rect width="100%" height="100%" fill="white"/>
        <path d="${paths.join("")}" fill="black"/>
    </svg>`;

    const blob = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8"
    });

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = "qr-code.svg";
    link.click();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

// Copy URL
async function copyURL() {
    if (!currentUrl) {
        status.textContent = "Generate a QR code first!";
        return;
    }

    try {
        await navigator.clipboard.writeText(currentUrl);
        status.textContent = "URL copied successfully!";
    } catch {
        status.textContent =
            "Copy failed. Please copy the displayed URL manually.";
    }
}

// Connect all buttons
document.getElementById("generateBtn")
    .addEventListener("click", generateQr);

document.getElementById("pngBtn")
    .addEventListener("click", downloadPNG);

document.getElementById("jpgBtn")
    .addEventListener("click", downloadJPG);

document.getElementById("svgBtn")
    .addEventListener("click", downloadSVG);

document.getElementById("copyBtn")
    .addEventListener("click", copyURL);

// Press Enter to generate
input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        generateQr();
    }
});
