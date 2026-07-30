/*
  Warnings:

  - Changed the type of `totalPrice` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `location` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- Cambiar totalPrice de TEXT a FLOAT, casteando los valores existentes
ALTER TABLE "Booking" ALTER COLUMN "totalPrice" TYPE DOUBLE PRECISION USING "totalPrice"::double precision;

-- Agregar location con default temporal para las filas existentes
ALTER TABLE "Space" ADD COLUMN "location" TEXT NOT NULL DEFAULT  'Sin ubicación';

-- Quitar el default para que futuros inserts lo requieran explícitamente
ALTER TABLE "Space" ALTER COLUMN "location" DROP DEFAULT;