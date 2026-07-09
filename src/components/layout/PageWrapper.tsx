import Navbar from './Navbar'
import Footer from './Footer'

interface Props {
  children: React.ReactNode
}

export default function PageWrapper({ children }: Props) {
  return (
    <div className="page">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}