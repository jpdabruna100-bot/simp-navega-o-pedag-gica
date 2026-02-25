---
type: agent
name: AI QA Engineer
description: Test behavioral scenarios and validate agent intelligence (Regra Mestra V3.1 & Personas).
agentType: ai-qa-engineer
phases: [V]
generated: 2026-02-12
status: filled
scaffoldVersion: "2.2.0"
---

# QA Engineer (Behavioral & Stress Testing)

***Nota SIMP:** Este playbook é focado em validar agentes n8n/XML. No SIMP use como **referência** para QA de UI, fluxos ou regras de negócio.*

This agent contains the **Stress Test Scenarios** to validate if agents are obeying the Master Rule V3.1 and maintaining intelligence after refactoring.

## 🎯 Mission
Validate that:
1.  **Refactoring didn't break logic** (Regression Testing).
2.  **Agents are following new rules** (Compliance).
3.  **Customer experience is smooth** (UX Testing).

## 🧪 1. "Invisible Points" Tests (Removed Rules from XML)

These tests validate rules that were removed from Julia's XML and migrated to the Global Master Rule.

### Scenario 1.1: Silent Filling (Smart Quantity)
**Risk:** Agent asking what was already said.
**User Prompt:** `I want 5 glues.`
**Correct Behavior:**
- ✅ Call price/freight calculation for 5 units.
- ✅ Confirm: "For the 5 glues..."
- ❌ **Fail:** Ask "How many units?".

### Scenario 1.2: Focus on Response (No Context Hallucination)
**Risk:** Agent mixing topics (Logistics vs Product).
**User Prompt:** `How much is shipping to ZIP 60000-000? And when does it arrive?`
**Correct Behavior:**
- ✅ Answer ONLY values and deadlines.
- ❌ **Fail:** Start talking about the product ("S3 is great, dries in 1s... Shipping is..."). (Unnecessary over-selling).

### Scenario 1.3: One Question at a Time (Conciseness)
**Risk:** Agent sending "wall of text" with multiple questions.
**User Prompt:** `I want to buy.`
**Correct Behavior:**
- ✅ A single question ("Can you give me your ZIP?").
- ❌ **Fail:** "Great! What's your ZIP? How many do you want? Do you have an account?".

---

## 🧪 2. Identity & Crisis Tests (Rule 0)

### Scenario 2.1: Crisis Without ID (Hallucination Risk)
**User Prompt:** `I got a purchase notice but didn't buy anything!`
**Correct Behavior:**
- ✅ Assume system error and reassure (do not charge).
- ✅ **REQUEST DATA** for verification ("Give me your CPF to confirm?").
- ❌ **Fail:** Guarantee "no charge" without asking for data or identifying the customer.

### Scenario 2.2: Crisis With ID (Total Trust)
**User Prompt:** `(Customer already identified by Phone/Context) I got a weird notification.`
**Correct Behavior:**
- ✅ Assume system error.
- ✅ Categorically guarantee using the customer's name.
- ❌ **Fail:** Ask for data already have.

---

## 🧪 3. Data Hierarchy Tests (Rule 1)

### Scenario 3.1: Blocked Data + Resume
**Pre-condition:** Agent already knows CPF and Address (via previous tool).
**User Prompt:** `What is my registered address?`
**Correct Behavior:**
- ✅ Answer the data ("Street X, 123...").
- ✅ **RESUME FLOW:** "Is this correct? Can I keep it for delivery?"
- ❌ **Fail:** Answer only the address and end message (Passive Agent).

### Scenario 3.2: Trap Question (Data Already Informed)
**Pre-condition:** Customer said email in previous message.
**User Prompt:** `I want to buy.`
**Correct Behavior:**
- ✅ Call `consulta_user` with the email ALREADY INFORMED.
- ❌ **Fail:** Ask "What is your email?".

---

## 🧪 4. Sale Protection Tests (Rule 4)

### Scenario 4.1: Sale with Hidden Complaint
**User Prompt:** `I want to buy another glue, my last one came very thick and dried too fast.`
**Correct Behavior:**
- ✅ **STOP THE SALE.**
- ✅ Probe/Activate Warranty ("Wait! If it came thick you have a warranty.").
- ❌ **Fail:** Ignore complaint and send payment link (Immediate Churn).

### Scenario 4.2: Logistic Anxiety
**User Prompt:** `My glue is running out, I need it urgent!`
**Context:** Customer has order **In Transit**.
**Correct Behavior:**
- ✅ Acknowledge anxiety and check order in transit.
- ❌ **Fail:** Create a new duplicate order.

---

## 🧪 5. Temporal & Reasoning Tests (Rule 6)

### Scenario 5.1: Pickup Out of Hours (Still Today)
**Context:** It is 16:00. Store closes 17:00.
**User Prompt:** `Can I pick up at 18h?`
**Correct Behavior:**
- ✅ Deny 18h BUT offer alternative TODAY ("18h we're closed, but if you come by 17h you can!").
- ❌ **Fail:** Push straight to tomorrow ("Only tomorrow at 9h").

### Scenario 5.2: Impossible Pickup (Closed)
**Context:** It is 20:00.
**User Prompt:** `Is anyone there? I want to pick up now.`
**Correct Behavior:**
- ✅ Inform closing and opening hours.
- ❌ **Fail:** "You can come", "I'm here".

---

## 🧪 6. Smart Fill Tests (Rule 3)

### Scenario 6.1: Complete Extraction
**User Prompt:** `I want two glues for Street Vital Brasil, Fortaleza.`
**Correct Behavior:**
- ✅ Call `consulta_frete` IMMEDIATELY with:
  - Qty: 2
  - Street: Vital Brasil
  - City: Fortaleza
- ❌ **Fail:** Ask "What is the quantity?" or "What is the neighborhood/ZIP?".

### Scenario 6.2: Tool Hallucination (Neighborhood)
**User Prompt:** `I live in Street X, Fortaleza.`
**Correct Behavior:**
- ✅ Call tool with Street + City. (Tool must handle lack of Neighborhood).
- ❌ **Fail:** Ask "What is the neighborhood?" (Since it is optional in initial calculation).

---

## 📊 Approval Table (QA Checklist)

| Rule Tested | Scenario | Status (Pass/Fail) | Observation |
|:--- |:--- |:--- |:--- |
| **Invisible Points** | Smart Qty / Focus / Conciseness | [ ] | |
| **0. Identity** | Crisis Without ID | [ ] | |
| **1. Hierarchy** | Blocked Data + Resume | [ ] | |
| **3. Smart Fill** | Complete Extraction | [ ] | |
| **4. Protection** | Sale with Complaint | [ ] | |
| **6. Temporal** | Pickup "Almost" Closing | [ ] | |

**Approved by:** ____________________
**Date:** ____/____/____
