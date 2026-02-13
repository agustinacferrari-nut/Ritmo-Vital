import { useMemo, useRef, useState } from 'react'
import logoRitmo from './assets/ritmo-vital.svg'
import './App.css'

const CONFIG = {
  moments: [
    { id: 'cycle', label: 'Ciclo menstrual activo' },
    { id: 'pregnancy', label: 'Embarazo' },
    { id: 'postpartum_early', label: 'Postparto temprano (0-6 meses)' },
    { id: 'postpartum_late', label: 'Postparto tardio (6-18 meses)' },
    { id: 'no_cycle', label: 'Sin ciclo / etapa hormonal especifica' },
    { id: 'general_balance', label: 'Equilibrio general' },
  ],
  questions: [
    {
      id: 'q1_pregnant',
      text: 'Estas actualmente embarazada?',
      options: [
        { value: 'yes', label: 'Si' },
        { value: 'no', label: 'No' },
      ],
      required: true,
    },
    {
      id: 'q2_postpartum',
      text: 'Has dado a luz en los ultimos 18 meses?',
      options: [
        { value: 'no', label: 'No' },
        { value: 'under_6_months', label: 'Si, hace menos de 6 meses' },
        { value: 'between_6_18_months', label: 'Si, entre 6 y 18 meses' },
      ],
      visible_if: { q1_pregnant: 'no' },
      required: true,
    },
    {
      id: 'q3_cycles',
      text: 'Tenes ciclos menstruales activos actualmente?',
      options: [
        { value: 'yes', label: 'Si' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'No estoy segura' },
      ],
      visible_if: { q1_pregnant: 'no', q2_postpartum: 'no' },
      required: true,
    },
    {
      id: 'q4_cycle_phase',
      text: 'Si tenes ciclos activos: en que fase sentis que estas hoy?',
      options: [
        { value: 'menstruation', label: 'Menstruacion' },
        { value: 'follicular', label: 'Folicular' },
        { value: 'ovulation', label: 'Ovulacion' },
        { value: 'luteal', label: 'Lutea' },
        { value: 'not_sure', label: 'No lo se' },
      ],
      visible_if: { q3_cycles: 'yes' },
      required: true,
    },
    {
      id: 'q5_energy',
      text: 'Como sentis tu nivel de energia esta semana?',
      options: [
        { value: 'low', label: 'Baja' },
        { value: 'medium', label: 'Media' },
        { value: 'high', label: 'Alta' },
      ],
      required: true,
    },
    {
      id: 'q6_emotion',
      text: 'Que emocion predomina hoy?',
      options: [
        { value: 'anxiety', label: 'Ansiedad' },
        { value: 'sensitivity', label: 'Sensibilidad' },
        { value: 'calm', label: 'Calma' },
        { value: 'irritability', label: 'Irritabilidad' },
      ],
      required: true,
    },
    {
      id: 'q7_rest',
      text: 'Como esta tu descanso ultimamente?',
      options: [
        { value: 'irregular', label: 'Irregular' },
        { value: 'stable', label: 'Estable' },
        { value: 'good', label: 'Bueno' },
      ],
      required: true,
    },
    {
      id: 'q8_need',
      text: 'Que necesitas mas en este momento?',
      options: [
        { value: 'support', label: 'Sosten' },
        { value: 'clarity', label: 'Claridad' },
        { value: 'energy', label: 'Energia' },
        { value: 'stability', label: 'Estabilidad' },
      ],
      required: true,
    },
  ],
  outputs: {
    cycle: ['alimentacion por fase', 'descanso', 'energia ciclica'],
    pregnancy: ['energia estable', 'hidratacion', 'saciedad y micronutrientes'],
    postpartum_early: ['recuperacion', 'nutricion reparadora', 'sosten energetico'],
    postpartum_late: ['reequilibrio gradual', 'fuerza', 'habitos sostenibles'],
    no_cycle: ['regulacion energetica', 'digestion', 'rutina flexible'],
    general_balance: ['base nutricional', 'energia estable', 'relacion sana con la comida'],
  },
}

const getMomentLabel = (momentId) => {
  const found = CONFIG.moments.find((item) => item.id === momentId)
  return found ? found.label : 'Equilibrio general'
}

const matchesCondition = (answer, expected) => {
  if (Array.isArray(expected)) return expected.includes(answer)
  return answer === expected
}

const isVisible = (question, answers) => {
  if (!question.visible_if) return true
  return Object.entries(question.visible_if).every(([key, expected]) =>
    matchesCondition(answers[key], expected)
  )
}

const evaluateMoment = (answers) => {
  if (answers.q1_pregnant === 'yes') return 'pregnancy'
  if (answers.q2_postpartum === 'under_6_months') return 'postpartum_early'
  if (answers.q2_postpartum === 'between_6_18_months') return 'postpartum_late'
  if (answers.q3_cycles === 'yes') return 'cycle'
  if (['no', 'not_sure'].includes(answers.q3_cycles)) return 'no_cycle'
  return 'general_balance'
}

const getBadgeText = (answers) => {
  const energy = answers.q5_energy ? `Energia ${answers.q5_energy}` : null
  const emotion = answers.q6_emotion ? `Emocion ${answers.q6_emotion}` : null
  const rest = answers.q7_rest ? `Descanso ${answers.q7_rest}` : null
  return [energy, emotion, rest].filter(Boolean).join(' · ')
}

function App() {
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const resultRef = useRef(null)
  const quizRef = useRef(null)

  const visibleQuestions = useMemo(
    () => CONFIG.questions.filter((q) => isVisible(q, answers)),
    [answers]
  )

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const isComplete = visibleQuestions.every((q) => !q.required || answers[q.id])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isComplete) return
    const momentId = evaluateMoment(answers)
    setResult(momentId)
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const handleScrollToQuiz = () => {
    quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleScrollToHow = () => {
    document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const badgeText = getBadgeText(answers)

  return (
    <div className="page">
      <section className="hero" id="hero">
        <div className="brand">
          <img src={logoRitmo} alt="Ritmo Vital" className="brand__logo" />
          <span className="brand__name">Ritmo Vital</span>
        </div>
        <div className="hero__copy">
          <h1>Nutricion que acompana tu momento</h1>
          <p>
            Un recorrido breve para identificar tu etapa actual y recibir una guia
            nutritiva, cercana y realista.
          </p>
          <div className="hero__actions">
            <button type="button" className="cta cta--primary" onClick={handleScrollToQuiz}>
              Empezar cuestionario
            </button>
            <button type="button" className="cta cta--ghost" onClick={handleScrollToHow}>
              Como funciona
            </button>
          </div>
        </div>
      </section>

      <section className="stage" ref={resultRef} id="result">
        <div className="section__header">
          <h2>Tu etapa estimada</h2>
          <p>Una vista clara para orientarte y empezar con calma.</p>
        </div>
        <div className="stage__card">
          {!result ? (
            <p className="stage__placeholder">
              Tu etapa estimada aparecera aca cuando completes el cuestionario.
            </p>
          ) : (
            <>
              <h3>{getMomentLabel(result)}</h3>
              <ul className="stage__list">
                {CONFIG.outputs[result].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {badgeText && <span className="stage__badge">{badgeText}</span>}
            </>
          )}
        </div>
      </section>

      <section className="how" id="how">
        <div className="section__header">
          <h2>Como usamos tus respuestas</h2>
          <p>Transparencia y respeto en cada paso.</p>
        </div>
        <ul className="how__list">
          <li>Para sugerirte un enfoque nutricional realista segun tu momento.</li>
          <li>Para adaptar recomendaciones segun energia, emocion y descanso.</li>
          <li>Solo usamos tus respuestas para generar tu guia en esta sesion.</li>
        </ul>
      </section>

      <section className="quiz" ref={quizRef} id="quiz">
        <div className="section__header">
          <h2>Cuestionario</h2>
          <p>Elegi las opciones que mejor describen tu momento actual.</p>
        </div>
        <div className="quiz__card">
          <form className="form" onSubmit={handleSubmit}>
            {visibleQuestions.map((question) => (
              <div className="field" key={question.id}>
                <label>{question.text}</label>
                <div className="field__options">
                  {question.options.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={
                        answers[question.id] === option.value
                          ? 'option option--active'
                          : 'option'
                      }
                      onClick={() => handleChange(question.id, option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="submit" type="submit" disabled={!isComplete}>
              Ver mi resultado
            </button>
            {!isComplete && (
              <p className="form__hint">Completa todas las respuestas para continuar.</p>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}

export default App
