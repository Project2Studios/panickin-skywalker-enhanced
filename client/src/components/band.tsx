import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { BandMember } from "@shared/schema";

export default function Band() {
  const { data: bandMembers = [], isLoading } = useQuery<BandMember[]>({
    queryKey: ["/api/band-members"],
  });

  if (isLoading) {
    return (
      <section id="band" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">
              THE BAND
            </h2>
            <p className="text-muted-foreground text-lg">
              Meet the anxious superheroes behind the music
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="bg-muted rounded-full w-48 h-48 mx-auto mb-6" />
                <div className="bg-muted h-6 rounded mb-2" />
                <div className="bg-muted h-4 rounded mb-2 w-24 mx-auto" />
                <div className="bg-muted h-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="band" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">
            THE BAND
          </h2>
          <p className="text-muted-foreground text-lg">
            Meet the anxious superheroes behind the music
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {bandMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y:# thoughts

Looking at the design reference, I need to create a professional pop-punk band landing page for "Panickin' Skywalker" with a black/pink aesthetic. The design is a single-page React application with:

1. Fixed header with navigation and social links
2. Hero section with band photo and latest release spotlight
3. Music releases showcase with streaming platform links
4. Band members section with character profiles
5. Tour dates section
6. Contact and fan engagement section
7. Footer with comprehensive links

The color scheme uses black (#000000), pink (#FF1581), and white (#FFFFFF) with bold typography and high contrast design. I need to implement this using React, Tailwind CSS, and the existing shadcn components.

Key features to implement:
- Responsive design with mobile menu
- Email signup functionality 
- Smooth scrolling navigation
- Header blur effect on scroll
- Hover animations for album covers and band member cards
- Streaming platform integration buttons
- Tour date listings with ticket links

I'll need to create the home page component, update the routing, and customize the CSS variables to match the punk aesthetic.

# useful_guidelines_from_blueprints

From the development guidelines:
- Put as much of the app in the frontend as possible
- Use wouter for routing and add pages to client/src/pages directory
- Use shadcn's useForm hook and Form component for forms with zodResolver
- Use @tanstack/react-query for data fetching
- Add data-testid attributes to interactive elements
- Use CSS variables in HSL format for custom colors
- Keep mobile-first responsive design approach

# directory_structure

```json
[
    {"path": "client/src/index.css", "status": "overwritten"},
    {"path": "tailwind.config.ts", "status": "overwritten"},
    {"path": "client/src/pages/home.tsx", "status": "new"},
    {"path": "client/src/App.tsx", "status": "overwritten"},
    {"path": "shared/schema.ts", "status": "overwritten"},
    {"path": "server/storage.ts", "status": "overwritten"},
    {"path": "server/routes.ts", "status": "overwritten"}
]
