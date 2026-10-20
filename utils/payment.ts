export interface PaymentAmounts {
  totalPrice: number;
  depositAmount: number;
  balanceAmount: number;
  dinnerTotal: number;
}

/**
 * คำนวณยอดชำระเงิน
 * - ค่าที่พักรวมกิจกรรมตั้งแต่ 4,000 บาทขึ้นไป: มัดจำ 50%
 * - ต่ำกว่า 4,000 บาท: ชำระเต็มจำนวน
 * - ค่าอาหารไม่รวมในการคำนวณมัดจำ
 */
export function calculatePaymentAmounts(
  totalPrice: number,
  dinnerTotal: number = 0,
): PaymentAmounts {
  const safeTotalPrice = Math.max(0, Number(totalPrice) || 0);
  const safeDinnerTotal = Math.max(0, Number(dinnerTotal) || 0);

  const depositAmount =
    safeTotalPrice >= 4000
      ? Math.ceil(safeTotalPrice / 2)
      : safeTotalPrice;

  const balanceAmount = safeTotalPrice - depositAmount;

  return {
    totalPrice: safeTotalPrice,
    depositAmount,
    balanceAmount,
    dinnerTotal: safeDinnerTotal,
  };
}