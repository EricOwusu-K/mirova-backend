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
      admin.email = 'owusukofieric79@gmail.com'
      admin.password = 'Swift.eric79'
      admin.phone = '055 906 4813'
      await admin.save()
      console.log('✅ Admin credentials successfully updated!')
      console.log('Email: owusukofieric79@gmail.com')
      console.log('Password: Swift.eric79')
    } else {
      await User.create({
        name: 'Mirova Admin',
        email: 'owusukofieric79@gmail.com',
        password: 'Swift.eric79',
        phone: '055 906 4813',
        role: 'admin',
      })
      console.log('✅ Admin account successfully created!')
      console.log('Email: owusukofieric79@gmail.com')
      console.log('Password: Swift.eric79')
    }

    process.exit()
  } catch (error) {
    console.error('❌ Failed to create admin:', error)
    process.exit(1)
  }
}

createAdmin()