#!/usr/bin/env node
// Türkçe diakritik denetleyici.
// Tarama: src/ ve public/ altındaki .ts/.tsx/.js/.jsx/.json/.md/.html/.txt dosyalarındaki
// string literal ve JSX text içeriklerinde, diakritiksiz yaygın Türkçe
// kelimelerin (örn. "kisi", "sifre", "Cikis") kalıp kalmadığını kontrol eder.
//
// Kullanım:
//   node scripts/check-turkish-diacritics.mjs              # tüm proje
//   node scripts/check-turkish-diacritics.mjs path1 path2  # belirli dosyalar
//
// Çıkış kodu 1 → eksik bulundu (CI/pre-commit için).

import { readFileSync, statSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";

// Diakritiksiz yazıldığı tespit edilirse hata verilecek Türkçe kelimeler.
// Buraya yalnızca diakritik olmadan ASCII'de yazılması yanlış olan kelimeler eklenmeli.
const FORBIDDEN = new Set([
  // Sık geçen fiil/isim kökleri
  "kisi", "kisiler", "kayit", "kayitli", "kayitlisin",
  "sifre", "sifreler", "sifren", "sifrenle",
  "cikis", "cikisi", "cikisin",
  "yukleniyor", "yukle", "yukledikten", "yukaridaki", "yukselt",
  "gonder", "gonderildi", "gonderdi", "gonderdigimiz", "gonderisi",
  "ogrenci", "ogrencilerimiz", "ogrenciye", "ogrendim", "ogrenme",
  "ogren", "ogrenelim", "ogrenecek", "ogreyin",
  "ustat", "sertifikali", "sertifikami", "sertifikani",
  "kullanici", "kullanicilar", "kullaniciya", "kullanim",
  "cevir", "cevrimici", "cevirmek",
  "ardisik", "gunluk", "gunde", "bugun",
  "tum", "hic", "henuz", "guvenli", "guvenilir", "guc",
  "buyuk", "kucuk", "uye", "uyeleri",
  "ozel", "ozellik", "ozellikler", "ozelligi", "ozelliklerini",
  "musteri", "musteriler", "mukemmel", "populer",
  "donustur", "duzenle", "duzenleme", "duygusal",
  "olustur", "olusturuldu", "olusturuluyor", "olusturuyor",
  "icin", "icerik", "icerigi", "icerikler", "icerikleri",
  "ipuclari", "ipucu",
  "sinav", "sinavi", "sinirsiz",
  "kazandiran", "kazandirir", "tamamla", "tamamladin", "tamamladigini",
  "tarihce", "takim", "takimda",
  "toplulugu", "ucretsiz", "ucretli",
  "akislari", "akisi", "akisina", "aninda",
  "araclari", "araclariyla", "araclarini", "arasindaki",
  "arayuz", "ayse",
  "basla", "baslat", "baslik", "basariyla", "basarsin",
  "bekleniyor", "bilmeyen",
  "cumle", "calisma", "calisanlari", "calis",
  "dagilimi", "dakikada",
  "diger", "dogru", "dogrula", "dogrulandi", "dogrulaniyor", "doldu",
  "ediyorum", "ediyorsun", "ekibimden",
  "erisim", "farklari",
  "gec", "gecerli", "gecis", "gercek",
  "gizlilik", "gorursun", "gorev", "gorevleri", "gorsel",
  "hazir", "hazirlaniyor",
  "hayatin", "hayatinda", "hizliyim",
  "hesabin", "hesabinla",
  "inanilmaz",
  "kapsamli", "kariyerini", "kazan", "kazanma",
  "kontrolu", "kopyalandi", "kosullari",
  "limitine", "liderboard",
  "muduru",
  "nasil",
  "olarak",
  "ornek", "ornegi", "ornegiyle", "orneklerle",
  "ozetle",
  "paragrafilik", "paragraflik",
  "politikasini", "programi", "programini",
  "sablonlari", "sablonu", "sagla", "samimi", "secmelisin",
  "sertifika",
  "siralamasi", "sirket", "sicak",
  "sifirdan", "kisayol", "kacinirsin",
  "tarihi", "tona",
  "ulasildi",
  "uretecek", "uretiliyor", "uretilen", "uretkenlik", "uretir",
  "uzman",
  "yapay", "yapilan", "yapimi", "yanitliyor", "yanit", "yanilabilir",
  "yazarisin", "yazarsin",
  "yonetim",
  "zeka",
  "akici", "atik", "ayarlandigini",
  "baglam", "baglamli", "bagimsiz",
  "basla", "baslang",
  "cikar", "ciktilarini",
  "donem", "duzeyde",
  "egitmensin", "egitim",
  "girisi", "girisimci",
  "guzel", "guncel", "guncelleme",
  "hosgeldin",
  "iyilestir", "iyilestirme",
  "kullanilir", "kullanilabilir", "kullanisli", "kullanir", "kullanirsin", "kullanilirsin",
  "yapilir", "yapilmis",
  "ozne",
  "sasirt", "sasirtici",
  "tasarim", "tasarladi", "tasarladim",
  "uretiyor",
  "yardim", "yardimci",
  // Tek harfli özel: yalnızca İ/I ayrımıyla ilgili — ASCII "Iyi" hatadır.
  "iyi",
]);

// İstisna sözcükler (kod kelimeleri, marka adları vs.): regex eşleşse bile atlanır.
const ALLOW = new Set([
  "ai", "api", "url", "html", "css", "json", "ml", "xp", "ui", "ux",
  "div", "span", "auth", "user", "users", "tier", "plan", "post", "get",
  "true", "false", "null", "var", "let", "const", "function", "return",
  "name", "title", "type", "data", "props", "state", "value", "key",
  "icon", "color", "size", "font", "code", "demo", "test", "tab", "tabs",
  "level", "step", "done", "list", "row", "col", "id", "ref", "src",
  "Pro", "Starter", "Business", "Premium", "Temel", "Kurumsal", "Mentor",
  "Bonus", "Discord", "LinkedIn", "JetBrains", "Playfair", "Georgia",
  "Academy", "Certification", "Supabase", "Proxy", "Auth", "Link",
  "Onboarding", "Dashboard", "Login", "Admin",
]);

const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".html", ".txt", ".mdx"]);
const ROOTS = ["src", "public", "content"];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist" || e.name === ".wrangler" || e.name.startsWith(".")) continue;
      walk(p, out);
    } else if (e.isFile()) {
      if (e.name === "routeTree.gen.ts") continue;
      if (EXTS.has(extname(e.name))) out.push(p);
    }
  }
  return out;
}

function collectStrings(src) {
  // String literalleri ve JSX text içerikleri (>...<) yakala.
  const segments = [];
  const strRe = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`((?:\\.|[^`\\\$])*)`/g;
  let m;
  while ((m = strRe.exec(src))) {
    const s = m[1] ?? m[2] ?? m[3];
    if (s) segments.push({ start: m.index + 1, text: s });
  }
  const jsxRe = />([^<>{}\n]+)</g;
  while ((m = jsxRe.exec(src))) {
    segments.push({ start: m.index + 1, text: m[1] });
  }
  return segments;
}

function lineOf(src, idx) {
  let line = 1;
  for (let i = 0; i < idx && i < src.length; i++) if (src.charCodeAt(i) === 10) line++;
  return line;
}

function scanFile(file) {
  const src = readFileSync(file, "utf8");
  // Yalnızca Türkçe içerik barındıran dosyaları tara: en az bir Türkçe karakter veya yaygın TR kelime varsa.
  // (İngilizce-only kaynak kodu için gürültü olmaz.)
  const hasTurkishHint = /[çğıöşüÇĞİÖŞÜ]/.test(src) || /\b(ile|veya|için|bir|gün|şey|gerek)\b/.test(src);
  if (!hasTurkishHint) return [];
  const segs = collectStrings(src);
  const hits = [];
  for (const { start, text } of segs) {
    if (!/[A-Za-z]/.test(text)) continue;
    const tokenRe = /[A-Za-z]+/g;
    let tm;
    while ((tm = tokenRe.exec(text))) {
      const w = tm[0];
      const lw = w.toLowerCase();
      if (ALLOW.has(w) || ALLOW.has(lw)) continue;
      if (FORBIDDEN.has(lw)) {
        hits.push({ line: lineOf(src, start + tm.index), word: w, snippet: text.slice(Math.max(0, tm.index - 30), tm.index + 40) });
      }
    }
  }
  return hits;
}

const args = process.argv.slice(2);
const targets = args.length
  ? args
  : ROOTS.flatMap((r) => { try { return statSync(r).isDirectory() ? walk(r) : [r]; } catch { return []; } });

let total = 0;
for (const f of targets) {
  let hits;
  try { hits = scanFile(f); } catch { continue; }
  if (hits.length) {
    console.error(`\n${relative(process.cwd(), f)}`);
    for (const h of hits) {
      console.error(`  L${h.line}  [${h.word}]  …${h.snippet.trim()}…`);
      total++;
    }
  }
}

if (total > 0) {
  console.error(`\n✗ ${total} Türkçe diakritik eksikliği bulundu. Yukarıdaki kelimeleri düzeltin (ş, ç, ğ, ü, ö, ı, İ).`);
  process.exit(1);
}
console.log("✓ Türkçe diakritik kontrolü temiz.");