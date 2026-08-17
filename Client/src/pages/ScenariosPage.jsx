import { useEffect, useState } from 'react'
import { listScenarios } from '@/api/scenarioApi'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const numberFormatter = new Intl.NumberFormat('tr-TR', {
  maximumFractionDigits: 2,
})
const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function ScenariosPage() {
  const [scenarios, setScenarios] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    listScenarios()
      .then((result) => {
        if (active) setScenarios(result)
      })
      .catch(() => {
        if (active) setError('Senaryolar yüklenemedi. Lütfen tekrar deneyin.')
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="scenarios-page" aria-labelledby="scenarios-title">
      <header className="scenarios-page-header">
        <h1 id="scenarios-title">Kayıtlı Senaryolar</h1>
        <p>Kaydettiğiniz maliyet çalışmalarına buradan ulaşabilirsiniz.</p>
      </header>

      {error ? (
        <Card className="scenarios-placeholder">
          <CardHeader>
            <CardTitle>Senaryolar yüklenemedi</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!error && scenarios === null ? (
        <Card>
          <CardHeader>
            <CardTitle>Senaryolar yükleniyor</CardTitle>
            <CardDescription>Kayıtlarınız hazırlanıyor.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton className="h-10 w-full" key={index} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {!error && scenarios?.length === 0 ? (
        <Card className="scenarios-placeholder">
          <CardHeader>
            <CardTitle>Henüz kayıtlı senaryo yok</CardTitle>
            <CardDescription>
              Ürün ağacı ekranından ilk senaryonuzu kaydedebilirsiniz.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!error && scenarios?.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Senaryolar</CardTitle>
            <CardDescription>{scenarios.length} kayıt bulundu.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Senaryo</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Toplam</TableHead>
                  <TableHead>Son güncelleme</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.map((scenario) => (
                  <TableRow key={scenario.scenarioNo}>
                    <TableCell>{scenario.name}</TableCell>
                    <TableCell>
                      {scenario.stockCode} — {scenario.stockName}
                    </TableCell>
                    <TableCell>
                      {numberFormatter.format(scenario.quantity)} {scenario.unit}
                    </TableCell>
                    <TableCell>
                      {numberFormatter.format(scenario.totalCost)}{' '}
                      {scenario.currency ?? ''}
                    </TableCell>
                    <TableCell>
                      {dateFormatter.format(new Date(scenario.updatedAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}
