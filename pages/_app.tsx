/**
 * Next.js App Component
 * Root component that wraps all pages with providers
 */

import { AppProps } from "next/app";
import { JSX } from "react";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import { ToastContainer } from "react-toastify";
import Script from "next/script";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

/**
 * MyApp - Root application component with global providers
 * @param {AppProps} props - Component and page properties
 */
function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <AuthProvider>
        <CartProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="w-full px-6 py-8 mx-auto grow">
              <Component {...pageProps} />
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
