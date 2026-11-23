import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmooth, destroySmooth } from './smooth'
import Scene from './three/Scene'
import Nav from './components/Nav'
import Experience from './components/Experience'
import ProductSection from './components/ProductSection'
import AboutSection from './components/AboutSection'
import IngredientsSection from './components/IngredientsSection'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    initSmooth()

    const refresh = () => ScrollTrigger.refresh()
    const onLoad = () => refresh()
    window.addEventListener('load', onLoad)
    const t1 = setTimeout(refresh, 400)
    const t2 = setTimeout(refresh, 1600)

    return () => {
      window.removeEventListener('load', onLoad)
      clearTimeout(t1)
      clearTimeout(t2)
      destroySmooth()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  return (
    <>
      <Scene />
      <Nav />
      <div className="content">
        <Experience />
        <ProductSection />
        <AboutSection />
        <IngredientsSection />
        <FinalCTA />
        <Footer />
      </div>
    </>
  )
}
