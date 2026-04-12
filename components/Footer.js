export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p>&copy; 2024 eCommerce Store. All rights reserved.</p>
        <p className="text-gray-400 text-sm mt-4">
          |{" "}
          <a href="#" className="hover:text-white transition">
            About
          </a>{" "}
          |{" "}
          <a href="#" className="hover:text-white transition">
            Contact
          </a>{" "}
          |{" "}
          <a href="#" className="hover:text-white transition">
            Privacy
          </a>{" "}
          |
        </p>
      </div>
    </footer>
  );
}
