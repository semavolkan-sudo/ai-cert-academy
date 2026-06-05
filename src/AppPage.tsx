import { useState, useEffect, useRef } from "react";

// ─── SSR-SAFE STORAGE ────────────────────────────────────────────────────────
var isClient = typeof window !== "undefined";

function lsGet(key) {
  if (!isClient) return null;
  try { return localStorage.getItem(key); } catch(e) { return null; }
}

function lsSet(key, value) {
  if (!isClient) return;
  try { localStorage.setItem(key, value); } catch(e) {}
}

function lsRemove(key) {
  if (!isClient) return;
  try { localStorage.removeItem(key); } catch(e) {}
}


// ─── CONFIG ──────────────────────────────────────────────────────────────────
var PROXY_URL = "https://ai-cert-proxy.sema-volkan.workers.dev";
// Lovable'a yukledikten sonra yukaridaki URL'yi Supabase'den aldiginla degistir

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
var BG = "#08080f";
var GOLD = "#d4a853";
var CARD_BG = "rgba(255,255,255,0.03)";
var CARD_BORDER = "rgba(255,255,255,0.08)";

var PLAN_PERMS = {
  Starter:  { mentor: false, mentorSessions: 0,  bonus: false, team: false, teamLimit: 0,  cert: "Temel",    lockAfter: 14  },
  Pro:      { mentor: true,  mentorSessions: 4,   bonus: true,  team: false, teamLimit: 0,  cert: "Premium",  lockAfter: null },
  Business: { mentor: true,  mentorSessions: 999, bonus: true,  team: true,  teamLimit: 5,  cert: "Kurumsal", lockAfter: null },
};

function getPerms(user) {
  if (!user || !user.plan) return PLAN_PERMS.Starter;
  return PLAN_PERMS[user.plan.name] || PLAN_PERMS.Starter;
}

var XP_LEVELS = [
  { level: 1, name: "AI Acemi",       xp: 0,    color: "#888899" },
  { level: 2, name: "AI Ogrenci",     xp: 100,  color: "#6366f1" },
  { level: 3, name: "AI Pratisyen",   xp: 300,  color: "#3b82f6" },
  { level: 4, name: "AI Uzman",       xp: 600,  color: "#10a37f" },
  { level: 5, name: "AI Ustat",       xp: 1000, color: "#d4a853" },
  { level: 6, name: "AI Sertifikali", xp: 1500, color: "#ef4444" },
];

function getLvl(xp) {
  var l = XP_LEVELS[0];
  for (var i = 0; i < XP_LEVELS.length; i++) { if (xp >= XP_LEVELS[i].xp) l = XP_LEVELS[i]; }
  return l;
}
function getNextLvl(xp) {
  for (var i = 0; i < XP_LEVELS.length; i++) { if (XP_LEVELS[i].xp > xp) return XP_LEVELS[i]; }
  return XP_LEVELS[XP_LEVELS.length - 1];
}
function xpFor(score) { return 20 + score * 16; }

var PLANS = [
  { name: "Starter",  price: 29,  color: "#6366f1", popular: false,
    features: ["14 gun erisim (ilk yari)", "Ders icerikleri", "Gunluk quizler", "XP ve Streak sistemi", "Temel sertifika"] },
  { name: "Pro",      price: 79,  color: "#d4a853", popular: true,
    features: ["28 gun tam erisim", "Tum dersler", "XP ve Streak sistemi", "AI Mentor (4 seans)", "Bonus icerikler", "Premium sertifika"] },
  { name: "Business", price: 199, color: "#10a37f", popular: false,
    features: ["5 kullanici lisansi", "Sinirirsiz AI Mentor", "Ekip yonetim paneli", "Ekip liderboard", "Kurumsal sertifika", "Oncelikli destek"] },
];

var COURSES = [
  { day:1,  tool:"ChatGPT",            icon:"\uD83E\uDD16", color:"#10a37f", desc:"Dunyanin en populer AI asistanini ustaca kullanin" },
  { day:2,  tool:"Claude",             icon:"\uD83E\uDDE0", color:"#d4a853", desc:"Anthropic'in gelismis dil modeliyle calisin" },
  { day:3,  tool:"Gemini",             icon:"\u2728",         color:"#4285f4", desc:"Google'in multimodal AI sistemini kesfedin" },
  { day:4,  tool:"Perplexity",         icon:"\uD83D\uDD0D", color:"#6366f1", desc:"AI destekli arastirma motorunu ogreyin" },
  { day:5,  tool:"Deepseek",           icon:"\uD83D\uDE80", color:"#ef4444", desc:"Cin'in guclu acik kaynak modelini kullanin" },
  { day:6,  tool:"Copilot",            icon:"\uD83D\uDCBB", color:"#0078d4", desc:"Microsoft AI asistaniyla uretkenlik" },
  { day:7,  tool:"Grok",               icon:"\u26A1",         color:"#1d9bf0", desc:"xAI gercek zamanli AI modelini kesfedin" },
  { day:8,  tool:"Lovable",            icon:"\uD83D\uDC9C", color:"#8b5cf6", desc:"AI ile uygulama gelistirmeyi ogreyin" },
  { day:9,  tool:"Manus",              icon:"\uD83E\uDD1D", color:"#f59e0b", desc:"Otonom AI ajan sistemini kullanin" },
  { day:10, tool:"NanoBanana",         icon:"\uD83C\uDF4C", color:"#fbbf24", desc:"Yeni nesil AI araclarini kesfedin" },
  { day:11, tool:"Leonardo AI",        icon:"\uD83C\uDFA8", color:"#ec4899", desc:"AI gorsel uretiminde uzmanlasin" },
  { day:12, tool:"Meta AI",            icon:"\uD83C\uDF10", color:"#0668e1", desc:"Meta AI ekosistemini ogreyin" },
  { day:13, tool:"Assembly AI",        icon:"\uD83C\uDF99", color:"#14b8a6", desc:"Ses transkripsiyon AI kullanin" },
  { day:14, tool:"Canva AI",           icon:"\uD83D\uDD8C", color:"#7c3aed", desc:"AI destekli tasarim araclarini ogreyin" },
  { day:15, tool:"Veo 3",              icon:"\uD83C\uDFAC", color:"#dc2626", desc:"Google video uretim AI kesfedin" },
  { day:16, tool:"Sora 2",             icon:"\uD83C\uDFA5", color:"#059669", desc:"OpenAI video AI modelini kullanin" },
  { day:17, tool:"Kimi",               icon:"\uD83C\uDF19", color:"#7c3aed", desc:"Moonshot AI guclu modelini ogreyin" },
  { day:18, tool:"Kling",              icon:"\uD83C\uDFAD", color:"#b45309", desc:"Kuaishou video AI kesfedin" },
  { day:19, tool:"Midjourney",         icon:"\uD83C\uDF0C", color:"#4f46e5", desc:"En populer gorsel AI aracinda uzmanlasin" },
  { day:20, tool:"Runway ML",          icon:"\u2702",         color:"#16a34a", desc:"AI video duzenleme platformu ogreyin" },
  { day:21, tool:"ElevenLabs",         icon:"\uD83D\uDD0A", color:"#ea580c", desc:"AI ses klonlama teknolojisini kullanin" },
  { day:22, tool:"Pika Labs",          icon:"\u26A1",         color:"#0891b2", desc:"Hizli video olusturma AI kesfedin" },
  { day:23, tool:"Stable Diffusion",   icon:"\uD83C\uDF0A", color:"#7c3aed", desc:"Acik kaynak gorsel AI uzmanlasin" },
  { day:24, tool:"Make.com",           icon:"\uD83D\uDD17", color:"#9333ea", desc:"AI otomasyon akislari kurun" },
  { day:25, tool:"Zapier AI",          icon:"\u26A1",         color:"#ff6b35", desc:"AI destekli is akislarini otomatize edin" },
  { day:26, tool:"Notion AI",          icon:"\uD83D\uDCDD", color:"#374151", desc:"AI destekli verimlilik sistemleri kurun" },
  { day:27, tool:"Prompt Engineering", icon:"\uD83C\uDFAF", color:"#b91c1c", desc:"Etkili prompt yazma tekniklerini ogreyin" },
  { day:28, tool:"AI Is Stratejisi",   icon:"\uD83D\uDCBC", color:"#065f46", desc:"AI ile gelir modelleri olusturun" },
];

var MOCK_LB = [
  { name:"Ayse K.",   xp:1240, streak:18 },
  { name:"Mehmet T.", xp:1180, streak:22 },
  { name:"Zeynep A.", xp:980,  streak:12 },
  { name:"Can B.",    xp:860,  streak:9  },
  { name:"Fatma Y.",  xp:720,  streak:7  },
];

var DEFAULT_QUIZ = [
  { q:"Bu AI aracinin temel kullanim amaci nedir?",          opts:["Yalnizca gorsel uretim","Yalnizca kod yazma","Genel amacli uretkenlik","Yalnizca veri analizi"],                          ans:2 },
  { q:"Prompt engineering'de en onemli unsur nedir?",        opts:["Kisa yazmak","Net ve baglamli talimatlar","Ingilizce kullanmak","Buyuk harf kullanmak"],                                  ans:1 },
  { q:"AI araclarinin is dunyasindaki en buyuk avantaji?",    opts:["Maliyeti sifirlamak","Calisanlari isten cikarmak","Tekrarlayan gorevleri otomatize etmek","Internetsiz calismak"],         ans:2 },
  { q:"AI ciktilarini kullanirken en kritik adim?",           opts:["Hepsini direkt kullanmak","Dogrulamak ve duzenlemek","Ingilizce cevirmek","Kaydetmek"],                                    ans:1 },
  { q:"En verimli calisma yontemi hangisidir?",               opts:["Tek seferlik uzun soru","Iteratif prompt zinciri","Sablonlari kopyalamak","Baskasinin promptlarini kullanmak"],            ans:1 },
];

// ─── PAYMENT LINKS ───────────────────────────────────────────────────────────
var PAYMENT_LINKS = {
  Starter:  "https://ai-cert-academy.lemonsqueezy.com/checkout/buy/f9a71b5d-1f89-481e-9fc3-8d90cc2783b6",
  Pro:      "https://ai-cert-academy.lemonsqueezy.com/checkout/buy/1e6783f3-22a7-449c-8946-6c43d5c5e4b7",
  Business: "https://ai-cert-academy.lemonsqueezy.com/checkout/buy/e1487643-af1b-414f-b79b-75d38cc5ff9b",
};
function saveUser(user) {
  try {
    lsSet("aica-user", JSON.stringify(user));
    if (user.email) addToRegistry(user.email, user);
  } catch(e) {}
}
function deleteUser() {
  try { lsRemove("aica-user"); } catch(e) {}
}

// ─── USER REGISTRY (email uniqueness + login) ────────────────────────────────
function getRegistry() {
  try { var r = lsGet("aica-registry"); return r ? JSON.parse(r) : {}; } catch(e) { return {}; }
}
function emailExists(email) {
  return !!getRegistry()[email.toLowerCase()];
}
function addToRegistry(email, userData) {
  try {
    var reg = getRegistry();
    reg[email.toLowerCase()] = JSON.stringify(userData);
    lsSet("aica-registry", JSON.stringify(reg));
  } catch(e) {}
}
function getUserByEmail(email) {
  try {
    var reg = getRegistry();
    var raw = reg[email.toLowerCase()];
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// ─── TEAM HELPERS (storage-based) ────────────────────────────────────────────
function getTeamKey(ownerId) { return "team-" + ownerId; }

function loadTeam(ownerId) {
  return new Promise(function(resolve) {
    try {
      var val = lsGet(getTeamKey(ownerId));
      resolve(val ? JSON.parse(val) : null);
    } catch(e) { resolve(null); }
  });
}

function saveTeam(ownerId, team) {
  try { lsSet(getTeamKey(ownerId), JSON.stringify(team)); } catch(e) {}
}

function createTeam(owner) {
  var team = {
    id: "team-" + Date.now(),
    ownerId: owner.email,
    ownerName: owner.name,
    limit: 5,
    members: [{ email: owner.email, name: owner.name, role: "admin", status: "active", joinedAt: Date.now() }],
    invites: [],
    createdAt: Date.now(),
  };
  saveTeam(owner.email, team);
  return team;
}

function generateInviteCode(teamId, email) {
  return btoa(teamId + "|" + email + "|" + Date.now()).replace(/=/g, "");
}

function parseInviteCode(code) {
  try {
    var decoded = atob(code);
    var parts = decoded.split("|");
    return { teamId: parts[0], email: parts[1], ts: parseInt(parts[2]) };
  } catch(e) { return null; }
}

// ─── CERTIFICATE ─────────────────────────────────────────────────────────────
function generateCertificate(userName, tier, totalXP) {
  var cv = document.createElement("canvas");
  cv.width = 1400; cv.height = 900;
  var ctx = cv.getContext("2d");
  var g = ctx.createLinearGradient(0, 0, 1400, 900);
  g.addColorStop(0, "#0a0a1a"); g.addColorStop(0.5, "#0f0f25"); g.addColorStop(1, "#0a0a1a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1400, 900);
  ctx.strokeStyle = "#d4a853"; ctx.lineWidth = 10; ctx.strokeRect(30, 30, 1340, 840);
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(212,168,83,0.25)"; ctx.strokeRect(50, 50, 1300, 800);
  for (var i = 0; i < 6; i++) {
    ctx.beginPath(); ctx.arc(70 + i * 60, 70, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(212,168,83,0.3)"; ctx.fill();
  }
  ctx.fillStyle = "#d4a853"; ctx.font = "bold 88px Georgia"; ctx.textAlign = "center"; ctx.fillText("AI", 700, 200);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 52px Georgia"; ctx.fillText("Certification Academy", 700, 270);
  ctx.fillStyle = "rgba(212,168,83,0.35)"; ctx.fillRect(250, 295, 900, 3);
  ctx.fillStyle = "#9999bb"; ctx.font = "italic 26px Georgia"; ctx.fillText("Bu belge, asagidaki kisinin", 700, 345);
  ctx.fillStyle = "#d4a853"; ctx.font = "bold 60px Georgia"; ctx.fillText(userName || "Katilimci", 700, 430);
  ctx.fillStyle = "rgba(212,168,83,0.35)"; ctx.fillRect(350, 455, 700, 2);
  ctx.fillStyle = "#ffffff"; ctx.font = "24px Georgia";
  ctx.fillText("28 Gunluk AI Sertifika Programini basariyla tamamladigini", 700, 505);
  ctx.fillText("ve tum sinav ve degerlendirmelerden gectigini onaylar.", 700, 540);
  var tierColors = { Temel:"#6366f1", Premium:"#d4a853", Kurumsal:"#10a37f" };
  ctx.fillStyle = tierColors[tier] || "#d4a853"; ctx.font = "bold 22px Georgia";
  ctx.fillText(tier + " Sertifika | Toplam XP: " + totalXP, 700, 590);
  ctx.fillStyle = "#9999bb"; ctx.font = "18px Georgia";
  ctx.fillText("Tarih: " + new Date().toLocaleDateString("tr-TR", { year:"numeric", month:"long", day:"numeric" }), 700, 635);
  ctx.fillStyle = "#d4a853"; ctx.font = "bold 22px Georgia"; ctx.fillText("AI Certification Academy", 700, 700);
  ctx.font = "16px Georgia"; ctx.fillStyle = "#666688";
  ctx.fillText("Sertifika No: AIC-" + Math.random().toString(36).substr(2,9).toUpperCase(), 700, 730);
  ctx.globalAlpha = 0.04; ctx.fillStyle = "#d4a853"; ctx.font = "bold 220px Georgia"; ctx.fillText("AI", 700, 530); ctx.globalAlpha = 1;
  return cv.toDataURL("image/png");
}

// ─── XP TOAST ────────────────────────────────────────────────────────────────
function XPToast(props) {
  useEffect(function() { var t = setTimeout(props.onDone, 2800); return function() { clearTimeout(t); }; }, []);
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", borderRadius:14, padding:"12px 22px", fontWeight:800, fontSize:18, fontFamily:"monospace", boxShadow:"0 6px 28px rgba(212,168,83,0.5)" }}>
      {"+ " + props.xp + " XP"}
    </div>
  );
}

// ─── UPGRADE MODAL ───────────────────────────────────────────────────────────
function UpgradeModal(props) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"#0e0e1e", border:"1px solid rgba(212,168,83,0.4)", borderRadius:20, padding:40, maxWidth:420, textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:14 }}>🔒</div>
        <h2 style={{ color:GOLD, fontWeight:800, fontSize:20, marginBottom:10 }}>Pro Ozellik</h2>
        <p style={{ color:"#888899", marginBottom:24, lineHeight:1.6, fontSize:14 }}>{props.feature} — Pro veya Business plana gecis yaparak bu ozelligi kullanabilirsin.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={props.onClose} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"10px 20px", color:"#888899", cursor:"pointer", fontSize:13 }}>Vazgec</button>
          <button onClick={props.onClose} style={{ background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:10, padding:"10px 22px", fontWeight:700, cursor:"pointer", fontSize:13 }}>Plani Yukselt</button>
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding(props) {
  var [step, setStep] = useState(0);
  var [ans, setAns] = useState({});
  var qs = [
    { q:"AI araclari hakkinda deneyim seviyeniz?",       opts:["Hic kullanmadim","Birkac kez denedim","Duzenli kullaniyorum","Profesyonel duzey"] },
    { q:"Oncelikli hedefiniz nedir?",                    opts:["Kariyerimi gelistirmek","Kendi isimi kurmak","Freelance gelir","Genel merak"] },
    { q:"Gunde ne kadar sure ayirabilirsiniz?",          opts:["10-15 dakika","30 dakika","1 saat","1 saatten fazla"] },
    { q:"Hangi AI kategorisi en cok ilginizi cekiyor?",  opts:["Metin ve Yazarlik","Gorsel ve Video","Otomasyon","Hepsi esit"] },
  ];
  function pick(i) {
    var na = Object.assign({}, ans); na[step] = i; setAns(na);
    if (step < qs.length - 1) setStep(step + 1);
    else props.onDone({ level: na[0] <= 1 ? "baslangic" : na[0] <= 2 ? "orta" : "ileri", goal: qs[1].opts[na[1]], time: qs[2].opts[na[2]], focus: qs[3].opts[na[3]] });
  }
  return (
    <div style={{ minHeight:"100vh", background:BG, color:"#fff", fontFamily:"sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:500 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:36, fontWeight:800, color:GOLD }}>AI</div>
          <div style={{ color:"#888899", fontSize:13, marginTop:4 }}>Kisisellestirilmis ogrenme yolu olusturuluyor</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:100, height:4, marginBottom:28, overflow:"hidden" }}>
          <div style={{ width:(((step+1)/qs.length)*100)+"%", height:"100%", background:GOLD, borderRadius:100 }} />
        </div>
        <div style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:16, padding:28 }}>
          <div style={{ fontSize:11, color:GOLD, fontFamily:"monospace", marginBottom:10 }}>{"SORU "+(step+1)+"/"+qs.length}</div>
          <h2 style={{ color:"#fff", fontWeight:700, fontSize:18, marginBottom:24, lineHeight:1.4 }}>{qs[step].q}</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {qs[step].opts.map(function(opt, i) {
              return (
                <button key={i} onClick={function() { pick(i); }}
                  style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:11, padding:"13px 18px", color:"#ccccdd", cursor:"pointer", fontSize:14, textAlign:"left" }}>
                  {["A","B","C","D"][i] + ") " + opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MENTOR CHAT ─────────────────────────────────────────────────────────────
function MentorChat(props) {
  var user = props.user;
  var p = getPerms(user);
  var lvl = getLvl(user.xp || 0);
  var [msgs, setMsgs] = useState([{ role:"ai", text:"Merhaba " + user.name + "! Ben AI Mentor'unum. Seviye " + lvl.level + " - " + lvl.name + " olarak kayitlisin. " + (p.mentor ? (p.mentorSessions === 999 ? "Sinirirsiz seans hakkın var." : p.mentorSessions + " seans hakkin kaldi.") : "") + " Ne ogrenelim?" }]);
  var [inp, setInp] = useState("");
  var [loading, setLoading] = useState(false);
  var [left, setLeft] = useState(p.mentorSessions);
  var botRef = useRef(null);
  useEffect(function() { if (botRef.current) botRef.current.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  function send() {
    if (!inp.trim() || loading) return;
    if (p.mentorSessions !== 999 && left <= 0) return;
    var msg = inp.trim(); setInp("");
    var newMsgs = msgs.concat([{ role:"user", text:msg }]);
    setMsgs(newMsgs); setLoading(true);
    if (p.mentorSessions !== 999) setLeft(left - 1);
    var history = msgs.map(function(m) { return { role: m.role === "ai" ? "assistant" : "user", content: m.text }; });
    history.push({ role:"user", content:msg });
    fetch(PROXY_URL, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:800,
        system:"Sen bir AI egitim mentorusun. Ogrenci: "+user.name+". Plan: "+(user.plan?user.plan.name:"")+". Seviye: "+lvl.name+" ("+( user.xp||0)+" XP). Turkce, samimi, motive edici, kisa ve pratik yanitlar ver.",
        messages:history })
    }).then(function(r) { return r.json(); }).then(function(d) {
      var text = ""; if (d.content) for (var i = 0; i < d.content.length; i++) text += d.content[i].text || "";
      setMsgs(newMsgs.concat([{ role:"ai", text: text || "Hata olustu, tekrar dene." }]));
      setLoading(false);
    }).catch(function() {
      setMsgs(newMsgs.concat([{ role:"ai", text:"Baglanti hatasi." }]));
      setLoading(false);
    });
  }

  var suggested = ["Hangi araçla başlamalıyım?","Prompt engineering ipuçları","AI ile nasıl para kazanırım?","Öğrenme planımı optimize et"];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:12 }}>
      <div style={{ width:"100%", maxWidth:680, height:"88vh", background:"#0c0c1a", border:"1px solid rgba(212,168,83,0.3)", borderRadius:18, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10, background:"rgba(212,168,83,0.05)" }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#d4a853,#f0c060)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>T</div>
          <div style={{ flex:1 }}><div style={{ fontWeight:700, color:"#fff", fontSize:14 }}>AI Mentor</div><div style={{ fontSize:11, color:"#10a37f" }}>Cevrimici</div></div>
          <div style={{ background:"rgba(212,168,83,0.1)", border:"1px solid rgba(212,168,83,0.3)", borderRadius:7, padding:"3px 10px", fontSize:11, color:GOLD }}>
            {p.mentorSessions === 999 ? "Sinirirsiz" : left + " seans"}
          </div>
          <button onClick={props.onClose} style={{ background:"transparent", border:"none", color:"#888899", cursor:"pointer", fontSize:20 }}>x</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>
          {msgs.map(function(m, i) {
            return (
              <div key={i} style={{ display:"flex", gap:8, justifyContent: m.role === "ai" ? "flex-start" : "flex-end" }}>
                {m.role === "ai" && <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#d4a853,#f0c060)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>T</div>}
                <div style={{ maxWidth:"78%", background: m.role === "ai" ? "rgba(255,255,255,0.04)" : "rgba(212,168,83,0.15)", border:"1px solid "+(m.role==="ai"?"rgba(255,255,255,0.07)":"rgba(212,168,83,0.3)"), borderRadius: m.role==="ai" ? "14px 14px 14px 3px" : "14px 14px 3px 14px", padding:"11px 14px" }}>
                  <p style={{ color: m.role==="ai" ? "#ccccdd" : "#f0e0b0", fontSize:13, lineHeight:1.65, margin:0, whiteSpace:"pre-wrap" }}>{m.text}</p>
                </div>
                {m.role === "user" && <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#a5b4fc", fontSize:13 }}>{user.name[0]}</div>}
              </div>
            );
          })}
          {loading && (
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#d4a853,#f0c060)", display:"flex", alignItems:"center", justifyContent:"center" }}>T</div>
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px 14px 14px 3px", padding:"13px 16px", display:"flex", gap:5 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:GOLD }} />
                <div style={{ width:7, height:7, borderRadius:"50%", background:GOLD }} />
                <div style={{ width:7, height:7, borderRadius:"50%", background:GOLD }} />
              </div>
            </div>
          )}
          <div ref={botRef} />
        </div>
        {msgs.length <= 1 && (
          <div style={{ padding:"0 16px 10px", display:"flex", flexWrap:"wrap", gap:7 }}>
            {suggested.map(function(q) {
              return <button key={q} onClick={function() { setInp(q); }} style={{ background:"rgba(212,168,83,0.08)", border:"1px solid rgba(212,168,83,0.2)", borderRadius:20, padding:"5px 12px", fontSize:11, color:GOLD, cursor:"pointer" }}>{q}</button>;
            })}
          </div>
        )}
        <div style={{ padding:"10px 14px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:8 }}>
          {p.mentorSessions !== 999 && left <= 0 ? (
            <div style={{ flex:1, textAlign:"center", color:"#555577", fontSize:12, padding:"10px 0" }}>Seans hakkin doldu - Pro'ya gec</div>
          ) : (
            <>
              <input value={inp} onChange={function(e) { setInp(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") send(); }}
                placeholder="Sorunuzu yazin..."
                style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 14px", color:"#fff", fontSize:13, outline:"none" }} />
              <button onClick={send} disabled={loading || !inp.trim()}
                style={{ background: loading || !inp.trim() ? "#222" : "linear-gradient(135deg,#d4a853,#f0c060)", color: loading || !inp.trim() ? "#555" : "#08080f", border:"none", borderRadius:12, padding:"10px 18px", fontWeight:700, cursor: loading||!inp.trim() ? "not-allowed" : "pointer", fontSize:16 }}>
                &gt;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LANDING ─────────────────────────────────────────────────────────────────
function Landing(props) {
  var [count, setCount] = useState(847);
  useEffect(function() { var t = setInterval(function() { setCount(function(c) { return c + Math.floor(Math.random()*3); }); }, 9000); return function() { clearInterval(t); }; }, []);
  var reviews = [
    { name:"Ayse K.", role:"Pazarlama Muduru", text:"28 gunde tum AI araclari ogrendim. Ekibimden cok daha hızlıyım.", r:5 },
    { name:"Mehmet T.", role:"Freelancer", text:"AI Mentor ozelligi inanilmaz. Sorularimi aninda yanitliyor.", r:5 },
    { name:"Zeynep A.", role:"Girisimci", text:"Sertifikamı LinkedIn'e ekledim, 3 yeni musteri geldi!", r:5 },
  ];
  return (
    <div style={{ minHeight:"100vh", background:BG, color:"#fff", fontFamily:"sans-serif" }}>
      <div style={{ position:"relative", textAlign:"center", padding:"72px 20px 80px", background:"radial-gradient(ellipse at 50% 0%,rgba(212,168,83,0.13) 0%,transparent 68%)" }}>
        <div style={{ display:"inline-block", background:"rgba(212,168,83,0.1)", border:"1px solid rgba(212,168,83,0.4)", borderRadius:100, padding:"7px 18px", fontSize:12, color:GOLD, marginBottom:28, fontFamily:"monospace" }}>{"Bu ay " + count + " kisi kayit oldu"}</div>
        <div style={{ fontSize:80, fontWeight:800, lineHeight:1, color:GOLD }}>AI</div>
        <div style={{ fontSize:36, fontWeight:700, marginBottom:20 }}>Certification Academy</div>
        <p style={{ fontSize:16, color:"#9999bb", maxWidth:460, margin:"0 auto 40px", lineHeight:1.65 }}>28 arac - 28 gun - Gunde 15 dakika<br/><span style={{ color:GOLD }}>AI sertifikanı kazan, kariyerini donustur.</span></p>
        <div style={{ display:"flex", gap:40, justifyContent:"center", marginBottom:44, flexWrap:"wrap" }}>
          {[["28","Arac"],["28","Gun"],["6","Seviye"],["28","Sınav"]].map(function(item) {
            return (
              <div key={item[1]} style={{ textAlign:"center" }}>
                <div style={{ fontSize:34, fontWeight:800, color:GOLD, fontFamily:"monospace" }}>{item[0]}</div>
                <div style={{ fontSize:12, color:"#555577" }}>{item[1]}</div>
              </div>
            );
          })}
        </div>
        <button onClick={function() { var el = document.getElementById("pricing"); if (el) el.scrollIntoView({ behavior:"smooth" }); }}
          style={{ background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:12, padding:"16px 44px", fontSize:17, fontWeight:700, cursor:"pointer" }}>
          Hemen Basla
        </button>
      </div>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 20px 64px" }}>
        <h2 style={{ textAlign:"center", fontSize:24, fontWeight:700, marginBottom:32 }}>Ogrencilerimiz Ne Diyor?</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
          {reviews.map(function(r, i) {
            return (
              <div key={i} style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:16, padding:24 }}>
                <div style={{ color:GOLD, fontSize:14, marginBottom:10 }}>{"★★★★★"}</div>
                <p style={{ color:"#ccccdd", fontSize:13, lineHeight:1.6, marginBottom:14, fontStyle:"italic" }}>{"\"" + r.text + "\""}</p>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(212,168,83,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:GOLD }}>{r.name[0]}</div>
                  <div><div style={{ fontWeight:600, fontSize:12 }}>{r.name}</div><div style={{ color:"#555577", fontSize:11 }}>{r.role}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ maxWidth:1060, margin:"0 auto", padding:"0 20px 64px" }}>
        <h2 style={{ textAlign:"center", fontSize:28, fontWeight:700, marginBottom:10 }}>28 Gunluk Program</h2>
        <p style={{ textAlign:"center", color:"#666688", marginBottom:36, fontSize:13 }}>Her gun yeni bir AI araci, her gun yeni bir super guc</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {COURSES.map(function(c) {
            return (
              <div key={c.day} style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:12, padding:"16px 14px", display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ fontSize:22, flexShrink:0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize:10, color:"#555577", fontFamily:"monospace", marginBottom:2 }}>{"GUN "+c.day}</div>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{c.tool}</div>
                  {c.day > 14 && <div style={{ fontSize:10, color:"#818cf8" }}>Pro+</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div id="pricing" style={{ background:"rgba(255,255,255,0.02)", borderTop:"1px solid rgba(255,255,255,0.05)", padding:"60px 20px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:28, fontWeight:700, marginBottom:12 }}>Planini Sec</h2>
          <p style={{ textAlign:"center", color:"#666688", marginBottom:40, fontSize:13 }}>Hedefine uygun plani sec ve bugun basla</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
            {PLANS.map(function(plan) {
              return (
                <div key={plan.name} style={{ background: plan.popular ? "rgba(212,168,83,0.08)" : CARD_BG, border:"1px solid "+(plan.popular?plan.color:CARD_BORDER), borderRadius:16, padding:28, position:"relative" }}>
                  {plan.popular && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:GOLD, color:"#08080f", fontSize:11, fontWeight:700, padding:"3px 14px", borderRadius:100 }}>EN POPULER</div>}
                  <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>{plan.name}</div>
                  <div style={{ fontSize:40, fontWeight:800, color:plan.color, fontFamily:"monospace" }}>{"$"+plan.price}</div>
                  <div style={{ color:"#555577", fontSize:12, marginBottom:20 }}>/ay</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                    {plan.features.map(function(f) {
                      return <div key={f} style={{ display:"flex", gap:7, alignItems:"center", fontSize:13, color:"#ccccdd" }}><span style={{ color:plan.color }}>v</span>{f}</div>;
                    })}
                  </div>
                  <button onClick={function() { window.open(PAYMENT_LINKS[plan.name], "_blank"); }}
                    style={{ width:"100%", background: plan.popular ? "linear-gradient(135deg,#d4a853,#f0c060)" : "transparent", color: plan.popular ? "#08080f" : plan.color, border:"1px solid "+plan.color, borderRadius:10, padding:"12px 0", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                    {plan.popular ? "Hemen Kayit Ol" : "Sec"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
function Register(props) {
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [pass, setPass] = useState("");
  var [err, setErr] = useState("");
  var [loading, setLoading] = useState(false);
  var inviteData = props.inviteData;

  function submit() {
    if (!name || !email || !pass) { setErr("Tum alanlari doldurun"); return; }
    if (email.indexOf("@") < 0) { setErr("Gecerli email girin"); return; }
    if (pass.length < 6) { setErr("Sifre en az 6 karakter"); return; }
    if (emailExists(email)) { setErr("Bu email zaten kayitli. Giris Yap butonunu kullan."); return; }
    setLoading(true);
    setTimeout(function() {
      setLoading(false);
      var userData = {
        name: name, email: email,
        plan: props.plan || PLANS[1],
        progress: {}, scores: {}, xp: 0, streak: 0,
        teamId: inviteData ? inviteData.teamId : null,
        isTeamMember: inviteData ? true : false,
      };
      addToRegistry(email, userData);
      props.onDone(userData);
    }, 1200);
  }

  return (
    <div style={{ minHeight:"100vh", background:BG, color:"#fff", fontFamily:"sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:40, fontWeight:800, color:GOLD }}>AI</div>
          <div style={{ fontSize:17, fontWeight:600 }}>Certification Academy</div>
          {inviteData && <div style={{ marginTop:10, background:"rgba(16,163,127,0.1)", border:"1px solid rgba(16,163,127,0.3)", borderRadius:8, padding:"8px 16px", fontSize:13, color:"#10a37f" }}>Ekip davetini kabul ediyorsun</div>}
          {!inviteData && props.plan && <div style={{ marginTop:10, display:"inline-block", background:"rgba(212,168,83,0.1)", border:"1px solid rgba(212,168,83,0.3)", borderRadius:7, padding:"5px 14px", fontSize:12, color:GOLD }}>{props.plan.name + " - $" + props.plan.price + "/ay"}</div>}
        </div>
        <div style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:16, padding:28 }}>
          <h2 style={{ color:"#fff", fontWeight:700, marginBottom:20, fontSize:19 }}>Hesap Olustur</h2>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", color:"#888899", fontSize:12, marginBottom:5 }}>Ad Soyad</label>
            <input type="text" value={name} onChange={function(e) { setName(e.target.value); }}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 14px", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", color:"#888899", fontSize:12, marginBottom:5 }}>Email</label>
            <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 14px", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", color:"#888899", fontSize:12, marginBottom:5 }}>Sifre</label>
            <input type="password" value={pass} onChange={function(e) { setPass(e.target.value); }}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 14px", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box" }} />
          </div>
          {err && <div style={{ color:"#ef4444", fontSize:12, marginBottom:12 }}>{"! " + err}</div>}
          <button onClick={submit} disabled={loading}
            style={{ width:"100%", background: loading ? "#444" : "linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:10, padding:"13px 0", fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer", marginTop:6 }}>
            {loading ? "Kayit olusturuluyor..." : "Kayit Ol"}
          </button>
          <p style={{ textAlign:"center", marginTop:16, fontSize:12, color:"#555577" }}>
            Zaten hesabin var mi?
            <button onClick={props.onLogin} style={{ background:"transparent", border:"none", color:GOLD, cursor:"pointer", fontSize:12, marginLeft:4 }}>Giris Yap</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login(props) {
  var [email, setEmail] = useState("");
  var [pass, setPass] = useState("");
  var [err, setErr] = useState("");
  var [loading, setLoading] = useState(false);

  function submit() {
    if (!email || !pass) { setErr("Tum alanlari doldurun"); return; }
    if (pass.length < 6) { setErr("Sifre en az 6 karakter"); return; }
    setLoading(true);
    setTimeout(function() {
      setLoading(false);
      var existing = getUserByEmail(email);
      if (!existing) {
        setErr("Bu email ile kayitli hesap bulunamadi. Lutfen once kayit ol.");
        return;
      }
      // Basit sifre kontrolu - gercek uygulamada Supabase Auth kullanilir
      if (pass.length < 6) {
        setErr("Sifre hatali.");
        return;
      }
      saveUser(existing);
      props.onDone(existing);
    }, 1000);
  }

  return (
    <div style={{ minHeight:"100vh", background:BG, color:"#fff", fontFamily:"sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:40, fontWeight:800, color:GOLD }}>AI</div>
          <div style={{ fontSize:17, fontWeight:600 }}>Certification Academy</div>
        </div>
        <div style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:16, padding:28 }}>
          <h2 style={{ color:"#fff", fontWeight:700, marginBottom:20, fontSize:19 }}>Giris Yap</h2>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", color:"#888899", fontSize:12, marginBottom:5 }}>Email</label>
            <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 14px", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", color:"#888899", fontSize:12, marginBottom:5 }}>Sifre</label>
            <input type="password" value={pass} onChange={function(e) { setPass(e.target.value); }}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 14px", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box" }} />
          </div>
          {err && <div style={{ color:"#ef4444", fontSize:12, marginBottom:12 }}>{err}</div>}
          <button onClick={submit} disabled={loading}
            style={{ width:"100%", background: loading ? "#444" : "linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:10, padding:"13px 0", fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Kontrol ediliyor..." : "Giris Yap"}
          </button>
          <p style={{ textAlign:"center", marginTop:16, fontSize:12, color:"#555577" }}>
            Hesabin yok mu?
            <button onClick={props.onRegister} style={{ background:"transparent", border:"none", color:GOLD, cursor:"pointer", fontSize:12, marginLeft:4 }}>Kayit Ol</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── TEAM MANAGEMENT ─────────────────────────────────────────────────────────
function TeamPanel(props) {
  var user = props.user;
  var [team, setTeam] = useState(null);
  var [loading, setLoading] = useState(true);
  var [inviteEmail, setInviteEmail] = useState("");
  var [inviteMsg, setInviteMsg] = useState("");
  var [inviteLink, setInviteLink] = useState("");

  useEffect(function() {
    loadTeam(user.email).then(function(t) {
      if (!t) {
        var newTeam = createTeam(user);
        setTeam(newTeam);
      } else {
        setTeam(t);
      }
      setLoading(false);
    });
  }, []);

  function sendInvite() {
    if (!inviteEmail || inviteEmail.indexOf("@") < 0) { setInviteMsg("Gecerli email girin"); return; }
    if (!team) return;
    var activeMembers = team.members.filter(function(m) { return m.status === "active"; }).length;
    if (activeMembers >= team.limit) { setInviteMsg("Takim limiti doldu (maks. " + team.limit + " kisi)"); return; }
    var existingMember = team.members.find(function(m) { return m.email === inviteEmail; });
    if (existingMember) { setInviteMsg("Bu kullanici zaten takimda"); return; }
    var code = generateInviteCode(team.id, inviteEmail);
    var newMember = { email: inviteEmail, name: "Davet Bekleniyor", role:"member", status:"pending", inviteCode: code, invitedAt: Date.now() };
    var updatedTeam = Object.assign({}, team, { members: team.members.concat([newMember]) });
    setTeam(updatedTeam);
    saveTeam(user.email, updatedTeam);
    var link = window.location.origin + "?invite=" + code;
    setInviteLink(link);
    setInviteMsg("Davet linki olusturuldu!");
    setInviteEmail("");
  }

  function removeMember(email) {
    if (email === user.email) return;
    var updatedTeam = Object.assign({}, team, { members: team.members.filter(function(m) { return m.email !== email; }) });
    setTeam(updatedTeam);
    saveTeam(user.email, updatedTeam);
  }

  function copyLink() {
    if (inviteLink) {
      try { navigator.clipboard.writeText(inviteLink); } catch(e) {}
      setInviteMsg("Link kopyalandi!");
    }
  }

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#666688" }}>Yukleniyor...</div>;
  if (!team) return null;

  var activeCount = team.members.filter(function(m) { return m.status === "active"; }).length;
  var pendingCount = team.members.filter(function(m) { return m.status === "pending"; }).length;
  var remaining = team.limit - activeCount;

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
        {[
          { label:"Aktif Uye",   val:activeCount,  color:"#10a37f" },
          { label:"Davet Bekleyen", val:pendingCount, color:GOLD },
          { label:"Bos Slot",    val:remaining,    color:"#6366f1" },
          { label:"Limit",       val:team.limit,   color:"#888899" },
        ].map(function(s) {
          return (
            <div key={s.label} style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:14, padding:16, textAlign:"center" }}>
              <div style={{ fontSize:30, fontWeight:800, color:s.color, fontFamily:"monospace" }}>{s.val}</div>
              <div style={{ fontSize:11, color:"#555577", marginTop:3 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {remaining > 0 ? (
        <div style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:14, padding:20, marginBottom:24 }}>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16, color:GOLD }}>Kullanici Davet Et</h3>
          <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
            <input value={inviteEmail} onChange={function(e) { setInviteEmail(e.target.value); }}
              placeholder="ornek@sirket.com" type="email"
              style={{ flex:1, minWidth:200, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:13, outline:"none" }} />
            <button onClick={sendInvite}
              style={{ background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
              Davet Gonder
            </button>
          </div>
          {inviteMsg && (
            <div style={{ fontSize:13, color: inviteMsg.indexOf("doldu") >= 0 || inviteMsg.indexOf("zaten") >= 0 ? "#ef4444" : "#10a37f", marginBottom:8 }}>{inviteMsg}</div>
          )}
          {inviteLink && (
            <div style={{ background:"rgba(16,163,127,0.08)", border:"1px solid rgba(16,163,127,0.3)", borderRadius:10, padding:12 }}>
              <div style={{ fontSize:11, color:"#10a37f", marginBottom:6 }}>Davet Linki - Bu linki kullaniciya gonder:</div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <code style={{ flex:1, fontSize:10, color:"#888899", wordBreak:"break-all" }}>{inviteLink}</code>
                <button onClick={copyLink} style={{ background:"rgba(212,168,83,0.15)", border:"1px solid rgba(212,168,83,0.3)", borderRadius:8, padding:"6px 12px", color:GOLD, cursor:"pointer", fontSize:12 }}>Kopyala</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:12, padding:16, marginBottom:24, textAlign:"center" }}>
          <div style={{ color:"#ef4444", fontWeight:700, marginBottom:4 }}>Takim Limiti Doldu</div>
          <div style={{ color:"#888899", fontSize:13 }}>5 kullanici limitine ulasildi. Uye cikararak yer acabilirsiniz.</div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Takim Uyeleri</h3>
        {team.members.map(function(m, i) {
          return (
            <div key={i} style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:12, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background: m.role === "admin" ? "rgba(212,168,83,0.2)" : "rgba(99,102,241,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color: m.role === "admin" ? GOLD : "#a5b4fc", flexShrink:0 }}>
                {m.name[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{m.name}</div>
                <div style={{ fontSize:11, color:"#555577" }}>{m.email}</div>
              </div>
              <div style={{ fontSize:11, color:"#888899" }}>{m.role === "admin" ? "Admin" : "Uye"}</div>
              <div style={{ fontSize:11, color: m.status === "active" ? "#10a37f" : GOLD, background: m.status === "active" ? "rgba(16,163,127,0.1)" : "rgba(212,168,83,0.1)", border:"1px solid "+(m.status==="active"?"rgba(16,163,127,0.3)":"rgba(212,168,83,0.3)"), borderRadius:20, padding:"2px 9px" }}>
                {m.status === "active" ? "Aktif" : "Davet Bekleniyor"}
              </div>
              {m.role !== "admin" && (
                <button onClick={function() { removeMember(m.email); }}
                  style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"4px 10px", color:"#ef4444", cursor:"pointer", fontSize:11 }}>
                  Cikar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard(props) {
  var user = props.user;
  var [tab, setTab] = useState("lessons");
  var [upgrade, setUpgrade] = useState(null);
  var p = getPerms(user);
  var progress = user.progress || {};
  var scores = user.scores || {};
  var doneKeys = Object.keys(progress).filter(function(k) { return progress[k] === "done"; });
  var done = doneKeys.length;
  var total = COURSES.length;
  var pct = Math.round((done / total) * 100);
  var xp = user.xp || 0;
  var streak = user.streak || 0;
  var lvl = getLvl(xp);
  var nxt = getNextLvl(xp);
  var xpToNext = nxt.xp - xp;
  var xpPct = lvl.xp === nxt.xp ? 100 : Math.round((xp - lvl.xp) / (nxt.xp - lvl.xp) * 100);
  var lbEntries = MOCK_LB.concat([{ name: user.name + " (Sen)", xp: xp, streak: streak }]);
  lbEntries.sort(function(a, b) { return b.xp - a.xp; });
  var myRank = 1;
  for (var i = 0; i < lbEntries.length; i++) { if (lbEntries[i].name.indexOf("(Sen)") >= 0) { myRank = i + 1; break; } }

  var tabs = [
    ["lessons",      "Dersler"],
    ["leaderboard",  "Liderboard"],
    ["bonus",        "Bonus" + (p.bonus ? "" : " (Pro)")],
    ["team",         "Ekip" + (p.team ? "" : " (Business)")],
  ];

  return (
    <div style={{ minHeight:"100vh", background:BG, color:"#fff", fontFamily:"sans-serif" }}>
      {upgrade && <UpgradeModal feature={upgrade} onClose={function() { setUpgrade(null); }} />}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20, fontWeight:800, color:GOLD }}>AI</span>
          <span style={{ fontSize:12, color:"#555577" }}>Certification Academy</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:9, padding:"5px 10px", fontSize:13, color:"#ef4444" }}>{"x " + streak + " gun"}</div>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:9, padding:"5px 10px", fontSize:12, color:lvl.color }}>{"Lv." + lvl.level + " " + xp + " XP"}</div>
          <button onClick={function() { p.mentor ? props.onMentor() : setUpgrade("AI Mentor"); }}
            style={{ background: p.mentor ? "rgba(212,168,83,0.12)" : CARD_BG, border:"1px solid "+(p.mentor?"rgba(212,168,83,0.45)":CARD_BORDER), borderRadius:9, padding:"6px 14px", color: p.mentor ? GOLD : "#555577", cursor:"pointer", fontSize:12, fontWeight:600 }}>
            {"AI Mentor" + (p.mentor ? "" : " (Pro)")}
          </button>
          <div style={{ background:"rgba(212,168,83,0.1)", border:"1px solid rgba(212,168,83,0.3)", borderRadius:7, padding:"5px 12px", fontSize:12, color:GOLD }}>{user.plan ? user.plan.name : ""}</div>
          <span style={{ color:"#555577", fontSize:12 }}>{user.name}</span>
          <button onClick={props.onLogout} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, padding:"5px 12px", color:"#888899", cursor:"pointer", fontSize:12 }}>Cikis</button>
        </div>
      </div>
      <div style={{ maxWidth:1040, margin:"0 auto", padding:"28px 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:28 }}>
          <div style={{ background:"rgba(212,168,83,0.1)", border:"1px solid rgba(212,168,83,0.2)", borderRadius:14, padding:20 }}>
            <div style={{ fontSize:11, color:"#666688", marginBottom:6 }}>Kurs Ilerlemesi</div>
            <div style={{ fontSize:34, fontWeight:800, color:GOLD, fontFamily:"monospace" }}>{pct + "%"}</div>
            <div style={{ color:"#555577", fontSize:11, marginTop:3 }}>{done + "/" + total + " ders"}</div>
            <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:100, height:5, overflow:"hidden", marginTop:8 }}>
              <div style={{ width:pct+"%", height:"100%", background:"linear-gradient(90deg,#d4a853,#f0c060)", borderRadius:100 }} />
            </div>
          </div>
          <div style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:14, padding:20 }}>
            <div style={{ fontSize:11, color:"#666688", marginBottom:6 }}>Seviye ve XP</div>
            <div style={{ fontSize:18, fontWeight:800, color:lvl.color }}>{lvl.name}</div>
            <div style={{ color:"#555577", fontSize:11, marginTop:3 }}>{xp + " XP - +" + xpToNext + " sonraki"}</div>
            <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:100, height:5, overflow:"hidden", marginTop:8 }}>
              <div style={{ width:xpPct+"%", height:"100%", background:lvl.color, borderRadius:100 }} />
            </div>
          </div>
          <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:14, padding:20 }}>
            <div style={{ fontSize:11, color:"#666688", marginBottom:6 }}>Streak</div>
            <div style={{ fontSize:34, fontWeight:800, color:"#ef4444", fontFamily:"monospace" }}>{streak}</div>
            <div style={{ color:"#555577", fontSize:11, marginTop:3 }}>Ardisik gun</div>
          </div>
          <div style={{ background:"rgba(16,163,127,0.1)", border:"1px solid rgba(16,163,127,0.2)", borderRadius:14, padding:20 }}>
            <div style={{ fontSize:11, color:"#666688", marginBottom:6 }}>Liderboard</div>
            <div style={{ fontSize:34, fontWeight:800, color:"#10a37f", fontFamily:"monospace" }}>{myRank + "."}</div>
            <div style={{ color:"#555577", fontSize:11, marginTop:3 }}>{lbEntries.length + " kisi arasinda"}</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:3, marginBottom:22, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:3, width:"fit-content", flexWrap:"wrap" }}>
          {tabs.map(function(item) {
            var t = item[0]; var label = item[1];
            return (
              <button key={t} onClick={function() {
                if (t === "bonus" && !p.bonus) { setUpgrade("Bonus Icerikler"); return; }
                if (t === "team" && !p.team) { setUpgrade("Ekip Yonetimi"); return; }
                setTab(t);
              }} style={{ background: tab===t ? "rgba(212,168,83,0.14)" : "transparent", border: tab===t ? "1px solid rgba(212,168,83,0.3)" : "1px solid transparent", borderRadius:7, padding:"7px 14px", color: tab===t ? GOLD : "#555577", cursor:"pointer", fontSize:12, fontWeight: tab===t ? 600 : 400 }}>
                {label}
              </button>
            );
          })}
        </div>

        {tab === "lessons" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:12 }}>
              {COURSES.map(function(c) {
                var isDone = progress[c.day] === "done";
                var isLocked = p.lockAfter && c.day > p.lockAfter;
                var sc = scores[c.day];
                return (
                  <div key={c.day} onClick={function() {
                    if (isLocked) { setUpgrade("Gun " + c.day + ": " + c.tool); return; }
                    props.onLesson(c);
                  }} style={{ background: isDone ? "rgba(16,163,127,0.07)" : CARD_BG, border:"1px solid "+(isDone?"rgba(16,163,127,0.28)":isLocked?"rgba(255,255,255,0.04)":CARD_BORDER), borderRadius:12, padding:17, cursor: isLocked ? "not-allowed" : "pointer", position:"relative", opacity: isLocked ? 0.5 : 1 }}>
                    {isDone && <div style={{ position:"absolute", top:8, right:8, background:"#10a37f", borderRadius:100, width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff" }}>v</div>}
                    {isLocked && <div style={{ position:"absolute", top:8, right:8, fontSize:12 }}>x</div>}
                    <div style={{ fontSize:24, marginBottom:7 }}>{c.icon}</div>
                    <div style={{ fontSize:10, color:"#444466", fontFamily:"monospace", marginBottom:3 }}>{"GUN " + c.day}</div>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>{c.tool}</div>
                    {isDone && sc !== undefined && <div style={{ fontSize:11, color:"#10a37f" }}>{sc + "/5 - +" + xpFor(sc) + " XP"}</div>}
                    {isLocked && <div style={{ fontSize:10, color:"#444466" }}>Pro gerekli</div>}
                    {!isDone && !isLocked && <div style={{ fontSize:11, color:"#333355" }}>Basla</div>}
                  </div>
                );
              })}
            </div>
            {done === total && (
              <div style={{ marginTop:32, textAlign:"center", background:"rgba(212,168,83,0.1)", border:"1px solid rgba(212,168,83,0.35)", borderRadius:18, padding:36 }}>
                <div style={{ fontSize:56, marginBottom:12 }}>Tebrikler!</div>
                <h2 style={{ fontSize:24, fontWeight:800, color:GOLD, marginBottom:6 }}>Programi Tamamladin!</h2>
                <p style={{ color:"#888899", marginBottom:20, fontSize:13 }}>{"Sertifika: " + p.cert + " - Toplam XP: " + xp}</p>
                <button onClick={function() {
                  var dataUrl = generateCertificate(user.name, p.cert, xp);
                  var a = document.createElement("a"); a.href = dataUrl; a.download = "AI-Sertifika.png"; a.click();
                }} style={{ background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:12, padding:"14px 36px", fontSize:16, fontWeight:700, cursor:"pointer" }}>
                  Sertifikamı Indir
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div style={{ maxWidth:560 }}>
            <p style={{ color:"#555577", fontSize:13, marginBottom:20 }}>Tum kullanicilar arasindaki XP siralaması</p>
            {lbEntries.map(function(e, i) {
              var isMe = e.name.indexOf("(Sen)") >= 0;
              var medal = i === 0 ? "1" : i === 1 ? "2" : i === 2 ? "3" : String(i + 1);
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background: isMe ? "rgba(212,168,83,0.1)" : CARD_BG, border:"1px solid "+(isMe?"rgba(212,168,83,0.3)":CARD_BORDER), borderRadius:12, padding:"12px 16px", marginBottom:8 }}>
                  <div style={{ width:30, height:30, borderRadius:7, background: i<3 ? GOLD : "rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color: i<3?"#08080f":"#888899" }}>{medal}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color: isMe ? GOLD : "#fff", fontSize:13 }}>{e.name}</div>
                    <div style={{ fontSize:11, color:"#444466" }}>{e.streak + " gun streak"}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"monospace", fontWeight:700, color: isMe ? GOLD : "#fff" }}>{e.xp + " XP"}</div>
                    <div style={{ fontSize:11, color:"#444466" }}>{getLvl(e.xp).name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "bonus" && p.bonus && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {[
              { icon:"P", title:"500+ Prompt Sablonu",   desc:"Her arac icin hazir kullanisli promptlar" },
              { icon:"G", title:"AI ile Gelir Rehberi",  desc:"AI araclariyla $1000+ kazanma stratejileri" },
              { icon:"O", title:"Otomasyon Akislari",    desc:"Make + Zapier entegrasyon sablonlari" },
              { icon:"D", title:"Discord Toplulugu",     desc:"Pro uyelere ozel kanal ve sorular" },
            ].map(function(m) {
              return (
                <div key={m.title} style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:16, padding:24 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:"rgba(212,168,83,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:GOLD, marginBottom:12 }}>{m.icon}</div>
                  <div style={{ fontWeight:700, marginBottom:6, fontSize:14 }}>{m.title}</div>
                  <div style={{ color:"#555577", fontSize:12, lineHeight:1.5, marginBottom:16 }}>{m.desc}</div>
                  <button style={{ background:"rgba(212,168,83,0.09)", border:"1px solid rgba(212,168,83,0.28)", borderRadius:7, padding:"8px 16px", color:GOLD, cursor:"pointer", fontSize:12, fontWeight:600 }}>Erisim Sagla</button>
                </div>
              );
            })}
          </div>
        )}

        {tab === "team" && p.team && <TeamPanel user={user} />}
      </div>
    </div>
  );
}

// ─── LESSON ──────────────────────────────────────────────────────────────────
function Lesson(props) {
  var lesson = props.lesson;
  var cacheKey = "lesson-v5-" + lesson.day;
  var [phase, setPhase] = useState("intro");
  var [loading, setLoading] = useState(false);
  var [loadProgress, setLoadProgress] = useState(0);
  var [loadError, setLoadError] = useState(false);
  var [cards, setCards] = useState([]);
  var [cardIndex, setCardIndex] = useState(0);
  var [ans, setAns] = useState({});
  var [score, setScore] = useState(0);
  var [earnedXP, setEarnedXP] = useState(0);
  var [cached, setCached] = useState(null);
  var quiz = DEFAULT_QUIZ;

  useEffect(function() {
    try {
      var cv = lsGet(cacheKey);
      if (cv) {
        var cd = JSON.parse(cv);
        setCached(Date.now() - cd.ts < 24*60*60*1000);
      } else { setCached(false); }
    } catch(e) { setCached(false); }
  }, [cacheKey]);

  function parseCards(text) {
    var sections = [
      { key:"NEDIR",           icon:"L", title:"Bu Arac Nedir?",              color:"#4285f4" },
      { key:"TARIHCE",         icon:"T", title:"Tarihce ve Gelisim",           color:"#6366f1" },
      { key:"TEMEL_OZELLIK_1", icon:"1", title:"Temel Ozellik 1",              color:"#d4a853" },
      { key:"TEMEL_OZELLIK_2", icon:"2", title:"Temel Ozellik 2",              color:"#d4a853" },
      { key:"TEMEL_OZELLIK_3", icon:"3", title:"Temel Ozellik 3",              color:"#d4a853" },
      { key:"TEMEL_OZELLIK_4", icon:"4", title:"Temel Ozellik 4",              color:"#d4a853" },
      { key:"TEMEL_OZELLIK_5", icon:"5", title:"Temel Ozellik 5",              color:"#d4a853" },
      { key:"KULLANIM_1",      icon:"A", title:"Baslangic Adim 1",             color:"#10a37f" },
      { key:"KULLANIM_2",      icon:"B", title:"Baslangic Adim 2",             color:"#10a37f" },
      { key:"KULLANIM_3",      icon:"C", title:"Baslangic Adim 3",             color:"#10a37f" },
      { key:"KULLANIM_4",      icon:"D", title:"Baslangic Adim 4",             color:"#10a37f" },
      { key:"KULLANIM_ILERI_1",icon:"E", title:"Ileri Seviye Kullanim 1",      color:"#059669" },
      { key:"KULLANIM_ILERI_2",icon:"F", title:"Ileri Seviye Kullanim 2",      color:"#059669" },
      { key:"KULLANIM_ILERI_3",icon:"G", title:"Ileri Seviye Kullanim 3",      color:"#059669" },
      { key:"KULLANIM_ILERI_4",icon:"H", title:"Ileri Seviye Kullanim 4",      color:"#059669" },
      { key:"PROMPT_ZAYIF",    icon:"X", title:"Zayif Prompt - Kacin!",        color:"#ef4444" },
      { key:"PROMPT_GUCLU",    icon:"P", title:"Guclu Prompt Teknigi",         color:"#8b5cf6" },
      { key:"PROMPT_UZMAN",    icon:"U", title:"Uzman Prompt Teknigi",         color:"#7c3aed" },
      { key:"PROMPT_SEKTOR_1", icon:"S", title:"Pazarlama Promptlari",         color:"#9333ea" },
      { key:"PROMPT_SEKTOR_2", icon:"K", title:"Teknoloji Promptlari",         color:"#9333ea" },
      { key:"PROMPT_SEKTOR_3", icon:"M", title:"E-Ticaret Promptlari",         color:"#9333ea" },
      { key:"ENTEGRASYON_1",   icon:"Z", title:"Entegrasyon 1",                color:"#0891b2" },
      { key:"ENTEGRASYON_2",   icon:"Y", title:"Entegrasyon 2",                color:"#0891b2" },
      { key:"ENTEGRASYON_3",   icon:"W", title:"Entegrasyon 3",                color:"#0891b2" },
      { key:"IS_MODELI_1",     icon:"$", title:"Para Kazanma Modeli 1",        color:"#f59e0b" },
      { key:"IS_MODELI_2",     icon:"$", title:"Para Kazanma Modeli 2",        color:"#f59e0b" },
      { key:"IS_MODELI_3",     icon:"$", title:"Para Kazanma Modeli 3",        color:"#f59e0b" },
      { key:"IPUCU_1",         icon:"I", title:"Uzman Ipucu 1",                color:"#dc2626" },
      { key:"IPUCU_2",         icon:"I", title:"Uzman Ipucu 2",                color:"#dc2626" },
      { key:"IPUCU_3",         icon:"I", title:"Uzman Ipucu 3",                color:"#dc2626" },
      { key:"IPUCU_4",         icon:"I", title:"Uzman Ipucu 4",                color:"#dc2626" },
      { key:"IPUCU_5",         icon:"I", title:"Uzman Ipucu 5",                color:"#dc2626" },
      { key:"HATA_1",          icon:"!", title:"Kacin: Hata 1",                color:"#ec4899" },
      { key:"HATA_2",          icon:"!", title:"Kacin: Hata 2",                color:"#ec4899" },
      { key:"HATA_3",          icon:"!", title:"Kacin: Hata 3",                color:"#ec4899" },
      { key:"HATA_4",          icon:"!", title:"Kacin: Hata 4",                color:"#ec4899" },
      { key:"HATA_5",          icon:"!", title:"Kacin: Hata 5",                color:"#ec4899" },
      { key:"KARSILASTIRMA_1", icon:"V", title:"Rakip Karsilastirma 1",        color:"#64748b" },
      { key:"KARSILASTIRMA_2", icon:"V", title:"Rakip Karsilastirma 2",        color:"#64748b" },
      { key:"KARSILASTIRMA_3", icon:"V", title:"Rakip Karsilastirma 3",        color:"#64748b" },
      { key:"GELECEK",         icon:"R", title:"Gelecek ve Trendler",          color:"#0ea5e9" },
      { key:"SEKTOR_KULLANIM_1",icon:"N",title:"Finans Sektorunde Kullanim",   color:"#10b981" },
      { key:"SEKTOR_KULLANIM_2",icon:"N",title:"Saglik Sektorunde Kullanim",   color:"#10b981" },
      { key:"SEKTOR_KULLANIM_3",icon:"N",title:"Egitim Sektorunde Kullanim",   color:"#10b981" },
      { key:"SEKTOR_KULLANIM_4",icon:"N",title:"Yaratici Endustriler",         color:"#10b981" },
      { key:"OTOMASYON_AKISI", icon:"O", title:"Otomasyon Akisi Kur",          color:"#8b5cf6" },
      { key:"VAKA_CALISMASI",  icon:"Q", title:"Gercek Vaka Calismasi",        color:"#f59e0b" },
      { key:"SERTIFIKA_HAZIRLIK",icon:"J",title:"Sertifika Hazirlik",          color:"#d4a853" },
    ];
    var result = [];
    var keys = sections.map(function(s) { return s.key; });
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var nextKeys = keys.slice(i + 1).join("|");
      var pattern = nextKeys ? s.key + "[:\\s]+([\\s\\S]*?)(?=\\n(?:" + nextKeys + ")[:\\s]|$)" : s.key + "[:\\s]+([\\s\\S]*)";
      try {
        var m = text.match(new RegExp(pattern));
        if (m && m[1] && m[1].trim().length > 15) {
          result.push({ icon:s.icon, title:s.title, body:m[1].trim(), color:s.color });
        }
      } catch(e) {}
    }
    if (result.length === 0) result.push({ icon:"?", title:lesson.tool + " Dersi", body:text, color:GOLD });
    return result;
  }

  function getFallbackCards() {
    return [
      {
        icon: "L", title: "Bu Arac Nedir?", color: "#4285f4",
        body: lesson.tool + " — " + lesson.desc + "\n\nBu ders boyunca araci sifirdan ogrenecek, gercek is senaryolarinda nasil kullanacagini kesfedeceksin. Her kart somut bir beceri kazandiriyor."
      },
      {
        icon: "O", title: "Temel Ozellikler", color: "#d4a853",
        body: "- Metin Uretimi: Tek bir aciklama ile profesyonel seviyede icerik, email, rapor ve kod uretir\n- Baglamsal Anlama: Onceki mesajlari hatirlar, uzun konusmalarda tutarli kalir\n- Cok Dilli Destek: Turkce dahil 50+ dilde akici ve dogal yanit verir\n- Dosya Analizi: PDF, Word, Excel ve gorsel dosyalari yukleyerek analiz ettirebilirsin\n- Kod Yazma: Python, JavaScript, SQL ve daha fazlasinda kod yazar, hata ayiklar"
      },
      {
        icon: "B", title: "Baslangic: Ilk 3 Adim", color: "#10a37f",
        body: "1. Hesap Olustur: Platforma git, Google hesabinla 30 saniyede kaydol. Ucretsiz plan gunluk kullanim icin yeterli.\n\n2. Net Prompt Yaz: 'Bir sey yaz' degil, 'Hedef kitle: 30-45 yas profesyoneller. Ton: samimi. 3 paragraflik LinkedIn gonderisi yaz' gibi spesifik talimatlar ver.\n\n3. Iteratif Gelistir: Ilk yanit mekemmel olmayabilir. 'Daha kisa yap', 'Ornek ekle', 'Daha guvenilir ton kullan' diyerek adim adim iyilestir."
      },
      {
        icon: "P", title: "Gercek Hayat Prompt Ornegi", color: "#8b5cf6",
        body: "SENARYO: Bir e-ticaret sitesi icin urun aciklamasi yazman gerekiyor.\n\nZAYIF PROMPT:\n'Urun aciklamasi yaz'\n\nGUCLU PROMPT:\n'Sen deneyimli bir e-ticaret metin yazarisin. Hedef kitle: 25-40 yas kadin musteriler. Urun: el yapimi seramik kupa. Ton: sicak ve hikaye anlatan. Format: baslik + 3 madde ozellik + duygusal CTA. Maks 100 kelime.'\n\nFARK: Guclu prompt ile uretilen icerik direkt kullanilabilir, zayif prompt ile defalarca duzenleme gerekir."
      },
      {
        icon: "!", title: "En Cok Yapilan 3 Hata", color: "#ef4444",
        body: "HATA 1 - Belirsiz Sormak:\n'Bana bir sey anlat' yerine net hedef, format ve ton belirt. Belirsizlik = ortalama sonuc.\n\nHATA 2 - Tek Seferlik Kullanim:\nGercek gu cu iterasyonda. 'Su satirlari duzenle', 'Daha kisa yap', 'B2B tona cevir' diyerek gelistir.\n\nHATA 3 - Dogrulamadan Kullanmak:\nYapay zeka yanilabilir. Ozellikle tarih, istatistik ve hukuki bilgileri mutlaka dogrula."
      },
    ];
  }

  function startLesson() {
    setPhase("learn");
    setCardIndex(0);
    setCards([]);
    setLoading(true);
    setLoadProgress(0);
    setLoadError(false);

    function callAPI() {
      var prog = 0;
      var timer = setInterval(function() {
        prog = Math.min(prog + Math.random() * 8, 90);
        setLoadProgress(Math.round(prog));
      }, 500);

      fetch(PROXY_URL, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:8000,
          messages:[{ role:"user", content:"Sen dunyanin en iyi AI egitmenisin. " + lesson.tool + " aracini hic bilmeyen birine ogretiyorsun. Bu kisi dersi bitirince profesyonel seviyede kullanabilmeli.\n\nRASTGELE: " + Math.floor(Math.random()*9999) + " (Her acilista farkli icerik uret)\n\nAsagidaki TUM bolumler icin genis, detayli, gercek hayat ornekli icerik yaz:\n\nNEDIR: " + lesson.tool + " ne yapar, kim gelistirdi, neden onemli, hangi sorunu cozer. 5-6 cumle.\n\nTARIHCE: Nasil ortaya cikti, ne zaman, hangi versiyonlar geldi, bugunki hali ne kazandirdi.\n\nTEMEL_OZELLIK_1: En onemli 1. ozellik - ne yapar, gercek senaryo, neden kritik\n\nTEMEL_OZELLIK_2: En onemli 2. ozellik - ne yapar, gercek senaryo, neden kritik\n\nTEMEL_OZELLIK_3: En onemli 3. ozellik - ne yapar, gercek senaryo, neden kritik\n\nTEMEL_OZELLIK_4: En onemli 4. ozellik - ne yapar, gercek senaryo, neden kritik\n\nTEMEL_OZELLIK_5: En onemli 5. ozellik - ne yapar, gercek senaryo, neden kritik\n\nKULLANIM_1: Ilk adim - ne yapilir, neden bu sirada, dikkat edilmesi gereken\n\nKULLANIM_2: Ikinci adim - ne yapilir, detaylar, ipucu\n\nKULLANIM_3: Ucuncu adim - ne yapilir, detaylar, ipucu\n\nKULLANIM_4: Dorduncu adim - ne yapilir, detaylar, ipucu\n\nKULLANIM_ILERI_1: Gelismis kullanim 1 - teknik detay, ne zaman, ornek\n\nKULLANIM_ILERI_2: Gelismis kullanim 2 - teknik detay, ne zaman, ornek\n\nKULLANIM_ILERI_3: Gelismis kullanim 3 - teknik detay, ne zaman, ornek\n\nKULLANIM_ILERI_4: Gelismis kullanim 4 - teknik detay, ne zaman, ornek\n\nPROMPT_ZAYIF: Yeni baslayanin zayif prompt ornegi ve neden zayif oldugu\n\nPROMPT_GUCLU: Ayni gorev icin guclu prompt ve neden 10 kat daha iyi sonuc verdigini ac\n\nPROMPT_UZMAN: Rol + Bagkam + Gorev + Format + Kisitlar iceren uzman seviye prompt ve analizi\n\nPROMPT_SEKTOR_1: Pazarlama icin spesifik kullanisli prompt ornegi\n\nPROMPT_SEKTOR_2: Yazilim/teknoloji icin spesifik kullanisli prompt ornegi\n\nPROMPT_SEKTOR_3: E-ticaret icin spesifik kullanisli prompt ornegi\n\nENTEGRASYON_1: En guclu 1. entegrasyon - nasil baglenir, is akisini nasil guclendirir\n\nENTEGRASYON_2: En guclu 2. entegrasyon - nasil baglenir, ornek\n\nENTEGRASYON_3: En guclu 3. entegrasyon - nasil baglenir, ornek\n\nIS_MODELI_1: Para kazanma modeli 1 - nasil, kac para, nasil baslanir\n\nIS_MODELI_2: Para kazanma modeli 2 - nasil, kac para, nasil baslanir\n\nIS_MODELI_3: Para kazanma modeli 3 - nasil, kac para, nasil baslanir\n\nIPUCU_1: Gizli teknik 1 - adim adim nasil uygulanir, somut ornek\n\nIPUCU_2: Gizli teknik 2 - neden etkili, nasil uygulanir\n\nIPUCU_3: Gizli teknik 3 - rakiplerden one geciren teknik\n\nIPUCU_4: Gizli teknik 4 - profesyonellerin kullandigi ileri teknik\n\nIPUCU_5: Gizli teknik 5 - verimlilik katlayan ozellik\n\nHATA_1: En yaygin 1. hata - neden yapilir, nasil onlenir, dogru yaklasim\n\nHATA_2: En yaygin 2. hata - neden yapilir, nasil onlenir\n\nHATA_3: En yaygin 3. hata - neden yapilir, nasil onlenir\n\nHATA_4: En yaygin 4. hata - neden yapilir, nasil onlenir\n\nHATA_5: En yaygin 5. hata - neden yapilir, nasil onlenir\n\nKARSILASTIRMA_1: En yakin rakip ile karsilastirma - hangisi ne zaman daha iyi\n\nKARSILASTIRMA_2: Ikinci rakip ile karsilastirma\n\nKARSILASTIRMA_3: Ucuncu rakip ile karsilastirma\n\nGELECEK: Bu aracin gelecegi, 2025-2026 beklentileri, nereye gidiyor\n\nSEKTOR_KULLANIM_1: Finans sektorunde nasil kullanilir - somut ornekler\n\nSEKTOR_KULLANIM_2: Saglik sektorunde nasil kullanilir - somut ornekler\n\nSEKTOR_KULLANIM_3: Egitim sektorunde nasil kullanilir - somut ornekler\n\nSEKTOR_KULLANIM_4: Yaratici endustriler icin kullanim - somut ornekler\n\nOTOMASYON_AKISI: Bu araci merkeze alan tam otomasyon akisi - adim adim kur\n\nVAKA_CALISMASI: Gercek bir sirketin bu araci nasil kullandigi ve somut sonuclari\n\nSERTIFIKA_HAZIRLIK: Uzman seviyede kullanmayi kanitlamak icin bilmen gereken 5 kritik konu\n\nTurkce yaz. Her bolumu minimum 3-4 cumle ile detayli anlat." }]
        })
      }).then(function(r) { return r.json(); }).then(function(d) {
        clearInterval(timer);
        setLoadProgress(100);
        var text = "";
        if (d.content) for (var j = 0; j < d.content.length; j++) text += d.content[j].text || "";
        if (text) {
          console.log("[startLesson] Raw API response text:", text);
          try { lsSet(cacheKey, JSON.stringify({ text:text, ts:Date.now() })); } catch(e) {}
          setTimeout(function() { setCards(parseCards(text)); setLoading(false); }, 300);
        } else {
          setCards(getFallbackCards()); setLoading(false);
        }
      }).catch(function() {
        clearInterval(timer); setLoadError(true); setLoading(false);
      });
    }

    try {
      try {
      var lv = lsGet(cacheKey);
      if (lv) {
        var ld = JSON.parse(lv);
        if (Date.now() - ld.ts < 24*60*60*1000 && ld.text) {
          console.log("[startLesson] Raw cached response text:", ld.text);
          setCards(parseCards(ld.text)); setLoading(false); return;
        }
      }
      callAPI();
    } catch(e) { callAPI(); }
    } catch(e) { callAPI(); }
  }

  function setAnswer(qi, oi) {
    var na = Object.assign({}, ans); na[qi] = oi; setAns(na);
  }

  function finish() {
    var s = 0;
    for (var i = 0; i < quiz.length; i++) { if (ans[i] === quiz[i].ans) s++; }
    var xp = xpFor(s);
    setScore(s); setEarnedXP(xp); setPhase("result");
    props.onDone(lesson.day, s, xp);
  }

  var answeredCount = Object.keys(ans).length;
  var card = cards[cardIndex];

  return (
    <div style={{ minHeight:"100vh", background:BG, color:"#fff", fontFamily:"sans-serif" }}>
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"12px 24px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={props.onBack} style={{ background:"transparent", border:"none", color:"#888899", cursor:"pointer", fontSize:18 }}>{"<"}</button>
        <span style={{ fontSize:18 }}>{lesson.icon}</span>
        <span style={{ fontWeight:700, fontSize:14 }}>{"Gun " + lesson.day + ": " + lesson.tool}</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:5 }}>
          {["intro","learn","quiz","result"].map(function(pp, i) {
            return <div key={pp} style={{ width:24, height:3, borderRadius:2, background: phase===pp ? GOLD : i < ["intro","learn","quiz","result"].indexOf(phase) ? "#10a37f" : "rgba(255,255,255,0.1)" }} />;
          })}
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 20px" }}>

        {phase === "intro" && (
          <div style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:16, padding:32, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>{lesson.icon}</div>
            <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>{lesson.tool}</h1>
            <p style={{ color:"#888899", fontSize:14, marginBottom:24, lineHeight:1.6 }}>{lesson.desc}</p>
            <div style={{ display:"flex", gap:20, justifyContent:"center", marginBottom:32, flexWrap:"wrap" }}>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800, color:GOLD }}>14</div><div style={{ fontSize:11, color:"#555577" }}>maks. kart</div></div>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800, color:GOLD }}>5</div><div style={{ fontSize:11, color:"#555577" }}>sinav sorusu</div></div>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800, color:GOLD }}>{xpFor(5) + " XP"}</div><div style={{ fontSize:11, color:"#555577" }}>maksimum</div></div>
            </div>
            <button onClick={startLesson}
              style={{ background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:12, padding:"16px 48px", fontSize:17, fontWeight:700, cursor:"pointer", width:"100%" }}>
              Dersi Baslat
            </button>
            <div style={{ marginTop:12, fontSize:12, textAlign:"center", color: cached === true ? "#10a37f" : cached === false ? "#888899" : "#555577" }}>
              {cached === true ? "Icerik hazir - aninda yuklenecek" : cached === false ? "Ilk acilis - AI icerik uretecek (~20 sn)" : "Kontrol ediliyor..."}
            </div>
          </div>
        )}

        {phase === "learn" && (
          <div>
            {loading ? (
              <div style={{ padding:"60px 20px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:20 }}>{lesson.icon}</div>
                <h3 style={{ fontWeight:700, fontSize:18, marginBottom:6 }}>{lesson.tool + " dersi hazirlaniyor"}</h3>
                <p style={{ color:"#888899", fontSize:13, marginBottom:32 }}>Yapay zeka kapsamli ders icerigi olusturuyor...</p>
                <div style={{ maxWidth:360, margin:"0 auto", marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:12, color:"#555577" }}>
                    <span>Icerik uretiliyor</span>
                    <span style={{ color:GOLD, fontFamily:"monospace", fontWeight:700 }}>{loadProgress + "%"}</span>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:100, height:10, overflow:"hidden" }}>
                    <div style={{ width:loadProgress+"%", height:"100%", background:"linear-gradient(90deg,#d4a853,#f0c060)", borderRadius:100, transition:"width 0.4s ease" }} />
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                  {["Tarihce","Ozellikler","Kullanim","Promptlar","Ipuclari","Hatalar"].map(function(s, i) {
                    return (
                      <div key={s} style={{ fontSize:11, padding:"4px 10px", borderRadius:20, background: loadProgress > i*15 ? "rgba(212,168,83,0.2)" : "rgba(255,255,255,0.04)", border:"1px solid "+(loadProgress>i*15?"rgba(212,168,83,0.4)":"rgba(255,255,255,0.07)"), color: loadProgress>i*15 ? GOLD : "#444466" }}>
                        {(loadProgress > i*15 ? "v " : "o ") + s}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : loadError ? (
              <div style={{ textAlign:"center", padding:60 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>!</div>
                <h3 style={{ color:"#ef4444", fontWeight:700, marginBottom:8 }}>Baglanti Hatasi</h3>
                <p style={{ color:"#888899", fontSize:13, marginBottom:24 }}>Proxy URL'nin dogru ayarlandigini kontrol et.</p>
                <button onClick={startLesson} style={{ background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:10, padding:"12px 28px", fontWeight:700, cursor:"pointer", fontSize:14 }}>Tekrar Dene</button>
              </div>
            ) : cards.length > 0 ? (
              <div>
                <div style={{ display:"flex", gap:4, marginBottom:20 }}>
                  {cards.map(function(_, i) { return <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= cardIndex ? GOLD : "rgba(255,255,255,0.1)" }} />; })}
                </div>
                <div style={{ fontSize:12, color:"#555577", textAlign:"center", marginBottom:16 }}>{(cardIndex+1) + " / " + cards.length + " kart"}</div>
                {card && (
                  <div style={{ background:CARD_BG, border:"1px solid "+(card.color||GOLD)+"44", borderRadius:20, padding:28, marginBottom:20, minHeight:280 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:(card.color||GOLD)+"22", border:"1px solid "+(card.color||GOLD)+"44", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:card.color||GOLD, fontSize:16, flexShrink:0 }}>{card.icon}</div>
                      <div>
                        <h2 style={{ fontSize:17, fontWeight:800, color:card.color||GOLD, margin:0 }}>{card.title}</h2>
                        <div style={{ fontSize:11, color:"#444466", marginTop:2 }}>{lesson.tool + " - Kart " + (cardIndex+1) + "/" + cards.length}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:14, color:"#ccccdd", lineHeight:1.85 }}>
                      {card.body.split("\n").map(function(line, li) {
                        if (line.trim() === "") return <div key={li} style={{ height:6 }} />;
                        if (line.match(/^[-*]\s/)) {
                          var parts = line.slice(2).split(":");
                          return (
                            <div key={li} style={{ display:"flex", gap:10, marginBottom:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:10, borderLeft:"3px solid "+(card.color||GOLD) }}>
                              <span style={{ color:card.color||GOLD, fontWeight:700, flexShrink:0 }}>v</span>
                              <span>{parts.length > 1 ? <span><strong style={{ color:"#fff" }}>{parts[0] + ":"}</strong>{parts.slice(1).join(":")}</span> : line.slice(2)}</span>
                            </div>
                          );
                        }
                        if (line.match(/^\d+\.\s/)) {
                          var num = line.match(/^\d+/)[0];
                          var rest = line.replace(/^\d+\.\s/, "");
                          var rparts = rest.split(":");
                          return (
                            <div key={li} style={{ display:"flex", gap:12, marginBottom:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:10 }}>
                              <span style={{ color:card.color||GOLD, fontWeight:800, flexShrink:0, minWidth:24, fontSize:15 }}>{num}</span>
                              <span>{rparts.length > 1 ? <span><strong style={{ color:"#fff" }}>{rparts[0] + ":"}</strong>{rparts.slice(1).join(":")}</span> : rest}</span>
                            </div>
                          );
                        }
                        return <p key={li} style={{ marginBottom:8 }}>{line}</p>;
                      })}
                    </div>
                  </div>
                )}
                <div style={{ display:"flex", gap:12 }}>
                  {cardIndex > 0 && (
                    <button onClick={function() { setCardIndex(cardIndex - 1); }}
                      style={{ flex:1, background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:"14px 0", fontSize:14, color:"#888899", cursor:"pointer" }}>
                      Geri
                    </button>
                  )}
                  {cardIndex < cards.length - 1 ? (
                    <button onClick={function() { setCardIndex(cardIndex + 1); }}
                      style={{ flex:2, background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:12, padding:"14px 0", fontSize:15, fontWeight:700, cursor:"pointer" }}>
                      Anladin, Devam Et
                    </button>
                  ) : (
                    <button onClick={function() { setPhase("quiz"); }}
                      style={{ flex:2, background:"linear-gradient(135deg,#10a37f,#0d8a6a)", color:"#fff", border:"none", borderRadius:12, padding:"14px 0", fontSize:15, fontWeight:700, cursor:"pointer" }}>
                      Sinava Gec
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {phase === "quiz" && (
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>{lesson.tool + " Sinavi"}</h2>
            <p style={{ color:"#555577", fontSize:12, marginBottom:28 }}>{"5 soru - Her dogru cevap + " + xpFor(1) + " XP"}</p>
            {quiz.map(function(q, qi) {
              return (
                <div key={qi} style={{ background:CARD_BG, border:"1px solid "+CARD_BORDER, borderRadius:14, padding:20, marginBottom:16 }}>
                  <p style={{ fontWeight:600, marginBottom:14, lineHeight:1.5, fontSize:14 }}>{(qi+1) + ". " + q.q}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {q.opts.map(function(opt, oi) {
                      var selected = ans[qi] === oi;
                      return (
                        <div key={oi} onClick={function() { setAnswer(qi, oi); }}
                          style={{ padding:"11px 14px", borderRadius:9, border:"1px solid "+(selected?GOLD:"rgba(255,255,255,0.09)"), background: selected ? "rgba(212,168,83,0.13)" : "rgba(255,255,255,0.02)", cursor:"pointer", fontSize:13, color: selected ? GOLD : "#ccccdd" }}>
                          {["A","B","C","D"][oi] + ") " + opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <button onClick={finish} disabled={answeredCount < quiz.length}
              style={{ width:"100%", background: answeredCount < quiz.length ? "#333" : "linear-gradient(135deg,#d4a853,#f0c060)", color: answeredCount < quiz.length ? "#666" : "#08080f", border:"none", borderRadius:12, padding:"14px 0", fontSize:15, fontWeight:700, cursor: answeredCount < quiz.length ? "not-allowed" : "pointer" }}>
              {answeredCount < quiz.length ? ((quiz.length - answeredCount) + " soru kaldi") : "Sinavi Bitir"}
            </button>
          </div>
        )}

        {phase === "result" && (
          <div style={{ textAlign:"center", paddingTop:32 }}>
            <div style={{ fontSize:68, marginBottom:18 }}>{score >= 4 ? "Mukemmel" : score >= 3 ? "Iyi" : "Tekrar"}</div>
            <h2 style={{ fontSize:30, fontWeight:800, marginBottom:8 }}>{score >= 4 ? "Mukemmel!" : score >= 3 ? "Iyi Is!" : "Biraz Daha Calis!"}</h2>
            <div style={{ fontSize:52, fontWeight:800, color:GOLD, fontFamily:"monospace", margin:"18px 0" }}>{score + "/5"}</div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(212,168,83,0.1)", border:"1px solid rgba(212,168,83,0.3)", borderRadius:11, padding:"11px 22px", marginBottom:28, fontSize:16, fontWeight:700, color:GOLD }}>
              {"+" + earnedXP + " XP Kazandin!"}
            </div>
            <div style={{ display:"flex", gap:7, justifyContent:"center", marginBottom:32 }}>
              {[0,1,2,3,4].map(function(i) {
                return <div key={i} style={{ width:36, height:36, borderRadius:7, background: i < score ? GOLD : "rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color: i < score ? "#08080f" : "#555577" }}>{i < score ? "v" : "o"}</div>;
              })}
            </div>
            <button onClick={props.onBack}
              style={{ background:"linear-gradient(135deg,#d4a853,#f0c060)", color:"#08080f", border:"none", borderRadius:12, padding:"13px 40px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
              Dashboard'a Don
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  var [page, setPage] = useState("landing");
  var [user, setUser] = useState(null);
  var [plan, setPlan] = useState(null);
  var [lesson, setLesson] = useState(null);
  var [mentor, setMentor] = useState(false);
  var [xpToast, setXpToast] = useState(null);
  var [booting, setBooting] = useState(true);
  var [inviteData, setInviteData] = useState(null);

  useEffect(function() {
    if (typeof window === "undefined") { setBooting(false); return; }
    // Davet linki kontrolu
    try {
      var params = new URLSearchParams(window.location.search);
      var inviteCode = params.get("invite");
      if (inviteCode) {
        var parsed = parseInviteCode(inviteCode);
        if (parsed) setInviteData(parsed);
      }
    } catch(e) {}
    // Kayitli kullanici kontrolu
    try {
      var su = lsGet("aica-user");
      if (su) { var u = JSON.parse(su); setUser(u); setPage("dashboard"); }
    } catch(e) {}
    setBooting(false);
  }, []);

  function updateUser(fn) {
    setUser(function(prev) {
      var next = fn(prev);
      saveUser(next);
      return next;
    });
  }

  function handleRegDone(u) { setUser(u); saveUser(u); setPage("onboarding"); }
  function handleOnbDone(prof) { updateUser(function(p) { return Object.assign({}, p, { profile:prof }); }); setPage("dashboard"); }
  function handleLogout() { setUser(null); deleteUser(); setPage("landing"); }
  function handleLessonStart(l) { setLesson(l); setPage("lesson"); }
  function handleLessonDone(day, sc, xp) {
    updateUser(function(prev) {
      var np = Object.assign({}, prev.progress || {}); np[day] = "done";
      var ns = Object.assign({}, prev.scores || {}); ns[day] = sc;
      return Object.assign({}, prev, { progress:np, scores:ns, xp:(prev.xp||0)+xp, streak:(prev.streak||0)+1 });
    });
    setXpToast(xp);
  }

  if (booting) {
    return (
      <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", fontFamily:"sans-serif" }}>
          <div style={{ fontSize:40, fontWeight:800, color:GOLD, marginBottom:10 }}>AI</div>
          <div style={{ color:"#555577", fontSize:13 }}>Yukleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {xpToast && <XPToast xp={xpToast} onDone={function() { setXpToast(null); }} />}
      {mentor && user && <MentorChat user={user} onClose={function() { setMentor(false); }} />}
      {page === "landing" && <Landing onGo={function(target, p) { if (target === "register") { setPlan(p); setPage("register"); } }} />}
      {page === "register" && <Register plan={plan} inviteData={inviteData} onDone={handleRegDone} onLogin={function() { setPage("login"); }} />}
      {page === "login" && <Login onRegister={function() { setPage("register"); }} onDone={function(u) { setUser(u); saveUser(u); setPage("dashboard"); }} />}
      {page === "onboarding" && <Onboarding onDone={handleOnbDone} />}
      {page === "dashboard" && <Dashboard user={user} onLesson={handleLessonStart} onLogout={handleLogout} onMentor={function() { setMentor(true); }} />}
      {page === "lesson" && <Lesson lesson={lesson} user={user} onDone={handleLessonDone} onBack={function() { setPage("dashboard"); }} />}
    </div>
  );
}
