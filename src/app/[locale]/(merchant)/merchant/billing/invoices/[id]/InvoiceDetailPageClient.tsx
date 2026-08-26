/**
 * Invoice Detail Page Client Component
 * Displays invoice details and line items
 */

'use client';

import { useInvoice } from '@/hooks/billing/useInvoice';
import { InvoiceStatusBadge } from '@/components/billing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDate } from '@/lib/billing/billing-utils';

interface InvoiceDetailPageClientProps {
  invoiceId: string;
}

export function InvoiceDetailPageClient({ invoiceId }: InvoiceDetailPageClientProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('billing.invoices.detail');
  const { data: invoice, isLoading, error } = useInvoice(Number(invoiceId));

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t('loadingTitle')}</h1>
          <p className="text-muted-foreground">{t('loadingMessage')}</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t('notFoundTitle')}</h1>
          <p className="text-muted-foreground">{t('notFoundMessage')}</p>
        </div>
        <Link href={`/${locale}/merchant/billing/invoices`}>
          <Button variant="outline">
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('backToInvoices')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href={`/${locale}/merchant/billing/invoices`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="me-2 h-4 w-4" />
          {t('backToInvoices')}
        </Button>
      </Link>

      {/* Invoice Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('invoice')} {invoice.invoice_number || `#${invoice.id}`}
          </h1>
          <p className="text-muted-foreground">
            {t('issuedOn')}{' '}
            {invoice.issued_at ? formatDate(invoice.issued_at) : formatDate(invoice.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <InvoiceStatusBadge status={invoice.status} />
          {invoice.invoice_pdf_url && (
            <a href={invoice.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Download className="me-2 h-4 w-4" />
                {t('downloadPDF')}
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('invoiceInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('invoiceNumber')}</span>
              <span className="font-mono text-sm font-medium">
                {invoice.invoice_number || `INV-${invoice.id}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('invoiceDate')}</span>
              <span className="text-sm font-medium">
                {invoice.issued_at ? formatDate(invoice.issued_at) : formatDate(invoice.created_at)}
              </span>
            </div>
            {invoice.due_at && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('dueDate')}</span>
                <span className="text-sm font-medium">{formatDate(invoice.due_at)}</span>
              </div>
            )}
            {invoice.paid_at && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('paidDate')}</span>
                <span className="text-sm font-medium">{formatDate(invoice.paid_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('paymentSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('subtotal')}</span>
              <span className="text-sm font-medium">
                {formatCurrency(invoice.subtotal_cents, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('tax')}</span>
              <span className="text-sm font-medium">
                {formatCurrency(invoice.tax_cents, invoice.currency)}
              </span>
            </div>
            {invoice.discount_cents !== 0 && (
              <div className="flex justify-between text-success">
                <span className="text-sm">{t('discount')}</span>
                <span className="text-sm font-medium">
                  -{formatCurrency(Math.abs(invoice.discount_cents), invoice.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">{t('total')}</span>
              <span className="text-lg font-bold">
                {formatCurrency(invoice.total_cents, invoice.currency)}
              </span>
            </div>
            {invoice.amount_paid_cents > 0 && (
              <div className="flex justify-between text-success">
                <span className="text-sm">{t('paid')}</span>
                <span className="text-sm font-medium">
                  {formatCurrency(invoice.amount_paid_cents, invoice.currency)}
                </span>
              </div>
            )}
            {invoice.amount_due_cents > 0 && (
              <div className="flex justify-between text-danger">
                <span className="text-sm">{t('due')}</span>
                <span className="text-sm font-medium">
                  {formatCurrency(invoice.amount_due_cents, invoice.currency)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      {invoice.line_items && invoice.line_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('lineItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.line_items.map((item) => (
                <div key={item.id} className="flex justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('quantity')}: {item.quantity} ×{' '}
                      {formatCurrency(item.unit_amount_cents, item.currency)}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.total_cents, item.currency)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
