# context.md — DIY Family Calendar Wall Hub

> Working project name: **HomeBoard Calendar**  
> Purpose: Build a DIY Skylight-style family calendar/dashboard that runs on a cheap 15.6-inch monitor connected to a Raspberry Pi or mini PC, while the actual software is a web app that can be managed from phones/laptops.

---

## 1. Important product direction

This project should be inspired by the family-organization category, but it should **not copy Skylight branding, names, UI, trade dress, icons, marketing copy, or exact screen layouts**. Build a custom product with similar utility:

- Shared family calendar
- Color-coded family profiles
- Chores/routines/tasks
- Meal planning
- Grocery/to-do lists
- Remote management from phone/laptop
- Wall-mounted read-only or touch-friendly dashboard
- Optional AI import for flyers, emails, PDFs, recipe pages, and photos

The V1 budget goal is **under $200 total hardware**, so the first build should assume a **15.6-inch non-touch 1080p portable monitor** and a **Raspberry Pi 4/5 or low-cost mini PC**. Touch support should be designed into the UI but should not be required for V1.

---

## 2. Core product goal

Create a web-based family command center that can run full-screen in kiosk mode on a wall display.

The wall display should answer these questions at a glance:

- What is happening today?
- What is happening this week?
- Who has what schedule?
- What chores/routines need to be done?
- What is for dinner?
- What do we need to buy?
- What reminders are coming up?
- Is everything synced?

The app should feel like a household appliance, not a normal web dashboard.

---

## 3. Target hardware assumptions

### V1 hardware

- Display: 15.6-inch 1920x1080 portable monitor
- Orientation: landscape first; portrait support later
- Input: no touch required for V1
- Compute: Raspberry Pi 4 2GB minimum, Raspberry Pi 4 4GB/8GB or Raspberry Pi 5 preferred
- Browser: Chromium in kiosk mode
- Internet: Wi-Fi
- Admin device: phone/laptop web app
- Audio: optional, only needed for reminder chimes
- Camera/mic: not required on the wall device; AI import should happen from phone/laptop

### Display design constraints

The 15.6-inch screen is smaller than commercial 15/27-inch family calendars, so the display UI must use:

- Large text
- High contrast
- Minimal chrome
- Simple layouts
- No dense spreadsheet-style calendar by default
- Short event titles
- Responsive truncation
- Clear color dots/labels
- At-a-glance cards

Recommended display resolution target:

```txt
1920x1080 landscape
Minimum readable body text: 18px
Normal event text: 22px–28px
Section headers: 30px–44px
Time/date hero: 40px–64px
Touch targets if enabled: 48px minimum height
```

---

## 4. Recommended software stack

### Preferred stack

- Framework: **Next.js 15+ App Router**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- UI primitives: **shadcn/ui** where useful, but keep the wall display custom and lightweight
- Database: **Postgres**, ideally Supabase Postgres
- ORM: **Drizzle** or Prisma
- Auth: Supabase Auth, Clerk, or Auth.js
- Realtime: Supabase Realtime, WebSockets, or SSE
- Background jobs: Inngest, Trigger.dev, pg_cron, Supabase Edge Functions, or a simple Node worker
- File storage: Supabase Storage, S3-compatible storage, or Cloudflare R2
- Hosting: Vercel for app + Supabase for database/storage
- Kiosk device: Chromium browser opening the `/display/:deviceId` route

### V1 architecture principle

The Raspberry Pi should **not** be the backend. The Pi should only be a display client.

```txt
Phone/Laptop Admin App
        ↓
Next.js Web App + API
        ↓
Postgres + Storage + Sync Workers
        ↓
/display route rendered in Chromium kiosk mode
        ↓
15.6-inch wall monitor
```

---

## 5. Product personas

### Household Owner

Usually a parent/adult. Can configure the household, invite users, manage calendars, connect external calendars, change device settings, manage billing if this ever becomes a product, and control parental lock.

### Adult Member

Can create and edit events, tasks, meals, recipes, and lists. Can manage their own profile and potentially children’s tasks depending on permissions.

### Child Profile

Usually not a full login. Has tasks, chores, routines, rewards, and calendar items assigned. May be allowed to mark tasks complete from the wall display if parental lock allows it.

### Shared Display Device

A trusted household screen. It should have a read-only device token by default. It can optionally allow limited actions like marking chores complete, checking off list items, or switching views.

### Guest / Co-parent / Caregiver

Can be invited with limited access. May only view calendar, add events, or manage specific profiles.

---

## 6. Feature parity research summary

Build the following feature set into the roadmap. These are the categories needed for a strong Skylight-style replacement.

### Calendar features

- Shared family calendar
- Day view
- Week view
- Month view
- Schedule/agenda view
- Home screen showing weekly events plus optional tasks/lists
- Today button
- Previous/next navigation
- Current date indicator
- Current time indicator
- Multi-day event display
- All-day event display
- Recurring events
- Event reminders
- Sound reminder on wall device if speakers exist
- Weather forecast alongside schedule
- Color-coded profiles
- Profile filtering
- Calendar/source filtering
- Event detail modal
- Add/edit/delete manual events
- Assign events to one or more profiles
- Attach event to an external synced calendar when two-way sync is enabled
- Time zone configuration
- Last synced indicator
- Conflict/error indicator for failed sync

### Calendar integrations

Target providers:

- Google Calendar
- Apple iCloud Calendar
- Microsoft Outlook / Microsoft 365 Calendar
- Cozi Calendar
- Yahoo Calendar
- Standard public iCalendar/ICS URL

V1 should support:

- Manual events
- Google Calendar read-only sync
- Public ICS URL import

V2 should support:

- Google Calendar two-way sync
- Microsoft Graph read-only or two-way sync
- Apple iCloud via public/shared calendar URL first
- Yahoo and Cozi via ICS URL first

Important sync rule:

- Keep external provider events in the app database.
- Do not make the wall display call Google/Microsoft/Apple directly.
- Materialize event instances for the visible date range to keep display rendering fast.

### Profiles

Profiles are the core household organization layer.

Each profile should support:

- Name
- Color
- Optional avatar/photo/emoji
- Type: adult, child, pet, generic, calendar-only
- Linked external calendar sources
- Visibility toggles
- Task assignments
- Rewards/stars
- Merge profile flow
- Archive profile flow

Examples:

- Chris
- Madelaine
- Presley
- School
- Soccer
- Family
- Dog
- Shared Household

### Tasks, chores, and routines

Support two primary task types:

#### Chore

A task that may happen once or repeat, assigned to one or more profiles. It can have a date, optional time, repeat rule, and star value.

#### Routine

A habit/routine that repeats around a part of the day. It should support Morning, Afternoon, and Evening groupings.

Task features:

- Create/edit/delete chores
- Create/edit/delete routines
- Convert chore to routine and routine to chore
- Assign to one profile, multiple profiles, or “Up for Grabs”
- Up for Grabs tasks can be claimed by any profile when completed
- Optional emoji
- Optional description/instructions
- Optional due date
- Optional due time
- Repeat schedule
- Repeat-until date
- Completion tracking
- Mark complete
- Mark incomplete
- Skip a recurring task
- Unskip a skipped task
- Skipped tasks should not count against completion streaks/progress
- Late/overdue state
- Completed/late/skipped/up-for-grabs filters
- Day view for tasks
- Week view for tasks
- Progress indicators per profile
- Morning/Afternoon/Evening routine filters
- Reorder routines within their time-of-day section
- Delete current instance, all future instances, or whole series
- Task Box / reusable task templates
- Pre-made starter task templates

Starter task templates:

- Brush teeth
- Make bed
- Feed pets
- Homework
- Pack backpack
- Put laundry away
- Take out trash
- Dishes
- Clean room
- Read 20 minutes
- Practice instrument
- Get ready for bed

### Rewards / stars

Rewards should motivate kids and make chore completion visible.

Features:

- Assign star value to chores/routines
- Award stars on completion
- Do not award stars when task is skipped
- Manual give stars
- Manual remove stars
- Reward catalog
- Reward cost in stars
- Redeem reward when profile has enough stars
- Star transaction ledger
- Reward redemption history
- Parent approval option
- Per-profile star balance
- Optional streaks
- Optional weekly progress summary

Example rewards:

- 20 stars: Pick dessert
- 30 stars: Extra bedtime story
- 50 stars: Movie night
- 75 stars: Toy store trip
- 100 stars: Special outing

### Lists

Support shared household lists.

Default lists:

- Grocery
- To-Dos

List types:

- Grocery
- To-do
- Other

List features:

- Create/edit/delete lists
- Title
- Color
- List type
- Hide list from wall device
- Add items
- Check off items
- Undo check-off
- View completed items
- Clear completed items
- Reorder items
- Sections/groups inside lists
- Move selected items to a section
- Delete selected items
- Item notes
- Optional quantity/unit
- Multiple grocery lists
- Deduplicate grocery items
- Auto-organize grocery items by aisle/category
- Add recipe ingredients to grocery list
- Optional Instacart handoff later
- Optional QR handoff from wall device to phone

V1 should do basic lists and check-off. Grocery organizing can be V2.

### Meal planning

Meal planning should support a weekly view with meal categories.

Default categories:

- Breakfast
- Lunch
- Dinner
- Snack

Meal category features:

- Rename categories
- Change category color
- Hide/show categories
- Reorder categories later

Meal features:

- Weekly meal plan
- Add meal manually
- Add from existing recipe
- Add new recipe while planning meal
- Multiple recipes per meal slot
- Move meal to another day
- Repeat meal
- Repeat-until date
- Notes/instructions
- Save meal as recipe
- Update recipe from meal edit
- Delete meal from plan without deleting saved recipe
- Add meal ingredients to grocery list

### Recipes / recipe box

Recipe features:

- Recipe list
- Recipe categories
- Search recipes
- Filter recipes by category
- View recipe details
- Recipe title
- Ingredients
- Instructions
- Notes
- Source URL
- Photo/document source optional
- Add recipe to meal plan
- Add ingredients to grocery list
- Edit recipe
- Delete recipe only
- Delete recipe and remove future planned meals
- Import recipe from URL later
- Import recipe from photo/PDF later
- Import recipe by voice later
- Import recipe from fridge photo later

### AI assistant / Magic Import equivalent

This should be a later but important differentiator. Do not block the MVP on AI.

Name it something original, not “Sidekick.” Suggested working names:

- Helper
- Family Assistant
- HomeBot
- Import Assistant

AI import use cases:

- Upload school flyer image → extract event(s)
- Upload PDF schedule → extract event(s)
- Forward school email → extract events/tasks
- Paste text → extract calendar events/tasks/list items
- Upload sports schedule → create recurring events
- Upload recipe URL/photo/PDF → create recipe
- Take fridge photo → suggest meals
- Dictate a list → create list items
- Upload list photo → create list items
- Ask for a weekly meal plan based on preferences
- Ask for local family activities, then add selected activity to calendar

AI import must always show a review screen before saving.

Do not silently create many events from AI without user approval.

AI import output schemas should be strict JSON.

Example AI event import schema:

```json
{
  "events": [
    {
      "title": "string",
      "description": "string | null",
      "location": "string | null",
      "starts_at": "ISO datetime | null",
      "ends_at": "ISO datetime | null",
      "all_day": false,
      "timezone": "America/New_York",
      "profile_suggestions": ["string"],
      "confidence": 0.0,
      "source_excerpt": "string"
    }
  ],
  "warnings": ["string"],
  "needs_user_input": ["string"]
}
```

Example AI list import schema:

```json
{
  "list_title": "string",
  "list_type": "grocery | todo | other",
  "items": [
    {
      "name": "string",
      "quantity": "string | null",
      "section": "string | null",
      "confidence": 0.0
    }
  ],
  "warnings": ["string"]
}
```

Example AI recipe import schema:

```json
{
  "title": "string",
  "category": "breakfast | lunch | dinner | snack | other",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string | null",
      "unit": "string | null"
    }
  ],
  "instructions": ["string"],
  "notes": "string | null",
  "source_url": "string | null",
  "warnings": ["string"]
}
```

### Photos / screensaver

Optional V2/V3 feature.

Features:

- Photo upload
- Video upload optional
- Albums
- Show photos when display is idle
- Choose active album
- Slideshow interval
- Random/chronological order
- Hide/show overlay clock
- Copy photos to another household/device later
- Invite others to contribute photos later

V1 can have a simple idle screensaver with local images or remote uploaded photos.

### Home screen

The Home screen should be the default wall display.

Required Home sections:

- Current date/time
- Weather summary
- Today’s next events
- Weekly strip/calendar
- Today’s chores/tasks
- Lists preview
- Dinner/meal plan preview
- Last synced status

Home screen customizations:

- Show/hide tasks
- Show/hide lists
- Show/hide meals
- Show/hide weather
- Choose compact or large mode
- Choose number of days shown
- Choose which profiles are shown

### Mobile/web admin app

No native app needed for V1. Build a responsive web app/PWA.

Admin routes:

- `/app` dashboard
- `/app/calendar`
- `/app/tasks`
- `/app/lists`
- `/app/meals`
- `/app/recipes`
- `/app/rewards`
- `/app/profiles`
- `/app/devices`
- `/app/settings`
- `/app/import`

Admin features:

- Login/signup
- Create household
- Invite household members
- Manage profiles
- Add/edit/delete events
- Connect external calendars
- Manage tasks/routines
- Manage lists
- Manage meals/recipes
- Manage rewards
- Pair display devices
- Set device sleep mode
- Set device brightness/display preferences where possible
- Set time zone
- View sync errors
- Trigger manual sync

### Device pairing

The wall display should not require logging into a full admin account.

Pairing flow:

1. Pi opens `/pair` or `/display/setup` in kiosk browser.
2. Device shows a 6-digit pairing code.
3. User logs into web admin from phone/laptop.
4. User goes to Devices → Add Device.
5. User enters pairing code.
6. Backend creates a device record and issues a device token.
7. Wall display stores token in local storage or secure cookie.
8. Device now opens `/display/:deviceId` or `/display` using token.

Device token rules:

- Token should be scoped to one household and one device.
- Token should not allow account settings changes.
- Default display token should be read-only.
- Optional limited actions can be enabled per device: mark tasks complete, check list items, switch views.
- Token should be revocable.

### Multiple display devices

Support multiple devices per household.

Device fields:

- Name
- Room/location
- Orientation
- Display mode
- Last seen
- App version/build
- Sleep schedule
- Allowed actions
- Linked household

Multiple devices should share the same household data but can have different display settings.

### Parental lock

Device-level parental lock should support:

- 4-digit PIN
- Require PIN to add events/tasks
- Require PIN to edit events/tasks
- Require PIN for both add and edit
- Require PIN after inactivity timeout
- Disable parental lock with PIN
- Reset PIN via owner/admin account
- PIN applies to device interactions, not the whole mobile/admin app

For V1 non-touch display, this can be implemented but mostly unused until touch/mouse input is enabled.

### Reminders and notifications

Event reminders:

- At time of event
- X minutes before event
- Common options: 5 min, 10 min, 30 min, 1 hour
- Custom offset
- Play sound on wall device if supported
- Show visual alert on wall display

Future push/email/SMS:

- Email reminders
- Push notifications through PWA/mobile app
- SMS optional, not V1

### Weather

V1 weather:

- Current condition
- Today high/low
- Weather icon
- Next few days icons in week view

Settings:

- Household address or city
- Temperature unit
- Toggle weather on/off

Use a weather API with free tier if possible. Cache weather results and refresh every 30–60 minutes.

### Sleep mode / brightness / display behavior

Sleep mode:

- Set daily sleep time
- Set daily wake time
- Enter sleep now
- Tap/mouse/keyboard wakes if interactive
- On non-touch display, wake may require keyboard/mouse or schedule only

Brightness:

- Browser-only dimming overlay for V1
- Hardware brightness control optional later

Display behavior:

- Prevent browser sleep/blanking
- Auto-refresh on crash/error
- Show reconnecting state if offline
- Show cached last-known data when offline
- Show last updated timestamp

---

## 7. Non-goals for V1

Do not build these first:

- Native iOS app
- Native Android app
- Full two-way sync for every provider
- Complex drag-and-drop calendar editing on wall device
- Payments/subscriptions
- Instacart production integration
- Alexa skill
- SMS notifications
- Full video screensaver
- Advanced AI planner
- Multi-tenant SaaS billing
- Hardware enclosure design

V1 should prove the household dashboard is useful before expanding.

---

## 8. Product routes

### Public / auth routes

```txt
/                         Marketing or redirect to app
/login                    Login
/signup                   Signup
/onboarding               Create household and first profiles
/invite/:token            Accept household invite
```

### App routes

```txt
/app                      Household dashboard
/app/calendar             Calendar management
/app/tasks                Tasks/chores/routines
/app/lists                Lists and grocery
/app/meals                Meal planner
/app/recipes              Recipe box
/app/rewards              Stars and rewards
/app/profiles             Family profiles
/app/devices              Pair/manage wall displays
/app/import               AI/manual import center
/app/settings             Household settings
/app/settings/integrations Calendar sync integrations
```

### Display/kiosk routes

```txt
/display/setup            Pairing code screen
/display                  Main wall display using device token
/display/home             Home view
/display/calendar         Calendar-only view
/display/tasks            Tasks-only view
/display/meals            Meals-only view
/display/lists            Lists-only view
/display/photos           Screensaver/photo mode
```

---

## 9. Display UI modes

### Home mode — default

Best V1 layout for 15.6-inch landscape monitor.

```txt
┌────────────────────────────────────────────────────────────┐
│ Date / Time                         Weather / Sync Status  │
├──────────────────────────────────────┬─────────────────────┤
│ Today + Tomorrow Events              │ Chores / Routines   │
│                                      │                     │
│ Large agenda list                    │ Meal / Dinner       │
│                                      │                     │
├──────────────────────────────────────┴─────────────────────┤
│ 7-day weekly strip with profile colors                     │
└────────────────────────────────────────────────────────────┘
```

### Week calendar mode

- 7 columns
- Compact event pills
- Profile color dot/bar
- Weather icons per day
- Today highlighted
- Tap/click event for details if interactive

### Day mode

- Timeline for current day
- All-day section
- Current time line
- Side rail for chores/meals/lists

### Month mode

- Month grid
- Small colored dots or short event titles
- Better for glance than detail
- On 15.6-inch display, keep month mode simple

### Tasks mode

- Profiles as columns
- Tasks grouped by Morning/Afternoon/Evening/Chores
- Circular or bar progress per profile
- Show overdue items clearly
- Show Up for Grabs column

### Meals mode

- Weekly grid
- Rows for Breakfast/Lunch/Dinner/Snack or visible custom categories
- Multiple recipes per slot
- Dinner row emphasized

### Lists mode

- Show chosen list or list overview
- Grocery and To-do defaults
- Large checkboxes if interactive

### Screensaver mode

- Show photo full screen
- Overlay small date/time and next event
- Automatically exit on upcoming reminder or configured wake time

---

## 10. Database schema proposal

Use UUID primary keys. Include `created_at`, `updated_at`, and soft-delete fields where useful.

### households

```sql
id uuid primary key
name text not null
timezone text not null default 'America/New_York'
address_text text null
weather_location jsonb null
week_starts_on text not null default 'sunday' -- sunday | monday
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### users

Use auth provider user IDs. If Supabase Auth, `auth.users` is source of truth.

### household_members

```sql
id uuid primary key
household_id uuid not null references households(id)
user_id uuid not null
role text not null -- owner | admin | adult | caregiver | viewer
status text not null -- invited | active | removed
invited_by uuid null
created_at timestamptz not null default now()
```

### profiles

```sql
id uuid primary key
household_id uuid not null references households(id)
name text not null
color text not null
avatar_url text null
emoji text null
profile_type text not null default 'person' -- adult | child | pet | calendar | generic
linked_user_id uuid null
archived_at timestamptz null
sort_order int not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### devices

```sql
id uuid primary key
household_id uuid null references households(id)
name text not null
room text null
device_type text not null default 'kiosk'
orientation text not null default 'landscape' -- landscape | portrait | auto
display_mode text not null default 'home'
status text not null default 'pending' -- pending | active | revoked
pairing_code_hash text null
pairing_code_expires_at timestamptz null
device_token_hash text null
last_seen_at timestamptz null
settings jsonb not null default '{}'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### device_settings

```sql
id uuid primary key
device_id uuid not null references devices(id)
sleep_enabled boolean not null default false
sleep_start time null
sleep_end time null
brightness int null
show_weather boolean not null default true
show_tasks boolean not null default true
show_lists boolean not null default true
show_meals boolean not null default true
allowed_actions jsonb not null default '{"mark_tasks":false,"check_lists":false,"switch_views":true}'
parental_lock_enabled boolean not null default false
parental_lock_pin_hash text null
parental_lock_mode text null -- add | modify | add_modify
parental_lock_timeout_minutes int not null default 5
updated_at timestamptz not null default now()
```

### calendar_accounts

External account connection.

```sql
id uuid primary key
household_id uuid not null references households(id)
provider text not null -- google | microsoft | apple_ics | yahoo_ics | cozi_ics | ics
account_label text not null
external_account_id text null
sync_mode text not null default 'one_way' -- one_way | two_way
access_token_encrypted text null
refresh_token_encrypted text null
expires_at timestamptz null
status text not null default 'active' -- active | error | disconnected
last_synced_at timestamptz null
last_error text null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### calendars

```sql
id uuid primary key
household_id uuid not null references households(id)
calendar_account_id uuid null references calendar_accounts(id)
provider text not null -- local | google | microsoft | ics
external_calendar_id text null
name text not null
color text null
visible boolean not null default true
profile_id uuid null references profiles(id)
read_only boolean not null default false
sync_token text null
ics_url_encrypted text null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
unique(calendar_account_id, external_calendar_id)
```

### events

Canonical event definitions.

```sql
id uuid primary key
household_id uuid not null references households(id)
calendar_id uuid null references calendars(id)
source text not null default 'local' -- local | google | microsoft | ics | email | ai
external_event_id text null
external_etag text null
uid text null
status text not null default 'confirmed' -- confirmed | tentative | cancelled
title text not null
description text null
location text null
starts_at timestamptz not null
ends_at timestamptz not null
all_day boolean not null default false
timezone text not null
rrule text null
recurrence_json jsonb null
profile_id uuid null references profiles(id)
created_by uuid null
updated_by uuid null
sync_direction text not null default 'none' -- none | inbound | outbound | bidirectional
last_synced_at timestamptz null
deleted_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### event_profiles

For events assigned to multiple profiles.

```sql
event_id uuid references events(id)
profile_id uuid references profiles(id)
primary key(event_id, profile_id)
```

### event_instances

Materialized occurrences for fast display.

```sql
id uuid primary key
event_id uuid not null references events(id)
household_id uuid not null references households(id)
starts_at timestamptz not null
ends_at timestamptz not null
all_day boolean not null default false
instance_key text not null
cancelled boolean not null default false
created_at timestamptz not null default now()
unique(event_id, instance_key)
```

### event_reminders

```sql
id uuid primary key
event_id uuid not null references events(id)
offset_minutes int not null -- 0 means at event time
play_sound boolean not null default false
created_at timestamptz not null default now()
```

### task_templates

Reusable task box.

```sql
id uuid primary key
household_id uuid not null references households(id)
title text not null
description text null
emoji text null
task_type text not null -- chore | routine
star_value int not null default 0
default_schedule jsonb null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### task_series

Recurring or one-off task definitions.

```sql
id uuid primary key
household_id uuid not null references households(id)
title text not null
description text null
emoji text null
task_type text not null -- chore | routine
assignment_type text not null default 'profiles' -- profiles | up_for_grabs
star_value int not null default 0
due_date date null
due_time time null
time_of_day text null -- morning | afternoon | evening | any
rrule text null
repeat_until date null
sort_order int not null default 0
created_by uuid null
archived_at timestamptz null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### task_series_profiles

```sql
task_series_id uuid references task_series(id)
profile_id uuid references profiles(id)
primary key(task_series_id, profile_id)
```

### task_instances

```sql
id uuid primary key
household_id uuid not null references households(id)
task_series_id uuid not null references task_series(id)
due_date date not null
due_time time null
assigned_profile_id uuid null references profiles(id)
claimed_by_profile_id uuid null references profiles(id)
status text not null default 'open' -- open | completed | skipped | deleted
completed_at timestamptz null
completed_by uuid null
skipped_at timestamptz null
skip_reason text null
star_awarded int not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### rewards

```sql
id uuid primary key
household_id uuid not null references households(id)
title text not null
description text null
star_cost int not null
active boolean not null default true
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### star_transactions

```sql
id uuid primary key
household_id uuid not null references households(id)
profile_id uuid not null references profiles(id)
amount int not null
reason text not null -- task_completed | manual_add | manual_remove | reward_redeemed | adjustment
related_task_instance_id uuid null references task_instances(id)
related_reward_id uuid null references rewards(id)
created_by uuid null
created_at timestamptz not null default now()
```

### reward_redemptions

```sql
id uuid primary key
household_id uuid not null references households(id)
profile_id uuid not null references profiles(id)
reward_id uuid not null references rewards(id)
star_cost int not null
status text not null default 'redeemed' -- pending | approved | redeemed | cancelled
created_at timestamptz not null default now()
```

### lists

```sql
id uuid primary key
household_id uuid not null references households(id)
title text not null
list_type text not null default 'todo' -- grocery | todo | other
color text null
hidden_on_devices boolean not null default false
sort_order int not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### list_sections

```sql
id uuid primary key
list_id uuid not null references lists(id)
title text not null
sort_order int not null default 0
created_at timestamptz not null default now()
```

### list_items

```sql
id uuid primary key
list_id uuid not null references lists(id)
section_id uuid null references list_sections(id)
name text not null
quantity text null
unit text null
notes text null
status text not null default 'open' -- open | completed | deleted
sort_order int not null default 0
completed_at timestamptz null
completed_by uuid null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### meal_categories

```sql
id uuid primary key
household_id uuid not null references households(id)
name text not null
color text null
visible boolean not null default true
sort_order int not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### recipes

```sql
id uuid primary key
household_id uuid not null references households(id)
title text not null
category_id uuid null references meal_categories(id)
instructions text null
notes text null
source_url text null
source_type text null -- manual | url | photo | pdf | voice | fridge | ai
created_by uuid null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### recipe_ingredients

```sql
id uuid primary key
recipe_id uuid not null references recipes(id)
name text not null
quantity text null
unit text null
sort_order int not null default 0
created_at timestamptz not null default now()
```

### meal_plan_entries

```sql
id uuid primary key
household_id uuid not null references households(id)
date date not null
meal_category_id uuid not null references meal_categories(id)
title text not null
notes text null
rrule text null
repeat_until date null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### meal_plan_recipes

```sql
meal_plan_entry_id uuid references meal_plan_entries(id)
recipe_id uuid references recipes(id)
sort_order int not null default 0
primary key(meal_plan_entry_id, recipe_id)
```

### media_assets

```sql
id uuid primary key
household_id uuid not null references households(id)
uploaded_by uuid null
asset_type text not null -- photo | video | document
storage_path text not null
mime_type text not null
original_filename text null
metadata jsonb not null default '{}'
created_at timestamptz not null default now()
```

### albums

```sql
id uuid primary key
household_id uuid not null references households(id)
title text not null
sort_order int not null default 0
created_at timestamptz not null default now()
```

### album_assets

```sql
album_id uuid references albums(id)
asset_id uuid references media_assets(id)
sort_order int not null default 0
primary key(album_id, asset_id)
```

### import_jobs

```sql
id uuid primary key
household_id uuid not null references households(id)
created_by uuid null
import_type text not null -- events | tasks | list | recipe | meal_plan | mixed
source_type text not null -- text | email | image | pdf | url | voice
status text not null default 'pending' -- pending | processing | needs_review | approved | rejected | failed
source_text text null
source_asset_id uuid null references media_assets(id)
model text null
result_json jsonb null
error text null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### audit_logs

```sql
id uuid primary key
household_id uuid not null references households(id)
actor_user_id uuid null
actor_device_id uuid null
action text not null
entity_type text not null
entity_id uuid null
diff jsonb null
created_at timestamptz not null default now()
```

---

## 11. API design

Use Next.js route handlers or tRPC. Keep route names predictable.

### Household

```txt
GET    /api/household
PATCH  /api/household
POST   /api/household/invite
POST   /api/household/invite/accept
```

### Profiles

```txt
GET    /api/profiles
POST   /api/profiles
PATCH  /api/profiles/:id
DELETE /api/profiles/:id
POST   /api/profiles/merge
```

### Events

```txt
GET    /api/events?start=&end=&profiles=&calendars=
POST   /api/events
GET    /api/events/:id
PATCH  /api/events/:id
DELETE /api/events/:id
POST   /api/events/:id/reminders
POST   /api/events/materialize
```

### Display

```txt
POST   /api/devices/pairing-code
POST   /api/devices/pair
GET    /api/display/bootstrap
GET    /api/display/snapshot?deviceId=
POST   /api/display/heartbeat
POST   /api/display/action
```

The display snapshot endpoint should return all data needed for the visible screen in one request.

Example display snapshot:

```json
{
  "household": { "name": "Santangelo Family", "timezone": "America/New_York" },
  "device": { "name": "Kitchen Calendar", "display_mode": "home" },
  "now": "2026-05-31T10:00:00-04:00",
  "profiles": [],
  "events": [],
  "tasks": [],
  "lists": [],
  "meals": [],
  "weather": {},
  "sync": {
    "last_synced_at": "2026-05-31T09:58:00-04:00",
    "has_errors": false,
    "errors": []
  },
  "settings": {}
}
```

### Tasks

```txt
GET    /api/tasks?date=&view=day|week
POST   /api/tasks/series
PATCH  /api/tasks/series/:id
DELETE /api/tasks/series/:id
POST   /api/tasks/instances/:id/complete
POST   /api/tasks/instances/:id/incomplete
POST   /api/tasks/instances/:id/skip
POST   /api/tasks/instances/:id/unskip
POST   /api/tasks/instances/:id/claim
GET    /api/task-templates
POST   /api/task-templates
```

### Rewards

```txt
GET    /api/rewards
POST   /api/rewards
PATCH  /api/rewards/:id
DELETE /api/rewards/:id
POST   /api/rewards/:id/redeem
POST   /api/stars/give
POST   /api/stars/remove
GET    /api/stars/balances
GET    /api/stars/transactions
```

### Lists

```txt
GET    /api/lists
POST   /api/lists
PATCH  /api/lists/:id
DELETE /api/lists/:id
POST   /api/lists/:id/items
PATCH  /api/lists/:id/items/:itemId
POST   /api/lists/:id/items/:itemId/complete
POST   /api/lists/:id/items/:itemId/undo
POST   /api/lists/:id/clear-completed
POST   /api/lists/:id/organize
POST   /api/lists/:id/send-to-instacart
```

### Meals / Recipes

```txt
GET    /api/meals?start=&end=
POST   /api/meals
PATCH  /api/meals/:id
DELETE /api/meals/:id
GET    /api/meal-categories
POST   /api/meal-categories
PATCH  /api/meal-categories/:id
GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
PATCH  /api/recipes/:id
DELETE /api/recipes/:id
POST   /api/recipes/:id/add-to-grocery-list
```

### Calendar integrations

```txt
GET    /api/integrations/calendar
POST   /api/integrations/google/start
GET    /api/integrations/google/callback
POST   /api/integrations/microsoft/start
GET    /api/integrations/microsoft/callback
POST   /api/integrations/ics
POST   /api/integrations/:id/sync-now
DELETE /api/integrations/:id
```

### AI import

```txt
POST   /api/import/text
POST   /api/import/upload
POST   /api/import/url
GET    /api/import/jobs/:id
POST   /api/import/jobs/:id/approve
POST   /api/import/jobs/:id/reject
PATCH  /api/import/jobs/:id/result
```

---

## 12. Calendar sync implementation notes

### Google Calendar

V1:

- OAuth connection
- Read calendars
- Select calendars to sync
- Pull events for rolling window, e.g. past 30 days and next 365 days
- Store provider event IDs and etags
- Refresh every 5–15 minutes or via background job

V2:

- Incremental sync tokens
- Two-way event creation/update/delete
- Webhook push channels if worth it
- Conflict resolution

Recommended Google OAuth scopes:

- Read-only V1: calendar events read-only scope
- Two-way V2: calendar events scope

### Microsoft Outlook / Microsoft 365

V1:

- Use ICS published URL where possible, or Microsoft Graph OAuth read-only

V2:

- Use Microsoft Graph calendar/event APIs
- Support delta query if implemented
- Add two-way sync only after Google two-way sync is stable

### Apple iCloud, Yahoo, Cozi

V1:

- Support public/subscribed ICS URLs
- Mark these calendars read-only
- Refresh every 15–60 minutes

### Standard ICS

Support:

- VEVENT
- DTSTART / DTEND
- All-day events
- Time zones
- RRULE
- EXDATE
- RECURRENCE-ID later
- UID-based de-duping

Important:

- Treat ICS calendars as read-only unless the provider has a real write API.
- Store raw ICS hash to avoid unnecessary reprocessing.
- Keep provider time zones accurate.

### Event materialization

For fast wall display:

- Store event definitions in `events`.
- Generate `event_instances` for a rolling range.
- Suggested range: past 30 days through next 365 days.
- Regenerate instances when event or recurrence changes.
- Use RRULE library for recurrence expansion.

---

## 13. Realtime update strategy

The display should update quickly when someone changes something from their phone.

Options:

1. Supabase Realtime subscription to household update channel
2. Server-Sent Events from `/api/display/events`
3. WebSocket channel
4. Poll every 30–60 seconds as fallback

Recommended V1:

- Fetch display snapshot on load.
- Poll snapshot every 60 seconds.
- Add realtime later.

Recommended V2:

- Realtime update on changes.
- Poll as fallback.
- Force refresh on version mismatch.

---

## 14. Offline/cache behavior

The wall device should still show something if the internet drops.

V1:

- Store last display snapshot in localStorage or IndexedDB.
- If API fails, render cached snapshot.
- Show “Offline — last updated 9:42 AM”.

V2:

- PWA service worker
- IndexedDB snapshot cache
- Background sync queue for display actions

Never allow stale cached data to look fresh. Always show last updated time.

---

## 15. Kiosk setup context

The display URL should be safe to open full screen:

```txt
https://yourdomain.com/display
```

Kiosk browser should:

- Open on boot
- Hide cursor after idle
- Disable sleep/blanking at OS level
- Auto-refresh on network reconnect
- Recover from browser crash
- Avoid showing browser UI
- Avoid showing admin/account pages

Raspberry Pi kiosk command concept:

```bash
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --start-maximized \
  https://yourdomain.com/display
```

---

## 16. Permissions and security

### Roles

- owner: full access, billing, delete household
- admin: full household management, except billing/delete owner
- adult: manage events/tasks/lists/meals/profiles as allowed
- caregiver: add/manage events and tasks, limited settings
- viewer: read-only
- device: display-scoped token

### Rules

- Every query must be scoped by household.
- Do not expose OAuth tokens to the client.
- Encrypt external calendar tokens and ICS URLs at rest.
- Device tokens must be revocable.
- Display routes must never use the owner’s normal session.
- Parental lock PINs must be hashed, never stored plain.
- Keep audit logs for destructive changes.
- Validate all AI-generated data before insert.
- Uploads should be scanned/limited by type and size.

---

## 17. UI design direction

### Brand direction

Make it warm, calm, family-friendly, and highly readable.

Avoid copying Skylight’s exact UI. Use your own layout, spacing, icons, and visual system.

Suggested visual style:

- Background: warm off-white or dark slate option
- Cards: soft rounded rectangles
- Borders: subtle 1px lines
- Accent: warm amber/orange, sage, teal, or blue-gray
- Fonts: Inter, Geist, or similar
- Icons: Lucide icons
- Profile colors: user-selected palette
- Avoid tiny text
- Avoid heavy gradients
- Avoid clutter

### Display theme tokens

```ts
const theme = {
  radius: {
    card: '18px',
    pill: '999px'
  },
  font: {
    display: 'Geist, Inter, system-ui, sans-serif',
    mono: 'Geist Mono, ui-monospace, monospace'
  },
  spacing: {
    screenPadding: '24px',
    cardGap: '16px'
  }
}
```

### Accessibility

- Large readable text
- High contrast profile colors
- Do not rely only on color; use initials/icons too
- Visible focus states
- Touch targets 48px+
- Support reduced motion
- Support dark mode later

---

## 18. Critical screens/components

### Display components

- `DisplayShell`
- `HomeScreen`
- `DateTimeHeader`
- `WeatherPill`
- `SyncStatus`
- `TodayAgenda`
- `NextEventCard`
- `WeekStrip`
- `WeekCalendarGrid`
- `DayTimeline`
- `MonthGrid`
- `TaskSummaryCard`
- `TaskProfileColumn`
- `MealPlanCard`
- `ListsPreviewCard`
- `ReminderOverlay`
- `OfflineBanner`
- `SleepScreen`
- `Screensaver`

### App/admin components

- `AppShell`
- `HouseholdSwitcher`
- `ProfilePicker`
- `ProfileColorPicker`
- `CalendarSourceManager`
- `EventEditor`
- `RecurringRuleEditor`
- `TaskEditor`
- `RoutineEditor`
- `TaskBox`
- `RewardEditor`
- `ListEditor`
- `MealPlannerGrid`
- `RecipeEditor`
- `DevicePairingModal`
- `ImportReviewScreen`
- `SyncErrorPanel`

---

## 19. MVP scope

### MVP 1 — Local wall dashboard

Goal: Get a beautiful display working without external integrations.

Features:

- Auth
- Household creation
- Profiles with colors
- Manual events
- Home display route
- Day/week display
- Manual tasks/chores
- Manual meals
- Basic grocery/to-do lists
- Device pairing
- Kiosk-safe display token
- Last updated status
- Responsive mobile admin

Acceptance criteria:

- User can create a household.
- User can add profiles.
- User can add events from phone/laptop.
- Wall display updates within 60 seconds.
- User can add tasks and mark them complete from admin app.
- User can add dinner plan for the week.
- Display fits 1920x1080 without scrolling in Home mode.
- Display can recover from refresh/reboot.

### MVP 2 — Calendar sync

Features:

- Google read-only sync
- ICS URL sync
- Calendar source management
- Calendar/profile color mapping
- Sync errors
- Manual sync now
- Materialized event instances

Acceptance criteria:

- User can connect Google Calendar.
- Events appear on wall display.
- User can paste an ICS URL and see events.
- Sync failure is visible and understandable.

### MVP 3 — Chores/routines/rewards

Features:

- Chores vs routines
- Morning/Afternoon/Evening routines
- Recurring tasks
- Up for Grabs
- Skip/unskip
- Stars
- Reward catalog
- Star redemption
- Task Box

### MVP 4 — Meal planner + recipes + grocery

Features:

- Weekly meal planner
- Meal categories
- Recipe box
- Recipe ingredients
- Add ingredients to grocery list
- Multiple grocery lists
- Grocery dedupe/organize

### MVP 5 — AI import

Features:

- Paste text import
- Upload image/PDF import
- Import review screen
- Event/list/recipe extraction
- Email forwarding/import later
- Meal plan generator later

### MVP 6 — Polish/appliance mode

Features:

- Sleep mode
- Weather
- Screensaver/photos
- Reminders/sound
- Parental lock
- Realtime updates
- Better offline cache
- Multi-device settings

---

## 20. Implementation order for first coding sprint

Build in this exact order to avoid overbuilding:

1. Create Next.js project
2. Add auth
3. Create database schema/migrations
4. Create household onboarding
5. Create profiles CRUD
6. Create events CRUD
7. Create `/display` route using fake + real data
8. Create manual tasks CRUD
9. Create manual meals CRUD
10. Create basic lists CRUD
11. Add device pairing
12. Add polling display snapshot
13. Style wall display for 1920x1080
14. Run on Raspberry Pi kiosk
15. Add Google/ICS sync only after display is useful

---

## 21. Event model details

### Manual event fields

- Title required
- Date required
- Start time optional if all-day
- End time optional but recommended
- All-day toggle
- Profile assignment
- Calendar/source
- Location
- Description
- Repeat rule
- Reminder settings

### Recurrence UI presets

- Does not repeat
- Daily
- Weekly
- Weekdays
- Monthly
- Yearly
- Custom

### Delete recurring event behavior

When deleting a recurring event, ask:

- This event only
- This and future events
- All events in series

V1 can simplify by only supporting deleting the full series for local recurring events.

---

## 22. Task model details

### Chore creation fields

- Title
- Emoji
- Description
- Assign to profile(s) or Up for Grabs
- Due date optional
- Due time optional
- Repeats optional
- Star value optional

### Routine creation fields

- Title
- Emoji
- Description
- Assign to profile(s)
- Time of day: Morning/Afternoon/Evening
- Repeats: daily or selected days
- Star value optional
- Sort order within profile/time section

### Task completion behavior

- Completing a task awards stars once.
- Marking incomplete should reverse awarded stars if they were automatically awarded.
- Skipping a task should not award stars.
- Skipped tasks should not count as incomplete.
- Up for Grabs completion requires selecting the profile who completed it.

---

## 23. Meal planner model details

### Weekly meal planner display

Rows:

- Breakfast
- Lunch
- Dinner
- Snack

Columns:

- 7 days

On 15.6-inch display, Home mode should emphasize Dinner and show other meals compactly.

### Recipe-to-grocery behavior

When adding recipe ingredients to grocery:

- Add each ingredient as list item.
- If item exists, either increment quantity when parseable or flag as duplicate.
- Preserve recipe source in item notes.
- Allow user to choose target grocery list.

---

## 24. AI import review UX

AI import must have these states:

1. Upload/paste source
2. Processing
3. Review extracted items
4. User edits/corrects
5. User selects target profiles/calendars/lists
6. User approves
7. App creates records
8. Show success summary

Never skip review for V1.

Confidence handling:

- High confidence: preselect
- Medium confidence: show warning
- Low confidence: require user input
- Missing date/time: do not create event until resolved

---

## 25. Sync conflict handling

For two-way sync later:

- External provider is source of truth for externally-owned events unless event was created locally into that provider.
- Store `external_etag` or provider version.
- If local and remote changes conflict, show conflict state in admin app.
- Avoid deleting external events automatically unless user explicitly deletes.
- Keep tombstones for deleted local events to prevent re-import loops.

---

## 26. Background jobs

Needed jobs:

- `syncGoogleCalendars`
- `syncIcsCalendars`
- `materializeEventInstances`
- `generateTaskInstances`
- `sendReminders`
- `fetchWeather`
- `processImportJob`
- `cleanupExpiredPairingCodes`
- `cleanupOldDisplaySnapshots`

Recommended cadence:

```txt
Google sync: every 5–15 minutes
ICS sync: every 15–60 minutes
Weather: every 30–60 minutes
Task instance generation: daily + on task update
Event materialization: on event update + nightly repair
Pairing cleanup: every 5 minutes
```

---

## 27. Error states to design

- No household yet
- No profiles yet
- No events today
- No tasks today
- No meals planned
- No lists
- Calendar sync disconnected
- Calendar permission expired
- ICS URL unreachable
- Invalid ICS URL
- Wrong timezone warning
- Offline display
- Device token revoked
- Pairing code expired
- AI import failed
- AI import found no usable items
- Weather unavailable

---

## 28. Testing checklist

### Unit tests

- Recurrence expansion
- Task instance generation
- Star awarding/reversing
- Skip/unskip behavior
- Grocery dedupe
- ICS parsing
- Timezone conversion
- Permission checks

### Integration tests

- Create household → profile → event → display snapshot
- Pair device → display loads household data
- Google sync import creates events
- ICS sync import updates existing events
- Complete task awards stars
- Redeem reward removes stars
- Add recipe ingredients to grocery list

### Visual tests

- Display Home mode at 1920x1080
- Display Week mode at 1920x1080
- Display with many events
- Display with long event titles
- Display with 5+ profiles
- Offline state
- Reminder overlay
- Sleep mode

---

## 29. Environment variables

```bash
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
AUTH_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STORAGE_BUCKET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
WEATHER_API_KEY=
ENCRYPTION_KEY=
```

Only add API keys as features are implemented.

---

## 30. Suggested package list

```bash
next
react
react-dom
typescript
tailwindcss
zod
date-fns
luxon
rrule
ical.js
@tanstack/react-query
lucide-react
zustand
sonner
```

If using Drizzle:

```bash
drizzle-orm
drizzle-kit
postgres
```

If using Supabase:

```bash
@supabase/supabase-js
@supabase/ssr
```

If using Google APIs:

```bash
googleapis
```

If using Microsoft Graph:

```bash
@microsoft/microsoft-graph-client
```

---

## 31. Coding conventions

- Use TypeScript everywhere.
- Use Zod schemas for all API inputs.
- Keep server-only code out of client bundles.
- Use server actions only where appropriate; API routes are fine.
- Keep display components lightweight.
- Avoid unnecessary animations on wall display.
- Use explicit loading/error/empty states.
- Always scope queries by household ID.
- Prefer UTC in database, convert to household timezone in display.
- Store original timezone for events.
- Use optimistic UI in admin app, but not on display.

---

## 32. Example display snapshot types

```ts
export type DisplaySnapshot = {
  household: {
    id: string;
    name: string;
    timezone: string;
    weekStartsOn: 'sunday' | 'monday';
  };
  device: {
    id: string;
    name: string;
    displayMode: 'home' | 'calendar' | 'tasks' | 'meals' | 'lists' | 'photos';
    orientation: 'landscape' | 'portrait';
  };
  profiles: ProfileSummary[];
  events: DisplayEvent[];
  tasks: DisplayTask[];
  lists: DisplayListSummary[];
  meals: DisplayMeal[];
  weather?: DisplayWeather;
  sync: {
    lastSyncedAt: string | null;
    hasErrors: boolean;
    errors: string[];
  };
  generatedAt: string;
};

export type ProfileSummary = {
  id: string;
  name: string;
  color: string;
  initials: string;
  emoji?: string;
};

export type DisplayEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  location?: string;
  profileIds: string[];
  color?: string;
  source: 'local' | 'google' | 'microsoft' | 'ics' | 'email' | 'ai';
};

export type DisplayTask = {
  id: string;
  title: string;
  emoji?: string;
  dueDate: string;
  dueTime?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  assignedProfileId?: string;
  claimedByProfileId?: string;
  assignmentType: 'profiles' | 'up_for_grabs';
  status: 'open' | 'completed' | 'skipped';
  starValue: number;
  isLate: boolean;
};
```

---

## 33. First UI copy

Use simple labels:

- Today
- This Week
- Chores
- Routines
- Up for Grabs
- Dinner
- Grocery
- To-Dos
- Add Event
- Add Chore
- Add Meal
- Sync Now
- Last updated
- Offline
- Needs attention
- Pair Device

Avoid using Skylight-specific product names such as Sidekick, Calendar Plus, or Skylight.

---

## 34. Builder prompt

Use this when starting in Cursor/Codex:

```txt
You are building HomeBoard Calendar, a DIY family calendar wall-display web app.

Read context.md fully before coding. The first target is a V1 MVP: a Next.js TypeScript web app with auth, household onboarding, profiles, manual events, manual tasks, manual meals, basic lists, a display/kiosk route, and device pairing. Do not build AI, Google sync, or advanced rewards until the local display MVP works.

Prioritize clean architecture, household-scoped data access, large 1920x1080 display UI, and responsive mobile admin pages. The Raspberry Pi is only a kiosk client; the backend runs in the hosted web app.

Do not copy Skylight branding or UI. Build an original warm, readable, family-friendly interface.
```

---

## 35. Final reminder

The best first milestone is not calendar sync. The best first milestone is:

> A beautiful 15.6-inch wall display that shows manually entered events, chores, dinner, and lists, and updates from your phone.

Once that feels useful in the house, add Google Calendar and ICS sync.
