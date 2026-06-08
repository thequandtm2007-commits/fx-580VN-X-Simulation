import { useState } from 'react'

const modes = ['Calculate', 'Equation', 'Complex', 'Matrix', 'Vector', 'Statistics', 'Table', 'Base-N', 'Spreadsheet']
const ref = 'https://www.casio.com/vn/scientific-calculators/product.FX-580VNX/'

function nice(value) {
  if (!Number.isFinite(value)) return 'Math error'
  if (Math.abs(value) < 1e-12) return '0'
  if (Math.abs(value) > 9999999999 || Math.abs(value) < 0.0000001) return value.toExponential(8)
  return Number.parseFloat(value.toFixed(12)).toString()
}

function fact(n) {
  n = Math.round(n)
  if (n < 0 || n > 170) return NaN
  let out = 1
  for (let i = 2; i <= n; i += 1) out *= i
  return out
}

function Calculator({ back }) {
  const [on, setOn] = useState(true)
  const [deg, setDeg] = useState(true)
  const [shift, setShift] = useState(false)
  const [alpha, setAlpha] = useState(false)
  const [display, setDisplay] = useState('0')
  const [memo, setMemo] = useState(null)
  const [op, setOp] = useState(null)
  const [ans, setAns] = useState(0)
  const [hist, setHist] = useState([])
  const [menu, setMenu] = useState(false)
  const [mode, setMode] = useState(0)
  const [note, setNote] = useState('Ready')

  const value = Number(display) || 0
  const angle = (x) => deg ? x * Math.PI / 180 : x
  const invAngle = (x) => deg ? x * 180 / Math.PI : x
  const write = (v) => setDisplay(String(v).length > 16 ? nice(Number(v)) : String(v))
  const pushHist = (expr, res) => setHist((items) => [{ expr, res }, ...items].slice(0, 8))

  function flash(text) {
    setNote(text)
    clearTimeout(window.flashTimer)
    window.flashTimer = setTimeout(() => setNote('Ready'), 1500)
  }

  function digit(d) {
    if (!on) return
    setDisplay((cur) => cur === '0' || cur === 'Math error' ? d : cur + d)
  }

  function unary(name) {
    if (!on) return
    const map = {
      sin: Math.sin(angle(value)), cos: Math.cos(angle(value)), tan: Math.tan(angle(value)),
      asin: invAngle(Math.asin(value)), acos: invAngle(Math.acos(value)), atan: invAngle(Math.atan(value)),
      log: Math.log10(value), ln: Math.log(value), sqrt: Math.sqrt(value), cbrt: Math.cbrt(value),
      sq: value ** 2, cube: value ** 3, inv: 1 / value, pct: value / 100, fact: fact(value), neg: -value,
    }
    const res = nice(map[name])
    pushHist(`${name}(${display})`, res)
    write(res)
    setAns(Number(res) || 0)
    setShift(false)
  }

  function binary(nextOp) {
    if (!on) return
    if (memo !== null && op) equals(nextOp)
    else setMemo(value)
    setOp(nextOp)
    setDisplay('0')
  }

  function equals(keepOp = null) {
    if (!on || memo === null || !op) return
    const b = value
    const calc = op === '+' ? memo + b : op === '−' ? memo - b : op === '×' ? memo * b : memo / b
    const res = nice(calc)
    pushHist(`${memo} ${op} ${b}`, res)
    write(res)
    setAns(Number(res) || 0)
    setMemo(keepOp ? Number(res) || 0 : null)
    setOp(keepOp)
  }

  function press(k) {
    if (k === 'ON') { setOn((x) => !x); setDisplay('0'); setMemo(null); setOp(null); return }
    if (!on) return
    if ('0123456789'.includes(k)) return digit(k)
    if (k === '.') return setDisplay((cur) => cur.includes('.') ? cur : cur + '.')
    if (['+', '−', '×', '÷'].includes(k)) return binary(k)
    if (k === 'EXE' || k === '=') return equals()
    if (k === 'AC') { setDisplay('0'); setMemo(null); setOp(null); return }
    if (k === 'DEL') return setDisplay((cur) => cur.length > 1 ? cur.slice(0, -1) : '0')
    if (k === 'SHIFT') return setShift((x) => !x)
    if (k === 'ALPHA') return setAlpha((x) => !x)
    if (k === 'MODE') { setDeg((x) => !x); return flash('Angle mode changed') }
    if (k === 'MENU') return setMenu(true)
    if (k === 'Ans') return write(ans)
    if (k === 'π') return write(Math.PI)
    if (k === 'e') return write(Math.E)
    if (k === 'sin') return unary(shift ? 'asin' : 'sin')
    if (k === 'cos') return unary(shift ? 'acos' : 'cos')
    if (k === 'tan') return unary(shift ? 'atan' : 'tan')
    if (k === 'log') return unary('log')
    if (k === 'ln') return unary('ln')
    if (k === '√') return unary('sqrt')
    if (k === '∛') return unary('cbrt')
    if (k === 'x²') return unary('sq')
    if (k === 'x³') return unary('cube')
    if (k === 'x⁻¹') return unary('inv')
    if (k === '%') return unary('pct')
    if (k === 'x!') return unary('fact')
    if (k === '(-)') return unary('neg')
    flash('Prototype key')
  }

  const rows = [
    ['SHIFT', 'ALPHA', 'MENU', 'MODE', 'ON'],
    ['OPTN', 'CALC', 'SOLVE', 'x⁻¹', 'log'],
    ['x²', 'x³', '√', '∛', 'x!'],
    ['sin', 'cos', 'tan', 'ln', 'π'],
    ['7', '8', '9', '÷', 'AC'],
    ['4', '5', '6', '×', 'DEL'],
    ['1', '2', '3', '−', '='],
    ['0', '.', 'Ans', '+', 'EXE'],
  ]

  return <main className='sim'><header className='glass top'><button onClick={back}>← Landing</button><strong>580VN-X Simulator</strong><a href={ref} target='_blank'>Reference ↗</a></header><section className='desk'><aside className='glass panel'><h2>Mode stack</h2>{modes.slice(0, 6).map((m, i) => <button key={m} onClick={() => setMode(i)} className={mode === i ? 'selected mode' : 'mode'}><b>{m}</b><small>{i === 0 ? 'Core calculator' : 'Prototype shell'}</small></button>)}</aside><div className='device'><div className='brand'><span>580VN-X</span><i>ClassWiz Inspired</i></div><div className='solar' /><div className='screen'><div className='status'>{on ? 'MathI/MathO' : 'OFF'} <span>{shift ? 'S' : ''}{alpha ? ' A' : ''} {deg ? 'DEG' : 'RAD'}</span></div><div className='lcd'>{on ? <><p>{memo !== null ? `${memo} ${op}` : modes[mode]}</p><h1>{display}</h1></> : <h1>OFF</h1>}</div><div className='screen-foot'><span>{note}</span><span>Ans {nice(ans)}</span></div></div><div className='nav'><button>◀</button><button onClick={() => setMenu(true)}>▲</button><button onClick={() => setMenu(true)}>▼</button><button>▶</button></div><div className='keys'>{rows.flat().map((k) => <button key={k} onClick={() => press(k)} className={`key ${k}`}>{shift && ['sin', 'cos', 'tan'].includes(k) && <small>a{k}</small>}<span>{k}</span></button>)}</div></div><aside className='glass panel'><h2>History</h2>{hist.length ? hist.map((h, i) => <button className='history' key={i} onClick={() => write(h.res)}><span>{h.expr}</span><b>{h.res}</b></button>) : <p>No calculations yet.</p>}<div className='quick'><button onClick={() => press('π')}>π</button><button onClick={() => press('e')}>e</button><button onClick={() => press('%')}>%</button><button onClick={() => press('x!')}>x!</button></div></aside></section>{menu && <div className='overlay' onClick={() => setMenu(false)}><div className='modal glass' onClick={(e) => e.stopPropagation()}><button className='close' onClick={() => setMenu(false)}>×</button><p>MENU</p><h2>Select calculation mode</h2><div className='mode-grid'>{modes.map((m, i) => <button key={m} onClick={() => setMode(i)} className={mode === i ? 'active card' : 'card'}><span>{String(i + 1).padStart(2, '0')}</span><b>{m}</b><small>{i === 1 ? 'Quadratic solver planned' : i === 3 ? 'Matrix tools planned' : 'Expandable shell'}</small></button>)}</div></div></div>}</main>
}

function Landing({ start }) {
  return <main className='landing'><div className='orb one' /><div className='orb two' /><nav className='glass top'><strong>580VN-X Simulator</strong><a href={ref} target='_blank'>Official reference ↗</a></nav><section className='hero'><div><p className='eyebrow'>React + Vite MVP</p><h1>Scientific calculator simulator with a bright liquid-glass interface.</h1><p>Giao diện gần form 580VN-X, click là dùng ngay, có landing page, calculator page, MENU mode stack, history, SHIFT, ALPHA, MODE và các phép tính cốt lõi.</p><button className='cta' onClick={start}>Start Simulation →</button></div><div className='preview'><div className='tiny-screen'>Natural Display<br /><b>sin 30 = 0.5</b></div>{Array.from({ length: 48 }).map((_, i) => <i key={i} />)}</div></section><section className='features'><article className='glass'><h3>Realistic layout</h3><p>Custom rendered body, LCD, key grid and side panels.</p></article><article className='glass'><h3>Apple-like liquid glass</h3><p>Light, translucent, soft highlights and clean spacing.</p></article><article className='glass'><h3>MVP engine</h3><p>Arithmetic, trig, logs, roots, powers, factorial, percent and Ans.</p></article></section></main>
}

export default function App() {
  const [started, setStarted] = useState(false)
  return started ? <Calculator back={() => setStarted(false)} /> : <Landing start={() => setStarted(true)} />
}
