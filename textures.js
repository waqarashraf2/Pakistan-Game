/**
 * Miracle of Pakistan - High-Fidelity Photorealistic Textures Engine
 * Generates rich PBR textures for Asphalt, Weathered Concrete, Automotive Metallic Paint,
 * Fabric Weave Canvas, Brick Masonry, Shopfronts, Bedford Truck Art, and Honda CD 70.
 */

const TextureGenerator = {
  canvasToTexture(canvas, repeatX = 1, repeatY = 1) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    return texture;
  },

  // 1. High-Detail Realistic Asphalt with Traffic Wear, Bitumen & Crisp Markings
  createRealisticAsphaltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base dark bitumen color
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Micro-gravel and surface aggregate noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 36;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Dark oil slicks & rubber deposits along vehicle lane tracks
    const trackPositions = [180, 360, 664, 844];
    trackPositions.forEach(tx => {
      const grad = ctx.createLinearGradient(tx - 50, 0, tx + 50, 0);
      grad.addColorStop(0, 'rgba(12, 13, 15, 0)');
      grad.addColorStop(0.5, 'rgba(10, 11, 13, 0.65)');
      grad.addColorStop(1, 'rgba(12, 13, 15, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(tx - 50, 0, 100, 1024);
    });

    // Asphalt surface cracks
    ctx.strokeStyle = '#111214';
    ctx.lineWidth = 2.5;
    for (let c = 0; c < 8; c++) {
      let cx = Math.random() * 1024;
      let cy = Math.random() * 1024;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 16; s++) {
        cx += (Math.random() - 0.5) * 40;
        cy += (Math.random() - 0.5) * 40;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Yellow double central dividers
    this.drawWeatheredStripe(ctx, 505, 0, 8, 1024, '#f59e0b', true);
    this.drawWeatheredStripe(ctx, 517, 0, 8, 1024, '#f59e0b', true);

    // Dashed white lane dividers
    for (let y = 0; y < 1024; y += 128) {
      this.drawWeatheredStripe(ctx, 256, y + 16, 10, 80, '#f8fafc', false);
      this.drawWeatheredStripe(ctx, 768, y + 16, 10, 80, '#f8fafc', false);
    }

    // Outer solid white shoulder lines
    this.drawWeatheredStripe(ctx, 20, 0, 12, 1024, '#f1f5f9', true);
    this.drawWeatheredStripe(ctx, 992, 0, 12, 1024, '#f1f5f9', true);

    return this.canvasToTexture(canvas, 1, 4);
  },

  drawWeatheredStripe(ctx, x, y, w, h, color, isSolid) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.94;
    ctx.fillRect(x, y, w, h);

    // Weathering paint chipping
    ctx.fillStyle = '#22252a';
    for (let i = 0; i < (isSolid ? 35 : 10); i++) {
      const px = x + Math.random() * w;
      const py = y + Math.random() * h;
      ctx.beginPath();
      ctx.arc(px, py, 1 + Math.random() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  // 2. Weathered WAPDA Utility Pole Concrete with Urdu Danger Plate
  createWeatheredConcreteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8e9aa8';
    ctx.fillRect(0, 0, 512, 1024);

    const imgData = ctx.getImageData(0, 0, 512, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 42;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Vertical dark rain runoff stains
    for (let x = 0; x < 512; x += 20 + Math.random() * 30) {
      const grad = ctx.createLinearGradient(x, 0, x, 1024);
      grad.addColorStop(0, 'rgba(25, 28, 30, 0.55)');
      grad.addColorStop(0.3, 'rgba(35, 38, 40, 0.30)');
      grad.addColorStop(0.7, 'rgba(45, 48, 50, 0.18)');
      grad.addColorStop(1, 'rgba(20, 22, 24, 0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, 8 + Math.random() * 12, 1024);
    }

    // Yellow and black warning chevron stripes at bottom base
    const baseH = 260;
    const stripeW = 40;
    for (let y = 1024 - baseH; y < 1024; y += stripeW * 2) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, y, 512, stripeW);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, y + stripeW, 512, stripeW);
    }

    // Authentic WAPDA Urdu Danger Stencil
    ctx.save();
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(80, 420, 352, 140);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.strokeRect(84, 424, 344, 132);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Noto Nastaliq Urdu", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('واپڈا - WAPDA', 256, 470);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 30px "Noto Nastaliq Urdu", "Segoe UI", sans-serif';
    ctx.fillText('خطرہ ۱۱۰۰۰ وولٹ', 256, 525);
    ctx.restore();

    return this.canvasToTexture(canvas, 1, 1);
  },

  // 3. Metallic Automotive Paint Texture
  createMetallicPaintTexture(baseHex, shineHex = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    // Micro-flake sparkle
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const sparkle = (Math.random() - 0.5) * 28;
      data[i] = Math.min(255, Math.max(0, data[i] + sparkle));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + sparkle));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + sparkle));
    }
    ctx.putImageData(imgData, 0, 0);

    const gloss = ctx.createLinearGradient(0, 0, 512, 512);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gloss.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, 512, 512);

    return this.canvasToTexture(canvas);
  },

  // 4. Rickshaw Heavy Weathered Canopy Texture
  createRickshawCanopyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, 512, 512);

    // Fabric weave lines
    ctx.fillStyle = '#ca8a04';
    for (let x = 0; x < 512; x += 4) {
      ctx.fillRect(x, 0, 1.5, 512);
    }
    for (let y = 0; y < 512; y += 4) {
      ctx.fillRect(0, y, 512, 1.5);
    }

    // Weathering grime on edges
    const grime = ctx.createRadialGradient(256, 256, 120, 256, 256, 320);
    grime.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grime.addColorStop(1, 'rgba(60, 40, 10, 0.45)');
    ctx.fillStyle = grime;
    ctx.fillRect(0, 0, 512, 512);

    // Double seam stitching
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(18, 18, 476, 476);
    ctx.setLineDash([]);

    return this.canvasToTexture(canvas);
  },

  // 5. Kerb Texture (Red & White with Tyre Scuffs)
  createRealisticKerbTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const blockW = 64;
    for (let x = 0; x < 512; x += blockW * 2) {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x, 0, blockW, 128);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x + blockW, 0, blockW, 128);
    }

    // Tyre scuffs
    ctx.fillStyle = 'rgba(15, 15, 15, 0.5)';
    for (let s = 0; s < 25; s++) {
      const sx = Math.random() * 512;
      const sy = 30 + Math.random() * 80;
      ctx.fillRect(sx, sy, 18 + Math.random() * 40, 5 + Math.random() * 12);
    }

    return this.canvasToTexture(canvas, 8, 1);
  },

  // 6. Dusty Roadside Ground Terrain
  createRealisticDustTerrain() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#78542c';
    ctx.fillRect(0, 0, 512, 512);

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 48;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Roadside rocks & pebbles
    ctx.fillStyle = '#452b14';
    for (let p = 0; p < 280; p++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + Math.random() * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    return this.canvasToTexture(canvas, 4, 16);
  },

  // 7. Authentic Pakistani Bedford Truck Art Texture (Front & Sides)
  createTruckArtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich orange-red background
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 1024, 512);

    // Decorative geometric truck-art arches
    const colors = ['#f59e0b', '#0284c7', '#16a34a', '#ec4899', '#ffffff', '#e11d48'];
    for (let i = 0; i < 4; i++) {
      const cx = 130 + i * 250;
      for (let ring = 5; ring >= 1; ring--) {
        ctx.fillStyle = colors[ring % colors.length];
        ctx.beginPath();
        ctx.arc(cx, 256, ring * 22, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Top and bottom decorative borders
    const barW = 24;
    for (let x = 0; x < 1024; x += barW * 2) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x, 0, barW, 40);
      ctx.fillRect(x, 512 - 40, barW, 40);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(x + barW, 0, barW, 40);
      ctx.fillRect(x + barW, 512 - 40, barW, 40);
    }

    // Central Poetry Banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(80, 170, 864, 170);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#facc15';
    ctx.strokeRect(84, 174, 856, 162);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 50px "Noto Nastaliq Urdu", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('فاصلہ رکھیں ورنہ پیار ہو جائے گا', 512, 245);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Poppins", sans-serif';
    ctx.fillText('HORN DO - PASS LO', 512, 305);

    return this.canvasToTexture(canvas);
  },

  // 8. Pakistani Rickshaw Rear Mudflap
  createRickshawRearTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 512, 256);

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#facc15';
    ctx.strokeRect(8, 8, 496, 240);

    // Pakistani Flag
    ctx.fillStyle = '#15803d';
    ctx.fillRect(25, 25, 70, 48);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(25, 25, 20, 48);
    ctx.beginPath();
    ctx.arc(65, 49, 14, 0, Math.PI * 2);
    ctx.fill();

    // Poetry
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 38px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DEKH MAGAR', 256, 95);
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 44px "Poppins", sans-serif';
    ctx.fillText('PYAAR SE! ❤️', 256, 155);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('PAK - LHR - 786', 256, 215);

    return this.canvasToTexture(canvas);
  },

  // 9. Realistic Pakistani Commercial Billboards
  createBillboardTexture(typeIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const boards = [
      {
        bg: '#78350f',
        border: '#fde047',
        header: 'AL-MADINA HIGHWAY DHABA',
        urdu: 'المدینہ ہوٹل اینڈ کوئٹہ چائے',
        quote: 'HAR GHOONT MEIN TAZGI ☕',
        phone: 'FAMOUS 24/7 HIGHWAY STOP'
      },
      {
        bg: '#1e3a8a',
        border: '#facc15',
        header: 'WAPDA HIGHWAY ADVISORY',
        urdu: 'روڈ پر بجلی کے کھمبے سے فاصلہ رکھیں',
        quote: 'ELECTRICAL SAFETY FIRST!',
        phone: 'HELPLINE: 118 | WAPDA'
      },
      {
        bg: '#065f46',
        border: '#4ade80',
        header: 'SOHRAB CYCLE & CD 70',
        urdu: 'سہراب سائیکل - شانِ پاکستان',
        quote: 'MAZBOUT AUR PAAYDAAR!',
        phone: 'GENUINE SPARE PARTS AVAILABLE'
      },
      {
        bg: '#831843',
        border: '#f472b6',
        header: 'TAPAL DANEDAR TEA',
        urdu: 'تپال دانے دار چائے - ہر لمحہ پرجوش',
        quote: 'ASLI KADAK CHAI',
        phone: 'AVAILABLE AT ALL HIGHWAY DHABAS'
      },
      {
        bg: '#0f172a',
        border: '#38bdf8',
        header: 'PAK SUZUKI MEHRAN',
        urdu: 'سوزوکی مہران - دی بوس',
        quote: 'THE UNBEATABLE HIGHWAY BOSS',
        phone: 'LANE CHANGER SPECIALIST'
      }
    ];

    const b = boards[typeIndex % boards.length];

    ctx.fillStyle = b.bg;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.lineWidth = 18;
    ctx.strokeStyle = b.border;
    ctx.strokeRect(16, 16, 992, 480);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(36, 36, 952, 90);
    ctx.fillStyle = '#111827';
    ctx.font = '900 44px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.header, 512, 80);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 56px "Noto Nastaliq Urdu", "Segoe UI", sans-serif';
    ctx.fillText(b.urdu, 512, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px "Poppins", sans-serif';
    ctx.fillText(b.quote, 512, 335);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(b.phone, 512, 440);

    return this.canvasToTexture(canvas);
  },

  // 10. Realistic Weathered Pakistani Brick & Commercial Plaza Facade
  createBuildingFacadeTexture(styleIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const wallColors = ['#7c2d12', '#78350f', '#52525b', '#3f3f46'];
    ctx.fillStyle = wallColors[styleIndex % wallColors.length];
    ctx.fillRect(0, 0, 512, 512);

    // Brick mortar lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < 340; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Concrete floor ledges
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 140, 512, 12);
    ctx.fillRect(0, 290, 512, 12);

    // Realistic dark reflective windows
    for (let floor = 0; floor < 2; floor++) {
      const fy = 35 + floor * 150;
      for (let col = 0; col < 3; col++) {
        const cx = 40 + col * 155;
        ctx.fillStyle = '#18181b';
        ctx.fillRect(cx - 4, fy - 4, 118, 92);

        const glassGrad = ctx.createLinearGradient(cx, fy, cx, fy + 84);
        glassGrad.addColorStop(0, '#1e293b');
        glassGrad.addColorStop(0.5, '#0f172a');
        glassGrad.addColorStop(1, '#020617');
        ctx.fillStyle = glassGrad;
        ctx.fillRect(cx, fy, 110, 84);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx + 53, fy, 4, 84);
        ctx.fillRect(cx, fy + 40, 110, 4);
      }
    }

    // Pakistani Market Ground Floor Signboard
    const shopNames = [
      'چوہدری مارکیٹ اینڈ آٹو سپیئر پارٹس',
      'المدینہ ہوٹل اینڈ کوئٹہ چائے کیفے',
      'ملتان کڑاہی تکہ شاپ اینڈ ریسٹورنٹ',
      'پنجاب جنرل ہسپتال و فارمیسی'
    ];

    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(16, 350, 480, 140);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#facc15';
    ctx.strokeRect(20, 354, 472, 132);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Noto Nastaliq Urdu", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shopNames[styleIndex % shopNames.length], 256, 410);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 18px "Poppins", sans-serif';
    ctx.fillText('HIGHWAY PLAZA - SHOP ' + (styleIndex + 1), 256, 458);

    return this.canvasToTexture(canvas, 1, 1);
  },

  // 11. Dhaba Shop Sign
  createDhabaSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, 512, 128);

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#facc15';
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px "Noto Nastaliq Urdu", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('المدینہ ہوٹل اینڈ کوئٹہ چائے', 256, 45);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 22px "Poppins", sans-serif';
    ctx.fillText('AL-MADINA HIGHWAY DHABA', 256, 92);

    return this.canvasToTexture(canvas);
  },

  // 12. Honda CD 70 Fuel Tank Texture (Classic Red with Honda Wing)
  createCD70TankTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 512, 256);

    // Black and gold side wing stripes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, 100, 432, 60);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(40, 160, 432, 12);
    ctx.fillRect(40, 88, 432, 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HONDA', 256, 142);

    return this.canvasToTexture(canvas);
  }
};
