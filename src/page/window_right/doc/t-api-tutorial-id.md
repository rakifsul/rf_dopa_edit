## Pendahuluan

Berikut ini adalah tutorial RF Dopa Edit API dalam bentuk contoh kode.

Tutorial ini berbentuk contoh kode dan komentar agar Anda bisa lebih cepat belajar.

## Contoh Kode: Await

```
// RF Dopa Edit menjalankan kode dalam blok asynchronous.
// Jadi, Anda bisa langsung menggunakan await.
// rfx adalah namespace dari method yang berfungsi untuk navigasi.

// buka https://quotes.toscrape.com/tag/inspirational/
await rfx.goTo("https://quotes.toscrape.com/tag/inspirational/");

// jalankan popup alert di halaman tersebut.
await rfx.evaluate(`alert();`);

// buka https://quotes.toscrape.com/tag/life/
await rfx.goTo("https://quotes.toscrape.com/tag/life/");
```

## Contoh Kode: Click

```
// buka https://quotes.toscrape.com
await rfx.goTo("https://quotes.toscrape.com");

// tunggu hingga selector yang ada di argument pertama muncul.
// timeout = 100
// tries = 300
await rfx.waitForSelector("body > div > div:nth-child(2) > div.col-md-4.tags-box > span:nth-child(7) > a", 100, 300);

// click pada selector tadi
await rfx.click("body > div > div:nth-child(2) > div.col-md-4.tags-box > span:nth-child(7) > a");
```

## Contoh Kode: Timeout

```
// buka https://quotes.toscrape.com/tag/inspirational/
await rfx.goTo("https://quotes.toscrape.com/tag/inspirational/");

// tunggu selama 3000 milisecond atau 3 detik.
await rfx.waitForTimeout(3000);

// buka https://quotes.toscrape.com/tag/life/
await rfx.goTo("https://quotes.toscrape.com/tag/life/");
```

## Contoh Kode: Evaluate

```
// buka https://quotes.toscrape.com
await rfx.goTo("https://quotes.toscrape.com");

// tunggu hingga selector pada argument pertama muncul.
// timeout = 100
// tries = 300
await rfx.waitForSelector("body > div > div:nth-child(2) > div.col-md-4.tags-box > span:nth-child(7) > a", 100, 300);

// jalankan script pada argument pertama pada konteks panel kanan atau di halaman web dari https://quotes.toscrape.com.
let result = await rfx.evaluate(`
    let elements = Array.from(document.querySelectorAll("body > div > div:nth-child(2) > div.col-md-4.tags-box > span:nth-child(7) > a"));
    let textContent = elements.map(element => {
        return element.textContent
    });
    alert(textContent);
    return textContent;
`);
```
