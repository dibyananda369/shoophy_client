import { useEffect, useRef, useState } from 'react'
import {
  X,
  Lock,
  Smartphone,
  CreditCard,
  Landmark,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'

/**
 * Shoophy's built-in payment screen, used when no live payment gateway keys are configured.
 * Card / UPI / bank details stay inside this component: they are validated here and never
 * sent to the server or stored. Only the chosen channel (UPI, CARD or NETBANKING) is passed on.
 */

const TABS = [
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'CARD', label: 'Card', icon: CreditCard },
  { id: 'NETBANKING', label: 'Net Banking', icon: Landmark },
]

const BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Other bank',
]

const PROCESSING_MS = 1800 // minimum time on the "processing" screen
const SUCCESS_MS = 1200 // time on the "payment successful" screen before moving on

const formatINR = (n) => {
  const value = Number(n || 0)
  const decimals = Number.isInteger(value) ? 0 : 2
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

const luhnValid = (digits) => {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

const validate = (tab, f) => {
  const errors = {}
  if (tab === 'UPI' && !/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(f.upiId.trim())) {
    errors.upiId = 'Enter a valid UPI ID, e.g. name@okbank'
  }
  if (tab === 'CARD') {
    const digits = f.cardNumber.replace(/\D/g, '')
    if (digits.length < 13 || digits.length > 19 || !luhnValid(digits)) {
      errors.cardNumber = 'Enter a valid card number'
    }
    if (f.cardName.trim().length < 2) errors.cardName = 'Enter the name on the card'
    const match = f.expiry.match(/^(\d{2})\/(\d{2})$/)
    const month = match ? Number(match[1]) : 0
    const year = match ? 2000 + Number(match[2]) : 0
    const now = new Date()
    const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
    if (!match || month < 1 || month > 12 || expired) errors.expiry = 'Enter a valid expiry date (MM/YY)'
    if (!/^\d{3,4}$/.test(f.cvv)) errors.cvv = 'Enter the 3 or 4 digit CVV'
  }
  if (tab === 'NETBANKING' && !f.bank) errors.bank = 'Choose your bank'
  return errors
}

const inputClass = (hasError) =>
  `w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    hasError ? 'border-red-400' : 'border-slate-200'
  }`

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="text-xs text-red-600 mt-1">
      {message}
    </p>
  )
}

export default function PaymentModal({ amount, onPay, onClose, onSuccess }) {
  const [tab, setTab] = useState('UPI')
  const [form, setForm] = useState({ upiId: '', cardNumber: '', cardName: '', expiry: '', cvv: '', bank: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('form') // form | processing | success
  const [payError, setPayError] = useState('')
  const firstFieldRef = useRef(null)

  const busy = status !== 'form'

  // Focus the first field of the selected tab
  useEffect(() => {
    if (status === 'form') firstFieldRef.current?.focus()
  }, [tab, status])

  // Stop the page behind the dialog from scrolling
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  // Escape closes the dialog (not while a payment is in progress)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleCardNumber = (value) =>
    update(
      'cardNumber',
      value
        .replace(/\D/g, '')
        .slice(0, 19)
        .replace(/(.{4})/g, '$1 ')
        .trim()
    )

  const handleExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    update('expiry', digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits)
  }

  const switchTab = (id) => {
    setTab(id)
    setErrors({})
    setPayError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(tab, form)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    setPayError('')
    setStatus('processing')
    try {
      const [order] = await Promise.all([
        onPay(tab),
        new Promise((resolve) => setTimeout(resolve, PROCESSING_MS)),
      ])
      setStatus('success')
      setTimeout(() => onSuccess(order), SUCCESS_MS)
    } catch (err) {
      setStatus('form')
      setPayError(err.response?.data?.message || err.message || 'Payment failed. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
        className="w-full sm:max-w-md max-h-[100dvh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6 pt-5 pb-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <h2 id="payment-title" className="font-bold text-base">
                Shoophy Secure Pay
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                Test mode
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close payment"
              className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-blue-100 mt-4">Amount to pay</p>
          <p className="text-3xl font-extrabold tracking-tight">{formatINR(amount)}</p>
        </div>

        {status === 'processing' && (
          <div className="px-6 py-14 text-center" role="status" aria-live="polite">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" aria-hidden="true" />
            <p className="font-bold text-slate-900 mt-4">Processing your payment…</p>
            <p className="text-xs text-slate-500 mt-1">Please don&apos;t close this window or press back.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="px-6 py-14 text-center" role="status" aria-live="polite">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" aria-hidden="true" />
            <p className="font-extrabold text-lg text-slate-900 mt-4">Payment successful</p>
            <p className="text-sm text-slate-600 mt-1">{formatINR(amount)} paid</p>
            <p className="text-xs text-slate-400 mt-3">Taking you to your order…</p>
          </div>
        )}

        {status === 'form' && (
          <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">
            {/* Method tabs */}
            <div role="tablist" aria-label="Payment options" className="grid grid-cols-3 gap-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => switchTab(id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-xs font-semibold transition ${
                    tab === id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            {tab === 'UPI' && (
              <div>
                <label htmlFor="pay-upi" className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI ID
                </label>
                <input
                  id="pay-upi"
                  ref={firstFieldRef}
                  type="text"
                  autoComplete="off"
                  placeholder="yourname@okbank"
                  value={form.upiId}
                  onChange={(e) => update('upiId', e.target.value)}
                  aria-invalid={!!errors.upiId}
                  aria-describedby={errors.upiId ? 'pay-upi-error' : 'pay-upi-hint'}
                  className={inputClass(errors.upiId)}
                />
                <FieldError id="pay-upi-error" message={errors.upiId} />
                {!errors.upiId && (
                  <p id="pay-upi-hint" className="text-xs text-slate-400 mt-1">
                    Test mode: any valid UPI ID works, e.g. test@upi
                  </p>
                )}
              </div>
            )}

            {tab === 'CARD' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="pay-card-number" className="block text-xs font-semibold text-slate-700 mb-1">
                    Card number
                  </label>
                  <input
                    id="pay-card-number"
                    ref={firstFieldRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={(e) => handleCardNumber(e.target.value)}
                    aria-invalid={!!errors.cardNumber}
                    aria-describedby={errors.cardNumber ? 'pay-card-number-error' : 'pay-card-hint'}
                    className={`${inputClass(errors.cardNumber)} font-mono tracking-wider`}
                  />
                  <FieldError id="pay-card-number-error" message={errors.cardNumber} />
                </div>
                <div>
                  <label htmlFor="pay-card-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Name on card
                  </label>
                  <input
                    id="pay-card-name"
                    type="text"
                    autoComplete="off"
                    placeholder="As printed on the card"
                    value={form.cardName}
                    onChange={(e) => update('cardName', e.target.value)}
                    aria-invalid={!!errors.cardName}
                    aria-describedby={errors.cardName ? 'pay-card-name-error' : undefined}
                    className={inputClass(errors.cardName)}
                  />
                  <FieldError id="pay-card-name-error" message={errors.cardName} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pay-card-expiry" className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      id="pay-card-expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="MM/YY"
                      value={form.expiry}
                      onChange={(e) => handleExpiry(e.target.value)}
                      aria-invalid={!!errors.expiry}
                      aria-describedby={errors.expiry ? 'pay-card-expiry-error' : undefined}
                      className={`${inputClass(errors.expiry)} font-mono`}
                    />
                    <FieldError id="pay-card-expiry-error" message={errors.expiry} />
                  </div>
                  <div>
                    <label htmlFor="pay-card-cvv" className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV
                    </label>
                    <input
                      id="pay-card-cvv"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="•••"
                      maxLength={4}
                      value={form.cvv}
                      onChange={(e) => update('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      aria-invalid={!!errors.cvv}
                      aria-describedby={errors.cvv ? 'pay-card-cvv-error' : undefined}
                      className={`${inputClass(errors.cvv)} font-mono`}
                    />
                    <FieldError id="pay-card-cvv-error" message={errors.cvv} />
                  </div>
                </div>
                <p id="pay-card-hint" className="text-xs text-slate-400">
                  Test card: 4111 1111 1111 1111 · any future expiry · any 3-digit CVV
                </p>
              </div>
            )}

            {tab === 'NETBANKING' && (
              <div>
                <label htmlFor="pay-bank" className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose your bank
                </label>
                <select
                  id="pay-bank"
                  ref={firstFieldRef}
                  value={form.bank}
                  onChange={(e) => update('bank', e.target.value)}
                  aria-invalid={!!errors.bank}
                  aria-describedby={errors.bank ? 'pay-bank-error' : undefined}
                  className={inputClass(errors.bank)}
                >
                  <option value="">Select a bank</option>
                  {BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                <FieldError id="pay-bank-error" message={errors.bank} />
              </div>
            )}

            {payError && (
              <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{payError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Pay {formatINR(amount)}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Your card, UPI and bank details are never stored.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
