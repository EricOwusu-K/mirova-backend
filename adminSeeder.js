const dotenv = require('dotenv')
const mongoose = require('mongoose')
const User = require('./models/User')

dotenv.config()

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected!')

    const admin = await User.findOne({ role: 'admin' })

    if (admin) {
      admin.name = 'Mirova Admin'
      admin.email = 'mirova.jewelleryy@gmail.com'
      admin.password = 'Swift.mirova79'
      admin.phone = '055 906 4813'
      admin.isVerified = true
      await admin.save()
      console.log('✅ Admin credentials successfully updated!')
      console.log('Email: mirova.jewelleryy@gmail.com')
      console.log('Password: Swift.mirova79')
    } else {
      await User.create({
        name: 'Mirova Admin',
        email: 'mirova.jewelleryy@gmail.com',
        password: 'Swift.mirova79',
        phone: '055 906 4813',
        role: 'admin',
        isVerified: true,
      })
      console.log('✅ Admin account successfully created!')
      console.log('Email: mirova.jewelleryy@gmail.com')
      console.log('Password: Swift.mirova79')
    }

    process.exit()
  } catch (error) {
    console.error('❌ Failed to create admin:', error)
    process.exit(1)
  }
}

createAdmin()