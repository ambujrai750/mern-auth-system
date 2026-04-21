import { useRef } from 'react'

const OtpInput = ({ value, onChange, length = 6 }) => {
    const inputs = useRef([])

    const handleChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '') // digits only
        if (!val) return

        const digits = value.split('')
        digits[index] = val.slice(-1) // take last digit if pasted multiple
        const newOtp = digits.join('')
        onChange(newOtp.slice(0, length).padEnd(length, ''))

        // Auto-advance
        if (val && index < length - 1) {
            inputs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            const digits = value.split('')
            if (digits[index]) {
                digits[index] = ''
                onChange(digits.join(''))
            } else if (index > 0) {
                inputs.current[index - 1]?.focus()
            }
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
        onChange(pasted.padEnd(length, ''))
        inputs.current[Math.min(pasted.length, length - 1)]?.focus()
    }

    return (
        <div className="otp-container">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ''}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    autoFocus={i === 0}
                />
            ))}
        </div>
    )
}

export default OtpInput
