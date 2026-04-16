import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import GNB from './components/layout/GNB'
import Footer from './components/layout/Footer'

const HomePage          = lazy(() => import('./pages/HomePage'))
const ProductListPage   = lazy(() => import('./pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage          = lazy(() => import('./pages/CartPage'))
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'))
const LoginPage         = lazy(() => import('./pages/LoginPage'))
const RegisterPage      = lazy(() => import('./pages/RegisterPage'))
const MyPage            = lazy(() => import('./pages/MyPage'))
const InquiryPage       = lazy(() => import('./pages/InquiryPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <GNB />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"               element={<HomePage />} />
            <Route path="/products"       element={<ProductListPage />} />
            <Route path="/products/:id"   element={<ProductDetailPage />} />
            <Route path="/cart"           element={<CartPage />} />
            <Route path="/checkout"       element={<CheckoutPage />} />
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/register"       element={<RegisterPage />} />
            <Route path="/mypage"         element={<MyPage />} />
            <Route path="/inquiry"        element={<InquiryPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
