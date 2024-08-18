export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome to Your Bank
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Manage your finances with ease. Please log in or register to continue.
        </p>
        <div className="flex justify-around">
          <a
            href="/register"
            className="text-white bg-blue-500 hover:bg-blue-600 font-medium py-2 px-4 rounded-lg transition duration-300"
          >
            Register
          </a>
          <a
            href="/login"
            className="text-white bg-green-500 hover:bg-green-600 font-medium py-2 px-4 rounded-lg transition duration-300"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
