import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function InputGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none has-disabled:bg-input/50 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 dark:bg-input/30 dark:has-disabled:bg-input/80',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent dark:bg-transparent dark:disabled:bg-transparent',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupAddon({ className, align = 'inline-end', ...props }) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        'order-last flex h-auto cursor-text items-center justify-center py-1.5 pr-2 text-sm font-medium text-muted-foreground select-none has-[>button]:mr-[-0.3rem]',
        className,
      )}
      onClick={(event) => {
        if (event.target.closest('button')) return
        event.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  ...props
}) {
  return (
    <Button
      type={type}
      variant={variant}
      size="icon-xs"
      className={cn('shadow-none', className)}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
}
