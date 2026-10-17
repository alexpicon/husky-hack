**STOP THE SCAM BEFORE THE MONEY MOVES**

**Synthetic Starter Kit**

|  |
| --- |
| **Purpose:** Use fictional member (consumer) journeys and synthetic event data to design a practical intervention that prevents financial harm while preserving dignity, autonomy, accessibility, and trust. |

**How to Use This Kit**

Choose one scenario, map the journey, identify the observable moment of risk, and prototype what the member, employee, or trusted contact experiences. You may combine scenarios, but your submission should clearly state its primary use case.

**What the Data Is**

The events file contains 7,471 fictional event records for 118 synthetic members from August 31 to October 30, 2026: 50 routine members, 20 legitimate members whose activity looks risky, and 12 members for each of the four journeys below. A separate Member Key says what was really happening to each member and how it ended. Members M1001–M1004 are Linda, Michael, Sarah, and James. It is intentionally simplified for prototyping and comparison across teams.

**What the Data Is Not**

It is not real Sound member data, a production fraud model, or proof that a transaction is fraudulent. Do not use it to make claims about actual fraud rates, losses, member behavior, or model accuracy. About 41% of the synthetic members are scam victims by design. In real life the share is far smaller, so false positives matter even more than this data suggests.

**Design Principles**

* Intervene at a specific moment, not just with general education.
* Show a low-friction path for legitimate activity and false positives.
* Use only the data necessary for the intervention.
* Keep trusted-contact enrollment voluntary, revocable, and member-directed.
* Plan for the trusted contact, relative, or caregiver being part of the problem: a trusted contact is informed, never given control.
* Respect autonomy: for a member’s own payment, Sound can pause and advise, but the member decides.
* Include rapid reporting and recovery when prevention fails.

**FOUR FICTIONAL MEMBER JOURNEYS**

*Vulnerability is situational. It may arise from urgency, fear, isolation, grief, financial stress, limited digital experience, language barriers, cognitive challenges, or misplaced trust.*

|  |
| --- |
| **1. Family Emergency Scam**  Linda, a retired teacher and long-time member, receives an urgent call from someone claiming to be her grandson. A second caller poses as an attorney. She is told to keep the situation secret and attempts an $8,500 wire.  **Signals:** First wire in years; new destination; urgent behavior; story changes when questioned.  **Design opportunities:** Employee conversation, independent verification, optional trusted contact, payment pause, rapid escalation.  **In the data:** M1001. First wire in 6+ years; she overrides a hold, and a next-day cash request is stopped. |

|  |
| --- |
| **2. Romance / Investment Scam**  Michael, a widower and regular digital-banking user, develops an online relationship. Small P2P transfers grow in frequency and size, then shift to wires and “investment” payments.  **Signals:** New recipient; pattern growth; multiple rails; continued payments after warnings.  **Design opportunities:** Recipient setup, contextual warning, human outreach, support without blame, recovery help.  **In the data:** M1002. Four growing P2P payments, then first-ever wires ($1,500 to $3,840) through warnings. |

|  |
| --- |
| **3. Sound Impersonation + Account Takeover**  Sarah receives a text appearing to come from Sound. She enters credentials and a one-time code on a fake site. The fraudster resets access, changes contact information, adds a recipient, and initiates transfers.  **Signals:** Password reset; profile change; new recipient; clustered activity; payment attempt.  **Design opportunities:** Secure confirmation, temporary pause, human review, account recovery, case creation. **Constraint:** the fraudster has the code and controls the new email and phone, so confirmations sent there reach the fraudster.  **In the data:** M1003; loss reported two days later. |

|  |
| --- |
| **4. Tech Support / Government Impersonation**  James is told his identity is linked to a federal investigation. He is instructed to move money immediately and not discuss the matter. He attempts a large withdrawal or wire.  **Signals:** Unusual amount; urgency and secrecy; new payment behavior; assisted-channel interaction.  **Design opportunities:** Pause, scam-specific questions, trusted-contact option, employee escalation, recovery request.  **In the data:** M1004. Asks about cash limits, then tries a $7,000 branch withdrawal; a pause stops it. |

**REALISTIC DESIGN ENVIRONMENT**

Teams may design for a member-facing experience, an employee workflow, or both.

**You May Assume Sound Can Use**

* Payment amount, timing, channel, rail, status, and transaction history comparisons, including held payments and account balances.
* New-recipient indicators and recent member profile or password-reset events.
* Mobile, online banking, branch, and Contact Center interactions.
* Member notifications, employee outreach, human review, case escalation, and recovery workflows.
* Voluntary trusted-contact enrollment and member-directed outreach.

**Capability Assumptions for This Challenge**

Design to these assumptions so every team is judged on the same footing.

* **Holds:** Sound can pause an outgoing wire, external transfer, or ACH payment before it is sent for up to 4 hours while it contacts the member.
* **P2P:** P2P payments cannot be recalled once sent. Any pause must happen before the member submits.
* **Cash:** Large cash withdrawals happen in a branch with an employee present.
* **Member choice:** For a payment the member authorizes, Sound can delay and advise but the member makes the final decision. For account takeover, Sound can stop the payment.
* **Confirmation:** Sound can send a code or confirmation by text, email, or in-app message to contact details on file, and knows when those details last changed.
* **Recovery:** Wire recalls and ACH returns can be requested but are not guaranteed, and the chance falls the longer a scam goes unreported.
* **Trusted contacts:** Sound does not offer trusted-contact enrollment today. Teams may assume Sound could launch it.

**Do Not Assume Access To**

* Device intelligence, behavioral biometrics, or voice-cloning detection.
* Voice analysis, telecom-carrier data, or third-party fraud-consortium feeds.
* A member’s personal text messages, email, calls, browser history, or social-media activity, or device activity.
* Perfect knowledge that activity is fraudulent.

**Your Prototype Should Show**

* The signal or combination of signals that starts the experience.
* The intervention and why it occurs at that moment.
* What the member sees and what an employee sees.
* What happens if the member confirms the transaction is legitimate, and how long it takes.
* How the member reports a scam or starts recovery.
* How Sound could test the idea in a 90-day pilot.

**USING THE SYNTHETIC DATA**

**Start with a journey**

Start with an anchor persona (M1001–M1004) or pick a journey from the Member Key, then filter the events file by synthetic\_member\_id. Rows are already in time order. Use payment\_id to follow one payment from start to finish.

**Find intervention points**

Look for combinations such as a recent password reset plus a new recipient, an unusually large payment, repeated payments that grow over time, or assisted-channel interactions. Then run the same trigger on the 20 legitimate look-alike members (is\_legitimate\_lookalike = Yes). Every look-alike your trigger catches needs a fast, respectful way through.

**Design the action**

A risk indicator is not the solution. Show the next best action: contextual message, secure confirmation, short pause, employee outreach, trusted-contact option, case creation, account recovery, or payment-recovery request.

**Test both paths**

Demonstrate the risky path and the legitimate path. Use a real look-alike member from the data for the legitimate path. Explain who can override, appeal, or escalate and what information is retained.

**Measure impact**

Propose member-harm, experience, and operating metrics. Do not calculate real-world fraud performance from the synthetic sample. You may use the Member Key’s dollar fields to show how your design would have changed each synthetic journey, as an illustration, not a forecast. For pilot targets, state your baseline assumptions.

**Suggested Success Measures**

|  |  |  |
| --- | --- | --- |
| **Member Outcomes** | **Experience Outcomes** | **Operating Outcomes** |
| • Dollars of harm prevented  • Scam completion reduced  • Recovery initiated sooner | • Warning completion  • Member satisfaction  • False-positive rate  • Time from hold to release for legitimate members | • Time to intervention  • Employee effort  • Escalation and case quality  • After-hours holds waiting for review |

**Files in the Package**

**•** HuskyHack\_Synthetic\_Starter\_Kit.docx

**•** HuskyHack\_Synthetic\_Events\_v2.csv (observable events)

**•** HuskyHack\_Member\_Key\_v2.csv (answer key: scenario, outcome, dollars)

**•** HuskyHack\_Sample\_Data\_Dictionary\_v2.xlsx

**•** HuskyHack\_2026\_Problem\_Statement.docx

**•** generate\_huskyhack\_data.py and validate.py (optional: regenerate and check the data)

**Data Privacy Note**

All records are synthetic. NIST identifies synthetic data as one possible data-sharing model and advises organizations to define their purpose and evaluate disclosure risk before releasing data. Reference: https://csrc.nist.gov/pubs/sp/800/188/final
