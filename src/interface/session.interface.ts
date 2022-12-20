export interface ISession {
  id: string,
  merchantId: string,
  startsAt: string,
  endsAt: string,
  type: "WeekDay" | "WeekEnd"
}