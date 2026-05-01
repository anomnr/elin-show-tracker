-- CreateTable
CREATE TABLE "Show" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tanggal" DATETIME NOT NULL,
    "tipe" TEXT NOT NULL,
    "setlist" TEXT NOT NULL,
    "ref_code" TEXT NOT NULL,
    "member_name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Show_tanggal_setlist_key" ON "Show"("tanggal", "setlist");
