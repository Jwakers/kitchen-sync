# Kitchen Sync - Family Meal Planning Made Simple

### Next Immediate Steps

- [x] Households
- [x] Make households a link sharing thing, not an email thing (that can come later). Anyone that gets the link can join (link can be used once). Email not required. Add a native share button so users can choose how they want to share, include open graph information so this makes sense to the user too.
- [x] UI refinements from initial build
- [x] Clicking the share button does not consider the recipe being already shared.
- [ ] Add an error boundary
- [ ] Add loading page for all household pages
- [ ] The link sharing was successful however I was shown an error state on the receiving end
- [ ] Clean up stale invitations from the DB (cron)
- [ ] Link styling, open graph does not look good
- [ ] The user needs to copy the link into the browser, or when they click it, it will open the browser, instead, it should open their app.

## 🐛 Bug Tracking

<!-- Add bugs here as you encounter them -->

- [ ] When the recipe form updates it will always upload images even if they already exists. The method should check for images first before uploading. In the recipe form, method image edits should not be possible and be handled in the recipe page.
- [ ] On desktop when opening the drawer on dashboard, the nav shoots up the page. Need a new utility class that handles 100% full dynamic height - navigation height
- [ ] Form inputs are awkward for required number values like prep time with leading zeros (note cook time is no longer required)

## Tech debt

- [x] Consolidate how ingredients, method and nutrition data is rendered
- [ ] Consolidate how cook time/serves/prep looks
- [ ] Consolidate form schemas
- [ ] Consolidate the two AI recipe parse functions
- [ ] Create limits and restrictions rules like image uploads in one place and share across the app. Single source of truth
- [ ] Consolidate all image upload UI and functionality
- [ ] Store app name in a global const and replace all instances with it
- [ ] Consolidate recipe card designs and reusability

## Minor updates

- [ ] Background and colours on android look really ugly for some reason
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

## Major updates

- [ ] Using sharp JS. Set up an endpoint in convex where I can transform images and render them at more appropriate sizes using a custom image loader in next image.
- [ ] Custom convex endpoint to handle image uploads so I can more readily enforce image upload limits.
- [ ] Add macros to recipe schema, add a generate macros button that AI does for you. Go back into teh schema scraper and get nutrition data if available
- [ ] use a KV store or other caching strategy to cache AI parsed recipes to prevent processing more than once.
- [ ] AI image upscaler for poor quality images (PRO feature)
- [ ] Stream the AI response for better perceived performance. This may involve two separate calls, one, a human readable response of recipe text, then a final call to coalesce it into structured JSON
- [ ] Share to the app. Investigate whether it is possible that, if a website is shared to this app, it can be immediately added to the import URL field on the import URL field, with a popup asking for confirmation to import this recipe
- [ ] Add notes to recipes. This should be a new table (with a by_recipe_id index) so notes can be used for wider use cases down the line. Notes are not comments, they are private to the user and that should be made clear in the UI

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

- [ ] Create basic UI
- [ ] Create add remove edit features
- [ ] Add to database + schema setup
- [ ] Household sharing options (these should be a separate board generated automatically / Or shown automatically if already made)
- [ ] When the board is added to the shopping list all items should be scheduled to be removed from the DB after prompting (can use a toast undo action for this with a longer timer on the scheduling to give us chance to undo the action)

#### Dashboard

- [ ] How to use the app
- [ ] Recent recipes
- [ ] Shopping list info
      ... This section is quite organic and will grow with most new features

#### Household Collaboration

- [ ] **Household Schema**: Add houses table to Convex schema with member management
- [ ] **Household Creation**: Allow users to create/join households with unique codes
- [ ] **Recipe Sharing**: Share recipes within household (all members can access)
- [ ] **Collaborative Shopping Lists**: Multiple users can edit same shopping list in real-time
- [ ] **Household Invites**: Email-based invitation system using Clerk user management
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

#### Recipe Enhancement

- [ ] **Recipe Editing**: Edit existing recipes
- [ ] **Recipe Cloning**: Duplicate recipes with modifications
- [ ] **Recipe Versioning**: Track recipe changes over time

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
