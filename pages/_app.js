import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="grow max-w-6xl w-full mx-auto px-4 py-8">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default MyApp;
