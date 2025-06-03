"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AutoCompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  options: string[]
  onAddNew: (value: string) => void
  onChange: (value: string) => void
}

export function AutoCompleteInput({ options, onAddNew, onChange, className, ...props }: AutoCompleteInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsOpen(true)
    setSelectedIndex(-1)

    if (value) {
      const filteredSuggestions = options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filteredSuggestions)
    } else {
      setSuggestions([])
    }

    onChange(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prevIndex) => (prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex])
      } else if (inputValue && !options.includes(inputValue)) {
        onAddNew(inputValue)
        setSuggestions([])
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    onChange(suggestion)
    closeSuggestions()
  }

  const closeSuggestions = () => {
    setIsOpen(false)
    setSuggestions([])
  }

  const handleFocus = () => {
    if (inputValue) {
      setIsOpen(true)
    }
  }

  const handleBlur = () => {
    setTimeout(closeSuggestions, 200)
  }

  React.useEffect(() => {
    if (selectedIndex >= 0) {
      const selectedElement = document.getElementById(`suggestion-${selectedIndex}`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", inline: "start" })
      }
    }
  }, [selectedIndex])

  return (
    <div className="relative">
      <Input
        {...props}
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn("w-full", className)}
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              id={`suggestion-${index}`}
              key={index}
              className={cn("px-4 py-2 hover:bg-gray-100 cursor-pointer", selectedIndex === index && "bg-gray-100")}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

