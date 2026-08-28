# API & Service Layer

## Service Modules

```text
property.service.ts
resident.service.ts
household.service.ts
billing.service.ts
payment.service.ts
finance.service.ts
notification.service.ts
complaint.service.ts
maintenance.service.ts
report.service.ts
audit.service.ts
```

## Billing Service

Functions:

```ts
generateMonthlyInvoices()
createInvoiceForProperty()
calculateOutstanding()
markInvoicePaid()
applyWaiver()
closeBillingPeriod()
```

## Payment Service

```ts
submitPayment()
verifyPayment()
rejectPayment()
reversePayment()
allocatePayment()
```

## Finance Service

```ts
recordExpense()
createLedgerEntry()
getCurrentBalance()
getMonthlySummary()
createMonthlySnapshot()
```

## Property Service

```ts
createProperty()
updateProperty()
changeOwner()
startOccupancy()
endOccupancy()
getPropertyTimeline()
```

## Report Service

```ts
getPublicMonthlyReport()
getCommitteeMonthlyReport()
generateMonthlySnapshot()
```

## API Response

Gunakan format konsisten:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Error:

```json
{
  "data": null,
  "error": {
    "code": "PAYMENT_ALREADY_VERIFIED",
    "message": "Pembayaran sudah diverifikasi."
  }
}
```

## Validation

Gunakan Zod pada boundary:
- actions,
- API,
- forms,
- environment.
