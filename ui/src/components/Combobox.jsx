import { useState, useEffect } from 'react'
import { ChevronsUpDown, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export default function Combobox({ value, onValueChange, fetchOptions, placeholder, className }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(async () => {
      try {
        const results = await fetchOptions(query)
        setOptions(results)
      } catch {
        setOptions([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query, open])

  const select = (option) => {
    onValueChange(option === value ? '' : option)
    setOpen(false)
  }

  const clear = (e) => {
    e.stopPropagation()
    onValueChange('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`justify-between font-normal ${className || ''}`}
        >
          <span className={value ? '' : 'text-muted-foreground'}>
            {value || placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2">
            {value && (
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" onClick={clear} />
            )}
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput
            placeholder="Search…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt} value={opt} onSelect={() => select(opt)}>
                  <Check className={`mr-2 h-4 w-4 ${value === opt ? 'opacity-100' : 'opacity-0'}`} />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
