import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IOrder } from "../models/order.Model";
import userModel from "../models/user.model";
import CourseModel, { ICourse } from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.Model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import { redis } from "../utils/redis";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create order
// export const createOrder = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { courseId, payment_info } = req.body as IOrder;

//       // if (payment_info) {
//       //   if ("id" in payment_info) {
//       //     const paymentIntentId = payment_info.id;
//       //     const paymentIntent = await stripe.paymentIntents.retrieve(
//       //       paymentIntentId
//       //     );

//       //     if (paymentIntent.status !== "succeeded") {
//       //       return next(new ErrorHandler("Payment not authorized!", 400));
//       //     }
//       //   }
//       // }

//       const user = await userModel.findById(req.user?._id);

//       const courseExistInUser = user?.courses.some(
//         (course: any) => course._id.toString() === courseId
//       );

//       if (courseExistInUser) {
//         return next(
//           new ErrorHandler("You have already purchased this course", 400)
//         );
//       }

//       const course:ICourse | null = await CourseModel.findById(courseId);

//       if (!course) {
//         return next(new ErrorHandler("Course not found", 404));
//       }

//       const data: any = {
//         courseId: course._id,
//         userId: user?._id,
//         payment_info,
//       };

//       const mailData = {
//         order: {
//           _id: course._id.toString().slice(0, 6),
//           name: course.name,
//           price: course.price,
//           date: new Date().toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           }),
//         },
//       };

//       const html = await ejs.renderFile(
//         path.join(__dirname, "../mails/order-confirmation.ejs"),
//         { order: mailData }
//       );

//       try {
//         if (user) {
//           await sendMail({
//             email: user.email,
//             subject: "Order Confirmation",
//             template: "order-confirmation.ejs",
//             data: mailData,
//           });
//         }
//       } catch (error: any) {
//         return next(new ErrorHandler(error.message, 500));
//       }

//       user?.courses.push(course?._id);

//       await redis.set(req.user?._id, JSON.stringify(user));

//       await user?.save();

//       await NotificationModel.create({
//         user: user?._id,
//         title: "New Order",
//         message: `You have a new order from ${course?.name}`,
//       });

//       course.purchased = course.purchased + 1;

//       await course.save();

//       newOrder(data, res, next);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.body;  // No payment_info needed anymore

      const user = await userModel.findById(req.user?._id);

      // Check if the course is already in the user's purchased courses list
      const courseExistInUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );

      if (courseExistInUser) {
        return next(
          new ErrorHandler("You have already accessed this course", 400)
        );
      }

      // Find the course by its ID
      const course: ICourse | null = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      // Add course to the user's list of accessed (purchased) courses
      user?.courses.push(course._id);
      await user?.save();
      await redis.set(req.user?._id, JSON.stringify(user));

      // Prepare order data for confirmation email and notification
      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      // Send confirmation email to the user
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Course Access Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      // Create a notification for the new course access
      await NotificationModel.create({
        user: user?._id,
        title: "New Course Accessed",
        message: `You have accessed the course: ${course.name}`,
      });

      // Increment the course's access count (purchased)
      course.purchased += 1;
      await course.save();

      // Record the simulated order (for tracking purposes, if needed)
      const data = {
        courseId: course._id,
        userId: user?._id,
        payment_info: null, // No payment info needed
      };
      newOrder(data, res, next);

      // Respond with success message
      res.status(201).json({
        success: true,
        message: "Course added to your account",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


// get All orders --- only for admin
export const getAllOrders = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//  send stripe publishble key
export const sendStripePublishableKey = CatchAsyncError(
  async (req: Request, res: Response) => {
    res.status(200).json({
      publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  }
);

// new payment
export const newPayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("reached");
    try {
     
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "AUD",
        metadata: {
          company: "E-Learning",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(201).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
