import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function SaveScenarioDialog({ open, saving, error, onOpenChange, onSave }) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      setNameError('Senaryo adı zorunludur.')
      return
    }

    setNameError('')
    onSave(trimmedName)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving) onOpenChange(nextOpen)
      }}
    >
      <DialogContent>
        <form className="contents" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Senaryoyu kaydet</DialogTitle>
            <DialogDescription>
              Mevcut ürün ağacı ve maliyetleri değiştirilmeyen bir kopya olarak
              saklanır.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={nameError || error ? true : undefined}>
              <FieldLabel htmlFor="scenario-name">Senaryo adı</FieldLabel>
              <Input
                id="scenario-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                disabled={saving}
                autoFocus
                aria-invalid={Boolean(nameError || error)}
              />
              <FieldError>{nameError || error}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <LoaderCircle className="loading-icon" data-icon="inline-start" />
              ) : null}
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
