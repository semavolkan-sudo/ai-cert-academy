# AGENTS.md — AlpRoute

> Bu projede çalışan herhangi bir AI ajanı / geliştirici için işletim kuralları.
> Projeye özel mimari kararlar için `architecture.md`, makine-okur manifest için `index.json`.

## Proje özeti
AlpRoute (alproute.com) — karavan & motosiklet gece konaklama noktası
keşif PWA'sı. Saf HTML/JS (framework yok), Supabase + Vercel + harici servisler.
Marka: "Sema Volkan" (Einzelunternehmen / şahıs şirketi). Sahibi/geliştirici: Volkan (solo).

## İletişim dili
**Türkçe.** Tüm açıklamalar, planlar, commit/test talimatları Türkçe.

## ⛔ ASLA İHLAL EDİLMEYECEK KURALLAR

1. **Onay olmadan kod yok.** Önce sorunu analiz et + çözümü öner, sonra kullanıcı
   açıkça **"tamam" / "yap" / "yapalım"** diyene kadar **BEKLE**. Hiçbir dosyayı
   onaysız değiştirme.
2. **Repo PRIVATE.** GitHub'dan kaynak çekilemez. Kullanıcı dosyaları yükler
   (`/mnt/user-data/uploads/`), ajan düzenler, çıktıyı `/mnt/user-data/outputs/`'a koyar.
   Emin değilsen "güncel dosyayı yükler misin" diye iste — yanlış tabandan düzenleme.
3. **Güncel doküman.** Harici kütüphane/framework/API, kurulum adımı ve sürüme bağlı
   davranış için model hafızasına güvenme → `web_search` + `web_fetch` ile resmi
   dokümana bak. (Kullanıcı Context7 connector'ını güvenlik nedeniyle istemedi.)
   Projeye özel mimari/karar için yerel dosyaları esas al.
4. **Çocuk güvenliği / zararlı içerik** sınırları her zaman geçerli.

## Deploy akışı
- GitHub `main` branch → Vercel **otomatik deploy** (~1 dk).
- Kullanıcı dosyaları GitHub web arayüzünden **upload (sürükle-bırak) + commit** eder.
  - Repo kökü: `index.html`, `admin.html`, `sw.js`, landing/help/legal sayfaları.
  - `api/` klasörü: Vercel serverless fonksiyonları. Upload linki:
    `https://github.com/semavolkan-sudo/alproute/upload/main/api`
    - **enrich.js güncel BUILD: `find-site-2026-06-29d`.** Her yanıtta `build`/`source`
      alanı döner; `POST {debug:true}` ile canlı sürüm + env booleanları doğrulanır.
      enrich.js değişiklikleri **sw bump gerektirmez** (serverless, cache'lenmez).
- **SW cache sürümü:** `index.html` her değiştiğinde `sw.js` içindeki
  `const CACHE='alproute-shell-vN'` numarasını **+1 yap** (şu an **v113**). Yoksa
  kullanıcılar eski sürümü cache'ten görür.
  - `admin.html` değişiklikleri sw bump GEREKTİRMEZ (admin navigasyonu network-first,
    cache'lenmez). Sadece sert yenileme (Ctrl+Shift+R) yeterli.
  - Env değişkeni değişikliği mevcut deploy'a yansımaz → **Redeploy** gerekir.

## Kod düzenleme deseni (zorunlu)
1. Kullanıcının yüklediği dosyayı `/home/claude`'a kopyala.
2. Düzenlemeyi **Python ile** yap; her değişiklikte `assert s.count(old)==1`
   (heredoc kaçış sorunlarını önlemek için genelde bir `.py` dosyası `create_file` ile).
3. En büyük inline script'i çıkar ve doğrula:
   `max(re.findall(r'<script>(.*?)</script>', s, re.DOTALL), key=len)` → `/tmp/app.js` →
   `node --check /tmp/app.js`.
4. `/mnt/user-data/outputs/` 'a kopyala → `present_files`.
5. Kullanıcıya **net yükleme + test** talimatı ver (hangi dosya, sw bump gerek mi, ne test edilecek).

## DB değişiklikleri
- Yeni tablo/kolon/trigger için SQL'i **kullanıcı Supabase SQL Editor'de elle** çalıştırır.
- Supabase "RLS yok" uyarısı verirse: yalın `CREATE TABLE` veriyorsan **"Run without RLS"**
  (RLS'i sonraki blokta ekliyorsan). Büyük blokları **parça parça** çalıştır ki hata yeri belli olsun.
- SQL idempotent yazılır (`if not exists`, `drop policy if exists`, `create or replace`).

## Davranış / üslup
- Önce teşhis + plan, sonra onay, sonra uygulama. Tahmin yerine **veriye bak**
  (örn. log/`mod_debug` ile gerçek skoru gör).
- Kısa, net, eyleme dönük talimatlar. Adımları "tamam" dedikçe ilerlet (gated).
- Admin/uygulama mesajları **uygulama-içi** olmalı (native `alert`/`confirm` değil) —
  admin.html'de `uiToast`/`uiConfirm`, index.html'de `toast()`.
