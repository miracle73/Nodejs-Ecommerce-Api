const mongoose = require('mongoose')


const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide the name'],
        trim: true,
        maxlength: [50, 'name cannot be more than 50 characters'],
        minlength: [5, 'name cannot be less than 5 characters']
    },
    price: {
        type: Number,
        required: [true, 'please provide your email'],
        default: 0

    },
    description: {
        type: String,
        required: true,
        maxlength: [100, 'description cannot be more than 100 characters']

    },
    category: {
        type: String,
        required: [true, 'please provide the category'],
        enum: ['office', 'kitchen', 'bedroom'],

    },
    company: {
        type: String,
        required: [true, 'please provide the name of the company'],
        enum: {
            values: ['Mobil', 'Seplat', 'Shell'],
            message: '{VALUE} is not supported'
        },
    },
    colors: {
        type: [String],
        required: true,
        default: ["red"]
    },
    image: {
        type: String,
        required: true,
        default: '/uploads/example.jpg'
    },
    featured: {
        type: Boolean,
        default: false,
    },
    freeShipping: {
        type: Boolean,
        default: false,
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }

},
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    })

ProductSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id',
    justOne: false
})
module.exports = mongoose.model('Product', ProductSchema)