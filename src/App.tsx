import { Routes, Route } from 'react-router-dom'
import GNB from './components/layout/GNB'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyPage from './pages/MyPage'
import InquiryPage from './pages/InquiryPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <GNB />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/inquiry" element={<InquiryPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
