import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  name: string
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    const groupName = React.useMemo(
      () => name || `radio-group-${Math.random().toString(36).substr(2, 9)}`,
      [name]
    )

    const contextValue = React.useMemo<RadioGroupContextValue>(
      () => ({
        name: groupName,
        value,
        onValueChange,
      }),
      [groupName, value, onValueChange]
    )

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          className={cn("grid gap-2", className)}
          ref={ref}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)

  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (context.onValueChange) {
      context.onValueChange(e.target.value)
    }
    if (props.onChange) {
      props.onChange(e)
    }
  }

  return (
    <input
      type="radio"
      name={context.name}
      value={value}
      checked={context.value === value}
      onChange={handleChange}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

