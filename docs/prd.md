# Requirements Document

## 1. Application Overview

### 1.1 Application Name
MOSI-OA TUNYA AWARDS

### 1.2 Application Description
A comprehensive music awards platform enabling quarterly award cycles with 25 categories. Users can view nominees, vote for their favorites, and track voting leaderboards. Artists register as nominees via WhatsApp payment flow. Sponsors and partners can apply for collaboration. The platform now includes a Tickets management system for event ticketing and a responsive bottom navigation bar for enhanced mobile and desktop experience.

### 1.3 Design Theme
- Premium Black and Gold color scheme
- Luxury awards platform appearance
- Responsive design supporting Desktop, Tablet, and Mobile
- Smooth animations and modern card layouts
- Glassmorphism effects and elegant typography
- Gold gradients throughout
- Professional dashboard interface
- Responsive bottom navigation bar with Home and Vote buttons
- Sticky navigation bar on all pages

## 2. Users and Usage Scenarios

### 2.1 Target Users
- **Public Users**: View nominees, vote in awards, purchase tickets, view sponsors/partners, access gallery and news
- **Award Nominees**: Register for awards via WhatsApp payment flow, track votes received
- **Sponsors/Partners**: Apply for sponsorship/partnership opportunities
- **Administrators**: Manage entire awards system including nominees, categories, votes, payments, sponsors, partners, tickets, and homepage banner slider

### 2.2 Core Usage Scenarios
- Users browse award categories and nominees, purchase votes, and participate in quarterly voting cycles
- Users purchase event tickets through the platform
- Nominees register for awards via WhatsApp-based payment flow
- Sponsors and partners submit applications for collaboration
- Admin manages award cycles, approves registrations, verifies payments, creates and manages tickets, and updates homepage banner slider

## 3. Page Structure and Functionality

### 3.1 Page Structure

```
├── Homepage (with Hero Banner Slider)
├── Award Categories
├── Award Nominees
├── Voting Page
├── Tickets Page
├── Award Sponsors
├── Award Partners
├── Voters Leaderboard
├── Awards Gallery
├── Awards News
├── Awards About
├── User Account Pages
│   ├── Register
│   ├── Login
│   ├── Forgot Password
│   ├── User Profile
│   ├── Voting History
│   ├── Payment History
│   └── My Tickets
├── Nominee Registration Page
├── Sponsor Registration Page
├── Partner Registration Page
├── Contact Page
├── FAQ Page
└── Admin Dashboard
    ├── Dashboard Overview
    ├── User Management
    ├── Award Nominee Management
    ├── Award Category Management
    ├── Award Sponsor Management
    ├── Award Partner Management
    ├── Award Voters Management
    ├── Award Vote Management
    ├── Award Payment Management
    ├── Tickets Management
    ├── Homepage Banner Management
    ├── Content Management
    ├── Website Settings
    ├── Payment Settings
    ├── Email Settings
    ├── Reports
    └── Security & Audit Logs
```

### 3.2 Responsive Bottom Navigation Bar
- Fixed at bottom of all pages on Android, iPhone, and Desktop
- Two buttons: Home, Vote
- Home button: Navigate to Homepage
- Vote button: Navigate to Voting Page
- Active button highlighted in gold
- Responsive design adapts to screen size

### 3.3 Navigation Bar
- Display links: Home, Categories, Nominees, Vote, Tickets, Sponsors, Partners, Leaderboard, Gallery, News, About, Login, Register
- Sticky positioning on all pages (remains visible when scrolling)
- Responsive menu for mobile devices
- Black and Gold theme

### 3.4 Homepage

#### 3.4.1 Hero Banner Slider
- Display rotating banner images at top of homepage
- Admin uploads banner images from device
- Each banner can include: Image, Title (optional), Description (optional), Call-to-action button with link (optional)
- Auto-play with configurable interval
- Manual navigation controls (previous/next arrows)
- Indicator dots showing current slide
- Responsive design for mobile, tablet, and desktop

#### 3.4.2 Content Sections
- Welcome message and platform introduction
- Current award cycle information
- Featured nominees
- Voting call-to-action
- Available tickets section
- Sponsors and partners showcase
- Recent news and updates
- Gallery highlights

### 3.5 User Account System

#### 3.5.1 User Registration
- Registration form fields: Full Name, Email, Phone Number, Password
- Email verification after registration

#### 3.5.2 User Login
- Login form fields: Email, Password
- Remember me option
- Link to Forgot Password

#### 3.5.3 User Profile Page
- Display user information
- Edit profile functionality
- View voting history
- View payment history
- View purchased tickets

### 3.6 Award Categories
- Display all 25 award categories
- Each category card shows: Category name, Description, Number of nominees, Vote button
- Click category to view nominees in that category

### 3.7 Award Nominees
- Display all approved nominees
- Filter by category
- Search by nominee name
- Each nominee card shows: Photo, Name, Category, Bio, Vote count, Vote button
- Click nominee to view detailed profile

### 3.8 Voting Page
- Select category and nominee
- Choose vote quantity
- Display total cost (configurable price per vote)
- Payment method selection: Automatic Lipila or Manual proof upload
- For Automatic Lipila: User completes payment via Lipila integration, System automatically verifies payment
- For Manual proof upload: User uploads payment proof image from device, Admin verifies payment manually
- Submit vote
- Vote enters pending status until payment verified
- Upon approval: Vote count increments for nominee

### 3.9 Tickets Page

#### 3.9.1 Tickets Listing
- Display all available tickets created by admin
- Each ticket card shows: Ticket name, Description, Price, Availability status, Purchase button
- Filter by: Event date, Price range, Availability
- Search by ticket name

#### 3.9.2 Ticket Purchase Flow
- User selects ticket and quantity
- Display total cost
- Payment method selection: Automatic Lipila or Manual proof upload
- For Automatic Lipila: User completes payment via Lipila integration, System automatically verifies payment
- For Manual proof upload: User uploads payment proof image from device, Admin verifies payment manually
- Submit purchase
- Purchase enters pending status until payment verified
- Upon approval: Ticket issued to user, User receives confirmation email with ticket details

#### 3.9.3 My Tickets
- User can view all purchased tickets in profile
- Display: Ticket name, Purchase date, Quantity, Status (Pending/Confirmed), Ticket code/QR code (after confirmation)

### 3.10 Award Sponsors
- Display all approved sponsors
- Each sponsor card shows: Logo, Name, Description, Website link
- Sponsor registration form for new applicants

### 3.11 Award Partners
- Display all approved partners
- Each partner card shows: Logo, Name, Description, Website link
- Partner registration form for new applicants

### 3.12 Voters Leaderboard
- Display top voters ranked by total votes cast
- Show: Voter name, Total votes, Rank
- Filter by current award cycle or all-time

### 3.13 Awards Gallery
- Display photos and videos from past award events
- Filter by year or event
- Lightbox view for images and videos

### 3.14 Awards News
- Display news articles and announcements
- Each article shows: Title, Date, Summary, Read more link
- Click to view full article

### 3.15 Awards About
- Platform mission and vision
- Award categories explanation
- Voting process information
- Contact information

### 3.16 Nominee Registration Page
- Registration form fields: Full Name, Stage Name, Category, Bio, Photo, Contact Information
- Registration fee display (configurable, default K100)
- WhatsApp redirect button with pre-filled message including registration details and payment instructions
- User completes payment via WhatsApp
- User returns to platform and submits registration
- Registration enters pending status
- Admin verifies payment and approves/rejects registration

### 3.17 Sponsor Registration Page
- Registration form fields: Company Name, Contact Person, Email, Phone, Logo, Description, Website
- Submit button
- Registration enters pending status
- Admin reviews and approves/rejects

### 3.18 Partner Registration Page
- Registration form fields: Organization Name, Contact Person, Email, Phone, Logo, Description, Website
- Submit button
- Registration enters pending status
- Admin reviews and approves/rejects

### 3.19 Contact Page
- Contact form: Name, Email, Phone, Message, Submit
- Display contact information
- WhatsApp button

### 3.20 FAQ Page
- List frequently asked questions with answers
- Organized by topic: Voting, Nominee Registration, Tickets, Sponsors, Partners

### 3.21 Admin Dashboard

#### 3.21.1 Dashboard Overview
Display statistics cards:
- Total Users
- Total Nominees
- Total Votes
- Total Revenue (Nominee Registrations + Votes + Tickets)
- Pending Nominee Registrations
- Pending Vote Payments
- Pending Ticket Purchases
- Active Award Cycle
- Total Tickets Sold

Display charts:
- Votes per Day (line chart)
- Revenue Graph (line chart)
- Top Nominees by Votes (leaderboard)
- Votes per Category (bar chart)
- Ticket Sales per Event (bar chart)

#### 3.21.2 User Management
- List all registered users
- Search and filter users
- Actions: Create, Edit, Delete, Suspend user

#### 3.21.3 Award Nominee Management
- List all nominees with status (Pending, Approved, Rejected)
- Search and filter by category, status
- Actions: Approve nominee, Reject nominee, Manually add nominee, Edit nominee, Delete nominee, Promote as Winner

#### 3.21.4 Award Category Management
- List all 25 award categories
- Actions: Add category, Edit category, Delete category, Enable/Disable category

#### 3.21.5 Award Sponsor Management
- List all sponsors with status (Pending, Approved, Rejected)
- Actions: Approve sponsor, Reject sponsor, Edit sponsor, Delete sponsor

#### 3.21.6 Award Partner Management
- List all partners with status (Pending, Approved, Rejected)
- Actions: Approve partner, Reject partner, Edit partner, Delete partner

#### 3.21.7 Award Voters Management
- List all voters and voting activity
- View individual voter history
- Search and filter voters

#### 3.21.8 Award Vote Management
- List all votes with status (Pending, Approved, Rejected)
- Display: Date, Voter, Nominee, Category, Vote Quantity, Amount, Payment Method, Payment Proof (if manual), Status
- Filter by status, payment method, category
- Actions: Approve vote (after payment verification), Reject vote, Refund vote

#### 3.21.9 Award Payment Management
- List all award-related payments (nominee registrations, votes, tickets)
- Display: Date, User, Type (Registration/Vote/Ticket), Amount, Payment Method, Payment Proof (if manual), Status
- Actions: Approve payment, Reject payment, View payment proof

#### 3.21.10 Tickets Management
- List all created tickets
- Display: Ticket name, Description, Price, Total quantity, Sold quantity, Availability status, Created date
- Actions: Create new ticket, Edit ticket details, Delete ticket, Enable/Disable ticket
- Create ticket form fields: Ticket name, Description, Price (admin sets any amount), Total quantity available, Event date (optional), Availability status (Active/Inactive)
- View ticket purchase history: List all purchases with user details, quantity, payment status

#### 3.21.11 Homepage Banner Management
- List all banner slides
- Display: Banner image thumbnail, Title, Order position, Status (Active/Inactive)
- Actions: Add new banner, Edit banner, Delete banner, Reorder banners (drag-and-drop or up/down arrows), Enable/Disable banner
- Add/Edit banner form fields: Upload image from device, Title (optional), Description (optional), Call-to-action button text (optional), Call-to-action link (optional), Display order

#### 3.21.12 Content Management
Manage website content:
- Gallery images and videos
- News articles
- Announcements
- FAQs
- About page content

#### 3.21.13 Website Settings
Configure website parameters:
- Website Name: MOSI-OA TUNYA AWARDS
- Logo Upload
- Theme Colors: Primary (Black), Secondary (Gold)
- Social Media Links
- Contact Information
- SEO Settings
- Award Cycle Configuration: Start Date, End Date, Voting Period
- Banner slider auto-play interval (seconds)

#### 3.21.14 Payment Settings
Configure payment parameters:
- Award Registration Fee (configurable, default K100)
- Award Voting Fee (configurable per vote)
- Lipila API Configuration (for automatic payment)
- Mobile Money Number (for manual payment)
- Payment Instructions
- Bank Account Details

#### 3.21.15 Email Settings
- SMTP Configuration
- Email Templates for notifications

#### 3.21.16 Reports
Generate and export reports:
- Voting Report: Total votes, votes by category, votes by nominee
- Revenue Report: Registration revenue, voting revenue, ticket revenue, total revenue
- Nominee Report: Total nominees, nominees by category, votes received
- Ticket Report: Total tickets sold, revenue by ticket type, purchase history
- Sponsor/Partner Report: Total sponsors, total partners
- Export formats: PDF, Excel, CSV

#### 3.21.17 Security & Audit Logs
- View audit logs for all admin and user actions
- Security settings
- Backup and restore functionality

## 4. Business Rules and Logic

### 4.1 Award Cycle Management
- Admin configures quarterly award cycles: Start Date, End Date, Voting Period
- Voting opens and closes per cycle
- Winners promoted at end of cycle
- New cycle begins after previous cycle ends

### 4.2 Nominee Registration Flow
- User completes nominee registration form
- System displays registration fee (configurable, default K100)
- User clicks WhatsApp button
- System redirects to WhatsApp with pre-filled message containing: Nominee details, Registration fee amount, Payment instructions, Mobile Money number
- User completes payment via WhatsApp
- User returns to platform and submits registration
- Registration enters pending status
- Admin verifies payment proof and approves/rejects
- Upon approval: Nominee appears on public nominees page

### 4.3 Voting System
- Users select nominee and vote quantity
- System calculates total cost (configurable price per vote)
- User selects payment method: Automatic Lipila or Manual proof upload
- For Automatic Lipila: User completes payment, System verifies automatically, Vote approved immediately
- For Manual proof upload: User uploads payment proof from device, Admin verifies manually, Vote approved after verification
- Approved votes increment nominee vote count
- Vote count displayed on nominee profile and leaderboard

### 4.4 Tickets System
- Admin creates tickets with: Name, Description, Price (any amount), Total quantity, Event date (optional), Availability status
- Users browse available tickets on Tickets page
- User selects ticket and quantity
- System calculates total cost
- User selects payment method: Automatic Lipila or Manual proof upload
- For Automatic Lipila: User completes payment, System verifies automatically, Ticket issued immediately
- For Manual proof upload: User uploads payment proof from device, Admin verifies manually, Ticket issued after verification
- Confirmed tickets appear in user's My Tickets section with ticket code/QR code
- User receives confirmation email with ticket details
- Admin can view all ticket purchases and payment statuses

### 4.5 Homepage Banner Slider
- Admin uploads banner images from device
- Admin can reorder slides by drag-and-drop or up/down arrows
- Admin can enable/disable individual slides
- Slider auto-plays with configurable interval (set in Website Settings)
- Users can manually navigate slides using previous/next arrows
- Indicator dots show current slide position
- Clicking banner can navigate to specified link (if configured)

### 4.6 Sponsor and Partner Management
- Sponsors and partners submit registration forms
- Registrations enter pending status
- Admin reviews and approves/rejects
- Approved sponsors and partners displayed on respective pages

### 4.7 Revenue Tracking
- System tracks all revenue sources: Nominee registrations (configurable fee), Votes (configurable price per vote), Tickets (admin-set prices)
- Dashboard displays total revenue and revenue by source

### 4.8 Payment Verification Workflow
- All payments (nominee registrations, votes, tickets) require verification
- Automatic Lipila payments verified by system automatically
- Manual proof uploads verified by admin manually
- Admin reviews payment proof and approves/rejects
- Approved payments trigger corresponding actions (publish nominee, increment votes, issue ticket)

### 4.9 User Roles and Permissions
- Admin: Full access to all features
- User: Access to voting, ticket purchase, profile management, viewing content
- Nominee: Access to nominee profile, view votes received

### 4.10 Email Notifications
- Automatic emails sent for: User registration, Nominee registration approval/rejection, Vote confirmation, Ticket purchase confirmation, Sponsor/Partner approval/rejection

## 5. Exception and Boundary Conditions

| Scenario | Handling |
|----------|----------|
| User attempts to vote without login | Redirect to login page with return URL |
| User attempts to purchase ticket without login | Redirect to login page with return URL |
| Voting period has ended | Disable voting, display voting closed message |
| Ticket sold out | Display sold out message, disable purchase button |
| Admin changes award cycle dates | Changes apply to current or next cycle, existing votes unaffected |
| Payment proof image fails to load | Display placeholder, allow reupload |
| Multiple admins approve same payment simultaneously | System prevents duplicate approval, only first approval processes |
| Email notification fails to send | System logs failure, admin can resend |
| User uploads oversized payment proof image | System validates file size, displays error if exceeds limit |
| Nominee registration submitted outside cycle period | Display error message, indicate next cycle dates |
| User attempts to vote for nominee in different category | System validates category match, displays error if mismatch |
| Admin deletes ticket with existing purchases | System prevents deletion, displays error message |
| Admin disables ticket with pending purchases | Pending purchases remain valid, new purchases disabled |
| User attempts to purchase negative or zero ticket quantity | System validates quantity, displays error if invalid |
| Banner slider has no active slides | Display placeholder or hide slider section |
| Admin uploads invalid image format for banner | System validates format, displays error if invalid |
| User clicks banner with no link configured | Banner not clickable, no action taken |
| Automatic Lipila payment fails | Display error message, prompt user to retry or use manual method |
| Admin changes ticket price after purchases made | New price applies only to new purchases, existing purchases retain original price |
| User attempts to access My Tickets with no purchases | Display empty state message |
| Multiple users vote for same nominee simultaneously | System handles concurrently, all votes counted correctly |

## 6. Acceptance Criteria

1. User registers account with Full Name, Email, Phone Number, and Password, receives email verification, and successfully logs in
2. User navigates to Homepage, views Hero Banner Slider with rotating images uploaded from device by admin, clicks banner, and navigates to configured link
3. User clicks Vote button in bottom navigation bar, navigates to Voting Page, selects nominee, chooses vote quantity, selects Manual proof upload payment method, uploads payment proof from device, submits vote, and vote appears in admin Award Vote Management with Pending status
4. Admin logs into dashboard, navigates to Award Vote Management, views pending vote, verifies payment proof, clicks Approve, and vote count increments for nominee on public Nominees page
5. User clicks Tickets link in sticky navigation bar, navigates to Tickets Page, selects ticket, chooses quantity, selects Automatic Lipila payment method, completes payment, and ticket is issued immediately with confirmation email sent
6. Admin navigates to Tickets Management, clicks Create New Ticket, completes form with ticket name, description, price (K50), total quantity (100), clicks Save, and ticket appears on public Tickets Page
7. Admin navigates to Homepage Banner Management, clicks Add New Banner, uploads image from device, enters title and call-to-action link, clicks Save, and banner appears in homepage slider
8. Admin navigates to Award Nominee Management, views pending nominee registration, clicks Approve, and nominee appears on public Award Nominees page

## 7. Out of Scope for This Release

- Automatic payment gateway integration beyond Lipila (manual verification remains available)
- Live streaming functionality
- Social features (comments, likes, shares)
- Advanced recommendation algorithms
- Mobile native applications (iOS/Android apps)
- SMS notifications (only email notifications)
- Multi-language support (English only)
- Two-factor authentication
- API access for third-party integrations
- Blockchain-based voting verification
- NFT integration for exclusive content
- Advanced analytics with predictive insights
- A/B testing for content placement
- Multi-currency support (single currency only)
- Automated tax reporting
- Integration with accounting software
- CDN integration for global performance
- Advanced caching strategies
- Load balancing and auto-scaling
- User feedback and rating system
- Content moderation tools for user-generated content
- Spam detection and prevention
- IP blocking and geolocation restrictions
- Advanced captcha
- Session management and timeout controls
- Password strength enforcement policies
- Account lockout after failed login attempts
- Security audit reports
- Penetration testing tools
- Legal document version control
- Cookie consent management
- Privacy settings customization for users
- Data export for users (GDPR right to data portability)
- Account deletion with data purging
- Historical data comparison tools
- Machine learning for voting pattern analysis
- Sentiment analysis of user feedback
- Automated report generation and scheduling
- Custom dashboard widgets
- Drag-and-drop dashboard customization
- Mobile app for admin dashboard
- Voice commands for navigation
- Integration with smart speakers
- Sleep timer
- Push notification campaigns
- In-app advertising platform
- Sponsored content placement
- Brand partnership tools
- Influencer marketing integration
- Ticket resale marketplace
- Ticket transfer between users
- QR code scanning app for ticket validation
- Seat selection for tickets
- Ticket bundles or packages
- Early bird pricing for tickets
- Discount codes or promo codes
- Group ticket purchases
- Waitlist for sold-out tickets
- Ticket refund or cancellation policy
- Integration with external ticketing platforms
- Print-at-home ticket option
- Mobile wallet integration for tickets
- Calendar integration for event reminders
- Social media sharing of ticket purchases
- Nominee self-service dashboard
- Nominee campaign tools
- Nominee analytics and insights
- Nominee fan engagement tools
- Nominee merchandise store
- Nominee crowdfunding integration
- Video banner slides (only image banners supported)
- Banner A/B testing
- Banner click tracking and analytics
- Banner scheduling (start/end dates)
- Banner targeting by user segment
- Banner animation effects beyond basic transitions
- Multiple banner sliders on different pages
- Banner templates or presets
- Banner preview before publishing
- Banner version history