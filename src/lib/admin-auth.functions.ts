import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";

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