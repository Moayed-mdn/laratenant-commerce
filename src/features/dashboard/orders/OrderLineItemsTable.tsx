import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OrderLineItemView } from '@/types/order'

interface Props {
  lineItems: OrderLineItemView[]
}

export default async function OrderLineItemsTable({ lineItems }: Props) {
  const t = await getTranslations('orders')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('detail.lineItems')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('lineItems.product')}</TableHead>
              <TableHead>{t('lineItems.sku')}</TableHead>
              <TableHead className="text-center">{t('lineItems.quantity')}</TableHead>
              <TableHead className="text-right">{t('lineItems.price')}</TableHead>
              <TableHead className="text-right">{t('lineItems.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.sku ?? '—'}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{item.price}</TableCell>
                <TableCell className="text-right">{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
