import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";

const RESET_TTL_MS = 15 * 60 * 1000; // 15 dakika
const RESET_THROTTLE_MS = 60 * 1000; // 60 sn rate limit

function randomToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const verifyAdminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ email: z.string().email().max(255), password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase().trim();
    const { data: row } = await supabaseAdmin
      .from("admin_credentials")
      .select("email,password_hash")
      .eq("email", email)
      .maybeSingle();
    if (!row) return { ok: false as const };
    const ok = await bcrypt.compare(data.password, row.password_hash);
    return ok ? { ok: true as const, email: row.email } : { ok: false as const };
  });

export const requestAdminPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ email: z.string().email().max(255), origin: z.string().url().max(500) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase().trim();

    // Yanlış e-posta dahi olsa aynı cevabı dön (email enumeration koruması)
    const generic = { ok: true as const };

    const { data: admin } = await supabaseAdmin
      .from("admin_credentials")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (!admin) return generic;

    // Rate limit
    const since = new Date(Date.now() - RESET_THROTTLE_MS).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("admin_password_resets")
      .select("id")
      .eq("email", email)
      .gte("created_at", since)
      .limit(1);
    if (recent && recent.length > 0) return generic;

    const token = randomToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();

    await supabaseAdmin
      .from("admin_password_resets")
      .insert({ email, token_hash: tokenHash, expires_at: expiresAt });

    const resetUrl = `${data.origin.replace(/\/$/, "")}/admin/reset?token=${token}`;

    // Sunucu loguna düş — domain yokken admin yine de logdan link alabilir
    console.log("[admin-reset] Reset link for", email, "→", resetUrl);

    // Lovable Emails ile gönder (e-posta domain'i ayarlı ise çalışır)
    try {
      const sendUrl = `${data.origin.replace(/\/$/, "")}/lovable/email/transactional/send`;
      await fetch(sendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
        },
        body: JSON.stringify({
          templateName: "admin-password-reset",
          recipientEmail: email,
          idempotencyKey: `admin-reset-${tokenHash.slice(0, 16)}`,
          templateData: { resetUrl, expiresMinutes: 15 },
        }),
      });
    } catch (err) {
      console.error("[admin-reset] email send failed", err);
    }

    return generic;
  });

export const resetAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token: z.string().min(32).max(200),
        newPassword: z
          .string()
          .min(8, "Şifre en az 8 karakter olmalı")
          .max(200, "Şifre çok uzun"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tokenHash = await sha256Hex(data.token);
    const { data: reset } = await supabaseAdmin
      .from("admin_password_resets")
      .select("id,email,expires_at,used_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (!reset) return { ok: false as const, error: "Geçersiz link" };
    if (reset.used_at) return { ok: false as const, error: "Bu link zaten kullanılmış" };
    if (new Date(reset.expires_at).getTime() < Date.now())
      return { ok: false as const, error: "Linkin süresi dolmuş" };

    const newHash = await bcrypt.hash(data.newPassword, 10);
    await supabaseAdmin
      .from("admin_credentials")
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq("email", reset.email);
    await supabaseAdmin
      .from("admin_password_resets")
      .update({ used_at: new Date().toISOString() })
      .eq("id", reset.id);
    return { ok: true as const };
  });

export const changeAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email().max(255),
        currentPassword: z.string().min(1).max(200),
        newPassword: z.string().min(8).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase().trim();
    const { data: row } = await supabaseAdmin
      .from("admin_credentials")
      .select("password_hash")
      .eq("email", email)
      .maybeSingle();
    if (!row) return { ok: false as const, error: "Yönetici bulunamadı" };
    const ok = await bcrypt.compare(data.currentPassword, row.password_hash);
    if (!ok) return { ok: false as const, error: "Mevcut şifre yanlış" };
    const newHash = await bcrypt.hash(data.newPassword, 10);
    await supabaseAdmin
      .from("admin_credentials")
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq("email", email);
    return { ok: true as const };
  });