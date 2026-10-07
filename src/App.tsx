import PizzaCalculator from './components/PizzaCalculator'

function App() {
  return (
    <>
      <PizzaCalculator />
      <footer className="max-w-2xl mx-auto px-4 py-6 text-center text-sm text-[#6b4c3b]">
        <a href="/privacidad.html" className="underline underline-offset-4 hover:text-[#9c4221] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          Política de privacidad
        </a>
      </footer>
    </>
  )
}

export default App
