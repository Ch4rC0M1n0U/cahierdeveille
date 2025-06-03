import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface SelectOrInputProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function SelectOrInput({ options, value, onChange, placeholder }: SelectOrInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleOptionClick = (option: string) => {
    setInputValue(option)
    onChange(option)
    setIsOpen(false)
  }

  const filteredOptions = options.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full"
        />
        <Button type="button" variant="outline" size="icon" className="ml-[-1px]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
