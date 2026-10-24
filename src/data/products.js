// Sample listings shown on the homepage. No backend required.
export const categories = ['All', 'Clocks', 'Cameras', 'Ceramics']

export const products = [
  {
    id: 1,
    name: 'Jaipur Brass Mantel Clock',
    category: 'Clocks',
    origin: 'Jaipur, Rajasthan',
    year: '1958',
    price: 18500,
    story: 'Hand-chased brass with a still-working German movement.',
    image:
      'https://images.unsplash.com/photo-1415604936272-03168d0c2d3d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Yashica Electro 35',
    category: 'Cameras',
    origin: 'Bombay studio lot',
    year: '1972',
    price: 9200,
    story: 'A rangefinder that shot a thousand family weddings.',
    image:
      'https://images.unsplash.com/photo-1510127034890-ba27508e9f1e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Blue Pottery Vase',
    category: 'Ceramics',
    origin: 'Jaipur, Rajasthan',
    year: '1964',
    price: 6400,
    story: 'Cobalt glaze over quartz, signed by the atelier.',
    image:
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Madras Station Wall Clock',
    category: 'Clocks',
    origin: 'Chennai, Tamil Nadu',
    year: '1949',
    price: 24000,
    story: 'Recovered from a railway waiting hall, teak case intact.',
    image:
      'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'Kodak Retina IIIc',
    category: 'Cameras',
    origin: 'Calcutta darkroom',
    year: '1957',
    price: 14800,
    story: 'Folding 35mm with a Schneider Xenon lens, still sharp.',
    image:
      'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    name: 'Khurja Serving Bowl',
    category: 'Ceramics',
    origin: 'Khurja, Uttar Pradesh',
    year: '1978',
    price: 3800,
    story: 'Floral underglaze from a family kiln still firing today.',
    image:
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    name: 'Art Deco Table Clock',
    category: 'Clocks',
    origin: 'Pune, Maharashtra',
    year: '1936',
    price: 31200,
    story: 'Chrome and bakelite, a salon piece from a Deccan bungalow.',
    image:
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    name: 'Pentax Spotmatic',
    category: 'Cameras',
    origin: 'Delhi photo club',
    year: '1968',
    price: 11000,
    story: 'The SLR that taught a generation of Indian photojournalists.',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 9,
    name: 'Terracotta Water Jar',
    category: 'Ceramics',
    origin: 'Kutch, Gujarat',
    year: '1981',
    price: 4200,
    story: 'Wheel-thrown earthenware with a cool, mineral finish.',
    image:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80',
  },
]

export function formatRupees(amount) {
  return `Rs ${new Intl.NumberFormat('en-IN').format(amount)}`
}
