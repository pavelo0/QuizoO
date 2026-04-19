-- Custom profile avatar: MIME type set when user uploads an image; file stored on disk as uploads/avatars/<userId>.
ALTER TABLE "users" ADD COLUMN "avatarMime" TEXT;
