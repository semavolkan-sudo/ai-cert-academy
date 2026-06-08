import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/font-check")({
  head: () => ({
    meta: [
      { title: "Font Doğrulama — Türkçe Karakter Testi" },
      {
        name: "description",
        content:
          "Tüm site fontlarında Türkçe özel karakterlerin (ş, ç, ğ, ü, ö, ı, İ) doğru göründüğünü kontrol eden doğrulama sayfası.",
      },
    ],
  }),
  component: FontCheckPage,
});

const TR_CHARS = "ş Ş ç Ç ğ Ğ ü Ü ö Ö ı İ â Â î Î û Û";
const PANGRAM = "Pijamalı hasta yağız şoföre çabucak güvendi.";
const SAMPLE =
  "Çocuklar bahçede üzüm yerken İstanbul'da yağmur yağıyordu. Şu ışığı görüyor musun? Ağaçların gölgesinde öğleden sonra çayımızı içtik.";
const NUMBERS = "0123456789 — ¡!¿? «»";

const WEIGHTS: Array<{ label: string; className: string }> = [
  { label: "Regular 400", className: "font-normal" },
  { label: "Medium 500", className: "font-medium" },
  { label: "SemiBold 600", className: "font-semibold" },
  { label: "Bold 700", className: "font-bold" },
];

type FontBlockProps = {
  name: string;
  cssFamily: string;
  fontClass: string;
  description: string;
  usage: string;
};

function FontBlock({ name, cssFamily, fontClass, description, usage }: FontBlockProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className={`text-3xl ${fontClass}`}>{name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">CSS:</span> {cssFamily}
          </div>
          <div>
            <span className="font-medium text-foreground">Kullanım:</span> {usage}
          </div>
        </div>
      </header>

      <div className={`space-y-5 ${fontClass}`}>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            Türkçe özel karakterler
          </div>
          <p className="text-2xl leading-relaxed">{TR_CHARS}</p>
        </div>

        <div>
          <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            Pangram
          </div>
          <p className="text-xl leading-relaxed">{PANGRAM}</p>
        </div>

        <div>
          <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            Örnek metin
          </div>
          <p className="text-base leading-relaxed">{SAMPLE}</p>
        </div>

        <div>
          <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            Rakamlar ve noktalama
          </div>
          <p className="text-base leading-relaxed">{NUMBERS}</p>
        </div>

        <div>
          <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Ağırlıklar
          </div>
          <div className="space-y-1">
            {WEIGHTS.map((w) => (
              <p key={w.label} className={`text-lg ${w.className}`}>
                <span className="mr-3 inline-block w-32 text-xs text-muted-foreground">
                  {w.label}
                </span>
                Ağustos şafağında İğde çiçekleri öğüt verdi.
              </p>
            ))}
            <p className="text-lg italic">
              <span className="mr-3 inline-block w-32 text-xs not-italic text-muted-foreground">
                Italic 400
              </span>
              Ağustos şafağında İğde çiçekleri öğüt verdi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FontCheckPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            QA / Tipografi
          </p>
          <h1 className="font-serif text-5xl leading-tight">
            Türkçe Karakter Doğrulama Sayfası
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Bu sayfa sitedeki tüm fontların Türkçe özel karakterleri (ş, Ş, ç, Ç, ğ, Ğ,
            ü, Ü, ö, Ö, ı, İ) doğru şekilde gösterdiğini kontrol etmek için kullanılır.
            Eksik glif veya yanlış görüntüleme varsa, ilgili font için{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">latin-ext</code>{" "}
            alt kümesinin yüklendiğinden emin olun.
          </p>
        </header>

        <FontBlock
          name="DM Sans"
          cssFamily="var(--font-sans)"
          fontClass="font-sans"
          description="Gövde metni — paragraflar, arayüz metinleri, açıklamalar."
          usage="body, p, span"
        />

        <FontBlock
          name="Playfair Display"
          cssFamily="var(--font-serif)"
          fontClass="font-serif"
          description="Başlıklar ve vurgulu metinler — H1–H6, strong, em."
          usage="h1–h6, strong, em"
        />

        <FontBlock
          name="JetBrains Mono"
          cssFamily="var(--font-mono)"
          fontClass="font-mono"
          description="Kod blokları ve teknik metinler."
          usage="code, pre, kbd"
        />

        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          <h3 className="mb-2 font-serif text-lg text-foreground">Kontrol listesi</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tüm karakterler aynı font ailesinde görünüyor mu? (Glif değişimi yok)</li>
            <li>ı (noktasız) ve İ (noktalı) karakterleri net şekilde ayırt edilebiliyor mu?</li>
            <li>Tüm ağırlıklarda (400, 500, 600, 700) Türkçe karakterler doğru çiziliyor mu?</li>
            <li>Italic varyantta aksanlı karakterler hâlâ okunaklı mı?</li>
          </ul>
        </section>
      </div>
    </main>
  );
}