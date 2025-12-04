# Kitchen Sync - Family Meal Planning Made Simple

## 🚀 Launch Preparation - Action Required

**Status:** ~90% Ready for Launch | All code complete, awaiting assets & testing

### Critical (Before Launch)

- [x] **Create Visual Assets** (See: `PWA_ASSETS_GUIDE.md`)
  - [x] OpenGraph social sharing image (`/public/og-image.png` - 1200x630px)
  - [x] PWA app icons (192x192 and 512x512) - ✅ Generated and configured
  - [x] Apple touch icon (180x180) - ✅ Generated and configured
  - [x] Favicons (ico, svg, 96x96) - ✅ Already in place
  - [x] Apple splash screens
  - **Tool:** Use [PWA Builder](https://www.pwabuilder.com/imageGenerator) to generate all sizes

- [ ] **Complete Testing** (See: `PRE_LAUNCH_TESTING_CHECKLIST.md`)
  - [ ] Test authentication flows (Google & Email)
  - [ ] Test recipe creation and AI import
  - [ ] Test shopping lists and kitchen chalkboard
  - [ ] Test household collaboration end-to-end
  - [ ] Test PWA installation (iOS Safari & Android Chrome)
  - [ ] Verify contact form sends emails
  - [ ] Test on multiple browsers (Chrome, Safari, Firefox, Edge)
  - [ ] Check mobile responsiveness on real devices

- [ ] **Verify Environment** (See: `ENV_SETUP.md`)
  - [ ] Confirm all Vercel environment variables are set
  - [ ] Verify Convex environment variables are configured
  - [ ] Test that OpenAI API key has credits
  - [ ] Confirm email SMTP settings work in production

### Completed ✅

- ✅ Privacy Policy and Terms of Service pages
- ✅ Legal links in footer
- ✅ SEO setup (robots.txt & sitemap.xml)
- ✅ OpenGraph metadata for social sharing
- ✅ Beta messaging on homepage
- ✅ Comprehensive testing checklist created
- ✅ Environment variables documented
- ✅ PWA assets guide created

### Quick Reference Documents

- `LAUNCH_SUMMARY.md` - Complete overview of what was done and next steps
- `PWA_ASSETS_GUIDE.md` - Image requirements and design guidelines
- `ENV_SETUP.md` - Environment variables setup and troubleshooting
- `PRE_LAUNCH_TESTING_CHECKLIST.md` - Comprehensive testing checklist (200+ checks)

---

### Next Immediate Steps

- [x] Shopping list cannot be created from household recipes
- [x] Bugs bugs bugs
- [x] User feedback investigations and create todos
- [x] Personal feedback (In notes app)
- [ ] Understand the importance of draft and published state in the UI (seems unimportant at this stage)

- [ ] Make all necessary preparations and billing setup for an MVP launch
- [ ] Tech debt
- [ ] Set up multi tenant in vercel/next and serve the app a subdomain app.kitchen-sync-app.com and the site through the main domain
- [ ] Refactor the AI sections to use the vercel AI SDK

## Usage notes and feedback

- [x] Fix horizontal scrolling on recipe page
- [x] Scroll overflow on the recipes page on iPhone
- [x] Able to scroll left and right on recipe page
- [x] Edit mode controls should be sticky
- [x] When editing recipes, add controls should be sticky
- [x] Chiffonade is not a preparation option
- [x] When there is no image for a recipe a button to upload one would be helpful rather than having to go into edit mode
- [x] Need to add a how to use the app page
- [x] The app needs a contact form for support and feature requests
- [ ] Unable to add zero amount ingredients like olive oil, salt and pepper
- [ ] API seems to set cook time to zero quite a lot (incomplete schema may be to blame)
- [ ] There is a notice on household recipes not made by me. Seems like it’s not needed. There should be attribution to the original owner, and an option to copy the recipe so you can make your own edits and updates (however copying should be a separate feature from the attribution update as it requires a good deal of thought around publishing rights, what recipes are you allowed to copy etc)

## 🐛 Bug Tracking

- [ ] Overflow on the sign in page on ios

## Tech debt

- [x] Consolidate how ingredients, method and nutrition data is rendered
- [ ] Consolidate how cook time/serves/prep looks
- [ ] Consolidate form schemas
- [ ] Consolidate the two AI recipe parse functions
- [ ] Create limits and restrictions rules like image uploads in one place and share across the app. Single source of truth
- [ ] Consolidate all image upload UI and functionality
- [ ] Store app name in a global const and replace all instances with it
- [ ] Consolidate recipe card designs and reusability
- [ ] Check and centralise all site validations, text limits, image limits etc. Store these on the server and share across the site
- [ ] Shopping list is very complex. A refactor is needed keeping all state at the root and reducing complexity where possible. Components should be abstracted where possible and optimistic updates should also be added. This needs to be done manually and not with AI.

## Minor updates

- [ ] When a recipe is saved from the create recipe form, give the users a link in the toast to the new recipe page
- [ ] Recipe description needs clamping or moving on mobile
- [ ] Handle my-recipe pagination (limit to 20 per page)
- [ ] Add client side compression to before uploading images using browser-image-compression
- [ ] Add a utility function to output image sizes string
- [ ] On recipe pages add a "Mise en place" section that shows all the preparations steps based on what ingredients have preparation set
- [ ] Update the UI for selecting units and prep to show categories and share across all forms. Use a categorised table like display
- [ ] Set recipe to draft or publish (users should be notified what this means. Published does not mean public, users in your house can see your recipes etc. This should be globally saved information so its easy to update)
- [ ] Sign in / Sign up pages should respect dark mode as well as looking a bit more native to the site
- [ ] Update app icons.
- [ ] Add OpenGraph meta information to all pages.
- [ ] Separate 404 for home (site) and app. They need different redirects and copy
- [x] Update sticky bottom calc accounting for navbar; currently: `bottom-[calc(64px+env(safe-area-inset-bottom))]`
- [ ] On saving a recipe from teh create recipe form the users should be guided to it and the form drawer should close
- [ ] Pages that have been made server side just for meta data and then export a client component for all logic can now include that logic directly and shift any metadata or server information to the layout file of the page (see invitations page).
- [ ] Should be able to trigger the add recipe navigation from anywhere. Time to add it to its own page or wrap the app in context to provide a method to open it.
- [ ] The theme options in the menu are a drop down that opens downwards. This does not look great the options to expand open or the menu should be above not below

## Major updates

- [ ] Using sharp JS. Set up an endpoint in convex where I can transform images and render them at more appropriate sizes using a custom image loader in next image.
- [ ] Custom convex endpoint to handle image uploads so I can more readily enforce image upload limits.
- [ ] Add macros to recipe schema, add a generate macros button that AI does for you. Go back into teh schema scraper and get nutrition data if available
- [ ] use a KV store or other caching strategy to cache AI parsed recipes to prevent processing more than once.
- [ ] AI image upscaler for poor quality images (PRO feature)
- [ ] Stream the AI response for better perceived performance. This may involve two separate calls, one, a human readable response of recipe text, then a final call to coalesce it into structured JSON
- [ ] Share to the app. Investigate whether it is possible that, if a website is shared to this app, it can be immediately added to the import URL field on the import URL field, with a popup asking for confirmation to import this recipe
- [ ] Add notes to recipes. This should be a new table (with a by_recipe_id index) so notes can be used for wider use cases down the line. Notes are not comments, they are private to the user and that should be made clear in the UI
- [ ] Invites sent to users should open their app, not the browser. This may be possible with protocol handlers but it is not well supported at time of writing. Else a PWA app wrapper will need to be used.

---

## App name ideas

- Hearth OR Home and Hearth

## 📋 Development Roadmap

### ✅ COMPLETED (Foundation)

- [x] **Project Setup**: Next.js 15 with App Router, Tailwind CSS, shadcn/ui
- [x] **Authentication**: Clerk integration with Google + Email login
- [x] **Database Schema**: Convex setup with users, recipes, and ingredients tables
- [x] **UI Components**: Complete component library with forms, buttons, cards, etc.
- [x] **Theme System**: Dark/light mode toggle with theme provider
- [x] **Landing Page**: Marketing site with feature showcase
- [x] **Auth Pages**: Sign-in and sign-up pages with Clerk integration
- [x] **App Layout**: Protected dashboard layout with navigation
- [x] **Recipe Form**: Multi-step recipe creation form with ingredients and method
- [x] **Ingredient System**: Ingredient database with categories and preparation options
- [x] **Units System**: Comprehensive units for volume, weight, and count measurements
- [x] **Recipe Schema**: Full recipe validation with categories, prep/cook times, servings

### 🚧 MVP (0-4 Months) - IN PROGRESS

#### Recipe Management

- [x] **Recipe CRUD Operations**: Connect existing recipe form to Convex mutations (create, read, update, delete)
- [x] **Recipe List View**: Display user's recipes in dashboard with search and category filtering
- [x] **Recipe Detail View**: Full recipe display with ingredients, method, and photos
- [x] **Recipe Image Upload**: Integrate Convex file storage for recipe photos
- [x] **Recipe Categories**: Enable filtering by existing categories (main, dessert, snack, etc.)
- [ ] Scale ingredients (serves modifier)
- [ ] Metric and imperial conversion + user default
- [ ] **Recipe Tags**: Auto-detect dietary tags like plant-based, coeliac friendly, gluten free from ingredients
- [ ] **Ingredient Categories**: Add categorization to ingredients (meat, poultry, vegetable, spice etc) (or extract from an existing external ingredient DB while still allowing custom ingredients)
- [x] **AI Recipe Import**: Build URL scraping or text parsing for importing recipes from websites

#### Shopping List System

- [x] **Shopping List Generation**: Create shopping lists from selected recipes with quantities
- [ ] **Ingredient Deduplication**: Smart merging of similar ingredients
- [x] **Editable Shopping Lists**: Allow manual editing, adding, and removing items from generated lists
- [x] **Shopping List Persistence**: Save and load shopping lists in Convex database/local storage
- [x] **Shopping List Sharing**: Share lists with household members for collaborative shopping
- [ ] Normalise units to make it easier to combine ingredients
- [ ] Add additional items

### Kitchen Chalkboard

A place to ad hoc add things you need for your kitchen, this can be optionally merged into shopping lists when they are created. You should also be able to have shared boards with households so everyone can add to it. Guiding principles of this feature is that it should be fast and very efficient, make use of optimistic updates and get out of the users way so they can add things quickly.

- [x] Create basic UI
- [x] Create add remove edit features
- [x] Add to database + schema setup
- [x] Household sharing options (these should be a separate board generated automatically / Or shown automatically if already made)
- [x] When the board is added to the shopping list all items should be scheduled to be removed from the DB after prompting (can use a toast undo action for this with a longer timer on the scheduling to give us chance to undo the action)

#### Dashboard

- [x] How to use the app
- [ ] Recent recipes
- [ ] Shopping list info
      ... This section is quite organic and will grow with most new features

#### Household Collaboration

- [x] **Household Schema**: Add houses table to Convex schema with member management
- [x] **Household Creation**: Allow users to create/join households with unique codes
- [x] **Recipe Sharing**: Share recipes within household (all members can access)
- [x] **Collaborative Shopping Lists**: Multiple users can edit same shopping list in real-time
- [x] **Household Invites**: Email-based invitation system using Clerk user management
- [ ] Users notifications for relevant actions (requires setup in PWA section first)

#### AI Features

- [ ] **OpenAI Integration**: Set up GPT-4o-mini API integration for recipe parsing and suggestions
- [ ] **Basic Meal Suggestions**: AI-powered recipe recommendations based on user preferences and available ingredients
- [ ] **Smart Ingredient Merging**: AI to intelligently combine similar ingredients (e.g., "onion" + "yellow onion" = "onion")

#### PWA & Offline Support

- [x] **Next PWA Plugin**: Install and configure PWA functionality for mobile app-like experience
- [ ] **Offline Caching**: Cache recipes and shopping lists in IndexedDB for offline access
- [ ] **Offline-First Design**: Ensure core features work without internet connection
- [x] **Manual Recipe Entry**: Fallback for when AI scraping fails - allow copy/paste text parsing
- [x] Add context sensitive installation instructions to the home page
- [ ] Notifications system

### 📅 Post-Launch Phase 1 (4-8 Months)

#### Recipe reader mode

This is to help users use recipes to cook meals

- [ ] UI
- [ ] Keep screen on

#### Recipe Enhancement

- [ ] **Recipe Editing**: Edit existing recipes
- [ ] **Recipe Cloning**: Duplicate recipes with modifications
- [ ] **Recipe Versioning**: Track recipe changes over time
- [ ] Recipe notes

#### Meal Planning

- [ ] **Meal Plan Calendar**: Weekly meal planning interface
- [ ] **Calendar Sync**: Integration with Google/Apple calendars
- [ ] **Meal Plan Templates**: Pre-made meal plans for different lifestyles

#### Personalization

- [ ] **Dietary Preferences**: User dietary restrictions and preferences
- [ ] **Allergy Management**: Track and warn about allergens
- [ ] **Nutritional Information**: Basic macro/micro nutrient tracking

#### Enhanced Collaboration

- [ ] **Voting System**: Household members vote on meal choices
- [ ] **Task Assignment**: Assign shopping tasks to specific members
- [ ] **Kitchen Chalkboard**: Persistent household list for non-weekly items

#### Gamification & Retention

- [ ] **Streak Tracking**: Track cooking/meal planning streaks
- [ ] **Achievement System**: Badges for cooking milestones
- [ ] **Weekly Challenges**: Fun cooking challenges for households

### 🚀 Post-Launch Phase 2 (9-15 Months)

#### Social Features

- [ ] **Recipe Feed**: Social layer with chef following
- [ ] **Recipe Discovery**: Browse and discover new recipes
- [ ] **Recipe Ratings**: Community rating system

#### Content & SEO

- [ ] **Blog System**: SEO-friendly recipe pages
- [ ] **Recipe SEO**: Optimized recipe pages for search engines
- [ ] **Content Management**: Admin interface for content creation

#### Advanced AI

- [ ] **"Cook with What You Have"**: AI meal planning from available ingredients
- [ ] **Advanced Meal Planning**: AI-powered weekly meal optimization
- [ ] **Recipe Recommendations**: Personalized recipe suggestions
- [ ] **Photograph recipe books**: The app should be able to take the text from recipe books and save them to your recipes

#### Integrations

- [ ] **Grocery Delivery**: Integration with Instacart, Tesco, etc.
- [ ] **Calendar Apps**: Enhanced calendar synchronization
- [ ] **Smart Home**: Integration with smart kitchen devices

#### Advanced Features

- [ ] **Weekly Challenges**: Community challenges for engagement
- [ ] **AI-First UX**: Redesign with AI as primary interaction method
- [ ] **Native Mobile Apps**: Wrap PWA with Capacitor/Expo

---

## 🛠 Technical Implementation Notes

### Current Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Convex (DB + realtime sync)
- **Auth**: Clerk (Google + Email login)
- **File Storage**: Convex file storage
- **AI**: OpenAI GPT-4o-mini (planned)
- **Hosting**: Vercel (frontend), Convex (backend)

### Database Schema Status

- ✅ `users` table with Clerk integration
- ✅ `recipes` table with full schema
- ✅ `ingredients` table with categorization
- ❌ `houses` table (household collaboration)
- ❌ `shoppingLists` table
- ❌ `kitchenChalkboards` table

---

## 📊 Key Metrics to Track

- Weekly active households
- % of users creating shopping lists weekly
- Recipe saves per user
- Retention after 4 weeks
- Kitchen Chalkboard usage

---

## 🎯 Business Goals

- **Positioning**: AI-powered collaborative meal planner for households
- **Target**: Young couples, families, fitness-focused individuals
- **Value Prop**: Save time, reduce stress, discover meals together
- **Differentiator**: Household-first focus with Kitchen Chalkboard feature
