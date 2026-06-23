const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const Product = require('./models/Product')

dotenv.config()
connectDB()

const products = [
  { name: 'Gold Chain Bracelet', description: 'A timeless delicate chain bracelet crafted in 18K gold.', price: 120, category: 'Bracelets', material: 'Gold', badge: 'New', sizes: ['XS', 'S', 'M', 'L'], details: ['Material: 18K Gold', 'Free shipping above $150', '30-day return policy'], stock: 20, isFeatured: true },
  { name: 'Pearl Drop Earrings', description: 'Elegant pearl drop earrings set in sterling silver.', price: 85, category: 'Earrings', material: 'Silver', badge: '', sizes: ['S', 'M'], details: ['Material: Sterling Silver', 'Free shipping above $150'], stock: 15, isFeatured: true },
  { name: 'Diamond Ring', description: 'A stunning diamond ring set in 14K white gold.', price: 340, category: 'Rings', material: 'Gold', badge: 'Best Seller', sizes: ['XS', 'S', 'M', 'L', 'XL'], details: ['Material: 14K White Gold', 'Certificate of authenticity included'], stock: 10, isFeatured: true },
  { name: 'Rose Gold Necklace', description: 'A delicate layered rose gold necklace.', price: 210, category: 'Necklaces', material: 'Rose Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: Rose Gold', '30-day return policy'], stock: 12, isFeatured: true },
  { name: 'Sapphire Stud Earrings', description: 'Beautiful sapphire stud earrings set in white gold.', price: 175, category: 'Earrings', material: 'Gold', badge: '', sizes: ['S', 'M'], details: ['Material: White Gold', 'Genuine sapphire gemstones'], stock: 8 },
  { name: 'Silver Bangle', description: 'A sleek and minimal 925 silver bangle.', price: 65, category: 'Bracelets', material: 'Silver', badge: 'Sale', sizes: ['XS', 'S', 'M', 'L'], details: ['Material: 925 Sterling Silver'], stock: 25 },
  { name: 'Gold Hoop Earrings', description: 'Bold 18K gold hoop earrings that make a statement.', price: 95, category: 'Earrings', material: 'Gold', badge: '', sizes: ['S', 'M', 'L'], details: ['Material: 18K Gold'], stock: 18 },
  { name: 'Diamond Pendant', description: 'A fine diamond pendant in 14K gold.', price: 280, category: 'Necklaces', material: 'Gold', badge: 'New', sizes: ['S', 'M', 'L'], details: ['Material: 14K Gold', 'Genuine diamond'], stock: 7 },
  { name: 'Silver Chain Bracelet', description: 'A delicate 925 silver chain bracelet.', price: 75, category: 'Bracelets', material: 'Silver', badge: '', sizes: ['XS', 'S', 'M'], details: ['Material: 925 Sterling Silver'], stock: 20 },
  { name: 'Rose Gold Ring', description: 'A minimal rose gold ring with a smooth finish.', price: 130, category: 'Rings', material: 'Rose Gold', badge: '', sizes: ['XS', 'S', 'M', 'L', 'XL'], details: ['Material: Rose Gold'], stock: 14 },
  { name: 'Pearl Necklace', description: 'A classic pearl necklace set in sterling silver.', price: 190, category: 'Necklaces', material: 'Silver', badge: 'Best Seller', sizes: ['S', 'M', 'L'], details: ['Material: Sterling Silver', 'Genuine freshwater pearls'], stock: 9 },
  { name: 'Gold Tennis Bracelet', description: 'A luxurious 18K gold tennis bracelet.', price: 450, category: 'Bracelets', material: 'Gold', badge: '', sizes: ['XS', 'S', 'M', 'L'], details: ['Material: 18K Gold', 'Certificate of authenticity included'], stock: 5 },
]

const seedProducts = async () => {
  try {
    await Product.deleteMany()
    await Product.insertMany(products)
    console.log('✅ Products seeded successfully!')
    process.exit()
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedProducts()