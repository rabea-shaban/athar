/**
 * سكربت التحميل الشامل الموحد لمكتبة أَثَر الرقمية
 * يقوم هذا السكربت بتحميل ملفات الـ PDF الأصلية والموثقة من:
 * 1. جامع الكتب الإسلامية (ketabonline.com)
 * 2. الأرشيف العالمي المفتوح والمستودعات الرقمية الموثقة
 *
 * لتشغيل السكربت: node scripts/download_all_books.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const outputDir = path.join(__dirname, '..', 'public', 'books', 'pdf');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// قائمة روابط التحميل المباشرة والموثقة لأمهات الكتب في أَثَر
const BOOKS_CATALOG = [
  // ─── الدفعة الأولى: الكتب التي تم تنزيلها وتوثيقها مسبقاً ───
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
  },
  {
    slug: 'bulugh-al-maram',
    title: 'بلوغ المرام من أدلة الأحكام',
    url: 'https://archive.org/download/waq46061/46061.pdf'
  },
  {
    slug: 'al-daa-wad-dawaa',
    title: 'الداء والدواء (الجواب الكافي)',
    url: 'https://archive.org/download/FP11612/11612.pdf'
  },
  {
    slug: 'al-wabil-al-sayyib',
    title: 'الوابل الصيب من الكلم الطيب',
    url: 'https://archive.org/download/FP11613/11613.pdf'
  },
  {
    slug: 'sayd-al-khatir',
    title: 'صيد الخاطر',
    url: 'https://archive.org/download/FP11614/11614.pdf'
  },
  {
    slug: 'matn-al-ajrumiyyah',
    title: 'متن الآجرومية في علم العربية',
    url: 'https://archive.org/download/FP11616/11616.pdf'
  },
  {
    slug: 'nukhbat-al-fikar',
    title: 'نخبة الفكر في مصطلح أهل الأثر',
    url: 'https://archive.org/download/FP11618/11618.pdf'
  },
  {
    slug: 'al-aqeedah-al-tahawiyyah',
    title: 'العقيدة الطحاوية',
    url: 'https://archive.org/download/FP11619/11619.pdf'
  },
  {
    slug: 'al-adab-al-mufrad',
    title: 'الأدب المفرد',
    url: 'https://archive.org/download/FP11620/11620.pdf'
  },
  {
    slug: 'al-muqaddimah-al-jazariyyah',
    title: 'المقدمة الجزرية في التجويد',
    url: 'https://archive.org/download/FP11621/11621.pdf'
  },

  // ─── الدفعة الثانية: كتب موثقة مباشرة من جامع الكتب الإسلامية (ketabonline.com) ───
  {
    slug: 'sahih-al-bukhari',
    title: 'صحيح البخاري',
    url: 'https://s2.ketabonline.com/uploads/2020/04/1695671570736243800.pdf'
  },
  {
    slug: 'tafsir-ibn-kathir',
    title: 'تفسير القرآن العظيم (ابن كثير)',
    url: 'https://s2.ketabonline.com/uploads/2020/04/404656107825699088.pdf'
  },
  {
    slug: 'tafsir-al-tabari',
    title: 'تفسير الطبري (جامع البيان)',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2362234696442841168.pdf'
  },
  {
    slug: 'jami-al-ulum-wal-hikam',
    title: 'جامع العلوم والحكم ت الأرنؤوط',
    url: 'https://s2.ketabonline.com/uploads/2020/04/505641156249630464.pdf'
  },
  {
    slug: 'muqaddimat-ibn-al-salah',
    title: 'مقدمة ابن الصلاح في علوم الحديث',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2664689375125805701.pdf'
  },
  {
    slug: 'zad-al-maad',
    title: 'زاد المعاد في هدي خير العباد',
    url: 'https://s2.ketabonline.com/uploads/2020/04/1018453468294976280.pdf'
  },
  {
    slug: 'al-tibyan-fi-adab-hamalat-al-quran',
    title: 'التبيان في آداب حملة القرآن',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2620819176564181692.pdf'
  },
  {
    slug: 'asbab-al-nuzul-al-wahidi',
    title: 'أسباب النزول للواحدي',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2556429998120747358.pdf'
  },
  {
    slug: 'bidayat-al-mujtahid',
    title: 'بداية المجتهد ونهاية المقتصد',
    url: 'https://s2.ketabonline.com/uploads/2020/04/68382091094373631.pdf'
  },
  {
    slug: 'matn-abi-shuja',
    title: 'متن أبي شجاع (الغاية والتقريب)',
    url: 'https://s2.ketabonline.com/uploads/2020/04/1559339068989566658.pdf'
  },
  {
    slug: 'sharh-al-aqeedah-al-tahawiyyah',
    title: 'شرح العقيدة الطحاوية ت الأرناؤوط',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2588487342409316448.pdf'
  },
  {
    slug: 'qawaid-al-ahkam-al-izz',
    title: 'قواعد الأحكام في مصالح الأنام للعز بن عبد السلام',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2664957200789776526.pdf'
  },
  {
    slug: 'al-waraqat-fi-usul-al-fiqh',
    title: 'شرح الورقات في أصول الفقه',
    url: 'https://s2.ketabonline.com/uploads/2020/04/560964192159744573.pdf'
  },
  {
    slug: 'ihya-ulum-al-din',
    title: 'إحياء علوم الدين للإمام الغزالي',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2366370803602699915.pdf'
  },
  {
    slug: 'madarij-al-salikin',
    title: 'مدارج السالكين لابن قيم الجوزية',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2924777295823059822.pdf'
  },
  {
    slug: 'sifat-al-safwah',
    title: 'صفة الصفوة لابن الجوزي',
    url: 'https://s2.ketabonline.com/uploads/2020/04/1751109263201157570.pdf'
  },
  {
    slug: 'al-bidayah-wan-nihayah',
    title: 'البداية والنهاية لابن كثير',
    url: 'https://s2.ketabonline.com/uploads/2020/04/3216305046585885880.pdf'
  },
  {
    slug: 'tarikh-al-tabari',
    title: 'تاريخ الطبري (تاريخ الأمم والملوك)',
    url: 'https://s2.ketabonline.com/uploads/2020/04/1472789305909348428.pdf'
  },
  {
    slug: 'muqaddimat-ibn-khaldun',
    title: 'تاريخ ومقدمة ابن خلدون',
    url: 'https://s2.ketabonline.com/uploads/2020/04/3070922894804515304.pdf'
  },
  {
    slug: 'qatr-al-nada',
    title: 'شرح قطر الندى وبل الصدى',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2520946372353785472.pdf'
  },
  {
    slug: 'shudhur-al-dhahab',
    title: 'متن شذور الذهب في معرفة كلام العرب',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2325877537971275440.pdf'
  },
  {
    slug: 'wahy-al-qalam',
    title: 'وحي القلم لمصطفى صادق الرافعي',
    url: 'https://s2.ketabonline.com/uploads/2020/04/2660097807099258960.pdf'
  },
  {
    slug: 'ijaz-al-quran-al-rafii',
    title: 'إعجاز القرآن والبلاغة النبوية للرافعي',
    url: 'https://s2.ketabonline.com/uploads/2020/04/974000414001612468.pdf'
  },
  {
    slug: 'qawaid-al-tahdith',
    title: 'قواعد التحديث من فنون مصطلح الحديث للقاسمي',
    url: 'https://s2.ketabonline.com/uploads/2020/04/1372626238929934871.pdf'
  },
  {
    slug: 'tuhfat-al-mawdud-ibn-al-qayyim',
    title: 'تحفة المودود بأحكام المولود لابن القيم',
    url: 'https://s2.ketabonline.com/uploads/2020/04/978044960953522812.pdf'
  },
  {
    slug: 'fath-al-bari-ibn-hajar',
    title: 'فتح الباري بشرح صحيح البخاري لابن حجر',
    url: 'https://s2.ketabonline.com/uploads/2020/04/308860881019519218.pdf'
  },

  // ─── الدفعة الثالثة: كتب إضافية موثقة من المستودعات الرقمية العالمية ───
  {
    slug: 'abqariyyat-umar',
    title: 'عبقرية عمر للعقاد',
    url: 'https://archive.org/download/goodman_egypt82_yahoo_201304/%25D8%25B9%25D8%25A8%25D9%2582%25D8%25B1%25D9%258A%25D8%25A9%20%25D8%25B9%25D9%2585%25D8%25B1.pdf'
  },
  {
    slug: 'abqariyyat-al-siddiq',
    title: 'عبقرية الصديق للعقاد',
    url: 'https://archive.org/download/biography00038/Biography-00038.pdf'
  },
  {
    slug: 'fajr-al-islam',
    title: 'فجر الإسلام لأحمد أمين',
    url: 'https://archive.org/download/FagrAlIslam01/FagrAlIslam01.pdf'
  },
  {
    slug: 'dhuha-al-islam',
    title: 'ضحى الإسلام لأحمد أمين',
    url: 'https://archive.org/download/ghiloufik_gmail_20160901_2303/%D8%B6%D8%AD%D9%89_%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85.pdf'
  },
  {
    slug: 'tarbiyat-al-awlad-fi-al-islam',
    title: 'تربية الأولاد في الإسلام لعبد الله علوان',
    url: 'https://archive.org/download/iqraaEBook62/%D8%AA%D8%B1%D8%A8%D9%8A%D8%A9_%D8%A7%D9%84%D8%A3%D9%88%D9%84%D8%A7%D8%AF_%D9%81%D9%8A_%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85.pdf'
  },
  {
    slug: 'al-balaghah-al-wadihah',
    title: 'البلاغة الواضحة للجارم وأمين',
    url: 'https://archive.org/download/Heliopolis1957_gmail_20180525_0206/%D8%A7%D9%84%D8%A8%D9%84%D8%A7%D8%BA%D8%A9%20%D8%A7%D9%84%D9%88%D8%A7%D8%B6%D8%AD%D8%A9.pdf'
  },
  {
    slug: 'suwar-min-hayat-al-sahabah',
    title: 'صور من حياة الصحابة للباشا',
    url: 'https://archive.org/download/shamse_20170620_1547/%D8%B5%D9%88%D8%B1%20%D9%85%D9%86%20%D8%AD%D9%8A%D8%A7%D8%A9%20%D8%A7%D9%84%D8%B5%D8%AD%D8%A7%D8%A8%D8%A9.pdf'
  },
  {
    slug: 'suwar-min-hayat-al-tabieen',
    title: 'صور من حياة التابعين للباشا',
    url: 'https://archive.org/download/shamse_20170620_1550/%D8%B5%D9%88%D8%B1%20%D9%85%D9%86%20%D8%AD%D9%8A%D8%A7%D8%A9%20%D8%A7%D9%84%D8%AA%D8%A7%D8%A8%D8%B9%D9%8A%D9%86.pdf'
  },
  {
    slug: 'qasas-al-anbiya-ibn-kathir',
    title: 'قصص الأنبياء لابن كثير',
    url: 'https://archive.org/download/iqraaEBook54/%D9%82%D8%B5%D8%B5_%D8%A7%D9%84%D8%A3%D9%86%D8%A8%D9%8A%D8%A7%D8%A1_%D8%A7%D8%A8%D9%86_%D9%83%D8%AB%D9%8A%D8%B1.pdf'
  },
  {
    slug: 'lum-at-al-itiqad',
    title: 'لمعة الاعتقاد لابن قدامة المقدسي',
    url: 'https://archive.org/download/eng_736/%D9%85%D8%AA%D9%86%20%D9%84%D9%85%D8%B9%D8%A9%20%D8%A7%D9%84%D8%A7%D8%B9%D8%AA%D9%82%D8%A7%D8%AF.pdf'
  },
  {
    slug: 'tarikh-al-khulafa-al-suyuti',
    title: 'تاريخ الخلفاء للسيوطي',
    url: 'https://archive.org/download/Tarikh_Khlafa_Suyuti/Tarikh_Khlafa_Suyuti.pdf'
  },
  {
    slug: 'akhlaq-hamalat-al-quran-ajurri',
    title: 'أخلاق حملة القرآن للآجري',
    url: 'https://archive.org/download/Sharh_Akhlak_hamalat_Quran/Akhlak_hamalat_Quran.pdf'
  },
  {
    slug: 'tarikh-adab-al-arab',
    title: 'تاريخ آداب العرب للرافعي',
    url: 'https://archive.org/download/tarikh-adab-arab-rafii_202103/70629206.pdf'
  },
  {
    slug: 'al-fiqh-al-muyassar',
    title: 'الفقه الميسر في ضوء الكتاب والسنة',
    url: 'https://archive.org/download/20201022_20201022_0517/%D8%A7%D9%84%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%85%D9%8A%D8%B3%D8%B1%20%D9%81%D9%8A%20%D8%B6%D9%88%D8%A1%20%D8%A7%D9%84%D9%83%D8%AA%D8%A7%D8%A8%20%D9%88%D8%A7%D9%84%D8%B3%D9%86%D8%A9%20-%20%D9%85%D9%84%D9%88%D9%86.pdf'
  },
  {
    slug: 'qawaid-al-tadabbur-al-amthal',
    title: 'قواعد التدبر الأمثل للميداني',
    url: 'https://archive.org/download/qawaed_tadabor/%D9%82%D9%88%D8%A7%D8%B9%D8%AF%20%D8%A7%D9%84%D8%AA%D8%AF%D8%A8%D8%B1%20%D8%A7%D9%84%D8%A3%D9%85%D8%AB%D9%84%20%D9%84%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D9%84%D9%87%20%D8%B9%D8%B2%20%D9%88%D8%AC%D9%84.pdf'
  },
  {
    slug: 'al-akhlaq-al-islamiyyah-maydani',
    title: 'الأخلاق الإسلامية وأسسها للميداني',
    url: 'https://archive.org/download/DrAhmedSbalekBooks_0002/alio1.pdf'
  },
  {
    slug: 'al-mukhtasar-fi-tafsir-al-quran',
    title: 'المختصر في تفسير القرآن الكريم',
    url: 'https://archive.org/download/Mokhtasr_Tafsir/%D8%A7%D9%84%D8%AC%D8%B2%D8%A1%2000.pdf'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    function request(targetUrl) {
      const client = targetUrl.startsWith('https') ? https : http;
      client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      }, (res) => {
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
  console.log('  المصادر: جامع الكتب الإسلامية (ketabonline) + المستودعات المفتوحة');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`إجمالي الكتب في الكتالوج: ${BOOKS_CATALOG.length} كتاب`);
  console.log(`المسار المستهدف: ${outputDir}\n`);

  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  for (let i = 0; i < BOOKS_CATALOG.length; i++) {
    const book = BOOKS_CATALOG[i];
    const dest = path.join(outputDir, `${book.slug}.pdf`);
    const prefix = `[${i + 1}/${BOOKS_CATALOG.length}]`;

    if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
      const sizeMb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
      console.log(`${prefix} [موجود مسبقاً] ${book.title} (${sizeMb} MB)`);
      skippedCount++;
      continue;
    }

    console.log(`${prefix} [جاري التحميل] ${book.title}...`);
    try {
      const t0 = Date.now();
      const res = await downloadFile(book.url, dest);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const mb = (res.downloaded / (1024 * 1024)).toFixed(2);
      console.log(`${prefix} [اكتمل التحميل] ${book.title} -> ${mb} MB خلال ${elapsed} ثانية`);
      successCount++;
    } catch (e) {
      console.error(`${prefix} [تعذر التحميل] ${book.title}: ${e.message}`);
      failCount++;
    }
  }

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`النتيجة: تم تنزيل ${successCount} كتاب بنجاح، وتخطي ${skippedCount} كتاب متوفر، وفشل ${failCount}.`);
  console.log(`إجمالي الكتب المتوفرة محلياً الآن: ${fs.readdirSync(outputDir).length} كتاب.`);
  console.log('═══════════════════════════════════════════════════════════');
}

start();
