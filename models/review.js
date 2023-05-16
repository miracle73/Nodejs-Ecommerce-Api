const mongoose = require('mongoose')
const validator = require('validator')

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'please provide rating'],
        maxlength: 5,
        minlength: 1
    },
    title: {
        type: String,
        required: [true, 'please provide title'],
    },
    comment: {
        type: String,
        maxlength: [100, 'You are not expected to exceed 100 characters']

    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Product',
    }
},
    { timestamps: true })

ReviewSchema.index({ product: 1, user: 1 }, { unique: true })
ReviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 },
            },
        },
    ]);
    console.log(result)

    try {
        await this.model('Product').findOneAndUpdate(
            { _id: productId },
            {
                averageRating: Math.ceil(result[0]?.averageRating || 0),
                numOfReviews: result[0]?.numOfReviews || 0,
            }
        );
    } catch (error) {
        console.log(error);
    }
};

ReviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.pre('findOneAndDelete', async function () {
    console.log('Before findOneAndDelete');
    await this.constructor.calculateAverageRating(this.product);
});


module.exports = mongoose.model('Review', ReviewSchema)