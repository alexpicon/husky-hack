## Read Me
| Husky Hack Sample Data Dictionary - v2 |
| --- |
| Purpose: support student prototypes for “Stop the Scam Before the Money Moves.” |
| All people, events, values, outcomes, and identifiers are fictional and synthetic. |
|  |
| Files |
| HuskyHack\_Synthetic\_Events\_v2.csv - 7,471 events for 118 fictional members, 2026-08-31 to 2026-10-30. Contains only what Sound could observe at the time of each event. |
| HuskyHack\_Member\_Key\_v2.csv - one row per member: what was really happening, the outcome, and dollars attempted / sent / prevented / recovered. Use it to check your design, not as a trigger. |
|  |
| How to use |
| 1. Start with an anchor persona: M1001 Linda, M1002 Michael, M1003 Sarah, M1004 James. Filter the events file by synthetic\_member\_id; rows are already in time order. |
| 2. Follow a single payment with payment\_id to see where it could have been paused. |
| 3. Test your trigger on the 20 legitimate look-alikes (Member Key: is\_legitimate\_lookalike = Yes). If it fires on them, design the low-friction path they experience. |
| 4. Triggers may use only fields marked 'Yes' under Observable at Decision Time. The Member Key is the answer key. |
|  |
| Limits |
| The data is designed for exploration and prototyping, not for production fraud modeling or statistical benchmarking. 41% of members are scam victims by design; real prevalence is far lower, so false positives matter far more in practice than this file suggests. |
| Do not infer that a field is currently available in real time at Sound. The Starter Kit's Capability Assumptions section says what teams may assume for this challenge. |
| Teams should explain how false positives, member consent, accessibility, escalation, and recovery are handled. |
| Color key on the dictionary sheets: green = new in v2; yellow = revised; red = removed or moved. |
| Synthetic-data governance reference: https://csrc.nist.gov/pubs/sp/800/188/final |

## Data Dictionary
| Field Name | Data Type | Definition | Example | Observable at Decision Time? | Useful for Prototype? | v2 Change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| event\_id | Text | Unique synthetic event record ID | E00001 | Yes | Reference only | Unchanged |  |
| synthetic\_member\_id | Text | Fictional member ID; joins to the Member Key | M1001 | Yes | Yes - group a journey | Revised | M1001-M1004 are the four anchor personas (Linda, Michael, Sarah, James). v1 marked this 'No'. |
| event\_sequence | Integer | Order of the event within the member's timeline (1 = earliest) | 37 | Yes | Yes - replay a journey | New | Rows are already sorted by member, then time. |
| event\_timestamp | DateTime | Fictional date and time of the event (Pacific) | 2026-10-20 14:11:00 | Yes | Yes - timing, clustering, after-hours | Revised | v1 marked this 'No' even though the kit tells teams to sort by it. Window: 2026-08-31 to 2026-10-30. Branch events fall in branch hours; Contact Center events 7am-8pm. |
| day\_of\_week | Text | Day of week of the event | Tue | Yes | Yes - staffing and hold timing | New | Useful for showing that a hold placed Friday night may not be reviewed until Monday. |
| event\_category | Category | Group the event type belongs to | Money Movement | Yes | Yes - filtering | New | See Allowed Values. |
| event\_type | Category | Activity represented by the record | Payment Initiated | Yes | Yes | Revised | Controlled list of 37 values (see Allowed Values). Each type has fixed rules: e.g. Login never carries an amount; Debit Purchase is always Debit Card. |
| channel | Category | Where the event happened | Branch | Yes | Yes | Revised | Adds ATM/Card (card and ATM activity) and Back Office (system or fraud-operations actions with no member-facing channel). |
| payment\_id | Text | Links every row about the same payment (initiated, warned, held, released, cancelled, recovered) | P1001-014 | Yes | Yes - follow a payment's life | New | Blank for events not tied to a payment. |
| payment\_rail | Category | Payment method for the linked payment | Wire | Yes | Yes | Revised | 'Not Applicable' when no payment is involved (v1 put rails on logins and alerts). |
| amount | Currency | Dollar amount of the linked payment or deposit; 0.00 when none | 8500.00 | Yes | Yes | Revised | Every row about the same payment carries the same amount. Funds Recovered rows carry the amount returned. |
| transaction\_direction | Category | Direction of funds | Outgoing | Yes | Yes | Revised | Adds Incoming (paychecks, benefits, recovered funds). |
| recipient\_id | Text | ID of the payee/recipient | R1001-12 | Yes | Yes - repeat payments to same payee | New | Blank when no recipient applies (e.g. cash). |
| recipient\_status | Category | New = recipient added 30 days ago or less; Existing = older | New | Yes | Yes | Revised | Now derived from recipient\_age\_days, so the two always agree. |
| recipient\_age\_days | Integer | Days since the recipient was added | 2 | Yes | Yes | Revised | v1 marked this 'No'; it is the core new-recipient signal. |
| days\_since\_last\_same\_rail | Integer | Days since the member last completed an outgoing payment on the same rail; blank = no prior use on record | 2411 | Yes | Yes - 'first wire in years' | New | Replaces the kit's promised 'transaction history comparisons'. Includes history from before the data window. |
| amount\_to\_baseline\_ratio | Decimal | Payment amount divided by the member's 12-month 90th-percentile outgoing payment | 5.12 | Yes | Yes - set your own thresholds | New | Blank for rows without an outgoing payment. |
| amount\_vs\_member\_baseline | Category | Band of amount\_to\_baseline\_ratio: Typical <= 1.5x; Above Typical <= 4x; Significantly Above Typical > 4x | Significantly Above Typical | Yes | Yes | Revised | Now computed, not random. v1 labeled $150 debit purchases 'Significantly Above' and $11K scam wires 'Typical'. |
| payment\_velocity\_band | Category | Number of non-card payments the member initiated in the trailing 7 days, relative to their usual weekly count | High | Yes | Yes | Revised | Low <= usual+1; Medium <= usual+3; High above that. 'Not Applicable' for rows without an outgoing payment. |
| available\_balance\_after | Currency | Member's available balance after the event (completed transactions only) | 21450.18 | Yes | Yes - share of balance at risk | New | Lets teams see an account being drained. |
| profile\_change\_recent | Yes/No | Yes if an email, phone, or address change occurred in the 30 days up to and including this event | Yes | Yes | Yes | Revised | Now computed in time order. v1 flagged changes before they happened. |
| password\_reset\_recent | Yes/No | Yes if a password reset occurred in the 7 days up to and including this event | Yes | Yes | Yes | Revised | Now computed in time order. Does not include device intelligence. |
| trusted\_contact\_enrolled | Yes/No | Whether the member has a trusted contact on file at the time of the event | No | Yes | Yes | Revised | Changes to Yes after a Trusted Contact Enrolled event. A trusted contact has no account authority. |
| warning\_displayed | Yes/No | Yes only on Warning Displayed rows | Yes | Yes | Yes | Revised | Teams should improve beyond a generic warning; see event\_note for the warning type shown. |
| member\_response | Category | What the member did when asked or warned | Confirmed Intended | Yes | Yes | New (replaces member\_confirmed) | Confirmed Intended; Cancelled Payment; Reported Not Me; Requested Help; Accepted Offer; Declined Offer; Not Asked. |
| employee\_interaction | Yes/No | Whether an employee took part in this event | Yes | Yes | Yes | Revised | Branch, Contact Center, or back-office fraud staff. |
| case\_open | Yes/No | Whether the member has an open fraud/scam case at the time of the event | Yes | Yes | Yes | Revised (was case\_opened) | Yes from Case Created until Case Closed. A case does not imply a confirmed fraud decision. |
| payment\_status | Category | Status of the linked payment after this event | Held | Yes | Yes | Revised | Pending, Held, Completed, Cancelled by Member, Stopped by Sound, Not Applicable. v1 never used Held and marked every initiated payment Completed. |
| event\_note | Text | Short plain-English context for scripted events (e.g. what an employee asked, where a confirmation was sent) | Text sent to the phone number on file BEFORE the change | Partly | Yes - storytelling | New | Human-observed context, not a machine signal. Blank for routine events. |
| scenario\_type | Category | (Removed from events file) |  | No - label | Use Member Key | Moved to Member Key | Constant per member, so it gave away the answer. Now in HuskyHack\_Member\_Key\_v2.csv. |
| outcome\_status | Category | (Removed from events file) |  | No - label | Use Member Key | Moved to Member Key | v1 mixed event status and scenario outcome. Replaced by journey\_outcome and dollar fields in the Member Key. |
| intervention\_candidate | Text | (Removed from events file) |  | No - label | Use Member Key | Moved to Member Key | Constant per scenario, so it gave away the answer. |
| member\_confirmed | Category | (Replaced) |  |  |  | Removed | Replaced by member\_response. v1 followed a fixed row-position pattern (rows 1-4 Not Asked, 5-10 No). |

## Member Key
| Field Name | Data Type | Definition | Example | v2 Change | Notes |
| --- | --- | --- | --- | --- | --- |
| synthetic\_member\_id | Text | Joins to the events file | M1001 | New file |  |
| anchor\_persona | Text | Starter-kit persona this member represents, if any | Linda | New file | M1001 Linda, M1002 Michael, M1003 Sarah, M1004 James. |
| scenario\_type | Category | What was really happening to this member | Family Emergency | Moved from events | Normal Activity includes both routine members and legitimate look-alikes. |
| scenario\_subtype | Category | More specific story | Home purchase closing wire | New | See Allowed Values. |
| is\_legitimate\_lookalike | Yes/No | Legitimate member whose activity resembles a scam or takeover | Yes | New | Use these 20 members to design and demo the false-positive path. |
| journey\_summary | Text | One-sentence story of the journey |  | New |  |
| incident\_start | DateTime | First event of the scam or takeover; blank for Normal Activity |  | New |  |
| first\_intervention | DateTime | First hold, confirmation, escalation, outreach, or restriction after the incident started |  | New | Compare with incident\_start for time to intervention. |
| journey\_outcome | Category | Result for the member | Partial Loss | Moved from events (redefined) | See Allowed Values. |
| scam\_payment\_ids | Text | Semicolon-separated payment\_ids that were part of the scam/takeover | P1001-061;P1001-062 | New | Payment-level ground truth. |
| dollars\_attempted | Currency | Total of scam payments initiated | 12750.00 | New |  |
| dollars\_sent | Currency | Scam payments that completed | 8500.00 | New |  |
| dollars\_prevented | Currency | Scam payments cancelled or stopped before completion | 4250.00 | New |  |
| dollars\_recovered | Currency | Funds returned after recovery requests | 0.00 | New |  |
| net\_member\_loss | Currency | dollars\_sent minus dollars\_recovered | 8500.00 | New | Synthetic only - do not report as a real-world loss figure. |
| intervention\_candidate | Text | Suggested design opportunity for this journey |  | Moved from events | A prompt for ideation, not a prescribed control. |

## Allowed Values
| Field | Allowed Values | Design Note |
| --- | --- | --- |
| scenario\_type (Member Key) | Family Emergency; Romance / Investment; Sound Impersonation + ATO; Tech Support / Government Impersonation; Normal Activity | Normal Activity covers 50 routine members and 20 legitimate look-alikes. |
| scenario\_subtype (Member Key) | Routine; Home purchase closing wire; Real password reset and move; Vehicle purchase cash withdrawal; Helping a real family member; Funding a new brokerage account; New contractor payments; Grandparent / fake attorney; Online partner / crypto 'investment'; Fake Sound text / credential phish; Federal investigation |  |
| journey\_outcome (Member Key) | Legitimate - No Friction; Legitimate - Confirmation Step; Legitimate - False Positive (Held); Prevented; Partial Loss; Partial Loss - Recovery Initiated; Loss; Loss - Partially Recovered | Replaces v1 outcome\_status. |
| event\_category | Authentication; Profile; Recipient; Money Movement; Intervention; Interaction; Trusted Contact; Case & Recovery | New. |
| event\_type - Authentication | Login; Failed Login; Password Reset; One-Time Code Sent | v1 had no allowed-values list for event\_type. |
| event\_type - Profile | Email Change; Phone Change; Address Change; Profile Change Alert Sent |  |
| event\_type - Recipient | Recipient Added |  |
| event\_type - Money Movement | Deposit; Debit Purchase; ATM Withdrawal; Bill Payment; Automatic Payment; Payment Initiated; Payment Completed; Payment Held; Payment Released; Payment Cancelled; Payment Stopped | Payment Initiated always starts as Pending. Released = completed after a hold. |
| event\_type - Intervention | Warning Displayed; Confirmation Requested; Employee Outreach; Employee Escalation; Account Restricted; Access Restored |  |
| event\_type - Interaction | Branch Visit; Contact Center Call |  |
| event\_type - Trusted Contact | Trusted Contact Offered; Trusted Contact Enrolled; Trusted Contact Notified | Notified = member chose to involve an already-enrolled contact. |
| event\_type - Case & Recovery | Scam Reported; Case Created; Case Closed; Recovery Request; Funds Recovered; Recovery Unsuccessful |  |
| channel | Mobile; Online Banking; Branch; Contact Center; ATM/Card; Back Office | ATM/Card and Back Office are new. |
| payment\_rail | Debit Card; ACH; Bill Pay; P2P; External Transfer; Wire; Cash; Not Applicable | Not Applicable is new. |
| transaction\_direction | Outgoing; Incoming; Not Applicable | Incoming is new. |
| recipient\_status | New; Existing; Not Applicable | New = 30 days or less. |
| payment\_velocity\_band | Low; Medium; High; Not Applicable |  |
| amount\_vs\_member\_baseline | Typical; Above Typical; Significantly Above Typical; Not Applicable | Cut-offs: 1.5x and 4x the member's 12-month 90th percentile. |
| member\_response | Confirmed Intended; Cancelled Payment; Reported Not Me; Requested Help; Accepted Offer; Declined Offer; Not Asked | Replaces member\_confirmed. |
| payment\_status | Pending; Held; Completed; Cancelled by Member; Stopped by Sound; Not Applicable | Cancelled by Member for authorized scams (the member decides); Stopped by Sound for account takeover (not the member's payment). |

## Change Log
| Area | What Changed in v2 | Why |
| --- | --- | --- |
| Structure | Split into two files: Events (what Sound could observe at the time) and Member Key (answer key). scenario\_type, outcome and intervention\_candidate moved out of the events file. | v1 fields were constant per member, so teams could 'detect' fraud perfectly from a label. |
| Population | 118 members (v1: 100): 50 routine, 20 legitimate look-alikes, 12 per scam type. 7,471 events over 61 days (v1: exactly 10 per member over 8 days). | v1 had no legitimate member who looked risky, so the required false-positive path could not be shown from data. |
| Legitimate look-alikes | New: home-closing wires, real password reset + move, vehicle cash purchase, real family help, new brokerage funding, new contractor. Some are held and released (false positives). | Supports the False-Positive path and Trust & Accessibility (20%). |
| Routine noise | 25% of routine members add a new P2P payee; 10% reset a forgotten password. | Routine members are no longer a perfectly clean class. |
| Payment lifecycle | Payments now move Pending -> (Warning / Confirmation / Held) -> Completed, Released, Cancelled, or Stopped, linked by payment\_id. | v1 never used Held and marked every initiated payment Completed, so the 'before the money moves' moment did not exist. |
| Outcomes | Outcomes vary: 15 of 48 scam journeys fully prevented, others partial loss, loss, or recovered. | In v1 every scam member ended in a loss. |
| Time order | All flags are computed from events in time order; rows are sorted; event\_sequence added. | v1 flagged password resets and profile changes before they occurred and had payments before recipients were added. |
| Field coherence | Each event type has fixed rules (logins have no amount; debit purchases are Debit Card; branch events in branch hours). | v1 had 111 logins with dollar amounts, debit purchases on ACH, and branch events at 3am. |
| Baseline / history | amount\_vs\_member\_baseline computed from a ratio; new days\_since\_last\_same\_rail and amount\_to\_baseline\_ratio. | v1 baseline band was random; 'first wire in years' could not be shown. |
| Persona anchors | M1001 Linda (Family Emergency, $8,500 wire), M1002 Michael (Romance: P2P grows, shifts to wires), M1003 Sarah (ATO), M1004 James (Government impersonation). | v1 personas did not map to any record. |
| Account takeover realism | Real member's digital activity stops during takeover; confirmation can go to pre-change contact info; alert goes to old email. | Makes the ATO design problem (phished OTP, changed contact info) visible. |
| Balances and incoming funds | available\_balance\_after and Incoming direction added. | v1 had no balance and only outgoing funds. |
| Encoding | UTF-8 without byte-order mark. | v1 header read as '\ufeffevent\_id' in some tools. |
| Reproducibility | generate\_huskyhack\_data.py (seed 2026) and validate.py included. | Organizers can regenerate or tune the data. |
