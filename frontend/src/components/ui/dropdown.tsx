import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DropdownProps {
  placeholder: string
  options: string[]
}

export function Dropdown({ placeholder, options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  const selectOption = (option: string) => {
    setSelectedOption(option)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={toggleDropdown} className="w-full text-left">
        {selectedOption || placeholder}
      </Button>
      {isOpen && (
        <ul className="absolute w-full mt-1 bg-white border rounded-md shadow-lg">
          {options.map((option, index) => (
            <li
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              onClick={() => selectOption(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}