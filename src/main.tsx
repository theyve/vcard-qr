import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./index.css";

// VCard QR Code Generator
// - Fields: name, job title, company, address, phone, email, website, LinkedIn URL
// - Downloads: PNG (canvas) + SVG (generated string)

function sanitizeLine(v: string) {
  // Escape per vCard text rules (basic): backslash, semicolon, comma, newline
  return (v || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .trim();
}

function ensureUrl(v: string) {
  const s = (v || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function buildVCard(data: {
  fullName: string;
  jobTitle: string;
  company: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
}) {
  // vCard 3.0 is the most widely compatible for QR scanners.
  const fullName = sanitizeLine(data.fullName);
  const jobTitle = sanitizeLine(data.jobTitle);
  const company = sanitizeLine(data.company);
  const address = sanitizeLine(data.address);
  const phone = sanitizeLine(data.phone);
  const email = sanitizeLine(data.email);
  const website = sanitizeLine(ensureUrl(data.website));
  const linkedin = sanitizeLine(ensureUrl(data.linkedin));

  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  if (fullName) {
    lines.push(`FN:${fullName}`);
    // Best-effort split for N: Last;First;Additional;Prefix;Suffix
    // If user enters one name, keep it as First.
    const parts = fullName.split(" ").filter(Boolean);
    const first = parts.length ? parts[0] : "";
    const last = parts.length > 1 ? parts.slice(1).join(" ") : "";
    lines.push(`N:${sanitizeLine(last)};${sanitizeLine(first)};;;`);
  }

  if (jobTitle) lines.push(`TITLE:${jobTitle}`);
  if (company) lines.push(`ORG:${company}`);

  if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);

  if (address) {
    // Put everything into the street field to avoid over-complication.
    lines.push(`ADR;TYPE=WORK:;;${address};;;;`);
  }

  if (website) lines.push(`URL:${website}`);

  // LinkedIn: put as URL with label note for better compatibility
  if (linkedin) {
    lines.push(`X-SOCIALPROFILE;type=linkedin:${linkedin}`);
    lines.push(`NOTE:LinkedIn ${linkedin}`);
  }

  lines.push("END:VCARD");

  // QR expects CRLF per spec, but most readers accept LF. Use CRLF for best compatibility.
  return lines.join("\r\n");
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function VCardQrGenerator() {
  const [form, setForm] = useState({
    fullName: "",
    jobTitle: "",
    company: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    linkedin: "",
  });

  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [size, setSize] = useState(320);
  const [svg, setSvg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const vcard = useMemo(() => buildVCard(form), [form]);

  const hasAnything = useMemo(() => {
    return Object.values(form).some((v) => (v || "").trim().length > 0);
  }, [form]);

  useEffect(() => {
    let cancelled = false;
    async function gen() {
      if (!hasAnything) {
        setSvg("");
        // clear canvas
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        return;
      }

      setLoading(true);
      try {
        const opts = {
          errorCorrectionLevel: errorCorrection,
          margin: 2,
          width: size,
        } as const;

        // SVG string
        const svgString = await QRCode.toString(vcard, { ...opts, type: "svg" });
        if (!cancelled) setSvg(svgString);

        // Canvas for PNG
        if (canvasRef.current) {
          canvasRef.current.width = size;
          canvasRef.current.height = size;
          await QRCode.toCanvas(canvasRef.current, vcard, opts);
        }
      } catch (e: any) {
        if (!cancelled) setSvg("");
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    gen();
    return () => {
      cancelled = true;
    };
  }, [vcard, errorCorrection, size, hasAnything]);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onDownloadPNG() {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const safeName = (form.fullName || "vcard").trim().replace(/\s+/g, "-").toLowerCase();
    downloadDataUrl(`${safeName || "vcard"}-qr.png`, dataUrl);
  }

  async function onDownloadSVG() {
    const safeName = (form.fullName || "vcard").trim().replace(/\s+/g, "-").toLowerCase();
    const content = svg || "";
    const blob = new Blob([content], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(`${safeName || "vcard"}-qr.svg`, blob);
  }

  async function onCopyVCard() {
    try {
      await navigator.clipboard.writeText(vcard);
    } catch {
      // fallback: no-op
    }
  }

  const showWarning = useMemo(() => {
    // vCards can get large; warn if getting long (QR might become dense)
    return vcard.length > 900;
  }, [vcard.length]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div>
              <div className="text-xl font-semibold">VCard QR code generator</div>
              <div className="text-sm text-muted-foreground">
                Fill what you want. The QR encodes a vCard 3.0 contact.
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label htmlFor="fullName">Name</Label>
                <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="jobTitle">Job title</Label>
                <Input id="jobTitle" value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} placeholder="Product Designer" />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Inc." />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, City, ZIP, Country" />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+41 79 123 45 67" />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@acme.com" />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="acme.com" />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input id="linkedin" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin.com/in/janedoe" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <div className="text-xl font-semibold">Preview</div>
              <div className="text-sm text-muted-foreground">
                Scanning should open “Add contact” on most phones.
              </div>
            </div>

            <div className="flex items-center justify-center rounded-2xl border p-4 min-h-[380px]">
              {!hasAnything ? (
                <div className="text-sm text-muted-foreground">Fill at least one field to generate a QR.</div>
              ) : loading && !svg ? (
                <div className="text-sm text-muted-foreground">Generating…</div>
              ) : (
                <div
                  className="w-full max-w-[420px]"
                  // qrcode svg is safe markup here (no user HTML), but it includes user content in <desc> sometimes.
                  // Still: treat as trusted library output.
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              )}
            </div>

            {/* Canvas used for PNG export (kept hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="grid gap-3 ">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="size">QR size (px)</Label>
                  <Input
                    id="size"
                    type="number"
                    min={160}
                    max={1024}
                    value={size}
                    onChange={(e) => setSize(Math.max(160, Math.min(1024, Number(e.target.value || 0))))}
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="ec">Error correction</Label>
                  <select
                    id="ec"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as any)}
                  >
                    <option value="L">L (smallest QR)</option>
                    <option value="M">M (balanced)</option>
                    <option value="Q">Q (robust)</option>
                    <option value="H">H (most robust)</option>
                  </select>
                </div>
              </div>

              {showWarning && (
                <div className="text-sm rounded-xl border p-3">
                  Your vCard is pretty long. QR might get dense and scan worse. Consider shortening the address / links or
                  bump error correction down.
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={onDownloadPNG} disabled={!hasAnything || loading}>
                  Download PNG
                </Button>
                <Button variant="secondary" onClick={onDownloadSVG} disabled={!hasAnything || loading || !svg}>
                  Download SVG
                </Button>
                <Button variant="outline" onClick={onCopyVCard} disabled={!hasAnything}>
                  Copy vCard
                </Button>
              </div>
            </div>

            <div className="space-y-2 mt-15">
              <div className="text-sm font-medium">vCard payload</div>
              <pre className="text-xs rounded-xl border p-3 overflow-auto whitespace-pre-wrap">
                {vcard.split(/\r?\n/).map((line, i) => {
                  const colonIdx = line.indexOf(":");
                  if (colonIdx === -1) {
                    return <span key={i}>{line}{"\n"}</span>;
                  }
                  const field = line.slice(0, colonIdx);
                  const value = line.slice(colonIdx + 1);
                  // Highlight keywords
                  const isStructural = /^(BEGIN|END|VERSION)$/i.test(field);
                  const isProperty = /^(FN|N|TITLE|ORG|TEL|EMAIL|ADR|URL|NOTE|X-SOCIALPROFILE)/i.test(field);
                  return (
                    <span key={i}>
                      <span className={isStructural ? "text-violet-600 font-semibold" : isProperty ? "text-sky-600 font-medium" : ""}>
                        {field}
                      </span>
                      <span className="text-slate-400">:</span>
                      <span className="text-emerald-700">{value}</span>
                      {"\n"}
                    </span>
                  );
                })}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VCardQrGenerator />
  </StrictMode>
);
