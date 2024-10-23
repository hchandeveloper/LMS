import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

// Helper function to create layout data structure
const buildLayoutData = async (type: string, data: any) => {
  switch (type) {
    case "Banner":
      const { image, title, subTitle } = data;
      const uploadData = image.startsWith("https")
        ? { public_id: null, secure_url: image }
        : await cloudinary.v2.uploader.upload(image, { folder: "layout" });
      return {
        type: "Banner",
        banner: {
          image: {
            public_id: uploadData.public_id,
            url: uploadData.secure_url,
          },
          title,
          subTitle,
        },
      };
    case "FAQ":
      return {
        type: "FAQ",
        faq: data.faq.map((item: any) => ({
          question: item.question,
          answer: item.answer,
        })),
      };
    case "Categories":
      return {
        type: "Categories",
        categories: data.categories.map((item: any) => ({
          title: item.title,
        })),
      };
    default:
      throw new Error("Invalid layout type");
  }
};

// create layout
export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    const isTypeExist = await LayoutModel.findOne({ type });
    if (isTypeExist) {
      return next(new ErrorHandler(`${type} already exists`, 400));
    }
    try {
      const layoutData = await buildLayoutData(type, req.body);
      await LayoutModel.create(layoutData);
      res.status(201).json({ success: true, message: "Layout created successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Edit layout
export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    try {
      let layout = await LayoutModel.findOne({ type });
      
      // If layout doesn't exist, create a new one
      if (!layout) {
        const layoutData = await buildLayoutData(type, req.body);
        layout = await LayoutModel.create(layoutData);
        return res.status(201).json({ success: true, message: "Layout created successfully" });
      }
      
      // Prepare update data based on type
      const updateData = await buildLayoutData(type, req.body);

      // Use $set to update only specific fields
      await LayoutModel.findByIdAndUpdate(layout._id, { $set: updateData });
      res.status(200).json({ success: true, message: "Layout updated successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get layout by type
export const getLayoutByType = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.params;
    try {
      const layout = await LayoutModel.findOne({ type });
      if (!layout) {
        return next(new ErrorHandler(`${type} layout not found`, 404));
      }
      res.status(200).json({ success: true, layout });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
