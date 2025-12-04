-- CreateTable
CREATE TABLE "Master" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "percentage" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ReferenceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "clientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "shoeType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "services" TEXT NOT NULL,
    "comment" TEXT,
    "price" REAL NOT NULL,
    "masterPrice" REAL NOT NULL,
    "materialPrice" REAL NOT NULL,
    "prepaymentCash" REAL NOT NULL DEFAULT 0,
    "prepaymentTerminal" REAL NOT NULL DEFAULT 0,
    "paymentFullCash" REAL NOT NULL DEFAULT 0,
    "paymentFullTerminal" REAL NOT NULL DEFAULT 0,
    "paymentDate" DATETIME,
    "masterId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Принят в работу',
    CONSTRAINT "Order_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaryLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "masterId" INTEGER NOT NULL,
    "orderId" INTEGER,
    CONSTRAINT "SalaryLog_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "comment" TEXT,
    "responsible" TEXT
);

-- CreateTable
CREATE TABLE "CashTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "relatedEntity" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Master_name_key" ON "Master"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
