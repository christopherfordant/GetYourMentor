# GetYourMentor - Prompts pour Figma Make

## 1. Prompt principal

```text
Create a responsive web app prototype for a sports coaching marketplace called GetYourMentor.

The product should feel inspired by Planity in its clarity and booking-request-first UX, but adapted to sports coaching. Do not copy another brand. The interface must feel premium, reassuring, clean, fast to understand, and strongly conversion-oriented.

Target users:
- athletes looking for a coach near them
- coaches who want visibility and bookings

Primary user journey:
1. search by sport and city
2. browse coach results
3. open a coach profile
4. choose a session type
5. choose one to three preferred timeslots
6. sign up or log in
7. send a booking request
8. wait for coach approval
9. pay after approval
10. view final booking confirmation

Design direction:
- warm light background
- elegant cards
- dark typography
- terracotta accent color for primary actions
- mobile-first layout
- strong trust signals
- clear CTA buttons

Layout constraints:
- use a strict spacing system based on 8, 12, 16, 24, 32, 48, 64
- keep all content aligned to a clear responsive grid
- mobile reference width around 390px
- desktop container max width around 1200px
- keep 20px side padding on mobile and around 80px outer spacing on desktop
- use consistent border radius across inputs, cards, and buttons
- make tabs, buttons, cards, and form fields perfectly aligned
- ensure elements are visually centered and never floating randomly
- keep all screens realistically responsive and developer-friendly

Suggested style tokens:
- background: #F6F2EB
- surface: #FFFDFC
- primary text: #0F172A
- secondary text: #5B6475
- accent: #D97757
- border: #E7DED2

Typography:
- modern clean sans serif
- readable, premium, not futuristic

Create the following core screens:
- Home
- Search Results
- Coach Profile
- Session Choice
- Preferred Timeslot Selection
- Login / Sign Up
- Booking Request Review
- Coach Dashboard

Also create:
- a request-sent success state
- an optional payment-after-approval state

The prototype must prioritize request-flow clarity, trust, and simplicity.
```

## 2. Prompt Home

```text
Design the home page of GetYourMentor, a sports coaching booking platform.

Goal: help users understand the service in 5 seconds and start searching immediately.

Include:
- clean header with logo, become a coach, login, sign up
- hero title focused on finding the right coach nearby
- subtitle mentioning basketball, football, combat sports, fitness
- search bar with sport field and city field
- strong primary CTA: Find a coach
- 3 trust points: verified coaches, easy request flow, secure payment
- simple how-it-works section in 3 steps
- testimonials section
- final CTA section

Style:
- premium, clear, warm, mobile-first, request-first
- strict spacing, strong alignment, clean borders, centered layout
```

## 3. Prompt Search Results

```text
Design a search results page for GetYourMentor.

Goal: let users compare coaches quickly.

Include:
- page title with city and sport
- filter bar with sport, city, budget, availability, rating
- list of coach cards
- each card should show photo, name, specialty, city, price from, rating, tags, and a profile CTA
- very scannable layout
- optional sticky filter or search summary panel

Style:
- elegant cards
- high readability
- fast comparison
- perfectly aligned card grid and consistent spacing
```

## 4. Prompt Coach Profile

```text
Design a coach profile page for GetYourMentor.

Goal: build trust and convert users to a booking request.

Include:
- large coach photo
- name, specialty, city, rating, reviews, verified badge
- sticky request card with price and request button
- about section
- specialties section
- diplomas or certifications section
- offered sessions section
- reviews section
- clear request and contact actions

Style:
- premium but practical
- long page with strong section hierarchy
- request action always visible
- aligned two-column logic on desktop, stacked layout on mobile
```

## 5. Prompt Session Choice

```text
Design a session selection page for GetYourMentor.

Goal: make the offer easy to understand and select.

Include:
- title
- coach summary
- session cards for individual session, session pack, and remote video analysis
- each card must show duration, price, short description, and choose button
- subtle back link to coach profile

Style:
- minimal friction
- very clear pricing
- evenly spaced cards with matching heights
```

## 6. Prompt Timeslot Selection

```text
Design a preferred timeslot selection page for GetYourMentor.

Goal: let the user choose one to three preferred timeslots and prepare a booking request.

Include:
- title
- a clear instruction that the user can select up to 3 preferred timeslots
- visible time options
- booking summary card with coach, session, duration, price
- a clear next step CTA

Style:
- mobile-first
- clear rhythm
- no unnecessary complexity
- precise spacing between date blocks, timeslots, and summary card
```

## 7. Prompt Login Signup

```text
Design a login and sign-up page for GetYourMentor.

Goal: complete account creation without breaking the booking-request flow.

Include:
- title about sending the request
- tabs for login and sign up
- simple sign up form
- reassurance block about secure request flow and payment after approval
- clean CTA buttons

Style:
- lightweight
- clear
- confidence-building
- tabs must be perfectly aligned and equally sized
```

## 8. Prompt Request Review

```text
Design a booking request review page for GetYourMentor.

Goal: help the user review the booking request before sending it to the coach.

Include:
- booking summary
- coach name
- session type
- preferred date and time choices
- location
- total price
- a clear explanation that payment happens only after coach approval
- primary send-request button
- trust and cancellation information

Style:
- reassuring
- structured
- minimal friction
- balanced summary blocks, clean spacing, aligned payment fields
```

## 9. Prompt Request Sent

```text
Design a request sent confirmation page for GetYourMentor.

Goal: reassure the user after sending a booking request.

Include:
- success state
- coach name
- selected session
- reminder that the coach will validate or refuse
- summary of the preferred timeslots sent
- CTA to view requests or contact the coach

Style:
- reassuring
- premium
- simple
```

## 10. Prompt Coach Dashboard

```text
Design a simple coach dashboard for GetYourMentor.

Goal: show the platform value for coaches.

Include:
- profile header
- edit profile button
- KPI cards for requests, upcoming bookings, reviews, earnings
- recent requests list with accept/refuse actions
- next sessions list
- profile completion block

Style:
- clear and calm
- useful first
- no unnecessary complexity
- aligned KPI cards and regular dashboard grid
```
