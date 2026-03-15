# GetYourMentor - Prompts pour Figma Make

## 1. Prompt principal

```text
Create a responsive web app prototype for a sports coaching marketplace called GetYourMentor.

The product should feel inspired by Planity in its clarity and booking-first UX, but adapted to sports coaching. Do not copy another brand. The interface must feel premium, reassuring, clean, fast to understand, and strongly conversion-oriented.

Target users:
- athletes looking for a coach near them
- coaches who want visibility and bookings

Primary user journey:
1. search by sport and city
2. browse coach results
3. open a coach profile
4. choose a session type
5. pick a timeslot
6. sign up or log in
7. confirm and pay
8. view booking confirmation

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

Create the following screens:
- Home
- Search Results
- Coach Profile
- Session Choice
- Timeslot Selection
- Login / Sign Up
- Booking Confirmation + Payment
- Coach Dashboard

The prototype must prioritize booking clarity, trust, and simplicity.
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
- 3 trust points: verified coaches, easy booking, secure payment
- simple how-it-works section in 3 steps
- testimonials section
- final CTA section

Style:
- premium, clear, warm, mobile-first, booking-first
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

Goal: build trust and convert users to booking.

Include:
- large coach photo
- name, specialty, city, rating, reviews, verified badge
- sticky booking card with price and reserve button
- about section
- specialties section
- diplomas or certifications section
- offered sessions section
- reviews section
- clear reserve and contact actions

Style:
- premium but practical
- long page with strong section hierarchy
- booking always visible
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
Design a timeslot selection page for GetYourMentor.

Goal: let the user select a date and time quickly.

Include:
- title
- week or calendar selector
- visible available timeslots
- booking summary card with coach, session, duration, price
- continue CTA

Style:
- mobile-first
- clear rhythm
- no unnecessary complexity
- precise spacing between date blocks, timeslots, and summary card
```

## 7. Prompt Login Signup

```text
Design a login and sign-up page for GetYourMentor.

Goal: complete account creation without breaking conversion.

Include:
- title about finishing the booking
- tabs for login and sign up
- simple sign up form
- reassurance block about secure booking and payment
- clean CTA buttons

Style:
- lightweight
- clear
- confidence-building
- tabs must be perfectly aligned and equally sized
```

## 8. Prompt Checkout

```text
Design a booking confirmation and payment page for GetYourMentor.

Goal: help the user review the booking and pay with confidence.

Include:
- booking summary
- coach name
- session type
- date and time
- location
- total price
- secure card payment module
- primary pay button
- trust and cancellation information

Style:
- reassuring
- structured
- minimal friction
- balanced summary blocks, clean spacing, aligned payment fields
```

## 9. Prompt Coach Dashboard

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
