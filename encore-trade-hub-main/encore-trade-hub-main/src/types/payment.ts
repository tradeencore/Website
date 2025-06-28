export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}
