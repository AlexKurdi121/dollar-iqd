import axios from "axios";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";

export async function GET() {
  try {
    // ---------- 1️⃣ Fetch USD ----------
    const usdUrl = "https://xeiqd.com/";
    const usdResp = await axios.get(usdUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $usd = cheerio.load(usdResp.data);
    const usdSpans = $usd("span").filter((i, el) => {
      const text = $usd(el).text().trim();
      return text.startsWith("د.ع");
    });
    let usdValue = usdSpans.eq(9).text().trim() || "0";

    const arabicToEnglish = (num: string) => {
      const map: { [key: string]: string } = {
        "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
        "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
      };
      return num.split("").map((d) => map[d] ?? d).join("");
    };

    // ---------- 2️⃣ Fetch EUR, GBP, TRY, IRR ----------
    const otherUrl = "https://amro.tech/exchangerate";
    const otherResp = await axios.get(otherUrl, {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const $other = cheerio.load(otherResp.data);

// Select all TDs with that class
const tds = $other('td[class="px-6 py-4 font-medium whitespace-nowrap"]');
const currencies = ["EUR", "GBP", "TRY", "IRR"];
const result: { [key: string]: string } = {};

// Map TDs explicitly
for (let j = 0; j < currencies.length; j++) {
  const el = tds.eq(j + 1); // td[2] → EUR, td[3] → GBP, td[4] → TRY, td[5] → IRR
  if (!el) continue;

  let val = el.text().trim();
  val = val.replace(/[د.ع]/g, "").trim();
  val = arabicToEnglish(val);

  // ---------- Special fix for IRR ----------
  if (currencies[j] === "IRR") {
    const num = Number(val) / 100; // 096 → 0.96
    val = num.toString();
  }

   result[currencies[j]] = val ? ` ${val}  IQD` : "Not Available";

}

    // ---------- 3️⃣ USD ----------
    usdValue = usdValue.replace(/[د.ع]/g, "").trim();
    usdValue = arabicToEnglish(usdValue);
    result["USD"] = ` ${usdValue} IQD `;

    result["updated_at"] = new Date().toISOString();

    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch values" }, { status: 500 });
  }
}
