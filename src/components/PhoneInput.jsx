'use client'

import { useState, useEffect } from 'react'
import { Input } from 'antd'

// Simple phone input that keeps a masked value for display but returns the masked string
// It avoids using any refs that require findDOMNode. It accepts value and onChange like a controlled input.
export default function PhoneInput({ value = '', onChange, id, name, placeholder }) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (value == null) {
      setDisplay('')
      return
    }
    // If the incoming value is digits-only, format it
    const digits = String(value).replace(/\D/g, '')
    if (digits.length === 11) {
      setDisplay(`(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`)
    } else if (digits.length > 0) {
      // progressively format as user types
      const d = digits
      if (d.length <= 2) setDisplay(`(${d}`)
      else if (d.length <= 7) setDisplay(`(${d.slice(0,2)}) ${d.slice(2)}`)
      else setDisplay(`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`)
    } else {
      setDisplay('')
    }
  }, [value])

  function handleChange(e) {
    const raw = e.target.value
    // Extract digits and cap to 11
    const digits = raw.replace(/\D/g, '').slice(0, 11)
    // Build masked for display
    let masked = ''
    if (digits.length === 0) masked = ''
    else if (digits.length <= 2) masked = `(${digits}`
    else if (digits.length <= 7) masked = `(${digits.slice(0,2)}) ${digits.slice(2)}`
    else masked = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`

    setDisplay(masked)
    // Emit raw digits to parent
    if (onChange) onChange(digits)
  }

  return (
    <Input
      id={id}
      name={name}
      placeholder={placeholder || '(71) 98765-4321'}
      value={display}
      onChange={handleChange}
    />
  )
}
