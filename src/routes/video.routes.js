import { Router } from "express";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//  Public routes
router.route("/").get(getAllVideos);
router.route("/:id").get(getVideoById);

//  Protected routes
router
  .route("/upload")
  .post(
    verifyJWT,
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    uploadVideo
  );

router
  .route("/:id")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo)
  .delete(verifyJWT, deleteVideo);

export default router;
