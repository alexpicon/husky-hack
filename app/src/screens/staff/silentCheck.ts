/** What the member can tap on the silent check, and the scam pattern those taps match. */
export const silentTaps = [
  'Someone called about a family member in trouble',
  'A lawyer or official is involved',
  'I was told to keep this secret',
  "It's for bail or a fine",
]

export const grandparentScam = {
  name: 'Grandparent scam',
  script: [
    "Thank you for checking with us. You haven't done anything wrong.",
    "Some of what you shared is how a common scam works. Real lawyers don't ask families to keep bail a secret.",
    'Would you like to call your grandson on the number you have saved? The wire stays on hold while you do.',
  ],
}
