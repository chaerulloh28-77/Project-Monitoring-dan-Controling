import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Layers, 
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { documentStorageService } from '../services/documentStorageService';
import { DOCUMENT_SLOTS, DocumentTypeKey } from '../types/document';

interface EmailShareModalProps {
  isOpen: boolean;
  project: ProjectData | null;
  specificSlot?: DocumentTypeKey;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

export const EmailShareModal: React.FC<EmailShareModalProps> = ({
  isOpen,
  project,
  specificSlot,
  onClose,
  showToast,
}) => {
  const [toEmail, setToEmail] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (project) {
      setToEmail('');
      setCcEmail('');
      setCustomMessage('');
      setCopied(false);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const record = documentStorageService.getDocumentRecord(project);
  const docs = record.documents;
  const uploadedSlots = DOCUMENT_SLOTS.filter((s) => docs[s.key]);
  const targetSlot = specificSlot ? DOCUMENT_SLOTS.find((s) => s.key === specificSlot) : null;

  const { subject, body, mailtoUrl } = documentStorageService.generateEmailShareContent(project, {
    toEmail,
    ccEmail,
    customMessage,
    specificSlot,
  });

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setCopied(true);
      if (showToast) showToast('Format ringkasan email berhasil disalin ke clipboard.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      if (showToast) showToast('Gagal menyalin ke clipboard.');
    }
  };

  const handleOpenClient = () => {
    try {
      window.location.href = mailtoUrl;
      if (showToast) showToast('Membuka aplikasi email...');
      onClose();
    } catch {
      if (showToast) showToast('Gagal membuka client email.');
    }
  };

  const handleSendAsync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail.trim()) {
      if (showToast) showToast('Harap masukkan alamat email tujuan.');
      return;
    }

    setIsSending(true);
    // Simulate real-world asynchronous dispatch
    await new Promise((res) => setTimeout(res, 800));
    setIsSending(false);

    if (showToast) {
      showToast(`Email notifikasi dokumen berhasil dikirim ke ${toEmail.trim()}!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
              <Mail className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Share Dokumen via Email</h3>
              <p className="text-xs text-sky-200">
                {project.pmoId} • {project.projectDescription}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSendAsync} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Document Banner */}
          {targetSlot && docs[targetSlot.key] && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <div>
                  <span className="font-semibold text-slate-800">{targetSlot.label}:</span>{' '}
                  <span className="text-slate-600 font-mono">{docs[targetSlot.key]!.name}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide bg-sky-200 text-sky-800 px-2 py-0.5 rounded">
                Dokumen Spesifik
              </span>
            </div>
          )}

          {/* Form Fields: Recipient, CC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Kirim Ke (To Email) <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="misal: dinas.pupr@kota.go.id, tim@linknet.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tembusan (CC Email)
              </label>
              <input
                type="text"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="misal: manager.pmo@linknet.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>

          {/* Subject Field (Read-only preview) */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Subjek Email</label>
            <input
              type="text"
              readOnly
              value={subject}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px]"
            />
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Tambahkan pesan instruksi atau keterangan khusus kepada penerima..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Email Preview Card */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Ringkasan Berkas yang Terlampir ({uploadedSlots.length} Dokumen)
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Format'}</span>
              </button>
            </div>
            
            <pre className="text-[11px] font-mono text-slate-600 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar p-2 bg-white rounded-lg border border-slate-200/80 leading-relaxed">
              {body}
            </pre>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleOpenClient}
              title="Buka langsung di aplikasi Gmail atau Microsoft Outlook bawaan perangkat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Mail Client / Gmail</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
