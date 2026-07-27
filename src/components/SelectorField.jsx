import { Field, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

export function SelectorField({
  className,
  id,
  label,
  value,
  placeholder,
  onOpen,
  disabled,
}) {
  return (
    <Field className={className} data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
        />
        <InputGroupAddon>
          <InputGroupButton
            onClick={onOpen}
            disabled={disabled}
            title={`${label} seç`}
            aria-label={`${label} seç`}
          >
            ...
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
