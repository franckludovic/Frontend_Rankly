import { useState, useEffect, useRef } from 'react'

/**
 * ScrollIndicator
 *
 * • Hides the native scrollbar (via popup.css)
 * • Shows a glassy fixed circle at the bottom-right:
 *     ↓  = more content below (click to scroll down 260px)
 *     ↑  = at the bottom (click to scroll back to top)
 * • Gradient fade at bottom edges signals scrollable content
 * • Disappears when all content fits in the viewport
 *
 * Key: We MUST NOT have height:100% on html/body or overflow:hidden
 * on any ancestor — both kill window scroll and make scrollY always 0.
 */
export default function ScrollIndicator() {
  const [atBottom, setAtBottom] = useState(false)
  const [visible,  setVisible]  = useState(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const check = () => {
      const docEl       = document.documentElement
      const scrollTop   = Math.max(docEl.scrollTop, document.body.scrollTop, window.scrollY || 0)
      const scrollH     = Math.max(docEl.scrollHeight, document.body.scrollHeight)
      const clientH     = docEl.clientHeight || window.innerHeight

      const canScroll   = scrollH > clientH + 6
      const nearBottom  = scrollTop + clientH >= scrollH - 28

      setVisible(canScroll)
      setAtBottom(canScroll && nearBottom)
    }

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(check)
    }

    // Initial checks — run several times as content phases in
    check()
    const t1 = setTimeout(check, 200)
    const t2 = setTimeout(check, 600)
    const t3 = setTimeout(check, 1200)  // after scan animation finishes

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', check,    { passive: true })

    // Watch for DOM changes (scan → results transition adds a lot of content)
    const obs = new MutationObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(check)
    })
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', check)
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      obs.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleClick = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollBy({ top: 260, behavior: 'smooth' })
    }
  }

  const showFade = visible && !atBottom

  return (
    <>
      {/* ── Bottom gradient fade ── */}
      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          bottom:        0,
          left:          0,
          right:         0,
          height:        '72px',
          background:    'linear-gradient(to top, var(--bg) 15%, transparent 100%)',
          pointerEvents: 'none',
          zIndex:        98,
          opacity:       showFade ? 1 : 0,
          transition:    'opacity .3s ease',
        }}
      />

      {/* ── Glassy scroll button ── */}
      <button
        onClick={handleClick}
        aria-label={atBottom ? 'Scroll to top' : 'Scroll down'}
        style={{
          position:             'fixed',
          bottom:               '16px',
          right:                '14px',
          width:                '34px',
          height:               '34px',
          borderRadius:         '50%',
          border:               '1px solid rgba(255,255,255,.18)',
          background:           'rgba(20,30,50,.55)',
          backdropFilter:       'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow:            '0 4px 18px rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.08) inset',
          display:              'flex',
          alignItems:           'center',
          justifyContent:       'center',
          cursor:               'pointer',
          zIndex:               99,
          color:                'rgba(255,255,255,.8)',
          opacity:              visible ? 1 : 0,
          pointerEvents:        visible ? 'auto' : 'none',
          transition:           'opacity .3s ease, background .15s',
          padding:              0,
          outline:              'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(45,212,191,.25)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,30,50,.55)' }}
      >
        {/* Single chevron — rotates to point up when at bottom */}
        <svg
          width="13" height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform .3s ease',
            transform:  atBottom ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </>
  )
}
