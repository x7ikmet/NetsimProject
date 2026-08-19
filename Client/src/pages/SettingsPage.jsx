import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const shortcuts = [
  {
    key: 'F3',
    label: 'PDF Kaydet',
    description: 'Hazırlanan ürün ağacını PDF olarak indirir.',
  },
]

export function SettingsPage() {
  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <header className="settings-page-header">
        <h1 id="settings-title">Ayarlar</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Klavye Kısayolları</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="shortcut-list">
            {shortcuts.map((shortcut) => (
              <li className="shortcut-item" key={shortcut.key}>
                <span className="shortcut-description">
                  <strong>{shortcut.label}</strong>
                  <span>{shortcut.description}</span>
                </span>
                <kbd className="shortcut-key">{shortcut.key}</kbd>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
