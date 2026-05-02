import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ROUTES } from '@/config/routes'
import type { OrderDetailView } from '@/types/order'

interface Props {
  order: OrderDetailView
  storeId: string
}

export default async function OrderDetailCard({ order, storeId }: Props) {
  const t = await getTranslations('orders')

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={ROUTES.store(storeId).orders().list()}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← {t('detail.back')}
      </Link>

      {/* Order header */}
      <div>
        <h1 className="text-2xl font-bold">
          {t('detail.title')} {order.orderNumber}
        </h1>
        <p className="text-sm text-muted-foreground">{order.createdAt}</p>
      </div>

      {/* Customer info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('detail.customer')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-sm text-muted-foreground">{order.customer.email}</p>
          {order.customer.phone && (
            <p className="text-sm text-muted-foreground">
              {t('detail.phone')}: {order.customer.phone}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('detail.notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Order summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('detail.summary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('detail.subtotal')}</span>
            <span>{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('detail.tax')}</span>
            <span>{order.tax}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('detail.shipping')}</span>
            <span>{order.shipping}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>{t('detail.total')}</span>
            <span>{order.total}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
