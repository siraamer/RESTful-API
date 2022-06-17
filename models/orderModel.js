const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'order must be belong to User!'],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
        },
        color: String,
        quantity: Number,
        price: Number,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },

    shippingAddress: {
      details: String,
      city: String,
      postalCode: String,
      phone: String,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
      default: 0,
    },
    paymentMethodType: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email profileImg phone',
  }).populate({
    path: 'cartItems.product',
    select: 'title imageCover',
  });
  next();
});

module.exports = mongoose.model('Order', orderSchema);
