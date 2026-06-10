## Hedef
`ADMIN_PASS` artık `src/AppPage.tsx` içinde düz metin olmayacak. Doğrulama Lovable Cloud'a (sunucu tarafına) taşınacak; "Şifremi unuttum" tek kullanımlık e-posta linki ile çalışacak.

## Önkoşullar (otomatik kurulacak)
1. **Lovable Cloud** etkinleştirilecek (Supabase backend).
2. **Lovable Emails** + e-posta domain'i (kullanıcının `<presentation-open-email-setup>` ile bağlaması gerekir; DNS doğrulanmadan da sıfırlama linkleri kuyruğa girer, doğrulandığında gönderilir).

## Veri modeli (yeni migration)
- `admin_credentials` — `id`, `email` (unique), `password_hash` (bcrypt), `updated_at`. RLS açık, hiçbir politika yok (sadece service_role erişir).
- `admin_password_resets` — `id`, `email`, `token_hash`, `expires_at` (15 dk), `used_at`. RLS açık, politika yok.
- Seed: mevcut `ADMIN_EMAIL` için satır oluşturulur; başlangıç şifresi mevcut `aicert-admin-2024` hash'lenmiş halde yazılır (geriye dönük uyumluluk için, kullanıcı ilk girişte değiştirebilir).

## Sunucu fonksiyonları (`src/lib/admin-auth.functions.ts`)
- `verifyAdminLogin({ email, password })` → bcrypt.compare. Başarılıysa kısa ömürlü (8 saat) imzalı bir session token döndürür; localStorage'a yazılır.
- `requestAdminPasswordReset({ email })` → token üretir, hash'ler, `admin_password_resets` tablosuna yazar, Lovable Emails ile `/admin/reset?token=...` linkini ADMIN_EMAIL'e gönderir. Email enumeration'a karşı her durumda success döner.
- `resetAdminPassword({ token, newPassword })` → token'ı doğrular, bcrypt hash yazar, token'ı `used_at` ile işaretler.
- Hepsi `supabaseAdmin` ile çalışır, handler içinde dynamic import edilir.

## E-posta şablonu
- `src/lib/email-templates/admin-password-reset.tsx` — marka renkleriyle, 15 dk geçerli linki ve güvenlik uyarısı içerir.

## UI değişiklikleri (`src/AppPage.tsx`)
- `ADMIN_PASS` sabiti tamamen kaldırılır. `ADMIN_KEY` (Vercel proxy için kullanılan ayrı admin key) şimdilik kalır — kapsam dışı.
- Login formundaki istemci taraflı şifre kontrolü `verifyAdminLogin` server fn çağrısıyla değiştirilir.
- Login formunun altına **"Şifremi unuttum"** linki eklenir → `requestAdminPasswordReset` çağırır, "E-postanızı kontrol edin" mesajı gösterir.
- Admin paneline opsiyonel **"Şifre değiştir"** kartı (eski şifre + yeni şifre) eklenir.

## Yeni route
- `src/routes/admin.reset.tsx` — URL'deki token ile yeni şifre formu, `resetAdminPassword` çağırır.

## Güvenlik notları
- Şifreler bcrypt (cost 10) ile hash'lenir; düz metin asla DB'ye yazılmaz.
- Reset token'ları sadece hash'leri saklanır, plaintext yalnızca e-postada görünür.
- Rate limit: aynı e-posta için 60 sn içinde tekrar reset talebi engellenir.
- Migration sonrası `aicert-admin-2024` başlangıç şifresi geçerli kalır — kullanıcı ilk giriş sonrası değiştirmelidir (login sonrası uyarı banner'ı gösterilir).

## Sırada
Onay verirseniz: Cloud'u açar, e-posta domain kurulum diyaloğunu sunarım, sonra migration + server fn + UI değişikliklerini uygularım.
