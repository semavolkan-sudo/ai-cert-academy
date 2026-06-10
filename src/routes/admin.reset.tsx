import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { resetAdminPassword } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/admin/reset")({
  component: AdminResetPage,
  errorComponent: ({ error }) => (
    <div style={{ padding: 32, color: "#fff", background: "#070711", minHeight: "100vh" }}>
      Hata: {String(error?.message ?? error)}
    </div>
  ),
  notFoundComponent: () => (
    <div style={{ padding: 32, color: "#fff", background: "#070711", minHeight: "100vh" }}>
      Sayfa bulunamadı.
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Şifre Sıfırla — AI Cert Academy" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminResetPage() {
  const navigate = useNavigate();
  const reset = useServerFn(resetAdminPassword);
  const [token, setToken] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!token) {
      setErr("Linkte token yok.");
      return;
    }
    if (pw1.length < 8) {
      setErr("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (pw1 !== pw2) {
      setErr("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const r = await reset({ data: { token, newPassword: pw1 } });
      if (!r.ok) {
        setErr(r.error || "İşlem başarısız.");
      } else {
        setDone(true);
        setTimeout(() => navigate({ to: "/" }), 2500);
      }
    } catch {
      setErr("Bir hata oluştu, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const wrap: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#070711,#0d0d1f)",
    color: "#e8e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
  };
  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#fff",
    fontSize: 14,
    marginBottom: 12,
    boxSizing: "border-box",
  };
  const btn: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 10,
    background: "linear-gradient(135deg,#c9a84c,#f5cc6a)",
    color: "#1a1a1a",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  };

  return (
    <main style={wrap}>
      <div style={card}>
        <h1 style={{ margin: 0, fontSize: 22, marginBottom: 6 }}>Yeni Yönetici Şifresi</h1>
        <p style={{ color: "#9999b8", fontSize: 13, marginTop: 0, marginBottom: 20 }}>
          Yeni şifrenizi belirleyin. Link tek kullanımlıktır ve 15 dakika geçerlidir.
        </p>
        {done ? (
          <div
            style={{
              background: "rgba(0,201,167,0.1)",
              border: "1px solid rgba(0,201,167,0.3)",
              borderRadius: 10,
              padding: 14,
              color: "#6ee7b7",
              fontSize: 14,
            }}
          >
            ✅ Şifreniz güncellendi. Giriş sayfasına yönlendiriliyorsunuz…
          </div>
        ) : (
          <form onSubmit={submit}>
            <label style={{ fontSize: 12, color: "#9999b8" }}>Yeni şifre</label>
            <input
              type="password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              style={input}
              autoComplete="new-password"
              required
            />
            <label style={{ fontSize: 12, color: "#9999b8" }}>Yeni şifre (tekrar)</label>
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              style={input}
              autoComplete="new-password"
              required
            />
            {err && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#fca5a5",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {err}
              </div>
            )}
            <button type="submit" disabled={loading} style={btn}>
              {loading ? "Kaydediliyor…" : "Şifreyi Güncelle"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}