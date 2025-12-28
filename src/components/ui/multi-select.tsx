import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

export type Option = {
  value: string;
  label: string;
  description?: string;
  name?: string;
};

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  renderOption?: (option: Option) => React.ReactNode;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select items...",
  renderOption,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (item: string) => {
    onValueChange(value.filter((i) => i !== item));
  };

  const handleSelect = (currentValue: string) => {
    const newValue = value.includes(currentValue)
      ? value.filter((item) => item !== currentValue)
      : [...value, currentValue];
    onValueChange(newValue);
    setInputValue("");
    // Keep focus on input after selection
    setTimeout(() => {
        inputRef.current?.focus();
    }, 0);
  };

  // Focus input when clicking anywhere on the container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <Command className="overflow-visible bg-transparent">
      <div 
        onClick={handleContainerClick}
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-white cursor-text"
      >
        <div className="flex gap-1 flex-wrap">
          {value.map((itemValue) => {
            const option = options.find((o) => o.value === itemValue);
            return (
              <Badge key={itemValue} variant="secondary">
                {option?.name || option?.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUnselect(itemValue);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(itemValue)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute w-full z-50 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-white">
            <CommandList>
               {options.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">No options found.</div>
               )}
              <CommandGroup className="h-full overflow-auto max-h-60">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) => {
                      // Critical fix: prevent input blur but allow click propagation
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {renderOption ? renderOption(option) : <span>{option.label}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </div>
    </Command>
  );
}