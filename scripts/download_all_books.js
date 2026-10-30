/**
 * سكربت التحميل الشامل لكتب منصة أَثَر الرقمية
 * يقوم هذا السكربت بتحميل ملفات الـ PDF الأصلية والمحققة إلى مجلد public/books/pdf/
 * لتشغيل السكربت: node scripts/download_all_books.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const outputDir = path.join(__dirname, '..', 'public', 'books', 'pdf');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// قائمة روابط التحميل المباشرة والموثقة لأمهات الكتب
const BOOKS_CATALOG = [
  {
    slug: 'al-arbaun-al-nawawiyyah',
    title: 'الأربعون النووية مع شرحها',
    url: 'https://archive.org/download/arbaoon-nawawi-darul-minhaj/Arbaoon%20Nawawi%20-%20Darul%20Minhaj.pdf'
  },
  {
    slug: 'hisn-al-muslim',
    title: 'حصن المسلم من أذكار الكتاب والسنة',
    url: 'https://archive.org/download/a1544n/a1544n.pdf'
  },
  {
    slug: 'kitab-al-tawhid',
    title: 'كتاب التوحيد الذي هو حق الله على العبيد',
    url: 'https://archive.org/download/kitab-tawe7id/%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%A8%D9%86%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8%20.pdf'
  },
  {
    slug: 'al-aqeedah-al-wasitiyyah',
    title: 'العقيدة الواسطية',
    url: 'https://archive.org/download/3qidawasitia/%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%A7%D8%B3%D8%B7%D9%8A%D8%A9%20%D8%AA%D8%AD%D9%82%D9%8A%D9%82%20%D8%B9%D9%84%D9%88%D9%8A%20%D8%A7%D9%84%D8%B3%D9%82%D8%A7%D9%81.pdf'
  },
  {
    slug: 'abqariyyat-muhammad',
    title: 'عبقرية محمد',
    url: 'https://archive.org/download/iqraaEBook70/%D8%B9%D8%A8%D9%82%D8%B1%D9%8A%D8%A9_%D9%85%D8%AD%D9%85%D8%AF.pdf'
  },
  {
    slug: 'al-rahiq-al-makhtum',
    title: 'الرحيق المختوم',
    url: 'https://archive.org/download/sealed_nectar/sealed_nectar.pdf'
  },
  {
    slug: 'riyadh-al-salihin',
    title: 'رياض الصالحين من كلام سيد المرسلين',
    url: 'https://archive.org/download/rsnawwy/rs.pdf'
  },
  {
    slug: 'al-shamail-al-muhammadiyyah',
    title: 'الشمائل المحمدية للترمذي',
    url: 'https://archive.org/download/chamael_fahl/%D8%B4%D9%85%D8%A7%D9%8A%D9%94%D9%84_%D8%A7%D9%84%D9%86%D8%A8%D9%8A_%D8%A7%D9%84%D8%B4%D9%85%D8%A7%D9%8A%D9%94%D9%84_%D8%A7%D9%84%D9%85%D8%AD%D9%85%D8%AF%D9%8A%D8%A9_%D8%AA%D8%AD%D9%82%D9%8A%D9%82_%D9%85%D8%A7%D9%87%D8%B1_%D8%A7%D9%84%D9%81%D8%AD%D9%84_%D8%A7%D9%93%D8%AE%D8%B1_%D8%B7%D8%A8%D8%B9%D8%A9_2023.pdf'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    function request(targetUrl) {
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let nextUrl = res.headers.location;
          if (nextUrl.startsWith('/')) {
            const u = new URL(targetUrl);
            nextUrl = `${u.protocol}//${u.host}${nextUrl}`;
          }
          request(nextUrl);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP Status ${res.statusCode}`));
          return;
        }

        const total = parseInt(res.headers['content-length'] || '0', 10);
        let downloaded = 0;

        res.on('data', (chunk) => {
          downloaded += chunk.length;
        });

        res.pipe(file);

        file.on('finish', () => {
          file.close(() => resolve({ total, downloaded }));
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }

    request(url);
  });
}

async function start() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  مكتبة أَثَر الرقمية — سكربت التحميل الآلي المباشر للكتب');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`المسار المستهدف: ${outputDir}\n`);

  let successCount = 0;
  let skippedCount = 0;

  for (const book of BOOKS_CATALOG) {
    const dest = path.join(outputDir, `${book.slug}.pdf`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
      const sizeMb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
      console.log(`[موجود مسبقاً] ${book.title} (${sizeMb} MB)`);
      skippedCount++;
      continue;
    }

    console.log(`[جاري التحميل] ${book.title}...`);
    try {
      const t0 = Date.now();
      const res = await downloadFile(book.url, dest);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const mb = (res.downloaded / (1024 * 1024)).toFixed(2);
      console.log(`[اكتمل التحميل] ${book.title} -> ${mb} MB خلال ${elapsed} ثانية`);
      successCount++;
    } catch (e) {
      console.error(`[تعذر التحميل] ${book.title}: ${e.message}`);
    }
  }

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`النتيجة: تم تنزيل ${successCount} كتاب، وتخطي ${skippedCount} كتاب متوفر مسبقاً.`);
  console.log('═══════════════════════════════════════════════════════════');
}

start();
