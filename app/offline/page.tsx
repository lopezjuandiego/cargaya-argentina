export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#0c0c0c] text-white">
      <div className="text-6xl mb-4">⚡</div>
      <h1 className="text-2xl font-bold mb-2">Sin conexión</h1>
      <p className="text-gray-400 mb-6">
        No hay internet. Cuando vuelvas a conectarte, podrás buscar cargadores normalmente.
      </p>
      <a
        href="/"
        className="px-5 py-2 rounded-lg bg-green-400 text-black font-semibold hover:bg-green-300 transition"
      >
        Reintentar
      </a>
    </main>
  );
}
