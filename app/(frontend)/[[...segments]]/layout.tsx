import { ReactNode } from 'react'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
})

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

type Props = {
  children: ReactNode
}

export default function FrontendLayout({ children }: Props) {
  return (
    <html lang="ru" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Основной скрипт GTM */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5Q62DZTP');
          `}
        </Script>
         <Script id="yandex-metrica" strategy="afterInteractive">
          {`
           (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108356945', 'ym');

    ym(108356945, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
      </head>
      <body
        className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5Q62DZTP"
height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
<noscript><div><img src="https://mc.yandex.ru/watch/108356945" style={{position:'absolute',left:'-9999px'}} alt="" /></div></noscript>
      </body>
    </html>
  )
}