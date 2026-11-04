"use client";

import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EnrollmentAuditSkeleton } from "@/components/coordinator/enrollment/EnrollmentAuditSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  authorizeGrantorDisbursement,
  getCoordinatorEnrollmentDetails,
  type TermEnrollment,
} from "@/lib/api/enrollment";

interface GrantorEnrollmentDrawerProps {
  enrollmentId: number | null;
  open: boolean;
  onClose: () => void;
  onReviewed: () => void;
}

export function GrantorEnrollmentDrawer({ enrollmentId, open, onClose, onReviewed }: GrantorEnrollmentDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [enrollment, setEnrollment] = useState<TermEnrollment | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<"COR" | "SOA">("COR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!enrollmentId || !open) return;
    const currentId = enrollmentId;
    async function loadData() {
      try {
        setLoading(true);
        const data = await getCoordinatorEnrollmentDetails(currentId);
        setEnrollment(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load enrollment details.";
        toast.error(msg);
        onClose();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [enrollmentId, open, onClose]);

  if (!open || !enrollmentId) return null;

  const handleAuthorizeDisbursement = async () => {
    try {
      setIsSubmitting(true);
      const res = await authorizeGrantorDisbursement(enrollmentId, {
        remarks: "Approved and authorized by Grantor.",
      });
      toast.success(res.message || "Disbursement authorized successfully.");
      onReviewed();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to authorize disbursement.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val || 0);
  };

  const activeDoc = activeDocTab === "COR" ? enrollment?.cor_document : enrollment?.soa_document;
  const rawDocUrl =
    activeDoc?.file_url ||
    (enrollment?.is_consolidated
      ? activeDocTab === "COR"
        ? enrollment?.soa_document?.file_url
        : enrollment?.cor_document?.file_url
      : undefined);

  const isValidDocUrl = Boolean(
    rawDocUrl &&
      (rawDocUrl.startsWith("http://") ||
        rawDocUrl.startsWith("https://") ||
        rawDocUrl.startsWith("blob:") ||
        rawDocUrl.startsWith("data:"))
  );
  const activeDocUrl = isValidDocUrl ? rawDocUrl : null;
  const isEndorsed = enrollment?.status === "APPROVED";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-6xl bg-slate-50 h-full flex flex-col shadow-2xl overflow-hidden border-l border-slate-200">
        {/* Drawer Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">Grantor Tuition & Enrollment Approval</h2>
              {isEndorsed && (
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs font-semibold">
                  Coordinator Endorsed
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {enrollment?.scholar_profile?.first_name} {enrollment?.scholar_profile?.last_name} •{" "}
              {enrollment?.scholar_profile?.school_name} ({enrollment?.academic_year} • {enrollment?.semester})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {loading || !enrollment ? (
          <EnrollmentAuditSkeleton />
        ) : (
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Document Viewer */}
            <div className="lg:col-span-6 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
              <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveDocTab("COR")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeDocTab === "COR" ? "bg-[#0a4f42] text-white" : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    Proof of Subjects (COR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDocTab("SOA")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeDocTab === "SOA" ? "bg-[#0a4f42] text-white" : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    Proof of Billing (SOA)
                  </button>
                </div>

                {activeDocUrl && (
                  <a
                    href={activeDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                  >
                    <span>Open External</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>

              <div className="flex-1 p-2 bg-slate-950 flex items-center justify-center overflow-auto relative">
                {activeDocUrl ? (
                  activeDocUrl.toLowerCase().includes(".pdf") ? (
                    <iframe
                      src={`${activeDocUrl}#toolbar=0`}
                      className="w-full h-full rounded-md border-0"
                      title="Document preview"
                    />
                  ) : (
                    <Image
                      src={activeDocUrl}
                      alt="Uploaded proof"
                      fill
                      unoptimized
                      className="object-contain rounded-md"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <AlertTriangle className="size-8 text-amber-400/80" />
                    <p className="text-sm font-semibold text-slate-300">
                      {rawDocUrl ? "Document preview unavailable" : "No document attached"}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      {rawDocUrl
                        ? "The document link is invalid or could not be found on storage."
                        : "The scholar has not submitted a document for this section yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Audit Panel */}
            <div className="lg:col-span-6 flex flex-col h-full overflow-hidden p-5 space-y-4 bg-white">
              {/* Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                <div className="bg-teal-50/70 border border-teal-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">Total Units</span>
                  <span className="text-base font-black text-[#0a4f42]">
                    {Number(enrollment.total_units).toFixed(1)}
                  </span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Endorsed Balance</span>
                  <span className="text-base font-black text-emerald-900">
                    {formatCurrency(Number(enrollment.total_assessment))}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Subjects</span>
                  <span className="text-base font-black text-slate-800">
                    {enrollment.enrolled_subjects?.length || 0}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Disbursement</span>
                  <span className="text-xs font-black text-slate-800 block mt-1">
                    {enrollment.disbursement?.status === "SETTLED"
                      ? "SETTLED"
                      : enrollment.disbursement?.status === "OR_SUBMITTED"
                        ? "OR AUDIT"
                        : enrollment.disbursement?.status === "CHECK_ISSUED"
                          ? "CHECK ISSUED"
                          : enrollment.disbursement?.status === "AUTHORIZED" ||
                              enrollment.disbursement?.status === "RELEASED"
                            ? "AUTHORIZED"
                            : isEndorsed
                              ? "READY FOR AUTH"
                              : "PENDING AUDIT"}
                  </span>
                </div>
              </div>

              {/* Coordinator Endorsement Banner */}
              {enrollment.coordinator_notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 shrink-0">
                  <span className="font-bold text-navy">Coordinator Endorsement Remarks:</span>
                  <p className="text-slate-600">{enrollment.coordinator_notes}</p>
                </div>
              )}

              {/* Subjects Section */}
              <div className="flex-1 min-h-0 flex flex-col">
                <h4 className="text-xs font-bold text-slate-900 mb-2 shrink-0">Enrolled Courses & Academic Load</h4>
                <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase z-10">
                      <tr>
                        <th className="p-2.5">Code</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5 text-center">Units</th>
                        <th className="p-2.5">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(enrollment.enrolled_subjects || []).map((sub, i) => {
                        const rowKey = sub.curriculum_subject_id
                          ? `grantor-sub-${sub.curriculum_subject_id}`
                          : `grantor-code-${sub.subject_code}-${i}`;
                        return (
                          <tr key={rowKey} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-900">{sub.subject_code}</td>
                            <td className="p-2.5 text-slate-700 font-medium">{sub.descriptive_title}</td>
                            <td className="p-2.5 text-center font-bold text-slate-800">
                              {Number(sub.units).toFixed(1)}
                            </td>
                            <td className="p-2.5">
                              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                                Verified
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 mt-auto flex items-center justify-between gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-9.5 rounded-xl border-line text-xs font-semibold text-slate-600"
                >
                  Close
                </Button>

                {enrollment?.disbursement?.status === "SETTLED" ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Tuition Settled & Verified ({formatCurrency(Number(enrollment.disbursement.amount))})</span>
                  </div>
                ) : enrollment?.disbursement?.status === "OR_SUBMITTED" ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0a4f42] bg-[#0a4f42]/10 px-3 py-1.5 rounded-lg border border-[#0a4f42]/20">
                    <Clock className="size-4 text-[#0a4f42]" />
                    <span>Official Receipt Submitted (Awaiting Coordinator Verification)</span>
                  </div>
                ) : enrollment?.disbursement?.status === "CHECK_ISSUED" ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <Clock className="size-4 text-amber-600" />
                    <span>
                      Check #{enrollment.disbursement.check_number || "—"} Issued (Awaiting Cashier Remittance)
                    </span>
                  </div>
                ) : enrollment?.disbursement?.status === "AUTHORIZED" ||
                  enrollment?.disbursement?.status === "RELEASED" ||
                  enrollment?.disbursement?.status === "CLAIMED" ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                    <CheckCircle2 className="size-4 text-teal-600" />
                    <span>Disbursement Authorized ({formatCurrency(Number(enrollment.disbursement.amount))})</span>
                  </div>
                ) : isEndorsed ? (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleAuthorizeDisbursement}
                    className="h-9.5 rounded-xl bg-[#0a4f42] hover:bg-[#083c32] text-white text-xs font-bold px-5 gap-2 shadow-xs"
                  >
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    <span>Authorize Tuition Disbursement</span>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Awaiting Coordinator Endorsement</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
