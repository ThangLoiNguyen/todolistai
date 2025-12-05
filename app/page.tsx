// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Todo AI App</h1>

      <p className="text-lg text-gray-600 max-w-md mb-6">
        Quản lý công việc thông minh với AI. Đăng ký hoặc đăng nhập để bắt đầu.
      </p>

      <div className="flex gap-4">
        <Link
          href="/register"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Đăng ký
        </Link>

        <Link
          href="/login"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg"
        >
          Đăng nhập
        </Link>
      </div>
    </main>
  );
}
