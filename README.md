# Kitchen Sync - Family Meal Planning Made Simple

### Next Immediate Steps

- [x] **Connect Recipe Form**: Submit recipe data to Convex
- [x] **Build Recipe List**: Display user recipes in dashboard (with CRUD features)
  - [x] View recipe page
  - [x] Action dropdown, edit, delete etc
  - [x] Image upload, storage and edit (from form and page)
  - [x] Method image upload and edit
- [x] Recipe main page
  - [x] Display ingredients and methods
  - [x] Edit ingredients and methods
- [ ] Generate a recipe with recipe schema (parsed with AI)
  - [ ] Save recipe
  - [ ] Edit before saving
  - [ ] Handle main image
  - [ ] Data parser should be aware nutrition values should be returns as integers that represent gram values. So some conversion may be needed.
- [ ] Generate a recipe with scraping
- [ ] Generate a recipe with copy and pasting
- [ ] **Ingredient Categories**: Add categorization to ingredients (meat, poultry, vegetable, spice etc) (or extract from an existing external ingredient DB while still allowing custom ingredients)
- [ ] **Recipe Tags**: Auto-detect dietary tags like plant-based, coeliac friendly, gluten free from ingredients

## 🐛 Bug Tracking

<!-- Add bugs here as you encounter them -->

## Minor updates

- [ ] When a recipe is saved from the create recipe form, give the users a link in the toast to the new recipe page
- [ ] Handle my-recipe pagination (limit to 20 per page)
- [ ] Add client side compression to before uploading images using browser-image-compression
- [ ] Add a utility function to output image sizes string
- [ ] On recipe pages add a "Mise en place" section that shows all the preparations steps based on what ingredients have preparation set

## Major updates

- [ ] Using sharp JS. Set up an endpoint in convex where I can transform images and render them at more appropriate sizes using a custom image loader in next image.
- [ ] Custom convex endpoint to handle image uploads so I can more readily enforce image upload limits.
- [ ] Add macros to recipe schema, add a generate macros button that AI does for you. Go back into teh schema scraper and get nutrition data if available
- [ ] use a KV store or other caching strategy to cache AI parsed recipes to prevent processing more than once.

---

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

- [ ] **Recipe CRUD Operations**: Connect existing recipe form to Convex mutations (create, read, update, delete)
- [ ] **Recipe List View**: Display user's recipes in dashboard with search and category filtering
- [ ] **Recipe Detail View**: Full recipe display with ingredients, method, and photos
- [ ] **Recipe Image Upload**: Integrate Convex file storage for recipe photos
- [ ] **Recipe Categories**: Enable filtering by existing categories (main, dessert, snack, etc.)
- [ ] **Recipe Tags**: Auto-detect dietary tags like plant-based, coeliac friendly, gluten free from ingredients
- [ ] **Ingredient Categories**: Add categorization to ingredients (meat, poultry, vegetable, spice etc) (or extract from an existing external ingredient DB while still allowing custom ingredients)
- [ ] **AI Recipe Import**: Build URL scraping or text parsing for importing recipes from websites

#### Shopping List System

- [ ] **Shopping List Generation**: Create shopping lists from selected recipes with quantities
- [ ] **Ingredient Deduplication**: Smart merging of similar ingredients (e.g., "tomatoes" + "cherry tomatoes" = "tomatoes")
- [ ] **Editable Shopping Lists**: Allow manual editing, adding, and removing items from generated lists
- [ ] **Shopping List Persistence**: Save and load shopping lists in Convex database
- [ ] **Shopping List Sharing**: Share lists with household members for collaborative shopping

#### Household Collaboration

- [ ] **Household Schema**: Add houses table to Convex schema with member management
- [ ] **Household Creation**: Allow users to create/join households with unique codes
- [ ] **Recipe Sharing**: Share recipes within household (all members can access)
- [ ] **Collaborative Shopping Lists**: Multiple users can edit same shopping list in real-time
- [ ] **Household Invites**: Email-based invitation system using Clerk user management

#### AI Features

- [ ] **OpenAI Integration**: Set up GPT-4o-mini API integration for recipe parsing and suggestions
- [ ] **Basic Meal Suggestions**: AI-powered recipe recommendations based on user preferences and available ingredients
- [ ] **Smart Ingredient Merging**: AI to intelligently combine similar ingredients (e.g., "onion" + "yellow onion" = "onion")

#### PWA & Offline Support

- [ ] **Next PWA Plugin**: Install and configure PWA functionality for mobile app-like experience
- [ ] **Offline Caching**: Cache recipes and shopping lists in IndexedDB for offline access
- [ ] **Offline-First Design**: Ensure core features work without internet connection
- [ ] **Manual Recipe Entry**: Fallback for when AI scraping fails - allow copy/paste text parsing

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
