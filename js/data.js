// Datos de la web de Reda Location / Rent. Todo lo que hay que cambiar para la versión real está aquí.
// - DEMO: true mientras los logements sean ejemplos con fotos de Unsplash (sale la etiqueta «Exemple» y la pregunta
//   «¿Están disponibles?»). Cuando Reda mande sus fotos y datos reales: poner sus logements y DEMO: false.
// - Contacto: el WhatsApp de su tarjeta. La ciudad o zona NO aparece en la tarjeta: está pendiente (CITY).
window.SITE = {
  DEMO: true,
  WA: '212652291153',
  PHONE: '+212 652 291 153',
  CITY: '' // PENDIENTE: ciudad o zona de los logements (p. ej. «Nador», «Marrakech»…)
};

// Logements de ejemplo (fotos de Unsplash, licencia Unsplash). Los nombres y etiquetas describen solo lo que se ve en las fotos.
window.LISTINGS = [
  {
    id: 'villa-vitree', type: 'villa',
    title: { fr: 'Villa vitrée avec piscine', en: 'Glass-fronted villa with pool', es: 'Villa acristalada con piscina' },
    tags: { fr: ['Piscine', 'Terrasse', 'Vue sur la montagne'], en: ['Pool', 'Terrace', 'Mountain view'], es: ['Piscina', 'Terraza', 'Vistas a la montaña'] },
    photos: [
      { src: 'villa-noche-1', w: 2000, h: 1333, alt: { fr: 'Villa aux grandes baies vitrées éclairées la nuit, piscine au premier plan', en: 'Villa with large lit windows at night and a pool in front', es: 'Villa con grandes ventanales iluminados de noche y piscina delante' } },
      { src: 'villa-noche-2', w: 1600, h: 900, alt: { fr: 'Piscine de nuit avec un fauteuil suspendu, montagnes et lune', en: 'Pool at night with a hanging chair, mountains and the moon', es: 'Piscina de noche con un sillón colgante, montañas y luna' } }
    ]
  },
  {
    id: 'appartement-salon', type: 'appartement',
    title: { fr: 'Appartement avec salon et cuisine ouverte', en: 'Apartment with open-plan living and kitchen', es: 'Apartamento con salón y cocina abierta' },
    tags: { fr: ['Salon', 'Cuisine ouverte', 'Coin repas'], en: ['Living room', 'Open kitchen', 'Dining area'], es: ['Salón', 'Cocina abierta', 'Comedor'] },
    photos: [
      { src: 'apto-salon-1', w: 1600, h: 900, alt: { fr: 'Salon avec canapé clair, coin repas et cuisine ouverte, éclairage chaud', en: 'Living room with a light sofa, dining area and open kitchen in warm light', es: 'Salón con sofá claro, comedor y cocina abierta con luz cálida' } },
      { src: 'apto-salon-2', w: 1600, h: 900, alt: { fr: 'Cuisine ouverte avec îlot et table à manger', en: 'Open kitchen with an island and a dining table', es: 'Cocina abierta con isla y mesa de comedor' } }
    ]
  },
  {
    id: 'villa-patio', type: 'villa',
    title: { fr: 'Villa patio et piscine', en: 'Patio villa with pool', es: 'Villa con patio y piscina' },
    tags: { fr: ['Piscine éclairée', 'Jardin', 'Patio'], en: ['Lit pool', 'Garden', 'Patio'], es: ['Piscina iluminada', 'Jardín', 'Patio'] },
    photos: [
      { src: 'villa-piscina-1', w: 1600, h: 1067, alt: { fr: 'Patio avec piscine éclairée et végétation le soir', en: 'Patio with a lit pool and plants in the evening', es: 'Patio con piscina iluminada y plantas al anochecer' } },
      { src: 'villa-piscina-2', w: 1111, h: 1400, alt: { fr: 'Façade vitrée et piscine bleue dans le jardin la nuit', en: 'Glass facade and blue pool in the garden at night', es: 'Fachada acristalada y piscina azul en el jardín de noche' } }
    ]
  },
  {
    id: 'studio-calme', type: 'appartement',
    title: { fr: 'Studio avec chambre au calme', en: 'Quiet studio', es: 'Estudio tranquilo' },
    tags: { fr: ['Lit double', 'Liseuses', 'Rideaux occultants'], en: ['Double bed', 'Reading lights', 'Blackout curtains'], es: ['Cama doble', 'Luces de lectura', 'Cortinas opacas'] },
    photos: [
      { src: 'cama-3', w: 1296, h: 1400, alt: { fr: 'Chambre sombre avec lit double et lampe de lecture allumée', en: 'Dark bedroom with a double bed and a reading lamp on', es: 'Dormitorio en penumbra con cama doble y lámpara de lectura encendida' } },
      { src: 'cama-1', w: 1333, h: 1400, alt: { fr: 'Tête de lit éclairée par une liseuse', en: 'Headboard lit by a reading lamp', es: 'Cabecero iluminado por una lámpara de lectura' } },
      { src: 'cama-2', w: 1600, h: 1067, alt: { fr: 'Lit fait avec oreillers, lumière douce', en: 'Made bed with pillows in soft light', es: 'Cama hecha con almohadas y luz suave' } }
    ]
  },
  {
    id: 'villa-mer', type: 'villa',
    title: { fr: 'Villa avec piscine face à la mer', en: 'Sea-view villa with pool', es: 'Villa con piscina frente al mar' },
    tags: { fr: ['Piscine', 'Vue mer', 'Terrasse'], en: ['Pool', 'Sea view', 'Terrace'], es: ['Piscina', 'Vistas al mar', 'Terraza'] },
    photos: [
      { src: 'villa-atardecer', w: 1600, h: 1067, alt: { fr: 'Piscine éclairée au crépuscule, la mer et un palmier au loin', en: 'Lit pool at dusk with the sea and a palm tree beyond', es: 'Piscina iluminada al atardecer con el mar y una palmera al fondo' } }
    ]
  },
  {
    id: 'appartement-loft', type: 'appartement',
    title: { fr: 'Appartement loft', en: 'Loft apartment', es: 'Apartamento tipo loft' },
    tags: { fr: ['Grandes fenêtres', 'Salon', 'Cuisine'], en: ['Large windows', 'Living room', 'Kitchen'], es: ['Ventanales', 'Salón', 'Cocina'] },
    photos: [
      { src: 'apto-loft', w: 1299, h: 1400, alt: { fr: 'Loft au coucher du soleil : salon, tapis, cuisine et grandes fenêtres', en: 'Loft at sunset: living room, rug, kitchen and large windows', es: 'Loft al atardecer: salón, alfombra, cocina y grandes ventanales' } }
    ]
  }
];

// Créditos (se muestran en mentions-legales.html). Licencia Unsplash / licencia Pexels: uso libre, también comercial.
window.CREDITS = [
  ['villa-noche-1, villa-noche-2', 'Igor Savelev', 'https://unsplash.com/photos/hnFmQgrmLt4'],
  ['villa-piscina-1, villa-piscina-2', 'Adrianne Tulod', 'https://unsplash.com/photos/1V9TToIkmuI'],
  ['villa-atardecer', 'Colin Watts', 'https://unsplash.com/photos/cKDnRYSWqUs'],
  ['apto-salon-1, apto-salon-2', 'Christian', 'https://unsplash.com/photos/DS9Xc7AWmwQ'],
  ['apto-loft', 'Evan Wise', 'https://unsplash.com/photos/o83AwSzOns4'],
  ['cama-1, cama-2, cama-3', 'Jp Valery', 'https://unsplash.com/photos/F2SrBdv9swk'],
  ['carretera-atardecer', 'Etienne Dayer', 'https://unsplash.com/photos/19w0FuCwF5U'],
  ['coche-bosque', 'Othman Alghanmi', 'https://unsplash.com/photos/mLJtdTgdTfs'],
  ['van-noche', 'William G', 'https://unsplash.com/photos/PNW4oeltJGo'],
  ['camellos', 'Tobias Tullius', 'https://unsplash.com/photos/2NtaGAYZ5qM'],
  ['balcon-noche', 'Chris Dunn', 'https://unsplash.com/photos/T31u1wRqIbE'],
  ['edificio-atardecer', 'Alfonso Scarpa', 'https://unsplash.com/photos/u5a70oYsgAY'],
  ['farol-dos', 'Artur Uber', 'https://unsplash.com/photos/zHlK_aMLRQ4'],
  ['piscina-noche (vidéo)', 'WeStarMoney Rec', 'https://www.pexels.com/video/swimming-pool-illuminated-at-night-10652252/']
];
