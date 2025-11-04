-- Create Enums
DO $$ BEGIN
    CREATE TYPE "ResonanceLicenseType" AS ENUM ('STARTER', 'PRO', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SyncscriptLicenseType" AS ENUM ('FREE', 'PRO', 'TEAM', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProductType" AS ENUM ('RESONANCE', 'SYNCSCRIPT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LicenseType" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'TRIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP,
    name TEXT,
    "passwordHash" TEXT NOT NULL,
    image TEXT,
    "mfaEnabled" BOOLEAN DEFAULT false,
    "mfaSecret" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "deletedAt" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");

-- Session table
CREATE TABLE IF NOT EXISTS "Session" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_sessionToken_idx" ON "Session"("sessionToken");

-- Account table
CREATE TABLE IF NOT EXISTS "Account" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    scope TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    UNIQUE(provider, "providerAccountId")
);

CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

-- VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- RefreshToken table
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    token TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    jti TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "revokedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_jti_idx" ON "RefreshToken"(jti);
CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"(token);

-- BackupCode table
CREATE TABLE IF NOT EXISTS "BackupCode" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "codeHash" TEXT NOT NULL,
    used BOOLEAN DEFAULT false,
    "usedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "BackupCode_userId_idx" ON "BackupCode"("userId");

-- License table
CREATE TABLE IF NOT EXISTS "License" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "stripeCustomerId" TEXT UNIQUE,
    "stripeSubscriptionId" TEXT UNIQUE,
    "stripePriceId" TEXT,
    "stripeProductId" TEXT,
    "productType" "ProductType" DEFAULT 'RESONANCE',
    "resonanceType" "ResonanceLicenseType",
    "syncscriptType" "SyncscriptLicenseType",
    type "LicenseType",
    status "LicenseStatus" DEFAULT 'TRIAL',
    "currentPeriodStart" TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP,
    "trialEndsAt" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "License_userId_idx" ON "License"("userId");
CREATE INDEX IF NOT EXISTS "License_stripeCustomerId_idx" ON "License"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "License_stripeSubscriptionId_idx" ON "License"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "License_status_idx" ON "License"(status);

-- Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "licenseId" TEXT REFERENCES "License"(id),
    "stripePaymentIntentId" TEXT UNIQUE,
    "stripeInvoiceId" TEXT UNIQUE,
    "stripeChargeId" TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");
CREATE INDEX IF NOT EXISTS "Payment_stripeInvoiceId_idx" ON "Payment"("stripeInvoiceId");

-- WebhookEvent table
CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "eventId" TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    "processedAt" TIMESTAMP,
    "errorMessage" TEXT,
    payload JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "WebhookEvent_eventId_idx" ON "WebhookEvent"("eventId");
CREATE INDEX IF NOT EXISTS "WebhookEvent_type_idx" ON "WebhookEvent"(type);
CREATE INDEX IF NOT EXISTS "WebhookEvent_processed_idx" ON "WebhookEvent"(processed);

-- UserMetric table
CREATE TABLE IF NOT EXISTS "UserMetric" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "UserMetric_userId_idx" ON "UserMetric"("userId");
CREATE INDEX IF NOT EXISTS "UserMetric_timestamp_idx" ON "UserMetric"(timestamp);

