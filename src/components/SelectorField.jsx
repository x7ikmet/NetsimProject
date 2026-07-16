export function SelectorField({ label, value, placeholder, onOpen, disabled }) {
  return (
    <label className="selector-field">
      <span>{label}</span>
      <div className="selector-control">
        <input className="field-input" value={value} placeholder={placeholder} readOnly />
        <button
          className="ellipsis-button"
          type="button"
          onClick={onOpen}
          disabled={disabled}
          title={`${label} seç`}
        >
          ...
        </button>
      </div>
    </label>
  )
}
