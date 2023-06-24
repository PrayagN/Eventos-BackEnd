require("dotenv").config();
const dayjs = require("dayjs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Organizer = require("../models/organizerModel");
// const User = require("../models/userModel");
const BookedEvents = require("../models/bookedEventsModel");

module.exports = {
  checkoutPayment: async (req, res, next) => {
    try {
      const user_id = req.decoded.id;
      const { guests, selectedDate, organizer_id } = req.body;
      let date = new Date(selectedDate);
      date.setDate(date.getDate() + 1); // Add one day to the selected date

      console.log(date, "selectedDate");
      const organizer = await Organizer.findById(organizer_id);
      const total = guests * organizer.budget;
      const advance = (total * organizer.advance) / 100;
      if (organizer) {
        const newOrder = new BookedEvents({
          totalAmount: total,
          advanceAmount: advance,
          organizer: organizer_id,
          client: user_id,
          guests: guests,
          eventScheduled: date,
          bookedDate: new Date(),
          payment: "Advance Only",
        });

        newOrder.save().then(async (order) => {
          const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                price_data: {
                  currency: "inr",
                  product_data: {
                    name: "Event Advance Payment",
                  },
                  unit_amount: advance * 100,
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            billing_address_collection: "auto",
            success_url: `${process.env.SERVER_URL}/verifyPayment/${order._id}/${organizer_id}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.SERVER_URL}/cancelPayment/${order._id}`,
          });

          res.status(200).json({ url: session.url });
        });
      } else {
        res.redirect(
          `${process.env.CLIENT_URL}/organizers/view/${organizer_id}`
        );
      }
    } catch (error) {
      next(error);
    }
  },
  verifyPayment: async (req, res, next) => {
    try {
      const order_id = req.params.order_id;
      const order = await BookedEvents.findById(order_id);
      const session_id = req.query.session_id;

      if (order) {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const payment_id = session.payment_intent;
        order.paymentIntentId = payment_id;
        await order.save();
        await Organizer.findByIdAndUpdate(order.organizer, {
          $push: { bookedEvents: order._id },
        });
        BookedEvents.findByIdAndUpdate(order_id, {
          $set: { status: true },
        }).then((response) => {
          res.redirect(`${process.env.CLIENT_URL}/paymentSuccess`);
        });
      } else {
        res.redirect(
          `${process.env.CLIENT_URL}/cancelPayment/${order.organizer_id}`
        );
      }
    } catch (error) {
      next(error);
    }
  },
  cancelPayment: async (req, res, next) => {
    try {
      const order_id = req.params.order_id;
      const order = await BookedEvents.findById(order_id);
      BookedEvents.findByIdAndDelete(order_id).then((response) => {
        res.redirect(`${process.env.CLIENT_URL}/organizers/`);
      });
    } catch (error) {
      next(error);
    }
  },
};
