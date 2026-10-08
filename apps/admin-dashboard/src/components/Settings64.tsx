"use client";

import React from "react";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  FileText,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Vite-compatible Link anchor
const Link = ({
  href,
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
    {...props}
  >
    {children}
  </a>
);

export interface Invoice {
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  description: string;
  invoiceNumber: string;
  downloadUrl?: string;
}

export interface Settings64Props {
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "outline";
  };
  heading?: string;
  description?: string;
  invoices?: Invoice[];
  labels?: {
    date?: string;
    description?: string;
    amount?: string;
    status?: string;
    paid?: string;
    pending?: string;
    failed?: string;
    download?: string;
    noInvoices?: string;
    viewAll?: string;
  };
  viewAllUrl?: string;
  className?: string;
}

export const settings64Demo: Settings64Props = {
  badge: { label: "Billing", variant: "secondary" },
  heading: "Billing History",
  description: "View and download your past invoices and payment history.",
  invoices: [
    {
      date: "Jan 1, 2024",
      amount: "$29.00",
      status: "paid",
      description: "Pro Plan - Monthly",
      invoiceNumber: "INV-2024-001",
      downloadUrl: "https://beste.co",
    },
    {
      date: "Dec 1, 2023",
      amount: "$29.00",
      status: "paid",
      description: "Pro Plan - Monthly",
      invoiceNumber: "INV-2023-012",
      downloadUrl: "https://beste.co",
    },
    {
      date: "Nov 1, 2023",
      amount: "$29.00",
      status: "paid",
      description: "Pro Plan - Monthly",
      invoiceNumber: "INV-2023-011",
      downloadUrl: "https://beste.co",
    },
    {
      date: "Oct 1, 2023",
      amount: "$29.00",
      status: "failed",
      description: "Pro Plan - Monthly",
      invoiceNumber: "INV-2023-010",
      downloadUrl: "https://beste.co",
    },
    {
      date: "Sep 1, 2023",
      amount: "$29.00",
      status: "paid",
      description: "Pro Plan - Monthly",
      invoiceNumber: "INV-2023-009",
      downloadUrl: "https://beste.co",
    },
  ],
  labels: {
    date: "Date",
    description: "Description",
    amount: "Amount",
    status: "Status",
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    download: "Download",
    noInvoices: "No invoices yet",
    viewAll: "View All Invoices",
  },
  viewAllUrl: "https://beste.co",
};

export function Settings64({
  badge = settings64Demo.badge,
  heading = settings64Demo.heading,
  description = settings64Demo.description,
  invoices = settings64Demo.invoices || [],
  labels = settings64Demo.labels,
  viewAllUrl = settings64Demo.viewAllUrl,
  className,
}: Settings64Props) {
  const safeInvoices = invoices ?? [];
  const {
    date: dateLabel = "Date",
    description: descLabel = "Description",
    amount: amountLabel = "Amount",
    status: statusLabel = "Status",
    paid: paidLabel = "Paid",
    pending: pendingLabel = "Pending",
    failed: failedLabel = "Failed",
    download: downloadLabel = "Download",
    noInvoices: noInvoicesLabel = "No invoices yet",
    viewAll: viewAllLabel = "View All Invoices",
  } = labels || {};

  const getStatusBadge = (invoiceStatus: Invoice["status"]) => {
    switch (invoiceStatus) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-normal inline-flex items-center gap-1"
          >
            <CheckCircle className="size-3" />
            {paidLabel}
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/20 bg-amber-500/10 text-amber-400 font-normal inline-flex items-center gap-1"
          >
            <Clock className="size-3" />
            {pendingLabel}
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="border-rose-500/20 bg-rose-500/10 text-rose-400 font-normal inline-flex items-center gap-1"
          >
            <XCircle className="size-3" />
            {failedLabel}
          </Badge>
        );
    }
  };

  return (
    <section className={cn("py-8 md:py-12 w-full", className)}>
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {badge?.label && (
              <Badge variant={badge.variant} className="w-fit">
                <CreditCard className="mr-1 size-3" />
                {badge.label}
              </Badge>
            )}
            {heading && (
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-white">
                {heading}
              </h2>
            )}
            {description && (
              <p className="text-white/60 text-sm">{description}</p>
            )}
          </div>

          {safeInvoices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-[#0a0a0c] p-8 text-center">
              <FileText className="size-12 text-white/40" />
              <p className="text-white/60">{noInvoicesLabel}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-[#0a0a0c] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/[0.03]">
                    <TableHead className="px-4 text-white/50">{dateLabel}</TableHead>
                    <TableHead className="px-4 text-white/50">{descLabel}</TableHead>
                    <TableHead className="px-4 text-white/50">{amountLabel}</TableHead>
                    <TableHead className="px-4 text-center text-white/50">
                      {statusLabel}
                    </TableHead>
                    <TableHead className="px-4 w-12 text-right text-white/50">
                      {downloadLabel}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeInvoices.map((invoice, index) => (
                    <TableRow key={index} className="hover:bg-white/[0.02]">
                      <TableCell className="px-4">
                        <div className="font-medium text-white">{invoice.date}</div>
                        <div className="text-xs text-white/50">
                          {invoice.invoiceNumber}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-white/80">
                        {invoice.description}
                      </TableCell>
                      <TableCell className="px-4 font-medium text-white">
                        {invoice.amount}
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        {invoice.downloadUrl ? (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={invoice.downloadUrl}>
                              <Download className="size-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" disabled>
                            <Download className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {safeInvoices.length > 0 && viewAllUrl && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href={viewAllUrl}>{viewAllLabel}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Settings64;
