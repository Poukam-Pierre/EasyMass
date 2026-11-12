-- Before #151, parish.receiverId cached our own merchant reference instead
-- of NotchPay's recipient id, and transfers now send receiverId as
-- NotchPay's `recipient`, so any such value makes every withdrawal fail.
-- receiverId is only a cache: PaymentService.createOrRetreiveRecipient
-- re-creates the recipient from payoutNumber on the next withdrawal, so
-- clearing every row is safe (correct ids are simply re-created once).
UPDATE "parish" SET "receiverId" = NULL WHERE "receiverId" IS NOT NULL;
