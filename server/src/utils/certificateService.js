    import { createCanvas, registerFont } from "canvas";
    import PDFDocument from "pdfkit";
    import path from "path";
    import { fileURLToPath } from "url";

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const FONTS_DIR = path.join(__dirname, "fonts");

    // Font registration - optional, falls back to system fonts if not available
    const fonts = {
        EdwardianScript: "serif",
        Lora: "serif",
        InstrumentSans: "sans-serif"
    };

    try {
        registerFont(path.join(FONTS_DIR, "Kerkis-Calligraphic.otf"), { family: "EdwardianScript" });
        fonts.EdwardianScript = "EdwardianScript";
    } catch (e) {
        console.log('EdwardianScript font not found, using serif fallback');
    }

    try {
        registerFont(path.join(FONTS_DIR, "Lora-Regular.ttf"), { family: "Lora" });
        fonts.Lora = "Lora";
    } catch (e) {
        console.log('Lora font not found, using serif fallback');
    }

    try {
        registerFont(path.join(FONTS_DIR, "InstrumentSans-Regular.ttf"), { family: "InstrumentSans" });
        fonts.InstrumentSans = "InstrumentSans";
    } catch (e) {
        console.log('InstrumentSans font not found, using sans-serif fallback');
    }

    // ─── Canvas dimensions ────────────────────────────────────────────────────────
    const W = 1200;
    const H = 880;

    // ─── Emerald palette ──────────────────────────────────────────────────────────
    const C = {
    emerald:      [5,   150, 105],
    emeraldDark:  [4,   120,  87],
    emeraldDeep:  [6,    95,  70],
    emeraldLight: [209, 250, 229],
    emeraldBorder:[167, 243, 208],
    white:        [255, 255, 255],
    black:        [17,   24,  39],
    gray700:      [55,   65,  81],
    gray600:      [75,   85,  99],
    gray500:      [107, 114, 128],
    gray400:      [156, 163, 175],
    };

    // rgb array → rgba CSS string
    const rgba = ([r, g, b], a = 255) =>
    `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    function centeredText(ctx, text, y) {
    ctx.fillText(text, (W - ctx.measureText(text).width) / 2, y);
    }

    function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        });
    } catch { return dateStr; }
    }

    // ─── Drawing primitives ───────────────────────────────────────────────────────

    function drawBackground(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#f0fdf8");
    grad.addColorStop(1, "#ffffff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    }

    function drawCorners(ctx, size = 90) {
    const defs = [
        { ox: 0,      oy: 0,      tri: [[0,0],[size,0],[0,size]],                lines: [[0,0,size,0],[0,0,0,size]] },
        { ox: W-size, oy: 0,      tri: [[size,0],[0,0],[size,size]],             lines: [[0,0,size,0],[size,0,size,size]] },
        { ox: 0,      oy: H-size, tri: [[0,size],[size,size],[0,0]],             lines: [[0,size,size,size],[0,0,0,size]] },
        { ox: W-size, oy: H-size, tri: [[size,size],[0,size],[size,0]],          lines: [[0,size,size,size],[size,0,size,size]] },
    ];

    defs.forEach(({ ox, oy, tri, lines }) => {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.beginPath();
        tri.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.closePath();
        ctx.fillStyle = rgba(C.emeraldLight, 200);
        ctx.fill();
        ctx.strokeStyle = rgba(C.emerald, 220);
        ctx.lineWidth   = 3;
        lines.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        });
        ctx.restore();
    });
    }

    function drawDoubleBorder(ctx) {
    ctx.strokeStyle = rgba(C.emerald, 60); ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.strokeStyle = rgba(C.emerald, 35); ctx.lineWidth = 1;
    ctx.strokeRect(42, 42, W - 84, H - 84);
    }

    function drawWatermark(ctx, cx, cy) {
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.strokeStyle = rgba(C.emerald);
    ctx.lineWidth   = 8;
    ctx.beginPath(); ctx.arc(cx, cy - 60, 160, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy + 96);  ctx.lineTo(cx - 25, cy + 175);
    ctx.lineTo(cx, cy + 100);      ctx.lineTo(cx + 25, cy + 175);
    ctx.lineTo(cx + 60, cy + 96);
    ctx.stroke();
    ctx.restore();
    }

    function drawAwardIcon(ctx, cx, cy, r = 52) {
    // Glow
    const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.4);
    glow.addColorStop(0, rgba(C.emerald, 30));
    glow.addColorStop(1, rgba(C.emerald, 0));
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = glow; ctx.fill();

    // Gradient circle
    const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    grad.addColorStop(0, rgba(C.emerald));
    grad.addColorStop(1, rgba(C.emeraldDark));
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();

    // Inner ring
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy - 6, 28, 0, Math.PI * 2); ctx.stroke();

    // Ribbon tails
    ctx.fillStyle = "white";
    [[cx-14,cy+18,cx-6,cy+40,cx,cy+22],[cx+14,cy+18,cx+6,cy+40,cx,cy+22]].forEach(([x1,y1,x2,y2,x3,y3]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.closePath(); ctx.fill();
    });

    // Star
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const a  = ((i * 36 - 90) * Math.PI) / 180;
        const rr = i % 2 === 0 ? 13 : 6;
        i === 0 ? ctx.moveTo(cx + rr*Math.cos(a), cy-8 + rr*Math.sin(a))
                : ctx.lineTo(cx + rr*Math.cos(a), cy-8 + rr*Math.sin(a));
    }
    ctx.closePath(); ctx.fillStyle = "white"; ctx.fill();
    }

    function drawDivider(ctx, y) {
    const cx = W / 2, len = 120;
    // Fading lines
    const gL = ctx.createLinearGradient(cx-len-22, y, cx-22, y);
    gL.addColorStop(0, rgba(C.emerald, 0)); gL.addColorStop(1, rgba(C.emerald));
    ctx.strokeStyle = gL; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx-len-22, y); ctx.lineTo(cx-22, y); ctx.stroke();

    const gR = ctx.createLinearGradient(cx+22, y, cx+len+22, y);
    gR.addColorStop(0, rgba(C.emerald)); gR.addColorStop(1, rgba(C.emerald, 0));
    ctx.strokeStyle = gR; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx+22, y); ctx.lineTo(cx+len+22, y); ctx.stroke();

    // Badge check
    ctx.strokeStyle = rgba(C.emerald); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, y, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.lineCap = "round"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx-8, y); ctx.lineTo(cx-2, y+8); ctx.lineTo(cx+10, y-8); ctx.stroke();
    }

    function drawDateBox(ctx, cx, cy, dateLabel, dateValue) {
    const bw=260, bh=88, bx=cx-bw/2, by=cy-bh/2, r=10;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, r);
    ctx.fillStyle = rgba(C.emeraldLight); ctx.fill();
    ctx.strokeStyle = rgba(C.emeraldBorder); ctx.lineWidth = 2; ctx.stroke();

    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillStyle = rgba(C.emeraldDark);
    ctx.font      = `14px ${fonts.InstrumentSans}`;
    ctx.fillText(dateLabel, cx, by + 16);

    ctx.fillStyle = rgba(C.emeraldDeep);
    ctx.font      = `20px ${fonts.Lora}`;
    ctx.fillText(dateValue, cx, by + 42);
    }

    // ─── Main export ──────────────────────────────────────────────────────────────

    /**
     * Generate a Certificate of Achievement as a PNG buffer.
     *
     * All name fields (name, program_director, chief_executive) are rendered
     * in Edwardian Script ITC style (Kerkis Calligraphic — formal italic copperplate).
     *
     * @param {string} name               - Recipient full name
     * @param {string} course_name        - Program / course name
     * @param {string} generated_at       - Issue date  (ISO "YYYY-MM-DD" or readable)
     * @param {string} program_director   - Program director's full name
     * @param {string} chief_executive    - CEO / executive officer's full name
     * @param {object} [options]
     * @param {string} [options.cert_id]  - Override auto-generated certificate ID
     * @returns {Buffer}  PNG image buffer — 1200 × 880 px
     *
     * @example
     * import { generateCertificate } from "./certificateService.js";
     * import fs from "fs";
     *
     * const buf = generateCertificate(
     *   "John Anderson",
     *   "Professional Development Program",
     *   "2026-02-18",
     *   "Dr. Sarah Mitchell",
     *   "Michael Reynolds"
     * );
     *
     * // Save to disk
     * fs.writeFileSync("certificate.png", buf);
     *
     * // Stream via Express
     * res.set("Content-Type", "image/png").send(buf);
     */
    export function generateCertificate(
    name,
    course_name,
    generated_at,
    program_director,
    chief_executive,
    options = {}
    ) {
    const {
        cert_id = `CRT-${new Date().getFullYear()}-${Math.random()
        .toString(36).slice(2, 9).toUpperCase()}`,
    } = options;

    const canvas = createCanvas(W, H);
    const ctx    = canvas.getContext("2d");

    // ── Foundation ──────────────────────────────────────────────────────────────
    drawBackground(ctx);
    drawCorners(ctx, 90);
    drawDoubleBorder(ctx);
    drawWatermark(ctx, W / 2, H / 2 - 20);

    // ── Award icon ──────────────────────────────────────────────────────────────
    drawAwardIcon(ctx, W / 2, 90, 52);

    // ── "Certificate of Achievement" title ──────────────────────────────────────
    ctx.fillStyle    = rgba(C.black);
    ctx.font         = `64px ${fonts.Lora}`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Certificate of Achievement", W / 2, 158);

    // ── Divider ──────────────────────────────────────────────────────────────────
    drawDivider(ctx, 250);

    // ── "This certificate is proudly presented to" ──────────────────────────────
    ctx.fillStyle = rgba(C.gray600);
    ctx.font      = `19px ${fonts.Lora}`;
    ctx.fillText("This certificate is proudly presented to", W / 2, 278);

    // ── Recipient name — Edwardian Script ITC style ──────────────────────────────
    ctx.fillStyle    = rgba(C.emeraldDark);
    ctx.font         = `86px ${fonts.EdwardianScript}`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    const nameW      = ctx.measureText(name).width;
    ctx.fillText(name, W / 2, 314);

    // Underline
    ctx.strokeStyle = rgba(C.emerald, 110); ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameW / 2 - 12, 314 + 86 * 0.84 + 6);
    ctx.lineTo(W / 2 + nameW / 2 + 12, 314 + 86 * 0.84 + 6);
    ctx.stroke();

    // ── Body ────────────────────────────────────────────────────────────────────
    ctx.fillStyle    = rgba(C.gray700);
    ctx.font         = `19px ${fonts.Lora}`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
        "For outstanding performance and exceptional dedication in completing the",
        W / 2, 430
    );

    // Course badge
    const restTxt  = " with distinction and excellence";
    ctx.font        = `17px ${fonts.InstrumentSans}`;
    const courseW   = ctx.measureText(course_name).width;
    ctx.font        = `19px ${fonts.Lora}`;
    const restW     = ctx.measureText(restTxt).width;
    const padX      = 12, padY = 6, courseH = 24;
    const line2W    = courseW + padX * 2 + 8 + restW;
    const line2X    = (W - line2W) / 2;
    const badgeY    = 462;

    ctx.fillStyle = rgba(C.emeraldLight);
    ctx.beginPath(); ctx.roundRect(line2X - padX, badgeY - padY, courseW + padX * 2, courseH + padY * 2, 6);
    ctx.fill();
    ctx.strokeStyle = rgba(C.emerald, 55); ctx.lineWidth = 1; ctx.stroke();

    ctx.fillStyle    = rgba(C.emeraldDark);
    ctx.font         = `17px ${fonts.InstrumentSans}`;
    ctx.textAlign    = "left";
    ctx.textBaseline = "top";
    ctx.fillText(course_name, line2X, badgeY);

    ctx.fillStyle = rgba(C.gray700);
    ctx.font      = `19px ${fonts.Lora}`;
    ctx.fillText(restTxt, line2X + courseW + padX * 2 + 8, badgeY - 1);

    // ── Section divider ─────────────────────────────────────────────────────────
    ctx.strokeStyle = rgba(C.emerald, 40); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 552); ctx.lineTo(W - 100, 552); ctx.stroke();

    // ── Bottom: Signature | Date box | Signature ─────────────────────────────────
    const botY  = 572;
    const sig1X = 240;
    const sig2X = W - 240;

    // Program Director (left) — Edwardian Script
    ctx.fillStyle    = rgba(C.black);
    ctx.font         = `46px ${fonts.EdwardianScript}`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.fillText(program_director, sig1X, botY);

    ctx.strokeStyle = rgba(C.gray400); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sig1X-130, botY+56); ctx.lineTo(sig1X+130, botY+56); ctx.stroke();

    ctx.fillStyle = rgba(C.gray600);
    ctx.font      = `15px ${fonts.InstrumentSans}`;
    ctx.fillText("Program Director", sig1X, botY + 64);

    // Date box (center)
    drawDateBox(ctx, W / 2, botY + 46, "Date of Issue", formatDate(generated_at));

    // Chief Executive (right) — Edwardian Script
    ctx.fillStyle    = rgba(C.black);
    ctx.font         = `46px ${fonts.EdwardianScript}`;
    ctx.textBaseline = "top";
    ctx.fillText(chief_executive, sig2X, botY);

    ctx.strokeStyle = rgba(C.gray400); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sig2X-130, botY+56); ctx.lineTo(sig2X+130, botY+56); ctx.stroke();

    ctx.fillStyle = rgba(C.gray600);
    ctx.font      = `15px ${fonts.InstrumentSans}`;
    ctx.fillText("Chief Executive Officer", sig2X, botY + 64);

    // ── Certificate ID ──────────────────────────────────────────────────────────
    ctx.fillStyle    = rgba(C.gray500);
    ctx.font         = `11px ${fonts.InstrumentSans}`;
    ctx.textBaseline = "top";
    ctx.fillText(`CERTIFICATE ID: ${cert_id}`, W / 2, H - 52);

    return canvas.toBuffer("image/png");
    }

export function generateQuizCertificate(name, score, totalScore, generatedAt, options = {}) {
    const { cert_id = `QZ-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}` } = options;
    
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    drawBackground(ctx);
    drawCorners(ctx, 90);
    drawDoubleBorder(ctx);
    drawWatermark(ctx, W / 2, H / 2 - 20);
    drawAwardIcon(ctx, W / 2, 90, 52);

    ctx.fillStyle = rgba(C.black);
    ctx.font = `64px ${fonts.Lora}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Certificate of Achievement", W / 2, 158);

    drawDivider(ctx, 250);

    ctx.fillStyle = rgba(C.gray600);
    ctx.font = `19px ${fonts.Lora}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("This certificate is proudly presented to", W / 2, 278);

    // Draw name with dynamic font sizing to handle overflow
    ctx.fillStyle = rgba(C.emeraldDark);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    // Start with large font and scale down if name is too long
    let fontSize = 86;
    const maxNameWidth = W * 0.8; // 80% of canvas width
    let nameW;
    
    do {
        ctx.font = `${fontSize}px ${fonts.EdwardianScript}`;
        nameW = ctx.measureText(name).width;
        if (nameW > maxNameWidth && fontSize > 40) {
            fontSize -= 2;
        } else {
            break;
        }
    } while (fontSize > 40);
    
    ctx.fillText(name, W / 2, 314);

    // Draw underline centered under the name
    ctx.strokeStyle = rgba(C.emerald, 110);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameW / 2 - 12, 314 + fontSize * 0.84 + 6);
    ctx.lineTo(W / 2 + nameW / 2 + 12, 314 + fontSize * 0.84 + 6);
    ctx.stroke();

    ctx.fillStyle = rgba(C.gray700);
    ctx.font = `19px ${fonts.Lora}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("For successfully completing the", W / 2, 430);

    const courseText = "Waste Management Quiz";
    ctx.font = `17px ${fonts.InstrumentSans}`;
    const courseW = ctx.measureText(courseText).width;
    const badgeY = 462;
    const padX = 12, padY = 6, courseH = 24;

    ctx.fillStyle = rgba(C.emeraldLight);
    ctx.beginPath();
    ctx.roundRect((W - courseW) / 2 - padX, badgeY - padY, courseW + padX * 2, courseH + padY * 2, 6);
    ctx.fill();
    ctx.strokeStyle = rgba(C.emerald, 55);
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = rgba(C.emeraldDark);
    ctx.font = `17px ${fonts.InstrumentSans}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(courseText, W / 2, badgeY);

    ctx.fillStyle = rgba(C.gray700);
    ctx.font = `19px ${fonts.Lora}`;
    ctx.fillText(`with a score of ${score}/${totalScore}`, W / 2, badgeY + 40);

    ctx.strokeStyle = rgba(C.emerald, 40);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 572);
    ctx.lineTo(W - 100, 572);
    ctx.stroke();

    drawDateBox(ctx, W / 2, 636, "Date of Issue", formatDate(generatedAt));

    ctx.fillStyle = rgba(C.gray500);
    ctx.font = `11px ${fonts.InstrumentSans}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`CERTIFICATE ID: ${cert_id}`, W / 2, H - 52);

    return canvas.toBuffer("image/png");
}

export function convertCertificateToPDF(imageBuffer) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: [W, H], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        
        doc.image(imageBuffer, 0, 0, { width: W, height: H });
        doc.end();
    });
}

