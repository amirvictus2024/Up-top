addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    const url = new URL(request.url)
    const target = url.searchParams.get("url")
    
    if (!target) {
      return new Response("پارامتر url ارسال نشده است.", { status: 400 })
    }

    // درخواست به URL اینستاگرام با User-Agent مرورگر (برای جلوگیری از بلاک شدن)
    const response = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
      }
    })

    if (!response.ok) {
      return new Response("خطا در دریافت اطلاعات از اینستاگرام.", { status: 500 })
    }

    const html = await response.text()
    const media = extractMedia(html)

    if (!media) {
      return new Response("مدیا یافت نشد.", { status: 404 })
    }

    return new Response(JSON.stringify({ media }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    return new Response("خطا: " + err.toString(), { status: 500 })
  }
}

// تابع استخراج لینک مدیا از HTML صفحه
function extractMedia(html) {
  // ابتدا به دنبال تگ og:video می‌گردیم (برای ویدیو)
  let match = html.match(/<meta property="og:video" content="([^"]+)"\s*\/?>/)
  if (match && match[1]) {
    return { type: "video", url: match[1] }
  }
  
  // سپس به دنبال تگ og:image می‌گردیم (برای تصویر)
  match = html.match(/<meta property="og:image" content="([^"]+)"\s*\/?>/)
  if (match && match[1]) {
    return { type: "image", url: match[1] }
  }
  
  return null
}
