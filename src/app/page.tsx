"use client";

import { useEffect, useState } from "react";

interface CurrencyData {
  USD?: string;
  EUR?: string;
  GBP?: string;
  TRY?: string;
  IRR?: string;
  updated_at?: string;
  error?: string;
}

export default function Home() {
  const [data, setData] = useState<CurrencyData>({});
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dollar"); // your route.ts API
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      setData({ error: "هەڵە لە داتاکردنەوە" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      dir="rtl"
      className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen p-4 sm:p-8 font-sans flex flex-col items-center`}
    >
      {/* Toggle Dark/Light Mode */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`mb-4 px-4 py-2 rounded-lg font-semibold transition-colors ${
          darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-gray-900"
        }`}
      >
        {darkMode ? "چالاککردنی ڕۆشنایی" : "چالاککردنی تاریکی"}
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        نرخى دۆلار و دراوەکان بە دیناری عێراقی
      </h1>

      {loading ? (
        <p className="text-lg sm:text-xl text-center mt-6 animate-pulse">هەڵبژاردنی داتاکان...</p>
      ) : data.error ? (
        <p className="text-red-500 text-center mt-6 text-lg">{data.error}</p>
      ) : (
        <div className="overflow-x-auto w-full max-w-lg sm:max-w-xl">
          <table className="w-full border border-gray-400 dark:border-gray-700 rounded-lg text-lg sm:text-xl">
            <thead>
              <tr className={`${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                <th className="py-2 px-4 text-right font-semibold">ناوی دراو</th>
                <th className="py-2 px-4 text-center font-semibold">کۆد</th>
                <th className="py-2 px-4 text-left font-semibold">نرخ</th>
              </tr>
            </thead>
            <tbody>
              {["USD", "EUR", "GBP", "TRY", "IRR"].map((cur) => (
                <tr
                  key={cur}
                  className={`border-t border-gray-400 dark:border-gray-700 ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <td className="py-2 px-4 font-bold text-right">
                    {{
                      USD: "دۆلاری ئەمریکی لە هەولێر",
                      EUR: "یۆرۆی ئەوروپی",
                      GBP: "پاوەندی بەریتانی",
                      TRY: "لیرەی تورکی",
                      IRR: "تومەنی ئێرانی",
                    }[cur]}
                  </td>
                  <td className="py-2 px-4 font-bold text-center">{cur}</td>
                  <td className="py-2 px-4 text-left">
                    {data[cur as keyof CurrencyData] || "نەدۆزرایەوە"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}
