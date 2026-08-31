import Hero from '@/components/hero/Hero'
import Services from '@/components/services/Services'
import Footer from '@/components/footer/Footer'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function LandingPage({ params }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <div className="overflow-x-hidden">
      <Hero lang={lang} dictionary={dictionary} />
      <Services dictionary={dictionary} />
      <Footer dictionary={dictionary} />
    </div>
  )
}
