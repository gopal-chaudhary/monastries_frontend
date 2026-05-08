import { useEffect, useRef, useState } from 'react'

export function ScrollReveal({ children, className = '', delay = 0, once = true }) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true)
        else if (!once) setRevealed(false)
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  const delayClass = delay > 0 ? `scroll-reveal-delay-${Math.min(4, Math.ceil(delay / 0.1))}` : ''
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${delayClass} ${revealed ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
