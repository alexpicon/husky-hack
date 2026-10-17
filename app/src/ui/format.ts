const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const money = (n: number) => usd.format(n)

export const clock = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export const day = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

export const minutesBetween = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / 60000)

export const yearsFromDays = (days: number) => Math.floor((days / 365.25) * 10) / 10
