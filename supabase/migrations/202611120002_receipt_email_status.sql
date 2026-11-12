-- Retryable email state for receipt delivery.
ALTER TABLE public.booking_receipts
  ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.booking_receipts'::regclass
      AND conname = 'booking_receipts_email_status_check'
  ) THEN
    ALTER TABLE public.booking_receipts
      ADD CONSTRAINT booking_receipts_email_status_check
      CHECK (email_status IN ('pending', 'sending', 'sent', 'failed'));
  END IF;
END $$;
