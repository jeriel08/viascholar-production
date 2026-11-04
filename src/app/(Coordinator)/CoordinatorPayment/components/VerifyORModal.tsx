"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type DisbursementItem, settleCoordinatorOfficialReceipt } from "@/lib/api/disbursements";

interface VerifyORModalProps {
  disbursement: DisbursementItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerifyORModal({ disbursement, open, onClose, onSuccess }: VerifyORModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [settlementRemarks, setSettlementRemarks] = useState("");

  if (!open || !disbursement) return null;

  const scholarName = `${disbursement.scholar_profile?.first_name || ""} ${disbursement.scholar_profile?.last_name || ""}`;
  const rawOrUrl = disbursement.or_document?.file_url;
  const isOrUrlValid = Boolean(
    rawOrUrl &&
      (rawOrUrl.startsWith("http://") ||
        rawOrUrl.startsWith("https://") ||
        rawOrUrl.startsWith("blob:") ||
        rawOrUrl.startsWith("data:"))
  );
  const orUrl = isOrUrlValid ? rawOrUrl : null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val || 0);
  };

  const handleSettle = async () => {
    try {
      setSubmitting(true);
      const res = await settleCoordinatorOfficialReceipt(disbursement.disbursement_id, {
        approved: true,
        remarks: settlementRemarks.trim() || "Official Receipt verified against check amount and settled.",
      });
      toast.success(res.message || "Disbursement transaction successfully settled.");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to settle disbursement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejecting the Official Receipt.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await settleCoordinatorOfficialReceipt(disbursement.disbursement_id, {
        approved: false,
        rejection_reason: rejectionReason.trim(),
      });
      toast.success(res.message || "Official Receipt marked for re-upload.");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject Official Receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-line w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-[#0a4f42]" />
            <h2 className="text-base font-bold text-navy">Official Receipt (OR) Audit & Settlement</h2>
            <Badge className="bg-[#0a4f42]/10 text-[#0a4f42] border-[#0a4f42]/20 text-xs font-semibold">
              Pending Audit
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Side-by-side Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line overflow-y-auto flex-1">
          {/* Left Column: OR Photo Preview */}
          <div className="p-6 bg-slate-900/5 flex flex-col items-center justify-center relative min-h-90">
            {orUrl ? (
              <div className="relative w-full h-full min-h-85 rounded-xl overflow-hidden border border-slate-300 bg-white flex items-center justify-center">
                {orUrl.toLowerCase().endsWith(".pdf") ? (
                  <iframe src={orUrl} title="Official Receipt PDF" className="w-full h-full min-h-85" />
                ) : (
                  <Image src={orUrl} alt="Official Receipt" fill unoptimized className="object-contain p-2" />
                )}
                <a
                  href={orUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-black transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Open Full Document</span>
                </a>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground text-xs">
                {rawOrUrl ? "Document preview unavailable (file URL not found or inaccessible)." : "No receipt document uploaded yet."}
              </div>
            )}
          </div>

          {/* Right Column: Comparison & Settlement Actions */}
          <div className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Scholar Header */}
              <div>
                <h3 className="text-base font-bold text-navy">{scholarName}</h3>
                <p className="text-xs text-muted-foreground">
                  ID: {disbursement.scholar_profile?.student_number || "—"} •{" "}
                  {disbursement.scholar_profile?.school_name}
                </p>
              </div>

              {/* Check & SOA Details Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Registered School Payee:</span>
                  <span className="font-bold text-slate-800">{disbursement.check_payee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Check Number:</span>
                  <span className="font-mono font-bold text-navy">
                    {disbursement.check_number || "—"} ({disbursement.bank_name || "Bank"})
                  </span>
                </div>
                {disbursement.voucher_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Voucher #:</span>
                    <span className="font-mono font-bold text-slate-700">{disbursement.voucher_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Verified Check Amount:</span>
                  <span className="font-black text-[#0a4f42] text-sm tabular-nums">
                    {formatCurrency(Number(disbursement.amount))}
                  </span>
                </div>
              </div>

              {/* Submitted OR Details */}
              <div className="p-3.5 bg-[#0a4f42]/5 border border-[#0a4f42]/15 rounded-xl text-xs space-y-2">
                <p className="font-bold text-navy uppercase tracking-wide text-[10px]">Scholar Receipt Submission</p>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Official Receipt Number:</span>
                  <span className="font-mono font-black text-navy text-sm">#{disbursement.or_number || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Receipt Payment Date:</span>
                  <span className="font-bold text-slate-800">
                    {disbursement.or_payment_date ? new Date(disbursement.or_payment_date).toLocaleDateString() : "—"}
                  </span>
                </div>
                {disbursement.remarks && (
                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-line">
                    <span className="font-semibold text-slate-700">Remarks: </span>
                    {disbursement.remarks}
                  </div>
                )}
              </div>

              {/* AI OCR Extracted Data (if available) */}
              {disbursement.or_document?.extracted_data && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
                  <p className="font-bold text-emerald-900 uppercase tracking-wide text-[10px]">
                    AI OCR Extracted Values
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {disbursement.or_document.extracted_data.student_id && (
                      <div>
                        <span className="text-slate-500">Student ID: </span>
                        <strong className="text-slate-800 font-mono">
                          {disbursement.or_document.extracted_data.student_id}
                        </strong>
                      </div>
                    )}
                    {disbursement.or_document.extracted_data.amount_paid != null && (
                      <div>
                        <span className="text-slate-500">Amount: </span>
                        <strong className="text-emerald-800 font-semibold">
                          ₱
                          {Number(disbursement.or_document.extracted_data.amount_paid).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </div>
                    )}
                    {disbursement.or_document.extracted_data.student_name && (
                      <div className="col-span-2 truncate">
                        <span className="text-slate-500">Payor: </span>
                        <strong className="text-slate-800">
                          {disbursement.or_document.extracted_data.student_name}
                        </strong>
                      </div>
                    )}
                    {disbursement.or_document.extracted_data.school_name && (
                      <div className="col-span-2 truncate">
                        <span className="text-slate-500">School: </span>
                        <strong className="text-slate-800">
                          {disbursement.or_document.extracted_data.school_name}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Form vs Settlement Remarks */}
              {showRejectForm ? (
                <div className="space-y-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <Label className="text-xs font-bold text-red-900">Reason for Requesting Re-upload</Label>
                  <Textarea
                    placeholder="e.g., Receipt amount is blurry, OR number is unreadable, or doesn't match..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    className="rounded-xl border-red-300 bg-white text-xs resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Settlement Memo (Optional)</Label>
                  <Input
                    placeholder="e.g., OR verified against UM cashier portal ledger..."
                    value={settlementRemarks}
                    onChange={(e) => setSettlementRemarks(e.target.value)}
                    className="h-9 rounded-xl border-line bg-white text-xs"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-line flex items-center justify-between gap-2 shrink-0">
              {showRejectForm ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectForm(false)}
                    className="h-9 rounded-xl border-line text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={submitting}
                    onClick={handleReject}
                    className="h-9 rounded-xl text-xs font-bold px-4 gap-1.5"
                  >
                    {submitting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <AlertTriangle className="size-3.5" />
                    )}
                    <span>Confirm Re-upload Request</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectForm(true)}
                    className="h-9 rounded-xl border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold"
                  >
                    Request Re-upload
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={submitting}
                    onClick={handleSettle}
                    className="h-9 rounded-xl bg-[#0a4f42] hover:bg-[#083c32] text-white text-xs font-bold px-5 gap-1.5 shadow-xs"
                  >
                    {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                    <span>Verify & Mark as Settled</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
