const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const Product = require('./models/Product')

dotenv.config()

const products = [
  // ══════════ NECKLACES (13) ══════════
  { name: 'Rose Gold Necklace', description: 'A delicate layered rose gold necklace that adds subtle elegance to any outfit.', price: 210, category: 'Necklaces', material: 'Rose Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: Rose Gold', '30-day return policy'], stock: 12, isFeatured: true },
  { name: 'Diamond Pendant', description: 'A fine diamond pendant in 14K gold, perfect for special occasions.', price: 280, category: 'Necklaces', material: 'Gold', badge: 'New', sizes: ['S', 'M', 'L'], details: ['Material: 14K Gold', 'Genuine diamond'], stock: 7, isFeatured: true },
  { name: 'Pearl Necklace', description: 'A classic pearl necklace set in sterling silver with genuine freshwater pearls.', price: 190, category: 'Necklaces', material: 'Silver', badge: 'Best Seller', sizes: ['S', 'M', 'L'], details: ['Material: Sterling Silver', 'Genuine freshwater pearls'], stock: 9 },
  { name: 'Gold Locket Necklace', description: 'A vintage-inspired gold locket that holds your most treasured memories.', price: 165, category: 'Necklaces', material: 'Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: 18K Gold', 'Opens to hold two photos'], stock: 11 },
  { name: 'Silver Heart Pendant', description: 'A romantic sterling silver heart pendant on a fine chain.', price: 90, category: 'Necklaces', material: 'Silver', badge: '', sizes: ['S', 'M'], details: ['Material: 925 Sterling Silver'], stock: 16 },
  { name: 'Emerald Drop Necklace', description: 'An elegant emerald drop necklace set in white gold.', price: 320, category: 'Necklaces', material: 'Gold', badge: 'New', sizes: ['S', 'M', 'L'], details: ['Material: White Gold', 'Genuine emerald gemstone'], stock: 6, isFeatured: true },
  { name: 'Layered Chain Necklace', description: 'A trendy multi-layer gold chain necklace for a modern look.', price: 145, category: 'Necklaces', material: 'Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: 18K Gold Plated'], stock: 18 },
  { name: 'Sapphire Pendant Necklace', description: 'A deep blue sapphire pendant on a delicate silver chain.', price: 240, category: 'Necklaces', material: 'Silver', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: Sterling Silver', 'Genuine sapphire'], stock: 8 },
  { name: 'Gold Bar Necklace', description: 'A minimalist horizontal gold bar necklace, perfect for everyday wear.', price: 110, category: 'Necklaces', material: 'Gold', badge: 'Sale', sizes: ['S', 'M'], details: ['Material: 14K Gold', 'Can be personalised'], stock: 22 },
  { name: 'Rose Gold Choker', description: 'A chic rose gold choker that elevates any evening look.', price: 130, category: 'Necklaces', material: 'Rose Gold', badge: '', sizes: ['S', 'M'], details: ['Material: Rose Gold'], stock: 13 },
  { name: 'Diamond Solitaire Necklace', description: 'A timeless single diamond solitaire necklace in 18K gold.', price: 390, category: 'Necklaces', material: 'Gold', badge: 'Best Seller', sizes: ['S', 'M', 'L'], details: ['Material: 18K Gold', 'Certificate of authenticity included'], stock: 5 },
  { name: 'Silver Infinity Necklace', description: 'A sterling silver infinity pendant symbolising eternal love.', price: 85, category: 'Necklaces', material: 'Silver', badge: '', sizes: ['S', 'M'], details: ['Material: 925 Sterling Silver'], stock: 20 },
  { name: 'Ruby Pendant Necklace', description: 'A striking ruby pendant set in yellow gold on a fine chain.', price: 300, category: 'Necklaces', material: 'Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: 14K Yellow Gold', 'Genuine ruby gemstone'], stock: 6 },

  // ══════════ SUNGLASSES (10) ══════════
  { name: 'Classic Aviator Sunglasses', description: 'Timeless aviator sunglasses with a gold frame and UV protection.', price: 140, category: 'Sunglasses', material: 'Gold', badge: 'Best Seller', sizes: ['One Size'], details: ['100% UV protection', 'Gold-tone metal frame'], stock: 20, isFeatured: true },
  { name: 'Cat-Eye Sunglasses', description: 'Elegant cat-eye sunglasses with a bold, feminine silhouette.', price: 125, category: 'Sunglasses', material: 'Acetate', badge: 'New', sizes: ['One Size'], details: ['100% UV protection', 'Premium acetate frame'], stock: 15, isFeatured: true },
  { name: 'Round Retro Sunglasses', description: 'Vintage-inspired round sunglasses with thin metal frames.', price: 110, category: 'Sunglasses', material: 'Metal', badge: '', sizes: ['One Size'], details: ['100% UV protection', 'Lightweight metal frame'], stock: 18 },
  { name: 'Oversized Square Sunglasses', description: 'Glamorous oversized square sunglasses for a statement look.', price: 155, category: 'Sunglasses', material: 'Acetate', badge: '', sizes: ['One Size'], details: ['100% UV protection', 'Gradient tinted lenses'], stock: 12 },
  { name: 'Rimless Sunglasses', description: 'Sleek rimless sunglasses with a modern minimalist design.', price: 170, category: 'Sunglasses', material: 'Metal', badge: '', sizes: ['One Size'], details: ['100% UV protection', 'Scratch-resistant lenses'], stock: 10 },
  { name: 'Wayfarer Sunglasses', description: 'Iconic wayfarer-style sunglasses that never go out of fashion.', price: 130, category: 'Sunglasses', material: 'Acetate', badge: 'Sale', sizes: ['One Size'], details: ['100% UV protection', 'Durable acetate frame'], stock: 22 },
  { name: 'Gold Rimmed Sunglasses', description: 'Luxurious gold-rimmed sunglasses with amber-tinted lenses.', price: 185, category: 'Sunglasses', material: 'Gold', badge: 'New', sizes: ['One Size'], details: ['100% UV protection', 'Gold-tone frame', 'Amber lenses'], stock: 9 },
  { name: 'Butterfly Sunglasses', description: 'Chic butterfly-shaped sunglasses with a bold, elegant frame.', price: 145, category: 'Sunglasses', material: 'Acetate', badge: '', sizes: ['One Size'], details: ['100% UV protection', 'Gradient lenses'], stock: 14 },
  { name: 'Sport Wrap Sunglasses', description: 'Performance wrap-around sunglasses ideal for outdoor activities.', price: 120, category: 'Sunglasses', material: 'Polycarbonate', badge: '', sizes: ['One Size'], details: ['100% UV protection', 'Impact-resistant lenses'], stock: 17 },
  { name: 'Tinted Gradient Sunglasses', description: 'Fashionable sunglasses with a soft gradient tint and slim frame.', price: 135, category: 'Sunglasses', material: 'Metal', badge: '', sizes: ['One Size'], details: ['100% UV protection', 'Gradient tinted lenses'], stock: 13 },

  // ══════════ BRACELETS (10) ══════════
  { name: 'Gold Chain Bracelet', description: 'A timeless delicate chain bracelet crafted in 18K gold.', price: 120, category: 'Bracelets', material: 'Gold', badge: 'New', sizes: ['XS', 'S', 'M', 'L'], details: ['Material: 18K Gold', 'Free shipping above $150', '30-day return policy'], stock: 20, isFeatured: true },
  { name: 'Silver Bangle', description: 'A sleek and minimal 925 silver bangle for everyday elegance.', price: 65, category: 'Bracelets', material: 'Silver', badge: 'Sale', sizes: ['XS', 'S', 'M', 'L'], details: ['Material: 925 Sterling Silver'], stock: 25 },
  { name: 'Silver Chain Bracelet', description: 'A delicate 925 silver chain bracelet with a secure clasp.', price: 75, category: 'Bracelets', material: 'Silver', badge: '', sizes: ['XS', 'S', 'M'], details: ['Material: 925 Sterling Silver'], stock: 20 },
  { name: 'Gold Tennis Bracelet', description: 'A luxurious 18K gold tennis bracelet lined with sparkling stones.', price: 450, category: 'Bracelets', material: 'Gold', badge: '', sizes: ['XS', 'S', 'M', 'L'], details: ['Material: 18K Gold', 'Certificate of authenticity included'], stock: 5, isFeatured: true },
  { name: 'Rose Gold Cuff', description: 'A bold rose gold cuff bracelet with a smooth polished finish.', price: 140, category: 'Bracelets', material: 'Rose Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: Rose Gold'], stock: 14 },
  { name: 'Beaded Charm Bracelet', description: 'A playful beaded bracelet adorned with delicate gold charms.', price: 80, category: 'Bracelets', material: 'Gold', badge: 'New', sizes: ['S', 'M', 'L'], details: ['Material: 14K Gold Plated', 'Adjustable fit'], stock: 19 },
  { name: 'Diamond Bangle', description: 'An elegant bangle set with a row of shimmering diamonds.', price: 380, category: 'Bracelets', material: 'Gold', badge: 'Best Seller', sizes: ['XS', 'S', 'M', 'L'], details: ['Material: 18K White Gold', 'Genuine diamonds'], stock: 6 },
  { name: 'Leather Wrap Bracelet', description: 'A casual leather wrap bracelet with a gold-tone magnetic clasp.', price: 55, category: 'Bracelets', material: 'Leather', badge: 'Sale', sizes: ['S', 'M', 'L'], details: ['Genuine leather', 'Magnetic clasp'], stock: 30 },
  { name: 'Pearl Beaded Bracelet', description: 'A refined bracelet strung with lustrous freshwater pearls.', price: 95, category: 'Bracelets', material: 'Silver', badge: '', sizes: ['S', 'M'], details: ['Genuine freshwater pearls', 'Sterling silver clasp'], stock: 15 },
  { name: 'Gold Link Bracelet', description: 'A bold interlocking gold link bracelet with a modern edge.', price: 210, category: 'Bracelets', material: 'Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: 18K Gold'], stock: 11 },

  // ══════════ EARRINGS (11) ══════════
  { name: 'Pearl Drop Earrings', description: 'Elegant pearl drop earrings set in sterling silver.', price: 85, category: 'Earrings', material: 'Silver', badge: '', sizes: ['S', 'M'], details: ['Material: Sterling Silver', 'Free shipping above $150'], stock: 15, isFeatured: true },
  { name: 'Sapphire Stud Earrings', description: 'Beautiful sapphire stud earrings set in white gold.', price: 175, category: 'Earrings', material: 'Gold', badge: '', sizes: ['S', 'M'], details: ['Material: White Gold', 'Genuine sapphire gemstones'], stock: 8 },
  { name: 'Gold Hoop Earrings', description: 'Bold 18K gold hoop earrings that make a statement.', price: 95, category: 'Earrings', material: 'Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: 18K Gold'], stock: 18, isFeatured: true },
  { name: 'Diamond Stud Earrings', description: 'Classic diamond stud earrings that add sparkle to any look.', price: 260, category: 'Earrings', material: 'Gold', badge: 'Best Seller', sizes: ['S', 'M'], details: ['Material: 14K Gold', 'Genuine diamonds'], stock: 10 },
  { name: 'Rose Gold Huggie Earrings', description: 'Dainty rose gold huggie hoops perfect for stacking.', price: 70, category: 'Earrings', material: 'Rose Gold', badge: 'New', sizes: ['S', 'M'], details: ['Material: Rose Gold'], stock: 20 },
  { name: 'Emerald Drop Earrings', description: 'Sophisticated emerald drop earrings set in yellow gold.', price: 230, category: 'Earrings', material: 'Gold', badge: '', sizes: ['S', 'M'], details: ['Material: 14K Yellow Gold', 'Genuine emeralds'], stock: 7 },
  { name: 'Silver Threader Earrings', description: 'Modern sterling silver threader earrings with a sleek drop.', price: 60, category: 'Earrings', material: 'Silver', badge: 'Sale', sizes: ['S', 'M'], details: ['Material: 925 Sterling Silver'], stock: 24 },
  { name: 'Chandelier Earrings', description: 'Glamorous chandelier earrings that catch the light beautifully.', price: 190, category: 'Earrings', material: 'Gold', badge: '', sizes: ['M', 'L'], details: ['Material: 18K Gold Plated', 'Cubic zirconia accents'], stock: 12 },
  { name: 'Pearl Stud Earrings', description: 'Timeless freshwater pearl studs for everyday elegance.', price: 75, category: 'Earrings', material: 'Silver', badge: '', sizes: ['S', 'M'], details: ['Genuine freshwater pearls', 'Sterling silver posts'], stock: 22 },
  { name: 'Gold Ear Cuffs', description: 'Trendy gold ear cuffs that require no piercing.', price: 65, category: 'Earrings', material: 'Gold', badge: 'New', sizes: ['One Size'], details: ['Material: 18K Gold Plated', 'No piercing required'], stock: 26 },
  { name: 'Ruby Stud Earrings', description: 'Rich ruby stud earrings set in fine yellow gold.', price: 210, category: 'Earrings', material: 'Gold', badge: '', sizes: ['S', 'M'], details: ['Material: 14K Yellow Gold', 'Genuine rubies'], stock: 9 },

  // ══════════ RINGS (8) ══════════
  { name: 'Diamond Ring', description: 'A stunning diamond ring set in 14K white gold.', price: 340, category: 'Rings', material: 'Gold', badge: 'Best Seller', sizes: ['XS', 'S', 'M', 'L', 'XL'], details: ['Material: 14K White Gold', 'Certificate of authenticity included'], stock: 10, isFeatured: true },
  { name: 'Rose Gold Ring', description: 'A minimal rose gold ring with a smooth polished finish.', price: 130, category: 'Rings', material: 'Rose Gold', badge: '', sizes: ['XS', 'S', 'M', 'L', 'XL'], details: ['Material: Rose Gold'], stock: 14 },
  { name: 'Sapphire Halo Ring', description: 'A breathtaking sapphire ring surrounded by a halo of diamonds.', price: 420, category: 'Rings', material: 'Gold', badge: 'New', sizes: ['S', 'M', 'L', 'XL'], details: ['Material: 18K White Gold', 'Genuine sapphire and diamonds'], stock: 6, isFeatured: true },
  { name: 'Gold Band Ring', description: 'A classic 18K gold band ring, perfect on its own or stacked.', price: 150, category: 'Rings', material: 'Gold', badge: '', sizes: ['XS', 'S', 'M', 'L', 'XL'], details: ['Material: 18K Gold'], stock: 20 },
  { name: 'Emerald Statement Ring', description: 'A bold emerald statement ring set in yellow gold.', price: 380, category: 'Rings', material: 'Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: 14K Yellow Gold', 'Genuine emerald'], stock: 7 },
  { name: 'Silver Stackable Ring', description: 'A set of minimalist sterling silver stackable rings.', price: 70, category: 'Rings', material: 'Silver', badge: 'Sale', sizes: ['XS', 'S', 'M', 'L'], details: ['Material: 925 Sterling Silver', 'Set of 3 rings'], stock: 28 },
  { name: 'Pearl Cocktail Ring', description: 'An elegant cocktail ring featuring a lustrous centre pearl.', price: 160, category: 'Rings', material: 'Rose Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Genuine freshwater pearl', 'Rose gold band'], stock: 11 },
  { name: 'Diamond Eternity Ring', description: 'A dazzling eternity ring lined with diamonds all around.', price: 480, category: 'Rings', material: 'Gold', badge: 'Best Seller', sizes: ['S', 'M', 'L', 'XL'], details: ['Material: 18K White Gold', 'Genuine diamonds', 'Certificate included'], stock: 5 },
]

const seedProducts = async () => {
  try {
    await connectDB()          // wait for the connection before any query
    await Product.deleteMany()
    await Product.insertMany(products)
    console.log(`✅ ${products.length} products seeded successfully!`)
    process.exit()
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedProducts()