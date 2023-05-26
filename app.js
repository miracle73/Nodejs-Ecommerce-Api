require('dotenv').config()
require('express-async-errors')

// express
const express = require('express')
const app = express()

// other packages
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary').v2
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')



// database
const connectDB = require('./db/connect')

//middleware
const { authenticationMiddleware } = require('./middleware/authentication')
const notFound = require('./middleware/not-found')
const errorHandler = require('./middleware/error-handler')

//routes
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')


// using the packages
// app.use(morgan('tiny'))
app.use(cookieParser(process.env.TOKEN_SECRET))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('./public'))
app.use(fileUpload())
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in one hour'
})
app.set('trust proxy', 1)
app.use('api', limiter)
app.use(helmet())
app.use(mongoSanitize())
app.use(xss())
app.use(cors())
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


app.get('/api/v1', (req, res) => {
    res.send("This is the Home Page")
})
app.use('/api/v1', authRouter)
app.use('/api/v1/users', authenticationMiddleware, userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', authenticationMiddleware, orderRouter)
app.use(notFound)
app.use(errorHandler)
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(5000, () => {
            console.log('Server is listening on port 5000')
        })
    } catch (error) {
        console.log(error)
    }

}
start()