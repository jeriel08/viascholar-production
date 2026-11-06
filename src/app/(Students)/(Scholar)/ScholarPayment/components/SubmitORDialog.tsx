"use client";

import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Hash,
  Loader2,
  Sparkles,
  UploadCloud,
  User,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type DisbursementItem,
  type ExtractedOfficialReceiptData,
  submitScholarOfficialReceipt,
  uploadOfficialReceiptFile,
} from "@/lib/api/disbursements";

interface SubmitORDialogProps {
  disbursement: DisbursementItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubmitORDialog({ disbursement, open, onClose, onSuccess }: SubmitORDialogProps) {
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [orNumber, setOrNumber] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedOfficialReceiptData | null>(null);
  const [manualAmount, setManualAmount] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open || !disbursement) return null;

  const expectedAmount = Number(disbursement.amount || 0);
  const detectedAmount = extractedData?.amount_paid != null ? Number(extractedData.amount_paid) : null;
  const effectiveAmount = detectedAmount ?? (manualAmount ? parseFloat(manualAmount) : null);
  const isAmountMismatch =
    effectiveAmount != null && Math.abs(effectiveAmount - expectedAmount) > 0.01;
  const isAmountMatching =
    effectiveAmount != null && Math.abs(effectiveAmount - expectedAmount) <= 0.01;

  const handleClose = () => {
    setFileUrl("");
    setFileName("");
    setOrNumber("");
    setExtractedData(null);
    setManualAmount("");
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadOfficialReceiptFile(file);

      setFileUrl(res.file_url);
      setFileName(res.file_name);
      setManualAmount("");

      if (res.extracted_data) {
        setExtractedData(res.extracted_data);
        if (res.extracted_data.or_number) {
          setOrNumber(res.extracted_data.or_number);
        }
        const scannedAmount =
          res.extracted_data.amount_paid != null ? Number(res.extracted_data.amount_paid) : null;
        if (scannedAmount != null && Math.abs(scannedAmount - expectedAmount) > 0.01) {
          toast.error(
            `Receipt Rejected: Detected amount (₱${scannedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}) does not match the check disbursement (₱${expectedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}).`
          );
        } else {
          toast.success("Receipt scanned successfully!");
        }
      } else {
        toast.success("Official Receipt uploaded.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload and scan receipt.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      toast.error("Please take a photo or upload your Official Receipt.");
      return;
    }

    if (isAmountMismatch) {
      toast.error(
        `Submission blocked: The receipt amount (₱${effectiveAmount?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}) does not match the check disbursement amount (₱${expectedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}).`
      );
      return;
    }

    if (detectedAmount === null && !manualAmount) {
      toast.error("Please confirm the amount paid on the receipt before submitting.");
      return;
    }

    const orNum = orNumber.trim();
    if (!orNum) {
      toast.error("Please enter or verify the Official Receipt (OR) Number.");
      return;
    }

    try {
      setSubmitting(true);
      const payDate = extractedData?.payment_date || new Date().toISOString().split("T")[0];

      const res = await submitScholarOfficialReceipt(disbursement.disbursement_id, {
        or_number: orNum,
        or_payment_date: payDate,
        file_url: fileUrl,
        or_amount: effectiveAmount ?? undefined,
        file_name: fileName || undefined,
        extracted_data: extractedData ? { ...extractedData, or_number: orNum } : undefined,
      });
      toast.success(res.message || "Official Receipt submitted successfully for coordinator audit.");
      handleClose();
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-line w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="size-5 text-[#0a4f42]" />
            <h2 className="text-base font-bold text-navy">Submit Official Receipt (OR)</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Target Disbursement Info Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-line space-y-1 text-xs">
            <div className="flex items-center justify-between text-navy font-bold">
              <span>Tuition Disbursement #{disbursement.disbursement_id}</span>
              <span className="text-[#0a4f42]">
                ₱{Number(disbursement.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>
                {disbursement.academic_year} • {disbursement.semester}
              </span>
              <span>Check #{disbursement.check_number || "—"}</span>
            </div>
          </div>

          {/* Photo Uploader / Preview */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Official Receipt Document</Label>
            {fileUrl ? (
              <div className="rounded-xl border border-line bg-slate-50 p-3 space-y-3">
                <div className="flex items-center justify-between gap-2.5 overflow-hidden">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="relative size-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                      <Image src={fileUrl} alt="OR Preview" fill unoptimized className="object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-navy truncate">{fileName || "Official Receipt"}</p>
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <FileCheck2 className="size-3.5" /> Ready for submission
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-7 px-2 text-xs font-semibold text-[#0a4f42]"
                    >
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <ExternalLink className="size-3" />
                        <span>Inspect</span>
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFileUrl("");
                        setFileName("");
                        setOrNumber("");
                        setExtractedData(null);
                      }}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-[#0a4f42] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? (
                  <>
                    <Loader2 className="size-6 animate-spin text-[#0a4f42]" />
                    <p className="text-xs font-semibold text-slate-700">Scanning Receipt...</p>
                    <p className="text-[11px] text-muted-foreground">Reading cashier numbers and payment details</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-6 text-[#0a4f42]" />
                    <p className="text-xs font-bold text-navy">Take Photo or Upload Official Receipt</p>
                    <p className="text-[11px] text-muted-foreground text-center">
                      PNG, JPG, or PDF from university cashier (Continuous / thermal prints supported)
                    </p>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Amount Validation & Policy Feedback */}
          {fileUrl && isAmountMismatch && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2.5 text-xs text-rose-950 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <XCircle className="size-4.5 text-rose-600 shrink-0" />
                <span>Receipt Rejected: Amount Mismatch</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-800">
                The amount on this receipt (
                <strong className="text-rose-900 font-mono">
                  ₱{effectiveAmount?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </strong>
                ) does not match the issued tuition check of{" "}
                <strong className="text-rose-900 font-mono">
                  ₱{expectedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </strong>
                .
              </p>
              <div className="flex items-center justify-between p-2 bg-rose-100/70 rounded-lg text-[11px] font-semibold text-rose-900 border border-rose-200">
                <span>Discrepancy:</span>
                <span className="font-mono font-bold text-rose-700">
                  -₱{Math.abs((effectiveAmount || 0) - expectedAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[11px] text-rose-700">
                According to scholarship financial policy, submitted Official Receipts must account for the exact check amount. Submission is blocked until a matching receipt is uploaded.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFileUrl("");
                  setFileName("");
                  setOrNumber("");
                  setExtractedData(null);
                  setManualAmount("");
                }}
                className="h-7 text-xs font-semibold text-rose-700 border-rose-300 hover:bg-rose-100/70"
              >
                Upload Correct Receipt
              </Button>
            </div>
          )}

          {fileUrl && isAmountMatching && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Receipt Amount Verified</span>
              </div>
              <span className="font-mono font-extrabold text-emerald-800">
                ₱{expectedAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {fileUrl && detectedAmount === null && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <AlertTriangle className="size-3.5 text-amber-600" />
                <span>Confirm Amount Paid on Receipt</span>
                <span className="text-rose-500 font-bold">*</span>
              </div>
              <p className="text-[11px] text-amber-800">
                The payment amount could not be read automatically. Enter the cashier total printed on your physical receipt to verify against the check:
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₱</span>
                <Input
                  id="manual_amount"
                  type="number"
                  step="0.01"
                  placeholder={`Expected: ${expectedAmount.toFixed(2)}`}
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  required
                  className="h-9 pl-7 font-mono font-bold text-xs bg-white border-amber-300 focus:border-[#0a4f42] text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Official Receipt Number (The ONLY editable field) */}
          {fileUrl && (
            <div className="space-y-1.5 p-3.5 bg-slate-50/80 border border-line rounded-xl">
              <div className="flex items-center justify-between">
                <Label htmlFor="or_number" className="text-xs font-bold text-navy flex items-center gap-1.5">
                  <Hash className="size-3.5 text-[#0a4f42]" />
                  <span>Official Receipt (OR) Number</span>
                  <span className="text-rose-500 font-bold">*</span>
                </Label>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-md">
                  Editable Field
                </span>
              </div>
              <Input
                id="or_number"
                type="text"
                value={orNumber}
                onChange={(e) => setOrNumber(e.target.value)}
                placeholder="e.g. 46127-004084B"
                required
                className="h-9 font-mono font-bold text-navy bg-white border-slate-300 focus:border-[#0a4f42] focus:ring-1 focus:ring-[#0a4f42]/30 text-xs tracking-wide"
              />
              <p className="text-[11px] text-muted-foreground">
                Verify this against your official receipt or university portal. You can edit this code to match your
                student portal record (e.g. 46127-004084B).
              </p>
            </div>
          )}

          {/* Extracted Receipt Summary Card (Strictly Read-Only Details) */}
          {extractedData && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-600" />
                  <span>Detected Receipt Metadata</span>
                </span>
                <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300 text-[10px]">
                  Read-Only Details
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {extractedData.payment_date && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="size-3 text-slate-400" />
                    <span>
                      Date: <strong className="text-slate-900">{extractedData.payment_date}</strong>
                    </span>
                  </div>
                )}
                {extractedData.student_id && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <User className="size-3 text-slate-400" />
                    <span>
                      Student ID: <strong className="text-slate-900">{extractedData.student_id}</strong>
                    </span>
                  </div>
                )}
                {extractedData.amount_paid != null && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span
                      className={`font-semibold ${
                        isAmountMismatch ? "text-rose-700" : "text-emerald-800"
                      }`}
                    >
                      Amount: ₱{Number(extractedData.amount_paid).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {extractedData.school_name && (
                  <div className="col-span-2 flex items-center gap-1.5 text-slate-700 truncate">
                    <Building2 className="size-3 text-slate-400" />
                    <span className="truncate">
                      School: <strong className="text-slate-900">{extractedData.school_name}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submission Notice */}
          <div className="flex items-start gap-2 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-[11px] text-teal-950">
            <AlertCircle className="size-4 text-[#0a4f42] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              The Coordinator will audit this Official Receipt photo against the released check amount to complete
              settlement. Please ensure the cashier stamp and receipt numbers are clearly readable.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-9 rounded-xl border-line text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                !fileUrl ||
                !orNumber.trim() ||
                isAmountMismatch ||
                (detectedAmount === null && !manualAmount)
              }
              className={`h-9 rounded-xl text-xs font-bold px-5 gap-1.5 transition-colors ${
                isAmountMismatch
                  ? "bg-rose-600 hover:bg-rose-700 text-white cursor-not-allowed opacity-90"
                  : "bg-[#0a4f42] hover:bg-[#083c32] text-white"
              }`}
            >
              {submitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isAmountMismatch ? (
                <XCircle className="size-3.5" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              <span>
                {isAmountMismatch ? "Submission Blocked (Wrong Amount)" : "Confirm & Submit Receipt"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
