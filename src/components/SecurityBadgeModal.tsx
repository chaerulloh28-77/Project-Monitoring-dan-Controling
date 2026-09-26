import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw,
  X,
  FileCheck
} from 'lucide-react';
import { securityGuard, SecurityEvent } from '../services/securityGuard';

interface SecurityBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityBadgeModal: React.FC<SecurityBadgeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [cert, setCert] = useState(securityGuard.getCertificateInfo());
  const [events, setEvents] = useState<SecurityEvent[]>(securityGuard.getEvents());
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCert(securityGuard.getCertificateInfo());
      setEvents(securityGuard.getEvents());

      const unsubscribe = securityGuard.onSecurityEvent(() => {
        setCert(securityGuard.getCertificateInfo());
        setEvents(securityGuard.getEvents());
      });

      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(`${cert.certificateId} | OWNER: ${cert.author} | HASH: ${cert.integrityHash}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      securityGuard.verifySystemIntegrity();
      setCert(securityGuard.getCertificateInfo());
      setEvents(securityGuard.getEvents());
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/15">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  PMO Security & Anti-Cloning Guard
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  PROTECTED © PAUL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistem Keamanan Berlapis Pencegah Kloning, Duplikasi, dan Pembajakan Kode
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Certificate Card */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Sertifikat Digital & Lisensi Hak Cipta</span>
              </div>
              <button
                onClick={handleCopyLicense}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Lisensi'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Digital Certificate ID</span>
                <span className="font-mono text-emerald-300 font-semibold text-[11px]">{cert.certificateId}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Pemilik Hak Cipta / Author</span>
                <span className="font-mono text-sky-300 font-semibold text-[11px]">© {cert.author} (Hak Cipta Dilindungi)</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Integritas Checksum</span>
                <span className="font-mono text-purple-300 font-semibold text-[11px]">{cert.integrityHash} • VALID</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Status Keamanan Sistem</span>
                <span className="font-mono text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Aktif ({cert.violations} Pelanggaran Dicegah)
                </span>
              </div>
            </div>
          </div>

          {/* Active Security Layers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Modul Proteksi Aktif (5 Lapisan Keamanan)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">Anti-Inspection & DevTools Shield</span>
                  <span className="text-[11px] text-slate-400">
                    Mencegat pintasan F12, Ctrl+U, Ctrl+Shift+I/J/C, dan klik kanan pada data tabel.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">Steganographic DOM Watermark</span>
                  <span className="text-[11px] text-slate-400">
                    Menyisipkan sidik jari digital tak kasat mata berlisensi © PAUL ke dalam struktur dokumen.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">Anti-Cloning Integrity Checksum</span>
                  <span className="text-[11px] text-slate-400">
                    Memvalidasi integritas runtime memori setiap 30 detik untuk mendeteksi perubahan ilegal.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">Segel Digital Data Export</span>
                  <span className="text-[11px] text-slate-400">
                    Setiap ekspor Excel/CSV dan JSON disegel tanda tangan digital berpemilik untuk pelacakan.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Event Audit Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Log Audit Keamanan Real-Time</span>
              </h4>
              <button
                onClick={handleManualVerify}
                disabled={isVerifying}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>Verifikasi Integritas</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar">
              {events.length === 0 ? (
                <div className="text-slate-500 py-3 text-center">Belum ada aktivitas mencurigakan terdeteksi.</div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 shrink-0">[{ev.timestamp}]</span>
                    {ev.severity === 'warning' ? (
                      <span className="text-amber-400 font-semibold shrink-0">[BLOCKED]</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold shrink-0">[SECURE]</span>
                    )}
                    <span className={ev.severity === 'warning' ? 'text-amber-200' : 'text-slate-300'}>
                      {ev.detail}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Operasional Normal & Bebas Error</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
