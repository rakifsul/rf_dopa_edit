## Pendahuluan

Menggunakan RF Dopa Edit sebenarnya tidak terlalu sulit.

Yang penting, Anda paham arti dari singkatan-singkatan yang ada pada menunya dan mampu memahami contoh kode yang diberikan.

Namun sebelumnya, kita akan mulai dulu dari 2 panel (kiri dan kanan) yang ada pada window utama.

![Window Utama](./static/ss-0.png)

## Panel Kiri

Panel kiri RF Dopa Edit adalah panel yang digunakan untuk navigasi dan konfigurasi.

Panel ini terdiri dari dua tab horizontal:

-   Navigation
-   Settings

Tab "Navigation" digunakan untuk melakukan navigasi, baik melalui GUI maupun API.

### Navigasi dengan GUI

Untuk melakukan navigasi dengan GUI, gunakan tombol BW, FW, HM, dan GO pada kiri dan kanan kotak input URL.

Apa arti dari singkatan tadi?

-   BW = Go Backward
-   FW = Go Forward
-   HM = Go Home
-   GO = Go to URL provided in input box.

### Navigasi dengan API

Untuk melakukan navigasi dengan API, Anda bisa membuat tab code editor baru dengan mengklik tombol NE pada menu.

Selanjutnya, akan muncul code editor yang bisa Anda beri nama sendiri melalui popup yang disediakan.

Code editor itu akan diisi kode yang menggunakan rfx API dari aplikasi ini untuk melakukan berbagai tugas seputar navigasi web.

Detail dari rfx API akan diberikan pada tutorial API yang bisa Anda klik di menu dokumentasi ini.

### Settings

Tab "Settings" berisi konfigurasi aplikasi RF Dopa Edit yang bisa Anda ubah:

-   Home page
-   Useragent
-   Window Theme: BS Light atau BS Dark. BS adalah singkatan dari Bootstrap, CSS library yang digunakan dalam aplikasi ini.
-   Editor Theme: VS Light atau VS Dark. Ini adalah theme dari monaco editor yang digunakan dalam aplikasi ini.
-   Save. Untuk menyimpan konfigurasi.
-   Reset. Untuk me-reset konfigurasi.

### Menu-Menu Lainnya

Beberapa menu telah dibahas tadi, sekarang inilah sisanya:

-   DTR - DevTools Right. Untuk membuka devtools di panel kanan.
-   SV - Save Scripts. Untuk menyimpan seluruh script yang ada di code editor tab.
-   RN - Rename Script. Untuk me-rename nama script yang telah dibuat.
-   DL - Delete Script. Untuk menghapus script yang telah dibuat.
-   EX - Export Scripts. Untuk meng-export semua script yang ada di tab ke file berformat JSON.
-   IM - Import Scripts. Untuk meng-import semua script yang telah di-export dengan EX tadi.
-   RA - Run Asynchronous. Untuk menjalankan script di dalam sebuah wrapper yang asynchronous. Jadi, Anda bisa langsung menggunakan `await` pada code editor.
-   FS - Force Stop. Untuk menghentikan script secara paksa. Sangat berguna jika Anda memasukkan infinite loop pada script di code editor.

## Panel Kanan

Panel kanan adalah preview dari apa yang Anda lakukan di panel kiri.

Sebagai contoh, Anda bisa membuka URL tertentu pada URL input, kemudian menekan tombol GO.

Dengan demikian, di panel kanan, jika alamat URL tersebut benar, maka halaman yang dituju akan terbuka.

Jika terjadi error, maka RF Dopa Edit akan menampilkan halaman error di panel kanan.

Selain itu, panel kanan juga merupakan preview dari apa yang Anda lakukan pada code editor di panel kiri.

Sebagai contoh, Anda bisa menjalankan:

```
rfx.goTo("https://duckduckgo.com");
```

Di code editor.

Dengan melakukan run script pada kode tersebut, halaman duckduckgo akan terbuka di panel kanan.
